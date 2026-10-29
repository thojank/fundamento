// The access of Variante F (Spec 030): the Gvidanto as an MCP server, connected in the process over
// the SDK's in-memory transport – the same server `fundamento-mcp` starts, the same tools and the
// same prompt. The tools of the brand workshop are left out: save_agordo writes files, and
// preview_agordo and propose_agordo configure a brand rather than build a screen with one.

import { createFundamentoServer, loadServed, type Served } from "@fundamento/mcp";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import type { ToolBridge, ToolInfo } from "./agent.js";

/** Tools an agent that builds a screen is not offered: the brand workshop (Agordo). */
export const WRITING_TOOLS = new Set(["save_agordo", "preview_agordo", "propose_agordo"]);

export interface Gvidanto {
  bridge: ToolBridge;
  served: Served;
  close(): Promise<void>;
}

const textOf = (result: { content?: unknown }): string =>
  ((result.content ?? []) as { type?: string; text?: string }[])
    .filter((entry) => entry.type === "text")
    .map((entry) => entry.text ?? "")
    .join("\n");

/** The MCP server of a system (Nachlese 12 ②): this checkout's, or another checkout's module. */
export interface GvidantoModule {
  createFundamentoServer: typeof createFundamentoServer;
  loadServed: typeof loadServed;
}

export async function connectGvidanto(
  served?: Served,
  module: GvidantoModule = { createFundamentoServer, loadServed },
): Promise<Gvidanto> {
  const servedNow = served ?? module.loadServed();
  const server = module.createFundamentoServer(servedNow);
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "nordstelo", version: "0.2.0" });
  await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
  let tools: ToolInfo[] | undefined;
  let guide: string | undefined;
  const bridge: ToolBridge = {
    async list() {
      tools ??= (await client.listTools()).tools
        .filter((tool) => !WRITING_TOOLS.has(tool.name))
        .map((tool) => ({
          name: tool.name,
          ...(tool.description === undefined ? {} : { description: tool.description }),
          inputSchema: tool.inputSchema as Record<string, unknown>,
        }));
      return tools;
    },
    async call(name, args) {
      if (WRITING_TOOLS.has(name))
        return JSON.stringify({ error: `${name} ist hier nicht verfügbar.` });
      return textOf(await client.callTool({ name, arguments: args }));
    },
    async prompt() {
      if (guide === undefined) {
        const prompt = await client.getPrompt({ name: "gvidanto" });
        guide = prompt.messages
          .map((message) => (message.content as { type?: string; text?: string }).text ?? "")
          .join("\n");
      }
      return guide;
    },
  };
  return { bridge, served: servedNow, close: () => client.close() };
}
