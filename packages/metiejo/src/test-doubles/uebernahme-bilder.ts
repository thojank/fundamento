// Spec 036 Teil 4 (Befund 4.1, Rest): one invented screenshot per step with a known target, in the
// colours of the invented brand „Sablo“ (test-doubles/uebernahme.ts). Form: two buttons in the lead
// colour whose corner radius is a known share of their height (stage 1 of the Form, and the pill);
// a rounded card without a button (form open). Elevation: a card with a soft shadow band under it,
// and the same card flat. Density: three text blocks far apart (airy) and five close together
// (compact). Drawn without anti-aliasing: a pixel belongs to a shape when its centre does. A page
// with its stylesheet for the same steps from a link (radius, padding, shadow).

import { encodePng } from "./png.js";
import { GRUND_HELL } from "./uebernahme.js";

export interface Rechteck {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  farbe: string;
  /** Rows of a soft shadow under the shape, darkest first; none without. */
  schatten?: number;
}

export interface Bild {
  width: number;
  height: number;
  grund: string;
  rechtecke: readonly Rechteck[];
  /** Smoothed edges, as in a screenshot (not in the committed pictures). */
  glatt?: boolean;
}

const rgbOf = (hex: string): [number, number, number] => [
  Number.parseInt(hex.slice(1, 3), 16),
  Number.parseInt(hex.slice(3, 5), 16),
  Number.parseInt(hex.slice(5, 7), 16),
];

/** Whether the point (px, py) lies in the rounded rectangle. */
function inside(rechteck: Rechteck, px: number, py: number): boolean {
  if (px < rechteck.x || py < rechteck.y) return false;
  if (px > rechteck.x + rechteck.width || py > rechteck.y + rechteck.height) return false;
  const r = rechteck.radius;
  const cx = Math.min(Math.max(px, rechteck.x + r), rechteck.x + rechteck.width - r);
  const cy = Math.min(Math.max(py, rechteck.y + r), rechteck.y + rechteck.height - r);
  return Math.hypot(px - cx, py - cy) <= r;
}

/** The strongest darkening of the first shadow row; each further row a step lighter. */
const SCHATTEN_ALPHA = 0.14;

/** The share of black a shadow row lays on what is under it, 0 outside a shadow. */
function shadowOf(rechteck: Rechteck, x: number, y: number): number {
  const rows = rechteck.schatten ?? 0;
  const below = y - (rechteck.y + rechteck.height) + 1;
  if (rows === 0 || below < 1 || below > rows) return 0;
  if (x < rechteck.x + rechteck.radius || x >= rechteck.x + rechteck.width - rechteck.radius)
    return 0;
  return SCHATTEN_ALPHA * (1 - (below - 1) / rows);
}

/** The colour at the point (px, py): the ground, then each shape with its shadow, later on top. */
function colourAt(bild: Bild, px: number, py: number): [number, number, number] {
  let colour = rgbOf(bild.grund);
  for (const rechteck of bild.rechtecke) {
    const alpha = shadowOf(rechteck, Math.floor(px), Math.floor(py));
    if (alpha > 0)
      colour = colour.map((channel) => Math.round(channel * (1 - alpha))) as typeof colour;
    if (inside(rechteck, px, py)) colour = rgbOf(rechteck.farbe);
  }
  return colour;
}

/** Samples per pixel edge of a smoothed picture (4 × 4), as a browser smooths a rounded corner. */
const GLATT = 4;

/**
 * The picture as a PNG. A pixel belongs to a shape when its centre does; a smoothed picture
 * (`glatt`) mixes the colours of 4 × 4 points per pixel instead, like the edges of a screenshot.
 */
export function bildPng(bild: Bild): Buffer {
  return encodePng(bild.width, bild.height, (x, y) => {
    if (bild.glatt !== true) return [...colourAt(bild, x + 0.5, y + 0.5), 255];
    const sum = [0, 0, 0];
    for (let i = 0; i < GLATT; i++)
      for (let j = 0; j < GLATT; j++) {
        const colour = colourAt(bild, x + (i + 0.5) / GLATT, y + (j + 0.5) / GLATT);
        for (let k = 0; k < 3; k++) sum[k] = (sum[k] ?? 0) + (colour[k] ?? 0);
      }
    return [...sum.map((value) => Math.round(value / (GLATT * GLATT))), 255];
  });
}

const TEXT = "#3d3427";
const { grund, flaeche, leitfarbe } = GRUND_HELL;

/** Two buttons 32 px high (size.control.medium) with radius 10 px: 0.31 of the height, stage 1. */
export const FORM_KNOPF: Bild = {
  width: 240,
  height: 160,
  grund,
  rechtecke: [
    { x: 24, y: 64, width: 96, height: 32, radius: 10, farbe: leitfarbe },
    { x: 136, y: 64, width: 80, height: 32, radius: 10, farbe: leitfarbe },
  ],
};

/** The same buttons fully round (radius half the height): the pill. */
export const FORM_PILLE: Bild = {
  ...FORM_KNOPF,
  rechtecke: FORM_KNOPF.rechtecke.map((rechteck) => ({ ...rechteck, radius: 16 })),
};

/** A rounded card on the ground and no button: the form cannot be told (edge case). */
export const FORM_KARTE: Bild = {
  width: 240,
  height: 160,
  grund,
  rechtecke: [{ x: 40, y: 30, width: 160, height: 90, radius: 12, farbe: flaeche }],
};

/** A card with a soft shadow band of six rows under it. */
export const ELEVATION_SCHATTEN: Bild = {
  width: 240,
  height: 160,
  grund,
  rechtecke: [{ x: 40, y: 30, width: 160, height: 80, radius: 8, farbe: flaeche, schatten: 6 }],
};

/** The same card without a shadow. */
export const ELEVATION_FLACH: Bild = {
  ...ELEVATION_SCHATTEN,
  rechtecke: [{ x: 40, y: 30, width: 160, height: 80, radius: 8, farbe: flaeche }],
};

const bloecke = (count: number, height: number, gap: number, top: number): Rechteck[] =>
  Array.from({ length: count }, (_, index) => ({
    x: 30,
    y: top + index * (height + gap),
    width: 180,
    height,
    radius: 0,
    farbe: TEXT,
  }));

/** Three text blocks 16 px high, 30 px apart: the space is about twice the block (airy). */
export const DICHTE_LUFTIG: Bild = {
  width: 240,
  height: 200,
  grund,
  rechtecke: bloecke(3, 16, 30, 40),
};

/** Five text blocks 20 px high, 4 px apart: the space is a fifth of the block (compact). */
export const DICHTE_KOMPAKT: Bild = {
  width: 240,
  height: 200,
  grund,
  rechtecke: bloecke(5, 20, 4, 40),
};

/** The targets per picture, as the tests and the material run read them. */
export const BILD_ZIELE = {
  "form-knopf.png": { bild: FORM_KNOPF, schritt: "form", ziel: { radius: 1, pille: false } },
  "form-pille.png": { bild: FORM_PILLE, schritt: "form", ziel: { radius: 2, pille: true } },
  "form-karte.png": { bild: FORM_KARTE, schritt: "form", ziel: "offen" },
  "elevation-schatten.png": {
    bild: ELEVATION_SCHATTEN,
    schritt: "elevation",
    ziel: { schatten: true },
  },
  "elevation-flach.png": { bild: ELEVATION_FLACH, schritt: "elevation", ziel: { schatten: false } },
  "dichte-luftig.png": { bild: DICHTE_LUFTIG, schritt: "dichte", ziel: { dichte: "luftig" } },
  "dichte-kompakt.png": { bild: DICHTE_KOMPAKT, schritt: "dichte", ziel: { dichte: "kompakt" } },
} as const;

/** The page of Sablo for the steps form, elevation and density from a link. */
export const STUFEN_HTML =
  '<!doctype html><html lang="de"><head><title>Sablo</title><link rel="stylesheet" href="/stufen.css"></head><body><main><div class="karte"><a class="knopf" href="/">Sablo</a></div></main></body></html>';
export const STUFEN_CSS = `body { background: ${grund}; }
.karte { background: ${flaeche}; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12); }
.knopf { background: ${leitfarbe}; border-radius: 6px; padding: 8px; }
`;

/** The committed copies of the pictures (uebernahme/), for the Messanleitung and the material run. */
export const BILD_FIXTURES: Readonly<Record<string, () => Buffer>> = Object.fromEntries(
  Object.entries(BILD_ZIELE).map(([name, entry]) => [name, () => bildPng(entry.bild)]),
);
