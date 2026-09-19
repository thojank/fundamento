// AK-07: start under 2 s (spawn to the first describe answer) and resolve under 100 ms, measured
// over stdio against the heaviest fixture (core + komuna + ekzemplo). Runs only as `pnpm perf`,
// alone and outside the parallel Turborepo test run, which measured the machine's load instead
// (0.8 s alone vs 3.5-7.2 s in the gate; research.md section 8). Factor 3 only under CI=true
// (shared runners; Jugxo jug_01M2W3K1YPP05F4XF86J71RGTK). Raw timings go to stderr either way.

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { afterAll, describe, expect, it } from "vitest";
import { EKZEMPLO_CONFIG } from "../test-doubles/client.js";

const BIN = new URL("../../dist/index.js", import.meta.url).pathname;
const FACTOR = process.env.CI === "true" ? 3 : 1;
const START_BUDGET_MS = 2_000 * FACTOR;
const RESOLVE_BUDGET_MS = 100 * FACTOR;

const client = new Client({ name: "perf", version: "0" });
afterAll(() => client.close());

describe("performance (AK-07)", { timeout: 60_000 }, () => {
  it(`starts and answers describe within ${START_BUDGET_MS} ms`, async () => {
    const started = performance.now();
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [BIN, "--config", EKZEMPLO_CONFIG],
      stderr: "ignore",
    });
    await client.connect(transport as Transport);
    const described = await client.callTool({ name: "describe", arguments: {} });
    const elapsed = performance.now() - started;
    process.stderr.write(
      `AK-07 start to first describe: ${elapsed.toFixed(0)} ms (budget ${START_BUDGET_MS} ms)\n`,
    );
    expect(described.isError).toBeFalsy();
    expect(elapsed).toBeLessThan(START_BUDGET_MS);
  });

  it(`answers 100 resolve calls within ${RESOLVE_BUDGET_MS} ms each`, async () => {
    const valoroj = {
      aspekto: ["komuna", "ekzemplo"],
      "color-scheme": ["light", "dark"],
      contrast: ["default", "high"],
    };
    const timings: number[] = [];
    for (let index = 0; index < 100; index++) {
      const assignment = {
        aspekto: valoroj.aspekto[index % 2],
        "color-scheme": valoroj["color-scheme"][Math.floor(index / 2) % 2],
        contrast: valoroj.contrast[Math.floor(index / 4) % 2],
      };
      const started = performance.now();
      const result = await client.callTool({ name: "resolve", arguments: { assignment } });
      timings.push(performance.now() - started);
      expect(result.isError).toBeFalsy();
    }
    const sorted = [...timings].sort((a, b) => a - b);
    process.stderr.write(
      `AK-07 resolve (all tokens) ms: min ${sorted[0]?.toFixed(1)}, median ${sorted[50]?.toFixed(1)}, max ${sorted[99]?.toFixed(1)}; raw ${timings.map((t) => t.toFixed(1)).join(" ")}\n`,
    );
    expect(Math.max(...timings)).toBeLessThan(RESOLVE_BUDGET_MS);
  });
});
