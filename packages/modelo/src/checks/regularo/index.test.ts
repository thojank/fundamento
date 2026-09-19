import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import type { CheckResult } from "../../contracts/checks.js";
import { check } from "./index.js";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));
const fixture = (path: string): string =>
  fileURLToPath(new URL(`../../../test/fixtures/${path}/`, import.meta.url));
const builtRunner = fileURLToPath(new URL("../../../dist/checks/run.js", import.meta.url));

interface ExpectedIssues {
  check: string;
  issues: { rule: string; path: string }[];
}

const readExpected = (path: string): ExpectedIssues =>
  JSON.parse(readFileSync(join(fixture(path), "expected-issues.json"), "utf8")) as ExpectedIssues;

const rulesAndPaths = (issues: readonly { rule: string; path: string }[]) =>
  issues.map(({ rule, path }) => ({ rule, path }));

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

/** A copy of `valid/minimal` outside the repo. */
function minimalCopy(): string {
  const root = mkdtempSync(join(tmpdir(), "fm-regularo-"));
  tempDirs.push(root);
  cpSync(fixture("valid/minimal"), root, { recursive: true });
  return root;
}

describe("regularo on the repo", () => {
  it("passes with the Phase 0 Reguloj and Jugxoj", async () => {
    const result = await check({ json: true, repoRoot });
    expect(result.errors).toEqual([]);
    expect(result).toMatchObject({ check: "regularo", ok: true, warnings: [] });
    expect(result.stats).toEqual({ reguloj: 2, jugxoj: 1 });
  });
});

describe("regularo fixtures", () => {
  it("passes valid/minimal", async () => {
    const result = await check({ json: true, repoRoot, fixture: fixture("valid/minimal") });
    expect(result.errors).toEqual([]);
    expect(result.stats).toEqual({ reguloj: 1, jugxoj: 0 });
  });

  it.each(["invalid/regularo-without-kialo", "invalid/regularo-dangling-jugxo"])(
    "%s fails with exactly the expected rule and path",
    async (name) => {
      const expected = readExpected(name);
      expect(expected.check).toBe("regularo");
      const result = await check({ json: true, repoRoot, fixture: fixture(name) });
      expect(result.ok).toBe(false);
      expect(rulesAndPaths(result.errors)).toEqual(expected.issues);
    },
  );

  it("does not depend on the rest of the Modelo being valid", async () => {
    const root = minimalCopy();
    rmSync(join(root, "vortaro"), { recursive: true });
    writeFileSync(join(root, "data", "dimensioj.json"), "{ not json");
    const result = await check({ json: true, repoRoot, fixture: root });
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("reports an unreadable data file through the strict parser", async () => {
    const root = minimalCopy();
    writeFileSync(join(root, "data", "jugxoj.json"), '{ "jugxoj": [], }');
    rmSync(join(root, "data", "reguloj.json"));
    const result = await check({ json: true, repoRoot, fixture: root });
    expect(result.ok).toBe(false);
    expect(rulesAndPaths(result.errors)).toEqual([
      { rule: "file-missing", path: "data/reguloj.json#" },
      { rule: "json-syntax", path: "data/jugxoj.json#" },
    ]);
  });
});

describe("built runner", () => {
  it("prints only the CheckResult with --json and exits 1 on the missing-kialo fixture", () => {
    expect(existsSync(builtRunner), `missing ${builtRunner}; run the build first`).toBe(true);
    const child = spawnSync(
      process.execPath,
      [builtRunner, "regularo", "--json", "--fixture", fixture("invalid/regularo-without-kialo")],
      { encoding: "utf8" },
    );
    expect(child.status).toBe(1);
    expect(child.stderr).toBe("");
    const result = JSON.parse(child.stdout) as CheckResult;
    expect(rulesAndPaths(result.errors)).toEqual(
      readExpected("invalid/regularo-without-kialo").issues,
    );
  });

  it("prints a concise human summary and exits 0 on the repo", () => {
    const child = spawnSync(process.execPath, [builtRunner, "regularo"], { encoding: "utf8" });
    expect(child.status).toBe(0);
    expect(child.stdout.split("\n")[0]).toMatch(/^PASS regularo: /);
  });
});
