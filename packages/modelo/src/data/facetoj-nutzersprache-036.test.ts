// Spec 036 (QA run 1, web issue 2; Teil 1, 1.3 user words): the names and reasons of the Facetoj are
// shown to the person on the steps of the assistant („Leitfarbe und Akzente“ shows its Kialo). They
// cite no spec and no decision; those references live in the plan, not in the data.

import { describe, expect, it } from "vitest";
import { readFacetoj } from "../facetoj/facetoj.js";

const dataDir = new URL("../../data/", import.meta.url).pathname;
const facetoj = readFacetoj(dataDir)?.facetoj ?? [];
const INTERN = /\bSpec \d{3}\b|\bV-\d\b/;

describe("data/facetoj.json in user words (Spec 036, 1.3)", () => {
  it("has Facetoj to check", () => {
    expect(facetoj.length).toBeGreaterThan(0);
  });

  it("no name and no reason of a Faceto cites a spec or a decision", () => {
    const found = facetoj.flatMap((faceto) =>
      [faceto.nomo.de, faceto.nomo.en, faceto.kialo]
        .filter((text): text is string => typeof text === "string" && INTERN.test(text))
        .map((text) => `${faceto.name}: ${INTERN.exec(text)?.[0]}`),
    );
    expect(found).toEqual([]);
  });
});
