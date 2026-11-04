// Spec 036, Befund 2.1 (V-1): an achromatic brand. Its lead colour may be black or a very dark
// neutral; the derivation keeps it. A lead colour without hue (chroma below ACHROMATIC) gives a
// grey accent ramp, as before, and every step keeps its calibrated contrast (palette-aligned: a
// step number weighs the same in every ramp). What moves are the roles of the light mode. The
// ramp of the lead colour is then the grey accent ramp continued by black (neutral.1000, as grey
// as the ramp). A role that aliases the reference step (accent.700, where the lead colour stands)
// re-points to the step nearest the lead colour; every other role that aliases a step from the
// reference step downwards keeps its distance in lightness from that rest where the ramp allows,
// and never gets lighter than its own step: states stay distinct, and contrast on light surfaces
// only rises. The high-contrast light mode gets the same treatment from the steps the generic
// contrast/high set gives (a set of the brand's own), so it is never lighter than the default;
// the dark modes keep their roles (light on dark). A lead colour whose nearest step is the
// reference step itself (a mid grey) is derived as before. Pure.

import type { Agordo } from "./agordo.js";
import { parseAgordoColor } from "./agordo.js";
import { REFERENCE_STEPS } from "./calibration.js";
import { ACHROMATIC, type DerivedPalettes } from "./palettes.js";

const ACCENT_ALIAS = /^\{color\.palette\.accent\.(\d+)\}$/;
/** The step that continues the grey accent ramp of an achromatic lead colour: black. */
const BLACK_STEP = { palette: "neutral", step: "1000" } as const;
/** The kondicxoj of the brand's own set for the high-contrast light mode. */
export const UNBUNT_HIGH_KONDICXOJ = ["color-scheme=light", "contrast=high"] as const;

export interface UnbuntRoles {
  /** The palette step nearest the lead colour, where the roles of the lead colour rest. */
  rest: string;
  /** The new alias of a role of the main set, by token name; absent roles keep theirs. */
  main: ReadonlyMap<string, string>;
  /** The aliases of the brand's set for the high-contrast light mode, by token name. */
  high: ReadonlyMap<string, string>;
}

interface RampStep {
  palette: string;
  step: string;
  /** OKLCH lightness of the light-mode value. */
  l: number;
}

const aliasOf = (entry: RampStep): string => `{color.palette.${entry.palette}.${entry.step}}`;

/** Every token of a set document that aliases a step of the accent ramp, with that step. */
function accentAliases(value: unknown, path: string[] = []): { token: string; step: string }[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return [];
  const node = value as Record<string, unknown>;
  if ("$value" in node) {
    const match = typeof node.$value === "string" ? ACCENT_ALIAS.exec(node.$value) : null;
    return match?.[1] === undefined ? [] : [{ token: path.join("."), step: match[1] }];
  }
  return Object.entries(node).flatMap(([key, child]) =>
    key.startsWith("$") ? [] : accentAliases(child, [...path, key]),
  );
}

/**
 * The roles of a very dark neutral lead colour, or undefined: for a colourful lead colour, for one
 * whose nearest step is the reference step, and for a ramp without the reference step.
 * `mainSet` is the structure's set the main set is written from, `highSet` the generic
 * contrast/high set; tokens the Agordo sets itself (festgelegt) are left to it.
 */
export function unbuntRoles(
  agordo: Agordo,
  palettes: DerivedPalettes,
  mainSet: unknown,
  highSet: unknown,
): UnbuntRoles | undefined {
  const lead = parseAgordoColor(agordo.leitfarbe);
  if (lead === undefined || lead.c >= ACHROMATIC) return undefined;
  const reference = REFERENCE_STEPS.accent;
  const accent = palettes.steps.filter((entry) => entry.palette === "accent");
  const black = palettes.steps.find(
    (entry) => entry.palette === BLACK_STEP.palette && entry.step === BLACK_STEP.step,
  );
  const ramp: RampStep[] = [...accent, ...(black === undefined ? [] : [black])].map((entry) => ({
    palette: entry.palette,
    step: entry.step,
    l: entry.l,
  }));
  const rest = ramp.find((entry) => entry.palette === "accent" && entry.step === reference);
  if (rest === undefined) return undefined;
  const nearest = ramp
    .filter((entry) => entry.palette !== "accent" || Number(entry.step) >= Number(reference))
    .reduce((best, entry) =>
      Math.abs(entry.l - lead.l) < Math.abs(best.l - lead.l) ? entry : best,
    );
  if (nearest === rest) return undefined;
  const accentStep = (step: string) =>
    ramp.find((entry) => entry.palette === "accent" && entry.step === step);
  // A role that is not the rest keeps its distance in lightness from the rest where the ramp
  // allows, never lighter than its own step; where no step lies that far, the farthest is taken.
  const roleOf = (step: string): string => {
    const own = accentStep(step);
    if (own === undefined) return `{color.palette.accent.${step}}`;
    if (step === reference) return aliasOf(nearest);
    const distance = Math.abs(own.l - rest.l);
    const target = nearest.l - distance;
    const darker = ramp.filter((entry) => entry !== nearest && entry.l <= own.l + 1e-9);
    const far = darker.filter((entry) => Math.abs(entry.l - nearest.l) >= distance - 1e-9);
    const chosen =
      far.length > 0
        ? far.reduce((best, entry) =>
            Math.abs(entry.l - target) < Math.abs(best.l - target) ? entry : best,
          )
        : darker.reduce<RampStep | undefined>(
            (best, entry) =>
              best === undefined || Math.abs(entry.l - nearest.l) > Math.abs(best.l - nearest.l)
                ? entry
                : best,
            undefined,
          );
    return aliasOf(chosen ?? own);
  };
  const fixed = new Set(Object.keys(agordo.festgelegt ?? {}));
  const inScope = (entry: { token: string; step: string }) =>
    Number(entry.step) >= Number(reference) && !fixed.has(entry.token);
  const mainAliases = accentAliases(mainSet).filter(inScope);
  const restTokens = new Set(
    mainAliases.filter((entry) => entry.step === reference).map((entry) => entry.token),
  );
  const main = new Map(mainAliases.map((entry) => [entry.token, roleOf(entry.step)]));
  const high = new Map(
    accentAliases(highSet)
      .filter(inScope)
      .map((entry) => [
        entry.token,
        restTokens.has(entry.token) ? aliasOf(nearest) : roleOf(entry.step),
      ]),
  );
  return { rest: `${nearest.palette}.${nearest.step}`, main, high };
}
