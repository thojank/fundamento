// Spec 036, Befund B-R1-1 (D-369): Agordo was mapped to the plural „die Einstellungen“, so a singular
// verb after it stayed wrong („Die Einstellungen ist gespeichert.“) and the indefinite article fell
// away. The maintainer decided: Agordo is „die Konfiguration“, singular, in every case. Only the data
// of nutzersprache.json changes; the article code of A-2 stays as it is.

import { reglerOf } from "@fundamento/agordilo";
import { buildModelo, defaultModeloSource, readFacetoj } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { loadBases } from "../vorschau.js";
import { enUzantlingvo, NUTZERSPRACHE, oberflaecheOf } from "./nutzersprache.js";

const bases = loadBases();
const facetoj = readFacetoj(defaultModeloSource().dataDir);
if (facetoj === undefined) throw new Error("facetoj.json fehlt");
const oberflaeche = oberflaecheOf(
  facetoj,
  reglerOf(bases.gestalt),
  buildModelo(bases.structure.files).modelo,
);
const check = (text: string) => enUzantlingvo(text, oberflaeche);

describe("Agordo is „die Konfiguration“, singular (Spec 036, B-R1-1)", () => {
  it("the word and its four cases are singular feminine in the data", () => {
    const { woerter } = NUTZERSPRACHE as {
      woerter?: Record<string, { genus: string; formen: Record<string, string> }>;
    };
    expect(NUTZERSPRACHE.begriffe.Agordo).toBe("Konfiguration");
    expect(woerter?.Agordo?.genus).toBe("f");
    expect(woerter?.Agordo?.formen).toEqual({
      nom: "Konfiguration",
      akk: "Konfiguration",
      dat: "Konfiguration",
      gen: "Konfiguration",
    });
  });

  it("a singular verb fits the word of the screen", () => {
    expect(check("Die Agordo ist gespeichert.")).toBe("Die Konfiguration ist gespeichert.");
    expect(check("Ich habe die Agordo gespeichert.")).toBe(
      "Ich habe die Konfiguration gespeichert.",
    );
  });

  it("the dative and genitive after and without a preposition", () => {
    expect(check("Das steht in der Agordo.")).toBe("Das steht in der Konfiguration.");
    expect(check("Das gehört zu der Agordo.")).toBe("Das gehört zur Konfiguration.");
    expect(check("Der Name der Agordo bleibt.")).toBe("Der Name der Konfiguration bleibt.");
  });

  it("keeps the indefinite article", () => {
    expect(check("Das ist eine Agordo.")).toBe("Das ist eine Konfiguration.");
    expect(check("Das passt zu einer Agordo.")).toBe("Das passt zu einer Konfiguration.");
  });

  it("the bare word without an article", () => {
    expect(check("Agordo gespeichert.")).toBe("Konfiguration gespeichert.");
  });
});
