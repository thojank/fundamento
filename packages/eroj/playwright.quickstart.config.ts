import { defineConfig } from "@playwright/test";
import { playwrightAusgabe } from "../../scripts/reporter/knapp-playwright.mjs";
import base from "./playwright.config.js";

// check:quickstart (Spec 003 T027, AK-07): installs the packed Eroj in a fresh Vite project and
// builds it. Like the Make Kit check it runs outside the parallel test gate, which would otherwise
// measure the machine's load; one engine is enough, the rendering is proved in three elsewhere.
// biome-ignore lint/style/noDefaultExport: Playwright loads its config from the default export.
export default defineConfig({
  ...base,
  // Spec 040 T-7 (C-4): its reports in a folder of their own, test-reports/playwright-quickstart/.
  reporter: playwrightAusgabe("playwright-quickstart"),
  testMatch: "**/quickstart.spec.ts",
  testIgnore: [],
  timeout: 900_000,
  projects: [base.projects?.[0] ?? { name: "chromium" }],
});
