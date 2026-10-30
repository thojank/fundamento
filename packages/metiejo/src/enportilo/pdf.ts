// What a PDF style guide says of its brand (Spec 033 S2): the colours its pages are painted with –
// the fill and stroke operators rg/RG (RGB) and k/K (CMYK) in the content streams, unpacked where
// FlateDecode packs them – and the font families it embeds (/BaseFont, without the subset prefix and
// the style). Text in PDF is encoded per font and is not read. Pure.

import { inflateSync } from "node:zlib";
import { hexOf, type Trovo } from "./trovo.js";

function streamsOf(data: Buffer): string[] {
  const texts: string[] = [];
  const latin = data.toString("latin1");
  for (const match of latin.matchAll(/stream\r?\n/g)) {
    const start = match.index + match[0].length;
    const end = latin.indexOf("endstream", start);
    if (end === -1) continue;
    const dict = latin.slice(Math.max(0, match.index - 300), match.index);
    const body = data.subarray(start, end);
    if (/\/FlateDecode/.test(dict.slice(dict.lastIndexOf("<<")))) {
      try {
        texts.push(inflateSync(body).toString("latin1"));
      } catch {
        // A stream that does not inflate is an image or broken; it holds no operators to read.
      }
    } else {
      texts.push(body.toString("latin1"));
    }
  }
  return texts;
}

const NUMBER = String.raw`(-?\d*\.?\d+)`;
const RGB = new RegExp(String.raw`${NUMBER}\s+${NUMBER}\s+${NUMBER}\s+(rg|RG)\b`, "g");
const CMYK = new RegExp(String.raw`${NUMBER}\s+${NUMBER}\s+${NUMBER}\s+${NUMBER}\s+(k|K)\b`, "g");

export function legiPdf(bytes: Uint8Array, dosiero: string): Trovo[] {
  const data = Buffer.from(bytes);
  const colours = new Map<string, number>();
  for (const text of streamsOf(data)) {
    for (const match of text.matchAll(RGB)) {
      const [r, g, b] = [match[1], match[2], match[3]].map((value) => Number(value) * 255);
      const hex = hexOf(r ?? 0, g ?? 0, b ?? 0);
      colours.set(hex, (colours.get(hex) ?? 0) + 1);
    }
    for (const match of text.matchAll(CMYK)) {
      const [c, m, y, k] = [match[1], match[2], match[3], match[4]].map(Number) as [
        number,
        number,
        number,
        number,
      ];
      const hex = hexOf(255 * (1 - c) * (1 - k), 255 * (1 - m) * (1 - k), 255 * (1 - y) * (1 - k));
      colours.set(hex, (colours.get(hex) ?? 0) + 1);
    }
  }
  const trovoj: Trovo[] = [...colours.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([valoro, pezo]) => ({
      kind: "farbo",
      valoro,
      pezo,
      herkunft: { dosiero, loko: `${pezo}× als Füllung oder Linie` },
    }));
  const families = new Map<string, number>();
  for (const match of data
    .toString("latin1")
    .matchAll(/\/BaseFont\s*\/(?:[A-Z]{6}\+)?([^\s/<>[\]()]+)/g)) {
    const family = (match[1] ?? "").split(/[-,]/)[0] ?? "";
    if (family !== "") families.set(family, (families.get(family) ?? 0) + 1);
  }
  for (const [valoro, pezo] of families) {
    trovoj.push({
      kind: "tiparo",
      valoro,
      rolo: "body",
      pezo,
      herkunft: { dosiero, loko: "eingebettete Schrift" },
    });
  }
  return trovoj;
}
