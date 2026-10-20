// Spec 020 ① (G2, G4, Abnahme 3): the Sxablonoj sxelo and pagxo in the browser. The shell sets
// the landmarks banner and main once, its navigation is the navigado's, its notices are a polite
// live region; its own skip link is the first focusable element and moves the focus to main
// without a fragment. The page has one focus target, its title (a titolo of level 1, focusable).
// Both are axe-clean, mirror in RTL, and lay out by the width of their container, not of the
// viewport. Chromium, Firefox and WebKit.

import { expect, test } from "@playwright/test";
import { axeViolations } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const PAGE =
  '<fm-pagxo id="p"><fm-titolo slot="title" level="1" focusable>Standards</fm-titolo><fm-insigno slot="badges" intent="success">Gültig</fm-insigno><fm-insigno slot="badges">Pflicht</fm-insigno><fm-teksto slot="subtitle">Alle Standards des Projekts.</fm-teksto><fm-butono slot="actions" emphasis="high">Bearbeiten</fm-butono><fm-menuo slot="actions" label="Weitere Aktionen"><data value="delete" intent="danger">Löschen</data></fm-menuo><section><fm-titolo level="2">Geltung</fm-titolo><fm-teksto>Gilt in allen Projekten.</fm-teksto></section></fm-pagxo>';

const SHELL = `<fm-sxelo id="s"><span slot="brand">Arkitekturo</span><span slot="principal">Erika Mustermann</span><fm-navigado slot="nav" label="Hauptnavigation" page="standards"><a href="#/standards" data-page="standards">Standards</a><a href="#/projekte" data-page="projekte">Projekte</a></fm-navigado><fm-avizo slot="notices" intent="success">Gespeichert.</fm-avizo>${PAGE}</fm-sxelo>`;

test.describe("Spec 020 ① Sxablonoj", () => {
  test("sxelo: one banner, one navigation, one main; the notices are polite", async ({ page }) => {
    await serve(page, out, SHELL);
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("navigation")).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("banner")).toContainText("Arkitekturo");
    const live = await page.locator("#s").evaluate((element) => {
      const region = element.shadowRoot?.querySelector('[part="notices"]');
      return region?.getAttribute("aria-live") ?? null;
    });
    expect(live).toBe("polite");
  });

  test("sxelo: its skip link is the first stop and moves the focus to main, the fragment stays", async ({
    page,
  }) => {
    await serve(page, out, SHELL);
    await page.keyboard.press("Tab");
    const first = await page.evaluate(() => {
      const shell = document.getElementById("s");
      return shell?.shadowRoot?.activeElement?.tagName.toLowerCase() ?? "";
    });
    expect(first).toBe("fm-saltligilo");
    await page.keyboard.press("Enter");
    await expect
      .poll(() =>
        page.evaluate(() => {
          const shell = document.getElementById("s");
          return shell?.shadowRoot?.activeElement?.getAttribute("part") ?? "";
        }),
      )
      .toBe("main");
    expect(await page.evaluate(() => location.hash)).toBe("");
  });

  test("pagxo: focus() on the page moves the focus to its title, the one focus target", async ({
    page,
  }) => {
    await serve(page, out, PAGE);
    await page.evaluate(() => document.getElementById("p")?.focus());
    await expect
      .poll(() =>
        page.evaluate(() => {
          const title = document.querySelector('#p > [slot="title"]');
          return document.activeElement === title;
        }),
      )
      .toBe(true);
    await expect(page.getByRole("heading", { level: 1, name: "Standards" })).toBeVisible();
  });

  test("both are axe-clean", async ({ page }) => {
    await serve(page, out, SHELL);
    expect(await axeViolations(page)).toEqual([]);
  });

  test("RTL mirrors the shell and the page: the brand stands at the right, the actions at the left", async ({
    page,
  }) => {
    await serve(page, out, `<div dir="rtl">${SHELL}</div>`);
    const place = await page.evaluate(() => {
      const shell = document.getElementById("s");
      const brand = shell?.querySelector('[slot="brand"]')?.getBoundingClientRect();
      const principal = shell?.querySelector('[slot="principal"]')?.getBoundingClientRect();
      const title = document.querySelector('#p > [slot="title"]')?.getBoundingClientRect();
      const action = document
        .querySelector('#p > fm-butono[slot="actions"]')
        ?.getBoundingClientRect();
      return {
        brandRight: (brand?.left ?? 0) > (principal?.left ?? 0),
        actionsLeft: (action?.left ?? 0) < (title?.left ?? 0),
      };
    });
    expect(place).toEqual({ brandRight: true, actionsLeft: true });
  });

  test("the page lays out by its container: narrow, the actions go under the title; wide, beside it", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div id="narrow" style="inline-size: 20rem">${PAGE.replace('id="p"', 'id="pn"')}</div><div id="wide" style="inline-size: 60rem">${PAGE.replace('id="p"', 'id="pw"')}</div>`,
    );
    const below = (id: string) =>
      page.evaluate((page) => {
        const title = document.querySelector(`#${page} > [slot="title"]`)?.getBoundingClientRect();
        const action = document
          .querySelector(`#${page} > fm-butono[slot="actions"]`)
          ?.getBoundingClientRect();
        return (action?.top ?? 0) >= (title?.bottom ?? 0);
      }, id);
    expect(await below("pn")).toBe(true);
    expect(await below("pw")).toBe(false);
  });
});
