// `fm ekranoj` (Spec 037, Lieferliste 1.1, 1.7, US-1 to US-3): one sentence and one brand become up
// to five checked screens. The command line through the built binary (help, registration), the
// command itself in-process through its factory with doubles for the chat model, the Gvidanto, the
// scorer, the brand build and without a browser – the flow in between is the real one of
// @fundamento/ekranoj. No network, no provider, no browser. Contents neutral and invented.

import { spawnSync } from "node:child_process";
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
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type {
  ChatMessage,
  ChatModel,
  ChatRespondo,
  GvidantoKonekto,
  Marko,
  Taksado,
  Taksilo,
  ToolInfo,
} from "@fundamento/ekranoj";
import { describe, expect, it } from "vitest";
import type { CliContext } from "./command.js";
import { type EkranojMedio, ekranojKomando } from "./commands/ekranoj.js";

const built = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const repoRoot = dirname(dirname(fileURLToPath(new URL("..", import.meta.url))));

function fm(args: readonly string[]) {
  const child = spawnSync(process.execPath, [built, ...args], {
    cwd: repoRoot,
    env: { ...process.env, INIT_CWD: repoRoot },
    encoding: "utf8",
  });
  return { code: child.status, stdout: child.stdout, stderr: child.stderr };
}

const FRAZO = "Eine Verwaltung für Standards mit Liste, Detail, Bearbeiten und Einstellungen";
/** The key of the .env double: invented, and it must never appear in any output or file. */
const SXLOSILO = "attrappe-schluessel-4711-nur-test";
const PERMESITA = "ministral-14b-2512";

const VERDA: Taksado = {
  k: { K1: 1, K2: 1, K3: 1, K4: 1, K5: 1, K6: null },
  total: 100,
  mankoj: [],
};

/** A scripted chat model: a plan for the plan request, a fragment with the planned links else. */
class Babilo implements ChatModel {
  readonly modelo = `mistral/${PERMESITA}`;
  readonly petoj: ChatMessage[][] = [];
  readonly #eraro: Error | undefined;

  constructor(opcioj: { eraro?: Error } = {}) {
    this.#eraro = opcioj.eraro;
  }

  async send(messages: readonly ChatMessage[]): Promise<ChatRespondo> {
    this.petoj.push([...messages]);
    if (this.#eraro !== undefined) throw this.#eraro;
    const tasko = messages.find((m) => m.role === "user")?.content ?? "";
    if (tasko.startsWith("Satz:")) {
      const slugoj = [...tasko.matchAll(/^- ([a-z0-9-]+):/gm)].map((m) => m[1] ?? "");
      const plano = {
        celo: "Standards wie Standard A-12 für Team Nord verwalten",
        ekranoj: slugoj.map((slug) => ({ slug, titolo: slug, celo: `Team Nord: ${slug}` })),
        kantoj: slugoj.flatMap((de) => slugoj.filter((al) => al !== de).map((al) => ({ de, al }))),
      };
      return respondo(`\`\`\`json\n${JSON.stringify(plano)}\n\`\`\``);
    }
    const slug = /Baue jetzt den Screen „[^“]*“ \(([a-z0-9-]+)\.html\)/.exec(tasko)?.[1] ?? "x";
    const celoj = /Laut Plan verweist dieser Screen auf: ([^\n]*)\./.exec(tasko)?.[1] ?? "";
    const ligiloj = celoj
      .split(", ")
      .filter((celo) => celo !== "")
      .map((celo) => `<a href="${celo}">${celo}</a>`)
      .join("");
    return respondo(
      `\`\`\`html\n<main><h1>${slug}</h1><p>Standard A-12</p><nav aria-label="Ablauf">${ligiloj}</nav></main>\n\`\`\``,
    );
  }
}

const respondo = (content: string): ChatRespondo => ({
  message: { role: "assistant", content },
  input: 100,
  output: 20,
  requests: 1,
});

const ilo = (name: string): ToolInfo => ({
  name,
  description: `Werkzeug ${name}`,
  inputSchema: { type: "object", properties: {} },
});

interface Spuro {
  chatFabrikoj: { ledger: string; provider: string }[];
  gvidantoj: (string | undefined)[];
  fermitaj: number;
  demandoj: string[];
  markoj: string[];
}

/** A run of the command in a fresh folder, with every heavy dependency a double. */
function arangxo(
  opcioj: { env?: string | undefined; babilo?: Babilo; tty?: boolean; jes?: boolean } = {},
) {
  const baseDir = mkdtempSync(join(tmpdir(), "fm-ekranoj-"));
  const env =
    "env" in opcioj
      ? opcioj.env
      : `FM_KI_ANBIETER=mistral\nFM_KI_MODELL=${PERMESITA}\nMISTRAL_API_KEY=${SXLOSILO}\n`;
  if (env !== undefined) writeFileSync(join(baseDir, ".env"), env);
  const babilo = opcioj.babilo ?? new Babilo();
  const spuro: Spuro = { chatFabrikoj: [], gvidantoj: [], fermitaj: 0, demandoj: [], markoj: [] };
  const stdout: string[] = [];
  const stderr: string[] = [];
  const context: CliContext = {
    version: "0.2.0",
    baseDir,
    stdout: (teksto) => stdout.push(teksto),
    stderr: (teksto) => stderr.push(teksto),
  };
  const taksilo: Taksilo = { taksi: () => VERDA };
  const marko: Marko = {
    async konstrui(dir) {
      await mkdir(join(dir, "css"), { recursive: true });
      writeFileSync(join(dir, "css", "fundamento.css"), ":root { --fm-provo: 1px; }\n");
      return { css: ["css/fundamento.css"] };
    },
  };
  const medio: Partial<EkranojMedio> = {
    tty: () => opcioj.tty ?? false,
    demandi: async (demando) => {
      spuro.demandoj.push(demando);
      return opcioj.jes ?? false;
    },
    chat: (e) => {
      spuro.chatFabrikoj.push({ ledger: e.ledger, provider: e.provider.toString() });
      // A log line that repeats the key: the command must take it out before it is printed.
      e.log(`Probe der Schwärzung: ${SXLOSILO}`);
      return babilo;
    },
    gvidanto: async (e): Promise<GvidantoKonekto> => {
      spuro.gvidantoj.push(e.config);
      return {
        ponto: {
          list: async () => ["describe", "get_ero", "check_usage", "save_agordo"].map(ilo),
          call: async () => JSON.stringify({ valid: true, violations: [] }),
          prompt: async () => "Gvidanto: frag zuerst describe.",
        },
        fermi: async () => {
          spuro.fermitaj += 1;
        },
      };
    },
    taksilo: () => taksilo,
    marko: (e) => {
      spuro.markoj.push(e.marko);
      return marko;
    },
    bildigilo: async () => undefined,
    nun: () => new Date("2026-10-31T12:00:00Z"),
    commit: () => "abc1234",
  };
  const komando = ekranojKomando(medio);
  return {
    baseDir,
    babilo,
    spuro,
    stdout,
    stderr,
    kuri: async (args: readonly string[]) => {
      const code = await komando.run(args, context);
      return { code, stdout: stdout.join(""), stderr: stderr.join("") };
    },
  };
}

/** Every file below a folder (recursive). */
function dosieroj(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((nomo) => {
    const vojo = join(dir, nomo);
    return statSync(vojo).isDirectory() ? dosieroj(vojo) : [vojo];
  });
}

describe("fm ekranoj: help and registration", () => {
  it("is listed in the top-level help", () => {
    const run = fm(["--help"]);
    expect(run.code).toBe(0);
    expect(run.stdout).toMatch(/^\s+ekranoj\s+\S/m);
  });

  it("explains its options and the sub-mode mankoj", () => {
    const run = fm(["ekranoj", "--help"]);
    expect(run.code).toBe(0);
    for (const opcio of [
      "--config",
      "--ekranoj",
      "--out",
      "--max-tokens",
      "--env",
      "--ledger",
      "--ja",
      "--json",
    ]) {
      expect(run.stdout).toContain(opcio);
    }
    expect(run.stdout).toContain('fm ekranoj "<Satz>"');
    expect(run.stdout).toContain("fm ekranoj mankoj <ordner");
    expect(run.stdout).toContain("ministral-14b-2512");
    expect(run.stdout).toMatch(/Exit/);
  });
});

describe("fm ekranoj: nothing starts before the input, the model and the user agree", () => {
  it("refuses six screen names with exit 2 and names the limit 5, before any request (V-2)", async () => {
    const a = arangxo();
    const run = await a.kuri([FRAZO, "--ekranoj", "a,b,c,d,e,f", "--ja"]);
    expect(run.code).toBe(2);
    expect(run.stderr).toContain("plan-too-many-screens");
    expect(run.stderr).toMatch(/höchstens 5/);
    expect(a.babilo.petoj).toHaveLength(0);
    expect(a.spuro.chatFabrikoj).toHaveLength(0);
    expect(a.spuro.gvidantoj).toHaveLength(0);
    expect(existsSync(join(a.baseDir, ".fundamento"))).toBe(false);
  });

  it("prints the estimate and exits 2 without --ja when there is no terminal (D-37)", async () => {
    const a = arangxo({ tty: false });
    const run = await a.kuri([FRAZO, "--ekranoj", "liste,detail"]);
    expect(run.code).toBe(2);
    expect(run.stdout).toContain("Schätzung: 2 Screens × 3 Runden");
    expect(run.stdout).toContain("$");
    expect(run.stderr).toContain("--ja");
    expect(a.babilo.petoj).toHaveLength(0);
    expect(a.spuro.gvidantoj).toHaveLength(0);
    expect(a.spuro.demandoj).toHaveLength(0);
  });

  it("asks in a terminal, and no (the default) starts nothing (D-37)", async () => {
    const a = arangxo({ tty: true, jes: false });
    const run = await a.kuri([FRAZO, "--ekranoj", "liste,detail"]);
    expect(run.code).toBe(2);
    expect(a.spuro.demandoj).toHaveLength(1);
    expect(a.spuro.demandoj[0]).toMatch(/\[j\/N\]/);
    expect(a.babilo.petoj).toHaveLength(0);
  });

  it("refuses another model of the .env with exit 2 before any request (D-19)", async () => {
    const a = arangxo({
      env: `FM_KI_ANBIETER=mistral\nFM_KI_MODELL=mistral-large-latest\nMISTRAL_API_KEY=${SXLOSILO}\n`,
    });
    const run = await a.kuri([FRAZO, "--ja"]);
    expect(run.code).toBe(2);
    expect(run.stderr).toContain("mistral/ministral-14b-2512");
    expect(run.stderr).toContain("model-not-allowed");
    expect(a.spuro.chatFabrikoj).toHaveLength(0);
    expect(a.spuro.gvidantoj).toHaveLength(0);
    expect(a.babilo.petoj).toHaveLength(0);
    expect(`${run.stdout}${run.stderr}`).not.toContain(SXLOSILO);
  });

  it("exits 2 without a .env, without a sentence, and for an unknown option", async () => {
    const senEnv = arangxo({ env: undefined });
    const sen = await senEnv.kuri([FRAZO, "--ja"]);
    expect(sen.code).toBe(2);
    expect(sen.stderr).toContain(".env");
    await expect(arangxo().kuri(["--ja"])).rejects.toThrow(/Satz/);
    await expect(arangxo().kuri([FRAZO, "--max-token", "5"])).rejects.toThrow(/Unknown option/);
    await expect(arangxo().kuri([FRAZO, "--max-tokens", "viele"])).rejects.toThrow(/max-tokens/);
  });

  it("reads a sentence that is exactly „mankoj“ as the sub-mode, never as a run (D-29)", async () => {
    const a = arangxo();
    // The sub-mode without folders is a usage error (exit 2), not a run of the sentence „mankoj“.
    await expect(a.kuri(["mankoj"])).rejects.toThrow(/mankoj <ordner/);
    expect(a.spuro.chatFabrikoj).toHaveLength(0);
    expect(a.spuro.gvidantoj).toHaveLength(0);
    expect(a.babilo.petoj).toHaveLength(0);
  });
});

describe("fm ekranoj mankoj: the Lückenliste of runs (Teil 3, D-29)", () => {
  const fiksajxoj = join(repoRoot, "packages/ekranoj/test/fixtures/mankoj");
  const kuroj = ["261031-1000-standards", "261031-1100-teams"].map((kuro) => join(fiksajxoj, kuro));
  const KAPO = "| # | Art | Lücke | Anzahl | Aufgaben | Beispielstelle | Vorschlag | Ziel |";

  it("prints the merged table of two runs and starts nothing", async () => {
    const a = arangxo();
    const run = await a.kuri(["mankoj", ...kuroj]);
    expect(run.code).toBe(0);
    const linioj = run.stdout.split("\n");
    expect(linioj).toContain(KAPO);
    const vicoj = linioj.filter((linio) => /^\| \d+ \|/.test(linio));
    const { kunigiMankojn } = await import("@fundamento/ekranoj");
    const mankoj = kunigiMankojn(kuroj);
    expect(vicoj).toHaveLength(mankoj.length);
    expect(vicoj[0]).toContain(`| ${mankoj[0]?.nomo} | ${mankoj[0]?.ofteco} |`);
    expect(a.spuro.chatFabrikoj).toHaveLength(0);
    expect(a.spuro.gvidantoj).toHaveLength(0);
    expect(a.babilo.petoj).toHaveLength(0);
  });

  it("writes the list as JSON with --out, and prints it as JSON with --json", async () => {
    const a = arangxo();
    const { kunigiMankojn, stabilaJson } = await import("@fundamento/ekranoj");
    const run = await a.kuri(["mankoj", ...kuroj, "--out", "luecken/mankoj.json"]);
    expect(run.code).toBe(0);
    const dosiero = join(a.baseDir, "luecken", "mankoj.json");
    expect(readFileSync(dosiero, "utf8")).toBe(stabilaJson(kunigiMankojn(kuroj)));
    expect(run.stdout).toContain(KAPO);
    expect(run.stdout).toContain(dosiero);

    const j = arangxo();
    const jsonRun = await j.kuri(["mankoj", ...kuroj, "--json"]);
    expect(jsonRun.code).toBe(0);
    expect(JSON.parse(jsonRun.stdout)).toEqual({ mankoj: kunigiMankojn(kuroj) });
  });

  it("exits 2 with structured problems for a folder that does not exist", async () => {
    const a = arangxo();
    const run = await a.kuri(["mankoj", kuroj[0] ?? "", "nicht-da"]);
    expect(run.code).toBe(2);
    expect(run.stderr).toMatch(/\/1 folder-missing: .*nicht-da/);
    expect(run.stdout).toBe("");
  });

  it("refuses the options of a run in the sub-mode", async () => {
    for (const opcio of [
      ["--ja"],
      ["--ekranoj", "liste"],
      ["--max-tokens", "5"],
      ["--config", "x.json"],
    ]) {
      await expect(arangxo().kuri(["mankoj", ...kuroj, ...opcio])).rejects.toThrow(
        new RegExp(`${opcio[0]}.*mankoj|mankoj.*${opcio[0]}`),
      );
    }
  });

  it("exits 2 from the command line without folders", () => {
    const run = fm(["ekranoj", "mankoj"]);
    expect(run.code).toBe(2);
    expect(run.stderr).toContain("mankoj <ordner");
  });
});

describe("fm ekranoj: a run", () => {
  it("builds the screens and ends with file:// links to the overview and the report (US-1, AC-6)", async () => {
    const a = arangxo();
    const run = await a.kuri([FRAZO, "--ekranoj", "liste,detail", "--ja"]);
    expect(run.code).toBe(0);
    const dir = join(a.baseDir, ".fundamento", "ekranoj", "261031-1200-eine-verwaltung-fuer");
    expect(run.stdout).toContain(pathToFileURL(join(dir, "superrigardo.html")).href);
    expect(run.stdout).toContain(pathToFileURL(join(dir, "raporto.md")).href);
    for (const dosiero of ["superrigardo.html", "raporto.md", "raporto.json", "plano.json"]) {
      expect(existsSync(join(dir, dosiero)), dosiero).toBe(true);
    }
    expect(existsSync(join(dir, "ekranoj", "liste.html"))).toBe(true);
    expect(existsSync(join(dir, "ekranoj", "detail.html"))).toBe(true);
    // The ledger of the requests (D-21), the brand of the default config, the Gvidanto closed.
    expect(a.spuro.chatFabrikoj).toEqual([
      { ledger: join(a.baseDir, ".fundamento", "ekranoj"), provider: `mistral/${PERMESITA}` },
    ]);
    expect(a.spuro.markoj).toEqual(["komuna"]);
    expect(a.spuro.gvidantoj).toEqual([undefined]);
    expect(a.spuro.fermitaj).toBe(1);
    const raporto = JSON.parse(readFileSync(join(dir, "raporto.json"), "utf8")) as {
      enigo: { frazo: string; marko: string; commit?: string; maksTokenoj: number };
    };
    expect(raporto.enigo).toMatchObject({ frazo: FRAZO, marko: "komuna", commit: "abc1234" });
  });

  it("passes --max-tokens through: a run stopped at the limit reports partly and exits 0 (AC-9)", async () => {
    const a = arangxo();
    const out = join(a.baseDir, "lauf");
    const run = await a.kuri([
      FRAZO,
      "--ekranoj",
      "liste,detail",
      "--max-tokens",
      "250",
      "--out",
      out,
      "--ja",
    ]);
    expect(run.code).toBe(0);
    // Plan request (120 tokens) and the first screen (120): the second would pass 250.
    expect(a.babilo.petoj).toHaveLength(2);
    expect(run.stdout).toContain(pathToFileURL(join(out, "raporto.md")).href);
    expect(run.stdout).toContain("max-tokens");
    const raporto = JSON.parse(readFileSync(join(out, "raporto.json"), "utf8")) as {
      haltigo: string | null;
      enigo: { maksTokenoj: number };
    };
    expect(raporto.haltigo).toBe("max-tokens");
    expect(raporto.enigo.maksTokenoj).toBe(250);
    expect(readFileSync(join(out, "raporto.md"), "utf8")).toContain("max-tokens");
  });

  it("exits 1 when no screen could be built, and still links the report", async () => {
    const a = arangxo({ babilo: new Babilo({ eraro: new Error("Anbieter antwortet 500") }) });
    const out = join(a.baseDir, "lauf");
    const run = await a.kuri([FRAZO, "--out", out, "--ja"]);
    expect(run.code).toBe(1);
    expect(run.stdout).toContain(pathToFileURL(join(out, "raporto.md")).href);
    expect(a.spuro.fermitaj).toBe(1);
  });

  it("prints the summary as JSON with --json", async () => {
    const a = arangxo();
    const out = join(a.baseDir, "lauf");
    const run = await a.kuri([FRAZO, "--ekranoj", "liste,detail", "--out", out, "--ja", "--json"]);
    expect(run.code).toBe(0);
    const resumo = JSON.parse(run.stdout) as Record<string, unknown>;
    expect(resumo).toMatchObject({
      dir: out,
      superrigardo: pathToFileURL(join(out, "superrigardo.html")).href,
      raporto: pathToFileURL(join(out, "raporto.md")).href,
      marko: "komuna",
      ekranoj: 2,
      haltigo: null,
    });
    expect(run.stderr).toContain("Schätzung:");
  });

  it("takes the brand of --config (provo) for the build and the Gvidanto", async () => {
    const a = arangxo();
    const config = join(
      repoRoot,
      "packages/modelo/test/fixtures/valid/aspekto-provo/fundamento.config.json",
    );
    const out = join(a.baseDir, "lauf");
    const run = await a.kuri([
      FRAZO,
      "--ekranoj",
      "liste",
      "--config",
      config,
      "--out",
      out,
      "--ja",
    ]);
    expect(run.code).toBe(0);
    expect(a.spuro.markoj).toEqual(["provo"]);
    expect(a.spuro.gvidantoj).toEqual([config]);
  });

  it("never prints or writes the key of the .env", async () => {
    const a = arangxo();
    const out = join(a.baseDir, "lauf");
    const run = await a.kuri([FRAZO, "--ekranoj", "liste,detail", "--out", out, "--ja"]);
    expect(run.code).toBe(0);
    expect(run.stderr).toContain("Probe der Schwärzung: ‹Schlüssel›");
    expect(`${run.stdout}${run.stderr}`).not.toContain(SXLOSILO);
    const skribitaj = dosieroj(out);
    expect(skribitaj.length).toBeGreaterThan(5);
    for (const dosiero of skribitaj) {
      expect(readFileSync(dosiero, "utf8"), dosiero).not.toContain(SXLOSILO);
    }
  });
});
