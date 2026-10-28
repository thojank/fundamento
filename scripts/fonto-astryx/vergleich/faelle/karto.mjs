// karto ↔ Card (Abgleich ②a). Der Maintainer sah im Storybook: weiß, feiner Rand, leichter
// Schatten – die Card der Fonto mit elevation="low" (im Standard ist sie flach; offen im Bericht).
export default {
  ero: "karto",
  quelle: { Card: "packages/core/src/Card/Card.tsx" },
  zustaende: { rest: {} },
  fm: {
    tag: "fm-karto",
    attrs: { level: "3" },
    inner: '<span slot="heading">Titel</span><span slot="content">Inhalt der Karte.</span>',
  },
  fonto: {
    comp: "Card",
    props: { elevation: "low" },
    children: [
      { comp: "Heading", props: { level: 3 }, children: "Titel" },
      { comp: "Text", props: {}, children: "Inhalt der Karte." },
    ],
  },
  teile: {
    control: "&",
    body: "&",
    heading: "h3",
    content: "span[data-type=body]",
  },
  breite: 280,
};
