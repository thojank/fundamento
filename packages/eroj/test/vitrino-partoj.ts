// Spec 040 B-1: the parts of the Vitrino, the one source for playwright.vitrino.config.ts, the
// completeness test (vitrino-partoj.test.ts) and workflow.test.ts (the CI matrices). No imports:
// pure data and one pure function, so a test of another package can import it.
//
// vitrino.check.ts is serial at file level, so Playwright's --shard cannot split it; a part is a
// selection by title instead. Playwright greps the space-joined title path ("", project, file,
// describes, test title, tags), not a `›`-joined one, so a part names title-path prefixes and this
// module turns them into the patterns. The last part of each group is the rest of its group: a
// test added later always lands in a part.
//
// The cut follows the test durations of the CI logs, worst runner seen (Chromium; the Vitrino runs
// in one engine on main too): runs 41842873743 (green), 41873907893, 41877598624 and 41886235249
// (cut off at 15 minutes).
// - werkstatt-1: the four axe passes over the Werkstatt (~4 × 72 s) and the stage 2 (~110 s);
//   werkstatt-2: the rest of the Werkstatt (~360 s, with the M5 timings that left for `zeittests`,
//   below). The cut between the two describes (stage 1 ~650 s, stage 2 ~110 s) would leave stage 1
//   above 12 minutes.
// - cetero-1: the four axe passes over the whole page (~4 × 117 s); cetero-2: the fm-dialogo
//   (~234 s) and the six largest section checks; cetero-3: the rest (~375 s).
//
// Spec 040 T-7 (AC-B6): the timing tests – M5 and its Gegenproben with the calibration of the
// block, the Ableitung Gegenprobe, G5 and its Gegenprobe – are a group and a part of their own,
// `zeittests`, in a CI job that does not block a pull request. They sit in the two describes of
// the Werkstatt, so `werkstatt` leaves them out, and with it werkstatt-1 and werkstatt-2. They are
// named one by one: a timing test added later lands in the rest of its group until it is named
// here. The pure verdicts of M5, G5 and the derivation measure nothing and stay in `cetero`.
// `zeittests` comes first in the table: the last part stays the rest of `cetero`, the selection
// the completeness test drives through playwright.vitrino.config.ts.

/** A title path from the file down: describe titles, then the beginning of a test title. */
export type Titolvojo = readonly string[];

/** The timing tests, the Werkstatt (its two describes without them) and the rest of the Vitrino. */
export type VitrinoGrupo = "zeittests" | "werkstatt" | "cetero";

/** A part: the tests under some title paths, or the rest of its group. */
export type VitrinoTeil =
  | { readonly grupo: VitrinoGrupo; readonly prefiksoj: readonly Titolvojo[] }
  | { readonly grupo: VitrinoGrupo; readonly resto: true };

export type VitrinoParto =
  | "zeittests"
  | "werkstatt-1"
  | "werkstatt-2"
  | "cetero-1"
  | "cetero-2"
  | "cetero-3";

/** The file the parts select from; the title path of its tests starts after it. */
const DOSIERO = "vitrino.check.ts";

const WERKSTATT_1 = "the Werkstatt (Spec 016 ②)";
const WERKSTATT_2 = "the Werkstatt, stage 2 (Spec 019 ②)";

/** The describes of the Werkstatt; `cetero` is every other test of the file. */
const WERKSTATT: readonly Titolvojo[] = [[WERKSTATT_1], [WERKSTATT_2]];

/** The timing tests, inside the describes of the Werkstatt. */
const ZEITTESTS: readonly Titolvojo[] = [
  [WERKSTATT_1, "M5: derivation and check per slider change "],
  [WERKSTATT_1, "Ableitung Gegenprobe"],
  // "M5 Gegenprobe 2: …" and its calibration ("M5 Gegenprobe 2, calibration …").
  [WERKSTATT_1, "M5 Gegenprobe 2"],
  [WERKSTATT_1, "M5 Gegenprobe: "],
  [WERKSTATT_2, "G5: 50 changes of a slider "],
  [WERKSTATT_2, "G5 Gegenprobe"],
];

/** The parts, in the order of the CI matrices; the keys are the values of VITRINO_PARTO. */
export const VITRINO_PARTOJ: Readonly<Record<VitrinoParto, VitrinoTeil>> = {
  zeittests: { grupo: "zeittests", prefiksoj: ZEITTESTS },
  "werkstatt-1": {
    grupo: "werkstatt",
    prefiksoj: [[WERKSTATT_1, "axe finds nothing in the Werkstatt"], [WERKSTATT_2]],
  },
  "werkstatt-2": { grupo: "werkstatt", resto: true },
  "cetero-1": { grupo: "cetero", prefiksoj: [["axe finds nothing in "]] },
  "cetero-2": {
    grupo: "cetero",
    prefiksoj: [
      ["fm-dialogo "],
      ["fm-insigno, "],
      ["fm-tabelo, "],
      ["fm-navigado "],
      ["the Ikonaro grid"],
      ["fm-konsileto, "],
      ["fm-signeto, "],
    ],
  },
  "cetero-3": { grupo: "cetero", resto: true },
};

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** The patterns of title-path prefixes: each matches a test whose path begins with it. */
function patterns(prefiksoj: readonly Titolvojo[]): RegExp[] {
  return prefiksoj.map(
    (vojo) => new RegExp(` ${escapeRegExp(DOSIERO)} ${escapeRegExp(vojo.join(" "))}`),
  );
}

function isParto(value: string): value is VitrinoParto {
  return Object.hasOwn(VITRINO_PARTOJ, value);
}

/**
 * The selection of a group: the timing tests by name, the Werkstatt by its describes without the
 * timing tests, the rest by leaving out both.
 */
function grupoAuswahl(grupo: VitrinoGrupo): { grep: RegExp[]; grepInvert: RegExp[] } {
  switch (grupo) {
    case "zeittests":
      return { grep: patterns(ZEITTESTS), grepInvert: [] };
    case "werkstatt":
      return { grep: patterns(WERKSTATT), grepInvert: patterns(ZEITTESTS) };
    case "cetero":
      return { grep: [], grepInvert: patterns([...WERKSTATT, ...ZEITTESTS]) };
  }
}

function auswahl(grep: RegExp[], grepInvert: RegExp[]): { grep?: RegExp[]; grepInvert?: RegExp[] } {
  return {
    ...(grep.length > 0 ? { grep } : {}),
    ...(grepInvert.length > 0 ? { grepInvert } : {}),
  };
}

/**
 * The Playwright selection (`grep`, `grepInvert`) for a value of VITRINO_PARTO. Unset or empty
 * selects everything; `werkstatt` and `cetero` select their groups, the unions of their parts. A
 * part with prefixes leaves out what an earlier part of its group took; the rest of a group leaves
 * out every other part of it. Any other value throws.
 */
export function vitrinoAuswahl(value: string | undefined): {
  grep?: RegExp[];
  grepInvert?: RegExp[];
} {
  if (value === undefined || value === "") return {};
  if (value === "werkstatt" || value === "cetero") {
    const { grep, grepInvert } = grupoAuswahl(value);
    return auswahl(grep, grepInvert);
  }
  if (!isParto(value)) {
    const known = [...Object.keys(VITRINO_PARTOJ), "werkstatt", "cetero"].join(", ");
    throw new Error(`VITRINO_PARTO: unknown part "${value}" (${known})`);
  }
  const teil = VITRINO_PARTOJ[value];
  const grupo = grupoAuswahl(teil.grupo);
  const parts = Object.entries(VITRINO_PARTOJ).filter(([, other]) => other.grupo === teil.grupo);
  const index = parts.findIndex(([name]) => name === value);
  // The rest leaves out every other part of its group, a part with prefixes the earlier ones.
  const taken = ("resto" in teil ? parts : parts.slice(0, index))
    .filter(([name]) => name !== value)
    .flatMap(([, other]) => ("prefiksoj" in other ? other.prefiksoj : []));
  const grepInvert = [...grupo.grepInvert, ...patterns(taken)];
  return "resto" in teil
    ? auswahl(grupo.grep, grepInvert)
    : auswahl(patterns(teil.prefiksoj), grepInvert);
}
