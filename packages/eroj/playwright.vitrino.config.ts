import { defineConfig } from "@playwright/test";
import base from "./playwright.config.js";

// Spec 029 ①b (B-1b-6): CI runs the Vitrino in two jobs – VITRINO_PARTO=werkstatt the Werkstatt,
// VITRINO_PARTO=cetero the rest; one pattern for both, so together they are every test. Unset
// (locally, anywhere else) the whole Vitrino runs.
const WERKSTATT = /the Werkstatt/;

function parto(): { grep: RegExp } | { grepInvert: RegExp } | Record<string, never> {
  const value = process.env.VITRINO_PARTO;
  if (value === undefined || value === "") return {};
  if (value === "werkstatt") return { grep: WERKSTATT };
  if (value === "cetero") return { grepInvert: WERKSTATT };
  throw new Error(`VITRINO_PARTO: unknown part "${value}" (werkstatt or cetero)`);
}

// check:vitrino (Spec 004 T012): builds the projections and drives the one HTML file. One engine
// is enough — the rendering of the Eroj is proved in three by the other checks.
// biome-ignore lint/style/noDefaultExport: Playwright loads its config from the default export.
export default defineConfig({
  ...base,
  testMatch: "**/vitrino.check.ts",
  testIgnore: [],
  timeout: 300_000,
  projects: [base.projects?.[0] ?? { name: "chromium" }],
  ...parto(),
});
