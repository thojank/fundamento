// spuro ↔ Breadcrumbs mit BreadcrumbItem, drei Ebenen, die letzte ist die aktuelle Seite. Gemessen
// werden nur Trenner und Abstand; die Einträge sind Light-DOM (ohne Teil), Hover und Fokus wirken
// auf keinen gemessenen Teil.
export default {
  ero: "spuro",
  quelle: {
    Breadcrumbs: "packages/core/src/Breadcrumbs/Breadcrumbs.tsx",
    BreadcrumbItem: "packages/core/src/Breadcrumbs/BreadcrumbItem.tsx",
  },
  zustaende: { rest: {} },
  fm: {
    tag: "fm-spuro",
    attrs: { label: "Navigation", page: "3" },
    inner:
      '<a href="#eins" data-page="1">Eins</a><a href="#zwei" data-page="2">Zwei</a><span data-page="3">Drei</span>',
  },
  fonto: {
    comp: "Breadcrumbs",
    props: { label: "Navigation" },
    children: [
      { comp: "BreadcrumbItem", props: { href: "#eins" }, children: "Eins" },
      { comp: "BreadcrumbItem", props: { href: "#zwei" }, children: "Zwei" },
      { comp: "BreadcrumbItem", props: { isCurrent: true }, children: "Drei" },
    ],
  },
  teile: {
    // Der Trenner der Fonto ist ein Zeichen „/“ (im ersten Eintrag verborgen), kein Icon: nur die
    // Farbe ist vergleichbar, seine Breite ist die Glyphe.
    separator: { color: "li + li > span[aria-hidden]" },
    items: "ol",
  },
};
