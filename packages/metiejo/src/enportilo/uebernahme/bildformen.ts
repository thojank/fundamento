// The shapes of an image for the take-over (Spec 036 Teil 4, Befund 4.1): what the steps Form,
// Elevation and Dichte read in a screenshot. The ground is the most frequent colour; every other
// colour (5 bits per channel) is split into connected areas. An area that fills its bounding box
// apart from four rounded corners, with straight edges and a contrast to what is around it, is a
// shape: a button (low, wide, of a strong colour) or a card (large). Its corner radius comes from the
// area the corners miss: four quarter circles of radius r miss (4 − π)·r². A shadow is a soft band
// under a shape: two or more rows darker than the ground, lighter row by row. The spacing is coarse:
// the rows (and columns) holding something other than the ground are blocks, the rows between them
// gaps. Thresholds in kreilo.json › uebernahme.bild. Pure; the result is kept per image.

import type { Bildo } from "../png.js";
import { hexOf } from "../trovo.js";
import { UEBERNAHME } from "./datoj.js";

export interface Forma {
  art: "knopf" | "karte";
  x: number;
  y: number;
  width: number;
  height: number;
  /** The colour of the shape, #rrggbb. */
  farbe: string;
  /** The corner radius in px, one decimal. */
  radius: number;
  /** Rows of a soft shadow under the shape; 0 without. */
  schatten: number;
}

export interface Abstaende {
  /** Heights (rows) and widths (columns) of the blocks, in px. */
  bloecke: number[];
  /** The gaps between them, in px. */
  luecken: number[];
}

export interface BildAnalyse {
  grund: string;
  formen: Forma[];
  abstaende: Abstaende;
}

/** OKLab of an sRGB colour (0–255 per channel). */
export function oklabOf(r: number, g: number, b: number): [number, number, number] {
  const linear = (value: number) => {
    const v = value / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [lr, lg, lb] = [linear(r), linear(g), linear(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const distance = (a: [number, number, number], b: [number, number, number]) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const median = (values: readonly number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? (sorted[middle] ?? 0)
    : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
};

export { median };

interface Flaeche {
  label: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  count: number;
  r: number;
  g: number;
  b: number;
}

/** The colour key of a pixel (5 bits per channel), -1 for a transparent one. */
function keysOf(bildo: Bildo): Int32Array {
  const keys = new Int32Array(bildo.width * bildo.height);
  for (let index = 0; index < keys.length; index++) {
    const at = index * 4;
    keys[index] =
      (bildo.rgba[at + 3] ?? 0) < 128
        ? -1
        : (((bildo.rgba[at] ?? 0) >> 3) << 10) |
          (((bildo.rgba[at + 1] ?? 0) >> 3) << 5) |
          ((bildo.rgba[at + 2] ?? 0) >> 3);
  }
  return keys;
}

function groundKeyOf(keys: Int32Array): number {
  const counts = new Int32Array(1 << 15);
  for (const key of keys) if (key >= 0) counts[key] = (counts[key] ?? 0) + 1;
  let best = 0;
  for (let key = 1; key < counts.length; key++)
    if ((counts[key] ?? 0) > (counts[best] ?? 0)) best = key;
  return best;
}

/** The connected areas (4-neighbours, same key) other than the ground, of at least `min` pixels. */
function flaechenOf(bildo: Bildo, keys: Int32Array, ground: number, min: number) {
  const { width, height } = bildo;
  const labels = new Int32Array(keys.length);
  const stack = new Int32Array(keys.length);
  const found: Flaeche[] = [];
  let next = 0;
  for (let start = 0; start < keys.length; start++) {
    const key = keys[start] ?? -1;
    if (labels[start] !== 0 || key === ground || key < 0) continue;
    next += 1;
    const area: Flaeche = {
      label: next,
      minX: width,
      maxX: 0,
      minY: height,
      maxY: 0,
      count: 0,
      r: 0,
      g: 0,
      b: 0,
    };
    let top = 0;
    stack[top++] = start;
    labels[start] = next;
    while (top > 0) {
      const index = stack[--top] ?? 0;
      const x = index % width;
      const y = (index - x) / width;
      area.count += 1;
      area.r += bildo.rgba[index * 4] ?? 0;
      area.g += bildo.rgba[index * 4 + 1] ?? 0;
      area.b += bildo.rgba[index * 4 + 2] ?? 0;
      if (x < area.minX) area.minX = x;
      if (x > area.maxX) area.maxX = x;
      if (y < area.minY) area.minY = y;
      if (y > area.maxY) area.maxY = y;
      const neighbours = [
        x > 0 ? index - 1 : -1,
        x < width - 1 ? index + 1 : -1,
        y > 0 ? index - width : -1,
        y < height - 1 ? index + width : -1,
      ];
      for (const neighbour of neighbours) {
        if (neighbour < 0 || labels[neighbour] !== 0 || keys[neighbour] !== key) continue;
        labels[neighbour] = next;
        stack[top++] = neighbour;
      }
    }
    if (area.count >= min) found.push(area);
  }
  return { labels, found };
}

/** The mean OKLab of a row segment. */
function rowLab(bildo: Bildo, y: number, from: number, to: number): [number, number, number] {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let x = from; x <= to; x++) {
    const at = (y * bildo.width + x) * 4;
    r += bildo.rgba[at] ?? 0;
    g += bildo.rgba[at + 1] ?? 0;
    b += bildo.rgba[at + 2] ?? 0;
    n += 1;
  }
  return n === 0 ? [0, 0, 0] : oklabOf(r / n, g / n, b / n);
}

/**
 * The area the corners of a shape miss, in px: per row from the left and from the right, each pixel
 * counts by how little of the shape's colour it holds (a smoothed edge mixes the shape with what is
 * around it), up to the first pixel fully of the shape. Crisp edges count whole pixels.
 */
function missingOf(
  bildo: Bildo,
  area: Flaeche,
  colour: readonly [number, number, number],
  around: readonly [number, number, number],
): number {
  const direction = colour.map((channel, k) => channel - (around[k] ?? 0));
  const norm = direction.reduce((sum, value) => sum + value * value, 0);
  if (norm === 0) return 0;
  const coverage = (x: number, y: number) => {
    const at = (y * bildo.width + x) * 4;
    let dot = 0;
    for (let k = 0; k < 3; k++)
      dot += ((bildo.rgba[at + k] ?? 0) - (around[k] ?? 0)) * (direction[k] ?? 0);
    return Math.min(1, Math.max(0, dot / norm));
  };
  let missing = 0;
  for (let y = area.minY; y <= area.maxY; y++) {
    let left = area.minX;
    for (; left <= area.maxX; left++) {
      const covered = coverage(left, y);
      if (covered >= FULL) break;
      missing += 1 - covered;
    }
    for (let x = area.maxX; x > left; x--) {
      const covered = coverage(x, y);
      if (covered >= FULL) break;
      missing += 1 - covered;
    }
  }
  return missing;
}

/** A pixel this close to the shape's colour belongs to it wholly (the 5-bit key allows as much). */
const FULL = 0.9;

/** Rows of a soft shadow under the shape: darker than around it, lighter row by row. */
function shadowRows(bildo: Bildo, area: Flaeche, around: [number, number, number]): number {
  const data = UEBERNAHME.bild;
  const width = area.maxX - area.minX + 1;
  const from = area.minX + Math.floor(width / 4);
  const to = area.maxX - Math.floor(width / 4);
  let rows = 0;
  let last = Number.NEGATIVE_INFINITY;
  for (let k = 1; k <= data.schatten_zeilen_max; k++) {
    const y = area.maxY + k;
    if (y >= bildo.height) break;
    const lab = rowLab(bildo, y, from, to);
    const darker = around[0] - lab[0];
    // A shadow darkens, and only a little: a dark row below is a border or the next element.
    if (darker < data.schatten_dunkler_ab || darker > data.schatten_dunkler_max) break;
    if (lab[0] < last - 0.002) break;
    last = lab[0];
    rows += 1;
  }
  return rows >= data.schatten_zeilen_min ? rows : 0;
}

/** The runs of rows (or columns) holding something besides the ground, without the margins. */
function runsOf(
  busy: readonly boolean[],
  minGap: number,
): { bloecke: number[]; luecken: number[] } {
  const first = busy.indexOf(true);
  const last = busy.lastIndexOf(true);
  if (first === -1) return { bloecke: [], luecken: [] };
  const runs: { busy: boolean; length: number }[] = [];
  for (let index = first; index <= last; index++) {
    const value = busy[index] ?? false;
    const current = runs[runs.length - 1];
    if (current !== undefined && current.busy === value) current.length += 1;
    else runs.push({ busy: value, length: 1 });
  }
  // A gap of a pixel or two is the edge of a letter, not a space between blocks.
  const merged: { busy: boolean; length: number }[] = [];
  for (const run of runs) {
    const previous = merged[merged.length - 1];
    if (!run.busy && run.length < minGap && previous !== undefined) previous.length += run.length;
    else if (run.busy && previous?.busy === true) previous.length += run.length;
    else merged.push({ ...run });
  }
  return {
    bloecke: merged.filter((run) => run.busy).map((run) => run.length),
    luecken: merged.filter((run) => !run.busy).map((run) => run.length),
  };
}

function abstaendeOf(bildo: Bildo, keys: Int32Array, ground: number): Abstaende {
  const data = UEBERNAHME.bild;
  const { width, height } = bildo;
  const rows = new Array<number>(height).fill(0);
  const columns = new Array<number>(width).fill(0);
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index] ?? -1;
    if (key === ground || key < 0) continue;
    const x = index % width;
    rows[(index - x) / width] = (rows[(index - x) / width] ?? 0) + 1;
    columns[x] = (columns[x] ?? 0) + 1;
  }
  const result: Abstaende = { bloecke: [], luecken: [] };
  for (const [counts, size] of [
    [rows, width],
    [columns, height],
  ] as const) {
    const runs = runsOf(
      counts.map((count) => count / size >= data.belegt_ab),
      data.luecke_min_px,
    );
    if (runs.bloecke.length < 2) continue;
    result.bloecke.push(...runs.bloecke);
    result.luecken.push(...runs.luecken);
  }
  return result;
}

const cache = new WeakMap<Bildo, BildAnalyse>();

/** The ground, the shapes and the spacing of an image. */
export function bildAnalyseOf(bildo: Bildo): BildAnalyse {
  const known = cache.get(bildo);
  if (known !== undefined) return known;
  const data = UEBERNAHME.bild;
  const { width, height } = bildo;
  const keys = keysOf(bildo);
  const ground = groundKeyOf(keys);
  const groundRgb = [(ground >> 10) << 3, ((ground >> 5) & 31) << 3, (ground & 31) << 3] as const;
  const min = Math.max(data.flaeche_min_px, Math.round(data.flaeche_min * width * height));
  const { labels, found } = flaechenOf(bildo, keys, ground, min);
  const formen: Forma[] = [];
  for (const area of found) {
    const w = area.maxX - area.minX + 1;
    const h = area.maxY - area.minY + 1;
    // Bands across the whole picture are the ground's stripes, not shapes on it.
    if (area.minX === 0 || area.minY === 0 || area.maxX === width - 1 || area.maxY === height - 1)
      continue;
    let spans = 0;
    for (let y = area.minY; y <= area.maxY; y++) {
      let left = -1;
      let right = -1;
      for (let x = area.minX; x <= area.maxX; x++) {
        if (labels[y * width + x] !== area.label) continue;
        if (left === -1) left = x;
        right = x;
      }
      if (left !== -1) spans += right - left + 1;
    }
    if (spans / (w * h) < data.fuellung_min) continue;
    // Straight edges: the middle row and the middle column run through the whole box.
    const midY = area.minY + Math.floor(h / 2);
    const midX = area.minX + Math.floor(w / 2);
    if (labels[midY * width + area.minX] !== area.label) continue;
    if (labels[midY * width + area.maxX] !== area.label) continue;
    if (labels[area.minY * width + midX] !== area.label) continue;
    if (labels[area.maxY * width + midX] !== area.label) continue;
    const colour: [number, number, number] = [
      area.r / area.count,
      area.g / area.count,
      area.b / area.count,
    ];
    const ax = area.minX >= 2 ? area.minX - 2 : area.maxX + 2;
    const at = (midY * width + Math.min(width - 1, ax)) * 4;
    const aroundRgb: [number, number, number] = [
      bildo.rgba[at] ?? groundRgb[0],
      bildo.rgba[at + 1] ?? groundRgb[1],
      bildo.rgba[at + 2] ?? groundRgb[2],
    ];
    const around = oklabOf(...aroundRgb);
    const radius = Math.min(
      Math.sqrt(missingOf(bildo, area, colour, aroundRgb) / (4 - Math.PI)),
      Math.min(w, h) / 2,
    );
    const contrast = distance(oklabOf(...colour), around);
    const ratio = w / h;
    const knopf =
      h >= data.knopf_hoehe_min_px &&
      h <= data.knopf_hoehe_max * height &&
      ratio >= data.knopf_seiten_min &&
      ratio <= data.knopf_seiten_max &&
      contrast >= data.kontrast_knopf;
    // An area over nearly the whole picture is the page (or its content area), not a card on it.
    const karte =
      !knopf &&
      w >= data.karte_min * width &&
      h >= data.karte_min * height &&
      w <= data.karte_max * width &&
      h <= data.karte_max * height &&
      contrast >= data.kontrast_karte;
    if (!knopf && !karte) continue;
    formen.push({
      art: knopf ? "knopf" : "karte",
      x: area.minX,
      y: area.minY,
      width: w,
      height: h,
      farbe: hexOf(...colour),
      radius: Math.round(radius * 10) / 10,
      schatten: shadowRows(bildo, area, around),
    });
  }
  formen.sort((a, b) => b.width * b.height - a.width * a.height);
  const analyse: BildAnalyse = {
    grund: hexOf(...groundRgb),
    formen,
    abstaende: abstaendeOf(bildo, keys, ground),
  };
  cache.set(bildo, analyse);
  return analyse;
}
