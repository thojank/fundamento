// Validate, then export: the export is only produced from a valid Modelo (FUND-4.1, FR-06/FR-07).

import type { ValidationIssue } from "../contracts/issues.js";
import type { ModeloSource } from "../contracts/modelo.js";
import { readModeloSchema } from "../contracts/schema.js";
import { buildModelo } from "../load/build.js";
import { type ModeloFiles, readModeloFiles } from "../load/files.js";
import { validateModeloFiles } from "../validate/validate-modelo.js";
import { exportModelo, type ModeloExport } from "./export-modelo.js";

export type ValidatedExportResult =
  | { ok: true; files: ModeloExport; warnings: ValidationIssue[] }
  | { ok: false; errors: ValidationIssue[]; warnings: ValidationIssue[] };

/**
 * Validates already read Modelo files (`validateModeloFiles`) and exports them only if there are
 * no errors. Warnings do not block the export. No file I/O beyond the shared schema compile.
 */
export function exportValidatedModelo(
  files: ModeloFiles,
  schema: Readonly<Record<string, unknown>>,
  readIssues: readonly ValidationIssue[] = [],
): ValidatedExportResult {
  const report = validateModeloFiles(files, readIssues);
  if (!report.valid) {
    return { ok: false, errors: report.errors, warnings: report.warnings };
  }
  const { modelo } = buildModelo(files);
  return {
    ok: true,
    files: exportModelo({ modelo, sets: files.sets, schema }),
    warnings: report.warnings,
  };
}

/** Reads the Modelo at `source` and the canonical schema, then `exportValidatedModelo`. */
export function prepareModeloExport(source: ModeloSource): ValidatedExportResult {
  const { files, issues } = readModeloFiles(source);
  if (files === undefined) {
    return { ok: false, errors: issues, warnings: [] };
  }
  return exportValidatedModelo(files, readModeloSchema(), issues);
}
