import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import type { CheckResult } from "../../contracts/checks.js";
import { check } from "./index.js";
import { BENCHMARK_DIR_NAME, GITIGNORE_BENCHMARK_PATTERNS } from "./patterns.js";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));
const fixture = (path: string): string =>
  fileURLToPath(new URL(`../../../test/fixtures/${path}/`, import.meta.url));
const builtRunner = fileURLToPath(new URL("../../../dist/checks/run.js", import.meta.url));

interface ExpectedIssues {
  materialize?: Record<string, string>;
  issues: { rule: string; path: string }[];
}

const readExpected = (path: string): ExpectedIssues =>
  JSON.parse(readFileSync(join(fixture(path), "expected-issues.json"), "utf8")) as ExpectedIssues;

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

/** Copies a fixture outside the repo and creates the git-ignored files it lists in `materialize`. */
function materialize(name: string): string {
  const root = mkdtempSync(join(tmpdir(), "fm-clean-room-"));
  tempDirs.push(root);
  cpSync(fixture(name), root, { recursive: true });
  for (const [path, text] of Object.entries(readExpected(name).materialize ?? {})) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

const rulesAndPaths = (issues: readonly { rule: string; path: string }[]) =>
  issues.map(({ rule, path }) => ({ rule, path }));

describe(".gitignore", () => {
  it("contains both benchmark patterns", () => {
    const lines = readFileSync(join(repoRoot, ".gitignore"), "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim());
    expect(GITIGNORE_BENCHMARK_PATTERNS).toHaveLength(2);
    for (const pattern of GITIGNORE_BENCHMARK_PATTERNS) {
      expect(lines).toContain(pattern);
    }
  });
});

describe("clean-room on the repo (AK-07)", () => {
  it("passes, with file counts in stats", async () => {
    const result = await check({ json: true, repoRoot });
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.check).toBe("clean-room");
    expect(result.stats.files).toBeGreaterThan(0);
    expect(result.stats.referenceFiles).toBeGreaterThan(0);
    expect(result.stats.exemptFiles).toBe(1);
  });
});

describe("clean-room fixtures", () => {
  it("passes the positive lint fixture", async () => {
    const result = await check({ json: true, repoRoot, fixture: fixture("valid/lint-projekcio") });
    expect(result.errors).toEqual([]);
  });

  it.each(["invalid/clean-room-foreign-prefix", "invalid/clean-room-benchmark-reference"])(
    "%s fails with exactly the expected rule and path",
    async (name) => {
      const result = await check({ json: true, repoRoot, fixture: fixture(name) });
      expect(result.ok).toBe(false);
      expect(rulesAndPaths(result.errors)).toEqual(readExpected(name).issues);
    },
  );

  it("maps every FR-14 allowlist finding to clean-room-foreign-prefix", async () => {
    const result = await check({
      json: true,
      repoRoot,
      fixture: fixture("invalid/lint-bad-package-name"),
    });
    expect(rulesAndPaths(result.errors)).toEqual([
      { rule: "clean-room-foreign-prefix", path: "packages/widgets/package.json#/name" },
    ]);
    expect(result.errors[0]?.message).toContain("namespace-package");
  });

  it("invalid/clean-room-benchmark-file fails once its git-ignored file is materialized", async () => {
    const committed = await check({
      json: true,
      repoRoot,
      fixture: fixture("invalid/clean-room-benchmark-file"),
    });
    expect(committed.ok).toBe(true);

    const root = materialize("invalid/clean-room-benchmark-file");
    expect(existsSync(join(root, BENCHMARK_DIR_NAME))).toBe(true);
    const result = await check({ json: true, repoRoot, fixture: root });
    expect(result.ok).toBe(false);
    expect(rulesAndPaths(result.errors)).toEqual(
      readExpected("invalid/clean-room-benchmark-file").issues,
    );
  });

  it("does not exempt the pattern source outside the repo run", async () => {
    const root = mkdtempSync(join(tmpdir(), "fm-clean-room-"));
    tempDirs.push(root);
    const patternSource = "packages/modelo/src/checks/clean-room/patterns.ts";
    mkdirSync(dirname(join(root, patternSource)), { recursive: true });
    cpSync(join(repoRoot, patternSource), join(root, patternSource));
    const result = await check({ json: true, repoRoot, fixture: root });
    expect(result.errors.map(({ rule }) => rule)).toContain("clean-room-benchmark-reference");
  });
});

describe("built runner", () => {
  it("exits 1 with a CheckResult on the materialized benchmark fixture", () => {
    expect(existsSync(builtRunner), `missing ${builtRunner}; run the build first`).toBe(true);
    const root = materialize("invalid/clean-room-benchmark-file");
    const child = spawnSync(
      process.execPath,
      [builtRunner, "clean-room", "--json", "--fixture", root],
      {
        encoding: "utf8",
      },
    );
    expect(child.status).toBe(1);
    const result = JSON.parse(child.stdout) as CheckResult;
    expect(result.errors.map(({ rule }) => rule)).toEqual(["clean-room-benchmark-path"]);
    expect(child.stderr).toBe("");
  });

  it("prints a concise human summary without stack traces", () => {
    const child = spawnSync(
      process.execPath,
      [builtRunner, "clean-room", "--fixture", fixture("invalid/clean-room-foreign-prefix")],
      { encoding: "utf8" },
    );
    expect(child.status).toBe(1);
    expect(child.stdout).toContain("FAIL clean-room");
    expect(child.stdout).toContain("clean-room-foreign-prefix src/elements.ts:2:1");
    expect(child.stdout).not.toContain("    at ");
  });
});
