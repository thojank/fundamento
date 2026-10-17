// The apartigilo data (Spec 014 ②; G1, G2, G5, section ②, plan ② D-03): the divider in the repo
// Modelo — a line that separates groups of content where space alone does not; horizontal or
// vertical, decorative (role none) or a separator; its line in color.border.subtle at
// border.width.default. A separator has no name of its own: a11y.name is empty (schema relaxed).

import { describe, expect, it } from "vitest";
import { variantKeys } from "../eroj/inventories.js";
import { boundToken } from "../eroj/skemo-rules.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const apartigilo = modelo.eroj.find((entry) => entry.ero.name === "apartigilo");
const skemo = apartigilo?.skemo;
const uzo = apartigilo?.uzo;
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("apartigilo in the repo Modelo (section ②)", () => {
  it("lives in data/eroj/apartigilo/skemo.json", () => {
    expect(apartigilo?.file).toBe("modelo/data/eroj/apartigilo/skemo.json");
  });

  it("has orientation (horizontal, vertical) and decorative as props; one state; no slot", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.values ?? prop.kind, prop.default])).toEqual(
      [
        ["orientation", ["horizontal", "vertical"], "horizontal"],
        ["decorative", "boolean", false],
      ],
    );
    expect(skemo?.states).toEqual(["rest"]);
    expect(skemo?.slots).toEqual([]);
  });

  it("names its parts: the line (colour and width fixed) and the box (height by orientation: none, else a control height)", () => {
    if (skemo === undefined) throw new Error("missing");
    expect(Object.keys(skemo.parts).sort()).toEqual(["box", "line"]);
    expect(skemo.parts.line).toEqual({
      color: { fixed: "color.border.subtle" },
      width: { fixed: "border.width.default" },
    });
    expect(skemo.parts.box?.height).toEqual({ by: ["orientation"] });
    expect(boundToken(skemo, "box", "height", { orientation: "horizontal" })?.token).toBe("none");
    expect(boundToken(skemo, "box", "height", { orientation: "vertical" })?.token).toBe(
      "size.control.medium",
    );
    // The orientation keys the box, so Figma draws both as variants (spec ②, Figma: orientation).
    expect(variantKeys(skemo)).toEqual(["orientation", "state"]);
  });

  it("speaks role separator without a name of its own (G5): a11y.name is empty, no state, no key", () => {
    expect(skemo?.a11y).toEqual({ role: "separator", name: [], states: {}, keys: [] });
  });

  it("knows the goal separate with the words of G7", () => {
    expect(skemo?.goals?.map((goal) => goal.goal)).toEqual(["separate"]);
    expect(skemo?.goals?.[0]?.keywords).toEqual({
      en: ["divider", "separator", "rule"],
      de: ["trennlinie", "trenner", "trennstrich"],
    });
  });
});

describe("the Uzo of the apartigilo (section ②)", () => {
  it("states the purpose; where space alone separates a person decides (instead null); a line with a word in it is a boundary", () => {
    expect(uzo?.purpose).toBe("Separates groups of content where space alone does not.");
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([["spacing-only", null]]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["labelled-line", "ask-human"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("composes in a page section; size container, never wraps; no slot, no text rule", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual(["page-section"]);
    expect(uzo?.slots).toEqual({});
    expect(uzo?.layout).toEqual({ size: "container", wrap: "never" });
    expect(uzo?.content).toEqual([]);
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("apartigilo");
  });

  it("the brief names orientation as the axis and no duty, and stays under 750", () => {
    if (apartigilo === undefined) throw new Error("missing");
    const brief = briefOf(apartigilo);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["orientation"]);
    expect(brief.required).toEqual({ props: [], slots: [] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("suggest_ero of the divider (Gvidanto)", () => {
  it("'Trennlinie zwischen zwei Abschnitten' is the apartigilo; 'a divider' too", () => {
    expect(suggest("Trennlinie zwischen zwei Abschnitten").suggestion).toEqual({
      ero: "apartigilo",
      props: {},
    });
    expect(suggest("a divider between the groups").suggestion).toEqual({
      ero: "apartigilo",
      props: {},
    });
  });
});
