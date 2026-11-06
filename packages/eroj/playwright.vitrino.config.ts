import { defineConfig } from "@playwright/test";
import { playwrightAusgabe } from "../../scripts/reporter/knapp-playwright.mjs";
import base from "./playwright.config.js";
import { vitrinoAuswahl } from "./test/vitrino-partoj.js";

// Spec 029 ①b (B-1b-6), Spec 040 B-1: CI runs the Vitrino in parts, a runner each – VITRINO_PARTO
// names one of test/vitrino-partoj.ts (werkstatt-1, werkstatt-2, cetero-1 …). `werkstatt` and
// `cetero` still select their groups; together the parts are every test (vitrino-partoj.test.ts).
// Unset (locally, anywhere else) the whole Vitrino runs; an unknown value throws.

// check:vitrino (Spec 004 T012): builds the projections and drives the one HTML file. One engine
// is enough — the rendering of the Eroj is proved in three by the other checks.
// biome-ignore lint/style/noDefaultExport: Playwright loads its config from the default export.
export default defineConfig({
  ...base,
  // Spec 040 T-7 (C-4): its reports in a folder of their own, test-reports/playwright-vitrino/.
  reporter: playwrightAusgabe("playwright-vitrino"),
  testMatch: "**/vitrino.check.ts",
  testIgnore: [],
  timeout: 300_000,
  // Spec 042 T1 (D-02): no trace here; the Eroj shards alone keep one (playwright.config.ts).
  use: { ...base.use, trace: "off" },
  projects: [base.projects?.[0] ?? { name: "chromium" }],
  ...vitrinoAuswahl(process.env.VITRINO_PARTO),
});
