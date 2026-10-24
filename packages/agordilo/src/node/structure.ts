// The I/O edge of the Agordilo: reading the structure (core + komuna) and a derived package from
// disk, and the calibration file. Everything else in the package is pure.

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  defaultModeloSource,
  type ModeloFiles,
  readModeloFiles,
  referenceAspektoPackageDir,
  type ValidationIssue,
  withAspektoPackages,
} from "@fundamento/modelo";
import type { Calibration } from "../calibration.js";
import {
  fingerprintDocuments,
  type IkonoGewichte,
  KOMUNA_0_2,
  type Structure,
  struktur02Files,
} from "../structure.js";
import type { Wuensche } from "../wunsch.js";

/** data/calibration.json of this package; valid from both `src/node/` and `dist/node/`. */
export const CALIBRATION_URL = new URL("../../data/calibration.json", import.meta.url);

/** data/ikonoj of this package: the Ikonaro in further Phosphor weights (Spec 019, E6). */
export const IKONOJ_URL = new URL("../../data/ikonoj/", import.meta.url);

/** The glyphs of every weight in data/ikonoj with their provenance (Spec 019, G2, E6). */
export function loadIkonoGewichte(): IkonoGewichte | undefined {
  const provenanceUrl = new URL("ikonoj.json", IKONOJ_URL);
  if (!existsSync(provenanceUrl)) return undefined;
  const provenance = JSON.parse(readFileSync(provenanceUrl, "utf8")) as Record<string, unknown>;
  const weights = Array.isArray(provenance.gewichte) ? provenance.gewichte.map(String) : [];
  const glyphs: Record<string, Record<string, string>> = {};
  for (const weight of weights) {
    const dir = new URL(`${weight}/`, IKONOJ_URL);
    if (!existsSync(dir)) continue;
    const own: Record<string, string> = {};
    for (const file of readdirSync(dir)
      .filter((entry) => entry.endsWith(".svg"))
      .sort()) {
      own[file.slice(0, -".svg".length)] = readFileSync(new URL(file, dir), "utf8");
    }
    glyphs[weight] = own;
  }
  return { provenance, glyphs };
}

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
  return createHash("sha256").update(fingerprintDocuments(files)).digest("hex");
}

function structureOf(files: ModeloFiles): Structure {
  const license = ikonojLicense();
  const weights = loadIkonoGewichte();
  return {
    files,
    fingerprint: fingerprintOf(files),
    ...(license === undefined ? {} : { ikonojLicense: license }),
    ...(weights === undefined ? {} : { ikonoGewichte: weights }),
  };
}

/** The directory of the package komuna-0-2 (Spec 029 ①). */
export function komuna02PackageDir(): string {
  return dirname(fileURLToPath(import.meta.resolve("@fundamento/aspekto-komuna-0-2/package.json")));
}

/**
 * The structure the Agordilo derives over (Spec 029 ①): by default komuna as it was before the
 * Fonto, rebuilt from the package komuna-0-2 — the structure every derived brand names as its
 * origin and the calibration was measured on. `"komuna"` reads today's komuna, the reference with
 * the values of the Fonto; deriving from it waits for a calibration of its own (plan, O-3).
 */
export function readStructure(reference: "komuna-0-2" | "komuna" = KOMUNA_0_2): Structure {
  if (reference === "komuna") {
    return structureOf(filesOrThrow(readModeloFiles(defaultModeloSource())));
  }
  const files = filesOrThrow(
    readModeloFiles(withAspektoPackages(defaultModeloSource(), [komuna02PackageDir()])),
  );
  const rebuilt = struktur02Files(files);
  if (rebuilt === undefined) throw new Error("The package komuna-0-2 does not hold komuna 0.2.");
  return structureOf(rebuilt);
}

/**
 * The structure with an Aspekto package from disk added (for `fm agordilo check`). Returns the
 * read issues instead of throwing, so a broken package is reported like any Modelo file.
 */
export function readStructureWith(packageDir: string): {
  structure?: Structure;
  issues: ValidationIssue[];
} {
  // Spec 029 ①: checked over the structure it was derived from, komuna 0.2 (readStructure).
  const result = readModeloFiles(
    withAspektoPackages(defaultModeloSource(), [komuna02PackageDir(), packageDir]),
  );
  if (result.files === undefined) return { issues: result.issues };
  const rebuilt = struktur02Files(result.files);
  if (rebuilt === undefined) return { issues: result.issues };
  return { structure: structureOf(rebuilt), issues: result.issues };
}

/** data/wuensche.json: the wish vocabulary of propose_agordo (Spec 019 ③, G6). */
export const WUENSCHE_URL = new URL("../../data/wuensche.json", import.meta.url);

/** The wish vocabulary as the package ships it. */
export function readWuensche(): Wuensche {
  return JSON.parse(readFileSync(WUENSCHE_URL, "utf8")) as Wuensche;
}

/** The calibration as the package ships it (data/calibration.json). */
export function loadCalibration(): Calibration {
  return JSON.parse(readFileSync(CALIBRATION_URL, "utf8")) as Calibration;
}
