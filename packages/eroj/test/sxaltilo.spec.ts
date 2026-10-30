// fm-sxaltilo in the browser (Spec 010 ① G4, G7; plan D-08, D-09): a native button with role
// switch as the track, the knob in it, the label beside it — rendered from the same template as
// the butono, the ligilo and the kampo. Chromium, Firefox and WebKit (playwright.config.ts).

import { boundToken, combinationsOf } from "@fundamento/modelo";
import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const sxaltilo = input.modelo.eroj.find((entry) => entry.ero.name === "sxaltilo");
if (sxaltilo === undefined) throw new Error("sxaltilo missing");
const skemo = sxaltilo.skemo;

const toggle = (attributes = "", label = "Benachrichtigungen") =>
  `<fm-sxaltilo id="a" ${attributes}>${label}</fm-sxaltilo>`;

test.describe("fm-sxaltilo behaviour", () => {
  test("role switch named by its label, aria-checked from checked, the parts in order", async ({
    page,
  }) => {
    await serve(page, out, toggle());
    const control = page.getByRole("switch", { name: "Benachrichtigungen" });
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
    ).toEqual(["field", "control", "indicator", "label", "spinner", "message"]);
  });

  test("a click on the track or the label, Space and Enter switch it; checked is reflected, input and change are fired", async ({
    page,
  }) => {
    await serve(page, out, toggle());
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
    const control = page.getByRole("switch", { name: "Benachrichtigungen" });
    await control.click();
    await expect(page.locator("#a")).toHaveAttribute("checked", "");
    await expect(control).toHaveAttribute("aria-checked", "true");
    await page.locator("#a").locator('[part="label"]').click();
    await expect(page.locator("#a")).not.toHaveAttribute("checked");
    // delegatesFocus: focusing the element focuses the track.
    await page.evaluate(() => (document.querySelector("#a") as HTMLElement).focus());
    await page.keyboard.press("Space");
    await expect(control).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("Enter");
    await expect(control).toHaveAttribute("aria-checked", "false");
    expect(await page.evaluate(() => (window as unknown as { events: string[] }).events)).toEqual([
      "input:true",
      "change:true",
      "input:false",
      "change:false",
      "input:true",
      "change:true",
      "input:false",
      "change:false",
    ]);
  });

  test("disabled: not focusable, a click changes nothing", async ({ page }) => {
    await serve(page, out, toggle("disabled"));
    const control = page.getByRole("switch", { name: "Benachrichtigungen" });
    await expect(control).toBeDisabled();
    await page.locator("#a").locator('[part="label"]').click({ force: true });
    await expect(page.locator("#a")).not.toHaveAttribute("checked");
    await expect(control).toHaveAttribute("aria-checked", "false");
  });

  test("takes part in a form: its name with on while checked, nothing while not", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<form id="f"><fm-sxaltilo id="a" name="news" checked>Newsletter</fm-sxaltilo><fm-sxaltilo id="b" name="dark">Dark Mode</fm-sxaltilo></form>`,
    );
    const data = () =>
      page.evaluate(() => [
        ...new FormData(document.querySelector("#f") as HTMLFormElement).entries(),
      ]);
    expect(await data()).toEqual([["news", "on"]]);
    await page.getByRole("switch", { name: "Dark Mode" }).click();
    expect(await data()).toEqual([
      ["news", "on"],
      ["dark", "on"],
    ]);
  });

  test("the knob stands at the start unchecked and at the end checked, in both directions", async ({
    page,
  }) => {
    await serve(page, out, toggle());
    const offset = () =>
      page.locator("#a").evaluate((element) => {
        const track = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        const knob = element.shadowRoot?.querySelector('[part="indicator"]') as HTMLElement;
        const t = track.getBoundingClientRect();
        const k = knob.getBoundingClientRect();
        return { left: k.left - t.left, right: t.right - k.right };
      });
    const off = await offset();
    expect(off.left).toBeLessThan(off.right);
    await page.locator("#a").evaluate((element) => element.setAttribute("checked", ""));
    const on = await offset();
    expect(on.right).toBeLessThan(on.left);
    await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
    const rtl = await offset();
    expect(rtl.left).toBeLessThan(rtl.right);
  });

  test("styles come from the Skemo: track, border and knob by checked and state, sizes from role tokens", async ({
    page,
  }) => {
    const combos = combinationsOf(skemo, ["checked", "size"]);
    await serve(
      page,
      out,
      combos
        .map(
          (c, i) =>
            `<fm-sxaltilo id="s${i}" size="${c.size}"${c.checked === "true" ? " checked" : ""}>Einstellung ${i}</fm-sxaltilo>`,
        )
        .join(""),
    );
    for (const [i, combination] of combos.entries()) {
      const measured = await page.locator(`#s${i}`).evaluate((element) => {
        const track = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        const knob = element.shadowRoot?.querySelector('[part="indicator"]') as HTMLElement;
        const style = getComputedStyle(track);
        return {
          fill: style.backgroundColor,
          knob: getComputedStyle(knob).backgroundColor,
          knobSize: knob.getBoundingClientRect().height,
          trackWidth: track.getBoundingClientRect().width,
          trackHeight: track.getBoundingClientRect().height,
          border: Number.parseFloat(style.borderTopWidth),
        };
      });
      const token = (part: string, property: string) =>
        boundToken(skemo, part, property, { ...combination, state: "rest" })?.token ?? "";
      const value = (name: string) =>
        page.evaluate(
          (variable) =>
            getComputedStyle(document.documentElement).getPropertyValue(variable).trim(),
          `--fm-${name.replaceAll(".", "-")}`,
        );
      const px = async (name: string) => Number.parseFloat(await value(name));
      expect(measured.knobSize, `#s${i} knob`).toBe(await px(token("indicator", "size")));
      expect(measured.trackWidth, `#s${i} track width`).toBeGreaterThanOrEqual(
        await px(token("box", "width")),
      );
      // The track is the knob plus its border (D-05): no height of its own.
      expect(measured.trackHeight, `#s${i} track height`).toBeCloseTo(
        measured.knobSize + 2 * measured.border,
        1,
      );
      expect(measured.fill, `#s${i} fill`).not.toBe(measured.knob);
    }
  });
});
