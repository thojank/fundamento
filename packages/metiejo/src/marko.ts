// The brand on disk (Spec 023, §3 step 1 and 7, §4.6): `marken/<name>/` in the working directory
// holds agordo.json (what was saved, with historio), entwurf.json (the draft between the steps),
// fontoj/ (uploads, never in the repo) and eksporto/ (what step 7 writes). The save follows the
// rules of save_agordo (Spec 019 ③, E4, W-26): inside the working directory, only *.json, a
// historio entry per movement. The I/O edge of the brand.

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, extname, join, relative, resolve, sep } from "node:path";
import {
  type Agordo,
  type GestaltBasis,
  type HistorioEintrag,
  historioEintrag,
  readAgordo,
} from "@fundamento/agordilo";
import type { ValidationIssue } from "@fundamento/modelo";
import { isFontFile } from "./kontrolo.js";
import { CHECKOUT_ROOT } from "./root.js";
import { loadBases, startAgordo } from "./vorschau.js";

/** The name of the folder of the brands (`~/Fundamento/marken` by default, O-3), never below the checkout. */
export const MARKEN_DIR = "marken";
/** `$defs/Name` of the Modelo schema: the name of a brand, a package, an Aspekto. */
export const NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export interface Marko {
  name: string;
  /** What agordo.json holds: the last save. */
  agordo: Agordo;
  /** The current state: entwurf.json where it exists, else the save. */
  draft: Agordo;
  /** No draft differs from the save. */
  saved: boolean;
}

export interface CreateInput {
  name: string;
  basis: "leer" | "komuna";
}

/**
 * A problem the Metiejo names, in the shape of a ValidationIssue (path, rule, message, suggestion;
 * code-style) with the rules of this package beside the Modelo's.
 */
export interface MetiejoIssue {
  rule: string;
  severity: "error" | "warning";
  path: string;
  message: string;
  suggestion: string;
}

export interface CreateResult {
  issues: (ValidationIssue | MetiejoIssue)[];
  marko?: Marko;
}

function nameIssue(name: string): MetiejoIssue {
  return {
    rule: "name-invalid",
    severity: "error",
    path: "marko#/name",
    message: `${JSON.stringify(name)} is no name of a brand.`,
    suggestion:
      "Use lowercase letters, digits and single hyphens between them (Kleinbuchstaben, Ziffern, Bindestriche), e.g. meine-marke.",
  };
}

/** Throws when a working directory lies inside the checkout (O-3): no brand is ever written there. */
export function assertOutsideCheckout(workdir: string): void {
  const rel = relative(resolve(CHECKOUT_ROOT), resolve(workdir));
  if (
    rel === "" ||
    (!rel.startsWith(`..${sep}`) && rel !== ".." && !resolve(rel).startsWith(resolve(workdir)))
  ) {
    throw new Error(
      `${workdir} lies inside the checkout ${CHECKOUT_ROOT}; brands live outside the repository (FM_MARKEN_DIR, default ~/Fundamento/marken).`,
    );
  }
}

/** The folder of a brand; throws for a name that is none (nothing outside the working directory). */
export function markoDir(workdir: string, name: string): string {
  assertOutsideCheckout(workdir);
  if (!NAME_PATTERN.test(name)) throw new Error(`${JSON.stringify(name)} is no name of a brand.`);
  const dir = resolve(workdir, name);
  if (dir !== join(resolve(workdir), name))
    throw new Error("the brand lies outside the working directory");
  return dir;
}

const agordoFile = (workdir: string, name: string) => join(markoDir(workdir, name), "agordo.json");
const draftFile = (workdir: string, name: string) => join(markoDir(workdir, name), "entwurf.json");

function readAgordoFile(file: string): Agordo | undefined {
  if (!existsSync(file)) return undefined;
  try {
    return readAgordo(JSON.parse(readFileSync(file, "utf8"))).agordo;
  } catch {
    return undefined;
  }
}

const withoutHistorio = ({ historio: _historio, ...rest }: Agordo): Agordo => rest as Agordo;
const sameAgordo = (a: Agordo, b: Agordo): boolean =>
  JSON.stringify(withoutHistorio(a)) === JSON.stringify(withoutHistorio(b));

/** The brands of the working directory: every folder with an agordo.json, sorted. */
export function listMarkoj(workdir: string): string[] {
  if (!existsSync(workdir)) return [];
  return readdirSync(workdir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        NAME_PATTERN.test(entry.name) &&
        existsSync(join(workdir, entry.name, "agordo.json")),
    )
    .map((entry) => entry.name)
    .sort();
}

/** A brand with its save and its draft, or nothing where none is saved. */
export function readMarko(workdir: string, name: string): Marko | undefined {
  if (!NAME_PATTERN.test(name)) return undefined;
  const agordo = readAgordoFile(agordoFile(workdir, name));
  if (agordo === undefined) return undefined;
  const draft = readAgordoFile(draftFile(workdir, name)) ?? agordo;
  return { name, agordo, draft, saved: sameAgordo(draft, agordo) };
}

/**
 * Creates a brand (step 1): the Agordo of the start — the name and a lead colour, or komuna's
 * colour and fonts — written as agordo.json. A name that is none, or a brand that exists, refuses.
 */
export function createMarko(
  workdir: string,
  input: CreateInput,
  start: (name: string, basis: CreateInput["basis"]) => Agordo = startAgordo,
): CreateResult {
  assertOutsideCheckout(workdir);
  if (!NAME_PATTERN.test(input.name)) return { issues: [nameIssue(input.name)] };
  const dir = markoDir(workdir, input.name);
  if (existsSync(join(dir, "agordo.json"))) {
    const exists: MetiejoIssue = {
      rule: "marko-exists",
      severity: "error",
      path: "marko#/name",
      message: `A brand ${input.name} exists already.`,
      suggestion: "Open it (vorhandene Marke öffnen), or choose another name.",
    };
    return { issues: [exists] };
  }
  const agordo = start(input.name, input.basis);
  const { issues } = readAgordo(agordo);
  if (issues.length > 0) return { issues };
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "agordo.json"), `${JSON.stringify(agordo, null, 2)}\n`);
  return { issues: [], marko: { name: input.name, agordo, draft: agordo, saved: true } };
}

/** Writes the draft of a brand (between the steps). */
export function writeDraft(workdir: string, name: string, agordo: Agordo): void {
  const file = draftFile(workdir, name);
  mkdirSync(join(file, ".."), { recursive: true });
  writeFileSync(file, `${JSON.stringify(agordo, null, 2)}\n`);
}

export interface SaveResult {
  /** Something moved since the last save; agordo.json was written with a historio entry. */
  changed: boolean;
  entry?: HistorioEintrag;
}

/**
 * Saves a brand (step 7, W-25, W-26): agordo.json with a historio entry of the movement since the
 * last save; nothing is appended when nothing moved. The draft file goes with the save.
 */
export function saveMarko(
  workdir: string,
  name: string,
  agordo: Agordo,
  datum: string,
  basis: GestaltBasis = loadBases().gestalt,
): SaveResult {
  const file = agordoFile(workdir, name);
  const before = readAgordoFile(file);
  const { historio: given, ...rest } = agordo;
  const draft = draftFile(workdir, name);
  if (before !== undefined && sameAgordo(before, agordo)) {
    if (existsSync(draft)) unlinkSync(draft);
    return { changed: false };
  }
  const { historio: earlier, ...previous } = before ?? { historio: undefined };
  const entry = historioEintrag(
    before === undefined ? undefined : (previous as Agordo),
    rest as Agordo,
    undefined,
    datum,
    basis,
  );
  const toWrite: Agordo = { ...(rest as Agordo), historio: [...(earlier ?? given ?? []), entry] };
  mkdirSync(join(file, ".."), { recursive: true });
  writeFileSync(file, `${JSON.stringify(toWrite, null, 2)}\n`);
  if (existsSync(draft)) unlinkSync(draft);
  return { changed: true, entry };
}

/** Removes the export folder of a brand (before a new export). */
export function clearExport(workdir: string, name: string): string {
  const dir = join(markoDir(workdir, name), "eksporto");
  rmSync(dir, { recursive: true, force: true });
  return dir;
}

export interface Upload {
  filename: string;
  bytes: Buffer;
}

/** A file name fit for a folder: the base name, spaces as hyphens, nothing but word characters, dots and hyphens. */
export function safeFilename(filename: string): string {
  return basename(filename)
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9._-]/g, "");
}

/**
 * Stores an upload in `<brand>/fontoj/` (§4.6): a font file only; a .gitignore beside it keeps the
 * folder out of the repo unless the maintainer commits it on purpose.
 */
export function storeUpload(workdir: string, name: string, upload: Upload): { path: string } {
  const safe = safeFilename(upload.filename);
  if (safe === "" || !isFontFile(safe)) {
    throw new Error(
      `${JSON.stringify(upload.filename)} is no font file; the Metiejo takes woff2, woff, ttf and otf (${extname(upload.filename) || "no extension"}).`,
    );
  }
  const dir = join(markoDir(workdir, name), "fontoj");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, ".gitignore"), "*\n");
  const path = join(dir, safe);
  writeFileSync(path, upload.bytes);
  return { path };
}
