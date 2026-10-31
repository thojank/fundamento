// Costs of a run (D-20, D-25): the estimate before the start and the one token budget of the whole
// run. The estimate counts tokens per screen and round with measured values and prices them
// with metiejo's `kostoOf`; a model without a price has unknown costs, never 0. The budget is
// metiejo's `Budget(maksTokenoj)`: it stops the run before a request whose estimate (the largest
// request so far) would pass the limit (`CostLimitReached`); the run keeps what it built (AC-9).

import {
  type Budget,
  type ChatMessage,
  CostLimitReached,
  DayLimitReached,
  kostoOf,
  type ToolInfo,
} from "@fundamento/metiejo";
import { MAKS_EKRANOJ, MAKS_RONDOJ } from "./plano.js";
import type { ChatModel, ChatRespondo, Haltigo, KostoTakso, Varianto } from "./tipoj.js";

/**
 * Tokens of one screen in one round, Variante F – an estimate, not a limit. Measured in the model
 * runs of Spec 037 (S037-10; `specs/037-agenten-ekranoj/plan.md`, Messungen and Befund S037-10-2): the
 * acceptance run komuna spent 213 397 tokens on the plan request and three built screen-rounds,
 * ≈ 70 000 per screen-round (provo alike); the measurement point spent ≈ 176 000 per screen-round
 * (4 brands, more tool calls). The value is the acceptance one, rounded; the first estimate of
 * Reihe K pages (≈ 40 000, D-20) was 3–4 × too low because every request resends the conversation.
 */
export const TOKENOJ_EKRANO_RONDO_F = 70_000;
/** The same for Variante 0: Reihe K ≈ 1,5 k per page, rounded up (D-20). */
export const TOKENOJ_EKRANO_RONDO_0 = 2_000;
/** The plan request: one sentence in, one plan of ≤ 5 screens out (D-20). */
export const TOKENOJ_PLANO = 5_000;

export interface TaksoEnigo {
  /** Screens to build; unknown before the plan request → the limit of 5 (V-2). */
  ekranoj?: number;
  rondoj?: number;
  varianto: Varianto;
  planPeto: boolean;
  /** `<provider>/<model>`; absent → costs unknown. */
  modelo?: string;
  maksTokenoj: number;
}

const nombro = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const dolaro = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

/** $ for tokens, priced at the higher of the input and output price (the estimate does not split). */
function usdOf(modelo: string | undefined, tokenoj: number): number | undefined {
  if (modelo === undefined) return undefined;
  const enigo = kostoOf(modelo, { enigo: tokenoj, eligo: 0 });
  const eligo = kostoOf(modelo, { enigo: 0, eligo: tokenoj });
  if (enigo === undefined || eligo === undefined) return undefined;
  return Math.max(enigo, eligo);
}

/** The estimate before the start (D-20): screens × rounds × tokens per screen-round + plan request. */
export function taksiKostojn(enigo: TaksoEnigo): KostoTakso {
  const ekranoj = enigo.ekranoj ?? MAKS_EKRANOJ;
  const rondoj = enigo.rondoj ?? MAKS_RONDOJ;
  const perRondo = enigo.varianto === "F" ? TOKENOJ_EKRANO_RONDO_F : TOKENOJ_EKRANO_RONDO_0;
  const tokenoj = ekranoj * rondoj * perRondo + (enigo.planPeto ? TOKENOJ_PLANO : 0);
  const usd = usdOf(enigo.modelo, tokenoj);
  const superasLimon = tokenoj > enigo.maksTokenoj;
  const kosto = usd === undefined ? "Kosten unbekannt" : `≈ ${dolaro.format(usd)} $`;
  const satz = [
    `Schätzung: ${ekranoj} Screens × ${rondoj} Runden (Variante ${enigo.varianto})`,
    enigo.planPeto ? " + Plananfrage" : "",
    ` ≈ ${nombro.format(tokenoj)} Tokens, ${kosto}`,
    enigo.modelo === undefined ? "" : ` (${enigo.modelo})`,
    superasLimon
      ? `; über der Grenze von ${nombro.format(enigo.maksTokenoj)} Tokens – der Lauf hält vorher an und liefert ein Teilergebnis.`
      : `; Grenze ${nombro.format(enigo.maksTokenoj)} Tokens.`,
  ].join("");
  return {
    ekranoj,
    rondoj,
    varianto: enigo.varianto,
    planPeto: enigo.planPeto,
    tokenoj,
    ...(usd === undefined ? {} : { usd }),
    ...(enigo.modelo === undefined ? {} : { modelo: enigo.modelo }),
    maksTokenoj: enigo.maksTokenoj,
    superasLimon,
    satz,
  };
}

/** The cost of what a run spent: $ via `kostoOf`; `{}` when the price is unknown (never 0). */
export function kostoDe(
  modelo: string | undefined,
  uzo: { enigo: number; eligo: number },
): { usd?: number } {
  if (modelo === undefined) return {};
  const usd = kostoOf(modelo, uzo);
  return usd === undefined ? {} : { usd };
}

/**
 * One request under the run's budget: checked before (metiejo `Budget.ensure`, the largest request
 * so far as the estimate of the next), charged after. A model that charges the budget itself (the
 * real adapter over `chatCompletion`) is not charged twice.
 */
export async function sendiSubBudgxeto(
  chat: ChatModel,
  budget: Budget,
  messages: readonly ChatMessage[],
  tools?: readonly ToolInfo[],
): Promise<ChatRespondo> {
  budget.ensure();
  const before = budget.spent;
  const respondo = await chat.send(messages, tools, budget);
  if (budget.spent === before) budget.charge(respondo.input, respondo.output);
  return respondo;
}

/** The stop reason of an error that ends the model part cleanly, undefined for any other. */
export function haltigoDe(error: unknown): Exclude<Haltigo, "eraro"> | undefined {
  if (error instanceof CostLimitReached) return "max-tokens";
  if (error instanceof DayLimitReached) return "tagolimo";
  const name = error instanceof Error ? error.name : "";
  if (name === "CostLimitReached") return "max-tokens";
  if (name === "DayLimitReached") return "tagolimo";
  return undefined;
}
