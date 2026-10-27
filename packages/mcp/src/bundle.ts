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

/** A self-contained copy of a tool schema, its root one object (Nachlese 11 B-3). */
export function bundleSchema(schema: Json): Json {
  return withDefinitions(oneObject(strip(schema)));
}

const COMBINATORS = ["oneOf", "anyOf", "allOf"] as const;

/** How one alternative of the root is named in the sentence: what it requires or constrains. */
function alternativeText(branch: Json): string {
  const required = (branch.required as string[] | undefined) ?? [];
  const properties = Object.entries((branch.properties as Json | undefined) ?? {});
  const named = properties.flatMap(([name, property]) => {
    const items = (property as Json | undefined)?.minItems;
    if (typeof items === "number" && items > 0)
      return [`\`${name}\` with at least ${items} ${items === 1 ? "entry" : "entries"}`];
    return required.includes(name) ? [`\`${name}\``] : [];
  });
  const rest = required.filter((name) => !properties.some(([key]) => key === name));
  return [...named, ...rest.map((name) => `\`${name}\``)].join(" and ");
}

/**
 * The root of a tool's input as one object (Nachlese 11 B-3). Anthropic refuses oneOf, anyOf and
 * allOf at the top of input_schema, OpenAI and Mistral also enum and not; the file keeps them, and
 * the server checks every call against the file (server.ts). What the client receives: the
 * properties of every alternative together, required what every alternative requires, and the
 * alternatives said in the description, so an agent reads what the schema no longer enforces.
 */
function oneObject(schema: Json): Json {
  const combinator = COMBINATORS.find((keyword) => Array.isArray(schema[keyword]));
  if (combinator === undefined) return schema;
  const { [combinator]: rawBranches, ...rest } = schema;
  const branches = rawBranches as Json[];
  const properties: Json = { ...((rest.properties as Json | undefined) ?? {}) };
  for (const branch of branches) {
    for (const [name, property] of Object.entries((branch.properties as Json | undefined) ?? {})) {
      // A branch that only lists a property (`name: true`) keeps the root's definition.
      if (!(name in properties) && property !== true) properties[name] = property;
    }
  }
  const requiredOf = (entry: Json) => new Set((entry.required as string[] | undefined) ?? []);
  const sets = branches.map(requiredOf);
  const fromBranches =
    combinator === "allOf"
      ? sets.flatMap((set) => [...set])
      : [...(sets[0] ?? [])].filter((name) => sets.every((set) => set.has(name)));
  const required = [...new Set([...requiredOf(rest), ...fromBranches])];
  const alternatives = branches.map(alternativeText).filter((text) => text !== "");
  const sentence =
    combinator === "allOf" || alternatives.length === 0
      ? ""
      : ` Give ${combinator === "oneOf" ? "exactly one" : "at least one"} of: ${alternatives.join(" or ")}.`;
  return {
    ...rest,
    type: "object",
    properties,
    ...(required.length === 0 ? {} : { required }),
    ...(typeof rest.description === "string"
      ? { description: `${rest.description}${sentence}` }
      : {}),
  };
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
