// Spec 036, Befund 2.2 (V-2): the second colour of a brand (Zweitfarbe) as its own palette with a
// few roles that are never actions: a highlight surface, an illustration, a badge and a chart. The
// tokens are additive and complete (Art. IV, D-20): every Aspekto assigns them; a brand without a
// Zweitfarbe aliases the neutral ramp, so nothing renders differently. Each role is a member of a
// KontrastParo, measured by Alirebleco in every combination (WCAG 2.x binding).

import { describe, expect, it } from "vitest";
import { evaluateAlirebleco } from "../checks/alirebleco/evaluate.js";
import { aliasTarget } from "../contracts/grammar.js";
import type { Modelo } from "../contracts/modelo.js";
import { readFacetoj } from "../facetoj/facetoj.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource, projectModeloSource } from "../load/source.js";

const { modelo: loaded } = loadModelo(defaultModeloSource());
if (loaded === undefined) throw new Error("the repo Modelo did not load");
const modelo: Modelo = loaded;
const core = modelo.setoj.find((set) => set.name === "core")?.tokens ?? {};

const PALETTE = "color.palette.sekundo";
// Spec 036 B-6.2-1: twelve steps, not the fifteen of the accent ramp – every step a role uses
// (light 150/600/700/800, dark 150/300/400/800, high contrast 100/900) and the even ramp around them.
const STEPS = ["50", "100", "150", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

/**
 * Spec 036 B-6.2-1: the core tokens of the first two levels may grow by 24 from 376 to the 400 of
 * coverage.test.ts. Teil 1 adds radius.role.multiline (1), ②b-5 radius.role.tag and five
 * color.syntax.* (6); the Zweitfarbe keeps to the rest.
 */
const ZWEITFARBE_CORE_BUDGET = 17;

/** Role → the role it declares (Constitution: foreground, background, border …). */
const ROLES: Readonly<Record<string, string>> = {
  "color.sekundo.surface": "background",
  "color.sekundo.illustration": "foreground",
  "color.sekundo.badge.fill": "background",
  "color.sekundo.badge.text": "foreground",
  "color.sekundo.chart": "foreground",
};

/** The KontrastParoj of the roles: name → foreground, background, kategorio. */
const PAIRS: Readonly<Record<string, [string, string, string]>> = {
  "text-default-on-sekundo-surface": ["color.text.default", "color.sekundo.surface", "text-normal"],
  "sekundo-badge-text-on-badge-fill": [
    "color.sekundo.badge.text",
    "color.sekundo.badge.fill",
    "text-normal",
  ],
  "sekundo-illustration-on-background-default": [
    "color.sekundo.illustration",
    "color.background.default",
    "ui",
  ],
  "sekundo-chart-on-background-default": ["color.sekundo.chart", "color.background.default", "ui"],
};

describe("the Zweitfarbe in the Vortaro (Spec 036, Befund 2.2, V-2)", () => {
  it("has the palette color.palette.sekundo with its twelve steps (B-6.2-1)", () => {
    const steps = Object.keys(core)
      .filter((name) => name.startsWith(`${PALETTE}.`))
      .map((name) => name.slice(`${PALETTE}.`.length));
    expect(steps.sort()).toEqual([...STEPS].sort());
    for (const step of STEPS) {
      const token = core[`${PALETTE}.${step}`];
      expect(token?.role, `${PALETTE}.${step}`).toBe("palette");
      // komuna has no Zweitfarbe: the palette is the neutral ramp, step for step (D-20).
      expect(aliasTarget(token?.value), `${PALETTE}.${step}`).toBe(`color.palette.neutral.${step}`);
    }
  });

  it("takes at most 17 core tokens, so Teil 1, 2b and ②b-5 together stay within 400 (B-6.2-1)", () => {
    const own = Object.keys(core).filter(
      (name) => name.startsWith(`${PALETTE}.`) || name.startsWith("color.sekundo."),
    );
    expect(own.length).toBeLessThanOrEqual(ZWEITFARBE_CORE_BUDGET);
  });

  it("has the roles of the Zweitfarbe on its palette, each with a role and a description", () => {
    for (const [name, role] of Object.entries(ROLES)) {
      const token = core[name];
      expect(token?.role, name).toBe(role);
      expect(aliasTarget(token?.value) ?? "", name).toMatch(/^color\.palette\.sekundo\.\d+$/);
      expect(token?.description?.length ?? 0, name).toBeGreaterThan(20);
    }
  });

  it("is assigned by every Aspekto of the repo (Art. IV)", () => {
    // Every example brand: komuna, ekzemplo, provo, provo-kompakta, komuna-0-2 and dukolora.
    const cxiuj = new URL(
      "../../test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
      import.meta.url,
    ).pathname;
    const { modelo: all } = loadModelo(projectModeloSource(cxiuj));
    const aspektoj = (all?.setoj ?? []).filter(
      (set) => set.name.startsWith("aspekto/") && !set.name.includes("+"),
    );
    expect(aspektoj.map((set) => set.name)).toContain("aspekto/dukolora");
    for (const set of aspektoj) {
      // komuna is the reference: its main set is the core (an empty override).
      if (Object.keys(set.tokens).length === 0) continue;
      const missing = [...STEPS.map((step) => `${PALETTE}.${step}`), ...Object.keys(ROLES)].filter(
        (name) => set.tokens[name] === undefined,
      );
      expect(missing, set.name).toEqual([]);
    }
  });

  it("declares a KontrastParo for every role of the Zweitfarbe", () => {
    for (const [name, [foreground, background, kategorio]] of Object.entries(PAIRS)) {
      const pair = modelo.kontrastParoj.find((entry) => entry.name === name);
      expect(pair, name).toMatchObject({ foreground, background, kategorio });
    }
    const members = new Set(
      modelo.kontrastParoj.flatMap((pair) => [pair.foreground, pair.background]),
    );
    expect(Object.keys(ROLES).filter((role) => !members.has(role))).toEqual([]);
  });

  it("Alirebleco measures the pairs in every combination and each passes WCAG 2.x", () => {
    const evaluation = evaluateAlirebleco(modelo, { kontrastParojFile: "data/kontrastparoj.json" });
    for (const [name, [, , kategorio]] of Object.entries(PAIRS)) {
      const ratio = evaluation.stats[`minRatio:${name}`];
      expect(ratio, name).toBeDefined();
      // The lowest WCAG 2.x ratio over every combination, against the default threshold.
      expect(ratio ?? 0, name).toBeGreaterThanOrEqual(kategorio === "ui" ? 3 : 4.5);
    }
    const ours = evaluation.errors.filter((issue) =>
      Object.keys(PAIRS).some((name) => issue.message.includes(name)),
    );
    expect(ours).toEqual([]);
  });

  it("the Faceto gvidkoloro owns the palette and the roles and names the Agordo field", () => {
    const facetoj = readFacetoj(new URL("../../data/", import.meta.url).pathname);
    const gvidkoloro = facetoj?.facetoj.find((faceto) => faceto.name === "gvidkoloro");
    expect(gvidkoloro?.tokenoj).toEqual(expect.arrayContaining([PALETTE, "color.sekundo"]));
    expect(gvidkoloro?.agordo).toContain("zweitfarbe");
  });
});
