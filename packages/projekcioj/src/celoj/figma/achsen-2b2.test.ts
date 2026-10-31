// Spec 036 Teil 5 ②b-2 (Spec 029 abgleich.json, aspects "achsen" and "groessen") in Figma: the sets
// follow the axes of the Skemo. A value that is only a deprecated alias (②a-2) is no variant: a
// designer picks among the values that stay.

import { describe, expect, it } from "vitest";
import { plan } from "./plugin-test-helpers.js";

const setOf = (name: string) => {
  const set = plan.components.find((candidate) => candidate.set === name);
  if (set === undefined) throw new Error(`${name} missing in the plan`);
  return set;
};

describe("②b-2 A-*-2 in Figma: two sizes, large no variant", () => {
  it.each(["elekto", "markobutono", "sxaltilo"])("%s: size small | medium", (name) => {
    const set = setOf(name);
    expect(set.properties.size).toEqual(["small", "medium"]);
    expect(set.variants.filter((variant) => variant.props.size === "large")).toEqual([]);
    expect(set.variants.filter((variant) => variant.props.size === "medium").length).toBe(
      set.variants.filter((variant) => variant.props.size === "small").length,
    );
  });
});

describe("②b-2 A-elektilo-1, A-markobutono-1 in Figma: readonly a boolean, no variant", () => {
  it.each(["elektilo", "markobutono"])("%s: readonly is a BOOLEAN of the set", (name) => {
    const set = setOf(name);
    expect(set.properties.readonly).toBe("BOOLEAN");
    expect(set.variants.filter((variant) => variant.props.state === "readonly")).toEqual([]);
  });
});

describe("②b-2 A-sxaltilo-1 in Figma: label-side a property, no variant (layout, as orientation)", () => {
  it("sxaltilo: label-side start | end among the properties; the variants stay checked × size × state", () => {
    const set = setOf("sxaltilo");
    expect(set.properties["label-side"]).toEqual(["start", "end"]);
    expect(Object.keys(set.variants[0]?.props ?? {})).toEqual(["checked", "size", "state"]);
  });
});

describe("②b-2 A-kompletigilo-1, A-alsxutilo-1, A-tekstareo-1 in Figma: the numbers", () => {
  it.each([
    ["kompletigilo", "max-suggestions"],
    ["alsxutilo", "max-files"],
    ["tekstareo", "max-length"],
  ])("%s: %s is a NUMBER of the set", (name, prop) => {
    expect(setOf(name).properties[prop]).toBe("NUMBER");
  });
});

describe("②b-2 A-plurelektilo-1 in Figma: summary labels", () => {
  it("plurelektilo: summary count | labels | tags among the properties", () => {
    expect(setOf("plurelektilo").properties.summary).toEqual(["count", "labels", "tags"]);
  });
});

describe("②b-2 A-listelektilo-2, A-plurelektilo-2, A-datelektilo-2 in Figma: size a variant axis", () => {
  it.each(["listelektilo", "plurelektilo", "datelektilo"])("%s: variants by size", (name) => {
    const set = setOf(name);
    expect(set.properties.size).toEqual(["small", "medium", "large"]);
    const sizes = new Set(set.variants.map((variant) => variant.props.size));
    expect([...sizes]).toEqual(["small", "medium", "large"]);
  });
});

describe("②b-2 A-kampo-1 in Figma: unit a text of the set", () => {
  it("kampo: unit is a TEXT property", () => {
    expect(setOf("kampo").properties.unit).toBe("TEXT");
  });
});

describe("②b-2 A-ikono-2, A-signeto-2, A-avataro-2, A-pagxigilo-2, A-langetaro-2, A-dialogo-2 in Figma: sizes", () => {
  it.each([
    ["ikono", ["x-small", "small", "medium", "large"]],
    ["signeto", ["small", "medium", "large"]],
    ["avataro", ["x-small", "small", "medium", "large", "x-large"]],
    ["pagxigilo", ["small", "medium"]],
    ["langetaro", ["small", "medium", "large"]],
    ["dialogo", ["small", "medium", "full"]],
  ])("%s: size a variant axis with every value", (name, values) => {
    const set = setOf(name);
    expect(set.properties.size).toEqual(values);
    const sizes = new Set(set.variants.map((variant) => variant.props.size));
    expect([...sizes].sort()).toEqual([...values].sort());
  });
});

describe("②b-2 A-apartigilo-1, A-spuro-1, A-karto-1, A-avataro-1, A-avizo-1 in Figma: the looks", () => {
  it.each([
    ["apartigilo", "emphasis", ["low", "high"]],
    ["spuro", "emphasis", ["medium", "low"]],
    ["karto", "emphasis", ["high", "medium", "low"]],
    ["avataro", "corner", ["round", "soft", "square"]],
    ["avizo", "frame", ["card", "band"]],
  ])("%s: %s a variant axis with every value", (name, prop, values) => {
    const set = setOf(name);
    expect(set.properties[prop]).toEqual(values);
    const seen = new Set(set.variants.map((variant) => variant.props[prop]));
    expect([...seen].sort()).toEqual([...values].sort());
  });
});

describe("②b-2 A-tabelo-1, A-markdovido-1, A-plenstato-1, A-teksto-1 in Figma", () => {
  it("tabelo: density with three values a variant axis; lines a property, no variant", () => {
    const set = setOf("tabelo");
    expect(set.properties.density).toEqual(["compact", "default", "comfortable"]);
    expect(new Set(set.variants.map((variant) => variant.props.density)).size).toBe(3);
    expect(set.properties.lines).toEqual(["rows", "columns", "grid", "none"]);
    expect(set.variants.some((variant) => "lines" in variant.props)).toBe(false);
  });

  it("markdovido density, plenstato compact, teksto kind label: axes of the variants", () => {
    expect(setOf("markdovido").properties.density).toEqual(["default", "compact"]);
    expect(setOf("plenstato").variants.some((variant) => variant.props.compact === "true")).toBe(
      true,
    );
    expect(setOf("teksto").properties.kind).toContain("label");
    expect(setOf("teksto").properties.tabular).toBe("BOOLEAN");
  });
});

describe("②b-2 layout and purpose in Figma: properties, no variants", () => {
  it.each([
    ["faldilo", "indicator-side", ["start", "end"]],
    ["konsileto", "justify", ["start", "center", "end"]],
    ["menuo", "justify", ["start", "center", "end"]],
    ["sxvebilo", "justify", ["start", "center", "end"]],
    ["langetaro", "spread", ["content", "fill"]],
    ["dialogo", "dismiss", ["free", "guarded", "explicit"]],
  ])("%s: %s a property of the set, no axis of its variants", (name, prop, values) => {
    const set = setOf(name);
    expect(set.properties[prop]).toEqual(values);
    expect(set.variants.some((variant) => prop in variant.props)).toBe(false);
  });
});
