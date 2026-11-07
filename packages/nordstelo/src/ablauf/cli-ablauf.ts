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
  type Kontrolo,
  type KuruEkranojn,
  MalpermesitaModelo,
  type Marko,
  type Problemo,
  type Varianto,
} from "@fundamento/ekranoj";
import { type Provider, parseEnv, providerOf } from "@fundamento/metiejo";
import { defaultModeloSource, loadModelo, type Modelo } from "@fundamento/modelo";
import type { Facts, Variant } from "../facts.js";
import { type KomparoFlanko, komparo, komparoMd, NevalidaKomparo, trovuLaufon } from "./komparo.js";
import { type AblaufDeps, kuriAblaufon, NevalidaAblauf, validiAblaufon } from "./kuro.js";
import { legiKatalogon } from "./poentoj.js";
import { type Sxargo, stabilaJson, sxargoDe, taksiloPorMezuro } from "./raporto.js";

/** The values `--art` takes. */
export const ARTOJ = ["ablauf", "komparo"] as const;

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

export const HELPO_KOMPARO = `pnpm nordstelo --art komparo --antaux <Ordner> --post <Ordner> --out <Ordner> [Optionen]
                                     Vergleich 4.3 (Spec 038): vorher gegen nachher je Ablauf ×
                                     Variante aus den gespeicherten Daten (lauf.json, raporto.json,
                                     kuro.json) – keine neue Bewertung, kein Modell, kein Browser

  --antaux <Ordner>    Seite „vorher“: ein Laufordner (mit lauf.json) oder ein Ordner mit genau
                       einem; mehrfach möglich, je Ablauf × Variante höchstens ein Ordner
  --post <Ordner>      Seite „nachher“, wie --antaux
  --zusatz <Ordner>    die Zusatzzeile „Stand vor 036 Teil 5“ (steht daneben, wird nicht verglichen)
  --gestoert <Ordner>  ein gestörter Lauf (laeufe.tsv): seine Werte sind markiert, kein Δ;
                       mehrfach möglich, muss einer der Ordner oben sein
  --out <Ordner>       schreibt vergleich.md und vergleich.json
  --json               die Zusammenfassung (bei Exit 2 die Probleme) als JSON

Exit 0: Vergleich geschrieben, 1: Fehler beim Lesen, 2: Aufruf oder Ordner nicht zulässig
(z. B. dasselbe Paar Ablauf × Variante zweimal auf einer Seite).`;

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
    /** The control pair (`--lauf-id`, `--kontroll-modelo`; Spec 038 C-3); absent otherwise. */
    kontrolo?: Kontrolo;
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

/** The value of `--art` on the command line (`--art x` or `--art=x`). */
function artoDe(argv: readonly string[]): string | undefined {
  for (const [index, arg] of argv.entries()) {
    if (arg === "--art") return argv[index + 1];
    if (arg.startsWith("--art=")) return arg.slice("--art=".length);
  }
  return undefined;
}

/**
 * `pnpm nordstelo --art komparo` (Spec 038 C-4): reads stored folders only – no .env, no model,
 * no build. Every problem of the call at once, structured, exit 2.
 */
function kuriKomparon(argv: readonly string[], medio: ArtoMedio): number {
  let values: {
    antaux?: string[];
    post?: string[];
    zusatz?: string;
    gestoert?: string[];
    out?: string;
    json?: boolean;
    help?: boolean;
  };
  try {
    ({ values } = parseArgs({
      args: [...argv],
      allowPositionals: false,
      options: {
        art: { type: "string" },
        antaux: { type: "string", multiple: true },
        post: { type: "string", multiple: true },
        zusatz: { type: "string" },
        gestoert: { type: "string", multiple: true },
        out: { type: "string" },
        json: { type: "boolean" },
        help: { type: "boolean", short: "h" },
      },
    }));
  } catch (error) {
    medio.stderr(`${mesagxoDe(error)}\n\n${HELPO_KOMPARO}\n`);
    return 2;
  }
  if (values.help === true) {
    medio.stdout(`${HELPO_KOMPARO}\n`);
    return 0;
  }
  const raporti = (problemoj: readonly Problemo[]): number => {
    medio.stderr(
      `${problemoj.map((p) => `${p.path} ${p.rule}: ${p.message} ${p.suggestion}`).join("\n")}\n`,
    );
    if (values.json === true) medio.stdout(stabilaJson({ problemoj }));
    return 2;
  };
  const problemoj: Problemo[] = [];
  const antaux = values.antaux ?? [];
  const post = values.post ?? [];
  if (antaux.length === 0)
    problemoj.push({
      path: "/antaux",
      rule: "komparo-flanko-mankas",
      message: "Die Seite „vorher“ fehlt.",
      suggestion: "--antaux <Laufordner> angeben (mehrfach möglich).",
    });
  if (post.length === 0)
    problemoj.push({
      path: "/post",
      rule: "komparo-flanko-mankas",
      message: "Die Seite „nachher“ fehlt.",
      suggestion: "--post <Laufordner> angeben (mehrfach möglich).",
    });
  if (values.out === undefined)
    problemoj.push({
      path: "/out",
      rule: "komparo-out-mankas",
      message: "Der Ordner für vergleich.md und vergleich.json fehlt.",
      suggestion: "--out <Ordner> angeben.",
    });
  // A disturbed folder is named as given or as its run folder; it must be one of the sides.
  const laufDe = (dir: string): string | undefined => {
    try {
      return trovuLaufon(dir);
    } catch {
      return undefined;
    }
  };
  const cxiuj = [...antaux, ...post, ...(values.zusatz === undefined ? [] : [values.zusatz])];
  const konataj = new Set(
    cxiuj.flatMap((dir) => [resolve(dir), laufDe(dir)].filter((d) => d !== undefined)),
  );
  const gestoert = new Set((values.gestoert ?? []).map((dir) => resolve(dir)));
  for (const [index, dir] of (values.gestoert ?? []).entries()) {
    if (konataj.has(resolve(dir))) continue;
    problemoj.push({
      path: `/gestoert/${index}`,
      rule: "komparo-gestoert-nekonata",
      message: `--gestoert ${dir} ist keiner der Ordner von --antaux, --post oder --zusatz.`,
      suggestion: "Den gestörten Ordner so angeben wie bei --antaux/--post oder seinen Laufordner.",
    });
  }
  if (problemoj.length > 0) return raporti(problemoj);

  const flanko = (dir: string): KomparoFlanko => {
    const lauf = laufDe(dir);
    const gestoerta = gestoert.has(resolve(dir)) || (lauf !== undefined && gestoert.has(lauf));
    return { dir: resolve(dir), ...(gestoerta ? { gestoerta } : {}) };
  };
  const out = resolve(String(values.out));
  try {
    const datumoj = komparo(
      antaux.map(flanko),
      post.map(flanko),
      values.zusatz === undefined ? {} : { zusatz: flanko(values.zusatz) },
    );
    mkdirSync(out, { recursive: true });
    const md = join(out, "vergleich.md");
    const json = join(out, "vergleich.json");
    writeFileSync(json, stabilaJson(datumoj));
    writeFileSync(md, komparoMd(datumoj));
    const resumo = {
      vergleich: md,
      vergleichJson: json,
      paroj: datumoj.paroj.length,
      kunDelto: datumoj.paroj.filter((paro) => paro.delto !== null).length,
    };
    if (values.json === true) medio.stdout(`${JSON.stringify(resumo, null, 2)}\n`);
    else
      medio.stdout(
        `Vergleich: ${resumo.paroj} Paare Ablauf × Variante, ${resumo.kunDelto} mit Δ\nBericht: ${md}\n`,
      );
    return 0;
  } catch (error) {
    if (error instanceof NevalidaKomparo) return raporti(error.problemoj);
    medio.stderr(`${mesagxoDe(error)}\n`);
    return 1;
  }
}

/** `pnpm nordstelo --art …`: the exit code. */
export async function kuriArton(
  argv: readonly string[],
  medio: ArtoMedio = realaMedio(),
): Promise<number> {
  if (artoDe(argv) === "komparo") return kuriKomparon(argv, medio);
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
