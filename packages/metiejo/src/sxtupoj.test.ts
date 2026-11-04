// The screens of the configurator (Spec 023, §3, M-2): one question, at most one main button,
// Zurück and Weiter; no term of the Vortaro outside the link to the Expertenansicht; built from
// Fundamento's own Sxablonoj and Eroj.

import { describe, expect, it } from "vitest";
import { exampleScreenInput, SXTUPOJ, type SxtupoKey, screen, screenInventory } from "./sxtupoj.js";

const KEYS: SxtupoKey[] = [
  "start",
  "farbe",
  "schrift",
  "form",
  "raum",
  "groesse",
  "ikono",
  "vorschau",
  "fertig",
];

describe("the steps of round 1 (§3, §5)", () => {
  it("are start, colour, type, the four of Gestalt, preview and finish, numbered as in the spec", () => {
    expect(SXTUPOJ.map((sxtupo) => sxtupo.key)).toEqual(KEYS);
    expect(SXTUPOJ.map((sxtupo) => sxtupo.spec)).toEqual([1, 3, 4, 5, 5, 5, 5, 6, 7]);
    for (const sxtupo of SXTUPOJ) expect(sxtupo.question, sxtupo.key).toMatch(/\?$/);
  });
});

describe("every screen (M-2)", () => {
  for (const key of KEYS) {
    it(`${key}: one question, at most one main button, Zurück and Weiter where they belong`, () => {
      const html = screen(exampleScreenInput(key));
      const inventory = screenInventory(html);
      expect(inventory.questions, "questions").toBe(1);
      expect(inventory.mainButtons, "main buttons").toBeLessThanOrEqual(1);
      expect(inventory.back, "Zurück").toBe(key !== "start");
      // The start has Anlegen, the finish Speichern as the way on; every other screen has Weiter.
      expect(inventory.next, "Weiter").toBe(key !== "fertig" && key !== "start");
      // The frame of the app and the page come from Fundamento itself (§3): sxelo, pagxo, formularo.
      expect(html).toContain("<fm-sxelo");
      expect(html).toContain("<fm-pagxo");
      expect(html).toContain("<fm-formularo");
      // No native control where an Ero exists; the colour picker and the slider have none (Manko,
      // plan ①) and stay native as in the Werkstatt; links stand only inside the navigado.
      expect(html).not.toMatch(/<(button|select|textarea|h[1-6])\b/);
      for (const [input = ""] of html.matchAll(/<input\b[^>]*>/g)) {
        expect(input).toMatch(/type="(range|color)"/);
      }
      expect(html.replace(/<fm-navigado[\s\S]*?<\/fm-navigado>/g, "")).not.toMatch(/<a\b/);
    });

    it(`${key}: names no term of the Vortaro outside the Expertenansicht`, () => {
      const html = screen(exampleScreenInput(key));
      const visible = screenInventory(html).text;
      for (const term of ["Aspekto", "Agordo", "Regulo", "Jugxo", "Vortaro", "Sxablono"]) {
        expect(visible, term).not.toMatch(new RegExp(`\\b${term}\\b`));
      }
      expect(html).toContain("Expertenansicht");
      expect(html).not.toContain(["cif", "ere", "cigo"].join(""));
    });
  }

  it("shows the step as text and the Vortaro only in the Expertenansicht link", () => {
    const html = screen(exampleScreenInput("farbe"));
    expect(html).toMatch(/Schritt 2 von 9/);
    expect(html).toMatch(/modus=werkstatt/);
  });

  it("the main button of the finish screen is Speichern; the start screen asks for the name and the start", () => {
    expect(screenInventory(screen(exampleScreenInput("fertig"))).mainLabel).toBe("Speichern");
    const start = screen(exampleScreenInput("start"));
    expect(start).toContain('name="name"');
    for (const basis of ["leer", "komuna", "oeffnen"]) expect(start).toContain(`value="${basis}"`);
  });
});

describe("screenInventory", () => {
  it("counts titles of level 1 that end in a question mark and buttons of high emphasis", () => {
    const inventory = screenInventory(
      '<fm-pagxo><fm-titolo slot="title" level="1" focusable>Wie?</fm-titolo><fm-butono emphasis="high">Ja</fm-butono><fm-butono emphasis="low">Zurück</fm-butono><fm-butono emphasis="medium">Weiter</fm-butono></fm-pagxo>',
    );
    expect(inventory).toMatchObject({
      questions: 1,
      mainButtons: 1,
      mainLabel: "Ja",
      back: true,
      next: true,
    });
    expect(inventory.text).toContain("Wie?");
  });
});

describe("K-1 to K-5 of Spec 024 on the screens", () => {
  it("K-1: the start takes the name as written and shows the identifier small", () => {
    const html = screen(exampleScreenInput("start"));
    expect(html).not.toContain("Kleinbuchstaben");
    expect(html).toContain('name="name"');
    expect(html).toContain("Kennung");
    expect(html).toContain("data-mt-kennung");
  });

  it("K-1: a brand with a written name shows it with its identifier", () => {
    const input = exampleScreenInput("farbe");
    if (input.marko !== undefined)
      input.marko.agordo = { ...input.marko.agordo, etikedoj: { marko: "Provo GmbH" } };
    const html = screen(input);
    expect(html).toContain("Provo GmbH");
    expect(html).toContain("(provo)");
  });

  it("K-4: a search without a hit says what to do", () => {
    const input = exampleScreenInput("schrift");
    input.tiparoj = { query: "zzzz", results: [] };
    expect(screen(input)).toMatch(/Keine Schrift/);
  });

  it("K-5: the form is a choice of four, no slider", () => {
    const html = screen(exampleScreenInput("form"));
    expect(html).toContain('<fm-elekto name="form.wahl"');
    for (const value of ["eckig", "leicht", "rund", "ganz-rund"])
      expect(html).toContain(`value="${value}"`);
    expect(html.replace(/<style[\s\S]*?<\/style>/g, "")).not.toContain('type="range"');
  });

  it("every screen of a brand links to the Studio", () => {
    expect(screen(exampleScreenInput("farbe"))).toContain("/studio/provo/");
  });
});

// Spec 024 Runde 2: two font families — the step Schrift asks which role the chosen font takes.
describe("Runde 2: the step Schrift names the role of the font", () => {
  it("offers Anzeige, Fließtext or both beside the search, and keeps one main button", () => {
    const html = screen(exampleScreenInput("schrift"));
    expect(html).toContain('name="rolle"');
    expect(html).toContain('value="display"');
    expect(html).toContain('value="body"');
    expect(html).toContain('value="beide"');
    expect(html).toContain("Anzeige");
    expect(html).toContain("Fließtext");
    expect(screenInventory(html).mainButtons).toBeLessThanOrEqual(1);
  });
});

// Spec 035, Befund 4.5.5 (Art. VI, „Kein Trittbrett“): the placeholder of the brand's name was a
// real, foreign brand. It is an invented name now, roughly checked against known brands.
describe("Spec 035, Befund 4.5.5: the placeholder of the name", () => {
  it("is the invented name Quendolin", () => {
    const html = screen(exampleScreenInput("start"));
    expect(html).toContain(
      '<fm-kampo name="name" required autocomplete="off" placeholder="Quendolin">',
    );
  });
});
