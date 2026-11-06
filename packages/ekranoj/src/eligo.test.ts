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
  K8_MERKMALOJ,
  KLASIKA_SKRIPTO,
  kuruEkranojn,
  PERMESITA_MODELO,
  type RaportoJson,
  raportoDe,
  raportoMarkdown,
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
import type {
  EkranojDeps,
  EkranojRezulto,
  K8Merkmal,
  Marko,
  Peno,
  Plano,
  RondoEkrano,
  TaksadoK8Rezulto,
  ToolBridge,
} from "./tipoj.js";

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

describe("values carried over by a stop (S037-10 Befund 6)", () => {
  it("says in raporto.md and raporto.json which screens a round did not rebuild", async () => {
    const dir = join(RADIKO, "261031-1400-uebernommen");
    // 1 200 tokens per request: three builds in round 1, liste#2 → 4 800; detail#2 would pass 5 500.
    await kuruEkranojn(
      {
        frazo: "Standards wie Standard A-12 für Team Nord verwalten",
        marko: "komuna",
        out: dir,
        maksTokenoj: 5_500,
        plano: PLANO,
      },
      {
        chat: new SkriptaModelo(skripto(), { modelo: PERMESITA_MODELO }),
        tools: new MemoraPonto(),
        taksilo: new TaksiloDouble(() => ({ ...VERDA, k: { ...VERDA.k, K5: 0 } })),
        bildigilo: new BildigiloDouble(),
        marko: new MarkoDouble("komuna"),
        nun: () => new Date("2026-10-31T12:00:00Z"),
        log: () => undefined,
        eligo: eligoDe(),
      },
    );
    const raporto = JSON.parse(legi(dir, "raporto.json")) as {
      rondoj: { ekranoj: Record<string, { portitaEl?: number }> }[];
    };
    const portitaj = raporto.rondoj.map((r) =>
      ["liste", "detail", "bearbeiten"].map((slug) => r.ekranoj[slug]?.portitaEl),
    );
    expect(portitaj).toEqual([
      [undefined, undefined, undefined],
      [undefined, 1, 1],
    ]);
    const runde2 =
      legi(dir, "raporto.md")
        .split("### Runde 2")[1]
        ?.split(/\n#{2,3} /)[0] ?? "";
    const vicoj = runde2
      .split("\n")
      .filter((linio) => /^\| (liste|detail|bearbeiten) \|/.test(linio));
    expect(vicoj.map((vico) => vico.includes("übernommen aus R1"))).toEqual([false, true, true]);
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

  it("hands the brand build's base-font name to every screen document and the overview (C-5)", async () => {
    const bazaTiparo = "--fm-provo-tiparo";
    const duoblo = new MarkoDouble("komuna");
    const marko: Marko = {
      konstrui: async (dir) => ({ ...(await duoblo.konstrui(dir)), bazaTiparo }),
    };
    const { dir } = await kuro({ nomo: "baza-tiparo", markoDouble: marko });
    const dokumentoj = dosieroj(dir).filter(
      (d) => (d.startsWith("ekranoj/") || d.startsWith("rondoj/")) && d.endsWith(".html"),
    );
    expect(dokumentoj.length).toBe(PLANO.ekranoj.length * 4);
    for (const dosiero of [...dokumentoj, "superrigardo.html"]) {
      expect(legi(dir, dosiero), dosiero).toContain(`font-family: var(${bazaTiparo})`);
    }
    // Without the field the documents carry no font rule (the behaviour of before).
    const { dir: sen } = await kuro({ nomo: "sen-baza-tiparo" });
    for (const dosiero of [...dokumentoj, "superrigardo.html"]) {
      expect(legi(sen, dosiero), dosiero).not.toContain("font-family");
    }
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
      // Spec 038 S038-21 (AC-8): the table of the effort per screen and round.
      "### Tokens je Screen und Runde",
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

// Spec 038 Lauf 3 (3.4a, C-4, D-16): the deviations „mangels Mittel“ get their own section in
// raporto.md and their own list in raporto.json, only when there are any.
describe("deviations „mangels Mittel“ in the report (3.4a, D-16)", () => {
  const TITOLO = "## Abweichungen mangels Mittel (D-16)";
  const k8: TaksadoK8Rezulto = {
    kvoto: 0.9167,
    kombinacioj: (["dark", "light"] as const).map((scheme) => ({
      aspekto: "komuna",
      scheme,
      merkmaloj: Object.fromEntries(
        K8_MERKMALOJ.map((m) => [m, m === "interspacoj" ? 0.6667 : 1]),
      ) as Record<K8Merkmal, number>,
      kvoto: 0.9167,
      kialoj: K8_MERKMALOJ.map((m) => ({
        merkmal: m,
        teksto:
          m === "interspacoj"
            ? "1 von 3 Geschwisterabständen nicht auf einer Abstandsstufe, zuerst `main > p` (13 px)"
            : "vollständig",
      })),
    })),
    mankoj: ["interspacoj"],
    plena: true,
  };

  it("shows them in raporto.md and raporto.json, and the screens stay green", async () => {
    const { dir, rezulto } = await kuro({
      nomo: "sen-rimedoj",
      taksilo: new TaksiloDouble(() => ({ ...VERDA, k8 })),
    });
    const senRimedaj = rezulto.senRimedaj ?? [];
    expect(senRimedaj).toHaveLength(PLANO.ekranoj.length * k8.kombinacioj.length);
    expect(rezulto.restantaj).toEqual([]);
    const md = legi(dir, "raporto.md");
    const titoloj = [...md.matchAll(/^## .*$/gm)].map((m) => m[0]);
    expect(titoloj.indexOf(TITOLO)).toBe(titoloj.indexOf("## Verbleibende Abweichungen") + 1);
    const sekcio = md.slice(md.indexOf(TITOLO), md.indexOf("## Lücken (Teil 3)"));
    expect(sekcio).toContain("| Screen | Regel | Ort | Grund |");
    for (const a of senRimedaj) {
      expect(sekcio).toContain(`| ${a.ekrano} | ${a.regulo} | ${a.loko} | ${a.kialo} |`);
    }
    const teksto = legi(dir, "raporto.json");
    expect(teksto).toBe(stabilaJson(JSON.parse(teksto)));
    expect(JSON.parse(teksto).senRimedaj).toEqual(senRimedaj);
  });

  it("has no such section and no such list without entries", async () => {
    const { dir, rezulto } = await kuro({ nomo: "sen-sen-rimedoj" });
    expect(rezulto.senRimedaj).toBeUndefined();
    expect(legi(dir, "raporto.md")).not.toContain(TITOLO);
    expect("senRimedaj" in JSON.parse(legi(dir, "raporto.json"))).toBe(false);
  });
});

// Spec 038 Lauf 3 (3.4c, AC-8, C-6, D-S038-21-1): the effort per screen and round and K8 per
// screen in the report. Pure where it can be: a hand-made result of two screens and two rounds.
describe("tokens per screen and round, the K8 column (3.4c, AC-8)", () => {
  const TABELO = "### Tokens je Screen und Runde";
  const ZAEHLER = ["inputTokens", "outputTokens", "requests", "toolCalls"] as const;
  const plano: Plano = {
    celo: "Standards verwalten",
    ekranoj: [
      { slug: "liste", titolo: "Liste", celo: "Alle Standards zeigen" },
      { slug: "detail", titolo: "Detail", celo: "Einen Standard zeigen" },
    ],
    kantoj: [{ de: "liste", al: "detail" }],
  };
  const nav = { kompleta: true, mankantaj: [], mortaj: [] };
  const verda: RondoEkrano = {
    taksado: { k: { K1: 1, K2: 1, K3: 1, K4: 1, K5: 1, K6: null }, total: 1, mankoj: [] },
    malobservoj: [],
    navigado: nav,
    verda: true,
    malhelpoj: [],
  };
  const malverda: RondoEkrano = {
    taksado: {
      k: { K1: 1, K2: 1, K3: 1, K4: 1, K5: 0, K6: null },
      total: 0.7,
      mankoj: [{ kind: "raw-value", key: "color" }],
    },
    malobservoj: [],
    navigado: nav,
    verda: false,
    malhelpoj: ["K5"],
  };
  const penoDe = (
    inputTokens: number,
    outputTokens: number,
    requests: number,
    toolCalls: number,
  ): Peno => ({ inputTokens, outputTokens, requests, toolCalls, ms: 100, bytes: 300 });
  const k8De = (kvoto: number, plena: boolean): TaksadoK8Rezulto => ({
    kvoto,
    kombinacioj: [],
    mankoj: [],
    plena,
  });
  const LAUFO: Peno = {
    inputTokens: 5000,
    outputTokens: 900,
    toolCalls: 7,
    requests: 4,
    ms: 1234,
    bytes: 2048,
  };

  /**
   * A result as before C-6 (no `peno` per screen and round, no `k8`), or with both. Round 2
   * carries liste forward (D-26): it has no `peno` in either form.
   */
  function rezultoDe(nova: boolean): EkranojRezulto {
    const kun = (stato: RondoEkrano, peno: Peno, k8?: TaksadoK8Rezulto): RondoEkrano =>
      nova
        ? {
            ...stato,
            peno,
            ...(k8 === undefined ? {} : { taksado: { ...stato.taksado, k8 } }),
          }
        : stato;
    return {
      dir: "/tmp/malnova",
      plano,
      rondoj: [
        {
          liste: kun(verda, penoDe(1000, 200, 1, 2)),
          detail: kun(malverda, penoDe(1500, 250, 1, 3), k8De(0.75, false)),
        },
        {
          liste: { ...verda, verdaEkde: 1 },
          detail: kun(verda, penoDe(1200, 150, 1, 2), k8De(1, true)),
        },
      ],
      restantaj: [],
      mankoj: [],
      peno: LAUFO,
      kosto: { usd: 0.0123 },
      faritajRondoj: 2,
    };
  }
  const raportoKun = (nova: boolean): RaportoJson =>
    raportoDe({
      id: "malnova",
      enigo: { frazo: plano.celo, marko: "komuna", out: "/tmp/malnova", maksTokenoj: 1_000_000 },
      varianto: "F",
      lingvo: "de",
      commit: "0123abc",
      bildigilo: true,
      rezulto: rezultoDe(nova),
      bildoj: [],
    });

  /** The rows of the table „Tokens je Screen und Runde“ as cells, without head and rule. */
  function vicojDe(md: string): string[][] {
    const komenco = md.indexOf(`\n${TABELO}\n`);
    expect(komenco).toBeGreaterThan(0);
    const sekcio = md.slice(komenco, md.indexOf("\n## Halt\n"));
    return sekcio
      .split("\n")
      .filter((linio) => linio.startsWith("| ") && !linio.startsWith("| Screen |"))
      .map((linio) =>
        linio
          .slice(2, -2)
          .split(" | ")
          .map((cxelo) => cxelo.trim()),
      );
  }

  it("carries peno per screen and round only for built screens, and the plan effort as its own field: Σ + plan = run", async () => {
    const { dir, rezulto } = await kuro({ nomo: "peno-je-ekrano" });
    const teksto = legi(dir, "raporto.json");
    expect(teksto).toBe(stabilaJson(JSON.parse(teksto)));
    const json = JSON.parse(teksto) as RaportoJson;
    let konstruitaj = 0;
    const sumo = { inputTokens: 0, outputTokens: 0, requests: 0, toolCalls: 0 };
    json.rondoj.forEach((rondo, index) => {
      for (const [slug, ekrano] of Object.entries(rondo.ekranoj)) {
        // Path rondoj[n].ekranoj[slug].peno, exactly the build's effort of that round (C-6).
        expect(ekrano.peno, `${rondo.n} ${slug}`).toEqual(rezulto.rondoj[index]?.[slug]?.peno);
        if (ekrano.peno === undefined) continue;
        konstruitaj += 1;
        for (const z of ZAEHLER) sumo[z] += ekrano.peno[z];
      }
    });
    // verdaEkde(2): rounds 1 and 2 are built for every screen, round 3 is carried (D-26).
    expect(konstruitaj).toBe(PLANO.ekranoj.length * 2);
    expect(json.rondoj[2]?.farita).toBe(false);
    expect(Object.values(json.rondoj[2]?.ekranoj ?? {}).some((e) => "peno" in e)).toBe(false);
    const plano = json.penoPlano;
    expect(plano).toBeDefined();
    expect(Object.keys(plano ?? {})).toEqual([...ZAEHLER].sort());
    for (const z of ZAEHLER) expect(sumo[z] + (plano?.[z] ?? Number.NaN), z).toBe(json.peno[z]);
    // The plan comes with the input here, so there is no plan request: the plan row is 0.
    for (const z of ZAEHLER) expect(plano?.[z], z).toBe(0);
  });

  it("shows the table with one row per built screen and round, a plan row and a sum row equal to the run totals", async () => {
    const { dir } = await kuro({ nomo: "peno-tabelo" });
    const md = legi(dir, "raporto.md");
    const json = JSON.parse(legi(dir, "raporto.json")) as RaportoJson;
    expect(md).toContain(
      "| Screen | Runde | Tokens ein | Tokens aus | Anfragen | Werkzeugaufrufe |",
    );
    // Rows by round, then in plan order (the keys of raporto.json are sorted, the table is not).
    const atendataj = json.rondoj.flatMap((rondo) =>
      PLANO.ekranoj.flatMap(({ slug }) => {
        const e = rondo.ekranoj[slug];
        return e?.peno === undefined
          ? []
          : [
              [
                slug,
                String(rondo.n),
                ...[e.peno.inputTokens, e.peno.outputTokens, e.peno.requests, e.peno.toolCalls].map(
                  String,
                ),
              ],
            ];
      }),
    );
    const p = json.penoPlano;
    const vicoj = vicojDe(md);
    expect(vicoj).toEqual([
      ...atendataj,
      ["Plan", "–", ...[p?.inputTokens, p?.outputTokens, p?.requests, p?.toolCalls].map(String)],
      [
        "Summe",
        "–",
        ...[
          json.peno.inputTokens,
          json.peno.outputTokens,
          json.peno.requests,
          json.peno.toolCalls,
        ].map(String),
      ],
    ]);
    // The sum row is the column sum of the screen rows and the plan row, and the run's totals.
    const summe = vicoj.at(-1) ?? [];
    for (let i = 2; i < 6; i += 1) {
      const kolumno = vicoj.slice(0, -1).reduce((s, vico) => s + Number(vico[i]), 0);
      expect(kolumno, `Spalte ${i}`).toBe(Number(summe[i]));
    }
    expect(md).toContain(`- Tokens ein: ${summe[2]}`);
    expect(md).toContain(`- Tokens aus: ${summe[3]}`);
    expect(md).toContain(`- Anfragen: ${summe[4]}`);
    expect(md).toContain(`- Werkzeugaufrufe: ${summe[5]}`);
  });

  it("leaves a screen carried forward without peno and without a row (D-26)", () => {
    const raporto = raportoKun(true);
    expect(raporto.rondoj[1]?.ekranoj.liste?.verdaEkde).toBe(1);
    expect("peno" in (raporto.rondoj[1]?.ekranoj.liste ?? {})).toBe(false);
    expect(raporto.rondoj[1]?.ekranoj.detail?.peno).toEqual(penoDe(1200, 150, 1, 2));
    expect(raporto.penoPlano).toEqual({
      inputTokens: 5000 - 1000 - 1500 - 1200,
      outputTokens: 900 - 200 - 250 - 150,
      requests: 4 - 3,
      toolCalls: 7 - 7,
    });
    expect(vicojDe(raportoMarkdown(raporto))).toEqual([
      ["liste", "1", "1000", "200", "1", "2"],
      ["detail", "1", "1500", "250", "1", "3"],
      ["detail", "2", "1200", "150", "1", "2"],
      ["Plan", "–", "1300", "300", "1", "0"],
      ["Summe", "–", "5000", "900", "4", "7"],
    ]);
  });

  it("adds a K8 column to every round table: share and „vollständig“/„nicht vollständig“, or „nicht geprüft“", () => {
    const raporto = raportoKun(true);
    expect(raporto.rondoj[0]?.ekranoj.detail?.k8).toEqual({ kvoto: 0.75, plena: false });
    expect(raporto.rondoj[1]?.ekranoj.detail?.k8).toEqual({ kvoto: 1, plena: true });
    expect("k8" in (raporto.rondoj[0]?.ekranoj.liste ?? {})).toBe(false);
    const md = raportoMarkdown(raporto);
    const kapo =
      "| Screen | K1 | K2 | K3 | K4 | K5 | K6 | Total | K7 Bytes | check_usage | axe hell | axe dunkel | Navigation | grün | K8 |";
    expect(md.split(`${kapo}\n|${"---|".repeat(15)}\n`)).toHaveLength(3);
    const k8Cxeloj = md
      .slice(0, md.indexOf("## Verbleibende Abweichungen"))
      .split("\n")
      .filter((linio) => /^\| (liste|detail) \| \d/.test(linio))
      .map((linio) => linio.slice(2, -2).split(" | ").at(-1));
    expect(k8Cxeloj).toEqual([
      "nicht geprüft",
      "0.75, nicht vollständig",
      "nicht geprüft",
      "1, vollständig",
    ]);
  });

  it("gives byte-identical raporto.md and raporto.json on two calls", () => {
    const a = raportoKun(true);
    const b = raportoKun(true);
    expect(stabilaJson(b)).toBe(stabilaJson(a));
    expect(raportoMarkdown(b)).toBe(raportoMarkdown(a));
    expect(stabilaJson(a)).toContain('"penoPlano"');
  });

  // The output of today (6d987c8e) for the old result, byte for byte. The only allowed
  // differences are the two additions of S038-21, stated here: the K8 column („nicht geprüft“)
  // at the end of every round table, and the (empty) table „Tokens je Screen und Runde“ with one
  // sentence at the end of „Aufwand und Kosten“. raporto.json stays byte-identical.
  const HEUTE = [
    "<!-- Generated by @fundamento/ekranoj (Spec 037): report of one run. Do not edit. -->",
    "# Bericht malnova",
    "",
    "## Eingabe",
    "",
    "- Satz: Standards verwalten",
    "- Marke: komuna",
    "- Commit: 0123abc",
    "- Variante: F",
    "- Sprache: de",
    "- Tokengrenze: 1000000",
    "",
    "## Screens",
    "",
    "Ziel des Ablaufs: Standards verwalten",
    "",
    "| # | Screen | Titel | Zweck | Datei | Stand |",
    "|---|---|---|---|---|---|",
    "| 1 | liste | Liste | Alle Standards zeigen | – | nicht gebaut |",
    "| 2 | detail | Detail | Einen Standard zeigen | – | nicht gebaut |",
    "",
    "Übergänge (Plan): liste → detail",
    "",
    "## Verwendete Eroj und Sxablonoj",
    "",
    "Keine Eroj oder Sxablonoj (fm-*) in den Screens.",
    "",
    "## Ergebnis je Runde",
    "",
    "K1–K6 aus der Bewertung (– = gilt nicht), K7 als Bytes des Markups; check_usage als Fehler/Hinweise; axe (WCAG 2.2 A/AA) als Zahl der verletzten Regeln je Modus; Navigation nach D-05.",
    "",
    "### Runde 1",
    "",
    "| Screen | K1 | K2 | K3 | K4 | K5 | K6 | Total | K7 Bytes | check_usage | axe hell | axe dunkel | Navigation | grün |",
    "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|",
    "| liste | 1 | 1 | 1 | 1 | 1 | – | 1 | – | 0 Fehler, 0 Hinweise | nicht geprüft | nicht geprüft | vollständig | ja |",
    "| detail | 1 | 1 | 1 | 1 | 0 | – | 0.7 | – | 0 Fehler, 0 Hinweise | nicht geprüft | nicht geprüft | vollständig | nein |",
    "",
    "Navigation (D-05): Anteil 1 · fehlende Übergänge: keine · tote Verweise: keine",
    "",
    "check_usage: keine Verstöße.",
    "",
    "### Runde 2",
    "",
    "| Screen | K1 | K2 | K3 | K4 | K5 | K6 | Total | K7 Bytes | check_usage | axe hell | axe dunkel | Navigation | grün |",
    "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|",
    "| liste | 1 | 1 | 1 | 1 | 1 | – | 1 | – | 0 Fehler, 0 Hinweise | nicht geprüft | nicht geprüft | vollständig | grün seit Runde 1 |",
    "| detail | 1 | 1 | 1 | 1 | 1 | – | 1 | – | 0 Fehler, 0 Hinweise | nicht geprüft | nicht geprüft | vollständig | ja |",
    "",
    "Navigation (D-05): Anteil 1 · fehlende Übergänge: keine · tote Verweise: keine",
    "",
    "check_usage: keine Verstöße.",
    "",
    "## Verbleibende Abweichungen",
    "",
    "Keine.",
    "",
    "## Lücken (Teil 3)",
    "",
    "| # | Art | Lücke | Anzahl | Aufgaben | Beispielstelle | Vorschlag | Ziel |",
    "|---|---|---|---|---|---|---|---|",
    "| – | – | keine Lücke | 0 | – | – | – | – |",
    "",
    "## Aufwand und Kosten",
    "",
    "- Tokens ein: 5000",
    "- Tokens aus: 900",
    "- Anfragen: 4",
    "- Werkzeugaufrufe: 7",
    "- Bytes (Markup): 2048",
    "- Kosten: 0.012300 $",
    "- Dauer: 1234 ms",
    "",
    "## Halt",
    "",
    "- Haltgrund: Höchstzahl von 3 Runden erreicht, nicht alle Screens grün.",
    "- Gebaute Runden: 2 von 3",
    "",
  ].join("\n");

  it("gives an old result without peno and k8 the output of before, plus only the empty table and the K8 column", () => {
    const raporto = raportoKun(false);
    // raporto.json: byte-identical to before – no peno per screen, no k8, no penoPlano.
    const json = stabilaJson(raporto);
    expect(json).not.toMatch(/"penoPlano"|"k8"/);
    expect(json.match(/"peno":/g)).toHaveLength(1);
    // The same result with peno and k8 gives the same JSON once the three new keys are removed.
    const nova = JSON.parse(stabilaJson(raportoKun(true))) as RaportoJson;
    delete nova.penoPlano;
    for (const rondo of nova.rondoj) {
      for (const ekrano of Object.values(rondo.ekranoj)) {
        delete ekrano.peno;
        delete ekrano.k8;
      }
    }
    expect(stabilaJson(nova)).toBe(json);

    // raporto.md: the two additions, then byte for byte the output of before.
    const md = raportoMarkdown(raporto);
    const malplena = `${TABELO}\n\nKein Aufwand je Screen und Runde erfasst.\n\n`;
    expect(md.split(malplena)).toHaveLength(2);
    const k8Kapo = " K8 |";
    const vicoj = md.split("\n");
    const tabeloj = vicoj.filter((linio) => linio.startsWith("| Screen | K1 |"));
    expect(tabeloj).toHaveLength(2);
    for (const kapo of tabeloj) expect(kapo.endsWith(`| grün |${k8Kapo}`)).toBe(true);
    const sen = vicoj
      .map((linio) => {
        if (linio.startsWith("| Screen | K1 |")) return linio.slice(0, -k8Kapo.length);
        if (linio === `|${"---|".repeat(15)}`) return `|${"---|".repeat(14)}`;
        if (/^\| (liste|detail) \| \d/.test(linio)) {
          expect(linio.endsWith(" nicht geprüft |")).toBe(true);
          return linio.slice(0, -" nicht geprüft |".length);
        }
        return linio;
      })
      .join("\n")
      .replace(malplena, "");
    expect(sen).toBe(HEUTE);
  });
});
