// fm-butono in the browser (Spec 003 T011; FR-07, plan D-07, AK-03 for the component, WCAG 2.5.8).
// Chromium, Firefox and WebKit (playwright.config.ts).

import { boundToken, combinationsOf, eroTokenOf } from "@fundamento/modelo";
import { expect, test } from "@playwright/test";

/** WebKit on macOS moves Tab focus to buttons only with Alt+Tab (system default). */
const TAB = (browserName: string) => (browserName === "webkit" ? "Alt+Tab" : "Tab");

import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const butono = input.modelo.eroj.find((entry) => entry.ero.name === "butono");
if (butono === undefined) throw new Error("butono missing");
const skemo = butono.skemo;

test.describe("fm-butono behaviour", () => {
  test("role button, name from the slot, from the label prop when icon-only", async ({ page }) => {
    await serve(
      page,
      out,
      `<fm-butono id="a">Speichern</fm-butono><fm-butono id="b" label="Schließen"><svg slot="icon-start" aria-hidden="true"></svg></fm-butono>`,
    );
    await expect(page.getByRole("button", { name: "Speichern" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Schließen" })).toBeVisible();
  });

  test("Tab reaches it, Enter and Space activate it, disabled is skipped", async ({
    page,
    browserName,
  }) => {
    await serve(
      page,
      out,
      `<fm-butono id="a">Eins</fm-butono><fm-butono id="b" disabled>Zwei</fm-butono><fm-butono id="c">Drei</fm-butono>`,
    );
    await page.evaluate(() => {
      (window as unknown as { clicks: string[] }).clicks = [];
      for (const id of ["a", "b", "c"]) {
        document.getElementById(id)?.addEventListener("click", () => {
          (window as unknown as { clicks: string[] }).clicks.push(id);
        });
      }
    });
    await page.keyboard.press(TAB(browserName));
    await expect(page.locator("#a")).toBeFocused();
    await page.keyboard.press("Enter");
    await page.keyboard.press(TAB(browserName));
    await expect(page.locator("#c")).toBeFocused();
    await page.keyboard.press("Space");
    expect(await page.evaluate(() => (window as unknown as { clicks: string[] }).clicks)).toEqual([
      "a",
      "c",
    ]);
  });

  test("loading keeps focus, announces busy and swallows activation", async ({
    page,
    browserName,
  }) => {
    await serve(page, out, `<fm-butono id="a">Senden</fm-butono>`);
    await page.evaluate(() => {
      (window as unknown as { clicks: number }).clicks = 0;
      document.getElementById("a")?.addEventListener("click", () => {
        (window as unknown as { clicks: number }).clicks++;
      });
    });
    await page.keyboard.press(TAB(browserName));
    await page.locator("#a").evaluate((element) => element.setAttribute("loading", ""));
    await expect(page.locator("#a")).toBeFocused();
    const button = page.getByRole("button", { name: "Senden" });
    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button).toHaveAttribute("aria-disabled", "true");
    await page.keyboard.press("Enter");
    expect(await page.evaluate(() => (window as unknown as { clicks: number }).clicks)).toBe(0);
  });

  test("type=submit submits and type=reset resets the outer form", async ({ page }) => {
    await serve(
      page,
      out,
      `<form id="f"><input id="i" name="i" value="x"><fm-butono id="r" type="reset">Zurücksetzen</fm-butono><fm-butono id="s" type="submit">Senden</fm-butono></form>`,
    );
    await page.evaluate(() => {
      (window as unknown as { submitted: number }).submitted = 0;
      document.getElementById("f")?.addEventListener("submit", (event) => {
        event.preventDefault();
        (window as unknown as { submitted: number }).submitted++;
      });
    });
    await page.fill("#i", "changed");
    await page.click("#r");
    await expect(page.locator("#i")).toHaveValue("x");
    await page.click("#s");
    expect(await page.evaluate(() => (window as unknown as { submitted: number }).submitted)).toBe(
      1,
    );
  });

  test("an invalid value falls back to the default and warns once, naming the allowed values", async ({
    page,
  }) => {
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning") warnings.push(message.text());
    });
    await serve(page, out, `<fm-butono id="a" emphasis="ghost">A</fm-butono>`);
    expect(
      await page
        .locator("#a")
        .evaluate((element) => (element as HTMLElement & { emphasis: string }).emphasis),
    ).toBe("medium");
    expect(warnings.filter((text) => text.includes("ghost"))).toHaveLength(1);
    expect(warnings[0]).toContain("high, medium, low");
  });

  test("intent=danger with emphasis=medium renders intent=neutral and warns with the kialo", async ({
    page,
  }) => {
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning") warnings.push(message.text());
    });
    await serve(page, out, `<fm-butono id="a" emphasis="medium" intent="danger">A</fm-butono>`);
    const control = page.locator("#a").locator('[part="control"]');
    await expect(control).toHaveAttribute("data-intent", "neutral");
    expect(warnings.join("\n")).toContain(skemo.constraints?.[0]?.kialo ?? "?");
  });

  test("delegates focus to the inner button and exposes only ::part(control)", async ({ page }) => {
    await serve(page, out, `<fm-butono id="a">A</fm-butono>`);
    await page.locator("#a").focus();
    expect(
      await page
        .locator("#a")
        .evaluate((element) => element.shadowRoot?.activeElement?.getAttribute("part")),
    ).toBe("control");
    expect(
      await page
        .locator("#a")
        .evaluate((element) =>
          [...(element.shadowRoot?.querySelectorAll("[part]") ?? [])].map((n) =>
            n.getAttribute("part"),
          ),
        ),
    ).toEqual(["control"]);
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
  test(`${aspekto}: computed styles of every emphasis × intent × size × state equal the bound tokens (AK-03)`, async ({
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
    const combos = combinationsOf(skemo, ["emphasis", "intent", "size"]);
    const body = combos
      .map(
        (c, i) =>
          `<fm-butono id="b${i}" emphasis="${c.emphasis}" intent="${c.intent}" size="${c.size}">Aktion</fm-butono>`,
      )
      .join(" ");
    await serve(page, out, body);
    await page.evaluate(
      (value) => document.documentElement.setAttribute("data-fm-aspekto", value),
      aspekto,
    );
    let checked = 0;
    for (const [i, c] of combos.entries()) {
      for (const state of ["rest", "hover", "pressed", "disabled", "loading"]) {
        const host = page.locator(`#b${i}`);
        await host.evaluate((element, s) => {
          element.toggleAttribute("disabled", s === "disabled");
          element.toggleAttribute("loading", s === "loading");
        }, state);
        if (state === "hover" || state === "pressed") await host.hover();
        else await page.mouse.move(0, 0);
        if (state === "pressed") await page.mouse.down();
        const actual = await host.evaluate((element) => {
          const control = element.shadowRoot?.querySelector('[part="control"]');
          if (control === null || control === undefined) return null;
          const style = getComputedStyle(control);
          return {
            fill: style.backgroundColor,
            color: style.color,
            border: style.borderInlineStartColor,
            height: style.minBlockSize,
            padding: style.paddingInlineStart,
          };
        });
        if (state === "pressed") await page.mouse.up();
        const combination = { ...c, state };
        // Spec 029 ①b: a part reads its Ero-Token (Art. IV, v2.3); komuna sets its own values
        // there, every other brand keeps the alias of the binding.
        const token = (part: string, property: string) => {
          const bound =
            eroTokenOf(butono, part, property, combination) ??
            boundToken(skemo, part, property, combination)?.token;
          const value = bound === undefined ? undefined : rezolvo.tokens[bound]?.value;
          if (value === undefined)
            throw new Error(`${part}.${property} unbound in ${JSON.stringify(combination)}`);
          return value;
        };
        const px = (value: unknown) => `${(value as { value: number }).value}px`;
        expect(actual, `${aspekto} ${JSON.stringify(combination)}`).toEqual({
          fill: rgb(token("surface", "fill")),
          color: rgb(token("label", "color")),
          border: rgb(token("border", "color")),
          height: px(token("box", "height")),
          padding: px(token("box", "inline-padding")),
        });
        checked++;
      }
    }
    expect(checked).toBe(4 * 3 * 5);
  });
}

test("every size is at least size.target.min wide and high in every density and viewport, also icon-only (WCAG 2.5.8)", async ({
  page,
}) => {
  await serve(
    page,
    out,
    ["small", "medium", "large"]
      .map(
        (size) =>
          `<fm-butono size="${size}" label="x"><svg slot="icon-start" aria-hidden="true" width="1" height="1"></svg></fm-butono>`,
      )
      .join(""),
  );
  for (const density of ["compact", "default", "comfortable"]) {
    for (const viewport of ["compact", "medium", "expanded"]) {
      await page.evaluate(
        ([d, v]) => {
          document.documentElement.setAttribute("data-fm-density", d ?? "");
          document.documentElement.setAttribute("data-fm-viewport", v ?? "");
        },
        [density, viewport],
      );
      const boxes = await page
        .locator("fm-butono")
        .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect()));
      for (const box of boxes) {
        expect(box.width, `${density} ${viewport}`).toBeGreaterThanOrEqual(24);
        expect(box.height, `${density} ${viewport}`).toBeGreaterThanOrEqual(24);
      }
    }
  }
});

// Spec 029 ①b (Abnahme 28.10., 17:19; O-1b-4 decided 17:22): the inline padding of the Fonto
// (12 px in every size) for a butono with a word; a butono with only an icon is square without
// padding, so nothing runs over – alone and wherever an Ero carries one.
test("komuna: a butono with a word has 12 px inline padding in every size; one with only an icon is square without padding, its icon inside", async ({
  page,
}) => {
  const sizes = ["small", "medium", "large"];
  await serve(
    page,
    out,
    sizes
      .map(
        (size) =>
          `<fm-butono data-wort size="${size}">Aktion</fm-butono><fm-butono data-icon size="${size}" label="Schließen"><fm-ikono slot="icon-start" name="close"></fm-ikono></fm-butono>`,
      )
      .join(""),
  );
  const look = (selector: string) =>
    page.locator(selector).evaluateAll((elements) =>
      elements.map((element) => {
        const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        const icon = element.querySelector("fm-ikono")?.getBoundingClientRect();
        const box = control.getBoundingClientRect();
        const style = getComputedStyle(control);
        return {
          size: element.getAttribute("size"),
          padding: [style.paddingInlineStart, style.paddingInlineEnd],
          width: box.width,
          height: box.height,
          inside:
            icon === undefined ||
            (icon.left >= box.left - 0.5 &&
              icon.right <= box.right + 0.5 &&
              icon.top >= box.top - 0.5 &&
              icon.bottom <= box.bottom + 0.5),
        };
      }),
    );
  for (const word of await look("fm-butono[data-wort]")) {
    expect(word.padding, `${word.size}`).toEqual(["12px", "12px"]);
  }
  for (const icon of await look("fm-butono[data-icon]")) {
    expect(icon.padding, `${icon.size}`).toEqual(["0px", "0px"]);
    expect(
      Math.abs(icon.width - icon.height),
      `${icon.size}: ${icon.width}×${icon.height}`,
    ).toBeLessThan(0.5);
    expect(icon.inside, `${icon.size}`).toBe(true);
  }
});

test("komuna: every butono with only an icon inside an Ero stays inside its part, square, without padding", async ({
  page,
}) => {
  await serve(
    page,
    out,
    [
      '<fm-datelektilo value="2026-10-24">Lieferdatum</fm-datelektilo>',
      '<fm-kampo kind="number" stepper value="3">Anzahl</fm-kampo>',
      '<fm-lokredaktilo label="Titel" value="Bericht"></fm-lokredaktilo>',
      '<fm-pagxigilo page="2" total-pages="5"></fm-pagxigilo>',
      "<fm-avizo dismissible>Gespeichert.</fm-avizo>",
      '<fm-signeto mode="removable">Entwurf</fm-signeto>',
    ].join(""),
  );
  const found = await page.evaluate(() => {
    const results: {
      host: string;
      part: string;
      overflow: boolean;
      square: boolean;
      padding: string;
    }[] = [];
    for (const host of document.querySelectorAll("body > *")) {
      for (const button of host.shadowRoot?.querySelectorAll("fm-butono") ?? []) {
        const outer = button.getBoundingClientRect();
        if (outer.width === 0 || (button as HTMLElement).hidden) continue;
        const text = [...button.childNodes]
          .map((node) => node.textContent ?? "")
          .join("")
          .trim();
        if (text !== "") continue;
        const control = button.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        const inner = control.getBoundingClientRect();
        results.push({
          host: host.localName,
          part: button.getAttribute("part") ?? "",
          overflow: inner.width > outer.width + 0.5 || inner.height > outer.height + 0.5,
          square: Math.abs(inner.width - inner.height) < 0.5,
          padding: getComputedStyle(control).paddingInlineStart,
        });
      }
    }
    return results;
  });
  expect(found.length).toBeGreaterThanOrEqual(6);
  for (const button of found) {
    const name = `${button.host} ${button.part}`;
    expect(button.overflow, name).toBe(false);
    expect(button.square, name).toBe(true);
    expect(button.padding, name).toBe("0px");
  }
});

// Spec 029 ①b c) (Abnahme ① des Maintainers, 27.10.): a disabled butono with emphasis=high showed
// no text — label and fill resolved to the same grey in komuna. The text of a disabled element
// stays visible: pale, but readable. The Fonto draws „disabled“ as its own variant at half the
// opacity (measured 3,3–4:1 between text and fill); komuna keeps at least 3:1, in both schemes.
test("komuna: a disabled butono shows its label in every emphasis × intent × size, at least 3:1 against its fill, light and dark", async ({
  page,
}) => {
  const combos = combinationsOf(skemo, ["emphasis", "intent", "size"]);
  await serve(
    page,
    out,
    combos
      .map(
        (c, i) =>
          `<fm-butono id="d${i}" emphasis="${c.emphasis}" intent="${c.intent}" size="${c.size}" disabled>Aktion</fm-butono>`,
      )
      .join(" "),
  );
  const parse = (value: string): number[] => {
    const parts = value.match(/[\d.]+/g)?.map(Number) ?? [];
    return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts[3] ?? 1];
  };
  const over = (top: number[], bottom: number[]): number[] =>
    [0, 1, 2].map((i) => (top[i] ?? 0) * (top[3] ?? 1) + (bottom[i] ?? 0) * (1 - (top[3] ?? 1)));
  const luminance = (rgb: number[]): number =>
    rgb
      .map((c) => c / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
      .reduce((sum, c, i) => sum + c * ([0.2126, 0.7152, 0.0722][i] ?? 0), 0);
  const ratio = (a: number[], b: number[]): number => {
    const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return ((high ?? 0) + 0.05) / ((low ?? 0) + 0.05);
  };
  const faint: string[] = [];
  for (const scheme of ["light", "dark"]) {
    await page.evaluate((value) => {
      document.documentElement.setAttribute("data-fm-aspekto", "komuna");
      document.documentElement.setAttribute("data-fm-color-scheme", value);
    }, scheme);
    for (const [i, c] of combos.entries()) {
      const seen = await page.locator(`#d${i}`).evaluate((element) => {
        const control = element.shadowRoot?.querySelector('[part="control"]');
        const style = control === null || control === undefined ? null : getComputedStyle(control);
        return {
          page: getComputedStyle(document.body).backgroundColor,
          fill: style?.backgroundColor ?? "",
          color: style?.color ?? "",
          opacity: style?.opacity ?? "1",
        };
      });
      const ground = parse(seen.page);
      const fill = over(parse(seen.fill), ground);
      const text = over(parse(seen.color), fill);
      const contrast = ratio(text, fill);
      if (contrast < 3) faint.push(`${scheme} ${JSON.stringify(c)} ${contrast.toFixed(2)}:1`);
    }
  }
  expect(faint).toEqual([]);
});
