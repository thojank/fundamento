// fm-pagxigilo in the browser (Spec 015 ①; G5, plan ① D-03): a nav landmark named by its label (the
// Modelo's word where empty) around the pages as buttons — the first, the last, the current one
// and its siblings, an ellipsis per gap, an arrow back and forth — every page named "Seite N",
// the current one with aria-current; a chosen page fires page-change (cancelable) and the page
// prop follows; in mode link every item is the platform's link to the href template. Chromium,
// Firefox and WebKit.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const pager = (attributes: string) => `<fm-pagxigilo id="p" ${attributes}></fm-pagxigilo>`;

test.describe("fm-pagxigilo behaviour", () => {
  test("page 5 of 10: a named landmark, the pages 1 · 4 5 6 · 10 as buttons named Seite N, the current one with aria-current, two ellipses not heard", async ({
    page,
  }) => {
    await serve(page, out, pager('page="5" total-pages="10" label="Seitenblättern"'));
    await expect(page.getByRole("navigation", { name: "Seitenblättern" })).toHaveCount(1);
    await expect(page.getByRole("button")).toHaveText(["", "1", "4", "5", "6", "10", ""]);
    for (const name of [
      "Vorherige Seite",
      "Seite 1",
      "Seite 4",
      "Seite 5",
      "Seite 6",
      "Seite 10",
      "Nächste Seite",
    ]) {
      await expect(page.getByRole("button", { name, exact: true })).toHaveCount(1);
    }
    await expect(page.getByRole("button", { name: "Seite 5", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
    const ellipses = await page
      .locator("#p")
      .evaluate((element) =>
        [...(element.shadowRoot?.querySelectorAll('[part="ellipsis"]') ?? [])].map((node) => [
          node.textContent,
          node.getAttribute("aria-hidden"),
        ]),
      );
    expect(ellipses).toEqual([
      ["…", "true"],
      ["…", "true"],
    ]);
    // Without a label the Modelo's word names the landmark.
    await page.locator("#p").evaluate((element) => element.removeAttribute("label"));
    await expect(page.getByRole("navigation", { name: "Seitenblättern" })).toHaveCount(1);
  });

  test("a chosen page fires page-change with the number and the page prop follows; preventDefault keeps the page; the arrows step and stop at the ends", async ({
    page,
  }) => {
    await serve(page, out, pager('page="1" total-pages="3"'));
    await expect(page.getByRole("button", { name: "Vorherige Seite" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await page.locator("#p").evaluate((element) => {
      (window as unknown as { seen: number[] }).seen = [];
      element.addEventListener("page-change", (event) => {
        (window as unknown as { seen: number[] }).seen.push((event as CustomEvent).detail.page);
      });
    });
    await page.getByRole("button", { name: "Seite 2", exact: true }).click();
    await expect(page.locator("#p")).toHaveAttribute("page", "2");
    await expect(page.getByRole("button", { name: "Seite 2", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await page.getByRole("button", { name: "Nächste Seite" }).click();
    await expect(page.locator("#p")).toHaveAttribute("page", "3");
    await expect(page.getByRole("button", { name: "Nächste Seite" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await page.getByRole("button", { name: "Nächste Seite" }).click();
    await expect(page.locator("#p")).toHaveAttribute("page", "3");
    await page.getByRole("button", { name: "Vorherige Seite" }).click();
    await expect(page.locator("#p")).toHaveAttribute("page", "2");
    expect(await page.evaluate(() => (window as unknown as { seen: number[] }).seen)).toEqual([
      2, 3, 2,
    ]);
    await page.locator("#p").evaluate((element) => {
      element.addEventListener("page-change", (event) => event.preventDefault());
    });
    await page.getByRole("button", { name: "Seite 1", exact: true }).click();
    await expect(page.locator("#p")).toHaveAttribute("page", "2");
  });

  test("mode link: every page is the platform's link to the href template; the current one is marked, the arrows at the ends carry no destination", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      pager('page="1" total-pages="3" mode="link" href-template="?seite={page}"'),
    );
    await expect(page.getByRole("button")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Seite 2", exact: true })).toHaveAttribute(
      "href",
      "?seite=2",
    );
    await expect(page.getByRole("link", { name: "Seite 1", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.getByRole("link", { name: "Nächste Seite" })).toHaveAttribute(
      "href",
      "?seite=2",
    );
    expect(
      await page
        .locator("#p")
        .evaluate((element) =>
          element.shadowRoot?.querySelector('[data-arrow="prev"]')?.hasAttribute("href"),
        ),
    ).toBe(false);
  });
});
