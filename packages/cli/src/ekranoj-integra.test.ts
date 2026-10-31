// `fm ekranoj` against the integrated result (Spec 037, S037-13): the command through its factory
// with a scripted chat model and a renderer double (no browser, no provider, no network), but the
// **real** Gvidanto – this cli's `fm mcp` as a child process over stdio – and, where the criterion
// is about them, the real scorer (nordstelo `ekranoTaksilo`) and the real brand build (projekcioj).
// Covers AC-6 (folder, ≤ 5 screens, overview, report), AC-7 pure (fragments brand-free and equal
// across brands), AC-8 (never green → exactly 3 rounds, every deviation with rule and reason),
// AC-9 (--max-tokens → partial report, exit 0, file:// links), V-2 and the model guard (nothing
// starts), and that no key reaches any output. Contents neutral and invented.

import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  type Bildigilo,
  type BildigoRezulto,
  type ChatMessage,
  type ChatModel,
  type ChatRespondo,
  type EkranaDokumento,
  FRAGMENTO_FINO,
  FRAGMENTO_KOMENCO,
  fragmentoEl,
  type GvidantoKonekto,
  konektiGvidanton,
  MAKS_EKRANOJ,
  MAKS_RONDOJ,
  type Marko,
  SISTEMO_F,
  statikaFakto,
  type Taksado,
  type Taksilo,
  type ToolInfo,
} from "@fundamento/ekranoj";
import { describe, expect, it } from "vitest";
import type { CliContext } from "./command.js";
import { type EkranojMedio, ekranojKomando } from "./commands/ekranoj.js";

const built = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const repoRoot = dirname(dirname(fileURLToPath(new URL("..", import.meta.url))));
const PROVO = join(
  repoRoot,
  "packages/modelo/test/fixtures/valid/aspekto-provo/fundamento.config.json",
);
const FRAZO = "Eine Verwaltung für Standards mit Liste, Detail, Bearbeiten und Einstellungen";
/** The key of the .env double: invented; it must reach no output and no file. */
const SXLOSILO = "attrappe-schluessel-integra-0815";
const MODELO = "mistral/ministral-14b-2512";
/** Screen names the scripted agent plans from, in its order (six: one over the limit). */
const NOMOJ = ["liste", "detail", "bearbeiten", "verlauf", "einstellungen", "hilfe"];
/** Tokens one scripted request costs. */
const PETO = { input: 1_000, output: 100 };

const respondo = (content: string): ChatRespondo => ({
  message: { role: "assistant", content },
  ...PETO,
  requests: 1,
});

/**
 * A scripted agent. The plan request gets six screens in a chain (or the user's names); a build
 * asks the real Gvidanto once (`get_ero` of the link Ero) and then answers with a fragment of
 * Eroj that links its planned targets through `fm-ligilo to`. No style, no values, no brand.
 */
class Agento implements ChatModel {
  readonly modelo = MODELO;
  readonly petoj: { messages: ChatMessage[]; tools?: string[] }[] = [];

  async send(messages: readonly ChatMessage[], tools?: readonly ToolInfo[]): Promise<ChatRespondo> {
    this.petoj.push({
      messages: messages.map((m) => ({ ...m })),
      ...(tools === undefined ? {} : { tools: tools.map((t) => t.name) }),
    });
    const tasko = messages.find((m) => m.role === "user")?.content ?? "";
    if (tasko.startsWith("Satz:")) {
      const nomitaj = [...tasko.matchAll(/^- ([a-z0-9-]+):/gm)].map((m) => m[1] ?? "");
      const slugoj = nomitaj.length > 0 ? nomitaj : NOMOJ;
      const plano = {
        celo: "Standards wie Standard A-12 für Team Nord verwalten",
        ekranoj: slugoj.map((slug) => ({ slug, titolo: slug, celo: `Team Nord: ${slug}` })),
        kantoj: slugoj.slice(1).map((al, i) => ({ de: slugoj[i] ?? "", al })),
      };
      return respondo(`\`\`\`json\n${JSON.stringify(plano)}\n\`\`\``);
    }
    if (tools !== undefined && !messages.some((m) => m.role === "tool")) {
      return {
        message: {
          role: "assistant",
          content: "",
          tool_calls: [
            {
              id: "voko-1",
              type: "function",
              function: { name: "get_ero", arguments: JSON.stringify({ name: "ligilo" }) },
            },
          ],
        },
        ...PETO,
        requests: 1,
      };
    }
    const slug = /Baue jetzt den Screen „[^“]*“ \(([a-z0-9-]+)\.html\)/.exec(tasko)?.[1] ?? "x";
    const celoj = /Laut Plan verweist dieser Screen auf: ([^\n]*)\./.exec(tasko)?.[1] ?? "";
    const ligiloj = celoj
      .split(", ")
      .filter((celo) => celo !== "")
      .map((celo) => `<fm-ligilo to="${celo}" placement="standalone">${celo}</fm-ligilo>`)
      .join("");
    return respondo(
      [
        "```html",
        `<main><fm-titolo level="1">${slug}</fm-titolo><p>Standard A-12 für Team Nord</p><nav aria-label="Ablauf">${ligiloj}</nav></main>`,
        "```",
      ].join("\n"),
    );
  }
}

/** A renderer double: the facts of the fragment as written, light and dark without axe findings. */
class BildigiloDouble implements Bildigilo {
  readonly dokumentoj: EkranaDokumento[] = [];

  async render(
    dokumento: EkranaDokumento,
    opcioj: { aspektoj: readonly string[] },
  ): Promise<BildigoRezulto> {
    this.dokumentoj.push(dokumento);
    const fakto = statikaFakto(fragmentoEl(dokumento.html) ?? "", "de");
    return {
      fakto: {
        ...fakto,
        renders: opcioj.aspektoj.flatMap((aspekto) =>
          (["light", "dark"] as const).map((scheme) => ({
            aspekto,
            scheme,
            contrast: "default" as const,
            axe: [],
          })),
        ),
      },
      bildoj: {
        hela: new Uint8Array([137, 80, 78, 71]),
        malhela: new Uint8Array([137, 80, 78, 71]),
      },
    };
  }

  async close(): Promise<void> {}
}

/** Never green: K5 = 0 with two gaps (AC-8). */
const NENIAM_VERDA: Taksilo = {
  taksi: (): Taksado => ({
    k: { K1: 1, K2: 1, K3: 1, K4: 1, K5: 0, K6: null },
    total: 70,
    mankoj: [
      { kind: "raw-value", key: "color" },
      { kind: "rebuilt-ero", key: "button" },
    ],
  }),
};

/** A small brand build: one stylesheet (for the tests that are not about the brand). */
function etaMarko(): Marko {
  return {
    async konstrui(dir) {
      await mkdir(join(dir, "css"), { recursive: true });
      writeFileSync(join(dir, "css", "fundamento.css"), ":root { --fm-provo: 1px; }\n");
      return { css: ["css/fundamento.css"] };
    },
  };
}

interface Spuro {
  babiloj: number;
  gvidantoj: number;
}

interface Opcioj {
  env?: string;
  taksilo?: "reala" | Taksilo;
  marko?: "reala" | Marko;
}

/** The command in a fresh folder: real Gvidanto (counted), scripted agent, renderer double. */
function arangxo(opcioj: Opcioj = {}) {
  const baseDir = mkdtempSync(join(tmpdir(), "fm-ekranoj-integra-"));
  writeFileSync(
    join(baseDir, ".env"),
    opcioj.env ??
      `FM_KI_ANBIETER=mistral\nFM_KI_MODELL=ministral-14b-2512\nMISTRAL_API_KEY=${SXLOSILO}\n`,
  );
  const agento = new Agento();
  const bildigilo = new BildigiloDouble();
  const spuro: Spuro = { babiloj: 0, gvidantoj: 0 };
  const taksilo = opcioj.taksilo === "reala" ? undefined : (opcioj.taksilo ?? NENIAM_VERDA);
  const marko = opcioj.marko === "reala" ? undefined : (opcioj.marko ?? etaMarko());
  const medio: Partial<EkranojMedio> = {
    tty: () => false,
    chat: (e) => {
      spuro.babiloj += 1;
      // A log line that repeats the key: printed only redacted.
      e.log(`Probe der Schwärzung: ${SXLOSILO}`);
      return agento;
    },
    // The registered command's wiring with the built entry (from the sources `../index.js` is
    // the TypeScript file): `node dist/index.js mcp [--config <cfg>]` over stdio.
    gvidanto: ({ config, log }): Promise<GvidantoKonekto> => {
      spuro.gvidantoj += 1;
      return konektiGvidanton(
        {
          command: process.execPath,
          args: [built, "mcp", ...(config === undefined ? [] : ["--config", config])],
        },
        { log },
      );
    },
    // Not given: the registered command's own (nordstelo's scorer, the projekcioj brand build).
    ...(taksilo === undefined ? {} : { taksilo: () => taksilo }),
    ...(marko === undefined ? {} : { marko: () => marko }),
    bildigilo: async () => bildigilo,
    nun: () => new Date("2026-10-31T12:00:00Z"),
    commit: () => "abc1234",
  };
  const komando = ekranojKomando(medio);
  return {
    baseDir,
    agento,
    bildigilo,
    spuro,
    kuri: async (args: readonly string[]) => {
      const stdout: string[] = [];
      const stderr: string[] = [];
      const context: CliContext = {
        version: "0.2.0",
        baseDir,
        stdout: (teksto) => stdout.push(teksto),
        stderr: (teksto) => stderr.push(teksto),
      };
      const code = await komando.run(args, context);
      return { code, stdout: stdout.join(""), stderr: stderr.join("") };
    },
  };
}

/** Every file below a folder, relative and sorted. */
function dosieroj(dir: string): string[] {
  if (!existsSync(dir)) return [];
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

const legi = (dir: string, dosiero: string): string => readFileSync(join(dir, dosiero), "utf8");

/** Exit 0; on failure the diff shows the exit code and what the command wrote to stderr. */
function sukcesa(run: { code: number; stderr: string }): void {
  expect({ code: run.code, stderr: run.stderr }).toEqual({
    code: 0,
    stderr: expect.any(String),
  });
}

interface Raporto {
  plano: { ekranoj: { slug: string }[]; kantoj: { de: string; al: string }[] };
  rondoj: {
    n: number;
    ekranoj: Record<
      string,
      { malobservoj: unknown[]; navigado: { kompleta: boolean }; verda: boolean }
    >;
  }[];
  restantaj: { ekrano: string; regulo: string; loko: string; kialo: string }[];
  haltigo: string | null;
  haltigoTeksto: string;
  faritajRondoj: number;
  notoj: string[];
}

const raportoDe = (dir: string): Raporto => JSON.parse(legi(dir, "raporto.json")) as Raporto;

/** The sections Lieferliste 1.6 asks of raporto.md, in order. */
const SEKCIOJ = [
  "## Eingabe",
  "## Screens",
  "## Verwendete Eroj und Sxablonoj",
  "## Ergebnis je Runde",
  "## Verbleibende Abweichungen",
  "## Lücken (Teil 3)",
  "## Aufwand und Kosten",
  "## Halt",
];

describe("fm ekranoj with the real Gvidanto: the run folder (AC-6)", () => {
  it("builds at most five screens into the folder of §2.4, the overview links every screen and the report has every section", async () => {
    const a = arangxo({ taksilo: "reala", marko: "reala" });
    const out = join(a.baseDir, "lauf");
    const run = await a.kuri([FRAZO, "--out", out, "--ja"]);
    sukcesa(run);

    // The agent planned six screens twice: the run keeps the first five (V-2, D-38).
    const raporto = raportoDe(out);
    const slugoj = raporto.plano.ekranoj.map((ekrano) => ekrano.slug);
    // V-2 fixes the limit at 5 (spec value, not derived).
    expect(MAKS_EKRANOJ).toBe(5);
    expect(slugoj).toEqual(NOMOJ.slice(0, 5));
    expect(raporto.notoj.join("\n")).toMatch(/gekürzt auf die ersten 5/);

    const cxiuj = dosieroj(out);
    const atendataj = [
      "plano.json",
      "superrigardo.html",
      "raporto.md",
      "raporto.json",
      "mankoj.json",
      "marko/css/fundamento.css",
      ...slugoj.map((slug) => `ekranoj/${slug}.html`),
      ...slugoj.flatMap((slug) => [`bildoj/${slug}-hela.png`, `bildoj/${slug}-malhela.png`]),
      ...raporto.rondoj.flatMap((rondo) =>
        Object.keys(rondo.ekranoj).flatMap((slug) => [
          `rondoj/${rondo.n}/${slug}.html`,
          `rondoj/${rondo.n}/${slug}.fakto.json`,
        ]),
      ),
    ];
    expect(
      cxiuj.filter((dosiero) => !atendataj.includes(dosiero) && !dosiero.startsWith("marko/")),
    ).toEqual([]);
    expect(atendataj.filter((dosiero) => !cxiuj.includes(dosiero))).toEqual([]);
    expect(cxiuj.filter((dosiero) => dosiero.startsWith("ekranoj/"))).toHaveLength(5);
    expect(JSON.parse(legi(out, "plano.json"))).toEqual(raporto.plano);

    // The overview links every screen and the report, and every local link resolves.
    const superrigardo = legi(out, "superrigardo.html");
    const ligiloj = [...superrigardo.matchAll(/href="([^"#]+)"/g)].map((m) => m[1] ?? "");
    for (const slug of slugoj) expect(ligiloj).toContain(`ekranoj/${slug}.html`);
    expect(ligiloj).toContain("raporto.md");
    const mortaj = ligiloj.filter((ligilo) => !existsSync(resolve(out, ligilo)));
    expect(mortaj).toEqual([]);

    // Every section of Lieferliste 1.6, in order, with what each must hold.
    const md = legi(out, "raporto.md");
    const lokoj = SEKCIOJ.map((sekcio) => md.indexOf(`\n${sekcio}\n`));
    expect(lokoj.every((loko) => loko > 0)).toBe(true);
    expect([...lokoj].sort((x, y) => x - y)).toEqual(lokoj);
    for (const ero of [
      `- Satz: ${FRAZO}`,
      "- Marke: komuna",
      "- Commit: abc1234",
      "### Runde 1",
      "| Screen | K1 | K2 | K3 | K4 | K5 | K6 | Total | K7 Bytes | check_usage | axe hell | axe dunkel | Navigation | grün |",
      "Navigation (D-05): Anteil",
      "- Tokens ein: ",
      "- Tokens aus: ",
      "- Kosten: ",
      "- Dauer: ",
      "- Haltgrund: ",
    ]) {
      expect(md, ero).toContain(ero);
    }
    expect(run.stdout).toContain(pathToFileURL(join(out, "superrigardo.html")).href);
    expect(run.stdout).toContain(pathToFileURL(join(out, "raporto.md")).href);

    // With the real scorer and the real Gvidanto the Eroj-only fragments are green in round 1
    // (D-04: K1, check_usage, axe light and dark, K5, the fm-ligilo edges); rounds 2 and 3 are
    // carried forward (D-26).
    expect(
      raporto.rondoj[0] && Object.values(raporto.rondoj[0].ekranoj).map((e) => e.verda),
    ).toEqual(slugoj.map(() => true));
    expect(raporto.haltigoTeksto).toBe("Alle Screens grün nach Runde 1.");
  });

  it("asks the real Gvidanto: its tools, its prompt, get_ero and check_usage answer from the Modelo", async () => {
    const a = arangxo({ taksilo: "reala" });
    const out = join(a.baseDir, "lauf");
    const run = await a.kuri([FRAZO, "--ekranoj", "liste,detail", "--out", out, "--ja"]);
    sukcesa(run);
    expect(a.spuro.gvidantoj).toBe(1);
    const konstruo = a.agento.petoj.find((peto) => peto.tools !== undefined);
    // The build tools of the Gvidanto, never a tool of the brand workshop.
    expect(konstruo?.tools).toEqual(expect.arrayContaining(["get_ero", "check_usage", "describe"]));
    for (const skriba of ["save_agordo", "preview_agordo", "propose_agordo"]) {
      expect(konstruo?.tools).not.toContain(skriba);
    }
    // The system text: the fragment rules, then the Gvidanto's own prompt `gvidanto`.
    const gvidanto = await konektiGvidanton({ command: process.execPath, args: [built, "mcp"] });
    const prompt = await gvidanto.ponto.prompt?.();
    await gvidanto.fermi();
    expect((prompt ?? "").length).toBeGreaterThan(0);
    expect(konstruo?.messages[0]).toEqual({ role: "system", content: `${SISTEMO_F}\n\n${prompt}` });
    // get_ero of the link Ero, answered by the Modelo: the target prop `to`.
    const respondo = a.agento.petoj
      .flatMap((peto) => peto.messages)
      .find((m) => m.role === "tool")?.content;
    expect(respondo).toContain('"to"');
    // check_usage ran per screen and round; the link Ero counts as the planned edge (navigation).
    const raporto = raportoDe(out);
    expect(raporto.rondoj[0]?.ekranoj.liste?.navigado.kompleta).toBe(true);
    expect(Array.isArray(raporto.rondoj[0]?.ekranoj.liste?.malobservoj)).toBe(true);
  });
});

describe("fm ekranoj with the real brand builds: the agent's markup is brand-free (AC-7, pure)", () => {
  /** Every fragment of a run folder (final screens and rounds), by its path. */
  function fragmentoj(dir: string): Map<string, string> {
    const mapo = new Map<string, string>();
    for (const dosiero of dosieroj(dir)) {
      if (!/^(ekranoj|rondoj\/\d+)\/[a-z0-9-]+\.html$/.test(dosiero)) continue;
      const fragmento = fragmentoEl(legi(dir, dosiero));
      if (fragmento !== undefined) mapo.set(dosiero, fragmento);
    }
    return mapo;
  }

  /** The values of the brand's custom properties in its stylesheet (read, not typed). */
  function tokenValoroj(dir: string): Set<string> {
    const css = legi(dir, "marko/css/fundamento.css");
    const valoroj = new Set<string>();
    for (const m of css.matchAll(/--fm-[\w-]+\s*:\s*([^;{}]+);/g)) {
      const valoro = (m[1] ?? "").trim();
      if (valoro.length >= 4 && !valoro.startsWith("var(") && /[#(\d]/.test(valoro)) {
        valoroj.add(valoro);
      }
    }
    return valoroj;
  }

  it("writes byte-identical fragments for komuna and provo, without colour literal, raw --fm- value or token value of either brand", async () => {
    const komuna = arangxo({ marko: "reala" });
    const provo = arangxo({ marko: "reala" });
    const kDir = join(komuna.baseDir, "lauf");
    const pDir = join(provo.baseDir, "lauf");
    const args = [FRAZO, "--ekranoj", "liste,detail", "--ja"];
    expect((await komuna.kuri([...args, "--out", kDir])).code).toBe(0);
    expect((await provo.kuri([...args, "--out", pDir, "--config", PROVO])).code).toBe(0);

    const kFragmentoj = fragmentoj(kDir);
    const pFragmentoj = fragmentoj(pDir);
    expect([...kFragmentoj.keys()]).toContain("ekranoj/liste.html");
    expect([...pFragmentoj.keys()]).toEqual([...kFragmentoj.keys()]);
    for (const [dosiero, fragmento] of kFragmentoj) {
      expect(pFragmentoj.get(dosiero), dosiero).toBe(fragmento);
    }

    // The screens differ in the brand only: the frame's Aspekto attribute; the stylesheets differ.
    for (const slug of ["liste", "detail"]) {
      const k = legi(kDir, `ekranoj/${slug}.html`);
      const p = legi(pDir, `ekranoj/${slug}.html`);
      expect(k).toContain('data-fm-aspekto="komuna"');
      expect(p).toContain('data-fm-aspekto="provo"');
      expect(p.replaceAll('data-fm-aspekto="provo"', 'data-fm-aspekto="komuna"')).toBe(k);
    }
    const kValoroj = tokenValoroj(kDir);
    const pValoroj = tokenValoroj(pDir);
    expect(kValoroj.size).toBeGreaterThan(20);
    expect([...pValoroj].filter((valoro) => !kValoroj.has(valoro)).length).toBeGreaterThan(0);

    // Nothing of a brand in any fragment: collect every finding, assert once.
    const trovoj: string[] = [];
    for (const [dosiero, fragmento] of [...kFragmentoj, ...pFragmentoj]) {
      for (const [regulo, pattern] of [
        ["colour-literal", /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab)\(/i],
        ["fm-raw-value", /--fm-[\w-]+\s*:/],
        ["style", /<style|\sstyle=/i],
      ] as const) {
        if (pattern.test(fragmento)) trovoj.push(`${dosiero} ${regulo}`);
      }
      for (const valoro of new Set([...kValoroj, ...pValoroj])) {
        if (fragmento.includes(valoro)) trovoj.push(`${dosiero} token-value ${valoro}`);
      }
      for (const marko of ["komuna", "provo"]) {
        if (fragmento.includes(marko)) trovoj.push(`${dosiero} brand-name ${marko}`);
      }
    }
    expect(trovoj).toEqual([]);
    expect(legi(kDir, "ekranoj/liste.html")).toContain(FRAGMENTO_KOMENCO);
    expect(legi(kDir, "ekranoj/liste.html")).toContain(FRAGMENTO_FINO);
  });
});

describe("fm ekranoj with the real Gvidanto: rounds and limits (AC-8, AC-9)", () => {
  it("runs exactly three rounds with a scorer that is never green, and reports every remaining deviation with rule, place and reason", async () => {
    const a = arangxo();
    const out = join(a.baseDir, "lauf");
    const run = await a.kuri([FRAZO, "--ekranoj", "liste,detail", "--out", out, "--ja"]);
    sukcesa(run);
    const raporto = raportoDe(out);
    expect(MAKS_RONDOJ).toBe(3);
    expect(raporto.faritajRondoj).toBe(MAKS_RONDOJ);
    expect(raporto.rondoj.map((rondo) => rondo.n)).toEqual([1, 2, 3]);
    expect(existsSync(join(out, "rondoj", "3", "liste.html"))).toBe(true);
    expect(existsSync(join(out, "rondoj", "4"))).toBe(false);
    expect(raporto.haltigo).toBeNull();
    expect(raporto.haltigoTeksto).toBe(
      "Höchstzahl von 3 Runden erreicht, nicht alle Screens grün.",
    );
    // One build conversation per screen and round (each: get_ero, then the answer).
    const konstruoj = a.agento.petoj.filter(
      (peto) => peto.tools !== undefined && !peto.messages.some((m) => m.role === "tool"),
    );
    expect(konstruoj).toHaveLength(2 * MAKS_RONDOJ);

    // Every finding left after round 3 is a deviation with Regel, Ort and Grund – in the report.
    const md = legi(out, "raporto.md");
    const tabelo = md.split("## Verbleibende Abweichungen")[1]?.split("\n## ")[0] ?? "";
    const vicoj = tabelo.split("\n").filter((linio) => /^\| (liste|detail) \|/.test(linio));
    expect(vicoj).toHaveLength(raporto.restantaj.length);
    expect(raporto.restantaj.map((r) => `${r.ekrano} ${r.regulo} ${r.loko}`)).toEqual(
      expect.arrayContaining([
        "liste raw-value color",
        "liste rebuilt-ero button",
        "detail raw-value color",
        "detail rebuilt-ero button",
      ]),
    );
    const malplenaj = raporto.restantaj.filter(
      (r) => r.regulo.trim() === "" || r.loko.trim() === "" || r.kialo.trim() === "",
    );
    expect(malplenaj).toEqual([]);
    for (const r of raporto.restantaj) {
      expect(vicoj, r.regulo).toContainEqual(expect.stringContaining(`| ${r.regulo} |`));
    }
  });

  it("stops at --max-tokens with a partial report that names the stop, exits 0 and prints the file:// links", async () => {
    const a = arangxo();
    const out = join(a.baseDir, "lauf");
    // 1 100 tokens a request: plan, liste (get_ero, answer) = 3 300; detail would pass 4 000.
    const run = await a.kuri([
      FRAZO,
      "--ekranoj",
      "liste,detail",
      "--max-tokens",
      "4000",
      "--out",
      out,
      "--ja",
    ]);
    sukcesa(run);
    expect(a.agento.petoj).toHaveLength(3);
    expect(run.stdout).toContain(pathToFileURL(join(out, "superrigardo.html")).href);
    expect(run.stdout).toContain(pathToFileURL(join(out, "raporto.md")).href);
    expect(run.stdout).toContain("Halt: max-tokens (Teilergebnis)");
    const raporto = raportoDe(out);
    expect(raporto.haltigo).toBe("max-tokens");
    expect(raporto.faritajRondoj).toBe(1);
    expect(raporto.restantaj).toContainEqual({
      ekrano: "detail",
      regulo: "nicht-gebaut",
      loko: "detail.html",
      kialo: "Die Tokengrenze war erreicht, bevor der Screen gebaut wurde.",
    });
    const md = legi(out, "raporto.md");
    expect(md).toContain(
      "- Haltgrund: Tokengrenze erreicht (--max-tokens) nach 1 von 3 Runden; Teilergebnis.",
    );
    expect(existsSync(join(out, "ekranoj", "liste.html"))).toBe(true);
    expect(existsSync(join(out, "ekranoj", "detail.html"))).toBe(false);
  });
});

describe("fm ekranoj: nothing starts before the input and the model agree (V-2, D-19)", () => {
  it("refuses six screen names with exit 2: no request, no Gvidanto, no folder", async () => {
    const a = arangxo();
    const run = await a.kuri([FRAZO, "--ekranoj", NOMOJ.join(","), "--ja"]);
    expect(run.code).toBe(2);
    expect(run.stderr).toContain("/ekranoj plan-too-many-screens");
    expect(a.spuro).toEqual({ babiloj: 0, gvidantoj: 0 });
    expect(a.agento.petoj).toEqual([]);
    expect(dosieroj(a.baseDir)).toEqual([".env"]);
  });

  it("refuses another model of the .env with exit 2 before any request and before the Gvidanto", async () => {
    const a = arangxo({
      env: `FM_KI_ANBIETER=mistral\nFM_KI_MODELL=mistral-large-latest\nMISTRAL_API_KEY=${SXLOSILO}\n`,
    });
    const run = await a.kuri([FRAZO, "--ekranoj", "liste", "--ja"]);
    expect(run.code).toBe(2);
    expect(run.stderr).toContain("FM_KI_MODELL model-not-allowed");
    expect(a.spuro).toEqual({ babiloj: 0, gvidantoj: 0 });
    expect(a.agento.petoj).toEqual([]);
    expect(`${run.stdout}${run.stderr}`).not.toContain(SXLOSILO);
    expect(dosieroj(a.baseDir)).toEqual([".env"]);
  });
});

describe("fm ekranoj: no key in any output (AC-14 at run level)", () => {
  it("writes the key of the .env into no file of the run and prints it nowhere", async () => {
    const a = arangxo({ taksilo: "reala" });
    const run = await a.kuri([FRAZO, "--ekranoj", "liste,detail", "--ja"]);
    sukcesa(run);
    expect(run.stderr).toContain("Probe der Schwärzung: ‹Schlüssel›");
    expect(`${run.stdout}${run.stderr}`).not.toContain(SXLOSILO);
    const skribitaj = dosieroj(a.baseDir).filter((dosiero) => dosiero !== ".env");
    expect(skribitaj.filter((dosiero) => dosiero.endsWith("raporto.json"))).toHaveLength(1);
    const kun = skribitaj.filter((dosiero) =>
      readFileSync(join(a.baseDir, dosiero)).includes(SXLOSILO),
    );
    expect(kun).toEqual([]);
  });
});
