// The six palettes of a derived Aspekto (Spec 016, G2–G4): each step at its calibrated contrast
// target, moved by the sliders, with the tone of its source — the lead colour for accent (and,
// tinted, for neutral), a status colour or the default tone turned towards the lead colour for the
// status palettes. Pure.

import type { Agordo } from "./agordo.js";
import { parseAgordoColor } from "./agordo.js";
import {
  type CalibratedStep,
  type Calibration,
  type Mode,
  PALETTES,
  type PaletteName,
  STATUS_PALETTES,
} from "./calibration.js";
import { BLACK, type StepSolution, solveStep, WHITE } from "./solve.js";

/**
 * At `neutral.toenung` 1 the neutral palette is as colourful as a quarter of the lead colour at
 * its most colourful step; 0 is grey (plan ① D-04). komuna's neutrals correspond to about 0.35.
 */
export const NEUTRAL_SHARE = 0.25;

/**
 * The default tone of a status palette is komuna's, turned towards the lead colour by a fifth of
 * the angle the lead colour stands from komuna's accent, at most 10° (plan ① D-06). A lead colour
 * below this chroma has no hue to turn towards.
 */
export const STATUS_TURN_SHARE = 0.2;
export const STATUS_TURN_MAX = 10;
export const ACHROMATIC = 0.02;

/**
 * How far the sliders move a target on the logarithmic contrast scale (plan ① D-07): kontrast
 * ±1 makes the S-curve's exponent 1.5 or 0.5, helligkeit ±1 the power 1.5 (lighter) or 0.5.
 */
export const HELLIGKEIT_POWER = 0.5;
export const KONTRAST_SPREAD = 0.5;

/** The largest WCAG 2.x contrast (white on black). */
export const MAX_CONTRAST = 21;

export interface PaletteSource {
  hue: number;
  /** The chroma of the reference step before the calibration profile and saettigung. */
  chroma: number;
  origin: "leitfarbe" | "zusatzfarbe" | "default" | "toenung";
}

export interface TargetFloors {
  /** Every WCAG 2.x threshold of every contrast valoro (kontrastSojloj), ascending. */
  thresholds: readonly number[];
  /** The reserve of the Regulo contrast-reserve (0.05: five per cent above a threshold). */
  reserve: number;
}

export interface DerivedStep extends StepSolution {
  palette: PaletteName;
  step: string;
  mode: Mode;
  /** The calibrated target of komuna in this mode. */
  calibrated: number;
  /** The target after the sliders and the floors — or the overridden target (ziele), floored. */
  target: number;
  /** Present when the Agordo overrides the target of this step in this mode (Spec 016 ②, G7). */
  overridden?: true;
  /** The chroma the step asked for. */
  requested: number;
  hex: string;
}

export interface DerivedPalettes {
  sources: Record<PaletteName, PaletteSource>;
  /** Every step in the light mode: the values of the main set aspekto/<name>. */
  steps: DerivedStep[];
  /** Mode-specific palette values the structure overrides in a conjunction set (dark). */
  overrides: DerivedStep[];
}

/** A palette step the structure sets anew in one mode (komuna: neutral.950 in dark). */
export interface ModeOverride {
  mode: Mode;
  palette: PaletteName;
  step: string;
}

/** Signed shortest angle from `from` to `to`, in (−180, 180]. */
export function hueDifference(to: number, from: number): number {
  const difference = (((to - from) % 360) + 540) % 360;
  return difference - 180;
}

const normalizeHue = (hue: number): number => ((hue % 360) + 360) % 360;

/** The tone of each palette's source (G4). */
export function paletteSources(
  agordo: Agordo,
  calibration: Calibration,
): Record<PaletteName, PaletteSource> {
  const lead = parseAgordoColor(agordo.leitfarbe) ?? { l: 0, c: 0, h: 0 };
  const accent = calibration.palettes.accent;
  const turn =
    lead.c < ACHROMATIC
      ? 0
      : Math.max(
          -STATUS_TURN_MAX,
          Math.min(STATUS_TURN_MAX, STATUS_TURN_SHARE * hueDifference(lead.h, accent.hue)),
        );
  const sources = {
    accent: { hue: lead.h, chroma: lead.c, origin: "leitfarbe" },
    neutral: {
      hue: lead.h,
      chroma: (agordo.neutral?.toenung ?? 0) * lead.c * NEUTRAL_SHARE,
      origin: "toenung",
    },
  } as Record<PaletteName, PaletteSource>;
  for (const status of STATUS_PALETTES) {
    const given = agordo.zusatzfarben?.[status];
    const colour = given === undefined ? undefined : parseAgordoColor(given);
    const calibrated = calibration.palettes[status];
    sources[status] =
      colour === undefined
        ? { hue: normalizeHue(calibrated.hue + turn), chroma: calibrated.chroma, origin: "default" }
        : { hue: colour.h, chroma: calibrated.chroma, origin: "zusatzfarbe" };
  }
  return sources;
}

/**
 * A light-mode target moved by the sliders (G4): `kontrast` spreads or squeezes the targets
 * around the middle of the logarithmic contrast scale, `helligkeit` shifts them all (lighter is
 * less contrast against white). The anchors (1:1 and 21:1) stay. A target that reached a
 * threshold of kontrastSojloj (with the reserve of contrast-reserve) against white or against
 * black keeps reaching it — the sliders never push a step under a threshold.
 */
export function transformTarget(
  target: number,
  regler: Agordo["regler"],
  floors: TargetFloors,
): number {
  const helligkeit = regler?.helligkeit ?? 0;
  const kontrast = regler?.kontrast ?? 0;
  if (target <= 1 + 1e-9 || target >= MAX_CONTRAST - 1e-9) return target;
  if (helligkeit === 0 && kontrast === 0) return target;
  const scale = Math.log(MAX_CONTRAST);
  const position = Math.log(target) / scale;
  // kontrast: an S-curve around the middle that keeps both ends (more spread in the middle for
  // k > 0, less for k < 0); helligkeit: a power that keeps both ends (lighter for h > 0). Both
  // act in proportion to a step's distance from the ends, so steps near white stay apart.
  const gamma = 1 + KONTRAST_SPREAD * kontrast;
  const spread = position ** gamma / (position ** gamma + (1 - position) ** gamma);
  const moved = spread ** (1 + HELLIGKEIT_POWER * helligkeit);
  const result = Math.exp(Math.min(1, Math.max(0, moved)) * scale);
  return floored(result, target, floors);
}

/**
 * The floors (G4): a target that reached a threshold of kontrastSojloj (with the reserve of
 * contrast-reserve) against white or against black keeps reaching it, whatever moved it — the
 * sliders or an override of the Werkstatt (ziele, Spec 016 ②).
 */
export function floored(moved: number, calibrated: number, floors: TargetFloors): number {
  let result = moved;
  const onBlack = MAX_CONTRAST / calibrated;
  for (const threshold of floors.thresholds) {
    const floor = threshold * (1 + floors.reserve);
    if (calibrated >= threshold) result = Math.max(result, Math.min(calibrated, floor));
    if (onBlack >= threshold) result = Math.min(result, MAX_CONTRAST / Math.min(onBlack, floor));
  }
  return result;
}

const hexOf = (components: readonly number[]): string =>
  `#${components
    .map((channel) =>
      Math.round(channel * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;

function solve(
  palette: PaletteName,
  step: string,
  calibrated: CalibratedStep,
  mode: Mode,
  source: PaletteSource,
  agordo: Agordo,
  floors: TargetFloors,
): DerivedStep {
  const requested = source.chroma * calibrated.chroma * (agordo.regler?.saettigung ?? 1);
  // The sliders act on the light scale; a dark target is its mirror on black (t · t' = 21).
  const lightTarget = mode === "light" ? calibrated.light : MAX_CONTRAST / calibrated.dark;
  // An override of the Werkstatt (ziele, Spec 016 ② G7) is the target itself: the sliders leave
  // it alone, the floors of kontrastSojloj still hold.
  const own = agordo.ziele?.[`${palette}.${step}`]?.[mode === "light" ? "hell" : "dunkel"];
  const moved =
    own === undefined
      ? transformTarget(lightTarget, agordo.regler, floors)
      : floored(mode === "light" ? own : MAX_CONTRAST / own, lightTarget, floors);
  const target = mode === "light" ? moved : MAX_CONTRAST / moved;
  const solution = solveStep({
    target,
    surface: mode === "light" ? WHITE : BLACK,
    chroma: requested,
    hue: source.hue,
  });
  return {
    ...solution,
    palette,
    step,
    mode,
    calibrated: mode === "light" ? calibrated.light : calibrated.dark,
    target,
    ...(own === undefined ? {} : { overridden: true as const }),
    requested,
    hex: hexOf(solution.components),
  };
}

/** Derives every step of the six palettes, plus the mode-specific values the structure needs. */
export function derivePalettes(
  agordo: Agordo,
  calibration: Calibration,
  floors: TargetFloors,
  overrides: readonly ModeOverride[] = [],
  only: readonly PaletteName[] = PALETTES,
): DerivedPalettes {
  const sources = paletteSources(agordo, calibration);
  const steps: DerivedStep[] = [];
  for (const palette of only) {
    const calibrated = calibration.palettes[palette];
    const ordered = Object.keys(calibrated.steps).sort((a, b) => Number(a) - Number(b));
    for (const step of ordered) {
      const entry = calibrated.steps[step];
      if (entry === undefined) continue;
      steps.push(solve(palette, step, entry, "light", sources[palette], agordo, floors));
    }
  }
  const modeSteps: DerivedStep[] = [];
  for (const override of overrides) {
    if (!only.includes(override.palette)) continue;
    const entry = calibration.palettes[override.palette].steps[override.step];
    if (entry === undefined) continue;
    modeSteps.push(
      solve(
        override.palette,
        override.step,
        entry,
        override.mode,
        sources[override.palette],
        agordo,
        floors,
      ),
    );
  }
  return { sources, steps, overrides: modeSteps };
}
