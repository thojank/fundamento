// fm-lokredaktilo in the browser (Spec 025 ③; G5, plan ③ D-18): a single value of a view turned
// into a field on the spot — the display shows the value with an edit butono named „‹Label›
// bearbeiten"; editing shows a composed kampo of the kind with save and cancel; Enter saves,
// Escape cancels, the focus returns to the edit button; save is cancelable, so the application can
// refuse and the field stays open; an error keeps it open too. Chromium, Firefox and WebKit.

import { expect, type Page, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const lokredaktilo = input.modelo.eroj.find((entry) => entry.ero.name === "lokredaktilo");
if (lokredaktilo === undefined) throw new Error("lokredaktilo missing");
const texts = lokredaktilo.skemo.a11y.texts ?? {};
const word = (key: string, lingvo = "de") => texts[key]?.[lingvo] ?? "";

const HOST = (attributes = "", slots = "") =>
  `<form id="f"><fm-lokredaktilo id="e" label="Titel" name="title" ${attributes}>${slots}</fm-lokredaktilo></form>`;

const stateOf = (page: Page) =>
  page.locator("#e").evaluate((element) => {
    const shadow = element.shadowRoot as ShadowRoot;
    const form = element.closest("form") as HTMLFormElement;
    const field = shadow.querySelector('[part="field"]') as HTMLElement;
    return {
      value: element.getAttribute("value"),
      editing: element.hasAttribute("editing"),
      shown: shadow.querySelector('[part="text"]')?.textContent?.trim() ?? "",
      formHidden: (shadow.querySelector('[part="form"]') as HTMLElement).hidden,
      fieldValue: field.getAttribute("value"),
      fieldKind: field.getAttribute("kind"),
      sent: new FormData(form).getAll("title").map(String),
      focused: (shadow.activeElement as HTMLElement | null)?.getAttribute("part") ?? undefined,
    };
  });

test.describe("fm-lokredaktilo behaviour", () => {
  test("the display shows the value with the edit butono named by the label; the value is the form value; a click opens the field with the value and the focus in it", async ({
    page,
  }) => {
    await serve(page, out, HOST('value="Barrierefreiheit" kind="text"'));
    const edit = page.getByRole("button", { name: word("edit-name").replace("{label}", "Titel") });
    await expect(edit).toBeVisible();
    await expect(page.locator("#e").locator('[part="edit"] fm-ikono[name="edit"]')).toHaveCount(1);
    let state = await stateOf(page);
    expect(state.shown).toBe("Barrierefreiheit");
    expect(state.formHidden).toBe(true);
    expect(state.sent).toEqual(["Barrierefreiheit"]);
    await edit.click();
    state = await stateOf(page);
    expect(state.editing).toBe(true);
    expect(state.formHidden).toBe(false);
    expect(state.fieldValue).toBe("Barrierefreiheit");
    expect(state.fieldKind).toBe("text");
    const box = page.getByRole("textbox", { name: "Titel" });
    await expect(box).toBeFocused();
    await expect(page.getByRole("button", { name: word("save-name") })).toBeVisible();
    await expect(page.getByRole("button", { name: word("cancel-name") })).toBeVisible();
  });

  test("Enter saves: the cancelable save carries the new value, the display shows it, the focus returns to the edit button; Escape cancels and keeps the old value", async ({
    page,
  }) => {
    await serve(page, out, HOST('value="Barrierefreiheit"'));
    await page.evaluate(() => {
      const log: string[] = [];
      (window as unknown as { log: string[] }).log = log;
      const host = document.getElementById("e") as HTMLElement;
      host.addEventListener("save", (event) => {
        log.push(`save:${(event as CustomEvent<{ value: string }>).detail.value}`);
        if ((window as unknown as { refuse?: boolean }).refuse) event.preventDefault();
      });
      host.addEventListener("cancel", () => log.push("cancel"));
      host.addEventListener("change", () => log.push(`change:${host.getAttribute("value")}`));
      document.getElementById("f")?.addEventListener("submit", (event) => event.preventDefault());
    });
    await page.getByRole("button", { name: word("edit-name").replace("{label}", "Titel") }).click();
    const box = page.getByRole("textbox", { name: "Titel" });
    await box.fill("Kontrast");
    await page.keyboard.press("Enter");
    let state = await stateOf(page);
    expect(state.value).toBe("Kontrast");
    expect(state.editing).toBe(false);
    expect(state.shown).toBe("Kontrast");
    expect(state.focused).toBe("edit");
    await page.keyboard.press("Enter");
    await box.fill("Fokus");
    await page.keyboard.press("Escape");
    state = await stateOf(page);
    expect(state.value).toBe("Kontrast");
    expect(state.editing).toBe(false);
    expect(state.focused).toBe("edit");
    // Refused by the application: the field stays open with the typed text.
    await page.evaluate(() => {
      (window as unknown as { refuse: boolean }).refuse = true;
    });
    await page.keyboard.press("Enter");
    await box.fill("Namen");
    await page.getByRole("button", { name: word("save-name") }).click();
    state = await stateOf(page);
    expect(state.editing).toBe(true);
    expect(state.value).toBe("Kontrast");
    expect(await page.evaluate(() => (window as unknown as { log: string[] }).log)).toEqual([
      "save:Kontrast",
      "change:Kontrast",
      "cancel",
      "save:Namen",
    ]);
  });

  test("an error keeps the field open and invalid; the cancel butono closes it; a number kind is the kampo's number field", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      HOST(
        'value="42" kind="number" editing invalid',
        '<span slot="error">Gib eine Zahl bis 100 ein.</span>',
      ),
    );
    const state = await stateOf(page);
    expect(state.editing).toBe(true);
    expect(state.fieldKind).toBe("number");
    const box = page.getByRole("textbox", { name: "Titel" });
    await expect(box).toHaveAttribute("aria-invalid", "true");
    await expect(box).toHaveAttribute("inputmode", "numeric");
    await expect(box).toHaveAccessibleDescription("Gib eine Zahl bis 100 ein.");
    await page.getByRole("button", { name: word("cancel-name") }).click();
    expect((await stateOf(page)).editing).toBe(false);
  });

  test("disabled: the edit button is disabled and nothing opens; readonly alike", async ({
    page,
  }) => {
    await serve(page, out, HOST('value="Barrierefreiheit" disabled'));
    const edit = page.locator("#e").locator('[part="edit"]');
    await expect(edit).toHaveAttribute("aria-disabled", "true");
    await edit.click({ force: true });
    expect((await stateOf(page)).editing).toBe(false);
    await serve(page, out, HOST('value="Barrierefreiheit" readonly'));
    await page.locator("#e").locator('[part="edit"]').click({ force: true });
    expect((await stateOf(page)).editing).toBe(false);
  });
});
