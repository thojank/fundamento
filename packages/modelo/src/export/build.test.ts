// FUND-4.1 build artifacts: `pnpm build` writes dist/modelo.json, dist/modelo.schema.json and
// dist/rezolvoj.json. These tests read the built files (turbo runs `build` before `test`) and
// spawn the built export script into temp directories; they never write into the repo.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import type { ModeloJson } from "../contracts/modelo.js";
import { readModeloSchema } from "../contracts/schema.js";
import { buildModelo } from "../load/build.js";
import { readModeloFiles } from "../load/files.js";
import { defaultModeloSource } from "../load/source.js";
import { fixtureRoot } from "../resolve/test-doubles/fixtures.js";
import { celoMappingLeaks } from "./celo-mappings.js";
import { describeModelo } from "./describe.js";
import { EXPORT_FILE_NAMES, exportModelo } from "./export-modelo.js";

const DIST_DIR = fileURLToPath(new URL("../../dist/", import.meta.url));
const BUILD_SCRIPT = join(DIST_DIR, "export/build.js");
const FILE_NAMES = Object.values(EXPORT_FILE_NAMES);

const readDist = (name: string) => readFileSync(join(DIST_DIR, name), "utf8");
const sha256 = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");
const hashDir = (dir: string) =>
  Object.fromEntries(
    FILE_NAMES.map((name) => [name, sha256(readFileSync(join(dir, name), "utf8"))]),
  );

const tempDirs: string[] = [];
function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "fm-export-"));
  tempDirs.push(dir);
  return dir;
}

afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});

function runBuild(args: readonly string[]) {
  return spawnSync(process.execPath, [BUILD_SCRIPT, ...args], { encoding: "utf8" });
}

describe("build artifacts in dist/", () => {
  it.each(FILE_NAMES)("dist/%s exists", (name) => {
    expect(existsSync(join(DIST_DIR, name))).toBe(true);
  });

  it("are exactly what exportModelo produces from the current sources (not stale)", () => {
    const { files } = readModeloFiles(defaultModeloSource());
    if (files === undefined) throw new Error("repo Modelo did not load");
    const { modelo } = buildModelo(files);
    const fresh = exportModelo({ modelo, sets: files.sets, schema: readModeloSchema() });
    expect(readDist(EXPORT_FILE_NAMES.modelo)).toBe(fresh.modeloJson);
    expect(readDist(EXPORT_FILE_NAMES.schema)).toBe(fresh.schemaJson);
    expect(readDist(EXPORT_FILE_NAMES.rezolvoj)).toBe(fresh.rezolvojJson);
  });
});

/**
 * Spawns the build twice: sized for a cold or loaded runner (Jugxo jug_01M2W3K1YPP05F4XF86J71RGTK).
 * One run takes about a second; the budget is for a runner that is busy with the rest of the gate,
 * which Spec 003 made heavier (two more projection builds run in parallel with this file).
 */
const BUILD_TWICE_TIMEOUT_MS = 30_000 * (process.env.CI === "true" ? 3 : 1);

describe("building twice is byte-identical (AK-10)", () => {
  it("two runs of the export build give the same SHA-256 hashes as dist/", {
    timeout: BUILD_TWICE_TIMEOUT_MS,
  }, () => {
    const first = tempDir();
    const second = tempDir();
    for (const out of [first, second]) {
      const run = runBuild(["--out", out]);
      expect(run.status, run.stderr).toBe(0);
    }
    expect(hashDir(first)).toEqual(hashDir(second));
    expect(hashDir(first)).toEqual(hashDir(DIST_DIR));
  });
});

describe("the build fails on an invalid Modelo", () => {
  it("exits 1 with a clear issue list, no stack trace and nothing written", () => {
    const out = tempDir();
    const run = runBuild([
      "--root",
      fixtureRoot("invalid", "modelo-alias-target-missing"),
      "--out",
      join(out, "dist"),
    ]);
    expect(run.status).toBe(1);
    expect(run.stderr).toContain("alias-target-missing");
    expect(run.stderr).toContain("vortaro/sets/core.json#/color/background/default/$value");
    expect(run.stderr).toMatch(/not written/);
    expect(run.stderr).not.toMatch(/^\s+at /m);
    expect(existsSync(join(out, "dist"))).toBe(false);
  });

  it("exits 2 on a usage error", () => {
    const run = runBuild(["--bogus"]);
    expect(run.status).toBe(2);
    expect(run.stderr).not.toMatch(/^\s+at /m);
  });
});

describe("the S6 dialog from dist/modelo.json alone (AK-06)", () => {
  // Only the exported file is read here: no loader, no data files, no Vortaro.
  const modeloJson = JSON.parse(readDist(EXPORT_FILE_NAMES.modelo)) as ModeloJson;
  const description = describeModelo(modeloJson);

  it("answers 'what is here?' with computed facts", () => {
    expect(description.version).toBe("0.1.0");
    expect(description.dimensioj).toEqual(modeloJson.dimensioj.map((dimensio) => dimensio.name));
    expect(description.dimensioj).toHaveLength(6);
    expect(description.aspektoj).toEqual(["komuna"]);
    expect(description.tokenCount).toBe(modeloJson.tokens.length);
    expect(description.typeCount).toBe(new Set(modeloJson.tokens.map((t) => t.type)).size);
    expect(description.reguloCount).toBe(modeloJson.reguloj.length);
    expect(description.reguloWithKialoCount).toBe(modeloJson.reguloj.length);
    expect(description.eroCount).toBe(modeloJson.eroj.length);
  });

  it("states the S6 sentence", () => {
    expect(description.sentence).toContain(
      `six Dimensioj (${description.dimensioj.join(", ")}), one Aspekto (\`komuna\`: reference, MIT, Geist), ${description.tokenCount} tokens in `,
    );
    // Counts change while Spec 001 fills the Vortaro; the shape of the sentence does not.
    expect(description.sentence).toMatch(
      /^Fundamento v0\.1\.0: six Dimensioj \(aspekto, viewport, density, color-scheme, contrast, motion\), one Aspekto \(`komuna`: reference, MIT, Geist\), \d+ tokens in \w+ types \(.+\), \w+ rules with reasons \(\w+ automatic\), \w+ Jugxoj, one Ero \(`butono`\)\. Ask explain why a value is what it is\.$/,
    );
  });
});

describe("no Celo-specific mappings in the export (AK-12, Art. VIII)", () => {
  // Narrowed on 2026-09-20: the check asks for mappings, not for words. A Jugxo that declares its
  // Celo in `ref.celo` may name the tool in its prose; see `celo-mappings.ts`.
  it.each([EXPORT_FILE_NAMES.modelo, EXPORT_FILE_NAMES.schema])("%s carries none", (name) => {
    const document = JSON.parse(readDist(name)) as unknown;
    expect(celoMappingLeaks(document)).toEqual([]);
  });

  // The guard for the narrowing: a real mapping — a token that carries the name a Celo gives it —
  // still trips the check, in the real export, not only in a fixture.
  it("still trips when a token carries the name a Celo gives it", () => {
    const document = JSON.parse(readDist(EXPORT_FILE_NAMES.modelo)) as Record<string, unknown>;
    const token = (document.tokens as Record<string, unknown>[])[0] ?? {};
    token.nomo = "--color-border-default";
    expect(celoMappingLeaks(document)).toEqual([{ pointer: "/tokens/0/nomo", needle: "--color-" }]);
  });
});
