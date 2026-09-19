// Reguloj with checkability "automatic" are enforced by validation (Spec 001, D-19; task T013):
// the Regularo, with its kialoj, is the switch. A "manual" Regulo is documentation only.

import { rmSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import { fixtureModeloSource } from "../load/source.js";
import { mutatedMinimal } from "./test-doubles/fixtures.js";
import { validateModelo } from "./validate-modelo.js";

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

type Reguloj = { reguloj: Record<string, unknown>[] };
type Core = { color: Record<string, Record<string, Record<string, unknown>>> };

function run(
  checkability: "automatic" | "manual",
  name: string,
  changeCore: (core: Core) => void,
  extraRegulo?: Record<string, unknown>,
) {
  const root = mutatedMinimal((edit) => {
    edit("data/reguloj.json", (file: Reguloj) => {
      for (const regulo of file.reguloj) {
        if (regulo.name === name) regulo.checkability = checkability;
      }
      if (extraRegulo !== undefined) file.reguloj.push({ ...extraRegulo, checkability });
    });
    edit("vortaro/sets/core.json", (core: Core) => changeCore(core));
  });
  roots.push(root);
  return validateModelo(fixtureModeloSource(root)).errors.map((issue) => [issue.rule, issue.path]);
}

const literalText = (core: Core) => {
  const text = core.color.text?.default;
  if (text) text.$value = { colorSpace: "srgb", components: [0, 0, 0], hex: "#000000" };
};

describe("semantic-colors-alias-palette → color-semantic-literal", () => {
  it("reports a semantic colour with a literal value when the Regulo is automatic", () => {
    expect(run("automatic", "semantic-colors-alias-palette", literalText)).toEqual([
      ["color-semantic-literal", "vortaro/sets/core.json#/color/text/default"],
    ]);
  });

  it("stays silent while the Regulo is manual", () => {
    expect(run("manual", "semantic-colors-alias-palette", literalText)).toEqual([]);
  });
});

describe("color-roles-declared → color-role-missing", () => {
  const regulo = {
    id: "reg_01M2WRK8G0GGGGGGGGGGGGGGG1",
    name: "color-roles-declared",
    statement: "Every colour token declares its role.",
    kialo: "Roles let the contrast gate and agents reason about how a colour is used.",
    scope: "vortaro: color tokens",
  };

  it("reports every colour token without a role when the Regulo is automatic", () => {
    const issues = run("automatic", "color-roles-declared", () => {}, regulo).filter(
      ([rule]) => rule !== "id-unregistered",
    );
    expect(issues.length).toBeGreaterThan(0);
    expect(new Set(issues.map(([rule]) => rule))).toEqual(new Set(["color-role-missing"]));
    expect(issues.map(([, path]) => path)).toContain(
      "vortaro/sets/core.json#/color/palette/neutral/0",
    );
  });
});
