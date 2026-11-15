// Spec 055 T3 (LNS-1.2): an own Neutral colour (`neutral.farbe`) as the base of the Neutral
// palette. Without the field every Agordo derives byte for byte as on main 642ab220 (Abnahme 4):
// the checksums below were taken there, before any change, and pin the palettes and the whole
// package of every Agordo the repo keeps outside packages/mcp. With the field, the colour gives the
// Neutral palette its hue and chroma (scaled by the Tönung, default 1, without NEUTRAL_SHARE);
// `explain` keeps it in every Agordo it searches; the history lists no slider for it (D-7).

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type Agordo, parseAgordoColor, readAgordo } from "./agordo.js";
import { derivationBasis, deriveAspekto } from "./derive.js";
import { Explainer } from "./explain.js";
import { gestaltBasis } from "./gestalt.js";
import { loadCalibration, readStructure } from "./node/structure.js";
import { type DerivedPalettes, derivePalettes, NEUTRAL_SHARE } from "./palettes.js";
import { historioEintrag } from "./wunsch.js";

// Every Agordo `explain` derives the Neutral palette of alone: the Agordoj of its searches.
const gesucht = vi.hoisted(() => ({ agordoj: [] as unknown[] }));
// The factory runs when the module is first imported; it chains with `then`, so no `await` stands
// in a module-level statement (modelo `ci/test-setup.test.ts`).
vi.mock("./palettes.js", (original) =>
  original<typeof import("./palettes.js")>().then((echt) => ({
    ...echt,
    derivePalettes: (...args: Parameters<typeof echt.derivePalettes>) => {
      const [agordo, , , , only] = args;
      if (only?.length === 1 && only[0] === "neutral") gesucht.agordoj.push(agordo);
      return echt.derivePalettes(...args);
    },
  })),
);

const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");

const json = (url: URL): unknown => JSON.parse(readFileSync(url, "utf8"));

function agordoOf(value: unknown): Agordo {
  const { agordo, issues } = readAgordo(value, "agordo.json");
  expect(issues).toEqual([]);
  if (agordo === undefined) throw new Error("the Agordo does not read");
  return agordo;
}

const VALID = new URL("../../modelo/test/fixtures/valid/", import.meta.url);
const STUFE1 = new URL("../fixtures/stufe1-provo.json", import.meta.url);
const SCHEMA = new URL("../../modelo/schema/modelo.schema.json", import.meta.url);
const DERIVED_FIXTURES = ["aspekto-provo", "aspekto-provo-kompakta", "aspekto-dukolora"] as const;

/**
 * Every Agordo of the repo outside packages/mcp that this package's test hash covers, by where it
 * lies. The canvas's own Agordo (nodredaktilo/belegung/leinwand.agordo.json) and the start
 * Agordoj (`startAgordo`) are pinned in metiejo's neutral-skribo-055.test.ts, whose hash covers
 * them. The Aspekto packages of the valid fixtures embed the same Agordo (first test).
 */
const AGORDOJ: [string, unknown][] = [
  ...DERIVED_FIXTURES.map((name): [string, unknown] => [
    `modelo/test/fixtures/valid/${name}/agordo.json`,
    json(new URL(`${name}/agordo.json`, VALID)),
  ]),
  ["agordilo/fixtures/stufe1-provo.json#/agordo", (json(STUFE1) as { agordo: unknown }).agordo],
];

/** The files of a package as one text: path and content, in the derivation's sorted order. */
const filesText = (files: Record<string, string>): string =>
  Object.entries(files)
    .map(([path, text]) => `${path}\u0000${text}\u0000`)
    .join("");

/**
 * Checksums at 642ab220 (taken before any change of LNS-1.2): `palettes` is the derived palettes
 * with the steps set by hand (sources, steps, overrides) as JSON, `paket` every file of the
 * derived package (path and bytes, raporto included).
 */
const PINNED_642AB220: Record<string, { palettes: string; paket: string }> = {
  "modelo/test/fixtures/valid/aspekto-provo/agordo.json": {
    palettes: "f54abef3e63fa3629b2a7c57d1b993bcb877aaf939685432e8f778932c802245",
    paket: "efc1fad3da6977d68a3a6de1071643714a397618f2aa64f2838d7dbe2901dae5",
  },
  "modelo/test/fixtures/valid/aspekto-provo-kompakta/agordo.json": {
    palettes: "ccfc62f16cf4ef34ae7a470ec59822468bba3b0f2a14bb3f7d0e598a89b7f513",
    paket: "4f22b99a39512b568bb6dc25febb0ad3b7ffc2c84381d66e43768922aac783e0",
  },
  "modelo/test/fixtures/valid/aspekto-dukolora/agordo.json": {
    palettes: "1eec76607cafe776d8a05291b3d1963e16ad4a933c6484fa29b1b697f9801bdf",
    paket: "4f507e2555620712d46fdaf5f8d86ce40982b3acb6342e4a7ddb672cceb47232",
  },
  // The same palettes as aspekto-provo: the two differ in fonts and festgelegt typography only.
  "agordilo/fixtures/stufe1-provo.json#/agordo": {
    palettes: "f54abef3e63fa3629b2a7c57d1b993bcb877aaf939685432e8f778932c802245",
    paket: "49ad18f8bfdd280e0ec453137481e548f6f1e4c6ce3ce35c99d93d44bad5d1c2",
  },
};

describe("Spec 055 Abnahme 4: every Agordo without neutral.farbe derives byte for byte as on 642ab220", () => {
  const structure = readStructure();
  const calibration = loadCalibration();

  it("an Aspekto package embeds the same Agordo as its agordo.json (pinned once)", () => {
    const differ: string[] = [];
    for (const name of DERIVED_FIXTURES) {
      const own = json(new URL(`${name}/agordo.json`, VALID));
      const aspekto = json(new URL(`${name}/${name}/aspekto.json`, VALID));
      const embedded = (aspekto as { agordilo: { agordo: unknown } }).agordilo.agordo;
      if (JSON.stringify(own) !== JSON.stringify(embedded)) differ.push(name);
    }
    expect(differ).toEqual([]);
  });

  it.each(AGORDOJ)("%s", (label, value) => {
    const derivation = deriveAspekto(agordoOf(value), structure, calibration);
    expect({
      [label]: {
        palettes: sha256(JSON.stringify(derivation.palettes)),
        paket: sha256(filesText(derivation.files)),
      },
    }).toEqual({ [label]: PINNED_642AB220[label] });
  });
});

// ---------------------------------------------------------------------------------------------
// With neutral.farbe

const FARBE = "#e8e2d6";
const LEAD = "#375479";
const BASE = { name: "provo", leitfarbe: LEAD };

const oklchOf = (text: string) => {
  const colour = parseAgordoColor(text);
  if (colour === undefined) throw new Error(`${text} does not read`);
  return colour;
};

const neutralSteps = (palettes: DerivedPalettes) =>
  [...palettes.steps, ...palettes.overrides].filter((step) => step.palette === "neutral");

describe("Spec 055 T3: neutral.farbe is the base of the Neutral palette (paletteSources)", () => {
  const calibration = loadCalibration();
  const floors = { thresholds: [3, 4.5, 7], reserve: 0.05 };
  const derived = (value: unknown) => derivePalettes(agordoOf(value), calibration, floors);

  it("takes hue and chroma of the colour, Tönung 1 by default, without NEUTRAL_SHARE", () => {
    const own = oklchOf(FARBE);
    expect({
      ohneToenung: derived({ ...BASE, neutral: { farbe: FARBE } }).sources.neutral,
      halb: derived({ ...BASE, neutral: { farbe: FARBE, toenung: 0.5 } }).sources.neutral,
    }).toEqual({
      ohneToenung: { hue: own.h, chroma: own.c, origin: "neutralfarbe" },
      halb: { hue: own.h, chroma: 0.5 * own.c, origin: "neutralfarbe" },
    });
  });

  it("is grey at Tönung 0: no step of the Neutral palette carries chroma", () => {
    const palettes = derived({ ...BASE, neutral: { farbe: FARBE, toenung: 0 } });
    expect(palettes.sources.neutral).toEqual({
      hue: oklchOf(FARBE).h,
      chroma: 0,
      origin: "neutralfarbe",
    });
    const coloured = neutralSteps(palettes).filter((step) => step.requested !== 0);
    expect(coloured.map((step) => `${step.step} ${step.mode}`)).toEqual([]);
  });

  it("leaves the Tönung branch as it was without the field (origin toenung, the lead's hue)", () => {
    const lead = oklchOf(LEAD);
    expect(derived({ ...BASE, neutral: { toenung: 0.4 } }).sources.neutral).toEqual({
      hue: lead.h,
      chroma: 0.4 * lead.c * NEUTRAL_SHARE,
      origin: "toenung",
    });
  });

  it("takes a pure red as it is: the Neutral palette turns as colourful as the colour asks", () => {
    const red = oklchOf("#ff0000");
    const own = derived({ ...BASE, neutral: { farbe: "#ff0000" } });
    const viaLead = derived({ name: "provo", leitfarbe: "#ff0000", neutral: { toenung: 1 } });
    const most = (palettes: DerivedPalettes) =>
      Math.max(...neutralSteps(palettes).map((step) => step.c));
    expect(own.sources.neutral).toEqual({ hue: red.h, chroma: red.c, origin: "neutralfarbe" });
    expect(most(own)).toBeGreaterThan(most(viaLead));
  });
});

describe("Spec 055 T3 (D-6): explain keeps neutral.farbe in every Agordo it searches", () => {
  const structure = readStructure();
  const calibration = loadCalibration();
  const STEP = "color.palette.neutral.500";

  /** An Explainer over the real basis whose palettes say what `mark` makes of the neutral steps. */
  const explainerOf = (
    agordo: Agordo,
    mark: (step: DerivedPalettes["steps"][number]) => object,
  ) => {
    const basis = derivationBasis(agordo, structure, calibration);
    const palettes: DerivedPalettes = {
      ...basis.palettes,
      steps: basis.palettes.steps.map((step) =>
        step.palette === "neutral" ? { ...step, ...mark(step) } : step,
      ),
    };
    return new Explainer({ ...basis, agordo, calibration, palettes });
  };

  beforeEach(() => {
    gesucht.agordoj.length = 0;
  });

  it("the Tönung suggestion of an off-target step (explain.ts #tintSuggestion)", () => {
    const agordo = agordoOf({ ...BASE, neutral: { farbe: FARBE, toenung: 0.6 } });
    const explanation = explainerOf(agordo, (step) =>
      step.step === "500" ? { onTarget: false } : {},
    ).explain("contrast-below-threshold", {}, [STEP]);
    expect(gesucht.agordoj.length).toBeGreaterThan(0);
    const lost = gesucht.agordoj.filter(
      (searched) => (searched as Agordo).neutral?.farbe !== FARBE,
    );
    expect(lost).toEqual([]);
    expect(Object.keys(explanation.apply ?? {})).toEqual(["neutral"]);
    expect(Object.keys((explanation.apply as { neutral: object }).neutral)).toEqual(["toenung"]);
  });

  it("the ramp suggestion of palette-even (explain.ts #rampSuggestion)", () => {
    const agordo = agordoOf({ ...BASE, neutral: { farbe: FARBE, toenung: 0.6 } });
    const explanation = explainerOf(agordo, (step) => ({
      onTarget: true,
      toneKept: true,
      target: step.calibrated,
    })).explain("palette-even", {}, [STEP]);
    expect(gesucht.agordoj.length).toBeGreaterThan(0);
    const lost = gesucht.agordoj.filter(
      (searched) => (searched as Agordo).neutral?.farbe !== FARBE,
    );
    expect(lost).toEqual([]);
    expect(Object.keys(explanation.apply ?? {})).toEqual(["neutral"]);
    expect(Object.keys((explanation.apply as { neutral: object }).neutral)).toEqual(["toenung"]);
  });

  it("starts both searches from the Tönung the derivation uses: 1 with an own colour and none set", () => {
    const agordo = agordoOf({ ...BASE, neutral: { farbe: FARBE } });
    const tint = explainerOf(agordo, (step) =>
      step.step === "500" ? { onTarget: false } : {},
    ).explain("contrast-below-threshold", {}, [STEP]);
    const ramp = explainerOf(agordo, (step) => ({
      onTarget: true,
      toneKept: true,
      target: step.calibrated,
    })).explain("palette-even", {}, [STEP]);
    expect({
      tint: tint.suggestion.includes("(now 1.00)"),
      ramp: ramp.suggestion.includes("(now 1.00)"),
    }).toEqual({
      tint: true,
      ramp: true,
    });
  });
});

describe("Spec 055 T3 (D-7): the history lists no slider for a change of neutral.farbe alone", () => {
  it("historioEintrag gives an entry by hand with an empty diff", () => {
    const basis = gestaltBasis(readStructure().files);
    const before = agordoOf({ ...BASE, neutral: { toenung: 1 } });
    const after = agordoOf({ ...BASE, neutral: { toenung: 1, farbe: FARBE } });
    expect(historioEintrag(before, after, undefined, "2026-11-15", basis)).toEqual({
      datum: "2026-11-15",
      wunsch: "Hand",
      diff: [],
    });
  });
});

describe("Spec 055 T3: the schema takes neutral.farbe and nothing else new", () => {
  it("accepts a colour of the Agordo's form under neutral.farbe", () => {
    const ok = [
      { ...BASE, neutral: { farbe: FARBE } },
      { ...BASE, neutral: { farbe: "oklch(0.92 0.02 80)", toenung: 0.3 } },
      { ...BASE, neutral: { farbe: "#ff0000" } },
    ].map((value) => readAgordo(value, "agordo.json").issues);
    expect(ok).toEqual([[], [], []]);
  });

  it("refuses an unreadable colour and any other new key, at their path", () => {
    const blau = readAgordo({ ...BASE, neutral: { farbe: "blau" } }, "agordo.json");
    const andere = readAgordo({ ...BASE, neutral: { farbe: FARBE, farbton: 30 } }, "agordo.json");
    expect({
      blau: { agordo: blau.agordo, paths: blau.issues.map((issue) => issue.path) },
      andere: { agordo: andere.agordo, paths: andere.issues.map((issue) => issue.path) },
    }).toEqual({
      blau: { agordo: undefined, paths: ["agordo.json#/neutral/farbe"] },
      andere: { agordo: undefined, paths: ["agordo.json#/neutral/farbton"] },
    });
  });

  it("differs from the schema of 642ab220 in exactly one property: Agordo.neutral.farbe", () => {
    const schema = json(SCHEMA) as {
      $defs: { Agordo: { properties: { neutral: { properties: Record<string, unknown> } } } };
    };
    const neutral = schema.$defs.Agordo.properties.neutral.properties;
    expect(neutral.farbe).toEqual({ $ref: "#/$defs/AgordoColor" });
    delete neutral.farbe;
    // sha256 of JSON.stringify(JSON.parse(`git show 642ab220:packages/modelo/schema/modelo.schema.json`)).
    expect(sha256(JSON.stringify(schema))).toBe(
      "bfe6c7472247e9dfb26ced3c06604295dc574129e5db4f7f39fd1cee081d9d8b",
    );
  });
});
