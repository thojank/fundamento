// Human-mode issue lines of `fm modelo validate` (Spec 002 FR-08, D-03): the kialo of a Regulo
// issue is printed, so a reader sees the reason without looking it up.

import { describe, expect, it } from "vitest";
import { formatIssue } from "./modelo-validate.js";

const issue = {
  rule: "state-distinct",
  severity: "error",
  path: "rezolvo(aspekto=komuna)/color.action.tertiary.hover",
  message: "hover differs from rest by 0.025 in OKLCH lightness.",
  suggestion: "Move hover away from the lightness of color.action.tertiary.text.",
} as const;

describe("formatIssue", () => {
  it("prints the Regulo and its kialo when the issue cites one", () => {
    const text = formatIssue({
      ...issue,
      regulo: { id: "reg_01X", name: "state-distinct", kialo: "A state must give feedback." },
    });
    expect(text).toContain("    regulo:      state-distinct (reg_01X)");
    expect(text).toContain("    kialo:       A state must give feedback.");
  });

  it("prints no Regulo lines for other issues", () => {
    expect(formatIssue(issue)).not.toContain("kialo:");
  });
});
