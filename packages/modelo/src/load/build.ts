// Turns parsed Modelo files into the in-memory Modelo (§2.4). Pure: no I/O, never throws.

import type { IdsLock } from "../contracts/entity-ids.js";
import type { ValidationIssue } from "../contracts/issues.js";
import type {
  Dimensio,
  Jugxo,
  KontrastParo,
  LoadedSet,
  Modelo,
  Regulo,
} from "../contracts/modelo.js";
import type { ModeloFiles, ModeloSetDocument } from "./files.js";
import { flattenTokenTree, fundamentoExtension, parseKondicxoj } from "./flatten.js";
import { isJsonObject, type JsonObject } from "./guards.js";
import { MODELO_VERSION } from "./version.js";

export interface BuildModeloResult {
  modelo: Modelo;
  issues: ValidationIssue[];
}

/**
 * Interprets parsed Modelo files. This is not validation: entity arrays keep their object
 * entries as they are (non-objects are dropped) and wrong top-level shapes become empty
 * collections, so the typed entity fields are only trustworthy after schema validation
 * (FUND-3.2). Token-level problems the Modelo cannot represent (`token-type-missing`,
 * `token-type-unknown`) are returned as issues.
 */
export function buildModelo(files: ModeloFiles): BuildModeloResult {
  const issues: ValidationIssue[] = [];
  const setoj = files.sets.map((document) => {
    const { set, issues: setIssues } = buildSet(document);
    issues.push(...setIssues);
    return set;
  });
  const modelo: Modelo = {
    version: MODELO_VERSION,
    dimensioj: sortByPriority(entriesOf<Dimensio>(files.data["dimensioj.json"].value, "dimensioj")),
    setoj,
    reguloj: entriesOf<Regulo>(files.data["reguloj.json"].value, "reguloj"),
    jugxoj: entriesOf<Jugxo>(files.data["jugxoj.json"].value, "jugxoj"),
    kontrastParoj: entriesOf<KontrastParo>(files.data["kontrastparoj.json"].value, "kontrastParoj"),
    idsLock: idsLockOf(files.data["ids.lock.json"].value),
    themesFile: files.themes.value,
    metadataFile: files.metadata.value,
  };
  return { modelo, issues };
}

function buildSet(document: ModeloSetDocument): { set: LoadedSet; issues: ValidationIssue[] } {
  const extension = fundamentoExtension(document.value);
  const { tokens, issues } = flattenTokenTree(document.value, document.file);
  const set: LoadedSet = {
    name: document.name,
    kondicxoj: parseKondicxoj(extension?.kondicxoj),
    file: document.file,
    tokens,
  };
  if (typeof extension?.id === "string") {
    set.id = extension.id;
  }
  return { set, issues };
}

/**
 * The object entries of `document[key]`. The cast is deliberate: the loader does not validate,
 * it only guarantees objects (see `buildModelo`).
 */
function entriesOf<T>(document: unknown, key: string): T[] {
  const list = isJsonObject(document) ? document[key] : undefined;
  if (!Array.isArray(list)) {
    return [];
  }
  return list.filter((entry): entry is JsonObject => isJsonObject(entry)) as T[];
}

/** Stable sort by `priority` ascending; entries without a numeric priority go last. */
function sortByPriority(dimensioj: Dimensio[]): Dimensio[] {
  const rank = (dimensio: Dimensio): number =>
    typeof dimensio.priority === "number" ? dimensio.priority : Number.POSITIVE_INFINITY;
  return [...dimensioj].sort((a, b) => {
    const difference = rank(a) - rank(b);
    return Number.isNaN(difference) ? 0 : difference;
  });
}

function idsLockOf(document: unknown): IdsLock {
  if (isJsonObject(document) && isJsonObject(document.ids)) {
    return { ids: document.ids as IdsLock["ids"] };
  }
  return { ids: {} };
}
