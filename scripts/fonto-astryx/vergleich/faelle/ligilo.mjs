// ligilo ↔ Link. inline ↔ Link mit hasUnderline (immer unterstrichen, wie im Fließtext),
// standalone ↔ isStandalone. Größen nicht: die Fonto hat nur Textgrößen, keine Stufen des Links.
// visited hat kein Gegenstück.
export default {
  ero: "ligilo",
  quelle: { Link: "packages/core/src/Link/Link.tsx", Text: "packages/core/src/Text/Text.tsx" },
  kombinoj: [
    { fm: { placement: "inline" }, fonto: { hasUnderline: true } },
    { fm: { placement: "standalone" }, fonto: { isStandalone: true } },
  ],
  zustaende: {
    rest: {},
    hover: { interago: "hover" },
    pressed: { interago: "press" },
    focus: { interago: "focus" },
  },
  fm: { tag: "fm-ligilo", attrs: { to: "#ziel" }, inner: "Projekt A" },
  fonto: { comp: "Link", props: { href: "#ziel" }, children: "Projekt A" },
  teile: {
    // Den Kasten trägt das a, die Schrift das Text-span darin.
    control: {
      "": "a",
      "font-family": "a > span",
      "font-size": "a > span",
      "font-weight": "a > span",
      "letter-spacing": "a > span",
      "line-height": "a > span",
      "text-transform": "a > span",
    },
  },
  ziel: { fm: '[part="control"]', fonto: "a" },
};
