// FUND-6.1 end-to-end: the `fm` command surface (FR-02) and the CLI half of the cross-command
// exit-code contract (0 pass, 1 fail, 2 usage).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { fm, parseJsonStdout, REPO_ROOT } from "./test-doubles/harness.js";

const T = 30_000;

describe("FR-02: fm --version and help", () => {
  it(
    "FR-02: fm --version prints the cli package version and exits 0",
    async () => {
      const pkg = JSON.parse(
        readFileSync(join(REPO_ROOT, "packages", "cli", "package.json"), "utf8"),
      ) as { version: string };
      const run = await fm(["--version"]);
      expect(run.code).toBe(0);
      expect(run.stdout).toBe(`${pkg.version}\n`);
    },
    T,
  );

  it.each([[["--help"]], [["modelo", "--help"]], [["modelo", "validate", "--help"]]])(
    "FR-02: fm %j prints help on stdout and exits 0",
    async (args) => {
      const run = await fm(args);
      expect(run.code).toBe(0);
      expect(run.stdout).toMatch(/Usage: fm/);
      expect(run.stdout).toContain("validate");
    },
    T,
  );

  it(
    "FR-02: bare fm is a usage error (exit 2) with help on stderr",
    async () => {
      const run = await fm([]);
      expect(run.code).toBe(2);
      expect(run.stdout).toBe("");
      expect(run.stderr).toMatch(/Usage: fm/);
    },
    T,
  );
});

describe("FR-02: unknown commands and flags exit 2 with a suggestion", () => {
  it.each([
    [["modlo"], "fm modelo"],
    [["modelo", "valdate"], "fm modelo validate"],
    [["modelo", "validate", "--jsn"], "--json"],
  ])(
    "FR-02: fm %j exits 2 and suggests %s",
    async (args, suggestion) => {
      const run = await fm(args);
      expect(run.code).toBe(2);
      expect(run.stdout).toBe("");
      expect(run.stderr).toContain("Did you mean");
      expect(run.stderr).toContain(suggestion);
      expect(run.stderr).not.toMatch(/\n\s+at /);
    },
    T,
  );
});

describe("consistency: fm exit codes and output", () => {
  it(
    "consistency: 0 on a valid Modelo, 1 on an invalid one, 2 on usage",
    async () => {
      const [pass, fail, usage] = await Promise.all([
        fm(["modelo", "validate", "packages/modelo/test/fixtures/valid/minimal", "--json"]),
        fm(["modelo", "validate", "packages/modelo/test/fixtures/invalid/ids-duplicate", "--json"]),
        fm(["modelo", "validate", "--frobnicate"]),
      ]);
      expect([pass.code, fail.code, usage.code]).toEqual([0, 1, 2]);
      expect(parseJsonStdout(pass)).toMatchObject({ valid: true });
      expect(parseJsonStdout(fail)).toMatchObject({ valid: false });
      expect(usage.stdout).toBe("");
    },
    T,
  );

  it(
    "consistency: a path that is not a Modelo root fails (exit 1) with a structured file-missing error",
    async () => {
      const run = await fm(["modelo", "validate", "packages/modelo/test/fixtures", "--json"]);
      expect(run.code).toBe(1);
      const report = parseJsonStdout(run) as { errors: { rule: string }[] };
      expect(report.errors.map((issue) => issue.rule)).toContain("file-missing");
    },
    T,
  );

  it(
    "consistency: without --json, fm modelo validate prints a human summary, not JSON",
    async () => {
      const run = await fm(["modelo", "validate"]);
      expect(run.code).toBe(0);
      expect(run.stdout).toMatch(/VALID/);
      expect(() => JSON.parse(run.stdout)).toThrow();
    },
    T,
  );
});
