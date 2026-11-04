// Spec 036, Befund 2.3: the synthetic page of an invented brand for the picture weight of Weg C
// (fixtures in foto/). The defining colour of „Ruvelo“ stands only in a large product photo of the
// first screen; the background of the page is another colour and fills three screens. The photo is
// an image (seite-img.html), a background image (seite-hintergrund.html) or a picture element
// (seite-picture.html). Served under the reserved domain ruvelo.example (RFC 2606) through a fetch
// double: no network. The renderer double returns the page as Chromium shows it, at 1/8 of the
// viewport 1280 × 800 and three screens high, with the box of the photo.

import { readFileSync } from "node:fs";
import type { Bildo } from "../enportilo/png.js";

export const FOTO_URL = "https://ruvelo.example/";
/** The three pages: the photo as img, as background image, in a picture element. */
export const FOTO_SEITOJ = {
  img: FOTO_URL,
  hintergrund: `${FOTO_URL}hintergrund`,
  picture: `${FOTO_URL}picture`,
} as const;
/** The defining colour of the brand: only in the product of produkt.png. */
export const PRODUKT = "#c2255c";
/** The background of the page: another colour, in the CSS and on three screens. */
export const HINTERGRUND = "#5f86a8";
/** The ink of logo and text, and the light studio backdrop of the photo. */
export const TINTE = "#1d2433";
export const STUDIO = "#ebe7e1";
/** The logo in CSS px (header padding 16 px, 160 × 48). */
export const LOGO_FOTO = { x: 16, y: 16, width: 160, height: 48 };
/** The photo in CSS px: 720 × 600 at the right of the first screen, 42 % of the viewport. */
export const FOTO_KESTO = { x: 520, y: 80, width: 720, height: 600 };

export const fotoFixture = (name: string): Buffer =>
  readFileSync(new URL(`./foto/${name}`, import.meta.url));

const TYPES: Readonly<Record<string, string>> = {
  html: "text/html; charset=utf-8",
  css: "text/css",
  svg: "image/svg+xml",
  png: "image/png",
};
const PAGE: Readonly<Record<string, string>> = {
  "/": "seite-img.html",
  "/hintergrund": "seite-hintergrund.html",
  "/picture": "seite-picture.html",
  "/stilo.css": "stilo.css",
  "/logo.svg": "logo.svg",
  "/produkt.png": "produkt.png",
};

/** The pages of Ruvelo and their files under https://ruvelo.example/; everything else 404. */
export async function fetchFoto(url: string): Promise<Response> {
  const target = new URL(url);
  const file = target.host === "ruvelo.example" ? PAGE[target.pathname] : undefined;
  if (file === undefined) return new Response("nicht da", { status: 404 });
  return new Response(new Uint8Array(fotoFixture(file)), {
    status: 200,
    headers: { "content-type": TYPES[file.split(".").pop() ?? ""] ?? "application/octet-stream" },
  });
}

const rgb = (hex: string): readonly [number, number, number] => [
  Number.parseInt(hex.slice(1, 3), 16),
  Number.parseInt(hex.slice(3, 5), 16),
  Number.parseInt(hex.slice(5, 7), 16),
];
const PRODUCT = rgb(PRODUKT);
const BACKGROUND = rgb(HINTERGRUND);
const INK = rgb(TINTE);
const BACKDROP = rgb(STUDIO);
const WHITE = rgb("#ffffff");

/** One pixel of produkt.png (72 × 60, shown ten times as large): the product on the backdrop. */
export function produktPixel(x: number, y: number): readonly [number, number, number] {
  return x >= 10 && x < 62 && y >= 6 && y < 60 ? PRODUCT : BACKDROP;
}

/**
 * One pixel of the page as Chromium shows it, at 1/8 of the viewport 1280 × 800, three screens
 * high: the logo in the header, the heading, the photo, two lines of text, the background.
 */
export function fotoSeitePixel(x: number, y: number): readonly [number, number, number] {
  if (x >= 2 && x < 22 && y >= 2 && y < 8) return y === 4 && x >= 4 && x < 16 ? WHITE : INK;
  const photo = FOTO_KESTO;
  const left = photo.x / 8;
  const top = photo.y / 8;
  if (x >= left && x < (photo.x + photo.width) / 8 && y >= top && y < (photo.y + photo.height) / 8)
    return produktPixel(Math.floor((x - left) * 0.8), Math.floor((y - top) * 0.8));
  if (y >= 15 && y < 19 && x >= 5 && x < 25) return INK;
  if ((y === 89 || y === 92) && x >= 5 && x < 110) return INK;
  return BACKGROUND;
}

/** The screenshot of the page as the renderer double returns it: 160 × 300. */
export const bildschirmFoto = (): Bildo => {
  const width = 160;
  const height = 300;
  const rgba = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) rgba.set([...fotoSeitePixel(x, y), 255], (y * width + x) * 4);
  return { width, height, rgba };
};
