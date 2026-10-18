// fm-spuro in the browser (Spec 015 ①; G5, E10, plan ① D-04): the platform's own links stay in the
// light DOM; the shadow lists them in order with a decorative chevron between two; the last item
// (or the page prop's) is the current page with aria-current, text rather than link; the landmark
// is named by the label, the Modelo's word where empty. Chromium, Firefox and WebKit.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const MARKUP =
  '<fm-spuro id="s" label="Pfad"><a href="#start">Start</a><a href="#projekte">Projekte</a><span>Fundamento</span></fm-spuro>';

test.describe("fm-spuro behaviour", () => {
  test("a named landmark with an ordered list of the items; two links, the last item current and no link; a chevron between two, not heard", async ({
    page,
  }) => {
    await serve(page, out, MARKUP);
    await expect(page.getByRole("navigation", { name: "Pfad" })).toHaveCount(1);
    await expect(page.getByRole("listitem")).toHaveCount(3);
    await expect(page.getByRole("link")).toHaveCount(2);
    await expect(page.getByRole("link", { name: "Start" })).toHaveAttribute("href", "#start");
    const current = page.locator("#s > [aria-current]");
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText("Fundamento");
    await expect(current).toHaveAttribute("aria-current", "page");
    const separators = await page
      .locator("#s")
      .evaluate((element) =>
        [...(element.shadowRoot?.querySelectorAll('[part="separator"]:not([hidden])') ?? [])].map(
          (node) => [node.getAttribute("name"), node.getAttribute("aria-hidden")],
        ),
      );
    expect(separators).toEqual([
      ["chevron-right", "true"],
      ["chevron-right", "true"],
    ]);
    // The links are the platform's: direct children, nothing of the Ero's in between.
    expect(await page.locator("#s > a[href]").count()).toBe(2);
  });

  test("the page prop names the current item by its key; without a label the Modelo's word names the landmark; the current item differs by weight, not by colour alone", async ({
    page,
  }) => {
    await serve(page, out, MARKUP);
    await page.locator("#s").evaluate((element) => {
      element.setAttribute("page", "#projekte");
      element.removeAttribute("label");
    });
    await expect(page.getByRole("link", { name: "Projekte" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(await page.locator("#s > [aria-current]").count()).toBe(1);
    await expect(page.getByRole("navigation", { name: "Pfad" })).toHaveCount(1);
    const weights = await page
      .locator("#s")
      .evaluate((element) =>
        [...element.children].map((child) => getComputedStyle(child).fontWeight),
      );
    expect(weights[1]).not.toBe(weights[0]);
    const lines = await page
      .locator("#s")
      .evaluate((element) =>
        [...element.children].map((child) => getComputedStyle(child).textDecorationLine),
      );
    expect(lines[0]).toContain("underline");
    expect(lines[1]).toBe("none");
  });
});
