// The report AK-10 prints when dist/ differs from a fresh build. Each case builds the directories it
// needs in a temp folder; nothing here reads the repo's dist/ or turbo cache.

import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { distDriftReport } from "./dist-drift.js";

const tempDirs: string[] = [];
afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});

const DIST_TIME = new Date("2026-10-07T21:00:00Z");
const SOURCE_TIME = new Date("2026-10-07T22:00:00Z");
const CACHE_TIME = new Date("2026-10-07T20:30:00Z");
const OLD_CACHE_TIME = new Date("2026-10-07T19:00:00Z");

function write(path: string, content: string, time: Date): void {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, content);
  utimesSync(path, time, time);
}

/** A repo-shaped temp folder: dist, a fresh build, one source and the turbo state the case asks for. */
function setup(turbo: "runs" | "cache" | "none", distModelo = '{\n  "a": 1,\n  "b": "old"\n}\n') {
  const root = mkdtempSync(join(tmpdir(), "fm-dist-drift-"));
  tempDirs.push(root);
  const dist = join(root, "dist");
  const fresh = join(root, "fresh");
  for (const [dir, modelo] of [
    [dist, distModelo],
    [fresh, '{\n  "a": 1,\n  "b": "new"\n}\n'],
  ] as const) {
    write(join(dir, "modelo.json"), modelo, DIST_TIME);
    write(join(dir, "rezolvoj.json"), "{}\n", DIST_TIME);
  }
  write(join(root, "data", "sets", "mankoj.json"), "{}", SOURCE_TIME);
  const cacheDir = join(root, "cache");
  if (turbo === "runs") {
    const summary = {
      tasks: [
        { taskId: "@fundamento/cli#build", hash: "1111", cache: { status: "MISS" } },
        { taskId: "@fundamento/modelo#build", hash: "538f52051b4ff032", cache: { status: "HIT" } },
      ],
    };
    write(join(root, ".turbo", "runs", "2xyz.json"), JSON.stringify(summary), CACHE_TIME);
  }
  if (turbo === "cache") {
    const manifest = (path: string) => JSON.stringify({ files: { [path]: { size: 1 } } });
    write(
      join(cacheDir, "aaaa-manifest.json"),
      manifest("packages/modelo/dist/modelo.json"),
      OLD_CACHE_TIME,
    );
    write(join(cacheDir, "aaaa-meta.json"), "{}", OLD_CACHE_TIME);
    write(
      join(cacheDir, "bbbb-manifest.json"),
      manifest("packages/modelo/dist/modelo.json"),
      CACHE_TIME,
    );
    write(join(cacheDir, "bbbb-meta.json"), "{}", CACHE_TIME);
    // Newer, but another task's entry: must not be reported.
    write(
      join(cacheDir, "cccc-manifest.json"),
      manifest("packages/cli/dist/index.js"),
      SOURCE_TIME,
    );
    write(join(cacheDir, "cccc-meta.json"), "{}", SOURCE_TIME);
  }
  return {
    distDir: dist,
    freshDir: fresh,
    fileNames: ["modelo.json", "rezolvoj.json"],
    sourceDirs: [join(root, "data")],
    repoRoot: root,
    turboCacheDir: cacheDir,
  };
}

describe("the AK-10 drift report", () => {
  it("says nothing when dist/ equals the fresh build", () => {
    const options = setup("none", '{\n  "a": 1,\n  "b": "new"\n}\n');
    expect(distDriftReport(options)).toBe("");
  });

  it("names the differing file and its first differing place, with both sides", () => {
    const report = distDriftReport(setup("none"));
    expect(report).toContain("dist/modelo.json differs from the fresh build");
    expect(report).toContain("first difference at line 3, column 9 (offset 20)");
    expect(report).toContain('dist:  " 1,\\n  \\"b\\": \\"old\\"\\n}\\n"');
    expect(report).toContain('fresh: " 1,\\n  \\"b\\": \\"new\\"\\n}\\n"');
    expect(report).not.toContain("dist/rezolvoj.json differs");
  });

  it("sets the mtime of the dist file against the newest source", () => {
    const report = distDriftReport(setup("none"));
    expect(report).toContain("mtime dist/modelo.json: 2026-10-07T21:00:00.000Z");
    expect(report).toMatch(
      /newest source: .*data\/sets\/mankoj\.json 2026-10-07T22:00:00\.000Z \(newer than dist\)/,
    );
  });

  it("quotes the last turbo run summary for modelo#build when there is one", () => {
    const report = distDriftReport(setup("runs"));
    expect(report).toContain(
      "turbo run summary 2xyz.json: @fundamento/modelo#build hash 538f52051b4ff032, cache HIT",
    );
  });

  it("falls back to the newest modelo#build cache entry when turbo wrote no summary", () => {
    const report = distDriftReport(setup("cache"));
    expect(report).toContain("no turbo run summary (turbo writes one only with --summarize)");
    expect(report).toContain(
      "newest modelo#build cache entry: bbbb, written 2026-10-07T20:30:00.000Z",
    );
  });

  it("names a missing dist file instead of throwing", () => {
    const options = setup("none");
    rmSync(join(options.distDir, "rezolvoj.json"));
    expect(distDriftReport(options)).toContain("dist/rezolvoj.json is missing");
  });
});
