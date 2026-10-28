// check:ikonaro (Spec 014 ①, G3): every installed Aspekto draws every name of the Ikonaro; every
// glyph is an SVG on a square grid, without a fixed colour (currentColor inherits from the text) and
// with its provenance (Art. VII: source, version, licence travel with the file). The check asks
// only for a square viewBox: the grid is the set's (Phosphor draws on 256, the fixtures on 24),
// the size comes from the Ero (plan ① D-04). Red first on the three fixtures the spec names;
// green on the repo (komuna from Phosphor regular, ekzemplo from Phosphor fill — Maintainer
// 2026-10-17, plan ① Abweichung 1).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { check, GLYPH_DIR_NAME, glyphIssues, IKONARO_FILE_NAME } from "./index.js";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));
const fixture = (path: string): string =>
  fileURLToPath(new URL(`../../../test/fixtures/${path}/`, import.meta.url));

interface ExpectedIssues {
  check: string;
  issues: { rule: string; path: string }[];
}

const readExpected = (path: string): ExpectedIssues =>
  JSON.parse(readFileSync(join(fixture(path), "expected-issues.json"), "utf8")) as ExpectedIssues;

const rulesAndPaths = (issues: readonly { rule: string; path: string }[]) =>
  issues.map(({ rule, path }) => ({ rule, path }));

const PROVENANCE = `<metadata>fundamento-ikonaro: close
source: Phosphor Icons, icon "x" (regular), https://phosphoricons.com
version: @phosphor-icons/core 2.1.1
license: MIT, https://github.com/phosphor-icons/core/blob/main/LICENSE</metadata>`;

const glyph = (attributes: string, body: string, metadata = PROVENANCE) =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${attributes}>${metadata}${body}</svg>`;

describe("check:ikonaro on the repo (Spec 014 ①)", () => {
  it("names the file and the folder: data/ikonaro.json, <package>/ikonoj/<name>.svg", () => {
    expect(IKONARO_FILE_NAME).toBe("ikonaro.json");
    expect(GLYPH_DIR_NAME).toBe("ikonoj");
  });

  it("passes: every name drawn by komuna, ekzemplo, provo and provo-kompakta, every glyph square, in currentColor, with provenance", async () => {
    const result = await check({ json: true, repoRoot });
    expect(result.check).toBe("ikonaro");
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.ok).toBe(true);
    // Spec 016 ①: the derived Aspekto provo draws the Ikonaro of komuna, copied with the structure.
    // Spec 019 ①: provo draws it in Phosphor bold, provo-kompakta in light (ikono.gewicht).
    // Spec 029 ①: and komuna-0-2, with the glyphs of komuna as they were.
    expect(result.stats.aspektoj).toBe(5);
    expect(result.stats.names).toBeGreaterThan(0);
    expect(result.stats.glyphs).toBe((result.stats.names ?? 0) * 5);
    expect(result.summary).toMatch(/komuna/);
    expect(result.summary).toMatch(/ekzemplo/);
    expect(result.summary).toMatch(/provo/);
    expect(result.summary).toMatch(/provo-kompakta/);
    expect(result.summary).toMatch(/komuna-0-2/);
  });
});

describe("the rules of one glyph (glyphIssues)", () => {
  const file = "aspekto-prova/ikonoj/close.svg";

  it("accepts a line glyph in currentColor on the 24 grid with provenance, and a filled one on the 256 grid of Phosphor", () => {
    expect(
      glyphIssues(
        file,
        glyph(
          'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"',
          '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
        ),
      ),
    ).toEqual([]);
    expect(
      glyphIssues(
        file,
        glyph('viewBox="0 0 24 24" fill="currentColor"', '<path d="M4 4h16v16H4z"/>'),
      ),
    ).toEqual([]);
    expect(
      glyphIssues(
        file,
        glyph(
          'viewBox="0 0 256 256" fill="currentColor"',
          '<path d="M205.66,194.34a8,8,0,0,1-11.32,11.32Z"/>',
        ),
      ),
    ).toEqual([]);
  });

  it("asks only for a square viewBox: reports one that is not square, and a missing one", () => {
    const issues = glyphIssues(
      file,
      glyph('viewBox="0 0 24 16" fill="currentColor"', '<path d="M0 0h16v16z"/>'),
    );
    expect(rulesAndPaths(issues)).toEqual([{ rule: "ikonaro-glyph-viewbox", path: `${file}#` }]);
    expect(issues[0]?.message).toContain("0 0 24 16");
    expect(
      rulesAndPaths(
        glyphIssues(
          file,
          glyph('viewBox="4 0 16 16" fill="currentColor"', '<path d="M0 0h16v16z"/>'),
        ),
      ),
    ).toEqual([{ rule: "ikonaro-glyph-viewbox", path: `${file}#` }]);
    expect(
      rulesAndPaths(glyphIssues(file, glyph('fill="currentColor"', '<path d="M0 0h16v16z"/>'))),
    ).toEqual([{ rule: "ikonaro-glyph-viewbox", path: `${file}#` }]);
    // Any square grid passes: 16, 24 and 256 alike (the size is the Ero's, D-04).
    expect(
      glyphIssues(
        file,
        glyph('viewBox="0 0 16 16" fill="currentColor"', '<path d="M0 0h16v16z"/>'),
      ),
    ).toEqual([]);
  });

  it("reports a fixed colour on the root or on a shape, in an attribute or in a style; none and currentColor are no colour", () => {
    for (const body of [
      glyph('viewBox="0 0 24 24" fill="none" stroke="#111"', '<path d="M1 1"/>'),
      glyph('viewBox="0 0 24 24"', '<path d="M1 1" fill="black"/>'),
      glyph('viewBox="0 0 24 24"', '<path d="M1 1" style="fill: rgb(0,0,0)"/>'),
      glyph(
        'viewBox="0 0 24 24" fill="currentColor"',
        '<circle cx="1" cy="1" r="1" stroke="red"/>',
      ),
    ]) {
      expect(rulesAndPaths(glyphIssues(file, body)), body).toEqual([
        { rule: "ikonaro-glyph-fixed-color", path: `${file}#` },
      ]);
    }
    expect(
      glyphIssues(
        file,
        glyph(
          'viewBox="0 0 24 24" fill="none" stroke="currentColor"',
          '<path d="M1 1" fill="none"/>',
        ),
      ),
    ).toEqual([]);
  });

  it("reports provenance that is missing or incomplete: source, version and licence must be named", () => {
    expect(
      rulesAndPaths(
        glyphIssues(file, glyph('viewBox="0 0 24 24" fill="currentColor"', '<path d="M1 1"/>', "")),
      ),
    ).toEqual([{ rule: "ikonaro-glyph-provenance-missing", path: `${file}#` }]);
    const incomplete = glyphIssues(
      file,
      glyph(
        'viewBox="0 0 24 24" fill="currentColor"',
        '<path d="M1 1"/>',
        "<metadata>source: Phosphor Icons</metadata>",
      ),
    );
    expect(rulesAndPaths(incomplete)).toEqual([
      { rule: "ikonaro-glyph-provenance-missing", path: `${file}#` },
    ]);
    expect(incomplete[0]?.message).toContain("version");
    expect(incomplete[0]?.message).toContain("license");
  });

  it("reports what is no SVG at all", () => {
    expect(rulesAndPaths(glyphIssues(file, "<html></html>"))).toEqual([
      { rule: "ikonaro-glyph-viewbox", path: `${file}#` },
    ]);
  });
});

describe("check:ikonaro on the failing fixtures (red first)", () => {
  it.each([
    "ikonaro-glyph-missing",
    "ikonaro-glyph-fixed-color",
    "ikonaro-glyph-provenance-missing",
  ])("invalid/%s fails with the expected rule and path", async (name) => {
    const expected = readExpected(`invalid/${name}`);
    expect(expected.check).toBe("ikonaro");
    const result = await check({ json: true, repoRoot, fixture: fixture(`invalid/${name}`) });
    expect(result.ok).toBe(false);
    for (const issue of expected.issues) {
      expect(rulesAndPaths(result.errors), issue.rule).toContainEqual(issue);
    }
    expect(result.stats.aspektoj).toBe(1);
  });

  it("the missing glyph names the Aspekto and the file it expects", async () => {
    const result = await check({
      json: true,
      repoRoot,
      fixture: fixture("invalid/ikonaro-glyph-missing"),
    });
    const missing = result.errors.find((issue) => issue.rule === "ikonaro-glyph-missing");
    expect(missing?.message).toContain("prova");
    expect(missing?.message).toContain("check");
    expect(missing?.suggestion).toContain("ikonoj/check.svg");
  });

  it("a glyph without a name in the Ikonaro is a warning, never deleted", async () => {
    const result = await check({
      json: true,
      repoRoot,
      fixture: fixture("invalid/ikonaro-glyph-missing"),
    });
    expect(rulesAndPaths(result.warnings)).toEqual([
      { rule: "ikonaro-glyph-unknown", path: "aspekto-prova/ikonoj/star.svg#" },
    ]);
  });
});
