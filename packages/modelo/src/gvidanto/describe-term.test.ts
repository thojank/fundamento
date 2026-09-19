// describe_term (Spec 002 FR-12, plan D-14): a term of the Ontologio with its instances in the
// served Modelo.

import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { projectModeloSource } from "../load/source.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";
import { type DescribeTermOutput, describeTerm } from "./describe-term.js";

const config = `${fixtureRoot("valid", "aspekto-ekzemplo")}/fundamento.config.json`;
const { modelo } = loadModelo(projectModeloSource(config));
if (modelo === undefined) throw new Error("core + ekzemplo must load");

function success(term: string): DescribeTermOutput {
  if (modelo === undefined) throw new Error("unreachable");
  const result = describeTerm(modelo, { term });
  if (!result.ok) throw new Error(JSON.stringify(result.issues));
  return result.output;
}

describe("describe_term (FR-12)", () => {
  it("describes Aspekto with its broader term, relations and the loaded Aspektoj", () => {
    const out = success("Aspekto");
    expect(out).toMatchObject({
      term: "Aspekto",
      uri: "https://fundamento.ciferecigo.com/ontologio#Aspekto",
      inScheme: "terminologio",
      matchedBy: "term",
      broader: [{ term: "Modelo", uri: "https://fundamento.ciferecigo.com/ontologio#Modelo" }],
      instances: { count: 2, names: ["ekzemplo", "komuna"] },
    });
    expect(out.relations).toContainEqual({
      predicate: "assigns",
      target: { term: "Vortaro", uri: "https://fundamento.ciferecigo.com/ontologio#Vortaro" },
    });
    expect(out.definition.de).toContain("Marke");
  });

  it.each([
    ["Marke", "altLabel"],
    ["brand", "altLabel"],
    ["aspekto", "term"],
    ["Markenausprägung", "prefLabel"],
  ])("finds Aspekto from %s (%s)", (word, matchedBy) => {
    expect(success(word)).toMatchObject({ term: "Aspekto", matchedBy });
  });

  it("folds Esperanto letters to the x-convention (Juĝo → Jugxo, Ŝablono → Sxablono)", () => {
    expect(success("Juĝo").term).toBe("Jugxo");
    expect(success("Ŝablono").term).toBe("Sxablono");
  });

  it.each([
    ["Regulo", modelo.reguloj.length],
    ["Dimensio", modelo.dimensioj.length],
    ["KontrastParo", modelo.kontrastParoj.length],
    ["Ero", 0],
  ])("counts the instances of %s", (term, count) => {
    expect(success(term).instances?.count).toBe(count);
  });

  it("has no instances for a concept without them", () => {
    expect(success("Gvidanto").instances).toBeUndefined();
  });

  it("answers an unknown term with term-unknown and up to five nearest terms", () => {
    if (modelo === undefined) throw new Error("unreachable");
    const result = describeTerm(modelo, { term: "Aspektoo" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.rule).toBe("term-unknown");
      expect(result.allowed?.[0]).toBe("Aspekto");
      expect(result.allowed?.length).toBeLessThanOrEqual(5);
    }
  });
});
