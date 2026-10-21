// The files of a webfont from its npm package (Spec 023, K-3; O-4 of plan ①): an open-source
// webfont may travel with the package and the Make Kit, with its licence. The source is the
// Fontsource package `@fontsource/<id>` on npm: the registry names the version and the tarball,
// the tarball carries LICENSE and the woff2 files. Read once into a cache outside the checkout
// (`<cache>/<id>@<version>/` with herkunto.json, Art. VII); the export copies from there, so a
// second export needs no network and gives the same bytes (M-3). The network goes through
// `NpmDeps`, so the tests use a fake registry and a tarball of their own.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import { cacheRootOf } from "./privata.js";

export interface NpmDeps {
  fetchJson(url: string): Promise<unknown>;
  fetchBytes(url: string): Promise<Buffer>;
  /** The cache of the font files, outside the checkout. */
  cacheDir: string;
  /** The day a package is read (default: today), written into herkunto.json. */
  date?: string;
}

export interface TarEntry {
  path: string;
  bytes: Buffer;
}

export interface FontFiles {
  id: string;
  version: string;
  license: string;
  /** `<cache>/<id>@<version>`. */
  dir: string;
  /** The file names in `dir`: LICENSE and the woff2 files. */
  files: string[];
  /** Served from the cache, no network. */
  cached: boolean;
}

export const NPM_REGISTRY = "https://registry.npmjs.org";

export const npmPackageOf = (id: string): string => `@fontsource/${id}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** A gzipped ustar archive as `npm pack` writes it: every entry with its bytes, in order. */
export function untar(tarball: Buffer): TarEntry[] {
  const data = gunzipSync(tarball);
  const entries: TarEntry[] = [];
  let offset = 0;
  while (offset + 512 <= data.length) {
    const block = data.subarray(offset, offset + 512);
    if (block.every((byte) => byte === 0)) break;
    const name = block.subarray(0, 100).toString("utf8").replace(/\0.*$/s, "");
    const prefix = block.subarray(345, 500).toString("utf8").replace(/\0.*$/s, "");
    const size = Number.parseInt(
      block.subarray(124, 136).toString("latin1").replace(/\0.*$/s, "").trim() || "0",
      8,
    );
    const type = block[156];
    offset += 512;
    const path = prefix === "" ? name : `${prefix}/${name}`;
    if (type === 0 || type === 0x30) {
      entries.push({ path, bytes: Buffer.from(data.subarray(offset, offset + size)) });
    }
    offset += Math.ceil(size / 512) * 512;
  }
  return entries;
}

/** The licence and the Latin regular and bold weights, upright: what the package and the preview use. */
export function wantedFiles(entries: readonly TarEntry[]): TarEntry[] {
  const license = entries.find((entry) => /^package\/LICENSE(\.md|\.txt)?$/i.test(entry.path));
  const woff2 = (weight: number) =>
    entries.find((entry) =>
      new RegExp(`^package/files/[^/]*latin-${weight}-normal\\.woff2$`).test(entry.path),
    );
  return [license, woff2(400), woff2(700)].filter(
    (entry): entry is TarEntry => entry !== undefined,
  );
}

const fileName = (path: string): string => path.slice(path.lastIndexOf("/") + 1);

/** The newest version of a font in the cache, or nothing. */
export function cachedFontFiles(id: string, cacheDir: string): FontFiles | undefined {
  if (!existsSync(cacheDir)) return undefined;
  const versions = readdirSync(cacheDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(`${id}@`))
    .map((entry) => entry.name.slice(id.length + 1))
    .sort((a, b) => b.localeCompare(a, "en", { numeric: true }));
  const version = versions[0];
  if (version === undefined) return undefined;
  const dir = join(cacheDir, `${id}@${version}`);
  const provenanceFile = join(dir, "herkunto.json");
  if (!existsSync(provenanceFile)) return undefined;
  const provenance = JSON.parse(readFileSync(provenanceFile, "utf8")) as { license?: string };
  const files = readdirSync(dir)
    .filter((name) => name !== "herkunto.json")
    .sort();
  return { id, version, license: provenance.license ?? "", dir, files, cached: true };
}

/**
 * The files of a webfont: from the cache when they are there, else read from npm — the registry
 * for the version and the tarball, the tarball for LICENSE and the woff2 files — and written into
 * the cache with herkunto.json (package, version, licence, tarball, day). Throws, naming the
 * package, when neither the cache nor the network has them.
 */
export async function fetchFontFiles(id: string, deps: NpmDeps): Promise<FontFiles> {
  const cached = cachedFontFiles(id, deps.cacheDir);
  if (cached !== undefined) return cached;
  const name = npmPackageOf(id);
  let meta: unknown;
  let tarball: Buffer;
  try {
    meta = await deps.fetchJson(`${NPM_REGISTRY}/@fontsource%2f${encodeURIComponent(id)}/latest`);
    const dist = isRecord(meta) && isRecord(meta.dist) ? meta.dist : {};
    if (typeof dist.tarball !== "string") throw new Error("the registry names no tarball");
    tarball = await deps.fetchBytes(dist.tarball);
  } catch (error) {
    throw new Error(
      `${name} could not be read from npm (${error instanceof Error ? error.message : String(error)}); no cached copy exists.`,
    );
  }
  const version = isRecord(meta) && typeof meta.version === "string" ? meta.version : "0.0.0";
  const license = isRecord(meta) && typeof meta.license === "string" ? meta.license : "";
  const tarballUrl = isRecord(meta) && isRecord(meta.dist) ? String(meta.dist.tarball) : "";
  const entries = wantedFiles(untar(tarball));
  if (!entries.some((entry) => entry.path.endsWith(".woff2"))) {
    throw new Error(`${name} ${version} carries no Latin woff2 file.`);
  }
  const dir = join(deps.cacheDir, `${id}@${version}`);
  mkdirSync(dir, { recursive: true });
  const files: string[] = [];
  for (const entry of entries) {
    const target = /LICENSE/i.test(fileName(entry.path)) ? "LICENSE" : fileName(entry.path);
    writeFileSync(join(dir, target), entry.bytes);
    files.push(target);
  }
  const provenance = {
    package: name,
    version,
    license,
    tarball: tarballUrl,
    date: deps.date ?? new Date().toISOString().slice(0, 10),
    read: "LICENSE and the Latin regular and bold woff2 files of the Fontsource package on npm, read by the Metiejo export",
  };
  writeFileSync(join(dir, "herkunto.json"), `${JSON.stringify(provenance, null, 2)}\n`);
  return { id, version, license, dir, files: files.sort(), cached: false };
}

/** `@font-face` rules for the files at a relative base, one per weight; no network. */
export function fontFilesCss(family: string, files: readonly string[], base: string): string {
  const rules: string[] = [];
  for (const file of files) {
    const weight = /-(\d{3})-normal\.woff2$/.exec(file)?.[1];
    if (weight === undefined) continue;
    rules.push(
      `@font-face { font-family: ${JSON.stringify(family)}; font-style: normal; font-weight: ${weight}; font-display: swap; src: url(${base}/${file}) format("woff2"); }`,
    );
  }
  return rules.join("\n");
}

/** The dependencies of the maintainer's machine: the npm registry over https, the person's cache. */
export function defaultNpmDeps(): NpmDeps {
  const read = async (url: string): Promise<Response> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url} answered ${response.status}`);
    return response;
  };
  return {
    fetchJson: async (url) => (await read(url)).json(),
    fetchBytes: async (url) => Buffer.from(await (await read(url)).arrayBuffer()),
    cacheDir: join(
      cacheRootOf(process.env, process.platform, homedir()),
      "fundamento",
      "tiparoj-npm",
    ),
  };
}
