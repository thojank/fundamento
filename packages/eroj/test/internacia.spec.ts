// Internacia in the browser (Spec 003 T014; FR-16, AK-06): right-to-left, text expansion and
// pseudo-localisation. Chromium, Firefox, WebKit.

import { expect, test } from "@playwright/test";
import { TAB } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

/** Pseudo-localisation: accented and non-Latin characters, padded to `factor` of the length. */
function pseudo(text: string, factor: number): string {
  const map: Record<string, string> = { a: "à", c: "ç", e: "é", i: "ï", o: "ö", s: "ſ", u: "ü" };
  const marked = [...text].map((character) => map[character.toLowerCase()] ?? character).join("");
  const padding = "~".repeat(Math.max(0, Math.ceil(text.length * (factor - 1))));
  return `[${marked}${padding ? ` ${padding}` : ""}]`;
}

test("right to left: icon-start sits on the right and the focus ring stays", async ({
  page,
  browserName,
}) => {
  await serve(
    page,
    out,
    `<fm-butono id="a"><svg id="icon" slot="icon-start" aria-hidden="true" width="16" height="16"></svg>Speichern</fm-butono>`,
  );
  const left = await page.locator("#icon").boundingBox();
  await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
  const right = await page.locator("#icon").boundingBox();
  const host = await page.locator("#a").boundingBox();
  expect(left?.x ?? 0).toBeLessThan((host?.x ?? 0) + (host?.width ?? 0) / 2);
  expect(right?.x ?? 0).toBeGreaterThan((host?.x ?? 0) + (host?.width ?? 0) / 2);
  await page.keyboard.press(TAB(browserName));
  const outline = await page
    .locator("#a")
    .evaluate(
      (element) =>
        getComputedStyle(element.shadowRoot?.querySelector('[part="control"]') as Element)
          .outlineWidth,
    );
  expect(Number.parseFloat(outline)).toBeGreaterThan(0);
});

for (const factor of [1.35, 2]) {
  test(`text expansion to ${Math.round(factor * 100)} %: the button grows, nothing is clipped`, async ({
    page,
  }) => {
    const label = "Speichern";
    await serve(page, out, `<fm-butono id="a">${label}</fm-butono>`);
    const before = await page.locator("#a").boundingBox();
    await page.locator("#a").evaluate(
      (element, text) => {
        element.textContent = text;
      },
      pseudo(label, factor),
    );
    const after = await page.locator("#a").boundingBox();
    expect(after?.width ?? 0).toBeGreaterThan(before?.width ?? 0);
    const clipped = await page.locator("#a").evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      return (
        control.scrollWidth > control.clientWidth + 1 ||
        control.scrollHeight > control.clientHeight + 1
      );
    });
    expect(clipped).toBe(false);
  });
}
