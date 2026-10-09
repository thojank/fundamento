// No web term in a Uzo (Spec 007 T013, A6, D-09, Art. VIII). The words come from the lists that
// check:vortaro-lint already keeps; they are not written a second time. Property test with
// fast-check, fixed seed, like the NomReguloj (AK-03): every CSS property of those lists, put at any
// string position of a valid Uzo, is reported there.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { DESIGN_PREFIXES, STRUCTURAL_PROPERTIES } from "../checks/vortaro-lint/component-css.js";
import { PHYSICAL_PROPERTIES } from "../checks/vortaro-lint/css-physical.js";
import { appendPointer } from "../json/pointer.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";
import { uzoWebTermIssues } from "./uzo-rules.js";

const PARAMS = { seed: 20261009, numRuns: 500 } as const;
const FILE = "data/eroj/butono/uzo.json";

/** The Uzo of valid/ero-uzo-minimal, with a string in every kind of field the schema has. */
function validUzo(): Record<string, unknown> {
  const { uzo } = JSON.parse(
    readFileSync(join(fixtureRoot("valid", "ero-uzo-minimal"), FILE), "utf8"),
  ) as { uzo: Record<string, unknown> };
  return {
    ...uzo,
    instead: [
      {
        goal: "toggle",
        keywords: { en: ["toggle"], de: ["umschalten"] },
        ero: null,
        kialo: "A setting that stays on needs a control that shows its state.",
      },
    ],
    boundary: [
      ...(uzo.boundary as unknown[]),
      {
        case: "multi-line-label",
        action: "not-supported",
        via: { layout: "wrap" },
        keywords: { en: ["multi-line"] },
        kialo: "A label that breaks into lines no longer reads as one action.",
      },
    ],
    composes: {
      containers: [{ name: "action-bar", kialo: "A bar at the end of a view holds its actions." }],
      with: [{ ero: "butono", kialo: "Actions of one decision stand together." }],
      never: [],
      spacing: { owner: "container", regulo: "spacing-owned-by-container" },
    },
    slots: { label: { accepts: ["text"], max: 1, nesting: 0 } },
    content: [
      {
        regulo: "destructive-label-not-generic",
        fixed: true,
        severity: "error",
        check: { kind: "not-words", words: { en: ["ok"], de: ["ja"] } },
      },
    ],
  };
}

/** JSON Pointers of every string value below `value`. */
function stringPointers(value: unknown, pointer = ""): string[] {
  if (typeof value === "string") return [pointer];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => stringPointers(item, `${pointer}/${index}`));
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, item]) =>
      stringPointers(item, appendPointer(pointer, key)),
    );
  }
  return [];
}

function setAt(value: unknown, pointer: string, replacement: string): unknown {
  const copy = structuredClone(value) as Record<string, unknown>;
  const segments = pointer
    .split("/")
    .slice(1)
    .map((segment) => segment.replaceAll("~1", "/").replaceAll("~0", "~"));
  const last = segments.pop() as string;
  let holder = copy as Record<string, unknown>;
  for (const segment of segments) holder = holder[segment] as Record<string, unknown>;
  holder[last] = replacement;
  return copy;
}

const CSS_PROPERTIES = [
  ...STRUCTURAL_PROPERTIES,
  ...DESIGN_PREFIXES,
  ...Object.keys(PHYSICAL_PROPERTIES),
  ...Object.values(PHYSICAL_PROPERTIES),
];

describe("uzo-web-term (T013)", () => {
  const uzo = validUzo();
  const pointers = stringPointers(uzo);

  it("finds no web term in a valid Uzo", () => {
    expect(pointers.length).toBeGreaterThan(20);
    expect(uzoWebTermIssues(FILE, uzo)).toEqual([]);
  });

  it("reports every CSS property of the vortaro-lint lists at any string position", () => {
    fc.assert(
      fc.property(fc.constantFrom(...CSS_PROPERTIES), fc.constantFrom(...pointers), (term, at) => {
        const issues = uzoWebTermIssues(FILE, setAt(uzo, at, term));
        expect(issues.map(({ rule, path }) => ({ rule, path }))).toEqual([
          { rule: "uzo-web-term", path: `${FILE}#/uzo${at}` },
        ]);
      }),
      PARAMS,
    );
  });

  it.each([
    ["a length", "/layout/size", "100%"],
    ["a length in a sentence", "/purpose", "Starts an action; its outer distance is 8px."],
    ["a hyphenated property in a sentence", "/boundary/0/kialo", "Set white-space to nowrap."],
    ["a DOM attribute", "/composes/containers/0/name", "aria-label"],
  ])("reports %s", (_what, at, value) => {
    expect(uzoWebTermIssues(FILE, setAt(uzo, at, value)).map(({ path }) => path)).toEqual([
      `${FILE}#/uzo${at}`,
    ]);
  });

  // A plain word that happens to name a CSS property is prose, not a term, inside a sentence.
  it("does not report a plain word inside a sentence", () => {
    const sentence = "The button grows in height next to its neighbours, whatever its color.";
    expect(uzoWebTermIssues(FILE, setAt(uzo, "/boundary/1/kialo", sentence))).toEqual([]);
  });
});
