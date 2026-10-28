// markobutono ↔ CheckboxInput (Abgleich ②a): checked ist eine Prop (E2) → Kombination (value
// false/true); Größen sm/md (large ohne Gegenstück); ungültig = status error (in der Fonto eine
// abgesetzte Meldung mit Fläche und Icon, gemessen wird ihr Text). indicator ist das Häkchen (SVG);
// das Kästchen der Fonto ist größer als Häkchen plus Rand. Ungewählt blendet die Fonto es aus (0×0).
export default {
  ero: "markobutono",
  quelle: { CheckboxInput: "packages/core/src/CheckboxInput/CheckboxInput.tsx" },
  kombinoj: [
    { fm: {}, fonto: { value: false } },
    { fm: { checked: "" }, fonto: { value: true } },
  ],
  groessen: { small: { size: "sm" }, medium: { size: "md" } },
  zustaende: {
    rest: {},
    hover: { interago: "hover" },
    focus: { interago: "focus" },
    disabled: { fm: { disabled: "" }, fonto: { isDisabled: true } },
    invalid: { fm: { invalid: "" }, fonto: { status: { type: "error", message: "Fehler" } } },
  },
  fm: {
    tag: "fm-markobutono",
    attrs: { required: "" },
    inner: ({ state }) =>
      `Zustimmen${state === "invalid" ? '<span slot="error">Fehler</span>' : ""}`,
  },
  fonto: { comp: "CheckboxInput", props: { label: "Zustimmen", isRequired: true } },
  teile: {
    // Die Zeile aus Kästchen und Beschriftung (data-astryx-pressable fehlt, wenn deaktiviert).
    field: "div:has(> div > input)",
    // Das Kästchen ist das span direkt im Wrapper neben dem input (nicht der Punkt darin).
    control: "input + span > span[data-size]",
    indicator: "svg[data-size]",
    label: "label",
    "required-mark": "label > span",
    error: "[data-type=error] > span > span:last-child",
  },
  ziel: { fm: '[part="control"]', fonto: "input" },
};
