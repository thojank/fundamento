// The report of a measurement „ganzer Ablauf“ (Spec 037, Lieferliste 2.3, AC-11): F against 0 and
// round 1 against round 3, per flow and per screen – K1–K6 shares, total, navigation (D-05) and
// patterns (D-06) – with K7 (effort) beside, the load of the machine (D-09; time values under a
// load above the cores are marked and not compared), the spread of Reihe K as the yardstick, the
// stop reasons, tokens and $ (metiejo `kostoOf`). Everything comes from the stored records of the
// run folder (D-33): `raporto(dir)` rebuilds the report and gives the same bytes every time
// (sorted keys, no timestamps in the content – the run id in the folder name carries the time).

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import type { Haltigo, Kriterio, Peno, Taksilo, Varianto } from "@fundamento/ekranoj";
import { kostoOf } from "@fundamento/metiejo";
import {
  defaultModeloSource,
  loadModelo,
  type Modelo,
  type NordsteloFile,
} from "@fundamento/modelo";
import { median } from "../report.js";
import { scoreBoth } from "../score.js";
import { type AblaufTasko, taskoDe, trovuTaskon } from "./katalogo.js";
import { type FluaPoento, legiKatalogon, legiKuron, poentiKuron } from "./poentoj.js";

// Red (Spec 037, R-3): the types of this module only; the functions arrive with the green commit.

/** The load averages of the machine (`os.loadavg()`), rounded to two places. */
export interface Sxargo {
  l1: number;
  l5: number;
  l15: number;
}

/** Load before and after one run of a flow and variant, with the cores (D-09). */
export interface KuroSxargo {
  antaux: Sxargo;
  post: Sxargo;
  kernoj: number;
}

/** The state of a screen in a stored round: green, and since which round (D-26). */
export interface StatoEkrano {
  verda: boolean;
  verdaEkde?: number;
}

/** `kuro.json`: one ekranoj run of a flow, a variant and a repetition. */
export interface KuroRekordo {
  tasko: string;
  varianto: Varianto;
  ripeto: number;
  /** Not started: the shared token budget was used up before (D-25). */
  nekomencita?: boolean;
  haltigo?: Haltigo;
  /** The message of an error that ended the run (no stack, keys redacted by the caller). */
  eraro?: string;
  faritajRondoj: number;
  peno: Peno;
  /** The estimate of ekranoj before the run (D-20). */
  takso?: { tokenoj: number; usd?: number };
  /** Round number → screen slug → green state. */
  stato: Record<string, Record<string, StatoEkrano>>;
  /** Deviations left after the last round. */
  restantaj: number;
  notoj: string[];
  sxargo: KuroSxargo;
}

/** `lauf.json`: the settings of the whole measurement. */
export interface LaufRekordo {
  commit: string;
  /** `<provider>/<model>` (D-19). */
  kiModelo: string;
  maksTokenoj: number;
  lingvo: "de" | "en";
  taskoj: string[];
  varianten: Varianto[];
  ripetoj: number;
  /** The brands every screen is rendered in, × light/dark, contrast default (D-39). */
  markoj: string[];
  /** The estimate over all runs before the start (D-20, D-25). */
  takso: { tokenoj: number; usd?: number };
}

/** One flow in one round. */
export interface FluaValoro {
  konstruitaj: number;
  planitaj: number;
  total: number;
  k: Record<Kriterio, number | null>;
  navigado: number;
  sxablonoj: number;
}

/** One screen in one round. */
export interface EkranaValoro {
  /** null: not built in this round. */
  total: number | null;
  k: Record<Kriterio, number | null> | null;
  /** D-05: all planned edges present, no dead link. */
  kompleta: boolean;
  /** D-06: no purpose of this screen differs from the other screens. */
  unueca: boolean;
  verda: boolean | null;
  verdaEkde: number | null;
}

export interface KuroEnRaporto {
  tasko: string;
  varianto: Varianto;
  ripeto: number;
  nekomencita: boolean;
  haltigo: Haltigo | null;
  eraro: string | null;
  faritajRondoj: number;
  peno: Peno;
  /** $ via `kostoOf`; null = unknown price („Kosten unbekannt“, never 0). */
  usd: number | null;
  sxargo: KuroSxargo;
  /** The 1-minute load before or after was above the cores: its time values are not compared. */
  lastoSuperKernoj: boolean;
  restantaj: number;
  notoj: string[];
  /** Every stored round. */
  rondoj: Record<string, { fluo: FluaValoro; ekranoj: Record<string, EkranaValoro> }>;
}

export interface KomparoF0 {
  F: number | null;
  "0": number | null;
  /** F − 0. */
  delto: number | null;
}

export interface KomparoR {
  R1: number | null;
  R3: number | null;
  /** R3 − R1. */
  delto: number | null;
}

export interface RaportoDatumoj {
  id: string;
  lauf: LaufRekordo;
  streuung: { reiheK: number; fonto: string };
  kuroj: KuroEnRaporto[];
  komparoj: {
    /** F against 0 per flow, in round 1 and in round 3 (medians over the repetitions). */
    f0: {
      tasko: string;
      rondo: string;
      total: KomparoF0;
      navigado: KomparoF0;
      sxablonoj: KomparoF0;
      /** |Δ total| ≤ the spread of Reihe K. */
      enStreuung: boolean | null;
    }[];
    /** Round 1 against round 3 per flow and variant. */
    r1r3: {
      tasko: string;
      varianto: Varianto;
      total: KomparoR;
      navigado: KomparoR;
      sxablonoj: KomparoR;
      enStreuung: boolean | null;
    }[];
    /** Per screen: the total in F and 0, round 1 and round 3. */
    ekranoj: {
      tasko: string;
      ekrano: string;
      F: KomparoR;
      "0": KomparoR;
      /** F against 0 in round 3. */
      f0R3: KomparoF0;
    }[];
  };
  sumo: {
    tokenoj: { enigo: number; eligo: number };
    anfragoj: number;
    usd: number | null;
    kuroj: number;
    nekomencitaj: number;
    haltigoj: { tasko: string; varianto: Varianto; ripeto: number; haltigo: Haltigo }[];
  };
}

export interface AblaufRaporto {
  md: string;
  datumoj: RaportoDatumoj;
}

export interface RaportoOpcioj {
  /** The Modelo the patterns and the scorer read (default: the repository's). */
  modelo?: Modelo;
  /** The scorer per flow (default: {@link taksiloPorMezuro} with the Modelo catalogue). */
  taksiloPor?: (tasko: AblaufTasko) => Taksilo;
}
