// A finding of the Enportilo (Spec 033 S2): a colour, a font family, a radius or a spacing, with its
// weight (how often or how much of the area) and its provenance – the file and the place in it.
// Observation, not taking over (Art. V): the value as measured, never a name of a token.

export interface Herkunft {
  /** The file name of an upload, or the URL of a page or stylesheet. */
  dosiero: string;
  /** Where in it: a line, a share of the area, a page. */
  loko?: string;
}

export interface Trovo {
  kind: "farbo" | "tiparo" | "radiuso" | "spaco";
  /** #rrggbb for a colour, the family name for a font, px for a radius or a spacing. */
  valoro: string | number;
  /** For a font: the role it was found in. */
  rolo?: "body" | "display" | "code";
  pezo: number;
  herkunft: Herkunft;
}

const hex2 = (value: number) =>
  Math.round(Math.min(255, Math.max(0, value)))
    .toString(16)
    .padStart(2, "0");

export const hexOf = (r: number, g: number, b: number): string => `#${hex2(r)}${hex2(g)}${hex2(b)}`;

/** #rgb or #rrggbb (with an optional alpha) as #rrggbb, lower case; undefined otherwise. */
export function normalHex(text: string): string | undefined {
  const match = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(text.trim());
  if (match?.[1] === undefined) return undefined;
  const digits = match[1].toLowerCase();
  return digits.length <= 4
    ? `#${[...digits.slice(0, 3)].map((digit) => digit + digit).join("")}`
    : `#${digits.slice(0, 6)}`;
}

/** The colours in a text: hex and rgb()/rgba(), as #rrggbb. */
export function coloursIn(text: string): string[] {
  const found: string[] = [];
  for (const match of text.matchAll(
    /#[0-9a-fA-F]{3,8}\b|rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/g,
  )) {
    if (match[0].startsWith("#")) {
      const hex = normalHex(match[0]);
      if (hex !== undefined) found.push(hex);
    } else {
      found.push(hexOf(Number(match[1]), Number(match[2]), Number(match[3])));
    }
  }
  return found;
}

/** The line (1-based) of a character offset. */
export const lineOf = (text: string, offset: number): number =>
  text.slice(0, offset).split("\n").length;
