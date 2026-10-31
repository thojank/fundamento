// The run (S037-03): rounds (AC-8, V-3, D-26), the token limit (AC-9), the estimate before the
// first request (D-20), the user's list (V-2), the plan request (D-38), the tool allowlist and
// Variante 0 (D-34) – on doubles only: no network, no browser, no provider.

import { CostLimitReached, DayLimitReached } from "@fundamento/metiejo";
import { describe, expect, it } from "vitest";
import {
  kuruEkranojn,
  MAKS_RONDOJ,
  MalpermesitaModelo,
  NevalidaEnigo,
  PERMESITA_MODELO,
  PROMPT_0,
} from "./index.js";
import { BildigiloDouble } from "./test-doubles/bildigilo.js";
import {
  type Peto,
  respondo,
  rondoDePeto,
  SkriptaModelo,
  slugDePeto,
} from "./test-doubles/chat.js";
import { planoKun } from "./test-doubles/faktoj.js";
import { MemoraPonto } from "./test-doubles/iloj.js";
import { MALVERDA, neniamVerda, TaksiloDouble, VERDA, verdaEkde } from "./test-doubles/taksilo.js";
import type { EkranojDeps, EkranojEnigo, KostoTakso, Plano } from "./tipoj.js";

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
    expect(rezulto.rondoj[2]?.liste).toEqual({ ...rezulto.rondoj[1]?.liste, verdaEkde: 2 });
    expect(rezulto.rondoj[2]?.detail).toEqual({ ...rezulto.rondoj[1]?.detail, verdaEkde: 2 });
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
    expect(takso).toMatchObject({ ekranoj: 2, rondoj: 3, planPeto: true, tokenoj: 245_000 });
    expect(rezulto.takso).toEqual(takso);
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
