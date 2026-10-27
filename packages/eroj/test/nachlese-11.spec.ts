// Nachlese 11 ① (what the north-star measure found, Spec 030 B-2, B-6, B-7): in the browser, in
// Chromium, Firefox and WebKit.
// B-7: a table in fm-tabelo without slot="content" never blocks the page; where it is unambiguous
//   the table is shown all the same, else the console says the right markup.
// B-2: the default slot of an Ero takes its content with or without slot="<its name>", as the
//   default region of a Sxablono does — what Skemo, Gvidanto and Make Kit name, the element takes.
// B-6: fundamento.css sets the surface and the text colour of the page from the roles: a page that
//   loads only fundamento.css and the Eroj passes contrast in every Aspekto and mode.

import { expect, type Page, test } from "@playwright/test";
import { axeViolations } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const ROWS =
  '<thead><tr><th scope="col">Werkzeug</th><th scope="col">Status</th></tr></thead><tbody><tr><td>Bohrmaschine</td><td>verliehen</td></tr><tr><td>Leiter</td><td>frei</td></tr></tbody>';

/** The console warnings of the page, collected from the start. */
function warnings(page: Page): string[] {
  const heard: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning") heard.push(message.text());
  });
  return heard;
}

/** The page still answers: a script runs and returns within the test's own patience. */
async function answers(page: Page): Promise<boolean> {
  return Promise.race([
    page.evaluate(() => true),
    new Promise<boolean>((done) => setTimeout(() => done(false), 5_000)),
  ]);
}

test.describe("Nachlese 11 B-7: fm-tabelo never blocks the page", () => {
  test.setTimeout(60_000);

  test("a table without slot is the content: shown, named by the caption, the page answers", async ({
    page,
  }) => {
    const heard = warnings(page);
    await serve(page, out, `<fm-tabelo id="t">Werkzeuge<table>${ROWS}</table></fm-tabelo>`);
    expect(await answers(page)).toBe(true);
    const grid = page.getByRole("table", { name: "Werkzeuge" });
    await expect(grid).toBeVisible();
    await expect(page.getByRole("cell", { name: "Bohrmaschine" })).toBeVisible();
    // The caption is the words of the default slot, not the text of the table.
    await expect(page.locator("#t > table > caption")).toHaveText("Werkzeuge");
    // Unambiguous: shown, no warning needed.
    expect(heard.filter((line) => line.includes("fm-tabelo"))).toEqual([]);
  });

  test("the measured case: the caption in slot=caption and a table without slot", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-tabelo id="t"><span slot="caption">Werkzeuge</span><table>${ROWS}</table></fm-tabelo>`,
    );
    expect(await answers(page)).toBe(true);
    await expect(page.getByRole("table", { name: "Werkzeuge" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Leiter" })).toBeVisible();
  });

  test("ambiguous: two tables without slot — the page answers and the console names the markup", async ({
    page,
  }) => {
    const heard = warnings(page);
    await serve(
      page,
      out,
      `<fm-tabelo id="t">Werkzeuge<table>${ROWS}</table><table>${ROWS}</table></fm-tabelo>`,
    );
    expect(await answers(page)).toBe(true);
    await expect
      .poll(() => heard.find((line) => line.includes("fm-tabelo")) ?? "")
      .toContain('<table slot="content">');
    // The caption never swallows the text of a table.
    expect((await page.locator("#t > table caption").allTextContents()).join("")).not.toContain(
      "Bohrmaschine",
    );
  });
});

test.describe("Nachlese 11 B-2: the default slot takes its content by its name as well", () => {
  test("kampo, butono and tabelo: slot=<name of the default slot> is the default slot", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-kampo kind="email"><span slot="label">E-Mail</span><span slot="help">Wir schreiben nur zur Bestätigung.</span></fm-kampo>
<fm-butono emphasis="high"><span slot="label">Speichern</span></fm-butono>
<fm-sxaltilo><span slot="label">Benachrichtigungen</span></fm-sxaltilo>`,
    );
    await expect(page.getByRole("textbox", { name: "E-Mail" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Speichern" })).toBeVisible();
    await expect(page.getByRole("switch", { name: "Benachrichtigungen" })).toBeVisible();
  });

  test("a later slot=label is taken as well (an application that renders after the element)", async ({
    page,
  }) => {
    await serve(page, out, '<fm-kampo id="k" kind="text"></fm-kampo>');
    await page.evaluate(() => {
      const label = document.createElement("span");
      label.setAttribute("slot", "label");
      label.textContent = "Name";
      document.getElementById("k")?.append(label);
    });
    await expect(page.getByRole("textbox", { name: "Name" })).toBeVisible();
  });
});

const ASPEKTOJ = ["komuna", "ekzemplo"] as const;
const SCHEMES = ["light", "dark"] as const;
const CONTRASTS = ["default", "high"] as const;

test.describe("Nachlese 11 B-6: fundamento.css sets the surface of the page", () => {
  test.setTimeout(120_000);

  test("a page with fundamento.css and Eroj alone passes contrast in every Aspekto and mode", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<main><fm-titolo level="1">Werkzeuge</fm-titolo><fm-teksto>Leihe Werkzeuge für eine Woche.</fm-teksto><p>Ein Absatz ohne Ero.</p><fm-kampo kind="email">E-Mail</fm-kampo><fm-butono emphasis="high">Ausleihen</fm-butono><fm-tabelo>Werkzeuge<table slot="content">${ROWS}</table></fm-tabelo></main>`,
      "",
      { bare: true },
    );
    const failed: string[] = [];
    for (const aspekto of ASPEKTOJ)
      for (const scheme of SCHEMES)
        for (const contrast of CONTRASTS) {
          await page.evaluate(
            ([a, s, c]) => {
              const root = document.documentElement;
              root.setAttribute("data-fm-aspekto", a);
              root.setAttribute("data-fm-color-scheme", s);
              root.setAttribute("data-fm-contrast", c);
            },
            [aspekto, scheme, contrast] as const,
          );
          const found = await axeViolations(page);
          if (found.includes("color-contrast")) failed.push(`${aspekto}/${scheme}/${contrast}`);
        }
    expect(failed).toEqual([]);
  });

  test("the root carries the canvas and the default text colour of the roles", async ({ page }) => {
    await serve(page, out, "<p>Text</p>", "", { bare: true });
    await page.evaluate(() =>
      document.documentElement.setAttribute("data-fm-color-scheme", "dark"),
    );
    const measured = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.backgroundColor = "var(--fm-color-background-canvas)";
      probe.style.color = "var(--fm-color-text-default)";
      document.body.append(probe);
      const root = getComputedStyle(document.documentElement);
      const want = getComputedStyle(probe);
      return {
        background: [root.backgroundColor, want.backgroundColor],
        color: [getComputedStyle(document.querySelector("p") as Element).color, want.color],
      };
    });
    expect(measured.background[0]).toBe(measured.background[1]);
    expect(measured.color[0]).toBe(measured.color[1]);
  });
});
