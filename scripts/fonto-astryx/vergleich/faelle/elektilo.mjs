// elektilo ↔ Selector (variant input; Abgleich ②a): Größen sm/md/lg, deaktiviert, ungültig (status
// error mit Meldung). Beide Seiten mit gewählter Option, damit der Text die Textfarbe zeigt.
// Abstand am Ende und Ränder des Indikators rechnet Fundamento aus Innenabstand, Indikator und
// Lücke; die Fonto legt den Indikator in den Fluss – kein Gegenstück, nicht gemessen (KEIN).
const KEIN = "[data-kein-gegenstueck]";
const text = "div[data-variant] > button > span";
export default {
  ero: "elektilo",
  quelle: {
    Selector: "packages/core/src/Selector/Selector.tsx",
    selectorPresentation: "packages/core/src/Selector/selectorPresentation.stylex.ts",
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
    tag: "fm-elektilo",
    attrs: { placeholder: "Bitte wählen", value: "1", required: "" },
    inner: ({ state }) =>
      `Auswahl<data slot="options" value="1">Eins</data><data slot="options" value="2">Zwei</data><data slot="options" value="3">Drei</data><span slot="help">Hilfe</span>${state === "invalid" ? '<span slot="error">Pflichtfeld</span>' : ""}`,
  },
  fonto: {
    comp: "Selector",
    props: {
      label: "Auswahl",
      description: "Hilfe",
      placeholder: "Bitte wählen",
      value: "1",
      isRequired: true,
      options: [
        { value: "1", label: "Eins" },
        { value: "2", label: "Zwei" },
        { value: "3", label: "Drei" },
      ],
    },
  },
  teile: {
    // Kasten am div[data-variant]; Schrift und Farbe am Text im Auslöser.
    control: {
      "": "div[data-variant]",
      "padding-inline-end": KEIN,
      color: text,
      "font-family": text,
      "font-size": text,
      "font-weight": text,
      "letter-spacing": text,
      "line-height": text,
      "text-transform": text,
    },
    indicator: { "": "span[data-state]", "margin-inline-start": KEIN, "margin-inline-end": KEIN },
    field: ":scope > div",
    label: "label",
    "required-mark": "label > span",
    help: "label + span",
    error: "div[data-type=error] > span > span:last-child",
  },
  ziel: { fm: '[part="control"]', fonto: "div[data-variant] > button" },
  breite: 280,
};
