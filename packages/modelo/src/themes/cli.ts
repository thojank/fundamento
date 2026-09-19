// CLI edge of the themes derivation: `pnpm vortaro:themes [--root <path>]` (FR-10).
//
// Usage: node packages/modelo/dist/themes/cli.js [--root <path>]
// Exit codes: 0 = files written, 1 = domain error (Modelo cannot be loaded, write failed),
// 2 = usage error. Never prints stack traces.

import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import type { ValidationIssue } from "../contracts/issues.js";
import type { ModeloSource } from "../contracts/modelo.js";
import { METADATA_FILE_NAME, THEMES_FILE_NAME } from "../load/files.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource, fixtureModeloSource } from "../load/source.js";
import { deriveThemes } from "./derive.js";
import { serializeThemes } from "./serialize.js";

export const EXIT_OK = 0;
export const EXIT_DOMAIN_ERROR = 1;
export const EXIT_USAGE = 2;

export interface ThemesCliEnv {
  /** Directory that `--root` is resolved against. */
  cwd: string;
  /** The Modelo used when `--root` is omitted (the repo's vortaro). */
  defaultSource: () => ModeloSource;
  stdout: (text: string) => void;
  stderr: (text: string) => void;
}

export const THEMES_HELP = `Regenerate the Tokens-Studio $themes.json and $metadata.json of a Vortaro

The files are derived from data/dimensioj.json and the kondicxoj of the set files, in the
resolver's set order. Never edit them by hand; run this command after changing Dimensioj or sets.

Usage:
  pnpm vortaro:themes [--root <path>]

Options:
  --root <path>   A Modelo root (<path>/vortaro, <path>/data), e.g. a test fixture. Relative to the
                  directory you run the command from. Default: the repo Vortaro
                  (packages/vortaro with packages/modelo/data).
  -h, --help      Show this help.

Exit codes: 0 written, 1 Modelo cannot be loaded or files cannot be written, 2 usage error.
`;

const USAGE = `Usage: pnpm vortaro:themes [--root <path>]
Run with --help for details.
`;

type Command = { kind: "help" } | { kind: "write"; source: ModeloSource };

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function parseThemesArgs(
  argv: readonly string[],
  env: ThemesCliEnv,
): { ok: true; command: Command } | { ok: false; message: string } {
  let parsed: ReturnType<typeof parseStrict>;
  try {
    parsed = parseStrict(argv);
  } catch (error) {
    return { ok: false, message: errorMessage(error) };
  }
  const { values, positionals } = parsed;
  if (values.help) {
    return { ok: true, command: { kind: "help" } };
  }
  if (positionals.length > 0) {
    return { ok: false, message: `Unexpected arguments: ${positionals.join(" ")}` };
  }
  if (values.root === "") {
    return { ok: false, message: "--root must not be empty." };
  }
  const source =
    values.root === undefined
      ? env.defaultSource()
      : fixtureModeloSource(resolve(env.cwd, values.root));
  return { ok: true, command: { kind: "write", source } };
}

function parseStrict(argv: readonly string[]) {
  return parseArgs({
    args: [...argv],
    allowPositionals: true,
    strict: true,
    options: {
      root: { type: "string" },
      help: { type: "boolean", short: "h", default: false },
    },
  });
}

function formatIssues(issues: readonly ValidationIssue[]): string {
  return issues
    .map(
      (issue) =>
        `${issue.severity} ${issue.rule} ${issue.path}\n  ${issue.message}\n  suggestion: ${issue.suggestion}\n`,
    )
    .join("");
}

const DERIVED_FILES = [THEMES_FILE_NAME, METADATA_FILE_NAME];

/** Whether an issue concerns one of the two files this command (over)writes anyway. */
function concernsDerivedFile(issue: ValidationIssue): boolean {
  const file = issue.path.split("#")[0] ?? "";
  return DERIVED_FILES.some((name) => file === name || file.endsWith(`/${name}`));
}

function writeDerived(source: ModeloSource, env: ThemesCliEnv): number {
  let loaded = loadModelo(source);
  if (
    loaded.modelo === undefined &&
    loaded.issues.length > 0 &&
    loaded.issues.every(concernsDerivedFile)
  ) {
    // Only the derived files are missing or broken: they are regenerated below, so start from
    // empty placeholders to be able to load the rest of the Modelo.
    writeFileSync(join(source.vortaroDir, THEMES_FILE_NAME), "[]\n");
    writeFileSync(join(source.vortaroDir, METADATA_FILE_NAME), '{ "tokenSetOrder": [] }\n');
    loaded = loadModelo(source);
  }
  const { modelo } = loaded;
  if (modelo === undefined) {
    env.stderr(formatIssues(loaded.issues));
    env.stderr("error The Modelo could not be loaded; nothing was written.\n");
    return EXIT_DOMAIN_ERROR;
  }
  // Token-level load issues do not affect the derivation (Dimensioj and kondicxoj only);
  // `fm modelo validate` reports them.
  const { themesJson, metadataJson } = serializeThemes(deriveThemes(modelo));
  const themesPath = join(source.vortaroDir, THEMES_FILE_NAME);
  const metadataPath = join(source.vortaroDir, METADATA_FILE_NAME);
  writeFileSync(themesPath, themesJson);
  writeFileSync(metadataPath, metadataJson);
  env.stdout(`wrote ${themesPath}\nwrote ${metadataPath}\n`);
  return EXIT_OK;
}

/** Runs the themes CLI. Never throws: failures become messages on stderr plus an exit code. */
export function runThemesCli(argv: readonly string[], env: ThemesCliEnv): number {
  let parsed: ReturnType<typeof parseThemesArgs>;
  try {
    parsed = parseThemesArgs(argv, env);
  } catch (error) {
    env.stderr(`error ${errorMessage(error)}\n`);
    return EXIT_DOMAIN_ERROR;
  }
  if (!parsed.ok) {
    env.stderr(`${parsed.message}\n${USAGE}`);
    return EXIT_USAGE;
  }
  if (parsed.command.kind === "help") {
    env.stdout(THEMES_HELP);
    return EXIT_OK;
  }
  try {
    return writeDerived(parsed.command.source, env);
  } catch (error) {
    env.stderr(`error ${errorMessage(error)}\n`);
    return EXIT_DOMAIN_ERROR;
  }
}

if (import.meta.main) {
  process.exitCode = runThemesCli(process.argv.slice(2), {
    // pnpm runs root scripts in the repo root; INIT_CWD is the directory the user invoked it from.
    cwd: process.env.INIT_CWD ?? process.cwd(),
    defaultSource: defaultModeloSource,
    stdout: (text) => process.stdout.write(text),
    stderr: (text) => process.stderr.write(text),
  });
}
