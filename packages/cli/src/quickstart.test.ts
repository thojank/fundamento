// The developer quickstart (Art. XIII, quickstart.md; task T028): spawn `fm mcp` without any
// configuration, then initialize, tools/list and describe, as an MCP client would; then take the
// prompt gvidanto and ask one explain question (Spec 002 S8, T025). The SDK client
// validates structuredContent against the listed outputSchema, so a non-conformant answer
// throws. Timing is not asserted here: this runs inside the parallel test run, and AK-07 belongs
// to `pnpm perf` alone (Spec 001 D-17).

import { fileURLToPath } from "node:url";
import { TOOL_NAMES } from "@fundamento/mcp";
import { Client, type Transport } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { afterAll, describe, expect, it } from "vitest";

const FM = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const client = new Client({ name: "quickstart", version: "0" });
afterAll(() => client.close());

describe("quickstart: fm mcp", () => {
  it("initializes, lists every tool and answers describe", async () => {
    await client.connect(
      new StdioClientTransport({
        command: process.execPath,
        args: [FM, "mcp"],
        stderr: "ignore",
      }) as Transport,
    );
    expect(client.getServerVersion()?.name).toBe("fundamento");
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(TOOL_NAMES.length);
    const described = (await client.callTool({ name: "describe", arguments: {} })) as {
      isError?: boolean;
      structuredContent?: { aspektoj: { name: string }[]; sentence: string };
    };
    expect(described.isError).toBeFalsy();
    expect(described.structuredContent?.aspektoj.map((aspekto) => aspekto.name)).toEqual([
      "komuna",
    ]);
    expect(described.structuredContent?.sentence).toMatch(/^Fundamento v/);
  });

  it("offers the prompt gvidanto and answers explain (Spec 002 S8)", async () => {
    const { prompts } = await client.listPrompts();
    expect(prompts.map((prompt) => prompt.name)).toEqual(["gvidanto"]);
    const prompt = await client.getPrompt({ name: "gvidanto" });
    expect(JSON.stringify(prompt.messages)).toContain("check_contrast");
    const explained = (await client.callTool({
      name: "explain",
      arguments: {
        token: "color.text.subtle",
        assignment: { "color-scheme": "dark", contrast: "high" },
      },
    })) as {
      isError?: boolean;
      structuredContent?: { reguloj: { name: string; kialo: string }[] };
    };
    expect(explained.isError).toBeFalsy();
    const hierarchy = explained.structuredContent?.reguloj.find(
      (regulo) => regulo.name === "text-hierarchy",
    );
    expect(hierarchy?.kialo.length ?? 0).toBeGreaterThan(40);
  });
});
