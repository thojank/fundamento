// Spec 056 (MP-2a, T1, plan D-5): the kind of a colour read from an image – light or dark,
// colourful or not, and whether it may become Primär – from the thresholds that already stand in
// `kreilo.json` › `unbunt` (no new threshold). The server computes it once per stored colour, so the
// canvas needs no colour maths: „Erkannt“ and the follow rule read the flags. Pure.

import { parseAgordoColor } from "@fundamento/agordilo";
import type { KreiloDatoj } from "./kreilo/datoj.js";

/** The thresholds the flags read (`KREILO.unbunt`). */
export type FarbSojloj = Pick<KreiloDatoj["unbunt"], "dunkel_bis" | "bunt_ab" | "pastell_ab">;

/** The flags of a colour: as `ErkanntaFarbo` carries them. */
export interface FarbArto {
  /** OKLCH lightness above `dunkel_bis`. */
  hell: boolean;
  /** OKLCH chroma from `bunt_ab` (as the Enportilo counts a colour as colourful). */
  bunt: boolean;
  /** Colourful and lightness below `pastell_ab`: may be a lead colour (no pastel). */
  leit: boolean;
}

/** The flags of a colour (`#rrggbb`, `#rgb` or `oklch(…)`); undefined for an unreadable one. */
export function farbArtDe(hex: string, sojloj: FarbSojloj): FarbArto | undefined {
  const oklch = parseAgordoColor(hex.trim());
  if (oklch === undefined) return undefined;
  const bunt = oklch.c >= sojloj.bunt_ab;
  return { hell: oklch.l > sojloj.dunkel_bis, bunt, leit: bunt && oklch.l < sojloj.pastell_ab };
}
