// KontrastParoj and Reguloj of the Phase-1 Vortaro (Spec 001, FR-08, D-12, K5, Art. VI, AK-02;
// task T017).

import Color from "colorjs.io";
import { describe, expect, it } from "vitest";
import { SURFACE_LADDER } from "../checks/alirebleco/color.js";
import { CORE_SET_NAME } from "../contracts/grammar.js";
import type { Modelo } from "../contracts/modelo.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { allAssignments } from "../resolve/assignment.js";
import { resolve } from "../resolve/resolve.js";

const { modelo: loaded } = loadModelo(defaultModeloSource());
if (loaded === undefined) throw new Error("repo did not load");
const modelo: Modelo = loaded;

const SYNTAX = "color.syntax.";

/**
 * Spec 040 B-4: the syntax pairs are the grid of the syntax kinds of the core and the grounds the
 * pairs use – every pair has an entry, every entry belongs to a pair. Derived from the data, so a
 * kind or a ground added in the Vortaro needs no new number here.
 */
function syntaxGridViolations(of: Modelo): string[] {
  const core = of.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {};
  const kinds = Object.keys(core).filter((name) => name.startsWith(SYNTAX));
  const pairs = of.kontrastParoj.filter((pair) => pair.name.startsWith("syntax-"));
  const grounds = [...new Set(pairs.map((pair) => pair.background))];
  const violations: string[] = [];
  if (kinds.length === 0) violations.push(`no ${SYNTAX}* token in the core`);
  if (pairs.length === 0) violations.push("no syntax-* pair");
  for (const foreground of kinds) {
    for (const background of grounds) {
      const entries = pairs.filter(
        (pair) => pair.foreground === foreground && pair.background === background,
      );
      if (entries.length !== 1) {
        violations.push(`${foreground} on ${background}: ${entries.length} pairs, not 1`);
      }
    }
  }
  for (const pair of pairs) {
    if (!kinds.includes(pair.foreground)) {
      violations.push(`${pair.name}: ${pair.foreground} is no ${SYNTAX}* token of the core`);
    }
  }
  return violations;
}

/**
 * Spec 040 B-4: the high-contrast combinations are every valoro of every other Dimensio, each
 * once – the product of their numbers, counted from the Dimensioj, not from allAssignments.
 */
function highCombinationViolations(of: Modelo): string[] {
  const high = allAssignments(of).filter((assignment) => assignment.contrast === "high");
  const expected = of.dimensioj
    .filter((dimensio) => dimensio.name !== "contrast")
    .reduce((product, dimensio) => product * dimensio.valoroj.length, 1);
  const violations: string[] = [];
  const contrast = of.dimensioj.find((dimensio) => dimensio.name === "contrast");
  if (!contrast?.valoroj.some((valoro) => valoro.name === "high")) {
    violations.push("the Dimensio contrast has no valoro high");
  }
  if (high.length !== expected) {
    violations.push(`${high.length} high-contrast combinations, the Dimensioj give ${expected}`);
  }
  const distinct = new Set(high.map((assignment) => JSON.stringify(assignment)));
  if (distinct.size !== high.length) {
    violations.push(`${high.length - distinct.size} high-contrast combinations twice`);
  }
  return violations;
}

/** The repo's Modelo with one more syntax kind: its token in the core and a pair on every ground. */
function withSyntaxKind(of: Modelo, kind: string): Modelo {
  const foreground = `${SYNTAX}${kind}`;
  const template = of.kontrastParoj.filter((pair) => pair.foreground === `${SYNTAX}keyword`);
  return {
    ...of,
    setoj: of.setoj.map((set) => {
      const keyword = set.tokens[`${SYNTAX}keyword`];
      if (set.name !== CORE_SET_NAME || keyword === undefined) return set;
      return { ...set, tokens: { ...set.tokens, [foreground]: { ...keyword, name: foreground } } };
    }),
    kontrastParoj: [
      ...of.kontrastParoj,
      ...template.map((pair) => ({
        ...pair,
        name: pair.name.replace("-keyword-", `-${kind}-`),
        foreground,
      })),
    ],
  };
}

/** The repo's Modelo with one more valoro of a Dimensio. */
function withValoro(of: Modelo, dimensioName: string, valoroName: string): Modelo {
  return {
    ...of,
    dimensioj: of.dimensioj.map((dimensio) => {
      const first = dimensio.valoroj[0];
      if (dimensio.name !== dimensioName || first === undefined) return dimensio;
      return { ...dimensio, valoroj: [...dimensio.valoroj, { ...first, name: valoroName }] };
    }),
  };
}

const has = (foreground: string, background: string) =>
  modelo.kontrastParoj.some(
    (pair) => pair.foreground === foreground && pair.background === background,
  );

describe("KontrastParoj of the repo (D-12, data-model §4)", () => {
  // Spec 011 ① declared the link colours on raised and sunken (six pairs): 76 now.
  it("declares about sixty to a hundred pairs", () => {
    // Spec 011 ③ added four text pairs on the weak status surfaces, ④ three ui pairs of the
    // strong status colours on the sunken track of the meter (83). Spec 036 Befund 2.2 (V-2): four
    // pairs of the roles of the Zweitfarbe (93); the range is a plausibility pin, no threshold.
    // Spec 036 Teil 5 ②b-5 (①-2): the fifteen pairs of the syntax colours are counted on their own
    // (syntax-2b5.test.ts: five kinds on three grounds); the bound holds for every other pair.
    const others = modelo.kontrastParoj.filter((pair) => !pair.name.startsWith("syntax-"));
    expect(others.length).toBeGreaterThanOrEqual(55);
    expect(others.length).toBeLessThanOrEqual(100);
    expect(modelo.kontrastParoj.length - others.length).toBe(15);
  });

  it("covers status text on the weak and subtle status surfaces (K5)", () => {
    for (const status of ["success", "warning", "danger", "info"]) {
      for (const surface of ["weak", "subtle"]) {
        expect(
          has(`color.status.${status}.text`, `color.status.${status}.${surface}`),
          `${status} on ${surface}`,
        ).toBe(true);
      }
    }
  });

  it("keeps the three Phase-0 pairs with their IDs", () => {
    const byName = new Map(modelo.kontrastParoj.map((pair) => [pair.name, pair.id]));
    expect(byName.get("text-on-background")).toBe("kpa_01M2VEEE9HREQTY2499C9JS05Q");
    expect(byName.get("action-primary-text-on-fill")).toBe("kpa_01M2VEEE9JEJM22AGVHZ2Q22AM");
    expect(byName.get("border-on-background")).toBe("kpa_01M2VEEE9JEJM22AGVHZ2Q22AN");
  });
});

describe("AK-02: komuna text pairs reach AAA (7:1) under contrast=high", () => {
  it("in every one of the 36 high-contrast combinations", () => {
    const high = allAssignments(modelo).filter((assignment) => assignment.contrast === "high");
    expect(high).toHaveLength(36);
    const textPairs = modelo.kontrastParoj.filter((pair) => pair.kategorio.startsWith("text-"));
    expect(textPairs.length).toBeGreaterThan(40);
    let minimum = Number.POSITIVE_INFINITY;
    for (const assignment of high) {
      const outcome = resolve(modelo, assignment);
      if (!outcome.ok) throw new Error(JSON.stringify(outcome.issues));
      for (const pair of textPairs) {
        const colour = (name: string) => {
          const value = outcome.rezolvo.tokens[name]?.value as {
            components: [number, number, number];
            alpha?: number;
          };
          return { color: new Color("srgb", value.components), alpha: value.alpha ?? 1 };
        };
        // An overlay is measured on every surface it may lie on; the worst decides (Spec 004).
        const foreground = colour(pair.foreground).color;
        const raw = colour(pair.background);
        const over = (surface: string): Color =>
          new Color(
            "srgb",
            raw.color
              .to("srgb")
              .coords.map(
                (channel, index) =>
                  (channel ?? 0) * raw.alpha +
                  (colour(surface).color.to("srgb").coords[index] ?? 0) * (1 - raw.alpha),
              ) as [number, number, number],
          );
        const ratio =
          raw.alpha < 1
            ? Math.min(
                ...(pair.backdrop ?? SURFACE_LADDER).map((surface) =>
                  over(surface).contrast(foreground, "WCAG21"),
                ),
              )
            : raw.color.contrast(foreground, "WCAG21");
        minimum = Math.min(minimum, ratio);
        expect(ratio, `${pair.name} @ ${JSON.stringify(assignment)}`).toBeGreaterThanOrEqual(7);
      }
    }
    expect(minimum).toBeGreaterThanOrEqual(7);
  });
});

describe("Spec 040 B-4: an added row breaks a pinned sum, not the derived property", () => {
  it("one more syntax kind keeps every pair in the grid", () => {
    const more = withSyntaxKind(modelo, "operator");
    expect(syntaxGridViolations(more)).toEqual([]);
    const syntax = more.kontrastParoj.filter((pair) => pair.name.startsWith("syntax-"));
    expect(syntax.length).toBe(15);
  });

  it("one more valoro of a Dimensio keeps every high-contrast combination", () => {
    const more = withValoro(modelo, "density", "spacious");
    expect(highCombinationViolations(more)).toEqual([]);
    expect(
      allAssignments(more).filter((assignment) => assignment.contrast === "high"),
    ).toHaveLength(36);
  });
});

describe("Reguloj of Spec 001 (Art. VI)", () => {
  const byName = new Map(modelo.reguloj.map((regulo) => [regulo.name, regulo]));

  it.each([
    "dimensio-sets-alias-only",
    "aspekto-complete",
    "disabled-exempt-from-contrast",
    "typography-roles-composite",
    "motion-reduced-instant",
    "density-affects-layout-only",
    "color-roles-declared",
  ])("declares %s with a kialo", (name) => {
    expect(byName.get(name)?.kialo.trim().length ?? 0, name).toBeGreaterThan(40);
  });

  it("enforces contrast-pairs-declared automatically (D-19)", () => {
    expect(byName.get("contrast-pairs-declared")?.checkability).toBe("automatic");
  });
});

describe("status surfaces may hold their contrast through a border (Spec 002 FR-06, FR-07)", () => {
  it.each(["success", "warning", "danger", "info"])(
    "status-%s-basic-on-background-default names its border as the aux pair, with a kialo",
    (status) => {
      const pair = modelo.kontrastParoj.find(
        (candidate) => candidate.name === `status-${status}-basic-on-background-default`,
      );
      expect(pair?.aux).toEqual({
        foreground: `color.status.${status}.border`,
        background: "color.background.default",
      });
      expect(pair?.kialo).toContain("1.4.11");
    },
  );
});
