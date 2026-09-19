// `buildProjekcioj` (Spec 003, plan D-01, D-18, AK-02): validates the Modelo, runs every Celo and
// writes their files plus `projekcioj.json`, a manifest with the SHA-256 of every file. Every Celo
// is a pure function of the Modelo, so two builds are byte-identical and a deleted output is
// regenerated with the same bytes. Nothing is written for an invalid Modelo.

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  buildModelo,
  defaultModeloSource,
  fixtureModeloSource,
  type Modelo,
  type ModeloJson,
  type ModeloSource,
  prepareModeloExport,
  type RezolvojJson,
  readModeloFiles,
  type ValidationIssue,
} from "@fundamento/modelo";
import { CSS_CELO } from "./celoj/css/css.js";
import { REACT_CELO } from "./celoj/react/react.js";
import { TAILWIND_CELO } from "./celoj/tailwind/tailwind.js";
import { WEB_COMPONENT_CELO } from "./celoj/web-component/web-component.js";

/** What a Celo gets: the loaded Modelo and its export, never raw files (Art. I). */
export interface CeloInput {
  modelo: Modelo;
  modeloJson: ModeloJson;
  rezolvoj: RezolvojJson;
}

/** One generated file: a path relative to the output directory and its text. */
export interface GeneratedFile {
  path: string;
  text: string;
}

/** An output target of the projections (Art. XII). */
export interface Celo {
  name: string;
  generate(input: CeloInput): GeneratedFile[];
}

/** Every Celo, in the order of Art. XII. Each task of Spec 003 adds its Celo here. */
export const CELOJ: readonly Celo[] = [CSS_CELO, TAILWIND_CELO, WEB_COMPONENT_CELO, REACT_CELO];

export const MANIFEST_FILE = "projekcioj.json";

export interface BuildOptions {
  outDir: string;
  /** A Modelo source; defaults to the repository's Modelo. */
  source?: ModeloSource;
  /** Shortcut for a fixture Modelo root (`<root>/vortaro`, `<root>/data`). */
  fixtureRoot?: string;
}

export type BuildResult =
  | { ok: true; celoj: string[]; files: string[]; warnings: ValidationIssue[] }
  | { ok: false; errors: ValidationIssue[]; warnings: ValidationIssue[] };

/** The Celo input of a valid Modelo, or its errors. */
export function celoInputOf(
  source: ModeloSource,
):
  | { ok: true; input: CeloInput; warnings: ValidationIssue[] }
  | { ok: false; errors: ValidationIssue[]; warnings: ValidationIssue[] } {
  const prepared = prepareModeloExport(source);
  if (!prepared.ok) return prepared;
  const { files } = readModeloFiles(source);
  if (files === undefined) return { ok: false, errors: [], warnings: prepared.warnings };
  return {
    ok: true,
    input: {
      modelo: buildModelo(files).modelo,
      modeloJson: JSON.parse(prepared.files.modeloJson) as ModeloJson,
      rezolvoj: JSON.parse(prepared.files.rezolvojJson) as RezolvojJson,
    },
    warnings: prepared.warnings,
  };
}

/** Generates every Celo into `outDir`. */
export function buildProjekcioj(options: BuildOptions): BuildResult {
  const source =
    options.source ??
    (options.fixtureRoot === undefined
      ? defaultModeloSource()
      : fixtureModeloSource(options.fixtureRoot));
  const prepared = celoInputOf(source);
  if (!prepared.ok) return prepared;

  const generated = CELOJ.flatMap((celo) => celo.generate(prepared.input));
  const paths = generated.map((file) => file.path);
  const duplicate = paths.find((path, index) => paths.indexOf(path) !== index);
  if (duplicate !== undefined) throw new Error(`Two Celoj write ${duplicate}.`);

  const hashes: Record<string, string> = {};
  for (const file of [...generated].sort((a, b) => (a.path < b.path ? -1 : 1))) {
    const target = join(options.outDir, file.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, file.text);
    hashes[file.path] = createHash("sha256").update(file.text).digest("hex");
  }
  const manifest = {
    fundamento: prepared.input.modeloJson.fundamento.version,
    celoj: CELOJ.map((celo) => celo.name),
    files: hashes,
  };
  mkdirSync(options.outDir, { recursive: true });
  writeFileSync(join(options.outDir, MANIFEST_FILE), `${JSON.stringify(manifest, null, 2)}\n`);
  return {
    ok: true,
    celoj: manifest.celoj,
    files: Object.keys(hashes),
    warnings: prepared.warnings,
  };
}
