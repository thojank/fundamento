// fm-avizo in the browser (Spec 011 ③; G4, G7, plan ③ D-09): the notice — a live region (role
// status, alert for danger) whose kind is a visually hidden word before the heading, with heading,
// message, details and up to two actions; dismissible shows a close butono named "Schließen"
// whose click says dismiss (cancelable), hides the notice and moves the focus to the next focusable
// element; the surface and the accent at the start come from the bound tokens per intent.
// Chromium, Firefox and WebKit.

import { boundToken, combinationsOf } from "@fundamento/modelo";
import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const avizo = input.modelo.eroj.find((entry) => entry.ero.name === "avizo");
if (avizo === undefined) throw new Error("avizo missing");
const skemo = avizo.skemo;
const texts = skemo.a11y.texts;
if (texts === undefined) throw new Error("the avizo speaks its kind and 'Schließen'");

const notice = (attributes: string, slots = "") =>
  `<fm-avizo id="a" ${attributes}>Der Import ist gespeichert.${slots}</fm-avizo>`;

test.describe("fm-avizo behaviour", () => {
  test("role status with the kind word hidden before the message; danger is an alert that says 'Fehler:'", async ({
    page,
  }) => {
    await serve(page, out, notice('intent="success"'));
    const region = page.getByRole("status");
    await expect(region).toBeVisible();
    // The message is slotted light DOM: the host reads it; the word stands in the shadow tree.
    await expect(page.locator("#a")).toHaveText(/Der Import ist gespeichert\./);
    await expect(region).toHaveText(/^Erfolg:/);
    const hiddenWord = await page.locator("#a").evaluate((element) => {
      const word = element.shadowRoot?.getElementById("fm-texts") as HTMLElement;
      return { text: word.textContent, clip: getComputedStyle(word).clipPath, hidden: word.hidden };
    });
    expect(hiddenWord).toEqual({
      text: texts["intent-success"]?.de,
      clip: "inset(50%)",
      hidden: false,
    });
    await page.locator("#a").evaluate((element) => element.setAttribute("intent", "danger"));
    await expect(page.getByRole("status")).toHaveCount(0);
    await expect(page.getByRole("alert")).toHaveText(/^Fehler:/);
    // In an English document the English word is heard.
    await page.evaluate(() => document.documentElement.setAttribute("lang", "en"));
    await page.locator("#a").evaluate((element) => element.setAttribute("intent", "warning"));
    await expect(page.getByRole("status")).toHaveText(/^Warning:/);
  });

  test("heading, details and actions show only while they have content; the parts of the notice", async ({
    page,
  }) => {
    await serve(page, out, notice('intent="info"'));
    const visible = (part: string) =>
      page.locator("#a").evaluate((element, p) => {
        const node = element.shadowRoot?.querySelector(`[part="${p}"]`) as HTMLElement;
        return !node.hidden && getComputedStyle(node).display !== "none";
      }, part);
    expect(await visible("heading")).toBe(false);
    expect(await visible("details")).toBe(false);
    expect(await visible("actions")).toBe(false);
    expect(await visible("dismiss")).toBe(false);
    await page.locator("#a").evaluate((element) => {
      element.insertAdjacentHTML(
        "beforeend",
        '<span slot="heading">Import</span><ul slot="details"><li>Zeile 3: Titel fehlt</li></ul><fm-butono slot="actions" emphasis="medium">Datei erneut wählen</fm-butono>',
      );
    });
    expect(await visible("heading")).toBe(true);
    expect(await visible("details")).toBe(true);
    expect(await visible("actions")).toBe(true);
    expect(
      await page
        .locator("#a")
        .evaluate((element) =>
          [...(element.shadowRoot?.querySelectorAll("[part]") ?? [])].map((n) =>
            n.getAttribute("part"),
          ),
        ),
    ).toEqual(["control", "icon", "heading", "message", "details", "actions", "dismiss"]);
  });

  test("dismissible: a close butono named 'Schließen'; its click says dismiss, hides the notice and moves the focus on", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-butono id="before">Davor</fm-butono>${notice('intent="warning" dismissible')}<fm-butono id="after">Danach</fm-butono>`,
    );
    await page.evaluate(() => {
      (window as unknown as { heard: string[] }).heard = [];
      document
        .getElementById("a")
        ?.addEventListener("dismiss", () =>
          (window as unknown as { heard: string[] }).heard.push("dismiss"),
        );
    });
    const close = page.getByRole("button", { name: texts.dismissible?.de ?? "" });
    await expect(close).toBeVisible();
    await close.click();
    expect(await page.evaluate(() => (window as unknown as { heard: string[] }).heard)).toEqual([
      "dismiss",
    ]);
    await expect(page.locator("#a")).toBeHidden();
    await expect(page.locator("#a")).toHaveAttribute("hidden", "");
    await expect(page.locator("#after")).toBeFocused();
  });

  test("a prevented dismiss keeps the notice; without a next element the focus goes back", async ({
    page,
  }) => {
    await serve(page, out, `<fm-butono id="before">Davor</fm-butono>${notice("dismissible")}`);
    await page.evaluate(() => {
      document
        .getElementById("a")
        ?.addEventListener("dismiss", (event) => event.preventDefault(), { once: true });
    });
    const close = page.getByRole("button", { name: texts.dismissible?.de ?? "" });
    await close.click();
    await expect(page.locator("#a")).toBeVisible();
    await close.click();
    await expect(page.locator("#a")).toBeHidden();
    await expect(page.locator("#before")).toBeFocused();
  });

  test("the host takes the width of its container (Uzo size container); the accent stands at the start", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div id="w" style="inline-size: 24rem">${notice('intent="info"')}</div>`,
    );
    const outer = await page.locator("#w").boundingBox();
    const control = await page.locator("#a").evaluate((element) => {
      const node = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      const style = getComputedStyle(node);
      return {
        width: node.getBoundingClientRect().width,
        start: Number.parseFloat(style.borderInlineStartWidth),
        end: Number.parseFloat(style.borderInlineEndWidth),
      };
    });
    expect(Math.round(control.width)).toBe(Math.round(outer?.width ?? 0));
    expect(control.start).toBeGreaterThan(control.end);
  });
});

/** The rgb() string a browser computes for a resolved colour token. */
function rgb(value: unknown): string {
  const color = value as { components: number[]; alpha?: number; hex?: string };
  // The browser derives its rgb() from the hex the token resolves to; a component rounded on its
  // own may land one step off (warning.weak: 0.9471 × 255 = 241.5).
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
          `<fm-avizo id="k${i}" intent="${c.intent}">Meldung ${i}<span slot="heading">Überschrift</span></fm-avizo>`,
      )
      .join(" ");
    await serve(page, out, body);
    await page.evaluate(
      (value) => document.documentElement.setAttribute("data-fm-aspekto", value),
      aspekto,
    );
    for (const [i, c] of combos.entries()) {
      const actual = await page.locator(`#k${i}`).evaluate((element) => {
        const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        const heading = element.shadowRoot?.querySelector('[part="heading"]') as HTMLElement;
        const message = element.shadowRoot?.querySelector('[part="message"]') as HTMLElement;
        const style = getComputedStyle(control);
        return {
          fill: style.backgroundColor,
          accent: style.borderInlineStartColor,
          heading: getComputedStyle(heading).color,
          message: getComputedStyle(message).color,
          headingSize: getComputedStyle(heading).fontSize,
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
      const typography = token("heading", "typography") as { fontSize: { value: number } };
      expect(actual, `${aspekto} ${JSON.stringify(combination)}`).toEqual({
        fill: rgb(token("surface", "fill")),
        accent: rgb(token("accent", "color")),
        heading: rgb(token("heading", "color")),
        message: rgb(token("message", "color")),
        headingSize: `${typography.fontSize.value}px`,
      });
    }
  });
}

// Spec 014 ② (G3, G6): the notice shows the icon of its intent before its texts — an fm-ikono of
// the intent's name, decorative (the intent word is heard already), in the accent's colour — and
// its dismiss butono carries the ikono close instead of a hand-drawn cross.
test("the icon of the intent stands before the texts, decorative, in the accent's colour; the dismiss butono carries ikono close", async ({
  page,
}) => {
  await serve(
    page,
    out,
    `<fm-avizo id="a" intent="danger" dismissible>Konnte nicht speichern.</fm-avizo>`,
  );
  const icon = await page.locator("#a").evaluate((element) => {
    const holder = element.shadowRoot?.querySelector('[part="icon"]') as HTMLElement;
    const ikono = holder.querySelector("fm-ikono");
    const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
    return {
      hidden: holder.getAttribute("aria-hidden"),
      name: ikono?.getAttribute("name"),
      colour: getComputedStyle(holder).color,
      accent: getComputedStyle(control).borderInlineStartColor,
      first: control.firstElementChild === holder,
      dismiss: element.shadowRoot?.querySelector('[part="dismiss"] fm-ikono')?.getAttribute("name"),
    };
  });
  expect(icon.hidden).toBe("true");
  expect(icon.name).toBe("danger");
  expect(icon.colour).toBe(icon.accent);
  expect(icon.first).toBe(true);
  expect(icon.dismiss).toBe("close");
  await page.locator("#a").evaluate((element) => element.setAttribute("intent", "success"));
  await expect(page.locator("#a").locator('[part="icon"] fm-ikono')).toHaveAttribute("name", "success");
});
