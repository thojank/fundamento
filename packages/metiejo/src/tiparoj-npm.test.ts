// The files of a webfont from its npm package (Spec 023, K-3, O-4 of plan ①): the export and the
// package take the font files with their licence from `@fontsource/<id>` on npm, read once into a
// cache outside the checkout; a second export needs no network and gives the same bytes. Tests use
// a fake registry and a tarball built here; nothing reaches the network.

import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { tarballOf } from "./test-doubles/tar.js";
import {
  cachedFontFiles,
  fetchFontFiles,
  fontFilesCss,
  type NpmDeps,
  npmPackageOf,
  untar,
  wantedFiles,
} from "./tiparoj-npm.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-npm-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const LICENSE = Buffer.from("SIL Open Font License 1.1 (test)");
const regular = Buffer.from("woff2-regular-bytes");
const bold = Buffer.from("woff2-bold-bytes");
const tarball = tarballOf([
  {
    path: "package/package.json",
    bytes: Buffer.from('{"name":"@fontsource/inter","version":"5.2.1"}'),
  },
  { path: "package/LICENSE", bytes: LICENSE },
  { path: "package/files/inter-latin-400-normal.woff2", bytes: regular },
  { path: "package/files/inter-latin-700-normal.woff2", bytes: bold },
  { path: "package/files/inter-cyrillic-400-normal.woff2", bytes: Buffer.from("cyrillic") },
  { path: "package/files/inter-latin-400-italic.woff2", bytes: Buffer.from("italic") },
]);

function deps(cacheDir: string, online = true): NpmDeps {
  return {
    fetchJson: async (url) => {
      if (!online) throw new Error("offline");
      expect(url).toBe("https://registry.npmjs.org/@fontsource%2finter/latest");
      return {
        version: "5.2.1",
        license: "OFL-1.1",
        dist: { tarball: "https://registry.npmjs.org/@fontsource/inter/-/inter-5.2.1.tgz" },
      };
    },
    fetchBytes: async (url) => {
      if (!online) throw new Error("offline");
      expect(url).toContain("inter-5.2.1.tgz");
      return tarball;
    },
    cacheDir,
    date: "2026-10-22",
  };
}

describe("untar and wantedFiles", () => {
  it("reads every entry of a gzipped tar back with its bytes", () => {
    const entries = untar(tarball);
    expect(entries.map((entry) => entry.path)).toEqual([
      "package/package.json",
      "package/LICENSE",
      "package/files/inter-latin-400-normal.woff2",
      "package/files/inter-latin-700-normal.woff2",
      "package/files/inter-cyrillic-400-normal.woff2",
      "package/files/inter-latin-400-italic.woff2",
    ]);
    expect(entries[2]?.bytes.equals(regular)).toBe(true);
  });

  it("keeps the licence and the Latin regular and bold weights, upright", () => {
    expect(wantedFiles(untar(tarball)).map((entry) => entry.path)).toEqual([
      "package/LICENSE",
      "package/files/inter-latin-400-normal.woff2",
      "package/files/inter-latin-700-normal.woff2",
    ]);
  });
});

describe("fetchFontFiles (O-4)", () => {
  const cache = join(scratch, "cache");

  it("names the package, reads the registry once and writes the files with their provenance into the cache", async () => {
    expect(npmPackageOf("inter")).toBe("@fontsource/inter");
    const files = await fetchFontFiles("inter", deps(cache));
    expect(files).toMatchObject({
      id: "inter",
      version: "5.2.1",
      license: "OFL-1.1",
      cached: false,
    });
    expect(files.dir).toBe(join(cache, "inter@5.2.1"));
    expect(files.files).toEqual([
      "LICENSE",
      "inter-latin-400-normal.woff2",
      "inter-latin-700-normal.woff2",
    ]);
    expect(readFileSync(join(files.dir, "LICENSE")).equals(LICENSE)).toBe(true);
    expect(readFileSync(join(files.dir, "inter-latin-700-normal.woff2")).equals(bold)).toBe(true);
    const provenance = JSON.parse(readFileSync(join(files.dir, "herkunto.json"), "utf8")) as Record<
      string,
      unknown
    >;
    expect(provenance).toMatchObject({
      package: "@fontsource/inter",
      version: "5.2.1",
      license: "OFL-1.1",
      date: "2026-10-22",
    });
    expect(String(provenance.tarball)).toContain("inter-5.2.1.tgz");
  });

  it("serves the cache without the network afterwards, the same files", async () => {
    const files = await fetchFontFiles("inter", deps(cache, false));
    expect(files.cached).toBe(true);
    expect(files.dir).toBe(join(cache, "inter@5.2.1"));
    expect(cachedFontFiles("inter", cache)?.version).toBe("5.2.1");
    expect(cachedFontFiles("nenia", cache)).toBeUndefined();
  });

  it("fails with the package named when there is no cache and no network", async () => {
    await expect(fetchFontFiles("roboto", deps(join(scratch, "leer"), false))).rejects.toThrow(
      /@fontsource\/roboto/,
    );
    expect(existsSync(join(scratch, "leer", "roboto@5.2.1"))).toBe(false);
  });
});

describe("fontFilesCss", () => {
  it("writes one @font-face per weight with a relative url and no network", () => {
    const css = fontFilesCss(
      "Inter",
      ["LICENSE", "inter-latin-400-normal.woff2", "inter-latin-700-normal.woff2"],
      "aspekto-provo/tiparoj/inter",
    );
    expect(css).toContain('font-family: "Inter"');
    expect(css).toContain("font-weight: 400");
    expect(css).toContain("font-weight: 700");
    expect(css).toContain("url(aspekto-provo/tiparoj/inter/inter-latin-700-normal.woff2)");
    expect(css).not.toContain("LICENSE");
    expect(css).not.toContain("http");
  });
});
