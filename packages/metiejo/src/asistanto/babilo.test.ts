// Spec 033 S1: the chat in text, over tools. One turn: the person's sentence, the model calls tools
// of the Laborejo, then answers in words. Tokens and time are counted; on 429 the assistant waits and
// says so; a token budget stops a turn before a call that would pass it; no key in any text.

import type { Agordo } from "@fundamento/agordilo";
import { describe, expect, it } from "vitest";
import { loadBases } from "../vorschau.js";
import { babili } from "./babilo.js";
import { Laborejo } from "./iloj.js";
import { Budget, CostLimitReached, Provider } from "./ki.js";

const KEY = "sk-geheim-babilo-7";
const bases = loadBases();
const provider = new Provider("mistral", "ministral-14b-2512", KEY);

function laborejo() {
  let agordo: Agordo = { name: "lumo", leitfarbe: "#2f6fdb" };
  const work = new Laborejo({
    bases,
    agordo: () => agordo,
    apliki: (next) => {
      agordo = next;
    },
    probleme: () => [],
    kroniko: () => [],
    kontrolita: false,
  });
  return { work, agordo: () => agordo };
}

type Reply = { status?: number; body: unknown };

function scripted(replies: Reply[]) {
  const requests: { url: string; body: Record<string, unknown>; authorization: string }[] = [];
  const fetch = async (url: string, init: RequestInit) => {
    const headers = init.headers as Record<string, string>;
    requests.push({
      url,
      body: JSON.parse(String(init.body)) as Record<string, unknown>,
      authorization: headers.authorization ?? "",
    });
    const reply = replies.shift() ?? {
      body: { choices: [{ message: { role: "assistant", content: "…" } }] },
    };
    return new Response(typeof reply.body === "string" ? reply.body : JSON.stringify(reply.body), {
      status: reply.status ?? 200,
    });
  };
  return { fetch, requests };
}

const toolCall = (name: string, args: Record<string, unknown>) => ({
  choices: [
    {
      message: {
        role: "assistant",
        content: "",
        tool_calls: [
          { id: "c1", type: "function", function: { name, arguments: JSON.stringify(args) } },
        ],
      },
    },
  ],
  usage: { prompt_tokens: 900, completion_tokens: 30 },
});
const answer = (content: string) => ({
  choices: [{ message: { role: "assistant", content } }],
  usage: { prompt_tokens: 1000, completion_tokens: 40 },
});

describe("one turn of the chat (Spec 033 S1)", () => {
  it("the model calls a tool, the Agordilo moves the slider, the model answers in words", async () => {
    const { work, agordo } = laborejo();
    const { fetch, requests } = scripted([
      { body: toolCall("bewege", { wunsch: "runder" }) },
      { body: answer("Ich habe die Ecken runder gemacht: Radius höher.") },
    ]);
    const result = await babili({
      provider,
      fetch,
      laborejo: work,
      historio: [],
      teksto: "Bitte runder.",
      faceto: "formo",
      budget: new Budget(20_000),
    });
    expect(result.antwort).toContain("runder");
    expect(result.sxangxoj).toEqual(["formo"]);
    expect(agordo().form?.radius ?? 1).toBeGreaterThan(1);
    expect(result.kosto).toMatchObject({ enigo: 1900, eligo: 70, requests: 2 });
    expect(result.iloj.map((entry) => entry.name)).toEqual(["bewege"]);
    const first = requests[0];
    if (first === undefined) throw new Error("no request");
    const offered = (first.body.tools as { function: { name: string } }[]).map(
      (t) => t.function.name,
    );
    expect(offered).toContain("setze_regler");
    expect(offered).not.toContain("setze_token");
    expect(requests[0]?.body.model).toBe("ministral-14b-2512");
    const system = (first.body.messages as { role: string; content: string }[])[0];
    expect(system?.role).toBe("system");
    expect(system?.content).toContain("Werkzeuge");
    expect(system?.content).toContain("Freigabe");
  });

  // Probe run 29.10. (nemotron :free): after a tool the model answered with nothing.
  it("an empty answer becomes a sentence: what changed, or that nothing did and how to say it", async () => {
    const { work } = laborejo();
    const { fetch } = scripted([
      { body: toolCall("bewege", { wunsch: "runder" }) },
      { body: answer("") },
      { body: answer("   ") },
    ]);
    const changed = await babili({
      provider,
      fetch,
      laborejo: work,
      historio: [],
      teksto: "runder",
      budget: new Budget(20_000),
    });
    expect(changed.antwort).toContain("Form (Radien)");
    const nothing = await babili({
      provider,
      fetch,
      laborejo: work,
      historio: [],
      teksto: "hm",
      budget: new Budget(20_000),
    });
    expect(nothing.antwort).toMatch(/nichts geändert/);
  });

  // Probe run S5, 29.10. (ministral): after reading the sliders, the model said it had raised the
  // radius – and had called no tool that changes anything.
  it("an answer that claims a change no tool made gets one reminder; the model then calls the tool", async () => {
    const { work, agordo } = laborejo();
    const { fetch, requests } = scripted([
      { body: toolCall("regler", { faceto: "formo" }) },
      { body: answer("Ich habe den Radius von 1 auf 1,5 erhöht.") },
      { body: toolCall("setze_regler", { regler: "form.radius", wert: 1.5 }) },
      { body: answer("Jetzt ist der Radius 1,5.") },
    ]);
    const result = await babili({
      provider,
      fetch,
      laborejo: work,
      historio: [],
      teksto: "runder",
      budget: new Budget(20_000),
    });
    expect(result.sxangxoj).toEqual(["formo"]);
    expect(agordo().form?.radius).toBe(1.5);
    expect(result.antwort).toBe("Jetzt ist der Radius 1,5.");
    const reminder = (
      requests[2]?.body.messages as { role: string; content: string }[] | undefined
    )?.at(-1);
    expect(reminder?.role).toBe("user");
    expect(reminder?.content).toContain("nichts geändert");
  });

  it("if the model still claims a change without a tool, the answer says that nothing was changed", async () => {
    const { work } = laborejo();
    const { fetch } = scripted([
      { body: answer("Ich habe die Ecken runder gemacht.") },
      { body: answer("Der Radius der Ecken wurde auf **1.5** erhöht.") },
    ]);
    const result = await babili({
      provider,
      fetch,
      laborejo: work,
      historio: [],
      teksto: "runder",
      budget: new Budget(20_000),
    });
    expect(result.sxangxoj).toEqual([]);
    expect(result.antwort).toMatch(/^Es wurde nichts geändert\./);
  });

  it("on 429 the turn waits, says so, and goes on", async () => {
    const { work } = laborejo();
    const waits: number[] = [];
    const lines: string[] = [];
    const { fetch } = scripted([{ status: 429, body: "rate limit" }, { body: answer("Fertig.") }]);
    const result = await babili({
      provider,
      fetch,
      laborejo: work,
      historio: [],
      teksto: "Wie steht es?",
      budget: new Budget(20_000),
      sleep: async (ms) => {
        waits.push(ms);
      },
      log: (line) => lines.push(line),
    });
    expect(result.antwort).toBe("Fertig.");
    expect(waits.length).toBe(1);
    expect(result.atendoj).toBe(1);
    expect(lines.join("\n")).toContain("429");
  });

  it("a budget stops the turn before a call that would pass it", async () => {
    const { work } = laborejo();
    const budget = new Budget(1_000);
    budget.charge(990, 0);
    budget.largestCall = 500;
    const { fetch } = scripted([{ body: answer("nie") }]);
    await expect(
      babili({ provider, fetch, laborejo: work, historio: [], teksto: "Hallo", budget }),
    ).rejects.toBeInstanceOf(CostLimitReached);
  });

  it("an error of the provider that repeats the key never carries it", async () => {
    const { work } = laborejo();
    const { fetch } = scripted([{ status: 401, body: `invalid key ${KEY}` }]);
    const error = await babili({
      provider,
      fetch,
      laborejo: work,
      historio: [],
      teksto: "Hallo",
      budget: new Budget(20_000),
    }).catch((caught: unknown) => caught);
    expect(String(error)).toContain("401");
    expect(String(error)).not.toContain(KEY);
    expect(JSON.stringify(provider)).not.toContain(KEY);
  });

  // Spec 035, Befund 4.3: „Komplett abrunden“ set the radius to the end of its slider – no pill –
  // and the answer said „vollständig abgerundet“. The tools decide what changed (D-18); at the end
  // of a slider the answer says so.
  it("a claim of full rounding without the pill is corrected; the end of the slider is said", async () => {
    const { work, agordo } = laborejo();
    const { fetch } = scripted([
      { body: toolCall("setze_regler", { regler: "form.radius", wert: 2 }) },
      { body: answer("Die Ecken sind jetzt vollständig abgerundet.") },
    ]);
    const result = await babili({
      provider,
      fetch,
      laborejo: work,
      historio: [],
      teksto: "Komplett abrunden bitte.",
      budget: new Budget(20_000),
    });
    expect(agordo().form?.radius).toBe(2);
    expect(result.sxangxoj).toEqual(["formo"]);
    expect(result.antwort).not.toMatch(/^Die Ecken sind jetzt vollständig abgerundet/);
    expect(result.antwort).toMatch(/keine Pillen?/);
    expect(result.antwort).toMatch(/Ende des Reglers/);
  });

  it("with the pill chosen by the tool, the same claim stands", async () => {
    const { work } = laborejo();
    const { fetch } = scripted([
      { body: toolCall("waehle_form", { bedienelemente: "pille" }) },
      { body: answer("Die Bedienelemente sind jetzt vollständig abgerundet, als Pille.") },
    ]);
    const result = await babili({
      provider,
      fetch,
      laborejo: work,
      historio: [],
      teksto: "Komplett abrunden bitte.",
      budget: new Budget(20_000),
    });
    expect(result.antwort).toBe("Die Bedienelemente sind jetzt vollständig abgerundet, als Pille.");
  });
});
