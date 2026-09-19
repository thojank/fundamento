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
    { family: "Ekzempla Sans", license: "proprietary", source: "licensed", redistributable: false },
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
