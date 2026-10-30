// Time and cost of the language model (Spec 033 S6): estimated before the start per path and model,
// counted during the work. The estimate stands on measured averages, in this order:
//   1. the Kroniko of the brands: the median of the turns of this kind with this model (Protokoll);
//   2. the runs of the Nordstern-Kennzahl: the time per request of a model against the model of the
//      start values scales their duration (the tokens follow the prompts of the Asistanto, not the
//      model);
//   3. the start values of the trial runs of S1–S5 (data/takso.json).
// A path is the sum of its turns and its local steps (Kreilo with the releases, export,
// projections). The export and the projections write their duration into the Kroniko (O-10); the
// estimate takes their median like the time of the model, the start value only as the fallback.
// The counter sums the Kroniko of one brand.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { appendKroniko, KRONIKO_FILE, type KronikoEro, readKroniko } from "../asistanto/kroniko.js";
import { kostoOf, PREZOJ, type PrezojDatoj } from "./prezoj.js";

export type Zugo = "kreilo" | "babilo" | "parolo" | "esploro" | "materialo";
export type Vojo = "A" | "B" | "C";
export type Bazo = "protokoll" | "nordstern" | "start";
/** The local steps of a path: the Kreilo with the releases, the export, the projections. */
export type Pasxo = "kreilo" | "eksporto" | "projekcioj";

/** A local step measured in the Kroniko (O-10). */
export interface LokaMezuro {
  pasxo: Pasxo;
  ms: number;
}

export interface ZugoMezuro {
  requests: number;
  enigo: number;
  eligo: number;
  ms: number;
  /** Seconds of audio of a spoken turn. */
  sekundoj?: number;
}

export interface Mezuro extends ZugoMezuro {
  zugo: Zugo;
  modelo: string;
}

export interface Starto {
  kialo: string;
  modelo: string;
  dato: string;
  zugoj: Record<Zugo, ZugoMezuro & { fonto: string }>;
  vojoj: Record<
    Vojo,
    { zugoj: Partial<Record<Zugo, number>>; loka: Partial<Record<Pasxo, number>>; fonto: string }
  >;
}

export interface Takso extends ZugoMezuro {
  /** Dollars; undefined without a price for the model. */
  usd: number | undefined;
  bazo: Bazo;
  /** Turns of the Kroniko behind a Protokoll estimate. */
  n: number;
  modelo: string;
  /**
   * The local time of a path (in `ms` already): `n` measurements of the Kroniko behind it, per
   * step how many; a step without one stands at its start value.
   */
  loka?: { ms: number; n: number; mezuritaj: Partial<Record<Pasxo, number>> };
}

export const TAKSO_URL = new URL("../../data/takso.json", import.meta.url);
export const STARTO: Starto = JSON.parse(readFileSync(TAKSO_URL, "utf8")) as Starto;

/** The transcription of a spoken turn. */
export const TRANSKRIBO_MODELO = "mistral/voxtral-mini-transcribe-3-0";

export const ZUGOJ: readonly Zugo[] = ["kreilo", "babilo", "parolo", "esploro", "materialo"];

const record = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
const number = (value: unknown) => (typeof value === "number" ? value : 0);

/** The kind of a turn of the Kroniko: Kreilo (Weg A), research (Weg C), speech or chat. */
function zugoOf(entry: KronikoEro): Zugo {
  const detaloj = record(entry.detaloj);
  if (detaloj.vojo === "A") return "kreilo";
  if (detaloj.vojo === "C" || entry.fonto === "agento") return "esploro";
  if (entry.fonto === "parolo") return "parolo";
  return "babilo";
}

/** The turns of the language model in Kroniko entries, the transcription in the time of its turn. */
export function mezurojOf(entries: readonly KronikoEro[]): Mezuro[] {
  const mezuroj: Mezuro[] = [];
  for (const entry of entries) {
    if (entry.ago !== "babilo" || entry.kosto === undefined || entry.modelo === undefined) continue;
    const kosto = record(entry.kosto);
    const transkribo = record(record(entry.detaloj).transkribo);
    const sekundoj = number(transkribo.sekundoj);
    mezuroj.push({
      zugo: zugoOf(entry),
      modelo: entry.modelo,
      requests: number(kosto.requests),
      enigo: number(kosto.enigo),
      eligo: number(kosto.eligo),
      ms: number(kosto.ms) + number(transkribo.ms),
      ...(sekundoj > 0 ? { sekundoj } : {}),
    });
  }
  return mezuroj;
}

/** The Kroniko of every brand in the working directory. */
export function readKronikoj(workdir: string): KronikoEro[] {
  if (!existsSync(workdir)) return [];
  return readdirSync(workdir)
    .filter((name) => existsSync(join(workdir, name, KRONIKO_FILE)))
    .flatMap((name) => readKroniko(workdir, name));
}

/**
 * Milliseconds per request per model (provider/model) in the runs of the Nordstern-Kennzahl:
 * `<dir>/<run>/stato.json` names the model, `<dir>/<run>/<task>/<variant>/rezulto.json` the effort.
 */
export function nordsteloRapidoj(dir: string): Map<string, number> {
  const sums = new Map<string, { ms: number; requests: number }>();
  if (!existsSync(dir)) return new Map();
  for (const run of readdirSync(dir)) {
    const stato = join(dir, run, "stato.json");
    if (!existsSync(stato)) continue;
    const meta = record(JSON.parse(readFileSync(stato, "utf8")));
    if (typeof meta.anbieter !== "string" || typeof meta.modell !== "string") continue;
    const modelo = `${meta.anbieter}/${meta.modell}`;
    const sum = sums.get(modelo) ?? { ms: 0, requests: 0 };
    for (const task of readdirSync(join(dir, run))) {
      const taskDir = join(dir, run, task);
      if (!statSync(taskDir).isDirectory()) continue;
      for (const variant of readdirSync(taskDir)) {
        const file = join(taskDir, variant, "rezulto.json");
        if (!existsSync(file)) continue;
        const effort = record(record(JSON.parse(readFileSync(file, "utf8"))).effort);
        sum.ms += number(effort.ms);
        sum.requests += number(effort.requests);
      }
    }
    sums.set(modelo, sum);
  }
  return new Map(
    [...sums]
      .filter(([, sum]) => sum.requests > 0)
      .map(([modelo, sum]) => [modelo, Math.round(sum.ms / sum.requests)]),
  );
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? (sorted[middle] ?? 0)
    : Math.round(((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2);
}

interface TaksoInput {
  modelo: string;
  mezuroj?: readonly Mezuro[];
  /** The local steps measured in the Kroniko of the brands (O-10). */
  lokaj?: readonly LokaMezuro[];
  rapidoj?: ReadonlyMap<string, number>;
  starto?: Starto;
  prezoj?: PrezojDatoj;
}

function zugoTakso(zugo: Zugo, input: TaksoInput): Omit<Takso, "usd" | "modelo"> {
  const starto = input.starto ?? STARTO;
  const own = (input.mezuroj ?? []).filter(
    (mezuro) => mezuro.zugo === zugo && mezuro.modelo === input.modelo,
  );
  if (own.length > 0) {
    const sekundoj = own.flatMap((mezuro) =>
      mezuro.sekundoj === undefined ? [] : [mezuro.sekundoj],
    );
    return {
      requests: median(own.map((mezuro) => mezuro.requests)),
      enigo: median(own.map((mezuro) => mezuro.enigo)),
      eligo: median(own.map((mezuro) => mezuro.eligo)),
      ms: median(own.map((mezuro) => mezuro.ms)),
      ...(sekundoj.length > 0 ? { sekundoj: median(sekundoj) } : {}),
      bazo: "protokoll",
      n: own.length,
    };
  }
  const { fonto: _fonto, ...start } = starto.zugoj[zugo];
  const speed = input.rapidoj?.get(input.modelo);
  const baseSpeed = input.rapidoj?.get(starto.modelo);
  if (
    input.modelo !== starto.modelo &&
    start.requests > 0 &&
    speed !== undefined &&
    baseSpeed !== undefined &&
    baseSpeed > 0
  ) {
    return { ...start, ms: Math.round((start.ms * speed) / baseSpeed), bazo: "nordstern", n: 0 };
  }
  return { ...start, bazo: "start", n: 0 };
}

const BAZO_ORDER: readonly Bazo[] = ["start", "nordstern", "protokoll"];

/** The estimate of a path (the sum of its turns and its local time) or of one turn. */
export function taksi(input: TaksoInput & ({ vojo: Vojo } | { zugo: Zugo })): Takso {
  const starto = input.starto ?? STARTO;
  const prezoj = input.prezoj ?? PREZOJ;
  const parts: [Zugo, number][] =
    "vojo" in input
      ? (Object.entries(starto.vojoj[input.vojo].zugoj) as [Zugo, number][])
      : [[input.zugo, 1]];
  const sum = { requests: 0, enigo: 0, eligo: 0, ms: 0, sekundoj: 0 };
  let bazo: Bazo = "protokoll";
  let n = 0;
  let model = false;
  for (const [zugo, count] of parts) {
    const part = zugoTakso(zugo, input);
    sum.requests += count * part.requests;
    sum.enigo += count * part.enigo;
    sum.eligo += count * part.eligo;
    sum.ms += count * part.ms;
    sum.sekundoj += count * (part.sekundoj ?? 0);
    if (part.requests > 0) {
      model = true;
      n += part.n;
      if (BAZO_ORDER.indexOf(part.bazo) < BAZO_ORDER.indexOf(bazo)) bazo = part.bazo;
    }
  }
  if (!model) bazo = "start";
  const loka =
    "vojo" in input ? lokaTakso(starto.vojoj[input.vojo].loka, input.lokaj ?? []) : undefined;
  if (loka !== undefined) sum.ms += loka.ms;
  const chat = model ? kostoOf(input.modelo, sum, prezoj) : 0;
  const speech =
    sum.sekundoj > 0
      ? kostoOf(TRANSKRIBO_MODELO, { enigo: 0, eligo: 0, sekundoj: sum.sekundoj }, prezoj)
      : 0;
  const { sekundoj, ...rest } = sum;
  return {
    ...rest,
    ...(sekundoj > 0 ? { sekundoj } : {}),
    usd: chat === undefined || speech === undefined ? undefined : chat + speech,
    bazo,
    n,
    modelo: input.modelo,
    ...(loka === undefined ? {} : { loka }),
  };
}

/** The local time of a path: per step the median of the Kroniko, else its start value. */
function lokaTakso(
  start: Partial<Record<Pasxo, number>>,
  lokaj: readonly LokaMezuro[],
): NonNullable<Takso["loka"]> {
  let ms = 0;
  let n = 0;
  const mezuritaj: Partial<Record<Pasxo, number>> = {};
  for (const [pasxo, fallback] of Object.entries(start) as [Pasxo, number][]) {
    const measured = lokaj.filter((entry) => entry.pasxo === pasxo).map((entry) => entry.ms);
    if (measured.length === 0) {
      ms += fallback;
      continue;
    }
    ms += median(measured);
    n += measured.length;
    mezuritaj[pasxo] = measured.length;
  }
  return { ms, n, mezuritaj };
}

const PASXO_NOMO: Record<Pasxo, string> = {
  kreilo: "Kreilo",
  eksporto: "Export",
  projekcioj: "Projektionen",
};

/** The export and the projections in the Kroniko (O-10): `ago` eksporto with step and duration. */
export function lokaMezurojOf(entries: readonly KronikoEro[]): LokaMezuro[] {
  const lokaj: LokaMezuro[] = [];
  for (const entry of entries) {
    if (entry.ago !== "eksporto") continue;
    const detaloj = record(entry.detaloj);
    if (
      typeof detaloj.ms !== "number" ||
      !(detaloj.pasxo === "eksporto" || detaloj.pasxo === "projekcioj")
    )
      continue;
    lokaj.push({ pasxo: detaloj.pasxo, ms: detaloj.ms });
  }
  return lokaj;
}

/** Writes a local step with its duration into the Kroniko of a brand (O-10). */
export function notiLokan(
  workdir: string,
  name: string,
  step: {
    pasxo: Exclude<Pasxo, "kreilo">;
    ms: number;
    partoj?: Record<string, number>;
    celoj?: readonly string[];
  },
): KronikoEro {
  return appendKroniko(workdir, name, {
    ago: "eksporto",
    fonto: "sistemo",
    detaloj: {
      pasxo: step.pasxo,
      ms: Math.round(step.ms),
      ...(step.partoj === undefined ? {} : { partoj: step.partoj }),
      ...(step.celoj === undefined ? {} : { celoj: [...step.celoj] }),
    },
  });
}

/**
 * The brand of a config in its export folder, `<workdir>/<name>/eksporto/fundamento.config.json`,
 * when the brand has a Kroniko; undefined for any other config.
 */
export function markoOfEksporto(config: string): { workdir: string; name: string } | undefined {
  const eksporto = dirname(config);
  if (basename(eksporto) !== "eksporto") return undefined;
  const marko = dirname(eksporto);
  if (!existsSync(join(marko, KRONIKO_FILE))) return undefined;
  return { workdir: dirname(marko), name: basename(marko) };
}

const grouped = (value: number) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

/** Dollars as the screen says them: four places, a comma, „unbekannt“ without a price. */
export function dollarsOf(usd: number | undefined, modelo: string): string {
  if (usd === undefined) return `Kosten unbekannt (kein Preis für ${modelo})`;
  if (usd === 0) return "0 $";
  if (usd < 0.00005) return "< 0,0001 $";
  return `${usd.toFixed(4).replace(".", ",")} $`;
}

const secondsOf = (ms: number) =>
  ms < 1000
    ? "< 1 s"
    : ms >= 90_000
      ? `${Math.round(ms / 60_000)} min`
      : `${Math.round(ms / 1000)} s`;

/** The estimate in one line: time, tokens, dollars and the basis. */
export function taksoSatz(takso: Takso, starto: Starto = STARTO): string {
  const tokens = takso.enigo + takso.eligo;
  const rounded = tokens >= 1000 ? Math.round(tokens / 50) * 50 : Math.round(tokens / 10) * 10;
  const bazo =
    takso.bazo === "protokoll"
      ? `Protokoll (${takso.n} ${takso.n === 1 ? "Zug" : "Züge"})`
      : takso.bazo === "nordstern"
        ? `Startwerte, Tempo des Modells aus den Nordstern-Läufen`
        : takso.modelo === starto.modelo || takso.requests === 0
          ? `Probeläufe vom ${starto.dato.split("-").reverse().join(".")}`
          : `Startwerte, gemessen mit ${starto.modelo}`;
  const usd = dollarsOf(takso.usd, takso.modelo);
  const measured = Object.entries(takso.loka?.mezuritaj ?? {}) as [Pasxo, number][];
  const loka =
    measured.length === 0
      ? ""
      : `; lokal aus dem Protokoll: ${measured.map(([pasxo, count]) => `${PASXO_NOMO[pasxo]} (${count})`).join(", ")}`;
  return `≈ ${secondsOf(takso.ms)} · ≈ ${grouped(rounded)} Tokens · ${takso.usd === undefined ? usd : `≈ ${usd}`} · Grundlage: ${bazo}${loka}`;
}

export interface Zaehlilo {
  enigo: number;
  eligo: number;
  requests: number;
  ms: number;
  /** Waits after a 429. */
  atendoj: number;
  /** Dollars; undefined when a model of the Kroniko has no price (named in senPrezo). */
  usd: number | undefined;
  senPrezo: string[];
}

/** The counter of a brand: the sum of its Kroniko. */
export function zaehlilo(entries: readonly KronikoEro[], prezoj: PrezojDatoj = PREZOJ): Zaehlilo {
  const sum: Zaehlilo = {
    enigo: 0,
    eligo: 0,
    requests: 0,
    ms: 0,
    atendoj: 0,
    usd: 0,
    senPrezo: [],
  };
  let usd = 0;
  for (const entry of entries) {
    if (entry.kosto === undefined) continue;
    const kosto = record(entry.kosto);
    const detaloj = record(entry.detaloj);
    const transkribo = record(detaloj.transkribo);
    const enigo = number(kosto.enigo);
    const eligo = number(kosto.eligo);
    sum.enigo += enigo;
    sum.eligo += eligo;
    sum.requests += number(kosto.requests);
    sum.ms += number(kosto.ms) + number(transkribo.ms);
    sum.atendoj += number(detaloj.atendoj);
    const charges: [string | undefined, Parameters<typeof kostoOf>[1]][] = [
      [entry.modelo, { enigo, eligo }],
    ];
    if (typeof transkribo.modelo === "string")
      charges.push([
        transkribo.modelo,
        { enigo: 0, eligo: 0, sekundoj: number(transkribo.sekundoj) },
      ]);
    for (const [modelo, uzo] of charges) {
      if (modelo === undefined) continue;
      const cost = kostoOf(modelo, uzo, prezoj);
      if (cost === undefined) {
        if (!sum.senPrezo.includes(modelo)) sum.senPrezo.push(modelo);
      } else usd += cost;
    }
  }
  sum.usd = sum.senPrezo.length > 0 ? undefined : usd;
  return sum;
}

/** The counter in one line, for the screen. */
export function zaehliloSatz(sum: Zaehlilo): string {
  const usd =
    sum.usd === undefined
      ? `Kosten unbekannt (kein Preis für ${sum.senPrezo.join(", ")})`
      : dollarsOf(sum.usd, "");
  const waits = sum.atendoj > 0 ? ` · ${sum.atendoj}× nach 429 gewartet` : "";
  return `bisher ${grouped(sum.enigo + sum.eligo)} Tokens · ${usd} · ${secondsOf(sum.ms).replace("< 1 s", "0 s")} · ${sum.requests} ${sum.requests === 1 ? "Anfrage" : "Anfragen"}${waits}`;
}
