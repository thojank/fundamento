// fm-vico in the browser (Spec 046 T1, section A): a row of any children with the gap of its
// spacing step between them; with wrap it breaks into a new line where its container is narrower
// than its children, without wrap it keeps them in one line. The gap is the spacing step's custom
// property, never a literal. Chromium (Spec 046 T1); the Vitrino and its geometry follow in T5.

import { expect, type Page, test } from "@playwright/test";
import { ASPEKTOJ_046, applyAssignment, declarationsOf, tokenPxIn } from "./aspektoj-046.js";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();

/** Three boxes of 6rem in a row inside a container of `width`. */
const row = (attributes: string, width: string) =>
  `<div style="inline-size: ${width}"><fm-vico id="r" ${attributes}>${["Eins", "Zwei", "Drei"]
    .map((word) => `<div style="inline-size: 6rem; flex: none">${word}</div>`)
    .join("")}</fm-vico></div>`;

// The children of the light DOM (a CSS locator would pierce the shadow and find the control too).
const topsOf = (page: Parameters<typeof serve>[0]) =>
  page
    .locator("#r")
    .evaluate((row) => [...row.children].map((box) => Math.round(box.getBoundingClientRect().top)));

const gapsOf = (page: Parameters<typeof serve>[0]) =>
  page.locator("#r").evaluate((row) => {
    const boxes = [...row.children];
    return boxes
      .slice(1)
      .map((box, index) =>
        Math.round(
          box.getBoundingClientRect().left - (boxes[index]?.getBoundingClientRect().right ?? 0),
        ),
      );
  });

const tokenPx = (page: Parameters<typeof serve>[0], name: string) =>
  page.evaluate(
    (property) =>
      Math.round(
        Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(property)),
      ),
    name,
  );

test.describe("fm-vico behaviour", () => {
  test("lays its children side by side with the gap of its step (default medium, large given)", async ({
    page,
  }) => {
    await serve(page, out, `${row("", "40rem")}`);
    const tops = await topsOf(page);
    expect(new Set(tops).size).toBe(1);
    const medium = await tokenPx(page, "--fm-spacing-medium");
    expect(medium).toBeGreaterThan(0);
    expect(await gapsOf(page)).toEqual([medium, medium]);
    await page.locator("#r").evaluate((element) => element.setAttribute("gap", "large"));
    const large = await tokenPx(page, "--fm-spacing-large");
    await expect.poll(() => gapsOf(page)).toEqual([large, large]);
  });

  test("with wrap it breaks into a new line in a narrow container; without wrap it stays in one line", async ({
    page,
  }) => {
    await serve(page, out, row("wrap", "13rem"));
    const wrapped = await topsOf(page);
    expect(wrapped[1]).toBe(wrapped[0]);
    expect(wrapped[2]).toBeGreaterThan(wrapped[0] ?? 0);
    // Without wrap the row keeps one line, however narrow its container.
    await page.locator("#r").evaluate((element) => element.removeAttribute("wrap"));
    await expect.poll(async () => new Set(await topsOf(page)).size).toBe(1);
  });

  test("draws nothing of its own: no role, no background, no border, the font of its container", async ({
    page,
  }) => {
    await serve(page, out, `<div style="font-size: 23px">${row("", "40rem")}</div>`);
    const own = await page.locator("#r").evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      const style = getComputedStyle(control);
      return {
        role: control.getAttribute("role"),
        background: style.backgroundColor,
        border: style.borderBlockStartWidth,
        font: style.fontSize,
      };
    });
    expect(own).toEqual({
      role: null,
      background: "rgba(0, 0, 0, 0)",
      border: "0px",
      font: "23px",
    });
  });
});

// Spec 046 T5 (A-10: geometry and style, no picture): in komuna light and dark and in ekzemplo, the
// gap between the children of vico, kolumno and stako is the value the spacing token of its step
// resolves to in that Aspekto (rezolvoj, the CSS Celo's declaration), at every step; a row keeps its
// children on one line, a column and a stack set them one below the other at one start.
const STEPS = ["xsmall", "small", "medium", "large", "xlarge", "xxlarge"] as const;

/** The gaps between the light-DOM children of `#id` along its axis, and their starts across it. */
const layoutOf = (page: Page, id: string, axis: "row" | "column") =>
  page.locator(`#${id}`).evaluate((element, along) => {
    const boxes = [...element.children].map((child) => child.getBoundingClientRect());
    return {
      gaps: boxes
        .slice(1)
        .map((box, index) =>
          Math.round(
            along === "row"
              ? box.left - (boxes[index]?.right ?? 0)
              : box.top - (boxes[index]?.bottom ?? 0),
          ),
        ),
      across: [...new Set(boxes.map((box) => Math.round(along === "row" ? box.top : box.left)))]
        .length,
    };
  }, axis);

const CHILDREN = ["Eins", "Zwei", "Drei"]
  .map((word) => `<div style="inline-size: 6rem; flex: none">${word}</div>`)
  .join("");

test.describe("Spec 046 T5: the gap of vico, kolumno and stako is its spacing token per Aspekto", () => {
  for (const [aspekto, scheme] of ASPEKTOJ_046) {
    test(`${aspekto} ${scheme}: every step of the row, the column and the stack`, async ({
      page,
    }) => {
      const { assignment, declarations } = declarationsOf(input, aspekto, scheme);
      const body = STEPS.flatMap((step) =>
        ["vico", "kolumno", "stako"].map(
          (ero) => `<fm-${ero} id="${ero}-${step}" gap="${step}">${CHILDREN}</fm-${ero}>`,
        ),
      ).join("");
      await serve(page, out, `<div style="inline-size: 60rem">${body}</div>`);
      await applyAssignment(page, assignment);
      const findings: string[] = [];
      for (const step of STEPS) {
        const expected = await tokenPxIn(page, declarations, `spacing.${step}`);
        expect(expected, step).toBeGreaterThan(0);
        for (const [ero, axis] of [
          ["vico", "row"],
          ["kolumno", "column"],
          ["stako", "column"],
        ] as const) {
          const { gaps, across } = await layoutOf(page, `${ero}-${step}`, axis);
          if (gaps.some((gap) => gap !== expected) || across !== 1) {
            findings.push(
              `${ero} ${step}: gaps ${gaps.join(",")} ≠ ${expected} or ${across} lines`,
            );
          }
        }
      }
      expect(findings).toEqual([]);
    });
  }
});
