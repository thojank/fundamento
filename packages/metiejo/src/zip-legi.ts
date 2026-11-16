// Spec 056 (MP-2a, T7, KBS-3.5, plan D-12): reads a ZIP file with the means of Node – pure,
// `node:zlib` only, no dependency. The end record leads to the central directory; each entry is
// stored (method 0) or deflated (method 8, `inflateRawSync`) and checked against its size and CRC.
// Folders, `__MACOSX/` and hidden files and folders (a path part starting with „.“) are skipped
// without a word; every other entry that is no font file (`isFontFile`) is counted as passed over.
// The whole file does not read (undefined) when it is broken, an entry is encrypted, it uses ZIP64
// or a multi-disk layout, an entry has another method, or an entry is larger than `grenze` – by its
// header or by what it inflates to (`maxOutputLength`). The route passes the per-file limit of an
// upload, `dateiGrenzeDe(ANFRAGE_GRENZE)` (D-12): a font file inside a ZIP may be as large as one
// sent alone. There is no limit on the sum of the entries (Befund for the maintainer).

import { crc32, inflateRawSync } from "node:zlib";
import { isFontFile } from "./kontrolo.js";

/** One font file of a ZIP: its path inside the ZIP and its bytes. */
export interface ZipDosiero {
  nomo: string;
  bytes: Buffer;
}

/** What a ZIP gave: its font files in their order, and how many other files it passed over. */
export interface ZipLego {
  dateien: ZipDosiero[];
  uebergangen: number;
}

const FINO = 0x06054b50;
const FINO64_LOKO = 0x07064b50;
const CENTRA = 0x02014b50;
const LOKA = 0x04034b50;

/** Whether the bytes begin like a ZIP (a local header, or the end record of an empty one). */
export function estasZip(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;
  const signo = Buffer.from(bytes.buffer, bytes.byteOffset, 4).readUInt32LE(0);
  return signo === LOKA || signo === FINO;
}

/** Whether a path inside the ZIP is skipped silently: a folder, `__MACOSX/`, anything hidden. */
const estasKasxita = (nomo: string): boolean =>
  nomo.endsWith("/") ||
  nomo.split("/").some((parto) => parto === "__MACOSX" || parto.startsWith("."));

/** Reads a ZIP; undefined when it does not read (see the head of this file). */
export function zipLegi(bytes: Uint8Array, grenze: number): ZipLego | undefined {
  try {
    return legi(Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength), grenze);
  } catch {
    return undefined;
  }
}

class Nelegebla extends Error {}

function legi(b: Buffer, grenze: number): ZipLego {
  // The end record: 22 bytes plus a comment of at most 65 535 bytes, searched from the end.
  let fino = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 22 - 0xffff); i--) {
    if (b.readUInt32LE(i) === FINO && i + 22 + b.readUInt16LE(i + 20) === b.length) {
      fino = i;
      break;
    }
  }
  if (fino === -1) throw new Nelegebla();
  if (fino >= 20 && b.readUInt32LE(fino - 20) === FINO64_LOKO) throw new Nelegebla();
  const disko = b.readUInt16LE(fino + 4);
  const diskoKomenco = b.readUInt16LE(fino + 6);
  const nombroCxiDisko = b.readUInt16LE(fino + 8);
  const nombro = b.readUInt16LE(fino + 10);
  const centroLongo = b.readUInt32LE(fino + 12);
  const centroOfseto = b.readUInt32LE(fino + 16);
  if (
    disko !== 0 ||
    diskoKomenco !== 0 ||
    nombroCxiDisko !== nombro ||
    nombro === 0xffff ||
    centroLongo === 0xffffffff ||
    centroOfseto === 0xffffffff ||
    centroOfseto + centroLongo > fino
  ) {
    throw new Nelegebla();
  }

  const dateien: ZipDosiero[] = [];
  let uebergangen = 0;
  let r = centroOfseto;
  for (let i = 0; i < nombro; i++) {
    if (r + 46 > centroOfseto + centroLongo || b.readUInt32LE(r) !== CENTRA) throw new Nelegebla();
    const flagoj = b.readUInt16LE(r + 8);
    const metodo = b.readUInt16LE(r + 10);
    const crc = b.readUInt32LE(r + 16);
    const premitaLongo = b.readUInt32LE(r + 20);
    const longo = b.readUInt32LE(r + 24);
    const nomoLongo = b.readUInt16LE(r + 28);
    const aldonoLongo = b.readUInt16LE(r + 30);
    const komentoLongo = b.readUInt16LE(r + 32);
    const lokaOfseto = b.readUInt32LE(r + 42);
    if (r + 46 + nomoLongo > b.length) throw new Nelegebla();
    const nomo = b.toString(
      (flagoj & 0x0800) !== 0 ? "utf8" : "latin1",
      r + 46,
      r + 46 + nomoLongo,
    );
    r += 46 + nomoLongo + aldonoLongo + komentoLongo;

    // Encrypted (bit 0, strong encryption bit 6), ZIP64 sizes, another method: not readable.
    if ((flagoj & 0x0041) !== 0) throw new Nelegebla();
    if ([premitaLongo, longo, lokaOfseto].includes(0xffffffff)) throw new Nelegebla();
    if (metodo !== 0 && metodo !== 8) throw new Nelegebla();
    if (estasKasxita(nomo)) continue;
    const dosiero = nomo.split("/").pop() ?? nomo;
    if (!isFontFile(dosiero)) {
      uebergangen++;
      continue;
    }
    if (longo > grenze) throw new Nelegebla();
    if (lokaOfseto + 30 > b.length || b.readUInt32LE(lokaOfseto) !== LOKA) throw new Nelegebla();
    const datumoKomenco =
      lokaOfseto + 30 + b.readUInt16LE(lokaOfseto + 26) + b.readUInt16LE(lokaOfseto + 28);
    if (datumoKomenco + premitaLongo > b.length) throw new Nelegebla();
    const premita = b.subarray(datumoKomenco, datumoKomenco + premitaLongo);
    const datumo =
      metodo === 0 ? Buffer.from(premita) : inflateRawSync(premita, { maxOutputLength: grenze });
    if (datumo.length !== longo || crc32(datumo) !== crc) throw new Nelegebla();
    dateien.push({ nomo, bytes: datumo });
  }
  if (r !== centroOfseto + centroLongo) throw new Nelegebla();
  return { dateien, uebergangen };
}
