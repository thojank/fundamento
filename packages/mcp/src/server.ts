// The Fundamento MCP server (Spec 001, D-13): ten read-only tools over the served export, on the
// SDK's low-level Server. Inputs are validated against the tool schemas; results carry
// structuredContent plus the same JSON as text for older clients.

import type { ErrorObject } from "@fundamento/modelo";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { bundleResultSchema, bundleSchema } from "./bundle.js";
import type { Served } from "./load.js";
import { compileToolSchemas, type ToolName } from "./schemas.js";
import { TOOLS, type ToolResult } from "./tools.js";

export const SERVER_NAME = "fundamento";

function inputIssues(errors: readonly ErrorObject[] | null | undefined, tool: string): ToolResult {
  return {
    ok: false,
    envelope: {
      issues: (errors ?? []).map((error) => ({
        rule: "mcp-input-invalid",
        severity: "error",
        path: `${tool}${error.instancePath}`,
        message: `Input ${error.message ?? "is invalid"}${
          typeof error.params.additionalProperty === "string"
            ? ` ('${error.params.additionalProperty}')`
            : ""
        }.`,
        suggestion: `Call ${tool} with an input that matches its inputSchema (tools/list).`,
      })),
    },
  };
}

function asCallResult(result: ToolResult) {
  const body = result.ok ? result.output : result.envelope;
  return {
    content: [{ type: "text" as const, text: JSON.stringify(body) }],
    structuredContent: body,
    ...(result.ok ? {} : { isError: true }),
  };
}

export function createFundamentoServer(served: Served): Server {
  const tools = compileToolSchemas();
  const server = new Server(
    { name: SERVER_NAME, version: served.modeloJson.fundamento.version },
    { capabilities: { tools: {} } },
  );
  const listed = tools.map((tool) => ({
    name: tool.name,
    description: String(tool.input.schema.description ?? tool.name),
    inputSchema: bundleSchema(tool.input.schema) as { type: "object" },
    outputSchema: bundleResultSchema(tool.output.schema, tool.error.schema) as { type: "object" },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  }));
  server.setRequestHandler(ListToolsRequestSchema, () => ({ tools: listed }));
  server.setRequestHandler(CallToolRequestSchema, (request) => {
    const name = request.params.name as ToolName;
    const tool = tools.find((candidate) => candidate.name === name);
    const args = request.params.arguments ?? {};
    if (tool === undefined) {
      return asCallResult({
        ok: false,
        envelope: {
          issues: [
            {
              rule: "mcp-input-invalid",
              severity: "error",
              path: name,
              message: `There is no tool ${name}.`,
              suggestion: `Use one of: ${tools.map((candidate) => candidate.name).join(", ")}.`,
            },
          ],
        },
      });
    }
    if (!tool.input.validate(args))
      return asCallResult(inputIssues(tool.input.validate.errors, name));
    const implementation = TOOLS[name];
    if (implementation === undefined) {
      return asCallResult({
        ok: false,
        envelope: {
          issues: [
            {
              rule: "mcp-input-invalid",
              severity: "error",
              path: name,
              message: `The tool ${name} is not implemented yet.`,
              suggestion: "Spec 001 T025 adds it.",
            },
          ],
        },
      });
    }
    return asCallResult(implementation(served, args));
  });
  return server;
}
