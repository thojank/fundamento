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

/** Takes secrets out of a text: key patterns, Authorization/Bearer, query strings. */
export function purigiTekston(_teksto: string): string {
  throw new Error("S038-32: purigiTekston ne implementita");
}

/** {@link purigiTekston}, then cut to {@link MAKS_MESAGXO} characters (C-1 `mesagxo`). */
export function purigiMesagxon(_teksto: string): string {
  throw new Error("S038-32: purigiMesagxon ne implementita");
}

/** The class of an error of a request; undefined = not a provider error (it passes through). */
export function klasigiEraron(_error: unknown): AnbieterKlaso | undefined {
  throw new Error("S038-32: klasigiEraron ne implementita");
}

/** The message list of a resend after a 400. */
export function puriMesagxojn(_messages: readonly ChatMessage[]): ChatMessage[] {
  throw new Error("S038-32: puriMesagxojn ne implementita");
}

/** The entries an error carries out of `kuruEkranojn` (cleaned), undefined when none. */
export function anbieterfehlerojDe(_error: unknown): AnbieterEraro[] | undefined {
  throw new Error("S038-32: anbieterfehlerojDe ne implementita");
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

/** One request with the catch layer: repeats, clean resend, else {@link AnbieterRezigno}. */
export async function sendiKunKapto(
  _chat: ChatModel,
  _budget: Budget,
  _peno: Peno,
  _messages: ChatMessage[],
  _tools: readonly ToolInfo[] | undefined,
  _kaptilo: FehlerKaptilo,
): Promise<ChatRespondo> {
  throw new Error("S038-32: sendiKunKapto ne implementita");
}
