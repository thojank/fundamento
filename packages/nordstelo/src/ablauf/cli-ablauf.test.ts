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
import {
  KONTROLA_MODELO,
  type Kontrolo,
  PERMESITA_MODELO,
  type Varianto,
} from "@fundamento/ekranoj";
import { defaultModeloSource, loadModelo, type Modelo } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { cleanRenders } from "../test-doubles/facts.js";
import {
  type ArtoMedio,
  bildigiloDeRenderer,
  HELPO_ABLAUF,
  HELPO_KOMPARO,
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
import { LFD, skribiLaufon, UK } from "./test-doubles/laufoj.js";

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
    /** What each `preparo` was given: the provider's name and the control pair (Spec 038 C-3). */
    preparArgs: [] as { provider: string; anbieter: string; kontrolo: Kontrolo | undefined }[],
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
      preparo: async (e): Promise<Preparo> => {
        own.preparoj += 1;
        own.preparArgs.push({
          provider: e.provider.toString(),
          anbieter: e.provider.name,
          kontrolo: e.kontrolo,
        });
        return {
          kuruEkranojn: duobla.kuruEkranojn,
          markoj: ASPEKTOJ_DUOBLAJ,
          kuraDeps: () => ({
            chat: kalkulantaChat({ input: 400, output: 100, modelo: e.provider.toString() }),
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
    expect(cli).toContain("pnpm nordstelo --art komparo");
  });

  it("refuses an unknown --art with a usage error, exit 2, nothing read or built", async () => {
    const own = medio(permesita);
    expect(await kuriArton(["--art", "seite"], own.medio)).toBe(2);
    expect(own.stderr).toContain("Unbekannte Art „seite“ für --art. Erlaubt: ablauf, komparo.");
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

describe("pnpm nordstelo --art komparo (Spec 038 C-4)", () => {
  function folders() {
    const radiko = mkdtempSync(join(tmpdir(), "s038-cli-komparo-"));
    const antaux = skribiLaufon(join(radiko, "vorher"), "20261107-0900", {
      commit: "e4873c57",
      kuroj: [{ tasko: LFD, varianto: "0", total: 40 }],
    });
    const post = skribiLaufon(join(radiko, "nachher"), "20261107-1000", {
      commit: "c0de4d00",
      projekcioj: true,
      kuroj: [
        { tasko: LFD, varianto: "0", total: 56.8, k8: 0.9, penoj: true },
        { tasko: UK, varianto: "F", total: 90, k8: 0.9, penoj: true },
      ],
    });
    return { radiko, antaux, post };
  }

  it("writes vergleich.md and vergleich.json, reads no .env and builds nothing", async () => {
    const own = medio(permesita);
    const { radiko, antaux } = folders();
    const out = join(radiko, "vergleich");
    const code = await kuriArton(
      ["--art", "komparo", "--antaux", antaux, "--post", join(radiko, "nachher"), "--out", out],
      own.medio,
    );
    expect(code, own.stderr).toBe(0);
    const json = readFileSync(join(out, "vergleich.json"), "utf8");
    const datumoj = JSON.parse(json) as { paroj: { tasko: string; varianto: string }[] };
    expect(datumoj.paroj.map((p) => `${p.tasko} ${p.varianto}`)).toEqual([`${LFD} 0`, `${UK} F`]);
    expect(readFileSync(join(out, "vergleich.md"), "utf8")).toContain("+16,8");
    expect(own.stdout).toContain(join(out, "vergleich.md"));
    expect([own.envVokoj, own.preparoj, own.duobla.vokoj.length]).toEqual([0, 0, 0]);
    // Run again: the same bytes.
    expect(
      await kuriArton(
        ["--art", "komparo", "--antaux", antaux, "--post", join(radiko, "nachher"), "--out", out],
        medio(permesita).medio,
      ),
    ).toBe(0);
    expect(readFileSync(join(out, "vergleich.json"), "utf8")).toBe(json);
  });

  it("marks the folders named by --gestoert and adds the extra line of --zusatz", async () => {
    const own = medio(permesita);
    const { radiko, antaux, post } = folders();
    const zusatz = skribiLaufon(join(radiko, "messpunkt-1"), "20261031-1342", {
      commit: "07585b5e",
      projekcioj: true,
      kuroj: [{ tasko: LFD, varianto: "0", total: 33, malnova: true }],
    });
    const out = join(radiko, "vergleich");
    const code = await kuriArton(
      [
        "--art",
        "komparo",
        "--antaux",
        antaux,
        "--post",
        join(radiko, "nachher"),
        "--gestoert",
        post,
        "--zusatz",
        join(radiko, "messpunkt-1"),
        "--out",
        out,
        "--json",
      ],
      own.medio,
    );
    expect(code, own.stderr).toBe(0);
    const datumoj = JSON.parse(readFileSync(join(out, "vergleich.json"), "utf8")) as {
      laufoj: { post: { gestoerta: boolean }[]; zusatz: { id: string } | null };
      paroj: { delto: unknown; zusatz?: { total: number } | null }[];
    };
    expect(datumoj.laufoj.post[0]?.gestoerta).toBe(true);
    expect(datumoj.laufoj.zusatz?.id).toBe("20261031-1342");
    expect(datumoj.paroj[0]?.delto).toBeNull();
    expect(datumoj.paroj[0]?.zusatz?.total).toBe(33);
    expect(JSON.parse(own.stdout)).toMatchObject({ vergleich: join(out, "vergleich.md") });
    expect(zusatz).toContain("20261031-1342");
  });

  it("exits 2 with a structured problem for the same pair twice on one side, or a missing side", async () => {
    const { radiko, antaux, post } = folders();
    const duobla = skribiLaufon(join(radiko, "vorher-2"), "20261107-0915", {
      commit: "e4873c57",
      kuroj: [{ tasko: LFD, varianto: "0", total: 41 }],
    });
    const out = join(radiko, "vergleich");
    const own = medio(permesita);
    expect(
      await kuriArton(
        ["--art", "komparo", "--antaux", antaux, "--antaux", duobla, "--post", post, "--out", out],
        own.medio,
      ),
    ).toBe(2);
    expect(own.stderr).toContain("/antaux/1 komparo-paro-duobla");
    expect(existsSync(join(out, "vergleich.json"))).toBe(false);

    const json = medio(permesita);
    expect(
      await kuriArton(
        [
          "--art",
          "komparo",
          "--antaux",
          antaux,
          "--antaux",
          duobla,
          "--post",
          post,
          "--out",
          out,
          "--json",
        ],
        json.medio,
      ),
    ).toBe(2);
    const { problemoj } = JSON.parse(json.stdout) as {
      problemoj: { path: string; rule: string; message: string; suggestion: string }[];
    };
    expect(problemoj[0]).toMatchObject({ path: "/antaux/1", rule: "komparo-paro-duobla" });
    expect(problemoj[0]?.suggestion).not.toBe("");

    const sen = medio(permesita);
    expect(await kuriArton(["--art", "komparo", "--antaux", antaux, "--out", out], sen.medio)).toBe(
      2,
    );
    expect(sen.stderr).toContain("/post");
    const nekonata = medio(permesita);
    expect(
      await kuriArton(
        [
          "--art",
          "komparo",
          "--antaux",
          antaux,
          "--post",
          post,
          "--gestoert",
          radiko,
          "--out",
          out,
        ],
        nekonata.medio,
      ),
    ).toBe(2);
    expect(nekonata.stderr).toContain("komparo-gestoert-nekonata");
  });

  it("shows its help, listed in the nordstelo help; the help of --art ablauf stays as it was", async () => {
    const own = medio(permesita);
    expect(await kuriArton(["--art", "komparo", "--help"], own.medio)).toBe(0);
    expect(own.stdout).toBe(`${HELPO_KOMPARO}\n`);
    for (const option of ["--antaux", "--post", "--zusatz", "--gestoert", "--out", "--json"])
      expect(HELPO_KOMPARO).toContain(option);
    expect(HELPO_ABLAUF).not.toContain("komparo");
    const ablauf = medio(permesita);
    expect(await kuriArton(["--art", "ablauf", "--help"], ablauf.medio)).toBe(0);
    expect(ablauf.stdout).toBe(`${HELPO_ABLAUF}\n`);
    // Options of the comparison are no options of the measurement.
    expect(await kuriArton(["--art", "ablauf", "--antaux", "x"], medio(permesita).medio)).toBe(2);
  });
});

describe("pnpm nordstelo --art ablauf: the control model exception (Spec 038 A-5, C-3, AK-6)", () => {
  const mitOpenRouter = { ...permesita, OPENROUTER_API_KEY: `${SXLOSILO}-or` };
  const sonnetEnv = {
    FM_KI_ANBIETER: "openrouter",
    FM_KI_MODELL: "anthropic/claude-sonnet-5.5",
    OPENROUTER_API_KEY: SXLOSILO,
  };
  const PARO = ["--lauf-id", "kontrolle-komuna", "--kontroll-modelo", KONTROLA_MODELO];

  it("names both options in its help", () => {
    expect(HELPO_ABLAUF).toContain("--lauf-id <id>");
    expect(HELPO_ABLAUF).toContain("--kontroll-modelo <provider/model>");
    expect(HELPO_ABLAUF).toContain(KONTROLA_MODELO);
  });

  it("refuses every other combination with exit 2 before anything is built, path and rule exact, no key", async () => {
    const kazoj: [string, Record<string, string>, string[], string, string][] = [
      [
        "option without run id",
        mitOpenRouter,
        ["--kontroll-modelo", KONTROLA_MODELO],
        "/lauf-id",
        "control-run-id",
      ],
      [
        "prefix without option",
        mitOpenRouter,
        ["--lauf-id", "kontrolle-x"],
        "/kontroll-modelo",
        "control-model-option",
      ],
      [
        "other model with option",
        mitOpenRouter,
        ["--lauf-id", "kontrolle-x", "--kontroll-modelo", "openrouter/other/model"],
        "/kontroll-modelo",
        "model-not-allowed",
      ],
      [
        "option, plain run id",
        mitOpenRouter,
        ["--lauf-id", "foo", "--kontroll-modelo", KONTROLA_MODELO],
        "/lauf-id",
        "control-run-id",
      ],
      [
        "other model in the .env",
        { ...permesita, FM_KI_MODELL: "mistral-large-2512" },
        [],
        "FM_KI_MODELL",
        "model-not-allowed",
      ],
      ["sonnet only in the .env", sonnetEnv, [], "FM_KI_MODELL", "model-not-allowed"],
    ];
    for (const [nomo, env, args, path, rule] of kazoj) {
      for (const json of [true, false]) {
        const own = medio(env);
        const kodo = await kuriArton(
          [
            "--art",
            "ablauf",
            "--taskoj",
            "liste-filter-detail",
            ...args,
            ...(json ? ["--json"] : []),
          ],
          own.medio,
        );
        expect(kodo, nomo).toBe(2);
        expect(own.stderr, nomo).toContain(`${path} ${rule}: `);
        if (json) {
          const dok = JSON.parse(own.stdout) as {
            problemoj: { path: string; rule: string; suggestion: string }[];
          };
          expect(
            dok.problemoj.map((p) => ({ path: p.path, rule: p.rule })),
            nomo,
          ).toEqual([{ path, rule }]);
          expect(dok.problemoj[0]?.suggestion.length, nomo).toBeGreaterThan(0);
        } else {
          expect(own.stdout, nomo).toBe("");
        }
        expect(own.preparoj, nomo).toBe(0);
        expect(own.duobla.vokoj, nomo).toHaveLength(0);
        expect(`${own.stdout}${own.stderr}`, nomo).not.toContain(SXLOSILO);
      }
    }
  });

  it("builds an openrouter provider from the option and hands the pair to the measurement and every run", async () => {
    const own = medio(mitOpenRouter);
    const out = join(own.medio.root, "ablauf");
    const kodo = await kuriArton(
      ["--art", "ablauf", "--taskoj", "liste-filter-detail", "--out", out, ...PARO, "--json"],
      own.medio,
    );
    expect(kodo, own.stderr).toBe(0);
    const paro: Kontrolo = { laufId: "kontrolle-komuna", kontrolModelo: KONTROLA_MODELO };
    expect(own.preparArgs).toEqual([
      { provider: KONTROLA_MODELO, anbieter: "openrouter", kontrolo: paro },
    ]);
    expect(own.duobla.vokoj.map((voko) => voko.enigo.kontrolo)).toEqual([paro, paro]);
    const lauf = JSON.parse(readFileSync(join(out, "20261031-1200", "lauf.json"), "utf8")) as {
      kiModelo: string;
    };
    expect(lauf.kiModelo).toBe(KONTROLA_MODELO);
    expect(`${own.stdout}${own.stderr}`).not.toContain(SXLOSILO);
  });

  it("keeps the run of ministral as it was: no pair handed on", async () => {
    const own = medio(permesita);
    const out = join(own.medio.root, "ablauf");
    const kodo = await kuriArton(
      ["--art", "ablauf", "--taskoj", "liste-filter-detail", "--out", out, "--json"],
      own.medio,
    );
    expect(kodo, own.stderr).toBe(0);
    expect(own.preparArgs).toEqual([
      { provider: PERMESITA_MODELO, anbieter: "mistral", kontrolo: undefined },
    ]);
    expect(own.duobla.vokoj.map((voko) => voko.enigo.kontrolo)).toEqual([undefined, undefined]);
  });
});
