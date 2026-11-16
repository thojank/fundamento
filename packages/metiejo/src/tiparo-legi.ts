// Spec 056 (MP-2a, T7, KBS-3.5): reads an own font file before it is stored – pure, `node:zlib`
// only. Family and cut come from the font's own tables:
//   - `name`: the family from id 16 (typographic family), else 1; the cut from 17, else 2.
//   - `OS/2`: `usWeightClass` (the weight) and `fsSelection` bit 0 (italic).
//   - `fvar`: a `wght` axis makes the file a variable font with its weight range.
// TTF and OTF are read directly, WOFF by inflating each table (`inflateSync`), WOFF2 by one Brotli
// stream (`brotliDecompressSync`; `name`, `OS/2` and `fvar` are never transformed). No decompressed
// table and no WOFF2 stream may be larger than `grenze` (the route passes the per-file limit of an
// upload, `dateiGrenzeDe(ANFRAGE_GRENZE)`). A file whose bytes are a font but whose tables do not
// read is named after its file name (keywords Regular, Bold, Italic, Variable, …) with
// `quelle: "dateiname"`. A file whose bytes are no font, or whose extension does not fit its bytes,
// is not read at all (undefined): the route answers it with the calm sentence and stores nothing.
//
// What a family has and lacks is measured at Regular (400 normal), Bold (700 normal) and Italic
// (any weight); a variable font covers every weight of its range. The node of the canvas keeps its
// own copy of `fehltDe` and `schnitteBeschreibungDe` (nodredaktilo cannot bundle `node:zlib`);
// schriftdosieroj-056.test.ts proves both give the same.

import { extname } from "node:path";
import { brotliDecompressSync, inflateSync } from "node:zlib";
import {
  AUS_DATEINAME,
  type SchriftDosiero,
  schnitteSatzDe,
  variabelSatzDe,
} from "./grafeo-gestalten-sicht.js";

export type TiparoFormo = "ttf" | "otf" | "woff" | "woff2";

/** One font file as it was read: its family and its entry for the Schrift content. */
export interface TiparoLego {
  familie: string;
  dosiero: SchriftDosiero;
}

/** One family of an upload: its files (by weight, then style) and what it lacks. */
export interface SchriftFamilio {
  familie: string;
  dateien: SchriftDosiero[];
  fehlt: string[];
}

/** The extensions of font files and the formats each takes. */
const FORMOJ_DE_FINAJXO: Readonly<Record<string, readonly TiparoFormo[]>> = {
  ".ttf": ["ttf", "otf"],
  ".otf": ["ttf", "otf"],
  ".woff": ["woff"],
  ".woff2": ["woff2"],
};

/** The format the first bytes of a file say, or undefined: no font. */
export function formoDe(bytes: Uint8Array): TiparoFormo | undefined {
  if (bytes.length < 4) return undefined;
  const kapo = Buffer.from(bytes.buffer, bytes.byteOffset, 4).toString("latin1");
  if (kapo === "\u0000\u0001\u0000\u0000" || kapo === "true") return "ttf";
  if (kapo === "OTTO") return "otf";
  if (kapo === "wOFF") return "woff";
  if (kapo === "wOF2") return "woff2";
  return undefined;
}

/** A table that does not read: the reader falls back to the file name. */
class Nelegebla extends Error {}

const bufferDe = (bytes: Uint8Array): Buffer =>
  Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);

/** The bytes `[ofseto, ofseto + longo)` of `b`; throws when they are not all there. */
function tranco(b: Buffer, ofseto: number, longo: number): Buffer {
  if (ofseto < 0 || longo < 0 || ofseto + longo > b.length) throw new Nelegebla();
  return b.subarray(ofseto, ofseto + longo);
}

const TABELOJ = ["name", "OS/2", "fvar"] as const;
type Tabeloj = Partial<Record<(typeof TABELOJ)[number], Buffer>>;
const estasSercxata = (etikedo: string): etikedo is (typeof TABELOJ)[number] =>
  (TABELOJ as readonly string[]).includes(etikedo);

/** The three tables of an sfnt (TTF/OTF): its table directory, each record 16 bytes. */
function sfntTabeloj(b: Buffer): Tabeloj {
  const nombro = tranco(b, 4, 2).readUInt16BE(0);
  const tabeloj: Tabeloj = {};
  for (let i = 0; i < nombro; i++) {
    const r = tranco(b, 12 + 16 * i, 16);
    const etikedo = r.toString("latin1", 0, 4);
    if (estasSercxata(etikedo)) tabeloj[etikedo] = tranco(b, r.readUInt32BE(8), r.readUInt32BE(12));
  }
  return tabeloj;
}

/** The three tables of a WOFF: each record 20 bytes, a table deflated when it got smaller. */
function woffTabeloj(b: Buffer, grenze: number): Tabeloj {
  const nombro = tranco(b, 12, 2).readUInt16BE(0);
  const tabeloj: Tabeloj = {};
  for (let i = 0; i < nombro; i++) {
    const r = tranco(b, 44 + 20 * i, 20);
    const etikedo = r.toString("latin1", 0, 4);
    if (!estasSercxata(etikedo)) continue;
    const premita = tranco(b, r.readUInt32BE(4), r.readUInt32BE(8));
    const longo = r.readUInt32BE(12);
    if (longo > grenze) throw new Nelegebla();
    if (premita.length === longo) {
      tabeloj[etikedo] = premita;
      continue;
    }
    try {
      tabeloj[etikedo] = inflateSync(premita, { maxOutputLength: Math.max(1, longo) });
    } catch {
      throw new Nelegebla();
    }
  }
  return tabeloj;
}

/** The known tags of WOFF2, by their index in the flags byte (W3C WOFF2, 5.1). */
const WOFF2_ETIKEDOJ = [
  "cmap",
  "head",
  "hhea",
  "hmtx",
  "maxp",
  "name",
  "OS/2",
  "post",
  "cvt ",
  "fpgm",
  "glyf",
  "loca",
  "prep",
  "CFF ",
  "VORG",
  "EBDT",
  "EBLC",
  "gasp",
  "hdmx",
  "kern",
  "LTSH",
  "PCLT",
  "VDMX",
  "vhea",
  "vmtx",
  "BASE",
  "GDEF",
  "GPOS",
  "GSUB",
  "EBSC",
  "JSTF",
  "MATH",
  "CBDT",
  "CBLC",
  "COLR",
  "CPAL",
  "SVG ",
  "sbix",
  "acnt",
  "avar",
  "bdat",
  "bloc",
  "bsln",
  "cvar",
  "fdsc",
  "feat",
  "fmtx",
  "fvar",
  "gvar",
  "hsty",
  "just",
  "lcar",
  "mort",
  "morx",
  "opbd",
  "prop",
  "trak",
  "Zapf",
  "Silf",
  "Glat",
  "Gloc",
  "Feat",
  "Sill",
] as const;

/** A UIntBase128 of WOFF2 at `ofseto`: its value and the offset after it. */
function base128(b: Buffer, ofseto: number): [number, number] {
  let valoro = 0;
  for (let i = 0; i < 5; i++) {
    const bajto = tranco(b, ofseto + i, 1)[0] ?? 0;
    if (i === 0 && bajto === 0x80) throw new Nelegebla();
    if (valoro > 0x01ffffff) throw new Nelegebla();
    valoro = valoro * 128 + (bajto & 0x7f);
    if ((bajto & 0x80) === 0) return [valoro, ofseto + i + 1];
  }
  throw new Nelegebla();
}

/**
 * The three tables of a WOFF2: the directory (flags, optional tag, lengths), then one Brotli stream
 * with every table one after the other – a transformed table takes its transformed length.
 */
function woff2Tabeloj(b: Buffer, grenze: number): Tabeloj {
  if (tranco(b, 4, 4).toString("latin1") === "ttcf") throw new Nelegebla();
  const nombro = tranco(b, 12, 2).readUInt16BE(0);
  const premitaLongo = tranco(b, 20, 4).readUInt32BE(0);
  let ofseto = 48;
  const eroj: { etikedo: string; longo: number }[] = [];
  for (let i = 0; i < nombro; i++) {
    const flagoj = tranco(b, ofseto, 1)[0] ?? 0;
    ofseto += 1;
    let etikedo: string | undefined;
    if ((flagoj & 0x3f) === 0x3f) {
      etikedo = tranco(b, ofseto, 4).toString("latin1");
      ofseto += 4;
    } else {
      etikedo = WOFF2_ETIKEDOJ[flagoj & 0x3f];
    }
    if (etikedo === undefined) throw new Nelegebla();
    const versio = flagoj >> 6;
    const [origLongo, post] = base128(b, ofseto);
    ofseto = post;
    let longo = origLongo;
    const glyfLoca = etikedo === "glyf" || etikedo === "loca";
    if (glyfLoca ? versio === 0 : versio !== 0) {
      const [transformita, post2] = base128(b, ofseto);
      ofseto = post2;
      longo = transformita;
    }
    eroj.push({ etikedo, longo });
  }
  let fluo: Buffer;
  try {
    fluo = brotliDecompressSync(tranco(b, ofseto, premitaLongo), { maxOutputLength: grenze });
  } catch {
    throw new Nelegebla();
  }
  const tabeloj: Tabeloj = {};
  let loko = 0;
  for (const { etikedo, longo } of eroj) {
    if (estasSercxata(etikedo)) tabeloj[etikedo] = tranco(fluo, loko, longo);
    loko += longo;
  }
  return tabeloj;
}

/** One record of `name`, decoded: Windows/Unicode as UTF-16BE, Macintosh Roman as Latin-1. */
function nomoj(name: Buffer): Map<number, string> {
  const nombro = tranco(name, 2, 2).readUInt16BE(0);
  const komenco = tranco(name, 4, 2).readUInt16BE(0);
  // Per id the best record: Windows English first, then any Windows/Unicode, then Macintosh.
  const trovitaj = new Map<number, { rango: number; teksto: string }>();
  for (let i = 0; i < nombro; i++) {
    const r = tranco(name, 6 + 12 * i, 12);
    const platformo = r.readUInt16BE(0);
    const kodigo = r.readUInt16BE(2);
    const lingvo = r.readUInt16BE(4);
    const id = r.readUInt16BE(6);
    const datumo = tranco(name, komenco + r.readUInt16BE(10), r.readUInt16BE(8));
    let rango: number;
    let teksto: string;
    if (platformo === 3 || platformo === 0) {
      if (datumo.length % 2 !== 0) continue;
      teksto = Buffer.from(datumo).swap16().toString("utf16le");
      rango = platformo === 3 && lingvo === 0x409 ? 3 : 2;
    } else if (platformo === 1 && kodigo === 0) {
      teksto = datumo.toString("latin1");
      rango = 1;
    } else {
      continue;
    }
    teksto = teksto.trim();
    const nun = trovitaj.get(id);
    if (teksto !== "" && (nun === undefined || rango > nun.rango))
      trovitaj.set(id, { rango, teksto });
  }
  return new Map([...trovitaj].map(([id, { teksto }]) => [id, teksto]));
}

/** The weight a cut name says (Thin … Black), or undefined. */
function gewichtDeNomo(nomo: string): number | undefined {
  const n = nomo.toLowerCase().replace(/[\s_-]+/g, "");
  const ordo: [RegExp, number][] = [
    [/thin|hairline/, 100],
    [/(extra|ultra)light/, 200],
    [/(semi|demi)bold/, 600],
    [/(extra|ultra)bold/, 800],
    [/black|heavy/, 900],
    [/light/, 300],
    [/medium/, 500],
    [/bold/, 700],
    [/regular|normal|book|roman/, 400],
  ];
  for (const [esprimo, gewicht] of ordo) if (esprimo.test(n)) return gewicht;
  return undefined;
}

const estasKursiva = (nomo: string): boolean => /italic|oblique|kursiv/i.test(nomo);

/** Family and cut from the three tables; throws when `name` gives no family. */
function legoDeTabeloj(dosiero: string, tabeloj: Tabeloj): TiparoLego {
  if (tabeloj.name === undefined) throw new Nelegebla();
  const n = nomoj(tabeloj.name);
  const familie = n.get(16) ?? n.get(1);
  if (familie === undefined) throw new Nelegebla();
  const schnitt = n.get(17) ?? n.get(2) ?? "";
  let gewicht = gewichtDeNomo(schnitt) ?? 400;
  let kursiva = estasKursiva(schnitt);
  if (tabeloj["OS/2"] !== undefined) {
    const os2 = tabeloj["OS/2"];
    const klaso = tranco(os2, 4, 2).readUInt16BE(0);
    if (klaso >= 1 && klaso <= 1000) gewicht = klaso;
    kursiva = (tranco(os2, 62, 2).readUInt16BE(0) & 0x01) !== 0;
  }
  const lego: TiparoLego = {
    familie,
    dosiero: {
      name: dosiero,
      gewicht,
      stil: kursiva ? "italic" : "normal",
      variabel: false,
      quelle: "tabellen",
    },
  };
  const wght = tabeloj.fvar === undefined ? undefined : wghtDe(tabeloj.fvar);
  if (wght !== undefined) {
    lego.dosiero.gewicht = wght[0];
    lego.dosiero.gewichtBis = wght[1];
    lego.dosiero.variabel = true;
  }
  return lego;
}

/** The range of the `wght` axis of `fvar`, rounded; undefined without such an axis. */
function wghtDe(fvar: Buffer): [number, number] | undefined {
  const kapo = tranco(fvar, 0, 16);
  const ofseto = kapo.readUInt16BE(4);
  const nombro = kapo.readUInt16BE(8);
  const grando = kapo.readUInt16BE(10);
  for (let i = 0; i < nombro; i++) {
    const akso = tranco(fvar, ofseto + grando * i, 20);
    if (akso.toString("latin1", 0, 4) !== "wght") continue;
    const min = Math.round(akso.readInt32BE(4) / 65536);
    const max = Math.round(akso.readInt32BE(12) / 65536);
    if (min < 1 || max > 1000 || min > max) throw new Nelegebla();
    return [min, max];
  }
  return undefined;
}

/**
 * Family and cut from the file name alone (`quelle: "dateiname"`): the words before the first cut
 * keyword are the family; Regular, Bold, … give the weight, Italic the style, Variable the range of
 * CSS weights (100 to 900, the file says no more).
 */
export function legoDeDateinamo(dosiero: string): TiparoLego {
  const bazo = dosiero.replace(/\.[a-z0-9]+$/i, "");
  const vortoj = bazo.split(/[\s_-]+/).filter((v) => v !== "");
  const estasStilo = (v: string): boolean =>
    /^\d{3}$/.test(v) ||
    gewichtDeNomo(v) !== undefined ||
    estasKursiva(v) ||
    /^(variable|vf)$/i.test(v);
  const unua = vortoj.findIndex(estasStilo);
  const familie = (unua === -1 ? vortoj : vortoj.slice(0, unua)).join(" ") || bazo;
  const stilo = unua === -1 ? "" : vortoj.slice(unua).join(" ");
  const nombro = /(?:^|\s)([1-9]00)(?:\s|$)/.exec(stilo)?.[1];
  const variabla = /(^|\s)(variable|vf)(\s|$)/i.test(stilo);
  const dosieroLego: SchriftDosiero = {
    name: dosiero,
    gewicht: variabla ? 100 : nombro !== undefined ? Number(nombro) : (gewichtDeNomo(stilo) ?? 400),
    stil: estasKursiva(stilo) ? "italic" : "normal",
    variabel: variabla,
    quelle: "dateiname",
  };
  if (variabla) dosieroLego.gewichtBis = 900;
  return { familie, dosiero: dosieroLego };
}

/**
 * Reads one font file: undefined when its bytes are no font or its extension does not fit them;
 * from its tables when they read, else from its file name.
 */
export function tiparoLegi(
  dosiero: string,
  bytes: Uint8Array,
  grenze: number,
): TiparoLego | undefined {
  const formo = formoDe(bytes);
  const permesitaj = FORMOJ_DE_FINAJXO[extname(dosiero).toLowerCase()];
  if (formo === undefined || permesitaj === undefined || !permesitaj.includes(formo))
    return undefined;
  const b = bufferDe(bytes);
  try {
    const tabeloj =
      formo === "woff"
        ? woffTabeloj(b, grenze)
        : formo === "woff2"
          ? woff2Tabeloj(b, grenze)
          : sfntTabeloj(b);
    return legoDeTabeloj(dosiero, tabeloj);
  } catch (eraro) {
    if (!(eraro instanceof Nelegebla) && !(eraro instanceof RangeError)) throw eraro;
    return legoDeDateinamo(dosiero);
  }
}

// ---------------------------------------------------------------------------------------------
// What a family has and lacks (the node keeps the same three functions in schriftdosieroj-datumoj.ts)

const GEWICHT_NOMOJ: Readonly<Record<number, string>> = {
  100: "Thin",
  200: "ExtraLight",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "SemiBold",
  700: "Bold",
  800: "ExtraBold",
  900: "Black",
};

/** Files by weight, then normal before italic, then name. */
const ordo = (a: SchriftDosiero, b: SchriftDosiero): number =>
  a.gewicht - b.gewicht ||
  Number(a.stil === "italic") - Number(b.stil === "italic") ||
  (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

/** „Regular 400“, „Italic 400“, „Bold Italic 700“; a cut from the file name with its note. */
function schnittNomoDe(d: SchriftDosiero): string {
  const nomo = GEWICHT_NOMOJ[Math.min(900, Math.max(100, Math.round(d.gewicht / 100) * 100))] ?? "";
  const stilo = d.stil === "italic" ? (nomo === "Regular" ? "Italic" : `${nomo} Italic`) : nomo;
  return `${stilo} ${d.gewicht}${d.quelle === "dateiname" ? ` (${AUS_DATEINAME})` : ""}`;
}

/** What a family lacks of Regular (400 normal), Bold (700 normal) and Italic (any weight). */
export function fehltDe(dateien: readonly SchriftDosiero[]): string[] {
  const kovras = (gewicht: number): boolean =>
    dateien.some(
      (d) =>
        d.stil === "normal" &&
        (d.variabel
          ? d.gewicht <= gewicht && gewicht <= (d.gewichtBis ?? d.gewicht)
          : d.gewicht === gewicht),
    );
  const fehlt: string[] = [];
  if (!kovras(400)) fehlt.push("Regular");
  if (!kovras(700)) fehlt.push("Bold");
  if (!dateien.some((d) => d.stil === "italic")) fehlt.push("Italic");
  return fehlt;
}

/**
 * The sentence of a family: „Variable Schrift, Gewichte 100 bis 900.“ per range of its variable
 * files, „Gefunden: Regular 400, Bold 700.“ for its other files, then „Es fehlt: …“.
 */
export function schnitteBeschreibungDe(dateien: readonly SchriftDosiero[]): string {
  const ordigitaj = [...dateien].sort(ordo);
  const variablaj = [
    ...new Set(
      ordigitaj
        .filter((d) => d.variabel)
        .map((d) => {
          const satz = variabelSatzDe(d.gewicht, d.gewichtBis ?? d.gewicht);
          return d.quelle === "dateiname" ? satz.replace(/\.$/, ` (${AUS_DATEINAME}).`) : satz;
        }),
    ),
  ];
  const statikaj = ordigitaj.filter((d) => !d.variabel).map(schnittNomoDe);
  const fehlt = fehltDe(dateien);
  if (statikaj.length > 0) return [...variablaj, schnitteSatzDe(statikaj, fehlt)].join(" ");
  // Only variable files: „Es fehlt: …“ as schnitteSatzDe words it.
  const nurFehlt = schnitteSatzDe(["-"], fehlt).slice(schnitteSatzDe(["-"], []).length + 1);
  return [...variablaj, ...(fehlt.length === 0 ? [] : [nurFehlt])].join(" ");
}

/** The families of an upload: grouped by name (letter case aside, the first spelling stays), sorted. */
export function familienDe(legoj: readonly TiparoLego[]): SchriftFamilio[] {
  const familioj = new Map<string, { familie: string; dateien: SchriftDosiero[] }>();
  for (const { familie, dosiero } of legoj) {
    const sxlosilo = familie.toLowerCase();
    const familio = familioj.get(sxlosilo) ?? { familie, dateien: [] };
    familio.dateien = [...familio.dateien.filter((d) => d.name !== dosiero.name), dosiero];
    familioj.set(sxlosilo, familio);
  }
  return [...familioj.values()]
    .map(({ familie, dateien }) => ({
      familie,
      dateien: [...dateien].sort(ordo),
      fehlt: fehltDe(dateien),
    }))
    .sort((a, b) => (a.familie.toLowerCase() < b.familie.toLowerCase() ? -1 : 1));
}
