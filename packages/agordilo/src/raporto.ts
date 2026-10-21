// The Raporto (Spec 016, G5): the result of every check of a derived Aspekto — per rule and per
// pair passed or not, the value and the threshold — and every violation with its cause and one
// suggestion (G6). It ships in the package as raporto.json and raporto.md; both are a function of
// the Agordo and the package files only, so `fm agordilo check` can rebuild them byte for byte.
// Pure.

export interface RaportoSummary {
  /** No fixed rule violated, every adjustable violation covered by a Jugxo, the Agordo sound. */
  exportable: boolean;
  /** Pair × combination evaluations of the Aspekto (WCAG 2.x, binding). */
  pairs: { measured: number; passed: number; failed: number };
  violations: { fixed: number; adjustable: number; covered: number };
  hints: number;
}

/**
 * A change of the Agordo a suggestion amounts to (Spec 016 ②, G6, G7): what a click in the
 * Werkstatt or an agent over preview_agordo applies without parsing prose. A target set to null
 * takes an override back.
 */
export interface AgordoPatch {
  leitfarbe?: string;
  neutral?: { toenung: number };
  regler?: { helligkeit?: number; kontrast?: number; saettigung?: number };
  ziele?: Record<string, { hell?: number; dunkel?: number } | null>;
}

export interface RaportoStep {
  token: string;
  mode: "light" | "dark";
  hex: string;
  /** Target and achieved contrast against the reference surface of the mode. */
  target: number;
  achieved: number;
  /** Present when the Agordo overrides the target of this step (ziele, Spec 016 ②). */
  overridden?: true;
  /** Present when the Studio set the value of this step (festgelegt, Spec 024): kept, not derived. */
  gesetzt?: true;
  onTarget: boolean;
  toneKept: boolean;
  chroma: { requested: number; kept: number };
}

export interface RaportoPair {
  pair: string;
  kategorio: string;
  /** The first combination with this result; `combinations` counts all of them. */
  combination: string;
  combinations: number;
  value: number;
  threshold?: number;
  passed: boolean;
  /** The pair that carries the result when the main pair fails (aux). */
  branch: "main" | "aux" | null;
  apca?: { value: number; threshold?: number; passed?: boolean };
}

export interface RaportoCheck {
  rule: string;
  regulo?: { id: string; name: string };
  fixed: boolean;
  passed: boolean;
  violations: number;
}

export interface RaportoViolation {
  rule: string;
  regulo?: { id: string; name: string };
  /** A fixed rule refuses the export; an adjustable one needs a Jugxo (G6). */
  fixed: boolean;
  /** The pair or token the violation is about. */
  subject: string;
  path: string;
  combination?: string;
  message: string;
  /** Why the derivation could not meet the rule (G6.1). */
  cause: string;
  /** Exactly one suggestion (G6.1). */
  suggestion: string;
  /** The suggestion as a change of the Agordo, where it is one (Spec 016 ②). */
  apply?: AgordoPatch;
  /** The Jugxo that records the deviation, for an adjustable rule. */
  jugxo?: string;
}

export interface RaportoHint {
  rule: string;
  subject: string;
  message: string;
  combinations: number;
}

export interface RaportoJugxo {
  id: string;
  regulo: string;
  kialo: string;
  date: string;
  name: string;
  covers: number;
}

export interface Raporto {
  aspekto: string;
  agordilo: string;
  summary: RaportoSummary;
  checks: RaportoCheck[];
  violations: RaportoViolation[];
  jugxoj: RaportoJugxo[];
  palettes: RaportoStep[];
  kontrastParoj: RaportoPair[];
  hints: RaportoHint[];
}

/** The bytes of raporto.json: 2-space JSON in the order the report is built, trailing newline. */
export function serializeRaporto(raporto: Raporto): string {
  return `${JSON.stringify(raporto, null, 2)}\n`;
}

const cell = (text: string): string => text.replaceAll("|", "\\|").replaceAll("\n", " ");
const ratio = (value: number): string => `${value.toFixed(2)}:1`;

/** The readable report (raporto.md). */
export function renderRaportoMd(raporto: Raporto): string {
  const { summary } = raporto;
  const lines: string[] = [
    `# Raporto – ${raporto.aspekto}`,
    "",
    `Derived by the Agordilo ${raporto.agordilo} (Spec 016). Generated with the package; do not edit — \`fm agordilo check\` rebuilds it.`,
    "",
    "## Summary",
    "",
    `- Export: **${summary.exportable ? "allowed" : "refused"}**`,
    `- KontrastParoj: ${summary.pairs.passed} of ${summary.pairs.measured} evaluations pass (${summary.pairs.failed} fail)`,
    `- Violations: ${summary.violations.fixed} of fixed rules, ${summary.violations.adjustable} of adjustable rules (${summary.violations.covered} covered by a Jugxo)`,
    `- Hints (APCA, Aspiroj, tone): ${summary.hints}`,
    "",
    "## Checks",
    "",
    "| Rule | Kind | Result | Violations |",
    "|---|---|---|---|",
    ...raporto.checks.map(
      (check) =>
        `| ${check.rule} | ${check.fixed ? "fixed" : "adjustable"} | ${check.passed ? "passed" : "violated"} | ${check.violations} |`,
    ),
    "",
    "## Violations",
    "",
  ];
  if (raporto.violations.length === 0) {
    lines.push("None.", "");
  } else {
    for (const violation of raporto.violations) {
      lines.push(
        `### ${violation.rule} – ${violation.subject}`,
        "",
        `- Kind: ${violation.fixed ? "fixed (refuses the export)" : "adjustable (needs a Jugxo)"}${violation.jugxo === undefined ? "" : `, covered by ${violation.jugxo}`}`,
        ...(violation.combination === undefined ? [] : [`- Combination: ${violation.combination}`]),
        `- Finding: ${violation.message}`,
        `- Cause: ${violation.cause}`,
        `- Suggestion: ${violation.suggestion}`,
        "",
      );
    }
  }
  if (raporto.jugxoj.length > 0) {
    lines.push(
      "## Jugxoj",
      "",
      "| Jugxo | Regulo | Date | Name | Covers | Kialo |",
      "|---|---|---|---|---|---|",
      ...raporto.jugxoj.map(
        (jugxo) =>
          `| ${jugxo.id} | ${jugxo.regulo} | ${jugxo.date} | ${cell(jugxo.name)} | ${jugxo.covers} | ${cell(jugxo.kialo)} |`,
      ),
      "",
    );
  }
  lines.push(
    "## Palettes",
    "",
    "| Token | Mode | Value | Target | Achieved | On target | Tone kept | Chroma (asked → kept) |",
    "|---|---|---|---|---|---|---|---|",
    ...raporto.palettes.map(
      (step) =>
        `| ${step.token} | ${step.mode} | ${step.hex} | ${ratio(step.target)} | ${ratio(step.achieved)} | ${step.onTarget ? "yes" : "no"} | ${step.toneKept ? "yes" : "no"} | ${step.chroma.requested.toFixed(4)} → ${step.chroma.kept.toFixed(4)} |`,
    ),
    "",
    "## KontrastParoj (lowest value per pair)",
    "",
    "| Pair | Kategorio | Lowest | Threshold | Result | Combination |",
    "|---|---|---|---|---|---|",
  );
  // Per pair the worst entry: a failing one before a passing one, then the lowest value.
  const worse = (a: RaportoPair, b: RaportoPair): boolean =>
    a.passed !== b.passed ? !a.passed : a.value < b.value;
  const lowest = new Map<string, RaportoPair>();
  for (const pair of raporto.kontrastParoj) {
    const known = lowest.get(pair.pair);
    if (known === undefined || worse(pair, known)) lowest.set(pair.pair, pair);
  }
  for (const pair of lowest.values()) {
    lines.push(
      `| ${pair.pair} | ${pair.kategorio} | ${ratio(pair.value)} | ${pair.threshold === undefined ? "–" : ratio(pair.threshold)} | ${pair.passed ? "passed" : "failed"} | ${pair.combination} |`,
    );
  }
  lines.push("", "## Hints", "");
  if (raporto.hints.length === 0) lines.push("None.");
  for (const hint of raporto.hints) {
    lines.push(`- ${hint.rule} – ${hint.subject} (${hint.combinations}×): ${cell(hint.message)}`);
  }
  return `${lines.join("\n")}\n`;
}
