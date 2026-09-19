// FUND-6.1 end-to-end: `fm modelo validate` against every validation fixture (AK-02), and the
// CLI report compared with the in-process library call (cross-command consistency).

import { relative } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { fixtureModeloSource } from "../load/source.js";
import { validateModelo } from "../validate/validate-modelo.js";
import {
  expectValidationReport,
  fm,
  parseJsonStdout,
  REPO_ROOT,
  type Run,
  rulesAndPaths,
  validateNegativeFixtures,
  validatePositiveFixtures,
} from "./test-doubles/harness.js";

const negatives = validateNegativeFixtures();
const positives = validatePositiveFixtures();

/** The eight cases AK-02 names, each with the fixture and rule that proves it. */
const AK02_NAMED_CASES = [
  ["name grammar", "modelo-name-grammar", "token-name-grammar"],
  ["unknown type", "modelo-type-unknown", "token-type-unknown"],
  ["type/value mismatch", "modelo-value-invalid", "token-value-invalid"],
  ["missing alias target", "modelo-alias-target-missing", "alias-target-missing"],
  ["alias of a foreign type", "modelo-alias-type-mismatch", "alias-type-mismatch"],
  ["cycle across set boundaries", "resolve-cross-set-cycle", "alias-cycle"],
  ["duplicate ID", "ids-duplicate", "id-duplicate"],
  ["reused retired ID", "ids-retired-reused", "id-retired-reused"],
] as const;

/** Fixture path relative to the repo root, the way a user types it (resolved via INIT_CWD). */
const cliPath = (root: string): string => relative(REPO_ROOT, root);

const runs = new Map<string, Run>();

beforeAll(async () => {
  // One process per fixture, all in parallel.
  const all = [...negatives, ...positives];
  const results = await Promise.all(
    all.map((fixture) => fm(["modelo", "validate", cliPath(fixture.root), "--json"])),
  );
  all.forEach((fixture, i) => {
    const run = results[i];
    if (run !== undefined) runs.set(`${fixture.kind}/${fixture.name}`, run);
  });
}, 60_000);

function runOf(key: string): Run {
  const run = runs.get(key);
  if (run === undefined) throw new Error(`no run recorded for ${key}`);
  return run;
}

describe("AK-02: negative validation fixtures fail with path and rule", () => {
  it("AK-02: there are at least eight negative fixtures, covering the eight named cases", () => {
    expect(negatives.length).toBeGreaterThanOrEqual(8);
    const names = new Set(negatives.map((fixture) => fixture.name));
    for (const [, name, rule] of AK02_NAMED_CASES) {
      expect(names.has(name), name).toBe(true);
      const fixture = negatives.find((candidate) => candidate.name === name);
      expect(fixture?.expected.issues.map((issue) => issue.rule)).toContain(rule);
    }
  });

  it.each(AK02_NAMED_CASES)("AK-02: named case '%s' (%s) reports %s", (_label, name, rule) => {
    const report = expectValidationReport(parseJsonStdout(runOf(`invalid/${name}`)));
    expect(report.errors.map((issue) => issue.rule)).toContain(rule);
  });

  it.each(negatives.map((fixture) => [fixture.name, fixture] as const))(
    "AK-02: fm modelo validate invalid/%s --json exits non-zero with the expected {rule, path}",
    (_name, fixture) => {
      const run = runOf(`invalid/${fixture.name}`);
      expect(run.code).toBe(1);
      const report = expectValidationReport(parseJsonStdout(run));
      expect(report.valid).toBe(false);

      // testing.md CLI QA step 5: errors[0] has path, rule and suggestion filled in.
      const first = report.errors[0];
      expect(first).toBeDefined();
      expect(first?.path).toMatch(/\S/);
      expect(first?.rule).toMatch(/\S/);
      expect(first?.suggestion).toMatch(/\S/);
      const expectedRules = fixture.expected.issues.map((issue) => issue.rule);
      expect(expectedRules).toContain(first?.rule);

      const actual = rulesAndPaths(report.errors);
      for (const issue of fixture.expected.issues) {
        expect(actual, `${issue.rule} at ${issue.path}`).toContainEqual(issue);
      }
      const actualWarnings = rulesAndPaths(report.warnings);
      for (const issue of fixture.expected.warnings ?? []) {
        expect(actualWarnings, `warning ${issue.rule} at ${issue.path}`).toContainEqual(issue);
      }
    },
  );
});

describe("AK-02: positive fixtures pass", () => {
  it("AK-02: there are positive Modelo fixtures", () => {
    expect(positives.map((fixture) => fixture.name)).toEqual(
      expect.arrayContaining(["minimal", "resolve-matrix", "resolve-tie"]),
    );
  });

  it.each(positives.map((fixture) => [fixture.name, fixture] as const))(
    "AK-02: fm modelo validate valid/%s --json exits 0",
    (_name, fixture) => {
      const run = runOf(`valid/${fixture.name}`);
      expect(run.code, run.stdout).toBe(0);
      const report = expectValidationReport(parseJsonStdout(run));
      expect(report.valid).toBe(true);
      expect(report.errors).toEqual([]);
    },
  );

  it("AK-02: the repo Modelo validates clean (fm modelo validate --json exits 0)", async () => {
    const run = await fm(["modelo", "validate", "--json"]);
    expect(run.code).toBe(0);
    const report = expectValidationReport(parseJsonStdout(run));
    expect(report).toMatchObject({ valid: true, errors: [], warnings: [] });
    expect(report.summary).toMatchObject({ combinations: 72, dimensioj: 6, tokens: 30 });
  }, 30_000);
});

describe("consistency: fm modelo validate equals validateModelo in-process", () => {
  const SAMPLE = [
    "invalid/modelo-name-grammar",
    "invalid/resolve-cross-set-cycle",
    "invalid/ids-retired-reused",
    "invalid/modelo-alias-unresolvable",
    "valid/resolve-tie",
  ];

  it.each(SAMPLE)("consistency: %s gives a deep-equal report via CLI and library", (key) => {
    const fixture = [...negatives, ...positives].find(
      (candidate) => `${candidate.kind}/${candidate.name}` === key,
    );
    expect(fixture).toBeDefined();
    if (fixture === undefined) return;
    const cli = parseJsonStdout(runOf(key));
    const library: unknown = JSON.parse(
      JSON.stringify(validateModelo(fixtureModeloSource(fixture.root))),
    );
    expect(cli).toEqual(library);
  });

  it("consistency: --path <p> and the positional path give the same report", async () => {
    const key = "invalid/modelo-type-unknown";
    const fixture = negatives.find((candidate) => `invalid/${candidate.name}` === key);
    expect(fixture).toBeDefined();
    if (fixture === undefined) return;
    const run = await fm(["modelo", "validate", "--path", cliPath(fixture.root), "--json"]);
    expect(run.code).toBe(1);
    expect(parseJsonStdout(run)).toEqual(parseJsonStdout(runOf(key)));
  }, 30_000);
});
