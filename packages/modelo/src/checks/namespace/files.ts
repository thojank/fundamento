// I/O edge of the namespace scanner: which files exist under a scan root, and their texts.
//
// Listing: inside a git work tree, `git ls-files -co --exclude-standard` (tracked files plus
// untracked files that are not ignored), so `.gitignore` is respected. Outside git (e.g. a
// fixture copied to a temp dir), a filesystem walk that skips node_modules, dist, .turbo and .git.
// Generated CSS under `dist/` is git-ignored and therefore collected by a separate walk.

import { execFile } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { extensionOf, isExcludedFromRepoScan, needsText } from "./paths.js";

const execFileAsync = promisify(execFile);

const WALK_SKIPPED_DIRS: ReadonlySet<string> = new Set(["node_modules", "dist", ".turbo", ".git"]);
const GENERATED_DIR = "dist";

export type Listing = "git" | "walk";

export interface ScanTree {
  /** Absolute scan root (the repo root, or the `--fixture` directory). */
  root: string;
  listing: Listing;
  /**
   * Listed files relative to `root` with `/` separators, sorted, without paths under
   * `test/fixtures/invalid/`. A walk lists a symlink as a file and does not follow it, and lists
   * a non-empty opaque directory as one `<dir>/` entry.
   */
  paths: string[];
  /** Generated CSS files under `dist/` directories (relative, sorted). */
  generatedCss: string[];
  /**
   * Texts of the listed and generated files that rules inspect (see `needsText`). Files inside
   * opaque directories are never read.
   */
  texts: ReadonlyMap<string, string>;
}

export interface ScanTreeOptions {
  /**
   * Directory names whose contents are never read or walked into (e.g. benchmark directories).
   * Files git lists inside them are still listed, so their presence can be reported.
   */
  opaqueDirectory?: (name: string) => boolean;
  /**
   * Files at the scan root that are metadata of the scan rather than part of it (e.g. a
   * fixture's `expected-issues.json`).
   */
  ignoredRootFiles?: readonly string[];
}

async function gitListing(root: string): Promise<string[] | undefined> {
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
      { cwd: root, maxBuffer: 256 * 1024 * 1024 },
    );
    return [...new Set(stdout.split("\0").filter((path) => path !== ""))];
  } catch {
    // Not a git work tree, or git is not installed: fall back to the walk.
    return undefined;
  }
}

interface WalkVisitor {
  enter: (name: string) => boolean;
  opaque: (name: string) => boolean;
  onFile: (path: string) => void;
  onOpaque: (path: string) => void;
}

async function walk(root: string, relativeDir: string, visitor: WalkVisitor): Promise<void> {
  const entries = await readdir(join(root, relativeDir), { withFileTypes: true });
  for (const entry of entries) {
    const path = relativeDir === "" ? entry.name : `${relativeDir}/${entry.name}`;
    if (!entry.isDirectory()) {
      visitor.onFile(path);
    } else if (visitor.opaque(entry.name)) {
      if ((await readdir(join(root, path))).length > 0) {
        visitor.onOpaque(`${path}/`);
      }
    } else if (visitor.enter(entry.name)) {
      await walk(root, path, visitor);
    }
  }
}

async function walkListing(root: string, opaque: (name: string) => boolean): Promise<string[]> {
  const paths: string[] = [];
  await walk(root, "", {
    enter: (name) => !WALK_SKIPPED_DIRS.has(name),
    opaque,
    onFile: (path) => paths.push(path),
    onOpaque: (path) => paths.push(path),
  });
  return paths;
}

async function generatedCssListing(
  root: string,
  opaque: (name: string) => boolean,
): Promise<string[]> {
  const found: string[] = [];
  await walk(root, "", {
    enter: (name) => name === GENERATED_DIR || !WALK_SKIPPED_DIRS.has(name),
    opaque,
    onFile: (path) => {
      if (extensionOf(path) === ".css" && path.split("/").slice(0, -1).includes(GENERATED_DIR)) {
        found.push(path);
      }
    },
    onOpaque: () => undefined,
  });
  return found;
}

async function readTexts(
  root: string,
  paths: readonly string[],
  opaque: (name: string) => boolean,
): Promise<Map<string, string>> {
  const texts = new Map<string, string>();
  for (const path of paths) {
    if (!needsText(path) || path.split("/").slice(0, -1).some(opaque)) {
      continue;
    }
    try {
      texts.set(path, await readFile(join(root, path), "utf8"));
    } catch {
      // Listed by git but deleted from the work tree, or not a regular file: nothing to inspect.
    }
  }
  return texts;
}

const byCodePoint = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

export async function loadScanTree(root: string, options: ScanTreeOptions = {}): Promise<ScanTree> {
  const ignoredRootFiles = new Set(options.ignoredRootFiles ?? []);
  const opaque = options.opaqueDirectory ?? (() => false);
  const listed = await gitListing(root);
  const listing: Listing = listed === undefined ? "walk" : "git";
  const paths = (listed ?? (await walkListing(root, opaque)))
    .filter((path) => !isExcludedFromRepoScan(path) && !ignoredRootFiles.has(path))
    .sort(byCodePoint);
  const listedPaths = new Set(paths);
  const generatedCss = (await generatedCssListing(root, opaque))
    .filter((path) => !isExcludedFromRepoScan(path) && !listedPaths.has(path))
    .sort(byCodePoint);
  const texts = await readTexts(root, [...paths, ...generatedCss], opaque);
  return { root, listing, paths, generatedCss, texts };
}

/**
 * `--fixture <dir>` semantics shared by vortaro-lint and clean-room: the directory is the scan root
 * (a mini repo). Its top-level `expected-issues.json` is test metadata and not scanned.
 */
export const FIXTURE_METADATA_FILES: readonly string[] = ["expected-issues.json"];

export interface ScanScope {
  root: string;
  /** True for the default run over the repository, false for `--fixture`. */
  repoRun: boolean;
  ignoredRootFiles: readonly string[];
}

export function scanScopeOf(options: { fixture?: string; repoRoot: string }): ScanScope {
  return options.fixture === undefined
    ? { root: options.repoRoot, repoRun: true, ignoredRootFiles: [] }
    : { root: options.fixture, repoRun: false, ignoredRootFiles: FIXTURE_METADATA_FILES };
}
