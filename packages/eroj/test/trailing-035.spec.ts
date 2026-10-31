// Spec 035 2.1 (Nachtrag 30.10.), the right edge of a field by the Skemo's trailing: inside the
// field's border, from the inside out the text │ the status icon → the spinner → the clear button
// (✕) → the field's icon (the chevron of a select, the calendar of a date picker) │ the border.
// Every part shown at once – a status (warning, danger), loading, clearable with a value – stands
// in that order in the DOM and on the screen, each right of the one before it, all inside the
// control's border box, after the room of the text; a part one can press is a target of at least
// 24 × 24 px (WCAG 2.5.8). The status icon is the kampo's own (A-kampo-4): the elektilo and the
// datelektilo say their status by colour and message and have no icon to place.

import { expect, type Page, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

/** The rule of the edge, from the inside out; a field shows the parts it has. */
const RULE = [
  "status-icon",
  "spinner",
  "clear",
  "decrement",
  "increment",
  "indicator",
  "trigger",
] as const;
/** The parts one presses: each a target of at least 24 × 24 px. */
const PRESSED = ["clear", "decrement", "increment", "trigger"];
const TARGET_MIN = 24;

const MESSAGE = "Bitte noch einmal prüfen";
const options = (...words: string[]) =>
  words.map((word) => `<data slot="options" value="${word.toLowerCase()}">${word}</data>`).join("");

/** Every field of the finding with all of its parts shown at once, and the parts it shows. */
const FIELDS: Readonly<
  Record<string, { markup: (intent: string) => string; parts: readonly string[] }>
> = {
  kampo: {
    markup: (intent) =>
      `<fm-kampo intent="${intent}" clearable loading value="Anna">Name<span slot="message">${MESSAGE}</span></fm-kampo>`,
    parts: ["status-icon", "spinner", "clear"],
  },
  elektilo: {
    markup: (intent) =>
      `<fm-elektilo intent="${intent}" clearable loading value="deutschland">Land${options("Deutschland", "Österreich")}<span slot="message">${MESSAGE}</span></fm-elektilo>`,
    parts: ["spinner", "clear", "indicator"],
  },
  datelektilo: {
    markup: (intent) =>
      `<fm-datelektilo intent="${intent}" clearable loading value="2026-10-30">Lieferdatum<span slot="message">${MESSAGE}</span></fm-datelektilo>`,
    parts: ["spinner", "clear", "trigger"],
  },
};

interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

/**
 * The parts of the edge the field shows (in DOM order), their boxes, the border box of the
 * control (inside its border) and where the room of its text ends (inside its padding).
 */
async function edgeOf(page: Page, tag: string, rule: readonly string[]) {
  return page.evaluate(
    ({ name, parts }) => {
      const host = document.querySelector(name) as HTMLElement;
      const root = host.shadowRoot as ShadowRoot;
      const shown = (element: Element): element is HTMLElement => {
        if (!(element instanceof HTMLElement) || element.closest("[hidden]") !== null) return false;
        const box = element.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && getComputedStyle(element).visibility !== "hidden";
      };
      const found = parts
        .map((part) => root.querySelector(`[part="${part}"]`))
        .filter((element): element is HTMLElement => element !== null && shown(element));
      found.sort((a, b) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );
      const boxOf = (element: Element) => {
        const box = element.getBoundingClientRect();
        return {
          left: box.left,
          right: box.right,
          top: box.top,
          bottom: box.bottom,
          width: box.width,
          height: box.height,
        };
      };
      const control = root.querySelector('[part="control"]') as HTMLElement;
      const style = getComputedStyle(control);
      const box = control.getBoundingClientRect();
      const borderEnd = Number.parseFloat(style.borderInlineEndWidth);
      return {
        domOrder: found.map((element) => element.getAttribute("part") ?? ""),
        boxes: Object.fromEntries(
          found.map((element) => [element.getAttribute("part") ?? "", boxOf(element)]),
        ) as Record<string, Box>,
        inner: {
          left: box.left + Number.parseFloat(style.borderInlineStartWidth),
          right: box.right - borderEnd,
          top: box.top + Number.parseFloat(style.borderTopWidth),
          bottom: box.bottom - Number.parseFloat(style.borderBottomWidth),
        },
        textEnd: box.right - borderEnd - Number.parseFloat(style.paddingInlineEnd),
        statusIcon: root.querySelector('[part="status-icon"]') !== null,
      };
    },
    { name: tag, parts: [...rule] },
  );
}

test.describe("Spec 035 2.1: text │ status icon → spinner → ✕ → field icon │ border", () => {
  for (const [ero, field] of Object.entries(FIELDS)) {
    for (const intent of ["warning", "danger"]) {
      test(`${ero}, intent=${intent}, loading, clearable with a value: every part inside the border, from the inside out`, async ({
        page,
      }) => {
        await serve(page, out, `<div style="inline-size: 20rem">${field.markup(intent)}</div>`);
        const edge = await edgeOf(page, `fm-${ero}`, RULE);
        // The status icon is the kampo's own (A-kampo-4).
        expect(edge.statusIcon, "a status icon of its own").toBe(field.parts[0] === "status-icon");
        // Every part shows, in the DOM in the order of the rule.
        expect(edge.domOrder, "the parts shown, in DOM order").toEqual(field.parts);
        // On the screen: after the room of the text, each right of the one before, all inside the
        // control's border box.
        let before = edge.textEnd;
        let previous = "the text";
        for (const part of field.parts) {
          const box = edge.boxes[part] as Box;
          expect(box.left, `${part} after ${previous}`).toBeGreaterThanOrEqual(before - 0.5);
          expect(box.left, `${part} inside the border`).toBeGreaterThanOrEqual(
            edge.inner.left - 0.5,
          );
          expect(box.right, `${part} inside the border`).toBeLessThanOrEqual(
            edge.inner.right + 0.5,
          );
          expect(box.top, `${part} inside the border`).toBeGreaterThanOrEqual(edge.inner.top - 0.5);
          expect(box.bottom, `${part} inside the border`).toBeLessThanOrEqual(
            edge.inner.bottom + 0.5,
          );
          if (PRESSED.includes(part)) {
            expect(box.width, `${part}: a target`).toBeGreaterThanOrEqual(TARGET_MIN - 0.5);
            expect(box.height, `${part}: a target`).toBeGreaterThanOrEqual(TARGET_MIN - 0.5);
          }
          before = box.right;
          previous = part;
        }
      });
    }
  }
});
