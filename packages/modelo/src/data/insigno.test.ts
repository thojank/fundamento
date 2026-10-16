// The insigno data (Spec 011 ③; G1–G7, section ③, plan ③ D-01, D-04–D-06): the badge in the repo
// Modelo — a status in one to three words next to what it describes, text that is never colour
// alone; intent and size are its axes, rest its only state (G2); the long form is a visually
// hidden slot (G4). The new Regulo badge-text-short (adjustable, check max-words). The cross-links
// of G5: a sentence is the avizo's, a value in a range the mezurilo's (④, not covered yet).

import { describe, expect, it } from "vitest";
import { styledProps, variantKeys } from "../eroj/inventories.js";
import { boundToken, combinationsOf } from "../eroj/skemo-rules.js";
import { evaluateUsage, USAGE_ENFORCERS } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { REGULO_ENFORCERS } from "../validate/regularo-enforcement.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const insigno = eroNamed("insigno");
const skemo = insigno?.skemo;
const uzo = insigno?.uzo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.issue.severity]);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};
const INTENTS = ["neutral", "info", "success", "warning", "danger"];

describe("insigno in the repo Modelo (section ③, G1, G2)", () => {
  it("lives in data/eroj/insigno/skemo.json, among twelve Eroj", () => {
    expect(insigno?.file).toBe("modelo/data/eroj/insigno/skemo.json");
    expect(modelo.eroj.map((entry) => entry.ero.name)).toEqual([
      "avizo",
      "butono",
      "dialogo",
      "elektilo",
      "elekto",
      "insigno",
      "kampo",
      "ligilo",
      "markobutono",
      "plenstato",
      "sxaltilo",
      "tekstareo",
    ]);
  });

  it("has intent (neutral, info, success, warning, danger) and size (small, medium) as props; one state, rest (G1, G2)", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.values ?? prop.kind, prop.default])).toEqual(
      [
        ["intent", INTENTS, "neutral"],
        ["size", ["small", "medium"], "medium"],
      ],
    );
    expect(skemo?.states).toEqual(["rest"]);
    // No brand step (G1): the brand colour says no status; a badge in it is a boundary.
    expect(skemo?.props[0]?.values).not.toContain("brand");
  });

  it("has the slots label (default) and description, the long form, visually hidden (G4)", () => {
    expect(skemo?.slots).toEqual([
      { name: "label", default: true, text: true },
      { name: "description", text: true, hidden: true },
    ]);
  });

  it("names its parts: surface, border and text keyed by intent, the box keyed by size with the pill radius; no fixed height of its own", () => {
    if (skemo === undefined) throw new Error("missing");
    expect(Object.keys(skemo.parts).sort()).toEqual(["border", "box", "surface", "text"]);
    expect(skemo.parts.surface?.fill).toEqual({ by: ["intent"] });
    expect(skemo.parts.border?.color).toEqual({ by: ["intent"] });
    expect(skemo.parts.border?.width).toEqual({ fixed: "border.width.default" });
    expect(skemo.parts.text?.color).toEqual({ by: ["intent"] });
    expect(skemo.parts.text?.typography).toEqual({ fixed: "typography.label.2" });
    expect(skemo.parts.box?.radius).toEqual({ fixed: "radius.role.pill" });
    expect(skemo.parts.box?.["inline-padding"]).toEqual({ by: ["size"] });
    // The height is a minimum the text may grow (the Web Celo writes min-block-size): the spec
    // asks for no fixed height, size for a visible effect (G1).
    expect(skemo.parts.box?.height).toEqual({ by: ["size"] });
    expect(styledProps(skemo)).toEqual(["intent", "size"]);
    expect(variantKeys(skemo)).toEqual(["intent", "size", "state"]);
    expect(combinationsOf(skemo, variantKeys(skemo))).toHaveLength(5 * 2);
  });

  it("binds neutral to the sunken background, the default border and the subtle text; every other intent to its status roles (G3)", () => {
    if (skemo === undefined) throw new Error("missing");
    expect(boundToken(skemo, "surface", "fill", { intent: "neutral" })?.token).toBe(
      "color.background.sunken",
    );
    expect(boundToken(skemo, "border", "color", { intent: "neutral" })?.token).toBe(
      "color.border.default",
    );
    expect(boundToken(skemo, "text", "color", { intent: "neutral" })?.token).toBe(
      "color.text.subtle",
    );
    for (const intent of INTENTS.slice(1)) {
      expect(boundToken(skemo, "surface", "fill", { intent })?.token).toBe(
        `color.status.${intent}.subtle`,
      );
      expect(boundToken(skemo, "border", "color", { intent })?.token).toBe(
        `color.status.${intent}.border`,
      );
      expect(boundToken(skemo, "text", "color", { intent })?.token).toBe(
        `color.status.${intent}.text`,
      );
    }
    expect(boundToken(skemo, "box", "height", { size: "small" })?.token).toBe("size.icon.medium");
    expect(boundToken(skemo, "box", "height", { size: "medium" })?.token).toBe("size.icon.large");
    expect(boundToken(skemo, "box", "inline-padding", { size: "small" })?.token).toBe(
      "spacing.xsmall",
    );
    expect(boundToken(skemo, "box", "inline-padding", { size: "medium" })?.token).toBe(
      "spacing.small",
    );
  });

  it("declares every pair of text on surface as a KontrastParo (skemo-kontrastparo-missing stays silent)", () => {
    const pairs = new Set(
      modelo.kontrastParoj.map((pair) => `${pair.foreground}|${pair.background}`),
    );
    expect(pairs.has("color.text.subtle|color.background.sunken")).toBe(true);
    for (const intent of INTENTS.slice(1)) {
      expect(pairs.has(`color.status.${intent}.text|color.status.${intent}.subtle`), intent).toBe(
        true,
      );
    }
  });

  it("is static text: role generic, named by its label, no key, no state (G4)", () => {
    expect(skemo?.a11y).toEqual({
      role: "generic",
      name: ["slot:label"],
      states: {},
      keys: [],
    });
    expect(skemo?.constraints ?? []).toEqual([]);
  });

  it("knows the goal status-label with the words of the spec, citing badge-text-short", () => {
    expect(skemo?.goals?.map((goal) => goal.goal)).toEqual(["status-label"]);
    const goal = skemo?.goals?.[0];
    expect(goal?.keywords.en).toEqual(["badge", "tag", "status", "chip"]);
    expect(goal?.keywords.de).toEqual(["badge", "etikett", "status", "kennzeichnung"]);
    expect(goal?.props).toEqual({});
    expect(goal?.regulo).toBe("badge-text-short");
  });
});

describe("the Uzo of the insigno (section ③, G5)", () => {
  it("states the purpose, requires the label, allows one description; size content, never wraps", () => {
    expect(uzo?.purpose).toBe(
      "Names a status in one to three words next to what it describes: draft, in review, valid, 3 violations.",
    );
    expect(uzo?.slots).toEqual({
      label: { accepts: ["text"], required: true, max: 1, nesting: 0 },
      description: { accepts: ["text"], max: 1, nesting: 0 },
    });
    expect(uzo?.layout).toEqual({ size: "content", wrap: "never" });
  });

  it("sends a sentence to the avizo and a click to the butono; a bare count and a value in a range are a person's decision until ④", () => {
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["sentence", "avizo"],
      ["clickable", "butono"],
      ["count-only", null],
      ["value-in-range", null],
    ]);
    for (const entry of uzo?.instead ?? []) expect(entry.kialo).toMatch(/because/);
    expect(uzo?.instead.find((entry) => entry.goal === "value-in-range")?.kialo).toContain(
      "mezurilo",
    );
  });

  it("stops at a brand badge (a person decides), a dot alone and a removable chip (not supported)", () => {
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["brand-badge", "ask-human"],
      ["dot-only", "not-supported"],
      ["removable-chip", "not-supported"],
    ]);
    for (const entry of uzo?.boundary ?? []) expect(entry.kialo).toMatch(/because/);
  });

  it("composes in a table cell, an attribute value, a page title and a navigation count (④, ⑤)", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual([
      "tabelo",
      "atributlisto",
      "page-title",
      "navigado",
    ]);
    expect(uzo?.composes.with).toEqual([]);
    expect(uzo?.composes.spacing).toEqual({
      owner: "container",
      regulo: "spacing-owned-by-container",
    });
  });

  it("carries badge-text-short, adjustable, as max-words 3 on the label", () => {
    expect(uzo?.content).toEqual([
      { regulo: "badge-text-short", fixed: false, check: { kind: "max-words", count: 3 } },
    ]);
  });

  it("the brief names the purpose, intent and size, the label as a duty, and stays under 750", () => {
    if (insigno === undefined) throw new Error("missing");
    const brief = briefOf(insigno);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["intent", "size"]);
    expect(brief.required).toEqual({ props: [], slots: ["label"] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("the Reguloj of the insigno (G6)", () => {
  it("badge-text-short is new, automatic, the insigno's alone, with a kialo; it judges instances", () => {
    const regulo = named("badge-text-short");
    expect(regulo?.appliesTo?.eroj).toEqual(["insigno"]);
    expect(regulo?.checkability).toBe("automatic");
    expect(regulo?.kialo).toMatch(/skimmed|glance/);
    expect(regulo?.scope).toContain("max-words");
    expect(USAGE_ENFORCERS["badge-text-short"]).toBeDefined();
    expect(REGULO_ENFORCERS["badge-text-short"]).toBeUndefined();
  });

  it("spacing-owned-by-container is widened to the insigno (E5)", () => {
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("insigno");
  });

  it("has an approved and a rejected example in de and en that evaluate as they say", () => {
    const regulo = named("badge-text-short");
    if (regulo === undefined) throw new Error("missing");
    const examples = modelo.jugxoj.filter((jugxo) => jugxo.ekzemplo?.regulo === regulo.id);
    expect(examples.map((jugxo) => jugxo.decision).sort()).toEqual([
      "approved",
      "approved",
      "rejected",
      "rejected",
    ]);
    expect(examples.map((jugxo) => jugxo.ekzemplo?.instances[0]?.lingvo ?? "").sort()).toEqual([
      "de",
      "de",
      "en",
      "en",
    ]);
    for (const jugxo of examples) {
      const instances = jugxo.ekzemplo?.instances ?? [];
      const result = evaluateUsage(modelo, instances);
      const rules = rulesOf(result).map(([rule]) => rule);
      if (jugxo.decision === "approved") expect(rules, jugxo.id).toEqual([]);
      else expect(rules, jugxo.id).toEqual(["badge-text-short"]);
      expect(jugxo.ref).toEqual({ ero: insigno?.ero.id });
    }
  });
});

describe("check_usage and suggest_ero of the badge (G6, G7, Gvidanto)", () => {
  const judge = (label: string, props: Record<string, string> = {}) =>
    rulesOf(evaluateUsage(modelo, [{ ero: "insigno", props, label }]));

  it("'In Prüfung' and '3 Verstöße' pass; a sentence violates badge-text-short", () => {
    expect(judge("In Prüfung")).toEqual([]);
    expect(judge("3 Verstöße", { intent: "danger" })).toEqual([]);
    expect(judge("Diese Version wird gerade geprüft")).toEqual([["badge-text-short", "error"]]);
  });

  it("'Badge für den Status Entwurf' and 'a tag next to the title' are the insigno", () => {
    expect(suggest("Badge für den Status Entwurf").suggestion).toEqual({
      ero: "insigno",
      props: {},
    });
    expect(suggest("a tag next to the title").suggestion).toEqual({ ero: "insigno", props: {} });
    expect(suggest("a tag next to the title").regulo?.name).toBe("badge-text-short");
  });

  it("a dot alone and a brand badge stop with the insigno's words; 'Anteil in Prozent' is not covered yet", () => {
    expect(suggest("nur ein farbiger Punkt").boundary).toMatchObject({
      ero: "insigno",
      case: "dot-only",
      action: "not-supported",
    });
    expect(suggest("in the brand colour").boundary).toMatchObject({
      ero: "insigno",
      case: "brand-badge",
      action: "ask-human",
    });
    const ratio = suggest("Anteil in Prozent");
    expect(ratio.suggestion).toBeNull();
    expect(ratio.boundary).toMatchObject({ ero: "insigno", case: "value-in-range" });
  });
});
