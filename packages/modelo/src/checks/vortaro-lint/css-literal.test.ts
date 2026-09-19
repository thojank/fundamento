import { describe, expect, it } from "vitest";
import { checkCssLiterals, findLiteral } from "./css-literal.js";

describe("findLiteral", () => {
  it.each([
    "var(--fm-color-text-default)",
    "var(--fm-spacing-small) var(--fm-spacing-medium)",
    "var(--fm-a, var(--fm-b))",
    "var(--fm-shadow-a), var(--fm-shadow-b)",
    "calc(var(--fm-spacing-small) * 2)",
    "clamp(var(--fm-a), calc(var(--fm-b) + var(--fm-c)), var(--fm-d))",
    "var(--fm-font-size) / var(--fm-line-height)",
    "0",
    "0 var(--fm-spacing-small)",
    "inherit",
    "INITIAL",
    "unset",
    "revert",
    "revert-layer",
  ])("accepts %s", (value) => {
    expect(findLiteral(value)).toBeNull();
  });

  it.each([
    ["#ff0000", "#ff0000"],
    ["red", "red"],
    ["transparent", "transparent"],
    ["rgb(0 0 0)", "rgb(0 0 0)"],
    ["oklch(0.5 0.1 200)", "oklch(0.5 0.1 200)"],
    ["16px", "16px"],
    ["1.5rem", "1.5rem"],
    ["200ms", "200ms"],
    ["0 1px 2px var(--fm-color-a)", "1px"],
    ["var(--fm-a, 4px)", "4px"],
    ["var(--xy-a)", "var(--xy-a)"],
    ["calc(100% - var(--fm-a))", "100%"],
    ["2", "2"],
    ["flex", "flex"],
    ['"Inter"', '"Inter"'],
    ["var(--fm-a", "var(--fm-a"],
  ])("rejects %s (reports %s)", (value, literal) => {
    expect(findLiteral(value)).toBe(literal);
  });
});

describe("checkCssLiterals", () => {
  it("allows literals only as values of --fm-* definitions", () => {
    const css = [
      ":root {",
      "  --fm-color-text-default: #1a1a1a;",
      "  --fm-spacing-small: 4px;",
      "}",
      ".fm-card {",
      "  color: var(--fm-color-text-default);",
      "  padding: var(--fm-spacing-small) 0;",
      "  margin: 0;",
      "  border-color: inherit;",
      "}",
    ].join("\n");
    const result = checkCssLiterals("p.css", css);
    expect(result.issues).toEqual([]);
    expect(result.declarations).toBe(6);
  });

  it("reports a literal in an ordinary declaration with file:line:column", () => {
    const css = ".fm-card {\n  color: #ff0000;\n}";
    const result = checkCssLiterals("packages/projekcioj/x.css", css);
    expect(result.issues.map(({ rule, path }) => ({ rule, path }))).toEqual([
      { rule: "css-literal-value", path: "packages/projekcioj/x.css:2:3" },
    ]);
    expect(result.issues[0]?.message).toContain("#ff0000");
    expect(result.issues[0]?.suggestion).toContain("var(--fm-");
  });

  it("reports literals in non --fm- custom properties, e.g. @theme entries", () => {
    const css = "@theme {\n  --color-text-default: #000;\n  --color-a: var(--fm-color-a);\n}";
    const result = checkCssLiterals("p.css", css);
    expect(result.issues.map(({ path }) => path)).toEqual(["p.css:2:3"]);
  });

  it("fails closed on unparseable CSS", () => {
    const result = checkCssLiterals("p.css", ".x { color: red;");
    expect(result.issues.map(({ rule }) => rule)).toEqual(["css-literal-value"]);
  });
});
