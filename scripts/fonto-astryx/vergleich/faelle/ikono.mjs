// ikono ↔ Icon (Abgleich ②a): Größen sm/md/lg; intent ↔ color (neutral = inherit, danger = error).
// info ohne Gegenstück (die Fonto hat keine Info-Farbe, accent ist keine Statusfarbe). Ein
// Status-Intent wirkt in Fundamento nur mit Namen (Regulo icon-meaning-named): beide Seiten bekommen
// dann ein Label. Das Ikonaro (Phosphor) und die Icons der Fonto unterscheiden sich in der Glyphe.
const NAMEN = { success: "Erfolg", warning: "Warnung", danger: "Fehler" };
export default {
  ero: "ikono",
  quelle: { Icon: "packages/core/src/Icon/Icon.tsx" },
  kombinoj: [
    { fm: { intent: "neutral" }, fonto: { color: "inherit" } },
    { fm: { intent: "success" }, fonto: { color: "success", label: NAMEN.success } },
    { fm: { intent: "warning" }, fonto: { color: "warning", label: NAMEN.warning } },
    { fm: { intent: "danger" }, fonto: { color: "error", label: NAMEN.danger } },
  ],
  groessen: { small: { size: "sm" }, medium: { size: "md" }, large: { size: "lg" } },
  zustaende: { rest: {} },
  fm: {
    tag: "fm-ikono",
    attrs: { name: "check" },
    html: (attrs, inner, { intent }) =>
      `<fm-ikono${attrs}${NAMEN[intent] ? ` label="${NAMEN[intent]}"` : ""}></fm-ikono>`,
  },
  fonto: { comp: "Icon", props: { icon: "check" } },
  // Die Fonto: ein span mit Größe und Farbe, darin das SVG (1em, currentColor).
  teile: { glyph: "&" },
};
