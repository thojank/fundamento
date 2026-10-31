// The output folder of a run (implementation spec §2.4, Lieferliste 1.6, 1.9, AC-6, AC-7) on
// doubles: scripted model, in-memory Gvidanto, scorer double, renderer double or none, brand-build
// double. Files are written into a temporary folder; no network, no browser, no provider.

import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  eligoDe,
  fragmentoEl,
  KLASIKA_SKRIPTO,
  kuruEkranojn,
  PERMESITA_MODELO,
  SEN_BILDIGILO_FRAZO,
  stabilaJson,
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
import { MemoraPonto, SKEMOJ } from "./test-doubles/iloj.js";
import { MarkoDouble } from "./test-doubles/marko.js";
import { TaksiloDouble, VERDA, verdaEkde } from "./test-doubles/taksilo.js";
import type { EkranojDeps, EkranojRezulto, Marko, Plano, ToolBridge } from "./tipoj.js";

const PLANO: Plano = planoKun(3); // liste → detail → bearbeiten
const RADIKO = mkdtempSync(join(tmpdir(), "ekranoj-eligo-"));
afterAll(() => rmSync(RADIKO, { recursive: true, force: true }));

/** The fragment of a screen in a round: Eroj only, links to its planned targets. */
function fragmentoDe(slug: string, rondo: number, ligilo: "href" | "ero" = "href"): string {
  const ligiloj = PLANO.kantoj
    .filter((kanto) => kanto.de === slug)
    .map((kanto) =>
      ligilo === "href"
        ? `<fm-butono href="${kanto.al}.html">Weiter</fm-butono>`
        : `<fm-saltilo celo="${kanto.al}.html">Weiter</fm-saltilo>`,
    )
    .join("");
  return `<main data-rondo="${rondo}"><fm-karto><h2 slot="heading">Standard A-12</h2></fm-karto><fm-butono intent="primary">Speichern</fm-butono><nav>${ligiloj}</nav></main>`;
}

const skripto =
  (ligilo: "href" | "ero" = "href") =>
  (peto: Peto) =>
    respondo(
      `\`\`\`html\n${fragmentoDe(slugDePeto(peto) ?? "", rondoDePeto(peto), ligilo)}\n\`\`\``,
      { input: 1000, output: 200 },
    );

interface KuroOpcioj {
  nomo: string;
  marko?: string;
  bildigilo?: boolean;
  taksilo?: TaksiloDouble;
  markoDouble?: Marko;
  tools?: ToolBridge;
  ligilo?: "href" | "ero";
  varianto?: "F" | "0";
}

async function kuro(o: KuroOpcioj): Promise<{ rezulto: EkranojRezulto; dir: string }> {
  const dir = join(RADIKO, o.nomo);
  const deps: EkranojDeps = {
    chat: new SkriptaModelo(skripto(o.ligilo), { modelo: PERMESITA_MODELO }),
    ...(o.varianto === "0" ? {} : { tools: o.tools ?? new MemoraPonto() }),
    taksilo: o.taksilo ?? verdaEkde(2),
    ...(o.bildigilo === false ? {} : { bildigilo: new BildigiloDouble() }),
    marko: o.markoDouble ?? new MarkoDouble(o.marko ?? "komuna"),
    nun: () => new Date("2026-10-31T12:00:00Z"),
    log: () => undefined,
    eligo: eligoDe({ commit: "0123abc" }),
  };
  const rezulto = await kuruEkranojn(
    {
      frazo: "Standards wie Standard A-12 für Team Nord verwalten",
      marko: o.marko ?? "komuna",
      out: dir,
      maksTokenoj: 1_000_000,
      plano: PLANO,
      ...(o.varianto === undefined ? {} : { varianto: o.varianto }),
    },
    deps,
  );
  return { rezulto, dir };
}

/** Every file below a folder, relative, sorted. */
function dosieroj(dir: string): string[] {
  const listo: string[] = [];
  const iri = (nuna: string) => {
    for (const nomo of readdirSync(nuna)) {
      const vojo = join(nuna, nomo);
      if (statSync(vojo).isDirectory()) iri(vojo);
      else listo.push(relative(dir, vojo).split("\\").join("/"));
    }
  };
  iri(dir);
  return listo.sort();
}

const legi = (dir: string, dosiero: string) => readFileSync(join(dir, dosiero), "utf8");

beforeEach(() => {
  // The duration of a run is a number in the report; a frozen clock makes two runs comparable.
  vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-10-31T12:00:00Z"));
});
afterEach(() => vi.restoreAllMocks());

describe("the raw answer of an empty build (S037-10 Befund 1)", () => {
  it("keeps both answers of a screen without markup, redacted, as rondoj/<n>/<slug>.respondo.txt", async () => {
    const dir = join(RADIKO, "261031-1300-leer");
    // Only a mankoj block: no markup, so the agent is asked once more and answers the same.
    const sen = [
      "```mankoj",
      '[{"speco": "ilo", "nomo": "list_arangxoj", "ekzemplo": "Abstand", "propono": "Layoutmittel"}]',
      "```",
    ].join("\n");
    const chat = new SkriptaModelo(
      (peto) => (slugDePeto(peto) === "detail" ? respondo(sen) : skripto()(peto)),
      { modelo: PERMESITA_MODELO },
    );
    await kuruEkranojn(
      {
        frazo: "Standards wie Standard A-12 für Team Nord verwalten",
        marko: "komuna",
        out: dir,
        maksTokenoj: 1_000_000,
        plano: PLANO,
      },
      {
        chat,
        tools: new MemoraPonto(),
        taksilo: new TaksiloDouble(() => VERDA),
        bildigilo: new BildigiloDouble(),
        marko: new MarkoDouble("komuna"),
        nun: () => new Date("2026-10-31T12:00:00Z"),
        log: () => undefined,
        eligo: eligoDe({ redakti: (teksto) => teksto.replaceAll("Abstand", "‹geschwärzt›") }),
      },
    );
    expect(dosieroj(dir).filter((dosiero) => dosiero.endsWith(".respondo.txt"))).toEqual([
      "rondoj/1/detail.respondo.txt",
      "rondoj/2/detail.respondo.txt",
      "rondoj/3/detail.respondo.txt",
    ]);
    const teksto = legi(dir, "rondoj/1/detail.respondo.txt");
    expect(teksto.split(sen.replaceAll("Abstand", "‹geschwärzt›"))).toHaveLength(3);
    expect(teksto).not.toContain("Abstand");
  });
});

describe("output folder (§2.4, Lieferliste 1.6, AC-6)", () => {
  it("writes every file of the layout", async () => {
    const { dir } = await kuro({ nomo: "261031-1200-standards" });
    const slugs = PLANO.ekranoj.map((ekrano) => ekrano.slug);
    expect(dosieroj(dir)).toEqual(
      [
        "plano.json",
        "superrigardo.html",
        "raporto.md",
        "raporto.json",
        "mankoj.json",
        "marko/css/fundamento.css",
        "marko/make-kit/komuna/dist/element.js",
        `marko/${KLASIKA_SKRIPTO}`,
        ...slugs.map((slug) => `ekranoj/${slug}.html`),
        ...slugs.flatMap((slug) => [`bildoj/${slug}-hela.png`, `bildoj/${slug}-malhela.png`]),
        ...[1, 2, 3].flatMap((n) =>
          slugs.flatMap((slug) => [`rondoj/${n}/${slug}.html`, `rondoj/${n}/${slug}.fakto.json`]),
        ),
      ].sort(),
    );
    expect(JSON.parse(legi(dir, "plano.json"))).toEqual(PLANO);
  });

  it("builds the brand once per run into <out>/marko", async () => {
    const marko = new MarkoDouble("komuna");
    const { dir } = await kuro({ nomo: "marko-unufoje", markoDouble: marko });
    expect(marko.dosierujoj).toEqual([join(dir, "marko")]);
  });

  it("links every screen and the report from the overview, and every link resolves", async () => {
    const { dir } = await kuro({ nomo: "superrigardo" });
    const html = legi(dir, "superrigardo.html");
    const hrefs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1] ?? "");
    for (const ekrano of PLANO.ekranoj) {
      expect(hrefs).toContain(`ekranoj/${ekrano.slug}.html`);
      expect(html).toContain(ekrano.celo);
    }
    expect(hrefs).toContain("raporto.md");
    for (const href of hrefs) expect(existsSync(join(dir, href))).toBe(true);
  });

  it("keeps the state of every round and the final screen with the last fragment", async () => {
    const { dir, rezulto } = await kuro({ nomo: "rondoj" });
    expect(rezulto.faritajRondoj).toBe(2);
    expect(fragmentoEl(legi(dir, "rondoj/1/liste.html"))).toBe(fragmentoDe("liste", 1));
    expect(fragmentoEl(legi(dir, "rondoj/2/liste.html"))).toBe(fragmentoDe("liste", 2));
    // Round 3 carried forward (D-26): the state of round 2.
    expect(legi(dir, "rondoj/3/liste.html")).toBe(legi(dir, "rondoj/2/liste.html"));
    expect(fragmentoEl(legi(dir, "ekranoj/liste.html"))).toBe(fragmentoDe("liste", 2));
    expect(legi(dir, "ekranoj/liste.html")).toContain('href="../marko/css/fundamento.css"');
    // D-33: the stored facts are the facts the round was scored on.
    const fakto = JSON.parse(legi(dir, "rondoj/1/detail.fakto.json"));
    expect(fakto).toEqual(rezulto.rondoj[0]?.detail?.fakto);
  });

  it("writes the report with every section of Lieferliste 1.6", async () => {
    const { dir } = await kuro({ nomo: "raporto" });
    const md = legi(dir, "raporto.md");
    const titoloj = [...md.matchAll(/^#{2,3} .*$/gm)].map((m) => m[0]);
    expect(titoloj).toEqual([
      "## Eingabe",
      "## Screens",
      "## Verwendete Eroj und Sxablonoj",
      "## Ergebnis je Runde",
      "### Runde 1",
      "### Runde 2",
      "### Runde 3",
      "## Verbleibende Abweichungen",
      "## Lücken (Teil 3)",
      "## Aufwand und Kosten",
      "## Halt",
    ]);
    expect(md).toContain("Standards wie Standard A-12 für Team Nord verwalten");
    expect(md).toContain("komuna");
    expect(md).toContain("0123abc");
    for (const ekrano of PLANO.ekranoj) expect(md).toContain(ekrano.celo);
    expect(md).toContain("fm-butono");
    expect(md).toContain("fm-karto");
    expect(md).toMatch(
      /\| Screen \| K1 \| K2 \| K3 \| K4 \| K5 \| K6 \| Total \| K7 Bytes \| check_usage \| axe hell \| axe dunkel \| Navigation \| grün \|/,
    );
    expect(md).toContain("grün seit Runde 2");
    expect(md).toMatch(/Tokens ein: \d+/);
    expect(md).toMatch(/Tokens aus: \d+/);
    expect(md).toMatch(/Kosten: [\d.,]+ \$/);
    expect(md).toMatch(/Dauer: \d+ ms/);
    expect(md).toMatch(/Haltgrund: /);
    expect(md).not.toContain(SEN_BILDIGILO_FRAZO);
  });

  it("lists every remaining deviation with rule, place and reason", async () => {
    const { dir, rezulto } = await kuro({
      nomo: "restantaj",
      taksilo: verdaEkde(9),
    });
    expect(rezulto.restantaj.length).toBeGreaterThan(0);
    const md = legi(dir, "raporto.md");
    expect(md).toContain("| Screen | Regel | Ort | Grund |");
    for (const r of rezulto.restantaj) {
      expect(md).toContain(`| ${r.ekrano} | ${r.regulo} | ${r.loko} | ${r.kialo} |`);
    }
    expect(md).toMatch(/Haltgrund: .*3 Runden/);
  });

  it("carries the fields raporto.json needs, with sorted keys", async () => {
    const { dir, rezulto } = await kuro({ nomo: "raporto-json" });
    const teksto = legi(dir, "raporto.json");
    const json = JSON.parse(teksto);
    expect(teksto).toBe(stabilaJson(json));
    expect(json.id).toBe("raporto-json");
    expect(json.kosto.usd).toBe(rezulto.kosto.usd);
    expect(typeof json.kosto.usd).toBe("number");
    expect(json.peno).toEqual(rezulto.peno);
    expect(Object.keys(json.peno)).toEqual([
      "bytes",
      "inputTokens",
      "ms",
      "outputTokens",
      "requests",
      "toolCalls",
    ]);
    expect(json.haltigo).toBeNull();
    expect(json.restantaj).toEqual(rezulto.restantaj);
    expect(json.mankoj).toEqual(rezulto.mankoj);
    expect(json.rondoj).toHaveLength(3);
    expect(json.rondoj[2].ekranoj.liste.verdaEkde).toBe(2);
    expect(json.rondoj[0].ekranoj.liste.axe).toEqual({ hela: [], malhela: [] });
    expect(json.rondoj[0].navigado.kvoto).toBe(1);
    expect(json.enigo).toMatchObject({ commit: "0123abc", marko: "komuna", varianto: "F" });
    expect(json.bildigilo).toBe(true);
    expect(json.dauxroMs).toBe(rezulto.peno.ms);
    expect(JSON.parse(legi(dir, "mankoj.json"))).toEqual(rezulto.mankoj);
  });
});

describe("determinism (§2.4)", () => {
  it("writes byte-identical files for the same double run, except the run id", async () => {
    const a = await kuro({ nomo: "261031-1200-standards-a" });
    const b = await kuro({ nomo: "261031-1201-standards-b" });
    const listoA = dosieroj(a.dir);
    expect(dosieroj(b.dir)).toEqual(listoA);
    let kunId = 0;
    for (const dosiero of listoA) {
      const ta = readFileSync(join(a.dir, dosiero)).toString("latin1");
      const tb = readFileSync(join(b.dir, dosiero)).toString("latin1");
      if (ta.includes("261031-1200-standards-a")) kunId += 1;
      expect(tb.replaceAll("261031-1201-standards-b", "261031-1200-standards-a"), dosiero).toBe(ta);
    }
    expect(kunId).toBeGreaterThan(0);
  });
});

describe("without a browser (edge case, D-04)", () => {
  it("writes no photos, says so in exactly one sentence and turns no screen green", async () => {
    const { dir, rezulto } = await kuro({
      nomo: "sen-bildigilo",
      bildigilo: false,
      taksilo: new TaksiloDouble(() => VERDA),
    });
    expect(dosieroj(dir).filter((d) => d.startsWith("bildoj/"))).toEqual([]);
    const md = legi(dir, "raporto.md");
    expect(md.split(SEN_BILDIGILO_FRAZO).length - 1).toBe(1);
    expect(md).toContain("nicht geprüft");
    const json = JSON.parse(legi(dir, "raporto.json"));
    expect(json.bildigilo).toBe(false);
    expect(json.rondoj[0].ekranoj.liste.axe).toEqual({ hela: null, malhela: null });
    expect(rezulto.rondoj.flatMap((rondo) => Object.values(rondo)).some((e) => e.verda)).toBe(
      false,
    );
    expect(json.ekranoj.every((e: { verda: boolean }) => !e.verda)).toBe(true);
    expect(legi(dir, "superrigardo.html")).not.toContain("bildoj/");
  });
});

describe("Markenfreiheit (AC-7, pure)", () => {
  /** Every value of a custom property in a stylesheet. */
  const valoroj = (css: string) =>
    [...css.matchAll(/--[\w-]+:\s*([^;]+);/g)].map((m) => (m[1] ?? "").trim());
  const KOLORO = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i;

  it("gives byte-identical fragments and screens that differ only in the brand", async () => {
    const komuna = await kuro({ nomo: "ac7-komuna", marko: "komuna" });
    const provo = await kuro({ nomo: "ac7-provo", marko: "provo" });
    const cssK = legi(komuna.dir, "marko/css/fundamento.css");
    const cssP = legi(provo.dir, "marko/css/fundamento.css");
    expect(cssK).not.toBe(cssP);
    const tokenoj = [...valoroj(cssK), ...valoroj(cssP)];
    expect(tokenoj.length).toBeGreaterThan(0);

    const ekranoj = dosieroj(komuna.dir).filter(
      (d) => (d.startsWith("ekranoj/") || d.startsWith("rondoj/")) && d.endsWith(".html"),
    );
    expect(ekranoj.length).toBe(PLANO.ekranoj.length * 4);
    for (const dosiero of [...ekranoj, "superrigardo.html"]) {
      const k = legi(komuna.dir, dosiero);
      const p = legi(provo.dir, dosiero);
      // The one allowed difference: the brand the frame names.
      expect(k.split('data-fm-aspekto="komuna"').length - 1, dosiero).toBe(1);
      expect(k.replace('data-fm-aspekto="komuna"', 'data-fm-aspekto="provo"'), dosiero).toBe(p);
      if (dosiero === "superrigardo.html") continue;
      const fragmento = fragmentoEl(k) ?? "";
      expect(fragmento, dosiero).not.toBe("");
      expect(fragmentoEl(p), dosiero).toBe(fragmento);
      expect(fragmento).not.toMatch(KOLORO);
      expect(fragmento).not.toContain("--fm-");
      expect(fragmento).not.toMatch(/\sstyle=|<style/i);
      for (const valoro of tokenoj) {
        expect(k, `${dosiero}: ${valoro}`).not.toContain(valoro);
        expect(p, `${dosiero}: ${valoro}`).not.toContain(valoro);
      }
    }
  });
});

describe("kuruEkranojn writes through the seam (S037-04)", () => {
  it("turns a screen green whose links use the link Ero named by the Skemo (S037-07 Befund 1)", async () => {
    const ponto = new MemoraPonto();
    const saltilo = {
      ero: { id: "ero-saltilo", name: "saltilo", description: "Ein Verweis" },
      skemo: {
        props: [{ name: "celo", kind: "string", required: true }],
        slots: [{ name: "label", default: true }],
        a11y: { role: "link" },
      },
    };
    const tools: ToolBridge = {
      list: () => ponto.list(),
      prompt: () => ponto.prompt(),
      call: async (name, args) =>
        name === "get_ero" && args.name === "saltilo"
          ? JSON.stringify(saltilo)
          : name === "get_ero" && SKEMOJ[String(args.name)] === undefined
            ? JSON.stringify({ issues: [] })
            : ponto.call(name, args),
    };
    const { rezulto } = await kuro({
      nomo: "ligilo-ero",
      ligilo: "ero",
      tools,
      taksilo: new TaksiloDouble(() => VERDA),
    });
    expect(rezulto.rondoj[0]?.liste?.navigado).toEqual({
      kompleta: true,
      mankantaj: [],
      mortaj: [],
    });
    expect(rezulto.rondoj[0]?.liste?.verda).toBe(true);
    expect(rezulto.faritajRondoj).toBe(1);
  });

  it("builds no brand for Variante 0 and still writes the folder", async () => {
    const marko = new MarkoDouble("komuna");
    const { dir } = await kuro({ nomo: "varianto-0", varianto: "0", markoDouble: marko });
    expect(marko.dosierujoj).toEqual([]);
    expect(dosieroj(dir).some((d) => d.startsWith("marko/"))).toBe(false);
    expect(legi(dir, "ekranoj/liste.html")).not.toContain("data-fm-aspekto");
    expect(legi(dir, "superrigardo.html")).toContain("ekranoj/liste.html");
  });
});
