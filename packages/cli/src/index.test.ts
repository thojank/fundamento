import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// These tests drive the built binary, exactly as `pnpm fm` does (vitest.global-setup.ts builds it).
const built = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const cliDir = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = dirname(dirname(cliDir));
const invalidFixtures = join(repoRoot, "packages", "modelo", "test", "fixtures", "invalid");
const validFixtures = join(repoRoot, "packages", "modelo", "test", "fixtures", "valid");

interface Run {
  code: number | null;
  stdout: string;
  stderr: string;
}

/** Runs `fm` with `INIT_CWD` set explicitly (pnpm would leak its own into child processes). */
function fm(args: readonly string[], initCwd: string | undefined = repoRoot): Run {
  const env: NodeJS.ProcessEnv = { ...process.env };
  delete env.INIT_CWD;
  if (initCwd !== undefined) env.INIT_CWD = initCwd;
  const child = spawnSync(process.execPath, [built, ...args], {
    cwd: repoRoot,
    env,
    encoding: "utf8",
  });
  return { code: child.status, stdout: child.stdout, stderr: child.stderr };
}

function expectNoStackTrace(run: Run): void {
  expect(run.stdout).not.toMatch(/\n\s+at /);
  expect(run.stderr).not.toMatch(/\n\s+at /);
}

/** Invalid fixtures that belong to `modelo validate` (fixtures with a `check` field are for checks). */
function validateFixtures(): string[] {
  const cases = [
    "modelo-name-grammar",
    "modelo-type-unknown",
    "modelo-alias-target-missing",
    "modelo-regulo-kialo-missing",
    "ids-duplicate",
  ];
  return cases.filter((name) => {
    const expected: unknown = JSON.parse(
      readFileSync(join(invalidFixtures, name, "expected-issues.json"), "utf8"),
    );
    return typeof expected === "object" && expected !== null && !("check" in expected);
  });
}

describe("test budget", () => {
  // A cold CI runner took 5.3 s for one spawn; Vitest's 5 s default made the gate flaky.
  it("gives process-spawning tests a timeout sized for a cold CI runner", ({ task }) => {
    expect(task.timeout).toBeGreaterThanOrEqual(30_000);
  });
});

describe("fm binary", () => {
  it("is built with a node shebang", () => {
    expect(existsSync(built), `missing ${built}; run the build first`).toBe(true);
    expect(readFileSync(built, "utf8").startsWith("#!/usr/bin/env node\n")).toBe(true);
  });

  it("is declared as the `fm` bin", () => {
    const pkg: unknown = JSON.parse(readFileSync(join(cliDir, "package.json"), "utf8"));
    expect(pkg).toMatchObject({ bin: { fm: "dist/index.js" } });
  });
});

describe("fm --version", () => {
  it("prints the cli package version and exits 0", () => {
    const pkg = JSON.parse(readFileSync(join(cliDir, "package.json"), "utf8")) as {
      version: string;
    };
    const run = fm(["--version"]);
    expect(run.code).toBe(0);
    expect(run.stdout.trim()).toBe(pkg.version);
    expect(run.stdout.trim()).toBe("0.1.0");
  });
});

describe("fm --help", () => {
  it("lists the commands with one-line descriptions", () => {
    const run = fm(["--help"]);
    expect(run.code).toBe(0);
    expect(run.stdout).toContain("Usage: fm");
    expect(run.stdout).toMatch(/modelo\s+\S.*/);
    expect(run.stdout).toContain("--version");
  });

  it("lists the modelo subcommands", () => {
    const run = fm(["modelo", "--help"]);
    expect(run.code).toBe(0);
    expect(run.stdout).toMatch(/validate\s+\S.*/);
  });

  it("explains `modelo validate`", () => {
    const run = fm(["modelo", "validate", "--help"]);
    expect(run.code).toBe(0);
    expect(run.stdout).toContain("fm modelo validate [path]");
    expect(run.stdout).toContain("--path");
    expect(run.stdout).toContain("--json");
  });

  it("prints help to stderr and exits 2 when no command is given", () => {
    const run = fm([]);
    expect(run.code).toBe(2);
    expect(run.stdout).toBe("");
    expect(run.stderr).toContain("Usage: fm");
  });

  it("prints the modelo help to stderr and exits 2 when no subcommand is given", () => {
    const run = fm(["modelo"]);
    expect(run.code).toBe(2);
    expect(run.stderr).toContain("validate");
  });
});

describe("fm modelo validate (repo Modelo)", () => {
  it("prints a human summary and exits 0", () => {
    const run = fm(["modelo", "validate"]);
    expect(run.stderr).toBe("");
    expect(run.code).toBe(0);
    expect(run.stdout).toContain("VALID");
    expect(run.stdout).not.toContain("INVALID");
    for (const count of [
      "tokens",
      "types",
      "setoj",
      "dimensioj",
      "combinations",
      "reguloj",
      "jugxoj",
      "kontrastParoj",
    ]) {
      expect(run.stdout).toMatch(new RegExp(`${count}\\s+\\d+`));
    }
  });

  it("prints only the ValidationReport JSON with --json", () => {
    const run = fm(["modelo", "validate", "--json"]);
    expect(run.code).toBe(0);
    const report = JSON.parse(run.stdout) as { valid: boolean; summary: Record<string, number> };
    expect(report.valid).toBe(true);
    expect(report.summary.tokens).toBeGreaterThan(0);
  });

  it("does not depend on the working directory", () => {
    const run = fm(["modelo", "validate", "--json"], tmpdir());
    expect(run.code).toBe(0);
  });
});

describe("fm modelo validate <path>", () => {
  it("validates a valid Modelo root and exits 0", () => {
    const run = fm(["modelo", "validate", join(validFixtures, "minimal"), "--json"]);
    expect(run.code).toBe(0);
    expect((JSON.parse(run.stdout) as { valid: boolean }).valid).toBe(true);
  });

  it.each(validateFixtures())("reports %s with path, rule and suggestion and exits 1", (name) => {
    const run = fm(["modelo", "validate", "--path", join(invalidFixtures, name), "--json"]);
    expect(run.code).toBe(1);
    const report = JSON.parse(run.stdout) as {
      valid: boolean;
      errors: { path: string; rule: string; suggestion: string }[];
    };
    expect(report.valid).toBe(false);
    const first = report.errors[0];
    expect(first?.path).toBeTruthy();
    expect(first?.rule).toBeTruthy();
    expect(first?.suggestion).toBeTruthy();
  });

  it("reports the expected rule and path for an invalid fixture", () => {
    const run = fm(["modelo", "validate", join(invalidFixtures, "modelo-name-grammar"), "--json"]);
    const report = JSON.parse(run.stdout) as { errors: { path: string; rule: string }[] };
    expect(report.errors).toContainEqual(
      expect.objectContaining({
        rule: "token-name-grammar",
        path: "vortaro/sets/core.json#/spacing/Medium",
      }),
    );
  });

  it("resolves relative paths against INIT_CWD", () => {
    const run = fm(
      ["modelo", "validate", "--path", "packages/modelo/test/fixtures/invalid/modelo-type-unknown"],
      repoRoot,
    );
    expect(run.code).toBe(1);
    expect(run.stdout).toContain("INVALID");
    expect(run.stdout).toContain("token-type-unknown");
  });

  it("resolves relative paths against the working directory without INIT_CWD", () => {
    const run = fm(
      ["modelo", "validate", "packages/modelo/test/fixtures/valid/minimal", "--json"],
      undefined,
    );
    expect(run.code).toBe(0);
  });

  it("prints each error with rule, path, message and suggestion in human mode", () => {
    const run = fm(["modelo", "validate", join(invalidFixtures, "modelo-name-grammar")]);
    expect(run.code).toBe(1);
    expect(run.stdout).toContain("INVALID");
    expect(run.stdout).toContain("token-name-grammar");
    expect(run.stdout).toContain("vortaro/sets/core.json#/spacing/Medium");
    expect(run.stdout).toContain("suggestion:");
    expect(run.stdout).toContain("message:");
    expectNoStackTrace(run);
  });

  it("gives a structured error for a path that does not exist", () => {
    const run = fm(["modelo", "validate", "no/such/modelo", "--json"]);
    expect(run.code).toBe(1);
    const report = JSON.parse(run.stdout) as {
      valid: boolean;
      errors: { path: string; rule: string; suggestion: string }[];
    };
    expect(report.valid).toBe(false);
    expect(report.errors[0]).toMatchObject({ rule: "file-missing", path: "no/such/modelo" });
    expect(report.errors[0]?.suggestion).toContain("vortaro/");
    expectNoStackTrace(run);
  });

  it("gives a structured error for a directory that is not a Modelo root", () => {
    const run = fm(["modelo", "validate", join(repoRoot, "packages", "cli")]);
    expect(run.code).toBe(1);
    expect(run.stdout).toContain("INVALID");
    expect(run.stdout).toContain("file-missing");
    expectNoStackTrace(run);
  });

  it("rejects two different paths", () => {
    const run = fm(["modelo", "validate", "a", "--path", "b"]);
    expect(run.code).toBe(2);
    expect(run.stderr).toContain("path");
  });
});

describe("usage errors", () => {
  it("suggests the closest command for a typo", () => {
    const run = fm(["modelo", "valdate"]);
    expect(run.code).toBe(2);
    expect(run.stdout).toBe("");
    expect(run.stderr).toContain("Did you mean `fm modelo validate`?");
  });

  it("suggests the closest command for an unknown top-level command", () => {
    const run = fm(["frobnicate"]);
    expect(run.code).toBe(2);
    expect(run.stderr).toContain("Unknown command 'frobnicate'");
    expect(run.stderr).toMatch(/Did you mean `fm modelo( validate)?`\?/);
  });

  it("finds a subcommand typed without its group", () => {
    const run = fm(["validate"]);
    expect(run.code).toBe(2);
    expect(run.stderr).toContain("Did you mean `fm modelo validate`?");
  });

  it("suggests the closest flag for an unknown flag", () => {
    const run = fm(["modelo", "validate", "--jsn"]);
    expect(run.code).toBe(2);
    expect(run.stdout).toBe("");
    expect(run.stderr).toContain("Did you mean `--json`?");
    expectNoStackTrace(run);
  });

  it("rejects an unknown top-level flag", () => {
    const run = fm(["--verison"]);
    expect(run.code).toBe(2);
    expect(run.stderr).toContain("Did you mean `--version`?");
  });

  it("rejects --path without a value", () => {
    const run = fm(["modelo", "validate", "--path"]);
    expect(run.code).toBe(2);
    expect(run.stderr).toContain("--path");
    expectNoStackTrace(run);
  });
});

describe("fm modelo export (Spec 001 T019, D-09)", () => {
  const ekzempla = join(validFixtures, "aspekto-ekzemplo", "fundamento.config.json");

  function sha(dir: string): Record<string, string> {
    const out: Record<string, string> = {};
    const walk = (path: string, rel: string): void => {
      for (const entry of readdirSync(path, { withFileTypes: true })) {
        const child = join(path, entry.name);
        if (entry.isDirectory()) walk(child, `${rel}${entry.name}/`);
        else
          out[`${rel}${entry.name}`] = createHash("sha256")
            .update(readFileSync(child))
            .digest("hex");
      }
    };
    walk(dir, "");
    return out;
  }

  it("writes the export and one Tokens-Studio folder per Aspekto for a project config", () => {
    const out = mkdtempSync(join(tmpdir(), "fm-export-"));
    const run = fm(["modelo", "export", "--config", ekzempla, "--out", out]);
    expect(run.code, run.stderr).toBe(0);
    const files = Object.keys(sha(out));
    for (const file of ["modelo.json", "modelo.schema.json", "rezolvoj.json"]) {
      expect(files).toContain(file);
    }
    expect(files).toContain("vortaro/ekzemplo/$themes.json");
    expect(files).toContain("vortaro/komuna/sets/core.json");
    rmSync(out, { recursive: true, force: true });
  });

  // Two exports of the whole Modelo, each a spawn of the built binary: on a loaded CI runner this
  // measures the machine as much as the export, so it gets the recorded factor 3
  // (Jugxo jug_01M2W3K1YPP05F4XF86J71RGTK, as in modelo's export build test). No threshold of the
  // check itself moves.
  it(
    "is byte-identical over two runs (AK-10)",
    () => {
      const first = mkdtempSync(join(tmpdir(), "fm-export-"));
      const second = mkdtempSync(join(tmpdir(), "fm-export-"));
      expect(fm(["modelo", "export", "--config", ekzempla, "--out", first]).code).toBe(0);
      expect(fm(["modelo", "export", "--config", ekzempla, "--out", second]).code).toBe(0);
      expect(sha(first)).toEqual(sha(second));
      rmSync(first, { recursive: true, force: true });
      rmSync(second, { recursive: true, force: true });
    },
    30_000 * (process.env.CI === "true" ? 3 : 1),
  );

  it("writes nothing and exits 1 for an invalid project Modelo", () => {
    const out = join(mkdtempSync(join(tmpdir(), "fm-export-")), "export");
    const config = join(invalidFixtures, "aspekto-incomplete", "fundamento.config.json");
    const run = fm(["modelo", "export", "--config", config, "--out", out]);
    expect(run.code).toBe(1);
    expect(run.stderr).toContain("aspekto-incomplete");
    expect(existsSync(out)).toBe(false);
  });

  it("explains itself with --help", () => {
    const run = fm(["modelo", "export", "--help"]);
    expect(run.code).toBe(0);
    expect(run.stdout).toContain("--config");
    expect(run.stdout).toContain(".fundamento/export");
  });
});

describe("fm modelo validate --aspekto / --config (Spec 001 T027, D-07)", () => {
  const ekzemploPackage = join(validFixtures, "aspekto-ekzemplo", "aspekto-ekzemplo");
  const incompletePackage = join(invalidFixtures, "aspekto-incomplete", "aspekto-ekzemplo");
  const ekzemploConfig = join(validFixtures, "aspekto-ekzemplo", "fundamento.config.json");
  const incompleteConfig = join(invalidFixtures, "aspekto-incomplete", "fundamento.config.json");

  it("validates a package against the repo core", () => {
    const run = fm(["modelo", "validate", "--aspekto", ekzemploPackage]);
    expect(run.code, run.stdout).toBe(0);
    expect(run.stdout).toContain("VALID");
    expect(run.stdout).toContain(ekzemploPackage);
  });

  it("reports an incomplete package with exit 1", () => {
    const run = fm(["modelo", "validate", "--aspekto", incompletePackage]);
    expect(run.code).toBe(1);
    expect(run.stdout).toContain("aspekto-incomplete");
  });

  it("takes --aspekto more than once", () => {
    const run = fm([
      "modelo",
      "validate",
      "--aspekto",
      ekzemploPackage,
      "--aspekto",
      incompletePackage,
    ]);
    expect(run.code).toBe(1);
    expect(run.stdout).toContain("aspekto-name-duplicate");
  });

  it("validates a project config", () => {
    expect(fm(["modelo", "validate", "--config", ekzemploConfig]).code).toBe(0);
    const run = fm(["modelo", "validate", "--config", incompleteConfig, "--json"]);
    expect(run.code).toBe(1);
    expect((JSON.parse(run.stdout) as { errors: unknown[] }).errors).toHaveLength(4);
  });

  it("rejects a path together with --config, and suggests --aspekto for a typo", () => {
    const both = fm(["modelo", "validate", validFixtures, "--config", ekzemploConfig]);
    expect(both.code).toBe(2);
    expect(both.stderr).toContain("--config");
    const typo = fm(["modelo", "validate", "--aspketo", ekzemploPackage]);
    expect(typo.code).toBe(2);
    expect(typo.stderr).toContain("Did you mean `--aspekto`?");
    expectNoStackTrace(typo);
  });

  it("documents the flags in --help", () => {
    const run = fm(["modelo", "validate", "--help"]);
    expect(run.stdout).toContain("--aspekto <dir>");
    expect(run.stdout).toContain("--config <file>");
  });
});

describe("fm mcp (Spec 001 T027, D-13)", () => {
  it("is listed in fm --help", () => {
    expect(fm(["--help"]).stdout).toMatch(/^\s+mcp\s+/m);
  });

  it("explains its flags with --help", () => {
    const run = fm(["mcp", "--help"]);
    expect(run.code).toBe(0);
    for (const flag of ["--config <file>", "--export <dir>", "--http", "--port <n>", "7300"]) {
      expect(run.stdout).toContain(flag);
    }
  });

  it.each([
    [["--prot", "7400"], "Did you mean `--port`?"],
    [["--port", "abc"], "--port"],
    [["--port", "7400"], "--http"],
    [["--config", "a.json", "--export", "dir"], "--export"],
    [["extra"], "no arguments"],
  ])("exits 2 on the usage error %j", (args, text) => {
    const run = fm(["mcp", ...args]);
    expect(run.code).toBe(2);
    expect(run.stderr).toContain(text);
    expectNoStackTrace(run);
  });

  it("exits 1 when the Modelo cannot be read", () => {
    const run = fm(["mcp", "--config", join(repoRoot, "nenia", "fundamento.config.json")]);
    expect(run.code).toBe(1);
    expect(run.stderr).toContain("file-missing");
    expectNoStackTrace(run);
  });
});
