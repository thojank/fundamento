// The measurement „ganzer Ablauf“ against the integrated result (Spec 037, S037-13): the **real**
// `kuruEkranojn` of @fundamento/ekranoj (not the double of kuro.test.ts) with a scripted chat
// model, the Gvidanto in the process (`connectGvidanto`, the real MCP server), the real scorer
// (`ekranoTaksilo` through `taksiloPorMezuro`) and a renderer double that replays the stored facts
// of the fixture flow liste-filter-detail. No network, no browser, no provider.
// - AC-11 end to end: two runs give the same records and the same report, equal to the committed
//   expected JSON.
// - Consistency (C-8, D-05): the same facts give the same K1–K5 through the path of `fm ekranoj`
//   (the adapter without criteria: K6 null) and the path of the measurement (with criteria), and the
//   same navigation through ekranoj's loop (`navigado` + `ligilajAtributojDe` over the Gvidanto) and
//   the measurement (`faktojPorNavigado` + `navigado`).
// - The catalogue counts in a run are derived from the catalogue; only „5 Aufgaben, 3–5 Screens“
//   is fixed by the spec.

import { existsSync, mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  type Bildigilo,
  type BildigoRezulto,
  type ChatMessage,
  type ChatModel,
  type ChatRespondo,
  type EkranaDokumento,
  type EkranojRezulto,
  type Fakto,
  fluaNavigado,
  type KuruEkranojn,
  kuruEkranojn,
  ligilajAtributojDe,
  MAKS_EKRANOJ,
  MAKS_RONDOJ,
  navigado,
  PERMESITA_MODELO,
  skemoLegiloDe,
  TOKENOJ_EKRANO_RONDO_0,
  TOKENOJ_EKRANO_RONDO_F,
  type Varianto,
} from "@fundamento/ekranoj";
import { defaultModeloSource, loadModelo, type Modelo, readNordstelo } from "@fundamento/modelo";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ekranoTaksilo } from "../ekrano-taksilo.js";
import { connectGvidanto, type Gvidanto } from "../gvidanto.js";
import {
  ABLAUF_EKRANOJ_MIN,
  ABLAUF_TASKOJ,
  ABLAUF_TASKOJ_NOMBRO,
  type AblaufTasko,
  planoDe,
  trovuTaskon,
} from "./katalogo.js";
import { type AblaufDeps, type AblaufRezulto, kuriAblaufon } from "./kuro.js";
import { faktojPorNavigado, legiKatalogon } from "./poentoj.js";
import { kuroDir, LAUF_DOSIERO, stabilaJson, taksiloPorMezuro } from "./raporto.js";
import { ASPEKTOJ_DUOBLAJ, faktojElDosierujo } from "./test-doubles/ekranoj.js";

const geladen = loadModelo(defaultModeloSource()).modelo;
if (geladen === undefined) throw new Error("the repository Modelo must load");
const modelo: Modelo = geladen;
const katalogo = legiKatalogon();

const fixtures = fileURLToPath(new URL("../../test/fixtures/ablauf/", import.meta.url));
const LFD = "liste-filter-detail";
/** The expected report data of the run below (a file: every folder here is a stored flow). */
const EXPECTED = `${fixtures}integra-raporto.json`;
const lfd: AblaufTasko = (() => {
  const tasko = trovuTaskon(LFD);
  if (tasko === undefined) throw new Error(`no flow ${LFD}`);
  return tasko;
})();

/** Stored facts of the fixture flow per variant: round number → slug → facts. */
const STOKITAJ: Record<Varianto, Record<string, Record<string, Fakto>>> = {
  F: faktojElDosierujo(`${fixtures}${LFD}/F/`),
  "0": faktojElDosierujo(`${fixtures}${LFD}/0/`),
};

/** The stored facts a render of round `rondo` replays: that round, else the last one before it. */
function stokitaFakto(varianto: Varianto, slug: string, rondo: number): Fakto | undefined {
  for (let n = rondo; n >= 1; n -= 1) {
    const fakto = STOKITAJ[varianto][String(n)]?.[slug];
    if (fakto !== undefined) return fakto;
  }
  return undefined;
}

/** A scripted agent: each build answers with a fragment naming its screen and round. */
class Agento implements ChatModel {
  readonly modelo = PERMESITA_MODELO;
  petoj = 0;

  async send(messages: readonly ChatMessage[]): Promise<ChatRespondo> {
    this.petoj += 1;
    const tasko = messages.find((m) => m.role === "user")?.content ?? "";
    const slug = /Baue jetzt den Screen „[^“]*“ \(([a-z0-9-]+)\.html\)/.exec(tasko)?.[1] ?? "x";
    const rondo = /^Runde (\d+):/m.exec(tasko)?.[1] ?? "1";
    return {
      message: {
        role: "assistant",
        content: `\`\`\`html\n<main data-ekrano="${slug}" data-rondo="${rondo}"></main>\n\`\`\``,
      },
      input: 400,
      output: 100,
      requests: 1,
    };
  }
}

/** A renderer that replays the stored facts of the screen for the round it renders. */
class Ripetilo implements Bildigilo {
  readonly #rondoj = new Map<string, number>();
  readonly #varianto: Varianto;

  constructor(varianto: Varianto) {
    this.#varianto = varianto;
  }

  async render(dokumento: EkranaDokumento): Promise<BildigoRezulto> {
    const rondo = (this.#rondoj.get(dokumento.slug) ?? 0) + 1;
    this.#rondoj.set(dokumento.slug, rondo);
    const fakto = stokitaFakto(this.#varianto, dokumento.slug, rondo);
    if (fakto === undefined) throw new Error(`no stored facts for ${dokumento.slug} ${rondo}`);
    return { fakto, bildoj: { hela: new Uint8Array(), malhela: new Uint8Array() } };
  }

  async close(): Promise<void> {}
}

let gvidanto: Gvidanto;
beforeAll(async () => {
  gvidanto = await connectGvidanto();
});
afterAll(async () => {
  await gvidanto.close();
});
beforeEach(() => {
  // The effort of a run carries its duration (K7 ms); a frozen clock makes two runs comparable.
  vi.spyOn(Date, "now").mockReturnValue(Date.UTC(2026, 9, 31, 12, 0));
});
afterEach(() => vi.restoreAllMocks());

interface Kuro {
  rezulto: AblaufRezulto;
  /** What the real kuruEkranojn returned per flow and variant. */
  ekranoj: Map<string, EkranojRezulto>;
  agentoj: Agento[];
}

/** One measurement of the fixture flow, F and 0, through the real kuruEkranojn. */
async function mezuri(kuru: KuruEkranojn = kuruEkranojn): Promise<Kuro> {
  const out = mkdtempSync(join(tmpdir(), "s037-integra-"));
  const ekranoj = new Map<string, EkranojRezulto>();
  const agentoj: Agento[] = [];
  const deps: AblaufDeps = {
    kuruEkranojn: async (enigo, d) => {
      const rezulto = await kuru(enigo, d);
      ekranoj.set(`${enigo.plano?.ekranoj[0]?.slug}/${enigo.varianto}`, rezulto);
      return rezulto;
    },
    kiModelo: PERMESITA_MODELO,
    kuraDeps: ({ varianto }) => {
      const agento = new Agento();
      agentoj.push(agento);
      return {
        chat: agento,
        tools: gvidanto.bridge,
        bildigilo: new Ripetilo(varianto),
        marko: { konstrui: async () => ({ css: [] }) },
        nun: () => new Date(Date.UTC(2026, 9, 31, 12, 0)),
        log: () => undefined,
      };
    },
    taksiloPor: (tasko) => taksiloPorMezuro({ modelo, katalogo, tasko }),
    modelo,
    markoj: ASPEKTOJ_DUOBLAJ,
    sxargo: () => ({ sxargo: { l1: 1, l5: 2, l15: 3 }, kernoj: 10 }),
    nun: () => new Date(Date.UTC(2026, 9, 31, 12, 0)),
    commit: "abc1234",
    log: () => undefined,
  };
  const rezulto = await kuriAblaufon(
    { taskoj: [LFD], varianten: ["F", "0"], maksTokenoj: 1_000_000, out },
    deps,
  );
  return { rezulto, ekranoj, agentoj };
}

/** Every file below a folder with its bytes, by relative path. */
function dosieroj(dir: string): Record<string, string> {
  const listo: Record<string, string> = {};
  const iri = (nuna: string) => {
    for (const nomo of readdirSync(nuna, { withFileTypes: true })) {
      const vojo = join(nuna, nomo.name);
      if (nomo.isDirectory()) iri(vojo);
      else listo[relative(dir, vojo).split("\\").join("/")] = readFileSync(vojo, "utf8");
    }
  };
  iri(dir);
  return listo;
}

describe("the measurement with the real kuruEkranojn (AC-11 end to end)", () => {
  it("gives the same records and the same report twice, equal to the committed expected JSON", async () => {
    const unua = await mezuri();
    const dua = await mezuri();
    // The real flow ran: requests were made, every planned screen was built and scored.
    expect(unua.agentoj.map((agento) => agento.petoj > 0)).toEqual([true, true]);
    expect(unua.ekranoj.size).toBe(2);
    for (const rezulto of unua.ekranoj.values()) {
      expect(Object.keys(rezulto.rondoj[0] ?? {})).toEqual(lfd.ekranoj.map((e) => e.slug));
    }
    expect(dosieroj(dua.rezulto.dir)).toEqual(dosieroj(unua.rezulto.dir));
    expect(dua.rezulto.raporto).toEqual(unua.rezulto.raporto);
    expect(stabilaJson(unua.rezulto.raporto.datumoj)).toBe(readFileSync(EXPECTED, "utf8"));
  });
});

describe("one score and one navigation in both paths (C-8, D-05)", () => {
  /** Every stored round of the fixture flow: variant, round, facts. */
  const rondoj = (["F", "0"] as const).flatMap((varianto) =>
    Object.entries(STOKITAJ[varianto]).map(([rondo, faktoj]) => ({ varianto, rondo, faktoj })),
  );

  it("scores the same facts with the same K1–K5 through fm ekranoj's adapter and the measurement's, K6 only with criteria", () => {
    // fm ekranoj: the Modelo's catalogue as the cli reads it, no criteria (packages/cli, C-8).
    const cliKatalogo = readNordstelo(defaultModeloSource().dataDir);
    if (cliKatalogo === undefined) throw new Error("the Modelo has no nordstelo.json");
    const cli = ekranoTaksilo({ modelo, katalogo: cliKatalogo });
    const mezuro = taksiloPorMezuro({ modelo, katalogo, tasko: lfd });
    const plano = planoDe(lfd);
    const malsamaj: string[] = [];
    let komparitaj = 0;
    for (const { varianto, rondo, faktoj } of rondoj) {
      for (const ekrano of plano.ekranoj) {
        const fakto = faktoj[ekrano.slug];
        if (fakto === undefined) continue;
        const a = cli.taksi({ fakto, ekrano, varianto });
        const b = mezuro.taksi({ fakto, ekrano, varianto });
        komparitaj += 1;
        for (const k of ["K1", "K2", "K3", "K4", "K5"] as const) {
          if (a.k[k] !== b.k[k]) malsamaj.push(`${varianto} R${rondo} ${ekrano.slug} ${k}`);
        }
        if (a.k.K6 !== null)
          malsamaj.push(`${varianto} R${rondo} ${ekrano.slug} K6 ohne Kriterien`);
        if (b.k.K6 === null) malsamaj.push(`${varianto} R${rondo} ${ekrano.slug} K6 mit Kriterien`);
      }
    }
    expect(komparitaj).toBe(rondoj.reduce((sumo, r) => sumo + Object.keys(r.faktoj).length, 0));
    expect(malsamaj).toEqual([]);
  });

  it("computes the same navigation in ekranoj's loop (Skemo over the Gvidanto) and in the measurement (Modelo)", async () => {
    const plano = planoDe(lfd);
    const legi = skemoLegiloDe(gvidanto.bridge);
    // The stored rounds, and a round with a dead link and a missing edge written with the link Ero.
    const F3 = STOKITAJ.F["3"] ?? {};
    const rompita: Record<string, Fakto> = Object.fromEntries(
      Object.entries(F3).map(([slug, fakto]) => [
        slug,
        {
          ...fakto,
          elements: fakto.elements.map((element) =>
            element.tag === "fm-ligilo"
              ? { ...element, attrs: { ...element.attrs, to: "nirgends.html" } }
              : element,
          ),
        },
      ]),
    );
    let ligiloj = 0;
    for (const faktoj of [...rondoj.map((r) => r.faktoj), rompita]) {
      const enCiklo = navigado(plano, faktoj, {
        ligilaAtributoj: await ligilajAtributojDe(faktoj, legi),
      });
      const enMezuro = navigado(plano, faktojPorNavigado(faktoj, modelo));
      expect(enCiklo).toEqual(enMezuro);
      ligiloj += Object.values(faktoj)
        .flatMap((f) => f.elements)
        .filter((e) => e.tag === "fm-ligilo").length;
    }
    // The comparison saw the link Ero, and the broken round is broken in both paths.
    expect(ligiloj).toBeGreaterThan(0);
    const kaputa = navigado(plano, faktojPorNavigado(rompita, modelo));
    expect(kaputa.mortajLigiloj.map((l) => l.href)).toContain("nirgends.html");
  });

  it("reports the navigation of the real loop unchanged in the measurement's report", async () => {
    const { rezulto, ekranoj } = await mezuri();
    const plano = planoDe(lfd);
    const malsamaj: string[] = [];
    for (const kuro of rezulto.raporto.datumoj.kuroj) {
      const ciklo = ekranoj.get(`${plano.ekranoj[0]?.slug}/${kuro.varianto}`);
      expect(ciklo, kuro.varianto).toBeDefined();
      for (const [index, rondo] of (ciklo?.rondoj ?? []).entries()) {
        const n = String(index + 1);
        const enRaporto = kuro.rondoj[n];
        if (enRaporto === undefined) {
          malsamaj.push(`${kuro.varianto} R${n} fehlt im Bericht`);
          continue;
        }
        if (fluaNavigado(plano, rondo).kvoto !== enRaporto.fluo.navigado) {
          malsamaj.push(`${kuro.varianto} R${n} Anteil`);
        }
        for (const ekrano of plano.ekranoj) {
          const a = rondo[ekrano.slug];
          const b = enRaporto.ekranoj[ekrano.slug];
          if (a === undefined || b === undefined) continue;
          if (a.navigado.kompleta !== b.kompleta)
            malsamaj.push(`${kuro.varianto} R${n} ${ekrano.slug} kompleta`);
          for (const k of ["K1", "K2", "K3", "K4", "K5", "K6"] as const) {
            if (a.taksado.k[k] !== b.k?.[k])
              malsamaj.push(`${kuro.varianto} R${n} ${ekrano.slug} ${k}`);
          }
        }
      }
    }
    expect(malsamaj).toEqual([]);
  });
});

describe("catalogue counts come from the catalogue", () => {
  it("plans every run, screen and estimate of a whole measurement from the catalogue (only „5 Aufgaben, 3–5 Screens“ is fixed)", async () => {
    // Fixed by the spec (Lieferliste 2.1, V-2).
    expect(ABLAUF_TASKOJ_NOMBRO).toBe(5);
    expect(ABLAUF_EKRANOJ_MIN).toBe(3);
    expect(MAKS_EKRANOJ).toBe(5);
    expect(ABLAUF_TASKOJ).toHaveLength(ABLAUF_TASKOJ_NOMBRO);
    for (const tasko of ABLAUF_TASKOJ) {
      expect(tasko.ekranoj.length, tasko.slug).toBeGreaterThanOrEqual(ABLAUF_EKRANOJ_MIN);
      expect(tasko.ekranoj.length, tasko.slug).toBeLessThanOrEqual(MAKS_EKRANOJ);
    }
    // Everything else is derived: runs, screens, the estimate of ekranoj per run.
    const ekranoj = ABLAUF_TASKOJ.reduce((sumo, tasko) => sumo + tasko.ekranoj.length, 0);
    const tokenoj = ekranoj * MAKS_RONDOJ * (TOKENOJ_EKRANO_RONDO_F + TOKENOJ_EKRANO_RONDO_0);
    const linioj: string[] = [];
    const planoj: string[][] = [];
    const out = mkdtempSync(join(tmpdir(), "s037-integra-katalogo-"));
    const { kuroj, dir } = await kuriAblaufon(
      { maksTokenoj: 10 * tokenoj, out },
      {
        kuruEkranojn: async (enigo) => {
          planoj.push(enigo.plano?.ekranoj.map((e) => e.slug) ?? []);
          throw new Error("nur gezählt");
        },
        kiModelo: PERMESITA_MODELO,
        kuraDeps: () => ({
          chat: new Agento(),
          marko: { konstrui: async () => ({ css: [] }) },
          nun: () => new Date(Date.UTC(2026, 9, 31, 12, 0)),
          log: () => undefined,
        }),
        taksiloPor: (tasko) => taksiloPorMezuro({ modelo, katalogo, tasko }),
        modelo,
        markoj: ASPEKTOJ_DUOBLAJ,
        sxargo: () => ({ sxargo: { l1: 1, l5: 2, l15: 3 }, kernoj: 10 }),
        nun: () => new Date(Date.UTC(2026, 9, 31, 12, 0)),
        commit: "abc1234",
        log: (linio) => linioj.push(linio),
      },
    );
    expect(kuroj).toHaveLength(2 * ABLAUF_TASKOJ.length);
    expect(planoj).toEqual(
      ABLAUF_TASKOJ.flatMap((tasko) => [0, 1].map(() => tasko.ekranoj.map((e) => e.slug))),
    );
    expect(linioj[0]).toMatch(
      new RegExp(`^Schätzung: ${2 * ABLAUF_TASKOJ.length} Läufe, ${tokenoj} Tokens`),
    );
    const lauf = JSON.parse(readFileSync(join(dir, LAUF_DOSIERO), "utf8")) as {
      taskoj: string[];
      takso: { tokenoj: number };
    };
    expect(lauf.taskoj).toEqual(ABLAUF_TASKOJ.map((tasko) => tasko.slug));
    expect(lauf.takso.tokenoj).toBe(tokenoj);
    expect(existsSync(kuroDir(dir, ABLAUF_TASKOJ[0]?.slug ?? "", "F", 1))).toBe(true);
  });
});
