// `fm projekcioj build [--config <file>] [--out <dir>]`: validates the Modelo and generates every
// projection (Spec 003, plan D-01): CSS, Tailwind, Web Component, React, Figma plan, Code Connect
// and Make Kits, plus `projekcioj.json` with the SHA-256 of every file. Nothing is written for an
// invalid Modelo.
import { resolve } from "node:path";
import { defaultModeloSource, projectModeloSource } from "@fundamento/modelo";
import { buildProjekcioj } from "@fundamento/projekcioj";
import { parseFlags, UsageError } from "../args.js";
import { type CliContext, type Command, EXIT_FAIL, EXIT_OK } from "../command.js";
import { formatIssue } from "./modelo-validate.js";

const COMMAND_LINE = "fm projekcioj build";
const DEFAULT_OUT = ".fundamento/projekcioj";

const HELP = `${COMMAND_LINE}: Validate a Modelo and generate every projection.

Usage: ${COMMAND_LINE} [--config <file>] [--out <dir>]

Writes one folder per Celo and projekcioj.json, the manifest with the SHA-256 of every file.
Without --config, builds the Modelo of this repository with its reference Aspekto komuna.

Options:
  --config <file>  A project's fundamento.config.json: the core, komuna and the Aspekto
                   packages it lists
  --out <dir>      Output directory (default: ${DEFAULT_OUT})
  -h, --help       Show this help

Exit codes: 0 written, 1 the Modelo is invalid (nothing written), 2 usage error.
`;

function run(args: readonly string[], context: CliContext): number {
  const { values, positionals } = parseFlags(
    args,
    { config: { type: "string" }, out: { type: "string" } },
    COMMAND_LINE,
  );
  if (positionals.length > 0) {
    throw new UsageError(`\`${COMMAND_LINE}\` takes no arguments, got: ${positionals.join(" ")}.`, [
      "Pass the project config with --config <file>.",
    ]);
  }
  const config = typeof values.config === "string" ? values.config : undefined;
  const source =
    config === undefined
      ? defaultModeloSource()
      : projectModeloSource(resolve(context.baseDir, config), config);
  const outDir = resolve(
    context.baseDir,
    typeof values.out === "string" ? values.out : DEFAULT_OUT,
  );
  const result = buildProjekcioj({ outDir, source });
  for (const warning of result.warnings) context.stderr(`${formatIssue(warning)}\n`);
  if (!result.ok) {
    for (const error of result.errors) context.stderr(`${formatIssue(error)}\n`);
    context.stderr(
      `The Modelo is invalid (${result.errors.length} error(s)); nothing was written to ${outDir}.\n`,
    );
    return EXIT_FAIL;
  }
  const celoj = result.celoj.length === 0 ? "(none yet)" : result.celoj.join(", ");
  context.stdout(
    `${COMMAND_LINE}: wrote ${result.files.length} files for the Celoj ${celoj} to ${outDir}.\n`,
  );
  return EXIT_OK;
}

export const projekciojBuild: Command = {
  name: "build",
  summary:
    "Validate the Modelo and generate every projection (CSS, Tailwind, Eroj, Figma, Make Kits).",
  help: HELP,
  run,
};
