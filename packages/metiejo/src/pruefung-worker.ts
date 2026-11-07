// Spec 044 T3 (D-02): the worker thread of the check. The server hands it one Agordo after the other
// (`PruefAuftrag`); it derives each with every check of the CI – the same `checkDraft` the main
// thread runs without a worker – over the bases it reads itself, and answers the derivation or what
// the check threw. Nothing here holds a clock or a limit by time.

import { parentPort } from "node:worker_threads";
import { readAgordo } from "@fundamento/agordilo";
import type { PruefAntwort, PruefAuftrag } from "./ableitungen.js";
import { checkDraft, loadBases, startAgordo } from "./vorschau.js";

const port = parentPort;
if (port === null) throw new Error("pruefung-worker runs in a worker thread only.");

// Spec 044 B-10 (D-28): the server starts this worker right after it listens. While the first page
// loads it reads the bases and reads one invented start Agordo of the basis `leer` – that compiles
// the shared schema validator the check needs (about 130 ms), not the check itself (1.5 s, which
// the first real check would wait behind). Nothing of it is answered, measured or kept but the
// bases and the validator. Should it fail, every check reads the bases again and answers their
// error, as before.
try {
  readAgordo(startAgordo("vorlauf", "leer", loadBases()));
} catch {
  // Answered by the check.
}

port.on("message", ({ id, agordo }: PruefAuftrag) => {
  let antwort: PruefAntwort;
  try {
    antwort = { id, derivation: checkDraft(agordo, loadBases()) };
  } catch (fehler) {
    antwort = { id, fehler };
  }
  try {
    port.postMessage(antwort);
  } catch (fehler) {
    // A value structured clone cannot copy: the caller gets the text the server's catch would show
    // for a thrown value, or the error of the copy.
    port.postMessage({ id, fehler: "fehler" in antwort ? String(antwort.fehler) : fehler });
  }
});
