// Spec 058 (MP-2c, T3, MAW-3.1, plan §3.3): a route module of VOJOJ_058, registered once in
// `servilo.ts` and asked after VOJOJ_056.
//   GET /api/marken   200 {marken: MarkenZeile[]} – the started brands for „Marken“ in the canvas
//          header: the data and the order of the start page's Markenliste (`markenListeDe`: newest
//          first, then by name; an unreadable brand with its name and without swatches). Reading
//          writes nothing: draft, rev and Kroniko of every brand stay. No check, no judgement.
// Every other method or path is left to the routes after it (answers false).

import type { IncomingMessage, ServerResponse } from "node:http";
import { type MarkenZeile, markenListeDe } from "./marken-liste.js";
import type { VojoKunteksto } from "./servilo.js";

/** The answer of `GET /api/marken`. */
export interface MarkenAntwort {
  marken: MarkenZeile[];
}

/** Handles a request of this module and answers true, or answers false and leaves it alone. */
export async function markenVojoj(
  kunteksto: VojoKunteksto,
  _peto: IncomingMessage,
  respondo: ServerResponse,
  method: string,
  path: string,
  _url: URL,
): Promise<boolean> {
  if (method !== "GET" || path !== "/api/marken") return false;
  const antwort: MarkenAntwort = {
    marken: markenListeDe(kunteksto.options.workdir, kunteksto.bases),
  };
  kunteksto.sendJson(respondo, antwort);
  return true;
}
