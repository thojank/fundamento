// apartigilo ↔ Divider (variant subtle). Die Fonto malt die Linie als 1-px-Fläche (background des
// inneren div), nicht als Rand, und hat senkrecht keine Mindesthöhe: border-color, border-width und
// min-block-size haben kein Gegenstück, es wird nichts gemessen; die Fälle dienen dem Bild.
export default {
  ero: "apartigilo",
  quelle: { Divider: "packages/core/src/Divider/Divider.tsx" },
  kombinoj: [
    { fm: { orientation: "horizontal" }, fonto: { orientation: "horizontal" } },
    { fm: { orientation: "vertical" }, fonto: { orientation: "vertical" } },
  ],
  zustaende: { rest: {} },
  fm: { tag: "fm-apartigilo" },
  fonto: { comp: "Divider", props: {} },
  teile: {},
  breite: 200,
  hoehe: 40,
};
