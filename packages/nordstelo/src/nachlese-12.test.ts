// Nachlese 12 ② (Entscheidung O-8 vom 27.10.): Reihe O is measured at all three points with the
// same, current tool; only the system changes (Eroj, Modelo, Gvidanto, Projekcioj). The tool takes
// the system from another checkout (--sistemo), and the label of a run names both commits, so a run
// of one system never continues the run of another. More than 20 % of the results without a page
// end the series: it is not measurable with this provider.

import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  defaultModeloSource,
  loadModelo,
  type Modelo,
  type NordsteloFile,
} from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { providerSchema } from "./agent.js";
import { mergeLedger } from "./limoj.js";
import { type RunDeps, runNordstelo } from "./run.js";
import { sistemoLabel, sistemoOf } from "./sistemo.js";
import { facts, h } from "./test-doubles/facts.js";

const loaded = loadModelo(defaultModeloSource()).modelo;
if (loaded === undefined) throw new Error("the repository Modelo must load");
const modelo: Modelo = loaded;
const katalogo = JSON.parse(
  readFileSync(new URL("../../modelo/data/nordstelo.json", import.meta.url), "utf8"),
) as NordsteloFile;

describe("② the system of another checkout", () => {
  it("names the built Eroj, the MCP server, the Projekcioj and the Modelo of the checkout", () => {
    const root = mkdtempSync(join(tmpdir(), "nordstelo-sistemo-"));
    for (const path of [
      "packages/eroj/dist",
      "packages/mcp/dist",
      "packages/projekcioj/dist",
      "packages/modelo/dist",
      "packages/modelo/test/fixtures/valid/aspekto-provo-kompakta",
    ])
      mkdirSync(join(root, path), { recursive: true });
    for (const file of [
      "packages/mcp/dist/index.js",
      "packages/projekcioj/dist/index.js",
      "packages/modelo/dist/index.js",
      "packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
    ])
      writeFileSync(join(root, file), "");
    expect(sistemoOf(root)).toEqual({
      root,
      erojDist: join(root, "packages/eroj/dist"),
      mcp: join(root, "packages/mcp/dist/index.js"),
      projekcioj: join(root, "packages/projekcioj/dist/index.js"),
      modelo: join(root, "packages/modelo/dist/index.js"),
      cxiujConfig: join(
        root,
        "packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
      ),
    });
  });

  it("refuses a checkout that is not built, naming what is missing", () => {
    const root = mkdtempSync(join(tmpdir(), "nordstelo-sistemo-"));
    expect(() => sistemoOf(root)).toThrow(/packages\/eroj\/dist.*pnpm build/);
  });

  it("the label of a run names the tool and the system", () => {
    expect(sistemoLabel("05f122dc", "721743fb")).toBe("05f122dc (System 721743fb)");
    expect(sistemoLabel("05f122dc", undefined)).toBe("05f122dc");
  });
});

function deps(out: string, failing: Set<string>): RunDeps & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    out,
    modelo,
    katalogo,
    commit: "05f122dc (System 721743fb)",
    anbieter: "openrouter",
    modell: "nvidia/nemotron-3-ultra-550b-a55b:free",
    now: () => new Date("2026-10-29T10:00:00Z"),
    log: () => {},
    agent: async ({ task, variant, budget }) => {
      const name = katalogo.taskoj.find((entry) => entry.teksto.de === task)?.name ?? task;
      const key = `${variant} ${name}`;
      calls.push(key);
      if (failing.has(key)) throw new Error("Anbieter openrouter: Antwort ohne Nachricht.");
      budget.charge(50, 50);
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

describe("② more than 20 % without a page end the series", () => {
  const taskoj = ["anmeldung", "faq", "werkzeugliste", "einstellungen", "detailseite"];
  const options = {
    taskoj,
    variants: ["F", "0"] as ("F" | "0")[],
    repeats: 1,
    maxTokens: 1_000_000,
    concurrency: 1,
    maxOhneSeite: 0.2,
  };

  it("two of ten without a page is 20 %: the run goes on", async () => {
    const out = mkdtempSync(join(tmpdir(), "nordstelo-n12-"));
    const failing = new Set(["F anmeldung", "0 anmeldung"]);
    const result = await runNordstelo(options, deps(out, failing));
    expect(result.aborted).toBeUndefined();
    expect(result.summary.failed).toHaveLength(2);
  });

  it("the third of ten without a page stops it, and the report says the series is not measurable", async () => {
    const out = mkdtempSync(join(tmpdir(), "nordstelo-n12-"));
    const failing = new Set(["F anmeldung", "0 anmeldung", "F werkzeugliste"]);
    const d = deps(out, failing);
    const result = await runNordstelo(options, d);
    expect(result.aborted).toMatch(/Mehr als 20 % .*ohne Seite.*nicht messbar mit diesem Anbieter/);
    expect(d.calls.length).toBeLessThan(10);
    expect(readFileSync(join(out, result.id, "raporto.md"), "utf8")).toMatch(/nicht messbar/);
  });
});

describe("② the tool offers an older system's tools in a form every provider takes", () => {
  it("a root with oneOf (the Gvidanto before Nachlese 11 B-3) is merged into one object, as the tool of Spec 030 did", () => {
    expect(
      providerSchema({
        $schema: "x",
        type: "object",
        properties: { lingvo: { type: "string" } },
        oneOf: [
          { properties: { name: { type: "string" } }, required: ["name"] },
          { properties: { id: { type: "string" } }, required: ["id"] },
        ],
      }),
    ).toEqual({
      type: "object",
      properties: { lingvo: { type: "string" }, name: { type: "string" }, id: { type: "string" } },
    });
  });

  it("a schema of today's Gvidanto is offered as it is", () => {
    const today = { type: "object", properties: { name: { type: "string" } } };
    expect(providerSchema(today)).toEqual(today);
  });
});

describe("② two runs at the same time keep each other's count of requests", () => {
  it("the ledger merges with what another run wrote, the higher count per provider and day", () => {
    expect(
      mergeLedger(
        { "openrouter 2026-10-29": 300, "mistral 2026-10-29": 10 },
        { "mistral 2026-10-29": 40 },
      ),
    ).toEqual({ "openrouter 2026-10-29": 300, "mistral 2026-10-29": 40 });
  });
});
