// Spec 036 Teil 6 (6.3, D-23, D-25): the two forms of Fundamento's identifiers and the readers'
// normalisation agree with the codemod's rule table (`scripts/neutrale-namen/rules.mjs`), which
// composes the old names at run time like this module does.

import { describe, expect, it } from "vitest";
import {
  legacyIdentifiers,
  mapIdentifiers,
  NEW_NAMES,
  oldNames,
  schemaUrn,
} from "../../../../scripts/neutrale-namen/rules.mjs";
import { createModeloAjv } from "./ajv.js";
import { FUNDAMENTO_EXTENSION_KEY } from "./dtcg.js";
import {
  addSchemaWithBothIds,
  convertNames,
  currentNameForm,
  NAME_FORMS,
  nameForm,
  normalizeNames,
  schemaIdInForm,
} from "./names.js";
import { CONFIG_SCHEMA_ID, MODELO_SCHEMA_ID } from "./schema.js";

const legacy = nameForm("legacy");
const neutral = nameForm("neutral");
const SCHEMA_PATHS = ["modelo.schema.json", "config.schema.json", "mcp/common.json"];

describe("the two forms (D-25)", () => {
  it("compose the same old names as the rule table and name the new ones of D-25", () => {
    const old = oldNames();
    expect(legacy.extensionKey).toBe(old.extensionKey);
    expect(legacy.ontologio).toBe(old.ontologioBase);
    expect(neutral.extensionKey).toBe(NEW_NAMES.extensionKey);
    expect(neutral.ontologio).toBe(NEW_NAMES.ontologio);
    for (const path of SCHEMA_PATHS) {
      expect(legacy.schemaId(path)).toBe(`${old.schemaBase}${path}`);
      expect(neutral.schemaId(path)).toBe(schemaUrn(path));
      expect(neutral.schemaPath(neutral.schemaId(path))).toBe(path);
      expect(legacy.schemaPath(legacy.schemaId(path))).toBe(path);
    }
    expect(NAME_FORMS.map((form) => form.id)).toEqual(["legacy", "neutral"]);
  });

  it("the code writes one form: the extension key, the schema IDs and the ontology base agree", () => {
    const form = currentNameForm();
    expect(form.extensionKey).toBe(FUNDAMENTO_EXTENSION_KEY);
    expect(form.schemaId("modelo.schema.json")).toBe(MODELO_SCHEMA_ID);
    expect(form.schemaId("config.schema.json")).toBe(CONFIG_SCHEMA_ID);
  });

  it("maps a schema reference of either form, keeps the fragment, and leaves other strings alone", () => {
    for (const to of NAME_FORMS) {
      for (const from of NAME_FORMS) {
        expect(schemaIdInForm(`${from.schemaId("mcp/common.json")}#/$defs/Issue`, to)).toBe(
          `${to.schemaId("mcp/common.json")}#/$defs/Issue`,
        );
      }
    }
    for (const other of ["../schema/modelo.schema.json#/$defs/Name", "#/$defs/Name", "https://x"]) {
      expect(schemaIdInForm(other, neutral)).toBe(other);
    }
  });
});

/** A small document with every kind of identifier, written in the old form. */
function legacyDocument(): Record<string, unknown> {
  return {
    $schema: `${legacy.schemaId("modelo.schema.json")}#/$defs/FontojFile`,
    fundamento: { version: "0.2.0" },
    color: {
      $extensions: { [legacy.extensionKey]: { id: "grp_x" }, "org.example": { a: 1 } },
      text: { $value: "#000", $extensions: { [legacy.extensionKey]: { id: "tok_x" } } },
    },
    $defs: {
      TokenExtensions: { properties: { [legacy.extensionKey]: { $ref: "#/$defs/T" } } },
      Other: { properties: { [neutral.extensionKey]: { type: "string" } } },
    },
    uri: `${legacy.ontologio}#Ero`,
    refs: [`${legacy.schemaId("mcp/common.json")}#/$defs/Issue`, "plain text"],
  };
}

describe("convertNames and normalizeNames (6.3)", () => {
  it("agree with mapIdentifiers of the rule table (old → new) and with its inverse (new → old)", () => {
    const old = legacyDocument();
    const neu: unknown = JSON.parse(mapIdentifiers(JSON.stringify(old)));
    expect(convertNames(old, neutral)).toEqual(neu);
    expect(convertNames(neu, legacy)).toEqual(old);
    expect(legacyIdentifiers(neu)).toEqual(old);
  });

  it("renames the key only where it is an extension key, keeping the order of the keys", () => {
    const converted = convertNames(legacyDocument(), neutral) as ReturnType<typeof legacyDocument>;
    const color = converted.color as { $extensions: Record<string, unknown> };
    expect(Object.keys(color.$extensions)).toEqual(["fundamento", "org.example"]);
    expect(converted.fundamento).toEqual({ version: "0.2.0" });
    const back = convertNames(converted, legacy) as ReturnType<typeof legacyDocument>;
    // The export's top-level field and an ordinary schema property named like the new key stay.
    expect(back.fundamento).toEqual({ version: "0.2.0" });
    expect(back.$defs).toEqual(legacyDocument().$defs);
  });

  it("keeps both keys where both stand side by side", () => {
    const both = { $extensions: { [legacy.extensionKey]: { id: "a" }, fundamento: { id: "b" } } };
    expect(convertNames(both, neutral)).toBe(both);
  });

  it("returns the same object when nothing changes, and skips the walk on a text without the other form", () => {
    const value = convertNames(legacyDocument(), currentNameForm());
    expect(normalizeNames(value)).toBe(value);
    const text = JSON.stringify({ a: "b" });
    const parsed = JSON.parse(text) as object;
    expect(normalizeNames(parsed, text)).toBe(parsed);
  });

  it("normalises to the form the code writes", () => {
    const form = currentNameForm();
    expect(normalizeNames(legacyDocument())).toEqual(convertNames(legacyDocument(), form));
  });
});

describe("addSchemaWithBothIds (6.3)", () => {
  it("registers a schema under its ID and the ID of the other form, once", () => {
    const ajv = createModeloAjv();
    for (const form of NAME_FORMS) {
      expect(ajv.getSchema(form.schemaId("modelo.schema.json"))).toBeDefined();
      expect(ajv.getSchema(form.schemaId("config.schema.json"))).toBeDefined();
    }
    const schema = { $id: legacy.schemaId("mcp/probe.json"), type: "string" };
    addSchemaWithBothIds(ajv, schema);
    expect(() => addSchemaWithBothIds(createModeloAjv(), schema)).not.toThrow();
    for (const form of NAME_FORMS) {
      expect(ajv.getSchema(form.schemaId("mcp/probe.json"))?.("x")).toBe(true);
      expect(ajv.getSchema(form.schemaId("mcp/probe.json"))?.(1)).toBe(false);
    }
  });
});
