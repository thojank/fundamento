// Spec 047 (NE-1, T1): a new token in the Modelo appears on the canvas without a code change. Two
// invented tokens are added in memory to the core set of komuna – one under a prefix the group
// table knows, one under a prefix it does not know – and each adds exactly one node; the unknown
// one lands in "weitere", nothing is lost. No fixture on disk.

import { beforeAll, describe, expect, it } from "vitest";
import { type Grafeo, grafeoDePaket } from "./grafeo.js";
import { kunAldonitajTokenoj, paketo } from "./test-doubles/grafeo-047.js";

const GRIZA = {
  colorSpace: "srgb",
  components: [0.5, 0.5, 0.5],
  hex: "#808080",
};

let antaue: Grafeo;
let kunKonata: Grafeo;
let kunNekonata: Grafeo;

beforeAll(() => {
  const komuna = paketo("komuna");
  antaue = grafeoDePaket("komuna", komuna);
  kunKonata = grafeoDePaket(
    "komuna",
    kunAldonitajTokenoj(komuna, { "color.zzzprobo": { $type: "color", $value: GRIZA } }),
  );
  kunNekonata = grafeoDePaket(
    "komuna",
    kunAldonitajTokenoj(komuna, { "zzzneu.probo": { $type: "number", $value: 1 } }),
  );
});

describe("Spec 047 T1: a new token appears without a code change", () => {
  it("adds exactly one node for a token under a known prefix, in that prefix's group", () => {
    const nove = kunKonata.nodoj.filter(
      (nodo) => !antaue.nodoj.some((malnova) => malnova.id === nodo.id),
    );
    expect(kunKonata.nodoj.length).toBe(antaue.nodoj.length + 1);
    // Spec 048 (D-6): the 60-rule splits farbe/rollen, so the token lands in it or below it.
    expect(nove.map(({ id }) => id)).toEqual(["color.zzzprobo"]);
    expect(nove[0]?.grupo).toMatch(/^farbe\/rollen(\/|$)/);
  });

  it("adds exactly one node for a token under an unknown prefix, in weitere", () => {
    const nove = kunNekonata.nodoj.filter(
      (nodo) => !antaue.nodoj.some((malnova) => malnova.id === nodo.id),
    );
    expect(kunNekonata.nodoj.length).toBe(antaue.nodoj.length + 1);
    expect(nove.map(({ id, grupo }) => ({ id, grupo }))).toEqual([
      { id: "zzzneu.probo", grupo: "weitere" },
    ]);
    expect(kunNekonata.grupoj.find((grupo) => grupo.id === "weitere")?.nodoj).toContain(
      "zzzneu.probo",
    );
  });
});
