// fm-mezurilo in the browser (Spec 011 ④; G4, G7, plan ④ D-08): the meter — role meter, named by
// its label, its value text as aria-valuetext and description, aria-valuenow only while the value
// is known; the fill as wide as the share of the range; an unknown value shows no fill and a dashed
// track, clearly not 0. Chromium, Firefox and WebKit.

import { boundToken, combinationsOf, eroTokenOf } from "@fundamento/modelo";
import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const mezurilo = input.modelo.eroj.find((entry) => entry.ero.name === "mezurilo");
if (mezurilo === undefined) throw new Error("mezurilo missing");
const skemo = mezurilo.skemo;

const meter = (attributes: string, text: string) =>
  `<fm-mezurilo id="m" ${attributes}>Konformität<span slot="value-text">${text}</span></fm-mezurilo>`;

test.describe("fm-mezurilo behaviour", () => {
  test("role meter named by its label, value text as aria-valuetext and description, min/max/now from the props", async ({
    page,
  }) => {
    await serve(page, out, meter('value="66"', "66 % von 3 prüfbaren"));
    const region = page.getByRole("meter", { name: "Konformität" });
    await expect(region).toBeVisible();
    await expect(region).toHaveAttribute("aria-valuenow", "66");
    await expect(region).toHaveAttribute("aria-valuemin", "0");
    await expect(region).toHaveAttribute("aria-valuemax", "100");
    await expect(region).toHaveAttribute("aria-valuetext", "66 % von 3 prüfbaren");
    await expect(region).toHaveAccessibleDescription("66 % von 3 prüfbaren");
    const widths = await page.locator("#m").evaluate((element) => {
      const track = element.shadowRoot?.querySelector('[part="track"]') as HTMLElement;
      const fill = element.shadowRoot?.querySelector('[part="fill"]') as HTMLElement;
      return {
        track: track.getBoundingClientRect().width,
        fill: fill.getBoundingClientRect().width,
      };
    });
    expect(widths.fill / widths.track).toBeCloseTo(0.66, 1);
    await page.locator("#m").evaluate((element) => {
      element.setAttribute("min", "0");
      element.setAttribute("max", "5");
      element.setAttribute("value", "3");
    });
    await expect(region).toHaveAttribute("aria-valuenow", "3");
    const share = await page.locator("#m").evaluate((element) => {
      const track = element.shadowRoot?.querySelector('[part="track"]') as HTMLElement;
      const fill = element.shadowRoot?.querySelector('[part="fill"]') as HTMLElement;
      return fill.getBoundingClientRect().width / track.getBoundingClientRect().width;
    });
    expect(share).toBeCloseTo(0.6, 1);
  });

  test("an unknown value: the text says so, no fill, a dashed track edge (not 0)", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `${meter("", "nicht geprüft")}<fm-mezurilo id="z" value="0">Null<span slot="value-text">0 von 3 geprüft</span></fm-mezurilo>`,
    );
    const region = page.getByRole("meter", { name: "Konformität" });
    // ARIA requires aria-valuenow on a meter: the start of the range stands there, the text says
    // what is heard — never 0 % (plan ④ D-08, Abweichung 13).
    await expect(region).toHaveAttribute("aria-valuenow", "0");
    await expect(region).toHaveAttribute("aria-valuetext", "nicht geprüft");
    const look = (id: string) =>
      page.locator(`#${id}`).evaluate((element) => {
        const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        const track = element.shadowRoot?.querySelector('[part="track"]') as HTMLElement;
        const fill = element.shadowRoot?.querySelector('[part="fill"]') as HTMLElement;
        return {
          unknown: control.hasAttribute("data-unknown"),
          border: getComputedStyle(track).borderTopStyle,
          fill: getComputedStyle(fill).display,
          fillWidth: fill.getBoundingClientRect().width,
        };
      });
    const unknown = await look("m");
    expect(unknown.unknown).toBe(true);
    expect(unknown.border).toBe("dashed");
    expect(unknown.fill).toBe("none");
    const zero = await look("z");
    expect(zero.unknown).toBe(false);
    expect(zero.border).not.toBe("dashed");
    expect(zero.fillWidth).toBe(0);
    await expect(page.getByRole("meter", { name: "Null" })).toHaveAttribute("aria-valuenow", "0");
  });

  test("the host takes the width of its container; no state of its own, not focusable", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div id="w" style="inline-size: 20rem">${meter('value="50"', "50 %")}</div>`,
    );
    const outer = await page.locator("#w").boundingBox();
    const track = await page
      .locator("#m")
      .evaluate(
        (element) =>
          element.shadowRoot?.querySelector('[part="track"]')?.getBoundingClientRect().width ?? 0,
      );
    expect(Math.round(track)).toBe(Math.round(outer?.width ?? 0));
    await page.locator("#m").click();
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe("BODY");
  });
});

/** The rgb() string a browser computes for a resolved colour token. */
function rgb(value: unknown): string {
  const color = value as { components: number[]; alpha?: number; hex?: string };
  const [r, g, b] =
    typeof color.hex === "string"
      ? [1, 3, 5].map((at) => Number.parseInt(color.hex?.slice(at, at + 2) ?? "0", 16))
      : color.components.map((c) => Math.round(c * 255));
  return color.alpha === undefined || color.alpha >= 1
    ? `rgb(${r}, ${g}, ${b})`
    : `rgba(${r}, ${g}, ${b}, ${color.alpha})`;
}

for (const aspekto of ["komuna", "ekzemplo"]) {
  test(`${aspekto}: computed styles of every intent equal the bound tokens (AK-03, S5)`, async ({
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
    const combos = combinationsOf(skemo, ["intent"]);
    const body = combos
      .map(
        (c, i) =>
          `<fm-mezurilo id="k${i}" intent="${c.intent}" value="40">Wert ${i}<span slot="value-text">40 von 100</span></fm-mezurilo>`,
      )
      .join(" ");
    await serve(page, out, body);
    await page.evaluate(
      (value) => document.documentElement.setAttribute("data-fm-aspekto", value),
      aspekto,
    );
    for (const [i, c] of combos.entries()) {
      const actual = await page.locator(`#k${i}`).evaluate((element) => {
        const track = element.shadowRoot?.querySelector('[part="track"]') as HTMLElement;
        const fill = element.shadowRoot?.querySelector('[part="fill"]') as HTMLElement;
        const label = element.shadowRoot?.querySelector('[part="label"]') as HTMLElement;
        return {
          track: getComputedStyle(track).backgroundColor,
          fill: getComputedStyle(fill).backgroundColor,
          label: getComputedStyle(label).color,
          height: getComputedStyle(track).minBlockSize,
        };
      });
      const combination = { ...c, state: "rest" };
      const token = (part: string, property: string) => {
        // Spec 029 ①b: the part reads its Ero-Token; komuna sets its own values there.
        const bound =
          eroTokenOf(mezurilo, part, property, combination) ??
          boundToken(skemo, part, property, combination)?.token;
        const value = bound === undefined ? undefined : rezolvo.tokens[bound]?.value;
        if (value === undefined)
          throw new Error(`${part}.${property} unbound in ${JSON.stringify(combination)}`);
        return value;
      };
      expect(actual, `${aspekto} ${JSON.stringify(combination)}`).toEqual({
        track: rgb(token("track", "fill")),
        fill: rgb(token("fill", "color")),
        label: rgb(token("label", "color")),
        height: `${(token("track", "height") as { value: number }).value}px`,
      });
    }
  });
}
