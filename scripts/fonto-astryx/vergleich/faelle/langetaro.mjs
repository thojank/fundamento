// langetaro ↔ TabList mit Tab (role="tablist", hasDivider: die Linie unter den Reitern wie bei
// Fundamento). Gemessen wird der erste Reiter; aktiv ist der dritte, damit die Werte des Reiters
// in Ruhe gemessen werden (das Gewicht des aktiven hat ein eigenes Token). disabled ohne Fall: der Tab der
// Fonto mit aria-disabled sieht aus wie in Ruhe (nur Cursor und kein Hover). Die Fonto hat kein Panel.
const TABS = ["Eins", "Zwei", "Drei"];
const TAB = "[role=tab]";
export default {
  ero: "langetaro",
  quelle: {
    TabList: "packages/core/src/TabList/TabList.tsx",
    Tab: "packages/core/src/TabList/Tab.tsx",
  },
  zustaende: {
    rest: {},
    hover: { interago: "hover" },
    focus: { interago: "focus" },
  },
  fm: {
    tag: "fm-langetaro",
    attrs: { label: "Reiter", selected: "3" },
    inner:
      TABS.map((text, i) => `<data value="${i + 1}">${text}</data>`).join("") +
      '<div slot="panel">Drei</div>',
  },
  fonto: {
    comp: "TabList",
    props: { value: "3", role: "tablist", label: "Reiter", hasDivider: true },
    children: TABS.map((text, i) => ({
      comp: "Tab",
      props: { value: String(i + 1), label: text },
    })),
  },
  teile: {
    // Die Fläche beim Hover malt die Fonto auf einer Ebene im Reiter (erstes span). Den Strich unter
    // dem aktiven Reiter malt sie als 2-px-Fläche (span), nicht als Rand: border-block-end-* des
    // Reiters bleibt ungemessen.
    tab: {
      "min-block-size": TAB,
      "padding-inline": TAB,
      "font-family": TAB,
      "font-size": TAB,
      "font-weight": TAB,
      "letter-spacing": TAB,
      "line-height": TAB,
      "text-transform": TAB,
      "outline-width": TAB,
      "outline-style": TAB,
      "outline-color": TAB,
      "outline-offset": TAB,
      "box-shadow": TAB,
      "background-color": `${TAB} > span:first-child`,
      color: TAB,
    },
    // Die Trennlinie (hasDivider) trägt der äußere Container, den Abstand der Reiter die Liste.
    control: { "": "&", gap: "[role=tablist]" },
  },
  ziel: { fm: '[part="tab"]', fonto: TAB },
};
