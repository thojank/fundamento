// FUND-6.1 end-to-end: the five conformance checks through the built runner, on the repo and on
// every failing fixture (AK-05, AK-07, AK-13), plus the runner's exit-code and output contract.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parse } from "yaml";
import { CHECK_NAMES, type CheckName, type CheckResult } from "../contracts/checks.js";
import {
  checkFailingFixtures,
  checkFixtureRoot,
  expectCheckResult,
  expectValidationReport,
  fm,
  parseJsonStdout,
  REPO_ROOT,
  type Run,
  removeTempDirs,
  rulesAndPaths,
  runCheck,
  tempDir,
} from "./test-doubles/harness.js";

const failing = checkFailingFixtures();

const repoRuns = new Map<CheckName, Run>();
const fixtureRuns = new Map<string, Run>();

beforeAll(async () => {
  // Parity reads what the projections emitted, so the repo run needs a build first (Spec 003
  // T021); `pnpm check:parity` does the same with `--out .fundamento/projekcioj`.
  const projekcioj = tempDir("projekcioj");
  const build = await fm(["projekcioj", "build", "--out", projekcioj]);
  if (build.code !== 0) throw new Error(`fm projekcioj build failed: ${build.stderr}`);
  const repoArgs = (name: CheckName): string[] =>
    name === "parity" ? [name, "--json", "--projekcioj", projekcioj] : [name, "--json"];
  const [repo, fixtures] = await Promise.all([
    Promise.all(CHECK_NAMES.map((name) => runCheck(repoArgs(name)))),
    Promise.all(
      failing.map((fixture) =>
        runCheck([fixture.expected.check, "--json", "--fixture", checkFixtureRoot(fixture)]),
      ),
    ),
  ]);
  CHECK_NAMES.forEach((name, i) => {
    const run = repo[i];
    if (run !== undefined) repoRuns.set(name, run);
  });
  failing.forEach((fixture, i) => {
    const run = fixtures[i];
    if (run !== undefined) fixtureRuns.set(fixture.name, run);
  });
}, 60_000);

afterAll(removeTempDirs);

function get<K>(map: Map<K, Run>, key: K): Run {
  const run = map.get(key);
  if (run === undefined) throw new Error(`no run recorded for ${String(key)}`);
  return run;
}

describe("AK-05: every check passes on the repo", () => {
  it.each(CHECK_NAMES)("AK-05: check:%s --json exits 0 with a passing CheckResult", (name) => {
    const run = get(repoRuns, name);
    expect(run.code, run.stderr).toBe(0);
    const result = expectCheckResult(parseJsonStdout(run), name);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("AK-05: CI runs the five checks as separate steps via the root check:* scripts", () => {
    const workflow: unknown = parse(
      readFileSync(join(REPO_ROOT, ".github", "workflows", "ci.yml"), "utf8"),
    );
    const runs = JSON.stringify(workflow);
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    for (const name of CHECK_NAMES) {
      expect(runs).toContain(`"run":"pnpm check:${name}"`);
      // Parity builds the projections it compares before it runs (Spec 003 T021).
      const prefix =
        name === "parity" ? "pnpm fm projekcioj build --out .fundamento/projekcioj && " : "";
      expect(pkg.scripts[`check:${name}`]).toBe(
        `${prefix}node packages/modelo/dist/checks/run.js ${name}`,
      );
    }
  });
});

describe("AK-05: every check can fail", () => {
  it("AK-05: each of the five checks has at least one failing fixture", () => {
    const covered = new Set(failing.map((fixture) => fixture.expected.check));
    expect([...covered].sort()).toEqual([...CHECK_NAMES].sort());
  });

  it.each(failing.map((fixture) => [fixture.expected.check, fixture.name, fixture] as const))(
    "AK-05: check:%s --fixture invalid/%s exits 1 with the expected {rule, path}",
    (check, name, fixture) => {
      const run = get(fixtureRuns, name);
      expect(run.code, run.stderr).toBe(1);
      const result = expectCheckResult(parseJsonStdout(run), check);
      expect(result.ok).toBe(false);
      const errors = rulesAndPaths(result.errors);
      for (const issue of fixture.expected.issues) {
        expect(errors, `${issue.rule} at ${issue.path}`).toContainEqual(issue);
      }
      const warnings = rulesAndPaths(result.warnings);
      for (const issue of fixture.expected.warnings ?? []) {
        expect(warnings, `warning ${issue.rule} at ${issue.path}`).toContainEqual(issue);
      }
    },
  );
});

describe("AK-07: clean room", () => {
  it("AK-07: check:clean-room passes on the repo", () => {
    expect(get(repoRuns, "clean-room").code).toBe(0);
  });

  it("AK-07: a fixture with a foreign prefix makes it fail with clean-room-foreign-prefix", () => {
    const run = get(fixtureRuns, "clean-room-foreign-prefix");
    expect(run.code).toBe(1);
    const result = expectCheckResult(parseJsonStdout(run), "clean-room");
    expect(result.errors.map((issue) => issue.rule)).toContain("clean-room-foreign-prefix");
  });
});

describe("AK-13: alirebleco fails only in contrast=high", () => {
  const result = (): CheckResult =>
    expectCheckResult(
      parseJsonStdout(get(fixtureRuns, "alirebleco-high-contrast-fail")),
      "alirebleco",
    );

  it("AK-13: the high-contrast fixture fails the binding WCAG threshold", () => {
    const errors = result().errors.filter((issue) => issue.rule === "contrast-below-threshold");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("AK-13: every failing combination contains contrast=high, none contrast=default", () => {
    const errors = result().errors;
    expect(errors.length).toBeGreaterThan(0);
    for (const issue of errors) {
      expect(issue.path).toContain("contrast=high");
      expect(issue.path).not.toContain("contrast=default");
      expect(issue.combination?.contrast).toBe("high");
    }
  });

  it("AK-13: APCA shortfalls are warnings, never errors", () => {
    const { errors, warnings } = result();
    expect(errors.some((issue) => issue.rule === "contrast-advisory")).toBe(false);
    for (const issue of warnings) expect(issue.rule).toBe("contrast-advisory");
  });
});

describe("consistency: the check runner's exit codes and output", () => {
  it("consistency: an unknown check is a usage error (exit 2) with nothing on stdout", async () => {
    const run = await runCheck(["no-such-check", "--json"]);
    expect(run.code).toBe(2);
    expect(run.stdout).toBe("");
    expect(run.stderr).toContain("Unknown check");
    for (const name of CHECK_NAMES) expect(run.stderr).toContain(name);
  }, 30_000);

  it("consistency: an unknown flag is a usage error (exit 2)", async () => {
    const run = await runCheck(["parity", "--jsn"]);
    expect(run.code).toBe(2);
    expect(run.stdout).toBe("");
  }, 30_000);

  it("consistency: a missing --fixture directory is a usage error (exit 2)", async () => {
    const run = await runCheck(["regularo", "--json", "--fixture", join(REPO_ROOT, "no-such-dir")]);
    expect(run.code).toBe(2);
    expect(run.stdout).toBe("");
  }, 30_000);

  it("consistency: --json stdout of every run is exactly one JSON document", () => {
    for (const run of [...repoRuns.values(), ...fixtureRuns.values()]) {
      expect(() => JSON.parse(run.stdout)).not.toThrow();
      expect(run.stdout.trim().startsWith("{")).toBe(true);
      expect(run.stdout.trim().endsWith("}")).toBe(true);
    }
  });

  it.each(failing.filter((fixture) => fixture.expected.check === "regularo").map((f) => f.name))(
    "consistency: fm modelo validate and check:regularo report the same {rule, path} for invalid/%s",
    async (name) => {
      const fixture = failing.find((candidate) => candidate.name === name);
      if (fixture === undefined) throw new Error(`fixture ${name} missing`);
      const validate = await fm(["modelo", "validate", fixture.root, "--json"]);
      expect(validate.code).toBe(1);
      const report = expectValidationReport(parseJsonStdout(validate));
      const check = expectCheckResult(parseJsonStdout(get(fixtureRuns, name)), "regularo");
      expect(check.errors.length).toBeGreaterThan(0);
      expect(rulesAndPaths(report.errors)).toEqual(
        expect.arrayContaining(rulesAndPaths(check.errors)),
      );
    },
    30_000,
  );

  it("consistency: without --json the runner prints a human PASS/FAIL summary", async () => {
    const run = await runCheck(["regularo"]);
    expect(run.code).toBe(0);
    expect(run.stdout).toMatch(/^PASS regularo: /);
  }, 30_000);
});
