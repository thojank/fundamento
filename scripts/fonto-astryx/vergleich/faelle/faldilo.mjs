// faldilo ↔ Collapsible: open ↔ defaultIsOpen; Hover und Fokus auf dem Auslöser.
export default {
  ero: "faldilo",
  quelle: { Collapsible: "packages/core/src/Collapsible/Collapsible.tsx" },
  kombinoj: [
    { fm: { open: "false" }, fonto: { defaultIsOpen: false } },
    { fm: { open: "true" }, fonto: { defaultIsOpen: true } },
  ],
  zustaende: { rest: {}, hover: { interago: "hover" }, focus: { interago: "focus" } },
  fm: {
    tag: "fm-faldilo",
    // open="false" stünde als gesetztes Attribut für offen: zu heißt ohne Attribut.
    html: (a, inner) => `<fm-faldilo${a.replace(' open="false"', "")}>${inner}</fm-faldilo>`,
    inner: '<span slot="summary">Lieferbedingungen</span><fm-teksto>Inhalt</fm-teksto>',
  },
  fonto: {
    comp: "Collapsible",
    props: { trigger: "Lieferbedingungen" },
    children: { comp: "Text", props: {}, children: "Inhalt" },
  },
  teile: {
    summary: "button[aria-expanded]",
    indicator: "button[aria-expanded] > span[aria-hidden]",
    // Schrift und Farbe trägt der Text, den Innenabstand der Bereich um ihn.
    content: { "": "button + div span[data-type=body]", "padding-inline": "button + div" },
    // Die Bewegung der Fonto ist die Drehung des Pfeils.
    control: {
      "": "&",
      "transition-duration": "button[aria-expanded] > span[aria-hidden]",
      "transition-timing-function": "button[aria-expanded] > span[aria-hidden]",
    },
  },
  ziel: { fm: '[part="summary"]', fonto: "button[aria-expanded]" },
  breite: 320,
};
