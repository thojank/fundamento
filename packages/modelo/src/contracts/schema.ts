// Location and addressing of the canonical Modelo schema (`packages/modelo/schema/`).

import { readFileSync } from "node:fs";

export const MODELO_SCHEMA_ID = "https://ciferecigo.com/fundamento/schema/modelo.schema.json";

/** File URL of the hand-written schema. Valid from both `src/contracts/` and `dist/contracts/`. */
export const MODELO_SCHEMA_URL = new URL("../../schema/modelo.schema.json", import.meta.url);

/** Named defs of the schema that other modules address (the root itself is `modelo.json`). */
export const SCHEMA_DEFS = {
  tokenSetFile: "TokenSetFile",
  dtcgToken: "DtcgToken",
  dimensiojFile: "DimensiojFile",
  regulojFile: "RegulojFile",
  jugxojFile: "JugxojFile",
  mankojFile: "MankojFile",
  kontrastParojFile: "KontrastParojFile",
  idsLock: "IdsLock",
  aspektoFile: "AspektoFile",
  agordo: "Agordo",
  rezolvo: "Rezolvo",
  resolvedToken: "ResolvedToken",
  ero: "Ero",
  skemo: "Skemo",
  eroFile: "EroFile",
  uzoFile: "UzoFile",
  ikono: "Ikono",
  ikonaroFile: "IkonaroFile",
  sxablono: "Sxablono",
  projekcio: "Projekcio",
  celo: "Celo",
} as const;

export type SchemaDefName = (typeof SCHEMA_DEFS)[keyof typeof SCHEMA_DEFS];

/** Schema def per file in the Modelo `data/` directory. */
export const DATA_FILE_SCHEMA_DEFS = {
  "dimensioj.json": "DimensiojFile",
  "reguloj.json": "RegulojFile",
  "jugxoj.json": "JugxojFile",
  "mankoj.json": "MankojFile",
  "kontrastparoj.json": "KontrastParojFile",
  "ids.lock.json": "IdsLock",
} as const;

export type DataFileName = keyof typeof DATA_FILE_SCHEMA_DEFS;

/**
 * Schema def per optional file in the Modelo `data/` directory: read when it exists, no issue when
 * it does not. The Ikonaro is absent while no Ero draws an icon (Spec 014 ①, G3).
 */
export const OPTIONAL_DATA_FILE_SCHEMA_DEFS = {
  "ikonaro.json": "IkonaroFile",
} as const;

export type OptionalDataFileName = keyof typeof OPTIONAL_DATA_FILE_SCHEMA_DEFS;

/** Absolute schema reference of a def, e.g. `schemaRef("DimensiojFile")`. */
export function schemaRef(defName: string): string {
  return `${MODELO_SCHEMA_ID}#/$defs/${defName}`;
}

export const CONFIG_SCHEMA_ID = "https://ciferecigo.com/fundamento/schema/config.schema.json";

/**
 * File URL of the schema of `fundamento.config.json` (D-07). It is separate from the Modelo
 * schema because the config is not part of the Modelo; it only selects Aspekto packages.
 */
export const CONFIG_SCHEMA_URL = new URL("../../schema/config.schema.json", import.meta.url);

/** Reads the config schema from disk as a parsed JSON object. */
export function readConfigSchema(): Record<string, unknown> {
  const schema: unknown = JSON.parse(readFileSync(CONFIG_SCHEMA_URL, "utf8"));
  if (typeof schema !== "object" || schema === null || Array.isArray(schema)) {
    throw new Error(`Config schema ${CONFIG_SCHEMA_URL.href} is not a JSON object.`);
  }
  return { ...schema };
}

/** Reads the canonical schema from disk as a parsed JSON object. */
export function readModeloSchema(): Record<string, unknown> {
  const schema: unknown = JSON.parse(readFileSync(MODELO_SCHEMA_URL, "utf8"));
  if (typeof schema !== "object" || schema === null || Array.isArray(schema)) {
    throw new Error(`Modelo schema ${MODELO_SCHEMA_URL.href} is not a JSON object.`);
  }
  return { ...schema };
}
