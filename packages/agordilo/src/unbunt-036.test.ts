// Spec 036, Befund 2.1 (V-1): the lead colour of a brand may be black or a very dark neutral. The
// derivation keeps it: the roles that carry the lead colour in the light mode (actions, links)
// take the step of the accent ramp nearest to it, their states keep their distance from it, the
// high-contrast light mode is no lighter than the default, and every check still passes. A brand
// with a colourful or a mid-grey lead colour is derived as before.

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
  readStructure,
} from "./index.js";

const INK: Agordo = { name: "inko", leitfarbe: "#111111" };

/** The resolved tokens of the derived Aspekto in one combination of the other Dimensioj. */
function resolver(agordo: Agordo) {
  const structure = readStructure();
  const basis = derivationBasis(agordo, structure, loadCalibration());
  const documents = packageDocuments(agordo, structure, basis.palettes, [], basis.gestalt);
  const label = packageLabel(agordo);
  const draft = buildModelo(composeFiles(structure, label, documents, [])).modelo;
  const files = composeFiles(structure, label, documents, deriveThemeFragment(draft, label));
  const modelo = buildModelo(files).modelo;
  return (assignment: Record<string, string>) =>
    resolveCombination(modelo, { aspekto: agordo.name, ...assignment }).tokens;
}

/** The OKLCH lightness of a resolved colour token. */
function lightness(tokens: Record<string, { value: unknown }>, name: string): number {
  const colour = readDtcgColor(tokens[name]?.value);
  if (colour === undefined) throw new Error(`${name} is not a colour`);
  return oklchComponentsOf({ colorSpace: "srgb", components: srgbComponentsOf(colour) })[0];
}

const LEAD_ROLES = ["color.action.primary.rest", "color.link.rest"] as const;

describe("a very dark neutral lead colour (Spec 036, Befund 2.1, V-1)", () => {
  let derivation: Derivation;
  let tokensOf: ReturnType<typeof resolver>;
  beforeAll(() => {
    derivation = deriveAspekto(INK, readStructure(), loadCalibration());
    tokensOf = resolver(INK);
  });

  it("derives an exportable Aspekto that passes every check", () => {
    expect(derivation.issues).toEqual([]);
    expect(derivation.raporto.violations).toEqual([]);
    expect(derivation.exportable).toBe(true);
  });

  it("gives the actions and links of the light mode the lead colour, not a mid grey", () => {
    const lead = parseAgordoColor(INK.leitfarbe)?.l ?? 0;
    const tokens = tokensOf({ "color-scheme": "light", contrast: "default" });
    const off = LEAD_ROLES.map((role) => ({
      role,
      delta: Math.abs(lightness(tokens, role) - lead),
    }))
      .filter((entry) => entry.delta > 0.05)
      .map((entry) => `${entry.role} ${entry.delta.toFixed(3)} from the lead colour`);
    expect(off).toEqual([]);
  });

  it("keeps the high-contrast light mode at least as dark as the default for those roles", () => {
    const base = tokensOf({ "color-scheme": "light", contrast: "default" });
    const high = tokensOf({ "color-scheme": "light", contrast: "high" });
    const lighter = LEAD_ROLES.filter(
      (role) => lightness(high, role) > lightness(base, role) + 1e-9,
    );
    expect(lighter).toEqual([]);
  });

  it("keeps the dark mode light on dark: actions and links stay far lighter than the lead", () => {
    const tokens = tokensOf({ "color-scheme": "dark", contrast: "default" });
    for (const role of LEAD_ROLES) expect(lightness(tokens, role), role).toBeGreaterThan(0.6);
  });
});
