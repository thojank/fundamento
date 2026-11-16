// Spec 056 (MP-2a, T7, KBS-3.5, plan D-11, D-12, D-13): the routes of own fonts.
//   POST /api/marko/:name/schriftdateien   {filename, base64} (a font file or a ZIP)
//        → 200 {familien: [{familie, dateien, fehlt}], uebergangen} | 422 {satz} | 404 {satz}
//   GET  /marko/:name/fontoj/:datei        an own font file of that brand, for @font-face
//   POST /api/marko/:name/schrift-privat   {familie, bestaetigt?} → 200 {satz, frage?} | 404 {satz}
// Read first, then store (product spec Teil C): a font file is read by `tiparoLegi`, a ZIP by
// `zipLegi` and each of its font files by `tiparoLegi`; only when everything read do the font files
// go into `marken/<name>/fontoj/` through the existing `storeUpload` (behind its `.gitignore`) –
// never the ZIP itself, never a file that did not read. Every uploaded font counts as licensed and
// private: it is set through the canvas's write path (`{schrift: {rolle, eigene}}`, „lizenziert,
// nicht enthalten“) and goes nowhere but the work folder, or – after a confirmation – the private
// repository through the existing way (`privataState`, `uploadFont`). `eigeneFontFace` gives the
// preview and the Verstehen page `@font-face` rules on the brand's own files for every own family
// its Agordo names. 404 `{satz}` for an unknown brand, as the other 056 routes; no rule, no
// judgement. The legacy Studio upload (`draft.upload`) is not touched.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { extname, join } from "node:path";
import type { Agordo } from "@fundamento/agordilo";
import {
  NELEGEBLA_DOSIERO_SATZ,
  TRO_GRANDA_SATZ,
  ZIP_OHNE_SCHRIFT_SATZ,
} from "./grafeo-gestalten-sicht.js";
import { isFontFile } from "./kontrolo.js";
import { markoDir, safeFilename, storeUpload } from "./marko.js";
import { uploadFont } from "./privata.js";
import { dateiGrenzeDe, type VojoKunteksto } from "./servilo.js";
import { familienDe, type TiparoLego, tiparoLegi } from "./tiparo-legi.js";
import { zipLegi } from "./zip-legi.js";

/**
 * The folder of a brand's own font files, beside `materialo/` (`marken/<name>/fontoj/`).
 * `GET /api/leinwand` marks a file of the Schrift node that is not there `fehlt: true`.
 */
export const FONTOJ_DIR = "fontoj";

const NENIA_MARKO = "Diese Marke gibt es nicht.";
/** The Studio's sentence when there is no file to put into the private repository (servilo.ts). */
const NENIA_DOSIERO_PRIVATA = "Kein Push: Es liegt keine Datei zum Hochladen bereit.";

/** The content type and the CSS `format()` of each font extension. */
const FORMOJ: Readonly<Record<string, { tipo: string; formato: string }>> = {
  ".woff2": { tipo: "font/woff2", formato: "woff2" },
  ".woff": { tipo: "font/woff", formato: "woff" },
  ".ttf": { tipo: "font/ttf", formato: "truetype" },
  ".otf": { tipo: "font/otf", formato: "opentype" },
};

/** A file that does not read: its sentence, nothing kept. */
class Nelegebla extends Error {}

const isObjekto = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

const fontojDir = (kunteksto: VojoKunteksto, name: string): string =>
  join(markoDir(kunteksto.options.workdir, name), FONTOJ_DIR);

/** The fonts of one upload, read: a font file, or the font files of a ZIP (by their own names). */
function legiAlsxuton(
  filename: string,
  bytes: Buffer,
  grenze: number,
): { legoj: { lego: TiparoLego; bytes: Buffer }[]; uebergangen: number } {
  const dosiero = safeFilename(filename);
  if (extname(dosiero).toLowerCase() === ".zip") {
    const zip = zipLegi(bytes, grenze);
    if (zip === undefined) throw new Nelegebla(NELEGEBLA_DOSIERO_SATZ);
    if (zip.dateien.length === 0) throw new Nelegebla(ZIP_OHNE_SCHRIFT_SATZ);
    // The same file name twice (in two folders): the later one wins, as a later upload would.
    const laNomo = new Map<string, Buffer>();
    for (const ero of zip.dateien) {
      const nomo = safeFilename(ero.nomo.split("/").pop() ?? "");
      if (nomo === "") throw new Nelegebla(NELEGEBLA_DOSIERO_SATZ);
      laNomo.delete(nomo);
      laNomo.set(nomo, ero.bytes);
    }
    const legoj = [...laNomo].map(([nomo, datumo]) => {
      const lego = tiparoLegi(nomo, datumo, grenze);
      if (lego === undefined) throw new Nelegebla(NELEGEBLA_DOSIERO_SATZ);
      return { lego, bytes: datumo };
    });
    return { legoj, uebergangen: zip.uebergangen };
  }
  const lego =
    dosiero === "" || !isFontFile(dosiero) ? undefined : tiparoLegi(dosiero, bytes, grenze);
  if (lego === undefined) throw new Nelegebla(NELEGEBLA_DOSIERO_SATZ);
  return { legoj: [{ lego, bytes }], uebergangen: 0 };
}

/** The own font files of a brand, read (cached per file by its size and time). */
const legitaj = new Map<string, { sxlosilo: string; lego: TiparoLego | undefined }>();
function fontojDe(dir: string, grenze: number): TiparoLego[] {
  if (!existsSync(dir)) return [];
  const legoj: TiparoLego[] = [];
  for (const dosiero of readdirSync(dir).sort()) {
    if (!isFontFile(dosiero) || safeFilename(dosiero) !== dosiero) continue;
    const loko = join(dir, dosiero);
    let sxlosilo: string;
    try {
      const stato = statSync(loko);
      if (!stato.isFile()) continue;
      sxlosilo = `${stato.size}:${stato.mtimeMs}`;
    } catch {
      continue;
    }
    let ero = legitaj.get(loko);
    if (ero?.sxlosilo !== sxlosilo) {
      ero = { sxlosilo, lego: tiparoLegi(dosiero, readFileSync(loko), grenze) };
      legitaj.set(loko, ero);
    }
    if (ero.lego !== undefined) legoj.push(ero.lego);
  }
  return legoj;
}

/** Handles a request of own fonts and answers true, or answers false and leaves it alone. */
export async function schriftdosierojVojoj(
  kunteksto: VojoKunteksto,
  peto: IncomingMessage,
  respondo: ServerResponse,
  method: string,
  path: string,
  _url: URL,
): Promise<boolean> {
  const sxargo = /^\/api\/marko\/([a-z0-9-]+)\/schriftdateien$/.exec(path);
  if (sxargo !== null && method === "POST") {
    await alsxuti(kunteksto, peto, respondo, sxargo[1] ?? "");
    return true;
  }
  const dosiero = /^\/marko\/([a-z0-9-]+)\/fontoj\/([^/]+)$/.exec(path);
  if (dosiero !== null && method === "GET") {
    liveri(kunteksto, respondo, dosiero[1] ?? "", dosiero[2] ?? "");
    return true;
  }
  const privata = /^\/api\/marko\/([a-z0-9-]+)\/schrift-privat$/.exec(path);
  if (privata !== null && method === "POST") {
    await enPrivatan(kunteksto, peto, respondo, privata[1] ?? "");
    return true;
  }
  return false;
}

/** POST …/schriftdateien: read everything, then store the font files. */
async function alsxuti(
  kunteksto: VojoKunteksto,
  peto: IncomingMessage,
  respondo: ServerResponse,
  name: string,
): Promise<void> {
  const { sendJson } = kunteksto;
  const lego = await kunteksto.korpoDe(peto);
  if (kunteksto.draftOf(name) === undefined) {
    sendJson(respondo, { satz: NENIA_MARKO }, 404);
    return;
  }
  if ("troGranda" in lego) {
    sendJson(respondo, { satz: `${NELEGEBLA_DOSIERO_SATZ}. ${TRO_GRANDA_SATZ}` }, 422);
    return;
  }
  let korpo: unknown;
  try {
    korpo = JSON.parse(lego.teksto);
  } catch {
    korpo = undefined;
  }
  try {
    if (!isObjekto(korpo) || typeof korpo.filename !== "string" || typeof korpo.base64 !== "string")
      throw new Nelegebla(NELEGEBLA_DOSIERO_SATZ);
    const bytes = Buffer.from(korpo.base64, "base64");
    const { legoj, uebergangen } = legiAlsxuton(
      korpo.filename,
      bytes,
      dateiGrenzeDe(kunteksto.ANFRAGE_GRENZE),
    );
    for (const { lego: l, bytes: datumo } of legoj) {
      storeUpload(kunteksto.options.workdir, name, { filename: l.dosiero.name, bytes: datumo });
    }
    kunteksto.leinwandBildoForigi(name);
    sendJson(respondo, { familien: familienDe(legoj.map((l) => l.lego)), uebergangen });
  } catch (eraro) {
    if (!(eraro instanceof Nelegebla)) throw eraro;
    sendJson(respondo, { satz: eraro.message }, 422);
  }
}

/** GET /marko/:name/fontoj/:datei: only a font file of that brand's `fontoj/`. */
function liveri(
  kunteksto: VojoKunteksto,
  respondo: ServerResponse,
  name: string,
  kruda: string,
): void {
  let dosiero = "";
  try {
    dosiero = decodeURIComponent(kruda);
  } catch {}
  const formo = FORMOJ[extname(dosiero).toLowerCase()];
  const loko = join(fontojDir(kunteksto, name), dosiero);
  if (
    kunteksto.draftOf(name) === undefined ||
    dosiero === "" ||
    safeFilename(dosiero) !== dosiero ||
    formo === undefined ||
    !existsSync(loko)
  ) {
    kunteksto.notFound(respondo);
    return;
  }
  respondo
    .writeHead(200, {
      "content-type": formo.tipo,
      "x-content-type-options": "nosniff",
      "cache-control": "no-store",
    })
    .end(readFileSync(loko));
}

/**
 * POST …/schrift-privat: the existing way only. Without FM_TIPAROJ_REPO its sentence; else first
 * its sentence as the question (`frage: true`), and with `bestaetigt: true` `uploadFont` for every
 * file of the family here – the first refusal („Kein Push: …“) ends it, the font stays usable.
 */
async function enPrivatan(
  kunteksto: VojoKunteksto,
  peto: IncomingMessage,
  respondo: ServerResponse,
  name: string,
): Promise<void> {
  const { sendJson, options } = kunteksto;
  const lego = await kunteksto.korpoDe(peto);
  if (kunteksto.draftOf(name) === undefined) {
    sendJson(respondo, { satz: NENIA_MARKO }, 404);
    return;
  }
  let korpo: unknown;
  try {
    korpo = "teksto" in lego ? JSON.parse(lego.teksto) : undefined;
  } catch {
    korpo = undefined;
  }
  const familie = isObjekto(korpo) && typeof korpo.familie === "string" ? korpo.familie.trim() : "";
  if (familie === "") {
    sendJson(respondo, { satz: NELEGEBLA_DOSIERO_SATZ }, 422);
    return;
  }
  const repo = options.settings.tiparojRepo;
  if (kunteksto.privata.locked || repo === undefined || options.deps === undefined) {
    sendJson(respondo, { satz: kunteksto.privata.sentence });
    return;
  }
  if (!(isObjekto(korpo) && korpo.bestaetigt === true)) {
    sendJson(respondo, { satz: kunteksto.privata.sentence, frage: true });
    return;
  }
  const dir = fontojDir(kunteksto, name);
  const familio = familienDe(fontojDe(dir, dateiGrenzeDe(kunteksto.ANFRAGE_GRENZE))).find(
    (f) => f.familie.toLowerCase() === familie.toLowerCase(),
  );
  if (familio === undefined) {
    sendJson(respondo, { satz: NENIA_DOSIERO_PRIVATA });
    return;
  }
  const satzoj: string[] = [];
  for (const d of familio.dateien) {
    const rezulto = await uploadFont(
      repo,
      options.deps,
      { name: d.name, bytes: readFileSync(join(dir, d.name)) },
      familio.familie,
    );
    if (!rezulto.pushed) {
      sendJson(respondo, { satz: rezulto.sentence });
      return;
    }
    satzoj.push(rezulto.sentence);
  }
  sendJson(respondo, { satz: satzoj.join(" ") });
}

/**
 * The `@font-face` rules of the brand's own fonts its Agordo names (on `/marko/:name/fontoj/…`), or
 * "" – then the rules of `fontFaceOf` stay byte-identical. An Agordo without an own font (no font
 * that is not redistributable) gives "" before anything else is read.
 */
export function eigeneFontFace(kunteksto: VojoKunteksto, name: string, agordo: Agordo): string {
  const familioj = new Map<string, string>();
  for (const fonto of [agordo.schriften?.display, agordo.schriften?.body, agordo.schriften?.code]) {
    if (fonto !== undefined && fonto.redistributable === false && fonto.family.trim() !== "")
      familioj.set(fonto.family.trim().toLowerCase(), fonto.family.trim());
  }
  if (familioj.size === 0) return "";
  const legoj = fontojDe(fontojDir(kunteksto, name), dateiGrenzeDe(kunteksto.ANFRAGE_GRENZE));
  return familienDe(legoj)
    .flatMap(({ familie, dateien }) => {
      const nomo = familioj.get(familie.toLowerCase());
      if (nomo === undefined) return [];
      return dateien.map((d) => {
        const formo = FORMOJ[extname(d.name).toLowerCase()];
        const gewicht = d.variabel ? `${d.gewicht} ${d.gewichtBis ?? d.gewicht}` : `${d.gewicht}`;
        return `@font-face { font-family: ${JSON.stringify(nomo)}; font-style: ${d.stil}; font-weight: ${gewicht}; font-display: swap; src: url(/marko/${encodeURIComponent(name)}/fontoj/${encodeURIComponent(d.name)}) format("${formo?.formato ?? "woff2"}"); }`;
      });
    })
    .join("\n");
}
