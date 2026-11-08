// fm-vico in the browser (Spec 046 T1, section A): a row of any children with the gap of its
// spacing step between them; with wrap it breaks into a new line where its container is narrower
// than its children, without wrap it keeps them in one line. The gap is the spacing step's custom
// property, never a literal. Chromium (Spec 046 T1); the Vitrino and its geometry follow in T5.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

/** Three boxes of 6rem in a row inside a container of `width`. */
const row = (attributes: string, width: string) =>
  `<div style="inline-size: ${width}"><fm-vico id="r" ${attributes}>${["Eins", "Zwei", "Drei"]
    .map((word) => `<div style="inline-size: 6rem; flex: none">${word}</div>`)
    .join("")}</fm-vico></div>`;

// The children of the light DOM (a CSS locator would pierce the shadow and find the control too).
const topsOf = (page: Parameters<typeof serve>[0]) =>
  page
    .locator("#r")
    .evaluate((row) => [...row.children].map((box) => Math.round(box.getBoundingClientRect().top)));

const gapsOf = (page: Parameters<typeof serve>[0]) =>
  page.locator("#r").evaluate((row) => {
    const boxes = [...row.children];
    return boxes
      .slice(1)
      .map((box, index) =>
        Math.round(
          box.getBoundingClientRect().left - (boxes[index]?.getBoundingClientRect().right ?? 0),
        ),
      );
  });

const tokenPx = (page: Parameters<typeof serve>[0], name: string) =>
  page.evaluate(
    (property) =>
      Math.round(
        Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(property)),
      ),
    name,
  );

test.describe("fm-vico behaviour", () => {
  test("lays its children side by side with the gap of its step (default medium, large given)", async ({
    page,
  }) => {
    await serve(page, out, `${row("", "40rem")}`);
    const tops = await topsOf(page);
    expect(new Set(tops).size).toBe(1);
    const medium = await tokenPx(page, "--fm-spacing-medium");
    expect(medium).toBeGreaterThan(0);
    expect(await gapsOf(page)).toEqual([medium, medium]);
    await page.locator("#r").evaluate((element) => element.setAttribute("gap", "large"));
    const large = await tokenPx(page, "--fm-spacing-large");
    await expect.poll(() => gapsOf(page)).toEqual([large, large]);
  });

  test("with wrap it breaks into a new line in a narrow container; without wrap it stays in one line", async ({
    page,
  }) => {
    await serve(page, out, row("wrap", "13rem"));
    const wrapped = await topsOf(page);
    expect(wrapped[1]).toBe(wrapped[0]);
    expect(wrapped[2]).toBeGreaterThan(wrapped[0] ?? 0);
    // Without wrap the row keeps one line, however narrow its container.
    await page.locator("#r").evaluate((element) => element.removeAttribute("wrap"));
    await expect.poll(async () => new Set(await topsOf(page)).size).toBe(1);
  });

  test("draws nothing of its own: no role, no background, no border, the font of its container", async ({
    page,
  }) => {
    await serve(page, out, `<div style="font-size: 23px">${row("", "40rem")}</div>`);
    const own = await page.locator("#r").evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      const style = getComputedStyle(control);
      return {
        role: control.getAttribute("role"),
        background: style.backgroundColor,
        border: style.borderBlockStartWidth,
        font: style.fontSize,
      };
    });
    expect(own).toEqual({
      role: null,
      background: "rgba(0, 0, 0, 0)",
      border: "0px",
      font: "23px",
    });
  });
});
