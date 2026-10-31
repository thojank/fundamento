// The score of a flow „ganzer Ablauf“ per screen (Spec 037, Lieferliste 2.2): K1–K6 from the
// injected scorer (C-3; in the measurement the nordstelo adapter over the unchanged `score()` with
// the weights of the Modelo catalogue, C-8), the navigation from ekranoj (D-05, C-4) and the
// patterns (D-06). Navigation and patterns are separate columns, never mixed into `total`; K7, the
// effort, is reported by the run beside the score. Pure apart from reading stored runs (D-33):
// the same facts give the same result (AC-11).
// Rot (S037-07): only the types; the functions arrive with the green commit.

import type { Fakto, Plano } from "@fundamento/ekranoj";

export interface StokitaKuro {
  plano: Plano;
  rondoj: Record<string, Record<string, Fakto>>;
}
