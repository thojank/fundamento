// Spec 036 Teil 5 ②b-2 (Spec 029 abgleich.json, aspects "achsen" and "groessen") in the browser:
// the axes and values of the fields and choices as the Skemo states them.

import { expect, type Page, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const options = (...words: string[]) =>
  words.map((word) => `<data slot="options" value="${word.toLowerCase()}">${word}</data>`).join("");

/** The box of the host and of every part in its shadow tree, rounded to the pixel. */
async function boxesOf(page: Page, selector: string) {
  return page.evaluate((query) => {
    const host = document.querySelector(query) as HTMLElement;
    const round = (rect: DOMRect) => [Math.round(rect.width), Math.round(rect.height)];
    const parts = Object.fromEntries(
      [...(host.shadowRoot?.querySelectorAll("[part]") ?? [])].map((element) => [
        element.getAttribute("part"),
        round(element.getBoundingClientRect()),
      ]),
    );
    return { host: round(host.getBoundingClientRect()), parts };
  }, selector);
}

/** A-elekto-2, A-markobutono-2, A-sxaltilo-2 with ②a-2: large stays one release as medium. */
const TWO_SIZES: Readonly<Record<string, (attributes: string) => string>> = {
  elekto: (a) =>
    `<fm-elekto name="versand-${a.length}" ${a}>Versandart${options("Standard", "Express")}</fm-elekto>`,
  markobutono: (a) => `<fm-markobutono ${a}>Newsletter</fm-markobutono>`,
  sxaltilo: (a) => `<fm-sxaltilo ${a}>Benachrichtigungen</fm-sxaltilo>`,
};

test.describe("②b-2 A-*-2: large is a deprecated alias of medium", () => {
  for (const [ero, markup] of Object.entries(TWO_SIZES)) {
    test(`${ero}: size=large looks as size=medium and says it is deprecated`, async ({ page }) => {
      const warnings: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "warning") warnings.push(message.text());
      });
      await serve(
        page,
        out,
        `<div id="l">${markup('size="large"')}</div><div id="m">${markup('size="medium"')}</div>`,
      );
      const large = await boxesOf(page, `#l fm-${ero}`);
      const medium = await boxesOf(page, `#m fm-${ero}`);
      expect(large).toEqual(medium);
      expect(warnings.join("\n")).toContain(`fm-${ero}: size="large" is deprecated`);
    });
  }
});
