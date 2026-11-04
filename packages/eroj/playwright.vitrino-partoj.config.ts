import { defineConfig } from "@playwright/test";
import vitrino from "./playwright.vitrino.config.js";
import { VITRINO_PARTOJ, vitrinoAuswahl } from "./test/vitrino-partoj.js";

// Spec 040 B-7: the config of test/vitrino-partoj.test.ts alone, never of a check or of CI. One
// `playwright test --list` through it lists the Vitrino once per selection, a project each, and
// Playwright selects, not a replica of its matching in the test:
// - `draht` has no selection of its own: the one playwright.vitrino.config.ts made of
//   VITRINO_PARTO applies, as the test sets it. That proves the wiring.
// - `alle`, every part and both groups carry their own grep and grepInvert, both always given, so
//   nothing of the wired selection reaches them.
// Before, the test started Playwright twice (the whole Vitrino and one part); under the load of a
// full `pnpm test` its hook ran past 10 s.

/** Matches every title. */
const ALLES = /(?:)/;
/** Matches no title. */
const NICHTS = /(?!)/;

const project = vitrino.projects?.[0] ?? { name: "chromium" };

/** The values of VITRINO_PARTO the test compares: unset, every part, both groups. */
const AUSWAHLEN = ["", ...Object.keys(VITRINO_PARTOJ), "werkstatt", "cetero"];

// biome-ignore lint/style/noDefaultExport: Playwright loads its config from the default export.
export default defineConfig({
  ...vitrino,
  projects: [
    { ...project, name: "draht" },
    ...AUSWAHLEN.map((value) => {
      const { grep, grepInvert } = vitrinoAuswahl(value);
      return {
        ...project,
        name: value === "" ? "alle" : value,
        grep: grep ?? ALLES,
        grepInvert: grepInvert ?? NICHTS,
      };
    }),
  ],
});
