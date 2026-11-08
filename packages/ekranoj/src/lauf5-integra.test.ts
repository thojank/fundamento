// Integration tests of Spec 038 Lauf 5 (S038-37t; AK-1 in part, AK-2, AK-5 input, C-1, B-2 … B-4):
// the integrated result of S038-32 … S038-37c through the real `kuruEkranojn`, on the shell path
// (check_markup listed), with a scripted model behind a double of Mistral's rule. One run mixes an
// empty first answer (the Lauf-4 cause of the 400), a 400, a 429, a 5xx, a network error, a page
// whose Markdown fence sits inside the ```html block, a page of closing tags only, and a green
// screen. Every screen of every round must have a page with content or a reported entry
// (`anbieterfehleroj`, `malplenajPagxoj`, a finding); the run ends by „alle grün“ or round 3,
// never by a provider error; one invented key, put into provider messages and into a model answer,
// reaches no writer. Doubles only: no network, no real wait, no browser.

import { mkdtempSync, readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { statikaFakto } from "./fakto-statika.js";
import {
  type AnbieterEraro,
  eligoDe,
  KURZPROFILAJ_KAMPOJ,
  kuruEkranojn,
  LEERA_PAGXO,
  MAKS_RONDOJ,
  malplenaPagxo,
  PERMESITA_MODELO,
  type RaportoJson,
  REKOMENCO_F,
} from "./index.js";
import { fragmentoEl } from "./konstruo.js";
import { BildigiloDouble } from "./test-doubles/bildigilo.js";
import {
  anbieterEraro,
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
import { CXIUJ_ILOJ, kampojDeTabelo, LIMOJ, MemoraPonto } from "./test-doubles/iloj.js";
import { MALVERDA, TaksiloDouble, VERDA } from "./test-doubles/taksilo.js";
import type {
  BildigoRezulto,
  ChatRespondo,
  EkranaDokumento,
  EkranojDeps,
  EkranojEnigo,
  EkranojRezulto,
  Plano,
  Varianto,
} from "./tipoj.js";

const FIKSAJXOJ = fileURLToPath(new URL("../test/fixtures/b4-leere-seite/", import.meta.url));
const legi = (nomo: string): string => readFileSync(join(FIKSAJXOJ, nomo), "utf8");
/** The stored 92 bytes of Lauf 4 (closing tags only) – a page without content. */
const FRAGMENTO_L4 = legi("fragmento-l4.txt").trim();
/** A whole page whose fm-markdovido holds a fenced Markdown block inside the ```html block. */
const INTERNA_BARILO = legi("respondo-hipotezo.txt");

// Five screens: liste → detail → bearbeiten → einstellungen → hilfe (MAKS_EKRANOJ).
const PLANO: Plano = planoKun(5);
const SLUGOJ = PLANO.ekranoj.map((ekrano) => ekrano.slug);
const CELOJ = SLUGOJ.map((slug) => `${slug}.html`).join(", ");

// Invented secrets, built at run time so no source line looks like a key.
const SK = ["sk", "or", "v1", "7e6d5c4b3a291807".repeat(4)].join("-");
const BEARER_VALORO = "cd34ef56".repeat(5);
const QUERY_VALORO = "erfundenL5x";
const SEKRETOJ = [SK, BEARER_VALORO, QUERY_VALORO];
const SEKRETA_KORPO = JSON.stringify({
  error: {
    message: `invalid key ${SK}`,
    url: `https://api.example.test/v1/chat/completions?key=${QUERY_VALORO}&x=1`,
    headers: `Authorization: Bearer ${BEARER_VALORO}`,
  },
});
const sekretojEn = (teksto: string) => SEKRETOJ.filter((s) => teksto.includes(s));

/** A whole page on the shell, the Eroj karto and butono, a link to every planned target. */
function pagxo(slug: string, rondo: number, aldone = ""): string {
  const ligiloj = PLANO.kantoj
    .filter((kanto) => kanto.de === slug)
    .map((kanto) => `<fm-butono href="${kanto.al}.html">Weiter</fm-butono>`)
    .join("");
  return `<fm-sxelo><fm-pagxo><main data-ekrano="${slug}" data-rondo="${rondo}"><fm-karto><h2 slot="heading">Standard A-12</h2></fm-karto><nav>${ligiloj}${aldone}</nav></main></fm-pagxo></fm-sxelo>`;
}

const PLANA_RESPONDO = respondo(`\`\`\`json\n${JSON.stringify(PLANO)}\n\`\`\``);
const pagxaRespondo = (slug: string, rondo: number, aldone = "") =>
  respondo(`\`\`\`html\n${pagxo(slug, rondo, aldone)}\n\`\`\``);
/** liste's round-1 page links to the placeholder target once (a dead link, F-S038-37a-1). */
const MORTA = '<a href="slug.html">X</a>';

/**
 * Per `<slug>#<round>` the first requests get these answers or errors in order; afterwards each
 * build gets its whole page (liste in round 1 with the dead link). Behind Mistral's rule: an
 * assistant message without content and without tool_calls is refused with 400.
 */
function skriptoDe(antauaj: Record<string, (ChatRespondo | Error)[]>): Skripto {
  const restaj = new Map(Object.entries(antauaj).map(([k, eroj]) => [k, [...eroj]]));
  return mistralaRegulo((peto) => {
    const slug = slugDePeto(peto);
    if (slug === undefined) return PLANA_RESPONDO;
    const rondo = rondoDePeto(peto);
    const sekva = restaj.get(`${slug}#${rondo}`)?.shift();
    if (sekva !== undefined) return sekva;
    return pagxaRespondo(slug, rondo, slug === "liste" && rondo === 1 ? MORTA : "");
  });
}

const M429 = '{"message":"Rate limit exceeded"}';
const M503 = '{"message":"Service unavailable"}';

/** The mix of Lauf 5 over five screens and three rounds. */
const MIKSAJXO = (): Record<string, (ChatRespondo | Error)[]> => ({
  // The Lauf-4 cause: an empty first answer – never sent back, so Mistral's rule never fires.
  "liste#1": [respondo("")],
  // 400 with the provider message and the invented key: one resend with the cleaned list.
  "liste#2": [anbieterEraro(400, `${MISTRALA_400} ${SEKRETA_KORPO}`)],
  // 429 twice: two repeats after the injected wait.
  "detail#1": [anbieterEraro(429, M429), anbieterEraro(429, M429)],
  // 5xx three times in round 2: the screen keeps its round-1 page.
  "bearbeiten#2": [anbieterEraro(503, M503), anbieterEraro(503, M503), anbieterEraro(503, M503)],
  // Network six times in round 1: repeats, one fresh conversation, given up – built in round 2.
  "einstellungen#1": Array.from({ length: 6 }, () => retaEraro()),
  // A Markdown fence inside the ```html block (round 1), only closing tags (round 2) with a key
  // the model repeated by mistake.
  "hilfe#1": [respondo(INTERNA_BARILO)],
  "hilfe#2": [
    respondo(`\`\`\`html\n${FRAGMENTO_L4}\n\`\`\`\nSchlüssel ${SK} Bearer ${BEARER_VALORO}`),
  ],
});

/** detail is green from round 1 on (the green screen of the mix); the others never. */
const detailVerda = () => new TaksiloDouble((slug) => (slug === "detail" ? VERDA : MALVERDA));

function enigoDe(out: string): EkranojEnigo {
  return {
    frazo: "Standards wie Standard A-12 für Team Nord verwalten",
    marko: "komuna",
    out,
    maksTokenoj: 10_000_000,
    plano: PLANO,
  };
}

interface Spuro {
  linioj: string[];
  dormoj: number[];
}

function depsDe(
  chat: SkriptaModelo,
  tools: MemoraPonto,
  taksilo: TaksiloDouble,
): EkranojDeps & Spuro {
  const spuro: Spuro = { linioj: [], dormoj: [] };
  return {
    ...spuro,
    chat,
    tools,
    taksilo,
    // No browser: the facts are the elements of the page, light and dark without axe findings.
    bildigilo: new BildigiloDouble(),
    marko: { konstrui: async () => ({ css: [] }) },
    nun: () => new Date("2026-11-08T12:00:00Z"),
    log: (linio) => spuro.linioj.push(linio),
    dormi: async (ms) => {
      spuro.dormoj.push(ms);
    },
    eligo: eligoDe(),
  };
}

/** Every file below a folder, by relative path. */
function dosieroj(dir: string, prefikso = ""): Record<string, string> {
  const listo: Record<string, string> = {};
  for (const nomo of readdirSync(dir).sort()) {
    const vojo = join(dir, nomo);
    if (statSync(vojo).isDirectory()) Object.assign(listo, dosieroj(vojo, `${prefikso}${nomo}/`));
    else listo[`${prefikso}${nomo}`] = readFileSync(vojo, "utf8");
  }
  return listo;
}

/**
 * The AK-2 sweep: per round of the run and planned screen, a page with element content and no
 * „empty page“ gap – or an entry that reports why not. Returns every violation.
 */
function ak2Malobservoj(rezulto: EkranojRezulto): string[] {
  const malobservoj: string[] = [];
  const faritaj = rezulto.faritajRondoj ?? rezulto.rondoj.length;
  for (let r = 1; r <= faritaj; r += 1) {
    for (const slug of SLUGOJ) {
      const stato = rezulto.rondoj[r - 1]?.[slug];
      const fragmento = stato?.fragmento ?? "";
      const enhavo =
        fragmento.trim() !== "" &&
        !malplenaPagxo(fragmento) &&
        !(stato?.taksado.mankoj ?? []).some((manko) => manko.key === "empty page");
      if (enhavo) continue;
      const anbieter = (rezulto.anbieterfehleroj ?? []).some(
        (e) => e.ekrano === slug && e.rondo === r && (e.ago === "rezigno" || e.ago === "portita"),
      );
      const malplena = (rezulto.malplenajPagxoj ?? []).some(
        (m) => m.ekrano === slug && m.rondo === r && m.restis,
      );
      const trovo = (stato?.trovoj ?? []).some((t) => t.regulo === LEERA_PAGXO);
      if (!anbieter && !(malplena && trovo)) {
        malobservoj.push(`Runde ${r} ${slug}: ohne Inhalt und ohne Bericht`);
      }
    }
  }
  return malobservoj;
}

/** The run ends by „alle grün“ or after the last round – never by an error (AK-2). */
function finoMalobservoj(rezulto: EkranojRezulto): string[] {
  const malobservoj: string[] = [];
  if (rezulto.haltigo !== undefined) malobservoj.push(`haltigo ${rezulto.haltigo}`);
  const faritaj = rezulto.faritajRondoj ?? rezulto.rondoj.length;
  const lasta = rezulto.rondoj[faritaj - 1] ?? {};
  const cxiujVerdaj = SLUGOJ.every((slug) => lasta[slug]?.verda === true);
  if (faritaj !== MAKS_RONDOJ && !cxiujVerdaj) malobservoj.push(`Ende nach Runde ${faritaj}`);
  if (faritaj < MAKS_RONDOJ && !cxiujVerdaj) malobservoj.push("vorzeitig ohne alle grün");
  return malobservoj;
}

const konstruoj = (chat: SkriptaModelo) =>
  chat.petoj.flatMap((peto) => {
    const slug = slugDePeto(peto);
    return slug === undefined ? [] : [`${slug}#${rondoDePeto(peto)}`];
  });

const malplenaAsistanto = (peto: Peto) =>
  peto.messages.some(
    (m) =>
      m.role === "assistant" &&
      (m.content ?? "").trim() === "" &&
      (m.tool_calls === undefined || m.tool_calls.length === 0),
  );

async function kuri(
  e: {
    taksilo?: TaksiloDouble;
    antauaj?: Record<string, (ChatRespondo | Error)[]>;
    tools?: MemoraPonto;
    bildigilo?: BildigiloDouble;
  } = {},
) {
  const out = mkdtempSync(join(tmpdir(), "s038-37t-"));
  const chat = new SkriptaModelo(skriptoDe(e.antauaj ?? MIKSAJXO()), { modelo: PERMESITA_MODELO });
  const tools = e.tools ?? new MemoraPonto({ iloj: CXIUJ_ILOJ });
  const deps = depsDe(chat, tools, e.taksilo ?? detailVerda());
  if (e.bildigilo !== undefined) deps.bildigilo = e.bildigilo;
  const rezulto = await kuruEkranojn(enigoDe(out), deps);
  return { out, chat, tools, deps, rezulto };
}

describe("Lauf 5 end to end: the mix of provider errors and empty pages over five screens (AK-2)", () => {
  it("gives every screen of every round a page with content or a reported entry, and ends after round 3, not by an error", async () => {
    const { chat, deps, rezulto } = await kuri();
    expect(ak2Malobservoj(rezulto)).toEqual([]);
    expect(finoMalobservoj(rezulto)).toEqual([]);
    expect(rezulto.faritajRondoj).toBe(MAKS_RONDOJ);
    // The cause stays fixed in the integrated run: no request held an empty assistant message.
    expect(chat.petoj.filter(malplenaAsistanto)).toEqual([]);
    // The green screen of the mix: green from round 1, not built again.
    expect(rezulto.rondoj[0]?.detail?.verda).toBe(true);
    expect(konstruoj(chat).filter((k) => k.startsWith("detail#"))).toEqual([
      "detail#1",
      "detail#1",
      "detail#1",
    ]);
    // The waits were injected: two per 429 pair, two per repeat series of the 5xx and network.
    expect(deps.dormoj.length).toBeGreaterThan(0);
    expect(deps.dormoj.every((ms) => ms > 0)).toBe(true);
  });

  it("reports each caught error once, in order, with the action the rules give it (C-1)", async () => {
    const { rezulto } = await kuri();
    expect(
      (rezulto.anbieterfehleroj ?? []).map(
        (e) => `${e.ekrano}#${e.rondo} ${e.provo} ${e.status} ${e.ago}`,
      ),
    ).toEqual([
      "detail#1 1 429 ripeto",
      "detail#1 2 429 ripeto",
      "einstellungen#1 1 0 ripeto",
      "einstellungen#1 2 0 ripeto",
      "einstellungen#1 3 0 nova-konversacio",
      "einstellungen#1 4 0 ripeto",
      "einstellungen#1 5 0 ripeto",
      "einstellungen#1 6 0 rezigno",
      "liste#2 1 400 purigo",
      "bearbeiten#2 1 503 ripeto",
      "bearbeiten#2 2 503 ripeto",
      "bearbeiten#2 3 503 portita",
    ]);
    // portita keeps the round-1 page; rezigno leaves the screen unbuilt in round 1, built in round 2.
    expect(rezulto.rondoj[1]?.bearbeiten?.portitaEl).toBe(1);
    expect(rezulto.rondoj[1]?.bearbeiten?.fragmento).toBe(pagxo("bearbeiten", 1));
    expect(rezulto.rondoj[0]?.einstellungen).toBeUndefined();
    expect(rezulto.rondoj[1]?.einstellungen?.fragmento).toBe(pagxo("einstellungen", 1));
    expect(rezulto.notoj?.filter((noto) => noto.includes("AK-2 verletzt"))).toEqual([
      expect.stringContaining("einstellungen"),
      expect.stringContaining("hilfe"),
    ]);
  });

  it("takes the page with an inner Markdown fence whole, and reports the page of closing tags as a finding for the next round (B-4)", async () => {
    const { chat, rezulto } = await kuri();
    const hilfe1 = rezulto.rondoj[0]?.hilfe;
    expect(hilfe1?.fragmento?.startsWith("<fm-sxelo>")).toBe(true);
    expect(hilfe1?.fragmento?.endsWith("</fm-sxelo>")).toBe(true);
    expect(malplenaPagxo(hilfe1?.fragmento ?? "")).toBe(false);
    expect(rezulto.malplenajPagxoj).toEqual([
      {
        ekrano: "hilfe",
        rondo: 2,
        bytes: 92,
        ago: "trovo",
        restis: true,
        respondo: "rondoj/2/hilfe.respondo.txt",
      },
    ]);
    // Round 2 is no fresh conversation; round 3 gets the finding with its instruction.
    expect(chat.petoj.some((peto) => (peto.messages[1]?.content ?? "").includes(REKOMENCO_F))).toBe(
      false,
    );
    const tasko3 =
      chat.petoj.find((peto) => slugDePeto(peto) === "hilfe" && rondoDePeto(peto) === 3)
        ?.messages[1]?.content ?? "";
    expect(tasko3).toContain(`"regulo": "${LEERA_PAGXO}"`);
    expect(rezulto.rondoj[2]?.hilfe?.fragmento).toBe(pagxo("hilfe", 3));
  });

  it("asks round 2 with the constraints of the Kurzprofile and the concrete targets of a dead link, never a <slug> placeholder (AK-1 in part, B-2, B-3)", async () => {
    const { chat, rezulto } = await kuri();
    const malobservoj: string[] = [];
    for (const [index, peto] of chat.petoj.entries()) {
      for (const m of peto.messages) {
        if ((m.content ?? "").includes("<slug>"))
          malobservoj.push(`Anfrage ${index + 1} ${m.role}`);
      }
    }
    expect(malobservoj).toEqual([]);
    const liste2 = chat.petoj.filter(
      (peto) => slugDePeto(peto) === "liste" && rondoDePeto(peto) === 2,
    );
    // The 400 and its cleaned resend carry the same task.
    expect(liste2).toHaveLength(2);
    const tasko = liste2[0]?.messages.find((m) => m.role === "user")?.content ?? "";
    expect(tasko).toContain("brief, slots und constraints");
    expect(tasko).toContain(JSON.stringify(kampojDeTabelo("butono", KURZPROFILAJ_KAMPOJ)));
    expect(tasko).toContain(`"constraints":${JSON.stringify(LIMOJ.butono)}`);
    expect(tasko).toContain(`Nur auf geplante Screens verweisen: ${CELOJ}.`);
    expect(
      (rezulto.rondoj[0]?.liste?.trovoj ?? [])
        .filter((t) => t.regulo === "navigado-morta")
        .map((t) => t.sugesto),
    ).toEqual([`Nur auf geplante Screens verweisen: ${CELOJ}.`]);
  });

  it("ends by „alle grün“ when the screens turn green after a round-1 mix of errors", async () => {
    const { rezulto } = await kuri({
      taksilo: new TaksiloDouble(() => VERDA),
      antauaj: {
        "liste#1": [respondo("")],
        "detail#1": [anbieterEraro(429, M429), anbieterEraro(429, M429)],
        "bearbeiten#1": [anbieterEraro(400, MISTRALA_400), anbieterEraro(400, MISTRALA_400)],
        "einstellungen#1": Array.from({ length: 6 }, () => retaEraro()),
        "hilfe#1": [respondo(INTERNA_BARILO)],
      },
    });
    expect(ak2Malobservoj(rezulto)).toEqual([]);
    expect(finoMalobservoj(rezulto)).toEqual([]);
    expect(rezulto.haltigo).toBeUndefined();
    expect(rezulto.faritajRondoj).toBeLessThan(MAKS_RONDOJ);
    const lasta = rezulto.rondoj[(rezulto.faritajRondoj ?? 0) - 1] ?? {};
    expect(SLUGOJ.filter((slug) => lasta[slug]?.verda !== true)).toEqual([]);
    expect(
      (rezulto.anbieterfehleroj ?? []).map((e) => `${e.ekrano}#${e.rondo} ${e.ago}`).at(-1),
    ).toBe("einstellungen#1 rezigno");
  });
});

// S038-39b (F-S038-39a-3): the detail page of abnahme-komuna-l5-v1 kept `<div slot="actions">` for
// three rounds; check_usage's suggestion did not name the wrapper. The finding handed to round 2
// now names it – generic for any slot and Ero, read from the facts of the page.
describe("Lauf 5 end to end: a wrapper in a slot is named for the next round (S038-39b)", () => {
  const HULO = '<div slot="actions"><fm-butono>Bearbeiten</fm-butono></div>';
  const MESAGXO =
    "Instance 0 of karto holds text in the slot actions, which accepts butono or ligilo.";
  const SUGESTO = "Put butono or ligilo in the slot actions.";
  /** check_markup that judges the wrapper as the real check_usage does (uzo-slot-accepts). */
  const kontrolo = (args: Record<string, unknown>) => {
    const kunHulo = String(args.fragment ?? "").includes('<div slot="actions">');
    return {
      eroj: [{ ero: "karto", props: {} }],
      sxablonoj: [],
      rezulto: kunHulo
        ? {
            instances: 1,
            valid: false,
            violations: [
              {
                instance: [0],
                issue: {
                  rule: "uzo-slot-accepts",
                  severity: "error",
                  path: "instances#/0",
                  message: MESAGXO,
                  suggestion: SUGESTO,
                },
              },
            ],
          }
        : { instances: 1, valid: true, violations: [] },
    };
  };

  /** A renderer double whose facts keep the element tree of the fragment, as the browser's do. */
  class ArbaBildigilo extends BildigiloDouble {
    override async render(
      dokumento: EkranaDokumento,
      opcioj: { aspektoj: readonly string[]; varianto: Varianto },
    ): Promise<BildigoRezulto> {
      const rezulto = await super.render(dokumento, opcioj);
      const fragmento = fragmentoEl(dokumento.html) ?? dokumento.html;
      const { elements } = statikaFakto(fragmento, "de");
      return { ...rezulto, fakto: { ...rezulto.fakto, elements } };
    }
  }

  it("asks round 2 of detail with a suggestion that names the wrapper and the Eroj in it", async () => {
    const detail1 = pagxo("detail", 1).replace("</fm-karto>", `${HULO}</fm-karto>`);
    const { chat, rezulto } = await kuri({
      taksilo: new TaksiloDouble(() => MALVERDA),
      antauaj: { "detail#1": [respondo(`\`\`\`html\n${detail1}\n\`\`\``)] },
      tools: new MemoraPonto({ iloj: CXIUJ_ILOJ, checkMarkup: kontrolo }),
      bildigilo: new ArbaBildigilo(),
    });
    const atendata = `${SUGESTO} Im Slot actions steht ein <div> als Hülle; eine Hülle zählt als Text: slot="actions" direkt an jedes fm-butono darin setzen und das <div> weglassen.`;
    expect(
      (rezulto.rondoj[0]?.detail?.trovoj ?? [])
        .filter((t) => t.regulo === "uzo-slot-accepts")
        .map((t) => t.sugesto),
    ).toEqual([atendata]);
    const detail2 = chat.petoj.find(
      (peto) => slugDePeto(peto) === "detail" && rondoDePeto(peto) === 2,
    );
    const tasko = detail2?.messages.find((m) => m.role === "user")?.content ?? "";
    expect(tasko).toContain(JSON.stringify(atendata));
    // liste never had the wrapper: its findings keep no such suggestion.
    expect(
      (rezulto.rondoj[0]?.liste?.trovoj ?? []).filter((t) => t.sugesto.includes("Hülle")),
    ).toEqual([]);
  });
});

describe("Lauf 5 end to end: what the run writes (C-1, B-4, secret check)", () => {
  it("writes the same anbieterfehleroj and malplenajPagxoj to raporto.json as the result, and restantaj with them", async () => {
    const { out, rezulto } = await kuri();
    const json = JSON.parse(readFileSync(join(out, "raporto.json"), "utf8")) as RaportoJson;
    expect(json.anbieterfehleroj).toEqual(rezulto.anbieterfehleroj);
    expect(json.malplenajPagxoj).toEqual(rezulto.malplenajPagxoj);
    expect(json.restantaj).toEqual(rezulto.restantaj);
    expect(json.haltigo).toBeNull();
    expect(json.faritajRondoj).toBe(MAKS_RONDOJ);
    const md = readFileSync(join(out, "raporto.md"), "utf8");
    expect(md).toContain("## Anbieterfehler");
    expect(md).toContain("## Leere Seiten (B-4)");
    // Every caught error has its line in the table of raporto.md (screen | round | attempt | status).
    const malobservoj = (json.anbieterfehleroj ?? []).filter(
      (e: AnbieterEraro) => !md.includes(`| ${e.ekrano} | ${e.rondo} | ${e.provo} | ${e.status} |`),
    );
    expect(malobservoj).toEqual([]);
  });

  it("lets the invented key of a provider message and of a model answer reach no writer: log, raporto.json, raporto.md, saved answers, pages", async () => {
    const { out, deps, rezulto } = await kuri();
    // The key was in play: in the 400 of liste#2 and in the empty answer of hilfe#2.
    expect(rezulto.anbieterfehleroj?.find((e) => e.status === 400)?.mesagxo).toContain(
      "[entfernt]",
    );
    const skribitaj = dosieroj(out);
    expect(Object.keys(skribitaj)).toEqual(
      expect.arrayContaining(["raporto.json", "raporto.md", "rondoj/2/hilfe.respondo.txt"]),
    );
    expect(skribitaj["rondoj/2/hilfe.respondo.txt"]).toContain(FRAGMENTO_L4);
    const trafoj = [
      ...Object.entries(skribitaj).flatMap(([nomo, teksto]) =>
        sekretojEn(teksto).map((s) => `${nomo}: ${s.slice(0, 6)}…`),
      ),
      ...sekretojEn(deps.linioj.join("\n")).map((s) => `log: ${s.slice(0, 6)}…`),
      ...sekretojEn(JSON.stringify(rezulto)).map((s) => `rezulto: ${s.slice(0, 6)}…`),
    ];
    expect(trafoj).toEqual([]);
  });
});
