// The data of the Kreilo (Spec 033 S3; Spec 035, Befund 4.2; Spec 036, Befund 2.1): kreilo.json
// with its pairs of opposites, the anchors of the lead colour, the font rules, the thresholds of the
// accent and of an achromatic brand. Its own module, so that the Enportilo (rekono.ts) reads the
// thresholds without importing the Kreilo, which imports the Enportilo.

import { readFileSync } from "node:fs";

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
  /**
   * Spec 036, Befund 2.1 (V-1): when the material of a brand is achromatic – very dark neutrals
   * carry it, strong colours stay a small share – and its lead colour a very dark neutral.
   */
  unbunt: {
    /** OKLCH chroma below which a tone is neutral (the Agordilo's ACHROMATIC). */
    neutral_bis: number;
    /** OKLCH lightness up to which a neutral tone is very dark. */
    dunkel_bis: number;
    /** Percent of the colour found that the very dark neutrals cover at least. */
    dunkel_anteil_min: number;
    /** OKLCH chroma from which a tone counts as colourful (as akzent.chroma_min). */
    bunt_ab: number;
    /** OKLCH lightness from which a colourful tone is a pastel, not a strong colour. */
    pastell_ab: number;
    /** Percent of the colour found that strong colours (colourful, not pastel) cover less than. */
    bunt_anteil_max: number;
    kialo: string;
  };
}

export const KREILO_URL = new URL("../../data/kreilo.json", import.meta.url);
export const KREILO: KreiloDatoj = JSON.parse(readFileSync(KREILO_URL, "utf8")) as KreiloDatoj;
