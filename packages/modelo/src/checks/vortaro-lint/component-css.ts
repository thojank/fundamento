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
  // Spec 008 (ligilo, plan D-09): whether the underline is there is structure (underline, none);
  // its thickness and colour are design and stand in the design list below.
  "text-decoration-line",
  "vertical-align",
  "overflow",
  "transition-property",
  "border-style",
  "margin",
  // Spec 011 ① (O-8, Spec 010 ② B-4): whether a word longer than the line breaks inside the word
  // is structure (anywhere, normal); the label of an Ero that may wrap carries it.
  "overflow-wrap",
  // Spec 011 ② (plan ② D-11): whether a person may drag an area taller (vertical, none) is
  // structure; the text area resizes vertically only.
  "resize",
  // Spec 011 ③ (plan ③ D-08): a text for assistive technology alone is clipped from sight
  // (clip-path: inset(50%)), a structure without a size literal; the alignment of the text of a
  // state (center) is structure; whether only the start edge of a notice draws a line (its
  // accent) is structure, the line's width and colour are design values below.
  "clip-path",
  "text-align",
  "border-inline-start-style",
  // Spec 011 ④ (plan ④ D-09, D-10): the platform's own table and list in the light DOM — whether
  // borders collapse, where the caption stands, tabular figures in a numeric column, the columns of
  // the grid (max-content, auto) and the scroll axis of the region are structure.
  "border-collapse",
  "caption-side",
  "font-variant-numeric",
  "grid-template-columns",
  "overflow-x",
  // Spec 014 ② (plan ② D-05, D-07): a glyph is a mask of the Aspekto's picture (the image a
  // token reference, size, repeat and position keywords); a part above the page is fixed at the
  // start of the viewport (0 and keywords).
  "mask-image",
  "mask-size",
  "mask-repeat",
  "mask-position",
  "inset-block-start",
  "inset-inline-start",
  // Spec 014 ② (plan ② D-06): which edge of a separator draws its line is structure.
  "border-block-start-style",
  "border-block-end-style",
  "transform",
  "align-self",
  // Spec 014 ④ (plan ④ D-05, E11): a layer of the platform is anchored to its trigger — which
  // side it takes (position-area, logical keywords), which anchor (position-anchor, a dashed
  // name the element writes), how it flips where there is no room (position-try-fallbacks) and
  // that it leaves the insets to the anchor (inset: auto) are structure.
  "position-area",
  "position-anchor",
  "position-try-fallbacks",
  "inset",
  // Spec 014 ⑤ (plan ⑤ D-03): the field of a combobox names itself as the anchor of its listbox
  // (anchor-name, a dashed name); whether the platform's marker of a summary shows is structure.
  "anchor-name",
  "list-style",
  // Spec 015 ③ (plan ③ D-08): that the picture of an avatar covers its circle and is cropped,
  // never stretched, is structure (cover, a keyword).
  "object-fit",
];

/** Design properties: their value must come from a token (prefix match on the property name). */
export const DESIGN_PREFIXES: readonly string[] = [
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
  // F31: Die Schreibweise ist eine Gestaltungsentscheidung wie der Sperrsatz, nicht Struktur —
  // sie kommt aus dem Vortaro, nie aus der Komponente.
  "text-transform",
  // Spec 008: the underline of a link takes its width and colour from tokens (plan D-09).
  "text-decoration-thickness",
  "text-decoration-color",
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
  // Spec 014 ② (plan ② D-04): the layer of a part above the page, an elevation.layer.* token.
  "z-index",
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
