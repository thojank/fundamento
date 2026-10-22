// Spec 020 ③ (G1, G6, E7): the content of round 1 — two Eroj and a Sxablono. kodbloko is a code
// block (a command, a place in a file): a caption, its content as text that scrolls along the
// line, optionally a button that copies it and says so. markdovido shows Markdown safely: no HTML
// passes, links only with safe schemes, headings one level below the page (start-level, 2 by
// default), images a boundary. redaktilo is the editor with its preview: a tekstareo of kind code
// beside a markdovido, side by side where there is room, the preview without a live region.

import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const ero = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);

describe("the Eroj of Spec 020 ③", () => {
  it("are two more: thirty-six Eroj", () => {
    expect(modelo.eroj).toHaveLength(36);
    expect(ero("kodbloko")?.file).toBe("modelo/data/eroj/kodbloko/skemo.json");
    expect(ero("markdovido")?.file).toBe("modelo/data/eroj/markdovido/skemo.json");
  });

  it("kodbloko: a figure named by its caption, its content as text, copyable (false by default)", () => {
    const skemo = ero("kodbloko")?.skemo;
    expect(skemo?.a11y.role).toBe("figure");
    expect(skemo?.a11y.name).toEqual(["slot:caption"]);
    expect(skemo?.props.map((prop) => [prop.name, prop.kind, prop.default])).toEqual([
      ["copyable", "boolean", false],
    ]);
    expect(skemo?.slots.map((slot) => slot.name)).toEqual(["label", "caption"]);
    expect(skemo?.a11y.texts?.copyable).toEqual({ de: "Kopieren", en: "Copy" });
    // The announcement after a copy: the name of the part announce (a11y texts are keyed by props or parts).
    expect(skemo?.a11y.texts?.["announce-name"]).toEqual({ de: "Kopiert", en: "Copied" });
  });

  it("markdovido: the source as text, headings from start-level (2 by default); images and HTML are boundaries", () => {
    const entry = ero("markdovido");
    expect(entry?.skemo.props.map((prop) => [prop.name, prop.kind, prop.default])).toEqual([
      ["source", "string", undefined],
      ["start-level", "enum", "2"],
    ]);
    expect(entry?.skemo.props.find((prop) => prop.name === "start-level")?.values).toEqual([
      "2",
      "3",
      "4",
      "5",
      "6",
    ]);
    expect(entry?.uzo?.boundary.map((item) => [item.case, item.action])).toEqual([
      ["images", "ask-human"],
      ["html", "not-supported"],
    ]);
  });
});

describe("the Sxablono redaktilo (Spec 020 ③)", () => {
  it("field (a tekstareo of kind code) and preview (a markdovido), both required, the preview no live region", () => {
    const redaktilo = (modelo.sxablonoj ?? []).find((entry) => entry.sxablono.name === "redaktilo");
    expect(
      redaktilo?.skemo.regions.map((region) => [
        region.name,
        region.required,
        region.accepts,
        region.props,
      ]),
    ).toEqual([
      ["field", true, ["tekstareo"], { kind: "code" }],
      ["preview", true, ["markdovido"], undefined],
    ]);
    expect(
      redaktilo?.skemo.regions.find((region) => region.name === "preview")?.live,
    ).toBeUndefined();
    expect(redaktilo?.skemo.props.find((prop) => prop.name === "preview-label")?.required).toBe(
      true,
    );
  });
});

describe("the boundary that waited for the content (Spec 020 ③ G1)", () => {
  it("teksto.rich-text sends to the markdovido now, with a Jugxo", () => {
    const teksto = ero("teksto");
    const rich = teksto?.uzo?.boundary.find((item) => item.case === "rich-text");
    expect(rich).toMatchObject({ action: "use-instead", ero: "markdovido" });
    const jugxo = modelo.jugxoj.find(
      (entry) =>
        "ero" in entry.ref &&
        entry.ref.ero === teksto?.ero.id &&
        (entry.context ?? "").includes("Spec 020 ③"),
    );
    expect(jugxo?.context).toContain("rich-text");
  });
});
