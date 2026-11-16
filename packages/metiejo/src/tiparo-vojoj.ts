// Spec 056 (MP-2a, T2, plan D-13, D-21, D-22): the routes of the node Schrift (catalog) – a stub of
// the shell. KBS-3.4 replaces the body of `tiparoVojoj` (and only this file):
//   GET /api/marko/:name/tiparoj?q=&art=   only when the query has `art` (without it: false, so the
//                                          existing handler answers byte-identically)
//   GET /api/marko/:name/schriften         {rev, schriften, regler}
//   GET /api/tiparo/:id/css, /api/tiparo/:id/:datei
// `servilo.ts` calls it for every request before the existing `…/tiparoj` route and the generic
// `/api/marko/*` handlers and goes on when it answers false. Everything it needs comes with the
// context (`VojoKunteksto`, documented in servilo.ts); servilo.ts stays frozen after KBS-2.1.

import type { IncomingMessage, ServerResponse } from "node:http";
import type { VojoKunteksto } from "./servilo.js";

/** Handles a request of the font catalog and answers true, or answers false and leaves it alone. */
export async function tiparoVojoj(
  _kunteksto: VojoKunteksto,
  _peto: IncomingMessage,
  _respondo: ServerResponse,
  _method: string,
  _path: string,
  _url: URL,
): Promise<boolean> {
  return false;
}
