import { describe, expect, it } from "vitest";
import { MAKS_EKRANOJ, MAKS_RONDOJ, type Plano, validiPlanon } from "./index.js";
import { planoKun } from "./test-doubles/faktoj.js";

const where = (plano: Plano) => validiPlanon(plano).map(({ path, rule }) => ({ path, rule }));

describe("validiPlanon (C-1, V-2)", () => {
  it("fixes the limits of the source spec: 5 screens, 3 rounds", () => {
    expect([MAKS_EKRANOJ, MAKS_RONDOJ]).toEqual([5, 3]);
  });

  it("accepts a valid plan with 5 screens", () => {
    expect(validiPlanon(planoKun(MAKS_EKRANOJ))).toEqual([]);
  });

  it("refuses a sixth screen with rule and path", () => {
    const problems = validiPlanon(planoKun(MAKS_EKRANOJ + 1));
    expect(problems.map(({ path, rule }) => ({ path, rule }))).toEqual([
      { path: "/ekranoj", rule: "plan-too-many-screens" },
    ]);
    expect(problems[0]?.message).toContain("5");
    expect(problems[0]?.suggestion).not.toBe("");
  });

  it("refuses a duplicate slug at the second occurrence", () => {
    const plano = planoKun(3);
    plano.ekranoj.push({ slug: "detail", titolo: "Noch ein Detail", celo: "Doppelt" });
    expect(where(plano)).toEqual([{ path: "/ekranoj/3/slug", rule: "slug-duplicate" }]);
  });

  it("refuses an edge to an unknown screen, on each end", () => {
    const plano = planoKun(3);
    plano.kantoj.push({ de: "liste", al: "archiv" }, { de: "nirgends", al: "liste" });
    expect(where(plano)).toEqual([
      { path: "/kantoj/2/al", rule: "edge-unknown-screen" },
      { path: "/kantoj/3/de", rule: "edge-unknown-screen" },
    ]);
  });

  it("refuses slugs that are no file names of the form a-b-1", () => {
    const plano = planoKun(4);
    const slugs = ["Liste", "detail_2", "-bearbeiten", "einstellungen-"];
    plano.ekranoj.forEach((ekrano, index) => {
      ekrano.slug = slugs[index] ?? "";
    });
    plano.kantoj = [];
    expect(where(plano)).toEqual(
      slugs.map((_, index) => ({ path: `/ekranoj/${index}/slug`, rule: "slug-invalid" })),
    );
  });

  it("refuses an empty plan, empty texts and a duplicate edge", () => {
    expect(where({ celo: "Standards verwalten", ekranoj: [], kantoj: [] })).toEqual([
      { path: "/ekranoj", rule: "plan-empty" },
    ]);
    const plano = planoKun(2);
    plano.celo = " ";
    const [first] = plano.ekranoj;
    if (first !== undefined) first.titolo = "";
    plano.kantoj.push({ de: "liste", al: "detail" });
    expect(where(plano)).toEqual([
      { path: "/celo", rule: "text-empty" },
      { path: "/ekranoj/0/titolo", rule: "text-empty" },
      { path: "/kantoj/1", rule: "edge-duplicate" },
    ]);
  });
});
