// Spec 058 (MP-2c, T9, MAW-4.2, part G): the one image of this spec that leaves the machine – the
// Layout-Beispiel for „Aufbau erkennen“ – made small and plain before it goes (tech spec „Bild für
// ‚Aufbau erkennen‘“). The longest side is at most MAX_RANDO (the Enportilo's value, as when the
// colours are read) and the pixels are re-encoded as a PNG, so nothing of the file but its picture
// is sent (no metadata, no other chunk).
//   - JPG and WebP are decoded by the existing browser path (`Bildilo.malkodi`: Chromium through
//     Playwright, which already scales to MAX_RANDO); without a browser it throws `SenBrowser`, and
//     the route answers 422 with the Enportilo's sentence.
//   - PNG is decoded by the Enportilo's own decoder (`decodePng`, no browser needed, as when its
//     colours are read) and scaled here by the mean of each covered block.
//   - PDF and SVG are never turned into an image (the existing code cannot raster them).
// Calls `enportilo/**` only; changes nothing there. Pure apart from the browser it is handed.

import { crc32, deflateSync } from "node:zlib";
import { type Bildilo, type BildTipo, MAX_RANDO } from "./enportilo/bildilo.js";
import { type Bildo, decodePng } from "./enportilo/png.js";
import type { BeispielArt } from "./grafeo-gestalten-sicht.js";

/** The kinds „Aufbau erkennen“ takes: images only. */
export type AufbauBildArt = "png" | "jpg" | "webp";

export const estasAufbauBildArt = (art: BeispielArt): art is AufbauBildArt =>
  art === "png" || art === "jpg" || art === "webp";

/** The type the browser decodes a JPG or WebP as. */
const BILDTIPOJ: Readonly<Record<Exclude<AufbauBildArt, "png">, BildTipo>> = {
  jpg: "image/jpeg",
  webp: "image/webp",
};

/** The head of the data URL the model gets. */
export const PNG_DATUMO = "data:image/png;base64,";

/**
 * The picture scaled to at most `rando` px on its longer side (each new pixel the mean of the
 * block of old pixels it covers); a picture within it stays as it is.
 */
export function malgrandigi(bildo: Bildo, rando: number = MAX_RANDO): Bildo {
  const { width, height, rgba } = bildo;
  const skalo = Math.min(1, rando / Math.max(width, height));
  if (skalo >= 1) return bildo;
  const w = Math.max(1, Math.round(width * skalo));
  const h = Math.max(1, Math.round(height * skalo));
  const out = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    const y0 = Math.floor((y * height) / h);
    const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * height) / h));
    for (let x = 0; x < w; x++) {
      const x0 = Math.floor((x * width) / w);
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * width) / w));
      const sumo = [0, 0, 0, 0];
      for (let sy = y0; sy < y1; sy++)
        for (let sx = x0; sx < x1; sx++) {
          const i = (sy * width + sx) * 4;
          for (let k = 0; k < 4; k++) sumo[k] = (sumo[k] ?? 0) + (rgba[i + k] ?? 0);
        }
      const n = (y1 - y0) * (x1 - x0);
      const o = (y * w + x) * 4;
      for (let k = 0; k < 4; k++) out[o + k] = Math.round((sumo[k] ?? 0) / n);
    }
  }
  return { width: w, height: h, rgba: out };
}

/** One chunk of a PNG: length, type, data, CRC over type and data. */
function pecoDe(tipo: string, datumoj: Uint8Array): Buffer {
  const kapo = Buffer.alloc(8);
  kapo.writeUInt32BE(datumoj.length, 0);
  kapo.write(tipo, 4, "ascii");
  const fino = Buffer.alloc(4);
  fino.writeUInt32BE(crc32(Buffer.concat([Buffer.from(tipo, "ascii"), datumoj])), 0);
  return Buffer.concat([kapo, datumoj, fino]);
}

/** The picture as a PNG: 8-bit RGBA, no filter, nothing but IHDR, IDAT and IEND. */
export function kodiPng(bildo: Bildo): Buffer {
  const { width, height, rgba } = bildo;
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const linio = width * 4 + 1;
  const kruda = Buffer.alloc(linio * height);
  for (let y = 0; y < height; y++)
    kruda.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), y * linio + 1);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pecoDe("IHDR", ihdr),
    pecoDe("IDAT", deflateSync(kruda)),
    pecoDe("IEND", new Uint8Array()),
  ]);
}

/**
 * The image for the model as a data URL (`data:image/png;base64,…`): decoded, at most MAX_RANDO px
 * on its longer side, re-encoded. Throws `SenBrowser` for a JPG/WebP without a browser, and the
 * decoder's error for a file that does not decode.
 */
export async function bildoPorModelo(
  bytes: Uint8Array,
  art: AufbauBildArt,
  bildilo: Bildilo,
): Promise<string> {
  const bildo = art === "png" ? decodePng(bytes) : await bildilo.malkodi(bytes, BILDTIPOJ[art]);
  return `${PNG_DATUMO}${kodiPng(malgrandigi(bildo)).toString("base64")}`;
}
