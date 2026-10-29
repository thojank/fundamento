// The dominant colours of an image (Spec 033 S2): pixels in buckets of 5 bits per channel, the mean of
// each bucket, the share of the area; transparent pixels do not count. Pure.

import { hexOf, type Trovo } from "./trovo.js";

/** The colours that cover at least `min` of the visible area, largest first, at most `limit`. */
export function farbojOfPixels(rgba: Uint8Array, dosiero: string, limit = 8, min = 0.005): Trovo[] {
  const buckets = new Map<number, { r: number; g: number; b: number; n: number }>();
  let visible = 0;
  for (let index = 0; index + 3 < rgba.length; index += 4) {
    if ((rgba[index + 3] ?? 0) < 128) continue;
    const r = rgba[index] ?? 0;
    const g = rgba[index + 1] ?? 0;
    const b = rgba[index + 2] ?? 0;
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    bucket.n += 1;
    buckets.set(key, bucket);
    visible += 1;
  }
  return [...buckets.values()]
    .filter((bucket) => bucket.n / Math.max(1, visible) >= min)
    .sort((a, b) => b.n - a.n)
    .slice(0, limit)
    .map((bucket) => {
      const share = (100 * bucket.n) / Math.max(1, visible);
      return {
        kind: "farbo" as const,
        valoro: hexOf(bucket.r / bucket.n, bucket.g / bucket.n, bucket.b / bucket.n),
        pezo: Math.round(share * 10) / 10,
        herkunft: { dosiero, loko: `${share.toFixed(1).replace(".", ",")} % der Fläche` },
      };
    });
}
