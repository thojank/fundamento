// Spec 046 T1 (section A): the layout Eroj vico, kolumno and stako in the Web Component Celo. They
// place their children and draw nothing: the gap between the children is the only design value,
// taken from the spacing step the Skemo binds (spacing.*, A-4) – never a literal, never a colour
// or a font of their own. vico lays a row, kolumno and stako a column; wrap lets a row break.

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
const cssOf = (ero: string, roles = true) => {
  const path = `eroj/src/generated/${ero}.styles.ts`;
  const text = roles ? read(path) : (raw[path] ?? "");
  return JSON.parse(
    new RegExp(`export const ${ero.toUpperCase()}_CSS = ("(?:[^"\\\\]|\\\\.)*");`).exec(
      text,
    )?.[1] ?? '""',
  ) as string;
};
const skemoOf = (ero: string) =>
  prepared.input.modelo.eroj.find((entry) => entry.ero.name === ero)?.skemo;

const LAYOUT = [
  { ero: "vico", direction: "row" },
  { ero: "kolumno", direction: "column" },
  { ero: "stako", direction: "column" },
] as const;

/** CSS properties that would give an Ero a colour or a font of its own. */
const DRAWN =
  /(^|[\s;{])(color|background(-color)?|border(-[a-z-]+)?|outline(-[a-z-]+)?|box-shadow|font(-[a-z-]+)?|line-height|letter-spacing|text-decoration[a-z-]*)\s*:/;

describe("Web Component Celo for the layout Eroj (Spec 046 T1)", () => {
  for (const { ero, direction } of LAYOUT) {
    describe(`fm-${ero}`, () => {
      it("generates an element and a stylesheet, and a React wrapper", () => {
        expect(raw[`eroj/src/generated/fm-${ero}.ts`]).toBeDefined();
        expect(raw[`eroj/src/generated/${ero}.styles.ts`]).toBeDefined();
        const className = `Fm${ero[0]?.toUpperCase()}${ero.slice(1)}`;
        expect(raw["eroj/src/generated/react.ts"]).toContain(className);
      });

      it("slots its children into one flex container with no role of its own", () => {
        const element = raw[`eroj/src/generated/fm-${ero}.ts`] ?? "";
        expect(element).toContain('<div part="control"><slot></slot>');
        expect(element).not.toMatch(/<div part="control" role=/);
        const css = cssOf(ero);
        expect(css).toContain(":host { display: block; }");
        expect(css).toContain(`flex-direction: ${direction};`);
      });

      it("takes the gap per step from its spacing step through a custom property, nothing else", () => {
        const css = cssOf(ero);
        const steps = skemoOf(ero)?.props.find((prop) => prop.name === "gap")?.values ?? [];
        expect(steps.length).toBeGreaterThan(0);
        for (const step of steps) {
          expect(css).toContain(
            `:where([part="control"][data-gap="${step}"]) {\n  gap: var(--fm-spacing-${step});\n}`,
          );
        }
        // Without the roles read through: every gap names a custom property of the namespace.
        const gaps = cssOf(ero, false).match(/(^|\s)gap: [^;]+;/g) ?? [];
        expect(gaps.length).toBe(steps.length);
        for (const gap of gaps) expect(gap.trim()).toMatch(/^gap: var\(--fm-[a-z0-9-]+\);$/);
      });

      it("has no colour and no font of its own, and passes the component CSS checks", () => {
        const css = cssOf(ero);
        expect(css.split("\n").filter((line) => DRAWN.test(line))).toEqual([]);
        expect(componentCssIssues(`${ero}.css`, css)).toEqual([]);
        expect(cssPhysicalPropertyIssues(`${ero}.css`, css)).toEqual([]);
      });

      it("the parity inventory names the gap steps and the one state rest", () => {
        const inventory = stylesheetInventory(raw[`eroj/src/generated/${ero}.styles.ts`] ?? "");
        expect(Object.keys(inventory.props)).toEqual(["gap"]);
        expect(inventory.states).toEqual(["rest"]);
      });
    });
  }

  it("lets vico and kolumno wrap and align their children; stako only stacks", () => {
    for (const ero of ["vico", "kolumno"]) {
      const css = cssOf(ero);
      expect(css).toContain(':host([wrap]) :where([part="control"]) { flex-wrap: wrap; }');
      expect(css).toContain(
        ':host([align="center"]) :where([part="control"]) { align-items: center; }',
      );
      expect(css).toContain(
        ':host([justify="space-between"]) :where([part="control"]) { justify-content: space-between; }',
      );
    }
    const stako = cssOf("stako");
    expect(stako).not.toContain("flex-wrap");
    expect(stako).not.toContain("justify-content");
  });
});
