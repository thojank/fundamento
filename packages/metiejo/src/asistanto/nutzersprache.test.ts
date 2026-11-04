// Spec 036, Befund 1.3: the check of an answer, alone – what it keeps, what it maps, what it drops.

import { reglerOf } from "@fundamento/agordilo";
import { buildModelo, defaultModeloSource, readFacetoj } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { loadBases } from "../vorschau.js";
import { enUzantlingvo, NUTZERSPRACHE, oberflaecheOf, systemAsistantoOf } from "./nutzersprache.js";

const bases = loadBases();
const facetoj = readFacetoj(defaultModeloSource().dataDir);
if (facetoj === undefined) throw new Error("facetoj.json fehlt");
const regloj = reglerOf(bases.gestalt);
const oberflaeche = oberflaecheOf(facetoj, regloj, buildModelo(bases.structure.files).modelo);
const check = (text: string) => enUzantlingvo(text, oberflaeche);

describe("the words of the screen as data (Spec 036, Befund 1.3)", () => {
  it("every step and every slider has its word from its own data", () => {
    for (const faceto of facetoj.facetoj)
      expect(oberflaeche.begriffe.get(faceto.name)).toBe(`„${faceto.nomo.de}“`);
    for (const regler of regloj)
      expect(oberflaeche.begriffe.get(regler.path)).toBe(`„${regler.label}“`);
    for (const [term, wort] of Object.entries(NUTZERSPRACHE.begriffe))
      expect(oberflaeche.begriffe.get(term)).toBe(wort);
  });

  it("the token names of the Modelo are known with their prefixes", () => {
    expect(oberflaeche.tokenoj.has("radius.role.control")).toBe(true);
    expect(oberflaeche.tokenoj.has("color.brand")).toBe(true);
    expect(oberflaeche.tokenoj.has("d.h")).toBe(false);
  });
});

describe("the check of an answer (Spec 036, Befund 1.3)", () => {
  it("a sentence without internal terms stays as it is, line breaks and Markdown included", () => {
    const text =
      "Die Ecken sind **runder**, d.h. weicher.\n\n- Radius 1,5\n- siehe https://marko.example/";
    expect(check(text)).toBe(text);
  });

  it("replaces a term in backticks without the backticks", () => {
    expect(check("Ich habe `raum.abstand` erhöht.")).toBe("Ich habe „Abstand“ erhöht.");
  });

  it("leaves out a tool name or a token in parentheses, and keeps the sentence", () => {
    expect(check("Wähle „Pille“ (waehle_form). Fertig.")).toBe("Wähle „Pille“. Fertig.");
    expect(check("Die Pille (radius.full) ist gewählt.")).toBe("Die Pille ist gewählt.");
  });

  it("drops a sentence with a tool name, a token or a term without a word, and nothing else", () => {
    expect(check("Erst. Ich rufe setze_regler auf. Dann.")).toBe("Erst. Dann.");
    expect(check("Erst. Das steht im Vortaro. Dann.")).toBe("Erst. Dann.");
    expect(check("Erst. color.brand.fill ist blau. Dann.")).toBe("Erst. Dann.");
  });

  it("maps a phrase with its article before the bare word", () => {
    expect(check("Die Faceto spaco ist offen.")).toBe("Der Schritt „Raum und Dichte“ ist offen.");
  });
});

// Nachbesserung 02.11., A-2: „die Kroniko“ became „die Protokoll“. The word of the screen brings its
// own article: the article before the term is replaced with the term, in its case.
describe("the article goes with the word of the screen (Spec 036, Befund 1.3, A-2)", () => {
  it("every term with forms has its word in four cases, the bare word as in begriffe", () => {
    const { woerter } = NUTZERSPRACHE as {
      woerter?: Record<string, { formen: Record<string, string> }>;
    };
    for (const term of ["Kroniko", "Agordo", "Aspekto"]) {
      const eintrag = woerter?.[term];
      expect(eintrag, term).toBeDefined();
      expect(Object.keys(eintrag?.formen ?? {}).sort(), term).toEqual(["akk", "dat", "gen", "nom"]);
      expect(eintrag?.formen.nom, term).toBe(NUTZERSPRACHE.begriffe[term]);
    }
  });

  it("Kroniko: the article of the Protokoll, capitalised at the start of a sentence", () => {
    expect(check("Die Kroniko zeigt jede Änderung.")).toBe("Das Protokoll zeigt jede Änderung.");
    expect(check("Das steht in der Kroniko.")).toBe("Das steht im Protokoll.");
    expect(check("In der Kroniko steht es.")).toBe("Im Protokoll steht es.");
    expect(check("Der letzte Eintrag der Kroniko ist neu.")).toBe(
      "Der letzte Eintrag des Protokolls ist neu.",
    );
    expect(check("Das ist eine Kroniko.")).toBe("Das ist ein Protokoll.");
  });

  it("Agordo: the article of the Konfiguration (B-R1-1)", () => {
    expect(check("Ich habe die Agordo gespeichert.")).toBe(
      "Ich habe die Konfiguration gespeichert.",
    );
    expect(check("Das steht in der Agordo.")).toBe("Das steht in der Konfiguration.");
  });

  it("Aspekto: the article of the Marke, whatever article the model used", () => {
    expect(check("Das Aspekto ist fertig.")).toBe("Die Marke ist fertig.");
    expect(check("Der Aspekto passt.")).toBe("Die Marke passt.");
    expect(check("Das passt zu dem Aspekto.")).toBe("Das passt zur Marke.");
  });
});

describe("the system text (Spec 036, Befund 1.3)", () => {
  it("names the current step by its word and its internal name only for the tools", () => {
    const formo = facetoj.facetoj.find((faceto) => faceto.name === "formo");
    const text = systemAsistantoOf(facetoj, regloj, formo);
    expect(text).toContain("Aktueller Schritt: „Form (Radien)“ (für die Werkzeuge: formo).");
    expect(text).not.toMatch(/\bFacet(o|oj)\b|Vortaro|Agordilo|Reguloj/);
  });
});
