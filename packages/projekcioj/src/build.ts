// `buildProjekcioj` (Spec 003, plan D-01, D-18, AK-02): validates the Modelo, runs every Celo and
// writes their files plus `projekcioj.json`, a manifest with the SHA-256 of every file. Every Celo
// is a pure function of the Modelo, so two builds are byte-identical and a deleted output is
// regenerated with the same bytes. Nothing is written for an invalid Modelo.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
import { CODE_CONNECT_CELO } from "./celoj/code-connect/code-connect.js";
import { CSS_CELO } from "./celoj/css/css.js";
import { FIGMA_CELO } from "./celoj/figma/figma.js";
import { bundleMakeKits, MAKE_KIT_CELO } from "./celoj/make-kit/make-kit.js";
import { REACT_CELO } from "./celoj/react/react.js";
import { TAILWIND_CELO } from "./celoj/tailwind/tailwind.js";
import { VITRINO_CELO, type VitrinoBazo } from "./celoj/vitrino/vitrino.js";
import { WEB_COMPONENT_CELO } from "./celoj/web-component/web-component.js";
import { writeParityInventories } from "./parity.js";

/** What a Celo gets: the loaded Modelo and its export, never raw files (Art. I). */
export interface CeloInput {
  modelo: Modelo;
  modeloJson: ModeloJson;
  rezolvoj: RezolvojJson;
  /** Environment of the build; only the optional Code Connect Celo reads it (D-13). */
  env?: Readonly<Record<string, string | undefined>>;
  /** A measurement snapshot of another state, for the Vitrino's comparison (Spec 004, `--bazo`). */
  bazo?: VitrinoBazo;
}

/** One generated file: a path relative to the output directory and its text. */
export interface GeneratedFile {
  path: string;
  text: string;
}

/**
 * An output target of the projections (Art. XII). A Celo writes files from the Modelo alone
 * (`generate`), or from what the other Celoj wrote (`after`, Spec 004 D-06: the Vitrino embeds the
 * stylesheet and the bundled element), or both.
 */
export interface Celo {
  name: string;
  /** Files from the Modelo alone; empty for a Celo that only composes. */
  generate(input: CeloInput): GeneratedFile[];
  /** Files composed from what the other Celoj wrote, after the Make Kits are bundled. */
  after?(outDir: string, input: CeloInput): GeneratedFile[];
}

/** Every Celo, in the order of Art. XII. Each task of Spec 003 adds its Celo here. */
export const CELOJ: readonly Celo[] = [
  CSS_CELO,
  TAILWIND_CELO,
  WEB_COMPONENT_CELO,
  REACT_CELO,
  FIGMA_CELO,
  CODE_CONNECT_CELO,
  MAKE_KIT_CELO,
  VITRINO_CELO,
];

export const MANIFEST_FILE = "projekcioj.json";

/**
 * The Celoj a build runs: all of them, or the named ones in the order of `CELOJ`. A Celo that
 * composes what the others wrote cannot run alone — it would read files that were never written.
 */
export function selectedCeloj(names: readonly string[] | undefined): readonly Celo[] {
  if (names === undefined) return CELOJ;
  const known = CELOJ.map((celo) => celo.name);
  const unknown = names.filter((name) => !known.includes(name));
  if (unknown.length > 0) {
    throw new Error(`Unknown Celo ${unknown.join(", ")}. Known Celoj: ${known.join(", ")}.`);
  }
  const chosen = CELOJ.filter((celo) => names.includes(celo.name));
  const composing = chosen.filter((celo) => celo.after !== undefined);
  const missing = composing.length === 0 ? [] : known.filter((name) => !names.includes(name));
  if (composing.length > 0 && missing.length > 0) {
    throw new Error(
      `The Celo ${composing.map((celo) => celo.name).join(", ")} composes what the other Celoj ` +
        `wrote; it cannot be built without them. Add ${missing.join(", ")}, or build all Celoj.`,
    );
  }
  return chosen;
}

export interface BuildOptions {
  outDir: string;
  /** A measurement snapshot to compare with; the Vitrino shows the change (Spec 004 T010). */
  bazo?: VitrinoBazo;
  /** A Modelo source; defaults to the repository's Modelo. */
  source?: ModeloSource;
  /** Shortcut for a fixture Modelo root (`<root>/vortaro`, `<root>/data`). */
  fixtureRoot?: string;
  /**
   * Build only these Celoj, in the order of `CELOJ`. Default: all of them. A selection is for
   * regenerating one projection and for tests that check the wiring of the command rather than
   * the work of every Celo (F12).
   */
  celoj?: readonly string[];
}

/** The Celoj that only write sources; their package is bundled after the generation (D-14). */
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
      env: process.env,
    },
    warnings: prepared.warnings,
  };
}

/** Generates every Celo into `outDir`; the Make Kits are bundled afterwards (`bundle`). */
export async function buildProjekcioj(options: BuildOptions): Promise<BuildResult> {
  const source =
    options.source ??
    (options.fixtureRoot === undefined
      ? defaultModeloSource()
      : fixtureModeloSource(options.fixtureRoot));
  const celoj = selectedCeloj(options.celoj);
  const prepared = celoInputOf(source);
  if (!prepared.ok) return prepared;
  if (options.bazo !== undefined) prepared.input.bazo = options.bazo;

  const generated = celoj.flatMap((celo) => celo.generate(prepared.input));
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
    celoj: celoj.map((celo) => celo.name),
    files: hashes,
  };
  mkdirSync(options.outDir, { recursive: true });
  writeFileSync(join(options.outDir, MANIFEST_FILE), `${JSON.stringify(manifest, null, 2)}\n`);
  // The Make Kits are packages: after their sources come their bundles and types (D-14, T019).
  // They are written by a bundler, not by a Celo, so the manifest hashes them from disk. Both this
  // and the parity inventories belong to the Celoj that were built: a selection writes neither the
  // bundle of a Celo it skipped nor an inventory of a side that has no files (F12).
  const built = (name: string) => celoj.some((celo) => celo.name === name);
  const bundled = built(MAKE_KIT_CELO.name)
    ? await bundleMakeKits(options.outDir, prepared.input)
    : [];
  const inventories =
    options.celoj === undefined ? writeParityInventories(options.outDir, prepared.input) : [];
  // Second phase: Celoj that compose what the others wrote (Spec 004, D-06).
  const composed: string[] = [];
  for (const celo of celoj) {
    for (const file of celo.after?.(options.outDir, prepared.input) ?? []) {
      const target = join(options.outDir, file.path);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, file.text);
      composed.push(file.path);
    }
  }
  for (const file of [...bundled, ...inventories, ...composed]) {
    hashes[file] = createHash("sha256")
      .update(readFileSync(join(options.outDir, file)))
      .digest("hex");
  }
  manifest.files = hashes;
  writeFileSync(join(options.outDir, MANIFEST_FILE), `${JSON.stringify(manifest, null, 2)}\n`);
  return {
    ok: true,
    celoj: manifest.celoj,
    files: Object.keys(hashes),
    warnings: prepared.warnings,
  };
}
