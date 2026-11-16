// Spec 056 (MP-2a, T1): the ports of the new nodes and the connection rules for them. Text nodes
// and Beispiele stand one stage before the Marke (`RANGO`), so text → `marko.en.teksto` and image →
// `marko.en.bildo` are the only edges they may draw; Schrift has no stage at all (its edge to the
// previews is fixed and never drawn by hand). The two inputs of the Marke take many edges (plan
// D-18); every other input keeps at most one. `markoLigojDe` gives the edges into the Marke from
// the canvas state: the fixed nodes always, one per value, added nodes when present, detached ones
// absent. Pure, no clock; invented brands only.

import type { Agordo } from "@fundamento/agordilo";
import { describe, expect, it } from "vitest";
import { gestaltenDe } from "./grafeo-gestalten.js";
import {
  anschlussDe,
  BEISPIELE_ELIR,
  type Bildo,
  type BildoLigo,
  estasMarkoEnir,
  FARBO_ROLOJ,
  FIKSAJ_TEKSTOJ,
  type LeinwandStatoKnoto,
  type LigoSitzung,
  ligoId,
  ligojKun,
  MARKO_BILDO_ENIR,
  MARKO_TEKSTO_ENIR,
  SCHRIFT_ELIR,
  TEKSTO_IDS,
  validaLigo,
  vorschauTiparoEnir,
  wertElirDe,
} from "./grafeo-gestalten-sicht.js";
import { markoLigojDe } from "./leinwand-enhavo.js";

const START: Agordo = { name: "provo", leitfarbe: "#3b5bdb" };
const bildo: Bildo = gestaltenDe(START, { start: START, kabloj: {}, palettes: undefined, rev: 1 });

/** The text nodes with one output of their own (Werte has one per value). */
const EINZELNE = TEKSTO_IDS.filter((id) => id !== "teksto-werte");

describe("Spec 056 T1: the new port ids (tech spec table)", () => {
  it("knows every output of a text node, a value, Beispiele and Schrift", () => {
    const befunde: string[] = [];
    for (const id of EINZELNE) {
      const a = anschlussDe(`${id}.el`);
      if (a?.nodo !== id || a.direkto !== "el" || a.art !== "teksto") befunde.push(`${id}.el`);
    }
    for (const wert of ["w1", "w2", "w3", "w4", "w5"]) {
      const a = anschlussDe(wertElirDe(wert));
      if (a?.nodo !== "teksto-werte" || a.direkto !== "el" || a.art !== "teksto")
        befunde.push(wertElirDe(wert));
    }
    expect(befunde).toEqual([]);
    expect(wertElirDe("w2")).toBe("teksto-werte.el.w2");
    expect(anschlussDe(BEISPIELE_ELIR)).toEqual({ nodo: "beispiele", direkto: "el", art: "bildo" });
    expect(anschlussDe(SCHRIFT_ELIR)).toEqual({ nodo: "schrift", direkto: "el", art: "tiparo" });
    expect([BEISPIELE_ELIR, SCHRIFT_ELIR]).toEqual(["beispiele.el", "schrift.el"]);
  });

  it("knows the two inputs of the Marke and a Schrift input at every preview", () => {
    expect([MARKO_TEKSTO_ENIR, MARKO_BILDO_ENIR]).toEqual(["marko.en.teksto", "marko.en.bildo"]);
    expect(anschlussDe(MARKO_TEKSTO_ENIR)).toEqual({ nodo: "marko", direkto: "en", art: "teksto" });
    expect(anschlussDe(MARKO_BILDO_ENIR)).toEqual({ nodo: "marko", direkto: "en", art: "bildo" });
    for (const id of ["vorschau-hell", "vorschau-dunkel", "vorschau-3", "vorschau-12"]) {
      expect(vorschauTiparoEnir(id)).toBe(`${id}.en.tiparo`);
      expect(anschlussDe(vorschauTiparoEnir(id))).toEqual({
        nodo: id,
        direkto: "en",
        art: "tiparo",
      });
    }
    // The ports of Spec 054/055 keep their meaning.
    expect(anschlussDe("marko.el")).toEqual({ nodo: "marko", direkto: "el", art: "marko" });
    expect(anschlussDe("vorschau-hell.en")).toEqual({
      nodo: "vorschau-hell",
      direkto: "en",
      art: "marko",
    });
  });

  it("refuses ids that are no port", () => {
    const keine = [
      "teksto-werte.el",
      "teksto-werte.el.w6",
      "teksto-werte.el.x1",
      "teksto-nenio.el",
      "teksto-ausgangslage.en",
      "beispiele.en",
      "schrift.en",
      "marko.en",
      "marko.en.farbo",
      "marko.en.tiparo",
      "vorschau-hell.en.bildo",
    ].filter((port) => anschlussDe(port) !== undefined);
    expect(keine).toEqual([]);
  });
});

describe("Spec 056 T1: validaLigo for the new nodes (RANGO)", () => {
  it("lets text run into the text input and images into the image input of the Marke", () => {
    const erlaubt = [
      ...EINZELNE.map((id) => [`${id}.el`, MARKO_TEKSTO_ENIR] as const),
      [wertElirDe("w1"), MARKO_TEKSTO_ENIR] as const,
      [BEISPIELE_ELIR, MARKO_BILDO_ENIR] as const,
    ].filter(([de, al]) => !validaLigo(bildo.ligoj, de, al));
    expect(erlaubt).toEqual([]);
  });

  it("refuses text → image input, text → palette row, anything at Schrift and every way back", () => {
    const paare: (readonly [string, string])[] = [
      ["teksto-ausgangslage.el", MARKO_BILDO_ENIR],
      [wertElirDe("w3"), MARKO_BILDO_ENIR],
      [BEISPIELE_ELIR, MARKO_TEKSTO_ENIR],
      ...FARBO_ROLOJ.map((rolo) => ["teksto-markenkern.el", `paletro.en.${rolo}`] as const),
      ...FARBO_ROLOJ.map((rolo) => [BEISPIELE_ELIR, `paletro.en.${rolo}`] as const),
      ["teksto-markenkern.el", "farbo-primaer.en"],
      [SCHRIFT_ELIR, vorschauTiparoEnir("vorschau-hell")],
      [SCHRIFT_ELIR, MARKO_TEKSTO_ENIR],
      ["marko.el", MARKO_TEKSTO_ENIR],
      ["paletro.el", MARKO_TEKSTO_ENIR],
      ["farbo-primaer.el", MARKO_BILDO_ENIR],
      ["marko.el", "teksto-ausgangslage.el"],
      [MARKO_TEKSTO_ENIR, "teksto-ausgangslage.el"],
    ];
    expect(paare.filter(([de, al]) => validaLigo(bildo.ligoj, de, al))).toEqual([]);
  });

  it("names the two Marke inputs as the only ones that take many edges", () => {
    expect([MARKO_TEKSTO_ENIR, MARKO_BILDO_ENIR].map(estasMarkoEnir)).toEqual([true, true]);
    const anderaj = [
      ...FARBO_ROLOJ.map((rolo) => `paletro.en.${rolo}`),
      ...FARBO_ROLOJ.map((rolo) => `farbo-${rolo}.en`),
      "vorschau-hell.en",
      vorschauTiparoEnir("vorschau-hell"),
      "marko.el",
      "marko.en",
    ].filter(estasMarkoEnir);
    expect(anderaj).toEqual([]);
  });
});

describe("Spec 056 T1: many edges at the Marke inputs, one at a palette row (D-18)", () => {
  const sitzung = (gezogen: LigoSitzung["gezogen"]): LigoSitzung => ({
    geloest: [],
    gezogen,
    nodoj: ["teksto-ausgangslage", "teksto-markenkern", "teksto-werte", "beispiele"],
  });

  it("keeps every drawn edge at marko.en.teksto and marko.en.bildo", () => {
    const gezogen = [
      { de: "teksto-ausgangslage.el", al: MARKO_TEKSTO_ENIR },
      { de: "teksto-markenkern.el", al: MARKO_TEKSTO_ENIR },
      { de: wertElirDe("w1"), al: MARKO_TEKSTO_ENIR },
      { de: wertElirDe("w2"), al: MARKO_TEKSTO_ENIR },
      { de: BEISPIELE_ELIR, al: MARKO_BILDO_ENIR },
    ];
    const ligoj = ligojKun(sitzung(gezogen), bildo);
    const ce = (al: string) =>
      ligoj
        .filter((l) => l.al === al)
        .map((l) => l.de)
        .sort();
    expect(ce(MARKO_TEKSTO_ENIR)).toEqual(
      ["teksto-ausgangslage.el", "teksto-markenkern.el", wertElirDe("w1"), wertElirDe("w2")].sort(),
    );
    expect(ce(MARKO_BILDO_ENIR)).toEqual([BEISPIELE_ELIR]);
    // The same edge drawn twice stands once.
    const zweimal = ligojKun(sitzung([...gezogen, ...gezogen.slice(0, 1)]), bildo);
    const ids = zweimal.map((l) => l.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it("still keeps at most one edge at a palette row", () => {
    const gezogen = [
      { de: "farbo-akzent.el", al: "paletro.en.warning" },
      { de: "farbo-danger.el", al: "paletro.en.warning" },
      { de: "teksto-ausgangslage.el", al: MARKO_TEKSTO_ENIR },
    ];
    const ligoj = ligojKun(sitzung(gezogen), bildo);
    const proVico = FARBO_ROLOJ.flatMap((rolo) => {
      const n = ligoj.filter((l) => l.al === `paletro.en.${rolo}`).length;
      return n > 1 ? [`${rolo}: ${n}`] : [];
    });
    expect(proVico).toEqual([]);
    expect(ligoj.find((l) => l.al === "paletro.en.warning")?.de).toBe("farbo-danger.el");
  });
});

describe("Spec 056 T1: markoLigojDe – the edges into the Marke from the canvas state", () => {
  const werte = (ids: readonly string[]): LeinwandStatoKnoto => ({
    id: "teksto-werte",
    inhalt: { werte: ids.map((id) => ({ id, text: `wert ${id}` })) },
  });
  const ligo = (de: string, al: string, art: BildoLigo["art"]): BildoLigo => ({
    id: ligoId(de, al),
    de,
    al,
    art,
  });

  it("gives the fixed nodes of a new brand their edges even without a state", () => {
    expect(markoLigojDe([], [])).toEqual([
      ligo("teksto-ausgangslage.el", MARKO_TEKSTO_ENIR, "teksto"),
      ligo("teksto-markenkern.el", MARKO_TEKSTO_ENIR, "teksto"),
    ]);
    expect(FIKSAJ_TEKSTOJ).toEqual(["teksto-ausgangslage", "teksto-markenkern", "teksto-werte"]);
  });

  it("gives one edge per value, added nodes when present, in the fixed order, never fixed", () => {
    const knoten: LeinwandStatoKnoto[] = [
      { id: "beispiele", speco: "beispiele", inhalt: {} },
      { id: "teksto-tonalitaet", speco: "teksto" },
      werte(["w2", "w1", "w4"]),
      { id: "teksto-zielgruppe", speco: "teksto", x: 1, y: 2 },
      { id: "schrift", speco: "schrift" },
    ];
    const ligoj = markoLigojDe(knoten, []);
    expect(ligoj.map((l) => l.de)).toEqual([
      "teksto-ausgangslage.el",
      "teksto-zielgruppe.el",
      "teksto-markenkern.el",
      wertElirDe("w2"),
      wertElirDe("w1"),
      wertElirDe("w4"),
      "teksto-tonalitaet.el",
      BEISPIELE_ELIR,
    ]);
    expect(ligoj.filter((l) => l.fest !== undefined || l.hex !== undefined)).toEqual([]);
    expect(ligoj.at(-1)).toEqual(ligo(BEISPIELE_ELIR, MARKO_BILDO_ENIR, "bildo"));
    // Schrift never runs into the Marke.
    expect(ligoj.filter((l) => l.de === SCHRIFT_ELIR)).toEqual([]);
  });

  it("leaves detached edges out", () => {
    const knoten = [werte(["w1", "w2", "w3"]), { id: "beispiele", speco: "beispiele" as const }];
    const geloest = [BEISPIELE_ELIR, "teksto-markenkern.el", wertElirDe("w2")];
    expect(markoLigojDe(knoten, geloest).map((l) => l.de)).toEqual([
      "teksto-ausgangslage.el",
      wertElirDe("w1"),
      wertElirDe("w3"),
    ]);
  });
});
