// The report in plain words (Spec 023, §3 step 3 and 7): what is good, what the derivation
// adjusted, every problem with exactly one suggestion — from the structured Raporto of the
// Agordilo, never from its prose. The terms of the Vortaro stay in the Expertenansicht; here a
// rule has a German name and a pair is "ein Kontrastpaar". Pure.

import type { AgordoPatch, Raporto, RaportoViolation } from "@fundamento/agordilo";
import { deutscheZahl } from "@fundamento/agordilo";

export interface Problemo {
  /** The problem in one sentence. */
  satz: string;
  /** Exactly one suggestion (G6 of Spec 016). */
  vorschlag: string;
  /** The suggestion as a change of the Agordo, where it is one: a click applies it. */
  apply?: AgordoPatch;
  /** A fixed rule locks the save and the export; an adjustable one needs a Jugxo. */
  fest: boolean;
  /** The rule, for the Expertenansicht. */
  regulo: string;
}

export interface Klartext {
  exportable: boolean;
  gut: string[];
  angepasst: string[];
  probleme: Problemo[];
  /** An adjustable rule is violated without a Jugxo: the Expertenansicht records one. */
  jugxoNoetig: boolean;
}

/** German names of the rules the Raporto lists (the rule itself stays in the Expertenansicht). */
const RULE_NAMES: Readonly<Record<string, string>> = {
  "contrast-below-threshold": "Zu wenig Kontrast",
  "contrast-reserve": "Kontrast ohne Reserve",
  "text-hierarchy": "Textstufen nicht unterscheidbar",
  "state-distinct": "Zustände nicht unterscheidbar",
  "surface-order": "Flächen in falscher Reihenfolge",
  "surface-distinct": "Flächen nicht unterscheidbar",
  "palette-even": "Farbstufen ungleichmäßig",
  "palette-aligned": "Farbreihen nicht angeglichen",
  "focus-ring": "Fokusring nicht sichtbar",
  gamut: "Farbe außerhalb des Farbraums",
};

const SLIDER_NAMES: Readonly<Record<string, string>> = {
  helligkeit: "Helligkeit",
  kontrast: "Kontrast",
  saettigung: "Sättigung",
};

const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

/** The suggestion of a violation as a German sentence: from its patch where it has one, else as the Agordilo says it. */
export function vorschlagOf(violation: RaportoViolation): string {
  const patch = violation.apply;
  if (patch === undefined) return violation.suggestion;
  const parts: string[] = [];
  if (patch.leitfarbe !== undefined) parts.push(`Leitfarbe ${patch.leitfarbe}`);
  if (patch.neutral?.toenung !== undefined)
    parts.push(`Neutral-Tönung auf ${deutscheZahl(patch.neutral.toenung)}`);
  for (const [key, value] of Object.entries(patch.regler ?? {})) {
    if (typeof value === "number")
      parts.push(`${SLIDER_NAMES[key] ?? key} auf ${deutscheZahl(value)}`);
  }
  for (const [step, target] of Object.entries(patch.ziele ?? {})) {
    if (target === null) parts.push(`Ziel für ${step} zurücknehmen`);
    else {
      const modes = Object.entries(target)
        .filter(([, v]) => typeof v === "number")
        .map(([mode, v]) => `${mode} ${deutscheZahl(v as number)}`);
      parts.push(`Ziel für ${step} auf ${modes.join(" und ")}`);
    }
  }
  return parts.length === 0 ? violation.suggestion : `${parts.join(", ")} setzen.`;
}

/** The combination a violation names, reduced to what a person switches: hell/dunkel, hoher Kontrast. */
export function kombinationSatz(combination: string | undefined): string {
  if (combination === undefined) return "";
  const parts: string[] = [];
  for (const entry of combination.split(",")) {
    const [key, value] = entry.split("=");
    if (key === "color-scheme") parts.push(value === "dark" ? "dunkel" : "hell");
    if (key === "contrast" && value === "high") parts.push("hoher Kontrast");
  }
  return parts.length === 0 ? "" : ` (${parts.join(", ")})`;
}

/** The problem of a violation in one sentence. */
export function satzOf(violation: RaportoViolation): string {
  const name = RULE_NAMES[violation.rule] ?? violation.rule;
  return `${name} bei ${violation.subject}${kombinationSatz(violation.combination)}.`;
}

/** The Raporto in plain words. */
export function klartextOf(raporto: Raporto): Klartext {
  const { summary } = raporto;
  const gut: string[] = [];
  const angepasst: string[] = [];
  const { measured, passed, failed } = summary.pairs;
  gut.push(
    failed === 0
      ? `Alle ${measured} Kontrastpaare bestehen in jeder Kombination.`
      : `${passed} von ${measured} Kontrastpaaren bestehen; ${plural(failed, "fällt", "fallen")} durch.`,
  );
  const checks = raporto.checks.filter((check) => check.passed).length;
  gut.push(
    checks === raporto.checks.length
      ? `Alle ${raporto.checks.length} Prüfungen bestanden.`
      : `${checks} von ${raporto.checks.length} Prüfungen bestanden.`,
  );
  const chroma = raporto.palettes.filter((step) => step.chroma.kept < step.chroma.requested).length;
  if (chroma > 0) {
    angepasst.push(
      `Die Sättigung von ${plural(chroma, "Farbstufe", "Farbstufen")} wurde gesenkt, damit der Kontrast stimmt.`,
    );
  }
  const tone = raporto.palettes.filter((step) => !step.toneKept).length;
  if (tone > 0) {
    angepasst.push(
      `${plural(tone, "Farbstufe wurde", "Farbstufen wurden")} im Farbton verschoben, um das Ziel zu erreichen.`,
    );
  }
  const overridden = raporto.palettes.filter((step) => step.overridden === true).length;
  if (overridden > 0)
    angepasst.push(
      `${plural(overridden, "Farbstufe hat", "Farbstufen haben")} ein eigenes Kontrastziel.`,
    );
  if (raporto.hints.length > 0) {
    angepasst.push(
      `${plural(raporto.hints.length, "Hinweis", "Hinweise")} (Lesbarkeit nach APCA, Ziele, Ton) stehen im vollständigen Bericht der Expertenansicht.`,
    );
  }
  if (raporto.jugxoj.length > 0) {
    angepasst.push(
      `${plural(raporto.jugxoj.length, "Abweichung ist", "Abweichungen sind")} mit Begründung festgehalten.`,
    );
  }
  const probleme: Problemo[] = raporto.violations.map((violation) => ({
    satz: satzOf(violation),
    vorschlag: vorschlagOf(violation),
    ...(violation.apply === undefined ? {} : { apply: violation.apply }),
    fest: violation.fixed,
    regulo: violation.rule,
  }));
  return {
    exportable: summary.exportable,
    gut,
    angepasst,
    probleme,
    jugxoNoetig: raporto.violations.some((v) => !v.fixed && v.jugxo === undefined),
  };
}
