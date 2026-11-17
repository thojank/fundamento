// Spec 058 (MP-2c, T9, MAW-4.2, part G, plan §3.3): the routes of the Layout-Beispiel, a module of
// VOJOJ_058 (registered once in the frozen `servilo.ts`, asked after VOJOJ_056).
//
//   POST   /api/marko/:name/layout-beispiel {filename, base64}
//          → 200 {datei: {name, art, farben, satz?}} | 422 {satz} | 404 {satz}
//          The same formats, byte check, per-file limit and colour reading as Beispiele (the file is
//          read by the Enportilo in a temporary folder first; only a file that reads is kept). It
//          lies in `materialo/layout/` (behind the work folder's `.gitignore`), one per brand: a new
//          one replaces the old. The route stores `{datei}` as the node's content itself, so the
//          features, reason and dot of the old file go; the previews' hand choices are not touched.
//   DELETE /api/marko/:name/layout-beispiel → 200 {} | 404 {satz}
//          Removes the file and the node's content (features, reason, dot); hand choices stay.
//   POST   /api/marko/:name/ki/aufbau → 200 {merkmale, worte?, aufbau, grund, kosto, verworfen?}
//          „Aufbau erkennen“, the only route of this spec that sends an image: the stored file,
//          downscaled to MAX_RANDO and re-encoded (`layout-bild.ts`), as exactly one `image_url`
//          part beside the fixed question of `auftragAufbau()` – no text of the brand, no file name.
//          The errors of the §3.3 table, with the shared helper's sentences: 503 without a model;
//          422 without a file (KEINE_EINGABE), for PDF/SVG (NUR_BILD_SATZ) and without a browser to
//          decode a JPG/WebP (the Enportilo's sentence for that case); 502 with the existing
//          sentence and the cost – KEINE_BILDER_SATZ when the provider's error shows that the model
//          reads no images; 422 KI_UNLESBAR with the cost. The result (features, words, cost) is
//          stored in `layout-beispiel.inhalt` by the route, beside the file.
// The colours of the Layout-Beispiel are evaluated only: they do not take part in „Farbe folgt den
// Bildern“ (that rule reads Beispiele only), and no export or package reads `materialo/`.

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { artDeBajtoj } from "./beispiele-vojoj.js";
import { SenBrowser } from "./enportilo/bildilo.js";
import { legiMaterialon, MATERIALO_DIR } from "./enportilo/materialo.js";
import { farbArtDe } from "./farb-arto.js";
import {
  type BeispielArt,
  type BeispielDosiero,
  type ErkanntaFarbo,
  KEINE_BILDER_SATZ,
  LAYOUT_DOSIERUJO,
  LAYOUT_ID,
  NELEGEBLA_DOSIERO_SATZ,
  NUR_BILD_SATZ,
  TRO_GRANDA_SATZ,
} from "./grafeo-gestalten-sicht.js";
import { KREILO } from "./kreilo/datoj.js";
import { bildoPorModelo, estasAufbauBildArt } from "./layout-bild.js";
import { aufbauDe, auftragAufbau, legiAufbau } from "./leinwand-auswertung.js";
import {
  KEINE_EINGABE,
  type KiMesagxo,
  kiProblemoSendi,
  kiUnlesbar,
  kiVoki,
  knotoInhaltSkribi,
  senModelo,
} from "./leinwand-ki.js";
import { markoDir, safeFilename } from "./marko.js";
import type { VojoKunteksto } from "./servilo.js";

const NENIA_MARKO = "Diese Marke gibt es nicht.";

/**
 * The extensions the Layout-Beispiel takes, with the kind they are stored as – those of Beispiele
 * (`beispiele-vojoj.ts` keeps its table to itself; this is the same table).
 */
const ARTOJ_DE_FINAJXO: Readonly<Record<string, BeispielArt>> = {
  ".png": "png",
  ".jpg": "jpg",
  ".jpeg": "jpg",
  ".webp": "webp",
  ".svg": "svg",
  ".pdf": "pdf",
};

/** A file that does not read: the calm sentence, nothing kept. */
class Nelegebla extends Error {}

/**
 * The Enportilo's sentence when a JPG/WebP cannot be decoded without a browser (the words of
 * `enportilo/materialo.ts`, which keeps them inline): the existing sentence for that case.
 */
const ohneBrowserSatzDe = (dosiero: string): string =>
  `Ohne Browser kann ich die Farben von ${dosiero} nicht messen; das Bild liegt im Material.`;

/** Whether a provider error shows that the model reads no images (its answer names them). */
function liestKeineBilder(error: unknown): boolean {
  const teksto = error instanceof Error ? error.message : String(error);
  return /antwortet 4\d\d\b/.test(teksto) && /image|vision|multi-?modal|bild/i.test(teksto);
}

/** The folder of the brand's Layout-Beispiel. */
const dosierujoDe = (kunteksto: VojoKunteksto, name: string): string =>
  join(markoDir(kunteksto.options.workdir, name), MATERIALO_DIR, LAYOUT_DOSIERUJO);

/** The files in the folder (no dot files), sorted. */
function dosierojDe(dosierujo: string): string[] {
  if (!existsSync(dosierujo)) return [];
  return readdirSync(dosierujo, { withFileTypes: true })
    .filter((d) => d.isFile() && !d.name.startsWith("."))
    .map((d) => d.name)
    .sort();
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
 * Reads one file for the Layout-Beispiel the way Beispiele does (the Enportilo in a temporary work
 * folder; the bytes must be what the extension says) and keeps it as the brand's only Layout-Beispiel
 * when it reads; throws Nelegebla otherwise, with nothing changed.
 */
async function legiLayouton(
  kunteksto: VojoKunteksto,
  name: string,
  filename: string,
  bytes: Buffer,
): Promise<BeispielDosiero> {
  const dosiero = safeFilename(filename);
  const art = ARTOJ_DE_FINAJXO[extname(dosiero).toLowerCase()];
  if (dosiero === "" || art === undefined || artDeBajtoj(bytes) !== art) throw new Nelegebla();
  const provejo = mkdtempSync(join(tmpdir(), "fm-layout-"));
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
    const materialo = join(markoDir(kunteksto.options.workdir, name), MATERIALO_DIR);
    const celo = dosierujoDe(kunteksto, name);
    mkdirSync(celo, { recursive: true });
    writeFileSync(join(materialo, ".gitignore"), "*\n");
    // One per brand: the old file goes once the new one has read.
    for (const malnova of dosierojDe(celo)) rmSync(join(celo, malnova), { force: true });
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

const isObjekto = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

/** The brand's Layout-Beispiel on disk: its name, kind and bytes; undefined without one. */
function layoutDosieroDe(
  kunteksto: VojoKunteksto,
  name: string,
): { name: string; art: BeispielArt; bytes: Buffer } | undefined {
  const dosierujo = dosierujoDe(kunteksto, name);
  for (const dosiero of dosierojDe(dosierujo)) {
    const art = ARTOJ_DE_FINAJXO[extname(dosiero).toLowerCase()];
    if (art !== undefined)
      return { name: dosiero, art, bytes: readFileSync(join(dosierujo, dosiero)) };
  }
  return undefined;
}

/** „Aufbau erkennen“: the fixed question with the one image as a second part of its message. */
function mesagxojDe(bildo: string): KiMesagxo[] {
  return auftragAufbau().map(
    (m): KiMesagxo =>
      m.role === "user"
        ? {
            role: "user",
            content: [
              { type: "text", text: m.content },
              { type: "image_url", image_url: { url: bildo } },
            ],
          }
        : { role: m.role, content: m.content },
  );
}

async function aufbauErkennen(
  kunteksto: VojoKunteksto,
  respondo: ServerResponse,
  name: string,
): Promise<void> {
  const senModeloProblemo = senModelo(kunteksto);
  if (senModeloProblemo !== undefined) {
    kiProblemoSendi(kunteksto, respondo, senModeloProblemo);
    return;
  }
  const datei = layoutDosieroDe(kunteksto, name);
  if (datei === undefined) {
    kiProblemoSendi(kunteksto, respondo, KEINE_EINGABE);
    return;
  }
  if (!estasAufbauBildArt(datei.art)) {
    kiProblemoSendi(kunteksto, respondo, { status: 422, satz: NUR_BILD_SATZ });
    return;
  }
  let bildo: string;
  try {
    bildo = await bildoPorModelo(datei.bytes, datei.art, kunteksto.bildilo);
  } catch (error) {
    kiProblemoSendi(kunteksto, respondo, {
      status: 422,
      satz: error instanceof SenBrowser ? ohneBrowserSatzDe(datei.name) : NELEGEBLA_DOSIERO_SATZ,
    });
    return;
  }
  const rezulto = await kiVoki(kunteksto, name, "aufbau", mesagxojDe(bildo), {
    satzDe: (error) => (liestKeineBilder(error) ? KEINE_BILDER_SATZ : undefined),
  });
  if ("status" in rezulto) {
    kiProblemoSendi(kunteksto, respondo, rezulto);
    return;
  }
  const lego = legiAufbau(rezulto.teksto);
  if (lego === undefined) {
    kiProblemoSendi(kunteksto, respondo, kiUnlesbar(rezulto.kosto));
    return;
  }
  const { merkmale, worte, verworfen } = lego;
  const { kosto } = rezulto;
  // Into the node's content beside the file; the words of an earlier result go when none came.
  knotoInhaltSkribi(kunteksto, name, LAYOUT_ID, (nun) => {
    const { worte: _w, abdruck: _a, ...resto } = nun ?? {};
    return { ...resto, merkmale, ...(worte === undefined ? {} : { worte }), kosto };
  });
  const { aufbau, grund } = aufbauDe(merkmale);
  kunteksto.sendJson(respondo, {
    merkmale,
    ...(worte === undefined ? {} : { worte }),
    aufbau,
    grund,
    kosto,
    ...(verworfen === undefined ? {} : { verworfen }),
  });
}

/** Handles a request of this module and answers true, or answers false and leaves it alone. */
export async function layoutVojoj(
  kunteksto: VojoKunteksto,
  peto: IncomingMessage,
  respondo: ServerResponse,
  method: string,
  path: string,
  _url: URL,
): Promise<boolean> {
  const aufbauVojo = /^\/api\/marko\/([a-z0-9-]+)\/ki\/aufbau$/.exec(path);
  if (aufbauVojo !== null && method === "POST") {
    const [, name = ""] = aufbauVojo;
    if (kunteksto.draftOf(name) === undefined) {
      kunteksto.sendJson(respondo, { satz: NENIA_MARKO }, 404);
      return true;
    }
    await aufbauErkennen(kunteksto, respondo, name);
    return true;
  }

  const vojo = /^\/api\/marko\/([a-z0-9-]+)\/layout-beispiel$/.exec(path);
  if (vojo === null || (method !== "POST" && method !== "DELETE")) return false;
  const [, name = ""] = vojo;
  const lego = method === "POST" ? await kunteksto.korpoDe(peto) : undefined;
  if (kunteksto.draftOf(name) === undefined) {
    kunteksto.sendJson(respondo, { satz: NENIA_MARKO }, 404);
    return true;
  }

  if (method === "DELETE") {
    const dosierujo = dosierujoDe(kunteksto, name);
    for (const dosiero of dosierojDe(dosierujo)) rmSync(join(dosierujo, dosiero), { force: true });
    knotoInhaltSkribi(kunteksto, name, LAYOUT_ID, {});
    kunteksto.sendJson(respondo, {});
    return true;
  }

  if (lego === undefined || "troGranda" in lego) {
    kunteksto.sendJson(respondo, { satz: `${NELEGEBLA_DOSIERO_SATZ}. ${TRO_GRANDA_SATZ}` }, 422);
    return true;
  }
  let korpo: unknown;
  try {
    korpo = JSON.parse(lego.teksto);
  } catch {
    korpo = undefined;
  }
  try {
    if (!isObjekto(korpo) || typeof korpo.filename !== "string" || typeof korpo.base64 !== "string")
      throw new Nelegebla();
    const datei = await legiLayouton(
      kunteksto,
      name,
      korpo.filename,
      Buffer.from(korpo.base64, "base64"),
    );
    // The new file's content: its colours; the old file's features, words and cost go.
    knotoInhaltSkribi(kunteksto, name, LAYOUT_ID, { datei });
    kunteksto.sendJson(respondo, { datei });
  } catch (eraro) {
    if (!(eraro instanceof Nelegebla)) throw eraro;
    kunteksto.sendJson(respondo, { satz: NELEGEBLA_DOSIERO_SATZ }, 422);
  }
  return true;
}
