// `fm mcp [--config <file>] [--export <dir>] [--http [--port <n>]]`: the Fundamento MCP server
// (Spec 001, D-13), the same as the `fundamento-mcp` bin of @fundamento/mcp.
import { MCP_FLAGS, McpUsageError, mcpHelp, mcpOptions, runMcp } from "@fundamento/mcp";
import { parseFlags, UsageError } from "../args.js";
import type { CliContext, Command } from "../command.js";

const COMMAND_LINE = "fm mcp";

async function run(args: readonly string[], context: CliContext): Promise<number> {
  const { values, positionals } = parseFlags(args, MCP_FLAGS, COMMAND_LINE);
  let options: ReturnType<typeof mcpOptions>;
  try {
    options = mcpOptions(values, positionals, context.baseDir, COMMAND_LINE);
  } catch (error) {
    if (error instanceof McpUsageError) throw new UsageError(error.message, error.hints);
    throw error;
  }
  return runMcp(options, { stderr: context.stderr }, COMMAND_LINE);
}

export const mcp: Command = {
  name: "mcp",
  summary: "Serve the Modelo to AI agents over MCP (stdio, or --http on 127.0.0.1).",
  help: mcpHelp(COMMAND_LINE),
  run,
};
