// What the server serves (Spec 001, D-13, FR-17): the export of the configured Modelo, built in
// memory with the same function as `fm modelo export` (or read from an export directory), plus the
// in-memory Modelo rebuilt from that export. The source tree is read once, at start.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildModelo,
  defaultModeloSource,
  EXPORT_FILE_NAMES,
  exportModelo,
  type Modelo,
  type ModeloJson,
  type ModeloSource,
  modeloFromExport,
  projectModeloSource,
  readModeloFiles,
  readModeloSchema,
  type ValidationIssue,
  validateModeloFiles,
} from "@fundamento/modelo";

export interface LoadOptions {
  /** A project's fundamento.config.json (absolute). Default: the repo Modelo with komuna. */
  config?: string;
  /** A directory written by `fm modelo export`, served as is (absolute). */
  exportDir?: string;
}

export interface Served {
  modeloJson: ModeloJson;
  /** The Modelo rebuilt from the export (or from the source when the export is impossible). */
  modelo: Modelo;
  /** Validation issues found at start (none for a pre-built export: it was valid when written). */
  report: { errors: ValidationIssue[]; warnings: ValidationIssue[] };
  /** The export files for the resources, when an export exists. */
  exportFiles?: { modeloJson: string; schemaJson: string; rezolvojJson: string };
  /** The source the server composed, for validating a package against the same core. */
  source?: ModeloSource;
}

/** The source could not be read at all (missing or malformed files). */
export class ServedLoadError extends Error {
  readonly issues: readonly ValidationIssue[];
  constructor(issues: readonly ValidationIssue[]) {
    super(`The Modelo could not be read (${issues.length} issue(s)).`);
    this.name = "ServedLoadError";
    this.issues = issues;
  }
}

export function loadServed(options: LoadOptions = {}): Served {
  if (options.exportDir !== undefined) {
    const read = (name: string) => readFileSync(join(options.exportDir ?? "", name), "utf8");
    const exportFiles = {
      modeloJson: read(EXPORT_FILE_NAMES.modelo),
      schemaJson: read(EXPORT_FILE_NAMES.schema),
      rezolvojJson: read(EXPORT_FILE_NAMES.rezolvoj),
    };
    const modeloJson = JSON.parse(exportFiles.modeloJson) as ModeloJson;
    return {
      modeloJson,
      modelo: modeloFromExport(modeloJson),
      report: { errors: [], warnings: [] },
      exportFiles,
    };
  }
  const source =
    options.config === undefined ? defaultModeloSource() : projectModeloSource(options.config);
  const { files, issues } = readModeloFiles(source);
  if (files === undefined) throw new ServedLoadError(issues);
  const report = validateModeloFiles(files, issues);
  const built = buildModelo(files).modelo;
  try {
    const exported = exportModelo({ modelo: built, sets: files.sets, schema: readModeloSchema() });
    const modeloJson = JSON.parse(exported.modeloJson) as ModeloJson;
    return {
      modeloJson,
      modelo: modeloFromExport(modeloJson),
      report: { errors: report.errors, warnings: report.warnings },
      exportFiles: {
        modeloJson: exported.modeloJson,
        schemaJson: exported.schemaJson,
        rezolvojJson: exported.rezolvojJson,
      },
      source,
    };
  } catch {
    // An invalid Modelo may not be exportable (e.g. an unresolvable alias). Serve what the source
    // gives, so `describe` and `validate` can still explain what is wrong.
    return {
      modeloJson: partialModeloJson(built),
      modelo: built,
      report: { errors: report.errors, warnings: report.warnings },
      source,
    };
  }
}

/** The parts of modelo.json that need no resolution, for a Modelo that cannot be exported. */
function partialModeloJson(modelo: Modelo): ModeloJson {
  const core = modelo.setoj.find((set) => set.name === "core");
  return {
    $schema: "./modelo.schema.json",
    fundamento: { version: modelo.version },
    dimensioj: modelo.dimensioj,
    aspektoj: [],
    tokenTypes: [],
    tokens: Object.values(core?.tokens ?? {}).map((token) => {
      const entry: ModeloJson["tokens"][number] = {
        id: token.id ?? "",
        name: token.name,
        type: token.type,
      };
      if (token.description !== undefined) entry.description = token.description;
      if (token.role !== undefined) entry.role = token.role;
      return entry;
    }),
    setoj: [],
    reguloj: modelo.reguloj,
    jugxoj: modelo.jugxoj,
    kontrastParoj: modelo.kontrastParoj,
    eroj: [],
    rezolvo: { assignment: {}, tokens: {} },
  };
}
