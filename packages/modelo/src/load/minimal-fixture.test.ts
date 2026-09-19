// Proves that the shared `test/fixtures/valid/minimal/` Modelo root is valid against the FUND-1.2
// schema defs, that its IDs are consistent with its `ids.lock.json`, and that its Tokens-Studio
// `$themes.json` / `$metadata.json` match its Dimensioj and set kondicxoj.

import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createModeloAjv, getModeloValidator } from "../contracts/ajv.js";
import { entityTypeOfId } from "../contracts/entity-ids.js";
import { DATA_FILE_SCHEMA_DEFS, SCHEMA_DEFS } from "../contracts/schema.js";
import { loadModelo } from "./load-modelo.js";
import { fixtureModeloSource } from "./source.js";

const root = fileURLToPath(new URL("../../test/fixtures/valid/minimal/", import.meta.url));
const ajv = createModeloAjv();

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory() ? listFiles(join(dir, entry.name)) : [join(dir, entry.name)],
    )
    .sort();
}

const readJson = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));
const rel = (path: string): string => relative(root, path).split(sep).join("/");

describe("valid/minimal fixture", () => {
  const setFiles = listFiles(join(root, "vortaro/sets"));

  it.each(setFiles.map(rel))("%s validates against TokenSetFile", (file) => {
    const validate = getModeloValidator(ajv, SCHEMA_DEFS.tokenSetFile);
    expect(validate(readJson(join(root, file))), JSON.stringify(validate.errors)).toBe(true);
  });

  it.each(Object.entries(DATA_FILE_SCHEMA_DEFS))("data/%s validates against %s", (file, def) => {
    const validate = getModeloValidator(ajv, def);
    expect(validate(readJson(join(root, "data", file))), JSON.stringify(validate.errors)).toBe(
      true,
    );
  });

  it("registers every ID it uses in its lock, active and with the matching type, and nothing else", () => {
    const lock = readJson(join(root, "data/ids.lock.json")) as {
      ids: Record<string, { type: string; status: string }>;
    };
    const used = new Set<string>();
    for (const file of listFiles(root).filter((f) => !f.endsWith("ids.lock.json"))) {
      for (const match of readFileSync(file, "utf8").matchAll(/"([a-z]{3}_[0-9A-Z]{26})"/g)) {
        if (match[1] !== undefined) used.add(match[1]);
      }
    }
    expect([...used].sort()).toEqual(Object.keys(lock.ids).sort());
    for (const [id, entry] of Object.entries(lock.ids)) {
      expect(entry).toEqual({ type: entityTypeOfId(id), status: "active" });
    }
    expect(Object.keys(lock.ids)).toEqual(Object.keys(lock.ids).sort());
  });

  it("has 2 Dimensioj, one conjunction set and themes/metadata consistent with them", () => {
    const { modelo, issues } = loadModelo(fixtureModeloSource(root));
    expect(issues).toEqual([]);
    if (modelo === undefined) throw new Error("minimal fixture did not load");
    expect(modelo.dimensioj).toHaveLength(2);
    expect(modelo.setoj.filter((s) => s.kondicxoj.length > 1).map((s) => s.name)).toEqual([
      "color-scheme/dark+contrast/high",
    ]);

    // One theme per DimensioValoro: core as source, every set whose kondicxoj include the value
    // as enabled.
    const expectedThemes = modelo.dimensioj.flatMap((dimensio) =>
      dimensio.valoroj.map((valoro) => ({
        id: valoro.id,
        name: valoro.name,
        group: dimensio.name,
        selectedTokenSets: Object.fromEntries([
          ["core", "source"],
          ...modelo.setoj
            .filter((set) =>
              set.kondicxoj.some((k) => k.dimensio === dimensio.name && k.valoro === valoro.name),
            )
            .map((set) => [set.name, "enabled"]),
        ]),
      })),
    );
    expect(modelo.themesFile).toEqual(expectedThemes);
    expect(new Set((modelo.metadataFile as { tokenSetOrder: string[] }).tokenSetOrder)).toEqual(
      new Set(modelo.setoj.map((s) => s.name)),
    );
  });
});
