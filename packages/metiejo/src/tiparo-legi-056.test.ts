// Spec 056 (MP-2a, T7, KBS-3.5): reading an own font file before it is stored. Family and cut come
// from the font's tables – `name` (16, else 1; 17, else 2), `OS/2` (usWeightClass, fsSelection bit
// 0) and `fvar` (the `wght` axis) – of TTF, OTF, WOFF and WOFF2; a file whose tables do not read
// is named after its file name with `quelle: "dateiname"`; a file that is no font (its bytes, or
// bytes and extension disagree) is not read at all. What a family has and lacks is measured at
// Regular (400 normal), Bold (700 normal) and Italic (any weight). TTF/OTF/fvar cases are small
// synthetic sfnt buffers built here; WOFF and WOFF2 come from the OFL fixture (test/fixtures/valid/
// tiparo-056, HERKUNFT.md). Offline; no number of the reader is typed into a test but the font's.

import { readFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import {
  AUS_DATEINAME,
  type SchriftDosiero,
  schnitteSatzDe,
  variabelSatzDe,
} from "./grafeo-gestalten-sicht.js";
import { ANFRAGE_GRENZE, dateiGrenzeDe } from "./servilo.js";
import {
  familienDe,
  fehltDe,
  formoDe,
  schnitteBeschreibungDe,
  type TiparoLego,
  tiparoLegi,
} from "./tiparo-legi.js";

const GRENZE = dateiGrenzeDe(ANFRAGE_GRENZE);
const fikstur = (nomo: string): Buffer =>
  readFileSync(new URL(`../test/fixtures/valid/tiparo-056/${nomo}`, import.meta.url));

// ---------------------------------------------------------------------------------------------
// A small sfnt builder (TrueType or CFF flavour) with `name`, `OS/2` and optionally `fvar`

const u16 = (n: number): Buffer => {
  const b = Buffer.alloc(2);
  b.writeUInt16BE(n);
  return b;
};
const u32 = (n: number): Buffer => {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n >>> 0);
  return b;
};
const fixed = (n: number): Buffer => u32(Math.round(n * 65536));

/** A `name` table (format 0) with Windows Unicode BMP English records. */
function nameTabelo(nomoj: Readonly<Record<number, string>>): Buffer {
  const ids = Object.keys(nomoj)
    .map(Number)
    .sort((a, b) => a - b);
  const kordoj: Buffer[] = [];
  const datumoj: Buffer[] = [];
  let ofseto = 0;
  for (const id of ids) {
    const teksto = Buffer.from(nomoj[id] ?? "", "utf16le").swap16();
    kordoj.push(
      Buffer.concat([u16(3), u16(1), u16(0x409), u16(id), u16(teksto.length), u16(ofseto)]),
    );
    datumoj.push(teksto);
    ofseto += teksto.length;
  }
  return Buffer.concat([u16(0), u16(ids.length), u16(6 + 12 * ids.length), ...kordoj, ...datumoj]);
}

/** An `OS/2` table (version 4, 96 bytes) with a weight class and fsSelection. */
function os2Tabelo(gewicht: number, kursiva: boolean): Buffer {
  const t = Buffer.alloc(96);
  t.writeUInt16BE(4, 0);
  t.writeUInt16BE(gewicht, 4);
  t.writeUInt16BE(kursiva ? 0x01 : 0x40, 62);
  return t;
}

/** An `fvar` table with one axis. */
function fvarTabelo(akso: string, min: number, defaulto: number, max: number): Buffer {
  return Buffer.concat([
    u16(1),
    u16(0),
    u16(16),
    u16(2),
    u16(1),
    u16(20),
    u16(0),
    u16(4 + 4),
    Buffer.from(akso, "latin1"),
    fixed(min),
    fixed(defaulto),
    fixed(max),
    u16(0),
    u16(256),
  ]);
}

/** An sfnt with the tables in tag order, each 4-byte aligned. */
function sfnt(tabeloj: Readonly<Record<string, Buffer>>, flavor = 0x00010000): Buffer {
  const etikedoj = Object.keys(tabeloj).sort();
  const kapo = Buffer.concat([u32(flavor), u16(etikedoj.length), u16(0), u16(0), u16(0)]);
  let ofseto = 12 + 16 * etikedoj.length;
  const dosierujo: Buffer[] = [];
  const korpoj: Buffer[] = [];
  for (const etikedo of etikedoj) {
    const datumo = tabeloj[etikedo] ?? Buffer.alloc(0);
    dosierujo.push(
      Buffer.concat([Buffer.from(etikedo, "latin1"), u32(0), u32(ofseto), u32(datumo.length)]),
    );
    const plenigo = Buffer.alloc((4 - (datumo.length % 4)) % 4);
    korpoj.push(datumo, plenigo);
    ofseto += datumo.length + plenigo.length;
  }
  return Buffer.concat([kapo, ...dosierujo, ...korpoj]);
}

/** A WOFF 1.0 of an sfnt (every table deflated). */
function woff(fonto: Buffer): Buffer {
  const nombro = fonto.readUInt16BE(4);
  const eroj: { etikedo: Buffer; datumo: Buffer; longo: number }[] = [];
  for (let i = 0; i < nombro; i++) {
    const r = 12 + 16 * i;
    const ofseto = fonto.readUInt32BE(r + 8);
    const longo = fonto.readUInt32BE(r + 12);
    const kruda = fonto.subarray(ofseto, ofseto + longo);
    const premita = deflateSync(kruda);
    eroj.push({
      etikedo: fonto.subarray(r, r + 4),
      datumo: premita.length < kruda.length ? premita : kruda,
      longo,
    });
  }
  let ofseto = 44 + 20 * nombro;
  const dosierujo: Buffer[] = [];
  const korpoj: Buffer[] = [];
  for (const ero of eroj) {
    dosierujo.push(
      Buffer.concat([ero.etikedo, u32(ofseto), u32(ero.datumo.length), u32(ero.longo), u32(0)]),
    );
    const plenigo = Buffer.alloc((4 - (ero.datumo.length % 4)) % 4);
    korpoj.push(ero.datumo, plenigo);
    ofseto += ero.datumo.length + plenigo.length;
  }
  const kapo = Buffer.concat([
    Buffer.from("wOFF", "latin1"),
    u32(fonto.readUInt32BE(0)),
    u32(ofseto),
    u16(nombro),
    u16(0),
    u32(fonto.length),
    u16(1),
    u16(0),
    u32(0),
    u32(0),
    u32(0),
    u32(0),
    u32(0),
  ]);
  return Buffer.concat([kapo, ...dosierujo, ...korpoj]);
}

const statika = (
  nomoj: Record<number, string>,
  gewicht: number,
  kursiva = false,
  flavor = 0x00010000,
): Buffer => sfnt({ name: nameTabelo(nomoj), "OS/2": os2Tabelo(gewicht, kursiva) }, flavor);

const OTTO = 0x4f54544f;

const dosiero = (
  name: string,
  gewicht: number,
  resto: Partial<SchriftDosiero> = {},
): SchriftDosiero => ({
  name,
  gewicht,
  stil: "normal",
  variabel: false,
  quelle: "tabellen",
  ...resto,
});

// ---------------------------------------------------------------------------------------------

describe("Spec 056 T7: the tables of a TTF or OTF", () => {
  it("family from name 16, else 1; cut from 17, else 2; weight and italic from OS/2", () => {
    const pro = statika({ 1: "Haus Medium", 2: "Regular", 16: "Haus", 17: "Medium" }, 500);
    const ohne16 = statika({ 1: "Hausschrift", 2: "Italic" }, 400, true);
    expect([
      tiparoLegi("Haus-Medium.ttf", pro, GRENZE),
      tiparoLegi("Hausschrift-Italic.otf", ohne16, GRENZE),
    ]).toEqual([
      { familie: "Haus", dosiero: dosiero("Haus-Medium.ttf", 500) },
      {
        familie: "Hausschrift",
        dosiero: dosiero("Hausschrift-Italic.otf", 400, { stil: "italic" }),
      },
    ]);
  });

  it("an OTF (CFF flavour) reads the same way; .ttf and .otf take either flavour", () => {
    const cff = statika({ 1: "Hausschrift", 2: "Bold" }, 700, false, OTTO);
    expect([formoDe(cff), formoDe(statika({ 1: "x" }, 400))]).toEqual(["otf", "ttf"]);
    expect([
      tiparoLegi("Hausschrift-Bold.otf", cff, GRENZE),
      tiparoLegi("Hausschrift-Bold.ttf", cff, GRENZE),
    ]).toEqual([
      { familie: "Hausschrift", dosiero: dosiero("Hausschrift-Bold.otf", 700) },
      { familie: "Hausschrift", dosiero: dosiero("Hausschrift-Bold.ttf", 700) },
    ]);
  });

  it("a variable font: the range of its wght axis; an fvar without wght is no variable weight", () => {
    const variabla = sfnt({
      name: nameTabelo({ 1: "Hausschrift", 2: "Regular" }),
      "OS/2": os2Tabelo(400, false),
      fvar: fvarTabelo("wght", 100, 400, 900),
    });
    const larga = sfnt({
      name: nameTabelo({ 1: "Hausschrift", 2: "Regular" }),
      "OS/2": os2Tabelo(400, false),
      fvar: fvarTabelo("wdth", 75, 100, 125),
    });
    expect([
      tiparoLegi("Hausschrift[wght].ttf", variabla, GRENZE),
      tiparoLegi("Hausschrift[wdth].ttf", larga, GRENZE),
    ]).toEqual([
      {
        familie: "Hausschrift",
        dosiero: dosiero("Hausschrift[wght].ttf", 100, { gewichtBis: 900, variabel: true }),
      },
      { familie: "Hausschrift", dosiero: dosiero("Hausschrift[wdth].ttf", 400) },
    ]);
  });

  it("a WOFF of a synthetic font: tables inflated with zlib", () => {
    const fonto = sfnt({
      name: nameTabelo({ 1: "Hausschrift", 2: "Bold Italic" }),
      "OS/2": os2Tabelo(700, true),
      fvar: fvarTabelo("wght", 300, 400, 800),
    });
    expect(tiparoLegi("Hausschrift.woff", woff(fonto), GRENZE)).toEqual({
      familie: "Hausschrift",
      dosiero: dosiero("Hausschrift.woff", 300, {
        gewichtBis: 800,
        variabel: true,
        stil: "italic",
      }),
    });
  });
});

describe("Spec 056 T7: WOFF and WOFF2 of the OFL fixture", () => {
  it("reads family, weight and style from the tables of WOFF and WOFF2", () => {
    const legi = (nomo: string): TiparoLego | undefined => tiparoLegi(nomo, fikstur(nomo), GRENZE);
    expect([
      legi("lato-latin-400-normal.woff"),
      legi("lato-latin-700-normal.woff"),
      legi("lato-latin-400-normal.woff2"),
      legi("lato-latin-700-normal.woff2"),
    ]).toEqual([
      { familie: "Lato", dosiero: dosiero("lato-latin-400-normal.woff", 400) },
      { familie: "Lato", dosiero: dosiero("lato-latin-700-normal.woff", 700) },
      { familie: "Lato", dosiero: dosiero("lato-latin-400-normal.woff2", 400) },
      { familie: "Lato", dosiero: dosiero("lato-latin-700-normal.woff2", 700) },
    ]);
  });

  it("a decompressed font above the limit does not read from its tables (file name instead)", () => {
    const nomo = "lato-latin-400-normal.woff2";
    expect(tiparoLegi(nomo, fikstur(nomo), 1000)?.dosiero.quelle).toBe("dateiname");
    expect(tiparoLegi("x.woff", fikstur("lato-latin-400-normal.woff"), 10)?.dosiero.quelle).toBe(
      "dateiname",
    );
  });
});

describe("Spec 056 T7: a file whose tables do not read, and a file that is no font", () => {
  it("tables that do not read: family and cut from the file name, quelle dateiname", () => {
    const kaputa = (kapo: string): Buffer =>
      Buffer.concat([Buffer.from(kapo, "latin1"), Buffer.alloc(30, 0xff)]);
    expect([
      tiparoLegi("Hausschrift-BoldItalic.ttf", kaputa("\u0000\u0001\u0000\u0000"), GRENZE),
      tiparoLegi("Hausschrift_Regular.otf", kaputa("OTTO"), GRENZE),
      tiparoLegi("Hausschrift-Variable.woff2", kaputa("wOF2"), GRENZE),
      tiparoLegi("Haus Schrift Light.woff", kaputa("wOFF"), GRENZE),
    ]).toEqual([
      {
        familie: "Hausschrift",
        dosiero: dosiero("Hausschrift-BoldItalic.ttf", 700, {
          stil: "italic",
          quelle: "dateiname",
        }),
      },
      {
        familie: "Hausschrift",
        dosiero: dosiero("Hausschrift_Regular.otf", 400, { quelle: "dateiname" }),
      },
      {
        familie: "Hausschrift",
        dosiero: dosiero("Hausschrift-Variable.woff2", 100, {
          gewichtBis: 900,
          variabel: true,
          quelle: "dateiname",
        }),
      },
      {
        familie: "Haus Schrift",
        dosiero: dosiero("Haus Schrift Light.woff", 300, { quelle: "dateiname" }),
      },
    ]);
  });

  it("no font: other bytes, an extension that does not fit the bytes, another extension", () => {
    const ttf = statika({ 1: "Hausschrift", 2: "Regular" }, 400);
    const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]);
    expect([
      tiparoLegi("bild.ttf", png, GRENZE),
      tiparoLegi("Hausschrift.woff2", ttf, GRENZE),
      tiparoLegi("Hausschrift.woff", fikstur("lato-latin-400-normal.woff2"), GRENZE),
      tiparoLegi("Hausschrift.txt", ttf, GRENZE),
      tiparoLegi("leer.ttf", Buffer.alloc(0), GRENZE),
    ]).toEqual([undefined, undefined, undefined, undefined, undefined]);
  });
});

describe("Spec 056 T7: what a family has and what it lacks (Regular, Bold, Italic)", () => {
  const lego = (familie: string, d: SchriftDosiero): TiparoLego => ({ familie, dosiero: d });

  it("Regular and Bold: „Gefunden: Regular 400, Bold 700. Es fehlt: Italic.“", () => {
    const dateien = [dosiero("b.woff2", 700), dosiero("a.woff2", 400)];
    expect({ fehlt: fehltDe(dateien), satz: schnitteBeschreibungDe(dateien) }).toEqual({
      fehlt: ["Italic"],
      satz: "Gefunden: Regular 400, Bold 700. Es fehlt: Italic.",
    });
    expect(schnitteBeschreibungDe(dateien)).toBe(
      schnitteSatzDe(["Regular 400", "Bold 700"], ["Italic"]),
    );
  });

  it("only Bold: „Gefunden: Bold 700. Es fehlt: Regular, Italic.“; all three: nothing lacks", () => {
    const nurBold = [dosiero("b.woff2", 700)];
    const alle = [
      dosiero("a.woff2", 400),
      dosiero("b.woff2", 700),
      dosiero("c.woff2", 400, { stil: "italic" }),
      dosiero("d.woff2", 700, { stil: "italic" }),
    ];
    expect([schnitteBeschreibungDe(nurBold), schnitteBeschreibungDe(alle)]).toEqual([
      "Gefunden: Bold 700. Es fehlt: Regular, Italic.",
      "Gefunden: Regular 400, Italic 400, Bold 700, Bold Italic 700.",
    ]);
    expect([fehltDe(nurBold), fehltDe(alle)]).toEqual([["Regular", "Italic"], []]);
  });

  it("a variable font: „Variable Schrift, Gewichte 100 bis 900.“ and it covers every weight in its range", () => {
    const variabla = [dosiero("v.woff2", 100, { gewichtBis: 900, variabel: true })];
    const kunKursiva = [
      ...variabla,
      dosiero("vi.woff2", 100, { gewichtBis: 900, variabel: true, stil: "italic" }),
    ];
    const mallarga = [dosiero("v.woff2", 500, { gewichtBis: 900, variabel: true })];
    expect([
      schnitteBeschreibungDe(kunKursiva),
      schnitteBeschreibungDe(variabla),
      schnitteBeschreibungDe(mallarga),
    ]).toEqual([
      "Variable Schrift, Gewichte 100 bis 900.",
      "Variable Schrift, Gewichte 100 bis 900. Es fehlt: Italic.",
      "Variable Schrift, Gewichte 500 bis 900. Es fehlt: Regular, Italic.",
    ]);
    expect(schnitteBeschreibungDe(kunKursiva)).toBe(variabelSatzDe(100, 900));
  });

  it("a cut read from the file name carries the note „aus dem Dateinamen“", () => {
    const dateien = [dosiero("Haus-Bold.woff2", 700, { quelle: "dateiname" })];
    expect(schnitteBeschreibungDe(dateien)).toBe(
      `Gefunden: Bold 700 (${AUS_DATEINAME}). Es fehlt: Regular, Italic.`,
    );
  });

  it("familienDe groups by family (letter case aside), sorts files by weight and style and names what lacks", () => {
    expect(
      familienDe([
        lego("Lato", dosiero("lato-700.woff2", 700)),
        lego("Hausschrift", dosiero("haus.ttf", 400, { stil: "italic" })),
        lego("lato", dosiero("lato-400.woff2", 400)),
      ]),
    ).toEqual([
      {
        familie: "Hausschrift",
        dateien: [dosiero("haus.ttf", 400, { stil: "italic" })],
        fehlt: ["Regular", "Bold"],
      },
      {
        familie: "Lato",
        dateien: [dosiero("lato-400.woff2", 400), dosiero("lato-700.woff2", 700)],
        fehlt: ["Italic"],
      },
    ]);
  });
});
