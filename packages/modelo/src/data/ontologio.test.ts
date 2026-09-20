// The Ontologio (Spec 002 FR-15, FR-16, plan D-14, AK-07): the Constitution's terminology as data,
// kept in step with the Constitution table and the Modelo schema's entity types.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkOntologio, type OntologioProblem, readOntologio } from "../ontologio/check.js";

const constitution = readFileSync(
  new URL("../../../../.specify/memory/constitution.md", import.meta.url),
  "utf8",
);
const ontologio = readOntologio();

type Concept = Record<string, unknown> & { term: string; uri: string };
const mutate = (change: (copy: { concepts: Concept[]; predicates: { id: string }[] }) => void) => {
  const copy = structuredClone(ontologio) as unknown as {
    concepts: Concept[];
    predicates: { id: string }[];
  };
  change(copy);
  return checkOntologio(copy, constitution);
};
const kinds = (problems: OntologioProblem[]) => [
  ...new Set(problems.map((problem) => problem.check)),
];

describe("ontologio.json (FR-15, FR-16, AK-07)", () => {
  it("passes every drift check against the Constitution and the Modelo schema", () => {
    expect(checkOntologio(ontologio, constitution)).toEqual([]);
  });

  it("holds the 18 terms of the Constitution table and the 5 entity-type concepts", () => {
    const concepts = (ontologio as unknown as { concepts: Concept[] }).concepts;
    expect(concepts.filter((concept) => concept.inScheme === "terminologio")).toHaveLength(18);
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
    expect(concepts.filter((entry) => entry.inScheme === "terminologio")).toHaveLength(18);
  });
});
