// The Ikonaro (Spec 014 ①; G3, E9, E10, plan ① D-04): icons are vocabulary in the core and a
// picture in the Aspekto. data/ikonaro.json names at most 25 icons, each with its meaning in de and
// en and a kialo; every installed Aspekto draws every name as a square SVG in currentColor with its
// provenance — komuna from Phosphor Icons in the style regular, ekzemplo from Phosphor in the style
// fill (a fixture, so the brand switch of icons is visible and testable). Phosphor (MIT) instead of
// the spec's proposal Lucide: decision of the Maintainer, 2026-10-17 (plan ① Abweichung 1). Both
// packages map every Ikonaro name to the Phosphor name they draw it from (ikonoj.names). The
// tooltip pair of G2 is declared already.

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

interface IkonojDeclaration {
  set: string;
  style: string;
  version: string;
  license: string;
  source: string;
  read: string;
  names: Record<string, string>;
}

const readIkonoj = (dir: string): IkonojDeclaration | undefined =>
  (JSON.parse(readFileSync(join(dir, "aspekto.json"), "utf8")) as { ikonoj?: IkonojDeclaration })
    .ikonoj;

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
  ])(
    "%s draws every name: one square SVG per name in currentColor with its provenance, and nothing else",
    (_aspekto, dir) => {
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
        // Square, on the grid of the set (Phosphor: 256, kept as drawn; the size is the Ero's, D-04).
        expect(svg, name).toMatch(/viewBox="0 0 (\d+) \1"/);
        expect(svg, name).toContain("currentColor");
        expect(svg, name).toContain("<metadata>");
        expect(svg, name).toContain(`fundamento-ikonaro: ${name}`);
      }
    },
  );

  it.each([
    ["komuna", referenceAspektoPackageDir(), "regular"],
    ["ekzemplo", ekzemploDir, "fill"],
  ])(
    "%s declares Phosphor Icons (MIT, E10) in the style %s, ships the licence and maps every Ikonaro name to the Phosphor name it draws",
    (_aspekto, dir, style) => {
      const ikonoj = readIkonoj(dir);
      expect(ikonoj).toMatchObject({ set: "Phosphor Icons", style, license: "MIT" });
      expect(ikonoj?.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(ikonoj?.source).toMatch(/phosphor/i);
      expect(ikonoj?.read).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // The map Phosphor name → Ikonaro name lives in the Aspekto package, keyed by the Ikonaro name.
      expect(Object.keys(ikonoj?.names ?? {}).sort()).toEqual(names);
      for (const [name, phosphor] of Object.entries(ikonoj?.names ?? {})) {
        expect(phosphor, name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
        const svg = readFileSync(join(dir, GLYPH_DIR_NAME, `${name}.svg`), "utf8");
        // Every file repeats its provenance: the set and the Phosphor icon it was taken from, the
        // style, the version read and the licence (Art. VII).
        expect(svg, name).toMatch(
          new RegExp(`source: Phosphor Icons, icon "${phosphor}" \\(${style}\\)`),
        );
        expect(svg, name).toContain(`version: @phosphor-icons/core ${ikonoj?.version}`);
        expect(svg, name).toMatch(/license: MIT/);
      }
      const license = join(dir, GLYPH_DIR_NAME, "LICENSE");
      expect(existsSync(license)).toBe(true);
      expect(readFileSync(license, "utf8")).toContain("MIT License");
      expect(readFileSync(license, "utf8")).toContain("Phosphor Icons");
    },
  );

  it("ekzemplo draws another style on purpose (G3): filled where komuna draws regular; the same name, another picture", () => {
    const komuna = readIkonoj(referenceAspektoPackageDir());
    const ekzemplo = readIkonoj(ekzemploDir);
    expect(komuna?.style).toBe("regular");
    expect(ekzemplo?.style).toBe("fill");
    expect(ekzemplo?.style).not.toBe(komuna?.style);
    for (const name of names) {
      const close = readFileSync(
        join(referenceAspektoPackageDir(), GLYPH_DIR_NAME, `${name}.svg`),
        "utf8",
      );
      const ekzemploClose = readFileSync(join(ekzemploDir, GLYPH_DIR_NAME, `${name}.svg`), "utf8");
      expect(ekzemploClose, name).not.toBe(close);
      expect(ekzemploClose, name).toContain('fill="currentColor"');
    }
  });

  // Spec 016 ①: provo, the Aspekto the Agordilo derives, is the third known Aspekto.
  it("check:ikonaro passes on the repo: komuna, ekzemplo, provo and provo-kompakta complete", async () => {
    const result = await check({ json: true, repoRoot });
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    // Spec 019 ①: provo-kompakta is the fourth known Aspekto (Phosphor light).
    expect(result.stats).toMatchObject({
      names: names.length,
      aspektoj: 4,
      glyphs: names.length * 4,
    });
  });

  it("the tooltip pair of G2 is declared: text.inverse on background.inverse, text-normal (no new token, E1)", () => {
    const pair = modelo.kontrastParoj.find(
      (paro) => paro.name === "text-inverse-on-background-inverse",
    );
    expect(pair).toMatchObject({
      foreground: "color.text.inverse",
      background: "color.background.inverse",
      kategorio: "text-normal",
    });
  });
});
