// K8 „Erscheinung“ (Spec 038 Lauf 2, contract C-D): how close a rendered screen looks to
// Fundamento, per brand × scheme at contrast "default" (D-96). Pure: it reads only the stored K8
// facts of the renders, `facts.elements`, the Modelo's layout gaps (`listArangxoj(...).mankoj`)
// and its Sxablonoj with their region markers (`markerOf`, D-S038-12-1).
//
// Every Sollwert comes from the render's own probes (D-S038-11-1): the brand's font families,
// colours and spacing steps as the browser computed them from the brand's tokens. No value is
// written here: no family, colour, length or token path.

import type { ArangxoCelo, Modelo } from "@fundamento/modelo";
import type { Facts } from "../facts.js";

export type K8Merkmal = "ersatzschrift" | "nativaj" | "interspacoj" | "sxablono";

/** The features in report order. */
export const K8_MERKMALOJ: readonly K8Merkmal[] = [
  "ersatzschrift",
  "nativaj",
  "interspacoj",
  "sxablono",
];

/** K8 of one brand × scheme. */
export interface K8Kombinacio {
  aspekto: string;
  scheme: "light" | "dark";
  /** Hit shares 0–1, rounded to 4 places (D-99). */
  merkmaloj: Record<K8Merkmal, number>;
  /** Mean of the four features, 4 places. */
  kvoto: number;
  /** One German sentence per feature (and the font-source line, if any). */
  kialoj: { merkmal: K8Merkmal; teksto: string }[];
  /** A brand family is declared but not loaded (edge case D-101); the value stays computed. */
  nekomparebla?: "tiparo-ne-sxargita";
}

/** K8 of one screen. */
export interface K8Rezulto {
  /** Mean of `kvoto` over the combinations (D-96), 4 places. */
  kvoto: number;
  /** Sorted by aspekto, then scheme. */
  kombinacioj: K8Kombinacio[];
  /** Features the Modelo has no means for (D-16, D-104); they count, but never block `k8Plena`. */
  mankoj: K8Merkmal[];
}

/** The layout purpose without a means → the feature it leaves without a means (D-104). */
export const MANKO_AL_MERKMAL: Record<
  Extract<ArangxoCelo, "row" | "column" | "stack">,
  K8Merkmal
> = {
  row: "interspacoj",
  column: "interspacoj",
  stack: "interspacoj",
};

/**
 * „Auf Stufe“: a length is on a spacing step when it lies at most this far from it, in px. This is
 * the definition of D-08 (the browser's sub-pixel layout), not a tolerance.
 */
/** S038-12 red stage: signature only. */
export function k8(_facts: Facts, _modelo: Modelo): K8Rezulto | undefined {
  throw new Error("S038-12: not implemented");
}

/** S038-12 red stage: signature only. */
export function k8Plena(_rezulto: K8Rezulto): boolean {
  throw new Error("S038-12: not implemented");
}
