// fm-glitilo in the browser (Spec 025 ①; G4, G5, plan ① D-03): the slider — the field of the kampo
// around a track with its fill and one thumb (two with range), each a role slider named by the
// label (and the Modelo's word for its end), described by help and error, with aria-valuemin, max,
// now and text; the keys of APG move the thumb (arrows along the writing direction, Up/Down, Page
// by ten steps, Home/End), the pointer drags it; the value is the form value; with input a
// composed kampo of kind number stands beside the track and both stay in step; a range keeps the
// end at or after the start. Chromium, Firefox and WebKit.

import { expect, type Page, test } from "@playwright/test";
import { TAB } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const glitilo = input.modelo.eroj.find((entry) => entry.ero.name === "glitilo");
if (glitilo === undefined) throw new Error("glitilo missing");
const texts = glitilo.skemo.a11y.texts ?? {};
const word = (key: string, lingvo = "de") => texts[key]?.[lingvo] ?? "";

const FORM = (attributes = "", slots = "") =>
  `<form id="f"><fm-glitilo id="g" name="lautstaerke" ${attributes}>Lautstärke${slots}</fm-glitilo><fm-butono id="send" type="submit">Senden</fm-butono></form>`;
const HELP = '<span slot="help">Zwischen 0 und 100.</span>';

const thumbs = (page: Page) => page.locator("#g").locator('[part="thumb"]:not([hidden])');

const stateOf = (page: Page) =>
  page.locator("#g").evaluate((element) => {
    const shadow = element.shadowRoot as ShadowRoot;
    const all = [...shadow.querySelectorAll('[part="thumb"]')] as HTMLElement[];
    const form = element.closest("form");
    const data = form === null ? undefined : new FormData(form);
    return {
      thumbs: all
        .filter((thumb) => !thumb.hidden)
        .map((thumb) => ({
          now: thumb.getAttribute("aria-valuenow"),
          min: thumb.getAttribute("aria-valuemin"),
          max: thumb.getAttribute("aria-valuemax"),
          text: thumb.getAttribute("aria-valuetext"),
          disabled: thumb.getAttribute("aria-disabled"),
          readonly: thumb.getAttribute("aria-readonly"),
          invalid: thumb.getAttribute("aria-invalid"),
          required: thumb.getAttribute("aria-required"),
          tabindex: thumb.getAttribute("tabindex"),
        })),
      value: element.getAttribute("value"),
      start: element.getAttribute("value-start"),
      end: element.getAttribute("value-end"),
      sent: data === undefined ? [] : data.getAll("lautstaerke").map(String),
      valid: (element as unknown as { checkValidity(): boolean }).checkValidity(),
      message: (element as unknown as { validationMessage: string }).validationMessage,
      fillStart: (shadow.querySelector('[part="track"]') as HTMLElement).style.getPropertyValue(
        "--fm-fill-start",
      ),
      fillSize: (shadow.querySelector('[part="track"]') as HTMLElement).style.getPropertyValue(
        "--fm-fill-size",
      ),
      inputHidden: (shadow.querySelector('[part="input"]') as HTMLElement).hidden,
      inputValue: shadow.querySelector('[part="input"]')?.getAttribute("value"),
    };
  });

test.describe("fm-glitilo behaviour", () => {
  test("one thumb with role slider, named by the label, described by the help, its value spoken in the document's language; the parts in order", async ({
    page,
  }) => {
    await serve(page, out, FORM('value="40"', HELP));
    const thumb = page.getByRole("slider", { name: "Lautstärke" });
    await expect(thumb).toBeVisible();
    await expect(thumb).toHaveAccessibleDescription("Zwischen 0 und 100.");
    const state = await stateOf(page);
    expect(state.thumbs).toEqual([
      {
        now: "40",
        min: "0",
        max: "100",
        text: "40",
        disabled: null,
        readonly: null,
        invalid: null,
        required: null,
        tabindex: "0",
      },
    ]);
    expect(state.sent).toEqual(["40"]);
    expect(state.fillStart).toBe("0%");
    expect(state.fillSize).toBe("40%");
    expect(state.inputHidden).toBe(true);
    expect(
      await page
        .locator("#g")
        .evaluate((element) =>
          [...(element.shadowRoot?.querySelectorAll("[part]") ?? [])].map((n) =>
            n.getAttribute("part"),
          ),
        ),
    ).toEqual([
      "field",
      "label",
      "required-mark",
      "row",
      "min-label",
      "track",
      "fill",
      "thumb",
      "thumb",
      "max-label",
      "input",
      "help",
      "error",
    ]);
  });

  test("the keys move the thumb: arrows by step, Page by ten steps, Home and End to the limits, clamped; input while moving, change when the key is released", async ({
    page,
  }) => {
    await serve(page, out, FORM('value="40" step="2"', HELP));
    await page.evaluate(() => {
      const log: string[] = [];
      (window as unknown as { log: string[] }).log = log;
      const host = document.getElementById("g") as HTMLElement;
      host.addEventListener("input", () => log.push(`input:${host.getAttribute("value")}`));
      host.addEventListener("change", () => log.push(`change:${host.getAttribute("value")}`));
    });
    const thumb = thumbs(page).first();
    await thumb.focus();
    await page.keyboard.press("ArrowRight");
    expect((await stateOf(page)).value).toBe("42");
    await page.keyboard.press("ArrowUp");
    expect((await stateOf(page)).value).toBe("44");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowDown");
    expect((await stateOf(page)).value).toBe("40");
    await page.keyboard.press("PageUp");
    expect((await stateOf(page)).value).toBe("60");
    await page.keyboard.press("PageDown");
    expect((await stateOf(page)).value).toBe("40");
    await page.keyboard.press("End");
    expect((await stateOf(page)).value).toBe("100");
    await page.keyboard.press("ArrowRight");
    expect((await stateOf(page)).value).toBe("100");
    await page.keyboard.press("Home");
    expect((await stateOf(page)).value).toBe("0");
    const log = await page.evaluate(() => (window as unknown as { log: string[] }).log);
    expect(log.filter((entry) => entry.startsWith("input:"))).toEqual([
      "input:42",
      "input:44",
      "input:42",
      "input:40",
      "input:60",
      "input:40",
      "input:100",
      "input:0",
    ]);
    expect(log.filter((entry) => entry.startsWith("change:")).length).toBeGreaterThan(0);
    expect(log.at(-1)).toBe("change:0");
  });

  test("in right-to-left writing the arrows follow the writing direction: ArrowLeft raises the value (Internacia)", async ({
    page,
  }) => {
    await serve(page, out, `<div dir="rtl" lang="ar">${FORM('value="40"', HELP)}</div>`);
    await thumbs(page).first().focus();
    await page.keyboard.press("ArrowLeft");
    expect((await stateOf(page)).value).toBe("41");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    expect((await stateOf(page)).value).toBe("39");
    // The fill stands at the inline start — the right edge in RTL — as the stylesheet says.
    const [track, fill] = await Promise.all([
      page.locator("#g").locator('[part="track"]').boundingBox(),
      page.locator("#g").locator('[part="fill"]').boundingBox(),
    ]);
    expect((fill?.x ?? 0) + (fill?.width ?? 0)).toBeCloseTo((track?.x ?? 0) + (track?.width ?? 0), 0);
  });

  test("the pointer: a press on the track moves the nearest thumb there, a drag follows the pointer; pressed while dragged", async ({
    page,
  }) => {
    await serve(page, out, FORM('value="0"', HELP));
    const track = page.locator("#g").locator('[part="track"]');
    const box = await track.boundingBox();
    if (box === null) throw new Error("no track");
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2);
    await page.mouse.down();
    const pressed = await thumbs(page)
      .first()
      .evaluate((thumb) => thumb.matches(":active"));
    expect(pressed).toBe(true);
    await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2, { steps: 5 });
    await page.mouse.up();
    const value = Number((await stateOf(page)).value);
    expect(value).toBeGreaterThanOrEqual(70);
    expect(value).toBeLessThanOrEqual(80);
  });

  test("range: two thumbs named Von and Bis after the label, the end never before the start; both values are the form value", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      FORM(
        'range value-start="20" value-end="60"',
        '<span slot="min-label">0</span><span slot="max-label">100</span>',
      ),
    );
    await expect(page.getByRole("slider", { name: `Lautstärke ${word("min-label-name")}` })).toBeVisible();
    await expect(page.getByRole("slider", { name: `Lautstärke ${word("max-label-name")}` })).toBeVisible();
    const state = await stateOf(page);
    expect(state.thumbs.map((thumb) => [thumb.now, thumb.min, thumb.max])).toEqual([
      ["20", "0", "60"],
      ["60", "20", "100"],
    ]);
    expect(state.fillStart).toBe("20%");
    expect(state.fillSize).toBe("40%");
    expect(state.sent).toEqual(["20", "60"]);
    // The start cannot pass the end: End takes it to 60, not 100.
    await thumbs(page).first().focus();
    await page.keyboard.press("End");
    expect((await stateOf(page)).start).toBe("60");
    await thumbs(page).nth(1).focus();
    await page.keyboard.press("Home");
    expect((await stateOf(page)).end).toBe("60");
  });

  test("with input a composed kampo of kind number stands beside the track; typing into it moves the thumb, the keys write into it", async ({
    page,
  }) => {
    await serve(page, out, FORM('input value="40"', HELP));
    const field = page.locator("#g").locator('[part="input"]');
    await expect(field).toBeVisible();
    await expect(field).toHaveAttribute("kind", "number");
    await expect(field).toHaveAttribute("min", "0");
    await expect(field).toHaveAttribute("max", "100");
    expect((await stateOf(page)).inputValue).toBe("40");
    const box = field.getByRole("textbox");
    await box.fill("55");
    await box.blur();
    expect((await stateOf(page)).value).toBe("55");
    expect((await stateOf(page)).thumbs[0]?.now).toBe("55");
    await thumbs(page).first().focus();
    await page.keyboard.press("ArrowRight");
    expect((await stateOf(page)).inputValue).toBe("56");
    // The field is a kampo of its own with the slider's label: one name, no second landmark.
    await expect(box).toHaveAccessibleName("Lautstärke");
  });

  test("disabled is skipped by the keyboard and spoken; readonly stays focusable and the keys change nothing; required without a value holds the form; an error text makes it invalid", async ({
    page,
    browserName,
  }) => {
    await serve(
      page,
      out,
      `<fm-butono id="before">Davor</fm-butono>${FORM('value="40" disabled', HELP)}`,
    );
    expect((await stateOf(page)).thumbs[0]).toMatchObject({ disabled: "true", tabindex: "-1" });
    await page.locator("#before").focus();
    await page.keyboard.press(TAB(browserName));
    await expect(page.locator("#send")).toBeFocused();
    await serve(page, out, FORM('value="40" readonly', HELP));
    expect((await stateOf(page)).thumbs[0]).toMatchObject({ readonly: "true", tabindex: "0" });
    await thumbs(page).first().focus();
    await page.keyboard.press("ArrowRight");
    expect((await stateOf(page)).value).toBe("40");
    await serve(page, out, FORM("required", HELP));
    const missing = await stateOf(page);
    expect(missing.thumbs[0]?.required).toBe("true");
    expect(missing.valid).toBe(false);
    expect(missing.message).toBe(word("required"));
    await page.locator("#send").click();
    expect(await page.evaluate(() => location.search)).toBe("");
    await thumbs(page).first().focus();
    await page.keyboard.press("ArrowRight");
    expect((await stateOf(page)).valid).toBe(true);
    await serve(
      page,
      out,
      FORM('value="40"', `${HELP}<span slot="error">Wähle einen Wert bis 100.</span>`),
    );
    expect((await stateOf(page)).thumbs[0]?.invalid).toBe("true");
    await expect(thumbs(page).first()).toHaveAccessibleDescription(
      "Zwischen 0 und 100. Wähle einen Wert bis 100.",
    );
  });

  test("the host takes the width of its container (E3); the thumb is at least size.target.min wide in every density (WCAG 2.5.8)", async ({
    page,
  }) => {
    await serve(page, out, `<div style="width: 420px">${FORM('value="40"', HELP)}</div>`);
    const host = await page.locator("#g").boundingBox();
    expect(host?.width).toBeCloseTo(420, 0);
    for (const density of ["compact", "default", "comfortable"]) {
      await page.evaluate((d) => document.documentElement.setAttribute("data-fm-density", d), density);
      const thumb = await thumbs(page).first().boundingBox();
      expect(thumb?.width, density).toBeGreaterThanOrEqual(24);
      expect(thumb?.height, density).toBeGreaterThanOrEqual(24);
    }
  });
});
