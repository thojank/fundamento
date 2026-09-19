// Late binding (§2.7 step 5): aliases, whole-value and composite sub-field, are resolved against
// the overlaid map of one combination. Pure.

import { aliasTarget } from "../contracts/grammar.js";
import type { ValidationIssue } from "../contracts/issues.js";
import type { AliasLink, Assignment, LoadedSet, Modelo } from "../contracts/modelo.js";
import { appendPointer } from "../json/pointer.js";
import { isJsonObject } from "../load/guards.js";
import { rezolvoPath } from "./assignment.js";
import type { OverlaidToken } from "./overlay.js";

/** The late-bound value of one token in one combination. */
export interface BoundToken {
  /** Aliases fully inlined. */
  value: unknown;
  /**
   * Members of the whole-value alias chain, each with the set that defined it, starting with the
   * token itself and ending with the token that holds the literal. Empty if the value is literal.
   */
  aliasChain: AliasLink[];
  /**
   * Per composite sub-field alias, keyed by the JSON Pointer of the field inside `$value`
   * (e.g. `/color`, `/0/color`): the chain starting at the referenced token. Absent if none.
   */
  fieldAliases?: Record<string, AliasLink[]>;
}

export interface BindResult {
  /** Bound tokens by name; tokens whose resolution failed are absent. */
  bound: Map<string, BoundToken>;
  /**
   * Root causes only, sorted by path: `alias-cycle` (once per cycle, at its smallest member),
   * `alias-target-missing` (no set of the Modelo defines the target) and
   * `alias-unresolvable-in-combination` (the target exists, but in no active set). Tokens that
   * merely depend on a failed token get no issue of their own.
   */
  issues: ValidationIssue[];
}

/**
 * Resolves `names` (and everything they reference) against `overlaid`. `assignment` must be
 * complete; it becomes the `combination` of each issue.
 */
export function bindAliases(
  modelo: Modelo,
  overlaid: ReadonlyMap<string, OverlaidToken>,
  names: readonly string[],
  assignment: Assignment,
): BindResult {
  const memo = new Map<string, BoundToken | null>();
  const stack: string[] = [];
  const issues: ValidationIssue[] = [];
  const reportedCycles = new Set<string>();
  const combination = { ...assignment };

  const reportCycle = (target: string): void => {
    const members = stack.slice(stack.indexOf(target));
    const smallest = [...members].sort()[0] ?? target;
    const start = members.indexOf(smallest);
    const rotated = [...members.slice(start), ...members.slice(0, start)];
    const key = rotated.join(" ");
    if (reportedCycles.has(key)) {
      return;
    }
    reportedCycles.add(key);
    const describe = (name: string): string => `${name} (${overlaid.get(name)?.set.name ?? "?"})`;
    issues.push({
      rule: "alias-cycle",
      severity: "error",
      path: rezolvoPath(modelo, assignment, smallest),
      message: `Alias cycle after overlaying the active sets: ${[...rotated, smallest].map(describe).join(" -> ")}.`,
      suggestion:
        "Break the cycle: make one of these tokens hold a literal value, or point an override at a different token.",
      combination,
    });
  };

  const reportUnresolvable = (
    from: string,
    set: LoadedSet,
    target: string,
    valuePointer: string | undefined,
  ): void => {
    const definedIn = modelo.setoj
      .filter((candidate) => Object.hasOwn(candidate.tokens, target))
      .map((candidate) => candidate.name);
    const where = valuePointer === undefined ? "" : ` (field ${valuePointer})`;
    issues.push(
      definedIn.length === 0
        ? {
            rule: "alias-target-missing",
            severity: "error",
            path: rezolvoPath(modelo, assignment, from, valuePointer),
            message: `${from}${where} in set ${set.name} references {${target}}, which no set defines.`,
            suggestion: `Reference an existing token, or define ${target} in core.`,
            combination,
          }
        : {
            rule: "alias-unresolvable-in-combination",
            severity: "error",
            path: rezolvoPath(modelo, assignment, from, valuePointer),
            message: `${from}${where} in set ${set.name} references {${target}}, which is defined only in ${definedIn.join(", ")}; none of them is active in this combination.`,
            suggestion: `Define ${target} in core so it resolves in every combination, or reference a token that exists in core.`,
            combination,
          },
    );
  };

  /** Resolves a reference to `target`; returns its chain (starting at the target) and value. */
  const follow = (
    from: string,
    set: LoadedSet,
    target: string,
    valuePointer: string | undefined,
  ): { value: unknown; chain: AliasLink[] } | null => {
    const entry = overlaid.get(target);
    if (entry === undefined) {
      reportUnresolvable(from, set, target, valuePointer);
      return null;
    }
    const resolved = resolveName(target);
    if (resolved === null) {
      return null;
    }
    const chain =
      resolved.aliasChain.length > 0
        ? resolved.aliasChain
        : [{ token: target, set: entry.set.name }];
    return { value: resolved.value, chain };
  };

  const resolveName = (name: string): BoundToken | null => {
    const known = memo.get(name);
    if (known !== undefined) {
      return known;
    }
    if (stack.includes(name)) {
      reportCycle(name);
      return null;
    }
    const entry = overlaid.get(name);
    if (entry === undefined) {
      return null;
    }
    stack.push(name);
    const result = bindEntry(name, entry);
    stack.pop();
    memo.set(name, result);
    return result;
  };

  const bindEntry = (name: string, { token, set }: OverlaidToken): BoundToken | null => {
    const target = aliasTarget(token.value);
    if (target !== undefined) {
      const followed = follow(name, set, target, undefined);
      if (followed === null) {
        return null;
      }
      return {
        value: followed.value,
        aliasChain: [{ token: name, set: set.name }, ...followed.chain],
      };
    }
    const fieldAliases: Record<string, AliasLink[]> = {};
    let failed = false;
    const inline = (value: unknown, pointer: string): unknown => {
      if (Array.isArray(value)) {
        return value.map((item, index) => inline(item, appendPointer(pointer, index)));
      }
      if (isJsonObject(value)) {
        // `fromEntries` defines own properties, so a `__proto__` key stays data.
        return Object.fromEntries(
          Object.entries(value).map(([key, item]) => [
            key,
            inline(item, appendPointer(pointer, key)),
          ]),
        );
      }
      const fieldTarget = pointer === "" ? undefined : aliasTarget(value);
      if (fieldTarget === undefined) {
        return value;
      }
      const followed = follow(name, set, fieldTarget, pointer);
      if (followed === null) {
        failed = true;
        return value;
      }
      fieldAliases[pointer] = followed.chain;
      return followed.value;
    };
    const value = inline(token.value, "");
    if (failed) {
      return null;
    }
    const pointers = Object.keys(fieldAliases).sort();
    if (pointers.length === 0) {
      return { value, aliasChain: [] };
    }
    const sorted: Record<string, AliasLink[]> = {};
    for (const pointer of pointers) {
      sorted[pointer] = fieldAliases[pointer] ?? [];
    }
    return { value, aliasChain: [], fieldAliases: sorted };
  };

  for (const name of [...names].sort()) {
    resolveName(name);
  }
  const bound = new Map<string, BoundToken>();
  for (const [name, result] of memo) {
    if (result !== null) {
      bound.set(name, result);
    }
  }
  issues.sort((a, b) => compareStrings(a.path, b.path) || compareStrings(a.rule, b.rule));
  return { bound, issues };
}

function compareStrings(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
