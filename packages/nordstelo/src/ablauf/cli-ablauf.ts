// `pnpm nordstelo --art ablauf` (Spec 037, Lieferliste 2.3): the arguments of the measurement
// „ganzer Ablauf“ and its wiring. The nordstelo cli hands every call with `--art` to this module and
// keeps its own path unchanged without it. Order: arguments → settings check → .env → model guard
// (D-19, exit 2 before anything is built or asked) → the real dependencies (loaded by dynamic
// import: ekranoj, the in-process Gvidanto, the brand build of all Aspektoj, the renderer) → run →
// report. Everything heavy sits behind `ArtoMedio.preparo`, so tests drive the whole command with
// doubles and without browser, network or provider.

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

/** The values `--art` takes. */
export const ARTOJ = ["ablauf"] as const;

/** The token limit of a measurement without `--max-tokens`: the slice of one Messpunkt (D-25). */
export const ABLAUF_MAKS_TOKENOJ = 2_000_000;

const ROOT = fileURLToPath(new URL("../../../../", import.meta.url));

export const HELPO_ABLAUF = `pnpm nordstelo --art ablauf [Optionen]
                                     Messung „ganzer Ablauf“ (Spec 037): je Aufgabe, Variante und
                                     Wiederholung ein Lauf von ekranoj mit dem Plan des Katalogs,
                                     bis zu 3 Runden; Bericht F gegen 0 und Runde 1 gegen Runde 3

  --taskoj <a,b>       nur diese Abläufe (Slugs aus src/ablauf/katalogo.ts), Standard: alle fünf
  --varianten <F,0>    Standard: F,0 (F läuft vor 0)
  --ripetoj <n>        Wiederholungen je Ablauf und Variante, Standard: 1
  --max-tokens <n>     eine Tokengrenze für die ganze Messung, Standard: ${ABLAUF_MAKS_TOKENOJ}
  --lingvo <de|en>     Sprache des Plans, Standard: de
  --out <Ordner>       Standard: .fundamento/nordstelo/ablauf im Checkout
  --ledger <Ordner>    Ordner von anfragoj.json (Anfragen je Tag), Standard: --out
  --env <Datei>        die .env mit FM_KI_ANBIETER, FM_KI_MODELL und dem Schlüssel (Standard: .env im Checkout);
                       nur mistral/ministral-14b-2512 ist erlaubt, jedes andere Modell endet mit Exit 2
  --json               die Zusammenfassung als JSON

Exit 0: Bericht geschrieben (auch wenn die Tokengrenze einen Lauf beendet hat), 1: kein Screen
gebaut oder Fehler, 2: Aufruf, .env oder Modell nicht zulässig.`;

/** The command line asks for another kind of measurement (`--art …`). */
export function petasArton(argv: readonly string[]): boolean {
  return argv.some((arg) => arg === "--art" || arg.startsWith("--art="));
}

/** What a renderer of nordstelo gives (`createRenderer`, `render.ts`). */
export interface NordsteloBildigilo {
  render(html: string, variant: Variant): Promise<{ facts: Facts; screenshot: Uint8Array }>;
  close(): Promise<void>;
}

/**
 * nordstelo's renderer as the `Bildigilo` of ekranoj (D-39): every screen in all Aspektoj of the
 * cxiuj config × light/dark, the renders in high contrast left out (contrast default only). One
 * screenshot (komuna, light) as the light photo; no dark photo – the measurement does not need
 * photos. `close` does nothing: the caller closes the shared renderer once at the end.
 */
export function bildigiloDeRenderer(renderer: NordsteloBildigilo): Bildigilo {
  return {
    async render(dokumento, opcioj) {
      const { facts, screenshot } = await renderer.render(dokumento.html, opcioj.varianto);
      return {
        fakto: { ...facts, renders: facts.renders.filter((r) => r.contrast === "default") },
        bildoj: { hela: screenshot, malhela: new Uint8Array() },
      };
    },
    close: async () => undefined,
  };
}

/**
 * The brand build for ekranoj: the css of all Aspektoj (D-39), built once for the measurement and
 * copied into `<dir>/css/fundamento.css` of a run that asks for it (the one file a screen loads).
 */
export function markoDe(projekcioj: string): Marko {
  return {
    async konstrui(dir) {
      const css = join(dir, "css", "fundamento.css");
      mkdirSync(dirname(css), { recursive: true });
      copyFileSync(join(projekcioj, "css", "fundamento.css"), css);
      return { css: [css] };
    },
  };
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

function commitOf(root: string): string {
  try {
    const commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      cwd: root,
      encoding: "utf8",
    }).trim();
    const dirty =
      execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }).trim() !== "";
    return dirty ? `${commit}-dirty` : commit;
  } catch {
    return "unbekannt";
  }
}

/** The real dependencies: ekranoj, the Gvidanto in the process, the brand build, Chromium. */
async function realaPreparo(
  root: string,
  e: Parameters<ArtoMedio["preparo"]>[0],
): Promise<Preparo> {
  const ekranoj = await import("@fundamento/ekranoj");
  const { AnfragoLedger, LIMOJ, mergeLedger, Pordisto } = await import("../limoj.js");
  const { connectGvidanto } = await import("../gvidanto.js");
  const { ASPEKTOJ, createRenderer } = await import("../render.js");
  const { buildProjekcioj } = await import("@fundamento/projekcioj");
  const { projectModeloSource } = await import("@fundamento/modelo");

  // The limits of the provider and the requests of each UTC day, as `pnpm nordstelo` keeps them.
  mkdirSync(e.ledger, { recursive: true });
  const ledgerFile = join(e.ledger, "anfragoj.json");
  const legi = () =>
    existsSync(ledgerFile)
      ? (JSON.parse(readFileSync(ledgerFile, "utf8")) as Record<string, number>)
      : {};
  const ledger = new AnfragoLedger(legi());
  const gate = new Pordisto(LIMOJ[e.provider.name], ledger, {
    now: () => Date.now(),
    sleep: (ms) => new Promise((done) => setTimeout(done, ms)),
    provider: e.provider.name,
    counted: () =>
      writeFileSync(
        ledgerFile,
        `${JSON.stringify(mergeLedger(legi(), ledger.entries), null, 2)}\n`,
      ),
  });
  const chat = ekranoj.chatModelDe({ provider: e.provider, gate, log: e.log });

  // D-39: the css of all repo Aspektoj (cxiuj config), as the Kennzahl renders its pages.
  const projekcioj = join(e.out, "projekcioj");
  const built = await buildProjekcioj({
    outDir: projekcioj,
    source: projectModeloSource(
      join(
        root,
        "packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
      ),
    ),
    celoj: ["css"],
  });
  if (!built.ok) throw new Error("Die Projektion css mit allen Marken ließ sich nicht bauen.");
  const erojDist = join(
    dirname(fileURLToPath(import.meta.resolve("@fundamento/eroj/package.json"))),
    "dist",
  );
  const gvidanto = await connectGvidanto();
  let renderer: NordsteloBildigilo;
  try {
    renderer = await createRenderer({ projekcioj, erojDist, concurrency: 1 });
  } catch (error) {
    await gvidanto.close();
    throw error;
  }
  const bildigilo = bildigiloDeRenderer(renderer);
  const marko = markoDe(projekcioj);
  return {
    kuruEkranojn: ekranoj.kuruEkranojn,
    markoj: ASPEKTOJ,
    kuraDeps: ({ varianto }) => ({
      chat,
      ...(varianto === "F" ? { tools: gvidanto.bridge } : {}),
      bildigilo,
      marko,
      nun: () => new Date(),
      log: e.log,
    }),
    fermi: async () => {
      await renderer.close();
      await gvidanto.close();
    },
  };
}

/** The machine and the checkout as they are. */
export function realaMedio(root: string = ROOT): ArtoMedio {
  return {
    root,
    stdout: (teksto) => process.stdout.write(teksto),
    stderr: (teksto) => process.stderr.write(teksto),
    legiEnv: (file) => (existsSync(file) ? parseEnv(readFileSync(file, "utf8")) : undefined),
    preparo: (e) => realaPreparo(root, e),
    modelo: () => {
      const { modelo } = loadModelo(defaultModeloSource());
      if (modelo === undefined)
        throw new Error("Die Modelo des Repositorys lässt sich nicht laden.");
      return modelo;
    },
    sxargo: () => ({ sxargo: sxargoDe(loadavg()), kernoj: cpus().length }),
    nun: () => new Date(),
    commit: () => commitOf(root),
  };
}

const mesagxoDe = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/** `pnpm nordstelo --art …`: the exit code. */
export async function kuriArton(
  argv: readonly string[],
  medio: ArtoMedio = realaMedio(),
): Promise<number> {
  const uzo = (mesagxo: string): number => {
    medio.stderr(`${mesagxo}\n\n${HELPO_ABLAUF}\n`);
    return 2;
  };
  let values: Record<string, string | boolean | undefined>;
  try {
    ({ values } = parseArgs({
      args: [...argv],
      allowPositionals: false,
      options: {
        art: { type: "string" },
        env: { type: "string" },
        taskoj: { type: "string" },
        varianten: { type: "string" },
        ripetoj: { type: "string" },
        "max-tokens": { type: "string" },
        lingvo: { type: "string" },
        out: { type: "string" },
        ledger: { type: "string" },
        json: { type: "boolean" },
        help: { type: "boolean", short: "h" },
      },
    }));
  } catch (error) {
    return uzo(mesagxoDe(error));
  }
  if (!ARTOJ.includes(values.art as (typeof ARTOJ)[number])) {
    return uzo(
      `Unbekannte Art „${String(values.art ?? "")}“ für --art. Erlaubt: ${ARTOJ.join(", ")}.`,
    );
  }
  if (values.help === true) {
    medio.stdout(`${HELPO_ABLAUF}\n`);
    return 0;
  }
  const lingvo = values.lingvo ?? "de";
  if (lingvo !== "de" && lingvo !== "en") return uzo(`--lingvo „${String(lingvo)}“: de oder en.`);
  const listo = (value: string | boolean | undefined) =>
    typeof value === "string"
      ? value
          .split(",")
          .map((entry) => entry.trim())
          .filter((entry) => entry !== "")
      : undefined;
  const taskoj = listo(values.taskoj);
  const varianten = listo(values.varianten) as Varianto[] | undefined;
  const opcioj = {
    ...(taskoj === undefined ? {} : { taskoj }),
    ...(varianten === undefined ? {} : { varianten }),
    ripetoj: values.ripetoj === undefined ? 1 : Number(values.ripetoj),
    maksTokenoj:
      values["max-tokens"] === undefined ? ABLAUF_MAKS_TOKENOJ : Number(values["max-tokens"]),
    lingvo: lingvo as "de" | "en",
    out: resolve(String(values.out ?? join(medio.root, ".fundamento", "nordstelo", "ablauf"))),
  };
  const ledger = resolve(String(values.ledger ?? opcioj.out));
  const problemoj = validiAblaufon(opcioj);
  if (problemoj.length > 0) {
    return uzo(
      problemoj.map((p) => `${p.path} ${p.rule}: ${p.message} ${p.suggestion}`).join("\n"),
    );
  }

  const envFile = resolve(String(values.env ?? join(medio.root, ".env")));
  const settings = medio.legiEnv(envFile);
  if (settings === undefined) {
    medio.stderr(
      `Keine .env unter ${envFile}. Lege sie mit FM_KI_ANBIETER, FM_KI_MODELL und dem Schlüssel an.\n`,
    );
    return 2;
  }
  let provider: Provider;
  try {
    provider = providerOf(settings);
    // D-19 before anything is built or asked.
    gardiModelon(provider);
  } catch (error) {
    medio.stderr(`${mesagxoDe(error)}\n`);
    return 2;
  }
  const log = (linio: string) => medio.stderr(`${provider.redact(linio)}\n`);

  let preparo: Preparo | undefined;
  try {
    const modelo = medio.modelo();
    const katalogo = legiKatalogon();
    preparo = await medio.preparo({ provider, out: opcioj.out, ledger, log });
    log(`Messung „ganzer Ablauf“ mit ${provider.toString()} auf ${medio.commit()}`);
    const rezulto = await kuriAblaufon(opcioj, {
      kuruEkranojn: preparo.kuruEkranojn,
      kiModelo: provider.toString(),
      kuraDeps: preparo.kuraDeps,
      taksiloPor: (tasko) => taksiloPorMezuro({ modelo, katalogo, tasko }),
      modelo,
      markoj: preparo.markoj,
      sxargo: medio.sxargo,
      nun: medio.nun,
      commit: medio.commit(),
      log,
    });
    const { sumo } = rezulto.raporto.datumoj;
    const konstruitaj = rezulto.kuroj.filter((kuro) => kuro.faritajRondoj > 0).length;
    const resumo = {
      dir: rezulto.dir,
      raporto: join(rezulto.dir, "raporto.md"),
      raportoJson: join(rezulto.dir, "raporto.json"),
      kuroj: sumo.kuroj,
      konstruitaj,
      nekomencitaj: sumo.nekomencitaj,
      haltigoj: sumo.haltigoj,
      tokenoj: sumo.tokenoj,
      anfragoj: sumo.anfragoj,
      usd: sumo.usd,
    };
    if (values.json === true) medio.stdout(`${JSON.stringify(resumo, null, 2)}\n`);
    else
      medio.stdout(
        `Läufe ${sumo.kuroj} (gebaut ${konstruitaj}, nicht gestartet ${sumo.nekomencitaj}) · Tokens ${sumo.tokenoj.enigo + sumo.tokenoj.eligo} · ${sumo.usd === null ? "Kosten unbekannt" : `${sumo.usd.toFixed(4)} $`}${sumo.haltigoj.length === 0 ? "" : ` · Halt: ${sumo.haltigoj.map((h) => `${h.tasko} ${h.varianto}-${h.ripeto} ${h.haltigo}`).join(", ")}`}\nBericht: ${provider.redact(resumo.raporto)}\n`,
      );
    return konstruitaj === 0 ? 1 : 0;
  } catch (error) {
    if (error instanceof MalpermesitaModelo || error instanceof NevalidaAblauf) {
      medio.stderr(`${provider.redact(mesagxoDe(error))}\n`);
      return 2;
    }
    medio.stderr(`${provider.redact(mesagxoDe(error))}\n`);
    return 1;
  } finally {
    await preparo?.fermi();
  }
}
