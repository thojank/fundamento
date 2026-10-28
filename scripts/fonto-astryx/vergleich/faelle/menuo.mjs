// menuo ↔ DropdownMenu, geöffnet gemessen; Einträge wie in der Vitrino. Das Menü der Fonto ist fest
// popover="auto": andere Überlagerungen und jedes Drücken auf der Seite schließen es. Darum öffnet
// es erst das Drücken auf den Auslöser (die Maus öffnet beim Niederdrücken), in jedem Zustand. Hover
// und Fokus auf einem Eintrag brauchten ein schon offenes Menü: nicht abgebildet. Deaktiviert: der
// erste Eintrag ist es.
const eintraege = (disabled) => [
  { label: "Bearbeiten", ...(disabled ? { isDisabled: true } : {}) },
  { label: "Duplizieren", isDisabled: true },
  { type: "divider" },
  { label: "Löschen", variant: "destructive" },
];
export default {
  ero: "menuo",
  quelle: {
    DropdownMenu: "packages/core/src/DropdownMenu/DropdownMenu.tsx",
    DropdownMenuItem: "packages/core/src/DropdownMenu/DropdownMenuItem.tsx",
  },
  zustaende: {
    rest: { interago: "press" },
    disabled: { interago: "press", fonto: { items: eintraege(true) } },
  },
  fm: {
    tag: "fm-menuo",
    attrs: { label: "Aktionen", open: "" },
    inner: ({ state }) =>
      `<data value="edit"${state === "disabled" ? " disabled" : ""}>Bearbeiten</data><data value="duplicate" disabled>Duplizieren</data><fm-apartigilo></fm-apartigilo><data value="delete" intent="danger">Löschen</data>`,
  },
  fonto: {
    comp: "DropdownMenu",
    props: { button: { label: "Aktionen" }, items: eintraege(false) },
  },
  teile: {
    // Fläche, Radius, Schatten trägt das div im Popover, Innenabstand und Abstand das Menü. Die
    // maximale Breite folgt dem Viewport (keine Entsprechung): ungemessen.
    control: {
      "": "[popover] > div",
      padding: "[role=menu]",
      gap: "[role=menu]",
      "max-inline-size": ":not(*)",
    },
    item: "[role=menuitem]",
  },
  ziel: { fm: '[part="trigger"]', fonto: "button[aria-haspopup]" },
  breite: 280,
  hoehe: 220,
};
