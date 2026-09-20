import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import type { CheckResult } from "../../contracts/checks.js";
import { baseResolution, skemoParityInventory } from "../../eroj/inventories.js";
import { loadModelo } from "../../load/load-modelo.js";
import { defaultModeloSource } from "../../load/source.js";
import { check } from "./index.js";
import type { ParityInventory } from "./inventory.js";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));
const fixture = (path: string): string =>
  fileURLToPath(new URL(`../../../test/fixtures/${path}/`, import.meta.url));
const builtRunner = fileURLToPath(new URL("../../../dist/checks/run.js", import.meta.url));

interface ExpectedIssues {
  check: string;
  issues: { rule: string; path: string }[];
}

const readExpected = (path: string): ExpectedIssues =>
  JSON.parse(readFileSync(join(fixture(path), "expected-issues.json"), "utf8")) as ExpectedIssues;

const rulesAndPaths = (issues: readonly { rule: string; path: string }[]) =>
  issues.map(({ rule, path }) => ({ rule, path }));

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

/** A fixture directory outside the repo with the given `a.json` / `b.json` texts. */
function tempFixture(files: { a?: string; b?: string }): string {
  const root = mkdtempSync(join(tmpdir(), "fm-parity-"));
  tempDirs.push(root);
  if (files.a !== undefined) {
    writeFileSync(join(root, "a.json"), files.a);
  }
  if (files.b !== undefined) {
    writeFileSync(join(root, "b.json"), files.b);
  }
  return root;
}

const EMPTY = '{ "items": {} }';

const { modelo } = loadModelo(defaultModeloSource());
const EROJ = modelo?.eroj ?? [];
/** The base combination, the state the sides state their resolved values in (F8). */
const RESOLVED = modelo === undefined ? {} : baseResolution(modelo);

/** The inventories a correct build writes, one file per side (T021). */
function correctSides(): Record<string, ParityInventory> {
  return {
    "web-component.json": skemoParityInventory(EROJ, {
      aspects: ["props", "states"],
      props: "styled",
    }),
    "react.json": skemoParityInventory(EROJ, { aspects: ["props"] }),
    // The Figma side restates the resolved paints as well (Spec 003 F8), so a correct build
    // carries them; the guidelines document props, states and defaults.
    "figma.json": skemoParityInventory(EROJ, {
      aspects: ["props", "states", "paints"],
      resolved: RESOLVED,
    }),
    "guidelines-komuna.json": skemoParityInventory(EROJ, {
      aspects: ["props", "states", "values"],
    }),
  };
}

/** A projections directory with a `parity/` folder; `change` may flip one side before writing. */
function writeProjections(change: (sides: Record<string, ParityInventory>) => void = () => {}) {
  const root = mkdtempSync(join(tmpdir(), "fm-parity-projekcioj-"));
  tempDirs.push(root);
  const sides = correctSides();
  change(sides);
  mkdirSync(join(root, "parity"), { recursive: true });
  for (const [file, inventory] of Object.entries(sides)) {
    writeFileSync(join(root, "parity", file), `${JSON.stringify(inventory, null, 2)}\n`);
  }
  return root;
}

describe("parity default run (T021)", () => {
  it("compares the Skemo with every side of a correct build", async () => {
    const result = await check({ json: true, repoRoot, projekcioj: writeProjections() });
    expect(result).toMatchObject({ check: "parity", ok: true, errors: [], warnings: [] });
    expect(result.stats.sides).toBe(4);
    expect(result.stats.differences).toBe(0);
    expect(result.summary).toContain("Skemo");
  });

  it("fails when the projections are missing instead of comparing nothing", async () => {
    const empty = mkdtempSync(join(tmpdir(), "fm-parity-empty-"));
    tempDirs.push(empty);
    const result = await check({ json: true, repoRoot: empty });
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
    expect(result.errors.every((issue) => issue.rule === "file-missing")).toBe(true);
    expect(result.errors[0]?.path).toContain(".fundamento/projekcioj/parity/");
    expect(result.errors[0]?.suggestion).toContain("fm projekcioj build");
  });

  it("names the side, the prop and both value lists when a side flips a prop value", async () => {
    const dir = writeProjections((sides) => {
      const item = sides["figma.json"]?.items.butono;
      if (item !== undefined) item.props.size = ["small", "medium", "huge"];
    });
    const result = await check({ json: true, repoRoot, projekcioj: dir });
    expect(result.ok).toBe(false);
    expect(rulesAndPaths(result.errors)).toEqual([
      { rule: "parity-prop-mismatch", path: "items.butono.props.size" },
    ]);
    const [issue] = result.errors;
    expect(issue?.message).toContain("figma");
    expect(issue?.message).toContain("huge");
    expect(issue?.message).toContain("large");
  });

  it("reports a state a side does not restate", async () => {
    const dir = writeProjections((sides) => {
      const item = sides["guidelines-komuna.json"]?.items.butono;
      if (item !== undefined) item.states = item.states.filter((state) => state !== "loading");
    });
    const result = await check({ json: true, repoRoot, projekcioj: dir });
    expect(rulesAndPaths(result.errors)).toEqual([
      { rule: "parity-state-mismatch", path: "items.butono.states.loading" },
    ]);
    expect(result.errors[0]?.message).toContain("guidelines(komuna)");
  });

  it("reports a default the guidelines state differently", async () => {
    const dir = writeProjections((sides) => {
      const item = sides["guidelines-komuna.json"]?.items.butono;
      if (item !== undefined) item.values["default.variant"] = "primary";
    });
    const result = await check({ json: true, repoRoot, projekcioj: dir });
    expect(rulesAndPaths(result.errors)).toEqual([
      { rule: "parity-value-mismatch", path: 'items.butono.values["default.variant"]' },
    ]);
  });

  it("reports an inventory file that is not a valid inventory", async () => {
    const dir = writeProjections();
    writeFileSync(join(dir, "parity", "react.json"), '{ "items": { "butono": {} } }');
    const result = await check({ json: true, repoRoot, projekcioj: dir });
    expect(result.ok).toBe(false);
    expect(result.errors.some((issue) => issue.rule === "schema-violation")).toBe(true);
  });
});

describe("parity fixtures", () => {
  it("passes two differently ordered and whitespaced but equivalent inventories", async () => {
    const result = await check({
      json: true,
      repoRoot,
      fixture: fixture("valid/parity-equivalent"),
    });
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.stats).toEqual({ itemsA: 2, itemsB: 2, differences: 0 });
  });

  it("invalid/parity-mismatch fails with exactly the expected rules and paths", async () => {
    const expected = readExpected("invalid/parity-mismatch");
    expect(expected.check).toBe("parity");
    const result = await check({
      json: true,
      repoRoot,
      fixture: fixture("invalid/parity-mismatch"),
    });
    expect(result.ok).toBe(false);
    expect(rulesAndPaths(result.errors)).toEqual(expected.issues);
    expect(new Set(result.errors.map(({ rule }) => rule))).toEqual(
      new Set([
        "parity-item-missing",
        "parity-prop-mismatch",
        "parity-state-mismatch",
        "parity-value-mismatch",
      ]),
    );
    expect(result.stats).toEqual({ itemsA: 2, itemsB: 1, differences: 4 });
    expect(result.summary).toContain("4 difference(s)");
  });

  it("reports a missing b.json as file-missing", async () => {
    const result = await check({ json: true, repoRoot, fixture: tempFixture({ a: EMPTY }) });
    expect(result.ok).toBe(false);
    expect(rulesAndPaths(result.errors)).toEqual([{ rule: "file-missing", path: "b.json#" }]);
  });

  it("reads through the strict parser (duplicate keys are errors)", async () => {
    const result = await check({
      json: true,
      repoRoot,
      fixture: tempFixture({ a: '{ "items": {}, "items": {} }', b: EMPTY }),
    });
    expect(result.ok).toBe(false);
    expect(rulesAndPaths(result.errors)).toEqual([
      { rule: "json-duplicate-key", path: "a.json#/items" },
    ]);
  });

  it("validates the structure with a clear error before comparing", async () => {
    const result = await check({
      json: true,
      repoRoot,
      fixture: tempFixture({ a: EMPTY, b: '{ "items": { "x": { "props": {} } } }' }),
    });
    expect(result.ok).toBe(false);
    expect(rulesAndPaths(result.errors)).toEqual([
      { rule: "schema-violation", path: "b.json#/items/x" },
    ]);
    expect(result.errors[0]?.message).toMatch(/states/);
    expect(result.summary).toContain("not a valid inventory");
  });
});

describe("built runner", () => {
  it("prints only the CheckResult with --json and exits 1 on the mismatch fixture", () => {
    expect(existsSync(builtRunner), `missing ${builtRunner}; run the build first`).toBe(true);
    const child = spawnSync(
      process.execPath,
      [builtRunner, "parity", "--json", "--fixture", fixture("invalid/parity-mismatch")],
      { encoding: "utf8" },
    );
    expect(child.status).toBe(1);
    expect(child.stderr).toBe("");
    const result = JSON.parse(child.stdout) as CheckResult;
    expect(rulesAndPaths(result.errors)).toEqual(readExpected("invalid/parity-mismatch").issues);
  });

  it("prints a concise human summary and exits 0 on a built projection", () => {
    // `pnpm check:parity` builds the projections first; the runner is pointed at one here, since
    // the test gate runs before any build wrote `.fundamento/projekcioj` (Spec 003 T021).
    const child = spawnSync(
      process.execPath,
      [builtRunner, "parity", "--projekcioj", writeProjections()],
      { encoding: "utf8" },
    );
    expect(child.status, child.stderr).toBe(0);
    expect(child.stdout.split("\n")[0]).toMatch(/^PASS parity: /);
  });

  it("exits 1 and says what to build when there are no projections", () => {
    const empty = mkdtempSync(join(tmpdir(), "fm-parity-none-"));
    tempDirs.push(empty);
    const child = spawnSync(process.execPath, [builtRunner, "parity", "--projekcioj", empty], {
      encoding: "utf8",
    });
    expect(child.status).toBe(1);
    expect(child.stdout).toContain("fm projekcioj build");
  });
});
