// The Ikonaro (Spec 014 ①; G3, E9, E10, plan ① D-04): icons are vocabulary in the core and a
// picture in the Aspekto. data/ikonaro.json names at most 25 icons, each with its meaning in de and
// en and a kialo; every installed Aspekto draws every name as an SVG on the 24 grid in currentColor
// with its provenance — komuna from Lucide (ISC), ekzemplo in a style of its own (a fixture, so the
// brand switch of icons is visible and testable). The tooltip pair of G2 is declared already.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { check, GLYPH_DIR_NAME, glyphIssues } from "../checks/ikonaro/index.js";
import { ENTITY_ID_PREFIXES, idPatternFor } from "../contracts/entity-ids.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource, referenceAspektoPackageDir } from "../load/source.js";

const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const ikonaro = modelo.ikonaro;
const names = ikonaro.map((ikono) => ikono.name);
const ekzemploDir = fileURLToPath(
  new URL("../../test/fixtures/valid/aspekto-ekzemplo/aspekto-ekzemplo/", import.meta.url),
);

/** The names the spec lists as examples (G3): the start set carries every one of them. */
const SPEC_NAMES = [
  "close",
  "chevron-down",
  "chevron-right",
  "check",
  "sort-ascending",
  "sort-descending",
  "info",
  "success",
  "warning",
  "danger",
  "more",
  "search",
  "external",
  "expand",
  "collapse",
];

describe("data/ikonaro.json (Spec 014 ①, G3)", () => {
  it("names at most 25 icons, each with an iko_ ID, a kebab name, a meaning in de and en and a kialo", () => {
    expect(ikonaro.length).toBeGreaterThan(0);
    expect(ikonaro.length).toBeLessThanOrEqual(25);
    expect(ENTITY_ID_PREFIXES.ikono).toBe("iko");
    for (const ikono of ikonaro) {
      expect(ikono.id, ikono.name).toMatch(idPatternFor("ikono"));
      expect(ikono.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(ikono.meaning.de.trim()).not.toBe("");
      expect(ikono.meaning.en.trim()).not.toBe("");
      expect(ikono.kialo.trim()).not.toBe("");
    }
    expect(new Set(names).size).toBe(names.length);
    expect([...names].sort()).toEqual(names);
  });

  it("carries every example name of the spec; chevron-right mirrors in right-to-left writing, check does not (Internacia)", () => {
    for (const name of SPEC_NAMES) expect(names, name).toContain(name);
    const byName = (name: string) => ikonaro.find((ikono) => ikono.name === name);
    expect(byName("chevron-right")?.mirror).toBe(true);
    expect(byName("check")?.mirror).toBeUndefined();
    expect(byName("external")?.mirror).toBeUndefined();
    expect(byName("sort-ascending")?.mirror).toBeUndefined();
  });

  it.each([
    ["komuna", referenceAspektoPackageDir()],
    ["ekzemplo", ekzemploDir],
  ])("%s draws every name: one SVG per name on the 24 grid in currentColor with its provenance, and nothing else", (_aspekto, dir) => {
    const glyphs = join(dir, GLYPH_DIR_NAME);
    expect(existsSync(glyphs)).toBe(true);
    const files = readdirSync(glyphs)
      .filter((file) => file.endsWith(".svg"))
      .map((file) => file.slice(0, -".svg".length))
      .sort();
    expect(files).toEqual(names);
    for (const name of names) {
      const svg = readFileSync(join(glyphs, `${name}.svg`), "utf8");
      expect(glyphIssues(`${GLYPH_DIR_NAME}/${name}.svg`, svg), name).toEqual([]);
      expect(svg, name).toContain('viewBox="0 0 24 24"');
      expect(svg, name).toContain("currentColor");
      expect(svg, name).toContain("<metadata>");
    }
  });

  it("komuna takes its glyphs from Lucide (ISC, E10) and ships the licence; ekzemplo draws its own, another style", () => {
    const komuna = JSON.parse(readFileSync(join(referenceAspektoPackageDir(), "aspekto.json"), "utf8")) as {
      ikonoj?: Record<string, string>;
    };
    expect(komuna.ikonoj).toMatchObject({ set: "Lucide", license: "ISC" });
    expect(komuna.ikonoj?.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(komuna.ikonoj?.source).toMatch(/lucide/i);
    expect(komuna.ikonoj?.read).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(existsSync(join(referenceAspektoPackageDir(), GLYPH_DIR_NAME, "LICENSE"))).toBe(true);
    expect(readFileSync(join(referenceAspektoPackageDir(), GLYPH_DIR_NAME, "LICENSE"), "utf8")).toContain(
      "ISC License",
    );
    const close = readFileSync(join(referenceAspektoPackageDir(), GLYPH_DIR_NAME, "close.svg"), "utf8");
    expect(close).toMatch(/source: Lucide/);
    expect(close).toMatch(/license: ISC/);
    const ekzemplo = JSON.parse(readFileSync(join(ekzemploDir, "aspekto.json"), "utf8")) as {
      ikonoj?: Record<string, string>;
    };
    expect(ekzemplo.ikonoj?.set).not.toBe("Lucide");
    // Another style on purpose (G3): filled where komuna draws lines.
    const ekzemploClose = readFileSync(join(ekzemploDir, GLYPH_DIR_NAME, "close.svg"), "utf8");
    expect(ekzemploClose).not.toBe(close);
    expect(ekzemploClose).toContain('fill="currentColor"');
  });

  it("check:ikonaro passes on the repo: komuna and ekzemplo complete", async () => {
    const result = await check({ json: true, repoRoot });
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.stats).toMatchObject({ names: names.length, aspektoj: 2, glyphs: names.length * 2 });
  });

  it("the tooltip pair of G2 is declared: text.inverse on background.inverse, text-normal (no new token, E1)", () => {
    const pair = modelo.kontrastParoj.find((paro) => paro.name === "text-inverse-on-background-inverse");
    expect(pair).toMatchObject({
      foreground: "color.text.inverse",
      background: "color.background.inverse",
      kategorio: "text-normal",
    });
  });
});
