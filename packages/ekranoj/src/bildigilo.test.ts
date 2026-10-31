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
import {
  antauxsxargataj,
  CORS_ERARO,
  RetumiloDouble,
  VERA_ERARO,
} from "./test-doubles/retumilo.js";

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

// S037-05 Befund 1: axe-core preloads the stylesheets by XMLHttpRequest; under file:// Chromium
// blocks that with a console error, and an error in the console makes K1 = 0 – no real screen could
// ever turn green. The console must keep the errors of the page, not the ones axe causes.
describe("the console of a render (S037-05 Befund 1)", () => {
  const dokumento = (html: string) => ({ slug: "liste", html });

  it("records no error that axe's stylesheet preload causes, light and dark", async () => {
    const retumilo = new RetumiloDouble();
    const bildigilo = await kreiBildigilon({
      importi: async () => retumilo.playwright(),
      importiAxe: async () => retumilo.axe(),
    });
    const { fakto } = await (bildigilo?.render(dokumento("<main><p>Team Nord</p></main>"), {
      aspektoj: ["komuna"],
      varianto: "F",
    }) ?? Promise.reject(new Error("kein Renderer")));
    expect(retumilo.axeOpcioj).toHaveLength(SKEMOJ_BILDIGO.length);
    expect(fakto.console).toEqual([]);
    expect(fakto.console).not.toContain(CORS_ERARO);
  });

  it("keeps the genuine errors of the page", async () => {
    const retumilo = new RetumiloDouble();
    const bildigilo = await kreiBildigilon({
      importi: async () => retumilo.playwright(),
      importiAxe: async () => retumilo.axe(),
    });
    const { fakto } = await (bildigilo?.render(
      dokumento('<main data-eraro="1"><p>Team Nord</p></main>'),
      { aspektoj: ["komuna"], varianto: "F" },
    ) ?? Promise.reject(new Error("kein Renderer")));
    expect(fakto.console).toEqual([VERA_ERARO]);
  });

  it("still runs the WCAG 2.2 A/AA tags and still preloads media (no-autoplay-audio, wcag2a)", async () => {
    const retumilo = new RetumiloDouble();
    const bildigilo = await kreiBildigilon({
      importi: async () => retumilo.playwright(),
      importiAxe: async () => retumilo.axe(),
    });
    await bildigilo?.render(dokumento("<main></main>"), { aspektoj: ["komuna"], varianto: "F" });
    for (const opcioj of retumilo.axeOpcioj) {
      expect(opcioj?.runOnly).toEqual({ type: "tag", values: [...WCAG_ETIKEDOJ] });
      expect(antauxsxargataj(opcioj)).toEqual(["media"]);
    }
  });

  it("models axe-core's preload rule: default and true preload the CSSOM, assets choose", () => {
    expect(antauxsxargataj(undefined)).toEqual(["cssom", "media"]);
    expect(antauxsxargataj({ preload: true })).toEqual(["cssom", "media"]);
    expect(antauxsxargataj({ preload: false })).toEqual([]);
    expect(antauxsxargataj({ preload: { assets: ["media"] } })).toEqual(["media"]);
  });
});
