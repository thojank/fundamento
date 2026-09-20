// Coverage per Dimensio (Spec 004 T002, G9, G10): how many of the tokens a Dimensio value
// re-points does the brand set itself, instead of leaving them to the generic set every brand
// shares? A number, not a rule — a brand may follow the system with a clear conscience
// (Fluida Marko, plan D-03). Pure.

import { matchesTokenPattern } from "../contracts/grammar.js";
import type { Modelo } from "../contracts/modelo.js";

export interface KovradoInput {
  aspekto: string;
  dimensio: string;
  valoro: string;
  /** Token patterns the count is restricted to; without it every re-pointed token counts. */
  scope?: readonly string[];
}

export interface KovradoResult {
  /** Tokens the brand sets in its own sets for this Dimensio value. */
  own: number;
  /** Tokens re-pointed for this Dimensio value, by the generic sets and by the brand. */
  total: number;
  /** `own / total`, or 1 when the Dimensio value re-points nothing at all. */
  share: number;
  /** The token names behind `own`, sorted; for a message that names what is missing. */
  ownTokens: string[];
  /** The token names behind `total`, sorted. */
  tokens: string[];
}

const ASPEKTO = "aspekto";

function inScope(name: string, scope: readonly string[] | undefined): boolean {
  return scope === undefined || scope.some((pattern) => matchesTokenPattern(pattern, name));
}

export function dimensioKovrado(modelo: Modelo, input: KovradoInput): KovradoResult {
  const own = new Set<string>();
  const total = new Set<string>();
  for (const set of modelo.setoj) {
    const matches = set.kondicxoj.some(
      (kondicxo) => kondicxo.dimensio === input.dimensio && kondicxo.valoro === input.valoro,
    );
    if (!matches) continue;
    const aspekto = set.kondicxoj.find((kondicxo) => kondicxo.dimensio === ASPEKTO)?.valoro;
    // A set of another brand says nothing about this one.
    if (aspekto !== undefined && aspekto !== input.aspekto) continue;
    for (const name of Object.keys(set.tokens)) {
      if (!inScope(name, input.scope)) continue;
      total.add(name);
      if (aspekto === input.aspekto) own.add(name);
    }
  }
  const sorted = (names: Set<string>) => [...names].sort();
  return {
    own: own.size,
    total: total.size,
    share: total.size === 0 ? 1 : own.size / total.size,
    ownTokens: sorted(own),
    tokens: sorted(total),
  };
}
