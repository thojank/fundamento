// konsileto ↔ Tooltip, geöffnet gemessen. Die Fonto hält ihn mit isOpen offen; Fundamento öffnet
// ihn beim Überfahren des Auslösers, darum führt auch "rest" den Hover auf dem Auslöser aus.
export default {
  ero: "konsileto",
  quelle: { Tooltip: "packages/core/src/Tooltip/Tooltip.tsx" },
  zustaende: { rest: { interago: "hover" } },
  fm: {
    tag: "fm-konsileto",
    // Der konsileto steht als erstes Kind (gemessen wird das erste Kind), der Auslöser daneben.
    html: () =>
      '<fm-konsileto for="fm-vergleich-konsileto">Suchen</fm-konsileto><fm-butono id="fm-vergleich-konsileto" emphasis="low">Suchen</fm-butono>',
  },
  fonto: {
    comp: "Tooltip",
    props: { isOpen: true, content: "Suchen" },
    children: { comp: "Button", props: { label: "Suchen", variant: "ghost" } },
  },
  teile: {
    // Fläche, Radius, Schrift trägt das div[role=tooltip]; den Innenabstand das div darin.
    control: { "": "[role=tooltip]", padding: "[role=tooltip] > div" },
  },
  ziel: { fm: "fm-butono", fonto: "button" },
  breite: 160,
  hoehe: 100,
};
