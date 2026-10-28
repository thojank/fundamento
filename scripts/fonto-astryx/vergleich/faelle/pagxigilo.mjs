// pagxigilo ↔ Pagination (variant pages, Größe md), Seite 5 von 10: beide Auslassungen. Das erste
// item ist auf beiden Seiten der Zurück-Knopf; deaktiviert ist er auf Seite 1 (beide Seiten).
// Schrift und Innenabstand der Seiten misst ein Seitenknopf (der Zurück-Knopf ist nur ein Icon).
const SEITE = "nav > div > button:nth-of-type(2)";
export default {
  ero: "pagxigilo",
  quelle: {
    Pagination: "packages/core/src/Pagination/Pagination.tsx",
    Button: "packages/core/src/Button/Button.tsx",
  },
  zustaende: {
    rest: {},
    hover: { interago: "hover" },
    focus: { interago: "focus" },
    disabled: { fm: { page: "1" }, fonto: { page: 1 } },
  },
  fm: { tag: "fm-pagxigilo", attrs: { label: "Seiten", page: "5", "total-pages": "10" } },
  fonto: { comp: "Pagination", props: { page: 5, totalPages: 10, label: "Seiten" } },
  teile: {
    item: {
      "": "nav > div > button",
      "padding-inline": SEITE,
      "font-family": SEITE,
      "font-size": SEITE,
      "font-weight": SEITE,
      "letter-spacing": SEITE,
      "line-height": SEITE,
      "text-transform": SEITE,
    },
    ellipsis: "nav > div > span",
    prev: "nav > div > button:first-of-type svg",
    next: "nav > div > button:last-of-type svg",
    pages: "nav > div",
  },
  ziel: { fm: '[part="item"]', fonto: "nav > div > button" },
};
