// Per-step contrast targets (Spec 016 ②, G7 "Paletten-Ansicht"): the Werkstatt overrides a step
// only as a contrast target, never as a free colour value. An override is marked in the Agordo
// (`ziele`), in the derived step and in the Raporto, and the floors of kontrastSojloj still hold.

import { describe, expect, it } from "vitest";
import {
  derivePalettes,
  loadCalibration,
  readAgordo,
  readStructure,
  derivationBasis,
  deriveAspekto,
  type Agordo,
} from "./index.js";

const BASE = { name: "provo", leitfarbe: "#6b4fa0" };

function agordoOf(value: unknown): Agordo {
  const { agordo, issues } = readAgordo(value, "agordo.json");
  expect(issues).toEqual([]);
  if (agordo === undefined) throw new Error("the Agordo does not read");
  return agordo;
}

describe("ziele: a contrast target per step (②)", () => {
  const calibration = loadCalibration();
  const floors = { thresholds: [3, 4.5, 7], reserve: 0.05 };

  it("reads `ziele` keyed by palette.step with hell and dunkel, and refuses other keys at their path", () => {
    expect(agordoOf({ ...BASE, ziele: { "accent.700": { hell: 7.5 } } }).ziele).toEqual({
      "accent.700": { hell: 7.5 },
    });
    const bad = readAgordo({ ...BASE, ziele: { "brand.700": { hell: 7.5 } } }, "agordo.json");
    expect(bad.agordo).toBeUndefined();
    expect(bad.issues.map((issue) => issue.path)).toContain("agordo.json#/ziele/brand.700");
    const low = readAgordo({ ...BASE, ziele: { "accent.700": { hell: 0.5 } } }, "agordo.json");
    expect(low.agordo).toBeUndefined();
    expect(low.issues.map((issue) => issue.path)).toContain("agordo.json#/ziele/accent.700/hell");
  });

  it("a step takes its overridden target, is marked, and the other steps stay where they were", () => {
    const plain = derivePalettes(agordoOf(BASE), calibration, floors);
    const own = derivePalettes(
      agordoOf({ ...BASE, ziele: { "accent.700": { hell: 9 } } }),
      calibration,
      floors,
    );
    const step = own.steps.find((entry) => entry.palette === "accent" && entry.step === "700");
    const before = plain.steps.find((entry) => entry.palette === "accent" && entry.step === "700");
    expect(step?.target).toBeCloseTo(9, 6);
    expect(step?.overridden).toBe(true);
    expect(step?.hex).not.toBe(before?.hex);
    expect(before?.overridden).toBeUndefined();
    const others = (palettes: typeof own) =>
      palettes.steps
        .filter((entry) => !(entry.palette === "accent" && entry.step === "700"))
        .map((entry) => entry.hex);
    expect(others(own)).toEqual(others(plain));
  });

  it("the sliders leave an overridden target alone, but the floors of kontrastSojloj still hold", () => {
    const moved = derivePalettes(
      agordoOf({ ...BASE, regler: { helligkeit: 0.5 }, ziele: { "accent.700": { hell: 9 } } }),
      calibration,
      floors,
    );
    expect(
      moved.steps.find((entry) => entry.palette === "accent" && entry.step === "700")?.target,
    ).toBeCloseTo(9, 6);
    // accent.700 reaches 4.5:1 in komuna's calibration: an override cannot push it below the
    // threshold with its reserve.
    const floored = derivePalettes(
      agordoOf({ ...BASE, ziele: { "accent.700": { hell: 2 } } }),
      calibration,
      floors,
    );
    const step = floored.steps.find((entry) => entry.palette === "accent" && entry.step === "700");
    expect(step?.target).toBeGreaterThanOrEqual(4.5 * 1.05 - 1e-9);
    expect(step?.overridden).toBe(true);
  });

  it("the Raporto marks the overridden step and explains a violation it causes as an override, with a patch that resets it", () => {
    const structure = readStructure();
    // neutral.25 is the raised surface: a target close to the page makes surface-distinct fail.
    const agordo = agordoOf({ ...BASE, ziele: { "neutral.25": { hell: 1.01 } } });
    const derivation = deriveAspekto(agordo, structure, calibration);
    const row = derivation.raporto.palettes.find(
      (entry) => entry.token === "color.palette.neutral.25" && entry.mode === "light",
    );
    expect(row?.overridden).toBe(true);
    const violation = derivation.raporto.violations.find((entry) => entry.rule === "surface-distinct");
    expect(violation).toBeDefined();
    expect(violation?.cause).toMatch(/overrid/i);
    expect(violation?.apply).toEqual({ ziele: { "neutral.25": null } });
    // A plain derivation marks nothing (the fixture of provo stays byte-identical).
    const plain = derivationBasis(agordoOf(BASE), structure, calibration);
    expect(plain.palettes.steps.every((step) => step.overridden === undefined)).toBe(true);
  }, 120_000);
});
