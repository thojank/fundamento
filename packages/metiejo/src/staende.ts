// Spec 055 T5 (LNS-3.1): the named Stände of a brand, `marken/<name>/staende/<id>.json` beside
// the draft. A Stand holds the draft of the Agordo and the canvas state at one time:
// `{ version: 1, id, name, zeit, agordo, leinwand }`, written canonically, so two contents compare
// byte for byte (the backup before „Öffnen“). Pure: the id from the UTC second and the slug of the
// name (same second → `-2`, `-3`), the name proposal „TT.MM.JJJJ, HH:MM“, the content a backup
// compares, the reader of a file and the rows of the list (newest first). The clock comes in from
// the caller. The edge: listing, reading and writing the files of a brand through `markoDir`, and
// replacing `leinwand.json` with the canvas part of a Stand. No rule, no judgement: a Stand is never
// refused for a rule; only an Agordo that does not read cannot be opened.

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { type Agordo, readAgordo } from "@fundamento/agordilo";
import { serializeCanonicalJson } from "@fundamento/modelo";
import { paletrojDe } from "./grafeo-gestalten.js";
import type { LeinwandStato, StandZeile } from "./grafeo-gestalten-sicht.js";
import {
  LEINWAND_DOSIERO,
  leinwandUnlesbarDosiero,
  STAENDE_DIR,
  STAND_SUFIKSO,
  standDosiero,
} from "./leinwand-dosieroj.js";
import { leinwandStatoLegi, leinwandStatoSkribi, parseLeinwandStato } from "./leinwand-stato.js";
import { markenFarbenDe, zeitpunktText } from "./marken-liste.js";
import { markoDir } from "./marko.js";
import type { Bases } from "./vorschau.js";

/** The id of a Stand: `<UTC yyyymmddThhmmssZ>[-<slug>][-<n>]`; checked before any disk access. */
export const STAND_ID_MUSTRO = /^[0-9]{8}T[0-9]{6}Z(-[a-z0-9]+)*$/;

/** The calm line of a Stand that cannot be opened (422 `{satz}`). */
export const STAND_NE_MALFERMEBLA_SATZ = "Dieser Stand lässt sich nicht öffnen";

/** The longest slug of a name in an id. */
export const STAND_SLUG_LONGO = 48;

/** One Stand file (tech spec T5). */
export interface Stand {
  version: 1;
  id: string;
  name: string;
  /** ISO time of saving (UTC). */
  zeit: string;
  /** The draft at the time of saving, as `entwurf.json`. */
  agordo: Agordo;
  /** The content of `leinwand.json` at the time of saving, or null without one. */
  leinwand: LeinwandStato | null;
}

/** What the reader makes of a Stand file: the Stand, or unreadable (with what still reads). */
export type StandLego =
  | { speco: "stand"; stand: Stand }
  | { speco: "unlesbar"; name?: string; zeit?: string };

const UMLAUTE: Readonly<Record<string, string>> = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };

/**
 * The slug of a name: lower case, ä→ae, ö→oe, ü→ue, ß→ss, every other run of characters outside
 * `[a-z0-9]` one dash, trimmed, at most 48 characters (trimmed again). May be empty.
 */
export function standSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => UMLAUTE[c] ?? "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, STAND_SLUG_LONGO)
    .replace(/-+$/, "");
}

const zwei = (zahl: number): string => String(zahl).padStart(2, "0");

/** The UTC second of a time as `yyyymmddThhmmssZ`. */
export function standZeitId(zeit: Date): string {
  return `${zeit.getUTCFullYear()}${zwei(zeit.getUTCMonth() + 1)}${zwei(zeit.getUTCDate())}T${zwei(zeit.getUTCHours())}${zwei(zeit.getUTCMinutes())}${zwei(zeit.getUTCSeconds())}Z`;
}

/** The id of a new Stand; within the same second a taken id gets `-2`, `-3`, …. */
export function standIdDe(zeit: Date, name: string, ekzistas: (id: string) => boolean): string {
  const slug = standSlug(name);
  const baza = slug === "" ? standZeitId(zeit) : `${standZeitId(zeit)}-${slug}`;
  if (!ekzistas(baza)) return baza;
  let n = 2;
  while (ekzistas(`${baza}-${n}`)) n++;
  return `${baza}-${n}`;
}

/** The time an id was made at (ISO, whole second); "" for no id. */
export function zeitDeId(id: string): string {
  const m = /^([0-9]{4})([0-9]{2})([0-9]{2})T([0-9]{2})([0-9]{2})([0-9]{2})Z/.exec(id);
  if (m === null) return "";
  const [, j, mo, t, h, mi, s] = m;
  return `${j}-${mo}-${t}T${h}:${mi}:${s}.000Z`;
}

/** The proposed name: „TT.MM.JJJJ, HH:MM“ in the local time of the server. */
export const standNomoPropono = (zeit: Date): string => zeitpunktText(zeit.toISOString());

/** The name as typed (trimmed); empty or missing takes the proposal. */
export function standNomo(name: string | undefined, zeit: Date): string {
  const nomo = name?.trim() ?? "";
  return nomo === "" ? standNomoPropono(zeit) : nomo;
}

/** The name of the backup before „Öffnen“. */
export const sicherungNomo = (name: string): string => `vor dem Öffnen von „${name}“`;

/**
 * A new Stand at `zeit`; `ekzistas` says which ids are taken. The slug comes from the name as
 * typed: a proposed name (the time itself) adds none.
 */
export function standKrei(o: {
  zeit: Date;
  name?: string;
  agordo: Agordo;
  leinwand: LeinwandStato | null;
  ekzistas: (id: string) => boolean;
}): Stand {
  const name = standNomo(o.name, o.zeit);
  return {
    version: 1,
    id: standIdDe(o.zeit, o.name ?? "", o.ekzistas),
    name,
    zeit: o.zeit.toISOString(),
    agordo: o.agordo,
    leinwand: o.leinwand,
  };
}

/** The bytes of a Stand file: canonical JSON. */
export const serializeStand = (stand: Stand): string => serializeCanonicalJson(stand);

/** The content a backup compares: Agordo and canvas state, canonical. */
export const standEnhavo = (agordo: unknown, leinwand: LeinwandStato | null): string =>
  serializeCanonicalJson({ agordo, leinwand });

const isObjekto = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

/** The canvas part of a Stand: a state the canvas reads, else null (the start layout). */
function leinwandDe(roh: unknown): LeinwandStato | null {
  if (!isObjekto(roh)) return null;
  const lego = parseLeinwandStato(JSON.stringify(roh));
  return "stato" in lego ? lego.stato : null;
}

/**
 * Reads a Stand file. Unreadable: no JSON object, a version other than 1, `id`, `name` or `zeit`
 * no text, or an Agordo that does not read (then `name` and `zeit` come along where they are
 * text). A canvas part that is missing or does not read is null.
 */
export function parseStand(teksto: string): StandLego {
  let roh: unknown;
  try {
    roh = JSON.parse(teksto);
  } catch {
    return { speco: "unlesbar" };
  }
  if (!isObjekto(roh)) return { speco: "unlesbar" };
  const { id, name, zeit } = roh;
  const unlesbar: StandLego = {
    speco: "unlesbar",
    ...(typeof name === "string" ? { name } : {}),
    ...(typeof zeit === "string" ? { zeit } : {}),
  };
  if (roh.version !== 1 || typeof id !== "string") return unlesbar;
  if (typeof name !== "string" || typeof zeit !== "string") return unlesbar;
  const agordo = readAgordo(roh.agordo).agordo;
  if (agordo === undefined) return unlesbar;
  return {
    speco: "stand",
    stand: { version: 1, id, name, zeit, agordo, leinwand: leinwandDe(roh.leinwand) },
  };
}

/** The swatches of an Agordo (Primär, Akzent where set, Neutral step 100). */
export type FarbenDe = (agordo: Agordo) => NonNullable<StandZeile["farben"]>;

/** One row of the list; an unreadable file keeps its id, its name and time where they read. */
export function standZeileDe(id: string, lego: StandLego, farbenDe: FarbenDe): StandZeile {
  if (lego.speco === "unlesbar") {
    return { id, name: lego.name ?? id, zeit: lego.zeit ?? zeitDeId(id), lesbar: false };
  }
  const { name, zeit, agordo } = lego.stand;
  return { id, name, zeit, lesbar: true, farben: farbenDe(agordo) };
}

/** Newest first; at the same time the later id first. */
export function staendeSortiert(zeilen: readonly StandZeile[]): StandZeile[] {
  return [...zeilen].sort((a, b) =>
    a.zeit === b.zeit ? (a.id < b.id ? 1 : a.id > b.id ? -1 : 0) : a.zeit < b.zeit ? 1 : -1,
  );
}

// ---------------------------------------------------------------------------------------------
// The edge: the files of a brand

const staendeDir = (workdir: string, name: string): string =>
  join(markoDir(workdir, name), STAENDE_DIR);

/** The swatches as the Markenliste shows them, derived once per Stand. */
export const farbenDeBases =
  (bases: Bases): FarbenDe =>
  (agordo) =>
    markenFarbenDe(agordo, paletrojDe(agordo, bases));

/** The list of a brand, newest first; `[]` without `staende/`. Only files `<id>.json` count. */
export function staendeListe(workdir: string, name: string, farbenDe: FarbenDe): StandZeile[] {
  const dir = staendeDir(workdir, name);
  if (!existsSync(dir)) return [];
  const zeilen: StandZeile[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isFile() || !e.name.endsWith(STAND_SUFIKSO)) continue;
    const id = e.name.slice(0, -STAND_SUFIKSO.length);
    if (!STAND_ID_MUSTRO.test(id)) continue;
    zeilen.push(standZeileDe(id, parseStand(readFileSync(join(dir, e.name), "utf8")), farbenDe));
  }
  return staendeSortiert(zeilen);
}

/** One Stand of a brand by id (the caller checked the id against `STAND_ID_MUSTRO`). */
export function standLegi(
  workdir: string,
  name: string,
  id: string,
): { speco: "mankas" } | StandLego {
  const pfad = join(staendeDir(workdir, name), standDosiero(id));
  if (!existsSync(pfad)) return { speco: "mankas" };
  return parseStand(readFileSync(pfad, "utf8"));
}

/** The canvas state of a brand as a Stand holds it: null without a file or for one that does not read. */
export function nunaLeinwando(workdir: string, name: string): LeinwandStato | null {
  const dosiero = leinwandStatoLegi(workdir, name);
  return dosiero.speco === "stato" ? dosiero.stato : null;
}

/** Writes a new Stand (creating `staende/` with the first one) and returns it. */
export function standSkribi(
  workdir: string,
  name: string,
  enhavo: { name?: string; agordo: Agordo; leinwand: LeinwandStato | null },
  zeit: Date,
): Stand {
  const dir = staendeDir(workdir, name);
  mkdirSync(dir, { recursive: true });
  const stand = standKrei({
    zeit,
    ...(enhavo.name === undefined ? {} : { name: enhavo.name }),
    agordo: enhavo.agordo,
    leinwand: enhavo.leinwand,
    ekzistas: (id) => existsSync(join(dir, standDosiero(id))),
  });
  writeFileSync(join(dir, standDosiero(stand.id)), serializeStand(stand));
  return stand;
}

/**
 * Replaces `leinwand.json` with the canvas part of a Stand; null removes it (the start layout).
 * A file that does not read is renamed to its backup name first, never lost.
 */
export function leinwandAnstatauxigi(
  workdir: string,
  name: string,
  leinwand: LeinwandStato | null,
  zeit: Date,
): void {
  if (leinwand !== null) {
    leinwandStatoSkribi(workdir, name, leinwand, zeit);
    return;
  }
  const dir = markoDir(workdir, name);
  const nun = leinwandStatoLegi(workdir, name);
  if (nun.speco === "unlesbar")
    renameSync(join(dir, LEINWAND_DOSIERO), join(dir, leinwandUnlesbarDosiero(zeit)));
  else if (nun.speco === "stato") unlinkSync(join(dir, LEINWAND_DOSIERO));
}
