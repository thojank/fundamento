// explain_regulo (Spec 002 FR-11, plan D-13): a Regulo with its reason, check and violations.

import { describe, expect, it } from "vitest";
import type { ValidationIssue } from "../contracts/issues.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { explainRegulo } from "./explain-regulo.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("repo must load");
const stateDistinct = modelo.reguloj.find((regulo) => regulo.name === "state-distinct");
if (stateDistinct === undefined) throw new Error("state-distinct missing");

const issue = (aspekto: string | undefined): ValidationIssue => ({
  rule: "state-distinct",
  severity: "error",
  path: "rezolvo(…)/color.action.tertiary.hover",
  message: "…",
  suggestion: "…",
  ...(aspekto === undefined ? {} : { combination: { aspekto } }),
  regulo: { id: stateDistinct.id, name: stateDistinct.name, kialo: stateDistinct.kialo },
});

describe("explain_regulo (FR-11)", () => {
  it("finds a Regulo by name and by ID, with statement, kialo, check, scope and sojlo", () => {
    if (modelo === undefined) throw new Error("unreachable");
    const byName = explainRegulo(modelo, { name: "state-distinct" }, { errors: [], warnings: [] });
    const byId = explainRegulo(modelo, { id: stateDistinct.id }, { errors: [], warnings: [] });
    expect(byName).toEqual(byId);
    if (!byName.ok) throw new Error("not found");
    expect(byName.output).toMatchObject({
      name: "state-distinct",
      kialo: stateDistinct.kialo,
      checkability: "automatic",
      sojlo: { metric: "oklch-l-delta", min: 0.05 },
      violations: { unit: "distinct", total: 0, byAspekto: {} },
    });
    expect(byName.output.appliesTo?.tokens).toContain("color.action.*.hover");
  });

  it("counts the distinct violations of the served report per Aspekto", () => {
    if (modelo === undefined) throw new Error("unreachable");
    const report = {
      errors: [issue("komuna"), issue("komuna"), issue("ekzemplo"), issue(undefined)],
      warnings: [],
    };
    const result = explainRegulo(modelo, { name: "state-distinct" }, report);
    if (!result.ok) throw new Error("not found");
    expect(result.output.violations).toEqual({
      unit: "distinct",
      total: 4,
      byAspekto: { komuna: 2, ekzemplo: 1, core: 1 },
    });
  });

  it("answers an unknown name with regulo-unknown and the nearest names", () => {
    if (modelo === undefined) throw new Error("unreachable");
    const result = explainRegulo(modelo, { name: "state-distinkt" }, { errors: [], warnings: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.rule).toBe("regulo-unknown");
      expect(result.allowed?.[0]).toBe("state-distinct");
    }
  });
});
