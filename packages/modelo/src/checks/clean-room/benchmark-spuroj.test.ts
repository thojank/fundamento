// Spec 032 ② (Maintainer 2026-10-24): the fingerprints of every benchmark file in research/ run in
// check:clean-room without --spuroj, so the CI checks against Carbon and Astryx. Font families of a
// benchmark are observation, no fingerprint (Art. V); trivial values do not count (a rule as data,
// each part with its Kialo); a random hit is exempt only through a Jugxo. Result on main: 0 hits.

import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { check } from "./index.js";
import { brandCandidates } from "./marko-spuro.js";
import { BENCHMARK_SPUROJ_DIR, parseBenchmarkSpuroj } from "./benchmark-spuroj.js";
import hazardaj from "./hazardaj-trafoj.json" with { type: "json" };
import { isTrivial, TRIVIALAJ } from "./trivialaj.js";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));
const fixture = fileURLToPath(
  new URL("../../../test/fixtures/invalid/clean-room-benchmark-spuroj/", import.meta.url),
);
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

const tempDirs: string[] = [];
afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const candidate = (text: string) => {
  const found = brandCandidates(text)[0];
  if (found === undefined) throw new Error(`no candidate in ${text}`);
  return found;
};

describe("benchmark lists from research/ (Spec 032 ②)", () => {
  it("reads both lists of Astryx and the list of Carbon, with their sources and counts", () => {
    const astryx = parseBenchmarkSpuroj(
      read("research/benchmark-astryx-2026-10.md"),
      "research/benchmark-astryx-2026-10.md",
    );
    expect(astryx.issues).toEqual([]);
    expect(astryx.lists.map((list) => [list.source, list.fingerprints.length])).toEqual([
      ["benchmark-astryx-theme-neutral", 347],
      ["benchmark-astryx-weitere", 1660],
    ]);
    const carbon = parseBenchmarkSpuroj(
      read("research/benchmark-carbon-2026-10.md"),
      "research/benchmark-carbon-2026-10.md",
    );
    expect(carbon.issues).toEqual([]);
    expect(carbon.lists.map((list) => [list.source, list.fingerprints.length])).toEqual([
      ["benchmark-benko", 269],
    ]);
    expect(BENCHMARK_SPUROJ_DIR).toBe("research");
  });

  it("reports a list whose count does not match its heading, and a block without its end", () => {
    const text = [
      "<!-- spuroj-anfang -->",
      "### Liste (Quelle `benchmark-testo`): 2 Fingerprints",
      "```text",
      "0ae17b6442dc10e062a9bddd34829df0063e1101daef1467bcb457c977037931",
      "```",
      "<!-- spuroj-ende -->",
    ].join("\n");
    const counted = parseBenchmarkSpuroj(text, "research/benchmark-testo.md");
    expect(counted.issues.map((issue) => [issue.rule, issue.path])).toEqual([
      ["clean-room-spuroj-invalid", "research/benchmark-testo.md:2:1"],
    ]);
    const open = parseBenchmarkSpuroj(
      text.replace("<!-- spuroj-ende -->", ""),
      "research/benchmark-testo.md",
    );
    expect(open.issues.map((issue) => issue.rule)).toEqual(["clean-room-spuroj-invalid"]);
  });

  it("checks the repo against Carbon and Astryx without --spuroj: 0 hits on main", async () => {
    const result = await check({ json: true, repoRoot });
    expect(result.errors).toEqual([]);
    // The repo's own list, Carbon (benchmark-benko) and the two lists of Astryx.
    expect(result.stats.fingerprintSources).toBe(4);
    expect(result.stats.benchmarkFiles).toBe(2);
    expect(result.stats.fingerprints).toBeGreaterThan(2_200);
    expect(result.ok).toBe(true);
  });
});

describe("what does not count (Spec 032 ② 1–3)", () => {
  it("the fixture reports only the brand family and the colour only the benchmark has", async () => {
    const result = await check({ json: true, repoRoot, fixture });
    const expected = JSON.parse(readFileSync(join(fixture, "expected-issues.json"), "utf8")) as {
      issues: { rule: string; path: string }[];
    };
    expect(result.errors.map(({ rule, path }) => ({ rule, path }))).toEqual(expected.issues);
    expect(result.stats.fingerprintSources).toBe(2);
    expect(result.stats.trivialValues).toBe(4);
    expect(result.stats.benchmarkFamilies).toBe(1);
    expect(result.stats.randomHits).toBe(1);
  });

  it("a random hit without its Jugxo is a finding, and so is the hit", async () => {
    const dir = mkdtempSync(join(tmpdir(), "fm-clean-room-"));
    tempDirs.push(dir);
    cpSync(fixture, dir, { recursive: true });
    writeFileSync(join(dir, "data/jugxoj.json"), `${JSON.stringify({ jugxoj: [] })}\n`);
    const result = await check({ json: true, repoRoot, fixture: dir });
    expect(result.errors.map(({ rule, path }) => [rule, path])).toEqual([
      ["clean-room-jugxo-missing", "hazardaj-trafoj.json"],
      ["clean-room-marko-spuro", "src/theme.css:10:22"],
      ["clean-room-marko-spuro", "src/theme.css:4:20"],
      ["clean-room-marko-spuro", "src/theme.css:7:22"],
    ]);
  });

  it("the trivial values are data, each rule with its Kialo", () => {
    expect(TRIVIALAJ.map((rule) => rule.nomo)).toEqual([
      "griza",
      "nula",
      "lineara-kurbo",
      "malgrandaj-longoj",
    ]);
    for (const rule of TRIVIALAJ) expect(rule.kialo.length, rule.nomo).toBeGreaterThan(40);
  });

  it("pure white, pure black and every grey are trivial; a colour with a hue is not", () => {
    for (const text of ["#fff", "#000000", "#5a5a5a", "#ABABAB", "#777777ff"]) {
      expect(isTrivial(candidate(text)), text).toBe(true);
    }
    for (const text of ["#540000", "#5a5a5b", "#123456"]) {
      expect(isTrivial(candidate(text)), text).toBe(false);
    }
  });

  it("a fully transparent colour, the zero curve and the linear curve are trivial", () => {
    expect(isTrivial(candidate("#12345600"))).toBe(true);
    expect(isTrivial(candidate("#123456ff"))).toBe(false);
    expect(isTrivial(candidate("cubic-bezier(0, 0, 0, 0)"))).toBe(true);
    expect(isTrivial(candidate("cubic-bezier(0, 0, 1, 1)"))).toBe(true);
    expect(isTrivial(candidate("[0, 0, 1, 1]"))).toBe(true);
    expect(isTrivial(candidate("cubic-bezier(0.2, 0, 0, 1)"))).toBe(false);
  });
});

describe("the random hit of the repo (Spec 032 ② 3)", () => {
  it("names a fingerprint of Astryx and a Jugxo to Art. V with its reason", () => {
    const jugxoj = (
      JSON.parse(read("packages/modelo/data/jugxoj.json")) as {
        jugxoj: { id: string; ref: { artikolo?: string }; decision: string; kialo: string }[];
      }
    ).jugxoj;
    const astryx = parseBenchmarkSpuroj(
      read("research/benchmark-astryx-2026-10.md"),
      "research/benchmark-astryx-2026-10.md",
    ).lists;
    expect(hazardaj.hazardaj).toHaveLength(1);
    for (const entry of hazardaj.hazardaj) {
      const list = astryx.find((candidateList) => candidateList.source === entry.source);
      expect(list?.fingerprints).toContain(entry.fingerprint);
      const jugxo = jugxoj.find((item) => item.id === entry.jugxo);
      expect(jugxo?.ref.artikolo).toBe("V");
      expect(jugxo?.decision).toBe("approved");
      expect(jugxo?.kialo.length).toBeGreaterThan(80);
      expect(entry.token).toBe("color.palette.danger.900");
    }
    // Hashes only: the list names the token, never the value.
    expect(JSON.stringify(hazardaj)).not.toMatch(/#[0-9a-f]{6}/i);
  });
});
