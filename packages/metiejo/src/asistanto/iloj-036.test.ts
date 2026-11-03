// Spec 036, Befund 1.2 by chat (Nachbesserung 02.11., A-1): „eckiger“ from the pill went one stop
// back to 2 by the wish path (wunsch.ts reads stufen["form.radius"].danach.zurueck), but a model that
// answers „eckiger“ with waehle_form("radius") left the slider where it stood before the pill. The
// switch pille → radius lands on the same stop, read from the same data. The model is a double.

import { type Agordo, readWuensche, reglerOf, reglerValue } from "@fundamento/agordilo";
import { describe, expect, it } from "vitest";
import { loadBases } from "../vorschau.js";
import { babili } from "./babilo.js";
import { Laborejo, vokiIlon } from "./iloj.js";
import { Budget, Provider } from "./ki.js";

const bases = loadBases();
const provider = new Provider("mistral", "ministral-14b-2512", "attrappe-eckiger");
const radius = reglerOf(bases.gestalt).find((regler) => regler.path === "form.radius");
if (radius === undefined) throw new Error("Regler form.radius fehlt");
const zurueck = readWuensche().stufen?.["form.radius"]?.danach?.zurueck;
if (zurueck === undefined)
  throw new Error("wuensche.json: stufen.form.radius.danach.zurueck fehlt");

function laborejo(start: Agordo = { name: "lumo", leitfarbe: "#2f6fdb" }) {
  let agordo = start;
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

const call = async (work: Laborejo, name: string, args: Record<string, unknown>) =>
  JSON.parse(await vokiIlon(work, name, args)) as Record<string, unknown>;

/** A model double: the given replies in order. */
function scripted(replies: unknown[]) {
  return async (_url: string, _init: RequestInit) =>
    new Response(JSON.stringify(replies.shift()), { status: 200 });
}

const toolCall = (name: string, args: Record<string, unknown>) => ({
  choices: [
    {
      message: {
        role: "assistant",
        content: "",
        tool_calls: [
          { id: "e1", type: "function", function: { name, arguments: JSON.stringify(args) } },
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

describe("Spec 036, Befund 1.2 by chat: waehle_form from the pill lands on the stop of the data", () => {
  it("waehle_form radius on a pill sets the radius slider to stufen.form.radius.danach.zurueck", async () => {
    const { work, agordo } = laborejo();
    await call(work, "setze_regler", { regler: "form.radius", wert: 0.5 });
    await call(work, "waehle_form", { bedienelemente: "pille" });
    expect(reglerValue(agordo(), radius)).toBe(0.5);
    const result = await call(work, "waehle_form", { bedienelemente: "radius" });
    expect(result.ok).toBe(true);
    expect(reglerValue(agordo(), radius)).toBe(zurueck);
  });

  it("waehle_form radius without a pill leaves the slider as it is", async () => {
    const { work, agordo } = laborejo();
    await call(work, "setze_regler", { regler: "form.radius", wert: 0.5 });
    await call(work, "waehle_form", { bedienelemente: "radius" });
    expect(reglerValue(agordo(), radius)).toBe(0.5);
  });

  it("„eckiger“ in the chat, answered by waehle_form radius, leaves the draft on that stop", async () => {
    const { work, agordo } = laborejo();
    await call(work, "waehle_form", { bedienelemente: "pille" });
    const result = await babili({
      provider,
      fetch: scripted([
        toolCall("waehle_form", { bedienelemente: "radius" }),
        answer("Die Bedienelemente folgen wieder dem Radius."),
      ]),
      laborejo: work,
      historio: [],
      teksto: "eckiger",
      faceto: "formo",
      budget: new Budget(20_000),
    });
    expect(result.antwort).toContain("Radius");
    expect(reglerValue(agordo(), radius)).toBe(zurueck);
  });
});
