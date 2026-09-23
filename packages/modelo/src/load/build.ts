// Turns parsed Modelo files into the in-memory Modelo (§2.4). Pure: no I/O, never throws.

import type { IdsLock } from "../contracts/entity-ids.js";
import type { ValidationIssue } from "../contracts/issues.js";
import type {
  Dimensio,
  DimensioValoro,
  Jugxo,
  KontrastParo,
  LoadedAspektoPackage,
  LoadedDimensio,
  LoadedEro,
  LoadedSet,
  Manko,
  Modelo,
  Regulo,
} from "../contracts/modelo.js";
import type { AspektoAspiro, Fonto } from "../generated/modelo-schema.js";
import type {
  AspektoPackageFiles,
  ModeloDocument,
  ModeloFiles,
  ModeloSetDocument,
} from "./files.js";
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
  const dimensioj: LoadedDimensio[] = sortByPriority(
    entriesOf<Dimensio>(files.data["dimensioj.json"].value, "dimensioj"),
  ).map((dimensio) => ({
    ...dimensio,
    valoroj: Array.isArray(dimensio.valoroj) ? dimensio.valoroj : [],
  }));
  const aspektoPackages = composeAspektoValues(dimensioj, files.packages);
  const idsLock: IdsLock = { ids: { ...idsLockOf(files.data["ids.lock.json"].value).ids } };
  for (const pkg of aspektoPackages) {
    for (const [id, entry] of Object.entries(pkg.idsLock.ids)) {
      // A cross-registry duplicate keeps the first entry; validation reports `id-duplicate`.
      if (!Object.hasOwn(idsLock.ids, id)) {
        idsLock.ids[id] = entry;
      }
    }
  }
  const modelo: Modelo = {
    version: MODELO_VERSION,
    dimensioj,
    setoj,
    reguloj: [
      ...entriesOf<Regulo>(files.data["reguloj.json"].value, "reguloj"),
      ...packageEntries<Regulo>(files.packages, aspektoPackages, "reguloj"),
    ],
    jugxoj: [
      ...entriesOf<Jugxo>(files.data["jugxoj.json"].value, "jugxoj"),
      ...packageEntries<Jugxo>(files.packages, aspektoPackages, "jugxoj"),
    ],
    mankoj: entriesOf<Manko>(files.data["mankoj.json"].value, "mankoj"),
    kontrastParoj: entriesOf<KontrastParo>(files.data["kontrastparoj.json"].value, "kontrastParoj"),
    eroj: loadedEroj(files.eroj),
    idsLock,
    aspektoPackages,
    themesFile: files.themes.value,
    metadataFile: files.metadata.value,
  };
  return { modelo, issues };
}

/**
 * Eroj from `data/eroj/<name>/skemo.json`, sorted by Ero name. Like the other entities they are
 * only trustworthy after schema validation; a file without an `ero` and a `skemo` object is
 * dropped here and reported by the schema step.
 */
function loadedEroj(documents: readonly ModeloDocument[]): LoadedEro[] {
  return documents
    .flatMap((document) => {
      const value = document.value;
      if (!isJsonObject(value) || !isJsonObject(value.ero) || !isJsonObject(value.skemo)) {
        return [];
      }
      return [
        {
          file: document.file,
          ero: value.ero as unknown as LoadedEro["ero"],
          skemo: value.skemo as unknown as LoadedEro["skemo"],
        },
      ];
    })
    .sort((a, b) => (a.ero.name < b.ero.name ? -1 : a.ero.name > b.ero.name ? 1 : 0));
}

/** Name of the Dimensio whose values are Aspektoj. */
export const ASPEKTO_DIMENSIO = "aspekto";

/** The reference Aspekto named on the aspekto Dimensio (FR-10), if any. */
export function referenceAspektoOf(modelo: Pick<Modelo, "dimensioj">): string | undefined {
  const aspekto = modelo.dimensioj.find((dimensio) => dimensio.name === ASPEKTO_DIMENSIO);
  return typeof aspekto?.referenceAspekto === "string" ? aspekto.referenceAspekto : undefined;
}

/**
 * Adds each package's Aspekto as a value of the aspekto Dimensio (D-05: the values are assembled
 * from the loaded packages). A name that already exists is not added again; validation reports
 * `aspekto-name-duplicate`. Mutates `dimensioj` (a fresh array of fresh entries) in place.
 */
function composeAspektoValues(
  dimensioj: LoadedDimensio[],
  packages: readonly AspektoPackageFiles[],
): LoadedAspektoPackage[] {
  const index = dimensioj.findIndex((dimensio) => dimensio.name === ASPEKTO_DIMENSIO);
  const aspekto = index === -1 ? undefined : dimensioj[index];
  const valoroj: DimensioValoro[] = [...(aspekto?.valoroj ?? [])];
  const loaded = packages.map((pkg) => {
    const raw = isJsonObject(pkg.aspekto.value) ? pkg.aspekto.value : {};
    const name = typeof raw.name === "string" ? raw.name : undefined;
    const id = typeof raw.id === "string" ? raw.id : undefined;
    const owner = typeof raw.owner === "string" ? raw.owner : undefined;
    const license = typeof raw.license === "string" ? raw.license : undefined;
    const composed =
      aspekto !== undefined &&
      name !== undefined &&
      !valoroj.some((valoro) => isJsonObject(valoro) && valoro.name === name);
    if (composed && name !== undefined) {
      valoroj.push({ id: id ?? "", name });
    }
    const entry: LoadedAspektoPackage = {
      name: pkg.name,
      dir: pkg.dir,
      aspektoFile: pkg.aspekto.file,
      lockFile: pkg.idsLock.file,
      idsLock: idsLockOf(pkg.idsLock.value),
      composed,
    };
    if (name !== undefined) entry.aspekto = name;
    if (id !== undefined) entry.id = id;
    if (owner !== undefined) entry.owner = owner;
    if (license !== undefined) entry.license = license;
    // Typed after schema validation (AspektoFile); the loader only guarantees objects.
    if (Array.isArray(raw.fonts))
      entry.fonts = raw.fonts.filter(isJsonObject) as unknown as Fonto[];
    if (Array.isArray(raw.aspiroj))
      entry.aspiroj = raw.aspiroj.filter(isJsonObject) as unknown as AspektoAspiro[];
    if (typeof raw.idNamespace === "string") entry.namespace = raw.idNamespace;
    return entry;
  });
  if (aspekto !== undefined && index !== -1) {
    dimensioj[index] = { ...aspekto, valoroj };
  }
  return loaded;
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
  if (document.package !== undefined) {
    set.package = document.package;
  }
  if (typeof extension?.id === "string") {
    set.id = extension.id;
  }
  return { set, issues };
}

/**
 * The Reguloj or Jugxoj of every package (D-10), each scoped to its package's Aspekto unless it
 * names one itself (validation reports a foreign or unknown Aspekto: regulo-aspekto-unknown).
 */
function packageEntries<T extends { aspekto?: string }>(
  packages: readonly AspektoPackageFiles[],
  loaded: readonly LoadedAspektoPackage[],
  key: "reguloj" | "jugxoj",
): T[] {
  return packages.flatMap((pkg, index) => {
    const aspekto = loaded[index]?.aspekto;
    return entriesOf<T>(pkg[key]?.value, key).map((entry) =>
      entry.aspekto === undefined && aspekto !== undefined ? { ...entry, aspekto } : entry,
    );
  });
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
