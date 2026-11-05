// Licensed fonts in the maintainer's private repository (Spec 023, §4.5). Its name comes from
// FM_TIPAROJ_REPO alone and stands in no file of the public repo and in no sentence of the app —
// the sentences name the variable. The app clones the repository into a cache outside the
// checkout, commits an upload and pushes with the maintainer's own git credentials, and only after
// the GitHub API said the repository is private; public or unknown means no push, with one
// sentence why. Everything that touches git, the API and the disk goes through `PrivataDeps`, so
// the tests run against a local bare repository and a fake visibility check.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { Settings } from "./env.js";
import { isFontFile } from "./kontrolo.js";
import { safeFilename } from "./marko.js";

export type Visibility = "private" | "public" | "unknown";

export interface PrivataDeps {
  /** The URL git clones the repository from. */
  remoteUrl(repo: string): string;
  /** Whether the repository is private, asked of the GitHub API; unknown when that fails. */
  visibility(repo: string): Promise<Visibility>;
  /** Runs git with arguments in a directory and returns its stdout. */
  git(args: readonly string[], cwd: string): string;
  /** The clone of the repository, outside the checkout. */
  cacheDir: string;
  /** Extra environment for git (tests give an author; the maintainer's config is used otherwise). */
  env: Record<string, string>;
}

export interface PrivataState {
  locked: boolean;
  sentence: string;
}

/** Whether a licensed font may be uploaded at all (§4.5: no repository, no upload). */
export function privataState(settings: Settings): PrivataState {
  if (settings.tiparojRepo === undefined) {
    return {
      locked: true,
      sentence:
        "Lizenzierte Schriften brauchen dein privates Repo: Trage FM_TIPAROJ_REPO (owner/name) in die .env im Wurzelordner des Checkouts ein und starte den Konfigurator neu.",
    };
  }
  return {
    locked: false,
    sentence:
      "Eine hochgeladene lizenzierte Schrift geht nach deiner Bestätigung in dein privates Repo (FM_TIPAROJ_REPO). Die Marke nennt sie nur mit Namen; die Datei bleibt dort.",
  };
}

/** The cache folder of the person: XDG first, else the platform's. */
export function cacheRootOf(
  env: Readonly<Record<string, string | undefined>>,
  platform: string,
  home: string,
): string {
  const xdg = env.XDG_CACHE_HOME;
  if (xdg !== undefined && xdg !== "") return xdg;
  return platform === "darwin" ? join(home, "Library", "Caches") : join(home, ".cache");
}

/** The clone of a repository below the cache root: a hash, so the folder name carries no repository name. */
export function cacheDirOf(cacheRoot: string, repo: string): string {
  const hash = createHash("sha256").update(repo).digest("hex").slice(0, 16);
  return join(cacheRoot, "fundamento", "tiparoj", hash);
}

const runGit = (args: readonly string[], cwd: string, env: Record<string, string> = {}): string =>
  execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();

/** Asks the GitHub API through the person's `gh` login; anything but a clear answer is unknown. */
async function ghVisibility(repo: string): Promise<Visibility> {
  try {
    const answer = execFileSync("gh", ["api", `repos/${repo}`, "--jq", ".private"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return answer === "true" ? "private" : answer === "false" ? "public" : "unknown";
  } catch {
    return "unknown";
  }
}

/** The dependencies of the maintainer's machine: GitHub over https, `gh` for the API, the person's cache. */
export function defaultDeps(repo: string): PrivataDeps {
  return {
    remoteUrl: (name) => `https://github.com/${name}.git`,
    visibility: ghVisibility,
    git: runGit,
    cacheDir: cacheDirOf(cacheRootOf(process.env, process.platform, homedir()), repo),
    env: {},
  };
}

function remoteBranch(deps: PrivataDeps, dir: string): string {
  try {
    const ref = deps.git(["symbolic-ref", "--short", "refs/remotes/origin/HEAD"], dir);
    return ref.replace(/^origin\//, "") || "main";
  } catch {
    return "main";
  }
}

/** The clone of the repository in the cache, fetched to the remote's state; created where it is missing. */
export async function syncCache(repo: string, deps: PrivataDeps): Promise<string> {
  const dir = deps.cacheDir;
  if (existsSync(join(dir, ".git"))) {
    deps.git(["fetch", "-q", "origin"], dir);
    const branch = remoteBranch(deps, dir);
    try {
      deps.git(["reset", "-q", "--hard", `origin/${branch}`], dir);
    } catch {
      // An empty remote has no branch yet; the clone stays as it is.
    }
    return dir;
  }
  mkdirSync(dirname(dir), { recursive: true });
  deps.git(["clone", "-q", deps.remoteUrl(repo), dir], dirname(dir));
  return dir;
}

const slug = (family: string): string =>
  family
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function identityArgs(deps: PrivataDeps, dir: string): string[] {
  const own = (key: string): string => {
    try {
      return deps.git(["config", key], dir);
    } catch {
      return "";
    }
  };
  const name = deps.env.GIT_AUTHOR_NAME ?? own("user.name");
  const email = deps.env.GIT_AUTHOR_EMAIL ?? own("user.email");
  return [
    "-c",
    `user.name=${name === "" ? "Fundamento Metiejo" : name}`,
    "-c",
    `user.email=${email === "" ? "metiejo@fundamento.invalid" : email}`,
  ];
}

export interface UploadResult {
  pushed: boolean;
  sentence: string;
  /** The path inside the repository, when pushed. */
  path?: string;
}

/**
 * Puts a licensed font into the private repository under `tiparoj/<family>/<file>`: visibility
 * first — only a private repository takes a push —, then clone or fetch, commit and push with the
 * person's own git credentials. The sentences name the variable, never the repository.
 */
export async function uploadFont(
  repo: string,
  deps: PrivataDeps,
  file: { name: string; bytes: Buffer },
  family: string,
): Promise<UploadResult> {
  const visibility = await deps.visibility(repo);
  if (visibility === "public") {
    return {
      pushed: false,
      sentence:
        "Kein Push: Das Repo aus FM_TIPAROJ_REPO ist öffentlich. Lizenzierte Schriften gehen nur in ein privates Repo.",
    };
  }
  if (visibility === "unknown") {
    return {
      pushed: false,
      sentence:
        "Kein Push: Ob das Repo aus FM_TIPAROJ_REPO privat ist, lässt sich nicht feststellen (GitHub-API nicht erreichbar oder gh nicht angemeldet).",
    };
  }
  const dir = await syncCache(repo, deps);
  const safe = safeFilename(file.name);
  if (safe === "" || !isFontFile(safe)) {
    return {
      pushed: false,
      sentence: `Kein Push: ${JSON.stringify(file.name)} ist keine Schriftdatei.`,
    };
  }
  const relative = `tiparoj/${slug(family)}/${safe}`;
  const target = join(dir, relative);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, file.bytes);
  deps.git(["add", "--", relative], dir);
  deps.git(
    [...identityArgs(deps, dir), "commit", "-q", "-m", `Metiejo: Schrift ${family} (${safe})`],
    dir,
  );
  deps.git(["push", "-q", "origin", `HEAD:${remoteBranch(deps, dir)}`], dir);
  return {
    pushed: true,
    path: relative,
    sentence: `Die Schrift ${family} liegt jetzt in deinem privaten Repo (FM_TIPAROJ_REPO) unter ${relative}. Die Marke nennt sie als „lizenziert, nicht enthalten“.`,
  };
}

export interface CachedFont {
  family: string;
  file: string;
  bytes: Buffer;
}

/** The fonts of a clone: `tiparoj/<family>/<file>`, font files only. */
export function listCachedFonts(dir: string): CachedFont[] {
  const root = join(dir, "tiparoj");
  if (!existsSync(root)) return [];
  const fonts: CachedFont[] = [];
  for (const family of readdirSync(root, { withFileTypes: true })) {
    if (!family.isDirectory()) continue;
    for (const entry of readdirSync(join(root, family.name), { withFileTypes: true })) {
      if (entry.isFile() && isFontFile(entry.name)) {
        const file = join(root, family.name, entry.name);
        fonts.push({ family: family.name, file, bytes: readFileSync(file) });
      }
    }
  }
  return fonts.sort((a, b) => a.file.localeCompare(b.file));
}
