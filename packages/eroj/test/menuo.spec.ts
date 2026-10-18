// fm-menuo in the browser (Spec 014 ④; G4, G5, plan ④ D-05): an action menu of the platform — the
// own trigger (a low butono with the icon more, named "Weitere Aktionen" or by label) or a slotted
// one opens the menu (ArrowDown too) and the first entry takes the focus; arrows wrap, Home and
// End jump, a letter finds an entry; a disabled entry is skipped and says so; Enter or Space fires
// select with the entry's id and closes; Escape closes and focuses the trigger; a danger entry is
// written in the danger text colour; a separator divides the groups. Chromium, Firefox, WebKit.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const menuOf = (page: Parameters<typeof serve>[0], id: string) =>
  page.locator(`#${id}`).evaluate((element) => {
    const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
    const rows = [...control.querySelectorAll('[part="item"]')] as HTMLElement[];
    const focused = rows.findIndex((row) => row === element.shadowRoot?.activeElement);
    return {
      open: control.matches(":popover-open"),
      role: control.getAttribute("role"),
      rows: rows.map((row) => ({
        name: row.textContent?.trim() ?? "",
        disabled: row.getAttribute("aria-disabled"),
        colour: getComputedStyle(row).color,
        danger: row.classList.contains("fm-danger"),
      })),
      focused,
      separators: control.querySelectorAll('[role="separator"]').length,
    };
  });

const MARKUP =
  '<fm-menuo id="m"><data value="edit">Bearbeiten</data><data value="duplicate" disabled>Duplizieren</data><fm-apartigilo></fm-apartigilo><data value="delete" intent="danger">Löschen</data></fm-menuo><fm-butono id="after">Danach</fm-butono>';

test.describe("fm-menuo behaviour", () => {
  test("its own trigger is a button named by the Modelo's words; a click opens the menu and focuses the first entry; the rows are menu items, the line a separator", async ({
    page,
  }) => {
    await serve(page, out, MARKUP);
    const trigger = page.getByRole("button", { name: "Weitere Aktionen" });
    await expect(trigger).toHaveCount(1);
    expect(await trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect((await menuOf(page, "m")).open).toBe(false);
    await trigger.click();
    await expect.poll(async () => (await menuOf(page, "m")).open).toBe(true);
    await expect(page.getByRole("menu", { name: "Weitere Aktionen" })).toHaveCount(1);
    await expect(page.getByRole("menuitem")).toHaveCount(3);
    const shown = await menuOf(page, "m");
    expect(shown.rows.map((row) => row.name)).toEqual(["Bearbeiten", "Duplizieren", "Löschen"]);
    expect(shown.rows[1]?.disabled).toBe("true");
    expect(shown.rows[2]?.danger).toBe(true);
    expect(shown.separators).toBe(1);
    expect(shown.focused).toBe(0);
    expect(await trigger.getAttribute("aria-expanded")).toBe("true");
  });

  test("the keys of the Skemo: ArrowDown opens; the arrows wrap and skip the disabled entry; Home and End jump; a letter finds an entry; Escape closes and focuses the trigger", async ({
    page,
  }) => {
    await serve(page, out, MARKUP);
    await page.getByRole("button", { name: "Weitere Aktionen" }).focus();
    await page.keyboard.press("ArrowDown");
    await expect.poll(async () => (await menuOf(page, "m")).open).toBe(true);
    await expect.poll(async () => (await menuOf(page, "m")).focused).toBe(0);
    await page.keyboard.press("ArrowDown");
    await expect.poll(async () => (await menuOf(page, "m")).focused).toBe(2);
    await page.keyboard.press("ArrowDown");
    await expect.poll(async () => (await menuOf(page, "m")).focused).toBe(0);
    await page.keyboard.press("ArrowUp");
    await expect.poll(async () => (await menuOf(page, "m")).focused).toBe(2);
    await page.keyboard.press("Home");
    await expect.poll(async () => (await menuOf(page, "m")).focused).toBe(0);
    await page.keyboard.press("End");
    await expect.poll(async () => (await menuOf(page, "m")).focused).toBe(2);
    await page.keyboard.press("b");
    await expect.poll(async () => (await menuOf(page, "m")).focused).toBe(0);
    await page.keyboard.press("Escape");
    await expect.poll(async () => (await menuOf(page, "m")).open).toBe(false);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (document.activeElement as HTMLElement | null)?.shadowRoot?.activeElement?.getAttribute(
              "part",
            ) ?? document.activeElement?.tagName.toLowerCase(),
        ),
      )
      .toBe("trigger");
  });

  test("Enter fires select with the entry's id and closes; a disabled entry fires nothing; a slotted trigger with a label replaces the own one", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-menuo id="m" label="Aktionen zum Datensatz"><fm-butono id="t" slot="trigger" emphasis="medium">Aktionen</fm-butono><data value="edit">Bearbeiten</data><data value="archive" disabled>Archivieren</data><data value="delete" intent="danger">Löschen</data></fm-menuo>',
    );
    await page.locator("#m").evaluate((element) => {
      (window as unknown as { selected: string[] }).selected = [];
      element.addEventListener("select", (event) => {
        (window as unknown as { selected: string[] }).selected.push(
          String((event as CustomEvent<{ value: string }>).detail.value),
        );
      });
    });
    await expect(page.getByRole("button", { name: "Weitere Aktionen" })).toHaveCount(0);
    await page.locator("#t").click();
    await expect.poll(async () => (await menuOf(page, "m")).open).toBe(true);
    await expect(page.getByRole("menu", { name: "Aktionen zum Datensatz" })).toHaveCount(1);
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await expect.poll(async () => (await menuOf(page, "m")).open).toBe(false);
    expect(
      await page.evaluate(() => (window as unknown as { selected: string[] }).selected),
    ).toEqual(["delete"]);
    await page.locator("#t").click();
    await expect.poll(async () => (await menuOf(page, "m")).open).toBe(true);
    await page.locator("#m").evaluate((element) => {
      const rows = element.shadowRoot?.querySelectorAll('[part="item"]') ?? [];
      (rows[1] as HTMLElement).click();
    });
    await page.waitForTimeout(100);
    expect((await menuOf(page, "m")).open).toBe(true);
    expect(
      await page.evaluate(() => (window as unknown as { selected: string[] }).selected),
    ).toEqual(["delete"]);
  });

  test("the danger entry is written in the danger text colour, the others in the default text colour", async ({
    page,
  }) => {
    await serve(page, out, MARKUP);
    await page.getByRole("button", { name: "Weitere Aktionen" }).click();
    await expect.poll(async () => (await menuOf(page, "m")).open).toBe(true);
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
        text: probe("--fm-color-text-default"),
        danger: probe("--fm-color-status-danger-text"),
      };
    });
    const shown = await menuOf(page, "m");
    expect(shown.rows[0]?.colour).toBe(tokens.text);
    expect(shown.rows[2]?.colour).toBe(tokens.danger);
  });
});
