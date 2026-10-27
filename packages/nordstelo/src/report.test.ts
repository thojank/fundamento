// The report of a run (Spec 030, Kennzahl): per task the median of its repeats, the total the
// median over the tasks, F and 0 apart; the spread of the repeats; the top 10 of the gaps of
// Variante F; the tokens. K7 is reported, never weighted.

import { describe, expect, it } from "vitest";
import { median, type RunRecord, summarize } from "./report.js";

const run = (
  task: string,
  variant: "F" | "0",
  repeat: number,
  total: number,
  gaps: string[] = [],
): RunRecord => ({
  task,
  variant,
  repeat,
  score: {
    k: { K1: 1, K2: 1, K3: 1, K4: 1, K5: 1, K6: 1 },
    total,
    gaps: gaps.map((key) => ({ kind: "regulo" as const, key })),
  },
  effort: {
    inputTokens: 100,
    outputTokens: 50,
    toolCalls: variant === "F" ? 4 : 0,
    ms: 1000,
    bytes: 2000,
  },
});

describe("median", () => {
  it("is the middle value, the mean of the two middle ones for an even count", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([])).toBeNaN();
  });
});

describe("summarize", () => {
  const records = [
    run("a", "F", 1, 90, ["x"]),
    run("a", "F", 2, 70, ["x", "y"]),
    run("a", "F", 3, 80),
    run("b", "F", 1, 60, ["x"]),
    run("b", "F", 2, 60),
    run("b", "F", 3, 60),
    run("a", "0", 1, 40),
    run("a", "0", 2, 30),
    run("a", "0", 3, 20),
    run("b", "0", 1, 10),
    run("b", "0", 2, 10),
    run("b", "0", 3, 50, ["z"]),
  ];

  it("takes the median per task and the median over the tasks, F and 0 apart", () => {
    const summary = summarize(records);
    expect(summary.variants.F.tasks).toEqual([
      { task: "a", median: 80, min: 70, max: 90, scores: [90, 70, 80] },
      { task: "b", median: 60, min: 60, max: 60, scores: [60, 60, 60] },
    ]);
    expect(summary.variants.F.median).toBe(70);
    expect(summary.variants["0"].median).toBe(20);
  });

  it("states the spread: per task max − min, and its median", () => {
    const summary = summarize(records);
    expect(summary.variants.F.spread).toBe(10);
    expect(summary.variants["0"].spread).toBe(30);
  });

  it("ranks the gaps of Variante F by count, ties by name, at most 10", () => {
    expect(summarize(records).gaps).toEqual([
      { kind: "regulo", key: "x", count: 3 },
      { kind: "regulo", key: "y", count: 1 },
    ]);
  });

  it("adds up the tokens and reports K7 as medians, not in the score", () => {
    const summary = summarize(records);
    expect(summary.tokens).toEqual({ input: 1200, output: 600 });
    expect(summary.variants.F.effort).toEqual({
      inputTokens: 100,
      outputTokens: 50,
      toolCalls: 4,
      ms: 1000,
      bytes: 2000,
    });
  });

  it("a failed run counts as 0 and is named", () => {
    const failed: RunRecord = { ...run("a", "F", 1, 0), error: "timeout" };
    const summary = summarize([failed, run("a", "F", 2, 80), run("a", "F", 3, 90)]);
    expect(summary.variants.F.tasks[0]?.scores).toEqual([0, 80, 90]);
    expect(summary.failed).toEqual([{ task: "a", variant: "F", repeat: 1, error: "timeout" }]);
  });
});
