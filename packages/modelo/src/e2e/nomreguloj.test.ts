// FUND-6.1 end-to-end, AK-03 meta-assertion: the NomRegulo fixture tables and the fast-check
// property tests exist and run. The fixture tables are private to `nomreguloj/fixtures.test.ts`,
// so they are counted robustly by running both test files in a child Vitest process with the JSON
// reporter and counting the executed fixture tests per Celo.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CELOJ } from "../nomreguloj/index.js";
import { MODELO_DIR, type Run, removeTempDirs, runNode, tempDir } from "./test-doubles/harness.js";

const VITEST = join(MODELO_DIR, "node_modules", "vitest", "vitest.mjs");
const FIXTURE_FILE = "src/nomreguloj/fixtures.test.ts";
const PROPERTY_FILE = "src/nomreguloj/properties.test.ts";

interface AssertionResult {
  ancestorTitles: string[];
  title: string;
  status: string;
}

interface JsonReport {
  success: boolean;
  numFailedTests: number;
  numPendingTests: number;
  testResults: { name: string; assertionResults: AssertionResult[] }[];
}

let run: Run | undefined;
let report: JsonReport | undefined;

beforeAll(async () => {
  const outputFile = join(tempDir("nomreguloj"), "report.json");
  run = await runNode(
    VITEST,
    ["run", FIXTURE_FILE, PROPERTY_FILE, "--reporter=json", `--outputFile=${outputFile}`],
    MODELO_DIR,
  );
  report = JSON.parse(readFileSync(outputFile, "utf8")) as JsonReport;
}, 60_000);

afterAll(removeTempDirs);

function resultsOf(file: string): AssertionResult[] {
  const entry = report?.testResults.find((result) => result.name.endsWith(file));
  return entry?.assertionResults ?? [];
}

describe("AK-03: NomRegulo fixtures and property tests", () => {
  it("AK-03: the NomRegulo fixture and property tests run and pass", () => {
    expect(run?.code, run?.stderr).toBe(0);
    expect(report?.success).toBe(true);
    expect(report?.numFailedTests).toBe(0);
    expect(report?.numPendingTests).toBe(0);
  });

  it.each(CELOJ)("AK-03: Celo %s has at least ten executed, passing derive fixtures", (celo) => {
    const derived = resultsOf(FIXTURE_FILE).filter(
      (result) =>
        result.ancestorTitles.includes(`${celo} NomRegulo fixtures`) &&
        result.title.startsWith("derives "),
    );
    expect(derived.length).toBeGreaterThanOrEqual(10);
    expect(derived.every((result) => result.status === "passed")).toBe(true);
  });

  it.each(["injective", "round-trips", "invert accepts nothing", "deterministic"])(
    "AK-03: a passing fast-check property test covers '%s'",
    (topic) => {
      const matching = resultsOf(PROPERTY_FILE).filter((result) =>
        `${result.ancestorTitles.join(" ")} ${result.title}`.includes(topic),
      );
      expect(matching.length).toBeGreaterThan(0);
      expect(matching.every((result) => result.status === "passed")).toBe(true);
    },
  );

  it("AK-03: the property tests use fast-check with a fixed seed over grammar-conforming names", () => {
    const source = readFileSync(join(MODELO_DIR, PROPERTY_FILE), "utf8");
    expect(source).toMatch(/from "fast-check"/);
    expect(source).toMatch(/seed: \d+/);
    expect(source).toContain("isTokenName");
  });
});
