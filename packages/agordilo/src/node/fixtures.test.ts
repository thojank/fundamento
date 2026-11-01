// The generator of the Agordilo's committed fixtures (S36-5.2; Spec 036 B-6.2-2): every fixture
// below the valid Modelo fixtures that carries an Agordo is a derived brand, so a derived brand
// another change adds is derived again with the others when the structure moves. Works on a
// temporary copy of the fixtures; the added brand and its values are invented (test data).

import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readAgordo } from "../agordo.js";
import type { Calibration } from "../calibration.js";
import { deriveAspekto } from "../derive.js";
import type { Structure } from "../structure.js";
import { deriveFixtures } from "./fixtures.js";
import { writePackage } from "./package-dir.js";
import { loadCalibration, readStructure } from "./structure.js";

const VALID = fileURLToPath(new URL("../../../modelo/test/fixtures/valid/", import.meta.url));
const STUFE1 = fileURLToPath(new URL("../../fixtures/stufe1-provo.json", import.meta.url));

// An invented brand that no list names: only its Agordo marks it as derived.
const NAME = "aspekto-sablo";
const SABLO = {
  name: "sablo",
  owner: "Sablo (fictitious, test only)",
  license: "MIT",
  leitfarbe: "#8a5a2b",
  neutral: { toenung: 0.3 },
};
// A fingerprint of a structure that no longer exists (the derived package is stale).
const STALE = "0".repeat(64);

const fingerprintIn = (path: string): unknown =>
  JSON.parse(readFileSync(path, "utf8")).agordilo.structure.sha256;

describe("agordilo fixtures", () => {
  let root: string;
  let validDir: string;
  let stufe1File: string;
  let aspektoFile: string;
  let current: unknown;
  let structure: Structure;
  let calibration: Calibration;

  beforeAll(() => {
    structure = readStructure();
    calibration = loadCalibration();
    root = mkdtempSync(join(tmpdir(), "agordilo-fixtures-"));
    validDir = join(root, "valid");
    stufe1File = join(root, "stufe1-provo.json");
    cpSync(VALID, validDir, { recursive: true });
    cpSync(STUFE1, stufe1File);

    const fixtureDir = join(validDir, NAME);
    mkdirSync(fixtureDir);
    writeFileSync(join(fixtureDir, "agordo.json"), `${JSON.stringify(SABLO, null, 2)}\n`);
    const { agordo, issues } = readAgordo(SABLO, "agordo.json");
    expect(issues).toEqual([]);
    if (agordo === undefined) throw new Error("the invented Agordo does not read");
    const derivation = deriveAspekto(agordo, structure, calibration);
    expect(derivation.exportable).toBe(true);
    writePackage(join(fixtureDir, NAME), derivation.files);

    aspektoFile = join(fixtureDir, NAME, "aspekto.json");
    current = fingerprintIn(aspektoFile);
    expect(current).toMatch(/^[0-9a-f]{64}$/);
    const text = readFileSync(aspektoFile, "utf8");
    writeFileSync(aspektoFile, text.replace(String(current), STALE));
  });

  afterAll(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it("reports a derived fixture that no list names as stale under --check and writes nothing", () => {
    const result = deriveFixtures({ validDir, stufe1File, check: true }, structure, calibration);
    expect(result.refused).toBeUndefined();
    expect(result.lines).toContain(`${NAME}: would change`);
    expect(result.lines).toContain("aspekto-provo: unchanged");
    expect(result.lines).toContain("aspekto-provo-kompakta: unchanged");
    expect(result.lines).toContain("fixtures/stufe1-provo.json: unchanged");
    expect(result.differs).toBe(true);
    expect(fingerprintIn(aspektoFile)).toBe(STALE);
  });

  it("derives that fixture again with the fingerprint of the current structure", () => {
    const result = deriveFixtures({ validDir, stufe1File, check: false }, structure, calibration);
    expect(result.lines).toContain(`${NAME}: derived`);
    expect(fingerprintIn(aspektoFile)).toBe(current);
  });
});
