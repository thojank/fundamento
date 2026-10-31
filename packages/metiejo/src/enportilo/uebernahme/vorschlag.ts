// The take-over from the material (Spec 036 Teil 4, Befunde 4.1 and 4.2): one proposal per step of
// the brand – lead colour, second colour, neutrals, font, form, elevation, density – each either a
// value with its provenance (which material, which feature, which share) and how sure it is, or open
// with a sentence that says why. No value without provenance (AC-13). The steps are modules of their
// own (one per step, `SCHRITTE`); this module holds the structure, the invariant and the assembly.
// Pure: the reading of the Enportilo comes in, the proposals go out.

import type { Agordo } from "@fundamento/agordilo";
import type { Bildo } from "../png.js";
import type { Propono } from "../rekono.js";
import type { Trovo } from "../trovo.js";

/** The steps of the take-over, in the order the person meets them. */
export const SCHRITT_IDS = [
  "leitfarbe",
  "zweitfarbe",
  "neutraltoene",
  "schrift",
  "form",
  "elevation",
  "dichte",
] as const;

export type SchrittId = (typeof SCHRITT_IDS)[number];

/**
 * Where a value comes from. `bild`, `pdf` and `link` are the material of Weg B (2.6); a font file
 * of the brand is `schriftdatei`, and a wish in the chat is `chat` with the wish as its feature
 * (D-S36-3.3-2): so the invariant holds for every source of a proposal.
 */
export type Quelle = "bild" | "pdf" | "link" | "schriftdatei" | "chat";

export interface Herkunft {
  quelle: Quelle;
  /** The uploaded file the value was read from. */
  datei?: string;
  /** The address of a page or stylesheet the value was read from. */
  adresse?: string;
  /** What in the material carries the value: an area, a line, an embedded font, a wish. */
  merkmal: string;
  /** Percent of the colour found (or of the area of an image) the feature covers. */
  anteil?: number;
}

export type Sicherheit = "hoch" | "mittel" | "niedrig";

export interface WertVorschlag {
  schritt: SchrittId;
  wert: unknown;
  herkunft: Herkunft;
  sicherheit: Sicherheit;
  /** The sentence for the person, in the words of the screen. */
  satz: string;
  /** What the proposal lays on the Agordo (the preview „Mit dem Vorschlag“ and „Übernehmen“). */
  agordo: Partial<Agordo>;
  /** Further features the value rests on (the surface beside the ground, a second font role). */
  weitere?: Herkunft[];
}

export interface OffenerVorschlag {
  schritt: SchrittId;
  offen: true;
  satz: string;
  /** Where the step will be measured instead, for the plan – not shown to the person. */
  verweis?: string;
}

export type Vorschlag = WertVorschlag | OffenerVorschlag;

export const istOffen = (vorschlag: Vorschlag): vorschlag is OffenerVorschlag =>
  "offen" in vorschlag && vorschlag.offen;

/** The material a reading came from: its source and its file or address. */
export interface Kunteksto {
  quelle: Exclude<Quelle, "chat">;
  datei?: string;
  adresse?: string;
}

/** What every step reads: the findings, the proposals of the recognition, the material. */
export interface SchrittEniro {
  trovoj: readonly Trovo[];
  /** `proponojOf` of the same findings: the recognition the steps build on. */
  proponoj: readonly Propono[];
  kunteksto: Kunteksto;
  /** The lead colour the neutrals are tinted towards when the material proposes none (the draft's). */
  leitfarbe?: string;
  /** The pixels of an image: form, elevation and density are read from its shapes (bildformen.ts). */
  bildo?: Bildo;
}

export interface Schritt {
  id: SchrittId;
  /** The Faceto of the brand model the step belongs to. */
  faceto: string;
  /** The step builds the proposal of its Faceto itself (it replaces the one of the recognition). */
  eigen: boolean;
  vorschlagOf(eniro: SchrittEniro): Vorschlag;
}

/** The source of a reading of the Enportilo, from its kind and its name (the file or the address). */
export function kuntekstoOf(rezulto: { kiel: "upload" | "link"; nomo: string }): Kunteksto {
  if (rezulto.kiel === "link") return { quelle: "link", adresse: rezulto.nomo };
  const name = rezulto.nomo.toLowerCase();
  const quelle = name.endsWith(".pdf")
    ? "pdf"
    : /\.(woff2?|ttf|otf)$/.test(name)
      ? "schriftdatei"
      : "bild";
  return { quelle, datei: rezulto.nomo };
}

/** A provenance at the file or address a finding names, in the source of the reading. */
export function herkunftOf(
  kunteksto: Kunteksto,
  dosiero: string | undefined,
  merkmal: string,
  anteil?: number,
): Herkunft {
  const where = dosiero ?? kunteksto.datei ?? kunteksto.adresse;
  const place =
    where === undefined
      ? {}
      : where.includes("://") || kunteksto.quelle === "link"
        ? { adresse: where }
        : { datei: where };
  return {
    quelle: kunteksto.quelle,
    ...place,
    merkmal,
    ...(anteil === undefined ? {} : { anteil }),
  };
}

/** Percent of the colour found that one colour covers, a whole number. */
export function anteilOf(trovoj: readonly Trovo[], hex: string): number | undefined {
  const colours = trovoj.filter((trovo) => trovo.kind === "farbo");
  const total = colours.reduce((sum, trovo) => sum + trovo.pezo, 0);
  const own = colours
    .filter((trovo) => String(trovo.valoro).toLowerCase() === hex.toLowerCase())
    .reduce((sum, trovo) => sum + trovo.pezo, 0);
  return total <= 0 || own <= 0 ? undefined : Math.round((100 * own) / total);
}

/**
 * The places where the invariant of 2.6 is broken, empty when it holds (AC-13): every step once and
 * in order; a value has a provenance with a source, a place (file or address, except a chat wish)
 * and a feature, a share between 0 and 100; an open step has a sentence.
 */
export function verletzungenOf(vorschlagoj: readonly Vorschlag[]): string[] {
  const found: string[] = [];
  const ids = vorschlagoj.map((vorschlag) => vorschlag.schritt);
  if (JSON.stringify(ids) !== JSON.stringify(SCHRITT_IDS))
    found.push(`Schritte ${ids.join(", ")} statt ${SCHRITT_IDS.join(", ")}`);
  for (const vorschlag of vorschlagoj) {
    if (istOffen(vorschlag)) {
      if (vorschlag.satz.trim() === "") found.push(`${vorschlag.schritt}: offen ohne Satz`);
      continue;
    }
    const herkunft = (vorschlag as Partial<WertVorschlag>).herkunft;
    if (herkunft === undefined) {
      found.push(`${vorschlag.schritt}: Wert ohne Herkunft`);
      continue;
    }
    if (herkunft.merkmal.trim() === "") found.push(`${vorschlag.schritt}: Herkunft ohne Merkmal`);
    if (
      herkunft.quelle !== "chat" &&
      herkunft.datei === undefined &&
      herkunft.adresse === undefined
    )
      found.push(`${vorschlag.schritt}: Herkunft ohne Datei oder Adresse`);
    if (herkunft.anteil !== undefined && !(herkunft.anteil >= 0 && herkunft.anteil <= 100))
      found.push(`${vorschlag.schritt}: Anteil ${herkunft.anteil}`);
    if (vorschlag.satz.trim() === "") found.push(`${vorschlag.schritt}: Wert ohne Satz`);
  }
  return found;
}

/** The provenance as the proposal store and the screen name it: the file, then feature and share. */
export function herkunftTekstoOf(herkunft: Herkunft): { dosiero: string; loko: string } {
  return {
    dosiero: herkunft.datei ?? herkunft.adresse ?? (herkunft.quelle === "chat" ? "Chat" : ""),
    loko: `${herkunft.merkmal}${herkunft.anteil === undefined ? "" : `, ${herkunft.anteil} %`}`,
  };
}

/** The order of the proposals of the recognition (rekono.ts), elevation after density. */
const ORDER = ["gvidkoloro", "neutralaj", "statoj", "tiparo", "formo", "spaco", "elevacio"];

/** A proposal of the store with the proposals per step it carries (Spec 036 Teil 4). */
export type ProponoKunVorschlagoj = Propono & { vorschlagoj?: WertVorschlag[] };

/**
 * The proposals per Faceto for the store and the preview frames (D-04, the `propono` route): the
 * Facetoj whose step builds its own proposal get it from that step (or none when it is open); the
 * others keep the proposal of the recognition. Every proposal carries the steps' values it rests on.
 */
export function proponojKunVorschlagoj(
  proponoj: readonly Propono[],
  vorschlagoj: readonly Vorschlag[],
  schritte: readonly Schritt[],
): ProponoKunVorschlagoj[] {
  const eigen = new Set(schritte.filter((schritt) => schritt.eigen).map((s) => s.faceto));
  const facetoOf = new Map(schritte.map((schritt) => [schritt.id, schritt.faceto]));
  const values = vorschlagoj.filter(
    (vorschlag): vorschlag is WertVorschlag => !istOffen(vorschlag),
  );
  const ofFaceto = (faceto: string) =>
    values.filter((vorschlag) => facetoOf.get(vorschlag.schritt) === faceto);
  const result: ProponoKunVorschlagoj[] = proponoj
    .filter((propono) => !eigen.has(propono.faceto))
    .map((propono) => {
      const own = ofFaceto(propono.faceto);
      return own.length === 0 ? { ...propono } : { ...propono, vorschlagoj: own };
    });
  for (const faceto of eigen) {
    const own = ofFaceto(faceto);
    if (own.length === 0) continue;
    result.push({
      faceto,
      agordo: Object.assign({}, ...own.map((vorschlag) => vorschlag.agordo)) as Partial<Agordo>,
      satz: own.map((vorschlag) => vorschlag.satz).join(" "),
      herkunft: own.flatMap((vorschlag) =>
        [vorschlag.herkunft, ...(vorschlag.weitere ?? [])].map(herkunftTekstoOf),
      ),
      vorschlagoj: own,
    });
  }
  const rank = (faceto: string) => {
    const index = ORDER.indexOf(faceto);
    return index === -1 ? ORDER.length : index;
  };
  return result.sort((a, b) => rank(a.faceto) - rank(b.faceto));
}
