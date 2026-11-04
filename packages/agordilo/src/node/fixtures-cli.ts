// Maintainer script (generator): derives the Agordilo's committed outputs again – the derived
// example brands in the Modelo fixtures and the checksums of the stage-1 derivation in
// fixtures/stufe1-provo.json (fixtures.ts). The codemod of Spec 036 Teil 6 runs it after the
// Ero-Tokens (scripts/neutrale-namen).
// Usage: pnpm --filter @fundamento/agordilo fixtures [--check]
// Exit codes: 0 written (or, with --check, nothing to write), 1 a derivation is refused or, with
// --check, a file would change.

import { fileURLToPath } from "node:url";
import { deriveFixtures } from "./fixtures.js";
import { loadCalibration, readStructure } from "./structure.js";

const check = process.argv.includes("--check");
const result = deriveFixtures(
  {
    validDir: fileURLToPath(new URL("../../../modelo/test/fixtures/valid/", import.meta.url)),
    stufe1File: fileURLToPath(new URL("../../fixtures/stufe1-provo.json", import.meta.url)),
    check,
  },
  readStructure(),
  loadCalibration(),
);
for (const line of result.lines) process.stdout.write(`${line}\n`);
if (result.refused !== undefined) {
  process.stderr.write(`fixtures: the derivation of ${result.refused} is refused.\n`);
  process.exit(1);
}
process.exit(check && result.differs ? 1 : 0);
