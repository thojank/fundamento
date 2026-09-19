// Spacing, size, shape, elevation, motion, layout, focus and opacity (Spec 001, FR-06, FR-07,
// D-02, D-03, K4; task T015).

import { describe, expect, it } from "vitest";
import { aliasTarget, CORE_SET_NAME } from "../contracts/grammar.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { resolve } from "../resolve/resolve.js";

const { modelo } = loadModelo(defaultModeloSource());
const core = modelo?.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {};

function resolved(assignment: Record<string, string>) {
  if (modelo === undefined) throw new Error("repo did not load");
  const outcome = resolve(modelo, assignment);
  if (!outcome.ok) throw new Error(JSON.stringify(outcome.issues));
  return outcome.rezolvo.tokens;
}

describe("roles over primitive scales (D-02, K4)", () => {
  it.each([
    ["border.width.default", /^border\.width\.scale\./],
    ["border.width.strong", /^border\.width\.scale\./],
    ["border.width.focus", /^border\.width\.scale\./],
    ["motion.duration.fast", /^motion\.duration\.scale\./],
    ["motion.duration.deliberate", /^motion\.duration\.scale\./],
    ["motion.easing.standard", /^motion\.easing\.curve\./],
    ["motion.easing.exit", /^motion\.easing\.curve\./],
    ["spacing.medium", /^spacing\.scale\./],
    ["size.control.medium", /^size\.scale\./],
    ["layout.grid.columns", /^layout\.columns\./],
  ])("%s is a role aliasing a primitive", (name, target) => {
    expect(aliasTarget(core[name]?.value), name).toMatch(target);
  });

  it("keeps Phase-0 IDs across the renames (FR-14)", () => {
    expect(core["motion.duration.fast"]?.id).toBe("tok_01M2VEEE0QJXF3E9TY0JX4XVC2");
    expect(core["elevation.shadow.raised"]?.id).toBe("tok_01M2VEEE0QJXF3E9TY0JX4XVC5");
    expect(core["motion.duration.short"]).toBeUndefined();
    expect(core["shadow.raised"]).toBeUndefined();
  });
});

describe("Dimensioj over these categories", () => {
  it("motion=reduced makes every duration 0 ms and every easing linear (FR-06)", () => {
    const tokens = resolved({ motion: "reduced" });
    for (const role of ["fast", "medium", "slow", "deliberate"]) {
      expect(tokens[`motion.duration.${role}`]?.value, role).toEqual({ value: 0, unit: "ms" });
    }
    for (const role of ["standard", "emphasized", "enter", "exit"]) {
      expect(tokens[`motion.easing.${role}`]?.value, role).toEqual([0, 0, 1, 1]);
    }
  });

  it("contrast=high re-points the default border width to the strong role", () => {
    const tokens = resolved({ contrast: "high" });
    expect(tokens["border.width.default"]?.aliasChain.map((link) => link.token)).toEqual([
      "border.width.default",
      "border.width.strong",
      "border.width.scale.2",
    ]);
  });

  it("viewport sets the grid: 4, 8 or 12 columns (FR-07)", () => {
    expect(resolved({ viewport: "compact" })["layout.grid.columns"]?.value).toBe(4);
    expect(resolved({})["layout.grid.columns"]?.value).toBe(8);
    expect(resolved({ viewport: "expanded" })["layout.grid.columns"]?.value).toBe(12);
  });

  it("composes the focus ring from the focus colour, width and stroke", () => {
    const ring = resolved({})["focus.ring"];
    expect(ring?.type).toBe("border");
    expect(Object.keys(ring?.fieldAliases ?? {}).sort()).toEqual(["/color", "/style", "/width"]);
  });
});
