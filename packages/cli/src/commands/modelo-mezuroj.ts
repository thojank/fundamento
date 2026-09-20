// `fm modelo mezuroj [--config <file>] [--out <file>]`: writes one measurement snapshot of the
// Modelo — every KontrastParo in every combination with its WCAG and its APCA value, plus the
// number of advisory APCA findings. The Vitrino compares against such a snapshot and shows what
// changed (Spec 004, T010). Deterministic: the same Modelo gives the same bytes.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  defaultModeloSource,
  evaluateAlirebleco,
  loadModelo,
  projectModeloSource,
} from "@fundamento/modelo";
import { parseFlags, UsageError } from "../args.js";
import { type CliContext, type Command, EXIT_FAIL, EXIT_OK } from "../command.js";
import { formatIssue } from "./modelo-validate.js";

const COMMAND_LINE = "fm modelo mezuroj";
const DEFAULT_OUT = ".fundamento/mezuroj.json";

const HELP = `${COMMAND_LINE}: Write a measurement snapshot of the Modelo.

Usage: ${COMMAND_LINE} [--config <file>] [--out <file>]

Writes one JSON file: every KontrastParo in every combination with its WCAG 2.x value, its APCA
value (advisory) and the number of advisory findings. Pass it to fm projekcioj build --bazo and
the Vitrino shows the change against that state, pair by pair.

Options:
  --config <file>  A project's fundamento.config.json
  --out <file>     Output file (default: ${DEFAULT_OUT})
  -h, --help       Show this help

Exit codes: 0 written, 1 the Modelo could not be loaded, 2 usage error.
`;

/** Rounded the way the Vitrino shows them, so a comparison never shows a rounding difference. */
const round = (value: number, digits: number): number =>
  Number(Math.round(Number(`${value}e${digits}`)) + `e-${digits}`);

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
  const { modelo, issues } = loadModelo(source);
  if (modelo === undefined) {
    for (const issue of issues) context.stderr(`${formatIssue(issue)}\n`);
    context.stderr("The Modelo could not be loaded; nothing was written.\n");
    return EXIT_FAIL;
  }

  const evaluation = evaluateAlirebleco(modelo, {
    kontrastParojFile: "data/kontrastparoj.json",
    collect: true,
  });
  const mezuroj: Record<string, { paro: string; wcag2: number; apca: number }[]> = {};
  let apcaHintoj = 0;
  for (const measurement of evaluation.measurements ?? []) {
    const key = modelo.dimensioj
      .map((dimensio) => measurement.combination[dimensio.name] ?? "")
      .join("|");
    const branch = measurement.branch === "aux" ? measurement.aux : measurement.main;
    if (branch === undefined) continue;
    const apca = branch.metrics.apca;
    if (apca?.threshold !== undefined && apca.passed === false) apcaHintoj += 1;
    mezuroj[key] = [
      ...(mezuroj[key] ?? []),
      {
        paro: measurement.pair.name,
        wcag2: round(branch.ratio, 2),
        apca: round(apca?.value ?? 0, 1),
      },
    ];
  }

  const file = resolve(context.baseDir, typeof values.out === "string" ? values.out : DEFAULT_OUT);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify({ mezuroj, apcaHintoj }, null, 2)}\n`);
  context.stdout(
    `${COMMAND_LINE}: wrote ${Object.keys(mezuroj).length} combination(s) and ${apcaHintoj} advisory APCA finding(s) to ${file}.\n`,
  );
  return EXIT_OK;
}

export const modeloMezuroj: Command = {
  name: "mezuroj",
  summary: "Write a measurement snapshot (WCAG and APCA per pair and combination).",
  help: HELP,
  run: (args, context) => Promise.resolve(run(args, context)),
};
