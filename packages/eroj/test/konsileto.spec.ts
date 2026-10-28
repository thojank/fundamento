// fm-konsileto in the browser (Spec 014 ④; G4, G5, plan ④ D-05): a tooltip of the platform —
// shown after the delay while its trigger is hovered or focused, anchored to the trigger (above
// it by default), heard as the trigger's description, gone with Escape, standing while the
// pointer is over it; the text of an icon-only button is not spoken twice. Chromium, Firefox and
// WebKit.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const tooltipOf = (page: Parameters<typeof serve>[0], id: string) =>
  page.locator(`#${id}`).evaluate((element) => {
    // The host is the layer (plan ④ B-7): it is the popover and carries the role; the control
    // inside is the surface with the colours.
    const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
    const box = element.getBoundingClientRect();
    return {
      open: element.matches(":popover-open"),
      role: element.getAttribute("role"),
      top: box.top,
      bottom: box.bottom,
      left: box.left,
      colour: getComputedStyle(control).color,
      fill: getComputedStyle(control).backgroundColor,
    };
  });

const MARKUP =
  '<p>Davor</p><fm-butono id="b" emphasis="low" label="Suchen" style="margin-block-start: 8rem"><fm-ikono name="search"></fm-ikono></fm-butono><fm-konsileto id="t" for="b">Suchen</fm-konsileto><fm-butono id="c">Danach</fm-butono>';

test.describe("fm-konsileto behaviour", () => {
  test("hidden at rest; hover shows it above the trigger after the delay; leaving hides it; the trigger is described by it", async ({
    page,
  }) => {
    await serve(page, out, MARKUP);
    expect((await tooltipOf(page, "t")).open).toBe(false);
    expect(await page.locator("#b").getAttribute("aria-describedby")).toBeNull();
    await page.locator("#b").hover();
    await expect.poll(async () => (await tooltipOf(page, "t")).open).toBe(true);
    await expect(page.getByRole("tooltip", { name: "Suchen" })).toHaveCount(1);
    const shown = await tooltipOf(page, "t");
    const trigger = await page.locator("#b").boundingBox();
    expect(shown.bottom).toBeLessThanOrEqual((trigger?.y ?? 0) + 1);
    expect(shown.role).toBe("tooltip");
    await page.locator("#c").hover();
    await expect.poll(async () => (await tooltipOf(page, "t")).open).toBe(false);
  });

  test("focus shows it too; Escape hides it and keeps the focus; the text of an icon-only button is its label and is not described twice", async ({
    page,
  }) => {
    await serve(page, out, MARKUP);
    await page.locator("#b").focus();
    await expect.poll(async () => (await tooltipOf(page, "t")).open).toBe(true);
    // The tooltip's text is the button's own name: no aria-describedby, nothing is heard twice.
    expect(await page.locator("#b").getAttribute("aria-describedby")).toBeNull();
    await page.keyboard.press("Escape");
    await expect.poll(async () => (await tooltipOf(page, "t")).open).toBe(false);
    await expect.poll(() => page.evaluate(() => document.activeElement?.id ?? "")).toBe("b");
  });

  test("a hint that is not the name describes the trigger (aria-describedby); placement block-end puts it under the trigger; the pointer over it keeps it", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-butono id="b" style="margin-block-start: 2rem">Speichern</fm-butono><fm-konsileto id="t" for="b" placement="block-end">Sichert die Fassung</fm-konsileto><p style="margin-block-start: 10rem">Danach</p>',
    );
    await page.locator("#b").hover();
    await expect.poll(async () => (await tooltipOf(page, "t")).open).toBe(true);
    expect(await page.locator("#b").getAttribute("aria-describedby")).toBe("t");
    // The same words stand as aria-description too (ARIA 1.3): a tool that does not read a
    // reference into a host with a shadow tree hears them (plan ④ D-04).
    expect(await page.locator("#b").getAttribute("aria-description")).toBe("Sichert die Fassung");
    const shown = await tooltipOf(page, "t");
    const trigger = await page.locator("#b").boundingBox();
    expect(shown.top).toBeGreaterThanOrEqual((trigger?.y ?? 0) + (trigger?.height ?? 0) - 1);
    // Moving onto the tooltip keeps it (WCAG 1.4.13 hoverable).
    await page.mouse.move(shown.left + 4, shown.top + 4);
    await page.waitForTimeout(400);
    expect((await tooltipOf(page, "t")).open).toBe(true);
  });

  test("its colours are the inverse pair of the tokens", async ({ page }) => {
    await serve(page, out, MARKUP);
    await page.locator("#b").hover();
    await expect.poll(async () => (await tooltipOf(page, "t")).open).toBe(true);
    const tokens = await page.evaluate(() => {
      const probe = (name: string) => {
        const span = document.createElement("span");
        span.style.color = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        document.body.append(span);
        const colour = getComputedStyle(span).color;
        span.remove();
        return colour;
      };
      return {
        // Spec 029 ①b: the Ero-Tokens of the konsileto (komuna: the tooltip of the Fonto).
        text: probe("--fm-ero-konsileto-text-color"),
        fill: probe("--fm-ero-konsileto-surface-fill"),
      };
    });
    const shown = await tooltipOf(page, "t");
    expect(shown.colour).toBe(tokens.text);
    expect(shown.fill).toBe(tokens.fill);
  });
});
