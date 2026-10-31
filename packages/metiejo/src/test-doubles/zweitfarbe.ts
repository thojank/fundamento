// Spec 036, Befund 2.2 (V-2, Teil 2 von 2): the synthetic material of the Zweitfarbe. The
// two-colour inspiration image of Spec 035, Befund 4.2 – orange-red with a strong turquoise on white
// – as Weg A and Weg B read it; the same with a darker tone of the orange instead of the turquoise
// (too close to the lead colour); an achromatic image with a pastel or a bright yellow; a PDF with
// the two colours; and for Weg C a screenshot of page A (weg-c.ts) in which the orange of its CSS
// also covers a large block, so the page has two defining colours. All values are invented.

import { deflateSync } from "node:zlib";
import type { Bildo } from "../enportilo/png.js";
import { encodePng } from "./png.js";
import { NEBEN, PRAEGEND } from "./weg-c.js";

/** The lead colour of the two-colour image. */
export const ORANGEROT = "#e4572e";
/** The second strong colour of the two-colour image: clearly apart from the orange-red. */
export const TUERKIS = "#17b3a8";
/** A darker tone of the orange-red: strong, a fair share, but the same colour. */
export const SCHATTEN = "#b03e1c";
/** The ink of an achromatic image. */
export const TINTE = "#111111";
/** A pastel: colourful, but pale. */
export const PASTELL = "#f6c1cc";
/** A bright, light yellow: no strong colour by the rule of an achromatic brand, but far from grey. */
export const GELB = "#ffd800";

const rgba = (hex: string): number[] => [
  Number.parseInt(hex.slice(1, 3), 16),
  Number.parseInt(hex.slice(3, 5), 16),
  Number.parseInt(hex.slice(5, 7), 16),
  255,
];
const WEISS = "#fafaf8";

/**
 * 20 × 20 px: 60 % orange-red, then `second` on `rows` rows (5 rows = 25 %), the rest white – the
 * picture of the accent test of Spec 035, Befund 4.2.
 */
export const zweifarbigPng = (second = TUERKIS, rows = 5): Buffer =>
  encodePng(20, 20, (_x, y) => rgba(y < 12 ? ORANGEROT : y < 12 + rows ? second : WEISS));

/** 20 × 20 px: 50 % ink, 30 % `second`, 20 % white – an achromatic brand with one other tone. */
export const unbuntPng = (second: string): Buffer =>
  encodePng(20, 20, (_x, y) => rgba(y < 10 ? TINTE : y < 16 ? second : WEISS));

/** A style guide as PDF: the orange-red six times as a fill, the turquoise three times. */
export function zweifarbigPdf(): Buffer {
  const fill = (hex: string) =>
    `${rgba(hex)
      .slice(0, 3)
      .map((channel) => (channel / 255).toFixed(3))
      .join(" ")} rg 0 0 10 10 re f`;
  const content = [...Array(6).fill(fill(ORANGEROT)), ...Array(3).fill(fill(TUERKIS))].join(" ");
  const stream = deflateSync(Buffer.from(content, "latin1"));
  return Buffer.concat([
    Buffer.from("%PDF-1.4\n1 0 obj << /Length "),
    Buffer.from(`${stream.length} /Filter /FlateDecode >>\nstream\n`),
    stream,
    Buffer.from("\nendstream\nendobj\n%%EOF\n"),
  ]);
}

/**
 * Page A (weg-c.ts) at 1/8 of the viewport 1280 × 800 with two defining colours: the logo and the
 * hero in its teal, below it a large block in the orange of its CSS, the rest white.
 */
export function bildschirmZweifarbig(): Bildo {
  const width = 160;
  const height = 100;
  const pixels = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const hex =
        y < 8 && x >= 2 && x < 22
          ? PRAEGEND
          : y >= 11 && y < 76
            ? PRAEGEND
            : y >= 76 && y < 96
              ? NEBEN
              : "#ffffff";
      pixels.set(rgba(hex), (y * width + x) * 4);
    }
  return { width, height, rgba: pixels };
}
