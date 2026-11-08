// The comparison 4.3 of Spec 038 (C-4, D-205): before against after per flow × variant, from the
// stored records of measurement folders only (`lauf.json`, `raporto.json`, `kuro.json`; D-S038-27-1)
// – never scored again, no Modelo, no browser, no network. Each side is judged by its own scorer.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import type { Kriterio, Problemo, Varianto } from "@fundamento/ekranoj";
import { ABLAUF_MARKO } from "./kuro.js";
import {
  type KomparoF0,
  type KomparoR,
  KURO_DOSIERO,
  type KuroSxargo,
  LAUF_DOSIERO,
  lastoSuperKernoj,
  type PenoKvar,
  type RestantajSupraj,
  restantajLauxReguloEl,
  restantajSumoTeksto,
  restantajSuprajDe,
  restantajTeksto,
  STREUUNG_FONTO,
  STREUUNG_REIHE_K,
} from "./raporto.js";

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
  /**
   * The open deviations after the last round per rule, summed over the started repetitions, with
   * the three most frequent rules (Spec 038 A-2, C-2); null: „nicht vorhanden“ (older kuro.json).
   */
  restantajSupraj: RestantajSupraj | null;
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

// --- Reading the stored records, tolerant of older shapes -------------------------------------

const KRITERIOJ: readonly Kriterio[] = ["K1", "K2", "K3", "K4", "K5", "K6"];
const VARIANTOJ: readonly Varianto[] = ["F", "0"];
const MARKOJ: readonly KomparoMarko[] = [
  "gestoert",
  "lasto-super-kernoj",
  "nekomencita",
  "teilweise",
];
const PENO_KAMPOJ = ["inputTokens", "outputTokens", "requests", "toolCalls"] as const;
const RAPORTO_DOSIERO = "raporto.json";

type Obj = Record<string, unknown>;

const obj = (value: unknown): Obj | null =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Obj) : null;
const num = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;
const str = (value: unknown): string | null => (typeof value === "string" ? value : null);
const arr = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const round1 = (value: number): number => Math.round(value * 10) / 10;
const round4 = (value: number): number => Math.round(value * 10000) / 10000;

const kompari = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);
const variantoIndekso = (varianto: string): number => {
  const index = VARIANTOJ.indexOf(varianto as Varianto);
  return index === -1 ? VARIANTOJ.length : index;
};

function mediano(values: readonly (number | null)[], round: (v: number) => number): number | null {
  const numbers = values.filter((value): value is number => value !== null).sort((a, b) => a - b);
  if (numbers.length === 0) return null;
  const mid = Math.floor(numbers.length / 2);
  const value =
    numbers.length % 2 === 1
      ? (numbers[mid] ?? 0)
      : ((numbers[mid - 1] ?? 0) + (numbers[mid] ?? 0)) / 2;
  return round(value);
}

const penoKvarDe = (value: unknown): PenoKvar | null => {
  const own = obj(value);
  if (own === null) return null;
  const kvar: PenoKvar = { inputTokens: 0, outputTokens: 0, requests: 0, toolCalls: 0 };
  for (const kampo of PENO_KAMPOJ) {
    const own2 = num(own[kampo]);
    if (own2 === null) return null;
    kvar[kampo] = own2;
  }
  return kvar;
};

const sxargoDe = (value: unknown): KuroSxargo | null => {
  const own = obj(value);
  const unu = (v: unknown) => {
    const s = obj(v);
    const l1 = num(s?.l1);
    const l5 = num(s?.l5);
    const l15 = num(s?.l15);
    return l1 === null || l5 === null || l15 === null ? null : { l1, l5, l15 };
  };
  const antaux = unu(own?.antaux);
  const post = unu(own?.post);
  const kernoj = num(own?.kernoj);
  return antaux === null || post === null || kernoj === null ? null : { antaux, post, kernoj };
};

interface LegitaRondo {
  fluo: Obj;
  ekranoj: Record<string, Obj>;
}

interface LegitaKuro {
  tasko: string;
  varianto: string;
  ripeto: number;
  nekomencita: boolean;
  haltigo: string | null;
  faritajRondoj: number | null;
  peno: KomparoK7 | null;
  sxargo: KuroSxargo | null;
  rondoj: Record<string, LegitaRondo>;
  penoj: Record<string, Record<string, PenoKvar>> | null;
  penoPlano: PenoKvar | null;
  /** `restantaj` of the report data (null where missing). */
  restantaj: number | null;
  /** `restantajLauxRegulo` of kuro.json (C-2); null in older shapes and on the error path. */
  restantajLauxRegulo: Record<string, Record<string, number>> | null;
}

interface LegitaLauf {
  info: KomparoLauf;
  kuroj: LegitaKuro[];
  /** `<tasko> <varianto>` of every planned pair (lauf.json). */
  planitaj: Set<string>;
  k8Vicoj: { tasko: string; varianto: string; rondo: string; aspekto: string; kvoto: number }[];
}

const sxlosilo = (tasko: string, varianto: string): string => `${tasko} ${varianto}`;

function legiJson(file: string, path: string): unknown {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as unknown;
  } catch (error) {
    throw new NevalidaKomparo([
      {
        path,
        rule: "komparo-json-nelegebla",
        message: `${basename(file)} in ${basename(resolve(file, ".."))} lässt sich nicht lesen: ${error instanceof Error ? error.message : String(error)}`,
        suggestion: "Den Laufordner so angeben, wie --art ablauf ihn geschrieben hat.",
      },
    ]);
  }
}

const estasDosierujo = (dir: string): boolean => existsSync(dir) && statSync(dir).isDirectory();

/**
 * The run folder of `dir` (D-S038-27-3): `dir` itself when it has `lauf.json`, else its one child
 * with `lauf.json` – siblings without one (`projekcioj/`, a `vergleich/`) are ignored.
 */
export function trovuLaufon(dir: string, path = "/dir"): string {
  const own = resolve(dir);
  if (!estasDosierujo(own)) {
    throw new NevalidaKomparo([
      {
        path,
        rule: "komparo-dosierujo-mankas",
        message: `Den Ordner ${own} gibt es nicht.`,
        suggestion: "Den Ordner angeben, den --out der Messung genannt hat.",
      },
    ]);
  }
  if (existsSync(join(own, LAUF_DOSIERO))) return own;
  const laufoj = readdirSync(own)
    .sort()
    .filter((name) => existsSync(join(own, name, LAUF_DOSIERO)));
  const [unu] = laufoj;
  if (laufoj.length === 1 && unu !== undefined) return join(own, unu);
  throw new NevalidaKomparo([
    laufoj.length === 0
      ? {
          path,
          rule: "komparo-sen-lauf",
          message: `In ${own} liegt kein Laufordner (kein ${LAUF_DOSIERO}, auch nicht eine Ebene tiefer).`,
          suggestion:
            "Den Ordner von --out der Messung oder den Laufordner <JJJJMMTT-HHMM> angeben.",
        }
      : {
          path,
          rule: "komparo-pluraj-laufoj",
          message: `In ${own} liegen ${laufoj.length} Laufordner (${laufoj.join(", ")}); welcher gemeint ist, ist offen.`,
          suggestion: "Den Laufordner selbst angeben, z. B. …/<JJJJMMTT-HHMM>.",
        },
  ]);
}

function legiKuron(dir: string, kuro: Obj, path: string): LegitaKuro | null {
  const tasko = str(kuro.tasko);
  const varianto = str(kuro.varianto);
  const ripeto = num(kuro.ripeto) ?? 1;
  if (tasko === null || varianto === null) return null;
  const peno = obj(kuro.peno);
  const k7 = penoKvarDe(peno);
  const rondoj: Record<string, LegitaRondo> = {};
  for (const [n, rondo] of Object.entries(obj(kuro.rondoj) ?? {})) {
    const own = obj(rondo);
    const fluo = obj(own?.fluo);
    if (fluo === null) continue;
    const ekranoj: Record<string, Obj> = {};
    for (const [slug, ekrano] of Object.entries(obj(own?.ekranoj) ?? {})) {
      const e = obj(ekrano);
      if (e !== null) ekranoj[slug] = e;
    }
    rondoj[n] = { fluo, ekranoj };
  }
  // `penoj` live in kuro.json only (C-3); the report data never carry them.
  const kuroFile = join(dir, tasko, varianto, String(ripeto), KURO_DOSIERO);
  const rekordo = existsSync(kuroFile) ? obj(legiJson(kuroFile, path)) : null;
  let penoj: Record<string, Record<string, PenoKvar>> | null = null;
  for (const [n, rondo] of Object.entries(obj(rekordo?.penoj) ?? {})) {
    for (const [slug, value] of Object.entries(obj(rondo) ?? {})) {
      const kvar = penoKvarDe(value);
      if (kvar === null) continue;
      penoj ??= {};
      penoj[n] = { ...(penoj[n] ?? {}), [slug]: kvar };
    }
  }
  return {
    tasko,
    varianto,
    ripeto,
    nekomencita: kuro.nekomencita === true,
    haltigo: str(kuro.haltigo),
    faritajRondoj: num(kuro.faritajRondoj),
    peno: k7 === null ? null : { ...k7, ms: num(peno?.ms) ?? 0, bytes: num(peno?.bytes) ?? 0 },
    sxargo: sxargoDe(kuro.sxargo),
    rondoj,
    penoj,
    penoPlano: penoj === null ? null : penoKvarDe(rekordo?.penoPlano),
    restantaj: num(kuro.restantaj),
    restantajLauxRegulo: restantajLauxReguloEl(rekordo?.restantajLauxRegulo),
  };
}

function legiLaufon(flanko: KomparoFlanko, path: string): LegitaLauf {
  const dir = trovuLaufon(flanko.dir, path);
  const lauf = obj(legiJson(join(dir, LAUF_DOSIERO), path)) ?? {};
  const raportoFile = join(dir, RAPORTO_DOSIERO);
  if (!existsSync(raportoFile)) {
    throw new NevalidaKomparo([
      {
        path,
        rule: "komparo-sen-raporto",
        message: `Im Laufordner ${basename(dir)} fehlt ${RAPORTO_DOSIERO}: der Lauf ist nicht zu Ende geschrieben.`,
        suggestion:
          "Einen vollständigen Laufordner angeben (bei einem abgebrochenen Lauf seine Wiederholung).",
      },
    ]);
  }
  const raporto = obj(legiJson(raportoFile, path)) ?? {};
  const kuroj = arr(raporto.kuroj).flatMap((kuro) => {
    const own = obj(kuro);
    const legita = own === null ? null : legiKuron(dir, own, path);
    return legita === null ? [] : [legita];
  });
  kuroj.sort(
    (a, b) =>
      kompari(a.tasko, b.tasko) ||
      variantoIndekso(a.varianto) - variantoIndekso(b.varianto) ||
      a.ripeto - b.ripeto,
  );
  const taskoj = arr(lauf.taskoj).flatMap((t) => (typeof t === "string" ? [t] : []));
  const varianten = arr(lauf.varianten).flatMap((v) => (typeof v === "string" ? [v] : []));
  const planitaj = new Set(taskoj.flatMap((t) => varianten.map((v) => sxlosilo(t, v))));
  const k8Vicoj = arr(raporto.k8).flatMap((vico) => {
    const own = obj(vico);
    const tasko = str(own?.tasko);
    const varianto = str(own?.varianto);
    const rondo = str(own?.rondo);
    const aspekto = str(own?.aspekto);
    const kvoto = num(own?.kvoto);
    return tasko === null ||
      varianto === null ||
      rondo === null ||
      aspekto === null ||
      kvoto === null
      ? []
      : [{ tasko, varianto, rondo, aspekto, kvoto }];
  });
  const kunK8 =
    k8Vicoj.length > 0 ||
    kuroj.some((kuro) =>
      Object.values(kuro.rondoj).some(
        (rondo) =>
          num(rondo.fluo.k8) !== null ||
          Object.values(rondo.ekranoj).some((ekrano) => num(ekrano.k8) !== null),
      ),
    );
  return {
    info: {
      id: basename(dir),
      commit: str(lauf.commit),
      kiModelo: str(lauf.kiModelo),
      taskoj,
      varianten,
      ripetoj: num(lauf.ripetoj),
      gestoerta: flanko.gestoerta === true,
      nekomencitaj: kuroj
        .filter((kuro) => kuro.nekomencita)
        .map((kuro) => ({ tasko: kuro.tasko, varianto: kuro.varianto, ripeto: kuro.ripeto })),
      kunK8,
      kunPenoj: kuroj.some((kuro) => kuro.penoj !== null),
    },
    kuroj,
    planitaj,
    k8Vicoj,
  };
}

// --- One side of one pair ---------------------------------------------------------------------

const lastaRondoDe = (kuro: LegitaKuro): string | null => {
  const rondoj = Object.keys(kuro.rondoj).sort((a, b) => Number(a) - Number(b) || kompari(a, b));
  return rondoj.at(-1) ?? null;
};

/** D-199: a screen with facts in a round the agent built in, not carried green from before. */
function konstruitajDe(kuro: LegitaKuro): number {
  let sumo = 0;
  for (const [n, rondo] of Object.entries(kuro.rondoj)) {
    if (kuro.faritajRondoj !== null && Number(n) > kuro.faritajRondoj) continue;
    for (const ekrano of Object.values(rondo.ekranoj)) {
      const verdaEkde = num(ekrano.verdaEkde);
      if (num(ekrano.total) === null) continue;
      if (verdaEkde !== null && verdaEkde < Number(n)) continue;
      sumo += 1;
    }
  }
  return sumo;
}

function medianoKvar(kvaroj: readonly PenoKvar[]): PenoKvar {
  const own: PenoKvar = { inputTokens: 0, outputTokens: 0, requests: 0, toolCalls: 0 };
  for (const kampo of PENO_KAMPOJ)
    own[kampo] =
      mediano(
        kvaroj.map((k) => k[kampo]),
        Math.round,
      ) ?? 0;
  return own;
}

function tokenojDe(startitaj: readonly LegitaKuro[]): KomparoTokenoj {
  const konstruitaj = startitaj.reduce((sumo, kuro) => sumo + konstruitajDe(kuro), 0);
  const kunPenoj = startitaj.length > 0 && startitaj.every((kuro) => kuro.penoj !== null);
  if (!kunPenoj) {
    const enigo = startitaj.reduce((sumo, kuro) => sumo + (kuro.peno?.inputTokens ?? 0), 0);
    const eligo = startitaj.reduce((sumo, kuro) => sumo + (kuro.peno?.outputTokens ?? 0), 0);
    return {
      mezo:
        konstruitaj === 0
          ? null
          : { enigo: Math.round(enigo / konstruitaj), eligo: Math.round(eligo / konstruitaj) },
      abgeleitet: startitaj.length > 0,
      konstruitajEkranRondoj: konstruitaj,
      jeEkrano: null,
      penoPlano: null,
    };
  }
  const eroj = startitaj.flatMap((kuro) =>
    Object.values(kuro.penoj ?? {}).flatMap((rondo) => Object.values(rondo)),
  );
  const slugoj = new Set(
    startitaj.flatMap((kuro) => Object.values(kuro.penoj ?? {}).flatMap((r) => Object.keys(r))),
  );
  const jeEkrano: NonNullable<KomparoTokenoj["jeEkrano"]> = {};
  for (const slug of [...slugoj].sort()) {
    const rondoj = new Set(
      startitaj.flatMap((kuro) =>
        Object.entries(kuro.penoj ?? {}).flatMap(([n, r]) => (r[slug] === undefined ? [] : [n])),
      ),
    );
    const jeRondo: Record<string, PenoKvar> = {};
    for (const n of [...rondoj].sort((a, b) => Number(a) - Number(b) || kompari(a, b))) {
      jeRondo[n] = medianoKvar(
        startitaj.flatMap((kuro) => {
          const peno = kuro.penoj?.[n]?.[slug];
          return peno === undefined ? [] : [peno];
        }),
      );
    }
    const sumo: PenoKvar = { inputTokens: 0, outputTokens: 0, requests: 0, toolCalls: 0 };
    for (const peno of Object.values(jeRondo))
      for (const kampo of PENO_KAMPOJ) sumo[kampo] += peno[kampo];
    jeEkrano[slug] = { sumo, jeRondo };
  }
  const planoj = startitaj.flatMap((kuro) => (kuro.penoPlano === null ? [] : [kuro.penoPlano]));
  return {
    mezo:
      eroj.length === 0
        ? null
        : {
            enigo: Math.round(eroj.reduce((a, p) => a + p.inputTokens, 0) / eroj.length),
            eligo: Math.round(eroj.reduce((a, p) => a + p.outputTokens, 0) / eroj.length),
          },
    abgeleitet: false,
    konstruitajEkranRondoj: konstruitaj,
    jeEkrano,
    penoPlano: planoj.length === 0 ? null : medianoKvar(planoj),
  };
}

function valorojDe(
  lauf: LegitaLauf,
  kuroj: readonly LegitaKuro[],
  tasko: string,
  varianto: string,
): KomparoValoroj {
  const startitaj = kuroj.filter((kuro) => !kuro.nekomencita);
  const nekomencitaj = kuroj.filter((kuro) => kuro.nekomencita).map((kuro) => kuro.ripeto);
  const lastaj = startitaj.flatMap((kuro) => {
    const n = lastaRondoDe(kuro);
    const rondo = n === null ? undefined : kuro.rondoj[n];
    return n === null || rondo === undefined ? [] : [{ n, rondo }];
  });
  const lastaRondo =
    lastaj
      .map((l) => l.n)
      .sort((a, b) => Number(a) - Number(b) || kompari(a, b))
      .at(-1) ?? null;
  const fluo = (kampo: string, round: (v: number) => number) =>
    mediano(
      lastaj.map((l) => num(l.rondo.fluo[kampo])),
      round,
    );
  const k = Object.fromEntries(
    KRITERIOJ.map((kriterio) => [
      kriterio,
      mediano(
        lastaj.map((l) => num(obj(l.rondo.fluo.k)?.[kriterio])),
        round4,
      ),
    ]),
  ) as Record<Kriterio, number | null>;
  const rondaTotal = (n: string) =>
    mediano(
      startitaj.map((kuro) => num(kuro.rondoj[n]?.fluo.total)),
      round1,
    );
  const R1 = rondaTotal("1");
  const R3 = rondaTotal("3");
  const penoj = startitaj.flatMap((kuro) => (kuro.peno === null ? [] : [kuro.peno]));
  const k7: KomparoK7 | null =
    penoj.length === 0
      ? null
      : {
          ...medianoKvar(penoj),
          ms:
            mediano(
              penoj.map((p) => p.ms),
              Math.round,
            ) ?? 0,
          bytes:
            mediano(
              penoj.map((p) => p.bytes),
              Math.round,
            ) ?? 0,
        };
  const ekranoj = mediano(
    lastaj.map((l) => Object.values(l.rondo.ekranoj).filter((e) => num(e.total) !== null).length),
    Math.round,
  );
  const verdaj = mediano(
    lastaj.map((l) => Object.values(l.rondo.ekranoj).filter((e) => e.verda === true).length),
    Math.round,
  );
  const k8JeMarko: Record<string, number> = {};
  const aspektoj = new Map<string, number[]>();
  for (const vico of lauf.k8Vicoj) {
    if (vico.tasko !== tasko || vico.varianto !== varianto || vico.rondo !== lastaRondo) continue;
    aspektoj.set(vico.aspekto, [...(aspektoj.get(vico.aspekto) ?? []), vico.kvoto]);
  }
  for (const aspekto of [...aspektoj.keys()].sort()) {
    const kvotoj = aspektoj.get(aspekto) ?? [];
    k8JeMarko[aspekto] = round4(kvotoj.reduce((a, b) => a + b, 0) / kvotoj.length);
  }
  const sxargoj = kuroj.flatMap((kuro) => (kuro.sxargo === null ? [] : [kuro.sxargo]));
  const lasto = startitaj.some((kuro) => kuro.sxargo !== null && lastoSuperKernoj(kuro.sxargo));
  const markoj = new Set<KomparoMarko>();
  if (lauf.info.gestoerta) markoj.add("gestoert");
  if (lasto) markoj.add("lasto-super-kernoj");
  if (startitaj.length === 0) markoj.add("nekomencita");
  else if (nekomencitaj.length > 0 || startitaj.some((kuro) => kuro.haltigo !== null))
    markoj.add("teilweise");
  return {
    lauf: lauf.info.id,
    commit: lauf.info.commit,
    ripetoj: kuroj.map((kuro) => kuro.ripeto),
    nekomencitaj,
    markoj: MARKOJ.filter((marko) => markoj.has(marko)),
    lastaRondo,
    total: fluo("total", round1),
    k,
    k8: fluo("k8", round4),
    navigado: fluo("navigado", round4),
    sxablonoj: fluo("sxablonoj", round4),
    r1r3: { R1, R3, delto: R1 === null || R3 === null ? null : round1(R3 - R1) },
    k7,
    tokenoj: tokenojDe(startitaj),
    ekranoj: ekranoj ?? 0,
    verdaj: verdaj === null ? {} : { [ABLAUF_MARKO]: verdaj },
    k8JeMarko,
    sxargoj,
    lastoSuperKernoj: lasto,
    // A count missing from the report data cannot be checked: treated as „not 0“.
    restantajSupraj: restantajSuprajDe(
      startitaj.map((kuro) => ({
        restantaj: kuro.restantaj ?? Number.NaN,
        restantajLauxRegulo: kuro.restantajLauxRegulo,
      })),
    ),
  };
}

// --- The comparison ---------------------------------------------------------------------------

const MARKO_TEKSTO: Record<KomparoMarko, string> = {
  gestoert: "gestört",
  "lasto-super-kernoj": "Last > Kerne",
  nekomencita: "nicht gestartet",
  teilweise: "teilweise",
};

const FLANKO_TEKSTO = { antaux: "vorher", post: "nachher", zusatz: "Stand vor 036 Teil 5" };

interface Flanko {
  laufoj: LegitaLauf[];
  /** Pair → the folder (index) and its runs. */
  paroj: Map<string, { lauf: LegitaLauf; kuroj: LegitaKuro[] }>;
}

function flankoDe(
  nomo: "antaux" | "post" | "zusatz",
  flankoj: readonly KomparoFlanko[],
  problemoj: Problemo[],
): Flanko {
  const laufoj: LegitaLauf[] = [];
  const paroj: Flanko["paroj"] = new Map();
  for (const [index, flanko] of flankoj.entries()) {
    const path = nomo === "zusatz" ? "/zusatz" : `/${nomo}/${index}`;
    let lauf: LegitaLauf;
    try {
      lauf = legiLaufon(flanko, path);
    } catch (error) {
      if (!(error instanceof NevalidaKomparo)) throw error;
      problemoj.push(...error.problemoj);
      continue;
    }
    laufoj.push(lauf);
    const own = new Map<string, LegitaKuro[]>();
    for (const kuro of lauf.kuroj) {
      const key = sxlosilo(kuro.tasko, kuro.varianto);
      own.set(key, [...(own.get(key) ?? []), kuro]);
    }
    for (const [key, kuroj] of own) {
      const jam = paroj.get(key);
      if (jam !== undefined) {
        problemoj.push({
          path,
          rule: "komparo-paro-duobla",
          message: `${key} steht auf der Seite „${FLANKO_TEKSTO[nomo]}“ zweimal: in ${jam.lauf.info.id} und in ${lauf.info.id}.`,
          suggestion:
            "Je Ablauf × Variante nur einen Laufordner je Seite angeben; statt eines gestörten Laufs seine Wiederholung nennen.",
        });
        continue;
      }
      paroj.set(key, { lauf, kuroj });
    }
  }
  return { laufoj, paroj };
}

function flankaValoro(
  flanko: Flanko,
  nomo: "antaux" | "post" | "zusatz",
  tasko: string,
  varianto: string,
): { valoroj: KomparoValoroj | null; kialo: string | null } {
  const key = sxlosilo(tasko, varianto);
  const own = flanko.paroj.get(key);
  if (own !== undefined)
    return { valoroj: valorojDe(own.lauf, own.kuroj, tasko, varianto), kialo: null };
  const planinta = flanko.laufoj.find((lauf) => lauf.planitaj.has(key));
  return {
    valoroj: null,
    kialo:
      planinta === undefined
        ? `${key}: in keinem Laufordner der Seite „${FLANKO_TEKSTO[nomo]}“.`
        : `${key}: im Lauf ${planinta.info.id} geplant, aber ohne Aufzeichnung (${KURO_DOSIERO}).`,
  };
}

const diferenco = (
  post: number | null,
  antaux: number | null,
  round: (v: number) => number,
): number | null => (post === null || antaux === null ? null : round(post - antaux));

function delto(
  antaux: KomparoValoroj | null,
  post: KomparoValoroj | null,
): { delto: KomparoDelto | null; senDelto: string | null } {
  const kialoj: string[] = [];
  if (antaux === null) kialoj.push("vorher fehlt");
  if (post === null) kialoj.push("nachher fehlt");
  for (const [nomo, valoroj] of [
    ["vorher", antaux],
    ["nachher", post],
  ] as const) {
    for (const marko of valoroj?.markoj ?? []) kialoj.push(`${nomo} ${MARKO_TEKSTO[marko]}`);
  }
  if (antaux === null || post === null || kialoj.length > 0)
    return { delto: null, senDelto: kialoj.join("; ") };
  const total = diferenco(post.total, antaux.total, round1);
  return {
    delto: {
      total,
      enStreuung: total === null ? null : Math.abs(total) <= STREUUNG_REIHE_K,
      k: Object.fromEntries(
        KRITERIOJ.map((kriterio) => [
          kriterio,
          diferenco(post.k[kriterio], antaux.k[kriterio], round4),
        ]),
      ) as Record<Kriterio, number | null>,
      k8: diferenco(post.k8, antaux.k8, round4),
      navigado: diferenco(post.navigado, antaux.navigado, round4),
      sxablonoj: diferenco(post.sxablonoj, antaux.sxablonoj, round4),
      tokenojEnigo: diferenco(
        post.tokenoj.mezo?.enigo ?? null,
        antaux.tokenoj.mezo?.enigo ?? null,
        Math.round,
      ),
      tokenojAbgeleitet: post.tokenoj.abgeleitet || antaux.tokenoj.abgeleitet,
    },
    senDelto: null,
  };
}

function f0De(paroj: readonly KomparoParo[], tasko: string, nomo: "antaux" | "post") {
  const total = (varianto: Varianto) =>
    paroj.find((p) => p.tasko === tasko && p.varianto === varianto)?.[nomo]?.total ?? null;
  const F = total("F");
  const nul = total("0");
  if (F === null && nul === null) return null;
  const d = diferenco(F, nul, round1);
  return { F, "0": nul, delto: d, enStreuung: d === null ? null : Math.abs(d) <= STREUUNG_REIHE_K };
}

/**
 * The comparison 4.3 of the stored folders (pure apart from reading them): per flow × variant
 * both sides (or null with the reason), the extra line of `zusatz`, Δ after − before unless a
 * side is missing or marked. Several folders of a side are merged; the same pair twice is refused
 * ({@link NevalidaKomparo}, every problem at once). Sorted, no paths of the machine in the data.
 */
export function komparo(
  antaux: readonly KomparoFlanko[],
  post: readonly KomparoFlanko[],
  opcioj: { zusatz?: KomparoFlanko } = {},
): KomparoDatumoj {
  const problemoj: Problemo[] = [];
  const antauxa = flankoDe("antaux", antaux, problemoj);
  const posta = flankoDe("post", post, problemoj);
  const zusatz =
    opcioj.zusatz === undefined ? undefined : flankoDe("zusatz", [opcioj.zusatz], problemoj);
  if (problemoj.length > 0) throw new NevalidaKomparo(problemoj);

  // The pairs: every recorded run of both sides (a pair only planned names itself in a reason).
  const sxlosiloj = new Map<string, { tasko: string; varianto: string }>();
  for (const flanko of [antauxa, posta]) {
    for (const lauf of flanko.laufoj) {
      for (const kuro of lauf.kuroj)
        sxlosiloj.set(sxlosilo(kuro.tasko, kuro.varianto), {
          tasko: kuro.tasko,
          varianto: kuro.varianto,
        });
    }
  }
  const paroj: KomparoParo[] = [...sxlosiloj.values()]
    .sort(
      (a, b) =>
        kompari(a.tasko, b.tasko) ||
        variantoIndekso(a.varianto) - variantoIndekso(b.varianto) ||
        kompari(a.varianto, b.varianto),
    )
    .map(({ tasko, varianto }) => {
      const a = flankaValoro(antauxa, "antaux", tasko, varianto);
      const p = flankaValoro(posta, "post", tasko, varianto);
      const z = zusatz === undefined ? undefined : flankaValoro(zusatz, "zusatz", tasko, varianto);
      return {
        tasko,
        varianto: varianto as Varianto,
        antaux: a.valoroj,
        antauxKialo: a.kialo,
        post: p.valoroj,
        postKialo: p.kialo,
        ...(z === undefined ? {} : { zusatz: z.valoroj, zusatzKialo: z.kialo }),
        ...delto(a.valoroj, p.valoroj),
      };
    });
  const taskoj = [...new Set(paroj.map((p) => p.tasko))];
  return {
    streuung: { reiheK: STREUUNG_REIHE_K, fonto: STREUUNG_FONTO },
    laufoj: {
      antaux: antauxa.laufoj.map((lauf) => lauf.info),
      post: posta.laufoj.map((lauf) => lauf.info),
      zusatz: zusatz?.laufoj[0]?.info ?? null,
    },
    paroj,
    f0: taskoj.map((tasko) => ({
      tasko,
      antaux: f0De(paroj, tasko, "antaux"),
      post: f0De(paroj, tasko, "post"),
    })),
  };
}

// --- Markdown ---------------------------------------------------------------------------------

const n = (value: number | null | undefined, digits = 2): string =>
  value === null || value === undefined || Number.isNaN(value)
    ? "–"
    : value.toLocaleString("de-DE", { maximumFractionDigits: digits });

const d = (value: number | null, digits = 2): string =>
  value === null ? "–" : `${value > 0 ? "+" : ""}${n(value, digits)}`;

const dTotal = (value: number | null): string =>
  value === null ? "–" : `${d(value, 1)}${Math.abs(value) <= STREUUNG_REIHE_K ? " ≈" : ""}`;

const NICHT_VORHANDEN = "nicht vorhanden";

const tokenojTeksto = (tokenoj: KomparoTokenoj): string =>
  tokenoj.mezo === null
    ? "–"
    : `${n(tokenoj.mezo.enigo, 0)} / ${n(tokenoj.mezo.eligo, 0)}${tokenoj.abgeleitet ? " (abgeleitet)" : ""}`;

const markojTeksto = (markoj: readonly KomparoMarko[]): string =>
  markoj.length === 0 ? "–" : markoj.map((marko) => MARKO_TEKSTO[marko]).join(", ");

const verdajTeksto = (valoroj: KomparoValoroj): string => {
  const markoj = Object.keys(valoroj.verdaj).sort();
  return markoj.length === 0
    ? "–"
    : markoj.map((m) => `${m} ${valoroj.verdaj[m] ?? 0}/${valoroj.ekranoj}`).join(", ");
};

const sxargoTeksto = (valoroj: KomparoValoroj): string =>
  valoroj.sxargoj.length === 0
    ? NICHT_VORHANDEN
    : valoroj.sxargoj
        .map((s) => `${n(s.antaux.l1)} → ${n(s.post.l1)} (${s.kernoj} Kerne)`)
        .join("; ");

const KOLONOJ = 9 + KRITERIOJ.length;

function valoraVico(tasko: string, varianto: string, seite: string, valoroj: KomparoValoroj) {
  return `| ${tasko} | ${varianto} | ${seite} | ${valoroj.lauf} | ${valoroj.lastaRondo ?? "–"} | ${n(valoroj.total, 1)} | ${KRITERIOJ.map((k) => n(valoroj.k[k])).join(" | ")} | ${valoroj.k8 === null ? NICHT_VORHANDEN : n(valoroj.k8)} | ${n(valoroj.navigado)} | ${n(valoroj.sxablonoj)} | ${tokenojTeksto(valoroj.tokenoj)} | ${verdajTeksto(valoroj)} | ${sxargoTeksto(valoroj)} | ${markojTeksto(valoroj.markoj)} |`;
}

const mankaVico = (tasko: string, varianto: string, seite: string, kialo: string | null) =>
  `| ${tasko} | ${varianto} | ${seite} | — (${kialo ?? "keine Daten"}) |${" — |".repeat(KOLONOJ)}`;

/** The Markdown of the comparison: German, tables, no timestamp, no path of the machine. */
export function komparoMd(datumoj: KomparoDatumoj): string {
  const kunZusatz = datumoj.laufoj.zusatz !== null;
  const lines = [
    "# Vergleich 4.3 – vorher gegen nachher je Ablauf × Variante",
    "",
    `Streuung Reihe K: ${n(datumoj.streuung.reiheK, 1)} Punkte (Quelle: ${datumoj.streuung.fonto}). Ein Δ im Total bis zu dieser Größe ist mit „≈“ markiert: innerhalb der Streuung, kein Befund.`,
    "",
    "Werte mit „gestört“, „Last > Kerne“, „nicht gestartet“ oder „teilweise“ werden nicht verglichen (kein Δ). Jede Seite ist mit ihrem eigenen Stand bewertet; hier wird nichts neu bewertet. K8 steht neben dem Total, nicht darin; „nicht vorhanden“: der Stand hat kein K8. Tokens je Screen = Mittel je gebauter Screen-Runde (ein / aus): aus `penoj` je Runde und Screen, sonst „abgeleitet“ als Laufsumme ÷ gebaute Screen-Runden (D-199).",
    "",
    "## Laufordner",
    "",
    "| Seite | Lauf | Commit | Modell | Aufgaben | Varianten | K8 | Tokens je Runde und Screen | gestört | nicht gestartet |",
    "|---|---|---|---|---|---|---|---|---|---|",
  ];
  const laufVico = (seite: string, lauf: KomparoLauf) =>
    `| ${seite} | ${lauf.id} | ${lauf.commit ?? NICHT_VORHANDEN} | ${lauf.kiModelo ?? NICHT_VORHANDEN} | ${lauf.taskoj.join(", ") || "–"} | ${lauf.varianten.join(", ") || "–"} | ${lauf.kunK8 ? "ja" : NICHT_VORHANDEN} | ${lauf.kunPenoj ? "ja" : `${NICHT_VORHANDEN} (abgeleitet)`} | ${lauf.gestoerta ? "ja" : "nein"} | ${lauf.nekomencitaj.length === 0 ? "–" : `teilweise: ${lauf.nekomencitaj.map((k) => `${k.tasko} ${k.varianto}-${k.ripeto}`).join(", ")}`} |`;
  for (const lauf of datumoj.laufoj.antaux) lines.push(laufVico(FLANKO_TEKSTO.antaux, lauf));
  for (const lauf of datumoj.laufoj.post) lines.push(laufVico(FLANKO_TEKSTO.post, lauf));
  if (datumoj.laufoj.zusatz !== null)
    lines.push(laufVico(FLANKO_TEKSTO.zusatz, datumoj.laufoj.zusatz));

  lines.push(
    "",
    "## Vorher und nachher je Ablauf × Variante (letzte Runde; K1–K6 Anteile 0–1)",
    "",
    `| Ablauf | Variante | Seite | Lauf | Runde | Total | ${KRITERIOJ.join(" | ")} | K8 | Navigation | Muster | Tokens je Screen-Runde | grün | Last 1 min vor → nach | Marker |`,
    `|---|---|---|---|---|---|${KRITERIOJ.map(() => "---|").join("")}---|---|---|---|---|---|---|`,
  );
  for (const paro of datumoj.paroj) {
    const { tasko, varianto } = paro;
    lines.push(
      paro.antaux === null
        ? mankaVico(tasko, varianto, FLANKO_TEKSTO.antaux, paro.antauxKialo)
        : valoraVico(tasko, varianto, FLANKO_TEKSTO.antaux, paro.antaux),
      paro.post === null
        ? mankaVico(tasko, varianto, FLANKO_TEKSTO.post, paro.postKialo)
        : valoraVico(tasko, varianto, FLANKO_TEKSTO.post, paro.post),
    );
    if (kunZusatz) {
      lines.push(
        paro.zusatz === null || paro.zusatz === undefined
          ? mankaVico(tasko, varianto, FLANKO_TEKSTO.zusatz, paro.zusatzKialo ?? null)
          : valoraVico(tasko, varianto, FLANKO_TEKSTO.zusatz, paro.zusatz),
      );
    }
    const delta = paro.delto;
    lines.push(
      delta === null
        ? `| ${tasko} | ${varianto} | Δ nachher − vorher | kein Δ: ${paro.senDelto ?? "–"} |${" — |".repeat(KOLONOJ)}`
        : `| ${tasko} | ${varianto} | Δ nachher − vorher | – | – | ${dTotal(delta.total)} | ${KRITERIOJ.map((k) => d(delta.k[k])).join(" | ")} | ${delta.k8 === null ? "–" : d(delta.k8)} | ${d(delta.navigado)} | ${d(delta.sxablonoj)} | ${delta.tokenojEnigo === null ? "–" : `${d(delta.tokenojEnigo, 0)} ein${delta.tokenojAbgeleitet ? " (abgeleitet)" : ""}`} | – | – | – |`,
    );
  }

  lines.push(
    "",
    "## F gegen 0 je Ablauf (letzte Runde, Total)",
    "",
    "| Ablauf | Seite | Total F | Total 0 | Δ F−0 |",
    "|---|---|---|---|---|",
  );
  for (const vico of datumoj.f0) {
    for (const nomo of ["antaux", "post"] as const) {
      const own = vico[nomo];
      lines.push(
        own === null
          ? `| ${vico.tasko} | ${FLANKO_TEKSTO[nomo]} | — | — | — |`
          : `| ${vico.tasko} | ${FLANKO_TEKSTO[nomo]} | ${n(own.F, 1)} | ${n(own["0"], 1)} | ${dTotal(own.delto)} |`,
      );
    }
  }

  lines.push(
    "",
    "## Runde 1 gegen Runde 3 je Ablauf × Variante (Total)",
    "",
    "| Ablauf | Variante | Seite | R1 | R3 | Δ R3−R1 |",
    "|---|---|---|---|---|---|",
  );
  const flankojDe = (paro: KomparoParo) =>
    [
      [FLANKO_TEKSTO.antaux, paro.antaux],
      [FLANKO_TEKSTO.post, paro.post],
      ...(kunZusatz ? [[FLANKO_TEKSTO.zusatz, paro.zusatz ?? null] as const] : []),
    ] as const;
  for (const paro of datumoj.paroj) {
    for (const [seite, valoroj] of flankojDe(paro)) {
      lines.push(
        valoroj === null
          ? `| ${paro.tasko} | ${paro.varianto} | ${seite} | — | — | — |`
          : `| ${paro.tasko} | ${paro.varianto} | ${seite} | ${n(valoroj.r1r3.R1, 1)} | ${n(valoroj.r1r3.R3, 1)} | ${dTotal(valoroj.r1r3.delto)} |`,
      );
    }
  }

  lines.push(
    "",
    "## Offene Abweichungen je Regel (nach der letzten Runde, häufigste drei)",
    "",
    "Summe über die gestarteten Wiederholungen; nicht gebaute Screens als „nicht-gebaut“; gleich häufige Regeln nach Namen. „nicht vorhanden“: die Aufzeichnung hat keine Regeln (älterer Stand).",
    "",
    "| Ablauf | Variante | Seite | offen | häufigste Regeln |",
    "|---|---|---|---|---|",
  );
  for (const paro of datumoj.paroj) {
    for (const [seite, valoroj] of flankojDe(paro)) {
      lines.push(
        valoroj === null
          ? `| ${paro.tasko} | ${paro.varianto} | ${seite} | — | — |`
          : `| ${paro.tasko} | ${paro.varianto} | ${seite} | ${restantajSumoTeksto(valoroj.restantajSupraj)} | ${restantajTeksto(valoroj.restantajSupraj)} |`,
      );
    }
  }

  lines.push(
    "",
    "## Tokens je Screen und Runde (aus `penoj`)",
    "",
    "| Ablauf | Variante | Seite | Screen | Runde | Tokens ein | Tokens aus | Anfragen | Werkzeugaufrufe |",
    "|---|---|---|---|---|---|---|---|---|",
  );
  for (const paro of datumoj.paroj) {
    for (const [seite, valoroj] of flankojDe(paro)) {
      if (valoroj === null) continue;
      const kapo = `| ${paro.tasko} | ${paro.varianto} | ${seite}`;
      const { jeEkrano, penoPlano } = valoroj.tokenoj;
      if (jeEkrano === null) {
        lines.push(
          `${kapo} | ${NICHT_VORHANDEN} (abgeleitet: ${tokenojTeksto({ ...valoroj.tokenoj, abgeleitet: false })} je Screen-Runde, ${valoroj.tokenoj.konstruitajEkranRondoj} gebaute Screen-Runden) | – | – | – | – | – |`,
        );
        continue;
      }
      const vico = (screen: string, rondo: string, p: PenoKvar) =>
        `${kapo} | ${screen} | ${rondo} | ${n(p.inputTokens, 0)} | ${n(p.outputTokens, 0)} | ${n(p.requests, 0)} | ${n(p.toolCalls, 0)} |`;
      for (const [slug, own] of Object.entries(jeEkrano)) {
        for (const [rondo, peno] of Object.entries(own.jeRondo))
          lines.push(vico(slug, rondo, peno));
        lines.push(vico(slug, "Summe", own.sumo));
      }
      if (penoPlano !== null) lines.push(vico("außerhalb der Bauten", "–", penoPlano));
    }
  }

  lines.push(
    "",
    "## Aufwand (K7) und Last",
    "",
    "„Last > Kerne“: die Last einer Minute lag vor oder nach dem Lauf über der Zahl der Kerne – der Wert wird nicht verglichen.",
    "",
    "| Ablauf | Variante | Seite | Tokens ein | Tokens aus | Anfragen | Werkzeugaufrufe | Markup | Dauer | gebaute Screen-Runden | Last 1 min vor → nach |",
    "|---|---|---|---|---|---|---|---|---|---|---|",
  );
  for (const paro of datumoj.paroj) {
    for (const [seite, valoroj] of flankojDe(paro)) {
      if (valoroj === null) continue;
      const k7 = valoroj.k7;
      lines.push(
        `| ${paro.tasko} | ${paro.varianto} | ${seite} | ${n(k7?.inputTokens, 0)} | ${n(k7?.outputTokens, 0)} | ${n(k7?.requests, 0)} | ${n(k7?.toolCalls, 0)} | ${k7 === null ? "–" : `${n(k7.bytes, 0)} B`} | ${k7 === null ? "–" : `${n(k7.ms / 1000, 1)} s`} | ${valoroj.tokenoj.konstruitajEkranRondoj} | ${sxargoTeksto(valoroj)} |`,
      );
    }
  }
  return `${lines.join("\n")}\n`;
}
