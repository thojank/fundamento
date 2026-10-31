// Spec 036, Befund 1.3: the chat named internal terms – „Faceto“, token names such as `form.radius`
// and the names of the tools – where the screen has its own words. The system text names the steps
// and the sliders as the screen does, and a deterministic check of the answer maps every internal
// term to the word of the screen (data: the names of the steps in facetoj.json, the labels of the
// sliders of the Agordilo) or drops the sentence when there is none. The model is a double.

import type { Agordo } from "@fundamento/agordilo";
import { defaultModeloSource, readFacetoj } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { loadBases } from "../vorschau.js";
import { babili } from "./babilo.js";
import { Laborejo } from "./iloj.js";
import { Budget, Provider } from "./ki.js";

const bases = loadBases();
const provider = new Provider("mistral", "ministral-14b-2512", "attrappe-nutzersprache");
const facetoj = readFacetoj(defaultModeloSource().dataDir)?.facetoj ?? [];

function laborejo() {
  let agordo: Agordo = { name: "lumo", leitfarbe: "#2f6fdb" };
  return new Laborejo({
    bases,
    agordo: () => agordo,
    apliki: (next) => {
      agordo = next;
    },
    probleme: () => [],
    kroniko: () => [],
    kontrolita: false,
  });
}

/** A model double: the given replies in order, every request recorded. */
function scripted(replies: unknown[]) {
  const requests: Record<string, unknown>[] = [];
  const fetch = async (_url: string, init: RequestInit) => {
    requests.push(JSON.parse(String(init.body)) as Record<string, unknown>);
    return new Response(JSON.stringify(replies.shift()), { status: 200 });
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
          { id: "n1", type: "function", function: { name, arguments: JSON.stringify(args) } },
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

async function turn(replies: unknown[], faceto = "formo") {
  const { fetch, requests } = scripted(replies);
  const result = await babili({
    provider,
    fetch,
    laborejo: laborejo(),
    historio: [],
    teksto: "Etwas runder, bitte.",
    faceto,
    budget: new Budget(20_000),
  });
  return { result, requests };
}

/** Internal terms the person never reads: the word Faceto, slider paths, token and tool names. */
const INTERN = /\bFacet(o|oj)\b|\bform\.radius\b|\bradius\.(role|full)\b|\bwaehle_form\b|\bformo\b/;

describe("Spec 036, Befund 1.3: the chat speaks the words of the screen", () => {
  it("the system text names every step as the screen does and asks for the words of the screen", async () => {
    const { requests } = await turn([answer("Gern.")]);
    const messages = requests[0]?.messages as { role: string; content: string }[];
    const system = messages[0]?.content ?? "";
    for (const faceto of facetoj) expect(system).toContain(faceto.nomo.de);
    expect(system).toContain("„Radius“");
    expect(system).toMatch(/Wörter[n]? der Oberfläche/);
    expect(system).toContain("Aktueller Schritt: „Form (Radien)“");
  });

  it("an answer with the word Faceto, a Faceto's name and a slider path reaches the person in the screen's words", async () => {
    const { result } = await turn([
      toolCall("setze_regler", { regler: "form.radius", wert: 1.5 }),
      answer("In der Faceto formo habe ich form.radius auf 1,5 gesetzt. Die Ecken sind runder."),
    ]);
    expect(result.antwort).not.toMatch(INTERN);
    expect(result.antwort).toContain("„Form (Radien)“");
    expect(result.antwort).toContain("„Radius“");
    expect(result.antwort).toContain("auf 1,5 gesetzt");
    expect(result.antwort).toContain("Die Ecken sind runder.");
  });

  it("a sentence with a token name the screen has no word for is dropped, the others stay", async () => {
    const { result } = await turn([
      toolCall("waehle_form", { bedienelemente: "pille" }),
      answer(
        "Die Bedienelemente sind jetzt Pillen. Dafür zeigt radius.role.control auf radius.full. Karten bleiben begrenzt gerundet.",
      ),
    ]);
    expect(result.antwort).toBe(
      "Die Bedienelemente sind jetzt Pillen. Karten bleiben begrenzt gerundet.",
    );
  });

  it("the sentence of the tools at the end of a slider names no tool", async () => {
    const { result } = await turn([
      toolCall("setze_regler", { regler: "form.radius", wert: 2 }),
      answer("Der Radius steht jetzt auf 2."),
    ]);
    expect(result.antwort).toMatch(/Ende des Reglers/);
    expect(result.antwort).toContain("„Pille“");
    expect(result.antwort).not.toMatch(INTERN);
  });

  it("an answer of nothing but internal terms becomes the sentence of what changed", async () => {
    const { result } = await turn([
      toolCall("setze_regler", { regler: "form.radius", wert: 1.5 }),
      answer("radius.role.control = radius.full"),
    ]);
    expect(result.antwort).toBe("Geändert: Form (Radien). Sieh dir die Vorschau an.");
  });
});
