// Reguloj that hold "in every combination of every Aspekto" (Spec 002, D-04). A checker looks at
// one resolved combination and returns what it finds; the runner applies it to every combination
// and reports each distinct violation once, at the first combination in canonical order, the way
// combination-rules.ts reports resolution issues. `explain` calls the same checkers for a single
// combination. Pure.

import type { RuleId, ValidationIssue } from "../contracts/issues.js";
import type { Modelo, Regulo } from "../contracts/modelo.js";
import { ASPEKTO_DIMENSIO } from "../load/build.js";
import { formatCombination } from "../resolve/assignment.js";
import type { CombinationResolution } from "../resolve/resolve.js";
import { resolutionsOf } from "./resolutions.js";

export interface CombinationContext {
  modelo: Modelo;
  /** The complete assignment of the combination. */
  assignment: Record<string, string>;
  resolution: CombinationResolution;
  /** The Regulo being checked (its `sojlo`, for example). */
  regulo: Regulo;
}

/** One violation in one combination. */
export interface CombinationFinding {
  /** The token the issue path points at. */
  subject: string;
  /** The resolved values that make up the violation; equal values mean the same violation. */
  values: string;
  message: string;
  suggestion: string;
}

export type CombinationChecker = (context: CombinationContext) => CombinationFinding[];

/** The issue of one finding in one combination, before the distinct-violation grouping. */
export function findingIssue(
  modelo: Modelo,
  regulo: Regulo,
  assignment: Record<string, string>,
  finding: CombinationFinding,
): ValidationIssue {
  return {
    rule: regulo.name as RuleId,
    severity: "error",
    path: `rezolvo(${formatCombination(modelo, assignment)})/${finding.subject}`,
    message: finding.message,
    suggestion: finding.suggestion,
    combination: { ...assignment },
  };
}

/** Runs a checker over every combination; one issue per distinct violation. */
export function runCombinationChecker(
  modelo: Modelo,
  regulo: Regulo,
  checker: CombinationChecker,
): ValidationIssue[] {
  const groups = new Map<string, { issue: ValidationIssue; count: number }>();
  for (const { assignment, resolution } of resolutionsOf(modelo)) {
    for (const finding of checker({ modelo, assignment, resolution, regulo })) {
      const key = [assignment[ASPEKTO_DIMENSIO] ?? "", finding.subject, finding.values].join("\n");
      const group = groups.get(key);
      if (group === undefined) {
        groups.set(key, { issue: findingIssue(modelo, regulo, assignment, finding), count: 1 });
      } else {
        group.count += 1;
      }
    }
  }
  return [...groups.values()].map(({ issue, count }) =>
    count === 1 ? issue : { ...issue, message: `${issue.message} Same in ${count} combinations.` },
  );
}
