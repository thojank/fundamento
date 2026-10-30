// Spec 029 ②b-1, Abnahme #122 (Maintainer, 30.10.), the picture of the right edge in the browser:
// spinner, clear button and the field's icon (chevron, calendar) sit INSIDE the field's border, in
// that order from the inside out; the field keeps its width when the clear button comes and goes;
// the ✕ is as large as the field's icon; the spinner stands in the field, not beside the label.

import AxeBuilder from "@axe-core/playwright";
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

// The ✕ and the steppers show their icon as large as the field's, yet stay a target for the
// pointer (WCAG 2.2, 2.5.8): at least size.target.min, their control inside their part.
test("every button at the end of a field is a target of at least 24 × 24, its control inside it (axe target-size)", async ({
  page,
}) => {
  await serve(
    page,
    out,
    [
      ...["kampo", "elektilo", "listelektilo", "kompletigilo", "datelektilo"].map((ero) =>
        (BOXED[ero] ?? "").replace(" loading", ""),
      ),
      '<fm-kampo kind="number" stepper value="3">Anzahl</fm-kampo>',
      '<fm-elektilo clearable size="small" value="deutschland">Land klein<option value="deutschland">Deutschland</option></fm-elektilo>',
    ].join(""),
  );
  await page.waitForTimeout(50);
  const buttons = await page.evaluate(() =>
    [...document.querySelectorAll("body *")].flatMap((host) =>
      [...(host.shadowRoot?.querySelectorAll("fm-butono") ?? [])]
        .filter((button) => !(button as HTMLElement).hidden && !button.closest('[part="calendar"]'))
        .map((button) => {
          const outer = button.getBoundingClientRect();
          const control = button.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
          const inner = control.getBoundingClientRect();
          return {
            name: `${host.localName} ${button.getAttribute("part")}`,
            width: outer.width,
            height: outer.height,
            inside: inner.width <= outer.width + 0.5 && inner.height <= outer.height + 0.5,
          };
        }),
    ),
  );
  expect(buttons.length).toBeGreaterThanOrEqual(8);
  for (const button of buttons) {
    expect(button.width, button.name).toBeGreaterThanOrEqual(24);
    expect(button.height, button.name).toBeGreaterThanOrEqual(24);
    expect(button.inside, button.name).toBe(true);
  }
  const axe = await new AxeBuilder({ page }).withRules(["target-size"]).analyze();
  expect(axe.violations.map((violation) => violation.id)).toEqual([]);
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
        const field = (root.querySelector('[part="field"]') as HTMLElement).getBoundingClientRect();
        const s = spinner.getBoundingClientRect();
        const l = label.getBoundingClientRect();
        const z = zone?.getBoundingClientRect();
        return {
          inLabel: label.contains(spinner),
          visible: s.width > 0 && !spinner.hidden,
          // At the end of the field: after the label in its line, or at the field's inline end
          // (a label that spans the field, the slider's and the choice's).
          after: s.left >= l.right - 0.5 || Math.abs(s.right - field.right) <= 1,
          inZone:
            z === undefined
              ? true
              : s.left >= z.left && s.right <= z.right && s.top >= z.top && s.bottom <= z.bottom,
        };
      });
      expect(spot.visible, "shows").toBe(true);
      expect(spot.inLabel, "not in the label").toBe(false);
      expect(spot.after, "at the end of the field").toBe(true);
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
