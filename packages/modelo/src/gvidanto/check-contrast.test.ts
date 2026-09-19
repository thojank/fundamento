// check_contrast (Spec 002 FR-09, plan D-11, R3) on core + aspekto-ekzemplo, including the parity
// with the Alirebleco check for every declared KontrastParo in every combination (AK-04).

import { describe, expect, it } from "vitest";
import { evaluateAlirebleco } from "../checks/alirebleco/evaluate.js";
import { truncate2 } from "../checks/alirebleco/metrics.js";
import { loadModelo } from "../load/load-modelo.js";
import { projectModeloSource } from "../load/source.js";
import { formatCombination } from "../resolve/assignment.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";
import { type CheckContrastOutput, checkContrast } from "./check-contrast.js";

const config = `${fixtureRoot("valid", "aspekto-ekzemplo")}/fundamento.config.json`;
const { modelo } = loadModelo(projectModeloSource(config));
if (modelo === undefined) throw new Error("core + ekzemplo must load");

function success(input: Parameters<typeof checkContrast>[1]): CheckContrastOutput {
  if (modelo === undefined) throw new Error("unreachable");
  const result = checkContrast(modelo, input);
  if (!result.ok) throw new Error(JSON.stringify(result.issues));
  return result.output;
}

describe("check_contrast", () => {
  it("answers a declared pair over every combination, grouped by result", () => {
    const out = success({ foreground: "color.text.muted", background: "color.background.sunken" });
    expect(out.declared).toMatchObject({
      name: "text-muted-on-background-sunken",
      position: "main",
    });
    expect(out.kategorio).toBe("text-normal");
    expect(out.kategorioSource).toBe("declared");
    const listed = out.results.flatMap((group) => group.combinations);
    expect(listed).toHaveLength(144);
    expect(new Set(listed).size).toBe(144);
    expect(out.summary.combinations).toBe(144);
    expect(out.results.length).toBeLessThan(20);
    // A group may span Aspektoj: grouping is by result, not by Dimensio values.
    for (const group of out.results) {
      expect(group.passed).toBe(group.ratio >= group.threshold);
    }
  });

  it("answers one combination for an assignment, defaults filled in", () => {
    const out = success({
      foreground: "color.text.subtle",
      background: "color.background.default",
      assignment: { aspekto: "komuna", "color-scheme": "dark", contrast: "high" },
    });
    expect(out.results).toHaveLength(1);
    expect(out.results[0]?.combinations).toEqual([
      "aspekto=komuna,viewport=medium,density=default,color-scheme=dark,contrast=high,motion=default",
    ]);
  });

  it("measures undeclared pairs, with the kategorio taken from the foreground's role", () => {
    const out = success({
      foreground: "color.text.default",
      background: "color.action.primary.rest",
    });
    expect(out.declared).toBeNull();
    expect(out.kategorio).toBe("text-normal");
    expect(out.kategorioSource).toBe("role");
    const border = success({
      foreground: "color.border.strong",
      background: "color.background.sunken",
    });
    expect(border.kategorio).toBe("ui");
  });

  it("lets the input kategorio win and says so", () => {
    const out = success({
      foreground: "color.text.muted",
      background: "color.background.sunken",
      kategorio: "text-large",
    });
    expect(out.kategorioSource).toBe("input");
    expect(out.kategorio).toBe("text-large");
  });

  it("reports the aux branch of a status pair and keeps branch and aux ratio in the group key", () => {
    const out = success({
      foreground: "color.status.warning.basic",
      background: "color.background.default",
    });
    const aux = out.results.filter((group) => group.branch === "aux");
    expect(aux).toHaveLength(1);
    expect(aux[0]?.combinations).toHaveLength(18);
    expect(aux[0]?.auxRatio).toBeGreaterThanOrEqual(3);
    expect(aux[0]?.ratio).toBeLessThan(3);
    const viaBorder = success({
      foreground: "color.status.warning.border",
      background: "color.background.default",
    });
    expect(viaBorder.declared).toMatchObject({
      name: "status-warning-basic-on-background-default",
      position: "aux",
    });
  });

  it("truncates ratios to two decimals, never rounds up", () => {
    const out = success({ foreground: "color.text.muted", background: "color.background.sunken" });
    for (const group of out.results) {
      expect(String(group.ratio)).toMatch(/^\d+(\.\d{1,2})?$/);
    }
  });

  it.each([
    [{ foreground: "color.text.mutd", background: "color.background.default" }, "token-unknown"],
    [
      { foreground: "spacing.medium", background: "color.background.default" },
      "kontrast-not-color",
    ],
    [
      { foreground: "color.palette.neutral.500", background: "color.background.default" },
      "kategorio-required",
    ],
  ])("rejects %j with %s", (input, rule) => {
    if (modelo === undefined) throw new Error("unreachable");
    const result = checkContrast(modelo, input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues.map((issue) => issue.rule)).toEqual([rule]);
  });
});

describe("AK-04: parity with the Alirebleco check for every declared pair and combination", () => {
  if (modelo === undefined) throw new Error("unreachable");
  const evaluation = evaluateAlirebleco(modelo, {
    kontrastParojFile: "data/kontrastparoj.json",
    collect: true,
  });

  it.each(modelo.kontrastParoj.map((pair) => [pair.name, pair] as const))("%s", (_name, pair) => {
    if (modelo === undefined) throw new Error("unreachable");
    const out = success({ foreground: pair.foreground, background: pair.background });
    const groupOf = new Map<string, CheckContrastOutput["results"][number]>();
    for (const group of out.results)
      for (const combination of group.combinations) groupOf.set(combination, group);
    const measured = (evaluation.measurements ?? []).filter(
      (entry) => entry.pair.name === pair.name,
    );
    expect(measured).toHaveLength(144);
    for (const entry of measured) {
      const group = groupOf.get(formatCombination(modelo, entry.combination));
      expect(group?.ratio).toBe(Number(truncate2(entry.main.ratio)));
      expect(group?.threshold).toBe(entry.threshold);
      expect(group?.passed).toBe(entry.passed);
      expect(group?.branch).toBe(entry.branch);
    }
  });
});
