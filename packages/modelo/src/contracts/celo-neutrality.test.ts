import { describe, expect, it } from "vitest";
import { readModeloSchema } from "./schema.js";

// AK-12 (first half): the canonical schema carries no Celo-specific vocabulary (Art. VIII).
const FORBIDDEN = ["tailwind", "css", "figma", "penpot", "daisy", "html", "dom", "swiftui"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Collects every name the schema gives to data: property names, def names and enum/const values. */
function collectVocabulary(node: unknown, out: string[]): string[] {
  if (Array.isArray(node)) {
    for (const item of node) {
      collectVocabulary(item, out);
    }
    return out;
  }
  if (!isRecord(node)) {
    return out;
  }
  for (const key of ["properties", "patternProperties", "$defs"]) {
    const child = node[key];
    if (isRecord(child)) {
      out.push(...Object.keys(child));
    }
  }
  for (const key of ["required", "enum"]) {
    const child = node[key];
    if (Array.isArray(child)) {
      out.push(...child.filter((item): item is string => typeof item === "string"));
    }
  }
  if (typeof node.const === "string") {
    out.push(node.const);
  }
  for (const value of Object.values(node)) {
    collectVocabulary(value, out);
  }
  return out;
}

describe("schema Celo neutrality (AK-12, Art. VIII)", () => {
  const schema = readModeloSchema();
  const vocabulary = collectVocabulary(schema, []);

  it("finds the vocabulary it inspects", () => {
    expect(vocabulary).toContain("kondicxoj");
    expect(vocabulary).toContain("colorSpace");
  });

  it.each(FORBIDDEN)("uses no %s names", (word) => {
    expect(vocabulary.filter((name) => name.toLowerCase().includes(word))).toEqual([]);
  });

  it("mentions no Celo terms or derived names anywhere, prose included", () => {
    const text = JSON.stringify(schema).toLowerCase();
    for (const word of ["tailwind", "figma", "penpot", "daisyui", "--fm-", "--color-", "@theme"]) {
      expect(text, word).not.toContain(word);
    }
  });

  it("only allows px as the platform-neutral dimension unit (FR-09a)", () => {
    const defs = isRecord(schema) && isRecord(schema.$defs) ? schema.$defs : {};
    expect(defs.DimensionValue).toMatchObject({ properties: { unit: { const: "px" } } });
  });
});
