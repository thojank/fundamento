// Spec 058 (MP-2c, T1, MAW-1.1): reading the model's answers leniently (`legiProfil`, `legiNamen`,
// `legiAufbau`). Code fences and text around the object are taken off; every part is read on its
// own: what reads stays, what does not goes into `verworfen` (the calm sentence „Ein Teil des
// Vorschlags ließ sich nicht lesen.“), nothing readable at all is undefined („Die Antwort ließ sich
// nicht lesen.“). A font is a family of the catalog (case ignored), stored as its id. No rule, no
// contrast check, no limit filters a value (Ä-4, AK-2, AK-4). Invented answers only.

import { describe, expect, it } from "vitest";
import { legiAufbau, legiNamen, legiProfil } from "./leinwand-auswertung.js";

const KATALOGO = [
  { id: "inter", family: "Inter" },
  { id: "fraunces", family: "Fraunces" },
  { id: "source-sans-3", family: "Source Sans 3" },
];

const PROFIL = {
  kernsatz: "Licht, das bei jeder Arbeit bleibt.",
  leitgedanken: [
    { titel: "Ehrlich", text: "Wir sagen, was eine Leuchte kann." },
    { titel: "Robust", text: "Gebaut für Späne und Staub." },
    { titel: "Nahbar", text: "Wir kommen in die Werkstatt." },
    { titel: "Vierter", text: "Zu viel." },
  ],
  charakter: ["klar", "warm", "handfest", "ruhig", "genau", "sechstes"],
  passt: ["Werte und Beispiele sind beide ruhig."],
  reibt: ["Die Werte sagen ‚leise‘, die Beispiele sind laut."],
  vorschlag: {
    primaer: { hex: "#2F5BFF", grund: "aus den Beispielen" },
    akzent: { hex: "#ff5a36", grund: "Wärme" },
    neutral: { hex: "#f4f1ea", grund: "ruhiger Grund" },
    schrift: { display: "fraunces", body: "Source Sans 3", grund: "kräftig und lesbar" },
  },
};

const zaun = (wert: unknown): string =>
  `Hier ist das Profil:\n\`\`\`json\n${JSON.stringify(wert, null, 2)}\n\`\`\`\nViel Erfolg!`;

describe("MAW-1.1: legiProfil", () => {
  it("reads a whole answer in code fences: the first three Leitgedanken, five words, catalog ids", () => {
    expect(legiProfil(zaun(PROFIL), KATALOGO)).toEqual({
      kernsatz: "Licht, das bei jeder Arbeit bleibt.",
      leitgedanken: PROFIL.leitgedanken.slice(0, 3),
      charakter: ["klar", "warm", "handfest", "ruhig", "genau"],
      passt: ["Werte und Beispiele sind beide ruhig."],
      reibt: ["Die Werte sagen ‚leise‘, die Beispiele sind laut."],
      vorschlag: {
        primaer: { hex: "#2f5bff", grund: "aus den Beispielen" },
        akzent: { hex: "#ff5a36", grund: "Wärme" },
        neutral: { hex: "#f4f1ea", grund: "ruhiger Grund" },
        schrift: { display: "fraunces", body: "source-sans-3", grund: "kräftig und lesbar" },
      },
    });
    // Without fences, with text around the object.
    expect(legiProfil(`Gern. ${JSON.stringify(PROFIL)} Ende.`, KATALOGO)).toEqual(
      legiProfil(zaun(PROFIL), KATALOGO),
    );
  });

  it("keeps what reads and names the rest in `verworfen` (partly unreadable)", () => {
    const teilweise = {
      ...PROFIL,
      leitgedanken: [{ titel: "Ehrlich", text: "Wir sagen es." }, { titel: "" }, "frei"],
      charakter: "klar, warm",
      vorschlag: {
        primaer: { hex: "blau", grund: "?" },
        akzent: { hex: "#ff5a36", grund: "Wärme" },
        schrift: { display: "Comic Neue", body: "Inter", grund: "?" },
      },
    };
    const profil = legiProfil(JSON.stringify(teilweise), KATALOGO);
    expect(profil?.leitgedanken).toEqual([{ titel: "Ehrlich", text: "Wir sagen es." }]);
    expect(profil?.charakter).toBeUndefined();
    expect(profil?.vorschlag).toEqual({ akzent: { hex: "#ff5a36", grund: "Wärme" } });
    expect(profil?.verworfen).toEqual([
      "leitgedanken",
      "charakter",
      "primaer",
      "neutral",
      "schrift",
    ]);
    expect(profil?.kernsatz).toBe(PROFIL.kernsatz);
  });

  it("maps a font family of the catalog regardless of case; a family outside it is unreadable", () => {
    const schrift = (display: string, body: string) =>
      legiProfil(
        JSON.stringify({ ...PROFIL, vorschlag: { schrift: { display, body, grund: "g" } } }),
        KATALOGO,
      )?.vorschlag?.schrift;
    expect(schrift("FRAUNCES", "inter")).toEqual({
      display: "fraunces",
      body: "inter",
      grund: "g",
    });
    expect(schrift("source sans 3", "Inter")).toEqual({
      display: "source-sans-3",
      body: "inter",
      grund: "g",
    });
    expect(schrift("Lumeta Grotesk", "Inter")).toBeUndefined();
  });

  it("filters no value by a rule, a contrast or a limit (Ä-4)", () => {
    const ohneKontrast = {
      kernsatz: "x",
      vorschlag: {
        primaer: { hex: "#ffffff", grund: "weiß" },
        akzent: { hex: "#ffffff", grund: "wie Primär" },
        neutral: { hex: "#fffffe", grund: "fast weiß" },
      },
      charakter: ["laut", "laut", "laut"],
    };
    const profil = legiProfil(JSON.stringify(ohneKontrast), KATALOGO);
    expect(profil?.vorschlag).toEqual({
      primaer: { hex: "#ffffff", grund: "weiß" },
      akzent: { hex: "#ffffff", grund: "wie Primär" },
      neutral: { hex: "#fffffe", grund: "fast weiß" },
    });
    expect(profil?.charakter).toEqual(["laut", "laut", "laut"]);
  });

  it("is undefined for an answer that does not read at all", () => {
    for (const antwort of [
      "Das kann ich nicht.",
      "",
      "{}",
      "[1, 2]",
      '{"kernsatz": 3}',
      "```json\n{kaputt\n```",
    ])
      expect(legiProfil(antwort, KATALOGO)).toBeUndefined();
  });
});

describe("MAW-1.1: legiNamen", () => {
  const namen = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      name: `Lichtwerk ${i + 1}`,
      grund: `aus Eingabe ${i + 1}`,
    }));

  it("reads six to eight names with their reason and the improved description", () => {
    expect(
      legiNamen(zaun({ namen: namen(7), beschreibung: "lumeto macht Werkstätten hell." })),
    ).toEqual({ namen: namen(7), beschreibung: "lumeto macht Werkstätten hell." });
    expect(legiNamen(JSON.stringify({ namen: namen(10), beschreibung: "b" }))?.namen).toEqual(
      namen(8),
    );
  });

  it("keeps fewer names when some do not read, and says so", () => {
    const vorschlag = legiNamen(
      JSON.stringify({ namen: [...namen(4), { grund: "ohne Namen" }, "Text"], beschreibung: "b" }),
    );
    expect(vorschlag).toEqual({ namen: namen(4), beschreibung: "b", verworfen: ["namen"] });
    expect(legiNamen(JSON.stringify({ namen: namen(6) }))).toEqual({
      namen: namen(6),
      verworfen: ["beschreibung"],
    });
    expect(legiNamen(JSON.stringify({ beschreibung: "nur die" }))).toEqual({
      namen: [],
      beschreibung: "nur die",
      verworfen: ["namen"],
    });
  });

  it("is undefined when nothing reads", () => {
    for (const antwort of ["keine Ideen", "{}", '{"namen": "viele"}', "null"])
      expect(legiNamen(antwort)).toBeUndefined();
  });
});

describe("MAW-1.1: legiAufbau", () => {
  it("reads the five features and the words", () => {
    const merkmale = {
      titelbild: "gross",
      inhalt: "karten",
      dichte: "luftig",
      achse: "mittig",
      schrift: "gross",
    };
    expect(legiAufbau(zaun({ merkmale, worte: "Großes Bild, drei Karten." }))).toEqual({
      merkmale,
      worte: "Großes Bild, drei Karten.",
    });
  });

  it("makes only the one feature unreadable that has a value outside its list", () => {
    expect(
      legiAufbau(
        JSON.stringify({
          merkmale: {
            titelbild: "riesig",
            inhalt: "liste",
            dichte: "dicht",
            achse: 1,
            schrift: "zurueckhaltend",
          },
          worte: "Eine Liste.",
        }),
      ),
    ).toEqual({
      merkmale: { inhalt: "liste", dichte: "dicht", schrift: "zurueckhaltend" },
      worte: "Eine Liste.",
      verworfen: ["titelbild", "achse"],
    });
  });

  it("is undefined when nothing reads", () => {
    for (const antwort of ["ein Bild", "{}", '{"merkmale": {"titelbild": "riesig"}}'])
      expect(legiAufbau(antwort)).toBeUndefined();
  });
});
