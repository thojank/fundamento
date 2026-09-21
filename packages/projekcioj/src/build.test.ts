// `buildProjekcioj` (Spec 003 T008; plan D-01, D-18, AK-02): every projection is generated from the
// Modelo, byte-identical over two builds, and a deleted output is regenerated with the same bytes.

import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { buildProjekcioj, CELOJ, MANIFEST_FILE } from "./build.js";

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
  it("writes a manifest listing every Celo and the SHA-256 of every file it wrote", async () => {
    const out = mkdtempSync(join(tmpdir(), "fm-projekcioj-"));
    const result = await buildProjekcioj({ outDir: out });
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

  it("is byte-identical over two builds (AK-02)", async () => {
    const first = mkdtempSync(join(tmpdir(), "fm-projekcioj-"));
    const second = mkdtempSync(join(tmpdir(), "fm-projekcioj-"));
    await buildProjekcioj({ outDir: first });
    await buildProjekcioj({ outDir: second });
    expect(hashes(second)).toEqual(hashes(first));
  });

  it("regenerates deleted outputs with the same SHA-256 (AK-02)", async () => {
    const out = mkdtempSync(join(tmpdir(), "fm-projekcioj-"));
    await buildProjekcioj({ outDir: out });
    const before = hashes(out);
    rmSync(out, { recursive: true, force: true });
    await buildProjekcioj({ outDir: out });
    expect(hashes(out)).toEqual(before);
  });

  it("refuses an invalid Modelo and writes nothing", async () => {
    const out = mkdtempSync(join(tmpdir(), "fm-projekcioj-"));
    const invalid = new URL("../../modelo/test/fixtures/invalid/skemo-schema/", import.meta.url)
      .pathname;
    const result = await buildProjekcioj({ outDir: out, fixtureRoot: invalid });
    expect(result.ok).toBe(false);
    expect(readdirSync(out)).toEqual([]);
  });
});

// F12: Ein Test, der die Verdrahtung eines Befehls prüft, soll nicht die Arbeit aller acht Celoj
// tun. `celoj` wählt aus, was gebaut wird — dieselbe Auswahl, die auch beim Regenerieren einer
// einzelnen Projektion gebraucht wird.
const tempDir = () => mkdtempSync(join(tmpdir(), "fm-projekcioj-elekto-"));

describe("building a selection of Celoj", () => {
  it("writes only the chosen Celo and lists only it in the manifest", async () => {
    const out = tempDir();
    const result = await buildProjekcioj({ outDir: out, celoj: ["css"] });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.celoj).toEqual(["css"]);
    expect(result.files.every((file) => file.startsWith("css/"))).toBe(true);
    expect(existsSync(join(out, "figma"))).toBe(false);
    const manifest = JSON.parse(readFileSync(join(out, MANIFEST_FILE), "utf8")) as {
      celoj: string[];
    };
    expect(manifest.celoj).toEqual(["css"]);
  });

  it("names the Celoj it knows when one is unknown", async () => {
    await expect(buildProjekcioj({ outDir: tempDir(), celoj: ["sketch"] })).rejects.toThrow(
      /sketch.*css/s,
    );
  });

  // The Vitrino composes what the others wrote; alone it would read files that do not exist.
  it("refuses a composing Celo without the Celoj it composes", async () => {
    await expect(buildProjekcioj({ outDir: tempDir(), celoj: ["vitrino"] })).rejects.toThrow(
      /vitrino/,
    );
  });
});
