// The sliders of the Agordo as one list (Spec 019 ②, G7; ③, G6): stage 1 (Spec 016) and stage 2
// with the group of the Werkstatt's panel, a German label, the range and the standard. The panel,
// the history, the suggestion bar and propose_agordo name a movement from this list, so it reads
// the same everywhere. Pure.

import type { Agordo } from "./agordo.js";
import {
  BEDIENFORM_LABEL,
  BEDIENFORM_PATH,
  bedienformOf,
  type GestaltBasis,
  gestaltSliders,
  withBedienform,
} from "./gestalt.js";

export type ReglerGroup = "farbe" | "form" | "raum" | "schrift";

export interface Regler {
  /** The dotted path in the Agordo (`regler.saettigung`, `form.radius` …). */
  path: string;
  group: ReglerGroup;
  label: string;
  min: number;
  max: number;
  standard: number;
  step: number;
  /** The stop past the end of the slider: a choice the slider reaches beyond its max (V-3). */
  ende?: { path: string; wert: string; label: string };
}

const STAGE1: readonly Regler[] = [
  {
    path: "neutral.toenung",
    group: "farbe",
    label: "Neutral-Tönung",
    min: 0,
    max: 1,
    standard: 0,
    step: 0.01,
  },
  {
    path: "regler.helligkeit",
    group: "farbe",
    label: "Helligkeit",
    min: -1,
    max: 1,
    standard: 0,
    step: 0.01,
  },
  {
    path: "regler.kontrast",
    group: "farbe",
    label: "Kontrast",
    min: -1,
    max: 1,
    standard: 0,
    step: 0.01,
  },
  {
    path: "regler.saettigung",
    group: "farbe",
    label: "Sättigung",
    min: 0,
    max: 2,
    standard: 1,
    step: 0.01,
  },
];

const LABELS: Readonly<Record<string, string>> = {
  "form.radius": "Radius",
  "form.rahmen": "Rahmen",
  "form.schatten": "Schatten",
  "raum.abstand": "Abstand",
  "raum.hoehe": "Höhe",
  "schrift.groesse": "Schriftgröße",
  "schrift.skala": "Skala",
  "schrift.gewicht": "Schriftgewicht",
};

/** The icon weight: no slider, a choice; named in a diff like one. */
export const IKONO_PATH = "ikono.gewicht";
export const IKONO_LABEL = "Icon-Gewicht";

/** The value of a choice the sliders name (the icon weight, the form of the controls). */
export function wahlValue(agordo: Agordo, path: string): string | undefined {
  if (path === BEDIENFORM_PATH) return bedienformOf(agordo);
  if (path === IKONO_PATH) return agordo.ikono?.gewicht ?? "regular";
  return undefined;
}

const ENDE: Readonly<Record<string, Regler["ende"]>> = {
  "form.radius": { path: BEDIENFORM_PATH, wert: "pille", label: "Pille" },
};

/** Every slider of the Agordo, in the order of the panel. */
export function reglerOf(basis: GestaltBasis): Regler[] {
  return [
    ...STAGE1,
    ...gestaltSliders(basis).map((slider) => {
      const ende = ENDE[slider.path];
      return {
        path: slider.path,
        group: slider.path.split(".")[0] as ReglerGroup,
        label: LABELS[slider.path] ?? slider.path,
        min: slider.min,
        max: slider.max,
        standard: slider.standard,
        step: slider.step,
        ...(ende === undefined ? {} : { ende }),
      };
    }),
  ];
}

type Groups = Record<string, Record<string, unknown> | undefined>;

/** The value of a slider in an Agordo; its standard where the Agordo names none. */
export function reglerValue(agordo: Agordo, regler: Regler): number {
  const [group = "", key = ""] = regler.path.split(".");
  const value = (agordo as unknown as Groups)[group]?.[key];
  return typeof value === "number" ? value : regler.standard;
}

/**
 * The Agordo with a slider set, or taken back to its standard (`undefined`): the field goes, and
 * a group that is empty then goes with it (W-8). Works for `ikono.gewicht` and the form of the
 * controls (`form.bedienelemente`, V-3) as well.
 */
export function withRegler(
  agordo: Agordo,
  path: string,
  value: number | string | undefined,
): Agordo {
  if (path === BEDIENFORM_PATH)
    return withBedienform(agordo, value === "pille" ? "pille" : "radius");
  const [group = "", key = ""] = path.split(".");
  const next = structuredClone(agordo) as unknown as Groups;
  const own = { ...(next[group] ?? {}) };
  if (value === undefined) delete own[key];
  else own[key] = value;
  if (Object.keys(own).length === 0) delete next[group];
  else next[group] = own;
  return next as unknown as Agordo;
}

export interface ReglerDiff {
  path: string;
  label: string;
  vorher: number | string;
  nachher: number | string;
}

/** Every slider that moves from one Agordo to the other, before → after; the lead colour and the icon weight. */
export function reglerDiff(before: Agordo, after: Agordo, basis: GestaltBasis): ReglerDiff[] {
  const diff: ReglerDiff[] = [];
  for (const regler of reglerOf(basis)) {
    const vorher = reglerValue(before, regler);
    const nachher = reglerValue(after, regler);
    if (vorher !== nachher) diff.push({ path: regler.path, label: regler.label, vorher, nachher });
  }
  if (before.leitfarbe !== after.leitfarbe) {
    diff.unshift({
      path: "leitfarbe",
      label: "Leitfarbe",
      vorher: before.leitfarbe,
      nachher: after.leitfarbe,
    });
  }
  if (bedienformOf(before) !== bedienformOf(after)) {
    diff.push({
      path: BEDIENFORM_PATH,
      label: BEDIENFORM_LABEL,
      vorher: bedienformOf(before),
      nachher: bedienformOf(after),
    });
  }
  const weight = (agordo: Agordo) => agordo.ikono?.gewicht ?? "regular";
  if (weight(before) !== weight(after)) {
    diff.push({
      path: IKONO_PATH,
      label: IKONO_LABEL,
      vorher: weight(before),
      nachher: weight(after),
    });
  }
  return diff;
}

/** A number the German way: comma, at least one decimal, the minus sign. */
export function deutscheZahl(value: number): string {
  const text = value.toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 3,
  });
  return text.replace("-", "−");
}

/** The line of the suggestion bar (G7): „Vorgeschlagen: ruhiger (Sättigung 1,0 → 0,8, …)“. */
export function vorschlagSatz(wunsch: string | undefined, diff: readonly ReglerDiff[]): string {
  if (diff.length === 0) return "Vorgeschlagen: keine Bewegung";
  const value = (entry: number | string) =>
    typeof entry === "number" ? deutscheZahl(entry) : entry;
  const moves = diff.map(
    (entry) => `${entry.label} ${value(entry.vorher)} → ${value(entry.nachher)}`,
  );
  return `Vorgeschlagen: ${wunsch === undefined || wunsch === "" ? "" : `${wunsch} `}(${moves.join(", ")})`;
}

/** What a link of propose_agordo carries in `#vorschlag=…` (deflate-raw, base64url, like `#agordo=`). */
export interface Vorschlag {
  /** The wish the movement came from, as said (ruhiger, runder und luftiger …). */
  wunsch?: string;
  /** The proposed Agordo; the Werkstatt shows the movement from the current one to it. */
  agordo: Agordo;
}
