// Spec 040 B-1 (AC-A3): the parts of the Vitrino (vitrino-partoj.ts) are complete. Their union is
// every test of vitrino.check.ts, no two share a test, none is empty, and the legacy values
// `werkstatt` and `cetero` are the unions of their parts.
//
// Playwright lists the tests twice, in parallel: once whole and once for one part through the real
// config, which proves the wiring. The other parts are matched here, as Playwright matches: a
// regular expression against the space-joined title path ("", project, file, describes, test,
// tags), a test kept by `grep` and dropped by `grepInvert`.
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { beforeAll, describe, expect, it } from "vitest";
import { VITRINO_PARTOJ, vitrinoAuswahl } from "./vitrino-partoj.js";

const run = promisify(execFile);
const packageDir = fileURLToPath(new URL("..", import.meta.url));
const playwrightCli = fileURLToPath(
  new URL("../node_modules/@playwright/test/cli.js", import.meta.url),
);

interface ListedTest {
  /** Describes and test title, joined by " › ": the name the list reporter prints. */
  readonly name: string;
  /** The title Playwright greps. */
  readonly grepTitle: string;
}

interface JsonSuite {
  title?: unknown;
  specs?: unknown;
  suites?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function records(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

/** Flattens the JSON report of `--list` into one entry per test and project. */
function flatten(report: unknown): ListedTest[] {
  const listed: ListedTest[] = [];
  const visit = (suite: JsonSuite, file: string, describes: readonly string[]): void => {
    for (const spec of records(suite.specs)) {
      const title = String(spec.title);
      for (const test of records(spec.tests)) {
        const path = [...describes, title];
        listed.push({
          name: path.join(" › "),
          grepTitle: ["", String(test.projectName), file, ...path, ...strings(spec.tags)].join(" "),
        });
      }
    }
    for (const child of records(suite.suites)) {
      visit(child, file, [...describes, String(child.title)]);
    }
  };
  for (const fileSuite of isRecord(report) ? records(report.suites) : []) {
    visit(fileSuite, String(fileSuite.title), []);
  }
  return listed;
}

async function list(parto: string | undefined): Promise<ListedTest[]> {
  const env: NodeJS.ProcessEnv = { ...process.env };
  delete env.VITRINO_PARTO;
  if (parto !== undefined) env.VITRINO_PARTO = parto;
  const { stdout } = await run(
    process.execPath,
    [
      playwrightCli,
      "test",
      "--config",
      "playwright.vitrino.config.ts",
      "--list",
      "--reporter=json",
    ],
    { cwd: packageDir, env, maxBuffer: 64 * 1024 * 1024 },
  );
  return flatten(JSON.parse(stdout));
}

function matches(patterns: readonly RegExp[] | undefined, title: string): boolean {
  return (patterns ?? []).some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(title);
  });
}

/** The names of the tests a value of VITRINO_PARTO selects, matched as Playwright matches. */
function select(all: readonly ListedTest[], parto: string): string[] {
  const { grep, grepInvert } = vitrinoAuswahl(parto);
  return all
    .filter((test) => grep === undefined || matches(grep, test.grepTitle))
    .filter((test) => !matches(grepInvert, test.grepTitle))
    .map((test) => test.name);
}

const sorted = (names: Iterable<string>): string[] => [...names].sort();

const PARTOJ = Object.keys(VITRINO_PARTOJ);
/** The part listed through the real config: the last, the rest of its group after all others. */
const DRAHT = PARTOJ.at(-1);

let all: ListedTest[] = [];
let wired: ListedTest[] = [];

beforeAll(async () => {
  [all, wired] = await Promise.all([list(undefined), DRAHT === undefined ? [] : list(DRAHT)]);
});

describe("the parts of the Vitrino (Spec 040 B-1)", () => {
  it("lists the whole Vitrino, every test under one name", () => {
    expect(all.length).toBeGreaterThan(0);
    expect(new Set(all.map((test) => test.name)).size).toBe(all.length);
  });

  it("the parts together are every test, no test in two parts, no part empty", () => {
    const violations: string[] = [];
    if (PARTOJ.length === 0) violations.push("no parts");
    const owner = new Map<string, string>();
    for (const parto of PARTOJ) {
      const selected = select(all, parto);
      if (selected.length === 0) violations.push(`${parto}: empty`);
      for (const name of selected) {
        const other = owner.get(name);
        if (other !== undefined) violations.push(`${name}: in ${other} and ${parto}`);
        owner.set(name, parto);
      }
    }
    for (const test of all) {
      if (!owner.has(test.name)) violations.push(`${test.name}: in no part`);
    }
    expect(violations).toEqual([]);
  });

  it("selects through playwright.vitrino.config.ts what it selects here", () => {
    expect(DRAHT).toBeDefined();
    expect(sorted(wired.map((test) => test.name))).toEqual(sorted(select(all, DRAHT ?? "")));
  });

  it("keeps werkstatt and cetero as the unions of their parts", () => {
    for (const grupo of ["werkstatt", "cetero"] as const) {
      const parts = PARTOJ.filter((parto) => VITRINO_PARTOJ[parto]?.grupo === grupo);
      expect(parts.length, grupo).toBeGreaterThan(0);
      expect(sorted(select(all, grupo)), grupo).toEqual(
        sorted(parts.flatMap((parto) => select(all, parto))),
      );
    }
  });

  it("selects everything when unset or empty", () => {
    expect(vitrinoAuswahl(undefined)).toEqual({});
    expect(vitrinoAuswahl("")).toEqual({});
  });

  it("throws on an unknown part, naming it", () => {
    expect(() => vitrinoAuswahl("bogus")).toThrow('VITRINO_PARTO: unknown part "bogus"');
  });
});
