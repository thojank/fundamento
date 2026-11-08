// fm-tabelo in the browser (Spec 011 ④; G4, G7, E10, plan ④ D-09): the platform's own table in
// the light DOM, styled by a host-scoped stylesheet the document adopts; the caption written from
// the default slot (hidden from sight with caption-hidden, never missing); sortable headers as
// buttons with aria-sort on the sorted column only, sort-change on click; the scroll region
// focusable and named; the empty slot as a plenstato over all columns while there are no rows.
// Chromium, Firefox and WebKit.

import { expect, type Page, test } from "@playwright/test";
import { TAB } from "./alirebleco.js";
import { ASPEKTOJ_046, applyAssignment, declarationsOf, tokenPxIn } from "./aspektoj-046.js";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();

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

// Spec 046 T3 (plan D-18 to D-22): selection, loading and a sticky header. The native table stays
// the one form (A-1); without the new props the DOM and the geometry of a table stay as they were.
// The application owns the selection as it owns the sort: the table says select with the keys
// (data-key of the <tr>, in DOM order), the application writes data-selected on the rows.

const KEYED = `<table slot="content"><thead><tr><th scope="col" data-sort="name">Name</th><th scope="col">Status</th><th scope="col" numeric data-sort="count">Verstöße</th></tr></thead><tbody><tr data-key="a"><th scope="row">Barrierefreiheit</th><td>gültig</td><td>0</td></tr><tr data-key="b"><th scope="row">Datenschutz</th><td>Entwurf</td><td>3</td></tr></tbody><tfoot><tr><th scope="row">Summe</th><td></td><td>3</td></tr></tfoot></table>`;

// Measured on the build before T3 (486b6c03, viewport 1024 × 600, core + komuna + ekzemplo):
// width and height of host and table, x and width of the three columns, y and height of the head
// row, the two rows and the foot row. Numbers, no PNG (A-10).
const MEASURED: Record<
  string,
  Record<string, { host: number[]; table: number[]; cols: number[][]; rows: number[][] }>
> = {
  chromium: {
    compact: {
      host: [1008, 116],
      table: [252.55, 114],
      cols: [
        [9, 105.94],
        [114.94, 51.38],
        [166.31, 95.23],
      ],
      rows: [
        [29, 24.5],
        [53.5, 23],
        [76.5, 23],
        [99.5, 23],
      ],
    },
    default: {
      host: [1008, 116],
      table: [264.55, 114],
      cols: [
        [9, 109.94],
        [118.94, 55.38],
        [174.31, 99.23],
      ],
      rows: [
        [29, 24.5],
        [53.5, 23],
        [76.5, 23],
        [99.5, 23],
      ],
    },
    comfortable: {
      host: [1008, 116],
      table: [276.55, 114],
      cols: [
        [9, 113.94],
        [122.94, 59.38],
        [182.31, 103.23],
      ],
      rows: [
        [29, 24.5],
        [53.5, 23],
        [76.5, 23],
        [99.5, 23],
      ],
    },
  },
  firefox: {
    compact: {
      host: [1008, 116],
      table: [248.5, 114],
      cols: [
        [9, 105.9],
        [114.9, 51.37],
        [166.27, 91.23],
      ],
      rows: [
        [29, 24.5],
        [53.5, 23],
        [76.5, 23],
        [99.5, 23],
      ],
    },
    default: {
      host: [1008, 116],
      table: [260.5, 114],
      cols: [
        [9, 109.9],
        [118.9, 55.37],
        [174.27, 95.23],
      ],
      rows: [
        [29, 24.5],
        [53.5, 23],
        [76.5, 23],
        [99.5, 23],
      ],
    },
    comfortable: {
      host: [1008, 116],
      table: [272.5, 114],
      cols: [
        [9, 113.9],
        [122.9, 59.37],
        [182.27, 99.23],
      ],
      rows: [
        [29, 24.5],
        [53.5, 23],
        [76.5, 23],
        [99.5, 23],
      ],
    },
  },
  webkit: {
    compact: {
      host: [1008, 119],
      table: [252.55, 117],
      cols: [
        [9, 105.94],
        [114.94, 51.38],
        [166.31, 95.23],
      ],
      rows: [
        [29, 27.5],
        [56.5, 23],
        [79.5, 23],
        [102.5, 23],
      ],
    },
    default: {
      host: [1008, 119],
      table: [264.55, 117],
      cols: [
        [9, 109.94],
        [118.94, 55.38],
        [174.31, 99.23],
      ],
      rows: [
        [29, 27.5],
        [56.5, 23],
        [79.5, 23],
        [102.5, 23],
      ],
    },
    comfortable: {
      host: [1008, 119],
      table: [276.55, 117],
      cols: [
        [9, 113.94],
        [122.94, 59.38],
        [182.31, 103.23],
      ],
      rows: [
        [29, 27.5],
        [56.5, 23],
        [79.5, 23],
        [102.5, 23],
      ],
    },
  },
};

// The DOM the table wrote before T3 (density default, sort name), light and shadow.
const MEASURED_DOM =
  '<fm-tabelo id="t" density="default" sort="name" data-density="default" data-direction="ascending" data-lines="rows">Standards<table slot="content"><caption data-fm-caption="">Standards</caption><thead><tr><th scope="col" data-sort="name" aria-sort="ascending"><button type="button">Name<fm-ikono name="sort-ascending" size="small"></fm-ikono></button></th><th scope="col">Status</th><th scope="col" numeric="" data-sort="count"><button type="button">Verstöße<fm-ikono name="sort-ascending" size="small"></fm-ikono></button></th></tr></thead><tbody><tr data-key="a"><th scope="row">Barrierefreiheit</th><td>gültig</td><td numeric="">0</td></tr><tr data-key="b"><th scope="row">Datenschutz</th><td>Entwurf</td><td numeric="">3</td></tr></tbody><tfoot><tr><th scope="row">Summe</th><td></td><td>3</td></tr></tfoot></table></fm-tabelo>';
const MEASURED_SHADOW =
  '<div part="region" role="region" tabindex="0" data-density="default" data-direction="ascending" data-lines="rows" aria-label="Standards"><slot name="content"></slot></div><slot hidden=""></slot><slot name="empty" hidden=""></slot><span id="fm-texts" hidden=""></span>';

/** Geometry and DOM of #t once fonts are loaded and two frames have passed. */
async function measure(page: Page) {
  await page.getByRole("table", { name: "Standards" }).waitFor();
  return page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const host = document.getElementById("t") as HTMLElement;
    const r2 = (n: number) => Math.round(n * 100) / 100;
    const rect = (element: Element) => {
      const box = element.getBoundingClientRect();
      return [r2(box.x), r2(box.y), r2(box.width), r2(box.height)];
    };
    const cells = [...host.querySelectorAll("table :is(th, td)")].map(rect);
    const at = (index: number) => cells[index] ?? [];
    return {
      geometry: {
        host: rect(host).slice(2),
        table: rect(host.querySelector("table") as Element).slice(2),
        cols: [0, 1, 2].map((index) => [at(index)[0], at(index)[2]]),
        rows: [0, 3, 6, 9].map((index) => [at(index)[1], at(index)[3]]),
      },
      dom: host.outerHTML,
      shadow: host.shadowRoot?.innerHTML,
    };
  });
}

/** Records every select the table says on window.heard; with apply, writes data-selected as an application does. */
async function listen(page: Page, apply: boolean) {
  await page.evaluate((write) => {
    const w = window as unknown as { heard: string[][] };
    w.heard = [];
    const table = document.getElementById("t") as HTMLElement;
    table.addEventListener("select", (event) => {
      const keys = (event as CustomEvent<{ keys: string[] }>).detail.keys;
      w.heard.push(keys);
      if (!write) return;
      for (const row of table.querySelectorAll("tbody > tr[data-key]")) {
        row.toggleAttribute("data-selected", keys.includes(row.getAttribute("data-key") ?? ""));
      }
    });
  }, apply);
}

const heard = (page: Page) =>
  page.evaluate(() => (window as unknown as { heard: string[][] }).heard);

/** Whether the fm-markobutono of a row (by data-key) or of the head (all) is checked. */
const checked = (page: Page, key: string) =>
  page
    .locator(
      key === "all"
        ? "#t > table > thead fm-markobutono"
        : `#t > table > tbody > tr[data-key="${key}"] fm-markobutono`,
    )
    .evaluate((element) => element.hasAttribute("checked"));

test.describe("fm-tabelo Spec 046 T3", () => {
  test.use({ viewport: { width: 1024, height: 600 } });

  test("without the new props DOM and geometry are as measured before T3, in every density", async ({
    page,
    browserName,
  }) => {
    for (const density of ["compact", "default", "comfortable"]) {
      await serve(
        page,
        out,
        `<fm-tabelo id="t" density="${density}" sort="name">Standards${KEYED}</fm-tabelo>`,
      );
      const measured = await measure(page);
      expect(measured.geometry, density).toEqual(MEASURED[browserName]?.[density]);
      if (density === "default") {
        expect(measured.dom).toBe(MEASURED_DOM);
        expect(measured.shadow).toBe(MEASURED_SHADOW);
      }
    }
  });

  test("selectable: a named fm-markobutono per keyed row and one in the head, reached with Tab; Space says select with the keys in DOM order", async ({
    page,
    browserName,
  }) => {
    await serve(
      page,
      out,
      table(
        "selectable",
        `<table slot="content"><thead><tr><th scope="col">Name</th><th scope="col" numeric>Verstöße</th></tr></thead><tbody><tr data-key="a"><th scope="row">Barrierefreiheit</th><td>0</td></tr><tr data-key="b"><th scope="row">Datenschutz</th><td>3</td></tr><tr data-key="c" data-selected><th scope="row">Sicherheit</th><td>1</td></tr></tbody></table>`,
      ),
    );
    await listen(page, true);
    await expect(page.locator("#t > table > tbody fm-markobutono")).toHaveCount(3);
    await expect(page.locator("#t > table > thead fm-markobutono")).toHaveCount(1);
    // The column of boxes comes first; every row keeps as many cells as the head.
    for (const row of await page.locator("#t > table tr").all()) {
      expect(await row.evaluate((element) => element.children.length)).toBe(3);
    }
    // The numeric mark stays on the cells of the numeric column.
    expect(await page.locator("#t > table > tbody td[numeric]").allTextContents()).toEqual([
      "0",
      "3",
      "1",
    ]);
    await expect(page.getByRole("checkbox", { name: "Alle Zeilen auswählen" })).toHaveCount(1);
    const first = page.getByRole("checkbox", { name: /Barrierefreiheit/ });
    await expect(first).toHaveCount(1);
    expect(await checked(page, "c")).toBe(true);
    expect(await checked(page, "a")).toBe(false);
    let reached = false;
    for (let step = 0; step < 12 && !reached; step += 1) {
      await page.keyboard.press(TAB(browserName));
      reached = await first.evaluate((element) => element.matches(":focus"));
    }
    expect(reached).toBe(true);
    await page.keyboard.press("Space");
    await expect.poll(() => heard(page)).toEqual([["a", "c"]]);
    expect(await checked(page, "a")).toBe(true);
    await expect(page.locator('#t tr[data-key="a"]')).toHaveAttribute("data-selected", "");
  });

  test("the box in the head selects every keyed row, a second time none", async ({ page }) => {
    await serve(page, out, table("selectable", KEYED));
    await listen(page, true);
    const all = page.getByRole("checkbox", { name: "Alle Zeilen auswählen" });
    await all.click();
    await expect.poll(() => heard(page)).toEqual([["a", "b"]]);
    expect(await checked(page, "a")).toBe(true);
    expect(await checked(page, "b")).toBe(true);
    expect(await checked(page, "all")).toBe(true);
    await all.click();
    await expect.poll(() => heard(page)).toEqual([["a", "b"], []]);
    expect(await checked(page, "a")).toBe(false);
    expect(await checked(page, "all")).toBe(false);
  });

  test("the application owns the selection: unanswered, a box stays as the row says; sorting and loading never change it", async ({
    page,
  }) => {
    await serve(page, out, table('selectable sort="name"', KEYED));
    await listen(page, false);
    await page
      .locator('#t tr[data-key="b"]')
      .evaluate((row) => row.setAttribute("data-selected", ""));
    await expect.poll(() => checked(page, "b")).toBe(true);
    await page.getByRole("checkbox", { name: /Barrierefreiheit/ }).click();
    await expect.poll(() => heard(page)).toEqual([["a", "b"]]);
    // The application did not write data-selected: the box follows the row, not the click.
    expect(await checked(page, "a")).toBe(false);
    await page.locator("#t").evaluate((element) => {
      element.setAttribute("direction", "descending");
      element.setAttribute("loading", "");
    });
    await page.locator("#t").evaluate((element) => element.removeAttribute("loading"));
    // The application sorts: it moves the rows; the selection moves with them.
    await page.locator("#t > table > tbody").evaluate((body) => {
      body.prepend(body.lastElementChild as Element);
    });
    expect(
      await page
        .locator("#t > table > tbody > tr")
        .evaluateAll((rows) =>
          rows.map((row) => [row.getAttribute("data-key"), row.hasAttribute("data-selected")]),
        ),
    ).toEqual([
      ["b", true],
      ["a", false],
    ]);
    await expect.poll(() => checked(page, "b")).toBe(true);
    expect(await checked(page, "a")).toBe(false);
    expect(await heard(page)).toEqual([["a", "b"]]);
  });

  test("a row without data-key has no box and the console says so", async ({ page }) => {
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning") warnings.push(message.text());
    });
    await serve(
      page,
      out,
      table(
        "selectable",
        `<table slot="content"><thead><tr><th scope="col">Name</th><th scope="col">Status</th></tr></thead><tbody><tr data-key="a"><th scope="row">Barrierefreiheit</th><td>gültig</td></tr><tr><th scope="row">Datenschutz</th><td>Entwurf</td></tr></tbody></table>`,
      ),
    );
    await expect(page.locator("#t > table > tbody fm-markobutono")).toHaveCount(1);
    await expect(
      page.locator("#t > table > tbody > tr:not([data-key]) fm-markobutono"),
    ).toHaveCount(0);
    expect(
      await page
        .locator("#t > table > tbody > tr:not([data-key])")
        .evaluate((row) => row.children.length),
    ).toBe(3);
    await expect.poll(() => warnings.some((text) => /fm-tabelo.*data-key/.test(text))).toBe(true);
  });

  test("loading: aria-busy on the table and skeleton rows in the body; they come before the empty state, which shows once loaded", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      table(
        "loading",
        `<table slot="content"><thead><tr><th scope="col">Name</th><th scope="col">Status</th><th scope="col">Verstöße</th></tr></thead><tbody></tbody></table>`,
        '<span slot="empty">Noch keine Standards. Lege den ersten an.</span>',
      ),
    );
    await expect(page.locator("#t > table")).toHaveAttribute("aria-busy", "true");
    const skeleton = page.locator("#t > table > tbody > tr[data-fm-skeleton]");
    await expect(skeleton).toHaveCount(3);
    for (const row of await skeleton.all()) {
      await expect(row).toHaveAttribute("aria-hidden", "true");
      expect(await row.evaluate((element) => element.children.length)).toBe(3);
      expect(
        await row.evaluate((element) => element.getBoundingClientRect().height),
      ).toBeGreaterThan(0);
    }
    await expect(page.locator("#t fm-plenstato")).toHaveCount(0);
    await page.locator("#t").evaluate((element) => element.removeAttribute("loading"));
    await expect(skeleton).toHaveCount(0);
    await expect(page.locator("#t > table")).not.toHaveAttribute("aria-busy");
    await expect(page.locator("#t fm-plenstato")).toHaveCount(1);
  });

  test("loading over rows: the rows step aside for the skeleton and come back", async ({
    page,
  }) => {
    await serve(page, out, table("loading", KEYED));
    await expect(page.locator("#t > table > tbody > tr[data-fm-skeleton]")).toHaveCount(3);
    await expect(page.getByRole("rowheader", { name: "Datenschutz" })).toBeHidden();
    await page.locator("#t").evaluate((element) => element.removeAttribute("loading"));
    await expect(page.getByRole("rowheader", { name: "Datenschutz" })).toBeVisible();
  });

  test("sticky-header: the head stays at the top of a bounded region while the rows scroll; without a bound nothing changes", async ({
    page,
  }) => {
    const rows = Array.from(
      { length: 30 },
      (_, index) =>
        `<tr data-key="k${index}"><th scope="row">Standard ${index}</th><td>${index}</td></tr>`,
    ).join("");
    const body = `<table slot="content"><thead><tr><th scope="col">Name</th><th scope="col" numeric>Verstöße</th></tr></thead><tbody>${rows}</tbody></table>`;
    await serve(
      page,
      out,
      `<fm-tabelo id="t" sticky-header style="max-block-size: 12rem">Standards${body}</fm-tabelo><fm-tabelo id="u" sticky-header>Lose${body}</fm-tabelo>`,
    );
    await expect(page.getByRole("table", { name: "Standards" })).toBeVisible();
    const bounded = await page.locator("#t").evaluate(async (element) => {
      const region = element.shadowRoot?.querySelector('[part="region"]') as HTMLElement;
      const head = element.querySelector("thead th") as HTMLElement;
      region.scrollTop = 200;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return {
        position: getComputedStyle(head).position,
        scrolled: region.scrollTop,
        head: head.getBoundingClientRect().top,
        region: region.getBoundingClientRect().top,
        hostBottom: element.getBoundingClientRect().bottom,
        regionBottom: region.getBoundingClientRect().bottom,
      };
    });
    expect(bounded.position).toBe("sticky");
    expect(bounded.scrolled).toBeGreaterThan(0);
    expect(Math.abs(bounded.head - bounded.region)).toBeLessThanOrEqual(1);
    expect(bounded.regionBottom).toBeLessThanOrEqual(bounded.hostBottom + 1);
    // Without a bound the region does not scroll along the block axis: the page does, the head goes with it.
    const loose = await page.locator("#u").evaluate(async (element) => {
      const region = element.shadowRoot?.querySelector('[part="region"]') as HTMLElement;
      element.scrollIntoView();
      window.scrollBy(0, 200);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return {
        scrolls: region.scrollHeight > region.clientHeight,
        head: (element.querySelector("thead th") as HTMLElement).getBoundingClientRect().top,
        table: (element.querySelector("table") as HTMLElement).getBoundingClientRect().top,
      };
    });
    expect(loose.scrolls).toBe(false);
    expect(loose.head).toBeLessThan(0);
    expect(loose.table).toBeLessThan(0);
  });

  test("column spacing comes from spacing.* and is more than 0 in every density; a numeric column aligns to the end with tabular numerals", async ({
    page,
  }) => {
    const tokens: Record<string, string> = {
      compact: "--fm-spacing-small",
      default: "--fm-spacing-scale-150",
      comfortable: "--fm-spacing-medium",
    };
    for (const [density, token] of Object.entries(tokens)) {
      await serve(page, out, table(`density="${density}" selectable`, KEYED));
      await expect(page.locator("#t > table > tbody fm-markobutono")).toHaveCount(2);
      const cells = await page.locator("#t > table :is(th, td)").evaluateAll(
        (elements, name) =>
          elements.map((element) => {
            const style = getComputedStyle(element);
            return {
              start: Number.parseFloat(style.paddingInlineStart),
              end: Number.parseFloat(style.paddingInlineEnd),
              token:
                Number.parseFloat(
                  getComputedStyle(document.documentElement).getPropertyValue(name),
                ) *
                (getComputedStyle(document.documentElement)
                  .getPropertyValue(name)
                  .trim()
                  .endsWith("rem")
                  ? Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
                  : 1),
            };
          }),
        token,
      );
      for (const cell of cells) {
        expect(cell.start, density).toBeGreaterThan(0);
        expect(cell.end, density).toBeGreaterThan(0);
        expect(cell.start, density).toBeCloseTo(cell.token, 1);
      }
      const numeric = await page
        .locator("#t > table > tbody td[numeric]")
        .first()
        .evaluate((element) => ({
          align: getComputedStyle(element).textAlign,
          numerals: getComputedStyle(element).fontVariantNumeric,
          text: element.textContent,
        }));
      expect(numeric).toEqual({ align: "end", numerals: "tabular-nums", text: "0" });
    }
  });
});

// Spec 046 T3 Nachbesserung (F-T5-1, WCAG 2.5.8): every box of the selection is a target of at least
// size.target.min – the value the token resolves to in komuna light and dark and in ekzemplo – in
// every density: its box is that wide and high, and the boxes of two rows lie at least that far
// apart, centre to centre (the spacing axe's target-size measures).
test.describe("Spec 046 T3 Nachbesserung: the boxes of the selection are targets of size.target.min", () => {
  test.use({ viewport: { width: 1024, height: 600 } });
  const ROWS = `<table slot="content"><thead><tr><th scope="col">Name</th><th scope="col">Status</th></tr></thead><tbody><tr data-key="a"><th scope="row">Barrierefreiheit</th><td>gültig</td></tr><tr data-key="b" data-selected><th scope="row">Datenschutz</th><td>Entwurf</td></tr><tr data-key="c"><th scope="row">Sicherheit</th><td>gültig</td></tr></tbody></table>`;
  for (const [aspekto, scheme] of ASPEKTOJ_046) {
    test(`${aspekto} ${scheme}: each box at least size.target.min wide and high, the boxes that far apart, in every density`, async ({
      page,
    }) => {
      const { assignment, declarations } = declarationsOf(input, aspekto, scheme);
      for (const density of ["compact", "default", "comfortable"]) {
        await serve(page, out, table(`selectable density="${density}"`, ROWS));
        await applyAssignment(page, assignment);
        const target = await tokenPxIn(page, declarations, "size.target.min");
        expect(target).toBeGreaterThan(0);
        await expect(page.locator("#t fm-markobutono")).toHaveCount(4);
        const boxes = await page.locator("#t fm-markobutono").evaluateAll(async (elements) => {
          await document.fonts.ready;
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
          return elements.map((element) => {
            const box = element.getBoundingClientRect();
            // The checkbox axe measures: the control in the box's shadow.
            const control = element.shadowRoot
              ?.querySelector('[part="control"]')
              ?.getBoundingClientRect();
            return {
              width: box.width,
              height: box.height,
              centre: control === undefined ? Number.NaN : control.y + control.height / 2,
            };
          });
        });
        for (const [index, box] of boxes.entries()) {
          const where = `${density} box ${index}`;
          expect(box.width, `${where} width`).toBeGreaterThanOrEqual(target);
          expect(box.height, `${where} height`).toBeGreaterThanOrEqual(target);
          const next = boxes[index + 1];
          if (next !== undefined) {
            expect(next.centre - box.centre, `${where} to the next`).toBeGreaterThanOrEqual(target);
          }
        }
      }
    });
  }
});
