// check:privat (Spec 036 Teil 6, 6.4, D-10, D-23). The fixtures are temporary git repositories:
// a file with an old name composed at run time makes the check fail with rule and path, a clean
// one passes. Nothing here names an old name in plain text; the hashes of the check are proven
// against the names the codemod composes.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { EXCEPTIONS_FILE, oldNames } from "../../../../../scripts/neutrale-namen/rules.mjs";
import { CHECK_NAMES } from "../../contracts/checks.js";
import { RULE_IDS } from "../../contracts/issues.js";
import { HELP } from "../run.js";
import { check, ESCEPOJ, FONT_REPO, findPrivateNames, hasPrivateName, WORD } from "./index.js";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));
const old = oldNames();
const w = old.word;
const sha256 = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");

const tempDirs: string[] = [];
afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** A temporary git repository with `files` tracked (added to the index). */
function gitRepo(files: Record<string, string | Buffer>): string {
  const root = join(mkdtempSync(join(tmpdir(), "fm-privat-")), "repo");
  tempDirs.push(dirname(root));
  mkdirSync(root);
  execFileSync("git", ["init", "-q"], { cwd: root });
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  execFileSync("git", ["add", "-A"], { cwd: root });
  return root;
}

const rulesAndPaths = (issues: { rule: string; path: string }[]) =>
  issues.map(({ rule, path }) => ({ rule, path }));

describe("what check:privat looks for (D-23)", () => {
  it("knows the old names only by hash, the hashes of the names the codemod composes", () => {
    expect(WORD.sha256).toBe(sha256(w));
    expect(WORD.longo).toBe(w.length);
    expect(FONT_REPO.sha256).toBe(sha256(old.fontRepoName));
    expect(FONT_REPO.longo).toBe(old.fontRepoName.length);
    for (const sought of [WORD, FONT_REPO]) {
      expect(RULE_IDS).toContain(sought.rule);
      expect(sought.kialo.length, sought.nomo).toBeGreaterThan(60);
    }
  });

  it("holds no old name in plain text in its sources, tests and data", () => {
    const dir = fileURLToPath(new URL("./", import.meta.url));
    const names = readdirSync(dir);
    expect(names).toEqual(expect.arrayContaining(["index.ts", "rules.ts", "escepoj.json"]));
    for (const name of names) {
      const text = readFileSync(join(dir, name), "utf8");
      expect(text.toLowerCase(), name).not.toContain(w);
      expect(hasPrivateName(text), name).toBe(false);
    }
  });

  it("finds the word in every form the repo used it: key, IDs, ontology, text, inside a word", () => {
    const texts = [
      `"${old.extensionKey}": {`,
      `"$id": "${old.schemaBase}modelo.schema.json"`,
      `"uri": "${old.ontologioBase}#Aspekto"`,
      `Abnahme ${w.toUpperCase()}.`,
      String.raw`/\b${w}\b/`,
      `x${w}y`,
    ];
    for (const text of texts) {
      expect(
        findPrivateNames(text).map((hit) => hit.rule),
        text,
      ).toEqual(["privat-vorto"]);
    }
    expect(findPrivateNames(`ci-${w.slice(0, 5)} ${w.slice(5)}`)).toEqual([]);
    expect(findPrivateNames("fundamento urn:fundamento:schema:modelo privata")).toEqual([]);
  });

  it("tells the private font repository from the word, and where it starts", () => {
    const text = `repo \`${old.fontRepoFull}\`, folder ${old.fontRepoName.toUpperCase()}/`;
    expect(findPrivateNames(text)).toEqual([
      { rule: "privat-repo", offset: text.indexOf(old.fontRepoName) },
      { rule: "privat-repo", offset: text.indexOf(old.fontRepoName.toUpperCase()) },
    ]);
  });
});

describe("check:privat on fixtures", () => {
  it("fails on a file with a composed old name, with rule and path of the first hit", async () => {
    const root = gitRepo({
      "a/ok.md": "nothing to see\n",
      "b/set.json": `{\n  "$extensions": { "${old.extensionKey}": {} },\n  "x": "${w}"\n}\n`,
      "c/plan.md": `line one\nthe repo ${old.fontRepoFull} and ${w}\n`,
    });
    const result = await check({ json: true, repoRoot: root });
    expect(result.ok).toBe(false);
    expect(rulesAndPaths(result.errors)).toEqual([
      { rule: "privat-vorto", path: "b/set.json:2:25" },
      { rule: "privat-vorto", path: "c/plan.md:2:52" },
      { rule: "privat-repo", path: "c/plan.md:2:18" },
    ]);
    expect(result.stats).toMatchObject({ files: 3, filesWithHits: 2, hits: 4, exceptions: 0 });
    for (const issue of result.errors) {
      expect(issue.severity).toBe("error");
      expect(issue.message.toLowerCase()).not.toContain(w);
      expect(issue.suggestion).toContain("scripts/neutrale-namen/codemod.mjs");
    }
    expect(result.errors[0]?.message).toContain("2 time(s)");
  });

  it("passes on a clean fixture and through --fixture", async () => {
    const root = gitRepo({
      "a.md": "fundamento urn:fundamento:schema:modelo urn:fundamento:ontologio#Aspekto\n",
      "b.json": '{ "fundamento": { "id": "tok_1" } }\n',
    });
    const result = await check({ json: true, repoRoot: "/nowhere", fixture: root });
    expect(result).toMatchObject({ check: "privat", ok: true, errors: [], warnings: [] });
    expect(result.stats.files).toBe(2);
  });

  it("scans only tracked files: an untracked or ignored file does not count", async () => {
    const root = gitRepo({ ".gitignore": "ignored.md\n", "a.md": "clean\n" });
    writeFileSync(join(root, "ignored.md"), `${w}\n`);
    writeFileSync(join(root, "untracked.md"), `${w}\n`);
    expect((await check({ json: true, repoRoot: root })).ok).toBe(true);
  });

  it("skips a listed verbatim copy only while its SHA-256 is the pinned one", async () => {
    const entry = ESCEPOJ.find((item) => existsIn(repoRoot, item.path));
    if (entry === undefined) throw new Error("no listed exception exists in the repo");
    const verbatim = readFileSync(join(repoRoot, entry.path));
    expect(sha256(verbatim)).toBe(entry.sha256);
    const exact = gitRepo({ [entry.path]: verbatim });
    const kept = await check({ json: true, repoRoot: exact });
    expect(kept.ok).toBe(true);
    expect(kept.stats).toMatchObject({ files: 0, exceptions: 1 });
    const edited = gitRepo({ [entry.path]: Buffer.concat([verbatim, Buffer.from(`\n${w}\n`)]) });
    const flagged = await check({ json: true, repoRoot: edited });
    expect(flagged.ok).toBe(false);
    expect(flagged.stats.exceptionsChanged).toBe(1);
    expect(flagged.errors[0]?.message).toContain("no longer the pinned one");
  });

  it("is fine with a listed file that is missing", async () => {
    const result = await check({ json: true, repoRoot: gitRepo({ "a.md": "clean\n" }) });
    expect(result.ok).toBe(true);
    expect(result.stats.exceptionsMissing).toBe(ESCEPOJ.length);
  });
});

function existsIn(root: string, path: string): boolean {
  try {
    readFileSync(join(root, path));
    return true;
  } catch {
    return false;
  }
}

describe("the exception list (D-23)", () => {
  const docsTests = [
    "packages/modelo/src/docs/docs.test.ts",
    "packages/metiejo/src/docs.test.ts",
    "packages/metiejo/src/docs-024.test.ts",
  ];
  const pinned = new Set(
    docsTests
      .flatMap((path) => [
        ...readFileSync(join(repoRoot, path), "utf8").matchAll(/\b[0-9a-f]{64}\b/g),
      ])
      .map((match) => match[0]),
  );

  it("lists only verbatim spec copies pinned by SHA-256 in the docs tests, each with a reason", () => {
    expect(ESCEPOJ.length).toBeGreaterThan(0);
    const paths = ESCEPOJ.map((entry) => entry.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const entry of ESCEPOJ) {
      expect(entry.path, entry.path).toMatch(/^(specs\/\d{3}-[a-z0-9-]+|research)\/[^/]+\.md$/);
      expect(entry.sha256, entry.path).toMatch(/^[0-9a-f]{64}$/);
      expect(entry.kialo.length, entry.path).toBeGreaterThan(60);
      // The source spec of Spec 036 is pinned by AC-1 (its docs test lives on the Teil-1 branch).
      if (entry.path === "specs/036-assistent-buehne/spec.md") {
        expect(entry.sha256).toBe(
          "a0cc66beda58be0bcc0a4dcaf28179cd178d4ec3ed79afa51bdddfea1c55acfa",
        );
      } else {
        expect(pinned.has(entry.sha256), entry.path).toBe(true);
      }
    }
  });

  it("is the list the codemod skips", () => {
    expect(EXCEPTIONS_FILE).toBe("packages/modelo/src/checks/privat/escepoj.json");
    const shared = JSON.parse(readFileSync(join(repoRoot, EXCEPTIONS_FILE), "utf8")) as {
      escepoj: unknown;
    };
    expect(shared.escepoj).toEqual(ESCEPOJ);
  });

  it("names only files that still hold an old name where they exist", () => {
    for (const entry of ESCEPOJ) {
      if (!existsIn(repoRoot, entry.path)) continue;
      expect(hasPrivateName(readFileSync(join(repoRoot, entry.path), "utf8")), entry.path).toBe(
        true,
      );
    }
  });
});

describe("check:privat in the runner (D-10)", () => {
  it("is a registered check with a summary in the help", () => {
    expect(CHECK_NAMES).toContain("privat");
    expect(HELP).toMatch(/ {2}privat {8}\S/);
  });
});
