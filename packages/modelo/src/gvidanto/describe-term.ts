// describe_term (Spec 002 FR-12; plan D-14): a term of the Ontologio, found by its term or any
// label, with its definition, broader terms and relations, plus its instances in the served
// Modelo where it has them. Pure apart from reading the Ontologio file once.

import type { ValidationIssue } from "../contracts/issues.js";
import type { Modelo } from "../contracts/modelo.js";
import { ASPEKTO_DIMENSIO } from "../load/build.js";
import { type Ontologio, type OntologioConcept, readOntologio } from "../ontologio/check.js";
import { nearestNames } from "./nearest.js";

export interface DescribeTermInput {
  term: string;
}

type Ref = { term: string; uri: string };

export interface DescribeTermOutput {
  term: string;
  uri: string;
  inScheme: string;
  notation?: string;
  prefLabel: OntologioConcept["prefLabel"];
  altLabel?: OntologioConcept["altLabel"];
  definition: OntologioConcept["definition"];
  broader: Ref[];
  related: Ref[];
  relations: { predicate: string; target: Ref }[];
  matchedBy: "term" | "prefLabel" | "altLabel";
  instances?: { count: number; names?: string[] };
}

export type DescribeTermResult =
  | { ok: true; output: DescribeTermOutput }
  | { ok: false; issues: ValidationIssue[]; allowed?: string[] };

const X_CONVENTION: Readonly<Record<string, string>> = {
  ĉ: "cx",
  ĝ: "gx",
  ĥ: "hx",
  ĵ: "jx",
  ŝ: "sx",
  ŭ: "ux",
};

/** Lower case, Esperanto letters in x-convention (Ĵuĝo → jugxo). */
function fold(word: string): string {
  return [...word.trim().toLowerCase()].map((char) => X_CONVENTION[char] ?? char).join("");
}

let ontologio: Ontologio | undefined;

const MAX_NAMES = 50;
const listed = (names: readonly string[]) => {
  const sorted = [...names].sort();
  return { count: sorted.length, names: sorted.slice(0, MAX_NAMES) };
};

/** Instances in the served Modelo for the concepts that have them (contracts §2.4). */
function instancesOf(modelo: Modelo, term: string): DescribeTermOutput["instances"] {
  switch (term) {
    case "Aspekto":
      return listed(
        modelo.dimensioj
          .find((dimensio) => dimensio.name === ASPEKTO_DIMENSIO)
          ?.valoroj.map((valoro) => valoro.name) ?? [],
      );
    case "Dimensio":
      return listed(modelo.dimensioj.map((dimensio) => dimensio.name));
    case "DimensioValoro":
      return listed(
        modelo.dimensioj.flatMap((dimensio) =>
          dimensio.valoroj.map((valoro) => `${dimensio.name}=${valoro.name}`),
        ),
      );
    case "Regulo":
      return listed(modelo.reguloj.map((regulo) => regulo.name));
    case "Jugxo":
      return { count: modelo.jugxoj.length };
    case "KontrastParo":
      return listed(modelo.kontrastParoj.map((pair) => pair.name));
    case "Token":
      return {
        count: Object.keys(modelo.setoj.find((set) => set.name === "core")?.tokens ?? {}).length,
      };
    case "TokenSet":
      return listed(modelo.setoj.map((set) => set.name));
    case "Ero":
    case "Skemo":
    case "Sxablono":
      return { count: 0 };
    default:
      return undefined;
  }
}

export function describeTerm(modelo: Modelo, input: DescribeTermInput): DescribeTermResult {
  ontologio ??= readOntologio();
  const concepts = ontologio.concepts;
  const wanted = fold(input.term);
  const labels = (concept: OntologioConcept) => Object.values(concept.prefLabel);
  const altLabels = (concept: OntologioConcept) => Object.values(concept.altLabel ?? {}).flat();
  let concept: OntologioConcept | undefined;
  let matchedBy: DescribeTermOutput["matchedBy"] = "term";
  concept = concepts.find((candidate) => fold(candidate.term) === wanted);
  if (concept === undefined) {
    matchedBy = "prefLabel";
    concept = concepts.find((candidate) =>
      labels(candidate).some((label) => fold(label) === wanted),
    );
  }
  if (concept === undefined) {
    matchedBy = "altLabel";
    concept = concepts.find((candidate) =>
      altLabels(candidate).some((label) => fold(label) === wanted),
    );
  }
  if (concept === undefined) {
    const termOf = new Map<string, string>();
    for (const candidate of concepts) {
      for (const label of [candidate.term, ...labels(candidate), ...altLabels(candidate)]) {
        if (!termOf.has(fold(label))) termOf.set(fold(label), candidate.term);
      }
    }
    const nearest = nearestNames(wanted, [...termOf.keys()], 20).map(
      (label) => termOf.get(label) ?? label,
    );
    return {
      ok: false,
      issues: [
        {
          rule: "term-unknown",
          severity: "error",
          path: "describe_term/term",
          message: `The Ontologio has no term or label ${input.term}.`,
          suggestion:
            "Use one of the nearest terms in allowed; terms are in Esperanto, labels in English and German.",
        },
      ],
      allowed: [...new Set(nearest)].slice(0, 5),
    };
  }
  const ref = (target: string): Ref => {
    const term = target.slice(1);
    return { term, uri: `${ontologio?.uri}#${term}` };
  };
  const instances = instancesOf(modelo, concept.term);
  return {
    ok: true,
    output: {
      term: concept.term,
      uri: concept.uri,
      inScheme: concept.inScheme,
      ...(concept.notation === undefined ? {} : { notation: concept.notation }),
      prefLabel: concept.prefLabel,
      ...(concept.altLabel === undefined ? {} : { altLabel: concept.altLabel }),
      definition: concept.definition,
      broader: (concept.broader ?? []).map(ref),
      related: (concept.related ?? []).map(ref),
      relations: (concept.relations ?? []).map((relation) => ({
        predicate: relation.predicate,
        target: ref(relation.target),
      })),
      matchedBy,
      ...(instances === undefined ? {} : { instances }),
    },
  };
}
