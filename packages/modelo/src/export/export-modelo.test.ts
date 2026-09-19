// FUND-4.1: the pure export (FR-07, S6, §2.9). Runs in-process against the repo Modelo and real
// fixtures; nothing is written to disk.

import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createModeloAjv, getModeloValidator } from "../contracts/ajv.js";
import { DTCG_TYPES } from "../contracts/dtcg.js";
import type { ModeloJson, Rezolvo } from "../contracts/modelo.js";
import { readModeloSchema } from "../contracts/schema.js";
import { buildModelo } from "../load/build.js";
import { type ModeloFiles, readModeloFiles } from "../load/files.js";
import { defaultModeloSource, fixtureModeloSource } from "../load/source.js";
import { MODELO_VERSION } from "../load/version.js";
import { allAssignments, completeAssignment, resolve } from "../resolve/index.js";
import { fixtureRoot } from "../resolve/test-doubles/fixtures.js";
import { exportModelo, MODELO_JSON_SCHEMA_REF, type ModeloExport } from "./export-modelo.js";
import { exportValidatedModelo } from "./prepare.js";

function readFiles(source = defaultModeloSource()): ModeloFiles {
  const { files, issues } = readModeloFiles(source);
  if (files === undefined) {
    throw new Error(`Modelo files did not load: ${JSON.stringify(issues)}`);
  }
  return files;
}

const schema = readModeloSchema();
const files = readFiles();
const { modelo } = buildModelo(files);
const exported = exportModelo({ modelo, sets: files.sets, schema });
const modeloJson = JSON.parse(exported.modeloJson) as ModeloJson;
const rezolvoj = JSON.parse(exported.rezolvojJson) as { rezolvoj: Rezolvo[] };
const exportedSchema: unknown = JSON.parse(exported.schemaJson);

const sha256 = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");
const hashes = (files: ModeloExport) => ({
  modelo: sha256(files.modeloJson),
  schema: sha256(files.schemaJson),
  rezolvoj: sha256(files.rezolvojJson),
});

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortKeysDeep((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}

/** Rebuilds a Record with its keys in reverse insertion order (defeats iteration-order luck). */
function reverseKeysDeep<T>(value: T): T {
  if (Array.isArray(value)) return value.map(reverseKeysDeep) as T;
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.keys(value)
        .reverse()
        .map((key) => [key, reverseKeysDeep((value as Record<string, unknown>)[key])]),
    ) as T;
  }
  return value;
}

function collectRefs(node: unknown, out: string[] = []): string[] {
  if (Array.isArray(node)) {
    for (const item of node) collectRefs(item, out);
  } else if (typeof node === "object" && node !== null) {
    for (const [key, value] of Object.entries(node)) {
      if ((key === "$ref" || key === "$dynamicRef") && typeof value === "string") out.push(value);
      collectRefs(value, out);
    }
  }
  return out;
}

describe("exportModelo: shape (§2.9)", () => {
  it("has exactly the §2.9 top-level keys", () => {
    expect(Object.keys(modeloJson).sort()).toEqual(
      [
        "$schema",
        "aspektoj",
        "dimensioj",
        "eroj",
        "fundamento",
        "jugxoj",
        "kontrastParoj",
        "reguloj",
        "rezolvo",
        "setoj",
        "tokenTypes",
        "tokens",
      ].sort(),
    );
  });

  it("points $schema at the sibling schema and carries the package version", () => {
    expect(modeloJson.$schema).toBe(MODELO_JSON_SCHEMA_REF);
    expect(modeloJson.fundamento).toEqual({ version: MODELO_VERSION });
    expect(modeloJson.fundamento.version).toBe("0.1.0");
  });

  it("exports the Dimensioj in priority order with values, default, thresholds and Aspekto metadata", () => {
    expect(modeloJson.dimensioj).toEqual(modelo.dimensioj);
    expect(modeloJson.dimensioj.map((d) => d.priority)).toEqual(
      [...modeloJson.dimensioj.map((d) => d.priority)].sort((a, b) => a - b),
    );
    const contrast = modeloJson.dimensioj.find((d) => d.name === "contrast");
    expect(contrast?.valoroj?.every((v) => v.kontrastSojloj !== undefined)).toBe(true);
  });

  it("lists every Aspekto with its package metadata as a convenience view (Spec 001 T007)", () => {
    expect(modeloJson.aspektoj).toEqual([
      {
        id: "dva_01M2VEEDQEJEE7MR7JA8JRPMJB",
        name: "komuna",
        owner: "Fundamento",
        license: "MIT",
        fonts: [
          {
            family: "Geist",
            license: "OFL-1.1",
            source: "https://github.com/vercel/geist-font",
            redistributable: true,
          },
          {
            family: "Geist Mono",
            license: "OFL-1.1",
            source: "https://github.com/vercel/geist-font",
            redistributable: true,
          },
        ],
        reference: true,
        external: false,
        package: "@fundamento/aspekto-komuna",
      },
    ]);
  });

  it("lists the used token types in DTCG declaration order", () => {
    const used = new Set(modeloJson.tokens.map((token) => token.type));
    expect(modeloJson.tokenTypes).toEqual(DTCG_TYPES.filter((type) => used.has(type)));
    expect(modeloJson.tokenTypes).toHaveLength(10);
  });

  it("inventories the core tokens sorted by name, with id, type, description and role", () => {
    const core = modelo.setoj.find((set) => set.name === "core");
    expect(modeloJson.tokens).toHaveLength(Object.keys(core?.tokens ?? {}).length);
    const names = modeloJson.tokens.map((token) => token.name);
    expect(names).toEqual([...names].sort());
    const text = modeloJson.tokens.find((token) => token.name === "color.text.default");
    expect(text).toMatchObject({
      id: expect.stringMatching(/^tok_/),
      type: "color",
      role: "foreground",
    });
    for (const token of modeloJson.tokens) {
      expect(
        Object.keys(token).every((key) =>
          ["id", "name", "type", "description", "role"].includes(key),
        ),
      ).toBe(true);
    }
  });

  it("exports every set with id, name, kondicxoj and its raw DTCG tree", () => {
    expect(modeloJson.setoj.map((set) => set.name)).toEqual(modelo.setoj.map((set) => set.name));
    for (const set of modeloJson.setoj) {
      const raw = files.sets.find((document) => document.name === set.name);
      expect(set.tree).toEqual(raw?.value);
      expect(set.id).toMatch(/^set_/);
    }
    const conjunction = modeloJson.setoj.find(
      (set) => set.name === "aspekto/komuna+color-scheme/dark",
    );
    expect(conjunction?.kondicxoj).toEqual(["aspekto=komuna", "color-scheme=dark"]);
    expect(modeloJson.setoj.find((set) => set.name === "core")?.kondicxoj).toEqual([]);
  });

  it("exports Reguloj, Jugxoj, KontrastParoj as in the data and no Eroj", () => {
    expect(modeloJson.reguloj).toEqual(modelo.reguloj);
    expect(modeloJson.jugxoj).toEqual(modelo.jugxoj);
    expect(modeloJson.kontrastParoj).toEqual(modelo.kontrastParoj);
    expect(modeloJson.eroj).toEqual([]);
  });

  it("embeds the default-assignment Rezolvo with provenance", () => {
    const expected = resolve(modelo, {});
    if (!expected.ok) throw new Error("default assignment did not resolve");
    expect(modeloJson.rezolvo).toEqual(expected.rezolvo);
    expect(modeloJson.rezolvo.assignment).toEqual(completeAssignment(modelo, {}).assignment);
    for (const token of Object.values(modeloJson.rezolvo.tokens)) {
      expect(token.origin.set).not.toBe("");
      expect(token.origin.setId).toMatch(/^set_/);
    }
  });
});

describe("exportModelo: schema (self-contained, validates modelo.json)", () => {
  it("modelo.json validates against the exported modelo.schema.json", () => {
    const ajv = createModeloAjv();
    const validate = getModeloValidator(ajv);
    expect(validate(modeloJson), JSON.stringify(validate.errors)).toBe(true);
  });

  it("the exported schema alone (fresh Ajv, nothing else registered) validates modelo.json", async () => {
    const { Ajv2020 } = await import("ajv/dist/2020.js");
    const addFormats = (await import("ajv-formats")).default;
    const ajv = new Ajv2020({ strict: true, allErrors: true });
    addFormats.default(ajv, ["date"]);
    const validate = ajv.compile(exportedSchema as Record<string, unknown>);
    expect(validate(modeloJson), JSON.stringify(validate.errors)).toBe(true);
  });

  it("has no external $ref", () => {
    const refs = collectRefs(exportedSchema);
    expect(refs.length).toBeGreaterThan(0);
    expect(refs.filter((ref) => !ref.startsWith("#"))).toEqual([]);
  });

  it("is the canonical schema, canonically serialized", () => {
    expect(exportedSchema).toEqual(schema);
    expect(exported.schemaJson).toBe(`${JSON.stringify(sortKeysDeep(schema), null, 2)}\n`);
  });
});

describe("exportModelo: rezolvoj.json", () => {
  const assignments = allAssignments(modelo);

  it("has one Rezolvo per combination (72) in allAssignments order", () => {
    expect(Object.keys(rezolvoj)).toEqual(["rezolvoj"]);
    expect(rezolvoj.rezolvoj).toHaveLength(assignments.length);
    expect(rezolvoj.rezolvoj).toHaveLength(72);
  });

  it("entry i equals resolve(allAssignments[i]) and carries provenance", () => {
    assignments.forEach((assignment, index) => {
      const outcome = resolve(modelo, assignment);
      if (!outcome.ok) throw new Error(`combination ${index} did not resolve`);
      const entry = rezolvoj.rezolvoj[index];
      expect(entry).toEqual(outcome.rezolvo);
      for (const token of Object.values(entry?.tokens ?? {})) {
        expect(token.origin.setId).toMatch(/^set_/);
        expect(Array.isArray(token.aliasChain)).toBe(true);
      }
    });
  });
});

describe("exportModelo: canonical, deterministic serialization (AK-10)", () => {
  it("serializes with sorted keys, 2-space indent and a trailing newline", () => {
    for (const text of [exported.modeloJson, exported.schemaJson, exported.rezolvojJson]) {
      expect(text.endsWith("}\n")).toBe(true);
      expect(text.endsWith("\n\n")).toBe(false);
      expect(text).toBe(`${JSON.stringify(sortKeysDeep(JSON.parse(text)), null, 2)}\n`);
    }
  });

  it("exporting twice gives identical SHA-256 hashes", () => {
    const again = exportModelo({ modelo, sets: files.sets, schema });
    expect(hashes(again)).toEqual(hashes(exported));
  });

  it("does not depend on object key insertion order of its inputs", () => {
    const shuffled = exportModelo({
      modelo: reverseKeysDeep(modelo),
      sets: reverseKeysDeep(files.sets),
      schema: reverseKeysDeep(schema),
    });
    expect(hashes(shuffled)).toEqual(hashes(exported));
  });

  it("does not depend on the order of the raw set list", () => {
    const reversed = exportModelo({ modelo, sets: [...files.sets].reverse(), schema });
    expect(hashes(reversed)).toEqual(hashes(exported));
  });

  it("contains no timestamps", () => {
    const text = exported.modeloJson + exported.rezolvojJson;
    expect(text).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
    expect(text).not.toMatch(/"(generatedAt|timestamp|builtAt)"/);
    // A Jugxo's `date` is the decision date from the data, not a build time; nothing else has one.
    const { jugxoj, ...rest } = JSON.parse(exported.modeloJson) as { jugxoj: { date: string }[] };
    expect(JSON.stringify(rest) + exported.rezolvojJson).not.toMatch(/"date"/);
    expect(jugxoj.map((jugxo) => jugxo.date)).toEqual(modelo.jugxoj.map((jugxo) => jugxo.date));
  });

  it("does not mutate its inputs", () => {
    const before = JSON.stringify([modelo, files.sets]);
    exportModelo({ modelo, sets: files.sets, schema });
    expect(JSON.stringify([modelo, files.sets])).toBe(before);
  });

  it("throws when a set's raw tree is missing (inputs must belong together)", () => {
    expect(() =>
      exportModelo({ modelo, sets: files.sets.filter((set) => set.name !== "core"), schema }),
    ).toThrow(/core/);
  });
});

describe("exportValidatedModelo: the build refuses an invalid Modelo", () => {
  it("exports a valid fixture", () => {
    const result = exportValidatedModelo(
      readFiles(fixtureModeloSource(fixtureRoot("valid", "minimal"))),
      schema,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const json = JSON.parse(result.files.modeloJson) as ModeloJson;
    expect(json.tokens).toHaveLength(8);
    expect(JSON.parse(result.files.rezolvojJson).rezolvoj).toHaveLength(4);
  });

  it("returns the validation errors and no files for an invalid fixture", () => {
    const invalid = readFiles(
      fixtureModeloSource(fixtureRoot("invalid", "modelo-alias-target-missing")),
    );
    const result = exportValidatedModelo(invalid, schema);
    if (result.ok) throw new Error("an invalid Modelo was exported");
    expect("files" in result).toBe(false);
    expect(result.errors.map((issue) => issue.rule)).toContain("alias-target-missing");
  });

  it("refuses a Modelo that fails only a semantic rule (regulo without kialo)", () => {
    const invalid = readFiles(
      fixtureModeloSource(fixtureRoot("invalid", "modelo-regulo-kialo-missing")),
    );
    const result = exportValidatedModelo(invalid, schema);
    if (result.ok) throw new Error("an invalid Modelo was exported");
    expect(result.errors.map((issue) => issue.rule)).toContain("regulo-kialo-missing");
  });

  it("exports the repo Modelo byte-identically to exportModelo", () => {
    const result = exportValidatedModelo(files, schema);
    expect(result.ok).toBe(true);
    if (result.ok) expect(hashes(result.files)).toEqual(hashes(exported));
  });
});
