// fm-butono in the browser (Spec 003 T011; FR-07, plan D-07, AK-03 for the component, WCAG 2.5.8).
// Chromium, Firefox and WebKit (playwright.config.ts).

import { boundToken, combinationsOf } from "@fundamento/modelo";
import { expect, test } from "@playwright/test";

/** WebKit on macOS moves Tab focus to buttons only with Alt+Tab (system default). */
const TAB = (browserName: string) => (browserName === "webkit" ? "Alt+Tab" : "Tab");

import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const butono = input.modelo.eroj.find((entry) => entry.ero.name === "butono");
if (butono === undefined) throw new Error("butono missing");
const skemo = butono.skemo;

test.describe("fm-butono behaviour", () => {
  test("role button, name from the slot, from the label prop when icon-only", async ({ page }) => {
    await serve(
      page,
      out,
      `<fm-butono id="a">Speichern</fm-butono><fm-butono id="b" label="Schließen"><svg slot="icon-start" aria-hidden="true"></svg></fm-butono>`,
    );
    await expect(page.getByRole("button", { name: "Speichern" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Schließen" })).toBeVisible();
  });

  test("Tab reaches it, Enter and Space activate it, disabled is skipped", async ({
    page,
    browserName,
  }) => {
    await serve(
      page,
      out,
      `<fm-butono id="a">Eins</fm-butono><fm-butono id="b" disabled>Zwei</fm-butono><fm-butono id="c">Drei</fm-butono>`,
    );
    await page.evaluate(() => {
      (window as unknown as { clicks: string[] }).clicks = [];
      for (const id of ["a", "b", "c"]) {
        document.getElementById(id)?.addEventListener("click", () => {
          (window as unknown as { clicks: string[] }).clicks.push(id);
        });
      }
    });
    await page.keyboard.press(TAB(browserName));
    await expect(page.locator("#a")).toBeFocused();
    await page.keyboard.press("Enter");
    await page.keyboard.press(TAB(browserName));
    await expect(page.locator("#c")).toBeFocused();
    await page.keyboard.press("Space");
    expect(await page.evaluate(() => (window as unknown as { clicks: string[] }).clicks)).toEqual([
      "a",
      "c",
    ]);
  });

  test("loading keeps focus, announces busy and swallows activation", async ({
    page,
    browserName,
  }) => {
    await serve(page, out, `<fm-butono id="a">Senden</fm-butono>`);
    await page.evaluate(() => {
      (window as unknown as { clicks: number }).clicks = 0;
      document.getElementById("a")?.addEventListener("click", () => {
        (window as unknown as { clicks: number }).clicks++;
      });
    });
    await page.keyboard.press(TAB(browserName));
    await page.locator("#a").evaluate((element) => element.setAttribute("loading", ""));
    await expect(page.locator("#a")).toBeFocused();
    const button = page.getByRole("button", { name: "Senden" });
    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button).toHaveAttribute("aria-disabled", "true");
    await page.keyboard.press("Enter");
    expect(await page.evaluate(() => (window as unknown as { clicks: number }).clicks)).toBe(0);
  });

  test("type=submit submits and type=reset resets the outer form", async ({ page }) => {
    await serve(
      page,
      out,
      `<form id="f"><input id="i" name="i" value="x"><fm-butono id="r" type="reset">Zurücksetzen</fm-butono><fm-butono id="s" type="submit">Senden</fm-butono></form>`,
    );
    await page.evaluate(() => {
      (window as unknown as { submitted: number }).submitted = 0;
      document.getElementById("f")?.addEventListener("submit", (event) => {
        event.preventDefault();
        (window as unknown as { submitted: number }).submitted++;
      });
    });
    await page.fill("#i", "changed");
    await page.click("#r");
    await expect(page.locator("#i")).toHaveValue("x");
    await page.click("#s");
    expect(await page.evaluate(() => (window as unknown as { submitted: number }).submitted)).toBe(
      1,
    );
  });

  test("an invalid value falls back to the default and warns once, naming the allowed values", async ({
    page,
  }) => {
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning") warnings.push(message.text());
    });
    await serve(page, out, `<fm-butono id="a" variant="ghost">A</fm-butono>`);
    expect(
      await page
        .locator("#a")
        .evaluate((element) => (element as HTMLElement & { variant: string }).variant),
    ).toBe("secondary");
    expect(warnings.filter((text) => text.includes("ghost"))).toHaveLength(1);
    expect(warnings[0]).toContain("primary, secondary, tertiary");
  });

  test("tone=danger with variant=secondary renders tone=default and warns with the kialo", async ({
    page,
  }) => {
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning") warnings.push(message.text());
    });
    await serve(page, out, `<fm-butono id="a" variant="secondary" tone="danger">A</fm-butono>`);
    const control = page.locator("#a").locator('[part="control"]');
    await expect(control).toHaveAttribute("data-tone", "default");
    expect(warnings.join("\n")).toContain(skemo.constraints?.[0]?.kialo ?? "?");
  });

  test("delegates focus to the inner button and exposes only ::part(control)", async ({ page }) => {
    await serve(page, out, `<fm-butono id="a">A</fm-butono>`);
    await page.locator("#a").focus();
    expect(
      await page
        .locator("#a")
        .evaluate((element) => element.shadowRoot?.activeElement?.getAttribute("part")),
    ).toBe("control");
    expect(
      await page
        .locator("#a")
        .evaluate((element) =>
          [...(element.shadowRoot?.querySelectorAll("[part]") ?? [])].map((n) =>
            n.getAttribute("part"),
          ),
        ),
    ).toEqual(["control"]);
  });
});

/** The rgb() string a browser computes for a resolved colour token. */
function rgb(value: unknown): string {
  const color = value as { components: number[]; alpha?: number };
  const [r, g, b] = color.components.map((c) => Math.round(c * 255));
  return color.alpha === undefined || color.alpha >= 1
    ? `rgb(${r}, ${g}, ${b})`
    : `rgba(${r}, ${g}, ${b}, ${color.alpha})`;
}

for (const aspekto of ["komuna", "ekzemplo"]) {
  test(`${aspekto}: computed styles of every variant × tone × size × state equal the bound tokens (AK-03)`, async ({
    page,
  }) => {
    const rezolvo = input.rezolvoj.rezolvoj.find(
      (candidate) =>
        candidate.assignment.aspekto === aspekto &&
        candidate.assignment["color-scheme"] === "light" &&
        candidate.assignment.contrast === "default" &&
        candidate.assignment.density === "default" &&
        candidate.assignment.viewport === "medium" &&
        candidate.assignment.motion === "reduced",
    );
    if (rezolvo === undefined) throw new Error("combination missing");
    const combos = combinationsOf(skemo, ["variant", "tone", "size"]);
    const body = combos
      .map(
        (c, i) =>
          `<fm-butono id="b${i}" variant="${c.variant}" tone="${c.tone}" size="${c.size}">Aktion</fm-butono>`,
      )
      .join(" ");
    await serve(page, out, body);
    await page.evaluate(
      (value) => document.documentElement.setAttribute("data-fm-aspekto", value),
      aspekto,
    );
    let checked = 0;
    for (const [i, c] of combos.entries()) {
      for (const state of ["rest", "hover", "pressed", "disabled", "loading"]) {
        const host = page.locator(`#b${i}`);
        await host.evaluate((element, s) => {
          element.toggleAttribute("disabled", s === "disabled");
          element.toggleAttribute("loading", s === "loading");
        }, state);
        if (state === "hover" || state === "pressed") await host.hover();
        else await page.mouse.move(0, 0);
        if (state === "pressed") await page.mouse.down();
        const actual = await host.evaluate((element) => {
          const control = element.shadowRoot?.querySelector('[part="control"]');
          if (control === null || control === undefined) return null;
          const style = getComputedStyle(control);
          return {
            fill: style.backgroundColor,
            color: style.color,
            border: style.borderInlineStartColor,
            height: style.minBlockSize,
            padding: style.paddingInlineStart,
          };
        });
        if (state === "pressed") await page.mouse.up();
        const combination = { ...c, state };
        const token = (part: string, property: string) => {
          const bound = boundToken(skemo, part, property, combination);
          const value = bound === undefined ? undefined : rezolvo.tokens[bound.token]?.value;
          if (value === undefined)
            throw new Error(`${part}.${property} unbound in ${JSON.stringify(combination)}`);
          return value;
        };
        const px = (value: unknown) => `${(value as { value: number }).value}px`;
        expect(actual, `${aspekto} ${JSON.stringify(combination)}`).toEqual({
          fill: rgb(token("surface", "fill")),
          color: rgb(token("label", "color")),
          border: rgb(token("border", "color")),
          height: px(token("box", "height")),
          padding: px(token("box", "inline-padding")),
        });
        checked++;
      }
    }
    expect(checked).toBe(4 * 3 * 5);
  });
}

test("every size is at least size.target.min wide and high in every density and viewport, also icon-only (WCAG 2.5.8)", async ({
  page,
}) => {
  await serve(
    page,
    out,
    ["small", "medium", "large"]
      .map(
        (size) =>
          `<fm-butono size="${size}" label="x"><svg slot="icon-start" aria-hidden="true" width="1" height="1"></svg></fm-butono>`,
      )
      .join(""),
  );
  for (const density of ["compact", "default", "comfortable"]) {
    for (const viewport of ["compact", "medium", "expanded"]) {
      await page.evaluate(
        ([d, v]) => {
          document.documentElement.setAttribute("data-fm-density", d ?? "");
          document.documentElement.setAttribute("data-fm-viewport", v ?? "");
        },
        [density, viewport],
      );
      const boxes = await page
        .locator("fm-butono")
        .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect()));
      for (const box of boxes) {
        expect(box.width, `${density} ${viewport}`).toBeGreaterThanOrEqual(24);
        expect(box.height, `${density} ${viewport}`).toBeGreaterThanOrEqual(24);
      }
    }
  }
});
