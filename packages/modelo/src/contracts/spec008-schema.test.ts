// Modelo schema extensions of Spec 008 (T002; plan D-02, D-03, D-04, D-06, D-07): the a11y texts
// a Skemo speaks when a boolean prop is true, the layout value `with-text`, the language of an
// instance and the text check `not-instead`. All additive; everything Spec 007 accepted stays valid.

import { describe, expect, it } from "vitest";
import { createModeloAjv, getModeloValidator } from "./ajv.js";

const ajv = createModeloAjv();
const v = (def: string) => getModeloValidator(ajv, def);

const A11Y = {
  role: "link",
  name: ["slot:label", "prop:label"],
  states: {},
  keys: ["Enter"],
};

describe("SkemoA11y.texts (D-02)", () => {
  it("accepts a text per boolean prop in de and en", () => {
    const a11y = { ...A11Y, texts: { external: { de: "öffnet extern", en: "opens external" } } };
    expect(v("SkemoA11y")(a11y), JSON.stringify(v("SkemoA11y").errors)).toBe(true);
  });

  it("rejects a text without a language code, and a language that is no ISO 639-1 code", () => {
    expect(v("SkemoA11y")({ ...A11Y, texts: { external: "öffnet extern" } })).toBe(false);
    expect(v("SkemoA11y")({ ...A11Y, texts: { external: { deutsch: "öffnet extern" } } })).toBe(
      false,
    );
  });
});

describe("binding keywords inherit and none (D-03)", () => {
  it("are token names the schema accepts; the rules decide what they mean", () => {
    expect(v("SkemoBinding")({ part: "label", property: "typography", token: "inherit" })).toBe(
      true,
    );
    expect(v("SkemoPartSource")({ fixed: "none" })).toBe(true);
  });
});

describe("UzoLayout.wrap with-text (D-04)", () => {
  it("accepts with-text next to never and allowed", () => {
    for (const wrap of ["never", "allowed", "with-text"]) {
      expect(v("UzoLayout")({ size: "content", wrap }), wrap).toBe(true);
    }
    expect(v("UzoLayout")({ size: "content", wrap: "always" })).toBe(false);
  });
});

describe("EroInstance.lingvo (D-06)", () => {
  it("accepts an ISO 639-1 code and rejects anything else", () => {
    expect(v("EroInstance")({ ero: "ligilo", props: {}, label: "Übersicht", lingvo: "de" })).toBe(
      true,
    );
    expect(v("EroInstance")({ ero: "ligilo", props: {}, lingvo: "deutsch" })).toBe(false);
  });
});

describe("UzoContent.check not-instead (D-07)", () => {
  it("accepts the check kind without further fields", () => {
    const rule = {
      regulo: "link-navigates-button-acts",
      fixed: true,
      check: { kind: "not-instead" },
    };
    expect(v("UzoContent")(rule), JSON.stringify(v("UzoContent").errors)).toBe(true);
    expect(v("UzoContent")({ ...rule, check: { kind: "not-instead", words: {} } })).toBe(false);
  });
});
