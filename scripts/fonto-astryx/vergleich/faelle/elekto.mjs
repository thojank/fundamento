// elekto ↔ RadioList mit RadioListItem (Abgleich ②a): Größen sm/md (large ohne Gegenstück),
// Zustände per Prop (deaktiviert, ungültig als status error) oder Interaktion an der ersten Option.
// indicator fehlt: in Fundamento die Fläche im Kreis (Kreis = indicator + Rand), in der Fonto ein
// kleiner Punkt mit Hintergrundfarbe – weder Größe noch color entsprechen sich.
export default {
  ero: "elekto",
  quelle: {
    RadioList: "packages/core/src/RadioList/RadioList.tsx",
    RadioListItem: "packages/core/src/RadioList/RadioListItem.tsx",
  },
  groessen: { small: { size: "sm" }, medium: { size: "md" } },
  zustaende: {
    rest: {},
    hover: { interago: "hover" },
    focus: { interago: "focus" },
    disabled: { fm: { disabled: "" }, fonto: { isDisabled: true } },
    invalid: { fm: { invalid: "" }, fonto: { status: { type: "error", message: "Fehler" } } },
  },
  fm: {
    tag: "fm-elekto",
    attrs: { value: "1", required: "" },
    inner: ({ state }) =>
      `Auswahl<data slot="options" value="1">Eins</data><data slot="options" value="2">Zwei</data><data slot="options" value="3">Drei</data>${state === "invalid" ? '<span slot="error">Fehler</span>' : '<span slot="help">Hinweis</span>'}`,
  },
  fonto: (props, { state }) => ({
    comp: "RadioList",
    props: {
      label: "Auswahl",
      value: "1",
      isRequired: true,
      ...(state === "invalid" ? {} : { description: "Hinweis" }),
      ...props,
    },
    children: [
      { comp: "RadioListItem", props: { value: "1", label: "Eins" } },
      { comp: "RadioListItem", props: { value: "2", label: "Zwei" } },
      { comp: "RadioListItem", props: { value: "3", label: "Drei" } },
    ],
  }),
  teile: {
    // Mit Beschreibung steht die Beschriftung in einem Kopf-div, ohne (ungültig) direkt im Wurzel-div.
    label: ":scope > div > div:first-child > span:first-child, :scope > div > span:first-child",
    "required-mark":
      ":scope > div > div:first-child > span:first-child > span, :scope > div > span:first-child > span",
    help: ":scope > div > div:first-child > span:nth-child(2)",
    error: "[data-type=error] > span > span:last-child",
    options: "[role=radiogroup]",
    option: "[role=radiogroup] > div",
    "option-label": "[role=radiogroup] > div > span:last-child > span",
    // Der Kreis der ersten (gewählten) Option.
    control: "[role=radiogroup] span[aria-hidden=true][data-size]",
  },
  ziel: { fm: '[part="option"]', fonto: "input[type=radio]" },
  breite: 280,
};
