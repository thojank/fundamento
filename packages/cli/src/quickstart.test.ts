// The developer quickstart (Art. XIII, quickstart.md; task T028): spawn `fm mcp` without any
// configuration, then initialize, tools/list and describe, as an MCP client would. The SDK client
// validates structuredContent against the listed outputSchema, so a non-conformant answer
// throws. The AK-07 start budget applies, with the same factor 3 on a loaded machine as perf.

import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { afterAll, describe, expect, it } from "vitest";

const FM = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const LOADED = process.env.CI === "true" || process.env.TURBO_HASH !== undefined;
const START_BUDGET_MS = 2_000 * (LOADED ? 3 : 1);
const client = new Client({ name: "quickstart", version: "0" });
afterAll(() => client.close());

describe("quickstart: fm mcp", () => {
  it("initializes, lists ten tools and answers describe within the start budget", async () => {
    const started = performance.now();
    await client.connect(
      new StdioClientTransport({
        command: process.execPath,
        args: [FM, "mcp"],
        stderr: "ignore",
      }) as Transport,
    );
    expect(client.getServerVersion()?.name).toBe("fundamento");
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(10);
    const described = (await client.callTool({ name: "describe", arguments: {} })) as {
      isError?: boolean;
      structuredContent?: { aspektoj: { name: string }[]; sentence: string };
    };
    expect(described.isError).toBeFalsy();
    expect(described.structuredContent?.aspektoj.map((aspekto) => aspekto.name)).toEqual([
      "komuna",
    ]);
    expect(described.structuredContent?.sentence).toMatch(/^Fundamento v/);
    expect(performance.now() - started).toBeLessThan(START_BUDGET_MS);
  });
});
