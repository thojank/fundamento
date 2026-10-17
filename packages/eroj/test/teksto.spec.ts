// fm-teksto in the browser (Spec 014 ③; G5, plan ③ D-04): running text in the role of its kind and
// size (body 1 or 2, caption, kicker, code) and the colour of its emphasis (high, medium, low);
// body, caption and kicker are blocks that wrap, code is inline and spoken as code; a caption of
// size 2 falls back to size 1 (constraint of the Skemo). Chromium, Firefox and WebKit.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const textOf = (page: Parameters<typeof serve>[0], id: string) =>
  page.locator(`#${id}`).evaluate((element) => {
    const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
    const style = getComputedStyle(control);
    return {
      role: control.getAttribute("role"),
      size: control.getAttribute("data-size"),
      display: style.display,
      fontSize: style.fontSize,
      family: style.fontFamily,
      colour: style.color,
      transform: style.textTransform,
    };
  });

const rgbOf = (page: Parameters<typeof serve>[0], property: string) =>
  page.evaluate((name) => {
    const probe = document.createElement("span");
    probe.style.color = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    document.body.append(probe);
    const colour = getComputedStyle(probe).color;
    probe.remove();
    return colour;
  }, property);

test.describe("fm-teksto behaviour", () => {
  test("body, caption and kicker are blocks in their roles; code is inline, in the code family, spoken as code", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-teksto id="b">Ein Absatz.</fm-teksto><fm-teksto id="b2" size="2">Kleiner.</fm-teksto><fm-teksto id="c" kind="caption">Abbildung 1</fm-teksto><fm-teksto id="k" kind="kicker">Kategorie</fm-teksto><p>Ruf <fm-teksto id="code" kind="code">fm build</fm-teksto> auf.</p>`,
    );
    const tokens = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const size = (role: string) => root.getPropertyValue(`--fm-typography-${role}-font-size`).trim();
      return {
        body1: size("body-1"),
        body2: size("body-2"),
        caption: size("caption"),
        kicker: size("kicker"),
        codeFamily: root.getPropertyValue("--fm-typography-code-font-family").trim(),
        kickerTransform: root.getPropertyValue("--fm-typography-kicker-text-transform").trim(),
      };
    });
    const body = await textOf(page, "b");
    expect(body.display).toBe("block");
    expect(body.fontSize).toBe(tokens.body1);
    expect(body.role).toBeNull();
    expect((await textOf(page, "b2")).fontSize).toBe(tokens.body2);
    expect((await textOf(page, "c")).fontSize).toBe(tokens.caption);
    const kicker = await textOf(page, "k");
    expect(kicker.fontSize).toBe(tokens.kicker);
    expect(kicker.transform).toBe(tokens.kickerTransform);
    const code = await textOf(page, "code");
    expect(code.display).toBe("inline");
    expect(code.role).toBe("code");
    expect(code.family.replaceAll('"', "")).toBe(tokens.codeFamily.replaceAll('"', ""));
    await expect(page.getByRole("code", { name: "fm build" })).toHaveCount(1);
  });

  test("the colour follows the emphasis: default, subtle, muted", async ({ page }) => {
    await serve(
      page,
      out,
      `<fm-teksto id="h">Hoch</fm-teksto><fm-teksto id="m" emphasis="medium">Mittel</fm-teksto><fm-teksto id="l" emphasis="low">Niedrig</fm-teksto>`,
    );
    expect((await textOf(page, "h")).colour).toBe(await rgbOf(page, "--fm-color-text-default"));
    expect((await textOf(page, "m")).colour).toBe(await rgbOf(page, "--fm-color-text-subtle"));
    expect((await textOf(page, "l")).colour).toBe(await rgbOf(page, "--fm-color-text-muted"));
  });

  test("a caption of size 2 falls back to size 1 with a warning (constraint of the Skemo); body wraps in a narrow container", async ({
    page,
  }) => {
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning") warnings.push(message.text());
    });
    await serve(
      page,
      out,
      `<fm-teksto id="c" kind="caption" size="2">Abbildung 2</fm-teksto><div style="inline-size: 12rem"><fm-teksto id="w">Ein längerer Absatz, der in einem schmalen Container über mehrere Zeilen läuft.</fm-teksto></div>`,
    );
    expect((await textOf(page, "c")).size).toBe("1");
    await expect.poll(() => warnings.some((text) => text.includes("fm-teksto"))).toBe(true);
    const lines = await page.locator("#w").evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      return control.getBoundingClientRect().height / Number.parseFloat(getComputedStyle(control).lineHeight);
    });
    expect(lines).toBeGreaterThan(1);
  });
});
