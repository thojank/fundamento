#!/usr/bin/env node
// Entry point of @fundamento/mcp: the library API and the `fundamento-mcp` bin edge, the only
// place that touches `process.argv` and the exit code.

import { parseArgs } from "node:util";
import { isProcessEntry, nodeVersionProblem } from "./node-version.js";
import { MCP_FLAGS, McpUsageError, mcpHelp, mcpOptions, runMcp } from "./start.js";
import { nearest } from "./tools.js";

export { DEFAULT_HTTP_PORT, type HttpServer, startHttpServer } from "./http.js";
export { type LoadOptions, loadServed, type Served, ServedLoadError } from "./load.js";
export { TOOL_NAMES, type ToolName } from "./schemas.js";
export { createFundamentoServer, type ServerOptions } from "./server.js";
export {
  MCP_FLAGS,
  type McpIo,
  type McpOptions,
  McpUsageError,
  mcpHelp,
  mcpOptions,
  runMcp,
} from "./start.js";

const NAME = "fundamento-mcp";

function parse(args: readonly string[]) {
  const { tokens } = parseArgs({
    args: [...args],
    options: MCP_FLAGS,
    strict: false,
    allowPositionals: true,
    tokens: true,
  });
  for (const token of tokens) {
    if (token.kind === "option" && !Object.hasOwn(MCP_FLAGS, token.name)) {
      const known = Object.keys(MCP_FLAGS).map((flag) => `--${flag}`);
      throw new McpUsageError(`Unknown option '${token.rawName}' for \`${NAME}\`.`, [
        `Did you mean \`${nearest(token.rawName, known, 1)[0]}\`?`,
      ]);
    }
  }
  try {
    return parseArgs({ args: [...args], options: MCP_FLAGS, strict: true, allowPositionals: true });
  } catch (error) {
    throw new McpUsageError(
      `Invalid arguments for \`${NAME}\`: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function runFromProcess(): Promise<void> {
  const stderr = (text: string) => process.stderr.write(text);
  const args = process.argv.slice(2);
  try {
    if (args.includes("--help") || args.includes("-h")) {
      process.stdout.write(mcpHelp(NAME));
      return;
    }
    const { values, positionals } = parse(args);
    const options = mcpOptions(values, positionals, process.cwd(), NAME);
    process.exitCode = await runMcp(options, { stderr }, NAME);
  } catch (error) {
    if (error instanceof McpUsageError) {
      stderr(`${NAME}: ${[error.message, ...error.hints].join("\n")}\n`);
      process.exitCode = 2;
      return;
    }
    stderr(
      `${NAME}: unexpected error: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 2;
  }
}

// Before the entry guard: on Node < 24 `import.meta.main` is undefined and the bin would end
// silently with exit 0.
const versionProblem = nodeVersionProblem(process.versions.node);
if (versionProblem !== undefined && isProcessEntry(import.meta.url)) {
  process.stderr.write(`fundamento-mcp: ${versionProblem}`);
  process.exitCode = 1;
} else if (import.meta.main) {
  await runFromProcess();
}
