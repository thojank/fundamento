// A run (Spec 030, Ablauf 2–7): every task × variant × repeat goes to the agent, the page is
// rendered and scored; the run writes its results with date, commit, model and figures, and the
// history the Metiejo shows. A budget of tokens per run is the cost limit: when it is reached the
// run stops and still writes its report. Doubles stand in for the agent and the browser.

import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { NordsteloHistorio } from "@fundamento/metiejo";
import {
  defaultModeloSource,
  loadModelo,
  type Modelo,
  type NordsteloFile,
} from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import type { Budget } from "./agent.js";
import type { Facts } from "./facts.js";
import { k8 } from "./k8/k8.js";
import { type RunDeps, runNordstelo } from "./run.js";
import { facts, h } from "./test-doubles/facts.js";

const loaded = loadModelo(defaultModeloSource()).modelo;
if (loaded === undefined) throw new Error("the repository Modelo must load");
const modelo: Modelo = loaded;
const katalogo = JSON.parse(
  readFileSync(new URL("../../modelo/data/nordstelo.json", import.meta.url), "utf8"),
) as NordsteloFile;
const SECRET = "sk-never-in-a-file-42";

function deps(out: string, tokensPerRun = 1000): RunDeps & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    out,
    modelo,
    katalogo,
    commit: "d29a520",
    anbieter: "mistral",
    modell: "mistral-large-latest",
    now: () => new Date("2026-10-23T22:00:00Z"),
    log: () => {},
    agent: async ({
      task,
      variant,
      budget,
    }: {
      task: string;
      variant: "F" | "0";
      budget: Budget;
    }) => {
      budget.charge(tokensPerRun / 2, tokensPerRun / 2);
      calls.push(`${variant} ${task.slice(0, 12)}`);
      return {
        html: '<fm-butono emphasis="high">Los</fm-butono>',
        effort: {
          inputTokens: tokensPerRun / 2,
          outputTokens: tokensPerRun / 2,
          toolCalls: 1,
          ms: 10,
          bytes: 40,
        },
        transcript: [{ role: "user", content: task }],
      };
    },
    render: async () => ({
      facts: facts(
        [h("fm-butono", { emphasis: "high" }, "Los")],
        [{ role: "button", name: "Los" }],
      ),
      screenshot: new Uint8Array([137, 80, 78, 71]),
    }),
  };
}

describe("runNordstelo", () => {
  it("runs every task × variant × repeat and writes page, facts, score, report and history", async () => {
    const out = mkdtempSync(join(tmpdir(), "nordstelo-"));
    const d = deps(out);
    const result = await runNordstelo(
      {
        taskoj: ["anmeldung", "faq"],
        variants: ["F", "0"],
        repeats: 3,
        maxTokens: 1_000_000,
        concurrency: 2,
      },
      d,
    );
    expect(d.calls).toHaveLength(12);
    expect(result.aborted).toBeUndefined();
    const dir = join(out, result.id);
    expect(readdirSync(join(dir, "anmeldung")).sort()).toEqual([
      "0-1",
      "0-2",
      "0-3",
      "F-1",
      "F-2",
      "F-3",
    ]);
    expect(readdirSync(join(dir, "anmeldung", "F-1")).sort()).toEqual([
      "bildo.png",
      "fakto.json",
      "pagxo.html",
      "rezulto.json",
    ]);
    const report = JSON.parse(readFileSync(join(dir, "raporto.json"), "utf8"));
    expect(report).toMatchObject({
      commit: "d29a520",
      anbieter: "mistral",
      modell: "mistral-large-latest",
      dato: "2026-10-23T22:00:00.000Z",
    });
    expect(report.summary.tokens).toEqual({ input: 6000, output: 6000 });
    const historio = JSON.parse(
      readFileSync(join(out, "historio.json"), "utf8"),
    ) as NordsteloHistorio;
    expect(historio.kuroj).toHaveLength(1);
    expect(historio.kuroj[0]).toMatchObject({
      id: result.id,
      commit: "d29a520",
      tokens: { input: 6000, output: 6000 },
    });
    expect(historio.kuroj[0]?.taskoj.map((tasko) => tasko.tasko)).toEqual(["anmeldung", "faq"]);
    expect(historio.kuroj[0]?.taskoj[0]?.pagxo).toBe(`${result.id}/anmeldung/F-1/pagxo.html`);
    expect(readFileSync(join(dir, "raporto.md"), "utf8")).toMatch(/Kennzahl F/);
  });

  it("stops at the cost limit and still writes the report, marked as stopped", async () => {
    const out = mkdtempSync(join(tmpdir(), "nordstelo-"));
    const d = deps(out, 1000);
    const result = await runNordstelo(
      { taskoj: ["anmeldung"], variants: ["F", "0"], repeats: 3, maxTokens: 2500, concurrency: 1 },
      d,
    );
    expect(result.aborted).toMatch(/Kostengrenze/);
    expect(d.calls.length).toBeLessThan(6);
    const report = JSON.parse(readFileSync(join(out, result.id, "raporto.json"), "utf8"));
    expect(report.aborted).toMatch(/2500/);
    const historio = JSON.parse(
      readFileSync(join(out, "historio.json"), "utf8"),
    ) as NordsteloHistorio;
    expect(historio.kuroj[0]?.abgebrochen).toMatch(/Kostengrenze/);
  });

  it("appends to the history, oldest first", async () => {
    const out = mkdtempSync(join(tmpdir(), "nordstelo-"));
    await runNordstelo(
      { taskoj: ["faq"], variants: ["F"], repeats: 1, maxTokens: 1_000_000, concurrency: 1 },
      deps(out),
    );
    const second = deps(out);
    second.now = () => new Date("2026-10-24T08:00:00Z");
    await runNordstelo(
      { taskoj: ["faq"], variants: ["F"], repeats: 1, maxTokens: 1_000_000, concurrency: 1 },
      second,
    );
    const historio = JSON.parse(
      readFileSync(join(out, "historio.json"), "utf8"),
    ) as NordsteloHistorio;
    expect(historio.kuroj.map((kuro) => kuro.dato)).toEqual([
      "2026-10-23T22:00:00.000Z",
      "2026-10-24T08:00:00.000Z",
    ]);
  });

  it("no file of a run holds a key", async () => {
    const out = mkdtempSync(join(tmpdir(), "nordstelo-"));
    const d = deps(out);
    process.env.NORDSTELO_TEST_KEY = SECRET;
    const result = await runNordstelo(
      { taskoj: ["faq"], variants: ["F"], repeats: 1, maxTokens: 1_000_000, concurrency: 1 },
      d,
    );
    const texts = [
      readFileSync(join(out, result.id, "raporto.json"), "utf8"),
      readFileSync(join(out, result.id, "raporto.md"), "utf8"),
      readFileSync(join(out, result.id, "faq", "F-1", "rezulto.json"), "utf8"),
      readFileSync(join(out, "historio.json"), "utf8"),
    ];
    for (const text of texts) expect(text).not.toContain(SECRET);
    delete process.env.NORDSTELO_TEST_KEY;
  });
});

// Spec 038 (F-S038-13-2): `raporto.json` carries K8 per record exactly when the render had K8
// facts – the share of the score (`k8.kvoto`), never a weight.
describe("runNordstelo: K8 per record in raporto.json", () => {
  const k8Facts = JSON.parse(
    readFileSync(new URL("../test/fixtures/k8/roh/faktoj.json", import.meta.url), "utf8"),
  ) as Facts;

  const records = async (render: RunDeps["render"]) => {
    const out = mkdtempSync(join(tmpdir(), "nordstelo-"));
    const d = { ...deps(out), render };
    const result = await runNordstelo(
      { taskoj: ["faq"], variants: ["F", "0"], repeats: 1, maxTokens: 1_000_000, concurrency: 1 },
      d,
    );
    const report = JSON.parse(readFileSync(join(out, result.id, "raporto.json"), "utf8")) as {
      records: Record<string, unknown>[];
    };
    return report.records;
  };

  it("has records[].k8 = k8(facts).kvoto with K8 facts", async () => {
    const atendo = k8(k8Facts, modelo)?.kvoto;
    expect(typeof atendo).toBe("number");
    const kun = await records(async () => ({
      facts: structuredClone(k8Facts),
      screenshot: new Uint8Array([137, 80, 78, 71]),
    }));
    expect(kun).toHaveLength(2);
    for (const record of kun) expect(record.k8).toBe(atendo);
  });

  it("has no records[].k8 without K8 facts", async () => {
    const sen = await records(deps("unused").render);
    expect(sen).toHaveLength(2);
    for (const record of sen) expect("k8" in record).toBe(false);
  });
});
