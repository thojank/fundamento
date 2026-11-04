// Spec 040 B-1 (AC-A3): the parts of the Vitrino (vitrino-partoj.ts) are complete. Their union is
// every test of vitrino.check.ts, no two share a test, none is empty, and the legacy values
// `werkstatt` and `cetero` are the unions of their parts.
//
// Spec 040 B-7: Playwright lists the tests once, through playwright.vitrino-partoj.config.ts: a
// project for the whole Vitrino, for every part and for both groups, each selected by Playwright
// with the grep and grepInvert of vitrinoAuswahl(), and the project `draht` with the selection
// playwright.vitrino.config.ts makes of VITRINO_PARTO, which proves the wiring. Two listings in
// parallel (the whole Vitrino, one part through the real config) took the hook past 10 s under the
// load of a full `pnpm test`.
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function records(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

/**
 * The JSON report of `--list` as the tests of each project, by the name the list reporter prints:
 * describes and test title, joined by " › ".
 */
function byProject(report: unknown): Map<string, string[]> {
  const listed = new Map<string, string[]>();
  const visit = (suite: Record<string, unknown>, describes: readonly string[]): void => {
    for (const spec of records(suite.specs)) {
      const name = [...describes, String(spec.title)].join(" › ");
      for (const test of records(spec.tests)) {
        const project = String(test.projectName);
        const names = listed.get(project) ?? [];
        names.push(name);
        listed.set(project, names);
      }
    }
    for (const child of records(suite.suites)) {
      visit(child, [...describes, String(child.title)]);
    }
  };
  for (const fileSuite of isRecord(report) ? records(report.suites) : []) {
    visit(fileSuite, []);
  }
  return listed;
}

/** One listing through playwright.vitrino-partoj.config.ts, with VITRINO_PARTO set to `draht`. */
async function list(draht: string): Promise<Map<string, string[]>> {
  const { stdout } = await run(
    process.execPath,
    [
      playwrightCli,
      "test",
      "--config",
      "playwright.vitrino-partoj.config.ts",
      "--list",
      "--reporter=json",
    ],
    { cwd: packageDir, env: { ...process.env, VITRINO_PARTO: draht }, maxBuffer: 64 * 1024 * 1024 },
  );
  return byProject(JSON.parse(stdout));
}

const sorted = (names: Iterable<string>): string[] => [...names].sort();

const PARTOJ = Object.keys(VITRINO_PARTOJ);
/** The part the real config selects: the last, the rest of its group after all others. */
const DRAHT = PARTOJ.at(-1);

let listed = new Map<string, string[]>();

/** The names of the tests Playwright selected for a value of VITRINO_PARTO ("" for unset). */
function select(value: string): string[] {
  return listed.get(value === "" ? "alle" : value) ?? [];
}

beforeAll(async () => {
  if (DRAHT !== undefined) listed = await list(DRAHT);
});

describe("the parts of the Vitrino (Spec 040 B-1)", () => {
  it("lists the whole Vitrino, every test under one name", () => {
    const all = select("");
    expect(all.length).toBeGreaterThan(0);
    expect(new Set(all).size).toBe(all.length);
  });

  it("the parts together are every test, no test in two parts, no part empty", () => {
    const violations: string[] = [];
    if (PARTOJ.length === 0) violations.push("no parts");
    const owner = new Map<string, string>();
    for (const parto of PARTOJ) {
      const selected = select(parto);
      if (selected.length === 0) violations.push(`${parto}: empty`);
      for (const name of selected) {
        const other = owner.get(name);
        if (other !== undefined) violations.push(`${name}: in ${other} and ${parto}`);
        owner.set(name, parto);
      }
    }
    for (const name of select("")) {
      if (!owner.has(name)) violations.push(`${name}: in no part`);
    }
    expect(violations).toEqual([]);
  });

  it("selects through playwright.vitrino.config.ts, from VITRINO_PARTO, what vitrinoAuswahl selects", () => {
    expect(DRAHT).toBeDefined();
    const wired = listed.get("draht") ?? [];
    // Fewer than all: without the wiring, `draht` would list the whole Vitrino.
    expect(wired.length).toBeGreaterThan(0);
    expect(wired.length).toBeLessThan(select("").length);
    expect(sorted(wired)).toEqual(sorted(select(DRAHT ?? "")));
  });

  it("keeps werkstatt and cetero as the unions of their parts", () => {
    for (const grupo of ["werkstatt", "cetero"] as const) {
      const parts = PARTOJ.filter((parto) => VITRINO_PARTOJ[parto]?.grupo === grupo);
      expect(parts.length, grupo).toBeGreaterThan(0);
      expect(sorted(select(grupo)), grupo).toEqual(sorted(parts.flatMap((parto) => select(parto))));
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
