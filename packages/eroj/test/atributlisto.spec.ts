// fm-atributlisto in the browser (Spec 011 ④; G4, G7, E10, plan ④ D-10): the platform's own dl
// in the light DOM, styled by a host-scoped stylesheet the document adopts; columns put the term
// beside the value, stacked above it; an empty value shows a dash and is heard as "keine Angabe";
// the list is named by its label prop. Chromium, Firefox and WebKit.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const atributlisto = input.modelo.eroj.find((entry) => entry.ero.name === "atributlisto");
if (atributlisto === undefined) throw new Error("atributlisto missing");
const texts = atributlisto.skemo.a11y.texts;
if (texts === undefined) throw new Error("the atributlisto says 'keine Angabe'");

const list = (attributes: string) =>
  `<fm-atributlisto id="a" ${attributes}><dl><dt>Version</dt><dd>3</dd><dt>Verantwortlich</dt><dd>Team Fundamento</dd><dt>Gültig seit</dt><dd></dd></dl></fm-atributlisto>`;

test.describe("fm-atributlisto behaviour", () => {
  test("the dl keeps its terms and values; an empty value shows a dash and is heard as 'keine Angabe'", async ({
    page,
  }) => {
    await serve(page, out, list('label="Angaben zum Standard"'));
    await expect(page.locator("#a dt")).toHaveCount(3);
    const last = page.locator("#a dd").last();
    // The dash is a sign of the projection (a vector, no text node), the word is heard.
    const heard = await last.evaluate((element) => ({
      hidden: element.querySelector(".fm-hidden")?.textContent,
      clip: getComputedStyle(element.querySelector(".fm-hidden") as Element).clipPath,
      dash: element.querySelector('svg[aria-hidden="true"] path')?.getAttribute("d"),
    }));
    expect(heard).toEqual({
      hidden: texts["entries-empty"]?.de,
      clip: "inset(50%)",
      dash: "M3 8h10",
    });
    const label = await page.locator("#a dl").getAttribute("aria-label");
    expect(label).toBe("Angaben zum Standard");
    // A value filled in later takes the dash away.
    await last.evaluate((element) => {
      element.textContent = "2026-10-16";
    });
    await expect(last).toHaveText("2026-10-16");
    expect(await last.locator(".fm-hidden").count()).toBe(0);
  });

  test("columns put the term beside the value, stacked above it; the term is muted, the value default", async ({
    page,
  }) => {
    await serve(page, out, list(""));
    const geometry = () =>
      page.locator("#a").evaluate((element) => {
        const dt = element.querySelector("dt") as HTMLElement;
        const dd = element.querySelector("dd") as HTMLElement;
        const root = getComputedStyle(document.documentElement);
        return {
          sameRow: Math.abs(dt.getBoundingClientRect().top - dd.getBoundingClientRect().top) < 2,
          termColour: getComputedStyle(dt).color,
          muted: root.getPropertyValue("--fm-color-text-muted").trim(),
          display: getComputedStyle(element.querySelector("dl") as Element).display,
          margin: getComputedStyle(dd).marginInlineStart,
        };
      });
    const columns = await geometry();
    expect(columns.sameRow).toBe(true);
    expect(columns.display).toBe("grid");
    expect(columns.margin).toBe("0px");
    await page.locator("#a").evaluate((element) => element.setAttribute("layout", "stacked"));
    const stacked = await geometry();
    expect(stacked.sameRow).toBe(false);
  });

  test("the host takes the width of its container; long values wrap", async ({ page }) => {
    await serve(
      page,
      out,
      `<div id="w" style="inline-size: 16rem"><fm-atributlisto id="a"><dl><dt>Verantwortlich</dt><dd>Ein sehr langer Name einer Organisationseinheit, der über mehrere Zeilen läuft</dd></dl></fm-atributlisto></div>`,
    );
    const outer = await page.locator("#w").boundingBox();
    const host = await page.locator("#a").boundingBox();
    expect(Math.round(host?.width ?? 0)).toBe(Math.round(outer?.width ?? 0));
    const lines = await page.locator("#a dd").evaluate((element) => {
      const style = getComputedStyle(element);
      return element.getBoundingClientRect().height / Number.parseFloat(style.lineHeight);
    });
    expect(lines).toBeGreaterThan(1.5);
  });
});
