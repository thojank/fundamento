// Tool schemas as clients receive them: self-contained (every referenced definition copied into
// local #/$defs, external $refs rewritten), without $schema and $id, so any MCP client can
// validate structuredContent without fetching the Modelo schema.

import { readFileSync } from "node:fs";
import { readModeloSchema } from "@fundamento/modelo";

const MODELO_REF = "https://ciferecigo.com/fundamento/schema/modelo.schema.json#/$defs/";
const COMMON_REF = "https://ciferecigo.com/fundamento/schema/mcp/common.json#/$defs/";

type Json = Record<string, unknown>;

let pools: Record<string, Json> | undefined;

function definitionPools(): Record<string, Json> {
  if (pools === undefined) {
    const modelo = readModeloSchema().$defs as Record<string, Json>;
    const common = (
      JSON.parse(readFileSync(new URL("../schema/common.json", import.meta.url), "utf8")) as {
        $defs: Record<string, Json>;
      }
    ).$defs;
    pools = { modelo, common };
  }
  return pools;
}

function rewrite(value: unknown, needed: Set<string>, queue: string[]): unknown {
  if (Array.isArray(value)) return value.map((item) => rewrite(item, needed, queue));
  if (typeof value !== "object" || value === null) return value;
  const out: Json = {};
  for (const [key, child] of Object.entries(value as Json)) {
    if (key === "$ref" && typeof child === "string") {
      const name = child.startsWith(MODELO_REF)
        ? `modelo.${child.slice(MODELO_REF.length)}`
        : child.startsWith(COMMON_REF)
          ? `common.${child.slice(COMMON_REF.length)}`
          : child.startsWith("#/$defs/")
            ? `modelo.${child.slice("#/$defs/".length)}`
            : undefined;
      if (name !== undefined) {
        if (!needed.has(name)) {
          needed.add(name);
          queue.push(name);
        }
        out.$ref = `#/$defs/${name.slice(name.indexOf(".") + 1)}`;
        continue;
      }
    }
    out[key] = rewrite(child, needed, queue);
  }
  return out;
}

function strip(schema: Json): Json {
  const { $schema: _schema, $id: _id, ...body } = schema;
  return body;
}

/** A self-contained copy of a tool schema. */
export function bundleSchema(schema: Json): Json {
  return withDefinitions(strip(schema));
}

/**
 * The outputSchema a tool lists: its result or the error envelope. Clients such as the SDK's
 * validate structuredContent against outputSchema even when isError is set (SDK 1.30), so the
 * listed schema names both shapes the contract allows.
 */
export function bundleResultSchema(output: Json, envelope: Json): Json {
  return withDefinitions({ type: "object", anyOf: [strip(output), strip(envelope)] });
}

function withDefinitions(body: Json): Json {
  const needed = new Set<string>();
  const queue: string[] = [];
  const bundled = rewrite(body, needed, queue) as Json;
  const defs: Json = {};
  const { modelo, common } = definitionPools();
  for (let name = queue.shift(); name !== undefined; name = queue.shift()) {
    const [pool, key = ""] = name.split(".");
    const definition = (pool === "common" ? common : modelo)?.[key];
    if (definition === undefined) throw new Error(`Unknown schema definition ${name}.`);
    defs[key] = rewrite(definition, needed, queue);
  }
  return Object.keys(defs).length === 0 ? bundled : { ...bundled, $defs: defs };
}
