// fm-plenstato in the browser (Spec 011 ③; G4, G7, plan ③ D-10): the loading and empty state —
// a status region, busy while loading with an indicator that turns with the motion roles (and
// stands still under reduced motion), the dashed surface with the text and the actions when
// empty; an action while loading is a contradiction the element warns about. Chromium, Firefox
// and WebKit.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const plenstato = input.modelo.eroj.find((entry) => entry.ero.name === "plenstato");
if (plenstato === undefined) throw new Error("plenstato missing");
const texts = plenstato.skemo.a11y.texts;
if (texts === undefined) throw new Error("the plenstato says 'lädt'");

test.describe("fm-plenstato behaviour", () => {
  test("loading: role status, aria-busy, 'lädt' heard before the text, the indicator shown, no border", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-plenstato id="a" kind="loading">Standards werden geladen</fm-plenstato>`,
    );
    const region = page.getByRole("status");
    await expect(region).toBeVisible();
    await expect(region).toHaveAttribute("aria-busy", "true");
    await expect(region).toHaveText(/^lädt/);
    await expect(page.locator("#a")).toHaveText(/Standards werden geladen/);
    const inner = await page.locator("#a").evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      const indicator = element.shadowRoot?.querySelector('[part="indicator"]') as HTMLElement;
      return {
        indicator: getComputedStyle(indicator).display,
        borderStyle: getComputedStyle(control).borderTopStyle,
        word: element.shadowRoot?.getElementById("fm-texts")?.textContent,
      };
    });
    expect(inner.indicator).not.toBe("none");
    expect(inner.borderStyle).toBe("none");
    expect(inner.word).toBe(texts["kind-loading"]?.de);
  });

  test("empty: not busy, no word, the indicator gone, a dashed border, the actions shown", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-plenstato id="a" kind="empty">Noch keine Standards. Lege den ersten an.<fm-butono slot="actions" emphasis="high">Standard anlegen</fm-butono></fm-plenstato>`,
    );
    const region = page.getByRole("status");
    await expect(region).toHaveAttribute("aria-busy", "false");
    await expect(region).toHaveText(/^\s*$/);
    await expect(page.locator("#a")).toHaveText(/^\s*Noch keine Standards/);
    const inner = await page.locator("#a").evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      const indicator = element.shadowRoot?.querySelector('[part="indicator"]') as HTMLElement;
      const actions = element.shadowRoot?.querySelector('[part="actions"]') as HTMLElement;
      return {
        indicator: getComputedStyle(indicator).display,
        borderStyle: getComputedStyle(control).borderTopStyle,
        actions: getComputedStyle(actions).display,
        word: element.shadowRoot?.getElementById("fm-texts")?.textContent,
      };
    });
    expect(inner.indicator).toBe("none");
    expect(inner.borderStyle).toBe("dashed");
    expect(inner.actions).not.toBe("none");
    expect(inner.word).toBe("");
    await expect(page.getByRole("button", { name: "Standard anlegen" })).toBeVisible();
  });

  test("the indicator turns with the motion roles; under reduced motion it stands still", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-plenstato id="a" kind="loading">Standards werden geladen</fm-plenstato>`,
      "",
    );
    const animations = () =>
      page.locator("#a").evaluate((element) => {
        const indicator = element.shadowRoot?.querySelector('[part="indicator"]') as HTMLElement;
        return indicator.getAnimations().map((animation) => ({
          state: animation.playState,
          duration: Number(animation.effect?.getComputedTiming().duration ?? 0),
          iterations: animation.effect?.getComputedTiming().iterations,
        }));
      });
    // The test page is served with data-fm-motion="reduced": the duration role is instant.
    expect(await animations()).toEqual([]);
    await page.evaluate(() => document.documentElement.setAttribute("data-fm-motion", "default"));
    await page.locator("#a").evaluate((element) => element.setAttribute("kind", "loading"));
    const running = await animations();
    expect(running).toHaveLength(1);
    expect(running[0]?.state).toBe("running");
    expect(running[0]?.duration).toBeGreaterThan(0);
    expect(running[0]?.iterations).toBe(Number.POSITIVE_INFINITY);
    await page.locator("#a").evaluate((element) => element.setAttribute("kind", "empty"));
    expect(await animations()).toEqual([]);
  });

  test("kind is a duty: without it the element warns and shows loading; an action while loading warns too", async ({
    page,
  }) => {
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning") warnings.push(message.text());
    });
    await serve(
      page,
      out,
      `<fm-plenstato id="a">Standards werden geladen<fm-butono slot="actions">Anlegen</fm-butono></fm-plenstato>`,
    );
    await expect(page.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(warnings.some((text) => text.includes("kind"))).toBe(true);
    expect(warnings.some((text) => text.includes("slot:actions"))).toBe(true);
  });

  test("the host takes the width of its container and centres its text", async ({ page }) => {
    await serve(
      page,
      out,
      `<div id="w" style="inline-size: 20rem"><fm-plenstato id="a" kind="empty">Noch keine Standards</fm-plenstato></div>`,
    );
    const outer = await page.locator("#w").boundingBox();
    const control = await page.locator("#a").evaluate((element) => {
      const node = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      return { width: node.getBoundingClientRect().width, align: getComputedStyle(node).textAlign };
    });
    expect(Math.round(control.width)).toBe(Math.round(outer?.width ?? 0));
    expect(control.align).toBe("center");
  });
});
