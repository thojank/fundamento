// The take-over per step (Spec 036 Teil 4): the steps in their order and the reading of one material
// into one proposal per step plus the proposals per Faceto for the store (`propono` route, D-04).
// To add or replace a step: a module exporting a `Schritt`, listed here at its place in SCHRITT_IDS.

import type { Propono } from "../rekono.js";
import type { Trovo } from "../trovo.js";
import { DICHTE } from "./dichte.js";
import { ELEVATION } from "./elevation.js";
import { FORM } from "./form.js";
import { LEITFARBE } from "./leitfarbe.js";
import { NEUTRALTOENE } from "./neutraltoene.js";
import { SCHRIFT } from "./schrift.js";
import {
  istOffen,
  kuntekstoOf,
  type ProponoKunVorschlagoj,
  proponojKunVorschlagoj,
  type Schritt,
  type Vorschlag,
} from "./vorschlag.js";
import { ZWEITFARBE } from "./zweitfarbe.js";

export * from "./speicher.js";
export * from "./vorschlag.js";

export const SCHRITTE: readonly Schritt[] = [
  LEITFARBE,
  ZWEITFARBE,
  NEUTRALTOENE,
  SCHRIFT,
  FORM,
  ELEVATION,
  DICHTE,
];

export interface Uebernahme {
  /** One per step, in the order of SCHRITT_IDS. */
  vorschlagoj: Vorschlag[];
  /** The proposals per Faceto for the store, each with the steps' values it carries. */
  proponoj: ProponoKunVorschlagoj[];
}

/**
 * The take-over of one reading of the Enportilo: the proposals of the recognition (`proponojOf` of
 * the same findings) and the material it came from in, one proposal per step out.
 */
export function uebernahmeOf(
  rezulto: { trovoj: readonly Trovo[]; kiel: "upload" | "link"; nomo: string },
  proponoj: readonly Propono[],
  leitfarbe?: string,
): Uebernahme {
  const eniro = {
    trovoj: rezulto.trovoj,
    proponoj,
    kunteksto: kuntekstoOf(rezulto),
    ...(leitfarbe === undefined ? {} : { leitfarbe }),
  };
  const vorschlagoj = SCHRITTE.map((schritt) => schritt.vorschlagOf(eniro));
  return { vorschlagoj, proponoj: proponojKunVorschlagoj(proponoj, vorschlagoj, SCHRITTE) };
}

/** The sentences of the open steps of a Faceto: what its screen names as open (4.2). */
export function offeneSaetzeOf(vorschlagoj: readonly Vorschlag[], faceto: string): string[] {
  const ids = new Set(SCHRITTE.filter((s) => s.faceto === faceto).map((s) => s.id));
  return vorschlagoj
    .filter((vorschlag) => ids.has(vorschlag.schritt) && istOffen(vorschlag))
    .map((vorschlag) => vorschlag.satz);
}
