// Spec 036, Befund 1.4: in the acceptance of Weg C the model closed with „die Seiten nennen die Marke
// nicht“ – while title and heading of the pages read named it. The sentence about the pages read
// (how many, which, blocked, without a browser; Spec 035 D-74) is built from the result of the
// research, never taken from the model. The model is a double; the pages are the fixture of Weg C.

import { describe, expect, it } from "vitest";
import { Budget, Provider } from "../asistanto/ki.js";
import { OHNE_BROWSER, playwrightBildilo } from "../enportilo/bildilo.js";
import { bildschirmA, blanka, fetchA, fetchB, LOGO_A, MARKO_URL } from "../test-doubles/weg-c.js";
import { loadBases } from "../vorschau.js";
import { esplori } from "./esploro.js";

const bases = loadBases();
const MARKE_URL = `${MARKO_URL}marke`;
const SCHLUSS = "Ich habe zwei Seiten gelesen. Die Seiten nennen die Marke nicht.";

const renderer = {
  bildigi: async (page: { url: string }) =>
    page.url === MARKO_URL
      ? { bildo: bildschirmA(), logoj: [LOGO_A] }
      : { bildo: blanka(), logoj: [] },
  malkodi: async () => {
    throw new Error("Weg C decodes no upload.");
  },
};

const lies = (id: string, url: string) => ({
  choices: [
    {
      message: {
        role: "assistant",
        content: "",
        tool_calls: [
          {
            id,
            type: "function",
            function: { name: "lies_seite", arguments: JSON.stringify({ url }) },
          },
        ],
      },
    },
  ],
  usage: { prompt_tokens: 300, completion_tokens: 10 },
});
const schluss = (content: string) => ({
  choices: [{ message: { role: "assistant", content } }],
  usage: { prompt_tokens: 400, completion_tokens: 20 },
});

/** A model double that reads the given pages and then closes with its own claim. */
function modell(urls: readonly string[], closing: string) {
  const replies = [...urls.map((url, index) => lies(`l${index}`, url)), schluss(closing)];
  return {
    provider: new Provider("mistral", "ministral-14b-2512", "attrappe-schlusssatz"),
    fetch: async () => new Response(JSON.stringify(replies.shift()), { status: 200 }),
  };
}

describe("Spec 036, Befund 1.4: the sentence about the pages read comes from the data", () => {
  it("two pages read that name the brand: the model's closing claim is not taken over", async () => {
    const result = await esplori({
      nomo: "Ekzemplo",
      ...modell([MARKO_URL, MARKE_URL], SCHLUSS),
      pageFetch: fetchA,
      bildilo: renderer,
      budget: new Budget(30_000),
      bases,
    });
    expect(result.seitoj).toEqual([MARKO_URL, MARKE_URL]);
    expect(result.antwort).not.toContain("nennen die Marke nicht");
    expect(result.antwort).toBe(`Gelesen: 2 Seiten (${MARKO_URL}, ${MARKE_URL}).`);
  });

  it("one page read: the count and the address, nothing of the model", async () => {
    const result = await esplori({
      nomo: "Ekzemplo",
      ...modell([MARKO_URL], "Die Seite nennt keine Farben."),
      pageFetch: fetchA,
      bildilo: renderer,
      budget: new Budget(30_000),
      bases,
    });
    expect(result.antwort).toBe(`Gelesen: 1 Seite (${MARKO_URL}).`);
  });

  it("without a browser: the count from the data and the one sentence of Spec 035, not the model's", async () => {
    const result = await esplori({
      nomo: "Ekzemplo",
      ...modell([MARKO_URL], "Auf den Bildern ist die Marke klar zu sehen."),
      pageFetch: fetchA,
      bildilo: playwrightBildilo(async () => {
        throw new Error("Cannot find package 'playwright'");
      }),
      budget: new Budget(30_000),
      bases,
    });
    expect(result.antwort).toBe(`Gelesen: 1 Seite (${MARKO_URL}). ${OHNE_BROWSER}`);
  });

  it("nothing read because the page blocks: the blocked sentence only, whatever the model claims", async () => {
    const result = await esplori({
      nomo: "Ekzemplo",
      ...modell([MARKO_URL], "Ich habe die Seite gelesen; sie nennt die Marke nicht."),
      pageFetch: fetchB(403),
      bildilo: renderer,
      budget: new Budget(30_000),
      bases,
    });
    expect(result.seitoj).toEqual([]);
    expect(result.antwort).toMatch(/blockiert/);
    expect(result.antwort).not.toMatch(/gelesen;|nennt die Marke/);
  });

  it("the model is not asked for a closing sentence about the pages", async () => {
    const bodies: { messages: { role: string; content: string }[] }[] = [];
    const double = modell([MARKO_URL], "Fertig.");
    await esplori({
      nomo: "Ekzemplo",
      provider: double.provider,
      fetch: async (_url, init) => {
        bodies.push(JSON.parse(String(init.body)));
        return double.fetch();
      },
      pageFetch: fetchA,
      bildilo: renderer,
      budget: new Budget(30_000),
      bases,
    });
    const system = bodies[0]?.messages[0]?.content ?? "";
    expect(system).not.toMatch(/welche Seiten du gelesen hast/);
  });
});
