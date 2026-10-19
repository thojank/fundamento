// Maintainer script: measures komuna again and writes data/calibration.json (Spec 016, G3).
// Usage: pnpm --filter @fundamento/agordilo calibrate [--check]
//   --check  exit 1 instead of writing when the file differs from the measurement.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { measureCalibration, serializeCalibration } from "../calibration.js";
import { CALIBRATION_URL, readStructure } from "./structure.js";

const measured = serializeCalibration(measureCalibration(readStructure()));
const file = fileURLToPath(CALIBRATION_URL);
if (process.argv.includes("--check")) {
  const current = readFileSync(file, "utf8");
  if (current !== measured) {
    process.stderr.write(`${file} differs from the measurement of komuna; run without --check.\n`);
    process.exitCode = 1;
  }
} else {
  writeFileSync(file, measured);
  process.stdout.write(`Wrote ${file}\n`);
}
