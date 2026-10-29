// Spec 032 ② 4, E-1 (Maintainer 2026-10-24): the fingerprints the benchmark marks as „aus
// theme-neutral" are allowed while the Fonto Astryx stands in fontoj.json with its licence,
// wherever they stand in the repository. The other themes of Astryx and Carbon stay forbidden.

import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import listoj from "./fonto-listoj.json" with { type: "json" };
import { check } from "./index.js";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));
const fixture = fileURLToPath(
  new URL("../../../test/fixtures/invalid/clean-room-fonto-listo/", import.meta.url),
);
const tempDirs: string[] = [];
afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** The fixture in a temporary directory, with its registry changed by `edit`. */
function withRegistry(edit: (fonto: Record<string, unknown>) => void): string {
  const dir = mkdtempSync(join(tmpdir(), "fm-clean-room-"));
  tempDirs.push(dir);
  cpSync(fixture, dir, { recursive: true });
  const path = join(dir, "data/fontoj.json");
  const registry = JSON.parse(readFileSync(path, "utf8")) as {
    fontoj: Record<string, unknown>[];
  };
  for (const fonto of registry.fontoj) edit(fonto);
  writeFileSync(path, `${JSON.stringify(registry, null, 2)}\n`);
  return dir;
}

const rulesAndPaths = (issues: readonly { rule: string; path: string }[]) =>
  issues.map(({ rule, path }) => ({ rule, path }));

describe("a benchmark list that is a Fonto (Spec 032 ② 4, E-1)", () => {
  it("the repository names theme-neutral of Astryx as the list of the Fonto astryx, with a Kialo", () => {
    expect(listoj.listoj.map(({ source, fonto }) => [source, fonto])).toEqual([
      ["benchmark-astryx-theme-neutral", "astryx"],
    ]);
    for (const listo of listoj.listoj) expect(listo.kialo.length).toBeGreaterThan(80);
  });

  it("the values of the list do not count while the Fonto stands with its licence; the other lists do", async () => {
    const result = await check({ json: true, repoRoot, fixture });
    const expected = JSON.parse(readFileSync(join(fixture, "expected-issues.json"), "utf8")) as {
      issues: { rule: string; path: string }[];
    };
    expect(rulesAndPaths(result.errors)).toEqual(expected.issues);
    expect(result.stats.fontoListValues).toBe(1);
  });

  it.each([
    ["without a licence", (fonto: Record<string, unknown>) => delete fonto.license],
    ["unpinned", (fonto: Record<string, unknown>) => delete fonto.commit],
    ["under another id", (fonto: Record<string, unknown>) => (fonto.id = "alia")],
  ])("%s, the Fonto does not stand, and the values of its list count again", async (_, edit) => {
    const result = await check({ json: true, repoRoot, fixture: withRegistry(edit) });
    expect(rulesAndPaths(result.errors)).toEqual([
      { rule: "clean-room-marko-spuro", path: "src/theme.css:3:21" },
      { rule: "clean-room-marko-spuro", path: "src/theme.css:4:27" },
      { rule: "clean-room-marko-spuro", path: "src/theme.css:5:22" },
    ]);
    expect(result.stats.fontoListValues).toBe(0);
  });

  it("the repository: 0 hits against Carbon and both lists of Astryx", async () => {
    const result = await check({ json: true, repoRoot });
    expect(result.errors).toEqual([]);
    expect(result.stats.fontoListValues).toBeGreaterThan(0);
  });
});
