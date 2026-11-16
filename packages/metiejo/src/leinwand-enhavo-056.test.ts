// Spec 056 (MP-2a, T1): the contents of the new nodes in `leinwand.json` (tech spec „Inhalt je
// Knoten“). `enhavoDe` reads a content by node kind: a field of the wrong type drops out on its
// own, never the file; more than five values or traits keep the first five. `wertAldoni` gives the
// smallest free id and refuses the sixth and a duplicate; `estasMalplena` says „leer“ per kind;
// `erkanntDe` merges the colours of all images (each image counts the same) and `farbArtDe` gives
// the flags each stored colour carries (plan D-5), from the thresholds in `kreilo.json` – no number
// is typed here. The file reader keeps every node's content and the reset keeps it too. Pure;
// invented brands only.

import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { parseAgordoColor } from "@fundamento/agordilo";
import { describe, expect, it } from "vitest";
import { farbojOfPixels } from "./enportilo/farboj.js";
import { farbArtDe } from "./farb-arto.js";
import {
  type BeispielDosiero,
  type ErkanntaFarbo,
  type InhaltMapo,
  type LeinwandStato,
  TEKSTO_IDS,
  TONALITAET_PAROJ,
  type Wert,
} from "./grafeo-gestalten-sicht.js";
import { KREILO } from "./kreilo/datoj.js";
import {
  eigenschaftAldoni,
  enhavoDe,
  erkanntDe,
  estasMalplena,
  wertAldoni,
} from "./leinwand-enhavo.js";
import {
  leinwandStatoRekomenco,
  parseLeinwandStato,
  serializeLeinwandStato,
} from "./leinwand-stato.js";

const teksto = (wert: unknown): string => JSON.stringify(wert);

/** A stored colour with the flags the server computes for it (D-5). */
function farbo(hex: string, anteil: number): ErkanntaFarbo {
  const arto = farbArtDe(hex, KREILO.unbunt);
  if (arto === undefined) throw new Error(`no colour: ${hex}`);
  return { hex, anteil, ...arto };
}

/** One full, valid content per node kind (tech spec shapes). */
const INHALTE: InhaltMapo = {
  "teksto-ausgangslage": { text: "Eine Bäckerei am Markt, jetzt mit Laden im Netz." },
  "teksto-zielgruppe": { wer: "Nachbarn", sorge: "Zeit", vertrauen: "Handwerk" },
  "teksto-wettbewerb": {
    liste: [{ name: "Lumeto Brot", adresse: "https://lumeto.example" }, { name: "Komuna" }],
  },
  "teksto-markenkern": { zweck: "Gutes Brot für alle.", versprechen: "Jeden Morgen frisch." },
  "teksto-werte": {
    werte: [
      { id: "w1", text: "nahbar" },
      { id: "w3", text: "gründlich" },
    ],
  },
  "teksto-persoenlichkeit": { eigenschaften: ["warm", "direkt", "neugierig"] },
  "teksto-tonalitaet": { "foermlich-locker": 1, "sachlich-verspielt": -1, "warm-kuehl": 0 },
  beispiele: {
    dateien: [
      { name: "plakat.png", art: "png", farben: [farbo("#2f5bff", 34.1)] },
      {
        name: "foto.jpg",
        art: "jpg",
        farben: [],
        satz: "Die Farben konnten nicht gemessen werden.",
      },
    ],
    verweise: [{ adresse: "https://pin.example/board", satz: "Ein Satz." }],
    primaer: { folgt: true, zuletzt: "#2f5bff" },
  },
  schrift: {
    eigene: [
      {
        familie: "Provo Sans",
        dateien: [
          {
            name: "provo-regular.woff2",
            gewicht: 400,
            stil: "normal",
            variabel: false,
            quelle: "tabellen",
          },
          {
            name: "provo-var.ttf",
            gewicht: 100,
            gewichtBis: 900,
            stil: "normal",
            variabel: true,
            quelle: "dateiname",
          },
        ],
      },
    ],
  },
};

const IDS = Object.keys(INHALTE) as (keyof InhaltMapo)[];

describe("Spec 056 T1: enhavoDe reads every node kind (tech spec shapes)", () => {
  it("reads a valid content of each kind as it is", () => {
    const befunde = IDS.filter((id) => !isDeepStrictEqual(enhavoDe(id, INHALTE[id]), INHALTE[id]));
    expect(befunde).toEqual([]);
    expect(IDS).toEqual([...TEKSTO_IDS, "beispiele", "schrift"]);
  });

  it("gives undefined for an unknown node or a content that is no object", () => {
    const keine = [
      enhavoDe("teksto-nenio", { text: "x" }),
      enhavoDe("marko", { text: "x" }),
      enhavoDe("teksto-ausgangslage", "x"),
      enhavoDe("teksto-ausgangslage", null),
      enhavoDe("teksto-ausgangslage", [1]),
      enhavoDe("beispiele", 3),
    ].filter((x) => x !== undefined);
    expect(keine).toEqual([]);
  });

  it("drops each field of the wrong type on its own, never the whole content", () => {
    const faelle: [keyof InhaltMapo, unknown, unknown][] = [
      ["teksto-ausgangslage", { text: 7 }, {}],
      ["teksto-ausgangslage", { text: "", fremd: "x" }, {}],
      ["teksto-zielgruppe", { wer: "Nachbarn", sorge: 3, vertrauen: ["x"] }, { wer: "Nachbarn" }],
      [
        "teksto-wettbewerb",
        { liste: [{ name: "" }, { adresse: "  " }, { name: "Komuna", adresse: 4 }, "x", null] },
        { liste: [{ name: "Komuna" }] },
      ],
      ["teksto-wettbewerb", { liste: "Komuna" }, {}],
      ["teksto-markenkern", { zweck: "Brot.", versprechen: null }, { zweck: "Brot." }],
      [
        "teksto-werte",
        {
          werte: [
            { id: "w1", text: "nahbar" },
            { id: "w9", text: "fern" },
            { id: "w2", text: 5 },
            { id: "w1", text: "doppelte id" },
            { id: "w3", text: "NAHBAR" },
            { id: "w4", text: "mutig" },
          ],
        },
        {
          werte: [
            { id: "w1", text: "nahbar" },
            { id: "w4", text: "mutig" },
          ],
        },
      ],
      [
        "teksto-persoenlichkeit",
        { eigenschaften: ["warm", 3, "", "Warm", "direkt"] },
        { eigenschaften: ["warm", "direkt"] },
      ],
      [
        "teksto-tonalitaet",
        {
          "foermlich-locker": 1,
          "sachlich-verspielt": 3,
          "ruhig-lebhaft": 1.5,
          "bescheiden-bestimmt": "1",
          "klassisch-modern": -2,
          laut: 1,
        },
        { "foermlich-locker": 1, "klassisch-modern": -2 },
      ],
      [
        "beispiele",
        {
          dateien: [
            {
              name: "a.png",
              art: "png",
              farben: [{ hex: "#2f5bff", anteil: 3 }, farbo("#d7263d", 9)],
            },
            { name: "b.gif", art: "gif", farben: [] },
            { name: "", art: "png", farben: [] },
            { name: "c.svg", art: "svg", farben: "rot", satz: 4 },
          ],
          verweise: [{ adresse: "https://a.example", satz: 2 }, { satz: "ohne Adresse" }],
          primaer: { folgt: "ja", zuletzt: "#2f5bff" },
        },
        {
          dateien: [
            { name: "a.png", art: "png", farben: [farbo("#d7263d", 9)] },
            { name: "c.svg", art: "svg" },
          ],
          verweise: [{ adresse: "https://a.example" }],
        },
      ],
      [
        "beispiele",
        { primaer: { folgt: false, zuletzt: "blau", seit: "#ABCDEF" } },
        { primaer: { folgt: false, seit: "#ABCDEF" } },
      ],
      [
        "schrift",
        {
          eigene: [
            {
              familie: "Provo",
              dateien: [
                {
                  name: "p.woff",
                  gewicht: 400,
                  stil: "normal",
                  variabel: false,
                  quelle: "tabellen",
                },
                {
                  name: "q.woff",
                  gewicht: "400",
                  stil: "normal",
                  variabel: false,
                  quelle: "tabellen",
                },
                {
                  name: "r.woff",
                  gewicht: 700,
                  stil: "schraeg",
                  variabel: false,
                  quelle: "tabellen",
                },
              ],
            },
            { familie: "", dateien: [] },
            { familie: "Ohne Dateien" },
          ],
        },
        {
          eigene: [
            {
              familie: "Provo",
              dateien: [
                {
                  name: "p.woff",
                  gewicht: 400,
                  stil: "normal",
                  variabel: false,
                  quelle: "tabellen",
                },
              ],
            },
          ],
        },
      ],
    ];
    const befunde = faelle.flatMap(([id, roh, erwartet]) => {
      const ist = enhavoDe(id, roh);
      return isDeepStrictEqual(ist, erwartet) ? [] : [`${id}: ${teksto(ist)}`];
    });
    expect(befunde).toEqual([]);
  });

  it("keeps the first five values and traits", () => {
    const sechs = ["eins", "zwei", "drei", "vier", "fuenf", "sechs"];
    const werte = enhavoDe("teksto-werte", {
      werte: sechs.map((text, i) => ({ id: `w${i + 1 > 5 ? 5 : i + 1}`, text })),
    });
    expect(werte?.werte?.map((w) => w.text)).toEqual(sechs.slice(0, 5));
    const ohneId = enhavoDe("teksto-werte", {
      werte: ["a", "b", "c", "d", "e"]
        .map((text, i) => ({ id: `w${5 - i}`, text }))
        .concat([{ id: "w1", text: "f" }]),
    });
    expect(ohneId?.werte?.length).toBe(5);
    const eigenschaften = enhavoDe("teksto-persoenlichkeit", { eigenschaften: sechs });
    expect(eigenschaften).toEqual({ eigenschaften: sechs.slice(0, 5) });
  });
});

describe("Spec 056 T1: wertAldoni and eigenschaftAldoni (limit five, no duplicate)", () => {
  const wert = (id: string, text: string): Wert => ({ id, text });

  it("gives the smallest free id, and an id stays when another value goes", () => {
    const eins = wertAldoni([], "nahbar");
    expect(eins).toEqual({ werte: [wert("w1", "nahbar")] });
    const ohneZwei = [wert("w1", "nahbar"), wert("w3", "gründlich")];
    expect(wertAldoni(ohneZwei, " mutig ")).toEqual({
      werte: [...ohneZwei, wert("w2", "mutig")],
    });
    const voll = [wert("w2", "a"), wert("w1", "b"), wert("w3", "c"), wert("w5", "d")];
    expect(wertAldoni(voll, "e")).toEqual({ werte: [...voll, wert("w4", "e")] });
  });

  it("refuses the sixth, a duplicate in any case, and an empty text", () => {
    const fuenf = ["a", "b", "c", "d", "e"].map((text, i) => wert(`w${i + 1}`, text));
    expect(wertAldoni(fuenf, "f")).toEqual({ rifuzo: "kvin" });
    expect(wertAldoni([wert("w1", "Nahbar")], "nahBAR")).toEqual({ rifuzo: "duobla" });
    expect(wertAldoni([wert("w1", "nahbar")], "  nahbar ")).toEqual({ rifuzo: "duobla" });
    expect(wertAldoni([], "   ")).toEqual({ rifuzo: "malplena" });
  });

  it("does the same for the traits of Persönlichkeit", () => {
    expect(eigenschaftAldoni(["warm"], "direkt")).toEqual({ eigenschaften: ["warm", "direkt"] });
    expect(eigenschaftAldoni(["a", "b", "c", "d", "e"], "f")).toEqual({ rifuzo: "kvin" });
    expect(eigenschaftAldoni(["Warm"], "warm")).toEqual({ rifuzo: "duobla" });
    expect(eigenschaftAldoni([], "")).toEqual({ rifuzo: "malplena" });
  });
});

describe("Spec 056 T1: estasMalplena per node kind", () => {
  it("calls each kind empty without content and full with it", () => {
    const leer: [string, unknown][] = [
      ["teksto-ausgangslage", { text: "   " }],
      ["teksto-zielgruppe", { wer: "" }],
      ["teksto-wettbewerb", { liste: [] }],
      ["teksto-markenkern", {}],
      ["teksto-werte", { werte: [] }],
      ["teksto-persoenlichkeit", { eigenschaften: [] }],
      ["teksto-tonalitaet", {}],
      ["beispiele", { dateien: [], verweise: [], primaer: { folgt: true } }],
      ["schrift", { eigene: [] }],
      ["teksto-nenio", { text: "x" }],
    ];
    const nichtLeer = leer.flatMap(([id, roh]) =>
      estasMalplena(id, enhavoDe(id, roh)) ? [] : [id],
    );
    expect(nichtLeer).toEqual([]);
    const ohne = IDS.filter((id) => !estasMalplena(id, undefined));
    expect(ohne).toEqual([]);
    const voll = IDS.filter((id) => estasMalplena(id, INHALTE[id]));
    expect(voll).toEqual([]);
  });

  it("Tonalität is empty while no slider is set; „dazwischen“ (0) is set", () => {
    expect(estasMalplena("teksto-tonalitaet", { "warm-kuehl": 0 })).toBe(false);
    expect(TONALITAET_PAROJ.map((p) => p.id)).toEqual([
      "foermlich-locker",
      "sachlich-verspielt",
      "ruhig-lebhaft",
      "bescheiden-bestimmt",
      "klassisch-modern",
      "warm-kuehl",
    ]);
  });

  it("a single reference makes Beispiele full", () => {
    expect(estasMalplena("beispiele", { verweise: [{ adresse: "https://a.example" }] })).toBe(
      false,
    );
  });
});

describe("Spec 056 T1: farbArtDe – the flags of a colour from kreilo.json (D-5)", () => {
  const { dunkel_bis, bunt_ab, pastell_ab } = KREILO.unbunt;

  it("follows the thresholds of kreilo.json for every sample colour", () => {
    const proben = ["#2f5bff", "#d7263d", "#ffffff", "#000000", "#808080", "#1a2340", "#e8f7a6"];
    const befunde = proben.flatMap((hex) => {
      const oklch = parseAgordoColor(hex);
      if (oklch === undefined) return [`${hex}: unreadable`];
      const bunt = oklch.c >= bunt_ab;
      const erwartet = { hell: oklch.l > dunkel_bis, bunt, leit: bunt && oklch.l < pastell_ab };
      return isDeepStrictEqual(farbArtDe(hex, KREILO.unbunt), erwartet) ? [] : [hex];
    });
    expect(befunde).toEqual([]);
  });

  it("a pastel yellow-green is colourful but no lead colour, a grey is not colourful", () => {
    const pastell = parseAgordoColor("#e8f7a6");
    expect(pastell !== undefined && pastell.l >= pastell_ab && pastell.c >= bunt_ab).toBe(true);
    expect(farbArtDe("#e8f7a6", KREILO.unbunt)).toMatchObject({ bunt: true, leit: false });
    const grau = parseAgordoColor("#808080");
    expect(grau !== undefined && grau.c < bunt_ab).toBe(true);
    expect(farbArtDe("#808080", KREILO.unbunt)).toMatchObject({ bunt: false, leit: false });
    expect(farbArtDe("kein Wert", KREILO.unbunt)).toBeUndefined();
  });
});

describe("Spec 056 T1: erkanntDe – the colours of all images together", () => {
  const datei = (name: string, farben: ErkanntaFarbo[]): BeispielDosiero => ({
    name,
    art: "png",
    farben,
  });

  it("counts each image the same, merges buckets, skips unmeasured files, orders share then hex", () => {
    const erkannt = erkanntDe([
      datei("a.png", [farbo("#2f5bff", 60), farbo("#ffffff", 40)]),
      // #2f5cff falls into the bucket of #2f5bff (5 bits per channel, as farbojOfPixels).
      datei("b.png", [farbo("#2f5cff", 20), farbo("#d7263d", 80)]),
      { name: "c.jpg", art: "jpg", farben: [] },
      { name: "d.webp", art: "webp" },
    ]);
    expect(erkannt).toEqual([farbo("#2f5bff", 40), farbo("#d7263d", 40), farbo("#ffffff", 20)]);
  });

  it("gives every image the same weight and rounds to one decimal like the Enportilo", () => {
    expect(
      erkanntDe([
        datei("a.png", [farbo("#2f5bff", 100)]),
        datei("b.png", [farbo("#d7263d", 100)]),
        datei("c.png", [farbo("#d7263d", 34.1)]),
      ]).map((f) => [f.hex, f.anteil]),
    ).toEqual([
      ["#d7263d", Math.round(((100 + 34.1) / 3) * 10) / 10],
      ["#2f5bff", Math.round((100 / 3) * 10) / 10],
    ]);
    expect(erkanntDe([])).toEqual([]);
  });

  it("gives at most as many colours as the Enportilo reads from one image", () => {
    // Twelve colours, equal areas: the Enportilo's own limit decides how many come back.
    const hexe = Array.from({ length: 12 }, (_, i) => [i * 20, 255 - i * 20, (i * 50) % 256]);
    const rgba = new Uint8Array(hexe.flatMap(([r = 0, g = 0, b = 0]) => [r, g, b, 255]));
    const grenze = farbojOfPixels(rgba, "probe.png").length;
    expect(grenze).toBeLessThan(hexe.length);
    const farben = hexe.map(([r = 0, g = 0, b = 0]) =>
      farbo(`#${[r, g, b].map((k) => k.toString(16).padStart(2, "0")).join("")}`, 100 / 12),
    );
    expect(erkanntDe([datei("a.png", farben)]).length).toBe(grenze);
  });
});

describe("Spec 056 T1: the file keeps every content (parseLeinwandStato, reset)", () => {
  const STATO: LeinwandStato = {
    version: 1,
    knoten: [
      { id: "marko", x: 24, y: 48 },
      { id: "teksto-ausgangslage", inhalt: INHALTE["teksto-ausgangslage"] },
      { id: "teksto-markenkern", x: -300, y: 200, inhalt: INHALTE["teksto-markenkern"] },
      { id: "teksto-werte", inhalt: INHALTE["teksto-werte"] },
      ...(
        [
          "teksto-zielgruppe",
          "teksto-wettbewerb",
          "teksto-persoenlichkeit",
          "teksto-tonalitaet",
        ] as const
      ).map((id) => ({ id, speco: "teksto" as const, inhalt: INHALTE[id] })),
      { id: "beispiele", speco: "beispiele", x: 30, y: -600, inhalt: INHALTE.beispiele },
      { id: "schrift", speco: "schrift", inhalt: INHALTE.schrift },
      { id: "vorschau-3", speco: "vorschau", schema: "hell", inhalt: { frei: [1] } },
    ],
    kabloj: {},
    geloest: ["beispiele.el", "teksto-werte.el.w3"],
  };

  it("round-trips a state with all nine contents through the file", () => {
    const bajtoj = serializeLeinwandStato(STATO);
    expect(parseLeinwandStato(bajtoj)).toEqual({ stato: STATO });
    const wieder = parseLeinwandStato(bajtoj);
    expect("stato" in wieder ? serializeLeinwandStato(wieder.stato) : "").toBe(bajtoj);
  });

  it("reads a fixed text node with content and without a place; drops one with neither", () => {
    const rezulto = parseLeinwandStato(
      teksto({
        version: 1,
        knoten: [
          { id: "teksto-ausgangslage" },
          { id: "teksto-markenkern", inhalt: { zweck: 3 } },
          { id: "teksto-werte", x: 1, y: 2, inhalt: "nahbar" },
          { id: "teksto-zielgruppe", inhalt: { wer: "x" } },
          { id: "beispiele", speco: "teksto", inhalt: {} },
          { id: "schrift", speco: "schrift", x: 5 },
        ],
        kabloj: {},
      }),
    );
    expect(rezulto).toEqual({
      stato: {
        version: 1,
        knoten: [
          { id: "teksto-markenkern", inhalt: {} },
          { id: "teksto-werte", x: 1, y: 2 },
          { id: "schrift", speco: "schrift" },
        ],
        kabloj: {},
      },
    });
  });

  it("drops „fehlt“ when reading a file; enhavoDe keeps it for the answer", () => {
    const mitFehlt = {
      dateien: [{ name: "weg.png", art: "png", farben: [], fehlt: true }],
    };
    expect(enhavoDe("beispiele", mitFehlt)).toEqual(mitFehlt);
    const rezulto = parseLeinwandStato(
      teksto({
        version: 1,
        knoten: [
          { id: "beispiele", speco: "beispiele", inhalt: mitFehlt },
          {
            id: "schrift",
            speco: "schrift",
            inhalt: {
              eigene: [
                {
                  familie: "Provo",
                  dateien: [
                    {
                      name: "p.woff",
                      gewicht: 400,
                      stil: "normal",
                      variabel: false,
                      quelle: "tabellen",
                      fehlt: true,
                    },
                  ],
                },
              ],
            },
          },
        ],
        kabloj: {},
      }),
    );
    expect(teksto(rezulto).includes("fehlt")).toBe(false);
  });

  it("„Anordnung zurücksetzen“ keeps every node's content, drops places and geloest", () => {
    expect(leinwandStatoRekomenco(STATO)).toEqual({
      version: 1,
      knoten: STATO.knoten
        .filter((k) => k.speco !== undefined || k.inhalt !== undefined)
        .map(({ x: _x, y: _y, ...rest }) => rest),
      kabloj: {},
    });
    expect("geloest" in leinwandStatoRekomenco(STATO)).toBe(false);
  });
});

describe("Spec 056 T1: leinwand-enhavo.ts runs in the browser (plan D-4)", () => {
  it("imports nothing but the shared module", () => {
    const quelle = readFileSync(new URL("./leinwand-enhavo.ts", import.meta.url), "utf8");
    // `… from "x"` (also `export … from`) and a bare `import "x"`.
    const importe = [
      ...quelle.matchAll(/^\s*(?:import|export)[^;]*?from\s+["']([^"']+)["']/gms),
      ...quelle.matchAll(/^\s*import\s+["']([^"']+)["']/gm),
    ].map((m) => m[1]);
    expect(importe.filter((pfad) => pfad !== "./grafeo-gestalten-sicht.js")).toEqual([]);
    expect(importe.length).toBeGreaterThan(0);
    expect(/\bimport\s*\(|\brequire\s*\(/.test(quelle)).toBe(false);
  });
});
