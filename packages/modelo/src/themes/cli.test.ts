// `pnpm vortaro:themes [--root <path>]`: writes both files deterministically, exit codes 0/1/2,
// no stack traces. Runs against copies of real fixtures in a temp directory.

import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ModeloSource } from "../contracts/modelo.js";
import { fixtureModeloSource } from "../load/source.js";
import { fixtureRoot } from "../resolve/test-doubles/fixtures.js";
import { EXIT_DOMAIN_ERROR, EXIT_OK, EXIT_USAGE, runThemesCli, type ThemesCliEnv } from "./cli.js";

let workDir: string;
let out: string;
let err: string;

function env(defaultSource?: ModeloSource): ThemesCliEnv {
  return {
    cwd: workDir,
    defaultSource: () => defaultSource ?? fixtureModeloSource(join(workDir, "does-not-exist")),
    stdout: (text) => {
      out += text;
    },
    stderr: (text) => {
      err += text;
    },
  };
}

function copyFixture(name: string): string {
  const target = join(workDir, name);
  cpSync(fixtureRoot("valid", name), target, { recursive: true });
  return target;
}

const read = (path: string) => readFileSync(path, "utf8");

beforeEach(() => {
  workDir = mkdtempSync(join(tmpdir(), "fm-themes-"));
  out = "";
  err = "";
});

afterEach(() => {
  rmSync(workDir, { recursive: true, force: true });
});

describe("vortaro:themes", () => {
  it("regenerates byte-identical files for a fixture in sync (--root, relative to cwd)", () => {
    const root = copyFixture("resolve-matrix");
    const themes = join(root, "vortaro/$themes.json");
    const metadata = join(root, "vortaro/$metadata.json");
    const before = [read(themes), read(metadata)];
    writeFileSync(themes, "[]\n");
    writeFileSync(metadata, '{"tokenSetOrder":["core"]}');
    expect(runThemesCli(["--root", "resolve-matrix"], env())).toBe(EXIT_OK);
    expect([read(themes), read(metadata)]).toEqual(before);
    expect(out).toContain("$themes.json");
    expect(err).toBe("");
    // Deterministic: a second run writes the same bytes.
    expect(runThemesCli(["--root", root], env())).toBe(EXIT_OK);
    expect([read(themes), read(metadata)]).toEqual(before);
  });

  it("regenerates missing or broken derived files", () => {
    const root = copyFixture("minimal");
    const themes = join(root, "vortaro/$themes.json");
    const expected = read(themes);
    rmSync(themes);
    writeFileSync(join(root, "vortaro/$metadata.json"), "{ not json");
    expect(runThemesCli(["--root", root], env())).toBe(EXIT_OK);
    expect(read(themes)).toBe(expected);
    expect(read(join(root, "vortaro/$metadata.json"))).toMatch(/^\{\n {2}"tokenSetOrder": \[\n/);
  });

  it("uses the default source without --root", () => {
    const root = copyFixture("resolve-tie");
    writeFileSync(join(root, "vortaro/$themes.json"), "[]\n");
    expect(runThemesCli([], env(fixtureModeloSource(root)))).toBe(EXIT_OK);
    expect(JSON.parse(read(join(root, "vortaro/$themes.json")))).toHaveLength(5);
  });

  it("exits 1 without a stack trace when the Modelo cannot be loaded", () => {
    const root = copyFixture("minimal");
    rmSync(join(root, "data/dimensioj.json"));
    expect(runThemesCli(["--root", root], env())).toBe(EXIT_DOMAIN_ERROR);
    expect(err).toContain("file-missing");
    expect(err).not.toMatch(/\n\s+at /);
  });

  it("exits 1 for a root that does not exist", () => {
    expect(runThemesCli(["--root", "nowhere"], env())).toBe(EXIT_DOMAIN_ERROR);
    expect(err).not.toMatch(/\n\s+at /);
  });

  it.each([[["--bogus"]], [["extra"]], [["--root"]], [["--root", ""]]])(
    "exits 2 on usage error %j",
    (argv) => {
      expect(runThemesCli(argv, env())).toBe(EXIT_USAGE);
      expect(err).toContain("Usage: pnpm vortaro:themes");
    },
  );

  it("prints help with exit 0", () => {
    expect(runThemesCli(["--help"], env())).toBe(EXIT_OK);
    expect(out).toContain("--root <path>");
  });
});
