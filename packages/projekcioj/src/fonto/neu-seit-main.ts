// Spec 029 ②b: the tokens added since the records of main (komuna-main.json, marken-main.json),
// one entry per step. The comparisons with main stay strict for every token main had – each keeps
// its value – and take the added ones out of the hash; their number is checked on its own.

/** ②b-1 M-5: the spinner of the twelve fields (size, colour, room beside the label). */
const SPINNER = /^ero\.[a-z]+\.spinner\.(size|color|inline\.padding)$/;

/** Whether a token was added after main's record. */
export const addedSinceMain = (name: string): boolean => SPINNER.test(name);

/** How many tokens ②b added so far (12 fields × 3). */
export const ADDED_SINCE_MAIN = 36;
