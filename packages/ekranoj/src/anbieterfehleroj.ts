// Provider errors of a run (Spec 038 Lauf 5, A-1, AK-2, contract C-1): a single provider error
// never ends a run. metiejo's `chatCompletion` (tabu) already waits on 429 and retries 5xx and
// timeouts; what it still throws reaches this layer as a plain `Error` with the message shape
// „Anbieter <name> antwortet <status>: <body>“ (or a network error), the spent tokens on `spent`.
// This module classifies that error by its message, repeats (429/5xx/network, at most twice, with
// an injected wait), resends once with a cleaned message list (400), and hands the screen layer
// in rondoj.ts what is left: a fresh conversation in round 1, the previous fragment in round ≥ 2.
// 401/403, `CostLimitReached` and `DayLimitReached` still end the run. Every message is cleaned
// (key patterns, Authorization, query) before it is logged or written.

import type { Budget, ChatMessage, ToolInfo } from "@fundamento/metiejo";
import { haltigoDe, sendiSubBudgxeto } from "./kostoj.js";
import type { ChatModel, ChatRespondo, Peno } from "./tipoj.js";

/** What the run did after a caught provider error (C-1). */
export type AnbieterAgo = "ripeto" | "purigo" | "nova-konversacio" | "portita" | "rezigno";

/** One caught provider error (C-1): in `EkranojRezulto`, `raporto.json` and nordstelo's `kuro.json`. */
export interface AnbieterEraro {
  /** The screen slug; {@link PLANA_EKRANO} for the plan request. */
  ekrano: string;
  /** The round (1 … 3); 0 for the plan request. */
  rondo: number;
  /** The 1-based number of the caught error within that screen-round. */
  provo: number;
  /** The HTTP status; 0 = network error or timeout. */
  status: number;
  /** The provider's message, cleaned (no key, no Authorization, no query), at most 300 chars. */
  mesagxo: string;
  ago: AnbieterAgo;
}

/** The `ekrano` of an error of the plan request: no slug can look like it (`SLUG_FORMO`). */
export const PLANA_EKRANO = "(plano)";
/** Repeats after a 429, a 5xx or a network error, per request (A-1). */
export const MAKS_RIPETOJ = 2;
/** The waits before the first and the second repeat, in ms (after metiejo's own waits). */
export const RIPETA_ATENDO: readonly number[] = [10_000, 30_000];
/** The longest cleaned provider message (C-1). */
export const MAKS_MESAGXO = 300;

/** How the run treats one error of a request. */
export interface AnbieterKlaso {
  status: number;
  /** `ripeto` 429/5xx/network · `purigo` 400 · `halto` 401/403 · `rezigno` any other status. */
  speco: "ripeto" | "purigo" | "halto" | "rezigno";
  /** The cleaned message (≤ 300 chars). */
  mesagxo: string;
}

const ENTFERNT = "[entfernt]";

/**
 * The cleaning rules, in order: a header value first (with its scheme), then Bearer values, key
 * patterns (`sk-…`, 32 or more letters mixed with digits in one piece – Mistral's keys) and every
 * query string (`?a=b&c=d` → `?[entfernt]`).
 */
const PURIGOJ: readonly (readonly [RegExp, string])[] = [
  [
    /\b(authorization|proxy-authorization|x-api-key|api[-_]?key)(["']?\s*[:=]\s*["']?)(?:(?:bearer|basic)\s+)?[^\s"',;}&]+/gi,
    `$1$2${ENTFERNT}`,
  ],
  [/\b(bearer)\s+(?!\[entfernt\])[^\s"',;}]+/gi, `$1 ${ENTFERNT}`],
  [/\bsk-[A-Za-z0-9_-]{8,}/g, ENTFERNT],
  [/\b(?=[A-Za-z0-9]*\d)(?=[A-Za-z0-9]*[A-Za-z])[A-Za-z0-9]{32,}\b/g, ENTFERNT],
  [/[?&][\w.~-]+=[^\s"'<>]*/g, `?${ENTFERNT}`],
];

/** Takes secrets out of a text: key patterns, Authorization/Bearer, query strings. */
export function purigiTekston(teksto: string): string {
  let purigita = teksto;
  for (const [sxablono, anstataux] of PURIGOJ) purigita = purigita.replace(sxablono, anstataux);
  return purigita;
}

/** {@link purigiTekston}, then cut to {@link MAKS_MESAGXO} characters (C-1 `mesagxo`). */
export function purigiMesagxon(teksto: string): string {
  return purigiTekston(teksto).slice(0, MAKS_MESAGXO);
}

/** The message of metiejo's `chatCompletion` for a status it does not retry (any more). */
const STATUSA_MESAGXO = /^Anbieter \S+ antwortet (\d{3})\b/;
/** metiejo's answer without a message after its own retries. */
const SEN_MESAGXO = /^Anbieter \S+: Antwort ohne Nachricht/;
/** A network error or a timeout as `String(error)` of fetch. */
const RETA_MESAGXO =
  /fetch failed|network|socket hang up|ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|EPIPE|UND_ERR|TimeoutError|AbortError|terminated/i;

/** The class of an error of a request; undefined = not a provider error (it passes through). */
export function klasigiEraron(error: unknown): AnbieterKlaso | undefined {
  if (!(error instanceof Error)) return undefined;
  if (haltigoDe(error) !== undefined) return undefined;
  const mesagxo = purigiMesagxon(error.message);
  const statusa = STATUSA_MESAGXO.exec(error.message);
  if (statusa !== null) {
    const status = Number(statusa[1]);
    const speco: AnbieterKlaso["speco"] =
      status === 401 || status === 403
        ? "halto"
        : status === 429 || status >= 500
          ? "ripeto"
          : status === 400
            ? "purigo"
            : "rezigno";
    return { status, speco, mesagxo };
  }
  // Anything else thrown inside chatCompletion carries `spent` (fetch, the body, no message).
  if (SEN_MESAGXO.test(error.message) || RETA_MESAGXO.test(error.message) || "spent" in error) {
    return { status: 0, speco: "ripeto", mesagxo };
  }
  return undefined;
}

/**
 * The message list of a resend after a 400: no assistant message without content and without
 * tool_calls, no tool answer without its call, no two user messages in a row (joined).
 */
export function puriMesagxojn(messages: readonly ChatMessage[]): ChatMessage[] {
  const purigitaj: ChatMessage[] = [];
  const vokoj = new Set<string>();
  for (const mesagxo of messages) {
    if (mesagxo.role === "assistant") {
      const ilaj = mesagxo.tool_calls ?? [];
      if (ilaj.length === 0 && (mesagxo.content ?? "").trim() === "") continue;
      for (const voko of ilaj) vokoj.add(voko.id);
    }
    if (mesagxo.role === "tool" && !vokoj.has(mesagxo.tool_call_id ?? "")) continue;
    const antaua = purigitaj.at(-1);
    if (mesagxo.role === "user" && antaua?.role === "user") {
      purigitaj[purigitaj.length - 1] = {
        ...antaua,
        content: `${antaua.content}\n\n${mesagxo.content}`,
      };
      continue;
    }
    purigitaj.push({ ...mesagxo });
  }
  return purigitaj;
}

const AGOJ: ReadonlySet<string> = new Set<AnbieterAgo>([
  "ripeto",
  "purigo",
  "nova-konversacio",
  "portita",
  "rezigno",
]);

function cxuAnbieterEraro(valoro: unknown): valoro is AnbieterEraro {
  if (typeof valoro !== "object" || valoro === null) return false;
  const e = valoro as Record<string, unknown>;
  return (
    typeof e.ekrano === "string" &&
    typeof e.rondo === "number" &&
    typeof e.provo === "number" &&
    typeof e.status === "number" &&
    typeof e.mesagxo === "string" &&
    typeof e.ago === "string" &&
    AGOJ.has(e.ago)
  );
}

/** An entry with its message cleaned once more (idempotent), keys in C-1 order. */
export function puraEro(e: AnbieterEraro): AnbieterEraro {
  return {
    ekrano: e.ekrano,
    rondo: e.rondo,
    provo: e.provo,
    status: e.status,
    mesagxo: purigiMesagxon(e.mesagxo),
    ago: e.ago,
  };
}

/** The entries an error carries out of `kuruEkranojn` (cleaned), undefined when none. */
export function anbieterfehlerojDe(error: unknown): AnbieterEraro[] | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const eroj = (error as { anbieterfehleroj?: unknown }).anbieterfehleroj;
  if (!Array.isArray(eroj)) return undefined;
  const validaj = eroj.filter(cxuAnbieterEraro).map(puraEro);
  return validaj.length === 0 ? undefined : validaj;
}

/** The request layer gave up on a request (after its repeats or its clean resend). */
export class AnbieterRezigno extends Error {
  readonly status: number;
  readonly mesagxo: string;

  constructor(status: number, mesagxo: string) {
    super(`Anbieterfehler ${status}: ${mesagxo}`);
    this.name = "AnbieterRezigno";
    this.status = status;
    this.mesagxo = mesagxo;
  }
}

/** The provider refused the key (401/403): the run ends at once, with this reason. */
export class SxlosiloMalakceptita extends Error {
  readonly status: number;

  constructor(status: number, mesagxo: string) {
    super(`Der Anbieter lehnt den Schlüssel ab (${status}): ${mesagxo}`);
    this.name = "SxlosiloMalakceptita";
    this.status = status;
  }
}

/** The state of the catch layer of one screen-round (or of the plan request). */
export interface FehlerKaptilo {
  ekrano: string;
  rondo: number;
  /** Caught errors so far in this screen-round. */
  provo: number;
  /** The run's list; entries are appended in order. */
  eroj: AnbieterEraro[];
  dormi: (ms: number) => Promise<void>;
  log: (linio: string) => void;
}

const AGO_TEKSTOJ: Readonly<Record<AnbieterAgo, string>> = {
  ripeto: "neuer Versuch nach einer Wartezeit",
  purigo: "neu mit bereinigter Nachrichtenliste",
  "nova-konversacio": "neu in einem frischen Gespräch",
  portita: "der Screen behält das Fragment der Vorrunde",
  rezigno: "aufgegeben",
};

/** Notes one caught error: the entry (C-1) and a log line, both cleaned. */
export function noti(
  kaptilo: FehlerKaptilo,
  status: number,
  mesagxo: string,
  ago: AnbieterAgo,
): void {
  const ero = puraEro({
    ekrano: kaptilo.ekrano,
    rondo: kaptilo.rondo,
    provo: kaptilo.provo,
    status,
    mesagxo,
    ago,
  });
  kaptilo.eroj.push(ero);
  const kie = ero.ekrano === PLANA_EKRANO ? "Plananfrage" : `${ero.ekrano} Runde ${ero.rondo}`;
  kaptilo.log(
    `${kie}: Anbieterfehler ${ero.status} (Versuch ${ero.provo}): ${ero.mesagxo} – ${AGO_TEKSTOJ[ago]}`,
  );
}

/** What a failed call spent (metiejo `error.spent`) into the run's effort. */
function kalkuliElspezon(peno: Peno, error: unknown): void {
  if (typeof error !== "object" || error === null) return;
  const spent = (error as { spent?: { input?: unknown; output?: unknown; requests?: unknown } })
    .spent;
  if (spent === undefined || spent === null) return;
  const nombro = (valoro: unknown) => (typeof valoro === "number" && valoro > 0 ? valoro : 0);
  peno.inputTokens += nombro(spent.input);
  peno.outputTokens += nombro(spent.output);
  peno.requests += nombro(spent.requests);
}

/**
 * One request with the catch layer (A-1): after a 429, a 5xx or a network error it waits and
 * repeats (at most {@link MAKS_RIPETOJ} times), after a 400 it resends once with the cleaned list
 * (the conversation keeps the cleaned list). Any other provider error, or one left after that,
 * becomes {@link AnbieterRezigno} for the screen layer; 401/403 become {@link SxlosiloMalakceptita};
 * the limits and every non-provider error pass through unchanged. Every failed attempt counts in
 * `peno` with what it spent.
 */
export async function sendiKunKapto(
  chat: ChatModel,
  budget: Budget,
  peno: Peno,
  messages: ChatMessage[],
  tools: readonly ToolInfo[] | undefined,
  kaptilo: FehlerKaptilo,
): Promise<ChatRespondo> {
  let ripetoj = 0;
  let purigita = false;
  for (;;) {
    try {
      return await sendiSubBudgxeto(chat, budget, messages, tools);
    } catch (error) {
      kalkuliElspezon(peno, error);
      const klaso = klasigiEraron(error);
      if (klaso === undefined) throw error;
      if (klaso.speco === "halto") throw new SxlosiloMalakceptita(klaso.status, klaso.mesagxo);
      kaptilo.provo += 1;
      if (klaso.speco === "ripeto" && ripetoj < MAKS_RIPETOJ) {
        const atendo = RIPETA_ATENDO[ripetoj] ?? RIPETA_ATENDO.at(-1) ?? 0;
        ripetoj += 1;
        noti(kaptilo, klaso.status, klaso.mesagxo, "ripeto");
        await kaptilo.dormi(atendo);
        continue;
      }
      if (klaso.speco === "purigo" && !purigita) {
        purigita = true;
        noti(kaptilo, klaso.status, klaso.mesagxo, "purigo");
        messages.splice(0, messages.length, ...puriMesagxojn(messages));
        continue;
      }
      throw new AnbieterRezigno(klaso.status, klaso.mesagxo);
    }
  }
}

/** The real wait before a repeat (tests inject their own `dormi`). */
export const realaDormo = (ms: number): Promise<void> =>
  new Promise((finis) => {
    setTimeout(finis, ms);
  });
