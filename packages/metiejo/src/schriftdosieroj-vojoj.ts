// Spec 056 (MP-2a, T2, plan D-13): the routes of own fonts – a stub of the shell. KBS-3.5 replaces
// the bodies of `schriftdosierojVojoj` and `eigeneFontFace` (and only this file):
//   POST /api/marko/:name/schriftdateien   {filename, base64} (font or ZIP) → {familien, uebergangen}
//   GET  /marko/:name/fontoj/:datei        an own font file for @font-face
//   POST /api/marko/:name/schrift-privat   {familie} → {satz}
// `servilo.ts` calls `schriftdosierojVojoj` for every request before the generic `/api/marko/*` and
// `/marko/:name/*` handlers and goes on when it answers false; it appends what `eigeneFontFace`
// gives to the `@font-face` rules of the Verstehen page and of every preview frame (`fontFaceOf`).
// Everything it needs comes with the context (`VojoKunteksto`, documented in servilo.ts);
// servilo.ts stays frozen after KBS-2.1.

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Agordo } from "@fundamento/agordilo";
import type { VojoKunteksto } from "./servilo.js";

/**
 * The folder of a brand's own font files, beside `materialo/` (`marken/<name>/fontoj/`).
 * `GET /api/leinwand` marks a file of the Schrift node that is not there `fehlt: true`.
 */
export const FONTOJ_DIR = "fontoj";

/** Handles a request of own fonts and answers true, or answers false and leaves it alone. */
export async function schriftdosierojVojoj(
  _kunteksto: VojoKunteksto,
  _peto: IncomingMessage,
  _respondo: ServerResponse,
  _method: string,
  _path: string,
  _url: URL,
): Promise<boolean> {
  return false;
}

/**
 * The `@font-face` rules of the brand's own fonts its Agordo names (on `/marko/:name/fontoj/…`), or
 * "" – then the rules of `fontFaceOf` stay byte-identical. The stub gives "".
 */
export function eigeneFontFace(_kunteksto: VojoKunteksto, _name: string, _agordo: Agordo): string {
  return "";
}
