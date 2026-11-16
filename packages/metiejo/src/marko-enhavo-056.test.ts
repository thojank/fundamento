// Spec 056 (MP-2a, T1, Teil M): what arrives at the Marke. `geloestDe` reads the detached edges
// into the Marke (output ids, sorted, unique; unknown entries and entries of removed values or
// nodes skipped), `markoEnhavoDe` computes `enhavo` from the contents and the detached edges (only
// what is connected and not empty; „dazu“ in a fixed order; nothing → {}), and `gestaltenDe` takes
// the canvas state as a new optional input: without it its bytes are those of `6d34a75a` (the
// checksums below were taken before this change), with it the Marke carries `enhavo` and Primär
// shows „aus Material“ when the lead colour came from the Beispiele. Invented brands only.

import { createHash } from "node:crypto";
import type { Agordo } from "@fundamento/agordilo";
import { beforeAll, describe, expect, it } from "vitest";
import { farbArtDe } from "./farb-arto.js";
import {
  aldonebloj,
  gestaltenDe,
  KATALOGO_054,
  paletrojDe,
  serializeBildo,
  wirksamerAgordo,
} from "./grafeo-gestalten.js";
import type {
  Bildo,
  BildoFarbo,
  BildoMarko,
  ErkanntaFarbo,
  Kabloj,
  LeinwandStato,
  LeinwandStatoKnoto,
} from "./grafeo-gestalten-sicht.js";
import { KREILO } from "./kreilo/datoj.js";
import { erkanntDe, geloestDe, markoEnhavoDe } from "./leinwand-enhavo.js";
import { parseLeinwandStato, serializeLeinwandAntwort } from "./leinwand-stato.js";
import { type Bases, loadBases, startAgordo } from "./vorschau.js";

const sha256 = (teksto: string): string => createHash("sha256").update(teksto).digest("hex");

function farbo(hex: string, anteil: number): ErkanntaFarbo {
  const arto = farbArtDe(hex, KREILO.unbunt);
  if (arto === undefined) throw new Error(`no colour: ${hex}`);
  return { hex, anteil, ...arto };
}

const WERTE: LeinwandStatoKnoto = {
  id: "teksto-werte",
  inhalt: {
    werte: [
      { id: "w1", text: "nahbar" },
      { id: "w2", text: "mutig" },
      { id: "w3", text: "gründlich" },
    ],
  },
};
const KERN: LeinwandStatoKnoto = {
  id: "teksto-markenkern",
  inhalt: { zweck: "Gutes Brot für alle.", versprechen: "Jeden Morgen frisch." },
};
const BEISPIELE: LeinwandStatoKnoto = {
  id: "beispiele",
  speco: "beispiele",
  inhalt: {
    dateien: [
      { name: "a.png", art: "png", farben: [farbo("#2f5bff", 70), farbo("#ffffff", 30)] },
      { name: "b.png", art: "png", farben: [farbo("#d7263d", 100)] },
    ],
    primaer: { folgt: true, zuletzt: "#2f5bff" },
  },
};
const ALLE: LeinwandStatoKnoto[] = [
  { id: "teksto-ausgangslage", inhalt: { text: "Eine Bäckerei." } },
  KERN,
  WERTE,
  { id: "teksto-zielgruppe", speco: "teksto", inhalt: { wer: "Nachbarn" } },
  { id: "teksto-wettbewerb", speco: "teksto", inhalt: { liste: [] } },
  { id: "teksto-persoenlichkeit", speco: "teksto" },
  { id: "teksto-tonalitaet", speco: "teksto", inhalt: { "warm-kuehl": -1 } },
  BEISPIELE,
  { id: "schrift", speco: "schrift" },
];

describe("Spec 056 T1: geloestDe – the detached edges into the Marke", () => {
  it("keeps known outputs of existing nodes and values, sorted and unique", () => {
    const roh = [
      "teksto-werte.el.w2",
      "beispiele.el",
      "teksto-ausgangslage.el",
      "teksto-werte.el.w2",
      "teksto-tonalitaet.el",
      "teksto-markenkern.el",
    ];
    expect(geloestDe(roh, ALLE)).toEqual([
      "beispiele.el",
      "teksto-ausgangslage.el",
      "teksto-markenkern.el",
      "teksto-tonalitaet.el",
      "teksto-werte.el.w2",
    ]);
  });

  it("skips unknown entries and entries of removed values or nodes", () => {
    const roh = [
      "teksto-werte.el.w4",
      "teksto-werte.el",
      "teksto-zielgruppe.el",
      "beispiele.el",
      "schrift.el",
      "marko.el",
      "farbo-primaer.el",
      "teksto-ausgangslage.el",
      7,
      null,
    ];
    // Without Zielgruppe and Beispiele on the canvas, and without a value w4.
    expect(geloestDe(roh, [WERTE])).toEqual(["teksto-ausgangslage.el"]);
    expect(geloestDe("beispiele.el", ALLE)).toEqual([]);
    expect(geloestDe(undefined, ALLE)).toEqual([]);
  });
});

describe("Spec 056 T1: markoEnhavoDe – what arrives at the Marke", () => {
  it("gives Kern, the connected values, the detected colours and „dazu“ in the fixed order", () => {
    const dateien = [
      { name: "a.png", art: "png" as const, farben: [farbo("#2f5bff", 70), farbo("#ffffff", 30)] },
      { name: "b.png", art: "png" as const, farben: [farbo("#d7263d", 100)] },
    ];
    expect(markoEnhavoDe(ALLE, [])).toEqual({
      kern: { zweck: "Gutes Brot für alle.", versprechen: "Jeden Morgen frisch." },
      werte: [
        { id: "w1", text: "nahbar" },
        { id: "w2", text: "mutig" },
        { id: "w3", text: "gründlich" },
      ],
      farben: erkanntDe(dateien).map(({ hex, anteil }) => ({ hex, anteil })),
      dazu: ["teksto-ausgangslage", "teksto-zielgruppe", "teksto-tonalitaet"],
    });
  });

  it("leaves out what is detached, and a detached or removed value", () => {
    const geloest = ["teksto-werte.el.w2", "beispiele.el", "teksto-markenkern.el"];
    expect(markoEnhavoDe(ALLE, geloest)).toEqual({
      werte: [
        { id: "w1", text: "nahbar" },
        { id: "w3", text: "gründlich" },
      ],
      dazu: ["teksto-ausgangslage", "teksto-zielgruppe", "teksto-tonalitaet"],
    });
    const ohneW1: LeinwandStatoKnoto = {
      id: "teksto-werte",
      inhalt: { werte: [{ id: "w3", text: "gründlich" }] },
    };
    expect(markoEnhavoDe([ohneW1], ["teksto-werte.el.w1"])).toEqual({
      werte: [{ id: "w3", text: "gründlich" }],
    });
  });

  it("is {} when nothing arrives: empty nodes, or everything detached", () => {
    expect(markoEnhavoDe([], [])).toEqual({});
    const leer: LeinwandStatoKnoto[] = [
      { id: "teksto-markenkern", inhalt: { zweck: "  " } },
      { id: "teksto-werte", inhalt: { werte: [] } },
      { id: "beispiele", speco: "beispiele", inhalt: { dateien: [{ name: "c.jpg", art: "jpg" }] } },
    ];
    expect(markoEnhavoDe(leer, [])).toEqual({});
    const alleGeloest = [
      "beispiele.el",
      "teksto-ausgangslage.el",
      "teksto-markenkern.el",
      "teksto-tonalitaet.el",
      "teksto-werte.el.w1",
      "teksto-werte.el.w2",
      "teksto-werte.el.w3",
      "teksto-zielgruppe.el",
    ];
    expect(markoEnhavoDe(ALLE, alleGeloest)).toEqual({});
  });

  it("shows only the parts of the Kern that are written", () => {
    expect(
      markoEnhavoDe([{ id: "teksto-markenkern", inhalt: { versprechen: "Frisch." } }], []),
    ).toEqual({ kern: { versprechen: "Frisch." } });
  });
});

describe("Spec 056 T1: gestaltenDe with and without the canvas state", () => {
  let bases: Bases;
  let LEER: Agordo;
  let FARBIG: Agordo;
  let MATERIAL: Agordo;

  beforeAll(() => {
    bases = loadBases();
    LEER = startAgordo("lumeto", "leer", bases);
    FARBIG = {
      ...LEER,
      leitfarbe: "#2f5bff",
      zweitfarbe: { farbe: "#c6f135" },
      neutral: { toenung: 0.35 },
      zusatzfarben: { warning: "#d99a00" },
    };
    MATERIAL = {
      ...LEER,
      zweitfarbe: {
        farbe: "#c6f135",
        herkunft: { quelle: "bild", datei: "a.png", merkmal: "Farbe #c6f135", anteil: 12 },
      },
    };
  });

  const bildoDe = (agordo: Agordo, kabloj: Kabloj, stato?: LeinwandStato): Bildo => {
    const start = startAgordo(agordo.name, "leer", bases);
    const palettes = paletrojDe(wirksamerAgordo(agordo, start, kabloj), bases);
    return gestaltenDe(agordo, {
      start,
      kabloj,
      palettes,
      rev: 3,
      ...(stato === undefined ? {} : { stato }),
    });
  };

  /** sha256 of the bytes at `6d34a75a`, taken before this change (tasks.md, KBS-1.1). */
  const VORHER: Readonly<Record<string, string>> = {
    "LEER leer": "133177610c96184702d973104d92c15b4dc0a8f6b2bc5aea814968a384386021",
    "LEER akzent": "85ee58396233eafaaa95a05f8aa9a6da6e6805bf684fda6cde3a48310463119e",
    "LEER warning": "c45ff0f2cbffd0f437eba592dbf789fd65402a263b47fdf441b2a61d95561eb5",
    "FARBIG leer": "a5d8aa0a029616a1b32652675f98c5c3042aa4920efabfe681eea2ee59f0977f",
    "FARBIG akzent": "2076e60d75c4f9c2aa317f7c763a81d5f782e2dd6c329bc2e0cf0e4681e5b373",
    "FARBIG warning": "ea65807548bfeabd0a076942a5df647f12cff70742d2e1d9dcc0a276f019d9ff",
    "MATERIAL leer": "e9007117a04dec7e13d6eebf1b0b2d7bf6f8945008e874d2621c380dae37e6af",
    "MATERIAL akzent": "98f7e61b9fd06f8b4c98e5ace854fe63fa09e02d1c1aa3e310a61cd86d17b63d",
    "MATERIAL warning": "d392893da12b056727b45b6884cbea31319ef773e0131081dc78347bbaa3984f",
    "antwort LEER": "04182b4d1d7f9f532ad3a1220afd17e7ec7c28fee61b8813410afd56f1c628b4",
    "antwort FARBIG": "f447bc736e78947003660d5a80c4c2f5f2a7aee60f3310d76820306ec87e9670",
    "antwort MATERIAL": "f53cfa89a2ca1977a480b73796326d23895dacfa9242edaddb61b815ae44223a",
    "aldonebloj LEER": "5ee55928a7602c66ec16e0d464d77b9b989b9cc70048cbc10cc0d5fdb21d11f7",
    "aldonebloj FARBIG": "1e1c8a234a1aa95df1bb2f5bc81bbb1c73b6151f9bf75f194e093d35f55923dc",
  };

  it("without the state gives the bytes of 6d34a75a (Bildo, answer, catalog)", () => {
    const ist: Record<string, string> = {};
    for (const [nomo, agordo] of Object.entries({ LEER, FARBIG, MATERIAL })) {
      const kablojoj: Record<string, Kabloj> = {
        leer: {},
        akzent: { akzent: null },
        warning: { warning: "primaer" },
      };
      for (const [kn, kabloj] of Object.entries(kablojoj)) {
        const bildo = bildoDe(agordo, kabloj);
        ist[`${nomo} ${kn}`] = sha256(serializeBildo(bildo));
        if (kn !== "leer") continue;
        ist[`antwort ${nomo}`] = sha256(serializeLeinwandAntwort(bildo, null));
        if (nomo === "MATERIAL") continue;
        const nodoj = bildo.nodoj.map((n) => ({
          id: n.id,
          ...("stato" in n ? { stato: n.stato } : {}),
        }));
        ist[`aldonebloj ${nomo}`] = sha256(JSON.stringify(aldonebloj(KATALOGO_054, nodoj)));
      }
    }
    expect(ist).toEqual(VORHER);
  });

  it("with a state without contents gives the same Bildo as without one", () => {
    const stato: LeinwandStato = { version: 1, knoten: [{ id: "marko", x: 1, y: 2 }], kabloj: {} };
    expect(serializeBildo(bildoDe(LEER, {}, stato))).toBe(serializeBildo(bildoDe(LEER, {})));
  });

  it("with contents gives the Marke its enhavo and Primär „aus Material“", () => {
    const lego = parseLeinwandStato(
      JSON.stringify({ version: 1, knoten: ALLE, kabloj: {}, geloest: ["teksto-werte.el.w2"] }),
    );
    if (!("stato" in lego)) throw new Error("state does not read");
    const bildo = bildoDe(FARBIG, {}, lego.stato);
    const marko = bildo.nodoj.find((n): n is BildoMarko => n.speco === "marko");
    expect(marko?.enhavo).toEqual(markoEnhavoDe(lego.stato.knoten, ["teksto-werte.el.w2"]));
    expect(marko?.enhavo?.werte?.map((w) => w.text)).toEqual(["nahbar", "gründlich"]);
    const primaer = bildo.nodoj.find((n): n is BildoFarbo => n.id === "farbo-primaer");
    // FARBIG's lead colour #2f5bff is `zuletzt` of the Beispiele.
    expect(primaer?.stato).toBe("aus-material");
    // Everything else is the Bildo without a state.
    const ohne = bildoDe(FARBIG, {});
    const gleich = (b: Bildo) => ({
      ...b,
      nodoj: b.nodoj.map((n) =>
        n.speco === "marko"
          ? { id: n.id, speco: n.speco, fazo: n.fazo }
          : n.id === "farbo-primaer"
            ? { ...n, stato: "x" }
            : n,
      ),
    });
    expect(serializeBildo(gleich(bildo) as Bildo)).toBe(serializeBildo(gleich(ohne) as Bildo));
  });

  it("keeps Primär „von Hand“ when the lead colour is not the one from the Beispiele", () => {
    const stato: LeinwandStato = { version: 1, knoten: [BEISPIELE], kabloj: {} };
    const andere = { ...FARBIG, leitfarbe: "#d7263d" };
    const primaer = bildoDe(andere, {}, stato).nodoj.find((n) => n.id === "farbo-primaer");
    expect(primaer !== undefined && "stato" in primaer ? primaer.stato : "").toBe("von-hand");
    const marko = bildoDe(LEER, {}, { version: 1, knoten: [], kabloj: {} }).nodoj[0];
    expect(marko).toEqual({ id: "marko", speco: "marko", fazo: "fazo-4" });
  });
});
