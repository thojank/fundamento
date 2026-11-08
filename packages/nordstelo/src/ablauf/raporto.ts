// The report of a measurement „ganzer Ablauf“ (Spec 037, Lieferliste 2.3, AC-11): F against 0 and
// round 1 against round 3, per flow and per screen – K1–K6 shares, total, navigation (D-05) and
// patterns (D-06) – with K7 (effort) beside, the load of the machine (D-09; time values under a
// load above the cores are marked and not compared), the spread of Reihe K as the yardstick, the
// stop reasons, tokens and $ (metiejo `kostoOf`). Everything comes from the stored records of the
// run folder (D-33): `raporto(dir)` rebuilds the report and gives the same bytes every time
// (sorted keys, no timestamps in the content – the run id in the folder name carries the time).

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import type {
  AnbieterEraro,
  Haltigo,
  Kriterio,
  MalplenaPagxo,
  Peno,
  Taksilo,
  Varianto,
} from "@fundamento/ekranoj";
import { kostoOf } from "@fundamento/metiejo";
import {
  defaultModeloSource,
  loadModelo,
  type Modelo,
  type NordsteloFile,
} from "@fundamento/modelo";
import { ekranoTaksilo } from "../ekrano-taksilo.js";
import { K8_MERKMALOJ, type K8Merkmal } from "../k8/k8.js";
import { median } from "../report.js";
import { type AblaufTasko, kriteriojDe, trovuTaskon } from "./katalogo.js";
import { type FluaPoento, legiKatalogon, legiKuron, poentiKuron } from "./poentoj.js";

/**
 * The spread of Reihe K (ministral), in points of the total: the Kennzahl F moved by this much
 * between repetitions of the same run. Source: `specs/034-nachlese-12/plan.md`, line „Streuung
 * (H 9,8, K 16,7)“ (run `20261029-1127`). A difference up to this size is within the noise.
 */
export const STREUUNG_REIHE_K = 16.7;
/** Where {@link STREUUNG_REIHE_K} comes from (named in the report). */
export const STREUUNG_FONTO = "specs/034-nachlese-12/plan.md, „Streuung (H 9,8, K 16,7)“";

/** The rounds the report compares (V-3: at most three rounds). */
export const KOMPARATAJ_RONDOJ = ["1", "3"] as const;

const KRITERIOJ: readonly Kriterio[] = ["K1", "K2", "K3", "K4", "K5", "K6"];

// --- Stored records (written by kuro.ts, read here) --------------------------------------------

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

/** The four counters of an effort that add up across builds (Spec 038 C-3; not `ms`/`bytes`). */
export type PenoKvar = Pick<Peno, "inputTokens" | "outputTokens" | "requests" | "toolCalls">;

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
  /**
   * The effort of each build per round and screen, from `RondoEkrano.peno` of ekranoj (Spec 038
   * C-3, additive): round number → screen slug → the four counters. A build without `peno` (no
   * request, a carried round, a result before C-6) has no entry; a run without any has no field.
   */
  penoj?: Record<string, Record<string, PenoKvar>>;
  /** The run `peno` minus every entry of {@link penoj}: the share outside the builds (C-3). */
  penoPlano?: PenoKvar;
  /** The estimate of ekranoj before the run (D-20). */
  takso?: { tokenoj: number; usd?: number };
  /** Round number → screen slug → green state. */
  stato: Record<string, Record<string, StatoEkrano>>;
  /** Deviations left after the last round. */
  restantaj: number;
  notoj: string[];
  sxargo: KuroSxargo;
  /**
   * Every caught provider error of the run (Spec 038 A-1, C-1, the shape of ekranoj), messages
   * cleaned; absent when nothing was caught and in older `kuro.json`.
   */
  anbieterfehleroj?: AnbieterEraro[];
  /**
   * The deviations left after the last round per screen slug and rule (Spec 038 A-2, C-2,
   * additive): Σ over all slugs and rules === {@link restantaj} (unbuilt screens as
   * `nicht-gebaut`). Absent on the error path, for a run that did not start and in older
   * `kuro.json`.
   */
  restantajLauxRegulo?: Record<string, Record<string, number>>;
  /**
   * Every screen-round whose page had no element content (Spec 038 B-4, AK-2, the records of
   * ekranoj's `EkranojRezulto.malplenajPagxoj`, D-S038-37c-5); `respondo` is relative to the run
   * folder. Absent when there are none, on the error path and in older `kuro.json`.
   */
  malplenajPagxoj?: MalplenaPagxo[];
}

/** How many rules the reports show per flow × variant (Spec 038 A-2: the three most frequent). */
export const RESTANTAJ_SUPRAJ = 3;

/** One rule with the number of its open deviations. */
export interface RegulaNombro {
  regulo: string;
  nombro: number;
}

/** The open deviations of some runs: their sum and the most frequent rules (C-2). */
export interface RestantajSupraj {
  /** Σ over every rule (= Σ `restantaj` of the runs). */
  sumo: number;
  /** At most {@link RESTANTAJ_SUPRAJ} rules, most frequent first, ties by rule name. */
  supraj: RegulaNombro[];
}

/** What {@link restantajSuprajDe} reads of one run. */
export interface RestantajEnKuro {
  restantaj: number;
  /** null: the record has no `restantajLauxRegulo` (older shape, error path). */
  restantajLauxRegulo: Record<string, Record<string, number>> | null;
}

/**
 * The open deviations of the started runs of one flow × variant, summed over the runs and screens
 * per rule (Spec 038 A-2, C-2). null („nicht vorhanden“) where no run carries
 * `restantajLauxRegulo` or a run with open deviations lacks it (an older `kuro.json`): a sum is
 * only shown when it is complete. A run without the field and without deviations (the error path)
 * adds nothing.
 */
export function restantajSuprajDe(kuroj: readonly RestantajEnKuro[]): RestantajSupraj | null {
  if (!kuroj.some((kuro) => kuro.restantajLauxRegulo !== null)) return null;
  if (kuroj.some((kuro) => kuro.restantajLauxRegulo === null && kuro.restantaj !== 0)) return null;
  const jeRegulo = new Map<string, number>();
  for (const kuro of kuroj) {
    for (const reguloj of Object.values(kuro.restantajLauxRegulo ?? {})) {
      for (const [regulo, nombro] of Object.entries(reguloj))
        jeRegulo.set(regulo, (jeRegulo.get(regulo) ?? 0) + nombro);
    }
  }
  const cxiuj = [...jeRegulo.entries()]
    .map(([regulo, nombro]) => ({ regulo, nombro }))
    .sort(
      (a, b) => b.nombro - a.nombro || (a.regulo < b.regulo ? -1 : a.regulo > b.regulo ? 1 : 0),
    );
  return {
    sumo: cxiuj.reduce((sumo, r) => sumo + r.nombro, 0),
    supraj: cxiuj.slice(0, RESTANTAJ_SUPRAJ),
  };
}

/** The rules of {@link RestantajSupraj} in a table cell: „regulo n, …“, „–“, „nicht vorhanden“. */
export const restantajTeksto = (restantaj: RestantajSupraj | null): string =>
  restantaj === null
    ? "nicht vorhanden"
    : restantaj.supraj.length === 0
      ? "–"
      : restantaj.supraj.map((r) => `${r.regulo} ${r.nombro}`).join(", ");

/** The sum of {@link RestantajSupraj} in a table cell („–“ where not available). */
export const restantajSumoTeksto = (restantaj: RestantajSupraj | null): string =>
  restantaj === null ? "–" : String(restantaj.sumo);

/** Read `restantajLauxRegulo` of a stored record, tolerant: null where missing or malformed. */
export function restantajLauxReguloEl(
  value: unknown,
): Record<string, Record<string, number>> | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
  const own: Record<string, Record<string, number>> = {};
  for (const [slug, reguloj] of Object.entries(value)) {
    if (reguloj === null || typeof reguloj !== "object" || Array.isArray(reguloj)) return null;
    const unu: Record<string, number> = {};
    for (const [regulo, nombro] of Object.entries(reguloj)) {
      if (typeof nombro !== "number" || !Number.isFinite(nombro)) return null;
      unu[regulo] = nombro;
    }
    own[slug] = unu;
  }
  return own;
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

export const LAUF_DOSIERO = "lauf.json";
export const KURO_DOSIERO = "kuro.json";

/** The folder of one run of a flow, a variant and a repetition, inside the run folder. */
export const kuroDir = (dir: string, tasko: string, varianto: Varianto, ripeto: number): string =>
  join(dir, tasko, varianto, String(ripeto));

// --- The report data ---------------------------------------------------------------------------

/** One flow in one round. */
export interface FluaValoro {
  konstruitaj: number;
  planitaj: number;
  total: number;
  k: Record<Kriterio, number | null>;
  navigado: number;
  sxablonoj: number;
  /** Mean K8 kvoto over the screens with K8; absent where none has one (Spec 038, C-E). */
  k8?: number;
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
  /** The K8 kvoto of the screen; absent where it has none (Spec 038, C-E). */
  k8?: number;
}

/** One row of „K8 je Merkmal und Kombination“: means over the screens and repetitions. */
export interface K8Vico {
  tasko: string;
  varianto: Varianto;
  rondo: string;
  aspekto: string;
  scheme: "light" | "dark";
  merkmaloj: Record<K8Merkmal, number>;
  kvoto: number;
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
  /** K8 per flow × variant × round × combination; absent where no screen has K8 (Spec 038). */
  k8?: K8Vico[];
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

/**
 * One row of „Offene Abweichungen je Regel“ in `raporto.md` (Spec 038 A-2, C-2): the started
 * repetitions of a flow × variant. Only in the Markdown – the report data (`raporto.json`) keep
 * their shape; the rules live in `kuro.json`.
 */
export interface RestantajVico {
  tasko: string;
  varianto: Varianto;
  restantajSupraj: RestantajSupraj | null;
}

// --- Helpers -----------------------------------------------------------------------------------

const round1 = (value: number): number => Math.round(value * 10) / 10;
const round2 = (value: number): number => Math.round(value * 100) / 100;
const round4 = (value: number): number => Math.round(value * 10000) / 10000;
const round6 = (value: number): number => Math.round(value * 1e6) / 1e6;

function ordigi(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(ordigi);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, ordigi((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}

/** JSON with sorted keys and a final newline: the same value gives the same bytes. */
export function stabilaJson(value: unknown): string {
  return `${JSON.stringify(ordigi(value), null, 2)}\n`;
}

const medianoDe = (
  values: readonly (number | null | undefined)[],
  round: (v: number) => number,
) => {
  const numbers = values.filter((value): value is number => typeof value === "number");
  return numbers.length === 0 ? null : round(median(numbers));
};

const delto = (a: number | null, b: number | null, round: (v: number) => number): number | null =>
  a === null || b === null ? null : round(a - b);

/** The 1-minute load before or after a run above the cores (D-09). */
export const lastoSuperKernoj = (sxargo: KuroSxargo): boolean =>
  Math.max(sxargo.antaux.l1, sxargo.post.l1) > sxargo.kernoj;

/**
 * The scorer of the measurement: the nordstelo adapter of ekranoj (C-8, `ekranoTaksilo`) with the
 * K6 criteria of the flow and its slug, so the Tasko of a screen is named `<flow>/<screen>` – the
 * same scorer `fm ekranoj` uses (weights and gate read from the Modelo catalogue, never copied).
 */
export function taksiloPorMezuro(e: {
  modelo: Modelo;
  katalogo: NordsteloFile;
  tasko: AblaufTasko;
}): Taksilo {
  return ekranoTaksilo({
    modelo: e.modelo,
    katalogo: e.katalogo,
    kriterioj: kriteriojDe(e.tasko),
    tasko: e.tasko.slug,
  });
}

export interface RaportoOpcioj {
  /** The Modelo the patterns and the scorer read (default: the repository's). */
  modelo?: Modelo;
  /** The scorer per flow (default: {@link taksiloPorMezuro} with the Modelo catalogue). */
  taksiloPor?: (tasko: AblaufTasko) => Taksilo;
}

function legiJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

function valorojDe(
  poento: FluaPoento,
  stato: Record<string, StatoEkrano> | undefined,
): { fluo: FluaValoro; ekranoj: Record<string, EkranaValoro> } {
  const ekranoj: Record<string, EkranaValoro> = {};
  for (const [slug, ekrano] of Object.entries(poento.ekranoj)) {
    const own = stato?.[slug];
    ekranoj[slug] = {
      total: ekrano.taksado?.total ?? null,
      k: ekrano.taksado === null ? null : { ...ekrano.taksado.k },
      kompleta: ekrano.navigado.kompleta,
      unueca: ekrano.sxablonoj.unueca,
      verda: own?.verda ?? null,
      verdaEkde: own?.verdaEkde ?? null,
      ...(ekrano.taksado?.k8 === undefined ? {} : { k8: ekrano.taksado.k8.kvoto }),
    };
  }
  return {
    fluo: {
      konstruitaj: poento.sumo.konstruitaj,
      planitaj: poento.sumo.planitaj,
      total: poento.sumo.total,
      k: { ...poento.sumo.k },
      navigado: poento.sumo.navigado,
      sxablonoj: poento.sumo.sxablonoj,
      ...(poento.sumo.k8 === undefined ? {} : { k8: poento.sumo.k8 }),
    },
    ekranoj,
  };
}

const kompari = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Collects the K8 combinations of every scored screen per flow × variant × round × combination,
 * over screens and repetitions, for the section „K8 je Merkmal und Kombination“ (Spec 038, C-E).
 */
class K8Kolektilo {
  readonly #grupoj = new Map<
    string,
    {
      vico: Omit<K8Vico, "merkmaloj" | "kvoto">;
      valoroj: { merkmaloj: Record<K8Merkmal, number>; kvoto: number }[];
    }
  >();

  aldoni(tasko: string, varianto: Varianto, rondo: string, poento: FluaPoento): void {
    for (const ekrano of Object.values(poento.ekranoj)) {
      for (const kombinacio of ekrano.taksado?.k8?.kombinacioj ?? []) {
        const { aspekto, scheme } = kombinacio;
        const sxlosilo = JSON.stringify([tasko, varianto, rondo, aspekto, scheme]);
        const grupo = this.#grupoj.get(sxlosilo) ?? {
          vico: { tasko, varianto, rondo, aspekto, scheme },
          valoroj: [],
        };
        grupo.valoroj.push({ merkmaloj: kombinacio.merkmaloj, kvoto: kombinacio.kvoto });
        this.#grupoj.set(sxlosilo, grupo);
      }
    }
  }

  /** The rows, sorted by flow, variant, round (as a number), brand and scheme; none without K8. */
  vicoj(): K8Vico[] {
    const mezo = (values: readonly number[]): number =>
      round4(values.reduce((a, b) => a + b, 0) / values.length);
    return [...this.#grupoj.values()]
      .map(({ vico, valoroj }) => ({
        ...vico,
        merkmaloj: Object.fromEntries(
          K8_MERKMALOJ.map((merkmal) => [merkmal, mezo(valoroj.map((v) => v.merkmaloj[merkmal]))]),
        ) as Record<K8Merkmal, number>,
        kvoto: mezo(valoroj.map((v) => v.kvoto)),
      }))
      .sort(
        (a, b) =>
          kompari(a.tasko, b.tasko) ||
          kompari(a.varianto, b.varianto) ||
          Number(a.rondo) - Number(b.rondo) ||
          kompari(a.rondo, b.rondo) ||
          kompari(a.aspekto, b.aspekto) ||
          kompari(a.scheme, b.scheme),
      );
  }
}

// --- Building the data -------------------------------------------------------------------------

/** The report data of a stored run folder (pure apart from reading it). */
export function raportoDatumoj(dir: string, opcioj: RaportoOpcioj = {}): RaportoDatumoj {
  return kolekti(dir, opcioj).datumoj;
}

/** The report data and the rows of open deviations per rule of a stored run folder. */
function kolekti(
  dir: string,
  opcioj: RaportoOpcioj,
): { datumoj: RaportoDatumoj; restantaj: RestantajVico[] } {
  const lauf = legiJson<LaufRekordo>(join(dir, LAUF_DOSIERO));
  const modelo = opcioj.modelo ?? loadModelo(defaultModeloSource()).modelo;
  if (modelo === undefined) throw new Error("Die Modelo des Repositorys lässt sich nicht laden.");
  let katalogo: NordsteloFile | undefined;
  const taksiloPor =
    opcioj.taksiloPor ??
    ((tasko: AblaufTasko) => {
      katalogo ??= legiKatalogon();
      return taksiloPorMezuro({ modelo, katalogo, tasko });
    });

  const kuroj: KuroEnRaporto[] = [];
  const restantaj: RestantajVico[] = [];
  const k8Kolektilo = new K8Kolektilo();
  for (const slug of lauf.taskoj) {
    const tasko = trovuTaskon(slug);
    if (tasko === undefined) throw new Error(`Die Aufgabe ${slug} steht nicht im Katalog.`);
    const taksilo = taksiloPor(tasko);
    for (const varianto of lauf.varianten) {
      const restantajEnKuroj: RestantajEnKuro[] = [];
      let kunRekordo = false;
      for (let ripeto = 1; ripeto <= lauf.ripetoj; ripeto += 1) {
        const own = kuroDir(dir, slug, varianto, ripeto);
        if (!existsSync(join(own, KURO_DOSIERO))) continue;
        const rekordo = legiJson<KuroRekordo>(join(own, KURO_DOSIERO));
        kunRekordo = true;
        if (rekordo.nekomencita !== true)
          restantajEnKuroj.push({
            restantaj: rekordo.restantaj,
            restantajLauxRegulo: restantajLauxReguloEl(rekordo.restantajLauxRegulo),
          });
        const rondoj: KuroEnRaporto["rondoj"] = {};
        if (existsSync(join(own, "plano.json"))) {
          const poentoj = poentiKuron({ tasko, varianto, kuro: legiKuron(own), taksilo, modelo });
          for (const [n, poento] of Object.entries(poentoj.rondoj)) {
            rondoj[n] = valorojDe(poento, rekordo.stato[n]);
            k8Kolektilo.aldoni(slug, varianto, n, poento);
          }
        }
        const usd = kostoOf(lauf.kiModelo, {
          enigo: rekordo.peno.inputTokens,
          eligo: rekordo.peno.outputTokens,
        });
        kuroj.push({
          tasko: slug,
          varianto,
          ripeto,
          nekomencita: rekordo.nekomencita === true,
          haltigo: rekordo.haltigo ?? null,
          eraro: rekordo.eraro ?? null,
          faritajRondoj: rekordo.faritajRondoj,
          peno: rekordo.peno,
          usd: usd === undefined ? null : round6(usd),
          sxargo: rekordo.sxargo,
          lastoSuperKernoj: lastoSuperKernoj(rekordo.sxargo),
          restantaj: rekordo.restantaj,
          notoj: rekordo.notoj,
          rondoj,
        });
      }
      if (kunRekordo)
        restantaj.push({
          tasko: slug,
          varianto,
          restantajSupraj: restantajSuprajDe(restantajEnKuroj),
        });
    }
  }

  const de = (tasko: string, varianto: Varianto) =>
    kuroj.filter((kuro) => kuro.tasko === tasko && kuro.varianto === varianto);
  const fluo = (tasko: string, varianto: Varianto, rondo: string) =>
    de(tasko, varianto).flatMap((kuro) => {
      const own = kuro.rondoj[rondo];
      return own === undefined ? [] : [own.fluo];
    });
  const ekranoDe = (tasko: string, varianto: Varianto, rondo: string, slug: string) =>
    medianoDe(
      de(tasko, varianto).map((kuro) => kuro.rondoj[rondo]?.ekranoj[slug]?.total ?? null),
      round1,
    );
  const enStreuung = (value: number | null) =>
    value === null ? null : Math.abs(value) <= STREUUNG_REIHE_K;

  const f0: RaportoDatumoj["komparoj"]["f0"] = [];
  const r1r3: RaportoDatumoj["komparoj"]["r1r3"] = [];
  const ekranoj: RaportoDatumoj["komparoj"]["ekranoj"] = [];
  const kunF0 = lauf.varianten.includes("F") && lauf.varianten.includes("0");
  for (const slug of lauf.taskoj) {
    const komparoF0 = (
      rondo: string,
      kampo: "total" | "navigado" | "sxablonoj",
      round: (v: number) => number,
    ): KomparoF0 => {
      const F = medianoDe(
        fluo(slug, "F", rondo).map((v) => v[kampo]),
        round,
      );
      const nul = medianoDe(
        fluo(slug, "0", rondo).map((v) => v[kampo]),
        round,
      );
      return { F, "0": nul, delto: delto(F, nul, round) };
    };
    if (kunF0) {
      for (const rondo of KOMPARATAJ_RONDOJ) {
        const total = komparoF0(rondo, "total", round1);
        f0.push({
          tasko: slug,
          rondo,
          total,
          navigado: komparoF0(rondo, "navigado", round4),
          sxablonoj: komparoF0(rondo, "sxablonoj", round4),
          enStreuung: enStreuung(total.delto),
        });
      }
    }
    for (const varianto of lauf.varianten) {
      const komparoR = (
        kampo: "total" | "navigado" | "sxablonoj",
        round: (v: number) => number,
      ): KomparoR => {
        const R1 = medianoDe(
          fluo(slug, varianto, "1").map((v) => v[kampo]),
          round,
        );
        const R3 = medianoDe(
          fluo(slug, varianto, "3").map((v) => v[kampo]),
          round,
        );
        return { R1, R3, delto: delto(R3, R1, round) };
      };
      const total = komparoR("total", round1);
      r1r3.push({
        tasko: slug,
        varianto,
        total,
        navigado: komparoR("navigado", round4),
        sxablonoj: komparoR("sxablonoj", round4),
        enStreuung: enStreuung(total.delto),
      });
    }
    const tasko = trovuTaskon(slug);
    for (const ekrano of tasko?.ekranoj ?? []) {
      const r = (varianto: Varianto): KomparoR => {
        const R1 = ekranoDe(slug, varianto, "1", ekrano.slug);
        const R3 = ekranoDe(slug, varianto, "3", ekrano.slug);
        return { R1, R3, delto: delto(R3, R1, round1) };
      };
      const F = r("F");
      const nul = r("0");
      ekranoj.push({
        tasko: slug,
        ekrano: ekrano.slug,
        F,
        "0": nul,
        f0R3: { F: F.R3, "0": nul.R3, delto: delto(F.R3, nul.R3, round1) },
      });
    }
  }

  const usdoj = kuroj.filter((kuro) => !kuro.nekomencita).map((kuro) => kuro.usd);
  const k8Vicoj = k8Kolektilo.vicoj();
  const datumoj: RaportoDatumoj = {
    id: basename(dir),
    lauf,
    streuung: { reiheK: STREUUNG_REIHE_K, fonto: STREUUNG_FONTO },
    kuroj,
    komparoj: { f0, r1r3, ekranoj },
    ...(k8Vicoj.length === 0 ? {} : { k8: k8Vicoj }),
    sumo: {
      tokenoj: {
        enigo: kuroj.reduce((sumo, kuro) => sumo + kuro.peno.inputTokens, 0),
        eligo: kuroj.reduce((sumo, kuro) => sumo + kuro.peno.outputTokens, 0),
      },
      anfragoj: kuroj.reduce((sumo, kuro) => sumo + kuro.peno.requests, 0),
      usd: usdoj.some((usd) => usd === null)
        ? null
        : round6(usdoj.reduce<number>((sumo, usd) => sumo + (usd ?? 0), 0)),
      kuroj: kuroj.length,
      nekomencitaj: kuroj.filter((kuro) => kuro.nekomencita).length,
      haltigoj: kuroj.flatMap((kuro) =>
        kuro.haltigo === null
          ? []
          : [
              {
                tasko: kuro.tasko,
                varianto: kuro.varianto,
                ripeto: kuro.ripeto,
                haltigo: kuro.haltigo,
              },
            ],
      ),
    },
  };
  return { datumoj, restantaj };
}

// --- Markdown ----------------------------------------------------------------------------------

const n = (value: number | null | undefined, digits = 2): string =>
  value === null || value === undefined || Number.isNaN(value)
    ? "–"
    : value.toLocaleString("de-DE", { maximumFractionDigits: digits });

const d = (value: number | null, digits = 2): string =>
  value === null ? "–" : `${value > 0 ? "+" : ""}${n(value, digits)}`;

const dTotal = (value: number | null): string =>
  value === null ? "–" : `${d(value, 1)}${Math.abs(value) <= STREUUNG_REIHE_K ? " ≈" : ""}`;

const usdTeksto = (usd: number | null): string =>
  usd === null ? "Kosten unbekannt" : `${n(usd, 4)} $`;

const sxargoTeksto = (sxargo: Sxargo): string =>
  `${n(sxargo.l1)} / ${n(sxargo.l5)} / ${n(sxargo.l15)}`;

const HALTIGO_TEKSTO: Record<Haltigo, string> = {
  "max-tokens": "Tokengrenze",
  tagolimo: "Tageslimit",
  eraro: "Fehler",
};

const jesNe = (value: boolean | null): string => (value === null ? "–" : value ? "ja" : "nein");

/** K8 in a table cell: the value, or „nicht geprüft“ where no render carries K8 facts (D-98). */
const k8Teksto = (value: number | undefined): string =>
  value === undefined ? "nicht geprüft" : n(value);

/**
 * The Markdown report of the data: German, tables, no timestamp. With `restantaj` (Spec 038 A-2)
 * the section „Offene Abweichungen je Regel“ follows the effort table.
 */
export function raportoMd(
  datumoj: RaportoDatumoj,
  restantaj: readonly RestantajVico[] = [],
): string {
  const { lauf, komparoj, sumo } = datumoj;
  const lines = [
    `# Nordstern-Kennzahl „ganzer Ablauf“ – Lauf ${datumoj.id}`,
    "",
    `Commit \`${lauf.commit}\` · Modell ${lauf.kiModelo} · Kostengrenze ${n(lauf.maksTokenoj)} Tokens (eine für den ganzen Lauf) · Aufgaben ${lauf.taskoj.join(", ")} · Varianten ${lauf.varianten.join(", ")} · Wiederholungen ${lauf.ripetoj}`,
    "",
    `Schätzung vor dem Start: ${n(lauf.takso.tokenoj)} Tokens, ${usdTeksto(lauf.takso.usd ?? null)}.`,
    "",
    `Marken: ${lauf.markoj.join(", ")} × hell/dunkel, Kontrast Standard (D-39). Die Werte sind nicht 1:1 mit den Seitenwerten der Reihe K vergleichbar: dort wird eine Seite bewertet, hier jeder Screen eines Ablaufs nach dem Plan des Katalogs.`,
    "",
    `Streuung Reihe K: ${n(datumoj.streuung.reiheK, 1)} Punkte (Quelle: ${datumoj.streuung.fonto}). Ein Unterschied im Total bis zu dieser Größe ist mit „≈“ markiert: innerhalb der Streuung, kein Befund.`,
    "",
    "Navigation (D-05) und Muster (D-06) sind Anteile 0–1 in eigenen Spalten; sie gehen nicht ins Total ein. Bei mehreren Wiederholungen steht der Median.",
    "",
    "## F gegen 0 je Aufgabe",
    "",
    "| Aufgabe | Runde | Total F | Total 0 | Δ F−0 | Navigation F | Navigation 0 | Δ | Muster F | Muster 0 | Δ |",
    "|---|---|---|---|---|---|---|---|---|---|---|",
    ...komparoj.f0.map(
      (row) =>
        `| ${row.tasko} | ${row.rondo} | ${n(row.total.F, 1)} | ${n(row.total["0"], 1)} | ${dTotal(row.total.delto)} | ${n(row.navigado.F)} | ${n(row.navigado["0"])} | ${d(row.navigado.delto)} | ${n(row.sxablonoj.F)} | ${n(row.sxablonoj["0"])} | ${d(row.sxablonoj.delto)} |`,
    ),
    "",
    "## Runde 1 gegen Runde 3 je Aufgabe",
    "",
    "| Aufgabe | Variante | Total R1 | Total R3 | Δ R3−R1 | Navigation R1 | Navigation R3 | Δ | Muster R1 | Muster R3 | Δ |",
    "|---|---|---|---|---|---|---|---|---|---|---|",
    ...komparoj.r1r3.map(
      (row) =>
        `| ${row.tasko} | ${row.varianto} | ${n(row.total.R1, 1)} | ${n(row.total.R3, 1)} | ${dTotal(row.total.delto)} | ${n(row.navigado.R1)} | ${n(row.navigado.R3)} | ${d(row.navigado.delto)} | ${n(row.sxablonoj.R1)} | ${n(row.sxablonoj.R3)} | ${d(row.sxablonoj.delto)} |`,
    ),
    "",
    "## Anteile je Aufgabe, Variante und Runde (K1–K6; in Variante 0 gelten K2 und K3 nicht)",
    "",
    `| Aufgabe | Variante | Wdh. | Runde | gebaut | ${KRITERIOJ.join(" | ")} | Total | Navigation | Muster | K8 |`,
    `|---|---|---|---|---|${KRITERIOJ.map(() => "---|").join("")}---|---|---|---|`,
  ];
  for (const kuro of datumoj.kuroj) {
    for (const [rondo, own] of Object.entries(kuro.rondoj)) {
      lines.push(
        `| ${kuro.tasko} | ${kuro.varianto} | ${kuro.ripeto} | ${rondo} | ${own.fluo.konstruitaj}/${own.fluo.planitaj} | ${KRITERIOJ.map((k) => n(own.fluo.k[k])).join(" | ")} | ${n(own.fluo.total, 1)} | ${n(own.fluo.navigado)} | ${n(own.fluo.sxablonoj)} | ${k8Teksto(own.fluo.k8)} |`,
      );
    }
  }
  lines.push(
    "",
    "## Je Screen: F gegen 0, Runde 1 gegen Runde 3 (Total)",
    "",
    "| Aufgabe | Screen | F R1 | F R3 | Δ F | 0 R1 | 0 R3 | Δ 0 | Δ F−0 (R3) |",
    "|---|---|---|---|---|---|---|---|---|",
    ...komparoj.ekranoj.map(
      (row) =>
        `| ${row.tasko} | ${row.ekrano} | ${n(row.F.R1, 1)} | ${n(row.F.R3, 1)} | ${dTotal(row.F.delto)} | ${n(row["0"].R1, 1)} | ${n(row["0"].R3, 1)} | ${dTotal(row["0"].delto)} | ${dTotal(row.f0R3.delto)} |`,
    ),
    "",
    "## Je Screen und Runde (K1–K6, Navigation vollständig, Muster einheitlich, grün)",
    "",
    `| Aufgabe | Screen | Variante | Wdh. | Runde | ${KRITERIOJ.join(" | ")} | Total | Navigation | Muster | K8 | grün |`,
    `|---|---|---|---|---|${KRITERIOJ.map(() => "---|").join("")}---|---|---|---|---|`,
  );
  for (const kuro of datumoj.kuroj) {
    for (const [rondo, own] of Object.entries(kuro.rondoj)) {
      for (const [slug, ekrano] of Object.entries(own.ekranoj)) {
        const verda =
          ekrano.verdaEkde !== null && ekrano.verdaEkde < Number(rondo)
            ? `ja, seit Runde ${ekrano.verdaEkde}`
            : jesNe(ekrano.verda);
        lines.push(
          `| ${kuro.tasko} | ${slug} | ${kuro.varianto} | ${kuro.ripeto} | ${rondo} | ${KRITERIOJ.map((k) => n(ekrano.k?.[k])).join(" | ")} | ${n(ekrano.total, 1)} | ${jesNe(ekrano.kompleta)} | ${jesNe(ekrano.unueca)} | ${k8Teksto(ekrano.k8)} | ${verda} |`,
        );
      }
    }
  }
  if (datumoj.k8 !== undefined) {
    lines.push(
      "",
      "## K8 je Merkmal und Kombination (Kontrast Standard; Mittel über Screens und Wiederholungen; neben dem Total, nicht darin)",
      "",
      `| Aufgabe | Variante | Runde | Marke | Schema | ${K8_MERKMALOJ.join(" | ")} | K8 |`,
      `|---|---|---|---|---|${K8_MERKMALOJ.map(() => "---|").join("")}---|`,
      ...datumoj.k8.map(
        (vico) =>
          `| ${vico.tasko} | ${vico.varianto} | ${vico.rondo} | ${vico.aspekto} | ${vico.scheme} | ${K8_MERKMALOJ.map((merkmal) => n(vico.merkmaloj[merkmal])).join(" | ")} | ${n(vico.kvoto)} |`,
      ),
    );
  }
  lines.push(
    "",
    "## Aufwand (K7), Last und Halt",
    "",
    "Last = Mittel der Prozesse über 1 / 5 / 15 Minuten vor und nach dem Lauf. „Last > Kerne“: die Last einer Minute lag über der Zahl der Kerne – die Zeitwerte dieses Laufs werden nicht verglichen.",
    "",
    "| Aufgabe | Variante | Wdh. | Runden gebaut | Halt | Tokens ein | Tokens aus | Anfragen | Werkzeugaufrufe | Markup | Dauer | Kosten | Last vor | Last nach | Kerne | offen |",
    "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|",
  );
  for (const kuro of datumoj.kuroj) {
    const halt = kuro.nekomencita
      ? "nicht gestartet (Tokengrenze)"
      : kuro.haltigo === null
        ? "–"
        : HALTIGO_TEKSTO[kuro.haltigo];
    const dauer = `${n(kuro.peno.ms / 1000, 1)} s${kuro.lastoSuperKernoj ? " (Last > Kerne)" : ""}`;
    lines.push(
      `| ${kuro.tasko} | ${kuro.varianto} | ${kuro.ripeto} | ${kuro.faritajRondoj} | ${halt} | ${n(kuro.peno.inputTokens)} | ${n(kuro.peno.outputTokens)} | ${n(kuro.peno.requests)} | ${n(kuro.peno.toolCalls)} | ${n(kuro.peno.bytes)} B | ${dauer} | ${usdTeksto(kuro.usd)} | ${sxargoTeksto(kuro.sxargo.antaux)} | ${sxargoTeksto(kuro.sxargo.post)} | ${kuro.sxargo.kernoj} | ${kuro.restantaj} |`,
    );
  }
  if (restantaj.length > 0) {
    lines.push(
      "",
      "## Offene Abweichungen je Regel (nach der letzten Runde, häufigste drei)",
      "",
      "Summe über die gestarteten Wiederholungen; nicht gebaute Screens als „nicht-gebaut“. „nicht vorhanden“: die Aufzeichnung hat keine Regeln (älterer Stand) oder der Lauf endete mit einem Fehler.",
      "",
      "| Aufgabe | Variante | offen | häufigste Regeln |",
      "|---|---|---|---|",
      ...restantaj.map(
        (vico) =>
          `| ${vico.tasko} | ${vico.varianto} | ${restantajSumoTeksto(vico.restantajSupraj)} | ${restantajTeksto(vico.restantajSupraj)} |`,
      ),
    );
  }
  lines.push(
    "",
    "## Summe",
    "",
    `Tokens gesamt: ${n(sumo.tokenoj.enigo)} ein, ${n(sumo.tokenoj.eligo)} aus · Anfragen ${n(sumo.anfragoj)} · ${sumo.usd === null ? "Kosten unbekannt" : `Kosten ${usdTeksto(sumo.usd)}`} (metiejo \`kostoOf\`, ${lauf.kiModelo}).`,
    "",
    `Läufe: ${sumo.kuroj}, davon nicht gestartet: ${sumo.nekomencitaj}.`,
  );
  const haltoj = datumoj.kuroj.filter((kuro) => kuro.haltigo !== null || kuro.notoj.length > 0);
  if (haltoj.length > 0) {
    lines.push("", "## Halt und Notizen", "");
    for (const kuro of haltoj) {
      const kapo = `${kuro.tasko} ${kuro.varianto}-${kuro.ripeto}`;
      if (kuro.haltigo !== null)
        lines.push(
          `- ${kapo}: Halt ${HALTIGO_TEKSTO[kuro.haltigo]}${kuro.eraro === null ? "" : ` – ${kuro.eraro}`}`,
        );
      for (const noto of kuro.notoj) lines.push(`- ${kapo}: ${noto}`);
    }
  }
  return `${lines.join("\n")}\n`;
}

/** The report of a stored run folder (D-33): the same folder gives the same bytes. */
export function raporto(dir: string, opcioj: RaportoOpcioj = {}): AblaufRaporto {
  const { datumoj, restantaj } = kolekti(dir, opcioj);
  return { md: raportoMd(datumoj, restantaj), datumoj };
}

/** Writes `raporto.md` and `raporto.json` into the run folder. */
export function skribiRaporton(dir: string, opcioj: RaportoOpcioj = {}): AblaufRaporto {
  const rezulto = raporto(dir, opcioj);
  writeFileSync(join(dir, "raporto.md"), rezulto.md);
  writeFileSync(join(dir, "raporto.json"), stabilaJson(rezulto.datumoj));
  return rezulto;
}

/** Rounds a load average for the records. */
export const sxargoDe = ([l1, l5, l15]: readonly number[]): Sxargo => ({
  l1: round2(l1 ?? 0),
  l5: round2(l5 ?? 0),
  l15: round2(l15 ?? 0),
});
