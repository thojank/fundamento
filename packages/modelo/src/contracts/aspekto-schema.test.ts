// `aspekto.json` of an Aspekto package (Spec 001, plan D-05; task T004).

import { describe, expect, it } from "vitest";
import { createModeloAjv, getModeloValidator } from "./ajv.js";
import { SCHEMA_DEFS } from "./schema.js";

const validate = getModeloValidator(createModeloAjv(), SCHEMA_DEFS.aspektoFile);

const KOMUNA = {
  id: "dva_01M2VEEDQEJEE7MR7JA8JRPMJB",
  name: "komuna",
  owner: "Fundamento",
  license: "MIT",
  fonts: [
    {
      family: "Geist",
      license: "OFL-1.1",
      source: "https://github.com/vercel/geist-font",
      redistributable: true,
      scripts: ["Latn"],
    },
  ],
};

const EXTERNAL = {
  id: "dva_ekz_01M2VEEDQEJEE7MR7JA8JRPMJB",
  name: "ekzemplo",
  owner: "Ekzemplo GmbH",
  license: "proprietary",
  idNamespace: "ekz",
  fonts: [
    {
      family: "Ekzempla Sans",
      license: "proprietary",
      source: "licensed",
      redistributable: false,
      scripts: ["Latn", "Cyrl"],
    },
  ],
};

describe("AspektoFile schema (D-05)", () => {
  it.each([
    ["the reference Aspekto without idNamespace", KOMUNA],
    ["an external proprietary Aspekto with idNamespace", EXTERNAL],
    ["an Aspekto with only generic families (no fonts)", { ...KOMUNA, fonts: [] }],
    ["an SPDX expression", { ...KOMUNA, license: "MIT OR Apache-2.0" }],
  ])("accepts %s", (_label, value) => {
    expect(validate(value), JSON.stringify(validate.errors)).toBe(true);
  });

  it.each([
    ["a missing license", { ...KOMUNA, license: undefined }],
    ["a license with spaces only", { ...KOMUNA, license: "my license" }],
    ["a malformed idNamespace", { ...EXTERNAL, idNamespace: "EKZ" }],
    ["a non-DimensioValoro id", { ...KOMUNA, id: "tok_01M2VEEDQEJEE7MR7JA8JRPMJB" }],
    ["a name outside the grammar", { ...KOMUNA, name: "Komuna" }],
    [
      "a font without redistributable",
      { ...KOMUNA, fonts: [{ family: "Geist", license: "OFL-1.1", source: "x" }] },
    ],
    ["an unknown field", { ...KOMUNA, fallback: ["system-ui"] }],
    ["missing fonts", { ...KOMUNA, fonts: undefined }],
  ])("rejects %s", (_label, value) => {
    const cleaned = JSON.parse(JSON.stringify(value));
    expect(validate(cleaned)).toBe(false);
  });
});

describe("fonts[].scripts and tavoloj (T018b, D-20)", () => {
  const withFont = (font: Record<string, unknown>) => ({
    ...KOMUNA,
    fonts: [{ family: "Geist", license: "OFL-1.1", source: "x", redistributable: true, ...font }],
  });

  it.each([
    ["one script", ["Latn"]],
    ["several scripts", ["Latn", "Cyrl", "Arab", "Hans"]],
  ])("accepts %s", (_label, scripts) => {
    expect(validate(withFont({ scripts }))).toBe(true);
  });

  it.each([
    ["missing scripts", {}],
    ["an empty list", { scripts: [] }],
    ["a lowercase code", { scripts: ["latn"] }],
    ["a three-letter code", { scripts: ["Lat"] }],
    ["a numeric code", { scripts: ["215"] }],
  ])("rejects %s", (_label, font) => {
    expect(validate(withFont(font))).toBe(false);
  });

  it("accepts tavoloj with the reserved key vida as {} and with unknown keys", () => {
    expect(validate({ ...KOMUNA, tavoloj: { vida: {} } })).toBe(true);
    expect(validate({ ...KOMUNA, tavoloj: { vida: {}, sono: { any: "thing" } } })).toBe(true);
    expect(validate({ ...KOMUNA, tavoloj: {} })).toBe(true);
  });

  it("rejects a non-empty vida and a tavoloj that is not an object", () => {
    expect(validate({ ...KOMUNA, tavoloj: { vida: { vortaro: "x" } } })).toBe(false);
    expect(validate({ ...KOMUNA, tavoloj: ["vida"] })).toBe(false);
  });
});
