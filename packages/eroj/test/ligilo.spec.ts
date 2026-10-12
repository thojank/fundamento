// fm-ligilo in the browser (Spec 008 T021; A5, A6, plan D-09, D-10): a native link rendered from
// the same template as the butono. Chromium, Firefox and WebKit (playwright.config.ts).

import { boundToken, combinationsOf } from "@fundamento/modelo";
import { expect, test } from "@playwright/test";
import { TAB } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const ligilo = input.modelo.eroj.find((entry) => entry.ero.name === "ligilo");
if (ligilo === undefined) throw new Error("ligilo missing");
const skemo = ligilo.skemo;
const texts = skemo.a11y.texts?.external;
if (texts === undefined) throw new Error("the ligilo speaks external in de and en");

test.describe("fm-ligilo behaviour", () => {
  test("role link, href from to, name from the slot or the label prop", async ({ page }) => {
    await serve(
      page,
      out,
      `<fm-ligilo id="a" to="#ziel">Projektübersicht</fm-ligilo><fm-ligilo id="b" to="#b" label="Dokumentation"><svg slot="icon-end" aria-hidden="true"></svg></fm-ligilo>`,
    );
    const a = page.getByRole("link", { name: "Projektübersicht" });
    await expect(a).toBeVisible();
    await expect(a).toHaveAttribute("href", "#ziel");
    await expect(page.getByRole("link", { name: "Dokumentation" })).toBeVisible();
    // No form association, no disabled: a link one cannot follow is text (E4).
    await expect(a).not.toHaveAttribute("aria-disabled");
    expect(await page.locator("#a").evaluate((e) => "disabled" in e)).toBe(false);
  });

  test("external: rel for safety, the mark shows, and the description is heard in the document's language (S4)", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-ligilo id="a" to="https://docs.example/" external>Dokumentation</fm-ligilo>`,
    );
    const link = page.getByRole("link", { name: "Dokumentation" });
    await expect(link).toHaveAttribute("rel", "external noopener noreferrer");
    await expect(link).toHaveAccessibleDescription(texts.de);
    const mark = page.locator("#a").locator('slot[name="icon-end"] > svg');
    await expect(mark).toBeVisible();
    // The language follows the nearest lang (D-02).
    await page.evaluate(() => document.documentElement.setAttribute("lang", "en"));
    await page.locator("#a").evaluate((e) => e.setAttribute("size", "medium"));
    await expect(link).toHaveAccessibleDescription(texts.en);
    // Without external: no rel, no description, no mark.
    await page.locator("#a").evaluate((e) => e.removeAttribute("external"));
    await expect(link).not.toHaveAttribute("rel");
    await expect(link).not.toHaveAttribute("aria-describedby");
    await expect(mark).toBeHidden();
  });

  test("Tab reaches it and Enter follows it", async ({ page, browserName }) => {
    await serve(
      page,
      out,
      `<fm-ligilo id="a" to="#eins">Eins</fm-ligilo> <fm-ligilo id="b" to="#zwei">Zwei</fm-ligilo>`,
    );
    await page.evaluate(() => {
      (window as unknown as { clicks: string[] }).clicks = [];
      for (const id of ["a", "b"]) {
        document.getElementById(id)?.addEventListener("click", (event) => {
          event.preventDefault();
          (window as unknown as { clicks: string[] }).clicks.push(id);
        });
      }
    });
    await page.keyboard.press(TAB(browserName));
    await expect(page.locator("#a")).toBeFocused();
    await page.keyboard.press("Enter");
    await page.keyboard.press(TAB(browserName));
    await expect(page.locator("#b")).toBeFocused();
    await page.keyboard.press("Enter");
    expect(await page.evaluate(() => (window as unknown as { clicks: string[] }).clicks)).toEqual([
      "a",
      "b",
    ]);
  });

  test("a link without to warns once and renders no href (boundary disabled-link)", async ({
    page,
  }) => {
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning") warnings.push(message.text());
    });
    await serve(page, out, `<fm-ligilo id="a">Ohne Ziel</fm-ligilo>`);
    const control = page.locator("#a").locator('[part="control"]');
    await expect(control).not.toHaveAttribute("href");
    expect(warnings.filter((text) => text.includes("to is required"))).toHaveLength(1);
  });

  test("delegates focus to the inner link and exposes only ::part(control)", async ({ page }) => {
    await serve(page, out, `<fm-ligilo id="a" to="#a">A</fm-ligilo>`);
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

  test("inline flows with the text: the host is inline and a long link breaks into lines (D-04)", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<p id="p" style="inline-size: 12rem">Ein Satz mit einem <fm-ligilo id="a" to="#a">sehr langen Verweis auf die Projektübersicht und ihre Unterseiten</fm-ligilo> im Fließtext.</p>`,
    );
    const rects = await page
      .locator("#a")
      .evaluate(
        (e) => e.shadowRoot?.querySelector('[part="control"]')?.getClientRects().length ?? 0,
      );
    expect(rects).toBeGreaterThan(1);
    expect(await page.locator("#a").evaluate((e) => getComputedStyle(e).display)).toBe("inline");
    expect(
      await page
        .locator("#a")
        .evaluate(
          (e) =>
            getComputedStyle(e.shadowRoot?.querySelector('[part="control"]') as Element).display,
        ),
    ).toBe("inline");
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
  test(`${aspekto}: computed styles of every placement × size × state equal the bound tokens (AK-03, S5)`, async ({
    page,
    browserName,
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
    const combos = combinationsOf(skemo, ["placement", "size"]);
    const body = combos
      .map(
        (c, i) =>
          `<p><fm-ligilo id="l${i}" to="#l${i}" placement="${c.placement}" size="${c.size}">Ziel</fm-ligilo></p>`,
      )
      .join(" ");
    await serve(page, out, body);
    await page.evaluate(
      (value) => document.documentElement.setAttribute("data-fm-aspekto", value),
      aspekto,
    );
    let checked = 0;
    for (const [i, c] of combos.entries()) {
      for (const state of ["rest", "hover", "pressed", "focus"]) {
        const host = page.locator(`#l${i}`);
        if (state === "hover" || state === "pressed") await host.hover();
        else await page.mouse.move(0, 0);
        if (state === "pressed") await page.mouse.down();
        if (state === "focus") {
          // Keyboard focus, so :focus-visible applies.
          await page.evaluate((id) => {
            const start = document.createElement("span");
            start.tabIndex = -1;
            document.getElementById(id)?.before(start);
            start.focus();
          }, `l${i}`);
          await page.keyboard.press(TAB(browserName));
          await expect(host).toBeFocused();
        }
        const actual = await host.evaluate((element) => {
          const control = element.shadowRoot?.querySelector('[part="control"]');
          if (control === null || control === undefined) return null;
          const style = getComputedStyle(control);
          return {
            color: style.color,
            underline: style.textDecorationLine,
            height: style.minBlockSize,
          };
        });
        if (state === "pressed") await page.mouse.up();
        if (state === "focus") await page.locator(`#l${i}`).blur();
        const combination = { ...c, state };
        const token = (part: string, property: string) =>
          boundToken(skemo, part, property, combination)?.token;
        const value = (name: string | undefined) => {
          const resolved = name === undefined ? undefined : rezolvo.tokens[name]?.value;
          if (resolved === undefined) throw new Error(`${name} unresolved`);
          return resolved;
        };
        const underlineToken = token("underline", "width");
        const heightToken = token("box", "height");
        expect(actual, `${aspekto} ${JSON.stringify(combination)}`).toEqual({
          color: rgb(value(token("label", "color"))),
          underline: underlineToken === "none" ? "none" : "underline",
          height:
            heightToken === "none"
              ? expect.not.stringMatching(/^(24|28|32|40|48)px$/)
              : `${(value(heightToken) as { value: number }).value}px`,
        });
        checked++;
      }
    }
    expect(checked).toBe(2 * 3 * 4);
  });
}

test("a standalone link is at least size.target.min wide and high in every density and viewport (WCAG 2.5.8, D-10)", async ({
  page,
}) => {
  await serve(
    page,
    out,
    ["small", "medium", "large"]
      .map((size) => `<fm-ligilo to="#x" placement="standalone" size="${size}">x</fm-ligilo>`)
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
      // The host is inline (D-04): its own box is the font's line; the control is the target.
      const boxes = await page.locator("fm-ligilo").evaluateAll((elements) =>
        elements.map((element) => {
          const control = element.shadowRoot?.querySelector('[part="control"]');
          if (!(control instanceof Element)) throw new Error("no control");
          return control.getBoundingClientRect();
        }),
      );
      for (const box of boxes) {
        expect(box.width, `${density} ${viewport}`).toBeGreaterThanOrEqual(24);
        expect(box.height, `${density} ${viewport}`).toBeGreaterThanOrEqual(24);
      }
    }
  }
});
