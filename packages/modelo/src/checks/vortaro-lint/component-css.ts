// The literal rule for Ero stylesheets (Spec 003, review decision 3 of the Stage 2–4 review;
// Art. X gate 1, Jugxo on Article VI). Vortaro-Lint (a) was written for token CSS, where every
// value is a design value, so it treats every keyword as a literal. A component stylesheet also
// carries structure: `display: inline-flex` is not a design decision and has no token. This rule
// refines it for generated Ero stylesheets:
//
//   - a small, explicit allowlist of structural properties may use keywords and 0;
//   - every design property (colour, background, border, outline, spacing, size, type, radius,
//     shadow, opacity, motion) may only be `var(--fm-*)`, `0`, or arithmetic over those;
//   - a property in neither list is reported, so the lists stay conscious decisions.

import { parse } from "postcss";
import type { ValidationIssue } from "../../contracts/issues.js";
import { textPath } from "../namespace/paths.js";
import { cssSyntaxIssue } from "../namespace/rules.js";
import { findLiteral } from "./css-literal.js";

/** Structure, not design: no token exists for these, so keywords are allowed. */
export const STRUCTURAL_PROPERTIES: readonly string[] = [
  "display",
  "position",
  "box-sizing",
  "cursor",
  "align-items",
  "align-content",
  "justify-content",
  "flex",
  "flex-direction",
  "flex-wrap",
  "appearance",
  "pointer-events",
  "user-select",
  "white-space",
  "text-decoration",
  "vertical-align",
  "overflow",
  "transition-property",
  "border-style",
  "margin",
];

/** Design properties: their value must come from a token (prefix match on the property name). */
const DESIGN_PREFIXES: readonly string[] = [
  "color",
  "background",
  "border-color",
  "border-width",
  "border-radius",
  "border-inline",
  "border-block",
  "outline",
  "padding",
  "margin-inline",
  "margin-block",
  "gap",
  "row-gap",
  "column-gap",
  "inline-size",
  "block-size",
  "min-inline-size",
  "min-block-size",
  "max-inline-size",
  "max-block-size",
  "width",
  "height",
  "font",
  "line-height",
  "letter-spacing",
  "text-shadow",
  "box-shadow",
  "opacity",
  "transition-duration",
  "transition-timing-function",
  "transition-delay",
  "animation-duration",
  "animation-timing-function",
  "animation-delay",
  "fill",
  "stroke",
];

const isDesign = (property: string) =>
  DESIGN_PREFIXES.some((prefix) => property === prefix || property.startsWith(`${prefix}-`));

/**
 * Every literal of a generated Ero stylesheet. Custom property definitions (`--fm-*`) keep the
 * Phase-0 rule: they are where literals belong.
 */
export function componentCssIssues(file: string, css: string): ValidationIssue[] {
  let root: ReturnType<typeof parse>;
  try {
    root = parse(css, { from: file });
  } catch (error) {
    return [cssSyntaxIssue(file, error, "css-literal-value")];
  }
  const issues: ValidationIssue[] = [];
  root.walkDecls((declaration) => {
    const property = declaration.prop.toLowerCase();
    if (property.startsWith("--")) return;
    const start = declaration.source?.start;
    const at = (message: string, suggestion: string) =>
      issues.push({
        rule: "css-literal-value",
        severity: "error",
        path: textPath(file, start?.line ?? 1, start?.column ?? 1),
        message,
        suggestion,
      });
    if (STRUCTURAL_PROPERTIES.includes(property)) {
      const literal = property === "margin" ? findLiteral(declaration.value) : null;
      if (literal !== null) {
        at(
          `"${declaration.prop}: ${declaration.value}" uses the literal value "${literal}"; of the structural properties only 0 and keywords are allowed.`,
          "Use 0, a keyword, or a token reference var(--fm-…).",
        );
      }
      return;
    }
    if (!isDesign(property)) {
      at(
        `"${declaration.prop}" is in neither the structural allowlist nor the design list of the Ero stylesheet rule.`,
        `Add ${property} to STRUCTURAL_PROPERTIES (structure, keywords allowed) or to DESIGN_PREFIXES (value from a token) in component-css.ts, with a reason.`,
      );
      return;
    }
    const literal = findLiteral(declaration.value);
    if (literal !== null) {
      at(
        `"${declaration.prop}: ${declaration.value}" uses the literal value "${literal}" instead of a token.`,
        "Bind the part property in the Skemo and reference its token with var(--fm-…).",
      );
    }
  });
  return issues;
}
