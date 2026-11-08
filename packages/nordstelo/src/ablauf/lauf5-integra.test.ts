// Integration tests of Spec 038 Lauf 5 across ekranoj and nordstelo (S038-37t; AK-2, AK-5, C-1,
// C-2): the measurement „ganzer Ablauf“ through the **real** `kuruEkranojn` with a scripted model
// that mixes 429, 400, network errors and a page of closing tags only. The same run is also made
// the way `fm ekranoj` makes it (ekranoj alone, its `raporto.json`), so one provider error must
// give the same `AnbieterEraro` records in ekranoj's `raporto.json` and nordstelo's `kuro.json`;
// Σ `restantajLauxRegulo` = `restantaj` = the length of ekranoj's `restantaj`; one invented key
// reaches no writer (log lines, `kuro.json`, both `raporto.json`/`raporto.md`, saved answers,
// `vergleich.{json,md}`). Doubles only: no Gvidanto process, no network, no wait, no browser.

import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  type AnbieterEraro,
  type ChatMessage,
  type ChatModel,
  type ChatRespondo,
  type EkranojDeps,
  type EkranojRezulto,
  eligoDe,
  kuruEkranojn,
  LEERA_PAGXO,
  MAKS_RONDOJ,
  malplenaPagxo,
  PERMESITA_MODELO,
  type RaportoJson,
  type ToolInfo,
  type Varianto,
} from "@fundamento/ekranoj";
import type { Budget } from "@fundamento/metiejo";
import { defaultModeloSource, loadModelo, type Modelo } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { type AblaufTasko, planoDe, trovuTaskon } from "./katalogo.js";
import { komparo, komparoMd } from "./komparo.js";
import { type AblaufDeps, kuriAblaufon } from "./kuro.js";
import { type KuroRekordo, kuroDir, stabilaJson } from "./raporto.js";
import { ASPEKTOJ_DUOBLAJ } from "./test-doubles/ekranoj.js";
import { restantajSumo } from "./test-doubles/laufoj.js";
import { konstantaTaksilo } from "./test-doubles/taksilo.js";

const geladen = loadModelo(defaultModeloSource()).modelo;
if (geladen === undefined) throw new Error("the repository Modelo must load");
const modelo: Modelo = geladen;

const LFD = "liste-filter-detail";
const lfd: AblaufTasko = (() => {
  const tasko = trovuTaskon(LFD);
  if (tasko === undefined) throw new Error(`no flow ${LFD}`);
  return tasko;
})();
const PLANO = planoDe(lfd, "de");
const SLUGOJ = PLANO.ekranoj.map((ekrano) => ekrano.slug);
const [UNUA = "", DUA = "", TRIA = ""] = SLUGOJ;

// Invented secrets, built at run time so no source line looks like a key.
const SK = ["sk", "or", "v1", "5a4b3c2d1e0f9687".repeat(4)].join("-");
const BEARER_VALORO = "ef78ab90".repeat(5);
const QUERY_VALORO = "erfundenL5n";
const SEKRETOJ = [SK, BEARER_VALORO, QUERY_VALORO];
const SEKRETA_KORPO = JSON.stringify({
  error: {
    message: `invalid key ${SK}`,
    url: `https://api.example.test/v1/chat/completions?key=${QUERY_VALORO}&x=1`,
    headers: `Authorization: Bearer ${BEARER_VALORO}`,
  },
});
const sekretojEn = (teksto: string) => SEKRETOJ.filter((s) => teksto.includes(s));

/** A provider error as metiejo's `chatCompletion` throws it (message form and `spent`). */
const anbieterEraro = (status: number, korpo: string): Error =>
  Object.assign(new Error(`Anbieter mistral antwortet ${status}: ${korpo}`), {
    spent: { input: 0, output: 0, requests: 1, waits: 0 },
  });
const retaEraro = (): Error =>
  Object.assign(new Error("TypeError: fetch failed"), {
    spent: { input: 0, output: 0, requests: 1, waits: 0 },
  });

/** The stored tail of Lauf 4's empty page: closing tags only. */
const VOSTO = "</fm-teksto>\n</fm-markdovido>\n</section>\n</main>";

const respondo = (content: string): ChatRespondo => ({
  message: { role: "assistant", content },
  input: 400,
  output: 100,
  requests: 1,
});

function pagxo(slug: string, rondo: number): string {
  const ligiloj = PLANO.kantoj
    .filter((kanto) => kanto.de === slug)
    .map((kanto) => `<a href="${kanto.al}.html">Weiter</a>`)
    .join("");
  return `<main data-ekrano="${slug}" data-rondo="${rondo}"><h1>Standard A-12</h1><nav>${ligiloj}</nav></main>`;
}

/**
 * The mix of Variante F: 429 twice (repeats), 400 twice with the key in the provider message
 * (cleaned resend, then the round-1 page kept), a page of closing tags with the key repeated by the
 * model (B-4 finding), and the third screen lost to the network in every round (never built:
 * `nicht-gebaut`). Variante 0 answers every build.
 */
function miksajxo(): Record<string, (ChatRespondo | Error)[]> {
  const reto = () => Array.from({ length: 6 }, retaEraro);
  return {
    [`${UNUA}#1`]: [
      anbieterEraro(429, '{"message":"Rate limit exceeded"}'),
      anbieterEraro(429, '{"message":"Rate limit exceeded"}'),
    ],
    [`${UNUA}#2`]: [respondo(`\`\`\`html\n${VOSTO}\n\`\`\`\nSchlüssel ${SK}`)],
    [`${DUA}#2`]: [anbieterEraro(400, SEKRETA_KORPO), anbieterEraro(400, SEKRETA_KORPO)],
    // An unbuilt screen is asked as new in later rounds (a task without „Runde“): one queue.
    [`${TRIA}#1`]: [...reto(), ...reto(), ...reto()],
  };
}

/** A scripted model: per `<slug>#<round>` the listed answers or errors first, then the page. */
class SkriptaModelo implements ChatModel {
  readonly modelo = PERMESITA_MODELO;
  readonly petoj: ChatMessage[][] = [];
  readonly #restaj: Map<string, (ChatRespondo | Error)[]>;

  constructor(antauaj: Record<string, (ChatRespondo | Error)[]>) {
    this.#restaj = new Map(Object.entries(antauaj).map(([k, eroj]) => [k, [...eroj]]));
  }

  async send(
    messages: readonly ChatMessage[],
    _tools?: readonly ToolInfo[],
    budget?: Budget,
  ): Promise<ChatRespondo> {
    budget?.ensure();
    this.petoj.push(messages.map((m) => ({ ...m })));
    const tasko = messages.find((m) => m.role === "user")?.content ?? "";
    const slug = /Baue jetzt den Screen „[^“]*“ \(([a-z0-9-]+)\.html\)/.exec(tasko)?.[1] ?? "x";
    const rondo = Number(/^Runde (\d+):/m.exec(tasko)?.[1] ?? "1");
    const sekva = this.#restaj.get(`${slug}#${rondo}`)?.shift();
    const rezulto = sekva ?? respondo(`\`\`\`html\n${pagxo(slug, rondo)}\n\`\`\``);
    if (rezulto instanceof Error) throw rezulto;
    budget?.charge(rezulto.input, rezulto.output);
    return rezulto;
  }
}

const NUN = new Date(Date.UTC(2026, 10, 8, 12, 0));
const ILOJ = { list: async () => [], call: async () => "" };

/** The dependencies of one ekranoj run, as the measurement and `fm ekranoj` give them. */
function kuraDepsDe(varianto: Varianto, linioj: string[]): Omit<EkranojDeps, "taksilo"> {
  return {
    chat: new SkriptaModelo(varianto === "F" ? miksajxo() : {}),
    tools: ILOJ,
    marko: { konstrui: async () => ({ css: [] }) },
    nun: () => NUN,
    log: (linio) => linioj.push(linio),
    dormi: async () => undefined,
    eligo: eligoDe(),
  };
}

interface Mezuro {
  dir: string;
  kuroj: KuroRekordo[];
  md: string;
  linioj: string[];
  ekranoj: Map<Varianto, EkranojRezulto>;
}

/** One measurement of the flow, F and 0, through the real kuruEkranojn. */
async function mezuri(out: string): Promise<Mezuro> {
  const linioj: string[] = [];
  const ekranoj = new Map<Varianto, EkranojRezulto>();
  const deps: AblaufDeps = {
    kuruEkranojn: async (enigo, d) => {
      const rezulto = await kuruEkranojn(enigo, d);
      ekranoj.set(enigo.varianto ?? "F", rezulto);
      return rezulto;
    },
    kiModelo: PERMESITA_MODELO,
    kuraDeps: ({ varianto }) => kuraDepsDe(varianto, linioj),
    taksiloPor: () => konstantaTaksilo(50),
    modelo,
    markoj: ASPEKTOJ_DUOBLAJ,
    sxargo: () => ({ sxargo: { l1: 1, l5: 2, l15: 3 }, kernoj: 10 }),
    nun: () => NUN,
    commit: "abc1234",
    log: (linio) => linioj.push(linio),
  };
  const { dir, kuroj, raporto } = await kuriAblaufon(
    { taskoj: [LFD], maksTokenoj: 10_000_000, out },
    deps,
  );
  return { dir, kuroj, md: raporto.md, linioj, ekranoj };
}

/** The same run of Variante F the way `fm ekranoj` makes it: ekranoj alone, its own folder. */
async function fmEkranoj(out: string): Promise<{ rezulto: EkranojRezulto; linioj: string[] }> {
  const linioj: string[] = [];
  const rezulto = await kuruEkranojn(
    {
      frazo: lfd.celo.de,
      marko: "komuna",
      out,
      maksTokenoj: 10_000_000,
      plano: PLANO,
      varianto: "F",
      lingvo: "de",
    },
    { ...kuraDepsDe("F", linioj), taksilo: konstantaTaksilo(50) },
  );
  return { rezulto, linioj };
}

const legiJson = <T>(dosiero: string): T => JSON.parse(readFileSync(dosiero, "utf8")) as T;

function dosieroj(dir: string, prefikso = ""): Record<string, string> {
  const listo: Record<string, string> = {};
  for (const nomo of readdirSync(dir).sort()) {
    const vojo = join(dir, nomo);
    if (statSync(vojo).isDirectory()) Object.assign(listo, dosieroj(vojo, `${prefikso}${nomo}/`));
    else listo[`${prefikso}${nomo}`] = readFileSync(vojo, "utf8");
  }
  return listo;
}

describe("Lauf 5 across ekranoj and nordstelo: the measurement with the real kuruEkranojn (AK-2)", () => {
  it("gives every screen of every round a page or a reported entry, and ends after round 3 – never by a provider error", async () => {
    const { kuroj, ekranoj } = await mezuri(mkdtempSync(join(tmpdir(), "s038-37t-ablauf-")));
    const malobservoj: string[] = [];
    for (const kuro of kuroj) {
      if (kuro.haltigo !== undefined) malobservoj.push(`${kuro.varianto}: haltigo ${kuro.haltigo}`);
      if (kuro.faritajRondoj !== MAKS_RONDOJ)
        malobservoj.push(`${kuro.varianto}: ${kuro.faritajRondoj} Runden`);
      const rezulto = ekranoj.get(kuro.varianto);
      for (let r = 1; r <= kuro.faritajRondoj; r += 1) {
        for (const slug of SLUGOJ) {
          const stato = rezulto?.rondoj[r - 1]?.[slug];
          const fragmento = stato?.fragmento ?? "";
          if (fragmento.trim() !== "" && !malplenaPagxo(fragmento)) continue;
          const anbieter = (kuro.anbieterfehleroj ?? []).some(
            (e) =>
              e.ekrano === slug && e.rondo === r && (e.ago === "rezigno" || e.ago === "portita"),
          );
          const malplena = (rezulto?.malplenajPagxoj ?? []).some(
            (m) => m.ekrano === slug && m.rondo === r && m.restis,
          );
          const trovo = (stato?.trovoj ?? []).some((t) => t.regulo === LEERA_PAGXO);
          if (!anbieter && !(malplena && trovo)) malobservoj.push(`${kuro.varianto} R${r} ${slug}`);
        }
      }
    }
    expect(malobservoj).toEqual([]);
    // The mix happened: every action of C-1 but the fresh conversation that succeeds.
    const f = kuroj.find((kuro) => kuro.varianto === "F");
    expect([
      ...new Set((f?.anbieterfehleroj ?? []).map((e) => `${e.ekrano}#${e.rondo} ${e.ago}`)),
    ]).toEqual([
      `${UNUA}#1 ripeto`,
      `${TRIA}#1 ripeto`,
      `${TRIA}#1 nova-konversacio`,
      `${TRIA}#1 rezigno`,
      `${DUA}#2 purigo`,
      `${DUA}#2 portita`,
      `${TRIA}#2 ripeto`,
      `${TRIA}#2 nova-konversacio`,
      `${TRIA}#2 rezigno`,
      `${TRIA}#3 ripeto`,
      `${TRIA}#3 nova-konversacio`,
      `${TRIA}#3 rezigno`,
    ]);
    expect(
      ekranoj.get("F")?.malplenajPagxoj?.map((m) => `${m.ekrano}#${m.rondo} ${m.ago}`),
    ).toEqual([`${UNUA}#2 trovo`]);
    expect("anbieterfehleroj" in (kuroj.find((kuro) => kuro.varianto === "0") ?? {})).toBe(false);
  });

  it("writes the same AnbieterEraro records to ekranoj's raporto.json (fm ekranoj and the run folder) and nordstelo's kuro.json (C-1)", async () => {
    const { dir } = await mezuri(mkdtempSync(join(tmpdir(), "s038-37t-ablauf-")));
    const kuroF = join(kuroDir(dir, LFD, "F", 1));
    const kuro = legiJson<KuroRekordo>(join(kuroF, "kuro.json"));
    const raportoSamaKuro = legiJson<RaportoJson>(join(kuroF, "raporto.json"));
    const fmOut = mkdtempSync(join(tmpdir(), "s038-37t-fm-"));
    const fm = await fmEkranoj(fmOut);
    const raportoFm = legiJson<RaportoJson>(join(fmOut, "raporto.json"));

    expect(kuro.anbieterfehleroj?.length).toBeGreaterThan(0);
    expect(raportoSamaKuro.anbieterfehleroj).toEqual(kuro.anbieterfehleroj);
    expect(raportoFm.anbieterfehleroj).toEqual(kuro.anbieterfehleroj);
    expect(fm.rezulto.anbieterfehleroj).toEqual(kuro.anbieterfehleroj);
    // The record shape of C-1, no field more or less.
    const sxlosiloj = new Set(
      (kuro.anbieterfehleroj ?? []).map((e: AnbieterEraro) => Object.keys(e).sort().join(",")),
    );
    expect([...sxlosiloj]).toEqual(["ago,ekrano,mesagxo,provo,rondo,status"]);
  });

  it("counts Σ restantajLauxRegulo = restantaj = the length of ekranoj's restantaj, nicht-gebaut included (C-2, AK-5)", async () => {
    const { dir, md } = await mezuri(mkdtempSync(join(tmpdir(), "s038-37t-ablauf-")));
    const fmOut = mkdtempSync(join(tmpdir(), "s038-37t-fm-"));
    await fmEkranoj(fmOut);
    const malobservoj: string[] = [];
    for (const varianto of ["F", "0"] as const) {
      const own = kuroDir(dir, LFD, varianto, 1);
      const kuro = legiJson<KuroRekordo>(join(own, "kuro.json"));
      const raporto = legiJson<RaportoJson>(join(own, "raporto.json"));
      const sumo = restantajSumo(kuro.restantajLauxRegulo ?? {});
      if (sumo !== kuro.restantaj)
        malobservoj.push(`${varianto}: Σ ${sumo} ≠ restantaj ${kuro.restantaj}`);
      if (kuro.restantaj !== raporto.restantaj.length)
        malobservoj.push(`${varianto}: restantaj ${kuro.restantaj} ≠ ${raporto.restantaj.length}`);
    }
    expect(malobservoj).toEqual([]);
    const f = legiJson<KuroRekordo>(join(kuroDir(dir, LFD, "F", 1), "kuro.json"));
    expect(f.restantajLauxRegulo?.[TRIA]).toEqual({ "nicht-gebaut": 1 });
    expect(f.restantaj).toBe(legiJson<RaportoJson>(join(fmOut, "raporto.json")).restantaj.length);
    expect(f.restantaj).toBeGreaterThan(1);
    expect(md).toContain(
      "## Offene Abweichungen je Regel (nach der letzten Runde, häufigste drei)",
    );
    expect(md).toContain(`| ${LFD} | F | ${f.restantaj} | `);
  });

  it("lets the invented key reach no writer: log lines, kuro.json, raporto.json/.md, saved answers, vergleich.json/.md", async () => {
    const radiko = mkdtempSync(join(tmpdir(), "s038-37t-sekreto-"));
    const antaux = await mezuri(join(radiko, "vorher"));
    const post = await mezuri(join(radiko, "nachher"));
    const fmOut = join(radiko, "fm");
    const fm = await fmEkranoj(fmOut);
    const vergleich = join(radiko, "vergleich");
    mkdirSync(vergleich, { recursive: true });
    const datumoj = komparo([{ dir: antaux.dir }], [{ dir: post.dir }]);
    writeFileSync(join(vergleich, "vergleich.json"), stabilaJson(datumoj));
    writeFileSync(join(vergleich, "vergleich.md"), komparoMd(datumoj));

    const skribitaj = dosieroj(radiko);
    const nomoj = Object.keys(skribitaj);
    // Every writer of the list wrote something here.
    for (const fino of [
      "/kuro.json",
      "/raporto.json",
      "/raporto.md",
      `rondoj/2/${UNUA}.respondo.txt`,
      "vergleich/vergleich.json",
      "vergleich/vergleich.md",
    ]) {
      expect(
        nomoj.some((nomo) => nomo.endsWith(fino)),
        fino,
      ).toBe(true);
    }
    // The key was in play: the 400's message was cleaned, the saved answer too.
    const respondoj = nomoj.filter((nomo) => nomo.endsWith(".respondo.txt"));
    expect(respondoj.every((nomo) => skribitaj[nomo]?.includes("[entfernt]"))).toBe(true);
    const trafoj = [
      ...Object.entries(skribitaj).flatMap(([nomo, teksto]) =>
        sekretojEn(teksto).map((s) => `${nomo}: ${s.slice(0, 6)}…`),
      ),
      ...sekretojEn([...antaux.linioj, ...post.linioj, ...fm.linioj].join("\n")).map(
        (s) => `log: ${s.slice(0, 6)}…`,
      ),
      ...sekretojEn(antaux.md + post.md).map((s) => `ablauf raporto.md: ${s.slice(0, 6)}…`),
    ];
    expect(trafoj).toEqual([]);
  });
});
