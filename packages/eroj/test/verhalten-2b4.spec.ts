// Spec 036 Teil 5 ②b-4 (Spec 029 abgleich.json, aspect "verhalten" and the remaining Muster rows)
// in the browser: the behaviour the Skemo states – roles by status and by purpose, jumping by
// typing, overflow, download, an unknown total, a collapsed middle, streaming. Roles are asserted
// structurally (getByRole, the ARIA snapshot), never by prose. A usage without the new props
// behaves as before (AC-10, compared by ac10 outside this suite).

import { expect, type Page, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

/** The events of the given types the element with the id says, in order. */
async function listen(page: Page, id: string, types: readonly string[]): Promise<void> {
  await page.evaluate(
    ([target, names]) => {
      const host = document.getElementById(target);
      (window as unknown as { heard: string[] }).heard = [];
      for (const type of names) {
        host?.addEventListener(type, () =>
          (window as unknown as { heard: string[] }).heard.push(type),
        );
      }
    },
    [id, types] as const,
  );
}

const heard = (page: Page) => page.evaluate(() => (window as unknown as { heard: string[] }).heard);

test.describe("②b-4 A-avizo-5: the role follows the intent", () => {
  test("warning and danger are alerts, info and success are status", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-avizo id="i" intent="info">Gespeichert.</fm-avizo><fm-avizo id="s" intent="success">Hochgeladen.</fm-avizo><fm-avizo id="w" intent="warning">Speicher fast voll.</fm-avizo><fm-avizo id="d" intent="danger">Nicht gespeichert.</fm-avizo>',
    );
    await expect(page.getByRole("status")).toHaveCount(2);
    await expect(page.getByRole("alert")).toHaveCount(2);
    await expect(page.locator("body")).toMatchAriaSnapshot(`
      - status: /Gespeichert\\./
      - status: /Hochgeladen\\./
      - alert: /Speicher fast voll\\./
      - alert: /Nicht gespeichert\\./
    `);
    // The role follows a later change of the intent.
    await page.locator("#w").evaluate((element) => element.setAttribute("intent", "info"));
    await expect(page.getByRole("status")).toHaveCount(3);
    await expect(page.getByRole("alert")).toHaveCount(1);
  });
});

test.describe("②b-4 A-dialogo-5, M-3: the purpose decides how the dialog closes and its role", () => {
  const ACTIONS =
    '<fm-butono id="cancel" slot="actions" emphasis="low">Abbrechen</fm-butono><fm-butono id="ok" slot="actions" emphasis="high">Weiter</fm-butono>';
  const dialog = (dismiss: string) =>
    `<fm-dialogo id="d" open ${dismiss === "" ? "" : `dismiss="${dismiss}"`}>Sitzung läuft ab<span slot="message">Bitte bestätigen.</span>${ACTIONS}</fm-dialogo>`;

  /** A click on the backdrop: the top left corner of the viewport, outside the surface. */
  const clickBeside = (page: Page) => page.mouse.click(4, 4);

  test("free: a hint – Escape and a click beside it close it, role dialog", async ({ page }) => {
    await serve(page, out, dialog("free"));
    await expect(page.getByRole("dialog", { name: "Sitzung läuft ab" })).toBeVisible();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
    await listen(page, "d", ["cancel", "confirm"]);
    await clickBeside(page);
    await expect(page.locator("#d")).not.toHaveAttribute("open");
    await expect(page.getByRole("dialog")).toBeHidden();
    expect(await heard(page)).toEqual(["cancel"]);
    await page.locator("#d").evaluate((element) => element.setAttribute("open", ""));
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#d")).not.toHaveAttribute("open");
    expect(await heard(page)).toEqual(["cancel", "cancel"]);
  });

  test("free: a click inside the surface does not close it", async ({ page }) => {
    await serve(page, out, dialog("free"));
    const modal = page.getByRole("dialog", { name: "Sitzung läuft ab" });
    await expect(modal).toBeVisible();
    await listen(page, "d", ["cancel"]);
    const box = await modal.boundingBox();
    // The padding of the surface, beside its heading: inside the dialog, on no child.
    await page.mouse.click((box?.x ?? 0) + 3, (box?.y ?? 0) + 3);
    await expect(page.locator("#d")).toHaveAttribute("open");
    expect(await heard(page)).toEqual([]);
  });

  test("guarded (the default): a form – only Escape closes it, a click beside it does not", async ({
    page,
  }) => {
    await serve(page, out, dialog(""));
    await expect(page.getByRole("dialog", { name: "Sitzung läuft ab" })).toBeVisible();
    await listen(page, "d", ["cancel"]);
    await clickBeside(page);
    await expect(page.locator("#d")).toHaveAttribute("open");
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await heard(page)).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(page.locator("#d")).not.toHaveAttribute("open");
    expect(await heard(page)).toEqual(["cancel"]);
  });

  test("explicit: a duty – role alertdialog, neither Escape nor a click beside it closes it; the actions do", async ({
    page,
  }) => {
    await serve(page, out, dialog("explicit"));
    const modal = page.getByRole("alertdialog", { name: "Sitzung läuft ab" });
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAccessibleDescription("Bitte bestätigen.");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(modal).toMatchAriaSnapshot(`
      - alertdialog "Sitzung läuft ab":
        - heading "Sitzung läuft ab" [level=2]
        - paragraph: Bitte bestätigen.
        - button "Abbrechen"
        - button "Weiter"
    `);
    await listen(page, "d", ["cancel", "confirm"]);
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await clickBeside(page);
    await expect(page.locator("#d")).toHaveAttribute("open");
    await expect(modal).toBeVisible();
    expect(await heard(page)).toEqual([]);
    await page.locator("#cancel").click();
    await expect(page.locator("#d")).not.toHaveAttribute("open");
    expect(await heard(page)).toEqual(["cancel"]);
  });

  test("the role follows a later change of the purpose", async ({ page }) => {
    await serve(page, out, dialog("explicit"));
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.locator("#d").evaluate((element) => element.setAttribute("dismiss", "guarded"));
    await expect(page.getByRole("dialog", { name: "Sitzung läuft ab" })).toBeVisible();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
  });
});

test.describe("②b-4 A-markdovido-3: streaming", () => {
  test("while streaming the document is busy; the text grows; then it is not", async ({ page }) => {
    await serve(page, out, '<fm-markdovido id="m" streaming source="Die Antwort"></fm-markdovido>');
    const busy = () =>
      page
        .locator("#m")
        .evaluate(
          (element) =>
            element.shadowRoot?.querySelector('[part="control"]')?.getAttribute("aria-busy") ??
            null,
        );
    await expect.poll(busy).toBe("true");
    await page
      .locator("#m")
      .evaluate((element) => element.setAttribute("source", "Die Antwort kommt Wort für Wort."));
    await expect(page.locator("#m")).toContainText("Wort für Wort.");
    expect(await busy()).toBe("true");
    await page.locator("#m").evaluate((element) => element.removeAttribute("streaming"));
    await expect.poll(busy).toBe(null);
  });

  test("without streaming the document is not busy", async ({ page }) => {
    await serve(page, out, '<fm-markdovido id="m" source="Fertig."></fm-markdovido>');
    await expect(page.locator("#m")).toContainText("Fertig.");
    expect(
      await page
        .locator("#m")
        .evaluate((element) =>
          element.shadowRoot?.querySelector('[part="control"]')?.hasAttribute("aria-busy"),
        ),
    ).toBe(false);
  });
});

test.describe("②b-4 A-elektilo-5, A-listelektilo-5, A-menuo-5: jumping by typing", () => {
  const LAENDER = [
    ["by", "Bayern"],
    ["be", "Berlin"],
    ["bb", "Brandenburg"],
    ["hb", "Bremen"],
    ["hh", "Hamburg"],
  ] as const;

  test("elektilo: the platform's select jumps to the option that starts with the typed words; the element takes no key", async ({
    page,
  }) => {
    const options = LAENDER.map(
      ([value, words]) => `<data slot="options" value="${value}">${words}</data>`,
    ).join("");
    await serve(page, out, `<fm-elektilo id="e" value="hh">Land${options}</fm-elektilo>`);
    await page.evaluate(() => {
      (window as unknown as { taken: string[] }).taken = [];
      window.addEventListener("keydown", (event) => {
        if (event.defaultPrevented)
          (window as unknown as { taken: string[] }).taken.push(event.key);
      });
    });
    await page.getByRole("combobox", { name: "Land" }).focus();
    await page.keyboard.type("bre");
    await expect(page.locator("#e")).toHaveAttribute("value", "hb");
    expect(await page.evaluate(() => (window as unknown as { taken: string[] }).taken)).toEqual([]);
  });

  /** The listelektilo with the states: its value, whether the list is open, the active row. */
  const listState = (page: Page) =>
    page.locator("#l").evaluate((element) => {
      const rows = [...(element.shadowRoot?.querySelectorAll('[part="item"]') ?? [])];
      const active = rows.find((row) => row.getAttribute("data-active") === "true");
      const box = element.shadowRoot?.querySelector('[role="combobox"]');
      const id = box?.getAttribute("aria-activedescendant");
      const byId = id ? element.shadowRoot?.getElementById(id) : null;
      return {
        value: element.getAttribute("value"),
        open: box?.getAttribute("aria-expanded") === "true",
        active: (byId ?? active)?.getAttribute("data-value") ?? null,
      };
    });

  const LIST = (attributes: string) =>
    `<fm-listelektilo id="l" ${attributes}>Land${LAENDER.map(([value, words]) => `<data slot="options" value="${value}">${words}</data>`).join("")}</fm-listelektilo>`;

  test("listelektilo: typed words find the option they start with – open, the active row; closed, the choice", async ({
    page,
  }) => {
    await serve(page, out, LIST('value="hh"'));
    const box = page.getByRole("combobox", { name: "Land" });
    await box.focus();
    await page.keyboard.type("bre");
    expect((await listState(page)).value).toBe("hb");
    await page.keyboard.press("ArrowDown");
    expect((await listState(page)).open).toBe(true);
    await page.keyboard.type("bra");
    expect((await listState(page)).active).toBe("bb");
    await page.keyboard.press("Enter");
    expect((await listState(page)).value).toBe("bb");
  });

  test("listelektilo: the same letter again moves on to the next option that starts with it", async ({
    page,
  }) => {
    await serve(page, out, LIST('value="hh"'));
    await page.getByRole("combobox", { name: "Land" }).focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.type("bbb");
    expect((await listState(page)).active).toBe("bb");
  });

  const MENU =
    '<fm-menuo id="m"><data value="edit">Bearbeiten</data><data value="rename">Benennen</data><data value="describe">Beschreiben</data><data value="help" to="#hilfe">Hilfe</data></fm-menuo>';

  /** The entry that has the focus in the menu: its words. */
  const focusedEntry = (page: Page) =>
    page.locator("#m").evaluate((element) => {
      const row = element.shadowRoot?.activeElement;
      return (row?.querySelector("slot")?.assignedNodes() ?? [])
        .map((node) => node.textContent ?? "")
        .join("")
        .trim();
    });

  test("menuo: typed words move the focus to the entry they start with", async ({ page }) => {
    await serve(page, out, MENU);
    await page.getByRole("button", { name: "Weitere Aktionen" }).focus();
    await page.keyboard.press("ArrowDown");
    await expect.poll(() => focusedEntry(page)).toBe("Bearbeiten");
    await page.keyboard.type("bes");
    await expect.poll(() => focusedEntry(page)).toBe("Beschreiben");
    await page.keyboard.press("Home");
    await page.keyboard.type("hi");
    await expect.poll(() => focusedEntry(page)).toBe("Hilfe");
  });

  test("menuo: an entry with a target is a link in the menu; Enter follows it and the menu closes, no select", async ({
    page,
  }) => {
    await serve(page, out, MENU);
    await listen(page, "m", ["select"]);
    await page.getByRole("button", { name: "Weitere Aktionen" }).click();
    const help = page.getByRole("menuitem", { name: "Hilfe" });
    await expect(help).toBeVisible();
    expect(
      await help.evaluate((row) => ({
        tag: row.tagName.toLowerCase(),
        href: row.getAttribute("href"),
      })),
    ).toEqual({ tag: "a", href: "#hilfe" });
    await expect(page.getByRole("menu")).toMatchAriaSnapshot(`
      - menu:
        - menuitem "Bearbeiten"
        - menuitem "Benennen"
        - menuitem "Beschreiben"
        - menuitem "Hilfe"
    `);
    // The other entries stay buttons: they act here.
    expect(
      await page
        .getByRole("menuitem", { name: "Bearbeiten" })
        .evaluate((row) => row.tagName.toLowerCase()),
    ).toBe("button");
    await help.focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#hilfe");
    await expect(page.getByRole("menu")).toBeHidden();
    expect(await heard(page)).toEqual([]);
  });
});

test.describe("②b-4 A-langetaro-4: overflow", () => {
  const TABS = [
    "Inhalt",
    "Versionen",
    "Regeln",
    "Prüfung",
    "Freigaben",
    "Verlauf",
    "Anhänge",
    "Notizen",
  ];
  const tabs = (width: string, selected: string) =>
    `<div id="box" style="inline-size: ${width}"><fm-langetaro id="t" label="Akte" selected="${selected}">${TABS.map((words) => `<data value="${words.toLowerCase()}">${words}</data>`).join("")}<div slot="panel">Der Inhalt</div></fm-langetaro></div>`;

  /** Whether the tab is wholly inside the bar's visible box; and whether the bar scrolls. */
  const inView = (page: Page, words: string) =>
    page.locator("#t").evaluate((element, name) => {
      const bar = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      const tab = [...bar.querySelectorAll('[part="tab"]')].find(
        (row) => (row.querySelector("slot")?.assignedNodes()[0]?.textContent ?? "").trim() === name,
      );
      const outer = bar.getBoundingClientRect();
      const inner = tab?.getBoundingClientRect();
      return {
        scrolls: bar.scrollWidth > bar.clientWidth,
        visible:
          inner !== undefined && inner.left >= outer.left - 0.5 && inner.right <= outer.right + 0.5,
      };
    }, words);

  test("the bar scrolls; a tab selected at the end stands in view from the start", async ({
    page,
  }) => {
    await serve(page, out, tabs("14rem", "notizen"));
    await expect.poll(() => inView(page, "Notizen")).toEqual({ scrolls: true, visible: true });
    await expect(page.getByRole("tab", { name: "Notizen" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("a tab selected later moves into view", async ({ page }) => {
    await serve(page, out, tabs("14rem", "inhalt"));
    await expect.poll(() => inView(page, "Inhalt")).toEqual({ scrolls: true, visible: true });
    await page.locator("#t").evaluate((element) => element.setAttribute("selected", "anhänge"));
    await expect.poll(() => inView(page, "Anhänge")).toEqual({ scrolls: true, visible: true });
    await page.locator("#t").evaluate((element) => element.setAttribute("selected", "inhalt"));
    await expect.poll(() => inView(page, "Inhalt")).toEqual({ scrolls: true, visible: true });
  });

  test("when the bar becomes narrower, the selected tab stays in view", async ({ page }) => {
    await serve(page, out, tabs("60rem", "notizen"));
    await expect.poll(() => inView(page, "Notizen")).toEqual({ scrolls: false, visible: true });
    await page.locator("#box").evaluate((element) => {
      (element as HTMLElement).style.inlineSize = "12rem";
    });
    await expect.poll(() => inView(page, "Notizen")).toEqual({ scrolls: true, visible: true });
  });

  test("the keys move through the tabs and the tab with the focus stands in view", async ({
    page,
  }) => {
    await serve(page, out, tabs("14rem", "inhalt"));
    await page.getByRole("tab", { name: "Inhalt" }).focus();
    await page.keyboard.press("End");
    await expect.poll(() => inView(page, "Notizen")).toEqual({ scrolls: true, visible: true });
    await page.keyboard.press("Home");
    await expect.poll(() => inView(page, "Inhalt")).toEqual({ scrolls: true, visible: true });
  });
});

test.describe("②b-4 A-pagxigilo-6: unknown total", () => {
  /** The names of the items of the pagination, in order, and which say they are off. */
  const itemsOf = (page: Page) =>
    page
      .locator("#p")
      .evaluate((element) =>
        [...(element.shadowRoot?.querySelectorAll('[part="item"], [part="ellipsis"]') ?? [])].map(
          (item) =>
            item.getAttribute("part") === "ellipsis"
              ? "…"
              : `${item.getAttribute("aria-label")}${item.getAttribute("aria-disabled") === "true" ? " (aus)" : ""}${item.getAttribute("aria-current") === "page" ? " (jetzt)" : ""}`,
        ),
      );

  test("the pages known so far, no last page, an ellipsis after them; next leads on", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-pagxigilo id="p" page="5" total-pages="10" total-unknown></fm-pagxigilo>',
    );
    await expect(page.getByRole("navigation", { name: "Seitenblättern" })).toBeVisible();
    expect(await itemsOf(page)).toEqual([
      "Vorherige Seite",
      "Seite 1",
      "…",
      "Seite 4",
      "Seite 5 (jetzt)",
      "Seite 6",
      "…",
      "Nächste Seite",
    ]);
  });

  test("on the last page known so far next stays on; with the total known it is off", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-pagxigilo id="p" page="10" total-pages="10" total-unknown></fm-pagxigilo>',
    );
    await expect(page.getByRole("button", { name: "Nächste Seite" })).not.toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await listen(page, "p", ["page-change"]);
    await page.getByRole("button", { name: "Nächste Seite" }).click();
    await expect(page.locator("#p")).toHaveAttribute("page", "11");
    expect(await heard(page)).toEqual(["page-change"]);
    await serve(page, out, '<fm-pagxigilo id="p" page="10" total-pages="10"></fm-pagxigilo>');
    await expect(page.getByRole("button", { name: "Nächste Seite" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  test("first-last: the first page stays, the last falls away", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-pagxigilo id="p" page="5" total-pages="10" first-last total-unknown></fm-pagxigilo>',
    );
    await expect(page.getByRole("button", { name: "Erste Seite" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Letzte Seite" })).toHaveCount(0);
  });

  test("summary count says the place without a total; compact the number alone", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-pagxigilo id="p" page="5" total-pages="10" summary="count" total-unknown></fm-pagxigilo>',
    );
    const summary = page.locator("#p").locator('[part="summary"]');
    await expect(summary).toHaveText("Seite 5");
    await page.locator("#p").evaluate((element) => element.setAttribute("summary", "compact"));
    await expect(summary.locator('[aria-hidden="true"]')).toHaveText("5");
    await expect(summary.locator(".fm-hidden")).toHaveText("Seite 5");
  });
});

test.describe("②b-4 A-ligilo-6: download", () => {
  test("download: the platform's download, the mark is the ikono download, heard as a description", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-ligilo id="a" to="/dateien/bericht.pdf" download>Bericht (PDF, 2 MB)</fm-ligilo>',
    );
    const link = page.getByRole("link", { name: "Bericht (PDF, 2 MB)" });
    await expect(link).toHaveAttribute("download", "");
    await expect(link).toHaveAttribute("href", "/dateien/bericht.pdf");
    await expect(link).not.toHaveAttribute("rel");
    await expect(link).toHaveAccessibleDescription("lädt herunter");
    const mark = page.locator("#a").locator('slot[name="icon-end"] > fm-ikono');
    await expect(mark).toHaveAttribute("name", "download");
    await expect(mark).toBeVisible();
    await page.evaluate(() => document.documentElement.setAttribute("lang", "en"));
    await page.locator("#a").evaluate((element) => element.setAttribute("size", "small"));
    await expect(link).toHaveAccessibleDescription("downloads");
    // Without download: no download, no description, no mark.
    await page.locator("#a").evaluate((element) => element.removeAttribute("download"));
    await expect(link).not.toHaveAttribute("download");
    await expect(link).toHaveAccessibleDescription("");
    await expect(mark).toBeHidden();
  });

  test("external keeps its own mark", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-ligilo id="a" to="https://docs.example/" external>Doku</fm-ligilo>',
    );
    const mark = page.locator("#a").locator('slot[name="icon-end"] > fm-ikono');
    await expect(mark).toHaveAttribute("name", "external");
    await expect(mark).toBeVisible();
  });
});

test.describe("②b-4 A-spuro-6: collapsed middle", () => {
  const PATH = (attributes: string) =>
    `<fm-spuro id="s" label="Pfad" ${attributes}><a href="#start">Start</a><a href="#projekte">Projekte</a><a href="#fundamento">Fundamento</a><a href="#specs">Specs</a><a href="#spec-036">Spec 036</a><span>Teil 5</span></fm-spuro>`;

  test("with more items than max-items the middle ones stand in a menu: the first, the menu, the last ones", async ({
    page,
  }) => {
    await serve(page, out, PATH('max-items="4"'));
    const trail = page.getByRole("navigation", { name: "Pfad" });
    await expect(trail).toMatchAriaSnapshot(`
      - navigation "Pfad":
        - list:
          - listitem:
            - link "Start"
          - listitem:
            - button "Ausgelassene Ebenen"
          - listitem:
            - link "Specs"
          - listitem:
            - link "Spec 036"
          - listitem: Teil 5
    `);
    await expect(page.getByRole("link", { name: "Projekte" })).toHaveCount(0);
  });

  test("the menu lists the hidden levels as links; one followed moves there", async ({ page }) => {
    await serve(page, out, PATH('max-items="4"'));
    const more = page.getByRole("button", { name: "Ausgelassene Ebenen" });
    await expect(more).toBeVisible();
    await more.click();
    const menu = page.getByRole("menu");
    await expect(menu).toMatchAriaSnapshot(`
      - menu:
        - menuitem "Projekte"
        - menuitem "Fundamento"
    `);
    expect(
      await page
        .getByRole("menuitem", { name: "Fundamento" })
        .evaluate((row) => [row.tagName.toLowerCase(), row.getAttribute("href")]),
    ).toEqual(["a", "#fundamento"]);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#fundamento");
  });

  test("without max-items, or with few enough items, nothing collapses", async ({ page }) => {
    await serve(page, out, PATH(""));
    await expect(page.getByRole("listitem")).toHaveCount(6);
    await expect(page.getByRole("button")).toHaveCount(0);
    await page.locator("#s").evaluate((element) => element.setAttribute("max-items", "6"));
    await expect(page.getByRole("listitem")).toHaveCount(6);
    await expect(page.getByRole("button")).toHaveCount(0);
    await page.locator("#s").evaluate((element) => element.setAttribute("max-items", "3"));
    await expect(page.getByRole("listitem")).toHaveCount(4);
    await expect(page.getByRole("button", { name: "Ausgelassene Ebenen" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Specs" })).toHaveCount(0);
  });
});
