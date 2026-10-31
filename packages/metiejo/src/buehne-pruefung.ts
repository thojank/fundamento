// Spec 036 Teil 3, Befund 3.5: the check on the stage. The open problems of the draft's check reach
// the stage's page per component: a problem names a token (or a pair of them), the Skemoj of the
// Eroj say which part of which Ero shows that token in which variant, and the page marks every
// such component – a mark around it with `data-mt-pruefung="offen"`, a frame in the warning colour
// of the Vortaro and the check's own sentence in an fm-konsileto on hover and on focus. Pure apart
// from the page's client.

import type { RaportoViolation } from "@fundamento/agordilo";
import type { Modelo } from "@fundamento/modelo";
import { jsonIsland } from "./html.js";

/** A prop of the Ero the component must carry for the mark (its variant). */
export interface PruefKondicxo {
  prop: string;
  wert: string;
  /** A boolean prop: present means true. */
  bool: boolean;
  /** The value is the prop's default: an element without the attribute carries it too. */
  standard: boolean;
}

/** A mark of the check: the Ero and its variant that shows the token, and the check's sentence. */
export interface Pruefmarko {
  ero: string;
  kiam: PruefKondicxo[];
  satz: string;
}

/**
 * The tokens a problem is about, as the components show them: the token itself, or for a pair of
 * contrast its foreground (the text or icon that is hard to read), not the ground every surface
 * shares. The mode in brackets („color.text.subtle (hell)“) is not part of the token.
 */
function tokensOf(violation: RaportoViolation, modelo: Pick<Modelo, "kontrastParoj">): string[] {
  const subject = violation.subject.replace(/\s+\(.*\)$/, "");
  const pair = modelo.kontrastParoj.find((entry) => entry.name === subject);
  if (pair === undefined) return [subject];
  return [pair.foreground, ...(pair.aux === undefined ? [] : [pair.aux.foreground])];
}

/**
 * The marks of the open problems (Befund 3.5): per Ero and variant that binds a token of a problem,
 * one mark with the sentence of the first problem that names it. Conditions of the binding that are
 * not props (states as hover or selected) do not narrow the mark: the component shows the token in
 * one of them.
 */
export function pruefmarkojOf(
  violations: readonly RaportoViolation[],
  modelo: Pick<Modelo, "eroj" | "kontrastParoj">,
  satzOf: (violation: RaportoViolation) => string,
): Pruefmarko[] {
  const markoj = new Map<string, Pruefmarko>();
  for (const violation of violations) {
    const tokens = new Set(tokensOf(violation, modelo));
    for (const { ero, skemo } of modelo.eroj) {
      const props = new Map(skemo.props.map((prop) => [prop.name, prop]));
      for (const binding of skemo.bindings) {
        if (!tokens.has(binding.token)) continue;
        const kiam = Object.entries(binding.when ?? {})
          .filter(([name]) => props.has(name))
          .map(([name, value]): PruefKondicxo => {
            const prop = props.get(name);
            return {
              prop: name,
              wert: String(value),
              bool: prop?.kind === "boolean",
              standard: String(prop?.default) === String(value),
            };
          })
          .sort((a, b) => a.prop.localeCompare(b.prop));
        const key = `${ero.name} ${JSON.stringify(kiam)}`;
        if (!markoj.has(key)) markoj.set(key, { ero: ero.name, kiam, satz: satzOf(violation) });
      }
    }
  }
  return [...markoj.values()];
}

/**
 * The frame in the warning colour: the outline of the mark around the component, a token of the
 * Vortaro for its colour and its width; while the mark has the focus the focus ring of the Vortaro
 * stands inside it. The mark is a block or an inline block as the component is.
 */
const PRUEFUNG_CSS = `[data-mt-pruefung="offen"] { display: block; outline: var(--fm-border-width-strong) solid var(--fm-color-status-warning-border); outline-offset: var(--fm-border-width-strong); }
[data-mt-pruefung="offen"][data-mt-pruefung-inline] { display: inline-block; }
[data-mt-pruefung="offen"]:focus-visible { box-shadow: 0 0 0 var(--fm-border-width-focus) var(--fm-color-focus-ring); }`;

/**
 * The page's client: once the Eroj are defined it lays a mark around every component of a mark –
 * the component keeps its place (the mark takes its slot) – with the check's sentence in an
 * fm-konsileto, shown on hover and on focus and its description. An Ero lets nothing but its
 * control take the focus (delegatesFocus): the mark is the tab stop of a component without one;
 * an interactive component is reached through its own control, the focus inside shows the sentence.
 */
const PRUEFUNG_SKRIPTO = `{
  const markoj = JSON.parse(document.getElementById("mt-pruefung")?.textContent || "[]");
  const passt = (element, kondicxo) => kondicxo.bool
    ? (element.hasAttribute(kondicxo.prop) && element.getAttribute(kondicxo.prop) !== "false") === (kondicxo.wert === "true")
    : element.hasAttribute(kondicxo.prop) ? element.getAttribute(kondicxo.prop) === kondicxo.wert : kondicxo.standard;
  const FOKUSEBLA = 'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';
  const fokusebla = (element) => {
    for (const node of [element, ...element.querySelectorAll("*")]) {
      if (node !== element && node.matches(FOKUSEBLA)) return true;
      if (node.shadowRoot && node.shadowRoot.querySelector(FOKUSEBLA)) return true;
    }
    return false;
  };
  const marku = () => {
    let numero = 0;
    for (const marko of markoj) {
      for (const element of document.querySelectorAll("fm-" + marko.ero)) {
        if (element.closest("[data-mt-pruefung]") || !marko.kiam.every((kondicxo) => passt(element, kondicxo))) continue;
        const mark = document.createElement("span");
        mark.id = "mt-pruefung-" + (numero += 1);
        mark.setAttribute("data-mt-pruefung", "offen");
        mark.setAttribute("data-mt-pruefung-ero", marko.ero);
        mark.setAttribute("data-mt-pruefung-satz", marko.satz);
        mark.setAttribute("role", "group");
        mark.setAttribute("aria-label", "Prüfung offen");
        if (getComputedStyle(element).display.startsWith("inline")) mark.setAttribute("data-mt-pruefung-inline", "");
        if (element.hasAttribute("slot")) {
          mark.setAttribute("slot", element.getAttribute("slot"));
          element.removeAttribute("slot");
        }
        if (!fokusebla(element)) mark.setAttribute("tabindex", "0");
        element.replaceWith(mark);
        mark.append(element);
        const konsileto = document.createElement("fm-konsileto");
        konsileto.setAttribute("for", mark.id);
        konsileto.textContent = marko.satz;
        document.body.append(konsileto);
      }
    }
  };
  const eroj = [...new Set(markoj.map((marko) => "fm-" + marko.ero))];
  if (eroj.length > 0) Promise.all(eroj.map((name) => customElements.whenDefined(name))).then(marku);
}`;

/** The marks on a page of the stage: its style, the marks as JSON and the client that sets them. */
export function pruefungHtml(markoj: readonly Pruefmarko[]): string {
  return `<style>${PRUEFUNG_CSS}</style>
<script type="application/json" id="mt-pruefung">${jsonIsland(markoj)}</script>
<script>${PRUEFUNG_SKRIPTO}</script>`;
}
