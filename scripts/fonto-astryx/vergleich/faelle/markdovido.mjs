// markdovido ↔ Markdown mit dem Markdown der Vitrino (Überschrift, Absatz, Liste, Zitat, Tabelle,
// Link), Startebene 2. Die Fonto setzt die Blöcke mit Außenabständen, nicht mit gap; das Zitat hat
// einen Rand links wie Fundamento.
const MD =
  "# Geltung\n\nEin Absatz mit *Hervorhebung*, **Gewicht** und `STD-1`.\n\n- eins\n  - zwei\n\n> Ein Zitat.\n\n| Name | Status |\n|---|:---:|\n| STD-1 | gültig |\n\n[Mehr](#mehr)";
export default {
  ero: "markdovido",
  quelle: { Markdown: "packages/core/src/Markdown/Markdown.tsx" },
  zustaende: { rest: {} },
  fm: { tag: "fm-markdovido", attrs: { "start-level": "2", source: MD.replaceAll("\n", "&#10;") } },
  fonto: { comp: "Markdown", props: { headingLevelStart: 2 }, children: MD },
  teile: {
    // Rand und Einzug des Zitats; padding-inline-start teilt sich bei Fundamento mit dem Einzug der
    // Listen (die Fonto rückt Listen über das li ein, nicht über padding der ul).
    control: {
      "": "[role=document]",
      "border-inline-start-color": "blockquote",
      "border-inline-start-width": "blockquote",
      "padding-inline-start": "blockquote",
    },
  },
  breite: 480,
};
