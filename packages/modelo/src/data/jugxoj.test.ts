// Jugxoj of Spec 003 (T002): the breaking Tailwind NomRegulo change (Art. XII, Constitution v1.6)
// and APCA staying advisory (Art. X, D-10, FR-17).

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CELOJ } from "../nomreguloj/types.js";

interface Jugxo {
  id: string;
  ref: { artikolo?: string; celo?: string };
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

// Spec 003 F8: a Jugxo that belongs to a Celo names it in the typed field `ref.celo`; its prose
// may then name the tool (AK-12 in the reading of 2026-09-20). These assertions were written after
// the data and were green on the first run — confirming, not red-first.
describe("Jugxoj that belong to a Celo (F8, AK-12)", () => {
  const ofCelo = jugxoj.filter((jugxo) => jugxo.ref.celo !== undefined);

  it("names the Celo in the reference, not only in the prose", () => {
    expect(ofCelo.length).toBeGreaterThan(1);
    expect([...new Set(ofCelo.map((jugxo) => jugxo.ref.celo))].sort()).toEqual([
      "figma",
      "tailwind",
    ]);
    for (const jugxo of ofCelo) expect(CELOJ, jugxo.id).toContain(jugxo.ref.celo);
    for (const jugxo of ofCelo) {
      expect(`${jugxo.kialo} ${jugxo.context}`.toLowerCase(), jugxo.id).toContain(
        String(jugxo.ref.celo),
      );
    }
  });

  it("records the limit of the design tool with its trigger", () => {
    const entry = jugxoj.find((jugxo) => jugxo.id === "jug_01M307X4DQQWRFTDXB1S5CGPN9");
    expect(entry?.ref).toEqual({ artikolo: "VIII", celo: "figma" });
    expect(entry?.kialo).toContain("Auslösebedingung");
    expect(entry?.context).toContain("parity-alpha-varies-by-mode");
  });
});

// A double that swallows is worse than none: the finding of 2026-09-20 and the rule the maintainer
// drew from it, for every double in this repository.
describe("Jugxo on Article X: a test double must fail loudly (F8)", () => {
  const entry = jugxoj.find((jugxo) => jugxo.id === "jug_01M3094ZC6F3XZ1H0MWQZ62MYV");

  it("states the rule and carries today's case as evidence", () => {
    expect(entry?.ref).toEqual({ artikolo: "X", celo: "figma" });
    expect(entry?.kialo).toContain("muss laut scheitern");
    expect(entry?.kialo).toContain("node.fills");
    expect(entry?.kialo).toContain("aufgezeichnet ist nicht");
    expect(entry?.context).toContain("Gilt für jedes Double");
  });
});
