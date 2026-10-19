// The structure a derived Aspekto is written from (Spec 016, G2): the files of the core Vortaro
// and Modelo data with the reference Aspekto package (komuna) — its roles, their assignment to
// palette steps and every token that stage 1 writes unchanged. Read once at the I/O edge
// (node/structure.ts); everything after it is pure.

import type { AspektoPackageFiles, ModeloFiles } from "@fundamento/modelo";

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
