// The focus indicator in forced colors (Spec 003 F5). Windows high contrast drops shadows and
// replaces colours with system colours; a focus ring that lives in a box-shadow disappears there.
// The ring must therefore be an outline, and a non-keyboard focus must not remove it by width.

import { expect, test } from "@playwright/test";
import { TAB } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

test.use({ forcedColors: "active" });

test("the keyboard focus stays visible in forced colors", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "forcedColors is emulated in Chromium");
  await serve(
    page,
    out,
    `<fm-butono id="a">Speichern</fm-butono><fm-butono id="b">Abbrechen</fm-butono>`,
  );
  await page.keyboard.press(TAB(browserName));
  const focused = await page.locator("#a").evaluate((element) => {
    const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
    const style = getComputedStyle(control);
    return {
      width: Number.parseFloat(style.outlineWidth),
      style: style.outlineStyle,
      color: style.outlineColor,
      shadow: style.boxShadow,
    };
  });
  expect(focused.style).not.toBe("none");
  expect(focused.width).toBeGreaterThan(0);
  expect(focused.color).not.toBe("rgba(0, 0, 0, 0)");

  // The gap ring lives in a box-shadow, and forced colors drop shadows: the indicator must not
  // depend on it.
  expect(focused.shadow).toBe("none");

  // An unfocused button shows no ring. A user agent reports a default outline width even when
  // nothing is painted, so the style decides.
  const resting = await page.locator("#b").evaluate((element) => {
    const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
    const style = getComputedStyle(control);
    return { width: Number.parseFloat(style.outlineWidth), style: style.outlineStyle };
  });
  expect(resting.style === "none" || resting.width === 0).toBe(true);
});
