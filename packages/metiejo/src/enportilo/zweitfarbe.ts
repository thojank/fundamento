// The Zweitfarbe from the material (Spec 036, Befund 2.2, V-2; supersedes Spec 035 D-80): Weg A
// (the inspiration of the entry questions), Weg B (an uploaded image, PDF or a link) and Weg C (the
// rendered pages of a brand) set it when the material gives one – the strongest colour (share times
// chroma, as for the lead colour) that is strong, clearly apart from the lead colour and covers a
// relevant share of the colour found, its near tones counted with it. The thresholds are those of
// the accent of Spec 035, Befund 4.2 (kreilo.json › akzent, D-81), unchanged. The value is the
// Agordo field `zweitfarbe` with its origin (S36-2.3); otherwise it stays empty, and a colour that
// would have been one but lies too close to the lead colour is said in one sentence. Pure apart
// from the thresholds of kreilo.json.

import { type Agordo, type OklchColor, parseAgordoColor } from "@fundamento/agordilo";
import { KREILO } from "../kreilo/datoj.js";
import type { Herkunft, Trovo } from "./trovo.js";

type AgordoZweitfarbe = NonNullable<Agordo["zweitfarbe"]>;
type AgordoHerkunft = NonNullable<AgordoZweitfarbe["herkunft"]>;

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

/** The material gives a Zweitfarbe: the value for the Agordo and how it was measured. */
export interface ZweitfarbeGesetzt {
  /** #rrggbb as measured. */
  farbe: string;
  /** Percent of the colour found, its near tones counted with it, whole numbers. */
  anteil: number;
  /** Distance to the lead colour in the colour plane of OKLab, three decimals. */
  abstand: number;
  /** Where the colour stands in the material, up to three places. */
  herkunft: Herkunft[];
  /** The Agordo field, with the origin in the form of the Agordo (S36-2.3). */
  zweitfarbe: AgordoZweitfarbe;
  /** One sentence for the person. */
  satz: string;
}

/** The material gives none: why, in one sentence. */
export interface ZweitfarbeLeer {
  /**
   * `nah`: a strong colour with a relevant share lies too close to the lead colour (beside an
   * achromatic lead colour: too pale); `klein`: a strong, clearly different colour covers too small
   * a share; `keine`: the material has no second strong colour.
   */
  grund: "nah" | "klein" | "keine";
  /** The colour that was not taken (nah, klein). */
  farbe?: string;
  /** One sentence for the person. */
  satz: string;
  /** For `nah`: the clause the proposal of the lead colour carries, so the step says it. */
  teilsatz?: string;
}

export type ZweitfarbeBefund = ZweitfarbeGesetzt | ZweitfarbeLeer;

export const istGesetzt = (befund: ZweitfarbeBefund | undefined): befund is ZweitfarbeGesetzt =>
  befund !== undefined && "zweitfarbe" in befund;

/** Where a finding stands, in the form of the Agordo: a file of an image or a PDF. */
function agordoHerkunftOf(herkunft: Herkunft, farbe: string, anteil: number): AgordoHerkunft {
  const merkmal = `Farbe ${farbe}${herkunft.loko === undefined ? "" : ` (${herkunft.loko})`}`;
  const quelle = /\.pdf$/i.test(herkunft.dosiero) ? "pdf" : "bild";
  return { quelle, datei: herkunft.dosiero, merkmal, anteil };
}

/**
 * The Zweitfarbe of the material beside its lead colour; undefined when the material has no colour
 * or the lead colour is no colour. `woher` names the material in the sentence („deines Materials“,
 * „deiner Inspiration“).
 */
export function zweitfarbeOf(
  trovoj: readonly Trovo[],
  leitfarbe: string,
  woher = "deines Materials",
): ZweitfarbeBefund | undefined {
  const lead = parseAgordoColor(leitfarbe);
  if (lead === undefined) return undefined;
  const { chroma_min, abstand_min, anteil_min, gleich_bis } = KREILO.akzent;
  const colours = trovoj
    .filter((trovo) => trovo.kind === "farbo")
    .map((trovo) => ({ trovo, oklch: parseAgordoColor(String(trovo.valoro)) }))
    .filter((entry): entry is { trovo: Trovo; oklch: OklchColor } => entry.oklch !== undefined);
  const total = colours.reduce((sum, entry) => sum + entry.trovo.pezo, 0);
  if (total <= 0) return undefined;
  const strong = colours
    .filter((entry) => entry.oklch.c >= chroma_min)
    .map((entry) => {
      const near = colours.filter(
        (other) =>
          other.oklch.c >= chroma_min && farbAbstand(other.oklch, entry.oklch) <= gleich_bis,
      );
      const share = (100 * near.reduce((sum, other) => sum + other.trovo.pezo, 0)) / total;
      return {
        ...entry,
        share,
        abstand: farbAbstand(entry.oklch, lead),
        herkunft: near.map((other) => other.trovo.herkunft).slice(0, 3),
      };
    })
    .sort((a, b) => b.share * b.oklch.c - a.share * a.oklch.c);
  const best = strong.find((entry) => entry.abstand >= abstand_min && entry.share >= anteil_min);
  if (best !== undefined) {
    const farbe = String(best.trovo.valoro);
    const anteil = Math.round(best.share);
    const first = best.herkunft[0] ?? best.trovo.herkunft;
    return {
      farbe,
      anteil,
      abstand: Math.round(best.abstand * 1000) / 1000,
      herkunft: best.herkunft,
      zweitfarbe: { farbe, herkunft: agordoHerkunftOf(first, farbe, anteil) },
      satz: `Zweitfarbe ${farbe}: die zweite kräftige Farbe ${woher} (${anteil} % der gefundenen Farbe), deutlich anders als die Leitfarbe ${leitfarbe}.`,
    };
  }
  // Not taken, said why: a strong colour of its own relevant share (not counting its near tones –
  // the lead colour's shades are near it) that lies closer to the lead colour than abstand_min.
  // Beside an achromatic lead colour that distance is the colour's chroma: it is too pale.
  const nah = strong
    .filter((entry) => String(entry.trovo.valoro) !== leitfarbe && entry.abstand < abstand_min)
    .filter((entry) => (100 * entry.trovo.pezo) / total >= anteil_min)
    .sort((a, b) => b.trovo.pezo * b.oklch.c - a.trovo.pezo * a.oklch.c)[0];
  if (nah !== undefined) {
    const farbe = String(nah.trovo.valoro);
    const unbunt = lead.c < KREILO.unbunt.neutral_bis;
    return {
      grund: "nah",
      farbe,
      satz: unbunt
        ? `Keine Zweitfarbe: ${farbe} ist neben der unbunten Leitfarbe ${leitfarbe} zu blass, um als eigene Farbe zu wirken.`
        : `Keine Zweitfarbe: ${farbe} liegt zu nah an der Leitfarbe ${leitfarbe} – ein anderer Ton derselben Farbe, keine eigene.`,
      teilsatz: unbunt
        ? `keine Zweitfarbe, denn ${farbe} ist neben der unbunten Leitfarbe zu blass`
        : `keine Zweitfarbe, denn ${farbe} liegt zu nah an der Leitfarbe`,
    };
  }
  const klein = strong.find((entry) => entry.abstand >= abstand_min);
  if (klein !== undefined) {
    const farbe = String(klein.trovo.valoro);
    return {
      grund: "klein",
      farbe,
      satz: `Keine Zweitfarbe: ${farbe} deckt nur ${Math.round(klein.share)} % der gefundenen Farbe – zu wenig für eine eigene Farbe der Marke.`,
    };
  }
  return {
    grund: "keine",
    satz: `Keine Zweitfarbe: ${woher === "deiner Inspiration" ? "in deiner Inspiration" : "in deinem Material"} finde ich keine zweite kräftige Farbe.`,
  };
}

/** A proposal of the step of the lead colour (rekono.ts): what it lays, its sentence, its origin. */
interface LeitfarbePropono {
  agordo: Partial<Agordo>;
  satz: string;
  herkunft: Herkunft[];
}

/** Ends the first sentence of a text with `clause` before its full stop. */
const intoFirstSentence = (satz: string, clause: string) =>
  satz.replace(/\.(?=\s+[A-ZÄÖÜ]|$)/, `${clause}.`);

/**
 * The proposal of the lead colour with the Zweitfarbe of the same material (Weg B, Weg C): set, it
 * lays the field with its origin and the sentence names both colours; too close, the sentence says
 * why in a clause of its first sentence – the one the assistant shows. Otherwise unchanged (a colour
 * with too small a share is no news: status colours are small).
 */
export function mitZweitfarbe<P extends LeitfarbePropono>(
  propono: P,
  befund: ZweitfarbeBefund | undefined,
): P {
  if (istGesetzt(befund)) {
    const lead = propono.agordo.leitfarbe ?? "";
    const satz = intoFirstSentence(
      propono.satz.replace(`Leitfarbe ${lead}`, `Leitfarbe ${lead} und Zweitfarbe ${befund.farbe}`),
      `, dazu eine zweite, deutlich andere Farbe (${befund.anteil} %)`,
    );
    const herkunft = [
      ...propono.herkunft,
      ...befund.herkunft
        .slice(0, 1)
        .filter(
          (entry) =>
            !propono.herkunft.some(
              (known) => known.dosiero === entry.dosiero && known.loko === entry.loko,
            ),
        ),
    ];
    return {
      ...propono,
      agordo: { ...propono.agordo, zweitfarbe: befund.zweitfarbe },
      satz,
      herkunft,
    };
  }
  // Too close: the step says why in the sentence it shows (kurzsatzOf keeps the clause after „; “).
  if (befund !== undefined && "teilsatz" in befund && befund.teilsatz !== undefined)
    return { ...propono, satz: intoFirstSentence(propono.satz, `; ${befund.teilsatz}`) };
  return propono;
}
