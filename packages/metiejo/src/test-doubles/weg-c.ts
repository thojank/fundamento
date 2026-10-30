// Spec 035, Befund 4.1 and 4.5.6: the synthetic pages and images of Weg C (fixtures in weg-c/).
// Page A: an invented brand whose defining colour stands only in a large image and in the logo,
// while a secondary colour is the most frequent colour of its CSS. Page B: a bot challenge instead
// of the page. Served under the reserved domain marko.example (RFC 2606) through a fetch double:
// no network. The synthetic screenshot is page A at 1/8 of the viewport, as a renderer double
// returns it.

import { readFileSync } from "node:fs";
import type { Bildo } from "../enportilo/png.js";

export const MARKO_URL = "https://marko.example/";
/** The defining colour of page A: only in held.png and logo.svg. */
export const PRAEGEND = "#0b7285";
/** The secondary colour of page A: the most frequent colour of stilo.css. */
export const NEBEN = "#d9480f";
/** The logo of page A in CSS px (header padding 16 px, 160 × 48). */
export const LOGO_A = { x: 16, y: 16, width: 160, height: 48 };

export const fixture = (name: string): Buffer =>
  readFileSync(new URL(`./weg-c/${name}`, import.meta.url));

const TYPES: Readonly<Record<string, string>> = {
  html: "text/html; charset=utf-8",
  css: "text/css",
  svg: "image/svg+xml",
  png: "image/png",
};
const PAGE_A: Readonly<Record<string, string>> = {
  "/": "seite-a.html",
  "/marke": "marke.html",
  "/stilo.css": "stilo.css",
  "/logo.svg": "logo.svg",
  "/held.png": "held.png",
};

/** Page A and its files under https://marko.example/; everything else 404. */
export async function fetchA(url: string): Promise<Response> {
  const target = new URL(url);
  const file = target.host === "marko.example" ? PAGE_A[target.pathname] : undefined;
  if (file === undefined) return new Response("nicht da", { status: 404 });
  return new Response(new Uint8Array(fixture(file)), {
    status: 200,
    headers: { "content-type": TYPES[file.split(".").pop() ?? ""] ?? "application/octet-stream" },
  });
}

/** Page B: a challenge answer with the given status for every address. */
export const fetchB =
  (status: number) =>
  async (_url: string): Promise<Response> =>
    new Response(new Uint8Array(fixture("seite-b.html")), {
      status,
      headers: { "content-type": "text/html; charset=utf-8", "cf-mitigated": "challenge" },
    });

function bildo(
  width: number,
  height: number,
  pixel: (x: number, y: number) => readonly [number, number, number],
): Bildo {
  const rgba = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) rgba.set([...pixel(x, y), 255], (y * width + x) * 4);
  return { width, height, rgba };
}

const TEAL = [0x0b, 0x72, 0x85] as const;
const ORANGE = [0xd9, 0x48, 0x0f] as const;
const WHITE = [0xff, 0xff, 0xff] as const;
const TEXT = [0x1f, 0x23, 0x28] as const;

/**
 * Page A as Chromium shows it in the viewport 1280 × 800, at 1/8: the header with the logo, the
 * orange line under it, the image (480 px), the heading, a line of text and the orange button.
 */
export const bildschirmA = (): Bildo =>
  bildo(160, 100, (x, y) => {
    const inLogo = x >= 2 && x < 22 && y >= 2 && y < 8;
    if (inLogo) return y === 4 && x >= 4 && x < 16 ? WHITE : TEAL;
    if (y === 10) return ORANGE;
    if (y >= 11 && y < 71) return TEAL;
    if (y >= 74 && y < 78 && x >= 3 && x < 30) return ORANGE;
    if (y >= 80 && y < 82 && x >= 3 && x < 120) return TEXT;
    if (y >= 85 && y < 90 && x >= 3 && x < 20) return ORANGE;
    return WHITE;
  });

/** An empty white page (the brand page of page A). */
export const blanka = (): Bildo => bildo(160, 100, () => WHITE);

/** The synthetic photo of bild.jpg and bild.webp as decoded: 2/3 teal, 1/3 warm light. */
export const bildoFoto = (): Bildo => bildo(96, 64, (x) => (x < 64 ? TEAL : [0xf3, 0xe6, 0xcf]));
