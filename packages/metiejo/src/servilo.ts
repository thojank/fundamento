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
  type ValidationIssue,
  WCAG2_METRIC,
} from "@fundamento/modelo";
import { AVERTO_EKSPORTO, KONFIRMO_TEKSTO } from "./asistanto/averto.js";
import { babili } from "./asistanto/babilo.js";
import { asistantoScreen } from "./asistanto/ekrano.js";
import { Laborejo } from "./asistanto/iloj.js";
import { Budget, CostLimitReached, type Fetch, type Provider } from "./asistanto/ki.js";
import {
  appendKroniko,
  type KronikoEro,
  type KronikoInput,
  readKroniko,
} from "./asistanto/kroniko.js";
import {
  facetojOfAgordoDiff,
  type Vollstaendigkeit,
  vollstaendigkeitOf,
} from "./asistanto/stato.js";
import { buildOf, expertHinweis, standOf } from "./eksperto.js";
import { EKSPORTO_CELOJ, type EksportoCelo, exportMarko } from "./eksporto.js";
import {
  legiMaterialon,
  NeLegebla,
  readProponoj,
  takeProponon,
  writeProponoj,
} from "./enportilo/materialo.js";
import { proponojOf } from "./enportilo/rekono.js";
import type { Trovo } from "./enportilo/trovo.js";
import type { Settings } from "./env.js";
import { CLIENT_SCRIPT, escapeHtml, previewDocument } from "./html.js";
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
  readMarko,
  saveMarko,
  storeUpload,
  writeDraft,
} from "./marko.js";
import { NORDSTELO_DIR, type NordsteloHistorio, nordsteloScreen } from "./nordstelo.js";
import { type PrivataDeps, privataState, uploadFont } from "./privata.js";
import { composeDraft, isStudioPage, kombinationOf, studioRows, studioScreen } from "./studio.js";
import {
  FORM_WAHL,
  isSxtupoKey,
  klartextHtml,
  nextOf,
  type ScreenInput,
  type SxtupoKey,
  screen,
} from "./sxtupoj.js";
import { fontFaceCss, fontoOf, licencedFonto, readTiparoj, searchTiparoj } from "./tiparoj.js";
import type { NpmDeps } from "./tiparoj-npm.js";
import {
  type Bases,
  checkDraft,
  komunaCss,
  loadBases,
  previewCss,
  startAgordo,
} from "./vorschau.js";
import { previewBody } from "./vorschau-korpo.js";

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
  };
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
  /** The derivation with every check of the draft at `checked`, so a page needs it once per change. */
  pruefung?: { rev: number; derivation: Derivation };
  upload?: { filename: string; family: string; path: string };
  privataResult?: string;
  eksporto?: { sentences: string[]; issues: string[] };
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
    return `„${name}“ ergibt keine Kennung: Der Name braucht mindestens einen Buchstaben oder eine Ziffer, zum Beispiel „Bluna“ (Kennung bluna).`;
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

export async function startServilo(options: ServiloOptions, io: ServiloIo): Promise<Servilo> {
  const bases: Bases = loadBases();
  const tiparoj = readTiparoj();
  const drafts = new Map<string, Draft>();
  const erojDist = join(
    dirname(fileURLToPath(import.meta.resolve("@fundamento/eroj/package.json"))),
    "dist",
  );
  const vitrinoDir = join(options.root, ".fundamento", "projekcioj", "vitrino");
  const nordsteloDir = join(options.root, ...NORDSTELO_DIR);
  const stand = options.stand ?? standOf(options.root);
  const privata = privataState(options.settings);
  const ikonoGewichte = ["regular", ...Object.keys(bases.structure.ikonoGewichte?.glyphs ?? {})];
  const regler = reglerOf(bases.gestalt);
  // Spec 033 S1: the brand model, the chat of each brand and its tokens since the start.
  const facetojFile = readFacetoj(defaultModeloSource().dataDir);
  if (facetojFile === undefined) throw new Error("data/facetoj.json fehlt im Modelo.");
  const facetoj = facetojFile;
  const babiloj = new Map<string, { role: "user" | "assistant"; content: string }[]>();
  const sumoj = new Map<string, { enigo: number; eligo: number; ms: number }>();
  const redact = (text: string): string => options.ki?.provider?.redact(text) ?? text;
  const kroniko = (name: string, entry: KronikoInput): KronikoEro =>
    appendKroniko(options.workdir, name, entry, redact);

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

  const inputOf = (
    key: SxtupoKey,
    name: string | undefined,
    extra: Partial<ScreenInput> = {},
  ): ScreenInput => {
    const draft = name === undefined ? undefined : draftOf(name);
    const marko = name === undefined ? undefined : readMarko(options.workdir, name);
    const input: ScreenInput = {
      sxtupo: key,
      markoj: listMarkoj(options.workdir),
      privata: { locked: privata.locked, sentence: privata.sentence },
      expert: expertOf(draft?.agordo ?? { name: "", leitfarbe: "#000000" }),
      regler,
      ikonoGewichte,
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

  /** The derivation with every check of a draft, once per revision. */
  const pruefungOf = (draft: Draft): Derivation => {
    if (draft.pruefung?.rev !== draft.rev) {
      draft.pruefung = { rev: draft.rev, derivation: checkDraft(draft.agordo, bases) };
    }
    return draft.pruefung.derivation;
  };
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
    const result = await exportMarko(options.workdir, name, draft.agordo, bases, {
      celoj: celoj.length === 0 ? ["aspekto"] : celoj,
      fonts,
      ...(options.npm === undefined ? {} : { npm: options.npm }),
    });
    // Constitution v2.5, Art. VI: the notice before the export, with the export in the Kroniko.
    kroniko(name, { ago: "averto", fonto: "sistemo", teksto: AVERTO_EKSPORTO, detaloj: { celoj } });
    draft.eksporto = {
      sentences: result.ok ? result.sentences : [],
      issues: result.ok
        ? []
        : result.issues.map((issue) => `${issue.message} (${issue.suggestion})`),
    };
  };

  const klartextOfDraft = (draft: Draft): Klartext => klartextOf(pruefungOf(draft).raporto);

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
  const statoOf = (name: string, draft: Draft): Vollstaendigkeit =>
    vollstaendigkeitOf({
      facetoj,
      modelo: modeloOf(),
      agordo: draft.agordo,
      kroniko: readKroniko(options.workdir, name),
      probleme: pruefungOf(draft).raporto.violations.filter(
        (violation) => violation.fixed || violation.jugxo === undefined,
      ),
    });

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

  /** The tools of the Asistanto on one draft; a change goes through setDraft with the chat as source. */
  const laborejoOf = (name: string, draft: Draft, modelo: string): Laborejo =>
    new Laborejo({
      bases,
      agordo: () => draft.agordo,
      apliki: (next) => setDraft(name, draft, next, "babilo", modelo),
      probleme: () =>
        pruefungOf(draft).raporto.violations.filter(
          (violation) => violation.fixed || violation.jugxo === undefined,
        ),
      kroniko: () => readKroniko(options.workdir, name),
      kontrolita: true,
      pruefung: () => klartextOfDraft(draft),
    });

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

  function festlegen(
    name: string,
    draft: Draft,
    body: Record<string, unknown>,
    response: ServerResponse,
  ): void {
    const token = typeof body.token === "string" ? body.token : "";
    if (!/^[a-z0-9]+(\.[a-z0-9-]+)*$/.test(token)) {
      sendJson(
        response,
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
        sendJson(
          response,
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
        sendJson(
          response,
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
      sendJson(response, { issues }, 422);
      return;
    }
    let derivation: Derivation | undefined;
    let betroffen: string[] = [];
    if (checked) {
      const before = pruefungOf(draft);
      derivation = checkDraft(agordo, bases);
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
        sendJson(
          response,
          {
            satz:
              violation === undefined
                ? satzDe({ rule: refused.rule, subject: refused.path })
                : satzDe(violation),
            vorschlag: vorschlagDe(draft, agordo, token, modus, alias, violation, known),
            betroffen,
          },
          409,
        );
        return;
      }
    }
    setDraft(name, draft, agordo);
    if (derivation !== undefined) draft.pruefung = { rev: draft.rev, derivation };
    sendJson(response, {
      rev: draft.rev,
      herkunft: herkunftOf(agordo, token),
      probleme: problemeOf(pruefungOf(draft)),
      betroffen,
    });
  }

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
        return leitfarbe === null || leitfarbe === ""
          ? draft.agordo
          : patched(draft.agordo, { leitfarbe });
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
        kreiloScreen({ name, label: draft.agordo.etikedoj?.marko ?? name, rev: draft.rev }),
      );
      return;
    }
    // Spec 033 S1: the Asistanto – its screen, the state, the chat, the steps, the confirmation.
    const asistanto = /^\/asistanto\/([a-z0-9-]+)(?:\/([a-z]+))?$/.exec(path);
    if (asistanto !== null && method === "GET") {
      const [, name = "", page] = asistanto;
      const draft = draftOf(name);
      if (draft === undefined) {
        notFound(response);
        return;
      }
      const stato = statoOf(name, draft);
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
          marko: { name, label: draft.agordo.etikedoj?.marko ?? name, rev: draft.rev },
          faceto: { ...current, kialo: faceto?.kialo ?? "" },
          vollstaendigkeit: stato,
          historio: babiloj.get(name) ?? [],
          ki:
            provider === undefined
              ? { pret: false, satz: kiSatz() }
              : { pret: true, modelo: provider.toString() },
          ...(fremda === undefined ? {} : { fremda }),
          sumo: sumoj.get(name) ?? { enigo: 0, eligo: 0, ms: 0 },
          ...(() => {
            const propono = readProponoj(options.workdir, name).find(
              (entry) => entry.faceto === current.name,
            );
            return propono === undefined ? {} : { propono };
          })(),
        }),
      );
      return;
    }
    const asistantoApi =
      /^\/api\/marko\/([a-z0-9-]+)\/(stato|asistanto|faceto|fremda|konfirmo|materialo|kreilo)$/.exec(
        path,
      );
    if (asistantoApi !== null) {
      const [, name = "", action = ""] = asistantoApi;
      const draft = draftOf(name);
      if (draft === undefined) {
        sendJson(response, { satz: "Diese Marke gibt es nicht." }, 404);
        return;
      }
      if (action === "stato" && method === "GET") {
        const stato = statoOf(name, draft);
        const fremda = fremdaOf(name);
        sendJson(response, {
          rev: draft.rev,
          prozent: stato.prozent,
          definiert: stato.definiert,
          facetoj: stato.facetoj,
          nochNicht: stato.nochNicht,
          ...(fremda === undefined ? {} : { fremda }),
        });
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
        const provider = options.ki?.provider;
        if (provider === undefined) {
          sendJson(response, { satz: kiSatz() }, 503);
          return;
        }
        const fremda = fremdaOf(name);
        if (fremda !== undefined && !fremda.konfirmita) {
          sendJson(
            response,
            {
              satz: "Bitte zuerst die Bestätigung: Die Marke baut auf einer bestehenden Marke auf (Art. VI).",
            },
            409,
          );
          return;
        }
        const teksto = typeof body.teksto === "string" ? body.teksto.trim() : "";
        if (teksto === "") {
          sendJson(response, { satz: "Schreib, was du ändern möchtest." }, 422);
          return;
        }
        const faceto = typeof body.faceto === "string" ? body.faceto : undefined;
        const historio = babiloj.get(name) ?? [];
        try {
          const result = await babili({
            provider,
            laborejo: laborejoOf(name, draft, provider.toString()),
            historio: historio.slice(-12),
            teksto,
            ...(faceto === undefined ? {} : { faceto }),
            budget: new Budget(options.ki?.limo ?? 60_000),
            ...(options.ki?.fetch === undefined ? {} : { fetch: options.ki.fetch }),
            ...(options.ki?.sleep === undefined ? {} : { sleep: options.ki.sleep }),
            log: (line) => io.stderr(`${redact(line)}\n`),
          });
          babiloj.set(name, [
            ...historio,
            { role: "user", content: teksto },
            { role: "assistant", content: result.antwort },
          ]);
          const sumo = sumoj.get(name) ?? { enigo: 0, eligo: 0, ms: 0 };
          sumoj.set(name, {
            enigo: sumo.enigo + result.kosto.enigo,
            eligo: sumo.eligo + result.kosto.eligo,
            ms: sumo.ms + result.kosto.ms,
          });
          kroniko(name, {
            ago: "babilo",
            fonto: "babilo",
            ...(faceto === undefined ? {} : { faceto }),
            teksto,
            modelo: provider.toString(),
            kosto: result.kosto,
            detaloj: { antwort: result.antwort, iloj: result.iloj, atendoj: result.atendoj },
          });
          sendJson(response, {
            antwort: result.antwort,
            rev: draft.rev,
            kosto: result.kosto,
            atendoj: result.atendoj,
            sxangxoj: result.sxangxoj,
            stato: statoOf(name, draft),
          });
        } catch (error) {
          const satz =
            error instanceof CostLimitReached
              ? `Die Kostengrenze dieser Runde ist erreicht (${error.limit} Tokens). Formuliere den Wunsch kürzer oder in mehreren Schritten.`
              : redact(error instanceof Error ? error.message : String(error));
          sendJson(response, { satz }, 502);
        }
        return;
      }
      if (action === "faceto") {
        const faceto = typeof body.faceto === "string" ? body.faceto : "";
        const ago = body.ago;
        const stand = statoOf(name, draft).facetoj.find((entry) => entry.name === faceto);
        if (
          stand === undefined ||
          (ago !== "akcepto" && ago !== "liberigo" && ago !== "remalfermo")
        ) {
          sendJson(response, { satz: "Unbekannter Schritt oder unbekannte Aktion." }, 422);
          return;
        }
        if (ago === "liberigo" && stand.stato === "offen") {
          sendJson(
            response,
            { satz: "Übernimm den Vorschlag oder passe ihn an, dann kannst du freigeben." },
            422,
          );
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
            if (agordo !== undefined) setDraft(name, draft, agordo, "agento");
          }
        }
        kroniko(name, { ago, fonto: "regilo", faceto });
        sendJson(response, { rev: draft.rev, stato: statoOf(name, draft) });
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
        for (const image of inspiro) {
          try {
            const read = await legiMaterialon(
              {
                filename: typeof image.filename === "string" ? image.filename : "",
                bytes: Buffer.from(typeof image.base64 === "string" ? image.base64 : "", "base64"),
              },
              { workdir: options.workdir, name, familyOf: familyOfFilename },
            );
            trovoj.push(...read.trovoj);
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
        // With a model, no fixed colour and no inspiration, the model chooses the lead colour.
        const provider = options.ki?.provider;
        const colourFixed =
          (typeof festgelegt.farbe === "string" && festgelegt.farbe.trim() !== "") ||
          trovoj.some((trovo) => trovo.kind === "farbo");
        let turn: Awaited<ReturnType<typeof babili>> | undefined;
        if (provider !== undefined && !colourFixed) {
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
              log: (line) => io.stderr(`${redact(line)}\n`),
            });
            kroniko(name, {
              ago: "babilo",
              fonto: "babilo",
              faceto: "gvidkoloro",
              teksto: "Leitfarbe zur Beschreibung (Einstiegsfragen)",
              modelo: provider.toString(),
              kosto: turn.kosto,
              detaloj: { antwort: turn.antwort, iloj: turn.iloj },
            });
            babiloj.set(name, [
              ...(babiloj.get(name) ?? []),
              { role: "assistant", content: turn.antwort },
            ]);
          } catch (error) {
            io.stderr(
              `Kreilo: ${redact(error instanceof Error ? error.message : String(error))}\n`,
            );
          }
        }
        mkdirSync(join(options.workdir, name), { recursive: true });
        writeFileSync(
          join(options.workdir, name, "kreilo.json"),
          `${JSON.stringify({ celo, karaktero, festgelegt }, null, 2)}\n`,
        );
        sendJson(response, {
          facetoj: result.facetoj,
          satz: result.satz,
          rev: draft.rev,
          stato: statoOf(name, draft),
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
            },
          );
        } catch (error) {
          sendJson(
            response,
            {
              satz:
                error instanceof NeLegebla
                  ? error.message
                  : `Das Material ließ sich nicht lesen: ${error instanceof Error ? error.message : String(error)}`,
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
        const proponoj = proponojOf(read.trovoj, bases);
        writeProponoj(options.workdir, name, proponoj);
        for (const propono of proponoj) {
          kroniko(name, {
            ago: "propono",
            fonto: "agento",
            faceto: propono.faceto,
            teksto: propono.satz,
            detaloj: { agordo: propono.agordo, herkunft: propono.herkunft },
          });
        }
        sendJson(response, { proponoj, satzoj: read.satzoj, trovoj: read.trovoj.length });
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
      const draft = draftOf(name);
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
      if (action === "pruefung") {
        const klartext = klartextOfDraft(draft);
        sendJson(response, { ...klartext, html: klartextHtml(klartext, { firstAsMain: true }) });
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
        festlegen(name, draft, body, response);
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
      if (draft === undefined || ref === undefined || method !== "GET") {
        notFound(response);
        return;
      }
      const kombination = kombinationOf(url.searchParams);
      const marko = readMarko(options.workdir, name);
      sendHtml(
        response,
        komponentoScreen({
          view: komponentoView(ref, draft.agordo, bases, kombination, zeloOf(url.searchParams)),
          marko: {
            name,
            agordo: draft.agordo,
            saved:
              marko !== undefined && JSON.stringify(marko.agordo) === JSON.stringify(draft.agordo),
            rev: draft.rev,
          },
          kombination,
          komponentoj: komponentoList(bases),
          probleme: problemeOf(pruefungOf(draft)),
          expert: expertOf(draft.agordo),
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
      if (method !== "GET" || !isStudioPage(page)) {
        notFound(response);
        return;
      }
      const kombination = kombinationOf(url.searchParams);
      const marko = readMarko(options.workdir, name);
      const derivation = pruefungOf(draft);
      const message =
        url.searchParams.get("gespeichert") === "1"
          ? [
              "Gespeichert.",
              ...(draft.eksporto?.sentences ?? []),
              ...(draft.eksporto?.issues ?? []),
            ].join(" ")
          : undefined;
      sendHtml(
        response,
        studioScreen({
          page,
          marko: {
            name,
            agordo: draft.agordo,
            saved:
              marko !== undefined && JSON.stringify(marko.agordo) === JSON.stringify(draft.agordo),
            rev: draft.rev,
          },
          kombination,
          groups: studioRows(page, draft.agordo, bases, kombination),
          probleme: problemeOf(derivation),
          ...(message === undefined ? {} : { message }),
          expert: expertOf(draft.agordo),
          komponentoj: komponentoList(bases),
        }),
      );
      return;
    }

    const marko = /^\/marko\/([a-z0-9-]+)\/([a-z]+)(\.css)?$/.exec(path);
    if (marko !== null) {
      const [, name = "", key = "", css] = marko;
      const draft = draftOf(name);
      if (draft === undefined) {
        notFound(response);
        return;
      }
      if (method === "GET" && key === "vorschau" && css === ".css") {
        response
          .writeHead(200, { "content-type": TYPES[".css"] ?? "" })
          .end(previewCss(draft.agordo, bases));
        return;
      }
      if (method === "GET" && key === "vorschau" && url.searchParams.has("sxtupo")) {
        const sxtupo = url.searchParams.get("sxtupo") ?? "vorschau";
        const breite = url.searchParams.get("breite") ?? "mittel";
        sendHtml(
          response,
          previewDocument({
            name,
            cssHref: `/marko/${encodeURIComponent(name)}/vorschau.css?rev=${draft.rev}`,
            fontFace: fontFaceOf(draft.agordo),
            scheme: url.searchParams.get("scheme") === "dark" ? "dark" : "light",
            attributes: Object.fromEntries(
              (["density", "contrast", "viewport"] as const)
                .map((key) => [`data-fm-${key}`, url.searchParams.get(key) ?? ""])
                .filter(([, value]) => value !== ""),
            ),
            body: previewBody(
              isSxtupoKey(sxtupo) ||
                sxtupo.startsWith("studio-") ||
                sxtupo.startsWith("komponento-")
                ? sxtupo
                : "vorschau",
              breite,
              draft.agordo,
              zeloOf(url.searchParams),
            ),
          }),
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
      if (key === "fertig") {
        extra.klartext = klartextOfDraft(draft);
        if (url.searchParams.get("gespeichert") === "1") {
          extra.message = "Gespeichert.";
          if (draft.eksporto !== undefined) extra.eksporto = draft.eksporto;
        }
      }
      sendHtml(response, screen(inputOf(key, name, extra)));
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
  return {
    url,
    port,
    close: () =>
      new Promise<void>((done, fail) => {
        server.closeAllConnections();
        server.close((error) => (error === undefined ? done() : fail(error)));
      }),
  };
}

export { MARKEN_DIR };
