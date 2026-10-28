// titolo ↔ Heading: display-1…3 ↔ type display-1…3 (Ebene 1), headline-1…4 ↔ Ebene 1…4 (Größe aus
// der Ebene). Die Ebene von Fundamento folgt der Größe (wie in der Vitrino), sie ist keine Achse.
const LEVEL = {
  "display-1": 1,
  "display-2": 1,
  "display-3": 1,
  "headline-1": 1,
  "headline-2": 2,
  "headline-3": 3,
  "headline-4": 4,
};
export default {
  ero: "titolo",
  quelle: {
    Heading: "packages/core/src/Heading/Heading.tsx",
    Text: "packages/core/src/Text/Text.tsx",
  },
  kombinoj: [
    { fm: { size: "display-1" }, fonto: { level: 1, type: "display-1" } },
    { fm: { size: "display-2" }, fonto: { level: 1, type: "display-2" } },
    { fm: { size: "display-3" }, fonto: { level: 1, type: "display-3" } },
    { fm: { size: "headline-1" }, fonto: { level: 1 } },
    { fm: { size: "headline-2" }, fonto: { level: 2 } },
    { fm: { size: "headline-3" }, fonto: { level: 3 } },
    { fm: { size: "headline-4" }, fonto: { level: 4 } },
  ],
  zustaende: { rest: {} },
  fm: {
    tag: "fm-titolo",
    html: (attrs, inner, { size }) =>
      `<fm-titolo${attrs} level="${LEVEL[size]}">${inner}</fm-titolo>`,
    inner: "Geltung",
  },
  fonto: { comp: "Heading", props: {}, children: "Geltung" },
  teile: { text: "&" },
};
