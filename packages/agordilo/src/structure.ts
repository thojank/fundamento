// The structure a derived Aspekto is written from (Spec 016, G2): the files of the core Vortaro
// and Modelo data with the reference Aspekto package (komuna) — its roles, their assignment to
// palette steps and every token that stage 1 writes unchanged. Read once at the I/O edge
// (node/structure.ts); everything after it is pure.

import {
  type AspektoPackageFiles,
  CORE_SET_NAME,
  type ModeloFiles,
  serializeCanonicalJson,
} from "@fundamento/modelo";

export interface Structure {
  /** Core sets, data files and the reference Aspekto package, as the loader reads them. */
  files: ModeloFiles;
  /**
   * SHA-256 over the core sets and the sets and aspekto.json of the reference package, in
   * canonical JSON: the structure a derived Aspekto names as its origin (G1).
   */
  fingerprint: string;
  /** The licence text of the reference package's glyphs (`ikonoj/LICENSE`), copied with them. */
  ikonojLicense?: string;
  /**
   * The Ikonaro in the Phosphor weights the reference does not draw (Spec 019, G2 ikono.gewicht,
   * E6): data/ikonoj of the Agordilo. Not part of the fingerprint — like the calibration, it is
   * the Agordilo's, not the structure's.
   */
  ikonoGewichte?: IkonoGewichte;
}

/** Glyphs per Phosphor weight with their provenance (data/ikonoj/ikonoj.json). */
export interface IkonoGewichte {
  /** set, version, licence, source (with `<gewicht>`), the day it was read, the weights. */
  provenance: Record<string, unknown>;
  /** weight → Ikonaro name → SVG text. */
  glyphs: Record<string, Record<string, string>>;
}

/** The documents the fingerprint covers: the core sets and the reference package, by name. */
export function structureDocuments(files: ModeloFiles): { name: string; value: unknown }[] {
  const reference = files.packages[0];
  const sets = files.sets
    .filter((set) => set.package === undefined || set.package === reference?.name)
    .map((set) => ({ name: `sets/${set.name}`, value: set.value }));
  return reference === undefined
    ? sets
    : [...sets, { name: "aspekto.json", value: reference.aspekto.value }];
}

/** The reference Aspekto package of a structure: the first composed package (komuna). */
export function referencePackage(structure: Structure): AspektoPackageFiles {
  const reference = structure.files.packages[0];
  if (reference === undefined) throw new Error("The structure holds no reference Aspekto package.");
  return reference;
}

/** The text the fingerprint hashes: the structure documents in canonical JSON (G1). Pure. */
export function fingerprintDocuments(files: ModeloFiles): string {
  return serializeCanonicalJson(structureDocuments(files));
}

/**
 * The files of a structure reduced to the core and the reference Aspekto (Spec 016 ②, plan ② D-02):
 * what the Werkstatt derives over, whatever other Aspektoj the build composes — the CLI derives over
 * the same two, so browser and CLI agree value for value. The package directory loses its machine
 * path (the Vitrino is a file that travels); every other path is relative to the Modelo root already.
 */
export function referenceStructureFiles(files: ModeloFiles): ModeloFiles | undefined {
  const reference = files.packages[0];
  if (reference === undefined) return undefined;
  const dir = reference.aspekto.file.replace(/\/aspekto\.json$/, "");
  return {
    ...files,
    sets: files.sets.filter((set) => set.package === undefined || set.package === reference.name),
    packages: [{ ...reference, dir }],
  };
}

/** The Aspekto that keeps komuna as it was before the Fonto (Spec 029 ①). */
export const KOMUNA_0_2 = "komuna-0-2";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const nameOf = (value: unknown): string | undefined =>
  isRecord(value) && typeof value.name === "string" ? value.name : undefined;

/** Every `$value` of `core` taken from the token of the same name in `frozen` (and its textTransform). */
function withValuesOf(core: unknown, frozen: unknown): unknown {
  if (!isRecord(core)) return core;
  if ("$value" in core) {
    if (!isRecord(frozen) || !("$value" in frozen)) return core;
    const out: Record<string, unknown> = { ...core, $value: structuredClone(frozen.$value) };
    const ext = isRecord(frozen.$extensions) ? frozen.$extensions[EXTENSION] : undefined;
    const own = isRecord(core.$extensions) ? core.$extensions[EXTENSION] : undefined;
    if (isRecord(ext) && "textTransform" in ext && isRecord(own)) {
      out.$extensions = {
        ...(isRecord(core.$extensions) ? core.$extensions : {}),
        [EXTENSION]: { ...own, textTransform: ext.textTransform },
      };
    }
    return out;
  }
  return Object.fromEntries(
    Object.entries(core).map(([key, child]) => [
      key,
      key.startsWith("$") ? child : withValuesOf(child, isRecord(frozen) ? frozen[key] : undefined),
    ]),
  );
}

const EXTENSION = "com.ciferecigo.fundamento";

/**
 * The structure of komuna 0.2 (Spec 029 ①): komuna took the values of a Fonto, but every derived
 * brand was written from komuna as it was, and the calibration of the Agordilo was measured on it.
 * The package komuna-0-2 keeps those values; this rebuilds the structure from it — the core with
 * the values of komuna-0-2, the reference package with komuna-0-2's conjunction sets under the
 * reference's name and set IDs — so the documents are the same as before, and so is the
 * fingerprint. Pure; `undefined` when the files hold no komuna-0-2. The other packages, the
 * reference's own new conjunction sets and its Jugxoj and provenance are not part of it.
 */
export function struktur02Files(files: ModeloFiles): ModeloFiles | undefined {
  const reference = files.packages[0];
  const frozen = files.packages.find((pkg) => nameOf(pkg.aspekto.value) === KOMUNA_0_2);
  const referenceName = nameOf(reference?.aspekto.value);
  if (reference === undefined || frozen === undefined || referenceName === undefined)
    return undefined;
  const frozenMain = files.sets.find(
    (set) => set.package === frozen.name && set.name === `aspekto/${KOMUNA_0_2}`,
  );
  if (frozenMain === undefined) return undefined;
  const ownId = (name: string): unknown => {
    const set = files.sets.find((entry) => entry.package === reference.name && entry.name === name);
    const ext =
      isRecord(set?.value) && isRecord(set.value.$extensions) ? set.value.$extensions : {};
    return isRecord(ext[EXTENSION]) ? ext[EXTENSION].id : undefined;
  };
  const renamed = (name: string): string =>
    name.replace(`aspekto/${KOMUNA_0_2}`, `aspekto/${referenceName}`);
  const referenceSets = files.sets
    .filter((set) => set.package === frozen.name)
    .map((set) => {
      const name = renamed(set.name);
      const value = isRecord(set.value) ? set.value : {};
      const ext = isRecord(value.$extensions) ? value.$extensions : {};
      const own = isRecord(ext[EXTENSION]) ? ext[EXTENSION] : {};
      const kondicxoj = (Array.isArray(own.kondicxoj) ? own.kondicxoj : []).map((entry) =>
        entry === `aspekto=${KOMUNA_0_2}` ? `aspekto=${referenceName}` : entry,
      );
      // The reference's own set holds nothing (its values are the core's).
      const body =
        name === `aspekto/${referenceName}`
          ? {}
          : Object.fromEntries(Object.entries(value).filter(([key]) => key !== "$extensions"));
      return {
        ...set,
        name,
        package: reference.name,
        file: set.file.replace(KOMUNA_0_2, referenceName),
        value: { $extensions: { [EXTENSION]: { id: ownId(name), kondicxoj } }, ...body },
      };
    });
  const sets = files.sets
    .filter((set) => set.package === undefined)
    .map((set) =>
      set.name === CORE_SET_NAME
        ? { ...set, value: withValuesOf(set.value, frozenMain.value) }
        : set,
    );
  const frozenAspekto = isRecord(frozen.aspekto.value) ? frozen.aspekto.value : {};
  const referenceAspekto = isRecord(reference.aspekto.value) ? reference.aspekto.value : {};
  const aspekto: Record<string, unknown> = {
    ...frozenAspekto,
    id: referenceAspekto.id,
    name: referenceName,
  };
  delete aspekto.idNamespace;
  const { reguloj: _reguloj, jugxoj: _jugxoj, deveno: _deveno, ...base } = reference;
  // The IDs komuna 0.2 used: the Aspekto's and its two sets'; the later ones stay with today's komuna.
  const used = new Set([
    String(referenceAspekto.id),
    ...referenceSets.map((set) => {
      const ext = (set.value as Record<string, unknown>).$extensions as Record<string, unknown>;
      return String((ext[EXTENSION] as Record<string, unknown>).id);
    }),
  ]);
  const lock =
    isRecord(reference.idsLock.value) && isRecord(reference.idsLock.value.ids)
      ? reference.idsLock.value.ids
      : {};
  const ownIds = Object.fromEntries(Object.entries(lock).filter(([id]) => used.has(id)));
  // The theme fragment of komuna 0.2: komuna-0-2's, under the reference's name and ID.
  const themes = JSON.parse(
    JSON.stringify(frozen.themes.value)
      .replaceAll(`aspekto/${KOMUNA_0_2}`, `aspekto/${referenceName}`)
      .replaceAll(JSON.stringify(frozenAspekto.id), JSON.stringify(referenceAspekto.id))
      .replaceAll(`"name":"${KOMUNA_0_2}"`, `"name":"${referenceName}"`),
  ) as unknown;
  // Other packages (a derived brand under check) stay as they are, after the reference.
  const others = files.packages.filter((pkg) => pkg !== reference && pkg !== frozen);
  const otherSets = files.sets.filter((set) => others.some((pkg) => pkg.name === set.package));
  return {
    ...files,
    sets: [...sets, ...referenceSets, ...otherSets].sort((a, b) =>
      a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
    ),
    packages: [
      {
        ...base,
        dir: frozen.dir,
        aspekto: { ...reference.aspekto, value: aspekto },
        themes: { ...reference.themes, value: themes },
        idsLock: { ...reference.idsLock, value: { ids: ownIds } },
      },
      ...others,
    ],
  };
}
