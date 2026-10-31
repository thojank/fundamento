// The thresholds and words of the take-over (Spec 036 Teil 4): data in kreilo.json › uebernahme,
// each group with its Kialo, read once. The steps never hold a number of their own.

import { readFileSync } from "node:fs";

export interface UebernahmeDatoj {
  leitfarbe: { hoch_ab_anteil: number; kialo: string };
  neutraltoene: {
    chroma_bis: number;
    grund_anteil_min: number;
    flaeche_anteil_min: number;
    hell_ab: number;
    getoent_ab: number;
    farbton_abweichung_max: number;
    /** Names of hue ranges, each up to (excluding) `bis` degrees. */
    farbtoene: { bis: number; name: string }[];
    kialo: string;
  };
  schrift: {
    stilworte: string[];
    kategorien: { wort: string; kategorie: string; allgemein?: boolean }[];
    kategorie_namen: Record<string, string>;
    ersatz: Record<string, string>;
    namensteil_min: number;
    kialo: string;
  };
  /** What counts as a shape, a shadow and a block in an image (bildformen.ts). */
  bild: {
    flaeche_min: number;
    flaeche_min_px: number;
    fuellung_min: number;
    knopf_hoehe_min_px: number;
    knopf_hoehe_max: number;
    knopf_seiten_min: number;
    knopf_seiten_max: number;
    kontrast_knopf: number;
    karte_min: number;
    kontrast_karte: number;
    schatten_zeilen_min: number;
    schatten_zeilen_max: number;
    schatten_dunkler_ab: number;
    schatten_dunkler_max: number;
    belegt_ab: number;
    luecke_min_px: number;
    kialo: string;
  };
  form: {
    /** The stage of a button's radius against its height, each up to (excluding) `bis`. */
    stufen: { bis: number; stufe: number }[];
    stufen_namen: Record<string, string>;
    eckig_bis_px: number;
    kialo: string;
  };
}

export const UEBERNAHME_URL = new URL("../../../data/kreilo.json", import.meta.url);
export const UEBERNAHME: UebernahmeDatoj = (
  JSON.parse(readFileSync(UEBERNAHME_URL, "utf8")) as { uebernahme: UebernahmeDatoj }
).uebernahme;
