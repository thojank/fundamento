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
    // Abnahme 015 ① S-2: a chevron stands between two levels only — none after the current page.
    const separators = await page
      .locator("#s")
      .evaluate((element) =>
        [...(element.shadowRoot?.querySelectorAll('[part="separator"]') ?? [])]
          .filter((node) => (node as HTMLElement).checkVisibility())
          .map((node) => [node.getAttribute("name"), node.getAttribute("aria-hidden")]),
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

  // Abnahme 015 ① S-1: the levels stand in one line where the container is wide enough, wrap
  // only where it is not (Uzo wrap: allowed), and run from right to left in right-to-left writing.
  test("the levels stand in one line in a wide container, wrap in a narrow one, and mirror in right-to-left writing", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div style="inline-size: 40rem">${MARKUP}</div><div style="inline-size: 6rem">${MARKUP.replace('id="s"', 'id="n"')}</div><div dir="rtl" style="inline-size: 40rem">${MARKUP.replace('id="s"', 'id="r"')}</div>`,
    );
    const boxes = (id: string) =>
      page.locator(`#${id}`).evaluate((element) =>
        [...element.children].map((child) => {
          const box = child.getBoundingClientRect();
          return { top: Math.round(box.top), left: box.left };
        }),
      );
    const wide = await boxes("s");
    expect(new Set(wide.map((box) => box.top)).size).toBe(1);
    expect(wide[1]?.left ?? 0).toBeGreaterThan(wide[0]?.left ?? 0);
    const narrow = await boxes("n");
    expect(new Set(narrow.map((box) => box.top)).size).toBeGreaterThan(1);
    const rtl = await boxes("r");
    expect(new Set(rtl.map((box) => box.top)).size).toBe(1);
    expect(rtl[1]?.left ?? 0).toBeLessThan(rtl[0]?.left ?? 0);
  });
});
