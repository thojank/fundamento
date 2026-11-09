// fm-krado in the browser (Spec 046 T2, section A): a grid of any children with the gap of its
// spacing step between them. A fixed number of columns (columns="3") stacks into one column below
// the container width the Uzo names (columns-from, size.container.small) – measured against the
// token's custom property, no breakpoint of its own; auto lays as many columns as fit, each at
// least its min-width step (the Skemo default where none is given). A child spans data-span
// columns, at most as many as the grid has. Chromium (Spec 046 T2); the Vitrino follows in T5.

import { expect, type Page, test } from "@playwright/test";
import { ASPEKTOJ_046, applyAssignment, declarationsOf, tokenPxIn } from "./aspektoj-046.js";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();

/** A grid inside a container of `width`, its children given as [word, data-span?]. */
const grid = (attributes: string, width: string, children: [string, number?][]) =>
  `<div id="frame" style="inline-size: ${width}"><fm-krado id="g" ${attributes}>${children
    .map(([word, span]) => `<div${span === undefined ? "" : ` data-span="${span}"`}>${word}</div>`)
    .join("")}</fm-krado></div>`;

/** The boxes of the light-DOM children and of the control, rounded. */
const boxesOf = (page: Page) =>
  page.locator("#g").evaluate((element) => {
    const round = (box: DOMRect) => ({
      left: Math.round(box.left),
      top: Math.round(box.top),
      width: Math.round(box.width),
    });
    const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
    return {
      control: round(control.getBoundingClientRect()),
      children: [...element.children].map((child) => round(child.getBoundingClientRect())),
    };
  });

/** A custom property of the document in pixels (a token of the loaded Aspekto). */
const tokenPx = (page: Page, name: string) =>
  page.evaluate((property) => {
    const probe = document.createElement("div");
    probe.style.inlineSize = `var(${property})`;
    document.body.append(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return Math.round(width);
  }, name);

const THREE: [string, number?][] = [["Eins"], ["Zwei"], ["Drei"]];

test.describe("fm-krado behaviour", () => {
  test("lays three columns side by side with the gap of its step where the container is wide", async ({
    page,
  }) => {
    await serve(page, out, grid('columns="3"', "100%", THREE));
    const small = await tokenPx(page, "--fm-size-container-small");
    expect(small).toBeGreaterThan(0);
    await page.locator("#frame").evaluate((frame, px) => {
      (frame as HTMLElement).style.inlineSize = `${px * 1.5}px`;
    }, small);
    const medium = await tokenPx(page, "--fm-spacing-medium");
    await expect
      .poll(async () => new Set((await boxesOf(page)).children.map((c) => c.top)).size)
      .toBe(1);
    const { children } = await boxesOf(page);
    expect(new Set(children.map((child) => child.width)).size).toBe(1);
    const [first, second] = children;
    expect((second?.left ?? 0) - ((first?.left ?? 0) + (first?.width ?? 0))).toBe(medium);
  });

  test("stacks into one column below the container width of its Uzo (columns-from), from the token", async ({
    page,
  }) => {
    await serve(page, out, grid('columns="3"', "100%", THREE));
    const small = await tokenPx(page, "--fm-size-container-small");
    await page.locator("#frame").evaluate((frame, px) => {
      (frame as HTMLElement).style.inlineSize = `${px - 1}px`;
    }, small);
    await expect
      .poll(async () => new Set((await boxesOf(page)).children.map((c) => c.left)).size)
      .toBe(1);
    const narrow = await boxesOf(page);
    expect(narrow.children.map((child) => child.width)).toEqual([
      narrow.control.width,
      narrow.control.width,
      narrow.control.width,
    ]);
    const tops = narrow.children.map((child) => child.top);
    expect(tops).toEqual([...tops].sort((a, b) => a - b));
    expect(new Set(tops).size).toBe(3);
    // Just as wide as the token: the columns stand again.
    await page.locator("#frame").evaluate((frame, px) => {
      (frame as HTMLElement).style.inlineSize = `${px}px`;
    }, small);
    await expect
      .poll(async () => new Set((await boxesOf(page)).children.map((c) => c.top)).size)
      .toBe(1);
  });

  test("a data-span wider than the columns takes the whole row, no more; a narrower one its columns", async ({
    page,
  }) => {
    const children: [string, number?][] = [["Breit", 5], ["Zwei", 2], ["Eins"]];
    await serve(page, out, grid('columns="3"', "100%", children));
    const small = await tokenPx(page, "--fm-size-container-small");
    await page.locator("#frame").evaluate((frame, px) => {
      (frame as HTMLElement).style.inlineSize = `${px * 1.5}px`;
    }, small);
    const gap = await tokenPx(page, "--fm-spacing-medium");
    await expect
      .poll(async () => {
        const { control, children: boxes } = await boxesOf(page);
        return boxes[0]?.width === control.width;
      })
      .toBe(true);
    const { control, children: boxes } = await boxesOf(page);
    // No implicit column: nothing runs out of the control.
    for (const box of boxes)
      expect(box.left + box.width).toBeLessThanOrEqual(control.left + control.width);
    const column = (control.width - 2 * gap) / 3;
    expect(Math.abs((boxes[1]?.width ?? 0) - (2 * column + gap))).toBeLessThanOrEqual(1);
    expect(boxes[1]?.top).toBe(boxes[2]?.top);
  });

  test("columns auto without min-width lays as many columns as its default step lets fit", async ({
    page,
  }) => {
    const children: [string, number?][] = [["Eins"], ["Zwei"], ["Drei"], ["Breit", 4]];
    await serve(page, out, grid('columns="auto"', "100%", children));
    const small = await tokenPx(page, "--fm-size-container-small");
    const gap = await tokenPx(page, "--fm-spacing-medium");
    // Room for two columns of the default step (small), not for three.
    await page.locator("#frame").evaluate((frame, px) => {
      (frame as HTMLElement).style.inlineSize = `${px * 2.5}px`;
    }, small + gap);
    await expect
      .poll(async () => {
        const { children: boxes } = await boxesOf(page);
        return boxes[0]?.top === boxes[1]?.top && (boxes[2]?.top ?? 0) > (boxes[1]?.top ?? 0);
      })
      .toBe(true);
    const { control, children: boxes } = await boxesOf(page);
    expect(boxes[0]?.width).toBeGreaterThanOrEqual(small);
    // The span of four in a grid of two takes the whole row and makes no column of its own.
    expect(boxes[3]?.width).toBe(control.width);
    for (const box of boxes)
      expect(box.left + box.width).toBeLessThanOrEqual(control.left + control.width);
    // Narrower than one step: one column, nothing runs out.
    await page.locator("#frame").evaluate((frame, px) => {
      (frame as HTMLElement).style.inlineSize = `${Math.round(px / 2)}px`;
    }, small);
    await expect
      .poll(async () => {
        const { control: box, children: all } = await boxesOf(page);
        return all.every((child) => child.width === box.width);
      })
      .toBe(true);
  });

  test("draws nothing of its own: no role, no background, no border, the font of its container", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div style="font-size: 23px">${grid('columns="2"', "100%", THREE)}</div>`,
    );
    const own = await page.locator("#g").evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      const style = getComputedStyle(control);
      return {
        role: control.getAttribute("role"),
        display: style.display,
        background: style.backgroundColor,
        border: style.borderBlockStartWidth,
        font: style.fontSize,
      };
    });
    expect(own).toEqual({
      role: null,
      display: "grid",
      background: "rgba(0, 0, 0, 0)",
      border: "0px",
      font: "23px",
    });
  });
});

// Spec 046 T5 (A-10: geometry and style, no picture): in komuna light and dark and in ekzemplo, three
// columns lie with the gap of the step between them and between their rows – the value the spacing
// token resolves to in that Aspekto; a child of data-span="2" covers two columns and the gap; below
// the container width of the Uzo, resolved in that Aspekto, the grid stacks into one column.
test.describe("Spec 046 T5: the grid of fm-krado per Aspekto", () => {
  for (const [aspekto, scheme] of ASPEKTOJ_046) {
    test(`${aspekto} ${scheme}: columns, rows and span with the gap of its step; stacked below columns-from`, async ({
      page,
    }) => {
      const { assignment, declarations } = declarationsOf(input, aspekto, scheme);
      const children: [string, number?][] = [["Eins"], ["Zwei"], ["Drei"], ["Vier", 2], ["Fünf"]];
      await serve(page, out, grid('columns="3" gap="large"', "100%", children));
      await applyAssignment(page, assignment);
      const small = await tokenPxIn(page, declarations, "size.container.small");
      const gap = await tokenPxIn(page, declarations, "spacing.large");
      expect(gap).toBeGreaterThan(0);
      await page.locator("#frame").evaluate((frame, px) => {
        (frame as HTMLElement).style.inlineSize = `${px * 1.5}px`;
      }, small);
      await expect
        .poll(async () => new Set((await boxesOf(page)).children.map((c) => c.top)).size)
        .toBe(2);
      const { control, children: boxes } = await boxesOf(page);
      const [one, two, three, four, five] = boxes;
      const column = (control.width - 2 * gap) / 3;
      const findings: string[] = [];
      const near = (actual: number, expected: number, what: string) => {
        if (Math.abs(actual - expected) > 1) findings.push(`${what}: ${actual} ≠ ${expected}`);
      };
      near((two?.left ?? 0) - ((one?.left ?? 0) + (one?.width ?? 0)), gap, "column gap");
      near((three?.left ?? 0) - ((two?.left ?? 0) + (two?.width ?? 0)), gap, "column gap");
      near(one?.width ?? 0, column, "column");
      near(four?.width ?? 0, 2 * column + gap, "data-span 2");
      near((five?.left ?? 0) - ((four?.left ?? 0) + (four?.width ?? 0)), gap, "gap after the span");
      const rowGap = await page.locator("#g").evaluate((element) => {
        const [first, , , fourth] = [...element.children].map((child) =>
          child.getBoundingClientRect(),
        );
        return Math.round((fourth?.top ?? 0) - (first?.bottom ?? 0));
      });
      near(rowGap, gap, "row gap");
      // Below columns-from of this Aspekto: one column.
      await page.locator("#frame").evaluate((frame, px) => {
        (frame as HTMLElement).style.inlineSize = `${px - 1}px`;
      }, small);
      await expect
        .poll(async () => new Set((await boxesOf(page)).children.map((c) => c.left)).size)
        .toBe(1);
      expect(findings).toEqual([]);
    });
  }
});
