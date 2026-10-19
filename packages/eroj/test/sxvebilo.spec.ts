// fm-sxvebilo in the browser (Spec 014 ④; G4, G5, plan ④ D-05): a popover of the platform — the
// slotted trigger opens it (aria-expanded), the focus moves into the layer and back to the trigger
// on closing; Escape and a click outside close it (light dismiss); the open attribute follows; the
// heading is a composed titolo of level 2. Chromium, Firefox and WebKit.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const layerOf = (page: Parameters<typeof serve>[0], id: string) =>
  page.locator(`#${id}`).evaluate((element) => {
    const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
    const box = control.getBoundingClientRect();
    return {
      open: control.matches(":popover-open"),
      attribute: element.hasAttribute("open"),
      role: control.getAttribute("role"),
      name: control.getAttribute("aria-label"),
      top: box.top,
      width: box.width,
      maxWidth: getComputedStyle(control).maxInlineSize,
    };
  });

const MARKUP =
  '<fm-butono id="before">Davor</fm-butono><fm-sxvebilo id="p" label="Filter"><fm-butono id="trigger" slot="trigger" emphasis="medium">Filter</fm-butono><span slot="heading">Nach Status filtern</span><fm-kampo id="field">Suchbegriff</fm-kampo></fm-sxvebilo><fm-butono id="after">Danach</fm-butono>';

test.describe("fm-sxvebilo behaviour", () => {
  test("closed at rest; the trigger opens it under itself, says aria-expanded, and the focus moves in; the heading is a titolo of level 2", async ({
    page,
  }) => {
    await serve(page, out, MARKUP);
    expect((await layerOf(page, "p")).open).toBe(false);
    expect(await page.locator("#trigger").getAttribute("aria-expanded")).toBe("false");
    await page.locator("#trigger").click();
    await expect.poll(async () => (await layerOf(page, "p")).open).toBe(true);
    expect(await page.locator("#trigger").getAttribute("aria-expanded")).toBe("true");
    // The platform's toggle event is a task later than :popover-open: wait for the mirror.
    await expect.poll(async () => (await layerOf(page, "p")).attribute).toBe(true);
    const shown = await layerOf(page, "p");
    expect(shown.role).toBe("dialog");
    expect(shown.name).toBe("Filter");
    const trigger = await page.locator("#trigger").boundingBox();
    expect(shown.top).toBeGreaterThanOrEqual((trigger?.y ?? 0) + (trigger?.height ?? 0) - 1);
    await expect(page.getByRole("dialog", { name: "Filter" })).toHaveCount(1);
    await expect(
      page.getByRole("dialog").getByRole("heading", { level: 2, name: "Nach Status filtern" }),
    ).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => document.activeElement?.id ?? "")).toBe("field");
  });

  test("Escape closes it and returns the focus to the trigger; the open attribute follows", async ({
    page,
  }) => {
    await serve(page, out, MARKUP);
    await page.locator("#trigger").click();
    await expect.poll(async () => (await layerOf(page, "p")).open).toBe(true);
    // Nachlese 5 ①: the element takes the opening in the platform's toggle event, a task after
    // :popover-open. Escape pressed before that task closed a layer whose open attribute had never
    // been set: the wait for "attribute false" passed at once while aria-expanded still said true
    // (red in #79, run 39231530044, and on main in Firefox, 39223137603). Wait for the opening to
    // be taken, then for the closing, each as a state.
    await expect.poll(async () => (await layerOf(page, "p")).attribute).toBe(true);
    await page.keyboard.press("Escape");
    await expect.poll(async () => (await layerOf(page, "p")).open).toBe(false);
    await expect.poll(async () => (await layerOf(page, "p")).attribute).toBe(false);
    await expect(page.locator("#trigger")).toHaveAttribute("aria-expanded", "false");
    await expect.poll(() => page.evaluate(() => document.activeElement?.id ?? "")).toBe("trigger");
  });

  test("a click outside closes it (light dismiss); the trigger closes it too; the width is at most the small container", async ({
    page,
  }) => {
    await serve(page, out, MARKUP);
    await page.locator("#trigger").click();
    await expect.poll(async () => (await layerOf(page, "p")).open).toBe(true);
    await page.mouse.click(5, 5);
    await expect.poll(async () => (await layerOf(page, "p")).open).toBe(false);
    await page.locator("#trigger").click();
    await expect.poll(async () => (await layerOf(page, "p")).open).toBe(true);
    const small = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--fm-size-container-small")
        .trim(),
    );
    expect((await layerOf(page, "p")).maxWidth).toBe(small);
    await page.locator("#trigger").click();
    await expect.poll(async () => (await layerOf(page, "p")).open).toBe(false);
  });

  test("open as an attribute shows it from the start", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-sxvebilo id="p" label="Filter" open><fm-butono slot="trigger">Filter</fm-butono><p>Inhalt</p></fm-sxvebilo>',
    );
    await expect.poll(async () => (await layerOf(page, "p")).open).toBe(true);
  });
});
