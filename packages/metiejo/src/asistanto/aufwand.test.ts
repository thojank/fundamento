// Spec 033 S6, the two corrections of Nachlese 12 (#116) in the Metiejo:
//   B-4 – a request or a turn that ends in an error still says what it spent itself (its own
//         tokens and requests on the error), so the counter and the Kroniko count it, and nothing of
//         the turns beside it; the tokens of answers without a message count as well;
//   ②   – the ledger of the day's requests is merged with the file, not overwritten, when two
//         servers or runs count at the same time.

import type { Agordo } from "@fundamento/agordilo";
import { describe, expect, it } from "vitest";
import { loadBases } from "../vorschau.js";
import { babili } from "./babilo.js";
import { Laborejo } from "./iloj.js";
import { Budget, chatCompletion, Provider } from "./ki.js";
import { mergeLedger } from "./limoj.js";

const provider = new Provider("mistral", "ministral-14b-2512", "sk-aufwand-7");
const noWait = async () => {};
const withoutMessage = (prompt: number) => ({
  usage: { prompt_tokens: prompt, completion_tokens: 0 },
});

const fetchOf = (bodies: unknown[]) => async () =>
  new Response(JSON.stringify(bodies.shift() ?? withoutMessage(0)), { status: 200 });

describe("B-4: what a request and a turn spent, also when they end in an error", () => {
  it("chatCompletion sums the tokens of every attempt, answers without a message included", async () => {
    const result = await chatCompletion(provider, { messages: [] }, new Budget(10_000), {
      fetch: fetchOf([
        withoutMessage(70),
        {
          choices: [{ message: { role: "assistant", content: "Gern." } }],
          usage: { prompt_tokens: 80, completion_tokens: 5 },
        },
      ]),
      sleep: noWait,
    });
    expect(result).toMatchObject({ input: 150, output: 5, requests: 2 });
  });

  it("an error of chatCompletion carries its own tokens and requests", async () => {
    const error = (await chatCompletion(provider, { messages: [] }, new Budget(10_000), {
      fetch: fetchOf([
        withoutMessage(70),
        withoutMessage(70),
        withoutMessage(70),
        withoutMessage(70),
      ]),
      sleep: noWait,
    }).catch((caught: unknown) => caught)) as Error & { spent?: unknown };
    expect(error.message).toContain("Antwort ohne Nachricht");
    expect(error.spent).toEqual({ input: 280, output: 0, requests: 4, waits: 0 });
  });

  it("a turn that ends in an error carries the cost of the whole turn", async () => {
    let agordo: Agordo = { name: "lumo", leitfarbe: "#2f6fdb" };
    const laborejo = new Laborejo({
      bases: loadBases(),
      agordo: () => agordo,
      apliki: (next) => {
        agordo = next;
      },
      probleme: () => [],
      kroniko: () => [],
      kontrolita: false,
    });
    const error = (await babili({
      provider,
      fetch: fetchOf([
        {
          choices: [
            {
              message: {
                role: "assistant",
                content: "",
                tool_calls: [
                  { id: "r", type: "function", function: { name: "stato", arguments: "{}" } },
                ],
              },
            },
          ],
          usage: { prompt_tokens: 600, completion_tokens: 20 },
        },
        withoutMessage(70),
        withoutMessage(70),
        withoutMessage(70),
        withoutMessage(70),
      ]),
      sleep: noWait,
      laborejo,
      historio: [],
      teksto: "runder",
      budget: new Budget(10_000),
    }).catch((caught: unknown) => caught)) as Error & {
      kosto?: { enigo: number; eligo: number; requests: number; ms: number };
    };
    expect(error.kosto).toMatchObject({ enigo: 880, eligo: 20, requests: 5 });
    expect(error.kosto?.ms).toBeGreaterThanOrEqual(0);
  });
});

describe("Nachlese 12 ②: the ledger of the day's requests is merged, not overwritten", () => {
  it("keeps the higher count per provider and day, and the keys of both", () => {
    expect(
      mergeLedger(
        { "mistral 2026-10-29": 5, "openrouter 2026-10-29": 2 },
        { "mistral 2026-10-29": 3, "mistral 2026-10-30": 1 },
      ),
    ).toEqual({ "mistral 2026-10-29": 5, "openrouter 2026-10-29": 2, "mistral 2026-10-30": 1 });
  });
});
