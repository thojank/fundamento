import { defineConfig } from "@playwright/test";
import base from "./playwright.config.js";

// check:make-kit (Spec 003 T019, AK-08): installs the packed kit in a fresh project and builds it.
// One engine is enough here: the rendering is proved in three by the other checks.
// biome-ignore lint/style/noDefaultExport: Playwright loads its config from the default export.
export default defineConfig({
  ...base,
  testMatch: "**/make-kit.check.ts",
  timeout: 900_000,
  projects: [base.projects?.[0] ?? { name: "chromium" }],
});
