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

describe("dimensio-sets-alias-only → dimensio-set-literal / dimensio-set-primitive", () => {
  const regulo = {
    id: "reg_01M2WRK8G0GGGGGGGGGGGGGGG2",
    name: "dimensio-sets-alias-only",
    statement: "Generic Dimensio sets only re-point role tokens with aliases.",
    kialo:
      "They outrank every Aspekto; a literal or a re-pointed primitive would reach every brand.",
    scope: "vortaro: sets without an aspekto condition",
  };

  it("accepts valid/minimal, whose generic sets only re-point roles, when automatic", () => {
    const rules = run("automatic", "dimensio-sets-alias-only", () => {}, regulo).map(
      ([rule]) => rule,
    );
    // The violations themselves are the fixtures invalid/dimensio-set-literal and -primitive.
    expect(rules.filter((rule) => rule?.startsWith("dimensio-set-"))).toEqual([]);
  });

  it("stays silent while the Regulo is manual", () => {
    const rules = run("manual", "dimensio-sets-alias-only", () => {}, regulo).map(([rule]) => rule);
    expect(rules.filter((rule) => rule?.startsWith("dimensio-set-"))).toEqual([]);
  });
});

describe("contrast-pairs-declared → kontrastparo-missing-for-role", () => {
  it("reports every checked role that appears in no KontrastParo when automatic", () => {
    const root = mutatedMinimal((edit) => {
      edit("data/reguloj.json", (file: Reguloj) => {
        file.reguloj.push({
          id: "reg_01M2WRK8G0GGGGGGGGGGGGGGG3",
          name: "contrast-pairs-declared",
          statement: "Every foreground, border and focus colour is paired with its backgrounds.",
          kialo: "Contrast is only checked for declared pairs.",
          scope: "vortaro: color tokens",
          checkability: "automatic",
        });
      });
      edit("data/kontrastparoj.json", () => ({ kontrastParoj: [] }));
    });
    roots.push(root);
    const issues = validateModelo(fixtureModeloSource(root))
      .errors.filter((issue) => issue.rule === "kontrastparo-missing-for-role")
      .map((issue) => issue.path);
    expect(issues).toEqual([
      "vortaro/sets/core.json#/color/background/default",
      "vortaro/sets/core.json#/color/text/default",
    ]);
  });
});

describe("issues cite their Regulo (Spec 002 FR-08, D-03)", () => {
  it("carries id, name and kialo of the declaring Regulo on every enforcer issue", () => {
    const root = mutatedMinimal((edit) => {
      edit("data/reguloj.json", (file: Reguloj) => {
        for (const regulo of file.reguloj) regulo.checkability = "automatic";
      });
      edit("vortaro/sets/core.json", (core: Core) => literalText(core));
    });
    roots.push(root);
    const issue = validateModelo(fixtureModeloSource(root)).errors.find(
      (candidate) => candidate.rule === "color-semantic-literal",
    );
    expect(issue?.regulo).toEqual({
      id: "reg_01K5FMAJ0J14KNVH5BXJ93VFBG",
      name: "semantic-colors-alias-palette",
      kialo: "A palette change then reaches every semantic use in one place.",
    });
  });

  it("leaves issues of always-on rules without a Regulo", () => {
    const root = mutatedMinimal((edit) => {
      edit("vortaro/sets/core.json", (core: Core) => {
        const text = core.color.text?.default;
        if (text) text.$value = "{color.missing}";
      });
    });
    roots.push(root);
    const issues = validateModelo(fixtureModeloSource(root)).errors;
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.every((issue) => issue.regulo === undefined)).toBe(true);
  });
});
