// In-memory Modelo (§2.4) and the cross-ticket library types (§2.5). Derived at load time and
// never persisted, so written by hand; persisted shapes come from the generated schema types.

import type {
  AspektoAspiro,
  Dimensio,
  DimensioValoro,
  DtcgType,
  EntityType,
  Ero,
  Fonto,
  IdsLock,
  Jugxo,
  KontrastParo,
  Regulo,
  Rezolvo,
  Skemo,
  TextTransform,
  TokenRole,
} from "../generated/modelo-schema.js";
import type { IssueLocation, ValidationIssue } from "./issues.js";

export type {
  AliasLink,
  AspektoAspiro,
  AspektoMetadata,
  Dimensio,
  DimensiojFile,
  DimensioValoro,
  Ero,
  EroFile,
  EroInstance,
  Jugxo,
  JugxoEkzemplo,
  JugxojFile,
  KontrastKategorio,
  KontrastParo,
  KontrastParojFile,
  KontrastSojloj,
  ModeloJson,
  Regulo,
  RegulojFile,
  ResolvedToken,
  ResolvedTokenOrigin,
  Rezolvo,
  Skemo,
  SkemoBinding,
  SkemoPart,
  SkemoPartProperty,
  SkemoPartSource,
  SkemoProp,
  TokenSetFile,
} from "../generated/modelo-schema.js";

/** One Ero with its Skemo, loaded from `data/eroj/<name>/skemo.json` (Spec 003, D-02). */
export interface LoadedEro {
  /** Path relative to the Modelo root. */
  file: string;
  ero: Ero;
  skemo: Skemo;
}

/**
 * Where a Modelo lives: the vortaro directory (`$themes.json`, `$metadata.json`, `sets/`), the
 * data directory and the Aspekto packages composed with them (Spec 001, D-08).
 */
export interface ModeloSource {
  vortaroDir: string;
  dataDir: string;
  /** Absolute directories of Aspekto packages (each with `aspekto.json`), in config order. */
  aspektoPackages?: readonly string[];
  /** Issues found while resolving the source, e.g. from `fundamento.config.json`; reported first. */
  sourceIssues?: readonly ValidationIssue[];
}

/** An Aspekto package composed into a Modelo (D-05, D-08). */
export interface LoadedAspektoPackage {
  /** Package label: the `name` of its package.json, or its directory name. */
  name: string;
  /** Absolute package directory. */
  dir: string;
  /** Aspekto name from `aspekto.json`, when it is a string. */
  aspekto?: string;
  /** DimensioValoro ID from `aspekto.json`, when it is a string. */
  id?: string;
  /** `idNamespace` from `aspekto.json`, when it is a string. */
  namespace?: string;
  /** `owner`, `license` and `fonts` from `aspekto.json` (typed after schema validation). */
  owner?: string;
  license?: string;
  fonts?: Fonto[];
  /** `aspiroj` from `aspekto.json`: the design goals this brand sets itself (Spec 004). */
  aspiroj?: AspektoAspiro[];
  /** `aspekto.json` path relative to the Modelo root. */
  aspektoFile: string;
  /** `ids.lock.json` path relative to the Modelo root. */
  lockFile: string;
  /** The package's own ID registry. */
  idsLock: IdsLock;
  /** Whether its Aspekto value was added to the aspekto Dimensio (false for a duplicate name). */
  composed: boolean;
}

/**
 * A Dimensio of the in-memory Modelo: its values are always present. For the aspekto Dimensio
 * they are assembled from the loaded Aspekto packages (D-05).
 */
export type LoadedDimensio = Dimensio & { valoroj: DimensioValoro[] };

/** One parsed `dimensio=valoro` condition of a set. */
export interface Kondicxo {
  dimensio: string;
  valoro: string;
}

export interface LoadedToken {
  /** Canonical, dot-joined name. */
  name: string;
  /** Effective type: the token's own `$type` or the nearest ancestor group's. */
  type: DtcgType;
  /** Raw `$value` (literal or alias). */
  value: unknown;
  description?: string;
  id?: string;
  role?: TokenRole;
  /** Text transformation of a typography token, from its Fundamento extension (D-11). */
  textTransform?: TextTransform;
  location: IssueLocation;
}

export interface LoadedSet {
  id?: string;
  /** Canonical set name, e.g. `core` or `aspekto/neutra+color-scheme/dark`. */
  name: string;
  kondicxoj: Kondicxo[];
  /** Set file path relative to the Modelo root. */
  file: string;
  /** The Aspekto package holding the set; absent for core sets (D-08). */
  package?: string;
  tokens: Record<string, LoadedToken>;
}

export interface Modelo {
  version: string;
  /** Sorted by priority ascending. */
  dimensioj: LoadedDimensio[];
  setoj: LoadedSet[];
  reguloj: Regulo[];
  jugxoj: Jugxo[];
  kontrastParoj: KontrastParo[];
  /** Eroj with their Skemoj, sorted by Ero name (Spec 003). */
  eroj: LoadedEro[];
  /** Union of the core registry and every package registry. */
  idsLock: IdsLock;
  /** Composed Aspekto packages in config order (D-08). */
  aspektoPackages: LoadedAspektoPackage[];
  /** Raw `$themes.json`, kept for the drift check. */
  themesFile: unknown;
  /** Raw `$metadata.json`, kept for the drift check. */
  metadataFile: unknown;
}

/** Dimensio name -> valoro name. May be partial; missing Dimensioj fall back to their default. */
export type Assignment = Readonly<Record<string, string>>;

export type ResolveOutcome =
  | { ok: true; rezolvo: Rezolvo; warnings: ValidationIssue[] }
  | { ok: false; issues: ValidationIssue[] };

export interface ValidationReport {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  summary: {
    tokens: number;
    types: number;
    setoj: number;
    dimensioj: number;
    combinations: number;
    reguloj: number;
    jugxoj: number;
    kontrastParoj: number;
  };
}

/** One place in the Modelo that carries (or should carry) an ID, collected for `checkIds`. */
export interface IdOccurrence {
  id: string | undefined;
  entityType: EntityType;
  location: IssueLocation;
}
