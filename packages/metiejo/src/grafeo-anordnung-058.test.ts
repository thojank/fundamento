// Spec 058 (MP-2c, T1, MAW-1.1): the start places of this run (ARANGXO_058 behind `{stufe: 58}`),
// the catalog „+ Knoten“ (KATALOGO_058), the ports of the new nodes and the edges into the Marke and
// into „Namen und Beschreibung“. The start layout of a new brand and of a brand with every addable
// node has no overlapping boxes; Grundlagen is the first input, the Layout-Beispiel stands before
// the previews, the previews are sized for the page „Marke“. Without the option the places are
// those of 056 (pinned in `alt-gleich-058.test.ts`).

import { describe, expect, it } from "vitest";
import {
  ALDONEBLAJ,
  ARANGXO_056,
  ARANGXO_058,
  aldonebloj,
  altecoDe,
  anschlussDe,
  type Bildo,
  type BildoLigo,
  FIKSAJ_TEKSTOJ,
  GRUNDLAGEN_ELIR,
  KATALOGO_056,
  KATALOGO_058,
  KI_NAMEN_BILDO_ENIR,
  KI_NAMEN_ID,
  KI_NAMEN_TEKSTO_ENIR,
  LAYOUT_ELIR,
  largxoDe,
  ligoId,
  ligojKun,
  MARKO_BILDO_ENIR,
  MARKO_TEKSTO_ENIR,
  poziciojKun,
  TEKSTO_IDS,
  validaLigo,
  vorschauBildoEnir,
} from "./grafeo-gestalten-sicht.js";
import {
  geloestDe,
  kiNamenGeloestKomenco,
  kiNamenLigojDe,
  markoLigojDe,
} from "./leinwand-enhavo.js";

const OPC = { stufe: 58 } as const;

/** Every fixed node of a canvas of this run (Bildo + the fixed text nodes, Grundlagen, Layout). */
const FIKSAJ = [
  "marko",
  "farbo-primaer",
  "farbo-neutral",
  "farbo-akzent",
  "farbo-success",
  "farbo-warning",
  "farbo-danger",
  "farbo-info",
  "paletro",
  "vorschau-hell",
  "vorschau-dunkel",
  ...FIKSAJ_TEKSTOJ,
  "teksto-grundlagen",
  "layout-beispiel",
];
const CXIUJ = [...FIKSAJ, ...ALDONEBLAJ, KI_NAMEN_ID, "vorschau-3", "vorschau-4", "vorschau-5"];

type Skatolo = { id: string; x: number; y: number; l: number; a: number };
const skatolojDe = (ids: readonly string[]): Skatolo[] => {
  const pozicioj = poziciojKun(
    new Map(),
    ids.map((id) => ({ id })),
    OPC,
  );
  return ids.map((id) => {
    const p = pozicioj.get(id) ?? { x: 0, y: 0 };
    return { id, x: p.x, y: p.y, l: largxoDe(id, OPC), a: altecoDe(id, OPC) };
  });
};
const kovras = (a: Skatolo, b: Skatolo): boolean =>
  a.x < b.x + b.l && b.x < a.x + a.l && a.y < b.y + b.a && b.y < a.y + a.a;
const kovrojDe = (s: readonly Skatolo[]): string[] =>
  s.flatMap((a, i) =>
    s
      .slice(i + 1)
      .filter((b) => kovras(a, b))
      .map((b) => `${a.id} × ${b.id}`),
  );

describe("MAW-1.1: ARANGXO_058 (plan §3.2)", () => {
  it("knows a place, a width and a height for every node of this run", () => {
    const s = skatolojDe(CXIUJ);
    expect(s.filter((k) => k.l <= 0 || k.a <= 0).map((k) => k.id)).toEqual([]);
    expect(s.find((k) => k.id === "vorschau-3")).toMatchObject({
      x: ARANGXO_058.weitereVorschauen.x,
      y: ARANGXO_058.weitereVorschauen.y,
    });
    expect(s.find((k) => k.id === "vorschau-5")?.y).toBe(
      ARANGXO_058.weitereVorschauen.y + 2 * ARANGXO_058.weitereVorschauen.dy,
    );
  });

  it("has no overlapping boxes for a new brand and with every addable node", () => {
    expect(kovrojDe(skatolojDe(FIKSAJ))).toEqual([]);
    expect(kovrojDe(skatolojDe(CXIUJ))).toEqual([]);
  });

  it("puts Grundlagen first: leftmost and on top of the input column", () => {
    const s = skatolojDe(CXIUJ);
    const g = s.find((k) => k.id === "teksto-grundlagen") as Skatolo;
    const tekstoj = s.filter((k) => (TEKSTO_IDS as readonly string[]).includes(k.id));
    expect(s.every((k) => k.id === g.id || k.x > g.x)).toBe(true);
    expect(tekstoj.every((k) => k.y > g.y + g.a)).toBe(true);
    // Its right edge is the column's, so its curve into the Marke runs in the same gap.
    expect(tekstoj.every((k) => k.x + k.l === g.x + g.l)).toBe(true);
  });

  it("puts the Layout-Beispiel between the Palette and the previews", () => {
    const s = skatolojDe(CXIUJ);
    const [layout, paletro, schrift] = ["layout-beispiel", "paletro", "schrift"].map(
      (id) => s.find((k) => k.id === id) as Skatolo,
    ) as [Skatolo, Skatolo, Skatolo];
    const vorschauen = s.filter((k) => k.id.startsWith("vorschau-"));
    expect(layout.x).toBe(paletro.x);
    expect(layout.y).toBeGreaterThan(Math.max(paletro.y + paletro.a, schrift.y + schrift.a));
    expect(vorschauen.every((v) => v.x > layout.x + layout.l)).toBe(true);
  });

  it("sizes the previews for the page „Marke“ (wider and higher than in 056), the frame inside", () => {
    expect(largxoDe("vorschau-hell", OPC)).toBeGreaterThan(largxoDe("vorschau-hell"));
    expect(altecoDe("vorschau-dunkel", OPC)).toBeGreaterThan(altecoDe("vorschau-dunkel"));
    expect(largxoDe("vorschau-7", OPC)).toBe(largxoDe("vorschau-hell", OPC));
    expect(ARANGXO_058.vorschauKadro.alto).toBeLessThan(ARANGXO_058.alteco.vorschau);
  });

  it("keeps the curves out of foreign boxes: Text into Marke and „Namen“ from the left gap, the image edge right of „Namen“", () => {
    const s = skatolojDe(CXIUJ);
    const by = (id: string) => s.find((k) => k.id === id) as Skatolo;
    const [marko, ki, beispiele, g] = [
      by("marko"),
      by(KI_NAMEN_ID),
      by("beispiele"),
      by("teksto-grundlagen"),
    ];
    // Both Text inputs sit on the same left edge; the text column ends before it.
    expect(ki.x).toBe(marko.x);
    expect(g.x + g.l).toBeLessThan(marko.x);
    // The image edge from the bottom of Beispiele into the top middle of the Marke runs right of „Namen“.
    expect(beispiele.x).toBeGreaterThan(ki.x + ki.l);
    expect(marko.x + marko.l / 2).toBeGreaterThan(ki.x + ki.l);
    expect(beispiele.y + beispiele.a).toBeLessThanOrEqual(ki.y);
    expect(ki.y + ki.a).toBeLessThan(marko.y);
    // Every node right of the Marke starts right of it.
    for (const k of s.filter((k) => k.id.startsWith("farbo-") || k.id === "paletro"))
      expect(k.x).toBeGreaterThan(marko.x + marko.l);
  });

  it("leaves ARANGXO_056 and the places without the option as they are", () => {
    expect(ARANGXO_056.nodoj.marko).toEqual({ x: 24, y: 48, largxo: 190 });
    expect(largxoDe("teksto-grundlagen")).toBe(0);
    expect(altecoDe("ki-namen")).toBe(0);
    const ohne = poziciojKun(new Map(), [{ id: "farbo-primaer" }, { id: "vorschau-3" }]);
    expect([ohne.get("farbo-primaer"), ohne.get("vorschau-3")]).toEqual([
      { x: 300, y: 24 },
      { x: 1136, y: 1024 },
    ]);
  });
});

describe("MAW-1.1: KATALOGO_058 and „+ Knoten“", () => {
  it("lists Grundlagen, „Namen und Beschreibung“ and the Layout-Beispiel, else as 056", () => {
    const neu = KATALOGO_058.filter((e) => !KATALOGO_056.includes(e));
    expect(neu).toEqual([
      {
        grupo: "Eingabe",
        nomo: "Marke · Grundlagen",
        zeichen: "teksto",
        lauf: "MP-2",
        nodo: "teksto-grundlagen",
      },
      {
        grupo: "Vorschlag",
        nomo: "Namen und Beschreibung",
        zeichen: "ki",
        lauf: "MP-2",
        nodo: KI_NAMEN_ID,
      },
      {
        grupo: "Vorschau",
        nomo: "Layout-Beispiel",
        zeichen: "bildo",
        lauf: "MP-2",
        nodo: "layout-beispiel",
      },
    ]);
    expect(KATALOGO_058.filter((e) => KATALOGO_056.includes(e))).toEqual(KATALOGO_056);
    expect(KATALOGO_058.map((e) => e.nomo).slice(0, 2)).toEqual(["Marke", "Marke · Grundlagen"]);
    const vorschau = KATALOGO_058.filter((e) => e.grupo === "Vorschau").map((e) => e.nomo);
    expect(vorschau.indexOf("Layout-Beispiel")).toBe(vorschau.indexOf("Komponenten") - 1);
  });

  it("adds „Namen und Beschreibung“ at most once; Grundlagen and Layout-Beispiel are on the canvas", () => {
    const stato = (nodoj: { id: string }[]) =>
      Object.fromEntries(
        aldonebloj(KATALOGO_058, nodoj)
          .filter(
            (e) =>
              e.nodo === "teksto-grundlagen" ||
              e.nodo === KI_NAMEN_ID ||
              e.nodo === "layout-beispiel",
          )
          .map((e) => [e.nodo, e.stato]),
      );
    expect(stato([])).toEqual({
      "teksto-grundlagen": "da",
      [KI_NAMEN_ID]: "anlegen",
      "layout-beispiel": "da",
    });
    expect(stato([{ id: KI_NAMEN_ID }])[KI_NAMEN_ID]).toBe("da");
  });
});

describe("MAW-1.1: ports and edges of the new nodes", () => {
  it("knows the new ports", () => {
    expect([
      anschlussDe(GRUNDLAGEN_ELIR),
      anschlussDe(KI_NAMEN_TEKSTO_ENIR),
      anschlussDe(KI_NAMEN_BILDO_ENIR),
      anschlussDe(LAYOUT_ELIR),
      anschlussDe(vorschauBildoEnir("vorschau-3")),
    ]).toEqual([
      { nodo: "teksto-grundlagen", direkto: "el", art: "teksto" },
      { nodo: KI_NAMEN_ID, direkto: "en", art: "teksto" },
      { nodo: KI_NAMEN_ID, direkto: "en", art: "bildo" },
      { nodo: "layout-beispiel", direkto: "el", art: "bildo" },
      { nodo: "vorschau-3", direkto: "en", art: "bildo" },
    ]);
  });

  it("lets a person draw Grundlagen and the inputs into Marke and „Namen“, never into a preview's image input", () => {
    expect(validaLigo([], GRUNDLAGEN_ELIR, MARKO_TEKSTO_ENIR)).toBe(true);
    expect(validaLigo([], GRUNDLAGEN_ELIR, KI_NAMEN_TEKSTO_ENIR)).toBe(true);
    expect(validaLigo([], "teksto-werte.el.w1", KI_NAMEN_TEKSTO_ENIR)).toBe(true);
    expect(validaLigo([], "beispiele.el", KI_NAMEN_BILDO_ENIR)).toBe(true);
    expect(validaLigo([], "beispiele.el", KI_NAMEN_TEKSTO_ENIR)).toBe(false);
    expect(validaLigo([], "beispiele.el", vorschauBildoEnir("vorschau-hell"))).toBe(false);
    expect(validaLigo([], LAYOUT_ELIR, vorschauBildoEnir("vorschau-hell"))).toBe(false);
    expect(validaLigo([], LAYOUT_ELIR, MARKO_BILDO_ENIR)).toBe(false);
  });

  it("keeps many edges at the inputs of „Namen und Beschreibung“", () => {
    const bildo = { nodoj: [], ligoj: [] } as unknown as Bildo;
    const ligoj = ligojKun(
      {
        geloest: [],
        gezogen: [
          { de: GRUNDLAGEN_ELIR, al: KI_NAMEN_TEKSTO_ENIR },
          { de: "teksto-ausgangslage.el", al: KI_NAMEN_TEKSTO_ENIR },
        ],
        nodoj: ["teksto-grundlagen", "teksto-ausgangslage", KI_NAMEN_ID],
      },
      bildo,
    );
    expect(ligoj.map((l) => l.id)).toEqual([
      ligoId(GRUNDLAGEN_ELIR, KI_NAMEN_TEKSTO_ENIR),
      ligoId("teksto-ausgangslage.el", KI_NAMEN_TEKSTO_ENIR),
    ]);
  });

  it("starts the edges into the Marke with Grundlagen behind the option; it detaches like the others", () => {
    const knoten = [
      { id: "teksto-werte", inhalt: { werte: [{ id: "w1", text: "klar" }] } },
      { id: "beispiele", speco: "beispiele" as const },
    ];
    const de = (l: readonly BildoLigo[]) => l.map((x) => x.de);
    expect(de(markoLigojDe(knoten, [], { stufe: 58 }))).toEqual([
      GRUNDLAGEN_ELIR,
      "teksto-ausgangslage.el",
      "teksto-markenkern.el",
      "teksto-werte.el.w1",
      "beispiele.el",
    ]);
    expect(de(markoLigojDe(knoten, [GRUNDLAGEN_ELIR], { stufe: 58 }))[0]).toBe(
      "teksto-ausgangslage.el",
    );
    expect(de(markoLigojDe(knoten, []))[0]).toBe("teksto-ausgangslage.el");
    expect(geloestDe([GRUNDLAGEN_ELIR, "ki-namen.el"], knoten)).toEqual([GRUNDLAGEN_ELIR]);
  });

  it("gives the edges into „Namen und Beschreibung“ from its own detached list", () => {
    const knoten = [
      { id: "beispiele", speco: "beispiele" as const },
      {
        id: KI_NAMEN_ID,
        speco: "ki" as const,
        geloest: kiNamenGeloestKomenco(["teksto-ausgangslage.el", "teksto-ausgangslage.el"]),
      },
    ];
    expect(kiNamenLigojDe(knoten).map((l) => [l.de, l.al])).toEqual([
      [GRUNDLAGEN_ELIR, KI_NAMEN_TEKSTO_ENIR],
      ["teksto-markenkern.el", KI_NAMEN_TEKSTO_ENIR],
      ["beispiele.el", KI_NAMEN_BILDO_ENIR],
    ]);
    expect(kiNamenLigojDe(knoten.slice(0, 1))).toEqual([]);
  });
});
