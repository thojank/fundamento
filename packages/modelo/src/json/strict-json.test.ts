import { describe, expect, it } from "vitest";
import { escapePointerSegment, toJsonPointer } from "./pointer.js";
import { parseStrictJson } from "./strict-json.js";

const FILE = "vortaro/sets/core.json";

describe("parseStrictJson: valid JSON", () => {
  const samples = [
    "{}",
    "[]",
    "null",
    "true",
    "0",
    "-1.5e3",
    '"text"',
    '{"a":1,"b":[1,2,{"c":null}],"d":{"e":"f"}}',
    '{\n  "color": {\n    "$type": "color",\n    "x": { "$value": "{a.b}" }\n  }\n}\n',
    '{"__proto__": {"x": 1}, "unicode": "\\u00e9\\n"}',
    '  {"a": {"a": {"a": 1}}}  ',
  ];

  it.each(samples)("parses %j to the same value as JSON.parse", (text) => {
    const result = parseStrictJson(text, FILE);
    expect(result.issues).toEqual([]);
    expect(result.value).toEqual(JSON.parse(text));
  });

  it("keeps same-named keys in different objects", () => {
    const text = '{"a": {"x": 1}, "b": {"x": 2}}';
    expect(parseStrictJson(text, FILE)).toEqual({ value: JSON.parse(text), issues: [] });
  });
});

describe("parseStrictJson: duplicate keys", () => {
  it("rejects a duplicate key at the top level with the path of the second occurrence", () => {
    const result = parseStrictJson('{"a": 1, "a": 2}', FILE);
    expect(result.value).toBeUndefined();
    expect(result.issues.map((i) => [i.rule, i.path])).toEqual([
      ["json-duplicate-key", `${FILE}#/a`],
    ]);
  });

  it("rejects a duplicate key at any depth", () => {
    const text = '{"color": {"action": {"primary": {"rest": {}, "rest": {}}}}}';
    const result = parseStrictJson(text, FILE);
    expect(result.value).toBeUndefined();
    expect(result.issues.map((i) => [i.rule, i.path])).toEqual([
      ["json-duplicate-key", `${FILE}#/color/action/primary/rest`],
    ]);
  });

  it("finds duplicates inside arrays and reports every duplicate", () => {
    const text = '{"list": [{"k": 1, "k": 2}], "x": 1, "x": 2, "x": 3}';
    const result = parseStrictJson(text, FILE);
    expect(result.issues.map((i) => i.path)).toEqual([
      `${FILE}#/list/0/k`,
      `${FILE}#/x`,
      `${FILE}#/x`,
    ]);
    expect(result.issues.every((i) => i.rule === "json-duplicate-key")).toBe(true);
  });

  it("escapes pointer segments of duplicate keys (RFC 6901)", () => {
    const result = parseStrictJson('{"a/b~c": 1, "a/b~c": 2}', FILE);
    expect(result.issues.map((i) => i.path)).toEqual([`${FILE}#/a~1b~0c`]);
  });

  it("returns structured issues with severity error and a non-empty suggestion", () => {
    const [issue] = parseStrictJson('{"a": 1, "a": 2}', FILE).issues;
    expect(issue?.severity).toBe("error");
    expect(issue?.suggestion.length).toBeGreaterThan(0);
    expect(issue?.message).toContain('"a"');
  });
});

describe("parseStrictJson: syntax errors", () => {
  const cases: [string, string, string][] = [
    ["trailing comma in an object", '{\n  "a": 1,\n}', "3:1"],
    ["trailing comma in an array", "[1, 2,]", "1:7"],
    ["line comment", '{\n  "a": 1 // note\n}', "2:10"],
    ["block comment", '/* c */ {"a": 1}', "1:1"],
    ["unquoted key", "{a: 1}", "1:2"],
    ["invalid literal", '{"a": tru}', "1:7"],
    ["empty content", "", "1:1"],
    ["trailing content", '{"a": 1} {}', "1:10"],
    ["single quotes", "{'a': 1}", "1:2"],
    ["byte-order mark", '\uFEFF{"a": 1}', "1:1"],
  ];

  it.each(cases)("rejects a %s with json-syntax and line:column", (_name, text, lineColumn) => {
    const result = parseStrictJson(text, FILE);
    expect(result.value).toBeUndefined();
    expect(result.issues).toHaveLength(1);
    const [issue] = result.issues;
    expect(issue?.rule).toBe("json-syntax");
    expect(issue?.path).toBe(`${FILE}#`);
    expect(issue?.severity).toBe("error");
    expect(issue?.message).toContain(`${FILE}:${lineColumn}`);
    expect(issue?.suggestion.length).toBeGreaterThan(0);
  });

  it("never throws, whatever the input", () => {
    for (const text of ["{", "}", "[[[", '"', "\u0000", '{"a":"\t"}', "1 2"]) {
      const result = parseStrictJson(text, FILE);
      expect(result.value).toBeUndefined();
      expect(result.issues[0]?.rule).toBe("json-syntax");
    }
  });
});

describe("JSON Pointer helpers", () => {
  it("escapes ~ and / in segments", () => {
    expect(escapePointerSegment("a~b/c")).toBe("a~0b~1c");
  });

  it("builds pointers from segments", () => {
    expect(toJsonPointer([])).toBe("");
    expect(toJsonPointer(["color", "action", 0, "x/y"])).toBe("/color/action/0/x~1y");
  });
});
