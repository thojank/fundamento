// KontrastParoj and Reguloj of the Phase-1 Vortaro (Spec 001, FR-08, D-12, K5, Art. VI, AK-02;
// task T017).

import Color from "colorjs.io";
import { describe, expect, it } from "vitest";
import type { Modelo } from "../contracts/modelo.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { allAssignments } from "../resolve/assignment.js";
import { resolve } from "../resolve/resolve.js";

const { modelo: loaded } = loadModelo(defaultModeloSource());
if (loaded === undefined) throw new Error("repo did not load");
const modelo: Modelo = loaded;

const has = (foreground: string, background: string) =>
  modelo.kontrastParoj.some(
    (pair) => pair.foreground === foreground && pair.background === background,
  );

describe("KontrastParoj of the repo (D-12, data-model §4)", () => {
  it("declares about sixty pairs", () => {
    expect(modelo.kontrastParoj.length).toBeGreaterThanOrEqual(55);
    expect(modelo.kontrastParoj.length).toBeLessThanOrEqual(70);
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
          };
          return new Color("srgb", value.components);
        };
        const ratio = colour(pair.background).contrast(colour(pair.foreground), "WCAG21");
        minimum = Math.min(minimum, ratio);
        expect(ratio, `${pair.name} @ ${JSON.stringify(assignment)}`).toBeGreaterThanOrEqual(7);
      }
    }
    expect(minimum).toBeGreaterThanOrEqual(7);
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
