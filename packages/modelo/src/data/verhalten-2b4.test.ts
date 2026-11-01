// Spec 036 Teil 5 ②b-4 (Spec 029 abgleich.json, aspect "verhalten" and the remaining Muster rows;
// decided 24.10.): the behaviour the Skemo states. Every new prop stands after those the Ero had
// (Arkitekturo contract: the props of 0.2.0 unchanged, new props appended); a boundary a row decides
// leaves the Uzo and its words lead to the Ero (②a-3), as character-count did in ②b-2.

import { describe, expect, it } from "vitest";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const entryOf = (ero: string) => {
  const entry = modelo.eroj.find((candidate) => candidate.ero.name === ero);
  if (entry === undefined) throw new Error(`${ero} missing`);
  return entry;
};
const tokensOf = (value: unknown) => Math.ceil(Buffer.byteLength(JSON.stringify(value)) / 3);
const tradukoOf = (ero: string, path: string, lingvo: "de" | "en") =>
  modelo.tradukoj?.[lingvo]?.[`${entryOf(ero).skemo.id}/${path}`];
const suggest = (goal: string, lingvo?: string) => {
  const result = suggestEro(modelo, lingvo === undefined ? { goal } : { goal, lingvo });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

/** A-markdovido-3: the state "streams" with aria-busy, while an answer still arrives. */
describe("②b-4 A-markdovido-3: streaming", () => {
  it("markdovido: streaming is a boolean, off, the last prop; aria-busy speaks it", () => {
    const { skemo } = entryOf("markdovido");
    expect(skemo.props.at(-1)).toMatchObject({
      name: "streaming",
      kind: "boolean",
      default: false,
    });
    expect(skemo.a11y.states.streaming).toEqual(["aria-busy"]);
  });

  it("markdovido: the prop is named in de and en; the brief flags it, under 750", () => {
    expect(tradukoOf("markdovido", "props/streaming", "de")).toBe("Streamt");
    expect(tradukoOf("markdovido", "props/streaming", "en")).toBe("Streaming");
    const brief = briefOf(entryOf("markdovido"));
    expect(brief.flags).toContain("streaming");
    expect(tokensOf(brief)).toBeLessThan(750);
  });

  it("a streamed answer leads to the markdovido", () => {
    expect(suggest("streaming answer", "en").suggestion?.ero).toBe("markdovido");
    expect(suggest("Antwort streamen", "de").suggestion?.ero).toBe("markdovido");
  });
});
