// fm-elekto in the browser (Spec 010 ③ G4, G7; plan ③ D-05, D-06): a group with role radiogroup
// named by its label, one row with role radio per option of the light DOM (a <data> element with
// its value in the slot options), the circle with the dot in it and the option's label beside it,
// help and error under the options. Arrow keys move and choose, Space chooses, Tab leaves the
// group; the chosen value is the form's, a required group without a choice keeps the form from
// being sent. Chromium, Firefox and WebKit (playwright.config.ts).

import { boundToken } from "@fundamento/modelo";
import { expect, type Page, test } from "@playwright/test";
import { TAB } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const elekto = input.modelo.eroj.find((entry) => entry.ero.name === "elekto");
if (elekto === undefined) throw new Error("elekto missing");
const skemo = elekto.skemo;
const texts = skemo.a11y.texts?.required;
if (texts === undefined) throw new Error("the elekto speaks required in de and en");

const OPTIONS =
  '<data slot="options" value="standard">Standard</data><data slot="options" value="express">Express</data><data slot="options" value="abholung">Abholung</data>';
const group = (attributes = "", inner = "") =>
  `<fm-elekto id="a" name="versand" ${attributes}>Versandart${OPTIONS}${inner}</fm-elekto><input id="after" aria-label="danach">`;
const chosen = (page: Page) =>
  page.locator("#a").evaluate((element) => element.getAttribute("value"));
const focused = (page: Page) =>
  page.evaluate(() => {
    const host = document.activeElement;
    if (host?.id !== "a") return host?.id ?? null;
    const row = host.shadowRoot?.activeElement;
    return row?.getAttribute("role") === "radio"
      ? `radio:${row.getAttribute("aria-checked")}`
      : null;
  });

test.describe("fm-elekto behaviour", () => {
  test("role radiogroup named by its label, a radio per option named by its text, the parts in order", async ({
    page,
  }) => {
    await serve(page, out, group('value="express"'));
    const radiogroup = page.getByRole("radiogroup", { name: "Versandart" });
    await expect(radiogroup).toBeVisible();
    await expect(radiogroup.getByRole("radio")).toHaveCount(3);
    await expect(page.getByRole("radio", { name: "Express" })).toBeChecked();
    await expect(page.getByRole("radio", { name: "Standard" })).not.toBeChecked();
    await expect(page.getByRole("radio", { name: "Express" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(
      await page
        .locator("#a")
        .evaluate((element) =>
          [...(element.shadowRoot?.querySelectorAll("[part]") ?? [])].map((n) =>
            n.getAttribute("part"),
          ),
        ),
    ).toEqual([
      "field",
      "label",
      "required-mark",
      "spinner",
      "options",
      ...["option", "control", "indicator", "option-label"],
      ...["option", "control", "indicator", "option-label"],
      ...["option", "control", "indicator", "option-label"],
      "help",
      "error",
    ]);
  });

  test("a click chooses an option: value reflected, input and change fired; a new option in the light DOM is a new row", async ({
    page,
  }) => {
    await serve(page, out, group());
    await page.evaluate(() => {
      const host = document.querySelector("#a");
      (window as unknown as { events: string[] }).events = [];
      for (const type of ["input", "change"]) {
        host?.addEventListener(type, (event) => {
          (window as unknown as { events: string[] }).events.push(
            `${event.type}:${(event.target as HTMLElement).getAttribute("value")}`,
          );
        });
      }
    });
    await page.getByRole("radio", { name: "Abholung" }).click();
    expect(await chosen(page)).toBe("abholung");
    await expect(page.getByRole("radio", { name: "Abholung" })).toBeChecked();
    expect(await page.evaluate(() => (window as unknown as { events: string[] }).events)).toEqual([
      "input:abholung",
      "change:abholung",
    ]);
    await page.locator("#a").evaluate((element) => {
      const option = document.createElement("data");
      option.slot = "options";
      option.value = "post";
      option.textContent = "Post";
      element.append(option);
    });
    await expect(page.getByRole("radio")).toHaveCount(4);
    await page.getByRole("radio", { name: "Post" }).click();
    expect(await chosen(page)).toBe("post");
  });

  test("the arrow keys move and choose, wrapping around; Space chooses; Tab enters at the chosen option and leaves the group", async ({
    page,
    browserName,
  }) => {
    await serve(page, out, group('value="express"'));
    await page.evaluate(() => (document.querySelector("#a") as HTMLElement).focus());
    expect(await focused(page)).toBe("radio:true");
    await page.keyboard.press("ArrowDown");
    expect(await chosen(page)).toBe("abholung");
    await page.keyboard.press("ArrowRight");
    expect(await chosen(page)).toBe("standard");
    await page.keyboard.press("ArrowUp");
    expect(await chosen(page)).toBe("abholung");
    await page.keyboard.press("ArrowLeft");
    expect(await chosen(page)).toBe("express");
    await expect(page.getByRole("radio", { name: "Express" })).toBeChecked();
    // One tab stop: Tab leaves the group, Shift+Tab comes back to the chosen option.
    await page.keyboard.press(TAB(browserName));
    expect(await focused(page)).toBe("after");
    await page.keyboard.press(`Shift+${TAB(browserName)}`);
    expect(await focused(page)).toBe("radio:true");
    // Without a choice the first option takes the focus, and Space chooses it.
    await page.locator("#a").evaluate((element) => element.removeAttribute("value"));
    await page.evaluate(() => (document.querySelector("#a") as HTMLElement).focus());
    expect(await focused(page)).toBe("radio:false");
    await page.keyboard.press("Space");
    expect(await chosen(page)).toBe("standard");
  });

  test("required: aria-required on the group, the mark shows, 'erforderlich' is heard, the form is not valid until an option is chosen", async ({
    page,
  }) => {
    await serve(page, out, `<form id="f">${group("required")}</form>`);
    const radiogroup = page.getByRole("radiogroup", { name: "Versandart" });
    await expect(radiogroup).toHaveAttribute("aria-required", "true");
    await expect(page.locator("#a").locator('[part="required-mark"]')).toBeVisible();
    await expect(radiogroup).toHaveAccessibleDescription(texts.de ?? "");
    const valid = () =>
      page.evaluate(() => (document.querySelector("#f") as HTMLFormElement).checkValidity());
    expect(await valid()).toBe(false);
    await page.getByRole("radio", { name: "Standard" }).click();
    expect(await valid()).toBe(true);
  });

  test("help and a filled error slot describe the group; the error makes it invalid", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      group(
        "required",
        '<span slot="help">Wir liefern in zwei Tagen.</span><span slot="error">Wähle eine Versandart, um fortzufahren</span>',
      ),
    );
    const radiogroup = page.getByRole("radiogroup", { name: "Versandart" });
    await expect(radiogroup).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#a").locator('[part="error"]')).toBeVisible();
    await expect(radiogroup).toHaveAccessibleDescription(/Wir liefern in zwei Tagen\./);
    await expect(radiogroup).toHaveAccessibleDescription(/Wähle eine Versandart, um fortzufahren/);
    await page.locator("#a span[slot=error]").evaluate((element) => element.remove());
    await expect(radiogroup).not.toHaveAttribute("aria-invalid");
    await expect(page.locator("#a").locator('[part="error"]')).toBeHidden();
  });

  test("disabled: no option takes the focus, a click chooses nothing", async ({ page }) => {
    await serve(page, out, group("disabled"));
    const radiogroup = page.getByRole("radiogroup", { name: "Versandart" });
    await expect(radiogroup).toHaveAttribute("aria-disabled", "true");
    await expect(page.getByRole("radio", { name: "Express" })).toBeDisabled();
    await page.getByRole("radio", { name: "Express" }).click({ force: true });
    expect(await chosen(page)).toBeNull();
    const tabbable = await page
      .locator("#a")
      .evaluate((element) =>
        [...(element.shadowRoot?.querySelectorAll('[role="radio"]') ?? [])].map(
          (row) => (row as HTMLElement).tabIndex,
        ),
      );
    expect(tabbable).toEqual([-1, -1, -1]);
  });

  test("takes part in a form: its name with the chosen value, nothing without a choice", async ({
    page,
  }) => {
    await serve(page, out, `<form id="f">${group()}</form>`);
    const data = () =>
      page.evaluate(() => [
        ...new FormData(document.querySelector("#f") as HTMLFormElement).entries(),
      ]);
    expect(await data()).toEqual([]);
    await page.getByRole("radio", { name: "Express" }).click();
    expect(await data()).toEqual([["versand", "express"]]);
  });

  test("horizontal: the options stand in one row and never break; vertical: one below the other", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div style="inline-size: 8rem">${group('orientation="horizontal"')}</div>`,
    );
    await expect(page.getByRole("radiogroup", { name: "Versandart" })).toHaveAttribute(
      "aria-orientation",
      "horizontal",
    );
    const tops = () =>
      page
        .locator("#a")
        .evaluate((element) =>
          [...(element.shadowRoot?.querySelectorAll('[part="option"]') ?? [])].map((row) =>
            Math.round(row.getBoundingClientRect().top),
          ),
        );
    const row = await tops();
    expect(new Set(row).size).toBe(1);
    await page.locator("#a").evaluate((element) => element.setAttribute("orientation", "vertical"));
    const column = await tops();
    expect(column[0]).toBeLessThan(column[1] ?? 0);
    expect(column[1]).toBeLessThan(column[2] ?? 0);
  });
});

test.describe("fm-elekto measures (G3, D-05)", () => {
  test("the circle is the dot's box plus its border, round; the dot shows on the chosen option only", async ({
    page,
  }) => {
    const sizes = ["small", "medium", "large"] as const;
    await serve(
      page,
      out,
      sizes
        .map(
          (size) =>
            `<fm-elekto id="${size}" size="${size}" value="express">Versandart${OPTIONS}</fm-elekto>`,
        )
        .join(""),
    );
    for (const size of sizes) {
      const token = boundToken(skemo, "indicator", "size", { size })?.token ?? "";
      const measured = await page.locator(`#${size}`).evaluate(
        (element, variable) => {
          const rows = [...(element.shadowRoot?.querySelectorAll('[part="option"]') ?? [])];
          const control = rows[1]?.querySelector('[part="control"]') as HTMLElement;
          const dot = rows[1]?.querySelector('[part="indicator"]') as HTMLElement;
          const other = rows[0]?.querySelector('[part="indicator"]') as HTMLElement;
          const box = control.getBoundingClientRect();
          const style = getComputedStyle(control);
          const probe = document.createElement("div");
          probe.style.inlineSize = `var(${variable})`;
          document.body.append(probe);
          const expected = probe.getBoundingClientRect().width;
          probe.remove();
          return {
            width: box.width,
            height: box.height,
            border: Number.parseFloat(style.borderTopWidth),
            radius: Number.parseFloat(style.borderTopLeftRadius),
            dot: dot.getBoundingClientRect().width,
            expected,
            shown: getComputedStyle(dot).opacity,
            hidden: getComputedStyle(other).opacity,
          };
        },
        `--fm-${token.replaceAll(".", "-")}`,
      );
      expect(measured.dot, size).toBeCloseTo(measured.expected, 1);
      expect(measured.height, size).toBeCloseTo(measured.expected + 2 * measured.border, 1);
      expect(measured.width, size).toBeCloseTo(measured.height, 1);
      expect(measured.radius, size).toBeGreaterThanOrEqual(measured.height / 2);
      expect(measured.shown, size).toBe("1");
      expect(measured.hidden, size).toBe("0");
    }
  });
});
