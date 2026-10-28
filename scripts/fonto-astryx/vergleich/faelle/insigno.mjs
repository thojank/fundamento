// insigno ↔ Badge (Abgleich ②a): intent ↔ variant (danger = error). Der Badge hat keine Größe, also
// keine Größen im Vergleich; StatusDot ist kein Gegenstück (Grenze dot-only).
export default {
  ero: "insigno",
  quelle: { Badge: "packages/core/src/Badge/Badge.tsx" },
  kombinoj: [
    { fm: { intent: "neutral" }, fonto: { variant: "neutral" } },
    { fm: { intent: "info" }, fonto: { variant: "info" } },
    { fm: { intent: "success" }, fonto: { variant: "success" } },
    { fm: { intent: "warning" }, fonto: { variant: "warning" } },
    { fm: { intent: "danger" }, fonto: { variant: "error" } },
  ],
  zustaende: { rest: {} },
  fm: { tag: "fm-insigno", inner: "Gültig" },
  fonto: { comp: "Badge", props: { label: "Gültig" } },
  teile: { control: "&" },
};
