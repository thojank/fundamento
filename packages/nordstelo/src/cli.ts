#!/usr/bin/env node
// `pnpm nordstelo` (Spec 030, Auslösen): one run of the north-star measure on demand, on the
// maintainer's machine with the keys of their .env – never in CI. Provider, model and key come from
// the .env (FM_KI_ANBIETER, FM_KI_MODELL, the key of the provider); the key is never printed.
// `pnpm nordstelo restaro <run>` scores the stored results of a run again and says whether every
// number is the same (Determinismus).

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { parseEnv } from "@fundamento/metiejo";
import {
  defaultModeloSource,
  loadModelo,
  projectModeloSource,
  readNordstelo,
} from "@fundamento/modelo";
import { buildProjekcioj } from "@fundamento/projekcioj";
import { providerOf, runAgent } from "./agent.js";
import type { Facts, Variant } from "./facts.js";
import { connectGvidanto } from "./gvidanto.js";
import { createRenderer } from "./render.js";
import { runNordstelo } from "./run.js";
import { type Score, score } from "./score.js";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const CXIUJ_CONFIG = join(
  ROOT,
  "packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
);

const HELP = `pnpm nordstelo [Optionen]           ein Lauf: Aufgaben × Varianten × Wiederholungen
pnpm nordstelo restaro <Laufordner>  die gespeicherten Ergebnisse eines Laufs erneut bewerten

  --env <Datei>        die .env mit FM_KI_ANBIETER, FM_KI_MODELL und dem Schlüssel (Standard: .env im Checkout)
  --taskoj <a,b>       nur diese Aufgaben (Namen aus packages/modelo/data/nordstelo.json)
  --varianten <F,0>    Standard: F,0
  --ripetoj <n>        Wiederholungen je Aufgabe und Variante, Standard: 3
  --max-tokens <n>     Kostengrenze des Laufs in Tokens (ein und aus), Standard: 15000000
  --samtempe <n>       Läufe zur selben Zeit, Standard: 3
  --lingvo <de|en>     Sprache der Aufgaben, Standard: de
  --anbieter <Name>    mistral, openai oder openrouter statt FM_KI_ANBIETER (Schlüssel aus der .env)
  --modell <Name>      ein anderes Modell als FM_KI_MODELL (Schlüssel aus der .env)
  --out <Ordner>       Standard: .fundamento/nordstelo im Checkout`;

function commitOf(): string {
  try {
    const commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
    }).trim();
    const dirty =
      execFileSync("git", ["status", "--porcelain"], { cwd: ROOT, encoding: "utf8" }).trim() !== "";
    return dirty ? `${commit}-dirty` : commit;
  } catch {
    return "unbekannt";
  }
}

function modeloAndKatalogo() {
  const source = defaultModeloSource();
  const { modelo } = loadModelo(source);
  const katalogo = readNordstelo(source.dataDir);
  if (modelo === undefined || katalogo === undefined)
    throw new Error("Modelo oder Aufgabenkatalog fehlt.");
  return { modelo, katalogo };
}

function restaro(runDir: string): number {
  const { modelo, katalogo } = modeloAndKatalogo();
  let checked = 0;
  let differing = 0;
  for (const task of readdirSync(runDir, { withFileTypes: true }).filter((entry) =>
    entry.isDirectory(),
  )) {
    for (const result of readdirSync(join(runDir, task.name))) {
      const dir = join(runDir, task.name, result);
      if (!existsSync(join(dir, "rezulto.json"))) continue;
      const stored = JSON.parse(readFileSync(join(dir, "rezulto.json"), "utf8")) as {
        task: string;
        variant: Variant;
        score: Score;
      };
      const facts = JSON.parse(readFileSync(join(dir, "fakto.json"), "utf8")) as Facts;
      const tasko = katalogo.taskoj.find((entry) => entry.name === stored.task);
      if (tasko === undefined) continue;
      const again = score({ facts, tasko, variant: stored.variant, modelo, pezoj: katalogo.pezoj });
      checked += 1;
      if (JSON.stringify(again) !== JSON.stringify(stored.score)) {
        differing += 1;
        process.stdout.write(
          `${task.name}/${result}: gespeichert ${stored.score.total}, jetzt ${again.total}\n`,
        );
      }
    }
  }
  process.stdout.write(`${checked} Ergebnisse erneut bewertet, ${differing} abweichend.\n`);
  return differing === 0 ? 0 : 1;
}

const shown = (value: number): string => (Number.isNaN(value) ? "–" : String(value));

async function kuri(values: Record<string, string | boolean | undefined>): Promise<number> {
  const envFile = resolve(String(values.env ?? join(ROOT, ".env")));
  if (!existsSync(envFile)) {
    process.stderr.write(
      `Keine .env unter ${envFile}. Lege sie mit FM_KI_ANBIETER, FM_KI_MODELL und dem Schlüssel an.\n`,
    );
    return 2;
  }
  const settings = parseEnv(readFileSync(envFile, "utf8"));
  // --anbieter and --modell choose another provider or model of the same .env; the key stays there.
  const provider = providerOf({
    ...settings,
    ...(typeof values.anbieter === "string" ? { FM_KI_ANBIETER: values.anbieter } : {}),
    ...(typeof values.modell === "string" ? { FM_KI_MODELL: values.modell } : {}),
  });
  const out = resolve(String(values.out ?? join(ROOT, ".fundamento", "nordstelo")));
  const { modelo, katalogo } = modeloAndKatalogo();
  const projekcioj = join(out, "projekcioj");
  const built = await buildProjekcioj({
    outDir: projekcioj,
    source: projectModeloSource(CXIUJ_CONFIG),
    celoj: ["css"],
  });
  if (!built.ok) throw new Error("Die Projektion css mit allen Marken ließ sich nicht bauen.");
  const erojDist = join(
    dirname(fileURLToPath(import.meta.resolve("@fundamento/eroj/package.json"))),
    "dist",
  );
  const gvidanto = await connectGvidanto();
  const renderer = await createRenderer({
    projekcioj,
    erojDist,
    concurrency: Number(values.samtempe ?? 3),
  });
  const log = (line: string) => process.stderr.write(`${provider.redact(line)}\n`);
  try {
    log(`Lauf mit ${provider.toString()} auf ${commitOf()}`);
    const result = await runNordstelo(
      {
        ...(typeof values.taskoj === "string"
          ? { taskoj: values.taskoj.split(",").map((name) => name.trim()) }
          : {}),
        variants: String(values.varianten ?? "F,0")
          .split(",")
          .map((variant) => variant.trim()) as Variant[],
        repeats: Number(values.ripetoj ?? 3),
        maxTokens: Number(values["max-tokens"] ?? 15_000_000),
        concurrency: Number(values.samtempe ?? 3),
        lingvo: values.lingvo === "en" ? "en" : "de",
      },
      {
        out,
        modelo,
        katalogo,
        commit: commitOf(),
        anbieter: provider.name,
        modell: provider.model,
        now: () => new Date(),
        log,
        agent: ({ task, variant, budget }) =>
          runAgent({
            provider,
            task,
            variant,
            budget,
            ...(variant === "F" ? { tools: gvidanto.bridge } : {}),
            log,
          }),
        render: (html, variant) => renderer.render(html, variant),
      },
    );
    process.stdout.write(
      `Kennzahl F ${shown(result.summary.variants.F.median)} · Kennzahl 0 ${shown(result.summary.variants["0"].median)} · Tokens ${result.summary.tokens.input + result.summary.tokens.output}${result.aborted === undefined ? "" : ` · ${result.aborted}`}\nBericht: ${join(result.dir, "raporto.md")}\n`,
    );
    return 0;
  } finally {
    await renderer.close();
    await gvidanto.close();
  }
}

async function main(argv: readonly string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args: [...argv],
    allowPositionals: true,
    options: {
      env: { type: "string" },
      taskoj: { type: "string" },
      varianten: { type: "string" },
      ripetoj: { type: "string" },
      "max-tokens": { type: "string" },
      samtempe: { type: "string" },
      lingvo: { type: "string" },
      anbieter: { type: "string" },
      modell: { type: "string" },
      out: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help === true) {
    process.stdout.write(`${HELP}\n`);
    return 0;
  }
  if (positionals[0] === "restaro") {
    const dir = positionals[1];
    if (dir === undefined) {
      process.stderr.write("pnpm nordstelo restaro <Laufordner>\n");
      return 2;
    }
    return restaro(resolve(dir));
  }
  return kuri(values);
}

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  },
);
