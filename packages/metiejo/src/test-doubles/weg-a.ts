// The inspiration of the acceptance script of Weg A (scripts/abnahme-weg-a.ts): what the entry
// questions send – a few sentences, the character, two synthetic images. Built here so a unit test
// reads the very images the script uploads (Spec 036, Befund 1.5, D-99).

import { encodePng } from "./png.js";

export const CELO_WEG_A =
  "Eine Bäckerei für die Nachbarschaft. Ehrliches Brot, früh am Morgen gebacken. Für Familien und Leute auf dem Weg zur Arbeit. Warm und freundlich, nicht schick. Man soll sich willkommen fühlen.";

export const KARAKTERO_WEG_A: Readonly<Record<string, number>> = {
  "ruhig-lebhaft": -1,
  "klassisch-modern": -1,
  "warm-kuehl": -2,
  "sachlich-verspielt": 1,
  "leicht-kraeftig": 0,
};

type Rgba = [number, number, number, number];
const bild = (pixel: (x: number, y: number) => Rgba) => encodePng(48, 32, pixel);

/** The two inspiration images of Weg A, 48 × 32 px each, as PNG. */
export function inspiroWegA(): { filename: string; bytes: Buffer }[] {
  return [
    {
      filename: "kruste.png",
      bytes: bild((_x, y) => (y < 20 ? [0x9c, 0x5a, 0x2b, 255] : [0xf3, 0xe6, 0xcf, 255])),
    },
    {
      filename: "weizen.png",
      bytes: bild((x) => (x < 16 ? [0xd9, 0xa4, 0x41, 255] : [0xfa, 0xf4, 0xea, 255])),
    },
  ];
}
