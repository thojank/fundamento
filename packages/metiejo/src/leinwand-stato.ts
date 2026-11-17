// Spec 055 T4 (LNS-2.2): the canvas state of a brand, `marken/<name>/leinwand.json` beside the draft
// and never inside the Agordo. Pure: the reader `parseLeinwandStato` (it checks the version and the
// types, skips unknown node ids and drops entries with wrong types), the canonical writer, the state
// „Anordnung zurücksetzen“ leaves, and the answer of `GET /api/leinwand`. The edge: reading the file
// of a brand, and writing it – an unreadable file is first renamed to its backup name, so nothing a
// person had is overwritten. No rule, no judgement: only the shape counts.
// Spec 058 (MP-2c, T1): Grundlagen and the Layout-Beispiel (fixed, content without a place),
// „Namen und Beschreibung“ (`speco: "ki"`, content and its own detached edges), the Markenprofil on
// the Marke and the view and layout of every preview – each field on its own, so every file of
// Spec 055 and 056 reads exactly as before. „zurücksetzen“ keeps contents and preview choices.

import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { serializeCanonicalJson } from "@fundamento/modelo";
import {
  ARANGXO_055,
  type Bildo,
  enhavoSpecoDe,
  estasAnsicht,
  estasAufbauWahl,
  FARBO_ROLOJ,
  type FarboRolo,
  FIKSAJ_TEKSTOJ,
  GRUNDLAGEN_ID,
  type Kabloj,
  KI_NAMEN_ID,
  LAYOUT_ID,
  type LeinwandAntwort,
  type LeinwandStato,
  type LeinwandStatoKnoto,
  type Schema,
} from "./grafeo-gestalten-sicht.js";
import { LEINWAND_DOSIERO, leinwandUnlesbarDosiero } from "./leinwand-dosieroj.js";
import { geloestDe, senFehlt } from "./leinwand-enhavo.js";
import { markoDir } from "./marko.js";

/** The calm sentence of a `PUT` whose body is no canvas state (422 `{feld, satz}`). */
export const LEINWAND_STATO_SATZ = "Diesen Zustand der Leinwand kann Fundamento nicht lesen.";

/** The field a 422 of the state routes names. */
export const LEINWAND_STATO_FELD = "leinwand-stato";

/** What the reader makes of a text: the state, or unreadable. */
export type LeinwandStatoLego = { stato: LeinwandStato } | { unlesbar: true };

/** The ids of the fixed nodes (Marke, the seven colours, Palette, the two previews). */
const FIKSAJ_IDS: ReadonlySet<string> = new Set(Object.keys(ARANGXO_055.nodoj));

/** An added node: a further preview `vorschau-<n>`, n ≥ 3 (the two fixed ones are hell/dunkel). */
const ALDONITA = /^vorschau-([1-9][0-9]*)$/;

const isObjekto = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

const isFarboRolo = (x: unknown): x is FarboRolo =>
  typeof x === "string" && (FARBO_ROLOJ as readonly string[]).includes(x);

const isSchema = (x: unknown): x is Schema => x === "hell" || x === "dunkel";

/** A place needs both coordinates as finite numbers; anything else is no place. */
function pozicioDe(eintrag: Record<string, unknown>): { x: number; y: number } | undefined {
  const { x, y } = eintrag;
  if (typeof x !== "number" || typeof y !== "number") return undefined;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return undefined;
  return { x, y };
}

/** Spec 056: the content of a node of this run as the file keeps it (no `fehlt`), if any. */
function inhaltDe(id: string, roh: unknown): Record<string, unknown> | undefined {
  return senFehlt(id, roh) as Record<string, unknown> | undefined;
}

/** Spec 058: the view and the layout choice of a preview, each only when it reads. */
function wahlDe(eintrag: Record<string, unknown>): Pick<LeinwandStatoKnoto, "ansicht" | "aufbau"> {
  return {
    ...(estasAnsicht(eintrag.ansicht) ? { ansicht: eintrag.ansicht } : {}),
    ...(estasAufbauWahl(eintrag.aufbau) ? { aufbau: eintrag.aufbau } : {}),
  };
}

/**
 * Spec 058: a fixed node (Marke, colours, Palette, the two previews). As before it needs a place –
 * unless the Marke carries a profile or a preview a view or a layout choice: then it stays without
 * one. Every other field drops out, so a file of Spec 055 or 056 reads exactly as before.
 */
function fiksaKnotoDe(
  id: string,
  eintrag: Record<string, unknown>,
  pozicio: { x: number; y: number } | undefined,
): LeinwandStatoKnoto | undefined {
  const knoto: LeinwandStatoKnoto = { id, ...(pozicio ?? {}) };
  if (id === "marko") {
    const inhalt = inhaltDe(id, eintrag.inhalt);
    if (inhalt !== undefined && Object.keys(inhalt).length > 0) knoto.inhalt = inhalt;
  }
  if (id === "vorschau-hell" || id === "vorschau-dunkel") Object.assign(knoto, wahlDe(eintrag));
  return pozicio === undefined && Object.keys(knoto).length === 1 ? undefined : knoto;
}

/** One node entry, or undefined for an unknown id or wrong types. */
function knotoDe(eintrag: unknown): LeinwandStatoKnoto | undefined {
  if (!isObjekto(eintrag) || typeof eintrag.id !== "string") return undefined;
  const { id } = eintrag;
  const pozicio = pozicioDe(eintrag);
  if (FIKSAJ_IDS.has(id)) return fiksaKnotoDe(id, eintrag, pozicio);
  // Spec 058: Grundlagen and the Layout-Beispiel are fixed nodes with a content, like the fixed
  // text nodes of 056: a place and/or the content; with neither the entry is dropped.
  // Spec 056: a fixed text node keeps a place and/or its content; with neither it is dropped.
  if (
    (FIKSAJ_TEKSTOJ as readonly string[]).includes(id) ||
    id === GRUNDLAGEN_ID ||
    id === LAYOUT_ID
  ) {
    const inhalt = inhaltDe(id, eintrag.inhalt);
    if (pozicio === undefined && inhalt === undefined) return undefined;
    return { id, ...(pozicio ?? {}), ...(inhalt === undefined ? {} : { inhalt }) };
  }
  // Spec 056: an added text node, Beispiele or Schrift, with its own `speco`.
  const speco = enhavoSpecoDe(id);
  if (speco !== undefined) {
    if (eintrag.speco !== speco) return undefined;
    const inhalt = inhaltDe(id, eintrag.inhalt);
    return { id, speco, ...(pozicio ?? {}), ...(inhalt === undefined ? {} : { inhalt }) };
  }
  // Spec 058: „Namen und Beschreibung“, added through „+ Knoten“; its `geloest` is read once every
  // node is known (`parseLeinwandStato`).
  if (id === KI_NAMEN_ID) {
    if (eintrag.speco !== "ki") return undefined;
    const inhalt = inhaltDe(id, eintrag.inhalt);
    return {
      id,
      speco: "ki",
      ...(pozicio ?? {}),
      ...(inhalt === undefined ? {} : { inhalt }),
      ...(eintrag.geloest === undefined ? {} : { geloest: eintrag.geloest as string[] }),
    };
  }
  const numero = ALDONITA.exec(id)?.[1];
  if (numero === undefined || Number(numero) < 3) return undefined;
  if (eintrag.speco !== "vorschau" || !isSchema(eintrag.schema)) return undefined;
  const knoto: LeinwandStatoKnoto = { id, speco: "vorschau", schema: eintrag.schema };
  if (pozicio !== undefined) {
    knoto.x = pozicio.x;
    knoto.y = pozicio.y;
  }
  if (isObjekto(eintrag.inhalt)) knoto.inhalt = eintrag.inhalt;
  // Spec 058: the view and the layout choice of a further preview.
  Object.assign(knoto, wahlDe(eintrag));
  return knoto;
}

/** The rows of `kabloj` that `kablojEl` would read; every other entry is dropped. */
function kablojDe(roh: Record<string, unknown>): Kabloj {
  const out: Kabloj = {};
  for (const rolo of FARBO_ROLOJ) {
    if (!(rolo in roh)) continue;
    const quelle = roh[rolo];
    if (quelle === null) out[rolo] = null;
    else if (isFarboRolo(quelle) && (quelle === "neutral") === (rolo === "neutral"))
      out[rolo] = quelle;
  }
  return out;
}

/**
 * Reads the text of a state file (or of a `PUT` body). Unreadable: no JSON, no object, a version
 * other than the integer 1, `knoten` no array or `kabloj` no object. Inside, unknown node ids, later
 * duplicates and entries with wrong types are skipped; a place needs `x` and `y` as finite numbers
 * (a fixed node without one is dropped, an added node stays without); `inhalt` of a further preview
 * is passed on unchanged. Spec 056: the text nodes, Beispiele and Schrift with their content read by
 * `enhavoDe` (a field of the wrong type drops out on its own, `fehlt` is never kept), and `geloest`
 * (detached edges into the Marke, `geloestDe`: sorted, unique, only known outputs of nodes and values
 * that exist) – absent when empty, so every file of Spec 055 reads as it is.
 */
export function parseLeinwandStato(teksto: string): LeinwandStatoLego {
  let roh: unknown;
  try {
    roh = JSON.parse(teksto);
  } catch {
    return { unlesbar: true };
  }
  if (!isObjekto(roh) || roh.version !== 1) return { unlesbar: true };
  if (!Array.isArray(roh.knoten) || !isObjekto(roh.kabloj)) return { unlesbar: true };
  const gesehen = new Set<string>();
  const knoten: LeinwandStatoKnoto[] = [];
  for (const eintrag of roh.knoten) {
    const knoto = knotoDe(eintrag);
    if (knoto === undefined || gesehen.has(knoto.id)) continue;
    gesehen.add(knoto.id);
    knoten.push(knoto);
  }
  // Spec 058: the detached edges into „Namen und Beschreibung“, read like those into the Marke.
  for (const [indekso, knoto] of knoten.entries()) {
    if (knoto.id !== KI_NAMEN_ID || knoto.geloest === undefined) continue;
    const { geloest: roh058, ...rest } = knoto;
    const ki = geloestDe(roh058, knoten);
    knoten[indekso] = ki.length > 0 ? { ...rest, geloest: ki } : rest;
  }
  const geloest = geloestDe(roh.geloest, knoten);
  const stato: LeinwandStato = { version: 1, knoten, kabloj: kablojDe(roh.kabloj) };
  if (geloest.length > 0) stato.geloest = geloest;
  return { stato };
}

/** The bytes of a state file: canonical JSON (sorted keys, node order as given). */
export function serializeLeinwandStato(stato: LeinwandStato): string {
  return serializeCanonicalJson(stato);
}

/**
 * The state „Anordnung zurücksetzen“ leaves: the added nodes stay (with their content, without a
 * place, so they take their start slot), no fixed node keeps a place, `kabloj` is `{}`. Spec 056:
 * every node keeps its content (a fixed text node stays with its content, without a place), and
 * `geloest` goes – every edge into the Marke is connected again. Spec 058: a preview keeps its view
 * and layout choice, the Marke its profile, „Namen und Beschreibung“ its result; its own detached
 * edges go too – only places and connections are reset.
 */
export function leinwandStatoRekomenco(stato: LeinwandStato | null): LeinwandStato {
  const knoten = (stato?.knoten ?? [])
    .filter(
      (k) =>
        k.speco !== undefined ||
        k.inhalt !== undefined ||
        k.ansicht !== undefined ||
        k.aufbau !== undefined,
    )
    .map(({ x: _x, y: _y, geloest: _g, ...rest }) => rest);
  return { version: 1, knoten, kabloj: {} };
}

/**
 * The bytes of `GET /api/leinwand`: the Bildo plus `stato` (without `version`; null without a file
 * or for one that does not read) and `statoUnlesbar: true` only for a file that does not read.
 */
export function serializeLeinwandAntwort(
  bildo: Bildo,
  stato: LeinwandStato | null,
  unlesbar = false,
): string {
  const antwort: LeinwandAntwort = {
    ...bildo,
    stato:
      stato === null
        ? null
        : {
            knoten: stato.knoten,
            kabloj: stato.kabloj,
            ...(stato.geloest === undefined ? {} : { geloest: stato.geloest }),
          },
    ...(unlesbar ? { statoUnlesbar: true as const } : {}),
  };
  return serializeCanonicalJson(antwort);
}

// ---------------------------------------------------------------------------------------------
// The edge: the file of a brand

/** The file of a brand as it is: missing, readable (with its bytes) or unreadable (with its bytes). */
export type LeinwandStatoDosiero =
  | { speco: "mankas" }
  | { speco: "stato"; stato: LeinwandStato; bajtoj: string }
  | { speco: "unlesbar"; bajtoj: string };

const dosieroDe = (workdir: string, name: string): string =>
  join(markoDir(workdir, name), LEINWAND_DOSIERO);

/** Reads `leinwand.json` of a brand. Never writes. */
export function leinwandStatoLegi(workdir: string, name: string): LeinwandStatoDosiero {
  const pfad = dosieroDe(workdir, name);
  if (!existsSync(pfad)) return { speco: "mankas" };
  const bajtoj = readFileSync(pfad, "utf8");
  const lego = parseLeinwandStato(bajtoj);
  return "stato" in lego
    ? { speco: "stato", stato: lego.stato, bajtoj }
    : { speco: "unlesbar", bajtoj };
}

/**
 * Writes `leinwand.json` of a brand canonically. An existing file that does not read is first
 * renamed to `leinwand.unlesbar-<zeit>.json` beside it (`zeit` from the caller: no clock here).
 */
export function leinwandStatoSkribi(
  workdir: string,
  name: string,
  stato: LeinwandStato,
  zeit: Date,
): void {
  const pfad = dosieroDe(workdir, name);
  if (leinwandStatoLegi(workdir, name).speco === "unlesbar") {
    renameSync(pfad, join(markoDir(workdir, name), leinwandUnlesbarDosiero(zeit)));
  }
  writeFileSync(pfad, serializeLeinwandStato(stato));
}
