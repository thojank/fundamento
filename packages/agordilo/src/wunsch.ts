// The prompt as a control (Spec 019 ③, G6, E3): a wish in words becomes movements of the sliders,
// from the wish vocabulary (data/wuensche.json) — data with a kialo per word, never a language
// model. The agent words it, the tool computes. A word the vocabulary does not know moves nothing;
// a movement stops at the end of its slider's range; with the checks of the library, it stops
// before a fixed rule (proposeAgordo). Pure, except proposeAgordo, which derives.

import type { Agordo } from "./agordo.js";
import { parseAgordoColor } from "./agordo.js";
import type { Calibration } from "./calibration.js";
import { type Derivation, deriveAspekto } from "./derive.js";
import type { GestaltBasis } from "./gestalt.js";
import {
  type ReglerDiff,
  reglerDiff,
  reglerOf,
  reglerValue,
  wahlValue,
  withRegler,
} from "./regler.js";
import type { Structure } from "./structure.js";

/**
 * A movement of a slider by a step, or of the lead colour's hue (`leitfarbe.ton`, degrees); or by
 * a number of its stops (`stufe`, Spec 035 V-3), where the vocabulary names stops for the slider.
 */
export interface Bewegung {
  regler: string;
  schritt?: number;
  stufe?: number;
}

/**
 * The stops of a slider (Spec 035, V-3) and the choice past the last one; `zurueck` is the stop a
 * step back from that choice lands on (Spec 036 Befund 1.2: from the pill to 2, not to the value the
 * slider held).
 */
export interface Stufen {
  werte: number[];
  danach?: { regler: string; wert: string; zurueck?: number };
  kialo?: string;
}

export interface WunschEintrag {
  /** The word in German, as the panel and the answers name it. */
  wort: string;
  de: string[];
  en: string[];
  bewegungen: Bewegung[];
  kialo: string;
  gegenteil?: string;
}

export interface Wuensche {
  description?: string;
  /** The hues the warm and the cool words turn towards (OKLCH degrees). */
  pole: { warm: number; kuehl: number };
  /** Per slider the stops a relative wish moves between (Spec 035, V-3). */
  stufen?: Record<string, Stufen>;
  wuensche: WunschEintrag[];
}

export const LEITFARBE_TON = "leitfarbe.ton";

/** Words that end like a comparative and are none (filler of a wish). */
const NOT_COMPARATIVE = new Set([
  "aber",
  "oder",
  "immer",
  "wieder",
  "unser",
  "unsere",
  "dieser",
  "jeder",
  "bitte",
  "other",
  "never",
  "after",
  "under",
  "over",
  "rather",
  "whether",
  "however",
]);

const round3 = (value: number): number => {
  const rounded = Math.round(value * 1000) / 1000;
  return rounded === 0 ? 0 : rounded;
};

/** The words of a text, lower case, letters only. */
function wordsOf(text: string): string[] {
  return text
    .normalize("NFC")
    .toLowerCase()
    .split(/[^\p{L}]+/u)
    .filter((word) => word.length > 0);
}

export interface ParsedWunsch {
  /** The entries a word of the wish names, in the order of the wish, each once. */
  treffer: WunschEintrag[];
  /** Words that look like a wish (a comparative) and that the vocabulary does not know. */
  unbekannt: string[];
}

/** Finds the known words of a wish, German and English alike (G6.1). */
export function parseWunsch(text: string, wuensche: Wuensche): ParsedWunsch {
  const treffer: WunschEintrag[] = [];
  const unbekannt: string[] = [];
  const words = wordsOf(text);
  for (const [index, word] of words.entries()) {
    const entry = wuensche.wuensche.find(
      (candidate) => candidate.de.includes(word) || candidate.en.includes(word),
    );
    if (entry !== undefined) {
      if (!treffer.includes(entry)) treffer.push(entry);
      continue;
    }
    const comparative =
      (word.length >= 5 && word.endsWith("er") && !NOT_COMPARATIVE.has(word)) ||
      words[index - 1] === "more";
    if (comparative && !unbekannt.includes(word)) unbekannt.push(word);
  }
  return { treffer, unbekannt };
}

/** The lead colour with its hue turned towards `pole` by `degrees`, never past it. */
function turnHue(leitfarbe: string, pole: number, degrees: number): string {
  const colour = parseAgordoColor(leitfarbe);
  if (colour === undefined) return leitfarbe;
  const distance = ((pole - colour.h + 540) % 360) - 180;
  const turn = Math.sign(distance) * Math.min(Math.abs(distance), degrees);
  const hue = (((colour.h + turn) % 360) + 360) % 360;
  return `oklch(${round3(colour.l)} ${Math.round(colour.c * 10_000) / 10_000} ${Math.round(hue * 10) / 10})`;
}

export interface ProponoEingabe {
  /** The wish as said (ruhiger, „runder und luftiger“, make it calmer …). */
  wunsch?: string;
  /** Explicit values of sliders by path (`form.radius`: 1.4), and `ikono.gewicht`. */
  regler?: Record<string, number | string>;
}

export interface Propono {
  agordo: Agordo;
  diff: ReglerDiff[];
  treffer: WunschEintrag[];
  unbekannt: string[];
  /** The kialo of every word that moved something (G6.1: „der Satz, der gegriffen hat“). */
  saetze: string[];
  /** Sliders that reached the end of their range. */
  amEnde: { path: string; grenze: number }[];
}

/** The movements of a wish and of explicit values, applied to an Agordo (no checks). */
export function proponoOf(
  agordo: Agordo,
  eingabe: ProponoEingabe,
  wuensche: Wuensche,
  basis: GestaltBasis,
): Propono {
  const regloj = reglerOf(basis);
  const { treffer, unbekannt } =
    eingabe.wunsch === undefined
      ? { treffer: [], unbekannt: [] }
      : parseWunsch(eingabe.wunsch, wuensche);
  let next = agordo;
  const amEnde: Propono["amEnde"] = [];
  const set = (path: string, value: number) => {
    const regler = regloj.find((entry) => entry.path === path);
    if (regler === undefined) return;
    const clamped = round3(Math.min(regler.max, Math.max(regler.min, value)));
    if (
      (clamped >= regler.max || clamped <= regler.min) &&
      !amEnde.some((entry) => entry.path === path)
    ) {
      amEnde.push({ path, grenze: clamped });
    }
    next = withRegler(next, path, clamped);
  };
  /**
   * One stop up or down (V-3): past the last stop the choice after it; back from it to the stop the
   * vocabulary names (Spec 036 Befund 1.2), else to the slider as it is.
   */
  const step = (path: string, stufen: Stufen, direction: number) => {
    const regler = regloj.find((entry) => entry.path === path);
    if (regler === undefined) return;
    const value = reglerValue(next, regler);
    const danach = stufen.danach;
    const beyond = danach !== undefined && wahlValue(next, danach.regler) === danach.wert;
    const at = (wert: number) => round3(Math.min(regler.max, Math.max(regler.min, wert)));
    if (direction > 0) {
      const higher = stufen.werte.find((wert) => wert > value + 1e-9);
      if (higher !== undefined) set(path, at(higher));
      else if (danach !== undefined && !beyond) next = withRegler(next, danach.regler, danach.wert);
      else if (!amEnde.some((entry) => entry.path === path))
        amEnde.push({ path, grenze: regler.max });
      return;
    }
    if (danach !== undefined && beyond) {
      next = withRegler(next, danach.regler, undefined);
      if (danach.zurueck !== undefined) set(path, at(danach.zurueck));
      return;
    }
    const lower = [...stufen.werte].reverse().find((wert) => wert < value - 1e-9);
    if (lower !== undefined) set(path, at(lower));
    else if (!amEnde.some((entry) => entry.path === path))
      amEnde.push({ path, grenze: regler.min });
  };
  for (const entry of treffer) {
    for (const bewegung of entry.bewegungen) {
      const stufen = wuensche.stufen?.[bewegung.regler];
      if (bewegung.stufe !== undefined && stufen !== undefined) {
        step(bewegung.regler, stufen, bewegung.stufe);
        continue;
      }
      const schritt = bewegung.schritt ?? 0;
      if (bewegung.regler === LEITFARBE_TON) {
        const pole = schritt >= 0 ? wuensche.pole.warm : wuensche.pole.kuehl;
        next = { ...next, leitfarbe: turnHue(next.leitfarbe, pole, Math.abs(schritt)) };
        continue;
      }
      const regler = regloj.find((candidate) => candidate.path === bewegung.regler);
      if (regler !== undefined) set(regler.path, reglerValue(next, regler) + schritt);
    }
  }
  for (const [path, value] of Object.entries(eingabe.regler ?? {})) {
    if (typeof value === "string") next = withRegler(next, path, value);
    else set(path, value);
  }
  return {
    agordo: next,
    diff: reglerDiff(agordo, next, basis),
    treffer,
    unbekannt,
    saetze: treffer.map((entry) => entry.kialo),
    amEnde,
  };
}

/** One entry of the history (W-26): the date, the wish or „Hand“, the sliders that moved. */
export interface HistorioEintrag {
  datum: string;
  wunsch: string;
  diff: { regler: string; vorher: number | string; nachher: number | string }[];
}

/** The entry for a save: from the Agordo before (or the structure, for a new one) to the one after. */
export function historioEintrag(
  before: Agordo | undefined,
  after: Agordo,
  wunsch: string | undefined,
  datum: string,
  basis: GestaltBasis,
): HistorioEintrag {
  const base: Agordo = before ?? { name: after.name, leitfarbe: after.leitfarbe };
  return {
    datum,
    wunsch: wunsch === undefined || wunsch.trim() === "" ? "Hand" : wunsch,
    diff: reglerDiff(base, after, basis).map(({ path, vorher, nachher }) => ({
      regler: path,
      vorher,
      nachher,
    })),
  };
}

/** The part `share` (0…1) of the way from one Agordo to the other, slider by slider. */
export function partOfTheWay(from: Agordo, to: Agordo, share: number, basis: GestaltBasis): Agordo {
  let next = from;
  for (const entry of reglerDiff(from, to, basis)) {
    if (entry.path === "leitfarbe") {
      const a = parseAgordoColor(String(entry.vorher));
      const b = parseAgordoColor(String(entry.nachher));
      if (a === undefined || b === undefined) continue;
      const distance = ((b.h - a.h + 540) % 360) - 180;
      const hue = (((a.h + distance * share) % 360) + 360) % 360;
      next = {
        ...next,
        leitfarbe: `oklch(${round3(a.l + (b.l - a.l) * share)} ${Math.round((a.c + (b.c - a.c) * share) * 10_000) / 10_000} ${Math.round(hue * 10) / 10})`,
      };
    } else if (typeof entry.vorher === "number" && typeof entry.nachher === "number") {
      next = withRegler(
        next,
        entry.path,
        round3(entry.vorher + (entry.nachher - entry.vorher) * share),
      );
    } else if (share >= 1) {
      next = withRegler(next, entry.path, entry.nachher);
    }
  }
  return next;
}

export interface ProposedAgordo extends Propono {
  derivation: Derivation;
  /** Where the movement stopped before a fixed rule (G6.2): the share of the way, the rules. */
  angehalten?: { anteil: number; regeln: string[] };
}

const fixedKeys = (derivation: Derivation): Set<string> =>
  new Set(
    derivation.raporto.violations
      .filter((violation) => violation.fixed)
      .map((violation) => `${violation.rule}|${violation.subject}|${violation.combination ?? ""}`),
  );

/**
 * proponoOf with the checks (G6.2, „hält vor der Regel an“): where the whole movement violates a
 * fixed rule the Agordo before did not violate, the half and then the quarter of the way are
 * tried, and the movement stops at the first that holds — or does not move at all. Derives two to
 * five times (about 1.7 s each).
 */
export function proposeAgordo(
  agordo: Agordo,
  eingabe: ProponoEingabe,
  wuensche: Wuensche,
  basis: GestaltBasis,
  structure: Structure,
  calibration: Calibration,
): ProposedAgordo {
  const propono = proponoOf(agordo, eingabe, wuensche, basis);
  const derivation = deriveAspekto(propono.agordo, structure, calibration);
  const target = fixedKeys(derivation);
  if (target.size === 0 || propono.diff.length === 0) return { ...propono, derivation };
  const before = fixedKeys(deriveAspekto(agordo, structure, calibration));
  const added = [...target].filter((key) => !before.has(key));
  if (added.length === 0) return { ...propono, derivation };
  const regeln = [...new Set(added.map((key) => key.split("|")[0] ?? ""))];
  for (const anteil of [0.5, 0.25]) {
    const partial = partOfTheWay(agordo, propono.agordo, anteil, basis);
    const tried = deriveAspekto(partial, structure, calibration);
    if ([...fixedKeys(tried)].every((key) => before.has(key))) {
      return {
        ...propono,
        agordo: partial,
        diff: reglerDiff(agordo, partial, basis),
        derivation: tried,
        angehalten: { anteil, regeln },
      };
    }
  }
  return {
    ...propono,
    agordo,
    diff: [],
    derivation: deriveAspekto(agordo, structure, calibration),
    angehalten: { anteil: 0, regeln },
  };
}
