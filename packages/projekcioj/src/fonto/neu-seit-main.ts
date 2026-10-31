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

/**
 * Spec 036 Befund 1.1: the radius role of fields of several lines and small surfaces with text,
 * so the pill of the controls does not reach them; every brand assigns it today's value.
 */
const MULTILINE = /^radius\.role\.multiline$/;

/**
 * Spec 036 Befund 2.2 (V-2): the Zweitfarbe – its palette (15 steps, the neutral ramp for a brand
 * without one) and its five roles; every brand assigns them.
 */
const SEKUNDO = /^color\.(palette\.sekundo|sekundo)\./;

/** Whether a token was added after main's record. */
export const addedSinceMain = (name: string): boolean =>
  SPINNER.test(name) ||
  CLEAR.test(name) ||
  SUMMARY.test(name) ||
  TARGET.test(name) ||
  STATUS.test(name) ||
  MULTILINE.test(name) ||
  SEKUNDO.test(name);

/**
 * How many tokens ②b added so far (M-5: 12 fields × 3; M-6 with Abnahme #122: 11; M-1: 4; the
 * targets of Abnahme #122: 6; M-2: 216), and Spec 035 2.3 (the targets of the date picker's
 * trigger and ✕: 2), Spec 036 Befund 1.1 (radius.role.multiline: 1), and Spec 036 Befund 2.2 (the
 * Zweitfarbe: 12 steps and 5 roles, 17; B-6.2-1).
 */
export const ADDED_SINCE_MAIN = 293;

/** ②b-1 M-1: tokens main had under another name; each keeps main's value. */
const MOVED: Readonly<Record<string, string>> = {
  "ero.faldilo.summary.color.rest": "ero.faldilo.summary.color",
};

/** The name a token had in main's record. */
export const mainNameOf = (name: string): string => MOVED[name] ?? MOVED_2B2[name] ?? name;

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
  // Spec 035 2.3.4 (V-1): read-only keeps the look of rest in every field with that state – main
  // bound the sunken background.
  "ero.kampo.surface.fill.readonly": "color.background.sunken",
  "ero.datelektilo.surface.fill.readonly": "color.background.sunken",
  "ero.listelektilo.surface.fill.readonly": "color.background.sunken",
  "ero.plurelektilo.surface.fill.readonly": "color.background.sunken",
};

/**
 * Spec 036 Teil 5 ②b-2 (Spec 029 abgleich.json, aspects "achsen" and "groessen"): the tokens of the
 * new axes and values – the count of the tekstareo (A-tekstareo-1); the sizes small and large of
 * listelektilo, plurelektilo and datelektilo (A-*-2; their size medium is the token main had, see
 * MOVED_2B2).
 */
const ACHSEN_2B2 =
  /^ero\.tekstareo\.count\.(color|typography)$|^ero\.kampo\.unit\.(color|typography\.size\.(small|medium|large))$|^ero\.(listelektilo|plurelektilo|datelektilo)\.(label\.typography|text\.typography|box\.height|box\.inline\.padding|indicator\.size|clear\.size|trigger\.size)\.size\.(small|large)$/;

/**
 * How many tokens ②b-2 added, counted beside ADDED_SINCE_MAIN (A-tekstareo-1: 2; A-listelektilo-2:
 * 6 × 2, A-plurelektilo-2: 5 × 2, A-datelektilo-2: 6 × 2; A-kampo-1: the unit's colour and its
 * typography by size, 4).
 */
export const ADDED_BY_2B2 = 2 + 12 + 10 + 12 + 4;

/**
 * The ✕ of listelektilo and datelektilo came after main (②b-1 M-6, CLEAR); ②b-2 keys it by size,
 * so its size medium is that token: still none of main's.
 */
const CLEAR_2B2 = /^ero\.(listelektilo|datelektilo)\.clear\.size\.size\.medium$/;

/** Whether a token was added by ②b-2 after main's record. */
export const addedBy2b2 = (name: string): boolean => ACHSEN_2B2.test(name) || CLEAR_2B2.test(name);

/**
 * ②b-2 (A-datelektilo-2): the calendar's size medium is the token whose value changed on purpose
 * at Abnahme #122 (CHANGED); compared with the role main bound it to.
 */
const CHANGED_2B2: Readonly<Record<string, string>> = {
  "ero.datelektilo.trigger.size.size.medium": "size.control.medium",
};

/** ②b-2 (A-*-2): a field's former token is its size medium now; each keeps main's value. */
const MOVED_2B2: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries({
    listelektilo: [
      "label.typography",
      "text.typography",
      "box.height",
      "box.inline.padding",
      "indicator.size",
      "clear.size",
    ],
    plurelektilo: [
      "label.typography",
      "text.typography",
      "box.height",
      "box.inline.padding",
      "indicator.size",
    ],
    datelektilo: [
      "label.typography",
      "text.typography",
      "box.height",
      "box.inline.padding",
      "trigger.size",
      "clear.size",
    ],
  }).flatMap(([ero, paths]) =>
    paths.map((path) => [`ero.${ero}.${path}.size.medium`, `ero.${ero}.${path}`]),
  ),
);

/** Abnahme #122: a token main had that is gone (replaced by its sizes), with main's role. */
const REMOVED: Readonly<Record<string, { type: string; role: string }>> = {
  "ero.kampo.clear.size": { type: "dimension", role: "size.control.small" },
  // Spec 036 Teil 5 ②b-2 (A-elekto-2, A-markobutono-2, A-sxaltilo-2, ②a-2): two sizes; large is a
  // deprecated alias of medium and keys no token any more.
  "ero.elekto.indicator.size.size.large": { type: "dimension", role: "size.icon.large" },
  "ero.elekto.label.typography.size.large": { type: "typography", role: "typography.label.1" },
  "ero.elekto.option.label.typography.size.large": {
    type: "typography",
    role: "typography.body.1",
  },
  "ero.markobutono.indicator.size.size.large": { type: "dimension", role: "size.icon.large" },
  "ero.markobutono.label.typography.size.large": {
    type: "typography",
    role: "typography.label.1",
  },
  "ero.sxaltilo.box.width.size.large": { type: "dimension", role: "size.control.large" },
  "ero.sxaltilo.indicator.size.size.large": { type: "dimension", role: "size.icon.large" },
  "ero.sxaltilo.label.typography.size.large": { type: "typography", role: "typography.label.1" },
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
    .filter((name) => !addedSinceMain(name) && !addedBy2b2(name) && keep(name))
    .map((name) => [
      mainNameOf(name),
      tokens[name]?.type,
      canonical(tokens[CHANGED[name] ?? CHANGED_2B2[name] ?? name]?.value),
    ]);
  for (const [name, { type, role }] of Object.entries(REMOVED)) {
    // A gone token is read through its role: keep judges what it would have been (②b-2: provo
    // leaves typography out, the large label sizes included).
    if (tokens[name] === undefined && tokens[role] !== undefined && keep(name) && keep(role))
      rows.push([name, type, canonical(tokens[role]?.value)]);
  }
  return rows.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
}
