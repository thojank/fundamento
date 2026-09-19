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
import { TAILWIND_NAMESPACES } from "../nomreguloj/tailwind.js";
import { fixtureRoot } from "../resolve/test-doubles/fixtures.js";
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

describe("building twice is byte-identical (AK-10)", () => {
  // Spawns the build twice: sized for a cold or loaded runner (Jugxo jug_01M2W3K1YPP05F4XF86J71RGTK).
  it("two runs of the export build give the same SHA-256 hashes as dist/", {
    timeout: 30_000,
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
    expect(description.eroCount).toBe(0);
  });

  it("states the S6 sentence", () => {
    expect(description.sentence).toContain(
      `six Dimensioj (${description.dimensioj.join(", ")}), one Aspekto (\`komuna\`: reference, MIT, Geist), ${description.tokenCount} tokens in `,
    );
    // Counts change while Spec 001 fills the Vortaro; the shape of the sentence does not.
    expect(description.sentence).toMatch(
      /^Fundamento v0\.1\.0: six Dimensioj \(aspekto, viewport, density, color-scheme, contrast, motion\), one Aspekto \(`komuna`: reference, MIT, Geist\), \d+ tokens in \w+ types \(.+\), \w+ rules with reasons \(\w+ automatic\), \w+ Jugxoj, no Eroj\. Ask explain why a value is what it is\.$/,
    );
  });
});

describe("no Celo-specific mappings in the export (AK-12, Art. VIII)", () => {
  const FORBIDDEN_KEY_WORDS = ["tailwind", "css", "figma"];
  const FORBIDDEN_TEXT = [
    "--fm-",
    "--color-",
    "@theme",
    "tailwind",
    "figma",
    ...TAILWIND_NAMESPACES.map((entry) => entry.namespace.replace("*", "")),
  ];

  function collectKeys(node: unknown, out: string[] = []): string[] {
    if (Array.isArray(node)) {
      for (const item of node) collectKeys(item, out);
    } else if (typeof node === "object" && node !== null) {
      for (const [key, value] of Object.entries(node)) {
        out.push(key);
        collectKeys(value, out);
      }
    }
    return out;
  }

  it.each([EXPORT_FILE_NAMES.modelo, EXPORT_FILE_NAMES.schema])("%s has no Celo keys", (name) => {
    const keys = collectKeys(JSON.parse(readDist(name)));
    expect(keys.length).toBeGreaterThan(0);
    for (const word of FORBIDDEN_KEY_WORDS) {
      expect(
        keys.filter((key) => key.toLowerCase().includes(word)),
        word,
      ).toEqual([]);
    }
  });

  it.each([EXPORT_FILE_NAMES.modelo, EXPORT_FILE_NAMES.schema])(
    "%s contains no Tailwind namespaces or derived CSS names",
    (name) => {
      const text = readDist(name).toLowerCase();
      for (const needle of FORBIDDEN_TEXT) {
        expect(text, needle).not.toContain(needle);
      }
    },
  );
});
