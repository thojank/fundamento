// Spec 046 T5 (A-10: geometry and style, no picture): the combinations the geometry of the new Eroj
// is measured in – komuna light and dark, and ekzemplo – and the values their tokens resolve to
// there (rezolvoj, the CSS Celo's declarations), measured as pixels on a probe.

import { type CeloInput, cssDeclarationsOf } from "@fundamento/projekcioj";
import type { Page } from "@playwright/test";

export const ASPEKTOJ_046 = [
  ["komuna", "light"],
  ["komuna", "dark"],
  ["ekzemplo", "light"],
] as const;

/** The declarations of one combination: the Aspekto and scheme, every other Dimensio at rest. */
export function declarationsOf(
  input: CeloInput,
  aspekto: string,
  scheme: string,
): { assignment: Readonly<Record<string, string>>; declarations: Record<string, string> } {
  const rezolvo = input.rezolvoj.rezolvoj.find(
    (candidate) =>
      candidate.assignment.aspekto === aspekto &&
      candidate.assignment["color-scheme"] === scheme &&
      candidate.assignment.contrast === "default" &&
      candidate.assignment.density === "default" &&
      candidate.assignment.viewport === "medium" &&
      candidate.assignment.motion === "reduced",
  );
  if (rezolvo === undefined) throw new Error(`${aspekto}/${scheme} missing`);
  return { assignment: rezolvo.assignment, declarations: cssDeclarationsOf(rezolvo) };
}

/** Sets every Dimensio of the combination on the root, as the Vitrino does. */
export const applyAssignment = (page: Page, assignment: Readonly<Record<string, string>>) =>
  page.evaluate((values) => {
    const root = document.documentElement;
    for (const [dimensio, valoro] of Object.entries(values)) {
      root.setAttribute(`data-fm-${dimensio}`, valoro);
    }
  }, assignment);

/** A declared value (`16px`, `1rem`, `calc(…)`) as whole pixels, measured on a probe. */
export const pxOf = (page: Page, value: string) =>
  page.evaluate((declared) => {
    const probe = document.createElement("div");
    probe.style.inlineSize = declared;
    document.body.append(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return Math.round(width);
  }, value);

/** The pixels of the token `name` (dotted) in a combination's declarations. */
export async function tokenPxIn(
  page: Page,
  declarations: Readonly<Record<string, string>>,
  name: string,
): Promise<number> {
  const declared = declarations[`--fm-${name.replaceAll(".", "-")}`];
  if (declared === undefined) throw new Error(`${name} not declared`);
  return pxOf(page, declared);
}
