// Spec 036 Teil 5 ②b-4 (Spec 029 abgleich.json, aspect "verhalten" and the remaining Muster rows)
// in the browser: the behaviour the Skemo states – roles by status and by purpose, jumping by
// typing, overflow, download, an unknown total, a collapsed middle, streaming. Roles are asserted
// structurally (getByRole, the ARIA snapshot), never by prose. A usage without the new props
// behaves as before (AC-10, compared by ac10 outside this suite).

import { expect, type Page, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

/** The events of the given types the element with the id says, in order. */
async function listen(page: Page, id: string, types: readonly string[]): Promise<void> {
  await page.evaluate(
    ([target, names]) => {
      const host = document.getElementById(target);
      (window as unknown as { heard: string[] }).heard = [];
      for (const type of names) {
        host?.addEventListener(type, () =>
          (window as unknown as { heard: string[] }).heard.push(type),
        );
      }
    },
    [id, types] as const,
  );
}

const heard = (page: Page) => page.evaluate(() => (window as unknown as { heard: string[] }).heard);

test.describe("②b-4 A-avizo-5: the role follows the intent", () => {
  test("warning and danger are alerts, info and success are status", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-avizo id="i" intent="info">Gespeichert.</fm-avizo><fm-avizo id="s" intent="success">Hochgeladen.</fm-avizo><fm-avizo id="w" intent="warning">Speicher fast voll.</fm-avizo><fm-avizo id="d" intent="danger">Nicht gespeichert.</fm-avizo>',
    );
    await expect(page.getByRole("status")).toHaveCount(2);
    await expect(page.getByRole("alert")).toHaveCount(2);
    await expect(page.locator("body")).toMatchAriaSnapshot(`
      - status: /Gespeichert\\./
      - status: /Hochgeladen\\./
      - alert: /Speicher fast voll\\./
      - alert: /Nicht gespeichert\\./
    `);
    // The role follows a later change of the intent.
    await page.locator("#w").evaluate((element) => element.setAttribute("intent", "info"));
    await expect(page.getByRole("status")).toHaveCount(3);
    await expect(page.getByRole("alert")).toHaveCount(1);
  });
});

test.describe("②b-4 A-dialogo-5, M-3: the purpose decides how the dialog closes and its role", () => {
  const ACTIONS =
    '<fm-butono id="cancel" slot="actions" emphasis="low">Abbrechen</fm-butono><fm-butono id="ok" slot="actions" emphasis="high">Weiter</fm-butono>';
  const dialog = (dismiss: string) =>
    `<fm-dialogo id="d" open ${dismiss === "" ? "" : `dismiss="${dismiss}"`}>Sitzung läuft ab<span slot="message">Bitte bestätigen.</span>${ACTIONS}</fm-dialogo>`;

  /** A click on the backdrop: the top left corner of the viewport, outside the surface. */
  const clickBeside = (page: Page) => page.mouse.click(4, 4);

  test("free: a hint – Escape and a click beside it close it, role dialog", async ({ page }) => {
    await serve(page, out, dialog("free"));
    await expect(page.getByRole("dialog", { name: "Sitzung läuft ab" })).toBeVisible();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
    await listen(page, "d", ["cancel", "confirm"]);
    await clickBeside(page);
    await expect(page.locator("#d")).not.toHaveAttribute("open");
    await expect(page.getByRole("dialog")).toBeHidden();
    expect(await heard(page)).toEqual(["cancel"]);
    await page.locator("#d").evaluate((element) => element.setAttribute("open", ""));
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#d")).not.toHaveAttribute("open");
    expect(await heard(page)).toEqual(["cancel", "cancel"]);
  });

  test("free: a click inside the surface does not close it", async ({ page }) => {
    await serve(page, out, dialog("free"));
    const modal = page.getByRole("dialog", { name: "Sitzung läuft ab" });
    await expect(modal).toBeVisible();
    await listen(page, "d", ["cancel"]);
    const box = await modal.boundingBox();
    // The padding of the surface, beside its heading: inside the dialog, on no child.
    await page.mouse.click((box?.x ?? 0) + 3, (box?.y ?? 0) + 3);
    await expect(page.locator("#d")).toHaveAttribute("open");
    expect(await heard(page)).toEqual([]);
  });

  test("guarded (the default): a form – only Escape closes it, a click beside it does not", async ({
    page,
  }) => {
    await serve(page, out, dialog(""));
    await expect(page.getByRole("dialog", { name: "Sitzung läuft ab" })).toBeVisible();
    await listen(page, "d", ["cancel"]);
    await clickBeside(page);
    await expect(page.locator("#d")).toHaveAttribute("open");
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await heard(page)).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(page.locator("#d")).not.toHaveAttribute("open");
    expect(await heard(page)).toEqual(["cancel"]);
  });

  test("explicit: a duty – role alertdialog, neither Escape nor a click beside it closes it; the actions do", async ({
    page,
  }) => {
    await serve(page, out, dialog("explicit"));
    const modal = page.getByRole("alertdialog", { name: "Sitzung läuft ab" });
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAccessibleDescription("Bitte bestätigen.");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(modal).toMatchAriaSnapshot(`
      - alertdialog "Sitzung läuft ab":
        - heading "Sitzung läuft ab" [level=2]
        - paragraph: Bitte bestätigen.
        - button "Abbrechen"
        - button "Weiter"
    `);
    await listen(page, "d", ["cancel", "confirm"]);
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await clickBeside(page);
    await expect(page.locator("#d")).toHaveAttribute("open");
    await expect(modal).toBeVisible();
    expect(await heard(page)).toEqual([]);
    await page.locator("#cancel").click();
    await expect(page.locator("#d")).not.toHaveAttribute("open");
    expect(await heard(page)).toEqual(["cancel"]);
  });

  test("the role follows a later change of the purpose", async ({ page }) => {
    await serve(page, out, dialog("explicit"));
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.locator("#d").evaluate((element) => element.setAttribute("dismiss", "guarded"));
    await expect(page.getByRole("dialog", { name: "Sitzung läuft ab" })).toBeVisible();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
  });
});
