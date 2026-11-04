// Spec 036 Teil 4 (Schrift): the replacements of the data are webfonts of the catalogue, a CSS
// stack's first family is matched by its name part, and every role is named with its own feature.

import { describe, expect, it } from "vitest";
import { readTiparoj } from "../../tiparoj.js";
import type { Trovo } from "../trovo.js";
import { UEBERNAHME } from "./datoj.js";
import { SCHRIFT } from "./schrift.js";
import type { WertVorschlag } from "./vorschlag.js";

const tiparo = (valoro: string, rolo: "body" | "display" | "code", loko: string): Trovo => ({
  kind: "tiparo",
  valoro,
  rolo,
  pezo: 1,
  herkunft: { dosiero: "https://sablo.example/stilo.css", loko },
});

describe("Schrift: data and roles", () => {
  it("every replacement of the data is a webfont of the catalogue with Latin", () => {
    const catalogue = readTiparoj().tiparoj;
    for (const family of Object.values(UEBERNAHME.schrift.ersatz)) {
      expect(catalogue.find((entry) => entry.family === family)?.scripts).toContain("Latn");
    }
  });

  it("a page: body by a name part, code by its kind, each with its own feature", () => {
    const vorschlag = SCHRIFT.vorschlagOf({
      trovoj: [tiparo("Courier", "body", "Zeile 3"), tiparo("Acme Mono", "code", "Zeile 9")],
      proponoj: [],
      kunteksto: { quelle: "link", adresse: "https://sablo.example/" },
    }) as WertVorschlag;
    expect(vorschlag.wert).toMatchObject({
      body: { familie: "Courier Prime", art: "aehnlich" },
      code: { familie: UEBERNAHME.schrift.ersatz.monospace, art: "aehnlich" },
    });
    expect(vorschlag.herkunft.adresse).toBe("https://sablo.example/stilo.css");
    expect(vorschlag.herkunft.merkmal).toContain("Zeile 3");
    expect(vorschlag.weitere?.[0]?.merkmal).toContain("dicktengleich");
    expect(vorschlag.sicherheit).toBe("niedrig");
  });
});
