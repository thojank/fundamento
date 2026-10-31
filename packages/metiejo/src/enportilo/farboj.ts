// The dominant colours of an image (Spec 033 S2): pixels in buckets of 5 bits per channel, the mean of
// each bucket, the share of the area; transparent pixels do not count. With weights per pixel (Weg C,
// Spec 035 Befund 4.1) the share is one of the weighted area: the logo and the first screen of a
// rendered page count more. Pure.

import type { Kesto } from "./bildilo.js";
import { hexOf, type Trovo } from "./trovo.js";

/** Weg C: a pixel of the logo counts this often, one of the first screen this often, any other once. */
export const LOGO_PEZO = 4;
export const SUPRA_PEZO = 2;

/**
 * The weight of every pixel of a rendered page: LOGO_PEZO inside a logo, SUPRA_PEZO on the first
 * screen, 1 below it. The image may be scaled against the viewport (a double); boxes scale alike.
 */
export function pezojOfEkrano(
  width: number,
  height: number,
  vido: { width: number; height: number },
  logoj: readonly Kesto[],
): Uint8Array {
  const scale = width / vido.width;
  const fold = vido.height * scale;
  const pezoj = new Uint8Array(width * height);
  for (let y = 0; y < height; y++)
    pezoj.fill(y < fold ? SUPRA_PEZO : 1, y * width, (y + 1) * width);
  for (const logo of logoj) {
    const left = Math.max(0, Math.floor(logo.x * scale));
    const right = Math.min(width, Math.ceil((logo.x + logo.width) * scale));
    const top = Math.max(0, Math.floor(logo.y * scale));
    const bottom = Math.min(height, Math.ceil((logo.y + logo.height) * scale));
    for (let y = top; y < bottom; y++) pezoj.fill(LOGO_PEZO, y * width + left, y * width + right);
  }
  return pezoj;
}

/**
 * The colours that cover at least `min` of the visible area, largest first, at most `limit`. With
 * `pezoj` (one per pixel) the area is weighted, and the place says so.
 */
export function farbojOfPixels(
  rgba: Uint8Array,
  dosiero: string,
  limit = 8,
  min = 0.005,
  pezoj?: Uint8Array,
): Trovo[] {
  const buckets = new Map<number, { r: number; g: number; b: number; n: number; w: number }>();
  let visible = 0;
  for (let index = 0; index + 3 < rgba.length; index += 4) {
    if ((rgba[index + 3] ?? 0) < 128) continue;
    const weight = pezoj === undefined ? 1 : (pezoj[index / 4] ?? 1);
    const r = rgba[index] ?? 0;
    const g = rgba[index + 1] ?? 0;
    const b = rgba[index + 2] ?? 0;
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0, w: 0 };
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    bucket.n += 1;
    bucket.w += weight;
    buckets.set(key, bucket);
    visible += weight;
  }
  const where = pezoj === undefined ? "der Fläche" : "der gewichteten Fläche des Bildschirms";
  return [...buckets.values()]
    .filter((bucket) => bucket.w / Math.max(1, visible) >= min)
    .sort((a, b) => b.w - a.w)
    .slice(0, limit)
    .map((bucket) => {
      const share = (100 * bucket.w) / Math.max(1, visible);
      return {
        kind: "farbo" as const,
        valoro: hexOf(bucket.r / bucket.n, bucket.g / bucket.n, bucket.b / bucket.n),
        pezo: Math.round(share * 10) / 10,
        herkunft: { dosiero, loko: `${share.toFixed(1).replace(".", ",")} % ${where}` },
      };
    });
}
