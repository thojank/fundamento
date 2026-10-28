// lokredaktilo ↔ TextInput (Abgleich ②a: kein eigenes Gegenstück; im Bearbeiten-Modus ein Textfeld).
// Verglichen wird Fundamento mit editing gegen ein Textfeld der Fonto (Beschriftung verborgen):
// deaktiviert, nur lesbar, ungültig (status error mit Meldung). Anzeige, Bearbeiten-, Speichern- und
// Abbrechen-Schaltfläche haben kein Gegenstück; die Breite des Textfelds der Fonto ist die des
// Falls, kein Maß der Fonto (KEIN).
const KEIN = "[data-kein-gegenstueck]";
export default {
  ero: "lokredaktilo",
  quelle: {
    TextInput: "packages/core/src/TextInput/TextInput.tsx",
    Field: "packages/core/src/Field/inputStyles.stylex.ts",
  },
  zustaende: {
    rest: {},
    hover: { interago: "hover" },
    focus: { interago: "focus" },
    disabled: { fm: { disabled: "" }, fonto: { isDisabled: true } },
    readonly: { fm: { readonly: "" }, fonto: { isReadOnly: true } },
    invalid: {
      fm: { invalid: "" },
      fonto: {
        status: { type: "error", message: "Gib einen Titel ein." },
        statusVariant: "detached",
      },
    },
  },
  fm: {
    tag: "fm-lokredaktilo",
    attrs: { label: "Titel", value: "Barrierefreiheit", editing: "" },
    inner: ({ state }) =>
      state === "invalid" ? '<span slot="error">Gib einen Titel ein.</span>' : "",
  },
  fonto: {
    comp: "TextInput",
    props: { label: "Titel", isLabelHidden: true, value: "Barrierefreiheit" },
  },
  teile: {
    field: { "": "div[data-size]", "inline-size": KEIN },
    error: "div[data-type=error] > span > span:last-child",
  },
  ziel: { fm: '[part="field"] [part="control"]', fonto: "input" },
  breite: 280,
};
