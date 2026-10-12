// Modelo schema extensions of Spec 009 (T002; plan D-02, D-04, D-06): the description sources of
// an Ero, constraints that read a slot, text rules on other texts than the label with two more
// checks, and the texts of an instance's slots. All additive.

import { describe, expect, it } from "vitest";
import { createModeloAjv, getModeloValidator } from "./ajv.js";

const ajv = createModeloAjv();
const v = (def: string) => getModeloValidator(ajv, def);

describe("SkemoA11y.description (D-02)", () => {
  it("accepts slot and prop sources in order, like name", () => {
    const a11y = {
      role: "textbox",
      name: ["slot:label"],
      states: { invalid: ["aria-invalid"] },
      keys: [],
      description: ["slot:help", "slot:error"],
    };
    expect(v("SkemoA11y")(a11y), JSON.stringify(v("SkemoA11y").errors)).toBe(true);
    expect(v("SkemoA11y")({ ...a11y, description: ["aria-describedby"] })).toBe(false);
  });
});

describe("SkemoConstraint with a slot key (D-04)", () => {
  it("accepts slot:<name> with filled or empty in when", () => {
    const constraint = {
      when: { "slot:error": "filled" },
      allowed: { invalid: ["true"] },
      kialo: "An error text without the error state is a contradiction.",
    };
    expect(v("SkemoConstraint")(constraint), JSON.stringify(v("SkemoConstraint").errors)).toBe(
      true,
    );
    expect(v("SkemoConstraint")({ ...constraint, when: { "slot:error": "full" } })).toBe(false);
    expect(v("SkemoConstraint")({ ...constraint, when: { "part:error": "filled" } })).toBe(false);
  });
});

describe("UzoContent.of, min-words and max-sentences (D-06)", () => {
  it("accepts a text rule on the error slot with min-words, and one on help with max-sentences", () => {
    expect(
      v("UzoContent")({
        regulo: "error-says-what-to-do",
        fixed: true,
        of: "slot:error",
        check: { kind: "min-words", count: 3 },
      }),
    ).toBe(true);
    expect(
      v("UzoContent")({
        regulo: "help-is-one-sentence",
        fixed: false,
        of: "slot:help",
        check: { kind: "max-sentences", count: 1 },
      }),
    ).toBe(true);
    expect(
      v("UzoContent")({
        regulo: "placeholder-is-example",
        fixed: false,
        of: "prop:placeholder",
        check: { kind: "not-words", words: { de: ["hier"], en: ["here"] } },
      }),
    ).toBe(true);
    expect(
      v("UzoContent")({
        regulo: "x",
        fixed: true,
        of: "error",
        check: { kind: "min-words", count: 3 },
      }),
    ).toBe(false);
    expect(v("UzoContent")({ regulo: "x", fixed: true, check: { kind: "min-words" } })).toBe(false);
  });
});

describe("EroInstance.texts (D-06)", () => {
  it("accepts the texts of the slots by slot name", () => {
    expect(
      v("EroInstance")({
        ero: "kampo",
        props: { kind: "email" },
        label: "E-Mail",
        texts: { help: "Wir schreiben nur zur Bestellung.", error: "Ungültig" },
      }),
    ).toBe(true);
    expect(v("EroInstance")({ ero: "kampo", props: {}, texts: { help: 3 } })).toBe(false);
  });
});
