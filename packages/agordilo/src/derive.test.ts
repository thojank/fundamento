// The derivation (Spec 016 G1–G3, G5): an Agordo becomes a complete Aspekto package with its
// origin in aspekto.json and its report, the same bytes on every run. The example Agordo `provo`
// (test data, invented values) lives with its derived package in the Modelo fixtures, where
// `check:alirebleco` measures it as an external Aspekto (Nachlese 3 W2).

import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { CORE_SET_NAME } from "@fundamento/modelo";
import { beforeAll, describe, expect, it } from "vitest";
import {
  AGORDILO_VERSION,
  type Derivation,
  deriveAspekto,
  loadCalibration,
  readAgordo,
  readStructure,
} from "./index.js";

const PROVO_DIR = fileURLToPath(
  new URL("../../modelo/test/fixtures/valid/aspekto-provo/", import.meta.url),
);
const PROVO_AGORDO = join(PROVO_DIR, "agordo.json");
const PROVO_PACKAGE = join(PROVO_DIR, "aspekto-provo");
// Spec 019 ①, G8: the counterpart of provo — sharp, dense, smaller type, light icons (test data).
const KOMPAKTA_DIR = fileURLToPath(
  new URL("../../modelo/test/fixtures/valid/aspekto-provo-kompakta/", import.meta.url),
);
const KOMPAKTA_AGORDO = join(KOMPAKTA_DIR, "agordo.json");
const KOMPAKTA_PACKAGE = join(KOMPAKTA_DIR, "aspekto-provo-kompakta");

function agordoAt(path: string) {
  const { agordo, issues } = readAgordo(JSON.parse(readFileSync(path, "utf8")), "agordo.json");
  expect(issues).toEqual([]);
  if (agordo === undefined) throw new Error(`the Agordo ${path} does not read`);
  return agordo;
}

const provoAgordo = () => agordoAt(PROVO_AGORDO);

/** A token of a set document by its dotted name. */
function tokenOf(set: unknown, name: string): unknown {
  let node = set as Record<string, unknown> | undefined;
  for (const key of name.split(".")) node = node?.[key] as Record<string, unknown> | undefined;
  return node?.$value;
}

/** Every token name of a DTCG set document (groups nested, `$value` marks a token). */
function tokenNames(value: unknown, prefix: string[] = []): string[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return [];
  if ("$value" in value) return [prefix.join(".")];
  return Object.entries(value).flatMap(([key, child]) =>
    key.startsWith("$") ? [] : tokenNames(child, [...prefix, key]),
  );
}

function filesOf(dir: string): Record<string, string> {
  const files: Record<string, string> = {};
  for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath, entry.name);
    files[relative(dir, path).split(sep).join("/")] = readFileSync(path, "utf8");
  }
  return files;
}

// One derivation per file: each one composes and checks the whole Modelo, and the test run shares
// its cores with every other package (CI run 39158336356). Two fresh runs are compared by the CLI
// test (agordilo.test.ts of @fundamento/cli); here this run is compared with an earlier one, the
// committed fixture.
describe("deriveAspekto with the Agordo provo", () => {
  let first: Derivation;
  beforeAll(() => {
    first = deriveAspekto(provoAgordo(), readStructure(), loadCalibration());
  });

  it("is deterministic: this run gives the bytes of an earlier run (the committed fixture)", () => {
    const earlier = filesOf(PROVO_PACKAGE);
    expect(Object.keys(first.files)).toEqual(Object.keys(earlier).sort());
    for (const [path, text] of Object.entries(first.files)) {
      expect(earlier[path], path).toBe(text);
    }
  });

  it("writes a complete package: aspekto.json, ids.lock.json, $themes.json, sets, report", () => {
    for (const path of [
      "aspekto.json",
      "ids.lock.json",
      "$themes.json",
      "sets/aspekto/provo.json",
      "raporto.json",
      "raporto.md",
    ]) {
      expect(first.files[path], path).toBeDefined();
    }
  });

  it("assigns every token of the Vortaro in aspekto/provo (G1, Art. IV)", () => {
    const structure = readStructure();
    const core = structure.files.sets.find((set) => set.name === CORE_SET_NAME);
    const coreNames = tokenNames(core?.value).sort();
    expect(coreNames.length).toBeGreaterThan(300);
    const own = new Set(tokenNames(JSON.parse(first.files["sets/aspekto/provo.json"] ?? "{}")));
    expect(coreNames.filter((name) => !own.has(name))).toEqual([]);
  });

  it("carries its origin in aspekto.json: the Agordo, the Agordilo version and the structure", () => {
    const aspekto = JSON.parse(first.files["aspekto.json"] ?? "{}");
    expect(aspekto.name).toBe("provo");
    expect(aspekto.agordilo.version).toBe(AGORDILO_VERSION);
    expect(aspekto.agordilo.agordo).toEqual(provoAgordo());
    expect(aspekto.agordilo.structure.reference).toBe("komuna");
    expect(aspekto.agordilo.structure.sha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it("passes every check: no violation, exportable", () => {
    expect(first.raporto.violations).toEqual([]);
    expect(first.exportable).toBe(true);
    expect(first.issues).toEqual([]);
    expect(first.raporto.summary.pairs.failed).toBe(0);
    expect(first.raporto.summary.pairs.passed).toBeGreaterThan(0);
  });

  it("has a form of its own (Spec 019 ①, G8): rounder, airier, bold icons", () => {
    const set = JSON.parse(first.files["sets/aspekto/provo.json"] ?? "{}");
    expect(tokenOf(set, "radius.medium")).toEqual({ value: 6, unit: "px" });
    expect(tokenOf(set, "spacing.scale.400")).toEqual({ value: 20, unit: "px" });
    const aspekto = JSON.parse(first.files["aspekto.json"] ?? "{}");
    expect(aspekto.ikonoj.style).toBe("bold");
    expect(aspekto.ikonoj.source).toContain("assets/bold");
    expect(first.files["ikonoj/check.svg"]).toContain('icon "check" (bold)');
  });

  it("equals the committed fixture aspekto-provo (regenerate with fm agordilo derive)", () => {
    // pnpm fm agordilo derive packages/modelo/test/fixtures/valid/aspekto-provo/agordo.json
    //   --out packages/modelo/test/fixtures/valid/aspekto-provo/aspekto-provo
    expect(filesOf(PROVO_PACKAGE)).toEqual(first.files);
  });
});

describe("deriveAspekto with the Agordo provo-kompakta (Spec 019 ①, G8)", () => {
  let derived: Derivation;
  beforeAll(() => {
    derived = deriveAspekto(agordoAt(KOMPAKTA_AGORDO), readStructure(), loadCalibration());
  });

  it("is sharp, dense, with smaller type and light icons — the counterpart of provo", () => {
    const set = JSON.parse(derived.files["sets/aspekto/provo-kompakta.json"] ?? "{}");
    expect(tokenOf(set, "radius.medium")).toEqual({ value: 1, unit: "px" });
    expect(tokenOf(set, "spacing.scale.400")).toEqual({ value: 12, unit: "px" });
    expect(tokenOf(set, "font.size.scale.300")).toEqual({ value: 14, unit: "px" });
    expect(JSON.parse(derived.files["aspekto.json"] ?? "{}").ikonoj.style).toBe("light");
  });

  it("passes every check; body text below 14 px is a hint, not a violation (G4)", () => {
    expect(derived.raporto.violations).toEqual([]);
    expect(derived.exportable).toBe(true);
    expect(derived.raporto.hints.map((hint) => hint.rule)).toContain("agordilo-body-size");
  });

  it("equals the committed fixture aspekto-provo-kompakta (regenerate with fm agordilo derive)", () => {
    // pnpm fm agordilo derive packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/agordo.json
    //   --out packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/aspekto-provo-kompakta
    expect(filesOf(KOMPAKTA_PACKAGE)).toEqual(derived.files);
  });
});
