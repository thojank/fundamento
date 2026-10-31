// Spec 035, Befund 4.1 (V-2): Weg C renders every page it reads and measures the colours by area,
// as Weg B measures a screenshot; the logo and the top of the screen weigh more, the colours of the
// CSS only add to it. A page that blocks automatic reading is said in one sentence and gives no
// colours; without a browser Weg C reads the code as before and says so in one sentence. Offline:
// the renderer is a double that returns the synthetic screenshot of the fixture page; the real
// Chromium renders the same page in the Eroj suite (packages/eroj/test/weg-c.spec.ts, D-12).

import { describe, expect, it } from "vitest";
import { Budget, Provider } from "../asistanto/ki.js";
import { proponojOf } from "../enportilo/rekono.js";
import { legiPagxon } from "../enportilo/retejo.js";
import {
  bildschirmA,
  blanka,
  fetchA,
  fetchB,
  LOGO_A,
  MARKO_URL,
  NEBEN,
  PRAEGEND,
} from "../test-doubles/weg-c.js";
import { loadBases } from "../vorschau.js";
import { esplori } from "./esploro.js";

const bases = loadBases();
const OHNE_BROWSER =
  "Ohne Browser konnte ich die Seite nur aus dem Code lesen; Farben aus Bildern fehlen.";
const COLOUR_FACETS = ["gvidkoloro", "neutralaj", "statoj"];

/** The sentences of a text: a full stop, question or exclamation mark followed by a space or the end. */
const satzoj = (text: string): string[] =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((satz) => satz.trim())
    .filter((satz) => satz !== "");

interface Page {
  url: string;
  html: string;
  fetch: (url: string, init?: RequestInit) => Promise<Response>;
}

/** A renderer double: page A as its synthetic screenshot with the logo, any other page white. */
function renderer() {
  const pages: Page[] = [];
  return {
    pages,
    bildigi: async (page: Page) => {
      pages.push(page);
      return page.url === MARKO_URL
        ? { bildo: bildschirmA(), logoj: [LOGO_A] }
        : { bildo: blanka(), logoj: [] };
    },
    malkodi: async () => {
      throw new Error("Weg C decodes no upload.");
    },
  };
}

describe("the fixture (Spec 035, Befund 4.1)", () => {
  it("read from the code alone, page A names the secondary colour – as Weg C did before", async () => {
    const page = await legiPagxon(MARKO_URL, fetchA);
    const lead = proponojOf(page.trovoj, bases).find((propono) => propono.faceto === "gvidkoloro");
    expect(lead?.agordo).toEqual({ leitfarbe: NEBEN });
    expect(page.trovoj.some((trovo) => trovo.valoro === PRAEGEND)).toBe(false);
  });
});

describe("Weg C renders and measures by area (Spec 035, Befund 4.1)", () => {
  it("names the defining colour of page A first, from the screenshot with its share of the area", async () => {
    const result = await esplori({
      nomo: "Ekzemplo",
      url: MARKO_URL,
      pageFetch: fetchA,
      bildilo: renderer(),
      budget: new Budget(1),
      bases,
    });
    expect(result.proponoj[0]?.faceto).toBe("gvidkoloro");
    expect(result.proponoj[0]?.agordo).toEqual({ leitfarbe: PRAEGEND });
    expect(result.proponoj[0]?.herkunft[0]?.dosiero).toBe(MARKO_URL);
    expect(result.proponoj[0]?.herkunft[0]?.loko).toMatch(/Fläche/);
    expect(result.notoj).toEqual([]);
  });

  it("the renderer gets the page as read and reaches its files only through the guarded fetch (D-15)", async () => {
    const double = renderer();
    await esplori({
      nomo: "Ekzemplo",
      url: MARKO_URL,
      pageFetch: fetchA,
      bildilo: double,
      budget: new Budget(1),
      bases,
    });
    expect(double.pages.map((page) => page.url)).toEqual([MARKO_URL, `${MARKO_URL}marke`]);
    const [first] = double.pages;
    expect(first?.html).toContain('class="held"');
    expect((await first?.fetch(`${MARKO_URL}held.png`))?.status).toBe(200);
    for (const url of ["http://127.0.0.1:7301/", "http://10.0.0.5/", "file:///etc/passwd"]) {
      await expect(first?.fetch(url) ?? Promise.resolve(), url).rejects.toThrow();
    }
  });
});

describe("a page that blocks automatic reading (Spec 035, Befund 4.1)", () => {
  it.each([403, 503, 200])(
    "status %i with the markers of a challenge: one sentence, no colours",
    async (status) => {
      const double = renderer();
      const result = await esplori({
        nomo: "Ekzemplo",
        url: MARKO_URL,
        pageFetch: fetchB(status),
        bildilo: double,
        budget: new Budget(1),
        bases,
      });
      expect(satzoj(result.antwort)).toHaveLength(1);
      expect(result.antwort).toMatch(/blockiert/);
      expect(result.antwort).toContain(MARKO_URL);
      expect(result.proponoj.filter((propono) => COLOUR_FACETS.includes(propono.faceto))).toEqual(
        [],
      );
      expect(result.seitoj).toEqual([]);
      expect(double.pages).toEqual([]);
    },
  );

  it("with a model: the answer is the one sentence, not the model's guess of colours", async () => {
    const replies = [
      {
        choices: [
          {
            message: {
              role: "assistant",
              content: "",
              tool_calls: [
                {
                  id: "a",
                  type: "function",
                  function: { name: "lies_seite", arguments: JSON.stringify({ url: MARKO_URL }) },
                },
              ],
            },
          },
        ],
        usage: { prompt_tokens: 300, completion_tokens: 10 },
      },
      {
        choices: [
          {
            message: {
              role: "assistant",
              content: "Die Marke nutzt sicher ein kräftiges Orange (#f48120) und Weiß.",
            },
          },
        ],
        usage: { prompt_tokens: 400, completion_tokens: 20 },
      },
    ];
    const result = await esplori({
      nomo: "Ekzemplo",
      provider: new Provider("mistral", "ministral-14b-2512", "attrappe-weg-c-schluessel"),
      fetch: async () => new Response(JSON.stringify(replies.shift()), { status: 200 }),
      pageFetch: fetchB(403),
      bildilo: renderer(),
      budget: new Budget(30_000),
      bases,
    });
    expect(satzoj(result.antwort)).toHaveLength(1);
    expect(result.antwort).toMatch(/blockiert/);
    expect(result.antwort).not.toMatch(/#|Orange/);
    expect(result.proponoj.filter((propono) => COLOUR_FACETS.includes(propono.faceto))).toEqual([]);
  });
});

describe("without a browser (Spec 035, Befund 4.1, AC-11)", () => {
  const css = async () =>
    proponojOf(
      [
        ...(await legiPagxon(MARKO_URL, fetchA)).trovoj,
        ...(await legiPagxon(`${MARKO_URL}marke`, fetchA)).trovoj,
      ],
      bases,
    );

  it("the import of Playwright fails: the result from the code as before, plus exactly one sentence", async () => {
    const { playwrightBildilo } = await import("../enportilo/bildilo.js");
    let loads = 0;
    const result = await esplori({
      nomo: "Ekzemplo",
      url: MARKO_URL,
      pageFetch: fetchA,
      bildilo: playwrightBildilo(async () => {
        loads += 1;
        throw new Error("Cannot find package 'playwright'");
      }),
      budget: new Budget(1),
      bases,
    });
    expect(result.seitoj).toEqual([MARKO_URL, `${MARKO_URL}marke`]);
    expect(result.proponoj).toEqual(await css());
    expect(result.notoj).toEqual([OHNE_BROWSER]);
    expect(satzoj(result.antwort).filter((satz) => /Browser/.test(satz))).toEqual([OHNE_BROWSER]);
    expect(loads).toBeGreaterThan(0);
  });

  it("Chromium does not start: the same, with the same one sentence", async () => {
    const { playwrightBildilo } = await import("../enportilo/bildilo.js");
    const result = await esplori({
      nomo: "Ekzemplo",
      url: MARKO_URL,
      pageFetch: fetchA,
      bildilo: playwrightBildilo(async () => ({
        chromium: {
          launch: async () => {
            throw new Error("Executable doesn't exist; run playwright install chromium");
          },
        },
      })),
      budget: new Budget(1),
      bases,
    });
    expect(result.proponoj).toEqual(await css());
    expect(result.notoj).toEqual([OHNE_BROWSER]);
    expect(satzoj(result.antwort).filter((satz) => /Browser/.test(satz))).toEqual([OHNE_BROWSER]);
  });
});
