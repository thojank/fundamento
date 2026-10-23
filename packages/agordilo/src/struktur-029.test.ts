// Spec 029 ①: komuna takes the values of the Fonto; the Agordilo keeps deriving over the structure
// of komuna 0.2, rebuilt from the package komuna-0-2 — the structure every derived brand names as
// its origin (aspekto.json, agordilo.structure.sha256) and the calibration was measured on. The
// rebuilt structure is the same document, byte for byte in canonical JSON: the same fingerprint.

import { readFileSync } from "node:fs";
import { CORE_SET_NAME } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { readStructure, referencePackage } from "./index.js";

const storedSha = (fixture: string): string =>
  JSON.parse(
    readFileSync(
      new URL(`../../modelo/test/fixtures/valid/${fixture}/aspekto.json`, import.meta.url),
      "utf8",
    ),
  ).agordilo.structure.sha256;

const accent700 = (structure: ReturnType<typeof readStructure>): string | undefined => {
  const core = structure.files.sets.find((set) => set.name === CORE_SET_NAME)?.value as
    | { color: { palette: { accent: Record<string, { $value: { hex: string } }> } } }
    | undefined;
  return core?.color.palette.accent["700"]?.$value.hex;
};

describe("Spec 029 ①: the structure of komuna 0.2 for the Agordilo", () => {
  it("is rebuilt from komuna-0-2 with the fingerprint the derived brands name", () => {
    const structure = readStructure();
    expect(structure.fingerprint).toBe(storedSha("aspekto-provo/aspekto-provo"));
    expect(structure.fingerprint).toBe(storedSha("aspekto-provo-kompakta/aspekto-provo-kompakta"));
    expect(structure.fingerprint).toBe(
      "554efc71d758d8147e8b63c17a9eba094fae50633007826afc0bb1cfa2ea36e7",
    );
  });

  it("carries komuna 0.2: its name, its lead colour and its dark set", () => {
    const structure = readStructure();
    const reference = referencePackage(structure).aspekto.value as { name: string };
    expect(reference.name).toBe("komuna");
    expect(accent700(structure)).toBe("#375479");
    expect(
      structure.files.sets
        .filter((set) => set.package !== undefined)
        .map((set) => set.name)
        .sort(),
    ).toEqual(["aspekto/komuna", "aspekto/komuna+color-scheme/dark"]);
  });

  it("the structure of today's komuna is still readable, as a structure of its own", () => {
    const today = readStructure("komuna");
    expect(today.fingerprint).not.toBe(readStructure().fingerprint);
    expect(accent700(today)).toBe("#474747");
  });
});
