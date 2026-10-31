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
export const mainNameOf = (name: string): string =>
  MOVED[name] ?? MOVED_2B2[name] ?? REST_2B2.moved[name] ?? name;

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
 * Spec 036 Teil 5 ②b-2, the other Eroj (S36-4.2): per row group the tokens it added (`added`, a
 * pattern and their number) and the tokens main had that a new axis keys now (`moved`: new name →
 * main's name; each keeps main's value, the default value of the axis carries it).
 */
const REST_2B2 = (() => {
  const groups: { pattern: string; added: number; moved: Record<string, string> }[] = [
    // A-ikono-2 (x-small: 1), A-signeto-2 (large: 2), A-avataro-2 (x-small and x-large of the box
    // and the initials: 4), A-pagxigilo-2 (small of five: 5), A-langetaro-2 (small and large of
    // three: 6), A-dialogo-2 (full: the width and the radius; the radius of medium: 3).
    {
      pattern:
        "^ero\\.ikono\\.box\\.size\\.size\\.x\\.small$|^ero\\.signeto\\.box\\.(height|inline\\.padding)\\.size\\.large$|^ero\\.avataro\\.(box\\.size|initials\\.typography)\\.size\\.x\\.(small|large)$|^ero\\.pagxigilo\\.(item\\.typography|item\\.inline\\.padding|ellipsis\\.typography|prev\\.size|next\\.size)\\.size\\.small$|^ero\\.langetaro\\.(tab\\.height|tab\\.inline\\.padding|tabs\\.typography)\\.size\\.(small|large)$|^ero\\.dialogo\\.surface\\.(width\\.size\\.full|radius\\.size\\.(medium|full))$",
      added: 1 + 2 + 4 + 5 + 6 + 3,
      moved: {
        ...Object.fromEntries(
          [
            "pagxigilo.item.typography",
            "pagxigilo.item.inline.padding",
            "pagxigilo.ellipsis.typography",
            "pagxigilo.prev.size",
            "pagxigilo.next.size",
            "langetaro.tab.height",
            "langetaro.tab.inline.padding",
            "langetaro.tabs.typography",
          ].map((path) => [`ero.${path}.size.medium`, `ero.${path}`]),
        ),
        "ero.dialogo.surface.radius.size.small": "ero.dialogo.surface.radius",
      },
    },
    // A-apartigilo-1 (emphasis high of the line's colour and width: 2), A-avataro-1 (corner soft and
    // square of both radii: 4), A-avizo-1 (frame band: 1), A-karto-1 (emphasis medium of the fill:
    // 1; low inherits, no shadow but high), A-spuro-1 (emphasis low of the item's colour: 6).
    {
      pattern:
        "^ero\\.apartigilo\\.line\\.(color|width)\\.emphasis\\.high$|^ero\\.avataro\\.(image|initials)\\.radius\\.corner\\.(soft|square)$|^ero\\.avizo\\.box\\.radius\\.frame\\.band$|^ero\\.karto\\.surface\\.fill\\.emphasis\\.medium$|^ero\\.spuro\\.item\\.color\\.emphasis\\.low\\.",
      added: 2 + 4 + 1 + 1 + 6,
      moved: {
        "ero.apartigilo.line.color.emphasis.low": "ero.apartigilo.line.color",
        "ero.apartigilo.line.width.emphasis.low": "ero.apartigilo.line.width",
        "ero.avataro.image.radius.corner.round": "ero.avataro.image.radius",
        "ero.avataro.initials.radius.corner.round": "ero.avataro.initials.radius",
        "ero.avizo.box.radius.frame.card": "ero.avizo.box.radius",
        "ero.karto.surface.fill.emphasis.high": "ero.karto.surface.fill",
        "ero.karto.surface.shadow.emphasis.high": "ero.karto.surface.shadow",
        ...Object.fromEntries(
          ["true", "false"].flatMap((current) =>
            ["rest", "hover", "focus"].map((state) => [
              `ero.spuro.item.color.emphasis.medium.current.${current}.${state}`,
              `ero.spuro.item.color.current.${current}.${state}`,
            ]),
          ),
        ),
      },
    },
    // A-markdovido-1 (density compact of the gap: 1), A-plenstato-1/2 (compact of the room and
    // the text: 2), A-tabelo-1 (density default of the cell: 2), A-teksto-1 (kind label: 1).
    {
      pattern:
        "^ero\\.markdovido\\.box\\.gap\\.density\\.compact$|^ero\\.plenstato\\.(box\\.inline\\.padding|text\\.typography)\\.compact\\.true$|^ero\\.tabelo\\.cell\\.(inline\\.padding|height)\\.density\\.default$|^ero\\.teksto\\.text\\.typography\\.kind\\.label\\.size\\.1$",
      added: 1 + 2 + 2 + 1,
      moved: {
        "ero.markdovido.box.gap.density.default": "ero.markdovido.box.gap",
        "ero.plenstato.box.inline.padding.compact.false": "ero.plenstato.box.inline.padding",
        "ero.plenstato.text.typography.compact.false": "ero.plenstato.text.typography",
      },
    },
    // A-pagxigilo-1 (the part summary: its colour and its typography by size, 3).
    {
      pattern: "^ero\\.pagxigilo\\.summary\\.(color|typography\\.size\\.(small|medium))$",
      added: 3,
      moved: {},
    },
    // A-atributlisto-1 (the button for the rest: its fill, colour and typography, 3).
    {
      pattern: "^ero\\.atributlisto\\.more\\.(fill|color|typography)$",
      added: 3,
      moved: {},
    },
  ];
  const pattern = new RegExp(groups.map((group) => group.pattern).join("|"));
  return {
    test: (name: string) => pattern.test(name),
    added: groups.reduce((sum, group) => sum + group.added, 0),
    moved: Object.assign({}, ...groups.map((group) => group.moved)) as Record<string, string>,
  };
})();

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
export const ADDED_BY_2B2 = 2 + 12 + 10 + 12 + 4 + REST_2B2.added;

/**
 * The ✕ of listelektilo and datelektilo came after main (②b-1 M-6, CLEAR); ②b-2 keys it by size,
 * so its size medium is that token: still none of main's.
 */
const CLEAR_2B2 = /^ero\.(listelektilo|datelektilo)\.clear\.size\.size\.medium$/;

/** Whether a token was added by ②b-2 after main's record. */
export const addedBy2b2 = (name: string): boolean =>
  ACHSEN_2B2.test(name) || CLEAR_2B2.test(name) || REST_2B2.test(name);

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
