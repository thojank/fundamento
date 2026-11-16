// Spec 056 (MP-2a, T7, KBS-3.5, plan D-12): reading a ZIP file with the means of Node (`node:zlib`
// only). Entries stored (method 0) or deflated (method 8) are read; folders, `__MACOSX/` and hidden
// files and folders are skipped silently; every other file that is no font is counted. A broken
// file, an encrypted entry, ZIP64, another method, or an entry above the per-file limit
// (`dateiGrenzeDe(ANFRAGE_GRENZE)`, D-12) makes the whole file unreadable. The fixture ZIP holds
// Regular and Bold of an OFL font and its licence text (HERKUNFT.md); the other ZIPs are built here.

import { readFileSync } from "node:fs";
import { crc32, deflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { uebergangenSatzDe } from "./grafeo-gestalten-sicht.js";
import { ANFRAGE_GRENZE, dateiGrenzeDe } from "./servilo.js";
import { zipLegi } from "./zip-legi.js";

const GRENZE = dateiGrenzeDe(ANFRAGE_GRENZE);
const fikstur = (nomo: string): Buffer =>
  readFileSync(new URL(`../test/fixtures/valid/tiparo-056/${nomo}`, import.meta.url));

interface Ero {
  nomo: string;
  datumo: Buffer;
  /** 0 stored, 8 deflated, or any other number for „another method“. */
  metodo?: number;
  flagoj?: number;
  /** Overrides of the header fields, to build broken or lying files. */
  crc?: number;
  grando?: number;
}

/** A ZIP of the entries (local headers, central directory, end record). */
function zip(eroj: readonly Ero[], eocd: { nombro?: number; zip64?: boolean } = {}): Buffer {
  const lokaj: Buffer[] = [];
  const centraj: Buffer[] = [];
  let ofseto = 0;
  for (const ero of eroj) {
    const metodo = ero.metodo ?? 8;
    const premita = metodo === 8 ? deflateRawSync(ero.datumo) : ero.datumo;
    const nomo = Buffer.from(ero.nomo, "utf8");
    const crc = ero.crc ?? crc32(ero.datumo);
    const grando = ero.grando ?? ero.datumo.length;
    const flagoj = (ero.flagoj ?? 0) | 0x0800;
    const loka = Buffer.alloc(30);
    loka.writeUInt32LE(0x04034b50, 0);
    loka.writeUInt16LE(20, 4);
    loka.writeUInt16LE(flagoj, 6);
    loka.writeUInt16LE(metodo, 8);
    loka.writeUInt32LE(crc, 14);
    loka.writeUInt32LE(premita.length, 18);
    loka.writeUInt32LE(grando, 22);
    loka.writeUInt16LE(nomo.length, 26);
    const centra = Buffer.alloc(46);
    centra.writeUInt32LE(0x02014b50, 0);
    centra.writeUInt16LE(20, 4);
    centra.writeUInt16LE(20, 6);
    centra.writeUInt16LE(flagoj, 8);
    centra.writeUInt16LE(metodo, 10);
    centra.writeUInt32LE(crc, 16);
    centra.writeUInt32LE(premita.length, 20);
    centra.writeUInt32LE(grando, 24);
    centra.writeUInt16LE(nomo.length, 28);
    centra.writeUInt32LE(ofseto, 42);
    lokaj.push(loka, nomo, premita);
    centraj.push(centra, nomo);
    ofseto += loka.length + nomo.length + premita.length;
  }
  const centro = Buffer.concat(centraj);
  const fino = Buffer.alloc(22);
  fino.writeUInt32LE(0x06054b50, 0);
  const nombro = eocd.nombro ?? eroj.length;
  fino.writeUInt16LE(nombro, 8);
  fino.writeUInt16LE(nombro, 10);
  fino.writeUInt32LE(centro.length, 12);
  fino.writeUInt32LE(ofseto, 16);
  // ZIP64: its end locator stands right before the end record (the ZIP64 record itself is not
  // needed to tell the file apart).
  const lokilo = Buffer.alloc(eocd.zip64 === true ? 20 : 0);
  if (eocd.zip64 === true) lokilo.writeUInt32LE(0x07064b50, 0);
  return Buffer.concat([...lokaj, centro, lokilo, fino]);
}

const TIPARO = Buffer.from("wOF2-bytes-of-a-test-font", "latin1");
const nomojDe = (lego: ReturnType<typeof zipLegi>) => lego?.dateien.map((d) => d.nomo);

describe("Spec 056 T7: the fixture ZIP (Regular and Bold of an OFL font, its licence text)", () => {
  it("gives the two font files with their bytes and counts the licence text as one other file", () => {
    const lego = zipLegi(fikstur("lato-400-700.zip"), GRENZE);
    expect({
      dateien: lego?.dateien.map((d) => ({ nomo: d.nomo, bytes: d.bytes.toString("base64") })),
      uebergangen: lego?.uebergangen,
    }).toEqual({
      dateien: [
        {
          nomo: "lato/lato-latin-400-normal.woff2",
          bytes: fikstur("lato-latin-400-normal.woff2").toString("base64"),
        },
        {
          nomo: "lato/lato-latin-700-normal.woff2",
          bytes: fikstur("lato-latin-700-normal.woff2").toString("base64"),
        },
      ],
      uebergangen: 1,
    });
    expect(uebergangenSatzDe(lego?.uebergangen ?? 0)).toBe("1 andere Datei übergangen.");
  });
});

describe("Spec 056 T7: what a ZIP holds besides fonts", () => {
  it("skips folders, __MACOSX/ and hidden files and folders silently; counts every other file", () => {
    const lego = zipLegi(
      zip([
        { nomo: "Hausschrift/", datumo: Buffer.alloc(0), metodo: 0 },
        { nomo: "Hausschrift/Hausschrift-Regular.ttf", datumo: TIPARO },
        { nomo: "Hausschrift/Hausschrift-Bold.otf", datumo: TIPARO, metodo: 0 },
        { nomo: "__MACOSX/Hausschrift/._Hausschrift-Regular.ttf", datumo: TIPARO },
        { nomo: "Hausschrift/.Hausschrift-Italic.woff", datumo: TIPARO },
        { nomo: ".cache/Hausschrift-Light.woff2", datumo: TIPARO },
        { nomo: "Hausschrift/OFL.txt", datumo: Buffer.from("licence") },
        { nomo: "Hausschrift/muster.png", datumo: Buffer.from("png") },
        { nomo: "LIESMICH", datumo: Buffer.from("text") },
      ]),
      GRENZE,
    );
    expect({ nomoj: nomojDe(lego), uebergangen: lego?.uebergangen }).toEqual({
      nomoj: ["Hausschrift/Hausschrift-Regular.ttf", "Hausschrift/Hausschrift-Bold.otf"],
      uebergangen: 3,
    });
    expect(uebergangenSatzDe(3)).toBe("3 andere Dateien übergangen.");
  });

  it("a ZIP without a font file gives no files (the route says „keine Schriftdateien“)", () => {
    const lego = zipLegi(
      zip([
        { nomo: "OFL.txt", datumo: Buffer.from("licence") },
        { nomo: "__MACOSX/._OFL.txt", datumo: Buffer.from("x") },
      ]),
      GRENZE,
    );
    expect(lego).toEqual({ dateien: [], uebergangen: 1 });
  });
});

describe("Spec 056 T7: a ZIP that does not read", () => {
  const gut = (): Ero => ({ nomo: "Hausschrift-Regular.ttf", datumo: TIPARO });

  it("broken: cut short, no end record, wrong CRC, a size that lies, random bytes", () => {
    const fikso = fikstur("lato-400-700.zip");
    const kunAliaGrando = zip([{ ...gut(), grando: TIPARO.length + 1 }]);
    expect([
      zipLegi(fikso.subarray(0, fikso.length - 30), GRENZE),
      zipLegi(fikso.subarray(0, 2000), GRENZE),
      zipLegi(zip([{ ...gut(), crc: 1234 }]), GRENZE),
      zipLegi(kunAliaGrando, GRENZE),
      zipLegi(zip([gut()], { nombro: 2 }), GRENZE),
      zipLegi(Buffer.from("PK\u0003\u0004 no zip at all", "latin1"), GRENZE),
      zipLegi(Buffer.alloc(0), GRENZE),
    ]).toEqual([undefined, undefined, undefined, undefined, undefined, undefined, undefined]);
  });

  it("an encrypted entry, ZIP64 (its end locator, or an entry's 64-bit size), another method", () => {
    expect([
      zipLegi(zip([gut(), { nomo: "geheim.ttf", datumo: TIPARO, flagoj: 0x0001 }]), GRENZE),
      zipLegi(zip([gut()], { zip64: true }), GRENZE),
      zipLegi(zip([gut(), { nomo: "LIESMICH", datumo: TIPARO, grando: 0xffffffff }]), GRENZE),
      zipLegi(zip([gut(), { nomo: "LIESMICH", datumo: TIPARO, metodo: 12 }]), GRENZE),
    ]).toEqual([undefined, undefined, undefined, undefined]);
    // The same entries without those marks read.
    expect(nomojDe(zipLegi(zip([gut(), { nomo: "LIESMICH", datumo: TIPARO }]), GRENZE))).toEqual([
      "Hausschrift-Regular.ttf",
    ]);
  });

  it("an entry above the per-file limit (D-12): by its header and by what it inflates to", () => {
    const granda = Buffer.alloc(4096, 0x61);
    const grenze = granda.length - 1;
    expect([
      zipLegi(zip([{ nomo: "granda.ttf", datumo: granda }]), grenze),
      zipLegi(zip([{ nomo: "granda.ttf", datumo: granda, metodo: 0 }]), grenze),
      // The header says a small size; inflating stops at the limit all the same.
      zipLegi(zip([{ nomo: "granda.ttf", datumo: granda, grando: 10 }]), grenze),
      nomojDe(zipLegi(zip([{ nomo: "granda.ttf", datumo: granda }]), granda.length)),
    ]).toEqual([undefined, undefined, undefined, ["granda.ttf"]]);
  });
});
