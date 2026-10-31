// `pnpm nordstelo --art ablauf` (Spec 037, Lieferliste 2.3): the arguments of the measurement
// „ganzer Ablauf“ and its wiring. The nordstelo cli hands every call with `--art` to this module and
// keeps its own path unchanged without it. Order: arguments → settings check → .env → model guard
// (D-19, exit 2 before anything is built or asked) → the real dependencies (loaded by dynamic
// import: ekranoj, the in-process Gvidanto, the brand build of all Aspektoj, the renderer) → run →
// report. Everything heavy sits behind `ArtoMedio.preparo`, so tests drive the whole command with
// doubles and without browser, network or provider.

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { cpus, loadavg } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  type Bildigilo,
  gardiModelon,
  type KuruEkranojn,
  MalpermesitaModelo,
  type Marko,
  type Varianto,
} from "@fundamento/ekranoj";
import { type Provider, parseEnv, providerOf } from "@fundamento/metiejo";
import { defaultModeloSource, loadModelo, type Modelo } from "@fundamento/modelo";
import type { Facts, Variant } from "../facts.js";
import { type AblaufDeps, kuriAblaufon, NevalidaAblauf, validiAblaufon } from "./kuro.js";
import { legiKatalogon } from "./poentoj.js";
import { type Sxargo, sxargoDe, taksiloPorMezuro } from "./raporto.js";

// Red (Spec 037, R-3): the types of this module only; the functions arrive with the green commit.

/** What a renderer of nordstelo gives (`createRenderer`, `render.ts`). */
export interface NordsteloBildigilo {
  render(html: string, variant: Variant): Promise<{ facts: Facts; screenshot: Uint8Array }>;
  close(): Promise<void>;
}

/** The heavy dependencies of a measurement, built after the guard. */
export interface Preparo {
  kuruEkranojn: KuruEkranojn;
  kuraDeps: AblaufDeps["kuraDeps"];
  markoj: readonly string[];
  fermi(): Promise<void>;
}

/** Everything the command touches outside itself; tests pass doubles. */
export interface ArtoMedio {
  root: string;
  stdout(teksto: string): void;
  stderr(teksto: string): void;
  /** The values of a .env; undefined when the file does not exist. */
  legiEnv(file: string): Record<string, string | undefined> | undefined;
  preparo(e: {
    provider: Provider;
    out: string;
    ledger: string;
    log: (linio: string) => void;
  }): Promise<Preparo>;
  modelo(): Modelo;
  sxargo(): { sxargo: Sxargo; kernoj: number };
  nun(): Date;
  commit(): string;
}
