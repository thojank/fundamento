// The I/O edge of the Agordilo: reading the structure (core + komuna) and a derived package from
// disk, and the calibration file. Everything else in the package is pure.

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  defaultModeloSource,
  type ModeloFiles,
  readModeloFiles,
  referenceAspektoPackageDir,
  serializeCanonicalJson,
  type ValidationIssue,
  withAspektoPackages,
} from "@fundamento/modelo";
import type { Calibration } from "../calibration.js";
import { type Structure, structureDocuments } from "../structure.js";

/** data/calibration.json of this package; valid from both `src/node/` and `dist/node/`. */
export const CALIBRATION_URL = new URL("../../data/calibration.json", import.meta.url);

function ikonojLicense(): string | undefined {
  const path = join(referenceAspektoPackageDir(), "ikonoj", "LICENSE");
  return existsSync(path) ? readFileSync(path, "utf8") : undefined;
}

function filesOrThrow(result: { files?: ModeloFiles; issues: ValidationIssue[] }): ModeloFiles {
  if (result.files === undefined) {
    const first = result.issues[0];
    throw new Error(
      `The Modelo could not be read: ${first === undefined ? "unknown reason" : `${first.path}: ${first.message}`}`,
    );
  }
  return result.files;
}

/** SHA-256 of the structure documents in canonical JSON (G1: the origin of a derived Aspekto). */
export function fingerprintOf(files: ModeloFiles): string {
  return createHash("sha256")
    .update(serializeCanonicalJson(structureDocuments(files)))
    .digest("hex");
}

function structureOf(files: ModeloFiles): Structure {
  const license = ikonojLicense();
  const fingerprint = fingerprintOf(files);
  return license === undefined
    ? { files, fingerprint }
    : { files, fingerprint, ikonojLicense: license };
}

/** The structure of the repository: the core Vortaro and data with the reference Aspekto. */
export function readStructure(): Structure {
  return structureOf(filesOrThrow(readModeloFiles(defaultModeloSource())));
}

/**
 * The structure with an Aspekto package from disk added (for `fm agordilo check`). Returns the
 * read issues instead of throwing, so a broken package is reported like any Modelo file.
 */
export function readStructureWith(packageDir: string): {
  structure?: Structure;
  issues: ValidationIssue[];
} {
  const result = readModeloFiles(withAspektoPackages(defaultModeloSource(), [packageDir]));
  if (result.files === undefined) return { issues: result.issues };
  return { structure: structureOf(result.files), issues: result.issues };
}

/** The calibration as the package ships it (data/calibration.json). */
export function loadCalibration(): Calibration {
  return JSON.parse(readFileSync(CALIBRATION_URL, "utf8")) as Calibration;
}
