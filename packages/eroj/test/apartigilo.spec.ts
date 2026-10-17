// fm-apartigilo in the browser (Spec 014 ②; G5, plan ② D-06): a separator with its orientation,
// none where decorative; its line one edge in color.border.subtle at border.width.default; a
// vertical line stands at least a control's height. Chromium, Firefox and WebKit.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const lineOf = (page: Parameters<typeof serve>[0], id: string) =>
  page.locator(`#${id}`).evaluate((element) => {
    const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
    const style = getComputedStyle(control);
    return {
      role: control.getAttribute("role"),
      orientation: control.getAttribute("aria-orientation"),
      top: style.borderBlockStartWidth,
      start: style.borderInlineStartWidth,
      bottom: style.borderBlockEndWidth,
      colour: style.borderBlockStartColor,
      height: control.getBoundingClientRect().height,
      width: control.getBoundingClientRect().width,
    };
  });

test.describe("fm-apartigilo behaviour", () => {
  test("a horizontal separator: role separator, aria-orientation horizontal, the line along the start edge, the width of its container", async ({
    page,
  }) => {
    await serve(page, out, `<div style="inline-size: 20rem"><fm-apartigilo id="h"></fm-apartigilo></div>`);
    await expect(page.getByRole("separator")).toHaveCount(1);
    const line = await lineOf(page, "h");
    const token = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--fm-border-width-default").trim(),
    );
    expect(line.role).toBe("separator");
    expect(line.orientation).toBe("horizontal");
    expect(line.top).toBe(token);
    expect(line.bottom).toBe("0px");
    expect(line.start).toBe("0px");
    expect(Math.round(line.width)).toBe(320);
  });

  test("a vertical separator: aria-orientation vertical, the line along the inline start, at least a control's height", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div style="display: flex; align-items: center"><span>Eins</span><fm-apartigilo id="v" orientation="vertical"></fm-apartigilo><span>Zwei</span></div>`,
    );
    const line = await lineOf(page, "v");
    const control = await page.evaluate(() =>
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--fm-size-control-medium"),
      ),
    );
    expect(line.orientation).toBe("vertical");
    expect(line.top).toBe("0px");
    expect(line.start).not.toBe("0px");
    expect(line.height).toBeGreaterThanOrEqual(control);
  });

  test("decorative: role none, nothing for assistive technology; the line stays", async ({ page }) => {
    await serve(page, out, `<fm-apartigilo id="d" decorative></fm-apartigilo>`);
    await expect(page.getByRole("separator")).toHaveCount(0);
    const line = await lineOf(page, "d");
    expect(line.role).toBe("none");
    expect(line.orientation).toBeNull();
    expect(line.top).not.toBe("0px");
    await page.locator("#d").evaluate((element) => element.removeAttribute("decorative"));
    await expect(page.getByRole("separator")).toHaveCount(1);
  });
});
