// The Ontologio (Spec 002 FR-15, FR-16; plan D-14): the Constitution's terminology as data, and
// the drift checks that keep it in step with the Constitution table and the Modelo schema. The
// file describes Fundamento itself, not the served design system, so it is not part of the
// export. Reading the files is the only I/O.

import { readFileSync } from "node:fs";
import { createModeloAjv } from "../contracts/ajv.js";
import { readModeloSchema } from "../contracts/schema.js";

export const ONTOLOGIO_URL = new URL("../../data/ontologio.json", import.meta.url);
export const ONTOLOGIO_SCHEMA_URL = new URL("../../schema/ontologio.schema.json", import.meta.url);
export const ONTOLOGIO_BASE = "https://fundamento.ciferecigo.com/ontologio";

export interface OntologioConcept {
  uri: string;
  term: string;
  inScheme: "terminologio" | "modelo" | "principoj";
  notation?: string;
  prefLabel: { eo: string; en: string; de: string };
  altLabel?: Partial<Record<"eo" | "en" | "de", string[]>>;
  definition: { en: string; de: string };
  broader?: string[];
  related?: string[];
  relations?: { predicate: string; target: string }[];
}

export interface Ontologio {
  uri: string;
  constitution: string;
  schemes: { id: string; definition: { en: string; de: string } }[];
  predicates: { id: string; definition: { en: string; de: string } }[];
  concepts: OntologioConcept[];
}

export interface OntologioProblem {
  check:
    | "schema"
    | "table-term-missing"
    | "table-term-extra"
    | "entity-type-missing"
    | "entity-type-extra"
    | "uri"
    | "reference"
    | "cycle";
  message: string;
}

/** The raw text of data/ontologio.json (served as the MCP resource, byte for byte). */
export function readOntologioText(): string {
  return readFileSync(ONTOLOGIO_URL, "utf8");
}

export function readOntologio(): Ontologio {
  return JSON.parse(readOntologioText()) as Ontologio;
}

/** The bold first-column terms of the table under `## Terminologio` in the Constitution. */
export function constitutionTerms(constitution: string): string[] {
  const start = constitution.indexOf("## Terminologio");
  if (start < 0) return [];
  const rest = constitution.slice(start);
  const end = rest.indexOf("\n---");
  const section = end < 0 ? rest : rest.slice(0, end);
  return [...section.matchAll(/^\| \*\*([A-Za-z]+)\*\* \|/gm)].map((match) => match[1] ?? "");
}

function entityTypes(): string[] {
  const defs = readModeloSchema().$defs as Record<string, { enum?: string[] }>;
  return defs.EntityType?.enum ?? [];
}

/** Every drift problem of an Ontologio value (data-model §4.3); empty when it is in step. */
export function checkOntologio(value: unknown, constitution: string): OntologioProblem[] {
  const problems: OntologioProblem[] = [];
  const validate = createModeloAjv().compile(
    JSON.parse(readFileSync(ONTOLOGIO_SCHEMA_URL, "utf8")) as Record<string, unknown>,
  );
  if (!validate(value)) {
    for (const error of validate.errors ?? []) {
      problems.push({
        check: "schema",
        message: `${error.instancePath || "/"} ${error.message ?? ""}`,
      });
    }
    return problems;
  }
  const ontologio = value as Ontologio;
  const concepts = ontologio.concepts;
  const byTerm = new Map(concepts.map((concept) => [concept.term, concept]));

  const table = new Set(constitutionTerms(constitution));
  const scheme = new Set(
    concepts
      .filter((concept) => concept.inScheme === "terminologio")
      .map((concept) => concept.term),
  );
  for (const term of table) {
    if (!scheme.has(term)) {
      problems.push({
        check: "table-term-missing",
        message: `The Constitution term ${term} has no terminologio concept.`,
      });
    }
  }
  for (const term of scheme) {
    if (!table.has(term)) {
      problems.push({
        check: "table-term-extra",
        message: `The terminologio concept ${term} is not in the Constitution table.`,
      });
    }
  }

  const types = entityTypes();
  const notations = concepts.flatMap((concept) =>
    concept.notation === undefined ? [] : [concept.notation],
  );
  for (const type of types) {
    const count = notations.filter((notation) => notation === type).length;
    if (count !== 1) {
      problems.push({
        check: "entity-type-missing",
        message: `The entity type ${type} is the notation of ${count} concepts, not exactly one.`,
      });
    }
  }
  for (const notation of notations) {
    if (!types.includes(notation)) {
      problems.push({
        check: "entity-type-extra",
        message: `The notation ${notation} is no entity type of the Modelo schema.`,
      });
    }
  }

  const uris = new Set<string>();
  for (const concept of concepts) {
    if (concept.uri !== `${ONTOLOGIO_BASE}#${concept.term}`) {
      problems.push({
        check: "uri",
        message: `${concept.term} has the URI ${concept.uri}, not ${ONTOLOGIO_BASE}#${concept.term}.`,
      });
    }
    if (uris.has(concept.uri)) {
      problems.push({ check: "uri", message: `The URI ${concept.uri} is used twice.` });
    }
    uris.add(concept.uri);
  }

  const predicates = new Set(ontologio.predicates.map((predicate) => predicate.id));
  const known = (ref: string) => byTerm.has(ref.slice(1));
  for (const concept of concepts) {
    for (const ref of [...(concept.broader ?? []), ...(concept.related ?? [])]) {
      if (!known(ref))
        problems.push({
          check: "reference",
          message: `${concept.term} refers to the unknown concept ${ref}.`,
        });
    }
    for (const relation of concept.relations ?? []) {
      if (!predicates.has(relation.predicate)) {
        problems.push({
          check: "reference",
          message: `${concept.term} uses the undeclared predicate ${relation.predicate}.`,
        });
      }
      if (!known(relation.target)) {
        problems.push({
          check: "reference",
          message: `${concept.term} relates to the unknown concept ${relation.target}.`,
        });
      }
    }
  }

  // broader must not loop back to the concept itself.
  for (const concept of concepts) {
    const seen = new Set<string>();
    const queue = [...(concept.broader ?? [])];
    while (queue.length > 0) {
      const next = (queue.shift() ?? "").slice(1);
      if (next === concept.term) {
        problems.push({ check: "cycle", message: `${concept.term} is its own broader concept.` });
        break;
      }
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push(...(byTerm.get(next)?.broader ?? []));
    }
  }
  return problems;
}
