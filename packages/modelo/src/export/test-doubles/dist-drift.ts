// Test support (not a double): what AK-10 says when dist/ differs from a fresh build.
//
// A bare hash mismatch pointed the wrong way on 2026-10-07: AK-10 went red once, nothing that was
// printed told which file differed or why, and the run could not be reproduced (Vojmapo, CI
// findings). So a red AK-10 now names the differing file and its first differing place, sets the
// mtime of dist against the newest source, and quotes what turbo knows about the last modelo#build.
// Green says nothing.

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

export interface DistDriftOptions {
  /** The dist/ the tests read. */
  distDir: string;
  /** A directory the export build has just written. */
  freshDir: string;
  fileNames: readonly string[];
  /** Directories whose files the export build reads; searched recursively. */
  sourceDirs: readonly string[];
  /** Where turbo writes `.turbo/runs/` (the repo root). */
  repoRoot: string;
  /** turbo's local cache; in a git worktree it lies in the main checkout, not in `repoRoot`. */
  turboCacheDir: string;
}

const MODELO_BUILD = "@fundamento/modelo#build";
/** A path every modelo#build cache entry lists in its manifest, and no other task's entry. */
const MODELO_BUILD_OUTPUT = '"packages/modelo/dist/modelo.json"';
const CONTEXT = 12;

/** The report, or "" when every dist file equals its fresh counterpart. */
export function distDriftReport(options: DistDriftOptions): string {
  const differing = options.fileNames.flatMap((name) => fileDrift(options, name));
  if (differing.length === 0) return "";
  return [
    "AK-10: dist/ is not what the export build writes now.",
    ...differing,
    ...newestSource(options),
    ...turboState(options.repoRoot, options.turboCacheDir),
  ].join("\n");
}

function fileDrift(options: DistDriftOptions, name: string): string[] {
  const distPath = join(options.distDir, name);
  if (!existsSync(distPath)) return [`dist/${name} is missing`];
  const dist = readFileSync(distPath, "utf8");
  const fresh = readFileSync(join(options.freshDir, name), "utf8");
  if (dist === fresh) return [];
  let offset = 0;
  while (offset < dist.length && offset < fresh.length && dist[offset] === fresh[offset]) offset++;
  const before = dist.slice(0, offset).split("\n");
  const line = before.length;
  const column = (before.at(-1)?.length ?? 0) + 1;
  const around = (text: string) =>
    JSON.stringify(text.slice(Math.max(0, offset - CONTEXT), offset + CONTEXT));
  return [
    `dist/${name} differs from the fresh build (${dist.length} vs ${fresh.length} chars), first difference at line ${line}, column ${column} (offset ${offset}):`,
    `  dist:  ${around(dist)}`,
    `  fresh: ${around(fresh)}`,
  ];
}

function newestSource({ sourceDirs, distDir, fileNames, repoRoot }: DistDriftOptions): string[] {
  const lines = fileNames
    .filter((name) => existsSync(join(distDir, name)))
    .map((name) => `mtime dist/${name}: ${statSync(join(distDir, name)).mtime.toISOString()}`);
  let newest: { path: string; mtime: Date } | undefined;
  for (const path of sourceDirs.flatMap(filesUnder)) {
    const { mtime } = statSync(path);
    if (newest === undefined || mtime > newest.mtime) newest = { path, mtime };
  }
  if (newest === undefined) return [...lines, "newest source: none found"];
  const distTimes = fileNames
    .filter((name) => existsSync(join(distDir, name)))
    .map((name) => statSync(join(distDir, name)).mtime.getTime());
  const relation =
    distTimes.length > 0 && newest.mtime.getTime() > Math.min(...distTimes)
      ? "newer than dist"
      : "older than dist";
  const shown = relative(repoRoot, newest.path);
  return [...lines, `newest source: ${shown} ${newest.mtime.toISOString()} (${relation})`];
}

function filesUnder(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));
}

function turboState(repoRoot: string, cacheDir: string): string[] {
  const runsDir = join(repoRoot, ".turbo", "runs");
  const summaries = existsSync(runsDir)
    ? readdirSync(runsDir)
        .filter((name) => name.endsWith(".json"))
        .map((name) => ({ name, mtime: statSync(join(runsDir, name)).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime)
    : [];
  for (const { name } of summaries) {
    const summary = JSON.parse(readFileSync(join(runsDir, name), "utf8")) as {
      tasks?: { taskId?: string; hash?: string; cache?: { status?: string } }[];
    };
    const task = summary.tasks?.find((candidate) => candidate.taskId === MODELO_BUILD);
    if (task !== undefined) {
      return [
        `turbo run summary ${name}: ${MODELO_BUILD} hash ${task.hash}, cache ${task.cache?.status}`,
      ];
    }
  }
  const lines = ["no turbo run summary (turbo writes one only with --summarize)"];
  const entries = existsSync(cacheDir)
    ? readdirSync(cacheDir)
        .filter((name) => name.endsWith("-manifest.json"))
        .filter((name) => readFileSync(join(cacheDir, name), "utf8").includes(MODELO_BUILD_OUTPUT))
        .map((name) => ({
          hash: name.slice(0, -"-manifest.json".length),
          mtime: statSync(join(cacheDir, name)).mtime,
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    : [];
  const [newest] = entries;
  lines.push(
    newest === undefined
      ? `no modelo#build cache entry in ${cacheDir}`
      : `newest modelo#build cache entry: ${newest.hash}, written ${newest.mtime.toISOString()} (${cacheDir}, shared by every worktree)`,
  );
  return lines;
}

/**
 * turbo's local cache: `.turbo/cache` beside the main checkout's `.git`, which in a worktree is
 * not `repoRoot`.
 */
export function turboCacheDir(repoRoot: string): string {
  const git = spawnSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  const commonDir = git.status === 0 ? git.stdout.trim() : join(repoRoot, ".git");
  return join(dirname(commonDir), ".turbo", "cache");
}
