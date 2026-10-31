// Spec 036, Befund 2.2 (V-2): the Zweitfarbe is never an action. Its palette color.palette.sekundo
// and its roles color.sekundo.* colour highlight surfaces, illustrations, badges and charts; an
// action, a link or the focus that aliases them – in any set, directly or through a role of the
// Zweitfarbe – is rejected with a structured error and a suggestion back to the lead colour. The
// rule is a Regulo of the Modelo with its kialo (data/reguloj.json).

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { Regulo } from "../contracts/modelo.js";
import { fixtureModeloSource } from "../load/source.js";
import { fixtureRoot } from "./test-doubles/fixtures.js";
import { validateModelo } from "./validate-modelo.js";

const RULE = "sekundo-not-action";
const FIXTURE = "regulo-sekundo-action";

const reguloj = (
  JSON.parse(readFileSync(new URL("../../data/reguloj.json", import.meta.url), "utf8")) as {
    reguloj: Regulo[];
  }
).reguloj;

const byPath = (a: { path: string }, b: { path: string }) =>
  a.path < b.path ? -1 : a.path > b.path ? 1 : 0;

describe("sekundo-not-action (Spec 036, Befund 2.2, V-2)", () => {
  it("is an automatic Regulo of the Modelo with a kialo, scoped to the roles it guards", () => {
    const regulo = reguloj.find((entry) => entry.name === RULE);
    expect(regulo?.id).toBe("reg_01M69KM4J9STWVW0E2VZK64HC8");
    expect(regulo?.checkability).toBe("automatic");
    expect(regulo?.kialo.length ?? 0).toBeGreaterThan(80);
    expect(regulo?.appliesTo?.tokens).toEqual(
      expect.arrayContaining([
        "color.action",
        "color.link",
        "color.focus",
        "color.palette.sekundo",
      ]),
    );
  });

  it("rejects an action, a link and a focus ring on the Zweitfarbe (path, rule)", () => {
    const report = validateModelo(fixtureModeloSource(fixtureRoot("invalid", FIXTURE)));
    const issues = report.errors.filter((issue) => issue.rule === RULE).sort(byPath);
    expect(issues.map(({ rule, path }) => ({ rule, path }))).toEqual([
      { rule: RULE, path: "vortaro/sets/color-scheme/dark.json#/color/link/rest" },
      { rule: RULE, path: "vortaro/sets/contrast/high.json#/color/focus/ring" },
      { rule: RULE, path: "vortaro/sets/core.json#/color/action/primary/rest" },
    ]);
    const action = issues.find((issue) => issue.path.endsWith("/color/action/primary/rest"));
    expect(action?.message).toContain("color.palette.sekundo.700");
    expect(action?.suggestion).toMatch(/lead colour/);
    const focus = issues.find((issue) => issue.path.endsWith("/color/focus/ring"));
    expect(focus?.message).toContain("color.sekundo.badge.fill");
    expect(action?.regulo?.name).toBe(RULE);
    expect(report.errors.filter((issue) => issue.rule !== RULE)).toEqual([]);
  });

  it("accepts the Zweitfarbe on a badge while the action, the link and the focus keep theirs", () => {
    const report = validateModelo(fixtureModeloSource(fixtureRoot("valid", FIXTURE)));
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
  });
});
