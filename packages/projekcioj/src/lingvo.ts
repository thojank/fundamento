// The Lingvo-Schalter of the Vitrino and the Studio (Spec 026 ②, decision of the maintainer
// 2026-10-22): Esperanto is the default; German and English switch the display, the names of the
// components too. A page writes every name in a span with the key of its name (`data-fm-nomo`,
// the key of data/tradukoj.json) and its Esperanto name as text, every heading of its own words in
// a span with its key (`data-fm-teksto`) and its German text; the script below writes the names
// of the chosen language from the page's table, the name of an Ero or a Sxablono with the
// Esperanto name small beside it. Identifiers never change: the elements, their tags and their
// attributes stay as they are. Esperanto shows the page as it was before the switch.

import type { AnzeigeLingvo } from "@fundamento/modelo";

/** The switch's buttons, in this order; Esperanto first, the default. */
export const LINGVO_BUTTONS: readonly { lingvo: AnzeigeLingvo; label: string }[] = [
  { lingvo: "eo", label: "Esperanto" },
  { lingvo: "de", label: "Deutsch" },
  { lingvo: "en", label: "English" },
];

/** The group of the switch: three buttons, one pressed. */
export function lingvoSwitch(className = "fm-group"): string {
  const buttons = LINGVO_BUTTONS.map(
    (button) =>
      `<button type="button" data-fm-lingvo="${button.lingvo}" aria-pressed="${button.lingvo === "eo"}">${button.label}</button>`,
  ).join("");
  return `<div class="${className}" role="group" aria-label="lingvo"><span>lingvo</span>${buttons}</div>`;
}

/** A name in its span: the key of its name and the Esperanto name as text (escaped by the caller). */
export const nomoSpan = (key: string | undefined, eo: string): string =>
  key === undefined ? eo : `<span data-fm-nomo="${key}">${eo}</span>`;

/** A heading of the page's own words in its span: the key and the German text. */
export const tekstoSpan = (key: string, de: string): string =>
  `<span data-fm-teksto="${key}">${de}</span>`;

/**
 * The script that switches a page (plain JavaScript, no module of its own): `fmLingvo(lingvo,
 * nomoj, tekstoj)` writes every name and heading in the language, marks the pressed button and
 * the root (`data-fm-lingvo`). `nomoj` is { de: { key: name }, en: { key: name } }, `tekstoj`
 * { key: { de?, en?, eo? } } — a language without a text shows the text the page was written with.
 */
export const LINGVO_SKRIPTO = String.raw`
function fmLingvo(lingvo, nomoj, tekstoj) {
  const escape = (value) => String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  document.documentElement.setAttribute("data-fm-lingvo", lingvo);
  for (const node of document.querySelectorAll("[data-fm-nomo]")) {
    if (!node.hasAttribute("data-fm-eo")) node.setAttribute("data-fm-eo", node.textContent);
    const eo = node.getAttribute("data-fm-eo");
    const key = node.getAttribute("data-fm-nomo");
    const name = lingvo === "eo" ? eo : (((nomoj || {})[lingvo] || {})[key] || eo);
    // The name of an Ero or a Sxablono keeps its Esperanto name small beside it — but where the
    // page says the name alone (data-fm-nomo-sole, Nachlese 10 N-8: „Schieberegler: Varianten …“).
    const beside =
      lingvo !== "eo" && name !== eo && /^(ero|sxa)_[^/]+\/name$/.test(key) && !node.hasAttribute("data-fm-nomo-sole");
    const html = beside ? escape(name) + ' <small lang="eo">' + escape(eo) + "</small>" : escape(name);
    if (node.innerHTML !== html) node.innerHTML = html;
    if (lingvo === "en") node.setAttribute("lang", "en");
    else node.removeAttribute("lang");
  }
  for (const node of document.querySelectorAll("[data-fm-teksto]")) {
    if (!node.hasAttribute("data-fm-de")) node.setAttribute("data-fm-de", node.textContent);
    const de = node.getAttribute("data-fm-de");
    // The words of a heading in the language chosen where the page has them (Nachlese 10 N-1: the
    // switch says „Sprache“, „Language“, „lingvo“), else the text it was written with.
    const own = ((tekstoj || {})[node.getAttribute("data-fm-teksto")] || {})[lingvo];
    const text = own || de;
    if (node.textContent !== text) node.textContent = text;
    if (lingvo === "en" && own) node.setAttribute("lang", "en");
    else node.removeAttribute("lang");
  }
  for (const button of document.querySelectorAll("button[data-fm-lingvo]")) {
    button.setAttribute("aria-pressed", String(button.getAttribute("data-fm-lingvo") === lingvo));
  }
}
`;
