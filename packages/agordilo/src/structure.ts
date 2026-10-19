// The structure a derived Aspekto is written from (Spec 016, G2): the files of the core Vortaro
// and Modelo data with the reference Aspekto package (komuna) — its roles, their assignment to
// palette steps and every token that stage 1 writes unchanged. Read once at the I/O edge
// (node/structure.ts); everything after it is pure.

import {
  type AspektoPackageFiles,
  type ModeloFiles,
  serializeCanonicalJson,
} from "@fundamento/modelo";

export interface Structure {
  /** Core sets, data files and the reference Aspekto package, as the loader reads them. */
  files: ModeloFiles;
  /**
   * SHA-256 over the core sets and the sets and aspekto.json of the reference package, in
   * canonical JSON: the structure a derived Aspekto names as its origin (G1).
   */
  fingerprint: string;
  /** The licence text of the reference package's glyphs (`ikonoj/LICENSE`), copied with them. */
  ikonojLicense?: string;
  /**
   * The Ikonaro in the Phosphor weights the reference does not draw (Spec 019, G2 ikono.gewicht,
   * E6): data/ikonoj of the Agordilo. Not part of the fingerprint — like the calibration, it is
   * the Agordilo's, not the structure's.
   */
  ikonoGewichte?: IkonoGewichte;
}

/** Glyphs per Phosphor weight with their provenance (data/ikonoj/ikonoj.json). */
export interface IkonoGewichte {
  /** set, version, licence, source (with `<gewicht>`), the day it was read, the weights. */
  provenance: Record<string, unknown>;
  /** weight → Ikonaro name → SVG text. */
  glyphs: Record<string, Record<string, string>>;
}

/** The documents the fingerprint covers: the core sets and the reference package, by name. */
export function structureDocuments(files: ModeloFiles): { name: string; value: unknown }[] {
  const reference = files.packages[0];
  const sets = files.sets
    .filter((set) => set.package === undefined || set.package === reference?.name)
    .map((set) => ({ name: `sets/${set.name}`, value: set.value }));
  return reference === undefined
    ? sets
    : [...sets, { name: "aspekto.json", value: reference.aspekto.value }];
}

/** The reference Aspekto package of a structure: the first composed package (komuna). */
export function referencePackage(structure: Structure): AspektoPackageFiles {
  const reference = structure.files.packages[0];
  if (reference === undefined) throw new Error("The structure holds no reference Aspekto package.");
  return reference;
}

/** The text the fingerprint hashes: the structure documents in canonical JSON (G1). Pure. */
export function fingerprintDocuments(files: ModeloFiles): string {
  return serializeCanonicalJson(structureDocuments(files));
}

/**
 * The files of a structure reduced to the core and the reference Aspekto (Spec 016 ②, plan ② D-02):
 * what the Werkstatt derives over, whatever other Aspektoj the build composes — the CLI derives over
 * the same two, so browser and CLI agree value for value. The package directory loses its machine
 * path (the Vitrino is a file that travels); every other path is relative to the Modelo root already.
 */
export function referenceStructureFiles(files: ModeloFiles): ModeloFiles | undefined {
  const reference = files.packages[0];
  if (reference === undefined) return undefined;
  const dir = reference.aspekto.file.replace(/\/aspekto\.json$/, "");
  return {
    ...files,
    sets: files.sets.filter((set) => set.package === undefined || set.package === reference.name),
    packages: [{ ...reference, dir }],
  };
}
