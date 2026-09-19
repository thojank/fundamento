// Modelo schema extensions and rule catalog of Spec 002 (task T002; D-02, D-03).

import { readFileSync } from "node:fs";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { createModeloAjv, getModeloValidator } from "./ajv.js";
import { matchesTokenPattern, TOKEN_NAME_PATTERN, TOKEN_PATTERN_PATTERN } from "./grammar.js";
import { RULE_IDS } from "./issues.js";
import { readModeloSchema } from "./schema.js";

const ajv = createModeloAjv();
const v = (def: string) => getModeloValidator(ajv, def);

const regulo = {
  id: "reg_01M2VEEE5280TGESDHQQ14EA33",
  name: "state-distinct",
  statement: "States differ from rest by at least 0.05 in OKLCH lightness.",
  kialo: "A state that looks like rest gives no feedback.",
  scope: "vortaro: color.action.*",
  checkability: "automatic",
};

describe("Regulo appliesTo and sojlo (D-02)", () => {
  it("accepts token patterns, roles and types", () => {
    const entry = {
      ...regulo,
      appliesTo: {
        tokens: ["color.action.*.hover", "typography.**", "color.text.default"],
        roles: ["focus"],
        types: ["color"],
      },
      sojlo: { metric: "oklch-l-delta", min: 0.05 },
    };
    expect(v("Regulo")(entry), JSON.stringify(v("Regulo").errors)).toBe(true);
  });

  it.each([
    ["an empty appliesTo", { appliesTo: {} }],
    ["an empty token list", { appliesTo: { tokens: [] } }],
    ["an unknown role", { appliesTo: { roles: ["hero"] } }],
    ["an unknown appliesTo key", { appliesTo: { sets: ["core"] } }],
    ["** in the middle", { appliesTo: { tokens: ["color.**.hover"] } }],
    ["an unknown metric", { sojlo: { metric: "delta-e", min: 0.05 } }],
    ["a zero threshold", { sojlo: { metric: "oklch-l-delta", min: 0 } }],
    ["a sojlo without min", { sojlo: { metric: "oklch-l-delta" } }],
  ])("rejects %s", (_label, extra) => {
    expect(v("Regulo")({ ...regulo, ...extra })).toBe(false);
  });

  it("keeps the TokenPattern schema in sync with the grammar constant", () => {
    const defs = readModeloSchema().$defs as Record<string, unknown>;
    expect(defs.TokenPattern).toEqual({ type: "string", pattern: TOKEN_PATTERN_PATTERN.source });
  });
});

describe("matchesTokenPattern (D-02)", () => {
  it.each([
    ["color.text.default", "color.text.default", true],
    ["color.text.default", "color.text.subtle", false],
    ["color.action.*.hover", "color.action.primary.hover", true],
    ["color.action.*.hover", "color.action.primary.rest", false],
    ["color.action.*.hover", "color.action.primary.text.hover", false],
    ["typography.**", "typography.body.1", true],
    ["typography.**", "typography", false],
    ["spacing.*", "spacing.medium", true],
    ["spacing.*", "spacing.scale.3", false],
  ])("%s against %s is %s", (pattern, name, expected) => {
    expect(matchesTokenPattern(pattern, name)).toBe(expected);
  });

  it("every token name is a pattern that matches itself and only itself", () => {
    const segment = fc.stringMatching(/^[a-z0-9]{1,6}$/);
    const name = fc.array(segment, { minLength: 1, maxLength: 5 }).map((parts) => parts.join("."));
    fc.assert(
      fc.property(name, name, (a, b) => {
        expect(TOKEN_NAME_PATTERN.test(a)).toBe(true);
        expect(TOKEN_PATTERN_PATTERN.test(a)).toBe(true);
        expect(matchesTokenPattern(a, a)).toBe(true);
        expect(matchesTokenPattern(a, b)).toBe(a === b);
      }),
    );
  });
});

describe("rule catalog (Spec 002 data-model §7)", () => {
  it("contains every rule listed in the Spec 002 data model", () => {
    const dataModel = readFileSync(
      new URL("../../../../specs/002-regularo-gvidanto/data-model.md", import.meta.url),
      "utf8",
    );
    const section = dataModel.slice(
      dataModel.indexOf("## 7. New rule-catalog entries"),
      dataModel.indexOf("## 8."),
    );
    const listed = [...section.matchAll(/^\| `([a-z0-9-]+)` \|/gm)].map((m) => m[1] ?? "");
    expect(listed).toHaveLength(9);
    for (const rule of listed) {
      expect(RULE_IDS, rule).toContain(rule);
    }
  });
});
