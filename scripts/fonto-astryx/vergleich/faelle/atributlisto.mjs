// atributlisto ↔ MetadataList mit MetadataListItem: columns ↔ Beschriftung vorn (Standard), stacked ↔
// Beschriftung oben; auto ohne Gegenstück. Alle Ero-Tokens liegen auf Light-DOM-Regeln (dl, dt, dd)
// ohne Teil: es gibt nichts zu messen, die Fälle dienen dem Bild.
export default {
  ero: "atributlisto",
  quelle: {
    MetadataList: "packages/core/src/MetadataList/MetadataList.tsx",
    MetadataListItem: "packages/core/src/MetadataList/MetadataListItem.tsx",
  },
  kombinoj: [
    { fm: { layout: "columns" }, fonto: {} },
    { fm: { layout: "stacked" }, fonto: { label: { position: "top" } } },
  ],
  zustaende: { rest: {} },
  fm: {
    tag: "fm-atributlisto",
    attrs: { label: "Angaben" },
    inner: "<dl><dt>Version</dt><dd>3</dd><dt>Verantwortlich</dt><dd>Team Fundamento</dd></dl>",
  },
  fonto: {
    comp: "MetadataList",
    props: {},
    children: [
      { comp: "MetadataListItem", props: { label: "Version" }, children: "3" },
      { comp: "MetadataListItem", props: { label: "Verantwortlich" }, children: "Team Fundamento" },
    ],
  },
  teile: {},
  breite: 280,
};
