// Cause and one suggestion for a violation (Spec 016, G6): trace the tokens of the finding to the
// palette steps they resolve to, and ask the derivation why a step stands where it stands — it
// kept its tone and missed its target, the sliders moved its target, or the step is on target
// and the rule fails with the fixed role assignment. The suggestion is the one change that frees
// the step: a lead colour with less chroma (its value named), a slider value, or the boundary
// role-remap. Pure.

import {
  type Assignment,
  type CombinationResolution,
  type Modelo,
  oklchLAlign,
  oklchLightness,
  oklchLStep,
  oklchLStepConsistency,
  palettePikoj,
  type RampStep,
  resolveCombination,
} from "@fundamento/modelo";
import type { Agordo } from "./agordo.js";
import { parseAgordoColor } from "./agordo.js";
import {
  type Calibration,
  COLOR_SCHEME,
  type Mode,
  type PaletteName,
  REFERENCE_STEPS,
} from "./calibration.js";
import {
  ACHROMATIC,
  type DerivedPalettes,
  type DerivedStep,
  derivePalettes,
  type ModeOverride,
  type TargetFloors,
} from "./palettes.js";
import { TONE_KEEP } from "./solve.js";

export interface ExplainContext {
  modelo: Modelo;
  agordo: Agordo;
  calibration: Calibration;
  floors: TargetFloors;
  overrides: readonly ModeOverride[];
  palettes: DerivedPalettes;
}

const TOKEN_IN_TEXT = /color\.[a-z0-9]+(?:\.[a-z0-9-]+)+/g;
const PALETTE_STEP = /^color\.palette\.([a-z]+)\.(\d+)$/;
const SEARCH_ITERATIONS = 14;

const fixed = (value: number, digits: number): string => value.toFixed(digits);
const ratio = (value: number): string => `${value.toFixed(2)}:1`;

/** The colour tokens a finding names (its subject, its message, the members of its pair). */
export function tokensOf(text: string, extra: readonly string[] = []): string[] {
  const found = [...extra, ...(text.match(TOKEN_IN_TEXT) ?? [])].map((token) =>
    token.replace(/\.$/, ""),
  );
  return [...new Set(found)];
}

export class Explainer {
  readonly #context: ExplainContext;
  readonly #resolutions = new Map<string, CombinationResolution>();
  readonly #suggestions = new Map<string, string>();

  constructor(context: ExplainContext) {
    this.#context = context;
  }

  #resolution(assignment: Assignment): CombinationResolution {
    const key = JSON.stringify(Object.entries(assignment).sort());
    let resolution = this.#resolutions.get(key);
    if (resolution === undefined) {
      resolution = resolveCombination(this.#context.modelo, assignment);
      this.#resolutions.set(key, resolution);
    }
    return resolution;
  }

  /** The derived steps the tokens resolve to in a combination (main values or mode overrides). */
  steps(assignment: Assignment, tokens: readonly string[]): DerivedStep[] {
    const mode: Mode = assignment[COLOR_SCHEME] === "dark" ? "dark" : "light";
    const resolution = this.#resolution(assignment);
    const found: DerivedStep[] = [];
    for (const token of tokens) {
      const chain = resolution.tokens[token]?.aliasChain.map((link) => link.token) ?? [];
      const target = [token, ...chain].find((name) => PALETTE_STEP.test(name));
      const match = target === undefined ? null : PALETTE_STEP.exec(target);
      if (match?.[1] === undefined || match[2] === undefined) continue;
      const { palettes } = this.#context;
      const step =
        palettes.overrides.find(
          (entry) => entry.mode === mode && entry.palette === match[1] && entry.step === match[2],
        ) ?? palettes.steps.find((entry) => entry.palette === match[1] && entry.step === match[2]);
      if (step !== undefined && !found.includes(step)) found.push(step);
    }
    return found;
  }

  /** Cause and one suggestion for a finding of `rule` about `tokens` in `assignment`. */
  explain(
    rule: string,
    assignment: Assignment,
    tokens: readonly string[],
  ): { cause: string; suggestion: string } {
    const steps = this.steps(assignment, tokens);
    const offTarget = steps.find((step) => !step.onTarget);
    if (offTarget !== undefined) {
      return {
        cause: this.#offTargetCause(offTarget),
        suggestion: this.#toneSuggestion(offTarget),
      };
    }
    const toneLost = steps.find((step) => !step.toneKept);
    if (toneLost !== undefined) {
      return {
        cause: `${tokenOf(toneLost)} meets its target ${ratio(toneLost.target)} only without its tone: at hue ${fixed(toneLost.h, 1)}° sRGB holds no chroma of ${fixed(toneLost.requested * TONE_KEEP, 4)} at any lightness (kept ${fixed(toneLost.c, 4)}).`,
        suggestion: unreachable(toneLost.palette),
      };
    }
    const shifted = steps.find((step) => Math.abs(step.target - step.calibrated) > 1e-6);
    if (shifted !== undefined) {
      return {
        cause: `The sliders moved the target of ${tokenOf(shifted)} from ${ratio(shifted.calibrated)} to ${ratio(shifted.target)}; the step meets the moved target.`,
        suggestion: this.#sliderSuggestion(),
      };
    }
    if (rule === "palette-aligned" || rule === "palette-even") {
      const ramp = this.#rampExplanation(rule, tokens);
      if (ramp !== undefined) return ramp;
    }
    const named = steps.length === 0 ? tokens.join(", ") : steps.map(tokenOf).join(", ");
    return {
      cause: `${named} meet their contrast targets; the rule fails with the role assignment of the structure, which stage 1 keeps (G2).`,
      suggestion:
        "Not reachable with the fixed role assignment of stage 1: re-pointing a role is the boundary role-remap (ask the maintainer).",
    };
  }

  /** The sojlo (`max`) of a structural Regulo of the Modelo. */
  #sojloMax(rule: string): number {
    return this.#context.modelo.reguloj.find((regulo) => regulo.name === rule)?.sojlo?.max ?? 0;
  }

  /** Whether the ramps of `palettes` keep the structural rule (same measure as the Regulo). */
  #rampsHold(rule: string, palettes: DerivedPalettes, palette: PaletteName): boolean {
    const ramps = rampsOf(palettes);
    const max = this.#sojloMax(rule);
    if (rule === "palette-aligned") {
      return oklchLAlign(Object.fromEntries(ramps)).every((entry) => entry.spread <= max + 1e-9);
    }
    const ramp = ramps.get(palette) ?? [];
    if (ramp.length < 3) return true;
    if (oklchLStep(ramp).some((step) => step.delta <= 1e-9)) return false;
    return oklchLStepConsistency(ramp).worst <= max + 1e-9;
  }

  /**
   * palette-aligned and palette-even judge the ramps the derivation wrote: every step on target,
   * yet at its hue and chroma a contrast target needs another lightness than komuna's hues. The
   * ramp that stands out is named, and the chroma share of its source that keeps the rule.
   */
  #rampExplanation(
    rule: string,
    tokens: readonly string[],
  ): { cause: string; suggestion: string } | undefined {
    const subject = tokens.map((token) => PALETTE_STEP.exec(token)).find((match) => match !== null);
    const number = Number(subject?.[2]);
    if (subject?.[1] === undefined || !Number.isFinite(number)) return undefined;
    const ramps = rampsOf(this.#context.palettes);
    let culprit = subject[1] as PaletteName;
    let detail = `The ramp ${culprit} advances unevenly towards step ${number}`;
    if (rule === "palette-aligned") {
      const at: { palette: string; l: number }[] = [];
      for (const [palette, steps] of ramps) {
        const step = steps.find((entry) => entry.step === number);
        if (step !== undefined) at.push({ palette, l: oklchLightness(step.value) });
      }
      const sorted = at.map((entry) => entry.l).sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
      const worst = at.reduce<{ palette: string; l: number } | undefined>(
        (best, entry) =>
          best === undefined || Math.abs(entry.l - median) > Math.abs(best.l - median)
            ? entry
            : best,
        undefined,
      );
      if (worst === undefined) return undefined;
      culprit = worst.palette as PaletteName;
      const others = at.filter((entry) => entry.palette !== worst.palette).map((entry) => entry.l);
      detail = `At step ${number} the ramp ${culprit} stands at OKLCH L ${fixed(worst.l, 3)}, the other ramps between ${fixed(Math.min(...others), 3)} and ${fixed(Math.max(...others), 3)}`;
    }
    const source = this.#context.palettes.sources[culprit];
    const cause = `${detail}: every step meets its contrast target, but at hue ${fixed(source.hue, 1)}° and chroma ${fixed(source.chroma, 4)} a contrast target needs another lightness than at the hues of komuna's calibration (WCAG luminance and OKLCH lightness part with hue and chroma).`;
    return { cause, suggestion: this.#rampSuggestion(rule, culprit) };
  }

  #rampSuggestion(rule: string, palette: PaletteName): string {
    const key = `${rule}:${palette}`;
    const known = this.#suggestions.get(key);
    if (known !== undefined) return known;
    const { agordo, calibration, floors, overrides, palettes } = this.#context;
    const holds = (candidate: Agordo): boolean => {
      const derived = derivePalettes(candidate, calibration, floors, overrides, [palette]);
      const combined: DerivedPalettes = {
        ...palettes,
        steps: [...palettes.steps.filter((step) => step.palette !== palette), ...derived.steps],
      };
      return this.#rampsHold(rule, combined, palette);
    };
    const search = (make: (share: number) => Agordo): number => {
      let low = 0;
      let high = 1;
      for (let index = 0; index < SEARCH_ITERATIONS; index++) {
        const middle = (low + high) / 2;
        if (holds(make(middle))) low = middle;
        else high = middle;
      }
      return low;
    };
    let suggestion: string;
    if (palette === "accent") {
      const lead = parseAgordoColor(agordo.leitfarbe) ?? { l: 0, c: 0, h: 0 };
      const make = (share: number): Agordo => ({
        ...agordo,
        leitfarbe: `oklch(${fixed(lead.l, 6)} ${fixed(lead.c * share, 6)} ${fixed(lead.h, 6)})`,
      });
      const share = search(make);
      const chroma = lead.c * share;
      const anchor = derivePalettes(make(share), calibration, floors, overrides, [
        "accent",
      ]).steps.find((step) => step.step === REFERENCE_STEPS.accent);
      suggestion =
        chroma < ACHROMATIC || anchor === undefined
          ? unreachable("accent")
          : `Use the lead colour ${anchor.hex} (hue ${fixed(lead.h, 1)}°, chroma ${fixed(anchor.c, 4)} instead of ${fixed(lead.c, 4)}; any chroma up to ${fixed(chroma, 4)} holds): the ramp accent then keeps ${rule}.`;
    } else if (palette === "neutral") {
      const tint = agordo.neutral?.toenung ?? 0;
      const share = search((value) => ({ ...agordo, neutral: { toenung: tint * value } }));
      suggestion = `Set neutral.toenung to ${fixed(Math.floor(tint * share * 100) / 100, 2)} (now ${fixed(tint, 2)}): the neutral ramp then keeps ${rule}.`;
    } else {
      const saturation = agordo.regler?.saettigung ?? 1;
      const share = search((value) => ({
        ...agordo,
        regler: { ...agordo.regler, saettigung: saturation * value },
      }));
      suggestion =
        saturation * share < 0.05
          ? unreachable(palette)
          : `Set regler.saettigung to ${fixed(Math.floor(saturation * share * 100) / 100, 2)} (now ${fixed(saturation, 2)}): the ramp ${palette} then keeps ${rule}.`;
    }
    this.#suggestions.set(key, suggestion);
    return suggestion;
  }

  #offTargetCause(step: DerivedStep): string {
    const surface = step.mode === "light" ? "neutral.0" : "neutral.1000";
    return `${tokenOf(step)} keeps the tone of its ${originLabel(this.#context, step.palette)} (chroma ≥ ${fixed(step.requested * TONE_KEEP, 4)}) only at OKLCH L ${fixed(step.l, 3)}: ${ratio(step.achieved)} against ${surface} instead of its target ${ratio(step.target)}.`;
  }

  #toneSuggestion(step: DerivedStep): string {
    const key = step.palette;
    const known = this.#suggestions.get(key);
    if (known !== undefined) return known;
    const suggestion =
      step.palette === "accent"
        ? this.#leadSuggestion()
        : step.palette === "neutral"
          ? this.#tintSuggestion()
          : this.#saturationSuggestion(step.palette);
    this.#suggestions.set(key, suggestion);
    return suggestion;
  }

  /** Whether every step of `palette` meets its target under `agordo`. */
  #onTarget(agordo: Agordo, palette: PaletteName): DerivedPalettes | undefined {
    const { calibration, floors, overrides } = this.#context;
    const derived = derivePalettes(agordo, calibration, floors, overrides, [palette]);
    const all = [...derived.steps, ...derived.overrides];
    return all.every((step) => step.onTarget) ? derived : undefined;
  }

  /** The largest share of `full` (0…1) for which `make(share)` keeps `palette` on target. */
  #largestShare(make: (share: number) => Agordo, palette: PaletteName): number {
    let low = 0;
    let high = 1;
    for (let index = 0; index < SEARCH_ITERATIONS; index++) {
      const middle = (low + high) / 2;
      if (this.#onTarget(make(middle), palette) !== undefined) low = middle;
      else high = middle;
    }
    return low;
  }

  #leadSuggestion(): string {
    const { agordo } = this.#context;
    const lead = parseAgordoColor(agordo.leitfarbe) ?? { l: 0, c: 0, h: 0 };
    const withChroma = (share: number): Agordo => ({
      ...agordo,
      leitfarbe: `oklch(${fixed(lead.l, 6)} ${fixed(lead.c * share, 6)} ${fixed(lead.h, 6)})`,
    });
    const share = this.#largestShare(withChroma, "accent");
    if (lead.c * share < ACHROMATIC) return unreachable("accent");
    // The value named is the lead colour darkened to its step (accent.700) at the chroma that
    // holds: entered as the lead colour, it keeps every accent step on target with its tone.
    const derived = this.#onTarget(withChroma(share), "accent");
    const anchor = derived?.steps.find((step) => step.step === REFERENCE_STEPS.accent);
    if (anchor === undefined) return unreachable("accent");
    return `Use the darker lead colour ${anchor.hex} (hue ${fixed(lead.h, 1)}°, chroma ${fixed(anchor.c, 4)} instead of ${fixed(lead.c, 4)}; any chroma up to ${fixed(lead.c * share, 4)} holds): every accent step then keeps its tone at its contrast target.`;
  }

  #tintSuggestion(): string {
    const { agordo } = this.#context;
    const tint = agordo.neutral?.toenung ?? 0;
    const share = this.#largestShare(
      (value) => ({ ...agordo, neutral: { toenung: tint * value } }),
      "neutral",
    );
    return `Set neutral.toenung to ${fixed(Math.floor(tint * share * 100) / 100, 2)} (now ${fixed(tint, 2)}): every neutral step then keeps its tint at its contrast target.`;
  }

  #saturationSuggestion(palette: PaletteName): string {
    const { agordo } = this.#context;
    const saturation = agordo.regler?.saettigung ?? 1;
    const share = this.#largestShare(
      (value) => ({ ...agordo, regler: { ...agordo.regler, saettigung: saturation * value } }),
      palette,
    );
    if (saturation * share < 0.05) return unreachable(palette);
    return `Set regler.saettigung to ${fixed(Math.floor(saturation * share * 100) / 100, 2)} (now ${fixed(saturation, 2)}): the ${palette} steps then keep their tone at their contrast targets.`;
  }

  #sliderSuggestion(): string {
    const regler = this.#context.agordo.regler ?? {};
    const helligkeit = Math.abs(regler.helligkeit ?? 0);
    const kontrast = Math.abs(regler.kontrast ?? 0);
    const name = helligkeit >= kontrast ? "helligkeit" : "kontrast";
    return `Set regler.${name} to 0 (now ${fixed(regler[name] ?? 0, 2)}): the targets of komuna's calibration then apply unmoved.`;
  }
}

/** The ramps of the light values, as the Reguloj read them (anchors and alpha ramps left out). */
function rampsOf(palettes: DerivedPalettes): Map<string, RampStep[]> {
  const tokens: Record<string, { value: unknown }> = {};
  for (const step of palettes.steps) {
    tokens[`color.palette.${step.palette}.${step.step}`] = {
      value: { colorSpace: "srgb", components: [...step.components] },
    };
  }
  return palettePikoj(tokens);
}

function tokenOf(step: DerivedStep): string {
  return `color.palette.${step.palette}.${step.step}${step.mode === "dark" ? " (dark)" : ""}`;
}

function originLabel(context: ExplainContext, palette: PaletteName): string {
  const source = context.palettes.sources[palette];
  switch (source.origin) {
    case "leitfarbe":
      return "lead colour";
    case "toenung":
      return "tint (neutral.toenung)";
    case "zusatzfarbe":
      return `status colour (zusatzfarben.${palette})`;
    default:
      return `default tone (${palette})`;
  }
}

function unreachable(palette: PaletteName): string {
  return palette === "accent"
    ? "Target not reachable at this hue: choose a lead colour of another hue."
    : `Target not reachable at this hue: choose another tone for ${palette}.`;
}
