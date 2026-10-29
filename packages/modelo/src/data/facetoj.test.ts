// Spec 033 S1: the brand model, scope 1 (visual) – every visual aspect of a brand as data in the
// Modelo (data/facetoj.json), each with an ID (Regel 0.1), a weight with its Kialo and the tokens
// it owns. The list is complete against the Vortaro: every token of a brand belongs to exactly one
// Faceto; an Ero-Tokeno belongs where its alias chain leads.

import { describe, expect, it } from "vitest";
import { ENTITY_ID_PREFIXES, ULID_PATTERN_SOURCE } from "../contracts/entity-ids.js";
import { OPTIONAL_DATA_FILE_SCHEMA_DEFS } from "../contracts/schema.js";
import { checkFacetoj, facetojOfToken, readFacetoj } from "../facetoj/facetoj.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const dataDir = new URL("../../data/", import.meta.url).pathname;
const facetoj = readFacetoj(dataDir);
const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo did not load");
const core = modelo.setoj.find((set) => set.name === "core")?.tokens ?? {};

describe("data/facetoj.json (Spec 033 S1)", () => {
  it("is an optional data file of the Modelo with its own schema and the ID prefix fac", () => {
    expect(OPTIONAL_DATA_FILE_SCHEMA_DEFS["facetoj.json"]).toBe("FacetojFile");
    expect(ENTITY_ID_PREFIXES.faceto).toBe("fac");
  });

  it("names the twelve visual aspects of scope 1, in the order of the spec, in the layer vida", () => {
    expect(facetoj?.tavolo).toBe("vida");
    expect(facetoj?.facetoj.map((faceto) => [faceto.name, faceto.nomo.de])).toEqual([
      ["gvidkoloro", "Leitfarbe und Akzente"],
      ["neutralaj", "Neutraltöne"],
      ["statoj", "Statusfarben"],
      ["modoj", "Dunkelmodus und hoher Kontrast"],
      ["tiparo", "Schriftfamilien, Schriftskala und Gewichte"],
      ["formo", "Form (Radien)"],
      ["spaco", "Raum und Dichte"],
      ["elevacio", "Elevation"],
      ["movo", "Bewegung"],
      ["fokuso", "Fokus"],
      ["grandoj", "Elementgrößen"],
      ["ikonoj", "Icons (Set und Stil)"],
    ]);
  });

  it("gives every Faceto an ID, an English name, a weight and the weight's Kialo", () => {
    const id = new RegExp(`^fac_${ULID_PATTERN_SOURCE}$`);
    for (const faceto of facetoj?.facetoj ?? []) {
      expect(faceto.id, faceto.name).toMatch(id);
      expect(faceto.nomo.en.length, faceto.name).toBeGreaterThan(2);
      expect(faceto.pezo, faceto.name).toBeGreaterThan(0);
      expect(faceto.kialo.length, faceto.name).toBeGreaterThan(40);
    }
  });

  it("assigns every token of the core to exactly one Faceto, Ero-Tokens along their alias chain", () => {
    if (facetoj === undefined) throw new Error("no facetoj.json");
    const wrong = Object.keys(core)
      .map((name) => [name, facetojOfToken(facetoj, core, name)] as const)
      .filter(([, owners]) => owners.length !== 1)
      .map(([name, owners]) => `${name}: ${owners.join(", ") || "none"}`);
    expect(wrong).toEqual([]);
    expect(Object.keys(core).length).toBeGreaterThan(1500);
    expect(checkFacetoj(modelo, facetoj)).toEqual([]);
  });

  it("the modes Faceto owns no core token: it is the Dimensioj color-scheme and contrast", () => {
    if (facetoj === undefined) throw new Error("no facetoj.json");
    const modoj = facetoj.facetoj.find((faceto) => faceto.name === "modoj");
    expect(modoj?.dimensioj).toEqual(["color-scheme", "contrast"]);
    expect(modoj?.tokenoj).toEqual([]);
    const owned = Object.keys(core).filter((name) =>
      facetojOfToken(facetoj, core, name).includes("modoj"),
    );
    expect(owned).toEqual([]);
  });

  it("checkFacetoj reports a token without a Faceto and a token that two Facetoj claim", () => {
    if (facetoj === undefined) throw new Error("no facetoj.json");
    const without = {
      ...facetoj,
      facetoj: facetoj.facetoj.map((faceto) =>
        faceto.name === "movo" ? { ...faceto, tokenoj: [] } : faceto,
      ),
    };
    expect(checkFacetoj(modelo, without).map((issue) => issue.rule)).toContain(
      "faceto-token-unassigned",
    );
    const twice = {
      ...facetoj,
      facetoj: facetoj.facetoj.map((faceto) =>
        faceto.name === "fokuso" ? { ...faceto, tokenoj: [...faceto.tokenoj, "motion"] } : faceto,
      ),
    };
    expect(checkFacetoj(modelo, twice).map((issue) => issue.rule)).toContain("faceto-token-twice");
  });
});
