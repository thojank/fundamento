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
