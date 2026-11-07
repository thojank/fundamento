// The comparison 4.3 of Spec 038 (C-4, D-205): before against after per flow × variant, from the
// stored records of measurement folders only (`lauf.json`, `raporto.json`, `kuro.json`; D-S038-27-1)
// – never scored again, no Modelo, no browser, no network. Each side is judged by its own scorer.

import type { Kriterio, Problemo, Varianto } from "@fundamento/ekranoj";
import type { KomparoF0, KomparoR, KuroSxargo, PenoKvar } from "./raporto.js";

/** One measurement folder of a side: a run folder (with `lauf.json`) or a parent with exactly one. */
export interface KomparoFlanko {
  dir: string;
  /** Disturbed (`$S/laeufe.tsv`, D-S038-27-2): every value of it is marked and never compared. */
  gestoerta?: boolean;
}

/** Why a value is not compared. */
export type KomparoMarko = "gestoert" | "lasto-super-kernoj" | "nekomencita" | "teilweise";

/** Tokens per screen of one side (D-199, D-206). */
export interface KomparoTokenoj {
  /** Mean tokens per built screen-round; null without a built screen-round. */
  mezo: { enigo: number; eligo: number } | null;
  /** true: run sum ÷ built screen-rounds (D-199); false: mean of the `penoj` entries. */
  abgeleitet: boolean;
  /** Built screen-rounds: a screen with facts in a round the agent built in, not carried green. */
  konstruitajEkranRondoj: number;
  /** Per screen the sum and each round, from `penoj`; null where the records have none. */
  jeEkrano: Record<string, { sumo: PenoKvar; jeRondo: Record<string, PenoKvar> }> | null;
  /** The share outside the builds (`penoPlano`); null where the records have none. */
  penoPlano: PenoKvar | null;
}

/** The effort of the runs (K7, never weighted): medians over the repetitions. */
export interface KomparoK7 extends PenoKvar {
  ms: number;
  bytes: number;
}

/** One side of one flow × variant: medians over its repetitions, last stored round. */
export interface KomparoValoroj {
  /** The run id (name of the run folder). */
  lauf: string;
  commit: string | null;
  /** Repetitions with a record. */
  ripetoj: number[];
  /** Repetitions that did not start (token limit). */
  nekomencitaj: number[];
  markoj: KomparoMarko[];
  lastaRondo: string | null;
  total: number | null;
  k: Record<Kriterio, number | null>;
  /** null: „nicht vorhanden“ (no K8 in the records, e.g. the reference before K8). */
  k8: number | null;
  navigado: number | null;
  sxablonoj: number | null;
  /** Round 1 against round 3 (total). */
  r1r3: KomparoR;
  k7: KomparoK7 | null;
  tokenoj: KomparoTokenoj;
  /** Screens in the last round. */
  ekranoj: number;
  /** Brand → green screens in the last round (the brand the run judged green in). */
  verdaj: Record<string, number>;
  /** Brand → mean K8 kvoto over light/dark in the last round; {} where none. */
  k8JeMarko: Record<string, number>;
  /** The load before and after each repetition, with the cores (D-09). */
  sxargoj: KuroSxargo[];
  lastoSuperKernoj: boolean;
}

/** After − before of one flow × variant. */
export interface KomparoDelto {
  total: number | null;
  /** |Δ total| ≤ the spread of Reihe K (shown „≈“). */
  enStreuung: boolean | null;
  k: Record<Kriterio, number | null>;
  k8: number | null;
  navigado: number | null;
  sxablonoj: number | null;
  /** Δ mean tokens in per built screen-round. */
  tokenojEnigo: number | null;
  /** One side's token mean is derived (D-199). */
  tokenojAbgeleitet: boolean;
}

/** One flow × variant: before, after (or null with the reason), the extra line, Δ. */
export interface KomparoParo {
  tasko: string;
  varianto: Varianto;
  antaux: KomparoValoroj | null;
  antauxKialo: string | null;
  post: KomparoValoroj | null;
  postKialo: string | null;
  /** Only with `--zusatz`: the line „Stand vor 036 Teil 5“ (never compared). */
  zusatz?: KomparoValoroj | null;
  zusatzKialo?: string | null;
  /** null: not compared, see {@link senDelto}. */
  delto: KomparoDelto | null;
  senDelto: string | null;
}

/** A run folder that went into the comparison. */
export interface KomparoLauf {
  id: string;
  commit: string | null;
  kiModelo: string | null;
  taskoj: string[];
  varianten: string[];
  ripetoj: number | null;
  gestoerta: boolean;
  /** The runs that did not start: the folder covers its plan only „teilweise“. */
  nekomencitaj: { tasko: string; varianto: string; ripeto: number }[];
  /** Any record carries K8 / `penoj`. */
  kunK8: boolean;
  kunPenoj: boolean;
}

/** F against 0 of one flow on one side (last round, total). */
export interface KomparoF0Vico extends KomparoF0 {
  enStreuung: boolean | null;
}

export interface KomparoDatumoj {
  streuung: { reiheK: number; fonto: string };
  laufoj: { antaux: KomparoLauf[]; post: KomparoLauf[]; zusatz: KomparoLauf | null };
  paroj: KomparoParo[];
  f0: { tasko: string; antaux: KomparoF0Vico | null; post: KomparoF0Vico | null }[];
}

/** The folders of the comparison do not fit: every problem at once. */
export class NevalidaKomparo extends Error {
  readonly problemoj: Problemo[];

  constructor(problemoj: Problemo[]) {
    super(problemoj.map((problemo) => problemo.message).join(" "));
    this.name = "NevalidaKomparo";
    this.problemoj = problemoj;
  }
}

/** The run folder of `dir`: itself (with `lauf.json`) or its one child with `lauf.json`. */
export function trovuLaufon(_dir: string): string {
  throw new Error("S038-27: trovuLaufon ist noch nicht gebaut.");
}

/** The comparison 4.3 of the stored folders (pure apart from reading them). */
export function komparo(
  _antaux: readonly KomparoFlanko[],
  _post: readonly KomparoFlanko[],
  _opcioj: { zusatz?: KomparoFlanko } = {},
): KomparoDatumoj {
  throw new Error("S038-27: komparo ist noch nicht gebaut.");
}

/** The Markdown of the comparison: German, tables, no timestamp. */
export function komparoMd(_datumoj: KomparoDatumoj): string {
  throw new Error("S038-27: komparoMd ist noch nicht gebaut.");
}
