// Spec 035 2.3 (the findings of the plugin acceptance of 30.10.), on the web: 2.3.1 the calendar
// in the trigger of the datelektilo is as large as the chevron of the elektilo (size medium, the
// date picker has no size), its button stays a target of at least 24 × 24 px (WCAG 2.5.8). In
// every brand of the build (komuna, the reference, and ekzemplo), light and dark.

import { expect, type Page, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const TARGET_MIN = 24;
const BRANDS = ["komuna", "ekzemplo"].flatMap((aspekto) =>
  ["light", "dark"].map((scheme) => ({ aspekto, scheme })),
);

const PAGE = [
  '<div style="inline-size: 20rem">',
  '<fm-elektilo id="elektilo" clearable value="a">Land<data slot="options" value="a">A</data><data slot="options" value="b">B</data></fm-elektilo>',
  '<fm-datelektilo id="datelektilo" clearable value="2026-10-30">Lieferdatum</fm-datelektilo>',
  '<fm-kampo id="kampo" clearable value="Anna">Name</fm-kampo>',
  "</div>",
].join("");

async function open(page: Page, aspekto: string, scheme: string) {
  await serve(page, out, PAGE);
  await page.evaluate(
    ({ aspekto, scheme }) => {
      document.documentElement.setAttribute("data-fm-aspekto", aspekto);
      document.documentElement.setAttribute("data-fm-color-scheme", scheme);
    },
    { aspekto, scheme },
  );
}

/** The box of an element in the shadow root of `#id`, by a selector there (null if absent). */
async function boxIn(page: Page, id: string, selector: string) {
  return page.evaluate(
    ({ id, selector }) => {
      const element = document.getElementById(id)?.shadowRoot?.querySelector(selector);
      if (element === null || element === undefined) return null;
      const box = element.getBoundingClientRect();
      return { width: box.width, height: box.height, left: box.left, top: box.top };
    },
    { id, selector },
  );
}

test.describe("Spec 035 2.3.1: the calendar as large as the chevron of the elektilo", () => {
  for (const { aspekto, scheme } of BRANDS) {
    test(`${aspekto}, ${scheme}: the calendar's glyph is the chevron's size; its button a target of at least 24 × 24 px`, async ({
      page,
    }) => {
      await open(page, aspekto, scheme);
      const chevron = await boxIn(page, "elektilo", '[part="indicator"] fm-ikono');
      const calendar = await boxIn(page, "datelektilo", '[part="trigger"] fm-ikono');
      const trigger = await boxIn(page, "datelektilo", '[part="trigger"]');
      expect(chevron, "the chevron").not.toBeNull();
      expect(calendar, "the calendar").not.toBeNull();
      expect(
        [calendar?.width, calendar?.height],
        "the calendar's glyph as large as the chevron",
      ).toEqual([chevron?.width, chevron?.height]);
      expect(trigger?.width ?? 0, "the trigger's width").toBeGreaterThanOrEqual(TARGET_MIN);
      expect(trigger?.height ?? 0, "the trigger's height").toBeGreaterThanOrEqual(TARGET_MIN);
      // The glyph in the middle of its button.
      const middle = (box: typeof trigger) => [
        (box?.left ?? 0) + (box?.width ?? 0) / 2,
        (box?.top ?? 0) + (box?.height ?? 0) / 2,
      ];
      const [x, y] = middle(calendar);
      const [cx, cy] = middle(trigger);
      expect(Math.abs((x ?? 0) - (cx ?? 0)), "centred across").toBeLessThanOrEqual(0.5);
      expect(Math.abs((y ?? 0) - (cy ?? 0)), "centred along").toBeLessThanOrEqual(0.5);
    });
  }
});

/** What the ✕ of a field shows: its button's size, the glyph's box, markup and colour. */
async function crossOf(page: Page, id: string) {
  return page.evaluate((id) => {
    const clear = document.getElementById(id)?.shadowRoot?.querySelector('[part="clear"]');
    const icon = clear?.querySelector("fm-ikono");
    const glyph = icon?.shadowRoot?.querySelector('[part="glyph"]');
    if (clear === null || clear === undefined || icon === null || icon === undefined) return null;
    const box = icon.getBoundingClientRect();
    const target = clear.getBoundingClientRect();
    return {
      size: clear.getAttribute("size"),
      name: icon.getAttribute("name"),
      iconSize: icon.getAttribute("size"),
      glyph: [box.width, box.height],
      markup: glyph?.innerHTML ?? "",
      color: glyph === null || glyph === undefined ? "" : getComputedStyle(glyph).color,
      target: [target.width, target.height],
    };
  }, id);
}

test.describe("Spec 035 2.3.3: the ✕ of the datelektilo as large and as strong as the kampo's", () => {
  for (const { aspekto, scheme } of BRANDS) {
    test(`${aspekto}, ${scheme}: the same button, the same glyph at the same size and colour; a target of at least 24 × 24 px`, async ({
      page,
    }) => {
      await open(page, aspekto, scheme);
      const kampo = await crossOf(page, "kampo");
      const datelektilo = await crossOf(page, "datelektilo");
      expect(kampo, "the kampo's ✕").not.toBeNull();
      expect(datelektilo, "the datelektilo's ✕").not.toBeNull();
      expect(datelektilo?.size, "the button's size").toBe(kampo?.size);
      expect(datelektilo?.name, "the glyph").toBe(kampo?.name);
      expect(datelektilo?.iconSize, "the glyph's size").toBe(kampo?.iconSize);
      expect(datelektilo?.glyph, "the glyph's box").toEqual(kampo?.glyph);
      expect(datelektilo?.markup, "the glyph's drawing (its strokes)").toBe(kampo?.markup);
      expect(datelektilo?.color, "the glyph's colour").toBe(kampo?.color);
      for (const side of datelektilo?.target ?? []) {
        expect(side, "the target").toBeGreaterThanOrEqual(TARGET_MIN);
      }
    });
  }
});
