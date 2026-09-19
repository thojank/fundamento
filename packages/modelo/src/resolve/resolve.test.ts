// FR-11 / S4 resolution against small real fixture Vortaroj (no mocks): every combination of the
// test Dimensioj, final value and origin set, priority, specificity, late binding, ties and cycles.

import { describe, expect, it } from "vitest";
import type { AliasLink, Assignment, ResolveOutcome, Rezolvo } from "../contracts/modelo.js";
import {
  allAssignments,
  completeAssignment,
  formatCombination,
  orderActiveSets,
  resolve,
  resolveCombination,
  setOrderKey,
} from "./index.js";
import { loadFixture } from "./test-doubles/fixtures.js";

const color = (r: number, g: number, b: number, hex: string) => ({
  colorSpace: "srgb",
  components: [r, g, b],
  hex,
});
const C0 = color(1, 1, 1, "#ffffff");
const C900 = color(0.1, 0.1, 0.1, "#1a1a1a");
const C1000 = color(0, 0, 0, "#000000");
const DARK900 = color(0.9, 0.9, 0.9, "#e6e6e6");
const BORDER = color(0.5, 0.5, 0.5, "#808080");
const DARK_BORDER = color(0.3, 0.3, 0.3, "#4d4d4d");
const HIGH_BORDER = color(0, 0, 0, "#000000");
const px = (value: number) => ({ value, unit: "px" });
const shadowWith = (shadowColor: unknown) => ({
  color: shadowColor,
  offsetX: px(0),
  offsetY: px(2),
  blur: px(4),
  spread: px(0),
});

const CORE = "core";
const DARK = "color-scheme/dark";
const HIGH = "contrast/high";
const NEUTRA_DARK = "aspekto/neutra+color-scheme/dark";

function expectOk(outcome: ResolveOutcome): Rezolvo {
  if (!outcome.ok) {
    throw new Error(`expected ok, got ${JSON.stringify(outcome.issues)}`);
  }
  return outcome.rezolvo;
}

const link = (token: string, set: string): AliasLink => ({ token, set });

describe("resolve: valid/resolve-matrix, every combination", () => {
  const modelo = loadFixture("valid", "resolve-matrix");

  interface Expected {
    value: unknown;
    set: string;
    chain?: AliasLink[];
    fieldAliases?: Record<string, AliasLink[]>;
  }
  const light: Record<string, Expected> = {
    "color.palette.neutral.0": { value: C0, set: CORE },
    "color.palette.neutral.900": { value: C900, set: CORE },
    "color.palette.neutral.1000": { value: C1000, set: CORE },
    "color.text.default": {
      value: C900,
      set: CORE,
      chain: [link("color.text.default", CORE), link("color.palette.neutral.900", CORE)],
    },
    "color.border.default": { value: BORDER, set: CORE },
    "color.background.default": {
      value: C0,
      set: CORE,
      chain: [link("color.background.default", CORE), link("color.palette.neutral.0", CORE)],
    },
    "shadow.raised": {
      value: shadowWith(C900),
      set: CORE,
      fieldAliases: { "/color": [link("color.palette.neutral.900", CORE)] },
    },
    "spacing.small": { value: px(4), set: CORE },
  };
  const dark: Record<string, Expected> = {
    ...light,
    "color.palette.neutral.900": { value: DARK900, set: DARK },
    // Late binding: core's alias follows the dark palette value; the chain shows both sets.
    "color.text.default": {
      value: DARK900,
      set: CORE,
      chain: [link("color.text.default", CORE), link("color.palette.neutral.900", DARK)],
    },
    "color.border.default": { value: DARK_BORDER, set: DARK },
    // Specificity: the conjunction set beats color-scheme/dark on the same token.
    "color.background.default": {
      value: DARK900,
      set: NEUTRA_DARK,
      chain: [
        link("color.background.default", NEUTRA_DARK),
        link("color.palette.neutral.900", DARK),
      ],
    },
    "shadow.raised": {
      value: shadowWith(DARK900),
      set: CORE,
      fieldAliases: { "/color": [link("color.palette.neutral.900", DARK)] },
    },
  };
  // Priority: contrast (3) outranks color-scheme (2), so contrast/high wins on the border.
  const highBorder: Expected = { value: HIGH_BORDER, set: HIGH };

  const cases: [Assignment, Record<string, Expected>][] = [
    [{ aspekto: "neutra", "color-scheme": "light", contrast: "default" }, light],
    [
      { aspekto: "neutra", "color-scheme": "light", contrast: "high" },
      { ...light, "color.border.default": highBorder },
    ],
    [{ aspekto: "neutra", "color-scheme": "dark", contrast: "default" }, dark],
    [
      { aspekto: "neutra", "color-scheme": "dark", contrast: "high" },
      { ...dark, "color.border.default": highBorder },
    ],
  ];

  it("enumerates exactly these combinations", () => {
    expect(allAssignments(modelo)).toEqual(cases.map(([assignment]) => assignment));
  });

  it.each(cases)("%o", (assignment, expected) => {
    const outcome = resolve(modelo, assignment);
    const rezolvo = expectOk(outcome);
    expect(outcome.ok && outcome.warnings).toEqual([]);
    expect(rezolvo.assignment).toEqual(assignment);
    expect(Object.keys(rezolvo.tokens).sort()).toEqual(Object.keys(expected).sort());
    const core = modelo.setoj.find((set) => set.name === CORE);
    for (const [name, want] of Object.entries(expected)) {
      const token = rezolvo.tokens[name];
      const setId = modelo.setoj.find((set) => set.name === want.set)?.id;
      expect(token, name).toEqual({
        id: core?.tokens[name]?.id,
        type: core?.tokens[name]?.type,
        value: want.value,
        origin: { set: want.set, setId },
        aliasChain: want.chain ?? [],
        ...(want.fieldAliases === undefined ? {} : { fieldAliases: want.fieldAliases }),
      });
    }
  });

  it("returns tokens with sorted keys (deterministic output)", () => {
    const rezolvo = expectOk(resolve(modelo, {}));
    expect(Object.keys(rezolvo.tokens)).toEqual(Object.keys(rezolvo.tokens).sort());
  });

  it("orders active sets: core first, then max priority, then condition count", () => {
    const order = (assignment: Assignment) =>
      orderActiveSets(modelo, assignment).map((set) => set.name);
    expect(order({})).toEqual([CORE]);
    expect(order({ "color-scheme": "dark", contrast: "high" })).toEqual([
      CORE,
      DARK,
      NEUTRA_DARK,
      HIGH,
    ]);
  });

  it("exposes the global sort key (max priority, condition count, name)", () => {
    const keyOf = (name: string) => {
      const set = modelo.setoj.find((candidate) => candidate.name === name);
      if (set === undefined) throw new Error(name);
      return setOrderKey(modelo, set);
    };
    expect(keyOf(DARK)).toEqual({ maxPriority: 2, conditions: 1, name: DARK });
    expect(keyOf(NEUTRA_DARK)).toEqual({ maxPriority: 2, conditions: 2, name: NEUTRA_DARK });
    expect(keyOf(HIGH)).toEqual({ maxPriority: 3, conditions: 1, name: HIGH });
  });
});

describe("resolve: assignments", () => {
  const modelo = loadFixture("valid", "resolve-matrix");

  it("fills a partial assignment with the defaults", () => {
    const rezolvo = expectOk(resolve(modelo, { "color-scheme": "dark" }));
    expect(rezolvo.assignment).toEqual({
      aspekto: "neutra",
      "color-scheme": "dark",
      contrast: "default",
    });
    expect(rezolvo.tokens["color.border.default"]?.origin.set).toBe(DARK);
  });

  it("rejects an unknown Dimensio and lists the allowed Dimensioj", () => {
    const outcome = resolve(modelo, { density: "compact" });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.issues).toHaveLength(1);
    expect(outcome.issues[0]).toMatchObject({
      rule: "resolve-unknown-dimensio",
      severity: "error",
      path: "assignment/density",
    });
    for (const name of ["aspekto", "color-scheme", "contrast"]) {
      expect(outcome.issues[0]?.suggestion).toContain(name);
    }
  });

  it("rejects an unknown valoro and lists the allowed values", () => {
    const outcome = resolve(modelo, { "color-scheme": "dim", contrast: "low" });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.issues.map((issue) => [issue.rule, issue.path])).toEqual([
      ["resolve-unknown-valoro", "assignment/color-scheme"],
      ["resolve-unknown-valoro", "assignment/contrast"],
    ]);
    expect(outcome.issues[0]?.suggestion).toContain("light, dark");
    expect(outcome.issues[1]?.suggestion).toContain("default, high");
    for (const issue of outcome.issues) {
      expect(issue.message).not.toBe("");
    }
  });

  it("completeAssignment returns the complete assignment in priority order", () => {
    const result = completeAssignment(modelo, { contrast: "high" });
    expect(result.issues).toEqual([]);
    expect(Object.entries(result.assignment ?? {})).toEqual([
      ["aspekto", "neutra"],
      ["color-scheme", "light"],
      ["contrast", "high"],
    ]);
    expect(formatCombination(modelo, result.assignment ?? {})).toBe(
      "aspekto=neutra,color-scheme=light,contrast=high",
    );
  });
});

describe("resolve: same priority and same specificity (valid/resolve-tie)", () => {
  const modelo = loadFixture("valid", "resolve-tie");
  const A = "aspekto/neutra+contrast/high";
  const B = "color-scheme/dark+contrast/high";

  it("orders tied sets stably by name, later wins, and warns", () => {
    const assignment = { "color-scheme": "dark", contrast: "high" };
    expect(orderActiveSets(modelo, assignment).map((set) => set.name)).toEqual([CORE, A, B]);
    const outcome = resolve(modelo, assignment);
    if (!outcome.ok) throw new Error(JSON.stringify(outcome.issues));
    expect(outcome.rezolvo.tokens["color.text.default"]?.origin.set).toBe(B);
    expect(outcome.rezolvo.tokens["color.text.default"]?.value).toEqual(color(1, 1, 1, "#ffffff"));
    expect(outcome.warnings).toHaveLength(1);
    expect(outcome.warnings[0]).toMatchObject({
      rule: "set-override-ambiguous",
      severity: "warning",
      path: "rezolvo(aspekto=neutra,color-scheme=dark,contrast=high)/color.text.default",
      combination: { aspekto: "neutra", "color-scheme": "dark", contrast: "high" },
    });
    expect(outcome.warnings[0]?.message).toContain(A);
    expect(outcome.warnings[0]?.message).toContain(B);
  });

  it("suggests the kondicxo that separates the tied sets, preferring the Aspekto set", () => {
    const outcome = resolve(modelo, { "color-scheme": "dark", contrast: "high" });
    if (!outcome.ok) throw new Error(JSON.stringify(outcome.issues));
    const suggestion = outcome.warnings[0]?.suggestion ?? "";
    expect(suggestion).toContain(`Add the kondicxo color-scheme=light to ${A}`);
    expect(suggestion).toContain("aspekto/neutra+color-scheme/light+contrast/high");
    expect(suggestion).toContain("a more specific set that overrides both does not remove");
  });

  it("does not warn when only one of the tied sets is active", () => {
    const outcome = resolve(modelo, { contrast: "high" });
    if (!outcome.ok) throw new Error(JSON.stringify(outcome.issues));
    expect(outcome.warnings).toEqual([]);
    expect(outcome.rezolvo.tokens["color.text.default"]?.origin.set).toBe(A);
  });
});

describe("resolve: cross-set cycle (invalid/resolve-cross-set-cycle)", () => {
  const modelo = loadFixture("invalid", "resolve-cross-set-cycle");

  it("resolves in light, where core alone has no cycle", () => {
    const rezolvo = expectOk(resolve(modelo, { "color-scheme": "light" }));
    expect(rezolvo.tokens["color.a"]?.aliasChain).toEqual([
      link("color.a", CORE),
      link("color.b", CORE),
    ]);
  });

  it("reports alias-cycle with the combination in dark only", () => {
    const outcome = resolve(modelo, { "color-scheme": "dark" });
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.issues).toHaveLength(1);
    expect(outcome.issues[0]).toMatchObject({
      rule: "alias-cycle",
      severity: "error",
      path: "rezolvo(color-scheme=dark)/color.a",
      combination: { "color-scheme": "dark" },
    });
    expect(outcome.issues[0]?.message).toContain("color.a (core) -> color.b (color-scheme/dark)");
  });

  it("resolveCombination returns the partial rezolvo plus all issues", () => {
    const result = resolveCombination(modelo, { "color-scheme": "dark" });
    expect(result.errors.map((issue) => issue.rule)).toEqual(["alias-cycle"]);
    expect(result.warnings).toEqual([]);
    expect(result.tokens["color.a"]).toBeUndefined();
  });
});

describe("resolve: unresolvable references (fixture tree modified in memory)", () => {
  it("reports a missing target and an in-combination-unresolvable target, root causes only", () => {
    const modelo = loadFixture("valid", "resolve-matrix");
    const core = modelo.setoj.find((set) => set.name === CORE);
    const dark = modelo.setoj.find((set) => set.name === DARK);
    const text = core?.tokens["color.text.default"];
    const palette0 = core?.tokens["color.palette.neutral.0"];
    const shadow = core?.tokens["shadow.raised"];
    const darkBg = dark?.tokens["color.background.default"];
    if (!core || !dark || !text || !palette0 || !shadow || !darkBg) throw new Error("fixture");
    // `color.only.dark` exists only in color-scheme/dark (never active in light).
    dark.tokens["color.only.dark"] = { ...darkBg, name: "color.only.dark", value: C1000 };
    core.tokens["color.text.default"] = { ...text, value: "{color.missing}" };
    // color.background.default -> color.palette.neutral.0 then fails too, without an own issue.
    core.tokens["color.palette.neutral.0"] = { ...palette0, value: "{color.only.dark}" };
    core.tokens["shadow.raised"] = {
      ...shadow,
      value: { ...shadowWith("{color.nope}"), offsetX: "{spacing.small}" },
    };

    const outcome = resolve(modelo, {});
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.issues.map((issue) => [issue.rule, issue.path])).toEqual([
      ["alias-unresolvable-in-combination", `rezolvo(${LIGHT_DEFAULT})/color.palette.neutral.0`],
      ["alias-target-missing", `rezolvo(${LIGHT_DEFAULT})/color.text.default`],
      ["alias-target-missing", `rezolvo(${LIGHT_DEFAULT})/shadow.raised/$value/color`],
    ]);
    for (const issue of outcome.issues) {
      expect(issue.combination).toEqual({
        aspekto: "neutra",
        "color-scheme": "light",
        contrast: "default",
      });
      expect(issue.suggestion).not.toBe("");
    }
    const inDark = resolveCombination(modelo, { "color-scheme": "dark" });
    expect(inDark.tokens["color.palette.neutral.0"]?.value).toEqual(C1000);
    expect(inDark.tokens["color.palette.neutral.0"]?.aliasChain).toEqual([
      link("color.palette.neutral.0", CORE),
      link("color.only.dark", DARK),
    ]);
    const inLight = resolveCombination(modelo, {});
    expect(inLight.tokens["color.background.default"]).toBeUndefined();
    expect(inLight.tokens["spacing.small"]?.value).toEqual(px(4));
    expect(inDark.tokens["shadow.raised"]).toBeUndefined();
  });
});

const LIGHT_DEFAULT = "aspekto=neutra,color-scheme=light,contrast=default";

describe("allAssignments", () => {
  it("is the full Cartesian product, priority ascending, last Dimensio fastest", () => {
    const modelo = loadFixture("valid", "minimal");
    expect(allAssignments(modelo)).toEqual([
      { "color-scheme": "light", contrast: "default" },
      { "color-scheme": "light", contrast: "high" },
      { "color-scheme": "dark", contrast: "default" },
      { "color-scheme": "dark", contrast: "high" },
    ]);
  });

  it("resolves every combination of the minimal fixture with provenance", () => {
    const modelo = loadFixture("valid", "minimal");
    for (const assignment of allAssignments(modelo)) {
      const rezolvo = expectOk(resolve(modelo, assignment));
      expect(Object.keys(rezolvo.tokens)).toHaveLength(8);
    }
    const text = expectOk(resolve(modelo, { "color-scheme": "dark", contrast: "high" })).tokens[
      "color.text.default"
    ];
    expect(text?.origin.set).toBe("color-scheme/dark+contrast/high");
    expect(text?.aliasChain).toEqual([
      link("color.text.default", "color-scheme/dark+contrast/high"),
      link("color.palette.neutral.0", CORE),
    ]);
  });
});

describe("resolve: composite sub-field aliases (fixture tree modified in memory)", () => {
  it("inlines aliases inside arrays and records them by JSON Pointer", () => {
    const modelo = loadFixture("valid", "resolve-matrix");
    const core = modelo.setoj.find((set) => set.name === CORE);
    const shadow = core?.tokens["shadow.raised"];
    const text = core?.tokens["color.text.default"];
    if (!core || !shadow || !text) throw new Error("fixture");
    core.tokens["shadow.raised"] = {
      ...shadow,
      value: [shadowWith("{color.text.default}"), shadowWith(C0)],
    };
    const outcome = resolve(modelo, { "color-scheme": "dark" });
    const token = expectOk(outcome).tokens["shadow.raised"];
    expect(token?.value).toEqual([shadowWith(DARK900), shadowWith(C0)]);
    expect(token?.aliasChain).toEqual([]);
    expect(token?.fieldAliases).toEqual({
      "/0/color": [link("color.text.default", CORE), link("color.palette.neutral.900", DARK)],
    });
  });

  it("reports a cycle through a sub-field once, at its smallest member", () => {
    const modelo = loadFixture("valid", "resolve-matrix");
    const core = modelo.setoj.find((set) => set.name === CORE);
    const shadow = core?.tokens["shadow.raised"];
    if (!core || !shadow) throw new Error("fixture");
    core.tokens["shadow.raised"] = { ...shadow, value: shadowWith("{shadow.raised}") };
    const outcome = resolve(modelo, {});
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.issues.map((issue) => [issue.rule, issue.path])).toEqual([
      ["alias-cycle", `rezolvo(${LIGHT_DEFAULT})/shadow.raised`],
    ]);
  });
});
