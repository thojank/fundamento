// fm-tabelo in the browser (Spec 011 ④; G4, G7, E10, plan ④ D-09): the platform's own table in
// the light DOM, styled by a host-scoped stylesheet the document adopts; the caption written from
// the default slot (hidden from sight with caption-hidden, never missing); sortable headers as
// buttons with aria-sort on the sorted column only, sort-change on click; the scroll region
// focusable and named; the empty slot as a plenstato over all columns while there are no rows.
// Chromium, Firefox and WebKit.

import { expect, test } from "@playwright/test";
import { TAB } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const TABLE = `<table slot="content"><thead><tr><th scope="col" data-sort="name">Name</th><th scope="col">Status</th><th scope="col" numeric data-sort="count">Verstöße</th></tr></thead><tbody><tr><th scope="row">Barrierefreiheit</th><td>gültig</td><td>0</td></tr><tr><th scope="row">Datenschutz</th><td>Entwurf</td><td>3</td></tr></tbody></table>`;
const table = (attributes: string, body = TABLE, slots = "") =>
  `<fm-tabelo id="t" ${attributes}>Standards${slots}${body}</fm-tabelo>`;

test.describe("fm-tabelo behaviour", () => {
  test("the table is named by its caption from the default slot; caption-hidden clips it, never removes it", async ({
    page,
  }) => {
    await serve(page, out, table(""));
    const grid = page.getByRole("table", { name: "Standards" });
    await expect(grid).toBeVisible();
    expect(await page.locator("#t > table > caption").count()).toBe(1);
    await expect(page.locator("#t > table > caption")).toHaveText("Standards");
    await expect(page.getByRole("columnheader", { name: /Name/ })).toBeVisible();
    await expect(page.getByRole("rowheader", { name: "Datenschutz" })).toBeVisible();
    await page.locator("#t").evaluate((element) => element.setAttribute("caption-hidden", ""));
    await expect(page.getByRole("table", { name: "Standards" })).toBeVisible();
    const caption = await page.locator("#t > table > caption").evaluate((element) => ({
      clip: getComputedStyle(element).clipPath,
      area: element.getBoundingClientRect().width * element.getBoundingClientRect().height,
    }));
    expect(caption.clip).toBe("inset(50%)");
  });

  test("sortable headers are buttons; aria-sort stands on the sorted column only; a click says sort-change and toggles the direction", async ({
    page,
  }) => {
    await serve(page, out, table('sort="name"'));
    await page.evaluate(() => {
      (window as unknown as { heard: unknown[] }).heard = [];
      document.getElementById("t")?.addEventListener("sort-change", (event) => {
        (window as unknown as { heard: unknown[] }).heard.push((event as CustomEvent).detail);
      });
    });
    const name = page.locator('#t th[data-sort="name"]');
    const count = page.locator('#t th[data-sort="count"]');
    await expect(name).toHaveAttribute("aria-sort", "ascending");
    await expect(count).not.toHaveAttribute("aria-sort");
    await expect(page.locator('#t th[data-sort="count"] > button')).toHaveCount(1);
    await expect(page.locator("#t th:not([data-sort]) > button")).toHaveCount(0);
    await page.getByRole("button", { name: "Name" }).click();
    await page.getByRole("button", { name: "Verstöße" }).click();
    expect(await page.evaluate(() => (window as unknown as { heard: unknown[] }).heard)).toEqual([
      { column: "name", direction: "descending" },
      { column: "count", direction: "ascending" },
    ]);
    // Display only: the application sets sort and direction; the table does not reorder rows.
    await expect(name).toHaveAttribute("aria-sort", "ascending");
    await page.locator("#t").evaluate((element) => {
      element.setAttribute("sort", "count");
      element.setAttribute("direction", "descending");
    });
    await expect(count).toHaveAttribute("aria-sort", "descending");
    await expect(name).not.toHaveAttribute("aria-sort");
  });

  test("the region scrolls a wide table, is reached with Tab and named; the head and the cells carry the tokens", async ({
    page,
    browserName,
  }) => {
    await serve(
      page,
      out,
      `<div style="inline-size: 16rem">${table(
        "",
        `<table slot="content"><thead><tr>${'<th scope="col">Eine sehr lange Spaltenüberschrift</th>'.repeat(4)}</tr></thead><tbody><tr>${"<td>Zelle</td>".repeat(4)}</tr></tbody></table>`,
      )}</div>`,
    );
    // The caption is written once the children are parsed: wait for the named table first.
    await expect(page.getByRole("table", { name: "Standards" })).toBeVisible();
    await page.keyboard.press(TAB(browserName));
    const region = await page.locator("#t").evaluate((element) => {
      const node = element.shadowRoot?.querySelector('[part="region"]') as HTMLElement;
      return {
        focused: element.shadowRoot?.activeElement === node,
        role: node.getAttribute("role"),
        label: node.getAttribute("aria-label"),
        scrolls: node.scrollWidth > node.clientWidth,
        overflow: getComputedStyle(node).overflowX,
        outline: Number.parseFloat(getComputedStyle(node).outlineWidth),
      };
    });
    expect(region.focused).toBe(true);
    expect(region.role).toBe("region");
    expect(region.label).toBe("Standards");
    expect(region.scrolls).toBe(true);
    expect(region.overflow).toBe("auto");
    expect(region.outline).toBeGreaterThan(0);
    const head = await page
      .locator("#t > table > thead th")
      .first()
      .evaluate((element) => {
        const style = getComputedStyle(element);
        const root = getComputedStyle(document.documentElement);
        return {
          fill: style.backgroundColor,
          sunken: root.getPropertyValue("--fm-color-background-sunken").trim(),
          padding: style.paddingInlineStart,
          medium: root.getPropertyValue("--fm-spacing-medium").trim(),
        };
      });
    expect(head.padding).toBe(head.medium);
    expect(head.fill).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("density compact tightens the cells; a numeric column aligns to the end", async ({
    page,
  }) => {
    await serve(page, out, table('density="compact"'));
    const cell = await page
      .locator("#t > table > tbody td")
      .last()
      .evaluate((element) => {
        const style = getComputedStyle(element);
        const root = getComputedStyle(document.documentElement);
        return {
          padding: style.paddingInlineStart,
          small: root.getPropertyValue("--fm-spacing-small").trim(),
          align: style.textAlign,
          numerals: style.fontVariantNumeric,
        };
      });
    expect(cell.padding).toBe(cell.small);
    expect(cell.align).toBe("end");
    expect(cell.numerals).toBe("tabular-nums");
  });

  test("without rows the empty slot shows as a plenstato over all columns; rows take it away", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      table(
        "",
        `<table slot="content"><thead><tr><th scope="col">Name</th><th scope="col">Status</th><th scope="col">Verstöße</th></tr></thead><tbody></tbody></table>`,
        '<span slot="empty">Noch keine Standards. Lege den ersten an.</span>',
      ),
    );
    const state = page.locator("#t fm-plenstato");
    await expect(state).toHaveCount(1);
    await expect(state).toHaveAttribute("kind", "empty");
    await expect(state).toHaveText(/Noch keine Standards/);
    await expect(page.locator("#t > table > tbody > tr > td[colspan='3']")).toHaveCount(1);
    await page.locator("#t > table > tbody").evaluate((tbody) => {
      tbody.insertAdjacentHTML(
        "beforeend",
        "<tr><th scope='row'>Neu</th><td>Entwurf</td><td>0</td></tr>",
      );
    });
    await expect(page.locator("#t fm-plenstato")).toHaveCount(0);
  });
});

// Spec 014 ② (G3, G6): the sort arrow is an fm-ikono — sort-ascending or sort-descending by the
// direction, no rotation of one sign.
test("the sort button holds an fm-ikono whose name follows the direction", async ({ page }) => {
  await serve(page, out, table('sort="name"'));
  const ikono = page.locator('#t th[data-sort="name"] > button fm-ikono');
  await expect(ikono).toHaveCount(1);
  await expect(ikono).toHaveAttribute("name", "sort-ascending");
  await expect(ikono).toHaveAttribute("size", "small");
  await page.locator("#t").evaluate((element) => element.setAttribute("direction", "descending"));
  await expect(ikono).toHaveAttribute("name", "sort-descending");
  expect(await page.locator("#t th > button svg").count()).toBe(0);
});
