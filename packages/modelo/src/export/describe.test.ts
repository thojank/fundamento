// The S6 dialog as a pure function of `modelo.json` (FUND-4.1, AK-06). Unit cases with small
// hand-built exports; the repo case (from dist/modelo.json alone) lives in build.test.ts.

import { describe, expect, it } from "vitest";
import type { ModeloJson } from "../contracts/modelo.js";
import { countWord, describeModelo } from "./describe.js";

function modeloJson(overrides: Partial<ModeloJson> = {}): ModeloJson {
  return {
    $schema: "./modelo.schema.json",
    fundamento: { version: "1.2.3" },
    dimensioj: [
      {
        id: "dim_A",
        name: "aspekto",
        priority: 1,
        default: "a",
        valoroj: [
          { id: "dva_A", name: "a", aspekto: { owner: "x", licenseNote: "y" } },
          { id: "dva_B", name: "b", aspekto: { owner: "x", licenseNote: "y" } },
        ],
      },
    ],
    aspektoj: [
      { id: "dva_A", name: "a", owner: "x", licenseNote: "y" },
      { id: "dva_B", name: "b", owner: "x", licenseNote: "y" },
    ],
    tokenTypes: ["color"],
    tokens: [
      { id: "tok_1", name: "color.a", type: "color" },
      { id: "tok_2", name: "color.b", type: "color" },
    ],
    setoj: [],
    reguloj: [
      {
        id: "reg_1",
        name: "r",
        statement: "s",
        kialo: "k",
        scope: "all",
        checkability: "manual",
      },
    ],
    jugxoj: [],
    kontrastParoj: [],
    eroj: [],
    rezolvo: { assignment: { aspekto: "a" }, tokens: {} },
    ...overrides,
  };
}

describe("countWord", () => {
  it.each([
    [0, "no"],
    [1, "one"],
    [6, "six"],
    [10, "ten"],
    [12, "twelve"],
    [13, "13"],
    [30, "30"],
  ])("%i -> %s", (count, word) => {
    expect(countWord(count)).toBe(word);
  });
});

describe("describeModelo", () => {
  it("computes every fact from the export", () => {
    const description = describeModelo(modeloJson());
    expect(description).toMatchObject({
      version: "1.2.3",
      dimensioj: ["aspekto"],
      aspektoj: ["a", "b"],
      tokenCount: 2,
      typeCount: 1,
      reguloCount: 1,
      reguloWithKialoCount: 1,
      eroCount: 0,
    });
    expect(description.sentence).toBe(
      "Fundamento v1.2.3: one Dimensio (aspekto), two Aspektoj `a`, `b`, 2 tokens in one type, one rule with reasons, no Eroj.",
    );
  });

  it("counts distinct token types from the inventory, not from tokenTypes", () => {
    const description = describeModelo(
      modeloJson({
        tokenTypes: ["color", "dimension"],
        tokens: [
          { id: "tok_1", name: "color.a", type: "color" },
          { id: "tok_2", name: "size.a", type: "dimension" },
          { id: "tok_3", name: "size.b", type: "dimension" },
        ],
      }),
    );
    expect(description.typeCount).toBe(2);
    expect(description.sentence).toContain("3 tokens in two types");
  });

  it("says how many rules carry a reason when not all do", () => {
    const [regulo] = modeloJson().reguloj;
    if (regulo === undefined) throw new Error("fixture has a regulo");
    const description = describeModelo(
      modeloJson({ reguloj: [regulo, { ...regulo, id: "reg_2", kialo: "  " }] }),
    );
    expect(description.reguloWithKialoCount).toBe(1);
    expect(description.sentence).toContain("two rules, one with reasons");
  });

  it("handles an export without Aspektoj and with Eroj", () => {
    const description = describeModelo(
      modeloJson({ aspektoj: [], eroj: [{ id: "ero_1", name: "button", skemo: "ske_1" }] }),
    );
    expect(description.sentence).toContain("no Aspektoj");
    expect(description.sentence).toMatch(/one Ero\.$/);
  });
});
