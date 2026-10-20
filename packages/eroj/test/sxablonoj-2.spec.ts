// Spec 020 ② (G5, G7): formularo and filtrilo in the browser. The form sends submit once — by its
// submit button or by Enter in a one-line field — with the values of its fields by name; an
// invalid field stops it, shows its error at the field and takes the focus. The filter bar is the
// landmark search with its name; its status is a polite live region; its fields wrap.

import { expect, test } from "@playwright/test";
import { axeViolations } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const FORM =
  '<fm-formularo id="f" label="Anmeldung"><fm-avizo slot="problems" intent="danger" id="p" hidden>Anmeldung fehlgeschlagen.</fm-avizo><fm-kampo id="t" name="token" kind="password" required>Token</fm-kampo><fm-butono slot="actions" type="submit" emphasis="high">Anmelden</fm-butono></fm-formularo>';

const BAR =
  '<fm-filtrilo id="b" label="Standards filtern"><fm-elektilo name="status" empty-label="Alle">Status<data slot="options" value="valid">Gültig</data></fm-elektilo><fm-kampo kind="search" name="q">Suche</fm-kampo><fm-butono slot="actions" emphasis="low">Filter zurücksetzen</fm-butono><span slot="status">3 von 7 Standards</span></fm-filtrilo>';

test.describe("Spec 020 ② formularo and filtrilo", () => {
  test("the form sends submit once, with the values by name, by its button and by Enter", async ({
    page,
  }) => {
    await serve(page, out, FORM);
    await page.evaluate(() => {
      (window as unknown as { sent: unknown[] }).sent = [];
      document.getElementById("f")?.addEventListener("submit", (event) => {
        (window as unknown as { sent: unknown[] }).sent.push((event as CustomEvent).detail);
      });
    });
    await page.locator("#t").locator("input").fill("geheim");
    await page.getByRole("button", { name: "Anmelden" }).click();
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { sent: unknown[] }).sent))
      .toEqual([{ values: { token: "geheim" } }]);
    await page.locator("#t").locator("input").press("Enter");
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { sent: unknown[] }).sent.length))
      .toBe(2);
  });

  test("an invalid field stops the submit, shows its error and takes the focus (novalidate)", async ({
    page,
  }) => {
    await serve(page, out, FORM);
    await page.evaluate(() => {
      (window as unknown as { sent: number }).sent = 0;
      document.getElementById("f")?.addEventListener("submit", () => {
        (window as unknown as { sent: number }).sent += 1;
      });
    });
    await page.getByRole("button", { name: "Anmelden" }).click();
    await expect.poll(() => page.evaluate(() => document.activeElement?.id ?? "")).toBe("t");
    expect(await page.evaluate(() => (window as unknown as { sent: number }).sent)).toBe(0);
    await expect(page.getByRole("form", { name: "Anmeldung" })).toBeAttached();
  });

  test("the filter bar is the landmark search with its name; its status is polite; axe-clean", async ({
    page,
  }) => {
    await serve(page, out, BAR);
    await expect(page.getByRole("search", { name: "Standards filtern" })).toHaveCount(1);
    const live = await page
      .locator("#b")
      .evaluate(
        (element) =>
          element.shadowRoot?.querySelector('[part="status"]')?.getAttribute("aria-live") ?? null,
      );
    expect(live).toBe("polite");
    expect(await axeViolations(page)).toEqual([]);
  });

  test("the fields of a narrow filter bar wrap into a second row", async ({ page }) => {
    await serve(page, out, `<div style="inline-size: 16rem">${BAR}</div>`);
    const rows = await page.evaluate(() => {
      const fields = [...document.querySelectorAll("#b > :not([slot])")];
      return new Set(fields.map((field) => Math.round(field.getBoundingClientRect().top))).size;
    });
    expect(rows).toBeGreaterThan(1);
  });
});
