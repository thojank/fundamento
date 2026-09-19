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
  ["Check: Alirebleco", "check:alirebleco"],
  ["Check: Clean-Room", "check:clean-room"],
];

const GATE_STEPS: ReadonlyArray<readonly [name: string, run: string]> = [
  ["Build", "pnpm build"],
  ["Test", "pnpm test"],
  // AK-07 timings run alone, outside the parallel Turborepo test run (Spec 001 D-17).
  ["Perf", "pnpm perf"],
  ["Lint", "pnpm lint"],
  ...CHECK_STEPS.map(([name, script]) => [name, `pnpm ${script}`] as const),
];

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

function loadJob(): Record<string, unknown> {
  const jobs = loadWorkflow().jobs;
  if (!isRecord(jobs)) throw new Error("ci.yml has no jobs mapping");
  const values = Object.values(jobs);
  expect(values).toHaveLength(1);
  const job = values[0];
  if (!isRecord(job)) throw new Error("ci.yml job is not a mapping");
  return job;
}

function loadSteps(): Step[] {
  const steps = loadJob().steps;
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

  it("runs Build, Test, Lint and the five checks as separate named steps, in order", () => {
    const steps = loadSteps();
    const installIndex = steps.findIndex((step) => step.run === "pnpm install --frozen-lockfile");
    const gates = steps.slice(installIndex + 1).map((step) => [step.name, step.run]);
    expect(gates).toEqual(GATE_STEPS.map(([name, run]) => [name, run]));
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
    const head = commands.slice(0, commands.length - CHECK_STEPS.length);
    expect(head.join(" && ")).toMatch(/build/);
    expect(head.join(" && ")).toMatch(/test/);
    expect(head).toContain("pnpm perf");
    expect(head).toContain("pnpm lint");
    expect(head.indexOf("pnpm perf")).toBeGreaterThan(
      head.findIndex((command) => /\btest\b/.test(command)),
    );
  });

  it("defines perf as the AK-07 timing run of @fundamento/mcp", () => {
    expect(scripts.perf).toBe("pnpm --filter @fundamento/mcp run perf");
  });

  it("invokes all five check scripts, in the CI order", () => {
    expect(commands.slice(-CHECK_STEPS.length)).toEqual(
      CHECK_STEPS.map(([, script]) => `pnpm ${script}`),
    );
  });

  it("defines every check script it invokes", () => {
    for (const [, script] of CHECK_STEPS) {
      expect(scripts[script]).toBe(`node packages/modelo/dist/checks/run.js ${script.slice(6)}`);
    }
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
