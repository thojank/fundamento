// Dimensio assignments (§2.7 step 1): validation, default filling, canonical enumeration and the
// logical `rezolvo(...)` path of per-combination issues. Pure.

import type { ValidationIssue } from "../contracts/issues.js";
import type { Assignment, Dimensio, Modelo } from "../contracts/modelo.js";
import { isJsonObject } from "../load/guards.js";

export interface CompleteAssignmentResult {
  /**
   * Every Dimensio of the Modelo mapped to a valoro, keys in priority order. Absent when
   * `issues` is non-empty.
   */
  assignment?: Record<string, string>;
  /** `resolve-unknown-dimensio` / `resolve-unknown-valoro`, one per offending entry. */
  issues: ValidationIssue[];
}

/** Valoro names of a Dimensio in declared order; tolerant of unvalidated shapes. */
export function valoroNames(dimensio: Dimensio): string[] {
  const valoroj: unknown = dimensio.valoroj;
  if (!Array.isArray(valoroj)) {
    return [];
  }
  return valoroj.flatMap((valoro: unknown) =>
    isJsonObject(valoro) && typeof valoro.name === "string" ? [valoro.name] : [],
  );
}

/**
 * Validates a (possibly partial) assignment against the Modelo's Dimensioj and fills missing
 * Dimensioj with their `default`. Unknown Dimensioj and unknown valoroj are reported, all of them,
 * at the logical path `assignment/<dimensio>`; the suggestion lists the allowed names.
 */
export function completeAssignment(
  modelo: Modelo,
  assignment: Assignment,
): CompleteAssignmentResult {
  const issues: ValidationIssue[] = [];
  const dimensioNames = modelo.dimensioj.map((dimensio) => dimensio.name);
  for (const key of Object.keys(assignment).sort()) {
    if (!dimensioNames.includes(key)) {
      issues.push({
        rule: "resolve-unknown-dimensio",
        severity: "error",
        path: `assignment/${key}`,
        message: `Unknown Dimensio '${key}' in the assignment.`,
        suggestion: `Use one of the Dimensioj: ${listOrNone(dimensioNames)}.`,
      });
    }
  }
  const complete: Record<string, string> = {};
  for (const dimensio of modelo.dimensioj) {
    const given = Object.hasOwn(assignment, dimensio.name) ? assignment[dimensio.name] : undefined;
    if (given === undefined) {
      complete[dimensio.name] = dimensio.default;
      continue;
    }
    const allowed = valoroNames(dimensio);
    if (!allowed.includes(given)) {
      issues.push({
        rule: "resolve-unknown-valoro",
        severity: "error",
        path: `assignment/${dimensio.name}`,
        message: `Unknown valoro '${given}' for Dimensio '${dimensio.name}'.`,
        suggestion: `Use one of the valoroj of '${dimensio.name}': ${listOrNone(allowed)} (default: ${dimensio.default}).`,
      });
      continue;
    }
    complete[dimensio.name] = given;
  }
  return issues.length > 0 ? { issues } : { assignment: complete, issues };
}

/**
 * Every complete assignment of the Modelo: the full Cartesian product of all valoroj, in canonical
 * order. Dimensioj are taken by priority ascending and valoroj in declared order; the **last**
 * (highest-priority) Dimensio varies fastest, like nested loops with the lowest priority
 * outermost. Keys of each assignment are in priority order. A Modelo without Dimensioj has one
 * (empty) assignment.
 */
export function allAssignments(modelo: Modelo): Record<string, string>[] {
  let result: Record<string, string>[] = [{}];
  for (const dimensio of modelo.dimensioj) {
    const names = valoroNames(dimensio);
    result = result.flatMap((partial) =>
      names.map((valoro) => ({ ...partial, [dimensio.name]: valoro })),
    );
  }
  return result;
}

/**
 * `dim=val` pairs of an assignment in Dimensio priority order, comma-joined, e.g.
 * `aspekto=neutra,color-scheme=dark`. Keys that are not Dimensioj of the Modelo follow, sorted.
 */
export function formatCombination(modelo: Modelo, assignment: Assignment): string {
  const known = modelo.dimensioj.map((dimensio) => dimensio.name);
  const extra = Object.keys(assignment)
    .filter((key) => !known.includes(key))
    .sort();
  return [...known, ...extra]
    .filter((key) => Object.hasOwn(assignment, key))
    .map((key) => `${key}=${assignment[key]}`)
    .join(",");
}

/**
 * Logical issue path of a per-combination issue (§2.6):
 * `rezolvo(<combination>)/<token>[/$value<pointer>]`.
 */
export function rezolvoPath(
  modelo: Modelo,
  assignment: Assignment,
  token: string,
  valuePointer?: string,
): string {
  const base = `rezolvo(${formatCombination(modelo, assignment)})/${token}`;
  return valuePointer === undefined ? base : `${base}/$value${valuePointer}`;
}

function listOrNone(names: readonly string[]): string {
  return names.length === 0 ? "(none)" : names.join(", ");
}
