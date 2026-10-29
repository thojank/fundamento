// Trivial values (Spec 032 ②, Maintainer 2026-10-24): a hit on a value every system has does not
// count, for every fingerprint list. The rule stands as data with its Kialo in trivialaj.json; this
// file only reads it.

import type { BrandCandidate } from "./marko-spuro.js";
import data from "./trivialaj.json" with { type: "json" };

export interface Trivialo {
  nomo: string;
  kialo: string;
  /** A hex colour whose three channels are equal: white, black and every grey. */
  griza?: boolean;
  /** A hex colour with this alpha (0–255) in its fourth byte; 0 is fully transparent. */
  alfa?: number;
  /** Normalized candidates, as the scan forms them (kind and value). */
  valoroj?: { kind: string; normalized: string }[];
}

export const TRIVIALAJ: readonly Trivialo[] = data.trivialaj;

const isGrey = (hex: string): boolean =>
  hex.slice(1, 3) === hex.slice(3, 5) && hex.slice(3, 5) === hex.slice(5, 7);

/** The rule that makes a candidate trivial, if one does. */
export function trivialOf(candidate: BrandCandidate): Trivialo | undefined {
  return TRIVIALAJ.find(
    (rule) =>
      (rule.griza === true && candidate.kind === "hex" && isGrey(candidate.normalized)) ||
      (rule.alfa !== undefined && candidate.kind === "hex" && candidate.alpha === rule.alfa) ||
      rule.valoroj?.some(
        (value) => value.kind === candidate.kind && value.normalized === candidate.normalized,
      ) === true,
  );
}

export function isTrivial(candidate: BrandCandidate): boolean {
  return trivialOf(candidate) !== undefined;
}
