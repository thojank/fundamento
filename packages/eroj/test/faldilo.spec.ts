// fm-faldilo in the browser (Spec 014 ⑤; G4, G5, plan ⑤ D-03): the platform's details and summary —
// closed at rest, a click or Enter on the summary opens it (aria-expanded), the open attribute
// follows; the chevron turns from right to down; disclosures of one group open one at a time (the
// platform's name on the details). Chromium, Firefox and WebKit.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const stateOf = (page: Parameters<typeof serve>[0], id: string) =>
  page.locator(`#${id}`).evaluate((element) => {
    const details = element.shadowRoot?.querySelector('[part="control"]') as HTMLDetailsElement;
    const indicator = element.shadowRoot?.querySelector('[part="indicator"]') as HTMLElement;
    const content = element.shadowRoot?.querySelector('[part="content"]') as HTMLElement;
    return {
      open: details.open,
      attribute: element.hasAttribute("open"),
      name: details.getAttribute("name"),
      chevron: indicator.getAttribute("name"),
      // A closed details keeps its content out of sight (checkVisibility reads the UA's rule).
      shown: content.checkVisibility(),
    };
  });

const MARKUP =
  '<fm-faldilo id="a" group="faq"><span slot="summary">Lieferbedingungen</span><fm-teksto>Innerhalb von drei Tagen.</fm-teksto></fm-faldilo><fm-faldilo id="b" group="faq"><span slot="summary">Rückgabe</span><fm-teksto>Vierzehn Tage.</fm-teksto></fm-faldilo>';

test.describe("fm-faldilo behaviour", () => {
  test("closed at rest with the chevron to the right; a click on the summary opens it, says aria-expanded, turns the chevron down and shows the content", async ({
    page,
  }) => {
    await serve(page, out, MARKUP);
    const closed = await stateOf(page, "a");
    expect(closed.open).toBe(false);
    expect(closed.chevron).toBe("chevron-right");
    expect(closed.shown).toBe(false);
    expect(closed.name).toBe("faq");
    await page.locator("#a").getByText("Lieferbedingungen").click();
    // The platform's toggle event is a task later than the open property: wait for the mirror.
    await expect.poll(async () => (await stateOf(page, "a")).attribute).toBe(true);
    const opened = await stateOf(page, "a");
    expect(opened.open).toBe(true);
    expect(opened.chevron).toBe("chevron-down");
    expect(opened.shown).toBe(true);
    await expect(page.locator("#a").getByText("Innerhalb von drei Tagen.")).toBeVisible();
  });

  test("one group opens one at a time: opening the second closes the first; Enter on the focused summary toggles", async ({
    page,
  }) => {
    await serve(page, out, MARKUP);
    await page.locator("#a").getByText("Lieferbedingungen").click();
    await expect.poll(async () => (await stateOf(page, "a")).open).toBe(true);
    await page.locator("#b").getByText("Rückgabe").click();
    await expect.poll(async () => (await stateOf(page, "b")).open).toBe(true);
    await expect.poll(async () => (await stateOf(page, "a")).open).toBe(false);
    await expect.poll(async () => (await stateOf(page, "a")).attribute).toBe(false);
    await page.locator("#b").evaluate((element) => {
      const summary = element.shadowRoot?.querySelector('[part="summary"]');
      if (summary instanceof HTMLElement) summary.focus();
    });
    await page.keyboard.press("Enter");
    await expect.poll(async () => (await stateOf(page, "b")).open).toBe(false);
  });

  test("open as an attribute shows the content from the start; removing it closes", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-faldilo id="a" open><span slot="summary">Lieferbedingungen</span><p>Innerhalb von drei Tagen.</p></fm-faldilo>',
    );
    await expect.poll(async () => (await stateOf(page, "a")).open).toBe(true);
    await page.locator("#a").evaluate((element) => element.removeAttribute("open"));
    await expect.poll(async () => (await stateOf(page, "a")).open).toBe(false);
  });
});
