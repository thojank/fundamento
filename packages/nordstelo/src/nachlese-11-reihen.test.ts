// Nachlese 11 ④ (drei Messreihen H, O, K) and O-6 (maintainer, 24.10.):
// - O-6: K2 reads the regions of a Sxablono by their names; a child in a region is no invented slot.
// - The limits of a provider are settings of the run: requests per second and per day; Mistral
//   (Reihe K) 0.5 per second, OpenRouter (Reihe O) 1 000 per day.
// - On 429 the run waits and tries again with a growing interval; it does not stop.
// - At the daily limit the run keeps its state and continues the next day with the same command;
//   the results already done stay valid.
// - Before the start the run estimates its requests and says when the daily limit is not enough.
// - The report counts the requests.

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { NordsteloHistorio } from "@fundamento/metiejo";
import {
  defaultModeloSource,
  loadModelo,
  type Modelo,
  type NordsteloFile,
  type Tasko,
} from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { type Budget, providerOf, runAgent } from "./agent.js";
import { AnfragoLedger, DayLimitReached, LIMOJ, Pordisto, schaetzung } from "./limoj.js";
import { type RunDeps, runNordstelo } from "./run.js";
import { score } from "./score.js";
import { facts, h } from "./test-doubles/facts.js";

const loaded = loadModelo(defaultModeloSource()).modelo;
if (loaded === undefined) throw new Error("the repository Modelo must load");
const modelo: Modelo = loaded;
const katalogo = JSON.parse(
  readFileSync(new URL("../../modelo/data/nordstelo.json", import.meta.url), "utf8"),
) as NordsteloFile;
const tasko = katalogo.taskoj.find((entry) => entry.name === "detailseite") as Tasko;

describe("O-6: the regions of a Sxablono", () => {
  it("a child in a region of pagxo, formularo or sxelo is no invented slot", () => {
    const page = [
      h(
        "fm-sxelo",
        {},
        h("span", { slot: "brand" }, "Werkhof"),
        h(
          "fm-pagxo",
          { slot: "main" },
          h("fm-titolo", { slot: "title", level: "1" }, "Bohrmaschine"),
          h("fm-teksto", { slot: "subtitle" }, "Verfügbar"),
        ),
      ),
    ];
    const result = score({
      facts: facts(page, [{ role: "heading", name: "Bohrmaschine", level: 1 }]),
      tasko,
      variant: "F",
      modelo,
      pezoj: katalogo.pezoj,
    });
    expect(result.gaps.filter((gap) => gap.kind === "invented-slot")).toEqual([]);
    // A region the Sxablono does not have is still found.
    const wrong = score({
      facts: facts([h("fm-pagxo", {}, h("span", { slot: "kopf" }, "x"))], []),
      tasko,
      variant: "F",
      modelo,
      pezoj: katalogo.pezoj,
    });
    expect(wrong.gaps).toContainEqual({ kind: "invented-slot", key: "pagxo.slot=kopf" });
  });
});

describe("④ the limits of the providers", () => {
  it("are settings: Mistral 0.5 requests per second, OpenRouter 1 000 per day, OpenAI none", () => {
    expect(LIMOJ.mistral).toEqual({ perSekundo: 0.5 });
    expect(LIMOJ.openrouter).toEqual({ perTago: 1000 });
    expect(LIMOJ.openai).toEqual({});
  });

  it("the gate keeps the interval of requests per second", async () => {
    let clock = 0;
    const waited: number[] = [];
    const gate = new Pordisto({ perSekundo: 0.5 }, new AnfragoLedger(), {
      now: () => clock,
      sleep: async (ms) => {
        waited.push(ms);
        clock += ms;
      },
    });
    await gate.pass();
    await gate.pass();
    await gate.pass();
    expect(waited).toEqual([2000, 2000]);
  });

  it("the gate says the daily limit, counted per provider and UTC day", async () => {
    const ledger = new AnfragoLedger({ "openrouter 2026-10-24": 998 });
    const gate = new Pordisto({ perTago: 1000 }, ledger, {
      now: () => Date.parse("2026-10-24T20:00:00Z"),
      sleep: async () => {},
      provider: "openrouter",
    });
    await gate.pass();
    await gate.pass();
    await expect(gate.pass()).rejects.toBeInstanceOf(DayLimitReached);
    expect(ledger.count("openrouter", "2026-10-24")).toBe(1000);
    expect(ledger.count("openrouter", "2026-10-25")).toBe(0);
  });
});

describe("④ on 429 the agent waits with a growing interval and does not stop", () => {
  it("five 429 in a row, then the answer", async () => {
    const provider = providerOf({
      FM_KI_ANBIETER: "mistral",
      FM_KI_MODELL: "ministral-14b-2512",
      MISTRAL_API_KEY: "sk-test-0123456789",
    });
    let calls = 0;
    const waited: number[] = [];
    const result = await runAgent({
      provider,
      task: "Baue",
      variant: "0",
      budget: { ensure() {}, charge() {} } as unknown as Budget,
      sleep: async (ms) => {
        waited.push(ms);
      },
      fetch: async () => {
        calls += 1;
        if (calls <= 5) return new Response("rate", { status: 429 });
        return new Response(
          JSON.stringify({
            choices: [{ message: { role: "assistant", content: "<main>x</main>" } }],
            usage: { prompt_tokens: 10, completion_tokens: 5 },
          }),
          { status: 200 },
        );
      },
    });
    expect(result.html).toBe("<main>x</main>");
    expect(result.effort.requests).toBe(6);
    expect(waited).toHaveLength(5);
    for (let index = 1; index < waited.length; index++)
      expect(waited[index] ?? 0).toBeGreaterThan(waited[index - 1] ?? 0);
  });
});

describe("④ the estimate before the start", () => {
  it("counts the requests of the remaining results and says when a day is not enough", () => {
    const estimate = schaetzung({
      jobs: { F: 20, "0": 20 },
      perF: 25,
      limoj: { perTago: 1000 },
      todayUsed: 600,
    });
    expect(estimate.anfragoj).toBe(20 * 25 + 20);
    expect(estimate.sufficient).toBe(false);
    expect(estimate.message).toMatch(/520 Anfragen.*1000.*600.*nicht/);
    expect(
      schaetzung({ jobs: { F: 2, "0": 2 }, perF: 5, limoj: {}, todayUsed: 0 }).sufficient,
    ).toBe(true);
  });
});

function deps(out: string, stopAfter?: number): RunDeps & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    out,
    modelo,
    katalogo,
    commit: "498001e",
    anbieter: "openrouter",
    modell: "nvidia/nemotron-3-ultra-550b-a55b:free",
    now: () => new Date("2026-10-24T20:00:00Z"),
    log: () => {},
    agent: async ({ task, variant, budget }) => {
      if (stopAfter !== undefined && calls.length >= stopAfter)
        throw new DayLimitReached("openrouter", 1000);
      budget.charge(50, 50);
      calls.push(`${variant} ${task.slice(0, 12)}`);
      return {
        html: '<fm-butono emphasis="high">Los</fm-butono>',
        effort: { inputTokens: 50, outputTokens: 50, toolCalls: 1, ms: 10, bytes: 40, requests: 2 },
        transcript: [],
      };
    },
    render: async () => ({
      facts: facts(
        [h("fm-butono", { emphasis: "high" }, "Los")],
        [{ role: "button", name: "Los" }],
      ),
    }),
  };
}

describe("④ at the daily limit the run keeps its state and continues with the same command", () => {
  const options = {
    taskoj: ["anmeldung", "faq"],
    variants: ["F", "0"] as ("F" | "0")[],
    repeats: 1,
    maxTokens: 1_000_000,
    concurrency: 1,
  };

  it("pauses, writes its state and a report, and continues in the same folder", async () => {
    const out = mkdtempSync(join(tmpdir(), "nordstelo-reihen-"));
    const first = deps(out, 2);
    const paused = await runNordstelo(options, first);
    expect(paused.paused).toMatch(/Tageslimit/);
    expect(first.calls).toHaveLength(2);
    const stato = JSON.parse(readFileSync(join(out, paused.id, "stato.json"), "utf8"));
    expect(stato).toMatchObject({ finita: false, anbieter: "openrouter", commit: "498001e" });
    expect(readFileSync(join(out, paused.id, "raporto.md"), "utf8")).toMatch(/Pausiert/);

    const second = deps(out);
    const done = await runNordstelo(options, second);
    expect(done.id).toBe(paused.id);
    expect(done.paused).toBeUndefined();
    expect(second.calls).toHaveLength(2);
    expect(done.summary.variants.F.tasks.map((task) => task.task).sort()).toEqual([
      "anmeldung",
      "faq",
    ]);
    expect(done.summary.requests).toBe(8);
    const historio = JSON.parse(
      readFileSync(join(out, "historio.json"), "utf8"),
    ) as NordsteloHistorio;
    expect(historio.kuroj.map((kuro) => kuro.id)).toEqual([paused.id]);
    expect(JSON.parse(readFileSync(join(out, paused.id, "stato.json"), "utf8")).finita).toBe(true);
    expect(readFileSync(join(out, paused.id, "raporto.md"), "utf8")).toMatch(/Anfragen/);
  });

  it("a run of another commit or model starts a folder of its own", async () => {
    const out = mkdtempSync(join(tmpdir(), "nordstelo-reihen-"));
    const paused = await runNordstelo(options, deps(out, 1));
    const other = { ...deps(out), commit: "abc1234" };
    const fresh = await runNordstelo(options, other);
    expect(fresh.id).not.toBe(paused.id);
  });
});

describe("④ a timeout while the answer is read is tried again (measured at OpenRouter, 27.10.)", () => {
  it("OpenRouter sends its headers at once and the answer later: the timeout falls on the body", async () => {
    const provider = providerOf({
      FM_KI_ANBIETER: "openrouter",
      FM_KI_MODELL: "nvidia/nemotron-3-ultra-550b-a55b:free",
      OPENROUTER_API_KEY: "sk-test-0123456789",
    });
    let calls = 0;
    const result = await runAgent({
      provider,
      task: "Baue",
      variant: "0",
      budget: { ensure() {}, charge() {} } as unknown as Budget,
      sleep: async () => {},
      fetch: async () => {
        calls += 1;
        if (calls === 1) {
          const body = new ReadableStream({
            start(controller) {
              controller.error(
                new DOMException("The operation was aborted due to timeout", "TimeoutError"),
              );
            },
          });
          return new Response(body, { status: 200 });
        }
        return new Response(
          JSON.stringify({
            choices: [{ message: { role: "assistant", content: "<main>x</main>" } }],
            usage: { prompt_tokens: 10, completion_tokens: 5 },
          }),
          { status: 200 },
        );
      },
    });
    expect(result.html).toBe("<main>x</main>");
    expect(result.effort.requests).toBe(2);
  });
});
