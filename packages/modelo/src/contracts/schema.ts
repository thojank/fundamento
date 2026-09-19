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
  kontrastParojFile: "KontrastParojFile",
  idsLock: "IdsLock",
  rezolvo: "Rezolvo",
  resolvedToken: "ResolvedToken",
  ero: "Ero",
  skemo: "Skemo",
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
  "kontrastparoj.json": "KontrastParojFile",
  "ids.lock.json": "IdsLock",
} as const;

export type DataFileName = keyof typeof DATA_FILE_SCHEMA_DEFS;

/** Absolute schema reference of a def, e.g. `schemaRef("DimensiojFile")`. */
export function schemaRef(defName: string): string {
  return `${MODELO_SCHEMA_ID}#/$defs/${defName}`;
}

/** Reads the canonical schema from disk as a parsed JSON object. */
export function readModeloSchema(): Record<string, unknown> {
  const schema: unknown = JSON.parse(readFileSync(MODELO_SCHEMA_URL, "utf8"));
  if (typeof schema !== "object" || schema === null || Array.isArray(schema)) {
    throw new Error(`Modelo schema ${MODELO_SCHEMA_URL.href} is not a JSON object.`);
  }
  return { ...schema };
}
