// Spec 033 S4 (Weg C): an existing brand, only named. A research agent chooses public pages – the
// website, its press and brand pages – and the Enportilo reads and measures them (Art. V: observation,
// no taking over of sources). The model never sets a value: it only says which page to read; the
// values come from the findings, each with the URL and the line. Only public http(s) addresses, at
// most six pages.

import { describe, expect, it } from "vitest";
import { Budget, Provider } from "../asistanto/ki.js";
import { loadBases } from "../vorschau.js";
import { esplori, ILOJ_ESPLORO, permesataAdreso } from "./esploro.js";

const bases = loadBases();
const provider = new Provider("mistral", "ministral-14b-2512", "sk-esploro");

const pages: Record<string, { type: string; body: string }> = {
  "https://pano.example/": {
    type: "text/html",
    body: '<html><head><link rel="stylesheet" href="/s.css"></head><body><a href="/presse">Presse</a><a href="/karriere">Jobs</a><a href="/marke">Marke</a></body></html>',
  },
  "https://pano.example/s.css": {
    type: "text/css",
    body: ":root{--brand-primary:#9c5a2b}body{font-family:Lora,serif}.btn{border-radius:6px;padding:12px}",
  },
  "https://pano.example/presse": {
    type: "text/html",
    body: "<style>.logo{fill:#9c5a2b;color:#f3e6cf}</style>",
  },
  "https://pano.example/marke": {
    type: "text/html",
    body: "<style>h1{font-family:Fraunces,serif}</style>",
  },
};
const pageFetch = async (url: string) => {
  const page = pages[url];
  return page === undefined
    ? new Response("nicht da", { status: 404 })
    : new Response(page.body, { status: 200, headers: { "content-type": page.type } });
};

function scripted(replies: unknown[]) {
  const requests: Record<string, unknown>[] = [];
  const fetch = async (_url: string, init: RequestInit) => {
    requests.push(JSON.parse(String(init.body)) as Record<string, unknown>);
    const reply = replies.shift() ?? {
      choices: [{ message: { role: "assistant", content: "Fertig." } }],
      usage: { prompt_tokens: 10, completion_tokens: 2 },
    };
    return new Response(JSON.stringify(reply), { status: 200 });
  };
  return { fetch, requests };
}
const call = (name: string, args: Record<string, unknown>, id = "c") => ({
  choices: [
    {
      message: {
        role: "assistant",
        content: "",
        tool_calls: [{ id, type: "function", function: { name, arguments: JSON.stringify(args) } }],
      },
    },
  ],
  usage: { prompt_tokens: 500, completion_tokens: 20 },
});

describe("which addresses the agent may read (Spec 033 S4)", () => {
  it("public http and https only: no file, no localhost, no private network", () => {
    expect(permesataAdreso("https://pano.example/")).toBe(true);
    expect(permesataAdreso("http://pano.example/presse")).toBe(true);
    for (const url of [
      "file:///etc/passwd",
      "http://localhost:7301/",
      "http://127.0.0.1/",
      "http://10.0.0.5/",
      "http://192.168.1.2/",
      "http://172.16.0.1/",
      "http://[::1]/",
      "http://metadata.google.internal/",
      "ftp://pano.example/",
    ]) {
      expect(permesataAdreso(url), url).toBe(false);
    }
  });

  it("the agent's tools read pages and list findings; none sets a value of the brand", () => {
    expect(ILOJ_ESPLORO.map((tool) => tool.name)).toEqual(["lies_seite", "trovoj"]);
  });
});

describe("the research agent (Spec 033 S4)", () => {
  it("reads the website and a press page it found there; proposals per Faceto with the URL as provenance", async () => {
    const { fetch, requests } = scripted([
      call("lies_seite", { url: "https://pano.example/" }, "a"),
      call("lies_seite", { url: "https://pano.example/presse" }, "b"),
      {
        choices: [{ message: { role: "assistant", content: "Gelesen: Startseite und Presse." } }],
        usage: { prompt_tokens: 900, completion_tokens: 30 },
      },
    ]);
    const result = await esplori({
      nomo: "Bäckerei Pano",
      provider,
      fetch,
      pageFetch,
      budget: new Budget(30_000),
      bases,
    });
    expect(result.seitoj).toEqual(["https://pano.example/", "https://pano.example/presse"]);
    const lead = result.proponoj.find((propono) => propono.faceto === "gvidkoloro");
    expect(lead?.agordo).toEqual({ leitfarbe: "#9c5a2b" });
    expect(lead?.herkunft[0]?.dosiero).toMatch(/^https:\/\/pano\.example\//);
    expect(
      result.proponoj.find((propono) => propono.faceto === "tiparo")?.agordo.schriften?.body
        ?.family,
    ).toBe("Lora");
    expect(result.kosto).toMatchObject({ enigo: 1900, eligo: 70 });
    const firstAnswer = ((requests[1]?.messages ?? []) as { role: string; content: string }[]).find(
      (message) => message.role === "tool",
    );
    expect(firstAnswer?.content).toContain("https://pano.example/presse");
    expect(firstAnswer?.content).toContain("https://pano.example/marke");
    expect(firstAnswer?.content).not.toContain("karriere");
    const system =
      ((requests[0]?.messages ?? []) as { role: string; content: string }[])[0]?.content ?? "";
    expect(system).toContain("Bäckerei Pano");
    expect(system).toContain("Beobachtung");
  });

  it("refuses an address that is not public, and stops after six pages", async () => {
    const { fetch } = scripted([
      call("lies_seite", { url: "http://127.0.0.1:7301/" }, "x"),
      ...Array.from({ length: 7 }, (_, index) =>
        call("lies_seite", { url: `https://pano.example/?p=${index}` }, `p${index}`),
      ),
      {
        choices: [{ message: { role: "assistant", content: "Ende." } }],
        usage: { prompt_tokens: 10, completion_tokens: 2 },
      },
    ]);
    const result = await esplori({
      nomo: "Pano",
      provider,
      fetch,
      pageFetch,
      budget: new Budget(60_000),
      bases,
    });
    expect(result.abgelehnt).toContain("http://127.0.0.1:7301/");
    expect(result.seitoj.length).toBeLessThanOrEqual(6);
  });

  it("without a model, a given address is read with the press and brand pages it links to", async () => {
    const result = await esplori({
      nomo: "Pano",
      url: "https://pano.example/",
      pageFetch,
      budget: new Budget(1),
      bases,
    });
    expect(result.seitoj).toEqual([
      "https://pano.example/",
      "https://pano.example/presse",
      "https://pano.example/marke",
    ]);
    expect(result.proponoj.some((propono) => propono.faceto === "gvidkoloro")).toBe(true);
    expect(result.kosto.enigo).toBe(0);
  });
});
