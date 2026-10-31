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
  /** The feature, from the place the finding names (a share, a line, an embedded font). */
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
  const herkunft: Herkunft = herkunftOf(
    eniro.kunteksto,
    first.dosiero,
    spec.merkmalOf(propono, first.loko),
    anteil,
  );
  const weitere = propono.herkunft
    .slice(1)
    .map((entry) =>
      herkunftOf(eniro.kunteksto, entry.dosiero, spec.merkmalOf(propono, entry.loko)),
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
