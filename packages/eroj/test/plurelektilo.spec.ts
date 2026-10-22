// fm-plurelektilo in the browser (Spec 025 ③; G5, plan ③ D-18): several values from a long list —
// a button named by the label that says how many are chosen („3 gewählt") or shows them as
// removable tags (summary tags), over a multiselectable popover listbox whose options carry a check
// mark; chosen options stand first when it opens; Space toggles, Enter and Escape close; a filter
// narrows the list where filterable; „Alle abwählen" clears; max refuses more. The form carries
// every value. Chromium, Firefox and WebKit.

import { expect, type Page, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const plurelektilo = input.modelo.eroj.find((entry) => entry.ero.name === "plurelektilo");
if (plurelektilo === undefined) throw new Error("plurelektilo missing");
const texts = plurelektilo.skemo.a11y.texts ?? {};
const word = (key: string, lingvo = "de") => texts[key]?.[lingvo] ?? "";

const FORM = (attributes = "") =>
  `<form id="f"><fm-plurelektilo id="p" name="standards" ${attributes}>Standards<data slot="options" value="a11y">Barrierefreiheit</data><data slot="options" value="kontrast">Kontrast</data><data slot="options" value="fokus">Fokus</data><data slot="options" value="namen">Namen</data><data slot="options" value="motion">Bewegung</data></fm-plurelektilo></form>`;

const stateOf = (page: Page) =>
  page.locator("#p").evaluate((element) => {
    const shadow = element.shadowRoot as ShadowRoot;
    const listbox = shadow.querySelector('[part="listbox"]') as HTMLElement;
    const form = element.closest("form") as HTMLFormElement;
    return {
      values: element.getAttribute("values"),
      shown: shadow.querySelector('[part="text"]')?.textContent?.trim() ?? "",
      open: listbox.matches(":popover-open"),
      order: [...shadow.querySelectorAll('[part="item"]:not([hidden])')].map(
        (row) => (row as HTMLElement).dataset.value,
      ),
      selected: [...shadow.querySelectorAll('[part="item"][aria-selected="true"]')].map(
        (row) => (row as HTMLElement).dataset.value,
      ),
      active: [...shadow.querySelectorAll('[part="item"][data-active="true"]')].map(
        (row) => (row as HTMLElement).dataset.value,
      ),
      tags: [...shadow.querySelectorAll("fm-signeto")].map((tag) => tag.textContent?.trim()),
      sent: new FormData(form).getAll("standards").map(String),
      valid: (element as unknown as { checkValidity(): boolean }).checkValidity(),
      message: (element as unknown as { validationMessage: string }).validationMessage,
    };
  });

test.describe("fm-plurelektilo behaviour", () => {
  test("the button says how many are chosen; the listbox is multiselectable with a check mark per option, the chosen first; every value is a form value", async ({
    page,
  }) => {
    await serve(page, out, FORM('values="kontrast,motion"'));
    const button = page.getByRole("button", { name: "Standards" });
    await expect(button).toHaveText(`2 ${word("options-count")}`);
    await expect(button).toHaveAttribute("aria-haspopup", "listbox");
    let state = await stateOf(page);
    expect(state.sent).toEqual(["kontrast", "motion"]);
    await button.click();
    state = await stateOf(page);
    expect(state.open).toBe(true);
    expect(state.order).toEqual(["kontrast", "motion", "a11y", "fokus", "namen"]);
    expect(state.selected).toEqual(["kontrast", "motion"]);
    // The popover is a panel; the rows' holder is the listbox (ARIA: a listbox owns options alone).
    const listbox = page.locator("#p").locator('[part="items"]');
    await expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    await expect(page.locator("#p").locator('[part="item"] [part="check"]')).toHaveCount(5);
    await expect(page.getByRole("button", { name: word("clear-name") })).toBeVisible();
  });

  test("Space toggles the active option and says change; the count follows; Enter and Escape close and give the focus back to the button; clear takes every value away", async ({
    page,
  }) => {
    await serve(page, out, FORM('values="kontrast"'));
    await page.evaluate(() => {
      const log: string[] = [];
      (window as unknown as { log: string[] }).log = log;
      const host = document.getElementById("p") as HTMLElement;
      host.addEventListener("change", () => log.push(`change:${host.getAttribute("values")}`));
    });
    const button = page.getByRole("button", { name: "Standards" });
    await button.focus();
    await page.keyboard.press("ArrowDown");
    expect((await stateOf(page)).open).toBe(true);
    expect((await stateOf(page)).active).toEqual(["kontrast"]);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Space");
    expect((await stateOf(page)).values).toBe("kontrast,a11y");
    expect((await stateOf(page)).open).toBe(true);
    await expect(button).toHaveText(`2 ${word("options-count")}`);
    await page.keyboard.press("Enter");
    expect((await stateOf(page)).open).toBe(false);
    await expect(button).toBeFocused();
    await button.click();
    await page.keyboard.press("Escape");
    expect((await stateOf(page)).open).toBe(false);
    await button.click();
    await page.getByRole("button", { name: word("clear-name") }).click();
    expect((await stateOf(page)).values).toBe("");
    expect((await stateOf(page)).sent).toEqual([]);
    expect(await page.evaluate(() => (window as unknown as { log: string[] }).log)).toEqual([
      "change:kontrast,a11y",
      "change:",
    ]);
  });

  test("summary tags: the chosen values stand as removable signeto on the button; removing one takes it out of the values", async ({
    page,
  }) => {
    await serve(page, out, FORM('values="kontrast,fokus" summary="tags"'));
    let state = await stateOf(page);
    expect(state.tags).toEqual(["Kontrast", "Fokus"]);
    await page
      .locator("#p")
      .locator("fm-signeto")
      .first()
      .getByRole("button", { name: /Kontrast/ })
      .click();
    state = await stateOf(page);
    expect(state.values).toBe("fokus");
    expect(state.tags).toEqual(["Fokus"]);
    expect(state.sent).toEqual(["fokus"]);
  });

  test("filterable: a search field in the list narrows the options while typing; max refuses a further choice with the Modelo's message; required without a value holds the form", async ({
    page,
  }) => {
    await serve(page, out, FORM('filterable max="2" required'));
    expect((await stateOf(page)).valid).toBe(false);
    const button = page.getByRole("button", { name: "Standards" });
    await button.click();
    const filter = page.locator("#p").locator('[part="filter"]');
    await expect(filter).toBeFocused();
    await filter.fill("ko");
    expect((await stateOf(page)).order).toEqual(["kontrast"]);
    await filter.fill("");
    await page.locator("#p").locator('[part="item"][data-value="a11y"]').click();
    await page.locator("#p").locator('[part="item"][data-value="fokus"]').click();
    // The third option is refused (aria-disabled, the limit reached): Playwright refuses to click
    // a disabled option itself, so the press is forced, as the datelektilo's tests press a refused day.
    await page.locator("#p").locator('[part="item"][data-value="namen"]').click({ force: true });
    const state = await stateOf(page);
    expect(state.values).toBe("a11y,fokus");
    expect(state.valid).toBe(true);
    await expect(page.locator("#p").locator('[part="item"][data-value="namen"]')).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await page.keyboard.press("Escape");
    // Three values set by the application break the limit: the field is invalid with the message.
    await page
      .locator("#p")
      .evaluate((element) => element.setAttribute("values", "a11y,fokus,namen"));
    const over = await stateOf(page);
    expect(over.valid).toBe(false);
    expect(over.message).toBe(word("values-invalid").replace("{max}", "2"));
  });

  test("disabled never opens; readonly never opens; the host takes the width of its container (E3)", async ({
    page,
  }) => {
    await serve(page, out, `<div style="width: 320px">${FORM('values="kontrast" disabled')}</div>`);
    const button = page.getByRole("button", { name: "Standards" });
    await expect(button).toBeDisabled();
    expect(await button.evaluate((element) => element.getBoundingClientRect().width)).toBe(320);
    await serve(page, out, FORM('values="kontrast" readonly'));
    await page.getByRole("button", { name: "Standards" }).click({ force: true });
    expect((await stateOf(page)).open).toBe(false);
  });
});
