// The renderer without a browser (edge case „Bildschirmfoto/Browser nicht verfügbar“): when
// Playwright cannot be loaded or Chromium cannot start, there is no renderer – the run goes on
// without photos and without axe, never green. And the reading of the ARIA snapshot. Browser-free:
// the real Chromium checks are in bildigilo.browser.test.ts (`test:browser`, D-17).

import { describe, expect, it } from "vitest";
import {
  BILDIGO_TEMPOLIMO,
  kreiBildigilon,
  legiAriaFoton,
  SKEMOJ_BILDIGO,
  WCAG_ETIKEDOJ,
} from "./index.js";

describe("kreiBildigilon without a browser", () => {
  it("gives no renderer and one log line when Playwright cannot be loaded", async () => {
    const linioj: string[] = [];
    const bildigilo = await kreiBildigilon({
      importi: async () => {
        throw new Error("Cannot find package 'playwright'");
      },
      log: (linio) => linioj.push(linio),
    });
    expect(bildigilo).toBeUndefined();
    expect(linioj).toHaveLength(1);
    expect(linioj[0]).toMatch(/^Kein Browser: /);
  });

  it("gives no renderer when Chromium does not start", async () => {
    const linioj: string[] = [];
    const bildigilo = await kreiBildigilon({
      importi: async () => ({
        chromium: {
          launch: async () => {
            throw new Error("Executable doesn't exist");
          },
        },
      }),
      log: (linio) => linioj.push(linio),
    });
    expect(bildigilo).toBeUndefined();
    expect(linioj[0]).toMatch(/^Kein Browser: .*Executable doesn't exist/);
  });
});

describe("render settings (as nordstelo)", () => {
  it("checks WCAG 2.2 A/AA in light and dark, and waits no longer than nordstelo", () => {
    expect(WCAG_ETIKEDOJ).toEqual([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
      "wcag22a",
      "wcag22aa",
    ]);
    expect(SKEMOJ_BILDIGO).toEqual(["light", "dark"]);
    expect(BILDIGO_TEMPOLIMO).toBeLessThanOrEqual(30_000);
  });

  it("reads roles, names and levels of an ARIA snapshot", () => {
    expect(
      legiAriaFoton(
        [
          "- main:",
          '  - heading "Standard A-12" [level=1]',
          "  - text: Team Nord",
          '  - link "Weiter zu \\"Detail\\"":',
          "    - /url: detail.html",
          '  - button "Speichern"',
        ].join("\n"),
      ),
    ).toEqual([
      { role: "main", name: "" },
      { role: "heading", name: "Standard A-12", level: 1 },
      { role: "link", name: 'Weiter zu "Detail"' },
      { role: "button", name: "Speichern" },
    ]);
  });
});
