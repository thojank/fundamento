// Generic Dimensio sets (sets without an aspekto condition) outrank every Aspekto set, so what
// they hold reaches every Aspekto. Art. IV forbids inheriting values from core, hence
// (Spec 001, D-03, K4):
// - `dimensio-set-literal`: a generic set holds aliases only, never literals;
// - `dimensio-set-primitive`: a generic set only re-points tokens that are aliases in core
//   (roles), never primitives, which would otherwise become roles in one combination.
// Aspekto sets and conjunction sets belong to one Aspekto and may hold literals. Pure.
//
// Wired into validateModelo by T016, together with the rewritten repo sets.

import { aliasTarget, CORE_SET_NAME } from "../contracts/grammar.js";
import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import type { LoadedSet, Modelo } from "../contracts/modelo.js";
import { ASPEKTO_DIMENSIO } from "../load/build.js";

/** A set without an aspekto condition, other than core. */
export function isGenericDimensioSet(set: LoadedSet): boolean {
  return (
    set.name !== CORE_SET_NAME &&
    !set.kondicxoj.some((kondicxo) => kondicxo.dimensio === ASPEKTO_DIMENSIO)
  );
}

export function dimensioSetIssues(modelo: Modelo): ValidationIssue[] {
  const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME);
  if (core === undefined) {
    return [];
  }
  const issues: ValidationIssue[] = [];
  for (const set of modelo.setoj.filter(isGenericDimensioSet)) {
    for (const token of Object.values(set.tokens)) {
      const path = formatIssuePath(token.location);
      if (aliasTarget(token.value) === undefined) {
        issues.push({
          rule: "dimensio-set-literal",
          severity: "error",
          path,
          message: `The generic set ${set.name} gives ${token.name} a literal value; it would reach every Aspekto (Art. IV).`,
          suggestion: `Re-point ${token.name} to a primitive with an alias, e.g. {…scale.<step>}; literals belong in core primitives, Aspekto sets or conjunction sets aspekto/<name>+${set.name}.`,
        });
      }
      const coreToken = core.tokens[token.name];
      if (coreToken !== undefined && aliasTarget(coreToken.value) === undefined) {
        issues.push({
          rule: "dimensio-set-primitive",
          severity: "error",
          path,
          message: `The generic set ${set.name} overrides ${token.name}, which is a primitive in core (a literal value); generic sets only re-point roles.`,
          suggestion: `Introduce a role token that aliases ${token.name} and re-point the role in ${set.name}; primitives change only per Aspekto.`,
        });
      }
    }
  }
  return issues;
}
