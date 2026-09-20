// `ero-hardcoded-string` (Spec 003, plan D-17, Art. VIII Internacia): an Ero carries no visible
// text and no literal accessible name. Every label comes from a slot or a prop, so translating a
// product never means editing a component. Scans the generated sources (and the templates they
// come from) as text: markup text nodes in template literals, and literal values of the
// attributes that speak to assistive technology.

import type { ValidationIssue } from "../../contracts/issues.js";
import { lineColumn, textPath } from "../namespace/paths.js";

/** Attributes whose value is read out or shown; a literal here is a translatable string. */
const NAMING_ATTRIBUTES = [
  "aria-label",
  "aria-placeholder",
  "aria-roledescription",
  "title",
  "alt",
];

/** A template literal or a plain string: where markup is written in a generated source. */
const MARKUP_HOLDER = /`([^`\\]*)`|"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'/g;

/** Text between two tags, e.g. `<span>Laden …</span>`; interpolations and braces are not text. */
const TEXT_NODE = />([^<>{}$]*[^\s<>{}$][^<>{}$]*)</g;

/** `setAttribute("aria-label", "…")` or `aria-label="…"` with a literal value. */
const LITERAL_ATTRIBUTE = new RegExp(
  `(?:setAttribute\\(\\s*["'\`](${NAMING_ATTRIBUTES.join("|")})["'\`]\\s*,\\s*["']([^"']*)["']` +
    `|(${NAMING_ATTRIBUTES.join("|")})=["']([^"'{]*)["'])`,
  "g",
);

/** Values that name no text: an empty string and the ARIA booleans. */
const HARMLESS = new Set(["", "true", "false"]);

function issue(
  file: string,
  text: string,
  index: number,
  found: string,
  what: string,
): ValidationIssue {
  const { line, column } = lineColumn(text, index);
  return {
    rule: "ero-hardcoded-string",
    severity: "error",
    path: textPath(file, line, column),
    message: `${what} "${found}" is a visible or spoken string inside an Ero.`,
    suggestion:
      "Take the text from a slot or a prop of the Skemo; an Ero holds no translatable string (Art. VIII).",
  };
}

/** Every hardcoded string of an Ero source. */
export function eroHardcodedStringIssues(file: string, text: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  // Only markup counts, and markup lives in a string or template literal: TypeScript generics
  // such as Record<string, string> would otherwise read as a text node.
  for (const holder of text.matchAll(MARKUP_HOLDER)) {
    const content = holder[1] ?? holder[2] ?? holder[3] ?? "";
    if (!content.includes("<")) continue;
    for (const match of content.matchAll(TEXT_NODE)) {
      const found = (match[1] ?? "").trim();
      if (found === "" || found.startsWith("/")) continue;
      issues.push(issue(file, text, holder.index + match.index, found, "The markup text"));
    }
  }
  for (const match of text.matchAll(LITERAL_ATTRIBUTE)) {
    const attribute = match[1] ?? match[3] ?? "";
    const value = (match[2] ?? match[4] ?? "").trim();
    if (HARMLESS.has(value)) continue;
    issues.push(issue(file, text, match.index, value, `The value of ${attribute}`));
  }
  return issues;
}
