// fm-karto in the browser (Spec 015 ③; G1, plan ③ D-03, D-04): the card — the platform's article
// named by its heading, a composed titolo at the card's level; standalone false makes it a region
// (named the same). Media, meta and actions show only while they have content; the surface is the
// raised one with its subtle border, radius and shadow. A horizontal card lays its media beside
// the body while its container is at least size.container.small wide and stacks below; in
// right-to-left writing the media stands at the right. An image in the media without alt is a
// developer warning. Chromium, Firefox and WebKit.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

/** A picture without a request (the Vitrino loads nothing from outside): an inline SVG. */
const PICTURE =
  '<svg slot="media" aria-hidden="true" viewBox="0 0 16 9"><rect width="16" height="9" fill="currentColor"></rect></svg>';

const card = (attributes: string, extra = "") =>
  `<fm-karto id="k" level="3" ${attributes}><span slot="heading">Barrierefreiheit</span>Kontrast, Fokus und Namen in jeder Marke.${extra}</fm-karto>`;

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

test.describe("fm-karto behaviour", () => {
  test("an article named by its heading, a heading of the card's level; standalone false is a region named the same", async ({
    page,
  }) => {
    await serve(page, out, card(""));
    await expect(page.getByRole("article", { name: "Barrierefreiheit" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Barrierefreiheit" })).toBeVisible();
    await page.locator("#k").evaluate((element) => element.setAttribute("level", "4"));
    await expect(page.getByRole("heading", { level: 4, name: "Barrierefreiheit" })).toBeVisible();
    // standalone defaults to true; "false" (attribute or property) makes it a section of the page.
    await page.locator("#k").evaluate((element) => {
      (element as HTMLElement & { standalone: boolean }).standalone = false;
    });
    await expect(page.locator("#k")).toHaveAttribute("standalone", "false");
    await expect(page.getByRole("article")).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Barrierefreiheit" })).toBeVisible();
    expect(
      await page
        .locator("#k")
        .evaluate((element) => (element as HTMLElement & { standalone: boolean }).standalone),
    ).toBe(false);
    await page.locator("#k").evaluate((element) => {
      (element as HTMLElement & { standalone: boolean }).standalone = true;
    });
    await expect(page.locator("#k")).not.toHaveAttribute("standalone");
    await expect(page.getByRole("article", { name: "Barrierefreiheit" })).toBeVisible();
  });

  test("media, meta and actions show only while they have content; the surface is raised with its border, radius and shadow", async ({
    page,
  }) => {
    await serve(page, out, card(""));
    const visible = (part: string) =>
      page.locator("#k").evaluate((element, p) => {
        const node = element.shadowRoot?.querySelector(`[part="${p}"]`) as HTMLElement;
        return !node.hidden && getComputedStyle(node).display !== "none";
      }, part);
    expect(await visible("media")).toBe(false);
    expect(await visible("meta")).toBe(false);
    expect(await visible("actions")).toBe(false);
    await page.locator("#k").evaluate((element, picture) => {
      element.insertAdjacentHTML(
        "beforeend",
        `${picture}<fm-insigno slot="meta">gültig</fm-insigno><fm-butono slot="actions" emphasis="high">Öffnen</fm-butono><fm-butono slot="actions" emphasis="low">Teilen</fm-butono>`,
      );
    }, PICTURE);
    expect(await visible("media")).toBe(true);
    expect(await visible("meta")).toBe(true);
    expect(await visible("actions")).toBe(true);
    const surface = await page.locator("#k").evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      const style = getComputedStyle(control);
      return {
        background: style.backgroundColor,
        border: style.borderTopColor,
        style: style.borderTopStyle,
        radius: style.borderTopLeftRadius,
        shadow: style.boxShadow,
      };
    });
    expect(surface.background).toBe(
      await resolved(page, "background-color", "--fm-color-background-raised"),
    );
    expect(surface.border).toBe(
      await resolved(page, "border-top-color", "--fm-color-border-subtle"),
    );
    expect(surface.style).toBe("solid");
    expect(surface.radius).toBe(
      await resolved(page, "border-top-left-radius", "--fm-radius-role-surface"),
    );
    expect(surface.shadow).not.toBe("none");
    // The media is edge to edge: as wide as the surface inside its border.
    const widths = await page.locator("#k").evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      const media = element.shadowRoot?.querySelector('[part="media"]') as HTMLElement;
      return { control: control.clientWidth, media: media.getBoundingClientRect().width };
    });
    expect(Math.abs(widths.control - widths.media)).toBeLessThan(1);
  });

  test("horizontal: the media beside the body in a wide container, stacked below size.container.small; right to left at the right", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div id="wide" style="inline-size: 900px">${card('orientation="horizontal"', PICTURE)}</div>`,
    );
    const layout = () =>
      page.locator("#k").evaluate((element) => {
        const root = element.shadowRoot;
        const control = root?.querySelector('[part="control"]') as HTMLElement;
        const media = root?.querySelector('[part="media"]')?.getBoundingClientRect();
        const body = root?.querySelector('[part="body"]')?.getBoundingClientRect();
        return {
          direction: getComputedStyle(control).flexDirection,
          stacked: control.classList.contains("fm-stacked"),
          mediaLeft: media?.left ?? 0,
          bodyLeft: body?.left ?? 0,
          mediaTop: media?.top ?? 0,
          bodyTop: body?.top ?? 0,
        };
      });
    await expect.poll(async () => (await layout()).direction).toBe("row");
    const wide = await layout();
    expect(wide.stacked).toBe(false);
    expect(wide.mediaLeft).toBeLessThan(wide.bodyLeft);
    // Narrower than size.container.small (640 px): stacked like a vertical card.
    await page.locator("#wide").evaluate((element) => {
      element.style.inlineSize = "400px";
    });
    await expect.poll(async () => (await layout()).stacked).toBe(true);
    const narrow = await layout();
    expect(narrow.direction).toBe("column");
    expect(narrow.mediaTop).toBeLessThan(narrow.bodyTop);
    // Wide again, in right-to-left writing: the media at the inline start, the right.
    await page.locator("#wide").evaluate((element) => {
      element.style.inlineSize = "900px";
      element.setAttribute("dir", "rtl");
    });
    await expect.poll(async () => (await layout()).stacked).toBe(false);
    const rtl = await layout();
    expect(rtl.mediaLeft).toBeGreaterThan(rtl.bodyLeft);
    // A vertical card never stacks: there is nothing to measure.
    await page.locator("#k").evaluate((element) => element.setAttribute("orientation", "vertical"));
    await expect.poll(async () => (await layout()).direction).toBe("column");
    expect((await layout()).stacked).toBe(false);
  });

  test("an image in the media without alt warns the developer; alt='' does not", async ({
    page,
  }) => {
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning") warnings.push(message.text());
    });
    await serve(page, out, card("", '<img slot="media" alt="" src="data:,">'));
    await expect(page.getByRole("article")).toBeVisible();
    expect(warnings.filter((warning) => warning.includes("fm-karto"))).toEqual([]);
    await page.locator("#k").evaluate((element) => {
      element.insertAdjacentHTML("beforeend", '<img slot="media" src="data:,">');
    });
    await expect
      .poll(() => warnings.filter((warning) => warning.includes("has no alt")).length)
      .toBe(1);
  });
});
