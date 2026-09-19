// The Fundamento MCP server (Spec 001, D-13): read-only tools over the served export, on the
// low-level Server of SDK v2 (Spec 002, D-17). Inputs are validated against the tool schemas;
// results carry structuredContent plus the same JSON as text for older clients.

import { readFileSync } from "node:fs";
import type { ErrorObject } from "@fundamento/modelo";
import { ProtocolError, ProtocolErrorCode, Server } from "@modelcontextprotocol/server";
import { bundleResultSchema, bundleSchema } from "./bundle.js";
import type { Served } from "./load.js";
import { listResources, readResource } from "./resources.js";
import { type CompiledTool, compileToolSchemas, type ToolName } from "./schemas.js";
import { TOOLS, type ToolResult } from "./tools.js";

export const SERVER_NAME = "fundamento";

/** The prompt that tells a client agent how to use the tools (Spec 002 FR-13, D-15). */
export const GVIDANTO_PROMPT = {
  name: "gvidanto",
  title: "Fundamento Gvidanto",
  description:
    "How to answer questions about this design system: values only from tools, reasons with Regulo ID and kialo, check when unsure.",
};

let gvidantoText: string | undefined;

function gvidantoPromptText(): string {
  gvidantoText ??= readFileSync(new URL("../prompts/gvidanto.md", import.meta.url), "utf8");
  return gvidantoText;
}

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

export interface ServerOptions {
  /** `http` refuses `validate.aspektoPath`: a remote caller must not name local paths. */
  transport?: "stdio" | "http";
}

let compiled: CompiledTool[] | undefined;

/** Compiling the schemas is the expensive part; the HTTP transport builds a server per request. */
function toolSchemas(): CompiledTool[] {
  compiled ??= compileToolSchemas();
  return compiled;
}

function aspektoPathOverHttp(): ToolResult {
  return {
    ok: false,
    envelope: {
      issues: [
        {
          rule: "mcp-input-invalid",
          severity: "error",
          path: "validate/aspektoPath",
          message: "aspektoPath names a local directory and is accepted over stdio only.",
          suggestion:
            "Call validate without input for the served Modelo, or run `fm modelo validate --aspekto <dir>` locally.",
        },
      ],
    },
  };
}

export function createFundamentoServer(served: Served, options: ServerOptions = {}): Server {
  const tools = toolSchemas();
  const server = new Server(
    { name: SERVER_NAME, version: served.modeloJson.fundamento.version },
    { capabilities: { tools: {}, resources: {}, prompts: {} } },
  );
  server.setRequestHandler("prompts/list", () => ({ prompts: [GVIDANTO_PROMPT] }));
  server.setRequestHandler("prompts/get", (request) => {
    if (request.params.name !== GVIDANTO_PROMPT.name) {
      throw new ProtocolError(
        ProtocolErrorCode.InvalidParams,
        `Unknown prompt ${request.params.name}; see prompts/list.`,
      );
    }
    return {
      description: GVIDANTO_PROMPT.description,
      messages: [
        { role: "user" as const, content: { type: "text" as const, text: gvidantoPromptText() } },
      ],
    };
  });
  server.setRequestHandler("resources/list", () => ({
    resources: listResources(served),
  }));
  server.setRequestHandler("resources/read", (request) => {
    const contents = readResource(served, request.params.uri);
    if (contents === undefined) {
      throw new ProtocolError(
        ProtocolErrorCode.InvalidParams,
        `Unknown resource ${request.params.uri}; see resources/list.`,
      );
    }
    return { contents: [contents] };
  });
  const listed = tools.map((tool) => ({
    name: tool.name,
    description: String(tool.input.schema.description ?? tool.name),
    inputSchema: bundleSchema(tool.input.schema) as { type: "object" },
    outputSchema: bundleResultSchema(tool.output.schema, tool.error.schema) as { type: "object" },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  }));
  server.setRequestHandler("tools/list", () => ({ tools: listed }));
  server.setRequestHandler("tools/call", (request) => {
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
    if (name === "validate" && options.transport === "http" && "aspektoPath" in args) {
      return asCallResult(aspektoPathOverHttp());
    }
    return asCallResult(TOOLS[name](served, args));
  });
  return server;
}
