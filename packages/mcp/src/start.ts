// Starting the server from a command line: shared by the `fundamento-mcp` bin and `fm mcp`
// (Spec 001, D-13). Logs go to stderr only; under stdio, stdout belongs to the protocol.

import { resolve } from "node:path";
import type { ValidationIssue } from "@fundamento/modelo";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { DEFAULT_HTTP_PORT, startHttpServer } from "./http.js";
import { loadServed, type Served, ServedLoadError } from "./load.js";
import { createFundamentoServer } from "./server.js";

/** The flags, in `node:util` parseArgs form. */
export const MCP_FLAGS = {
  config: { type: "string" },
  export: { type: "string" },
  http: { type: "boolean" },
  port: { type: "string" },
} as const;

export function mcpHelp(commandLine: string): string {
  return `${commandLine}: Serve the Modelo to AI agents over MCP (read-only).

Usage: ${commandLine} [--config <file>] [--export <dir>] [--http [--port <n>]]

Serves ten read-only tools (describe, list_dimensioj, list_aspektoj, search_tokens, get_token,
resolve, list_reguloj, list_jugxoj, validate, derive_name) and the export files as resources.
Without --config and --export, serves the Modelo of this repository with its reference Aspekto
komuna. The export is built in memory at start, with the same function as \`fm modelo export\`.

Options:
  --config <file>  A project's fundamento.config.json: the core, komuna and its Aspekto packages
  --export <dir>   Serve a directory written by \`fm modelo export\` as is
  --http           Serve Streamable HTTP on 127.0.0.1 instead of stdio
  --port <n>       HTTP port (default: ${DEFAULT_HTTP_PORT}; only with --http)
  -h, --help       Show this help

Logs go to stderr. Exit codes: 0 stopped, 1 the Modelo cannot be read, 2 usage error.
`;
}

export interface McpOptions {
  config?: string;
  exportDir?: string;
  http: boolean;
  port: number;
}

/** A mistake in the flags; `hints` are extra lines such as "Did you mean …?". */
export class McpUsageError extends Error {
  readonly hints: readonly string[];
  constructor(message: string, hints: readonly string[] = []) {
    super(message);
    this.name = "McpUsageError";
    this.hints = hints;
  }
}

/** Checks parsed flag values; relative paths resolve against `baseDir`. */
export function mcpOptions(
  values: Readonly<Record<string, unknown>>,
  positionals: readonly string[],
  baseDir: string,
  commandLine: string,
): McpOptions {
  if (positionals.length > 0) {
    throw new McpUsageError(
      `\`${commandLine}\` takes no arguments, got: ${positionals.join(" ")}.`,
      ["Pass a project config with --config <file> or an export with --export <dir>."],
    );
  }
  const config = typeof values.config === "string" ? values.config : undefined;
  const exportDir = typeof values.export === "string" ? values.export : undefined;
  if (config !== undefined && exportDir !== undefined) {
    throw new McpUsageError(`\`${commandLine}\` takes --config or --export, not both.`, [
      "An export already contains the composed Modelo of its config.",
    ]);
  }
  const http = values.http === true;
  let port = DEFAULT_HTTP_PORT;
  if (typeof values.port === "string") {
    if (!http) {
      throw new McpUsageError(`--port needs --http; stdio has no port.`, [
        `Run \`${commandLine} --http --port ${values.port}\`.`,
      ]);
    }
    port = Number(values.port);
    if (!/^\d+$/.test(values.port) || port < 1 || port > 65_535) {
      throw new McpUsageError(
        `--port must be a port number from 1 to 65535, got '${values.port}'.`,
      );
    }
  }
  const options: McpOptions = { http, port };
  if (config !== undefined) options.config = resolve(baseDir, config);
  if (exportDir !== undefined) options.exportDir = resolve(baseDir, exportDir);
  return options;
}

export interface McpIo {
  stderr: (text: string) => void;
}

function issueLine(issue: ValidationIssue): string {
  return `  [${issue.severity}] ${issue.rule} ${issue.path}: ${issue.message} ${issue.suggestion}`;
}

function served(options: McpOptions, io: McpIo, name: string): Served | undefined {
  try {
    const loadOptions: { config?: string; exportDir?: string } = {};
    if (options.config !== undefined) loadOptions.config = options.config;
    if (options.exportDir !== undefined) loadOptions.exportDir = options.exportDir;
    return loadServed(loadOptions);
  } catch (error) {
    if (error instanceof ServedLoadError) {
      io.stderr(`${name}: the Modelo cannot be read:\n${error.issues.map(issueLine).join("\n")}\n`);
      return undefined;
    }
    const reason = error instanceof Error ? error.message : String(error);
    io.stderr(`${name}: the Modelo cannot be read: ${reason}\n`);
    return undefined;
  }
}

/** Runs the server until its transport closes (stdio) or the process is signalled (HTTP). */
export async function runMcp(options: McpOptions, io: McpIo, name: string): Promise<number> {
  const current = served(options, io, name);
  if (current === undefined) return 1;
  const { errors, warnings } = current.report;
  const aspektoj = current.modeloJson.aspektoj.map((entry) => entry.name).join(", ");
  io.stderr(
    `${name}: serving ${current.modeloJson.tokens.length} tokens (Aspektoj: ${aspektoj}); ${errors.length} error(s), ${warnings.length} warning(s).\n`,
  );
  if (errors.length > 0) {
    io.stderr(`${name}: the Modelo is invalid; call the validate tool for the issues.\n`);
  }
  if (options.http) {
    const http = await startHttpServer(current, { port: options.port });
    io.stderr(`${name}: listening on ${http.url}\n`);
    await new Promise<void>((done) => {
      for (const signal of ["SIGINT", "SIGTERM"] as const) process.once(signal, () => done());
    });
    await http.close();
    return 0;
  }
  const server = createFundamentoServer(current, { transport: "stdio" });
  const transport = new StdioServerTransport();
  const closed = new Promise<void>((done) => {
    server.onclose = () => done();
    process.stdin.once("end", () => done());
  });
  await server.connect(transport as Transport);
  await closed;
  await server.close();
  return 0;
}
