// Turns parsed Modelo files into the in-memory Modelo (§2.4). Pure: no I/O, never throws.

import type { IdsLock } from "../contracts/entity-ids.js";
import type { ValidationIssue } from "../contracts/issues.js";
import type {
  Dimensio,
  DimensioValoro,
  Gvidanto,
  Ikono,
  Jugxo,
  KontrastParo,
  LoadedAspektoPackage,
  LoadedDimensio,
  LoadedEro,
  LoadedSet,
  LoadedSxablono,
  Manko,
  Modelo,
  Regulo,
  Tradukoj,
} from "../contracts/modelo.js";
import type { AspektoAspiro, Fonto, LingvoOverride } from "../generated/modelo-schema.js";
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
    // Spec 014 ① (G3): the Ikonaro, empty while data/ikonaro.json does not exist.
    ikonaro: entriesOf<Ikono>(files.data["ikonaro.json"]?.value, "ikonaro"),
    // Nachlese 8 ① (D-11): the words of the Gvidanto, absent while data/gvidanto.json is.
    ...gvidantoOf(files.data["gvidanto.json"]?.value),
    // Nachlese 8 ③: the translations, absent while data/tradukoj.json is.
    ...tradukojOf(files.data["tradukoj.json"]?.value),
    eroj: loadedEroj(files.eroj, files.uzoj),
    sxablonoj: loadedSxablonoj(files.sxablonoj ?? [], files.sxablonoUzoj ?? []),
    idsLock,
    aspektoPackages,
    themesFile: files.themes.value,
    metadataFile: files.metadata.value,
  };
  return { modelo, issues };
}

/**
 * Eroj from `data/eroj/<name>/skemo.json`, sorted by Ero name, each with the Uzo from the
 * `uzo.json` in the same folder (Spec 007, D-01). Like the other entities they are only
 * trustworthy after schema validation; a file without an `ero` and a `skemo` object, or a
 * `uzo.json` without a `uzo` object, is dropped here and reported by the schema step.
 */
function loadedEroj(
  documents: readonly ModeloDocument[],
  uzoDocuments: readonly ModeloDocument[],
): LoadedEro[] {
  const uzoByFolder = new Map(
    uzoDocuments.map((document) => [folderOf(document.file), document] as const),
  );
  return documents
    .flatMap((document) => {
      const value = document.value;
      if (!isJsonObject(value) || !isJsonObject(value.ero) || !isJsonObject(value.skemo)) {
        return [];
      }
      const entry: LoadedEro = {
        file: document.file,
        ero: value.ero as unknown as LoadedEro["ero"],
        skemo: value.skemo as unknown as LoadedEro["skemo"],
      };
      const uzoDocument = uzoByFolder.get(folderOf(document.file));
      if (uzoDocument !== undefined && isJsonObject(uzoDocument.value)) {
        const uzo = uzoDocument.value.uzo;
        if (isJsonObject(uzo)) {
          entry.uzo = uzo as unknown as NonNullable<LoadedEro["uzo"]>;
          entry.uzoFile = uzoDocument.file;
        }
      }
      return [entry];
    })
    .sort((a, b) => (a.ero.name < b.ero.name ? -1 : a.ero.name > b.ero.name ? 1 : 0));
}

/**
 * Sxablonoj from `data/sxablonoj/<name>/skemo.json`, sorted by name, each with the Uzo from the
 * `uzo.json` in the same folder (Spec 020, G1) — as the Eroj; a shapeless file is dropped here and
 * reported by the schema step.
 */
function loadedSxablonoj(
  documents: readonly ModeloDocument[],
  uzoDocuments: readonly ModeloDocument[],
): LoadedSxablono[] {
  const uzoByFolder = new Map(
    uzoDocuments.map((document) => [folderOf(document.file), document] as const),
  );
  return documents
    .flatMap((document) => {
      const value = document.value;
      if (!isJsonObject(value) || !isJsonObject(value.sxablono) || !isJsonObject(value.skemo)) {
        return [];
      }
      const entry: LoadedSxablono = {
        file: document.file,
        sxablono: value.sxablono as unknown as LoadedSxablono["sxablono"],
        skemo: value.skemo as unknown as LoadedSxablono["skemo"],
      };
      const uzoDocument = uzoByFolder.get(folderOf(document.file));
      if (uzoDocument !== undefined && isJsonObject(uzoDocument.value)) {
        const uzo = uzoDocument.value.uzo;
        if (isJsonObject(uzo)) {
          entry.uzo = uzo as unknown as NonNullable<LoadedSxablono["uzo"]>;
          entry.uzoFile = uzoDocument.file;
        }
      }
      return [entry];
    })
    .sort((a, b) =>
      a.sxablono.name < b.sxablono.name ? -1 : a.sxablono.name > b.sxablono.name ? 1 : 0,
    );
}

/** The folder part of a Modelo-relative path (`data/eroj/butono/skemo.json` → `data/eroj/butono`). */
function folderOf(file: string): string {
  return file.slice(0, file.lastIndexOf("/"));
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
    // Spec 014 ② (G3): the glyphs the package draws, by Ikonaro name, for every Celo.
    if (pkg.ikonoj !== undefined) entry.ikonoj = pkg.ikonoj;
    if (Array.isArray(raw.aspiroj))
      entry.aspiroj = raw.aspiroj.filter(isJsonObject) as unknown as AspektoAspiro[];
    // Spec 007 (D-03): the overrides of adjustable text rules, for check_usage.
    const tavoloj = isJsonObject(raw.tavoloj) ? raw.tavoloj : {};
    const lingvo = isJsonObject(tavoloj.lingvo) ? tavoloj.lingvo : {};
    if (Array.isArray(lingvo.overrides))
      entry.overrides = lingvo.overrides.filter(isJsonObject) as unknown as LingvoOverride[];
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

/**
 * The words of the Gvidanto (Nachlese 8 ①, D-11) as the Modelo carries them: present where
 * data/gvidanto.json holds them; validation reports the shape (`GvidantoFile`).
 */
function gvidantoOf(document: unknown): { gvidanto?: Gvidanto } {
  const gvidanto = isJsonObject(document) ? document.gvidanto : undefined;
  return isJsonObject(gvidanto) && isJsonObject(gvidanto.fillers)
    ? { gvidanto: gvidanto as unknown as Gvidanto }
    : {};
}

/** The translations as the Modelo carries them (Nachlese 8 ③); validation reports the shape. */
function tradukojOf(document: unknown): { tradukoj?: Tradukoj } {
  const tradukoj = isJsonObject(document) ? document.tradukoj : undefined;
  return isJsonObject(tradukoj) ? { tradukoj: tradukoj as unknown as Tradukoj } : {};
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
