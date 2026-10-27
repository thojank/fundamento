// The context-free agent (Spec 030, Ablauf 2): provider and model from the .env, the key never in
// a log, a report or an error; Variante F talks to the Gvidanto through its tools, Variante 0 gets
// only the task. A budget of tokens per run stops the run before the next call once it is spent.

import { describe, expect, it } from "vitest";
import {
  Budget,
  CostLimitReached,
  extractHtml,
  providerOf,
  runAgent,
  type ToolBridge,
} from "./agent.js";

const KEY = "sk-test-0123456789abcdef";

function fakeFetch(
  replies: unknown[],
  seen: { url: string; body: unknown; headers: Record<string, string> }[],
) {
  return async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
    seen.push({
      url: String(url),
      body: JSON.parse(String(init?.body)),
      headers: Object.fromEntries(new Headers(init?.headers).entries()),
    });
    const reply = replies.shift();
    if (reply === undefined) throw new Error("no reply left");
    return new Response(JSON.stringify(reply), {
      status: (reply as { status?: number }).status ?? 200,
      headers: { "content-type": "application/json" },
    });
  };
}

const message = (content: string, toolCalls?: unknown[]) => ({
  choices: [
    { message: { role: "assistant", content, ...(toolCalls ? { tool_calls: toolCalls } : {}) } },
  ],
  usage: { prompt_tokens: 1000, completion_tokens: 200 },
});

describe("providerOf", () => {
  it("reads FM_KI_ANBIETER and FM_KI_MODELL and the key of that provider", () => {
    const provider = providerOf({
      FM_KI_ANBIETER: "Mistral",
      FM_KI_MODELL: "mistral-large-latest",
      MISTRAL_API_KEY: KEY,
    });
    expect(provider).toMatchObject({
      name: "mistral",
      model: "mistral-large-latest",
      baseUrl: "https://api.mistral.ai/v1",
    });
    expect(
      providerOf({ FM_KI_ANBIETER: "openrouter", FM_KI_MODELL: "x/y", OPENROUTER_API_KEY: KEY })
        .baseUrl,
    ).toBe("https://openrouter.ai/api/v1");
  });

  it("names the missing variable, never a value", () => {
    expect(() => providerOf({ FM_KI_ANBIETER: "openai", FM_KI_MODELL: "m" })).toThrow(
      /OPENAI_API_KEY/,
    );
    expect(() =>
      providerOf({ FM_KI_ANBIETER: "nope", FM_KI_MODELL: "m", OPENAI_API_KEY: KEY }),
    ).toThrow(/FM_KI_ANBIETER/);
  });

  it("does not show the key when printed", () => {
    const provider = providerOf({
      FM_KI_ANBIETER: "mistral",
      FM_KI_MODELL: "m",
      MISTRAL_API_KEY: KEY,
    });
    expect(JSON.stringify(provider)).not.toContain(KEY);
    expect(String(provider)).not.toContain(KEY);
  });
});

describe("extractHtml", () => {
  it("takes the document out of a fenced block or the text itself", () => {
    expect(extractHtml("Hier:\n```html\n<!doctype html><p>a</p>\n```\nFertig")).toBe(
      "<!doctype html><p>a</p>",
    );
    expect(extractHtml("<main>b</main>")).toBe("<main>b</main>");
  });
});

describe("runAgent", () => {
  const provider = providerOf({
    FM_KI_ANBIETER: "mistral",
    FM_KI_MODELL: "m",
    MISTRAL_API_KEY: KEY,
  });

  it("Variante F: offers the Gvidanto's tools, runs a call and returns the page with its effort", async () => {
    const seen: { url: string; body: unknown; headers: Record<string, string> }[] = [];
    const calls: string[] = [];
    const tools: ToolBridge = {
      list: async () => [
        {
          name: "get_ero",
          description: "An Ero",
          inputSchema: { type: "object", properties: { name: { type: "string" } } },
        },
      ],
      call: async (name, args) => {
        calls.push(`${name} ${JSON.stringify(args)}`);
        return '{"ero":"butono"}';
      },
    };
    const result = await runAgent({
      provider,
      fetch: fakeFetch(
        [
          message("", [
            {
              id: "c1",
              type: "function",
              function: { name: "get_ero", arguments: '{"name":"butono"}' },
            },
          ]),
          message("```html\n<fm-butono>Los</fm-butono>\n```"),
        ],
        seen,
      ),
      task: "Ein Knopf",
      variant: "F",
      tools,
      budget: new Budget(100_000),
    });
    expect(calls).toEqual(['get_ero {"name":"butono"}']);
    expect(result.html).toBe("<fm-butono>Los</fm-butono>");
    expect(result.effort).toMatchObject({ inputTokens: 2000, outputTokens: 400, toolCalls: 1 });
    expect(seen[0]?.url).toBe("https://api.mistral.ai/v1/chat/completions");
    expect((seen[0]?.body as { tools?: unknown[] } | undefined)?.tools).toHaveLength(1);
    expect(seen[0]?.headers.authorization).toBe(`Bearer ${KEY}`);
  });

  it("Variante 0: no tools, only the task and the line to build it as HTML", async () => {
    const seen: { url: string; body: unknown; headers: Record<string, string> }[] = [];
    await runAgent({
      provider,
      fetch: fakeFetch([message("<p>x</p>")], seen),
      task: "Ein Knopf",
      variant: "0",
      budget: new Budget(100_000),
    });
    const body = seen[0]?.body as { tools?: unknown; messages: { content: string }[] };
    expect(body.tools).toBeUndefined();
    expect(JSON.stringify(body.messages)).toContain("Ein Knopf");
    expect(JSON.stringify(body.messages)).not.toMatch(/fm-|Fundamento|Gvidanto/);
  });

  it("an error of the provider is reported without the key, even when the provider echoes it", async () => {
    const log: string[] = [];
    const run = runAgent({
      provider,
      fetch: fakeFetch([{ status: 401, error: `invalid key ${KEY}` }], []),
      task: "x",
      variant: "0",
      budget: new Budget(100_000),
      log: (line) => log.push(line),
    });
    await expect(run).rejects.toThrow(/401/);
    await run.catch((error: unknown) => expect(String(error)).not.toContain(KEY));
    expect(log.join("\n")).not.toContain(KEY);
  });

  it("stops before the next call once the budget is spent", async () => {
    const budget = new Budget(1500);
    const tools: ToolBridge = { list: async () => [], call: async () => "{}" };
    const run = runAgent({
      provider,
      fetch: fakeFetch(
        [
          message("", [
            { id: "c1", type: "function", function: { name: "describe", arguments: "{}" } },
          ]),
          message("<p>never</p>"),
        ],
        [],
      ),
      task: "x",
      variant: "F",
      tools,
      budget,
    });
    await expect(run).rejects.toBeInstanceOf(CostLimitReached);
    expect(budget.spent).toBe(1200);
  });
});

describe("the functions of Variante F (Nachlese 11 B-3)", () => {
  it("offers the Gvidanto's input schema as it is: the Gvidanto lists one object at the root", async () => {
    const seen: { url: string; body: unknown; headers: Record<string, string> }[] = [];
    const inputSchema = {
      type: "object",
      description: "One Ero. Give exactly one of: `name` or `id`.",
      properties: { name: { type: "string" }, id: { type: "string" } },
    };
    await runAgent({
      provider: providerOf({ FM_KI_ANBIETER: "openai", FM_KI_MODELL: "m", OPENAI_API_KEY: KEY }),
      fetch: fakeFetch([message("<main>x</main>")], seen),
      task: "Baue",
      variant: "F",
      budget: new Budget(1_000_000),
      tools: {
        list: async () => [{ name: "get_ero", description: "One Ero", inputSchema }],
        call: async () => "{}",
      },
    });
    const body = seen[0]?.body as { tools: { function: { parameters: unknown } }[] };
    expect(body.tools[0]?.function.parameters).toEqual(inputSchema);
  });
});
