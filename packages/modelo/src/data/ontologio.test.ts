// The Ontologio (Spec 002 FR-15, FR-16, plan D-14, AK-07): the Constitution's terminology as data,
// kept in step with the Constitution table and the Modelo schema's entity types.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { checkOntologio, type OntologioProblem, readOntologio } from "../ontologio/check.js";

const constitution = readFileSync(
  new URL("../../../../.specify/memory/constitution.md", import.meta.url),
  "utf8",
);
const ontologio = readOntologio();
// Spec 008 (D-15): the scheme eroj is checked against the Eroj of the repo Modelo.
const { modelo } = loadModelo(defaultModeloSource());
const eroNames = (modelo?.eroj ?? []).map((entry) => entry.ero.name);

type Concept = Record<string, unknown> & { term: string; uri: string };
const mutate = (change: (copy: { concepts: Concept[]; predicates: { id: string }[] }) => void) => {
  const copy = structuredClone(ontologio) as unknown as {
    concepts: Concept[];
    predicates: { id: string }[];
  };
  change(copy);
  return checkOntologio(copy, constitution, eroNames);
};
const kinds = (problems: OntologioProblem[]) => [
  ...new Set(problems.map((problem) => problem.check)),
];

describe("ontologio.json (FR-15, FR-16, AK-07)", () => {
  it("passes every drift check against the Constitution and the Modelo schema", () => {
    expect(checkOntologio(ontologio, constitution, eroNames)).toEqual([]);
  });

  it("holds the 20 terms of the Constitution table and the 5 entity-type concepts", () => {
    const concepts = (ontologio as unknown as { concepts: Concept[] }).concepts;
    expect(concepts.filter((concept) => concept.inScheme === "terminologio")).toHaveLength(20);
    expect(
      concepts
        .filter((concept) => concept.inScheme === "modelo")
        .map((concept) => concept.term)
        .sort(),
    ).toEqual(["DimensioValoro", "KontrastParo", "Regulo", "Token", "TokenSet"]);
  });

  it.each([
    [
      "a term missing from the file",
      (c: { concepts: Concept[] }) =>
        c.concepts.splice(
          c.concepts.findIndex((x) => x.term === "Tavolo"),
          1,
        ),
      "table-term-missing",
    ],
    [
      "an extra terminologio term",
      (c: { concepts: Concept[] }) =>
        c.concepts.push({
          ...structuredClone(c.concepts[0] as Concept),
          term: "Kromajxo",
          uri: "https://fundamento.ciferecigo.com/ontologio#Kromajxo",
        }),
      "table-term-extra",
    ],
    [
      "an entity type without notation",
      (c: { concepts: Concept[] }) => {
        delete (c.concepts.find((x) => x.term === "Ero") as Concept).notation;
      },
      "entity-type-missing",
    ],
    [
      "a duplicate URI",
      (c: { concepts: Concept[] }) => {
        (c.concepts.find((x) => x.term === "Ero") as Concept).uri =
          "https://fundamento.ciferecigo.com/ontologio#Skemo";
      },
      "uri",
    ],
    [
      "a dangling broader",
      (c: { concepts: Concept[] }) => {
        (c.concepts.find((x) => x.term === "Ero") as Concept).broader = ["#Nenio"];
      },
      "reference",
    ],
    [
      "an undeclared predicate",
      (c: { concepts: Concept[] }) => {
        (c.concepts.find((x) => x.term === "Aspekto") as Concept).relations = [
          { predicate: "owns", target: "#Vortaro" },
        ];
      },
      "reference",
    ],
    [
      "a schema violation",
      (c: { concepts: Concept[] }) => {
        (c.concepts[0] as Concept).prefLabel = { eo: "Fundamento" };
      },
      "schema",
    ],
  ])("fails on %s", (_label, change, kind) => {
    expect(kinds(mutate(change as never))).toContain(kind);
  });

  it("fails on a broader cycle", () => {
    const problems = mutate((copy) => {
      (copy.concepts.find((x) => x.term === "Modelo") as Concept).broader = ["#Vortaro"];
    });
    expect(kinds(problems)).toContain("cycle");
  });
});

describe("ontologio: the principle Fluida Marko (Spec 004 T005)", () => {
  const concepts = (ontologio as unknown as { concepts: Concept[] }).concepts;
  const schemes = (ontologio as unknown as { schemes: { id: string }[] }).schemes;

  it("carries a scheme for principles", () => {
    expect(schemes.map((scheme) => scheme.id)).toContain("principoj");
  });

  it("states Fluida Marko with its definition and its sources", () => {
    const concept = concepts.find((entry) => entry.term === "FluidaMarko") as unknown as
      | { inScheme: string; prefLabel: Record<string, string>; definition: Record<string, string> }
      | undefined;
    expect(concept?.inScheme).toBe("principoj");
    expect(concept?.prefLabel.eo).toBe("Fluida Marko");
    expect(concept?.definition.de).toContain("Reguloj erzwingen Zugänglichkeit und Struktur");
    expect(concept?.definition.de).toContain("Aspiroj sind Sache der Marke");
    expect(JSON.stringify(concept)).toContain("docs/vojmapo.md");
    expect(JSON.stringify(concept)).toContain("docs/vizio.md");
  });

  it("keeps the principle out of the Constitution terminology for now", () => {
    expect(concepts.filter((entry) => entry.inScheme === "terminologio")).toHaveLength(20);
  });
});

// Spec 008 T009 (A8, plan D-15): the Eroj of the Modelo as concepts of the scheme eroj, each with
// its relation to the other, kept in step with data/eroj.
describe("the scheme eroj (Spec 008 T009)", () => {
  const concepts = (ontologio as unknown as { concepts: Concept[] }).concepts;
  const eroj = concepts.filter((concept) => concept.inScheme === "eroj");

  it("holds one concept per Ero of the Modelo, under #Ero, related to each other", () => {
    expect(eroNames).toEqual([
      "avizo",
      "butono",
      "dialogo",
      "elektilo",
      "elekto",
      "insigno",
      "kampo",
      "ligilo",
      "markobutono",
      "plenstato",
      "sxaltilo",
      "tekstareo",
    ]);
    expect(eroj.map((concept) => concept.term).sort()).toEqual([
      "Avizo",
      "Butono",
      "Dialogo",
      "Elektilo",
      "Elekto",
      "Insigno",
      "Kampo",
      "Ligilo",
      "Markobutono",
      "Plenstato",
      "Sxaltilo",
      "Tekstareo",
    ]);
    for (const concept of eroj) {
      expect(concept.broader).toEqual(["#Ero"]);
      expect(concept.notation).toBeUndefined();
    }
    const relations = (term: string) =>
      (eroj.find((concept) => concept.term === term)?.relations ?? []) as {
        predicate: string;
        target: string;
      }[];
    expect(relations("Ligilo")).toEqual([{ predicate: "references", target: "#Butono" }]);
    // Spec 010 ③: the butono and the kampo send choose-few to the radio group; ④ choose-many to
    // the select.
    // Spec 011 ②: the butono sends a confirmation question to the dialogo, the kampo several
    // lines to the tekstareo.
    expect(relations("Butono")).toEqual([
      { predicate: "references", target: "#Ligilo" },
      { predicate: "references", target: "#Kampo" },
      { predicate: "references", target: "#Sxaltilo" },
      { predicate: "references", target: "#Elekto" },
      { predicate: "references", target: "#Elektilo" },
      { predicate: "references", target: "#Dialogo" },
      { predicate: "references", target: "#Plenstato" },
    ]);
    expect(relations("Kampo")).toEqual([
      { predicate: "references", target: "#Butono" },
      { predicate: "references", target: "#Sxaltilo" },
      { predicate: "references", target: "#Elekto" },
      { predicate: "references", target: "#Elektilo" },
      { predicate: "references", target: "#Tekstareo" },
    ]);
    // Spec 010 ①: the switch, with its German and English names (Schalter, switch); since ② it
    // sends a setting that applies only with the form to the checkbox.
    expect(relations("Sxaltilo")).toEqual([
      { predicate: "references", target: "#Butono" },
      { predicate: "references", target: "#Kampo" },
      { predicate: "references", target: "#Markobutono" },
      { predicate: "references", target: "#Dialogo" },
    ]);
    const sxaltilo = eroj.find((concept) => concept.term === "Sxaltilo");
    expect(sxaltilo?.prefLabel).toEqual({ eo: "Sxaltilo", en: "switch", de: "Schalter" });
    expect((sxaltilo?.definition as { en: string } | undefined)?.en).not.toMatch(/coming/);
    // Spec 010 ②: the checkbox (Kontrollkästchen, checkbox), with the switch it answers to and
    // the Eroj it stands with in a form.
    expect(relations("Markobutono")).toEqual([
      { predicate: "references", target: "#Sxaltilo" },
      { predicate: "references", target: "#Kampo" },
      { predicate: "references", target: "#Butono" },
      { predicate: "references", target: "#Elekto" },
      { predicate: "references", target: "#Dialogo" },
    ]);
    const markobutono = eroj.find((concept) => concept.term === "Markobutono");
    expect(markobutono?.prefLabel).toEqual({
      eo: "Markobutono",
      en: "checkbox",
      de: "Kontrollkästchen",
    });
    expect((markobutono?.altLabel as { de: string[] } | undefined)?.de).toContain("Checkbox");
    // Spec 010 ③: the radio group (Auswahl, radio group), with the Eroj that send one of a few
    // options to it.
    // Spec 010 ④: the radio group sends six options or more to the select.
    expect(relations("Elekto")).toEqual([
      { predicate: "references", target: "#Butono" },
      { predicate: "references", target: "#Kampo" },
      { predicate: "references", target: "#Markobutono" },
      { predicate: "references", target: "#Elektilo" },
    ]);
    const elekto = eroj.find((concept) => concept.term === "Elekto");
    expect(elekto?.prefLabel).toEqual({ eo: "Elekto", en: "radio group", de: "Auswahl" });
    expect((elekto?.altLabel as { de: string[] } | undefined)?.de).toContain("Radio-Gruppe");
    expect((elekto?.definition as { en: string } | undefined)?.en).not.toMatch(/not yet covered/);
    // Spec 010 ④: the select (Auswahlliste, select), with the Eroj that send many options to it;
    // "Dropdown" finds it (describe_term), the word an agent asks for (Gvidanto question).
    expect(relations("Elektilo")).toEqual([
      { predicate: "references", target: "#Butono" },
      { predicate: "references", target: "#Kampo" },
      { predicate: "references", target: "#Elekto" },
    ]);
    const elektilo = eroj.find((concept) => concept.term === "Elektilo");
    expect(elektilo?.prefLabel).toEqual({ eo: "Elektilo", en: "select", de: "Auswahlliste" });
    expect((elektilo?.altLabel as { de: string[] } | undefined)?.de).toContain("Dropdown");
    expect((elektilo?.altLabel as { en: string[] } | undefined)?.en).toContain("dropdown");
  });

  it("reports an Ero without a concept and a concept without an Ero", () => {
    expect(
      kinds(
        mutate((copy) => {
          copy.concepts = copy.concepts.filter((concept) => concept.term !== "Ligilo");
        }),
      ),
    ).toContain("ero-concept-missing");
    expect(
      kinds(
        mutate((copy) => {
          copy.concepts.push({
            ...(copy.concepts.find((concept) => concept.term === "Ligilo") as Concept),
            term: "Tabelo",
            uri: "https://fundamento.ciferecigo.com/ontologio#Tabelo",
            relations: [],
          });
        }),
      ),
    ).toContain("ero-concept-extra");
    // Without the Ero names the scheme is not judged (a caller without a Modelo).
    expect(checkOntologio(ontologio, constitution)).toEqual([]);
  });
});
