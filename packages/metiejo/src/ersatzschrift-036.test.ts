// Spec 036 Teil 5 ②b-5 (Spec 029 ①-7): the Metiejo writes what its catalogue knows of a webfont –
// the category and the weights the package carries – into the Fonto of the Agordo; the Agordilo
// takes the fallback and the nearest weight from there and reads no catalogue (Blocker 11).

import { readAgordo } from "@fundamento/agordilo";
import { describe, expect, it } from "vitest";
import { fontoOf, readTiparoj, searchTiparoj } from "./tiparoj.js";

const tiparoj = readTiparoj();

describe("a webfont's Fonto carries category and weights (①-7)", () => {
  it("a serif with one weight says so, and the Agordo takes it", () => {
    const prata = searchTiparoj(tiparoj, "prata", 1)[0];
    if (prata === undefined) throw new Error("Prata must be in the catalogue");
    const fonto = fontoOf(prata);
    expect(fonto).toMatchObject({ family: "Prata", category: "serif", weights: [400] });
    const { issues } = readAgordo({ name: "x", leitfarbe: "#336699", schriften: { display: fonto } });
    expect(issues).toEqual([]);
  });

  it("every catalogue entry becomes a Fonto the Agordo accepts", () => {
    const refused = tiparoj.tiparoj.filter(
      (tiparo) =>
        readAgordo({ name: "x", leitfarbe: "#336699", schriften: { body: fontoOf(tiparo) } }).issues
          .length > 0,
    );
    expect(refused.map((tiparo) => tiparo.id)).toEqual([]);
    const withoutWeights = tiparoj.tiparoj.filter(
      (tiparo) => (fontoOf(tiparo).weights ?? []).length === 0,
    );
    expect(withoutWeights.map((tiparo) => tiparo.id)).toEqual([]);
  });
});
