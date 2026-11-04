// Spec 036, Befund 2.1 (V-1): the synthetic material of an achromatic brand (fixtures in unbunt/).
// The invented brand „Inko“ is black, white and cream; three small pastel accents are the only
// colours. Weg B reads its screenshot (unbunt/bild.png), Weg C its page (unbunt/seite.html with
// stilo.css and logo.svg) under the reserved domain inko.example (RFC 2606) through a fetch double:
// no network. The renderer double returns the same screenshot that bild.png holds, at 1/8 of the
// viewport 1280 × 800, as the double of page A does (weg-c.ts).

import { readFileSync } from "node:fs";
import type { Bildo } from "../enportilo/png.js";

export const INKO_URL = "https://inko.example/";
/** The ink of the brand: logo, header line, the black hero, headings and text. */
export const INKO = "#111111";
/** The cream of the page and the white of header and footer. */
export const KREMO = "#f5f0e6";
export const BLANKA = "#ffffff";
/** The three small pastel accents: the only colours of the brand, none of them its lead. */
export const PASTELOJ = ["#f6c1cc", "#cdbff0", "#f9d9b8"] as const;
/** The logo of the page in CSS px (header padding 16 px, 160 × 48). */
export const LOGO_INKO = { x: 16, y: 16, width: 160, height: 48 };

export const unbuntFixture = (name: string): Buffer =>
  readFileSync(new URL(`./unbunt/${name}`, import.meta.url));

const TYPES: Readonly<Record<string, string>> = {
  html: "text/html; charset=utf-8",
  css: "text/css",
  svg: "image/svg+xml",
};
const PAGE: Readonly<Record<string, string>> = {
  "/": "seite.html",
  "/stilo.css": "stilo.css",
  "/logo.svg": "logo.svg",
};

/** The page of Inko and its files under https://inko.example/; everything else 404. */
export async function fetchInko(url: string): Promise<Response> {
  const target = new URL(url);
  const file = target.host === "inko.example" ? PAGE[target.pathname] : undefined;
  if (file === undefined) return new Response("nicht da", { status: 404 });
  return new Response(new Uint8Array(unbuntFixture(file)), {
    status: 200,
    headers: { "content-type": TYPES[file.split(".").pop() ?? ""] ?? "application/octet-stream" },
  });
}

const rgb = (hex: string): readonly [number, number, number] => [
  Number.parseInt(hex.slice(1, 3), 16),
  Number.parseInt(hex.slice(3, 5), 16),
  Number.parseInt(hex.slice(5, 7), 16),
];

const INK = rgb(INKO);
const CREAM = rgb(KREMO);
const WHITE = rgb(BLANKA);
const [PINK, LAVENDER, PEACH] = PASTELOJ.map(rgb) as [
  ReturnType<typeof rgb>,
  ReturnType<typeof rgb>,
  ReturnType<typeof rgb>,
];

/**
 * One pixel of the page as Chromium shows it in the viewport 1280 × 800, at 1/8: the white header
 * with the black logo and a black line under it, the black hero with a line of white text, the
 * cream body with a black heading and two lines of text, three small pastel badges, the white
 * footer with a line of text.
 */
export function inkoPixel(x: number, y: number): readonly [number, number, number] {
  if (y < 10) {
    const inLogo = x >= 2 && x < 22 && y >= 2 && y < 8;
    if (inLogo) return y === 4 && x >= 4 && x < 16 ? WHITE : INK;
    return WHITE;
  }
  if (y === 10) return INK;
  if (y < 46) return y >= 28 && y < 30 && x >= 20 && x < 100 ? WHITE : INK;
  if (y >= 50 && y < 54 && x >= 3 && x < 60) return INK;
  if ((y === 58 || y === 59 || y === 62 || y === 63) && x >= 3 && x < 120) return INK;
  if (y >= 66 && y < 76) {
    if (x >= 3 && x < 15) return PINK;
    if (x >= 20 && x < 30) return LAVENDER;
    if (x >= 35 && x < 45) return PEACH;
  }
  if (y >= 80) return y >= 88 && y < 90 && x >= 3 && x < 80 ? INK : WHITE;
  return CREAM;
}

/** The screenshot of the page (and the content of unbunt/bild.png): 160 × 100. */
export const bildschirmInko = (): Bildo => {
  const width = 160;
  const height = 100;
  const rgba = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) rgba.set([...inkoPixel(x, y), 255], (y * width + x) * 4);
  return { width, height, rgba };
};
