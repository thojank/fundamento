// `pnpm nordstelo --art ablauf` (Spec 037, Lieferliste 2.3, AC-12): the switch of the nordstelo cli,
// the usage errors, the model guard before anything is built or asked, a whole run with doubles,
// and the renderer of nordstelo as the Bildigilo of ekranoj (D-39). No browser, no provider.

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { PERMESITA_MODELO, type Varianto } from "@fundamento/ekranoj";
import { defaultModeloSource, loadModelo, type Modelo } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { cleanRenders } from "../test-doubles/facts.js";
import {
  type ArtoMedio,
  bildigiloDeRenderer,
  HELPO_ABLAUF,
  kuriArton,
  markoDe,
  type Preparo,
  petasArton,
} from "./cli-ablauf.js";
import { ABLAUF_TASKOJ } from "./katalogo.js";
import {
  ASPEKTOJ_DUOBLAJ,
  duoblaKuro,
  faktojElDosierujo,
  kalkulantaChat,
} from "./test-doubles/ekranoj.js";

const geladen = loadModelo(defaultModeloSource()).modelo;
if (geladen === undefined) throw new Error("the repository Modelo must load");
const modelo: Modelo = geladen;
const fixtures = fileURLToPath(new URL("../../test/fixtures/ablauf/", import.meta.url));
const SXLOSILO = "duobla-sxlosilo-7f3a9c";
const [anbieter, modell] = PERMESITA_MODELO.split("/");

function medio(env: Record<string, string> | undefined) {
  const duobla = duoblaKuro({
    faktoj: (_tasko: string, varianto: Varianto) =>
      faktojElDosierujo(`${fixtures}liste-filter-detail/${varianto}/`),
    sendojPerRondo: 1,
  });
  const own = {
    stdout: "",
    stderr: "",
    envVokoj: 0,
    preparoj: 0,
    fermitaj: 0,
    duobla,
    medio: {
      root: mkdtempSync(join(tmpdir(), "s037-cli-")),
      stdout: (teksto: string) => {
        own.stdout += teksto;
      },
      stderr: (teksto: string) => {
        own.stderr += teksto;
      },
      legiEnv: () => {
        own.envVokoj += 1;
        return env;
      },
      preparo: async (): Promise<Preparo> => {
        own.preparoj += 1;
        return {
          kuruEkranojn: duobla.kuruEkranojn,
          markoj: ASPEKTOJ_DUOBLAJ,
          kuraDeps: () => ({
            chat: kalkulantaChat({ input: 400, output: 100, modelo: PERMESITA_MODELO }),
            tools: { list: async () => [], call: async () => "" },
            marko: { konstrui: async () => ({ css: [] }) },
            nun: () => new Date(Date.UTC(2026, 9, 31, 12, 0)),
            log: () => undefined,
          }),
          fermi: async () => {
            own.fermitaj += 1;
          },
        };
      },
      modelo: () => modelo,
      sxargo: () => ({ sxargo: { l1: 1, l5: 1, l15: 1 }, kernoj: 8 }),
      nun: () => new Date(Date.UTC(2026, 9, 31, 12, 0)),
      commit: () => "abc1234",
    } satisfies ArtoMedio,
  };
  return own;
}

const permesita = {
  FM_KI_ANBIETER: anbieter ?? "",
  FM_KI_MODELL: modell ?? "",
  MISTRAL_API_KEY: SXLOSILO,
};

function dosieroj(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? dosieroj(path) : [path];
  });
}

describe("pnpm nordstelo --art ablauf", () => {
  it("hands every call with --art to this module, and no other", () => {
    expect(petasArton(["--art", "ablauf"])).toBe(true);
    expect(petasArton(["--taskoj", "a", "--art=ablauf"])).toBe(true);
    expect(petasArton([])).toBe(false);
    expect(petasArton(["restaro", "dir", "--skribi"])).toBe(false);
    expect(petasArton(["--taskoj", "art"])).toBe(false);
  });

  it("puts the switch first in the nordstelo cli, before its own arguments (path unchanged without --art)", () => {
    const cli = readFileSync(fileURLToPath(new URL("../cli.ts", import.meta.url)), "utf8");
    const main = cli.slice(cli.indexOf("async function main("));
    expect(main.indexOf("if (petasArton(argv)) return kuriArton(argv);")).toBeGreaterThan(0);
    expect(main.indexOf("if (petasArton(argv)) return kuriArton(argv);")).toBeLessThan(
      main.indexOf("parseArgs("),
    );
    expect(cli).toContain("pnpm nordstelo --art ablauf [Optionen]");
  });

  it("refuses an unknown --art with a usage error, exit 2, nothing read or built", async () => {
    const own = medio(permesita);
    expect(await kuriArton(["--art", "seite"], own.medio)).toBe(2);
    expect(own.stderr).toContain("Unbekannte Art „seite“ für --art. Erlaubt: ablauf.");
    expect(own.stderr).toContain("pnpm nordstelo --art ablauf [Optionen]");
    expect([own.envVokoj, own.preparoj, own.duobla.vokoj.length]).toEqual([0, 0, 0]);
    expect(await kuriArton(["--art"], own.medio)).toBe(2);
    expect(await kuriArton(["--art", "ablauf", "--modell", "x"], own.medio)).toBe(2);
  });

  it("refuses bad settings before the .env is read", async () => {
    const own = medio(permesita);
    expect(await kuriArton(["--art", "ablauf", "--ripetoj", "0"], own.medio)).toBe(2);
    expect(await kuriArton(["--art", "ablauf", "--taskoj", "nenio"], own.medio)).toBe(2);
    expect(own.stderr).toContain("/taskoj/0 ablauf-task-unknown");
    expect(own.envVokoj).toBe(0);
  });

  it("exits 2 before any request when the .env names another model (D-19)", async () => {
    const own = medio({ ...permesita, FM_KI_MODELL: "mistral-large-latest" });
    expect(await kuriArton(["--art", "ablauf"], own.medio)).toBe(2);
    expect(own.preparoj).toBe(0);
    expect(own.duobla.vokoj).toHaveLength(0);
    expect(own.stderr).toContain("mistral/mistral-large-latest");
    expect(own.stderr).not.toContain(SXLOSILO);
    expect(own.stdout).toBe("");
  });

  it("exits 2 without a .env", async () => {
    const own = medio(undefined);
    expect(await kuriArton(["--art", "ablauf"], own.medio)).toBe(2);
    expect(own.stderr).toContain("Keine .env unter");
    expect(own.preparoj).toBe(0);
  });

  it("shows its help", async () => {
    const own = medio(permesita);
    expect(await kuriArton(["--art", "ablauf", "--help"], own.medio)).toBe(0);
    expect(own.stdout).toBe(`${HELPO_ABLAUF}\n`);
    for (const option of [
      "--taskoj",
      "--varianten",
      "--ripetoj",
      "--max-tokens",
      "--out",
      "--ledger",
      "--env",
      "--json",
    ])
      expect(HELPO_ABLAUF).toContain(option);
  });

  it("runs the measurement with doubles, prints the report path and the summary, never the key", async () => {
    const own = medio(permesita);
    const out = join(own.medio.root, "ablauf");
    const code = await kuriArton(
      ["--art", "ablauf", "--taskoj", "liste-filter-detail", "--out", out, "--json"],
      own.medio,
    );
    expect(code, own.stderr).toBe(0);
    expect(own.fermitaj).toBe(1);
    const resumo = JSON.parse(own.stdout) as Record<string, unknown>;
    expect(resumo).toMatchObject({
      dir: join(out, "20261031-1200"),
      raporto: join(out, "20261031-1200", "raporto.md"),
      kuroj: 2,
      konstruitaj: 2,
      nekomencitaj: 0,
      anfragoj: 4,
      tokenoj: { enigo: 1_600, eligo: 400 },
    });
    expect(existsSync(join(out, "20261031-1200", "raporto.md"))).toBe(true);
    // Every task when --taskoj is absent: the estimate names the whole catalogue.
    for (const file of dosieroj(out))
      expect(readFileSync(file, "utf8"), file).not.toContain(SXLOSILO);
    expect(own.stdout + own.stderr).not.toContain(SXLOSILO);

    const human = medio(permesita);
    expect(
      await kuriArton(
        ["--art", "ablauf", "--taskoj", "liste-filter-detail", "--varianten", "0", "--out", out],
        human.medio,
      ),
    ).toBe(0);
    expect(human.stdout).toMatch(
      /^Läufe 1 \(gebaut 1, nicht gestartet 0\) · Tokens 500 · 0\.0001 \$\nBericht: .*raporto\.md\n$/,
    );
    expect(ABLAUF_TASKOJ.length).toBeGreaterThan(1);
  });

  it("copies the one css file of the brand build of all Aspektoj into a run that asks for it", async () => {
    const projekcioj = mkdtempSync(join(tmpdir(), "s037-marko-"));
    mkdirSync(join(projekcioj, "css"));
    writeFileSync(join(projekcioj, "css", "fundamento.css"), ":root{}");
    writeFileSync(join(projekcioj, "css", "fundamento-komuna.css"), ":root{}");
    const dir = mkdtempSync(join(tmpdir(), "s037-marko-"));
    expect(await markoDe(projekcioj).konstrui(dir)).toEqual({
      css: [join(dir, "css", "fundamento.css")],
    });
    expect(readdirSync(join(dir, "css"))).toEqual(["fundamento.css"]);
  });

  it("renders every screen in the four brands × light/dark, contrast default only (D-39)", async () => {
    const renders = cleanRenders();
    let closed = 0;
    const bildigilo = bildigiloDeRenderer({
      render: async (html, variant) => ({
        facts: {
          lingvo: "de",
          bytes: html.length,
          elements: [],
          aria: [],
          console: [variant],
          renders,
        },
        screenshot: new Uint8Array([1, 2, 3]),
      }),
      close: async () => {
        closed += 1;
      },
    });
    const { fakto, bildoj } = await bildigilo.render(
      { slug: "a", html: "<p>x</p>" },
      { aspektoj: ["komuna"], varianto: "0" },
    );
    expect(fakto.renders.map((r) => `${r.aspekto} ${r.scheme} ${r.contrast}`)).toEqual(
      ASPEKTOJ_DUOBLAJ.flatMap((a) => [`${a} light default`, `${a} dark default`]),
    );
    expect(renders.length).toBe(2 * fakto.renders.length);
    expect(fakto.console).toEqual(["0"]);
    expect([...bildoj.hela]).toEqual([1, 2, 3]);
    // The shared renderer is closed once by the command, not by each run.
    await bildigilo.close();
    expect(closed).toBe(0);
  });
});
