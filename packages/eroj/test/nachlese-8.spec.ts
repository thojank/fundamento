// Nachlese 8 ② (Abnahme Spec 020, V-1 to V-4, F-5, F-6): the Sxablonoj and the markdovido in the
// browser. The page's badges keep a gap to the title; the shell's navigation starts where its head
// and main do; a page in the shell's main keeps the width of the main, so the shell is no taller
// than its content; the editor's preview begins at the height of its field; a nested list takes
// the indent of the first level; a table of a markdovido is named by the heading before it.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const PAGE =
  '<fm-pagxo><fm-titolo slot="title" level="1" focusable>Standards</fm-titolo><fm-insigno slot="badges" intent="success">Gültig</fm-insigno><fm-teksto slot="subtitle">Alle Standards des Projekts.</fm-teksto><fm-butono slot="actions" emphasis="high">Bearbeiten</fm-butono><section><fm-titolo level="2">Geltung</fm-titolo><fm-teksto>Gilt in allen Projekten.</fm-teksto></section></fm-pagxo>';
const SHELL = `<div style="inline-size: 60rem"><fm-sxelo id="s"><span slot="brand">Fundamento</span><span slot="principal">Erika Mustermann</span><fm-navigado slot="nav" label="Hauptnavigation" page="standards"><a href="#a" data-page="standards">Standards</a><a href="#b" data-page="projekte">Projekte</a></fm-navigado><fm-avizo slot="notices" intent="success">Gespeichert.</fm-avizo>${PAGE}</fm-sxelo></div>`;

test.describe("Nachlese 8 ② the Sxablonoj", () => {
  test("V-1: the badges of a page keep a gap to its title", async ({ page }) => {
    await serve(page, out, `<div style="inline-size: 60rem">${PAGE}</div>`);
    const gap = await page.evaluate(() => {
      const title = document.querySelector('[slot="title"]')?.getBoundingClientRect();
      const badge = document.querySelector('[slot="badges"]')?.getBoundingClientRect();
      return (badge?.left ?? 0) - (title?.right ?? 0);
    });
    expect(gap).toBeGreaterThanOrEqual(4);
  });

  test("V-2: the navigation of the shell starts where its head and its main start", async ({
    page,
  }) => {
    await serve(page, out, SHELL);
    const lefts = await page.evaluate(() =>
      ['[slot="brand"]', '[slot="nav"] a', "fm-pagxo"].map(
        (selector) => document.querySelector(`#s ${selector}`)?.getBoundingClientRect().left ?? -1,
      ),
    );
    expect(Math.abs((lefts[1] ?? 0) - (lefts[0] ?? 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((lefts[2] ?? 0) - (lefts[0] ?? 0))).toBeLessThanOrEqual(1);
  });

  test("V-3: a page in the shell's main keeps the width of the main; the shell is as tall as its content", async ({
    page,
  }) => {
    await serve(page, out, SHELL);
    const measured = await page.evaluate(() => {
      const shell = document.querySelector("#s");
      const main = shell?.shadowRoot?.querySelector('[part="main"]');
      const pagxo = shell?.querySelector("fm-pagxo");
      const padding =
        main instanceof HTMLElement
          ? Number.parseFloat(getComputedStyle(main).paddingInlineStart)
          : 0;
      return {
        shell: shell?.getBoundingClientRect().height ?? 0,
        main: (main?.getBoundingClientRect().width ?? 0) - 2 * padding,
        pagxo: pagxo?.getBoundingClientRect().width ?? 0,
      };
    });
    expect(measured.pagxo).toBeGreaterThanOrEqual(measured.main - 1);
    expect(measured.shell).toBeLessThan(500);
  });

  test("V-4: the editor's preview begins at the height of its field", async ({ page }) => {
    await serve(
      page,
      out,
      '<div style="inline-size: 72rem"><fm-redaktilo id="r" preview-label="Vorschau"><fm-tekstareo slot="field" kind="code" rows="6" value="Text">Quelltext</fm-tekstareo><fm-markdovido slot="preview"></fm-markdovido></fm-redaktilo></div>',
    );
    await expect(page.locator("#r fm-markdovido fm-teksto")).toHaveText("Text");
    const tops = await page.evaluate(() => {
      const field = document.querySelector("#r fm-tekstareo");
      const area = field?.shadowRoot?.querySelector("textarea")?.getBoundingClientRect().top ?? 0;
      const preview = document.querySelector("#r fm-markdovido")?.getBoundingClientRect().top ?? 0;
      const label = document
        .querySelector("#r")
        ?.shadowRoot?.querySelector('[part="preview-label"]');
      return {
        area,
        preview,
        label: label?.textContent ?? "",
        hidden: label?.getAttribute("aria-hidden"),
      };
    });
    expect(Math.abs(tops.preview - tops.area)).toBeLessThanOrEqual(1);
    expect(tops).toMatchObject({ label: "Vorschau", hidden: "true" });
  });
});

test.describe("Nachlese 8 ② the markdovido", () => {
  test("F-5: a nested list takes the indent of the first level", async ({ page }) => {
    await serve(page, out, '<fm-markdovido id="m"></fm-markdovido>');
    await page.locator("#m").evaluate((element) => {
      (element as unknown as { source: string }).source = "- eins\n  - zwei\n    - drei";
    });
    await expect(page.locator("#m ul ul ul > li")).toHaveText("drei");
    const indents = await page.evaluate(() =>
      ["#m > ul", "#m ul ul", "#m ul ul ul"].map(
        (selector) =>
          getComputedStyle(document.querySelector(selector) as Element).paddingInlineStart,
      ),
    );
    expect(new Set(indents).size, JSON.stringify(indents)).toBe(1);
  });

  test("F-6: a table is named by the heading before it, as a tabelo is by its caption", async ({
    page,
  }) => {
    await serve(page, out, '<fm-markdovido id="m"></fm-markdovido>');
    await page.locator("#m").evaluate((element) => {
      (element as unknown as { source: string }).source =
        "## Standards\n\n| Name | Status |\n|---|:---:|\n| STD-1 | gültig |";
    });
    const table = page.locator("#m fm-tabelo");
    await expect(table.locator("table > caption")).toHaveText("Standards");
    await expect(table).toHaveAttribute("caption-hidden", "");
    await expect(page.getByRole("table", { name: "Standards" })).toBeVisible();
  });
});
