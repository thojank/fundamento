// The contracts of @fundamento/ekranoj (Spec 037, implementation spec §2.6, C-1 to C-7): the plan
// of a run, the facts of a rendered screen, the injected scorer, the navigation result, the green
// decision, the injected dependencies and the result of a run. Types only; the pure functions live
// in `plano.ts`, `navigado.ts`, `verda.ts` and `gardo.ts`. Everything Modelo-specific is injected
// (D-03), so this package never imports nordstelo, mcp, eroj or the Gvidanto (AC-10).

import type { Budget, ChatMessage, ToolInfo } from "@fundamento/metiejo";

export type { Budget, ChatMessage, ToolInfo };

/** A structured problem (code-style): where, which rule, what is wrong, what to do. */
export interface Problemo {
  /** JSON-Pointer-like path into the checked value, e.g. `/ekranoj/5`. */
  path: string;
  rule: string;
  message: string;
  suggestion: string;
}

// --- C-1 Plan ----------------------------------------------------------------------------------

/** One planned screen: a stable slug (file name), a title and its purpose. */
export interface PlanoEkrano {
  slug: string;
  titolo: string;
  celo: string;
}

/** A planned edge: screen `de` links to screen `al` (slugs). */
export interface Kanto {
  de: string;
  al: string;
}

/** The plan of a run: the purpose of the whole flow, its screens (≤ 5, V-2) and edges. */
export interface Plano {
  celo: string;
  ekranoj: PlanoEkrano[];
  kantoj: Kanto[];
}

// --- C-2 Facts ---------------------------------------------------------------------------------
// A structural twin of nordstelo's `Facts` (packages/nordstelo/src/facts.ts); it must stay
// assignable to it (S037-05 proves it at compile time). Only the light DOM of the agent fragment,
// the frame's elements excluded (D-27).

/** One element of the light DOM; `parent` is the index of its parent, -1 for a top element. */
export interface FaktoElemento {
  tag: string;
  attrs: Record<string, string>;
  parent: number;
  /** The element's own text nodes, whitespace collapsed. */
  text: string;
}

/** One node of the accessibility tree. */
export interface FaktoAria {
  role: string;
  name: string;
  level?: number;
}

/** One render in an Aspekto and a mode, with the axe-core findings (WCAG 2.2 A/AA). */
export interface FaktoBildigo {
  aspekto: string;
  scheme: "light" | "dark";
  contrast: "default" | "high";
  axe: { id: string; nodes: number }[];
}

/** What the browser measured on one screen, stored with the run (D-33). */
export interface Fakto {
  /** The language of the screen (`<html lang>`). */
  lingvo: string;
  /** Size of the markup the agent wrote. */
  bytes: number;
  elements: FaktoElemento[];
  aria: FaktoAria[];
  /** Errors in the console and uncaught errors, in every render. */
  console: string[];
  renders: FaktoBildigo[];
}

// --- C-3 Scorer --------------------------------------------------------------------------------

/** Variante F: the agent has the Gvidanto; Variante 0: only the task (D-07, D-34). */
export type Varianto = "F" | "0";

/** The six scored criteria of the north-star measure (Spec 030); K7 (effort) is never weighted. */
export type Kriterio = "K1" | "K2" | "K3" | "K4" | "K5" | "K6";

/** The score of one screen: share per criterion (null = does not apply), total, gaps. */
export interface Taksado {
  k: Record<Kriterio, number | null>;
  total: number;
  mankoj: { kind: string; key: string }[];
}

/** The injected scorer (D-03); nordstelo implements it with its unchanged `score()` (C-8). */
export interface Taksilo {
  taksi(e: { fakto: Fakto; ekrano: PlanoEkrano; varianto: Varianto }): Taksado;
}

// --- check_usage -------------------------------------------------------------------------------

/** The Regulo a violation cites, with its kialo. */
export interface MalobservoRegulo {
  id: string;
  name: string;
  kialo: string;
}

/**
 * One violation reported by the MCP tool `check_usage` – the shape of the Modelo's
 * `ValidationIssue`, restated here so the package needs no Gvidanto import (AC-10).
 */
export interface Malobservo {
  rule: string;
  severity: "error" | "warning" | "info";
  path: string;
  message: string;
  suggestion: string;
  regulo?: MalobservoRegulo;
  /** Where on the screen (S037-03, additive): the instances the violation is about, e.g. `fm-butono „Speichern“`. */
  loko?: string;
}

// --- C-4 Navigation ----------------------------------------------------------------------------

/** The navigation of one screen: its missing planned targets and its dead links. */
export interface EkranaNavigado {
  /** All planned outgoing edges present, no dead link, and the screen was built (has facts). */
  kompleta: boolean;
  /** Slugs of planned targets this screen does not link to, in plan order. */
  mankantaj: string[];
  /** Hrefs of this screen that lead nowhere, in document order, each once. */
  mortaj: string[];
}

/** The navigation of a whole flow (D-05, formula D-28). */
export interface NavigadoRezulto {
  /** `max(0, present planned edges − dead links) / planned edges`; 1 when nothing is planned and nothing is dead. */
  kvoto: number;
  mankantajKantoj: Kanto[];
  mortajLigiloj: { de: string; href: string }[];
  /** Planned screens that cannot be reached from the overview along the links, in plan order. */
  neatingeblaj: string[];
  perEkrano: Record<string, EkranaNavigado>;
}

// --- C-5 Green ---------------------------------------------------------------------------------

/** What keeps a screen from being green (D-04). */
export type Malhelpo =
  | "K1"
  | "check_usage"
  | "axe-nekontrolita"
  | "axe-hela"
  | "axe-malhela"
  | "K5"
  | "navigado";

export interface VerdaEnigo {
  varianto: Varianto;
  taksado: Taksado;
  /** check_usage violations of the screen (Variante F; ignored for Variante 0). */
  malobservoj: readonly Malobservo[];
  /** The facts of the render; absent when no renderer was there. */
  fakto?: Fakto;
  /** `kompleta` of the screen's navigation. */
  kompleta: boolean;
}

export interface VerdaDecido {
  verda: boolean;
  /** Every condition that failed, in the order of D-04. */
  malhelpoj: Malhelpo[];
  /** check_usage hints (warning, info): they never keep a screen from green, the report shows them. */
  sugestoj: Malobservo[];
}

// --- C-6 Injected dependencies -----------------------------------------------------------------

/** The answer of one chat request (D-18). */
export interface ChatRespondo {
  message: ChatMessage;
  input: number;
  output: number;
  requests: number;
}

/**
 * The chat model (D-18; not "Modelo", the binding term of the data model). The real adapter
 * wraps metiejo's `chatCompletion` and throws its `CostLimitReached` / `DayLimitReached` unchanged.
 */
export interface ChatModel {
  /**
   * One request. With a `budget` (S037-03, additive) the model checks it before the request and
   * charges it after, as metiejo's `chatCompletion` does; the run passes one Budget for all requests.
   */
  send(
    messages: readonly ChatMessage[],
    tools?: readonly ToolInfo[],
    budget?: Budget,
  ): Promise<ChatRespondo>;
  /** `<provider>/<model>` (metiejo `Provider.toString()`), for the price; absent = cost unknown. */
  readonly modelo?: string;
}

/** The Gvidanto as the agent sees it – the shape of nordstelo's `ToolBridge`. */
export interface ToolBridge {
  list(): Promise<ToolInfo[]>;
  call(name: string, args: Record<string, unknown>): Promise<string>;
  /** The prompt of the server that says how to use the tools (MCP prompt gvidanto). */
  prompt?(): Promise<string>;
}

/** A screen document handed to the renderer: frame plus agent fragment (D-24, D-27, D-34). */
export interface EkranaDokumento {
  slug: string;
  html: string;
  /** Absolute path of the written file, when the renderer should open it from disk. */
  dosiero?: string;
}

export interface BildigoRezulto {
  fakto: Fakto;
  bildoj: { hela: Uint8Array; malhela: Uint8Array };
}

/** The renderer (optional): absent means no browser – no photos, axe not checked, never green. */
export interface Bildigilo {
  render(
    dokumento: EkranaDokumento,
    opcioj: { aspektoj: readonly string[]; varianto: Varianto },
  ): Promise<BildigoRezulto>;
  close(): Promise<void>;
}

/**
 * What a brand build wrote (S037-04, D-24): the stylesheets and the self-contained Eroj bundle a
 * screen must load, as paths relative to the `marko/` folder (an absolute path inside it is read
 * relative to it). `skripto` is an ES module without imports (the Make-Kit `element.js`); ekranoj
 * writes it once more as a classic script, because Chromium refuses module scripts under `file://`.
 */
export interface MarkoKonstruo {
  css: string[];
  skripto?: string;
}

/** The brand build: writes it into `<out>/marko/` and says what a screen must load. */
export interface Marko {
  konstrui(dir: string): Promise<MarkoKonstruo>;
}

export interface EkranojDeps {
  chat: ChatModel;
  /** The MCP tools of the Gvidanto; absent for Variante 0. */
  tools?: ToolBridge;
  taksilo: Taksilo;
  bildigilo?: Bildigilo;
  marko: Marko;
  /** The clock, for the run id only. */
  nun: () => Date;
  /** A log sink; the caller redacts keys before anything is written. */
  log: (linio: string) => void;
  /** Receives the cost estimate before the first request (D-20; S037-03, additive). */
  takso?: (takso: KostoTakso) => void | Promise<void>;
  /** The seam for the screen documents and the output folder (S037-04; S037-03, additive). */
  eligo?: EkranojEligo;
}

/**
 * The seam between the flow and its output (S037-03 declares, S037-04 implements). Without it the
 * flow writes nothing: a screen document is the fragment in a minimal page, and the result is only
 * returned.
 */
export interface EkranojEligo {
  /**
   * The run starts writing (S037-04, additive): called once, after the estimate and before the
   * first request, with the brand build when one was made (Variante F only, D-34).
   */
  komenco?(e: EligoKomenco): void | Promise<void>;
  /** The screen document of a fragment: frame, brand build, back-link (D-24, D-27, D-34). */
  dokumento?(e: {
    ekrano: PlanoEkrano;
    fragmento: string;
    rondo: number;
    varianto: Varianto;
    lingvo: string;
  }): EkranaDokumento | Promise<EkranaDokumento>;
  /** A screen was rendered in round `rondo` (photos for `bildoj/`, facts for `rondoj/<n>/`). */
  bildigita?(e: { rondo: number; slug: string; bildigo: BildigoRezulto }): void | Promise<void>;
  /** A round was checked: its state per screen. */
  rondo?(e: { rondo: number; stato: Rondo; plano: Plano }): void | Promise<void>;
  /** The run ended (also a partial one): the whole result. */
  fino?(rezulto: EkranojRezulto): void | Promise<void>;
}

/** The start of the output (S037-04): input, variant, language, renderer present, brand build. */
export interface EligoKomenco {
  enigo: EkranojEnigo;
  varianto: Varianto;
  lingvo: string;
  /** A renderer (browser) is there; without one: no photos, axe not checked, never green. */
  bildigilo: boolean;
  /** The brand build in `<out>/marko/`; absent for Variante 0 (no Fundamento CSS/Eroj, D-34). */
  marko?: MarkoKonstruo;
}

/** The cost estimate before the start (D-20). */
export interface KostoTakso {
  ekranoj: number;
  rondoj: number;
  varianto: Varianto;
  /** Whether a plan request is counted (no plan given). */
  planPeto: boolean;
  tokenoj: number;
  /** $ for the tokens; absent when the model or its price is unknown („Kosten unbekannt“, never 0). */
  usd?: number;
  modelo?: string;
  maksTokenoj: number;
  /** The estimate is above `maksTokenoj`: the run will likely stop early (partial result). */
  superasLimon: boolean;
  /** One German sentence for the console and the report. */
  satz: string;
}

export interface EkranojEnigo {
  /** The sentence of the user. */
  frazo: string;
  /** The brand (Aspekto) the screens are rendered in. */
  marko: string;
  /** The output folder of the run. */
  out: string;
  /** Token budget of the whole run (`--max-tokens`). */
  maksTokenoj: number;
  /** The user's list of screen names; the agent plans purposes and edges for exactly these. */
  ekranoj?: string[];
  /** A given plan (nordstelo catalogue): no plan request. */
  plano?: Plano;
  varianto?: Varianto;
  lingvo?: "de" | "en";
}

// --- The result of a run -----------------------------------------------------------------------

/** The state of one screen after one round. */
export interface RondoEkrano {
  taksado: Taksado;
  /** check_usage violations with their Regulo and kialo. */
  malobservoj: Malobservo[];
  navigado: EkranaNavigado;
  verda: boolean;
  /** Set when the values are carried forward from the round the screen turned green (D-26). */
  verdaEkde?: number;
  /** What kept the screen from green (D-04 order); [] when green (S037-03, additive). */
  malhelpoj?: Malhelpo[];
  /** The agent fragment of this round (Variante 0: the full document) (S037-03, additive). */
  fragmento?: string;
  /** The facts the round was scored on (D-33; S037-03, additive). */
  fakto?: Fakto;
  /** The findings the next round gets as feedback (S037-03, additive). */
  trovoj?: Trovo[];
}

/** A finding of a check, as the agent gets it for the next round and the report shows it. */
export interface Trovo {
  /** The rule: a Regulo name, a check_usage rule, a scorer gap kind, `axe:<id>`, `navigado-…`. */
  regulo: string;
  /** The place: an instance, an href, a render. */
  loko: string;
  mesagxo: string;
  sugesto: string;
  kialo: string;
}

/** Round n (index n − 1): the state per screen slug. */
export type Rondo = Record<string, RondoEkrano>;

/** A deviation left after the last round – like a Jugxo: rule, place, reason. */
export interface Restanta {
  ekrano: string;
  regulo: string;
  loko: string;
  kialo: string;
}

/** K7, the effort of a run (never weighted, as Spec 030). */
export interface Peno {
  inputTokens: number;
  outputTokens: number;
  toolCalls: number;
  requests: number;
  ms: number;
  bytes: number;
}

/** A gap of Fundamento found by the runs (C-7, Teil 3; aggregation arrives in S037-06). */
export interface Manko {
  speco: "ero" | "sxablono" | "ilo";
  nomo: string;
  ofteco: number;
  taskoj: string[];
  ekzemplo: string;
  propono: string;
  celo: "eroj-rondo-6/7" | "muster-rondo-2" | "gvidanto";
}

export type Haltigo = "max-tokens" | "tagolimo" | "eraro";

export interface EkranojRezulto {
  dir: string;
  plano: Plano;
  rondoj: Rondo[];
  restantaj: Restanta[];
  mankoj: Manko[];
  peno: Peno;
  /** Cost in $; absent when the price of the model is unknown (never 0 then, D-20). */
  kosto: { usd?: number };
  haltigo?: Haltigo;
  /** The estimate before the start (S037-03, additive). */
  takso?: KostoTakso;
  /** Rounds the agent built in; `rondoj` may be longer when green screens are carried (D-26). */
  faritajRondoj?: number;
  /** Notes for the report: a shortened plan (D-38), the reason of a stop, a renderer error. */
  notoj?: string[];
}

/** The whole flow (implemented in S037-03): sentence and brand in, checked screens out. */
export type KuruEkranojn = (enigo: EkranojEnigo, deps: EkranojDeps) => Promise<EkranojRezulto>;
