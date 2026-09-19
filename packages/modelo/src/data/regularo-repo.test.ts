// D-19 guard for the repo Modelo: every automatically checkable Regulo is "automatic" and has an
// enforcer; "manual" only for Reguloj that cannot be checked, each with its reason. In the repo,
// "manual" for an automatically checkable rule is an error (maintainer, 2026-09-19).

import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { REGULO_ENFORCERS } from "../validate/regularo-enforcement.js";

/**
 * Automatic Reguloj without `appliesTo` (Spec 002, D-02), with the reason: explain finds a token's
 * Reguloj only through `appliesTo`, so every other automatic Regulo must declare it.
 */
const WITHOUT_APPLIES_TO: Record<string, string> = {
  "dimensio-sets-alias-only": "set-level: it governs sets, not tokens",
  "aspekto-complete": "package-level: it governs Aspekto packages, not tokens",
  "semantic-described":
    "it governs every role token; explain lists it only when the token itself violates it",
};

/** `appliesTo` of the Phase-1 Reguloj (Spec 002 data-model §3). */
const PHASE1_APPLIES_TO: Record<string, unknown> = {
  "contrast-pairs-declared": { roles: ["foreground", "background", "border", "focus"] },
  "semantic-colors-alias-palette": { types: ["color"] },
  "color-roles-declared": { types: ["color"] },
  "density-affects-layout-only": { tokens: ["spacing.*", "size.control.*"] },
  "disabled-exempt-from-contrast": { roles: ["disabled", "decorative"] },
  "typography-roles-composite": { tokens: ["typography.**"] },
  "motion-reduced-instant": { tokens: ["motion.duration.*", "motion.easing.*"] },
  "focus-ring-dual-contrast": { roles: ["focus"] },
};

/** Reguloj that cannot be violated by data, with the reason. */
const NOT_CHECKABLE: Record<string, string> = {
  "disabled-exempt-from-contrast":
    "an exemption: it grants a permission, so no data can violate it",
};

/** Automatic Reguloj enforced by an always-on rule instead of an enforcer (Constitution). */
const ALWAYS_ON: Record<string, string> = {
  "aspekto-complete": "aspekto-incomplete is always on (Art. IV), see validate/package-rules.ts",
};

const { modelo } = loadModelo(defaultModeloSource());
const reguloj = modelo?.reguloj ?? [];

describe("Regularo of the repo (D-19)", () => {
  it.each([
    "semantic-colors-alias-palette",
    "color-roles-declared",
    "contrast-pairs-declared",
    "dimensio-sets-alias-only",
  ])("declares %s automatic", (name) => {
    expect(reguloj.find((regulo) => regulo.name === name)?.checkability).toBe("automatic");
  });

  it("uses manual only for Reguloj that cannot be checked", () => {
    const wrong = reguloj
      .filter(
        (regulo) => regulo.checkability === "manual" && NOT_CHECKABLE[regulo.name] === undefined,
      )
      .map((regulo) => regulo.name);
    expect(wrong).toEqual([]);
  });

  it("has an enforcer (or an always-on rule) for every automatic Regulo", () => {
    const unenforced = reguloj
      .filter((regulo) => regulo.checkability === "automatic")
      .filter(
        (regulo) =>
          REGULO_ENFORCERS[regulo.name] === undefined && ALWAYS_ON[regulo.name] === undefined,
      )
      .map((regulo) => regulo.name);
    expect(unenforced).toEqual([]);
  });

  it("declares focus-ring-dual-contrast with a kialo", () => {
    const regulo = reguloj.find((candidate) => candidate.name === "focus-ring-dual-contrast");
    expect(regulo?.checkability).toBe("automatic");
    expect(regulo?.kialo.length ?? 0).toBeGreaterThan(40);
  });

  it.each(Object.entries(PHASE1_APPLIES_TO))("declares appliesTo for %s", (name, appliesTo) => {
    expect(reguloj.find((regulo) => regulo.name === name)?.appliesTo).toEqual(appliesTo);
  });

  it("declares appliesTo for every automatic Regulo except the listed exemptions", () => {
    const missing = reguloj
      .filter((regulo) => regulo.checkability === "automatic" && regulo.appliesTo === undefined)
      .filter((regulo) => WITHOUT_APPLIES_TO[regulo.name] === undefined)
      .map((regulo) => regulo.name);
    expect(missing).toEqual([]);
  });
});
