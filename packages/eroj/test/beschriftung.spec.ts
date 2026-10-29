// Spec 029 ②b-1b, Befund der Nachlese 12: agents write the label of a field as an attribute
// (`<fm-kampo label="E-Mail">`). The simplest way to write a field gives a visible label: the
// attribute is shown where the slot's text would stand, names the control and passes axe; the
// slot's text wins where both are given.

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const options = (...words: string[]) =>
  words.map((word) => `<data slot="options" value="${word.toLowerCase()}">${word}</data>`).join("");

const WORD = "Beschriftung aus dem Attribut";

/** Every field of field-label-visible, labelled by the attribute alone. */
const BY_ATTRIBUTE: Readonly<Record<string, string>> = {
  kampo: `<fm-kampo label="${WORD}"></fm-kampo>`,
  tekstareo: `<fm-tekstareo label="${WORD}"></fm-tekstareo>`,
  elektilo: `<fm-elektilo label="${WORD}">${options("Deutschland", "Österreich")}</fm-elektilo>`,
  listelektilo: `<fm-listelektilo label="${WORD}">${options("Europa", "Asien")}</fm-listelektilo>`,
  plurelektilo: `<fm-plurelektilo label="${WORD}">${options("Kontrast", "Fokus")}</fm-plurelektilo>`,
  kompletigilo: `<fm-kompletigilo label="${WORD}">${options("Deutschland", "Dänemark")}</fm-kompletigilo>`,
  datelektilo: `<fm-datelektilo label="${WORD}"></fm-datelektilo>`,
  glitilo: `<fm-glitilo label="${WORD}"></fm-glitilo>`,
  elekto: `<fm-elekto name="versand" label="${WORD}">${options("Standard", "Express")}</fm-elekto>`,
  markobutono: `<fm-markobutono label="${WORD}"></fm-markobutono>`,
  sxaltilo: `<fm-sxaltilo label="${WORD}"></fm-sxaltilo>`,
  alsxutilo: `<fm-alsxutilo label="${WORD}"></fm-alsxutilo>`,
};

test.describe("Spec 029 ②b-1b (Nachlese 12): the label as an attribute is shown", () => {
  for (const [ero, markup] of Object.entries(BY_ATTRIBUTE)) {
    test(`${ero}: label="…" is the visible label and names the control, axe-clean`, async ({
      page,
    }) => {
      await serve(page, out, `<main>${markup}</main>`);
      await expect(page.getByText(WORD, { exact: true })).toBeVisible();
      expect(await page.getByLabel(WORD, { exact: true }).count(), "named by it").toBeGreaterThan(
        0,
      );
      const results = await new AxeBuilder({ page }).include("main").analyze();
      expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });
  }

  test("the slot's text wins over the attribute; the attribute shows again when the slot empties", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<main><fm-kampo label="Aus dem Attribut">Aus dem Slot</fm-kampo></main>',
    );
    await expect(page.getByText("Aus dem Slot", { exact: true })).toBeVisible();
    await expect(page.getByText("Aus dem Attribut", { exact: true })).toBeHidden();
    await expect(page.getByLabel("Aus dem Slot", { exact: true })).toHaveCount(1);
    await page.evaluate(() => {
      const kampo = document.querySelector("fm-kampo");
      if (kampo !== null) kampo.textContent = "";
    });
    await expect(page.getByText("Aus dem Attribut", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Aus dem Attribut", { exact: true })).toHaveCount(1);
  });

  test("whitespace around the attribute's field counts as empty: the attribute is shown", async ({
    page,
  }) => {
    await serve(page, out, `<main><fm-kampo label="${WORD}">\n  \n</fm-kampo></main>`);
    await expect(page.getByText(WORD, { exact: true })).toBeVisible();
  });
});
