// The context-free agent (Spec 030, Ablauf 2): one task and one access. Variante F gets the tools of
// the Gvidanto (MCP) and its prompt, Variante 0 nothing but “build it as HTML”. Provider and model
// come from the .env (FM_KI_ANBIETER, FM_KI_MODELL) with the key of that provider; the three
// providers of Spec 023 speak the same chat-completions protocol. The key is held in a private
// field and never written: not in a log line, not in an error, not in a result. A budget of tokens
// stops a run before a call that would pass it (Kostengrenze).

export type ProviderName = "mistral" | "openai" | "openrouter";

const BASE_URLS: Record<ProviderName, string> = {
  mistral: "https://api.mistral.ai/v1",
  openai: "https://api.openai.com/v1",
  openrouter: "https://openrouter.ai/api/v1",
};

const KEY_NAMES: Record<ProviderName, string> = {
  mistral: "MISTRAL_API_KEY",
  openai: "OPENAI_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
};

export class Provider {
  readonly #key: string;
  readonly name: ProviderName;
  readonly model: string;
  readonly baseUrl: string;

  constructor(name: ProviderName, model: string, key: string) {
    this.name = name;
    this.model = model;
    this.baseUrl = BASE_URLS[name];
    this.#key = key;
  }

  authorization(): string {
    return `Bearer ${this.#key}`;
  }

  /** Replaces the key wherever a text of the provider repeats it. */
  redact(text: string): string {
    return this.#key === "" ? text : text.split(this.#key).join("‹Schlüssel›");
  }

  toString(): string {
    return `${this.name}/${this.model}`;
  }

  toJSON(): { name: ProviderName; model: string; baseUrl: string } {
    return { name: this.name, model: this.model, baseUrl: this.baseUrl };
  }
}

/** The provider of the settings; an error names the variable that is missing, never a value. */
export function providerOf(values: Readonly<Record<string, string | undefined>>): Provider {
  const name = (values.FM_KI_ANBIETER ?? "").trim().toLowerCase();
  if (!(name in BASE_URLS)) {
    throw new Error(`FM_KI_ANBIETER muss mistral, openai oder openrouter sein (in der .env).`);
  }
  const provider = name as ProviderName;
  const model = (values.FM_KI_MODELL ?? "").trim();
  if (model === "") throw new Error("FM_KI_MODELL fehlt in der .env.");
  const key = values[KEY_NAMES[provider]] ?? "";
  if (key === "") throw new Error(`${KEY_NAMES[provider]} fehlt in der .env.`);
  return new Provider(provider, model, key);
}

export class CostLimitReached extends Error {
  constructor(
    readonly limit: number,
    readonly spent: number,
  ) {
    super(`Kostengrenze ${limit} Tokens erreicht (verbraucht: ${spent}).`);
    this.name = "CostLimitReached";
  }
}

/** Tokens of a run or of a whole Lauf; one Budget can be shared by every call. */
export class Budget {
  spent = 0;
  input = 0;
  output = 0;
  /** The most one call has cost so far: the estimate of the next. */
  largestCall = 0;

  constructor(readonly limit: number) {}

  charge(input: number, output: number): void {
    this.input += input;
    this.output += output;
    this.spent += input + output;
    this.largestCall = Math.max(this.largestCall, input + output);
  }

  /** Throws before a call whose estimated cost would pass the limit. */
  ensure(estimate = this.largestCall): void {
    if (this.spent + estimate > this.limit || this.spent >= this.limit) {
      throw new CostLimitReached(this.limit, this.spent);
    }
  }
}

export interface ToolInfo {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
}

/** The Gvidanto as the agent sees it: the list of tools and a call that returns text. */
export interface ToolBridge {
  list(): Promise<ToolInfo[]>;
  call(name: string, args: Record<string, unknown>): Promise<string>;
  /** The prompt of the server that says how to use the tools (MCP prompt gvidanto). */
  prompt?(): Promise<string>;
}

export type Fetch = (url: string, init: RequestInit) => Promise<Response>;

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
}

export interface AgentEffort {
  inputTokens: number;
  outputTokens: number;
  toolCalls: number;
  ms: number;
  bytes: number;
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

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: { id: string; type: "function"; function: { name: string; arguments: string } }[];
  tool_call_id?: string;
  name?: string;
}

interface ChatReply {
  choices?: { message?: ChatMessage }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

type Schema = Record<string, unknown>;

/**
 * The input schema as a function of the provider. OpenAI takes no oneOf/anyOf/allOf at the top
 * of the parameters; the branches are merged into one object (their properties together, required
 * what every branch requires). The Gvidanto still checks the input against its own schema.
 */
export function flattenSchema(schema: Schema): Schema {
  const { $schema: _schema, oneOf, anyOf, allOf, ...rest } = schema;
  const branches = [oneOf, anyOf, allOf].find(Array.isArray) as Schema[] | undefined;
  if (branches === undefined) return rest;
  const properties: Record<string, unknown> = {
    ...((rest.properties as Record<string, unknown>) ?? {}),
  };
  const requiredOf = (branch: Schema) => new Set((branch.required as string[] | undefined) ?? []);
  for (const branch of branches)
    Object.assign(properties, (branch.properties as Record<string, unknown>) ?? {});
  let required = [...requiredOf(rest)];
  if (allOf !== undefined) {
    for (const branch of branches) required.push(...requiredOf(branch));
  } else {
    const sets = branches.map(requiredOf);
    const first = sets[0] ?? new Set<string>();
    required.push(...[...first].filter((name) => sets.every((set) => set.has(name))));
  }
  required = [...new Set(required)];
  return {
    ...rest,
    type: "object",
    properties,
    ...(required.length === 0 ? {} : { required }),
  };
}

function functionOf(tool: ToolInfo) {
  return {
    type: "function" as const,
    function: {
      name: tool.name,
      description: (tool.description ?? "").slice(0, 1000),
      parameters: flattenSchema(tool.inputSchema),
    },
  };
}

export async function runAgent(options: AgentOptions): Promise<AgentResult> {
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
    tools = (await options.tools.list()).map(functionOf);
  } else {
    messages.push({ role: "user", content: `${task}\n\n${PROMPT_0}` });
  }
  for (const message of messages) transcript.push({ role: message.role, content: message.content });

  let inputTokens = 0;
  let outputTokens = 0;
  let toolCalls = 0;

  const call = async (offerTools: boolean): Promise<ChatMessage> => {
    budget.ensure();
    const body = {
      model: provider.model,
      messages,
      ...(offerTools && tools !== undefined && tools.length > 0
        ? { tools, tool_choice: "auto" }
        : {}),
      temperature: 0.2,
    };
    for (let attempt = 0; ; attempt++) {
      const response = await request(`${provider.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: provider.authorization() },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(options.timeout ?? 180_000),
      });
      const text = await response.text();
      if (!response.ok) {
        if ((response.status === 429 || response.status >= 500) && attempt < 3) {
          log(
            `Anbieter ${provider.name} antwortet ${response.status}, neuer Versuch ${attempt + 1}`,
          );
          await sleep([2_000, 8_000, 20_000][attempt] ?? 20_000);
          continue;
        }
        throw new Error(
          `Anbieter ${provider.name} antwortet ${response.status}: ${provider.redact(text).slice(0, 300)}`,
        );
      }
      const reply = JSON.parse(text) as ChatReply;
      const input = reply.usage?.prompt_tokens ?? 0;
      const output = reply.usage?.completion_tokens ?? 0;
      inputTokens += input;
      outputTokens += output;
      budget.charge(input, output);
      const message = reply.choices?.[0]?.message;
      if (message === undefined)
        throw new Error(`Anbieter ${provider.name}: Antwort ohne Nachricht.`);
      return message;
    }
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
    },
    transcript,
  };
}
