import { describe, expect, it } from "vitest";
import type { ColorValue } from "../../generated/modelo-schema.js";
import {
  alphaOf,
  COLORJS_SPACE_OF,
  compositeOver,
  readDtcgColor,
  srgbComponentsOf,
} from "./color.js";
import { APCA_METRIC, CONTRAST_METRICS, WCAG2_METRIC } from "./metrics.js";

const srgb = (r: number, g: number, b: number, alpha?: number): ColorValue =>
  alpha === undefined
    ? { colorSpace: "srgb", components: [r, g, b] }
    : { colorSpace: "srgb", components: [r, g, b], alpha };

const white = srgb(1, 1, 1);
const black = srgb(0, 0, 0);

describe("wcag2 metric", () => {
  it("rates black on white (and white on black) 21:1", () => {
    expect(WCAG2_METRIC.compute(black, white)).toBeCloseTo(21, 10);
    expect(WCAG2_METRIC.compute(white, black)).toBeCloseTo(21, 10);
  });

  it("rates identical colors 1:1", () => {
    expect(WCAG2_METRIC.compute(white, white)).toBeCloseTo(1, 10);
    const grey = srgb(0.5, 0.5, 0.5);
    expect(WCAG2_METRIC.compute(grey, grey)).toBeCloseTo(1, 10);
  });

  it("rates #777777 on white at the well-known 4.48:1", () => {
    const grey = srgb(0x77 / 255, 0x77 / 255, 0x77 / 255);
    expect(WCAG2_METRIC.compute(grey, white)).toBeCloseTo(4.48, 2);
  });

  it("passes at or above the threshold only", () => {
    expect(WCAG2_METRIC.passes(4.5, 4.5)).toBe(true);
    expect(WCAG2_METRIC.passes(4.49, 4.5)).toBe(false);
    expect(WCAG2_METRIC.passes(21, 7)).toBe(true);
  });

  it("converts non-sRGB spaces before measuring", () => {
    const oklchWhite: ColorValue = { colorSpace: "oklch", components: [1, 0, 0] };
    const labBlack: ColorValue = { colorSpace: "lab", components: [0, 0, 0] };
    expect(WCAG2_METRIC.compute(labBlack, oklchWhite)).toBeCloseTo(21, 2);
    const hslWhite: ColorValue = { colorSpace: "hsl", components: ["none", 0, 100] };
    expect(WCAG2_METRIC.compute(black, hslWhite)).toBeCloseTo(21, 6);
  });
});

describe("apca metric", () => {
  it("gives a large polarity-free Lc for black on white", () => {
    const lc = APCA_METRIC.compute(black, white);
    expect(lc).toBeGreaterThan(100);
    expect(lc).toBeLessThan(110);
    expect(APCA_METRIC.compute(white, black)).toBeGreaterThan(100);
  });

  it("gives Lc 0 for identical colors", () => {
    expect(APCA_METRIC.compute(white, white)).toBeCloseTo(0, 6);
  });

  it("compares the absolute Lc against the threshold", () => {
    expect(APCA_METRIC.passes(-90, 75)).toBe(true);
    expect(APCA_METRIC.passes(74.9, 75)).toBe(false);
  });

  it("is one of the registered strategies, after the binding wcag2", () => {
    expect(CONTRAST_METRICS.map((metric) => metric.id)).toEqual(["wcag2", "apca"]);
  });
});

describe("DTCG colors", () => {
  it("maps every schema color space to a colorjs space", () => {
    expect(Object.keys(COLORJS_SPACE_OF).sort()).toEqual(
      [
        "a98-rgb",
        "display-p3",
        "hsl",
        "hwb",
        "lab",
        "lch",
        "oklab",
        "oklch",
        "prophoto-rgb",
        "rec2020",
        "srgb",
        "srgb-linear",
        "xyz-d50",
        "xyz-d65",
      ].sort(),
    );
    expect(COLORJS_SPACE_OF["display-p3"]).toBe("p3");
    expect(COLORJS_SPACE_OF["a98-rgb"]).toBe("a98rgb");
    expect(COLORJS_SPACE_OF["prophoto-rgb"]).toBe("prophoto");
  });

  it("reads valid color values and rejects everything else", () => {
    expect(readDtcgColor(white)).toEqual(white);
    expect(readDtcgColor({ colorSpace: "cmyk", components: [0, 0, 0] })).toBeUndefined();
    expect(readDtcgColor({ colorSpace: "srgb", components: [0, 0] })).toBeUndefined();
    expect(readDtcgColor({ colorSpace: "srgb", components: [0, 0, "x"] })).toBeUndefined();
    expect(readDtcgColor({ colorSpace: "srgb", components: [0, 0, 0], alpha: 2 })).toBeUndefined();
    expect(readDtcgColor({ value: 4, unit: "px" })).toBeUndefined();
    expect(readDtcgColor("{color.x}")).toBeUndefined();
  });

  it("treats a missing alpha as opaque", () => {
    expect(alphaOf(white)).toBe(1);
    expect(alphaOf(srgb(0, 0, 0, 0.25))).toBe(0.25);
  });

  it("treats 'none' components as 0", () => {
    expect(srgbComponentsOf({ colorSpace: "srgb", components: ["none", 1, "none"] })).toEqual([
      0, 1, 0,
    ]);
  });
});

describe("alpha compositing", () => {
  it("composites 50% black over white to mid sRGB grey", () => {
    const result = compositeOver(srgb(0, 0, 0, 0.5), white);
    expect(result.colorSpace).toBe("srgb");
    expect(alphaOf(result)).toBe(1);
    for (const component of srgbComponentsOf(result)) {
      expect(component).toBeCloseTo(0.5, 10);
    }
  });

  it("leaves an opaque foreground unchanged and a fully transparent one invisible", () => {
    expect(srgbComponentsOf(compositeOver(srgb(0.2, 0.4, 0.6), white))).toEqual([0.2, 0.4, 0.6]);
    const invisible = compositeOver(srgb(0, 0, 0, 0), srgb(0.3, 0.3, 0.3));
    expect(WCAG2_METRIC.compute(invisible, srgb(0.3, 0.3, 0.3))).toBeCloseTo(1, 10);
  });

  it("lowers the contrast of a translucent foreground", () => {
    const composited = compositeOver(srgb(0, 0, 0, 0.5), white);
    const ratio = WCAG2_METRIC.compute(composited, white);
    expect(ratio).toBeGreaterThan(3.9);
    expect(ratio).toBeLessThan(4.0);
  });

  it("composites across color spaces in sRGB", () => {
    const fg: ColorValue = { colorSpace: "oklch", components: [0, 0, "none"], alpha: 0.5 };
    const [r, g, b] = srgbComponentsOf(compositeOver(fg, white));
    expect(r).toBeCloseTo(0.5, 6);
    expect(g).toBeCloseTo(0.5, 6);
    expect(b).toBeCloseTo(0.5, 6);
  });
});
