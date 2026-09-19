// explain_regulo (Spec 002 FR-11; plan D-13): what a Regulo says, why, how it is checked, and how
// often the served Modelo violates it. Violations are counted from the served report, one per
// distinct violation (as validation reports them), per Aspekto; issues without a combination
// count under "core". Pure.

import type { ValidationIssue } from "../contracts/issues.js";
import type { Jugxo, Modelo, Regulo } from "../contracts/modelo.js";
import { ASPEKTO_DIMENSIO } from "../load/build.js";
import { nearestNames } from "./nearest.js";

export type ExplainReguloInput = { name: string } | { id: string };

export interface ExplainReguloOutput {
  id: string;
  name: string;
  statement: string;
  kialo: string;
  checkability: string;
  scope: string;
  aspekto?: string;
  appliesTo?: Regulo["appliesTo"];
  sojlo?: Regulo["sojlo"];
  violations: { unit: "distinct"; total: number; byAspekto: Record<string, number> };
  jugxoj: Jugxo[];
}

export type ExplainReguloResult =
  | { ok: true; output: ExplainReguloOutput }
  | { ok: false; issues: ValidationIssue[]; allowed?: string[] };

export function explainRegulo(
  modelo: Modelo,
  input: ExplainReguloInput,
  report: { errors: readonly ValidationIssue[]; warnings: readonly ValidationIssue[] },
): ExplainReguloResult {
  const regulo =
    "id" in input
      ? modelo.reguloj.find((entry) => entry.id === input.id)
      : modelo.reguloj.find((entry) => entry.name === input.name);
  if (regulo === undefined) {
    const wanted = "id" in input ? input.id : input.name;
    const candidates = modelo.reguloj.map((entry) => ("id" in input ? entry.id : entry.name));
    return {
      ok: false,
      issues: [
        {
          rule: "regulo-unknown",
          severity: "error",
          path: `explain_regulo/${"id" in input ? "id" : "name"}`,
          message: `There is no Regulo ${wanted}.`,
          suggestion: "Use one of the nearest names in allowed, or list_reguloj.",
        },
      ],
      allowed: nearestNames(wanted, candidates),
    };
  }
  const byAspekto: Record<string, number> = {};
  let total = 0;
  for (const issue of [...report.errors, ...report.warnings]) {
    if (issue.regulo?.id !== regulo.id) continue;
    const aspekto = issue.combination?.[ASPEKTO_DIMENSIO] ?? "core";
    byAspekto[aspekto] = (byAspekto[aspekto] ?? 0) + 1;
    total += 1;
  }
  const jugxoj = modelo.jugxoj
    .filter((jugxo) => "regulo" in jugxo.ref && jugxo.ref.regulo === regulo.id)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1));
  return {
    ok: true,
    output: {
      id: regulo.id,
      name: regulo.name,
      statement: regulo.statement,
      kialo: regulo.kialo,
      checkability: regulo.checkability,
      scope: regulo.scope,
      ...(regulo.aspekto === undefined ? {} : { aspekto: regulo.aspekto }),
      ...(regulo.appliesTo === undefined ? {} : { appliesTo: regulo.appliesTo }),
      ...(regulo.sojlo === undefined ? {} : { sojlo: regulo.sojlo }),
      violations: { unit: "distinct", total, byAspekto },
      jugxoj,
    },
  };
}
