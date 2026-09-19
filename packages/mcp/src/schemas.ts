// JSON Schemas of the MCP tools (Spec 001, contracts/mcp-tools.md). Hand-written in
// schema/tools/<tool>.{input,output}.json; shared shapes come from the Modelo schema and from
// schema/common.json. Compiled with the Modelo's Ajv setup, so tools and Modelo agree.

import { readFileSync } from "node:fs";
import { createModeloAjv, type ValidateFunction } from "@fundamento/modelo";

/** The ten read-only tools of FR-16, in contract order. */
export const TOOL_NAMES = [
  "describe",
  "list_dimensioj",
  "list_aspektoj",
  "search_tokens",
  "get_token",
  "resolve",
  "list_reguloj",
  "list_jugxoj",
  "validate",
  "derive_name",
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

const SCHEMA_DIR = new URL("../schema/", import.meta.url);
const COMMON_ID = "https://ciferecigo.com/fundamento/schema/mcp/common.json";

export interface CompiledSchema {
  schema: Record<string, unknown>;
  validate: ValidateFunction;
}

export interface CompiledTool {
  name: ToolName;
  input: CompiledSchema;
  output: CompiledSchema;
  /** The shared error envelope `{ issues, allowed? }` (FR-18). */
  error: CompiledSchema;
}

function readSchema(relative: string): Record<string, unknown> {
  return JSON.parse(readFileSync(new URL(relative, SCHEMA_DIR), "utf8")) as Record<string, unknown>;
}

/** Compiles every tool schema once (Ajv draft 2020-12, strict, with the Modelo schema). */
export function compileToolSchemas(): CompiledTool[] {
  const ajv = createModeloAjv();
  const common = readSchema("common.json");
  ajv.addSchema(common);
  const envelopeSchema = { $ref: `${COMMON_ID}#/$defs/ErrorEnvelope` };
  const error = { schema: envelopeSchema, validate: ajv.compile(envelopeSchema) };
  return TOOL_NAMES.map((name) => {
    const compile = (kind: "input" | "output"): CompiledSchema => {
      const schema = readSchema(`tools/${name}.${kind}.json`);
      return { schema, validate: ajv.compile(schema) };
    };
    return { name, input: compile("input"), output: compile("output"), error };
  });
}
