// signeto ↔ Token (Abgleich ②a): Größen small/medium ↔ sm/md. mode static = Token ohne Handler;
// selectable = Token als Knopf (InteractiveRoleContext "button", da Funktionen wie onClick hier nicht
// übergeben werden können), nicht gewählt: die Fonto hat keinen gedrückten Zustand (selected).
// removable ohne Gegenstück im Vergleich (onRemove ist eine Funktion). intent nur neutral: die
// Farbtöne der Fonto sind Kategorien, keine Status (Grenze tinted-categories). Hover und Fokus wirken
// in der Fonto nur am Knopf (selectable).
export default {
  ero: "signeto",
  quelle: { Token: "packages/core/src/Token/Token.tsx" },
  kombinoj: [
    { fm: { mode: "static", intent: "neutral" }, fonto: {} },
    { fm: { mode: "selectable", intent: "neutral" }, fonto: {} },
  ],
  groessen: { small: { size: "sm" }, medium: { size: "md" } },
  zustaende: {
    rest: {},
    hover: { interago: "hover" },
    focus: { interago: "focus" },
    disabled: { fm: { disabled: "" }, fonto: { isDisabled: true } },
  },
  fm: { tag: "fm-signeto", inner: "Kontrast" },
  fonto: (props, { mode }) =>
    mode === "selectable"
      ? {
          comp: "InteractiveRoleContext",
          props: { value: "button" },
          children: { comp: "Token", props: { label: "Kontrast", ...props } },
        }
      : { comp: "Token", props: { label: "Kontrast", ...props } },
  teile: {
    control: "&",
    // Der Fokusring liegt in der Fonto am Token selbst (focus-within), nicht am unsichtbaren Knopf.
    body: "&",
  },
  ziel: { fm: '[part="body"]', fonto: "button" },
};
