// sxaltilo ↔ Switch (Abgleich ②a): checked ist eine Prop (E2) → Kombination (value false/true);
// Größen sm/md (large ohne Gegenstück). Laden und Status der Fonto haben im Skemo keinen Zustand.
// Die Spur der Fonto hat eine feste Breite (width), min-inline-size misst dort auto; die Breite
// steht in @box.
export default {
  ero: "sxaltilo",
  quelle: { Switch: "packages/core/src/Switch/Switch.tsx" },
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
  },
  fm: { tag: "fm-sxaltilo", inner: "Benachrichtigungen" },
  fonto: { comp: "Switch", props: { label: "Benachrichtigungen" } },
  teile: {
    // Die Zeile aus Schalter und Beschriftung (data-astryx-pressable fehlt, wenn deaktiviert).
    field: "div:has(> div > input)",
    control: "div[aria-hidden=true][data-size]",
    indicator: "div[aria-hidden=true][data-size] > div",
    label: "label",
  },
  ziel: { fm: '[part="control"]', fonto: "input" },
};
