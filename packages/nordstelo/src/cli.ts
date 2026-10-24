#!/usr/bin/env node
// `pnpm nordstelo` (Spec 030, Auslösen): one run of the north-star measure on demand, on the
// maintainer's machine with the keys of their .env – never in CI. Provider, model and key come from
// the .env (FM_KI_ANBIETER, FM_KI_MODELL, the key of the provider); the key is never printed.
// `pnpm nordstelo restaro <run>` scores the stored results of a run again and says whether every
// number is the same (Determinismus). Nachlese 11 ②: a result stored by the rules of Spec 030 is
// checked against the old weighting; `--skribi` writes the rescoring in both weightings next to the
// run (restaro.md, restaro.json) and carries both figures into the history.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { type NordsteloHistorio, parseEnv } from "@fundamento/metiejo";
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
import { type RunRecord, summarize } from "./report.js";
import { failedScore, markdownReport, runNordstelo } from "./run.js";
import { scoreBoth } from "./score.js";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const CXIUJ_CONFIG = join(
  ROOT,
  "packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
);

const HELP = `pnpm nordstelo [Optionen]           ein Lauf: Aufgaben × Varianten × Wiederholungen
pnpm nordstelo restaro <Laufordner> [--skribi]
                                     die gespeicherten Ergebnisse eines Laufs erneut bewerten; mit
                                     --skribi beide Gewichtungen nach restaro.md und in den Verlauf

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

function restaro(runDir: string, skribi: boolean): number {
  const { modelo, katalogo } = modeloAndKatalogo();
  let checked = 0;
  let differing = 0;
  const records: RunRecord[] = [];
  for (const task of readdirSync(runDir, { withFileTypes: true }).filter((entry) =>
    entry.isDirectory(),
  )) {
    for (const result of readdirSync(join(runDir, task.name))) {
      const dir = join(runDir, task.name, result);
      if (!existsSync(join(dir, "rezulto.json"))) continue;
      const stored = JSON.parse(readFileSync(join(dir, "rezulto.json"), "utf8")) as RunRecord;
      const facts = JSON.parse(readFileSync(join(dir, "fakto.json"), "utf8")) as Facts;
      const tasko = katalogo.taskoj.find((entry) => entry.name === stored.task);
      if (tasko === undefined) continue;
      // A result without a page counts 0, as in the run (D-12).
      const again =
        stored.error === undefined
          ? scoreBoth({ facts, tasko, variant: stored.variant, modelo }, katalogo)
          : {
              nova: failedScore(stored.variant, stored.error),
              antauxa: failedScore(stored.variant, stored.error),
            };
      // Stored before Nachlese 11, a result carries the score of Spec 030 alone: the old weighting
      // must give it again. Stored since, it carries both, and both must come again.
      const same =
        stored.antauxa === undefined
          ? JSON.stringify(again.antauxa) === JSON.stringify(stored.score)
          : JSON.stringify(again.nova) === JSON.stringify(stored.score) &&
            JSON.stringify(again.antauxa) === JSON.stringify(stored.antauxa);
      checked += 1;
      if (!same) {
        differing += 1;
        process.stdout.write(
          `${task.name}/${result}: gespeichert ${stored.score.total}, jetzt ${stored.antauxa === undefined ? again.antauxa.total : again.nova.total}\n`,
        );
      }
      records.push({ ...stored, score: again.nova, antauxa: again.antauxa });
    }
  }
  process.stdout.write(`${checked} Ergebnisse erneut bewertet, ${differing} abweichend.\n`);
  const summary = summarize(records);
  const shownOf = (value: number | undefined) => (value === undefined ? "–" : shown(value));
  process.stdout.write(
    `Gewichtung Nachlese 11: Kennzahl F ${shownOf(summary.variants.F.median)} · Kennzahl 0 ${shownOf(summary.variants["0"].median)}\nGewichtung Spec 030: Kennzahl F ${shownOf(summary.antauxa?.F.median)} · Kennzahl 0 ${shownOf(summary.antauxa?.["0"].median)}\n`,
  );
  if (skribi) {
    const id =
      runDir
        .split("/")
        .filter((part) => part !== "")
        .at(-1) ?? "";
    const stored = existsSync(join(runDir, "raporto.json"))
      ? (JSON.parse(readFileSync(join(runDir, "raporto.json"), "utf8")) as {
          dato: string;
          commit: string;
          anbieter: string;
          modell: string;
          maxTokens: number;
        })
      : { dato: "", commit: "", anbieter: "", modell: "", maxTokens: 0 };
    const meta = {
      id,
      dato: stored.dato,
      commit: stored.commit,
      anbieter: stored.anbieter,
      modell: stored.modell,
      maxTokens: stored.maxTokens,
    };
    writeFileSync(
      join(runDir, "restaro.md"),
      markdownReport(
        meta,
        summary,
        `Nordstern-Kennzahl – Lauf ${id}, erneut bewertet (Nachlese 11, Katalog von ${commitOf()})`,
      ),
    );
    writeFileSync(
      join(runDir, "restaro.json"),
      `${JSON.stringify({ ...meta, katalogo: commitOf(), summary, records: records.map(({ task, variant, repeat, score: s, antauxa, error }) => ({ task, variant, repeat, total: s.total, k: s.k, ...(s.multmarkeco === undefined ? {} : { multmarkeco: s.multmarkeco }), ...(antauxa === undefined ? {} : { antauxa: { total: antauxa.total, k: antauxa.k } }), ...(error === undefined ? {} : { error }) })) }, null, 2)}\n`,
    );
    // The history shows the figure in the new weighting, the one of Spec 030 beside it.
    const historyFile = join(runDir, "..", "historio.json");
    if (existsSync(historyFile)) {
      const historio = JSON.parse(readFileSync(historyFile, "utf8")) as NordsteloHistorio;
      const kuro = historio.kuroj.find((entry) => entry.id === id);
      if (kuro !== undefined) {
        kuro.kennzahl = { F: summary.variants.F.median, "0": summary.variants["0"].median };
        if (summary.antauxa !== undefined)
          kuro.kennzahlAntauxa = { F: summary.antauxa.F.median, "0": summary.antauxa["0"].median };
        kuro.streuung = { F: summary.variants.F.spread, "0": summary.variants["0"].spread };
        for (const tasko of kuro.taskoj) {
          const of = (variant: Variant) =>
            summary.variants[variant].tasks.find((entry) => entry.task === tasko.tasko)?.median;
          const f = of("F");
          const nul = of("0");
          if (f !== undefined) tasko.F = f;
          if (nul !== undefined) tasko["0"] = nul;
        }
        writeFileSync(historyFile, `${JSON.stringify(historio, null, 2)}\n`);
      }
    }
    process.stdout.write(`Bericht: ${join(runDir, "restaro.md")}\n`);
  }
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
      skribi: { type: "boolean" },
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
      process.stderr.write("pnpm nordstelo restaro <Laufordner> [--skribi]\n");
      return 2;
    }
    return restaro(resolve(dir), values.skribi === true);
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
