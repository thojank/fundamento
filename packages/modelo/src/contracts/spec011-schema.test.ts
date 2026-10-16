// Modelo schema extension of Spec 011 ① (plan ① D-08): a constraint reads a string prop as filled
// or empty, in `when` and in `allowed`, like a slot since Spec 009 — a bound (min, max) only on a
// kind with a scale; an empty option never beside a prompt. Additive; every Skemo before stays
// valid.

import { describe, expect, it } from "vitest";
import { createModeloAjv, getModeloValidator } from "./ajv.js";

const ajv = createModeloAjv();
const v = (def: string) => getModeloValidator(ajv, def);

describe("SkemoConstraint reads a string prop as filled or empty (Spec 011 ① D-08)", () => {
  it("accepts prop:<name> with filled or empty in when, and in allowed", () => {
    const constraint = {
      when: { "prop:min": "filled" },
      allowed: { kind: ["number", "date"] },
      kialo: "A bound needs a scale.",
    };
    expect(v("SkemoConstraint")(constraint), JSON.stringify(v("SkemoConstraint").errors)).toBe(
      true,
    );
    expect(
      v("SkemoConstraint")({
        when: { "prop:empty-label": "filled" },
        allowed: { "prop:placeholder": ["empty"] },
        kialo: "An empty option beside a prompt shows two first lines.",
      }),
    ).toBe(true);
  });

  it("rejects a value of a string prop in when, and an unknown prefix", () => {
    expect(
      v("SkemoConstraint")({
        when: { "prop:min": "3" },
        allowed: { kind: ["number"] },
        kialo: "x",
      }),
    ).toBe(false);
    expect(
      v("SkemoConstraint")({
        when: { "part:min": "filled" },
        allowed: { kind: ["number"] },
        kialo: "x",
      }),
    ).toBe(false);
  });
});

// Spec 011 ① (plan ① D-09): the empty option of a select is an entry of the slot options, the
// first, with the value "" and the text of a string prop the entry names.
describe("SkemoSlot.entry.empty (Spec 011 ① D-09)", () => {
  it("names the string prop whose text is the empty first entry", () => {
    const slot = {
      name: "options",
      text: true,
      entry: { key: "selected", equals: "value", empty: "empty-label" },
    };
    expect(v("SkemoSlot")(slot), JSON.stringify(v("SkemoSlot").errors)).toBe(true);
    expect(v("SkemoSlot")({ name: "options", entry: { key: "selected", equals: "value" } })).toBe(
      true,
    );
    expect(
      v("SkemoSlot")({ name: "options", entry: { key: "selected", equals: "value", empty: "" } }),
    ).toBe(false);
  });
});

// Spec 011 ② (plan ② D-07): a part may carry a shadow — the elevation of a dialog's surface — a
// part property like radius, bound to an elevation.shadow.* token. Additive.
describe("SkemoPartProperty shadow (Spec 011 ② D-07)", () => {
  it("is a part property keyed or fixed like any other", () => {
    expect(v("SkemoPartProperty")("shadow")).toBe(true);
    expect(v("SkemoPart")({ shadow: { fixed: "elevation.shadow.modal" } })).toBe(true);
    expect(v("SkemoPart")({ elevation: { fixed: "elevation.shadow.modal" } })).toBe(false);
  });
});
