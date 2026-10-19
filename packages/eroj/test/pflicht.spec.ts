// B-1 of Abnahme 014 ① (Spec 015 ②, plan ② D-11): an empty required field shows no bubble of the
// browser („Fülle dieses Feld aus.") when the pointer rests on it. The bubble is the platform's
// default tooltip of a native control: Chromium shows the control's validationMessage (Blink's
// InputType/HTMLTextAreaElement/HTMLSelectElement DefaultToolTip), Firefox the same. A tooltip
// cannot be read from a page; what it is made of can: the native control inside every field Ero
// carries no constraint the platform judges — no `required`, no `pattern` — so it is never
// :invalid and its validationMessage stays empty. The validity is the Ero's alone (ElementInternals,
// the error text at the field, Arkitekturo); required stays visible and audible (aria-required, the
// mark) and an empty required field still keeps the form from being sent. Chromium, Firefox, WebKit.

import { expect, type Page, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const OPTIONS =
  '<data slot="options" value="de">Deutschland</data><data slot="options" value="at">Österreich</data>';

/** One required, empty field per Ero that takes a value in a form. */
const FIELDS: readonly { ero: string; markup: string }[] = [
  { ero: "kampo", markup: '<fm-kampo id="kampo" name="kampo" required>Name</fm-kampo>' },
  {
    ero: "tekstareo",
    markup: '<fm-tekstareo id="tekstareo" name="tekstareo" required>Begründung</fm-tekstareo>',
  },
  {
    ero: "elektilo",
    markup: `<fm-elektilo id="elektilo" name="elektilo" required placeholder="Bitte wählen">Land${OPTIONS}</fm-elektilo>`,
  },
  {
    ero: "kompletigilo",
    markup: `<fm-kompletigilo id="kompletigilo" name="kompletigilo" required placeholder="Land eingeben">Land${OPTIONS}</fm-kompletigilo>`,
  },
  {
    ero: "markobutono",
    markup: '<fm-markobutono id="markobutono" name="markobutono" required>AGB</fm-markobutono>',
  },
  {
    ero: "alsxutilo",
    markup:
      '<fm-alsxutilo id="alsxutilo" name="alsxutilo" required>Lebenslauf<span slot="help">PDF, höchstens 5 MB</span></fm-alsxutilo>',
  },
];

const FORM = `<form id="f">${FIELDS.map((field) => field.markup).join("")}<fm-butono id="send" type="submit">Senden</fm-butono></form>`;

/** What the platform would show as the bubble, and what the Ero says, per field. */
const stateOf = (page: Page, id: string) =>
  page.locator(`#${id}`).evaluate((element) => {
    const control = element.shadowRoot?.querySelector('[part="control"]') as
      | (HTMLElement & { validationMessage?: string; required?: boolean })
      | null;
    const host = element as HTMLElement & { validity: ValidityState; validationMessage: string };
    return {
      nativeRequired: control?.hasAttribute("required") ?? false,
      nativePattern: control?.hasAttribute("pattern") ?? false,
      nativeInvalid: control?.matches(":invalid") ?? false,
      nativeMessage: control?.validationMessage ?? "",
      ariaRequired: control?.getAttribute("aria-required") ?? null,
      missing: host.validity.valueMissing,
      message: host.validationMessage,
    };
  });

test.describe("B-1: no bubble of the browser at a required field (Abnahme 014 ①)", () => {
  test("every required, empty field: the native control is never invalid and has no message; the Ero is invalid, says required and keeps the form from being sent", async ({
    page,
  }) => {
    await serve(page, out, FORM);
    let sent = false;
    await page.exposeFunction("fmSent", () => {
      sent = true;
    });
    await page.evaluate(() =>
      document.getElementById("f")?.addEventListener("submit", (event) => {
        event.preventDefault();
        (window as unknown as { fmSent: () => void }).fmSent();
      }),
    );
    for (const { ero } of FIELDS) {
      const state = await stateOf(page, ero);
      expect(state.nativeRequired, ero).toBe(false);
      expect(state.nativeInvalid, ero).toBe(false);
      expect(state.nativeMessage, ero).toBe("");
      expect(state.missing, ero).toBe(true);
      expect(state.message, ero).not.toBe("");
      expect(state.ariaRequired, ero).toBe("true");
      await expect(page.locator(`#${ero}`).locator('[part="required-mark"]'), ero).toBeVisible();
    }
    // The form is not sent; after the attempt every field still has no message of the platform.
    await page.locator("#f").evaluate((form) => (form as HTMLFormElement).requestSubmit());
    expect(sent).toBe(false);
    for (const { ero } of FIELDS) {
      const state = await stateOf(page, ero);
      expect(state.nativeInvalid, ero).toBe(false);
      expect(state.nativeMessage, ero).toBe("");
    }
  });

  test("a number that is no whole number: the kampo says patternMismatch with the platform's words, its native input carries no pattern and no message", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<form id="f"><fm-kampo id="zahl" kind="number" name="zahl">Anzahl</fm-kampo></form>',
    );
    await page.locator("#zahl").locator('[part="control"]').fill("abc");
    const state = await stateOf(page, "zahl");
    expect(state.nativePattern).toBe(false);
    expect(state.nativeInvalid).toBe(false);
    expect(state.nativeMessage).toBe("");
    const host = await page.locator("#zahl").evaluate((element) => {
      const v = element as HTMLElement & { validity: ValidityState; validationMessage: string };
      return { pattern: v.validity.patternMismatch, message: v.validationMessage };
    });
    expect(host.pattern).toBe(true);
    expect(host.message).not.toBe("");
  });
});
