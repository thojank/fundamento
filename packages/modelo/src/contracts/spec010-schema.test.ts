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

// Spec 010 ③ (E7, plan ③ D-02, D-09, D-10): every option of a radio group is an entry of the slot
// options with the key selected; a slot takes a minimum of entries; a text rule checks a list of
// entries; an instance gives the texts of a slot that takes several as a list.
describe("SkemoSlot.entry (③ D-02, E7)", () => {
  it("names the key of one entry and the prop whose value marks it", () => {
    const slot = {
      name: "options",
      text: true,
      beside: true,
      entry: { key: "selected", equals: "value" },
    };
    expect(v("SkemoSlot")(slot), JSON.stringify(v("SkemoSlot").errors)).toBe(true);
    expect(v("SkemoSlot")({ name: "options", entry: { key: "selected" } })).toBe(false);
    expect(
      v("SkemoSlot")({ name: "options", entry: { key: "selected", equals: "value", x: 1 } }),
    ).toBe(false);
  });
});

describe("UzoSlot.min (③ D-10)", () => {
  it("takes a minimum of entries like max, at least 1", () => {
    expect(v("UzoSlot")({ accepts: ["text"], required: true, min: 2, nesting: 0 })).toBe(true);
    expect(v("UzoSlot")({ accepts: ["text"], min: 0 })).toBe(false);
  });
});

describe("UzoContent list checks distinct and max-entries (③ D-09)", () => {
  const rule = (check: unknown) => ({
    regulo: "option-labels-distinct",
    fixed: true,
    of: "slot:options",
    check,
  });
  it("distinct: no two entries share a text", () => {
    expect(
      v("UzoContent")(rule({ kind: "distinct" })),
      JSON.stringify(v("UzoContent").errors),
    ).toBe(true);
    expect(v("UzoContent")(rule({ kind: "distinct", count: 2 }))).toBe(false);
  });
  it("max-entries: at most count entries, as a warning where the rule is adjustable", () => {
    expect(
      v("UzoContent")({
        regulo: "elekto-options-few",
        fixed: false,
        severity: "warning",
        of: "slot:options",
        check: { kind: "max-entries", count: 5 },
      }),
    ).toBe(true);
    expect(v("UzoContent")(rule({ kind: "max-entries" }))).toBe(false);
  });
});

describe("EroInstance.texts as a list (③ D-09)", () => {
  it("gives the texts of a slot that takes several entries one per entry", () => {
    const instance = {
      ero: "elekto",
      props: { value: "express" },
      label: "Versandart",
      texts: { options: ["Standard", "Express", "Abholung"], help: "Wir liefern in zwei Tagen." },
    };
    expect(v("EroInstance")(instance), JSON.stringify(v("EroInstance").errors)).toBe(true);
    expect(v("EroInstance")({ ...instance, texts: { options: [1, 2] } })).toBe(false);
  });
});
