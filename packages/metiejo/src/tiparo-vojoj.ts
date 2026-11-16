// Spec 056 (MP-2a, T6, KBS-3.4, plan D-13, D-21, D-22): the routes of the node Schrift (catalog).
//   GET /api/marko/:name/tiparoj?q=&art=   only when the query has `art`: the catalog narrowed to
//          one kind (`sans-serif`, `serif`, `monospace`, `display`, `handwriting`; "" = every kind)
//          before the search → {treffer: [{id, family, license, category}], anzahl, satz?};
//          without a query the first twelve families of the kind by name. Without `art` this
//          module answers false and the existing route answers byte for byte as before.
//   GET /api/marko/:name/schriften         {rev, schriften: {display?, body?, code?:
//          {familie, lizenz, tiparo?, eigene?}}, regler: [{pfad, etikedo, min, max, step, wert}]}
//          – the node's view of the draft (D-21): the fonts as the Agordo names them and the three
//          Schrift sliders of `reglerOf` with their ranges and current values.
//   GET /api/tiparo/:id/css                `@font-face` rules for a catalog font, pointing at
//   GET /api/tiparo/:id/:datei             these routes; the files come from Fontsource on npm
//          through the existing cache of `fetchFontFiles`. Without npm (tests) or without network
//          and cache: 503 {satz: SCHRIFT_OFFLINE_SATZ}; the node then keeps its fallback. A family
//          without Latin letters gets no rule (the node shows „Aa“ in the fallback).
// The preview keeps its own CDN rules (`fontFaceCss`); setting a font or a slider goes through the
// canvas's write path (`POST …/leinwand`). 404 `{satz}` for an unknown brand, font or file; no
// rule, no judgement.

import { readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";
import { reglerValue } from "@fundamento/agordilo";
import type { Fonto } from "@fundamento/modelo";
import {
  SCHRIFT_ARTOJ,
  SCHRIFT_OFFLINE_SATZ,
  type SchriftRolle,
} from "./grafeo-gestalten-sicht.js";
import type { VojoKunteksto } from "./servilo.js";
import { LICENCED_NOTE, searchTiparoj, type Tiparo, type Tiparoj } from "./tiparoj.js";
import { type FontFiles, fetchFontFiles, fontFilesCss } from "./tiparoj-npm.js";

const NENIA_MARKO = "Diese Marke gibt es nicht.";
const NENIA_TIPARO = "Diese Schrift gibt es im Katalog nicht.";
const NENIA_DOSIERO = "Diese Datei gibt es nicht.";
const NENIA_ARTO = `Diese Art kennt der Katalog nicht: ${SCHRIFT_ARTOJ.map((a) => a.etikedo).join(", ")}.`;

/** As many hits as the Studio's search shows. */
const TREFFER_GRENZE = 12;

/** The Studio's sentence when a search finds nothing (`servilo.ts`, the existing `…/tiparoj`). */
export const keinTrefferSatzDe = (query: string): string =>
  `Keine Schrift gefunden für „${query}“: Versuche einen Teil des Namens, zum Beispiel „Sans“ oder „Serif“, oder lade eine eigene Schrift hoch.`;

const ROLLEN: readonly SchriftRolle[] = ["display", "body", "code"];

/** One font of the draft as the node shows it. */
export interface SchriftAnsicht {
  familie: string;
  lizenz: string;
  /** The Fontsource id, when the family is a font of the catalog. */
  tiparo?: string;
  /** An own font of the brand („lizenziert, nicht enthalten“). */
  eigene?: true;
}

/** One Schrift slider as the node shows it. */
export interface SchriftRegler {
  pfad: string;
  etikedo: string;
  min: number;
  max: number;
  step: number;
  wert: number;
}

/** The kind a query names: a category of SCHRIFT_ARTOJ or "" (every kind); undefined: unknown. */
export function artoDe(art: string): string | undefined {
  const t = art.trim().toLowerCase();
  if (t === "") return "";
  return SCHRIFT_ARTOJ.find((a) => a.kategorio === t || a.etikedo.toLowerCase() === t)?.kategorio;
}

/** The catalog narrowed to one kind ("" = all), before the search (D-22). Pure. */
export function tiparojDeArto(tiparoj: Tiparoj, kategorio: string): Tiparoj {
  return kategorio === ""
    ? tiparoj
    : { ...tiparoj, tiparoj: tiparoj.tiparoj.filter((t) => t.category === kategorio) };
}

/**
 * The hits of a search in one kind, and how many families match in all: with a query the Studio's
 * search order; without one the families of the kind by name. Pure.
 */
export function sercxoDe(
  tiparoj: Tiparoj,
  query: string,
  kategorio: string,
): { treffer: Tiparo[]; anzahl: number } {
  const ene = tiparojDeArto(tiparoj, kategorio);
  if (query.trim() === "") {
    const nomoj = [...ene.tiparoj].sort((a, b) => a.family.localeCompare(b.family, "en"));
    return { treffer: nomoj.slice(0, TREFFER_GRENZE), anzahl: nomoj.length };
  }
  const cxiuj = searchTiparoj(ene, query, Number.MAX_SAFE_INTEGER);
  return { treffer: cxiuj.slice(0, TREFFER_GRENZE), anzahl: cxiuj.length };
}

/** A font of the Agordo as the node shows it: its catalog id, or an own font. Pure. */
export function schriftAnsichtDe(fonto: Fonto, tiparoj: Tiparoj): SchriftAnsicht {
  if (fonto.redistributable !== true)
    return { familie: fonto.family, lizenz: LICENCED_NOTE, eigene: true };
  const ujo = fonto.source.replace(/\/+$/, "");
  const tiparo =
    tiparoj.tiparoj.find((t) => ujo.endsWith(`/fonts/${t.id}`) && t.family === fonto.family) ??
    tiparoj.tiparoj.find((t) => t.family === fonto.family);
  return {
    familie: fonto.family,
    lizenz: fonto.license,
    ...(tiparo === undefined ? {} : { tiparo: tiparo.id }),
  };
}

/** Reads `fetchFontFiles` once per font; a failure is no font (offline, no cache). */
async function dosierojDe(
  kunteksto: VojoKunteksto,
  tiparo: Tiparo,
): Promise<FontFiles | undefined> {
  const npm = kunteksto.options.npm;
  if (npm === undefined) return undefined;
  try {
    return await fetchFontFiles(tiparo.id, npm);
  } catch {
    return undefined;
  }
}

/** Handles a request of the font catalog and answers true, or answers false and leaves it alone. */
export async function tiparoVojoj(
  kunteksto: VojoKunteksto,
  _peto: IncomingMessage,
  respondo: ServerResponse,
  method: string,
  path: string,
  url: URL,
): Promise<boolean> {
  if (method !== "GET") return false;
  const { sendJson } = kunteksto;

  const katalogoApi = /^\/api\/marko\/([a-z0-9-]+)\/tiparoj$/.exec(path);
  if (katalogoApi !== null) {
    // D-22: only a query with `art` is ours; without it the existing route answers.
    const art = url.searchParams.get("art");
    if (art === null) return false;
    const [, name = ""] = katalogoApi;
    if (kunteksto.draftOf(name) === undefined) {
      sendJson(respondo, { satz: NENIA_MARKO }, 404);
      return true;
    }
    const kategorio = artoDe(art);
    if (kategorio === undefined) {
      sendJson(respondo, { feld: "art", satz: NENIA_ARTO }, 422);
      return true;
    }
    const query = url.searchParams.get("q") ?? "";
    const { treffer, anzahl } = sercxoDe(kunteksto.tiparoj, query, kategorio);
    sendJson(respondo, {
      treffer: treffer.map((t) => ({
        id: t.id,
        family: t.family,
        license: t.license,
        category: t.category,
      })),
      anzahl,
      ...(query !== "" && treffer.length === 0 ? { satz: keinTrefferSatzDe(query) } : {}),
    });
    return true;
  }

  const schriftenApi = /^\/api\/marko\/([a-z0-9-]+)\/schriften$/.exec(path);
  if (schriftenApi !== null) {
    const [, name = ""] = schriftenApi;
    const draft = kunteksto.draftOf(name);
    if (draft === undefined) {
      sendJson(respondo, { satz: NENIA_MARKO }, 404);
      return true;
    }
    const schriften: Partial<Record<SchriftRolle, SchriftAnsicht>> = {};
    for (const rolle of ROLLEN) {
      const fonto = draft.agordo.schriften?.[rolle];
      if (fonto !== undefined) schriften[rolle] = schriftAnsichtDe(fonto, kunteksto.tiparoj);
    }
    const regler: SchriftRegler[] = kunteksto.regler
      .filter((r) => r.group === "schrift")
      .map((r) => ({
        pfad: r.path,
        etikedo: r.label,
        min: r.min,
        max: r.max,
        step: r.step,
        wert: reglerValue(draft.agordo, r),
      }));
    sendJson(respondo, { rev: draft.rev, schriften, regler });
    return true;
  }

  const tiparoApi = /^\/api\/tiparo\/([a-z0-9-]+)\/([^/]+)$/.exec(path);
  if (tiparoApi !== null) {
    const [, id = "", datei = ""] = tiparoApi;
    const tiparo = kunteksto.tiparoj.tiparoj.find((t) => t.id === id);
    if (tiparo === undefined) {
      sendJson(respondo, { satz: NENIA_TIPARO }, 404);
      return true;
    }
    const css = datei === "css";
    // A family without Latin letters: no rule and no request; the node keeps its fallback.
    if (css && !tiparo.scripts.includes("Latn")) {
      respondo.writeHead(200, { "content-type": "text/css; charset=utf-8" }).end("");
      return true;
    }
    // Only the Latin woff2 files the cache keeps (never LICENSE or herkunto.json).
    if (!css && !/^[a-z0-9-]+-latin-\d{3}-normal\.woff2$/.test(datei)) {
      sendJson(respondo, { satz: NENIA_DOSIERO }, 404);
      return true;
    }
    const dosieroj = await dosierojDe(kunteksto, tiparo);
    if (dosieroj === undefined) {
      sendJson(respondo, { satz: SCHRIFT_OFFLINE_SATZ }, 503);
      return true;
    }
    if (css) {
      const fontFace = fontFilesCss(tiparo.family, dosieroj.files, `/api/tiparo/${tiparo.id}`);
      respondo.writeHead(200, { "content-type": "text/css; charset=utf-8" }).end(fontFace);
      return true;
    }
    if (!dosieroj.files.includes(datei)) {
      sendJson(respondo, { satz: NENIA_DOSIERO }, 404);
      return true;
    }
    respondo
      .writeHead(200, { "content-type": "font/woff2" })
      .end(readFileSync(join(dosieroj.dir, datei)));
    return true;
  }

  return false;
}
