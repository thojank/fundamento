// fm-templinio in the browser (Spec 046 T4, section C): the platform's own ordered list in the light
// DOM, styled by a host-scoped stylesheet the document adopts. Every <li> keeps its <time>, its
// title and what happened; its data-status (done, current, upcoming) is never a colour alone: a
// sign of its own shape stands at its start, the word of the status is heard, the current title
// weighs more. The greyscale check reads the drawn signs as the state rules read colours – with the
// hue taken away (grayscale), what remains must still tell the three apart. An empty list draws
// nothing and throws nothing. Chromium (Spec 046 T4); the Vitrino follows in T5.

import { expect, type Page, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const templinio = input.modelo.eroj.find((entry) => entry.ero.name === "templinio");
const texts = templinio?.skemo.a11y.texts ?? {};

const STATUSES = ["done", "current", "upcoming"] as const;

const ENTRIES = [
  ["done", "2026-10-01", "1. Oktober", "Entwurf", "Die erste Fassung steht."],
  ["current", "2026-10-15", "15. Oktober", "Prüfung", "Die Fassung wird geprüft."],
  ["upcoming", "2026-11-02", "2. November", "Freigabe", "Die Fassung wird freigegeben."],
] as const;

const TIMES = ENTRIES.map(([, datetime, words]) => `<time datetime="${datetime}">${words}</time>`);

const timeline = (attributes = "") =>
  `<fm-templinio id="t" ${attributes}><ol>${ENTRIES.map(
    ([status, , , title, body], index) =>
      `<li data-status="${status}">${TIMES[index]}<strong>${title}</strong><p>${body}</p></li>`,
  ).join("")}</ol></fm-templinio>`;

/** Errors of the page and of its console while a body is served. */
async function served(page: Page, body: string): Promise<string[]> {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await serve(page, out, body);
  await page.waitForFunction(() => customElements.get("fm-templinio") !== undefined);
  return errors;
}

/**
 * The ink of the sign at the start of an entry in greyscale: the share of its box whose lightness
 * departs from the box's corner (the ground) – a filled sign has much, a ring less, a dashed ring
 * less again. The screenshot is taken with the page in grayscale, so hue says nothing.
 */
async function inkOf(page: Page, status: string): Promise<number> {
  const marker = page.locator(`#t li[data-status="${status}"] > [data-fm-marker]`);
  await expect(marker).toHaveCount(1);
  const png = (await marker.screenshot()).toString("base64");
  return page.evaluate(async (data) => {
    const image = new Image();
    image.src = `data:image/png;base64,${data}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");
    if (context === null) return -1;
    context.drawImage(image, 0, 0);
    const { data: pixels } = context.getImageData(0, 0, image.width, image.height);
    const light = (index: number) =>
      (0.2126 * (pixels[index] ?? 0) +
        0.7152 * (pixels[index + 1] ?? 0) +
        0.0722 * (pixels[index + 2] ?? 0)) /
      255;
    const ground = light(0);
    let ink = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      if (Math.abs(light(index) - ground) > 0.2) ink += 1;
    }
    return ink / (pixels.length / 4);
  }, png);
}

test.describe("fm-templinio behaviour", () => {
  test("every status has a sign of its own shape, told apart in greyscale", async ({ page }) => {
    const errors = await served(page, timeline());
    await expect(page.locator("#t li > [data-fm-marker]")).toHaveCount(3);
    await page.evaluate(() => {
      document.documentElement.style.filter = "grayscale(1)";
    });
    const ink = Object.fromEntries(
      await Promise.all(STATUSES.map(async (status) => [status, await inkOf(page, status)])),
    ) as Record<(typeof STATUSES)[number], number>;
    // Filled more than solid, solid more than dashed – each by a clear margin, not by hue.
    expect(ink.done).toBeGreaterThan(ink.current + 0.15);
    expect(ink.current).toBeGreaterThan(ink.upcoming + 0.03);
    expect(ink.upcoming).toBeGreaterThan(0);
    // The shape is the stroke and the fill of the sign: dashed, solid, solid and filled.
    const shapes = await page
      .locator("#t li > [data-fm-marker]")
      .evaluateAll((markers) => markers.map((marker) => getComputedStyle(marker).borderTopStyle));
    expect(shapes).toEqual(["solid", "solid", "dashed"]);
    expect(errors).toEqual([]);
  });

  test("every status is heard as its word; the current title weighs more than the others", async ({
    page,
  }) => {
    await served(page, timeline('label="Änderungen"'));
    for (const status of STATUSES) {
      const word = page.locator(`#t li[data-status="${status}"] .fm-hidden`);
      await expect(word).toHaveText(texts[`${status}-name`]?.de ?? "missing");
      expect(await word.evaluate((element) => getComputedStyle(element).clipPath)).toBe(
        "inset(50%)",
      );
    }
    expect(await page.locator("#t ol").getAttribute("aria-label")).toBe("Änderungen");
    const weights = await page
      .locator("#t li > strong")
      .evaluateAll((titles) => titles.map((title) => Number(getComputedStyle(title).fontWeight)));
    expect(weights[1]).toBeGreaterThan(weights[0] ?? 0);
    expect(weights[1]).toBeGreaterThan(weights[2] ?? 0);
    // A status written later changes the word and the sign; the application owns the status.
    await page.locator('#t li[data-status="upcoming"]').evaluate((item) => {
      item.setAttribute("data-status", "done");
    });
    await expect(page.locator("#t li").nth(2).locator(".fm-hidden")).toHaveText(
      texts["done-name"]?.de ?? "missing",
    );
    await expect(page.locator("#t li").nth(2).locator(".fm-hidden")).toHaveCount(1);
  });

  test("the time of every entry stays as it was written", async ({ page }) => {
    await served(page, timeline());
    await expect(page.locator("#t li > [data-fm-marker]")).toHaveCount(3);
    const times = await page
      .locator("#t li > time")
      .evaluateAll((elements) => elements.map((element) => element.outerHTML));
    expect(times).toEqual(TIMES);
    // The list is still the platform's ordered list in the light DOM, its entries in order.
    expect(await page.locator("#t > ol > li").count()).toBe(3);
    await expect(page.locator("#t li > strong")).toHaveText(ENTRIES.map((entry) => entry[3]));
  });

  test("an empty list draws nothing and throws nothing", async ({ page }) => {
    const errors = await served(
      page,
      `<p id="before">Davor</p><fm-templinio id="t"><ol></ol></fm-templinio><fm-templinio id="u"></fm-templinio><p id="after">Danach</p>`,
    );
    await expect(page.locator("#t")).toBeAttached();
    const sizes = await page.evaluate(() =>
      ["#t", "#u"].map((selector) => {
        const box = (document.querySelector(selector) as HTMLElement).getBoundingClientRect();
        return Math.round(box.height);
      }),
    );
    expect(sizes).toEqual([0, 0]);
    expect(await page.locator("[data-fm-marker]").count()).toBe(0);
    expect(errors).toEqual([]);
  });
});
