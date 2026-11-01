// The documentation fields of the Uzo (Spec 036 Teil 5 ③, Spec 029 ③). Every Ero page of the
// Vitrino shows nine sections; most come from data the Modelo holds already (purpose, Skemo,
// Ero-Tokens, Alirebleco, Jugxoj), three are written in the Uzo: when not (with the Ero to take
// instead), do and don't, the keyboard. Each text stands in German and English; a field whose
// text is not written yet holds the placeholder, which the schema accepts and check:dokumentaro
// reports. Pure: no I/O.

import type { Lingvo } from "../lingvo/tradukoj.js";

/** The documentation fields of the Uzo, in the order of the sections of the Ero page. */
export const DOKU_KAMPOJ = ["when-not", "do-dont", "keyboard"] as const;

export type DokuKampo = (typeof DOKU_KAMPOJ)[number];

/** A text in German and English (`UzoTexto`). */
export interface DokuTexto {
  de: string;
  en: string;
}

/**
 * The placeholder text of the run (Spec 036 ③): `{ "offen": DOKU_OFFEN }` stands in every field
 * whose text is not written yet, word for word, so a search finds every one.
 */
export const DOKU_OFFEN: Readonly<DokuTexto> = {
  de: "Offen: der Text folgt (Spec 036, Doku je Ero).",
  en: "Open: the text follows (Spec 036, docs per Ero).",
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Whether a field holds the placeholder (`{ "offen": … }`) instead of its text. */
export function isDokuOffen(value: unknown): boolean {
  return isObject(value) && "offen" in value;
}

/** The text in the language asked for; English when none is asked (as every Uzo text). */
export function dokuTextIn(text: DokuTexto, lingvo: Lingvo | undefined): string {
  return lingvo === "de" ? text.de : text.en;
}
