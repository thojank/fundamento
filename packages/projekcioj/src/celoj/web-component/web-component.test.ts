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
      "eroj/src/generated/fm-butono.ts",
      "eroj/src/generated/fm-kampo.ts",
      "eroj/src/generated/fm-ligilo.ts",
      "eroj/src/generated/fm-sxaltilo.ts",
      "eroj/src/generated/index.ts",
      "eroj/src/generated/kampo.styles.ts",
      "eroj/src/generated/ligilo.styles.ts",
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
