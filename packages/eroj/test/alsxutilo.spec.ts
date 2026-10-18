// fm-alsxutilo in the browser (Spec 015 ②; G4, G5, plan ② D-05): the platform's file input as the
// core — named by the label, described by help and error, the one target for pointer and keyboard
// over the composed butono that shows "Datei auswählen" with the ikono upload. Chosen files stand
// in a list (name, size, a remove butono named „‹Datei› entfernen"), their number is announced, a
// file of another kind or larger than max-size makes the field invalid with the Modelo's error;
// the files are the form value under the name; the dropzone takes dropped files and shows the
// state dragover. Chromium, Firefox and WebKit.

import { expect, type Page, test } from "@playwright/test";
import { TAB } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const alsxutilo = input.modelo.eroj.find((entry) => entry.ero.name === "alsxutilo");
if (alsxutilo === undefined) throw new Error("alsxutilo missing");
const texts = alsxutilo.skemo.a11y.texts ?? {};
const word = (key: string, lingvo = "de") => texts[key]?.[lingvo] ?? "";

const pdf = (name: string, size = 1200) => ({
  name,
  mimeType: "application/pdf",
  buffer: Buffer.alloc(size, 1),
});
const png = (name: string, size = 300) => ({
  name,
  mimeType: "image/png",
  buffer: Buffer.alloc(size, 1),
});

const FORM = (attributes = "", slots = "") =>
  `<form id="f"><fm-alsxutilo id="a" name="lebenslauf" ${attributes}>Lebenslauf${slots}</fm-alsxutilo><fm-butono id="send" type="submit">Senden</fm-butono></form>`;
const HELP = '<span slot="help">PDF, höchstens 5 MB</span>';

const fileInput = (page: Page) => page.locator("#a").locator('input[type="file"]');

const stateOf = (page: Page) =>
  page.locator("#a").evaluate((element) => {
    const shadow = element.shadowRoot as ShadowRoot;
    const input = shadow.querySelector('[part="control"]') as HTMLInputElement;
    const rows = [...(shadow.querySelectorAll('[part="file"]') ?? [])];
    const form = element.closest("form");
    const data = form === null ? undefined : new FormData(form);
    return {
      rows: rows.map((row) => ({
        name: row.querySelector('[part="file-name"]')?.textContent ?? "",
        size: row.querySelector('[part="file-size"]')?.textContent ?? "",
        remove: row.querySelector('[part="remove"]')?.getAttribute("label") ?? "",
      })),
      listHidden: (shadow.querySelector('[part="file-list"]') as HTMLElement).hidden,
      count: shadow.querySelector('[part="count"]')?.textContent ?? "",
      invalid: input.getAttribute("aria-invalid"),
      error: (shadow.getElementById("file-error") as HTMLElement).textContent ?? "",
      errorHidden: (shadow.querySelector('[part="error"]') as HTMLElement).hidden,
      valid: (element as unknown as { checkValidity(): boolean }).checkValidity(),
      message: (element as unknown as { validationMessage: string }).validationMessage,
      sent: data === undefined ? [] : data.getAll("lebenslauf").map((file) => (file as File).name),
      platform: [...(input.files ?? [])].map((file) => file.name),
    };
  });

test.describe("fm-alsxutilo behaviour", () => {
  test("the platform's file input is the control: named by its label, described by its help; the composed butono shows the Modelo's words and the ikono upload", async ({
    page,
  }) => {
    await serve(page, out, FORM('accept=".pdf" multiple', HELP));
    const control = fileInput(page);
    await expect(control).toHaveAccessibleName("Lebenslauf");
    await expect(control).toHaveAccessibleDescription("PDF, höchstens 5 MB");
    await expect(control).toHaveAttribute("accept", ".pdf");
    expect(await control.evaluate((element) => (element as HTMLInputElement).multiple)).toBe(true);
    const choose = page.locator("#a").locator('[part="choose"]');
    await expect(choose).toHaveText(word("choose-name"));
    await expect(choose).toHaveAttribute("emphasis", "medium");
    expect(await choose.evaluate((element) => (element as HTMLElement).inert)).toBe(true);
    await expect(choose.locator('fm-ikono[name="upload"]')).toHaveCount(1);
    // The input lies over the button: the one target, as large as the button it looks like.
    const [inputBox, chooseBox] = await Promise.all([control.boundingBox(), choose.boundingBox()]);
    expect(inputBox?.width).toBeCloseTo(chooseBox?.width ?? 0, 0);
    expect(inputBox?.height).toBeCloseTo(chooseBox?.height ?? 0, 0);
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
      "dropzone",
      "picker",
      "choose",
      "control",
      "drop-hint",
      "help",
      "error",
      "file-list",
      "count",
    ]);
  });

  test("chosen files stand in the list with name, size and remove; their number is announced; they are the form value under the name", async ({
    page,
  }) => {
    await serve(page, out, FORM('accept=".pdf,.png" multiple', HELP));
    await fileInput(page).setInputFiles([pdf("Lebenslauf.pdf", 1_200_000), png("Foto.png", 340)]);
    const state = await stateOf(page);
    expect(state.rows).toEqual([
      { name: "Lebenslauf.pdf", size: "1,2 MB", remove: "Lebenslauf.pdf entfernen" },
      { name: "Foto.png", size: "340 Byte", remove: "Foto.png entfernen" },
    ]);
    expect(state.listHidden).toBe(false);
    expect(state.count).toBe("Ausgewählte Dateien: 2");
    expect(state.invalid).toBeNull();
    expect(state.valid).toBe(true);
    expect(state.sent).toEqual(["Lebenslauf.pdf", "Foto.png"]);
    // A second choice adds to the list where multiple allows.
    await fileInput(page).setInputFiles([pdf("Zeugnis.pdf")]);
    const more = await stateOf(page);
    expect(more.rows.map((row) => row.name)).toEqual(["Lebenslauf.pdf", "Foto.png", "Zeugnis.pdf"]);
    expect(more.platform).toEqual(["Lebenslauf.pdf", "Foto.png", "Zeugnis.pdf"]);
    expect(more.count).toBe("Ausgewählte Dateien: 3");
    // Remove by its name: the list, the platform's input and the form value follow; the focus
    // goes to the next remove.
    await page.getByRole("button", { name: "Foto.png entfernen" }).click();
    const fewer = await stateOf(page);
    expect(fewer.rows.map((row) => row.name)).toEqual(["Lebenslauf.pdf", "Zeugnis.pdf"]);
    expect(fewer.platform).toEqual(["Lebenslauf.pdf", "Zeugnis.pdf"]);
    expect(fewer.sent).toEqual(["Lebenslauf.pdf", "Zeugnis.pdf"]);
    expect(fewer.count).toBe("Ausgewählte Dateien: 2");
    await expect(page.getByRole("button", { name: "Zeugnis.pdf entfernen" })).toBeFocused();
  });

  test("without multiple a second choice replaces the first", async ({ page }) => {
    await serve(page, out, FORM("", HELP));
    await fileInput(page).setInputFiles([pdf("Eins.pdf")]);
    await fileInput(page).setInputFiles([pdf("Zwei.pdf")]);
    expect((await stateOf(page)).rows.map((row) => row.name)).toEqual(["Zwei.pdf"]);
  });

  test("a file of another kind makes the field invalid with the Modelo's error (error-says-what-to-do); removing it makes it valid again and the focus returns to the input", async ({
    page,
    browserName,
  }) => {
    await serve(page, out, FORM('accept=".pdf"', HELP));
    await fileInput(page).setInputFiles([png("Foto.png")]);
    const wrong = await stateOf(page);
    expect(wrong.invalid).toBe("true");
    expect(wrong.error).toBe("Foto.png hat eine Art, die hier nicht geht: Wähle PDF.");
    expect(wrong.errorHidden).toBe(false);
    expect(wrong.valid).toBe(false);
    expect(wrong.message).toBe(wrong.error);
    await expect(fileInput(page)).toHaveAccessibleDescription(
      "PDF, höchstens 5 MB Foto.png hat eine Art, die hier nicht geht: Wähle PDF.",
    );
    // The keyboard reaches the remove butono after the input and removes with Enter.
    await fileInput(page).focus();
    await page.keyboard.press(TAB(browserName));
    await expect(page.getByRole("button", { name: "Foto.png entfernen" })).toBeFocused();
    await page.keyboard.press("Enter");
    const clean = await stateOf(page);
    expect(clean.rows).toEqual([]);
    expect(clean.listHidden).toBe(true);
    expect(clean.invalid).toBeNull();
    expect(clean.errorHidden).toBe(true);
    expect(clean.valid).toBe(true);
    expect(clean.count).toBe("Ausgewählte Dateien: 0");
    await expect(fileInput(page)).toBeFocused();
  });

  test("a file larger than max-size is invalid with the size in the person's units, in the document's language", async ({
    page,
  }) => {
    await serve(page, out, FORM('max-size="1000"', HELP));
    await fileInput(page).setInputFiles([pdf("Groß.pdf", 2000)]);
    expect((await stateOf(page)).error).toBe("Groß.pdf ist zu groß: Wähle eine Datei bis 1 kB.");
    await page.evaluate(() => document.documentElement.setAttribute("lang", "en"));
    await page.locator("#a").evaluate((element) => element.setAttribute("max-size", "5000000"));
    await fileInput(page).setInputFiles([pdf("Huge.pdf", 6_000_000)]);
    const state = await stateOf(page);
    expect(state.error).toBe("Huge.pdf is too large: choose a file up to 5 MB.");
    expect(state.count).toBe("Files chosen: 1");
    expect(state.rows[0]?.remove).toBe("Remove Huge.pdf");
  });

  test("required: the form does not send without a file; the error shows once sent; the mark shows and 'erforderlich' is heard", async ({
    page,
  }) => {
    await serve(page, out, FORM("required", HELP));
    await expect(fileInput(page)).toHaveAttribute("aria-required", "true");
    await expect(page.locator("#a").locator('[part="required-mark"]')).toBeVisible();
    await expect(fileInput(page)).toHaveAccessibleDescription(
      `PDF, höchstens 5 MB ${word("required")}`,
    );
    const untouched = await stateOf(page);
    expect(untouched.invalid).toBeNull();
    expect(untouched.valid).toBe(false);
    expect(untouched.message).toBe(word("required"));
    let sent = false;
    await page.evaluate(() =>
      document.getElementById("f")?.addEventListener("submit", (event) => {
        event.preventDefault();
        document.body.dataset.sent = "true";
      }),
    );
    await page.locator("#f").evaluate((form) => (form as HTMLFormElement).requestSubmit());
    sent = (await page.evaluate(() => document.body.dataset.sent)) === "true";
    expect(sent).toBe(false);
    expect((await stateOf(page)).invalid).toBe("true");
    await fileInput(page).setInputFiles([pdf("Lebenslauf.pdf")]);
    expect((await stateOf(page)).valid).toBe(true);
    await page.locator("#f").evaluate((form) => (form as HTMLFormElement).requestSubmit());
    expect(await page.evaluate(() => document.body.dataset.sent)).toBe("true");
  });

  test("a reset of the form empties the list", async ({ page }) => {
    await serve(page, out, FORM("multiple", HELP));
    await fileInput(page).setInputFiles([pdf("Eins.pdf"), pdf("Zwei.pdf")]);
    await page.locator("#f").evaluate((form) => (form as HTMLFormElement).reset());
    const state = await stateOf(page);
    expect(state.rows).toEqual([]);
    expect(state.platform).toEqual([]);
    expect(state.sent).toEqual([]);
  });

  test("the keyboard alone chooses: Tab reaches the input, Space opens the platform's dialog; the focus ring stands around the button", async ({
    page,
    browserName,
  }) => {
    await serve(page, out, `<fm-butono id="before">Vorher</fm-butono>${FORM("", HELP)}`);
    await page.locator("#before").focus();
    await page.keyboard.press(TAB(browserName));
    await expect(fileInput(page)).toBeFocused();
    const ring = await page
      .locator("#a")
      .locator('[part="picker"]')
      .evaluate((element) => getComputedStyle(element).outlineStyle);
    expect(ring).not.toBe("none");
    const chooser = page.waitForEvent("filechooser");
    await page.keyboard.press("Space");
    await (await chooser).setFiles([pdf("Lebenslauf.pdf")]);
    expect((await stateOf(page)).rows.map((row) => row.name)).toEqual(["Lebenslauf.pdf"]);
  });

  test("disabled: the input is disabled, the butono shows it, nothing can be chosen", async ({
    page,
  }) => {
    await serve(page, out, FORM("disabled", HELP));
    await expect(fileInput(page)).toBeDisabled();
    await expect(page.locator("#a").locator('[part="choose"]')).toHaveAttribute("disabled", "");
  });

  test("the dropzone: dashed at rest, solid on the sunken ground while files are dragged over it, a drop takes the files; without dropzone no border and no hint", async ({
    page,
  }) => {
    await serve(page, out, `${FORM('dropzone multiple accept=".pdf"', HELP)}`);
    const zone = page.locator("#a").locator('[part="dropzone"]');
    const look = () =>
      zone.evaluate((element) => {
        const style = getComputedStyle(element);
        return { border: style.borderTopStyle, fill: style.backgroundColor };
      });
    const rest = await look();
    expect(rest.border).toBe("dashed");
    await expect(page.locator("#a").locator('[part="drop-hint"]')).toHaveText(
      word("drop-hint-name"),
    );
    const sunken = await page.evaluate(() =>
      getComputedStyle(document.body).getPropertyValue("--fm-color-background-sunken").trim(),
    );
    const transfer = await page.evaluateHandle(() => {
      const data = new DataTransfer();
      data.items.add(new File(["x"], "Abgelegt.pdf", { type: "application/pdf" }));
      return data;
    });
    await zone.dispatchEvent("dragenter", { dataTransfer: transfer });
    await zone.dispatchEvent("dragover", { dataTransfer: transfer });
    const over = await look();
    expect(over.border).toBe("solid");
    expect(over.fill).not.toBe(rest.fill);
    expect(sunken).not.toBe("");
    await zone.dispatchEvent("drop", { dataTransfer: transfer });
    expect((await look()).border).toBe("dashed");
    expect((await stateOf(page)).rows.map((row) => row.name)).toEqual(["Abgelegt.pdf"]);
    await page.locator("#a").evaluate((element) => element.removeAttribute("dropzone"));
    expect((await look()).border).toBe("none");
    await expect(page.locator("#a").locator('[part="drop-hint"]')).toBeHidden();
  });

  test("right to left: the remove stands before the name, the list mirrors", async ({ page }) => {
    await serve(page, out, `<div dir="rtl">${FORM("", HELP)}</div>`);
    await fileInput(page).setInputFiles([pdf("Lebenslauf.pdf")]);
    const [name, remove] = await Promise.all([
      page.locator("#a").locator('[part="file-name"]').boundingBox(),
      page.locator("#a").locator('[part="remove"]').boundingBox(),
    ]);
    expect((remove?.x ?? 0) + (remove?.width ?? 0)).toBeLessThanOrEqual((name?.x ?? 0) + 1);
  });
});
