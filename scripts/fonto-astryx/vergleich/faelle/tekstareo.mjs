// tekstareo ↔ TextArea (Abgleich ②a): Größen sm/md/lg, deaktiviert, ungültig (status error mit
// Meldung unter dem Feld). kind=code hat kein Gegenstück; nur lesbar ist kein Zustand des Skemo.
export default {
  ero: "tekstareo",
  quelle: {
    TextArea: "packages/core/src/TextArea/TextArea.tsx",
    Field: "packages/core/src/Field/inputStyles.stylex.ts",
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
    tag: "fm-tekstareo",
    attrs: { placeholder: "Platzhalter", required: "", rows: "3" },
    inner: ({ state }) =>
      `Nachricht<span slot="help">Hilfe</span>${state === "invalid" ? '<span slot="error">Pflichtfeld</span>' : ""}`,
  },
  fonto: {
    comp: "TextArea",
    props: {
      label: "Nachricht",
      description: "Hilfe",
      placeholder: "Platzhalter",
      isRequired: true,
      rows: 3,
      value: "",
    },
  },
  teile: {
    // Der Kasten der Fonto ist das div um die textarea; Schrift, Farbe und Innenabstand trägt die textarea.
    control: {
      "": "div[data-size]",
      "padding-inline": "textarea",
      color: "textarea",
      "font-family": "textarea",
      "font-size": "textarea",
      "font-weight": "textarea",
      "letter-spacing": "textarea",
      "line-height": "textarea",
      "text-transform": "textarea",
    },
    field: ":scope > div",
    label: "label",
    "required-mark": "label > span",
    help: "label + span",
    error: "div[data-type=error] > span > span:last-child",
  },
  ziel: { fm: '[part="control"]', fonto: "textarea" },
  breite: 280,
};
