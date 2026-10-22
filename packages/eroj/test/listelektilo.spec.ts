// fm-listelektilo in the browser (Spec 025 ③; G5, plan ③ D-18): the styled select-only list — a
// button of role combobox named by the label that shows the chosen option, over a popover listbox
// whose options carry an icon and a description; the keys of APG (arrows, Home, End, Enter, Space,
// Escape, a typed letter jumps to the option that starts with it — closed too); the value is the
// form value. Chromium, Firefox and WebKit.

import { expect, type Page, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const FORM = (attributes = "") =>
  `<form id="f"><fm-listelektilo id="l" name="region" ${attributes}>Region<data slot="options" value="eu" icon="info" description="27 Staaten">Europa</data><data slot="options" value="us" description="50 Staaten">USA</data><data slot="options" value="jp" disabled>Japan</data><data slot="options" value="br">Brasilien</data><span slot="help">Die Region des Standards.</span></fm-listelektilo></form>`;

const stateOf = (page: Page) =>
  page.locator("#l").evaluate((element) => {
    const shadow = element.shadowRoot as ShadowRoot;
    const listbox = shadow.querySelector('[part="listbox"]') as HTMLElement;
    const form = element.closest("form") as HTMLFormElement;
    return {
      value: element.getAttribute("value"),
      shown: shadow.querySelector('[part="text"]')?.textContent ?? "",
      open: listbox.matches(":popover-open"),
      expanded: shadow.querySelector('[part="control"]')?.getAttribute("aria-expanded"),
      active: [...shadow.querySelectorAll('[part="option"][data-active="true"]')].map(
        (row) => (row as HTMLElement).dataset.value,
      ),
      selected: [...shadow.querySelectorAll('[part="option"][aria-selected="true"]')].map(
        (row) => (row as HTMLElement).dataset.value,
      ),
      sent: new FormData(form).getAll("region").map(String),
      valid: (element as unknown as { checkValidity(): boolean }).checkValidity(),
    };
  });

test.describe("fm-listelektilo behaviour", () => {
  test("a combobox named by the label and described by the help shows the chosen option; the listbox holds the options with icon, description and disabled", async ({
    page,
  }) => {
    await serve(page, out, FORM('value="eu"'));
    const box = page.getByRole("combobox", { name: "Region" });
    await expect(box).toBeVisible();
    await expect(box).toHaveAccessibleDescription("Die Region des Standards.");
    await expect(box).toHaveText(/Europa/);
    await expect(box).toHaveAttribute("aria-haspopup", "listbox");
    const state = await stateOf(page);
    expect(state.sent).toEqual(["eu"]);
    expect(state.open).toBe(false);
    await box.click();
    const options = page.locator("#l").locator('[part="option"]');
    await expect(options).toHaveCount(4);
    await expect(options.nth(0)).toHaveAttribute("aria-selected", "true");
    await expect(options.nth(0).locator('fm-ikono[name="info"]')).toHaveCount(1);
    await expect(options.nth(0).locator('[part="description"]')).toHaveText("27 Staaten");
    await expect(options.nth(2)).toHaveAttribute("aria-disabled", "true");
    expect((await stateOf(page)).active).toEqual(["eu"]);
  });

  test("the keys: ArrowDown opens and moves, Home and End jump, a disabled option is skipped, Enter chooses and closes (change once), Escape closes without a change; a typed letter jumps", async ({
    page,
  }) => {
    await serve(page, out, FORM('value="eu"'));
    await page.evaluate(() => {
      const log: string[] = [];
      (window as unknown as { log: string[] }).log = log;
      const host = document.getElementById("l") as HTMLElement;
      host.addEventListener("change", () => log.push(`change:${host.getAttribute("value")}`));
    });
    const box = page.getByRole("combobox", { name: "Region" });
    await box.focus();
    await page.keyboard.press("ArrowDown");
    expect((await stateOf(page)).open).toBe(true);
    expect((await stateOf(page)).active).toEqual(["eu"]);
    await page.keyboard.press("ArrowDown");
    expect((await stateOf(page)).active).toEqual(["us"]);
    await page.keyboard.press("ArrowDown");
    // Japan is disabled: skipped.
    expect((await stateOf(page)).active).toEqual(["br"]);
    await page.keyboard.press("Home");
    expect((await stateOf(page)).active).toEqual(["eu"]);
    await page.keyboard.press("End");
    expect((await stateOf(page)).active).toEqual(["br"]);
    await page.keyboard.press("Enter");
    const chosen = await stateOf(page);
    expect(chosen.value).toBe("br");
    expect(chosen.open).toBe(false);
    expect(chosen.shown).toContain("Brasilien");
    expect(chosen.sent).toEqual(["br"]);
    await expect(box).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Escape");
    expect((await stateOf(page)).value).toBe("br");
    expect((await stateOf(page)).open).toBe(false);
    // A typed letter on the closed combobox chooses the first option that starts with it.
    await page.keyboard.press("u");
    expect((await stateOf(page)).value).toBe("us");
    expect(await page.evaluate(() => (window as unknown as { log: string[] }).log)).toEqual([
      "change:br",
      "change:us",
    ]);
  });

  test("a click on an option chooses it; a pointer outside closes; the placeholder shows while nothing is chosen; required without a value holds the form", async ({
    page,
  }) => {
    await serve(page, out, FORM('placeholder="Region wählen" required'));
    const box = page.getByRole("combobox", { name: "Region" });
    await expect(box).toHaveText(/Region wählen/);
    expect((await stateOf(page)).valid).toBe(false);
    await box.click();
    await page.locator("#l").locator('[part="option"][data-value="us"]').click();
    const state = await stateOf(page);
    expect(state.value).toBe("us");
    expect(state.open).toBe(false);
    expect(state.valid).toBe(true);
    await box.click();
    expect((await stateOf(page)).open).toBe(true);
    await page.mouse.click(5, 5);
    expect((await stateOf(page)).open).toBe(false);
  });

  test("disabled is skipped and never opens; readonly shows the value and never opens; the host takes the width of its container (E3)", async ({
    page,
  }) => {
    await serve(page, out, `<div style="width: 320px">${FORM('value="eu" disabled')}</div>`);
    const box = page.getByRole("combobox", { name: "Region" });
    await expect(box).toBeDisabled();
    await box.click({ force: true });
    expect((await stateOf(page)).open).toBe(false);
    expect(await box.evaluate((element) => element.getBoundingClientRect().width)).toBe(320);
    await serve(page, out, FORM('value="eu" readonly'));
    await page.getByRole("combobox", { name: "Region" }).click({ force: true });
    expect((await stateOf(page)).open).toBe(false);
    await expect(page.getByRole("combobox", { name: "Region" })).toHaveAttribute(
      "aria-readonly",
      "true",
    );
  });
});
