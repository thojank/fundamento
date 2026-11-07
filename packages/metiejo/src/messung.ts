// Spec 044 (D-03, V-2): where the time of a request goes. With a sink in `ServiloOptions.messung`
// each measured request reports, when its response is finished, one entry per step it ran – the
// summed duration of that step – then `warten` (from entering the handler to the start of its own
// work) and `gesamt` (from entering the handler to the end of the response). Without a sink nothing
// is measured, written or reported: every step just runs. Node's `performance` only.

import type { ServerResponse } from "node:http";

export type MessRoute = "pruefung" | "stato" | "vorschau" | "vorschau.css" | "asistanto";
export type MessSchritt =
  | "marke-laden"
  | "ableitung"
  | "ableitung+pruefung"
  | "projektion"
  | "css-js"
  | "warten"
  | "gesamt";

export interface MessEintrag {
  route: MessRoute;
  marke: string;
  rev: number;
  schritt: MessSchritt;
  ms: number;
}

export type MessSenke = (eintrag: MessEintrag) => void;

/** The steps a request runs itself, in the order its entries are reported. */
const ARBEIT: readonly MessSchritt[] = [
  "marke-laden",
  "ableitung",
  "ableitung+pruefung",
  "projektion",
  "css-js",
];

/** The measure of one request; `schritt` runs its work and, when measured, times it. */
export interface Messung {
  schritt<T>(schritt: MessSchritt, work: () => T): T;
  /** The rev the request found (its draft's, when it was loaded). */
  rev(rev: number): void;
}

/** Runs every step unmeasured: the measure of a server without a sink. */
export const OHNE_MESSUNG: Messung = { schritt: (_schritt, work) => work(), rev: () => undefined };

/**
 * The measure of a request to `route` of `marke`, entered at `eingang` (`performance.now()`); its
 * entries go to `senke` when `response` is finished. Without a sink: OHNE_MESSUNG.
 */
export function messungOf(
  senke: MessSenke | undefined,
  route: MessRoute,
  marke: string,
  eingang: number,
  response: ServerResponse,
): Messung {
  if (senke === undefined) return OHNE_MESSUNG;
  const dauer: Partial<Record<MessSchritt, number>> = {};
  // A step inside another (the check inside the rendering of a frame) counts for itself only: the
  // time of the inner steps is taken off the outer one.
  const offen: number[] = [];
  let beginn: number | undefined;
  let rev = 0;
  response.once("finish", () => {
    const ende = performance.now();
    const report = (schritt: MessSchritt, ms: number) => senke({ route, marke, rev, schritt, ms });
    for (const schritt of ARBEIT) {
      const ms = dauer[schritt];
      if (ms !== undefined) report(schritt, ms);
    }
    report("warten", (beginn ?? ende) - eingang);
    report("gesamt", ende - eingang);
  });
  return {
    schritt: (schritt, work) => {
      const start = performance.now();
      beginn ??= start;
      offen.push(0);
      try {
        return work();
      } finally {
        const innen = offen.pop() ?? 0;
        const ms = performance.now() - start;
        dauer[schritt] = (dauer[schritt] ?? 0) + ms - innen;
        const aussen = offen.length - 1;
        if (aussen >= 0) offen[aussen] = (offen[aussen] ?? 0) + ms;
      }
    },
    rev: (value) => {
      rev = value;
    },
  };
}
