// The local server of the Metiejo (Spec 023, K-1, §4.3, §4.5, M-7): loopback only, one process on
// the maintainer's machine. It renders the screens, keeps the draft of a brand in memory and on
// disk (entwurf.json), derives the preview and the check, writes the save and the exports, and
// talks to the private font repository — the browser talks to nothing but this server. It logs
// and answers no value of the .env; the settings reach the screens as "set" or "not set".

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";
import {
  ADJUSTABLE_RULES,
  type Agordo,
  type Derivation,
  readAgordo,
  reglerOf,
} from "@fundamento/agordilo";
import {
  buildModelo,
  defaultModeloSource,
  eroKontrastParojOf,
  kontrastSojlojOf,
  type Modelo,
  readDtcgColor,
  readFacetoj,
  reguloIn,
  resolveCombination,
  serializeCanonicalJson,
  type ValidationIssue,
  WCAG2_METRIC,
} from "@fundamento/modelo";
import { CSS_CELO } from "@fundamento/projekcioj";
import {
  cssSpeicherOf,
  type PruefEintrag,
  type PruefTor,
  pruefRechnungOf,
  pruefSpeicherOf,
} from "./ableitungen.js";
import { avertoOf, KONFIRMO_TEKSTO } from "./asistanto/averto.js";
import { babili } from "./asistanto/babilo.js";
import { asistantoScreen } from "./asistanto/ekrano.js";
import {
  aktionsWortOf,
  istZweitfarbe,
  Laborejo,
  SEKUNDO_NOT_ACTION,
  zweitfarbeAblehnungOf,
  zweitfarbeAlsAktionOf,
} from "./asistanto/iloj.js";
import { Budget, CostLimitReached, type Fetch, type Provider } from "./asistanto/ki.js";
import {
  appendKroniko,
  type KronikoEro,
  type KronikoInput,
  readKroniko,
} from "./asistanto/kroniko.js";
import {
  AnfragoLedger,
  DayLimitReached,
  type Limoj,
  mergeLedger,
  Pordisto,
} from "./asistanto/limoj.js";
import {
  facetojOfAgordoDiff,
  freigabeOf,
  type Vollstaendigkeit,
  vollstaendigkeitOf,
} from "./asistanto/stato.js";
import { kahelojElProponoj, kahelojElTrovoj } from "./buehne.js";
import { pruefmarkojOf, pruefungHtml } from "./buehne-pruefung.js";
import { buildOf, expertHinweis, standOf } from "./eksperto.js";
import { EKSPORTO_CELOJ, type EksportoCelo, exportMarko } from "./eksporto.js";
import { type Bildilo, playwrightBildilo } from "./enportilo/bildilo.js";
import {
  legiMaterialon,
  lesefehlerSatzOf,
  MATERIALO_DIR,
  readProponoj,
  takeProponon,
  writeProponoj,
} from "./enportilo/materialo.js";
import { proponojOf } from "./enportilo/rekono.js";
import type { Trovo } from "./enportilo/trovo.js";
import {
  offeneSaetzeOf,
  readVorschlagoj,
  uebernahmeOf,
  writeVorschlagoj,
} from "./enportilo/uebernahme/index.js";
import type { Settings } from "./env.js";
import { esplori } from "./esploro/esploro.js";
import { GrafeoEraro, grafeoDe, grafeoDePaket, serializeGrafeo } from "./grafeo.js";
import { EKZEMPLO_DIR, paketoDosieroj } from "./grafeo-fontoj.js";
import { CLIENT_SCRIPT, escapeHtml, grafeoScreen, previewDocument } from "./html.js";
import { identOf } from "./ident.js";
import { type Klartext, klartextOf, satzOf, vorschlagOf } from "./klartext.js";
import {
  komponentoList,
  komponentoRefOf,
  komponentoScreen,
  komponentoView,
  zeloOf,
} from "./komponentoj.js";
import { knownFonts } from "./kontrolo.js";
import { kreiloScreen } from "./kreilo/ekrano.js";
import { describeKaraktero, kreiloProponoj } from "./kreilo/kreilo.js";
import {
  createMarko,
  listMarkoj,
  MARKEN_DIR,
  type MetiejoIssue,
  markoDir,
  readMarko,
  safeFilename,
  saveMarko,
  storeUpload,
  writeDraft,
} from "./marko.js";
import {
  type MessRoute,
  type MessSenke,
  type Messung,
  messungOf,
  OHNE_MESSUNG,
} from "./messung.js";
import { NORDSTELO_DIR, type NordsteloHistorio, nordsteloScreen } from "./nordstelo.js";
import { transkribi } from "./parolo/parolo.js";
import { type PrivataDeps, privataState, uploadFont } from "./privata.js";
import {
  composeDraft,
  isStudioPage,
  kombinationOf,
  mitRueckmeldung,
  type StudioGroup,
  type StudioRueckmeldung,
  studioAenderungen,
  studioFeedback,
  studioRows,
  studioScreen,
} from "./studio.js";
import {
  FORM_WAHL,
  isSxtupoKey,
  klartextHtml,
  nextOf,
  type ScreenInput,
  type SxtupoKey,
  screen,
} from "./sxtupoj.js";
import {
  lokaMezurojOf,
  mezurojOf,
  nordsteloRapidoj,
  notiLokan,
  readKronikoj,
  STARTO,
  type Takso,
  taksi,
  taksoSatz,
  type Vojo,
  type Zugo,
  zaehlilo,
  zaehliloSatz,
} from "./takso/takso.js";
import { fontFaceCss, fontoOf, licencedFonto, readTiparoj, searchTiparoj } from "./tiparoj.js";
import type { NpmDeps } from "./tiparoj-npm.js";
import {
  type Bases,
  checkDraft,
  komunaCss,
  loadBases,
  previewCssInTeilen,
  startAgordo,
} from "./vorschau.js";
import { previewBody } from "./vorschau-korpo.js";

/** Spec 033 S6: the requests of the UTC day per provider, beside the brands. */
export const ANFRAGOJ_FILE = ".anfragoj.json";
export const HTTP_HOST = "127.0.0.1";

export interface ServiloOptions {
  /** 0 picks a free port. */
  port: number;
  /** The brands (FM_MARKEN_DIR, never inside the checkout). */
  workdir: string;
  /** The checkout root: the .env, the Vitrino of `fm projekcioj build`. */
  root: string;
  settings: Settings;
  /** The private repository; absent without FM_TIPAROJ_REPO. */
  deps?: PrivataDeps;
  /** npm for the files of the webfonts (O-4); absent in tests. */
  npm?: NpmDeps;
  /** The commit the Metiejo runs on (Nachlese 10 N-5); default: the checkout's, unknown outside one. */
  stand?: string;
  /**
   * The language model of the Asistanto (Spec 033 S1): the provider of the .env with its key, held
   * on this server only; absent without FM_KI_ANBIETER, FM_KI_MODELL and the key, then `satz` says
   * what is missing. `fetch` and `sleep` for tests.
   */
  ki?: {
    provider?: Provider;
    satz?: string;
    fetch?: Fetch;
    sleep?: (ms: number) => Promise<void>;
    /** Tokens one chat turn may use at most (Kostengrenze); default 60 000. */
    limo?: number;
    /**
     * Spec 033 S6: the limits of the provider (requests per second and per UTC day); start.ts passes
     * LIMOJ of the provider. The requests of the day are counted in marken/.anfragoj.json.
     */
    limoj?: Limoj;
  };
  /**
   * Spec 033 S5: speech in over Voxtral – the Mistral provider with the transcription model, from
   * MISTRAL_API_KEY; absent without it (the browser's Web Speech API takes over). `fetch` for tests.
   */
  parolo?: { provider?: Provider; satz?: string; fetch?: Fetch };
  /**
   * Spec 033 S4: how the research agent reaches public pages; a test passes its own. Spec 035 4.1:
   * the browser that renders them and decodes a JPG or WebP upload (4.5.6) – default Playwright,
   * imported on the first need; a test passes a double.
   */
  esploro?: { fetch?: (url: string, init?: RequestInit) => Promise<Response>; bildilo?: Bildilo };
  /**
   * Spec 044 (V-2): where the time of `/pruefung`, `stato`, the preview and the Asistanto goes, one
   * entry per step when the response is finished; absent, nothing is measured.
   */
  messung?: MessSenke;
  /**
   * Spec 044 (V-3): a test seam awaited inside the shared check before it computes, once per
   * computation; absent in production (no await, no difference).
   */
  pruefTor?: PruefTor;
  /**
   * Spec 044 T3 (D-02): the module of the check's worker thread; a test passes its own. Default: the
   * one beside the server in the built package; where it is missing (the TS source under Vitest)
   * the check runs in the main thread.
   */
  pruefWorker?: URL;
  /**
   * Spec 047 (NE-1): the dist dir of @fundamento/nodredaktilo, where `leinwand.js` lies; null = not
   * built (the canvas routes answer 503). Default: resolved beside the Eroj, null where the package
   * cannot be resolved or `dist/leinwand.js` is missing.
   */
  leinwand?: string | null;
  /**
   * Spec 047 (NE-1): the dir of the ekzemplo fixture package; null = absent (outside a checkout,
   * `/api/grafeo?aspekto=ekzemplo` answers 404). Default: EKZEMPLO_DIR.
   */
  ekzemploDir?: string | null;
}

export interface ServiloIo {
  stderr(text: string): void;
}

export interface Servilo {
  url: string;
  port: number;
  close(): Promise<void>;
}

interface Draft {
  agordo: Agordo;
  rev: number;
  /** The check of the draft's rev (Spec 044, V-5): one shared computation per change. */
  pruefung?: PruefEintrag;
  upload?: { filename: string; family: string; path: string };
  privataResult?: string;
  eksporto?: { sentences: string[]; issues: string[] };
  /** Spec 035 Teil 3: what the last sending of a Studio page's formularo did, numbered. */
  studio?: { n: number; rueckmeldung: StudioRueckmeldung };
}

const TYPES: Readonly<Record<string, string>> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

/** The images of a brand's material a proposal shows as its crop (Spec 035, Befund 4.5.1). */
const MATERIALO_BILDOJ: Readonly<Record<string, string>> = {
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const LOOPBACK = [HTTP_HOST, "localhost", "[::1]"];

/** The groups of the Agordo a draft patch may touch. */
const PATCHABLE = new Set([
  "leitfarbe",
  "zusatzfarben",
  "neutral",
  "regler",
  "schriften",
  "form",
  "raum",
  "schrift",
  "ikono",
  "ziele",
  "festgelegt",
  "etikedoj",
  "zweitfarbe",
]);

/** An Agordo with a proposal laid over it: objects merged one level deep, values replaced. */
export function mergedAgordo(agordo: Agordo, patch: Partial<Agordo>): Agordo {
  const next: Record<string, unknown> = { ...agordo };
  for (const [key, value] of Object.entries(patch)) {
    const before = next[key];
    next[key] =
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      typeof before === "object" &&
      before !== null
        ? { ...(before as Record<string, unknown>), ...(value as Record<string, unknown>) }
        : value;
  }
  return next as unknown as Agordo;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** A patch applied to an Agordo: a group merges, null removes, an empty group goes. */
export function patched(agordo: Agordo, patch: Record<string, unknown>): Agordo {
  const next = structuredClone(agordo) as unknown as Record<string, unknown>;
  for (const [key, value] of Object.entries(patch)) {
    if (!PATCHABLE.has(key)) continue;
    // Spec 036, Befund 2.2: the Zweitfarbe is one value with its origin – replaced as a whole (a
    // colour typed by hand has none); null or an empty colour removes it („Keine Zweitfarbe“).
    if (key === "zweitfarbe") {
      if (value === null || (isRecord(value) && (value.farbe === "" || value.farbe === null)))
        delete next[key];
      else next[key] = value;
      continue;
    }
    if (value === null) {
      delete next[key];
      continue;
    }
    if (isRecord(value)) {
      const group = { ...(isRecord(next[key]) ? next[key] : {}) };
      for (const [field, fieldValue] of Object.entries(value)) {
        if (fieldValue === null) delete group[field];
        else group[field] = fieldValue;
      }
      if (Object.keys(group).length === 0) delete next[key];
      else next[key] = group;
      continue;
    }
    next[key] = value;
  }
  return next as unknown as Agordo;
}

function readBody(request: IncomingMessage, limit = 32 * 1024 * 1024): Promise<string> {
  return new Promise((done, fail) => {
    const chunks: Buffer[] = [];
    let size = 0;
    request.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > limit) {
        fail(new Error("the request body is too large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => done(Buffer.concat(chunks).toString("utf8")));
    request.on("error", fail);
  });
}

/** The German sentence of an issue the start screen shows. */
function problemSentence(issue: MetiejoIssue | ValidationIssue, name: string): string {
  if (issue.rule === "name-invalid") {
    return `„${name}“ ergibt keine Kennung: Der Name braucht mindestens einen Buchstaben oder eine Ziffer, zum Beispiel „Quendolin“ (Kennung quendolin).`;
  }
  if (issue.rule === "marko-exists")
    return `Die Marke „${name}“ gibt es schon. Öffne sie unter „Vorhandene Marke öffnen“.`;
  return issue.message;
}

/** K-5 (Spec 024): the choice of the form as a radius factor, the pill as a set alias of the control role. */
export function withFormWahl(agordo: Agordo, wahl: string): Agordo {
  const choice = FORM_WAHL.find((entry) => entry.key === wahl);
  if (choice === undefined) return agordo;
  const next = patched(agordo, { form: { radius: choice.radius } });
  const festgelegt = { ...(next.festgelegt ?? {}) };
  if (wahl === "ganz-rund") festgelegt["radius.role.control"] = { alias: "radius.full" };
  else delete festgelegt["radius.role.control"];
  if (Object.keys(festgelegt).length === 0) {
    const { festgelegt: _gone, ...rest } = next;
    return rest as Agordo;
  }
  return { ...next, festgelegt };
}

/** A colour the Studio sets, as hex text, as a DTCG colour of the set. */
function colourWert(text: string): unknown {
  const hex = /^#[0-9a-f]{6}$/i.exec(text)?.[0]?.toLowerCase();
  if (hex === undefined) return text;
  const components = [1, 3, 5].map(
    (index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255,
  );
  return {
    colorSpace: "srgb",
    components: components.map((c) => Math.round(c * 10_000) / 10_000),
    hex,
  };
}

/** The family a font file is called after: the name without extension, hyphens as spaces. */
export function familyOfFilename(filename: string): string {
  return filename
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

/** Spec 047 (NE-1): the dist dir of the built canvas, or null when it is not there. */
function leinwandDist(): string | null {
  try {
    const dir = join(
      dirname(fileURLToPath(import.meta.resolve("@fundamento/nodredaktilo/package.json"))),
      "dist",
    );
    return existsSync(join(dir, "leinwand.js")) ? dir : null;
  } catch {
    return null;
  }
}

/** Spec 047 (NE-1): the answer of every canvas route while the bundle is missing. */
const LEINWAND_NICHT_GEBAUT =
  "<!doctype html><title>503</title><p>Leinwand nicht gebaut: pnpm --filter @fundamento/nodredaktilo build";

export async function startServilo(options: ServiloOptions, io: ServiloIo): Promise<Servilo> {
  const bases: Bases = loadBases();
  const tiparoj = readTiparoj();
  const drafts = new Map<string, Draft>();
  // Spec 044 (V-5): the check per draft and rev, the stylesheet of the preview per brand, rev and
  // proposal; each computed once and shared by the requests that ask while it runs. T3: the check
  // runs in a worker thread, started right after the URL line (B-10) or else on its first need, the
  // stylesheet in parts in the main thread – never in one queue with the check (A-04).
  const pruefRechnung = pruefRechnungOf((agordo) => checkDraft(agordo, bases), options.pruefWorker);
  const pruefSpeicher = pruefSpeicherOf(pruefRechnung.rechner, options.pruefTor);
  const cssSpeicher = cssSpeicherOf(
    (agordo, messung) => previewCssInTeilen(agordo, bases, messung),
    (marke) => drafts.get(marke)?.rev,
  );
  const erojDist = join(
    dirname(fileURLToPath(import.meta.resolve("@fundamento/eroj/package.json"))),
    "dist",
  );
  // Spec 047 (NE-1): the bundle of the canvas and the package graphs. The bundle is a devDependency,
  // so outside the checkout it does not resolve: then the canvas is "not built". The graph API never
  // depends on it. A package graph does not change while the process runs; it is built once per label.
  const leinwand = options.leinwand !== undefined ? options.leinwand : leinwandDist();
  const ekzemploDir = options.ekzemploDir !== undefined ? options.ekzemploDir : EKZEMPLO_DIR;
  const paketoGrafeoj = new Map<string, string>();
  const markoGrafeoj = new Map<string, { rev: number; korpo: string }>();
  const paketoStiloj = new Map<string, string>();
  const vitrinoDir = join(options.root, ".fundamento", "projekcioj", "vitrino");
  const nordsteloDir = join(options.root, ...NORDSTELO_DIR);
  const stand = options.stand ?? standOf(options.root);
  const privata = privataState(options.settings);
  const ikonoGewichte = ["regular", ...Object.keys(bases.structure.ikonoGewichte?.glyphs ?? {})];
  const regler = reglerOf(bases.gestalt);
  // Spec 033 S1: the brand model and the chat of each brand; S6: its counter is read from the Kroniko.
  const facetojFile = readFacetoj(defaultModeloSource().dataDir);
  if (facetojFile === undefined) throw new Error("data/facetoj.json fehlt im Modelo.");
  const facetoj = facetojFile;
  const babiloj = new Map<string, { role: "user" | "assistant"; content: string }[]>();
  const redact = (text: string): string => options.ki?.provider?.redact(text) ?? text;
  const kroniko = (name: string, entry: KronikoInput): KronikoEro =>
    appendKroniko(options.workdir, name, entry, redact);
  /**
   * A turn of the model that ended in an error (Nachlese 12 B-4): it goes into the Kroniko with what
   * it spent itself – the `kosto` the turn put on its error – so the counter counts it, and nothing
   * of the turns beside it. Without a cost on the error nothing was asked of the provider.
   */
  const failedTurn = (name: string, entry: KronikoInput, error: unknown, satz: string): void => {
    const kosto = (error as { kosto?: KronikoInput["kosto"] }).kosto;
    if (kosto === undefined) return;
    kroniko(name, { ...entry, kosto, detaloj: { ...(entry.detaloj ?? {}), eraro: satz } });
  };
  // Spec 033 S6: the gate of the provider's limits, the requests of the UTC day beside the brands.
  const gate = (() => {
    const limoj = options.ki?.limoj;
    const provider = options.ki?.provider;
    if (limoj === undefined || provider === undefined) return undefined;
    const file = join(options.workdir, ANFRAGOJ_FILE);
    const ledger = new AnfragoLedger(
      existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as Record<string, number>) : {},
    );
    return new Pordisto(limoj, ledger, {
      now: () => Date.now(),
      sleep: options.ki?.sleep ?? ((ms) => new Promise((done) => setTimeout(done, ms))),
      provider: provider.name,
      // Nachlese 12 ②: another server or run may have counted meanwhile; the file is merged, not
      // overwritten, and the gate counts on with what the file says.
      counted: () => {
        mkdirSync(options.workdir, { recursive: true });
        const onDisk = existsSync(file)
          ? (JSON.parse(readFileSync(file, "utf8")) as Record<string, number>)
          : {};
        Object.assign(ledger.entries, mergeLedger(onDisk, ledger.entries));
        writeFileSync(file, `${JSON.stringify(ledger.entries, null, 2)}\n`);
      },
    });
  })();
  const gated = gate === undefined ? {} : { gate };
  // Spec 035 4.1 (AC-11): creating the renderer loads nothing; Playwright comes with the first page.
  const bildilo = options.esploro?.bildilo ?? playwrightBildilo();
  const zaehliloOf = (name: string) => {
    const sum = zaehlilo(readKroniko(options.workdir, name));
    return { ...sum, satz: zaehliloSatz(sum) };
  };
  let rapidoj: Map<string, number> | undefined;
  /** The estimates for the model of the .env: per path and per turn, each with its line. */
  const taksojOf = () => {
    const modelo = options.ki?.provider?.toString() ?? STARTO.modelo;
    rapidoj ??= nordsteloRapidoj(join(options.root, ".fundamento", "nordstelo"));
    const speeds = rapidoj;
    const kronikoj = readKronikoj(options.workdir);
    const mezuroj = mezurojOf(kronikoj);
    const lokaj = lokaMezurojOf(kronikoj);
    const withSatz = (takso: Takso) => ({ ...takso, satz: taksoSatz(takso) });
    const of = (input: { vojo: Vojo } | { zugo: Zugo }) =>
      withSatz(taksi({ ...input, modelo, mezuroj, lokaj, rapidoj: speeds }));
    return {
      modelo,
      vojoj: { A: of({ vojo: "A" }), B: of({ vojo: "B" }), C: of({ vojo: "C" }) },
      zugoj: {
        kreilo: of({ zugo: "kreilo" }),
        babilo: of({ zugo: "babilo" }),
        parolo: of({ zugo: "parolo" }),
        esploro: of({ zugo: "esploro" }),
        materialo: of({ zugo: "materialo" }),
      },
    };
  };

  const draftOf = (name: string): Draft | undefined => {
    const held = drafts.get(name);
    if (held !== undefined) return held;
    const marko = readMarko(options.workdir, name);
    if (marko === undefined) return undefined;
    const draft: Draft = { agordo: marko.draft, rev: 1 };
    drafts.set(name, draft);
    return draft;
  };

  /**
   * Every change of a draft goes through here (Spec 033 S1): a new rev, the draft on disk, and one
   * Kroniko entry per Faceto it touched, with its source – the sliders of Schnellstart and Studio,
   * or the chat with its model.
   */
  const setDraft = (
    name: string,
    draft: Draft,
    agordo: Agordo,
    fonto: KronikoEro["fonto"] = "regilo",
    modelo?: string,
  ): void => {
    const before = draft.agordo;
    draft.agordo = agordo;
    draft.rev++;
    writeDraft(options.workdir, name, agordo);
    for (const faceto of facetojOfAgordoDiff(facetoj, modeloOf(), before, agordo)) {
      kroniko(name, { ago: "sxangxo", fonto, faceto, ...(modelo === undefined ? {} : { modelo }) });
    }
  };

  const expertOf = (agordo: Agordo): ScreenInput["expert"] => {
    if (!existsSync(join(vitrinoDir, "index.html"))) {
      return {
        sentence:
          "Die Expertenansicht ist die Werkstatt der Vitrino mit allen Reglern und dem vollständigen Bericht. Baue sie einmal im Checkout: pnpm fm projekcioj build --out .fundamento/projekcioj – danach steht hier der Link.",
      };
    }
    const fragment = deflateRawSync(Buffer.from(JSON.stringify(agordo), "utf8")).toString(
      "base64url",
    );
    const hinweis = expertHinweis(buildOf(join(vitrinoDir, "..")), stand);
    return {
      href: `/vitrino/index.html#aspekto=komuna&modus=werkstatt&agordo=${fragment}`,
      ...(hinweis === undefined ? {} : { hinweis }),
    };
  };

  /** The input of a screen; `stand` is the draft as a request found it (Spec 044, V-5.4). */
  const inputOf = (
    key: SxtupoKey,
    name: string | undefined,
    extra: Partial<ScreenInput> = {},
    stand?: Pick<Draft, "agordo" | "rev">,
  ): ScreenInput => {
    const draft = name === undefined ? undefined : (stand ?? draftOf(name));
    const marko = name === undefined ? undefined : readMarko(options.workdir, name);
    const input: ScreenInput = {
      sxtupo: key,
      markoj: listMarkoj(options.workdir),
      privata: { locked: privata.locked, sentence: privata.sentence },
      expert: expertOf(draft?.agordo ?? { name: "", leitfarbe: "#000000" }),
      regler,
      ikonoGewichte,
      ...(name === undefined ? {} : { averto: avertoOf(fremdaOf(name)) }),
      ...extra,
    };
    if (name !== undefined && draft !== undefined && marko !== undefined) {
      input.marko = {
        name,
        agordo: draft.agordo,
        saved: JSON.stringify(marko.agordo) === JSON.stringify(draft.agordo),
        rev: draft.rev,
      };
    }
    return input;
  };

  /**
   * The derivation with every check of a draft, once per revision (Spec 044, V-5): of the draft's
   * Agordo and rev when asked, shared by every request that asks while it runs.
   */
  const pruefungOf = (
    name: string,
    draft: Draft,
    messung: Messung = OHNE_MESSUNG,
  ): Promise<Derivation> => pruefSpeicher.pruefung(draft, name, messung);
  /**
   * The check for the synchronous tools of the Asistanto (Spec 044, A-03): the shared result when
   * it is there, else computed here as before and entered for its rev.
   */
  const pruefungJetzt = (draft: Draft): Derivation => {
    const fertig = pruefSpeicher.fertig(draft);
    if (fertig !== undefined) return fertig;
    const derivation = checkDraft(draft.agordo, bases);
    pruefSpeicher.eintragen(draft, derivation);
    return derivation;
  };
  /** The open problems of a check: a fixed rule, or an adjustable one without its Jugxo. */
  const offeneProblemeOf = (derivation: Derivation) =>
    derivation.raporto.violations.filter(
      (violation) => violation.fixed || violation.jugxo === undefined,
    );
  const problemeOf = (derivation: Derivation): number => {
    const { violations } = derivation.raporto.summary;
    return violations.fixed + violations.adjustable - violations.covered;
  };

  /** Saves the draft and writes the chosen exports (Schnellstart step 7, the Studio's Speichern). */
  const saveAndExport = async (
    name: string,
    draft: Draft,
    values: URLSearchParams,
  ): Promise<void> => {
    // Without any choice (a save without the form) every export is written.
    const chosen = EKSPORTO_CELOJ.filter((celo) => values.get(`eksporto-${celo}`) === "ja");
    const celoj: EksportoCelo[] = values.size === 0 ? [...EKSPORTO_CELOJ] : chosen;
    const today = new Date().toISOString().slice(0, 10);
    saveMarko(options.workdir, name, draft.agordo, today, bases.gestalt);
    const fonts = knownFonts(
      options.deps?.cacheDir ?? join(options.root, "nenie"),
      options.workdir,
    );
    const started = Date.now();
    const written = celoj.length === 0 ? (["aspekto"] as const) : celoj;
    const result = await exportMarko(options.workdir, name, draft.agordo, bases, {
      celoj: written,
      fonts,
      ...(options.npm === undefined ? {} : { npm: options.npm }),
    });
    // Constitution v2.5, Art. VI: the notice before the export, with the export in the Kroniko.
    kroniko(name, {
      ago: "averto",
      fonto: "sistemo",
      teksto: avertoOf(fremdaOf(name)),
      detaloj: { celoj },
    });
    // Spec 033 S6 (O-10): the duration of a written export, for the estimate of the local time.
    if (result.ok)
      notiLokan(options.workdir, name, {
        pasxo: "eksporto",
        ms: Date.now() - started,
        ...(result.partoj === undefined ? {} : { partoj: result.partoj }),
        celoj: written,
      });
    draft.eksporto = {
      sentences: result.ok ? result.sentences : [],
      issues: result.ok
        ? []
        : result.issues.map((issue) => `${issue.message} (${issue.suggestion})`),
    };
  };

  const klartextOfDraft = async (
    name: string,
    draft: Draft,
    messung: Messung = OHNE_MESSUNG,
  ): Promise<Klartext> => {
    const { raporto } = await pruefungOf(name, draft, messung);
    return messung.schritt("css-js", () => klartextOf(raporto));
  };

  /** The origin of a token in a draft, as the Studio shows it. */
  const herkunftOf = (agordo: Agordo, token: string): string => {
    if (agordo.festgelegt?.[token] !== undefined) return "gesetzt";
    return composeDraft(agordo, bases).derived.has(token) ? "abgeleitet" : "struktur";
  };

  /**
   * The Studio sets a token (Spec 024, § 4, Grenze 1, M-5): a value or an alias, per Dimensio
   * condition, a display name, or takes a setting back. A value that breaks a fixed rule is not
   * taken: one sentence why, one suggestion. An adjustable rule is taken and needs a Jugxo.
   */
  /** The structure's Modelo, for the words of the Reguloj in German (once per process). */
  let structureModelo: Modelo | undefined;
  const modeloOf = (): Modelo => {
    structureModelo ??= buildModelo(bases.structure.files).modelo;
    return structureModelo;
  };

  // Spec 033 S1: the state of the brand model of a draft – the Kroniko, and the open problems of the
  // check (a fixed rule, or an adjustable one without its Jugxo).
  // Spec 044 (V-5.4): of the draft as the request found it – its Agordo and Kroniko at the start,
  // the check of that rev.
  const statoOf = async (
    name: string,
    draft: Draft,
    messung: Messung = OHNE_MESSUNG,
  ): Promise<Vollstaendigkeit> => {
    const modelo = modeloOf();
    const agordo = draft.agordo;
    const kroniko = readKroniko(options.workdir, name);
    const probleme = offeneProblemeOf(await pruefungOf(name, draft, messung));
    return vollstaendigkeitOf({ facetoj, modelo, agordo, kroniko, probleme });
  };
  /**
   * For a change: the state of the draft as it is when the change goes on; its rev may move while
   * the check runs, then the state of the new rev.
   */
  const statoJetzt = async (name: string, draft: Draft): Promise<Vollstaendigkeit> => {
    for (;;) {
      const rev = draft.rev;
      const stato = await statoOf(name, draft);
      if (draft.rev === rev) return stato;
    }
  };

  /** The foreign brand the brand builds on, and whether its confirmation came after (Art. VI, 1). */
  const fremdaOf = (
    name: string,
  ): { kiel: string; nomo?: string; konfirmita: boolean } | undefined => {
    let fremda: { kiel: string; nomo?: string; konfirmita: boolean } | undefined;
    for (const entry of readKroniko(options.workdir, name)) {
      if (entry.ago === "fremda") {
        const detaloj = (entry.detaloj ?? {}) as { kiel?: unknown; nomo?: unknown };
        const kiel = typeof detaloj.kiel === "string" ? detaloj.kiel : "nennung";
        const nomo = typeof detaloj.nomo === "string" ? detaloj.nomo : undefined;
        fremda = { kiel, ...(nomo === undefined ? {} : { nomo }), konfirmita: false };
      }
      if (entry.ago === "konfirmo" && fremda !== undefined) fremda.konfirmita = true;
    }
    return fremda;
  };

  /**
   * The tools of the Asistanto on one draft; a change goes through setDraft with the chat as source,
   * or – a turn on the stage (Spec 036, Befund 3.2) – to the copy it works on.
   */
  const laborejoOf = (
    name: string,
    draft: Draft,
    modelo: string,
    fonto: "babilo" | "parolo" = "babilo",
    apliki: (next: Agordo) => void = (next) => setDraft(name, draft, next, fonto, modelo),
  ): Laborejo =>
    new Laborejo({
      bases,
      agordo: () => draft.agordo,
      apliki,
      probleme: () => offeneProblemeOf(pruefungJetzt(draft)),
      kroniko: () => readKroniko(options.workdir, name),
      kontrolita: true,
      pruefung: () => klartextOf(pruefungJetzt(draft).raporto),
    });

  /**
   * Spec 036, Befund 3.2: a turn for a step appears on the stage first. It works on a copy of the
   * draft with the step's open proposal laid on it, so a second wish builds on the first; the draft
   * (the frame „Jetzt“) stays until „Übernehmen“.
   */
  const buehneOf = (
    name: string,
    draft: Draft,
    faceto: string,
  ): { kopio: Draft; sxangxita: boolean } => {
    const open = readProponoj(options.workdir, name).find((entry) => entry.faceto === faceto);
    const agordo =
      open === undefined
        ? draft.agordo
        : (readAgordo(mergedAgordo(draft.agordo, open.agordo)).agordo ?? draft.agordo);
    return { kopio: { agordo, rev: draft.rev }, sxangxita: false };
  };

  /**
   * What a turn changed on its copy becomes the open proposal of its step (the frame „Mit dem
   * Vorschlag“): the groups of the Agordo that differ from the draft, with the origin of the
   * proposal it builds on. The Kroniko names the chat or speech as its source.
   */
  const proponoOfBuehne = (
    name: string,
    draft: Draft,
    next: Agordo,
    turn: { faceto: string; fonto: "babilo" | "parolo"; modelo: string; satz: string },
  ): void => {
    const before = draft.agordo as unknown as Record<string, unknown>;
    const patch = Object.fromEntries(
      Object.entries(next).filter(
        ([key, value]) => JSON.stringify(value) !== JSON.stringify(before[key]),
      ),
    ) as Partial<Agordo>;
    if (Object.keys(patch).length === 0) return;
    const open = readProponoj(options.workdir, name).find((entry) => entry.faceto === turn.faceto);
    writeProponoj(options.workdir, name, [
      { faceto: turn.faceto, agordo: patch, satz: turn.satz, herkunft: open?.herkunft ?? [] },
    ]);
    kroniko(name, {
      ago: "propono",
      fonto: turn.fonto,
      faceto: turn.faceto,
      teksto: turn.satz,
      modelo: turn.modelo,
    });
  };

  /**
   * One chat turn of a brand (Spec 033 S1, S5): written or spoken, the same tools, the same Kroniko,
   * with its source. The answer is the body and the status of the response.
   */
  const chatTurn = async (
    name: string,
    draft: Draft,
    teksto: string,
    faceto: string | undefined,
    fonto: "babilo" | "parolo",
    detaloj: Record<string, unknown> = {},
  ): Promise<{ status: number; body: Record<string, unknown> }> => {
    const provider = options.ki?.provider;
    const fremda = fremdaOf(name);
    if (fremda !== undefined && !fremda.konfirmita) {
      if (provider === undefined) return { status: 503, body: { satz: kiSatz() } };
      return {
        status: 409,
        body: {
          satz: "Bitte zuerst die Bestätigung: Die Marke baut auf einer bestehenden Marke auf (Art. VI).",
        },
      };
    }
    // Spec 036, Befund 2.2: the Zweitfarbe never goes on buttons, links or the focus – a wish for
    // it is refused in the person's words before any model is asked, and nothing changes.
    const ablehnung = zweitfarbeAlsAktionOf(teksto);
    if (ablehnung !== undefined) {
      babiloj.set(name, [
        ...(babiloj.get(name) ?? []),
        { role: "user", content: teksto },
        { role: "assistant", content: ablehnung },
      ]);
      kroniko(name, {
        ago: "babilo",
        fonto,
        ...(faceto === undefined ? {} : { faceto }),
        teksto,
        detaloj: { antwort: ablehnung, abgelehnt: SEKUNDO_NOT_ACTION, ...detaloj },
      });
      return {
        status: 200,
        body: {
          antwort: ablehnung,
          rev: draft.rev,
          atendoj: 0,
          sxangxoj: [],
          stato: await statoOf(name, draft),
          zaehlilo: zaehliloOf(name),
        },
      };
    }
    // Only now the model is needed (QA run 1: the refusal above answers without one).
    if (provider === undefined) return { status: 503, body: { satz: kiSatz() } };
    if (teksto === "")
      return { status: 422, body: { satz: "Schreib oder sag, was du ändern möchtest." } };
    // Spec 044 (A-03): the tools of a turn stay synchronous; the shared check of the draft is
    // awaited before the turn, so they find it. A failed check fails where it fails today (when a
    // tool or the answer needs it), so its error is not raised here.
    await pruefungOf(name, draft).catch(() => undefined);
    const historio = babiloj.get(name) ?? [];
    const buehne = faceto === undefined ? undefined : buehneOf(name, draft, faceto);
    try {
      const result = await babili({
        provider,
        laborejo:
          buehne === undefined
            ? laborejoOf(name, draft, provider.toString(), fonto)
            : laborejoOf(name, buehne.kopio, provider.toString(), fonto, (next) => {
                buehne.kopio.agordo = next;
                buehne.kopio.rev++;
                buehne.sxangxita = true;
              }),
        historio: historio.slice(-12),
        teksto,
        ...(faceto === undefined ? {} : { faceto }),
        budget: new Budget(options.ki?.limo ?? 60_000),
        ...(options.ki?.fetch === undefined ? {} : { fetch: options.ki.fetch }),
        ...(options.ki?.sleep === undefined ? {} : { sleep: options.ki.sleep }),
        ...gated,
        log: (line) => io.stderr(`${redact(line)}\n`),
      });
      babiloj.set(name, [
        ...historio,
        { role: "user", content: teksto },
        { role: "assistant", content: result.antwort },
      ]);
      kroniko(name, {
        ago: "babilo",
        fonto,
        ...(faceto === undefined ? {} : { faceto }),
        teksto,
        modelo: provider.toString(),
        kosto: result.kosto,
        detaloj: {
          antwort: result.antwort,
          iloj: result.iloj,
          atendoj: result.atendoj,
          ...detaloj,
        },
      });
      if (buehne?.sxangxita === true && faceto !== undefined)
        proponoOfBuehne(name, draft, buehne.kopio.agordo, {
          faceto,
          fonto,
          modelo: provider.toString(),
          satz: result.antwort,
        });
      return {
        status: 200,
        body: {
          antwort: result.antwort,
          rev: draft.rev,
          kosto: result.kosto,
          atendoj: result.atendoj,
          sxangxoj: result.sxangxoj,
          stato: await statoOf(name, draft),
          zaehlilo: zaehliloOf(name),
        },
      };
    } catch (error) {
      const failed: KronikoInput = {
        ago: "babilo",
        fonto,
        ...(faceto === undefined ? {} : { faceto }),
        teksto,
        modelo: provider.toString(),
        ...(Object.keys(detaloj).length === 0 ? {} : { detaloj }),
      };
      if (error instanceof DayLimitReached) {
        const satz = dayLimitSatz(error);
        failedTurn(name, failed, error, satz);
        return { status: 429, body: { satz } };
      }
      const satz =
        error instanceof CostLimitReached
          ? `Die Kostengrenze dieser Runde ist erreicht (${error.limit} Tokens). Formuliere den Wunsch kürzer oder in mehreren Schritten.`
          : redact(error instanceof Error ? error.message : String(error));
      failedTurn(name, failed, error, satz);
      return { status: 502, body: { satz } };
    }
  };

  const dayLimitSatz = (error: DayLimitReached): string =>
    `Tageslimit von ${error.provider} erreicht (${error.limit} Anfragen am UTC-Tag). Morgen geht es weiter; bis dahin wirken Studio und Regler ohne Sprachmodell.`;

  const kiSatz = (): string =>
    options.ki?.satz ??
    "Kein Sprachmodell eingerichtet: Setze FM_KI_ANBIETER, FM_KI_MODELL und den Schlüssel des Anbieters in der .env des Checkouts.";

  /** A sentence of a refusal in German: the rule by its German name, else its translated statement. */
  const satzDe = (violation: { rule: string; subject: string; combination?: string }): string => {
    const regulo = modeloOf().reguloj.find((entry) => entry.name === violation.rule);
    const named = satzOf(violation as Parameters<typeof satzOf>[0]);
    if (!named.startsWith(`${violation.rule} bei`) || regulo === undefined) return named;
    return `${reguloIn(modeloOf(), regulo, "de").statement} – bei ${violation.subject}${named.slice(named.indexOf(" bei ") + 5 + violation.subject.length)}`;
  };

  /**
   * The quick measure of O-3: the pairs the cell takes part in (a role: every declared pair that
   * names it; an Ero-Token: the derived pairs of the cells that depart) against the WCAG 2.x
   * threshold of their category in light and dark, default and high contrast.
   */
  const schemesThatHold = (agordo: Agordo, token: string): Set<string> => {
    const { modelo } = composeDraft(agordo, bases);
    const pairs = [
      ...modelo.kontrastParoj
        .filter((pair) => pair.foreground === token || pair.background === token)
        .map((pair) => ({
          foreground: pair.foreground,
          background: pair.background,
          kategorio: pair.kategorio,
        })),
      ...eroKontrastParojOf(modelo).map((pair) => ({
        foreground: pair.foreground,
        background: pair.background,
        kategorio: pair.kategorio,
      })),
    ];
    const holds = new Set<string>();
    for (const scheme of ["light", "dark"]) {
      let ok = true;
      for (const contrast of ["default", "high"]) {
        const assignment = { aspekto: agordo.name, "color-scheme": scheme, contrast };
        const { tokens } = resolveCombination(modelo, assignment);
        const sojloj = kontrastSojlojOf(modelo, assignment);
        for (const pair of pairs) {
          const foreground = readDtcgColor(tokens[pair.foreground]?.value);
          const background = readDtcgColor(tokens[pair.background]?.value);
          const threshold = sojloj?.wcag2[pair.kategorio];
          if (foreground === undefined || background === undefined || threshold === undefined)
            continue;
          if (WCAG2_METRIC.compute(foreground, background) < threshold) ok = false;
        }
      }
      if (ok) holds.add(scheme);
    }
    return holds;
  };

  /**
   * O-3 (Spec 024 ②): the suggestion at a refused alias on a palette step is the next step of the
   * same palette that passes, nearest first, lighter and darker alternating; at most four are
   * tried (a derivation each). Else the suggestion of the Agordilo where it is a change of the
   * Agordo (German), else the rule's translated statement.
   */
  const vorschlagDe = (
    draft: Draft,
    next: Agordo,
    token: string,
    modus: string | undefined,
    alias: string | undefined,
    violation: Parameters<typeof vorschlagOf>[0] | undefined,
    knownBefore: ReadonlySet<string>,
  ): string => {
    const step = alias === undefined ? undefined : /^color\.palette\.([a-z]+)\.(\d+)$/.exec(alias);
    if (step !== null && step !== undefined) {
      const palette = step[1] ?? "";
      const own = Number(step[2]);
      const core = modeloOf().setoj.find((set) => set.name === "core")?.tokens ?? {};
      const steps = Object.keys(core)
        .filter((candidate) => candidate.startsWith(`color.palette.${palette}.`))
        .map((candidate) => Number(candidate.split(".").at(-1)))
        .filter((candidate) => Number.isFinite(candidate) && candidate !== own)
        .sort((a, b) => Math.abs(a - own) - Math.abs(b - own) || a - b);
      // Every step of the palette, nearest first: a quick measure of the cell's contrast in the
      // four colour combinations (one composition, 0,3 s) picks the candidates, one derivation with
      // every check (1,3 s) confirms the first that passes.
      const withStep = (light: string, dark?: string): Agordo | undefined => {
        const festgelegt = { ...(next.festgelegt ?? {}) };
        const entry = { ...(festgelegt[token] ?? {}) };
        if (modus === undefined) entry.alias = light;
        else entry.modoj = { ...(entry.modoj ?? {}), [modus]: { alias: light } };
        if (dark !== undefined) {
          entry.modoj = { ...(entry.modoj ?? {}), "color-scheme=dark": { alias: dark } };
        }
        festgelegt[token] = entry;
        return readAgordo({ ...next, festgelegt }).agordo;
      };
      const confirmed = (agordo: Agordo): boolean =>
        !checkDraft(agordo, bases).issues.some(
          (issue) =>
            !knownBefore.has(`${issue.rule} ${issue.path}`) &&
            !ADJUSTABLE_RULES.includes(issue.rule),
        );
      // The schemes the setting reaches: both for the main set, the one of a mode.
      const schemes =
        modus === undefined
          ? ["light", "dark"]
          : [modus === "color-scheme=dark" ? "dark" : "light"];
      let light: string | undefined;
      let dark: string | undefined;
      for (const candidate of steps) {
        if (light !== undefined && dark !== undefined) break;
        const tried = `color.palette.${palette}.${candidate}`;
        const agordo = withStep(tried);
        if (agordo === undefined) continue;
        const holds = schemesThatHold(agordo, token);
        if (schemes.every((scheme) => holds.has(scheme))) {
          if (confirmed(agordo)) {
            return `Die nächste Stufe der Palette ${palette}, die besteht: ${tried} (Stufe ${candidate} statt ${own}).`;
          }
          continue;
        }
        // A cell whose text turns with the scheme (a light label on a dark fill, a dark one on a
        // light fill) needs a step per scheme, as the role has: the nearest for light and for dark.
        if (schemes.length === 2) {
          if (light === undefined && holds.has("light")) light = tried;
          if (dark === undefined && holds.has("dark")) dark = tried;
        }
      }
      if (light !== undefined && dark !== undefined) {
        const agordo = withStep(light, dark);
        if (agordo !== undefined && confirmed(agordo)) {
          return `Die nächsten Stufen der Palette ${palette}, die bestehen: ${light} hell und ${dark} dunkel (color-scheme=dark) – wie die Rolle je Schema eine Stufe nimmt.`;
        }
      }
      return `Keine Stufe von ${palette} besteht hier an dieser Stelle; wähle eine Stufe einer anderen Palette.`;
    }
    void draft;
    if (violation !== undefined && violation.apply !== undefined) return vorschlagOf(violation);
    const regulo =
      violation === undefined
        ? undefined
        : modeloOf().reguloj.find((entry) => entry.name === violation.rule);
    if (regulo !== undefined) {
      return `Wähle einen Wert, der die Regel erfüllt: ${reguloIn(modeloOf(), regulo, "de").statement}`;
    }
    return "Wähle einen anderen Wert.";
  };

  async function festlegen(
    name: string,
    draft: Draft,
    body: Record<string, unknown>,
    reply: (value: unknown, status?: number) => void,
  ): Promise<void> {
    const rev = draft.rev;
    const token = typeof body.token === "string" ? body.token : "";
    if (!/^[a-z0-9]+(\.[a-z0-9-]+)*$/.test(token)) {
      reply(
        {
          issues: [
            {
              rule: "token-invalid",
              path: "token",
              message: "no token name",
              suggestion: "name a token of the Vortaro",
            },
          ],
        },
        422,
      );
      return;
    }
    const modus = typeof body.modus === "string" && body.modus !== "" ? body.modus : undefined;
    let next: Agordo;
    const checked = typeof body.etikedo !== "string";
    if (typeof body.etikedo === "string") {
      next = patched(draft.agordo, {
        etikedoj: { [token]: body.etikedo.trim() === "" ? null : body.etikedo.trim() },
      });
    } else if (body.zurueck === true) {
      const festgelegt = { ...(draft.agordo.festgelegt ?? {}) };
      const entry = festgelegt[token];
      if (entry !== undefined && modus !== undefined) {
        const modoj = { ...(entry.modoj ?? {}) };
        delete modoj[modus];
        const { modoj: _modoj, ...rest } = entry;
        const kept = Object.keys(modoj).length === 0 ? rest : { ...rest, modoj };
        if (Object.keys(kept).length === 0) delete festgelegt[token];
        else festgelegt[token] = kept;
      } else {
        delete festgelegt[token];
      }
      const { festgelegt: _gone, ...rest } = draft.agordo;
      next =
        Object.keys(festgelegt).length === 0
          ? (rest as Agordo)
          : { ...(rest as Agordo), festgelegt };
    } else if (typeof body.schreibweise === "string") {
      // Spec 024 ② (Schreibweise): the case of a typography role, beside its value.
      if (!["none", "uppercase", "lowercase", "capitalize"].includes(body.schreibweise)) {
        reply(
          {
            issues: [
              {
                rule: "schreibweise-invalid",
                path: "schreibweise",
                message: "no such case",
                suggestion: "send none, uppercase, lowercase or capitalize",
              },
            ],
          },
          422,
        );
        return;
      }
      const festgelegt = { ...(draft.agordo.festgelegt ?? {}) };
      festgelegt[token] = {
        ...(festgelegt[token] ?? {}),
        schreibweise: body.schreibweise as "none" | "uppercase" | "lowercase" | "capitalize",
      };
      next = { ...draft.agordo, festgelegt };
    } else {
      const alias = typeof body.alias === "string" && body.alias !== "" ? body.alias : undefined;
      const wert =
        alias === undefined
          ? typeof body.wert === "string"
            ? colourWert(body.wert)
            : body.wert
          : undefined;
      if (alias === undefined && wert === undefined) {
        reply(
          {
            issues: [
              {
                rule: "wert-missing",
                path: "wert",
                message: "no value and no alias",
                suggestion: "send wert or alias",
              },
            ],
          },
          422,
        );
        return;
      }
      // Spec 036, Befund 2.2: a button, a link or the focus on the Zweitfarbe is refused in the
      // person's words (Regulo sekundo-not-action) before the draft changes.
      const ziel = aktionsWortOf(token);
      if (ziel !== undefined && istZweitfarbe(alias)) {
        reply(
          {
            satz: zweitfarbeAblehnungOf([ziel]),
            vorschlag: "Wähle eine Stufe der Leitfarbe oder der Neutraltöne.",
            betroffen: [SEKUNDO_NOT_ACTION],
            rule: SEKUNDO_NOT_ACTION,
          },
          409,
        );
        return;
      }
      const own = alias === undefined ? { wert } : { alias };
      const festgelegt = { ...(draft.agordo.festgelegt ?? {}) };
      const entry = festgelegt[token] ?? {};
      if (modus === undefined) {
        const { wert: _w, alias: _a, ...rest } = entry;
        festgelegt[token] = { ...rest, ...own };
      } else {
        festgelegt[token] = { ...entry, modoj: { ...(entry.modoj ?? {}), [modus]: own } };
      }
      next = { ...draft.agordo, festgelegt };
    }
    const { agordo, issues } = readAgordo(next);
    if (agordo === undefined) {
      reply({ issues }, 422);
      return;
    }
    let derivation: Derivation | undefined;
    let betroffen: string[] = [];
    if (checked) {
      const before = await pruefungOf(name, draft);
      // Spec 044: the draft moved on while its check ran; the setting goes onto the draft as it is.
      if (draft.rev !== rev) return festlegen(name, draft, body, reply);
      // T3: the candidate's check in the worker too; the draft may move on meanwhile (D-13).
      derivation = await pruefRechnung.rechner(agordo);
      if (draft.rev !== rev) return festlegen(name, draft, body, reply);
      const known = new Set(before.issues.map((issue) => `${issue.rule} ${issue.path}`));
      const fresh = derivation.issues.filter(
        (issue) =>
          !known.has(`${issue.rule} ${issue.path}`) && !ADJUSTABLE_RULES.includes(issue.rule),
      );
      const rules = new Set<string>();
      for (const violation of derivation.raporto.violations) {
        if (violation.subject.includes(token) || violation.path.includes(token))
          rules.add(violation.rule);
      }
      for (const issue of derivation.issues)
        if (!known.has(`${issue.rule} ${issue.path}`)) rules.add(issue.rule);
      betroffen = [...rules].sort();
      const refused = fresh[0];
      if (refused !== undefined) {
        const violation = derivation.raporto.violations.find(
          (entry) =>
            entry.rule === refused.rule &&
            (entry.path === refused.path || entry.subject === refused.path),
        );
        const alias = typeof body.alias === "string" && body.alias !== "" ? body.alias : undefined;
        reply(
          {
            satz:
              violation === undefined
                ? satzDe({ rule: refused.rule, subject: refused.path })
                : satzDe(violation),
            vorschlag: vorschlagDe(draft, agordo, token, modus, alias, violation, known),
            betroffen,
            rule: refused.rule,
          },
          409,
        );
        return;
      }
    }
    setDraft(name, draft, agordo);
    // V-5.5: the check of the new rev is the one just computed.
    if (derivation !== undefined) pruefSpeicher.eintragen(draft, derivation);
    reply({
      rev: draft.rev,
      herkunft: herkunftOf(agordo, token),
      probleme: problemeOf(await pruefungOf(name, draft)),
      betroffen,
    });
  }

  /**
   * Spec 035 Teil 3 (3.1): the values the formularo of a Studio page sent, each through festlegen –
   * the path of every change of the Studio: setDraft (a new rev), the check, a refusal with its
   * rule. Returns the number of the feedback the page after it shows (`?rueckmeldung=<n>`).
   */
  const studioUebernehmen = async (
    name: string,
    draft: Draft,
    groups: readonly StudioGroup[],
    values: URLSearchParams,
  ): Promise<number> => {
    const { aenderungen, abgelehnt } = studioAenderungen(groups, values);
    const rueckmeldung: StudioRueckmeldung = { uebernommen: [], abgelehnt, betroffen: [] };
    for (const aenderung of aenderungen) {
      let status = 200;
      let answer: Record<string, unknown> = {};
      await festlegen(
        name,
        draft,
        {
          token: aenderung.token,
          ...aenderung.festlegen,
          ...(aenderung.modus === undefined ? {} : { modus: aenderung.modus }),
        },
        (value, code = 200) => {
          status = code;
          answer = isRecord(value) ? value : {};
        },
      );
      const betroffen = Array.isArray(answer.betroffen) ? answer.betroffen.map(String) : [];
      rueckmeldung.betroffen.push(
        ...betroffen.filter((rule) => !rueckmeldung.betroffen.includes(rule)),
      );
      if (status === 200) {
        rueckmeldung.uebernommen.push({
          path: aenderung.path,
          label: aenderung.label,
          shown: aenderung.shown,
        });
        continue;
      }
      const issue =
        Array.isArray(answer.issues) && isRecord(answer.issues[0]) ? answer.issues[0] : {};
      rueckmeldung.abgelehnt.push({
        path: aenderung.path,
        rule: String(answer.rule ?? issue.rule ?? "wert-refused"),
        message: String(answer.satz ?? issue.message ?? "Der Wert wurde nicht übernommen."),
        suggestion: String(answer.vorschlag ?? issue.suggestion ?? "Wähle einen anderen Wert."),
      });
    }
    draft.studio = { n: (draft.studio?.n ?? 0) + 1, rueckmeldung };
    return draft.studio.n;
  };
  /** The page again after its formularo: its query (the combination, the cell) and the feedback. */
  const studioZurueck = (path: string, query: URLSearchParams, n: number): string => {
    const params = new URLSearchParams(query);
    params.delete("gespeichert");
    params.set("rueckmeldung", String(n));
    return `${path}?${params.toString()}`;
  };
  /** The feedback a page shows when its URL names the last one. */
  const rueckmeldungOf = (draft: Draft, query: URLSearchParams): StudioRueckmeldung | undefined =>
    draft.studio !== undefined && query.get("rueckmeldung") === String(draft.studio.n)
      ? draft.studio.rueckmeldung
      : undefined;

  const sendHtml = (response: ServerResponse, html: string, status = 200): void => {
    response.writeHead(status, { "content-type": TYPES[".html"] ?? "text/html" }).end(html);
  };
  const sendJson = (response: ServerResponse, value: unknown, status = 200): void => {
    response
      .writeHead(status, { "content-type": TYPES[".json"] ?? "application/json" })
      .end(JSON.stringify(value));
  };
  const redirect = (response: ServerResponse, location: string): void => {
    response.writeHead(303, { location }).end();
  };
  const notFound = (response: ServerResponse): void => {
    sendHtml(response, "<!doctype html><title>404</title><p>Nicht gefunden.", 404);
  };

  const sendStatic = (response: ServerResponse, root: string, rest: string): void => {
    const file = resolve(root, rest);
    if (!file.startsWith(root + sep) || !existsSync(file) || rest.includes("..")) {
      notFound(response);
      return;
    }
    try {
      const body = readFileSync(file);
      response
        .writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" })
        .end(body);
    } catch {
      notFound(response);
    }
  };

  const applyStep = (draft: Draft, key: SxtupoKey, values: URLSearchParams): Agordo => {
    switch (key) {
      case "farbe": {
        const leitfarbe = values.get("leitfarbe");
        const withLead =
          leitfarbe === null || leitfarbe === ""
            ? draft.agordo
            : patched(draft.agordo, { leitfarbe });
        // Spec 036, Befund 2.2: the field of the Zweitfarbe goes with the step; empty is none.
        const zweitfarbe = values.get("zweitfarbe");
        if (zweitfarbe === null || zweitfarbe.trim() === (draft.agordo.zweitfarbe?.farbe ?? ""))
          return withLead;
        const next = patched(withLead, {
          zweitfarbe: zweitfarbe.trim() === "" ? null : { farbe: zweitfarbe.trim() },
        });
        return readAgordo(next).agordo === undefined ? withLead : next;
      }
      case "schrift": {
        const id = values.get("tiparo");
        const tiparo = id === null ? undefined : tiparoj.tiparoj.find((entry) => entry.id === id);
        if (tiparo === undefined) return draft.agordo;
        return patched(draft.agordo, {
          schriften: schriftenOf(fontoOf(tiparo), values.get("rolle")),
        });
      }
      case "form": {
        const wahl = values.get("form.wahl");
        return wahl === null || wahl === "" ? draft.agordo : withFormWahl(draft.agordo, wahl);
      }
      case "raum":
      case "groesse": {
        const path = key === "raum" ? "raum.abstand" : "schrift.groesse";
        const raw = values.get(path);
        if (raw === null || raw === "" || Number.isNaN(Number(raw))) return draft.agordo;
        const [group = "", field = ""] = path.split(".");
        return patched(draft.agordo, { [group]: { [field]: Number(raw) } });
      }
      case "ikono": {
        const weight = values.get("ikono.gewicht");
        return weight === null || weight === ""
          ? draft.agordo
          : patched(draft.agordo, { ikono: { gewicht: weight } });
      }
      default:
        return draft.agordo;
    }
  };

  /** Spec 024 ② (two families): the roles a chosen font takes — Anzeige, Fließtext or both. */
  const schriftenOf = (
    fonto: ReturnType<typeof fontoOf>,
    rolle: unknown,
  ): Record<string, unknown> =>
    rolle === "display"
      ? { display: fonto }
      : rolle === "body"
        ? { body: fonto }
        : { display: fonto, body: fonto };

  const fontFaceOf = (agordo: Agordo): string => {
    const families = new Set(
      [agordo.schriften?.display, agordo.schriften?.body, agordo.schriften?.code]
        .filter((font) => font?.redistributable === true)
        .map((font) => font?.family),
    );
    return tiparoj.tiparoj
      .filter((tiparo) => families.has(tiparo.family))
      .map(fontFaceCss)
      .join("\n");
  };

  async function handle(
    request: IncomingMessage,
    response: ServerResponse,
    port: number,
  ): Promise<void> {
    const eingang = performance.now();
    const host = request.headers.host ?? "";
    if (!LOOPBACK.some((name) => host === `${name}:${port}`)) {
      sendHtml(
        response,
        "<!doctype html><title>403</title><p>Dieser Server antwortet nur auf dem eigenen Rechner.",
        403,
      );
      return;
    }
    const url = new URL(request.url ?? "/", `http://${HTTP_HOST}:${port}`);
    const path = url.pathname;
    const method = request.method ?? "GET";
    /** Spec 044 (V-2): the measure of this request; without a sink it only runs the steps. */
    const messen = (route: MessRoute, marke: string): Messung =>
      messungOf(options.messung, route, marke, eingang, response);

    if (method === "GET" && path === "/") {
      sendHtml(response, screen(inputOf("start", undefined)));
      return;
    }
    if (method === "GET" && path === "/favicon.ico") {
      response.writeHead(204).end();
      return;
    }
    if (method === "GET" && path === "/metiejo.js") {
      response.writeHead(200, { "content-type": TYPES[".js"] ?? "" }).end(CLIENT_SCRIPT);
      return;
    }
    if (method === "GET" && path === "/css/fundamento.css") {
      response.writeHead(200, { "content-type": TYPES[".css"] ?? "" }).end(komunaCss(bases));
      return;
    }
    if (method === "GET" && path.startsWith("/eroj/")) {
      sendStatic(response, erojDist, path.slice("/eroj/".length));
      return;
    }
    if (method === "GET" && path.startsWith("/vitrino/")) {
      sendStatic(response, vitrinoDir, path.slice("/vitrino/".length));
      return;
    }
    // Spec 047 (NE-1): the graph canvas – its bundle and the graph as JSON. Before the generic
    // `/marko/:name/:key` route, which would answer its paths with 404.
    if (method === "GET" && path.startsWith("/nodredaktilo/")) {
      if (leinwand === null) {
        sendHtml(response, LEINWAND_NICHT_GEBAUT, 503);
        return;
      }
      sendStatic(response, leinwand, path.slice("/nodredaktilo/".length));
      return;
    }
    if (method === "GET" && path === "/api/grafeo") {
      const markoName = url.searchParams.get("marko");
      const aspekto = url.searchParams.get("aspekto");
      const sendGrafeo = (korpo: string): void => {
        response.writeHead(200, { "content-type": TYPES[".json"] ?? "" }).end(korpo);
      };
      if ((markoName === null) === (aspekto === null)) {
        sendHtml(
          response,
          "<!doctype html><title>400</title><p>Genau einer der Parameter marko oder aspekto.",
          400,
        );
        return;
      }
      if (markoName !== null) {
        const draft = draftOf(markoName);
        if (draft === undefined) {
          notFound(response);
          return;
        }
        const cached = markoGrafeoj.get(markoName);
        if (cached?.rev === draft.rev) {
          sendGrafeo(cached.korpo);
          return;
        }
        const read = readAgordo(draft.agordo);
        const eraroj: { path: string; rule: string; message: string }[] =
          read.agordo === undefined
            ? read.issues.map(({ path: where, rule, message }) => ({ path: where, rule, message }))
            : [];
        let korpo: string | undefined;
        if (read.agordo !== undefined) {
          try {
            korpo = serializeGrafeo(grafeoDe(read.agordo, bases));
          } catch (error) {
            if (!(error instanceof GrafeoEraro)) throw error;
            eraroj.push({ path: error.path, rule: error.rule, message: error.message });
          }
        }
        if (korpo === undefined) {
          response
            .writeHead(422, { "content-type": TYPES[".json"] ?? "" })
            .end(serializeCanonicalJson({ eraroj }));
          return;
        }
        markoGrafeoj.set(markoName, { rev: draft.rev, korpo });
        sendGrafeo(korpo);
        return;
      }
      if (aspekto !== "komuna" && aspekto !== "ekzemplo") {
        notFound(response);
        return;
      }
      let korpo = paketoGrafeoj.get(aspekto);
      if (korpo === undefined) {
        const files = paketoDosieroj(aspekto, ekzemploDir);
        if (files === undefined) {
          sendHtml(
            response,
            "<!doctype html><title>404</title><p>ekzemplo ist nur im Repo vorhanden",
            404,
          );
          return;
        }
        korpo = serializeGrafeo(grafeoDePaket(aspekto, files));
        paketoGrafeoj.set(aspekto, korpo);
      }
      sendGrafeo(korpo);
      return;
    }
    // T4: the screens of the canvas and the stylesheet of a package. A thing that is not there
    // answers first (404, the ekzemplo sentence), a missing bundle next (503); the stylesheet and
    // the API never need the bundle. The scheme comes from `?scheme=` (default light).
    const grafeoMarko = /^\/marko\/([a-z0-9-]+)\/grafeo$/.exec(path);
    if (method === "GET" && grafeoMarko !== null) {
      const [, name = ""] = grafeoMarko;
      const draft = draftOf(name);
      if (draft === undefined) {
        notFound(response);
        return;
      }
      if (leinwand === null) {
        sendHtml(response, LEINWAND_NICHT_GEBAUT, 503);
        return;
      }
      // The draft as the request found it, with the shared check of that rev (as the Studio).
      const { agordo, rev } = draft;
      const derivation = await pruefungOf(name, draft);
      const scheme = kombinationOf(url.searchParams).scheme;
      sendHtml(
        response,
        grafeoScreen({
          aspekto: name,
          scheme,
          cssHref: `/marko/${encodeURIComponent(name)}/vorschau.css?rev=${rev}`,
          fontFace: fontFaceOf(agordo),
          fonto: `/api/grafeo?marko=${encodeURIComponent(name)}`,
          studioHref: `/studio/${encodeURIComponent(name)}/farbe${scheme === "light" ? "" : `?scheme=${scheme}`}`,
          neEksportebla: !derivation.exportable,
        }),
      );
      return;
    }
    const grafeoAspekto = /^\/aspekto\/([a-z0-9-]+)\/grafeo(\.css)?$/.exec(path);
    if (method === "GET" && grafeoAspekto !== null) {
      const [, label = "", css] = grafeoAspekto;
      if (label !== "komuna" && label !== "ekzemplo") {
        notFound(response);
        return;
      }
      const files = paketoDosieroj(label, ekzemploDir);
      if (files === undefined) {
        sendHtml(
          response,
          "<!doctype html><title>404</title><p>ekzemplo ist nur im Repo vorhanden",
          404,
        );
        return;
      }
      if (css !== undefined) {
        let stilo = paketoStiloj.get(label);
        if (stilo === undefined) {
          // The same call as `komunaCss`, on the package's own Modelo; in memory, once per label.
          const modelo = buildModelo(files).modelo;
          stilo =
            CSS_CELO.generate({ modelo } as Parameters<typeof CSS_CELO.generate>[0])[0]?.text ?? "";
          paketoStiloj.set(label, stilo);
        }
        response.writeHead(200, { "content-type": TYPES[".css"] ?? "" }).end(stilo);
        return;
      }
      if (leinwand === null) {
        sendHtml(response, LEINWAND_NICHT_GEBAUT, 503);
        return;
      }
      sendHtml(
        response,
        grafeoScreen({
          aspekto: label,
          scheme: kombinationOf(url.searchParams).scheme,
          cssHref: `/aspekto/${label}/grafeo.css`,
          fonto: `/api/grafeo?aspekto=${label}`,
        }),
      );
      return;
    }
    // Spec 030: the north-star measure over time, and the pages and screenshots of its runs.
    if (method === "GET" && path === "/nordstelo") {
      const file = join(nordsteloDir, "historio.json");
      const historio: NordsteloHistorio = existsSync(file)
        ? (JSON.parse(readFileSync(file, "utf8")) as NordsteloHistorio)
        : { kuroj: [] };
      sendHtml(response, nordsteloScreen(historio));
      return;
    }
    if (method === "GET" && path.startsWith("/nordstelo/dosiero/")) {
      sendStatic(
        response,
        nordsteloDir,
        decodeURIComponent(path.slice("/nordstelo/dosiero/".length)),
      );
      return;
    }

    if (method === "POST" && path === "/marko") {
      const values = new URLSearchParams(await readBody(request));
      const basis = values.get("basis") ?? "leer";
      if (basis === "oeffnen") {
        const open = values.get("oeffnen") ?? "";
        if (readMarko(options.workdir, open) !== undefined) {
          redirect(response, `/marko/${encodeURIComponent(open)}/farbe`);
          return;
        }
        sendHtml(
          response,
          screen(
            inputOf("start", undefined, { problem: "Wähle eine vorhandene Marke aus der Liste." }),
          ),
        );
        return;
      }
      // K-1 (Spec 024): the name as written, the identifier derived.
      const written = (values.get("name") ?? "").trim();
      const name = identOf(written);
      const created = createMarko(
        options.workdir,
        { name, basis: basis === "komuna" || basis === "komuna-0-2" ? basis : "leer" },
        (ident, start) => {
          const agordo = startAgordo(ident, start);
          return written === ident ? agordo : { ...agordo, etikedoj: { marko: written } };
        },
      );
      if (created.issues.length > 0 || created.marko === undefined) {
        const issue = created.issues[0];
        sendHtml(
          response,
          screen(
            inputOf("start", undefined, {
              problem:
                issue === undefined
                  ? "Die Marke wurde nicht angelegt."
                  : problemSentence(issue, written),
            }),
          ),
        );
        return;
      }
      drafts.set(name, { agordo: created.marko.agordo, rev: 1 });
      kroniko(name, { ago: "kreo", fonto: "sistemo", detaloj: { basis } });
      redirect(response, `/marko/${encodeURIComponent(name)}/farbe`);
      return;
    }

    // Spec 033 S3 (Weg A): the entry questions of the Kreilo.
    const komenco = /^\/asistanto\/([a-z0-9-]+)\/komenco$/.exec(path);
    if (komenco !== null && method === "GET") {
      const [, name = ""] = komenco;
      const draft = draftOf(name);
      if (draft === undefined) {
        notFound(response);
        return;
      }
      sendHtml(
        response,
        kreiloScreen({
          name,
          label: draft.agordo.etikedoj?.marko ?? name,
          rev: draft.rev,
          takso: (() => {
            const taksoj = taksojOf();
            return { vojo: taksoj.vojoj.A.satz, kreilo: taksoj.zugoj.kreilo.satz };
          })(),
        }),
      );
      return;
    }
    // Spec 033 S1: the Asistanto – its screen, the state, the chat, the steps, the confirmation.
    const asistanto = /^\/asistanto\/([a-z0-9-]+)(?:\/([a-z]+))?$/.exec(path);
    if (asistanto !== null && method === "GET") {
      const [, name = "", page] = asistanto;
      const messung = messen("asistanto", name);
      const draft = messung.schritt("marke-laden", () => draftOf(name));
      if (draft === undefined) {
        notFound(response);
        return;
      }
      messung.rev(draft.rev);
      // Spec 044 (V-5.4): the page shows the draft as the request found it, with the check of that rev.
      const { agordo, rev } = draft;
      const stato = await statoOf(name, draft, messung);
      const current =
        stato.facetoj.find((entry) => entry.name === page) ??
        (page === undefined ? undefined : null);
      if (current === null) {
        notFound(response);
        return;
      }
      if (current === undefined) {
        const next =
          stato.facetoj.find((entry) => entry.stato !== "freigegeben") ?? stato.facetoj[0];
        redirect(response, `/asistanto/${encodeURIComponent(name)}/${next?.name ?? ""}`);
        return;
      }
      const faceto = facetoj.facetoj.find((entry) => entry.name === current.name);
      const fremda = fremdaOf(name);
      const provider = options.ki?.provider;
      sendHtml(
        response,
        asistantoScreen({
          marko: { name, label: agordo.etikedoj?.marko ?? name, rev },
          faceto: { ...current, kialo: faceto?.kialo ?? "" },
          vollstaendigkeit: stato,
          historio: babiloj.get(name) ?? [],
          ki:
            provider === undefined
              ? { pret: false, satz: kiSatz() }
              : { pret: true, modelo: provider.toString() },
          ...(fremda === undefined ? {} : { fremda }),
          // Spec 036, Befund 2.2: the step that names the Agordo field shows the Zweitfarbe.
          ...(faceto?.agordo.includes("zweitfarbe") === true
            ? {
                zweitfarbe: agordo.zweitfarbe === undefined ? {} : { wert: agordo.zweitfarbe },
              }
            : {}),
          zaehlilo: zaehliloOf(name).satz,
          takso: (() => {
            const taksoj = taksojOf();
            return {
              babilo: taksoj.zugoj.babilo.satz,
              parolo: taksoj.zugoj.parolo.satz,
              esploro: taksoj.zugoj.esploro.satz,
              materialo: taksoj.zugoj.materialo.satz,
            };
          })(),
          parolo: options.parolo?.provider?.toString(),
          ...(() => {
            const propono = readProponoj(options.workdir, name).find(
              (entry) => entry.faceto === current.name,
            );
            return propono === undefined ? {} : { propono };
          })(),
          // Spec 036 Teil 4 (4.2): the steps of this Faceto the material leaves open, named.
          offen: offeneSaetzeOf(readVorschlagoj(options.workdir, name), current.name),
        }),
      );
      return;
    }
    const asistantoApi =
      /^\/api\/marko\/([a-z0-9-]+)\/(stato|takso|asistanto|faceto|fremda|konfirmo|materialo|kreilo|esplori|parolo|uebernahme)$/.exec(
        path,
      );
    if (asistantoApi !== null) {
      const [, name = "", action = ""] = asistantoApi;
      const messung = action === "stato" && method === "GET" ? messen("stato", name) : OHNE_MESSUNG;
      const draft = messung.schritt("marke-laden", () => draftOf(name));
      if (draft === undefined) {
        sendJson(response, { satz: "Diese Marke gibt es nicht." }, 404);
        return;
      }
      messung.rev(draft.rev);
      if (action === "stato" && method === "GET") {
        // Spec 044 (V-5.4): the state of the rev the request found.
        const rev = draft.rev;
        const stato = await statoOf(name, draft, messung);
        const fremda = fremdaOf(name);
        sendJson(response, {
          rev,
          prozent: stato.prozent,
          definiert: stato.definiert,
          facetoj: stato.facetoj,
          nochNicht: stato.nochNicht,
          ...(fremda === undefined ? {} : { fremda }),
          zaehlilo: zaehliloOf(name),
        });
        return;
      }
      if (action === "takso" && method === "GET") {
        // Spec 033 S6: the estimate before the start, per path and turn, and the counter so far.
        sendJson(response, { ...taksojOf(), zaehlilo: zaehliloOf(name) });
        return;
      }
      if (action === "uebernahme" && method === "GET") {
        // Spec 036 Teil 4: the proposal per step of the material read so far (AC-13).
        sendJson(response, { vorschlagoj: readVorschlagoj(options.workdir, name) });
        return;
      }
      if (method !== "POST") {
        notFound(response);
        return;
      }
      let body: Record<string, unknown> = {};
      try {
        const parsed: unknown = JSON.parse((await readBody(request)) || "{}");
        if (isRecord(parsed)) body = parsed;
      } catch {
        sendJson(response, { satz: "Die Anfrage ist kein JSON." }, 400);
        return;
      }
      if (action === "asistanto") {
        const teksto = typeof body.teksto === "string" ? body.teksto.trim() : "";
        const faceto = typeof body.faceto === "string" ? body.faceto : undefined;
        // Spec 033 S5: the browser's own recognition sends its transcript with speech as the source.
        const fonto = body.fonto === "parolo" ? "parolo" : "babilo";
        const turn = await chatTurn(name, draft, teksto, faceto, fonto);
        sendJson(response, turn.body, turn.status);
        return;
      }
      if (action === "parolo") {
        // Spec 033 S5: a recording, transcribed by Voxtral on this server, becomes a chat turn.
        const parolo = options.parolo?.provider;
        if (parolo === undefined) {
          sendJson(
            response,
            {
              satz:
                options.parolo?.satz ??
                "Sprache über Voxtral braucht MISTRAL_API_KEY in der .env. Ohne ihn erkennt der Browser die Sprache selbst (Web Speech API), wo er das kann.",
            },
            503,
          );
          return;
        }
        const audio =
          typeof body.audio === "string" ? Buffer.from(body.audio, "base64") : Buffer.alloc(0);
        if (audio.length === 0) {
          sendJson(response, { satz: "Die Aufnahme ist leer." }, 422);
          return;
        }
        let transkribo: Awaited<ReturnType<typeof transkribi>>;
        try {
          transkribo = await transkribi(
            parolo,
            audio,
            typeof body.mime === "string" ? body.mime : "audio/webm",
            {
              ...(options.parolo?.fetch === undefined ? {} : { fetch: options.parolo.fetch }),
            },
          );
        } catch (error) {
          sendJson(
            response,
            { satz: redact(error instanceof Error ? error.message : String(error)) },
            502,
          );
          return;
        }
        const faceto = typeof body.faceto === "string" ? body.faceto : undefined;
        const turn = await chatTurn(name, draft, transkribo.teksto, faceto, "parolo", {
          transkribo: {
            modelo: parolo.toString(),
            ms: transkribo.ms,
            ...(transkribo.sekundoj === undefined ? {} : { sekundoj: transkribo.sekundoj }),
          },
        });
        sendJson(response, { teksto: transkribo.teksto, ...turn.body }, turn.status);
        return;
      }
      if (action === "faceto") {
        const faceto = typeof body.faceto === "string" ? body.faceto : "";
        const ago = body.ago;
        const stand = (await statoJetzt(name, draft)).facetoj.find(
          (entry) => entry.name === faceto,
        );
        if (
          stand === undefined ||
          (ago !== "akcepto" && ago !== "liberigo" && ago !== "remalfermo")
        ) {
          sendJson(response, { satz: "Unbekannter Schritt oder unbekannte Aktion." }, 422);
          return;
        }
        if (ago === "liberigo" && stand.stato === "offen") {
          // D-S36-1.2-9: the sentence the screen shows for an open step (stato.ts).
          sendJson(response, { satz: freigabeOf(stand).freigabeSatz }, 422);
          return;
        }
        if (ago === "liberigo" && !stand.gruen) {
          sendJson(
            response,
            {
              satz: `Die Prüfung meldet ${stand.probleme} offene Probleme in diesem Schritt. Löse sie oder halte die Abweichung als Jugxo fest, dann kannst du freigeben.`,
            },
            422,
          );
          return;
        }
        if (ago === "remalfermo" && stand.stato !== "freigegeben") {
          sendJson(response, { satz: "Der Schritt ist nicht freigegeben." }, 422);
          return;
        }
        // Spec 033 S2: "Vorschlag übernehmen" applies an open proposal of the Enportilo first.
        if (ago === "akcepto") {
          const propono = takeProponon(options.workdir, name, faceto);
          if (propono !== undefined) {
            const { agordo } = readAgordo(mergedAgordo(draft.agordo, propono.agordo));
            // Spec 036, Befund 3.2: a proposal of the chat or of speech is taken as their change.
            const quelle = readKroniko(options.workdir, name).findLast(
              (entry) => entry.ago === "propono" && entry.faceto === faceto,
            );
            if (agordo !== undefined && (quelle?.fonto === "babilo" || quelle?.fonto === "parolo"))
              setDraft(name, draft, agordo, quelle.fonto, quelle.modelo);
            else if (agordo !== undefined) setDraft(name, draft, agordo, "agento");
          }
        }
        kroniko(name, { ago, fonto: "regilo", faceto });
        sendJson(response, { rev: draft.rev, stato: await statoOf(name, draft) });
        return;
      }
      if (action === "esplori") {
        // Spec 033 S4 (Weg C): a brand only named – the confirmation first (Amendment v2.5), then the
        // research agent; proposals with the URL as provenance; the result stays local.
        if (body.rajtoj !== true) {
          sendJson(
            response,
            {
              satz: `Bestätigung zuerst: Eine Marke, die auf einer bestehenden aufbaut, recherchiert der Assistent erst, wenn du bestätigst: ${KONFIRMO_TEKSTO}`,
            },
            409,
          );
          return;
        }
        const nomo = typeof body.nomo === "string" ? body.nomo.trim() : "";
        const url =
          typeof body.url === "string" && body.url.trim() !== "" ? body.url.trim() : undefined;
        const provider = options.ki?.provider;
        if (nomo === "") {
          sendJson(response, { satz: "Nenne die Marke, auf der deine aufbaut." }, 422);
          return;
        }
        if (provider === undefined && url === undefined) {
          sendJson(
            response,
            { satz: `Ohne Sprachmodell braucht die Recherche eine Adresse der Marke. ${kiSatz()}` },
            503,
          );
          return;
        }
        kroniko(name, {
          ago: "fremda",
          fonto: "regilo",
          detaloj: { kiel: "nennung", nomo, ...(url === undefined ? {} : { url }) },
        });
        kroniko(name, {
          ago: "konfirmo",
          fonto: "regilo",
          teksto: KONFIRMO_TEKSTO,
          detaloj: { nennung: nomo },
        });
        try {
          const result = await esplori({
            nomo,
            ...(url === undefined ? {} : { url }),
            ...(provider === undefined ? {} : { provider }),
            ...(options.ki?.fetch === undefined ? {} : { fetch: options.ki.fetch }),
            ...(options.esploro?.fetch === undefined ? {} : { pageFetch: options.esploro.fetch }),
            bildilo,
            ...(options.ki?.sleep === undefined ? {} : { sleep: options.ki.sleep }),
            ...gated,
            budget: new Budget(options.ki?.limo ?? 60_000),
            bases,
            log: (line) => io.stderr(`${redact(line)}\n`),
          });
          writeProponoj(options.workdir, name, result.proponoj);
          for (const propono of result.proponoj) {
            kroniko(name, {
              ago: "propono",
              fonto: "agento",
              faceto: propono.faceto,
              teksto: propono.satz,
              detaloj: { agordo: propono.agordo, herkunft: propono.herkunft, nennung: nomo },
            });
          }
          kroniko(name, {
            ago: "babilo",
            fonto: "agento",
            teksto: `Recherche zu „${nomo}“`,
            ...(provider === undefined ? {} : { modelo: provider.toString() }),
            kosto: result.kosto,
            detaloj: {
              vojo: "C",
              antwort: result.antwort,
              seitoj: result.seitoj,
              abgelehnt: result.abgelehnt,
              notoj: result.notoj,
            },
          });
          sendJson(response, {
            proponoj: result.proponoj,
            // Spec 036, Befund 3.4: the colours of the proposals, as tiles for the dialog.
            kaheloj: kahelojElProponoj(result.proponoj),
            seitoj: result.seitoj,
            abgelehnt: result.abgelehnt,
            antwort: result.antwort,
            notoj: result.notoj,
            kosto: result.kosto,
            zaehlilo: zaehliloOf(name),
          });
        } catch (error) {
          const satz =
            error instanceof DayLimitReached
              ? dayLimitSatz(error)
              : redact(error instanceof Error ? error.message : String(error));
          failedTurn(
            name,
            {
              ago: "babilo",
              fonto: "agento",
              teksto: `Recherche zu „${nomo}“`,
              ...(provider === undefined ? {} : { modelo: provider.toString() }),
              detaloj: { vojo: "C" },
            },
            error,
            satz,
          );
          sendJson(response, { satz }, error instanceof DayLimitReached ? 429 : 502);
        }
        return;
      }
      if (action === "kreilo") {
        // Spec 033 S3 (Weg A): the entry questions become a proposal per Faceto, laid on the draft at
        // once; inspiration images are uploads and ask for the confirmation first (Amendment v2.5).
        const inspiro = Array.isArray(body.inspiro) ? body.inspiro.filter(isRecord) : [];
        if (inspiro.length > 0 && body.rajtoj !== true) {
          sendJson(
            response,
            {
              satz: `Bestätigung zuerst: Inspirationsbilder liest der Enportilo erst, wenn du bestätigst: ${KONFIRMO_TEKSTO}`,
            },
            409,
          );
          return;
        }
        const trovoj: Trovo[] = [];
        // Spec 035 4.5.6: what the person should know of an image (no browser for a JPG or WebP).
        const notoj: string[] = [];
        for (const image of inspiro) {
          try {
            const read = await legiMaterialon(
              {
                filename: typeof image.filename === "string" ? image.filename : "",
                bytes: Buffer.from(typeof image.base64 === "string" ? image.base64 : "", "base64"),
              },
              { workdir: options.workdir, name, familyOf: familyOfFilename, bildilo },
            );
            trovoj.push(...read.trovoj);
            notoj.push(...read.satzoj);
            kroniko(name, {
              ago: "fremda",
              fonto: "regilo",
              detaloj: { kiel: "upload", nomo: read.nomo, inspiro: true },
            });
            kroniko(name, {
              ago: "konfirmo",
              fonto: "regilo",
              teksto: KONFIRMO_TEKSTO,
              detaloj: { materialo: read.nomo },
            });
          } catch (error) {
            sendJson(
              response,
              { satz: error instanceof Error ? error.message : String(error) },
              422,
            );
            return;
          }
        }
        const karaktero = isRecord(body.karaktero)
          ? Object.fromEntries(
              Object.entries(body.karaktero).map(([key, value]) => [key, Number(value) || 0]),
            )
          : {};
        const festgelegt = isRecord(body.festgelegt) ? body.festgelegt : {};
        const celo = typeof body.celo === "string" ? body.celo : "";
        const result = kreiloProponoj(
          {
            celo,
            karaktero,
            festgelegt: {
              ...(typeof festgelegt.farbe === "string" ? { farbe: festgelegt.farbe } : {}),
              ...(typeof festgelegt.schrift === "string" ? { schrift: festgelegt.schrift } : {}),
            },
            inspiro: trovoj,
          },
          draft.agordo,
          bases,
        );
        const { agordo, issues } = readAgordo(result.agordo);
        if (agordo === undefined) {
          sendJson(response, { satz: issues.map((issue) => issue.message).join(" ") }, 422);
          return;
        }
        setDraft(name, draft, agordo, "agento");
        for (const faceto of result.facetoj) {
          kroniko(name, {
            ago: "propono",
            fonto: "agento",
            faceto,
            teksto: result.satz,
            detaloj: { herkunft: result.herkunft[faceto] ?? [], kreilo: { celo, karaktero } },
          });
        }
        // Spec 036, Befund 2.2 (Spec 035 D-80 superseded): the second colour of the inspiration is
        // the Zweitfarbe of the draft, set with its origin like the lead colour; the Kroniko records
        // it with its measure (the accent of Spec 035, Befund 4.2).
        if (result.akzent !== undefined) {
          const { faceto, agordo: patch, satz, herkunft, farbe, anteil, abstand } = result.akzent;
          kroniko(name, {
            ago: "propono",
            fonto: "agento",
            faceto,
            teksto: satz,
            detaloj: { herkunft, akzent: { farbe, anteil, abstand }, agordo: patch },
          });
        } else if (result.zweitfarbe !== undefined && "teilsatz" in result.zweitfarbe) {
          // A second colour too close to the lead colour sets nothing; the person reads why.
          const { satz, grund, farbe } = result.zweitfarbe;
          notoj.push(satz);
          kroniko(name, {
            ago: "propono",
            fonto: "agento",
            faceto: "gvidkoloro",
            teksto: satz,
            detaloj: { zweitfarbe: { grund, ...(farbe === undefined ? {} : { farbe }) } },
          });
        }
        // With a model, no fixed colour and no inspiration, the model chooses the lead colour.
        const provider = options.ki?.provider;
        const colourFixed =
          (typeof festgelegt.farbe === "string" && festgelegt.farbe.trim() !== "") ||
          trovoj.some((trovo) => trovo.kind === "farbo");
        let turn: Awaited<ReturnType<typeof babili>> | undefined;
        if (provider !== undefined && !colourFixed) {
          // Spec 044 (A-03): as in a chat turn, the shared check first; its error stays where it is.
          await pruefungOf(name, draft).catch(() => undefined);
          try {
            turn = await babili({
              provider,
              laborejo: laborejoOf(name, draft, provider.toString()),
              historio: [],
              teksto: `Neue Marke. Beschreibung: ${celo || "(keine)"}. Charakter: ${describeKaraktero(karaktero) || "ausgewogen"}. Wähle mit dem Werkzeug setze_farbe eine Leitfarbe, die zur Beschreibung passt, und sag in zwei Sätzen, warum.`,
              faceto: "gvidkoloro",
              budget: new Budget(options.ki?.limo ?? 60_000),
              ...(options.ki?.fetch === undefined ? {} : { fetch: options.ki.fetch }),
              ...(options.ki?.sleep === undefined ? {} : { sleep: options.ki.sleep }),
              ...gated,
              log: (line) => io.stderr(`${redact(line)}\n`),
            });
            kroniko(name, {
              ago: "babilo",
              fonto: "babilo",
              faceto: "gvidkoloro",
              teksto: "Leitfarbe zur Beschreibung (Einstiegsfragen)",
              modelo: provider.toString(),
              kosto: turn.kosto,
              detaloj: { vojo: "A", antwort: turn.antwort, iloj: turn.iloj, atendoj: turn.atendoj },
            });
            babiloj.set(name, [
              ...(babiloj.get(name) ?? []),
              { role: "assistant", content: turn.antwort },
            ]);
          } catch (error) {
            const satz = redact(error instanceof Error ? error.message : String(error));
            failedTurn(
              name,
              {
                ago: "babilo",
                fonto: "babilo",
                faceto: "gvidkoloro",
                teksto: "Leitfarbe zur Beschreibung (Einstiegsfragen)",
                modelo: provider.toString(),
                detaloj: { vojo: "A" },
              },
              error,
              satz,
            );
            io.stderr(`Kreilo: ${satz}\n`);
          }
        }
        mkdirSync(join(options.workdir, name), { recursive: true });
        writeFileSync(
          join(options.workdir, name, "kreilo.json"),
          `${JSON.stringify({ celo, karaktero, festgelegt }, null, 2)}\n`,
        );
        sendJson(response, {
          facetoj: result.facetoj,
          satz: [result.satz, ...notoj].join(" "),
          // Spec 036, D-95: what the person must know of the inspiration, shown before going on.
          notoj,
          rev: draft.rev,
          stato: await statoOf(name, draft),
          ...(turn === undefined ? {} : { antwort: turn.antwort, kosto: turn.kosto }),
        });
        return;
      }
      if (action === "materialo") {
        // Spec 033 S2 (Weg B), Constitution v2.5: material of an existing brand needs the
        // confirmation at the start; the reading, the foreign basis and the proposals go into the Kroniko.
        if (body.rajtoj !== true) {
          sendJson(
            response,
            {
              satz: `Bestätigung zuerst: Material einer bestehenden Marke liest der Enportilo erst, wenn du bestätigst: ${KONFIRMO_TEKSTO}`,
            },
            409,
          );
          return;
        }
        let read: Awaited<ReturnType<typeof legiMaterialon>>;
        try {
          read = await legiMaterialon(
            {
              ...(typeof body.url === "string" ? { url: body.url } : {}),
              ...(typeof body.filename === "string" ? { filename: body.filename } : {}),
              ...(typeof body.base64 === "string"
                ? { bytes: Buffer.from(body.base64, "base64") }
                : {}),
            },
            {
              workdir: options.workdir,
              name,
              ...(options.settings.tiparojRepo === undefined
                ? {}
                : { tiparojRepo: options.settings.tiparojRepo }),
              ...(options.deps === undefined ? {} : { deps: options.deps }),
              familyOf: familyOfFilename,
              bildilo,
            },
          );
        } catch (error) {
          sendJson(
            response,
            {
              satz: lesefehlerSatzOf(error, typeof body.url === "string" && body.url.trim() !== ""),
            },
            422,
          );
          return;
        }
        kroniko(name, {
          ago: "fremda",
          fonto: "regilo",
          detaloj: { kiel: read.kiel, nomo: read.nomo },
        });
        kroniko(name, {
          ago: "konfirmo",
          fonto: "regilo",
          teksto: KONFIRMO_TEKSTO,
          detaloj: { materialo: read.nomo },
        });
        // Spec 036 Teil 4: one proposal per step with its provenance; the Facetoj's go to the store.
        const uebernahme = uebernahmeOf(
          read,
          proponojOf(read.trovoj, bases),
          draft.agordo.leitfarbe,
        );
        writeVorschlagoj(options.workdir, name, uebernahme.vorschlagoj);
        const proponoj = uebernahme.proponoj;
        writeProponoj(options.workdir, name, proponoj);
        for (const propono of proponoj) {
          kroniko(name, {
            ago: "propono",
            fonto: "agento",
            faceto: propono.faceto,
            teksto: propono.satz,
            detaloj: {
              agordo: propono.agordo,
              herkunft: propono.herkunft,
              ...(propono.vorschlagoj === undefined ? {} : { vorschlagoj: propono.vorschlagoj }),
            },
          });
        }
        // Spec 036, Befund 3.4: what the reading found, as tiles for the dialog.
        sendJson(response, {
          proponoj,
          satzoj: read.satzoj,
          trovoj: read.trovoj.length,
          kaheloj: kahelojElTrovoj(read.trovoj),
        });
        return;
      }
      if (action === "fremda") {
        const kiel =
          body.kiel === "upload" || body.kiel === "link" || body.kiel === "agento"
            ? body.kiel
            : "nennung";
        const nomo =
          typeof body.nomo === "string" && body.nomo.trim() !== "" ? body.nomo.trim() : undefined;
        kroniko(name, {
          ago: "fremda",
          fonto: "regilo",
          detaloj: { kiel, ...(nomo === undefined ? {} : { nomo }) },
        });
        sendJson(response, { bestaetigung: "noetig", satz: KONFIRMO_TEKSTO });
        return;
      }
      if (action === "konfirmo") {
        if (body.rajtoj !== true) {
          sendJson(
            response,
            { satz: "Bestätige, dass du die Rechte hast oder die Verantwortung übernimmst." },
            422,
          );
          return;
        }
        kroniko(name, { ago: "konfirmo", fonto: "regilo", teksto: KONFIRMO_TEKSTO });
        sendJson(response, { ok: true });
        return;
      }
      notFound(response);
      return;
    }

    const tiparojApi = /^\/api\/marko\/([a-z0-9-]+)\/tiparoj$/.exec(path);
    if (tiparojApi !== null && method === "GET") {
      // K-3/K-4 (Spec 024): hits while typing; without a hit the sentence that says what to do.
      const query = url.searchParams.get("q") ?? "";
      const treffer = searchTiparoj(tiparoj, query, 12).map((tiparo) => ({
        id: tiparo.id,
        family: tiparo.family,
        license: tiparo.license,
        category: tiparo.category,
      }));
      sendJson(response, {
        treffer,
        ...(query !== "" && treffer.length === 0
          ? {
              satz: `Keine Schrift gefunden für „${query}“: Versuche einen Teil des Namens, zum Beispiel „Sans“ oder „Serif“, oder lade eine eigene Schrift hoch.`,
            }
          : {}),
      });
      return;
    }
    const api = /^\/api\/marko\/([a-z0-9-]+)\/(entwurf|pruefung|schrift|alsxuti|festlegen)$/.exec(
      path,
    );
    if (api !== null && method === "POST") {
      const [, name = "", action = ""] = api;
      const messung = action === "pruefung" ? messen("pruefung", name) : OHNE_MESSUNG;
      const draft = messung.schritt("marke-laden", () => draftOf(name));
      if (draft === undefined) {
        sendJson(
          response,
          {
            issues: [
              {
                rule: "marko-missing",
                path: name,
                message: "no such brand",
                suggestion: "create it first",
              },
            ],
          },
          404,
        );
        return;
      }
      messung.rev(draft.rev);
      if (action === "pruefung") {
        const klartext = await klartextOfDraft(name, draft, messung);
        sendJson(response, {
          ...klartext,
          html: messung.schritt("css-js", () => klartextHtml(klartext, { firstAsMain: true })),
        });
        return;
      }
      let body: unknown;
      try {
        body = JSON.parse((await readBody(request)) || "{}");
      } catch {
        sendJson(
          response,
          {
            issues: [
              {
                rule: "json-invalid",
                path: "body",
                message: "the body is no JSON",
                suggestion: "send a JSON object",
              },
            ],
          },
          400,
        );
        return;
      }
      if (!isRecord(body)) {
        sendJson(
          response,
          {
            issues: [
              {
                rule: "json-invalid",
                path: "body",
                message: "the body is no JSON object",
                suggestion: "send a JSON object",
              },
            ],
          },
          400,
        );
        return;
      }
      if (action === "festlegen") {
        await festlegen(name, draft, body, (value, status) => sendJson(response, value, status));
        return;
      }
      if (action === "entwurf") {
        const form = isRecord(body.form) ? body.form : undefined;
        const wahl = typeof form?.wahl === "string" ? form.wahl : undefined;
        const patch =
          form === undefined
            ? body
            : {
                ...body,
                form: Object.fromEntries(Object.entries(form).filter(([key]) => key !== "wahl")),
              };
        const next =
          wahl === undefined
            ? patched(draft.agordo, patch)
            : withFormWahl(patched(draft.agordo, patch), wahl);
        const { agordo, issues } = readAgordo(next);
        if (agordo === undefined) {
          sendJson(response, { issues }, 422);
          return;
        }
        setDraft(name, draft, agordo);
        sendJson(response, { rev: draft.rev, agordo });
        return;
      }
      if (action === "schrift") {
        const tiparo = tiparoj.tiparoj.find((entry) => entry.id === body.tiparo);
        if (tiparo === undefined) {
          sendJson(
            response,
            {
              issues: [
                {
                  rule: "tiparo-unknown",
                  path: "tiparo",
                  message: `no webfont ${String(body.tiparo)}`,
                  suggestion: "choose one of the search results",
                },
              ],
            },
            404,
          );
          return;
        }
        const fonto = fontoOf(tiparo);
        setDraft(name, draft, patched(draft.agordo, { schriften: schriftenOf(fonto, body.rolle) }));
        sendJson(response, { rev: draft.rev, agordo: draft.agordo });
        return;
      }
      if (action === "alsxuti") {
        const filename = typeof body.filename === "string" ? body.filename : "";
        const base64 = typeof body.base64 === "string" ? body.base64 : "";
        try {
          const stored = storeUpload(options.workdir, name, {
            filename,
            bytes: Buffer.from(base64, "base64"),
          });
          const safe = stored.path.slice(stored.path.lastIndexOf(sep) + 1);
          draft.upload = { filename: safe, family: familyOfFilename(safe), path: stored.path };
          sendJson(response, { filename: safe });
        } catch (error) {
          sendJson(
            response,
            {
              issues: [
                {
                  rule: "upload-refused",
                  path: "filename",
                  message: error instanceof Error ? error.message : String(error),
                  suggestion: "upload a woff2, woff, ttf or otf file",
                },
              ],
            },
            422,
          );
        }
        return;
      }
    }

    const komponento = /^\/studio\/([a-z0-9-]+)\/(ero|sxablono)\/([a-z0-9-]+)$/.exec(path);
    if (komponento !== null) {
      const [, name = "", kind = "", komponentoName = ""] = komponento;
      const draft = draftOf(name);
      const ref = komponentoRefOf(bases, kind, komponentoName);
      if (draft === undefined || ref === undefined || (method !== "GET" && method !== "POST")) {
        notFound(response);
        return;
      }
      const kombination = kombinationOf(url.searchParams);
      if (method === "POST") {
        // Spec 035 Teil 3 (3.1): the formularo of a component page, as on the pages of the Studio.
        const { groups } = komponentoView(
          ref,
          draft.agordo,
          bases,
          kombination,
          zeloOf(url.searchParams),
        );
        const values = new URLSearchParams(await readBody(request));
        const n = await studioUebernehmen(name, draft, groups, values);
        redirect(response, studioZurueck(path, url.searchParams, n));
        return;
      }
      // Spec 044 (V-5.4): the page shows the draft as the request found it, with the check of that rev.
      const { agordo, rev } = draft;
      const rueckmeldung = rueckmeldungOf(draft, url.searchParams);
      const feedback = rueckmeldung === undefined ? {} : studioFeedback(rueckmeldung);
      const marko = readMarko(options.workdir, name);
      sendHtml(
        response,
        komponentoScreen({
          view: (() => {
            const view = komponentoView(ref, agordo, bases, kombination, zeloOf(url.searchParams));
            return { ...view, groups: mitRueckmeldung(view.groups, rueckmeldung) };
          })(),
          marko: {
            name,
            agordo,
            saved: marko !== undefined && JSON.stringify(marko.agordo) === JSON.stringify(agordo),
            rev,
          },
          kombination,
          komponentoj: komponentoList(bases),
          probleme: problemeOf(await pruefungOf(name, draft)),
          expert: expertOf(agordo),
          ...(feedback.message === undefined ? {} : { message: feedback.message }),
          ...(feedback.betroffen === undefined ? {} : { betroffen: feedback.betroffen }),
        }),
      );
      return;
    }

    const studio = /^\/studio\/([a-z0-9-]+)(?:\/([a-z]+))?$/.exec(path);
    if (studio !== null) {
      const [, name = "", page] = studio;
      const draft = draftOf(name);
      if (draft === undefined) {
        notFound(response);
        return;
      }
      if (page === undefined) {
        redirect(response, `/studio/${encodeURIComponent(name)}/farbe`);
        return;
      }
      if (method === "POST" && page === "speichern") {
        await saveAndExport(name, draft, new URLSearchParams(await readBody(request)));
        redirect(response, `/studio/${encodeURIComponent(name)}/farbe?gespeichert=1`);
        return;
      }
      if ((method !== "GET" && method !== "POST") || !isStudioPage(page)) {
        notFound(response);
        return;
      }
      const kombination = kombinationOf(url.searchParams);
      if (method === "POST") {
        // Spec 035 Teil 3 (3.1): the formularo posts the values a person changed to its page.
        const groups = studioRows(page, draft.agordo, bases, kombination);
        const values = new URLSearchParams(await readBody(request));
        const n = await studioUebernehmen(name, draft, groups, values);
        redirect(response, studioZurueck(path, url.searchParams, n));
        return;
      }
      // Spec 044 (V-5.4): the page shows the draft as the request found it, with the check of that rev.
      const { agordo, rev } = draft;
      const marko = readMarko(options.workdir, name);
      const derivation = await pruefungOf(name, draft);
      const rueckmeldung = rueckmeldungOf(draft, url.searchParams);
      const feedback = rueckmeldung === undefined ? {} : studioFeedback(rueckmeldung);
      const message =
        url.searchParams.get("gespeichert") === "1"
          ? [
              "Gespeichert.",
              ...(draft.eksporto?.sentences ?? []),
              ...(draft.eksporto?.issues ?? []),
            ].join(" ")
          : feedback.message;
      sendHtml(
        response,
        studioScreen({
          page,
          averto: avertoOf(fremdaOf(name)),
          marko: {
            name,
            agordo,
            saved: marko !== undefined && JSON.stringify(marko.agordo) === JSON.stringify(agordo),
            rev,
          },
          kombination,
          groups: mitRueckmeldung(studioRows(page, agordo, bases, kombination), rueckmeldung),
          probleme: problemeOf(derivation),
          ...(message === undefined ? {} : { message }),
          ...(feedback.problem === undefined ? {} : { problem: feedback.problem }),
          ...(feedback.betroffen === undefined ? {} : { betroffen: feedback.betroffen }),
          expert: expertOf(agordo),
          komponentoj: komponentoList(bases),
          // Spec 047 (NE-1): the canvas of the brand, only while its bundle is built.
          ...(leinwand === null
            ? {}
            : {
                grafeoHref: `/marko/${encodeURIComponent(name)}/grafeo?scheme=${kombination.scheme}`,
              }),
        }),
      );
      return;
    }

    // Spec 035, Befund 4.5.1: the material of a brand, shown as the crop of a proposal – an image
    // of the brand's own material folder, sent so that nothing in it runs (an SVG opened alone).
    const materialo = /^\/marko\/([a-z0-9-]+)\/materialo\/([^/]+)$/.exec(path);
    if (materialo !== null && method === "GET") {
      const [, name = "", raw = ""] = materialo;
      let file = "";
      try {
        file = safeFilename(decodeURIComponent(raw));
      } catch {}
      const type = MATERIALO_BILDOJ[extname(file).toLowerCase()];
      const where = join(markoDir(options.workdir, name), MATERIALO_DIR, file);
      if (draftOf(name) === undefined || type === undefined || file === "" || !existsSync(where)) {
        notFound(response);
        return;
      }
      response
        .writeHead(200, {
          "content-type": type,
          "x-content-type-options": "nosniff",
          "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
          "cache-control": "no-store",
        })
        .end(readFileSync(where));
      return;
    }

    const marko = /^\/marko\/([a-z0-9-]+)\/([a-z]+)(\.css)?$/.exec(path);
    if (marko !== null) {
      const [, name = "", key = "", css] = marko;
      const messRoute: MessRoute | undefined =
        method !== "GET" || key !== "vorschau"
          ? undefined
          : css === ".css"
            ? "vorschau.css"
            : url.searchParams.has("sxtupo")
              ? "vorschau"
              : undefined;
      const messung = messRoute === undefined ? OHNE_MESSUNG : messen(messRoute, name);
      const draft = messung.schritt("marke-laden", () => draftOf(name));
      if (draft === undefined) {
        notFound(response);
        return;
      }
      messung.rev(draft.rev);
      // Spec 035, Befund 4.5.1: the preview with an open proposal laid on the draft (the draft stays).
      const propono = url.searchParams.get("propono");
      const shown = (): Agordo => {
        if (propono === null) return draft.agordo;
        const open = readProponoj(options.workdir, name).find((entry) => entry.faceto === propono);
        return open === undefined
          ? draft.agordo
          : (readAgordo(mergedAgordo(draft.agordo, open.agordo)).agordo ?? draft.agordo);
      };
      if (method === "GET" && key === "vorschau" && css === ".css") {
        // Spec 044 (A-02, B-4): the stylesheet of the rev and the proposal the request found, from
        // the shared store. The head goes out first as before: a failed derivation still ends the
        // response with 200 and an empty body (the server's catch), not with 500.
        response.writeHead(200, { "content-type": TYPES[".css"] ?? "" });
        const rev = draft.rev;
        const agordo = messung.schritt("marke-laden", shown);
        response.end(await cssSpeicher.css(name, rev, propono ?? "", agordo, messung));
        return;
      }
      if (method === "GET" && key === "vorschau" && url.searchParams.has("sxtupo")) {
        const sxtupo = url.searchParams.get("sxtupo") ?? "vorschau";
        const breite = url.searchParams.get("breite") ?? "mittel";
        // Spec 044 (A-04, V-5.4): of the draft as the request found it. Only the stage's frame
        // „Jetzt“ waits for the check of that rev; every other frame waits for nothing.
        const rev = draft.rev;
        const agordo = messung.schritt("marke-laden", shown);
        const teile = messung.schritt("css-js", () => ({
          fontFace: fontFaceOf(agordo),
          scheme:
            url.searchParams.get("scheme") === "dark" ? ("dark" as const) : ("light" as const),
          attributes: Object.fromEntries(
            (["density", "contrast", "viewport"] as const)
              .map((key) => [`data-fm-${key}`, url.searchParams.get(key) ?? ""])
              .filter(([, value]) => value !== ""),
          ),
          body: previewBody(
            isSxtupoKey(sxtupo) ||
              sxtupo.startsWith("studio-") ||
              sxtupo.startsWith("komponento-") ||
              sxtupo.startsWith("buehne-")
              ? sxtupo
              : "vorschau",
            breite,
            agordo,
            zeloOf(url.searchParams),
          ),
        }));
        // Spec 036, Befund 3.5: the stage's frame „Jetzt“ shows the open problems of the draft's
        // check per component (the step's state counts the same problems).
        const derivation =
          sxtupo.startsWith("buehne-") && propono === null
            ? await pruefungOf(name, draft, messung)
            : undefined;
        sendHtml(
          response,
          messung.schritt("css-js", () =>
            previewDocument({
              name,
              cssHref: `/marko/${encodeURIComponent(name)}/vorschau.css?rev=${rev}${propono === null ? "" : `&propono=${encodeURIComponent(propono)}`}`,
              fontFace: teile.fontFace,
              scheme: teile.scheme,
              attributes: teile.attributes,
              body:
                teile.body +
                (derivation === undefined
                  ? ""
                  : pruefungHtml(pruefmarkojOf(offeneProblemeOf(derivation), modeloOf(), satzOf))),
            }),
          ),
        );
        return;
      }
      if (method === "POST" && key === "speichern") {
        await saveAndExport(name, draft, new URLSearchParams(await readBody(request)));
        redirect(response, `/marko/${encodeURIComponent(name)}/fertig?gespeichert=1`);
        return;
      }
      if (method === "POST" && key === "privata") {
        const values = new URLSearchParams(await readBody(request));
        const family = (values.get("family") ?? draft.upload?.family ?? "").trim();
        const upload = draft.upload;
        if (
          upload === undefined ||
          options.settings.tiparojRepo === undefined ||
          options.deps === undefined ||
          family === ""
        ) {
          draft.privataResult = privata.locked
            ? privata.sentence
            : "Kein Push: Es liegt keine Datei zum Hochladen bereit.";
        } else {
          const result = await uploadFont(
            options.settings.tiparojRepo,
            options.deps,
            { name: upload.filename, bytes: readFileSync(upload.path) },
            family,
          );
          draft.privataResult = result.sentence;
          if (result.pushed) {
            const fonto = licencedFonto(family, ["Latn"]);
            setDraft(
              name,
              draft,
              patched(draft.agordo, { schriften: { display: fonto, body: fonto } }),
            );
            delete draft.upload;
          }
        }
        redirect(response, `/marko/${encodeURIComponent(name)}/schrift`);
        return;
      }
      if (!isSxtupoKey(key) || key === "start") {
        notFound(response);
        return;
      }
      if (method === "POST") {
        const values = new URLSearchParams(await readBody(request));
        if (
          key === "schrift" &&
          (values.get("tiparo") ?? "") === "" &&
          (values.get("q") ?? "") !== ""
        ) {
          redirect(
            response,
            `/marko/${encodeURIComponent(name)}/schrift?q=${encodeURIComponent(values.get("q") ?? "")}`,
          );
          return;
        }
        const next = applyStep(draft, key, values);
        const { agordo, issues } = readAgordo(next);
        if (agordo === undefined) {
          sendHtml(
            response,
            screen(
              inputOf(key, name, {
                problem: issues[0]?.message ?? "Der Wert wurde nicht übernommen.",
              }),
            ),
          );
          return;
        }
        if (agordo !== draft.agordo) setDraft(name, draft, agordo);
        const following = nextOf(key);
        redirect(
          response,
          following === undefined
            ? `/marko/${encodeURIComponent(name)}/${key}`
            : `/marko/${encodeURIComponent(name)}/${following.key}`,
        );
        return;
      }
      const extra: Partial<ScreenInput> = {};
      if (key === "schrift") {
        const query = url.searchParams.get("q") ?? "";
        extra.tiparoj = { query, results: searchTiparoj(tiparoj, query, 12) };
        if (draft.upload !== undefined)
          extra.upload = { filename: draft.upload.filename, family: draft.upload.family };
        if (draft.privataResult !== undefined) {
          extra.privata = {
            locked: privata.locked,
            sentence: privata.sentence,
            result: draft.privataResult,
          };
          delete draft.privataResult;
        }
      }
      // Spec 044 (V-5.4): the page shows the draft as the request found it, with the check of that rev.
      const stand = { agordo: draft.agordo, rev: draft.rev };
      if (key === "fertig") {
        extra.klartext = await klartextOfDraft(name, draft);
        if (url.searchParams.get("gespeichert") === "1") {
          extra.message = "Gespeichert.";
          if (draft.eksporto !== undefined) extra.eksporto = draft.eksporto;
        }
      }
      sendHtml(response, screen(inputOf(key, name, extra, stand)));
      return;
    }
    notFound(response);
  }

  let port = options.port;
  const server = createServer((request, response) => {
    handle(request, response, port).catch((error: unknown) => {
      const reason = error instanceof Error ? error.message : String(error);
      io.stderr(`metiejo: ${reason}\n`);
      if (!response.headersSent)
        sendHtml(response, `<!doctype html><title>500</title><p>${escapeHtml(reason)}`, 500);
      else response.end();
    });
  });
  await new Promise<void>((done, fail) => {
    server.once("error", fail);
    server.listen(options.port, HTTP_HOST, () => done());
  });
  port = (server.address() as AddressInfo).port;
  const url = `http://${HTTP_HOST}:${port}`;
  io.stderr(`metiejo: http://localhost:${port} – Arbeitsordner ${options.workdir}\n`);
  io.stderr(
    `metiejo: FM_TIPAROJ_REPO ${options.settings.tiparojRepo === undefined ? "nicht gesetzt (Upload lizenzierter Schriften gesperrt)" : "gesetzt"}; weitere Variablen gesetzt: ${
      options.settings.present.filter((name) => name !== "FM_TIPAROJ_REPO").length
    }\n`,
  );
  // Spec 044 B-10: the worker of the check starts in the turn after the URL line (R-6: the line comes
  // no later), loads its modules and bases while the first page loads, and the first check finds it
  // ready. Only where the check runs in a worker; the main thread has nothing to start.
  let vorstart: NodeJS.Immediate | undefined =
    pruefRechnung.ort === "worker"
      ? setImmediate(() => {
          vorstart = undefined;
          pruefRechnung.vorstarten();
        })
      : undefined;
  return {
    url,
    port,
    close: async () => {
      // A close before that turn starts no worker.
      if (vorstart !== undefined) clearImmediate(vorstart);
      vorstart = undefined;
      try {
        await new Promise<void>((done, fail) => {
          server.closeAllConnections();
          server.close((error) => (error === undefined ? done() : fail(error)));
        });
      } finally {
        // Spec 044 T3: the worker of the check ends with the server.
        await pruefRechnung.beenden();
      }
    },
  };
}

export { MARKEN_DIR };
