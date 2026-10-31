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
