// Writes a validated export to a directory (I/O edge shared by the build and `fm modelo export`):
// modelo.json, modelo.schema.json, rezolvoj.json and vortaro/<aspekto>/** (D-09). The vortaro/
// directory is replaced as a whole, so a removed Aspekto leaves no stale folder behind.

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { EXPORT_FILE_NAMES, type ModeloExport } from "./export-modelo.js";

export const VORTARO_EXPORT_DIR = "vortaro";

export function writeModeloExport(outDir: string, files: ModeloExport): string[] {
  mkdirSync(outDir, { recursive: true });
  const written: string[] = [];
  const write = (relative: string, text: string): void => {
    const path = join(outDir, relative);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text);
    written.push(relative);
  };
  write(EXPORT_FILE_NAMES.modelo, files.modeloJson);
  write(EXPORT_FILE_NAMES.schema, files.schemaJson);
  write(EXPORT_FILE_NAMES.rezolvoj, files.rezolvojJson);
  rmSync(join(outDir, VORTARO_EXPORT_DIR), { recursive: true, force: true });
  for (const [aspekto, folder] of Object.entries(files.vortaro)) {
    for (const [relative, text] of Object.entries(folder)) {
      write(`${VORTARO_EXPORT_DIR}/${aspekto}/${relative}`, text);
    }
  }
  return written;
}
