// kompletigilo ↔ Typeahead (Abgleich ②a): Größen sm/md/lg, deaktiviert, ungültig (status error mit
// Meldung). Die Quelle der Vorschläge der Fonto ist eine Funktion und lässt sich hier nicht
// übergeben: die Liste bleibt leer, Vorschläge und „keine Treffer“ sind nicht messbar. Die Liste
// selbst (Fläche im geschlossenen Popover) wird ohne Größe gemessen.
const KEIN = "[data-kein-gegenstueck]";
export default {
  ero: "kompletigilo",
  quelle: {
    Typeahead: "packages/core/src/Typeahead/Typeahead.tsx",
    BaseTypeahead: "packages/core/src/Typeahead/BaseTypeahead.tsx",
  },
  groessen: { small: { size: "sm" }, medium: { size: "md" }, large: { size: "lg" } },
  zustaende: {
    rest: {},
    hover: { interago: "hover" },
    focus: { interago: "focus" },
    disabled: { fm: { disabled: "" }, fonto: { isDisabled: true } },
    invalid: {
      fm: { invalid: "" },
      fonto: { status: { type: "error", message: "Pflichtfeld" }, statusVariant: "detached" },
    },
  },
  fm: {
    tag: "fm-kompletigilo",
    attrs: { placeholder: "Platzhalter", required: "" },
    inner: ({ state }) =>
      `Ort<data slot="options" value="1">Eins</data><data slot="options" value="2">Zwei</data><data slot="options" value="3">Drei</data><span slot="help">Hilfe</span>${state === "invalid" ? '<span slot="error">Pflichtfeld</span>' : ""}`,
  },
  fonto: {
    comp: "Typeahead",
    props: {
      label: "Ort",
      description: "Hilfe",
      placeholder: "Platzhalter",
      isRequired: true,
      value: null,
      searchSource: {},
    },
  },
  teile: {
    control: {
      "": "div[data-size]",
      color: "input",
      "font-family": "input",
      "font-size": "input",
      "font-weight": "input",
      "letter-spacing": "input",
      "line-height": "input",
      "text-transform": "input",
    },
    // Die Fläche ist das div im Popover, die Höchsthöhe trägt die scrollende Liste darin; das
    // Popover liegt in der obersten Ebene (kein z-index), seine Höchstbreite folgt dem Viewport.
    listbox: {
      "": "div[popover] > div",
      "max-block-size": "div[popover] [role=listbox]",
      "max-inline-size": KEIN,
      "z-index": KEIN,
    },
    field: ":scope > div",
    label: "label",
    "required-mark": "label > span",
    help: "label + span",
    error: "div[data-type=error] > span > span:last-child",
  },
  ziel: { fm: '[part="control"]', fonto: "input" },
  breite: 280,
};
