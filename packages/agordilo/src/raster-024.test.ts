// Spec 024, decision O-1 (plan ①, Raster-Vorschlag): the calibration measures the four new steps
// of the five coloured palettes on komuna, and the derivation writes 15 steps per coloured palette
// for every brand — the steps a brand does not use are assigned by the derivation (§ 3 B).

import { describe, expect, it } from "vitest";
import { derivationBasis, loadCalibration, PALETTES, readStructure } from "./index.js";

const COLOURED = PALETTES.filter((palette) => palette !== "neutral");
const NEW_STEPS = ["25", "150", "850", "975"];

describe("O-1: calibration and derivation with the finer grid (Spec 024)", () => {
  const calibration = loadCalibration();

  it("the calibration carries a target per new step of every coloured palette, between its neighbours", () => {
    for (const palette of COLOURED) {
      const steps = calibration.palettes[palette].steps;
      for (const step of NEW_STEPS) expect(steps[step], `${palette}.${step}`).toBeDefined();
      const light = (step: string) => steps[step]?.light ?? Number.NaN;
      expect(light("25")).toBeGreaterThan(1);
      expect(light("25")).toBeLessThan(light("50"));
      expect(light("150")).toBeGreaterThan(light("100"));
      expect(light("150")).toBeLessThan(light("200"));
      expect(light("850")).toBeGreaterThan(light("800"));
      expect(light("850")).toBeLessThan(light("900"));
      expect(light("975")).toBeGreaterThan(light("950"));
      expect(light("975")).toBeLessThan(21);
    }
  });

  it("derives 15 steps per coloured palette for a brand that names none of them", () => {
    const basis = derivationBasis(
      { name: "provo", leitfarbe: "#6b4fa0" },
      readStructure(),
      calibration,
    );
    for (const palette of COLOURED) {
      const steps = basis.palettes.steps
        .filter((step) => step.palette === palette)
        .map((step) => step.step);
      expect(steps, palette).toHaveLength(15);
      for (const step of NEW_STEPS) expect(steps, `${palette}.${step}`).toContain(step);
    }
  });
});
