// `buildProjekcioj` (Spec 003 T008; plan D-01, D-18, AK-02): every projection is generated from the
// Modelo, byte-identical over two builds, and a deleted output is regenerated with the same bytes.

import { createHash } from "node:crypto";
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { buildProjekcioj, CELOJ } from "./build.js";

/** Relative path -> SHA-256 of every file below `dir`. */
function hashes(dir: string): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (current: string) => {
    for (const name of readdirSync(current).sort()) {
      const path = join(current, name);
      if (statSync(path).isDirectory()) walk(path);
      else out[relative(dir, path)] = createHash("sha256").update(readFileSync(path)).digest("hex");
    }
  };
  walk(dir);
  return out;
}

describe("buildProjekcioj (T008)", () => {
  it("writes a manifest listing every Celo and the SHA-256 of every file it wrote", () => {
    const out = mkdtempSync(join(tmpdir(), "fm-projekcioj-"));
    const result = buildProjekcioj({ outDir: out });
    if (!result.ok) throw new Error("the repo Modelo must build");
    expect(result.celoj).toEqual(CELOJ.map((celo) => celo.name));
    const manifest = JSON.parse(readFileSync(join(out, "projekcioj.json"), "utf8")) as {
      fundamento: string;
      celoj: string[];
      files: Record<string, string>;
    };
    expect(manifest.celoj).toEqual(result.celoj);
    const { "projekcioj.json": _manifest, ...written } = hashes(out);
    expect(manifest.files).toEqual(written);
  });

  it("is byte-identical over two builds (AK-02)", () => {
    const first = mkdtempSync(join(tmpdir(), "fm-projekcioj-"));
    const second = mkdtempSync(join(tmpdir(), "fm-projekcioj-"));
    buildProjekcioj({ outDir: first });
    buildProjekcioj({ outDir: second });
    expect(hashes(second)).toEqual(hashes(first));
  });

  it("regenerates deleted outputs with the same SHA-256 (AK-02)", () => {
    const out = mkdtempSync(join(tmpdir(), "fm-projekcioj-"));
    buildProjekcioj({ outDir: out });
    const before = hashes(out);
    rmSync(out, { recursive: true, force: true });
    buildProjekcioj({ outDir: out });
    expect(hashes(out)).toEqual(before);
  });

  it("refuses an invalid Modelo and writes nothing", () => {
    const out = mkdtempSync(join(tmpdir(), "fm-projekcioj-"));
    const invalid = new URL("../../modelo/test/fixtures/invalid/skemo-schema/", import.meta.url)
      .pathname;
    const result = buildProjekcioj({ outDir: out, fixtureRoot: invalid });
    expect(result.ok).toBe(false);
    expect(readdirSync(out)).toEqual([]);
  });
});
