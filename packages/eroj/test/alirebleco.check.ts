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
