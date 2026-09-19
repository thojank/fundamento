// Overlay of the ordered active sets (§2.7 step 4) and detection of ambiguous overrides. Pure.

import { CORE_SET_NAME } from "../contracts/grammar.js";
import type { ValidationIssue } from "../contracts/issues.js";
import type { Assignment, LoadedSet, LoadedToken, Modelo } from "../contracts/modelo.js";
import { rezolvoPath } from "./assignment.js";
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
          suggestion: `Override ${name} in only one of these sets, or add a conjunction set (e.g. combining their kondicxoj) that defines the intended value.`,
          combination: { ...assignment },
        });
      }
      start = end;
    }
  }
  return issues;
}

function isTied(a: SetOrderKey | undefined, b: SetOrderKey | undefined): boolean {
  return a !== undefined && b !== undefined && isOrderTie(a, b);
}
