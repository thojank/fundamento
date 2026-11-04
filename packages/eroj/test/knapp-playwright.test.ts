// Spec 040 T-7 (C-4, AC-B10, AC-B11): with FM_AUSGABE=knapp a Playwright run prints one line per red
// test with its first error, then one summary line that names the full report; without it the
// output stays the list reporter's. JUnit is written always, into a folder of its own outside
// Playwright's outputDir (test-results/, which Playwright empties at the start); the HTML report
// beside it only in CI, where it prints nothing.
//
// The tiny suite in test/fixtures/knapp/ (one green test, one red, no browser) runs once, through
// the reporter, in a Playwright process of its own.
import { execFile } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import {
  KNAPP_PLAYWRIGHT,
  playwrightAusgabe,
} from "../../../scripts/reporter/knapp-playwright.mjs";

const packageDir = fileURLToPath(new URL("..", import.meta.url));
const reports = fileURLToPath(new URL("fixtures/knapp/test-reports/", import.meta.url));
const playwrightCli = fileURLToPath(
  new URL("../node_modules/@playwright/test/cli.js", import.meta.url),
);

/** The summary line of C-4; the path is relative to the repository root. */
const SUMMARY =
  /^1 bestanden, 1 rot, 0 übersprungen, 0 wackelig in \d+\.\d s · Protokoll: packages\/eroj\/test\/fixtures\/knapp\/test-reports\/knapp\/junit\.xml$/;

interface Lauf {
  code: number;
  stdout: string;
  stderr: string;
}

/** The fixture suite, terse, outside CI (no HTML report). */
function run(): Promise<Lauf> {
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => key !== "CI" && !key.startsWith("VITEST")),
  );
  return new Promise((done) => {
    execFile(
      process.execPath,
      [playwrightCli, "test", "--config", "test/fixtures/knapp/playwright.knapp.config.ts"],
      { cwd: packageDir, env: { ...env, FM_AUSGABE: "knapp" } },
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

describe("the terse output of Playwright (Spec 040 T-7, C-4)", () => {
  it("without FM_AUSGABE keeps the list reporter and adds only the JUnit file, the HTML report in CI", () => {
    const junit = ["junit", { outputFile: "test-reports/x/junit.xml" }];
    expect(playwrightAusgabe("x", {})).toEqual([["list"], junit]);
    expect(playwrightAusgabe("x", { FM_AUSGABE: "" })).toEqual([["list"], junit]);
    expect(playwrightAusgabe("x", { CI: "true" })).toEqual([
      ["list"],
      junit,
      ["html", { outputFolder: "test-reports/x/html", open: "never" }],
    ]);
  });

  it("with FM_AUSGABE=knapp replaces the list reporter by the terse one, naming the JUnit file", () => {
    expect(playwrightAusgabe("x", { FM_AUSGABE: "knapp" })).toEqual([
      [KNAPP_PLAYWRIGHT, { protokoll: "test-reports/x/junit.xml" }],
      ["junit", { outputFile: "test-reports/x/junit.xml" }],
    ]);
  });

  it("prints the red test with its first error and one summary line, nothing else", () => {
    const lines = lauf.stdout.trimEnd().split("\n");
    expect(lines[0]).toMatch(
      /^✘ packages\/eroj\/test\/fixtures\/knapp\/knapp\.fixture\.ts:\d+ › knapp › red$/,
    );
    const error = lines.slice(1, -1);
    expect(error.length).toBeGreaterThan(0);
    expect(error.length).toBeLessThanOrEqual(20);
    for (const line of error) expect(line).toMatch(/^ {2}\S/);
    expect(error.join("\n")).toContain("Expected: 3");
    expect(lines.at(-1)).toMatch(SUMMARY);
    expect(lauf.stderr).toBe("");
    expect(lauf.code).toBe(1);
  });

  it("writes the full JUnit report of the run outside Playwright's outputDir", () => {
    const junit = `${reports}knapp/junit.xml`;
    expect(existsSync(junit)).toBe(true);
    const xml = readFileSync(junit, "utf8");
    expect(xml).toMatch(/<testsuites [^>]*tests="2"[^>]*failures="1"/);
    expect(xml).toContain('name="knapp › red"');
  });

  it("every Playwright config of the Eroj reports into a folder of its own", async () => {
    const configs: ReadonlyArray<readonly [file: string, name: string]> = [
      ["playwright.config.ts", "playwright"],
      ["playwright.alirebleco.config.ts", "playwright-alirebleco"],
      ["playwright.make-kit.config.ts", "playwright-make-kit"],
      ["playwright.quickstart.config.ts", "playwright-quickstart"],
      ["playwright.vitrino.config.ts", "playwright-vitrino"],
    ];
    for (const [file, name] of configs) {
      const module: unknown = await import(`../${file}`);
      const config =
        typeof module === "object" && module !== null && "default" in module
          ? module.default
          : undefined;
      const reporter =
        typeof config === "object" && config !== null && "reporter" in config
          ? config.reporter
          : undefined;
      expect(reporter, file).toEqual(playwrightAusgabe(name));
    }
  });
});
