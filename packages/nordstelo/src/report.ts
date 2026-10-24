// The report of a run (Spec 030, Kennzahl): per task the median of its repeats, the total the
// median over the tasks, Variante F and 0 apart; the spread of the repeats (max − min per task,
// its median); the top 10 of the gaps of Variante F – what agents invent, which Reguloj they break,
// which Eroj they rebuild; the tokens. K7, the effort, as medians beside the score.

import type { Variant } from "./facts.js";
import type { Gap, Score } from "./score.js";

export interface Effort {
  inputTokens: number;
  outputTokens: number;
  toolCalls: number;
  ms: number;
  /** Size of the markup the agent wrote. */
  bytes: number;
}

export interface RunRecord {
  task: string;
  variant: Variant;
  repeat: number;
  score: Score;
  effort: Effort;
  /** Why the run gave no page (an error of the provider, a timeout); it counts as 0. */
  error?: string;
}

export interface TaskSummary {
  task: string;
  median: number;
  min: number;
  max: number;
  scores: number[];
}

export interface VariantSummary {
  median: number;
  spread: number;
  tasks: TaskSummary[];
  effort: Effort;
}

export interface Summary {
  variants: Record<Variant, VariantSummary>;
  gaps: (Gap & { count: number })[];
  tokens: { input: number; output: number };
  failed: { task: string; variant: Variant; repeat: number; error: string }[];
}

export function median(values: readonly number[]): number {
  if (values.length === 0) return Number.NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? (sorted[middle] as number)
    : ((sorted[middle - 1] as number) + (sorted[middle] as number)) / 2;
}

const round1 = (value: number): number => Math.round(value * 10) / 10;

function variantSummary(records: readonly RunRecord[]): VariantSummary {
  const byTask = new Map<string, RunRecord[]>();
  for (const record of records) {
    const list = byTask.get(record.task) ?? [];
    list.push(record);
    byTask.set(record.task, list);
  }
  const tasks: TaskSummary[] = [...byTask.entries()].map(([task, list]) => {
    const scores = [...list]
      .sort((a, b) => a.repeat - b.repeat)
      .map((record) => (record.error === undefined ? record.score.total : 0));
    return {
      task,
      median: round1(median(scores)),
      min: Math.min(...scores),
      max: Math.max(...scores),
      scores,
    };
  });
  const effort = (pick: (entry: Effort) => number) =>
    round1(median(records.map((record) => pick(record.effort))));
  return {
    median: round1(median(tasks.map((task) => task.median))),
    spread: round1(median(tasks.map((task) => task.max - task.min))),
    tasks,
    effort: {
      inputTokens: effort((entry) => entry.inputTokens),
      outputTokens: effort((entry) => entry.outputTokens),
      toolCalls: effort((entry) => entry.toolCalls),
      ms: effort((entry) => entry.ms),
      bytes: effort((entry) => entry.bytes),
    },
  };
}

export function summarize(records: readonly RunRecord[]): Summary {
  const counts = new Map<string, Gap & { count: number }>();
  for (const record of records.filter((entry) => entry.variant === "F")) {
    for (const gap of record.score.gaps) {
      const id = `${gap.kind}\u0000${gap.key}`;
      const entry = counts.get(id) ?? { ...gap, count: 0 };
      entry.count += 1;
      counts.set(id, entry);
    }
  }
  const gaps = [...counts.values()]
    .sort((a, b) => b.count - a.count || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
    .slice(0, 10);
  return {
    variants: {
      F: variantSummary(records.filter((record) => record.variant === "F")),
      "0": variantSummary(records.filter((record) => record.variant === "0")),
    },
    gaps,
    tokens: {
      input: records.reduce((sum, record) => sum + record.effort.inputTokens, 0),
      output: records.reduce((sum, record) => sum + record.effort.outputTokens, 0),
    },
    failed: records.flatMap((record) =>
      record.error === undefined
        ? []
        : [
            {
              task: record.task,
              variant: record.variant,
              repeat: record.repeat,
              error: record.error,
            },
          ],
    ),
  };
}
