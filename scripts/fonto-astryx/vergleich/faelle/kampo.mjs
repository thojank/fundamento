// kampo ↔ TextInput (Field) (Abgleich ②a): Größen sm/md/lg, deaktiviert, nur lesbar, ungültig
// (status error mit Meldung unter dem Feld).
export default {
  ero: "kampo",
  quelle: {
    TextInput: "packages/core/src/TextInput/TextInput.tsx",
    Field: "packages/core/src/Field/inputStyles.stylex.ts",
  },
  groessen: { small: { size: "sm" }, medium: { size: "md" }, large: { size: "lg" } },
  zustaende: {
    rest: {},
    hover: { interago: "hover" },
    focus: { interago: "focus" },
    disabled: { fm: { disabled: "" }, fonto: { isDisabled: true } },
    readonly: { fm: { readonly: "" }, fonto: { isReadOnly: true } },
    invalid: {
      fm: { invalid: "" },
      fonto: { status: { type: "error", message: "Pflichtfeld" }, statusVariant: "detached" },
    },
  },
  fm: {
    tag: "fm-kampo",
    attrs: { placeholder: "Platzhalter", required: "" },
    inner: ({ state }) =>
      `Name<span slot="help">Hilfe</span>${state === "invalid" ? '<span slot="error">Pflichtfeld</span>' : ""}`,
  },
  fonto: {
    comp: "TextInput",
    props: { label: "Name", description: "Hilfe", placeholder: "Platzhalter", isRequired: true },
  },
  teile: {
    // Der Kasten der Fonto ist das div um das Eingabefeld; Schrift und Farbe trägt das input.
    control: {
      "": "div[data-size]",
      "padding-inline": "div[data-size]",
      color: "input",
      "font-family": "input",
      "font-size": "input",
      "font-weight": "input",
      "letter-spacing": "input",
      "line-height": "input",
      "text-transform": "input",
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
