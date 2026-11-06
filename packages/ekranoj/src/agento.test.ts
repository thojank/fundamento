// The agent (S037-03): answers read (fragment, mankoj block, plan), the build conversation with
// and without tools, and the real ChatModel over metiejo's chatCompletion with a fetch double.

import { Budget, Provider } from "@fundamento/metiejo";
import { describe, expect, it } from "vitest";
import {
  chatModelDe,
  eltiriRespondon,
  eroNomojDe,
  konstruiEkranon,
  legiEroProfilojn,
  legiMankojn,
  legiPlanon,
  legiSxelon,
  MalpermesitaModelo,
  mallongigiPlanon,
  NAVIGADA_REGULO,
  PETO_TEMPOLIMO,
  PROMPT_0,
  type ProfilaKasxmemoro,
  provizantaSkemo,
  REDEMANDO_0,
  REDEMANDO_F,
  SISTEMO_F,
  SXELAJ_SXABLONOJ,
  type SxelaKunteksto,
  sistemoDe,
  slugDe,
  sxelaServilo,
} from "./index.js";
import { ilaRespondo, respondo, SkriptaModelo } from "./test-doubles/chat.js";
import { planoKun } from "./test-doubles/faktoj.js";
import { CXIUJ_ILOJ, ilo, MALNOVAJ_ILOJ, MemoraPonto } from "./test-doubles/iloj.js";
import type { Peno, Trovo } from "./tipoj.js";

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

describe("the shell and the context per screen and round (S038-20, AC-7)", () => {
  const plano = planoKun(2);
  const liste = plano.ekranoj[0] ?? { slug: "liste", titolo: "Liste", celo: "Liste" };
  const FRAGMENTO =
    '<fm-sxelo><fm-pagxo><fm-karto><h2 slot="heading">Standard A-12</h2><fm-butono href="detail.html">Weiter</fm-butono></fm-karto><fm-butono>Team Nord</fm-butono></fm-pagxo></fm-sxelo>';
  const TROVOJ: Trovo[] = [
    {
      regulo: "raw-value",
      loko: "color",
      mesagxo: "Ein roher Wert.",
      sugesto: "Ein Token nehmen.",
      kialo: "Marke über Tokens.",
    },
  ];
  const SXELO: SxelaKunteksto = {
    profiloj: [
      {
        nomo: "sxelo",
        teksto: '{"sxablono":"sxelo","regions":[{"name":"nav","marker":"slot=nav"}]}',
      },
      { nomo: "pagxo", teksto: '{"sxablono":"pagxo","regions":[{"name":"title"}]}' },
    ],
    arangxoj: '{"sxablonoj":["sxelo","pagxo","krado"],"interspacoj":["space.m"]}',
  };
  const PROFILOJ = [
    { nomo: "butono", teksto: '{"ero":"butono","description":"Eine Aktion"}' },
    { nomo: "karto", teksto: '{"ero":"karto","description":"Eine Karte"}' },
  ];

  /** A Gvidanto double that answers the shell's tools and fails where it is told to. */
  class SxelaPonto extends MemoraPonto {
    readonly #malsukcesaj: ReadonlySet<string>;

    constructor(malsukcesaj: readonly string[] = []) {
      super({ iloj: CXIUJ_ILOJ });
      this.#malsukcesaj = new Set(malsukcesaj);
    }

    override async call(name: string, args: Record<string, unknown>): Promise<string> {
      const sxlosilo = `${name} ${String(args.name ?? "")}`.trim();
      if (this.#malsukcesaj.has(sxlosilo)) {
        this.vokoj.push({ name, args });
        throw new Error(`${sxlosilo} nicht erreichbar`);
      }
      if (name === "get_sxablono") {
        this.vokoj.push({ name, args });
        return SXELO.profiloj.find((p) => p.nomo === args.name)?.teksto ?? "{}";
      }
      if (name === "list_arangxoj") {
        this.vokoj.push({ name, args });
        return SXELO.arangxoj ?? "{}";
      }
      return super.call(name, args);
    }
  }

  const konstrui = (
    chat: SkriptaModelo,
    aldone: {
      sxelo?: SxelaKunteksto;
      eroProfiloj?: typeof PROFILOJ;
      rondo?: number;
    } = {},
  ) =>
    konstruiEkranon({
      chat,
      budget: new Budget(1e6),
      peno: peno(),
      varianto: "F",
      ponto: new MemoraPonto({ iloj: CXIUJ_ILOJ }),
      gvidanto: "GVIDANTO",
      iloj: CXIUJ_ILOJ.map(ilo),
      plano,
      frazo: "Standards verwalten",
      ekrano: liste,
      rondo: aldone.rondo ?? 1,
      ...((aldone.rondo ?? 1) > 1 ? { antaua: { fragmento: FRAGMENTO, trovoj: TROVOJ } } : {}),
      lingvo: "de",
      log: () => {},
      ...(aldone.sxelo === undefined ? {} : { sxelo: aldone.sxelo }),
      ...(aldone.eroProfiloj === undefined ? {} : { eroProfiloj: aldone.eroProfiloj }),
    });

  /** The user message of Spec 037 for `liste`, as it is sent today (byte for byte). */
  const MALNOVA_TASKO = [
    "Ablauf: Standards wie Standard A-12 für Team Nord verwalten",
    "Satz des Auftrags: Standards verwalten",
    "Screens des Ablaufs:",
    "- liste.html – Titel liste: Zweck von liste",
    "- detail.html – Titel detail: Zweck von detail",
    "",
    "Baue jetzt den Screen „Titel liste“ (liste.html): Zweck von liste",
    "Laut Plan verweist dieser Screen auf: detail.html.",
    "Sprache der Texte: Deutsch.",
  ].join("\n");
  const MALNOVA_RONDO_2 = [
    MALNOVA_TASKO,
    "",
    "Runde 2: Dein Stand aus Runde 1:",
    "```html",
    FRAGMENTO,
    "```",
    "Befunde der Prüfung (JSON: regulo, loko, mesagxo, sugesto, kialo):",
    "```json",
    JSON.stringify(TROVOJ, null, 2),
    "```",
    "Verbessere den Stand so, dass die Befunde verschwinden, und sende den ganzen Stand neu.",
  ].join("\n");

  it("takes the shell path only when the run's tool list has check_markup and list_arangxoj (D-03)", () => {
    expect(sxelaServilo(CXIUJ_ILOJ.map(ilo))).toBe(true);
    expect(sxelaServilo(MALNOVAJ_ILOJ.map(ilo))).toBe(false);
    expect(sxelaServilo(CXIUJ_ILOJ.filter((n) => n !== "list_arangxoj").map(ilo))).toBe(false);
    expect(sxelaServilo(CXIUJ_ILOJ.filter((n) => n !== "check_markup").map(ilo))).toBe(false);
    expect(sxelaServilo([])).toBe(false);
  });

  it("reads the shell once: get_sxablono brief with marker for sxelo and pagxo, and list_arangxoj", async () => {
    const ponto = new SxelaPonto();
    const linioj: string[] = [];
    const sxelo = await legiSxelon(ponto, (linio) => linioj.push(linio));
    expect(ponto.vokoj).toEqual([
      ...SXELAJ_SXABLONOJ.map((name) => ({
        name: "get_sxablono",
        args: { name, brief: true, marker: true },
      })),
      { name: "list_arangxoj", args: {} },
    ]);
    expect(sxelo).toEqual(SXELO);
    expect(linioj).toEqual([]);
  });

  it("skips a failing shell read with a log line and keeps the rest", async () => {
    const ponto = new SxelaPonto(["get_sxablono pagxo", "list_arangxoj"]);
    const linioj: string[] = [];
    const sxelo = await legiSxelon(ponto, (linio) => linioj.push(linio));
    expect(sxelo).toEqual({ profiloj: SXELO.profiloj.slice(0, 1) });
    expect(linioj).toHaveLength(2);
    expect(linioj[0]).toContain("pagxo");
    expect(linioj[1]).toContain("list_arangxoj");
  });

  it("names the fm-* tags of a fragment sorted, once each, without the shell's Sxablonoj", () => {
    expect(eroNomojDe(FRAGMENTO)).toEqual(["butono", "karto"]);
    expect(
      eroNomojDe('<FM-Butono></FM-Butono><p>fm-karto</p><fm-ligilo to="x.html">x</fm-ligilo>'),
    ).toEqual(["butono", "ligilo"]);
    expect(eroNomojDe("<p>Keine Ero.</p>")).toEqual([]);
  });

  it("reads the Kurzprofile with get_ero fields brief, once per name and run, and skips what is no Ero or fails", async () => {
    const ponto = new SxelaPonto(["get_ero ligilo"]);
    const kasxmemoro: ProfilaKasxmemoro = new Map();
    const linioj: string[] = [];
    const log = (linio: string) => linioj.push(linio);
    const unua = await legiEroProfilojn(
      ponto,
      ["butono", "karto", "nekonata", "ligilo"],
      kasxmemoro,
      log,
    );
    const dua = await legiEroProfilojn(ponto, ["butono", "karto"], kasxmemoro, log);
    expect(unua).toEqual(PROFILOJ);
    expect(dua).toEqual(PROFILOJ);
    expect(ponto.vokoj.map((voko) => voko.args)).toEqual(
      ["butono", "karto", "nekonata", "ligilo"].map((name) => ({ name, fields: ["brief"] })),
    );
    expect(linioj).toHaveLength(2);
    expect(linioj[0]).toContain("nekonata");
    expect(linioj[1]).toContain("ligilo");
  });

  it("puts the shell's Kurzprofile, the layout means and the navigation rule into the system text", () => {
    const sistemo = sistemoDe("GVIDANTO", SXELO);
    expect(sistemo.startsWith(`${SISTEMO_F}\n\nGVIDANTO\n\n`)).toBe(true);
    for (const profilo of SXELO.profiloj) expect(sistemo).toContain(profilo.teksto);
    expect(sistemo).toContain(SXELO.arangxoj);
    expect(sistemo).toContain(NAVIGADA_REGULO);
    for (const ero of [
      "<fm-navigado",
      'slot="nav"',
      "<fm-sxelo>",
      "label",
      '<a href="<slug>.html">',
    ]) {
      expect(NAVIGADA_REGULO).toContain(ero);
    }
    // Without the layout means (the call failed) no empty section stands there.
    expect(sistemoDe("GVIDANTO", { profiloj: SXELO.profiloj })).not.toContain("list_arangxoj");
    // The Spec 037 text, byte for byte.
    expect(sistemoDe("GVIDANTO")).toBe(`${SISTEMO_F}\n\nGVIDANTO`);
    expect(sistemoDe("")).toBe(SISTEMO_F);
  });

  it("sends Spec 037's system text and task unchanged without the shell", async () => {
    for (const rondo of [1, 2]) {
      const chat = new SkriptaModelo(() => respondo("```html\n<p>x</p>\n```"));
      await konstrui(chat, { rondo, eroProfiloj: PROFILOJ });
      expect(chat.petoj[0]?.messages).toEqual([
        { role: "system", content: `${SISTEMO_F}\n\nGVIDANTO` },
        { role: "user", content: rondo === 1 ? MALNOVA_TASKO : MALNOVA_RONDO_2 },
      ]);
    }
  });

  it("asks round 2 with exactly one system and one user message: plan excerpt, Kurzprofile, last fragment, findings, task", async () => {
    const chat = new SkriptaModelo((_peto, index) =>
      index === 0
        ? ilaRespondo([{ name: "get_ero", args: { name: "karto" } }])
        : respondo("```html\n<p>x</p>\n```"),
    );
    await konstrui(chat, { rondo: 2, sxelo: SXELO, eroProfiloj: PROFILOJ });
    const [unua, dua] = chat.petoj;
    expect(unua?.messages.map((m) => m.role)).toEqual(["system", "user"]);
    expect(unua?.messages[0]?.content).toBe(sistemoDe("GVIDANTO", SXELO));
    for (const peto of chat.petoj) {
      expect(peto.messages.filter((m) => m.role === "system")).toHaveLength(1);
      expect(peto.messages.filter((m) => m.role === "user")).toHaveLength(1);
    }
    // The tool loop stays inside the call: the second request repeats the first two messages.
    expect(dua?.messages.slice(0, 2)).toEqual(unua?.messages);
    expect(dua?.messages.map((m) => m.role)).toEqual(["system", "user", "assistant", "tool"]);
    const tasko = unua?.messages[1]?.content ?? "";
    for (const ero of [
      "Ablauf: Standards wie Standard A-12 für Team Nord verwalten",
      "- liste.html – Titel liste: Zweck von liste",
      "- detail.html – Titel detail: Zweck von detail",
      "Laut Plan verweist dieser Screen auf: detail.html.",
      ...PROFILOJ.map((profilo) => profilo.teksto),
      FRAGMENTO,
      JSON.stringify(TROVOJ, null, 2),
      "Baue jetzt den Screen „Titel liste“ (liste.html): Zweck von liste",
      "Verbessere den Stand",
    ]) {
      expect(tasko, ero).toContain(ero);
    }
    expect(/^Runde 2:/m.test(tasko)).toBe(true);
    // Order: plan excerpt, Kurzprofile, last fragment and findings, then the task.
    const lokoj = [
      tasko.indexOf("Screens des Ablaufs:"),
      tasko.indexOf(PROFILOJ[0]?.teksto ?? "-"),
      tasko.indexOf(FRAGMENTO),
      tasko.indexOf(JSON.stringify(TROVOJ, null, 2)),
      tasko.indexOf("Baue jetzt den Screen"),
    ];
    expect(lokoj.every((loko) => loko >= 0)).toBe(true);
    expect([...lokoj].sort((a, b) => a - b)).toEqual(lokoj);
  });

  it("gives round 1 on the shell path no Kurzprofile of Eroj: only the shell in the system text", async () => {
    const chat = new SkriptaModelo(() => respondo("```html\n<p>x</p>\n```"));
    await konstrui(chat, { sxelo: SXELO });
    const tasko = chat.petoj[0]?.messages[1]?.content ?? "";
    expect(chat.petoj[0]?.messages[0]?.content).toContain(NAVIGADA_REGULO);
    expect(tasko).toContain("Baue jetzt den Screen „Titel liste“ (liste.html)");
    expect(tasko).not.toContain("Kurzprofil");
    expect(/^Runde \d+:/m.test(tasko)).toBe(false);
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
