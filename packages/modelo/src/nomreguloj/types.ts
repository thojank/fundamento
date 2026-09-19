// Shared shapes of the NomReguloj (§2.5, FR-13). A NomRegulo derives a Celo's target name from a
// canonical token name and inverts it again; target names are never typed by hand (Art. II).
import type { DtcgType } from "../contracts/index.js";

/** The five Celoj with a NomRegulo, in canonical order. */
export const CELOJ = ["css", "figma", "typescript", "tailwind", "dtcg"] as const;

export type Celo = (typeof CELOJ)[number];

/** Explicit "no Tailwind target" result (FR-13b): the token stays available as `--fm-*` only. */
export interface NoTarget {
  noTarget: true;
  celo: "tailwind";
  reason: string;
}

/**
 * A pure name-derivation rule for one Celo.
 *
 * Precondition of `derive`: `name` is a canonical token name (FR-13a). A non-canonical name
 * throws a `TokenNameError` carrying a `token-name-grammar` `ValidationIssue`; callers that
 * prefer a return value call `checkTokenName` first.
 *
 * `invert` never throws: it returns the canonical name for exactly the strings `derive` can
 * produce, and `null` for every other string.
 */
export interface NomRegulo {
  celo: Celo;
  derive(name: string, type?: DtcgType): string | NoTarget;
  invert(target: string): string | null;
}

/** A NomRegulo that always has a target (every Celo except Tailwind). */
export interface TotalNomRegulo extends NomRegulo {
  celo: Exclude<Celo, "tailwind">;
  derive(name: string, type?: DtcgType): string;
}

export function isNoTarget(value: unknown): value is NoTarget {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { noTarget?: unknown }).noTarget === true
  );
}
