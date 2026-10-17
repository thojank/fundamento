// fm-saltligilo in the browser (Spec 014 ②; G5, plan ② D-07): the first focusable element of a
// page, a link to the fragment of its target — hidden until it has the focus, then shown above
// everything on the overlay layer with its focus ring; Enter moves the focus to the target (a
// landmark, or an element the link makes focusable); the text of an empty label is the Modelo's
// "Zum Inhalt springen". Chromium, Firefox and WebKit.

import { expect, test } from "@playwright/test";
import { TAB } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const stateOf = (page: Parameters<typeof serve>[0]) =>
  page.locator("#s").evaluate((element) => {
    const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
    const style = getComputedStyle(control);
    const box = control.getBoundingClientRect();
    return {
      href: control.getAttribute("href"),
      clip: style.clipPath,
      position: style.position,
      z: style.zIndex,
      outline: Number.parseFloat(style.outlineWidth),
      text: control.textContent?.trim() ?? "",
      focused: element.shadowRoot?.activeElement === control,
      top: box.top,
      left: box.left,
    };
  });

test.describe("fm-saltligilo behaviour", () => {
  test("hidden until focus; the first Tab focuses it, then it is shown above the page with its ring; its text is the Modelo's", async ({
    page,
    browserName,
  }) => {
    await serve(
      page,
      out,
      `<fm-saltligilo id="s" to="main"></fm-saltligilo><fm-butono id="b">Davor</fm-butono><main id="main"><h1>Inhalt</h1></main>`,
    );
    const hidden = await stateOf(page);
    expect(hidden.href).toBe("#main");
    expect(hidden.clip).not.toBe("none");
    expect(hidden.text).toBe("Zum Inhalt springen");
    await expect(page.getByRole("link", { name: "Zum Inhalt springen" })).toHaveCount(1);
    await page.keyboard.press(TAB(browserName));
    const shown = await stateOf(page);
    expect(shown.focused).toBe(true);
    expect(shown.clip).toBe("none");
    expect(shown.position).toBe("fixed");
    expect(shown.outline).toBeGreaterThan(0);
    const layer = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--fm-elevation-layer-overlay").trim(),
    );
    expect(shown.z).toBe(layer);
    expect(shown.top).toBeLessThan(40);
    expect(shown.left).toBeLessThan(40);
  });

  test("Enter moves the focus to the target: a landmark without tabindex takes it (the link makes it focusable)", async ({
    page,
    browserName,
  }) => {
    await serve(
      page,
      out,
      `<fm-saltligilo id="s" to="main"></fm-saltligilo><fm-butono id="b">Davor</fm-butono><main id="main"><h1>Inhalt</h1><fm-butono id="c">Danach</fm-butono></main>`,
    );
    await page.keyboard.press(TAB(browserName));
    await page.keyboard.press("Enter");
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.id ?? ""))
      .toBe("main");
    expect(await page.evaluate(() => document.getElementById("main")?.getAttribute("tabindex"))).toBe(
      "-1",
    );
    expect(await page.evaluate(() => location.hash)).toBe("#main");
    await page.keyboard.press(TAB(browserName));
    await expect.poll(() => page.evaluate(() => document.activeElement?.id ?? "")).toBe("c");
  });

  test("a slotted text replaces the default; the language of the document picks the default's words", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-saltligilo id="s" to="main">Direkt zum Formular</fm-saltligilo><main id="main"></main>`,
    );
    await expect(page.getByRole("link", { name: "Direkt zum Formular" })).toHaveCount(1);
    await page.locator("#s").evaluate((element) => {
      element.textContent = "";
      document.documentElement.lang = "en";
    });
    await expect(page.getByRole("link", { name: "Skip to content" })).toHaveCount(1);
  });
});
