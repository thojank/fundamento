// Internacia in the browser (Spec 003 T014; FR-16, AK-06): right-to-left, text expansion and
// pseudo-localisation. Chromium, Firefox, WebKit.

import { expect, test } from "@playwright/test";
import { TAB } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

/** Pseudo-localisation: accented and non-Latin characters, padded to `factor` of the length. */
function pseudo(text: string, factor: number): string {
  const map: Record<string, string> = { a: "à", c: "ç", e: "é", i: "ï", o: "ö", s: "ſ", u: "ü" };
  const marked = [...text].map((character) => map[character.toLowerCase()] ?? character).join("");
  const padding = "~".repeat(Math.max(0, Math.ceil(text.length * (factor - 1))));
  return `[${marked}${padding ? ` ${padding}` : ""}]`;
}

test("right to left: icon-start sits on the right and the focus ring stays", async ({
  page,
  browserName,
}) => {
  await serve(
    page,
    out,
    `<fm-butono id="a"><svg id="icon" slot="icon-start" aria-hidden="true" width="16" height="16"></svg>Speichern</fm-butono>`,
  );
  const left = await page.locator("#icon").boundingBox();
  await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
  const right = await page.locator("#icon").boundingBox();
  const host = await page.locator("#a").boundingBox();
  expect(left?.x ?? 0).toBeLessThan((host?.x ?? 0) + (host?.width ?? 0) / 2);
  expect(right?.x ?? 0).toBeGreaterThan((host?.x ?? 0) + (host?.width ?? 0) / 2);
  await page.keyboard.press(TAB(browserName));
  const outline = await page
    .locator("#a")
    .evaluate(
      (element) =>
        getComputedStyle(element.shadowRoot?.querySelector('[part="control"]') as Element)
          .outlineWidth,
    );
  expect(Number.parseFloat(outline)).toBeGreaterThan(0);
});

for (const factor of [1.35, 2]) {
  test(`text expansion to ${Math.round(factor * 100)} %: the button grows, nothing is clipped`, async ({
    page,
  }) => {
    const label = "Speichern";
    await serve(page, out, `<fm-butono id="a">${label}</fm-butono>`);
    const before = await page.locator("#a").boundingBox();
    await page.locator("#a").evaluate(
      (element, text) => {
        element.textContent = text;
      },
      pseudo(label, factor),
    );
    const after = await page.locator("#a").boundingBox();
    expect(after?.width ?? 0).toBeGreaterThan(before?.width ?? 0);
    const clipped = await page.locator("#a").evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      return (
        control.scrollWidth > control.clientWidth + 1 ||
        control.scrollHeight > control.clientHeight + 1
      );
    });
    expect(clipped).toBe(false);
  });
}

// Spec 008 T023 (A6): the ligilo right to left, expanded and pseudo-localised; inline it breaks
// with the text, standalone it grows and clips nothing.
test("ligilo right to left: icon-end sits on the left and the focus ring stays", async ({
  page,
  browserName,
}) => {
  await serve(
    page,
    out,
    `<fm-ligilo id="a" to="#a" placement="standalone">Projektübersicht<svg id="icon" slot="icon-end" aria-hidden="true" width="16" height="16"></svg></fm-ligilo>`,
  );
  const controlBox = () =>
    page.locator("#a").evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]');
      if (!(control instanceof Element)) throw new Error("no control");
      return control.getBoundingClientRect().toJSON() as { x: number; width: number };
    });
  const right = await page.locator("#icon").boundingBox();
  const ltr = await controlBox();
  await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
  const left = await page.locator("#icon").boundingBox();
  const rtl = await controlBox();
  // The host is inline (D-04), so the control's box is measured, not the host's.
  expect(right?.x ?? 0).toBeGreaterThan(ltr.x + ltr.width / 2);
  expect(left?.x ?? 0).toBeLessThan(rtl.x + rtl.width / 2);
  await page.keyboard.press(TAB(browserName));
  const outline = await page
    .locator("#a")
    .evaluate(
      (element) =>
        getComputedStyle(element.shadowRoot?.querySelector('[part="control"]') as Element)
          .outlineWidth,
    );
  expect(Number.parseFloat(outline)).toBeGreaterThan(0);
});

for (const factor of [1.35, 2]) {
  test(`ligilo text expansion to ${Math.round(factor * 100)} %: standalone grows, nothing is clipped; inline breaks with the text`, async ({
    page,
  }) => {
    const label = "Projektübersicht";
    await serve(
      page,
      out,
      `<fm-ligilo id="a" to="#a" placement="standalone">${label}</fm-ligilo><p style="inline-size: 10rem">Text mit <fm-ligilo id="b" to="#b">${label}</fm-ligilo> darin.</p>`,
    );
    const before = await page.locator("#a").boundingBox();
    for (const id of ["a", "b"]) {
      await page.locator(`#${id}`).evaluate(
        (element, text) => {
          element.textContent = text;
        },
        pseudo(label, factor),
      );
    }
    const after = await page.locator("#a").boundingBox();
    expect(after?.width ?? 0).toBeGreaterThan(before?.width ?? 0);
    const clipped = await page.locator("#a").evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      return (
        control.scrollWidth > control.clientWidth + 1 ||
        control.scrollHeight > control.clientHeight + 1
      );
    });
    expect(clipped).toBe(false);
    const lines = await page
      .locator("#b")
      .evaluate(
        (e) => e.shadowRoot?.querySelector('[part="control"]')?.getClientRects().length ?? 0,
      );
    expect(lines).toBeGreaterThan(1);
  });
}

// Spec 009 T014 (A6): the kampo right to left, with label, help and error expanded and
// pseudo-localised; the texts may break, the input line does not.
test("kampo right to left: the text aligns to the right and the focus ring stays", async ({
  page,
  browserName,
}) => {
  await serve(page, out, `<fm-kampo id="a" value="Erika">Name</fm-kampo>`);
  await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
  const direction = await page
    .locator("#a")
    .evaluate(
      (element) =>
        getComputedStyle(element.shadowRoot?.querySelector('[part="control"]') as Element)
          .direction,
    );
  expect(direction).toBe("rtl");
  await page.keyboard.press(TAB(browserName));
  const outline = await page
    .locator("#a")
    .evaluate(
      (element) =>
        getComputedStyle(element.shadowRoot?.querySelector('[part="control"]') as Element)
          .outlineWidth,
    );
  expect(Number.parseFloat(outline)).toBeGreaterThan(0);
});

for (const factor of [1.35, 2]) {
  test(`kampo text expansion to ${Math.round(factor * 100)} %: label, help and error grow, nothing is clipped`, async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div style="inline-size: 16rem"><fm-kampo id="a" invalid>E-Mail<span slot="help" id="h">Wir schreiben nur zur Bestellung.</span><span slot="error" id="e">Gib eine E-Mail-Adresse mit @ ein</span></fm-kampo></div>`,
    );
    const before = await page.locator("#a").boundingBox();
    for (const id of ["h", "e"]) {
      await page.locator(`#${id}`).evaluate(
        (element, text) => {
          element.textContent = text;
        },
        pseudo("Wir schreiben nur zur Bestellung und geben die Adresse nicht weiter.", factor),
      );
    }
    const after = await page.locator("#a").boundingBox();
    expect(after?.height ?? 0).toBeGreaterThan(before?.height ?? 0);
    const clipped = await page.locator("#a").evaluate((element) => {
      const field = element.shadowRoot?.querySelector('[part="field"]') as HTMLElement;
      return field.scrollWidth > field.clientWidth + 1;
    });
    expect(clipped).toBe(false);
  });
}
