// Spec 029 ②b-1, Abnahme #122 (Maintainer, 30.10.), the picture of the right edge in the browser:
// spinner, clear button and the field's icon (chevron, calendar) sit INSIDE the field's border, in
// that order from the inside out; the field keeps its width when the clear button comes and goes;
// the ✕ is as large as the field's icon; the spinner stands in the field, not beside the label.

import { expect, type Page, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const options = (...words: string[]) =>
  words.map((word) => `<data slot="options" value="${word.toLowerCase()}">${word}</data>`).join("");

/** The fields with a box of their own, with a value, clearable and loading where they can be. */
const BOXED: Readonly<Record<string, string>> = {
  kampo: '<fm-kampo clearable loading value="Anna">Name</fm-kampo>',
  tekstareo: '<fm-tekstareo loading value="Text">Begründung</fm-tekstareo>',
  elektilo: `<fm-elektilo clearable loading value="deutschland">Land${options("Deutschland", "Österreich")}</fm-elektilo>`,
  listelektilo: `<fm-listelektilo clearable loading value="europa">Region${options("Europa", "Asien")}</fm-listelektilo>`,
  plurelektilo: `<fm-plurelektilo loading>Standards${options("Kontrast", "Fokus")}</fm-plurelektilo>`,
  kompletigilo: `<fm-kompletigilo clearable loading value="Deutschland">Land${options("Deutschland", "Dänemark")}</fm-kompletigilo>`,
  datelektilo: '<fm-datelektilo clearable loading value="2026-10-30">Lieferdatum</fm-datelektilo>',
};

interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** The border box of the field's control and of every part at its end, from the shadow root. */
async function edgeOf(page: Page, tag: string) {
  return page.evaluate((name) => {
    const host = document.querySelector(name) as HTMLElement;
    const root = host.shadowRoot as ShadowRoot;
    const rect = (element: Element | null): Box | undefined => {
      if (!(element instanceof HTMLElement) || element.hidden) return undefined;
      const box = element.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return undefined;
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
    };
    const control = root.querySelector('[part="control"]') as HTMLElement;
    const style = getComputedStyle(control);
    const box = control.getBoundingClientRect();
    const inner = {
      left: box.left + Number.parseFloat(style.borderInlineStartWidth),
      right: box.right - Number.parseFloat(style.borderInlineEndWidth),
      top: box.top + Number.parseFloat(style.borderTopWidth),
      bottom: box.bottom - Number.parseFloat(style.borderBottomWidth),
    };
    const parts: Record<string, Box | undefined> = {};
    for (const part of ["spinner", "clear", "indicator", "trigger"]) {
      parts[part] = rect(root.querySelector(`[part="${part}"]`));
    }
    const label = root.querySelector('[part="label"]');
    return {
      inner,
      width: box.width,
      parts,
      spinnerInLabel: label?.querySelector('[part="spinner"]') !== null,
    };
  }, tag);
}

const within = (part: Box, inner: Box) =>
  part.left >= inner.left - 0.5 &&
  part.right <= inner.right + 0.5 &&
  part.top >= inner.top - 0.5 &&
  part.bottom <= inner.bottom + 0.5;

test.describe("Abnahme #122: the right edge of a field, inside its border", () => {
  for (const [ero, markup] of Object.entries(BOXED)) {
    test(`${ero}: spinner, clear and the field's icon inside the border, from the inside out`, async ({
      page,
    }) => {
      await serve(page, out, `<div style="inline-size: 20rem">${markup}</div>`);
      await page.waitForTimeout(50);
      const edge = await edgeOf(page, `fm-${ero}`);
      expect(edge.spinnerInLabel, "the spinner is not beside the label").toBe(false);
      const present = (["spinner", "clear", "indicator", "trigger"] as const).filter(
        (part) => edge.parts[part] !== undefined,
      );
      expect(present, "the spinner shows").toContain("spinner");
      for (const part of present) {
        expect(within(edge.parts[part] as Box, edge.inner), `${part} inside the border`).toBe(true);
      }
      // From the inside out: each part starts after the one before it ends.
      for (let index = 1; index < present.length; index++) {
        const before = edge.parts[present[index - 1] as string] as Box;
        const after = edge.parts[present[index] as string] as Box;
        expect(after.left, `${present[index - 1]} before ${present[index]}`).toBeGreaterThanOrEqual(
          before.right - 0.5,
        );
      }
    });
  }

  for (const ero of ["kampo", "elektilo", "listelektilo", "kompletigilo", "datelektilo"]) {
    test(`${ero}: the field keeps its width when the clear button comes and goes`, async ({
      page,
    }) => {
      await serve(
        page,
        out,
        `<div style="inline-size: 20rem">${(BOXED[ero] ?? "").replace(" loading", "")}</div>`,
      );
      const before = await edgeOf(page, `fm-${ero}`);
      expect(before.parts.clear, "the clear button shows with a value").toBeDefined();
      await page.locator(`fm-${ero}`).evaluate((host) => host.setAttribute("value", ""));
      await page.waitForTimeout(50);
      const after = await edgeOf(page, `fm-${ero}`);
      expect(after.parts.clear, "gone without a value").toBeUndefined();
      expect(after.width).toBeCloseTo(before.width, 0);
    });
  }

  test("the ✕ is as large as the chevron of the select and the calendar of the date picker", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div style="inline-size: 20rem">${(BOXED.elektilo ?? "").replace(" loading", "")}${(BOXED.datelektilo ?? "").replace(" loading", "")}</div>`,
    );
    for (const [ero, icon] of [
      ["elektilo", "indicator"],
      ["datelektilo", "trigger"],
    ] as const) {
      const sizes = await page.locator(`fm-${ero}`).evaluate((host, iconPart) => {
        const root = host.shadowRoot as ShadowRoot;
        const glyph = (part: string) => {
          const holder = root.querySelector(`[part="${part}"]`);
          const svg = holder?.querySelector("fm-ikono") ?? holder;
          const box = (svg as Element).getBoundingClientRect();
          return Math.round(box.width);
        };
        return { clear: glyph("clear"), icon: glyph(iconPart) };
      }, icon);
      expect(sizes.clear, ero).toBe(sizes.icon);
    }
  });
});

/** The fields without a box of their own: the spinner at the end of the field, not in the label. */
const UNBOXED: Readonly<Record<string, string>> = {
  glitilo: "<fm-glitilo loading>Lautstärke</fm-glitilo>",
  elekto: `<fm-elekto name="v" loading>Versandart${options("Standard", "Express")}</fm-elekto>`,
  markobutono: "<fm-markobutono loading>Newsletter</fm-markobutono>",
  sxaltilo: "<fm-sxaltilo loading>Benachrichtigungen</fm-sxaltilo>",
  alsxutilo: "<fm-alsxutilo loading>Lebenslauf</fm-alsxutilo>",
};

test.describe("Abnahme #122: the spinner of a field without a box of its own", () => {
  for (const [ero, markup] of Object.entries(UNBOXED)) {
    test(`${ero}: the spinner at the end of the field, not in its label`, async ({ page }) => {
      await serve(page, out, `<div style="inline-size: 20rem">${markup}</div>`);
      const spot = await page.locator(`fm-${ero}`).evaluate((host) => {
        const root = host.shadowRoot as ShadowRoot;
        const spinner = root.querySelector('[part="spinner"]') as HTMLElement;
        const label = root.querySelector('[part="label"]') as HTMLElement;
        const zone = root.querySelector('[part="dropzone"]');
        const s = spinner.getBoundingClientRect();
        const l = label.getBoundingClientRect();
        const z = zone?.getBoundingClientRect();
        return {
          inLabel: label.contains(spinner),
          visible: s.width > 0 && !spinner.hidden,
          after: s.left >= l.right - 0.5,
          inZone:
            z === undefined
              ? true
              : s.left >= z.left && s.right <= z.right && s.top >= z.top && s.bottom <= z.bottom,
        };
      });
      expect(spot.visible, "shows").toBe(true);
      expect(spot.inLabel, "not in the label").toBe(false);
      expect(spot.after, "after the label").toBe(true);
      expect(spot.inZone, "inside the dropzone of an upload").toBe(true);
    });
  }
});

// Abnahme #122, 5: the column loading showed the mark of a required field – loading is heard
// ("lädt") and marked the field like required. Only required shows the mark.
test.describe("Abnahme #122: loading is no required field", () => {
  for (const ero of ["kampo", "elektilo", "elekto"]) {
    test(`${ero}: loading alone shows no required mark`, async ({ page }) => {
      const markup =
        ero === "kampo"
          ? "<fm-kampo loading>Name</fm-kampo>"
          : ero === "elektilo"
            ? `<fm-elektilo loading>Land${options("Deutschland", "Österreich")}</fm-elektilo>`
            : `<fm-elekto name="v" loading>Versandart${options("Standard", "Express")}</fm-elekto>`;
      await serve(page, out, markup);
      await expect(page.locator(`fm-${ero}`).locator('[part="required-mark"]')).toBeHidden();
    });
  }
});
