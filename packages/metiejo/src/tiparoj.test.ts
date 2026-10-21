// Webfonts (Spec 023, K-3, §4.7) and licensed fonts (§4.5): the catalogue with its provenance
// (Art. VII), every entry with an SPDX licence, the search, the Fonto of the Aspekto, the licensed
// font named with "lizenziert, nicht enthalten" and a fallback.

import { readAgordo } from "@fundamento/agordilo";
import { describe, expect, it } from "vitest";
import {
  fontFaceCss,
  fontoOf,
  licencedFonto,
  readTiparoj,
  searchTiparoj,
  TIPARO_LICENSES,
  tiparoFrom,
} from "./tiparoj.js";

const tiparoj = readTiparoj();

describe("the catalogue (§4.7, Art. VII)", () => {
  it("names its source, the day it was read and what was kept", () => {
    expect(tiparoj.provenance.source).toBe("https://api.fontsource.org/v1/fonts");
    expect(tiparoj.provenance.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(tiparoj.provenance.count).toBe(tiparoj.tiparoj.length);
    expect(tiparoj.tiparoj.length).toBeGreaterThan(1000);
  });

  it("carries only families with an SPDX licence of the allowlist and at least one writing system", () => {
    const bad = tiparoj.tiparoj
      .filter(
        (tiparo) =>
          !TIPARO_LICENSES.includes(tiparo.license) ||
          tiparo.scripts.length === 0 ||
          tiparo.scripts.some((script) => !/^[A-Z][a-z]{3}$/.test(script)),
      )
      .map((tiparo) => tiparo.id);
    expect(bad).toEqual([]);
  });

  it("is sorted by id without duplicates", () => {
    const ids = tiparoj.tiparoj.map((tiparo) => tiparo.id);
    expect(ids).toEqual([...new Set(ids)].sort());
  });
});

describe("tiparoFrom (no licence, no entry)", () => {
  const raw = {
    id: "x-sans",
    family: "X Sans",
    subsets: ["latin", "cyrillic"],
    category: "sans-serif",
    license: "OFL-1.1",
    variable: false,
  };

  it("maps subsets to ISO 15924 scripts and keeps the SPDX licence", () => {
    expect(tiparoFrom(raw)).toEqual({
      id: "x-sans",
      family: "X Sans",
      license: "OFL-1.1",
      category: "sans-serif",
      scripts: ["Cyrl", "Latn"],
      variable: false,
    });
    expect(tiparoFrom({ ...raw, license: "mit" })?.license).toBe("MIT");
  });

  it("drops a family without a known licence or without a writing system", () => {
    expect(tiparoFrom({ ...raw, license: undefined })).toBeUndefined();
    expect(tiparoFrom({ ...raw, license: "see website" })).toBeUndefined();
    expect(tiparoFrom({ ...raw, subsets: ["math"] })).toBeUndefined();
  });
});

describe("searchTiparoj (step 4)", () => {
  it("finds a family by its name, the exact name first, at most the limit", () => {
    const found = searchTiparoj(tiparoj, "inter", 5);
    expect(found[0]?.family).toBe("Inter");
    expect(found.length).toBeLessThanOrEqual(5);
    expect(searchTiparoj(tiparoj, "", 5)).toEqual([]);
    expect(searchTiparoj(tiparoj, "zzzz-nenio", 5)).toEqual([]);
  });

  it("ignores case and spaces", () => {
    expect(searchTiparoj(tiparoj, "SOURCE SANS", 3).map((t) => t.id)).toContain("source-sans-3");
  });
});

describe("fontoOf and licencedFonto (K-3)", () => {
  it("a webfont becomes a Fonto with licence, source and scripts the Modelo accepts", () => {
    const inter = searchTiparoj(tiparoj, "inter", 1)[0];
    if (inter === undefined) throw new Error("Inter must be in the catalogue");
    const fonto = fontoOf(inter);
    expect(fonto).toEqual({
      family: "Inter",
      license: "OFL-1.1",
      source: "https://fontsource.org/fonts/inter",
      redistributable: true,
      scripts: inter.scripts,
    });
    const { issues } = readAgordo({ name: "x", leitfarbe: "#336699", schriften: { body: fonto } });
    expect(issues).toEqual([]);
  });

  it("a licensed font is named, marked as not included, with a fallback through the structure", () => {
    const fonto = licencedFonto("Marke Sans", ["Latn"]);
    expect(fonto.family).toBe("Marke Sans");
    expect(fonto.license).toBe("proprietary");
    expect(fonto.redistributable).toBe(false);
    expect(fonto.source).toContain("lizenziert, nicht enthalten");
    const { issues } = readAgordo({
      name: "x",
      leitfarbe: "#336699",
      schriften: { display: fonto },
    });
    expect(issues).toEqual([]);
  });

  it("the preview loads a webfont from the Fontsource CDN over https only", () => {
    const inter = searchTiparoj(tiparoj, "inter", 1)[0];
    if (inter === undefined) throw new Error("Inter must be in the catalogue");
    const css = fontFaceCss(inter);
    expect(css).toContain("@font-face");
    expect(css).toContain('font-family: "Inter"');
    expect(css).toContain("https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/");
    expect(css).not.toContain("http://");
  });
});
