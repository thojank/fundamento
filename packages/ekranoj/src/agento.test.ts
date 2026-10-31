// The agent (S037-03): answers read (fragment, mankoj block, plan), the build conversation with
// and without tools, and the real ChatModel over metiejo's chatCompletion with a fetch double.

import { Budget, Provider } from "@fundamento/metiejo";
import { describe, expect, it } from "vitest";
import {
  chatModelDe,
  eltiriRespondon,
  konstruiEkranon,
  legiMankojn,
  legiPlanon,
  MalpermesitaModelo,
  mallongigiPlanon,
  PETO_TEMPOLIMO,
  PROMPT_0,
  provizantaSkemo,
  REDEMANDO_0,
  REDEMANDO_F,
  SISTEMO_F,
  slugDe,
} from "./index.js";
import { ilaRespondo, respondo, SkriptaModelo } from "./test-doubles/chat.js";
import { planoKun } from "./test-doubles/faktoj.js";
import { ilo, MemoraPonto } from "./test-doubles/iloj.js";
import type { Peno } from "./tipoj.js";

const peno = (): Peno => ({
  inputTokens: 0,
  outputTokens: 0,
  toolCalls: 0,
  requests: 0,
  ms: 0,
  bytes: 0,
});

describe("answers", () => {
  it("takes the mankoj block out, keeps the last html block, and keeps what K5 must judge", () => {
    const answer = [
      "Hier ist der Screen.",
      "```html",
      "<p>alt</p>",
      "```",
      "```html",
      '<main><style>.x{color:#f00}</style><fm-butono style="padding: 3px">Standard A-12</fm-butono></main>',
      "```",
      "```mankoj",
      '[{"speco": "ero", "nomo": "tabelo", "ekzemplo": "Tabelle der Standards", "propono": "Ero Tabelle"}]',
      "```",
    ].join("\n");
    expect(eltiriRespondon(answer, "F")).toEqual({
      fragmento:
        '<main><style>.x{color:#f00}</style><fm-butono style="padding: 3px">Standard A-12</fm-butono></main>',
      mankoj: [
        { speco: "ero", nomo: "tabelo", ekzemplo: "Tabelle der Standards", propono: "Ero Tabelle" },
      ],
    });
  });

  it("keeps only the body of a whole document in Variante F, the whole document in Variante 0", () => {
    const doc = '<!doctype html><html lang="de"><body>\n<main>Team Nord</main>\n</body></html>';
    expect(eltiriRespondon(`\`\`\`html\n${doc}\n\`\`\``, "F").fragmento).toBe(
      "<main>Team Nord</main>",
    );
    expect(eltiriRespondon(`\`\`\`html\n${doc}\n\`\`\``, "0").fragmento).toBe(doc);
  });

  it("reads a mankoj block as JSON lines too and skips what is no gap", () => {
    expect(
      legiMankojn(
        '{"speco": "ilo", "nomo": "list_ikonoj", "ekzemplo": "Icon wählen", "propono": "Werkzeug"}\n{"speco": "marko", "nomo": "x"}\nkein JSON',
      ),
    ).toEqual([
      { speco: "ilo", nomo: "list_ikonoj", ekzemplo: "Icon wählen", propono: "Werkzeug" },
    ]);
  });

  it("reads a plan from a json block or from the text, and normalises slugs", () => {
    const plano = planoKun(2);
    expect(legiPlanon(`\`\`\`json\n${JSON.stringify(plano)}\n\`\`\``)).toEqual(plano);
    expect(
      legiPlanon(
        'Plan: {"celo": "c", "ekranoj": [{"slug": "Übersicht Liste", "titolo": "Ü", "celo": "z"}], "kantoj": []}',
      ),
    ).toEqual({
      celo: "c",
      ekranoj: [{ slug: "uebersicht-liste", titolo: "Ü", celo: "z" }],
      kantoj: [],
    });
    expect(legiPlanon("kein Plan")).toBeUndefined();
    expect(slugDe("  Einstellungen & Hilfe ")).toBe("einstellungen-hilfe");
  });

  it("cuts a plan to the first five screens and removes the edges to dropped ones (D-38)", () => {
    const { plano, forigitaj } = mallongigiPlanon(planoKun(6));
    expect(plano.ekranoj.map((e) => e.slug)).toEqual([
      "liste",
      "detail",
      "bearbeiten",
      "einstellungen",
      "hilfe",
    ]);
    expect(plano.kantoj.some((k) => k.al === "archiv" || k.de === "archiv")).toBe(false);
    expect(forigitaj).toEqual(["archiv"]);
  });
});

describe("build conversation", () => {
  const plano = planoKun(2);
  const [liste] = plano.ekranoj;

  it("states the fragment rules in the system text", () => {
    for (const regulo of [
      "nur das Fragment",
      "kein <style>",
      "kein style-Attribut",
      "keinen Markennamen",
      "```mankoj",
    ]) {
      expect(SISTEMO_F).toContain(regulo);
    }
  });

  it("calls the tools the agent asks for and never offers a writing tool, even when it is passed", async () => {
    const ponto = new MemoraPonto();
    const chat = new SkriptaModelo((_peto, index) =>
      index === 0
        ? ilaRespondo([{ name: "get_ero", args: { name: "butono" } }, { name: "save_agordo" }])
        : respondo("```html\n<fm-butono>Weiter</fm-butono>\n```"),
    );
    const p = peno();
    const rezulto = await konstruiEkranon({
      chat,
      budget: new Budget(1e6),
      peno: p,
      varianto: "F",
      ponto,
      gvidanto: "GVIDANTO",
      iloj: [ilo("get_ero"), ilo("save_agordo"), ilo("preview_agordo"), ilo("propose_agordo")],
      plano,
      frazo: "Standards verwalten",
      ekrano: liste ?? { slug: "liste", titolo: "Liste", celo: "Liste" },
      rondo: 1,
      lingvo: "de",
      log: () => {},
    });
    expect(rezulto.fragmento).toBe("<fm-butono>Weiter</fm-butono>");
    expect(chat.petoj.map((peto) => peto.tools)).toEqual([["get_ero"], ["get_ero"]]);
    expect(ponto.vokoj.map((voko) => voko.name)).toEqual(["get_ero", "save_agordo"]);
    const tool = chat.petoj[1]?.messages.filter((m) => m.role === "tool").map((m) => m.content);
    expect(tool?.[1]).toBe('{"ok":true,"name":"save_agordo"}');
    expect(p).toMatchObject({ requests: 2, toolCalls: 2, inputTokens: 200, outputTokens: 40 });
    expect(chat.petoj[0]?.messages[0]?.content).toBe(`${SISTEMO_F}\n\nGVIDANTO`);
    expect(chat.petoj[0]?.messages[1]?.content).toContain(
      "Laut Plan verweist dieser Screen auf: detail.html.",
    );
  });

  it("stops offering tools after the calls are used up and asks for the answer", async () => {
    const chat = new SkriptaModelo((_peto, index) =>
      index < 2 ? ilaRespondo([{ name: "describe" }]) : respondo("```html\n<p>x</p>\n```"),
    );
    await konstruiEkranon({
      chat,
      budget: new Budget(1e6),
      peno: peno(),
      varianto: "F",
      ponto: new MemoraPonto(),
      iloj: [ilo("describe")],
      plano,
      frazo: "Standards verwalten",
      ekrano: liste ?? { slug: "liste", titolo: "Liste", celo: "Liste" },
      rondo: 1,
      lingvo: "de",
      log: () => {},
      maksIlojVokoj: 2,
    });
    expect(chat.petoj.map((peto) => peto.tools)).toEqual([["describe"], ["describe"], undefined]);
    expect(chat.petoj[2]?.messages.at(-1)?.content).toContain("Antworte jetzt");
  });

  it("asks Variante 0 without tools and without system text, ending with PROMPT_0", async () => {
    const chat = new SkriptaModelo(() => respondo("```html\n<!doctype html><html></html>\n```"));
    await konstruiEkranon({
      chat,
      budget: new Budget(1e6),
      peno: peno(),
      varianto: "0",
      plano,
      frazo: "Standards verwalten",
      ekrano: liste ?? { slug: "liste", titolo: "Liste", celo: "Liste" },
      rondo: 1,
      lingvo: "de",
      log: () => {},
    });
    expect(chat.petoj).toHaveLength(1);
    expect(chat.petoj[0]?.tools).toBeUndefined();
    expect(chat.petoj[0]?.messages.map((m) => m.role)).toEqual(["user"]);
    expect(chat.petoj[0]?.messages[0]?.content.endsWith(`\n\n${PROMPT_0}`)).toBe(true);
  });
});

describe("an answer without markup (S037-10 Befund 1)", () => {
  const plano = planoKun(2);
  const liste = plano.ekranoj[0] ?? { slug: "liste", titolo: "Liste", celo: "Liste" };
  const MANKOJ_NUR = [
    "```mankoj",
    '[{"speco": "ilo", "nomo": "list_arangxoj", "ekzemplo": "Abstand", "propono": "Layoutmittel nennen"}]',
    "```",
  ].join("\n");

  const konstrui = (chat: SkriptaModelo, varianto: "F" | "0" = "F") =>
    konstruiEkranon({
      chat,
      budget: new Budget(1e6),
      peno: peno(),
      varianto,
      ...(varianto === "F" ? { ponto: new MemoraPonto(), iloj: [ilo("describe")] } : {}),
      plano,
      frazo: "Standards verwalten",
      ekrano: liste,
      rondo: 1,
      lingvo: "de",
      log: () => {},
    });

  it("asks once more in the same conversation, without tools, and marks a second empty answer", async () => {
    const chat = new SkriptaModelo((_peto, index) => respondo(index === 0 ? MANKOJ_NUR : ""));
    const rezulto = await konstrui(chat);
    expect(chat.petoj).toHaveLength(2);
    const redemando = chat.petoj[1];
    expect(redemando?.tools).toBeUndefined();
    expect(redemando?.messages.slice(0, 2)).toEqual(chat.petoj[0]?.messages);
    expect(redemando?.messages.at(-2)).toEqual({ role: "assistant", content: MANKOJ_NUR });
    expect(redemando?.messages.at(-1)).toEqual({ role: "user", content: REDEMANDO_F });
    expect(rezulto.fragmento).toBe("");
    expect(rezulto.malplena).toEqual({ respondoj: [MANKOJ_NUR, ""] });
    expect(rezulto.mankoj.map((manko) => manko.nomo)).toEqual(["list_arangxoj"]);
  });

  it("takes the markup of the second answer when the first was empty", async () => {
    const chat = new SkriptaModelo((_peto, index) =>
      respondo(index === 0 ? "   " : "```html\n<fm-butono>Weiter</fm-butono>\n```"),
    );
    const rezulto = await konstrui(chat);
    expect(chat.petoj).toHaveLength(2);
    expect(rezulto).toEqual({ fragmento: "<fm-butono>Weiter</fm-butono>", mankoj: [] });
  });

  it("asks Variante 0 for the document, once", async () => {
    const chat = new SkriptaModelo(() => respondo(""));
    const rezulto = await konstrui(chat, "0");
    expect(chat.petoj).toHaveLength(2);
    expect(chat.petoj[1]?.messages.at(-1)).toEqual({ role: "user", content: REDEMANDO_0 });
    expect(rezulto.malplena).toEqual({ respondoj: ["", ""] });
  });

  it("asks nothing more when the answer holds markup", async () => {
    const chat = new SkriptaModelo(() =>
      respondo(`\`\`\`html\n<p>Team Nord</p>\n\`\`\`\n${MANKOJ_NUR}`),
    );
    const rezulto = await konstrui(chat);
    expect(chat.petoj).toHaveLength(1);
    expect(rezulto.fragmento).toBe("<p>Team Nord</p>");
    expect(rezulto.malplena).toBeUndefined();
  });
});

describe("the real ChatModel (D-18, D-19)", () => {
  const KEY = "schluessel-nur-fuer-den-test";

  function fetchDouble(statusoj: number[] = [200]) {
    const petoj: { url: string; body: Record<string, unknown> }[] = [];
    const fetch = async (url: string, init: RequestInit): Promise<Response> => {
      petoj.push({ url, body: JSON.parse(String(init.body)) as Record<string, unknown> });
      const status = statusoj[petoj.length - 1] ?? 200;
      if (status !== 200) return new Response(`zu viele (${KEY})`, { status });
      return new Response(
        JSON.stringify({
          choices: [{ message: { role: "assistant", content: "ok" } }],
          usage: { prompt_tokens: 11, completion_tokens: 4 },
        }),
      );
    };
    return { fetch, petoj };
  }

  it("refuses another model before any request can be made", () => {
    const { fetch, petoj } = fetchDouble();
    expect(() =>
      chatModelDe({ provider: new Provider("openrouter", "eine-andere:free", KEY), fetch }),
    ).toThrow(MalpermesitaModelo);
    expect(petoj).toEqual([]);
  });

  it("sends through chatCompletion with the gate, charges the run's budget, offers merged schemas, never logs the key", async () => {
    const { fetch, petoj } = fetchDouble([429, 200]);
    const linioj: string[] = [];
    let pordo = 0;
    const chat = chatModelDe({
      provider: new Provider("mistral", "ministral-14b-2512", KEY),
      fetch,
      gate: {
        pass: async () => {
          pordo += 1;
        },
      },
      sleep: async () => {},
      log: (linio) => linioj.push(linio),
      timeout: 999_999,
    });
    expect(chat.modelo).toBe("mistral/ministral-14b-2512");
    const budget = new Budget(1_000);
    const skemo = {
      $schema: "x",
      type: "object",
      properties: { name: { type: "string" } },
      oneOf: [{ required: ["name"] }, { properties: { id: { type: "string" } }, required: ["id"] }],
    };
    const r = await chat.send(
      [{ role: "user", content: "Standard A-12" }],
      [{ name: "get_ero", inputSchema: skemo }],
      budget,
    );
    expect(r).toEqual({
      message: { role: "assistant", content: "ok" },
      input: 11,
      output: 4,
      requests: 2,
    });
    expect(budget.spent).toBe(15);
    expect(pordo).toBe(2);
    expect(petoj[1]?.body).toMatchObject({
      model: "ministral-14b-2512",
      tool_choice: "auto",
      tools: [
        { type: "function", function: { name: "get_ero", parameters: provizantaSkemo(skemo) } },
      ],
    });
    expect(provizantaSkemo(skemo)).toEqual({
      type: "object",
      properties: { name: { type: "string" }, id: { type: "string" } },
    });
    expect(linioj.length).toBeGreaterThan(0);
    expect(linioj.join("\n")).not.toContain(KEY);
    expect(PETO_TEMPOLIMO).toBe(180_000);
  });
});
