// Document assertions for Spec 024 Runde 1 (specs/024-studio): the spec copied unchanged, plan ①
// with the Constitutional Compliance Review, the Raster-Vorschlag, the screenshots of every view
// of the Studio and of the Schnellstart fixes, the guide for the measurement with full paths.
// Read-only.

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { STUDIO_PAGES } from "./studio.js";

const specDir = fileURLToPath(new URL("../../../specs/024-studio/", import.meta.url));
const read = (name: string): string => readFileSync(join(specDir, name), "utf8");

/** SHA-256 of the maintainer's spec of 2026-10-21 (13 060 bytes), copied verbatim. */
const SPEC_SHA256 = "89c68df88799448de5b09a01fef5c91ee24cea88368d3db681815f1c44e57558";

describe("Spec 024 Runde 1 documentation (specs/024-studio)", () => {
  it("the spec is copied unchanged", () => {
    expect(createHash("sha256").update(read("spec.md")).digest("hex")).toBe(SPEC_SHA256);
  });

  it("plan ① carries the review against the Constitution, the decisions, the grid proposal, the screenshots, the deviations and what the maintainer decides", () => {
    const plan = read("plan.md");
    expect(plan).toContain("## ① Runde 1");
    for (const heading of [
      "### Zusammenfassung",
      "### Constitutional Compliance Review",
      "### Entwurfsentscheidungen",
      "### Raster-Vorschlag",
      "### Bildschirmfotos",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Messanleitung",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    const review = plan.slice(
      plan.indexOf("### Constitutional Compliance Review"),
      plan.indexOf("### Entwurfsentscheidungen"),
    );
    for (const article of [
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
      "X",
      "XI",
      "XII",
      "XIII",
    ]) {
      expect(review, article).toMatch(new RegExp(`\\bArt\\. ${article}\\b`));
    }
    for (const term of [
      "K-1",
      "K-2",
      "K-3",
      "K-4",
      "K-5",
      "K-6",
      "festgelegt",
      "etikedoj",
      "aspiro-loosens-regulo",
    ]) {
      expect(plan, term).toContain(term);
    }
    expect(plan).not.toContain(["cif", "ere", "cigo"].join(""));
  });

  it("the plan shows a screenshot of every view of the Studio and of the Schnellstart fixes, and every screenshot exists", () => {
    const plan = read("plan.md");
    const shots = [...plan.matchAll(/\]\((bildoj\/[a-z0-9-]+\.png)\)/g)].map(
      ([, path = ""]) => path,
    );
    for (const shot of shots) expect(existsSync(join(specDir, shot)), shot).toBe(true);
    for (const page of STUDIO_PAGES) {
      expect(
        shots.some((shot) => shot.includes(`studio-${page.key}`)),
        page.key,
      ).toBe(true);
    }
    expect(shots.filter((shot) => shot.includes("schnellstart-")).length).toBeGreaterThanOrEqual(3);
  });

  it("the guide for the measurement names full paths, the start command with cd and the localhost link", () => {
    const plan = read("plan.md");
    const guide = plan.slice(plan.indexOf("### Messanleitung"));
    expect(guide).toContain("cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds");
    expect(guide).toContain("pnpm fm metiejo");
    expect(guide).toContain("http://localhost:7301/studio/");
    expect(guide).toContain("FM_MARKEN_DIR");
    for (const term of ["M-1", "M-5", "M-6"]) expect(guide, term).toContain(term);
    for (const line of guide.split("\n").filter((entry) => entry.includes("vitrino/index.html#"))) {
      expect(line, line).toMatch(/file:\/\/\/Users\/|http:\/\/localhost:/);
    }
  });

  it("tasks ① start at T2401, name the red commit and the CI run", () => {
    const tasks = read("tasks.md");
    expect(tasks).toContain("## ① Runde 1");
    expect(tasks).toContain("**T2401");
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    expect(tasks).not.toContain(["cif", "ere", "cigo"].join(""));
  });
});

// Decision O-1 of the maintainer (22.10.): the finer grid of the coloured palettes is its own PR
// between ① and ②, documented in plan and tasks beside the rounds.
describe("Spec 024 O-1 documentation (specs/024-studio)", () => {
  it("plan and tasks carry the O-1 section with the measured values, the method and the commits", () => {
    const plan = read("plan.md");
    const tasks = read("tasks.md");
    expect(plan).toContain("## O-1 Palettenraster");
    for (const term of ["25, 150, 850, 975", "calibration.json", "palette-even", "palette-aligned"])
      expect(plan, term).toContain(term);
    expect(tasks).toContain("## O-1 Palettenraster");
    expect(tasks).toContain("**T2421");
    expect(tasks.slice(tasks.indexOf("## O-1 Palettenraster"))).toMatch(/rot `[0-9a-f]{7}`/);
  });
});

// Runde 2 (Amendment v2.3, Ero-Tokens, Komponentenseiten): plan ② with the review, the decisions,
// the count of the Ero-Tokens and of the Figma variables, the screenshots of the component pages,
// the guide; tasks ② from T2431.
describe("Spec 024 Runde 2 documentation (specs/024-studio)", () => {
  it("plan ② carries the review, the counts, the deviations, the screenshots and the guide", () => {
    const plan = read("plan.md");
    const round = plan.slice(plan.indexOf("## ② Runde 2"));
    expect(round.length).toBeGreaterThan(1000);
    for (const heading of [
      "### Zusammenfassung",
      "### Constitutional Compliance Review",
      "### Entwurfsentscheidungen",
      "### Bildschirmfotos",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Messanleitung",
    ]) {
      expect(round, heading).toContain(heading);
    }
    for (const term of [
      "Amendment v2.3",
      "Ero-Tokens",
      "pnpm vortaro:ero-tokenoj",
      "ero-tokeno-missing",
      "Figma-Variablen",
      "M-3",
      "M-4",
      "O-2",
      "O-3",
      "O-4",
      "schreibweise",
    ]) {
      expect(round, term).toContain(term);
    }
    expect(round).toMatch(/Ero-Tokens[^\n]*\b9\d\d\b/);
    expect(round).not.toContain(["cif", "ere", "cigo"].join(""));
    const shots = [...round.matchAll(/\]\((bildoj\/[a-z0-9-]+\.png)\)/g)].map(([, p = ""]) => p);
    expect(shots.some((shot) => shot.includes("studio-komponente"))).toBe(true);
    for (const shot of shots) expect(existsSync(join(specDir, shot)), shot).toBe(true);
    const guide = round.slice(round.indexOf("### Messanleitung"));
    expect(guide).toContain("cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds");
    expect(guide).toContain("http://localhost:7301/studio/");
  });

  it("tasks ② start at T2431 and name the red commit", () => {
    const tasks = read("tasks.md");
    const round = tasks.slice(tasks.indexOf("## ② Runde 2"));
    expect(round).toContain("**T2431");
    expect(round).toMatch(/rot `[0-9a-f]{7}`/);
  });
});
