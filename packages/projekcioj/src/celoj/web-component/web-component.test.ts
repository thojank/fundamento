// Web Component Celo (Spec 003 T011; FR-07, plan D-07, contracts/projekcioj §3): fm-butono is
// generated from the Skemo: a descriptor, a stylesheet whose design values are all tokens, and the
// element from the behaviour template. Nothing of butono is written by hand in @fundamento/eroj.

import {
  checkCustomElements,
  componentCssIssues,
  cssPhysicalPropertyIssues,
  defaultModeloSource,
} from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import { REACT_CELO } from "../react/react.js";
import { stylesheetInventory, WEB_COMPONENT_CELO } from "./web-component.js";

const prepared = celoInputOf(defaultModeloSource());
if (!prepared.ok) throw new Error("the repo Modelo must be valid");
const files = Object.fromEntries(
  [...WEB_COMPONENT_CELO.generate(prepared.input), ...REACT_CELO.generate(prepared.input)].map(
    (file) => [file.path, file.text],
  ),
);
const butono = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "butono");
const styles = files["eroj/src/generated/butono.styles.ts"] ?? "";
const element = files["eroj/src/generated/fm-butono.ts"] ?? "";
const css = JSON.parse(/export const BUTONO_CSS = (".*");/s.exec(styles)?.[1] ?? '""') as string;

/** Properties that carry design values: they must reference tokens (Art. X gate 1). */
const DESIGN =
  /^(color|background-color|border-color|border-width|border-radius|min-block-size|min-inline-size|inline-size|block-size|padding-inline|gap|font-family|font-size|font-weight|letter-spacing|line-height|outline-width|outline-style|outline-color|outline-offset|box-shadow|transition-duration|transition-timing-function)$/;

describe("Web Component Celo (T011)", () => {
  it("generates the descriptor, the stylesheet, the element and an index", () => {
    // Spec 008: the ligilo on the same path as the butono (Art. IX, Art. XI).
    expect(Object.keys(files).sort()).toEqual([
      "eroj/src/generated/butono.styles.ts",
      "eroj/src/generated/elektilo.styles.ts",
      "eroj/src/generated/elekto.styles.ts",
      "eroj/src/generated/fm-butono.ts",
      "eroj/src/generated/fm-elektilo.ts",
      "eroj/src/generated/fm-elekto.ts",
      "eroj/src/generated/fm-kampo.ts",
      "eroj/src/generated/fm-ligilo.ts",
      "eroj/src/generated/fm-markobutono.ts",
      "eroj/src/generated/fm-sxaltilo.ts",
      "eroj/src/generated/index.ts",
      "eroj/src/generated/kampo.styles.ts",
      "eroj/src/generated/ligilo.styles.ts",
      "eroj/src/generated/markobutono.styles.ts",
      "eroj/src/generated/react.ts",
      "eroj/src/generated/skemo.ts",
      "eroj/src/generated/sxaltilo.styles.ts",
    ]);
  });

  it("puts the Skemo into the descriptor unchanged", () => {
    const skemo = /export const BUTONO_SKEMO = (\{.*?\}) as const;\n/s.exec(
      files["eroj/src/generated/skemo.ts"] ?? "",
    )?.[1];
    expect(JSON.parse(skemo ?? "null")).toEqual(butono?.skemo);
  });

  it("gives every design property a token value (F2: the Ero stylesheet rule)", () => {
    expect([...css.matchAll(/var\(--fm-[a-z0-9-]+\)/g)].length).toBeGreaterThan(40);
    expect(componentCssIssues("butono.css", css)).toEqual([]);
  });

  it("uses logical properties only and keeps every target at least size.target.min", () => {
    expect(cssPhysicalPropertyIssues("butono.css", css)).toEqual([]);
    expect(css).toContain("min-inline-size: var(--fm-size-target-min);");
  });

  it("registers the element in its own module, guarded, and leaves no import cycle (F6)", () => {
    // The element registers itself: the React wrapper only imports it, so index, element and
    // wrapper import in one direction.
    expect(element).toContain('customElements.get("fm-butono") !== undefined');
    expect(element).toContain('customElements.define("fm-butono", FmButono)');
    expect(element).toContain('typeof customElements === "undefined"');
    expect(element).toContain("defineFmButono();");
    const react = files["eroj/src/generated/react.ts"] ?? "";
    expect(react).toContain('import { defineFmButono } from "./fm-butono.js";');
    expect(react).toContain("defineFmButono();");
    expect(react).not.toContain('from "./index.js"');
    const index = files["eroj/src/generated/index.ts"] ?? "";
    expect(index).not.toContain('from "./react.js"');
  });

  it("keeps the element importable without a DOM (server-side rendering, F6)", () => {
    expect(element).toContain('typeof HTMLElement === "undefined"');
  });

  it("registers every element under a literal fm- name (FR-14, checked on the generated output)", () => {
    // The registration lives in the element module (F6), with a literal name.
    const result = checkCustomElements("fm-butono.ts", element);
    expect(result.definitions).toBe(1);
    expect(result.issues).toEqual([]);
    expect(element).toContain('customElements.define("fm-butono", FmButono)');
  });

  it("exposes only ::part(control) and has no text of its own (Art. VIII)", () => {
    // The parts of the markup (the template also names parts in selectors it queries).
    const templates = [...element.matchAll(/`(<[^`]*)`/g)].map((m) => m[1] ?? "");
    expect(templates.flatMap((t) => [...t.matchAll(/part="([a-z-]+)"/g)].map((m) => m[1]))).toEqual(
      ["control"],
    );
    expect(templates.length).toBeGreaterThan(0);
    for (const template of templates) expect(template).not.toMatch(/>[^<\s$][^<]*</);
  });
});

// Spec 008 T015 (A5, plan D-09): the ligilo from the same template, rendered as a native link.
describe("Web Component Celo for the ligilo (Spec 008 T015)", () => {
  const ligilo = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "ligilo");
  const ligiloStyles = files["eroj/src/generated/ligilo.styles.ts"] ?? "";
  const ligiloElement = files["eroj/src/generated/fm-ligilo.ts"] ?? "";
  const ligiloCss = JSON.parse(
    /export const LIGILO_CSS = (".*");/s.exec(ligiloStyles)?.[1] ?? '""',
  ) as string;

  it("renders a native link as the control, with href from to and no form association", () => {
    expect(ligilo).toBeDefined();
    expect(ligiloElement).toContain('<a part="control">');
    expect(ligiloElement).not.toContain("<button");
    expect(ligiloElement).toContain('control.setAttribute("href", to)');
    expect(ligiloElement).toContain('"external noopener noreferrer"');
    expect(ligiloElement).toContain("static formAssociated = false;");
    expect(ligiloElement).toContain('customElements.define("fm-ligilo", FmLigilo)');
    // The slots of the Skemo: the label and icon-end, no icon-start (E3).
    expect(ligiloElement).toContain('<slot></slot><slot name="icon-end">');
    expect(ligiloElement).not.toContain('name="icon-start"');
  });

  it("speaks the a11y text as the description and shows the mark while external is true (D-02, D-05)", () => {
    expect(ligiloElement).toContain(
      'control.setAttribute("aria-describedby", described.join(" "))',
    );
    expect(ligiloElement).toContain('described.push("fm-texts")');
    expect(ligiloElement).toContain('root.setAttribute("data-marked", "true")');
    expect(ligiloCss).toContain(':not([data-marked="true"])');
    // No text of its own: the texts come from the Skemo descriptor at runtime (Art. VIII).
    expect(ligiloElement).not.toContain("öffnet extern");
    const templates = [...ligiloElement.matchAll(/`(<[^`]*)`/g)].map((m) => m[1] ?? "");
    expect(templates.flatMap((t) => [...t.matchAll(/part="([a-z-]+)"/g)].map((m) => m[1]))).toEqual(
      ["control"],
    );
  });

  it("underlines inline in every state and standalone from hover and focus on; visited has a colour", () => {
    expect(ligiloCss).toContain('[data-placement="inline"]');
    expect(ligiloCss).toMatch(
      /\[data-placement="inline"\]\) \{\n\s+text-decoration-line: underline;\n\s+text-decoration-thickness: var\(--fm-border-width-default\);/,
    );
    expect(ligiloCss).toMatch(
      /\[data-placement="standalone"\]\) \{\n\s+text-decoration-line: none;/,
    );
    expect(ligiloCss).toMatch(
      /\[data-placement="standalone"\]:hover\) \{\n\s+text-decoration-line: underline;/,
    );
    expect(ligiloCss).toMatch(/:visited\) \{\n\s+color: var\(--fm-color-link-visited\);/);
    expect(ligiloCss).toMatch(
      /:focus-visible\) \{\n(\s+[a-z-]+: [^;]+;\n)*\s+color: var\(--fm-color-link-rest\);/,
    );
    expect(ligiloCss).toContain("text-decoration-color: var(--fm-color-link-rest);");
  });

  it("inherits the typography inline and flows with the text; the host is inline (E6, D-04)", () => {
    expect(ligiloCss).toMatch(/^:host \{ display: inline; vertical-align: baseline; \}/);
    expect(ligiloCss).toMatch(
      /\[data-placement="inline"\]\[data-size="medium"\]\) \{\n\s+display: inline;\n\s+white-space: normal;/,
    );
    expect(ligiloCss).toMatch(
      /\[data-placement="standalone"\]\[data-size="small"\]\) \{\n\s+font-family: var\(--fm-typography-label-2-font-family\);/,
    );
    // The minimum target stands standalone only (D-10); inline writes none (no literal).
    expect(ligiloCss).toMatch(
      /\[data-placement="standalone"\]\) \{\n\s+text-decoration-line: none;\n\s+min-block-size: var\(--fm-size-target-min\);/,
    );
    expect(ligiloCss).toMatch(
      /\[data-placement="inline"\]\) \{\n\s+text-decoration-line: underline;\n\s+text-decoration-thickness: var\(--fm-border-width-default\);\n\}/,
    );
    expect(ligiloCss).not.toContain("auto;");
    expect(ligiloCss).not.toContain("var(--fm-inherit)");
    expect(ligiloCss).not.toContain("var(--fm-none)");
  });

  // Abnahme 2026-10-13, F-3: the structure rule set border-style solid for every Ero; without a
  // border part nothing sets the width, and the browser drew its initial medium border around
  // the link. A border style belongs only to an Ero with a border part.
  it("draws a border only for an Ero with a border part (F-3)", () => {
    expect(ligiloCss).not.toContain("border-style");
    expect(css).toContain("border-style: solid;");
    expect(css).toContain("border-width: var(--fm-border-width-default);");
  });

  it("keeps every design property a token and logical, like the butono (Art. X gate 1)", () => {
    expect(componentCssIssues("ligilo.css", ligiloCss)).toEqual([]);
    expect(cssPhysicalPropertyIssues("ligilo.css", ligiloCss)).toEqual([]);
    expect(css).toMatch(/^:host \{ display: inline-block; vertical-align: middle; \}/);
    // The stylesheet inventory reads the visited state (parity).
    expect([...stylesheetInventory(ligiloStyles).states].sort()).toEqual([
      "focus",
      "hover",
      "pressed",
      "rest",
      "visited",
    ]);
  });
});

// Spec 010 ① (plan D-09): the switch from the same template — a native button with role switch
// and aria-checked as the track, the knob inside it, the label beside it; checked keys the parts
// (data-checked on the field) and the knob stands at the start or the end of the track.
describe("Web Component Celo for the sxaltilo (Spec 010 ①)", () => {
  const sxaltiloStyles = files["eroj/src/generated/sxaltilo.styles.ts"] ?? "";
  const sxaltiloElement = files["eroj/src/generated/fm-sxaltilo.ts"] ?? "";
  const sxaltiloCss = JSON.parse(
    /export const SXALTILO_CSS = (".*");/s.exec(sxaltiloStyles)?.[1] ?? '""',
  ) as string;

  it("renders a button with role switch as the track, the knob in it and the label beside it", () => {
    const templates = [...sxaltiloElement.matchAll(/`(<[^`]*)`/g)].map((m) => m[1] ?? "");
    expect(templates.flatMap((t) => [...t.matchAll(/part="([a-z-]+)"/g)].map((m) => m[1]))).toEqual(
      ["field", "control", "indicator", "label"],
    );
    expect(sxaltiloElement).toContain('role="switch"');
    expect(sxaltiloElement).toContain('aria-labelledby="label"');
    expect(sxaltiloElement).toContain('<label part="label" id="label" for="control">');
    expect(sxaltiloElement).toContain("static formAssociated = true;");
    expect(sxaltiloElement).toContain('control.setAttribute("aria-checked"');
    expect(sxaltiloElement).toContain('customElements.define("fm-sxaltilo", FmSxaltilo)');
    for (const template of templates) expect(template).not.toMatch(/>[^<\s$][^<]*</);
  });

  it("keys the parts by checked on the field and places the knob by a logical alignment (D-03, D-04)", () => {
    expect(sxaltiloCss).toContain('[part="field"][data-checked="true"]');
    expect(sxaltiloCss).toContain('[part="field"][data-checked="false"]');
    expect(sxaltiloCss).toMatch(
      /\[data-checked="true"\]\) \[part="control"\] \{\n(\s+[a-z-]+: [^;]+;\n)*\s+justify-content: flex-end;/,
    );
    expect(sxaltiloCss).toMatch(
      /\[data-checked="false"\]\) \[part="control"\] \{\n(\s+[a-z-]+: [^;]+;\n)*\s+justify-content: flex-start;/,
    );
    expect(sxaltiloCss).toContain("background-color: var(--fm-color-action-primary-rest);");
    expect(sxaltiloCss).toContain("background-color: var(--fm-color-background-sunken);");
    expect(sxaltiloCss).toContain("inline-size: var(--fm-size-icon-medium);");
    expect(sxaltiloCss).toContain("min-inline-size: var(--fm-size-control-medium);");
  });

  it("keeps every design property a token and logical (Art. X gate 1)", () => {
    expect(componentCssIssues("sxaltilo.css", sxaltiloCss)).toEqual([]);
    expect(cssPhysicalPropertyIssues("sxaltilo.css", sxaltiloCss)).toEqual([]);
  });

  it("states checked as a boolean prop in the stylesheet inventory, like React and Figma (parity)", () => {
    const inventory = stylesheetInventory(sxaltiloStyles);
    expect(inventory.props).toEqual({
      checked: ["boolean"],
      size: ["small", "medium", "large"],
    });
    expect([...inventory.states].sort()).toEqual(["disabled", "focus", "hover", "rest"]);
  });
});

// Spec 010 ② (plan ② D-08): the checkbox from the same template as the switch — a native button
// with role checkbox and aria-checked as the box, the check mark inside it, the label beside it
// with the mark of a required box, and the error under the label. checked keys the parts
// (data-checked on the field); the check mark is not drawn while unchecked (indicator.color none).
describe("Web Component Celo for the markobutono (Spec 010 ②)", () => {
  const markobutonoStyles = files["eroj/src/generated/markobutono.styles.ts"] ?? "";
  const markobutonoElement = files["eroj/src/generated/fm-markobutono.ts"] ?? "";
  const sxaltiloElement = files["eroj/src/generated/fm-sxaltilo.ts"] ?? "";
  const markobutonoCss = JSON.parse(
    /export const MARKOBUTONO_CSS = (".*");/s.exec(markobutonoStyles)?.[1] ?? '""',
  ) as string;
  const templates = (source: string) =>
    [...source.matchAll(/`(<[^`]*)`/g)].map((match) => match[1] ?? "");
  const parts = (source: string) =>
    templates(source).flatMap((t) => [...t.matchAll(/part="([a-z-]+)"/g)].map((m) => m[1]));

  it("renders a button with role checkbox as the box, the check mark in it, label, mark and error beside it", () => {
    expect(parts(markobutonoElement)).toEqual([
      "field",
      "control",
      "indicator",
      "label",
      "required-mark",
      "error",
    ]);
    expect(markobutonoElement).toContain('role="checkbox"');
    expect(markobutonoElement).toContain('aria-labelledby="label"');
    expect(markobutonoElement).toContain('<label part="label" id="label" for="control">');
    expect(markobutonoElement).toContain(
      '<span part="error" id="error" hidden aria-live="polite">',
    );
    expect(markobutonoElement).toContain("static formAssociated = true;");
    expect(markobutonoElement).toContain('control.setAttribute("aria-checked"');
    expect(markobutonoElement).toContain('customElements.define("fm-markobutono", FmMarkobutono)');
    for (const template of templates(markobutonoElement)) {
      expect(template).not.toMatch(/>[^<\s$][^<]*</);
    }
    // The switch is unchanged: no mark, no error, no sign in its knob (① D-09).
    expect(parts(sxaltiloElement)).toEqual(["field", "control", "indicator", "label"]);
    expect(sxaltiloElement).toContain('role="switch"');
  });

  it("is the form's validity: a required box left empty is valueMissing, with the text of a11y.texts.required", () => {
    expect(markobutonoElement).toContain("setValidity({ valueMissing: true }");
    expect(markobutonoElement).toContain('control.setAttribute("aria-required", "true")');
    expect(markobutonoElement).toContain('control.setAttribute("aria-invalid", "true")');
    // Space turns it, Enter does not (a11y.keys of the Skemo: Space only).
    expect(markobutonoElement).toMatch(/KEYS\.includes\("Enter"\)/);
  });

  it("keys the parts by checked on the field, hides the mark unchecked and borders the box by state", () => {
    expect(markobutonoCss).toContain('[part="field"][data-checked="true"]');
    expect(markobutonoCss).toContain('[part="field"][data-checked="false"]');
    expect(markobutonoCss).toMatch(
      /\[data-checked="false"\]\) \[part="indicator"\] \{\n\s+opacity: 0;\n\}/,
    );
    expect(markobutonoCss).toMatch(
      /\[data-checked="true"\]\) \[part="indicator"\] \{\n\s+color: var\(--fm-color-action-primary-text\);\n\}/,
    );
    expect(markobutonoCss).toContain("background-color: var(--fm-color-action-primary-rest);");
    expect(markobutonoCss).toContain("background-color: var(--fm-color-background-default);");
    expect(markobutonoCss).toContain("border-color: var(--fm-color-status-danger-border);");
    expect(markobutonoCss).toContain(':has([part="control"][aria-invalid="true"])');
    expect(markobutonoCss).toContain("border-radius: var(--fm-radius-role-control);");
    expect(markobutonoCss).toContain("inline-size: var(--fm-size-icon-medium);");
    // The label may break (Uzo wrap allowed), the switch's never; the mark shows only marked.
    expect(markobutonoCss).not.toContain("white-space: nowrap");
    expect(markobutonoCss).toContain(
      ':where([part="field"]:not([data-marked="true"])) [part="required-mark"] { display: none; }',
    );
  });

  it("keeps every design property a token and logical (Art. X gate 1)", () => {
    expect(componentCssIssues("markobutono.css", markobutonoCss)).toEqual([]);
    expect(cssPhysicalPropertyIssues("markobutono.css", markobutonoCss)).toEqual([]);
  });

  it("states checked as a boolean prop and invalid as a state in the stylesheet inventory (parity)", () => {
    const inventory = stylesheetInventory(markobutonoStyles);
    expect(inventory.props).toEqual({
      checked: ["boolean"],
      size: ["small", "medium", "large"],
    });
    expect([...inventory.states].sort()).toEqual(["disabled", "focus", "hover", "invalid", "rest"]);
  });
});

// Spec 010 ③ (plan ③ D-06): the radio group. A group (role radiogroup) named by its label, with one
// row per option built from the light DOM — every child with slot="options" is an option, its
// value the attribute value (a <data> element: text and value, the platform's own pair), its text
// the label of the row. The children are assigned to their slots by the element (manual slot
// assignment), one row per option: role radio and aria-checked on the row, the circle (control)
// with the dot (indicator) in it, the label of the option beside it. selected is the state of one
// row (aria-checked), never a data attribute of the group: it is no prop (E7).
describe("Web Component Celo for the elekto (Spec 010 ③)", () => {
  const elektoStyles = files["eroj/src/generated/elekto.styles.ts"] ?? "";
  const elektoElement = files["eroj/src/generated/fm-elekto.ts"] ?? "";
  const markobutonoElement = files["eroj/src/generated/fm-markobutono.ts"] ?? "";
  const elektoCss = JSON.parse(
    /export const ELEKTO_CSS = (".*");/s.exec(elektoStyles)?.[1] ?? '""',
  ) as string;
  const templates = (source: string) =>
    [...source.matchAll(/`(<[^`]*)`/g)].map((match) => match[1] ?? "");
  const parts = (source: string) =>
    templates(source).flatMap((t) => [...t.matchAll(/part="([a-z-]+)"/g)].map((m) => m[1]));

  it("renders a group named by its label with the options, help and error, and a row per option", () => {
    expect(parts(elektoElement)).toEqual([
      "field",
      "label",
      "required-mark",
      "options",
      "help",
      "error",
      "option",
      "control",
      "indicator",
      "option-label",
    ]);
    expect(elektoElement).toContain('role="radiogroup"');
    expect(elektoElement).toContain('aria-labelledby="label"');
    expect(elektoElement).toContain('role="radio"');
    expect(elektoElement).toContain('slotAssignment: "manual"');
    expect(elektoElement).toContain('<span part="error" id="error" hidden aria-live="polite">');
    expect(elektoElement).toContain("static formAssociated = true;");
    expect(elektoElement).toContain('row.setAttribute("aria-checked"');
    expect(elektoElement).toContain('customElements.define("fm-elekto", FmElekto)');
    for (const template of templates(elektoElement)) {
      expect(template).not.toMatch(/>[^<\s$][^<]*</);
    }
    // The checkbox is unchanged: no group, no rows (② D-08).
    expect(parts(markobutonoElement)).toEqual([
      "field",
      "control",
      "indicator",
      "label",
      "required-mark",
      "error",
    ]);
    expect(markobutonoElement).not.toContain("slotAssignment");
  });

  it("moves and chooses with the arrow keys, chooses with Space, is the form's value and validity", () => {
    for (const key of ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"]) {
      expect(elektoElement).toContain(`"${key}"`);
    }
    expect(elektoElement).toMatch(/KEYS\.includes\(/);
    expect(elektoElement).toContain("this.#internals.setFormValue(");
    expect(elektoElement).toContain("setValidity({ valueMissing: true }");
    expect(elektoElement).toContain('group.setAttribute("aria-required", "true")');
    expect(elektoElement).toContain('group.setAttribute("aria-invalid", "true")');
    expect(elektoElement).toContain('group.setAttribute("aria-orientation"');
    // One tab stop: the chosen row, else the first (roving tabindex).
    expect(elektoElement).toContain("row.tabIndex =");
  });

  it("keys the circle and the dot by aria-checked of the row, never by a data attribute selected", () => {
    expect(elektoCss).not.toContain("data-selected");
    expect(elektoCss).toContain('[part="option"][aria-checked="true"]');
    expect(elektoCss).toContain('[part="option"][aria-checked="false"]');
    expect(elektoCss).toMatch(
      /\[aria-checked="false"\]\) \[part="indicator"\] \{\n\s+opacity: 0;\n\}/,
    );
    expect(elektoCss).toMatch(
      /\[aria-checked="true"\]\) \[part="indicator"\] \{\n\s+color: var\(--fm-color-action-primary-text\);\n\}/,
    );
    expect(elektoCss).toContain("background-color: var(--fm-color-action-primary-rest);");
    expect(elektoCss).toContain("background-color: var(--fm-color-background-default);");
    expect(elektoCss).toContain("border-color: var(--fm-color-status-danger-border);");
    expect(elektoCss).toContain('[part="field"][aria-invalid="true"]');
    expect(elektoCss).toContain('[part="field"][aria-disabled="true"]');
    expect(elektoCss).toContain('[part="option"][aria-checked="true"]:hover');
    expect(elektoCss).toContain('[part="option"]:focus-visible) [part="control"]');
    expect(elektoCss).toContain("border-radius: var(--fm-radius-role-pill);");
    expect(elektoCss).toContain("inline-size: var(--fm-size-icon-medium);");
    expect(elektoCss).toContain("gap: var(--fm-spacing-medium);");
    expect(elektoCss).toContain("font-family: var(--fm-typography-body-1-font-family);");
  });

  it("lays the options out in a column, in a row when horizontal, never breaking (Uzo wrap never)", () => {
    expect(elektoCss).toContain(
      ':where([part="field"][aria-orientation="horizontal"]) [part="options"] { flex-direction: row; flex-wrap: nowrap; }',
    );
    expect(elektoCss).toContain("white-space: nowrap");
    expect(elektoCss).toContain(
      ':where([part="field"]:not([data-marked="true"])) [part="required-mark"] { display: none; }',
    );
  });

  it("keeps every design property a token and logical (Art. X gate 1)", () => {
    expect(componentCssIssues("elekto.css", elektoCss)).toEqual([]);
    expect(cssPhysicalPropertyIssues("elekto.css", elektoCss)).toEqual([]);
  });

  it("states size as its only styled prop and the five states in the stylesheet inventory (parity)", () => {
    const inventory = stylesheetInventory(elektoStyles);
    expect(inventory.props).toEqual({ size: ["small", "medium", "large"] });
    expect([...inventory.states].sort()).toEqual(["disabled", "focus", "hover", "invalid", "rest"]);
  });
});

// Spec 010 ④ (plan ④ D-06, E3): the select. The field of the kampo — label with the mark of a
// required field, help and error — around the platform's own select (role combobox from the
// browser, Art. VIII: the platform element is Celo knowledge, like href) and the chevron beside
// it, lying over its end. The options come from the light DOM (<data slot="options" value>, like
// the elekto's) and are written into the select as the platform's options; while none is chosen,
// the placeholder is the first option, disabled. The list that opens is the platform's: no popup,
// no state open, no key handling of the element's own.
describe("Web Component Celo for the elektilo (Spec 010 ④)", () => {
  const elektiloStyles = files["eroj/src/generated/elektilo.styles.ts"] ?? "";
  const elektiloElement = files["eroj/src/generated/fm-elektilo.ts"] ?? "";
  const kampoElement = files["eroj/src/generated/fm-kampo.ts"] ?? "";
  const kampoStyles = files["eroj/src/generated/kampo.styles.ts"] ?? "";
  const elektiloCss = JSON.parse(
    /export const ELEKTILO_CSS = (".*");/s.exec(elektiloStyles)?.[1] ?? '""',
  ) as string;
  const kampoCss = JSON.parse(
    /export const KAMPO_CSS = (".*");/s.exec(kampoStyles)?.[1] ?? '""',
  ) as string;
  const templates = (source: string) =>
    [...source.matchAll(/`(<[^`]*)`/g)].map((match) => match[1] ?? "");
  const parts = (source: string) =>
    templates(source).flatMap((t) => [...t.matchAll(/part="([a-z-]+)"/g)].map((m) => m[1]));

  it("renders the field of the kampo around a native select, with the chevron beside it", () => {
    expect(parts(elektiloElement)).toEqual([
      "field",
      "label",
      "required-mark",
      "control",
      "indicator",
      "help",
      "error",
    ]);
    expect(elektiloElement).toContain('<select part="control" id="control"></select>');
    expect(elektiloElement).toContain('<label part="label" for="control">');
    expect(elektiloElement).toContain('<span part="indicator" aria-hidden="true"><svg');
    expect(elektiloElement).toContain('<span part="error" id="error" hidden aria-live="polite">');
    expect(elektiloElement).toContain("static formAssociated = true;");
    expect(elektiloElement).toContain('customElements.define("fm-elektilo", FmElektilo)');
    // No role of its own: the browser gives the select role combobox; no popup, no open (E3).
    expect(elektiloElement).not.toContain('role="combobox"');
    expect(elektiloElement).not.toContain("aria-expanded");
    expect(elektiloElement).not.toContain("listbox");
    expect(elektiloElement).not.toContain("slotAssignment");
    for (const template of templates(elektiloElement)) {
      expect(template).not.toMatch(/>[^<\s$][^<]*</);
    }
    // The kampo is unchanged: an input, no chevron.
    expect(parts(kampoElement)).toEqual([
      "field",
      "label",
      "required-mark",
      "control",
      "help",
      "error",
    ]);
    expect(kampoElement).not.toContain("<select");
  });

  it("mirrors the options of the light DOM, the placeholder first and disabled while none is chosen", () => {
    expect(elektiloElement).toContain('child.getAttribute("slot") === "options"');
    expect(elektiloElement).toContain('document.createElement("option")');
    expect(elektiloElement).toContain("element.disabled = option.prompt;");
    expect(elektiloElement).toContain("select.selectedIndex = chosen === -1 ? 0 : chosen;");
    expect(elektiloElement).toContain("new MutationObserver(");
  });

  it("is the form's value and validity; required, invalid and the change of the select", () => {
    expect(elektiloElement).toContain("this.#internals.setFormValue(chosen === -1 ? null");
    expect(elektiloElement).toContain("setValidity({ valueMissing: true }, missing, select)");
    expect(elektiloElement).toContain('select.setAttribute("aria-required", "true")');
    expect(elektiloElement).toContain('select.setAttribute("aria-invalid", "true")');
    expect(elektiloElement).toContain('control.addEventListener("change"');
    expect(elektiloElement).toContain('new Event("change", { bubbles: true })');
    // The keys are the platform's: the element handles none of its own (a11y.keys of the Skemo).
    expect(elektiloElement).not.toContain('addEventListener("keydown"');
  });

  it("keys the field like the kampo, the chevron in color.text.muted and size.icon.*, the prompt in the placeholder colour", () => {
    expect(elektiloCss).toContain(
      ':where([part="field"]) [part="indicator"] {\n  color: var(--fm-color-text-muted);\n}',
    );
    expect(elektiloCss).toContain(
      ':where([part="field"][data-size="small"]) [part="indicator"] {\n  inline-size: var(--fm-size-icon-small);',
    );
    expect(elektiloCss).toContain(
      ':where([part="field"]) [part="control"]:has(> option[value=""]:checked) {\n  color: var(--fm-color-text-subtle);\n}',
    );
    expect(elektiloCss).not.toContain("::placeholder");
    expect(elektiloCss).toContain("border-color: var(--fm-color-status-danger-border);");
    expect(elektiloCss).toContain("min-block-size: var(--fm-size-control-medium);");
    expect(elektiloCss).not.toContain("[readonly]");
    // The kampo keeps its own placeholder rule and has no chevron.
    expect(kampoCss).toContain('[part="control"]::placeholder');
    expect(kampoCss).not.toContain("indicator");
  });

  it("lays the chevron over the end of the select from tokens only: the text ends a gap before it (D-06)", () => {
    expect(elektiloCss).toContain(
      ':where([part="field"]) > div { display: flex; align-items: center; }',
    );
    expect(elektiloCss).toContain("pointer-events: none;");
    expect(elektiloCss).toContain(
      "padding-inline-end: calc(var(--fm-spacing-medium) + var(--fm-size-icon-medium) + var(--fm-spacing-small));",
    );
    expect(elektiloCss).toContain(
      "margin-inline-start: calc(-1 * (var(--fm-size-icon-small) + var(--fm-spacing-small) + var(--fm-border-width-default)));",
    );
    expect(elektiloCss).toContain(
      "margin-inline-end: calc(var(--fm-spacing-medium) + var(--fm-border-width-default));",
    );
  });

  it("keeps every design property a token and logical (Art. X gate 1)", () => {
    expect(componentCssIssues("elektilo.css", elektiloCss)).toEqual([]);
    expect(cssPhysicalPropertyIssues("elektilo.css", elektiloCss)).toEqual([]);
  });

  it("states size as its only styled prop and the five states in the stylesheet inventory (parity)", () => {
    const inventory = stylesheetInventory(elektiloStyles);
    expect(inventory.props).toEqual({ size: ["small", "medium", "large"] });
    expect([...inventory.states].sort()).toEqual(["disabled", "focus", "hover", "invalid", "rest"]);
  });
});
