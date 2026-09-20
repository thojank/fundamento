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

/** A throwaway directory, removed after the test. */
function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "fm-clean-room-"));
  tempDirs.push(dir);
  return dir;
}

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

// Fingerprint sources with provenance (Spec 004 T013, FR-15 preparatory, contracts/checks §1): a
// benchmark Aspekto brings its own list, the finding says which list knew the value, and a named
// list that does not exist is an error of its own — Etappe B then only has to hand over its file.
describe("fingerprint sources with provenance (T013)", () => {
  const root = fixture("invalid/clean-room-fremda-spuro");
  const spuroj = join(root, "spuroj/testmarko.json");

  it("finds the values of a named list and says where they come from", async () => {
    const result = await check({ json: true, repoRoot, fixture: root, spuroj: [spuroj] });
    const found = result.errors.filter((issue) => issue.rule === "clean-room-marko-spuro");
    expect(found.map((issue) => issue.path)).toEqual(["src/theme.css:3:22", "src/theme.css:4:20"]);
    for (const issue of found) {
      expect(issue.message).toContain("testmarko");
    }
    expect(result.stats.fingerprintSources).toBe(1);
    expect(result.stats.fingerprints).toBe(2);
    expect(result.ok).toBe(false);
  });

  it("says nothing about the same file without the list", async () => {
    const result = await check({ json: true, repoRoot, fixture: root });
    expect(result.errors.filter((issue) => issue.rule === "clean-room-marko-spuro")).toEqual([]);
    expect(result.stats.fingerprints).toBe(0);
    expect(result.ok).toBe(true);
  });

  it("reports a named list that does not exist, with its path", async () => {
    const missing = join(root, "spuroj/mankanta.json");
    const result = await check({ json: true, repoRoot, fixture: root, spuroj: [missing] });
    const issue = result.errors.find((entry) => entry.rule === "clean-room-spuro-file-missing");
    expect(issue?.path).toContain("mankanta.json");
    expect(result.ok).toBe(false);
  });

  it("keeps the built-in list of the repository working", async () => {
    const result = await check({ json: true, repoRoot });
    expect(result.stats.fingerprintSources).toBe(1);
    expect(result.stats.fingerprints).toBeGreaterThan(3);
    expect(result.ok).toBe(true);
  });
});

// The lists reach the check through the runner and through the project config (T013,
// contracts/checks §1): `--spuroj` may be given more than once, `markoSpuroj` names them once.
describe("fingerprint lists through the runner and the config (T013)", () => {
  const root = fixture("invalid/clean-room-fremda-spuro");
  const spuroj = join(root, "spuroj/testmarko.json");

  it("takes --spuroj more than once and keeps the first source of a shared fingerprint", () => {
    const second = join(tempDir(), "dua.json");
    writeFileSync(
      second,
      `${JSON.stringify({
        source: "dua",
        fingerprints: ["23a7ce586cde4da461ecdb47ccfdf5c4860a51640004e5ca1b7559b6b044e806"],
      })}\n`,
    );
    const run = spawnSync(
      process.execPath,
      [
        builtRunner,
        "clean-room",
        "--json",
        "--fixture",
        root,
        "--spuroj",
        spuroj,
        "--spuroj",
        second,
      ],
      { encoding: "utf8" },
    );
    const result = JSON.parse(run.stdout) as CheckResult;
    expect(result.stats.fingerprintSources).toBe(2);
    expect(result.errors[0]?.message).toContain("testmarko");
    expect(run.status).toBe(1);
  });

  it("reads the lists a project config names in markoSpuroj", async () => {
    const dir = tempDir();
    cpSync(root, dir, { recursive: true });
    writeFileSync(
      join(dir, "fundamento.config.json"),
      `${JSON.stringify({ aspektoj: [], markoSpuroj: ["spuroj/testmarko.json"] }, null, 2)}\n`,
    );
    const result = await check({
      json: true,
      repoRoot,
      fixture: dir,
      config: join(dir, "fundamento.config.json"),
    });
    // The fixture brings no list of its own, so the config's list is the only source.
    expect(result.stats.fingerprintSources).toBe(1);
    expect(result.errors.some((issue) => issue.message.includes("testmarko"))).toBe(true);
  });
});
