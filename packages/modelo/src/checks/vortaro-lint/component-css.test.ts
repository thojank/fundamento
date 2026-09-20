// The literal rule for Ero stylesheets (Spec 003 F2, review decision 3): design values come from
// tokens; a small, explicit allowlist of structural properties may use keywords.

import { describe, expect, it } from "vitest";
import { componentCssIssues, STRUCTURAL_PROPERTIES } from "./component-css.js";

const rules = (css: string) => componentCssIssues("butono.css", css).map((issue) => issue.rule);

describe("componentCssIssues (F2)", () => {
  it("reports a literal colour and a literal length", () => {
    expect(rules("a { color: red; }")).toEqual(["css-literal-value"]);
    expect(rules("a { padding: 8px; }")).toEqual(["css-literal-value"]);
    expect(componentCssIssues("butono.css", "a { color: red; }")[0]?.message).toContain("red");
  });

  it("accepts the structural allowlist with keywords", () => {
    const css = `a {
  display: inline-flex;
  position: relative;
  box-sizing: border-box;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  flex: none;
  appearance: none;
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
  text-decoration: none;
  margin: 0;
}`;
    expect(rules(css)).toEqual([]);
  });

  it("keeps the allowlist small and explicit", () => {
    expect(STRUCTURAL_PROPERTIES.length).toBeLessThanOrEqual(20);
    for (const property of ["color", "background-color", "padding", "font-size", "gap"]) {
      expect(STRUCTURAL_PROPERTIES, property).not.toContain(property);
    }
  });

  it.each([
    "color",
    "background-color",
    "border-color",
    "border-width",
    "border-radius",
    "outline-color",
    "outline-offset",
    "padding-inline",
    "margin-inline",
    "gap",
    "min-block-size",
    "max-inline-size",
    "font-size",
    "font-family",
    "line-height",
    "letter-spacing",
    "box-shadow",
    "opacity",
    "transition-duration",
    "animation-duration",
  ])("accepts %s only as a token reference", (property) => {
    expect(rules(`a { ${property}: var(--fm-something); }`)).toEqual([]);
    expect(rules(`a { ${property}: 1rem; }`)).toEqual(["css-literal-value"]);
  });

  it("allows 0 and calc() on tokens", () => {
    expect(
      rules("a { box-shadow: 0 0 0 var(--fm-focus-offset) var(--fm-color-focus-inner); }"),
    ).toEqual([]);
    expect(rules("a { padding-inline: calc(var(--fm-spacing-small) * 2); }")).toEqual([]);
  });

  it("reports a property that is in neither list", () => {
    expect(rules("a { backdrop-filter: blur(4px); }")).toEqual(["css-literal-value"]);
  });
});
