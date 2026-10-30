// The context-free agent (Spec 030, Ablauf 2): one task and one access. Variante F gets the tools of
// the Gvidanto (MCP) and its prompt, Variante 0 nothing but “build it as HTML”. Provider and model
// come from the .env (FM_KI_ANBIETER, FM_KI_MODELL) with the key of that provider; the three
// providers of Spec 023 speak the same chat-completions protocol. The key is held in a private
// field and never written: not in a log line, not in an error, not in a result. A budget of tokens
// stops a run before a call that would pass it (Kostengrenze).

import {
  Budget,
  type ChatMessage,
  CostLimitReached,
  chatCompletion,
  type Fetch,
  functionOf,
  KEY_NAMES,
  Provider,
  type ProviderName,
  providerOf,
  type ToolInfo,
} from "@fundamento/metiejo";

export type { Fetch, ProviderName, ToolInfo };
// Spec 033 S1: provider, key, budget and the request with its waits live in @fundamento/metiejo,
// shared with the Asistanto; this module keeps its names for the run and the tests.
export { Budget, CostLimitReached, KEY_NAMES, Provider, providerOf };

/** The Gvidanto as the agent sees it: the list of tools and a call that returns text. */
export interface ToolBridge {
  list(): Promise<ToolInfo[]>;
  call(name: string, args: Record<string, unknown>): Promise<string>;
  /** The prompt of the server that says how to use the tools (MCP prompt gvidanto). */
  prompt?(): Promise<string>;
}

export interface AgentOptions {
  provider: Provider;
  fetch?: Fetch;
  task: string;
  variant: "F" | "0";
  tools?: ToolBridge;
  budget: Budget;
  /** Calls of tools in one run; then the agent is asked for its answer. */
  maxToolCalls?: number;
  /** Characters of one tool result the agent gets; the rest is cut and marked. */
  maxToolResult?: number;
  /** Milliseconds one request may take. */
  timeout?: number;
  log?: (line: string) => void;
  /** The gate of the provider's limits (Nachlese 11 ④); every request passes it. */
  gate?: { pass(): Promise<void> };
  /** Waiting between attempts; a test passes its own. */
  sleep?: (ms: number) => Promise<void>;
}

export interface AgentEffort {
  inputTokens: number;
  outputTokens: number;
  toolCalls: number;
  ms: number;
  bytes: number;
  /** Requests to the provider, retries included (Nachlese 11 ④). */
  requests?: number;
}

export interface AgentResult {
  html: string;
  effort: AgentEffort;
  /** The conversation without the key: what the agent asked and was told. */
  transcript: { role: string; content: string; tool?: string }[];
}

/** The document in an answer: the last fenced html block, else the text itself. */
export function extractHtml(answer: string): string {
  const blocks = [...answer.matchAll(/```(?:html)?\s*\n([\s\S]*?)```/gi)];
  const last = blocks.at(-1)?.[1];
  return (last ?? answer).trim();
}

export const SYSTEM_F = [
  "Du baust Bildschirme für eine Webanwendung. Du hast Zugang zum Gvidanto von Fundamento, einem Design System, über seine Werkzeuge.",
  "Baue die Aufgabe als eine HTML-Seite mit den Web Components von Fundamento (Elemente fm-*). Die Styles und Skripte der Komponenten lädt die Seite selbst; schreibe nur das Markup, das in <body> steht.",
  "Frag den Gvidanto, welche Komponenten, Eigenschaften und Regeln es gibt, statt zu raten. Antworte am Ende nur mit dem HTML in einem ```html-Block.",
].join("\n");

export const PROMPT_0 =
  "Baue es als HTML. Antworte nur mit dem HTML-Dokument in einem ```html-Block.";

type Schema = Record<string, unknown>;

/**
 * The input schema as a provider takes it (Nachlese 12 ②): today's Gvidanto lists one object at
 * the root (Nachlese 11 B-3); an older system measured with today's tool still has oneOf, anyOf or
 * allOf there, and they are merged into one object as the tool of Spec 030 did – properties
 * together, required what every branch requires. The Gvidanto checks the input against its own
 * schema all the same.
 */
export function providerSchema(schema: Schema): Schema {
  const { $schema: _schema, oneOf, anyOf, allOf, ...rest } = schema;
  const branches = [oneOf, anyOf, allOf].find(Array.isArray) as Schema[] | undefined;
  if (branches === undefined) return rest;
  const properties: Schema = { ...((rest.properties as Schema | undefined) ?? {}) };
  for (const branch of branches) Object.assign(properties, (branch.properties as Schema) ?? {});
  const requiredOf = (branch: Schema) => new Set((branch.required as string[] | undefined) ?? []);
  const sets = branches.map(requiredOf);
  const fromBranches =
    allOf !== undefined
      ? sets.flatMap((set) => [...set])
      : [...(sets[0] ?? [])].filter((name) => sets.every((set) => set.has(name)));
  const required = [...new Set([...requiredOf(rest), ...fromBranches])];
  return { ...rest, type: "object", properties, ...(required.length === 0 ? {} : { required }) };
}

/**
 * One run of the agent. A failure carries what the run spent until then (`effort` on the error,
 * Nachlese 12 B-4), so the Lauf counts a result without a page by its own tokens.
 */
export async function runAgent(options: AgentOptions): Promise<AgentResult> {
  const spent: AgentEffort = {
    inputTokens: 0,
    outputTokens: 0,
    toolCalls: 0,
    ms: 0,
    bytes: 0,
    requests: 0,
  };
  const started = Date.now();
  try {
    return await runAgentInner(options, spent);
  } catch (error) {
    if (error instanceof Error && !(error instanceof CostLimitReached))
      Object.assign(error, { effort: { ...spent, ms: Date.now() - started } });
    throw error;
  }
}

async function runAgentInner(options: AgentOptions, spent: AgentEffort): Promise<AgentResult> {
  const { provider, task, variant, budget } = options;
  const request = options.fetch ?? (globalThis.fetch as Fetch);
  const log = (line: string) => options.log?.(provider.redact(line));
  const maxToolCalls = options.maxToolCalls ?? 24;
  const maxToolResult = options.maxToolResult ?? 20_000;
  const started = Date.now();
  const transcript: AgentResult["transcript"] = [];
  const messages: ChatMessage[] = [];
  let tools: ReturnType<typeof functionOf>[] | undefined;

  if (variant === "F") {
    if (options.tools === undefined) throw new Error("Variante F braucht den Gvidanto.");
    const guide = (await options.tools.prompt?.()) ?? "";
    messages.push({ role: "system", content: guide === "" ? SYSTEM_F : `${SYSTEM_F}\n\n${guide}` });
    messages.push({ role: "user", content: task });
    // Nachlese 11 B-3: the Gvidanto lists one object at the root; an older system (Nachlese 12 ②)
    // is merged into one.
    tools = (await options.tools.list()).map((tool) =>
      functionOf({ ...tool, inputSchema: providerSchema(tool.inputSchema) }),
    );
  } else {
    messages.push({ role: "user", content: `${task}\n\n${PROMPT_0}` });
  }
  for (const message of messages) transcript.push({ role: message.role, content: message.content });

  let inputTokens = 0;
  let outputTokens = 0;
  let toolCalls = 0;
  let requests = 0;
  const call = async (offerTools: boolean): Promise<ChatMessage> => {
    let result: Awaited<ReturnType<typeof chatCompletion>>;
    try {
      result = await chatCompletion(
        provider,
        {
          messages,
          ...(offerTools && tools !== undefined && tools.length > 0
            ? { tools, tool_choice: "auto" }
            : {}),
          temperature: 0.2,
        },
        budget,
        {
          fetch: request,
          timeout: options.timeout ?? 180_000,
          ...(options.gate === undefined ? {} : { gate: options.gate }),
          ...(options.sleep === undefined ? {} : { sleep: options.sleep }),
          log,
        },
      );
    } catch (error) {
      // Nachlese 12 B-4: the failed request counts too, answers without a message included.
      const failed = (error as { spent?: { input: number; output: number; requests: number } })
        .spent;
      if (failed !== undefined) {
        spent.requests = requests + failed.requests;
        spent.inputTokens = inputTokens + failed.input;
        spent.outputTokens = outputTokens + failed.output;
      }
      throw error;
    }
    requests += result.requests;
    inputTokens += result.input;
    outputTokens += result.output;
    spent.requests = requests;
    spent.inputTokens = inputTokens;
    spent.outputTokens = outputTokens;
    return result.message;
  };

  let answer = "";
  for (;;) {
    const message = await call(toolCalls < maxToolCalls);
    const requested = message.tool_calls ?? [];
    if (requested.length === 0 || options.tools === undefined) {
      answer = typeof message.content === "string" ? message.content : "";
      transcript.push({ role: "assistant", content: answer });
      break;
    }
    messages.push({ role: "assistant", content: message.content ?? "", tool_calls: requested });
    for (const entry of requested) {
      toolCalls += 1;
      spent.toolCalls = toolCalls;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(entry.function.arguments || "{}") as Record<string, unknown>;
      } catch {
        args = {};
      }
      let result: string;
      try {
        result = await options.tools.call(entry.function.name, args);
      } catch (error) {
        result = JSON.stringify({ error: String(error) });
      }
      const shown =
        result.length > maxToolResult
          ? `${result.slice(0, maxToolResult)}\n[gekürzt: ${result.length - maxToolResult} Zeichen]`
          : result;
      messages.push({
        role: "tool",
        content: shown,
        tool_call_id: entry.id,
        name: entry.function.name,
      });
      transcript.push({
        role: "tool",
        tool: `${entry.function.name} ${entry.function.arguments}`,
        content: shown.slice(0, 2_000),
      });
      log(`Werkzeug ${entry.function.name}`);
    }
    if (toolCalls >= maxToolCalls) {
      messages.push({
        role: "user",
        content: "Antworte jetzt mit der fertigen Seite in einem ```html-Block.",
      });
    }
  }
  const html = extractHtml(answer);
  return {
    html,
    effort: {
      inputTokens,
      outputTokens,
      toolCalls,
      ms: Date.now() - started,
      bytes: Buffer.byteLength(html),
      requests,
    },
    transcript,
  };
}
