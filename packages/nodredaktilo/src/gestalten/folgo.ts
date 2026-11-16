// Spec 056 (MP-2a, T5, plan §2.2, D-6, D-7, D-8, D-23): „Farbe folgt den Bildern“ and the two
// take-overs of „Erkannt“ on the canvas. Everything that writes a colour from the Beispiele goes
// through this module, one run after the other (a run waits for the one before it), so two writes
// never interleave.
//
//   - `folgi(okazo, valoro)`: the follow rule (`folgeFarboDe` of the shared module) for the
//     Beispiele content, Primär of the Bildo and whether `beispiele.el` is connected. Writes in the
//     order of tech R-12: the colour first (`skribi({farbe: {rolle: "primaer", wert}})`), then the
//     content with the new `primaer` (`inhaltMeti("beispiele", …, true)`); a colour write that fails
//     writes no state (Primär then stands as „von Hand“: the safe side). The state is written only
//     when `primaer` changed. Without a stored `primaer` it starts as `{folgt: true}` while Primär
//     is the start value, else `{folgt: false}` (D-8). Akzent never follows.
//     Callers: KBS-3.2 after every upload, removed image and loaded image address ("dateien"), the
//     shell after `beispiele.el` was plugged again ("gesteckt"), „folgen lassen“ ("verlangt").
//   - `primaerUebernehmen(hex, valoro)`: „als Primär übernehmen“ – the colour, then
//     `{folgt: false, zuletzt: hex}` (D-6): following ends, Primär shows „aus Material“.
//   - `akzentUebernehmen(farbo, valoro)`: „als Akzent übernehmen“ – the colour with its origin
//     (D-23: `quelle` bild or pdf, `anteil`), so Akzent shows „aus Material“ by the existing path.
//     The origin names no file: it lands in the Agordo and the export, and the images appear in no
//     export (AK-4); the write path then writes `merkmal` „Farbe <wert>“.
//   - `folgoDe(valoro)`: the rule without writing, for the line under „Erkannt“.
//
// A caller usually passes the context of the render before its own `inhaltMeti`; that context still
// reads the old content. „Erkannt“ therefore hands every committed context to `folgoValoroMeti`,
// and a run waits one frame and then reads the newest one.

import { erkanntDe, folgeFarboDe } from "@fundamento/metiejo/enhavo";
import {
  BEISPIELE_ELIR,
  type BildoFarbo,
  type ErkanntaFarbo,
  type FolgoRezulto,
  type InhaltBeispiele,
  type Primaer,
} from "@fundamento/metiejo/gestalten";
import type { SkriboRezulto } from "./datumoj.js";
import type { GestaltenValoro } from "./kunteksto.js";

/** Why the follow rule runs. */
export type FolgoOkazo = "dateien" | "gesteckt" | "verlangt";

/** What this module reads of the shell's context. */
type FolgoValoro = Pick<
  GestaltenValoro,
  "bildo" | "skribi" | "verbunden" | "inhaltDe" | "inhaltMeti"
>;

/** The newest committed context while „Erkannt“ is on the canvas, else null. */
let aktuala: FolgoValoro | null = null;

/** „Erkannt“ hands over every committed context (null when it leaves the canvas). */
export function folgoValoroMeti(valoro: FolgoValoro | null): void {
  aktuala = valoro;
}

/** The runs, one after the other. */
let vico: Promise<unknown> = Promise.resolve();

function envici<T>(tasko: () => Promise<T>): Promise<T> {
  const rezulto = vico.then(tasko);
  vico = rezulto.catch(() => undefined);
  return rezulto;
}

/** Resolves after the next frame (the caller's content is committed by then); at once without one. */
const kadro = (): Promise<void> =>
  typeof requestAnimationFrame === "function"
    ? new Promise((resolve) => requestAnimationFrame(() => resolve()))
    : Promise.resolve();

const plejNova = (valoro: FolgoValoro): FolgoValoro => aktuala ?? valoro;

function primaerNodoDe(valoro: FolgoValoro): BildoFarbo | undefined {
  const nodo = valoro.bildo.nodoj.find((n) => n.id === "farbo-primaer");
  return nodo?.speco === "farbo" ? nodo : undefined;
}

const samaPrimaer = (a: Primaer | undefined, b: Primaer | undefined): boolean =>
  a !== undefined &&
  b !== undefined &&
  a.folgt === b.folgt &&
  a.zuletzt === b.zuletzt &&
  a.seit === b.seit;

/** Sets `primaer` on the newest content (other changes made meanwhile stay) and saves it. */
function primaerKonservi(valoro: FolgoValoro, primaer: Primaer): void {
  const nun = plejNova(valoro);
  const inhalt: InhaltBeispiele = nun.inhaltDe("beispiele") ?? {};
  nun.inhaltMeti("beispiele", { ...inhalt, primaer }, true);
}

/** The follow rule for the context as it is, with „folgen lassen“ when `verlangt`; no write. */
function regulo(valoro: FolgoValoro, verlangt: boolean): FolgoRezulto | undefined {
  const inhalt = valoro.inhaltDe("beispiele");
  const nodo = primaerNodoDe(valoro);
  if (inhalt === undefined || nodo === undefined) return undefined;
  const estasStartwert = nodo.stato === "startwert";
  return folgeFarboDe({
    erkannt: erkanntDe(inhalt.dateien ?? []),
    leitfarbe: nodo.wert ?? nodo.hex,
    estasStartwert,
    primaer: inhalt.primaer ?? { folgt: estasStartwert },
    verbunden: valoro.verbunden(BEISPIELE_ELIR),
    ...(verlangt ? { verlangt: true } : {}),
  });
}

/** The line under „Erkannt“: what the rule says now, without writing; undefined without content. */
export function folgoDe(valoro: FolgoValoro): FolgoRezulto | undefined {
  return regulo(valoro, false);
}

/** Runs the follow rule once for `okazo`; resolves when its writes are done. */
export function folgi(okazo: FolgoOkazo, valoro: FolgoValoro): Promise<void> {
  return envici(async () => {
    await kadro();
    const nun = plejNova(valoro);
    const rezulto = regulo(nun, okazo === "verlangt");
    if (rezulto === undefined) return;
    if (rezulto.farbe !== undefined) {
      const skribo = await nun.skribi({ farbe: { rolle: "primaer", wert: rezulto.farbe } });
      if (skribo.speco !== "ok") return;
    }
    if (!samaPrimaer(rezulto.primaer, plejNova(nun).inhaltDe("beispiele")?.primaer))
      primaerKonservi(nun, rezulto.primaer);
  });
}

/** „als Primär übernehmen“: the colour, then `{folgt: false, zuletzt}` (D-6). */
export function primaerUebernehmen(hex: string, valoro: FolgoValoro): Promise<SkriboRezulto> {
  return envici(async () => {
    const skribo = await valoro.skribi({ farbe: { rolle: "primaer", wert: hex } });
    if (skribo.speco === "ok") primaerKonservi(valoro, { folgt: false, zuletzt: hex });
    return skribo;
  });
}

/** „als Akzent übernehmen“: the colour with its origin, without a file name (D-23, AK-4). */
export function akzentUebernehmen(
  farbo: ErkanntaFarbo,
  valoro: FolgoValoro,
): Promise<SkriboRezulto> {
  return envici(() => {
    const dateien = plejNova(valoro).inhaltDe("beispiele")?.dateien ?? [];
    const hex = farbo.hex.toLowerCase();
    // The file that carries the colour most: its kind says whether it came from an image or a PDF.
    let plej: { art: string; anteil: number } | undefined;
    for (const dosiero of dateien)
      for (const f of dosiero.farben ?? [])
        if (f.hex.toLowerCase() === hex && (plej === undefined || f.anteil > plej.anteil))
          plej = { art: dosiero.art, anteil: f.anteil };
    return valoro.skribi({
      farbe: {
        rolle: "akzent",
        wert: farbo.hex,
        herkunft: { quelle: plej?.art === "pdf" ? "pdf" : "bild", anteil: farbo.anteil },
      },
    });
  });
}
