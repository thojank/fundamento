// `fm agordilo derive` and `fm agordilo check` (Spec 016 G8), driven through the built binary
// exactly as `pnpm fm` runs it (vitest.global-setup.ts builds it).

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

const built = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const cliDir = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = dirname(dirname(cliDir));
const PROVO = join(
  repoRoot,
  "packages",
  "modelo",
  "test",
  "fixtures",
  "valid",
  "aspekto-provo",
  "agordo.json",
);

interface Run {
  code: number | null;
  stdout: string;
  stderr: string;
}

function fm(args: readonly string[]): Run {
  const env: NodeJS.ProcessEnv = { ...process.env };
  env.INIT_CWD = repoRoot;
  const child = spawnSync(process.execPath, [built, ...args], {
    cwd: repoRoot,
    env,
    encoding: "utf8",
  });
  return { code: child.status, stdout: child.stdout, stderr: child.stderr };
}

const scratch = mkdtempSync(join(tmpdir(), "fm-agordilo-"));

// One derivation composes and checks the whole Modelo with the derived Aspekto (2–4 s on a quiet
// machine, measured 45 s for four spawns inside the parallel run): the tests that derive carry a
// budget sized for that work, not the 30 s of a single spawn.
const DERIVE_BUDGET = 120_000;
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

function filesOf(dir: string): Record<string, string> {
  const files: Record<string, string> = {};
  for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath, entry.name);
    files[relative(dir, path).split(sep).join("/")] = readFileSync(path, "utf8");
  }
  return files;
}

describe("fm agordilo", () => {
  it("lists derive and check in its help", () => {
    const run = fm(["agordilo", "--help"]);
    expect(run.code).toBe(0);
    expect(run.stdout).toContain("derive");
    expect(run.stdout).toContain("check");
    for (const command of ["derive", "check"]) {
      const help = fm(["agordilo", command, "--help"]);
      expect(help.code, command).toBe(0);
      expect(help.stdout, command).toContain("Exit codes");
      expect(help.stdout, command).toContain("--json");
    }
  });

  it(
    "derives provo twice into the same bytes and checks it",
    () => {
      const first = join(scratch, "first");
      const second = join(scratch, "second");
      expect(fm(["agordilo", "derive", PROVO, "--out", first]).code).toBe(0);
      expect(fm(["agordilo", "derive", PROVO, "--out", second]).code).toBe(0);
      for (const file of ["aspekto.json", "ids.lock.json", "raporto.json", "raporto.md"]) {
        expect(existsSync(join(first, file)), file).toBe(true);
      }
      expect(filesOf(second)).toEqual(filesOf(first));

      const check = fm(["agordilo", "check", first, "--json"]);
      expect(check.code, check.stderr).toBe(0);
      expect(JSON.parse(check.stdout)).toMatchObject({ ok: true, issues: [] });

      // G8: the derived package validates with the core, as an external Aspekto.
      const validate = fm(["modelo", "validate", "--aspekto", first]);
      expect(validate.code, validate.stdout).toBe(0);
    },
    DERIVE_BUDGET,
  );

  it(
    "finds a shipped report that no longer matches the checks",
    () => {
      const dir = join(scratch, "stale");
      expect(fm(["agordilo", "derive", PROVO, "--out", dir]).code).toBe(0);
      const raporto = JSON.parse(readFileSync(join(dir, "raporto.json"), "utf8"));
      raporto.summary.pairs.passed += 1;
      writeFileSync(join(dir, "raporto.json"), `${JSON.stringify(raporto, null, 2)}\n`);
      const check = fm(["agordilo", "check", dir, "--json"]);
      expect(check.code).toBe(1);
      const result = JSON.parse(check.stdout) as { issues: { rule: string; path: string }[] };
      expect(result.issues.map((issue) => issue.rule)).toContain("raporto-out-of-sync");
    },
    DERIVE_BUDGET,
  );

  it("refuses an Agordo without leitfarbe with a structured issue and exit 1", () => {
    const file = join(scratch, "sen-leitfarbe.json");
    writeFileSync(file, JSON.stringify({ name: "provo" }));
    const run = fm(["agordilo", "derive", file, "--out", join(scratch, "never"), "--json"]);
    expect(run.code).toBe(1);
    const result = JSON.parse(run.stdout) as {
      written: boolean;
      issues: { rule: string; path: string; suggestion: string }[];
    };
    expect(result.written).toBe(false);
    expect(result.issues[0]).toMatchObject({ rule: "schema-violation" });
    expect(result.issues[0]?.path).toMatch(/#\/leitfarbe$/);
    expect(result.issues[0]?.suggestion.length).toBeGreaterThan(0);
    expect(existsSync(join(scratch, "never"))).toBe(false);
  });

  it(
    "refuses to export a light yellow without a Jugxo and writes nothing (G6)",
    () => {
      const file = join(scratch, "flava.json");
      writeFileSync(file, JSON.stringify({ name: "flava", leitfarbe: "#F5C400" }));
      const out = join(scratch, "flava");
      const run = fm(["agordilo", "derive", file, "--out", out]);
      expect(run.code).toBe(1);
      expect(run.stdout).toMatch(/cause/i);
      expect(run.stdout).toMatch(/suggestion/i);
      expect(existsSync(out)).toBe(false);
    },
    DERIVE_BUDGET,
  );

  it("answers a usage error with exit 2", () => {
    expect(fm(["agordilo", "derive"]).code).toBe(2);
    expect(fm(["agordilo", "derive", PROVO, "--bogus"]).code).toBe(2);
    expect(fm(["agordilo", "check"]).code).toBe(2);
  });
});
