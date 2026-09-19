// `css-physical-property` (Spec 003, plan D-17, Art. VIII Internacia): generated CSS uses logical
// properties only, so right-to-left layouts follow `dir` without a second stylesheet.

import { parse } from "postcss";
import type { ValidationIssue } from "../../contracts/issues.js";
import { textPath } from "../namespace/paths.js";
import { cssSyntaxIssue } from "../namespace/rules.js";

/** Physical properties and their logical replacement. */
export const PHYSICAL_PROPERTIES: Readonly<Record<string, string>> = {
  left: "inset-inline-start",
  right: "inset-inline-end",
  "margin-left": "margin-inline-start",
  "margin-right": "margin-inline-end",
  "padding-left": "padding-inline-start",
  "padding-right": "padding-inline-end",
  "border-left": "border-inline-start",
  "border-right": "border-inline-end",
  "border-left-width": "border-inline-start-width",
  "border-right-width": "border-inline-end-width",
  "border-left-color": "border-inline-start-color",
  "border-right-color": "border-inline-end-color",
  "border-left-style": "border-inline-start-style",
  "border-right-style": "border-inline-end-style",
  "border-top-left-radius": "border-start-start-radius",
  "border-top-right-radius": "border-start-end-radius",
  "border-bottom-left-radius": "border-end-start-radius",
  "border-bottom-right-radius": "border-end-end-radius",
};

/** Declarations of a physical property, or of `float`/`text-align` with `left`/`right`. */
export function cssPhysicalPropertyIssues(file: string, css: string): ValidationIssue[] {
  let root: ReturnType<typeof parse>;
  try {
    root = parse(css, { from: file });
  } catch (error) {
    return [cssSyntaxIssue(file, error, "css-physical-property")];
  }
  const issues: ValidationIssue[] = [];
  root.walkDecls((declaration) => {
    const prop = declaration.prop.toLowerCase();
    const logical =
      PHYSICAL_PROPERTIES[prop] ??
      ((prop === "float" || prop === "text-align" || prop === "clear") &&
      /^(left|right)$/i.test(declaration.value.trim())
        ? `${prop}: ${declaration.value.trim().toLowerCase() === "left" ? "inline-start" : "inline-end"}`
        : undefined);
    if (logical === undefined) return;
    const start = declaration.source?.start;
    issues.push({
      rule: "css-physical-property",
      severity: "error",
      path: textPath(file, start?.line ?? 1, start?.column ?? 1),
      message: `"${declaration.prop}: ${declaration.value}" is a physical direction; in a right-to-left layout it points the wrong way.`,
      suggestion: `Use ${logical} (Art. VIII Internacia).`,
    });
  });
  return issues;
}
