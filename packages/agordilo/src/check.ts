// The checks of a derived Aspekto (Spec 016, G5, G6): the same ones the CI runs, from the same
// library — Modelo validation with every automatic Regulo (contrast-reserve, text-hierarchy,
// state-distinct, surface-order, the Aspiroj the Agordo names …) and the Alirebleco evaluation of
// every KontrastParo in every combination, WCAG 2.x binding and APCA as a hint. Nothing is
// copied; the Agordilo only reads the results for its Aspekto, classifies them as fixed or
// adjustable, explains them and writes the Raporto. Pure.

import {
  ASPEKTO_DIMENSIO,
  type AspektoPackageFiles,
  buildModelo,
  evaluateAlirebleco,
  type Jugxo,
  type Modelo,
  type ModeloFiles,
  type PairMeasurement,
  type ValidationIssue,
  validateModeloFiles,
} from "@fundamento/modelo";
import type { Agordo } from "./agordo.js";
import type { Calibration } from "./calibration.js";
import { Explainer, tokensOf } from "./explain.js";
import type { Gestalt } from "./gestalt.js";
import type { DerivedPalettes, ModeOverride, TargetFloors } from "./palettes.js";
import type {
  Raporto,
  RaportoCheck,
  RaportoHint,
  RaportoJugxo,
  RaportoPair,
  RaportoStep,
  RaportoViolation,
} from "./raporto.js";
import { isRecord } from "./record.js";
import { AGORDILO_VERSION } from "./version.js";

/**
 * The rules a brand may deviate from with a Jugxo (G6.3): the order of surfaces, the hierarchy
 * of text and the regularity of the ramps — structure a brand may grade differently. Every other
 * rule protects a person or the measurement itself and is fixed (G6.2): the WCAG thresholds of
 * kontrastSojloj, the reserve above them, distinct action states, the focus ring, the gamut
 * (README "What an Aspekto decides"). Proposal of plan ① D-08, decision of the maintainer (O-3).
 */
export const ADJUSTABLE_RULES: readonly string[] = [
  "text-hierarchy",
  "surface-order",
  "surface-distinct",
  "palette-even",
  "palette-aligned",
];

/** The checks the Raporto always lists (G5), passed or not; violated ones are added. */
export const LISTED_CHECKS: readonly string[] = [
  "contrast-below-threshold",
  "contrast-reserve",
  "text-hierarchy",
  "state-distinct",
  "surface-order",
];

/** The pseudo-path of an Agordo issue: the same whether the Agordo is read from a file or a package. */
export const AGORDO_PATH = "agordo";

export interface CheckInput {
  /** The Modelo files with the derived package composed. */
  files: ModeloFiles;
  /** The label of the derived package in `files`. */
  label: string;
  agordo: Agordo;
  calibration: Calibration;
  floors: TargetFloors;
  overrides: readonly ModeOverride[];
  palettes: DerivedPalettes;
  /** The values of stage 2 (Spec 019 ①); its hints join the Raporto's. */
  gestalt?: Gestalt;
  /** Issues of the Agordo found before the checks (an icon weight without its glyphs). */
  agordoIssues?: readonly ValidationIssue[];
}

export interface CheckResult {
  raporto: Raporto;
  /** Why the export is refused: every uncovered violation and every unsound Jugxo of the Agordo. */
  issues: ValidationIssue[];
}

const round = (value: number, digits = 4): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const COMBINATION = /^rezolvo\(([^)]*)\)\/(.+)$/;

function combinationOf(path: string): { combination?: string; subject: string } {
  const match = COMBINATION.exec(path);
  return match?.[1] === undefined || match[2] === undefined
    ? { subject: path }
    : { combination: match[1], subject: match[2].replace(/^kontrastParo\//, "") };
}

/** Issue paths inside the package lose the package's location (raporto is location-free). */
function packageRelative(path: string, prefix: string): string {
  return prefix !== "" && path.startsWith(prefix) ? path.slice(prefix.length) : path;
}

function regulojByName(modelo: Modelo): Map<string, { id: string; name: string }> {
  return new Map(
    modelo.reguloj
      .filter((regulo) => regulo.aspekto === undefined)
      .map((regulo) => [regulo.name, { id: regulo.id, name: regulo.name }]),
  );
}

function measurementKey(measurement: PairMeasurement): string {
  const carrying =
    measurement.branch === "aux" && measurement.aux !== undefined
      ? measurement.aux
      : measurement.main;
  return [
    measurement.pair.name,
    measurement.threshold ?? "",
    round(carrying.ratio),
    measurement.passed,
    measurement.branch ?? "",
  ].join("|");
}

function pairsOf(modelo: Modelo, measurements: readonly PairMeasurement[]): RaportoPair[] {
  const pairs = new Map<string, RaportoPair>();
  const dimensions = modelo.dimensioj.map((dimensio) => dimensio.name);
  for (const measurement of measurements) {
    const key = measurementKey(measurement);
    const known = pairs.get(key);
    if (known !== undefined) {
      known.combinations += 1;
      continue;
    }
    const carrying =
      measurement.branch === "aux" && measurement.aux !== undefined
        ? measurement.aux
        : measurement.main;
    const apca = carrying.metrics.apca;
    const combination = dimensions
      .filter((name) => measurement.combination[name] !== undefined)
      .map((name) => `${name}=${measurement.combination[name]}`)
      .join(",");
    pairs.set(key, {
      pair: measurement.pair.name,
      kategorio: measurement.kategorio,
      combination,
      combinations: 1,
      value: round(carrying.ratio),
      ...(measurement.threshold === undefined ? {} : { threshold: measurement.threshold }),
      passed: measurement.passed,
      branch: measurement.branch,
      ...(apca === undefined
        ? {}
        : {
            apca: {
              value: round(apca.value, 2),
              ...(apca.threshold === undefined ? {} : { threshold: apca.threshold }),
              ...(apca.passed === undefined ? {} : { passed: apca.passed }),
            },
          }),
    });
  }
  return [...pairs.values()].sort((a, b) =>
    a.pair < b.pair ? -1 : a.pair > b.pair ? 1 : a.value - b.value,
  );
}

function stepsOf(palettes: DerivedPalettes): RaportoStep[] {
  return [...palettes.steps, ...palettes.overrides].map((step) => ({
    token: `color.palette.${step.palette}.${step.step}`,
    mode: step.mode,
    hex: step.hex,
    target: round(step.target),
    achieved: round(step.achieved),
    ...(step.overridden === true ? { overridden: true as const } : {}),
    ...(step.gesetzt === true ? { gesetzt: true as const } : {}),
    onTarget: step.onTarget,
    toneKept: step.toneKept,
    chroma: { requested: round(step.requested), kept: round(step.c) },
  }));
}

function packageOf(files: ModeloFiles, label: string): AspektoPackageFiles {
  const pkg = files.packages.find((entry) => entry.name === label);
  if (pkg === undefined) throw new Error(`The Modelo holds no package ${label}.`);
  return pkg;
}

/** The Jugxoj of the package: Regulo ID → Jugxo. */
function packageJugxoj(pkg: AspektoPackageFiles): Jugxo[] {
  const value = pkg.jugxoj?.value;
  return isRecord(value) && Array.isArray(value.jugxoj) ? (value.jugxoj as Jugxo[]) : [];
}

/** Issues of the Agordo's own Jugxoj: a Regulo that does not exist, or one that is fixed. */
export function agordoJugxoIssues(
  agordo: Agordo,
  reguloj: ReadonlyMap<string, { id: string; name: string }>,
): ValidationIssue[] {
  return (agordo.jugxoj ?? []).flatMap((jugxo, index): ValidationIssue[] => {
    const path = `${AGORDO_PATH}#/jugxoj/${index}/regulo`;
    if (!reguloj.has(jugxo.regulo)) {
      return [
        {
          rule: "regulo-unknown",
          severity: "error",
          path,
          message: `The Jugxo names the Regulo ${jugxo.regulo}, which does not exist.`,
          suggestion: `Name an adjustable Regulo: ${ADJUSTABLE_RULES.join(", ")}.`,
        },
      ];
    }
    if (!ADJUSTABLE_RULES.includes(jugxo.regulo)) {
      return [
        {
          rule: "agordo-jugxo-fixed",
          severity: "error",
          path,
          message: `${jugxo.regulo} is a fixed rule: no Jugxo opens it (Spec 016, G6.2).`,
          suggestion: `Remove the Jugxo and change the Agordo until ${jugxo.regulo} holds; only ${ADJUSTABLE_RULES.join(", ")} take a Jugxo.`,
        },
      ];
    }
    return [];
  });
}

/** Runs every check on the derived Aspekto and writes the Raporto. */
export function checkAspekto(input: CheckInput): CheckResult {
  const { files, label, agordo } = input;
  const name = agordo.name;
  const built = buildModelo(files);
  const { modelo } = built;
  const pkg = packageOf(files, label);
  const prefix = pkg.aspekto.file.slice(0, -"aspekto.json".length);
  const ours = (issue: ValidationIssue): boolean =>
    issue.combination?.[ASPEKTO_DIMENSIO] === name ||
    (prefix !== "" && issue.path.startsWith(prefix));

  const validation = validateModeloFiles(files, [], built);
  const evaluation = evaluateAlirebleco(modelo, {
    kontrastParojFile: files.data["kontrastparoj.json"].file,
    dimensiojFile: files.data["dimensioj.json"].file,
    collect: true,
  });
  const measurements = (evaluation.measurements ?? []).filter(
    (measurement) => measurement.combination[ASPEKTO_DIMENSIO] === name,
  );
  const reguloj = regulojByName(modelo);
  const explainer = new Explainer({
    modelo,
    agordo,
    calibration: input.calibration,
    floors: input.floors,
    overrides: input.overrides,
    palettes: input.palettes,
  });
  const pairMembers = new Map(
    modelo.kontrastParoj.map((pair) => [
      pair.name,
      [
        pair.foreground,
        pair.background,
        ...(pair.aux ? [pair.aux.foreground, pair.aux.background] : []),
      ],
    ]),
  );

  // Violations: errors of the validation and of the contrast evaluation, one per distinct finding.
  const violations: RaportoViolation[] = [];
  const seen = new Set<string>();
  const contrastErrors = evaluation.errors.filter(ours);
  for (const issue of [...validation.errors.filter(ours), ...contrastErrors]) {
    const path = packageRelative(issue.path, prefix);
    const { combination, subject } = combinationOf(path);
    const measurement =
      issue.rule === "contrast-below-threshold"
        ? measurements.find(
            (entry) =>
              entry.pair.name === subject &&
              Object.entries(entry.combination).every(
                ([dimensio, valoro]) => issue.combination?.[dimensio] === valoro,
              ),
          )
        : undefined;
    const key =
      measurement === undefined
        ? `${issue.rule}|${subject}|${issue.message}`
        : `${issue.rule}|${measurementKey(measurement)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const tokens = tokensOf(issue.message, [subject, ...(pairMembers.get(subject) ?? [])]);
    const { cause, suggestion, apply } =
      issue.combination === undefined
        ? {
            cause: issue.message,
            suggestion: issue.suggestion,
          }
        : explainer.explain(issue.rule, issue.combination, tokens);
    const regulo = reguloj.get(issue.rule);
    violations.push({
      rule: issue.rule,
      ...(regulo === undefined ? {} : { regulo }),
      fixed: !ADJUSTABLE_RULES.includes(issue.rule),
      subject,
      path,
      ...(combination === undefined ? {} : { combination }),
      message: issue.message,
      cause,
      suggestion,
      ...(apply === undefined ? {} : { apply }),
    });
  }

  // Jugxoj of the package cover the adjustable violations of their Regulo.
  const jugxoj: RaportoJugxo[] = [];
  const recorded = packageJugxoj(pkg);
  for (const jugxo of recorded) {
    const ref = isRecord(jugxo.ref) && typeof jugxo.ref.regulo === "string" ? jugxo.ref.regulo : "";
    const regulo = [...reguloj.values()].find((entry) => entry.id === ref);
    let covers = 0;
    for (const violation of violations) {
      if (violation.fixed || violation.regulo?.id !== ref || violation.jugxo !== undefined)
        continue;
      violation.jugxo = jugxo.id;
      covers += 1;
    }
    const given = agordo.jugxoj?.find((entry) => entry.regulo === regulo?.name);
    jugxoj.push({
      id: jugxo.id,
      regulo: regulo?.name ?? ref,
      kialo: jugxo.kialo,
      date: jugxo.date,
      name: given?.name ?? "",
      covers,
    });
  }

  const agordoIssues = [...(input.agordoIssues ?? []), ...agordoJugxoIssues(agordo, reguloj)];
  const issues: ValidationIssue[] = [
    ...agordoIssues,
    ...violations
      .filter((violation) => violation.jugxo === undefined)
      .map(
        (violation): ValidationIssue => ({
          rule: violation.rule as ValidationIssue["rule"],
          severity: "error",
          path: violation.path,
          message: `${violation.message} Cause: ${violation.cause}`,
          suggestion: violation.fixed
            ? violation.suggestion
            : `${violation.suggestion} Or record a Jugxo for ${violation.rule} in the Agordo (reason, date, name): it is an adjustable rule.`,
        }),
      ),
  ];

  const checks: RaportoCheck[] = [];
  const ruleNames = [
    ...LISTED_CHECKS,
    ...violations
      .map((violation) => violation.rule)
      .filter((rule) => !LISTED_CHECKS.includes(rule)),
  ];
  for (const rule of [...new Set(ruleNames)]) {
    const count = violations.filter((violation) => violation.rule === rule).length;
    const regulo = reguloj.get(rule);
    checks.push({
      rule,
      ...(regulo === undefined ? {} : { regulo }),
      fixed: !ADJUSTABLE_RULES.includes(rule),
      passed: count === 0,
      violations: count,
    });
  }

  // Hints: APCA (advisory), missed Aspiroj and other warnings, and steps that left their target.
  const hints = new Map<string, RaportoHint>();
  for (const issue of [...validation.warnings.filter(ours), ...evaluation.warnings.filter(ours)]) {
    const { subject } = combinationOf(packageRelative(issue.path, prefix));
    const message = issue.message.replace(/ in [a-z-]+=[^ ]*(,[a-z-]+=[^ ,]*)*/, "");
    const key = `${issue.rule}|${subject}|${message}`;
    const known = hints.get(key);
    if (known !== undefined) known.combinations += 1;
    else hints.set(key, { rule: issue.rule, subject, message, combinations: 1 });
  }
  for (const step of [...input.palettes.steps, ...input.palettes.overrides]) {
    if (step.onTarget && step.toneKept) continue;
    const token = `color.palette.${step.palette}.${step.step}`;
    hints.set(`tone|${token}|${step.mode}`, {
      rule: "agordilo-tone",
      subject: `${token} (${step.mode})`,
      message: step.toneKept
        ? `Keeps its tone and misses its target: ${step.achieved.toFixed(2)}:1 instead of ${step.target.toFixed(2)}:1.`
        : `Meets its target without its tone: chroma ${step.c.toFixed(4)} of ${step.requested.toFixed(4)}.`,
      combinations: 1,
    });
  }
  // Stage 2 (Spec 019 ①, G4): dangers no Regulo names, as hints.
  for (const hint of input.gestalt?.hints ?? []) {
    hints.set(`${hint.rule}|${hint.subject}`, { ...hint });
  }

  const passed = measurements.filter((measurement) => measurement.passed).length;
  const fixedCount = violations.filter((violation) => violation.fixed).length;
  const covered = violations.filter((violation) => violation.jugxo !== undefined).length;
  const raporto: Raporto = {
    aspekto: name,
    agordilo: AGORDILO_VERSION,
    summary: {
      exportable: issues.length === 0,
      pairs: { measured: measurements.length, passed, failed: measurements.length - passed },
      violations: {
        fixed: fixedCount,
        adjustable: violations.length - fixedCount,
        covered,
      },
      hints: hints.size,
    },
    checks,
    violations,
    jugxoj,
    palettes: stepsOf(input.palettes),
    kontrastParoj: pairsOf(modelo, measurements),
    hints: [...hints.values()],
  };
  return { raporto, issues };
}
