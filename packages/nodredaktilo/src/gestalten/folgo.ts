// Spec 056 (MP-2a, T2, plan §2.2, D-6, D-7): „Farbe folgt den Bildern“ on the canvas – a stub of the
// shell. KBS-3.3 replaces the body of `folgi` (and only this file): it reads the Beispiele content
// (`valoro.inhaltDe("beispiele")`), Primär of the Bildo and whether `beispiele.el` is connected
// (`valoro.verbunden`), runs `folgeFarboDe` of the shared module and writes – colour first
// (`valoro.skribi({farbe: {rolle: "primaer", wert}})`), then the content with the new `primaer`
// (`valoro.inhaltMeti("beispiele", …, true)`).
//
// Who calls it:
//   - KBS-3.2 after every upload, every removed image and every loaded image address: "dateien";
//   - the shell (kanvaso.tsx) after `beispiele.el` was plugged into the Marke again: "gesteckt";
//   - KBS-3.3 on „folgen lassen“: "verlangt".

import type { GestaltenValoro } from "./kunteksto.js";

/** Why the follow rule runs. */
export type FolgoOkazo = "dateien" | "gesteckt" | "verlangt";

/** Runs the follow rule once for `okazo`; resolves when its writes are done. The stub does nothing. */
export async function folgi(_okazo: FolgoOkazo, _valoro: GestaltenValoro): Promise<void> {}
