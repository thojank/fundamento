import { configDefaults, defineConfig } from "vitest/config";
import { vitestAusgabe } from "../../../../../../scripts/reporter/knapp-vitest.mjs";

// Spec 040 T-7: the tiny suite of src/ci/knapp-vitest.test.ts – one green test, one red. Its JUnit
// lands in test-reports/knapp/ next to this file (ignored by git).
// biome-ignore lint/style/noDefaultExport: Vitest loads its config from the default export.
export default defineConfig({
  test: {
    include: ["knapp.fixture.ts"],
    ...vitestAusgabe("knapp", configDefaults.reporters),
  },
});
