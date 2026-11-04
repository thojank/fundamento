// The Gvidanto over MCP (Spec 037 D-16): ekranoj is a client only. It starts a given command over
// stdio (`fm mcp --config …`, wired by the caller) and offers the agent the tools that build a
// screen – nothing that configures or writes a brand. The allowlist is applied twice: the bridge
// lists and calls only these tools, and the agent drops the writing tools of any injected bridge.

import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import type { ToolBridge, ToolInfo } from "./tipoj.js";

/**
 * The tools an agent that builds a screen is offered (implementation spec S037-03): describe the
 * system, find and read Eroj and Sxablonoj, read tokens, read and explain Reguloj, explain terms,
 * check the use. Not offered: the brand workshop (below) and the tools about brands and their
 * values (`list_aspektoj`, `list_dimensioj`, `resolve`, `validate`, `check_contrast`, …) – a
 * fragment names no brand and no value (AC-7).
 */
export const KONSTRUAJ_ILOJ = [
  "describe",
  "list_eroj",
  "suggest_ero",
  "get_ero",
  "list_sxablonoj",
  "get_sxablono",
  "get_token",
  "search_tokens",
  "list_reguloj",
  "explain_regulo",
  "describe_term",
  "check_usage",
] as const;

/** The brand workshop: writes files or configures a brand; never offered. */
export const SKRIBAJ_ILOJ = ["save_agordo", "preview_agordo", "propose_agordo"] as const;

const permesitaj: ReadonlySet<string> = new Set(KONSTRUAJ_ILOJ);
const skribaj: ReadonlySet<string> = new Set(SKRIBAJ_ILOJ);

/** Whether the agent may be offered a tool: on the allowlist and never a writing one. */
export function permesitaIlo(nomo: string): boolean {
  return permesitaj.has(nomo) && !skribaj.has(nomo);
}

/** Only the tools of the allowlist, in the order of the server. */
export function filtriIlojn(iloj: readonly ToolInfo[]): ToolInfo[] {
  return iloj.filter((ilo) => permesitaIlo(ilo.name));
}

/** What the bridge needs of an MCP client, already as text (a test passes a double). */
export interface McpKliento {
  iloj(): Promise<ToolInfo[]>;
  voki(nomo: string, args: Record<string, unknown>): Promise<string>;
  prompto(nomo: string): Promise<string>;
}

/** The bridge the agent uses: the allowlist on `list` and on `call`, the gvidanto prompt cached. */
export function pontoDe(kliento: McpKliento): ToolBridge {
  let iloj: ToolInfo[] | undefined;
  let gvidanto: string | undefined;
  return {
    async list() {
      iloj ??= filtriIlojn(await kliento.iloj());
      return iloj;
    },
    async call(nomo, args) {
      if (!permesitaIlo(nomo)) {
        return JSON.stringify({ error: `${nomo} ist beim Bauen eines Screens nicht verfügbar.` });
      }
      return kliento.voki(nomo, args);
    },
    async prompt() {
      gvidanto ??= await kliento.prompto("gvidanto");
      return gvidanto;
    },
  };
}

/** The command that starts the MCP server of the Gvidanto (e.g. `node <cli>/dist/index.js mcp …`). */
export interface GvidantoKomando {
  command: string;
  args: string[];
  cwd?: string;
}

export interface GvidantoKonekto {
  ponto: ToolBridge;
  fermi(): Promise<void>;
}

const tekstoDe = (rezulto: { content?: unknown }): string =>
  (Array.isArray(rezulto.content) ? (rezulto.content as { type?: string; text?: string }[]) : [])
    .filter((ero) => ero.type === "text")
    .map((ero) => ero.text ?? "")
    .join("\n");

/**
 * Connects to the Gvidanto over stdio. The child gets the SDK's default environment (PATH, HOME …),
 * never the provider keys of the caller. Its stderr goes line by line to `log` (the caller redacts).
 */
export async function konektiGvidanton(
  komando: GvidantoKomando,
  opcioj: { log?: (linio: string) => void } = {},
): Promise<GvidantoKonekto> {
  const transport = new StdioClientTransport({
    command: komando.command,
    args: komando.args,
    ...(komando.cwd === undefined ? {} : { cwd: komando.cwd }),
    stderr: "pipe",
  });
  const log = opcioj.log;
  transport.stderr?.on("data", (chunk: Buffer | string) => {
    for (const linio of String(chunk).split("\n")) {
      if (linio.trim() !== "") log?.(`Gvidanto: ${linio.trim()}`);
    }
  });
  const client = new Client({ name: "ekranoj", version: "0.2.0" });
  await client.connect(transport);
  const kliento: McpKliento = {
    async iloj() {
      return (await client.listTools()).tools.map((ilo) => ({
        name: ilo.name,
        ...(ilo.description === undefined ? {} : { description: ilo.description }),
        inputSchema: ilo.inputSchema as Record<string, unknown>,
      }));
    },
    async voki(nomo, args) {
      return tekstoDe(await client.callTool({ name: nomo, arguments: args }));
    },
    async prompto(nomo) {
      const prompto = await client.getPrompt({ name: nomo });
      return prompto.messages
        .map((mesagxo) => (mesagxo.content as { text?: string }).text ?? "")
        .join("\n");
    },
  };
  return { ponto: pontoDe(kliento), fermi: () => client.close() };
}
