// fm-tekstareo in the browser (Spec 011 ②; G4, G7, plan ② D-11): the text area — the field of the
// kampo around the platform's own textarea, rows as its height, vertical resizing only, kind code in
// the code typography without the spelling check, form-associated. Chromium, Firefox and WebKit.

import { boundToken, combinationsOf, eroTokenOf } from "@fundamento/modelo";
import { expect, test } from "@playwright/test";
import { TAB } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const tekstareo = input.modelo.eroj.find((entry) => entry.ero.name === "tekstareo");
if (tekstareo === undefined) throw new Error("tekstareo missing");
const skemo = tekstareo.skemo;
const texts = skemo.a11y.texts?.required;
if (texts === undefined) throw new Error("the tekstareo speaks required in de and en");

const area = (attributes: string, slots = "") =>
  `<fm-tekstareo id="a" ${attributes}>Begründung${slots}</fm-tekstareo>`;

test.describe("fm-tekstareo behaviour", () => {
  test("role textbox over several lines, named by its label, described by help then error; the parts of the kampo", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      area(
        'name="grund" rows="6"',
        `<span slot="help">Die Prüfer lesen die Begründung.</span><span slot="error">Gib eine Begründung mit mindestens zehn Zeichen ein</span>`,
      ),
    );
    const box = page.getByRole("textbox", { name: "Begründung" });
    await expect(box).toBeVisible();
    expect(await box.evaluate((element) => element.tagName)).toBe("TEXTAREA");
    await expect(box).toHaveAttribute("rows", "6");
    await expect(box).toHaveAttribute("name", "grund");
    await expect(box).toHaveAccessibleDescription(
      "Die Prüfer lesen die Begründung. Gib eine Begründung mit mindestens zehn Zeichen ein",
    );
    await expect(box).toHaveAttribute("aria-invalid", "true");
    expect(
      await page
        .locator("#a")
        .evaluate((element) =>
          [...(element.shadowRoot?.querySelectorAll("[part]") ?? [])].map((n) =>
            n.getAttribute("part"),
          ),
        ),
    ).toEqual(["field", "label", "required-mark", "control", "help", "error"]);
  });

  // Nachbesserung F-8 (Abnahme 16.10.): as the kampo — an empty, untouched required area shows no
  // error until the form is sent.
  test("an empty, untouched required area shows no error until the form is sent", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<form id="f">${area('required name="a"')}<fm-tekstareo id="b" name="b">Notiz</fm-tekstareo><button type="submit">Senden</button></form>`,
    );
    const box = page.getByRole("textbox", { name: "Begründung" });
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
    await page.evaluate(() => {
      const form = document.getElementById("f") as HTMLFormElement;
      form.addEventListener("submit", (event) => event.preventDefault());
      form.requestSubmit();
    });
    await expect(box).toHaveAttribute("aria-invalid", "true");
    const after = await borders();
    expect(after[0]).not.toBe(after[1]);
  });

  test("four rows by default; the area is taller than one line and resizes vertically only", async ({
    page,
  }) => {
    await serve(page, out, `${area("")}<fm-kampo id="k">Name</fm-kampo>`);
    const box = page.locator("#a").locator('[part="control"]');
    await expect(box).toHaveAttribute("rows", "4");
    const style = await box.evaluate((element) => {
      const computed = getComputedStyle(element);
      return { resize: computed.resize, height: element.getBoundingClientRect().height };
    });
    const line = await page
      .locator("#k")
      .locator('[part="control"]')
      .evaluate((element) => element.getBoundingClientRect().height);
    expect(style.resize).toBe("vertical");
    expect(style.height).toBeGreaterThan(line * 2);
  });

  test("kind code: the code typography, no spelling check; text: the body typography", async ({
    page,
  }) => {
    await serve(page, out, `${area('kind="code"')}<fm-tekstareo id="t">Kommentar</fm-tekstareo>`);
    const code = page.locator("#a").locator('[part="control"]');
    await expect(code).toHaveAttribute("spellcheck", "false");
    const fonts = await page.evaluate(() => {
      const font = (id: string) =>
        getComputedStyle(
          document.getElementById(id)?.shadowRoot?.querySelector('[part="control"]') as Element,
        ).fontFamily;
      const root = getComputedStyle(document.documentElement);
      return {
        code: font("a"),
        text: font("t"),
        codeToken: root.getPropertyValue("--fm-typography-code-font-family").trim(),
        bodyToken: root.getPropertyValue("--fm-typography-body-1-font-family").trim(),
      };
    });
    expect(fonts.codeToken.length).toBeGreaterThan(0);
    expect(fonts.code.replaceAll('"', "")).toBe(fonts.codeToken.replaceAll('"', ""));
    expect(fonts.text.replaceAll('"', "")).toBe(fonts.bodyToken.replaceAll('"', ""));
    await expect(page.locator("#t").locator('[part="control"]')).not.toHaveAttribute("spellcheck");
  });

  test("Tab reaches it, typing sets the value and the form value over lines; Enter writes a line and sends nothing", async ({
    page,
    browserName,
  }) => {
    await serve(
      page,
      out,
      `<form id="f"><fm-tekstareo id="a" name="a">Begründung</fm-tekstareo><fm-butono type="submit">Senden</fm-butono></form>`,
    );
    await page.evaluate(() => {
      (window as unknown as { sent: number }).sent = 0;
      (document.getElementById("f") as HTMLFormElement).addEventListener("submit", (event) => {
        event.preventDefault();
        (window as unknown as { sent: number }).sent++;
      });
    });
    await page.keyboard.press(TAB(browserName));
    await expect(page.locator("#a")).toBeFocused();
    await page.keyboard.type("Erste Zeile");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Zweite Zeile");
    await expect(page.locator("#a")).toHaveAttribute("value", "Erste Zeile\nZweite Zeile");
    expect(
      await page.evaluate(() =>
        new FormData(document.getElementById("f") as HTMLFormElement).get("a"),
      ),
    ).toBe("Erste Zeile\nZweite Zeile");
    expect(await page.evaluate(() => (window as unknown as { sent: number }).sent)).toBe(0);
  });

  test("required: aria-required, the mark, 'erforderlich' heard, and the form is not sent empty; reset clears", async ({
    page,
  }) => {
    await serve(page, out, `<form id="f">${area("required")}</form>`);
    const box = page.getByRole("textbox", { name: "Begründung" });
    await expect(box).toHaveAttribute("aria-required", "true");
    await expect(box).toHaveAccessibleDescription(texts.de);
    const state = () =>
      page.locator("#a").evaluate((e) => {
        const v = e as HTMLElement & { validity: ValidityState; validationMessage: string };
        return {
          missing: v.validity.valueMissing,
          message: v.validationMessage,
          form: (document.getElementById("f") as HTMLFormElement).checkValidity(),
        };
      });
    expect(await state()).toEqual({ missing: true, message: texts.de, form: false });
    await box.fill("Weil es nötig ist.");
    expect(await state()).toMatchObject({ missing: false, form: true });
    await page.evaluate(() => (document.getElementById("f") as HTMLFormElement).reset());
    await expect(page.locator("#a")).not.toHaveAttribute("value");
    await expect(box).toHaveValue("");
  });

  test("the host takes the width of its container (Uzo size container)", async ({ page }) => {
    await serve(page, out, `<div id="w" style="inline-size: 20rem">${area("")}</div>`);
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
  test(`${aspekto}: computed styles of every kind × size × state equal the bound tokens (AK-03, S5)`, async ({
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
    const combos = combinationsOf(skemo, ["kind", "size"]);
    const body = combos
      .map(
        (c, i) =>
          `<fm-tekstareo id="k${i}" kind="${c.kind}" size="${c.size}">Feld ${i}</fm-tekstareo>`,
      )
      .join(" ");
    await serve(page, out, body);
    await page.evaluate(
      (value) => document.documentElement.setAttribute("data-fm-aspekto", value),
      aspekto,
    );
    let checked = 0;
    for (const [i, c] of combos.entries()) {
      for (const state of ["rest", "hover", "disabled", "invalid"]) {
        const host = page.locator(`#k${i}`);
        await host.evaluate((element, s) => {
          element.toggleAttribute("disabled", s === "disabled");
          element.toggleAttribute("invalid", s === "invalid");
        }, state);
        if (state === "hover") await host.locator('[part="control"]').hover();
        else await page.mouse.move(0, 0);
        const actual = await host.evaluate((element) => {
          const control = element.shadowRoot?.querySelector('[part="control"]');
          if (!(control instanceof Element)) return null;
          const style = getComputedStyle(control);
          return {
            fill: style.backgroundColor,
            border: style.borderInlineStartColor,
            text: style.color,
            fontSize: style.fontSize,
          };
        });
        const combination = { ...c, state };
        const token = (part: string, property: string) => {
          // Spec 029 ①b: the part reads its Ero-Token; komuna sets its own values there.
          const bound =
            eroTokenOf(tekstareo, part, property, combination) ??
            boundToken(skemo, part, property, combination)?.token;
          const value = bound === undefined ? undefined : rezolvo.tokens[bound]?.value;
          if (value === undefined)
            throw new Error(`${part}.${property} unbound in ${JSON.stringify(combination)}`);
          return value;
        };
        const typography = token("text", "typography") as { fontSize: { value: number } };
        expect(actual, `${aspekto} ${JSON.stringify(combination)}`).toEqual({
          fill: rgb(token("surface", "fill")),
          border: rgb(token("border", "color")),
          text: rgb(token("text", "color")),
          fontSize: `${typography.fontSize.value}px`,
        });
        checked++;
      }
    }
    expect(checked).toBe(6 * 4);
  });
}
