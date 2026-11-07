import { describe, expect, it } from "vitest";
import {
  decidiVerdon,
  K8_MERKMALOJ,
  type K8Merkmal,
  type Malobservo,
  type TaksadoK8Rezulto,
  type VerdaEnigo,
} from "./index.js";
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

// Spec 038 Lauf 3 (3.4, D-08, D-16, D-145): with K8 a screen is green only if `k8.plena`; ekranoj
// reads `plena` as the scorer hands it in and never computes it.
describe("decidiVerdon with K8 (Spec 038, 3.4)", () => {
  /** K8 of one combination with `merkmal` at `valoro` (all others 1), `plena` as given. */
  const k8 = (e: {
    plena: boolean;
    merkmal?: K8Merkmal;
    valoro?: number;
    mankoj?: K8Merkmal[];
  }): TaksadoK8Rezulto => {
    const merkmaloj = Object.fromEntries(
      K8_MERKMALOJ.map((m) => [m, m === e.merkmal ? (e.valoro ?? 0.5) : 1]),
    ) as Record<K8Merkmal, number>;
    return {
      kvoto: 0.875,
      kombinacioj: [
        {
          aspekto: "komuna",
          scheme: "light",
          merkmaloj,
          kvoto: 0.875,
          kialoj: K8_MERKMALOJ.map((m) => ({ merkmal: m, teksto: "vollständig" })),
        },
      ],
      mankoj: e.mankoj ?? [],
      plena: e.plena,
    };
  };

  it("keeps the decision of before when k8 is plena", () => {
    for (const varianto of ["F", "0"] as const) {
      const sen = green(varianto);
      const kun = { ...sen, taksado: { ...sen.taksado, k8: k8({ plena: true }) } };
      expect(decidiVerdon(kun), varianto).toEqual(decidiVerdon(sen));
      const malverda = { ...kun, kompleta: false };
      expect(decidiVerdon(malverda).malhelpoj, varianto).toEqual(["navigado"]);
    }
  });

  it("is not green on any feature below 1 with plena false, and names K8 as the last condition", () => {
    expect(K8_MERKMALOJ).toEqual(["ersatzschrift", "nativaj", "interspacoj", "sxablono"]);
    for (const merkmal of K8_MERKMALOJ) {
      const base = green("F");
      const enigo = { ...base, taksado: { ...base.taksado, k8: k8({ plena: false, merkmal }) } };
      expect(decidiVerdon(enigo), merkmal).toEqual({
        verda: false,
        malhelpoj: ["K8"],
        sugestoj: [],
      });
      const pluraj = { ...enigo, taksado: { ...enigo.taksado, k: { ...enigo.taksado.k, K1: 0 } } };
      expect(decidiVerdon({ ...pluraj, kompleta: false }).malhelpoj, merkmal).toEqual([
        "K1",
        "navigado",
        "K8",
      ]);
    }
  });

  it("stays green with a feature below 1 that the Modelo has no means for (mankoj, plena true)", () => {
    const base = green("F");
    const enigo = {
      ...base,
      taksado: {
        ...base.taksado,
        k8: k8({ plena: true, merkmal: "interspacoj", valoro: 0.6667, mankoj: ["interspacoj"] }),
      },
    };
    expect(decidiVerdon(enigo)).toEqual({ verda: true, malhelpoj: [], sugestoj: [] });
  });

  it("reads plena as given and never recomputes it (D-145)", () => {
    const base = green("F");
    // All features 1, but the scorer says not plena: the scorer's word counts.
    const enigo = { ...base, taksado: { ...base.taksado, k8: k8({ plena: false }) } };
    expect(decidiVerdon(enigo).malhelpoj).toEqual(["K8"]);
  });
});
