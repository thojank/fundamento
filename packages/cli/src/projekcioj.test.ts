// `fm projekcioj build` (Spec 003 T008, plan D-01): generates every projection of the Modelo.

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const built = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const repoRoot = dirname(dirname(fileURLToPath(new URL("..", import.meta.url))));

describe("fm projekcioj build (T008)", () => {
  it("writes the projections to --out and lists the Celoj", () => {
    const out = mkdtempSync(join(tmpdir(), "fm-cli-projekcioj-"));
    const env: NodeJS.ProcessEnv = { ...process.env, INIT_CWD: repoRoot };
    const run = spawnSync(process.execPath, [built, "projekcioj", "build", "--out", out], {
      cwd: repoRoot,
      env,
      encoding: "utf8",
    });
    expect(run.stderr).toBe("");
    expect(run.status).toBe(0);
    expect(run.stdout).toMatch(/^fm projekcioj build: wrote \d+ files for the Celoj .+ to /);
    expect(existsSync(join(out, "projekcioj.json"))).toBe(true);
  });

  it("bundles every Make kit, so the output can be packed and published (T020)", () => {
    const out = mkdtempSync(join(tmpdir(), "fm-cli-kits-"));
    const env: NodeJS.ProcessEnv = { ...process.env, INIT_CWD: repoRoot };
    const run = spawnSync(process.execPath, [built, "projekcioj", "build", "--out", out], {
      cwd: repoRoot,
      env,
      encoding: "utf8",
    });
    expect(run.status).toBe(0);
    for (const file of ["dist/index.js", "dist/index.cjs", "dist/index.d.ts", "package.json"]) {
      expect(existsSync(join(out, "make-kit/komuna", file)), file).toBe(true);
    }
    expect(run.stdout).toContain("make-kit");
  }, 300_000);
});
