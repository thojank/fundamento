// `fm agordilo derive <agordo.json> --out <dir> [--json]`: derives a complete, checked Aspekto
// package from an Agordo (Spec 016, G1–G8). It writes the package only when the export is
// allowed: no fixed rule violated, every adjustable violation recorded by a Jugxo of the Agordo.
// Otherwise it writes nothing and names each violation with its cause and one suggestion.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  deriveAspekto,
  loadCalibration,
  readAgordo,
  readStructure,
  writablePackageDir,
  writePackage,
} from "@fundamento/agordilo";
import { parseStrictJson, type ValidationIssue } from "@fundamento/modelo";
import { parseFlags, UsageError } from "../args.js";
import { type CliContext, type Command, EXIT_FAIL, EXIT_OK } from "../command.js";
import { formatIssue } from "./modelo-validate.js";

const COMMAND_LINE = "fm agordilo derive";

const HELP = `${COMMAND_LINE}: Derive a complete, checked Aspekto package from an Agordo.

Usage: ${COMMAND_LINE} <agordo.json> --out <dir> [--json]

The Agordo is the recipe of a brand: name, leitfarbe (hex or oklch()), optional zusatzfarben,
neutral.toenung, regler (helligkeit, kontrast, saettigung), schriften, aspiroj and jugxoj
(#/$defs/Agordo of the Modelo schema). The Agordilo computes the six palettes in OKLCH at the
contrast targets measured on komuna, keeps every role and every other token of the structure,
runs the checks of the CI and writes the package: aspekto.json (with the Agordo as its origin),
ids.lock.json, $themes.json, the sets, the glyphs, jugxoj.json, raporto.json and raporto.md.
The same Agordo gives the same bytes.

A violation of a fixed rule refuses the export; a violation of an adjustable rule (text-hierarchy,
surface-order, surface-distinct, palette-even, palette-aligned) needs a Jugxo in the Agordo
(regulo, kialo, date, name). A refused export writes nothing.

Options:
  --out <dir>  The package directory to write (absent, empty or an earlier derived package)
  --json       Print only the result as JSON on stdout
  -h, --help   Show this help

Exit codes: 0 written, 1 the Agordo is invalid or the export is refused, 2 usage error.
`;

interface Result {
  written: boolean;
  out: string;
  exportable: boolean;
  summary?: unknown;
  issues: ValidationIssue[];
}

function print(result: Result, json: boolean, context: CliContext, lines: string[]): void {
  if (json) {
    context.stdout(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }
  const parts = [...lines];
  if (result.issues.length > 0) {
    parts.push("", `Issues (${result.issues.length}):`, ...result.issues.map(formatIssue));
  }
  context.stdout(`${parts.join("\n")}\n`);
}

function run(args: readonly string[], context: CliContext): number {
  const { values, positionals } = parseFlags(
    args,
    { out: { type: "string" }, json: { type: "boolean" } },
    COMMAND_LINE,
  );
  if (positionals.length !== 1) {
    throw new UsageError(
      `\`${COMMAND_LINE}\` takes exactly one Agordo file, got ${positionals.length}.`,
      [`Usage: ${COMMAND_LINE} <agordo.json> --out <dir>`],
    );
  }
  const out = typeof values.out === "string" ? values.out : undefined;
  if (out === undefined) {
    throw new UsageError(`\`${COMMAND_LINE}\` needs --out <dir>.`, [
      "Name the package directory to write, e.g. --out ../fundamento-aspekto-<name>.",
    ]);
  }
  const json = values.json === true;
  const given = positionals[0] ?? "";
  const file = resolve(context.baseDir, given);
  const target = resolve(context.baseDir, out);
  const refused = (issues: ValidationIssue[], lines: string[]): number => {
    print({ written: false, out: target, exportable: false, issues }, json, context, lines);
    return EXIT_FAIL;
  };

  if (!existsSync(file)) {
    return refused(
      [
        {
          rule: "file-missing",
          severity: "error",
          path: given,
          message: `No Agordo exists at ${file} (relative paths resolve against ${context.baseDir}).`,
          suggestion: "Pass the path of an agordo.json.",
        },
      ],
      [`Agordo: ${file}`, "INVALID: nothing was written."],
    );
  }
  const parsed = parseStrictJson(readFileSync(file, "utf8"), given);
  if (parsed.issues.length > 0) {
    return refused(parsed.issues, [`Agordo: ${file}`, "INVALID: nothing was written."]);
  }
  const { agordo, issues } = readAgordo(parsed.value, given);
  if (agordo === undefined) {
    return refused(issues, [`Agordo: ${file}`, "INVALID: nothing was written."]);
  }
  if (!writablePackageDir(target)) {
    throw new UsageError(
      `${target} is neither empty nor a package the Agordilo derived; it would be overwritten.`,
      ["Choose an empty or new directory for --out."],
    );
  }

  const derivation = deriveAspekto(agordo, readStructure(), loadCalibration());
  const { summary } = derivation.raporto;
  const header = [
    `Agordo: ${file}`,
    `Aspekto: ${agordo.name}`,
    `KontrastParoj: ${summary.pairs.passed} of ${summary.pairs.measured} evaluations pass`,
    `Violations: ${summary.violations.fixed} fixed, ${summary.violations.adjustable} adjustable (${summary.violations.covered} covered by a Jugxo); ${summary.hints} hints`,
  ];
  if (!derivation.exportable) {
    print(
      { written: false, out: target, exportable: false, summary, issues: derivation.issues },
      json,
      context,
      [
        ...header,
        "EXPORT REFUSED: nothing was written. Each issue names its cause and one suggestion.",
      ],
    );
    return EXIT_FAIL;
  }
  writePackage(target, derivation.files);
  print({ written: true, out: target, exportable: true, summary, issues: [] }, json, context, [
    ...header,
    `WRITTEN: ${Object.keys(derivation.files).length} files to ${target}`,
  ]);
  return EXIT_OK;
}

export const agordiloDerive: Command = {
  name: "derive",
  summary: "Derive a complete, checked Aspekto package from an Agordo (lead colour, sliders).",
  help: HELP,
  run,
};
