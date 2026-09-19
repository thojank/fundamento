// Set activity and resolution order (§2.7 steps 2 and 3). The same total order drives the
// resolver (restricted to the active sets) and `$metadata.json`'s `tokenSetOrder` (all sets), so
// Tokens Studio / Penpot and the resolver agree. Pure.

import { CORE_SET_NAME } from "../contracts/grammar.js";
import type { Assignment, LoadedSet, Modelo } from "../contracts/modelo.js";

/**
 * Sort key of a non-core set. Ascending order; later sets win.
 * - `maxPriority`: the highest priority among the Dimensioj of the set's kondicxoj (0 for a set
 *   without kondicxoj; `Infinity` for a kondicxo on an unknown Dimensio, which FUND-3.2 reports).
 * - `conditions`: number of kondicxoj (more specific sorts later and wins).
 * - `name`: set name, code-point order (later wins).
 */
export interface SetOrderKey {
  maxPriority: number;
  conditions: number;
  name: string;
}

export function setOrderKey(modelo: Modelo, set: LoadedSet): SetOrderKey {
  let maxPriority = 0;
  for (const kondicxo of set.kondicxoj) {
    const dimensio = modelo.dimensioj.find((candidate) => candidate.name === kondicxo.dimensio);
    const priority =
      dimensio !== undefined && typeof dimensio.priority === "number"
        ? dimensio.priority
        : Number.POSITIVE_INFINITY;
    maxPriority = Math.max(maxPriority, priority);
  }
  return { maxPriority, conditions: set.kondicxoj.length, name: set.name };
}

/** Compares two sort keys: max priority, then condition count, then name (all ascending). */
export function compareSetOrderKeys(a: SetOrderKey, b: SetOrderKey): number {
  if (a.maxPriority !== b.maxPriority) {
    return a.maxPriority < b.maxPriority ? -1 : 1;
  }
  if (a.conditions !== b.conditions) {
    return a.conditions - b.conditions;
  }
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
}

/** Whether two sets have the same priority and specificity, i.e. only their names order them. */
export function isOrderTie(a: SetOrderKey, b: SetOrderKey): boolean {
  return a.maxPriority === b.maxPriority && a.conditions === b.conditions;
}

/**
 * Sorts sets into resolution order: `core` first, then the rest by `setOrderKey` ascending.
 * Returns a new array; the input is not modified.
 */
export function sortSetsForResolution(modelo: Modelo, setoj: readonly LoadedSet[]): LoadedSet[] {
  const core = setoj.filter((set) => set.name === CORE_SET_NAME);
  const rest = setoj
    .filter((set) => set.name !== CORE_SET_NAME)
    .map((set) => ({ set, key: setOrderKey(modelo, set) }))
    .sort((a, b) => compareSetOrderKeys(a.key, b.key))
    .map(({ set }) => set);
  return [...core, ...rest];
}

/**
 * A set is active when every one of its kondicxoj holds in the assignment. `core` is always
 * active. Pass a complete assignment (see `completeAssignment`); a missing Dimensio never holds.
 */
export function isSetActive(set: LoadedSet, assignment: Assignment): boolean {
  if (set.name === CORE_SET_NAME) {
    return true;
  }
  return set.kondicxoj.every(
    (kondicxo) =>
      Object.hasOwn(assignment, kondicxo.dimensio) &&
      assignment[kondicxo.dimensio] === kondicxo.valoro,
  );
}

/**
 * The active sets of an assignment in resolution order (ascending; the last one wins). Missing
 * Dimensioj take their default; entries for unknown Dimensioj are ignored here (`resolve`
 * reports them).
 */
export function orderActiveSets(modelo: Modelo, assignment: Assignment): LoadedSet[] {
  const effective: Record<string, string> = {};
  for (const dimensio of modelo.dimensioj) {
    const given = Object.hasOwn(assignment, dimensio.name) ? assignment[dimensio.name] : undefined;
    effective[dimensio.name] = given ?? dimensio.default;
  }
  return sortSetsForResolution(
    modelo,
    modelo.setoj.filter((set) => isSetActive(set, effective)),
  );
}
