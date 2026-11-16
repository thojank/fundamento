// Spec 056 (MP-2a, T2, plan D-13): the routes of the node Beispiele – a stub of the shell. KBS-3.2
// replaces the body of `beispieleVojoj` (and only this file):
//   POST   /api/marko/:name/beispiele          {filename, base64} | {url} → {datei} | {verweis} | 422 {satz}
//   DELETE /api/marko/:name/beispiele/:datei
// `servilo.ts` calls it for every request before the generic `/api/marko/*` handlers and goes on
// when it answers false. Everything it needs comes with the context (`VojoKunteksto`, documented in
// servilo.ts); servilo.ts stays frozen after KBS-2.1.

import type { IncomingMessage, ServerResponse } from "node:http";
import type { VojoKunteksto } from "./servilo.js";

/** Handles a request of Beispiele and answers true, or answers false and leaves it alone. */
export async function beispieleVojoj(
  _kunteksto: VojoKunteksto,
  _peto: IncomingMessage,
  _respondo: ServerResponse,
  _method: string,
  _path: string,
  _url: URL,
): Promise<boolean> {
  return false;
}
