// The Kreilo (Spec 033 S3, Weg A): a new brand from the entry questions. The character as pairs of
// opposites moves the sliders of the Agordilo by the steps of kreilo.json (data with a Kialo per pair),
// clamped to each slider's range; a fixed font or the font rules of the character choose the families;
// the lead colour comes from what is fixed, else from the strongest colour of the inspiration, else
// from the anchors of the character. The result is an Agordo and, per Faceto it touched, where its
// value came from. A second, clearly different colour of the inspiration with a relevant share of the
// area becomes an accent proposal (Spec 035, Befund 4.2): proposed with its origin and recorded,
// never laid past the check. Pure apart from reading the data and the catalogue.

import { readFileSync } from "node:fs";
import {
  type Agordo,
  type OklchColor,
  parseAgordoColor,
  reglerOf,
  reglerValue,
  withRegler,
} from "@fundamento/agordilo";
import { type Propono, proponojOf } from "../enportilo/rekono.js";
import type { Herkunft, Trovo } from "../enportilo/trovo.js";
import { fontoOf, licencedFonto, readTiparoj, type Tiparoj } from "../tiparoj.js";
import type { Bases } from "../vorschau.js";

export interface KreiloParo {
  nomo: string;
  maldekstre: string;
  dekstre: string;
  bewegungen: { regler: string; schritt: number }[];
  kialo: string;
}

export interface KreiloDatoj {
  paroj: KreiloParo[];
  leitfarbe: {
    helligkeit: number;
    chroma: { basis: number; je_lebhaft: number; min: number; max: number };
    farbton: Record<string, number>;
    kialo: string;
  };
  tiparoj: { kiam: Record<string, string>; display: string; body: string; kialo: string }[];
  /** Spec 035, Befund 4.2: when a second colour of the inspiration becomes an accent proposal. */
  akzent: {
    /** OKLCH chroma from which a colour counts as strong (as for the lead colour). */
    chroma_min: number;
    /** Distance to the lead colour in the colour plane of OKLab (a, b; lightness left out). */
    abstand_min: number;
    /** Percent of the colour found that the accent and its near tones cover at least. */
    anteil_min: number;
    /** Tones up to this distance count as one colour (an image's buckets of one colour). */
    gleich_bis: number;
    kialo: string;
  };
}

export const KREILO_URL = new URL("../../data/kreilo.json", import.meta.url);
export const KREILO: KreiloDatoj = JSON.parse(readFileSync(KREILO_URL, "utf8")) as KreiloDatoj;

export interface KreiloEnigo {
  /** What the brand stands for and for whom, in the person's words. */
  celo?: string;
  /** Per pair (nomo) a value from −2 (left pole) to +2 (right pole). */
  karaktero?: Record<string, number>;
  festgelegt?: { farbe?: string; schrift?: string };
  /** The findings of the inspiration images (Enportilo). */
  inspiro?: readonly Trovo[];
}

/** The accent of the inspiration: a proposal of the step of the lead colour, with its measure. */
export interface KreiloAkzent extends Propono {
  /** #rrggbb as measured. */
  farbe: string;
  /** Percent of the colour found in the inspiration, whole numbers. */
  anteil: number;
  /** Distance to the lead colour in the colour plane of OKLab, three decimals. */
  abstand: number;
}

export interface KreiloRezulto {
  agordo: Agordo;
  /** Spec 035, Befund 4.2: the second colour of the inspiration, proposed, not set. */
  akzent?: KreiloAkzent;
  /** The Facetoj the proposal sets, in the order of the brand model. */
  facetoj: string[];
  herkunft: Partial<Record<string, Herkunft[]>>;
  satz: string;
}

const ORDER = ["gvidkoloro", "neutralaj", "tiparo", "formo", "spaco", "elevacio", "grandoj"];
const round3 = (value: number) => Math.round(value * 1000) / 1000;
const clampStep = (value: number) => Math.max(-2, Math.min(2, Math.round(value)));

/** Which Faceto a slider belongs to (the fields of facetoj.json, in short). */
const FACETO_OF_REGLER: Readonly<Record<string, string>> = {
  "neutral.toenung": "neutralaj",
  "regler.helligkeit": "neutralaj",
  "regler.kontrast": "neutralaj",
  "regler.saettigung": "gvidkoloro",
  "form.radius": "formo",
  "form.rahmen": "formo",
  "form.schatten": "elevacio",
  "raum.abstand": "spaco",
  "raum.hoehe": "grandoj",
  "schrift.groesse": "tiparo",
  "schrift.skala": "tiparo",
  "schrift.gewicht": "tiparo",
};

let catalogue: Tiparoj | undefined;
function fontOf(family: string) {
  catalogue ??= readTiparoj();
  const tiparo = catalogue.tiparoj.find(
    (entry) => entry.family.toLowerCase() === family.toLowerCase(),
  );
  return tiparo === undefined ? licencedFonto(family, ["Latn"]) : fontoOf(tiparo);
}

const matches = (rule: Record<string, string>, karaktero: Record<string, number>) =>
  Object.entries(rule).every(([nomo, condition]) => {
    const value = karaktero[nomo] ?? 0;
    return condition === ">0" ? value > 0 : condition === "<0" ? value < 0 : true;
  });

/** The character in words: every pair that is not in the middle, or the given ones. */
export const describeKaraktero = (
  karaktero: Record<string, number>,
  names?: readonly string[],
): string =>
  describe(
    karaktero,
    names ?? KREILO.paroj.map((paro) => paro.nomo).filter((nomo) => (karaktero[nomo] ?? 0) !== 0),
  );

const describe = (karaktero: Record<string, number>, names: readonly string[]): string =>
  names
    .map((nomo) => {
      const paro = KREILO.paroj.find((entry) => entry.nomo === nomo);
      const value = karaktero[nomo] ?? 0;
      if (paro === undefined) return "";
      return `${paro.maldekstre}–${paro.dekstre} ${value > 0 ? `+${value}` : value}${value === 0 ? "" : ` (${value > 0 ? paro.dekstre : paro.maldekstre})`}`;
    })
    .filter((text) => text !== "")
    .join(", ");

/** The distance of two colours in the colour plane of OKLab (a, b): hue and chroma, not lightness. */
export function farbAbstand(one: OklchColor, two: OklchColor): number {
  const plane = (colour: OklchColor) => {
    const radians = (colour.h * Math.PI) / 180;
    return [colour.c * Math.cos(radians), colour.c * Math.sin(radians)] as const;
  };
  const [a1, b1] = plane(one);
  const [a2, b2] = plane(two);
  return Math.hypot(a1 - a2, b1 - b2);
}

/**
 * The accent of the inspiration (Spec 035, Befund 4.2): the strongest colour – share times chroma,
 * as for the lead colour – that is strong, clearly different from the lead colour and covers a
 * relevant share of the colour found, its near tones counted with it; undefined when there is none.
 */
function akzentOf(inspiro: readonly Trovo[], leitfarbe: string): KreiloAkzent | undefined {
  const lead = parseAgordoColor(leitfarbe);
  if (lead === undefined) return undefined;
  const { chroma_min, abstand_min, anteil_min, gleich_bis } = KREILO.akzent;
  const colours = inspiro
    .filter((trovo) => trovo.kind === "farbo")
    .map((trovo) => ({ trovo, oklch: parseAgordoColor(String(trovo.valoro)) }))
    .filter((entry): entry is { trovo: Trovo; oklch: OklchColor } => entry.oklch !== undefined);
  const total = colours.reduce((sum, entry) => sum + entry.trovo.pezo, 0);
  if (total <= 0) return undefined;
  const candidates = colours
    .filter((entry) => entry.oklch.c >= chroma_min)
    .filter((entry) => farbAbstand(entry.oklch, lead) >= abstand_min)
    .map((entry) => {
      const near = colours.filter(
        (other) =>
          other.oklch.c >= chroma_min && farbAbstand(other.oklch, entry.oklch) <= gleich_bis,
      );
      const share = (100 * near.reduce((sum, other) => sum + other.trovo.pezo, 0)) / total;
      return { ...entry, share, herkunft: near.map((other) => other.trovo.herkunft).slice(0, 3) };
    })
    .filter((entry) => entry.share >= anteil_min)
    .sort((a, b) => b.share * b.oklch.c - a.share * a.oklch.c);
  const best = candidates[0];
  if (best === undefined) return undefined;
  const farbe = String(best.trovo.valoro);
  const anteil = Math.round(best.share);
  // D-PAK-4.2-1: the brand has one brand palette (from the lead colour), and the check refuses a
  // literal value on a semantic token (color-semantic-literal, fixed) – the accent is proposed and
  // recorded with its origin, not laid on the Agordo.
  return {
    faceto: "gvidkoloro",
    agordo: {},
    satz: `Akzent ${farbe}: die zweite kräftige Farbe deiner Inspiration (${anteil} % der Fläche), deutlich anders als die Leitfarbe ${leitfarbe} – noch nicht gesetzt, weil die Marke nur eine Markenpalette hat.`,
    herkunft: best.herkunft,
    farbe,
    anteil,
    abstand: Math.round(farbAbstand(best.oklch, lead) * 1000) / 1000,
  };
}

export function kreiloProponoj(input: KreiloEnigo, start: Agordo, bases: Bases): KreiloRezulto {
  const karaktero = Object.fromEntries(
    Object.entries(input.karaktero ?? {}).map(([nomo, value]) => [
      nomo,
      clampStep(Number(value) || 0),
    ]),
  );
  const regloj = reglerOf(bases.gestalt);
  const herkunft: Partial<Record<string, Herkunft[]>> = {};
  const touched = new Set<string>();
  const note = (faceto: string, entry: Herkunft) => {
    touched.add(faceto);
    herkunft[faceto] = [...(herkunft[faceto] ?? []), entry];
  };
  let agordo: Agordo = start;
  // The sliders: from the base of each, the steps of every pair, clamped to the range.
  const targets = new Map<string, { value: number; pairs: string[] }>();
  for (const paro of KREILO.paroj) {
    const step = karaktero[paro.nomo] ?? 0;
    if (step === 0) continue;
    for (const bewegung of paro.bewegungen) {
      const regler = regloj.find((entry) => entry.path === bewegung.regler);
      if (regler === undefined) continue;
      const target = targets.get(regler.path) ?? { value: reglerValue(start, regler), pairs: [] };
      target.value += step * bewegung.schritt;
      target.pairs.push(paro.nomo);
      targets.set(regler.path, target);
    }
  }
  for (const [path, target] of targets) {
    const regler = regloj.find((entry) => entry.path === path);
    if (regler === undefined) continue;
    agordo = withRegler(
      agordo,
      path,
      round3(Math.min(regler.max, Math.max(regler.min, target.value))),
    );
    note(FACETO_OF_REGLER[path] ?? "formo", {
      dosiero: "Einstiegsfragen",
      loko: describe(karaktero, [...new Set(target.pairs)]),
    });
  }
  // The lead colour: fixed, else the inspiration, else the character.
  const fixed = input.festgelegt?.farbe?.trim();
  const inspiration =
    input.inspiro === undefined || input.inspiro.length === 0
      ? undefined
      : proponojOf(input.inspiro, bases).find((propono) => propono.faceto === "gvidkoloro");
  if (fixed !== undefined && fixed !== "" && parseAgordoColor(fixed) !== undefined) {
    agordo = { ...agordo, leitfarbe: fixed };
    note("gvidkoloro", { dosiero: "Einstiegsfragen", loko: "festgelegte Farbe" });
  } else if (inspiration?.agordo.leitfarbe !== undefined) {
    agordo = { ...agordo, leitfarbe: inspiration.agordo.leitfarbe };
    for (const entry of inspiration.herkunft) note("gvidkoloro", entry);
  } else {
    const { helligkeit, chroma, farbton } = KREILO.leitfarbe;
    const warmth = karaktero["warm-kuehl"] ?? 0;
    const lively = karaktero["ruhig-lebhaft"] ?? 0;
    const c = Math.min(chroma.max, Math.max(chroma.min, chroma.basis + lively * chroma.je_lebhaft));
    agordo = {
      ...agordo,
      leitfarbe: `oklch(${helligkeit} ${round3(c)} ${farbton[String(warmth)] ?? 175})`,
    };
    note("gvidkoloro", {
      dosiero: "Einstiegsfragen",
      loko: describe(karaktero, ["warm-kuehl", "ruhig-lebhaft"]),
    });
  }
  // The families: fixed, else the first rule of the character that holds.
  const schrift = input.festgelegt?.schrift?.trim();
  if (schrift !== undefined && schrift !== "") {
    const fonto = fontOf(schrift);
    agordo = { ...agordo, schriften: { ...(agordo.schriften ?? {}), display: fonto, body: fonto } };
    note("tiparo", { dosiero: "Einstiegsfragen", loko: "festgelegte Schrift" });
  } else {
    const rule = KREILO.tiparoj.find((entry) => matches(entry.kiam, karaktero));
    if (rule !== undefined) {
      agordo = {
        ...agordo,
        schriften: {
          ...(agordo.schriften ?? {}),
          display: fontOf(rule.display),
          body: fontOf(rule.body),
        },
      };
      note("tiparo", {
        dosiero: "Einstiegsfragen",
        loko: `${describe(karaktero, Object.keys(rule.kiam)) || "ausgewogen"}: ${rule.kialo}`,
      });
    }
  }
  const facetoj = ORDER.filter((name) => touched.has(name));
  const akzent =
    input.inspiro === undefined || input.inspiro.length === 0
      ? undefined
      : akzentOf(input.inspiro, agordo.leitfarbe);
  const satz = `Vorschlag aus deinen Antworten${input.celo === undefined || input.celo.trim() === "" ? "" : ` („${input.celo.trim().slice(0, 80)}${input.celo.trim().length > 80 ? " …" : ""}“)`}: ${facetoj.length} Schritte gesetzt – sieh dir jeden an, passe ihn an und gib ihn frei.`;
  return { agordo, facetoj, herkunft, satz, ...(akzent === undefined ? {} : { akzent }) };
}
