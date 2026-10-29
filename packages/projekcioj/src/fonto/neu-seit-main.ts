// Spec 029 ②b: the tokens added since the records of main (komuna-main.json, marken-main.json),
// one entry per step. The comparisons with main stay strict for every token main had – each keeps
// its value – and take the added ones out of the hash; their number is checked on its own.

/** ②b-1 M-5: the spinner of the twelve fields (size, colour, room beside the label). */
const SPINNER = /^ero\.[a-z]+\.spinner\.(size|color|inline\.padding)$/;

/** ②b-1 M-6: the clear button of the four fields that had none (kampo and plurelektilo had one). */
const CLEAR = /^ero\.(elektilo|listelektilo|datelektilo|kompletigilo)\.clear\.size$/;

/**
 * ②b-1 M-1: the summary of the faldilo by state, now that it can be disabled – its colour on
 * hover, focus and disabled, its fill disabled (the colour at rest is main's, moved; see MOVED).
 */
const SUMMARY = /^ero\.faldilo\.summary\.(color\.(hover|focus|disabled)|fill\.disabled)$/;

/** Whether a token was added after main's record. */
export const addedSinceMain = (name: string): boolean =>
  SPINNER.test(name) || CLEAR.test(name) || SUMMARY.test(name);

/** How many tokens ②b added so far (M-5: 12 fields × 3; M-6: 4; M-1: 4). */
export const ADDED_SINCE_MAIN = 44;

/** ②b-1 M-1: tokens main had under another name; each keeps main's value. */
const MOVED: Readonly<Record<string, string>> = {
  "ero.faldilo.summary.color.rest": "ero.faldilo.summary.color",
};

/** The name a token had in main's record. */
export const mainNameOf = (name: string): string => MOVED[name] ?? name;

/** The rows of main's hash: every token main had, under main's name, in main's order. */
export function mainRows(
  tokens: Readonly<Record<string, { type?: unknown; value?: unknown }>>,
  keep: (name: string) => boolean,
  canonical: (value: unknown) => unknown,
): [string, unknown, unknown][] {
  return Object.keys(tokens)
    .filter((name) => !addedSinceMain(name) && keep(name))
    .map((name) => [mainNameOf(name), name] as const)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([main, name]) => [main, tokens[name]?.type, canonical(tokens[name]?.value)]);
}
