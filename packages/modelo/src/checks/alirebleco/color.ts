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

/**
 * OKLCH lightness (0…1) of a colour as seen: a translucent colour is first composited over
 * `backdrop` (Spec 002, D-04), as the contrast check does. Without a backdrop it is measured as is.
 */
export function oklchLightness(color: ColorValue, backdrop?: ColorValue): number {
  const seen =
    backdrop !== undefined && alphaOf(color) < 1 ? compositeOver(color, backdrop) : color;
  return Number(toColorjs(seen).to("oklch").coords[0] ?? 0);
}

/**
 * The surface ladder of a page, deepest first. A component without a surface of its own may sit on
 * any of them, so a translucent value is measured on each (Spec 004, maintainer's review of
 * 2026-09-20). Not part of it: `color.background.inverse`, which carries its own text roles.
 */
export const SURFACE_LADDER = [
  "color.background.sunken",
  "color.background.canvas",
  "color.background.default",
  "color.background.raised",
] as const;

export interface BackdropSurface {
  /** The token name, so a finding can say which surface decided the result. */
  name: string;
  color: ColorValue;
}

/**
 * The surfaces a translucent background is measured on: the ones its KontrastParo names, or the
 * opaque steps of the ladder. An opaque background needs none and gets none. Named surfaces that
 * are themselves translucent come back in `translucent`; the caller reports them.
 */
export function backdropSurfaces(
  background: ColorValue,
  named: readonly string[] | undefined,
  colorOf: (name: string) => ColorValue | undefined,
): { surfaces: BackdropSurface[]; translucent: string[] } {
  if (alphaOf(background) >= 1) return { surfaces: [], translucent: [] };
  const surfaces: BackdropSurface[] = [];
  const translucent: string[] = [];
  for (const name of named ?? SURFACE_LADDER) {
    const color = colorOf(name);
    if (color === undefined) continue;
    if (alphaOf(color) < 1) {
      translucent.push(name);
      continue;
    }
    surfaces.push({ name, color });
  }
  return { surfaces, translucent };
}

/** The colour of a translucent value on one surface; an opaque value is returned unchanged. */
export function onBackdrop(background: ColorValue, backdrop: ColorValue | undefined): ColorValue {
  if (alphaOf(background) >= 1 || backdrop === undefined || alphaOf(backdrop) < 1)
    return background;
  return compositeOver(background, backdrop);
}
