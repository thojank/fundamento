// Modelo schema extensions of Spec 010 ① (plan D-04, D-07): a part property `position` that takes
// a term (start, end) instead of a token, and a slot whose text stands beside the control. Both
// additive; every Skemo before Spec 010 stays valid.

import { describe, expect, it } from "vitest";
import { createModeloAjv, getModeloValidator } from "./ajv.js";

const ajv = createModeloAjv();
const v = (def: string) => getModeloValidator(ajv, def);

describe("SkemoPartProperty position (D-04)", () => {
  it("is a part property keyed like any other", () => {
    expect(v("SkemoPartProperty")("position")).toBe(true);
    expect(v("SkemoPart")({ position: { by: ["checked"] } })).toBe(true);
    expect(v("SkemoPart")({ placement: { by: ["checked"] } })).toBe(false);
  });

  it("is bound to a term in a binding, start or end", () => {
    const binding = (token: string) => ({
      part: "indicator",
      property: "position",
      when: { checked: "true" },
      token,
    });
    expect(v("SkemoBinding")(binding("end")), JSON.stringify(v("SkemoBinding").errors)).toBe(true);
    expect(v("SkemoBinding")(binding("start"))).toBe(true);
  });
});

describe("SkemoSlot.beside (D-07)", () => {
  it("says that the slot's text stands beside the control, on the container's ground", () => {
    expect(v("SkemoSlot")({ name: "label", default: true, text: true, beside: true })).toBe(true);
    expect(v("SkemoSlot")({ name: "label", beside: "start" })).toBe(false);
  });
});
