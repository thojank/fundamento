// butono ↔ Button (Abgleich ②a; Briefing ①b: high = primary, medium = secondary, low = ghost,
// intent=danger = destructive).
export default {
  ero: "butono",
  quelle: { Button: "packages/core/src/Button/Button.tsx" },
  kombinoj: [
    { fm: { emphasis: "high", intent: "neutral" }, fonto: { variant: "primary" } },
    { fm: { emphasis: "high", intent: "danger" }, fonto: { variant: "destructive" } },
    { fm: { emphasis: "medium", intent: "neutral" }, fonto: { variant: "secondary" } },
    { fm: { emphasis: "low", intent: "neutral" }, fonto: { variant: "ghost" } },
  ],
  groessen: { small: { size: "sm" }, medium: { size: "md" }, large: { size: "lg" } },
  zustaende: {
    rest: {},
    hover: { interago: "hover" },
    pressed: { interago: "press" },
    focus: { interago: "focus" },
    disabled: { fm: { disabled: "" }, fonto: { isDisabled: true } },
    loading: { fm: { loading: "" }, fonto: { isLoading: true } },
  },
  fm: { tag: "fm-butono", inner: "Aktion" },
  fonto: { comp: "Button", props: { label: "Aktion" } },
  teile: { control: "button" },
  ziel: { fm: '[part="control"]', fonto: "button" },
};
