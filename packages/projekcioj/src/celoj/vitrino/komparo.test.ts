// The comparison of two Aspektoj (Spec 004 FR-08, maintainer's review of 2026-09-20): every
// measurement the Vitrino already has appears as a criterion, each with vorn / gleich / hinten.
// Two Aspektoj are needed, so this builds the ekzemplo composition.

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { projectModeloSource } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildProjekcioj } from "../../build.js";
import type { VitrinoDatumoj } from "./datumoj.js";
import { VITRINO_FILE } from "./vitrino.js";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));
const config = join(
  repoRoot,
  "packages/modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
);
const dirs: string[] = [];
let datumoj: VitrinoDatumoj;

beforeAll(async () => {
  const out = mkdtempSync(join(tmpdir(), "fm-vitrino-komparo-"));
  dirs.push(out);
  const built = await buildProjekcioj({ outDir: out, source: projectModeloSource(config) });
  expect(built.ok).toBe(true);
  const html = readFileSync(join(out, VITRINO_FILE), "utf8");
  const island = /<script type="application\/json" id="fm-vitrino">(.*?)<\/script>/s.exec(html);
  datumoj = JSON.parse((island?.[1] ?? "{}").replaceAll("<\\/", "</")) as VitrinoDatumoj;
}, 180_000);

afterAll(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("the criteria of the comparison (FR-08)", () => {
  const rows = () => datumoj.komparo["komuna|ekzemplo"] ?? [];

  it.each([
    "kleinste Kontrast-Reserve",
    "Bestehensquote der KontrastParoj",
    "Regelmäßigkeit der Paletten",
    "Abstand zum Anker",
    "Regelmäßigkeit der Typo-Skala",
    "beratende APCA-Hinweise",
  ])("names the criterion %s", (kriterio) => {
    expect(rows().map((row) => row.kriterio)).toContain(kriterio);
  });

  it("compares the coverage of every Dimensio value, not only the dark mode", () => {
    const coverage = rows().filter((row) => row.kriterio.startsWith("eigene Werte"));
    expect(coverage.length).toBeGreaterThan(3);
    expect(coverage.map((row) => row.kriterio)).toContain("eigene Werte in color-scheme=dark");
    expect(coverage.map((row) => row.kriterio)).toContain("eigene Werte in contrast=high");
  });

  // The shade and tint ramps are overlays, not a lightness ladder: they have no regularity, and
  // counting them made every brand look equally irregular.
  it("measures the regularity of the colour ramps, not of the overlay ramps", () => {
    const row = rows().find((entry) => entry.kriterio === "Regelmäßigkeit der Paletten");
    const percent = Number((row?.a ?? "").replace(/[^0-9.]/g, ""));
    expect(percent).toBeLessThan(60);
  });

  it("never shows a negative distance to the anchor", () => {
    const row = rows().find((entry) => entry.kriterio === "Abstand zum Anker");
    expect(row?.a).not.toContain("-");
    expect(row?.b).not.toContain("-");
  });

  it("marks every criterion with vorn, gleich or hinten and shows both values", () => {
    for (const row of rows()) {
      expect(["a", "b", "egale"], row.kriterio).toContain(row.pli);
      expect(row.a, row.kriterio).not.toBe("");
      expect(row.b, row.kriterio).not.toBe("");
    }
    expect(rows().length).toBeGreaterThanOrEqual(10);
  });

  it("calls two equal-looking values equal, not a lead", () => {
    for (const row of rows()) {
      if (row.a === row.b) expect(row.pli, row.kriterio).toBe("egale");
    }
  });

  it("reads the direction per criterion: fewer APCA findings is ahead, more coverage is ahead", () => {
    const hints = rows().find((row) => row.kriterio === "beratende APCA-Hinweise");
    const value = (text: string): number =>
      Number(text.replace(/[^0-9.,-]/g, "").replace(",", "."));
    expect(hints).toBeDefined();
    if (hints !== undefined && hints.pli !== "egale") {
      const ahead = hints.pli === "a" ? value(hints.a) : value(hints.b);
      const behind = hints.pli === "a" ? value(hints.b) : value(hints.a);
      expect(ahead).toBeLessThan(behind);
    }
    const dark = rows().find((row) => row.kriterio === "eigene Werte in color-scheme=dark");
    if (dark !== undefined && dark.pli !== "egale") {
      const ahead = dark.pli === "a" ? value(dark.a) : value(dark.b);
      const behind = dark.pli === "a" ? value(dark.b) : value(dark.a);
      expect(ahead).toBeGreaterThan(behind);
    }
  });
});
