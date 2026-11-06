import { defineConfig } from "@playwright/test";
import { playwrightAusgabe } from "../../scripts/reporter/knapp-playwright.mjs";
import base from "./playwright.config.js";

// check:alirebleco-eroj (Spec 003 T013): the rendered accessibility check, a CI step of its own.
// biome-ignore lint/style/noDefaultExport: Playwright loads its config from the default export.
export default defineConfig({
  ...base,
  testMatch: "**/alirebleco.check.ts",
  timeout: 300_000,
  // Spec 042 T1 (D-02): no trace here; the Eroj shards alone keep one (playwright.config.ts).
  use: { ...base.use, trace: "off" },
  // Spec 040 T-7 (C-4): its reports in a folder of their own, test-reports/playwright-alirebleco/.
  reporter: playwrightAusgabe("playwright-alirebleco"),
});
