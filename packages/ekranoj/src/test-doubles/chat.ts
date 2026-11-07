// A scripted chat model (D-18): answers from a script, checks and charges the Budget it is given
// as metiejo's `chatCompletion` does, and records every request. No network.

import type { Budget, ChatMessage, ChatModel, ChatRespondo, ToolInfo } from "../tipoj.js";

export interface Peto {
  messages: ChatMessage[];
  tools?: string[];
}

export type Skripto = (peto: Peto, index: number) => ChatRespondo | Error;

/** An answer with text and the tokens it cost (one request). */
export function respondo(
  content: string,
  tokenoj: { input?: number; output?: number } = {},
): ChatRespondo {
  return {
    message: { role: "assistant", content },
    input: tokenoj.input ?? 100,
    output: tokenoj.output ?? 20,
    requests: 1,
  };
}

/** An answer that calls tools. */
export function ilaRespondo(
  vokoj: { name: string; args?: Record<string, unknown> }[],
  tokenoj: { input?: number; output?: number } = {},
): ChatRespondo {
  return {
    message: {
      role: "assistant",
      content: "",
      tool_calls: vokoj.map((voko, index) => ({
        id: `voko-${index + 1}`,
        type: "function" as const,
        function: { name: voko.name, arguments: JSON.stringify(voko.args ?? {}) },
      })),
    },
    input: tokenoj.input ?? 100,
    output: tokenoj.output ?? 20,
    requests: 1,
  };
}

/** The slug of the screen a build request is about, from its task text. */
export function slugDePeto(peto: Peto): string | undefined {
  const tasko = peto.messages.find((m) => m.role === "user")?.content ?? "";
  return /Baue jetzt den Screen „[^“]*“ \(([a-z0-9-]+)\.html\)/.exec(tasko)?.[1];
}

/** The round a build request is about (1 when the task carries no earlier state). */
export function rondoDePeto(peto: Peto): number {
  const tasko = peto.messages.find((m) => m.role === "user")?.content ?? "";
  return Number(/^Runde (\d+):/m.exec(tasko)?.[1] ?? "1");
}

export class SkriptaModelo implements ChatModel {
  readonly petoj: Peto[] = [];
  readonly modelo?: string;
  readonly #skripto: Skripto;
  readonly #okazoj: string[] | undefined;

  constructor(skripto: Skripto, opcioj: { modelo?: string; okazoj?: string[] } = {}) {
    this.#skripto = skripto;
    this.#okazoj = opcioj.okazoj;
    if (opcioj.modelo !== undefined) this.modelo = opcioj.modelo;
  }

  async send(
    messages: readonly ChatMessage[],
    tools?: readonly ToolInfo[],
    budget?: Budget,
  ): Promise<ChatRespondo> {
    budget?.ensure();
    const peto: Peto = {
      messages: messages.map((m) => ({ ...m })),
      ...(tools === undefined ? {} : { tools: tools.map((tool) => tool.name) }),
    };
    this.petoj.push(peto);
    this.#okazoj?.push("send");
    const rezulto = this.#skripto(peto, this.petoj.length - 1);
    if (rezulto instanceof Error) throw rezulto;
    budget?.charge(rezulto.input, rezulto.output);
    return rezulto;
  }
}

// --- Provider errors (Spec 038 A-1) --------------------------------------------------------------

/** What a failed call spent, as metiejo's `chatCompletion` puts it on its error (`spent`). */
export interface Elspezo {
  input?: number;
  output?: number;
  requests?: number;
}

/**
 * A provider error in the shape metiejo's `chatCompletion` throws it for a status it does not retry
 * any more: „Anbieter <name> antwortet <status>: <body>“, the spent tokens on `spent`.
 */
export function anbieterEraro(status: number, korpo: string, elspezo: Elspezo = {}): Error {
  return Object.assign(new Error(`Anbieter mistral antwortet ${status}: ${korpo}`), {
    spent: {
      input: elspezo.input ?? 0,
      output: elspezo.output ?? 0,
      requests: elspezo.requests ?? 1,
      waits: 0,
    },
  });
}

/** A network error as `chatCompletion` throws it: the redacted `String(error)` of fetch. */
export function retaEraro(elspezo: Elspezo = {}): Error {
  return Object.assign(new Error("TypeError: fetch failed"), {
    spent: {
      input: elspezo.input ?? 0,
      output: elspezo.output ?? 0,
      requests: elspezo.requests ?? 1,
      waits: 0,
    },
  });
}

/** Mistral's answer to an assistant message without content and without tool_calls (Lauf 4). */
export const MISTRALA_400 =
  '{"object":"error","message":"Assistant message must have either content or tool_calls, but not none.","type":"invalid_request_message_order","param":null,"code":"3230"}';

/**
 * Mistral's rule in front of a script (F-S038-28-1): a request that holds an assistant message
 * without content and without tool_calls is refused with 400 and the real message text.
 */
export function mistralaRegulo(skripto: Skripto): Skripto {
  return (peto, index) => {
    const malplena = peto.messages.some(
      (m) =>
        m.role === "assistant" &&
        (m.content ?? "").trim() === "" &&
        (m.tool_calls === undefined || m.tool_calls.length === 0),
    );
    return malplena ? anbieterEraro(400, MISTRALA_400) : skripto(peto, index);
  };
}
