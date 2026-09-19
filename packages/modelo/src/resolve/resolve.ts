// The resolution function (FR-11, S4, §2.7): assignment -> every core token with its late-bound
// value and provenance. Pure; the building blocks are exported so FUND-3.2 can collect all
// resolution issues per combination without duplicating logic.

import { CORE_SET_NAME } from "../contracts/grammar.js";
import type { ValidationIssue } from "../contracts/issues.js";
import type { Assignment, Modelo, ResolvedToken, ResolveOutcome } from "../contracts/modelo.js";
import { completeAssignment } from "./assignment.js";
import { bindAliases } from "./bind.js";
import { orderActiveSets } from "./order.js";
import { findAmbiguousOverrides, overlaySets } from "./overlay.js";

export interface CombinationResolution {
  /** The complete assignment (keys in priority order); absent if the assignment was invalid. */
  assignment?: Record<string, string>;
  /**
   * Every core token that resolved, keyed by name in sorted order. Tokens whose resolution failed
   * (or that depend on one that failed) are absent.
   */
  tokens: Record<string, ResolvedToken>;
  /** Assignment issues, or all alias issues of the combination (root causes), sorted by path. */
  errors: ValidationIssue[];
  /** `set-override-ambiguous` warnings, sorted by path. */
  warnings: ValidationIssue[];
}

/**
 * Resolves one combination and returns everything, including a partial token map when there are
 * errors. Steps (§2.7): validate and complete the assignment, find and order the active sets,
 * overlay them, then bind aliases late against the overlay.
 *
 * The token set is the `core` set's: `ResolvedToken.id` and `type` come from the core definition
 * (`id` is `""` when core carries none; FUND-3.2 reports `id-missing`), `origin` is the set whose
 * definition won the overlay (`setId` is `""` when that set has no ID). Alias targets are looked up
 * in the whole overlay, so a reference to a token only an active override set defines resolves.
 */
export function resolveCombination(modelo: Modelo, assignment: Assignment): CombinationResolution {
  const completed = completeAssignment(modelo, assignment);
  if (completed.assignment === undefined) {
    return { tokens: {}, errors: completed.issues, warnings: [] };
  }
  const complete = completed.assignment;
  const ordered = orderActiveSets(modelo, complete);
  const overlaid = overlaySets(ordered);
  const coreNames = Object.keys(
    modelo.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {},
  ).sort();
  const { bound, issues } = bindAliases(modelo, overlaid, coreNames, complete);
  const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME);

  const tokens: Record<string, ResolvedToken> = {};
  for (const name of coreNames) {
    const result = bound.get(name);
    const winner = overlaid.get(name);
    const coreToken = core?.tokens[name];
    if (result === undefined || winner === undefined || coreToken === undefined) {
      continue;
    }
    const resolved: ResolvedToken = {
      id: coreToken.id ?? "",
      type: coreToken.type,
      value: structuredClone(result.value),
      origin:
        winner.set.package === undefined
          ? { set: winner.set.name, setId: winner.set.id ?? "" }
          : { set: winner.set.name, setId: winner.set.id ?? "", package: winner.set.package },
      aliasChain: result.aliasChain.map((link) => ({ ...link })),
    };
    if (result.fieldAliases !== undefined) {
      resolved.fieldAliases = structuredClone(result.fieldAliases);
    }
    // textTransform is a field of its own: the last active set that states it wins (D-11).
    const transform = ordered.findLast((set) => set.tokens[name]?.textTransform !== undefined);
    const textTransform = transform?.tokens[name]?.textTransform;
    if (transform !== undefined && textTransform !== undefined) {
      resolved.textTransform = { value: textTransform, set: transform.name };
    }
    tokens[name] = resolved;
  }
  return {
    assignment: complete,
    tokens,
    errors: issues,
    warnings: findAmbiguousOverrides(modelo, ordered, complete),
  };
}

/**
 * `resolve(modelo, assignment)` (§2.5). Missing Dimensioj take their default. On success returns
 * the Rezolvo with exactly one value per core token plus `set-override-ambiguous` warnings. On
 * failure returns `ok: false` with **all** issues of the combination: the assignment issues
 * (`resolve-unknown-dimensio`/`-valoro`), or every alias issue (`alias-cycle`,
 * `alias-target-missing`, `alias-unresolvable-in-combination`, each with `combination`), followed
 * by the warnings.
 */
export function resolve(modelo: Modelo, assignment: Assignment): ResolveOutcome {
  const result = resolveCombination(modelo, assignment);
  if (result.errors.length > 0 || result.assignment === undefined) {
    return { ok: false, issues: [...result.errors, ...result.warnings] };
  }
  return {
    ok: true,
    rezolvo: { assignment: result.assignment, tokens: result.tokens },
    warnings: result.warnings,
  };
}
