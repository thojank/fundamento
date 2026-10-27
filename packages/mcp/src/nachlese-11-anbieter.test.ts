// Nachlese 11 B-3 (Spec 030 B-3): every tool of the Gvidanto as tools/list publishes it is a valid
// function for Anthropic, OpenAI and Mistral — checked against the restrictions the three providers
// document, without the network. Read on 2026-10-24:
// - Anthropic, "Define tools": a tool name matches ^[a-zA-Z0-9_-]{1,128}$; input_schema is a JSON
//   Schema object (type object). The API refuses oneOf, allOf and anyOf at the top level of
//   input_schema. https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools
// - OpenAI, function calling and "Structured Outputs – Supported schemas": the parameters are a
//   JSON Schema of type object; the root "must be an object, and not use anyOf" — the API refuses
//   oneOf, anyOf, allOf, enum and not at the top level (400 "schema must have type 'object' and not
//   have 'oneOf'/'anyOf'/'allOf'/'enum'/'not' at the top level", measured in Spec 030); names match
//   ^[a-zA-Z0-9_-]{1,64}$. https://developers.openai.com/api/docs/guides/structured-outputs
// - Mistral, "Function calling": the OpenAI form of a function, parameters a JSON Schema object with
//   properties and required; it documents no further restriction, so the stricter of the other
//   two applies (names up to 64). https://docs.mistral.ai/capabilities/function_calling/
// Strict mode (OpenAI strict, Anthropic strict: true) is not needed: it would make every property
// required, and the Gvidanto checks every input against its own schema anyway (Nachlese 11 D-04).

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type Connected, call, closeClients, connect, preload } from "./test-doubles/client.js";

afterAll(closeClients);
preload();

type Schema = Record<string, unknown>;

interface Provider {
  name: string;
  toolName: RegExp;
  /** Keywords the provider refuses at the top level of the parameters. */
  rootForbidden: readonly string[];
}

const PROVIDERS: readonly Provider[] = [
  {
    name: "anthropic",
    toolName: /^[a-zA-Z0-9_-]{1,128}$/,
    rootForbidden: ["oneOf", "anyOf", "allOf"],
  },
  {
    name: "openai",
    toolName: /^[a-zA-Z0-9_-]{1,64}$/,
    rootForbidden: ["oneOf", "anyOf", "allOf", "enum", "not"],
  },
  {
    name: "mistral",
    toolName: /^[a-zA-Z0-9_-]{1,64}$/,
    rootForbidden: ["oneOf", "anyOf", "allOf", "enum", "not"],
  },
];

/** Every $ref of a schema, wherever it stands. */
function refsOf(value: unknown, found: string[] = []): string[] {
  if (Array.isArray(value)) for (const item of value) refsOf(item, found);
  else if (typeof value === "object" && value !== null) {
    for (const [key, child] of Object.entries(value as Schema)) {
      if (key === "$ref" && typeof child === "string") found.push(child);
      else refsOf(child, found);
    }
  }
  return found;
}

describe("Nachlese 11 B-3: the tools are valid functions for Anthropic, OpenAI and Mistral", () => {
  let tools: { name: string; inputSchema: Schema }[] = [];
  let client: Connected["client"];

  beforeAll(async () => {
    ({ client } = await connect());
    tools = (await client.listTools()).tools as typeof tools;
  });

  it("lists the 23 tools", () => {
    expect(tools).toHaveLength(23);
  });

  for (const provider of PROVIDERS) {
    it(`${provider.name}: names, an object at the root and no combinator there`, () => {
      const refused: string[] = [];
      for (const tool of tools) {
        const schema = tool.inputSchema;
        if (!provider.toolName.test(tool.name)) refused.push(`${tool.name}: name`);
        if (schema.type !== "object") refused.push(`${tool.name}: type ${String(schema.type)}`);
        for (const keyword of provider.rootForbidden)
          if (keyword in schema) refused.push(`${tool.name}: ${keyword} at the root`);
      }
      expect(refused).toEqual([]);
    });
  }

  it("every $ref is local and resolves in the schema's own $defs", () => {
    for (const tool of tools) {
      const defs = (tool.inputSchema.$defs ?? {}) as Schema;
      for (const ref of refsOf(tool.inputSchema)) {
        expect(ref, tool.name).toMatch(/^#\/\$defs\/[A-Za-z0-9]+$/);
        expect(ref.slice("#/$defs/".length) in defs, `${tool.name} ${ref}`).toBe(true);
      }
    }
  });

  it("the Gvidanto still refuses what the alternatives forbade: both name and id, or neither", async () => {
    for (const [tool, args] of [
      ["get_ero", { name: "kampo", id: "ero_01M2VEEE0QJXF3E9TY0JX4XVBG" }],
      ["get_ero", {}],
      ["get_sxablono", { brief: true }],
      ["explain_regulo", {}],
      ["get_token", {}],
      ["check_usage", { instances: [] }],
    ] as const) {
      const result = await call(client, tool, args as Record<string, unknown>);
      expect(result.isError, `${tool} ${JSON.stringify(args)}`).toBe(true);
      const issues = (result.structuredContent?.issues ?? []) as { rule: string }[];
      expect(issues[0]?.rule, tool).toBe("mcp-input-invalid");
    }
    const named = await call(client, "get_ero", { name: "kampo", brief: true });
    expect(named.isError ?? false).toBe(false);
  });
});
