// Spec 056 (MP-2a, T4, KBS-3.2, plan D-9, D-10, D-11, D-13): the routes of the node Beispiele.
//   POST   /api/marko/:name/beispiele          {filename, base64} | {url}
//          → 200 {datei: {name, art, farben, satz?}} | 200 {verweis: {adresse, satz}} | 422 {satz}
//   DELETE /api/marko/:name/beispiele/:datei   → 200 {} | 404 {satz}
// A file is read by the Enportilo (`legiMaterialon`) in a temporary work folder first, because the
// Enportilo stores a file before it decodes it: only a file that reads moves into
// `marken/<name>/materialo/` (behind its `.gitignore`), so a broken file is never kept and never
// replaces a good one of the same name (D-9). Only PNG, JPG, WebP, SVG and PDF are taken, and the
// bytes must be what the extension says; a font never reaches the Enportilo here. Every colour
// carries its flags from `farbArtDe` (D-5). An address is fetched once through the server's
// `esploro.fetch` – no cookie, no account, redirects followed, the Enportilo's time limit (D-10):
// an image goes on as an upload, anything else (a page, an error, no answer) becomes a reference
// with its sentence, Pinterest's own. The images are only evaluated: no preview, export or package
// reads them. 404 `{satz}` for an unknown brand, as the 055 state routes; no rule, no judgement.
// Spec 058 (MP-2c, T8, MAW-3.5): with `{url, vorschau: true}` the address is first checked with
// `permesataAdreso` (no private address is fetched), and a page whose FINAL address after the
// redirects is Pinterest's is read by `pinterestVorschauDe`: 200 `{verweis: {adresse, titel?,
// bilder: [{vorschau, bild}]}}`. A redirect elsewhere, 403/429, a login, an empty list or no
// answer keep the reference with Pinterest's sentence. Same fetch, same time limit, same per-file
// limit for the page. Without `vorschau` every answer is byte-identical to Spec 056.

import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { type PinterestBild, pinterestVorschauDe } from "./beispiele-pinterest.js";
import { legiMaterialon, MATERIALO_DIR } from "./enportilo/materialo.js";
import { RETEJO_TEMPOLIMO } from "./enportilo/retejo.js";
import { permesataAdreso } from "./esploro/esploro.js";
import { farbArtDe } from "./farb-arto.js";
import {
  type BeispielArt,
  type BeispielDosiero,
  type ErkanntaFarbo,
  KEIN_BILD_SATZ,
  NELEGEBLA_DOSIERO_SATZ,
  PINTEREST_SATZ,
  TRO_GRANDA_SATZ,
  type Verweis,
} from "./grafeo-gestalten-sicht.js";
import { KREILO } from "./kreilo/datoj.js";
import { markoDir, safeFilename } from "./marko.js";
import { dateiGrenzeDe, type VojoKunteksto } from "./servilo.js";

/** The extensions Beispiele takes, with the kind they are stored as. */
const ARTOJ_DE_FINAJXO: Readonly<Record<string, BeispielArt>> = {
  ".png": "png",
  ".jpg": "jpg",
  ".jpeg": "jpg",
  ".webp": "webp",
  ".svg": "svg",
  ".pdf": "pdf",
};

const NENIA_MARKO = "Diese Marke gibt es nicht.";
const NENIA_DOSIERO = "Diese Datei gibt es nicht.";

/** A file that does not read: the calm sentence, nothing kept. */
class Nelegebla extends Error {}

/**
 * The kind of a file by its first bytes; undefined for anything else. An SVG must begin with its
 * root element (after an XML declaration, comments or a doctype), so a page with an inline
 * drawing is no SVG.
 */
export function artDeBajtoj(bytes: Uint8Array): BeispielArt | undefined {
  const b = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    return "png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.toString("latin1", 0, 4) === "RIFF" && b.toString("latin1", 8, 12) === "WEBP")
    return "webp";
  if (b.toString("latin1", 0, 5) === "%PDF-") return "pdf";
  let kapo = b.toString("utf8", 0, 4096).replace(/^﻿/, "");
  for (;;) {
    const sen = kapo.replace(/^\s*(<\?xml[\s\S]*?\?>|<!--[\s\S]*?-->|<!DOCTYPE\s+svg[^>]*>)/i, "");
    if (sen === kapo) break;
    kapo = sen;
  }
  return /^\s*<svg[\s>]/i.test(kapo) ? "svg" : undefined;
}

/** The colours of a reading as Beispiele stores them: share in percent (0.1) and flags (D-5). */
function farbenDe(
  trovoj: readonly { kind: string; valoro: string | number; pezo: number }[],
  art: BeispielArt,
): ErkanntaFarbo[] {
  const farboj = trovoj.filter((t) => t.kind === "farbo" && typeof t.valoro === "string");
  // An image gives shares of its area; SVG and PDF give how often a fill stands in the file.
  const sumo = farboj.reduce((s, t) => s + t.pezo, 0);
  const anteilDe = (pezo: number): number =>
    art === "svg" || art === "pdf" ? Math.round((1000 * pezo) / Math.max(1, sumo)) / 10 : pezo;
  const farben: ErkanntaFarbo[] = [];
  for (const trovo of farboj) {
    const hex = String(trovo.valoro).toLowerCase();
    const arto = farbArtDe(hex, KREILO.unbunt);
    if (arto !== undefined) farben.push({ hex, anteil: anteilDe(trovo.pezo), ...arto });
  }
  return farben;
}

/**
 * Reads one file for Beispiele and keeps it in the brand's `materialo/` only when it reads (D-9);
 * throws Nelegebla otherwise, with nothing written there.
 */
async function legiBeispielon(
  kunteksto: VojoKunteksto,
  name: string,
  filename: string,
  bytes: Buffer,
): Promise<BeispielDosiero> {
  const dosiero = safeFilename(filename);
  const art = ARTOJ_DE_FINAJXO[extname(dosiero).toLowerCase()];
  if (dosiero === "" || art === undefined || artDeBajtoj(bytes) !== art) throw new Nelegebla();
  const provejo = mkdtempSync(join(tmpdir(), "fm-beispiele-"));
  try {
    let legado: Awaited<ReturnType<typeof legiMaterialon>>;
    try {
      legado = await legiMaterialon(
        { filename: dosiero, bytes },
        { workdir: provejo, name, familyOf: () => "", bildilo: kunteksto.bildilo },
      );
    } catch {
      throw new Nelegebla();
    }
    const provita = join(provejo, name, MATERIALO_DIR, dosiero);
    if (!existsSync(provita)) throw new Nelegebla();
    const celo = join(markoDir(kunteksto.options.workdir, name), MATERIALO_DIR);
    mkdirSync(celo, { recursive: true });
    writeFileSync(join(celo, ".gitignore"), "*\n");
    copyFileSync(provita, join(celo, dosiero));
    const satz = legado.satzoj[0];
    return {
      name: dosiero,
      art,
      farben: farbenDe(legado.trovoj, art),
      ...(satz === undefined ? {} : { satz }),
    };
  } finally {
    rmSync(provejo, { recursive: true, force: true });
  }
}

/** Whether an address is Pinterest's (`pinterest.<tld>` with any subdomain, or `pin.it`). */
export function estasPinterest(adresse: URL): boolean {
  const host = adresse.hostname.toLowerCase();
  return host === "pin.it" || /(^|\.)pinterest\.[a-z.]+$/.test(host);
}

/** The body of an answer up to `grenze` bytes; undefined when it is larger. */
async function korpoGis(respondo: Response, grenze: number): Promise<Buffer | undefined> {
  if (respondo.body === null) return Buffer.alloc(0);
  const partoj: Uint8Array[] = [];
  let grando = 0;
  const leganto = respondo.body.getReader();
  for (;;) {
    const { done, value } = await leganto.read();
    if (done) break;
    grando += value.byteLength;
    if (grando > grenze) {
      await leganto.cancel();
      return undefined;
    }
    partoj.push(value);
  }
  return Buffer.concat(partoj);
}

/** The finajxo of a stored kind, for an address whose name says none. */
const FINAJXO_DE_ARTO: Readonly<Record<BeispielArt, string>> = {
  png: ".png",
  jpg: ".jpg",
  webp: ".webp",
  svg: ".svg",
  pdf: ".pdf",
};

/** The file name of a loaded image: the last part of the address, with the kind its bytes say. */
function dosieroDeAdreso(adresse: URL, art: BeispielArt | undefined, tipo: string): string {
  const lasta =
    adresse.pathname
      .split("/")
      .filter((p) => p !== "")
      .pop() ?? "";
  let nomo = lasta;
  try {
    nomo = decodeURIComponent(lasta);
  } catch {}
  const sekura = safeFilename(nomo);
  const finajxo = extname(sekura);
  const bazo = (finajxo === "" ? sekura : sekura.slice(0, -finajxo.length)) || "bild";
  if (art === undefined) {
    // An image the Enportilo does not read (GIF, …): named after its type, so it is refused.
    const subtipo = /^image\/([a-z0-9.+-]+)/.exec(tipo)?.[1] ?? "bild";
    return `${bazo}.${safeFilename(subtipo) || "bild"}`;
  }
  return ARTOJ_DE_FINAJXO[finajxo.toLowerCase()] === art
    ? sekura
    : `${bazo}${FINAJXO_DE_ARTO[art]}`;
}

type Ligado =
  | { datei: BeispielDosiero }
  | { verweis: Verweis }
  | { verweis: { adresse: string; titel?: string; bilder: PinterestBild[] } };

/** The address an answer came from after the redirects (a double may name none: the asked one). */
function finaAdreso(respondo: Response, adresse: URL): URL {
  try {
    return respondo.url === "" ? adresse : new URL(respondo.url);
  } catch {
    return adresse;
  }
}

/** Pinterest's login or sign-up page: never read (no login is bypassed). */
const estasAnmeldung = (adresse: URL): boolean =>
  /^\/(login|signup|register)(\/|$)/i.test(adresse.pathname);

/**
 * Loads an address once (D-10): an image as an upload, anything else as a reference. Spec 058:
 * with `vorschau` a private address is not fetched, and a Pinterest page gives its preview.
 */
async function legiAdreson(
  kunteksto: VojoKunteksto,
  name: string,
  adresse: URL,
  teksto: string,
  vorschau = false,
): Promise<Ligado> {
  const verweis = (): Ligado => ({
    verweis: { adresse: teksto, satz: estasPinterest(adresse) ? PINTEREST_SATZ : KEIN_BILD_SATZ },
  });
  if (vorschau && !permesataAdreso(adresse.toString())) return verweis();
  const abrufi = kunteksto.options.esploro?.fetch ?? fetch;
  let respondo: Response;
  try {
    respondo = await abrufi(adresse.toString(), {
      signal: AbortSignal.timeout(RETEJO_TEMPOLIMO),
      redirect: "follow",
      credentials: "omit",
      headers: {},
    });
  } catch {
    return verweis();
  }
  if (!respondo.ok) return verweis();
  if (vorschau) {
    const fina = finaAdreso(respondo, adresse);
    if (estasPinterest(fina)) return legiPinterest(kunteksto, respondo, fina, teksto, verweis);
    // A Pinterest link that ends elsewhere is not read there.
    if (estasPinterest(adresse)) return verweis();
  }
  const tipo = (respondo.headers.get("content-type") ?? "").toLowerCase();
  let bytes: Buffer | undefined;
  try {
    bytes = await korpoGis(respondo, dateiGrenzeDe(kunteksto.ANFRAGE_GRENZE));
  } catch {
    return verweis();
  }
  const bildTipo = tipo.startsWith("image/");
  if (bytes === undefined) {
    if (bildTipo) throw new Nelegebla(`${NELEGEBLA_DOSIERO_SATZ}. ${TRO_GRANDA_SATZ}`);
    return verweis();
  }
  const art = artDeBajtoj(bytes);
  if (art === undefined && !bildTipo) return verweis();
  return {
    datei: await legiBeispielon(kunteksto, name, dosieroDeAdreso(adresse, art, tipo), bytes),
  };
}

/** Spec 058: reads a Pinterest page (final address `fina`) into its preview, else the reference. */
async function legiPinterest(
  kunteksto: VojoKunteksto,
  respondo: Response,
  fina: URL,
  teksto: string,
  verweis: () => Ligado,
): Promise<Ligado> {
  const tipo = (respondo.headers.get("content-type") ?? "").toLowerCase();
  if (estasAnmeldung(fina) || tipo.startsWith("image/")) return verweis();
  let bytes: Buffer | undefined;
  try {
    bytes = await korpoGis(respondo, dateiGrenzeDe(kunteksto.ANFRAGE_GRENZE));
  } catch {
    return verweis();
  }
  if (bytes === undefined) return verweis();
  const { titel, bilder } = pinterestVorschauDe(bytes.toString("utf8"), fina.toString());
  if (bilder.length === 0) return verweis();
  return { verweis: { adresse: teksto, ...(titel === undefined ? {} : { titel }), bilder } };
}

/** A web address of the text, or undefined (no address, or not http/https). */
function adresoDe(teksto: string): URL | undefined {
  try {
    const adresse = new URL(teksto.trim());
    return adresse.protocol === "http:" || adresse.protocol === "https:" ? adresse : undefined;
  } catch {
    return undefined;
  }
}

const isObjekto = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

/** Handles a request of Beispiele and answers true, or answers false and leaves it alone. */
export async function beispieleVojoj(
  kunteksto: VojoKunteksto,
  peto: IncomingMessage,
  respondo: ServerResponse,
  method: string,
  path: string,
  _url: URL,
): Promise<boolean> {
  const { sendJson } = kunteksto;
  const sxargo = /^\/api\/marko\/([a-z0-9-]+)\/beispiele$/.exec(path);
  if (sxargo !== null && method === "POST") {
    const [, name = ""] = sxargo;
    const lego = await kunteksto.korpoDe(peto);
    if (kunteksto.draftOf(name) === undefined) {
      sendJson(respondo, { satz: NENIA_MARKO }, 404);
      return true;
    }
    if ("troGranda" in lego) {
      sendJson(respondo, { satz: `${NELEGEBLA_DOSIERO_SATZ}. ${TRO_GRANDA_SATZ}` }, 422);
      return true;
    }
    let korpo: unknown;
    try {
      korpo = JSON.parse(lego.teksto);
    } catch {
      korpo = undefined;
    }
    try {
      if (isObjekto(korpo) && typeof korpo.url === "string") {
        const adresse = adresoDe(korpo.url);
        if (adresse === undefined) {
          sendJson(respondo, { satz: KEIN_BILD_SATZ }, 422);
          return true;
        }
        const vorschau = korpo.vorschau === true;
        sendJson(respondo, await legiAdreson(kunteksto, name, adresse, korpo.url.trim(), vorschau));
      } else if (
        isObjekto(korpo) &&
        typeof korpo.filename === "string" &&
        typeof korpo.base64 === "string"
      ) {
        const bytes = Buffer.from(korpo.base64, "base64");
        sendJson(respondo, { datei: await legiBeispielon(kunteksto, name, korpo.filename, bytes) });
      } else {
        throw new Nelegebla();
      }
    } catch (eraro) {
      if (!(eraro instanceof Nelegebla)) throw eraro;
      sendJson(respondo, { satz: eraro.message || NELEGEBLA_DOSIERO_SATZ }, 422);
      return true;
    }
    kunteksto.leinwandBildoForigi(name);
    return true;
  }
  const forigo = /^\/api\/marko\/([a-z0-9-]+)\/beispiele\/([^/]+)$/.exec(path);
  if (forigo !== null && method === "DELETE") {
    const [, name = "", kruda = ""] = forigo;
    if (kunteksto.draftOf(name) === undefined) {
      sendJson(respondo, { satz: NENIA_MARKO }, 404);
      return true;
    }
    let dosiero = "";
    try {
      dosiero = decodeURIComponent(kruda);
    } catch {}
    const dir = join(markoDir(kunteksto.options.workdir, name), MATERIALO_DIR);
    const loko = join(dir, dosiero);
    if (
      dosiero === "" ||
      safeFilename(dosiero) !== dosiero ||
      ARTOJ_DE_FINAJXO[extname(dosiero).toLowerCase()] === undefined ||
      !existsSync(loko)
    ) {
      sendJson(respondo, { satz: NENIA_DOSIERO }, 404);
      return true;
    }
    rmSync(loko, { force: true });
    kunteksto.leinwandBildoForigi(name);
    sendJson(respondo, {});
    return true;
  }
  return false;
}
