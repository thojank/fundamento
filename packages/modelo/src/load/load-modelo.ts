// Loads a Modelo root into the in-memory Modelo (§2.4, §2.5 `loadModelo`).

import type { ValidationIssue } from "../contracts/issues.js";
import type { Modelo, ModeloSource } from "../contracts/modelo.js";
import { buildModelo } from "./build.js";
import { readModeloFiles } from "./files.js";

export interface LoadModeloResult {
  /** Absent when a file is missing or is not strict JSON. */
  modelo?: Modelo;
  issues: ValidationIssue[];
}

/**
 * Reads and interprets a Modelo root: strict parsing of every file (`file-missing`, `json-*`),
 * then flattening of the set files into LoadedTokens (`token-type-*` for tokens without a known
 * effective type). Does no schema or semantic validation (FUND-3.2). Never throws on bad input.
 */
export function loadModelo(source: ModeloSource): LoadModeloResult {
  const { files, issues } = readModeloFiles(source);
  if (files === undefined) {
    return { issues };
  }
  const built = buildModelo(files);
  return { modelo: built.modelo, issues: [...issues, ...built.issues] };
}
