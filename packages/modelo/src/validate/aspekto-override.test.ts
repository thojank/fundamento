// F28 (An P0, Maintainer 2026-09-23): an Aspekto may differ from the reference in *every*
// category — not only in colour. What it may never do is lower a floor that protects a person:
// the minimum pointer target and the thickness of the focus indicator are the standard's, not the
// brand's. Both sides are measured here against the real core, on throwaway copies of the
// Aspekto package fixture (`mutatedFixture`), so no 2 300-line fixture is committed for a rule
// variant.

import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateAlirebleco } from "../checks/alirebleco/evaluate.js";
import { loadModelo } from "../load/load-modelo.js";
import { projectModeloSource } from "../load/source.js";
import { resolve } from "../resolve/resolve.js";
import { mutatedFixture } from "./test-doubles/fixtures.js";
import { validateModelo } from "./validate-modelo.js";

const SET = "aspekto-ekzemplo/sets/aspekto/ekzemplo.json";

type Json = Record<string, unknown>;

/** Re-points the token at a dotted path inside a set document. */
function put(set: Json, path: string, value: unknown): void {
  let node = set;
  for (const key of path.split(".")) {
    const next = node[key];
    if (typeof next !== "object" || next === null)
      throw new Error(`${path} is no token of the set`);
    node = next as Json;
  }
  node.$value = value;
}

/** A copy of the two-brand fixture whose Aspekto set was changed, as a project source. */
function brand(change: (set: Json) => void) {
  const root = mutatedFixture("aspekto-ekzemplo", (edit) => {
    edit(SET, (value) => {
      change(value as Json);
      return value;
    });
  });
  return projectModeloSource(join(root, "fundamento.config.json"));
}

const px = (value: number) => ({ value, unit: "px" });

/** The resolved value of `token` in the base combination of `aspekto`. */
function resolvedValue(
  source: ReturnType<typeof projectModeloSource>,
  aspekto: string,
  token: string,
) {
  const { modelo } = loadModelo(source);
  if (modelo === undefined) throw new Error("did not load");
  const outcome = resolve(modelo, { aspekto });
  if (!outcome.ok) throw new Error(JSON.stringify(outcome.issues));
  return outcome.rezolvo.tokens[token]?.value;
}

describe("an Aspekto may override every category (F28)", () => {
  // One token per category, each moved away from the core's value. The Modelo must accept all of
  // them: a brand's stance is its spacing, its sizes, its motion and its layout as much as its
  // colour.
  const source = brand((set) => {
    put(set, "spacing.scale.400", px(14));
    put(set, "size.scale.700", px(44));
    put(set, "radius.xlarge", px(28));
    put(set, "motion.duration.scale.2", { value: 120, unit: "ms" });
    put(set, "layout.grid.columns", "{layout.columns.12}");
    put(set, "opacity.hover", 0.14);
  });

  it("validates: no rule forbids a brand its own measures", { timeout: 60_000 }, () => {
    const report = validateModelo(source);
    expect(report.errors).toEqual([]);
  });

  it("resolves to different values per Aspekto in every changed category", () => {
    const cases: [string, unknown][] = [
      ["spacing.large", px(14)],
      ["size.control.medium", px(44)],
      ["radius.xlarge", px(28)],
      ["motion.duration.medium", { value: 120, unit: "ms" }],
      ["layout.grid.columns", 12],
      ["opacity.hover", 0.14],
    ];
    for (const [token, expected] of cases) {
      expect(resolvedValue(source, "ekzemplo", token), token).toEqual(expected);
      expect(resolvedValue(source, "komuna", token), token).not.toEqual(expected);
    }
  });
});

describe("the floors hold, whatever measures a brand picks (F28)", () => {
  it("refuses a brand that lowers the minimum pointer target", { timeout: 60_000 }, () => {
    const source = brand((set) => {
      put(set, "size.target.min", "{size.scale.100}");
      put(set, "size.control.small", "{size.scale.200}");
    });
    const report = validateModelo(source);
    const issue = report.errors.find((entry) => entry.rule === "protected-minimum");
    expect(issue?.message).toContain("size.target.min");
    expect(issue?.message).toContain("12px");
    expect(issue?.message).toContain("24px");
    expect(issue?.path).toContain("aspekto=ekzemplo");
  });

  it("refuses a brand whose focus ring has no width", { timeout: 60_000 }, () => {
    const source = brand((set) => {
      put(set, "border.width.focus", px(0));
    });
    const report = validateModelo(source);
    const issue = report.errors.find((entry) => entry.rule === "protected-minimum");
    expect(issue?.message).toContain("focus.ring");
    expect(issue?.message).toContain("0px");
    expect(issue?.message).toContain("2px");
  });

  it("keeps touch-target-min for a brand that shrinks its controls", { timeout: 60_000 }, () => {
    const source = brand((set) => {
      put(set, "size.control.small", "{size.scale.300}");
    });
    const report = validateModelo(source);
    const issue = report.errors.find((entry) => entry.rule === "touch-target-min");
    expect(issue?.message).toContain("size.control.small is 20px");
    expect(issue?.message).toContain("size.target.min (24px)");
  });

  it("refuses a brand that breaks a KontrastParo, with pair and ratio", { timeout: 60_000 }, () => {
    const source = brand((set) => {
      put(set, "color.action.primary.rest", "{color.palette.accent.800}");
    });
    const { modelo } = loadModelo(source);
    if (modelo === undefined) throw new Error("did not load");
    const evaluation = evaluateAlirebleco(modelo, {
      kontrastParojFile: "data/kontrastparoj.json",
    });
    const issue = evaluation.errors.find((entry) => entry.rule === "contrast-below-threshold");
    expect(issue?.message).toContain("action-primary-text-on-fill");
    expect(issue?.message).toMatch(/ratio 1\.\d+:1/);
    expect(issue?.message).toContain("aspekto=ekzemplo");
  });
});
