import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { CHECK_NAMES } from "../contracts/checks.js";

const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const workflowPath = `${repoRoot}.github/workflows/ci.yml`;
const packageJsonPath = `${repoRoot}package.json`;
const mcpPackageJsonPath = `${repoRoot}packages/mcp/package.json`;
const mcpE2eDir = `${repoRoot}packages/mcp/src/e2e/`;

const CHECK_STEPS: ReadonlyArray<readonly [name: string, script: string]> = [
  ["Check: Vortaro-Lint", "check:vortaro-lint"],
  ["Check: Parity", "check:parity"],
  ["Check: Regularo", "check:regularo"],
  ["Check: Mankoj", "check:mankoj"],
  ["Check: Alirebleco", "check:alirebleco"],
  ["Check: Clean-Room", "check:clean-room"],
  // Spec 014 ① (G3): every installed Aspekto draws every name of the Ikonaro.
  ["Check: Ikonaro", "check:ikonaro"],
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
const PLAYWRIGHT_BROWSERS =
  "pnpm --filter @fundamento/eroj exec playwright install --with-deps chromium firefox webkit";

/** The job of the checks: build, perf, lint, the Modelo checks, release. */
const CHECKS_STEPS: ReadonlyArray<readonly [name: string, run: string]> = [
  ["Build", "pnpm build"],
  // AK-07 timings run alone, outside any parallel Turborepo test run (Spec 001 D-17).
  ["Perf", "pnpm perf"],
  ["Lint", "pnpm lint"],
  ...CHECK_STEPS.map(([name, script]) => [name, `pnpm ${script}`] as const),
  ["Check: Release", "pnpm check:release"],
];

/** The job of the unit tests: every package but the Projekcioj (their own shards) and the Eroj. */
const UNIT_STEPS: ReadonlyArray<readonly [name: string, run: string]> = [
  ["Build", "pnpm build"],
  ["Test", "pnpm turbo run test --filter=!@fundamento/eroj --filter=!@fundamento/projekcioj"],
];

/** The job of the Projekcioj suite: two Vitest shards (every Celo builds the whole Modelo). */
const PROJEKCIOJ_STEPS: ReadonlyArray<readonly [name: string, run: string]> = [
  ["Build", "pnpm build"],
  [
    "Test",
    "pnpm --filter @fundamento/projekcioj exec vitest run --shard=${{ matrix.shard }}/2",
  ],
];

/** The job of the rendered Eroj: the Playwright suite in two shards (fullyParallel inside). */
const EROJ_STEPS: ReadonlyArray<readonly [name: string, run: string]> = [
  ["Playwright browsers", PLAYWRIGHT_BROWSERS],
  ["Build", "pnpm build"],
  [
    "Test",
    "pnpm --filter @fundamento/eroj exec vitest run --passWithNoTests && pnpm --filter @fundamento/eroj exec playwright test --shard=${{ matrix.shard }}/2",
  ],
];

/** The job of the rendered checks: axe over the Eroj, the Make Kit, the quickstart, the Vitrino. */
const RENDERED_CHECK_STEPS: ReadonlyArray<readonly [name: string, run: string]> = [
  ["Playwright browsers", PLAYWRIGHT_BROWSERS],
  ["Build", "pnpm build"],
  ...ERO_CHECK_STEPS.filter(([name]) => name !== "Check: Release").map(
    ([name, script]) => [name, `pnpm ${script}`] as const,
  ),
];

const JOBS: Readonly<Record<string, ReadonlyArray<readonly [name: string, run: string]>>> = {
  checks: CHECKS_STEPS,
  unit: UNIT_STEPS,
  projekcioj: PROJEKCIOJ_STEPS,
  eroj: EROJ_STEPS,
  "rendered-checks": RENDERED_CHECK_STEPS,
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

  it("has the five jobs checks, unit, projekcioj, eroj and rendered-checks, each with its named steps in order after the install", () => {
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

  it("shards the Playwright suite of the Eroj and the Vitest suite of the Projekcioj in two, without fail-fast, and gives only the two rendered jobs the engines", () => {
    for (const name of ["eroj", "projekcioj"]) {
      expect(loadJob(name).strategy, name).toEqual({
        "fail-fast": false,
        matrix: { shard: [1, 2] },
      });
    }
    for (const name of ["eroj", "rendered-checks"]) {
      const env = loadJob(name).env;
      expect(isRecord(env) && typeof env.PLAYWRIGHT_ENGINES === "string", name).toBe(true);
    }
    for (const name of ["checks", "unit", "projekcioj"]) {
      expect(loadJob(name).env, name).toBeUndefined();
    }
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
