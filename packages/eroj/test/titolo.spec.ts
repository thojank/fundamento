// fm-titolo in the browser (Spec 014 ③; G5, plan ③ D-04): a heading whose level is structure
// (role heading, aria-level) and whose size is design — a type role, derived from the level where
// none is given (1 → headline-1 … 4–6 → headline-4); display sizes are a choice of design. The
// text wraps and breaks long words. Chromium, Firefox and WebKit.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const headingOf = (page: Parameters<typeof serve>[0], id: string) =>
  page.locator(`#${id}`).evaluate((element) => {
    const text = element.shadowRoot?.querySelector('[part="text"]') as HTMLElement;
    const style = getComputedStyle(text);
    return {
      role: text.getAttribute("role"),
      level: text.getAttribute("aria-level"),
      size: text.getAttribute("data-size"),
      fontSize: style.fontSize,
      family: style.fontFamily,
    };
  });

test.describe("fm-titolo behaviour", () => {
  test("a heading with its level; the size follows the level where none is given, else the size prop", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-titolo id="a" level="1">Seite</fm-titolo><fm-titolo id="b" level="2">Abschnitt</fm-titolo><fm-titolo id="c" level="5">Unterpunkt</fm-titolo><fm-titolo id="d" level="3" size="display-1">Groß</fm-titolo>`,
    );
    await expect(page.getByRole("heading", { level: 1, name: "Seite" })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 2, name: "Abschnitt" })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 5 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 3, name: "Groß" })).toHaveCount(1);
    const tokens = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const size = (role: string) =>
        root.getPropertyValue(`--fm-typography-${role}-font-size`).trim();
      return {
        h1: size("headline-1"),
        h2: size("headline-2"),
        h4: size("headline-4"),
        d1: size("display-1"),
      };
    });
    expect((await headingOf(page, "a")).size).toBe("headline-1");
    expect((await headingOf(page, "a")).fontSize).toBe(tokens.h1);
    expect((await headingOf(page, "b")).fontSize).toBe(tokens.h2);
    expect((await headingOf(page, "c")).size).toBe("headline-4");
    expect((await headingOf(page, "c")).fontSize).toBe(tokens.h4);
    expect((await headingOf(page, "d")).fontSize).toBe(tokens.d1);
    // The level follows the prop; the size with it where none is given.
    await page.locator("#b").evaluate((element) => element.setAttribute("level", "3"));
    await expect(page.getByRole("heading", { level: 3, name: "Abschnitt" })).toHaveCount(1);
    expect((await headingOf(page, "b")).size).toBe("headline-3");
  });

  test("the text wraps in a narrow container and breaks a long word; nothing is clipped", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div style="inline-size: 12rem"><fm-titolo id="a" level="2">Donaudampfschifffahrtsgesellschaftskapitänsmütze</fm-titolo></div>`,
    );
    const box = await page.locator("#a").evaluate((element) => {
      const text = element.shadowRoot?.querySelector('[part="text"]') as HTMLElement;
      return {
        lines:
          text.getBoundingClientRect().height /
          Number.parseFloat(getComputedStyle(text).lineHeight),
        clipped: text.scrollWidth > text.clientWidth + 1,
        width: text.getBoundingClientRect().width,
      };
    });
    expect(box.lines).toBeGreaterThan(1);
    expect(box.clipped).toBe(false);
    expect(Math.round(box.width)).toBe(192);
  });

  test("the level is a duty: without it the element warns and renders a heading nonetheless", async ({
    page,
  }) => {
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning") warnings.push(message.text());
    });
    await serve(page, out, `<fm-titolo id="a">Ohne Ebene</fm-titolo>`);
    await expect(page.getByRole("heading", { name: "Ohne Ebene" })).toHaveCount(1);
    await expect.poll(() => warnings.some((text) => text.includes("level is required"))).toBe(true);
  });
});
