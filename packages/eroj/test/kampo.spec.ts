// fm-kampo in the browser (Spec 009 T013; A5, A6, plan D-08): the first composite Ero — label,
// native input, help and error — rendered from the same template as the butono and the ligilo.
// Chromium, Firefox and WebKit (playwright.config.ts).

import { boundToken, combinationsOf, eroTokenOf } from "@fundamento/modelo";
import { expect, test } from "@playwright/test";
import { TAB } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const kampo = input.modelo.eroj.find((entry) => entry.ero.name === "kampo");
if (kampo === undefined) throw new Error("kampo missing");
const skemo = kampo.skemo;
const texts = skemo.a11y.texts?.required;
if (texts === undefined) throw new Error("the kampo speaks required in de and en");

const field = (attributes: string, slots = "") =>
  `<fm-kampo id="a" ${attributes}>E-Mail${slots}</fm-kampo>`;

test.describe("fm-kampo behaviour", () => {
  test("role textbox named by its label, described by help then error, kind as the input type", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      field(
        'kind="email" name="mail"',
        `<span slot="help">Wir schreiben nur zur Bestellung.</span><span slot="error">Gib eine Adresse mit @ ein</span>`,
      ),
    );
    const box = page.getByRole("textbox", { name: "E-Mail" });
    await expect(box).toBeVisible();
    // Nachlese 5 O-14: an address is a text input with the keyboard of its kind; the element
    // checks its form itself, so the platform has no message to show as a bubble.
    await expect(box).toHaveAttribute("type", "text");
    await expect(box).toHaveAttribute("inputmode", "email");
    await expect(box).toHaveAttribute("name", "mail");
    await expect(box).toHaveAccessibleDescription(
      "Wir schreiben nur zur Bestellung. Gib eine Adresse mit @ ein",
    );
    // A filled error slot makes the field invalid (constraint of the Skemo, D-04).
    await expect(box).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#a").locator('[part="error"]')).toHaveAttribute(
      "aria-live",
      "polite",
    );
    // Help and error are parts of their own; the control is the input.
    expect(
      await page
        .locator("#a")
        .evaluate((element) =>
          [...(element.shadowRoot?.querySelectorAll("[part]") ?? [])].map((n) =>
            n.getAttribute("part"),
          ),
        ),
      // Spec 025 ① (plan ① D-05): the input stands in a row that takes the step buttons and the
      // clear button when the kind asks for them; a text field has none.
      // Abnahme #122: the spinner at the end of the row, over the input.
      // Spec 029 ②b-1b M-2: the status icon in the row after the input, the message after the error.
    ).toEqual([
      "field",
      "label",
      "required-mark",
      "row",
      "control",
      "status-icon",
      "end",
      "spinner",
      "help",
      "error",
      "message",
    ]);
  });

  test("required: aria-required, the mark shows, and 'erforderlich' is heard in the document's language", async ({
    page,
  }) => {
    await serve(page, out, field("required"));
    const box = page.getByRole("textbox", { name: "E-Mail" });
    await expect(box).toHaveAttribute("aria-required", "true");
    await expect(box).toHaveAccessibleDescription(texts.de);
    await expect(page.locator("#a").locator('[part="required-mark"]')).toBeVisible();
    await page.evaluate(() => document.documentElement.setAttribute("lang", "en"));
    await page.locator("#a").evaluate((e) => e.setAttribute("size", "medium"));
    await expect(box).toHaveAccessibleDescription(texts.en);
    await page.locator("#a").evaluate((e) => e.removeAttribute("required"));
    await expect(box).not.toHaveAttribute("aria-required");
    await expect(page.locator("#a").locator('[part="required-mark"]')).toBeHidden();
  });

  // Nachbesserung F-8 (Abnahme 16.10.): an empty required field a person has not touched shows no
  // error — no aria-invalid, the border of rest — as elektilo, elekto and markobutono do; the form
  // still does not send. Once the form was sent (the platform says invalid) or the person typed,
  // the field says it.
  test("an empty, untouched required field shows no error until the form is sent", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<form id="f">${field('required name="a"')}<fm-kampo id="b" name="b">Name</fm-kampo><button id="s" type="submit">Senden</button></form>`,
    );
    const box = page.getByRole("textbox", { name: "E-Mail" });
    await expect(box).not.toHaveAttribute("aria-invalid");
    const borders = () =>
      page.evaluate(() =>
        ["a", "b"].map(
          (id) =>
            getComputedStyle(
              document.getElementById(id)?.shadowRoot?.querySelector('[part="control"]') as Element,
            ).borderColor,
        ),
      );
    const before = await borders();
    expect(before[0]).toBe(before[1]);
    const sent = await page.evaluate(() => {
      let submitted = false;
      const form = document.getElementById("f") as HTMLFormElement;
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        submitted = true;
      });
      form.requestSubmit();
      return submitted;
    });
    expect(sent).toBe(false);
    await expect(box).toHaveAttribute("aria-invalid", "true");
    const after = await borders();
    expect(after[0]).not.toBe(after[1]);
    // Typing takes the error away; a reset of the form takes the report away.
    await box.fill("a@b.example");
    await expect(box).not.toHaveAttribute("aria-invalid");
  });

  test("help and error stay hidden without text; the description follows", async ({ page }) => {
    await serve(page, out, field('kind="text"'));
    const box = page.getByRole("textbox", { name: "E-Mail" });
    await expect(page.locator("#a").locator('[part="help"]')).toBeHidden();
    await expect(page.locator("#a").locator('[part="error"]')).toBeHidden();
    await expect(box).not.toHaveAttribute("aria-describedby");
    await expect(box).not.toHaveAttribute("aria-invalid");
  });

  test("Tab reaches it, typing sets the value and the form value; disabled is skipped, readonly stays focusable", async ({
    page,
    browserName,
  }) => {
    await serve(
      page,
      out,
      `<form id="f"><fm-kampo id="a" name="a">Eins</fm-kampo><fm-kampo id="b" name="b" disabled>Zwei</fm-kampo><fm-kampo id="c" name="c" readonly value="fest">Drei</fm-kampo></form>`,
    );
    await page.keyboard.press(TAB(browserName));
    await expect(page.locator("#a")).toBeFocused();
    await page.keyboard.type("max@beispiel.example");
    await expect(page.locator("#a")).toHaveAttribute("value", "max@beispiel.example");
    const formValue = await page.evaluate(() => {
      const form = document.getElementById("f") as HTMLFormElement;
      return new FormData(form).get("a");
    });
    expect(formValue).toBe("max@beispiel.example");
    await page.keyboard.press(TAB(browserName));
    await expect(page.locator("#c")).toBeFocused();
    await expect(page.getByRole("textbox", { name: "Drei" })).toHaveAttribute("readonly", "");
    await expect(page.getByRole("textbox", { name: "Zwei" })).toBeDisabled();
  });

  test("disabled wins over readonly (constraint of the Skemo)", async ({ page }) => {
    await serve(page, out, field("disabled readonly"));
    const box = page.locator("#a").locator('[part="control"]');
    await expect(box).toBeDisabled();
    await expect(box).not.toHaveAttribute("readonly");
  });

  test("the host takes the width of its container (E3)", async ({ page }) => {
    await serve(page, out, `<div id="w" style="inline-size: 20rem">${field("")}</div>`);
    const outer = await page.locator("#w").boundingBox();
    const control = await page.locator("#a").locator('[part="control"]').boundingBox();
    expect(Math.round(control?.width ?? 0)).toBe(Math.round(outer?.width ?? 0));
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
  test(`${aspekto}: computed styles of every size × state equal the bound tokens (AK-03, S5)`, async ({
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
    const sizes = combinationsOf(skemo, ["size"]);
    const body = sizes
      .map((c, i) => `<fm-kampo id="k${i}" size="${c.size}">Feld ${i}</fm-kampo>`)
      .join(" ");
    await serve(page, out, body);
    await page.evaluate(
      (value) => document.documentElement.setAttribute("data-fm-aspekto", value),
      aspekto,
    );
    let checked = 0;
    for (const [i, c] of sizes.entries()) {
      for (const state of ["rest", "hover", "disabled", "readonly", "invalid"]) {
        const host = page.locator(`#k${i}`);
        await host.evaluate((element, s) => {
          element.toggleAttribute("disabled", s === "disabled");
          element.toggleAttribute("readonly", s === "readonly");
          element.toggleAttribute("invalid", s === "invalid");
        }, state);
        if (state === "hover") await host.locator('[part="control"]').hover();
        else await page.mouse.move(0, 0);
        const actual = await host.evaluate((element) => {
          const control = element.shadowRoot?.querySelector('[part="control"]');
          const label = element.shadowRoot?.querySelector('[part="label"]');
          if (!(control instanceof Element) || !(label instanceof Element)) return null;
          const style = getComputedStyle(control);
          return {
            fill: style.backgroundColor,
            border: style.borderInlineStartColor,
            text: style.color,
            label: getComputedStyle(label).color,
            height: style.minBlockSize,
            padding: style.paddingInlineStart,
          };
        });
        const combination = { ...c, state };
        const token = (part: string, property: string) => {
          // Spec 029 ①b: the part reads its Ero-Token; komuna sets its own values there.
          const bound =
            eroTokenOf(kampo, part, property, combination) ??
            boundToken(skemo, part, property, combination)?.token;
          const value = bound === undefined ? undefined : rezolvo.tokens[bound]?.value;
          if (value === undefined)
            throw new Error(`${part}.${property} unbound in ${JSON.stringify(combination)}`);
          return value;
        };
        const px = (value: unknown) => `${(value as { value: number }).value}px`;
        expect(actual, `${aspekto} ${JSON.stringify(combination)}`).toEqual({
          fill: rgb(token("surface", "fill")),
          border: rgb(token("border", "color")),
          text: rgb(token("text", "color")),
          label: rgb(token("label", "color")),
          height: px(token("box", "height")),
          padding: px(token("box", "inline-padding")),
        });
        checked++;
      }
    }
    expect(checked).toBe(3 * 5);
  });
}

test("every size of the input line is at least size.target.min high in every density (WCAG 2.5.8)", async ({
  page,
}) => {
  await serve(
    page,
    out,
    ["small", "medium", "large"]
      .map((size, i) => `<fm-kampo id="k${i}" size="${size}">Feld</fm-kampo>`)
      .join(""),
  );
  for (const density of ["compact", "default", "comfortable"]) {
    await page.evaluate(
      (d) => document.documentElement.setAttribute("data-fm-density", d),
      density,
    );
    const heights = await page.locator("fm-kampo").evaluateAll((elements) =>
      elements.map((element) => {
        const control = element.shadowRoot?.querySelector('[part="control"]');
        if (!(control instanceof Element)) throw new Error("no control");
        return control.getBoundingClientRect().height;
      }),
    );
    for (const height of heights) expect(height, density).toBeGreaterThanOrEqual(24);
  }
});

// Spec 011 ① (E8, O-7, plan ① D-07): password, number and date; the form's validity; Enter sends.
test.describe("fm-kampo of Spec 011 ①: password, number, date, form", () => {
  test("password hides what is typed and names what the platform fills in", async ({ page }) => {
    await serve(
      page,
      out,
      `<fm-kampo id="a" kind="password" autocomplete="current-password">Passwort</fm-kampo>`,
    );
    const control = page.locator("#a").locator('[part="control"]');
    await expect(control).toHaveAttribute("type", "password");
    await expect(control).toHaveAttribute("autocomplete", "current-password");
    await control.fill("geheim");
    await expect(page.locator("#a")).toHaveAttribute("value", "geheim");
    await page.locator("#a").evaluate((e) => e.removeAttribute("autocomplete"));
    await expect(control).not.toHaveAttribute("autocomplete");
  });

  test("number: a text input with a numeric keyboard; a whole number passes, 1.5 and abc are invalid, bounds hold; the error slot is the message", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<form id="f"><fm-kampo id="a" kind="number" name="n" min="1" max="99">Vorrang</fm-kampo></form>`,
    );
    const host = page.locator("#a");
    const control = host.locator('[part="control"]');
    await expect(control).toHaveAttribute("type", "text");
    await expect(control).toHaveAttribute("inputmode", "numeric");
    const validity = () =>
      host.evaluate((e) => {
        const v = e as HTMLElement & { validity: ValidityState; validationMessage: string };
        return {
          valid: v.validity.valid,
          pattern: v.validity.patternMismatch,
          under: v.validity.rangeUnderflow,
          over: v.validity.rangeOverflow,
          message: v.validationMessage,
          aria: e.shadowRoot?.querySelector('[part="control"]')?.getAttribute("aria-invalid"),
          form: (document.getElementById("f") as HTMLFormElement).checkValidity(),
        };
      });
    await control.fill("42");
    expect(await validity()).toMatchObject({ valid: true, aria: null, form: true });
    await control.fill("1.5");
    expect(await validity()).toMatchObject({
      valid: false,
      pattern: true,
      aria: "true",
      form: false,
    });
    await control.fill("abc");
    expect(await validity()).toMatchObject({ valid: false, pattern: true, aria: "true" });
    await control.fill("0");
    const under = await validity();
    expect(under).toMatchObject({
      valid: false,
      under: true,
      over: false,
      aria: "true",
      form: false,
    });
    expect(under.message.length).toBeGreaterThan(0);
    await control.fill("100");
    expect(await validity()).toMatchObject({ valid: false, under: false, over: true });
    // The error slot's text is the message of the form (error-says-what-to-do).
    await host.evaluate((e) => {
      e.insertAdjacentHTML(
        "beforeend",
        '<span slot="error">Gib eine Zahl zwischen 1 und 99 ein</span>',
      );
    });
    await expect
      .poll(async () => (await validity()).message)
      .toBe("Gib eine Zahl zwischen 1 und 99 ein");
    await control.fill("7");
    expect(await validity()).toMatchObject({ valid: true });
  });

  test("date: the platform's own dialog with its bounds; required keeps the form from being sent", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<form id="f"><fm-kampo id="a" kind="date" name="d" min="2026-10-16" required>Ablaufdatum</fm-kampo></form>`,
    );
    const host = page.locator("#a");
    const control = host.locator('[part="control"]');
    await expect(control).toHaveAttribute("type", "date");
    await expect(control).toHaveAttribute("min", "2026-10-16");
    const state = () =>
      host.evaluate((e) => {
        const v = e as HTMLElement & { validity: ValidityState; validationMessage: string };
        return {
          valid: v.validity.valid,
          missing: v.validity.valueMissing,
          under: v.validity.rangeUnderflow,
          message: v.validationMessage,
          form: (document.getElementById("f") as HTMLFormElement).checkValidity(),
        };
      });
    const empty = await state();
    expect(empty).toMatchObject({ valid: false, missing: true, form: false });
    expect(empty.message).toBe(texts.de);
    await control.fill("2026-10-01");
    expect(await state()).toMatchObject({ valid: false, under: true, form: false });
    await control.fill("2026-12-24");
    expect(await state()).toMatchObject({ valid: true, form: true });
    expect(
      await page.evaluate(() =>
        new FormData(document.getElementById("f") as HTMLFormElement).get("d"),
      ),
    ).toBe("2026-12-24");
  });

  test("Enter in a one-line field sends the form exactly once; a required empty field does not; reset clears the value", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<form id="f"><fm-kampo id="a" name="a" required>Name</fm-kampo><fm-butono type="submit">Senden</fm-butono></form>`,
    );
    await page.evaluate(() => {
      const form = document.getElementById("f") as HTMLFormElement;
      (window as unknown as { sent: number }).sent = 0;
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        (window as unknown as { sent: number }).sent++;
      });
    });
    const control = page.locator("#a").locator('[part="control"]');
    await control.focus();
    await page.keyboard.press("Enter");
    expect(await page.evaluate(() => (window as unknown as { sent: number }).sent)).toBe(0);
    await control.fill("Erika");
    await page.keyboard.press("Enter");
    expect(await page.evaluate(() => (window as unknown as { sent: number }).sent)).toBe(1);
    await page.evaluate(() => (document.getElementById("f") as HTMLFormElement).reset());
    await expect(page.locator("#a")).not.toHaveAttribute("value");
    await expect(control).toHaveValue("");
  });
});
