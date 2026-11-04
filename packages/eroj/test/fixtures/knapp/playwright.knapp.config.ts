import { defineConfig } from "@playwright/test";
import { playwrightAusgabe } from "../../../../../scripts/reporter/knapp-playwright.mjs";

// Spec 040 T-7: the tiny suite of test/knapp-playwright.test.ts – one green test, one red, no
// browser. Its reports land in test-reports/knapp/ next to this file (ignored by git).
// biome-ignore lint/style/noDefaultExport: Playwright loads its config from the default export.
export default defineConfig({
  testDir: ".",
  testMatch: "knapp.fixture.ts",
  workers: 1,
  reporter: playwrightAusgabe("knapp"),
});
