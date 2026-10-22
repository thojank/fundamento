// The resolution function (FR-11, S4, §2.7): assignment -> every core token with its late-bound
// value and provenance. Pure; the building blocks are exported so FUND-3.2 can collect all
// resolution issues per combination without duplicating logic.

import { CORE_SET_NAME } from "../contracts/grammar.js";
import type { ValidationIssue } from "../contracts/issues.js";
import type {
  Assignment,
  LoadedSet,
  Modelo,
  ResolvedToken,
  ResolveOutcome,
} from "../contracts/modelo.js";
import type { TextTransform } from "../generated/modelo-schema.js";
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
export interface ResolveCombinationOptions {
  /**
   * Resolve only these core tokens and their alias chains (Spec 002, D-18); names that are no
   * core token are ignored. Override-ambiguity warnings are not computed in this mode.
   */
  names?: readonly string[];
}

/**
 * A copy of a token value: a resolved token must not share its value with the set it came from.
 * Values are JSON (DTCG), so a plain walk suffices — `structuredClone` costs ten times as much
 * per token, and a resolution copies every core token.
 */
function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) return value.map(cloneValue) as T;
  if (value !== null && typeof value === "object") {
    const copy: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>))
      copy[key] = cloneValue(entry);
    return copy as T;
  }
  return value;
}

// A Modelo is not changed after it is built (as the resolutions cache of the validation assumes),
// so what depends on it alone is computed once: the sorted names of the core, and the overlay of
// each ordered run of active sets — a tool that resolves a few names over every combination
// (check_contrast without an assignment, Spec 002 AK-09) would otherwise overlay every token of
// every set on each call.
const coreNames = new WeakMap<Modelo, readonly string[]>();
function coreNamesOf(modelo: Modelo): readonly string[] {
  let names = coreNames.get(modelo);
  if (names === undefined) {
    names = Object.keys(
      modelo.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {},
    ).sort();
    coreNames.set(modelo, names);
  }
  return names;
}

interface Overlay {
  overlaid: ReturnType<typeof overlaySets>;
  /** The case per token: the last active set that states it wins (D-11). */
  cases: Map<string, { value: TextTransform; set: string }>;
}

const overlays = new WeakMap<Modelo, Map<string, Overlay>>();
function overlayOf(modelo: Modelo, ordered: readonly LoadedSet[]): Overlay {
  let own = overlays.get(modelo);
  if (own === undefined) {
    own = new Map();
    overlays.set(modelo, own);
  }
  const key = ordered.map((set) => set.name).join("\u0000");
  let overlay = own.get(key);
  if (overlay === undefined) {
    const cases = new Map<string, { value: TextTransform; set: string }>();
    for (const set of ordered) {
      for (const [name, token] of Object.entries(set.tokens)) {
        if (token.textTransform !== undefined)
          cases.set(name, { value: token.textTransform, set: set.name });
      }
    }
    overlay = { overlaid: overlaySets(ordered), cases };
    own.set(key, overlay);
  }
  return overlay;
}

export function resolveCombination(
  modelo: Modelo,
  assignment: Assignment,
  options: ResolveCombinationOptions = {},
): CombinationResolution {
  const completed = completeAssignment(modelo, assignment);
  if (completed.assignment === undefined) {
    return { tokens: {}, errors: completed.issues, warnings: [] };
  }
  const complete = completed.assignment;
  const ordered = orderActiveSets(modelo, complete);
  const { overlaid, cases } = overlayOf(modelo, ordered);
  const allNames = coreNamesOf(modelo);
  const wanted = options.names === undefined ? undefined : new Set(options.names);
  const coreNames = wanted === undefined ? allNames : allNames.filter((name) => wanted.has(name));
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
      value: cloneValue(result.value),
      origin:
        winner.set.package === undefined
          ? { set: winner.set.name, setId: winner.set.id ?? "" }
          : { set: winner.set.name, setId: winner.set.id ?? "", package: winner.set.package },
      aliasChain: result.aliasChain.map((link) => ({ ...link })),
    };
    if (result.fieldAliases !== undefined) {
      resolved.fieldAliases = cloneValue(result.fieldAliases);
    }
    // textTransform is a field of its own: the last active set that states it wins (D-11). A
    // whole-value alias that states none follows its chain (Constitution v2.3: an Ero-Token on a
    // typography role carries the case of the role), the first link that states one.
    for (const link of result.aliasChain.length === 0
      ? [name]
      : result.aliasChain.map((entry) => entry.token)) {
      const found = cases.get(link);
      if (found !== undefined) {
        resolved.textTransform = { value: found.value, set: found.set };
        break;
      }
    }
    tokens[name] = resolved;
  }
  return {
    assignment: complete,
    tokens,
    errors: issues,
    warnings: wanted === undefined ? findAmbiguousOverrides(modelo, ordered, complete) : [],
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
