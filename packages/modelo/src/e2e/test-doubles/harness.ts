// Test support for the end-to-end acceptance suite (FUND-6.1), not a double: it spawns the
// *built* binaries exactly as the root scripts do (`fm`, the check runner, the export build) and
// reads the committed fixtures. Turbo builds before testing, so `dist/` is current. Nothing here
// writes into the repo; temporary directories live under `os.tmpdir()`.

import { execFile } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect } from "vitest";
import type { CheckName, CheckResult } from "../../contracts/checks.js";
import { isRuleId, type ValidationIssue } from "../../contracts/issues.js";
import type { ValidationReport } from "../../contracts/modelo.js";

export const REPO_ROOT = fileURLToPath(new URL("../../../../../", import.meta.url));
export const MODELO_DIR = join(REPO_ROOT, "packages", "modelo");
export const MODELO_DIST = join(MODELO_DIR, "dist");
export const FIXTURES_DIR = join(MODELO_DIR, "test", "fixtures");

const FM_BIN = join(REPO_ROOT, "packages", "cli", "dist", "index.js");
const CHECK_RUNNER = join(MODELO_DIST, "checks", "run.js");
const EXPORT_BUILD = join(MODELO_DIST, "export", "build.js");

export interface Run {
  code: number;
  stdout: string;
  stderr: string;
}

/**
 * Environment for a spawned command: the caller's, minus Vitest's worker variables, with
 * `INIT_CWD` pinned to the repo root (pnpm would otherwise leak its own into child processes,
 * and the CLI resolves relative paths against it).
 */
export function childEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith("VITEST") && key !== "TEST" && key !== "NODE_ENV") env[key] = value;
  }
  env.INIT_CWD = REPO_ROOT;
  env.NO_COLOR = "1";
  return env;
}

/** Runs `node <script> …args` asynchronously (so callers can spawn in parallel). */
export function runNode(script: string, args: readonly string[], cwd = REPO_ROOT): Promise<Run> {
  return new Promise((resolvePromise) => {
    execFile(
      process.execPath,
      [script, ...args],
      { cwd, env: childEnv(), encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
      (error, stdout, stderr) => {
        const code = error === null ? 0 : typeof error.code === "number" ? error.code : Number.NaN;
        resolvePromise({ code, stdout, stderr });
      },
    );
  });
}

/** `fm …args` (the root `pnpm fm` script without pnpm's exit-code masking). */
export const fm = (args: readonly string[]): Promise<Run> => runNode(FM_BIN, args);

/** `pnpm check:<name> …args` without pnpm: `node packages/modelo/dist/checks/run.js <name> …`. */
export const runCheck = (args: readonly string[]): Promise<Run> => runNode(CHECK_RUNNER, args);

/** The export build step (`node packages/modelo/dist/export/build.js …args`). */
export const runExportBuild = (args: readonly string[]): Promise<Run> =>
  runNode(EXPORT_BUILD, args);

/** Parses stdout as exactly one JSON document (JSON-only stdout under `--json`). */
export function parseJsonStdout(run: Run): unknown {
  const text = run.stdout.trim();
  expect(
    text.startsWith("{"),
    `stdout does not start with a JSON object: ${text.slice(0, 80)}`,
  ).toBe(true);
  return JSON.parse(text);
}

// ---------------------------------------------------------------------------------------------
// Fixtures

export interface ExpectedIssue {
  rule: string;
  path: string;
}

export interface ExpectedIssues {
  description: string;
  check?: CheckName;
  materialize?: Record<string, string>;
  issues: ExpectedIssue[];
  warnings?: ExpectedIssue[];
}

export interface Fixture {
  kind: "valid" | "invalid";
  name: string;
  root: string;
  expected: ExpectedIssues | undefined;
}

function readExpected(root: string): ExpectedIssues | undefined {
  const file = join(root, "expected-issues.json");
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as ExpectedIssues) : undefined;
}

export function fixtures(kind: "valid" | "invalid"): Fixture[] {
  const dir = join(FIXTURES_DIR, kind);
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .map((name) => {
      const root = join(dir, name);
      return { kind, name, root, expected: readExpected(root) };
    });
}

const isModeloRoot = (root: string): boolean =>
  existsSync(join(root, "vortaro")) && existsSync(join(root, "data"));

/** Negative fixtures of `fm modelo validate`: Modelo roots whose expectation has no `check`. */
export function validateNegativeFixtures(): (Fixture & { expected: ExpectedIssues })[] {
  return fixtures("invalid").flatMap((fixture) =>
    fixture.expected !== undefined &&
    fixture.expected.check === undefined &&
    isModeloRoot(fixture.root)
      ? [{ ...fixture, expected: fixture.expected }]
      : [],
  );
}

/** Positive Modelo fixtures (every valid fixture that is a Modelo root). */
export function validatePositiveFixtures(): Fixture[] {
  return fixtures("valid").filter((fixture) => isModeloRoot(fixture.root));
}

/** Failing fixtures of the conformance checks: invalid fixtures whose expectation names a check. */
export function checkFailingFixtures(): (Fixture & {
  expected: ExpectedIssues & { check: CheckName };
})[] {
  return fixtures("invalid").flatMap((fixture) => {
    const expected = fixture.expected;
    if (expected === undefined) return [];
    const check = expected.check;
    return check === undefined ? [] : [{ ...fixture, expected: { ...expected, check } }];
  });
}

const tempDirs: string[] = [];

export function tempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), `fm-e2e-${prefix}-`));
  tempDirs.push(dir);
  return dir;
}

export function removeTempDirs(): void {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
}

/**
 * Returns the directory a check should scan for the fixture. A fixture with a `materialize` map
 * (git-ignored files that cannot be committed) is copied to a temp dir and completed there.
 */
export function checkFixtureRoot(fixture: Fixture): string {
  const materialize = fixture.expected?.materialize;
  if (materialize === undefined) return fixture.root;
  const root = tempDir(fixture.name);
  cpSync(fixture.root, root, { recursive: true });
  for (const [path, text] of Object.entries(materialize)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

// ---------------------------------------------------------------------------------------------
// Shape assertions shared by every command (cross-command consistency)

const ISSUE_KEYS = new Set([
  "rule",
  "severity",
  "path",
  "message",
  "suggestion",
  "combination",
  "regulo",
]);

const nonEmpty = (value: unknown): boolean => typeof value === "string" && value.trim() !== "";

/** The one `ValidationIssue` shape: path, rule, message, suggestion, severity all filled. */
export function expectIssueShape(issue: unknown, severity: "error" | "warning"): void {
  expect(typeof issue === "object" && issue !== null && !Array.isArray(issue)).toBe(true);
  const record = issue as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    expect(ISSUE_KEYS.has(key), `unexpected issue key ${key}`).toBe(true);
  }
  for (const key of ["rule", "path", "message", "suggestion"] as const) {
    expect(nonEmpty(record[key]), `issue.${key} must be a non-empty string`).toBe(true);
  }
  expect(record.severity).toBe(severity);
  expect(isRuleId(String(record.rule)), `rule ${String(record.rule)} is not in RULE_IDS`).toBe(
    true,
  );
  if (record.combination !== undefined) {
    expect(typeof record.combination).toBe("object");
  }
  if (record.regulo !== undefined) {
    // Spec 002 FR-08: a cited Regulo is complete, so an agent can quote it as is.
    const regulo = record.regulo as Record<string, unknown>;
    for (const key of ["id", "name", "kialo"] as const) {
      expect(nonEmpty(regulo[key]), `issue.regulo.${key} must be a non-empty string`).toBe(true);
    }
  }
}

/** A `CheckResult` as printed by the runner under `--json`. */
export function expectCheckResult(value: unknown, check: CheckName): CheckResult {
  expect(typeof value === "object" && value !== null).toBe(true);
  const result = value as CheckResult;
  expect(Object.keys(result).sort()).toEqual(
    ["check", "errors", "ok", "stats", "summary", "warnings"].sort(),
  );
  expect(result.check).toBe(check);
  expect(typeof result.ok).toBe("boolean");
  expect(nonEmpty(result.summary)).toBe(true);
  expect(Array.isArray(result.errors)).toBe(true);
  expect(Array.isArray(result.warnings)).toBe(true);
  expect(result.ok).toBe(result.errors.length === 0);
  for (const issue of result.errors) expectIssueShape(issue, "error");
  for (const issue of result.warnings) expectIssueShape(issue, "warning");
  expect(typeof result.stats === "object" && result.stats !== null).toBe(true);
  for (const [key, stat] of Object.entries(result.stats)) {
    expect(typeof stat, `stats.${key}`).toBe("number");
  }
  return result;
}

/** A `ValidationReport` as printed by `fm modelo validate --json`. */
export function expectValidationReport(value: unknown): ValidationReport {
  expect(typeof value === "object" && value !== null).toBe(true);
  const report = value as ValidationReport;
  expect(Object.keys(report).sort()).toEqual(["errors", "summary", "valid", "warnings"]);
  expect(report.valid).toBe(report.errors.length === 0);
  for (const issue of report.errors) expectIssueShape(issue, "error");
  for (const issue of report.warnings) expectIssueShape(issue, "warning");
  return report;
}

export const rulesAndPaths = (issues: readonly ValidationIssue[]): ExpectedIssue[] =>
  issues.map(({ rule, path }) => ({ rule, path }));
