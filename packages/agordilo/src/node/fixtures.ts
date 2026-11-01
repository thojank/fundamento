// The generator of the Agordilo's committed outputs (S36-5.2): the derived example brands in the
// Modelo fixtures and the checksums of the stage-1 derivation in fixtures/stufe1-provo.json
// (Spec 019 ①: the standard sliders give stage 1 byte for byte). Both name content of the
// structure (its fingerprint, the extension key of every set), so a change of the structure is
// followed by this generator, never by a hand edit or a text rule. The CLI is fixtures-cli.ts.

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { type Agordo, readAgordo } from "../agordo.js";
import type { Calibration } from "../calibration.js";
import { deriveAspekto } from "../derive.js";
import type { Structure } from "../structure.js";
import { AGORDILO_VERSION } from "../version.js";
import { writePackage } from "./package-dir.js";

export interface FixturesOptions {
  /** The directory of the valid Modelo fixtures (`packages/modelo/test/fixtures/valid`). */
  readonly validDir: string;
  /** The stage-1 checksums (`packages/agordilo/fixtures/stufe1-provo.json`). */
  readonly stufe1File: string;
  /** Only compare with what is on disk; write nothing. */
  readonly check: boolean;
}

export interface FixturesResult {
  /** One line per output: `<name>: unchanged`, `would change` (with `check`) or `derived`. */
  readonly lines: readonly string[];
  /** Whether an output differed from what was on disk. */
  readonly differs: boolean;
  /** The fixture whose derivation was refused; nothing after it was derived. */
  readonly refused?: string;
}

/**
 * The derived fixtures: every directory below `validDir` that carries an Agordo (`agordo.json`),
 * sorted by name. Found from the data, not from a list, so a derived brand another change adds
 * (Spec 036 B-6.2-2: aspekto-dukolora of Teil 2b) is derived again with the others.
 */
export function derivedFixtures(validDir: string): readonly string[] {
  return readdirSync(validDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(validDir, entry.name, "agordo.json")))
    .map((entry) => entry.name)
    .sort();
}

function agordoAt(path: string): Agordo {
  const { agordo, issues } = readAgordo(JSON.parse(readFileSync(path, "utf8")), path);
  if (agordo === undefined) {
    throw new Error(`The Agordo ${path} does not read: ${issues.map((i) => i.message).join(" ")}`);
  }
  return agordo;
}

/** The text of a file, or `undefined` when it does not exist. */
function textOf(path: string): string | undefined {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return undefined;
  }
}

// The stage-1 checksums: the bytes of stage 1 with its version stamps (stufe2.test.ts, asStage1).
const STAGE1_VERSION = "0.1.0";
const asStage1 = (text: string): string =>
  text
    .replaceAll(
      new RegExp(
        `("(?:agordilo|vortaro|version)": )"${AGORDILO_VERSION.replaceAll(".", "\\.")}"`,
        "g",
      ),
      `$1"${STAGE1_VERSION}"`,
    )
    .replaceAll(`Agordilo ${AGORDILO_VERSION} (`, `Agordilo ${STAGE1_VERSION} (`);
const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");

/**
 * Derives every derived fixture below `validDir` (`<name>/agordo.json` → the package
 * `<name>/<name>`) and the stage-1 checksums again, and writes what differs unless `check`.
 */
export function deriveFixtures(
  options: FixturesOptions,
  structure: Structure,
  calibration: Calibration,
): FixturesResult {
  const { validDir, stufe1File, check } = options;
  const lines: string[] = [];
  let differs = false;
  const state = (same: boolean): string =>
    same ? "unchanged" : check ? "would change" : "derived";

  for (const name of derivedFixtures(validDir)) {
    const derivation = deriveAspekto(
      agordoAt(join(validDir, name, "agordo.json")),
      structure,
      calibration,
    );
    if (!derivation.exportable) return { lines, differs, refused: name };
    const dir = join(validDir, name, name);
    const same = Object.entries(derivation.files).every(
      ([path, text]) => textOf(join(dir, path)) === text,
    );
    if (!same) {
      differs = true;
      if (!check) writePackage(dir, derivation.files);
    }
    lines.push(`${name}: ${state(same)}`);
  }

  const stufe1Text = readFileSync(stufe1File, "utf8");
  const stufe1 = JSON.parse(stufe1Text) as { agordo: Agordo; sha256: unknown };
  const { files } = deriveAspekto(stufe1.agordo, structure, calibration);
  const checksums = Object.fromEntries(
    Object.entries(files).map(([path, text]) => [path, sha256(asStage1(text))]),
  );
  // Only the checksums are written again (the last field); the rest of the file keeps its bytes.
  const at = stufe1Text.lastIndexOf('\n  "sha256": ');
  if (at === -1) throw new Error(`${stufe1File} has no sha256 field at its end.`);
  const next = `${stufe1Text.slice(0, at)}\n  "sha256": ${JSON.stringify(checksums, null, 2).replaceAll("\n", "\n  ")}\n}\n`;
  const same = next === stufe1Text;
  if (!same) {
    differs = true;
    if (!check) writeFileSync(stufe1File, next);
  }
  lines.push(`fixtures/${basename(stufe1File)}: ${state(same)}`);
  return { lines, differs };
}
