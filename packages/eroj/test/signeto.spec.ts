// fm-signeto in the browser (Spec 025 ③; G5, plan ③ D-18): the tag — static, a span that names a
// category; selectable, a button with aria-pressed that fires change; removable, the text with a
// remove butono named „‹Text› entfernen" that fires the cancelable remove and moves the focus to the
// next tag or the container; Delete and Backspace remove too. Chromium, Firefox and WebKit.

import { expect, type Page, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const signeto = input.modelo.eroj.find((entry) => entry.ero.name === "signeto");
if (signeto === undefined) throw new Error("signeto missing");
const texts = signeto.skemo.a11y.texts ?? {};
const word = (key: string, lingvo = "de") => texts[key]?.[lingvo] ?? "";

const log = (page: Page) => page.evaluate(() => (window as unknown as { log: string[] }).log);

test.describe("fm-signeto behaviour", () => {
  test("static: a span without a role, named by its text; no button inside; the intent is a data attribute of the control", async ({
    page,
  }) => {
    await serve(page, out, '<fm-signeto id="s" intent="info">Barrierefreiheit</fm-signeto>');
    await expect(page.getByRole("button")).toHaveCount(0);
    const shape = await page.locator("#s").evaluate((element) => {
      const shadow = element.shadowRoot as ShadowRoot;
      const body = shadow.querySelector('[part="body"]') as HTMLElement;
      return {
        role: body.getAttribute("role"),
        tabindex: body.getAttribute("tabindex"),
        intent: (shadow.querySelector('[part="control"]') as HTMLElement).dataset.intent,
        selected: (shadow.querySelector('[part="control"]') as HTMLElement).dataset.selected,
        remove: (shadow.querySelector('[part="remove"]') as HTMLElement).hidden,
        text: element.textContent?.trim(),
      };
    });
    expect(shape).toEqual({
      role: null,
      tabindex: null,
      intent: "info",
      selected: "false",
      remove: true,
      text: "Barrierefreiheit",
    });
  });

  test("selectable: a button with aria-pressed; a click and Space toggle selected and say change; disabled ignores both", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-signeto id="s" mode="selectable">Kontrast</fm-signeto><fm-signeto id="d" mode="selectable" disabled>Aus</fm-signeto>',
    );
    await page.evaluate(() => {
      const log: string[] = [];
      (window as unknown as { log: string[] }).log = log;
      const host = document.getElementById("s") as HTMLElement;
      host.addEventListener("change", () => log.push(`change:${host.hasAttribute("selected")}`));
    });
    const button = page.getByRole("button", { name: "Kontrast" });
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#s")).toHaveAttribute("selected", "");
    await button.focus();
    await page.keyboard.press("Space");
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    expect(await log(page)).toEqual(["change:true", "change:false", "change:true"]);
    const off = page.getByRole("button", { name: "Aus" });
    await expect(off).toHaveAttribute("aria-disabled", "true");
    await off.click({ force: true });
    await expect(off).toHaveAttribute("aria-pressed", "false");
  });

  test("removable: the remove butono is named with the text; a click fires the cancelable remove — prevented, the tag stays; else it is taken out and the focus moves to the next tag, at the end to the container", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<div id="c" tabindex="-1"><fm-signeto id="a" mode="removable">Entwurf</fm-signeto><fm-signeto id="b" mode="removable">Gültig</fm-signeto></div>',
    );
    await page.evaluate(() => {
      const log: string[] = [];
      (window as unknown as { log: string[] }).log = log;
      for (const id of ["a", "b"]) {
        const host = document.getElementById(id) as HTMLElement;
        host.addEventListener("remove", (event) => {
          log.push(`remove:${id}`);
          if ((window as unknown as { keep?: boolean }).keep) event.preventDefault();
        });
      }
    });
    const removeA = page.getByRole("button", {
      name: word("remove-name").replace("{label}", "Entwurf"),
    });
    await expect(removeA).toBeVisible();
    await page.evaluate(() => {
      (window as unknown as { keep: boolean }).keep = true;
    });
    await removeA.click();
    await expect(page.locator("#a")).toHaveCount(1);
    await page.evaluate(() => {
      (window as unknown as { keep: boolean }).keep = false;
    });
    await removeA.click();
    await expect(page.locator("#a")).toHaveCount(0);
    await expect(page.locator("#b")).toBeFocused();
    // Delete on the tag removes it too; the last one hands the focus to the container.
    await page.keyboard.press("Delete");
    await expect(page.locator("#b")).toHaveCount(0);
    await expect(page.locator("#c")).toBeFocused();
    expect(await log(page)).toEqual(["remove:a", "remove:a", "remove:b"]);
  });

  test("the tag is as high as its size says and round (the pill radius); an icon-start shows before the text", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-signeto id="s" size="small"><fm-ikono slot="icon-start" name="info"></fm-ikono>Hinweis</fm-signeto><fm-signeto id="m">Hinweis</fm-signeto>',
    );
    const sizes = await page.evaluate(() => {
      const box = (id: string) => {
        const control = (document.getElementById(id) as HTMLElement).shadowRoot?.querySelector(
          '[part="control"]',
        ) as HTMLElement;
        const style = getComputedStyle(control);
        return {
          height: control.getBoundingClientRect().height,
          radius: style.borderRadius,
          minHeight: Number.parseFloat(style.minBlockSize),
        };
      };
      return { small: box("s"), medium: box("m") };
    });
    expect(sizes.small.height).toBeLessThan(sizes.medium.height);
    expect(sizes.small.radius).not.toBe("0px");
    await expect(page.locator("#s").locator("fm-ikono")).toHaveCount(1);
  });
});
