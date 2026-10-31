// A step whose value the recognition of the Enportilo already proposes (rekono.ts): the value of that
// proposal with its first provenance, or the step open with a sentence. Pure.

import type { Propono } from "../rekono.js";
import {
  type Herkunft,
  herkunftOf,
  type SchrittEniro,
  type SchrittId,
  type Sicherheit,
  type Vorschlag,
} from "./vorschlag.js";

export interface AusPropono {
  schritt: SchrittId;
  faceto: string;
  /** The value of the step in the proposal's patch. */
  wertOf(propono: Propono): unknown;
  /** The feature, with the line of a style sheet where the finding names one. */
  merkmalOf(propono: Propono, loko: string | undefined): string;
  anteilOf?(propono: Propono, eniro: SchrittEniro): number | undefined;
  sicherheitOf(anteil: number | undefined): Sicherheit;
  /** The sentence when the material shows nothing of the step. */
  offenSatz(eniro: SchrittEniro): string;
}

export function vorschlagAusPropono(spec: AusPropono, eniro: SchrittEniro): Vorschlag {
  const propono = eniro.proponoj.find((entry) => entry.faceto === spec.faceto);
  const first = propono?.herkunft[0];
  if (propono === undefined || first === undefined)
    return { schritt: spec.schritt, offen: true, satz: spec.offenSatz(eniro) };
  const anteil = spec.anteilOf?.(propono, eniro);
  // The place of a link is a line; an image or a PDF names its share, which `anteil` carries.
  const ort = (loko: string | undefined) => (eniro.kunteksto.quelle === "link" ? loko : undefined);
  const herkunft: Herkunft = herkunftOf(
    eniro.kunteksto,
    first.dosiero,
    spec.merkmalOf(propono, ort(first.loko)),
    anteil,
  );
  const weitere = propono.herkunft
    .slice(1)
    .map((entry) =>
      herkunftOf(eniro.kunteksto, entry.dosiero, spec.merkmalOf(propono, ort(entry.loko))),
    );
  return {
    schritt: spec.schritt,
    wert: spec.wertOf(propono),
    herkunft,
    sicherheit: spec.sicherheitOf(anteil),
    satz: propono.satz,
    agordo: propono.agordo,
    ...(weitere.length === 0 ? {} : { weitere }),
  };
}
