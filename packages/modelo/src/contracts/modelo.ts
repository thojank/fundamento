// In-memory Modelo (§2.4) and the cross-ticket library types (§2.5). Derived at load time and
// never persisted, so written by hand; persisted shapes come from the generated schema types.

import type {
  AspektoAspiro,
  DevenoValoro,
  Dimensio,
  DimensioValoro,
  DtcgType,
  EntityType,
  Ero,
  Fonto,
  FontoSistemo,
  Gvidanto,
  IdsLock,
  Ikono,
  Jugxo,
  KontrastParo,
  LingvoOverride,
  Manko,
  Regulo,
  Rezolvo,
  Skemo,
  Sxablono,
  SxablonoSkemo,
  SxablonoUzo,
  TextTransform,
  TokenRole,
  Tradukoj,
  Uzo,
} from "../generated/modelo-schema.js";
import type { IssueLocation, ValidationIssue } from "./issues.js";

export type {
  Agordo,
  AgordoJugxo,
  AliasLink,
  AspektoAgordilo,
  AspektoAspiro,
  AspektoFile,
  AspektoMetadata,
  ColorValue,
  DevenoValoro,
  Dimensio,
  DimensiojFile,
  DimensioValoro,
  Ero,
  EroFile,
  EroInstance,
  Fonto,
  FontoSistemo,
  Gvidanto,
  GvidantoFile,
  IkonaroFile,
  Ikono,
  Jugxo,
  JugxoEkzemplo,
  JugxojFile,
  Keywords,
  KontrastKategorio,
  KontrastParo,
  KontrastParojFile,
  KontrastSojloj,
  Manko,
  MankoClosing,
  MankojFile,
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
  Sxablono,
  SxablonoA11Y as SxablonoA11y,
  SxablonoEntry,
  SxablonoFile,
  SxablonoGoal,
  SxablonoInstance,
  SxablonoRegion,
  SxablonoSkemo,
  SxablonoUzo,
  SxablonoUzoFile,
  TokenSetFile,
  Tradukoj,
  TradukojFile,
  Uzo,
  UzoBoundary,
  UzoContent,
  UzoFile,
  UzoInstead,
  UzoLayout,
  UzoSlot,
} from "../generated/modelo-schema.js";

/** One Ero with its Skemo, loaded from `data/eroj/<name>/skemo.json` (Spec 003, D-02). */
export interface LoadedEro {
  /** Path relative to the Modelo root. */
  file: string;
  ero: Ero;
  skemo: Skemo;
  /** The Uzo from `uzo.json` next to the Skemo, if the Ero has one (Spec 007, D-01). */
  uzo?: Uzo;
  /** Path of that `uzo.json` relative to the Modelo root; set together with `uzo`. */
  uzoFile?: string;
}

/**
 * One Sxablono with its Skemo of regions, loaded from `data/sxablonoj/<name>/skemo.json`
 * (Spec 020, G1), and its Uzo from `uzo.json` beside it.
 */
export interface LoadedSxablono {
  /** Path relative to the Modelo root. */
  file: string;
  sxablono: Sxablono;
  skemo: SxablonoSkemo;
  uzo?: SxablonoUzo;
  /** Path of that `uzo.json` relative to the Modelo root; set together with `uzo`. */
  uzoFile?: string;
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
  /**
   * `tavoloj.lingvo.overrides` from `aspekto.json`: the adjustable text rules this Aspekto
   * overrides, each with the Jugxo that records the deviation (Spec 007, A7, D-03).
   */
  overrides?: LingvoOverride[];
  /**
   * The glyphs of the package by Ikonaro name, the SVG text (Spec 014 ②, G3): the picture every
   * Celo draws for an ikono of this Aspekto.
   */
  ikonoj?: Record<string, string>;
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
  /** The measured gaps of the tools, kept by the system itself (F41). */
  mankoj: Manko[];
  kontrastParoj: KontrastParo[];
  /** The Ikonaro: the icon names of the core (Spec 014 ①, G3); empty while data/ikonaro.json is absent. */
  ikonaro: Ikono[];
  /**
   * The words of the Gvidanto (Nachlese 8 ①, D-11): what only opens a request, per language;
   * absent while data/gvidanto.json is (a Modelo built by hand may leave it out).
   */
  gvidanto?: Gvidanto;
  /**
   * The translations of the texts of the Uzoj and the Reguloj (Nachlese 8 ③), per language and
   * text ID; absent while data/tradukoj.json is. English, the text of the entry, is the source.
   */
  tradukoj?: Tradukoj;
  /**
   * The Fontoj (Spec 029 ①, Constitution v2.4): open design systems values are taken from, pinned
   * to a version and a commit; absent while data/fontoj.json is.
   */
  fontoj?: FontoSistemo[];
  /**
   * The provenance of every value an Aspekto took from a Fonto (Spec 029 ①, Art. VII), from the
   * deveno.json of the packages, each with the Aspekto it belongs to; absent while none has one.
   */
  deveno?: (DevenoValoro & { aspekto: string })[];
  /** Eroj with their Skemoj, sorted by Ero name (Spec 003). */
  eroj: LoadedEro[];
  /**
   * Sxablonoj with their Skemoj, sorted by name (Spec 020); absent or empty while the Modelo has
   * none (a Modelo built by hand may leave it out).
   */
  sxablonoj?: LoadedSxablono[];
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
    mankoj: number;
    kontrastParoj: number;
  };
}

/** One place in the Modelo that carries (or should carry) an ID, collected for `checkIds`. */
export interface IdOccurrence {
  id: string | undefined;
  entityType: EntityType;
  location: IssueLocation;
}
