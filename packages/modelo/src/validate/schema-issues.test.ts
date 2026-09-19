// Ajv error mapping: specific catalog rules where possible, one issue per problem, and nothing
// that a semantic rule reports better.

import { describe, expect, it } from "vitest";
import { createModeloAjv } from "../contracts/ajv.js";
import { type ModeloFiles, readModeloFiles } from "../load/files.js";
import { fixtureModeloSource } from "../load/source.js";
import { isJsonObject } from "./raw.js";
import { schemaIssues } from "./schema-issues.js";
import { fixtureRoot } from "./test-doubles/fixtures.js";

const ajv = createModeloAjv();

function minimalFiles(): ModeloFiles {
  const { files } = readModeloFiles(fixtureModeloSource(fixtureRoot("valid", "minimal")));
  if (files === undefined) throw new Error("valid/minimal did not read");
  return files;
}

function objectAt(value: unknown, ...keys: (string | number)[]): Record<string, unknown> {
  let current = value;
  for (const key of keys) {
    current = Array.isArray(current)
      ? current[Number(key)]
      : isJsonObject(current)
        ? current[String(key)]
        : undefined;
  }
  if (!isJsonObject(current)) throw new Error(`no object at ${keys.join("/")}`);
  return current;
}

const core = (files: ModeloFiles) => {
  const set = files.sets.find((s) => s.name === "core");
  if (set === undefined) throw new Error("no core");
  return set.value;
};

const pairs = (files: ModeloFiles) =>
  schemaIssues(files, ajv).map(({ rule, path }) => ({ rule, path }));

describe("schemaIssues", () => {
  it("is empty for valid/minimal", () => {
    expect(schemaIssues(minimalFiles(), ajv)).toEqual([]);
  });

  it("leaves token values to token-value-invalid (no if/anyOf cascade)", () => {
    const files = minimalFiles();
    objectAt(core(files), "spacing", "small").$value = { value: "4", unit: "rem" };
    expect(pairs(files)).toEqual([]);
  });

  it("maps a bad group key to token-name-grammar at the key", () => {
    const files = minimalFiles();
    const color = objectAt(core(files), "color");
    color["on-primary"] = { $value: "{color.palette.neutral.0}" };
    expect(pairs(files)).toEqual([
      { rule: "token-name-grammar", path: "vortaro/sets/core.json#/color/on-primary" },
    ]);
  });

  it("reports a forbidden $-member of a group as schema-violation at the member", () => {
    const files = minimalFiles();
    objectAt(core(files), "color").$extends = "{spacing}";
    expect(pairs(files)).toEqual([
      { rule: "schema-violation", path: "vortaro/sets/core.json#/color/$extends" },
    ]);
  });

  it("maps an unknown $type to token-type-unknown", () => {
    const files = minimalFiles();
    objectAt(core(files), "color").$type = "colour";
    expect(pairs(files)).toEqual([
      { rule: "token-type-unknown", path: "vortaro/sets/core.json#/color/$type" },
    ]);
  });

  it("leaves IDs to checkIds", () => {
    const files = minimalFiles();
    objectAt(core(files), "$extensions", "com.ciferecigo.fundamento").id = "set_nope";
    delete objectAt(files.data["reguloj.json"].value, "reguloj", 0).id;
    expect(pairs(files)).toEqual([]);
  });

  it("collapses malformed kontrastSojloj into one kontrast-sojloj-invalid", () => {
    const files = minimalFiles();
    objectAt(files.data["dimensioj.json"].value, "dimensioj", 1, "valoroj", 0).kontrastSojloj = {
      wcag2: { "text-normal": 0, ui: 30 },
    };
    expect(pairs(files)).toEqual([
      {
        rule: "kontrast-sojloj-invalid",
        path: "data/dimensioj.json#/dimensioj/1/valoroj/0/kontrastSojloj",
      },
    ]);
  });

  it("reports an unexpected data member as schema-violation at the member", () => {
    const files = minimalFiles();
    objectAt(files.data["dimensioj.json"].value).extra = true;
    expect(pairs(files)).toEqual([
      { rule: "schema-violation", path: "data/dimensioj.json#/extra" },
    ]);
  });

  it("reports a nested group carrying the Fundamento extension once", () => {
    const files = minimalFiles();
    objectAt(core(files), "color", "palette").$extensions = {
      "com.ciferecigo.fundamento": { id: "tok_01K5FMAJ0AND635FTMQ9558Y63" },
    };
    expect(pairs(files)).toEqual([
      {
        rule: "schema-violation",
        path: "vortaro/sets/core.json#/color/palette/$extensions/com.ciferecigo.fundamento",
      },
    ]);
  });
});
