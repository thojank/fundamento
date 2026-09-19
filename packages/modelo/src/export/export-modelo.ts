// The machine-readable read model (FR-07, S6, §2.9): `modelo.json`, `modelo.schema.json` and
// `rezolvoj.json`. Pure: the caller supplies the loaded Modelo, the raw set trees and the schema;
// the output is canonical JSON text (sorted keys, semantic array order, 2-space indent, trailing
// newline, no timestamps), so equal input always gives byte-identical files (Art. I, AK-10).

import type { DtcgType } from "../contracts/dtcg.js";
import { DTCG_TYPES } from "../contracts/dtcg.js";
import { CORE_SET_NAME } from "../contracts/grammar.js";
import type {
  Assignment,
  LoadedSet,
  Modelo,
  ModeloJson,
  Rezolvo,
  TokenSetFile,
} from "../contracts/modelo.js";
import { referenceAspektoOf } from "../load/build.js";
import { allAssignments, formatCombination } from "../resolve/assignment.js";
import { resolve } from "../resolve/resolve.js";
import { serializeCanonicalJson } from "../themes/serialize.js";
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

export interface RezolvojJson {
  rezolvoj: Rezolvo[];
}

/** An input that cannot be exported (inconsistent or not validated). Callers validate first. */
export class ModeloExportError extends Error {
  override name = "ModeloExportError";
}

function resolveOrThrow(modelo: Modelo, assignment: Assignment): Rezolvo {
  const outcome = resolve(modelo, assignment);
  if (!outcome.ok) {
    const rules = [...new Set(outcome.issues.map((issue) => issue.rule))].join(", ");
    throw new ModeloExportError(
      `Combination ${formatCombination(modelo, assignment) || "(default)"} does not resolve (${rules}); validate the Modelo before exporting.`,
    );
  }
  return outcome.rezolvo;
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
  return {
    id: requireId(set.id, `Set ${set.name}`),
    name: set.name,
    kondicxoj: set.kondicxoj.map((kondicxo) => `${kondicxo.dimensio}=${kondicxo.valoro}`),
    tree: structuredClone(trees.get(set.name)) as TokenSetFile,
  };
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
      if (pkg.fonts !== undefined) entry.fonts = structuredClone(pkg.fonts);
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
    kontrastParoj: structuredClone(modelo.kontrastParoj),
    eroj: [],
    rezolvo: resolveOrThrow(modelo, {}),
  };
  if (reference !== undefined) {
    modeloJson.core = { referenceAspekto: reference };
  }
  return modeloJson;
}

/** `rezolvoj.json` as a value: one Rezolvo per combination, in `allAssignments` order. Pure. */
export function buildRezolvojJson(modelo: Modelo): RezolvojJson {
  return {
    rezolvoj: allAssignments(modelo).map((assignment) => resolveOrThrow(modelo, assignment)),
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
