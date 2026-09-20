// The ten metrics behind the Reguloj and Aspiroj of Spec 004 (T002, plan D-12, data-model §3).
// Every case is an invented value: the metrics are pure and must not need the repository Modelo.

import { describe, expect, it } from "vitest";
import type { ColorValue } from "../generated/modelo-schema.js";
import {
  oklchLAlign,
  oklchLDelta,
  oklchLExtreme,
  oklchLStep,
  oklchLStepConsistency,
  srgbGamut,
  typeRhythm,
  typeScaleConsistency,
  typeScaleRatio,
  wcag2Reserve,
} from "./index.js";

/** A grey of the given OKLCH-ish lightness, built from sRGB components. */
const grey = (component: number, alpha?: number): ColorValue => ({
  colorSpace: "srgb",
  components: [component, component, component],
  ...(alpha === undefined ? {} : { alpha }),
});

const ramp = (steps: readonly [number, number][], alpha?: number) =>
  steps.map(([step, component]) => ({ step, value: grey(component, alpha) }));

describe("wcag2-reserve", () => {
  it("is the share above the threshold, negative when the threshold is missed", () => {
    expect(wcag2Reserve(7.25, 7)).toBeCloseTo(0.0357, 4);
    expect(wcag2Reserve(4.5, 4.5)).toBe(0);
    expect(wcag2Reserve(3, 4.5)).toBeCloseTo(-0.3333, 4);
  });
});

describe("oklch-l-delta and oklch-l-extreme", () => {
  it("measures the distance between two lightnesses, in either order", () => {
    const a = grey(1);
    const b = grey(0);
    expect(oklchLDelta(a, b)).toBeCloseTo(1, 3);
    expect(oklchLDelta(b, a)).toBeCloseTo(1, 3);
    expect(oklchLDelta(a, a)).toBe(0);
  });

  it("measures the distance to the nearer anchor", () => {
    expect(oklchLExtreme(grey(1))).toBeCloseTo(0, 3);
    expect(oklchLExtreme(grey(0))).toBeCloseTo(0, 3);
    expect(oklchLExtreme(grey(0.5))).toBeGreaterThan(0.2);
  });
});

describe("oklch-l-step", () => {
  it("returns the steps of a ramp, normalized per 100 step units", () => {
    const steps = oklchLStep(
      ramp([
        [100, 1],
        [200, 0.5],
        [400, 0],
      ]),
    );
    expect(steps).toHaveLength(2);
    expect(steps[0]?.from).toBe(100);
    expect(steps[0]?.to).toBe(200);
    expect(steps[0]?.perHundred).toBeCloseTo(steps[0]?.delta ?? 0, 6);
    // 200 → 400 is two step units wide, so its rate is half its raw delta.
    expect(steps[1]?.perHundred).toBeCloseTo((steps[1]?.delta ?? 0) / 2, 6);
  });

  it("reports a ramp that is not strictly monotone", () => {
    const steps = oklchLStep(
      ramp([
        [100, 1],
        [200, 0.2],
        [300, 0.6],
      ]),
    );
    expect(steps.map((step) => step.delta > 0)).toEqual([true, false]);
  });
});

describe("oklch-l-step-consistency", () => {
  const even = ramp([
    [50, 0.98],
    [100, 0.86],
    [200, 0.72],
    [300, 0.58],
    [400, 0.44],
    [500, 0.3],
  ]);

  it("measures the inner steps against their median and names the edges", () => {
    const result = oklchLStepConsistency(even);
    expect(result.edges).toEqual([
      { from: 50, to: 100 },
      { from: 400, to: 500 },
    ]);
    expect(result.worst).toBeLessThan(0.1);
  });

  it("ignores a finer edge step but reports a jump in the middle", () => {
    // The first step is much smaller than the rest: an edge, not a finding.
    const fineEdge = ramp([
      [50, 0.99],
      [100, 0.86],
      [200, 0.72],
      [300, 0.58],
      [400, 0.44],
      [500, 0.3],
    ]);
    expect(oklchLStepConsistency(fineEdge).worst).toBeLessThan(0.5);
    // An inner step with roughly twice the median distance is a finding.
    const jump = ramp([
      [50, 0.98],
      [100, 0.86],
      [200, 0.58],
      [300, 0.44],
      [400, 0.3],
      [500, 0.16],
    ]);
    const result = oklchLStepConsistency(jump);
    expect(result.worst).toBeGreaterThan(0.5);
    expect(result.at).toEqual({ from: 100, to: 200 });
  });

  it("has no finding when a ramp is too short for an inner step", () => {
    expect(
      oklchLStepConsistency(
        ramp([
          [100, 1],
          [200, 0.5],
        ]),
      ).worst,
    ).toBe(0);
  });
});

describe("oklch-l-align", () => {
  it("returns the spread per step number across ramps", () => {
    const spread = oklchLAlign({
      a: ramp([
        [100, 0.9],
        [200, 0.5],
      ]),
      b: ramp([
        [100, 0.9],
        [200, 0.2],
      ]),
    });
    expect(spread.find((entry) => entry.step === 100)?.spread).toBeCloseTo(0, 6);
    expect(spread.find((entry) => entry.step === 200)?.spread).toBeGreaterThan(0.2);
  });
});

describe("srgb-gamut", () => {
  it("accepts components inside 0…1 and reports the worst excess", () => {
    expect(srgbGamut(grey(0.5))).toEqual({ inside: true, worst: 0 });
    const outside = srgbGamut({ colorSpace: "srgb", components: [1.04, 0.5, -0.02] });
    expect(outside.inside).toBe(false);
    expect(outside.worst).toBeCloseTo(0.04, 6);
  });
});

describe("type-scale-ratio and type-scale-consistency", () => {
  it("returns the ratios of neighbouring sizes", () => {
    expect(typeScaleRatio([12, 14, 16])).toEqual([14 / 12, 16 / 14]);
  });

  it("measures the largest relative deviation from the median ratio", () => {
    const constant = typeScaleConsistency([10, 12, 14.4, 17.28]);
    expect(constant.median).toBeCloseTo(1.2, 6);
    expect(constant.worst).toBeCloseTo(0, 6);
    // One step of 1.6 next to steps of 1.2 is a jump of a third.
    const jump = typeScaleConsistency([10, 12, 19.2, 23.04, 27.65]);
    expect(jump.worst).toBeGreaterThan(0.3);
    expect(jump.at).toBe(1);
  });
});

describe("type-rhythm", () => {
  it("accepts line height and tracking that fall as the size grows", () => {
    const result = typeRhythm([
      { size: 12, lineHeight: 1.5, tracking: 0 },
      { size: 24, lineHeight: 1.25, tracking: -0.4 },
      { size: 48, lineHeight: 1.1, tracking: -1 },
    ]);
    expect(result).toEqual({ monotone: true, breaks: [] });
  });

  it("reports a line height that grows with the size", () => {
    const result = typeRhythm([
      { size: 12, lineHeight: 1.25, tracking: 0 },
      { size: 24, lineHeight: 1.5, tracking: 0 },
    ]);
    expect(result.monotone).toBe(false);
    expect(result.breaks).toEqual([{ field: "lineHeight", from: 12, to: 24 }]);
  });
});
