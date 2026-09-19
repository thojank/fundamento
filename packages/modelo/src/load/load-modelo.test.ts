import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { ModeloSource } from "../contracts/modelo.js";
import { buildModelo } from "./build.js";
import type { ModeloFiles } from "./files.js";
import { loadModelo } from "./load-modelo.js";
import { defaultModeloSource, fixtureModeloSource, modeloRootOf } from "./source.js";

const fixturesDir = fileURLToPath(new URL("../../test/fixtures/", import.meta.url));
const minimal = fixtureModeloSource(join(fixturesDir, "valid/minimal"));

const TOK = {
  neutral0: "tok_01K5FMAJ0AND635FTMQ9558Y63",
  textDefault: "tok_01K5FMAJ0FRV73CQ8J0CJ9HV5S",
  backgroundDefault: "tok_01K5FMAJ0EN8B4C4Z6KSPYEMCX",
};

describe("loadModelo: valid/minimal", () => {
  const { modelo, issues } = loadModelo(minimal);

  it("loads without issues", () => {
    expect(issues).toEqual([]);
    expect(modelo).toBeDefined();
  });

  it("takes the version from the modelo package.json", () => {
    const pkg: unknown = JSON.parse(
      readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
    );
    expect(modelo?.version).toBe((pkg as { version: string }).version);
    expect(modelo?.version).toBe("0.1.0");
  });

  it("sorts Dimensioj by priority", () => {
    expect(modelo?.dimensioj.map((d) => [d.name, d.priority])).toEqual([
      ["color-scheme", 1],
      ["contrast", 2],
    ]);
  });

  it("reads every set file, named by its path relative to sets/ without .json", () => {
    expect(modelo?.setoj.map((s) => [s.name, s.file])).toEqual([
      ["color-scheme/dark", "vortaro/sets/color-scheme/dark.json"],
      ["color-scheme/dark+contrast/high", "vortaro/sets/color-scheme/dark+contrast/high.json"],
      ["contrast/high", "vortaro/sets/contrast/high.json"],
      ["core", "vortaro/sets/core.json"],
    ]);
  });

  it("reads set id and parsed kondicxoj from the extension", () => {
    const byName = new Map(modelo?.setoj.map((s) => [s.name, s]));
    expect(byName.get("core")?.id).toBe("set_01K5FMAJ06444R7MA0HZE3KXSJ");
    expect(byName.get("core")?.kondicxoj).toEqual([]);
    expect(byName.get("color-scheme/dark+contrast/high")?.kondicxoj).toEqual([
      { dimensio: "color-scheme", valoro: "dark" },
      { dimensio: "contrast", valoro: "high" },
    ]);
  });

  it("flattens core tokens with effective types, ids, roles and locations", () => {
    const core = modelo?.setoj.find((s) => s.name === "core");
    expect(Object.keys(core?.tokens ?? {})).toEqual([
      "color.palette.neutral.0",
      "color.palette.neutral.100",
      "color.palette.neutral.900",
      "color.palette.neutral.1000",
      "color.background.default",
      "color.text.default",
      "spacing.small",
      "spacing.medium",
    ]);
    expect(core?.tokens["color.palette.neutral.0"]).toEqual({
      name: "color.palette.neutral.0",
      type: "color",
      value: { colorSpace: "srgb", components: [1, 1, 1], hex: "#ffffff" },
      id: TOK.neutral0,
      location: { file: "vortaro/sets/core.json", pointer: "/color/palette/neutral/0" },
    });
    expect(core?.tokens["color.text.default"]).toMatchObject({
      type: "color",
      value: "{color.palette.neutral.900}",
      description: "Default body text.",
      id: TOK.textDefault,
      role: "foreground",
    });
    expect(core?.tokens["color.background.default"]?.role).toBe("background");
    expect(core?.tokens["spacing.small"]?.type).toBe("dimension");
  });

  it("loads override tokens of dimension sets without extensions", () => {
    const dark = modelo?.setoj.find((s) => s.name === "color-scheme/dark");
    expect(dark?.tokens["color.text.default"]).toEqual({
      name: "color.text.default",
      type: "color",
      value: "{color.palette.neutral.100}",
      location: {
        file: "vortaro/sets/color-scheme/dark.json",
        pointer: "/color/text/default",
      },
    });
  });

  it("reads the data files and keeps $themes.json / $metadata.json raw", () => {
    expect(modelo?.reguloj.map((r) => r.id)).toEqual(["reg_01K5FMAJ0J14KNVH5BXJ93VFBG"]);
    expect(modelo?.jugxoj).toEqual([]);
    expect(modelo?.kontrastParoj.map((k) => [k.foreground, k.background])).toEqual([
      ["color.text.default", "color.background.default"],
    ]);
    expect(Object.keys(modelo?.idsLock.ids ?? {})).toHaveLength(20);
    expect(Array.isArray(modelo?.themesFile)).toBe(true);
    expect(modelo?.metadataFile).toEqual({
      tokenSetOrder: [
        "core",
        "color-scheme/dark",
        "contrast/high",
        "color-scheme/dark+contrast/high",
      ],
    });
  });

  it("is deterministic", () => {
    expect(loadModelo(minimal)).toEqual(loadModelo(minimal));
  });
});

describe("loadModelo: negative fixtures", () => {
  it("json-duplicate-token-in-set reports the second occurrence", () => {
    const result = loadModelo(
      fixtureModeloSource(join(fixturesDir, "invalid/json-duplicate-token-in-set")),
    );
    expect(result.modelo).toBeUndefined();
    expect(result.issues.map((i) => [i.rule, i.path])).toEqual([
      ["json-duplicate-key", "vortaro/sets/core.json#/color/text/default"],
    ]);
  });

  it("json-trailing-comma reports json-syntax with line and column", () => {
    const result = loadModelo(
      fixtureModeloSource(join(fixturesDir, "invalid/json-trailing-comma")),
    );
    expect(result.modelo).toBeUndefined();
    expect(result.issues.map((i) => [i.rule, i.path])).toEqual([
      ["json-syntax", "vortaro/sets/color-scheme/dark.json#"],
    ]);
    expect(result.issues[0]?.message).toContain("vortaro/sets/color-scheme/dark.json:15:5");
  });

  it("reports every missing file as file-missing without throwing", () => {
    const result = loadModelo(fixtureModeloSource(join(fixturesDir, "does-not-exist")));
    expect(result.modelo).toBeUndefined();
    expect(result.issues.every((i) => i.rule === "file-missing")).toBe(true);
    expect(result.issues.map((i) => i.path).sort()).toEqual(
      [
        "data/dimensioj.json#",
        "data/ids.lock.json#",
        "data/jugxoj.json#",
        "data/kontrastparoj.json#",
        "data/reguloj.json#",
        "vortaro/$metadata.json#",
        "vortaro/$themes.json#",
        "vortaro/sets#",
      ].sort(),
    );
    for (const issue of result.issues) {
      expect(issue.severity).toBe("error");
      expect(issue.suggestion.length).toBeGreaterThan(0);
    }
  });

  it("reports a data directory given as a file as file-missing", () => {
    const source: ModeloSource = {
      vortaroDir: join(fixturesDir, "valid/minimal/vortaro"),
      dataDir: join(fixturesDir, "valid/minimal/data/dimensioj.json"),
    };
    const result = loadModelo(source);
    expect(result.modelo).toBeUndefined();
    expect(result.issues.map((i) => i.rule)).toContain("file-missing");
  });
});

describe("buildModelo: robustness against structurally odd input", () => {
  const doc = (file: string, value: unknown) => ({ file, value });
  const files = (
    overrides: Partial<ModeloFiles["data"]> = {},
    sets: unknown[] = [],
  ): ModeloFiles => ({
    sets: sets.map((value, index) => ({
      name: `set${index}`,
      ...doc(`vortaro/sets/set${index}.json`, value),
    })),
    data: {
      "dimensioj.json": doc("data/dimensioj.json", { dimensioj: [] }),
      "reguloj.json": doc("data/reguloj.json", { reguloj: [] }),
      "jugxoj.json": doc("data/jugxoj.json", { jugxoj: [] }),
      "kontrastparoj.json": doc("data/kontrastparoj.json", { kontrastParoj: [] }),
      "ids.lock.json": doc("data/ids.lock.json", { ids: {} }),
      ...overrides,
    },
    themes: doc("vortaro/$themes.json", []),
    metadata: doc("vortaro/$metadata.json", { tokenSetOrder: [] }),
  });

  it("sorts Dimensioj by priority, stable for equal or missing priorities", () => {
    const dimensioj = [
      { name: "c", priority: 3 },
      { name: "a", priority: 1 },
      { name: "x" },
      { name: "b", priority: 2 },
      { name: "a2", priority: 1 },
    ];
    const { modelo } = buildModelo(
      files({ "dimensioj.json": doc("data/dimensioj.json", { dimensioj }) }),
    );
    expect(modelo.dimensioj.map((d) => d.name)).toEqual(["a", "a2", "b", "c", "x"]);
  });

  it("tolerates wrong top-level shapes and non-object entries", () => {
    const { modelo, issues } = buildModelo(
      files(
        {
          "dimensioj.json": doc("data/dimensioj.json", { dimensioj: "nope" }),
          "reguloj.json": doc("data/reguloj.json", [1, 2]),
          "jugxoj.json": doc("data/jugxoj.json", null),
          "kontrastparoj.json": doc("data/kontrastparoj.json", { kontrastParoj: [null, 3, {}] }),
          "ids.lock.json": doc("data/ids.lock.json", { ids: [] }),
        },
        [
          null,
          [],
          "x",
          { $extensions: { "com.ciferecigo.fundamento": { id: 3, kondicxoj: "a=b" } } },
        ],
      ),
    );
    expect(issues).toEqual([]);
    expect(modelo.dimensioj).toEqual([]);
    expect(modelo.reguloj).toEqual([]);
    expect(modelo.jugxoj).toEqual([]);
    expect(modelo.kontrastParoj).toEqual([{}]);
    expect(modelo.idsLock).toEqual({ ids: {} });
    expect(modelo.setoj.map((s) => [s.name, s.id, s.kondicxoj, s.tokens])).toEqual([
      ["set0", undefined, [], {}],
      ["set1", undefined, [], {}],
      ["set2", undefined, [], {}],
      ["set3", undefined, [], {}],
    ]);
  });

  it("passes token-level issues through with the set file path", () => {
    const { modelo, issues } = buildModelo(files({}, [{ a: { $value: 1 } }]));
    expect(modelo.setoj[0]?.tokens).toEqual({});
    expect(issues.map((i) => [i.rule, i.path])).toEqual([
      ["token-type-missing", "vortaro/sets/set0.json#/a"],
    ]);
  });
});

describe("Modelo root and default source", () => {
  it("uses the common parent when vortaro and data are siblings", () => {
    expect(modeloRootOf({ vortaroDir: "/x/root/vortaro", dataDir: "/x/root/data" })).toBe(
      "/x/root",
    );
  });

  it("uses the deepest common ancestor when they are not siblings", () => {
    expect(
      modeloRootOf({ vortaroDir: "/r/packages/vortaro", dataDir: "/r/packages/modelo/data" }),
    ).toBe("/r/packages");
    expect(modeloRootOf({ vortaroDir: "/r/a/vortaro/", dataDir: "/r/ab/data" })).toBe("/r");
  });

  it("fixtureModeloSource points at <root>/vortaro and <root>/data", () => {
    expect(fixtureModeloSource("/x/root")).toEqual({
      vortaroDir: join("/x/root", "vortaro"),
      dataDir: join("/x/root", "data"),
    });
  });

  it("defaultModeloSource resolves the repo's vortaro and data directories independent of cwd", () => {
    const source = defaultModeloSource();
    expect(isAbsolute(source.vortaroDir)).toBe(true);
    expect(isAbsolute(source.dataDir)).toBe(true);
    const vortaroPkg: unknown = JSON.parse(
      readFileSync(join(source.vortaroDir, "package.json"), "utf8"),
    );
    expect((vortaroPkg as { name: string }).name).toBe("@fundamento/vortaro");
    expect(source.dataDir).toBe(fileURLToPath(new URL("../../data", import.meta.url)));
    expect(existsSync(join(source.dataDir, ".."))).toBe(true);
  });
});
