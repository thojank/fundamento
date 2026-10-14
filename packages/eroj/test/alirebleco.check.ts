// check:alirebleco-eroj (Spec 003 T013; FR-15, plan D-09, AK-05): the rendered fm-butono in every
// colour class of komuna and ekzemplo. axe-core with the WCAG 2.2 A/AA tags on every emphasis ×
// intent × size in rest, hover, pressed, disabled and loading; the focus ring contrasts at least 3:1
// with the gap colour and with the page background. Chromium, Firefox, WebKit. The first tests
// prove the harness finds what it must find.

import { boundToken, combinationsOf } from "@fundamento/modelo";
import { expect, test } from "@playwright/test";
import { axeViolations, contrast as contrastOf, focusRingContrasts, TAB } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const butono = input.modelo.eroj.find((entry) => entry.ero.name === "butono");
if (butono === undefined) throw new Error("butono missing");
const combos = combinationsOf(butono.skemo, ["emphasis", "intent", "size"]);
const buttons = combos
  .map(
    (c, i) =>
      `<fm-butono id="b${i}" emphasis="${c.emphasis}" intent="${c.intent}" size="${c.size}">Aktion ${i}</fm-butono>`,
  )
  .join(" ");

test.describe("the harness finds what it must find", () => {
  test("axe reports a label without contrast", async ({ page }) => {
    await serve(
      page,
      out,
      `<fm-butono emphasis="high">Speichern</fm-butono>`,
      "<style>:root { --fm-color-action-primary-text: var(--fm-color-action-primary-hover); }</style>",
    );
    expect(await axeViolations(page)).toContain("color-contrast");
  });

  test("axe reports an icon-only button without a name", async ({ page }) => {
    await serve(
      page,
      out,
      `<fm-butono><svg slot="icon-start" aria-hidden="true"></svg></fm-butono>`,
    );
    expect(await axeViolations(page)).toContain("button-name");
  });

  test("the ring check reports a ring in the gap colour", async ({ page, browserName }) => {
    await serve(
      page,
      out,
      `<fm-butono id="a">A</fm-butono>`,
      "<style>:root { --fm-focus-ring-color: var(--fm-color-focus-inner); }</style>",
    );
    await page.keyboard.press(TAB(browserName));
    const [ring] = await focusRingContrasts(page, ["#a"], browserName);
    expect(ring?.gap).toBeLessThan(3);
  });
});

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on every emphasis × intent × size and state, focus ring ≥ 3:1`, async ({
        page,
        browserName,
      }) => {
        await serve(page, out, buttons);
        await page.evaluate(
          ([a, s, c]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", c ?? "");
          },
          [aspekto, scheme, contrast],
        );
        expect(await axeViolations(page), "rest").toEqual([]);
        for (const [i] of combos.entries()) {
          const host = page.locator(`#b${i}`);
          await host.hover();
          expect(await axeViolations(page, `#b${i}`), `#b${i} hover`).toEqual([]);
          await page.mouse.down();
          expect(await axeViolations(page, `#b${i}`), `#b${i} pressed`).toEqual([]);
          await page.mouse.up();
        }
        await page.mouse.move(0, 0);
        for (const state of ["disabled", "loading"]) {
          await page.locator("fm-butono").evaluateAll((elements, s) => {
            for (const element of elements) element.toggleAttribute(s, true);
          }, state);
          expect(await axeViolations(page), state).toEqual([]);
          await page.locator("fm-butono").evaluateAll((elements, s) => {
            for (const element of elements) element.toggleAttribute(s, false);
          }, state);
        }
        const rings = await focusRingContrasts(
          page,
          combos.map((_c, i) => `#b${i}`),
          browserName,
        );
        expect(rings).toHaveLength(combos.length);
        for (const ring of rings) {
          expect(ring.gap, `${ring.selector} ring on gap`).toBeGreaterThanOrEqual(3);
          expect(ring.page, `${ring.selector} ring on page`).toBeGreaterThanOrEqual(3);
        }
        // The same tokens bind the label in every state (sanity: the Skemo is what we render).
        expect(
          boundToken(butono.skemo, "label", "color", { ...combos[0], state: "hover" }),
        ).toBeDefined();
      });
    }
  }
}

// Spec 008 T022 (A6): the rendered fm-ligilo in every colour class of komuna and ekzemplo: axe on
// every placement × size in rest, hover and pressed, external included; the focus ring of a
// standalone link contrasts at least 3:1 with the gap colour and with the page background.
const ligilo = input.modelo.eroj.find((entry) => entry.ero.name === "ligilo");
if (ligilo === undefined) throw new Error("ligilo missing");
const linkCombos = combinationsOf(ligilo.skemo, ["placement", "size"]);
const links = linkCombos
  .map(
    (c, i) =>
      `<p>Ein Satz mit <fm-ligilo id="l${i}" to="#l${i}" placement="${c.placement}" size="${c.size}">Ziel ${i}</fm-ligilo> darin.</p>`,
  )
  .join(" ")
  .concat(
    `<p><fm-ligilo id="ext" to="https://docs.example/" placement="standalone" external>Dokumentation</fm-ligilo></p>`,
  );

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on every placement × size and state of the ligilo, focus ring ≥ 3:1`, async ({
        page,
        browserName,
      }) => {
        // The running text around the inline links is the page's, in the page's text colour
        // (the butono page has no text of its own; a link lives in a sentence).
        await serve(
          page,
          out,
          links,
          "<style>body { color: var(--fm-color-text-default); }</style>",
        );
        await page.evaluate(
          ([a, s, c]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", c ?? "");
          },
          [aspekto, scheme, contrast],
        );
        expect(await axeViolations(page), "rest").toEqual([]);
        for (const [i] of linkCombos.entries()) {
          const host = page.locator(`#l${i}`);
          await host.hover();
          expect(await axeViolations(page, `#l${i}`), `#l${i} hover`).toEqual([]);
          await page.mouse.down();
          expect(await axeViolations(page, `#l${i}`), `#l${i} pressed`).toEqual([]);
          await page.mouse.up();
        }
        await page.mouse.move(0, 0);
        const standalone = linkCombos
          .map((c, i) => (c.placement === "standalone" ? `#l${i}` : undefined))
          .filter((id): id is string => id !== undefined);
        const rings = await focusRingContrasts(page, [...standalone, "#ext"], browserName);
        expect(rings).toHaveLength(standalone.length + 1);
        for (const ring of rings) {
          expect(ring.gap, `${ring.selector} ring on gap`).toBeGreaterThanOrEqual(3);
          expect(ring.page, `${ring.selector} ring on page`).toBeGreaterThanOrEqual(3);
        }
        expect(
          boundToken(ligilo.skemo, "label", "color", { ...linkCombos[0], state: "visited" })?.token,
        ).toBe("color.link.visited");
      });
    }
  }
}

// Spec 009 T014 (A6): the rendered fm-kampo in every colour class of komuna and ekzemplo: axe on
// every size in rest, hover, disabled, readonly and invalid, with help and error, required; the
// focus ring of the input contrasts at least 3:1 with the gap colour and with the page background.
const kampo = input.modelo.eroj.find((entry) => entry.ero.name === "kampo");
if (kampo === undefined) throw new Error("kampo missing");
const fieldCombos = combinationsOf(kampo.skemo, ["size"]);
const fields = fieldCombos
  .map(
    (c, i) =>
      `<fm-kampo id="f${i}" size="${c.size}" required placeholder="max@beispiel.example">E-Mail ${i}<span slot="help">Wir schreiben nur zur Bestellung.</span></fm-kampo>`,
  )
  .join(" ")
  .concat(
    `<fm-kampo id="ferr" invalid>Name<span slot="error">Gib einen Namen mit mindestens zwei Zeichen ein</span></fm-kampo>`,
  );

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on every size and state of the kampo, focus ring ≥ 3:1`, async ({
        page,
        browserName,
      }) => {
        await serve(
          page,
          out,
          fields,
          "<style>body { color: var(--fm-color-text-default); }</style>",
        );
        await page.evaluate(
          ([a, s, c]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", c ?? "");
          },
          [aspekto, scheme, contrast],
        );
        expect(await axeViolations(page), "rest").toEqual([]);
        for (const [i] of fieldCombos.entries()) {
          await page.locator(`#f${i}`).locator('[part="control"]').hover();
          expect(await axeViolations(page, `#f${i}`), `#f${i} hover`).toEqual([]);
        }
        await page.mouse.move(0, 0);
        for (const state of ["disabled", "readonly"]) {
          await page.locator("fm-kampo").evaluateAll((elements, s) => {
            for (const element of elements) element.toggleAttribute(s, true);
          }, state);
          expect(await axeViolations(page), state).toEqual([]);
          await page.locator("fm-kampo").evaluateAll((elements, s) => {
            for (const element of elements) element.toggleAttribute(s, false);
          }, state);
        }
        const rings = await focusRingContrasts(
          page,
          [...fieldCombos.map((_c, i) => `#f${i}`), "#ferr"],
          browserName,
        );
        expect(rings).toHaveLength(fieldCombos.length + 1);
        for (const ring of rings) {
          expect(ring.gap, `${ring.selector} ring on gap`).toBeGreaterThanOrEqual(3);
          expect(ring.page, `${ring.selector} ring on page`).toBeGreaterThanOrEqual(3);
        }
        expect(
          boundToken(kampo.skemo, "border", "color", { ...fieldCombos[0], state: "invalid" })
            ?.token,
        ).toBe("color.status.danger.border");
      });
    }
  }
}

// Spec 010 ① (G7, plan D-06): the rendered fm-sxaltilo in every colour class of komuna and
// ekzemplo: axe (role switch) on every size, checked and unchecked, in rest, hover and disabled;
// the focus ring of the track contrasts at least 3:1 with the gap colour and with the page; the
// knob contrasts at least 3:1 with its track, and the unchecked track's border with the page
// (WCAG 1.4.11: the knob's place is the state).
const sxaltilo = input.modelo.eroj.find((entry) => entry.ero.name === "sxaltilo");
if (sxaltilo === undefined) throw new Error("sxaltilo missing");
const switchCombos = combinationsOf(sxaltilo.skemo, ["checked", "size"]);
const switches = switchCombos
  .map(
    (c, i) =>
      `<fm-sxaltilo id="s${i}" size="${c.size}"${c.checked === "true" ? " checked" : ""}>Benachrichtigungen ${i}</fm-sxaltilo>`,
  )
  .join(" ");

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on every size of the sxaltilo, checked and not, focus ring and knob ≥ 3:1`, async ({
        page,
        browserName,
      }) => {
        await serve(
          page,
          out,
          switches,
          "<style>body { color: var(--fm-color-text-default); }</style>",
        );
        await page.evaluate(
          ([a, s, c]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", c ?? "");
          },
          [aspekto, scheme, contrast],
        );
        expect(await axeViolations(page), "rest").toEqual([]);
        for (const [i] of switchCombos.entries()) {
          await page.locator(`#s${i}`).locator('[part="control"]').hover();
          expect(await axeViolations(page, `#s${i}`), `#s${i} hover`).toEqual([]);
        }
        await page.mouse.move(0, 0);
        const parts = await page.locator("fm-sxaltilo").evaluateAll((elements) =>
          elements.map((element) => {
            const track = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
            const knob = element.shadowRoot?.querySelector('[part="indicator"]') as HTMLElement;
            return {
              id: element.id,
              checked: element.hasAttribute("checked"),
              track: getComputedStyle(track).backgroundColor,
              border: getComputedStyle(track).borderTopColor,
              knob: getComputedStyle(knob).backgroundColor,
              page: getComputedStyle(document.body).backgroundColor,
            };
          }),
        );
        for (const part of parts) {
          expect(
            contrastOf(part.knob, part.track),
            `${part.id} knob on track`,
          ).toBeGreaterThanOrEqual(3);
          if (!part.checked) {
            expect(
              contrastOf(part.border, part.page),
              `${part.id} border on page`,
            ).toBeGreaterThanOrEqual(3);
          }
        }
        await page.locator("fm-sxaltilo").evaluateAll((elements) => {
          for (const element of elements) element.toggleAttribute("disabled", true);
        });
        expect(await axeViolations(page), "disabled").toEqual([]);
        await page.locator("fm-sxaltilo").evaluateAll((elements) => {
          for (const element of elements) element.toggleAttribute("disabled", false);
        });
        const rings = await focusRingContrasts(
          page,
          switchCombos.map((_c, i) => `#s${i}`),
          browserName,
        );
        expect(rings).toHaveLength(switchCombos.length);
        for (const ring of rings) {
          expect(ring.gap, `${ring.selector} ring on gap`).toBeGreaterThanOrEqual(3);
          expect(ring.page, `${ring.selector} ring on page`).toBeGreaterThanOrEqual(3);
        }
      });
    }
  }
}

// Spec 010 ② (G7, plan ② D-06): the rendered fm-markobutono in every colour class of komuna and
// ekzemplo: axe (role checkbox) on every size, ticked and not, in rest, hover, invalid and disabled;
// the focus ring of the box contrasts at least 3:1 with the gap colour and with the page; the check
// mark contrasts at least 3:1 with its box, and the box's border with the page, also invalid
// (WCAG 1.4.11: the border is the box, the mark is the state).
const markobutono = input.modelo.eroj.find((entry) => entry.ero.name === "markobutono");
if (markobutono === undefined) throw new Error("markobutono missing");
const checkboxCombos = combinationsOf(markobutono.skemo, ["checked", "size"]);
const checkboxes = checkboxCombos
  .map(
    (c, i) =>
      `<fm-markobutono id="m${i}" size="${c.size}"${c.checked === "true" ? " checked" : ""}>Ich akzeptiere die AGB ${i}</fm-markobutono>`,
  )
  .join(" ");

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on every size of the markobutono, ticked and not, invalid, focus ring and mark ≥ 3:1`, async ({
        page,
        browserName,
      }) => {
        await serve(
          page,
          out,
          checkboxes,
          "<style>body { color: var(--fm-color-text-default); }</style>",
        );
        await page.evaluate(
          ([a, s, c]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", c ?? "");
          },
          [aspekto, scheme, contrast],
        );
        expect(await axeViolations(page), "rest").toEqual([]);
        for (const [i] of checkboxCombos.entries()) {
          await page.locator(`#m${i}`).locator('[part="control"]').hover();
          expect(await axeViolations(page, `#m${i}`), `#m${i} hover`).toEqual([]);
        }
        await page.mouse.move(0, 0);
        const measure = () =>
          page.locator("fm-markobutono").evaluateAll((elements) =>
            elements.map((element) => {
              const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
              const mark = element.shadowRoot?.querySelector('[part="indicator"]') as HTMLElement;
              return {
                id: element.id,
                checked: element.hasAttribute("checked"),
                fill: getComputedStyle(control).backgroundColor,
                border: getComputedStyle(control).borderTopColor,
                mark: getComputedStyle(mark).color,
                page: getComputedStyle(document.body).backgroundColor,
              };
            }),
          );
        for (const part of await measure()) {
          if (part.checked) {
            expect(
              contrastOf(part.mark, part.fill),
              `${part.id} mark on box`,
            ).toBeGreaterThanOrEqual(3);
          }
          expect(
            contrastOf(part.border, part.page),
            `${part.id} border on page`,
          ).toBeGreaterThanOrEqual(3);
        }
        // Invalid: the error text under the label, the danger border on the page.
        await page.locator("fm-markobutono").evaluateAll((elements) => {
          for (const element of elements) {
            element.toggleAttribute("invalid", true);
            const error = document.createElement("span");
            error.slot = "error";
            error.textContent = "Akzeptiere die AGB, um fortzufahren";
            element.append(error);
          }
        });
        expect(await axeViolations(page), "invalid").toEqual([]);
        for (const part of await measure()) {
          expect(
            contrastOf(part.border, part.page),
            `${part.id} invalid border on page`,
          ).toBeGreaterThanOrEqual(3);
        }
        await page.locator("fm-markobutono").evaluateAll((elements) => {
          for (const element of elements) element.toggleAttribute("disabled", true);
        });
        expect(await axeViolations(page), "disabled").toEqual([]);
        await page.locator("fm-markobutono").evaluateAll((elements) => {
          for (const element of elements) element.toggleAttribute("disabled", false);
        });
        const rings = await focusRingContrasts(
          page,
          checkboxCombos.map((_c, i) => `#m${i}`),
          browserName,
        );
        expect(rings).toHaveLength(checkboxCombos.length);
        for (const ring of rings) {
          expect(ring.gap, `${ring.selector} ring on gap`).toBeGreaterThanOrEqual(3);
          expect(ring.page, `${ring.selector} ring on page`).toBeGreaterThanOrEqual(3);
        }
      });
    }
  }
}

// Spec 010 ③ (G7, plan ③ D-04): the rendered fm-elekto in every colour class of komuna and ekzemplo:
// axe (role radiogroup with radio children) on every size, an option chosen and others not, in
// rest, hover, invalid and disabled; the focus ring of the chosen circle contrasts at least 3:1 with
// the gap colour and with the page; the dot contrasts at least 3:1 with its circle, and every
// circle's border with the page, also invalid (WCAG 1.4.11: the border is the circle, the dot the
// choice).
const elekto = input.modelo.eroj.find((entry) => entry.ero.name === "elekto");
if (elekto === undefined) throw new Error("elekto missing");
const radioCombos = combinationsOf(elekto.skemo, ["size"]);
const RADIO_OPTIONS =
  '<data slot="options" value="1">Standard</data><data slot="options" value="2">Express</data><data slot="options" value="3">Abholung</data>';
const radioGroups = radioCombos
  .map(
    (c, i) =>
      `<fm-elekto id="e${i}" size="${c.size}" value="1">Versandart ${i}${RADIO_OPTIONS}</fm-elekto>`,
  )
  .join(" ");

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on every size of the elekto, chosen and not, invalid, focus ring and dot ≥ 3:1`, async ({
        page,
        browserName,
      }) => {
        await serve(
          page,
          out,
          radioGroups,
          "<style>body { color: var(--fm-color-text-default); }</style>",
        );
        await page.evaluate(
          ([a, s, c]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", c ?? "");
          },
          [aspekto, scheme, contrast],
        );
        expect(await axeViolations(page), "rest").toEqual([]);
        for (const [i] of radioCombos.entries()) {
          await page.locator(`#e${i}`).locator('[part="option"]').nth(1).hover();
          expect(await axeViolations(page, `#e${i}`), `#e${i} hover`).toEqual([]);
        }
        await page.mouse.move(0, 0);
        const measure = () =>
          page.locator("fm-elekto").evaluateAll((elements) =>
            elements.flatMap((element) =>
              [...(element.shadowRoot?.querySelectorAll('[part="option"]') ?? [])].map(
                (row, index) => {
                  const control = row.querySelector('[part="control"]') as HTMLElement;
                  const dot = row.querySelector('[part="indicator"]') as HTMLElement;
                  return {
                    id: `${element.id}/${index}`,
                    chosen: row.getAttribute("aria-checked") === "true",
                    fill: getComputedStyle(control).backgroundColor,
                    border: getComputedStyle(control).borderTopColor,
                    dot: getComputedStyle(dot).color,
                    page: getComputedStyle(document.body).backgroundColor,
                  };
                },
              ),
            ),
          );
        const parts = await measure();
        expect(parts.filter((part) => part.chosen)).toHaveLength(radioCombos.length);
        for (const part of parts) {
          if (part.chosen) {
            expect(
              contrastOf(part.dot, part.fill),
              `${part.id} dot on circle`,
            ).toBeGreaterThanOrEqual(3);
          }
          expect(
            contrastOf(part.border, part.page),
            `${part.id} border on page`,
          ).toBeGreaterThanOrEqual(3);
        }
        // Invalid: the error text under the options, the danger border on the page.
        await page.locator("fm-elekto").evaluateAll((elements) => {
          for (const element of elements) {
            element.toggleAttribute("invalid", true);
            const error = document.createElement("span");
            error.slot = "error";
            error.textContent = "Wähle eine Versandart, um fortzufahren";
            element.append(error);
          }
        });
        expect(await axeViolations(page), "invalid").toEqual([]);
        for (const part of await measure()) {
          expect(
            contrastOf(part.border, part.page),
            `${part.id} invalid border on page`,
          ).toBeGreaterThanOrEqual(3);
        }
        await page.locator("fm-elekto").evaluateAll((elements) => {
          for (const element of elements) element.toggleAttribute("disabled", true);
        });
        expect(await axeViolations(page), "disabled").toEqual([]);
        await page.locator("fm-elekto").evaluateAll((elements) => {
          for (const element of elements) element.toggleAttribute("disabled", false);
        });
        const rings = await focusRingContrasts(
          page,
          radioCombos.map((_c, i) => `#e${i}`),
          browserName,
        );
        expect(rings).toHaveLength(radioCombos.length);
        for (const ring of rings) {
          expect(ring.gap, `${ring.selector} ring on gap`).toBeGreaterThanOrEqual(3);
          expect(ring.page, `${ring.selector} ring on page`).toBeGreaterThanOrEqual(3);
        }
      });
    }
  }
}

// Spec 010 ④ (G7, plan ④ D-06): the rendered fm-elektilo in every colour class of komuna and
// ekzemplo: axe (role combobox, the platform's select) on every size, required, with a prompt and
// help, in rest, hover, invalid (with the error text) and disabled, one select with a chosen option
// besides; the focus ring of the select contrasts at least 3:1 with the gap colour and with the
// page; the chevron at least 3:1 with the field it stands on (WCAG 1.4.11: it says a list opens).
const elektilo = input.modelo.eroj.find((entry) => entry.ero.name === "elektilo");
if (elektilo === undefined) throw new Error("elektilo missing");
const selectCombos = combinationsOf(elektilo.skemo, ["size"]);
const SELECT_OPTIONS =
  '<data slot="options" value="de">Deutschland</data><data slot="options" value="at">Österreich</data><data slot="options" value="ch">Schweiz</data>';
const selects = selectCombos
  .map(
    (c, i) =>
      `<fm-elektilo id="l${i}" size="${c.size}" required placeholder="Bitte wählen">Land ${i}${SELECT_OPTIONS}<span slot="help">Wir liefern in drei Länder.</span></fm-elektilo>`,
  )
  .join(" ")
  .concat(`<fm-elektilo id="lval" value="at">Lieferland${SELECT_OPTIONS}</fm-elektilo>`);

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on every size of the elektilo, prompt and chosen, invalid, focus ring and chevron ≥ 3:1`, async ({
        page,
        browserName,
      }) => {
        await serve(
          page,
          out,
          selects,
          "<style>body { color: var(--fm-color-text-default); }</style>",
        );
        await page.evaluate(
          ([a, s, c]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", c ?? "");
          },
          [aspekto, scheme, contrast],
        );
        expect(await axeViolations(page), "rest").toEqual([]);
        for (const [i] of selectCombos.entries()) {
          await page.locator(`#l${i}`).locator('[part="control"]').hover();
          expect(await axeViolations(page, `#l${i}`), `#l${i} hover`).toEqual([]);
        }
        await page.mouse.move(0, 0);
        const measure = () =>
          page.locator("fm-elektilo").evaluateAll((elements) =>
            elements.map((element) => {
              const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
              const chevron = element.shadowRoot?.querySelector(
                '[part="indicator"]',
              ) as HTMLElement;
              return {
                id: element.id,
                fill: getComputedStyle(control).backgroundColor,
                chevron: getComputedStyle(chevron).color,
              };
            }),
          );
        for (const part of await measure()) {
          expect(
            contrastOf(part.chevron, part.fill),
            `${part.id} chevron on field`,
          ).toBeGreaterThanOrEqual(3);
        }
        // Invalid: the error text under the select, the danger border.
        await page.locator("fm-elektilo").evaluateAll((elements) => {
          for (const element of elements) {
            element.toggleAttribute("invalid", true);
            const error = document.createElement("span");
            error.slot = "error";
            error.textContent = "Wähle ein Land, um fortzufahren";
            element.append(error);
          }
        });
        expect(await axeViolations(page), "invalid").toEqual([]);
        for (const part of await measure()) {
          expect(
            contrastOf(part.chevron, part.fill),
            `${part.id} invalid chevron on field`,
          ).toBeGreaterThanOrEqual(3);
        }
        await page.locator("fm-elektilo").evaluateAll((elements) => {
          for (const element of elements) {
            element.toggleAttribute("invalid", false);
            for (const error of element.querySelectorAll('[slot="error"]')) error.remove();
            element.toggleAttribute("disabled", true);
          }
        });
        expect(await axeViolations(page), "disabled").toEqual([]);
        await page.locator("fm-elektilo").evaluateAll((elements) => {
          for (const element of elements) element.toggleAttribute("disabled", false);
        });
        const rings = await focusRingContrasts(
          page,
          [...selectCombos.map((_c, i) => `#l${i}`), "#lval"],
          browserName,
        );
        expect(rings).toHaveLength(selectCombos.length + 1);
        for (const ring of rings) {
          expect(ring.gap, `${ring.selector} ring on gap`).toBeGreaterThanOrEqual(3);
          expect(ring.page, `${ring.selector} ring on page`).toBeGreaterThanOrEqual(3);
        }
        expect(boundToken(elektilo.skemo, "indicator", "color", {})?.token).toBe(
          "color.text.muted",
        );
      });
    }
  }
}
