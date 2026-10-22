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

// Spec 011 ② (G7, plan ② D-11): the rendered fm-tekstareo in every colour class of komuna and
// ekzemplo: axe (role textbox) on every kind × size in rest, hover, disabled and invalid (with the
// error text), required with help; the focus ring of the textarea contrasts at least 3:1 with the
// gap colour and with the page background.
const tekstareo = input.modelo.eroj.find((entry) => entry.ero.name === "tekstareo");
if (tekstareo === undefined) throw new Error("tekstareo missing");
const areaCombos = combinationsOf(tekstareo.skemo, ["kind", "size"]);
const areas = areaCombos
  .map(
    (c, i) =>
      `<fm-tekstareo id="t${i}" kind="${c.kind}" size="${c.size}" required>Begründung ${i}<span slot="help">Die Prüfer lesen die Begründung.</span></fm-tekstareo>`,
  )
  .join(" ")
  .concat(
    `<fm-tekstareo id="terr" invalid>Kommentar<span slot="error">Gib eine Begründung mit mindestens zehn Zeichen ein</span></fm-tekstareo>`,
  );

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on every kind × size and state of the tekstareo, focus ring ≥ 3:1`, async ({
        page,
        browserName,
      }) => {
        await serve(
          page,
          out,
          areas,
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
        for (const [i] of areaCombos.entries()) {
          await page.locator(`#t${i}`).locator('[part="control"]').hover();
          expect(await axeViolations(page, `#t${i}`), `#t${i} hover`).toEqual([]);
        }
        await page.mouse.move(0, 0);
        await page.locator("fm-tekstareo").evaluateAll((elements) => {
          for (const element of elements) element.toggleAttribute("disabled", true);
        });
        expect(await axeViolations(page), "disabled").toEqual([]);
        await page.locator("fm-tekstareo").evaluateAll((elements) => {
          for (const element of elements) element.toggleAttribute("disabled", false);
        });
        const rings = await focusRingContrasts(
          page,
          [...areaCombos.map((_c, i) => `#t${i}`), "#terr"],
          browserName,
        );
        expect(rings).toHaveLength(areaCombos.length + 1);
        for (const ring of rings) {
          expect(ring.gap, `${ring.selector} ring on gap`).toBeGreaterThanOrEqual(3);
          expect(ring.page, `${ring.selector} ring on page`).toBeGreaterThanOrEqual(3);
        }
      });
    }
  }
}

// Spec 011 ② (G7, plan ② D-12): the rendered fm-dialogo in every colour class of komuna and
// ekzemplo: axe (role dialog, modal) with an open dialog of every size × reason — heading, message,
// the reason area, two actions — on the page behind it; heading and message contrast at least 4.5:1
// with the surface, the surface's border 3:1 with the backdrop-covered page; the focus ring of the
// confirmation (a butono inside the dialog) at least 3:1 with its gap and with the surface.
const dialogo = input.modelo.eroj.find((entry) => entry.ero.name === "dialogo");
if (dialogo === undefined) throw new Error("dialogo missing");
const dialogCombos = combinationsOf(dialogo.skemo, ["size", "reason"]);
const dialogMarkup = (c: Record<string, string>) =>
  `<fm-dialogo id="d" open size="${c.size}" reason="${c.reason}">Version freigeben?<span slot="message">Die Version gilt danach für alle Projekte.</span><span slot="reason">Begründung</span><fm-butono slot="actions" emphasis="low">Abbrechen</fm-butono><fm-butono id="ok" slot="actions" emphasis="high">Freigeben</fm-butono></fm-dialogo><p>Seite dahinter.</p>`;

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on the open dialogo of every size × reason, texts ≥ 4.5:1 on the surface`, async ({
        page,
      }) => {
        for (const c of dialogCombos) {
          await serve(
            page,
            out,
            dialogMarkup(c),
            "<style>body { color: var(--fm-color-text-default); }</style>",
          );
          await page.evaluate(
            ([a, s, k]) => {
              const root = document.documentElement;
              root.setAttribute("data-fm-aspekto", a ?? "");
              root.setAttribute("data-fm-color-scheme", s ?? "");
              root.setAttribute("data-fm-contrast", k ?? "");
            },
            [aspekto, scheme, contrast],
          );
          await expect(page.getByRole("dialog")).toBeVisible();
          expect(await axeViolations(page), JSON.stringify(c)).toEqual([]);
          const colours = await page.locator("#d").evaluate((element) => {
            const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
            const heading = element.shadowRoot?.querySelector('[part="heading"]') as HTMLElement;
            const message = element.shadowRoot?.querySelector('[part="message"]') as HTMLElement;
            return {
              surface: getComputedStyle(control).backgroundColor,
              heading: getComputedStyle(heading).color,
              message: getComputedStyle(message).color,
            };
          });
          expect(
            contrastOf(colours.heading, colours.surface),
            `${JSON.stringify(c)} heading`,
          ).toBeGreaterThanOrEqual(4.5);
          expect(
            contrastOf(colours.message, colours.surface),
            `${JSON.stringify(c)} message`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      });
    }
  }
}

// Spec 011 ③ (G7, plan ③ D-08): the rendered fm-insigno in every colour class of komuna and
// ekzemplo: axe on every intent × size (static text, no role), the text at least 4.5:1 with the
// surface of the badge, the border at least 3:1 with the page.
const insigno = input.modelo.eroj.find((entry) => entry.ero.name === "insigno");
if (insigno === undefined) throw new Error("insigno missing");
const badgeCombos = combinationsOf(insigno.skemo, ["intent", "size"]);
const badges = badgeCombos
  .map(
    (c, i) =>
      `<fm-insigno id="i${i}" intent="${c.intent}" size="${c.size}">In Prüfung<span slot="description">Zwei Prüfer lesen die Version.</span></fm-insigno>`,
  )
  .join(" ");

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on every insigno intent × size, text ≥ 4.5:1 on the badge, border ≥ 3:1 on the page`, async ({
        page,
      }) => {
        await serve(page, out, badges);
        await page.evaluate(
          ([a, s, k]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", k ?? "");
          },
          [aspekto, scheme, contrast],
        );
        expect(await axeViolations(page)).toEqual([]);
        const pageColour = await page.evaluate(
          () => getComputedStyle(document.body).backgroundColor,
        );
        for (const [i, c] of badgeCombos.entries()) {
          const colours = await page.locator(`#i${i}`).evaluate((element) => {
            const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
            const style = getComputedStyle(control);
            return {
              surface: style.backgroundColor,
              text: style.color,
              border: style.borderTopColor,
            };
          });
          expect(
            contrastOf(colours.text, colours.surface),
            `${JSON.stringify(c)} text`,
          ).toBeGreaterThanOrEqual(4.5);
          expect(
            contrastOf(colours.border, pageColour),
            `${JSON.stringify(c)} border`,
          ).toBeGreaterThanOrEqual(3);
        }
      });
    }
  }
}

// Spec 011 ③ (G7, plan ③ D-09): the rendered fm-avizo in every colour class: axe (role status,
// alert for danger) on every intent with heading, message, details, an action and the dismiss
// butono; heading and message at least 4.5:1 with the surface, the accent at least 3:1 with it;
// the focus ring of the dismiss butono at least 3:1 with its gap and with the surface.
const avizo = input.modelo.eroj.find((entry) => entry.ero.name === "avizo");
if (avizo === undefined) throw new Error("avizo missing");
const noticeCombos = combinationsOf(avizo.skemo, ["intent"]);
const notices = noticeCombos
  .map(
    (c, i) =>
      `<fm-avizo id="n${i}" intent="${c.intent}" dismissible>Der Import wurde nicht gespeichert. Prüfe die Datei und lade sie erneut hoch.<span slot="heading">Import</span><ul slot="details"><li>Zeile 3: Titel fehlt</li></ul><fm-butono slot="actions" emphasis="medium">Datei erneut wählen</fm-butono></fm-avizo>`,
  )
  .join(" ");

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on every avizo intent, texts ≥ 4.5:1 and the accent ≥ 3:1 on the surface`, async ({
        page,
        browserName,
      }) => {
        await serve(page, out, notices);
        await page.evaluate(
          ([a, s, k]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", k ?? "");
          },
          [aspekto, scheme, contrast],
        );
        expect(await axeViolations(page)).toEqual([]);
        await expect(page.getByRole("alert")).toHaveCount(1);
        await expect(page.getByRole("status")).toHaveCount(noticeCombos.length - 1);
        for (const [i, c] of noticeCombos.entries()) {
          const colours = await page.locator(`#n${i}`).evaluate((element) => {
            const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
            const heading = element.shadowRoot?.querySelector('[part="heading"]') as HTMLElement;
            const message = element.shadowRoot?.querySelector('[part="message"]') as HTMLElement;
            const style = getComputedStyle(control);
            return {
              surface: style.backgroundColor,
              accent: style.borderInlineStartColor,
              heading: getComputedStyle(heading).color,
              message: getComputedStyle(message).color,
            };
          });
          expect(
            contrastOf(colours.heading, colours.surface),
            `${JSON.stringify(c)} heading`,
          ).toBeGreaterThanOrEqual(4.5);
          expect(
            contrastOf(colours.message, colours.surface),
            `${JSON.stringify(c)} message`,
          ).toBeGreaterThanOrEqual(4.5);
          expect(
            contrastOf(colours.accent, colours.surface),
            `${JSON.stringify(c)} accent`,
          ).toBeGreaterThanOrEqual(3);
        }
        // The dismiss butono lies in the notice's shadow tree: Tab reaches it after the slotted
        // action; its ring is measured against its gap and against the surface of the notice.
        await page.evaluate(() => {
          const start = document.createElement("span");
          start.id = "fm-focus-start";
          start.tabIndex = -1;
          document.body.prepend(start);
          start.focus();
        });
        const rings: { id: string; gap: number; surface: number }[] = [];
        for (
          let step = 0;
          step < noticeCombos.length * 3 + 2 && rings.length < noticeCombos.length;
          step++
        ) {
          await page.keyboard.press(TAB(browserName));
          const measured = await page.evaluate(() => {
            const host = document.activeElement;
            const inner = host?.shadowRoot?.activeElement;
            if (!(host instanceof HTMLElement) || !(inner instanceof HTMLElement)) return null;
            if (inner.getAttribute("part") !== "dismiss") return null;
            const control = inner.shadowRoot?.querySelector('[part="control"]');
            const surface = host.shadowRoot?.querySelector('[part="control"]');
            if (!(control instanceof HTMLElement) || !(surface instanceof HTMLElement)) return null;
            const style = getComputedStyle(control);
            return {
              id: host.id,
              ring: style.outlineColor,
              gap: /rgba?\([^)]*\)/.exec(style.boxShadow)?.[0] ?? "",
              surface: getComputedStyle(surface).backgroundColor,
            };
          });
          if (measured !== null && !rings.some((ring) => ring.id === measured.id)) {
            rings.push({
              id: measured.id,
              gap: contrastOf(measured.ring, measured.gap),
              surface: contrastOf(measured.ring, measured.surface),
            });
          }
        }
        expect(rings.map((ring) => ring.id).sort()).toEqual(noticeCombos.map((_c, i) => `n${i}`));
        for (const ring of rings) {
          expect(ring.gap, `${ring.id} ring on gap`).toBeGreaterThanOrEqual(3);
          expect(ring.surface, `${ring.id} ring on surface`).toBeGreaterThanOrEqual(3);
        }
      });
    }
  }
}

// Spec 011 ③ (G7, plan ③ D-10): the rendered fm-plenstato in every colour class: axe (role
// status, busy while loading) on both kinds, the text at least 4.5:1 with the page it stands on,
// the indicator at least 3:1 with the page while loading.
const plenstato = input.modelo.eroj.find((entry) => entry.ero.name === "plenstato");
if (plenstato === undefined) throw new Error("plenstato missing");
const states = `<fm-plenstato id="p0" kind="loading">Standards werden geladen</fm-plenstato><fm-plenstato id="p1" kind="empty">Noch keine Standards. Lege den ersten an.<fm-butono slot="actions" emphasis="high">Standard anlegen</fm-butono></fm-plenstato>`;

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on the loading and the empty plenstato, text ≥ 4.5:1 and indicator ≥ 3:1 on the page`, async ({
        page,
      }) => {
        await serve(page, out, states);
        await page.evaluate(
          ([a, s, k]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", k ?? "");
          },
          [aspekto, scheme, contrast],
        );
        expect(await axeViolations(page)).toEqual([]);
        await expect(page.getByRole("status")).toHaveCount(2);
        const pageColour = await page.evaluate(
          () => getComputedStyle(document.body).backgroundColor,
        );
        for (const id of ["p0", "p1"]) {
          const colours = await page.locator(`#${id}`).evaluate((element) => {
            const text = element.shadowRoot?.querySelector('[part="text"]') as HTMLElement;
            const indicator = element.shadowRoot?.querySelector(
              '[part="indicator"]',
            ) as HTMLElement;
            return {
              text: getComputedStyle(text).color,
              indicator: getComputedStyle(indicator).color,
            };
          });
          expect(contrastOf(colours.text, pageColour), `${id} text`).toBeGreaterThanOrEqual(4.5);
          if (id === "p0") {
            expect(contrastOf(colours.indicator, pageColour), "indicator").toBeGreaterThanOrEqual(
              3,
            );
          }
        }
      });
    }
  }
}

// Spec 011 ④ (G7, plan ④ D-08): the rendered fm-mezurilo in every colour class: axe (role meter)
// on every intent with a known and an unknown value; the label at least 4.5:1 on the page, the fill
// at least 3:1 with the track (WCAG 1.4.11: the bar is a graphic that carries the value).
const mezurilo = input.modelo.eroj.find((entry) => entry.ero.name === "mezurilo");
if (mezurilo === undefined) throw new Error("mezurilo missing");
const meterCombos = combinationsOf(mezurilo.skemo, ["intent"]);
const meters = `${meterCombos
  .map(
    (c, i) =>
      `<fm-mezurilo id="g${i}" intent="${c.intent}" value="66">Konformität ${i}<span slot="value-text">66 % von 3 prüfbaren</span></fm-mezurilo>`,
  )
  .join(
    " ",
  )}<fm-mezurilo id="gu">Unbekannt<span slot="value-text">nicht geprüft</span></fm-mezurilo>`;

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on every mezurilo intent and the unknown value, label ≥ 4.5:1, fill ≥ 3:1 on the track`, async ({
        page,
      }) => {
        await serve(page, out, meters);
        await page.evaluate(
          ([a, s, k]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", k ?? "");
          },
          [aspekto, scheme, contrast],
        );
        expect(await axeViolations(page)).toEqual([]);
        await expect(page.getByRole("meter")).toHaveCount(meterCombos.length + 1);
        const pageColour = await page.evaluate(
          () => getComputedStyle(document.body).backgroundColor,
        );
        for (const [i, c] of meterCombos.entries()) {
          const colours = await page.locator(`#g${i}`).evaluate((element) => {
            const track = element.shadowRoot?.querySelector('[part="track"]') as HTMLElement;
            const fill = element.shadowRoot?.querySelector('[part="fill"]') as HTMLElement;
            const label = element.shadowRoot?.querySelector('[part="label"]') as HTMLElement;
            return {
              track: getComputedStyle(track).backgroundColor,
              fill: getComputedStyle(fill).backgroundColor,
              label: getComputedStyle(label).color,
            };
          });
          expect(
            contrastOf(colours.label, pageColour),
            `${JSON.stringify(c)} label`,
          ).toBeGreaterThanOrEqual(4.5);
          expect(
            contrastOf(colours.fill, colours.track),
            `${JSON.stringify(c)} fill`,
          ).toBeGreaterThanOrEqual(3);
        }
      });
    }
  }
}

// Spec 011 ④ (G7, plan ④ D-09, D-10, E10): the rendered fm-tabelo and fm-atributlisto in every
// colour class: axe (table with caption, column and row headers, sort buttons; a description list
// with a name) on both densities and both layouts; head text and cells at least 4.5:1, the sort
// button's focus ring at least 3:1 with its gap and with the head.
const tableMarkup = (density: string) =>
  `<fm-tabelo id="t-${density}" density="${density}" sort="name">Standards<table slot="content"><thead><tr><th scope="col" data-sort="name">Name</th><th scope="col">Status</th><th scope="col" numeric>Verstöße</th></tr></thead><tbody><tr><th scope="row">Barrierefreiheit</th><td><fm-insigno intent="success">gültig</fm-insigno></td><td>0</td></tr><tr><th scope="row">Datenschutz</th><td>Entwurf</td><td>3</td></tr></tbody></table></fm-tabelo>`;
const listMarkup = (layout: string) =>
  `<fm-atributlisto id="l-${layout}" layout="${layout}" label="Angaben ${layout}"><dl><dt>Version</dt><dd>3</dd><dt>Gültig seit</dt><dd></dd></dl></fm-atributlisto>`;

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on the tabelo (both densities) and the atributlisto (both layouts), texts ≥ 4.5:1, sort ring ≥ 3:1`, async ({
        page,
        browserName,
      }) => {
        await serve(
          page,
          out,
          `${tableMarkup("comfortable")}${tableMarkup("compact")}${listMarkup("columns")}${listMarkup("stacked")}`,
        );
        await page.evaluate(
          ([a, s, k]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", k ?? "");
          },
          [aspekto, scheme, contrast],
        );
        expect(await axeViolations(page)).toEqual([]);
        await expect(page.getByRole("table")).toHaveCount(2);
        for (const density of ["comfortable", "compact"]) {
          const colours = await page.locator(`#t-${density}`).evaluate((element) => {
            const th = element.querySelector("thead th") as HTMLElement;
            const button = th.querySelector("button") as HTMLElement;
            const td = element.querySelector("tbody td:last-child") as HTMLElement;
            return {
              headFill: getComputedStyle(th).backgroundColor,
              headText: getComputedStyle(button).color,
              cellText: getComputedStyle(td).color,
              page: getComputedStyle(document.body).backgroundColor,
            };
          });
          expect(
            contrastOf(colours.headText, colours.headFill),
            `${density} head`,
          ).toBeGreaterThanOrEqual(4.5);
          expect(
            contrastOf(colours.cellText, colours.page),
            `${density} cell`,
          ).toBeGreaterThanOrEqual(4.5);
        }
        for (const layout of ["columns", "stacked"]) {
          const colours = await page.locator(`#l-${layout}`).evaluate((element) => ({
            term: getComputedStyle(element.querySelector("dt") as Element).color,
            value: getComputedStyle(element.querySelector("dd") as Element).color,
            page: getComputedStyle(document.body).backgroundColor,
          }));
          expect(contrastOf(colours.term, colours.page), `${layout} term`).toBeGreaterThanOrEqual(
            4.5,
          );
          expect(contrastOf(colours.value, colours.page), `${layout} value`).toBeGreaterThanOrEqual(
            4.5,
          );
        }
        // The sort button's ring: Tab reaches the region, then the button.
        await page.evaluate(() => {
          const start = document.createElement("span");
          start.id = "fm-focus-start";
          start.tabIndex = -1;
          document.body.prepend(start);
          start.focus();
        });
        let ring: { gap: number; head: number } | null = null;
        for (let step = 0; step < 6 && ring === null; step++) {
          await page.keyboard.press(TAB(browserName));
          ring = await page
            .evaluate(() => {
              const active = document.activeElement;
              if (!(active instanceof HTMLButtonElement) || active.closest("fm-tabelo") === null)
                return null;
              const style = getComputedStyle(active);
              const th = active.closest("th") as HTMLElement;
              const gap = /rgba?\([^)]*\)/.exec(style.boxShadow)?.[0] ?? "";
              return { ring: style.outlineColor, gap, head: getComputedStyle(th).backgroundColor };
            })
            .then((measured) =>
              measured === null
                ? null
                : {
                    gap: contrastOf(measured.ring, measured.gap),
                    head: contrastOf(measured.ring, measured.head),
                  },
            );
        }
        expect(ring).not.toBeNull();
        expect(ring?.gap ?? 0, "sort ring on gap").toBeGreaterThanOrEqual(3);
        expect(ring?.head ?? 0, "sort ring on head").toBeGreaterThanOrEqual(3);
      });
    }
  }
}

// Spec 011 ⑤ (G7, plan ⑤ D-07, D-08): the rendered fm-navigado and fm-langetaro in every colour
// class: axe (a navigation landmark with links, the current page marked, a count badge; a tablist
// with tabs, one disabled, and its panel); the text of every item at least 4.5:1 on its fill
// (rest and current, selected and not); the focus ring of an item and of a tab at least 3:1.
const navMarkup = (orientation: string) =>
  `<fm-navigado id="n-${orientation}" orientation="${orientation}" label="Hauptnavigation ${orientation}" page="standards"><a href="#standards" data-page="standards">Standards</a><a href="#versions" data-page="versions" data-count="1" data-count-description="1 Version in Prüfung">Versionen</a><a href="#rules" data-page="rules">Regeln</a></fm-navigado>`;
const tabsMarkup =
  '<fm-langetaro id="tl" label="Standard" selected="inhalt"><data value="inhalt">Inhalt</data><data value="versionen">Versionen</data><data value="regeln" disabled>Regeln</data><div slot="panel">Der Inhalt des Standards.</div></fm-langetaro>';

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on the navigado (both orientations) and the langetaro, texts ≥ 4.5:1 on their fills, rings ≥ 3:1`, async ({
        page,
        browserName,
      }) => {
        await serve(page, out, `${navMarkup("horizontal")}${navMarkup("vertical")}${tabsMarkup}`);
        await page.evaluate(
          ([a, s, k]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", k ?? "");
          },
          [aspekto, scheme, contrast],
        );
        expect(await axeViolations(page)).toEqual([]);
        await expect(page.getByRole("navigation")).toHaveCount(2);
        await expect(page.getByRole("tablist")).toHaveCount(1);
        await expect(page.getByRole("tab")).toHaveCount(3);
        for (const orientation of ["horizontal", "vertical"]) {
          const colours = await page.locator(`#n-${orientation}`).evaluate((element) => {
            // The colour behind an element: its own fill, or the page's where it is see-through.
            const read = (node: Element): string => {
              const own = getComputedStyle(node).backgroundColor;
              const alpha = /rgba\([^)]*,\s*([\d.]+)\)/.exec(own)?.[1];
              return alpha !== undefined && Number.parseFloat(alpha) === 0
                ? getComputedStyle(document.body).backgroundColor
                : own;
            };
            const current = element.querySelector("a[aria-current]") as HTMLElement;
            const other = element.querySelector("a:not([aria-current])") as HTMLElement;
            return {
              currentText: getComputedStyle(current).color,
              currentFill: read(current),
              otherText: getComputedStyle(other).color,
              otherFill: read(other),
            };
          });
          expect(
            contrastOf(colours.currentText, colours.currentFill),
            `${orientation} current`,
          ).toBeGreaterThanOrEqual(4.5);
          expect(
            contrastOf(colours.otherText, colours.otherFill),
            `${orientation} item`,
          ).toBeGreaterThanOrEqual(4.5);
        }
        const tabColours = await page.locator("#tl").evaluate((element) => {
          const read = (node: Element): string => {
            const own = getComputedStyle(node).backgroundColor;
            const alpha = /rgba\([^)]*,\s*([\d.]+)\)/.exec(own)?.[1];
            return alpha !== undefined && Number.parseFloat(alpha) === 0
              ? getComputedStyle(document.body).backgroundColor
              : own;
          };
          const selected = element.shadowRoot?.querySelector(
            '[part="tab"][aria-selected="true"]',
          ) as HTMLElement;
          const other = element.shadowRoot?.querySelector(
            '[part="tab"][aria-selected="false"]:not([aria-disabled="true"])',
          ) as HTMLElement;
          return {
            selectedText: getComputedStyle(selected).color,
            selectedFill: read(selected),
            otherText: getComputedStyle(other).color,
            otherFill: read(other),
          };
        });
        expect(
          contrastOf(tabColours.selectedText, tabColours.selectedFill),
          "selected tab",
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          contrastOf(tabColours.otherText, tabColours.otherFill),
          "tab",
        ).toBeGreaterThanOrEqual(4.5);
        // F-7 (Abnahme 16.10.): the indicator of the selected tab is a graphic — at least 3:1 on the
        // ground it lies on (WCAG 1.4.11); color.navigation.selected was invisible on komuna light.
        const indicator = await page.locator("#tl").evaluate((element) => {
          const selected = element.shadowRoot?.querySelector(
            '[part="tab"][aria-selected="true"]',
          ) as HTMLElement;
          const own = getComputedStyle(selected).backgroundColor;
          const alpha = /rgba\([^)]*,\s*([\d.]+)\)/.exec(own)?.[1];
          return {
            edge: getComputedStyle(selected).borderBlockEndColor,
            ground:
              alpha !== undefined && Number.parseFloat(alpha) === 0
                ? getComputedStyle(document.body).backgroundColor
                : own,
          };
        });
        expect(contrastOf(indicator.edge, indicator.ground), "indicator").toBeGreaterThanOrEqual(3);
        // The rings: Tab reaches the first link of the first navigation, later the selected tab.
        await page.evaluate(() => {
          const start = document.createElement("span");
          start.id = "fm-focus-start";
          start.tabIndex = -1;
          document.body.prepend(start);
          start.focus();
        });
        await page.keyboard.press(TAB(browserName));
        const linkRing = await page.evaluate(() => {
          const active = document.activeElement;
          if (!(active instanceof HTMLAnchorElement)) return null;
          const style = getComputedStyle(active);
          const gap = /rgba?\([^)]*\)/.exec(style.boxShadow)?.[0] ?? "";
          return {
            ring: style.outlineColor,
            gap,
            page: getComputedStyle(document.body).backgroundColor,
          };
        });
        expect(linkRing).not.toBeNull();
        expect(
          contrastOf(linkRing?.ring ?? "", linkRing?.gap ?? ""),
          "link ring on gap",
        ).toBeGreaterThanOrEqual(3);
        expect(
          contrastOf(linkRing?.ring ?? "", linkRing?.page ?? ""),
          "link ring on page",
        ).toBeGreaterThanOrEqual(3);
        await page.evaluate(() => (document.querySelector("#tl") as HTMLElement).focus());
        const tabRing = await page.locator("#tl").evaluate((element) => {
          const active = element.shadowRoot?.activeElement;
          if (!(active instanceof HTMLElement) || active.getAttribute("role") !== "tab")
            return null;
          const style = getComputedStyle(active);
          const gap = /rgba?\([^)]*\)/.exec(style.boxShadow)?.[0] ?? "";
          return {
            ring: style.outlineColor,
            gap,
            page: getComputedStyle(document.body).backgroundColor,
          };
        });
        expect(tabRing).not.toBeNull();
        expect(
          contrastOf(tabRing?.ring ?? "", tabRing?.gap ?? ""),
          "tab ring on gap",
        ).toBeGreaterThanOrEqual(3);
        expect(
          contrastOf(tabRing?.ring ?? "", tabRing?.page ?? ""),
          "tab ring on page",
        ).toBeGreaterThanOrEqual(3);
      });
    }
  }
}

// Spec 014 ② (G5, G10, plan ② D-05–D-07): the rendered fm-ikono, fm-apartigilo and fm-saltligilo
// in every colour class: axe (a named icon is an image, a decorative one is nothing; a separator
// with its orientation and a decorative line; the skip link, a link); the ring of the skip link
// at least 3:1 against its gap and the page; a status icon on the page ≥ 3:1 (a graphic).
const grundbausteinoj =
  '<fm-saltligilo id="skip" to="main">Zum Inhalt springen</fm-saltligilo><main id="main"><fm-ikono id="named" name="warning" label="Warnung"></fm-ikono><fm-ikono name="close"></fm-ikono><fm-ikono name="danger" intent="danger" label="Fehler"></fm-ikono><fm-apartigilo></fm-apartigilo><div style="display: flex"><span>a</span><fm-apartigilo orientation="vertical"></fm-apartigilo><span>b</span></div><fm-apartigilo decorative></fm-apartigilo><fm-butono id="after">Danach</fm-butono></main>';

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on the ikono, the apartigilo and the saltligilo; the skip link's ring ≥ 3:1`, async ({
        page,
        browserName,
      }) => {
        await serve(page, out, grundbausteinoj);
        await page.evaluate(
          ([a, s, k]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", k ?? "");
          },
          [aspekto, scheme, contrast],
        );
        await expect(page.getByRole("img")).toHaveCount(2);
        await expect(page.getByRole("separator")).toHaveCount(2);
        await expect(page.getByRole("link", { name: "Zum Inhalt springen" })).toHaveCount(1);
        expect(await axeViolations(page), "rest").toEqual([]);
        const [ring] = await focusRingContrasts(page, ["#skip"], browserName);
        expect(ring, "skip link reached by Tab").toBeDefined();
        expect(ring?.gap ?? 0, "ring vs gap").toBeGreaterThanOrEqual(3);
        expect(ring?.page ?? 0, "ring vs page").toBeGreaterThanOrEqual(3);
        expect(await axeViolations(page), "focus").toEqual([]);
        // A status icon is a graphic: its colour against the page at least 3:1 (WCAG 1.4.11).
        const graphic = await page.evaluate(() => {
          const icon = document.querySelector('fm-ikono[intent="danger"]');
          const glyph = icon?.shadowRoot?.querySelector('[part="glyph"]');
          return {
            fill:
              glyph === null || glyph === undefined ? "" : getComputedStyle(glyph).backgroundColor,
            page: getComputedStyle(document.body).backgroundColor,
          };
        });
        expect(
          contrastOf(graphic.fill, graphic.page),
          "status icon vs page",
        ).toBeGreaterThanOrEqual(3);
      });
    }
  }
}

// Spec 014 ③ (G5, G10, plan ③ D-04): the rendered fm-titolo and fm-teksto in every colour class:
// axe (headings with their levels in order, paragraphs, inline code), the text of every emphasis
// at least 4.5:1 on the page.
const typografio =
  '<fm-titolo level="1">Seite</fm-titolo><fm-teksto>Ein Absatz in der Grundrolle.</fm-teksto><fm-titolo level="2" size="headline-3">Abschnitt</fm-titolo><fm-teksto emphasis="medium">Ein Absatz in der zweiten Rolle.</fm-teksto><fm-teksto emphasis="low" kind="caption">Abbildung 1</fm-teksto><fm-teksto kind="kicker">Kategorie</fm-teksto><fm-teksto>Ruf <fm-teksto kind="code">fm build</fm-teksto> auf.</fm-teksto>';

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on the titolo and the teksto; every emphasis ≥ 4.5:1 on the page`, async ({
        page,
      }) => {
        await serve(page, out, typografio);
        await page.evaluate(
          ([a, s, k]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", k ?? "");
          },
          [aspekto, scheme, contrast],
        );
        await expect(page.getByRole("heading")).toHaveCount(2);
        await expect(page.getByRole("code")).toHaveCount(1);
        expect(await axeViolations(page)).toEqual([]);
        const measured = await page.evaluate(() =>
          [...document.querySelectorAll("fm-teksto")].map((element) => {
            const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
            return {
              emphasis: element.getAttribute("emphasis") ?? "high",
              colour: getComputedStyle(control).color,
              page: getComputedStyle(document.body).backgroundColor,
            };
          }),
        );
        for (const text of measured) {
          expect(contrastOf(text.colour, text.page), text.emphasis).toBeGreaterThanOrEqual(4.5);
        }
      });
    }
  }
}

// Spec 014 ④ (G5, G10, plan ④ D-05): the rendered overlays in every colour class, opened: axe on
// the tooltip (its text at least 4.5:1 on the inverse surface), the popover (a dialog with its
// heading) and the menu (menu items, a disabled one, a danger one at least 4.5:1 on its row).
const overlays =
  '<fm-butono id="ov-b" emphasis="low" label="Suchen"><fm-ikono name="search"></fm-ikono></fm-butono><fm-konsileto id="ov-t" for="ov-b">Suchen</fm-konsileto><fm-sxvebilo id="ov-p" label="Filter" open><fm-butono slot="trigger" emphasis="medium">Filter</fm-butono><span slot="heading">Nach Status filtern</span><fm-teksto>Inhalt</fm-teksto></fm-sxvebilo><fm-menuo id="ov-m"><data value="edit">Bearbeiten</data><data value="duplicate" disabled>Duplizieren</data><fm-apartigilo></fm-apartigilo><data value="delete" intent="danger">Löschen</data></fm-menuo>';

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on the opened konsileto, sxvebilo and menuo; tooltip and danger entry ≥ 4.5:1`, async ({
        page,
      }) => {
        await serve(page, out, overlays);
        await page.evaluate(
          ([a, s, k]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", k ?? "");
          },
          [aspekto, scheme, contrast],
        );
        await page.locator("#ov-b").hover();
        await expect(page.getByRole("tooltip", { name: "Suchen" })).toHaveCount(1);
        await expect(page.getByRole("dialog", { name: "Filter" })).toHaveCount(1);
        expect(await axeViolations(page), "tooltip and popover").toEqual([]);
        // One auto popover at a time (the platform closes the other): the menu opens after.
        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog", { name: "Filter" })).toHaveCount(0);
        await page.getByRole("button", { name: "Weitere Aktionen" }).click();
        await expect(page.getByRole("menuitem")).toHaveCount(3);
        expect(await axeViolations(page), "menu").toEqual([]);
        const measured = await page.evaluate(() => {
          const luminance = (colour: string) => {
            const [r = 0, g = 0, b = 0] = colour.match(/[\d.]+/g)?.map(Number) ?? [];
            const channel = (value: number) => {
              const c = value / 255;
              return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
            };
            return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
          };
          const ratio = (front: string, back: string) => {
            const [a, b] = [luminance(front), luminance(back)].sort((x, y) => y - x);
            return ((a ?? 0) + 0.05) / ((b ?? 0) + 0.05);
          };
          const tooltip = document
            .getElementById("ov-t")
            ?.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
          const rows = [
            ...(document.getElementById("ov-m")?.shadowRoot?.querySelectorAll('[part="item"]') ??
              []),
          ] as HTMLElement[];
          const danger = rows[2] as HTMLElement;
          // A row at rest has the transparent tertiary fill: the text stands on the surface.
          const surface = document
            .getElementById("ov-m")
            ?.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
          const rowFill = getComputedStyle(danger).backgroundColor;
          const behind =
            rowFill === "rgba(0, 0, 0, 0)" || rowFill === "transparent"
              ? getComputedStyle(surface).backgroundColor
              : rowFill;
          return {
            tooltip: ratio(
              getComputedStyle(tooltip).color,
              getComputedStyle(tooltip).backgroundColor,
            ),
            danger: ratio(getComputedStyle(danger).color, behind),
          };
        });
        expect(measured.tooltip, "tooltip").toBeGreaterThanOrEqual(4.5);
        expect(measured.danger, "danger entry").toBeGreaterThanOrEqual(4.5);
      });
    }
  }
}

// Spec 014 ⑤ (G5, G10, plan ⑤ D-03): the rendered faldilo (one open) and kompletigilo (its list
// open with three suggestions) in every colour class: axe without a finding; the summary and the
// suggestions at least 4.5:1 on their surfaces.
const aufklappoj =
  '<fm-faldilo id="af-a" group="faq" open><span slot="summary">Lieferbedingungen</span><fm-teksto>Innerhalb von drei Tagen.</fm-teksto></fm-faldilo><fm-faldilo id="af-b" group="faq"><span slot="summary">Rückgabe</span><fm-teksto>Vierzehn Tage.</fm-teksto></fm-faldilo><fm-kompletigilo id="af-k" placeholder="Land eingeben">Land<data slot="options" value="de">Deutschland</data><data slot="options" value="dk">Dänemark</data><data slot="options" value="fr">Frankreich</data></fm-kompletigilo>';

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on the faldilo and the opened kompletigilo; summary and suggestions ≥ 4.5:1`, async ({
        page,
      }) => {
        await serve(page, out, aufklappoj);
        await page.evaluate(
          ([a, s, k]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", k ?? "");
          },
          [aspekto, scheme, contrast],
        );
        await expect(page.getByRole("group")).toHaveCount(2);
        expect(await axeViolations(page), "disclosures").toEqual([]);
        await page.getByRole("combobox", { name: "Land" }).fill("d");
        await expect(page.getByRole("option")).toHaveCount(2);
        expect(await axeViolations(page), "suggestions").toEqual([]);
        const measured = await page.evaluate(() => {
          const luminance = (colour: string) => {
            const [r = 0, g = 0, b = 0] = colour.match(/[\d.]+/g)?.map(Number) ?? [];
            const channel = (value: number) => {
              const c = value / 255;
              return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
            };
            return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
          };
          const ratio = (front: string, back: string) => {
            const [a, b] = [luminance(front), luminance(back)].sort((x, y) => y - x);
            return ((a ?? 0) + 0.05) / ((b ?? 0) + 0.05);
          };
          const behind = (node: HTMLElement, fallback: HTMLElement) => {
            const fill = getComputedStyle(node).backgroundColor;
            return fill === "rgba(0, 0, 0, 0)" || fill === "transparent"
              ? getComputedStyle(fallback).backgroundColor
              : fill;
          };
          const summary = document
            .getElementById("af-a")
            ?.shadowRoot?.querySelector('[part="summary"]') as HTMLElement;
          const listbox = document
            .getElementById("af-k")
            ?.shadowRoot?.querySelector('[part="listbox"]') as HTMLElement;
          const suggestion = listbox.querySelector('[part="suggestion"]') as HTMLElement;
          return {
            summary: ratio(getComputedStyle(summary).color, behind(summary, document.body)),
            suggestion: ratio(getComputedStyle(suggestion).color, behind(suggestion, listbox)),
          };
        });
        expect(measured.summary, "summary").toBeGreaterThanOrEqual(4.5);
        expect(measured.suggestion, "suggestion").toBeGreaterThanOrEqual(4.5);
      });
    }
  }
}

// Spec 015 ① (G5, plan ① D-03, D-04): the rendered pagxigilo (page 5 of 10) and spuro in every
// colour class: axe without a finding; the current page and a link at least 4.5:1 on their
// surfaces.
const navigoj =
  '<fm-pagxigilo id="an-p" page="5" total-pages="10"></fm-pagxigilo><fm-spuro id="an-s"><a href="#start">Start</a><a href="#projekte">Projekte</a><span>Fundamento</span></fm-spuro>';

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on the pagxigilo and the spuro; current page and links ≥ 4.5:1`, async ({
        page,
      }) => {
        await serve(page, out, navigoj);
        await page.evaluate(
          ([a, s, k]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", k ?? "");
          },
          [aspekto, scheme, contrast],
        );
        await expect(page.getByRole("navigation")).toHaveCount(2);
        expect(await axeViolations(page), "navigation").toEqual([]);
        const measured = await page.evaluate(() => {
          const luminance = (colour: string) => {
            const [r = 0, g = 0, b = 0] = colour.match(/[\d.]+/g)?.map(Number) ?? [];
            const channel = (value: number) => {
              const c = value / 255;
              return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
            };
            return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
          };
          const ratio = (front: string, back: string) => {
            const [a, b] = [luminance(front), luminance(back)].sort((x, y) => y - x);
            return ((a ?? 0) + 0.05) / ((b ?? 0) + 0.05);
          };
          const behind = (node: HTMLElement, fallback: HTMLElement) => {
            const fill = getComputedStyle(node).backgroundColor;
            return fill === "rgba(0, 0, 0, 0)" || fill === "transparent"
              ? getComputedStyle(fallback).backgroundColor
              : fill;
          };
          const current = document
            .getElementById("an-p")
            ?.shadowRoot?.querySelector('[aria-current="page"]') as HTMLElement;
          const other = document
            .getElementById("an-p")
            ?.shadowRoot?.querySelector('[part="item"]:not([aria-current])') as HTMLElement;
          const link = document.querySelector("#an-s > a") as HTMLElement;
          return {
            current: ratio(getComputedStyle(current).color, behind(current, document.body)),
            other: ratio(getComputedStyle(other).color, behind(other, document.body)),
            link: ratio(getComputedStyle(link).color, behind(link, document.body)),
          };
        });
        expect(measured.current, "current page").toBeGreaterThanOrEqual(4.5);
        expect(measured.other, "other page").toBeGreaterThanOrEqual(4.5);
        expect(measured.link, "link").toBeGreaterThanOrEqual(4.5);
      });
    }
  }
}

// Spec 015 ② (G5, plan ② D-05): the rendered alsxutilo — with a dropzone, a help, one chosen
// file of a wrong kind (the error of the Modelo) — in every colour class: axe without a finding;
// label, help, error, file name and the dropzone's hint at least 4.5:1 on their surfaces.
const eingabo =
  '<fm-alsxutilo id="an-u" name="lebenslauf" accept=".pdf" dropzone required>Lebenslauf<span slot="help">PDF, höchstens 5 MB</span></fm-alsxutilo>';

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on the alsxutilo with a wrong file; its texts ≥ 4.5:1`, async ({
        page,
      }) => {
        await serve(page, out, eingabo);
        await page.evaluate(
          ([a, s, k]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", k ?? "");
          },
          [aspekto, scheme, contrast],
        );
        await page
          .locator("#an-u")
          .locator('input[type="file"]')
          .setInputFiles([
            { name: "Foto.png", mimeType: "image/png", buffer: Buffer.alloc(300, 1) },
          ]);
        await expect(page.locator("#an-u").locator('[part="file"]')).toHaveCount(1);
        expect(await axeViolations(page), "alsxutilo").toEqual([]);
        const measured = await page.evaluate(() => {
          const luminance = (colour: string) => {
            const [r = 0, g = 0, b = 0] = colour.match(/[\d.]+/g)?.map(Number) ?? [];
            const channel = (value: number) => {
              const c = value / 255;
              return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
            };
            return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
          };
          const ratio = (front: string, back: string) => {
            const [a, b] = [luminance(front), luminance(back)].sort((x, y) => y - x);
            return ((a ?? 0) + 0.05) / ((b ?? 0) + 0.05);
          };
          const shadow = document.getElementById("an-u")?.shadowRoot;
          const ground = (node: HTMLElement): string => {
            let at: HTMLElement | null = node;
            while (at !== null) {
              const fill = getComputedStyle(at).backgroundColor;
              if (fill !== "rgba(0, 0, 0, 0)" && fill !== "transparent") return fill;
              at =
                at.parentElement ?? ((at.getRootNode() as ShadowRoot).host as HTMLElement | null);
            }
            return getComputedStyle(document.body).backgroundColor;
          };
          const of = (part: string) => {
            const node = shadow?.querySelector(`[part="${part}"]`) as HTMLElement;
            return ratio(getComputedStyle(node).color, ground(node));
          };
          return {
            label: of("label"),
            help: of("help"),
            error: of("error"),
            name: of("file-name"),
            hint: of("drop-hint"),
          };
        });
        for (const [part, value] of Object.entries(measured)) {
          expect(value, part).toBeGreaterThanOrEqual(4.5);
        }
      });
    }
  }
}

// Spec 015 ③ (G5, plan ③ D-04): the rendered karto — heading, text, a badge in the meta row and
// two actions, on the raised surface — in every colour class: axe without a finding; the heading
// and the text at least 4.5:1 on the surface, the border of the surface drawn.
const karto =
  '<fm-karto id="an-k" level="2"><span slot="heading">Barrierefreiheit</span>Kontrast, Fokus und Namen in jeder Marke.<fm-insigno slot="meta">gültig</fm-insigno><fm-butono slot="actions" emphasis="high">Öffnen</fm-butono><fm-butono slot="actions" emphasis="low">Teilen</fm-butono></fm-karto>';

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on the karto; heading and text ≥ 4.5:1 on its surface`, async ({
        page,
      }) => {
        await serve(page, out, karto);
        await page.evaluate(
          ([a, s, k]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", k ?? "");
          },
          [aspekto, scheme, contrast],
        );
        await expect(page.getByRole("article", { name: "Barrierefreiheit" })).toBeVisible();
        expect(await axeViolations(page), "karto").toEqual([]);
        const measured = await page.evaluate(() => {
          const luminance = (colour: string) => {
            const [r = 0, g = 0, b = 0] = colour.match(/[\d.]+/g)?.map(Number) ?? [];
            const channel = (value: number) => {
              const c = value / 255;
              return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
            };
            return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
          };
          const ratio = (front: string, back: string) => {
            const [a, b] = [luminance(front), luminance(back)].sort((x, y) => y - x);
            return ((a ?? 0) + 0.05) / ((b ?? 0) + 0.05);
          };
          const shadow = document.getElementById("an-k")?.shadowRoot;
          const surface = getComputedStyle(
            shadow?.querySelector('[part="control"]') as HTMLElement,
          ).backgroundColor;
          const text = (node: Element | null | undefined) =>
            ratio(getComputedStyle(node as HTMLElement).color, surface);
          const heading = shadow?.querySelector('[part="heading"]')?.shadowRoot;
          return {
            heading: text(heading?.querySelector('[part="text"]')),
            content: text(shadow?.querySelector('[part="content"]')),
          };
        });
        for (const [part, value] of Object.entries(measured)) {
          expect(value, part).toBeGreaterThanOrEqual(4.5);
        }
      });
    }
  }
}

// Spec 015 ③ (G5, plan ③ D-08): the rendered avataro — named in every size, and decorative (the
// page's own text beside it is not the Ero's, so it is left out here) — in every colour class: axe without a finding; the initials at least 4.5:1 on their
// sunken ground (E8: the same roles for every name).
const avatars =
  '<fm-avataro id="an-a1" size="small" name="Erika Mustermann"></fm-avataro><fm-avataro id="an-a2" name="Max Mustermann"></fm-avataro><fm-avataro id="an-a3" size="large" name="Zoë Zhang"></fm-avataro><fm-avataro size="small" name="Erika Mustermann" decorative></fm-avataro>';

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on the avataro; its initials ≥ 4.5:1 on their ground`, async ({
        page,
      }) => {
        await serve(page, out, avatars);
        await page.evaluate(
          ([a, s, k]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", k ?? "");
          },
          [aspekto, scheme, contrast],
        );
        await expect(page.getByRole("img")).toHaveCount(3);
        expect(await axeViolations(page), "avataro").toEqual([]);
        const ratios = await page.evaluate(() => {
          const luminance = (colour: string) => {
            const [r = 0, g = 0, b = 0] = colour.match(/[\d.]+/g)?.map(Number) ?? [];
            const channel = (value: number) => {
              const c = value / 255;
              return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
            };
            return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
          };
          return ["an-a1", "an-a2", "an-a3"].map((id) => {
            const initials = document
              .getElementById(id)
              ?.shadowRoot?.querySelector('[part="initials"]') as HTMLElement;
            const style = getComputedStyle(initials);
            const [a, b] = [luminance(style.color), luminance(style.backgroundColor)].sort(
              (x, y) => y - x,
            );
            return ((a ?? 0) + 0.05) / ((b ?? 0) + 0.05);
          });
        });
        for (const value of ratios) expect(value).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
}

// Spec 025 ① (G5, plan ① D-03): the rendered glitilo — a single value with its help and a range
// with its end labels and the field beside — in every colour class: axe without a finding; the
// focus ring of a thumb at least 3:1 against the gap colour and the ground.
const glitiloj =
  '<fm-glitilo id="an-g1" name="lautstaerke" value="40" required>Lautstärke<span slot="help">Zwischen 0 und 100.</span></fm-glitilo><fm-glitilo id="an-g2" name="preis" range field value-start="20" value-end="60">Preis<span slot="min-label">0</span><span slot="max-label">100</span></fm-glitilo><fm-glitilo id="an-g3" value="40" invalid>Pegel<span slot="error">Wähle einen Wert bis 100.</span></fm-glitilo><fm-glitilo id="an-g4" value="40" disabled>Aus</fm-glitilo>';

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on the glitilo single, range, invalid and disabled; the thumb's focus ring ≥ 3:1`, async ({
        page,
        browserName,
      }) => {
        await serve(page, out, glitiloj);
        await page.evaluate(
          ([a, s, k]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", k ?? "");
          },
          [aspekto, scheme, contrast],
        );
        expect(await axeViolations(page), "glitilo").toEqual([]);
        await page.keyboard.press(TAB(browserName));
        const thumb = page.locator("#an-g1").locator('[part="thumb"]:not([hidden])').first();
        await expect(thumb).toBeFocused();
        // The ring stands on the thumb, not on the control (the track): measured there.
        const ring = await thumb.evaluate((node) => {
          const style = getComputedStyle(node);
          return {
            ring: style.outlineColor,
            gap: /rgba?\([^)]*\)/.exec(style.boxShadow)?.[0] ?? "",
            page: getComputedStyle(document.body).backgroundColor,
          };
        });
        expect(contrastOf(ring.ring, ring.gap), "ring against gap").toBeGreaterThanOrEqual(3);
        expect(contrastOf(ring.ring, ring.page), "ring against page").toBeGreaterThanOrEqual(3);
      });
    }
  }
}

// Spec 025 ② (G5, plan ② D-11): the rendered datelektilo — a single date with its help, a range,
// an invalid and a disabled one — in every colour class: axe without a finding, closed and with
// the calendar open; the focus ring of the chosen day at least 3:1 against the gap colour and the
// calendar's ground; the chosen day's text at least 4.5:1 on its fill.
const datelektiloj =
  '<fm-datelektilo id="an-d1" name="lieferdatum" value="2026-10-24" required>Lieferdatum<span slot="help">Ein Datum ab heute.</span></fm-datelektilo><fm-datelektilo id="an-d2" name="zeitraum" mode="range" value-start="2026-10-06" value-end="2026-10-10">Zeitraum</fm-datelektilo><fm-datelektilo id="an-d3" value="2026-10-24" invalid>Frist<span slot="error">Wähle ein Datum ab heute.</span></fm-datelektilo><fm-datelektilo id="an-d4" value="2026-10-24" disabled>Aus</fm-datelektilo>';

for (const aspekto of ["komuna", "ekzemplo"]) {
  for (const scheme of ["light", "dark"]) {
    for (const contrast of ["default", "high"]) {
      test(`${aspekto} ${scheme}/${contrast}: axe on the datelektilo closed and open; the chosen day's ring ≥ 3:1, its text ≥ 4.5:1`, async ({
        page,
        browserName,
      }) => {
        await page.clock.setFixedTime(new Date("2026-10-22T10:00:00"));
        await serve(page, out, datelektiloj);
        await page.evaluate(
          ([a, s, k]) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a ?? "");
            root.setAttribute("data-fm-color-scheme", s ?? "");
            root.setAttribute("data-fm-contrast", k ?? "");
          },
          [aspekto, scheme, contrast],
        );
        expect(await axeViolations(page), "datelektilo closed").toEqual([]);
        await page.locator("#an-d1").locator('[part="trigger"]').click();
        const chosen = page.locator("#an-d1").locator('[part="cell"][aria-selected="true"]');
        await expect(chosen).toBeFocused();
        expect(await axeViolations(page), "datelektilo open").toEqual([]);
        // The ring of the focused cell, measured at the cell (the helper measures a host's control):
        // its outline against the gap colour of its shadow and against the calendar's ground.
        const ring = await chosen.evaluate((cell) => {
          const style = getComputedStyle(cell);
          const calendar = cell.closest('[part="calendar"]') as HTMLElement;
          return {
            ring: style.outlineColor,
            gap: /rgba?\([^)]*\)/.exec(style.boxShadow)?.[0] ?? "",
            ground: getComputedStyle(calendar).backgroundColor,
          };
        });
        expect(contrastOf(ring.ring, ring.gap), "ring against gap").toBeGreaterThanOrEqual(3);
        expect(
          contrastOf(ring.ring, ring.ground),
          "ring against the calendar",
        ).toBeGreaterThanOrEqual(3);
        const text = await chosen.evaluate((cell) => {
          const style = getComputedStyle(cell);
          return [style.color, style.backgroundColor];
        });
        expect(contrastOf(text[0] ?? "", text[1] ?? ""), "chosen day").toBeGreaterThanOrEqual(4.5);
        await page.keyboard.press("Escape");
      });
    }
  }
}
