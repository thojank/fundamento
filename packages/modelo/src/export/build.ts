// Build edge of the export (FR-07): run by the modelo `build` script after `tsc`, writes
// modelo.json, modelo.schema.json and rezolvoj.json into packages/modelo/dist/.
//
// Usage: node packages/modelo/dist/export/build.js [--root <path>] [--out <dir>]
// Exit codes: 0 = written, 1 = the Modelo is invalid or the files cannot be written (nothing is
// written for an invalid Modelo), 2 = usage error. Never prints stack traces.

import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import type { ValidationIssue } from "../contracts/issues.js";
import type { ModeloSource } from "../contracts/modelo.js";
import { defaultModeloSource, fixtureModeloSource } from "../load/source.js";
import { EXPORT_FILE_NAMES } from "./export-modelo.js";
import { prepareModeloExport } from "./prepare.js";

export const EXIT_OK = 0;
export const EXIT_DOMAIN_ERROR = 1;
export const EXIT_USAGE = 2;

export interface ExportBuildEnv {
  /** Directory that `--root` and `--out` are resolved against. */
  cwd: string;
  /** The Modelo used when `--root` is omitted (the repo's). */
  defaultSource: () => ModeloSource;
  /** Output directory when `--out` is omitted (`packages/modelo/dist`). */
  defaultOutDir: string;
  stdout: (text: string) => void;
  stderr: (text: string) => void;
}

const USAGE = `Usage: node packages/modelo/dist/export/build.js [--root <path>] [--out <dir>]

Validates the Modelo and writes ${Object.values(EXPORT_FILE_NAMES).join(", ")}.

Options:
  --root <path>   A Modelo root (<path>/vortaro, <path>/data). Default: the repo Modelo.
  --out <dir>     Output directory. Default: packages/modelo/dist.
  -h, --help      Show this help.
`;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function formatIssues(issues: readonly ValidationIssue[]): string {
  return issues
    .map(
      (issue) =>
        `${issue.severity} ${issue.rule} ${issue.path}\n  ${issue.message}\n  suggestion: ${issue.suggestion}\n`,
    )
    .join("");
}

function parse(argv: readonly string[]) {
  return parseArgs({
    args: [...argv],
    allowPositionals: false,
    strict: true,
    options: {
      root: { type: "string" },
      out: { type: "string" },
      help: { type: "boolean", short: "h", default: false },
    },
  });
}

/** Runs the export build. Never throws: failures become stderr messages plus an exit code. */
export function runExportBuild(argv: readonly string[], env: ExportBuildEnv): number {
  let values: ReturnType<typeof parse>["values"];
  try {
    values = parse(argv).values;
  } catch (error) {
    env.stderr(`${errorMessage(error)}\n\n${USAGE}`);
    return EXIT_USAGE;
  }
  if (values.help) {
    env.stdout(USAGE);
    return EXIT_OK;
  }
  if (values.root === "" || values.out === "") {
    env.stderr(`--root and --out must not be empty.\n\n${USAGE}`);
    return EXIT_USAGE;
  }

  try {
    const source =
      values.root === undefined
        ? env.defaultSource()
        : fixtureModeloSource(resolve(env.cwd, values.root));
    const outDir = values.out === undefined ? env.defaultOutDir : resolve(env.cwd, values.out);
    const result = prepareModeloExport(source);
    if (result.warnings.length > 0) {
      env.stderr(formatIssues(result.warnings));
    }
    if (!result.ok) {
      env.stderr(formatIssues(result.errors));
      env.stderr(
        `error The Modelo is invalid (${result.errors.length} error(s)); the export was not written. Fix the issues above and build again.\n`,
      );
      return EXIT_DOMAIN_ERROR;
    }
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, EXPORT_FILE_NAMES.modelo), result.files.modeloJson);
    writeFileSync(join(outDir, EXPORT_FILE_NAMES.schema), result.files.schemaJson);
    writeFileSync(join(outDir, EXPORT_FILE_NAMES.rezolvoj), result.files.rezolvojJson);
    env.stdout(
      `modelo export: wrote ${Object.values(EXPORT_FILE_NAMES).join(", ")} to ${outDir}\n`,
    );
    return EXIT_OK;
  } catch (error) {
    env.stderr(`error ${errorMessage(error)}\n`);
    return EXIT_DOMAIN_ERROR;
  }
}

if (import.meta.main) {
  process.exitCode = runExportBuild(process.argv.slice(2), {
    // pnpm runs scripts in the package directory; INIT_CWD is where the user invoked it from.
    cwd: process.env.INIT_CWD ?? process.cwd(),
    defaultSource: defaultModeloSource,
    // Valid from dist/export/: the package's dist/ directory.
    defaultOutDir: fileURLToPath(new URL("../", import.meta.url)),
    stdout: (text) => process.stdout.write(text),
    stderr: (text) => process.stderr.write(text),
  });
}
