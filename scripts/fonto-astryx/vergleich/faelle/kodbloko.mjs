// kodbloko ↔ CodeBlock: copyable ↔ hasCopyButton (in der Fonto Standard), caption ↔ title (ohne
// Sprachbeschriftung).
export default {
  ero: "kodbloko",
  quelle: { CodeBlock: "packages/core/src/CodeBlock/CodeBlock.tsx" },
  zustaende: { rest: {} },
  fm: {
    tag: "fm-kodbloko",
    attrs: { copyable: "" },
    inner: '<span slot="caption">Prüfung starten</span>pnpm fm mcp',
  },
  fonto: {
    comp: "CodeBlock",
    props: {
      code: "pnpm fm mcp",
      title: "Prüfung starten",
      language: "bash",
      hasLanguageLabel: false,
    },
  },
  teile: {
    // Fläche und Radius trägt das pre, den Innenabstand das code darin.
    control: { "": "&", padding: "code" },
    text: "code",
    legend: "pre > div > div > span",
  },
  breite: 360,
};
