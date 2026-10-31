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
