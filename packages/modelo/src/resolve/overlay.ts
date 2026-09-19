// Overlay of the ordered active sets (§2.7 step 4) and detection of ambiguous overrides. Pure.

import { CORE_SET_NAME } from "../contracts/grammar.js";
import type { ValidationIssue } from "../contracts/issues.js";
import type { Assignment, LoadedSet, LoadedToken, Modelo } from "../contracts/modelo.js";
import { rezolvoPath, valoroNames } from "./assignment.js";
import { isOrderTie, type SetOrderKey, setOrderKey } from "./order.js";

/** The winning definition of one token after the overlay, and the set that defined it. */
export interface OverlaidToken {
  token: LoadedToken;
  set: LoadedSet;
}

/**
 * Overlays sets given in resolution order (see `orderActiveSets`): a later set's definition of a
 * token replaces an earlier one. Only used for lookups; callers iterate over sorted names.
 */
export function overlaySets(orderedSets: readonly LoadedSet[]): Map<string, OverlaidToken> {
  const overlaid = new Map<string, OverlaidToken>();
  for (const set of orderedSets) {
    for (const token of Object.values(set.tokens)) {
      overlaid.set(token.name, { token, set });
    }
  }
  return overlaid;
}

/**
 * `set-override-ambiguous` warnings: two or more active non-core sets with the same priority and
 * specificity (same `maxPriority` and condition count) define the same token, so only their names
 * order them. One warning per token and tied group, at `rezolvo(<combination>)/<token>`, naming
 * the tied sets in order (the last one wins). Reported regardless of whether a more specific set
 * overrides them both. Sorted by path.
 */
export function findAmbiguousOverrides(
  modelo: Modelo,
  orderedSets: readonly LoadedSet[],
  assignment: Assignment,
): ValidationIssue[] {
  const definers = new Map<string, { set: LoadedSet; key: SetOrderKey }[]>();
  for (const set of orderedSets) {
    if (set.name === CORE_SET_NAME) {
      continue;
    }
    const key = setOrderKey(modelo, set);
    for (const name of Object.keys(set.tokens)) {
      const list = definers.get(name) ?? [];
      list.push({ set, key });
      definers.set(name, list);
    }
  }
  const issues: ValidationIssue[] = [];
  for (const name of [...definers.keys()].sort()) {
    const list = definers.get(name) ?? [];
    let start = 0;
    while (start < list.length) {
      let end = start + 1;
      while (end < list.length && isTied(list[start]?.key, list[end]?.key)) {
        end++;
      }
      const group = list.slice(start, end).map((entry) => entry.set.name);
      const winner = group.at(-1);
      if (group.length > 1 && winner !== undefined) {
        issues.push({
          rule: "set-override-ambiguous",
          severity: "warning",
          path: rezolvoPath(modelo, assignment, name),
          message: `Sets ${group.join(", ")} all override ${name} with the same priority and specificity; only their names order them, so ${winner} wins.`,
          suggestion: separatingSuggestion(
            modelo,
            list.slice(start, end).map((entry) => entry.set),
            name,
          ),
          combination: { ...assignment },
        });
      }
      start = end;
    }
  }
  return issues;
}

/**
 * How to separate tied sets: a kondicxo that one of them lacks and another states, so that both
 * are never active together. An Aspekto set is the one to narrow (its author owns it); the valoro
 * is the Dimensio's default, or its first other valoro. A more specific set overriding both does
 * not help: the tie is reported regardless.
 */
function separatingSuggestion(modelo: Modelo, tied: readonly LoadedSet[], token: string): string {
  const narrow = tied.find((set) => set.name.startsWith("aspekto/")) ?? tied[0];
  const has = (set: LoadedSet, dimensio: string) =>
    set.kondicxoj.some((kondicxo) => kondicxo.dimensio === dimensio);
  const generic = `Override ${token} in only one of these sets. Note that a more specific set that overrides both does not remove this warning.`;
  if (narrow === undefined) return generic;
  for (const other of tied) {
    for (const kondicxo of other.kondicxoj) {
      if (other === narrow || has(narrow, kondicxo.dimensio)) continue;
      const dimensio = modelo.dimensioj.find((candidate) => candidate.name === kondicxo.dimensio);
      const valoroj = dimensio === undefined ? [] : valoroNames(dimensio);
      const valoro =
        dimensio !== undefined && dimensio.default !== kondicxo.valoro
          ? dimensio.default
          : valoroj.find((candidate) => candidate !== kondicxo.valoro);
      if (valoro === undefined) continue;
      const kondicxoj = [...narrow.kondicxoj, { dimensio: kondicxo.dimensio, valoro }];
      const priority = (name: string) =>
        modelo.dimensioj.find((candidate) => candidate.name === name)?.priority ??
        Number.POSITIVE_INFINITY;
      const setName = kondicxoj
        .sort((a, b) => priority(a.dimensio) - priority(b.dimensio))
        .map((entry) => `${entry.dimensio}/${entry.valoro}`)
        .join("+");
      return `Add the kondicxo ${kondicxo.dimensio}=${valoro} to ${narrow.name} (set ${setName}), so it is never active together with ${other.name}; a more specific set that overrides both does not remove this warning.`;
    }
  }
  return generic;
}

function isTied(a: SetOrderKey | undefined, b: SetOrderKey | undefined): boolean {
  return a !== undefined && b !== undefined && isOrderTie(a, b);
}
