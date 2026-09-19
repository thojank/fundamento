import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { readConfigSchema, readModeloSchema } from "./schema.js";
import {
  GENERATED_CONFIG_TYPES_URL,
  GENERATED_HEADER,
  GENERATED_TYPES_URL,
  renderConfigTypes,
  renderModeloTypes,
} from "./type-generation.js";

describe("generated TS types", () => {
  it("carry the generated-file header", async () => {
    const committed = await readFile(GENERATED_TYPES_URL, "utf8");
    expect(committed.startsWith(GENERATED_HEADER)).toBe(true);
  });

  it("match a fresh generation from the schema (no drift)", async () => {
    const committed = await readFile(GENERATED_TYPES_URL, "utf8");
    const fresh = await renderModeloTypes(readModeloSchema());
    // On failure run: pnpm --filter @fundamento/modelo generate:types
    expect(committed).toBe(fresh);
  });

  it("generate the config types from config.schema.json (no drift)", async () => {
    const committed = await readFile(GENERATED_CONFIG_TYPES_URL, "utf8");
    // On failure run: pnpm --filter @fundamento/modelo generate:types
    expect(committed).toBe(await renderConfigTypes(readConfigSchema()));
  });
});
