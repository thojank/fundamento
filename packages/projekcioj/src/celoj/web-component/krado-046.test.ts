// Spec 046 T2 (section A): the grid krado in the Web Component Celo. A layout Ero like vico (the
// host layout, no role, nothing drawn) whose control is a grid: a fixed number of columns from
// the host's columns, or as many as fit (auto) with each at least the min-width of its step – the
// container width the Skemo binds (size.container.*, through its Ero-Token, plan D-13). A child
// spans data-span columns, at most as many as the grid has (plan D-14); below the Uzo's
// columns-from the grid stacks, measured as the karto measures (plan D-15). The gap only from the
// spacing step, no literal length, no breakpoint, no colour, no font.

import {
  componentCssIssues,
  cssPhysicalPropertyIssues,
  defaultModeloSource,
} from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import { traRolojCss } from "../../test-doubles/tra-roloj.js";
import { REACT_CELO } from "../react/react.js";
import { stylesheetInventory, WEB_COMPONENT_CELO } from "./web-component.js";

const prepared = celoInputOf(defaultModeloSource());
if (!prepared.ok) throw new Error("the repo Modelo must be valid");
const raw = Object.fromEntries(
  [...WEB_COMPONENT_CELO.generate(prepared.input), ...REACT_CELO.generate(prepared.input)].map(
    (file) => [file.path, file.text],
  ),
);
const read = (path: string) => traRolojCss(raw[path] ?? "", prepared.input.modelo);
const cssOf = (roles = true) => {
  const path = "eroj/src/generated/krado.styles.ts";
  const text = roles ? read(path) : (raw[path] ?? "");
  return JSON.parse(
    /export const KRADO_CSS = ("(?:[^"\\]|\\.)*");/.exec(text)?.[1] ?? '""',
  ) as string;
};
const element = () => raw["eroj/src/generated/fm-krado.ts"] ?? "";
const skemo = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "krado")?.skemo;
const valuesOf = (name: string) =>
  (skemo?.props.find((prop) => prop.name === name)?.values ?? []).map(String);

/** CSS properties that would give an Ero a colour or a font of its own. */
const DRAWN =
  /(^|[\s;{])(color|background(-color)?|border(-[a-z-]+)?|outline(-[a-z-]+)?|box-shadow|font(-[a-z-]+)?|line-height|letter-spacing|text-decoration[a-z-]*)\s*:/;

describe("Web Component Celo for the grid krado (Spec 046 T2)", () => {
  it("generates an element and a stylesheet, and a React wrapper", () => {
    expect(element()).not.toBe("");
    expect(raw["eroj/src/generated/krado.styles.ts"]).toBeDefined();
    expect(raw["eroj/src/generated/react.ts"]).toContain("FmKrado");
  });

  it("slots its children into one grid container with no role of its own", () => {
    expect(element()).toContain('<div part="control"><slot></slot>');
    expect(element()).not.toMatch(/<div part="control" role=/);
    const css = cssOf();
    expect(css).toContain(":host { display: block; }");
    expect(css).toMatch(/:where\(\[part="control"\]\) \{ display: grid;/);
    expect(css).not.toContain("display: flex");
  });

  it("lays a fixed number of columns from the host's columns, 1 to 12", () => {
    const css = cssOf();
    const counts = valuesOf("columns").filter((value) => value !== "auto");
    expect(counts).toEqual(Array.from({ length: 12 }, (_, index) => String(index + 1)));
    for (const count of counts) {
      expect(css).toContain(
        `:host([columns="${count}"]) :where([part="control"]) { grid-template-columns: repeat(${count}, minmax(0, 1fr)); }`,
      );
    }
  });

  it("lays as many columns as fit in auto, each at least its min-width step (its Ero-Token)", () => {
    const css = cssOf(false);
    const steps = valuesOf("min-width");
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      expect(css).toContain(
        `:where([part="control"][data-min-width="${step}"]) {\n  grid-template-columns: repeat(auto-fill, minmax(min(var(--fm-ero-krado-cell-width-min-width-${step}), 100%), 1fr));\n}`,
      );
    }
    // Read through: each step is the container width of core of its name.
    const resolved = cssOf();
    for (const step of steps) {
      expect(resolved).toContain(`minmax(min(var(--fm-size-container-${step}), 100%), 1fr)`);
    }
  });

  it("columns auto without min-width takes the Skemo default: the element writes the default step", () => {
    const fallback = skemo?.props.find((prop) => prop.name === "min-width")?.default;
    expect(fallback).toBe("small");
    // The enums the element writes on the control fall back to the default where absent or
    // unknown (propValue); the stylesheet keys the default step like any other.
    expect(element()).toContain('const fallback = String(prop.default ?? allowed[0] ?? "");');
    expect(cssOf()).toContain(`[data-min-width="${fallback}"]`);
  });

  it("spans data-span columns, and clamps a span wider than the grid to the whole row", () => {
    const css = cssOf();
    for (let span = 2; span <= 12; span += 1) {
      expect(css).toContain(`::slotted([data-span="${span}"]) { grid-column: span ${span}; }`);
    }
    // With c columns every span above c takes the whole row: 1 / -1 is every column there is.
    for (let count = 1; count <= 11; count += 1) {
      const wider = Array.from(
        { length: 12 - count },
        (_, index) => `[data-span="${count + index + 1}"]`,
      ).join(", ");
      expect(css).toContain(
        `:where([part="control"].fm-columns-${count}) ::slotted(:is(${wider})) { grid-column: 1 / -1; }`,
      );
    }
  });

  it("knows the column count it lays out and stacks below the Uzo's columns-from", () => {
    const source = element();
    expect(source).toContain('const COLUMNS_FROM = "--fm-size-container-small";');
    expect(source).toContain("fm-columns-");
    expect(source).toContain('control.classList.toggle("fm-stacked"');
    expect(cssOf()).toContain(
      ':host([columns]) :where([part="control"].fm-stacked) { grid-template-columns: minmax(0, 1fr); }',
    );
  });

  it("takes the gap per step from its spacing step through a custom property, nothing else", () => {
    const css = cssOf();
    const steps = valuesOf("gap");
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      expect(css).toContain(
        `:where([part="control"][data-gap="${step}"]) {\n  gap: var(--fm-spacing-${step});\n}`,
      );
    }
    const gaps = cssOf(false).match(/(^|\s)gap: [^;]+;/g) ?? [];
    expect(gaps.length).toBe(steps.length);
    for (const gap of gaps) expect(gap.trim()).toMatch(/^gap: var\(--fm-[a-z0-9-]+\);$/);
  });

  it("writes no length, no breakpoint, no colour and no font; passes the component CSS checks", () => {
    const css = cssOf();
    expect(css).not.toMatch(/@media|@container/);
    expect(css).not.toMatch(/\d(px|rem|em)\b/);
    expect(css.split("\n").filter((line) => DRAWN.test(line))).toEqual([]);
    expect(componentCssIssues("krado.css", css)).toEqual([]);
    expect(cssPhysicalPropertyIssues("krado.css", css)).toEqual([]);
  });

  it("the parity inventory names the axes min-width and gap and the one state rest", () => {
    const inventory = stylesheetInventory(raw["eroj/src/generated/krado.styles.ts"] ?? "");
    expect(Object.keys(inventory.props).sort()).toEqual(["gap", "min-width"]);
    expect(inventory.states).toEqual(["rest"]);
  });

  it("leaves vico, kolumno and stako flex containers", () => {
    for (const ero of ["vico", "kolumno", "stako"]) {
      const text = traRolojCss(
        raw[`eroj/src/generated/${ero}.styles.ts`] ?? "",
        prepared.input.modelo,
      );
      expect(text).toContain("display: flex");
      expect(text).not.toContain("display: grid");
    }
  });
});
