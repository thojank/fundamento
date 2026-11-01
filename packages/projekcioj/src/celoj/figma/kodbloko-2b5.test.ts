// Spec 036 Teil 5 ②b-5 (Spec 029 abgleich.json A-kodbloko-1/4/6, ①-2) in Figma: the new props of
// the code block are properties of its set (line-numbers and wrap BOOLEAN, language and highlight
// TEXT), no axis – the set draws the block as before. The parts only these props show (the line
// numbers, a highlighted line, the language, the words by kind) have no node and name the Jugxo of
// parts a property value shows (FIGMA_NOT_DRAWN, check:parity). The syntax roles are variables.

import { defaultModeloSource, loadModelo } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { FIGMA_NOT_DRAWN } from "./figma.js";
import { plan } from "./plugin-test-helpers.js";

const set = plan.components.find((candidate) => candidate.set === "kodbloko");
const { modelo } = loadModelo(defaultModeloSource());
const jugxo = (id: string | undefined) =>
  (modelo?.jugxoj ?? []).find((candidate) => candidate.id === id);

describe("②b-5 A-kodbloko-1/4/6 in Figma", () => {
  it("line-numbers and wrap are BOOLEAN, language and highlight TEXT; copyable stays", () => {
    expect(set?.properties).toMatchObject({
      copyable: "BOOLEAN",
      "line-numbers": "BOOLEAN",
      wrap: "BOOLEAN",
      language: "TEXT",
      highlight: "TEXT",
    });
  });

  it.each([
    "line-number",
    "highlight",
    "language",
    "keyword",
    "name",
    "string",
    "number",
    "comment",
  ])("kodbloko:%s has no node and names the Jugxo of parts a property value shows", (part) => {
    const id = FIGMA_NOT_DRAWN[`kodbloko:${part}`];
    expect(id).toBe("jug_01M6A2EXBGT5473CTBGY1WRV5E");
    expect(jugxo(id)?.kialo).toContain("line-numbers");
  });

  it("the syntax roles are variables of every brand", () => {
    const names = plan.collections.flatMap((collection) =>
      collection.variables.map((variable) => variable.name),
    );
    for (const kind of ["keyword", "name", "string", "number", "comment"]) {
      expect(names, kind).toContain(`color/syntax/${kind}`);
    }
  });
});
