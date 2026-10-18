// The building blocks of the derivation (Spec 016 G3, G4, plan ① D-03–D-07): the version a package
// names, deterministic IDs, one step in OKLCH with gamut mapping by chroma and the tone first, and
// the sliders that never push a step under a threshold.

import { readFileSync } from "node:fs";
import { inSrgbGamut, oklchComponentsOf } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import {
  AGORDILO_VERSION,
  derivedIdGenerator,
  hueDifference,
  MAX_CONTRAST,
  maxChroma,
  namespaceOf,
  solveStep,
  TONE_KEEP,
  transformTarget,
  WHITE,
} from "./index.js";

const FLOORS = { thresholds: [3, 4.5, 7], reserve: 0.05 };

describe("version and IDs", () => {
  it("names the version of @fundamento/agordilo", () => {
    const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    expect(AGORDILO_VERSION).toBe(manifest.version);
  });

  it("mints the same IDs for the same name, in the package's own namespace", () => {
    const first = derivedIdGenerator("provo");
    const second = derivedIdGenerator("provo");
    const ids = [first("dimensioValoro"), first("tokenSet"), first("jugxo")];
    expect([second("dimensioValoro"), second("tokenSet"), second("jugxo")]).toEqual(ids);
    expect(ids[0]).toMatch(/^dva_provo_[0-9A-Z]{26}$/);
    expect(new Set(ids).size).toBe(3);
    expect(derivedIdGenerator("alia")("dimensioValoro")).not.toBe(ids[0]);
  });

  it.each([
    ["provo", "provo"],
    ["marko-2", "marko"],
    ["a1", "aag"],
    ["tre-longa-nomo", "trelonga"],
  ])("derives the namespace of %s as %s", (name, namespace) => {
    expect(namespaceOf(name)).toBe(namespace);
  });
});

describe("one step in OKLCH (solveStep)", () => {
  it("meets a contrast target against white at a reachable tone", () => {
    const step = solveStep({ target: 7.7629, surface: WHITE, chroma: 0.07, hue: 255 });
    expect(step.onTarget).toBe(true);
    expect(step.toneKept).toBe(true);
    expect(step.achieved).toBeCloseTo(7.76, 1);
    expect(inSrgbGamut(step.components)).toBe(true);
  });

  it("maps into sRGB by reducing chroma, never by clipping a channel", () => {
    const step = solveStep({ target: 5.5, surface: WHITE, chroma: 0.2, hue: 145 });
    expect(step.c).toBeLessThan(0.2);
    expect(step.c).toBeCloseTo(maxChroma(step.l, 145, 0.2), 6);
    const [, chroma, hue] = oklchComponentsOf({ colorSpace: "srgb", components: step.components });
    expect(chroma).toBeCloseTo(step.c, 2);
    expect(hueDifference(hue, 145)).toBeCloseTo(0, 0);
  });

  it("keeps the tone of a light yellow and misses the target of a dark step instead (G6)", () => {
    const step = solveStep({ target: 14.6, surface: WHITE, chroma: 0.15, hue: 90 });
    expect(step.toneKept).toBe(true);
    expect(step.onTarget).toBe(false);
    expect(step.c).toBeGreaterThanOrEqual(0.15 * TONE_KEEP - 1e-6);
    expect(step.achieved).toBeLessThan(14.6);
  });
});

describe("the sliders (transformTarget)", () => {
  it("leave the anchors and an untouched Agordo alone", () => {
    expect(transformTarget(1, { helligkeit: 1, kontrast: 1 }, FLOORS)).toBe(1);
    expect(transformTarget(MAX_CONTRAST, { helligkeit: -1 }, FLOORS)).toBe(MAX_CONTRAST);
    expect(transformTarget(5.5, {}, FLOORS)).toBe(5.5);
  });

  it("move lighter and darker, spread and squeeze", () => {
    expect(transformTarget(5.5, { helligkeit: 0.5 }, FLOORS)).toBeLessThan(5.5);
    expect(transformTarget(1.5, { helligkeit: -0.5 }, FLOORS)).toBeGreaterThan(1.5);
    expect(transformTarget(10.87, { kontrast: 0.5 }, FLOORS)).toBeGreaterThan(10.87);
    expect(transformTarget(1.86, { kontrast: 0.5 }, FLOORS)).toBeLessThan(1.86);
  });

  it("never push a step under a threshold of kontrastSojloj it reached (with the reserve)", () => {
    const violations: string[] = [];
    for (const target of [3.2, 4.8, 5.5, 7.76, 10.87, 14.6]) {
      for (const helligkeit of [-1, -0.5, 0, 0.5, 1]) {
        for (const kontrast of [-1, 0, 1]) {
          const moved = transformTarget(target, { helligkeit, kontrast }, FLOORS);
          for (const threshold of FLOORS.thresholds) {
            const floor = Math.min(target, threshold * 1.05);
            if (target >= threshold && moved < floor - 1e-9) {
              violations.push(`${target} h${helligkeit} k${kontrast}: ${moved} < ${floor}`);
            }
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
