// A PNG decoder for the Enportilo (Spec 033 S2): screenshots and logos as pixels, on node:zlib alone
// (no browser, no image library). 8-bit greyscale, grey with alpha, RGB, RGBA and palette images,
// not interlaced, with the five scanline filters of the PNG specification; everything else is named
// in the error.

import { inflateSync } from "node:zlib";

export interface Bildo {
  width: number;
  height: number;
  /** Four bytes per pixel, RGBA. */
  rgba: Uint8Array;
}

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const CHANNELS: Readonly<Record<number, number>> = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

const paeth = (a: number, b: number, c: number): number => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

export function decodePng(bytes: Uint8Array): Bildo {
  const data = Buffer.from(bytes);
  if (!SIGNATURE.every((byte, index) => data[index] === byte))
    throw new Error("Das ist keine PNG-Datei.");
  let offset = 8;
  let width = 0;
  let height = 0;
  let depth = 0;
  let type = 0;
  let interlace = 0;
  let palette: Buffer | undefined;
  let transparency: Buffer | undefined;
  const idat: Buffer[] = [];
  while (offset + 8 <= data.length) {
    const length = data.readUInt32BE(offset);
    const kind = data.toString("ascii", offset + 4, offset + 8);
    const body = data.subarray(offset + 8, offset + 8 + length);
    if (kind === "IHDR") {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      depth = body[8] ?? 0;
      type = body[9] ?? 0;
      interlace = body[12] ?? 0;
    } else if (kind === "PLTE") palette = body;
    else if (kind === "tRNS") transparency = body;
    else if (kind === "IDAT") idat.push(body);
    else if (kind === "IEND") break;
    offset += 12 + length;
  }
  const channels = CHANNELS[type];
  if (channels === undefined || depth !== 8) {
    throw new Error(
      `Diese PNG-Art liest der Enportilo nicht (Farbtyp ${type}, ${depth} Bit); speichere sie als 8-Bit-RGB oder -RGBA.`,
    );
  }
  if (interlace !== 0)
    throw new Error(
      "Interlaced PNG liest der Enportilo nicht; speichere das Bild ohne Interlacing.",
    );
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const pixels = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)] ?? 0;
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? (pixels[y * stride + x - channels] ?? 0) : 0;
      const b = y > 0 ? (pixels[(y - 1) * stride + x] ?? 0) : 0;
      const c = x >= channels && y > 0 ? (pixels[(y - 1) * stride + x - channels] ?? 0) : 0;
      const value = line[x] ?? 0;
      const predicted =
        filter === 1
          ? a
          : filter === 2
            ? b
            : filter === 3
              ? (a + b) >> 1
              : filter === 4
                ? paeth(a, b, c)
                : 0;
      pixels[y * stride + x] = (value + predicted) & 0xff;
    }
  }
  const rgba = new Uint8Array(width * height * 4);
  for (let index = 0; index < width * height; index++) {
    const source = index * channels;
    const target = index * 4;
    if (type === 3) {
      const entry = pixels[source] ?? 0;
      rgba[target] = palette?.[entry * 3] ?? 0;
      rgba[target + 1] = palette?.[entry * 3 + 1] ?? 0;
      rgba[target + 2] = palette?.[entry * 3 + 2] ?? 0;
      rgba[target + 3] = transparency?.[entry] ?? 255;
    } else if (type === 0 || type === 4) {
      const grey = pixels[source] ?? 0;
      rgba.set([grey, grey, grey, type === 4 ? (pixels[source + 1] ?? 255) : 255], target);
    } else {
      rgba[target] = pixels[source] ?? 0;
      rgba[target + 1] = pixels[source + 1] ?? 0;
      rgba[target + 2] = pixels[source + 2] ?? 0;
      rgba[target + 3] = type === 6 ? (pixels[source + 3] ?? 255) : 255;
    }
  }
  return { width, height, rgba };
}
