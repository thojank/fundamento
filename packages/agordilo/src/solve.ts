// One palette step in OKLCH (Spec 016, G3, G6): the lightness L that meets the contrast target
// against the reference surface, at the hue H and the chroma C the step asks for. Gamut mapping
// reduces C, it never clips a channel. The tone comes first: a step keeps at least TONE_KEEP of
// its chroma; where that is impossible at its target, it moves its lightness instead and misses
// the target — and the report says so (no guessing, W-17). Contrast and conversions are the ones
// of the Modelo checks (one colour mathematics, Art. XI). Pure.

import {
  type ColorValue,
  inSrgbGamut,
  oklchColor,
  srgbComponentsOf,
  WCAG2_METRIC,
} from "@fundamento/modelo";

/**
 * The share of its chroma a step keeps at least. Below it the step has lost its tone: a light
 * yellow at the lightness of a text step is no longer yellow but olive. Two fifths is the line the
 * Agordilo draws (plan ① D-05, O-4: measured against half, which turned light yellow and cyan into
 * violations of fixed rules).
 */
export const TONE_KEEP = 0.4;

/** Bisection depth: 2^-32 of the lightness range, 2^-24 of a chroma range. */
const L_ITERATIONS = 32;
const C_ITERATIONS = 24;

export const WHITE: ColorValue = { colorSpace: "srgb", components: [1, 1, 1] };
export const BLACK: ColorValue = { colorSpace: "srgb", components: [0, 0, 0] };

export interface StepRequest {
  /** WCAG 2.x contrast the step should have against `surface`. */
  target: number;
  /** The reference surface of the mode: white (neutral.0) or black (neutral.1000). */
  surface: ColorValue;
  /** The chroma the step asks for (source chroma × calibration × saettigung). */
  chroma: number;
  /** OKLCH hue in degrees. */
  hue: number;
}

export interface StepSolution {
  /** OKLCH of the written value (before rounding to sRGB). */
  l: number;
  c: number;
  h: number;
  /** Gamma-encoded sRGB, inside 0…1, four decimals: the written value. */
  components: [number, number, number];
  /** Contrast of the written value against the surface. */
  achieved: number;
  /** The step meets its target (within rounding). */
  onTarget: boolean;
  /** The step keeps at least TONE_KEEP of the chroma it asks for. */
  toneKept: boolean;
}

/** The largest chroma ≤ `wanted` inside sRGB at lightness `l` and hue `h`. */
export function maxChroma(l: number, h: number, wanted: number): number {
  if (wanted <= 0) return 0;
  if (inSrgbGamut(srgbComponentsOf(oklchColor(l, wanted, h)))) return wanted;
  let low = 0;
  let high = wanted;
  for (let index = 0; index < C_ITERATIONS; index++) {
    const middle = (low + high) / 2;
    if (inSrgbGamut(srgbComponentsOf(oklchColor(l, middle, h)))) low = middle;
    else high = middle;
  }
  return low;
}

const round4 = (value: number): number => Math.round(value * 10_000) / 10_000;

/** The written sRGB value of an OKLCH colour inside the gamut. */
export function writtenComponents(l: number, c: number, h: number): [number, number, number] {
  const [r = 0, g = 0, b = 0] = srgbComponentsOf(oklchColor(l, c, h)).map((channel) =>
    round4(Math.min(1, Math.max(0, channel))),
  );
  return [r, g, b];
}

function contrastAt(l: number, c: number, h: number, surface: ColorValue): number {
  return WCAG2_METRIC.compute(
    { colorSpace: "srgb", components: srgbComponentsOf(oklchColor(l, c, h)) },
    surface,
  );
}

/** Whether contrast against `surface` falls as L rises (true on a light surface). */
function fallsWithLightness(surface: ColorValue): boolean {
  return WCAG2_METRIC.compute(BLACK, surface) > WCAG2_METRIC.compute(WHITE, surface);
}

/** The lightness at which the gamut-mapped step meets `target` (bisection over 0…1). */
function lightnessForTarget(request: StepRequest): number {
  const falls = fallsWithLightness(request.surface);
  let low = 0;
  let high = 1;
  for (let index = 0; index < L_ITERATIONS; index++) {
    const middle = (low + high) / 2;
    const chroma = maxChroma(middle, request.hue, request.chroma);
    const contrast = contrastAt(middle, chroma, request.hue, request.surface);
    // On a light surface contrast falls with L: too much contrast means go lighter.
    if (contrast > request.target === falls) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

/** The lightness of the most colourful point of a hue (the cusp of the sRGB gamut). */
function cuspLightness(h: number, wanted: number): number {
  let low = 0;
  let high = 1;
  for (let index = 0; index < L_ITERATIONS; index++) {
    const a = low + (high - low) / 3;
    const b = high - (high - low) / 3;
    if (maxChroma(a, h, wanted) < maxChroma(b, h, wanted)) low = a;
    else high = b;
  }
  return (low + high) / 2;
}

/**
 * Solves one step. On target when the gamut leaves it TONE_KEEP of its chroma; otherwise the
 * lightness moves from the target towards the cusp of the hue until the kept chroma fits. If even
 * the cusp cannot hold it, the hue cannot carry that tone at all: the step meets its target and is
 * marked as having lost its tone.
 */
export function solveStep(request: StepRequest): StepSolution {
  const { hue, surface } = request;
  const keep = request.chroma * TONE_KEEP;
  const finish = (l: number, c: number, onTarget: boolean, toneKept: boolean): StepSolution => {
    const components = writtenComponents(l, c, hue);
    const achieved = WCAG2_METRIC.compute({ colorSpace: "srgb", components }, surface);
    return { l, c, h: hue, components, achieved, onTarget, toneKept };
  };
  const atTarget = lightnessForTarget(request);
  const chromaAtTarget = maxChroma(atTarget, hue, request.chroma);
  if (request.chroma <= 0 || chromaAtTarget >= keep - 1e-9) {
    return finish(atTarget, chromaAtTarget, true, true);
  }
  const cusp = cuspLightness(hue, request.chroma * 4);
  if (maxChroma(cusp, hue, keep) < keep - 1e-9) {
    return finish(atTarget, chromaAtTarget, true, false);
  }
  // The boundary between the target (tone lost) and the cusp (tone kept).
  let lost = atTarget;
  let kept = cusp;
  for (let index = 0; index < L_ITERATIONS; index++) {
    const middle = (lost + kept) / 2;
    if (maxChroma(middle, hue, keep) >= keep - 1e-9) kept = middle;
    else lost = middle;
  }
  return finish(kept, maxChroma(kept, hue, request.chroma), false, true);
}
