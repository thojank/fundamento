// Derives the Tokens-Studio `$themes.json` and `$metadata.json` (FR-10) from the Dimensioj and the
// set kondicxoj, using the resolver's set order, so Tokens Studio / Penpot and `resolve` agree.
// Pure.

import { CORE_SET_NAME } from "../contracts/grammar.js";
import type { Modelo } from "../contracts/modelo.js";
import { isJsonObject } from "../load/guards.js";
import { sortSetsForResolution } from "../resolve/order.js";

/** Tokens-Studio set status: `source` = referenceable but not output; `enabled` = applied. */
export type TokenSetStatus = "enabled" | "source" | "disabled";

/**
 * One entry of Tokens-Studio `$themes.json` (an array of these): a theme belongs to a theme
 * `group` and switches token sets on (`enabled`) or makes them referenceable (`source`).
 * Fundamento maps Dimensio -> `group`, DimensioValoro -> theme (`name`, `id`).
 */
export interface TokensStudioTheme {
  id: string;
  name: string;
  group: string;
  selectedTokenSets: Record<string, TokenSetStatus>;
}

/** Tokens-Studio `$metadata.json`: the order in which sets are applied (later overrides earlier). */
export interface TokensStudioMetadata {
  tokenSetOrder: string[];
}

export interface DerivedThemes {
  themes: TokensStudioTheme[];
  metadata: TokensStudioMetadata;
}

/**
 * - `themes`: one per DimensioValoro, Dimensioj by priority ascending, valoroj in declared order.
 *   `selectedTokenSets` has `core: "source"` plus `"enabled"` for every set whose kondicxoj contain
 *   this `dimensio=valoro`, so a conjunction set is listed under every theme it involves. Keys are
 *   in `tokenSetOrder` order (serialization sorts them anyway).
 * - `metadata.tokenSetOrder`: every set in resolver order: `core`, then (max priority, condition
 *   count, name) ascending.
 */
export function deriveThemes(modelo: Modelo): DerivedThemes {
  const ordered = sortSetsForResolution(modelo, modelo.setoj);
  const hasCore = ordered.some((set) => set.name === CORE_SET_NAME);
  const themes: TokensStudioTheme[] = [];
  for (const dimensio of modelo.dimensioj) {
    const valoroj: unknown = dimensio.valoroj;
    for (const valoro of Array.isArray(valoroj) ? valoroj : []) {
      if (!isJsonObject(valoro) || typeof valoro.name !== "string") {
        continue;
      }
      const valoroName = valoro.name;
      const selectedTokenSets: Record<string, TokenSetStatus> = {};
      if (hasCore) {
        selectedTokenSets[CORE_SET_NAME] = "source";
      }
      for (const set of ordered) {
        if (
          set.name !== CORE_SET_NAME &&
          set.kondicxoj.some(
            (kondicxo) => kondicxo.dimensio === dimensio.name && kondicxo.valoro === valoroName,
          )
        ) {
          selectedTokenSets[set.name] = "enabled";
        }
      }
      themes.push({
        id: typeof valoro.id === "string" ? valoro.id : "",
        name: valoroName,
        group: dimensio.name,
        selectedTokenSets,
      });
    }
  }
  return { themes, metadata: { tokenSetOrder: ordered.map((set) => set.name) } };
}
