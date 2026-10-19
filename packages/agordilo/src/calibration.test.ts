// The calibration (Spec 016 G3): the contrast target of every palette step is measured once on
// komuna against the reference surface of its mode (light: neutral.0, dark: neutral.1000) and kept
// as a file in the package. The file is a measurement, never an inheritance: it must equal what
// measuring komuna gives today.

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  CALIBRATION_URL,
  loadCalibration,
  measureCalibration,
  readStructure,
  serializeCalibration,
} from "./index.js";

const PALETTES = ["accent", "danger", "info", "neutral", "success", "warning"];

describe("calibration from komuna (G3)", () => {
  it("lies in the package as data/calibration.json", () => {
    expect(fileURLToPath(CALIBRATION_URL)).toMatch(/agordilo[/\\]data[/\\]calibration\.json$/);
    expect(existsSync(CALIBRATION_URL)).toBe(true);
  });

  it("equals the measurement of komuna byte for byte", () => {
    const measured = serializeCalibration(measureCalibration(readStructure()));
    expect(readFileSync(CALIBRATION_URL, "utf8")).toBe(measured);
  });

  it("names the six palettes, their steps and both reference surfaces", () => {
    const calibration = loadCalibration();
    expect(Object.keys(calibration.palettes).sort()).toEqual(PALETTES);
    expect(calibration.surfaces).toEqual({
      light: "color.palette.neutral.0",
      dark: "color.palette.neutral.1000",
    });
    const accent = calibration.palettes.accent;
    expect(accent?.ref).toBe("700");
    const step700 = accent?.steps["700"];
    // accent.700 of komuna is #375479: about 7.76:1 on white, about 2.71:1 on black.
    expect(step700?.light).toBeCloseTo(7.76, 1);
    expect(step700?.dark).toBeCloseTo(2.71, 1);
    expect(step700?.chroma).toBe(1);
  });
});
