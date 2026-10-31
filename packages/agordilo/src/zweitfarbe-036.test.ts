// Spec 036, Befund 2.2 (V-2): an optional second colour of the brand (Zweitfarbe). The Agordo
// names it in `zweitfarbe` (the same colour value as `leitfarbe`, plus where it was found); the
// derivation builds the palette color.palette.sekundo from it at the contrast targets of the accent
// ramp, and the roles of the Zweitfarbe (highlight surface, illustration, badge, chart) follow it.
// Nothing else moves: actions, links and focus keep the lead colour. Without a Zweitfarbe the
// palette aliases the neutral ramp, so a brand without one looks as before. The example Agordo
// `dukolora` (invented, test only) lives with its derived package in the Modelo fixtures.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildModelo,
  deriveThemeFragment,
  oklchComponentsOf,
  readDtcgColor,
  resolveCombination,
  srgbComponentsOf,
} from "@fundamento/modelo";
import { beforeAll, describe, expect, it } from "vitest";
import {
  type Agordo,
  composeFiles,
  type Derivation,
  derivationBasis,
  deriveAspekto,
  loadCalibration,
  packageDocuments,
  packageLabel,
  parseAgordoColor,
  readAgordo,
  readStructure,
} from "./index.js";

const DUKOLORA_AGORDO = fileURLToPath(
  new URL("../../modelo/test/fixtures/valid/aspekto-dukolora/agordo.json", import.meta.url),
);
const DUKOLORA_PACKAGE = fileURLToPath(
  new URL("../../modelo/test/fixtures/valid/aspekto-dukolora/aspekto-dukolora/", import.meta.url),
);

/** The roles of the Zweitfarbe (Spec 036 V-2: never an action, a link or the focus). */
const ROLES = [
  "color.sekundo.surface",
  "color.sekundo.illustration",
  "color.sekundo.badge.fill",
  "color.sekundo.badge.text",
  "color.sekundo.chart",
] as const;

const STEPS = [
  "25",
  "50",
  "100",
  "150",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "850",
  "900",
  "950",
  "975",
] as const;

const COMBINATIONS = [
  { "color-scheme": "light", contrast: "default" },
  { "color-scheme": "light", contrast: "high" },
  { "color-scheme": "dark", contrast: "default" },
  { "color-scheme": "dark", contrast: "high" },
] as const;

function dukolora(): Agordo {
  const { agordo, issues } = readAgordo(
    JSON.parse(readFileSync(DUKOLORA_AGORDO, "utf8")),
    "agordo.json",
  );
  expect(issues).toEqual([]);
  if (agordo === undefined) throw new Error("the Agordo dukolora does not read");
  return agordo;
}

/** The same brand without its Zweitfarbe. */
function withoutZweitfarbe(agordo: Agordo): Agordo {
  const { zweitfarbe: _ignored, ...rest } = agordo as Agordo & { zweitfarbe?: unknown };
  return rest as Agordo;
}

type Tokens = Record<string, { value: unknown; aliasChain: { token: string }[] }>;

/** The resolved tokens of the derived Aspekto in one combination of the other Dimensioj. */
function resolver(agordo: Agordo) {
  const structure = readStructure();
  const basis = derivationBasis(agordo, structure, loadCalibration());
  const documents = packageDocuments(agordo, structure, basis.palettes, [], basis.gestalt);
  const label = packageLabel(agordo);
  const draft = buildModelo(composeFiles(structure, label, documents, [])).modelo;
  const files = composeFiles(structure, label, documents, deriveThemeFragment(draft, label));
  const modelo = buildModelo(files).modelo;
  return (assignment: Record<string, string>): Tokens =>
    resolveCombination(modelo, { aspekto: agordo.name, ...assignment }).tokens as Tokens;
}

function oklchOf(tokens: Tokens, name: string): [number, number, number] {
  const colour = readDtcgColor(tokens[name]?.value);
  if (colour === undefined) throw new Error(`${name} is not a colour`);
  return oklchComponentsOf({ colorSpace: "srgb", components: srgbComponentsOf(colour) });
}

const hueDistance = (a: number, b: number): number => {
  const difference = Math.abs(a - b) % 360;
  return Math.min(difference, 360 - difference);
};

describe("an Agordo with a Zweitfarbe (Spec 036, Befund 2.2, V-2)", () => {
  let derivation: Derivation;
  let withIt: ReturnType<typeof resolver>;
  let without: ReturnType<typeof resolver>;
  beforeAll(() => {
    derivation = deriveAspekto(dukolora(), readStructure(), loadCalibration());
    withIt = resolver(dukolora());
    without = resolver(withoutZweitfarbe(dukolora()));
  });

  it("reads: zweitfarbe is the colour of leitfarbe's shape with an optional herkunft", () => {
    const agordo = dukolora() as Agordo & {
      zweitfarbe?: { farbe: string; herkunft?: { quelle: string; merkmal: string } };
    };
    expect(parseAgordoColor(agordo.zweitfarbe?.farbe ?? "")).toBeDefined();
    expect(agordo.zweitfarbe?.herkunft?.quelle).toBe("bild");
    const { issues } = readAgordo({ name: "dukolora", leitfarbe: "#375479", zweitfarbe: {} });
    expect(issues.map(({ rule, path }) => ({ rule, path }))).toEqual([
      { rule: "schema-violation", path: "agordo.json#/zweitfarbe/farbe" },
    ]);
  });

  it("derives an exportable Aspekto that passes every check", () => {
    expect(derivation.issues).toEqual([]);
    expect(derivation.raporto.violations).toEqual([]);
    expect(derivation.exportable).toBe(true);
  });

  it("equals the committed fixture aspekto-dukolora (regenerate with fm agordilo derive)", () => {
    // pnpm fm agordilo derive packages/modelo/test/fixtures/valid/aspekto-dukolora/agordo.json
    //   --out packages/modelo/test/fixtures/valid/aspekto-dukolora/aspekto-dukolora
    for (const [path, text] of Object.entries(derivation.files)) {
      expect(readFileSync(join(DUKOLORA_PACKAGE, path), "utf8"), path).toBe(text);
    }
  });

  it("writes the palette color.palette.sekundo in the tone of the Zweitfarbe", () => {
    const set = JSON.parse(derivation.files["sets/aspekto/dukolora.json"] ?? "{}");
    const zweitfarbe = parseAgordoColor("#0f8f86");
    if (zweitfarbe === undefined) throw new Error("#0f8f86 does not parse");
    const tokens = withIt({ "color-scheme": "light", contrast: "default" });
    for (const step of STEPS) {
      const value = set.color?.palette?.sekundo?.[step]?.$value;
      expect(readDtcgColor(value), `color.palette.sekundo.${step} is a colour`).toBeDefined();
    }
    const [, chroma, hue] = oklchOf(tokens, "color.palette.sekundo.700");
    expect(chroma).toBeGreaterThan(0.05);
    expect(hueDistance(hue, zweitfarbe.h)).toBeLessThan(5);
  });

  it("gives the roles of the Zweitfarbe its palette in every combination", () => {
    for (const assignment of COMBINATIONS) {
      const tokens = withIt(assignment);
      for (const role of ROLES) {
        const chain = tokens[role]?.aliasChain.map((link) => link.token) ?? [];
        expect(
          chain.some((name) => name.startsWith("color.palette.sekundo.")),
          `${role} in ${JSON.stringify(assignment)}: ${chain.join(" → ")}`,
        ).toBe(true);
      }
    }
  });

  it("moves nothing else: every other token resolves as for the brand without a Zweitfarbe", () => {
    for (const assignment of COMBINATIONS) {
      const a = withIt(assignment);
      const b = without(assignment);
      const moved = Object.keys(b)
        .filter(
          (name) =>
            !name.startsWith("color.palette.sekundo.") && !name.startsWith("color.sekundo."),
        )
        .filter((name) => JSON.stringify(a[name]?.value) !== JSON.stringify(b[name]?.value));
      expect(moved, JSON.stringify(assignment)).toEqual([]);
    }
  });

  it("without a Zweitfarbe the palette is the neutral ramp: nothing renders differently", () => {
    const tokens = without({ "color-scheme": "light", contrast: "default" });
    for (const step of STEPS) {
      expect(tokens[`color.palette.sekundo.${step}`]?.value, step).toEqual(
        tokens[`color.palette.neutral.${step}`]?.value,
      );
    }
  });
});
