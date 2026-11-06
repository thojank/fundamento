// Spec 042 T1 (D-01, D-02): the Eroj shards keep a trace of every red test, and nothing else
// changes. The config of the shards (playwright.config.ts) records with "retain-on-failure"; in
// CI its HTML report copies the trace into test-reports/playwright/html/data/, which the step
// "Testberichte" uploads. The derived configs spread that config and would inherit the trace;
// each switches it off, so the timing tests (M5) and the long accessibility check run as before.
// No config retries a test, and every test timeout stays where it was.
import type { PlaywrightTestConfig } from "@playwright/test";
import { describe, expect, it } from "vitest";
import alirebleco from "../playwright.alirebleco.config.js";
import base from "../playwright.config.js";
import makeKit from "../playwright.make-kit.config.js";
import quickstart from "../playwright.quickstart.config.js";
import vitrino from "../playwright.vitrino.config.js";
import vitrinoPartoj from "../playwright.vitrino-partoj.config.js";

/**
 * The trace of each project as Playwright resolves it: the project's own `use` over the config's.
 * Unset means Playwright's default, "off".
 */
function traces(config: PlaywrightTestConfig): unknown[] {
  return (config.projects ?? [{}]).map(
    (project) => ({ ...config.use, ...project.use }).trace ?? "off",
  );
}

/** Every config of the Eroj with the test timeout it had before Spec 042. */
const CONFIGS = [
  { name: "playwright.config.ts", config: base, timeout: 120_000 },
  { name: "playwright.vitrino.config.ts", config: vitrino, timeout: 300_000 },
  { name: "playwright.vitrino-partoj.config.ts", config: vitrinoPartoj, timeout: 300_000 },
  { name: "playwright.alirebleco.config.ts", config: alirebleco, timeout: 300_000 },
  { name: "playwright.make-kit.config.ts", config: makeKit, timeout: 900_000 },
  { name: "playwright.quickstart.config.ts", config: quickstart, timeout: 900_000 },
] as const;

const DERIVED = CONFIGS.filter(({ config }) => config !== base);

describe("the trace of the Eroj shards (Spec 042 T1)", () => {
  it('records a trace in the shards and keeps it for a red test ("retain-on-failure")', () => {
    expect(base.use?.trace).toBe("retain-on-failure");
    expect(traces(base).length).toBeGreaterThan(0);
    for (const trace of traces(base)) expect(trace).toBe("retain-on-failure");
  });

  it.each(DERIVED)("records no trace in $name (D-02)", ({ config }) => {
    for (const trace of traces(config)) expect(trace).toBe("off");
  });

  it.each(CONFIGS)("retries no test in $name", ({ config }) => {
    expect(config.retries).toBeUndefined();
    for (const project of config.projects ?? []) expect(project.retries).toBeUndefined();
  });

  it.each(CONFIGS)("keeps the test timeout of $name", ({ config, timeout }) => {
    expect(config.timeout).toBe(timeout);
  });
});
