// Shared Ajv instance factory: draft 2020-12, strict, allErrors, with the Modelo schema added.

import { Ajv2020, type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { addSchemaWithBothIds } from "./names.js";
import {
  CONFIG_SCHEMA_ID,
  MODELO_SCHEMA_ID,
  readConfigSchema,
  readModeloSchema,
  schemaRef,
} from "./schema.js";

export type { ErrorObject, ValidateFunction } from "ajv/dist/2020.js";

export type ModeloAjv = Ajv2020;

/**
 * Creates a fresh Ajv instance with the Modelo schema registered under `MODELO_SCHEMA_ID` (and,
 * for one version, under the ID of the other form, Spec 036 6.3).
 * Strict mode rejects unknown keywords and ambiguous schemas; `allErrors` reports every issue.
 */
export function createModeloAjv(): ModeloAjv {
  const ajv = new Ajv2020({ strict: true, allErrors: true });
  // ajv-formats is CommonJS; under NodeNext its default export is reached via `.default`.
  addFormats.default(ajv, ["date"]);
  // Spec 036 6.3: for one version a schema that refers to either by its old ID resolves, too.
  addSchemaWithBothIds(ajv, readModeloSchema());
  addSchemaWithBothIds(ajv, readConfigSchema());
  return ajv;
}

let shared: ModeloAjv | undefined;

/**
 * The one Ajv instance of the process (Spec 029 ②b-1b, AK-07): every reader of the Modelo schema
 * – the validation, the config, the ID lock, the tools of the Gvidanto, the Agordilo – compiles
 * against it, so each part of the schema is compiled once; five instances compiled the shared
 * parts five times on every start (about 400 ms of the 2 s of AK-07).
 */
export function sharedModeloAjv(): ModeloAjv {
  shared ??= createModeloAjv();
  return shared;
}

/** The compiled validator of `fundamento.config.json` (D-07). */
export function getConfigValidator(ajv: ModeloAjv): ValidateFunction {
  const validate = ajv.getSchema(CONFIG_SCHEMA_ID);
  if (validate === undefined) {
    throw new Error(`Unknown config schema ${CONFIG_SCHEMA_ID}.`);
  }
  return validate;
}

/**
 * The compiled validator of a schema def (e.g. `"DimensiojFile"`), or of the `modelo.json`
 * export root when `defName` is omitted. Throws if the def does not exist.
 */
export function getModeloValidator(ajv: ModeloAjv, defName?: string): ValidateFunction {
  const ref = defName === undefined ? MODELO_SCHEMA_ID : schemaRef(defName);
  const validate = ajv.getSchema(ref);
  if (validate === undefined) {
    throw new Error(`Unknown Modelo schema reference ${ref}.`);
  }
  return validate;
}
