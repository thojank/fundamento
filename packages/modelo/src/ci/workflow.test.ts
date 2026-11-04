import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { CHECK_NAMES } from "../contracts/checks.js";

const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const workflowPath = `${repoRoot}.github/workflows/ci.yml`;
const packageJsonPath = `${repoRoot}package.json`;
const mcpPackageJsonPath = `${repoRoot}packages/mcp/package.json`;
const mcpE2eDir = `${repoRoot}packages/mcp/src/e2e/`;
const vitrinoPartojPath = `${repoRoot}packages/eroj/test/vitrino-partoj.ts`;

const CHECK_STEPS: ReadonlyArray<readonly [name: string, script: string]> = [
  ["Check: Vortaro-Lint", "check:vortaro-lint"],
  ["Check: Parity", "check:parity"],
  ["Check: Regularo", "check:regularo"],
  ["Check: Mankoj", "check:mankoj"],
  ["Check: Alirebleco", "check:alirebleco"],
  ["Check: Clean-Room", "check:clean-room"],
  // Spec 014 ① (G3): every installed Aspekto draws every name of the Ikonaro.
  ["Check: Ikonaro", "check:ikonaro"],
  // Spec 029 ① (Constitution v2.4): every value taken from a Fonto points at a pinned Fonto with
  // its licence text, and its provenance matches the Aspekto.
  ["Check: Fontoj", "check:fontoj"],
  // Spec 036 Teil 5 ③: every Uzo has the documentation fields of its Vitrino page.
  ["Check: Dokumentaro", "check:dokumentaro"],
  // Spec 036 Teil 6 (6.4, D-10): no versioned file names the word of R-12 or the private font
  // repository; the check knows both only by hash.
  ["Check: Privat", "check:privat"],
];

/** Rendered checks of the Eroj (Spec 003 T013, plan D-09): axe-core, keyboard, focus, ARIA. */
const ERO_CHECK_STEPS: ReadonlyArray<readonly [name: string, script: string]> = [
  ["Check: Alirebleco (Eroj)", "check:alirebleco-eroj"],
  ["Check: Make Kit", "check:make-kit"],
  // The quickstart installs and builds a project of its own; like the Make Kit check it stays
  // out of the parallel test gate (Spec 003 T027).
  ["Check: Quickstart", "check:quickstart"],
  // The Vitrino needs a projection build of its own before it can be driven (Spec 004 D-09).
  ["Check: Vitrino", "check:vitrino"],
  // The release path itself, as release.yml runs it, packed as a dry run (Spec 003 F23).
  ["Check: Release", "check:release"],
  // Spec 023 (§4.5, M-4): no byte of a licensed font in a public result; runs in the checks job.
  ["Check: Tiparoj", "check:tiparoj"],
];

// Nachlese 3 W1 (Spec 011 ⑤ B-9, O-21): the one job of before ran everything in a row — the
// Playwright suite beside the spawning e2e files of this package made the hook time out, and the
// wall clock stood at 16 to 19 minutes. Three jobs ran side by side from then on: the unit tests
// with lint and the Modelo checks; the rendered Eroj in two Playwright shards; the rendered checks.
// Spec 015 ② (O-4 of plan ①, B-12): the job of the unit tests grew with every Ero past the
// 12-minute line (run 39126240312: 12 min 07 s; its Test step alone 10 min 24 s, the Projekcioj
// suite 622 s of it beside three other packages). The checks are a job of their own now, the
// unit tests of every package but Projekcioj and Eroj another, and the Projekcioj suite runs in
// two Vitest shards — the same cut the Eroj got with W1.
// Spec 025 ③ (B-28): only the engines of the run (PLAYWRIGHT_ENGINES: Chromium on a pull request,
// all three on main) — the apt packages of three engines took 7 min on a cold runner and, with the
// Vitrino check of 40 Eroj, cut the rendered checks off at the 15-minute budget twice.
const PLAYWRIGHT_BROWSERS =
  "pnpm --filter @fundamento/eroj exec playwright install --with-deps $PLAYWRIGHT_ENGINES";

/** The job of the checks: build, perf, lint, the Modelo checks, release. */
const CHECKS_STEPS: ReadonlyArray<readonly [name: string, run: string]> = [
  ["Build", "pnpm build"],
  // AK-07 timings run alone, outside any parallel Turborepo test run (Spec 001 D-17).
  ["Perf", "pnpm perf"],
  ["Lint", "pnpm lint"],
  ...CHECK_STEPS.map(([name, script]) => [name, `pnpm ${script}`] as const),
  ["Check: Release", "pnpm check:release"],
  ["Check: Tiparoj", "pnpm check:tiparoj"],
];

// Nachlese 9 (B-1): the five suites of this job ran side by side on the four vCPU of one runner,
// each with three Vitest workers, and the spawned `fm` of the CLI tests beside them – about 20
// processes on 4 cores. A test that spawns `fm agordilo derive` four times took 8 s on a quiet
// machine and 64 to 126 s on the runner (45 runs since 2026-10-20, without a trend: the same
// commit 65 and 123 s), the export 3 s and 11 to 35 s; the Ero-Tokens did not make a process
// slower. The cut of W1 and B-12 once more: one runner per package.
/** The packages of the unit job, a runner each: every package with tests but Projekcioj and Eroj. */
// Spec 030: the Nordstelo's tests are pure (no browser, no provider) and join the matrix.
const UNIT_PACKAGES = ["agordilo", "cli", "ekranoj", "mcp", "metiejo", "modelo", "nordstelo"];

/** The job of the unit tests: one package per runner (matrix), the Projekcioj and Eroj elsewhere. */
const UNIT_STEPS: ReadonlyArray<readonly [name: string, run: string]> = [
  ["Build", "pnpm build"],
  ["Test", "pnpm turbo run test --filter=@fundamento/${{ matrix.package }}"],
];

/** The job of the Projekcioj suite: two Vitest shards (every Celo builds the whole Modelo). */
const PROJEKCIOJ_STEPS: ReadonlyArray<readonly [name: string, run: string]> = [
  ["Build", "pnpm build"],
  ["Test", "pnpm --filter @fundamento/projekcioj exec vitest run --shard=${{ matrix.shard }}/2"],
];

// Spec 040 B-6: on main, with three engines, the second of two shards ran into its 15 minutes
// (run 41886235249: 15:17) and the first ended at 12:56 and 13:02 (41886235249, 41873907893). The
// suite runs in four Playwright shards (fullyParallel: the cut goes through the tests, 474 each of
// 1896 on main); three would leave the Firefox shard at ~12.6 to 13.1 minutes. Every shard runs the
// unit tests of the package before its part of the suite, as with two.
/** The job of the rendered Eroj: the Playwright suite in four shards (fullyParallel inside). */
const EROJ_STEPS: ReadonlyArray<readonly [name: string, run: string]> = [
  ["Playwright browsers", PLAYWRIGHT_BROWSERS],
  ["Build", "pnpm build"],
  [
    "Test",
    "pnpm --filter @fundamento/eroj exec vitest run --passWithNoTests && pnpm --filter @fundamento/eroj exec playwright test --shard=${{ matrix.shard }}/4",
  ],
];

// Nachlese 5 ① (D-04): the rendered checks ran 7:52 to 8:34 in one job – axe over the Eroj alone
// 178 to 233 s, the Vitrino 104 to 140 s. axe over the Eroj is a job of its own now, the Make Kit,
// the quickstart and the Vitrino the other; no job above 7 minutes.
// Spec 040 B-1: on main, with three engines, the job ran into its 15 minutes (runs 41827472808,
// 41842873743) or stopped 21 s short of them (41873907893: 14:39). It runs in three Playwright
// shards (fullyParallel: one engine per shard on main). The argument goes to Playwright without a
// `--`: pnpm passes a `--` on, and Playwright takes `--shard` after it for a file filter.
/** The job of the rendered accessibility of the Eroj: axe, keyboard and focus ring, one shard. */
const ALIREBLECO_EROJ_STEPS: ReadonlyArray<readonly [name: string, run: string]> = [
  ["Playwright browsers", PLAYWRIGHT_BROWSERS],
  ["Build", "pnpm build"],
  ["Check: Alirebleco (Eroj)", "pnpm check:alirebleco-eroj --shard=${{ matrix.shard }}/3"],
];

// Spec 029 ①b (B-1b-6): the job of the Make Kit, the quickstart and the Vitrino ran 14:34 on a
// slow runner already on 2026-10-24 (run 40091280058) and four times past its 15 minutes after
// the rebase onto #112 and ①b (runs 40615856463, 40623800273; the Vitrino alone 12:47). Runners
// come in two speeds (Build 7–9 s or 11–12 s), about half of each. The Vitrino is cut in two by
// VITRINO_PARTO (playwright.vitrino.config.ts): the Werkstatt beside the Make Kit and the
// quickstart, the rest in a job of its own – about 9 minutes each on a slow runner.
// Spec 040 B-1: both halves ran into their 15 minutes again, in Chromium alone (the Vitrino runs in
// one engine on main too): the rest of the Vitrino in runs 41873907893, 41877598624 and
// 41886235249, the Werkstatt beside the Make Kit in 41877598624. The Werkstatt is a job of its own,
// the Make Kit and the quickstart stay here, and the Werkstatt and the rest of the Vitrino run in
// parts (packages/eroj/test/vitrino-partoj.ts), a runner each.
/** The job of the Make Kit and the quickstart. */
const RENDERED_CHECK_STEPS: ReadonlyArray<readonly [name: string, run: string]> = [
  ["Playwright browsers", PLAYWRIGHT_BROWSERS],
  ["Build", "pnpm build"],
  ["Check: Make Kit", "pnpm check:make-kit"],
  ["Check: Quickstart", "pnpm check:quickstart"],
];

/** The job of the Werkstatt of the Vitrino, one part per runner. */
const WERKSTATT_STEPS: ReadonlyArray<readonly [name: string, run: string]> = [
  ["Playwright browsers", PLAYWRIGHT_BROWSERS],
  ["Build", "pnpm build"],
  ["Check: Vitrino (Werkstatt)", "pnpm check:vitrino"],
];

/** The job of the Vitrino without its Werkstatt, one part per runner. */
const VITRINO_STEPS: ReadonlyArray<readonly [name: string, run: string]> = [
  ["Playwright browsers", PLAYWRIGHT_BROWSERS],
  ["Build", "pnpm build"],
  ["Check: Vitrino", "pnpm check:vitrino"],
];

/** The jobs that run the Vitrino in parts: its step, and the group of vitrino-partoj.ts. */
const VITRINO_JOBS: Readonly<Record<string, readonly [step: string, grupo: string]>> = {
  werkstatt: ["Check: Vitrino (Werkstatt)", "werkstatt"],
  vitrino: ["Check: Vitrino", "cetero"],
};

const JOBS: Readonly<Record<string, ReadonlyArray<readonly [name: string, run: string]>>> = {
  checks: CHECKS_STEPS,
  unit: UNIT_STEPS,
  projekcioj: PROJEKCIOJ_STEPS,
  eroj: EROJ_STEPS,
  "alirebleco-eroj": ALIREBLECO_EROJ_STEPS,
  "rendered-checks": RENDERED_CHECK_STEPS,
  werkstatt: WERKSTATT_STEPS,
  vitrino: VITRINO_STEPS,
};

/** The jobs that drive a browser; each takes its engines from PLAYWRIGHT_ENGINES. */
const RENDERED_JOBS = ["eroj", "alirebleco-eroj", "rendered-checks", "werkstatt", "vitrino"];

/** The names of the jobs Spec 040 B-1 cut, as the checks of a pull request show them. */
const JOB_NAMES: Readonly<Record<string, string>> = {
  eroj: "Rendered Eroj (Playwright, shard ${{ matrix.shard }} of 4)",
  "alirebleco-eroj":
    "Rendered accessibility (Alirebleco of the Eroj, shard ${{ matrix.shard }} of 3)",
  "rendered-checks": "Rendered checks (Make Kit, Quickstart)",
  werkstatt: "Rendered checks (Vitrino-Werkstatt, part ${{ matrix.parto }})",
  vitrino: "Rendered checks (Vitrino, part ${{ matrix.parto }})",
};

interface Step {
  name?: unknown;
  uses?: unknown;
  run?: unknown;
  with?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function loadWorkflow(): Record<string, unknown> {
  const parsed: unknown = parse(readFileSync(workflowPath, "utf8"));
  if (!isRecord(parsed)) throw new Error("ci.yml is not a YAML mapping");
  return parsed;
}

function loadJobs(): Record<string, Record<string, unknown>> {
  const jobs = loadWorkflow().jobs;
  if (!isRecord(jobs)) throw new Error("ci.yml has no jobs mapping");
  const result: Record<string, Record<string, unknown>> = {};
  for (const [name, job] of Object.entries(jobs)) {
    if (!isRecord(job)) throw new Error(`ci.yml job ${name} is not a mapping`);
    result[name] = job;
  }
  return result;
}

/** The first job, for the pins every job shares (they are checked for each job below). */
function loadJob(name = "checks"): Record<string, unknown> {
  const job = loadJobs()[name];
  if (job === undefined) throw new Error(`ci.yml has no job ${name}`);
  return job;
}

function loadSteps(job = "checks"): Step[] {
  const steps = loadJob(job).steps;
  if (!Array.isArray(steps)) throw new Error("ci.yml job has no steps list");
  return steps.map((step: unknown) => {
    if (!isRecord(step)) throw new Error("ci.yml step is not a mapping");
    return step;
  });
}

function usesAction(step: Step, action: string): boolean {
  return typeof step.uses === "string" && step.uses.startsWith(`${action}@`);
}

function withOf(step: Step): Record<string, unknown> {
  return isRecord(step.with) ? step.with : {};
}

function indexOfAction(steps: readonly Step[], action: string): number {
  return steps.findIndex((step) => usesAction(step, action));
}

/**
 * The parts of the Vitrino by group, from packages/eroj/test/vitrino-partoj.ts (Spec 040 B-1), in
 * the order of its table. The module has no imports, so it loads here as it is.
 */
async function loadVitrinoGrupoj(): Promise<Record<string, string[]>> {
  const module: unknown = await import(vitrinoPartojPath);
  const table = isRecord(module) ? module.VITRINO_PARTOJ : undefined;
  if (!isRecord(table)) throw new Error("vitrino-partoj.ts exports no VITRINO_PARTOJ table");
  const grupoj: Record<string, string[]> = {};
  for (const [parto, teil] of Object.entries(table)) {
    const grupo = isRecord(teil) ? teil.grupo : undefined;
    if (typeof grupo !== "string") throw new Error(`vitrino-partoj.ts: ${parto} has no group`);
    grupoj[grupo] = [...(grupoj[grupo] ?? []), parto];
  }
  return grupoj;
}

describe("CI workflow (.github/workflows/ci.yml)", () => {
  it("exists", () => {
    expect(existsSync(workflowPath)).toBe(true);
  });

  it("runs on push and pull_request", () => {
    const on = loadWorkflow().on;
    const triggers = Array.isArray(on) ? on : isRecord(on) ? Object.keys(on) : [on];
    expect(triggers).toEqual(expect.arrayContaining(["push", "pull_request"]));
  });

  it("grants only read access to repository contents", () => {
    expect(loadWorkflow().permissions).toEqual({ contents: "read" });
  });

  it("runs on ubuntu-latest", () => {
    expect(loadJob()["runs-on"]).toBe("ubuntu-latest");
  });

  it("pins every action to a major version", () => {
    const actions = loadSteps()
      .map((step) => step.uses)
      .filter((uses): uses is string => typeof uses === "string");
    expect(actions.length).toBeGreaterThan(0);
    for (const uses of actions) {
      expect(uses).toMatch(/^[\w.-]+\/[\w.-]+@v\d+$/);
    }
  });

  it("checks out the repository before anything else", () => {
    const steps = loadSteps();
    expect(indexOfAction(steps, "actions/checkout")).toBe(0);
  });

  it("installs pnpm from packageManager, before setup-node, without a version override", () => {
    const steps = loadSteps();
    const pnpmIndex = indexOfAction(steps, "pnpm/action-setup");
    const nodeIndex = indexOfAction(steps, "actions/setup-node");
    expect(pnpmIndex).toBeGreaterThan(-1);
    expect(nodeIndex).toBeGreaterThan(pnpmIndex);
    const pnpmStep = steps[pnpmIndex];
    if (pnpmStep === undefined) throw new Error("pnpm/action-setup step missing");
    expect(withOf(pnpmStep)).not.toHaveProperty("version");
  });

  it("takes Node from .nvmrc and caches the pnpm store", () => {
    const steps = loadSteps();
    const nodeStep = steps[indexOfAction(steps, "actions/setup-node")];
    if (nodeStep === undefined) throw new Error("actions/setup-node step missing");
    expect(withOf(nodeStep)).toMatchObject({ "node-version-file": ".nvmrc", cache: "pnpm" });
    expect(withOf(nodeStep)).not.toHaveProperty("node-version");
  });

  it("installs with a frozen lockfile after the toolchain is set up", () => {
    const steps = loadSteps();
    const installIndex = steps.findIndex((step) => step.run === "pnpm install --frozen-lockfile");
    expect(installIndex).toBeGreaterThan(indexOfAction(steps, "actions/setup-node"));
  });

  it("has the eight jobs checks, unit, projekcioj, eroj, alirebleco-eroj, rendered-checks, werkstatt and vitrino, each with its named steps in order after the install", () => {
    expect(Object.keys(loadJobs())).toEqual(Object.keys(JOBS));
    for (const [job, expected] of Object.entries(JOBS)) {
      const steps = loadSteps(job);
      const installIndex = steps.findIndex((step) => step.run === "pnpm install --frozen-lockfile");
      expect(installIndex, job).toBeGreaterThan(0);
      const gates = steps.slice(installIndex + 1).map((step) => [step.name, step.run]);
      expect(gates, job).toEqual(expected.map(([name, run]) => [name, run]));
    }
  });

  it("every job runs on ubuntu-latest, checks out first, installs pnpm before Node and a frozen lockfile after", () => {
    for (const [name, job] of Object.entries(loadJobs())) {
      expect(job["runs-on"], name).toBe("ubuntu-latest");
      const steps = loadSteps(name);
      expect(indexOfAction(steps, "actions/checkout"), name).toBe(0);
      expect(indexOfAction(steps, "pnpm/action-setup"), name).toBeLessThan(
        indexOfAction(steps, "actions/setup-node"),
      );
      expect(
        steps.findIndex((step) => step.run === "pnpm install --frozen-lockfile"),
        name,
      ).toBeGreaterThan(indexOfAction(steps, "actions/setup-node"));
    }
  });

  it("shards the Playwright suite of the Eroj in four and the Vitest suite of the Projekcioj in two, without fail-fast, and gives only the five rendered jobs the engines", () => {
    expect(loadJob("eroj").strategy).toEqual({
      "fail-fast": false,
      matrix: { shard: [1, 2, 3, 4] },
    });
    expect(loadJob("eroj")["timeout-minutes"]).toBe(15);
    expect(loadJob("projekcioj").strategy).toEqual({
      "fail-fast": false,
      matrix: { shard: [1, 2] },
    });
    for (const name of RENDERED_JOBS) {
      const env = loadJob(name).env;
      expect(isRecord(env) && typeof env.PLAYWRIGHT_ENGINES === "string", name).toBe(true);
    }
    for (const name of ["checks", "unit", "projekcioj"]) {
      expect(loadJob(name).env, name).toBeUndefined();
    }
  });

  it("runs the unit tests on one runner per package, and every package with tests has one (Nachlese 9)", () => {
    expect(loadJob("unit").strategy).toEqual({
      "fail-fast": false,
      matrix: { package: UNIT_PACKAGES },
    });
    // A new package with tests needs a place: here, or a job of its own like Projekcioj and Eroj.
    const tested = readdirSync(`${repoRoot}packages`, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => {
        const path = `${repoRoot}packages/${name}/package.json`;
        if (!existsSync(path)) return false;
        const pkg: unknown = JSON.parse(readFileSync(path, "utf8"));
        return isRecord(pkg) && isRecord(pkg.scripts) && typeof pkg.scripts.test === "string";
      })
      .filter((name) => name !== "eroj" && name !== "projekcioj")
      .sort();
    expect(tested).toEqual(UNIT_PACKAGES);
  });

  it("shards Alirebleco in three and runs the Vitrino and the Werkstatt in parts taken from vitrino-partoj.ts, without fail-fast", async () => {
    const alirebleco = loadJob("alirebleco-eroj");
    expect(alirebleco.strategy).toEqual({ "fail-fast": false, matrix: { shard: [1, 2, 3] } });
    expect(alirebleco["timeout-minutes"]).toBe(15);
    const grupoj = await loadVitrinoGrupoj();
    // Every part of the table has a runner, and every runner a part of the table.
    expect(Object.keys(grupoj).sort()).toEqual(
      Object.values(VITRINO_JOBS)
        .map(([, g]) => g)
        .sort(),
    );
    for (const [job, [name, grupo]] of Object.entries(VITRINO_JOBS)) {
      expect(loadJob(job).strategy, job).toEqual({
        "fail-fast": false,
        matrix: { parto: grupoj[grupo] },
      });
      expect(loadJob(job)["timeout-minutes"], job).toBe(15);
      const step = loadSteps(job).find((candidate) => candidate.name === name) as
        | (Step & { env?: unknown })
        | undefined;
      expect(step?.env, job).toEqual({ VITRINO_PARTO: "${{ matrix.parto }}" });
    }
    // No other step chooses a part: locally and anywhere else the Vitrino runs whole.
    const chosen = Object.keys(loadJobs()).flatMap((job) =>
      loadSteps(job).filter((step) => isRecord((step as { env?: unknown }).env)),
    );
    expect(chosen).toHaveLength(Object.keys(VITRINO_JOBS).length);
    for (const [job, name] of Object.entries(JOB_NAMES)) {
      expect(loadJob(job).name, job).toBe(name);
    }
    const config = readFileSync(`${repoRoot}packages/eroj/playwright.vitrino.config.ts`, "utf8");
    expect(config).toContain("vitrinoAuswahl(process.env.VITRINO_PARTO)");
  });

  it("keeps every job under a 15-minute budget (the wall clock stays under 12)", () => {
    for (const [name, job] of Object.entries(loadJobs())) {
      expect(job["timeout-minutes"], name).toBeLessThanOrEqual(15);
    }
  });

  it("has one check step for every registered check", () => {
    const scripts = CHECK_STEPS.map(([, script]) => script);
    expect(scripts).toEqual(CHECK_NAMES.map((name) => `check:${name}`));
  });

  it("uses no secrets", () => {
    expect(readFileSync(workflowPath, "utf8")).not.toMatch(/secrets\./);
  });
});

describe("root package.json check script", () => {
  const pkg: unknown = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const scripts = isRecord(pkg) && isRecord(pkg.scripts) ? pkg.scripts : {};
  const check = typeof scripts.check === "string" ? scripts.check : "";
  const commands = check.split("&&").map((part) => part.trim());

  it("chains every command with && so it fails on the first failure", () => {
    expect(check).not.toMatch(/(^|[^&])&([^&]|$)|\|\||;/);
    expect(commands.length).toBeGreaterThan(1);
  });

  it("runs build, test, perf and lint before the checks", () => {
    const head = commands.slice(0, commands.length - CHECK_STEPS.length - ERO_CHECK_STEPS.length);
    expect(head.join(" && ")).toMatch(/build/);
    expect(head.join(" && ")).toMatch(/test/);
    expect(head).toContain("pnpm perf");
    expect(head).toContain("pnpm lint");
    expect(head.indexOf("pnpm perf")).toBeGreaterThan(
      head.findIndex((command) => /\btest\b/.test(command)),
    );
  });

  it("defines perf as its own Turborepo task: after build, one at a time", () => {
    expect(scripts.perf).toBe("turbo run perf --concurrency=1");
    const turbo: unknown = JSON.parse(readFileSync(`${repoRoot}turbo.json`, "utf8"));
    const tasks = isRecord(turbo) && isRecord(turbo.tasks) ? turbo.tasks : {};
    expect(tasks.perf).toEqual({ dependsOn: ["build"], cache: false, outputs: [] });
  });

  it("invokes all five check scripts and the rendered Ero check, in the CI order", () => {
    expect(commands.slice(-CHECK_STEPS.length - ERO_CHECK_STEPS.length)).toEqual(
      [...CHECK_STEPS, ...ERO_CHECK_STEPS].map(([, script]) => `pnpm ${script}`),
    );
  });

  it("runs the rendered Ero check through @fundamento/eroj (Spec 003 T013)", () => {
    expect(scripts["check:alirebleco-eroj"]).toBe(
      "pnpm --filter @fundamento/eroj run check:alirebleco",
    );
  });

  it("runs the Make Kit check through @fundamento/eroj (Spec 003 T019)", () => {
    expect(scripts["check:make-kit"]).toBe("pnpm --filter @fundamento/eroj run check:make-kit");
  });

  it("runs the quickstart through @fundamento/eroj (Spec 003 T027)", () => {
    expect(scripts["check:quickstart"]).toBe("pnpm --filter @fundamento/eroj run check:quickstart");
  });

  // The snapshot comparison builds the whole Modelo four times (106 s on the CI runner) and
  // starved the MCP tests next to it, so it runs with the Vitrino check instead of in the gate.
  it("runs the Vitrino check, snapshot comparison first (Spec 004 T012)", () => {
    expect(scripts["check:vitrino"]).toBe(
      "pnpm --filter @fundamento/projekcioj run check:bazo && pnpm --filter @fundamento/eroj run check:vitrino",
    );
  });

  it("defines every check script it invokes", () => {
    for (const [, script] of CHECK_STEPS) {
      if (script === "check:parity") continue;
      expect(scripts[script]).toBe(`node packages/modelo/dist/checks/run.js ${script.slice(6)}`);
    }
  });

  it("builds the projections before the parity check reads them (Spec 003 T021)", () => {
    expect(scripts["check:parity"]).toBe(
      "pnpm fm projekcioj build --out .fundamento/projekcioj && node packages/modelo/dist/checks/run.js parity",
    );
  });
});

describe("the MCP acceptance suite runs in the Test gate (Spec 001 T028)", () => {
  const pkg: unknown = JSON.parse(readFileSync(mcpPackageJsonPath, "utf8"));
  const scripts = isRecord(pkg) && isRecord(pkg.scripts) ? pkg.scripts : {};

  it("@fundamento/mcp has tests and no longer passes without them", () => {
    expect(scripts.test).toBe("vitest run");
  });

  it("runs the AK-07 timings only in its own perf step, never in the parallel test run", () => {
    expect(scripts.perf).toBe("vitest run --config vitest.perf.config.ts");
    const unit = readFileSync(`${repoRoot}packages/mcp/vitest.config.ts`, "utf8");
    const perf = readFileSync(`${repoRoot}packages/mcp/vitest.perf.config.ts`, "utf8");
    expect(unit).toContain('exclude: [...configDefaults.exclude, "src/e2e/perf.test.ts"]');
    expect(perf).toContain('include: ["src/e2e/perf.test.ts"]');
  });

  it.each(["s7-dialog.test.ts", "perf.test.ts"])("has %s", (file) => {
    expect(existsSync(`${mcpE2eDir}${file}`)).toBe(true);
  });

  it("has the quickstart test in the cli package, which spawns the built fm", () => {
    expect(existsSync(`${repoRoot}packages/cli/src/quickstart.test.ts`)).toBe(true);
  });
});

describe("Node 24 is enforced (Spec 001 review A)", () => {
  it("pnpm refuses an install on another Node (engine-strict)", () => {
    expect(readFileSync(`${repoRoot}.npmrc`, "utf8").split("\n")).toContain("engine-strict=true");
    const pkg: unknown = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    expect(isRecord(pkg) && pkg.engines).toEqual({ node: ">=24" });
  });

  it("gives this package's spawning tests a 30 s budget (vitest.config.ts)", ({ task }) => {
    expect(task.timeout).toBeGreaterThanOrEqual(30_000);
  });
});

// Spec 011 ① (O-21, plan ① D-01): the e2e runtime is solved in its structure, not with a timeout.
// The spawning e2e files of this package run one after the other, after the unit files, and every
// spawn goes through a gate of the machine's cores; the Playwright files of @fundamento/eroj run
// their tests in parallel across workers, not one file per worker. The CI factor 3 of the hook in
// checks.test.ts (Spec 010 ④, 98aea27) is gone with it.
describe("the e2e runtime is bounded by structure, not by a timeout (Spec 011 ① O-21)", () => {
  it("@fundamento/eroj runs the tests of one Playwright file in parallel (fullyParallel)", () => {
    const config = readFileSync(`${repoRoot}packages/eroj/playwright.config.ts`, "utf8");
    expect(config).toContain("fullyParallel: true");
  });

  it("this package runs its spawning e2e files in a group of their own, after the unit files, one at a time", () => {
    const config = readFileSync(`${repoRoot}packages/modelo/vitest.config.ts`, "utf8");
    expect(config).toContain('include: ["src/e2e/**/*.test.ts"]');
    expect(config).toContain("fileParallelism: false");
    expect(config).toContain("groupOrder: 1");
  });

  it("every spawn of the e2e harness passes a gate sized by the machine's cores", () => {
    const harness = readFileSync(
      `${repoRoot}packages/modelo/src/e2e/test-doubles/harness.ts`,
      "utf8",
    );
    expect(harness).toContain("availableParallelism()");
  });

  it("the hook of checks.test.ts carries no CI factor any more", () => {
    const checks = readFileSync(`${repoRoot}packages/modelo/src/e2e/checks.test.ts`, "utf8");
    expect(checks).not.toContain('process.env.CI === "true" ? 3 : 1');
    expect(checks).toContain("}, 60_000);");
  });
});
