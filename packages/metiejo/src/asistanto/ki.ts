// The language model behind the Asistanto (Spec 033 S1) and the agents of the north-star measure
// (Spec 030, moved here from @fundamento/nordstelo so both speak through one client): provider and
// model come from the .env (FM_KI_ANBIETER, FM_KI_MODELL) with the key of that provider; the three
// providers of Spec 023 speak the same chat-completions protocol. The key is held in a private
// field and leaves it only in the authorization header: never in a log line, an error, a result, the
// Kroniko or the browser. A budget of tokens stops a turn before a call that would pass it; on 429
// the request waits with a growing interval and says so (Nachlese 11 ④).

export type ProviderName = "mistral" | "openai" | "openrouter";

const BASE_URLS: Record<ProviderName, string> = {
  mistral: "https://api.mistral.ai/v1",
  openai: "https://api.openai.com/v1",
  openrouter: "https://openrouter.ai/api/v1",
};

export const KEY_NAMES: Record<ProviderName, string> = {
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

export type Fetch = (url: string, init: RequestInit) => Promise<Response>;

export interface ChatMessage {
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

/** A tool as the chat-completions protocol offers it. */
export function functionOf(tool: ToolInfo) {
  return {
    type: "function" as const,
    function: {
      name: tool.name,
      description: (tool.description ?? "").slice(0, 1000),
      // Nachlese 11 B-3: one object at the root, valid for every provider.
      parameters: tool.inputSchema,
    },
  };
}

const defaultSleep = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));

/** The first wait after a refused request, doubled after every further one up to the last. */
const FIRST_WAIT = 2_000;
const LAST_WAIT = 300_000;
/** Attempts after a server error, a timeout or an answer without a message (429 has no end). */
const TRANSIENT_ATTEMPTS = 3;

export interface ChatOptions {
  fetch?: Fetch;
  /** Milliseconds one request may take. */
  timeout?: number;
  /** The gate of the provider's limits (Nachlese 11 ④); every request passes it. */
  gate?: { pass(): Promise<void> };
  sleep?: (ms: number) => Promise<void>;
  /** A line for the log; the key is taken out before it is written. */
  log?: (line: string) => void;
}

export interface ChatResult {
  message: ChatMessage;
  input: number;
  output: number;
  /** Requests to the provider, retries included. */
  requests: number;
  /** Waits after a 429. */
  waits: number;
}

/** What a call spent until it ended, on its error too (Nachlese 12 B-4). */
export type ChatSpent = Omit<ChatResult, "message">;

/**
 * One call of chat/completions: charged to the budget, checked against it before. On 429 the call
 * waits with a growing interval and tries again without end, after a server error, a timeout or an
 * answer without a message a few times. The tokens are those of every attempt. An error never
 * carries the key; it carries what the call spent (`spent`, Nachlese 12 B-4).
 */
export async function chatCompletion(
  provider: Provider,
  body: Record<string, unknown>,
  budget: Budget,
  options: ChatOptions = {},
): Promise<ChatResult> {
  const spent: ChatSpent = { input: 0, output: 0, requests: 0, waits: 0 };
  try {
    return await attempts(provider, body, budget, options, spent);
  } catch (error) {
    if (error instanceof Error) Object.assign(error, { spent: { ...spent } });
    throw error;
  }
}

/**
 * Puts on an error of a turn what the turn spent itself (Nachlese 12 B-4): the calls before and the
 * failed one, as `kosto` for the Kroniko.
 */
export function kostoOnError(
  error: unknown,
  before: { enigo: number; eligo: number; requests: number },
  started: number,
): unknown {
  const failed = (error as { spent?: Partial<ChatSpent> }).spent ?? {};
  if (error instanceof Error)
    Object.assign(error, {
      kosto: {
        enigo: before.enigo + (failed.input ?? 0),
        eligo: before.eligo + (failed.output ?? 0),
        ms: Date.now() - started,
        requests: before.requests + (failed.requests ?? 0),
      },
    });
  return error;
}

async function attempts(
  provider: Provider,
  body: Record<string, unknown>,
  budget: Budget,
  options: ChatOptions,
  spent: ChatSpent,
): Promise<ChatResult> {
  budget.ensure();
  const request = options.fetch ?? (globalThis.fetch as Fetch);
  const wait = options.sleep ?? defaultSleep;
  const log = (line: string) => options.log?.(provider.redact(line));
  let delay = FIRST_WAIT;
  let transient = 0;
  const again = async (why: string): Promise<void> => {
    log(`Anbieter ${provider.name}: ${why}, neuer Versuch in ${Math.round(delay / 1000)} s`);
    await wait(delay);
    delay = Math.min(delay * 2, LAST_WAIT);
  };
  for (;;) {
    await options.gate?.pass();
    spent.requests += 1;
    let response: Response;
    let text: string;
    try {
      response = await request(`${provider.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: provider.authorization() },
        body: JSON.stringify({ model: provider.model, ...body }),
        signal: AbortSignal.timeout(options.timeout ?? 180_000),
      });
      // OpenRouter sends its headers at once and the answer later: the timeout falls on the body
      // (measured on 27.10.), so reading it belongs to the attempt.
      text = await response.text();
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "TimeoutError";
      if (timedOut && transient < TRANSIENT_ATTEMPTS) {
        transient += 1;
        await again("keine Antwort in der Zeit");
        continue;
      }
      throw new Error(provider.redact(String(error)));
    }
    if (!response.ok) {
      if (response.status === 429) {
        spent.waits += 1;
        await again("antwortet 429");
        continue;
      }
      if (response.status >= 500 && transient < TRANSIENT_ATTEMPTS) {
        transient += 1;
        await again(`antwortet ${response.status}`);
        continue;
      }
      throw new Error(
        `Anbieter ${provider.name} antwortet ${response.status}: ${provider.redact(text).slice(0, 300)}`,
      );
    }
    const reply = JSON.parse(text) as ChatReply;
    const input = reply.usage?.prompt_tokens ?? 0;
    const output = reply.usage?.completion_tokens ?? 0;
    budget.charge(input, output);
    spent.input += input;
    spent.output += output;
    const message = reply.choices?.[0]?.message;
    if (message === undefined) {
      if (transient < TRANSIENT_ATTEMPTS) {
        transient += 1;
        await again("Antwort ohne Nachricht");
        continue;
      }
      throw new Error(`Anbieter ${provider.name}: Antwort ohne Nachricht.`);
    }
    return { message, ...spent };
  }
}
