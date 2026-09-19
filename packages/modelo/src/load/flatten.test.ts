import { describe, expect, it } from "vitest";
import { flattenTokenTree, parseKondicxoj } from "./flatten.js";

const FILE = "vortaro/sets/core.json";
const EXT = "com.ciferecigo.fundamento";

describe("flattenTokenTree", () => {
  it("flattens nested groups into canonical dot-joined names with pointer locations", () => {
    const tree = {
      color: {
        action: {
          primary: {
            rest: { $type: "color", $value: "{color.palette.blue.600}" },
          },
        },
      },
      opacity: { $type: "number", $value: 0.5 },
    };
    const { tokens, issues } = flattenTokenTree(tree, FILE);
    expect(issues).toEqual([]);
    expect(Object.keys(tokens)).toEqual(["color.action.primary.rest", "opacity"]);
    expect(tokens["color.action.primary.rest"]).toEqual({
      name: "color.action.primary.rest",
      type: "color",
      value: "{color.palette.blue.600}",
      location: { file: FILE, pointer: "/color/action/primary/rest" },
    });
    expect(tokens.opacity?.value).toBe(0.5);
  });

  it("inherits $type from the nearest ancestor group and lets the token's own $type win", () => {
    const tree = {
      $type: "number",
      size: {
        $type: "dimension",
        small: { $value: { value: 4, unit: "px" } },
        deep: { deeper: { x: { $value: { value: 8, unit: "px" } } } },
        ms: { $type: "duration", $value: { value: 100, unit: "ms" } },
      },
      ratio: { $value: 1.5 },
    };
    const { tokens, issues } = flattenTokenTree(tree, FILE);
    expect(issues).toEqual([]);
    expect(tokens["size.small"]?.type).toBe("dimension");
    expect(tokens["size.deep.deeper.x"]?.type).toBe("dimension");
    expect(tokens["size.ms"]?.type).toBe("duration");
    expect(tokens.ratio?.type).toBe("number");
  });

  it("reads description, id and role from the Fundamento extension", () => {
    const tree = {
      text: {
        $value: "{a.b}",
        $type: "color",
        $description: "Body text.",
        $extensions: { [EXT]: { id: "tok_01K5FMAJ0FRV73CQ8J0CJ9HV5S", role: "foreground" } },
      },
    };
    const { tokens } = flattenTokenTree(tree, FILE);
    expect(tokens.text).toMatchObject({
      description: "Body text.",
      id: "tok_01K5FMAJ0FRV73CQ8J0CJ9HV5S",
      role: "foreground",
    });
  });

  it("ignores extension fields of the wrong shape (the schema reports them)", () => {
    const tree = {
      a: {
        $type: "number",
        $value: 1,
        $description: 3,
        $extensions: { [EXT]: { id: 5, role: "x" } },
      },
      b: { $type: "number", $value: 1, $extensions: { [EXT]: "nope" } },
      c: { $type: "number", $value: 1, $extensions: null },
    };
    const { tokens, issues } = flattenTokenTree(tree, FILE);
    expect(issues).toEqual([]);
    for (const name of ["a", "b", "c"]) {
      expect(tokens[name]).toEqual({
        name,
        type: "number",
        value: 1,
        location: { file: FILE, pointer: `/${name}` },
      });
    }
  });

  it("skips $-prefixed keys, non-object children and does not descend into tokens", () => {
    const tree = {
      $description: "root",
      $extensions: { [EXT]: { id: "set_x", kondicxoj: [] } },
      junk: 3,
      list: [1, 2],
      nil: null,
      t: { $type: "number", $value: 1, nested: { $type: "number", $value: 2 } },
    };
    const { tokens, issues } = flattenTokenTree(tree, FILE);
    expect(issues).toEqual([]);
    expect(Object.keys(tokens)).toEqual(["t"]);
  });

  it("reports a token without an effective type as token-type-missing and skips it", () => {
    const tree = { color: { text: { $value: "{a.b}" } }, ok: { $type: "number", $value: 1 } };
    const { tokens, issues } = flattenTokenTree(tree, FILE);
    expect(Object.keys(tokens)).toEqual(["ok"]);
    expect(issues.map((i) => [i.rule, i.path])).toEqual([
      ["token-type-missing", `${FILE}#/color/text`],
    ]);
  });

  it("reports an unknown effective type as token-type-unknown, located at the declaring $type", () => {
    const tree = { g: { $type: "colour", a: { $value: 1 } }, b: { $type: 7, $value: 1 } };
    const { tokens, issues } = flattenTokenTree(tree, FILE);
    expect(tokens).toEqual({});
    expect(issues.map((i) => [i.rule, i.path])).toEqual([
      ["token-type-unknown", `${FILE}#/g/$type`],
      ["token-type-unknown", `${FILE}#/b/$type`],
    ]);
  });

  it("escapes pointer segments of odd keys and keeps the first of colliding names", () => {
    const tree = {
      "a.b": { $type: "number", $value: 1 },
      a: { b: { $type: "number", $value: 2 } },
      "x/y": { $type: "number", $value: 3 },
    };
    const { tokens } = flattenTokenTree(tree, FILE);
    expect(tokens["a.b"]?.value).toBe(1);
    expect(tokens["x/y"]?.location.pointer).toBe("/x~1y");
  });

  it("never throws on non-object roots", () => {
    for (const tree of [null, 1, "x", [], [{ $value: 1 }], undefined]) {
      expect(flattenTokenTree(tree, FILE)).toEqual({ tokens: {}, issues: [] });
    }
  });
});

describe("parseKondicxoj", () => {
  it("parses dimensio=valoro entries in order", () => {
    expect(parseKondicxoj(["color-scheme=dark", "contrast=high"])).toEqual([
      { dimensio: "color-scheme", valoro: "dark" },
      { dimensio: "contrast", valoro: "high" },
    ]);
  });

  it("returns [] for a missing or non-array value and skips malformed entries", () => {
    expect(parseKondicxoj(undefined)).toEqual([]);
    expect(parseKondicxoj("a=b")).toEqual([]);
    expect(parseKondicxoj([1, "nokey", "=x", "x=", "a=b"])).toEqual([
      { dimensio: "a", valoro: "b" },
    ]);
  });
});
