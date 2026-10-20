// Nachlese 7 ② (0.2.0, additive): what Arkitekturo built around the Eroj of 0.1.0, now the Eroj'
// own — one browser test per addition B-1 to B-10. Nothing existing changes: every addition is a
// new prop, a slot that takes more, or a behaviour where there was none. Chromium, Firefox and
// WebKit.

import { expect, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

test.describe("Nachlese 7 ② (0.2.0)", () => {
  test("B-1: a titolo with focusable takes the focus on its heading; without, it takes none", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-titolo id="h" level="1" focusable>Standards</fm-titolo><fm-titolo id="n" level="2">Ohne</fm-titolo>',
    );
    const focused = await page.evaluate(() => {
      const heading = document.getElementById("h");
      heading?.focus();
      const inner = heading?.shadowRoot?.activeElement;
      return {
        host: document.activeElement === heading,
        heading: inner?.getAttribute("role") ?? null,
        tabindex: inner?.getAttribute("tabindex") ?? null,
      };
    });
    expect(focused).toEqual({ host: true, heading: "heading", tabindex: "-1" });
    // The heading is no stop of the tab order: tabindex -1, reached by focus() alone.
    const plain = await page.evaluate(() => {
      const heading = document.getElementById("n");
      heading?.focus();
      return document.activeElement === heading;
    });
    expect(plain).toBe(false);
  });

  test("B-2: a mezurilo with label-hidden hides its label from sight and keeps its name", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-mezurilo id="m" value="40" label-hidden>Konformität<span slot="value-text">40 %</span></fm-mezurilo>',
    );
    const label = page.locator("#m").locator('[part="label"]');
    await expect(label).toBeHidden();
    await expect(page.getByRole("meter", { name: "Konformität" })).toBeAttached();
    await expect(page.locator("#m").locator('[part="track"]')).toBeVisible();
  });

  test("B-3: the empty state of a tabelo shows a butono as its next step", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-tabelo id="t">Standards<table slot="content"><thead><tr><th scope="col">Name</th></tr></thead><tbody></tbody></table><span slot="empty">Noch keine Standards.</span><fm-butono id="b" slot="empty" emphasis="medium">Standard anlegen</fm-butono></fm-tabelo>',
    );
    const state = page.locator("#t fm-plenstato");
    await expect(state).toContainText("Noch keine Standards.");
    await expect(page.locator("#b")).toBeVisible();
    // The words of the state are the text alone, not the button's.
    expect(await state.evaluate((element) => element.firstChild?.textContent ?? "")).toBe(
      "Noch keine Standards.",
    );
    await page.evaluate(() =>
      document.getElementById("b")?.addEventListener("click", () => {
        document.body.dataset.clicked = "ja";
      }),
    );
    await page.locator("#b").click();
    await expect(page.locator("body")).toHaveAttribute("data-clicked", "ja");
    // A row takes the empty state away; the butono stays the application's element.
    await page.evaluate(() =>
      document
        .querySelector("#t tbody")
        ?.insertAdjacentHTML("beforeend", "<tr><td>STD-1</td></tr>"),
    );
    await expect(state).toHaveCount(0);
    await expect(page.locator("#t > #b")).toHaveCount(1);
  });

  test("B-4: a disabled menuo locks its trigger and does not open", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-menuo id="m" disabled><data value="edit">Bearbeiten</data></fm-menuo><fm-menuo id="s" disabled><fm-butono slot="trigger" emphasis="low">Aktionen</fm-butono><data value="edit">Bearbeiten</data></fm-menuo>',
    );
    for (const id of ["m", "s"]) {
      const menu = page.locator(`#${id}`);
      const disabled = await menu.evaluate((element) => {
        const slotted = element.querySelector('[slot="trigger"]');
        const own = element.shadowRoot?.querySelector('[part="trigger"]');
        const trigger = slotted ?? own;
        const control = trigger?.shadowRoot?.querySelector('[part="control"]');
        return control?.getAttribute("aria-disabled") ?? trigger?.getAttribute("aria-disabled");
      });
      expect(disabled, id).toBe("true");
      await menu.evaluate((element) => {
        const trigger =
          element.querySelector('[slot="trigger"]') ??
          element.shadowRoot?.querySelector('[part="trigger"]');
        (trigger as HTMLElement | null)?.click();
      });
      const open = await menu.evaluate(
        (element) =>
          element.shadowRoot?.querySelector('[part="control"]')?.matches(":popover-open") ?? true,
      );
      expect(open, id).toBe(false);
    }
    // Without disabled, the trigger opens the menu again.
    await page.locator("#m").evaluate((element) => element.removeAttribute("disabled"));
    await page.locator("#m").evaluate((element) => {
      (element.shadowRoot?.querySelector('[part="trigger"]') as HTMLElement | null)?.click();
    });
    await expect
      .poll(() =>
        page
          .locator("#m")
          .evaluate(
            (element) =>
              element.shadowRoot?.querySelector('[part="control"]')?.matches(":popover-open") ??
              false,
          ),
      )
      .toBe(true);
  });

  test("B-5: the details of an avizo take a list and a teksto kind=code", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-avizo id="a" intent="danger">Speichern fehlgeschlagen: zwei Felder sind ungültig.<ul slot="details"><li>/tags/1: muss dem Muster entsprechen</li></ul><fm-teksto slot="details" kind="code">/title</fm-teksto></fm-avizo>',
    );
    await expect(page.locator("#a").locator('[part="details"]')).toBeVisible();
    await expect(page.locator("#a li")).toBeVisible();
    await expect(page.locator("#a fm-teksto")).toBeVisible();
    // Heard as a list item and as code, inside the notice.
    const tree = await page.locator("#a").ariaSnapshot();
    expect(tree).toContain('listitem: "/tags/1: muss dem Muster entsprechen"');
    expect(tree).toContain("code: /title");
  });

  test("B-6: a dialogo takes an avizo in its content; the first focus goes to the first focusable child", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-dialogo id="d" open>Metadaten bearbeiten<fm-avizo slot="content" intent="danger">Speichern fehlgeschlagen.</fm-avizo><fm-kampo id="k" slot="content">Titel</fm-kampo><fm-butono slot="actions" emphasis="low">Abbrechen</fm-butono><fm-butono slot="actions" emphasis="high">Speichern</fm-butono></fm-dialogo>',
    );
    await expect(page.locator("#d fm-avizo")).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.activeElement?.id ?? "")).toBe("k");
  });

  test("B-7: Enter in a field of the content confirms, unless the confirmation is locked", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-dialogo id="d" open>Metadaten bearbeiten<fm-kampo id="k" slot="content">Titel</fm-kampo><fm-butono slot="actions" emphasis="low">Abbrechen</fm-butono><fm-butono slot="actions" emphasis="high">Speichern</fm-butono></fm-dialogo><fm-dialogo id="r" reason="required">Verwerfen?<fm-kampo id="q" slot="content">Titel</fm-kampo><fm-butono slot="actions" emphasis="low">Abbrechen</fm-butono><fm-butono slot="actions" emphasis="high">Verwerfen</fm-butono></fm-dialogo>',
    );
    await page.evaluate(() => {
      for (const id of ["d", "r"])
        document.getElementById(id)?.addEventListener("confirm", () => {
          document.body.dataset[`confirmed${id}`] = "ja";
        });
    });
    await expect.poll(() => page.evaluate(() => document.activeElement?.id ?? "")).toBe("k");
    await page.keyboard.type("Neu");
    await page.keyboard.press("Enter");
    await expect(page.locator("body")).toHaveAttribute("data-confirmedd", "ja");
    await expect(page.locator("#d")).not.toHaveAttribute("open");
    // A required reason left empty locks the confirmation: Enter does nothing.
    await page.locator("#r").evaluate((element) => element.setAttribute("open", ""));
    await page.locator("#q").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#r")).toHaveAttribute("open");
    await expect(page.locator("body")).not.toHaveAttribute("data-confirmedr", "ja");
  });

  test("B-8: the message of a dialogo may hold several paragraphs of teksto", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-dialogo id="d" open>Befund verwerfen?<fm-teksto slot="message">Fundstelle: STD-4, Absatz 2.</fm-teksto><fm-teksto slot="message">Der Befund gilt danach als verworfen.</fm-teksto><fm-butono slot="actions" emphasis="low">Abbrechen</fm-butono><fm-butono slot="actions" emphasis="high">Verwerfen</fm-butono></fm-dialogo>',
    );
    const paragraphs = page.locator('#d fm-teksto[slot="message"]');
    await expect(paragraphs).toHaveCount(2);
    await expect(paragraphs.nth(0)).toBeVisible();
    await expect(paragraphs.nth(1)).toBeVisible();
    const [first, second] = await paragraphs.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().top),
    );
    expect(second ?? 0).toBeGreaterThan(first ?? 0);
    await expect(page.getByRole("dialog")).toHaveAccessibleDescription(
      /Fundstelle: STD-4, Absatz 2\.\s*Der Befund gilt danach als verworfen\./,
    );
  });

  test("B-9: the click of a saltligilo can be cancelled — focus only, no fragment; focus-only does that itself", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-saltligilo id="s" to="haupt">Zum Inhalt springen</fm-saltligilo><fm-saltligilo id="f" to="haupt" focus-only>Zum Inhalt</fm-saltligilo><fm-saltligilo id="p" to="haupt">Springen</fm-saltligilo><main id="haupt"><p>Inhalt</p></main>',
    );
    const fragment = () => page.evaluate(() => location.hash);
    const focused = () => page.evaluate(() => document.activeElement?.id ?? "");
    await page.evaluate(() =>
      document.getElementById("s")?.addEventListener("click", (event) => event.preventDefault()),
    );
    await page.locator("#s").focus();
    await page.keyboard.press("Enter");
    await expect.poll(focused).toBe("haupt");
    expect(await fragment()).toBe("");
    await page.locator("#f").focus();
    await page.keyboard.press("Enter");
    await expect.poll(focused).toBe("haupt");
    expect(await fragment()).toBe("");
    // Without either, the platform follows the link as before.
    await page.locator("#p").focus();
    await page.keyboard.press("Enter");
    await expect.poll(fragment).toBe("#haupt");
    await expect.poll(focused).toBe("haupt");
  });

  test("B-10: a teksto holds a ligilo, an insigno and a teksto kind=code in its running text", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-teksto id="t">Gilt für <fm-ligilo id="l" to="#p">Projekt A</fm-ligilo> als <fm-insigno id="i" intent="info">Pflicht</fm-insigno> seit <fm-teksto id="c" kind="code">STD-1</fm-teksto>.</fm-teksto>',
    );
    for (const id of ["l", "i", "c"]) await expect(page.locator(`#${id}`)).toBeVisible();
    // Phrasing content: the children stand in the line of the text, not below it.
    const tops = await page.evaluate(() =>
      ["t", "l", "i", "c"].map((id) => {
        const box = document.getElementById(id)?.getBoundingClientRect();
        return box === undefined ? -1 : Math.round(box.top + box.height / 2);
      }),
    );
    const [text, ...children] = tops;
    for (const middle of children) expect(Math.abs(middle - (text ?? 0))).toBeLessThan(12);
    await expect(page.getByRole("link", { name: "Projekt A" })).toBeVisible();
  });
});
