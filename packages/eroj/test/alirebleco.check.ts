// check:alirebleco-eroj (Spec 003 T013; FR-15, plan D-09, AK-05): the rendered fm-butono in every
// colour class of komuna and ekzemplo. axe-core with the WCAG 2.2 A/AA tags on every variant ×
// tone × size in rest, hover, pressed, disabled and loading; the focus ring contrasts at least 3:1
// with the gap colour and with the page background. Chromium, Firefox, WebKit. The first tests
// prove the harness finds what it must find.

import { boundToken, combinationsOf } from "@fundamento/modelo";
import { expect, test } from "@playwright/test";
import { axeViolations, focusRingContrasts, TAB } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out, input } = buildProjections();
const butono = input.modelo.eroj.find((entry) => entry.ero.name === "butono");
if (butono === undefined) throw new Error("butono missing");
const combos = combinationsOf(butono.skemo, ["variant", "tone", "size"]);
const buttons = combos
  .map(
    (c, i) =>
      `<fm-butono id="b${i}" variant="${c.variant}" tone="${c.tone}" size="${c.size}">Aktion ${i}</fm-butono>`,
  )
  .join(" ");

test.describe("the harness finds what it must find", () => {
  test("axe reports a label without contrast", async ({ page }) => {
    await serve(
      page,
      out,
      `<fm-butono variant="primary">Speichern</fm-butono>`,
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
      test(`${aspekto} ${scheme}/${contrast}: axe on every variant × tone × size and state, focus ring ≥ 3:1`, async ({
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
