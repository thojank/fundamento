// check_usage (Spec 003, FR-13, plan D-16 §3): judges instances of a design or of code against
// the Ero Reguloj and the Skemo constraints. The judgement itself is `evaluateUsage`; this adds
// the input validation the tool contract asks for: a prop or a value the Skemo does not know is
// invalid input (`mcp-input-invalid` with `allowed`), not a violation of a Regulo. The same holds
// for an Aspekto or a Dimensio value the Modelo does not know (Spec 007, D-04). Pure.

import type { ValidationIssue } from "../contracts/issues.js";
import type { EroInstance, Modelo, Skemo } from "../contracts/modelo.js";
import { evaluateUsage, type UsageResult } from "../eroj/usage.js";
import { ASPEKTO_DIMENSIO } from "../load/build.js";
import { valoroNames } from "../resolve/assignment.js";

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

/**
 * The Aspekto or the first Dimensio value of an instance the Modelo does not know (D-04). Slots
 * and the layout of the Uzo are judged in Stufe B (T024); here they are only input.
 */
function contextIssue(
  modelo: Modelo,
  instance: EroInstance,
  index: number,
): { issue: ValidationIssue; allowed: string[] } | undefined {
  const base = `check_usage/instances/${index}`;
  if (instance.aspekto !== undefined) {
    const aspektoj = modelo.dimensioj
      .filter((dimensio) => dimensio.name === ASPEKTO_DIMENSIO)
      .flatMap(valoroNames);
    if (!aspektoj.includes(instance.aspekto)) {
      return {
        issue: invalid(
          `${base}/aspekto`,
          `The Aspekto ${instance.aspekto} is not part of the Modelo.`,
          "Use one of the Aspektoj in allowed (list_aspektoj), or leave aspekto out.",
        ),
        allowed: aspektoj,
      };
    }
  }
  for (const [name, value] of Object.entries(instance.dimensioj ?? {})) {
    const dimensio = modelo.dimensioj.find((candidate) => candidate.name === name);
    if (dimensio === undefined) {
      return {
        issue: invalid(
          `${base}/dimensioj/${name}`,
          `The Modelo has no Dimensio ${name}.`,
          "Use one of the Dimensioj in allowed (list_dimensioj).",
        ),
        allowed: modelo.dimensioj.map((candidate) => candidate.name),
      };
    }
    const values = valoroNames(dimensio);
    if (!values.includes(value)) {
      return {
        issue: invalid(
          `${base}/dimensioj/${name}`,
          `${name}=${value} is not a value of the Dimensio ${name}.`,
          "Use one of the values in allowed.",
        ),
        allowed: values,
      };
    }
  }
  return undefined;
}

export function checkUsage(modelo: Modelo, input: CheckUsageInput): CheckUsageResult {
  const byName = new Map(modelo.eroj.map((entry) => [entry.ero.name, entry]));
  for (const [index, instance] of input.instances.entries()) {
    const context = contextIssue(modelo, instance, index);
    if (context !== undefined) {
      return { ok: false, issues: [context.issue], allowed: context.allowed };
    }
    // An unknown Ero is a finding of the evaluation (ero-unknown), not invalid input.
    const entry = byName.get(instance.ero);
    if (entry === undefined) continue;
    const found = propIssue(entry.skemo, instance, index);
    if (found !== undefined) return { ok: false, issues: [found.issue], allowed: found.allowed };
  }
  return { ok: true, output: evaluateUsage(modelo, input.instances) };
}
