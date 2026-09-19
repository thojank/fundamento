// The resolve-* fixtures are complete Modelo roots: every file matches its schema def and every
// ID they use is registered in their lock (FUND-3.2 runs them as positive/negative fixtures).

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createModeloAjv, getModeloValidator } from "../contracts/ajv.js";
import { DATA_FILE_SCHEMA_DEFS, SCHEMA_DEFS } from "../contracts/schema.js";
import { fixtureRoot } from "./test-doubles/fixtures.js";

const ajv = createModeloAjv();
const readJson = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory() ? listFiles(join(dir, entry.name)) : [join(dir, entry.name)],
    )
    .sort();
}

describe.each([
  ["valid", "resolve-matrix"],
  ["valid", "resolve-tie"],
  ["invalid", "resolve-cross-set-cycle"],
] as const)("%s/%s fixture", (kind, name) => {
  const root = fixtureRoot(kind, name);

  it("matches the schema defs", () => {
    for (const file of listFiles(join(root, "vortaro/sets"))) {
      const validate = getModeloValidator(ajv, SCHEMA_DEFS.tokenSetFile);
      expect(validate(readJson(file)), JSON.stringify(validate.errors)).toBe(true);
    }
    for (const [file, def] of Object.entries(DATA_FILE_SCHEMA_DEFS)) {
      const validate = getModeloValidator(ajv, def);
      expect(validate(readJson(join(root, "data", file))), JSON.stringify(validate.errors)).toBe(
        true,
      );
    }
  });

  it("registers exactly the IDs it uses", () => {
    const lock = readJson(join(root, "data/ids.lock.json")) as { ids: Record<string, unknown> };
    const used = new Set<string>();
    for (const file of listFiles(root).filter((f) => !f.endsWith("ids.lock.json"))) {
      for (const match of readFileSync(file, "utf8").matchAll(/"([a-z]{3}_[0-9A-Z]{26})"/g)) {
        if (match[1] !== undefined) used.add(match[1]);
      }
    }
    expect([...used].sort()).toEqual(Object.keys(lock.ids).sort());
  });
});
