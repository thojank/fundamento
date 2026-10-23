// Nachlese 10 (Abnahme Spec 026, 2026-10-23): the Studio in German throughout — the purpose of
// the component (N-6), the switches of the combination with the names of the Dimensioj and their
// values (N-7), the preview in the frame (N-8), the Lingvo-Schalter in the header named „Sprache“ /
// „Language“ / „lingvo“ (N-1); and the Expertenansicht says when the build it shows is older than
// the Metiejo (N-5), with the command that builds it anew.

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Agordo } from "@fundamento/agordilo";
import { buildModelo } from "@fundamento/modelo";
import { afterAll, describe, expect, it } from "vitest";
import { buildOf, expertHinweis } from "./eksperto.js";
import { previewDocument } from "./html.js";
import {
  komponentoList,
  komponentoPreview,
  komponentoScreen,
  komponentoView,
} from "./komponentoj.js";
import { DEFAULT_KOMBINATION, exampleStudioInput, studioScreen } from "./studio.js";
import { exampleScreenInput, screen } from "./sxtupoj.js";
import { loadBases } from "./vorschau.js";

const bases = loadBases();
const modelo = buildModelo(bases.structure.files).modelo;
const glitilo = modelo.eroj.find((entry) => entry.ero.name === "glitilo");
const dimensio = (name: string) => modelo.dimensioj.find((entry) => entry.name === name);
const agordo: Agordo = { name: "provo", leitfarbe: "#6b4fa0", etikedoj: { marko: "Provo GmbH" } };
const view = komponentoView({ kind: "ero", name: "glitilo" }, agordo, bases, DEFAULT_KOMBINATION, {
  field: "true",
  state: "rest",
});
const komponento = komponentoScreen({
  view,
  marko: { name: "provo", agordo, saved: false, rev: 1 },
  kombination: DEFAULT_KOMBINATION,
  komponentoj: komponentoList(bases),
  probleme: 0,
  expert: {},
});
const islandOf = (html: string) =>
  JSON.parse(
    (
      /<script type="application\/json" id="fm-nomoj">(.*?)<\/script>/s.exec(html)?.[1] ?? "{}"
    ).replaceAll("<\\/", "</"),
  ) as {
    de?: Record<string, string>;
    en?: Record<string, string>;
    tekstoj?: Record<string, Record<string, string>>;
  };
const escape = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

describe("N-6: the purpose of the component in the language chosen", () => {
  it("the page shows the purpose of the Uzo in the span of its text; the island has it in German", () => {
    const uzo = glitilo?.uzo;
    const purpose = uzo?.purpose.replace(/\s*\n\s*/g, " ").trim() ?? "";
    expect(komponento).toContain(
      `<span data-fm-nomo="${uzo?.id}/purpose">${escape(purpose)}</span>`,
    );
    expect(islandOf(komponento).de?.[`${uzo?.id}/purpose`]).toBe(
      modelo.tradukoj?.de?.[`${uzo?.id}/purpose`],
    );
  });
});

describe("N-7: the switches of the combination name the Dimensioj and their values", () => {
  it("label and values in the spans of their names; German and English in the island", () => {
    const html = studioScreen(exampleStudioInput("farbe"));
    const scheme = dimensio("color-scheme");
    const light = scheme?.valoroj?.find((valoro) => valoro.name === "light");
    expect(html).toContain(`<span data-fm-nomo="${scheme?.id}/name">color-scheme</span>`);
    expect(html).toContain(
      `<data slot="options" value="light"><span data-fm-nomo="${light?.id}/name">light</span></data>`,
    );
    for (const name of ["viewport", "density", "contrast"]) {
      expect(html, name).toContain(
        `<span data-fm-nomo="${dimensio(name)?.id}/name">${name}</span>`,
      );
    }
    const island = islandOf(html);
    expect(island.de?.[`${scheme?.id}/name`]).toBe("Farbschema");
    expect(island.de?.[`${light?.id}/name`]).toBe("Hell");
    expect(island.en?.[`${dimensio("viewport")?.id}/name`]).toBe("Viewport");
  });
});

describe("N-8: the preview in the frame switches too", () => {
  const preview = komponentoPreview(view);
  it("the heading names the component without its Esperanto name beside, the rows their axes and values", () => {
    expect(preview).toContain(
      `<h2><span data-fm-nomo="${glitilo?.ero.id}/name" data-fm-nomo-sole>glitilo</span>: <span data-fm-teksto="varianten-zustaende">Varianten × Zustände</span></h2>`,
    );
    expect(preview).toContain(
      `<span data-fm-nomo="${glitilo?.skemo.id}/props/field">field</span>=true`,
    );
    expect(preview).toContain(
      `<span data-fm-nomo="${glitilo?.skemo.id}/states/hover">hover</span>`,
    );
  });

  it("the document of the frame carries the names and reads the choice of the browser", () => {
    const html = previewDocument({
      name: "provo",
      cssHref: "/x.css",
      fontFace: "",
      scheme: "light",
      body: preview,
    });
    expect(islandOf(html).de?.[`${glitilo?.skemo.id}/props/field`]).toBe("Eingabefeld");
    expect(html).toContain('localStorage.getItem("fundamento-lingvo")');
    expect(html).toContain("function fmLingvo(");
  });
});

describe("N-1: the switch stands in the header and is named in the language chosen", () => {
  it.each([
    ["Studio", studioScreen(exampleStudioInput("farbe"))],
    ["Schnellstart", screen(exampleScreenInput("farbe"))],
    ["Komponente", komponento],
  ])("%s", (_, html) => {
    expect(html).toMatch(
      /<fm-sxelo>\s*<div slot="principal" class="mt-lingvo"><fm-elekto name="lingvo" value="eo" orientation="horizontal" size="small" data-fm-lingvo-wahl><span data-fm-teksto="lingvo">lingvo<\/span><data slot="options" value="eo">Esperanto<\/data>/,
    );
    expect(islandOf(html).tekstoj?.lingvo).toEqual({ de: "Sprache", en: "Language" });
  });
});

describe("N-5: the Expertenansicht says when its build is not the Metiejo's", () => {
  const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-n5-"));
  afterAll(() => rmSync(scratch, { recursive: true, force: true }));

  it("reads the build of the projections from the plugin", () => {
    mkdirSync(join(scratch, "figma", "plugin"), { recursive: true });
    writeFileSync(
      join(scratch, "figma", "plugin", "code.js"),
      'const X = 1;\nconst BUILD = "abc1234";\n',
    );
    expect(buildOf(scratch)).toBe("abc1234");
    expect(buildOf(join(scratch, "nenie"))).toBeUndefined();
  });

  it("an older or unknown build gets a sentence with the command; the same commit none", () => {
    const older = expertHinweis("abc1234", "def5678");
    expect(older).toContain("abc1234");
    expect(older).toContain("def5678");
    expect(older).toContain("pnpm fm projekcioj build --out .fundamento/projekcioj");
    expect(expertHinweis(undefined, "def5678")).toContain(
      "pnpm fm projekcioj build --out .fundamento/projekcioj",
    );
    expect(expertHinweis("abc1234", "abc1234")).toBeUndefined();
    expect(expertHinweis("abc1234-dirty", "abc1234")).toBeUndefined();
    expect(expertHinweis("abc1234", undefined)).toBeUndefined();
  });

  it("the screens show the sentence beside the link", () => {
    const hinweis = expertHinweis("abc1234", "def5678") ?? "";
    const studio = studioScreen({
      ...exampleStudioInput("farbe"),
      expert: { href: "/vitrino/index.html", hinweis },
    });
    const schritt = screen({
      ...exampleScreenInput("farbe"),
      expert: { href: "/vitrino/index.html", hinweis },
    });
    for (const html of [studio, schritt]) {
      expect(html).toContain(
        `<fm-avizo slot="notices" intent="warning" data-mt-expert-hinweis>${escape(hinweis)}</fm-avizo>`,
      );
    }
  });
});
