// Maintainer script (generator): derives the Agordilo's committed outputs again – the example
// brands provo and provo-kompakta in the Modelo fixtures, and the checksums of the stage-1
// derivation in fixtures/stufe1-provo.json (Spec 019 ①: the standard sliders give stage 1 byte for
// byte). Both name content of the structure (its fingerprint, the extension key of every set), so
// a change of the structure is followed by this generator, never by a hand edit or a text rule.
// The codemod of Spec 036 Teil 6 runs it after the Ero-Tokens (scripts/neutrale-namen).
// Usage: pnpm --filter @fundamento/agordilo fixtures [--check]
// Exit codes: 0 written (or, with --check, nothing to write), 1 a derivation is refused or, with
// --check, a file would change.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { type Agordo, readAgordo } from "../agordo.js";
import { deriveAspekto } from "../derive.js";
import { AGORDILO_VERSION } from "../version.js";
import { writePackage } from "./package-dir.js";
import { loadCalibration, readStructure } from "./structure.js";

const check = process.argv.includes("--check");
const structure = readStructure();
const calibration = loadCalibration();
let differs = false;

const fixture = (path: string): string =>
  fileURLToPath(new URL(`../../../modelo/test/fixtures/valid/${path}`, import.meta.url));

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

for (const name of ["provo", "provo-kompakta"]) {
  const derivation = deriveAspekto(
    agordoAt(fixture(`aspekto-${name}/agordo.json`)),
    structure,
    calibration,
  );
  if (!derivation.exportable) {
    process.stderr.write(`fixtures: the derivation of ${name} is refused.\n`);
    process.exit(1);
  }
  const dir = fixture(`aspekto-${name}/aspekto-${name}`);
  const same = Object.entries(derivation.files).every(
    ([path, text]) => textOf(`${dir}/${path}`) === text,
  );
  if (!same) {
    differs = true;
    if (!check) writePackage(dir, derivation.files);
  }
  process.stdout.write(
    `aspekto-${name}: ${same ? "unchanged" : check ? "would change" : "derived"}\n`,
  );
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

const STUFE1_URL = new URL("../../fixtures/stufe1-provo.json", import.meta.url);
const stufe1Text = readFileSync(STUFE1_URL, "utf8");
const stufe1 = JSON.parse(stufe1Text) as { agordo: Agordo; sha256: unknown };
const { files } = deriveAspekto(stufe1.agordo, structure, calibration);
const checksums = Object.fromEntries(
  Object.entries(files).map(([path, text]) => [path, sha256(asStage1(text))]),
);
// Only the checksums are written again (the last field); the rest of the file keeps its bytes.
const at = stufe1Text.lastIndexOf('\n  "sha256": ');
if (at === -1) throw new Error("fixtures/stufe1-provo.json has no sha256 field at its end.");
const next = `${stufe1Text.slice(0, at)}\n  "sha256": ${JSON.stringify(checksums, null, 2).replaceAll("\n", "\n  ")}\n}\n`;
if (next !== stufe1Text) {
  differs = true;
  if (!check) writeFileSync(STUFE1_URL, next);
}
process.stdout.write(
  `fixtures/stufe1-provo.json: ${next === stufe1Text ? "unchanged" : check ? "would change" : "derived"}\n`,
);
process.exit(check && differs ? 1 : 0);
