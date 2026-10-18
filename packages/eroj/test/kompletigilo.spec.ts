// fm-kompletigilo in the browser (Spec 014 ⑤; G4, G5, plan ⑤ D-03): the field of the kampo with
// suggestions — typing from min-chars on shows the matching options in a listbox under the field
// (a popover of the platform), the count is announced, the arrows move the active option
// (aria-activedescendant), Enter takes it as the value, Escape closes; without allow-free a text
// that matches no option is invalid; the application hears query while the person types.
// Chromium, Firefox and WebKit.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const stateOf = (page: Parameters<typeof serve>[0], id: string) =>
  page.locator(`#${id}`).evaluate((element) => {
    const input = element.shadowRoot?.querySelector('[part="control"]') as HTMLInputElement;
    const listbox = element.shadowRoot?.querySelector('[part="listbox"]') as HTMLElement;
    const rows = [...listbox.querySelectorAll('[part="suggestion"]')] as HTMLElement[];
    const count = element.shadowRoot?.querySelector('[part="count"]') as HTMLElement;
    return {
      open: listbox.matches(":popover-open"),
      expanded: input.getAttribute("aria-expanded"),
      active: input.getAttribute("aria-activedescendant"),
      rows: rows.map((row) => ({
        text: row.textContent?.trim() ?? "",
        selected: row.getAttribute("aria-selected"),
        id: row.id,
      })),
      value: input.value,
      attribute: element.getAttribute("value"),
      invalid: input.getAttribute("aria-invalid"),
      count: count.textContent?.trim() ?? "",
      top: listbox.getBoundingClientRect().top,
      inputBottom: input.getBoundingClientRect().bottom,
    };
  });

const MARKUP =
  '<form id="f"><fm-kompletigilo id="k" name="land" placeholder="Land eingeben">Land<data slot="options" value="de">Deutschland</data><data slot="options" value="dk">Dänemark</data><data slot="options" value="fr">Frankreich</data></fm-kompletigilo><fm-butono id="send" type="submit">Senden</fm-butono></form>';

test.describe("fm-kompletigilo behaviour", () => {
  test("closed at rest; typing shows the matching suggestions under the field and announces their number; Escape closes", async ({
    page,
  }) => {
    await serve(page, out, MARKUP);
    const rest = await stateOf(page, "k");
    expect(rest.open).toBe(false);
    expect(rest.expanded).toBe("false");
    await expect(page.getByRole("combobox", { name: "Land" })).toHaveCount(1);
    await page.getByRole("combobox", { name: "Land" }).fill("d");
    await expect.poll(async () => (await stateOf(page, "k")).open).toBe(true);
    const typed = await stateOf(page, "k");
    expect(typed.expanded).toBe("true");
    expect(typed.rows.map((row) => row.text)).toEqual(["Deutschland", "Dänemark"]);
    expect(typed.count).toBe("2 Vorschläge");
    expect(typed.top).toBeGreaterThanOrEqual(typed.inputBottom - 1);
    await expect(page.getByRole("option")).toHaveCount(2);
    await page.keyboard.press("Escape");
    await expect.poll(async () => (await stateOf(page, "k")).open).toBe(false);
  });

  test("the arrows move the active suggestion; Enter takes it as the value (its id), closes and fires change; the chosen option is selected", async ({
    page,
  }) => {
    await serve(page, out, MARKUP);
    await page.locator("#k").evaluate((element) => {
      (window as unknown as { changed: number }).changed = 0;
      element.addEventListener("change", () => {
        (window as unknown as { changed: number }).changed += 1;
      });
    });
    await page.getByRole("combobox", { name: "Land" }).fill("d");
    await expect.poll(async () => (await stateOf(page, "k")).open).toBe(true);
    await page.keyboard.press("ArrowDown");
    const first = await stateOf(page, "k");
    expect(first.active).toBe(first.rows[0]?.id);
    await page.keyboard.press("ArrowDown");
    expect((await stateOf(page, "k")).active).toBe(first.rows[1]?.id);
    await page.keyboard.press("Enter");
    await expect.poll(async () => (await stateOf(page, "k")).open).toBe(false);
    const chosen = await stateOf(page, "k");
    expect(chosen.value).toBe("Dänemark");
    expect(chosen.attribute).toBe("dk");
    expect(await page.evaluate(() => (window as unknown as { changed: number }).changed)).toBe(1);
    expect(
      await page.evaluate(() =>
        new FormData(document.getElementById("f") as HTMLFormElement).get("land"),
      ),
    ).toBe("dk");
  });

  test("no match says so; a free text is invalid without allow-free and valid with it; query is heard while typing", async ({
    page,
  }) => {
    await serve(page, out, MARKUP);
    await page.locator("#k").evaluate((element) => {
      (window as unknown as { queries: string[] }).queries = [];
      element.addEventListener("query", (event) => {
        (window as unknown as { queries: string[] }).queries.push(
          String((event as CustomEvent<{ query: string }>).detail.query),
        );
      });
    });
    await page.getByRole("combobox", { name: "Land" }).fill("xy");
    await expect.poll(async () => (await stateOf(page, "k")).count).toBe("Keine Vorschläge");
    expect(await page.evaluate(() => (window as unknown as { queries: string[] }).queries)).toEqual(
      ["xy"],
    );
    await page.locator("#send").click();
    await expect.poll(async () => (await stateOf(page, "k")).invalid).toBe("true");
    await page.locator("#k").evaluate((element) => element.setAttribute("allow-free", ""));
    await expect.poll(async () => (await stateOf(page, "k")).invalid).toBeNull();
  });

  test("min-chars: nothing is suggested below it; a click on a suggestion chooses it", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-kompletigilo id="k" min-chars="2">Land<data slot="options" value="de">Deutschland</data><data slot="options" value="dk">Dänemark</data></fm-kompletigilo>',
    );
    await page.getByRole("combobox", { name: "Land" }).fill("d");
    await page.waitForTimeout(100);
    expect((await stateOf(page, "k")).open).toBe(false);
    await page.getByRole("combobox", { name: "Land" }).fill("dä");
    await expect.poll(async () => (await stateOf(page, "k")).open).toBe(true);
    await page.getByRole("option", { name: "Dänemark" }).click();
    await expect.poll(async () => (await stateOf(page, "k")).value).toBe("Dänemark");
    expect((await stateOf(page, "k")).open).toBe(false);
  });
});
