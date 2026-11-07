// Spec 044 (V-5): the shared store of the two derivations of the Metiejo. The check (a derivation
// with every check of the CI) is held per draft object and rev (A-01: a copy of the draft on the
// stage keeps its own entry), the stylesheet of the preview per brand, rev and proposal together
// with the form of the Agordo it shows (A-02: a proposal changes without a new rev). One promise per
// key: requests at the same time share one computation. A failed computation is dropped at once,
// its requests get its error. A result is kept only while its rev still holds; each request gets
// the result of the state it started with, because the Agordo is taken as a value at the start.
// The calculators are injected: since T3 the check runs in a worker thread (`pruefRechnungOf`), the
// stylesheet in parts in the main thread. This module holds no clock, no limit by time and hands no
// iteration of a Map into an answer.

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";
import type { Agordo, Derivation } from "@fundamento/agordilo";
import { type Messung, OHNE_MESSUNG } from "./messung.js";

/** Computes the check of an Agordo. */
export type PruefRechner = (agordo: Agordo) => Promise<Derivation>;
/** Computes the stylesheet of an Agordo; it reports its steps to the measure of the request. */
export type CssRechner = (agordo: Agordo, messung: Messung) => Promise<string>;
/** V-3: a test seam awaited before each computation of a check; absent in production. */
export type PruefTor = (marke: string, rev: number) => Promise<void>;

/** The check of one rev: its promise, and its result once it is there. */
export interface PruefEintrag {
  readonly rev: number;
  readonly ergebnis: Promise<Derivation>;
  fertig?: Derivation;
}

/** What holds a check: a draft or a copy of it, with its current Agordo and rev. */
export interface PruefHalter {
  agordo: Agordo;
  rev: number;
  pruefung?: PruefEintrag;
}

export interface PruefSpeicher {
  /**
   * The check of the holder's current rev: computed once, shared by every request that asks while
   * it runs. The computing request reports `ableitung+pruefung` to its measure, a request that
   * joins a running computation reports the time it waited.
   */
  pruefung(halter: PruefHalter, marke: string, messung?: Messung): Promise<Derivation>;
  /** The finished check of the holder's current rev, if there is one. */
  fertig(halter: PruefHalter): Derivation | undefined;
  /** A check computed elsewhere for the holder's current rev (festlegen, V-5.5). */
  eintragen(halter: PruefHalter, derivation: Derivation): void;
}

/** Hands on the result of a computation another request runs, its waiting counted to `warten`. */
function mitgewartet<T>(ergebnis: Promise<T>, messung: Messung): Promise<T> {
  if (messung === OHNE_MESSUNG) return ergebnis;
  const start = performance.now();
  const gewartet = () => messung.warten(performance.now() - start);
  return ergebnis.then(
    (value) => {
      gewartet();
      return value;
    },
    (error: unknown) => {
      gewartet();
      throw error;
    },
  );
}

export function pruefSpeicherOf(rechner: PruefRechner, tor?: PruefTor): PruefSpeicher {
  const rechnen = async (
    agordo: Agordo,
    marke: string,
    rev: number,
    messung: Messung,
  ): Promise<Derivation> => {
    if (tor !== undefined) await tor(marke, rev);
    // Until the computation ends, also when it runs in a worker thread (T3).
    return messung.schrittBisFertig("ableitung+pruefung", () => rechner(agordo));
  };
  return {
    pruefung: (halter, marke, messung = OHNE_MESSUNG) => {
      const held = halter.pruefung;
      if (held !== undefined && held.rev === halter.rev)
        return held.fertig === undefined ? mitgewartet(held.ergebnis, messung) : held.ergebnis;
      const { agordo, rev } = halter;
      let eintrag: PruefEintrag | undefined;
      const ergebnis = rechnen(agordo, marke, rev, messung).then(
        (derivation) => {
          if (halter.pruefung === eintrag) {
            // Kept only while its rev holds (V-5.4); a newer rev drops it.
            if (halter.rev === rev && eintrag !== undefined) eintrag.fertig = derivation;
            else delete halter.pruefung;
          }
          return derivation;
        },
        (error: unknown) => {
          if (halter.pruefung === eintrag) delete halter.pruefung;
          throw error;
        },
      );
      // Every request that asks awaits this promise and gets its error; this handler only keeps
      // a computation nobody waits for any more from an unhandled rejection.
      ergebnis.catch(() => undefined);
      eintrag = { rev, ergebnis };
      halter.pruefung = eintrag;
      return ergebnis;
    },
    fertig: (halter) => (halter.pruefung?.rev === halter.rev ? halter.pruefung.fertig : undefined),
    eintragen: (halter, derivation) => {
      halter.pruefung = {
        rev: halter.rev,
        ergebnis: Promise.resolve(derivation),
        fertig: derivation,
      };
    },
  };
}

export interface CssSpeicher {
  /**
   * The stylesheet of a brand at `rev` for a proposal (`""` without) showing `agordo`: computed
   * once per form of the Agordo, shared while it runs. The computing request reports the steps of
   * the stylesheet to its measure, a request that joins reports the time it waited.
   */
  css(
    marke: string,
    rev: number,
    propono: string,
    agordo: Agordo,
    messung?: Messung,
  ): Promise<string>;
}

interface CssEintrag {
  form: string;
  ergebnis: Promise<string>;
  fertig: boolean;
}

/**
 * The store of the stylesheets; `revOf` names the current rev of a brand (its draft's). Per brand
 * one rev, per proposal one entry: at most the number of proposals + 1 entries per brand (A-02).
 */
export function cssSpeicherOf(
  rechner: CssRechner,
  revOf: (marke: string) => number | undefined,
): CssSpeicher {
  const marken = new Map<string, { rev: number; eintraege: Map<string, CssEintrag> }>();
  return {
    css: (marke, rev, propono, agordo, messung = OHNE_MESSUNG) => {
      // A hit needs the rev and the same form of the Agordo shown (A-02).
      const form = JSON.stringify(agordo);
      let marko = marken.get(marke);
      if (marko === undefined || marko.rev !== rev) {
        marko = { rev, eintraege: new Map() };
        marken.set(marke, marko);
      }
      const held = marko.eintraege.get(propono);
      if (held !== undefined && held.form === form)
        return held.fertig ? held.ergebnis : mitgewartet(held.ergebnis, messung);
      const bucket = marko;
      let eintrag: CssEintrag | undefined;
      const ergebnis = rechner(agordo, messung).then(
        (css) => {
          if (bucket.eintraege.get(propono) === eintrag && eintrag !== undefined) {
            // Kept only while the rev holds (V-5.4); a newer rev drops the brand's entries.
            if (revOf(marke) === rev) eintrag.fertig = true;
            else if (marken.get(marke) === bucket) marken.delete(marke);
            else bucket.eintraege.delete(propono);
          }
          return css;
        },
        (error: unknown) => {
          if (bucket.eintraege.get(propono) === eintrag) bucket.eintraege.delete(propono);
          throw error;
        },
      );
      ergebnis.catch(() => undefined);
      eintrag = { form, ergebnis, fertig: false };
      bucket.eintraege.set(propono, eintrag);
      return ergebnis;
    },
  };
}

/** A check the server hands to the worker (Spec 044 T3): its number and the Agordo as a value. */
export interface PruefAuftrag {
  id: number;
  agordo: Agordo;
}

/**
 * What the worker answers: the derivation (structured clone keeps it equal, with key order and
 * shared parts, R-2), or what its check threw.
 */
export type PruefAntwort = { id: number; derivation: Derivation } | { id: number; fehler: unknown };

/** The calculator of the check and where it runs, decided once when the server starts. */
export interface PruefRechnung {
  readonly ort: "worker" | "haupt-thread";
  readonly rechner: PruefRechner;
  /**
   * Spec 044 B-10: starts the worker now, ahead of the first need, so it has loaded its modules
   * and bases when the first check comes; in the main thread nothing. A worker that fails while it
   * starts says nothing: the next need starts a new one.
   */
  vorstarten(): void;
  /** Ends the worker (the server's close); a check it holds fails. A later need starts a new one. */
  beenden(): Promise<void>;
}

/** The module of the check's worker: beside this one in the built package. */
export const PRUEF_WORKER = new URL("./pruefung-worker.js", import.meta.url);

/**
 * Spec 044 T3 (D-02, A-06): the check in a worker thread when its module is there, else – the TS
 * source under Vitest, which a worker cannot load – `haupt` in the main thread, the same function
 * the worker runs. Decided once, here, never per request.
 */
export function pruefRechnungOf(
  haupt: (agordo: Agordo) => Derivation,
  modul: URL = PRUEF_WORKER,
): PruefRechnung {
  if (!existsSync(fileURLToPath(modul)))
    return {
      ort: "haupt-thread",
      rechner: async (agordo) => haupt(agordo),
      vorstarten: () => undefined,
      beenden: async () => undefined,
    };
  return pruefWorkerOf(modul);
}

/**
 * One worker for the checks only (A-04: the stylesheet never waits behind it), started ahead by the
 * server right after it listens (B-10, R-6) or else on the first need, and computing one check
 * after the other. A check that throws in the worker fails with that error, as a throw in the main
 * thread would; a worker that dies fails every check it holds with its error, and the next need
 * starts a new one. No retry, no limit by time.
 */
function pruefWorkerOf(modul: URL): PruefRechnung {
  let worker: Worker | undefined;
  let naechste = 0;
  const offen = new Map<number, { erfuellen(d: Derivation): void; ablehnen(e: unknown): void }>();
  /** The worker `beendet` is gone: every check it held fails with `fehler`. */
  const aus = (beendet: Worker, fehler: unknown): void => {
    if (worker !== beendet) return;
    worker = undefined;
    const gehalten = [...offen.values()];
    offen.clear();
    for (const auftrag of gehalten) auftrag.ablehnen(fehler);
  };
  const gestartet = (): Worker => {
    if (worker !== undefined) return worker;
    const neu = new Worker(modul);
    neu.on("message", (antwort: PruefAntwort) => {
      const auftrag = offen.get(antwort.id);
      if (auftrag === undefined) return;
      offen.delete(antwort.id);
      if ("derivation" in antwort) auftrag.erfuellen(antwort.derivation);
      else auftrag.ablehnen(antwort.fehler);
    });
    neu.on("error", (fehler) => aus(neu, fehler));
    neu.on("messageerror", (fehler) => {
      aus(neu, fehler);
      void neu.terminate();
    });
    neu.on("exit", (code) =>
      aus(neu, new Error(`The worker of the check ended (exit code ${code}).`)),
    );
    worker = neu;
    return neu;
  };
  return {
    ort: "worker",
    rechner: (agordo) =>
      new Promise<Derivation>((erfuellen, ablehnen) => {
        const id = naechste++;
        offen.set(id, { erfuellen, ablehnen });
        try {
          gestartet().postMessage({ id, agordo } satisfies PruefAuftrag);
        } catch (fehler) {
          offen.delete(id);
          ablehnen(fehler);
        }
      }),
    vorstarten: () => {
      try {
        gestartet();
      } catch {
        // A worker that cannot be made now is made on the next need, which gets its error.
      }
    },
    beenden: async () => {
      await worker?.terminate();
    },
  };
}
