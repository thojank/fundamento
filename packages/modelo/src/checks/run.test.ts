import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  CHECK_NAMES,
  type CheckResult,
  EXIT_FAIL,
  EXIT_PASS,
  EXIT_USAGE,
  type RunCheckEnv,
  runCheck,
} from "./run.js";

const checksDir = new URL("./test-doubles/", import.meta.url);
const cwd = fileURLToPath(new URL("./", import.meta.url));
const repoRoot = "/repo";

interface Captured {
  code: number;
  stdout: string;
  stderr: string;
}

async function run(argv: readonly string[]): Promise<Captured> {
  let stdout = "";
  let stderr = "";
  const env: RunCheckEnv = {
    cwd,
    repoRoot,
    checksDir,
    stdout: (text) => {
      stdout += text;
    },
    stderr: (text) => {
      stderr += text;
    },
  };
  const code = await runCheck(argv, env);
  return { code, stdout, stderr };
}

describe("runCheck", () => {
  it("exits 0 and prints a human summary for a passing check", async () => {
    const out = await run(["parity"]);
    expect(out.code).toBe(EXIT_PASS);
    expect(out.stdout).toContain("PASS parity");
    expect(out.stderr).toBe("");
  });

  it("passes json, repoRoot and no fixture to the check", async () => {
    const out = await run(["parity", "--json"]);
    const result = JSON.parse(out.stdout) as CheckResult;
    expect(JSON.parse(result.summary)).toEqual({ json: true, repoRoot });
  });

  it("prints only the CheckResult JSON on stdout with --json", async () => {
    const out = await run(["regularo", "--json"]);
    expect(out.code).toBe(EXIT_FAIL);
    const result = JSON.parse(out.stdout) as CheckResult;
    expect(result.check).toBe("regularo");
    expect(result.ok).toBe(false);
    expect(result.errors[0]?.rule).toBe("regulo-kialo-missing");
    expect(out.stderr).toBe("");
  });

  it("exits 1 and lists rule, path and suggestion in the human summary of a failing check", async () => {
    const out = await run(["regularo"]);
    expect(out.code).toBe(EXIT_FAIL);
    expect(out.stdout).toContain("FAIL regularo");
    expect(out.stdout).toContain("regulo-kialo-missing");
    expect(out.stdout).toContain("data/reguloj.json#/reguloj/0/kialo");
    expect(out.stdout).toContain("Add a non-empty kialo.");
    expect(out.stdout).toContain("contrast-advisory");
  });

  it("resolves --fixture relative to cwd", async () => {
    const out = await run(["parity", "--json", "--fixture", "test-doubles/parity"]);
    expect(out.code).toBe(EXIT_PASS);
    const result = JSON.parse(out.stdout) as CheckResult;
    expect(JSON.parse(result.summary)).toEqual({
      json: true,
      repoRoot,
      fixture: fileURLToPath(new URL("./test-doubles/parity", import.meta.url)),
    });
  });

  it("accepts --fixture=<path>", async () => {
    const out = await run(["parity", "--fixture=test-doubles/parity"]);
    expect(out.code).toBe(EXIT_PASS);
  });

  it("exits 2 for an unreadable fixture without running the check", async () => {
    const out = await run(["parity", "--json", "--fixture", "does-not-exist"]);
    expect(out.code).toBe(EXIT_USAGE);
    expect(out.stdout).toBe("");
    expect(out.stderr).toContain("does-not-exist");
  });

  it("exits 2 for an unknown check and lists the available checks", async () => {
    const out = await run(["frobnicate"]);
    expect(out.code).toBe(EXIT_USAGE);
    expect(out.stdout).toBe("");
    expect(out.stderr).toContain("frobnicate");
    expect(out.stderr).toContain("vortaro-lint, parity, regularo, mankoj, alirebleco, clean-room");
  });

  it("exits 2 when no check is given", async () => {
    const out = await run([]);
    expect(out.code).toBe(EXIT_USAGE);
    expect(out.stderr).toContain("Usage:");
  });

  it("exits 2 for more than one check name", async () => {
    const out = await run(["parity", "regularo"]);
    expect(out.code).toBe(EXIT_USAGE);
  });

  it("exits 2 for an unknown flag", async () => {
    const out = await run(["parity", "--frobnicate"]);
    expect(out.code).toBe(EXIT_USAGE);
    expect(out.stderr).toContain("--frobnicate");
  });

  it("exits 2 when --fixture has no value", async () => {
    const out = await run(["parity", "--fixture"]);
    expect(out.code).toBe(EXIT_USAGE);
  });

  it("exits 2 when a known check has no implementation yet", async () => {
    const out = await run(["vortaro-lint"]);
    expect(out.code).toBe(EXIT_USAGE);
    expect(out.stderr).toContain("not implemented");
  });

  it("exits 2 when the check module does not export `check`", async () => {
    const out = await run(["clean-room"]);
    expect(out.code).toBe(EXIT_USAGE);
    expect(out.stderr).toContain("does not export");
  });

  it.each([[["--help"]], [["-h"]], [["regularo", "--help"]]])(
    "prints help listing every check and exits 0 for %j",
    async (argv) => {
      const out = await run(argv);
      expect(out.code).toBe(EXIT_PASS);
      expect(out.stderr).toBe("");
      for (const name of CHECK_NAMES) {
        expect(out.stdout).toContain(name);
      }
      expect(out.stdout).toContain("--fixture <path>");
      expect(out.stdout).toContain("INIT_CWD");
    },
  );

  it("exits 2 without a stack trace when the check throws", async () => {
    const out = await run(["alirebleco", "--json"]);
    expect(out.code).toBe(EXIT_USAGE);
    expect(out.stdout).toBe("");
    expect(out.stderr).toContain("boom");
    expect(out.stderr).not.toContain("    at ");
  });
});

describe("built runner entry point", () => {
  const built = fileURLToPath(new URL("../../dist/checks/run.js", import.meta.url));

  it("is wired as a CLI that exits 2 for an unknown check", () => {
    expect(existsSync(built), `missing ${built}; run the build first`).toBe(true);
    const child = spawnSync(process.execPath, [built, "frobnicate"], { encoding: "utf8" });
    expect(child.status).toBe(EXIT_USAGE);
    expect(child.stdout).toBe("");
    expect(child.stderr).toContain("Unknown check 'frobnicate'");
  });

  describe("resolves --fixture like fm: against INIT_CWD, else the cwd", () => {
    const repoDir = fileURLToPath(new URL("../../../../", import.meta.url));
    const packageDir = fileURLToPath(new URL("../../", import.meta.url));
    const fixture = "test/fixtures/invalid/regularo-without-kialo";

    function runRegularo(cwdDir: string, initCwd: string | undefined) {
      const env: NodeJS.ProcessEnv = { ...process.env };
      delete env.INIT_CWD;
      if (initCwd !== undefined) {
        env.INIT_CWD = initCwd;
      }
      return spawnSync(process.execPath, [built, "regularo", "--json", "--fixture", fixture], {
        encoding: "utf8",
        cwd: cwdDir,
        env,
      });
    }

    it("uses INIT_CWD when pnpm runs the script from the repo root", () => {
      // `pnpm -w check:regularo` from packages/modelo: cwd is the root, INIT_CWD the package.
      const child = runRegularo(repoDir, packageDir);
      expect(child.stderr).toBe("");
      expect(child.status).toBe(EXIT_FAIL);
      const result = JSON.parse(child.stdout) as CheckResult;
      expect(result.errors.map((issue) => issue.rule)).toContain("regulo-kialo-missing");
    });

    it("falls back to the cwd without INIT_CWD", () => {
      const child = runRegularo(packageDir, undefined);
      expect(child.status).toBe(EXIT_FAIL);
      expect(JSON.parse(child.stdout)).toMatchObject({ check: "regularo", ok: false });
    });

    it("does not resolve against the repo root when INIT_CWD points elsewhere", () => {
      const child = runRegularo(packageDir, repoDir);
      expect(child.status).toBe(EXIT_USAGE);
      expect(child.stderr).toContain("Cannot read fixture");
    });
  });
});
