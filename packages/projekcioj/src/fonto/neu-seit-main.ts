// Spec 029 ②b: the tokens added since the records of main (komuna-main.json, marken-main.json),
// one entry per step. The comparisons with main stay strict for every token main had – each keeps
// its value – and take the added ones out of the hash; their number is checked on its own.

/** ②b-1 M-5: the spinner of the twelve fields (size, colour, room beside the label). */
const SPINNER = /^ero\.[a-z]+\.spinner\.(size|color|inline\.padding)$/;

/**
 * ②b-1 M-6: the clear button of the four fields that had none (kampo and plurelektilo had one);
 * Abnahme #122: as large as the field's icon, by size where the field has sizes – the kampo's too
 * (its one token of main is gone, see REMOVED).
 */
const CLEAR =
  /^ero\.(listelektilo|datelektilo)\.clear\.size$|^ero\.(kampo|elektilo|kompletigilo)\.clear\.size\.size\.(small|medium|large)$/;

/**
 * ②b-1 M-1: the summary of the faldilo by state, now that it can be disabled – its colour on
 * hover, focus and disabled, its fill disabled (the colour at rest is main's, moved; see MOVED).
 */
const SUMMARY = /^ero\.faldilo\.summary\.(color\.(hover|focus|disabled)|fill\.disabled)$/;

/**
 * Abnahme #122: every button at the end of a field stays a target of at least size.target.min
 * (WCAG 2.5.8) while its icon is as large as the field's – its width, the web's square minimum.
 * Spec 035 2.3.1 and 2.3.3: the trigger and the ✕ of the datelektilo too, as large as a chevron.
 */
const TARGET =
  /^ero\.(kampo\.(clear|decrement|increment)|elektilo\.clear|listelektilo\.clear|kompletigilo\.clear|datelektilo\.(trigger|clear))\.width$/;

/** The twelve fields of ②b-1 M-2 and M-5. */
const FIELDS =
  "(kampo|tekstareo|elektilo|listelektilo|plurelektilo|kompletigilo|datelektilo|glitilo|elekto|markobutono|sxaltilo|alsxutilo)";

/**
 * ②b-1b M-2: the status of the fields – every part keyed by the state in the states warning and
 * success, the part message in every state, the kampo's status icon (A-kampo-4).
 */
const STATUS = new RegExp(
  `^ero\\.${FIELDS}\\.([a-z-]+\\.)+(warning|success)$|^ero\\.${FIELDS}\\.message\\.|^ero\\.kampo\\.status\\.icon\\.`,
);

/** Whether a token was added after main's record. */
export const addedSinceMain = (name: string): boolean =>
  SPINNER.test(name) ||
  CLEAR.test(name) ||
  SUMMARY.test(name) ||
  TARGET.test(name) ||
  STATUS.test(name);

/**
 * How many tokens ②b added so far (M-5: 12 fields × 3; M-6 with Abnahme #122: 11; M-1: 4; the
 * targets of Abnahme #122: 6; M-2: 216), and Spec 035 2.3 (the targets of the date picker's
 * trigger and ✕: 2).
 */
export const ADDED_SINCE_MAIN = 275;

/** ②b-1 M-1: tokens main had under another name; each keeps main's value. */
const MOVED: Readonly<Record<string, string>> = {
  "ero.faldilo.summary.color.rest": "ero.faldilo.summary.color",
};

/** The name a token had in main's record. */
export const mainNameOf = (name: string): string => MOVED[name] ?? name;

/**
 * Abnahme #122 (Maintainer, 30.10.): tokens main had whose value changed on purpose – the
 * steppers of a number and the calendar of a date picker sit inside the field's border, at the
 * size of an icon and of a pointer's target. Each is compared with the role main bound it to,
 * resolved in the combination: the roles keep main's values, so main's row comes back.
 */
const CHANGED: Readonly<Record<string, string>> = {
  "ero.kampo.decrement.size.size.small": "size.control.small",
  "ero.kampo.decrement.size.size.medium": "size.control.medium",
  "ero.kampo.decrement.size.size.large": "size.control.large",
  "ero.kampo.increment.size.size.small": "size.control.small",
  "ero.kampo.increment.size.size.medium": "size.control.medium",
  "ero.kampo.increment.size.size.large": "size.control.large",
  "ero.datelektilo.trigger.size": "size.control.medium",
};

/** Abnahme #122: a token main had that is gone (replaced by its sizes), with main's role. */
const REMOVED: Readonly<Record<string, { type: string; role: string }>> = {
  "ero.kampo.clear.size": { type: "dimension", role: "size.control.small" },
};

/** How many tokens of main are gone (REMOVED). */
export const REMOVED_SINCE_MAIN = Object.keys(REMOVED).length;

/** The rows of main's hash: every token main had, under main's name, in main's order. */
export function mainRows(
  tokens: Readonly<Record<string, { type?: unknown; value?: unknown }>>,
  keep: (name: string) => boolean,
  canonical: (value: unknown) => unknown,
): [string, unknown, unknown][] {
  const rows: [string, unknown, unknown][] = Object.keys(tokens)
    .filter((name) => !addedSinceMain(name) && keep(name))
    .map((name) => [
      mainNameOf(name),
      tokens[name]?.type,
      canonical(tokens[CHANGED[name] ?? name]?.value),
    ]);
  for (const [name, { type, role }] of Object.entries(REMOVED)) {
    if (tokens[name] === undefined && tokens[role] !== undefined && keep(name))
      rows.push([name, type, canonical(tokens[role]?.value)]);
  }
  return rows.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
}
