// The run (S037-03): rounds (AC-8, V-3, D-26), the token limit (AC-9), the estimate before the
// first request (D-20), the user's list (V-2), the plan request (D-38), the tool allowlist and
// Variante 0 (D-34) – on doubles only: no network, no browser, no provider.

import { CostLimitReached, DayLimitReached } from "@fundamento/metiejo";
import { describe, expect, it, vi } from "vitest";
import {
  K8_MERKMALOJ,
  K8_REGULOJ,
  KURZPROFILAJ_KAMPOJ,
  kuruEkranojn,
  MAKS_EKRANOJ,
  MAKS_RONDOJ,
  MalpermesitaModelo,
  NAVIGADA_REGULO,
  NevalidaEnigo,
  navigadaReguloDe,
  PERMESITA_MODELO,
  PROMPT_0,
  type RaportoJson,
  raportoDe,
  raportoMarkdown,
  SISTEMO_F,
  TOKENOJ_EKRANO_RONDO_F,
  TOKENOJ_PLANO,
  trovojDe,
} from "./index.js";
import { BildigiloDouble } from "./test-doubles/bildigilo.js";
import {
  ilaRespondo,
  type Peto,
  respondo,
  rondoDePeto,
  SkriptaModelo,
  slugDePeto,
} from "./test-doubles/chat.js";
import { faktoKunLigiloj, planoKun } from "./test-doubles/faktoj.js";
import { CXIUJ_ILOJ, kampojDeTabelo, MALNOVAJ_ILOJ, MemoraPonto } from "./test-doubles/iloj.js";
import { MALVERDA, neniamVerda, TaksiloDouble, VERDA, verdaEkde } from "./test-doubles/taksilo.js";
import type {
  BildigoRezulto,
  EkranaDokumento,
  EkranojDeps,
  EkranojEnigo,
  EkranojRezulto,
  K8Merkmal,
  KostoTakso,
  Peno,
  Plano,
  RondoEkrano,
  SondoPetoForma,
  Taksado,
  TaksadoK8Rezulto,
  Varianto,
} from "./tipoj.js";

const PLANO: Plano = planoKun(2); // liste → detail

/** A fragment of screen `slug` that links to its planned targets (navigation complete). */
function fragmentoDe(plano: Plano, slug: string, rondo: number): string {
  const ligiloj = plano.kantoj
    .filter((kanto) => kanto.de === slug)
    .map((kanto) => `<fm-butono href="${kanto.al}.html">Weiter</fm-butono>`)
    .join("");
  return `<main data-rondo="${rondo}"><fm-karto><h2 slot="heading">Standard A-12</h2></fm-karto><nav>${ligiloj}</nav></main>`;
}

/** Plan requests get `plano`; build requests get a fragment of their screen. */
function skripto(plano: Plano, aldone: (peto: Peto) => string = () => "") {
  return (peto: Peto) => {
    const slug = slugDePeto(peto);
    if (slug === undefined) return respondo(`\`\`\`json\n${JSON.stringify(plano)}\n\`\`\``);
    return respondo(
      `\`\`\`html\n${fragmentoDe(plano, slug, rondoDePeto(peto))}\n\`\`\`${aldone(peto)}`,
    );
  };
}

/** The input of a run; `plano: null` = no plan given (the agent plans). */
function enigoDe(
  e: Omit<Partial<EkranojEnigo>, "plano"> & { plano?: Plano | null } = {},
): EkranojEnigo {
  const { plano, ...resto } = e;
  return {
    frazo: "Standards wie Standard A-12 für Team Nord verwalten",
    marko: "komuna",
    out: "/tmp/s037-logs/nicht-geschrieben",
    maksTokenoj: 1_000_000,
    ...resto,
    ...(plano === null ? {} : { plano: plano ?? PLANO }),
  };
}

function depsDe(e: {
  chat: SkriptaModelo;
  taksilo?: TaksiloDouble;
  tools?: MemoraPonto | null;
  bildigilo?: BildigiloDouble | null;
  takso?: (takso: KostoTakso) => void;
  linioj?: string[];
}): EkranojDeps {
  return {
    chat: e.chat,
    ...(e.tools === null ? {} : { tools: e.tools ?? new MemoraPonto() }),
    taksilo: e.taksilo ?? neniamVerda(),
    ...(e.bildigilo === null ? {} : { bildigilo: e.bildigilo ?? new BildigiloDouble() }),
    marko: { konstrui: async () => ({ css: [] }) },
    nun: () => new Date("2026-10-31T12:00:00Z"),
    log: (linio) => e.linioj?.push(linio),
    ...(e.takso === undefined ? {} : { takso: e.takso }),
  };
}

/** A screen state without its effort (Spec 038 C-6): what a carried round repeats. */
function senPeno(stato: RondoEkrano | undefined): Omit<RondoEkrano, "peno"> | undefined {
  if (stato === undefined) return undefined;
  const { peno: _peno, ...resto } = stato;
  return resto;
}

const konstruoj = (chat: SkriptaModelo) =>
  chat.petoj.flatMap((peto) => {
    const slug = slugDePeto(peto);
    return slug === undefined ? [] : [`${slug}#${rondoDePeto(peto)}`];
  });

describe("rounds (AC-8, V-3, D-26)", () => {
  it("runs exactly three rounds when the scorer is never green, and every remaining finding is a deviation with regulo and kialo", async () => {
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    const rezulto = await kuruEkranojn(enigoDe(), depsDe({ chat }));

    expect(MAKS_RONDOJ).toBe(3);
    expect(rezulto.rondoj).toHaveLength(3);
    expect(rezulto.faritajRondoj).toBe(3);
    expect(rezulto.haltigo).toBeUndefined();
    expect(konstruoj(chat)).toEqual([
      "liste#1",
      "detail#1",
      "liste#2",
      "detail#2",
      "liste#3",
      "detail#3",
    ]);
    for (const rondo of rezulto.rondoj) {
      expect(Object.keys(rondo)).toEqual(["liste", "detail"]);
      expect(Object.values(rondo).map((ekrano) => ekrano.verda)).toEqual([false, false]);
    }
    // Every finding of the last round is left, with rule, place and reason.
    const lasta = rezulto.rondoj[2] ?? {};
    const atendataj = Object.entries(lasta).flatMap(([slug, ekrano]) =>
      (ekrano.trovoj ?? []).map((trovo) => ({
        ekrano: slug,
        regulo: trovo.regulo,
        loko: trovo.loko,
        kialo: trovo.kialo,
      })),
    );
    expect(atendataj.length).toBeGreaterThanOrEqual(4);
    expect(rezulto.restantaj).toEqual(atendataj);
    expect(rezulto.restantaj.map((r) => `${r.ekrano} ${r.regulo} ${r.loko}`)).toEqual([
      "liste raw-value color",
      "liste rebuilt-ero button",
      "detail raw-value color",
      "detail rebuilt-ero button",
    ]);
    const malplenaj = rezulto.restantaj.filter((r) => r.regulo === "" || r.kialo.trim() === "");
    expect(malplenaj).toEqual([]);
  });

  it("gives the next round the current fragment and the structured findings", async () => {
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    await kuruEkranojn(enigoDe(), depsDe({ chat }));
    const dua = chat.petoj.find((peto) => slugDePeto(peto) === "liste" && rondoDePeto(peto) === 2);
    const tasko = dua?.messages.find((m) => m.role === "user")?.content ?? "";
    expect(tasko).toContain(fragmentoDe(PLANO, "liste", 1));
    const json = /```json\n([\s\S]*?)```/.exec(tasko)?.[1] ?? "[]";
    const trovoj = JSON.parse(json) as Record<string, string>[];
    expect(trovoj.map((t) => Object.keys(t).sort())).toEqual([
      ["kialo", "loko", "mesagxo", "regulo", "sugesto"],
      ["kialo", "loko", "mesagxo", "regulo", "sugesto"],
    ]);
    expect(trovoj.map((t) => t.regulo)).toEqual(["raw-value", "rebuilt-ero"]);
  });

  it("stops after round 2 when all screens are green then, and carries round 3 forward marked green since round 2", async () => {
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    const rezulto = await kuruEkranojn(enigoDe(), depsDe({ chat, taksilo: verdaEkde(2) }));

    expect(rezulto.faritajRondoj).toBe(2);
    expect(konstruoj(chat)).toEqual(["liste#1", "detail#1", "liste#2", "detail#2"]);
    expect(rezulto.rondoj).toHaveLength(3);
    expect(rezulto.rondoj[1]?.liste?.verda).toBe(true);
    expect(rezulto.rondoj[1]?.liste?.verdaEkde).toBeUndefined();
    // Spec 038 C-6: a carried round has no effort of its own.
    expect(rezulto.rondoj[2]?.liste).toEqual({
      ...senPeno(rezulto.rondoj[1]?.liste),
      verdaEkde: 2,
    });
    expect(rezulto.rondoj[2]?.detail).toEqual({
      ...senPeno(rezulto.rondoj[1]?.detail),
      verdaEkde: 2,
    });
    expect(rezulto.restantaj).toEqual([]);
  });

  it("does not rebuild a screen that turned green and carries it forward while another goes on", async () => {
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    const taksilo = new TaksiloDouble((slug) => (slug === "liste" ? VERDA : MALVERDA));
    const rezulto = await kuruEkranojn(enigoDe(), depsDe({ chat, taksilo }));

    expect(konstruoj(chat)).toEqual(["liste#1", "detail#1", "detail#2", "detail#3"]);
    expect(rezulto.rondoj.map((rondo) => rondo.liste?.verdaEkde)).toEqual([undefined, 1, 1]);
    expect(rezulto.rondoj.map((rondo) => rondo.detail?.verdaEkde)).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
    expect(taksilo.vokoj.filter((voko) => voko.slug === "liste")).toHaveLength(1);
    expect(new Set(rezulto.restantaj.map((r) => r.ekrano))).toEqual(new Set(["detail"]));
  });
});

describe("an answer without markup (S037-10 Befund 1)", () => {
  it("asks once more, marks a screen whose second answer is empty too and lets the run go on", async () => {
    const chat = new SkriptaModelo(
      (peto) => (slugDePeto(peto) === "detail" ? respondo("") : skripto(PLANO)(peto)),
      { modelo: PERMESITA_MODELO },
    );
    const linioj: string[] = [];
    // Every score is green: only the empty answer keeps detail from green.
    const taksilo = new TaksiloDouble(() => VERDA);
    const rezulto = await kuruEkranojn(enigoDe(), depsDe({ chat, taksilo, linioj }));

    expect(konstruoj(chat)).toEqual([
      "liste#1",
      "detail#1",
      "detail#1",
      "detail#2",
      "detail#2",
      "detail#3",
      "detail#3",
    ]);
    expect(rezulto.faritajRondoj).toBe(3);
    expect(rezulto.haltigo).toBeUndefined();
    for (const rondo of rezulto.rondoj) {
      expect(rondo.detail?.verda).toBe(false);
      expect(rondo.detail?.malhelpoj).toEqual(["leere-antwort"]);
      expect(rondo.detail?.trovoj?.map((t) => `${t.regulo} ${t.loko}`)).toEqual([
        "leere-antwort detail.html",
      ]);
    }
    expect(rezulto.rondoj[0]?.liste?.verda).toBe(true);
    expect(linioj.filter((linio) => /leere Antwort/.test(linio))).toEqual([
      "Runde 1: detail – leere Antwort, auch nach einer Nachfrage",
      "Runde 2: detail – leere Antwort, auch nach einer Nachfrage",
      "Runde 3: detail – leere Antwort, auch nach einer Nachfrage",
    ]);
    expect(rezulto.restantaj.filter((r) => r.ekrano === "detail")).toEqual([
      {
        ekrano: "detail",
        regulo: "leere-antwort",
        loko: "detail.html",
        kialo: expect.stringContaining("Nachfrage"),
      },
    ]);
  });

  it("asks nothing more for a screen whose answer holds markup", async () => {
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    const rezulto = await kuruEkranojn(enigoDe(), depsDe({ chat, taksilo: verdaEkde(1) }));
    expect(konstruoj(chat)).toEqual(["liste#1", "detail#1"]);
    expect(rezulto.rondoj[0]?.detail?.malhelpoj).toEqual([]);
  });
});

describe("token limit (AC-9, D-20)", () => {
  it("stops before the request that would pass --max-tokens, keeps the partial result and names the reached round", async () => {
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    const linioj: string[] = [];
    // One request costs 120 tokens; the second would bring the run to 240 > 200.
    const rezulto = await kuruEkranojn(enigoDe({ maksTokenoj: 200 }), depsDe({ chat, linioj }));

    expect(chat.petoj).toHaveLength(1);
    expect(rezulto.haltigo).toBe("max-tokens");
    expect(rezulto.faritajRondoj).toBe(1);
    expect(rezulto.rondoj).toHaveLength(1);
    expect(Object.keys(rezulto.rondoj[0] ?? {})).toEqual(["liste"]);
    expect(rezulto.restantaj).toContainEqual({
      ekrano: "detail",
      regulo: "nicht-gebaut",
      loko: "detail.html",
      kialo: "Die Tokengrenze war erreicht, bevor der Screen gebaut wurde.",
    });
    expect(rezulto.peno).toMatchObject({ inputTokens: 100, outputTokens: 20, requests: 1 });
    expect(rezulto.kosto.usd).toBeCloseTo((120 * 0.2) / 1e6, 12);
    expect(linioj.join("\n")).not.toMatch(/\bat\s+\S+\s+\(|Error:/);
    expect(rezulto.notoj?.some((noto) => noto.includes("Kostengrenze von 200 Tokens"))).toBe(true);
  });

  it("marks a screen the stop left unbuilt in a round as carried over from its round (S037-10 Befund 6)", async () => {
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    // 120 tokens per request: liste#1, detail#1, liste#2 = 360; detail#2 would bring 480 > 400.
    const rezulto = await kuruEkranojn(enigoDe({ maksTokenoj: 400 }), depsDe({ chat }));
    expect(konstruoj(chat)).toEqual(["liste#1", "detail#1", "liste#2"]);
    expect(rezulto.haltigo).toBe("max-tokens");
    expect(rezulto.rondoj).toHaveLength(2);
    expect(rezulto.rondoj[1]?.detail?.portitaEl).toBe(1);
    expect(rezulto.rondoj[1]?.detail?.fragmento).toBe(fragmentoDe(PLANO, "detail", 1));
    expect(rezulto.rondoj[1]?.liste?.portitaEl).toBeUndefined();
    expect(rezulto.rondoj[0]?.detail?.portitaEl).toBeUndefined();
  });

  it("stops cleanly at the provider's day limit with haltigo tagolimo", async () => {
    const chat = new SkriptaModelo(
      (peto, index) =>
        index === 0 ? skripto(PLANO)(peto) : new DayLimitReached("openrouter", 1000),
      { modelo: PERMESITA_MODELO },
    );
    const rezulto = await kuruEkranojn(enigoDe(), depsDe({ chat }));
    expect(rezulto.haltigo).toBe("tagolimo");
    expect(Object.keys(rezulto.rondoj[0] ?? {})).toEqual(["liste"]);
  });

  it("treats a CostLimitReached thrown by the model itself the same way", async () => {
    const chat = new SkriptaModelo(() => new CostLimitReached(10, 10), {
      modelo: PERMESITA_MODELO,
    });
    const rezulto = await kuruEkranojn(enigoDe(), depsDe({ chat }));
    expect(rezulto.haltigo).toBe("max-tokens");
    expect(rezulto.rondoj).toEqual([]);
    expect(rezulto.restantaj.map((r) => r.regulo)).toEqual(["nicht-gebaut", "nicht-gebaut"]);
  });

  it("computes the estimate before the first request and hands it out first", async () => {
    const okazoj: string[] = [];
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO, okazoj });
    const tools = new MemoraPonto({ okazoj });
    const linioj: string[] = [];
    let takso: KostoTakso | undefined;
    const rezulto = await kuruEkranojn(
      enigoDe({ plano: null, ekranoj: ["Liste", "Detail"] }),
      depsDe({
        chat,
        tools,
        linioj,
        takso: (t) => {
          okazoj.push("takso");
          takso = t;
        },
      }),
    );
    expect(okazoj[0]).toBe("takso");
    expect(okazoj.indexOf("takso")).toBeLessThan(okazoj.indexOf("send"));
    expect(linioj[0]).toBe(takso?.satz);
    expect(takso).toMatchObject({
      ekranoj: 2,
      rondoj: 3,
      planPeto: true,
      tokenoj: 2 * 3 * TOKENOJ_EKRANO_RONDO_F + TOKENOJ_PLANO,
    });
    expect(rezulto.takso).toEqual(takso);
  });
});

describe("Grenze vor der ersten Anfrage einer Runde (S038-25, I-1, D-203, C-2)", () => {
  const ZAEHLER = ["inputTokens", "outputTokens", "requests", "toolCalls"] as const;

  /** Σ over screens × rounds of `peno`; with a given plan there is no plan request. */
  function sumoDe(rezulto: EkranojRezulto): Record<(typeof ZAEHLER)[number], number> {
    const sumo = { inputTokens: 0, outputTokens: 0, requests: 0, toolCalls: 0 };
    for (const rondo of rezulto.rondoj) {
      for (const stato of Object.values(rondo)) {
        if (stato.peno === undefined) continue;
        for (const z of ZAEHLER) sumo[z] += stato.peno[z];
      }
    }
    return sumo;
  }

  const raportoMdDe = (rezulto: EkranojRezulto): { md: string; json: RaportoJson } => {
    const json = raportoDe({
      id: "s038-25",
      enigo: enigoDe(),
      varianto: "F",
      lingvo: "de",
      bildigilo: true,
      rezulto,
      bildoj: [],
    });
    return { md: raportoMarkdown(json), json };
  };

  it("Grenze vor der ersten Anfrage einer Runde: no peno and no report row for a build that never asked", async () => {
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    // 120 tokens per request: liste#1, detail#1, liste#2 = 360; detail#2 would bring 480 > 400.
    const rezulto = await kuruEkranojn(enigoDe({ maksTokenoj: 400 }), depsDe({ chat }));
    expect(konstruoj(chat)).toEqual(["liste#1", "detail#1", "liste#2"]);
    expect(rezulto.haltigo).toBe("max-tokens");
    const detail = rezulto.rondoj[1]?.detail;
    expect(detail?.portitaEl).toBe(1);
    expect(detail).toBeDefined();
    expect(detail).not.toHaveProperty("peno");
    // The builds that asked keep their effort.
    expect(rezulto.rondoj[1]?.liste?.peno?.requests).toBe(1);
    expect(rezulto.rondoj[0]?.detail?.peno?.requests).toBe(1);

    const { md, json } = raportoMdDe(rezulto);
    expect(md).toContain("| liste | 2 |");
    expect(md).not.toContain("| detail | 2 |");
    expect(json.rondoj[1]?.ekranoj.detail?.portitaEl).toBe(1);
    expect("peno" in (json.rondoj[1]?.ekranoj.detail ?? {})).toBe(false);
    // Σ screens × rounds + plan = run, for every counter (D-191); the plan is given: plan = 0.
    const sumo = sumoDe(rezulto);
    for (const z of ZAEHLER) {
      expect(sumo[z] + (json.penoPlano?.[z] ?? Number.NaN), z).toBe(rezulto.peno[z]);
      expect(json.penoPlano?.[z], z).toBe(0);
    }
  });

  it("keeps the row of a build that asked at least once but left no fragment (stop in the tool loop)", async () => {
    // Every build asks describe once, then sends its fragment; 120 tokens per request.
    const chat = new SkriptaModelo(
      (peto) => {
        const slug = slugDePeto(peto);
        if (slug === undefined) return skripto(PLANO)(peto);
        if (!peto.messages.some((m) => m.role === "tool")) {
          return ilaRespondo([{ name: "describe" }]);
        }
        return skripto(PLANO)(peto);
      },
      { modelo: PERMESITA_MODELO },
    );
    // liste#1, detail#1, liste#2 = 6 requests = 720; detail#2 asks once (840), its second
    // request would bring 960 > 900.
    const rezulto = await kuruEkranojn(enigoDe({ maksTokenoj: 900 }), depsDe({ chat }));
    expect(rezulto.haltigo).toBe("max-tokens");
    expect(konstruoj(chat)).toEqual([
      "liste#1",
      "liste#1",
      "detail#1",
      "detail#1",
      "liste#2",
      "liste#2",
      "detail#2",
    ]);
    const detail = rezulto.rondoj[1]?.detail;
    expect(detail?.portitaEl).toBe(1);
    expect(detail?.peno).toMatchObject({ inputTokens: 100, outputTokens: 20, requests: 1 });

    const { md, json } = raportoMdDe(rezulto);
    expect(md).toContain("| detail | 2 | 100 | 20 | 1 |");
    const sumo = sumoDe(rezulto);
    for (const z of ZAEHLER) {
      expect(sumo[z] + (json.penoPlano?.[z] ?? Number.NaN), z).toBe(rezulto.peno[z]);
      expect(json.penoPlano?.[z], z).toBe(0);
    }
  });
});

describe("input (V-2, D-19)", () => {
  it("refuses a user list of six screens before any request and before the estimate", async () => {
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    const tools = new MemoraPonto();
    let takso = false;
    const nomoj = ["Liste", "Detail", "Bearbeiten", "Einstellungen", "Hilfe", "Archiv"];
    const peto = kuruEkranojn(
      enigoDe({ plano: null, ekranoj: nomoj }),
      depsDe({ chat, tools, takso: () => (takso = true) }),
    );
    await expect(peto).rejects.toBeInstanceOf(NevalidaEnigo);
    await expect(peto).rejects.toMatchObject({
      problemoj: [{ path: "/ekranoj", rule: "plan-too-many-screens" }],
    });
    expect(chat.petoj).toEqual([]);
    expect(tools.vokoj).toEqual([]);
    expect(tools.listoj).toBe(0);
    expect(takso).toBe(false);
  });

  it("refuses another model before any request (D-19)", async () => {
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: "openrouter/eine-andere:free" });
    await expect(kuruEkranojn(enigoDe(), depsDe({ chat }))).rejects.toBeInstanceOf(
      MalpermesitaModelo,
    );
    expect(chat.petoj).toEqual([]);
  });
});

describe("plan request (D-38, C-6)", () => {
  const ses: Plano = planoKun(6);

  it("asks once more with the limit when the agent plans six screens, then cuts to the first five", async () => {
    const chat = new SkriptaModelo(skripto(ses), { modelo: PERMESITA_MODELO });
    const rezulto = await kuruEkranojn(
      enigoDe({ plano: null }),
      depsDe({ chat, taksilo: verdaEkde(1) }),
    );
    const planPetoj = chat.petoj.filter((peto) => slugDePeto(peto) === undefined);
    expect(planPetoj).toHaveLength(2);
    expect(planPetoj[1]?.messages.at(-1)?.content).toContain("höchstens 5 Screens");
    expect(rezulto.plano.ekranoj.map((e) => e.slug)).toEqual([
      "liste",
      "detail",
      "bearbeiten",
      "einstellungen",
      "hilfe",
    ]);
    expect(rezulto.plano.kantoj).toEqual(ses.kantoj.slice(0, 4));
    expect(rezulto.notoj?.filter((noto) => noto.includes("D-38"))).toHaveLength(2);
    expect(rezulto.notoj?.join("\n")).toContain("weggelassen: archiv");
  });

  it("takes the second plan when it keeps the limit", async () => {
    const chat = new SkriptaModelo((peto, index) => skripto(index === 0 ? ses : PLANO)(peto), {
      modelo: PERMESITA_MODELO,
    });
    const rezulto = await kuruEkranojn(
      enigoDe({ plano: null }),
      depsDe({ chat, taksilo: verdaEkde(1) }),
    );
    expect(rezulto.plano).toEqual(PLANO);
  });

  it("plans purposes and edges for exactly the user's names", async () => {
    const ses2 = planoKun(3);
    const chat = new SkriptaModelo(skripto(ses2), { modelo: PERMESITA_MODELO });
    const rezulto = await kuruEkranojn(
      enigoDe({ plano: null, ekranoj: ["Liste", "Detail"] }),
      depsDe({ chat, taksilo: verdaEkde(1) }),
    );
    expect(rezulto.plano.ekranoj).toEqual(PLANO.ekranoj);
    expect(rezulto.plano.kantoj).toEqual([{ de: "liste", al: "detail" }]);
    expect(chat.petoj[0]?.messages.at(-1)?.content).toContain("- liste: Liste");
  });

  it("asks no plan when a plan is given", async () => {
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    await kuruEkranojn(enigoDe(), depsDe({ chat, taksilo: verdaEkde(1) }));
    expect(chat.petoj.every((peto) => slugDePeto(peto) !== undefined)).toBe(true);
  });
});

describe("tools and check_usage (Variante F)", () => {
  it("never offers the writing tools, offers the build tools, puts the gvidanto prompt into the system text", async () => {
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    const tools = new MemoraPonto();
    await kuruEkranojn(enigoDe(), depsDe({ chat, tools, taksilo: verdaEkde(1) }));
    const angebotene = new Set(chat.petoj.flatMap((peto) => peto.tools ?? []));
    for (const skriba of ["save_agordo", "preview_agordo", "propose_agordo"]) {
      expect(angebotene.has(skriba)).toBe(false);
    }
    expect([...angebotene].sort()).toEqual([
      "check_usage",
      "describe",
      "describe_term",
      "explain_regulo",
      "get_ero",
      "get_sxablono",
      "get_token",
      "list_eroj",
      "list_reguloj",
      "list_sxablonoj",
      "search_tokens",
      "suggest_ero",
    ]);
    const sistemo = chat.petoj[0]?.messages[0];
    expect(sistemo?.role).toBe("system");
    expect(sistemo?.content).toContain("GVIDANTO-PROMPT");
    expect(sistemo?.content).toContain("kein <style>");
  });

  it("asks check_usage with the instances built from the facts and get_ero, and an error keeps the screen from green", async () => {
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    const tools = new MemoraPonto({
      checkUsage: (instances) => ({
        instances: instances.length,
        valid: false,
        violations: [
          {
            instance: [0],
            issue: {
              rule: "karto-heading-required",
              severity: "error",
              path: "/0",
              message: "Die Karte braucht eine Überschrift.",
              suggestion: "Den Slot heading füllen.",
              regulo: {
                id: "regulo-1",
                name: "karto-titolo",
                kialo: "Eine Karte ohne Titel ist nicht auffindbar.",
              },
            },
          },
        ],
      }),
    });
    const rezulto = await kuruEkranojn(enigoDe(), depsDe({ chat, tools, taksilo: verdaEkde(1) }));
    const kontroloj = tools.vokoj.filter((voko) => voko.name === "check_usage");
    expect(kontroloj).toHaveLength(6);
    expect(kontroloj[0]?.args.instances).toEqual([
      { ero: "karto", props: {}, lingvo: "de" },
      { ero: "butono", props: { href: "detail.html" }, lingvo: "de" },
    ]);
    expect(rezulto.rondoj[0]?.liste?.malhelpoj).toEqual(["check_usage"]);
    expect(rezulto.restantaj).toContainEqual({
      ekrano: "liste",
      regulo: "karto-titolo",
      loko: "fm-karto",
      kialo: "Eine Karte ohne Titel ist nicht auffindbar.",
    });
    expect(
      tools.vokoj.filter((voko) => voko.name === "get_ero").map((voko) => voko.args.name),
    ).toEqual(["karto", "butono"]);
  });

  it("takes the agent's mankoj block out of the fragment and keeps it in the result", async () => {
    const bloko =
      '\n```mankoj\n[{"speco": "sxablono", "nomo": "listo-kun-filtrilo", "ekzemplo": "Liste der Standards mit Filter", "propono": "Sxablono Liste mit Filterleiste"}]\n```';
    const chat = new SkriptaModelo(
      skripto(PLANO, () => bloko),
      { modelo: PERMESITA_MODELO },
    );
    const rezulto = await kuruEkranojn(enigoDe(), depsDe({ chat, taksilo: verdaEkde(1) }));
    expect(rezulto.rondoj[0]?.liste?.fragmento).toBe(fragmentoDe(PLANO, "liste", 1));
    expect(rezulto.mankoj).toEqual([
      {
        speco: "sxablono",
        nomo: "listo-kun-filtrilo",
        ofteco: 2,
        taskoj: ["liste", "detail"],
        ekzemplo: "Liste der Standards mit Filter",
        propono: "Sxablono Liste mit Filterleiste",
        celo: "muster-rondo-2",
      },
    ]);
  });
});

describe("Variante 0 (D-34) and no renderer", () => {
  it("builds a whole document per screen without tools, without the Gvidanto and without check_usage", async () => {
    const tools = new MemoraPonto();
    const chat = new SkriptaModelo(
      () =>
        respondo(
          `\`\`\`html\n<!doctype html><html lang="de"><body><main><h1>Standard A-12</h1><a href="detail.html">Weiter</a></main></body></html>\n\`\`\``,
        ),
      { modelo: PERMESITA_MODELO },
    );
    const bildigilo = new BildigiloDouble();
    const rezulto = await kuruEkranojn(
      enigoDe({ varianto: "0" }),
      depsDe({ chat, tools, bildigilo, taksilo: verdaEkde(1) }),
    );
    expect(chat.petoj.every((peto) => peto.tools === undefined)).toBe(true);
    expect(chat.petoj.every((peto) => peto.messages.every((m) => m.role !== "system"))).toBe(true);
    expect(chat.petoj[0]?.messages[0]?.content.endsWith(PROMPT_0)).toBe(true);
    expect(tools.vokoj).toEqual([]);
    expect(tools.listoj + tools.promptoj).toBe(0);
    expect(rezulto.rondoj[0]?.liste?.malobservoj).toEqual([]);
    expect(rezulto.rondoj[0]?.liste?.fragmento).toContain("<!doctype html>");
    expect(bildigilo.dokumentoj[0]?.dokumento.html).toContain('<!doctype html><html lang="de">');
    expect(bildigilo.dokumentoj[0]?.varianto).toBe("0");
  });

  it("writes no gap of Variante 0 into the result (S037-10 Befund 7)", async () => {
    const chat = new SkriptaModelo(
      () => respondo("```html\n<!doctype html><html><body><button>OK</button></body></html>\n```"),
      { modelo: PERMESITA_MODELO },
    );
    const rezulto = await kuruEkranojn(enigoDe({ varianto: "0" }), depsDe({ chat }));
    expect(rezulto.rondoj[2]?.liste?.taksado.mankoj.length).toBeGreaterThan(0);
    expect(rezulto.mankoj).toEqual([]);
  });

  it("never turns a screen green without a renderer and says why", async () => {
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    const rezulto = await kuruEkranojn(
      enigoDe(),
      depsDe({ chat, bildigilo: null, taksilo: verdaEkde(1) }),
    );
    expect(rezulto.faritajRondoj).toBe(3);
    expect(rezulto.rondoj[0]?.liste?.malhelpoj).toEqual(["axe-nekontrolita"]);
    expect(rezulto.restantaj.map((r) => `${r.ekrano} ${r.regulo}`)).toEqual([
      "liste axe-nekontrolita",
      "detail axe-nekontrolita",
    ]);
  });
});

// K8 probes (Spec 038 Lauf 3, 3.4b, D-S038-17-2): the scorer names the tokens to measure, the run
// hands them to the renderer unchanged; a scorer without them changes nothing.
describe("K8 probes from the scorer to the renderer (3.4b)", () => {
  const PETOJ: readonly SondoPetoForma[] = [
    { token: "color.text.default", css: "--fm-color-text-default", eco: "color" },
    { token: "font.family.body", css: "--fm-font-family-body", eco: "font-family" },
    { token: "spacing.m", css: "--fm-spacing-m", eco: "spacing" },
  ];

  /** The renderer double that also keeps the options of every render. */
  class OpciaBildigilo extends BildigiloDouble {
    readonly opcioj: Record<string, unknown>[] = [];

    override async render(
      dokumento: EkranaDokumento,
      opcioj: {
        aspektoj: readonly string[];
        varianto: Varianto;
        sondoPetoj?: readonly SondoPetoForma[];
      },
    ): Promise<BildigoRezulto> {
      this.opcioj.push({ ...opcioj });
      return super.render(dokumento, opcioj);
    }
  }

  /** The scorer double with probes. */
  class SondaTaksilo extends TaksiloDouble {
    readonly sondoPetoj = PETOJ;
  }

  it("hands the scorer's sondoPetoj to every render", async () => {
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    const bildigilo = new OpciaBildigilo();
    await kuruEkranojn(
      enigoDe(),
      depsDe({ chat, bildigilo, taksilo: new SondaTaksilo(() => MALVERDA) }),
    );
    expect(bildigilo.opcioj).toHaveLength(bildigilo.dokumentoj.length);
    expect(bildigilo.opcioj.length).toBeGreaterThan(0);
    for (const opcioj of bildigilo.opcioj) expect(opcioj.sondoPetoj).toBe(PETOJ);
  });

  it("gives the renderer the options of before, and the same result, without sondoPetoj", async () => {
    // A test clock (D-223): each run's clock ticks by its own step on every read, so every
    // measured `ms` differs between the two runs, as the wall time of two real runs may.
    const kuri = async (taksilo: TaksiloDouble, pasxo: number) => {
      let horo = Date.UTC(2026, 9, 31, 12);
      const horlogo = vi.spyOn(Date, "now").mockImplementation(() => (horo += pasxo));
      try {
        const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
        const bildigilo = new OpciaBildigilo();
        const rezulto = await kuruEkranojn(enigoDe(), depsDe({ chat, bildigilo, taksilo }));
        return { rezulto, bildigilo };
      } finally {
        horlogo.mockRestore();
      }
    };
    const sen = await kuri(new TaksiloDouble(() => MALVERDA), 1);
    for (const opcioj of sen.bildigilo.opcioj) {
      expect(opcioj).toStrictEqual({ aspektoj: ["komuna"], varianto: "F" });
    }
    const kun = await kuri(new SondaTaksilo(() => MALVERDA), 7);
    // The probes reach only the renderer; the double renders no K8, so the run is the same
    // (but for the wall time of the run, which no double fixes).
    const senTempo = (rezulto: typeof sen.rezulto) =>
      JSON.stringify({ ...rezulto, peno: { ...rezulto.peno, ms: 0 } });
    expect(senTempo(kun.rezulto)).toBe(senTempo(sen.rezulto));
  });
});

// K8 findings (Spec 038 Lauf 3, 3.4a, C-4, D-16): a feature below 1 that the Modelo has a means
// for is a finding with rule, place and reason (to the next round and `restantaj`); one without a
// means is a deviation „mangels Mittel“ that never blocks.
describe("K8 findings and deviations „mangels Mittel“ (3.4a, C-4)", () => {
  const PFADO = "main > fm-karto > p";
  const tekstoDe = (merkmal: K8Merkmal, scheme: string) =>
    `2 von 4 Treffern für ${merkmal} in ${scheme} verfehlt, zuerst \`${PFADO}\``;

  /** K8 over light and dark of `komuna`: `merkmal` at 0.5, every other feature 1. */
  const k8Kun = (e: {
    merkmal: K8Merkmal;
    plena: boolean;
    mankoj?: K8Merkmal[];
  }): TaksadoK8Rezulto => ({
    kvoto: 0.875,
    kombinacioj: (["dark", "light"] as const).map((scheme) => ({
      aspekto: "komuna",
      scheme,
      merkmaloj: Object.fromEntries(
        K8_MERKMALOJ.map((m) => [m, m === e.merkmal ? 0.5 : 1]),
      ) as Record<K8Merkmal, number>,
      kvoto: 0.875,
      kialoj: K8_MERKMALOJ.map((m) => ({
        merkmal: m,
        teksto: m === e.merkmal ? tekstoDe(m, scheme) : "vollständig",
      })),
    })),
    mankoj: e.mankoj ?? [],
    plena: e.plena,
  });

  const kunK8 = (k8: TaksadoK8Rezulto): Taksado => ({ ...VERDA, k8 });

  it("names the rule of every feature", () => {
    expect(K8_REGULOJ).toEqual({
      ersatzschrift: "k8-ersatzschrift",
      nativaj: "k8-nativa",
      interspacoj: "k8-interspaco",
      sxablono: "k8-sxablono",
    });
  });

  it("gives one finding per combination and feature below 1, with rule, place and reason from the kialo", () => {
    for (const merkmal of K8_MERKMALOJ) {
      const k8 = k8Kun({ merkmal, plena: false });
      const trovoj = trovojDe({
        slug: "liste",
        taksado: kunK8(k8),
        malobservoj: [],
        fakto: faktoKunLigiloj(["detail.html"]),
        navigado: { kompleta: true, mankantaj: [], mortaj: [] },
        malhelpoj: ["K8"],
      });
      const k8Trovoj = trovoj.filter((t) => t.regulo.startsWith("k8-"));
      expect(k8Trovoj.length, merkmal).toBe(k8.kombinacioj.length);
      expect(
        k8Trovoj.map(({ regulo, loko, kialo }) => ({ regulo, loko, kialo })),
        merkmal,
      ).toEqual(
        k8.kombinacioj.map((k) => ({
          regulo: K8_REGULOJ[merkmal],
          loko: `komuna ${k.scheme}: ${PFADO}`,
          kialo: tekstoDe(merkmal, k.scheme),
        })),
      );
      for (const trovo of k8Trovoj) {
        expect(trovo.mesagxo, merkmal).not.toBe("");
        expect(trovo.sugesto, merkmal).not.toBe("");
      }
    }
  });

  it("brings every K8 finding to the next round and into restantaj; the screen is not green", async () => {
    for (const merkmal of K8_MERKMALOJ) {
      const k8 = k8Kun({ merkmal, plena: false });
      const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
      const rezulto = await kuruEkranojn(
        enigoDe(),
        depsDe({ chat, taksilo: new TaksiloDouble(() => kunK8(k8)) }),
      );
      expect(rezulto.faritajRondoj, merkmal).toBe(MAKS_RONDOJ);
      expect(rezulto.rondoj[0]?.liste?.verda, merkmal).toBe(false);
      expect(rezulto.rondoj[0]?.liste?.malhelpoj, merkmal).toEqual(["K8"]);
      const dua = chat.petoj.find(
        (peto) => slugDePeto(peto) === "liste" && rondoDePeto(peto) === 2,
      );
      const tasko = dua?.messages.find((m) => m.role === "user")?.content ?? "";
      expect(tasko, merkmal).toContain(K8_REGULOJ[merkmal]);
      expect(rezulto.restantaj, merkmal).toEqual(
        PLANO.ekranoj.flatMap(({ slug }) =>
          k8.kombinacioj.map((k) => ({
            ekrano: slug,
            regulo: K8_REGULOJ[merkmal],
            loko: `komuna ${k.scheme}: ${PFADO}`,
            kialo: tekstoDe(merkmal, k.scheme),
          })),
        ),
      );
      expect(rezulto.senRimedaj, merkmal).toBeUndefined();
    }
  });

  it("lists a feature below 1 without a means as a deviation „mangels Mittel“ that blocks nothing", async () => {
    const k8 = k8Kun({ merkmal: "interspacoj", plena: true, mankoj: ["interspacoj"] });
    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    const rezulto = await kuruEkranojn(
      enigoDe(),
      depsDe({ chat, taksilo: new TaksiloDouble(() => kunK8(k8)) }),
    );
    expect(rezulto.faritajRondoj).toBe(1);
    expect(rezulto.rondoj[0]?.liste?.verda).toBe(true);
    expect(rezulto.rondoj[0]?.liste?.malhelpoj).toEqual([]);
    expect(rezulto.restantaj).toEqual([]);
    expect(rezulto.senRimedaj).toEqual(
      PLANO.ekranoj.flatMap(({ slug }) =>
        k8.kombinacioj.map((k) => ({
          ekrano: slug,
          regulo: K8_REGULOJ.interspacoj,
          loko: `komuna ${k.scheme}: ${PFADO}`,
          kialo: tekstoDe("interspacoj", k.scheme),
        })),
      ),
    );
  });

  it("makes no K8 finding of a feature without a means, and none at all without k8", async () => {
    const k8 = k8Kun({ merkmal: "interspacoj", plena: true, mankoj: ["interspacoj"] });
    const trovoj = trovojDe({
      slug: "liste",
      taksado: { ...MALVERDA, k8 },
      malobservoj: [],
      fakto: faktoKunLigiloj(["detail.html"]),
      navigado: { kompleta: true, mankantaj: [], mortaj: [] },
      malhelpoj: ["K5"],
    });
    expect(trovoj.filter((t) => t.regulo.startsWith("k8-"))).toEqual([]);

    const chat = new SkriptaModelo(skripto(PLANO), { modelo: PERMESITA_MODELO });
    const rezulto = await kuruEkranojn(enigoDe(), depsDe({ chat }));
    const cxiujTrovoj = rezulto.rondoj.flatMap((rondo) =>
      Object.values(rondo).flatMap((ekrano) => ekrano.trovoj ?? []),
    );
    expect(cxiujTrovoj.length).toBeGreaterThan(0);
    expect(cxiujTrovoj.filter((t) => t.regulo.startsWith("k8-"))).toEqual([]);
    expect(rezulto.restantaj.filter((r) => r.regulo.startsWith("k8-"))).toEqual([]);
    expect("senRimedaj" in rezulto).toBe(false);
  });
});

describe("the shell in the system text, the context per screen and round (S038-20, AC-7, C-6)", () => {
  const PROFILO_SXELO = '{"sxablono":"sxelo","regions":[{"name":"nav","marker":"slot=nav"}]}';
  const PROFILO_PAGXO = '{"sxablono":"pagxo","regions":[{"name":"title"}]}';
  const ARANGXOJ = '{"sxablonoj":["sxelo","pagxo"],"interspacoj":["space.m"]}';
  const GVIDANTO = "GVIDANTO-PROMPT: Frag zuerst describe.";
  /** What the agent's own get_ero answers, many characters: re-sending it would show. */
  const longa = "x".repeat(4_000);

  /** A Gvidanto double that answers the shell's tools and fails where it is told to. */
  class SxelaPonto extends MemoraPonto {
    readonly #malsukcesaj: ReadonlySet<string>;

    constructor(iloj: string[] = CXIUJ_ILOJ, malsukcesaj: readonly string[] = []) {
      super({ iloj });
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
        return args.name === "sxelo" ? PROFILO_SXELO : PROFILO_PAGXO;
      }
      if (name === "list_arangxoj") {
        this.vokoj.push({ name, args });
        return ARANGXOJ;
      }
      if (name === "describe") {
        this.vokoj.push({ name, args });
        return longa;
      }
      return super.call(name, args);
    }
  }

  /** The characters of a request, as the double counts them. */
  const signoj = (peto: Peto | undefined): number =>
    (peto?.messages ?? []).reduce((sumo, m) => sumo + m.content.length, 0);

  /**
   * Plan requests get the plan; a build conversation asks describe once (one agent tool call),
   * then answers with the fragment. Input tokens = characters of the request, so text that
   * ekranoj puts into a request counts as input.
   */
  function ilaSkripto(plano: Plano) {
    return (peto: Peto) => {
      const slug = slugDePeto(peto);
      const enigo = { input: signoj(peto), output: 7 };
      if (slug === undefined) {
        return respondo(`\`\`\`json\n${JSON.stringify(plano)}\n\`\`\``, enigo);
      }
      if (!peto.messages.some((m) => m.role === "tool")) {
        return ilaRespondo([{ name: "describe" }], enigo);
      }
      return respondo(`\`\`\`html\n${fragmentoDe(plano, slug, rondoDePeto(peto))}\n\`\`\``, enigo);
    };
  }

  const konversacioj = (chat: SkriptaModelo) => {
    const mapo = new Map<string, Peto[]>();
    for (const peto of chat.petoj) {
      const slug = slugDePeto(peto);
      if (slug === undefined) continue;
      const sxlosilo = `${slug}#${rondoDePeto(peto)}`;
      mapo.set(sxlosilo, [...(mapo.get(sxlosilo) ?? []), peto]);
    }
    return mapo;
  };

  const kuri = async (
    e: { tools?: MemoraPonto; taksilo?: TaksiloDouble; linioj?: string[] } = {},
  ) => {
    const chat = new SkriptaModelo(ilaSkripto(PLANO), { modelo: PERMESITA_MODELO });
    const tools = e.tools ?? new SxelaPonto();
    const rezulto = await kuruEkranojn(
      enigoDe({ plano: null }),
      depsDe({
        chat,
        tools,
        ...(e.taksilo === undefined ? {} : { taksilo: e.taksilo }),
        ...(e.linioj === undefined ? {} : { linioj: e.linioj }),
      }),
    );
    return { chat, tools, rezulto };
  };

  it("keeps 5 screens and 3 rounds", () => {
    expect(MAKS_EKRANOJ).toBe(5);
    expect(MAKS_RONDOJ).toBe(3);
  });

  it("starts every build conversation fresh: one system message, one user message, no tool answer of an earlier call", async () => {
    const { chat } = await kuri();
    const mapo = konversacioj(chat);
    expect([...mapo.keys()]).toEqual([
      "liste#1",
      "detail#1",
      "liste#2",
      "detail#2",
      "liste#3",
      "detail#3",
    ]);
    for (const [sxlosilo, petoj] of mapo) {
      const [unua, ...pliaj] = petoj;
      expect(
        unua?.messages.map((m) => m.role),
        sxlosilo,
      ).toEqual(["system", "user"]);
      for (const peto of petoj) {
        expect(
          peto.messages.filter((m) => m.role === "system"),
          sxlosilo,
        ).toHaveLength(1);
        expect(
          peto.messages.filter((m) => m.role === "user"),
          sxlosilo,
        ).toHaveLength(1);
        // Only the tool answers of this call: as many as this call asked for.
        const demanditaj = peto.messages.flatMap((m) => m.tool_calls ?? []).length;
        expect(
          peto.messages.filter((m) => m.role === "tool"),
          sxlosilo,
        ).toHaveLength(demanditaj);
      }
      for (const peto of pliaj) expect(peto.messages.slice(0, 2)).toEqual(unua?.messages);
    }
  });

  it("states the shell, the layout means and the navigation rule once per run in the system text", async () => {
    const { chat, tools } = await kuri();
    const sistemoj = new Set(
      chat.petoj
        .filter((peto) => slugDePeto(peto) !== undefined)
        .map((peto) => peto.messages[0]?.content ?? ""),
    );
    expect(sistemoj.size).toBe(1);
    const [sistemo = ""] = sistemoj;
    expect(sistemo.startsWith(`${SISTEMO_F}\n\n${GVIDANTO}\n\n`)).toBe(true);
    for (const ero of [PROFILO_SXELO, PROFILO_PAGXO, ARANGXOJ, NAVIGADA_REGULO]) {
      expect(sistemo).toContain(ero);
    }
    // The rule names exactly the built screens of the run, in plan order (S038-24 F-2).
    expect(sistemo).toContain(navigadaReguloDe(PLANO.ekranoj.map((ekrano) => ekrano.slug)));
    // Read once per run by ekranoj, not by the agent.
    expect(tools.vokoj.filter((voko) => voko.name === "get_sxablono").map((v) => v.args)).toEqual([
      { name: "sxelo", brief: true, marker: true },
      { name: "pagxo", brief: true, marker: true },
    ]);
    expect(tools.vokoj.filter((voko) => voko.name === "list_arangxoj")).toHaveLength(1);
  });

  it("asks round 2 with plan excerpt, the Kurzprofile of the last fragment's Eroj, that fragment, its findings and the task", async () => {
    const { chat, rezulto, tools } = await kuri();
    const mapo = konversacioj(chat);
    const dua = mapo.get("liste#2")?.[0];
    const tasko = dua?.messages[1]?.content ?? "";
    const antaua = rezulto.rondoj[0]?.liste;
    const fragmento = antaua?.fragmento ?? "-";
    const trovoj = JSON.stringify(antaua?.trovoj ?? [], null, 2);
    // The Kurzprofile of the Eroj of the last fragment (fm-karto, fm-butono), sorted: brief and
    // slots as the answer gives them (S038-24 F-1).
    const profiloj = ["butono", "karto"].map((nomo) =>
      JSON.stringify(kampojDeTabelo(nomo, KURZPROFILAJ_KAMPOJ)),
    );
    expect(
      tools.vokoj
        .filter((voko) => voko.name === "get_ero" && String(voko.args.fields) === "brief,slots")
        .map((voko) => voko.args.name),
    ).toEqual(["butono", "karto"]);
    expect(tasko).toContain(
      "Kurzprofile der Eroj deines Stands (get_ero, brief und slots – nur diese Inhalte je Slot sind erlaubt):",
    );
    for (const ero of [
      "Screens des Ablaufs:",
      "- liste.html – Titel liste: Zweck von liste",
      "Laut Plan verweist dieser Screen auf: detail.html.",
      ...profiloj,
      fragmento,
      trovoj,
      "Baue jetzt den Screen „Titel liste“ (liste.html)",
    ]) {
      expect(tasko, ero).toContain(ero);
    }
    // Round 1 has only the shell profiles from the system text.
    const unua = mapo.get("liste#1")?.[0]?.messages[1]?.content ?? "";
    for (const profilo of profiloj) expect(unua).not.toContain(profilo);
    // Nothing of round 1's conversation is sent again: round 2's request is at most round 1's
    // request plus the last fragment and its findings (characters of the double) – the tool
    // answer of round 1 (4 000 characters) is not in it.
    const unuaVoko = mapo.get("liste#1") ?? [];
    expect(dua?.messages.some((m) => m.content.includes(longa))).toBe(false);
    expect(signoj(dua)).toBeLessThanOrEqual(
      signoj(unuaVoko.at(-1)) + fragmento.length + trovoj.length,
    );
    // Beyond round 1's first request it carries only fragment, findings, Kurzprofile and their
    // headings – less than one tool answer of round 1.
    const profilaj = profiloj.reduce((s, p) => s + p.length, 0);
    expect(
      signoj(dua) - signoj(unuaVoko[0]) - fragmento.length - trovoj.length - profilaj,
    ).toBeLessThan(longa.length);
  });

  it("keeps the requests of Spec 037 byte for byte without check_markup or list_arangxoj", async () => {
    for (const iloj of [
      MALNOVAJ_ILOJ,
      CXIUJ_ILOJ.filter((nomo) => nomo !== "list_arangxoj"),
      CXIUJ_ILOJ.filter((nomo) => nomo !== "check_markup"),
    ]) {
      const tools = new SxelaPonto(iloj);
      const { chat, rezulto } = await kuri({ tools });
      const mapo = konversacioj(chat);
      for (const [sxlosilo, petoj] of mapo) {
        expect(petoj[0]?.messages[0], sxlosilo).toEqual({
          role: "system",
          content: `${SISTEMO_F}\n\n${GVIDANTO}`,
        });
      }
      const plano = rezulto.plano;
      const tasko = (slug: string, rondo: number): string => {
        const ekrano = plano.ekranoj.find((e) => e.slug === slug);
        const celoj = plano.kantoj.filter((k) => k.de === slug).map((k) => `${k.al}.html`);
        const linioj = [
          `Ablauf: ${plano.celo}`,
          `Satz des Auftrags: ${enigoDe().frazo}`,
          "Screens des Ablaufs:",
          ...plano.ekranoj.map((e) => `- ${e.slug}.html – ${e.titolo}: ${e.celo}`),
          "",
          `Baue jetzt den Screen „${ekrano?.titolo}“ (${slug}.html): ${ekrano?.celo}`,
          celoj.length === 0
            ? "Laut Plan verweist dieser Screen auf keinen anderen Screen."
            : `Laut Plan verweist dieser Screen auf: ${celoj.join(", ")}.`,
          "Sprache der Texte: Deutsch.",
        ];
        if (rondo > 1) {
          const antaua = rezulto.rondoj[rondo - 2]?.[slug];
          linioj.push(
            "",
            `Runde ${rondo}: Dein Stand aus Runde ${rondo - 1}:`,
            "```html",
            antaua?.fragmento ?? "",
            "```",
            "Befunde der Prüfung (JSON: regulo, loko, mesagxo, sugesto, kialo):",
            "```json",
            JSON.stringify(antaua?.trovoj ?? [], null, 2),
            "```",
            "Verbessere den Stand so, dass die Befunde verschwinden, und sende den ganzen Stand neu.",
          );
        }
        return linioj.join("\n");
      };
      for (const [sxlosilo, petoj] of mapo) {
        const [slug = "", rondo = "1"] = sxlosilo.split("#");
        expect(petoj[0]?.messages[1], sxlosilo).toEqual({
          role: "user",
          content: tasko(slug, Number(rondo)),
        });
      }
      // No shell read and no Kurzprofil read by ekranoj on this path.
      const nomoj = tools.vokoj.map((voko) => voko.name);
      expect(nomoj).not.toContain("get_sxablono");
      expect(nomoj).not.toContain("list_arangxoj");
      expect(
        tools.vokoj.filter(
          (voko) => voko.name === "get_ero" && String(voko.args.fields) === "brief",
        ),
      ).toEqual([]);
    }
  });

  it("keeps the effort of every build per screen and round: their sum and the plan request give the run's effort", async () => {
    for (const taksilo of [
      neniamVerda(),
      verdaEkde(2),
      new TaksiloDouble((slug) => (slug === "liste" ? VERDA : MALVERDA)),
    ]) {
      const { chat, rezulto } = await kuri({ taksilo });
      const planaj = chat.petoj.filter((peto) => slugDePeto(peto) === undefined);
      expect(planaj).toHaveLength(1);
      const plano: Peno = {
        inputTokens: planaj.reduce((sumo, peto) => sumo + signoj(peto), 0),
        outputTokens: 7 * planaj.length,
        toolCalls: 0,
        requests: planaj.length,
        ms: 0,
        bytes: 0,
      };
      const mapo = konversacioj(chat);
      const sumo = { ...plano };
      for (const [index, rondo] of rezulto.rondoj.entries()) {
        for (const [slug, stato] of Object.entries(rondo)) {
          const petoj = mapo.get(`${slug}#${index + 1}`);
          if (petoj === undefined) {
            // Carried forward (D-26): no effort of its own.
            expect(stato.peno, `${slug}#${index + 1}`).toBeUndefined();
            continue;
          }
          // The build's own requests: their characters (pre-fetched Kurzprofile included) as input.
          expect(stato.peno, `${slug}#${index + 1}`).toMatchObject({
            inputTokens: petoj.reduce((s, peto) => s + signoj(peto), 0),
            outputTokens: 7 * petoj.length,
            requests: petoj.length,
            toolCalls: petoj.length - 1,
          });
          sumo.inputTokens += stato.peno?.inputTokens ?? Number.NaN;
          sumo.outputTokens += stato.peno?.outputTokens ?? Number.NaN;
          sumo.requests += stato.peno?.requests ?? Number.NaN;
          sumo.toolCalls += stato.peno?.toolCalls ?? Number.NaN;
        }
      }
      for (const kampo of ["inputTokens", "outputTokens", "requests", "toolCalls"] as const) {
        expect(sumo[kampo], kampo).toBe(rezulto.peno[kampo]);
      }
      // The pre-fetch calls are no tool calls of the agent: one describe per conversation.
      expect(rezulto.peno.toolCalls).toBe(mapo.size);
    }
  });

  it("skips a failing pre-fetch with a log line and never stops the run", async () => {
    const linioj: string[] = [];
    const tools = new SxelaPonto(CXIUJ_ILOJ, ["get_sxablono pagxo", "get_ero karto"]);
    const { chat, rezulto } = await kuri({ tools, linioj });
    expect(rezulto.haltigo).toBeUndefined();
    expect(rezulto.faritajRondoj).toBe(MAKS_RONDOJ);
    const sistemo = chat.petoj.find((peto) => slugDePeto(peto) !== undefined)?.messages[0]?.content;
    expect(sistemo).toContain(PROFILO_SXELO);
    expect(sistemo).not.toContain(PROFILO_PAGXO);
    const dua = konversacioj(chat).get("liste#2")?.[0]?.messages[1]?.content ?? "";
    expect(dua).toContain(JSON.stringify(kampojDeTabelo("butono", KURZPROFILAJ_KAMPOJ)));
    expect(dua).not.toContain(JSON.stringify(kampojDeTabelo("karto", KURZPROFILAJ_KAMPOJ)));
    expect(
      linioj.filter((linio) => linio.includes("pagxo") && linio.includes("nicht erreichbar")),
    ).toHaveLength(1);
    expect(
      linioj.filter((linio) => linio.includes("karto") && linio.includes("nicht erreichbar")),
    ).toHaveLength(1);
  });
});
