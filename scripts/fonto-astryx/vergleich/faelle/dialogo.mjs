// dialogo ↔ Dialog (Abgleich ②a), inline geöffnet gemessen; Titel und Nachricht im DialogHeader.
export default {
  ero: "dialogo",
  quelle: {
    Dialog: "packages/core/src/Dialog/Dialog.tsx",
    DialogHeader: "packages/core/src/Dialog/DialogHeader.tsx",
  },
  // Die Fonto hat eine Breite (400 px); sie ist das Gegenstück von small, medium hat keins.
  groessen: { small: {} },
  zustaende: { rest: {} },
  fm: {
    tag: "fm-dialogo",
    attrs: { open: "" },
    inner: 'Titel<span slot="message">Nachricht des Dialogs.</span>',
  },
  fonto: {
    comp: "Dialog",
    props: { isOpen: true, isInline: true },
    children: [
      { comp: "DialogHeader", props: { title: "Titel" } },
      { comp: "Text", props: {}, children: "Nachricht des Dialogs." },
    ],
  },
  teile: {
    // Der Container trägt Fläche, Radius und Schatten; den Innenabstand das Element darin.
    control: {
      "": "div[data-variant]",
      padding: "div[data-variant] > div",
      gap: "div[data-variant] > div > div > div > div",
    },
    heading: "h2",
    message: "span[data-type=body]",
  },
  breite: 520,
  hoehe: 240,
};
