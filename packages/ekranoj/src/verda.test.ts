import { describe, expect, it } from "vitest";
import { decidiVerdon, type Malobservo, type VerdaEnigo } from "./index.js";
import { bildigo, faktoKunLigiloj, taksado } from "./test-doubles/faktoj.js";

const malobservo = (severity: Malobservo["severity"]): Malobservo => ({
  rule: "ero-usage",
  severity,
  path: "/instances/0",
  message: "Standard A-12 nutzt die Hauptaktion zweimal.",
  suggestion: "Eine Hauptaktion je Bereich.",
  regulo: { id: "r-1", name: "Eine Hauptaktion", kialo: "Team Nord findet sie sofort." },
});

const green = (varianto: VerdaEnigo["varianto"]): VerdaEnigo => ({
  varianto,
  taksado: taksado(),
  malobservoj: [],
  fakto: faktoKunLigiloj(["detail.html"]),
  kompleta: true,
});

describe("decidiVerdon (C-5, D-04)", () => {
  it("is green when every condition holds, in both variants", () => {
    for (const varianto of ["F", "0"] as const) {
      expect(decidiVerdon(green(varianto)), varianto).toEqual({
        verda: true,
        malhelpoj: [],
        sugestoj: [],
      });
    }
  });

  it("flips on each condition of D-04 alone (Variante F)", () => {
    const base = green("F");
    const fakto = faktoKunLigiloj([]);
    const cases: [VerdaEnigo, string][] = [
      [{ ...base, taksado: taksado({ K1: 0 }) }, "K1"],
      [{ ...base, malobservoj: [malobservo("error")] }, "check_usage"],
      [
        {
          ...base,
          fakto: {
            ...fakto,
            renders: [bildigo("light", [{ id: "color-contrast", nodes: 2 }]), bildigo("dark")],
          },
        },
        "axe-hela",
      ],
      [
        {
          ...base,
          fakto: {
            ...fakto,
            renders: [bildigo("light"), bildigo("dark", [{ id: "link-name", nodes: 1 }])],
          },
        },
        "axe-malhela",
      ],
      [{ ...base, fakto: { ...fakto, renders: [bildigo("light")] } }, "axe-nekontrolita"],
      [{ varianto: "F", taksado: taksado(), malobservoj: [], kompleta: true }, "axe-nekontrolita"],
      [{ ...base, taksado: taksado({ K5: 0.8 }) }, "K5"],
      [{ ...base, taksado: taksado({ K5: null }) }, "K5"],
      [{ ...base, kompleta: false }, "navigado"],
    ];
    expect(
      cases.map(([enigo]) => {
        const { verda, malhelpoj } = decidiVerdon(enigo);
        return { verda, malhelpoj };
      }),
    ).toEqual(cases.map(([, malhelpo]) => ({ verda: false, malhelpoj: [malhelpo] })));
  });

  it("never stops on hints, but keeps them for the report", () => {
    const hints = [malobservo("warning"), malobservo("info")];
    expect(decidiVerdon({ ...green("F"), malobservoj: hints })).toEqual({
      verda: true,
      malhelpoj: [],
      sugestoj: hints,
    });
  });

  it("ignores check_usage in Variante 0, but not K1, axe, K5 or the navigation", () => {
    const base = green("0");
    expect(decidiVerdon({ ...base, malobservoj: [malobservo("error")] })).toEqual({
      verda: true,
      malhelpoj: [],
      sugestoj: [],
    });
    expect(
      decidiVerdon({ ...base, taksado: taksado({ K1: 0, K5: 0.6 }), kompleta: false }).malhelpoj,
    ).toEqual(["K1", "K5", "navigado"]);
  });
});
