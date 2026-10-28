// fm-avataro in the browser (Spec 015 ③; G1, plan ③ D-08): the avatar — an image named by its
// name, hidden from assistive technology where it is decorative; the picture once it has loaded,
// else the initials (the first grapheme of the first and of the last word, at most two), which
// also stand where the picture does not load. The box takes the size of its size, the picture and
// the initials are round; the initials stand on the sunken ground in the subtle text colour — the
// same for every name (E8). Chromium, Firefox and WebKit.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

/** A picture without a request: an SVG as a data address (%3A keeps the URL out of the text). */
const PICTURE =
  "data:image/svg+xml,%3Csvg xmlns='http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%23888888'/%3E%3C/svg%3E";

const shown = (page: import("@playwright/test").Page, selector: string) =>
  page.locator(selector).evaluate((element) => {
    const root = element.shadowRoot;
    const visible = (part: string) => {
      const node = root?.querySelector(`[part="${part}"]`) as HTMLElement;
      return !node.hidden && getComputedStyle(node).display !== "none";
    };
    return {
      image: visible("image"),
      initials: visible("initials"),
      text: root?.querySelector('[part="initials"]')?.textContent ?? "",
    };
  });

/** The resolved value of a token's custom property, read through a probe of the same property. */
const resolved = (page: import("@playwright/test").Page, property: string, variable: string) =>
  page.evaluate(
    ([p, v]) => {
      const probe = document.createElement("div");
      probe.style.setProperty(p, `var(${v})`);
      document.body.append(probe);
      const value = getComputedStyle(probe).getPropertyValue(p);
      probe.remove();
      return value;
    },
    [property, variable] as const,
  );

test.describe("fm-avataro behaviour", () => {
  test("an image named by its name; decorative hides it; the initials of the first and the last word", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-avataro id="a" name="Erika Maria Mustermann"></fm-avataro><fm-avataro id="b" name="Erika Mustermann" decorative></fm-avataro><span>Erika Mustermann</span><fm-avataro id="c" name="Cher"></fm-avataro>',
    );
    await expect(page.getByRole("img", { name: "Erika Maria Mustermann" })).toBeVisible();
    expect(await shown(page, "#a")).toEqual({ image: false, initials: true, text: "EM" });
    // Decorative: the name beside it is heard once.
    await expect(page.getByRole("img")).toHaveCount(2);
    expect(await shown(page, "#b")).toMatchObject({ initials: true, text: "EM" });
    // One word, one letter.
    expect((await shown(page, "#c")).text).toBe("C");
    await page.locator("#a").evaluate((element) => element.setAttribute("name", "jean-luc picard"));
    await expect(page.getByRole("img", { name: "jean-luc picard" })).toBeVisible();
    expect((await shown(page, "#a")).text).toBe("JP");
  });

  // Nachlese 5 N5-5 (O-18): the smallest size (20 px) carries one initial; two stood over the
  // circle in Figma, and the web shows the same as Figma.
  test("the smallest size shows one initial, the other sizes two; a change of size follows", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-avataro id="s" size="small" name="Erika Mustermann"></fm-avataro><fm-avataro id="m" name="Erika Mustermann"></fm-avataro><fm-avataro id="l" size="large" name="Erika Mustermann"></fm-avataro>',
    );
    expect((await shown(page, "#s")).text).toBe("E");
    expect((await shown(page, "#m")).text).toBe("EM");
    expect((await shown(page, "#l")).text).toBe("EM");
    // The name stays whole for assistive technology.
    await expect(page.getByRole("img", { name: "Erika Mustermann" })).toHaveCount(3);
    await page.locator("#m").evaluate((element) => element.setAttribute("size", "small"));
    await expect.poll(async () => (await shown(page, "#m")).text).toBe("E");
    await page.locator("#s").evaluate((element) => element.removeAttribute("size"));
    await expect.poll(async () => (await shown(page, "#s")).text).toBe("EM");
  });

  test("the picture once it has loaded; a picture that does not load leaves the initials", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-avataro id="a" name="Erika Mustermann" picture="${PICTURE}"></fm-avataro><fm-avataro id="b" name="Erika Mustermann" picture="data:,"></fm-avataro>`,
    );
    await expect.poll(async () => (await shown(page, "#a")).image).toBe(true);
    expect((await shown(page, "#a")).initials).toBe(false);
    await expect.poll(async () => (await shown(page, "#b")).initials).toBe(true);
    expect((await shown(page, "#b")).image).toBe(false);
    // The picture goes: the initials come back; a new picture shows once loaded.
    await page.locator("#a").evaluate((element) => element.removeAttribute("picture"));
    await expect.poll(async () => (await shown(page, "#a")).initials).toBe(true);
    await page.locator("#b").evaluate((element, p) => element.setAttribute("picture", p), PICTURE);
    await expect.poll(async () => (await shown(page, "#b")).image).toBe(true);
  });

  test("the box by size, round; the initials on the sunken ground in the subtle text — the same for every name (E8)", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-avataro id="s" size="small" name="Erika Mustermann"></fm-avataro><fm-avataro id="m" name="Max Mustermann"></fm-avataro><fm-avataro id="l" size="large" name="Zoë Zhang"></fm-avataro>',
    );
    const look = (selector: string) =>
      page.locator(selector).evaluate((element) => {
        const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        const initials = element.shadowRoot?.querySelector('[part="initials"]') as HTMLElement;
        const style = getComputedStyle(initials);
        return {
          width: control.getBoundingClientRect().width,
          height: control.getBoundingClientRect().height,
          background: style.backgroundColor,
          color: style.color,
          radius: style.borderTopLeftRadius,
        };
      });
    const small = await look("#s");
    const medium = await look("#m");
    const large = await look("#l");
    // Spec 029 ①b: the Ero-Tokens of the avataro (komuna takes them from the Fonto).
    expect(small.width).toBe(
      Number.parseFloat(
        await resolved(page, "inline-size", "--fm-ero-avataro-box-size-size-small"),
      ),
    );
    expect(medium.width).toBe(
      Number.parseFloat(
        await resolved(page, "inline-size", "--fm-ero-avataro-box-size-size-medium"),
      ),
    );
    expect(large.width).toBe(
      Number.parseFloat(
        await resolved(page, "inline-size", "--fm-ero-avataro-box-size-size-large"),
      ),
    );
    for (const one of [small, medium, large]) expect(one.height).toBe(one.width);
    expect(small.background).toBe(
      await resolved(page, "background-color", "--fm-ero-avataro-initials-fill"),
    );
    expect(small.color).toBe(await resolved(page, "color", "--fm-ero-avataro-initials-color"));
    // E8: every name, the same colours.
    expect([medium.background, large.background]).toEqual([small.background, small.background]);
    expect([medium.color, large.color]).toEqual([small.color, small.color]);
    expect(Number.parseFloat(small.radius)).toBeGreaterThanOrEqual(small.width / 2);
  });

  test("without a name the developer is warned", async ({ page }) => {
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning") warnings.push(message.text());
    });
    await serve(page, out, '<fm-avataro id="a"></fm-avataro>');
    await expect
      .poll(() => warnings.filter((warning) => warning.includes("name is required")).length)
      .toBeGreaterThan(0);
  });
});
