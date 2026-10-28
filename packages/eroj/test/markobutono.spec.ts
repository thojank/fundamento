// fm-markobutono in the browser (Spec 010 ② G4, G7; plan ② D-07, D-08): a native button with role
// checkbox as the box, the check mark in it, the label beside it with the mark of a required box,
// the error under the label — rendered from the same template as the switch. Chromium, Firefox and
// WebKit (playwright.config.ts).

import { boundToken, combinationsOf, eroTokenOf } from "@fundamento/modelo";
import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const markobutono = input.modelo.eroj.find((entry) => entry.ero.name === "markobutono");
if (markobutono === undefined) throw new Error("markobutono missing");
const skemo = markobutono.skemo;
const texts = skemo.a11y.texts?.required;
if (texts === undefined) throw new Error("the markobutono speaks required in de and en");

const box = (attributes = "", label = "Ich akzeptiere die AGB", inner = "") =>
  `<fm-markobutono id="a" ${attributes}>${label}${inner}</fm-markobutono>`;

test.describe("fm-markobutono behaviour", () => {
  test("role checkbox named by its label, aria-checked from checked, the parts in order", async ({
    page,
  }) => {
    await serve(page, out, box());
    const control = page.getByRole("checkbox", { name: "Ich akzeptiere die AGB" });
    await expect(control).toBeVisible();
    await expect(control).toHaveAttribute("aria-checked", "false");
    await expect(control).not.toBeChecked();
    await page.locator("#a").evaluate((element) => element.setAttribute("checked", ""));
    await expect(control).toHaveAttribute("aria-checked", "true");
    await expect(control).toBeChecked();
    expect(
      await page
        .locator("#a")
        .evaluate((element) =>
          [...(element.shadowRoot?.querySelectorAll("[part]") ?? [])].map((n) =>
            n.getAttribute("part"),
          ),
        ),
    ).toEqual(["field", "control", "indicator", "label", "required-mark", "error"]);
  });

  // Nachlese 4 N-7 (Spec 014 ② O-7): the check mark is the Ikonaro's check in the size of the
  // box, drawn by the Aspekto; no hand-drawn sign.
  test("the indicator holds an fm-ikono check that follows the size of the box, shown only checked", async ({
    page,
  }) => {
    await serve(page, out, box('size="small" checked'));
    const ikono = page.locator("#a").locator('[part="indicator"] fm-ikono');
    await expect(ikono).toHaveCount(1);
    await expect(ikono).toHaveAttribute("name", "check");
    await expect(ikono).toHaveAttribute("size", "small");
    await page.locator("#a").evaluate((element) => element.setAttribute("size", "large"));
    await expect(ikono).toHaveAttribute("size", "large");
    expect(await page.locator("#a").locator('[part="indicator"] svg').count()).toBe(0);
    const opacity = () =>
      page
        .locator("#a")
        .locator('[part="indicator"]')
        .evaluate((element) => getComputedStyle(element).opacity);
    expect(await opacity()).toBe("1");
    await page.locator("#a").evaluate((element) => element.removeAttribute("checked"));
    await expect.poll(opacity).toBe("0");
  });

  test("a click on the box or the label and Space tick it; Enter does not; checked is reflected, input and change are fired", async ({
    page,
  }) => {
    await serve(page, out, box());
    await page.evaluate(() => {
      const host = document.querySelector("#a");
      (window as unknown as { events: string[] }).events = [];
      for (const type of ["input", "change"]) {
        host?.addEventListener(type, (event) => {
          (window as unknown as { events: string[] }).events.push(
            `${event.type}:${(event.target as HTMLElement).hasAttribute("checked")}`,
          );
        });
      }
    });
    const control = page.getByRole("checkbox", { name: "Ich akzeptiere die AGB" });
    await control.click();
    await expect(page.locator("#a")).toHaveAttribute("checked", "");
    await expect(control).toHaveAttribute("aria-checked", "true");
    await page.locator("#a").locator('[part="label"]').click();
    await expect(page.locator("#a")).not.toHaveAttribute("checked");
    await page.evaluate(() => (document.querySelector("#a") as HTMLElement).focus());
    await page.keyboard.press("Space");
    await expect(control).toHaveAttribute("aria-checked", "true");
    // a11y.keys of the Skemo say Space only: Enter leaves the box as it is.
    await page.keyboard.press("Enter");
    await expect(control).toHaveAttribute("aria-checked", "true");
    expect(await page.evaluate(() => (window as unknown as { events: string[] }).events)).toEqual([
      "input:true",
      "change:true",
      "input:false",
      "change:false",
      "input:true",
      "change:true",
    ]);
  });

  test("required: aria-required, the mark shows, 'erforderlich' is heard, and the form is not valid until it is ticked", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<form id="f"><fm-markobutono id="a" name="agb" required>Ich akzeptiere die AGB</fm-markobutono></form>`,
    );
    const control = page.getByRole("checkbox", { name: "Ich akzeptiere die AGB" });
    await expect(control).toHaveAttribute("aria-required", "true");
    await expect(page.locator("#a").locator('[part="required-mark"]')).toBeVisible();
    await expect(control).toHaveAccessibleDescription(texts.de ?? "");
    const valid = () =>
      page.evaluate(() => (document.querySelector("#f") as HTMLFormElement).checkValidity());
    expect(await valid()).toBe(false);
    await control.click();
    expect(await valid()).toBe(true);
    await page.locator("#a").evaluate((element) => element.removeAttribute("required"));
    await expect(control).not.toHaveAttribute("aria-required");
    await expect(page.locator("#a").locator('[part="required-mark"]')).toBeHidden();
  });

  test("a filled error slot makes it invalid and describes it; without the slot the error stays hidden", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      box(
        "required",
        "Ich akzeptiere die AGB",
        '<span slot="error">Akzeptiere die AGB, um fortzufahren</span>',
      ),
    );
    const control = page.getByRole("checkbox", { name: "Ich akzeptiere die AGB" });
    await expect(control).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#a").locator('[part="error"]')).toBeVisible();
    await expect(control).toHaveAccessibleDescription(/Akzeptiere die AGB, um fortzufahren/);
    await page.locator("#a span[slot=error]").evaluate((element) => element.remove());
    await expect(control).not.toHaveAttribute("aria-invalid");
    await expect(page.locator("#a").locator('[part="error"]')).toBeHidden();
  });

  test("disabled: not focusable, a click changes nothing", async ({ page }) => {
    await serve(page, out, box("disabled"));
    const control = page.getByRole("checkbox", { name: "Ich akzeptiere die AGB" });
    await expect(control).toBeDisabled();
    await page.locator("#a").locator('[part="label"]').click({ force: true });
    await expect(page.locator("#a")).not.toHaveAttribute("checked");
    await expect(control).toHaveAttribute("aria-checked", "false");
  });

  test("takes part in a form: its name with on while ticked, nothing while not", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<form id="f"><fm-markobutono id="a" name="news" checked>Newsletter</fm-markobutono><fm-markobutono id="b" name="remember">Angemeldet bleiben</fm-markobutono></form>`,
    );
    const data = () =>
      page.evaluate(() => [
        ...new FormData(document.querySelector("#f") as HTMLFormElement).entries(),
      ]);
    expect(await data()).toEqual([["news", "on"]]);
    await page.getByRole("checkbox", { name: "Angemeldet bleiben" }).click();
    expect(await data()).toEqual([
      ["news", "on"],
      ["remember", "on"],
    ]);
  });

  test("styles come from the Skemo: box and mark by checked and state, sizes from role tokens", async ({
    page,
  }) => {
    const combos = combinationsOf(skemo, ["checked", "size"]);
    await serve(
      page,
      out,
      combos
        .map(
          (c, i) =>
            `<fm-markobutono id="s${i}" size="${c.size}"${c.checked === "true" ? " checked" : ""}>Option ${i}</fm-markobutono>`,
        )
        .join(""),
    );
    const value = (name: string) =>
      page.evaluate(
        (variable) => getComputedStyle(document.documentElement).getPropertyValue(variable).trim(),
        `--fm-${name.replaceAll(".", "-")}`,
      );
    for (const [i, combination] of combos.entries()) {
      const measured = await page.locator(`#s${i}`).evaluate((element) => {
        const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        const mark = element.shadowRoot?.querySelector('[part="indicator"]') as HTMLElement;
        const style = getComputedStyle(control);
        return {
          fill: style.backgroundColor,
          border: Number.parseFloat(style.borderTopWidth),
          markColor: getComputedStyle(mark).color,
          markOpacity: getComputedStyle(mark).opacity,
          markSize: mark.getBoundingClientRect().height,
          width: control.getBoundingClientRect().width,
          height: control.getBoundingClientRect().height,
        };
      });
      // Spec 029 ①b: a part reads its Ero-Token (komuna takes the check mark of the Fonto).
      const token = (part: string, property: string) =>
        eroTokenOf(markobutono, part, property, { ...combination, state: "rest" }) ??
        boundToken(skemo, part, property, { ...combination, state: "rest" })?.token ??
        "";
      const px = async (name: string) => Number.parseFloat(await value(name));
      expect(measured.markSize, `#s${i} mark`).toBe(await px(token("indicator", "size")));
      // The box is the mark plus its border (as the track of the switch, ① D-05): a square.
      expect(measured.height, `#s${i} height`).toBeCloseTo(
        measured.markSize + 2 * measured.border,
        1,
      );
      expect(measured.width, `#s${i} width`).toBeCloseTo(measured.height, 1);
      expect(measured.markOpacity, `#s${i} mark shown`).toBe(
        combination.checked === "true" ? "1" : "0",
      );
      if (combination.checked === "true") {
        expect(measured.fill, `#s${i} fill`).not.toBe(measured.markColor);
      }
    }
  });

  test("a long label breaks beside the box; the box stays at the first line", async ({ page }) => {
    await serve(
      page,
      out,
      `<div style="inline-size: 12rem">${box("", "Ich habe die Allgemeinen Geschäftsbedingungen gelesen und akzeptiere sie")}</div>`,
    );
    const measured = await page.locator("#a").evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      const label = element.shadowRoot?.querySelector('[part="label"]') as HTMLElement;
      const c = control.getBoundingClientRect();
      const l = label.getBoundingClientRect();
      return {
        controlTop: c.top,
        controlHeight: c.height,
        labelTop: l.top,
        labelHeight: l.height,
        hostWidth: element.getBoundingClientRect().width,
      };
    });
    expect(measured.labelHeight).toBeGreaterThan(2 * measured.controlHeight);
    expect(Math.abs(measured.controlTop - measured.labelTop)).toBeLessThan(measured.controlHeight);
    expect(measured.hostWidth).toBeLessThanOrEqual(12 * 16 + 1);
  });
});
