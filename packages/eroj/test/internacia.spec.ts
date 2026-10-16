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
    expect(after?.width ?? 0).toBeGreaterThanOrEqual(before?.width ?? 0);
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
    expect(after?.width ?? 0).toBeGreaterThanOrEqual(before?.width ?? 0);
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
    // Expanded by words (a translation adds words, not one unbreakable run of characters).
    const sentence = "Wir schreiben nur zur Bestellung und geben die Adresse nicht weiter.";
    const words = sentence.split(" ");
    const expanded = [...words, ...words.slice(0, Math.ceil(words.length * (factor - 1)))].join(
      " ",
    );
    for (const id of ["h", "e"]) {
      await page.locator(`#${id}`).evaluate(
        (element, text) => {
          element.textContent = text;
        },
        pseudo(expanded, 1),
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

// Spec 010 ① (G7): the sxaltilo right to left — the knob starts on the right and ends on the
// left, the label stands at the start — and its label expanded and pseudo-localised: the switch
// grows with it, the label stays on one line (wrap never) and nothing is clipped.
test("sxaltilo right to left: track and knob mirror, the label stays at the start, the focus ring stays", async ({
  page,
  browserName,
}) => {
  await serve(page, out, `<fm-sxaltilo id="a">Benachrichtigungen</fm-sxaltilo>`);
  const sides = () =>
    page.locator("#a").evaluate((element) => {
      const track = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      const label = element.shadowRoot?.querySelector('[part="label"]') as HTMLElement;
      return {
        track: track.getBoundingClientRect().left,
        label: label.getBoundingClientRect().left,
      };
    });
  const ltr = await sides();
  expect(ltr.track).toBeLessThan(ltr.label);
  await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
  const rtl = await sides();
  expect(rtl.track).toBeGreaterThan(rtl.label);
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
  test(`sxaltilo text expansion to ${Math.round(factor * 100)} %: the label grows on one line, nothing is clipped`, async ({
    page,
  }) => {
    const label = "Benachrichtigungen";
    await serve(page, out, `<fm-sxaltilo id="a">${label}</fm-sxaltilo>`);
    const before = await page.locator("#a").boundingBox();
    await page.locator("#a").evaluate(
      (element, text) => {
        element.textContent = text;
      },
      pseudo(label, factor),
    );
    const after = await page.locator("#a").boundingBox();
    expect(after?.width ?? 0).toBeGreaterThanOrEqual(before?.width ?? 0);
    expect(after?.height ?? 0).toBeCloseTo(before?.height ?? 0, 0);
    const clipped = await page.locator("#a").evaluate((element) => {
      const field = element.shadowRoot?.querySelector('[part="field"]') as HTMLElement;
      return field.scrollWidth > field.clientWidth + 1;
    });
    expect(clipped).toBe(false);
  });
}

// Spec 010 ② (G7): the markobutono right to left — the box stands at the start, on the right,
// the label beside it — and its label expanded and pseudo-localised: the label breaks beside the
// box (Uzo wrap allowed), the box stays where it is and nothing is clipped.
test("markobutono right to left: the box mirrors to the right, the label stays beside it, the focus ring stays", async ({
  page,
  browserName,
}) => {
  await serve(page, out, `<fm-markobutono id="a">Newsletter</fm-markobutono>`);
  const sides = () =>
    page.locator("#a").evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      const label = element.shadowRoot?.querySelector('[part="label"]') as HTMLElement;
      return {
        control: control.getBoundingClientRect().left,
        label: label.getBoundingClientRect().left,
      };
    });
  const ltr = await sides();
  expect(ltr.control).toBeLessThan(ltr.label);
  await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
  const rtl = await sides();
  expect(rtl.control).toBeGreaterThan(rtl.label);
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

// The padding of the expansion comes in words here: a label that wraps breaks between words; a
// single word longer than the line is a Befund (plan ② B-4: overflow-wrap is not on the
// structural allowlist of the Ero stylesheet rule), not something this test hides.
const pseudoWords = (text: string, factor: number) =>
  pseudo(text, 1).replace(
    /\]$/,
    ` ${"~~~~ ".repeat(Math.ceil((text.length * (factor - 1)) / 5)).trim()}]`,
  );

for (const factor of [1.35, 2]) {
  test(`markobutono text expansion to ${Math.round(factor * 100)} %: the label breaks beside the box, nothing is clipped`, async ({
    page,
  }) => {
    const label = "Ich akzeptiere die Allgemeinen Geschäftsbedingungen";
    await serve(
      page,
      out,
      `<div style="inline-size: 16rem"><fm-markobutono id="a">${label}</fm-markobutono></div>`,
    );
    const before = await page.locator("#a").boundingBox();
    await page.locator("#a").evaluate(
      (element, text) => {
        element.textContent = text;
      },
      pseudoWords(label, factor),
    );
    const after = await page.locator("#a").boundingBox();
    expect(after?.height ?? 0).toBeGreaterThan(before?.height ?? 0);
    expect(after?.width ?? 0).toBeLessThanOrEqual(16 * 16 + 1);
    const clipped = await page.locator("#a").evaluate((element) => {
      const field = element.shadowRoot?.querySelector('[part="field"]') as HTMLElement;
      return field.scrollWidth > field.clientWidth + 1;
    });
    expect(clipped).toBe(false);
  });
}

// Spec 010 ③ (G7): the elekto right to left — each circle stands at the start, on the right, its
// label beside it — and its option labels expanded and pseudo-localised: no option breaks (Uzo wrap
// never), the group grows with its content and nothing inside it is clipped.
const RADIO_OPTIONS =
  '<data slot="options" value="1">Standard</data><data slot="options" value="2">Express</data><data slot="options" value="3">Abholung</data>';

test("elekto right to left: the circles mirror to the right, the labels stay beside them, the focus ring stays", async ({
  page,
  browserName,
}) => {
  await serve(page, out, `<fm-elekto id="a" value="1">Versandart${RADIO_OPTIONS}</fm-elekto>`);
  const sides = () =>
    page.locator("#a").evaluate((element) => {
      const row = element.shadowRoot?.querySelector('[part="option"]') as HTMLElement;
      const control = row.querySelector('[part="control"]') as HTMLElement;
      const label = row.querySelector('[part="option-label"]') as HTMLElement;
      return {
        control: control.getBoundingClientRect().left,
        label: label.getBoundingClientRect().left,
      };
    });
  const ltr = await sides();
  expect(ltr.control).toBeLessThan(ltr.label);
  await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
  const rtl = await sides();
  expect(rtl.control).toBeGreaterThan(rtl.label);
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
  test(`elekto text expansion to ${Math.round(factor * 100)} %: no option breaks, nothing is clipped`, async ({
    page,
  }) => {
    await serve(page, out, `<fm-elekto id="a" value="1">Versandart${RADIO_OPTIONS}</fm-elekto>`);
    const before = await page.locator("#a").boundingBox();
    await page.locator("#a").evaluate(
      (element, labels) => {
        element.querySelectorAll('[slot="options"]').forEach((option, index) => {
          option.textContent = labels[index] ?? "";
        });
      },
      ["Standard", "Express", "Abholung"].map((label) => pseudo(label, factor)),
    );
    const after = await page.locator("#a").boundingBox();
    expect(after?.height ?? 0).toBeCloseTo(before?.height ?? 0, 0);
    expect(after?.width ?? 0).toBeGreaterThanOrEqual(before?.width ?? 0);
    const clipped = await page.locator("#a").evaluate((element) => {
      const field = element.shadowRoot?.querySelector('[part="field"]') as HTMLElement;
      return field.scrollWidth > field.clientWidth + 1;
    });
    expect(clipped).toBe(false);
  });
}

// Spec 010 ④ (G7): the elektilo right to left — the chevron mirrors to the start of the line, on
// the left, inside the field, the text of the select aligns to the right — and its options
// expanded and pseudo-localised: the field keeps its line (wrap never), its width from the
// container, the chosen option and the chevron stay inside it and nothing is clipped.
const SELECT_OPTIONS =
  '<data slot="options" value="de">Deutschland</data><data slot="options" value="at">Österreich</data><data slot="options" value="ch">Schweiz</data>';

test("elektilo right to left: the chevron mirrors to the left inside the field, the focus ring stays", async ({
  page,
  browserName,
}) => {
  await serve(
    page,
    out,
    `<div style="inline-size: 16rem"><fm-elektilo id="a" value="at">Land${SELECT_OPTIONS}</fm-elektilo></div>`,
  );
  const sides = () =>
    page.locator("#a").evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      const chevron = element.shadowRoot?.querySelector('[part="indicator"]') as HTMLElement;
      const c = control.getBoundingClientRect();
      const n = chevron.getBoundingClientRect();
      return {
        direction: getComputedStyle(control).direction,
        toStart: n.left - c.left,
        toEnd: c.right - n.right,
        inside: n.left >= c.left && n.right <= c.right,
      };
    });
  const ltr = await sides();
  expect(ltr.inside).toBe(true);
  expect(ltr.toEnd).toBeLessThan(ltr.toStart);
  await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
  const rtl = await sides();
  expect(rtl.direction).toBe("rtl");
  expect(rtl.inside).toBe(true);
  expect(rtl.toStart).toBeLessThan(rtl.toEnd);
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
  test(`elektilo text expansion to ${Math.round(factor * 100)} %: the field keeps its line and width, nothing is clipped`, async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div id="w" style="inline-size: 16rem"><fm-elektilo id="a" value="at">Land${SELECT_OPTIONS}</fm-elektilo></div>`,
    );
    const control = () =>
      page.locator("#a").evaluate((element) => {
        const select = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        const chevron = element.shadowRoot?.querySelector('[part="indicator"]') as HTMLElement;
        const c = select.getBoundingClientRect();
        const n = chevron.getBoundingClientRect();
        const field = element.shadowRoot?.querySelector('[part="field"]') as HTMLElement;
        return {
          width: c.width,
          height: c.height,
          inside: n.left >= c.left && n.right <= c.right,
          clipped: field.scrollWidth > field.clientWidth + 1,
        };
      });
    const before = await control();
    await page.locator("#a").evaluate(
      (element, labels) => {
        element.querySelectorAll('[slot="options"]').forEach((option, index) => {
          option.textContent = labels[index] ?? "";
        });
      },
      ["Deutschland", "Österreich", "Schweiz"].map((label) => pseudo(label, factor)),
    );
    await expect
      .poll(() =>
        page.locator("#a").evaluate((element) => {
          const select = element.shadowRoot?.querySelector('[part="control"]');
          return select instanceof HTMLSelectElement
            ? (select.selectedOptions[0]?.textContent ?? "")
            : "";
        }),
      )
      .toMatch(/^\[/);
    const after = await control();
    expect(after.width).toBeCloseTo(before.width, 0);
    expect(after.height).toBeCloseTo(before.height, 0);
    expect(after.inside).toBe(true);
    expect(after.clipped).toBe(false);
  });
}

// Spec 011 ① (O-8, plan ② B-4 of Spec 010): a single word longer than the line — a long compound,
// a pseudo-localised chain of tildes — breaks inside the word now (overflow-wrap on the label of a
// label that may wrap), so the box stays in its container and nothing is clipped.
test("markobutono: a single word longer than the line breaks inside the word, nothing is clipped", async ({
  page,
}) => {
  await serve(
    page,
    out,
    `<div id="w" style="inline-size: 12rem"><fm-markobutono id="a">Datenschutzgrundverordnungseinwilligungserklärung~~~~~~~~~~~~~~~~~~~~</fm-markobutono></div>`,
  );
  const outer = await page.locator("#w").boundingBox();
  const host = await page.locator("#a").boundingBox();
  expect(host?.width ?? 0).toBeLessThanOrEqual((outer?.width ?? 0) + 1);
  const lines = await page.locator("#a").evaluate((element) => {
    const label = element.shadowRoot?.querySelector('[part="label"]') as HTMLElement;
    const field = element.shadowRoot?.querySelector('[part="field"]') as HTMLElement;
    return {
      height: label.getBoundingClientRect().height,
      lineHeight: Number.parseFloat(getComputedStyle(label).lineHeight),
      clipped: field.scrollWidth > field.clientWidth + 1,
    };
  });
  expect(lines.height).toBeGreaterThan(lines.lineHeight * 1.5);
  expect(lines.clipped).toBe(false);
});
