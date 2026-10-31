// The material of a brand in Weg B (Spec 033 S2): uploads lie in marken/<name>/materialo/ (a font in
// fontoj/, as in step 2 of the Schnellstart), out of every repository; the proposals of the last
// reading per Faceto in marken/<name>/enportilo.json until the person takes them. `legiMaterialon`
// reads one upload or one link into findings; a licensed font goes to the private repository after
// the check that it is private (uploadFont), as before. Spec 035, Befund 4.5.6 (D-11): a JPG/JPEG or
// WebP is checked by its bytes and decoded by the optional browser of Weg C; without one it is
// stored all the same, and one sentence says that its colours could not be measured.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { isFontFile } from "../kontrolo.js";
import { markoDir, safeFilename, storeUpload } from "../marko.js";
import { type PrivataDeps, uploadFont } from "../privata.js";
import { type Bildilo, type BildTipo, playwrightBildilo, SenBrowser } from "./bildilo.js";
import { farbojOfPixels } from "./farboj.js";
import { legiPdf } from "./pdf.js";
import { decodePng } from "./png.js";
import type { Propono } from "./rekono.js";
import { legiRetejon, type RetejoFetch } from "./retejo.js";
import { legiSvg } from "./svg.js";
import type { Trovo } from "./trovo.js";

export const MATERIALO_DIR = "materialo";
export const PROPONOJ_FILE = "enportilo.json";

/** What the Enportilo reads, for the sentence of a refusal. */
export const LEGEBLA =
  "Der Enportilo liest PNG, JPG, WebP, SVG und PDF, Schriften (woff2, woff, ttf, otf) und Links auf Webseiten.";

/** The images the browser decodes, by extension, with the name of their kind for a refusal. */
const BILDTIPOJ: Readonly<Record<string, { tipo: BildTipo; nomo: string }>> = {
  ".jpg": { tipo: "image/jpeg", nomo: "JPEG" },
  ".jpeg": { tipo: "image/jpeg", nomo: "JPEG" },
  ".webp": { tipo: "image/webp", nomo: "WebP" },
};

/** The type of an image by its first bytes (the MIME check of an upload). */
function tipoOf(bytes: Buffer): BildTipo | undefined {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.toString("latin1", 0, 4) === "RIFF" && bytes.toString("latin1", 8, 12) === "WEBP")
    return "image/webp";
  return undefined;
}

export class NeLegebla extends Error {}

export interface MaterialoEnigo {
  filename?: string;
  bytes?: Buffer;
  url?: string;
}

export interface MaterialoOptions {
  workdir: string;
  name: string;
  /** The private font repository (FM_TIPAROJ_REPO) and how to reach it; absent without one. */
  tiparojRepo?: string;
  deps?: PrivataDeps;
  fetch?: RetejoFetch;
  /** Decodes a JPG or WebP (Spec 035 4.5.6); default the browser of Weg C, loaded on first need. */
  bildilo?: Bildilo;
  familyOf(filename: string): string;
}

export interface MaterialoRezulto {
  trovoj: Trovo[];
  /** Sentences for the person: where a font went, what waits. */
  satzoj: string[];
  /** The name of the material for the Kroniko: the file or the address. */
  nomo: string;
  kiel: "upload" | "link";
}

function storeMaterialo(workdir: string, name: string, filename: string, bytes: Buffer): string {
  const dir = join(markoDir(workdir, name), MATERIALO_DIR);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, ".gitignore"), "*\n");
  const path = join(dir, safeFilename(filename));
  writeFileSync(path, bytes);
  return path;
}

export async function legiMaterialon(
  input: MaterialoEnigo,
  options: MaterialoOptions,
): Promise<MaterialoRezulto> {
  if (input.url !== undefined && input.url.trim() !== "") {
    const url = new URL(input.url.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:")
      throw new NeLegebla(`${LEGEBLA} (${url.protocol} ist kein Link auf eine Webseite.)`);
    const trovoj = await legiRetejon(url.toString(), options.fetch);
    return { trovoj, satzoj: [], nomo: url.toString(), kiel: "link" };
  }
  const filename = safeFilename(input.filename ?? "");
  const bytes = input.bytes ?? Buffer.alloc(0);
  const extension = extname(filename).toLowerCase();
  if (filename === "") throw new NeLegebla(LEGEBLA);
  if (isFontFile(filename)) {
    storeUpload(options.workdir, options.name, { filename, bytes });
    const family = options.familyOf(filename);
    const satzoj: string[] = [];
    if (options.tiparojRepo === undefined || options.deps === undefined) {
      satzoj.push(
        `Die Schrift ${family} liegt in marken/${options.name}/fontoj/. Ins private Repo kommt sie, sobald FM_TIPAROJ_REPO in der .env steht.`,
      );
    } else {
      const result = await uploadFont(
        options.tiparojRepo,
        options.deps,
        { name: filename, bytes },
        family,
      );
      satzoj.push(result.sentence);
    }
    return {
      trovoj: [
        {
          kind: "tiparo",
          valoro: family,
          rolo: "body",
          pezo: 1,
          herkunft: { dosiero: filename, loko: "Schriftdatei" },
        },
      ],
      satzoj,
      nomo: filename,
      kiel: "upload",
    };
  }
  const bild = BILDTIPOJ[extension];
  if (bild !== undefined) {
    if (tipoOf(bytes) !== bild.tipo)
      throw new NeLegebla(`${filename} ist kein ${bild.nomo}-Bild. ${LEGEBLA}`);
    storeMaterialo(options.workdir, options.name, filename, bytes);
    try {
      const bildo = await (options.bildilo ?? playwrightBildilo()).malkodi(bytes, bild.tipo);
      return {
        trovoj: farbojOfPixels(bildo.rgba, filename),
        satzoj: [],
        nomo: filename,
        kiel: "upload",
      };
    } catch (error) {
      if (!(error instanceof SenBrowser)) throw error;
      return {
        trovoj: [],
        satzoj: [
          `Ohne Browser kann ich die Farben von ${filename} nicht messen; das Bild liegt im Material.`,
        ],
        nomo: filename,
        kiel: "upload",
      };
    }
  }
  if (extension !== ".png" && extension !== ".svg" && extension !== ".pdf")
    throw new NeLegebla(LEGEBLA);
  storeMaterialo(options.workdir, options.name, filename, bytes);
  const trovoj =
    extension === ".png"
      ? farbojOfPixels(decodePng(bytes).rgba, filename)
      : extension === ".svg"
        ? legiSvg(bytes.toString("utf8"), filename)
        : legiPdf(bytes, filename);
  return { trovoj, satzoj: [], nomo: filename, kiel: "upload" };
}

/** The open proposals of a brand, one per Faceto. */
export function readProponoj(workdir: string, name: string): Propono[] {
  const file = join(markoDir(workdir, name), PROPONOJ_FILE);
  if (!existsSync(file)) return [];
  const value = JSON.parse(readFileSync(file, "utf8")) as { proponoj?: Propono[] };
  return Array.isArray(value.proponoj) ? value.proponoj : [];
}

/** Writes the proposals; a new one replaces the open one of its Faceto. */
export function writeProponoj(workdir: string, name: string, proponoj: readonly Propono[]): void {
  const merged = new Map(readProponoj(workdir, name).map((propono) => [propono.faceto, propono]));
  for (const propono of proponoj) merged.set(propono.faceto, propono);
  saveProponoj(workdir, name, [...merged.values()]);
}

/** Takes the proposal of a Faceto out (it was taken). */
export function takeProponon(workdir: string, name: string, faceto: string): Propono | undefined {
  const all = readProponoj(workdir, name);
  const taken = all.find((propono) => propono.faceto === faceto);
  if (taken !== undefined)
    saveProponoj(
      workdir,
      name,
      all.filter((propono) => propono !== taken),
    );
  return taken;
}

function saveProponoj(workdir: string, name: string, proponoj: readonly Propono[]): void {
  const dir = markoDir(workdir, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, PROPONOJ_FILE), `${JSON.stringify({ proponoj }, null, 2)}\n`);
}
