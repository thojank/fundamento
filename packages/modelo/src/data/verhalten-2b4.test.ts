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
const casesOf = (ero: string) => entryOf(ero).uzo?.boundary.map((boundary) => boundary.case) ?? [];
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

/** A-elektilo-5, A-listelektilo-5, A-menuo-5: Home, End and jumping by typing (a printable character). */
describe("②b-4 A-elektilo-5, A-listelektilo-5, A-menuo-5: jumping by typing", () => {
  it.each(["elektilo", "listelektilo", "menuo"])(
    "%s: the keys name Home, End and Character (typed words jump), after the keys it had",
    (ero) => {
      const keys = entryOf(ero).skemo.a11y.keys;
      expect(keys).toEqual(expect.arrayContaining(["Home", "End"]));
      expect(keys.at(-1)).toBe("Character");
    },
  );

  it("menuo: an entry with a target (attribute to) is a link, named in the purpose in en and de", () => {
    const { uzo } = entryOf("menuo");
    expect(uzo?.purpose).toContain("(attribute to)");
    expect(modelo.tradukoj?.de?.[`${uzo?.id}/purpose`]).toContain("(Attribut to)");
  });

  it.each(["elektilo", "listelektilo", "menuo"])("%s: the brief stays under 750", (ero) => {
    expect(tokensOf(briefOf(entryOf(ero)))).toBeLessThan(750);
  });
});

/** A-langetaro-4: the bar scrolls, the selected tab stays visible; the boundary many-tabs is decided. */
describe("②b-4 A-langetaro-4: overflow", () => {
  it("langetaro: many-tabs left the Uzo (②a-3); the other boundaries stay", () => {
    expect(casesOf("langetaro")).toEqual(["closable-tabs", "manual-activation", "vertical-tabs"]);
    expect(
      modelo.tradukoj?.de?.[`${entryOf("langetaro").uzo?.id}/boundary/many-tabs/kialo`],
    ).toBeUndefined();
  });

  it("langetaro: the words of many-tabs lead to the tabs", () => {
    const goal = entryOf("langetaro").skemo.goals?.[0];
    expect(goal?.keywords.en).toEqual(expect.arrayContaining(["scrollable", "crowded"]));
    expect(goal?.keywords.de).toEqual(expect.arrayContaining(["überlauf", "überlaufen"]));
    expect(suggest("scrollable tabs", "en").suggestion).toMatchObject({ ero: "langetaro" });
    expect(suggest("Reiter mit Überlauf", "de").suggestion).toMatchObject({ ero: "langetaro" });
  });

  it("langetaro: selected says that the selected tab stays in view; the brief under 750", () => {
    const selected = entryOf("langetaro").skemo.props.find((prop) => prop.name === "selected");
    expect(selected?.description).toContain("A-langetaro-4");
    expect(tokensOf(briefOf(entryOf("langetaro")))).toBeLessThan(750);
  });
});

/** A-pagxigilo-6: an unknown total – searches and logs – shows only „next“, no last page. */
describe("②b-4 A-pagxigilo-6: unknown total", () => {
  it("pagxigilo: total-unknown is a boolean, off, the last prop; named in de and en", () => {
    const { skemo } = entryOf("pagxigilo");
    expect(skemo.props.at(-1)).toMatchObject({
      name: "total-unknown",
      kind: "boolean",
      default: false,
    });
    expect(tradukoOf("pagxigilo", "props/total-unknown", "de")).toBe("Gesamtzahl unbekannt");
    expect(tradukoOf("pagxigilo", "props/total-unknown", "en")).toBe("Total unknown");
  });

  it("pagxigilo: total-pages and every prop of 0.2.0 stay as they were; the brief flags it, under 750", () => {
    const totalPages = entryOf("pagxigilo").skemo.props.find((prop) => prop.name === "total-pages");
    expect(totalPages).toMatchObject({ kind: "number", required: true });
    const brief = briefOf(entryOf("pagxigilo"));
    expect(brief.flags).toContain("total-unknown");
    expect(tokensOf(brief)).toBeLessThan(750);
  });
});
