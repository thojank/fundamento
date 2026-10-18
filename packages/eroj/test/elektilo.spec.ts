// fm-elektilo in the browser (Spec 010 ④; G4, G7, E3, plan ④ D-05, D-06): the select — the field
// of the kampo around the platform's own select (role combobox from the browser), its options
// mirrored from the light DOM (<data slot="options" value="…">), the chevron at its end, the
// placeholder as a disabled first option while nothing is chosen. The list that opens is the
// platform's: no popup of the Ero's own, no state open (E3). Chromium, Firefox and WebKit.

import { boundToken, combinationsOf } from "@fundamento/modelo";
import { expect, test } from "@playwright/test";
import { TAB } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const elektilo = input.modelo.eroj.find((entry) => entry.ero.name === "elektilo");
if (elektilo === undefined) throw new Error("elektilo missing");
const skemo = elektilo.skemo;
const texts = skemo.a11y.texts?.required;
if (texts === undefined) throw new Error("the elektilo speaks required in de and en");

const OPTIONS =
  '<data slot="options" value="de">Deutschland</data><data slot="options" value="at">Österreich</data><data slot="options" value="ch">Schweiz</data>';
const select = (attributes: string, slots = "") =>
  `<fm-elektilo id="a" ${attributes}>Land${OPTIONS}${slots}</fm-elektilo>`;

test.describe("fm-elektilo behaviour", () => {
  test("role combobox named by its label, described by help then error; the parts of the kampo plus the chevron", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      select(
        'placeholder="Bitte wählen" name="land"',
        '<span slot="help">Wir liefern in drei Länder.</span><span slot="error">Wähle ein Land, um fortzufahren</span>',
      ),
    );
    const box = page.getByRole("combobox", { name: "Land" });
    await expect(box).toBeVisible();
    await expect(box).toHaveAttribute("name", "land");
    await expect(box).toHaveAccessibleDescription(
      "Wir liefern in drei Länder. Wähle ein Land, um fortzufahren",
    );
    // A filled error slot makes the select invalid (constraint of the Skemo, D-04 of Spec 009).
    await expect(box).toHaveAttribute("aria-invalid", "true");
    expect(
      await page
        .locator("#a")
        .evaluate((element) =>
          [...(element.shadowRoot?.querySelectorAll("[part]") ?? [])].map((n) =>
            n.getAttribute("part"),
          ),
        ),
    ).toEqual(["field", "label", "required-mark", "control", "indicator", "help", "error"]);
    // The chevron is a sign of the projection: hidden from assistive technology, no text.
    await expect(page.locator("#a").locator('[part="indicator"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  test("mirrors the options of the light DOM into the platform's select, the placeholder first, disabled, while nothing is chosen", async ({
    page,
  }) => {
    await serve(page, out, select('placeholder="Bitte wählen"'));
    const options = () =>
      page
        .locator("#a")
        .evaluate((element) =>
          [...(element.shadowRoot?.querySelectorAll("option") ?? [])].map((option) => [
            option.value,
            option.textContent,
            option.disabled,
            option.selected,
          ]),
        );
    expect(await options()).toEqual([
      ["", "Bitte wählen", true, true],
      ["de", "Deutschland", false, false],
      ["at", "Österreich", false, false],
      ["ch", "Schweiz", false, false],
    ]);
    // A chosen value drops the prompt; a new option in the light DOM is a new option of the list.
    await page.locator("#a").evaluate((element) => {
      element.setAttribute("value", "at");
      element.insertAdjacentHTML("beforeend", '<data slot="options" value="fr">Frankreich</data>');
    });
    await expect.poll(options).toEqual([
      ["de", "Deutschland", false, false],
      ["at", "Österreich", false, true],
      ["ch", "Schweiz", false, false],
      ["fr", "Frankreich", false, false],
    ]);
    await expect(page.getByRole("combobox", { name: "Land" })).toHaveValue("at");
  });

  test("choosing an option sets the value, says input and change, and is the form value", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<form id="f">${select('name="land" placeholder="Bitte wählen"')}</form>`,
    );
    await page.evaluate(() => {
      const host = document.getElementById("a");
      (window as unknown as { heard: string[] }).heard = [];
      for (const type of ["input", "change"]) {
        host?.addEventListener(type, () =>
          (window as unknown as { heard: string[] }).heard.push(type),
        );
      }
    });
    await page.getByRole("combobox", { name: "Land" }).selectOption("ch");
    await expect(page.locator("#a")).toHaveAttribute("value", "ch");
    expect(await page.evaluate(() => (window as unknown as { heard: string[] }).heard)).toEqual([
      "input",
      "change",
    ]);
    const formValue = await page.evaluate(() => {
      const form = document.getElementById("f") as HTMLFormElement;
      return new FormData(form).get("land");
    });
    expect(formValue).toBe("ch");
  });

  test("Tab reaches it; the keys of the Skemo reach the platform's select untouched; disabled is skipped", async ({
    page,
    browserName,
  }) => {
    await serve(
      page,
      out,
      `<fm-elektilo id="a" value="de">Land${OPTIONS}</fm-elektilo><fm-elektilo id="b" disabled>Sprache${OPTIONS}</fm-elektilo><fm-elektilo id="c">Jahr${OPTIONS}</fm-elektilo>`,
    );
    expect(skemo.a11y.keys).toEqual(["ArrowUp", "ArrowDown", "Enter", "Escape"]);
    await page.keyboard.press(TAB(browserName));
    await expect(page.locator("#a")).toBeFocused();
    // The list is the platform's (E3), so are its keys: whether ArrowDown moves the choice or opens
    // the list differs by platform (macOS opens it). The element takes none of them for itself.
    await page.evaluate(() => {
      (window as unknown as { taken: string[] }).taken = [];
      window.addEventListener("keydown", (event) => {
        if (event.defaultPrevented)
          (window as unknown as { taken: string[] }).taken.push(event.key);
      });
    });
    for (const key of ["ArrowDown", "ArrowUp", "Escape"]) await page.keyboard.press(key);
    expect(await page.evaluate(() => (window as unknown as { taken: string[] }).taken)).toEqual([]);
    await page.keyboard.press(TAB(browserName));
    await expect(page.locator("#c")).toBeFocused();
    await expect(page.getByRole("combobox", { name: "Sprache" })).toBeDisabled();
  });

  test("required: aria-required, the mark shows, 'erforderlich' is heard, and the form is not sent without a choice", async ({
    page,
  }) => {
    await serve(page, out, `<form id="f">${select('required name="land"')}</form>`);
    const box = page.getByRole("combobox", { name: "Land" });
    await expect(box).toHaveAttribute("aria-required", "true");
    await expect(box).toHaveAccessibleDescription(texts.de);
    await expect(page.locator("#a").locator('[part="required-mark"]')).toBeVisible();
    const valid = () =>
      page.evaluate(() => (document.getElementById("f") as HTMLFormElement).checkValidity());
    expect(await valid()).toBe(false);
    await box.selectOption("de");
    expect(await valid()).toBe(true);
    await page.evaluate(() => document.documentElement.setAttribute("lang", "en"));
    await page.locator("#a").evaluate((e) => e.removeAttribute("value"));
    await expect(box).toHaveAccessibleDescription(texts.en);
    expect(await valid()).toBe(false);
  });

  test("help and error stay hidden without text; no description, not invalid", async ({ page }) => {
    await serve(page, out, select(""));
    const box = page.getByRole("combobox", { name: "Land" });
    await expect(page.locator("#a").locator('[part="help"]')).toBeHidden();
    await expect(page.locator("#a").locator('[part="error"]')).toBeHidden();
    await expect(box).not.toHaveAttribute("aria-describedby");
    await expect(box).not.toHaveAttribute("aria-invalid");
  });

  test("the host takes the width of its container (Uzo size container, like the kampo)", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div id="w" style="inline-size: 20rem">${select("")}<fm-kampo id="k">Name</fm-kampo></div>`,
    );
    const outer = await page.locator("#w").boundingBox();
    const control = await page.locator("#a").locator('[part="control"]').boundingBox();
    const field = await page.locator("#k").locator('[part="control"]').boundingBox();
    expect(Math.round(control?.width ?? 0)).toBe(Math.round(outer?.width ?? 0));
    // Same height as the kampo of the same size (Uzo with: kampo).
    expect(Math.round(control?.height ?? 0)).toBe(Math.round(field?.height ?? 0));
  });

  test("the chevron stands inside the end of the control, the text ends before it (D-05, D-06)", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      ["small", "medium", "large"]
        .map(
          (size, i) =>
            `<div style="inline-size: 16rem"><fm-elektilo id="s${i}" size="${size}" placeholder="Bitte wählen">Land${OPTIONS}</fm-elektilo></div>`,
        )
        .join(""),
    );
    for (const i of [0, 1, 2]) {
      const measured = await page.locator(`#s${i}`).evaluate((element) => {
        const control = element.shadowRoot?.querySelector('[part="control"]');
        const indicator = element.shadowRoot?.querySelector('[part="indicator"]');
        if (!(control instanceof HTMLElement) || !(indicator instanceof HTMLElement)) return null;
        const c = control.getBoundingClientRect();
        const n = indicator.getBoundingClientRect();
        const style = getComputedStyle(control);
        return {
          inside: n.left >= c.left && n.right <= c.right && n.top >= c.top && n.bottom <= c.bottom,
          endGap: c.right - n.right,
          padding: Number.parseFloat(style.paddingInlineStart),
          border: Number.parseFloat(style.borderInlineEndWidth),
          paddingEnd: Number.parseFloat(style.paddingInlineEnd),
          size: n.width,
          square: Math.abs(n.width - n.height) < 0.5,
          centred: Math.abs(n.top + n.height / 2 - (c.top + c.height / 2)) < 1,
          color: getComputedStyle(indicator).color,
        };
      });
      expect(measured?.inside, `size ${i}`).toBe(true);
      expect(measured?.square).toBe(true);
      expect(measured?.centred).toBe(true);
      expect(Math.round(measured?.endGap ?? 0)).toBe(
        Math.round((measured?.padding ?? 0) + (measured?.border ?? 0)),
      );
      // The text room ends a gap before the chevron: padding-end = padding + chevron + gap.
      expect(measured?.paddingEnd ?? 0).toBeGreaterThan(
        (measured?.padding ?? 0) + (measured?.size ?? 0),
      );
    }
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
  test(`${aspekto}: computed styles of every size × state equal the bound tokens, the chevron and the placeholder too (AK-03, S5)`, async ({
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
      .map(
        (c, i) =>
          `<fm-elektilo id="e${i}" size="${c.size}" value="de">Feld ${i}${OPTIONS}</fm-elektilo><fm-elektilo id="p${i}" size="${c.size}" placeholder="Bitte wählen">Leer ${i}${OPTIONS}</fm-elektilo>`,
      )
      .join(" ");
    await serve(page, out, body);
    await page.evaluate(
      (value) => document.documentElement.setAttribute("data-fm-aspekto", value),
      aspekto,
    );
    const token = (part: string, property: string, combination: Record<string, string>) => {
      const bound = boundToken(skemo, part, property, combination);
      const value = bound === undefined ? undefined : rezolvo.tokens[bound.token]?.value;
      if (value === undefined)
        throw new Error(`${part}.${property} unbound in ${JSON.stringify(combination)}`);
      return value;
    };
    const px = (value: unknown) => `${(value as { value: number }).value}px`;
    let checked = 0;
    for (const [i, c] of sizes.entries()) {
      for (const state of ["rest", "hover", "disabled", "invalid"]) {
        const host = page.locator(`#e${i}`);
        await host.evaluate((element, s) => {
          element.toggleAttribute("disabled", s === "disabled");
          element.toggleAttribute("invalid", s === "invalid");
        }, state);
        if (state === "hover") await host.locator('[part="control"]').hover();
        else await page.mouse.move(0, 0);
        const actual = await host.evaluate((element) => {
          const control = element.shadowRoot?.querySelector('[part="control"]');
          const label = element.shadowRoot?.querySelector('[part="label"]');
          const indicator = element.shadowRoot?.querySelector('[part="indicator"]');
          if (
            !(control instanceof Element) ||
            !(label instanceof Element) ||
            !(indicator instanceof Element)
          )
            return null;
          const style = getComputedStyle(control);
          return {
            fill: style.backgroundColor,
            border: style.borderInlineStartColor,
            text: style.color,
            label: getComputedStyle(label).color,
            height: style.minBlockSize,
            padding: style.paddingInlineStart,
            indicator: getComputedStyle(indicator).color,
            indicatorSize: getComputedStyle(indicator).inlineSize,
          };
        });
        const combination = { ...c, state };
        expect(actual, `${aspekto} ${JSON.stringify(combination)}`).toEqual({
          fill: rgb(token("surface", "fill", combination)),
          border: rgb(token("border", "color", combination)),
          text: rgb(token("text", "color", combination)),
          label: rgb(token("label", "color", combination)),
          height: px(token("box", "height", combination)),
          padding: px(token("box", "inline-padding", combination)),
          indicator: rgb(token("indicator", "color", combination)),
          indicatorSize: px(token("indicator", "size", combination)),
        });
        checked++;
      }
      // The empty select shows its prompt in the colour of the placeholder.
      const prompt = await page
        .locator(`#p${i}`)
        .evaluate(
          (element) =>
            getComputedStyle(element.shadowRoot?.querySelector('[part="control"]') as Element)
              .color,
        );
      expect(prompt, `${aspekto} placeholder ${c.size}`).toBe(
        rgb(token("placeholder", "color", { ...c, state: "rest" })),
      );
    }
    expect(checked).toBe(3 * 4);
  });
}

test("every size of the select is at least size.target.min high in every density (WCAG 2.5.8)", async ({
  page,
}) => {
  await serve(
    page,
    out,
    ["small", "medium", "large"]
      .map((size, i) => `<fm-elektilo id="s${i}" size="${size}">Land${OPTIONS}</fm-elektilo>`)
      .join(""),
  );
  for (const density of ["compact", "default", "comfortable"]) {
    await page.evaluate(
      (d) => document.documentElement.setAttribute("data-fm-density", d),
      density,
    );
    const heights = await page.locator("fm-elektilo").evaluateAll((elements) =>
      elements.map((element) => {
        const control = element.shadowRoot?.querySelector('[part="control"]');
        if (!(control instanceof Element)) throw new Error("no control");
        return control.getBoundingClientRect().height;
      }),
    );
    for (const height of heights) expect(height, density).toBeGreaterThanOrEqual(24);
  }
});

// Spec 011 ① (plan ① D-09): the empty option — 'Alle' as a real first option with the value "",
// chosen while nothing else is, never disabled, and no prompt beside it; it is the form value "".
test('empty-label: the first option is selectable with the value "", no prompt beside it, and the form value is empty, not missing', async ({
  page,
}) => {
  await serve(
    page,
    out,
    `<form id="f">${select('name="land" empty-label="Alle" placeholder="Bitte wählen"')}</form>`,
  );
  const options = () =>
    page
      .locator("#a")
      .evaluate((element) =>
        [...(element.shadowRoot?.querySelectorAll("option") ?? [])].map((option) => [
          option.value,
          option.textContent,
          option.disabled,
          option.selected,
        ]),
      );
  // The placeholder stands beside empty-label (the Skemo forbids it): the empty option wins.
  expect(await options()).toEqual([
    ["", "Alle", false, true],
    ["de", "Deutschland", false, false],
    ["at", "Österreich", false, false],
    ["ch", "Schweiz", false, false],
  ]);
  const formValue = () =>
    page.evaluate(() => new FormData(document.getElementById("f") as HTMLFormElement).get("land"));
  expect(await formValue()).toBe("");
  await page.getByRole("combobox", { name: "Land" }).selectOption("at");
  await expect(page.locator("#a")).toHaveAttribute("value", "at");
  expect(await formValue()).toBe("at");
  // Back to the empty option: still there, still selectable (unlike a prompt).
  await page.getByRole("combobox", { name: "Land" }).selectOption("");
  await expect(page.locator("#a")).toHaveAttribute("value", "");
  expect((await options())[0]).toEqual(["", "Alle", false, true]);
  expect(await formValue()).toBe("");
});

// Spec 014 ② (G3, G6): the chevron of the select is an fm-ikono chevron-down in the size of the
// field, in the indicator's colour; no hand-drawn sign.
test("the indicator holds an fm-ikono chevron-down that follows the size of the field", async ({
  page,
}) => {
  await serve(
    page,
    out,
    `<fm-elektilo id="a" size="small">Land<data slot="options" value="de">Deutschland</data></fm-elektilo>`,
  );
  const ikono = page.locator("#a").locator('[part="indicator"] fm-ikono');
  await expect(ikono).toHaveCount(1);
  await expect(ikono).toHaveAttribute("name", "chevron-down");
  await expect(ikono).toHaveAttribute("size", "small");
  await page.locator("#a").evaluate((element) => element.setAttribute("size", "large"));
  await expect(ikono).toHaveAttribute("size", "large");
  expect(await page.locator("#a").locator('[part="indicator"] svg').count()).toBe(0);
});
