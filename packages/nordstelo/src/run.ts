// A run of the north-star measure (Spec 030, Ablauf): every task × variant × repeat goes to a
// context-free agent, its page is rendered and scored. The run writes, per result, the page, the
// facts of the render, the score with the effort and the screenshot; per run a report (JSON and
// Markdown) with date, commit, model, the figure F against 0, the value per task, the spread, the
// top 10 of the gaps and the tokens; and it appends to the history the Metiejo shows. One budget of
// tokens covers the whole run: before a result that would pass it the run stops and still reports.
// Nachlese 11 ②: every result is scored in both weightings of the catalogue; the report and the
// history carry both.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { NordsteloHistorio, NordsteloKuro } from "@fundamento/metiejo";
import type { Modelo, NordsteloFile } from "@fundamento/modelo";
import { type AgentResult, Budget, CostLimitReached } from "./agent.js";
import type { Facts, Variant } from "./facts.js";
import { type RunRecord, type Summary, summarize, type VariantSummary } from "./report.js";
import { KRITERIOJ, type Score, scoreBoth } from "./score.js";

export interface RunDeps {
  out: string;
  modelo: Modelo;
  katalogo: NordsteloFile;
  commit: string;
  anbieter: string;
  modell: string;
  now(): Date;
  log(line: string): void;
  agent(args: { task: string; variant: Variant; budget: Budget }): Promise<AgentResult>;
  render(html: string, variant: Variant): Promise<{ facts: Facts; screenshot?: Uint8Array }>;
}

export interface RunOptions {
  /** Names of tasks; all of the catalogue when absent. */
  taskoj?: string[];
  variants: Variant[];
  repeats: number;
  /** The cost limit of the run, in tokens (input and output). */
  maxTokens: number;
  concurrency: number;
  lingvo?: "de" | "en";
}

export interface RunResult {
  id: string;
  dir: string;
  summary: Summary;
  aborted?: string;
}

const pad = (value: number) => String(value).padStart(2, "0");

function runId(date: Date, out: string): string {
  const base = `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}-${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}`;
  let id = base;
  for (let n = 2; existsSync(join(out, id)); n++) id = `${base}-${n}`;
  return id;
}

export function failedScore(variant: Variant, error: string): Score {
  const zero = variant === "F" ? 0 : null;
  return {
    k: { K1: 0, K2: zero, K3: zero, K4: 0, K5: 0, K6: 0 },
    total: 0,
    gaps: [{ kind: "render", key: `keine Seite: ${error.slice(0, 80)}` }],
  };
}

const EMPTY_FACTS: Facts = {
  lingvo: "",
  bytes: 0,
  elements: [],
  aria: [],
  console: [],
  renders: [],
};

export function markdownReport(
  meta: {
    id: string;
    dato: string;
    commit: string;
    anbieter: string;
    modell: string;
    aborted?: string;
    maxTokens: number;
  },
  summary: Summary,
  /** A heading of its own, e.g. for a rescoring of a stored run. */
  title = `Nordstern-Kennzahl – Lauf ${meta.id}`,
): string {
  const n = (value: number | null | undefined) =>
    value === null || value === undefined || Number.isNaN(value)
      ? "–"
      : value.toLocaleString("de-DE", { maximumFractionDigits: 2 });
  const old = summary.antauxa;
  const figure = (variants: Record<Variant, VariantSummary>) =>
    `${n(variants.F.median)} | ${n(variants["0"].median)}`;
  const lines = [
    `# ${title}`,
    "",
    `Datum ${meta.dato} · Commit \`${meta.commit}\` · Modell ${meta.anbieter}/${meta.modell} · Kostengrenze ${n(meta.maxTokens)} Tokens`,
    ...(meta.aborted === undefined ? [] : ["", `**Abgebrochen:** ${meta.aborted}`]),
    "",
    "| | Kennzahl F | Kennzahl 0 |",
    "|---|---|---|",
    ...(old === undefined
      ? [`| Median über die Aufgaben | ${figure(summary.variants)} |`]
      : [
          `| Median über die Aufgaben, Gewichtung Nachlese 11 (Markenfähigkeit als Tor, K5 = 25) | ${figure(summary.variants)} |`,
          `| Median über die Aufgaben, Gewichtung Spec 030 (ohne Tor, K5 = 10) | ${figure(old)} |`,
        ]),
    `| Streuung (Median von max − min)${old === undefined ? "" : ", Nachlese 11 / Spec 030"} | ${n(summary.variants.F.spread)}${old === undefined ? "" : ` / ${n(old.F.spread)}`} | ${n(summary.variants["0"].spread)}${old === undefined ? "" : ` / ${n(old["0"].spread)}`} |`,
    `| K7 Tokens ein / aus (Median je Lauf) | ${n(summary.variants.F.effort.inputTokens)} / ${n(summary.variants.F.effort.outputTokens)} | ${n(summary.variants["0"].effort.inputTokens)} / ${n(summary.variants["0"].effort.outputTokens)} |`,
    `| K7 Werkzeugaufrufe, Zeit, Markup (Median) | ${n(summary.variants.F.effort.toolCalls)}, ${n(summary.variants.F.effort.ms / 1000)} s, ${n(summary.variants.F.effort.bytes)} B | ${n(summary.variants["0"].effort.toolCalls)}, ${n(summary.variants["0"].effort.ms / 1000)} s, ${n(summary.variants["0"].effort.bytes)} B |`,
  ];
  if (summary.kriterioj !== undefined) {
    lines.push(
      "",
      "## Mittel je Kriterium (0–1; in Variante 0 gelten K2 und K3 nicht)",
      "",
      `| | ${KRITERIOJ.join(" | ")} | Markenfähigkeit |`,
      `|---|${KRITERIOJ.map(() => "---|").join("")}---|`,
    );
    for (const variant of ["F", "0"] as const) {
      const row = (values: Record<string, number | null>) =>
        KRITERIOJ.map((kriterio) => n(values[kriterio])).join(" | ");
      lines.push(
        `| ${variant}${old === undefined ? "" : ", Nachlese 11"} | ${row(summary.kriterioj[variant])} | ${n(summary.multmarkeco?.[variant])} |`,
      );
      if (summary.kriteriojAntauxaj !== undefined)
        lines.push(`| ${variant}, Spec 030 | ${row(summary.kriteriojAntauxaj[variant])} | – |`);
    }
  }
  lines.push(
    "",
    `## Wert je Aufgabe (Median, min–max${old === undefined ? "" : "; Gewichtung Nachlese 11, dahinter Spec 030"})`,
    "",
    old === undefined ? "| Aufgabe | F | 0 |" : "| Aufgabe | F | 0 | F (Spec 030) | 0 (Spec 030) |",
    old === undefined ? "|---|---|---|" : "|---|---|---|---|---|",
  );
  const tasks = new Set(
    [...summary.variants.F.tasks, ...summary.variants["0"].tasks].map((task) => task.task),
  );
  for (const task of tasks) {
    const cell = (variants: Record<Variant, VariantSummary>, variant: Variant) => {
      const entry = variants[variant].tasks.find((item) => item.task === task);
      return entry === undefined ? "–" : `${n(entry.median)} (${n(entry.min)}–${n(entry.max)})`;
    };
    lines.push(
      `| ${task} | ${cell(summary.variants, "F")} | ${cell(summary.variants, "0")} |${old === undefined ? "" : ` ${cell(old, "F")} | ${cell(old, "0")} |`}`,
    );
  }
  lines.push(
    "",
    "## Top-10 der Lücken (Variante F)",
    "",
    "| # | Art | Lücke | Anzahl |",
    "|---|---|---|---|",
  );
  for (const [index, gap] of summary.gaps.entries()) {
    lines.push(`| ${index + 1} | ${gap.kind} | ${gap.key.replaceAll("|", "\\|")} | ${gap.count} |`);
  }
  lines.push("", `Tokens gesamt: ${n(summary.tokens.input)} ein, ${n(summary.tokens.output)} aus.`);
  if (summary.failed.length > 0) {
    lines.push("", "## Ohne Seite (zählen 0)", "");
    for (const failed of summary.failed)
      lines.push(`- ${failed.task} ${failed.variant}-${failed.repeat}: ${failed.error}`);
  }
  return `${lines.join("\n")}\n`;
}

export async function runNordstelo(options: RunOptions, deps: RunDeps): Promise<RunResult> {
  const date = deps.now();
  const id = runId(date, deps.out);
  const dir = join(deps.out, id);
  mkdirSync(dir, { recursive: true });
  const lingvo = options.lingvo ?? "de";
  const taskoj = deps.katalogo.taskoj.filter(
    (tasko) => options.taskoj === undefined || options.taskoj.includes(tasko.name),
  );
  const jobs = taskoj.flatMap((tasko) =>
    options.variants.flatMap((variant) =>
      Array.from({ length: options.repeats }, (_, index) => ({
        tasko,
        variant,
        repeat: index + 1,
      })),
    ),
  );
  const budget = new Budget(options.maxTokens);
  const records: RunRecord[] = [];
  let largestRun = 0;
  let aborted: string | undefined;
  let next = 0;

  const work = async (): Promise<void> => {
    for (;;) {
      if (aborted !== undefined) return;
      const job = jobs[next++];
      if (job === undefined) return;
      const { tasko, variant, repeat } = job;
      try {
        budget.ensure(largestRun);
      } catch (error) {
        aborted ??= error instanceof CostLimitReached ? error.message : String(error);
        return;
      }
      const target = join(dir, tasko.name, `${variant}-${repeat}`);
      mkdirSync(target, { recursive: true });
      const before = budget.spent;
      let agentResult: AgentResult | undefined;
      let error: string | undefined;
      try {
        agentResult = await deps.agent({ task: tasko.teksto[lingvo], variant, budget });
      } catch (caught) {
        if (caught instanceof CostLimitReached) {
          aborted ??= caught.message;
          return;
        }
        error = String(caught instanceof Error ? caught.message : caught);
      }
      largestRun = Math.max(largestRun, budget.spent - before);
      let facts = EMPTY_FACTS;
      if (agentResult !== undefined) {
        writeFileSync(join(target, "pagxo.html"), agentResult.html);
        try {
          const rendered = await deps.render(agentResult.html, variant);
          facts = rendered.facts;
          if (rendered.screenshot !== undefined)
            writeFileSync(join(target, "bildo.png"), rendered.screenshot);
        } catch (caught) {
          error = `Rendern: ${String(caught instanceof Error ? caught.message : caught)}`;
        }
      }
      writeFileSync(join(target, "fakto.json"), `${JSON.stringify(facts, null, 2)}\n`);
      // A run without a page (the provider failed, the render failed) counts 0 in every criterion.
      const scored =
        error === undefined
          ? scoreBoth({ facts, tasko, variant, modelo: deps.modelo }, deps.katalogo)
          : { nova: failedScore(variant, error), antauxa: failedScore(variant, error) };
      const result = scored.nova;
      const effort = agentResult?.effort ?? {
        inputTokens: budget.spent - before,
        outputTokens: 0,
        toolCalls: 0,
        ms: 0,
        bytes: 0,
      };
      const record: RunRecord = {
        task: tasko.name,
        variant,
        repeat,
        score: result,
        antauxa: scored.antauxa,
        effort,
        ...(error === undefined ? {} : { error }),
      };
      records.push(record);
      writeFileSync(
        join(target, "rezulto.json"),
        `${JSON.stringify({ ...record, transcript: agentResult?.transcript ?? [] }, null, 2)}\n`,
      );
      deps.log(
        `${tasko.name} ${variant}-${repeat}: ${result.total}${error === undefined ? "" : ` (${error})`} · Tokens ${budget.spent}`,
      );
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, options.concurrency) }, () => work()));

  records.sort((a, b) =>
    a.task === b.task
      ? a.variant === b.variant
        ? a.repeat - b.repeat
        : a.variant === "F"
          ? -1
          : 1
      : taskoj.findIndex((t) => t.name === a.task) - taskoj.findIndex((t) => t.name === b.task),
  );
  const summary = summarize(records);
  const dato = date.toISOString();
  const meta = {
    id,
    dato,
    commit: deps.commit,
    anbieter: deps.anbieter,
    modell: deps.modell,
    maxTokens: options.maxTokens,
    ...(aborted === undefined ? {} : { aborted }),
  };
  writeFileSync(
    join(dir, "raporto.json"),
    `${JSON.stringify({ ...meta, taskoj: taskoj.map((tasko) => tasko.name), variants: options.variants, repeats: options.repeats, summary, records: records.map(({ task, variant, repeat, score: s, antauxa, effort, error }) => ({ task, variant, repeat, total: s.total, k: s.k, ...(s.multmarkeco === undefined ? {} : { multmarkeco: s.multmarkeco }), ...(antauxa === undefined ? {} : { antauxa: { total: antauxa.total, k: antauxa.k } }), effort, ...(error === undefined ? {} : { error }) })) }, null, 2)}\n`,
  );
  writeFileSync(join(dir, "raporto.md"), markdownReport(meta, summary));

  const kuro: NordsteloKuro = {
    id,
    dato,
    commit: deps.commit,
    anbieter: deps.anbieter,
    modell: deps.modell,
    kennzahl: {
      ...(records.some((r) => r.variant === "F") ? { F: summary.variants.F.median } : {}),
      ...(records.some((r) => r.variant === "0") ? { "0": summary.variants["0"].median } : {}),
    },
    ...(summary.antauxa === undefined
      ? {}
      : {
          kennzahlAntauxa: {
            ...(records.some((r) => r.variant === "F") ? { F: summary.antauxa.F.median } : {}),
            ...(records.some((r) => r.variant === "0") ? { "0": summary.antauxa["0"].median } : {}),
          },
        }),
    streuung: {
      ...(records.some((r) => r.variant === "F") ? { F: summary.variants.F.spread } : {}),
      ...(records.some((r) => r.variant === "0") ? { "0": summary.variants["0"].spread } : {}),
    },
    tokens: summary.tokens,
    ...(aborted === undefined ? {} : { abgebrochen: aborted }),
    taskoj: taskoj.flatMap((tasko) => {
      const of = (variant: Variant) =>
        summary.variants[variant].tasks.find((task) => task.task === tasko.name)?.median;
      const first =
        records.find((record) => record.task === tasko.name && record.variant === "F") ??
        records.find((record) => record.task === tasko.name);
      if (first === undefined) return [];
      const base = `${id}/${tasko.name}/${first.variant}-${first.repeat}`;
      const f = of("F");
      const nul = of("0");
      return [
        {
          tasko: tasko.name,
          ...(f === undefined ? {} : { F: f }),
          ...(nul === undefined ? {} : { "0": nul }),
          ...(existsSync(join(deps.out, base, "pagxo.html"))
            ? { pagxo: `${base}/pagxo.html` }
            : {}),
          ...(existsSync(join(deps.out, base, "bildo.png")) ? { bildo: `${base}/bildo.png` } : {}),
        },
      ];
    }),
  };
  const historyFile = join(deps.out, "historio.json");
  const historio: NordsteloHistorio = existsSync(historyFile)
    ? (JSON.parse(readFileSync(historyFile, "utf8")) as NordsteloHistorio)
    : { kuroj: [] };
  historio.kuroj.push(kuro);
  historio.kuroj.sort((a, b) => (a.dato < b.dato ? -1 : a.dato > b.dato ? 1 : 0));
  writeFileSync(historyFile, `${JSON.stringify(historio, null, 2)}\n`);
  return { id, dir, summary, ...(aborted === undefined ? {} : { aborted }) };
}
