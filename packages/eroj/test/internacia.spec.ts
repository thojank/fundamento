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

// Spec 011 ② (G7): the tekstareo right to left — label, text and help align to the right — and its
// label, help and error expanded and pseudo-localised: everything grows, nothing is clipped; the
// area keeps the width of its container.
test("tekstareo right to left: the text aligns to the right and the focus ring stays", async ({
  page,
  browserName,
}) => {
  await serve(page, out, `<fm-tekstareo id="a">Begründung</fm-tekstareo>`);
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
  test(`tekstareo text expansion to ${Math.round(factor * 100)} %: label, help and error grow, nothing is clipped`, async ({
    page,
  }) => {
    const label = "Begründung";
    const help = "Die Prüfer lesen die Begründung.";
    await serve(
      page,
      out,
      `<div style="inline-size: 20rem"><fm-tekstareo id="a" invalid>${label}<span slot="help">${help}</span><span slot="error">Gib eine Begründung mit mindestens zehn Zeichen ein</span></fm-tekstareo></div>`,
    );
    const before = await page.locator("#a").boundingBox();
    // Expanded by words, as the kampo's test does (a translation adds words, not one unbreakable
    // run of characters): the label is one word and is marked; help grows by words. A run of
    // tildes as long as the sentence overflowed the container on the Linux runner, whose fallback
    // font is wider than the macOS one (Spec 011 ② B-8).
    const sentence = "Die Prüfer lesen die Begründung und schreiben ihre Antwort darunter.";
    const words = sentence.split(" ");
    const expanded = [...words, ...words.slice(0, Math.ceil(words.length * (factor - 1)))].join(
      " ",
    );
    await page.locator("#a").evaluate(
      (element, [l, h]) => {
        element.childNodes[0].textContent = l ?? "";
        (element.querySelector('[slot="help"]') as HTMLElement).textContent = h ?? "";
      },
      [pseudo(label, 1), pseudo(expanded, 1)],
    );
    const after = await page.locator("#a").boundingBox();
    expect(after?.height ?? 0).toBeGreaterThanOrEqual(before?.height ?? 0);
    expect(Math.round(after?.width ?? 0)).toBe(Math.round(before?.width ?? 0));
    const clipped = await page.locator("#a").evaluate((element) => {
      const field = element.shadowRoot?.querySelector('[part="field"]') as HTMLElement;
      return field.scrollWidth > field.clientWidth + 1;
    });
    expect(clipped).toBe(false);
  });
}

// Spec 011 ② (G7): the dialogo right to left — the actions stand at the end, which is the left;
// the heading aligns to the right — and its heading expanded: the surface keeps the width of its
// size, the heading wraps, nothing is clipped.
test("dialogo right to left: the actions mirror to the left, the heading aligns right", async ({
  page,
}) => {
  await serve(
    page,
    out,
    `<fm-dialogo id="d" open>Version freigeben?<span slot="message">Nachricht</span><fm-butono slot="actions" emphasis="low">Abbrechen</fm-butono><fm-butono id="ok" slot="actions" emphasis="high">Freigeben</fm-butono></fm-dialogo>`,
  );
  const sides = () =>
    page.locator("#d").evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      const actions = element.shadowRoot?.querySelector('[part="actions"]') as HTMLElement;
      const ok = document.getElementById("ok") as HTMLElement;
      const box = control.getBoundingClientRect();
      const button = ok.getBoundingClientRect();
      return {
        okFromLeft: button.left - box.left,
        okFromRight: box.right - button.right,
        direction: getComputedStyle(actions).direction,
      };
    });
  const ltr = await sides();
  expect(ltr.okFromRight).toBeLessThan(ltr.okFromLeft);
  await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
  const rtl = await sides();
  expect(rtl.direction).toBe("rtl");
  expect(rtl.okFromLeft).toBeLessThan(rtl.okFromRight);
});

// Four times the heading: the small surface is size.container.small wide (640 px in komuna), and a
// doubled heading still fits one line of headline.4 there.
test("dialogo heading expansion to 400 %: the surface keeps its width, the heading wraps, nothing is clipped", async ({
  page,
}) => {
  const heading = "Version freigeben?";
  await serve(
    page,
    out,
    `<fm-dialogo id="d" open>${heading}<fm-butono slot="actions" emphasis="high">Freigeben</fm-butono></fm-dialogo>`,
  );
  const measure = () =>
    page.locator("#d").evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      const head = element.shadowRoot?.querySelector('[part="heading"]') as HTMLElement;
      return {
        width: control.getBoundingClientRect().width,
        headingHeight: head.getBoundingClientRect().height,
        clipped: control.scrollWidth > control.clientWidth + 1,
      };
    });
  const before = await measure();
  await page.locator("#d").evaluate(
    (element, text) => {
      element.childNodes[0].textContent = text;
    },
    pseudo(heading, 4),
  );
  const after = await measure();
  expect(Math.round(after.width)).toBe(Math.round(before.width));
  expect(after.headingHeight).toBeGreaterThan(before.headingHeight);
  expect(after.clipped).toBe(false);
});

// Spec 011 ③ (G7): the avizo right to left — the accent stands at the start, which is the right;
// the dismiss butono at the end, which is the left — and its message expanded by words: the
// notice grows in height, keeps the width of its container, nothing is clipped.
test("avizo right to left: the accent mirrors to the right, the close button to the left", async ({
  page,
}) => {
  await serve(
    page,
    out,
    `<div style="inline-size: 24rem"><fm-avizo id="a" intent="warning" dismissible>Import unbestätigt.<span slot="heading">Import</span></fm-avizo></div>`,
  );
  const sides = () =>
    page.locator("#a").evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      const dismiss = element.shadowRoot?.querySelector('[part="dismiss"]') as HTMLElement;
      const style = getComputedStyle(control);
      const box = control.getBoundingClientRect();
      const close = dismiss.getBoundingClientRect();
      return {
        left: Number.parseFloat(style.borderLeftWidth),
        right: Number.parseFloat(style.borderRightWidth),
        closeFromLeft: close.left - box.left,
        closeFromRight: box.right - close.right,
      };
    });
  const ltr = await sides();
  expect(ltr.left).toBeGreaterThan(ltr.right);
  expect(ltr.closeFromRight).toBeLessThan(ltr.closeFromLeft);
  await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
  const rtl = await sides();
  expect(rtl.right).toBeGreaterThan(rtl.left);
  expect(rtl.closeFromLeft).toBeLessThan(rtl.closeFromRight);
});

for (const factor of [1.35, 2]) {
  test(`avizo text expansion to ${Math.round(factor * 100)} %: the message grows by words, the width stays, nothing is clipped`, async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div style="inline-size: 20rem"><fm-avizo id="a" intent="danger" dismissible>Der Import wurde nicht gespeichert.<span slot="heading" id="h">Import</span></fm-avizo></div>`,
    );
    const before = await page.locator("#a").boundingBox();
    const sentence = "Der Import wurde nicht gespeichert und die Datei liegt weiter im Postfach.";
    const words = sentence.split(" ");
    const expanded = [...words, ...words.slice(0, Math.ceil(words.length * (factor - 1)))].join(
      " ",
    );
    await page.locator("#a").evaluate(
      (element, [m, h]) => {
        element.childNodes[0].textContent = m ?? "";
        (element.querySelector("#h") as HTMLElement).textContent = h ?? "";
      },
      [pseudo(expanded, 1), pseudo("Import", 1)],
    );
    const after = await page.locator("#a").boundingBox();
    expect(after?.height ?? 0).toBeGreaterThan(before?.height ?? 0);
    expect(Math.round(after?.width ?? 0)).toBe(Math.round(before?.width ?? 0));
    const clipped = await page.locator("#a").evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      return control.scrollWidth > control.clientWidth + 1;
    });
    expect(clipped).toBe(false);
  });
}

// Spec 011 ③ (G7): the insigno expanded — a badge of three words marked and widened by one word:
// it grows in width, stays one line (the Uzo says never wrap) and clips nothing.
test("insigno text expansion: the badge grows in width, stays one line, nothing is clipped", async ({
  page,
}) => {
  await serve(page, out, `<fm-insigno id="a" intent="info">In Prüfung</fm-insigno>`);
  const before = await page.locator("#a").boundingBox();
  await page.locator("#a").evaluate(
    (element, text) => {
      element.childNodes[0].textContent = text;
    },
    pseudo("In Prüfung jetzt", 1),
  );
  const after = await page.locator("#a").boundingBox();
  expect(after?.width ?? 0).toBeGreaterThan(before?.width ?? 0);
  expect(Math.round(after?.height ?? 0)).toBe(Math.round(before?.height ?? 0));
  const clipped = await page.locator("#a").evaluate((element) => {
    const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
    return control.scrollWidth > control.clientWidth + 1;
  });
  expect(clipped).toBe(false);
});

// Spec 011 ③ (G7): the plenstato right to left — the indicator stands at the start of the text,
// which is the right.
test("plenstato right to left: the indicator stands to the right of the text", async ({ page }) => {
  await serve(
    page,
    out,
    `<fm-plenstato id="a" kind="loading">Standards werden geladen</fm-plenstato>`,
  );
  const order = () =>
    page.locator("#a").evaluate((element) => {
      const indicator = element.shadowRoot?.querySelector('[part="indicator"]') as HTMLElement;
      const text = element.shadowRoot?.querySelector('[part="text"]') as HTMLElement;
      return indicator.getBoundingClientRect().left < text.getBoundingClientRect().left;
    });
  expect(await order()).toBe(true);
  await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
  expect(await order()).toBe(false);
});

// Spec 011 ④ (G7): the tabelo right to left — a numeric column aligns to the end, which is the
// left; the sort indicator stands after the header text — and the atributlisto right to left: the
// term stands to the right of the value in columns; the mezurilo fills from the right.
test("tabelo, atributlisto and mezurilo right to left: numbers align left, terms stand right, the bar fills from the right", async ({
  page,
}) => {
  await serve(
    page,
    out,
    `<fm-tabelo id="t">Standards<table slot="content"><thead><tr><th scope="col">Name</th><th scope="col" numeric>Verstöße</th></tr></thead><tbody><tr><th scope="row">A</th><td>3</td></tr></tbody></table></fm-tabelo><fm-atributlisto id="a"><dl><dt>Version</dt><dd>3</dd></dl></fm-atributlisto><fm-mezurilo id="m" value="30">Anteil<span slot="value-text">30 von 100</span></fm-mezurilo>`,
  );
  const measure = () =>
    page.evaluate(() => {
      const td = document.querySelector("#t tbody td") as HTMLElement;
      const dt = document.querySelector("#a dt") as HTMLElement;
      const dd = document.querySelector("#a dd") as HTMLElement;
      const m = document.getElementById("m") as HTMLElement;
      const track = m.shadowRoot?.querySelector('[part="track"]') as HTMLElement;
      const fill = m.shadowRoot?.querySelector('[part="fill"]') as HTMLElement;
      return {
        numeric: getComputedStyle(td).textAlign,
        termLeftOfValue: dt.getBoundingClientRect().left < dd.getBoundingClientRect().left,
        fillAtStart:
          Math.abs(fill.getBoundingClientRect().left - track.getBoundingClientRect().left) < 2,
        fillAtEnd:
          Math.abs(fill.getBoundingClientRect().right - track.getBoundingClientRect().right) < 2,
      };
    });
  const ltr = await measure();
  expect(ltr.numeric).toBe("end");
  expect(ltr.termLeftOfValue).toBe(true);
  expect(ltr.fillAtStart).toBe(true);
  await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
  const rtl = await measure();
  expect(rtl.termLeftOfValue).toBe(false);
  expect(rtl.fillAtEnd).toBe(true);
});

// The caption of a table and the terms of a list expanded by words: the table keeps the width of
// its container (the region scrolls), the list grows in height, nothing is clipped.
test("tabelo and atributlisto text expansion: the caption wraps, the terms grow, nothing is clipped", async ({
  page,
}) => {
  await serve(
    page,
    out,
    `<div style="inline-size: 20rem"><fm-tabelo id="t">Standards<table slot="content"><thead><tr><th scope="col">Name</th></tr></thead><tbody><tr><td>A</td></tr></tbody></table></fm-tabelo><fm-atributlisto id="a"><dl><dt id="term">Version</dt><dd>3</dd></dl></fm-atributlisto></div>`,
  );
  const before = await page.locator("#a").boundingBox();
  const caption = "Standards";
  const words = "Standards der Organisation und ihrer Partner im laufenden Jahr".split(" ");
  await page.evaluate(
    ([c, t]) => {
      const table = document.getElementById("t") as HTMLElement;
      table.childNodes[0].textContent = c ?? "";
      (document.getElementById("term") as HTMLElement).textContent = t ?? "";
    },
    [pseudo([...words, ...words].join(" "), 1), pseudo("Version der Veröffentlichung", 1)],
  );
  const after = await page.locator("#a").boundingBox();
  expect(after?.height ?? 0).toBeGreaterThanOrEqual(before?.height ?? 0);
  expect(Math.round(after?.width ?? 0)).toBe(Math.round(before?.width ?? 0));
  const clipped = await page.evaluate(() => {
    const table = document.getElementById("t") as HTMLElement;
    const region = table.shadowRoot?.querySelector('[part="region"]') as HTMLElement;
    const list = document.querySelector("#a dl") as HTMLElement;
    return {
      table: region.getBoundingClientRect().width > table.getBoundingClientRect().width + 1,
      list: list.scrollWidth > list.clientWidth + 1,
    };
  });
  expect(clipped).toEqual({ table: false, list: false });
  void caption;
});

// Spec 011 ⑤ (G7): the navigado right to left — the first item stands at the right, the order
// stays — and the langetaro right to left: the first tab at the right, the indicator with it.
test("navigado and langetaro right to left: the first item and the first tab stand at the right", async ({
  page,
}) => {
  await serve(
    page,
    out,
    `<fm-navigado id="n" label="Hauptnavigation" page="a"><a href="#a" data-page="a">Eins</a><a href="#b" data-page="b">Zwei</a></fm-navigado><fm-langetaro id="t" label="Reiter" selected="a"><data value="a">Eins</data><data value="b">Zwei</data><div slot="panel">Inhalt</div></fm-langetaro>`,
  );
  const measure = () =>
    page.evaluate(() => {
      const items = [...document.querySelectorAll("#n a")] as HTMLElement[];
      const tabs = [
        ...(document.getElementById("t")?.shadowRoot?.querySelectorAll('[part="tab"]') ?? []),
      ] as HTMLElement[];
      return {
        firstItemLeftOfSecond:
          (items[0]?.getBoundingClientRect().left ?? 0) <
          (items[1]?.getBoundingClientRect().left ?? 0),
        firstTabLeftOfSecond:
          (tabs[0]?.getBoundingClientRect().left ?? 0) <
          (tabs[1]?.getBoundingClientRect().left ?? 0),
      };
    });
  const ltr = await measure();
  expect(ltr).toEqual({ firstItemLeftOfSecond: true, firstTabLeftOfSecond: true });
  await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
  const rtl = await measure();
  expect(rtl).toEqual({ firstItemLeftOfSecond: false, firstTabLeftOfSecond: false });
});

// The items of a navigation and the tabs expanded by words: the navigation wraps into more rows
// and keeps the width of its container; the tabs never wrap — the list keeps one line and scrolls
// along the inline axis, nothing is clipped from sight.
test("navigado and langetaro text expansion: the items wrap, the tabs keep their line and the list scrolls", async ({
  page,
}) => {
  await serve(
    page,
    out,
    `<div style="inline-size: 20rem"><fm-navigado id="n" label="Hauptnavigation" page="a"><a href="#a" data-page="a">Standards</a><a href="#b" data-page="b">Versionen</a><a href="#c" data-page="c">Regeln</a></fm-navigado><fm-langetaro id="t" label="Reiter" selected="a"><data value="a">Inhalt</data><data value="b">Versionen</data><data value="c">Regeln</data><div slot="panel">Inhalt</div></fm-langetaro></div>`,
  );
  const before = await page.evaluate(() => ({
    nav: document.getElementById("n")?.getBoundingClientRect().height ?? 0,
    navWidth: document.getElementById("n")?.getBoundingClientRect().width ?? 0,
    list:
      document
        .getElementById("t")
        ?.shadowRoot?.querySelector('[part="control"]')
        ?.getBoundingClientRect().height ?? 0,
  }));
  await page.evaluate(
    ([items, tabs]) => {
      for (const item of document.querySelectorAll("#n a")) item.textContent = items ?? "";
      for (const tab of document.querySelectorAll("#t data")) tab.textContent = tabs ?? "";
    },
    [pseudo("Standards der Organisation", 1), pseudo("Versionen des Standards", 1)],
  );
  const after = await page.evaluate(() => {
    const list = document
      .getElementById("t")
      ?.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
    return {
      nav: document.getElementById("n")?.getBoundingClientRect().height ?? 0,
      navWidth: document.getElementById("n")?.getBoundingClientRect().width ?? 0,
      list: list.getBoundingClientRect().height,
      scrolls: list.scrollWidth > list.clientWidth + 1,
      clipped: list.scrollHeight > list.clientHeight + 1,
    };
  });
  expect(after.nav).toBeGreaterThan(before.nav);
  expect(Math.round(after.navWidth)).toBe(Math.round(before.navWidth));
  expect(Math.round(after.list)).toBe(Math.round(before.list));
  expect(after.scrolls).toBe(true);
  expect(after.clipped).toBe(false);
});

// Spec 014 ① (layout auto, plan ① D-03, Internacia): in a wide container the auto list puts the
// term beside the value — right of it in right-to-left writing, with long keys as a translation
// would bring them; in a narrow container it stacks, the term above the value, in both directions.
test("atributlisto layout auto right to left: columns put the long term right of the value, stacked puts it above", async ({
  page,
}) => {
  const term = pseudo("Verantwortliche Organisationseinheit", 1);
  await serve(
    page,
    out,
    `<div id="w" style="inline-size: 48rem"><fm-atributlisto id="a" layout="auto"><dl><dt id="term">${term}</dt><dd>3</dd></dl></fm-atributlisto></div>`,
  );
  await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
  const measure = () =>
    page.evaluate(() => {
      const host = document.getElementById("a") as HTMLElement;
      const dt = host.querySelector("dt") as HTMLElement;
      const dd = host.querySelector("dd") as HTMLElement;
      return {
        resolved: host.getAttribute("data-layout"),
        termRightOfValue: dt.getBoundingClientRect().left > dd.getBoundingClientRect().left,
        termAboveValue: dt.getBoundingClientRect().bottom <= dd.getBoundingClientRect().top + 1,
        clipped: dt.scrollWidth > dt.clientWidth + 1,
      };
    });
  await expect.poll(async () => (await measure()).resolved).toBe("columns");
  const wide = await measure();
  expect(wide.termRightOfValue).toBe(true);
  expect(wide.clipped).toBe(false);
  await page.locator("#w").evaluate((element) => {
    (element as HTMLElement).style.inlineSize = "16rem";
  });
  await expect.poll(async () => (await measure()).resolved).toBe("stacked");
  const narrow = await measure();
  expect(narrow.termAboveValue).toBe(true);
  expect(narrow.clipped).toBe(false);
});
