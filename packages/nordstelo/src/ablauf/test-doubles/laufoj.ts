// Stored run folders of the measurement „ganzer Ablauf“ for the comparison 4.3 (Spec 038 C-4): the
// files `--art ablauf` leaves (`lauf.json`, `raporto.json`, `<tasko>/<F|0>/1/kuro.json`) in the
// old shape of the reference (no K8, no `penoj`), the new shape (both) or the much older shape of
// the 037 measurement point. Only the fields the comparison reads; brands of the repository only.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { type PenoKvar, STREUUNG_REIHE_K, stabilaJson } from "../raporto.js";

export const LFD = "liste-filter-detail";
export const UK = "uebersicht-kennzahlen";
const SLUGOJ = ["a", "b"] as const;

export interface KuroPeco {
  tasko: string;
  varianto: "F" | "0";
  /** Total of the last round (3); round 1 is `r1`. */
  total?: number;
  r1?: number;
  k8?: number;
  nekomencita?: boolean;
  haltigo?: "max-tokens";
  /** 1-minute load after the run (10 cores). */
  l1?: number;
  /** Screen „a“ green in the last round. */
  verda?: boolean;
  /** Write `penoj` and `penoPlano` into kuro.json (new shape). */
  penoj?: boolean;
  /** Drop fields the 037 measurement point does not have either. */
  malnova?: boolean;
}

export const K = (v: number) => ({ K1: v, K2: v, K3: 1, K4: 1, K5: 1, K6: 1 });
export const RUN_PENO = {
  inputTokens: 60_000,
  outputTokens: 600,
  requests: 6,
  toolCalls: 9,
  ms: 1000,
  bytes: 100,
};
export const EKRANA_PENO: PenoKvar = {
  inputTokens: 9_000,
  outputTokens: 90,
  requests: 1,
  toolCalls: 1,
};

function rondo(peco: KuroPeco, total: number, lasta: boolean) {
  const ekranoj = Object.fromEntries(
    SLUGOJ.map((slug) => {
      const verda = lasta && slug === "a" && peco.verda === true;
      return [
        slug,
        {
          total,
          k: K(0.9),
          kompleta: true,
          unueca: true,
          verda,
          ...(peco.malnova === true ? {} : { verdaEkde: null }),
          ...(peco.k8 === undefined ? {} : { k8: peco.k8 }),
        },
      ];
    }),
  );
  return {
    fluo: {
      konstruitaj: SLUGOJ.length,
      planitaj: SLUGOJ.length,
      total,
      k: K(0.9),
      navigado: 1,
      sxablonoj: 1,
      ...(peco.k8 === undefined ? {} : { k8: peco.k8 }),
    },
    ekranoj,
  };
}

function kuroEnRaporto(peco: KuroPeco) {
  const sxargo = {
    antaux: { l1: 1, l5: 1, l15: 1 },
    post: { l1: peco.l1 ?? 2, l5: 1, l15: 1 },
    kernoj: 10,
  };
  const nekomencita = peco.nekomencita === true;
  const total = peco.total ?? 80;
  return {
    tasko: peco.tasko,
    varianto: peco.varianto,
    ripeto: 1,
    nekomencita,
    haltigo: nekomencita ? "max-tokens" : (peco.haltigo ?? null),
    faritajRondoj: nekomencita ? 0 : peco.haltigo === undefined ? 3 : 1,
    peno: nekomencita ? { ...RUN_PENO, inputTokens: 0, outputTokens: 0, requests: 0 } : RUN_PENO,
    sxargo,
    restantaj: 0,
    notoj: [],
    ...(peco.malnova === true
      ? {}
      : { eraro: null, usd: 0.0121, lastoSuperKernoj: Math.max(1, peco.l1 ?? 2) > 10 }),
    rondoj: nekomencita
      ? {}
      : peco.haltigo === undefined
        ? {
            "1": rondo(peco, peco.r1 ?? total - 10, false),
            "2": rondo(peco, total - 5, false),
            "3": rondo(peco, total, true),
          }
        : { "1": rondo(peco, total, true) },
  };
}

/** Writes one run folder `<parent>/<id>/` as `--art ablauf` leaves it; returns the run folder. */
export function skribiLaufon(
  parent: string,
  id: string,
  e: { commit: string; kuroj: KuroPeco[]; projekcioj?: boolean },
): string {
  const dir = join(parent, id);
  mkdirSync(dir, { recursive: true });
  if (e.projekcioj === true) {
    mkdirSync(join(parent, "projekcioj", "css"), { recursive: true });
    writeFileSync(join(parent, "projekcioj", "css", "fundamento.css"), ":root{}");
  }
  const taskoj = [...new Set(e.kuroj.map((k) => k.tasko))];
  const varianten = (["F", "0"] as const).filter((v) => e.kuroj.some((k) => k.varianto === v));
  writeFileSync(
    join(dir, "lauf.json"),
    stabilaJson({
      commit: e.commit,
      kiModelo: "mistral/ministral-14b-2512",
      maksTokenoj: 1_000_000,
      lingvo: "de",
      taskoj,
      varianten,
      ripetoj: 1,
      markoj: ["komuna", "ekzemplo"],
      takso: { tokenoj: 1, usd: 0 },
    }),
  );
  const kuroj = e.kuroj.map(kuroEnRaporto);
  const k8Vicoj = e.kuroj.flatMap((k) =>
    k.k8 === undefined
      ? []
      : (["komuna", "ekzemplo"] as const).flatMap((aspekto) =>
          (["light", "dark"] as const).map((scheme) => ({
            tasko: k.tasko,
            varianto: k.varianto,
            rondo: "3",
            aspekto,
            scheme,
            merkmaloj: {},
            kvoto: aspekto === "komuna" ? (k.k8 ?? 0) : 0.5,
          })),
        ),
  );
  writeFileSync(
    join(dir, "raporto.json"),
    stabilaJson({
      id,
      lauf: { commit: e.commit },
      ...(e.kuroj.some((k) => k.malnova === true)
        ? {}
        : { streuung: { reiheK: STREUUNG_REIHE_K, fonto: "x" } }),
      kuroj,
      komparoj: { f0: [], r1r3: [], ekranoj: [] },
      ...(k8Vicoj.length === 0 ? {} : { k8: k8Vicoj }),
      sumo: {},
    }),
  );
  for (const [i, peco] of e.kuroj.entries()) {
    const kuroDir = join(dir, peco.tasko, peco.varianto, "1");
    mkdirSync(kuroDir, { recursive: true });
    const {
      rondoj: _rondoj,
      usd: _usd,
      lastoSuperKernoj: _l,
      ...rekordo
    } = kuroj[i] as Record<string, unknown>;
    const penoj =
      peco.penoj === true
        ? {
            penoj: Object.fromEntries(
              ["1", "2", "3"].map((n) => [
                n,
                Object.fromEntries(SLUGOJ.map((s) => [s, EKRANA_PENO])),
              ]),
            ),
            penoPlano: { inputTokens: 6_000, outputTokens: 60, requests: 0, toolCalls: 3 },
          }
        : {};
    writeFileSync(join(kuroDir, "kuro.json"), stabilaJson({ ...rekordo, stato: {}, ...penoj }));
  }
  return dir;
}
