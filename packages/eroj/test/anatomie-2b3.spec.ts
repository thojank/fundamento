// Spec 036 Teil 5 ②b-3 (Spec 029 abgleich.json, aspect "anatomie") in the browser: the new parts
// and slots of the fields, choices and menus as the Skemo states them. A usage without the new
// content looks as before (AC-10, compared by ac10 outside this suite).

import { expect, type Page, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

/** The box of a part in the shadow tree of the first host of the selector. */
async function boxOf(page: Page, host: string, part: string) {
  return page.evaluate(
    ([query, name]) => {
      const element = document.querySelector(query)?.shadowRoot?.querySelector(`[part="${name}"]`);
      if (!(element instanceof HTMLElement)) return undefined;
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        shown: rect.height > 0,
      };
    },
    [host, part] as const,
  );
}

test.describe("②b-3 A-markobutono-4, A-sxaltilo-4: help", () => {
  for (const ero of ["markobutono", "sxaltilo"]) {
    test(`${ero}: the help stands under the label and describes the control`, async ({ page }) => {
      await serve(
        page,
        out,
        `<fm-${ero}>Newsletter<span slot="help">Einmal im Monat, jederzeit abbestellbar.</span></fm-${ero}>`,
      );
      const help = await boxOf(page, `fm-${ero}`, "help");
      const label = await boxOf(page, `fm-${ero}`, "label");
      expect(help?.shown).toBe(true);
      expect(help?.top ?? 0).toBeGreaterThanOrEqual(label?.bottom ?? Number.POSITIVE_INFINITY);
      expect(help?.left).toBe(label?.left);
      const control = page.locator(`fm-${ero}`).locator('[part="control"]');
      await expect(control).toHaveAccessibleDescription("Einmal im Monat, jederzeit abbestellbar.");
    });

    test(`${ero}: without help nothing stands under the label`, async ({ page }) => {
      await serve(page, out, `<fm-${ero}>Newsletter</fm-${ero}>`);
      expect((await boxOf(page, `fm-${ero}`, "help"))?.shown ?? false).toBe(false);
      const control = page.locator(`fm-${ero}`).locator('[part="control"]');
      await expect(control).toHaveAccessibleDescription("");
    });
  }
});

test.describe("②b-3 A-elekto-4: option-description", () => {
  test("an option with a description shows it under its label and is described by it", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-elekto name="versand">Versandart<data slot="options" value="standard" description="3–5 Werktage">Standard</data><data slot="options" value="express">Express</data></fm-elekto>',
    );
    const rows = page.locator("fm-elekto").locator('[part="option"]');
    const first = rows.nth(0);
    const description = first.locator('[part="option-description"]');
    await expect(description).toBeVisible();
    await expect(description).toHaveText("3–5 Werktage");
    await expect(first).toHaveAccessibleDescription("3–5 Werktage");
    const label = await first.locator('[part="option-label"]').boundingBox();
    const under = await description.boundingBox();
    expect(under?.y ?? 0).toBeGreaterThanOrEqual((label?.y ?? 0) + (label?.height ?? 0) - 1);
    expect(Math.round(under?.x ?? 0)).toBe(Math.round(label?.x ?? -1));
    // An option without a description shows none and is described by nothing.
    await expect(rows.nth(1).locator('[part="option-description"]')).toBeHidden();
    await expect(rows.nth(1)).toHaveAccessibleDescription("");
  });

  test("a description given later follows", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-elekto name="versand">Versandart<data slot="options" value="standard">Standard</data><data slot="options" value="express">Express</data></fm-elekto>',
    );
    await page.evaluate(() =>
      document.querySelector('data[value="express"]')?.setAttribute("description", "Morgen da"),
    );
    const description = page
      .locator("fm-elekto")
      .locator('[part="option"]')
      .nth(1)
      .locator('[part="option-description"]');
    await expect(description).toHaveText("Morgen da");
  });
});

test.describe("②b-3 A-glitilo-4: tick", () => {
  test("with ticks a mark stands at every step, inside the track, unheard", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-glitilo min="0" max="10" step="2" value="4" ticks>Stufe</fm-glitilo>',
    );
    const ticks = page.locator("fm-glitilo").locator('[part="tick"]');
    await expect(ticks).toHaveCount(6);
    const track = await page.locator("fm-glitilo").locator('[part="track"]').boundingBox();
    const first = await ticks.nth(0).boundingBox();
    const last = await ticks.nth(5).boundingBox();
    if (track === null || first === null || last === null) throw new Error("no boxes");
    const middle = (box: { x: number; width: number }) => box.x + box.width / 2;
    expect(Math.abs(middle(first) - track.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(middle(last) - (track.x + track.width))).toBeLessThanOrEqual(1);
    expect(first.y).toBeGreaterThanOrEqual(track.y - 1);
    expect(first.y + first.height).toBeLessThanOrEqual(track.y + track.height + 1);
    expect(await ticks.nth(0).getAttribute("aria-hidden")).toBe("true");
  });

  test("without ticks no mark stands", async ({ page }) => {
    await serve(page, out, '<fm-glitilo min="0" max="10" step="2" value="4">Stufe</fm-glitilo>');
    await expect(page.locator("fm-glitilo").locator('[part="tick"]')).toHaveCount(0);
  });
});

test.describe("②b-3 A-alsxutilo-4: the upload icon", () => {
  test("a dropzone shows the ikono upload first, unheard; a field without one does not", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-alsxutilo id="z" dropzone>Belege</fm-alsxutilo><fm-alsxutilo id="f">Belege</fm-alsxutilo>',
    );
    const icon = page.locator("#z").locator('[part="dropzone"] > [part="icon"]');
    await expect(icon).toBeVisible();
    await expect(icon).toHaveAttribute("name", "upload");
    await expect(icon).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("#f").locator('[part="dropzone"] > [part="icon"]')).toBeHidden();
  });
});
