// explain (Spec 002 FR-10, plan D-12, AK-05): why a token has its value in one combination.

import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { fixtureModeloSource, projectModeloSource } from "../load/source.js";
import { resolveCombination } from "../resolve/resolve.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";
import { validateModelo } from "../validate/validate-modelo.js";
import { type ExplainOutput, explain } from "./explain.js";

const config = `${fixtureRoot("valid", "aspekto-ekzemplo")}/fundamento.config.json`;
const source = projectModeloSource(config);
const { modelo } = loadModelo(source);
if (modelo === undefined) throw new Error("core + ekzemplo must load");
const report = validateModelo(source);

function success(input: Parameters<typeof explain>[1], m = modelo, r = report): ExplainOutput {
  if (m === undefined) throw new Error("unreachable");
  const result = explain(m, input, r);
  if (!result.ok) throw new Error(JSON.stringify(result.issues));
  return result.output;
}

describe("explain (FR-10, AK-05)", () => {
  const assignment = { aspekto: "komuna", "color-scheme": "dark", contrast: "high" };
  const out = success({ token: "color.text.subtle", assignment });

  it("gives the value and the alias chain of resolve, with the package of each set", () => {
    if (modelo === undefined) throw new Error("unreachable");
    const direct = resolveCombination(modelo, assignment).tokens["color.text.subtle"];
    expect(out.value).toEqual(direct?.value);
    expect(out.aliasChain.map(({ token, set }) => ({ token, set }))).toEqual(direct?.aliasChain);
    expect(out.origin.set).toBe("color-scheme/dark+contrast/high");
    expect(out.combination).toBe(
      "aspekto=komuna,viewport=medium,density=default,color-scheme=dark,contrast=high,motion=default",
    );
  });

  it("lists the Reguloj of the token with their stored kialo and the result here", () => {
    if (modelo === undefined) throw new Error("unreachable");
    const byName = new Map(out.reguloj.map((regulo) => [regulo.name, regulo]));
    expect(byName.get("text-hierarchy")).toMatchObject({
      via: "token",
      result: "passed",
      issues: [],
    });
    expect(byName.get("contrast-pairs-declared")).toMatchObject({ via: "role" });
    expect(byName.get("semantic-colors-alias-palette")).toMatchObject({ via: "type" });
    expect(byName.has("state-distinct")).toBe(false);
    for (const regulo of out.reguloj) {
      expect(regulo.kialo).toBe(modelo.reguloj.find((entry) => entry.id === regulo.id)?.kialo);
    }
  });

  it("lists the KontrastParoj of the token with their result in this combination", () => {
    const pair = out.kontrastParoj.find(
      (entry) => entry.name === "text-subtle-on-background-default",
    );
    expect(pair).toMatchObject({
      position: "foreground",
      passed: true,
      branch: "main",
      threshold: 7,
    });
    expect(pair?.main.ratio).toBeGreaterThanOrEqual(7);
  });

  it("explains the border of the ekzemplo warning surface through the aux branch", () => {
    const border = success({
      token: "color.status.warning.border",
      assignment: { aspekto: "ekzemplo" },
    });
    const pair = border.kontrastParoj.find(
      (entry) => entry.name === "status-warning-basic-on-background-default",
    );
    expect(pair).toMatchObject({ position: "aux-foreground", branch: "aux", passed: true });
    expect(pair?.main.ratio).toBeLessThan(3);
    expect(pair?.aux?.ratio).toBeGreaterThanOrEqual(3);
    expect(pair?.kialo).toContain("1.4.11");
  });

  it("shows a violated Regulo with its issue, citing the Regulo", () => {
    const root = fixtureRoot("invalid", "regulo-state-distinct");
    const broken = loadModelo(fixtureModeloSource(root)).modelo;
    const brokenReport = validateModelo(fixtureModeloSource(root));
    const answer = success(
      { token: "color.action.primary.selected", assignment: { "color-scheme": "dark" } },
      broken,
      brokenReport,
    );
    const regulo = answer.reguloj.find((entry) => entry.name === "state-distinct");
    expect(regulo?.result).toBe("violated");
    expect(regulo?.issues[0]).toMatchObject({
      rule: "state-distinct",
      regulo: { name: "state-distinct" },
    });
  });

  it("lists a Regulo without appliesTo only when the token violates it (via issue)", () => {
    const root = fixtureRoot("invalid", "regulo-semantic-described");
    const broken = loadModelo(fixtureModeloSource(root)).modelo;
    const brokenReport = validateModelo(fixtureModeloSource(root));
    const answer = success({ token: "color.text.subtle" }, broken, brokenReport);
    expect(answer.reguloj.find((entry) => entry.name === "semantic-described")).toMatchObject({
      via: "issue",
      result: "violated",
    });
    const clean = success({ token: "color.text.default" }, broken, brokenReport);
    expect(clean.reguloj.some((entry) => entry.name === "semantic-described")).toBe(false);
  });

  it("answers an unknown token with token-unknown and the nearest names", () => {
    if (modelo === undefined) throw new Error("unreachable");
    const result = explain(modelo, { token: "color.text.subtl" }, report);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.rule).toBe("token-unknown");
      expect(result.allowed).toContain("color.text.subtle");
    }
  });
});
