// Spec 040 T-7 (C-4, AC-B10, AC-B11): with FM_AUSGABE=knapp a Vitest run prints one line per red
// test with its first error (at most 20 lines of it), then one summary line that names the full
// report; without it the output stays Vitest's own. A JUnit file is written always, silently,
// into test-reports/ of the package (ignored by git, uploaded by CI).
//
// The format lines are tested as pure functions; the tiny suite in test/fixtures/ci/knapp/ (one
// green test, one red) runs once, through the reporter, in a Vitest process of its own. The last
// test reads the Vitest configs of every package: each writes the terse output and its JUnit.
import { execFile } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import {
  fehlerText,
  fehlerZeile,
  MAX_FEHLER_ZEILEN,
  summenZeile,
} from "../../../../scripts/reporter/knapp.mjs";
import {
  JunitVitest,
  KnappVitest,
  vitestAusgabe,
} from "../../../../scripts/reporter/knapp-vitest.mjs";

const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const fixtureDir = fileURLToPath(new URL("../../test/fixtures/ci/knapp/", import.meta.url));
const reports = `${fixtureDir}test-reports/`;
const vitestCli = fileURLToPath(new URL("../../node_modules/vitest/vitest.mjs", import.meta.url));

/** The summary line of C-4; the path is relative to the repository root. */
const SUMMARY =
  /^1 bestanden, 1 rot, 0 übersprungen, 0 wackelig in \d+\.\d s · Protokoll: packages\/modelo\/test\/fixtures\/ci\/knapp\/test-reports\/knapp\/junit\.xml$/;

interface Lauf {
  code: number;
  stdout: string;
  stderr: string;
}

/** The fixture suite, terse, in a Vitest of its own (none of this run's VITEST_* variables). */
function run(): Promise<Lauf> {
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith("VITEST")),
  );
  return new Promise((done) => {
    execFile(
      process.execPath,
      [vitestCli, "run", "--config", "vitest.knapp.config.ts"],
      { cwd: fixtureDir, env: { ...env, FM_AUSGABE: "knapp" } },
      (error, stdout, stderr) => {
        const code = error === null ? 0 : typeof error.code === "number" ? error.code : -1;
        done({ code, stdout, stderr });
      },
    );
  });
}

let lauf: Lauf = { code: -1, stdout: "", stderr: "" };

beforeAll(async () => {
  rmSync(reports, { recursive: true, force: true });
  lauf = await run();
});

describe("the lines of the terse output (scripts/reporter/knapp.mjs, C-4)", () => {
  it("names a red test by file, line and title path", () => {
    expect(fehlerZeile({ datei: "packages/x/src/a.test.ts", zeile: 12, titel: "a › b" })).toBe(
      "✘ packages/x/src/a.test.ts:12 › a › b",
    );
    expect(fehlerZeile({ datei: "packages/x/src/a.test.ts", titel: "a" })).toBe(
      "✘ packages/x/src/a.test.ts › a",
    );
  });

  it("sums up the run in one line with the path of the full report", () => {
    expect(
      summenZeile({
        bestanden: 551,
        rot: 2,
        uebersprungen: 3,
        wackelig: 1,
        ms: 65_432,
        protokoll: "packages/metiejo/test-reports/vitest/junit.xml",
      }),
    ).toBe(
      "551 bestanden, 2 rot, 3 übersprungen, 1 wackelig in 65.4 s · Protokoll: packages/metiejo/test-reports/vitest/junit.xml",
    );
  });

  it("indents the first error, without colours, blank lines and frames of node_modules, cut at 20 lines", () => {
    const stack = [
      "\u001b[31mAssertionError: expected 2 to be 3\u001b[39m",
      "",
      "    at /repo/packages/x/src/a.test.ts:9:19",
      "    at file:///repo/node_modules/.pnpm/@vitest+runner/index.js:1:1",
      "    at node:internal/process/task_queues:105:5",
    ].join("\n");
    expect(fehlerText(stack)).toEqual([
      "  AssertionError: expected 2 to be 3",
      "    at /repo/packages/x/src/a.test.ts:9:19",
    ]);
    const long = Array.from({ length: 50 }, (_, index) => `line ${index}`).join("\n");
    expect(MAX_FEHLER_ZEILEN).toBe(20);
    expect(fehlerText(long)).toHaveLength(20);
    expect(fehlerText(long).at(-1)).toBe("  line 19");
  });
});

describe("the terse output of Vitest (scripts/reporter/knapp-vitest.mjs, C-4)", () => {
  it("without FM_AUSGABE keeps Vitest's own reporters and adds only the JUnit file", () => {
    const standard = ["default"];
    for (const env of [{}, { FM_AUSGABE: "" }, { FM_AUSGABE: "lang" }]) {
      const { reporters, ...rest } = vitestAusgabe("x", standard, env);
      expect(rest).toEqual({});
      expect(reporters.slice(0, -1)).toEqual(standard);
      const junit = reporters.at(-1);
      expect(junit).toBeInstanceOf(JunitVitest);
      expect(junit instanceof JunitVitest && junit.datei).toBe("test-reports/x/junit.xml");
    }
  });

  it("with FM_AUSGABE=knapp reports tersely, names the JUnit file and asks for test locations", () => {
    const { reporters, includeTaskLocation } = vitestAusgabe("x", ["default"], {
      FM_AUSGABE: "knapp",
    });
    expect(includeTaskLocation).toBe(true);
    expect(reporters).toHaveLength(2);
    const [knapp, junit] = reporters;
    expect(knapp).toBeInstanceOf(KnappVitest);
    expect(knapp instanceof KnappVitest && knapp.protokoll).toBe("test-reports/x/junit.xml");
    expect(junit).toBeInstanceOf(JunitVitest);
  });

  it("prints the red test with its first error and one summary line, nothing else", () => {
    const lines = lauf.stdout.trimEnd().split("\n");
    expect(lines[0]).toMatch(
      /^✘ packages\/modelo\/test\/fixtures\/ci\/knapp\/knapp\.fixture\.ts:\d+ › knapp › red$/,
    );
    const error = lines.slice(1, -1);
    expect(error.length).toBeGreaterThan(0);
    expect(error.length).toBeLessThanOrEqual(MAX_FEHLER_ZEILEN);
    for (const line of error) expect(line).toMatch(/^ {2}\S/);
    expect(error[0]).toContain("expected 2 to be 3");
    expect(lines.at(-1)).toMatch(SUMMARY);
    expect(lauf.stderr).toBe("");
    expect(lauf.code).toBe(1);
  });

  it("writes the JUnit report of the run", () => {
    const junit = `${reports}knapp/junit.xml`;
    expect(existsSync(junit)).toBe(true);
    const xml = readFileSync(junit, "utf8");
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>\n<testsuites /);
    expect(xml).toMatch(/<testsuites [^>]*tests="2"[^>]*failures="1"/);
    expect(xml).toContain('<testcase classname="knapp.fixture.ts" name="knapp › red"');
    expect(xml).toContain("<failure ");
  });

  it("every package's Vitest config reports through vitestAusgabe, into a folder of its own", () => {
    const configs = readdirSync(`${repoRoot}packages`).flatMap((pkg) =>
      ["vitest.config.ts", "vitest.bazo.config.ts"]
        .map((file) => `${repoRoot}packages/${pkg}/${file}`)
        .filter((path) => existsSync(path)),
    );
    expect(configs.length).toBeGreaterThan(8);
    for (const path of configs) {
      const name = path.endsWith("vitest.bazo.config.ts") ? "vitest-bazo" : "vitest";
      expect(readFileSync(path, "utf8"), path).toContain(
        `vitestAusgabe("${name}", configDefaults.reporters)`,
      );
    }
  });
});
