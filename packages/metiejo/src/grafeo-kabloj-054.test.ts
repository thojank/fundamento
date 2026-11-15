// Spec 054 (MP-1, T1, E-11, E-13): the connection rules of the session as pure functions – which
// edge may be drawn (`validaLigo`), the edges after a new Bildo (`ligojKun`), the effective view
// they give (`kablojDe`, its text form `kablojTeksto`/`kablojEl`) and the effective Agordo the
// server derives from it (`wirksamerAgordo`, which never writes) – and the states of the catalog
// „+ Knoten“ (`aldonebloj`). Fixtures are invented brands; nothing here reads the clock.

import { type Agordo, readAgordo } from "@fundamento/agordilo";
import { beforeAll, describe, expect, it } from "vitest";
import { gestaltenDe, wirksamerAgordo } from "./grafeo-gestalten.js";
import {
  aldonebloj,
  type Bildo,
  type BildoFarbo,
  type BildoLigo,
  FARBO_ROLOJ,
  KATALOGO_054,
  type Kabloj,
  kablojDe,
  kablojEl,
  kablojTeksto,
  type LigoSitzung,
  ligoId,
  ligojKun,
  validaLigo,
} from "./grafeo-gestalten-sicht.js";

const START: Agordo = { name: "lumeta", leitfarbe: "#3b5bdb" };
const LEER: Agordo = { name: "lumeta", leitfarbe: "#3b5bdb" };
const FARBIG: Agordo = {
  name: "lumeta",
  leitfarbe: "#2f5bff",
  zweitfarbe: {
    farbe: "#c6f135",
    herkunft: { quelle: "bild", datei: "probe.png", merkmal: "Fläche oben links" },
  },
  zusatzfarben: { warning: "#d99a00" },
  neutral: { toenung: 0.35 },
  regler: { kontrast: 0.2 },
  festgelegt: {
    "color.palette.accent.500": {
      wert: { colorSpace: "srgb", components: [1, 0, 0], hex: "#ff0000" },
    },
    "color.palette.sekundo.300": { modoj: { "color-scheme=dark": { wert: "#123456" } } },
  },
};
const ALLE: Agordo = {
  ...LEER,
  zweitfarbe: { farbe: "#c6f135" },
  zusatzfarben: { success: "#2e8b57", warning: "#d99a00", danger: "#d7263d", info: "#1e88c8" },
};

/** The Bildo without a derivation: nodes and edges do not depend on it. */
const bildoDe = (agordo: Agordo, rev = 1): Bildo =>
  gestaltenDe(agordo, { start: START, kabloj: {}, palettes: undefined, rev });

const LEERE_SITZUNG: LigoSitzung = { geloest: [], gezogen: [], nodoj: [] };
const ohne = (ligoj: readonly BildoLigo[], ...ids: string[]): BildoLigo[] =>
  ligoj.filter((l) => !ids.includes(l.id));
const kun = (ligoj: readonly BildoLigo[], de: string, al: string): BildoLigo[] => [
  ...ligoj.filter((l) => l.al !== al),
  { id: ligoId(de, al), de, al, art: "farbo" },
];

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null) {
    for (const inner of Object.values(value)) deepFreeze(inner);
    Object.freeze(value);
  }
  return value;
}

let bildoLeer: Bildo;
let bildoFarbig: Bildo;
let bildoAlle: Bildo;

beforeAll(() => {
  bildoLeer = bildoDe(LEER);
  bildoFarbig = bildoDe(FARBIG);
  bildoAlle = bildoDe(ALLE);
});

describe("Spec 054 T1: validaLigo – which edge may be drawn (AK-17 pure)", () => {
  it("allows output → input of the same kind", () => {
    const erlaubt: [string, string][] = [
      ["marko.el", "farbo-akzent.en"],
      ["marko.el", "farbo-warning.en"],
      ["marko.el", "vorschau-hell.en"],
      ["farbo-primaer.el", "paletro.en.primaer"],
      ["farbo-primaer.el", "paletro.en.warning"],
      ["farbo-akzent.el", "paletro.en.info"],
      ["farbo-success.el", "paletro.en.akzent"],
      ["farbo-neutral.el", "paletro.en.neutral"],
      ["paletro.el", "vorschau-dunkel.en"],
      ["paletro.el", "vorschau-3.en"],
    ];
    const befunde = erlaubt.filter(([de, al]) => !validaLigo(bildoFarbig.ligoj, de, al));
    expect(befunde).toEqual([]);
  });

  it("refuses another kind, input → output, a cycle and unknown ports", () => {
    const verboten: [string, string][] = [
      // another kind
      ["farbo-primaer.el", "paletro.en.neutral"],
      ["farbo-neutral.el", "paletro.en.primaer"],
      ["marko.el", "paletro.en.primaer"],
      ["farbo-primaer.el", "vorschau-hell.en"],
      ["paletro.el", "paletro.en.primaer"],
      // input → output, output → output, input → input
      ["farbo-primaer.en", "marko.el"],
      ["paletro.en.primaer", "farbo-primaer.el"],
      ["farbo-primaer.el", "farbo-akzent.el"],
      ["farbo-primaer.en", "farbo-akzent.en"],
      // a cycle: the Palette never feeds a colour node, a node never itself
      ["paletro.el", "farbo-primaer.en"],
      ["paletro.el", "farbo-akzent.en"],
      ["paletro.el", "farbo-warning.en"],
      // unknown
      ["marko.el", "farbo-blau.en"],
      ["farbo-primaer.el", "paletro.en.blau"],
      ["vorschau-hell.el", "paletro.en.primaer"],
      ["", ""],
    ];
    const befunde = verboten.filter(([de, al]) => validaLigo(bildoFarbig.ligoj, de, al));
    expect(befunde).toEqual([]);
    // The Palette never feeds a colour node, also when no edge would close the cycle yet.
    const ohneKanten = verboten.filter(([de, al]) => validaLigo([], de, al));
    expect(ohneKanten).toEqual([]);
  });
});

describe("Spec 054 T1: ligojKun – the edges of the session after a new Bildo", () => {
  it("without changes are the edges of the Agordo", () => {
    expect(ligojKun(LEERE_SITZUNG, bildoFarbig)).toEqual(bildoFarbig.ligoj);
  });

  it("keeps a detached edge detached over a new Bildo", () => {
    const sitzung: LigoSitzung = {
      ...LEERE_SITZUNG,
      geloest: [ligoId("farbo-akzent.el", "paletro.en.akzent")],
    };
    const neu = bildoDe({ ...FARBIG, leitfarbe: "#112233" }, 2);
    for (const bildo of [bildoFarbig, neu]) {
      const ligoj = ligojKun(sitzung, bildo);
      expect(ligoj.some((l) => l.al === "paletro.en.akzent")).toBe(false);
      expect(ligoj.length).toBe(bildo.ligoj.length - 1);
    }
  });

  it("lets a drawn edge replace the one at the same input; an output feeds several inputs", () => {
    const sitzung: LigoSitzung = {
      ...LEERE_SITZUNG,
      gezogen: [
        { de: "farbo-primaer.el", al: "paletro.en.warning" },
        { de: "farbo-primaer.el", al: "paletro.en.info" },
      ],
    };
    const ligoj = ligojKun(sitzung, bildoFarbig);
    const primaer = bildoFarbig.nodoj.find(
      (n): n is BildoFarbo => n.id === "farbo-primaer" && n.speco === "farbo",
    );
    expect(ligoj.filter((l) => l.al === "paletro.en.warning")).toEqual([
      {
        id: ligoId("farbo-primaer.el", "paletro.en.warning"),
        de: "farbo-primaer.el",
        al: "paletro.en.warning",
        art: "farbo",
        hex: primaer?.hex,
      },
    ]);
    expect(
      ligoj
        .filter((l) => l.de === "farbo-primaer.el" && l.fest !== true)
        .map((l) => l.al)
        .sort(),
    ).toEqual(["paletro.en.info", "paletro.en.primaer", "paletro.en.warning"]);
    const proEingang = new Map<string, number>();
    for (const l of ligoj) proEingang.set(l.al, (proEingang.get(l.al) ?? 0) + 1);
    expect([...proEingang.values()].filter((n) => n > 1)).toEqual([]);
    // The later drawn edge wins at the same input.
    const zweimal = ligojKun(
      {
        ...LEERE_SITZUNG,
        gezogen: [
          { de: "farbo-primaer.el", al: "paletro.en.akzent" },
          { de: "farbo-warning.el", al: "paletro.en.akzent" },
        ],
      },
      bildoFarbig,
    );
    expect(zweimal.filter((l) => l.al === "paletro.en.akzent").map((l) => l.de)).toEqual([
      "farbo-warning.el",
    ]);
  });

  it("drops edges at nodes that no longer exist, keeps those of session nodes", () => {
    // Spec 055 (T2): the Funktionsfarben are always in the Bildo; a Bildo without the node stands
    // in for a node that is gone.
    const bildoOhne = (id: string): Bildo => ({
      ...bildoLeer,
      nodoj: bildoLeer.nodoj.filter((n) => n.id !== id),
      ligoj: bildoLeer.ligoj.filter((l) => !l.id.includes(`${id}.`)),
    });
    const ohneWarnung = bildoOhne("farbo-warning");
    const ohneErfolg = bildoOhne("farbo-success");
    const zuWarnung: LigoSitzung = {
      ...LEERE_SITZUNG,
      gezogen: [{ de: "farbo-warning.el", al: "paletro.en.primaer" }],
    };
    // Warnung was removed („↺“): the next Bildo has no such node.
    expect(ligojKun(zuWarnung, ohneWarnung).some((l) => l.de === "farbo-warning.el")).toBe(false);
    // The drawn edge is gone, so the Agordo's edge at that input stays.
    expect(
      ligojKun(zuWarnung, ohneWarnung)
        .filter((l) => l.al === "paletro.en.primaer")
        .map((l) => l.de),
    ).toEqual(["farbo-primaer.el"]);

    const leererKnoten: LigoSitzung = {
      geloest: [],
      gezogen: [
        { de: "marko.el", al: "farbo-success.en" },
        { de: "farbo-success.el", al: "paletro.en.success" },
        { de: "paletro.el", al: "vorschau-3.en" },
      ],
      nodoj: [],
    };
    expect(ligojKun(leererKnoten, ohneErfolg)).toEqual(ohneErfolg.ligoj);
    const mit = ligojKun({ ...leererKnoten, nodoj: ["farbo-success", "vorschau-3"] }, ohneErfolg);
    expect(mit.slice(ohneErfolg.ligoj.length).map((l) => [l.id, l.art, l.hex])).toEqual([
      [ligoId("marko.el", "farbo-success.en"), "marko", undefined],
      [ligoId("farbo-success.el", "paletro.en.success"), "farbo", undefined],
      [ligoId("paletro.el", "vorschau-3.en"), "marko", undefined],
    ]);
  });

  it("never takes a drawn edge the rules refuse", () => {
    const sitzung: LigoSitzung = {
      ...LEERE_SITZUNG,
      gezogen: [
        { de: "paletro.el", al: "farbo-primaer.en" },
        { de: "farbo-primaer.el", al: "paletro.en.neutral" },
      ],
    };
    expect(ligojKun(sitzung, bildoFarbig)).toEqual(bildoFarbig.ligoj);
  });
});

describe("Spec 054 T1: kablojDe – the effective view of the session edges (AK-17, AK-18 pure)", () => {
  it("is {} for the edges of the Agordo", () => {
    for (const bildo of [bildoLeer, bildoFarbig, bildoAlle]) {
      expect(kablojDe(bildo.ligoj, bildo.nodoj)).toEqual({});
    }
  });

  it("Akzent detached → {akzent: null}; Primär on Warnung → {warning: primaer}", () => {
    const geloest = ohne(bildoFarbig.ligoj, ligoId("farbo-akzent.el", "paletro.en.akzent"));
    expect(kablojDe(geloest, bildoFarbig.nodoj)).toEqual({ akzent: null });
    expect(
      kablojDe(kun(bildoFarbig.ligoj, "farbo-primaer.el", "paletro.en.warning"), bildoFarbig.nodoj),
    ).toEqual({
      warning: "primaer",
    });
    // A row without its own node, fed by Primär.
    expect(
      kablojDe(kun(bildoLeer.ligoj, "farbo-primaer.el", "paletro.en.warning"), bildoLeer.nodoj),
    ).toEqual({
      warning: "primaer",
    });
  });

  it("a colour node detached from the Marke feeds nothing", () => {
    const ligoj = ohne(bildoFarbig.ligoj, ligoId("marko.el", "farbo-primaer.en"));
    expect(kablojDe(ligoj, bildoFarbig.nodoj)).toEqual({ primaer: null });
    const auchWarnung = kun(ligoj, "farbo-primaer.el", "paletro.en.warning");
    expect(kablojDe(auchWarnung, bildoFarbig.nodoj)).toEqual({ primaer: null, warning: null });
    const neutral = ohne(bildoFarbig.ligoj, ligoId("farbo-neutral.el", "paletro.en.neutral"));
    expect(kablojDe(neutral, bildoFarbig.nodoj)).toEqual({ neutral: null });
  });

  it("an empty colour node feeds nothing", () => {
    // LEER: Akzent and Neutral are empty; detaching them changes nothing.
    const geloest = ohne(
      bildoLeer.ligoj,
      ligoId("farbo-akzent.el", "paletro.en.akzent"),
      ligoId("farbo-neutral.el", "paletro.en.neutral"),
    );
    expect(kablojDe(geloest, bildoLeer.nodoj)).toEqual({});
    expect(
      kablojDe(kun(bildoLeer.ligoj, "farbo-akzent.el", "paletro.en.info"), bildoLeer.nodoj),
    ).toEqual({});
    // An empty session node (from „+ Knoten“) on its own row and on a row with a colour.
    const nodoj = [...bildoFarbig.nodoj, { id: "farbo-success", stato: "leer" as const }];
    const mitLeerem = [
      ...bildoFarbig.ligoj,
      {
        id: ligoId("marko.el", "farbo-success.en"),
        de: "marko.el",
        al: "farbo-success.en",
        art: "marko" as const,
      },
      {
        id: ligoId("farbo-success.el", "paletro.en.success"),
        de: "farbo-success.el",
        al: "paletro.en.success",
        art: "farbo" as const,
      },
    ];
    expect(kablojDe(mitLeerem, nodoj)).toEqual({});
    expect(kablojDe(kun(mitLeerem, "farbo-success.el", "paletro.en.warning"), nodoj)).toEqual({
      warning: null,
    });
  });

  it("gives only what kablojEl reads back", () => {
    const varianten = [
      ohne(bildoFarbig.ligoj, ligoId("marko.el", "farbo-primaer.en")),
      kun(bildoFarbig.ligoj, "farbo-akzent.el", "paletro.en.primaer"),
      ohne(bildoFarbig.ligoj, ...bildoFarbig.ligoj.map((l) => l.id)),
    ];
    const befunde: string[] = [];
    for (const ligoj of varianten) {
      const kabloj = kablojDe(ligoj, bildoFarbig.nodoj);
      if (JSON.stringify(kablojEl(kablojTeksto(kabloj))) !== JSON.stringify(kabloj)) {
        befunde.push(kablojTeksto(kabloj));
      }
    }
    expect(befunde).toEqual([]);
  });
});

describe("Spec 054 T1: kablojTeksto / kablojEl – the parameter kabloj", () => {
  it('writes ziel:quelle in row order, „-“ for not connected, "" for {}', () => {
    expect(kablojTeksto({})).toBe("");
    expect(kablojTeksto({ warning: "primaer", akzent: null })).toBe("akzent:-,warning:primaer");
    expect(kablojTeksto({ info: null, neutral: null, primaer: "akzent" })).toBe(
      "neutral:-,primaer:akzent,info:-",
    );
    expect(kablojEl("")).toEqual({});
  });

  it("reads back what it writes", () => {
    const varianten: Kabloj[] = [
      {},
      { akzent: null },
      { warning: "primaer" },
      {
        neutral: null,
        primaer: null,
        akzent: "primaer",
        success: "akzent",
        warning: "info",
        danger: null,
        info: "info",
      },
      { neutral: "neutral" },
    ];
    const befunde = varianten.filter(
      (k) =>
        JSON.stringify(kablojEl(kablojTeksto(k))) !==
        JSON.stringify(Object.fromEntries(FARBO_ROLOJ.filter((r) => r in k).map((r) => [r, k[r]]))),
    );
    expect(befunde).toEqual([]);
  });

  it("refuses unknown names, duplicate targets, a colour on neutral, neutral on a colour row", () => {
    const fehlerhaft = [
      "primaer",
      "primaer:",
      ":primaer",
      "blau:primaer",
      "primaer:blau",
      "akzent:-,akzent:primaer",
      "akzent:-,akzent:-",
      "neutral:primaer",
      "neutral:akzent",
      "warning:neutral",
      "primaer:neutral",
      "akzent:-,",
      ",akzent:-",
      " akzent:-",
      "akzent:-;warning:primaer",
      "AKZENT:-",
      "akzent:--",
      "akzent:-:primaer",
      "__proto__:-",
      "constructor:primaer",
      "toString:-",
      "akzent:null",
    ];
    const befunde = fehlerhaft.filter((teksto) => kablojEl(teksto) !== undefined);
    expect(befunde).toEqual([]);
    expect(kablojEl("neutral:neutral")).toEqual({ neutral: "neutral" });
    expect(kablojEl("neutral:-")).toEqual({ neutral: null });
  });
});

describe("Spec 054 T1: wirksamerAgordo – the effective Agordo, never written (AK-18 pure)", () => {
  const A = deepFreeze(structuredClone(FARBIG));
  const vorher = structuredClone(FARBIG);
  const ohneHerkunft = { farbe: "#c6f135" };

  it("is the Agordo itself for {}", () => {
    expect(wirksamerAgordo(A, START, {})).toEqual(vorher);
  });

  it("follows every row of the table", () => {
    const { zweitfarbe: _z, ...ohneZweitfarbe } = vorher;
    const { zusatzfarben: _f, ...ohneZusatz } = vorher;
    const { neutral: _n, ...ohneNeutral } = vorher;
    const tabelle: [Kabloj, Agordo][] = [
      [{ primaer: "akzent" }, { ...vorher, leitfarbe: "#c6f135" }],
      [{ primaer: "warning" }, { ...vorher, leitfarbe: "#d99a00" }],
      [{ primaer: null }, { ...vorher, leitfarbe: START.leitfarbe }],
      [{ akzent: "primaer" }, { ...vorher, zweitfarbe: { farbe: "#2f5bff" } }],
      [{ akzent: "akzent" }, { ...vorher, zweitfarbe: ohneHerkunft }],
      [{ akzent: null }, ohneZweitfarbe],
      [{ warning: "primaer" }, { ...vorher, zusatzfarben: { warning: "#2f5bff" } }],
      [
        { success: "akzent" },
        { ...vorher, zusatzfarben: { warning: "#d99a00", success: "#c6f135" } },
      ],
      [{ warning: null }, ohneZusatz],
      [{ info: null }, vorher],
      [{ neutral: "neutral" }, vorher],
      [{ neutral: null }, ohneNeutral],
      // A source without a value feeds nothing, like null.
      [{ success: "info" }, vorher],
      [{ primaer: "success" }, { ...vorher, leitfarbe: START.leitfarbe }],
      // The values come from the stored Agordo, so a swap swaps.
      [
        { primaer: "akzent", akzent: "primaer" },
        { ...vorher, leitfarbe: "#c6f135", zweitfarbe: { farbe: "#2f5bff" } },
      ],
    ];
    const befunde: string[] = [];
    for (const [kabloj, soll] of tabelle) {
      const ist = wirksamerAgordo(A, START, kabloj);
      if (JSON.stringify(sortiert(ist)) !== JSON.stringify(sortiert(soll)))
        befunde.push(kablojTeksto(kabloj));
      if (ist.festgelegt !== A.festgelegt)
        befunde.push(`${kablojTeksto(kabloj)}: festgelegt touched`);
      if (readAgordo(ist).issues.length > 0) befunde.push(`${kablojTeksto(kabloj)}: invalid`);
    }
    expect(befunde).toEqual([]);
    expect(A).toEqual(vorher);
  });

  it("keeps a Neutral without Tönung and other neutral fields as they are", () => {
    const B = deepFreeze({ ...LEER, neutral: { toenung: 0.2 } });
    expect(wirksamerAgordo(B, START, { neutral: null })).toEqual(LEER);
    expect(wirksamerAgordo(deepFreeze({ ...LEER }), START, { neutral: null })).toEqual(LEER);
  });
});

/** Keys sorted at every level, for a comparison that ignores key order. */
function sortiert(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortiert);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortiert((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}

describe("Spec 054 T1: aldonebloj – the catalog „+ Knoten“ (AK-21 pure)", () => {
  const stand = (nodoj: Parameters<typeof aldonebloj>[1]) =>
    Object.fromEntries(
      aldonebloj(KATALOGO_054, nodoj)
        .filter((e) => e.stato !== "spaeter")
        .map((e) => [`${e.grupo} · ${e.nomo}`, e.stato]),
    );

  // Spec 055 (T2): the four Funktionsfarben are on the canvas from the start („auf der Leinwand“).
  it("an empty brand: four Funktionsfarben on the canvas, Akzent to set, a further preview", () => {
    expect(stand(bildoLeer.nodoj)).toEqual({
      "Eingabe · Marke": "da",
      "Gestalt · Farbe · Primär": "da",
      "Gestalt · Farbe · Akzent": "setzen",
      "Gestalt · Farbe · Neutral": "da",
      "Gestalt · Farbe · Erfolg": "da",
      "Gestalt · Farbe · Warnung": "da",
      "Gestalt · Farbe · Fehler": "da",
      "Gestalt · Farbe · Hinweis": "da",
      "Gestalt · Palette": "da",
      "Vorschau · Komponenten": "weitere",
    });
  });

  it("a brand with Akzent and Warnung: both on the canvas", () => {
    const s = stand(bildoFarbig.nodoj);
    expect(s["Gestalt · Farbe · Akzent"]).toBe("da");
    expect(s["Gestalt · Farbe · Warnung"]).toBe("da");
    expect(s["Gestalt · Farbe · Erfolg"]).toBe("da");
  });

  it("a brand with every Funktionsfarbe: nothing left to create; a session node counts as there", () => {
    expect(
      Object.values(stand(bildoAlle.nodoj)).filter((s) => s === "anlegen" || s === "setzen"),
    ).toEqual([]);
    const mitSitzung = stand([...bildoLeer.nodoj, { id: "farbo-success", stato: "leer" }]);
    expect(mitSitzung["Gestalt · Farbe · Erfolg"]).toBe("da");
  });

  it("names the node each selectable entry adds or selects", () => {
    const eroj = aldonebloj(KATALOGO_054, bildoLeer.nodoj);
    expect(
      eroj
        .filter((e) => e.stato === "anlegen" || e.stato === "setzen")
        .map((e) => [e.nomo, e.nodo]),
    ).toEqual([["Farbe · Akzent", "farbo-akzent"]]);
  });

  it("everything of a later run is „spaeter“, grouped by purpose in the catalog's order", () => {
    const eroj = aldonebloj(KATALOGO_054, bildoLeer.nodoj);
    expect(eroj.length).toBe(KATALOGO_054.length);
    const befunde = eroj
      .filter((e) => (e.lauf !== "MP-1") !== (e.stato === "spaeter"))
      .map((e) => e.nomo);
    expect(befunde).toEqual([]);
    expect([...new Set(eroj.map((e) => e.grupo))]).toEqual([
      "Eingabe",
      "Vorschlag",
      "Probe",
      "Gestalt",
      "Vorschau",
      "Ausgabe",
      "Ordnung",
    ]);
    expect(eroj.find((e) => e.nomo === "Anteile")?.stato).toBe("spaeter");
    expect(eroj.filter((e) => e.nomo === "+ Farbe" || e.nomo === "Farbe")).toEqual([]);
    const zeichen = new Set(["teksto", "farbo", "tiparo", "mezuro", "marko", "bildo", "ki"]);
    expect(eroj.filter((e) => !zeichen.has(e.zeichen)).map((e) => e.nomo)).toEqual([]);
  });
});
