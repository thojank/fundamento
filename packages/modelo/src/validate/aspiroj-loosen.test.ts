// Spec 024 (§ 3 B, S-2): a brand's own rule is an Aspiro, and an Aspiro may only tighten the
// bound of a Regulo that measures the same thing — never loosen it. A loosened bound is an error
// (`aspiro-loosens-regulo`), the Regulo keeps its own bound regardless.

import { rmSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import { RULE_IDS } from "../contracts/issues.js";
import { projectModeloSource } from "../load/source.js";
import { mutatedFixture } from "./test-doubles/fixtures.js";
import { validateModelo } from "./validate-modelo.js";

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

type Json = Record<string, unknown>;
const ASPEKTO_FILE = "aspekto-ekzemplo/aspekto.json";

function loosened(aspiroj: unknown[]) {
  const root = mutatedFixture("aspekto-ekzemplo", (edit) =>
    edit(ASPEKTO_FILE, (file: Json) => {
      file.aspiroj = aspiroj;
    }),
  );
  roots.push(root);
  return validateModelo(projectModeloSource(`${root}/fundamento.config.json`)).errors.filter(
    (issue) => issue.rule === "aspiro-loosens-regulo",
  );
}

describe("an Aspiro only tightens a Regulo (Spec 024, § 3 B)", () => {
  it("is a registered rule", () => {
    expect(RULE_IDS).toContain("aspiro-loosens-regulo");
  });

  it("refuses a reserve below the Regulo contrast-reserve (min 0.05), naming both bounds", () => {
    const issues = loosened([
      { metriko: "wcag2-reserve", min: 0.02, kialo: "Looser than the Regulo (test)." },
    ]);
    expect(issues).toHaveLength(1);
    expect(issues[0]?.path).toContain("aspekto.json#/aspiroj/0");
    expect(issues[0]?.message).toContain("contrast-reserve");
    expect(issues[0]?.message).toContain("0.05");
    expect(issues[0]?.suggestion).toBeTruthy();
  });

  it("accepts a reserve above the Regulo's, and a goal of a metric no Regulo bounds", () => {
    expect(
      loosened([{ metriko: "wcag2-reserve", min: 0.1, kialo: "Tighter than the Regulo (test)." }]),
    ).toEqual([]);
    expect(
      loosened([{ metriko: "oklch-l-extreme", max: 0.98, kialo: "No Regulo bounds this (test)." }]),
    ).toEqual([]);
  });

  it("refuses a palette unevenness above the Regulo palette-even (max 0.5), accepts one below", () => {
    expect(
      loosened([{ metriko: "oklch-l-step-consistency", max: 0.6, kialo: "Looser (test)." }]).map(
        (issue) => issue.message,
      ),
    ).toEqual([expect.stringContaining("palette-even")]);
    expect(
      loosened([{ metriko: "oklch-l-step-consistency", max: 0.4, kialo: "Tighter (test)." }]),
    ).toEqual([]);
  });

  it("an Aspiro that states only the other bound loosens nothing", () => {
    expect(
      loosened([{ metriko: "wcag2-reserve", max: 0.9, kialo: "An upper bound only (test)." }]),
    ).toEqual([]);
  });
});
