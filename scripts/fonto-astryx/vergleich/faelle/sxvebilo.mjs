// sxvebilo ↔ Popover, geöffnet gemessen (isOpen). hasLightDismiss=false macht daraus
// popover="manual": mehrere popover="auto" auf der Seite schlössen sich gegenseitig.
export default {
  ero: "sxvebilo",
  quelle: { Popover: "packages/core/src/Popover/Popover.tsx" },
  zustaende: { rest: {} },
  fm: {
    tag: "fm-sxvebilo",
    attrs: { label: "Überschrift", open: "" },
    inner:
      '<fm-butono slot="trigger" emphasis="medium">Öffnen</fm-butono><span slot="heading">Überschrift</span><fm-teksto>Inhalt</fm-teksto>',
  },
  fonto: {
    comp: "Popover",
    props: {
      isOpen: true,
      label: "Überschrift",
      hasCloseButton: false,
      isModal: false,
      hasAutoFocus: false,
      hasLightDismiss: false,
      content: [
        { comp: "Heading", props: { level: 4 }, children: "Überschrift" },
        { comp: "Text", props: {}, children: "Inhalt" },
      ],
    },
    children: { comp: "Button", props: { label: "Öffnen", variant: "secondary" } },
  },
  teile: {
    // Fläche, Radius, Schatten und Innenabstand trägt das div[role=dialog]. Die maximale Breite
    // der Fonto folgt dem Viewport (keine Entsprechung): ":not(*)" trifft nichts, bleibt ungemessen.
    control: { "": "[role=dialog]", "max-inline-size": ":not(*)" },
    heading: "[role=dialog] h4",
    content: "[role=dialog] span[data-type=body]",
  },
  ziel: { fm: '[slot="trigger"]', fonto: "button" },
  breite: 320,
  hoehe: 200,
};
