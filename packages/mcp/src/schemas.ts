// JSON Schemas of the MCP tools (Spec 001, contracts/mcp-tools.md). Hand-written in
// schema/tools/<tool>.{input,output}.json; shared shapes come from the Modelo schema and from
// schema/common.json. Compiled with the Modelo's Ajv setup, so tools and Modelo agree.

import { readFileSync } from "node:fs";
import {
  addSchemaWithBothIds,
  normalizeNames,
  sharedModeloAjv,
  type ValidateFunction,
} from "@fundamento/modelo";

/**
 * The ten read-only tools of FR-16, then the Gvidanto tools of Spec 002, the Ero tools of
 * Spec 003, preview_agordo of Spec 016 ③ and propose_agordo, save_agordo of Spec 019 ③, in
 * contract order.
 */
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
  "check_contrast",
  "explain",
  "explain_regulo",
  "describe_term",
  "list_eroj",
  "get_ero",
  "suggest_ero",
  "check_usage",
  "preview_agordo",
  "propose_agordo",
  "save_agordo",
  // Spec 020 ① (G3): the Sxablonoj beside the Eroj.
  "list_sxablonoj",
  "get_sxablono",
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

const SCHEMA_DIR = new URL("../schema/", import.meta.url);
const COMMON_ID = "urn:fundamento:schema:mcp:common";

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

/** A schema file, its IDs in the form the code writes (Spec 036 6.3: either form is read). */
function readSchema(relative: string): Record<string, unknown> {
  const text = readFileSync(new URL(relative, SCHEMA_DIR), "utf8");
  return normalizeNames(JSON.parse(text) as Record<string, unknown>, text);
}

/** Compiles every tool schema once (Ajv draft 2020-12, strict, with the Modelo schema). */
export function compileToolSchemas(): CompiledTool[] {
  // The process's one Ajv (Spec 029 ②b-1b, AK-07): the Modelo schema the tools refer to is
  // compiled once; the common schema is added once.
  const ajv = sharedModeloAjv();
  const common = readSchema("common.json");
  // For one version the common schema is also known by the ID of the other form (Spec 036 6.3).
  if (ajv.getSchema(COMMON_ID) === undefined) addSchemaWithBothIds(ajv, common);
  const envelopeSchema = { $ref: `${COMMON_ID}#/$defs/ErrorEnvelope` };
  const error = { schema: envelopeSchema, validate: ajv.compile(envelopeSchema) };
  return TOOL_NAMES.map((name) => {
    const compile = (kind: "input" | "output"): CompiledSchema => {
      const schema = readSchema(`tools/${name}.${kind}.json`);
      // A second server in the process takes the validator the first compiled (same $id).
      const known = typeof schema.$id === "string" ? ajv.getSchema(schema.$id) : undefined;
      return { schema, validate: known ?? ajv.compile(schema) };
    };
    return { name, input: compile("input"), output: compile("output"), error };
  });
}
