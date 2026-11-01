// Spec 036 Teil 5 ②b-5 (Spec 029 abgleich.json A-kodbloko-1/4/6, ①-2; decided 24.10.): the code
// block takes line numbers (line-numbers), wrapping (wrap), the language as text beside its
// caption (language) and highlighted lines (highlight); the parts line-number and highlight; and
// colours per kind of word for a language it knows (①-2), from the roles color.syntax.*. The
// boundary syntax-highlighting is decided and leaves the Uzo, its words lead to the kodbloko; diff
// stays open for the maintainer. The props of 0.2.0 stay; the new ones are appended.

import { describe, expect, it } from "vitest";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const entry = modelo.eroj.find((candidate) => candidate.ero.name === "kodbloko");
if (entry === undefined) throw new Error("kodbloko missing");
const { skemo, uzo } = entry;
const tokensOf = (value: unknown) => Math.ceil(Buffer.byteLength(JSON.stringify(value)) / 3);
const traduko = (path: string, lingvo: "de" | "en") =>
  modelo.tradukoj?.[lingvo]?.[`${skemo.id}/${path}`];
const suggest = (goal: string, lingvo: string) => {
  const result = suggestEro(modelo, { goal, lingvo });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

const KINDS = ["keyword", "name", "string", "number", "comment"] as const;

describe("②b-5 A-kodbloko-1: line numbers, wrapping, language, highlighted lines", () => {
  it("copyable stays first; line-numbers, wrap, language and highlight follow it", () => {
    expect(skemo.props.map((prop) => prop.name)).toEqual([
      "copyable",
      "line-numbers",
      "wrap",
      "language",
      "highlight",
    ]);
    expect(skemo.props[1]).toMatchObject({ kind: "boolean", default: false });
    expect(skemo.props[2]).toMatchObject({ kind: "boolean", default: false });
    expect(skemo.props[3]).toMatchObject({ kind: "string" });
    expect(skemo.props[4]).toMatchObject({ kind: "string" });
  });

  it("the props are named in de and en", () => {
    expect(traduko("props/line-numbers", "de")).toBe("Zeilennummern");
    expect(traduko("props/line-numbers", "en")).toBe("Line numbers");
    expect(traduko("props/wrap", "de")).toBe("Umbruch");
    expect(traduko("props/language", "de")).toBe("Sprache");
    expect(traduko("props/highlight", "de")).toBe("Hervorgehobene Zeilen");
    expect(traduko("props/highlight", "en")).toBe("Highlighted lines");
  });
});

describe("②b-5 A-kodbloko-4: the parts line-number, highlight and language", () => {
  it("a line number in the caption's colour with room after it; a highlighted line on the page's ground with a mark at its start", () => {
    expect(skemo.parts["line-number"]).toEqual({
      color: { fixed: "color.text.subtle" },
      gap: { fixed: "spacing.small" },
    });
    expect(skemo.parts.highlight).toEqual({
      fill: { fixed: "color.background.default" },
      color: { fixed: "color.border.strong" },
      width: { fixed: "border.width.focus" },
    });
    expect(skemo.parts.language).toEqual({
      typography: { fixed: "typography.caption" },
      color: { fixed: "color.text.subtle" },
    });
    expect(traduko("parts/line-number", "de")).toBe("Zeilennummer");
    expect(traduko("parts/highlight", "de")).toBe("Hervorgehobene Zeile");
  });
});

describe("②b-5 ①-2, A-kodbloko-6: colours per kind of word", () => {
  it.each(KINDS)("the part %s takes its syntax role", (kind) => {
    expect(skemo.parts[kind]).toEqual({ color: { fixed: `color.syntax.${kind}` } });
    expect(traduko(`parts/${kind}`, "en")).toBeTruthy();
    expect(traduko(`parts/${kind}`, "de")).toBeTruthy();
  });

  it("the boundary syntax-highlighting is decided; diff stays open for the maintainer", () => {
    expect(uzo?.boundary.map((boundary) => boundary.case)).toEqual(["diff"]);
    expect(suggest("syntax-highlighting", "en").suggestion?.ero).toBe("kodbloko");
    expect(suggest("Syntaxhervorhebung", "de").suggestion?.ero).toBe("kodbloko");
  });

  it("the brief stays under 750", () => {
    expect(tokensOf(briefOf(entry))).toBeLessThan(750);
  });
});
