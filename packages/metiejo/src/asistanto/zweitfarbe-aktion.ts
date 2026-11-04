// Spec 036, Befund 2.2 (V-2), edge case „Zweitfarbe als Aktion gewünscht“: the Zweitfarbe colours
// highlight surfaces, illustrations, badges and charts, never buttons, actions, links or the focus
// (Regulo sekundo-not-action, S36-2.3). A wish to lay it there – in the chat, as a wish of the
// sliders, as a value of the Studio – is refused in the person's words before anything changes; the
// actions stay with the lead colour. Pure.

/** The name of the rule the refusal keeps (for the Kroniko and the Studio's answer). */
export const SEKUNDO_NOT_ACTION = "sekundo-not-action";

/** The words that name the second colour of the brand. */
const ZWEITFARBE = /\b(?:zweitfarben?|zweite[nrms]? farbe|sekund(?:ä|ae)rfarben?|nebenfarben?)\b/i;

/** What the Zweitfarbe never colours, each with the word the answer uses for it. */
const ZIELE: readonly { muster: RegExp; wort: string }[] = [
  {
    muster:
      /\b(?:kn(?:ö|oe)pfe?n?|buttons?|schaltfl(?:ä|ae)chen?|aktion(?:en)?|call[ -]to[ -]action|cta)\b/i,
    wort: "Knöpfe",
  },
  // Case-sensitive: „links“ in small letters is also a side (left), „Links“ the noun.
  { muster: /\b(?:(?:Hyper)?Links?|[Vv]erweise?n?|[Vv]erlinkungen?)\b/, wort: "Links" },
  { muster: /\b(?:fokus\w*|focus)\b/i, wort: "den Fokusrahmen" },
];

/** A wish that keeps the Zweitfarbe away from them is no wish to refuse („nicht für Knöpfe“). */
const VERNEINT = /\b(?:nicht|nie|niemals|keine?[nmrs]?|ohne)\b/i;

/** The words of the refusal: what the Zweitfarbe does not colour, and why. */
export function zweitfarbeAblehnungOf(woerter: readonly string[]): string {
  const ziele =
    woerter.length <= 1
      ? (woerter[0] ?? "Knöpfe")
      : `${woerter.slice(0, -1).join(", ")} und ${woerter.at(-1)}`;
  return `Die Zweitfarbe kommt nicht auf ${ziele}: Knöpfe, Links und der Fokusrahmen bleiben in der Leitfarbe, damit man überall gleich erkennt, was man anklicken kann. Die Zweitfarbe färbt Hervorhebungsflächen, Illustrationen, Abzeichen und Diagramme.`;
}

/**
 * The refusal of a wish that lays the Zweitfarbe on buttons, actions, links or the focus; undefined
 * for any other text (the model answers it as before).
 */
export function zweitfarbeAlsAktionOf(text: string): string | undefined {
  if (!ZWEITFARBE.test(text) || VERNEINT.test(text)) return undefined;
  const woerter = ZIELE.filter((ziel) => ziel.muster.test(text)).map((ziel) => ziel.wort);
  return woerter.length === 0 ? undefined : zweitfarbeAblehnungOf(woerter);
}

/** The target a token of the Vortaro is: a button or action, a link, the focus; else undefined. */
export function aktionsWortOf(token: string): string | undefined {
  if (token.startsWith("color.action.")) return "Knöpfe";
  if (token.startsWith("color.link.")) return "Links";
  if (token.startsWith("color.focus.")) return "den Fokusrahmen";
  return undefined;
}

/** A value that points at the Zweitfarbe: a step of its palette or one of its roles. */
export const istZweitfarbe = (alias: string | undefined): boolean =>
  alias !== undefined && /^color\.(?:palette\.sekundo|sekundo)\./.test(alias);
