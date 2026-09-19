import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { check } from "./index.js";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));
const builtRunner = fileURLToPath(new URL("../../../dist/checks/run.js", import.meta.url));
const fixture = (path: string): string =>
  fileURLToPath(new URL(`../../../test/fixtures/${path}/`, import.meta.url));

interface ExpectedIssues {
  issues: { rule: string; path: string }[];
}

const expectedIssues = (path: string): ExpectedIssues["issues"] =>
  (JSON.parse(readFileSync(`${fixture(path)}expected-issues.json`, "utf8")) as ExpectedIssues)
    .issues;

describe("vortaro-lint on the repo", () => {
  it("passes, with file counts in stats", async () => {
    const result = await check({ json: true, repoRoot });
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.check).toBe("vortaro-lint");
    expect(result.stats.files).toBeGreaterThan(0);
    expect(result.stats.packageJsonFiles).toBeGreaterThanOrEqual(4);
    expect(result.stats).toHaveProperty("projekcioCssFiles");
    expect(result.summary).toMatch(/files/);
  });
});

describe("vortaro-lint fixtures", () => {
  it("passes the positive Projekcio fixture and inspects its CSS, elements and tokens", async () => {
    const result = await check({ json: true, repoRoot, fixture: fixture("valid/lint-projekcio") });
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.stats.projekcioCssFiles).toBe(2);
    expect(result.stats.customElements).toBe(1);
    expect(result.stats.tokens).toBe(2);
  });

  it.each([
    "invalid/lint-css-literal",
    "invalid/lint-foreign-custom-property",
    "invalid/lint-bad-package-name",
    "invalid/lint-non-ascii",
  ])("%s fails with exactly the expected rule and path", async (name) => {
    const result = await check({ json: true, repoRoot, fixture: fixture(name) });
    expect(result.ok).toBe(false);
    expect(result.errors.map(({ rule, path }) => ({ rule, path }))).toEqual(expectedIssues(name));
    for (const issue of result.errors) {
      expect(issue.severity).toBe("error");
      expect(issue.message.length).toBeGreaterThan(0);
      expect(issue.suggestion.length).toBeGreaterThan(0);
    }
  });

  it("reports the foreign custom element of the clean-room fixture as namespace-custom-element", async () => {
    const result = await check({
      json: true,
      repoRoot,
      fixture: fixture("invalid/clean-room-foreign-prefix"),
    });
    expect(result.errors.map(({ rule, path }) => ({ rule, path }))).toEqual([
      { rule: "namespace-custom-element", path: "src/elements.ts:2:1" },
    ]);
  });
});

describe("built runner", () => {
  it("exits 0 on the repo and 1 on a failing fixture, printing only JSON with --json", () => {
    expect(existsSync(builtRunner), `missing ${builtRunner}; run the build first`).toBe(true);
    const pass = spawnSync(process.execPath, [builtRunner, "vortaro-lint"], { encoding: "utf8" });
    expect(pass.status).toBe(0);
    expect(pass.stdout).toContain("PASS vortaro-lint");

    const fail = spawnSync(
      process.execPath,
      [builtRunner, "vortaro-lint", "--json", "--fixture", fixture("invalid/lint-css-literal")],
      { encoding: "utf8" },
    );
    expect(fail.status).toBe(1);
    expect(fail.stderr).toBe("");
    const result = JSON.parse(fail.stdout) as { errors: { rule: string }[] };
    expect(result.errors.map(({ rule }) => rule)).toEqual(["css-literal-value"]);
  });
});
