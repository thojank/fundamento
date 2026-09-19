// Shared Ajv instance factory: draft 2020-12, strict, allErrors, with the Modelo schema added.

import { Ajv2020, type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
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
 * Creates a fresh Ajv instance with the Modelo schema registered under `MODELO_SCHEMA_ID`.
 * Strict mode rejects unknown keywords and ambiguous schemas; `allErrors` reports every issue.
 */
export function createModeloAjv(): ModeloAjv {
  const ajv = new Ajv2020({ strict: true, allErrors: true });
  // ajv-formats is CommonJS; under NodeNext its default export is reached via `.default`.
  addFormats.default(ajv, ["date"]);
  ajv.addSchema(readModeloSchema());
  ajv.addSchema(readConfigSchema());
  return ajv;
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
