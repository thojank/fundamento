// `fm projekcioj build [--config <file>] [--out <dir>]`: validates the Modelo and generates every
// projection (Spec 003, plan D-01): CSS, Tailwind, Web Component, React, Figma plan, Code Connect
// and Make Kits, plus `projekcioj.json` with the SHA-256 of every file. Nothing is written for an
// invalid Modelo.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defaultModeloSource, fixtureModeloSource, projectModeloSource } from "@fundamento/modelo";
import { buildProjekcioj } from "@fundamento/projekcioj";
import { parseFlags, UsageError } from "../args.js";
import { type CliContext, type Command, EXIT_FAIL, EXIT_OK } from "../command.js";
import { formatIssue } from "./modelo-validate.js";

const COMMAND_LINE = "fm projekcioj build";
const DEFAULT_OUT = ".fundamento/projekcioj";

const HELP = `${COMMAND_LINE}: Validate a Modelo and generate every projection.

Usage: ${COMMAND_LINE} [--config <file> | --fixture <dir>] [--out <dir>] [--celo <name>]

Writes one folder per Celo and projekcioj.json, the manifest with the SHA-256 of every file.
Without --config, builds the Modelo of this repository with its reference Aspekto komuna.

Options:
  --config <file>  A project's fundamento.config.json: the core, komuna and the Aspekto
                   packages it lists
  --fixture <dir>  A Modelo root (<dir>/vortaro, <dir>/data) instead of this repository's,
                   as in "pnpm check:<check> --fixture". Not with --config.
  --out <dir>      Output directory (default: ${DEFAULT_OUT})
  --celo <name>    Build only this Celo (repeatable, or comma-separated). Default: all of them.
                   A Celo that composes what the others wrote needs them in the selection.
  --bazo <file>    A measurement snapshot of another state (fm modelo mezuroj); the Vitrino
                   then shows the change against it, pair by pair
  -h, --help       Show this help

Exit codes: 0 written, 1 the Modelo is invalid (nothing written), 2 usage error.
`;

async function run(args: readonly string[], context: CliContext): Promise<number> {
  const { values, positionals } = parseFlags(
    args,
    {
      config: { type: "string" },
      fixture: { type: "string" },
      out: { type: "string" },
      bazo: { type: "string", multiple: true },
      celo: { type: "string", multiple: true },
    },
    COMMAND_LINE,
  );
  if (positionals.length > 0) {
    throw new UsageError(`\`${COMMAND_LINE}\` takes no arguments, got: ${positionals.join(" ")}.`, [
      "Pass the project config with --config <file>.",
    ]);
  }
  const config = typeof values.config === "string" ? values.config : undefined;
  const fixture = typeof values.fixture === "string" ? values.fixture : undefined;
  if (config !== undefined && fixture !== undefined) {
    throw new UsageError("Use either --config or --fixture, not both.", [
      "--config takes a project's fundamento.config.json, --fixture a Modelo root.",
    ]);
  }
  const source =
    config !== undefined
      ? projectModeloSource(resolve(context.baseDir, config), config)
      : fixture !== undefined
        ? fixtureModeloSource(resolve(context.baseDir, fixture))
        : defaultModeloSource();
  const outDir = resolve(
    context.baseDir,
    typeof values.out === "string" ? values.out : DEFAULT_OUT,
  );
  const bazoValue = Array.isArray(values.bazo) ? values.bazo.at(-1) : values.bazo;
  const bazoFile = typeof bazoValue === "string" ? resolve(context.baseDir, bazoValue) : undefined;
  const bazo =
    bazoFile === undefined
      ? undefined
      : (JSON.parse(readFileSync(bazoFile, "utf8")) as Parameters<
          typeof buildProjekcioj
        >[0]["bazo"]);
  // `--celo css --celo figma` and `--celo css,figma` mean the same thing.
  const celoj = Array.isArray(values.celo)
    ? values.celo.flatMap((value) =>
        String(value)
          .split(",")
          .map((name) => name.trim()),
      )
    : undefined;
  let result: Awaited<ReturnType<typeof buildProjekcioj>>;
  try {
    result = await buildProjekcioj({
      outDir,
      source,
      ...(bazo === undefined ? {} : { bazo }),
      ...(celoj === undefined ? {} : { celoj }),
    });
  } catch (error) {
    context.stderr(`${error instanceof Error ? error.message : String(error)}\n`);
    return EXIT_FAIL;
  }
  for (const warning of result.warnings) context.stderr(`${formatIssue(warning)}\n`);
  if (!result.ok) {
    for (const error of result.errors) context.stderr(`${formatIssue(error)}\n`);
    context.stderr(
      `The Modelo is invalid (${result.errors.length} error(s)); nothing was written to ${outDir}.\n`,
    );
    return EXIT_FAIL;
  }
  const written = result.celoj.length === 0 ? "(none yet)" : result.celoj.join(", ");
  context.stdout(
    `${COMMAND_LINE}: wrote ${result.files.length} files for the Celoj ${written} to ${outDir}.\n`,
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
