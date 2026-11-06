import { defineConfig } from "@playwright/test";
import { playwrightAusgabe } from "../../scripts/reporter/knapp-playwright.mjs";
import base from "./playwright.config.js";

// check:make-kit (Spec 003 T019, AK-08): installs the packed kit in a fresh project and builds it.
// One engine is enough here: the rendering is proved in three by the other checks.
// biome-ignore lint/style/noDefaultExport: Playwright loads its config from the default export.
export default defineConfig({
  ...base,
  // Spec 040 T-7 (C-4): its reports in a folder of their own, test-reports/playwright-make-kit/.
  reporter: playwrightAusgabe("playwright-make-kit"),
  testMatch: "**/make-kit.check.ts",
  timeout: 900_000,
  // Spec 042 T1 (D-02): no trace here; the Eroj shards alone keep one (playwright.config.ts).
  use: { ...base.use, trace: "off" },
  projects: [base.projects?.[0] ?? { name: "chromium" }],
});
