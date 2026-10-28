// saltligilo ↔ der Sprunglink der AppShell („Skip to content“, ohne eigene Props). Er ist nur beim
// Fokus sichtbar, daher Fundamento mit focus-only; in Ruhe ist er auf beiden Seiten verborgen.
export default {
  ero: "saltligilo",
  quelle: { AppShell: "packages/core/src/AppShell/AppShell.tsx" },
  zustaende: { rest: {}, focus: { interago: "focus" } },
  fm: {
    tag: "fm-saltligilo",
    attrs: { to: "inhalt", "focus-only": "" },
    inner: "Zum Inhalt springen",
  },
  fonto: { comp: "AppShell", props: { height: "auto" }, children: "Inhalt" },
  teile: { control: "a[data-testid=skip-to-content]" },
  ziel: { fm: '[part="control"]', fonto: "a[data-testid=skip-to-content]" },
};
