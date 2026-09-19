// Generates `src/generated/modelo-schema.ts` from `schema/modelo.schema.json` with
// json-schema-to-typescript. Maintainer script, not part of the public API.
//
// Usage: pnpm --filter @fundamento/modelo generate:types [--check]
//   --check  exit 1 instead of writing when the committed file differs (drift).
//
// Deliberately free of relative imports so Node can run the .ts source directly
// (type stripping, Node >= 22.18) before anything is built.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { compile, type JSONSchema } from "json-schema-to-typescript";

export const GENERATED_HEADER = `/**
 * GENERATED FILE - DO NOT EDIT.
 * Source: packages/modelo/schema/modelo.schema.json
 * Regenerate: pnpm --filter @fundamento/modelo generate:types
 */`;

export const GENERATED_TYPES_URL = new URL("../generated/modelo-schema.ts", import.meta.url);

export const GENERATED_CONFIG_HEADER = `/**
 * GENERATED FILE - DO NOT EDIT.
 * Source: packages/modelo/schema/config.schema.json
 * Regenerate: pnpm --filter @fundamento/modelo generate:types
 */`;

export const GENERATED_CONFIG_TYPES_URL = new URL("../generated/config-schema.ts", import.meta.url);

const SCHEMA_URL = new URL("../../schema/modelo.schema.json", import.meta.url);
const CONFIG_SCHEMA_URL = new URL("../../schema/config.schema.json", import.meta.url);

/** Renders the TS declarations for a schema. Deterministic for a given schema and lockfile. */
export async function renderModeloTypes(schema: Record<string, unknown>): Promise<string> {
  return render(schema, "ModeloJson", GENERATED_HEADER);
}

/** Renders the TS declarations of `fundamento.config.json` (D-07). */
export async function renderConfigTypes(schema: Record<string, unknown>): Promise<string> {
  return render(schema, "KonfiguroJson", GENERATED_CONFIG_HEADER);
}

async function render(
  schema: Record<string, unknown>,
  name: string,
  bannerComment: string,
): Promise<string> {
  // compile() is typed for draft-04 schemas; draft 2020-12 `$defs` resolve through its ref parser.
  const input: JSONSchema = structuredClone(schema);
  return compile(input, name, {
    bannerComment,
    additionalProperties: false,
    unreachableDefinitions: true,
    ignoreMinAndMaxItems: true,
    strictIndexSignatures: false,
    unknownAny: true,
    format: true,
    style: { printWidth: 100, singleQuote: false, trailingComma: "all" },
  });
}

async function generate(
  schemaUrl: URL,
  targetUrl: URL,
  renderTypes: (schema: Record<string, unknown>) => Promise<string>,
  check: boolean,
): Promise<number> {
  const schema: unknown = JSON.parse(await readFile(schemaUrl, "utf8"));
  if (typeof schema !== "object" || schema === null || Array.isArray(schema)) {
    process.stderr.write(`${fileURLToPath(schemaUrl)} is not a JSON object.\n`);
    return 2;
  }
  const rendered = await renderTypes({ ...schema });
  const target = fileURLToPath(targetUrl);
  if (check) {
    const committed = await readFile(target, "utf8").catch(() => "");
    if (committed !== rendered) {
      process.stderr.write(`${target} is out of date. Run the generator without --check.\n`);
      return 1;
    }
    process.stdout.write(`${target} is up to date.\n`);
    return 0;
  }
  await writeFile(target, rendered);
  process.stdout.write(`Wrote ${target}\n`);
  return 0;
}

async function main(argv: readonly string[]): Promise<number> {
  const check = argv.includes("--check");
  const modelo = await generate(SCHEMA_URL, GENERATED_TYPES_URL, renderModeloTypes, check);
  const config = await generate(
    CONFIG_SCHEMA_URL,
    GENERATED_CONFIG_TYPES_URL,
    renderConfigTypes,
    check,
  );
  return Math.max(modelo, config);
}

if (import.meta.main) {
  process.exitCode = await main(process.argv.slice(2));
}
