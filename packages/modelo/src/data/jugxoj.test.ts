// Jugxoj of Spec 003 (T002): the breaking Tailwind NomRegulo change (Art. XII, Constitution v1.6)
// and APCA staying advisory (Art. X, D-10, FR-17).

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

interface Jugxo {
  id: string;
  ref: { artikolo?: string };
  decision: string;
  kialo: string;
  date: string;
  context: string;
}

const { jugxoj } = JSON.parse(
  readFileSync(new URL("../../data/jugxoj.json", import.meta.url), "utf8"),
) as { jugxoj: Jugxo[] };

describe("Jugxo on Article XII: Tailwind namespace fm (T002)", () => {
  const entry = jugxoj.find(
    (jugxo) => jugxo.ref.artikolo === "XII" && jugxo.context.includes("NomRegulo"),
  );

  it("exists with the maintainer's kialo", () => {
    expect(entry).toBeDefined();
    expect(entry?.kialo).toContain("prefix() benennt alle Klassen des Projekts um");
  });

  // The export carries no Celo names (AK-12, Art. VIII), so the forms are named as utility
  // classes, not as theme keys or custom properties.
  it("names the old and the new form and the Constitution version", () => {
    expect(entry?.context).toContain("prefix(fm)");
    expect(entry?.context).toContain("fm:bg-action-primary-rest");
    expect(entry?.context).toContain("bg-fm-action-primary-rest");
    expect(entry?.context).toContain("v1.6");
  });
});

describe("Jugxo on Article X: APCA stays advisory (T002, D-10, FR-17)", () => {
  const entry = jugxoj.find((jugxo) => jugxo.ref.artikolo === "X" && jugxo.kialo.includes("APCA"));

  it("exists and names the revisit condition", () => {
    expect(entry).toBeDefined();
    expect(entry?.decision).toBe("deviation-recorded");
    expect(`${entry?.kialo} ${entry?.context}`).toContain("Candidate Recommendation");
    expect(entry?.context).toContain("WCAG 2");
  });
});

describe("Jugxo on Article VI: the literal rule for Ero stylesheets (F2)", () => {
  const entry = jugxoj.find(
    (jugxo) => jugxo.ref.artikolo === "VI" && jugxo.kialo.includes("stylesheet"),
  );

  it("records the refinement of the Phase-0 rule with its kialo", () => {
    expect(entry).toBeDefined();
    expect(entry?.decision).toBe("deviation-recorded");
    expect(entry?.kialo).toContain("structure");
    expect(entry?.context).toContain("css-literal-value");
    expect(entry?.context).toContain("allowlist");
  });
});
