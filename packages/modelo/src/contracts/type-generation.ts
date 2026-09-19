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

const SCHEMA_URL = new URL("../../schema/modelo.schema.json", import.meta.url);

/** Renders the TS declarations for a schema. Deterministic for a given schema and lockfile. */
export async function renderModeloTypes(schema: Record<string, unknown>): Promise<string> {
  // compile() is typed for draft-04 schemas; draft 2020-12 `$defs` resolve through its ref parser.
  const input: JSONSchema = structuredClone(schema);
  return compile(input, "ModeloJson", {
    bannerComment: GENERATED_HEADER,
    additionalProperties: false,
    unreachableDefinitions: true,
    ignoreMinAndMaxItems: true,
    strictIndexSignatures: false,
    unknownAny: true,
    format: true,
    style: { printWidth: 100, singleQuote: false, trailingComma: "all" },
  });
}

async function main(argv: readonly string[]): Promise<number> {
  const schema: unknown = JSON.parse(await readFile(SCHEMA_URL, "utf8"));
  if (typeof schema !== "object" || schema === null || Array.isArray(schema)) {
    process.stderr.write(`${fileURLToPath(SCHEMA_URL)} is not a JSON object.\n`);
    return 2;
  }
  const rendered = await renderModeloTypes({ ...schema });
  const target = fileURLToPath(GENERATED_TYPES_URL);
  if (argv.includes("--check")) {
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

if (import.meta.main) {
  process.exitCode = await main(process.argv.slice(2));
}
