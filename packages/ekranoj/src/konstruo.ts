// The screen document (S037-04, D-24, D-27, D-34). Red stage: types only.

import type { Plano, Varianto } from "./tipoj.js";

/** The brand build as a screen loads it: paths relative to the run's `marko/` folder. */
export interface KadraMarko {
  css: readonly string[];
  skripto?: string;
}

export interface KadroEnigo {
  titolo: string;
  fragmento: string;
  varianto: Varianto;
  lingvo: string;
  aspekto: string;
  marko?: KadraMarko | undefined;
  radiko: string;
}

export interface SuperrigardoEnigo {
  plano: Plano;
  aspekto: string;
  lingvo: string;
  varianto: Varianto;
  marko?: KadraMarko | undefined;
  ekranoj: readonly string[];
  bildoj: readonly string[];
  verdaj: Readonly<Record<string, boolean>>;
}
