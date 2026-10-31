// Licensed fonts in the maintainer's private repository (Spec 023, §4.5): the name comes from
// FM_TIPAROJ_REPO and stands in no file of the public repo; the app commits and pushes after a
// confirmation, only when the GitHub API says the repository is private; the cache lies outside
// the checkout. Tests run against a local bare repository and a fake visibility check; the real
// repository is never touched.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  cacheDirOf,
  cacheRootOf,
  defaultDeps,
  listCachedFonts,
  type PrivataDeps,
  privataState,
  syncCache,
  uploadFont,
} from "./privata.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-privata-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const REPO = "owner/name";
const bare = join(scratch, "remote.git");
execFileSync("git", ["init", "--bare", "-q", "-b", "main", bare]);

const git = (args: readonly string[], cwd: string): string =>
  execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

function deps(visibility: "private" | "public" | "unknown", cacheDir: string): PrivataDeps {
  return {
    remoteUrl: () => bare,
    visibility: async () => visibility,
    git,
    cacheDir,
    env: { GIT_AUTHOR_NAME: "Metiejo Test", GIT_AUTHOR_EMAIL: "metiejo@example.invalid" },
  };
}

const remoteFiles = (): string[] => {
  try {
    return git(["ls-tree", "-r", "--name-only", "HEAD"], bare).split("\n").filter(Boolean);
  } catch {
    return [];
  }
};

describe("privataState (§4.5: without FM_TIPAROJ_REPO the upload is locked)", () => {
  it("is locked with one sentence why when the variable is empty", () => {
    const state = privataState({ present: [] });
    expect(state.locked).toBe(true);
    expect(state.sentence).toMatch(/FM_TIPAROJ_REPO/);
    expect(state.sentence).toMatch(/\.env/);
  });

  it("is open with the repository set, and the sentence names the variable, never the repository", () => {
    const state = privataState({ tiparojRepo: REPO, present: ["FM_TIPAROJ_REPO"] });
    expect(state.locked).toBe(false);
    expect(state.sentence).toMatch(/FM_TIPAROJ_REPO/);
    expect(state.sentence).not.toContain(REPO);
  });
});

describe("the cache (§4.5: outside the checkout)", () => {
  it("follows XDG_CACHE_HOME, else the platform's cache folder", () => {
    expect(cacheRootOf({ XDG_CACHE_HOME: "/x/cache" }, "darwin", "/Users/me")).toBe("/x/cache");
    expect(cacheRootOf({}, "darwin", "/Users/me")).toBe("/Users/me/Library/Caches");
    expect(cacheRootOf({}, "linux", "/home/me")).toBe("/home/me/.cache");
  });

  it("names a folder per repository under fundamento/tiparoj without the repository's name", () => {
    const dir = cacheDirOf("/x/cache", REPO);
    expect(dir).toMatch(/^\/x\/cache\/fundamento\/tiparoj\/[0-9a-f]{12,}$/);
    expect(dir).not.toContain("owner");
    expect(cacheDirOf("/x/cache", REPO)).toBe(dir);
    expect(cacheDirOf("/x/cache", "other/repo")).not.toBe(dir);
  });
});

describe("uploadFont (§4.5)", () => {
  const bytes = Buffer.from(`woff2-bytes-of-a-test-font-${"x".repeat(200)}`);

  it("refuses to push when the repository is public, with a sentence why, and the remote stays empty", async () => {
    const cache = join(scratch, "cache-public");
    const result = await uploadFont(
      REPO,
      deps("public", cache),
      { name: "Marke-Sans.woff2", bytes },
      "Marke Sans",
    );
    expect(result.pushed).toBe(false);
    expect(result.sentence).toMatch(/öffentlich/);
    expect(result.sentence).not.toContain(REPO);
    expect(remoteFiles()).toEqual([]);
  });

  it("refuses to push when the visibility cannot be determined", async () => {
    const cache = join(scratch, "cache-unknown");
    const result = await uploadFont(
      REPO,
      deps("unknown", cache),
      { name: "Marke-Sans.woff2", bytes },
      "Marke Sans",
    );
    expect(result.pushed).toBe(false);
    expect(result.sentence).toMatch(/nicht feststellen/);
    expect(remoteFiles()).toEqual([]);
  });

  it("commits and pushes into the private repository under tiparoj/<family>/, the sentence without the name", async () => {
    const cache = join(scratch, "cache-private");
    const result = await uploadFont(
      REPO,
      deps("private", cache),
      { name: "Marke-Sans.woff2", bytes },
      "Marke Sans",
    );
    expect(result.pushed).toBe(true);
    expect(result.path).toBe("tiparoj/marke-sans/Marke-Sans.woff2");
    expect(result.sentence).not.toContain(REPO);
    expect(remoteFiles()).toEqual(["tiparoj/marke-sans/Marke-Sans.woff2"]);
    expect(git(["log", "-1", "--format=%s"], bare)).toContain("Marke Sans");
  });

  it("a second cache syncs from the remote and lists the font with its bytes", async () => {
    const cache = join(scratch, "cache-second");
    mkdirSync(cache, { recursive: true });
    const dir = await syncCache(REPO, deps("private", cache));
    expect(existsSync(join(dir, "tiparoj", "marke-sans", "Marke-Sans.woff2"))).toBe(true);
    const fonts = listCachedFonts(dir);
    expect(fonts.map((font) => font.family)).toEqual(["marke-sans"]);
    expect(fonts[0]?.bytes.equals(bytes)).toBe(true);
    // Syncing again is idempotent.
    expect(await syncCache(REPO, deps("private", cache))).toBe(dir);
  });
});

// Spec 036 6.6 (D-22): the private font repository stays as it is. The public repo reaches it only
// through FM_TIPAROJ_REPO; its clone lies in the hash folder of the cache (the place it always had),
// derived from the variable, never from a name in the code. A FM_TIPAROJ_DIR changes nothing.
describe("Spec 036 6.6: the clone of the private repository (D-22)", () => {
  const ATTRAPPE = "beispiel/schriften-attrappe";
  const remote = join(scratch, "attrappe-remote.git");
  execFileSync("git", ["init", "--bare", "-q", "-b", "main", remote]);
  const work = join(scratch, "attrappe-work");
  execFileSync("git", ["clone", "-q", remote, work]);
  mkdirSync(join(work, "tiparoj", "attrappe-sans"), { recursive: true });
  writeFileSync(join(work, "tiparoj", "attrappe-sans", "Attrappe-Sans.woff2"), "attrappe-bytes");
  git(["add", "."], work);
  git(
    ["-c", "user.name=Attrappe", "-c", "user.email=attrappe@example.invalid", "commit", "-qm", "x"],
    work,
  );
  git(["push", "-q", "origin", "HEAD:main"], work);

  it("with only FM_TIPAROJ_REPO the clone lies in the hash folder of the cache and lists its fonts", async () => {
    const cacheRoot = join(scratch, "attrappe-cache");
    const dir = await syncCache(ATTRAPPE, {
      ...deps("private", cacheDirOf(cacheRoot, ATTRAPPE)),
      remoteUrl: () => remote,
    });
    expect(dir).toBe(cacheDirOf(cacheRoot, ATTRAPPE));
    expect(dir.slice(cacheRoot.length)).toMatch(/^\/fundamento\/tiparoj\/[0-9a-f]{16}$/);
    expect(listCachedFonts(dir).map((font) => font.family)).toEqual(["attrappe-sans"]);
  });

  it("the default clone follows the variable, and an unknown FM_TIPAROJ_DIR does not move it", () => {
    const before = defaultDeps(ATTRAPPE).cacheDir;
    expect(before).toBe(
      cacheDirOf(cacheRootOf(process.env, process.platform, homedir()), ATTRAPPE),
    );
    const saved = process.env.FM_TIPAROJ_DIR;
    process.env.FM_TIPAROJ_DIR = join(scratch, "attrappe-ordner");
    try {
      expect(defaultDeps(ATTRAPPE).cacheDir).toBe(before);
    } finally {
      if (saved === undefined) delete process.env.FM_TIPAROJ_DIR;
      else process.env.FM_TIPAROJ_DIR = saved;
    }
  });

  it("without the variable the sentence is the one of today, word for word", () => {
    expect(privataState({ present: [] }).sentence).toBe(
      "Lizenzierte Schriften brauchen dein privates Repo: Trage FM_TIPAROJ_REPO (owner/name) in die .env im Wurzelordner des Checkouts ein und starte den Konfigurator neu.",
    );
  });
});
