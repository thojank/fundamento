// Every combination of a Modelo resolved once (Spec 002, D-04). Validation reads the same
// resolutions for the combination rules and for every per-combination Regulo, so adding Reguloj
// adds no resolution pass. Modelos are not changed after they are built, so the cache needs no
// invalidation. Pure apart from the cache.

import type { Modelo } from "../contracts/modelo.js";
import { allAssignments } from "../resolve/assignment.js";
import { type CombinationResolution, resolveCombination } from "../resolve/resolve.js";

export interface ResolvedCombination {
  /** The assignment as enumerated by `allAssignments` (every Dimensio, priority order). */
  assignment: Record<string, string>;
  resolution: CombinationResolution;
}

const cache = new WeakMap<Modelo, readonly ResolvedCombination[]>();

/** The resolution of every combination, in `allAssignments` order. */
export function resolutionsOf(modelo: Modelo): readonly ResolvedCombination[] {
  let entries = cache.get(modelo);
  if (entries === undefined) {
    entries = allAssignments(modelo).map((assignment) => ({
      assignment,
      resolution: resolveCombination(modelo, assignment),
    }));
    cache.set(modelo, entries);
  }
  return entries;
}
