// navigado ↔ TopNav (horizontal) bzw. SideNav (vertikal), je drei Einträge, der erste aktuell.
// Gemessen wird nur der Abstand der Liste; die Einträge sind Light-DOM (ohne Teil), Hover und Fokus
// wirken auf keinen gemessenen Teil.
const ITEMS = ["Eins", "Zwei", "Drei"];
const items = (comp) =>
  ITEMS.map((label, i) => ({
    comp,
    props: { label, href: `#${label.toLowerCase()}`, ...(i === 0 ? { isSelected: true } : {}) },
  }));
export default {
  ero: "navigado",
  quelle: {
    TopNav: "packages/core/src/TopNav/TopNav.tsx",
    SideNav: "packages/core/src/SideNav/SideNav.tsx",
    TopNavItem: "packages/core/src/TopNav/TopNavItem.tsx",
    SideNavItem: "packages/core/src/SideNav/SideNavItem.tsx",
  },
  kombinoj: [
    { fm: { orientation: "horizontal" }, fonto: {} },
    { fm: { orientation: "vertical" }, fonto: {} },
  ],
  zustaende: { rest: {} },
  fm: {
    tag: "fm-navigado",
    attrs: { label: "Navigation", page: "1" },
    inner: ITEMS.map(
      (text, i) => `<a href="#${text.toLowerCase()}" data-page="${i + 1}">${text}</a>`,
    ).join(""),
  },
  fonto: (props, { orientation }) =>
    orientation === "vertical"
      ? { comp: "SideNav", props, children: items("SideNavItem") }
      : { comp: "TopNav", props: { label: "Navigation", ...props }, children: items("TopNavItem") },
  teile: {
    // TopNav: das div, das die Links direkt hält; SideNav: das div um die Hüllen der Einträge
    // (nur dort tragen die Links data-size).
    list: "nav > div > div:has(> a), nav > div:has(> div > a[data-size])",
  },
  breite: 260,
};
