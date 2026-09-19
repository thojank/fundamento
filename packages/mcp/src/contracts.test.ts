// Tool contracts of @fundamento/mcp (Spec 001, contracts/mcp-tools.md; task T023): ten read-only
// tools with an input and an output JSON Schema each, referencing the Modelo schema for shared
// shapes and compiled with the Modelo's Ajv setup.

import { describe, expect, it } from "vitest";
import { compileToolSchemas, TOOL_NAMES } from "./schemas.js";

const MODELO_ID = "https://ciferecigo.com/fundamento/schema/modelo.schema.json";
const validators = compileToolSchemas();

const ISSUE = {
  rule: "resolve-unknown-valoro",
  severity: "error",
  path: "assignment/color-scheme",
  message: "Unknown value.",
  suggestion: "Use light or dark.",
};

const SUMMARY = {
  name: "komuna",
  reference: true,
  external: false,
  owner: "Fundamento",
  license: "MIT",
  fonts: [{ family: "Geist", license: "OFL-1.1", redistributable: true, scripts: ["Latn"] }],
};

/** One valid input and output per tool, as the contract describes them. */
const EXAMPLES: Record<string, { input: unknown; output: unknown; badInput: unknown }> = {
  describe: {
    input: {},
    output: {
      version: "0.1.0",
      dimensioj: ["aspekto"],
      aspektoj: [SUMMARY],
      tokens: { count: 2, byType: { color: 2 }, byGroup: { color: 2 } },
      reguloj: { count: 1, withKialo: 1 },
      jugxoj: { count: 0 },
      eroj: { count: 0 },
      validation: { errors: 0, warnings: 0 },
      sentence: "Fundamento v0.1.0: …",
    },
    badInput: { verbose: true },
  },
  list_dimensioj: {
    input: {},
    output: {
      dimensioj: [
        {
          name: "color-scheme",
          priority: 4,
          default: "light",
          valoroj: [{ name: "dark", sets: ["color-scheme/dark"] }],
        },
      ],
      order: "core, then ascending priority, then condition count, then set name; last wins",
    },
    badInput: { name: "x" },
  },
  list_aspektoj: {
    input: {},
    output: {
      aspektoj: [
        {
          ...SUMMARY,
          id: "dva_01M2VEEDQEJEE7MR7JA8JRPMJB",
          package: "@fundamento/aspekto-komuna",
          sets: ["aspekto/komuna"],
        },
      ],
    },
    badInput: { aspekto: "komuna" },
  },
  search_tokens: {
    input: {
      prefix: "color.action",
      type: "color",
      role: "background",
      text: "fill",
      limit: 10,
      offset: 0,
    },
    output: {
      total: 1,
      tokens: [
        {
          id: "tok_01M2VEEE0QJXF3E9TY0JX4XVBK",
          name: "color.action.primary.rest",
          type: "color",
          role: "background",
        },
      ],
    },
    badInput: { limit: 501 },
  },
  get_token: {
    input: { name: "color.text.default" },
    output: {
      id: "tok_01M2VEEE0QJXF3E9TY0JX4XVBG",
      name: "color.text.default",
      type: "color",
      role: "foreground",
      definition: { set: "core", value: "{color.palette.neutral.900}" },
      overrides: [
        {
          set: "color-scheme/dark",
          kondicxoj: ["color-scheme=dark"],
          value: "{color.palette.neutral.50}",
        },
      ],
    },
    badInput: { name: "color.text.default", id: "tok_01M2VEEE0QJXF3E9TY0JX4XVBG" },
  },
  resolve: {
    input: { assignment: { aspekto: "komuna", "color-scheme": "dark" }, tokens: ["color.text"] },
    output: {
      assignment: { aspekto: "komuna", "color-scheme": "dark" },
      tokens: {
        "color.text.default": {
          id: "tok_01M2VEEE0QJXF3E9TY0JX4XVBG",
          type: "color",
          value: { colorSpace: "srgb", components: [1, 1, 1], hex: "#ffffff" },
          origin: { set: "color-scheme/dark", setId: "set_01M2VEEDW45A0B9Q4GQ465NCHJ" },
          aliasChain: [],
        },
      },
    },
    badInput: { tokens: "color.text.default" },
  },
  list_reguloj: {
    input: { aspekto: "komuna", text: "shadow" },
    output: { reguloj: [] },
    badInput: { aspekto: 3 },
  },
  list_jugxoj: {
    input: { ref: { artikolo: "X" } },
    output: { jugxoj: [] },
    badInput: { ref: { artikolo: "X", regulo: "reg_x" } },
  },
  validate: {
    input: { aspektoPath: "../fundamento-aspekto-x" },
    output: { valid: false, errors: [ISSUE], warnings: [], scope: "package" },
    badInput: { aspektoPath: "" },
  },
  derive_name: {
    input: { name: "color.action.primary.rest", celo: "figma" },
    output: {
      name: "color.action.primary.rest",
      derivations: { figma: "color/action/primary/rest" },
    },
    badInput: { name: "color.text.default", celo: "sketch" },
  },
};

describe("tool schemas (contracts/mcp-tools.md)", () => {
  it("defines exactly the ten tools of FR-16, snake_case, verb first", () => {
    expect([...TOOL_NAMES]).toEqual([
      "describe",
      "list_dimensioj",
      "list_aspektoj",
      "search_tokens",
      "get_token",
      "resolve",
      "list_reguloj",
      "list_jugxoj",
      "validate",
      "derive_name",
    ]);
  });

  it("references the Modelo schema for shared shapes", () => {
    const refs = JSON.stringify(validators.map((tool) => [tool.input.schema, tool.output.schema]));
    expect(refs).toContain(`${MODELO_ID}#/$defs/ResolvedToken`);
    expect(refs).toContain(`${MODELO_ID}#/$defs/Regulo`);
  });

  describe.each(TOOL_NAMES.map((name) => [name]))("%s", (name) => {
    const tool = validators.find((candidate) => candidate.name === name);
    const example = EXAMPLES[name];
    if (tool === undefined || example === undefined) throw new Error(`missing ${name}`);

    it("accepts the contract's example input and output", () => {
      expect(tool.input.validate(example.input), JSON.stringify(tool.input.validate.errors)).toBe(
        true,
      );
      expect(
        tool.output.validate(example.output),
        JSON.stringify(tool.output.validate.errors),
      ).toBe(true);
    });

    it("rejects an input the contract rules out", () => {
      expect(tool.input.validate(example.badInput)).toBe(false);
    });
  });

  it("describes every error as an issue envelope with optional allowed values (FR-18)", () => {
    const envelope = validators[0]?.error;
    expect(envelope?.validate({ issues: [ISSUE], allowed: ["light", "dark"] })).toBe(true);
    expect(envelope?.validate({ issues: [], extra: 1 })).toBe(false);
  });
});
