// `fm modelo export [--config <file>] [--out <dir>]`: validates the repo Modelo or a project's
// Modelo (core + reference Aspekto + the packages its fundamento.config.json lists) and writes
// modelo.json, modelo.schema.json, rezolvoj.json and one Tokens-Studio folder per Aspekto
// (vortaro/<aspekto>/). Nothing is written for an invalid Modelo (Spec 001, D-09).
import { resolve } from "node:path";
import {
  defaultModeloSource,
  prepareModeloExport,
  projectModeloSource,
  writeModeloExport,
} from "@fundamento/modelo";
import { parseFlags, UsageError } from "../args.js";
import { type CliContext, type Command, EXIT_FAIL, EXIT_OK } from "../command.js";
import { formatIssue } from "./modelo-validate.js";

const COMMAND_LINE = "fm modelo export";
const DEFAULT_OUT = ".fundamento/export";

const HELP = `${COMMAND_LINE}: Validate a Modelo and write its export.

Usage: ${COMMAND_LINE} [--config <file>] [--out <dir>]

Writes modelo.json, modelo.schema.json, rezolvoj.json and vortaro/<aspekto>/ (a complete
Tokens-Studio folder per Aspekto, for one Penpot or Tokens Studio import per brand).
Without --config, exports the Modelo of this repository with its reference Aspekto komuna.

Options:
  --config <file>  A project's fundamento.config.json: the core, komuna and the Aspekto
                   packages it lists
  --out <dir>      Output directory (default: ${DEFAULT_OUT})
  -h, --help       Show this help

Relative paths resolve against the directory you ran the command from.
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

  const result = prepareModeloExport(source);
  for (const warning of result.warnings) context.stderr(`${formatIssue(warning)}\n`);
  if (!result.ok) {
    for (const error of result.errors) context.stderr(`${formatIssue(error)}\n`);
    context.stderr(
      `The Modelo is invalid (${result.errors.length} error(s)); nothing was written to ${outDir}.\n`,
    );
    return EXIT_FAIL;
  }
  const written = writeModeloExport(outDir, result.files);
  context.stdout(
    `Wrote ${written.length} files to ${outDir} (Aspektoj: ${Object.keys(result.files.vortaro).join(", ")}).\n`,
  );
  return EXIT_OK;
}

export const modeloExport: Command = {
  name: "export",
  summary: "Validate the repo or project Modelo and write its export and one folder per Aspekto.",
  help: HELP,
  run,
};
