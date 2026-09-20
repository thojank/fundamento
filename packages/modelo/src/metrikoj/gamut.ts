// Gamut metric (Spec 004 T002, G6). A component outside 0…1 is clipped by the browser, and then
// the measured contrast is no longer the contrast on screen. Pure.

import type { ColorValue } from "../generated/modelo-schema.js";

export interface GamutResult {
  inside: boolean;
  /** Largest excess beyond 0…1; 0 when every component is inside. */
  worst: number;
}

export function srgbGamut(color: ColorValue): GamutResult {
  let worst = 0;
  for (const component of color.components) {
    const value = component === "none" ? 0 : component;
    worst = Math.max(worst, value - 1, -value);
  }
  return { inside: worst <= 0, worst: Math.max(worst, 0) };
}
