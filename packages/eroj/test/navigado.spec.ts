// fm-navigado in the browser (Spec 011 ⑤; G4, G7, E10, plan ⑤ D-07): the platform's own links
// stay in the light DOM inside a nav landmark named by the label prop; the item of the current
// page carries aria-current and differs by more than colour (its underline); a count is a
// composed insigno whose digit is not heard and whose description is; horizontal items wrap in
// their order, vertical items stack. Chromium, Firefox and WebKit.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const nav = (attributes: string, items = "") =>
  `<fm-navigado id="n" ${attributes}>${
    items ||
    '<a href="#standards" data-page="standards">Standards</a><a href="#versions" data-page="versions">Versionen</a><a href="#rules" data-page="rules">Regeln</a>'
  }</fm-navigado>`;

test.describe("fm-navigado behaviour", () => {
  test("a nav landmark named by its label holds the native links; the current page carries aria-current and follows the prop", async ({
    page,
  }) => {
    await serve(page, out, nav('label="Hauptnavigation" page="versions"'));
    const landmark = page.getByRole("navigation", { name: "Hauptnavigation" });
    await expect(landmark).toHaveCount(1);
    await expect(page.getByRole("link")).toHaveCount(3);
    await expect(page.getByRole("link", { name: "Versionen" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(await page.locator("#n a[aria-current]").count()).toBe(1);
    // The links are the platform's: an href each, nothing of the Ero's in between.
    expect(await page.locator("#n > a[href]").count()).toBe(3);
    await page.locator("#n").evaluate((element) => element.setAttribute("page", "rules"));
    await expect(page.getByRole("link", { name: "Regeln" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(await page.locator("#n a[aria-current]").count()).toBe(1);
    // Without a page no item is current; an item without data-page is matched by its href.
    await page.locator("#n").evaluate((element) => element.removeAttribute("page"));
    expect(await page.locator("#n a[aria-current]").count()).toBe(0);
    await page.locator("#n").evaluate((element) => {
      element.querySelector("a")?.removeAttribute("data-page");
      element.setAttribute("page", "#standards");
    });
    await expect(page.getByRole("link", { name: "Standards" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("the current item differs by more than colour: its underline; the others carry none", async ({
    page,
  }) => {
    await serve(page, out, nav('label="Hauptnavigation" page="standards"'));
    const decoration = (name: string) =>
      page.getByRole("link", { name }).evaluate((element) => {
        const style = getComputedStyle(element);
        return { line: style.textDecorationLine, colour: style.color, fill: style.backgroundColor };
      });
    const current = await decoration("Standards");
    const other = await decoration("Versionen");
    expect(current.line).toBe("underline");
    expect(other.line).toBe("none");
    expect(current.colour).not.toBe(other.colour);
  });

  test("a count is a composed insigno: the digit is not heard, the description is; it follows the data and leaves with it", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      nav(
        'label="Hauptnavigation" page="standards"',
        '<a href="#standards" data-page="standards">Standards</a><a href="#versions" data-page="versions" data-count="1" data-count-description="1 Version in Prüfung">Versionen</a>',
      ),
    );
    const badge = page.locator("#n a[data-count] fm-insigno");
    await expect(badge).toHaveCount(1);
    await expect(badge).toHaveAttribute("intent", "info");
    const heard = await badge.evaluate((element) => ({
      digit: element.querySelector('[aria-hidden="true"]')?.textContent,
      description: element.querySelector('[slot="description"]')?.textContent,
    }));
    expect(heard).toEqual({ digit: "1", description: "1 Version in Prüfung" });
    await expect(page.getByRole("link", { name: "Versionen 1 Version in Prüfung" })).toHaveCount(
      1,
    );
    await page.locator("#n a[data-count]").evaluate((element) => {
      element.setAttribute("data-count", "2");
      element.setAttribute("data-count-description", "2 Versionen in Prüfung");
    });
    await expect(badge.locator('[aria-hidden="true"]')).toHaveText("2");
    await page.locator("#n a[data-count]").evaluate((element) => {
      element.removeAttribute("data-count");
      element.removeAttribute("data-count-description");
    });
    await expect(page.locator("#n fm-insigno")).toHaveCount(0);
  });

  test("horizontal items stand in a row and wrap in their order when the container is narrow; vertical items stack", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div id="w" style="inline-size: 40rem">${nav('label="Hauptnavigation"')}</div>`,
    );
    const tops = () =>
      page.locator("#n a").evaluateAll((elements) =>
        elements.map((element) => Math.round(element.getBoundingClientRect().top)),
      );
    const lefts = () =>
      page.locator("#n a").evaluateAll((elements) =>
        elements.map((element) => Math.round(element.getBoundingClientRect().left)),
      );
    const row = await tops();
    expect(new Set(row).size).toBe(1);
    const order = await lefts();
    expect(order[0]).toBeLessThan(order[1] ?? 0);
    expect(order[1]).toBeLessThan(order[2] ?? 0);
    // The host takes the width of its container (Uzo: size container).
    const outer = await page.locator("#w").boundingBox();
    const host = await page.locator("#n").boundingBox();
    expect(Math.round(host?.width ?? 0)).toBe(Math.round(outer?.width ?? 0));
    await page.locator("#w").evaluate((element) => {
      (element as HTMLElement).style.inlineSize = "12rem";
    });
    const wrapped = await tops();
    expect(new Set(wrapped).size).toBeGreaterThan(1);
    expect(wrapped[0]).toBeLessThanOrEqual(wrapped[2] ?? 0);
    await page.locator("#n").evaluate((element) => element.setAttribute("orientation", "vertical"));
    const stacked = await tops();
    expect(stacked[0]).toBeLessThan(stacked[1] ?? 0);
    expect(stacked[1]).toBeLessThan(stacked[2] ?? 0);
  });
});
