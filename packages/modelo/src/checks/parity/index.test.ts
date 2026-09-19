import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

/** A fixture directory outside the repo with the given `a.json` / `b.json` texts. */
function tempFixture(files: { a?: string; b?: string }): string {
  const root = mkdtempSync(join(tmpdir(), "fm-parity-"));
  tempDirs.push(root);
  if (files.a !== undefined) {
    writeFileSync(join(root, "a.json"), files.a);
  }
  if (files.b !== undefined) {
    writeFileSync(join(root, "b.json"), files.b);
  }
  return root;
}

const EMPTY = '{ "items": {} }';

describe("parity default run", () => {
  it("compares the empty inventory with itself and passes", async () => {
    const result = await check({ json: true, repoRoot });
    expect(result).toMatchObject({ check: "parity", ok: true, errors: [], warnings: [] });
    expect(result.stats).toEqual({ itemsA: 0, itemsB: 0, differences: 0 });
    expect(result.summary).toContain("empty inventory");
  });
});

describe("parity fixtures", () => {
  it("passes two differently ordered and whitespaced but equivalent inventories", async () => {
    const result = await check({
      json: true,
      repoRoot,
      fixture: fixture("valid/parity-equivalent"),
    });
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.stats).toEqual({ itemsA: 2, itemsB: 2, differences: 0 });
  });

  it("invalid/parity-mismatch fails with exactly the expected rules and paths", async () => {
    const expected = readExpected("invalid/parity-mismatch");
    expect(expected.check).toBe("parity");
    const result = await check({
      json: true,
      repoRoot,
      fixture: fixture("invalid/parity-mismatch"),
    });
    expect(result.ok).toBe(false);
    expect(rulesAndPaths(result.errors)).toEqual(expected.issues);
    expect(new Set(result.errors.map(({ rule }) => rule))).toEqual(
      new Set([
        "parity-item-missing",
        "parity-prop-mismatch",
        "parity-state-mismatch",
        "parity-value-mismatch",
      ]),
    );
    expect(result.stats).toEqual({ itemsA: 2, itemsB: 1, differences: 4 });
    expect(result.summary).toContain("4 difference(s)");
  });

  it("reports a missing b.json as file-missing", async () => {
    const result = await check({ json: true, repoRoot, fixture: tempFixture({ a: EMPTY }) });
    expect(result.ok).toBe(false);
    expect(rulesAndPaths(result.errors)).toEqual([{ rule: "file-missing", path: "b.json#" }]);
  });

  it("reads through the strict parser (duplicate keys are errors)", async () => {
    const result = await check({
      json: true,
      repoRoot,
      fixture: tempFixture({ a: '{ "items": {}, "items": {} }', b: EMPTY }),
    });
    expect(result.ok).toBe(false);
    expect(rulesAndPaths(result.errors)).toEqual([
      { rule: "json-duplicate-key", path: "a.json#/items" },
    ]);
  });

  it("validates the structure with a clear error before comparing", async () => {
    const result = await check({
      json: true,
      repoRoot,
      fixture: tempFixture({ a: EMPTY, b: '{ "items": { "x": { "props": {} } } }' }),
    });
    expect(result.ok).toBe(false);
    expect(rulesAndPaths(result.errors)).toEqual([
      { rule: "schema-violation", path: "b.json#/items/x" },
    ]);
    expect(result.errors[0]?.message).toMatch(/states/);
    expect(result.summary).toContain("not a valid inventory");
  });
});

describe("built runner", () => {
  it("prints only the CheckResult with --json and exits 1 on the mismatch fixture", () => {
    expect(existsSync(builtRunner), `missing ${builtRunner}; run the build first`).toBe(true);
    const child = spawnSync(
      process.execPath,
      [builtRunner, "parity", "--json", "--fixture", fixture("invalid/parity-mismatch")],
      { encoding: "utf8" },
    );
    expect(child.status).toBe(1);
    expect(child.stderr).toBe("");
    const result = JSON.parse(child.stdout) as CheckResult;
    expect(rulesAndPaths(result.errors)).toEqual(readExpected("invalid/parity-mismatch").issues);
  });

  it("prints a concise human summary and exits 0 on the default run", () => {
    const child = spawnSync(process.execPath, [builtRunner, "parity"], { encoding: "utf8" });
    expect(child.status).toBe(0);
    expect(child.stdout.split("\n")[0]).toMatch(/^PASS parity: /);
  });
});
