// fm-ikono in the browser (Spec 014 ②; G3, G5, plan ② D-05): a glyph of the Aspekto's icon set,
// masked in the current colour — decorative (hidden from assistive technology) unless it is named,
// then an image with that name; sized by size.icon.*; a status icon in its status text colour, and
// only with a name; the picture switches with the brand without a reload; a name whose direction
// carries meaning mirrors in right-to-left writing. Chromium, Firefox and WebKit.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const names = input.modelo.ikonaro.map((entry) => entry.name);

const glyphStyle = (page: Parameters<typeof serve>[0], id: string) =>
  page.locator(`#${id}`).evaluate((element) => {
    // The glyph is the control of an icon (one part, no second control inside a composing Ero).
    const glyph = element.shadowRoot?.querySelector('[part="glyph"]') as HTMLElement;
    const control = glyph;
    const style = getComputedStyle(glyph);
    const mask =
      style.maskImage !== "" && style.maskImage !== "none"
        ? style.maskImage
        : style.webkitMaskImage;
    return {
      mask,
      fill: style.backgroundColor,
      inline: getComputedStyle(control).inlineSize,
      block: getComputedStyle(control).blockSize,
      transform: style.transform,
      role: control.getAttribute("role"),
      hidden: control.getAttribute("aria-hidden"),
      name: control.getAttribute("aria-label"),
    };
  });

test.describe("fm-ikono behaviour", () => {
  test("decorative by default: hidden from assistive technology; named, it is an image with that name", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-ikono id="a" name="close"></fm-ikono><fm-ikono id="b" name="warning" label="Warnung"></fm-ikono>`,
    );
    const decorative = await glyphStyle(page, "a");
    expect(decorative.hidden).toBe("true");
    expect(decorative.role).toBeNull();
    await expect(page.getByRole("img")).toHaveCount(1);
    await expect(page.getByRole("img", { name: "Warnung" })).toHaveCount(1);
    const named = await glyphStyle(page, "b");
    expect(named.hidden).toBeNull();
    expect(named.role).toBe("img");
  });

  test("every name of the Ikonaro draws a glyph: a mask of the Aspekto's SVG in the current colour", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div style="color: rgb(10, 20, 30)">${names.map((name) => `<fm-ikono id="i-${name}" name="${name}"></fm-ikono>`).join("")}</div>`,
    );
    for (const name of names) {
      const style = await glyphStyle(page, `i-${name}`);
      expect(style.mask, name).toContain("data:image/svg+xml");
      expect(style.fill, name).toBe("rgb(10, 20, 30)");
    }
  });

  test("the box takes size.icon.* by size; a status icon takes its status text colour, only with a name", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-ikono id="s" name="check" size="small"></fm-ikono><fm-ikono id="l" name="check" size="large"></fm-ikono><fm-ikono id="d" name="danger" intent="danger" label="Fehler"></fm-ikono><fm-ikono id="u" name="danger" intent="danger"></fm-ikono>`,
    );
    const tokens = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      return {
        small: root.getPropertyValue("--fm-size-icon-small").trim(),
        large: root.getPropertyValue("--fm-size-icon-large").trim(),
        danger: root.getPropertyValue("--fm-color-status-danger-text").trim(),
      };
    });
    const small = await glyphStyle(page, "s");
    const large = await glyphStyle(page, "l");
    expect(small.inline).toBe(tokens.small);
    expect(small.block).toBe(tokens.small);
    expect(large.inline).toBe(tokens.large);
    expect(Number.parseFloat(large.inline)).toBeGreaterThan(Number.parseFloat(small.inline));
    const named = await glyphStyle(page, "d");
    const unnamed = await glyphStyle(page, "u");
    expect(named.fill).not.toBe(unnamed.fill);
    const dangerFill = await page.evaluate((hex) => {
      const probe = document.createElement("span");
      probe.style.color = hex;
      document.body.append(probe);
      const colour = getComputedStyle(probe).color;
      probe.remove();
      return colour;
    }, tokens.danger);
    expect(named.fill).toBe(dangerFill);
    // Without a name the constraint of the Skemo holds: the icon falls back to neutral and warns.
    expect(unnamed.role).toBeNull();
  });

  test("the picture switches with the brand: komuna and ekzemplo draw different glyphs of the same name", async ({
    page,
  }) => {
    await serve(page, out, `<fm-ikono id="a" name="close"></fm-ikono>`);
    const komuna = await glyphStyle(page, "a");
    await page.evaluate(() => document.documentElement.setAttribute("data-fm-aspekto", "ekzemplo"));
    const ekzemplo = await glyphStyle(page, "a");
    expect(komuna.mask).toContain("data:image/svg+xml");
    expect(ekzemplo.mask).toContain("data:image/svg+xml");
    expect(ekzemplo.mask).not.toBe(komuna.mask);
  });

  test("a name that leads on mirrors in right-to-left writing; a check does not (Internacia)", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-ikono id="c" name="chevron-right"></fm-ikono><fm-ikono id="k" name="check"></fm-ikono>`,
    );
    expect((await glyphStyle(page, "c")).transform).toBe("none");
    await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
    expect((await glyphStyle(page, "c")).transform).toBe("matrix(-1, 0, 0, 1, 0, 0)");
    expect((await glyphStyle(page, "k")).transform).toBe("none");
  });

  test("an unknown name warns and falls back; the element is no form control", async ({ page }) => {
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning") warnings.push(message.text());
    });
    await serve(page, out, `<fm-ikono id="a" name="banana"></fm-ikono>`);
    await expect.poll(() => warnings.some((text) => text.includes("fm-ikono"))).toBe(true);
    expect(
      await page.locator("#a").evaluate((element) => "formAssociated" in element.constructor),
    ).toBe(true);
  });
});
