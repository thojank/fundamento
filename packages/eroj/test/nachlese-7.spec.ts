// Nachlese 7 ① (0.1.1): the faults Arkitekturo met with 0.1.0, in the browser. A-1 the message of
// a dialogo shows and aria-describedby points at visible text; A-2 every Ero can be made with
// document.createElement, appended and rendered; A-3/A-5 every markup example of the guidelines
// renders without a child left unassigned (unseen); A-6 a native caption of a tabelo stays when the
// slot is empty. Chromium, Firefox and WebKit.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const TAGS = input.modelo.eroj.map((entry) => `fm-${entry.ero.name}`).sort();
const GUIDELINES = join(out, "make-kit", "komuna", "guidelines", "components");
/** The named slots of options an Ero reads itself from its children (elektilo, kompletigilo). */
const READ: Record<string, string[]> = Object.fromEntries(
  input.modelo.eroj.map((entry) => [
    `fm-${entry.ero.name}`,
    entry.skemo.slots
      .filter((slot) => slot.entry !== undefined && slot.default !== true)
      .map((slot) => slot.name),
  ]),
);

/** Every html block of a guideline, and every inline snippet of an entry wrapped in its Ero. */
function examplesOf(file: string): string[] {
  const text = readFileSync(join(GUIDELINES, file), "utf8");
  const tag = `fm-${file.replace(/\.md$/, "")}`;
  const blocks = [...text.matchAll(/```html\n([\s\S]*?)\n```/g)].map((match) => match[1] ?? "");
  const inline = [...text.matchAll(/`(<(?:data|a)\b[^`]*>[^`]*<\/(?:data|a)>)`/g)].map(
    (match) => `<${tag}>Beispiel${match[1] ?? ""}</${tag}>`,
  );
  return [...blocks, ...inline];
}

test.describe("Nachlese 7 ① (0.1.1)", () => {
  test("A-1: the message of a dialogo shows, and aria-describedby points at visible text", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-dialogo id="d" open>Standard löschen?<span slot="message">Der Standard gilt danach nicht mehr im Projekt.</span><fm-butono slot="actions" emphasis="low">Abbrechen</fm-butono><fm-butono slot="actions" emphasis="high" intent="danger">Löschen</fm-butono></fm-dialogo>',
    );
    const message = page.locator("#d").locator('[part="message"]');
    await expect(message).toBeVisible();
    // The paragraph holds a slot: the words are the slotted span's, seen through the paragraph.
    const words = page.locator('#d [slot="message"]');
    await expect(words).toBeVisible();
    await expect(words).toHaveText("Der Standard gilt danach nicht mehr im Projekt.");
    const described = await page.locator("#d").evaluate((element) => {
      const dialog = element.shadowRoot?.querySelector("dialog");
      const id = dialog?.getAttribute("aria-describedby") ?? "";
      const target = element.shadowRoot?.getElementById(id);
      return { id, visible: target instanceof HTMLElement && target.checkVisibility() };
    });
    expect(described).toEqual({ id: "message", visible: true });
  });

  test("A-1: a dialogo without a message has no description and no empty paragraph", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-dialogo id="d" open>Speichern?<fm-butono slot="actions" emphasis="high">Speichern</fm-butono></fm-dialogo>',
    );
    const state = await page.locator("#d").evaluate((element) => {
      const dialog = element.shadowRoot?.querySelector("dialog");
      const message = element.shadowRoot?.querySelector('[part="message"]');
      return {
        described: dialog?.hasAttribute("aria-describedby") ?? true,
        hidden: message instanceof HTMLElement && !message.checkVisibility(),
      };
    });
    expect(state).toEqual({ described: false, hidden: true });
  });

  test("A-2: every Ero can be made with document.createElement, appended and rendered", async ({
    page,
  }) => {
    await serve(page, out, '<main id="host"></main>');
    // Spec 020 ③: 34 with the kodbloko and the markdovido; Spec 025 ①: 35 with the glitilo and the markdovido.
    expect(TAGS).toHaveLength(35);
    const results = await page.evaluate((tags) => {
      // A constructor that writes an attribute on its host breaks createElement: the platform
      // reports the error and hands back an HTMLUnknownElement instead of the Ero.
      const reported: string[] = [];
      addEventListener("error", (event) => reported.push(String(event.message)));
      return tags.map((tag) => {
        reported.length = 0;
        try {
          const element = document.createElement(tag);
          element.textContent = "Beispiel";
          document.getElementById("host")?.append(element);
          const own = customElements.get(tag);
          const rendered =
            own !== undefined && element instanceof own && element.shadowRoot !== null;
          if (reported.length > 0) return `${tag}:${reported.join(" | ")}`;
          return `${tag}:${rendered ? "ok" : "not rendered"}`;
        } catch (error) {
          return `${tag}:${error instanceof Error ? error.name : String(error)}`;
        }
      });
    }, TAGS);
    expect(results.filter((result) => !result.endsWith(":ok"))).toEqual([]);
  });

  test("A-3/A-5: every markup example of the guidelines renders without an unseen child", async ({
    page,
  }) => {
    await serve(page, out, '<main id="host"></main>');
    const files = readdirSync(GUIDELINES).filter((file) => file.endsWith(".md"));
    expect(files).toHaveLength(35);
    const failures: string[] = [];
    for (const file of files) {
      for (const example of examplesOf(file)) {
        const lost = await page.evaluate(
          async ({ markup, read }) => {
            const host = document.getElementById("host");
            if (host === null) return ["no host"];
            host.innerHTML = markup;
            await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
            // A child is unseen when no slot takes it and the Ero does not read it either: an option
            // in the named slot of options (the Skemo's entry) is read by the element itself.
            const lost: string[] = [];
            for (const ero of host.querySelectorAll("*")) {
              if (!ero.tagName.toLowerCase().startsWith("fm-") || ero.shadowRoot === null) continue;
              const own = read[ero.tagName.toLowerCase()] ?? [];
              for (const child of ero.children) {
                if (child.assignedSlot === null && !own.includes(child.getAttribute("slot") ?? ""))
                  lost.push(`${ero.tagName.toLowerCase()} > ${child.outerHTML.slice(0, 80)}`);
              }
            }
            return lost;
          },
          { markup: example, read: READ },
        );
        for (const entry of lost) failures.push(`${file}: ${entry}`);
      }
    }
    expect(failures).toEqual([]);
  });

  test("A-5: the examples of tekstareo show their help and error slots", async () => {
    const text = readFileSync(join(GUIDELINES, "tekstareo.md"), "utf8");
    expect(text).toMatch(
      /<fm-tekstareo invalid>Begründung<span slot="error">[^<]+<\/span><\/fm-tekstareo>/,
    );
    expect(text).toMatch(/<fm-tekstareo>Begründung<span slot="help">[^<]+<\/span><\/fm-tekstareo>/);
  });

  test("A-6: a native caption of the tabelo stays when the slot is empty", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-tabelo id="t"><table slot="content"><caption>Standards des Projekts</caption><thead><tr><th scope="col">Name</th></tr></thead><tbody><tr><td>STD-1</td></tr></tbody></table></fm-tabelo>',
    );
    await expect(page.locator("#t caption")).toHaveText("Standards des Projekts");
    await expect(page.getByRole("table", { name: "Standards des Projekts" })).toBeVisible();
  });
  test("A-7: the guideline's way to remove a dismissed avizo keeps the element's focus move", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-butono id="vor">Vorher</fm-butono><fm-avizo id="a" dismissible>Gespeichert.</fm-avizo><fm-butono id="nach">Weiter</fm-butono>',
    );
    const text = readFileSync(join(GUIDELINES, "avizo.md"), "utf8");
    const snippet = /```js\n([\s\S]*?)\n```/.exec(text.slice(text.indexOf("## Dismiss")))?.[1];
    expect(snippet).toBeDefined();
    await page.evaluate((code) => new Function(code)(), snippet ?? "");
    await page.locator("#a").locator('[part="dismiss"]').click();
    await expect(page.locator("#a")).toHaveCount(0);
    await expect(page.locator("#nach")).toBeFocused();
  });
});
