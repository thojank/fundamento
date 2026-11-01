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

test.describe("②b-4 A-markdovido-3: streaming", () => {
  test("while streaming the document is busy; the text grows; then it is not", async ({ page }) => {
    await serve(page, out, '<fm-markdovido id="m" streaming source="Die Antwort"></fm-markdovido>');
    const busy = () =>
      page
        .locator("#m")
        .evaluate(
          (element) =>
            element.shadowRoot?.querySelector('[part="control"]')?.getAttribute("aria-busy") ??
            null,
        );
    await expect.poll(busy).toBe("true");
    await page
      .locator("#m")
      .evaluate((element) => element.setAttribute("source", "Die Antwort kommt Wort für Wort."));
    await expect(page.locator("#m")).toContainText("Wort für Wort.");
    expect(await busy()).toBe("true");
    await page.locator("#m").evaluate((element) => element.removeAttribute("streaming"));
    await expect.poll(busy).toBe(null);
  });

  test("without streaming the document is not busy", async ({ page }) => {
    await serve(page, out, '<fm-markdovido id="m" source="Fertig."></fm-markdovido>');
    await expect(page.locator("#m")).toContainText("Fertig.");
    expect(
      await page
        .locator("#m")
        .evaluate((element) =>
          element.shadowRoot?.querySelector('[part="control"]')?.hasAttribute("aria-busy"),
        ),
    ).toBe(false);
  });
});

test.describe("②b-4 A-elektilo-5, A-listelektilo-5, A-menuo-5: jumping by typing", () => {
  const LAENDER = [
    ["by", "Bayern"],
    ["be", "Berlin"],
    ["bb", "Brandenburg"],
    ["hb", "Bremen"],
    ["hh", "Hamburg"],
  ] as const;

  test("elektilo: the platform's select jumps to the option that starts with the typed words; the element takes no key", async ({
    page,
  }) => {
    const options = LAENDER.map(
      ([value, words]) => `<data slot="options" value="${value}">${words}</data>`,
    ).join("");
    await serve(page, out, `<fm-elektilo id="e" value="hh">Land${options}</fm-elektilo>`);
    await page.evaluate(() => {
      (window as unknown as { taken: string[] }).taken = [];
      window.addEventListener("keydown", (event) => {
        if (event.defaultPrevented)
          (window as unknown as { taken: string[] }).taken.push(event.key);
      });
    });
    await page.getByRole("combobox", { name: "Land" }).focus();
    await page.keyboard.type("bre");
    await expect(page.locator("#e")).toHaveAttribute("value", "hb");
    expect(await page.evaluate(() => (window as unknown as { taken: string[] }).taken)).toEqual([]);
  });

  /** The listelektilo with the states: its value, whether the list is open, the active row. */
  const listState = (page: Page) =>
    page.locator("#l").evaluate((element) => {
      const rows = [...(element.shadowRoot?.querySelectorAll('[part="item"]') ?? [])];
      const active = rows.find((row) => row.getAttribute("data-active") === "true");
      const box = element.shadowRoot?.querySelector('[role="combobox"]');
      const id = box?.getAttribute("aria-activedescendant");
      const byId = id ? element.shadowRoot?.getElementById(id) : null;
      return {
        value: element.getAttribute("value"),
        open: box?.getAttribute("aria-expanded") === "true",
        active: (byId ?? active)?.getAttribute("data-value") ?? null,
      };
    });

  const LIST = (attributes: string) =>
    `<fm-listelektilo id="l" ${attributes}>Land${LAENDER.map(([value, words]) => `<data slot="options" value="${value}">${words}</data>`).join("")}</fm-listelektilo>`;

  test("listelektilo: typed words find the option they start with – open, the active row; closed, the choice", async ({
    page,
  }) => {
    await serve(page, out, LIST('value="hh"'));
    const box = page.getByRole("combobox", { name: "Land" });
    await box.focus();
    await page.keyboard.type("bre");
    expect((await listState(page)).value).toBe("hb");
    await page.keyboard.press("ArrowDown");
    expect((await listState(page)).open).toBe(true);
    await page.keyboard.type("bra");
    expect((await listState(page)).active).toBe("bb");
    await page.keyboard.press("Enter");
    expect((await listState(page)).value).toBe("bb");
  });

  test("listelektilo: the same letter again moves on to the next option that starts with it", async ({
    page,
  }) => {
    await serve(page, out, LIST('value="hh"'));
    await page.getByRole("combobox", { name: "Land" }).focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.type("bbb");
    expect((await listState(page)).active).toBe("bb");
  });

  const MENU =
    '<fm-menuo id="m"><data value="edit">Bearbeiten</data><data value="rename">Benennen</data><data value="describe">Beschreiben</data><data value="help" to="#hilfe">Hilfe</data></fm-menuo>';

  /** The entry that has the focus in the menu: its words. */
  const focusedEntry = (page: Page) =>
    page.locator("#m").evaluate((element) => {
      const row = element.shadowRoot?.activeElement;
      return (row?.querySelector("slot")?.assignedNodes() ?? [])
        .map((node) => node.textContent ?? "")
        .join("")
        .trim();
    });

  test("menuo: typed words move the focus to the entry they start with", async ({ page }) => {
    await serve(page, out, MENU);
    await page.getByRole("button", { name: "Weitere Aktionen" }).focus();
    await page.keyboard.press("ArrowDown");
    await expect.poll(() => focusedEntry(page)).toBe("Bearbeiten");
    await page.keyboard.type("bes");
    await expect.poll(() => focusedEntry(page)).toBe("Beschreiben");
    await page.keyboard.press("Home");
    await page.keyboard.type("hi");
    await expect.poll(() => focusedEntry(page)).toBe("Hilfe");
  });

  test("menuo: an entry with a target is a link in the menu; Enter follows it and the menu closes, no select", async ({
    page,
  }) => {
    await serve(page, out, MENU);
    await listen(page, "m", ["select"]);
    await page.getByRole("button", { name: "Weitere Aktionen" }).click();
    const help = page.getByRole("menuitem", { name: "Hilfe" });
    await expect(help).toBeVisible();
    expect(
      await help.evaluate((row) => ({
        tag: row.tagName.toLowerCase(),
        href: row.getAttribute("href"),
      })),
    ).toEqual({ tag: "a", href: "#hilfe" });
    await expect(page.getByRole("menu")).toMatchAriaSnapshot(`
      - menu:
        - menuitem "Bearbeiten"
        - menuitem "Benennen"
        - menuitem "Beschreiben"
        - menuitem "Hilfe"
    `);
    // The other entries stay buttons: they act here.
    expect(
      await page
        .getByRole("menuitem", { name: "Bearbeiten" })
        .evaluate((row) => row.tagName.toLowerCase()),
    ).toBe("button");
    await help.focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#hilfe");
    await expect(page.getByRole("menu")).toBeHidden();
    expect(await heard(page)).toEqual([]);
  });
});
