// The fallback and the weights of a brand font (Spec 036 Teil 5 ②b-5; Spec 029 ①-7, B-2/B-3).
// The Agordo's Fonto may name its category and the weights the family has — the Metiejo writes
// both from its catalogue; the Agordilo reads no catalogue (Spec 036, Blocker 11). Pure.

import type { Agordo } from "./agordo.js";
import { isRecord } from "./record.js";

type FontRole = "display" | "body" | "code";

/**
 * The generic families a category falls back to: the platform's own family of that kind
 * (CSS Fonts Level 4, generic font families: `ui-serif`/`serif`, `ui-monospace`/`monospace`,
 * `system-ui`/`sans-serif`). A category without a generic family of its own (display,
 * handwriting, other, icons) keeps the fallback of the structure: a decorative face falls back to a
 * readable one.
 */
const GENERIC_BY_CATEGORY: Readonly<Record<string, readonly string[]>> = {
  "sans-serif": ["system-ui", "sans-serif"],
  serif: ["ui-serif", "serif"],
  monospace: ["ui-monospace", "monospace"],
};

/** The value of font.family.<role> for the Agordo's own font: its family, then its fallback. */
export function familyStackOf(
  font: NonNullable<Agordo["schriften"]>[FontRole],
  structureStack: readonly unknown[],
): unknown[] {
  if (font === undefined) return [...structureStack];
  const generic = font.category === undefined ? undefined : GENERIC_BY_CATEGORY[font.category];
  return [font.family, ...(generic ?? structureStack.slice(1))];
}

/**
 * The weight of `weights` nearest to `target`; on a tie the lighter up to 500 and the heavier
 * above, the direction the platform looks first (CSS Fonts Level 4, font matching).
 */
export function nearestWeight(target: number, weights: readonly number[]): number {
  let best: number | undefined;
  for (const weight of weights) {
    if (best === undefined) {
      best = weight;
      continue;
    }
    const distance = Math.abs(weight - target);
    const bestDistance = Math.abs(best - target);
    const tieWins = target <= 500 ? weight < best : weight > best;
    if (distance < bestDistance || (distance === bestDistance && tieWins)) best = weight;
  }
  return best ?? target;
}

const FAMILY_ALIAS = /^\{font\.family\.(display|body|code)\}$/;
const WEIGHT_ALIAS = /^\{(font\.weight\.[a-z]+)\}$/;

/**
 * A typography role in the main set of the derived Aspekto: when its family is the Agordo's own
 * font and that font names its weights, the weight becomes the nearest the font has — the alias of
 * the font.weight token of the set that holds it, the number where none does (B-2).
 * `weightOf` gives the value of a font.weight token as the set writes it.
 */
export function typographyWithFontWeight(
  agordo: Agordo,
  value: unknown,
  weightTokens: ReadonlyMap<string, number>,
): unknown {
  if (!isRecord(value)) return value;
  const family = typeof value.fontFamily === "string" ? FAMILY_ALIAS.exec(value.fontFamily) : null;
  const role = family?.[1] as FontRole | undefined;
  const weights = role === undefined ? undefined : agordo.schriften?.[role]?.weights;
  if (weights === undefined || weights.length === 0) return value;
  const alias =
    typeof value.fontWeight === "string" ? WEIGHT_ALIAS.exec(value.fontWeight)?.[1] : undefined;
  const target =
    typeof value.fontWeight === "number"
      ? value.fontWeight
      : alias === undefined
        ? undefined
        : weightTokens.get(alias);
  if (target === undefined || weights.includes(target)) return value;
  const nearest = nearestWeight(target, weights);
  const token = [...weightTokens].find(([, weight]) => weight === nearest)?.[0];
  return { ...value, fontWeight: token === undefined ? nearest : `{${token}}` };
}
