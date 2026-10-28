// mezurilo ↔ ProgressBar mit Wertbeschriftung, Wert 66: intent neutral ↔ variant neutral, success,
// warning, danger ↔ error (theme-neutral überschreibt die Farben je Variante, progress-bar).
export default {
  ero: "mezurilo",
  quelle: { ProgressBar: "packages/core/src/ProgressBar/ProgressBar.tsx" },
  kombinoj: [
    { fm: { intent: "neutral" }, fonto: { variant: "neutral" } },
    { fm: { intent: "success" }, fonto: { variant: "success" } },
    { fm: { intent: "warning" }, fonto: { variant: "warning" } },
    { fm: { intent: "danger" }, fonto: { variant: "error" } },
  ],
  zustaende: { rest: {} },
  fm: {
    tag: "fm-mezurilo",
    attrs: { value: "66" },
    inner: 'Prüfbar<span slot="value-text">66 %</span>',
  },
  fonto: { comp: "ProgressBar", props: { label: "Prüfbar", value: 66, hasValueLabel: true } },
  teile: {
    track: "[role=progressbar]",
    fill: "[role=progressbar] > div",
    label: "span",
    "value-text": "span + span",
    control: "&",
  },
  breite: 280,
};
