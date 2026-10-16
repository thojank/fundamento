// fm-dialogo in the browser (Spec 011 ②; G4, E9, plan ② D-12): the platform's own <dialog>, modal
// (focus trap and Escape are the browser's), named by its heading and described by its message;
// the reason a tekstareo the dialog shows itself; the actions slotted butono — the one with
// emphasis high confirms, every other cancels; the width of the surface follows size; the backdrop
// and the shadow are tokens. Chromium, Firefox and WebKit.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const dialogo = input.modelo.eroj.find((entry) => entry.ero.name === "dialogo");
if (dialogo === undefined) throw new Error("dialogo missing");

const ACTIONS =
  '<fm-butono id="cancel" slot="actions" emphasis="low">Abbrechen</fm-butono><fm-butono id="ok" slot="actions" emphasis="high" intent="danger">Löschen</fm-butono>';
const dialog = (attributes: string, slots = "") =>
  `<fm-butono id="opener">Standard löschen</fm-butono><fm-dialogo id="d" ${attributes}>Standard löschen?<span slot="message">Der Standard ist danach weg.</span>${slots}${ACTIONS}</fm-dialogo>`;

/** The events the host says, in order. */
const heard = (page: import("@playwright/test").Page) =>
  page.evaluate(() => (window as unknown as { heard: string[] }).heard);
const listen = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const host = document.getElementById("d");
    (window as unknown as { heard: string[] }).heard = [];
    for (const type of ["confirm", "cancel"]) {
      host?.addEventListener(type, (event) =>
        (window as unknown as { heard: string[] }).heard.push(
          `${type}:${JSON.stringify((event as CustomEvent).detail ?? null)}`,
        ),
      );
    }
  });

test.describe("fm-dialogo behaviour", () => {
  test("open shows the platform's modal dialog, named by the heading, described by the message; the focus lands on the confirmation", async ({
    page,
  }) => {
    await serve(page, out, dialog("open"));
    const modal = page.getByRole("dialog", { name: "Standard löschen?" });
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAttribute("aria-modal", "true");
    await expect(modal).toHaveAccessibleDescription("Der Standard ist danach weg.");
    expect(
      await page.locator("#d").evaluate((element) => {
        const control = element.shadowRoot?.querySelector("dialog") as HTMLDialogElement;
        return { open: control.open, matches: control.matches(":modal") };
      }),
    ).toEqual({ open: true, matches: true });
    // No field in the content and no reason: the confirmation takes the focus (G4).
    await expect(page.locator("#ok")).toBeFocused();
  });

  test("Escape cancels: the host says cancel, open is gone, the focus returns to the opener", async ({
    page,
  }) => {
    await serve(page, out, dialog(""));
    await listen(page);
    await page.locator("#opener").click();
    await page.locator("#d").evaluate((element) => element.setAttribute("open", ""));
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#d")).not.toHaveAttribute("open");
    await expect(page.getByRole("dialog")).toBeHidden();
    expect(await heard(page)).toEqual(["cancel:null"]);
    await expect(page.locator("#opener")).toBeFocused();
  });

  test("the low action cancels, the high action confirms with the reason; a prevented confirm keeps the dialog open", async ({
    page,
  }) => {
    await serve(page, out, dialog("open"));
    await listen(page);
    await page.locator("#cancel").click();
    await expect(page.locator("#d")).not.toHaveAttribute("open");
    expect(await heard(page)).toEqual(["cancel:null"]);
    await page.locator("#d").evaluate((element) => element.setAttribute("open", ""));
    await page.evaluate(() => {
      document.getElementById("d")?.addEventListener("confirm", (event) => event.preventDefault(), {
        once: true,
      });
    });
    await page.locator("#ok").click();
    // Prevented: still open (the application confirms later), the event was heard.
    await expect(page.locator("#d")).toHaveAttribute("open", "");
    expect(await heard(page)).toEqual(["cancel:null", 'confirm:{"reason":""}']);
    await page.locator("#ok").click();
    await expect(page.locator("#d")).not.toHaveAttribute("open");
    expect(await heard(page)).toEqual([
      "cancel:null",
      'confirm:{"reason":""}',
      'confirm:{"reason":""}',
    ]);
  });

  // Nachbesserung (CI-Lauf 38976295942 auf ③): closing and reopening in one go — the platform's
  // close event arrives after the dialog was shown again and must not take the new open back.
  // The test of the actions set open right after cancel; on the runner the close event landed
  // after it and the dialog vanished (the confirm never became visible).
  test("a dialog closed and reopened in one task stays open: the late close event takes nothing back", async ({
    page,
  }) => {
    await serve(page, out, dialog("open"));
    await page.locator("#d").evaluate((element) => {
      element.removeAttribute("open");
      element.setAttribute("open", "");
    });
    // Give the platform's close event time to land, then the dialog must still be open.
    await page.waitForTimeout(200);
    await expect(page.locator("#d")).toHaveAttribute("open", "");
    await expect(page.locator("#ok")).toBeVisible();
    expect(
      await page.locator("#d").evaluate((element) => {
        const native = element.shadowRoot?.querySelector("dialog");
        return native instanceof HTMLDialogElement && native.open;
      }),
    ).toBe(true);
  });

  test("reason required: the area takes the focus, the confirmation is locked until text is entered, and the text is the detail", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      dialog('open reason="required"', '<span slot="reason">Begründung</span>'),
    );
    await listen(page);
    const area = page.locator("#d").locator('[part="reason"]');
    await expect(area.getByRole("textbox", { name: "Begründung" })).toBeFocused();
    await expect(page.locator("#ok")).toHaveAttribute("disabled", "");
    await page.keyboard.type("Doppelt angelegt.");
    await expect(page.locator("#ok")).not.toHaveAttribute("disabled");
    await page.locator("#ok").click();
    expect(await heard(page)).toEqual(['confirm:{"reason":"Doppelt angelegt."}']);
    await expect(page.locator("#d")).not.toHaveAttribute("open");
  });

  test("reason optional shows the area without locking; reason none shows none", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      dialog('open reason="optional"', '<span slot="reason">Begründung</span>'),
    );
    await expect(page.locator("#d").locator('[part="reason"]')).toBeVisible();
    await expect(page.locator("#ok")).not.toHaveAttribute("disabled");
    await page.locator("#d").evaluate((element) => element.setAttribute("reason", "none"));
    await expect(page.locator("#d").locator('[part="reason"]')).toBeHidden();
  });

  test("a form dialog (E9): the first field takes the focus and an invalid field locks the confirmation", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      dialog(
        'open size="medium"',
        '<fm-kampo id="f1" slot="content" kind="number" min="1" required>Vorrang</fm-kampo><fm-kampo id="f2" slot="content">Notiz</fm-kampo>',
      ),
    );
    await expect(page.locator("#f1")).toBeFocused();
    // Required and empty: invalid, the confirmation is locked.
    await expect(page.locator("#ok")).toHaveAttribute("disabled", "");
    await page.keyboard.type("3");
    await expect(page.locator("#ok")).not.toHaveAttribute("disabled");
    await page.locator("#f1").locator('[part="control"]').fill("abc");
    await expect(page.locator("#ok")).toHaveAttribute("disabled", "");
  });

  test("the surface takes its width from size, the backdrop and the shadow from tokens", async ({
    page,
  }) => {
    await serve(page, out, dialog('open size="small"'));
    const measure = () =>
      page.locator("#d").evaluate((element) => {
        const control = element.shadowRoot?.querySelector("dialog") as HTMLDialogElement;
        const style = getComputedStyle(control);
        const root = getComputedStyle(document.documentElement);
        return {
          width: control.getBoundingClientRect().width,
          small: Number.parseFloat(root.getPropertyValue("--fm-size-container-small")),
          medium: Number.parseFloat(root.getPropertyValue("--fm-size-container-medium")),
          shadow: style.boxShadow,
          backdrop: getComputedStyle(control, "::backdrop").backgroundColor,
          fill: style.backgroundColor,
          radius: style.borderTopLeftRadius,
        };
      });
    const small = await measure();
    expect(Math.round(small.width)).toBe(Math.round(small.small));
    expect(small.shadow).not.toBe("none");
    expect(small.backdrop).not.toBe("rgba(0, 0, 0, 0)");
    expect(Number.parseFloat(small.radius)).toBeGreaterThan(0);
    await page.locator("#d").evaluate((element) => element.setAttribute("size", "medium"));
    const medium = await measure();
    expect(Math.round(medium.width)).toBe(Math.round(medium.medium));
    expect(medium.medium).toBeGreaterThan(small.small);
  });
});
