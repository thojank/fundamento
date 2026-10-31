// The run of a measurement „ganzer Ablauf“ (Spec 037, Lieferliste 2.3): every flow of the catalogue
// × variant (F, 0) × repetition is one run of ekranoj with the catalogue plan (no plan request),
// Variante F with the Gvidanto, Variante 0 without tools (D-07, D-34). One metiejo Budget for the
// whole measurement (`--max-tokens`); the model guard (D-19) before anything is asked; the load of
// the machine before and after each run (D-09). Each run is stored in its own folder (`plano.json`,
// `rondoj/<n>/<slug>.fakto.json`, `kuro.json`, D-33); the report is built from these records only
// (`raporto.ts`). `kuruEkranojn` and every dependency of it are injected, so tests use doubles.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  type ChatModel,
  type EkranojDeps,
  type EkranojRezulto,
  gardiModelon,
  type KuruEkranojn,
  MalpermesitaModelo,
  type Peno,
  type Problemo,
  type Taksilo,
  taksoPorEnigo,
  type Varianto,
} from "@fundamento/ekranoj";
import { Budget } from "@fundamento/metiejo";
import type { Modelo } from "@fundamento/modelo";
import { ABLAUF_TASKOJ, type AblaufTasko, planoDe, trovuTaskon } from "./katalogo.js";
import {
  type AblaufRaporto,
  KURO_DOSIERO,
  type KuroRekordo,
  kuroDir,
  LAUF_DOSIERO,
  type LaufRekordo,
  type StatoEkrano,
  type Sxargo,
  skribiRaporton,
  stabilaJson,
} from "./raporto.js";

// Red (Spec 037, R-3): the types of this module only; the functions arrive with the green commit.

export interface AblaufOpcioj {
  /** Slugs of flows; default: all, in catalogue order. */
  taskoj?: readonly string[];
  /** Default F, 0; always run F before 0 (D-25). */
  varianten?: readonly Varianto[];
  /** Repetitions per flow and variant; the measurement uses 1. */
  ripetoj?: number;
  /** Token limit of the whole measurement (one Budget, `--max-tokens`). */
  maksTokenoj: number;
  lingvo?: "de" | "en";
  /** Parent folder; the run folder is `<out>/<JJJJMMTT-HHMM>`. */
  out: string;
}

/** The dependencies of one ekranoj run, the scorer excepted (the measurement brings its own). */
export type KuraDeps = Omit<EkranojDeps, "taksilo">;

export interface AblaufDeps {
  kuruEkranojn: KuruEkranojn;
  /** `<provider>/<model>` of the chat model (D-19, price). */
  kiModelo: string;
  /** Dependencies of the run of a flow, a variant and a repetition. Tools are dropped for 0. */
  kuraDeps(e: {
    tasko: AblaufTasko;
    varianto: Varianto;
    ripeto: number;
    dir: string;
  }): KuraDeps | Promise<KuraDeps>;
  /** The scorer of a flow, the same in the loop of ekranoj and in the report. */
  taksiloPor(tasko: AblaufTasko): Taksilo;
  /** The Modelo the report reads (patterns, link Eroj). */
  modelo: Modelo;
  /** The brands the injected renderer renders every screen in, × light/dark (D-39). */
  markoj: readonly string[];
  /** `os.loadavg()` and `os.cpus().length` (D-09). */
  sxargo(): { sxargo: Sxargo; kernoj: number };
  nun(): Date;
  commit: string;
  log(linio: string): void;
}

export interface AblaufRezulto {
  dir: string;
  kuroj: KuroRekordo[];
  raporto: AblaufRaporto;
}
