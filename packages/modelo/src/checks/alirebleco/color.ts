// DTCG color values (DTCG 2025.10 `color`) as input to the contrast metrics: shape check, color
// space mapping to colorjs.io, sRGB conversion and alpha compositing. Pure.

import Color from "colorjs.io";
import type { ColorSpace, ColorValue } from "../../generated/modelo-schema.js";

/**
 * DTCG color space name -> colorjs.io space ID, for every space the Modelo schema allows
 * (`#/$defs/ColorSpace`). Component ranges agree between the two (e.g. `hsl` s/l in 0..100,
 * `oklch` L in 0..1), so components are passed through unchanged.
 */
export const COLORJS_SPACE_OF: Readonly<Record<ColorSpace, string>> = {
  srgb: "srgb",
  "srgb-linear": "srgb-linear",
  hsl: "hsl",
  hwb: "hwb",
  lab: "lab",
  lch: "lch",
  oklab: "oklab",
  oklch: "oklch",
  "display-p3": "p3",
  "a98-rgb": "a98rgb",
  "prophoto-rgb": "prophoto",
  rec2020: "rec2020",
  "xyz-d65": "xyz-d65",
  "xyz-d50": "xyz-d50",
};

function isColorSpace(value: unknown): value is ColorSpace {
  return typeof value === "string" && Object.hasOwn(COLORJS_SPACE_OF, value);
}

function isComponent(value: unknown): value is number | "none" {
  return value === "none" || (typeof value === "number" && Number.isFinite(value));
}

/**
 * The value as a DTCG color, or `undefined` if it is not one: a known color space, exactly three
 * numeric or `"none"` components, and an optional alpha in 0..1. Aliases must already be inlined.
 */
export function readDtcgColor(value: unknown): ColorValue | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }
  const { colorSpace, components, alpha } = value as Record<string, unknown>;
  if (!isColorSpace(colorSpace) || !Array.isArray(components) || components.length !== 3) {
    return undefined;
  }
  if (!components.every(isComponent)) {
    return undefined;
  }
  if (alpha !== undefined && (typeof alpha !== "number" || !(alpha >= 0 && alpha <= 1))) {
    return undefined;
  }
  const color: ColorValue = { colorSpace, components: [...components] };
  if (alpha !== undefined) {
    color.alpha = alpha;
  }
  return color;
}

/** Alpha of a DTCG color; absent means opaque. */
export function alphaOf(color: ColorValue): number {
  return color.alpha ?? 1;
}

/** Components with `"none"` taken as 0 (CSS Color 4: a missing component behaves as zero). */
function coordsOf(color: ColorValue): [number, number, number] {
  const [a, b, c] = color.components.map((component) => (component === "none" ? 0 : component));
  return [a ?? 0, b ?? 0, c ?? 0];
}

/** A colorjs.io color for the DTCG value (alpha included). */
export function toColorjs(color: ColorValue): Color {
  return new Color(COLORJS_SPACE_OF[color.colorSpace], coordsOf(color), alphaOf(color));
}

/** Gamma-encoded sRGB components (not gamut-mapped), `"none"` taken as 0. */
export function srgbComponentsOf(color: ColorValue): [number, number, number] {
  if (color.colorSpace === "srgb") {
    return coordsOf(color);
  }
  const [r, g, b] = toColorjs(color).to("srgb").coords;
  return [Number(r ?? 0), Number(g ?? 0), Number(b ?? 0)];
}

/**
 * Porter-Duff source-over of `foreground` on `background` in gamma-encoded sRGB, the space
 * browsers composite in. The result is an sRGB color; it is opaque when the background is.
 */
export function compositeOver(foreground: ColorValue, background: ColorValue): ColorValue {
  const fgAlpha = alphaOf(foreground);
  const bgAlpha = alphaOf(background);
  const outAlpha = fgAlpha + bgAlpha * (1 - fgAlpha);
  const fg = srgbComponentsOf(foreground);
  const bg = srgbComponentsOf(background);
  const components = fg.map((channel, index) =>
    outAlpha === 0
      ? 0
      : (channel * fgAlpha + (bg[index] ?? 0) * bgAlpha * (1 - fgAlpha)) / outAlpha,
  );
  const result: ColorValue = { colorSpace: "srgb", components };
  if (outAlpha < 1) {
    result.alpha = outAlpha;
  }
  return result;
}
