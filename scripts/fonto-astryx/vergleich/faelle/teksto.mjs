// teksto ↔ Text: body ↔ body, body Größe 2 (bei Fundamento die kleinere, 12 px) ↔ body mit size sm,
// caption ↔ supporting, code ↔ type code. emphasis high ↔ color primary, medium ↔ secondary.
// Ohne Gegenstück: kicker (die Fonto hat keinen Typ für Dachzeilen) und emphasis low.
export default {
  ero: "teksto",
  quelle: { Text: "packages/core/src/Text/Text.tsx", Code: "packages/core/src/Code/Code.tsx" },
  // emphasis medium ↔ secondary nicht: die Fonto hat zwei Stufen der Schrift, Fundamento drei;
  // secondary der Fonto ist der Wert von muted, medium fiele auf low (text-hierarchy verlangt drei
  // unterscheidbare Stufen, die Regel gewinnt: medium bleibt auf seiner Rolle).
  kombinoj: [
    {
      fm: { kind: "body", size: "1", emphasis: "high" },
      fonto: { type: "body", color: "primary" },
    },
    {
      fm: { kind: "body", size: "2", emphasis: "high" },
      fonto: { type: "body", size: "sm", color: "primary" },
    },
    {
      fm: { kind: "caption", size: "1", emphasis: "high" },
      fonto: { type: "supporting", color: "primary" },
    },
    {
      fm: { kind: "code", size: "1", emphasis: "high" },
      fonto: { type: "code", color: "primary" },
    },
  ],
  zustaende: { rest: {} },
  fm: { tag: "fm-teksto", inner: "Gilt in allen Projekten." },
  fonto: { comp: "Text", props: {}, children: "Gilt in allen Projekten." },
  teile: { control: "&" },
};
