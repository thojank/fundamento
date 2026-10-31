// What the server serves (Spec 001, D-13, FR-17): the export of the configured Modelo, built in
// memory with the same function as `fm modelo export` (or read from an export directory), plus the
// in-memory Modelo rebuilt from that export. The source tree is read once, at start.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildModelo,
  buildModeloJson,
  buildRezolvojJson,
  defaultModeloSource,
  EXPORT_FILE_NAMES,
  type Modelo,
  type ModeloJson,
  type ModeloSource,
  modeloFromExport,
  normalizeNames,
  projectModeloSource,
  readModeloFiles,
  readModeloSchema,
  serializeCanonicalJson,
  type ValidationIssue,
  validateModeloFiles,
} from "@fundamento/modelo";

export interface LoadOptions {
  /** A project's fundamento.config.json (absolute). Default: the repo Modelo with komuna. */
  config?: string;
  /** A directory written by `fm modelo export`, served as is (absolute). */
  exportDir?: string;
  /** The working directory save_agordo writes in (Spec 019 ③, E4); default: the process's. */
  workdir?: string;
}

export interface Served {
  modeloJson: ModeloJson;
  /** The Modelo rebuilt from the export (or from the source when the export is impossible). */
  modelo: Modelo;
  /** Validation issues found at start (none for a pre-built export: it was valid when written). */
  report: { errors: ValidationIssue[]; warnings: ValidationIssue[] };
  /** The export files for the resources; absent for an invalid Modelo. */
  exportFiles?: { modeloJson: string; schemaJson: string; rezolvojJson: string };
  /** The source the server composed, for validating a package against the same core. */
  source?: ModeloSource;
  /** The only directory save_agordo writes in (Spec 019 ③, E4). */
  workdir: string;
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

function loadServedModelo(options: LoadOptions): Omit<Served, "workdir"> {
  if (options.exportDir !== undefined) {
    const read = (name: string) => readFileSync(join(options.exportDir ?? "", name), "utf8");
    const exportFiles = {
      modeloJson: read(EXPORT_FILE_NAMES.modelo),
      schemaJson: read(EXPORT_FILE_NAMES.schema),
      rezolvojJson: read(EXPORT_FILE_NAMES.rezolvoj),
    };
    // Spec 036 6.3: an export written with the identifiers of either form is read in the new form.
    const modeloJson = normalizeNames(
      JSON.parse(exportFiles.modeloJson) as ModeloJson,
      exportFiles.modeloJson,
    );
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
  if (report.errors.length > 0) {
    // An invalid Modelo is not exported (as with `fm modelo export`) and may not even be
    // exportable. Serve what the source gives, so `describe` and `validate` can explain it.
    return {
      modeloJson: partialModeloJson(built),
      modelo: built,
      report: { errors: report.errors, warnings: report.warnings },
      source,
    };
  }
  // The same functions as `fm modelo export`, so the resources have its bytes. rezolvoj.json
  // (every combination) is built on first read: it is the costly part and only a resource needs
  // it (AK-07 start budget).
  const schema = readModeloSchema();
  const modeloJsonText = serializeCanonicalJson(
    buildModeloJson({ modelo: built, sets: files.sets, schema }),
  );
  const modeloJson = JSON.parse(modeloJsonText) as ModeloJson;
  let rezolvojJson: string | undefined;
  return {
    modeloJson,
    modelo: modeloFromExport(modeloJson),
    report: { errors: report.errors, warnings: report.warnings },
    exportFiles: {
      modeloJson: modeloJsonText,
      schemaJson: serializeCanonicalJson(schema),
      get rezolvojJson() {
        rezolvojJson ??= serializeCanonicalJson(buildRezolvojJson(built));
        return rezolvojJson;
      },
    },
    source,
  };
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
    mankoj: modelo.mankoj,
    kontrastParoj: modelo.kontrastParoj,
    eroj: modelo.eroj.map((entry) => entry.ero),
    skemoj: modelo.eroj.map((entry) => entry.skemo),
    ...uzojOf(modelo),
    ...((modelo.sxablonoj ?? []).length === 0
      ? {}
      : {
          sxablonoj: (modelo.sxablonoj ?? []).map((entry) => ({
            sxablono: entry.sxablono,
            skemo: entry.skemo,
            ...(entry.uzo === undefined ? {} : { uzo: entry.uzo }),
          })),
        }),
    rezolvo: { assignment: {}, tokens: {} },
  };
}

/** The Uzoj of the Eroj, or nothing while no Ero has one (Spec 007, like the export). */
function uzojOf(modelo: Modelo): Pick<ModeloJson, "uzoj"> {
  const uzoj = modelo.eroj.flatMap((entry) => (entry.uzo === undefined ? [] : [entry.uzo]));
  return uzoj.length === 0 ? {} : { uzoj };
}

/** What the server serves, with the working directory save_agordo may write in. */
export function loadServed(options: LoadOptions = {}): Served {
  return { ...loadServedModelo(options), workdir: options.workdir ?? process.cwd() };
}
