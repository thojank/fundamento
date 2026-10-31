// `fm ekranoj "<Satz>"` (Spec 037, Lieferliste 1.1, 1.7, US-1 to US-3): one sentence and one brand
// become up to five linked, self-checked screens in a folder with an overview and a report. Order:
// arguments → input check (V-2, nothing started) → .env → model guard (D-19) → estimate (D-20) →
// confirmation (`--ja`, else the terminal asks; without a terminal exit 2, D-37) → the real
// dependencies → run → `file://` links. `fm ekranoj mankoj <ordner…>` is the sub-mode that merges
// the gaps of runs into the Lückenliste (D-29, Teil 3, S037-06): no .env, no model, no Gvidanto.
//
// D-30: @fundamento/ekranoj and @fundamento/nordstelo are loaded with a dynamic `import()` inside
// `run` only – `fm --help` must not load Playwright (Spec 035, AC-11). Their types are imported as
// types only (erased). Everything heavy sits behind `EkranojMedio`, so the command runs in-process
// with doubles (`ekranojKomando(medio)`); the registered command uses the real one.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import type {
  Bildigilo,
  ChatModel,
  EkranojEnigo,
  EkranojRezulto,
  GvidantoKonekto,
  Marko,
  Problemo,
  Taksilo,
} from "@fundamento/ekranoj";
import {
  AnfragoLedger,
  LIMOJ,
  mergeLedger,
  Pordisto,
  type Provider,
  parseEnv,
  providerOf,
} from "@fundamento/metiejo";
import {
  defaultModeloSource,
  loadModelo,
  type ModeloSource,
  projectModeloSource,
  readNordstelo,
} from "@fundamento/modelo";
import { buildProjekcioj } from "@fundamento/projekcioj";
import { parseFlags, UsageError } from "../args.js";
import { type CliContext, type Command, EXIT_FAIL, EXIT_OK, EXIT_USAGE } from "../command.js";

const COMMAND_LINE = "fm ekranoj";
/** Runs, ledger and gaps live here unless `--out` / `--ledger` say otherwise (D-21). */
const DEFAULT_DIR = ".fundamento/ekranoj";
/**
 * The token limit of a run without `--max-tokens`: the slice of one acceptance run (D-25,
 * 250 000 tokens ≈ 0,05 $ at 0,20 $ per million). Lower than any limit of the measurement.
 */
export const EKRANOJ_MAKS_TOKENOJ = 250_000;
/** The word that makes the first argument the sub-mode instead of a sentence (D-29). */
export const MANKOJ_MODUSO = "mankoj";
/** The built entry of this cli: the Gvidanto runs as its `fm mcp` child process. */
const CLI_ENIRO = fileURLToPath(new URL("../index.js", import.meta.url));

export const EKRANOJ_HELPO = `${COMMAND_LINE}: Build up to five linked, self-checked screens from one sentence.

Usage: ${COMMAND_LINE} "<Satz>" [--config <fundamento.config.json>] [--ekranoj a,b,c] [--out <dir>]
                  [--max-tokens <n>] [--env <file>] [--ledger <dir>] [--ja] [--json]
       ${COMMAND_LINE} ${MANKOJ_MODUSO} <ordner…> [--out <file>] [--json]

An agent plans the screens of the sentence (at most 5), builds each with the Eroj and Sxablonoj
of the Modelo through the Gvidanto (fm mcp), checks it (K1–K6 of the north-star measure,
check_usage, axe light and dark, navigation) and improves it in at most 3 rounds. The folder
holds the screens, an overview (superrigardo.html), photos and the report (raporto.md, .json)
with every deviation that remains. Before the start the estimate (screens, rounds, tokens, $) is
printed and confirmed.

Options:
  --config <file>     A project's fundamento.config.json: its brand is the one the screens are
                      rendered in. Default: this repository's Modelo with komuna
  --ekranoj <a,b,c>   The screens to build (at most 5); the agent plans their purposes and links
  --out <dir>         The run folder (default: ${DEFAULT_DIR}/<JJMMTT-HHMM>-<slug>)
  --max-tokens <n>    Token limit of the whole run (default: ${EKRANOJ_MAKS_TOKENOJ}); at the limit the
                      run stops and reports what it built (exit 0)
  --env <file>        The .env with FM_KI_ANBIETER, FM_KI_MODELL and the key (default: .env in
                      the current directory). Only mistral/ministral-14b-2512 is allowed
  --ledger <dir>      Folder of anfragoj.json, the requests per day (default: ${DEFAULT_DIR})
  --ja                Start without asking after the estimate (needed without a terminal)
  --json              Print the summary as JSON
  -h, --help          Show this help

Sub-mode:
  ${MANKOJ_MODUSO} <ordner…>    Merge the gaps (mankoj.json) of run folders into one list of missing
                      Eroj, Sxablonoj and Gvidanto tools. A sentence that is exactly the word
                      "${MANKOJ_MODUSO}" is read as this sub-mode. A folder may also hold runs
                      (e.g. ${DEFAULT_DIR}). Prints the table; --out <file> also writes the
                      list as JSON, --json prints it as JSON. No .env, no model is needed.

Exit codes: 0 screens built (also a run stopped by --max-tokens), 1 no screen could be built,
2 usage error, missing .env, model not allowed, or the start not confirmed.
`;

const FLAGS = {
  config: { type: "string" },
  ekranoj: { type: "string" },
  out: { type: "string" },
  "max-tokens": { type: "string" },
  env: { type: "string" },
  ledger: { type: "string" },
  ja: { type: "boolean" },
  json: { type: "boolean" },
} as const;

/** Everything the command touches outside itself; tests and the smoke run replace parts of it. */
export interface EkranojMedio {
  /** The values of a .env; undefined when the file does not exist. */
  legiEnv(dosiero: string): Readonly<Record<string, string | undefined>> | undefined;
  /** Whether a person can answer (stdin and stdout are a terminal). */
  tty(): boolean;
  /** Asks a yes/no question in the terminal; no is the default. */
  demandi(demando: string): Promise<boolean>;
  /** The chat model with the provider's limits and the request ledger `<ledger>/anfragoj.json`. */
  chat(e: {
    provider: Provider;
    ledger: string;
    log: (linio: string) => void;
  }): ChatModel | Promise<ChatModel>;
  /** The Gvidanto: `fm mcp [--config <cfg>]` of this cli as a child process over stdio. */
  gvidanto(e: {
    config: string | undefined;
    log: (linio: string) => void;
  }): Promise<GvidantoKonekto>;
  /** The scorer: nordstelo's `ekranoTaksilo` with the Modelo of the config and its catalogue. */
  taksilo(e: { config: string | undefined }): Taksilo | Promise<Taksilo>;
  /** The brand build (projekcioj, Celoj css and make-kit) into the run's `marko/`. */
  marko(e: { config: string | undefined; marko: string }): Marko | Promise<Marko>;
  /** The renderer (Chromium); undefined without a browser. */
  bildigilo(e: { log: (linio: string) => void }): Promise<Bildigilo | undefined>;
  /** The brand (Aspekto) of a config: its own Aspekto package, komuna without a config. */
  markoNomo(config: string | undefined): string;
  nun(): Date;
  /** The commit of this Fundamento checkout, for the report; undefined outside a checkout. */
  commit(): string | undefined;
}

// --- The real dependencies ---------------------------------------------------------------------

/** The commit this cli's own checkout stands on, "-dirty" with changes (as `fm projekcioj build`). */
function commitDe(): string | undefined {
  const git = (args: readonly string[], cwd: string) =>
    execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  try {
    const here = fileURLToPath(new URL(".", import.meta.url));
    const root = git(["rev-parse", "--show-toplevel"], here);
    const head = git(["rev-parse", "--short", "HEAD"], root);
    return git(["status", "--porcelain"], root) === "" ? head : `${head}-dirty`;
  } catch {
    return undefined;
  }
}

function fontoDe(config: string | undefined): ModeloSource {
  return config === undefined ? defaultModeloSource() : projectModeloSource(config);
}

/**
 * The brand of a config: the name in `aspekto.json` of its last Aspekto package (the config's own;
 * the reference Aspekto komuna always comes first), komuna without a config.
 */
export function markoNomoDe(config: string | undefined): string {
  const pako = fontoDe(config).aspektoPackages?.at(-1);
  if (pako === undefined) return "komuna";
  try {
    const { name } = JSON.parse(readFileSync(join(pako, "aspekto.json"), "utf8")) as {
      name?: unknown;
    };
    if (typeof name === "string" && name !== "") return name;
  } catch {
    // An Aspekto package without a readable aspekto.json is named by its folder.
  }
  return basename(pako);
}

/** The Make-Kit bundle of the brand, else the first one the build wrote (they are brand-free). */
function skriptoDe(dir: string, marko: string): string | undefined {
  const propra = `make-kit/${marko}/dist/element.js`;
  if (existsSync(join(dir, propra))) return propra;
  const makeKit = join(dir, "make-kit");
  if (!existsSync(makeKit)) return undefined;
  for (const nomo of readdirSync(makeKit).sort()) {
    const vojo = `make-kit/${nomo}/dist/element.js`;
    if (existsSync(join(dir, vojo))) return vojo;
  }
  return undefined;
}

/** The machine and the checkout as they are. */
export function realaMedio(): EkranojMedio {
  return {
    legiEnv: (dosiero) => {
      if (!existsSync(dosiero)) return undefined;
      // The parser of the Metiejo: only the names of the settings, never logged.
      return parseEnv(readFileSync(dosiero, "utf8"));
    },
    tty: () => process.stdin.isTTY === true && process.stdout.isTTY === true,
    demandi: async (demando) => {
      const rl = createInterface({ input: process.stdin, output: process.stderr });
      try {
        return /^(j|ja|y|yes)$/i.test((await rl.question(demando)).trim());
      } finally {
        rl.close();
      }
    },
    chat: async ({ provider, ledger, log }) => {
      const { chatModelDe } = await import("@fundamento/ekranoj");
      // The limits of the provider and the requests of each UTC day, as `pnpm nordstelo` keeps them.
      mkdirSync(ledger, { recursive: true });
      const dosiero = join(ledger, "anfragoj.json");
      const legi = (): Record<string, number> =>
        existsSync(dosiero)
          ? (JSON.parse(readFileSync(dosiero, "utf8")) as Record<string, number>)
          : {};
      const anfragoj = new AnfragoLedger(legi());
      const gate = new Pordisto(LIMOJ[provider.name], anfragoj, {
        now: () => Date.now(),
        sleep: (ms) => new Promise((done) => setTimeout(done, ms)),
        provider: provider.name,
        counted: () =>
          writeFileSync(
            dosiero,
            `${JSON.stringify(mergeLedger(legi(), anfragoj.entries), null, 2)}\n`,
          ),
      });
      return chatModelDe({ provider, gate, log });
    },
    gvidanto: async ({ config, log }) => {
      const { konektiGvidanton } = await import("@fundamento/ekranoj");
      return konektiGvidanton(
        {
          command: process.execPath,
          args: [CLI_ENIRO, "mcp", ...(config === undefined ? [] : ["--config", config])],
        },
        { log },
      );
    },
    taksilo: async ({ config }) => {
      const { ekranoTaksilo } = await import("@fundamento/nordstelo");
      const fonto = fontoDe(config);
      const { modelo } = loadModelo(fonto);
      if (modelo === undefined)
        throw new Error("Die Modelo der Konfiguration lässt sich nicht laden.");
      const katalogo = readNordstelo(fonto.dataDir);
      if (katalogo === undefined)
        throw new Error("Die Modelo hat keinen Katalog der Kennzahl (nordstelo.json).");
      // fm ekranoj has no acceptance criteria per screen: K6 stays null (C-8).
      return ekranoTaksilo({ modelo, katalogo });
    },
    marko: async ({ config, marko }) => {
      const fonto = fontoDe(config);
      return {
        async konstrui(dir) {
          // Only what a screen loads: the stylesheet and the Eroj bundle (≈ 7,6 MB less per run).
          const rezulto = await buildProjekcioj({
            outDir: dir,
            source: fonto,
            celoj: ["css", "make-kit"],
          });
          if (!rezulto.ok) {
            throw new Error(
              `Der Markenbau ist fehlgeschlagen (${rezulto.errors.length} Fehler in der Modelo).`,
            );
          }
          const skripto = skriptoDe(dir, marko);
          return { css: ["css/fundamento.css"], ...(skripto === undefined ? {} : { skripto }) };
        },
      };
    },
    bildigilo: async ({ log }) => {
      const { kreiBildigilon } = await import("@fundamento/ekranoj");
      return kreiBildigilon({ log });
    },
    markoNomo: (config) => markoNomoDe(config),
    nun: () => new Date(),
    commit: commitDe,
  };
}

// --- The command -------------------------------------------------------------------------------

const pad = (n: number): string => String(n).padStart(2, "0");

/** `JJMMTT-HHMM-<slug>` (UTC, as the measurement names its runs), unique in `dir`. */
export function kuroNomo(nun: Date, slug: string, dir: string): string {
  const tempo = `${pad(nun.getUTCFullYear() % 100)}${pad(nun.getUTCMonth() + 1)}${pad(nun.getUTCDate())}-${pad(nun.getUTCHours())}${pad(nun.getUTCMinutes())}`;
  const bazo = `${tempo}-${slug}`;
  let nomo = bazo;
  for (let k = 2; existsSync(join(dir, nomo)); k += 1) nomo = `${bazo}-${k}`;
  return nomo;
}

/** The first three words of the sentence as a slug (the run id carries the time). */
export function frazoSlug(frazo: string, slugDe: (teksto: string) => string): string {
  const slug = slugDe(frazo).split("-").filter(Boolean).slice(0, 3).join("-").slice(0, 40);
  return slug === "" ? "ekranoj" : slug;
}

const formati = (p: Problemo): string => `${p.path} ${p.rule}: ${p.message} ${p.suggestion}`;

const mesagxoDe = (eraro: unknown): string =>
  eraro instanceof Error ? eraro.message : String(eraro);

/** The options of the sub-mode; every other option of a run is refused there. */
const MANKOJ_FLAGS: readonly string[] = ["out", "json"];

/**
 * `fm ekranoj mankoj <ordner…> [--out <file>] [--json]` (D-29, Teil 3): the gaps (mankoj.json) of
 * run folders merged into the Lückenliste (C-7). Prints the table (or, with --json, the list as
 * JSON); `--out` also writes the list as JSON. No folder → usage error; a folder that does not
 * exist, holds no run or a broken mankoj.json → the problems, exit 2, nothing written.
 */
async function kuriMankojn(
  dosierujoj: readonly string[],
  values: Readonly<Record<string, string | boolean | (string | boolean)[] | undefined>>,
  context: CliContext,
): Promise<number> {
  const fremdaj = Object.keys(values).filter(
    (nomo) => values[nomo] !== undefined && !MANKOJ_FLAGS.includes(nomo),
  );
  if (fremdaj.length > 0) {
    throw new UsageError(
      `--${fremdaj.join(", --")} is no option of \`${COMMAND_LINE} ${MANKOJ_MODUSO}\`.`,
      [`The sub-mode takes run folders, --out <file> and --json only.`],
    );
  }
  if (dosierujoj.length === 0) {
    throw new UsageError(
      `\`${COMMAND_LINE} ${MANKOJ_MODUSO} <ordner…>\` needs at least one run folder.`,
      [`For example: ${COMMAND_LINE} ${MANKOJ_MODUSO} ${DEFAULT_DIR}`],
    );
  }
  const ek = await import("@fundamento/ekranoj");
  let mankoj: ReturnType<typeof ek.kunigiMankojn>;
  try {
    mankoj = ek.kunigiMankojn(dosierujoj.map((dir) => resolve(context.baseDir, dir)));
  } catch (eraro) {
    if (!(eraro instanceof ek.MankojEraro)) throw eraro;
    for (const problemo of eraro.problemoj) {
      context.stderr(`${COMMAND_LINE} ${MANKOJ_MODUSO}: ${formati(problemo)}\n`);
    }
    context.stderr("Nothing was merged.\n");
    return EXIT_USAGE;
  }
  const out = typeof values.out === "string" ? resolve(context.baseDir, values.out) : undefined;
  if (out !== undefined) {
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, ek.stabilaJson(mankoj));
  }
  if (values.json === true) {
    context.stdout(`${JSON.stringify({ mankoj }, null, 2)}\n`);
  } else {
    context.stdout(
      [
        `${COMMAND_LINE} ${MANKOJ_MODUSO}: ${mankoj.length} Lücken aus ${dosierujoj.length} Ordner(n)`,
        "",
        ek.mankojMarkdown(mankoj).trimEnd(),
        ...(out === undefined ? [] : ["", `Geschrieben: ${out}`]),
        "",
      ].join("\n"),
    );
  }
  return EXIT_OK;
}

function legiMaksTokenojn(valoro: string | boolean | (string | boolean)[] | undefined): number {
  if (valoro === undefined) return EKRANOJ_MAKS_TOKENOJ;
  const teksto = String(Array.isArray(valoro) ? valoro.at(-1) : valoro).trim();
  const nombro = Number(teksto);
  if (!/^\d+$/.test(teksto) || !Number.isSafeInteger(nombro) || nombro <= 0) {
    throw new UsageError(`--max-tokens takes a whole number of tokens > 0, got "${teksto}".`, [
      `The default is ${EKRANOJ_MAKS_TOKENOJ}.`,
    ]);
  }
  return nombro;
}

/** The summary of a run for the console and `--json`. */
function resumoDe(rezulto: EkranojRezulto, marko: string, verdaj: number): Record<string, unknown> {
  return {
    dir: rezulto.dir,
    superrigardo: pathToFileURL(join(rezulto.dir, "superrigardo.html")).href,
    raporto: pathToFileURL(join(rezulto.dir, "raporto.md")).href,
    raportoJson: join(rezulto.dir, "raporto.json"),
    marko,
    ekranoj: rezulto.plano.ekranoj.length,
    faritajRondoj: rezulto.faritajRondoj ?? 0,
    verdaj,
    haltigo: rezulto.haltigo ?? null,
    tokenoj: { enigo: rezulto.peno.inputTokens, eligo: rezulto.peno.outputTokens },
    anfragoj: rezulto.peno.requests,
    usd: rezulto.kosto.usd ?? null,
  };
}

async function run(
  args: readonly string[],
  context: CliContext,
  medio: EkranojMedio,
): Promise<number> {
  const { values, positionals } = parseFlags(args, FLAGS, COMMAND_LINE);
  if (positionals[0] === MANKOJ_MODUSO) return kuriMankojn(positionals.slice(1), values, context);
  if (positionals.length !== 1 || (positionals[0] ?? "").trim() === "") {
    throw new UsageError(
      `\`${COMMAND_LINE}\` takes exactly one sentence (Satz), got ${positionals.length} argument(s).`,
      [
        `Put the sentence in quotes: ${COMMAND_LINE} "Eine Verwaltung für Standards mit Liste und Detail".`,
      ],
    );
  }
  const frazo = (positionals[0] ?? "").trim();
  const maksTokenoj = legiMaksTokenojn(values["max-tokens"]);
  const nomoj =
    typeof values.ekranoj === "string"
      ? values.ekranoj
          .split(",")
          .map((nomo) => nomo.trim())
          .filter((nomo) => nomo !== "")
      : undefined;
  const config =
    typeof values.config === "string" ? resolve(context.baseDir, values.config) : undefined;
  if (config !== undefined && !existsSync(config)) {
    throw new UsageError(`The config ${config} does not exist.`, [
      "Pass a project's fundamento.config.json, or leave --config out for komuna.",
    ]);
  }
  const json = values.json === true;
  const ek = await import("@fundamento/ekranoj");

  // V-2 and the rest of the input before anything else; the Gvidanto is started by this command
  // after the confirmation, so its absence is not a problem here.
  const marko = medio.markoNomo(config);
  const radiko = join(context.baseDir, DEFAULT_DIR);
  const out =
    typeof values.out === "string"
      ? resolve(context.baseDir, values.out)
      : join(radiko, kuroNomo(medio.nun(), frazoSlug(frazo, ek.slugDe), radiko));
  const ledger =
    typeof values.ledger === "string" ? resolve(context.baseDir, values.ledger) : radiko;
  const enigo: EkranojEnigo = {
    frazo,
    marko,
    out,
    maksTokenoj,
    ...(nomoj === undefined ? {} : { ekranoj: nomoj }),
    varianto: "F",
    lingvo: "de",
  };
  const problemoj = ek.kontroliEnigon(enigo).filter((p) => p.rule !== "gvidanto-missing");
  if (problemoj.length > 0) {
    for (const problemo of problemoj) context.stderr(`${COMMAND_LINE}: ${formati(problemo)}\n`);
    context.stderr("Nothing was started.\n");
    return EXIT_USAGE;
  }

  // The .env and the model guard (D-19), before any request can be made.
  const envDosiero = resolve(context.baseDir, typeof values.env === "string" ? values.env : ".env");
  const agordoj = medio.legiEnv(envDosiero);
  if (agordoj === undefined) {
    context.stderr(
      `${COMMAND_LINE}: no .env at ${envDosiero}. Create it with FM_KI_ANBIETER, FM_KI_MODELL and the key, or pass --env <file>.\n`,
    );
    return EXIT_USAGE;
  }
  let provider: Provider;
  try {
    provider = providerOf(agordoj);
    const malpermesoj = ek.kontroliModelon(provider);
    if (malpermesoj.length > 0) {
      for (const problemo of malpermesoj) context.stderr(`${COMMAND_LINE}: ${formati(problemo)}\n`);
      return EXIT_USAGE;
    }
  } catch (eraro) {
    // providerOf names the variable that is missing, never a value.
    context.stderr(`${COMMAND_LINE}: ${mesagxoDe(eraro)}\n`);
    return EXIT_USAGE;
  }
  const redakti = (teksto: string): string => provider.redact(teksto);
  const log = (linio: string): void => context.stderr(`${redakti(linio)}\n`);

  // The estimate (D-20) and the confirmation (D-37).
  const takso = ek.taksoPorEnigo(enigo, provider.toString());
  (json ? context.stderr : context.stdout)(`${takso.satz}\n`);
  if (values.ja !== true) {
    if (!medio.tty()) {
      context.stderr(
        `${COMMAND_LINE}: without a terminal the run starts only with --ja (estimate above). Nothing was started.\n`,
      );
      return EXIT_USAGE;
    }
    if (!(await medio.demandi("Lauf starten? [j/N] "))) {
      context.stderr(`${COMMAND_LINE}: not confirmed. Nothing was started.\n`);
      return EXIT_USAGE;
    }
  }

  let gvidanto: GvidantoKonekto | undefined;
  let bildigilo: Bildigilo | undefined;
  let rezulto: EkranojRezulto;
  try {
    const chat = await medio.chat({ provider, ledger, log });
    gvidanto = await medio.gvidanto({ config, log });
    const taksilo = await medio.taksilo({ config });
    const markoKonstruo = await medio.marko({ config, marko });
    bildigilo = await medio.bildigilo({ log });
    const commit = medio.commit();
    rezulto = await ek.kuruEkranojn(enigo, {
      chat,
      tools: gvidanto.ponto,
      taksilo,
      ...(bildigilo === undefined ? {} : { bildigilo }),
      marko: markoKonstruo,
      nun: () => medio.nun(),
      log,
      eligo: ek.eligoDe({ ...(commit === undefined ? {} : { commit }), redakti }),
    });
  } catch (eraro) {
    // Only setup errors are thrown (input, model, Gvidanto, brand build); the run itself ends
    // with a stop reason instead.
    context.stderr(`${COMMAND_LINE}: ${redakti(mesagxoDe(eraro))}\n`);
    return EXIT_USAGE;
  } finally {
    await bildigilo?.close();
    await gvidanto?.fermi();
  }

  const verdaj = [...ek.finajStatoj(rezulto).values()].filter((stato) => stato.verda).length;
  const resumo = resumoDe(rezulto, marko, verdaj);
  const konstruita = (rezulto.faritajRondoj ?? 0) > 0;
  if (json) {
    context.stdout(`${redakti(JSON.stringify(resumo, null, 2))}\n`);
  } else {
    const kosto =
      rezulto.kosto.usd === undefined ? "Kosten unbekannt" : `${rezulto.kosto.usd.toFixed(4)} $`;
    const halto =
      rezulto.haltigo === undefined
        ? ""
        : ` · Halt: ${rezulto.haltigo}${konstruita ? " (Teilergebnis)" : ""}`;
    context.stdout(
      redakti(
        [
          `${COMMAND_LINE}: ${rezulto.plano.ekranoj.length} Screens (${marko}), ${rezulto.faritajRondoj ?? 0} Runden gebaut, ${verdaj} grün · Tokens ${rezulto.peno.inputTokens} ein / ${rezulto.peno.outputTokens} aus · ${kosto}${halto}`,
          `Übersicht: ${String(resumo.superrigardo)}`,
          `Bericht:   ${String(resumo.raporto)}`,
          "",
        ].join("\n"),
      ),
    );
  }
  return konstruita ? EXIT_OK : EXIT_FAIL;
}

/** The command with its dependencies; parts not given are the real ones. */
export function ekranojKomando(anstatauxoj: Partial<EkranojMedio> = {}): Command {
  let medio: EkranojMedio | undefined;
  return {
    name: "ekranoj",
    summary: "Build up to five linked, self-checked screens from one sentence (Spec 037).",
    help: EKRANOJ_HELPO,
    run: (args, context) => {
      medio ??= { ...realaMedio(), ...anstatauxoj };
      return run(args, context, medio);
    },
  };
}

export const ekranoj: Command = ekranojKomando();
