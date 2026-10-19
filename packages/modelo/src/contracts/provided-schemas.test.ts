// The schemas can be provided instead of read from disk (Spec 016 ②, plan ② D-03): the Werkstatt
// runs the Agordilo in the browser, where there is no file to read; the Vitrino embeds the two
// schemas and hands them to the Modelo before the first validation.

import { afterEach, describe, expect, it } from "vitest";
import { createModeloAjv, getModeloValidator } from "./ajv.js";
import {
  MODELO_SCHEMA_ID,
  provideModeloSchemas,
  readConfigSchema,
  readModeloSchema,
} from "./schema.js";

afterEach(() => provideModeloSchemas(undefined));

describe("provideModeloSchemas (②)", () => {
  it("readModeloSchema and readConfigSchema return what was provided, and a fresh Ajv compiles it", () => {
    const modelo = readModeloSchema();
    const config = readConfigSchema();
    const marked = { ...modelo, description: "provided for the test" };
    provideModeloSchemas({ modelo: marked, config });
    expect(readModeloSchema().description).toBe("provided for the test");
    expect(readModeloSchema()).not.toBe(marked);
    expect(readConfigSchema()).toEqual(config);
    const ajv = createModeloAjv();
    expect(ajv.getSchema(MODELO_SCHEMA_ID)?.schema).toMatchObject({
      description: "provided for the test",
    });
    expect(getModeloValidator(ajv, "Name")({ bad: true })).toBe(false);
    expect(getModeloValidator(ajv, "Name")("komuna")).toBe(true);
  });

  it("is taken back with undefined: the files on disk apply again", () => {
    provideModeloSchemas({
      modelo: { $id: MODELO_SCHEMA_ID, type: "object" },
      config: { type: "object" },
    });
    expect(readModeloSchema().$defs).toBeUndefined();
    provideModeloSchemas(undefined);
    expect(readModeloSchema().$defs).toBeDefined();
  });
});
