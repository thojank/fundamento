// The machine-readable read model (FR-07, S6, §2.9): `modelo.json`, `modelo.schema.json` and
// `rezolvoj.json`. Pure: the caller supplies the loaded Modelo, the raw set trees and the schema;
// the output is canonical JSON text (sorted keys, semantic array order, 2-space indent, trailing
// newline, no timestamps), so equal input always gives byte-identical files (Art. I, AK-10).

import type { DtcgType } from "../contracts/dtcg.js";
import { DTCG_TYPES } from "../contracts/dtcg.js";
import { CORE_SET_NAME } from "../contracts/grammar.js";
import type {
  AliasLink,
  Assignment,
  LoadedSet,
  Modelo,
  ModeloJson,
  ResolvedToken,
  ResolvedTokenOrigin,
  Rezolvo,
  TokenSetFile,
} from "../contracts/modelo.js";
import { isEroTokenName } from "../eroj/ero-tokenoj.js";
import { referenceAspektoOf } from "../load/build.js";
import { formatCombination } from "../resolve/assignment.js";
import { type CombinationResolution, resolveCombination } from "../resolve/resolve.js";
import { serializeCanonicalJson } from "../themes/serialize.js";
import { resolutionsOf } from "../validate/resolutions.js";
import { buildVortaroFolders } from "./per-aspekto.js";

/** The value of `modelo.json#/$schema`: the schema is shipped next to it. */
export const MODELO_JSON_SCHEMA_REF = "./modelo.schema.json";

/** File names of the three export artifacts (written to `packages/modelo/dist/`). */
export const EXPORT_FILE_NAMES = {
  modelo: "modelo.json",
  schema: "modelo.schema.json",
  rezolvoj: "rezolvoj.json",
} as const;

/** One raw set file: its canonical set name and its strictly parsed DTCG tree. */
export interface RawSetTree {
  name: string;
  value: unknown;
}

export interface ModeloExportInput {
  /** The loaded Modelo (`buildModelo` / `loadModelo`). It must be valid (`validateModelo`). */
  modelo: Modelo;
  /** The raw set trees the Modelo was built from, e.g. `ModeloFiles.sets`. Order is irrelevant. */
  sets: readonly RawSetTree[];
  /** The canonical Modelo schema (`readModeloSchema()`); written out as `modelo.schema.json`. */
  schema: Readonly<Record<string, unknown>>;
}

/** The exact bytes of the three artifacts and of the Tokens-Studio folder per Aspekto. */
export interface ModeloExport {
  modeloJson: string;
  schemaJson: string;
  rezolvojJson: string;
  /** Aspekto name -> file path inside `vortaro/<aspekto>/` -> canonical JSON text (D-09). */
  vortaro: Record<string, Record<string, string>>;
}

/**
 * A token of the third level in `rezolvoj.json` (Nachlese 9, O-8 of Spec 024): an Ero- or
 * Sxablono-Token is a whole-value alias on the role token its Skemo binds (Constitution v2.3), so
 * the file names that token instead of carrying its value and chain a second time. Following
 * `alias` in the same Rezolvo gives the resolved token back (`rezolvoTokenOf`); a token of the
 * third level that holds a value of its own stays a whole `ResolvedToken`.
 */
export interface RezolvoAlias {
  id: string;
  type: ResolvedToken["type"];
  origin: ResolvedTokenOrigin;
  /** The token it aliases, a key of the same Rezolvo. */
  alias: string;
}

/** One combination of `rezolvoj.json`: every token resolved, the third level as references. */
export interface RezolvojEntry {
  assignment: Rezolvo["assignment"];
  tokens: Record<string, ResolvedToken | RezolvoAlias>;
}

export interface RezolvojJson {
  rezolvoj: RezolvojEntry[];
}

export function isRezolvoAlias(
  token: ResolvedToken | RezolvoAlias | undefined,
): token is RezolvoAlias {
  return token !== undefined && "alias" in token;
}

/** The chain of a token as an alias target: its own chain, or the token itself in its set. */
function chainAsTarget(name: string, token: ResolvedToken): AliasLink[] {
  return token.aliasChain.length > 0 ? token.aliasChain : [{ token: name, set: token.origin.set }];
}

/** A copy of a JSON value (a plain walk, as the resolver copies; `structuredClone` costs more). */
function copyJson<T>(value: T): T {
  if (Array.isArray(value)) return value.map(copyJson) as T;
  if (value !== null && typeof value === "object") {
    const copy: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>))
      copy[key] = copyJson(entry);
    return copy as T;
  }
  return value;
}

/** The token of a reference rebuilt from the token it aliases (`target`, already whole). */
function fromReference(
  name: string,
  reference: RezolvoAlias,
  target: ResolvedToken,
): ResolvedToken {
  const token: ResolvedToken = {
    id: reference.id,
    type: reference.type,
    value: copyJson(target.value),
    origin: { ...reference.origin },
    aliasChain: [
      { token: name, set: reference.origin.set },
      ...chainAsTarget(reference.alias, target).map((link) => ({ ...link })),
    ],
  };
  if (target.textTransform !== undefined) token.textTransform = { ...target.textTransform };
  return token;
}

/**
 * The resolved token `name` of one entry of `rezolvoj.json`: a whole token as it stands, a
 * reference followed (through further references) and rebuilt; undefined for an unknown name.
 */
export function rezolvoTokenOf(entry: RezolvojEntry, name: string): ResolvedToken | undefined {
  const token = entry.tokens[name];
  if (!isRezolvoAlias(token)) return token;
  const target = rezolvoTokenOf(entry, token.alias);
  return target === undefined ? undefined : fromReference(name, token, target);
}

/** An entry of `rezolvoj.json` with every reference followed: the Rezolvo of `resolve`. */
export function expandRezolvo(entry: RezolvojEntry): Rezolvo {
  const tokens: Record<string, ResolvedToken> = {};
  for (const name of Object.keys(entry.tokens)) {
    const token = rezolvoTokenOf(entry, name);
    if (token !== undefined) tokens[name] = token;
  }
  return { assignment: entry.assignment, tokens };
}

/** Plain JSON equality, for the check that a reference loses nothing. */
function sameJson(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a)) {
    return Array.isArray(b) && a.length === b.length && a.every((item, i) => sameJson(item, b[i]));
  }
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) return false;
  if (Array.isArray(b)) return false;
  const left = Object.keys(a);
  const right = b as Record<string, unknown>;
  return (
    left.length === Object.keys(right).length &&
    left.every((key) => sameJson((a as Record<string, unknown>)[key], right[key]))
  );
}

/**
 * The entry of one Rezolvo: a token of the third level that is a whole-value alias becomes a
 * reference, but only where following the reference gives exactly the resolved token back.
 */
function rezolvojEntryOf(rezolvo: Rezolvo): RezolvojEntry {
  const tokens: Record<string, ResolvedToken | RezolvoAlias> = {};
  for (const [name, token] of Object.entries(rezolvo.tokens)) {
    const alias = token.aliasChain[1]?.token;
    const target = alias === undefined ? undefined : rezolvo.tokens[alias];
    if (
      isEroTokenName(name) &&
      alias !== undefined &&
      target !== undefined &&
      token.fieldAliases === undefined
    ) {
      // What fromReference would rebuild, compared in place: value, case and chain.
      const chain = chainAsTarget(alias, target);
      if (
        token.type === target.type &&
        token.aliasChain.length === chain.length + 1 &&
        token.aliasChain[0]?.token === name &&
        token.aliasChain[0]?.set === token.origin.set &&
        chain.every((link, i) => sameJson(link, token.aliasChain[i + 1])) &&
        sameJson(token.value, target.value) &&
        sameJson(token.textTransform, target.textTransform)
      ) {
        tokens[name] = { id: token.id, type: token.type, origin: token.origin, alias };
        continue;
      }
    }
    tokens[name] = token;
  }
  return { assignment: rezolvo.assignment, tokens };
}

/** An input that cannot be exported (inconsistent or not validated). Callers validate first. */
export class ModeloExportError extends Error {
  override name = "ModeloExportError";
}

function rezolvoOrThrow(
  modelo: Modelo,
  assignment: Assignment,
  resolution: CombinationResolution,
): Rezolvo {
  if (resolution.errors.length > 0 || resolution.assignment === undefined) {
    const rules = [...new Set(resolution.errors.map((issue) => issue.rule))].join(", ");
    throw new ModeloExportError(
      `Combination ${formatCombination(modelo, assignment) || "(default)"} does not resolve (${rules}); validate the Modelo before exporting.`,
    );
  }
  return { assignment: resolution.assignment, tokens: resolution.tokens };
}

function requireId(id: string | undefined, what: string): string {
  if (id === undefined || id === "") {
    throw new ModeloExportError(`${what} has no ID; validate the Modelo before exporting.`);
  }
  return id;
}

function exportedSet(
  set: LoadedSet,
  trees: ReadonlyMap<string, unknown>,
): ModeloJson["setoj"][number] {
  if (!trees.has(set.name)) {
    throw new ModeloExportError(`No raw tree was supplied for set ${set.name}.`);
  }
  const exported: ModeloJson["setoj"][number] = {
    id: requireId(set.id, `Set ${set.name}`),
    name: set.name,
    kondicxoj: set.kondicxoj.map((kondicxo) => `${kondicxo.dimensio}=${kondicxo.valoro}`),
    tree: structuredClone(trees.get(set.name)) as TokenSetFile,
  };
  if (set.package !== undefined) exported.package = set.package;
  return exported;
}

/**
 * npm scope of the packages that ship with Fundamento. A package outside it is an external
 * Aspekto (its own repository, owner and license; D-05).
 */
const CORE_PACKAGE_SCOPE = "@fundamento/";

/** `modelo.json` as a value (§2.9). Pure; throws `ModeloExportError` on unexportable input. */
export function buildModeloJson(input: ModeloExportInput): ModeloJson {
  const { modelo } = input;
  const trees = new Map(input.sets.map((set) => [set.name, set.value]));
  const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME);
  if (core === undefined) {
    throw new ModeloExportError(`The Modelo has no ${CORE_SET_NAME} set.`);
  }

  const tokens: ModeloJson["tokens"] = Object.keys(core.tokens)
    .sort()
    .flatMap((name) => {
      const token = core.tokens[name];
      if (token === undefined) return [];
      const entry: ModeloJson["tokens"][number] = {
        id: requireId(token.id, `Token ${name}`),
        name,
        type: token.type,
      };
      if (token.description !== undefined) entry.description = token.description;
      if (token.role !== undefined) entry.role = token.role;
      return [entry];
    });

  const usedTypes = new Set<DtcgType>(tokens.map((token) => token.type));

  const reference = referenceAspektoOf(modelo);
  const aspektoj: ModeloJson["aspektoj"] = [
    // Aspektoj declared in dimensioj.json with inline metadata (Phase-0 layout, fixtures only).
    ...modelo.dimensioj.flatMap((dimensio) =>
      dimensio.valoroj.flatMap((valoro) =>
        valoro.aspekto === undefined
          ? []
          : [{ id: valoro.id, name: valoro.name, ...valoro.aspekto }],
      ),
    ),
    // Aspektoj of packages (D-05), described by their aspekto.json.
    ...modelo.aspektoPackages.flatMap((pkg) => {
      if (!pkg.composed || pkg.aspekto === undefined) return [];
      const entry: ModeloJson["aspektoj"][number] = {
        id: requireId(pkg.id, `Aspekto ${pkg.aspekto}`),
        name: pkg.aspekto,
        owner: pkg.owner ?? "",
        reference: pkg.aspekto === reference,
        external: !pkg.name.startsWith(CORE_PACKAGE_SCOPE),
        package: pkg.name,
      };
      if (pkg.license !== undefined) entry.license = pkg.license;
      if (pkg.namespace !== undefined) entry.idNamespace = pkg.namespace;
      if (pkg.fonts !== undefined) entry.fonts = structuredClone(pkg.fonts);
      // Spec 007 (D-03): the overrides travel with the export, so check_usage over a served
      // export knows them; absent when the package overrides nothing, so an export without
      // overrides keeps its bytes.
      if (pkg.overrides !== undefined && pkg.overrides.length > 0)
        entry.overrides = structuredClone(pkg.overrides);
      return [entry];
    }),
  ];

  const modeloJson: ModeloJson = {
    $schema: MODELO_JSON_SCHEMA_REF,
    fundamento: { version: modelo.version },
    dimensioj: structuredClone(modelo.dimensioj),
    aspektoj,
    tokenTypes: DTCG_TYPES.filter((type) => usedTypes.has(type)),
    tokens,
    // Sorted by set name (code-point order), independent of the input order.
    setoj: [...modelo.setoj]
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
      .map((set) => exportedSet(set, trees)),
    reguloj: structuredClone(modelo.reguloj),
    jugxoj: structuredClone(modelo.jugxoj),
    mankoj: structuredClone(modelo.mankoj),
    kontrastParoj: structuredClone(modelo.kontrastParoj),
    // Sorted by Ero name at load time; the Skemoj follow the same order (Spec 003, D-02).
    eroj: modelo.eroj.map((entry) => structuredClone(entry.ero)),
    skemoj: modelo.eroj.map((entry) => structuredClone(entry.skemo)),
    rezolvo: rezolvoOrThrow(modelo, {}, resolveCombination(modelo, {})),
  };
  if (reference !== undefined) {
    modeloJson.core = { referenceAspekto: reference };
  }
  // Spec 014 ① (G3): the Ikonaro travels with the export; absent while the Modelo has none, so an
  // export without icons keeps its bytes.
  if (modelo.ikonaro.length > 0) {
    modeloJson.ikonaro = structuredClone(modelo.ikonaro);
  }
  // Nachlese 8 ① (D-11): the words of the Gvidanto travel with the export, so a Gvidanto that
  // reads modelo.json alone skips them too; absent while the Modelo has none.
  if (modelo.gvidanto !== undefined) {
    modeloJson.gvidanto = structuredClone(modelo.gvidanto);
  }
  // Nachlese 8 ③: the translations travel with the export, so a Gvidanto that reads modelo.json
  // alone answers in German too.
  if (modelo.tradukoj !== undefined) {
    modeloJson.tradukoj = structuredClone(modelo.tradukoj);
  }
  // Spec 007: in Ero order, like eroj. Absent while no Ero has a Uzo, so an export without Uzoj
  // keeps its bytes (AK-10).
  const uzoj = modelo.eroj.flatMap((entry) =>
    entry.uzo === undefined ? [] : [structuredClone(entry.uzo)],
  );
  if (uzoj.length > 0) {
    modeloJson.uzoj = uzoj;
  }
  // Spec 020 (G1): the Sxablonoj with their Skemo and Uzo, sorted by name; absent while the Modelo
  // has none, so an export without them keeps its bytes.
  const sxablonoj = modelo.sxablonoj ?? [];
  if (sxablonoj.length > 0) {
    modeloJson.sxablonoj = sxablonoj.map((entry) => ({
      sxablono: structuredClone(entry.sxablono),
      skemo: structuredClone(entry.skemo),
      ...(entry.uzo === undefined ? {} : { uzo: structuredClone(entry.uzo) }),
    }));
  }
  return modeloJson;
}

/**
 * `rezolvoj.json` as a value: one entry per combination, in `allAssignments` order, the tokens of
 * the third level as references (O-8). Pure.
 */
export function buildRezolvojJson(modelo: Modelo): RezolvojJson {
  return {
    // The resolutions the validation computed already (Spec 002, D-04), in `allAssignments` order.
    rezolvoj: resolutionsOf(modelo).map(({ assignment, resolution }) =>
      rezolvojEntryOf(rezolvoOrThrow(modelo, assignment, resolution)),
    ),
  };
}

/**
 * The three export artifacts as canonical JSON text (§2.9). Pure and deterministic: no
 * timestamps, keys sorted at every level, arrays in semantic order (Dimensioj by priority, values
 * and data entries as declared, tokens and sets by name, token types in DTCG order, rezolvoj in
 * `allAssignments` order). Throws `ModeloExportError` if the input is not exportable; run
 * `validateModelo` first (or use `exportValidatedModelo`).
 */
export function exportModelo(input: ModeloExportInput): ModeloExport {
  return {
    modeloJson: serializeCanonicalJson(buildModeloJson(input)),
    schemaJson: serializeCanonicalJson(input.schema),
    rezolvojJson: serializeCanonicalJson(buildRezolvojJson(input.modelo)),
    vortaro: buildVortaroFolders(input.modelo, input.sets),
  };
}
