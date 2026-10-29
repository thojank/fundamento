// fm-kampo of Spec 025 ① in the browser (G4, G5, plan ① D-05, D-06): a number with stepper shows
// two composed butono (the ikono subtract and add, named Verringern and Erhöhen) that step the
// value by step within min and max, as ArrowUp and ArrowDown do; a search shows a clear butono
// ("{label} leeren" since Spec 029 ②b-1 M-6) while there is a value, Escape clears it; time is the platform's own time input
// with its bounds. Nothing of the kampo of 0.2.0 changes: the parts of a text field stay as they
// were (Arkitekturo contract). Chromium, Firefox and WebKit.

import { expect, type Page, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const kampo = input.modelo.eroj.find((entry) => entry.ero.name === "kampo");
if (kampo === undefined) throw new Error("kampo missing");
const texts = kampo.skemo.a11y.texts ?? {};
const word = (key: string, lingvo = "de") => texts[key]?.[lingvo] ?? "";

const field = (attributes: string, slots = "") =>
  `<form id="f"><fm-kampo id="a" name="n" ${attributes}>Menge${slots}</fm-kampo></form>`;

const visibleParts = (page: Page) =>
  page
    .locator("#a")
    .evaluate((element) =>
      [...(element.shadowRoot?.querySelectorAll("[part]") ?? [])]
        .filter((n) => !(n as HTMLElement).hidden)
        .map((n) => n.getAttribute("part")),
    );

test.describe("fm-kampo of Spec 025 ①: stepper, clear, time", () => {
  test("a text field shows no stepper and no clear button: the parts of 0.2.0 (Arkitekturo contract)", async ({
    page,
  }) => {
    await serve(page, out, field('kind="text" value="abc"'));
    expect(await visibleParts(page)).toEqual(["field", "label", "required-mark", "row", "control"]);
    await serve(page, out, field('kind="number" value="3"'));
    expect(await visibleParts(page)).toEqual(["field", "label", "required-mark", "row", "control"]);
  });

  test("number with stepper: two butono named by the Modelo with the ikono subtract and add step the value by step within min and max; input and change are said", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      field(
        'kind="number" stepper min="1" max="10" step="2" value="3"',
        '<span slot="help">Zwischen 1 und 10.</span>',
      ),
    );
    await page.evaluate(() => {
      const log: string[] = [];
      (window as unknown as { log: string[] }).log = log;
      const host = document.getElementById("a") as HTMLElement;
      host.addEventListener("input", () => log.push(`input:${host.getAttribute("value")}`));
      host.addEventListener("change", () => log.push(`change:${host.getAttribute("value")}`));
    });
    const decrement = page.getByRole("button", { name: word("decrement-name") });
    const increment = page.getByRole("button", { name: word("increment-name") });
    await expect(decrement).toBeVisible();
    await expect(increment).toBeVisible();
    const hosts = {
      decrement: page.locator("#a").locator('[part="decrement"]'),
      increment: page.locator("#a").locator('[part="increment"]'),
    };
    await expect(hosts.decrement.locator('fm-ikono[name="subtract"]')).toHaveCount(1);
    await expect(hosts.increment.locator('fm-ikono[name="add"]')).toHaveCount(1);
    await expect(hosts.decrement).toHaveAttribute("emphasis", "low");
    await increment.click();
    await expect(page.locator("#a")).toHaveAttribute("value", "5");
    await increment.click();
    await increment.click();
    await increment.click();
    // Clamped at max: 3 → 5 → 7 → 9 → 10.
    await expect(page.locator("#a")).toHaveAttribute("value", "10");
    await expect(hosts.increment).toHaveAttribute("aria-disabled", "true");
    await decrement.click();
    await expect(page.locator("#a")).toHaveAttribute("value", "8");
    const box = page.getByRole("textbox", { name: "Menge" });
    await expect(box).toHaveValue("8");
    expect(
      await page.evaluate(() =>
        new FormData(document.getElementById("f") as HTMLFormElement).get("n"),
      ),
    ).toBe("8");
    const log = await page.evaluate(() => (window as unknown as { log: string[] }).log);
    expect(log).toEqual([
      "input:5",
      "change:5",
      "input:7",
      "change:7",
      "input:9",
      "change:9",
      "input:10",
      "change:10",
      "input:8",
      "change:8",
    ]);
  });

  test("the arrow keys step a number like the platform's own, with and without the stepper; the field stays a text input with a numeric keyboard (E8)", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      field(
        'kind="number" min="0" max="5" value="4"',
        '<span slot="help">Zwischen 0 und 5.</span>',
      ),
    );
    const box = page.getByRole("textbox", { name: "Menge" });
    await expect(box).toHaveAttribute("type", "text");
    await expect(box).toHaveAttribute("inputmode", "numeric");
    await box.focus();
    await page.keyboard.press("ArrowUp");
    await expect(page.locator("#a")).toHaveAttribute("value", "5");
    await page.keyboard.press("ArrowUp");
    await expect(page.locator("#a")).toHaveAttribute("value", "5");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("#a")).toHaveAttribute("value", "3");
    // A text field leaves the arrows to the caret.
    await serve(page, out, field('kind="text" value="abc"'));
    await page.getByRole("textbox", { name: "Menge" }).focus();
    await page.keyboard.press("ArrowUp");
    await expect(page.locator("#a")).toHaveAttribute("value", "abc");
  });

  test("a stepper on a kind that is no number is refused with the constraint's kialo and not shown", async ({
    page,
  }) => {
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning") warnings.push(message.text());
    });
    await serve(page, out, field('kind="text" stepper value="abc"'));
    await expect
      .poll(() => warnings.filter((text) => text.includes('stepper="true"')).length)
      .toBeGreaterThan(0);
    expect(await visibleParts(page)).toEqual(["field", "label", "required-mark", "row", "control"]);
  });

  // Spec 029 ②b-1 M-6: the clear button is named after the field's label („{label} leeren“), as
  // every field's; a search labelled „Suche“ is still cleared by „Suche leeren“.
  test("search: a clear butono named '<label> leeren' shows while there is a value, clears it and returns the focus; Escape clears too; the role is searchbox", async ({
    page,
  }) => {
    await serve(page, out, field('kind="search" value="Standard"'));
    const box = page.getByRole("searchbox", { name: "Menge" });
    await expect(box).toHaveValue("Standard");
    const clear = page.getByRole("button", {
      name: word("clear-name").replace("{label}", "Menge"),
    });
    await expect(clear).toBeVisible();
    await expect(page.locator("#a").locator('[part="clear"] fm-ikono[name="close"]')).toHaveCount(
      1,
    );
    await clear.click();
    await expect(box).toHaveValue("");
    await expect(page.locator("#a")).toHaveAttribute("value", "");
    await expect(box).toBeFocused();
    await expect(clear).toBeHidden();
    await box.fill("Norm");
    await expect(clear).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(box).toHaveValue("");
    await expect(clear).toBeHidden();
  });

  test("time: the platform's own time input with its bounds; a required empty time holds the form", async ({
    page,
  }) => {
    await serve(page, out, field('kind="time" min="08:00" max="18:00" value="09:30" required'));
    const box = page.locator("#a").locator("input");
    await expect(box).toHaveAttribute("type", "time");
    await expect(box).toHaveAttribute("min", "08:00");
    await expect(box).toHaveAttribute("max", "18:00");
    await expect(box).toHaveValue("09:30");
    expect(
      await page.evaluate(() =>
        new FormData(document.getElementById("f") as HTMLFormElement).get("n"),
      ),
    ).toBe("09:30");
    await serve(page, out, field('kind="time" required'));
    expect(
      await page
        .locator("#a")
        .evaluate((element) =>
          (element as unknown as { checkValidity(): boolean }).checkValidity(),
        ),
    ).toBe(false);
  });
});
