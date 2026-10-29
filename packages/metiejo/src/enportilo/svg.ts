// The colours of an SVG (Spec 033 S2): fill and stroke as attributes or in style, each colour once,
// in the order of the file, with the line it first stands on and how often it stands there. Pure.

import { coloursIn, lineOf, type Trovo } from "./trovo.js";

export function legiSvg(text: string, dosiero: string): Trovo[] {
  const found = new Map<string, Trovo>();
  for (const match of text.matchAll(/(?:fill|stroke|stop-color|color)\s*[:=]\s*["']?([^"';>]+)/g)) {
    for (const colour of coloursIn(match[1] ?? "")) {
      const known = found.get(colour);
      if (known !== undefined) known.pezo += 1;
      else
        found.set(colour, {
          kind: "farbo",
          valoro: colour,
          pezo: 1,
          herkunft: { dosiero, loko: `Zeile ${lineOf(text, match.index)}` },
        });
    }
  }
  return [...found.values()];
}
