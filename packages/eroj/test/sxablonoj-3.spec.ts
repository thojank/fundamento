// Spec 020 ③ (G6, E7, Abnahme 4): the content of round 1 in the browser. The kodbloko is a figure
// named by its caption; its content scrolls along the line in a focusable region; copyable, its
// button copies the text and says so politely. The markdovido builds its content from the source
// with createElement and textContent alone — headings from start-level, paragraphs, emphasis,
// inline code, code blocks, quotes, lists to depth 3, pipe tables, rules, links with safe schemes
// only — and lets nothing of a hostile source into the DOM. The redaktilo shows the preview of its
// field as the person types, side by side where there is room.

import { expect, test } from "@playwright/test";
import { axeViolations } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

test.describe("Spec 020 ③ kodbloko", () => {
  test("a figure named by its caption; a long line scrolls in a focusable region; axe-clean", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<div style="inline-size: 20rem"><fm-kodbloko id="k" copyable><span slot="caption">Prüfung starten</span>arkitekturo check --project standards --dir /home/arkitekturo/projekte/standards --format json</fm-kodbloko></div>',
    );
    await expect(page.getByRole("figure", { name: "Prüfung starten" })).toBeVisible();
    const region = await page.locator("#k").evaluate((element) => {
      const scroller = element.shadowRoot?.querySelector('[part="region"]');
      return scroller instanceof HTMLElement
        ? { tabindex: scroller.tabIndex, scrolls: scroller.scrollWidth > scroller.clientWidth }
        : null;
    });
    expect(region).toEqual({ tabindex: 0, scrolls: true });
    expect(await axeViolations(page)).toEqual([]);
  });

  test("copyable: the button copies the text and the block says Kopiert politely", async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "clipboard permissions are Chromium's here");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await serve(
      page,
      out,
      '<fm-kodbloko id="k" copyable><span slot="caption">Befehl</span>pnpm fm mcp</fm-kodbloko>',
    );
    await page.getByRole("button", { name: "Kopieren" }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("pnpm fm mcp");
    const said = await page.locator("#k").evaluate((element) => {
      const live = element.shadowRoot?.querySelector('[part="announce"]');
      return { text: live?.textContent ?? "", live: live?.getAttribute("aria-live") ?? "" };
    });
    expect(said).toEqual({ text: "Kopiert", live: "polite" });
  });
});

test.describe("Spec 020 ③ markdovido", () => {
  const SOURCE = [
    "# Datenschutz",
    "",
    "Ein Absatz mit *Hervorhebung*, **Gewicht** und `STD-1`.",
    "",
    "- eins",
    "  - zwei",
    "    - drei",
    "",
    "1. erstens",
    "2. zweitens",
    "",
    "> Ein Zitat.",
    "",
    "```",
    "pnpm fm mcp",
    "```",
    "",
    "| Name | Status |",
    "|---|:---:|",
    "| STD-1 | gültig |",
    "",
    "---",
    "",
    "[Mehr](https://example.org/standards) und [relativ](./a.md).",
  ].join("\n");

  test("builds the content from the Eroj, headings from level 2", async ({ page }) => {
    await serve(page, out, '<fm-markdovido id="m"></fm-markdovido>');
    await page.locator("#m").evaluate((element, source) => {
      (element as unknown as { source: string }).source = source;
    }, SOURCE);
    await expect(page.locator("#m fm-titolo[level='2']")).toHaveText("Datenschutz");
    await expect(page.locator("#m fm-teksto em")).toHaveText("Hervorhebung");
    await expect(page.locator("#m fm-teksto strong")).toHaveText("Gewicht");
    await expect(page.locator("#m fm-teksto[kind='code']")).toHaveText("STD-1");
    await expect(page.locator("#m ul ul ul > li")).toHaveText("drei");
    await expect(page.locator("#m ol > li")).toHaveCount(2);
    await expect(page.locator("#m blockquote")).toContainText("Ein Zitat.");
    await expect(page.locator("#m fm-kodbloko")).toHaveText("pnpm fm mcp");
    await expect(page.locator("#m fm-tabelo th[scope='col']")).toHaveCount(2);
    await expect(page.locator("#m fm-tabelo td[data-align='center']")).toHaveText("gültig");
    await expect(page.locator("#m fm-apartigilo")).toHaveCount(1);
    const links = await page
      .locator("#m fm-ligilo")
      .evaluateAll((elements) =>
        elements.map((element) => [element.getAttribute("to"), element.getAttribute("rel")]),
      );
    expect(links).toEqual([
      ["https://example.org/standards", "noopener noreferrer"],
      ["./a.md", "noopener noreferrer"],
    ]);
    expect(await axeViolations(page)).toEqual([]);
  });

  test("a hostile source puts nothing into the DOM: no script, no event attribute, no javascript: link, no HTML block", async ({
    page,
  }) => {
    await serve(page, out, '<fm-markdovido id="m" start-level="3"></fm-markdovido>');
    const hostile = [
      "<script>window.pwned = 1</script>",
      "",
      '<img src="x" onerror="window.pwned = 2">',
      "",
      '<div onclick="window.pwned = 3">Klick</div>',
      "",
      "[Gefahr](javascript:window.pwned=4) und [data](data:text/html,<b>x</b>) und [vb](vbscript:x)",
      "",
      "![Bild](https://example.org/a.png)",
      "",
      "## Titel <b>fett</b>",
    ].join("\n");
    await page.locator("#m").evaluate((element, source) => {
      (element as unknown as { source: string }).source = source;
    }, hostile);
    const found = await page.locator("#m").evaluate((element) => {
      const all = [...element.querySelectorAll("*")];
      return {
        tags: [...new Set(all.map((node) => node.tagName.toLowerCase()))].filter((tag) =>
          ["script", "img", "div", "b", "iframe", "a"].includes(tag),
        ),
        handlers: all.filter((node) =>
          [...node.attributes].some((attribute) => attribute.name.startsWith("on")),
        ).length,
        unsafe: all.filter((node) =>
          [...node.attributes].some((attribute) =>
            /^\s*(javascript|data|vbscript):/i.test(attribute.value),
          ),
        ).length,
        pwned: (window as unknown as { pwned?: number }).pwned ?? 0,
        text: element.textContent ?? "",
      };
    });
    expect(found.tags).toEqual([]);
    expect(found.handlers).toBe(0);
    expect(found.unsafe).toBe(0);
    expect(found.pwned).toBe(0);
    // What was HTML is shown as text; the link with an unsafe scheme is its text alone.
    expect(found.text).toContain("<script>window.pwned = 1</script>");
    expect(found.text).toContain("Gefahr");
    await expect(page.locator("#m fm-titolo[level='4']")).toHaveText("Titel <b>fett</b>");
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => (window as unknown as { pwned?: number }).pwned ?? 0)).toBe(0);
  });
});

test.describe("Spec 020 ③ redaktilo", () => {
  const EDITOR =
    '<fm-redaktilo id="r" preview-label="Vorschau"><fm-tekstareo id="f" slot="field" kind="code" rows="6">Quelltext</fm-tekstareo><fm-markdovido slot="preview"></fm-markdovido></fm-redaktilo>';

  test("the preview follows every input of the field; it is a named region, no live region", async ({
    page,
  }) => {
    await serve(page, out, EDITOR);
    await page.locator("#f").locator("textarea").fill("# Neu\n\nText.");
    await expect(page.locator("#r fm-markdovido fm-titolo")).toHaveText("Neu");
    const preview = await page.locator("#r").evaluate((element) => {
      const region = element.shadowRoot?.querySelector('[part="preview"]');
      return {
        role: region?.getAttribute("role") ?? "",
        name: region?.getAttribute("aria-label") ?? "",
        live: region?.getAttribute("aria-live"),
      };
    });
    expect(preview).toEqual({ role: "region", name: "Vorschau", live: null });
  });

  test("side by side where there is room, the preview below where there is none", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div style="inline-size: 24rem">${EDITOR.replace('id="r"', 'id="n"').replace('id="f"', 'id="nf"')}</div><div style="inline-size: 72rem">${EDITOR.replace('id="r"', 'id="w"').replace('id="f"', 'id="wf"')}</div>`,
    );
    const below = (id: string) =>
      page.evaluate((editor) => {
        const field = document
          .querySelector(`#${editor} > [slot="field"]`)
          ?.getBoundingClientRect();
        const preview = document
          .querySelector(`#${editor} > [slot="preview"]`)
          ?.getBoundingClientRect();
        return (preview?.top ?? 0) >= (field?.bottom ?? 0);
      }, id);
    expect(await below("n")).toBe(true);
    expect(await below("w")).toBe(false);
  });
});
