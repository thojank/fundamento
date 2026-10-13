// Web terms a Skemo may not use as a name (Spec 008 A7, Art. VIII, plan D-13). A prop, slot, part
// or state is a word of the Modelo; the attributes and elements of one platform are not. The list
// is narrow on purpose: `type`, `disabled`, `name`, `value`, `placeholder`, `required` and
// `readonly` read as plain words of a component and stay allowed (Spec 009 decides `kind` over
// `type` for the field for a different reason). The Web Celo translates (`to` → `href`).

import { NAMING_ATTRIBUTES } from "../checks/vortaro-lint/ero-strings.js";

/** Attributes that name a mechanism of the web platform, not a trait of the Ero. */
const WEB_ATTRIBUTES: readonly string[] = [
  "href",
  "src",
  "srcset",
  "rel",
  "target",
  "class",
  "classname",
  "style",
  "tabindex",
  "onclick",
  "oninput",
  "onchange",
  "innerhtml",
  "outerhtml",
  "textcontent",
  ...NAMING_ATTRIBUTES,
];

/** Element names of the web platform; `label` and `form` are words of the Modelo and stay. */
const WEB_ELEMENTS: readonly string[] = [
  "a",
  "input",
  "button",
  "select",
  "textarea",
  "option",
  "div",
  "span",
  "img",
  "iframe",
  "ul",
  "ol",
  "li",
  "nav",
  "svg",
];

const WEB_TERMS: ReadonlySet<string> = new Set([...WEB_ATTRIBUTES, ...WEB_ELEMENTS]);

/** Prefixes of attribute families of the web platform. */
const WEB_PREFIXES: readonly string[] = ["aria-", "data-", "on"];

/**
 * Whether a Skemo name is a web term: a listed attribute or element, or an `aria-*`/`data-*`
 * attribute. `on` alone is no term; `onclick` is (prefix `on` plus an event name of ≥ 3 letters).
 */
export function isSkemoWebTerm(name: string): boolean {
  const word = name.toLowerCase();
  if (WEB_TERMS.has(word)) return true;
  return (
    WEB_PREFIXES.some(
      (prefix) => word.startsWith(prefix) && word.length >= prefix.length + 3 && prefix !== "on",
    ) || /^on[a-z]{3,}$/.test(word)
  );
}

/** What to say instead, for the suggestion of the issue. */
export function skemoWebTermSuggestion(name: string): string {
  if (name === "href" || name === "src")
    return "Name the target to; the Web Celo renders it as href.";
  return "Name what the Ero means, not how one platform spells it; the Celoj translate (Art. VIII).";
}
