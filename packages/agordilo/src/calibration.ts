// The calibration of the Agordilo (Spec 016, G3): every step of the six palettes of komuna,
// measured once — its contrast against the reference surface of each mode (light: neutral.0,
// dark: neutral.1000) and its chroma relative to the reference step of its palette. The numbers
// are a measurement of the reference brand, never its values: a derived Aspekto inherits nothing
// (Art. IV). Pure; the file lives in data/calibration.json (see node/calibration-file.ts).

import {
  ASPEKTO_DIMENSIO,
  buildModelo,
  type ColorValue,
  type Modelo,
  oklchComponentsOf,
  readDtcgColor,
  referenceAspektoOf,
  resolveCombination,
  serializeCanonicalJson,
  WCAG2_METRIC,
} from "@fundamento/modelo";
import type { Structure } from "./structure.js";

/** The six palettes the Agordilo computes (G2); every other token is written as the structure. */
export const PALETTES = ["neutral", "accent", "success", "warning", "danger", "info"] as const;
export type PaletteName = (typeof PALETTES)[number];

/** The status palettes, coloured by `zusatzfarben` or by their default tone (G4). */
export const STATUS_PALETTES = ["success", "warning", "danger", "info"] as const;
export type StatusPalette = (typeof STATUS_PALETTES)[number];

/**
 * The step whose tone a palette takes from its source: accent.700 carries the lead colour (M1:
 * hue and chroma of accent.700), a status palette its basic step 600 (color.status.*.basic in
 * light). The neutral palette has no source colour; its reference is its most colourful step.
 */
export const REFERENCE_STEPS: Readonly<Record<Exclude<PaletteName, "neutral">, string>> = {
  accent: "700",
  success: "600",
  warning: "600",
  danger: "600",
  info: "600",
};

export const COLOR_SCHEME = "color-scheme";
export const MODES = ["light", "dark"] as const;
export type Mode = (typeof MODES)[number];

/** The reference surface of each mode (G3). */
export const REFERENCE_SURFACES: Readonly<Record<Mode, string>> = {
  light: "color.palette.neutral.0",
  dark: "color.palette.neutral.1000",
};

export interface CalibratedStep {
  /** WCAG 2.x contrast of the step against neutral.0 in the light mode. */
  light: number;
  /** WCAG 2.x contrast of the step against neutral.1000 in the dark mode. */
  dark: number;
  /** Chroma relative to the reference step of the palette (1 at the reference). */
  chroma: number;
}

export interface CalibratedPalette {
  /** The reference step (see REFERENCE_STEPS). */
  ref: string;
  /** OKLCH hue of the reference step in komuna (the default tone of a status palette). */
  hue: number;
  /** OKLCH chroma of the reference step in komuna. */
  chroma: number;
  steps: Record<string, CalibratedStep>;
}

export interface Calibration {
  /** The Aspekto measured: the reference Aspekto of the Modelo. */
  reference: string;
  surfaces: Record<Mode, string>;
  palettes: Record<PaletteName, CalibratedPalette>;
}

const round = (value: number, digits: number): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const STEP = /^color\.palette\.([a-z]+)\.(\d+)$/;

/** The opaque palette steps of one palette in a resolution, by step number. */
function stepsOf(
  tokens: Readonly<Record<string, { value: unknown }>>,
  palette: PaletteName,
): Map<string, ColorValue> {
  const steps = new Map<string, ColorValue>();
  for (const [name, token] of Object.entries(tokens)) {
    const match = STEP.exec(name);
    if (match?.[1] !== palette || match[2] === undefined) continue;
    const color = readDtcgColor(token.value);
    if (color !== undefined) steps.set(match[2], color);
  }
  return new Map([...steps].sort(([a], [b]) => Number(a) - Number(b)));
}

/** The resolved tokens of the reference Aspekto in one colour scheme (all else default). */
export function referenceTokens(modelo: Modelo, mode: Mode): Record<string, { value: unknown }> {
  const reference = referenceAspektoOf(modelo);
  if (reference === undefined) throw new Error("The Modelo names no reference Aspekto.");
  const resolution = resolveCombination(modelo, {
    [ASPEKTO_DIMENSIO]: reference,
    [COLOR_SCHEME]: mode,
  });
  if (resolution.errors.length > 0) {
    throw new Error(
      `The reference Aspekto does not resolve in ${mode}: ${resolution.errors[0]?.message}`,
    );
  }
  return resolution.tokens;
}

/** Builds the Modelo of a structure; the structure must be valid. */
export function structureModelo(structure: Structure): Modelo {
  const { modelo } = buildModelo(structure.files);
  return modelo;
}

/**
 * Measures the calibration on the reference Aspekto of a structure (komuna): for every step of
 * the six palettes its contrast against neutral.0 in light and against neutral.1000 in dark, and
 * its chroma relative to the reference step.
 */
export function measureCalibration(structure: Structure): Calibration {
  const modelo = structureModelo(structure);
  const reference = referenceAspektoOf(modelo) ?? "";
  const tokens = { light: referenceTokens(modelo, "light"), dark: referenceTokens(modelo, "dark") };
  const surface = (mode: Mode): ColorValue => {
    const color = readDtcgColor(tokens[mode][REFERENCE_SURFACES[mode]]?.value);
    if (color === undefined)
      throw new Error(`${REFERENCE_SURFACES[mode]} is no colour in ${mode}.`);
    return color;
  };
  const surfaces = { light: surface("light"), dark: surface("dark") };
  const palettes = {} as Record<PaletteName, CalibratedPalette>;
  for (const palette of PALETTES) {
    const light = stepsOf(tokens.light, palette);
    const dark = stepsOf(tokens.dark, palette);
    const chromaOf = new Map(
      [...light].map(([step, color]) => [step, oklchComponentsOf(color)] as const),
    );
    const ref =
      palette === "neutral"
        ? ([...chromaOf].reduce((best, entry) => (entry[1][1] > best[1][1] ? entry : best))[0] ??
          "")
        : REFERENCE_STEPS[palette];
    const [, refChroma, refHue] = chromaOf.get(ref) ?? [0, 0, 0];
    const steps: Record<string, CalibratedStep> = {};
    for (const [step, color] of light) {
      const darkColor = dark.get(step) ?? color;
      const chroma = chromaOf.get(step)?.[1] ?? 0;
      steps[step] = {
        light: round(WCAG2_METRIC.compute(color, surfaces.light), 4),
        dark: round(WCAG2_METRIC.compute(darkColor, surfaces.dark), 4),
        chroma: refChroma === 0 ? 0 : round(chroma / refChroma, 4),
      };
    }
    palettes[palette] = { ref, hue: round(refHue, 2), chroma: round(refChroma, 4), steps };
  }
  return { reference, surfaces: { ...REFERENCE_SURFACES }, palettes };
}

/** The exact bytes of data/calibration.json: canonical JSON (keys sorted, 2-space indent). */
export function serializeCalibration(calibration: Calibration): string {
  return serializeCanonicalJson(calibration);
}
