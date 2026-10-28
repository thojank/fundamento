// tabelo ↔ Table: density comfortable ↔ balanced, compact ↔ compact. Gemessen wird nur der
// Scrollbereich (region); Zellen, Kopf und Sortierknopf haben bei Fundamento kein Teil (Slot-Inhalt).
const zeilen = [
  { name: "Barrierefreiheit", status: "gültig", anzahl: "0" },
  { name: "Datenschutz", status: "Entwurf", anzahl: "3" },
  { name: "Sicherheit", status: "in Prüfung", anzahl: "1" },
];
export default {
  ero: "tabelo",
  quelle: { Table: "packages/core/src/Table/Table.tsx" },
  kombinoj: [
    { fm: { density: "comfortable" }, fonto: { density: "balanced" } },
    { fm: { density: "compact" }, fonto: { density: "compact" } },
  ],
  zustaende: { rest: {} },
  fm: {
    tag: "fm-tabelo",
    inner: `Standards<table slot="content"><thead><tr><th scope="col">Name</th><th scope="col">Status</th><th scope="col" numeric>Anzahl</th></tr></thead><tbody>${zeilen.map((z) => `<tr><th scope="row">${z.name}</th><td>${z.status}</td><td>${z.anzahl}</td></tr>`).join("")}</tbody></table>`,
  },
  fonto: {
    comp: "Table",
    props: {
      idKey: "name",
      data: zeilen,
      columns: [
        { key: "name", header: "Name" },
        { key: "status", header: "Status" },
        { key: "anzahl", header: "Anzahl" },
      ],
    },
  },
  teile: { region: "[role=group]" },
  breite: 420,
};
