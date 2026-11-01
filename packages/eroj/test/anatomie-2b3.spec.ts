// Spec 036 Teil 5 ②b-3 (Spec 029 abgleich.json, aspect "anatomie") in the browser: the new parts
// and slots of the fields, choices and menus as the Skemo states them. A usage without the new
// content looks as before (AC-10, compared by ac10 outside this suite).

import { expect, type Page, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

/** The box of a part in the shadow tree of the first host of the selector. */
async function boxOf(page: Page, host: string, part: string) {
  return page.evaluate(
    ([query, name]) => {
      const element = document.querySelector(query)?.shadowRoot?.querySelector(`[part="${name}"]`);
      if (!(element instanceof HTMLElement)) return undefined;
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        shown: rect.height > 0,
      };
    },
    [host, part] as const,
  );
}

test.describe("②b-3 A-markobutono-4, A-sxaltilo-4: help", () => {
  for (const ero of ["markobutono", "sxaltilo"]) {
    test(`${ero}: the help stands under the label and describes the control`, async ({ page }) => {
      await serve(
        page,
        out,
        `<fm-${ero}>Newsletter<span slot="help">Einmal im Monat, jederzeit abbestellbar.</span></fm-${ero}>`,
      );
      const help = await boxOf(page, `fm-${ero}`, "help");
      const label = await boxOf(page, `fm-${ero}`, "label");
      expect(help?.shown).toBe(true);
      expect(help?.top ?? 0).toBeGreaterThanOrEqual(label?.bottom ?? Number.POSITIVE_INFINITY);
      expect(help?.left).toBe(label?.left);
      const control = page.locator(`fm-${ero}`).locator('[part="control"]');
      await expect(control).toHaveAccessibleDescription("Einmal im Monat, jederzeit abbestellbar.");
    });

    test(`${ero}: without help nothing stands under the label`, async ({ page }) => {
      await serve(page, out, `<fm-${ero}>Newsletter</fm-${ero}>`);
      expect((await boxOf(page, `fm-${ero}`, "help"))?.shown ?? false).toBe(false);
      const control = page.locator(`fm-${ero}`).locator('[part="control"]');
      await expect(control).toHaveAccessibleDescription("");
    });
  }
});

test.describe("②b-3 A-elekto-4: option-description", () => {
  test("an option with a description shows it under its label and is described by it", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-elekto name="versand">Versandart<data slot="options" value="standard" description="3–5 Werktage">Standard</data><data slot="options" value="express">Express</data></fm-elekto>',
    );
    const rows = page.locator("fm-elekto").locator('[part="option"]');
    const first = rows.nth(0);
    const description = first.locator('[part="option-description"]');
    await expect(description).toBeVisible();
    await expect(description).toHaveText("3–5 Werktage");
    await expect(first).toHaveAccessibleDescription("3–5 Werktage");
    const label = await first.locator('[part="option-label"]').boundingBox();
    const under = await description.boundingBox();
    expect(under?.y ?? 0).toBeGreaterThanOrEqual((label?.y ?? 0) + (label?.height ?? 0) - 1);
    expect(Math.round(under?.x ?? 0)).toBe(Math.round(label?.x ?? -1));
    // An option without a description shows none and is described by nothing.
    await expect(rows.nth(1).locator('[part="option-description"]')).toBeHidden();
    await expect(rows.nth(1)).toHaveAccessibleDescription("");
  });

  test("a description given later follows", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-elekto name="versand">Versandart<data slot="options" value="standard">Standard</data><data slot="options" value="express">Express</data></fm-elekto>',
    );
    await page.evaluate(() =>
      document.querySelector('data[value="express"]')?.setAttribute("description", "Morgen da"),
    );
    const description = page
      .locator("fm-elekto")
      .locator('[part="option"]')
      .nth(1)
      .locator('[part="option-description"]');
    await expect(description).toHaveText("Morgen da");
  });
});

test.describe("②b-3 A-glitilo-4: tick", () => {
  test("with ticks a mark stands at every step, inside the track, unheard", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-glitilo min="0" max="10" step="2" value="4" ticks>Stufe</fm-glitilo>',
    );
    const ticks = page.locator("fm-glitilo").locator('[part="tick"]');
    await expect(ticks).toHaveCount(6);
    const track = await page.locator("fm-glitilo").locator('[part="track"]').boundingBox();
    const first = await ticks.nth(0).boundingBox();
    const last = await ticks.nth(5).boundingBox();
    if (track === null || first === null || last === null) throw new Error("no boxes");
    const middle = (box: { x: number; width: number }) => box.x + box.width / 2;
    expect(Math.abs(middle(first) - track.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(middle(last) - (track.x + track.width))).toBeLessThanOrEqual(1);
    expect(first.y).toBeGreaterThanOrEqual(track.y - 1);
    expect(first.y + first.height).toBeLessThanOrEqual(track.y + track.height + 1);
    expect(await ticks.nth(0).getAttribute("aria-hidden")).toBe("true");
  });

  test("without ticks no mark stands", async ({ page }) => {
    await serve(page, out, '<fm-glitilo min="0" max="10" step="2" value="4">Stufe</fm-glitilo>');
    await expect(page.locator("fm-glitilo").locator('[part="tick"]')).toHaveCount(0);
  });
});

test.describe("②b-3 A-alsxutilo-4: the upload icon", () => {
  test("a dropzone shows the ikono upload first, unheard; a field without one does not", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-alsxutilo id="z" dropzone>Belege</fm-alsxutilo><fm-alsxutilo id="f">Belege</fm-alsxutilo>',
    );
    const icon = page.locator("#z").locator('[part="dropzone"] > [part="icon"]');
    await expect(icon).toBeVisible();
    await expect(icon).toHaveAttribute("name", "upload");
    await expect(icon).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("#f").locator('[part="dropzone"] > [part="icon"]')).toBeHidden();
  });
});

/** Options of two groups and one without, for the group headings (A-*-4). */
const GROUPED_OPTIONS =
  '<data slot="options" value="de" group="Europa">Deutschland</data><data slot="options" value="fr" group="Europa">Frankreich</data><data slot="options" value="jp" group="Asien">Japan</data><data slot="options" value="kr" group="Asien">Korea</data>';

test.describe("②b-3 A-elektilo-4: group headings", () => {
  test("options with a group stand in the platform's group, named by it; the value still chooses", async ({
    page,
  }) => {
    await serve(page, out, `<fm-elektilo value="jp">Land${GROUPED_OPTIONS}</fm-elektilo>`);
    const select = page.locator("fm-elektilo").locator("select");
    const groups = await select.evaluate((element) =>
      [...element.querySelectorAll("optgroup")].map((group) => [
        group.label,
        [...group.querySelectorAll("option")].map((option) => option.value),
      ]),
    );
    expect(groups).toEqual([
      ["Europa", ["de", "fr"]],
      ["Asien", ["jp", "kr"]],
    ]);
    await expect(select).toHaveValue("jp");
  });
});

test.describe("②b-3 A-listelektilo-4: group headings and divider", () => {
  test("the open list shows a group per heading, a divider between two groups; the keys cross them", async ({
    page,
  }) => {
    await serve(page, out, `<fm-listelektilo>Land${GROUPED_OPTIONS}</fm-listelektilo>`);
    const host = page.locator("fm-listelektilo");
    await host.locator("#control").click();
    const groups = host.locator('[role="group"]');
    await expect(groups).toHaveCount(2);
    await expect(groups.nth(0)).toHaveAccessibleName("Europa");
    await expect(groups.nth(1)).toHaveAccessibleName("Asien");
    await expect(groups.nth(0).locator('[part="group-heading"]')).toHaveText("Europa");
    await expect(groups.nth(0).locator('[role="option"]')).toHaveCount(2);
    await expect(host.locator('[part="divider"]')).toHaveCount(1);
    await expect(groups.nth(1).locator('[part="divider"]')).toHaveCount(1);
    await expect(groups.nth(1).locator('[part="divider"]')).toHaveAttribute("aria-hidden", "true");
    for (let i = 0; i < 2; i++) await page.keyboard.press("ArrowDown");
    const active = await host
      .locator('[part="control"]')
      .evaluate((button) => button.getAttribute("aria-activedescendant"));
    await expect(host.locator(`[id="${active}"]`)).toHaveText("Japan");
  });

  test("without groups the list has no group and no divider", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-listelektilo>Land<data slot="options" value="de">Deutschland</data><data slot="options" value="fr">Frankreich</data></fm-listelektilo>',
    );
    const host = page.locator("fm-listelektilo");
    await host.locator("#control").click();
    await expect(host.locator('[role="group"]')).toHaveCount(0);
    await expect(host.locator('[part="divider"], [part="group-heading"]')).toHaveCount(0);
  });
});

test.describe("②b-3 A-kompletigilo-4: group headings", () => {
  test("the suggestions stand in their groups, named by the heading", async ({ page }) => {
    await serve(page, out, `<fm-kompletigilo>Land${GROUPED_OPTIONS}</fm-kompletigilo>`);
    const host = page.locator("fm-kompletigilo");
    await host.locator("input").fill("a");
    const groups = host.locator('[role="group"]');
    await expect(groups).toHaveCount(2);
    await expect(groups.nth(0)).toHaveAccessibleName("Europa");
    await expect(groups.nth(1).locator('[part="suggestion"]')).toHaveText(["Japan", "Korea"]);
  });
});

test.describe("②b-3 A-plurelektilo-1, A-plurelektilo-4: select-all and group headings", () => {
  test("select-all is a checkbox before the list: it chooses every option, then none", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-plurelektilo select-all lang="de">Länder${GROUPED_OPTIONS}</fm-plurelektilo>`,
    );
    const host = page.locator("fm-plurelektilo");
    await host.locator("#control").click();
    const all = host.locator('[part="select-all"]');
    await expect(all).toBeVisible();
    await expect(all).toHaveAccessibleName("Alle wählen");
    await expect(all).toHaveAttribute("role", "checkbox");
    await expect(all).toHaveAttribute("aria-checked", "false");
    await all.click();
    await expect(host).toHaveAttribute("values", "de,fr,jp,kr");
    await expect(all).toHaveAttribute("aria-checked", "true");
    await host.locator('[part="item"]').nth(0).click();
    await expect(all).toHaveAttribute("aria-checked", "mixed");
    await all.click();
    await expect(host).toHaveAttribute("values", "de,fr,jp,kr");
    await all.click();
    await expect(host).toHaveAttribute("values", "");
    await expect(host.locator('[role="group"]')).toHaveCount(2);
    await expect(host.locator('[role="group"]').nth(1)).toHaveAccessibleName("Asien");
  });

  test("without select-all no such row stands", async ({ page }) => {
    await serve(page, out, `<fm-plurelektilo>Länder${GROUPED_OPTIONS}</fm-plurelektilo>`);
    const host = page.locator("fm-plurelektilo");
    await host.locator("#control").click();
    await expect(host.locator('[part="select-all"]')).toBeHidden();
  });
});

test.describe("②b-3 A-menuo-4: icon per entry, group headings, divider", () => {
  test("an entry with an icon shows it before its words, unheard; groups are named by their heading", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-menuo label="Aktionen"><data value="edit" icon="edit" group="Bearbeiten">Umbenennen</data><data value="copy" group="Bearbeiten">Kopieren</data><fm-apartigilo></fm-apartigilo><data value="delete" icon="close" intent="danger">Löschen</data></fm-menuo>',
    );
    const host = page.locator("fm-menuo");
    await host.locator('[part="trigger"]').first().click();
    const rows = host.locator('[part="item"]');
    await expect(rows).toHaveCount(3);
    const icon = rows.nth(0).locator('[part="icon"]');
    await expect(icon).toBeVisible();
    await expect(icon).toHaveAttribute("name", "edit");
    await expect(icon).toHaveAttribute("aria-hidden", "true");
    await expect(rows.nth(0)).toHaveAccessibleName("Umbenennen");
    await expect(rows.nth(1).locator('[part="icon"]')).toBeHidden();
    const iconBox = await icon.boundingBox();
    const words = await rows.nth(0).boundingBox();
    expect((iconBox?.x ?? 0) - (words?.x ?? 0)).toBeLessThan((words?.width ?? 0) / 2);
    const group = host.locator('[role="group"]');
    await expect(group).toHaveCount(1);
    await expect(group).toHaveAccessibleName("Bearbeiten");
    await expect(group.locator('[part="item"]')).toHaveCount(2);
    await expect(host.locator('[role="separator"], [part="separator"]').first()).toBeAttached();
    await page.keyboard.press("ArrowDown");
    await expect(rows.nth(1)).toBeFocused();
  });

  test("entries without icon and group stand as before", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-menuo label="Aktionen"><data value="edit">Bearbeiten</data><data value="copy">Kopieren</data></fm-menuo>',
    );
    const host = page.locator("fm-menuo");
    await host.locator('[part="trigger"]').first().click();
    await expect(host.locator('[role="group"], [part="group-heading"]')).toHaveCount(0);
    await expect(host.locator('[part="item"] [part="icon"]').first()).toBeHidden();
  });
});

test.describe("②b-3 A-navigado-1, A-navigado-4: section headings and icons", () => {
  test("a vertical navigation shows its section headings, heard as headings; an item shows its icon before its words", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-navigado orientation="vertical" label="Bereiche" page="tokens"><h2>Grundlagen</h2><a href="#tokens" data-page="tokens"><fm-ikono slot="icon-start" name="info"></fm-ikono>Tokens</a><a href="#regeln">Regeln</a><h2>Eroj</h2><a href="#knopf">Knopf</a></fm-navigado>',
    );
    // The headings stand in the light DOM, slotted into the landmark: heard as headings.
    await expect(page.getByRole("heading", { name: "Grundlagen" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Eroj" })).toBeVisible();
    const heading = page.locator("fm-navigado > h2").first();
    const link = page.locator("fm-navigado > a").first();
    const looks = await heading.evaluate((element) => {
      const style = getComputedStyle(element);
      return { margin: style.marginBlockStart, size: style.fontSize };
    });
    expect(looks.margin).toBe("0px");
    const linkSize = await link.evaluate((element) => getComputedStyle(element).fontSize);
    expect(Number.parseFloat(looks.size)).toBeLessThan(Number.parseFloat(linkSize));
    const icon = link.locator("fm-ikono");
    const iconBox = await icon.boundingBox();
    const linkBox = await link.boundingBox();
    expect(iconBox?.width).toBeGreaterThan(0);
    const gap = await link.evaluate((element) => getComputedStyle(element).columnGap);
    expect(Number.parseFloat(gap)).toBeGreaterThan(0);
    expect((iconBox?.x ?? 0) - (linkBox?.x ?? 0)).toBeLessThan((linkBox?.width ?? 0) / 2);
    await expect(link).toHaveAccessibleName("Tokens");
  });
});

test.describe("②b-3 A-teksto-1: max-lines", () => {
  const LONG =
    "Fundamento beschreibt jede Komponente einmal im Modelo und leitet daraus Web, Figma und Dokumentation ab, damit sie nie auseinanderlaufen und jede Marke ihre eigenen Werte trägt.";
  test("a long text stands on at most max-lines lines; it is heard in full", async ({ page }) => {
    await serve(
      page,
      out,
      `<div style="inline-size: 12rem"><fm-teksto id="kurz" max-lines="2">${LONG}</fm-teksto><fm-teksto id="lang">${LONG}</fm-teksto></div>`,
    );
    const lines = (selector: string) =>
      page.locator(selector).evaluate((host) => {
        const control = host.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        const height = control.getBoundingClientRect().height;
        const line = Number.parseFloat(getComputedStyle(control).lineHeight);
        return {
          lines: Math.round(height / line),
          clipped: control.scrollHeight > control.clientHeight + 1,
        };
      });
    const short = await lines("#kurz");
    const long = await lines("#lang");
    expect(short.lines).toBe(2);
    expect(short.clipped).toBe(true);
    expect(long.lines).toBeGreaterThan(2);
    // S36-4.4 (A-teksto-4): the whole text in the tree, read from the light DOM – the tooltip in
    // the shadow tree holds it too while the text is cut.
    expect(await page.locator("#kurz").evaluate((host) => host.textContent)).toBe(LONG);
  });
});

/** The left edges of two elements in the light or shadow tree, measured by the page. */
async function leftOf(page: Page, selector: string) {
  return (await page.locator(selector).boundingBox())?.x ?? Number.NaN;
}

test.describe("②b-3 A-insigno-4, A-ligilo-4, A-spuro-4: icon-start", () => {
  test("an insigno shows its icon before its words, in the pill, unheard", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-insigno id="mit" intent="success"><fm-ikono slot="icon-start" name="success"></fm-ikono>Gültig</fm-insigno><fm-insigno id="ohne" intent="success">Gültig</fm-insigno>',
    );
    const icon = page.locator("#mit > fm-ikono");
    const iconBox = await icon.boundingBox();
    const pill = await page.locator("#mit").locator('[part="control"]').boundingBox();
    const plain = await page.locator("#ohne").locator('[part="control"]').boundingBox();
    if (iconBox === null || pill === null || plain === null) throw new Error("no boxes");
    expect(iconBox.width).toBeGreaterThan(0);
    // Inside the pill, at its start; the pill grows by the icon and the gap.
    expect(iconBox.x).toBeGreaterThanOrEqual(pill.x);
    expect(iconBox.x - pill.x).toBeLessThan(pill.width / 2);
    expect(pill.width).toBeGreaterThan(plain.width + iconBox.width);
    await expect(page.locator("#mit")).toHaveText("Gültig");
  });

  test("a ligilo shows its icon before its words; its name stays the words", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-ligilo to="#hilfe"><fm-ikono slot="icon-start" name="info"></fm-ikono>Hilfe</fm-ligilo>',
    );
    const control = page.locator("fm-ligilo").locator('[part="control"]');
    await expect(control).toHaveAccessibleName("Hilfe");
    const slot = await control.evaluate((element) =>
      [...element.querySelectorAll("slot")].map((each) => each.getAttribute("name") ?? ""),
    );
    // The slot icon-start stands before the words, icon-end after them.
    expect(slot.indexOf("icon-start")).toBeLessThan(slot.indexOf(""));
    // The icon stands at the start of the link.
    const start = (await control.boundingBox())?.x ?? Number.NaN;
    expect(Math.abs((await leftOf(page, "fm-ligilo > fm-ikono")) - start)).toBeLessThanOrEqual(1);
  });

  test("a spuro shows the icon of its first item before the item's words, with a gap", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-spuro label="Pfad"><a href="#start"><fm-ikono slot="icon-start" name="info"></fm-ikono>Start</a><a href="#eroj">Eroj</a><span>Knopf</span></fm-spuro>',
    );
    const first = page.locator("fm-spuro > a").first();
    await expect(first).toHaveAccessibleName("Start");
    const icon = first.locator("fm-ikono");
    const iconBox = await icon.boundingBox();
    const firstBox = await first.boundingBox();
    expect(iconBox?.width).toBeGreaterThan(0);
    expect((iconBox?.x ?? 0) - (firstBox?.x ?? 0)).toBeLessThan((firstBox?.width ?? 0) / 2);
    const looks = await first.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        gap: style.columnGap,
        icon: getComputedStyle(element.firstElementChild as Element).inlineSize,
      };
    });
    expect(Number.parseFloat(looks.gap)).toBeGreaterThan(0);
    const separator = await page
      .locator("fm-spuro")
      .locator('[part="separator"]')
      .first()
      .evaluate((element) => getComputedStyle(element).inlineSize);
    expect(looks.icon).toBe(separator);
  });
});

test.describe("②b-3 A-butono-4: an insigno at the end", () => {
  test("an insigno in icon-end keeps its pill and is part of the name", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-butono>Nachrichten<fm-insigno id="end" slot="icon-end" size="small" intent="info">12</fm-insigno></fm-butono><fm-insigno id="alone" size="small" intent="info">12</fm-insigno>',
    );
    const control = page.locator("fm-butono").locator('button[part="control"]');
    await expect(control).toHaveAccessibleName("Nachrichten 12");
    const end = await page.locator("#end").boundingBox();
    const alone = await page.locator("#alone").boundingBox();
    if (end === null || alone === null) throw new Error("no boxes");
    // Not squeezed into the square of an icon: the pill as large as the same insigno alone.
    expect(end.width).toBeCloseTo(alone.width, 1);
    expect(end.height).toBeCloseTo(alone.height, 1);
    const label = await control.boundingBox();
    expect(end.x + end.width).toBeLessThanOrEqual((label?.x ?? 0) + (label?.width ?? 0));
  });
});

test.describe("②b-3 A-atributlisto-4: heading", () => {
  test("the heading stands above the list, heard as a heading, and names the list", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-atributlisto><span slot="heading">Vertrag</span><dl><dt>Nummer</dt><dd>42</dd><dt>Laufzeit</dt><dd>12 Monate</dd></dl></fm-atributlisto>',
    );
    await expect(page.getByRole("heading", { name: "Vertrag" })).toBeVisible();
    const heading = await boxOf(page, "fm-atributlisto", "heading");
    const list = await page.locator("fm-atributlisto > dl").boundingBox();
    expect(heading?.shown).toBe(true);
    expect(heading?.bottom ?? Number.POSITIVE_INFINITY).toBeLessThan(list?.y ?? 0);
    await expect(page.locator("fm-atributlisto > dl")).toHaveAccessibleName("Vertrag");
  });

  test("without a heading nothing stands above the list", async ({ page }) => {
    await serve(
      page,
      out,
      "<fm-atributlisto><dl><dt>Nummer</dt><dd>42</dd></dl></fm-atributlisto>",
    );
    expect((await boxOf(page, "fm-atributlisto", "heading"))?.shown ?? false).toBe(false);
    await expect(page.getByRole("heading")).toHaveCount(0);
  });
});

test.describe("②b-3 A-plenstato-4: heading, icon", () => {
  test("icon, heading and text stand in a column, the icon unheard", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-plenstato kind="empty"><fm-ikono slot="icon" name="search"></fm-ikono><span slot="heading">Keine Treffer</span>Ändere die Suche oder setze die Filter zurück.</fm-plenstato>',
    );
    const icon = await boxOf(page, "fm-plenstato", "icon");
    const heading = await boxOf(page, "fm-plenstato", "heading");
    const text = await boxOf(page, "fm-plenstato", "text");
    expect(icon?.shown).toBe(true);
    expect(heading?.shown).toBe(true);
    expect(icon?.bottom ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual((heading?.top ?? 0) + 1);
    expect(heading?.bottom ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual((text?.top ?? 0) + 1);
    // The title stands in the live region, so it is heard with the text.
    const status = page.locator("fm-plenstato").getByRole("status");
    await expect(status.locator('[part="heading"]')).toBeVisible();
    const ikono = page.locator('fm-plenstato > fm-ikono[slot="icon"]');
    const size = await ikono.evaluate((element) => getComputedStyle(element).inlineSize);
    const large = await page.evaluate(() =>
      getComputedStyle(document.querySelector("fm-plenstato") as Element).getPropertyValue(
        "--fm-ero-plenstato-icon-size",
      ),
    );
    expect(size).toBe(large.trim());
  });

  test("without heading and icon the state stands as before", async ({ page }) => {
    await serve(page, out, '<fm-plenstato kind="empty">Noch nichts da.</fm-plenstato>');
    expect((await boxOf(page, "fm-plenstato", "heading"))?.shown ?? false).toBe(false);
    expect((await boxOf(page, "fm-plenstato", "icon"))?.shown ?? false).toBe(false);
  });
});

test.describe("②b-3 A-tabelo-4: foot", () => {
  test("the foot row stands on the sunken ground in the label role", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-tabelo>Umsatz<table slot="content"><thead><tr><th>Monat</th><th>Betrag</th></tr></thead><tbody><tr><td>Mai</td><td>5</td></tr></tbody><tfoot><tr><th>Summe</th><td>5</td></tr></tfoot></table></fm-tabelo>',
    );
    const looks = (selector: string) =>
      page
        .locator(selector)
        .first()
        .evaluate((element) => {
          const style = getComputedStyle(element);
          return { ground: style.backgroundColor, weight: style.fontWeight };
        });
    const foot = await looks("fm-tabelo tfoot td");
    const body = await looks("fm-tabelo tbody td");
    const sunken = await page.evaluate(() =>
      getComputedStyle(document.querySelector("fm-tabelo") as Element)
        .getPropertyValue("--fm-ero-tabelo-foot-fill")
        .trim(),
    );
    expect(sunken).not.toBe("");
    expect(foot.ground).not.toBe(body.ground);
    expect(foot.weight).not.toBe(body.weight);
  });
});

test.describe("②b-3 A-sxvebilo-4: close", () => {
  test("a dismissible popover shows a close button; it closes and gives the focus back", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-sxvebilo label="Filter" dismissible><fm-butono slot="trigger">Filter</fm-butono><fm-teksto>Nur offene Aufgaben.</fm-teksto></fm-sxvebilo>',
    );
    await page.locator('fm-butono[slot="trigger"]').click();
    const close = page.locator("fm-sxvebilo").getByRole("button", { name: "Schließen" });
    await expect(close).toBeVisible();
    await close.click();
    await expect(page.locator("fm-sxvebilo").getByRole("dialog")).toBeHidden();
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.getAttribute("slot") ?? ""))
      .toBe("trigger");
  });

  test("without dismissible no close button stands", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-sxvebilo label="Filter"><fm-butono slot="trigger">Filter</fm-butono><fm-teksto>Nur offene Aufgaben.</fm-teksto></fm-sxvebilo>',
    );
    await page.locator('fm-butono[slot="trigger"]').click();
    await expect(page.locator("fm-sxvebilo").getByRole("dialog")).toBeVisible();
    await expect(
      page.locator("fm-sxvebilo").getByRole("button", { name: "Schließen" }),
    ).toHaveCount(0);
  });
});

test.describe("②b-3 A-avataro-4: the default icon", () => {
  test("without a name the avatar shows the ikono person, unheard; with one its initials", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-avataro id="ohne" decorative></fm-avataro><fm-avataro id="mit" name="Ada Lovelace"></fm-avataro>',
    );
    const icon = page.locator("#ohne").locator('[part="icon"]');
    await expect(icon).toBeVisible();
    await expect(icon).toHaveAttribute("name", "person");
    await expect(icon).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("#mit").locator('[part="icon"]')).toBeHidden();
    await expect(page.locator("#mit").locator('[part="initials"]')).toHaveText("AL");
  });
});

test.describe("②b-3 A-pagxigilo-4: first and last", () => {
  test("with first-last a button to the first page leads and one to the last ends the row", async ({
    page,
  }) => {
    await serve(page, out, '<fm-pagxigilo page="5" total-pages="10" first-last></fm-pagxigilo>');
    const host = page.locator("fm-pagxigilo");
    const first = host.getByRole("button", { name: "Erste Seite" });
    const last = host.getByRole("button", { name: "Letzte Seite" });
    await expect(first).toBeVisible();
    await expect(last).toBeVisible();
    await expect(first.locator('fm-ikono[name="first"]')).toHaveCount(1);
    const items = host.locator('[part="item"]');
    await expect(items.first()).toHaveAttribute("data-page", "1");
    await expect(items.last()).toHaveAttribute("data-page", "10");
    await last.click();
    await expect(host).toHaveAttribute("page", "10");
    await expect(host.getByRole("button", { name: "Letzte Seite" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  test("without first-last the row starts with prev as before", async ({ page }) => {
    await serve(page, out, '<fm-pagxigilo page="5" total-pages="10"></fm-pagxigilo>');
    const host = page.locator("fm-pagxigilo");
    await expect(host.getByRole("button", { name: "Erste Seite" })).toHaveCount(0);
    await expect(host.locator('[part="item"]').first()).toHaveAttribute("data-arrow", "prev");
  });
});

test.describe("②b-3 A-teksto-4: the tooltip on truncation", () => {
  const WHOLE =
    "Fundamento beschreibt jede Komponente einmal im Modelo und leitet daraus Web, Figma und Dokumentation ab, damit sie nie auseinanderlaufen und jede Marke ihre eigenen Werte trägt.";
  test("a cut text shows itself whole in a tooltip on hover and on focus; Escape hides it; heard once", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div style="inline-size: 12rem"><fm-teksto id="kurz" max-lines="2">${WHOLE}</fm-teksto><fm-teksto id="ganz" max-lines="40">${WHOLE}</fm-teksto></div>`,
    );
    const control = page.locator("#kurz").locator('p[part="control"]');
    const tip = page.locator("#kurz").locator("fm-konsileto");
    await control.hover();
    await expect(tip).toBeVisible();
    await expect(tip).toHaveText(WHOLE);
    await page.mouse.move(0, 0);
    await expect(tip).toBeHidden();
    await page.keyboard.press("Tab");
    await expect(tip).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(tip).toBeHidden();
    // The whole text is in the tree already: the tooltip describes nothing.
    await expect(control).toHaveAccessibleDescription("");
  });

  test("a text that is not cut has no tooltip and takes no focus", async ({ page }) => {
    await serve(
      page,
      out,
      `<div style="inline-size: 12rem"><fm-teksto id="ganz" max-lines="40">${WHOLE}</fm-teksto><fm-teksto id="frei">${WHOLE}</fm-teksto></div>`,
    );
    for (const id of ["#ganz", "#frei"]) {
      await expect(page.locator(id).locator("fm-konsileto")).toHaveCount(0);
      expect(
        await page.locator(id).locator('p[part="control"]').getAttribute("tabindex"),
      ).toBeNull();
    }
  });
});
