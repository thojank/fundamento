// Provider errors (Spec 038 Lauf 5, A-1, AK-2, C-1): the cause of the Lauf-4 abort (an assistant
// message without content and without tool_calls, F-S038-28-1) reproduced with a double of
// Mistral's rule; the catch layer per request and per screen-round on scripted errors; the stops
// that stay stops; the cleaning of every message before it is logged or written; the spent tokens
// of failed attempts in `peno`. Doubles only: no network, no real wait, no browser.

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Budget, CostLimitReached, DayLimitReached } from "@fundamento/metiejo";
import { describe, expect, it } from "vitest";
import {
  type AnbieterEraro,
  anbieterfehlerojDe,
  type ChatMessage,
  eligoDe,
  klasigiEraron,
  konstruiEkranon,
  kuruEkranojn,
  MAKS_MESAGXO,
  MAKS_RIPETOJ,
  PERMESITA_MODELO,
  PLANA_EKRANO,
  planiEkranojn,
  purigiMesagxon,
  purigiTekston,
  puriMesagxojn,
  REDEMANDO_0,
  REDEMANDO_F,
  RIPETA_ATENDO,
} from "./index.js";
import {
  anbieterEraro,
  ilaRespondo,
  MISTRALA_400,
  mistralaRegulo,
  type Peto,
  respondo,
  retaEraro,
  rondoDePeto,
  SkriptaModelo,
  type Skripto,
  slugDePeto,
} from "./test-doubles/chat.js";
import { planoKun } from "./test-doubles/faktoj.js";
import { ilo, MemoraPonto } from "./test-doubles/iloj.js";
import { neniamVerda, type TaksiloDouble } from "./test-doubles/taksilo.js";
import type { EkranojDeps, EkranojEnigo, Peno, Plano } from "./tipoj.js";

const PLANO: Plano = planoKun(2); // liste → detail
const LISTE = PLANO.ekranoj[0] ?? { slug: "liste", titolo: "Liste", celo: "Liste" };

const novaPeno = (): Peno => ({
  inputTokens: 0,
  outputTokens: 0,
  toolCalls: 0,
  requests: 0,
  ms: 0,
  bytes: 0,
});

/** A fragment of screen `slug` that links to its planned targets. */
function fragmentoDe(slug: string, rondo: number): string {
  const ligiloj = PLANO.kantoj
    .filter((kanto) => kanto.de === slug)
    .map((kanto) => `<fm-butono href="${kanto.al}.html">Weiter</fm-butono>`)
    .join("");
  return `<main data-rondo="${rondo}"><fm-karto><h2 slot="heading">Standard A-12</h2></fm-karto><nav>${ligiloj}</nav></main>`;
}

/** Plan requests get the plan; build requests a fragment of their screen and round. */
const bazaSkripto: Skripto = (peto) => {
  const slug = slugDePeto(peto);
  if (slug === undefined) return respondo(`\`\`\`json\n${JSON.stringify(PLANO)}\n\`\`\``);
  return respondo(`\`\`\`html\n${fragmentoDe(slug, rondoDePeto(peto))}\n\`\`\``);
};

/**
 * The base script with errors in front: per `<slug>#<round>` (or `plano`) the next requests get
 * the listed errors in order, then the base answers.
 */
function kunFehloj(fehloj: Record<string, Error[]>, baza: Skripto = bazaSkripto): Skripto {
  const restaj = new Map(Object.entries(fehloj).map(([sxlosilo, eroj]) => [sxlosilo, [...eroj]]));
  return (peto, index) => {
    const slug = slugDePeto(peto);
    const sxlosilo = slug === undefined ? "plano" : `${slug}#${rondoDePeto(peto)}`;
    const sekva = restaj.get(sxlosilo)?.shift();
    return sekva ?? baza(peto, index);
  };
}

const konstruoj = (chat: SkriptaModelo) =>
  chat.petoj.flatMap((peto) => {
    const slug = slugDePeto(peto);
    return slug === undefined ? [] : [`${slug}#${rondoDePeto(peto)}`];
  });

function enigoDe(e: { plano?: Plano | null; out?: string } = {}): EkranojEnigo {
  return {
    frazo: "Standards wie Standard A-12 für Team Nord verwalten",
    marko: "komuna",
    out: e.out ?? "/tmp/s038-logs/nicht-geschrieben",
    maksTokenoj: 1_000_000,
    ...(e.plano === null ? {} : { plano: e.plano ?? PLANO }),
  };
}

interface Spuro {
  linioj: string[];
  dormoj: number[];
}

function depsDe(
  chat: SkriptaModelo,
  e: { taksilo?: TaksiloDouble; eligo?: EkranojDeps["eligo"] } = {},
): EkranojDeps & Spuro {
  const spuro: Spuro = { linioj: [], dormoj: [] };
  return {
    ...spuro,
    chat,
    tools: new MemoraPonto(),
    taksilo: e.taksilo ?? neniamVerda(),
    marko: { konstrui: async () => ({ css: [] }) },
    nun: () => new Date("2026-11-07T12:00:00Z"),
    log: (linio) => spuro.linioj.push(linio),
    dormi: async (ms) => {
      spuro.dormoj.push(ms);
    },
    ...(e.eligo === undefined ? {} : { eligo: e.eligo }),
  };
}

const modelo = (skripto: Skripto) => new SkriptaModelo(skripto, { modelo: PERMESITA_MODELO });

/** One expected entry (C-1). */
const ero = (
  ekrano: string,
  rondo: number,
  provo: number,
  status: number,
  mesagxo: string,
  ago: AnbieterEraro["ago"],
): AnbieterEraro => ({ ekrano, rondo, provo, status, mesagxo, ago });

const M429 = '{"message":"Rate limit exceeded"}';
const M503 = '{"message":"Service unavailable"}';
const M502 = '{"message":"Bad gateway"}';
const M500 = '{"message":"Internal error"}';
const M400 = '{"message":"Invalid request"}';
const msg = (status: number, korpo: string) => `Anbieter mistral antwortet ${status}: ${korpo}`;
const RETO = "TypeError: fetch failed";

// --- The cause (F-S038-28-1) ----------------------------------------------------------------------

describe("never an assistant message without content and without tool_calls (A-1 cause)", () => {
  const konstrui = (chat: SkriptaModelo, varianto: "F" | "0" = "F") =>
    konstruiEkranon({
      chat,
      budget: new Budget(1e6),
      peno: novaPeno(),
      varianto,
      ...(varianto === "F" ? { ponto: new MemoraPonto(), iloj: [ilo("describe")] } : {}),
      plano: PLANO,
      frazo: "Standards verwalten",
      ekrano: LISTE,
      rondo: 1,
      lingvo: "de",
      log: () => {},
    });

  const senMalplenaAsistanto = (peto: Peto | undefined) =>
    (peto?.messages ?? []).every(
      (m) =>
        m.role !== "assistant" ||
        (m.content ?? "").trim() !== "" ||
        (m.tool_calls ?? []).length > 0,
    );

  it("the double refuses such a message with Mistral's 400 and its text", () => {
    const skripto = mistralaRegulo(() => respondo("x"));
    const rezulto = skripto(
      {
        messages: [
          { role: "user", content: "a" },
          { role: "assistant", content: "" },
          { role: "user", content: "b" },
        ],
      },
      0,
    );
    expect(rezulto).toBeInstanceOf(Error);
    expect((rezulto as Error).message).toBe(msg(400, MISTRALA_400));
  });

  it.each([
    ["an empty", ""],
    ["a blank", "   "],
  ])(
    "asks again after %s first answer without sending it back as an assistant message (redemandi, F)",
    async (_nomo, unua) => {
      const chat = new SkriptaModelo(
        mistralaRegulo((_peto, index) =>
          respondo(index === 0 ? unua : "```html\n<fm-butono>Weiter</fm-butono>\n```"),
        ),
      );
      await expect(konstrui(chat)).resolves.toEqual({
        fragmento: "<fm-butono>Weiter</fm-butono>",
        mankoj: [],
      });
      expect(chat.petoj).toHaveLength(2);
      expect(senMalplenaAsistanto(chat.petoj[1])).toBe(true);
      expect(chat.petoj[1]?.messages.at(-1)).toEqual({ role: "user", content: REDEMANDO_F });
    },
  );

  it("does the same for Variante 0", async () => {
    const chat = new SkriptaModelo(
      mistralaRegulo((_peto, index) =>
        respondo(index === 0 ? "" : "```html\n<!doctype html><html></html>\n```"),
      ),
    );
    await expect(konstrui(chat, "0")).resolves.toMatchObject({
      fragmento: "<!doctype html><html></html>",
    });
    expect(senMalplenaAsistanto(chat.petoj[1])).toBe(true);
    expect(chat.petoj[1]?.messages.at(-1)).toEqual({ role: "user", content: REDEMANDO_0 });
  });

  it("keeps a tool-call answer with empty content as it was (the tool loop sends tool_calls)", async () => {
    const chat = new SkriptaModelo(
      mistralaRegulo((_peto, index) =>
        index === 0
          ? ilaRespondo([{ name: "describe" }])
          : respondo("```html\n<p>Team Nord</p>\n```"),
      ),
    );
    const rezulto = await konstrui(chat);
    expect(rezulto.fragmento).toBe("<p>Team Nord</p>");
    const asistanto = chat.petoj[1]?.messages.find((m) => m.role === "assistant");
    expect(asistanto?.content).toBe("");
    expect(asistanto?.tool_calls?.map((voko) => voko.function.name)).toEqual(["describe"]);
  });

  it("asks the plan again after an empty answer without sending it back (planiEkranojn)", async () => {
    const chat = new SkriptaModelo(
      mistralaRegulo((_peto, index) =>
        respondo(index === 0 ? "" : `\`\`\`json\n${JSON.stringify(PLANO)}\n\`\`\``),
      ),
    );
    const planita = planiEkranojn({
      chat,
      budget: new Budget(1e6),
      peno: novaPeno(),
      frazo: "Standards verwalten",
    });
    await expect(planita).resolves.toMatchObject({ plano: PLANO });
    expect(chat.petoj).toHaveLength(2);
    expect(senMalplenaAsistanto(chat.petoj[1])).toBe(true);
  });

  it("runs the Lauf-4 case to the end: an empty first answer in round 2 ends nothing and catches nothing", async () => {
    // Lauf 4 (liste-filter-detail F): the first answer of a screen in round 2 was empty; the
    // follow-up question was refused with 400 and ended the run.
    let leera = true;
    const chat = modelo(
      mistralaRegulo((peto, index) => {
        if (leera && slugDePeto(peto) === "detail" && rondoDePeto(peto) === 2) {
          leera = false;
          return respondo("");
        }
        return bazaSkripto(peto, index);
      }),
    );
    const deps = depsDe(chat);
    const rezulto = await kuruEkranojn(enigoDe(), deps);
    expect(rezulto.haltigo).toBeUndefined();
    expect(rezulto.faritajRondoj).toBe(3);
    expect(rezulto.rondoj[1]?.detail?.fragmento).toBe(fragmentoDe("detail", 2));
    expect("anbieterfehleroj" in rezulto).toBe(false);
  });
});

// --- Classifier, cleaning, message list ----------------------------------------------------------

describe("the classifier (message shape of metiejo's chatCompletion)", () => {
  it.each([
    [429, "ripeto"],
    [500, "ripeto"],
    [502, "ripeto"],
    [503, "ripeto"],
    [400, "purigo"],
    [401, "halto"],
    [403, "halto"],
    [404, "rezigno"],
    [422, "rezigno"],
  ] as const)("classifies status %i as %s", (status, speco) => {
    expect(klasigiEraron(anbieterEraro(status, M400))).toEqual({
      status,
      speco,
      mesagxo: msg(status, M400),
    });
  });

  it("classifies a network error and an answer without a message as status 0, repeated", () => {
    expect(klasigiEraron(retaEraro())).toEqual({ status: 0, speco: "ripeto", mesagxo: RETO });
    expect(klasigiEraron(new Error("Anbieter mistral: Antwort ohne Nachricht."))).toEqual({
      status: 0,
      speco: "ripeto",
      mesagxo: "Anbieter mistral: Antwort ohne Nachricht.",
    });
  });

  it("lets the limits and every other error pass (undefined)", () => {
    expect(klasigiEraron(new CostLimitReached(10, 10))).toBeUndefined();
    expect(klasigiEraron(new DayLimitReached("openrouter", 1000))).toBeUndefined();
    expect(klasigiEraron(new Error("Renderer weg"))).toBeUndefined();
    expect(klasigiEraron("kein Fehler")).toBeUndefined();
  });
});

// Invented secrets, built at run time so no source line looks like a key.
const SK = ["sk", "or", "v1", "0f1e2d3c4b5a6978".repeat(4)].join("-");
const BEARER_VALORO = "ab12cd34".repeat(5);
const NUDA = "a1B2c3D4".repeat(4);
const QUERY_VALORO = "erfunden123";
const SEKRETOJ = [SK, BEARER_VALORO, NUDA, QUERY_VALORO];
const SEKRETA_KORPO = JSON.stringify({
  error: {
    message: `invalid key ${SK}`,
    url: `https://api.example.test/v1/chat/completions?key=${QUERY_VALORO}&x=1`,
    headers: `Authorization: Bearer ${BEARER_VALORO}`,
    raw: `key ${NUDA}`,
  },
});
const senSekretoj = (teksto: string) => SEKRETOJ.filter((s) => teksto.includes(s));

describe("cleaning a provider message (C-1 mesagxo)", () => {
  it("takes out key patterns, Authorization and Bearer values and query strings", () => {
    const purigita = purigiTekston(msg(401, SEKRETA_KORPO));
    expect(senSekretoj(purigita)).toEqual([]);
    expect(purigita.startsWith("Anbieter mistral antwortet 401: ")).toBe(true);
    expect(purigita).toContain("https://api.example.test/v1/chat/completions?[entfernt]");
    expect(purigiTekston(`x Authorization: Basic ${NUDA.slice(0, 12)} y`)).toBe(
      "x Authorization: [entfernt] y",
    );
    expect(purigiTekston(`Bearer ${BEARER_VALORO}`)).toBe("Bearer [entfernt]");
  });

  it("leaves an ordinary message as it is and is idempotent", () => {
    expect(purigiTekston(msg(429, M429))).toBe(msg(429, M429));
    const unufoje = purigiTekston(msg(400, SEKRETA_KORPO));
    expect(purigiTekston(unufoje)).toBe(unufoje);
  });

  it("cuts the message to 300 characters after cleaning", () => {
    expect(MAKS_MESAGXO).toBe(300);
    const longa = purigiMesagxon(`${msg(400, SEKRETA_KORPO)} ${"x".repeat(500)}`);
    expect(longa.length).toBe(MAKS_MESAGXO);
    expect(senSekretoj(longa)).toEqual([]);
  });

  it("cleans the entries an error carries out of the run", () => {
    const eraro = Object.assign(new Error("x"), {
      anbieterfehleroj: [ero("liste", 1, 1, 400, msg(400, SEKRETA_KORPO), "purigo")],
    });
    const eroj = anbieterfehlerojDe(eraro);
    expect(eroj?.map((e) => ({ ...e, mesagxo: "" }))).toEqual([
      ero("liste", 1, 1, 400, "", "purigo"),
    ]);
    expect(senSekretoj(JSON.stringify(eroj))).toEqual([]);
    expect(anbieterfehlerojDe(new Error("x"))).toBeUndefined();
    expect(anbieterfehlerojDe(Object.assign(new Error("x"), { anbieterfehleroj: [] }))).toBe(
      undefined,
    );
  });
});

describe("the cleaned message list of a resend after 400", () => {
  it("drops empty assistant messages and orphan tool answers, merges user messages that follow each other", () => {
    const voko = {
      id: "v1",
      type: "function" as const,
      function: { name: "describe", arguments: "{}" },
    };
    const messages: ChatMessage[] = [
      { role: "system", content: "S" },
      { role: "user", content: "A" },
      { role: "assistant", content: "", tool_calls: [voko] },
      { role: "tool", content: "r1", tool_call_id: "v1", name: "describe" },
      { role: "tool", content: "r2", tool_call_id: "v9", name: "describe" },
      { role: "assistant", content: "  " },
      { role: "user", content: "B" },
      { role: "user", content: "C" },
    ];
    expect(puriMesagxojn(messages)).toEqual([
      { role: "system", content: "S" },
      { role: "user", content: "A" },
      { role: "assistant", content: "", tool_calls: [voko] },
      { role: "tool", content: "r1", tool_call_id: "v1", name: "describe" },
      { role: "user", content: "B\n\nC" },
    ]);
    // The input stays as it was.
    expect(messages).toHaveLength(8);
  });
});

// --- The catch layer per request and per screen-round --------------------------------------------

describe("provider errors per screen-round (A-1, AK-2)", () => {
  it("repeats after a 429 at most twice with the injected wait, and goes on", async () => {
    const chat = modelo(
      kunFehloj({ "liste#1": [anbieterEraro(429, M429), anbieterEraro(429, M429)] }),
    );
    const deps = depsDe(chat);
    const rezulto = await kuruEkranojn(enigoDe(), deps);
    expect(MAKS_RIPETOJ).toBe(2);
    expect(rezulto.anbieterfehleroj).toEqual([
      ero("liste", 1, 1, 429, msg(429, M429), "ripeto"),
      ero("liste", 1, 2, 429, msg(429, M429), "ripeto"),
    ]);
    expect(deps.dormoj).toEqual([...RIPETA_ATENDO]);
    expect(konstruoj(chat).slice(0, 4)).toEqual(["liste#1", "liste#1", "liste#1", "detail#1"]);
    expect(rezulto.rondoj[0]?.liste?.fragmento).toBe(fragmentoDe("liste", 1));
    expect(rezulto.haltigo).toBeUndefined();
    expect(rezulto.faritajRondoj).toBe(3);
  });

  it("asks a screen of round 1 in one fresh conversation after a third 5xx", async () => {
    const chat = modelo(
      kunFehloj({
        "detail#1": [anbieterEraro(503, M503), anbieterEraro(503, M503), anbieterEraro(503, M503)],
      }),
    );
    const deps = depsDe(chat);
    const rezulto = await kuruEkranojn(enigoDe(), deps);
    expect(rezulto.anbieterfehleroj).toEqual([
      ero("detail", 1, 1, 503, msg(503, M503), "ripeto"),
      ero("detail", 1, 2, 503, msg(503, M503), "ripeto"),
      ero("detail", 1, 3, 503, msg(503, M503), "nova-konversacio"),
    ]);
    expect(konstruoj(chat).slice(0, 5)).toEqual([
      "liste#1",
      "detail#1",
      "detail#1",
      "detail#1",
      "detail#1",
    ]);
    // The fresh conversation starts from the system text and the task only.
    expect(chat.petoj[4]?.messages.map((m) => m.role)).toEqual(["system", "user"]);
    expect(rezulto.rondoj[0]?.detail?.fragmento).toBe(fragmentoDe("detail", 1));
    expect(rezulto.rondoj[0]?.detail?.malhelpoj).not.toContain("anbieterfehler");
    expect(rezulto.haltigo).toBeUndefined();
  });

  it("gives a round-1 screen up after the fresh conversation fails too, notes AK-2 and builds it in round 2", async () => {
    const chat = modelo(kunFehloj({ "detail#1": Array.from({ length: 6 }, () => retaEraro()) }));
    const deps = depsDe(chat);
    const rezulto = await kuruEkranojn(enigoDe(), deps);
    expect(rezulto.anbieterfehleroj).toEqual([
      ero("detail", 1, 1, 0, RETO, "ripeto"),
      ero("detail", 1, 2, 0, RETO, "ripeto"),
      ero("detail", 1, 3, 0, RETO, "nova-konversacio"),
      ero("detail", 1, 4, 0, RETO, "ripeto"),
      ero("detail", 1, 5, 0, RETO, "ripeto"),
      ero("detail", 1, 6, 0, RETO, "rezigno"),
    ]);
    expect(deps.dormoj).toEqual([...RIPETA_ATENDO, ...RIPETA_ATENDO]);
    expect(rezulto.rondoj[0]?.detail).toBeUndefined();
    // Round 2 has no fragment of detail to improve: it builds it as new (a task without „Runde“).
    expect(rezulto.rondoj[1]?.detail?.fragmento).toBe(fragmentoDe("detail", 1));
    expect(rezulto.rondoj[1]?.detail?.portitaEl).toBeUndefined();
    expect(rezulto.notoj?.filter((noto) => noto.includes("AK-2"))).toHaveLength(1);
    expect(rezulto.notoj?.find((noto) => noto.includes("AK-2"))).toContain("detail");
    expect(rezulto.haltigo).toBeUndefined();
    expect(rezulto.faritajRondoj).toBe(3);
  });

  it("resends once with the cleaned list after a 400", async () => {
    const chat = modelo(kunFehloj({ "liste#2": [anbieterEraro(400, M400)] }));
    const rezulto = await kuruEkranojn(enigoDe(), depsDe(chat));
    expect(rezulto.anbieterfehleroj).toEqual([ero("liste", 2, 1, 400, msg(400, M400), "purigo")]);
    expect(konstruoj(chat).filter((k) => k === "liste#2")).toHaveLength(2);
    expect(rezulto.rondoj[1]?.liste?.fragmento).toBe(fragmentoDe("liste", 2));
    expect(rezulto.rondoj[1]?.liste?.portitaEl).toBeUndefined();
  });

  it("keeps the previous fragment of a round-2 screen after a second 400, marks it and goes on with the next screen", async () => {
    const chat = modelo(
      kunFehloj({ "liste#2": [anbieterEraro(400, M400), anbieterEraro(400, M400)] }),
    );
    const rezulto = await kuruEkranojn(enigoDe(), depsDe(chat));
    expect(rezulto.anbieterfehleroj).toEqual([
      ero("liste", 2, 1, 400, msg(400, M400), "purigo"),
      ero("liste", 2, 2, 400, msg(400, M400), "portita"),
    ]);
    expect(konstruoj(chat)).toEqual([
      "liste#1",
      "detail#1",
      "liste#2",
      "liste#2",
      "detail#2",
      "liste#3",
      "detail#3",
    ]);
    const liste2 = rezulto.rondoj[1]?.liste;
    expect(liste2?.portitaEl).toBe(1);
    expect(liste2?.fragmento).toBe(fragmentoDe("liste", 1));
    expect(liste2?.malhelpoj?.[0]).toBe("anbieterfehler");
    expect(liste2?.verda).toBe(false);
    expect(rezulto.haltigo).toBeUndefined();
    expect(rezulto.faritajRondoj).toBe(3);
  });

  it("asks a round-1 screen fresh after a second 400", async () => {
    const chat = modelo(
      kunFehloj({ "liste#1": [anbieterEraro(400, M400), anbieterEraro(400, M400)] }),
    );
    const rezulto = await kuruEkranojn(enigoDe(), depsDe(chat));
    expect(rezulto.anbieterfehleroj).toEqual([
      ero("liste", 1, 1, 400, msg(400, M400), "purigo"),
      ero("liste", 1, 2, 400, msg(400, M400), "nova-konversacio"),
    ]);
    expect(rezulto.rondoj[0]?.liste?.fragmento).toBe(fragmentoDe("liste", 1));
  });

  it("goes on to round 3 when every screen of round 2 ends on provider errors", async () => {
    const zweimal = () => [anbieterEraro(400, M400), anbieterEraro(400, M400)];
    const chat = modelo(kunFehloj({ "liste#2": zweimal(), "detail#2": zweimal() }));
    const rezulto = await kuruEkranojn(enigoDe(), depsDe(chat));
    expect(rezulto.anbieterfehleroj?.map((e) => `${e.ekrano}#${e.rondo} ${e.ago}`)).toEqual([
      "liste#2 purigo",
      "liste#2 portita",
      "detail#2 purigo",
      "detail#2 portita",
    ]);
    expect(rezulto.faritajRondoj).toBe(3);
    expect(rezulto.rondoj[1]?.liste?.portitaEl).toBe(1);
    expect(rezulto.rondoj[1]?.detail?.portitaEl).toBe(1);
    expect(rezulto.rondoj[2]?.liste?.fragmento).toBe(fragmentoDe("liste", 3));
    expect(rezulto.haltigo).toBeUndefined();
  });

  it("treats an error after the 24th tool call like any other request of the screen-round", async () => {
    let finaj = 0;
    const baza: Skripto = (peto, index) => {
      if (slugDePeto(peto) === "liste" && rondoDePeto(peto) === 1) {
        if (peto.tools !== undefined) return ilaRespondo([{ name: "describe" }]);
        finaj += 1;
        if (finaj <= 3) return anbieterEraro(502, M502);
      }
      return bazaSkripto(peto, index);
    };
    const chat = modelo(baza);
    const rezulto = await kuruEkranojn(enigoDe(), depsDe(chat));
    expect(rezulto.anbieterfehleroj).toEqual([
      ero("liste", 1, 1, 502, msg(502, M502), "ripeto"),
      ero("liste", 1, 2, 502, msg(502, M502), "ripeto"),
      ero("liste", 1, 3, 502, msg(502, M502), "nova-konversacio"),
    ]);
    // Two conversations of 24 tool calls each; the fresh one ends with the fragment.
    expect(rezulto.rondoj[0]?.liste?.peno?.toolCalls).toBe(48);
    expect(rezulto.rondoj[0]?.liste?.fragmento).toBe(fragmentoDe("liste", 1));
    expect(rezulto.haltigo).toBeUndefined();
  });

  it("asks the plan once more in a fresh request after its repeats", async () => {
    const chat = modelo(
      kunFehloj({
        plano: [anbieterEraro(500, M500), anbieterEraro(500, M500), anbieterEraro(500, M500)],
      }),
    );
    const rezulto = await kuruEkranojn(enigoDe({ plano: null }), depsDe(chat));
    expect(rezulto.anbieterfehleroj).toEqual([
      ero(PLANA_EKRANO, 0, 1, 500, msg(500, M500), "ripeto"),
      ero(PLANA_EKRANO, 0, 2, 500, msg(500, M500), "ripeto"),
      ero(PLANA_EKRANO, 0, 3, 500, msg(500, M500), "nova-konversacio"),
    ]);
    expect(rezulto.plano.ekranoj.map((e) => e.slug)).toEqual(["liste", "detail"]);
    expect(rezulto.haltigo).toBeUndefined();
    expect(rezulto.faritajRondoj).toBe(3);
  });

  it("stops with a reason when the fresh plan request fails too (no screen started)", async () => {
    const chat = modelo(
      kunFehloj({ plano: Array.from({ length: 6 }, () => anbieterEraro(500, M500)) }),
    );
    const rezulto = await kuruEkranojn(enigoDe({ plano: null }), depsDe(chat));
    expect(
      rezulto.anbieterfehleroj?.map((e) => `${e.ekrano} ${e.rondo} ${e.provo} ${e.ago}`),
    ).toEqual([
      `${PLANA_EKRANO} 0 1 ripeto`,
      `${PLANA_EKRANO} 0 2 ripeto`,
      `${PLANA_EKRANO} 0 3 nova-konversacio`,
      `${PLANA_EKRANO} 0 4 ripeto`,
      `${PLANA_EKRANO} 0 5 ripeto`,
      `${PLANA_EKRANO} 0 6 rezigno`,
    ]);
    expect(rezulto.haltigo).toBe("eraro");
    expect(rezulto.rondoj).toEqual([]);
    expect(rezulto.notoj?.some((noto) => noto.includes("Plananfrage"))).toBe(true);
  });

  it("counts the spent tokens and requests of failed attempts in peno (error.spent)", async () => {
    const sen = await kuruEkranojn(enigoDe(), depsDe(modelo(bazaSkripto)));
    const chat = modelo(
      kunFehloj({
        "liste#1": [anbieterEraro(503, M503, { input: 40, requests: 2 }), retaEraro()],
      }),
    );
    const rezulto = await kuruEkranojn(enigoDe(), depsDe(chat));
    expect(rezulto.rondoj[0]?.liste?.peno).toMatchObject({
      inputTokens: 140,
      outputTokens: 20,
      requests: 4,
    });
    expect(rezulto.peno.inputTokens).toBe(sen.peno.inputTokens + 40);
    expect(rezulto.peno.requests).toBe(sen.peno.requests + 3);
  });
});

describe("stops that stay stops (401/403, limits)", () => {
  it.each([401, 403])("ends the run at once on %i with a reason and no entry", async (status) => {
    const chat = modelo(kunFehloj({ "detail#1": [anbieterEraro(status, M400)] }));
    const deps = depsDe(chat);
    const rezulto = await kuruEkranojn(enigoDe(), deps);
    expect(rezulto.haltigo).toBe("eraro");
    expect("anbieterfehleroj" in rezulto).toBe(false);
    expect(konstruoj(chat)).toEqual(["liste#1", "detail#1"]);
    expect(deps.dormoj).toEqual([]);
    expect(rezulto.notoj?.some((noto) => noto.includes(`(${status})`))).toBe(true);
  });

  it("ends the run at the day limit and at the token limit with no entry", async () => {
    const tago = modelo(kunFehloj({ "detail#1": [new DayLimitReached("openrouter", 1000)] }));
    const r1 = await kuruEkranojn(enigoDe(), depsDe(tago));
    expect(r1.haltigo).toBe("tagolimo");
    expect("anbieterfehleroj" in r1).toBe(false);
    const kosto = modelo(kunFehloj({ "detail#1": [new CostLimitReached(10, 10)] }));
    const r2 = await kuruEkranojn(enigoDe(), depsDe(kosto));
    expect(r2.haltigo).toBe("max-tokens");
    expect("anbieterfehleroj" in r2).toBe(false);
  });

  it("has no anbieterfehleroj field when nothing was caught", async () => {
    const rezulto = await kuruEkranojn(enigoDe(), depsDe(modelo(bazaSkripto)));
    expect("anbieterfehleroj" in rezulto).toBe(false);
  });
});

describe("no key in log lines, raporto.json or raporto.md", () => {
  it("cleans every message of a caught error and of a stop before it is logged or written", async () => {
    const out = mkdtempSync(join(tmpdir(), "s038-32-"));
    const chat = modelo(
      kunFehloj({
        "liste#1": [anbieterEraro(400, SEKRETA_KORPO), anbieterEraro(400, SEKRETA_KORPO)],
        "detail#1": [anbieterEraro(401, SEKRETA_KORPO)],
      }),
    );
    const deps = depsDe(chat, { eligo: eligoDe() });
    const rezulto = await kuruEkranojn(enigoDe({ out }), deps);
    expect(
      rezulto.anbieterfehleroj?.map((e) => [e.ekrano, e.rondo, e.provo, e.status, e.ago]),
    ).toEqual([
      ["liste", 1, 1, 400, "purigo"],
      ["liste", 1, 2, 400, "nova-konversacio"],
    ]);
    for (const e of rezulto.anbieterfehleroj ?? []) {
      expect(e.mesagxo.startsWith("Anbieter mistral antwortet 400: ")).toBe(true);
      expect(e.mesagxo.length).toBeLessThanOrEqual(MAKS_MESAGXO);
    }
    expect(rezulto.haltigo).toBe("eraro");
    const raportoJson = readFileSync(join(out, "raporto.json"), "utf8");
    const raportoMd = readFileSync(join(out, "raporto.md"), "utf8");
    expect(senSekretoj(deps.linioj.join("\n"))).toEqual([]);
    expect(senSekretoj(JSON.stringify(rezulto))).toEqual([]);
    expect(senSekretoj(raportoJson)).toEqual([]);
    expect(senSekretoj(raportoMd)).toEqual([]);
    const raporto = JSON.parse(raportoJson) as { anbieterfehleroj?: AnbieterEraro[] };
    expect(raporto.anbieterfehleroj).toEqual(rezulto.anbieterfehleroj);
    expect(raportoMd).toContain("## Anbieterfehler");
    expect(deps.linioj.some((linio) => linio.includes("Anbieterfehler 400"))).toBe(true);
  });
});
