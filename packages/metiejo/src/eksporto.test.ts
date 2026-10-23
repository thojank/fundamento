// The export (Spec 023, §3 step 7, M-3, M-4, F-13): the Aspekto package, the CSS and the Figma
// plugin of a brand into <brand>/eksporto/; the same confirmed values give the same bytes twice;
// a result that carries a byte pattern of a licensed font is refused and removed; the Figma plugin
// has its own ID and names the brand (F-13 of Nachlese 8 ①, red until it is on main).

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { checkPackageDir, readAgordo } from "@fundamento/agordilo";
import { afterAll, describe, expect, it } from "vitest";
import { exportMarko } from "./eksporto.js";
import { MARKEN_DIR, markoDir } from "./marko.js";
import { CHECKOUT_ROOT } from "./root.js";
import { tarballOf } from "./test-doubles/tar.js";
import type { NpmDeps } from "./tiparoj-npm.js";
import { loadBases } from "./vorschau.js";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-eksporto-"));
const workdir = join(scratch, MARKEN_DIR);
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const provo = readAgordo(
  JSON.parse(
    readFileSync(
      join(repoRoot, "packages/modelo/test/fixtures/valid/aspekto-provo/agordo.json"),
      "utf8",
    ),
  ),
).agordo;
if (provo === undefined) throw new Error("the provo fixture must be a valid Agordo");
const bases = loadBases();

function hashes(dir: string): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) walk(path);
      else out[relative(dir, path)] = createHash("sha256").update(readFileSync(path)).digest("hex");
    }
  };
  walk(dir);
  return out;
}

describe("exportMarko: the package and the CSS (M-3)", () => {
  it("writes aspekto-<name> and the CSS of core, komuna and the brand, byte-identical twice", async () => {
    const first = await exportMarko(workdir, "provo", provo, bases, {
      celoj: ["aspekto", "css"],
      fonts: [],
    });
    expect(first.ok).toBe(true);
    const dir = join(markoDir(workdir, "provo"), "eksporto");
    expect(first.dir).toBe(dir);
    expect(existsSync(join(dir, "aspekto-provo", "aspekto.json"))).toBe(true);
    expect(existsSync(join(dir, "aspekto-provo", "raporto.md"))).toBe(true);
    const css = readFileSync(join(dir, "projekcioj", "css", "fundamento.css"), "utf8");
    expect(css).toContain('data-fm-aspekto="provo"');
    expect(css).toContain('data-fm-aspekto="komuna"');
    const before = hashes(dir);
    const second = await exportMarko(workdir, "provo", provo, bases, {
      celoj: ["aspekto", "css"],
      fonts: [],
    });
    expect(second.ok).toBe(true);
    expect(hashes(dir)).toEqual(before);
    expect(Object.keys(before).length).toBeGreaterThan(20);
  });

  it("refuses an Agordo whose export the checks refuse, and writes nothing", async () => {
    const bad = { ...provo, name: "malbona", regler: { ...provo.regler, kontrast: -1 } };
    const result = await exportMarko(workdir, "malbona", bad, bases, {
      celoj: ["aspekto"],
      fonts: [],
    });
    expect(result.ok).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(existsSync(join(markoDir(workdir, "malbona"), "eksporto"))).toBe(false);
  });
});

describe("exportMarko: the byte check (M-4)", () => {
  it("removes a result that carries a byte pattern of a licensed font and says which", async () => {
    // The "licensed font" is a slice of the stylesheet the export writes: planted by construction.
    const dir = join(markoDir(workdir, "provo"), "eksporto");
    const css = readFileSync(join(dir, "projekcioj", "css", "fundamento.css"));
    const planted = {
      source: join(scratch, "cache", "Planted.woff2"),
      bytes: css.subarray(100, 1100),
    };
    const result = await exportMarko(workdir, "provo", provo, bases, {
      celoj: ["aspekto", "css"],
      fonts: [planted],
    });
    expect(result.ok).toBe(false);
    // The slice stands in every stylesheet the export writes: one finding per file, all of one rule.
    expect(result.issues.length).toBeGreaterThanOrEqual(1);
    expect(new Set(result.issues.map((issue) => issue.rule))).toEqual(
      new Set(["tiparo-in-result"]),
    );
    expect(result.issues[0]?.message).toContain("Planted.woff2");
    expect(existsSync(dir)).toBe(false);
  });
});

describe("exportMarko: the webfont files from npm (O-4)", () => {
  const tarball = tarballOf([
    { path: "package/LICENSE", bytes: Buffer.from("OFL (test)") },
    { path: "package/files/archivo-latin-400-normal.woff2", bytes: Buffer.from("archivo-regular") },
    { path: "package/files/archivo-latin-700-normal.woff2", bytes: Buffer.from("archivo-bold") },
  ]);
  const npm: NpmDeps = {
    fetchJson: async () => ({
      version: "5.1.0",
      license: "OFL-1.1",
      dist: { tarball: "https://registry.npmjs.org/@fontsource/archivo/-/archivo-5.1.0.tgz" },
    }),
    fetchBytes: async () => tarball,
    cacheDir: join(scratch, "npm-cache"),
    date: "2026-10-22",
  };

  it("puts the files of every webfont with licence and provenance into the package, writes tiparoj.css, and the package still checks", async () => {
    const result = await exportMarko(workdir, "provo", provo, bases, {
      celoj: ["aspekto"],
      fonts: [],
      npm,
    });
    expect(result.ok).toBe(true);
    const fonts = join(result.dir, "aspekto-provo", "tiparoj", "archivo");
    for (const file of [
      "LICENSE",
      "archivo-latin-400-normal.woff2",
      "archivo-latin-700-normal.woff2",
      "herkunto.json",
    ]) {
      expect(existsSync(join(fonts, file)), file).toBe(true);
    }
    const css = readFileSync(join(result.dir, "tiparoj.css"), "utf8");
    expect(css).toContain('font-family: "Archivo"');
    expect(css).toContain("url(aspekto-provo/tiparoj/archivo/archivo-latin-700-normal.woff2)");
    expect(result.sentences.join(" ")).toContain("Archivo");
    expect(result.sentences.join(" ")).toContain("@fontsource/archivo 5.1.0");
    expect(checkPackageDir(join(result.dir, "aspekto-provo")).ok).toBe(true);
    const before = hashes(result.dir);
    const again = await exportMarko(workdir, "provo", provo, bases, {
      celoj: ["aspekto"],
      fonts: [],
      npm: {
        ...npm,
        fetchJson: async () => {
          throw new Error("offline");
        },
        fetchBytes: async () => {
          throw new Error("offline");
        },
      },
    });
    expect(again.ok).toBe(true);
    expect(hashes(again.dir)).toEqual(before);
  });

  it("without npm the brand names the font with its licence and says that no file was taken", async () => {
    const result = await exportMarko(workdir, "provo", provo, bases, {
      celoj: ["aspekto"],
      fonts: [],
    });
    expect(result.ok).toBe(true);
    expect(existsSync(join(result.dir, "aspekto-provo", "tiparoj"))).toBe(false);
    expect(result.sentences.join(" ")).toMatch(/Archivo.*ohne Schriftdatei/);
  });

  it("a failed download is a sentence, not a refusal", async () => {
    const failing: NpmDeps = {
      ...npm,
      cacheDir: join(scratch, "npm-leer"),
      fetchJson: async () => {
        throw new Error("offline");
      },
    };
    const result = await exportMarko(workdir, "provo", provo, bases, {
      celoj: ["aspekto"],
      fonts: [],
      npm: failing,
    });
    expect(result.ok).toBe(true);
    expect(result.sentences.join(" ")).toMatch(/Archivo.*nicht geladen/);
  });

  it("never exports into the checkout (O-3)", async () => {
    await expect(
      exportMarko(join(CHECKOUT_ROOT, "marken"), "provo", provo, bases, {
        celoj: ["aspekto"],
        fonts: [],
      }),
    ).rejects.toThrow(/checkout/i);
    expect(existsSync(join(CHECKOUT_ROOT, "marken"))).toBe(false);
  });
});

describe("exportMarko: Figma (F-13)", () => {
  it("writes the plugin with an ID of its own that names the brand, so Figma keeps it apart from the komuna build", async () => {
    mkdirSync(workdir, { recursive: true });
    const result = await exportMarko(workdir, "provo", provo, bases, {
      celoj: ["figma"],
      fonts: [],
    });
    expect(result.ok).toBe(true);
    const manifestPath = join(result.dir, "projekcioj", "figma", "plugin", "manifest.json");
    expect(existsSync(manifestPath)).toBe(true);
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { id: string; name: string };
    // Spec 027: the plugin of the Bauformen.
    expect(manifest.id).toMatch(/^fundamento-bauformen-[0-9a-f]+$/);
    expect(manifest.name).toContain("provo");
    expect(existsSync(join(result.dir, "projekcioj", "figma", "plugin", "code.js"))).toBe(true);
  });
});
