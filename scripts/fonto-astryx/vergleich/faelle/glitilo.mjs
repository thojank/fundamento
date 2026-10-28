// glitilo ↔ Slider (Abgleich ②a): ein Wert, ohne Größe; Wertanzeige aus (valueDisplay none = ohne
// field). Hover, gedrückt und Fokus am Griff; ungültig = status error. readonly ist im Skemo kein
// Zustand, die Fonto kennt es nicht. Die Höhe der Spur setzt die Fonto mit height (min-block-size
// misst 0px, die Höhe steht in @box).
export default {
  ero: "glitilo",
  quelle: { Slider: "packages/core/src/Slider/Slider.tsx" },
  zustaende: {
    rest: {},
    hover: { interago: "hover" },
    focus: { interago: "focus" },
    pressed: { interago: "press" },
    disabled: { fm: { disabled: "" }, fonto: { isDisabled: true } },
    invalid: { fm: { invalid: "" }, fonto: { status: { type: "error", message: "Fehler" } } },
  },
  fm: {
    tag: "fm-glitilo",
    attrs: { value: "40", required: "" },
    inner: ({ state }) =>
      `Lautstärke${state === "invalid" ? '<span slot="error">Fehler</span>' : '<span slot="help">Zwischen 0 und 100.</span>'}`,
  },
  fonto: (props, { state }) => ({
    comp: "Slider",
    props: {
      label: "Lautstärke",
      value: 40,
      isRequired: true,
      valueDisplay: "none",
      ...(state === "invalid" ? {} : { description: "Zwischen 0 und 100." }),
      ...props,
    },
  }),
  teile: {
    // Mit Beschreibung steht die Beschriftung in einem Kopf-div, ohne (ungültig) direkt im Wurzel-div.
    label: ":scope > div > div:first-child > span:first-child, :scope > div > span:first-child",
    "required-mark":
      ":scope > div > div:first-child > span:first-child > span, :scope > div > span:first-child > span",
    help: ":scope > div > div:first-child > span:nth-child(2)",
    error: "[data-type=error] > span > span:last-child",
    // Die Zeile um die Spur (in der Fonto neben ihr der Wert als Text, valueDisplay text).
    row: "div[data-orientation]:has(> div > [role=slider])",
    track: "div:has(> [role=slider]) > div:first-child",
    fill: "div:has(> [role=slider]) > div:nth-child(2)",
    thumb: "[role=slider]",
  },
  ziel: { fm: '[part="thumb"]', fonto: "[role=slider]" },
  breite: 280,
};
