// In-memory Modelo (§2.4) and the cross-ticket library types (§2.5). Derived at load time and
// never persisted, so written by hand; persisted shapes come from the generated schema types.

import type {
  Dimensio,
  DtcgType,
  EntityType,
  IdsLock,
  Jugxo,
  KontrastParo,
  Regulo,
  Rezolvo,
  TokenRole,
} from "../generated/modelo-schema.js";
import type { IssueLocation, ValidationIssue } from "./issues.js";

export type {
  AliasLink,
  AspektoMetadata,
  Dimensio,
  DimensiojFile,
  DimensioValoro,
  Jugxo,
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
  TokenSetFile,
} from "../generated/modelo-schema.js";

/** Where a Modelo lives: the vortaro directory (`$themes.json`, `$metadata.json`, `sets/`) and the data directory. */
export interface ModeloSource {
  vortaroDir: string;
  dataDir: string;
}

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
  location: IssueLocation;
}

export interface LoadedSet {
  id?: string;
  /** Canonical set name, e.g. `core` or `aspekto/neutra+color-scheme/dark`. */
  name: string;
  kondicxoj: Kondicxo[];
  /** Set file path relative to the Modelo root. */
  file: string;
  tokens: Record<string, LoadedToken>;
}

export interface Modelo {
  version: string;
  /** Sorted by priority ascending. */
  dimensioj: Dimensio[];
  setoj: LoadedSet[];
  reguloj: Regulo[];
  jugxoj: Jugxo[];
  kontrastParoj: KontrastParo[];
  idsLock: IdsLock;
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
