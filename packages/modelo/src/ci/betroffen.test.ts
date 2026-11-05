// Spec 040 T-6 (C-2, B-3, E-7, E-8, US-5): scripts/ci/betroffen.mjs decides which packages a change
// touches and which engines it needs. The decision is pure and tested case by case; the edges (git
// and Turborepo) are tested once against the real workspace graph, copied into a git repository
// of its own under the system's temp directory: only metiejo changed gives metiejo and the three
// packages that depend on it, never projekcioj or eroj.
import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ALL_ENGINES,
  CHROMIUM,
  collect,
  type Decision,
  decide,
  EXIT_OK,
  EXIT_USAGE,
  FULL_EVENTS,
  globToRegExp,
  isRootFile,
  main,
  needsAllEngines,
  outputLines,
  ROOT_FILES,
  readingPackages,
  rootTestInputs,
  testArgs,
} from "../../../../scripts/ci/betroffen.mjs";

const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const turbo: unknown = JSON.parse(readFileSync(`${repoRoot}turbo.json`, "utf8"));
const inputs = rootTestInputs(turbo);

const METIEJO_AND_DEPENDENTS = [
  "@fundamento/cli",
  "@fundamento/ekranoj",
  "@fundamento/metiejo",
  "@fundamento/nordstelo",
];
const WORKSPACE = [
  ...METIEJO_AND_DEPENDENTS,
  "@fundamento/eroj",
  "@fundamento/modelo",
  "@fundamento/projekcioj",
];

/** A pull request against a known base. */
function pr(changed: readonly string[], affected: readonly string[] = []): Decision {
  return decide({
    event: "pull_request",
    base: "abc",
    changed,
    affected,
    workspace: WORKSPACE,
    inputs,
  });
}

describe("the decision of betroffen.mjs (pure)", () => {
  it.each([...FULL_EVENTS, "merge_group", ""])(
    "tests every package in every engine on %j",
    (event) => {
      const decision = decide({
        event,
        base: "abc",
        changed: ["packages/metiejo/src/a.ts"],
        workspace: WORKSPACE,
      });
      expect(decision.alle).toBe(true);
      expect(decision.engines).toBe(ALL_ENGINES);
      expect(decision.pakete).toEqual([...WORKSPACE].sort());
    },
  );

  it("tests everything when the merge base is unknown (E-7)", () => {
    const decision = decide({ event: "pull_request", workspace: WORKSPACE });
    expect(decision).toMatchObject({ alle: true, engines: ALL_ENGINES });
    expect(decision.gruende.join("\n")).toContain("E-7");
  });

  it.each([
    ...ROOT_FILES,
    ".github/workflows/ci.yml",
    ".github/workflows/release.yml",
    "scripts/ci/betroffen.mjs",
    "scripts/release-kits.sh",
  ])("tests every package when the root file %s changed (E-8)", (file) => {
    expect(isRootFile(file)).toBe(true);
    const decision = pr(["packages/metiejo/src/a.ts", file], ["@fundamento/metiejo"]);
    expect(decision.alle).toBe(true);
    expect(decision.pakete).toEqual([...WORKSPACE].sort());
    expect(decision.gruende.join("\n")).toContain("E-8");
    // A root file alone says nothing about the engines (B-3).
    expect(decision.engines).toBe(CHROMIUM);
  });

  it.each([
    "packages/metiejo/package.json",
    "packages/scripts/x.ts",
    ".github/CODEOWNERS",
    "specs/040-ci-schneller/plan.md",
    "README.md",
  ])("does not count %s as a root file", (file) => {
    expect(isRootFile(file)).toBe(false);
  });

  it("tests only the affected packages on a pull request, in Chromium", () => {
    const decision = pr(["packages/metiejo/src/ident.ts"], METIEJO_AND_DEPENDENTS);
    expect(decision).toMatchObject({
      alle: false,
      pakete: METIEJO_AND_DEPENDENTS,
      engines: CHROMIUM,
    });
  });

  it.each([
    "packages/eroj/src/butono.tsx",
    "packages/eroj/test/vitrino.check.ts",
    "packages/projekcioj/src/index.ts",
    "packages/vortaro/sets/core.json",
    "packages/aspekto-komuna/aspekto.json",
    "packages/aspekto-komuna-0-2/sets/a.json",
    "packages/eroj/playwright.config.ts",
    "packages/eroj/playwright.alirebleco.config.ts",
    "packages/metiejo/playwright.config.ts",
  ])("runs all three engines when %s changed (B-3, V-8)", (file) => {
    expect(needsAllEngines(file)).toBe(true);
    expect(pr(["packages/metiejo/src/a.ts", file]).engines).toBe(ALL_ENGINES);
  });

  it.each([
    "packages/metiejo/src/ident.ts",
    "packages/cli/src/index.ts",
    "packages/modelo/data/ids.lock.json",
    "packages/aspekto.md",
    "specs/040-ci-schneller/plan.md",
    "packages/eroj-neu/x.ts",
  ])("stays in Chromium when only %s changed", (file) => {
    expect(needsAllEngines(file)).toBe(false);
    expect(pr([file]).engines).toBe(CHROMIUM);
  });

  it("adds the packages whose test hashes a changed file from outside the package (turbo.json inputs)", () => {
    expect(readingPackages(["README.md"], inputs)).toEqual(["@fundamento/modelo"]);
    expect(readingPackages(["specs/024-studio/plan.md"], inputs)).toEqual([
      "@fundamento/metiejo",
      "@fundamento/modelo",
    ]);
    expect(readingPackages(["packages/eroj/test/vitrino-partoj.ts"], inputs)).toEqual([
      "@fundamento/modelo",
    ]);
    expect(readingPackages(["packages/cli/package.json"], inputs)).toEqual([
      "@fundamento/projekcioj",
    ]);
    // Negated inputs stay out.
    expect(readingPackages([".env"], inputs)).toEqual([]);
    expect(readingPackages(["packages/metiejo/src/ident.ts"], inputs)).toEqual([]);
    // Only the reading package, not its dependents: the build it hands on did not change.
    const decision = pr(["specs/037-agenten-ekranoj/spec.md"]);
    expect(decision).toMatchObject({
      alle: false,
      pakete: ["@fundamento/ekranoj", "@fundamento/modelo"],
    });
  });

  it("reads the root inputs of every #test task of turbo.json", () => {
    expect(inputs["@fundamento/modelo"]).toEqual(
      expect.arrayContaining(["*", "specs/**", "!.env"]),
    );
    expect(Object.keys(inputs)).not.toContain("test");
    expect(
      rootTestInputs({ tasks: { "a#test": { inputs: ["$TURBO_DEFAULT$", "src/**"] } } }),
    ).toEqual({});
    expect(rootTestInputs(undefined)).toEqual({});
  });

  it("matches globs as Turborepo does: ** across directories, * and ? within one", () => {
    expect(globToRegExp("*").test(".npmrc")).toBe(true);
    expect(globToRegExp("*").test("docs/a.md")).toBe(false);
    expect(globToRegExp("specs/**").test("specs/040/plan.md")).toBe(true);
    expect(globToRegExp("specs/**").test("specs2/x")).toBe(false);
    expect(globToRegExp("scripts/**/node_modules/**").test("scripts/node_modules/a/b.js")).toBe(
      true,
    );
    expect(globToRegExp("packages/*/package.json").test("packages/cli/package.json")).toBe(true);
    expect(globToRegExp("packages/*/package.json").test("packages/a/b/package.json")).toBe(false);
    expect(globToRegExp("scripts/neutrale-namen/*.mjs").test("scripts/neutrale-namen/a.mjs")).toBe(
      true,
    );
    expect(globToRegExp("a?c.json").test("abc.json")).toBe(true);
  });

  it("writes the three outputs of C-2 for $GITHUB_OUTPUT", () => {
    expect(outputLines(pr(["packages/metiejo/src/a.ts"], METIEJO_AND_DEPENDENTS))).toBe(
      [`pakete=${JSON.stringify(METIEJO_AND_DEPENDENTS)}`, "alle=false", "engines=chromium"].join(
        "\n",
      ),
    );
    expect(outputLines(decide({ event: "push", workspace: [] }))).toBe(
      ["pakete=[]", "alle=true", `engines=${ALL_ENGINES}`].join("\n"),
    );
  });

  it("runs turbo run test on the affected packages, on all of them, or on none", () => {
    expect(
      testArgs(pr(["packages/metiejo/src/a.ts"], ["@fundamento/cli", "@fundamento/metiejo"])),
    ).toEqual([
      "run",
      "test",
      "--output-logs=errors-only",
      "--filter=@fundamento/cli",
      "--filter=@fundamento/metiejo",
    ]);
    // Spec 040 T-7: Turborepo shows the logs of failed tasks only, as in CI.
    expect(testArgs(decide({ event: "push", workspace: WORKSPACE }))).toEqual([
      "run",
      "test",
      "--output-logs=errors-only",
    ]);
    expect(testArgs(pr([]))).toBeUndefined();
  });
});

describe("betroffen.mjs on the command line", () => {
  function io(env: Record<string, string | undefined> = {}) {
    const out: string[] = [];
    const err: string[] = [];
    return {
      out,
      err,
      io: {
        stdout: (text: string) => out.push(text),
        stderr: (text: string) => err.push(text),
        env,
      },
    };
  }

  it("refuses unknown options and --ausfuehren without --lokal", () => {
    const unknown = io();
    expect(main(["--alle"], unknown.io)).toBe(EXIT_USAGE);
    expect(unknown.err.join("")).toContain('Unknown option: "--alle"');
    const alone = io();
    expect(main(["--ausfuehren"], alone.io)).toBe(EXIT_USAGE);
    expect(alone.err.join("")).toContain("--ausfuehren needs --lokal");
  });

  it("is what pnpm test:betroffen runs", () => {
    const pkg = JSON.parse(readFileSync(`${repoRoot}package.json`, "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts["test:betroffen"]).toBe(
      "node scripts/ci/betroffen.mjs --lokal --ausfuehren",
    );
  });
});

describe("betroffen.mjs against the real workspace graph, in a git repository of its own", () => {
  let root = "";
  const env = { GITHUB_EVENT_NAME: "pull_request", GITHUB_BASE_REF: "main" };

  function git(...args: string[]): string {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  }

  function commit(message: string): void {
    git("add", "-A");
    git("-c", "user.name=t", "-c", "user.email=t@example.invalid", "commit", "-q", "-m", message);
  }

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), "fm-betroffen-"));
    // The workspace graph: the root manifests and every package's manifest, nothing else.
    const manifests = execFileSync(
      "git",
      [
        "ls-files",
        "--",
        "package.json",
        "pnpm-workspace.yaml",
        "pnpm-lock.yaml",
        "turbo.json",
        "packages/*/package.json",
      ],
      { cwd: repoRoot, encoding: "utf8" },
    )
      .split("\n")
      .filter((path) => path !== "");
    for (const path of manifests) {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), readFileSync(join(repoRoot, path)));
    }
    git("init", "-q", "-b", "main");
    commit("base");
    // origin is the repository itself, so `--lokal` can fetch origin/main.
    git("remote", "add", "origin", root);
    git("fetch", "-q", "origin");
    git("switch", "-q", "-c", "probe");
    mkdirSync(join(root, "packages/metiejo/src"), { recursive: true });
    writeFileSync(join(root, "packages/metiejo/src/probe.ts"), "// probe\n");
    commit("metiejo only");
  });

  afterAll(() => {
    if (root !== "") rmSync(root, { recursive: true, force: true });
  });

  it("a pull request that changes only metiejo tests metiejo, ekranoj, cli and nordstelo – not projekcioj, not eroj (AC-B3)", () => {
    const { decision } = collect({ env, cwd: root });
    expect(decision).toMatchObject({
      alle: false,
      pakete: METIEJO_AND_DEPENDENTS,
      engines: CHROMIUM,
    });
  });

  it("--lokal counts uncommitted and untracked changes against origin/main", () => {
    writeFileSync(join(root, "packages/eroj/neu.ts"), "// untracked\n");
    try {
      const { decision } = collect({ lokal: true, cwd: root });
      expect(decision.alle).toBe(false);
      expect(decision.pakete).toEqual(
        expect.arrayContaining([...METIEJO_AND_DEPENDENTS, "@fundamento/eroj"]),
      );
      expect(decision.pakete).not.toContain("@fundamento/projekcioj");
      expect(decision.engines).toBe(ALL_ENGINES);
    } finally {
      rmSync(join(root, "packages/eroj/neu.ts"));
    }
  });

  it("writes pakete, alle and engines to $GITHUB_OUTPUT and the reason to the step summary", () => {
    const output = join(root, "..", `${root.split("/").at(-1)}-output`);
    const summary = `${output}-summary`;
    try {
      const lines: string[] = [];
      const code = main([], {
        stdout: (text) => lines.push(text),
        stderr: (text) => lines.push(text),
        env: { ...env, GITHUB_OUTPUT: output, GITHUB_STEP_SUMMARY: summary },
        cwd: root,
      });
      expect(code).toBe(EXIT_OK);
      expect(readFileSync(output, "utf8")).toBe(
        `pakete=${JSON.stringify(METIEJO_AND_DEPENDENTS)}\nalle=false\nengines=chromium\n`,
      );
      expect(readFileSync(summary, "utf8")).toContain("@fundamento/metiejo");
    } finally {
      rmSync(output, { force: true });
      rmSync(summary, { force: true });
    }
  });

  it("tests everything when the base branch cannot be found (E-7)", () => {
    const log: string[] = [];
    const { decision } = collect({
      env: { ...env, GITHUB_BASE_REF: "gibt-es-nicht" },
      cwd: root,
      log: (line) => log.push(line),
    });
    expect(decision).toMatchObject({ alle: true, engines: ALL_ENGINES });
    expect(decision.pakete).toEqual(expect.arrayContaining(WORKSPACE));
    expect(log.join("\n")).toContain("no merge base with origin/gibt-es-nicht");
  });

  it("tests everything when pnpm-lock.yaml changed (E-8)", () => {
    appendFileSync(join(root, "pnpm-lock.yaml"), "\n");
    commit("lockfile");
    const { decision } = collect({ env, cwd: root });
    expect(decision.alle).toBe(true);
    expect(decision.gruende.join("\n")).toContain("pnpm-lock.yaml");
  });

  it("runs turbo run test with FM_AUSGABE=knapp on the affected set (pnpm test:betroffen)", () => {
    git("reset", "-q", "--hard", "HEAD~1");
    const calls: Array<{
      args: readonly string[];
      env: Readonly<Record<string, string | undefined>>;
    }> = [];
    const code = main(["--lokal", "--ausfuehren"], {
      stdout: () => {},
      stderr: () => {},
      env: {},
      cwd: root,
      run: (args, childEnv) => {
        calls.push({ args, env: childEnv });
        return 0;
      },
    });
    expect(code).toBe(0);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.args).toEqual([
      "run",
      "test",
      "--output-logs=errors-only",
      ...METIEJO_AND_DEPENDENTS.map((n) => `--filter=${n}`),
    ]);
    expect(calls[0]?.env.FM_AUSGABE).toBe("knapp");
    expect(calls[0]?.env.PLAYWRIGHT_ENGINES).toBe(CHROMIUM);
  });
});
