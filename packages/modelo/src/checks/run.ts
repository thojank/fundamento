// Shared runner for the conformance checks (FR-15).
//
// Usage: node packages/modelo/dist/checks/run.js <check> [--json] [--fixture <path>] | --help
//
// The runner imports `./<check>/index.js` by naming convention and calls its exported
// `check` function, so adding a check never touches a shared registry.
// Exit codes: 0 = pass, 1 = check failed, 2 = usage or internal error.

import { constants } from "node:fs";
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import type { Check, CheckName, CheckOptions, CheckResult } from "../contracts/checks.js";
import { CHECK_NAMES } from "../contracts/checks.js";
import type { ValidationIssue } from "../contracts/issues.js";

// The runner's contract types live in `src/contracts/` (FUND-1.2); re-exported for existing importers.
export type { Check, CheckName, CheckOptions, CheckResult } from "../contracts/checks.js";
export { CHECK_NAMES } from "../contracts/checks.js";
export type { ValidationIssue } from "../contracts/issues.js";

export const EXIT_PASS = 0;
export const EXIT_FAIL = 1;
export const EXIT_USAGE = 2;

export interface RunCheckEnv {
  /**
   * Directory that `--fixture` is resolved against. Like `fm`, this is `INIT_CWD` (the
   * directory pnpm was invoked from) when set, otherwise the process cwd.
   */
  cwd: string;
  repoRoot: string;
  /** Directory containing one `<check>/index.js` module per check. */
  checksDir: URL;
  stdout: (text: string) => void;
  stderr: (text: string) => void;
}

const USAGE = `Usage: run.js <check> [--json] [--fixture <path>]\nChecks: ${CHECK_NAMES.join(", ")}\nRun with --help for details.\n`;

const CHECK_SUMMARIES: Readonly<Record<CheckName, string>> = {
  "vortaro-lint":
    "No literal values in Projekcio CSS; all identifiers in the Fundamento namespace.",
  parity: "Compare two normalized inventories (props, values, states).",
  regularo: "Every Regulo has a kialo; every Jugxo references an existing target.",
  alirebleco:
    "Contrast of every KontrastParo in every combination (WCAG 2.x binding, APCA advisory).",
  "clean-room": "No benchmark files or references; identifiers match the Fundamento allowlist.",
};

export const HELP = [
  "Usage: pnpm check:<check> [--json] [--fixture <path>]",
  "       node packages/modelo/dist/checks/run.js <check> [--json] [--fixture <path>]",
  "",
  "Runs one conformance check (FR-15).",
  "",
  "Checks:",
  ...CHECK_NAMES.map((name) => `  ${name.padEnd(14)}${CHECK_SUMMARIES[name]}`),
  "",
  "Options:",
  "  --json            Print only the CheckResult JSON on stdout (pipe with `pnpm -s`).",
  "  --fixture <path>  Run against a fixture instead of the repo. Relative paths resolve",
  "                    against the directory pnpm was invoked from (INIT_CWD), else the cwd.",
  "  -h, --help        Show this help.",
  "",
  "Exit codes: 0 = pass, 1 = check failed, 2 = usage or internal error.",
  "",
].join("\n");

type ParsedArgs =
  | { ok: true; help: true }
  | { ok: true; help: false; check: CheckName; json: boolean; fixture: string | undefined }
  | { ok: false; message: string };

function isCheckName(value: string): value is CheckName {
  return (CHECK_NAMES as readonly string[]).includes(value);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function errorCode(error: unknown): unknown {
  return typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
}

export function parseCheckArgs(argv: readonly string[]): ParsedArgs {
  let parsed: ReturnType<typeof parseArgsStrict>;
  try {
    parsed = parseArgsStrict(argv);
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
  if (parsed.values.help) {
    return { ok: true, help: true };
  }
  const [name, ...rest] = parsed.positionals;
  if (name === undefined) {
    return { ok: false, message: "Missing check name." };
  }
  if (rest.length > 0) {
    return { ok: false, message: `Unexpected arguments: ${rest.join(" ")}` };
  }
  if (!isCheckName(name)) {
    return {
      ok: false,
      message: `Unknown check '${name}'. Available checks: ${CHECK_NAMES.join(", ")}`,
    };
  }
  return {
    ok: true,
    help: false,
    check: name,
    json: parsed.values.json,
    fixture: parsed.values.fixture,
  };
}

function parseArgsStrict(argv: readonly string[]) {
  return parseArgs({
    args: [...argv],
    allowPositionals: true,
    strict: true,
    options: {
      json: { type: "boolean", default: false },
      fixture: { type: "string" },
      help: { type: "boolean", short: "h", default: false },
    },
  });
}

function isCheckResult(value: unknown): value is CheckResult {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return (
    "ok" in value &&
    typeof value.ok === "boolean" &&
    "summary" in value &&
    typeof value.summary === "string" &&
    "errors" in value &&
    Array.isArray(value.errors) &&
    "warnings" in value &&
    Array.isArray(value.warnings) &&
    "stats" in value &&
    typeof value.stats === "object" &&
    value.stats !== null
  );
}

function formatIssue(issue: ValidationIssue): string {
  return [
    `  ${issue.severity} ${issue.rule} ${issue.path}`,
    `    ${issue.message}`,
    `    suggestion: ${issue.suggestion}`,
  ].join("\n");
}

export function formatHumanSummary(result: CheckResult): string {
  const lines = [`${result.ok ? "PASS" : "FAIL"} ${result.check}: ${result.summary}`];
  for (const issue of [...result.errors, ...result.warnings]) {
    lines.push(formatIssue(issue));
  }
  const stats = Object.keys(result.stats)
    .sort()
    .map((key) => `${key}=${result.stats[key]}`);
  if (stats.length > 0) {
    lines.push(`  stats: ${stats.join(" ")}`);
  }
  lines.push(`  ${result.errors.length} error(s), ${result.warnings.length} warning(s)`);
  return `${lines.join("\n")}\n`;
}

async function loadCheck(
  name: CheckName,
  checksDir: URL,
): Promise<{ ok: true; check: Check } | { ok: false; message: string }> {
  const moduleUrl = new URL(`./${name}/index.js`, checksDir);
  let mod: unknown;
  try {
    mod = await import(moduleUrl.href);
  } catch (error) {
    if (errorCode(error) === "ERR_MODULE_NOT_FOUND") {
      return {
        ok: false,
        message: `Check '${name}' is not implemented yet (${errorMessage(error)})`,
      };
    }
    return { ok: false, message: `Check '${name}' failed to load: ${errorMessage(error)}` };
  }
  if (
    typeof mod !== "object" ||
    mod === null ||
    !("check" in mod) ||
    typeof mod.check !== "function"
  ) {
    return {
      ok: false,
      message: `Check module ${moduleUrl.href} does not export a 'check' function.`,
    };
  }
  // The function's signature is fixed by the naming convention contract (§2.8).
  return { ok: true, check: mod.check as Check };
}

export async function runCheck(argv: readonly string[], env: RunCheckEnv): Promise<number> {
  const args = parseCheckArgs(argv);
  if (!args.ok) {
    env.stderr(`${args.message}\n${USAGE}`);
    return EXIT_USAGE;
  }
  if (args.help) {
    env.stdout(HELP);
    return EXIT_PASS;
  }

  let fixture: string | undefined;
  if (args.fixture !== undefined) {
    fixture = resolve(env.cwd, args.fixture);
    try {
      await access(fixture, constants.R_OK);
    } catch (error) {
      env.stderr(`Cannot read fixture '${args.fixture}' (${fixture}): ${errorMessage(error)}\n`);
      return EXIT_USAGE;
    }
  }

  const loaded = await loadCheck(args.check, env.checksDir);
  if (!loaded.ok) {
    env.stderr(`${loaded.message}\n`);
    return EXIT_USAGE;
  }

  const options: CheckOptions =
    fixture === undefined
      ? { json: args.json, repoRoot: env.repoRoot }
      : { json: args.json, repoRoot: env.repoRoot, fixture };

  let result: unknown;
  try {
    result = await loaded.check(options);
  } catch (error) {
    env.stderr(`Check '${args.check}' crashed: ${errorMessage(error)}\n`);
    return EXIT_USAGE;
  }
  if (!isCheckResult(result)) {
    env.stderr(`Check '${args.check}' returned a value that is not a CheckResult.\n`);
    return EXIT_USAGE;
  }

  env.stdout(args.json ? `${JSON.stringify(result, null, 2)}\n` : formatHumanSummary(result));
  return result.ok ? EXIT_PASS : EXIT_FAIL;
}

if (import.meta.main) {
  // src/checks/run.ts and dist/checks/run.js both sit four levels below the repo root.
  const repoRoot = resolve(fileURLToPath(new URL("../../../../", import.meta.url)));
  process.exitCode = await runCheck(process.argv.slice(2), {
    cwd: process.env.INIT_CWD || process.cwd(),
    repoRoot,
    checksDir: new URL("./", import.meta.url),
    stdout: (text) => process.stdout.write(text),
    stderr: (text) => process.stderr.write(text),
  });
}
