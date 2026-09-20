// check_usage (Spec 003, FR-13, plan D-16 §3): judges instances of a design or of code against
// the Ero Reguloj and the Skemo constraints. The judgement itself is `evaluateUsage`; this adds
// the input validation the tool contract asks for: a prop or a value the Skemo does not know is
// invalid input (`mcp-input-invalid` with `allowed`), not a violation of a Regulo. Pure.

import type { ValidationIssue } from "../contracts/issues.js";
import type { EroInstance, Modelo, Skemo } from "../contracts/modelo.js";
import { evaluateUsage, type UsageResult } from "../eroj/usage.js";

export interface CheckUsageInput {
  instances: EroInstance[];
}

export type CheckUsageResult =
  | { ok: true; output: UsageResult }
  | { ok: false; issues: ValidationIssue[]; allowed?: string[] };

function invalid(path: string, message: string, suggestion: string): ValidationIssue {
  return { rule: "mcp-input-invalid", severity: "error", path, message, suggestion };
}

/** The first prop of an instance the Skemo does not know, or a value it does not allow. */
function propIssue(
  skemo: Skemo,
  instance: EroInstance,
  index: number,
): { issue: ValidationIssue; allowed: string[] } | undefined {
  for (const [name, value] of Object.entries(instance.props)) {
    const prop = skemo.props.find((candidate) => candidate.name === name);
    const path = `check_usage/instances/${index}/props/${name}`;
    if (prop === undefined) {
      return {
        issue: invalid(
          path,
          `The Ero ${instance.ero} has no prop ${name}.`,
          "Use one of the props in allowed; get_ero lists them with their values.",
        ),
        allowed: skemo.props.map((candidate) => candidate.name),
      };
    }
    if (prop.kind === "enum" && !(prop.values ?? []).includes(String(value))) {
      return {
        issue: invalid(
          path,
          `${name}="${String(value)}" is not a value of the prop ${name}.`,
          "Use one of the values in allowed.",
        ),
        allowed: [...(prop.values ?? [])],
      };
    }
    if (prop.kind === "boolean" && typeof value !== "boolean") {
      return {
        issue: invalid(
          path,
          `The prop ${name} takes true or false, not "${String(value)}".`,
          "Pass a boolean.",
        ),
        allowed: ["true", "false"],
      };
    }
  }
  return undefined;
}

export function checkUsage(modelo: Modelo, input: CheckUsageInput): CheckUsageResult {
  const byName = new Map(modelo.eroj.map((entry) => [entry.ero.name, entry]));
  for (const [index, instance] of input.instances.entries()) {
    // An unknown Ero is a finding of the evaluation (ero-unknown), not invalid input.
    const entry = byName.get(instance.ero);
    if (entry === undefined) continue;
    const found = propIssue(entry.skemo, instance, index);
    if (found !== undefined) return { ok: false, issues: [found.issue], allowed: found.allowed };
  }
  return { ok: true, output: evaluateUsage(modelo, input.instances) };
}
