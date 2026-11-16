// Spec 056 (MP-2a, T1, plan D-23): the new changes of the canvas's pure write path. With the font
// catalog and the sliders as an optional fourth argument, `leinwandSchreiben` sets a font from
// Fontsource for heading, text or code (as the Studio's `schriftenOf(fontoOf(…))`), an own font as
// „lizenziert, nicht enthalten“ (`licencedFonto`), a Schrift slider within its range (`withRegler`),
// and Akzent with its origin (`zweitfarbe.herkunft`), so it shows „aus Material“ by the existing
// path. An unknown font or a slider out of range is refused with its field and a calm sentence;
// without the fourth argument nothing changes. Invented brands only.

import { type Agordo, type Regler, readAgordo, reglerOf, withRegler } from "@fundamento/agordilo";
import { buildModelo } from "@fundamento/modelo";
import { beforeAll, describe, expect, it } from "vitest";
import { gestaltenDe } from "./grafeo-gestalten.js";
import type { BildoFarbo } from "./grafeo-gestalten-sicht.js";
import {
  leinwandSchreiben,
  NEVALIDA_SATZ,
  paletroStufojDe,
  reglerSatzDe,
  type SkriboKatalogo,
  type SkriboRezulto,
} from "./grafeo-skribo.js";
import { fontoOf, LICENCED_NOTE, licencedFonto, readTiparoj } from "./tiparoj.js";
import { loadBases } from "./vorschau.js";

const LUMO: Agordo = { name: "lumo", leitfarbe: "#375479" } as Agordo;

let stufoj: ReturnType<typeof paletroStufojDe>;
let katalogo: SkriboKatalogo;
let schriftRegler: Regler[];

beforeAll(() => {
  const bases = loadBases();
  stufoj = paletroStufojDe(bases.calibration);
  const regler = reglerOf(bases.gestalt);
  katalogo = { tiparoj: readTiparoj().tiparoj, regler };
  schriftRegler = regler.filter((r) => r.path.startsWith("schrift."));
});

const agordoDe = (rezulto: SkriboRezulto): Agordo => {
  if (rezulto.speco !== "ok") throw new Error(JSON.stringify(rezulto));
  return rezulto.agordo;
};

/** The first two families of the catalog with Latin, as they stand in data/tiparoj.json. */
const zweiFamilien = () => katalogo.tiparoj.filter((t) => t.scripts.includes("Latn")).slice(0, 2);

describe("Spec 056 T1: {schrift} – a font from Fontsource or an own font (D-23)", () => {
  it("sets heading, text and code one by one, as the Studio does, the others stay", () => {
    const [erste, zweite] = zweiFamilien();
    if (erste === undefined || zweite === undefined) throw new Error("catalog too small");
    const a = agordoDe(
      leinwandSchreiben(
        LUMO,
        { schrift: { rolle: "display", tiparo: erste.id } },
        stufoj,
        katalogo,
      ),
    );
    const b = agordoDe(
      leinwandSchreiben(a, { schrift: { rolle: "body", tiparo: zweite.id } }, stufoj, katalogo),
    );
    const c = agordoDe(
      leinwandSchreiben(b, { schrift: { rolle: "code", tiparo: zweite.id } }, stufoj, katalogo),
    );
    expect(c.schriften).toEqual({
      display: fontoOf(erste),
      body: fontoOf(zweite),
      code: fontoOf(zweite),
    });
    expect(readAgordo(c).agordo).toEqual(c);
    expect({ ...c, schriften: undefined }).toEqual({ ...LUMO, schriften: undefined });
  });

  it("sets an own font as licensed and not contained, as the Studio's upload does", () => {
    const a = agordoDe(
      leinwandSchreiben(
        LUMO,
        { schrift: { rolle: "display", eigene: "Provo Sans" } },
        stufoj,
        katalogo,
      ),
    );
    expect(a.schriften?.display).toEqual(licencedFonto("Provo Sans", ["Latn"]));
    expect(a.schriften?.display?.source.startsWith(LICENCED_NOTE)).toBe(true);
    expect(a.schriften?.display?.redistributable).toBe(false);
  });

  it("refuses an unknown font id with its field and a calm sentence", () => {
    expect(
      leinwandSchreiben(
        LUMO,
        { schrift: { rolle: "body", tiparo: "nenio-tiparo" } },
        stufoj,
        katalogo,
      ),
    ).toEqual({ speco: "rifuzita", feld: "schrift.body", satz: NEVALIDA_SATZ });
  });

  it("calls a schrift body of another shape malformed", () => {
    const [erste] = zweiFamilien();
    const faelle: unknown[] = [
      { schrift: { rolle: "titel", tiparo: erste?.id } },
      { schrift: { rolle: "body" } },
      { schrift: { rolle: "body", tiparo: 3 } },
      { schrift: { rolle: "body", tiparo: erste?.id, eigene: "Provo" } },
      { schrift: { rolle: "body", eigene: "  " } },
      { schrift: "inter" },
      {
        schrift: { rolle: "body", tiparo: erste?.id },
        regler: { pfad: "schrift.skala", wert: 1.2 },
      },
    ];
    const ist = faelle.map((korpo) => leinwandSchreiben(LUMO, korpo, stufoj, katalogo).speco);
    expect(ist).toEqual(faelle.map(() => "malformita"));
  });
});

describe("Spec 056 T1: {regler} – the three Schrift sliders with their ranges (D-23)", () => {
  it("sets each Schrift slider within its range as withRegler does", () => {
    expect(schriftRegler.map((r) => r.path)).toEqual([
      "schrift.groesse",
      "schrift.skala",
      "schrift.gewicht",
    ]);
    const befunde = schriftRegler.flatMap((r) =>
      [r.min, r.max, r.standard].flatMap((wert) => {
        const ist = leinwandSchreiben(LUMO, { regler: { pfad: r.path, wert } }, stufoj, katalogo);
        const soll = readAgordo(withRegler(LUMO, r.path, wert)).agordo;
        return ist.speco === "ok" && JSON.stringify(ist.agordo) === JSON.stringify(soll)
          ? []
          : [`${r.path}=${wert}: ${JSON.stringify(ist)}`];
      }),
    );
    expect(befunde).toEqual([]);
  });

  it("refuses a value outside the range with the path as field and a calm sentence", () => {
    const befunde = schriftRegler.flatMap((r) =>
      [r.min - r.step, r.max + r.step].flatMap((wert) => {
        const ist = leinwandSchreiben(LUMO, { regler: { pfad: r.path, wert } }, stufoj, katalogo);
        const soll = { speco: "rifuzita", feld: r.path, satz: reglerSatzDe(r) };
        return JSON.stringify(ist) === JSON.stringify(soll) ? [] : [`${r.path}=${wert}`];
      }),
    );
    expect(befunde).toEqual([]);
    const groesse = schriftRegler[0];
    expect(groesse === undefined ? "" : reglerSatzDe(groesse)).toBe(
      `„${groesse?.label}“ ist eine Zahl von ${groesse?.min} bis ${groesse?.max}.`,
    );
  });

  it("calls another path, or a value that is no finite number, malformed", () => {
    const faelle: unknown[] = [
      { regler: { pfad: "form.radius", wert: 1 } },
      { regler: { pfad: "neutral.toenung", wert: 0.5 } },
      { regler: { pfad: "schrift.skala", wert: "1.2" } },
      { regler: { pfad: "schrift.skala", wert: null } },
      { regler: { pfad: "schrift.skala" } },
      { regler: { pfad: "schrift.skala", wert: Number.NaN } },
      { regler: "schrift.skala" },
    ];
    const ist = faelle.map((korpo) => leinwandSchreiben(LUMO, korpo, stufoj, katalogo).speco);
    expect(ist).toEqual(faelle.map(() => "malformita"));
  });
});

describe("Spec 056 T1: {farbe: akzent, herkunft} – Akzent „aus Material“ (D-23)", () => {
  const herkunft = { quelle: "bild", merkmal: "Farbe #c6f135", anteil: 12 };

  it("stores the origin with the Zweitfarbe; the Bildo shows Akzent „aus Material“", () => {
    const a = agordoDe(
      leinwandSchreiben(
        LUMO,
        { farbe: { rolle: "akzent", wert: "#c6f135", herkunft } },
        stufoj,
        katalogo,
      ),
    );
    expect(a.zweitfarbe).toEqual({ farbe: "#c6f135", herkunft });
    const bildo = gestaltenDe(a, { start: LUMO, kabloj: {}, palettes: undefined, rev: 1 });
    const akzent = bildo.nodoj.find((n): n is BildoFarbo => n.id === "farbo-akzent");
    expect(akzent?.stato).toBe("aus-material");
  });

  it("names the colour as the feature when the canvas sends none (as the Enportilo does)", () => {
    const { merkmal: _m, ...ohne } = herkunft;
    const a = agordoDe(
      leinwandSchreiben(
        LUMO,
        { farbe: { rolle: "akzent", wert: "#c6f135", herkunft: ohne } },
        stufoj,
        katalogo,
      ),
    );
    expect(a.zweitfarbe?.herkunft).toEqual({ ...ohne, merkmal: "Farbe #c6f135" });
  });

  it("refuses an origin on any other role or of another shape as malformed", () => {
    const faelle: unknown[] = [
      { farbe: { rolle: "primaer", wert: "#2f5bff", herkunft } },
      { farbe: { rolle: "success", wert: "#2f5bff", herkunft } },
      { farbe: { rolle: "akzent", wert: null, herkunft } },
      { farbe: { rolle: "akzent", wert: "#c6f135", herkunft: { ...herkunft, quelle: "link" } } },
      { farbe: { rolle: "akzent", wert: "#c6f135", herkunft: { ...herkunft, anteil: "12" } } },
      { farbe: { rolle: "akzent", wert: "#c6f135", herkunft: "plakat.png" } },
    ];
    const ist = faelle.map((korpo) => leinwandSchreiben(LUMO, korpo, stufoj, katalogo).speco);
    expect(ist).toEqual(faelle.map(() => "malformita"));
  });

  it("refuses an origin with a file name as malformed; the message does not offer datei (AK-4)", () => {
    const ist = leinwandSchreiben(
      LUMO,
      {
        farbe: { rolle: "akzent", wert: "#c6f135", herkunft: { ...herkunft, datei: "plakat.png" } },
      },
      stufoj,
      katalogo,
    );
    expect(ist.speco).toBe("malformita");
    expect(ist.speco === "malformita" && ist.mesagxo.includes("datei")).toBe(false);
  });
});

describe("Spec 056 T1: without the fourth argument the write path is that of 6d34a75a", () => {
  it("calls schrift and regler malformed and writes Akzent without an origin, as before", () => {
    const [erste] = zweiFamilien();
    expect(
      [
        { schrift: { rolle: "body", tiparo: erste?.id } },
        { regler: { pfad: "schrift.skala", wert: 1.2 } },
      ].map((korpo) => leinwandSchreiben(LUMO, korpo, stufoj)),
    ).toEqual([
      { speco: "malformita", mesagxo: "send exactly one change: farbe, toenung, stufe or neutral" },
      { speco: "malformita", mesagxo: "send exactly one change: farbe, toenung, stufe or neutral" },
    ]);
    const a = agordoDe(
      leinwandSchreiben(
        LUMO,
        { farbe: { rolle: "akzent", wert: "#c6f135", herkunft: { quelle: "bild" } } },
        stufoj,
      ),
    );
    expect(a.zweitfarbe).toEqual({ farbe: "#c6f135" });
  });

  it("gives the same result for every 054/055 change with and without the catalog", () => {
    const korpoj: unknown[] = [
      { farbe: { rolle: "primaer", wert: "#2f5bff" } },
      { farbe: { rolle: "akzent", wert: null } },
      { farbe: { rolle: "warning", wert: "oklch(0.7 0.1 80)" } },
      { farbe: { rolle: "primaer", wert: null } },
      { toenung: 0.4 },
      { toenung: 3 },
      { stufe: { token: "color.palette.accent.500", wert: "#123456", schema: "dunkel" } },
      { neutral: { farbe: "#e8e2d6" } },
      { anders: 1 },
    ];
    const abweichungen = korpoj.filter((korpo) => {
      const ohne = leinwandSchreiben(LUMO, korpo, stufoj);
      const mit = leinwandSchreiben(LUMO, korpo, stufoj, katalogo);
      return ohne.speco === "malformita"
        ? mit.speco !== "malformita"
        : JSON.stringify(ohne) !== JSON.stringify(mit);
    });
    expect(abweichungen).toEqual([]);
  });

  it("no new sentence names a rule or a problem", () => {
    const modelo = buildModelo(loadBases().structure.files).modelo;
    const woerter = [
      ...modelo.reguloj
        .flatMap((r) => [r.name, r.id])
        .filter((w): w is string => typeof w === "string" && w !== ""),
      "Problem",
      "Prüfung",
    ];
    const saetze = schriftRegler.map(reglerSatzDe);
    expect(saetze.flatMap((s) => woerter.filter((w) => s.includes(w)))).toEqual([]);
  });
});
