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
      "eroj/src/generated/apartigilo.styles.ts",
      "eroj/src/generated/atributlisto.styles.ts",
      "eroj/src/generated/avizo.styles.ts",
      "eroj/src/generated/butono.styles.ts",
      "eroj/src/generated/dialogo.styles.ts",
      "eroj/src/generated/elektilo.styles.ts",
      "eroj/src/generated/elekto.styles.ts",
      "eroj/src/generated/faldilo.styles.ts",
      "eroj/src/generated/fm-apartigilo.ts",
      "eroj/src/generated/fm-atributlisto.ts",
      "eroj/src/generated/fm-avizo.ts",
      "eroj/src/generated/fm-butono.ts",
      "eroj/src/generated/fm-dialogo.ts",
      "eroj/src/generated/fm-elektilo.ts",
      "eroj/src/generated/fm-elekto.ts",
      "eroj/src/generated/fm-faldilo.ts",
      "eroj/src/generated/fm-ikono.ts",
      "eroj/src/generated/fm-insigno.ts",
      "eroj/src/generated/fm-kampo.ts",
      "eroj/src/generated/fm-kompletigilo.ts",
      "eroj/src/generated/fm-konsileto.ts",
      "eroj/src/generated/fm-langetaro.ts",
      "eroj/src/generated/fm-ligilo.ts",
      "eroj/src/generated/fm-markobutono.ts",
      "eroj/src/generated/fm-menuo.ts",
      "eroj/src/generated/fm-mezurilo.ts",
      "eroj/src/generated/fm-navigado.ts",
      "eroj/src/generated/fm-plenstato.ts",
      "eroj/src/generated/fm-saltligilo.ts",
      "eroj/src/generated/fm-sxaltilo.ts",
      "eroj/src/generated/fm-sxvebilo.ts",
      "eroj/src/generated/fm-tabelo.ts",
      "eroj/src/generated/fm-tekstareo.ts",
      "eroj/src/generated/fm-teksto.ts",
      "eroj/src/generated/fm-titolo.ts",
      "eroj/src/generated/ikono.styles.ts",
      "eroj/src/generated/index.ts",
      "eroj/src/generated/insigno.styles.ts",
      "eroj/src/generated/kampo.styles.ts",
      "eroj/src/generated/kompletigilo.styles.ts",
      "eroj/src/generated/konsileto.styles.ts",
      "eroj/src/generated/langetaro.styles.ts",
      "eroj/src/generated/ligilo.styles.ts",
      "eroj/src/generated/markobutono.styles.ts",
      "eroj/src/generated/menuo.styles.ts",
      "eroj/src/generated/mezurilo.styles.ts",
      "eroj/src/generated/navigado.styles.ts",
      "eroj/src/generated/plenstato.styles.ts",
      "eroj/src/generated/react.ts",
      "eroj/src/generated/saltligilo.styles.ts",
      "eroj/src/generated/skemo.ts",
      "eroj/src/generated/sxaltilo.styles.ts",
      "eroj/src/generated/sxvebilo.styles.ts",
      "eroj/src/generated/tabelo.styles.ts",
      "eroj/src/generated/tekstareo.styles.ts",
      "eroj/src/generated/teksto.styles.ts",
      "eroj/src/generated/titolo.styles.ts",
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
  const sxaltiloCss = JSON.parse(
    /export const SXALTILO_CSS = (".*");/s.exec(
      files["eroj/src/generated/sxaltilo.styles.ts"] ?? "",
    )?.[1] ?? '""',
  ) as string;
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
    // Spec 011 ① (O-8, plan ② B-4 of Spec 010): a single word longer than the line breaks too.
    expect(markobutonoCss).not.toContain("white-space: nowrap");
    expect(markobutonoCss).toContain(
      ':where([part="label"]) { cursor: pointer; white-space: normal; overflow-wrap: anywhere; }',
    );
    expect(sxaltiloCss).not.toContain("overflow-wrap");
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
    // Spec 014 ②: the chevron is an ikono chevron-down, the Aspekto's glyph in the size of the field.
    expect(elektiloElement).toContain(
      '<span part="indicator" aria-hidden="true"><fm-ikono name="chevron-down"></fm-ikono></span>',
    );
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
    // Spec 011 ①: the empty option, when set, stands before the chosen one.
    expect(elektiloElement).toContain(
      "select.selectedIndex = chosen === -1 ? 0 : chosen + (empty ? 1 : 0);",
    );
    expect(elektiloElement).toContain("new MutationObserver(");
  });

  it("is the form's value and validity; required, invalid and the change of the select", () => {
    expect(elektiloElement).toContain(
      'this.#internals.setFormValue(chosen === -1 ? (empty ? "" : null)',
    );
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

// Spec 011 ① (E8, O-7, plan ① D-07): the kampo takes a password, a whole number and a date, is
// the form's validity and sends the form with Enter. A number is a text input with a numeric
// keyboard and a pattern (GOV.UK: no type=number, whose wheel and arrows change the value); a date
// is the platform's own dialog; a password hides what is typed and names what the platform fills
// in. A required field left empty, a number that is no whole number or out of its bounds, and a
// date the platform refuses keep the form from being sent; the error slot's text is the message.
describe("Web Component Celo for the kampo of Spec 011 ① (password, number, date, form)", () => {
  const kampoElement = files["eroj/src/generated/fm-kampo.ts"] ?? "";
  const kampoStyles = files["eroj/src/generated/kampo.styles.ts"] ?? "";

  it("renders a number as type text with inputmode numeric and a whole-number pattern, a date as type date, a password as type password", () => {
    expect(kampoElement).toContain('control.type = kind === "number" ? "text" : kind;');
    expect(kampoElement).toContain('control.setAttribute("inputmode", "numeric")');
    expect(kampoElement).toContain('control.setAttribute("pattern", "-?[0-9]+")');
    expect(kampoElement).not.toContain('control.type = "number"');
    expect(kampoElement).toContain('for (const attribute of ["autocomplete", "min", "max"])');
    expect(kampoElement).toContain("control.setAttribute(attribute, given)");
  });

  it("is the form's validity: required, the whole number and its bounds, the platform's date; the error slot's text is the message", () => {
    expect(kampoElement).toContain("flags = { valueMissing: true }");
    expect(kampoElement).toContain("rangeUnderflow");
    expect(kampoElement).toContain("rangeOverflow");
    expect(kampoElement).toContain("patternMismatch");
    expect(kampoElement).toContain("#errorText()");
    expect(kampoElement).toContain("formResetCallback()");
  });

  it("sends the form with Enter, once, like a native input (O-7)", () => {
    expect(kampoElement).toContain('if (event.key !== "Enter" || !KEYS.includes("Enter")) return;');
    expect(kampoElement).toContain("form.requestSubmit()");
    // Only the field listens for Enter: the select keeps the platform's keys (Spec 010 ④).
    expect(files["eroj/src/generated/fm-elektilo.ts"] ?? "").not.toContain('event.key !== "Enter"');
  });

  it("changes nothing in the stylesheet: no kind keys a part", () => {
    expect(kampoStyles).not.toContain("data-kind");
    expect(kampoStyles).not.toContain("password");
  });
});

// Spec 011 ① (plan ① D-09): the empty option of the select. With empty-label the first option is
// a real one — the value "", the text of empty-label, chosen while nothing else is, never disabled
// — and there is no prompt beside it: 'Alle' appears once (QA L6 of Arkitekturo, point 4).
describe("Web Component Celo for the elektilo of Spec 011 ① (empty-label)", () => {
  const elektiloElement = files["eroj/src/generated/fm-elektilo.ts"] ?? "";

  it("writes the empty option first, selectable, and leaves the prompt out while empty-label is set", () => {
    expect(elektiloElement).toContain('const emptyLabel = this.propValue("empty-label")');
    expect(elektiloElement).toContain("prompt: false");
    expect(elektiloElement).toContain("element.disabled = option.prompt;");
    expect(elektiloElement).toContain('typeof emptyLabel === "string" && emptyLabel !== ""');
  });

  it('the chosen empty option is the form value "", not nothing', () => {
    expect(elektiloElement).toContain(
      'this.#internals.setFormValue(chosen === -1 ? (empty ? "" : null)',
    );
  });
});

// Spec 011 ② (plan ② D-11): the text area. The field of the kampo — label with the mark of a
// required area, help and error below — around the platform's own textarea: rows as its height,
// vertical resizing only (structure), kind code in the code typography without the platform's
// spelling check; form-associated like the kampo (required keeps the form from being sent); Enter
// writes a line and sends nothing (the Skemo names no key).
describe("Web Component Celo for the tekstareo (Spec 011 ②)", () => {
  const styles = files["eroj/src/generated/tekstareo.styles.ts"] ?? "";
  const element = files["eroj/src/generated/fm-tekstareo.ts"] ?? "";
  const css = JSON.parse(
    /export const TEKSTAREO_CSS = (".*");/s.exec(styles)?.[1] ?? '""',
  ) as string;
  const templates = (source: string) =>
    [...source.matchAll(/`(<[^`]*)`/g)].map((match) => match[1] ?? "");
  const parts = (source: string) =>
    templates(source).flatMap((t) => [...t.matchAll(/part="([a-z-]+)"/g)].map((m) => m[1]));

  it("renders the field of the kampo around a native textarea", () => {
    expect(parts(element)).toEqual(["field", "label", "required-mark", "control", "help", "error"]);
    expect(element).toContain('<textarea part="control" id="control"></textarea>');
    expect(element).toContain('<label part="label" for="control">');
    expect(element).toContain("static formAssociated = true;");
    expect(element).toContain('customElements.define("fm-tekstareo", FmTekstareo)');
    expect(element).not.toContain("<input");
  });

  it("writes rows, spells code without the spelling check, is the form's value and validity", () => {
    expect(element).toContain('control.setAttribute("rows"');
    expect(element).toContain('control.setAttribute("spellcheck", "false")');
    expect(element).toContain("flags = { valueMissing: true }");
    expect(element).toContain("formResetCallback()");
    // No Enter of its own: a line break is the textarea's; the Skemo names no key.
    expect(element).not.toContain('event.key !== "Enter"');
  });

  it("keys the typography of the text by kind and size, resizes vertically only, has no height of its own", () => {
    expect(css).toContain(
      ':where([part="field"][data-kind="code"][data-size="medium"]) [part="control"] {\n  font-family: var(--fm-typography-code-font-family);',
    );
    expect(css).toContain(
      ':where([part="field"][data-kind="text"][data-size="small"]) [part="control"] {\n  font-family: var(--fm-typography-body-2-font-family);',
    );
    expect(css).toContain("resize: vertical;");
    expect(css).not.toContain("min-block-size");
    expect(css).not.toContain("[readonly]");
  });

  it("keeps every design property a token and logical (Art. X gate 1)", () => {
    expect(componentCssIssues("tekstareo.css", css)).toEqual([]);
    expect(cssPhysicalPropertyIssues("tekstareo.css", css)).toEqual([]);
  });

  it("states kind and size and the five states in the stylesheet inventory (parity)", () => {
    const inventory = stylesheetInventory(styles);
    expect(inventory.props).toEqual({ kind: ["text", "code"], size: ["small", "medium", "large"] });
    expect([...inventory.states].sort()).toEqual(["disabled", "focus", "hover", "invalid", "rest"]);
  });
});

// Spec 011 ② (plan ② D-12, E9, G4): the dialog. The platform's own <dialog>, opened with showModal
// (focus trap and Escape are the platform's), named by its heading and described by its message;
// the reason is a tekstareo the dialog shows itself; the actions are slotted butono — the one with
// emphasis high confirms, every other cancels; confirm is cancelable and keeps the dialog open
// when prevented; a required reason or an invalid field in the content locks the confirmation.
describe("Web Component Celo for the dialogo (Spec 011 ②)", () => {
  const styles = files["eroj/src/generated/dialogo.styles.ts"] ?? "";
  const element = files["eroj/src/generated/fm-dialogo.ts"] ?? "";
  const css = JSON.parse(/export const DIALOGO_CSS = (".*");/s.exec(styles)?.[1] ?? '""') as string;
  const templates = (source: string) =>
    [...source.matchAll(/`(<[^`]*)`/g)].map((match) => match[1] ?? "");
  const parts = (source: string) =>
    templates(source).flatMap((t) => [...t.matchAll(/part="([a-z-]+)"/g)].map((m) => m[1]));

  it("renders the platform's dialog as the control, with heading, message, content, the reason area and the actions", () => {
    expect(parts(element)).toEqual([
      "control",
      "heading",
      "message",
      "content",
      "reason",
      "actions",
    ]);
    expect(element).toContain(
      '<dialog part="control" aria-modal="true" aria-labelledby="heading" aria-describedby="message">',
    );
    // Spec 014 ③: the heading is a composed titolo (level 2, the dialog's own document).
    expect(element).toContain(
      '<fm-titolo part="heading" id="heading" level="2" size="headline-4"><slot></slot></fm-titolo>',
    );
    // Spec 014 ① (reason-help, plan ① D-02): the help of the reason stands under the field, handed
    // to the composed tekstareo as its help (it describes the control, aria-describedby).
    expect(element).toContain(
      '<fm-tekstareo part="reason" rows="3"><slot name="reason"></slot><slot name="reason-help" slot="help"></slot></fm-tekstareo>',
    );
    expect(element).toContain('<slot name="actions"></slot>');
    expect(element).toContain("static formAssociated = false;");
    expect(element).toContain('customElements.define("fm-dialogo", FmDialogo)');
  });

  it("opens with showModal, closes on cancel, says confirm with the reason and keeps open when prevented", () => {
    expect(element).toContain("dialog.showModal()");
    expect(element).toContain(
      'new CustomEvent("confirm", { bubbles: true, cancelable: true, detail: { reason',
    );
    expect(element).toContain('new Event("cancel", { bubbles: true })');
    expect(element).toContain('action.getAttribute("emphasis") === "high"');
    expect(element).toContain(":invalid");
  });

  it("styles the surface from tokens: width by size, backdrop, shadow, radius and border; the reason only with a reason", () => {
    expect(css).toContain(
      ':where([part="control"][data-size="small"]) {\n  inline-size: var(--fm-size-container-small);',
    );
    expect(css).toContain(
      ':where([part="control"])::backdrop {\n  background-color: var(--fm-color-backdrop);\n}',
    );
    expect(css).toContain("box-shadow: var(--fm-elevation-shadow-modal);");
    expect(css).toContain("border-radius: var(--fm-radius-role-surface);");
    expect(css).toContain("border-color: var(--fm-color-border-default);");
    expect(css).toContain(
      ':where([part="control"]) [part="heading"] {\n  color: var(--fm-color-text-default);\n  font-family: var(--fm-typography-headline-4-font-family);',
    );
    expect(css).toContain(
      ':where([part="control"][data-reason="none"]) [part="reason"] { display: none; }',
    );
    expect(css).toContain(
      ':where([part="control"][data-reason="required"]) [part="reason"] {\n  min-block-size: var(--fm-size-control-large);\n}',
    );
    expect(css).toContain("justify-content: flex-end");
  });

  it("keeps every design property a token and logical (Art. X gate 1)", () => {
    expect(componentCssIssues("dialogo.css", css)).toEqual([]);
    expect(cssPhysicalPropertyIssues("dialogo.css", css)).toEqual([]);
  });

  it("states size and reason and the one state rest in the stylesheet inventory (parity)", () => {
    const inventory = stylesheetInventory(styles);
    expect(inventory.props).toEqual({
      size: ["small", "medium"],
      reason: ["none", "optional", "required"],
    });
    expect([...inventory.states]).toEqual(["rest"]);
  });
});

// Spec 011 ③ (plan ③ D-08): the badge. Static text: a span as the control, no role attribute
// (role generic is the span's own), the label in it and the long form in a visually hidden span
// (clip-path, no size literal); every design value a token; intent and size key the parts; the
// height is a minimum (min-block-size), so the text may grow the badge.
describe("Web Component Celo for the insigno (Spec 011 ③)", () => {
  const styles = files["eroj/src/generated/insigno.styles.ts"] ?? "";
  const element = files["eroj/src/generated/fm-insigno.ts"] ?? "";
  const css = JSON.parse(/export const INSIGNO_CSS = (".*");/s.exec(styles)?.[1] ?? '""') as string;
  const templates = (source: string) =>
    [...source.matchAll(/`(<[^`]*)`/g)].map((match) => match[1] ?? "");
  const parts = (source: string) =>
    templates(source).flatMap((t) => [...t.matchAll(/part="([a-z-]+)"/g)].map((m) => m[1]));

  it("renders a span without a role as the control, the label and the hidden description in it", () => {
    expect(parts(element)).toEqual(["control", "description"]);
    expect(element).toContain('<span part="control"><slot></slot>');
    expect(element).toContain(
      '<span part="description" class="fm-hidden"><slot name="description"></slot></span>',
    );
    expect(element).not.toContain('role="generic"');
    expect(element).toContain("static formAssociated = false;");
    expect(element).toContain('customElements.define("fm-insigno", FmInsigno)');
  });

  it("keys surface, border and text by intent, the box by size, with the pill radius and no cursor", () => {
    expect(css).toContain(
      ':where([part="control"][data-intent="danger"]) {\n  background-color: var(--fm-color-status-danger-subtle);',
    );
    expect(css).toContain("border-radius: var(--fm-radius-role-pill);");
    expect(css).toContain("min-block-size: var(--fm-size-icon-medium);");
    expect(css).toContain("padding-inline: var(--fm-spacing-small);");
    expect(css).toContain("white-space: nowrap;");
    expect(css).not.toContain("cursor: pointer");
    // The hidden text (G4): clipped, never sized with a literal.
    expect(css).toContain(
      ".fm-hidden { position: absolute; clip-path: inset(50%); overflow: hidden; white-space: nowrap; }",
    );
  });

  it("keeps every design property a token and logical (Art. X gate 1)", () => {
    expect(componentCssIssues("insigno.css", css)).toEqual([]);
    expect(cssPhysicalPropertyIssues("insigno.css", css)).toEqual([]);
  });

  it("states intent and size and the one state rest in the stylesheet inventory (parity)", () => {
    const inventory = stylesheetInventory(styles);
    expect(inventory.props).toEqual({
      intent: ["neutral", "info", "success", "warning", "danger"],
      size: ["small", "medium"],
    });
    expect(inventory.states).toEqual(["rest"]);
  });
});

// Spec 011 ③ (plan ③ D-09, G4): the notice. A live region as the control — role status, alert
// for intent danger — with the kind as a visually hidden word before the heading (a11y.texts
// keyed by intent-<value>), heading, message, details and actions, and a dismiss butono the
// notice shows itself when dismissible, named by a11y.texts.dismissible; dismiss is cancelable,
// then the notice hides itself and the focus goes to the next focusable element.
describe("Web Component Celo for the avizo (Spec 011 ③)", () => {
  const styles = files["eroj/src/generated/avizo.styles.ts"] ?? "";
  const element = files["eroj/src/generated/fm-avizo.ts"] ?? "";
  const css = JSON.parse(/export const AVIZO_CSS = (".*");/s.exec(styles)?.[1] ?? '""') as string;
  const templates = (source: string) =>
    [...source.matchAll(/`(<[^`]*)`/g)].map((match) => match[1] ?? "");
  const parts = (source: string) =>
    templates(source).flatMap((t) => [...t.matchAll(/part="([a-z-]+)"/g)].map((m) => m[1]));

  it("renders a status region with the kind word, heading, message, details, actions and the dismiss butono", () => {
    expect(parts(element)).toEqual([
      "control",
      "icon",
      "heading",
      "message",
      "details",
      "actions",
      "dismiss",
    ]);
    expect(element).toContain('<div part="control" role="status">');
    expect(element).toContain('<span id="fm-texts" class="fm-hidden"></span>');
    expect(element).toContain('<span part="message" id="message"><slot></slot></span>');
    expect(element).toContain('<fm-butono part="dismiss" emphasis="low" size="small" hidden>');
    expect(element).toContain(
      'control.setAttribute("role", intent === "danger" ? "alert" : "status")',
    );
    expect(element).toContain('new CustomEvent("dismiss"');
    expect(element).toContain("static formAssociated = false;");
    expect(element).toContain('customElements.define("fm-avizo", FmAvizo)');
  });

  it("keys the surface and the accent by intent; the accent is the border at the start, the box padding on every side", () => {
    expect(css).toContain(
      ':where([part="control"][data-intent="warning"]) {\n  background-color: var(--fm-color-status-warning-weak);',
    );
    expect(css).toContain("border-inline-start-color: var(--fm-color-status-danger-border);");
    expect(css).toContain("border-inline-start-width: var(--fm-border-width-strong);");
    expect(css).toContain("padding: var(--fm-spacing-medium);");
    expect(css).toContain(":host([hidden]) { display: none; }");
    expect(css).toContain(':where([part="dismiss"][hidden]) { display: none; }');
    expect(css).toContain("overflow-wrap: anywhere;");
  });

  it("keeps every design property a token and logical (Art. X gate 1)", () => {
    expect(componentCssIssues("avizo.css", css)).toEqual([]);
    expect(cssPhysicalPropertyIssues("avizo.css", css)).toEqual([]);
  });

  it("states intent and the one state rest in the stylesheet inventory (parity)", () => {
    const inventory = stylesheetInventory(styles);
    expect(inventory.props).toEqual({ intent: ["info", "success", "warning", "danger"] });
    expect(inventory.states).toEqual(["rest"]);
  });
});

// Spec 011 ③ (plan ③ D-10, G4): the loading and empty state. A status region, busy while
// loading (aria-busy), with the indicator (a vector arc the element turns with the motion roles
// of the part motion: the duration and easing it reads from its own transition properties, so
// reduced motion stops it), the text and the actions of the empty state; the dashed border comes
// from the part property stroke (border-style), none while loading.
describe("Web Component Celo for the plenstato (Spec 011 ③)", () => {
  const styles = files["eroj/src/generated/plenstato.styles.ts"] ?? "";
  const element = files["eroj/src/generated/fm-plenstato.ts"] ?? "";
  const css = JSON.parse(
    /export const PLENSTATO_CSS = (".*");/s.exec(styles)?.[1] ?? '""',
  ) as string;
  const templates = (source: string) =>
    [...source.matchAll(/`(<[^`]*)`/g)].map((match) => match[1] ?? "");
  const parts = (source: string) =>
    templates(source).flatMap((t) => [...t.matchAll(/part="([a-z-]+)"/g)].map((m) => m[1]));

  it("renders a status region with the indicator, the text and the actions; busy while loading", () => {
    expect(parts(element)).toEqual(["control", "indicator", "text", "actions"]);
    expect(element).toContain('<div part="control" role="status">');
    expect(element).toContain('<span part="indicator" aria-hidden="true">');
    expect(element).toContain('control.setAttribute("aria-busy", String(kind === "loading"))');
    expect(element).toContain("indicator.animate(");
    expect(element).toContain("iterations: Number.POSITIVE_INFINITY");
    expect(element).toContain("static formAssociated = false;");
    expect(element).toContain('customElements.define("fm-plenstato", FmPlenstato)');
  });

  it("writes the stroke of the border by kind, hides the indicator when empty, binds the motion roles", () => {
    expect(css).toContain(
      ':where([part="control"][data-kind="empty"]) {\n  border-style: var(--fm-stroke-dashed);',
    );
    expect(css).toContain(':where([part="control"][data-kind="loading"]) {\n  border-style: none;');
    expect(css).toContain(
      ':where([part="control"][data-kind="empty"]) [part="indicator"] { display: none; }',
    );
    expect(css).toContain("transition-duration: var(--fm-motion-duration-slow);");
    expect(css).toContain("transition-timing-function: var(--fm-motion-easing-standard);");
    expect(css).toContain("border-radius: var(--fm-radius-role-surface);");
    expect(css).not.toContain("background-color");
  });

  it("keeps every design property a token and logical (Art. X gate 1)", () => {
    expect(componentCssIssues("plenstato.css", css)).toEqual([]);
    expect(cssPhysicalPropertyIssues("plenstato.css", css)).toEqual([]);
  });

  it("states kind and the one state rest in the stylesheet inventory (parity)", () => {
    const inventory = stylesheetInventory(styles);
    expect(inventory.props).toEqual({ kind: ["loading", "empty"] });
    expect(inventory.states).toEqual(["rest"]);
  });
});

// Spec 011 ④ (plan ④ D-08): the meter. A div with role meter as the control, named by its label
// and described by its value text (aria-valuetext too); aria-valuenow only while the value is
// known; the fill a child of the track whose inline size is the share (set by the element, a
// ratio, no design value); an unknown value shows no fill and gives the track the dashed edge of
// the part unknown.
describe("Web Component Celo for the mezurilo (Spec 011 ④)", () => {
  const styles = files["eroj/src/generated/mezurilo.styles.ts"] ?? "";
  const element = files["eroj/src/generated/fm-mezurilo.ts"] ?? "";
  const css = JSON.parse(
    /export const MEZURILO_CSS = (".*");/s.exec(styles)?.[1] ?? '""',
  ) as string;
  const templates = (source: string) =>
    [...source.matchAll(/`(<[^`]*)`/g)].map((match) => match[1] ?? "");
  const parts = (source: string) =>
    templates(source).flatMap((t) => [...t.matchAll(/part="([a-z-]+)"/g)].map((m) => m[1]));

  it("renders a meter region with label, track, fill and value text", () => {
    expect(parts(element)).toEqual(["control", "label", "track", "fill", "value-text"]);
    expect(element).toContain(
      '<div part="control" role="meter" aria-labelledby="label" aria-describedby="value-text">',
    );
    expect(element).toContain('control.setAttribute("aria-valuetext"');
    expect(element).toContain('control.setAttribute("aria-valuenow"');
    expect(element).toContain('control.setAttribute("aria-valuemin"');
    expect(element).toContain('control.toggleAttribute("data-unknown"');
    expect(element).toContain("static formAssociated = false;");
    expect(element).toContain('customElements.define("fm-mezurilo", FmMezurilo)');
  });

  it("fills the track with the colour of intent, keeps the track's height and pill, draws the dashed edge only when unknown", () => {
    expect(css).toContain(
      ':where([part="control"][data-intent="success"]) [part="fill"] {\n  background-color: var(--fm-color-status-success-border);',
    );
    expect(css).toContain(
      ':where([part="control"]) [part="track"] {\n  background-color: var(--fm-color-background-sunken);',
    );
    expect(css).toContain("min-block-size: var(--fm-spacing-medium);");
    expect(css).toContain(
      ':where([part="control"][data-unknown]) [part="track"] {\n  border-style: var(--fm-stroke-dashed);',
    );
    expect(css).toContain(
      ':where([part="control"][data-unknown]) [part="fill"] { display: none; }',
    );
  });

  it("keeps every design property a token and logical (Art. X gate 1)", () => {
    expect(componentCssIssues("mezurilo.css", css)).toEqual([]);
    expect(cssPhysicalPropertyIssues("mezurilo.css", css)).toEqual([]);
  });

  it("states intent and the one state rest in the stylesheet inventory (parity)", () => {
    const inventory = stylesheetInventory(styles);
    expect(inventory.props).toEqual({ intent: ["neutral", "success", "warning", "danger"] });
    expect(inventory.states).toEqual(["rest"]);
  });
});

// Spec 011 ④ (plan ④ D-09, E10): the table. The Ero styles and extends the platform's own table
// in the light DOM: a second stylesheet, scoped to the host, is adopted by the document; the
// combination stands on the host (data-density); the shadow holds the scroll region (role region,
// focusable, named by the caption) around the slot of the table. The element writes the caption
// from its default slot, wraps sortable headers (data-sort) in buttons with aria-sort, says
// sort-change, and shows the empty slot as a plenstato over all columns when there are no rows.
describe("Web Component Celo for the tabelo (Spec 011 ④)", () => {
  const styles = files["eroj/src/generated/tabelo.styles.ts"] ?? "";
  const element = files["eroj/src/generated/fm-tabelo.ts"] ?? "";
  const css = JSON.parse(
    /export const TABELO_CSS = ("(?:[^"\\]|\\.)*");/.exec(styles)?.[1] ?? '""',
  ) as string;
  const light = JSON.parse(
    /export const TABELO_LIGHT_CSS = ("(?:[^"\\]|\\.)*");/.exec(styles)?.[1] ?? '""',
  ) as string;

  it("renders the region around the slotted table, adopts the light stylesheet on the document, sorts and shows the empty state", () => {
    expect(element).toContain(
      '<div part="region" role="region" tabindex="0"><slot name="content"></slot></div>',
    );
    expect(element).toContain("document.adoptedStyleSheets");
    expect(element).toContain('new CustomEvent("sort-change"');
    expect(element).toContain('setAttribute("aria-sort"');
    expect(element).toContain('"caption"');
    expect(element).toContain("fm-plenstato");
    expect(element).toContain("static formAssociated = false;");
    expect(element).toContain('customElements.define("fm-tabelo", FmTabelo)');
  });

  it("writes the table's parts scoped to the host in the light stylesheet: head, cells by density, row headers, sort buttons by state", () => {
    expect(light).toContain(
      "fm-tabelo > table > thead th {\n  background-color: var(--fm-color-background-sunken);",
    );
    expect(light).toContain(
      'fm-tabelo[data-density="compact"] > table :is(td, th) {\n  padding-inline: var(--fm-spacing-small);',
    );
    expect(light).toContain("min-block-size: var(--fm-size-control-large);");
    expect(light).toContain(
      "fm-tabelo > table > tbody th {\n  font-family: var(--fm-typography-label-1-font-family);",
    );
    expect(light).toContain(
      "fm-tabelo > table > thead th > button:hover {\n  background-color: var(--fm-color-action-tertiary-hover);",
    );
    expect(light).toContain(
      "fm-tabelo > table > thead th > button:focus-visible {\n  outline-width: var(--fm-focus-ring-width);",
    );
    expect(light).toContain("border-block-end-color: var(--fm-color-border-subtle);");
    expect(light).toContain("fm-tabelo .fm-hidden {");
    expect(light).toContain("font-variant-numeric: tabular-nums;");
    // The region keeps its border and radius in the shadow sheet.
    expect(css).toContain(
      ':where([part="region"]) {\n  border-radius: var(--fm-radius-role-surface);',
    );
  });

  it("keeps every design property a token and logical in both sheets (Art. X gate 1)", () => {
    expect(componentCssIssues("tabelo.css", css)).toEqual([]);
    expect(componentCssIssues("tabelo.light.css", light)).toEqual([]);
    expect(cssPhysicalPropertyIssues("tabelo.light.css", light)).toEqual([]);
  });

  it("states density and the states rest, hover and focus in the stylesheet inventory (parity)", () => {
    const inventory = stylesheetInventory(styles);
    expect(inventory.props).toEqual({ density: ["comfortable", "compact"] });
    expect([...inventory.states].sort()).toEqual(["focus", "hover", "rest"]);
  });
});

// Spec 011 ④ (plan ④ D-10, E10): the key-value list. The platform's own dl in the light DOM,
// styled by a host-scoped stylesheet the document adopts: terms and values, the grid of columns or
// the stack; an empty dd shows a dash and carries the a11y text entries-empty clipped from sight.
describe("Web Component Celo for the atributlisto (Spec 011 ④)", () => {
  const styles = files["eroj/src/generated/atributlisto.styles.ts"] ?? "";
  const element = files["eroj/src/generated/fm-atributlisto.ts"] ?? "";
  const css = JSON.parse(
    /export const ATRIBUTLISTO_CSS = ("(?:[^"\\]|\\.)*");/.exec(styles)?.[1] ?? '""',
  ) as string;
  const light = JSON.parse(
    /export const ATRIBUTLISTO_LIGHT_CSS = ("(?:[^"\\]|\\.)*");/.exec(styles)?.[1] ?? '""',
  ) as string;

  it("renders the list around the slotted dl, adopts the light stylesheet, names itself and fills empty values", () => {
    expect(element).toContain('<div part="list"><slot></slot></div>');
    expect(element).toContain("document.adoptedStyleSheets");
    // The key is built from the default slot's name: <slot>-empty (plan ④ D-05).
    expect(element).toContain("-empty");
    expect(element).toContain('setAttribute("aria-label"');
    expect(element).toContain("static formAssociated = false;");
    expect(element).toContain('customElements.define("fm-atributlisto", FmAtributlisto)');
  });

  it("writes terms, values and the grid scoped to the host; layout keys the column gap", () => {
    expect(light).toContain("fm-atributlisto > dl > dt {\n  color: var(--fm-color-text-muted);");
    expect(light).toContain("fm-atributlisto > dl > dd {\n  color: var(--fm-color-text-default);");
    expect(light).toContain(
      'fm-atributlisto[data-layout="columns"] > dl {\n  column-gap: var(--fm-spacing-large);',
    );
    expect(light).toContain(
      'fm-atributlisto[data-layout="columns"] > dl { grid-template-columns: max-content auto; }',
    );
    expect(light).toContain(
      'fm-atributlisto[data-layout="stacked"] > dl { grid-template-columns: auto; }',
    );
    // Spec 014 ① (layout auto, plan ① D-03): the wide case is the columns case in the sheet; the
    // element resolves auto to columns or stacked by the width of its container.
    expect(light).toContain(
      'fm-atributlisto[data-layout="auto"] > dl {\n  column-gap: var(--fm-spacing-large);',
    );
    expect(light).toContain("fm-atributlisto .fm-hidden {");
    expect(componentCssIssues("atributlisto.css", css)).toEqual([]);
    expect(componentCssIssues("atributlisto.light.css", light)).toEqual([]);
  });

  it("states layout and the one state rest in the stylesheet inventory (parity)", () => {
    const inventory = stylesheetInventory(styles);
    expect(inventory.props).toEqual({ layout: ["columns", "stacked", "auto"] });
    expect(inventory.states).toEqual(["rest"]);
  });

  it("Spec 014 ①: layout auto measures the container against the width the Uzo names (size.container.small) and writes columns or stacked", () => {
    // The threshold is the token of the Uzo (columns-from), read as the custom property it is
    // projected to; a container query takes no var(), so the element observes its own inline size.
    expect(element).toContain('const COLUMNS_FROM = "--fm-size-container-small";');
    expect(element).toContain("ResizeObserver");
    expect(element).toContain('"auto"');
    expect(element).toMatch(/data-layout/);
    expect(element).toContain("#autoLayout(");
  });
});

// Spec 011 ⑤ (plan ⑤ D-07, E10): the navigation. The platform's own links stay in the light DOM;
// the shadow holds a nav landmark named by the label prop around the default slot, and the
// document adopts a host-scoped stylesheet (the light host of ④). The element marks the item of
// the current page with aria-current and shows a count as a composed insigno; the current item
// differs by more than colour (its underline, link-not-color-only).
describe("Web Component Celo for the navigado (Spec 011 ⑤)", () => {
  const styles = files["eroj/src/generated/navigado.styles.ts"] ?? "";
  const element = files["eroj/src/generated/fm-navigado.ts"] ?? "";
  const css = JSON.parse(
    /export const NAVIGADO_CSS = ("(?:[^"\\]|\\.)*");/.exec(styles)?.[1] ?? '""',
  ) as string;
  const light = JSON.parse(
    /export const NAVIGADO_LIGHT_CSS = ("(?:[^"\\]|\\.)*");/.exec(styles)?.[1] ?? '""',
  ) as string;

  it("renders a nav landmark around the slotted links, adopts the light stylesheet, marks the current page and composes the count", () => {
    expect(element).toContain('<nav part="list"><slot></slot></nav>');
    expect(element).toContain("document.adoptedStyleSheets");
    expect(element).toContain('setAttribute("aria-current", "page")');
    expect(element).toContain('setAttribute("aria-label"');
    expect(element).toContain("fm-insigno");
    expect(element).toContain('"data-count"');
    expect(element).toContain("static formAssociated = false;");
    expect(element).toContain('customElements.define("fm-navigado", FmNavigado)');
  });

  it("writes the items scoped to the host in the light stylesheet: fill by current and state, text by current, the underline of the current page, the box", () => {
    expect(light).toContain(
      "fm-navigado > a:not([aria-current]) {\n  background-color: var(--fm-color-navigation-rest);",
    );
    expect(light).toContain(
      "fm-navigado > a:not([aria-current]):hover {\n  background-color: var(--fm-color-navigation-hover);",
    );
    expect(light).toContain(
      "fm-navigado > a[aria-current] {\n  background-color: var(--fm-color-navigation-selected);",
    );
    expect(light).toContain("color: var(--fm-color-navigation-text-selected);");
    expect(light).toContain("color: var(--fm-color-navigation-text-rest);");
    expect(light).toContain("text-decoration-thickness: var(--fm-border-width-strong);");
    expect(light).toContain("text-decoration-line: none;");
    // Spec 014 ① (Gewicht, plan ① D-01): the current item is heavier — its weight bound to
    // font.weight.semibold; the others keep the weight of their role (none writes nothing).
    expect(light).toContain("font-weight: var(--fm-font-weight-semibold);");
    expect(light).toMatch(
      /fm-navigado > a\[aria-current\] \{\n(?: {2}[^\n]+\n)* {2}font-weight: var\(--fm-font-weight-semibold\);/,
    );
    expect(
      /fm-navigado > a:not\(\[aria-current\]\) \{\n(?: {2}[^\n]+\n)*\}/.exec(light)?.[0] ?? "",
    ).not.toContain("font-weight: var(--fm-font-weight-semibold)");
    expect(light).toContain("min-block-size: var(--fm-size-target-min);");
    expect(light).toContain("border-radius: var(--fm-radius-role-control);");
    expect(light).toContain(
      "fm-navigado > a:focus-visible {\n  outline-width: var(--fm-focus-ring-width);",
    );
    // The gap between the items is the nav's, in the shadow; vertical stacks them.
    expect(css).toContain(':where([part="list"]) {\n  gap: var(--fm-spacing-xsmall);');
    expect(css).toContain(
      ':where([part="list"][data-orientation="vertical"]) { flex-direction: column;',
    );
  });

  it("keeps every design property a token and logical in both sheets (Art. X gate 1)", () => {
    expect(componentCssIssues("navigado.css", css)).toEqual([]);
    expect(componentCssIssues("navigado.light.css", light)).toEqual([]);
    expect(cssPhysicalPropertyIssues("navigado.light.css", light)).toEqual([]);
  });

  it("states no styled prop and the states rest, hover and focus in the stylesheet inventory (parity)", () => {
    const inventory = stylesheetInventory(styles);
    expect(inventory.props).toEqual({});
    expect([...inventory.states].sort()).toEqual(["focus", "hover", "rest"]);
  });
});

// Spec 011 ⑤ (plan ⑤ D-08): the tabs. A tablist named by its label, one row with role tab per
// child of the default slot (manual slot assignment, as the radio group), the selected tab's state
// aria-selected (E7), one tab stop that the arrows, Home and End move; selection follows focus and
// says select; the panel is a tabpanel labelled by the selected tab. The indicator of the selected
// tab is its block-end edge (never colour alone).
describe("Web Component Celo for the langetaro (Spec 011 ⑤)", () => {
  const styles = files["eroj/src/generated/langetaro.styles.ts"] ?? "";
  const element = files["eroj/src/generated/fm-langetaro.ts"] ?? "";
  const css = JSON.parse(
    /export const LANGETARO_CSS = ("(?:[^"\\]|\\.)*");/.exec(styles)?.[1] ?? '""',
  ) as string;

  it("renders the tablist, the rows with role tab, the panel; selection follows focus and says select", () => {
    expect(element).toContain('<div part="control" role="tablist"></div>');
    expect(element).toContain(
      '<div part="panel" role="tabpanel" tabindex="0"><slot name="panel"></slot></div>',
    );
    expect(element).toContain('role="tab"');
    expect(element).toContain('setAttribute("aria-selected"');
    expect(element).toContain('new CustomEvent("select"');
    expect(element).toContain('slotAssignment: "manual"');
    expect(element).toContain("static formAssociated = false;");
    expect(element).toContain('customElements.define("fm-langetaro", FmLangetaro)');
  });

  it("styles the tab by state and active, the indicator as the selected tab's edge, the list's line, the panel", () => {
    expect(css).toContain(
      ':where([part="control"] [part="tab"][aria-selected="true"]) {\n  color: var(--fm-color-text-default);',
    );
    expect(css).toContain(
      ':where([part="control"] [part="tab"][aria-selected="false"]) {\n  color: var(--fm-color-text-subtle);',
    );
    expect(css).toContain(
      ':where([part="control"] [part="tab"]:hover) {\n  background-color: var(--fm-color-action-tertiary-hover);',
    );
    expect(css).toContain(
      ':where([part="control"] [part="tab"][aria-disabled="true"]) {\n  background-color: var(--fm-color-action-tertiary-disabled);',
    );
    expect(css).toContain("border-block-end-width: var(--fm-border-width-strong);");
    // Spec 014 ① (Gewicht, plan ① D-01): the active tab is heavier — weight by active.
    expect(css).toMatch(
      /:where\(\[part="control"\] \[part="tab"\]\[aria-selected="true"\]\) \{\n(?: {2}[^\n]+\n)* {2}font-weight: var\(--fm-font-weight-semibold\);/,
    );
    expect(
      /:where\(\[part="control"\] \[part="tab"\]\[aria-selected="false"\]\) \{\n(?: {2}[^\n]+\n)*\}/.exec(
        css,
      )?.[0] ?? "",
    ).not.toContain("font-weight: var(--fm-font-weight-semibold)");
    // F-7: the indicator is the selected text colour, not the navigation background.
    expect(css).toContain("border-block-end-color: var(--fm-color-navigation-text-selected);");
    expect(css).toContain("border-block-end-style: none;");
    expect(css).toContain("border-block-end-color: var(--fm-color-border-default);");
    // The panel is text of the Ero (its colour first, as the Skemo orders the properties).
    expect(css).toContain(
      ':where([part="panel"]) {\n  color: var(--fm-color-text-default);\n  padding-inline: var(--fm-spacing-medium);',
    );
    expect(css).toContain(
      ':where([part="control"] [part="tab"]:focus-visible) {\n  outline-width: var(--fm-focus-ring-width);',
    );
    expect(css).toContain("min-block-size: var(--fm-size-target-min);");
  });

  it("keeps every design property a token and logical (Art. X gate 1)", () => {
    expect(componentCssIssues("langetaro.css", css)).toEqual([]);
    expect(cssPhysicalPropertyIssues("langetaro.css", css)).toEqual([]);
  });

  it("states no styled prop and the states rest, hover, focus and disabled in the stylesheet inventory (parity)", () => {
    const inventory = stylesheetInventory(styles);
    expect(inventory.props).toEqual({});
    expect([...inventory.states].sort()).toEqual(["disabled", "focus", "hover", "rest"]);
  });
});

// Spec 014 ② (section ②, plan ② D-05): the ikono — a span with role img where it is named, hidden
// from assistive technology where it is decorative; the glyph a mask of the Aspekto's SVG
// (--fm-ikono-<name>, projected by the CSS Celo) in the current colour, sized by the box, mirrored
// in right-to-left writing where the Ikonaro says the direction carries meaning.
describe("Web Component Celo for the ikono (Spec 014 ②)", () => {
  const styles = files["eroj/src/generated/ikono.styles.ts"] ?? "";
  const element = files["eroj/src/generated/fm-ikono.ts"] ?? "";
  const css = JSON.parse(
    /export const IKONO_CSS = ("(?:[^"\\]|\\.)*");/.exec(styles)?.[1] ?? '""',
  ) as string;

  it("renders the glyph in a span, names it by the label as an image, hides it decorative, knows which names mirror", () => {
    expect(element).toContain('<span part="glyph"></span>');
    expect(element).not.toContain('part="control"');
    expect(element).toContain('"img"');
    expect(element).toContain('"aria-hidden"');
    expect(element).toContain("--fm-ikono-");
    expect(element).toContain("IKONARO");
    expect(element).toContain('"chevron-right"');
    expect(element).toContain("static formAssociated = false;");
    expect(element).toContain('customElements.define("fm-ikono", FmIkono)');
  });

  it("masks the glyph with the Aspekto's picture in the current colour, sizes the box by the token, colours a status icon, mirrors in RTL", () => {
    expect(css).toContain("mask-image: var(--fm-ikono);");
    expect(css).toContain("background-color: currentcolor;");
    expect(css).toContain("inline-size: var(--fm-size-icon-medium);");
    expect(css).toContain("block-size: var(--fm-size-icon-small);");
    expect(css).toContain(
      ':where([part="glyph"][data-intent="danger"]) {\n  color: var(--fm-color-status-danger-text);',
    );
    // inherit is said: the neutral icon takes the colour of the text around it.
    expect(css).toContain(':where([part="glyph"][data-intent="neutral"]) {\n  color: inherit;');
    expect(css).toContain("scaleX(-1)");
    expect(componentCssIssues("ikono.css", css)).toEqual([]);
    expect(cssPhysicalPropertyIssues("ikono.css", css)).toEqual([]);
  });
});

// Spec 014 ② (plan ② D-06): the apartigilo — a div with role separator and its orientation, role
// none where decorative; its line the border of one edge, colour and width bound; a vertical
// line at least a control's height.
describe("Web Component Celo for the apartigilo (Spec 014 ②)", () => {
  const styles = files["eroj/src/generated/apartigilo.styles.ts"] ?? "";
  const element = files["eroj/src/generated/fm-apartigilo.ts"] ?? "";
  const css = JSON.parse(
    /export const APARTIGILO_CSS = ("(?:[^"\\]|\\.)*");/.exec(styles)?.[1] ?? '""',
  ) as string;

  it("renders a separator with its orientation, none where decorative", () => {
    expect(element).toContain('<div part="control"></div>');
    expect(element).toContain('"separator"');
    expect(element).toContain('"none"');
    expect(element).toContain('"aria-orientation"');
    expect(element).toContain('customElements.define("fm-apartigilo", FmApartigilo)');
  });

  it("draws the line as a border of one edge in the bound colour and width; vertical takes a control's height", () => {
    expect(css).toContain("border-color: var(--fm-color-border-subtle);");
    expect(css).toContain("border-width: var(--fm-border-width-default);");
    expect(css).toContain(
      ':where([part="control"][data-orientation="horizontal"]) { border-block-start-style: solid; }',
    );
    expect(css).toContain("border-inline-start-style: solid;");
    expect(css).toContain(
      ':where([part="control"][data-orientation="vertical"]) {\n  min-block-size: var(--fm-size-control-medium);',
    );
    expect(componentCssIssues("apartigilo.css", css)).toEqual([]);
    expect(cssPhysicalPropertyIssues("apartigilo.css", css)).toEqual([]);
  });
});

// Spec 014 ② (plan ② D-07): the saltligilo — the platform's link to a fragment of the page, hidden
// until it has the focus, then above everything (layer: z-index of elevation.layer.overlay) at
// the start of the page with its surface, shadow and ring; Enter moves the focus to the target.
describe("Web Component Celo for the saltligilo (Spec 014 ②)", () => {
  const styles = files["eroj/src/generated/saltligilo.styles.ts"] ?? "";
  const element = files["eroj/src/generated/fm-saltligilo.ts"] ?? "";
  const css = JSON.parse(
    /export const SALTLIGILO_CSS = ("(?:[^"\\]|\\.)*");/.exec(styles)?.[1] ?? '""',
  ) as string;

  it("renders a link to the fragment of `to`, with the default text of an empty label and the focus of the target", () => {
    expect(element).toContain('<a part="control"><slot></slot>');
    expect(element).toContain('"#"');
    expect(element).toContain("label-empty");
    expect(element).toContain('"tabindex"');
    expect(element).toContain("getElementById");
    expect(element).toContain('customElements.define("fm-saltligilo", FmSaltligilo)');
  });

  it("lies above the page on its layer, hidden until focus-visible, with surface, shadow and ring", () => {
    expect(css).toContain("z-index: var(--fm-elevation-layer-overlay);");
    expect(css).toContain("box-shadow: var(--fm-elevation-shadow-floating);");
    expect(css).toContain("background-color: var(--fm-color-background-raised);");
    expect(css).toContain("position: fixed;");
    expect(css).toContain(':where([part="control"]:not(:focus-visible)) { clip-path: inset(50%);');
    expect(css).toContain("outline-width: var(--fm-focus-ring-width);");
    expect(componentCssIssues("saltligilo.css", css)).toEqual([]);
    expect(cssPhysicalPropertyIssues("saltligilo.css", css)).toEqual([]);
  });
});

// Spec 014 ② (section ②, G3, G6): the signs the Eroj drew by hand become ikono: the chevron of the
// elektilo, the sort arrow of the tabelo (its name by the direction, no rotation), the status
// icon of the avizo (the part icon, one glyph per intent) and the cross of its dismiss butono.
describe("the Eroj draw their signs as ikono (Spec 014 ②)", () => {
  it("the elektilo's indicator holds an fm-ikono chevron-down in the size of the field", () => {
    const element = files["eroj/src/generated/fm-elektilo.ts"] ?? "";
    expect(element).toContain('<fm-ikono name="chevron-down"');
    expect(element).not.toContain("M1.9 5.7");
  });

  it("the tabelo's sort button holds an fm-ikono sort-ascending, sort-descending by the direction; nothing rotates", () => {
    const element = files["eroj/src/generated/fm-tabelo.ts"] ?? "";
    const styles = files["eroj/src/generated/tabelo.styles.ts"] ?? "";
    expect(element).toContain('<fm-ikono name="sort-ascending" size="small"');
    expect(element).toContain('"sort-descending"');
    expect(styles).not.toContain("rotate(180deg)");
  });

  it("the avizo shows the icon of its intent before the texts, decorative, in the accent's colour; its dismiss butono an ikono close", () => {
    const element = files["eroj/src/generated/fm-avizo.ts"] ?? "";
    const styles = files["eroj/src/generated/avizo.styles.ts"] ?? "";
    expect(element).toContain('<span part="icon" aria-hidden="true"><fm-ikono');
    expect(element).toContain('<fm-ikono slot="icon-start" name="close"');
    expect(element).not.toContain("M4 4l8 8M12 4l-8 8");
    const css = JSON.parse(
      /export const AVIZO_CSS = ("(?:[^"\\]|\\.)*");/.exec(styles)?.[1] ?? '""',
    ) as string;
    expect(css).toContain('[part="icon"]');
    expect(css).toContain("inline-size: var(--fm-size-icon-medium);");
    expect(css).toContain(
      ':where([part="control"][data-intent="danger"]) [part="icon"] {\n  color: var(--fm-color-status-danger-text);',
    );
  });
});

// Spec 014 ③ (section ③, plan ③ D-04): the titolo — a heading whose level is spoken (aria-level)
// and whose size is a type role, derived from the level where none is given; its text is the
// control (part text), so an Ero that composes it keeps one control of its own. The teksto — a
// paragraph in the role of its kind and size, in the colour of its emphasis; inline code is
// spoken as code. The dialogo composes the titolo as its heading.
describe("Web Component Celo for the titolo and the teksto (Spec 014 ③)", () => {
  const cssOf = (ero: string) =>
    JSON.parse(
      new RegExp(`export const ${ero.toUpperCase()}_CSS = ("(?:[^"\\\\]|\\\\.)*");`).exec(
        files[`eroj/src/generated/${ero}.styles.ts`] ?? "",
      )?.[1] ?? '""',
    ) as string;

  it("the titolo renders a heading with its level, the size derived from the level where none is given", () => {
    const element = files["eroj/src/generated/fm-titolo.ts"] ?? "";
    expect(element).toContain('<div part="text" role="heading"><slot></slot>');
    expect(element).toContain('"aria-level"');
    expect(element).toContain("SIZE_OF_LEVEL");
    expect(element).not.toContain('part="control"');
    expect(element).toContain("static formAssociated = false;");
    const css = cssOf("titolo");
    expect(css).toContain(
      ':where([part="text"][data-size="display-1"]) {\n  font-family: var(--fm-typography-display-1-font-family);',
    );
    expect(css).toContain("color: var(--fm-color-text-default);");
    expect(css).toContain(":host { display: block; }");
    expect(css).toContain("overflow-wrap: anywhere;");
    expect(componentCssIssues("titolo.css", css)).toEqual([]);
    expect(cssPhysicalPropertyIssues("titolo.css", css)).toEqual([]);
  });

  it("the teksto renders a paragraph in the role of its kind and size, the colour of its emphasis; code is spoken as code", () => {
    const element = files["eroj/src/generated/fm-teksto.ts"] ?? "";
    expect(element).toContain('"code"');
    expect(element).toContain('customElements.define("fm-teksto", FmTeksto)');
    const css = cssOf("teksto");
    expect(css).toContain(
      ':where([part="control"][data-kind="body"][data-size="2"]) {\n  font-family: var(--fm-typography-body-2-font-family);',
    );
    expect(css).toContain(
      ':where([part="control"][data-kind="code"][data-size="1"]) {\n  font-family: var(--fm-typography-code-font-family);',
    );
    expect(css).toContain(
      ':where([part="control"][data-emphasis="low"]) {\n  color: var(--fm-color-text-muted);',
    );
    expect(css).toContain(':where([part="control"][data-kind="code"]) { display: inline;');
    expect(css).toContain("overflow-wrap: anywhere;");
    expect(componentCssIssues("teksto.css", css)).toEqual([]);
  });

  it("the dialogo composes the titolo as its heading (level 2, headline-4)", () => {
    const element = files["eroj/src/generated/fm-dialogo.ts"] ?? "";
    expect(element).toContain(
      '<fm-titolo part="heading" id="heading" level="2" size="headline-4"><slot></slot></fm-titolo>',
    );
  });
});

// Spec 014 ④ (section ④, plan ④ D-05): the overlays on the platform (E11, G4) — every layer is a
// popover of the platform (top layer, light dismiss, Escape) anchored to its trigger with CSS
// anchor positioning (position-anchor, position-area, position-try-fallbacks; the placement as a
// host attribute, no data attribute, so the inventory reads no axis); the own fallback is the
// plain place under the trigger (@supports not). The konsileto's control is the tooltip, the
// sxvebilo's a non-modal dialog with a composed titolo as heading, the menuo's a menu of rows.
describe("Web Component Celo for the overlays (Spec 014 ④)", () => {
  const cssOf = (ero: string) =>
    JSON.parse(
      new RegExp(`export const ${ero.toUpperCase()}_CSS = ("(?:[^"\\\\]|\\\\.)*");`).exec(
        files[`eroj/src/generated/${ero}.styles.ts`] ?? "",
      )?.[1] ?? '""',
    ) as string;

  it("the konsileto is a tooltip of the platform: popover manual, anchored to its trigger, shown after the delay of the motion token", () => {
    const element = files["eroj/src/generated/fm-konsileto.ts"] ?? "";
    // The host is the layer (plan ④ B-7): it takes popover and the role itself, in the tree scope
    // of its trigger; the control inside is the surface.
    expect(element).toContain('<div part="control"><slot></slot>');
    expect(element).toContain('this.setAttribute("popover", "manual")');
    expect(element).toContain('this.setAttribute("role", "tooltip")');
    expect(element).toContain('"aria-describedby"');
    expect(element).toContain("anchor-name");
    expect(element).toContain("position-anchor");
    expect(element).toContain("showPopover");
    expect(element).toContain("static formAssociated = false;");
    const css = cssOf("konsileto");
    expect(css).toContain("position-area: block-start;");
    expect(css).toContain(':host([placement="block-end"]) { position-area: block-end; }');
    expect(css).toContain("position-try-fallbacks: flip-block, flip-inline;");
    expect(css).toContain("background-color: var(--fm-color-background-inverse);");
    expect(css).toContain("color: var(--fm-color-text-inverse);");
    expect(css).toContain("box-shadow: var(--fm-elevation-shadow-overlay);");
    expect(css).toContain("z-index: var(--fm-elevation-layer-overlay);");
    expect(css).toContain("transition-duration: var(--fm-motion-duration-slow);");
    expect(css).not.toContain("data-placement");
    expect(componentCssIssues("konsileto.css", css)).toEqual([]);
    expect(cssPhysicalPropertyIssues("konsileto.css", css)).toEqual([]);
  });

  it("the sxvebilo is a non-modal dialog of the platform: popover auto, the trigger slotted with aria-expanded, the heading a composed titolo", () => {
    const element = files["eroj/src/generated/fm-sxvebilo.ts"] ?? "";
    expect(element).toContain('<slot name="trigger"></slot>');
    expect(element).toContain('<div part="control" role="dialog" popover="auto"');
    expect(element).toContain(
      '<fm-titolo part="heading" id="heading" level="2" size="headline-4"><slot name="heading"></slot></fm-titolo>',
    );
    expect(element).toContain('"aria-expanded"');
    expect(element).toContain("hidePopover");
    const css = cssOf("sxvebilo");
    expect(css).toContain("max-inline-size: var(--fm-size-container-small);");
    expect(css).toContain("background-color: var(--fm-color-background-raised);");
    expect(css).toContain("border-color: var(--fm-color-border-subtle);");
    expect(css).toContain("box-shadow: var(--fm-elevation-shadow-overlay);");
    expect(css).toContain("position-area: block-end;");
    expect(componentCssIssues("sxvebilo.css", css)).toEqual([]);
  });

  it("the menuo is a menu of the platform's rows: popover auto, role menu with menuitem rows, an own trigger with the icon more", () => {
    const element = files["eroj/src/generated/fm-menuo.ts"] ?? "";
    expect(element).toContain('<div part="control" role="menu" popover="auto"></div>');
    expect(element).toContain('role="menuitem"');
    expect(element).toContain(
      '<fm-butono part="trigger" emphasis="low"><fm-ikono name="more"></fm-ikono></fm-butono>',
    );
    expect(element).toContain('"aria-haspopup"');
    expect(element).toContain('new CustomEvent("select"');
    expect(element).toContain("fm-danger");
    const css = cssOf("menuo");
    expect(css).toContain(
      ':where([part="control"] [part="item"]:hover) {\n  background-color: var(--fm-color-action-tertiary-hover);',
    );
    expect(css).toContain(
      ':where([part="control"] [part="item"][aria-disabled="true"]) {\n  background-color: var(--fm-color-action-tertiary-disabled);',
    );
    expect(css).toContain(
      '[part="control"] [part="item"].fm-danger {\n  color: var(--fm-color-status-danger-text);',
    );
    expect(css).toContain("min-block-size: var(--fm-size-target-min);");
    expect(css).toContain(":focus-visible");
    expect(componentCssIssues("menuo.css", css)).toEqual([]);
  });
});

// Spec 014 ⑤ (section ⑤, plan ⑤ D-03): the faldilo is the platform's details and summary (the
// group its name, so the platform opens one at a time), the chevron an ikono that turns with the
// state; the kompletigilo is the field of the kampo (the input host) with a listbox of
// suggestions — a popover of the platform anchored to the field, rows with the role option,
// aria-activedescendant on the input, the count of suggestions in a live region.
describe("Web Component Celo for the faldilo and the kompletigilo (Spec 014 ⑤)", () => {
  const cssOf = (ero: string) =>
    JSON.parse(
      new RegExp(`export const ${ero.toUpperCase()}_CSS = ("(?:[^"\\\\]|\\\\.)*");`).exec(
        files[`eroj/src/generated/${ero}.styles.ts`] ?? "",
      )?.[1] ?? '""',
    ) as string;

  it("the faldilo renders details and summary; the group is the details' name; the chevron turns with open", () => {
    const element = files["eroj/src/generated/fm-faldilo.ts"] ?? "";
    expect(element).toContain(
      '<details part="control"><summary part="summary"><slot name="summary"></slot><fm-ikono part="indicator" name="chevron-right"></fm-ikono></summary><div part="content"><slot></slot></div>',
    );
    expect(element).toContain('"chevron-down"');
    expect(element).toContain('setAttribute("name"');
    expect(element).toContain("static formAssociated = false;");
    const css = cssOf("faldilo");
    expect(css).toContain(
      ':where([part="control"][data-open="false"]) [part="summary"]:hover {\n  background-color: var(--fm-color-action-tertiary-hover);',
    );
    expect(css).toContain(
      ':where([part="control"][data-open="true"]) [part="indicator"] {\n  color: var(--fm-color-text-default);',
    );
    expect(css).toContain("min-block-size: var(--fm-size-target-min);");
    expect(css).toContain(':where([part="summary"]) { display: flex;');
    expect(css).toContain("list-style: none;");
    expect(componentCssIssues("faldilo.css", css)).toEqual([]);
    expect(cssPhysicalPropertyIssues("faldilo.css", css)).toEqual([]);
  });

  it("the kompletigilo is a field of the kampo with a listbox popover of suggestions, named by its options", () => {
    const element = files["eroj/src/generated/fm-kompletigilo.ts"] ?? "";
    expect(element).toContain('<input part="control" id="control"');
    expect(element).toContain(
      '<div part="listbox" role="listbox" id="listbox" popover="manual"></div>',
    );
    expect(element).toContain('role="option"');
    expect(element).toContain('"aria-activedescendant"');
    expect(element).toContain('"aria-autocomplete"');
    expect(element).toContain('new CustomEvent("query"');
    expect(element).toContain('"options-count"');
    expect(element).toContain("static formAssociated = true;");
    const css = cssOf("kompletigilo");
    expect(css).toContain(
      ':where([part="field"][data-size="medium"]:has([part="control"]:hover)) [part="control"] {\n  background-color:',
    );
    expect(css).toContain(
      ':where([part="field"]) [part="listbox"] {\n  background-color: var(--fm-color-background-raised);',
    );
    expect(css).toContain("box-shadow: var(--fm-elevation-shadow-overlay);");
    expect(css).toContain(
      ':where([part="field"]) [part="suggestion"][aria-selected="true"] {\n  color: var(--fm-color-text-default);',
    );
    expect(css).toContain("position-area: block-end;");
    expect(css).not.toContain("data-expanded");
    expect(componentCssIssues("kompletigilo.css", css)).toEqual([]);
  });
});
