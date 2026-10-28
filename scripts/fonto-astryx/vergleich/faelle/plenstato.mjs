// plenstato ↔ Spinner (kind loading) und EmptyState (kind empty). Die Selektoren treffen je nur in
// einer der beiden Komponenten: der Kasten nur im EmptyState (der Spinner hat keinen).
export default {
  ero: "plenstato",
  quelle: {
    EmptyState: "packages/core/src/EmptyState/EmptyState.tsx",
    Spinner: "packages/core/src/Spinner/Spinner.tsx",
  },
  kombinoj: [
    { fm: { kind: "loading" }, fonto: {} },
    { fm: { kind: "empty" }, fonto: {} },
  ],
  zustaende: { rest: {} },
  fm: {
    tag: "fm-plenstato",
    inner: ({ kind }) =>
      kind === "empty"
        ? 'Noch keine Standards im Projekt.<fm-butono slot="actions" emphasis="medium">Standard anlegen</fm-butono>'
        : "Lädt Standards …",
  },
  fonto: (props, { kind }) =>
    kind === "empty"
      ? {
          comp: "EmptyState",
          props: {
            title: "Keine Standards",
            description: "Noch keine Standards im Projekt.",
            actions: { comp: "Button", props: { label: "Standard anlegen", variant: "secondary" } },
          },
        }
      : { comp: "Spinner", props: { label: "Lädt Standards …" } },
  teile: {
    control: "div[role=status]",
    // Der Bogen des Spinners färbt stroke, nicht color: die Farbe bleibt ungemessen (":not(*)").
    indicator: { "": "div[data-shade] > span[role=status]", color: ":not(*)" },
    text: "div[data-shade] > span[data-type=body], div[role=status] > div > div",
    actions: "div[role=status] > div:last-child",
  },
  breite: 360,
};
