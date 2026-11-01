// Spec 036 Teil 5 ②b-5 (Spec 029 abgleich.json A-kodbloko-1/4/6, ①-2) in the browser: a code block
// numbers its lines (line-numbers; the numbers are heard by no one and copied by no one), wraps
// long lines (wrap), names its language beside its caption (language), marks the lines highlight
// names, and colours the words of a language it knows by kind (color.syntax.*, the parts keyword,
// name, string, number, comment). A language it does not know is named and left in one colour. A
// block without the new props stays as it was (AC-10, compared by ac10 outside this suite).

import { expect, type Page, test } from "@playwright/test";
import { axeViolations } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const JS = [
  "// Lädt die Standards",
  'const name = "standards";',
  "let count = 42;",
  "load(name, true);",
].join("\n");

/** The lines the block shows, each with its number, its highlight and the kinds of its words. */
async function linesOf(page: Page, id: string) {
  return page.locator(`#${id}`).evaluate((element) =>
    [...(element.shadowRoot?.querySelectorAll("[data-line]") ?? [])].map((line) => ({
      number: line.querySelector('[part~="line-number"]')?.textContent ?? null,
      highlighted: (line.getAttribute("part") ?? "").split(" ").includes("highlight"),
      kinds: [
        ...line.querySelectorAll(
          '[part~="keyword"], [part~="name"], [part~="string"], [part~="number"], [part~="comment"]',
        ),
      ].map((word) => [word.getAttribute("part"), word.textContent]),
    })),
  );
}

/** The colour the page computes for a CSS custom property, as rgb(). */
async function colourOf(page: Page, id: string, variable: string): Promise<string> {
  return page.locator(`#${id}`).evaluate((element, name) => {
    const probe = document.createElement("span");
    probe.style.color = `var(${name})`;
    element.append(probe);
    const colour = getComputedStyle(probe).color;
    probe.remove();
    return colour;
  }, variable);
}

test.describe("②b-5 A-kodbloko-1/4: line numbers, highlighted lines, language", () => {
  test("line-numbers numbers every line; the numbers are hidden from assistive technology and from a copy", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      let kept = "";
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            kept = text;
          },
          readText: async () => kept,
        },
      });
    });
    await serve(
      page,
      out,
      `<fm-kodbloko id="k" line-numbers copyable highlight="2,4"><span slot="caption">Laden</span>${JS}</fm-kodbloko>`,
    );
    const lines = await linesOf(page, "k");
    expect(lines.map((line) => line.number)).toEqual(["1", "2", "3", "4"]);
    expect(lines.map((line) => line.highlighted)).toEqual([false, true, false, true]);
    const hidden = await page
      .locator("#k")
      .evaluate((element) =>
        [...(element.shadowRoot?.querySelectorAll('[part~="line-number"]') ?? [])].every(
          (number) => number.getAttribute("aria-hidden") === "true",
        ),
      );
    expect(hidden).toBe(true);
    await page.getByRole("button", { name: "Kopieren" }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(JS);
    // A highlighted line lies on the ground of the page, the others on the block's.
    const grounds = await page.locator("#k").evaluate((element) => {
      const [first, second] = [...(element.shadowRoot?.querySelectorAll("[data-line]") ?? [])];
      return [first, second].map((line) =>
        line instanceof HTMLElement ? getComputedStyle(line).backgroundColor : "",
      );
    });
    expect(grounds[1]).toBe(await colourOf(page, "k", "--fm-color-background-default"));
    expect(grounds[0]).not.toBe(grounds[1]);
    expect(await axeViolations(page)).toEqual([]);
  });

  test("language is named beside the caption; the figure keeps its name", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-kodbloko id="k" language="Shell"><span slot="caption">Prüfung starten</span>pnpm check</fm-kodbloko>',
    );
    await expect(page.getByRole("figure", { name: /Prüfung starten/ })).toBeVisible();
    const language = await page.locator("#k").evaluate((element) => {
      const part = element.shadowRoot?.querySelector('[part="language"]');
      return part instanceof HTMLElement ? { text: part.textContent, shown: !part.hidden } : null;
    });
    expect(language).toEqual({ text: "Shell", shown: true });
  });

  test("wrap breaks a long line instead of scrolling it", async ({ page }) => {
    const command =
      "arkitekturo check --project standards --dir /home/arkitekturo/projekte/standards --format json";
    await serve(
      page,
      out,
      `<div style="inline-size: 20rem"><fm-kodbloko id="w" wrap><span slot="caption">Befehl</span>${command}</fm-kodbloko><fm-kodbloko id="s"><span slot="caption">Befehl</span>${command}</fm-kodbloko></div>`,
    );
    const scrolls = (id: string) =>
      page.locator(`#${id}`).evaluate((element) => {
        const region = element.shadowRoot?.querySelector('[part="region"]');
        return region instanceof HTMLElement ? region.scrollWidth > region.clientWidth : null;
      });
    expect(await scrolls("w")).toBe(false);
    expect(await scrolls("s")).toBe(true);
  });
});

test.describe("②b-5 ①-2, A-kodbloko-6: colours per kind of word", () => {
  test("a language it knows: keyword, name, string, number and comment, each in its role", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-kodbloko id="k" language="javascript"><span slot="caption">Laden</span>${JS}</fm-kodbloko>`,
    );
    const kinds = (await linesOf(page, "k")).flatMap((line) => line.kinds);
    expect(kinds).toEqual([
      ["comment", "// Lädt die Standards"],
      ["keyword", "const"],
      ["string", '"standards"'],
      ["keyword", "let"],
      ["number", "42"],
      ["name", "load"],
      ["number", "true"],
    ]);
    for (const kind of ["keyword", "name", "string", "number", "comment"]) {
      const word = page.locator("#k").locator(`[part~="${kind}"]`).first();
      const colour = await word.evaluate((element) => getComputedStyle(element).color);
      expect(colour, kind).toBe(await colourOf(page, "k", `--fm-color-syntax-${kind}`));
    }
    // The text reads as before: the words in order, nothing added.
    const text = await page
      .locator("#k")
      .evaluate((element) =>
        [...(element.shadowRoot?.querySelectorAll("[data-line]") ?? [])]
          .map((line) => line.querySelector(".fm-code")?.textContent ?? "")
          .join("\n"),
      );
    expect(text).toBe(JS);
    expect(await axeViolations(page)).toEqual([]);
  });

  test("JSON: keys are names, values strings, numbers and literals", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-kodbloko id="j" language="json"><span slot="caption">Agordo</span>{ "name": "provo", "radius": 2, "pille": false }</fm-kodbloko>',
    );
    const kinds = (await linesOf(page, "j")).flatMap((line) => line.kinds);
    expect(kinds).toEqual([
      ["name", '"name"'],
      ["string", '"provo"'],
      ["name", '"radius"'],
      ["number", "2"],
      ["name", '"pille"'],
      ["number", "false"],
    ]);
  });

  test("a language it does not know is named, the code stays in one colour", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-kodbloko id="c" language="Cobol"><span slot="caption">Alt</span>DISPLAY "HALLO".</fm-kodbloko>',
    );
    const words = await page
      .locator("#c")
      .evaluate(
        (element) =>
          element.shadowRoot?.querySelectorAll(
            '[part~="keyword"], [part~="name"], [part~="string"], [part~="number"], [part~="comment"]',
          ).length ?? -1,
      );
    expect(words).toBe(0);
    const named = await page
      .locator("#c")
      .evaluate((element) => element.shadowRoot?.querySelector('[part="language"]')?.textContent);
    expect(named).toBe("Cobol");
  });
});
