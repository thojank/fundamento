import { defineConfig } from "@playwright/test";
import base from "./playwright.config.js";

// check:alirebleco-eroj (Spec 003 T013): the rendered accessibility check, a CI step of its own.
// biome-ignore lint/style/noDefaultExport: Playwright loads its config from the default export.
export default defineConfig({ ...base, testMatch: "**/alirebleco.check.ts", timeout: 300_000 });
