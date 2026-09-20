// check_usage (Spec 003 T024, FR-13, D-16 §3): instances of a design or of code against the
// Ero Reguloj. The answer is the usage evaluation; invalid input is an envelope, not a violation.

import { describe, expect, it } from "vitest";
import { evaluateUsage } from "../eroj/usage.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { checkUsage } from "./check-usage.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repository Modelo could not be loaded");

const check = (instances: Parameters<typeof checkUsage>[1]["instances"]) => {
  const result = checkUsage(modelo, { instances });
  if (!result.ok) throw new Error("check_usage failed");
  return result.output;
};

describe("check_usage", () => {
  it("equals the usage evaluation", () => {
    const instances = [
      { ero: "butono", props: { variant: "primary" }, container: "dialog", label: "Speichern" },
      { ero: "butono", props: { variant: "primary" }, container: "dialog", label: "Weiter" },
    ];
    expect(check(instances)).toEqual(evaluateUsage(modelo, instances));
  });

  it("finds two primary buttons in one container, with the kialo of the Regulo", () => {
    const output = check([
      { ero: "butono", props: { variant: "primary" }, container: "dialog", label: "Speichern" },
      { ero: "butono", props: { variant: "primary" }, container: "dialog", label: "Weiter" },
    ]);
    expect(output.valid).toBe(false);
    expect(output.instances).toBe(2);
    expect(output.violations).toHaveLength(1);
    const [violation] = output.violations;
    expect(violation?.instance).toEqual([0, 1]);
    expect(violation?.issue.rule).toBe("one-primary-per-container");
    expect(violation?.issue.regulo?.kialo.length ?? 0).toBeGreaterThan(0);
  });

  it("accepts a correct screen", () => {
    const output = check([
      { ero: "butono", props: { variant: "primary" }, container: "dialog", label: "Speichern" },
      { ero: "butono", props: { variant: "tertiary" }, container: "dialog", label: "Abbrechen" },
    ]);
    expect(output).toEqual({ instances: 2, valid: true, violations: [] });
  });

  it("finds a destructive action in the primary colour and a forbidden combination", () => {
    const destructive = check([{ ero: "butono", props: { variant: "primary" }, label: "Löschen" }]);
    expect(destructive.violations.map((entry) => entry.issue.rule)).toEqual([
      "destructive-not-primary-color",
    ]);
    const forbidden = check([
      { ero: "butono", props: { variant: "secondary", tone: "danger" }, label: "Löschen" },
    ]);
    expect(forbidden.violations.map((entry) => entry.issue.rule)).toContain("ero-prop-constraint");
  });

  it("finds a button without a label", () => {
    const output = check([{ ero: "butono", props: { variant: "tertiary" } }]);
    expect(output.violations.map((entry) => entry.issue.rule)).toEqual(["label-required"]);
  });

  it("answers an unknown Ero with ero-unknown as a violation", () => {
    const output = check([{ ero: "butonno", props: {} }]);
    expect(output.violations.map((entry) => entry.issue.rule)).toEqual(["ero-unknown"]);
  });

  it("answers an unknown prop value with mcp-input-invalid and the allowed values", () => {
    const result = checkUsage(modelo, {
      instances: [{ ero: "butono", props: { variant: "primar" }, label: "Speichern" }],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.map((issue) => issue.rule)).toEqual(["mcp-input-invalid"]);
    expect(result.issues[0]?.path).toBe("check_usage/instances/0/props/variant");
    expect(result.allowed).toEqual(["primary", "secondary", "tertiary"]);
  });

  it("answers an unknown prop name with mcp-input-invalid and the props of the Skemo", () => {
    const result = checkUsage(modelo, {
      instances: [{ ero: "butono", props: { variante: "primary" }, label: "Speichern" }],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues[0]?.path).toBe("check_usage/instances/0/props/variante");
    expect(result.allowed).toContain("variant");
  });
});
