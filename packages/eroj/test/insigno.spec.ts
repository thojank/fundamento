// fm-insigno in the browser (Spec 011 ③; G4, G7, plan ③ D-08): the badge — static text in a pill,
// no role attribute, the label visible and the description present for assistive technology but
// clipped from sight; every colour from the bound tokens per intent, the size a minimum the text
// may grow. Chromium, Firefox and WebKit.

import { boundToken, combinationsOf } from "@fundamento/modelo";
import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const insigno = input.modelo.eroj.find((entry) => entry.ero.name === "insigno");
if (insigno === undefined) throw new Error("insigno missing");
const skemo = insigno.skemo;

test.describe("fm-insigno behaviour", () => {
  test("a span without a role carries the label; the description is in the accessible text but not visible", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-insigno id="a" intent="info">In Prüfung<span slot="description">Die Version wird von zwei Prüfern gelesen.</span></fm-insigno>`,
    );
    const host = page.locator("#a");
    await expect(host).toHaveText(/In Prüfung/);
    const inner = await host.evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      const description = element.shadowRoot?.querySelector('[part="description"]') as HTMLElement;
      const box = description.getBoundingClientRect();
      return {
        tag: control.tagName,
        role: control.getAttribute("role"),
        clip: getComputedStyle(description).clipPath,
        position: getComputedStyle(description).position,
        hidden: description.hidden,
        hasText: (description.querySelector("slot") as HTMLSlotElement).assignedNodes().length,
        area: box.width * box.height,
      };
    });
    expect(inner.tag).toBe("SPAN");
    expect(inner.role).toBeNull();
    expect(inner.clip).toBe("inset(50%)");
    expect(inner.position).toBe("absolute");
    expect(inner.hidden).toBe(false);
    expect(inner.hasText).toBe(1);
    // Playwright reads the accessible text of the host including the clipped description.
    await expect(host).toHaveText(/zwei Prüfern/);
    // The description takes no visible room: the badge is as wide as its label alone.
    const width = await host.evaluate(
      (element) =>
        element.shadowRoot?.querySelector('[part="control"]')?.getBoundingClientRect().width ?? 0,
    );
    expect(width).toBeLessThan(200);
  });

  test("the badge is a pill, never wraps, and grows with its text; medium is taller than small", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div style="inline-size: 6rem"><fm-insigno id="s" size="small">Entwurf</fm-insigno><fm-insigno id="m" size="medium">Entwurf</fm-insigno><fm-insigno id="l" size="medium">Diese Version wird gerade geprüft</fm-insigno></div>`,
    );
    const measure = (id: string) =>
      page.locator(`#${id}`).evaluate((element) => {
        const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        const box = control.getBoundingClientRect();
        const style = getComputedStyle(control);
        return {
          height: box.height,
          width: box.width,
          radius: Number.parseFloat(style.borderTopLeftRadius),
          whiteSpace: style.whiteSpace,
          lines: Math.round(box.height / Number.parseFloat(style.lineHeight)),
        };
      });
    const small = await measure("s");
    const medium = await measure("m");
    const long = await measure("l");
    expect(medium.height).toBeGreaterThan(small.height);
    expect(small.radius).toBeGreaterThanOrEqual(small.height / 2 - 1);
    expect(small.whiteSpace).toBe("nowrap");
    // A long label does not wrap into lines (the Uzo says never; the rule says three words).
    expect(long.height).toBe(medium.height);
    expect(long.width).toBeGreaterThan(medium.width);
  });

  test("no state of its own: hover, focus and click change nothing, the badge is not focusable", async ({
    page,
  }) => {
    await serve(page, out, `<fm-insigno id="a" intent="danger">3 Verstöße</fm-insigno>`);
    const colours = () =>
      page.locator("#a").evaluate((element) => {
        const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        const style = getComputedStyle(control);
        return [style.backgroundColor, style.color, style.borderTopColor];
      });
    const rest = await colours();
    await page.locator("#a").hover();
    expect(await colours()).toEqual(rest);
    await page.locator("#a").click();
    expect(await colours()).toEqual(rest);
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe("BODY");
  });
});

/** The rgb() string a browser computes for a resolved colour token. */
function rgb(value: unknown): string {
  const color = value as { components: number[]; alpha?: number };
  const [r, g, b] = color.components.map((c) => Math.round(c * 255));
  return color.alpha === undefined || color.alpha >= 1
    ? `rgb(${r}, ${g}, ${b})`
    : `rgba(${r}, ${g}, ${b}, ${color.alpha})`;
}

for (const aspekto of ["komuna", "ekzemplo"]) {
  test(`${aspekto}: computed styles of every intent × size equal the bound tokens (AK-03, S5)`, async ({
    page,
  }) => {
    const rezolvo = input.rezolvoj.rezolvoj.find(
      (candidate) =>
        candidate.assignment.aspekto === aspekto &&
        candidate.assignment["color-scheme"] === "light" &&
        candidate.assignment.contrast === "default" &&
        candidate.assignment.density === "default" &&
        candidate.assignment.viewport === "medium" &&
        candidate.assignment.motion === "reduced",
    );
    if (rezolvo === undefined) throw new Error("combination missing");
    const combos = combinationsOf(skemo, ["intent", "size"]);
    const body = combos
      .map(
        (c, i) =>
          `<fm-insigno id="k${i}" intent="${c.intent}" size="${c.size}">Status ${i}</fm-insigno>`,
      )
      .join(" ");
    await serve(page, out, body);
    await page.evaluate(
      (value) => document.documentElement.setAttribute("data-fm-aspekto", value),
      aspekto,
    );
    let checked = 0;
    for (const [i, c] of combos.entries()) {
      const actual = await page.locator(`#k${i}`).evaluate((element) => {
        const control = element.shadowRoot?.querySelector('[part="control"]');
        if (!(control instanceof Element)) return null;
        const style = getComputedStyle(control);
        return {
          fill: style.backgroundColor,
          border: style.borderInlineStartColor,
          text: style.color,
          minHeight: style.minBlockSize,
          padding: style.paddingInlineStart,
        };
      });
      const combination = { ...c, state: "rest" };
      const token = (part: string, property: string) => {
        const bound = boundToken(skemo, part, property, combination);
        const value = bound === undefined ? undefined : rezolvo.tokens[bound.token]?.value;
        if (value === undefined)
          throw new Error(`${part}.${property} unbound in ${JSON.stringify(combination)}`);
        return value;
      };
      const px = (value: unknown) => `${(value as { value: number }).value}px`;
      expect(actual, `${aspekto} ${JSON.stringify(combination)}`).toEqual({
        fill: rgb(token("surface", "fill")),
        border: rgb(token("border", "color")),
        text: rgb(token("text", "color")),
        minHeight: px(token("box", "height")),
        padding: px(token("box", "inline-padding")),
      });
      checked++;
    }
    expect(checked).toBe(10);
  });
}
