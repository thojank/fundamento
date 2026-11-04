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

/** The variants in the order the measurement runs them: F before 0 (D-25). */
export const ABLAUF_VARIANTOJ: readonly Varianto[] = ["F", "0"];

/**
 * The brand ekranoj is told (`EkranojEnigo.marko`). The measurement renders every screen in all
 * brands of the cxiuj config × light/dark (D-39); the renderer the caller injects does that.
 */
export const ABLAUF_MARKO = "komuna";

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

/** The settings cannot run: refused before anything is asked. */
export class NevalidaAblauf extends Error {
  readonly problemoj: Problemo[];

  constructor(problemoj: Problemo[]) {
    super(problemoj.map((problemo) => problemo.message).join(" "));
    this.name = "NevalidaAblauf";
    this.problemoj = problemoj;
  }
}

/** Every problem of the settings at once: [] = the measurement may start. */
export function validiAblaufon(opcioj: AblaufOpcioj): Problemo[] {
  const problemoj: Problemo[] = [];
  const taskoj = opcioj.taskoj ?? ABLAUF_TASKOJ.map((tasko) => tasko.slug);
  if (taskoj.length === 0) {
    problemoj.push({
      path: "/taskoj",
      rule: "ablauf-tasks-empty",
      message: "Keine Aufgabe gewählt.",
      suggestion: `--taskoj mit Namen aus dem Katalog: ${ABLAUF_TASKOJ.map((t) => t.slug).join(", ")}.`,
    });
  }
  for (const [index, slug] of taskoj.entries()) {
    if (trovuTaskon(slug) === undefined) {
      problemoj.push({
        path: `/taskoj/${index}`,
        rule: "ablauf-task-unknown",
        message: `Die Aufgabe „${slug}“ steht nicht im Katalog „ganzer Ablauf“.`,
        suggestion: `Eine von: ${ABLAUF_TASKOJ.map((t) => t.slug).join(", ")}.`,
      });
    }
  }
  const varianten = opcioj.varianten ?? ABLAUF_VARIANTOJ;
  if (varianten.length === 0) {
    problemoj.push({
      path: "/varianten",
      rule: "ablauf-variants-empty",
      message: "Keine Variante gewählt.",
      suggestion: "--varianten F,0, F oder 0.",
    });
  }
  for (const [index, varianto] of varianten.entries()) {
    if (!ABLAUF_VARIANTOJ.includes(varianto)) {
      problemoj.push({
        path: `/varianten/${index}`,
        rule: "ablauf-variant-unknown",
        message: `Die Variante „${varianto}“ gibt es nicht.`,
        suggestion: "--varianten F,0, F oder 0.",
      });
    }
  }
  const ripetoj = opcioj.ripetoj ?? 1;
  if (!Number.isInteger(ripetoj) || ripetoj < 1) {
    problemoj.push({
      path: "/ripetoj",
      rule: "ablauf-repeats-invalid",
      message: `${ripetoj} Wiederholungen sind keine ganze Zahl ≥ 1.`,
      suggestion: "--ripetoj 1 (die Messung nimmt eine Wiederholung).",
    });
  }
  if (!Number.isFinite(opcioj.maksTokenoj) || opcioj.maksTokenoj <= 0) {
    problemoj.push({
      path: "/maksTokenoj",
      rule: "max-tokens-invalid",
      message: `Die Tokengrenze ${opcioj.maksTokenoj} ist keine positive Zahl.`,
      suggestion: "--max-tokens mit einer Zahl > 0 angeben.",
    });
  }
  return problemoj;
}

const pad = (value: number) => String(value).padStart(2, "0");

/** The run id: the UTC minute of the start, `-2`, `-3` … when the folder exists (as nordstelo). */
export function laufId(date: Date, out: string): string {
  const base = `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}-${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}`;
  let id = base;
  for (let k = 2; existsSync(join(out, id)); k += 1) id = `${base}-${k}`;
  return id;
}

/**
 * The chat model of one run, charged to the shared Budget of the measurement as well: before each
 * request the shared Budget is checked (metiejo `CostLimitReached`, which ekranoj turns into the
 * stop „max-tokens“), after it the tokens are booked there.
 */
export function kunKomunaBudgxeto(chat: ChatModel, komuna: Budget): ChatModel {
  return {
    ...(chat.modelo === undefined ? {} : { modelo: chat.modelo }),
    async send(messages, tools, budget) {
      komuna.ensure();
      const respondo = await chat.send(messages, tools, budget);
      komuna.charge(respondo.input, respondo.output);
      return respondo;
    },
  };
}

const NENIU_PENO: Peno = {
  inputTokens: 0,
  outputTokens: 0,
  toolCalls: 0,
  requests: 0,
  ms: 0,
  bytes: 0,
};

const mesagxoDe = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

function skribiSeMankas(file: string, content: string): void {
  if (existsSync(file)) return;
  writeFileSync(file, content);
}

/**
 * Stores what the run returned in the layout of an ekranoj run folder (D-33): `plano.json`,
 * `mankoj.json` (Teil 3) and, per round, `rondoj/<n>/<slug>.fakto.json` and the fragment `rondoj/<n>/<slug>.html`. Files the
 * run wrote itself (ekranoj from S037-04 on) are kept as they are.
 */
export function skribiRondojn(dir: string, rezulto: EkranojRezulto): void {
  mkdirSync(dir, { recursive: true });
  skribiSeMankas(join(dir, "plano.json"), stabilaJson(rezulto.plano));
  // Teil 3: the gaps of the run, so `fm ekranoj mankoj <run folder>` finds the measurement too.
  skribiSeMankas(join(dir, "mankoj.json"), stabilaJson(rezulto.mankoj));
  for (const [index, rondo] of rezulto.rondoj.entries()) {
    const rondoDir = join(dir, "rondoj", String(index + 1));
    mkdirSync(rondoDir, { recursive: true });
    for (const slug of Object.keys(rondo).sort()) {
      const stato = rondo[slug];
      if (stato?.fakto !== undefined)
        skribiSeMankas(join(rondoDir, `${slug}.fakto.json`), stabilaJson(stato.fakto));
      if (stato?.fragmento !== undefined)
        skribiSeMankas(join(rondoDir, `${slug}.html`), stato.fragmento);
    }
  }
}

function statoDe(rezulto: EkranojRezulto): KuroRekordo["stato"] {
  const stato: KuroRekordo["stato"] = {};
  for (const [index, rondo] of rezulto.rondoj.entries()) {
    const own: Record<string, StatoEkrano> = {};
    for (const slug of Object.keys(rondo).sort()) {
      const ekrano = rondo[slug];
      if (ekrano === undefined) continue;
      own[slug] = {
        verda: ekrano.verda,
        ...(ekrano.verdaEkde === undefined ? {} : { verdaEkde: ekrano.verdaEkde }),
      };
    }
    stato[String(index + 1)] = own;
  }
  return stato;
}

/** The whole measurement: every run, its records, then the report. */
export async function kuriAblaufon(opcioj: AblaufOpcioj, deps: AblaufDeps): Promise<AblaufRezulto> {
  // D-19: another model is refused before anything else happens – no folder, no request.
  gardiModelon({ toString: () => deps.kiModelo });
  const problemoj = validiAblaufon(opcioj);
  if (problemoj.length > 0) throw new NevalidaAblauf(problemoj);

  const lingvo = opcioj.lingvo ?? "de";
  const ripetoj = opcioj.ripetoj ?? 1;
  const elektitaj = opcioj.varianten ?? ABLAUF_VARIANTOJ;
  // F before 0 within each flow, flows in catalogue order (D-25): a stop at the limit keeps whole
  // comparisons of the flows that ran.
  const varianten = ABLAUF_VARIANTOJ.filter((varianto) => elektitaj.includes(varianto));
  const elektitajTaskoj = new Set(opcioj.taskoj ?? ABLAUF_TASKOJ.map((tasko) => tasko.slug));
  const taskoj = ABLAUF_TASKOJ.filter((tasko) => elektitajTaskoj.has(tasko.slug));

  const kuroj = taskoj.flatMap((tasko) =>
    varianten.flatMap((varianto) =>
      Array.from({ length: ripetoj }, (_, i) => ({ tasko, varianto, ripeto: i + 1 })),
    ),
  );

  // The estimate over all runs before the start (D-20, D-25).
  let taksoTokenoj = 0;
  let taksoUsd: number | undefined = 0;
  for (const kuro of kuroj) {
    const takso = taksoPorEnigo(
      {
        frazo: kuro.tasko.celo[lingvo],
        marko: ABLAUF_MARKO,
        out: "",
        maksTokenoj: opcioj.maksTokenoj,
        plano: planoDe(kuro.tasko, lingvo),
        varianto: kuro.varianto,
        lingvo,
      },
      deps.kiModelo,
    );
    taksoTokenoj += takso.tokenoj;
    taksoUsd = takso.usd === undefined || taksoUsd === undefined ? undefined : taksoUsd + takso.usd;
  }
  deps.log(
    `Schätzung: ${kuroj.length} Läufe, ${taksoTokenoj} Tokens${taksoUsd === undefined ? ", Kosten unbekannt" : `, ${taksoUsd.toFixed(4)} $`}; Grenze ${opcioj.maksTokenoj} Tokens.`,
  );

  mkdirSync(opcioj.out, { recursive: true });
  const dir = join(opcioj.out, laufId(deps.nun(), opcioj.out));
  mkdirSync(dir, { recursive: true });
  const lauf: LaufRekordo = {
    commit: deps.commit,
    kiModelo: deps.kiModelo,
    maksTokenoj: opcioj.maksTokenoj,
    lingvo,
    taskoj: taskoj.map((tasko) => tasko.slug),
    varianten: [...varianten],
    ripetoj,
    markoj: [...deps.markoj],
    takso: {
      tokenoj: taksoTokenoj,
      ...(taksoUsd === undefined ? {} : { usd: Math.round(taksoUsd * 1e6) / 1e6 }),
    },
  };

  writeFileSync(join(dir, LAUF_DOSIERO), stabilaJson(lauf));

  const komuna = new Budget(opcioj.maksTokenoj);
  const rekordoj: KuroRekordo[] = [];
  for (const { tasko, varianto, ripeto } of kuroj) {
    const own = kuroDir(dir, tasko.slug, varianto, ripeto);
    mkdirSync(own, { recursive: true });
    const antaux = deps.sxargo();
    let rekordo: KuroRekordo;
    let komencebla = true;
    try {
      komuna.ensure();
    } catch {
      komencebla = false;
    }
    if (!komencebla) {
      rekordo = {
        tasko: tasko.slug,
        varianto,
        ripeto,
        nekomencita: true,
        haltigo: "max-tokens",
        faritajRondoj: 0,
        peno: NENIU_PENO,
        stato: {},
        restantaj: 0,
        notoj: [
          `Nicht gestartet: die Tokengrenze ${opcioj.maksTokenoj} der Messung ist erreicht (verbraucht: ${komuna.spent}).`,
        ],
        sxargo: { antaux: antaux.sxargo, post: antaux.sxargo, kernoj: antaux.kernoj },
      };
      deps.log(`${tasko.slug} ${varianto}-${ripeto}: nicht gestartet (Tokengrenze).`);
    } else {
      const kuraj = await deps.kuraDeps({ tasko, varianto, ripeto, dir: own });
      const { tools, ...senIloj } = kuraj;
      const ekranojDeps: EkranojDeps = {
        // D-07, D-34: Variante 0 never gets the Gvidanto.
        ...(varianto === "F" && tools !== undefined ? { ...senIloj, tools } : senIloj),
        chat: kunKomunaBudgxeto(kuraj.chat, komuna),
        taksilo: deps.taksiloPor(tasko),
      };
      deps.log(`${tasko.slug} ${varianto}-${ripeto}: Start.`);
      const jamEnigo = komuna.input;
      const jamEligo = komuna.output;
      try {
        const rezulto = await deps.kuruEkranojn(
          {
            frazo: tasko.celo[lingvo],
            marko: ABLAUF_MARKO,
            out: own,
            maksTokenoj: opcioj.maksTokenoj - komuna.spent,
            plano: planoDe(tasko, lingvo),
            varianto,
            lingvo,
          },
          ekranojDeps,
        );
        skribiRondojn(own, rezulto);
        const post = deps.sxargo();
        rekordo = {
          tasko: tasko.slug,
          varianto,
          ripeto,
          ...(rezulto.haltigo === undefined ? {} : { haltigo: rezulto.haltigo }),
          faritajRondoj: rezulto.faritajRondoj ?? rezulto.rondoj.length,
          peno: rezulto.peno,
          ...(rezulto.takso === undefined
            ? {}
            : {
                takso: {
                  tokenoj: rezulto.takso.tokenoj,
                  ...(rezulto.takso.usd === undefined ? {} : { usd: rezulto.takso.usd }),
                },
              }),
          stato: statoDe(rezulto),
          restantaj: rezulto.restantaj.length,
          notoj: rezulto.notoj ?? [],
          sxargo: { antaux: antaux.sxargo, post: post.sxargo, kernoj: post.kernoj },
        };
      } catch (error) {
        if (error instanceof MalpermesitaModelo) throw error;
        const post = deps.sxargo();
        rekordo = {
          tasko: tasko.slug,
          varianto,
          ripeto,
          haltigo: "eraro",
          eraro: mesagxoDe(error),
          faritajRondoj: 0,
          // What the run used before the error still counts.
          peno: {
            ...NENIU_PENO,
            inputTokens: komuna.input - jamEnigo,
            outputTokens: komuna.output - jamEligo,
          },
          stato: {},
          restantaj: 0,
          notoj: [],
          sxargo: { antaux: antaux.sxargo, post: post.sxargo, kernoj: post.kernoj },
        };
        deps.log(`${tasko.slug} ${varianto}-${ripeto}: Fehler: ${rekordo.eraro}`);
      }
    }
    writeFileSync(join(own, KURO_DOSIERO), stabilaJson(rekordo));
    rekordoj.push(rekordo);
  }

  const raporto = skribiRaporton(dir, { modelo: deps.modelo, taksiloPor: deps.taksiloPor });
  return { dir, kuroj: rekordoj, raporto };
}
