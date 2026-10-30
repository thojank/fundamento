/**
 * GENERATED FILE - DO NOT EDIT.
 * Source: packages/modelo/schema/modelo.schema.json
 * Regenerate: pnpm --filter @fundamento/modelo generate:types
 */

/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Version".
 */
export type Version = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "DimensioId".
 */
export type DimensioId = string;
/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[a-z0-9]+(-[a-z0-9]+)*$".
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Name".
 */
export type Name = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "DimensioValoroId".
 */
export type DimensioValoroId = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "NonEmptyText".
 */
export type NonEmptyText = string;
/**
 * An SPDX license expression, or `proprietary` for rights that are not openly licensed.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "License".
 */
export type License = string;
/**
 * An ISO 15924 script code: four letters, the first uppercase (e.g. Latn, Cyrl, Hans).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Iso15924".
 */
export type Iso15924 = string;
/**
 * ID namespace of an external Aspekto package (Spec 001, D-06): 2 to 8 lowercase letters.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "IdNamespace".
 */
export type IdNamespace = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "JugxoId".
 */
export type JugxoId = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "DtcgType".
 */
export type DtcgType =
  | "color"
  | "dimension"
  | "fontFamily"
  | "fontWeight"
  | "duration"
  | "cubicBezier"
  | "number"
  | "strokeStyle"
  | "shadow"
  | "typography"
  | "border"
  | "gradient"
  | "transition";
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "TokenId".
 */
export type TokenId = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "TokenName".
 */
export type TokenName = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "TokenRole".
 */
export type TokenRole =
  | "palette"
  | "foreground"
  | "background"
  | "border"
  | "focus"
  | "shadow"
  | "backdrop"
  | "disabled"
  | "decorative"
  | "ero";
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "TokenSetId".
 */
export type TokenSetId = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SetName".
 */
export type SetName = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "KondicxoExpression".
 */
export type KondicxoExpression = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Deprecated".
 */
export type Deprecated = boolean | string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "ReguloId".
 */
export type ReguloId = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "TokenPattern".
 */
export type TokenPattern = string;
/**
 * The numeric threshold of a measuring Regulo; the enforcer reads it and agents cite it (Spec 002, D-02, D-06; Spec 004 adds the metrics and the upper bound).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "ReguloSojlo".
 */
export type ReguloSojlo = ReguloSojlo1 & {
  metric:
    | "oklch-l-delta"
    | "oklch-l-extreme"
    | "oklch-l-step"
    | "oklch-l-step-consistency"
    | "oklch-l-align"
    | "wcag2-reserve"
    | "srgb-gamut"
    | "type-scale-ratio"
    | "type-scale-consistency"
    | "type-rhythm"
    | "dimensio-kovrado";
  min?: number;
  max?: number;
};
export type ReguloSojlo1 =
  | {
      min: unknown;
    }
  | {
      max: unknown;
    };
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "EroId".
 */
export type EroId = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "MankoId".
 */
export type MankoId = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "UzoId".
 */
export type UzoId = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SkemoId".
 */
export type SkemoId = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "KontrastParo".
 */
export type KontrastParo = {
  id: KontrastParoId;
  name: Name;
  foreground: TokenName;
  background: TokenName;
  /**
   * The surfaces a translucent background may lie on. An overlay has no colour of its own; the check composites the background over each of them and the worst result decides, naming the surface. Without this field every opaque surface role of the ladder (sunken, canvas, default, raised) is taken. Each named token must be opaque.
   *
   * @minItems 1
   */
  backdrop?: TokenName[];
  kategorio: KontrastKategorio;
  /**
   * Alternative pair (aŭ, 'or'): the KontrastParo holds when the main pair or this pair meets the threshold of the same kategorio (Spec 002, FR-07). Not allowed for text categories; requires a kialo.
   */
  aux?: {
    foreground: TokenName;
    background: TokenName;
  };
  /**
   * Why the pair exists or why its alternative is enough; required with aux (Spec 002, D-09).
   */
  kialo?: string;
};
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "KontrastParoId".
 */
export type KontrastParoId = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "KontrastKategorio".
 */
export type KontrastKategorio = "text-normal" | "text-large" | "ui";
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "IkonoId".
 */
export type IkonoId = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SxablonoId".
 */
export type SxablonoId = string;
/**
 * Where a part property gets its token: bindings keyed by props and state (by), one token (fixed), or the token of another part property (sameAs, 'part.property').
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SkemoPartSource".
 */
export type SkemoPartSource =
  | {
      /**
       * @minItems 1
       */
      by: Name[];
    }
  | {
      /**
       * A role token of core, or one of the two keywords of Spec 008 (plan D-03): inherit (the property comes from the container, E6) or none (the property is not set). The Skemo rules know the keywords; the projections translate them.
       */
      fixed: string;
    }
  | {
      sameAs: string;
    };
/**
 * Platform-neutral part properties (Art. VIII); the mapping to CSS or another platform is Celo knowledge in the projections. position takes a term, not a token: start or end along the control (Spec 010 ①, plan D-04, the knob of a switch). shadow binds an elevation.shadow.* token: the lift of a surface (Spec 011 ②, plan ② D-07, the dialog). stroke binds a stroke.* token or none: the line style of a border (Spec 011 ③, plan ③ D-04, the dashed surface of an empty state). weight binds a font.weight.* token or none: the weight of a text where it departs from its role (Spec 014 ①, plan ① D-01, the current item of a navigation, the active tab); none keeps the weight of the typography role. layer binds an elevation.layer.* token (a number): where a part lies above the page — the skip link, the overlays (Spec 014 ②, plan ② D-04).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SkemoPartProperty".
 */
export type SkemoPartProperty =
  | "fill"
  | "color"
  | "typography"
  | "width"
  | "height"
  | "inline-padding"
  | "gap"
  | "radius"
  | "ring"
  | "offset"
  | "size"
  | "duration"
  | "easing"
  | "position"
  | "shadow"
  | "stroke"
  | "weight"
  | "layer";
/**
 * Text transformation of a typography role (Spec 001, D-11). DTCG has no field for it; the values are platform-neutral.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "TextTransform".
 */
export type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize";
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Alias".
 */
export type Alias = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "EntityType".
 */
export type EntityType =
  | "token"
  | "tokenSet"
  | "dimensio"
  | "dimensioValoro"
  | "regulo"
  | "jugxo"
  | "manko"
  | "kontrastParo"
  | "ero"
  | "skemo"
  | "uzo"
  | "sxablono"
  | "projekcio"
  | "celo"
  | "ikono"
  | "tasko"
  | "kriterio"
  | "faceto";
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "AnyId".
 */
export type AnyId = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "ProjekcioId".
 */
export type ProjekcioId = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "CeloId".
 */
export type CeloId = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "ColorSpace".
 */
export type ColorSpace =
  | "srgb"
  | "srgb-linear"
  | "hsl"
  | "hwb"
  | "lab"
  | "lch"
  | "oklab"
  | "oklch"
  | "display-p3"
  | "a98-rgb"
  | "prophoto-rgb"
  | "rec2020"
  | "xyz-d65"
  | "xyz-d50";
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "ColorComponent".
 */
export type ColorComponent = number | "none";
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "FontFamilyValue".
 */
export type FontFamilyValue = string | string[];
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "FontWeightKeyword".
 */
export type FontWeightKeyword =
  | "thin"
  | "hairline"
  | "extra-light"
  | "ultra-light"
  | "light"
  | "normal"
  | "regular"
  | "book"
  | "medium"
  | "semi-bold"
  | "demi-bold"
  | "bold"
  | "extra-bold"
  | "ultra-bold"
  | "black"
  | "heavy"
  | "extra-black"
  | "ultra-black";
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "FontWeightValue".
 */
export type FontWeightValue = number | FontWeightKeyword;
/**
 * [P1x, P1y, P2x, P2y]; the x coordinates lie in [0, 1].
 *
 * @minItems 4
 * @maxItems 4
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "CubicBezierValue".
 */
export type CubicBezierValue = number[];
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "NumberValue".
 */
export type NumberValue = number;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "StrokeStyleKeyword".
 */
export type StrokeStyleKeyword =
  "solid" | "dashed" | "dotted" | "double" | "groove" | "ridge" | "outset" | "inset";
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "StrokeStyleValue".
 */
export type StrokeStyleValue = StrokeStyleKeyword | StrokeStyleObject;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "ShadowValue".
 */
export type ShadowValue = ShadowLayer | ShadowLayer[];
/**
 * @minItems 1
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "GradientValue".
 */
export type GradientValue = GradientStop[];
/**
 * A DTCG 2025.10 token. $value is a literal of the token's type or a whole-value alias {a.b.c}. With an explicit $type the value is checked here; an inherited type is checked by the Modelo validation.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "DtcgToken".
 */
export type DtcgToken = {
  $value: unknown;
  $type?: DtcgType;
  $description?: string;
  $extensions?: TokenExtensions;
  $deprecated?: Deprecated;
};
/**
 * A design goal one Aspekto sets itself (Spec 004, plan D-03): the same measurement as a Regulo, its own bound and its own reason, checked only for this Aspekto. Reguloj enforce accessibility and structure for every brand; an Aspiro is taste, and taste belongs to the brand.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "AspektoAspiro".
 */
export type AspektoAspiro = AspektoAspiro1 & {
  metriko:
    | "wcag2-reserve"
    | "oklch-l-extreme"
    | "oklch-l-step"
    | "oklch-l-step-consistency"
    | "oklch-l-align"
    | "type-scale-ratio"
    | "type-scale-consistency"
    | "dimensio-kovrado";
  min?: number;
  max?: number;
  appliesTo?: ReguloAppliesTo;
  dimensio?: Name;
  valoro?: Name;
  kialo: NonEmptyText;
};
export type AspektoAspiro1 =
  | {
      min: unknown;
    }
  | {
      max: unknown;
    };
/**
 * A colour of an Agordo (Spec 016, G4): hex with three or six digits, or CSS oklch() with lightness as a number (0…1) or a percentage, chroma and hue as numbers.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "AgordoColor".
 */
export type AgordoColor = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "IdStatus".
 */
export type IdStatus = "active" | "retired";
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "TaskoId".
 */
export type TaskoId = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "KriterioId".
 */
export type KriterioId = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "FacetoId".
 */
export type FacetoId = string;

/**
 * Canonical schema of the Fundamento Modelo. The root validates the exported modelo.json; $defs describe every Key Entity and every source-file format (set files and the data files).
 */
export interface ModeloJson {
  $schema: string;
  fundamento: {
    version: Version;
  };
  dimensioj: Dimensio[];
  aspektoj: AspektoEntry[];
  tokenTypes: DtcgType[];
  tokens: TokenInventoryEntry[];
  setoj: ExportedSet[];
  reguloj: Regulo[];
  jugxoj: Jugxo[];
  mankoj: Manko[];
  /**
   * The Uzoj of the Eroj (Spec 007); absent while no Ero has one.
   */
  uzoj?: Uzo[];
  kontrastParoj: KontrastParo[];
  gvidanto?: Gvidanto;
  tradukoj?: Tradukoj;
  /**
   * The Fontoj (Spec 029 ①, Constitution v2.4): open design systems the Modelo takes values from, pinned; absent while it takes from none.
   */
  fontoj?: FontoSistemo[];
  /**
   * The provenance of every value an Aspekto took from a Fonto (Spec 029 ①, Art. VII), each with its Aspekto; absent while there is none.
   */
  deveno?: (DevenoValoro & {
    aspekto: Name;
  })[];
  /**
   * The Ikonaro (Spec 014 ①): the icon names of the core with meaning and kialo; absent while the Modelo has none.
   */
  ikonaro?: Ikono[];
  eroj: Ero[];
  /**
   * The Sxablonoj (Spec 020): patterns of Eroj, each with its Skemo of regions and its Uzo; absent while the Modelo has none.
   */
  sxablonoj?: SxablonoEntry[];
  skemoj: Skemo[];
  rezolvo: Rezolvo;
  /**
   * Facts of the core (Spec 001, FR-10): the reference Aspekto whose values live in core.
   */
  core?: {
    referenceAspekto?: Name;
  };
}
/**
 * An adaptation dimension. priority is unique; 1 is lowest and higher priorities win in resolution. The values of the aspekto Dimensio come from the loaded Aspekto packages (Spec 001, D-05), so dimensioj.json lists none for it; every other Dimensio lists its values (dimensio-default-invalid otherwise).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Dimensio".
 */
export interface Dimensio {
  id: DimensioId;
  name: Name;
  priority: number;
  default: Name;
  /**
   * Only on the aspekto Dimensio: the reference Aspekto whose values live in core (Spec 001, FR-10).
   */
  referenceAspekto?: string;
  /**
   * @minItems 1
   */
  valoroj?: DimensioValoro[];
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "DimensioValoro".
 */
export interface DimensioValoro {
  id: DimensioValoroId;
  name: Name;
  kontrastSojloj?: KontrastSojloj;
  aspekto?: AspektoMetadata;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "KontrastSojloj".
 */
export interface KontrastSojloj {
  wcag2: Wcag2Sojloj;
  apca?: ApcaSojloj;
}
/**
 * Minimum WCAG 2.x contrast ratios (binding).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Wcag2Sojloj".
 */
export interface Wcag2Sojloj {
  "text-normal": number;
  "text-large": number;
  ui: number;
}
/**
 * Minimum absolute APCA Lc values (advisory).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "ApcaSojloj".
 */
export interface ApcaSojloj {
  "text-normal": number;
  "text-large": number;
  ui: number;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "AspektoMetadata".
 */
export interface AspektoMetadata {
  owner: NonEmptyText;
  licenseNote: NonEmptyText;
}
/**
 * Convenience view of one value of the aspekto Dimensio (it shares the DimensioValoro ID).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "AspektoEntry".
 */
export interface AspektoEntry {
  id: DimensioValoroId;
  name: Name;
  owner: NonEmptyText;
  licenseNote?: NonEmptyText;
  license?: License;
  fonts?: Fonto[];
  /**
   * True for the reference Aspekto (core.referenceAspekto).
   */
  reference?: boolean;
  /**
   * True when the package lies outside the core repository.
   */
  external?: boolean;
  package?: NonEmptyText;
  idNamespace?: IdNamespace;
  /**
   * The adjustable text rules of a Uzo this Aspekto overrides, with the Jugxo that records each deviation (Spec 007, D-03); absent when it overrides nothing.
   *
   * @minItems 1
   */
  overrides?: LingvoOverride[];
}
/**
 * A font family an Aspekto uses. Font files never enter the core repository; the fallback stack lives only in the fontFamily token value.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Fonto".
 */
export interface Fonto {
  family: NonEmptyText;
  license: License;
  source: NonEmptyText;
  redistributable: boolean;
  /**
   * Writing systems the family covers, as ISO 15924 codes (Latn, Cyrl, Arab, Hans, …); at least one (Spec 001, T018b).
   *
   * @minItems 1
   */
  scripts: Iso15924[];
}
/**
 * An Aspekto overrides an adjustable text rule of a Uzo, with the Jugxo that records the deviation (Spec 007, A7, D-03). A fixed rule cannot be overridden.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "LingvoOverride".
 */
export interface LingvoOverride {
  regulo: Name;
  jugxo: JugxoId;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "TokenInventoryEntry".
 */
export interface TokenInventoryEntry {
  id: TokenId;
  name: TokenName;
  type: DtcgType;
  description?: string;
  role?: TokenRole;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "ExportedSet".
 */
export interface ExportedSet {
  id: TokenSetId;
  name: SetName;
  kondicxoj: KondicxoExpression[];
  tree: TokenSetFile;
  /**
   * The Aspekto package that holds the set (Spec 001, D-08); absent for core sets.
   */
  package?: string;
}
/**
 * Root of a set file (vortaro/sets/<set-name>.json): a DTCG group whose extension carries the set ID and its kondicxoj (empty for core).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "TokenSetFile".
 */
export interface TokenSetFile {
  $type?: DtcgType;
  $description?: string;
  $extensions?: SetExtensions;
  $deprecated?: Deprecated;
  [k: string]: DtcgNode | DtcgType | string | SetExtensions | Deprecated | undefined;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SetExtensions".
 */
export interface SetExtensions {
  "com.ciferecigo.fundamento"?: SetFundamentoExtension;
  [k: string]: unknown;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SetFundamentoExtension".
 */
export interface SetFundamentoExtension {
  id: TokenSetId;
  kondicxoj: KondicxoExpression[];
}
/**
 * A token (object with $value) or a group (anything else).
 *
 * This interface was referenced by `TokenSetFile`'s JSON-Schema definition
 * via the `patternProperty` "^[a-z0-9]+$".
 *
 * This interface was referenced by `DtcgGroup`'s JSON-Schema definition
 * via the `patternProperty` "^[a-z0-9]+$".
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "DtcgNode".
 */
export interface DtcgNode {
  [k: string]: unknown;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Regulo".
 */
export interface Regulo {
  id: ReguloId;
  name: Name;
  statement: NonEmptyText;
  kialo: NonEmptyText;
  scope: NonEmptyText;
  checkability: "automatic" | "manual";
  /**
   * Scopes the entry to one Aspekto; entries in an Aspekto package carry their Aspekto (Spec 001, D-10).
   */
  aspekto?: string;
  appliesTo?: ReguloAppliesTo;
  sojlo?: ReguloSojlo;
}
/**
 * Which tokens the Regulo governs; explain finds a token's Reguloj only through this field (Spec 002, D-02). A token matches when any criterion matches. Token patterns may use * for one segment and a trailing ** for one or more.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "ReguloAppliesTo".
 */
export interface ReguloAppliesTo {
  /**
   * @minItems 1
   */
  tokens?: TokenPattern[];
  /**
   * @minItems 1
   */
  roles?: TokenRole[];
  /**
   * @minItems 1
   */
  types?: DtcgType[];
  /**
   * @minItems 1
   */
  eroj?: Name[];
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Jugxo".
 */
export interface Jugxo {
  id: JugxoId;
  ref: JugxoReguloRef | JugxoEroRef | JugxoArtikoloRef;
  decision: "approved" | "rejected" | "deviation-recorded";
  kialo: NonEmptyText;
  date: string;
  context: string;
  /**
   * Scopes the entry to one Aspekto; entries in an Aspekto package carry their Aspekto (Spec 001, D-10).
   */
  aspekto?: string;
  ekzemplo?: JugxoEkzemplo;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "JugxoReguloRef".
 */
export interface JugxoReguloRef {
  regulo: ReguloId;
  /**
   * The Celo this Jugxo belongs to. Which names exist is knowledge of the projections and lives in code, not here (Article VIII).
   */
  celo?: string;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "JugxoEroRef".
 */
export interface JugxoEroRef {
  ero: EroId;
  /**
   * The Celo this Jugxo belongs to. Which names exist is knowledge of the projections and lives in code, not here (Article VIII).
   */
  celo?: string;
}
/**
 * A constitution Article (I to XIII), for Jugxoj that record a deviation from the constitution itself.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "JugxoArtikoloRef".
 */
export interface JugxoArtikoloRef {
  artikolo:
    "I" | "II" | "III" | "IV" | "V" | "VI" | "VII" | "VIII" | "IX" | "X" | "XI" | "XII" | "XIII";
  /**
   * The Celo this Jugxo belongs to. Which names exist is knowledge of the projections and lives in code, not here (Article VIII).
   */
  celo?: string;
}
/**
 * A machine-readable example of the Jugxo: instances right (approved) or wrong (rejected), optionally for one Regulo.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "JugxoEkzemplo".
 */
export interface JugxoEkzemplo {
  regulo?: ReguloId;
  /**
   * @minItems 1
   */
  instances: EroInstance[];
}
/**
 * One use of an Ero in a design or code: the input of check_usage and of a Jugxo ekzemplo.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "EroInstance".
 */
export interface EroInstance {
  ero: Name;
  props: {
    [k: string]: string | number | boolean;
  };
  container?: string;
  /**
   * The goal of the instance, a goal of its Skemo (destructive, confirm, dismiss). Called goal since F1-T00 (Spec 007, OP-4); intent is a prop.
   */
  goal?: string;
  label?: string;
  /**
   * The language of the instance's texts (ISO 639-1), so that check_usage answers with an example in that language (Spec 008, plan D-06). Without it the language is read from the label.
   */
  lingvo?: string;
  /**
   * The texts of the other text slots of the instance, by slot name (Spec 009, plan D-06): help, error. The label stays label. A slot that takes several entries gives one text per entry, as a list (Spec 010 ③, plan ③ D-09): the labels of the options.
   */
  texts?: {
    [k: string]: string | string[];
  };
  /**
   * The Aspekto the instance is shown in; its overrides of adjustable text rules apply (Spec 007, A10).
   */
  aspekto?: string;
  /**
   * Dimensio values the instance is shown under, e.g. viewport=compact (Spec 007, A6).
   */
  dimensioj?: {
    [k: string]: Name;
  };
  /**
   * What stands in each slot: text, an icon or another Ero by name (Spec 007, A5). An unknown Ero name is allowed here; it describes the design.
   */
  slots?: {
    [k: string]: (
      | ("text" | "icon")
      | {
          ero: Name;
        }
    )[];
  };
}
/**
 * A measured gap of a tool: something the Modelo can express and the target cannot carry. It holds the evidence in the tool's own words, the date it was measured and the condition under which a run may call it closed. It is never a version query: the attempt is the measurement.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Manko".
 */
export interface Manko {
  id: MankoId;
  /**
   * The Celo whose target has the gap. Which names exist is knowledge of the projections and lives in code, not here (Article VIII).
   */
  celo: string;
  /**
   * The affected property, as the target names it.
   */
  property: string;
  /**
   * What the Modelo can express about this property.
   */
  modelo: string;
  /**
   * What the target does instead of what the Modelo asks of it.
   */
  instead: string;
  /**
   * The proof in the tool's own words: the message a run measured.
   */
  evidence: string;
  /**
   * The day the gap was measured.
   */
  date: string;
  /**
   * The outward reference: a forum thread, an issue, or the documentation the measurement was held against.
   */
  external: string;
  closing: MankoClosing;
}
/**
 * How a run recognises that the gap is gone. A Manko without it is invalid, as a Regulo without kialo (Article VI): a gap nobody can measure away is a complaint, not a finding.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "MankoClosing".
 */
export interface MankoClosing {
  /**
   * The kind of measurement a run performs. `binding-accepted`: the run binds the property to a variable of the target and the target does not refuse it. `import-kept`: a file of the Celo is imported into the target and the target keeps what it previously skipped. `theme-conjunction`: the target activates a set listed under themes of two groups only while both themes are active. `library-sync`: a second file of the target that links the Celo file as a library shows its sets and themes without an import of its own, and a change to the Vortaro reaches it.
   */
  measure: "binding-accepted" | "import-kept" | "theme-conjunction" | "library-sync";
  statement: NonEmptyText;
}
/**
 * How an Ero is used (Spec 007, data-model §2): what it is for and what not, where it stops, what it stands with, its slot, layout and text rules. Brand-neutral; holds no visible text.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Uzo".
 */
export interface Uzo {
  id: UzoId;
  ero: EroId;
  skemo: SkemoId;
  /**
   * One sentence: what the Ero is for (A2).
   */
  purpose: string;
  instead: UzoInstead[];
  /**
   * The cases the Ero does not cover; every Ero has at least one (A3).
   *
   * @minItems 1
   */
  boundary: UzoBoundary[];
  composes: UzoComposes;
  /**
   * Rules per slot of the Skemo (A5); the keys must be slots of the Skemo.
   */
  slots: {
    [k: string]: UzoSlot;
  };
  layout: UzoLayout;
  content: UzoContent[];
}
/**
 * A goal the Ero does not serve and what to take instead: another Ero, or null for 'not covered' (A2).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "UzoInstead".
 */
export interface UzoInstead {
  goal: Name;
  keywords: Keywords;
  ero: Name | null;
  kialo: NonEmptyText;
}
/**
 * Search vocabulary per language (ISO 639-1 code to a non-empty word list). Keywords find an entry for suggest_ero; they are never shown (Spec 003 D-16, Spec 007 data-model §2.1).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Keywords".
 */
export interface Keywords {
  /**
   * @minItems 1
   */
  [k: string]: string[];
}
/**
 * A case the Ero does not cover, with what to do about it (A3). use-instead names the other Ero.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "UzoBoundary".
 */
export interface UzoBoundary {
  case: Name;
  action: "use-instead" | "ask-human" | "not-supported";
  ero?: Name;
  keywords?: Keywords;
  /**
   * The check by which check_usage recognises the case (A10).
   */
  via?:
    | {
        slot: Name;
      }
    | {
        layout: "wrap";
      }
    | {
        regulo: Name;
      };
  kialo: NonEmptyText;
}
/**
 * Where the Ero stands and with whom (A4). The space between siblings belongs to the container.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "UzoComposes".
 */
export interface UzoComposes {
  containers: {
    name: Name;
    kialo: NonEmptyText;
  }[];
  with: UzoEroRelation[];
  never: UzoEroRelation[];
  spacing: {
    owner: "container";
    regulo: Name;
  };
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "UzoEroRelation".
 */
export interface UzoEroRelation {
  ero: Name;
  kialo: NonEmptyText;
}
/**
 * What a slot accepts (text, icon or an Ero name), how many, whether it is required and how deep it may nest (A5).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "UzoSlot".
 */
export interface UzoSlot {
  /**
   * @minItems 1
   */
  accepts?: Name[];
  max?: number;
  /**
   * The fewest entries the slot takes when it is used (Spec 010 ③, plan ③ D-10): a radio group of one option is no choice. Judged like max (uzo-slot-min).
   */
  min?: number;
  required?: boolean;
  nesting?: number;
}
/**
 * Layout behaviour in platform-neutral words (A6, Art. VIII). Every key besides size and wrap is a boolean prop of the Skemo with the containers or Dimensio values it is allowed in.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "UzoLayout".
 */
export interface UzoLayout {
  size: "content" | "container";
  /**
   * never: the label stays on one line; allowed: it may break; with-text: it breaks only with the running text it stands in (a container of kind text), standing alone it never breaks (Spec 008, plan D-04).
   */
  wrap: "never" | "allowed" | "with-text";
  /**
   * The container width from which the Ero lays itself out side by side (its layout auto: name beside value), a size.container.* token of core; below it the Ero stacks (Spec 014 ①, plan ① D-03). Layout behaviour, so it stands in the Uzo (Constitution: Uzo); the Skemo binds the two looks, the projection measures the container.
   */
  "columns-from"?: string;
  [k: string]:
    | UzoLayoutAllowance
    | "content"
    | "container"
    | "never"
    | "allowed"
    | "with-text"
    | string
    | undefined;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "UzoLayoutAllowance".
 */
export interface UzoLayoutAllowance {
  allowedIn: {
    /**
     * @minItems 1
     */
    containers?: Name[];
    dimensioj?: {
      /**
       * @minItems 1
       */
      [k: string]: Name[];
    };
  };
  regulo: Name;
}
/**
 * A text rule (A7): the Regulo it enforces, whether an Aspekto may override it, and its deterministic check. A fixed rule always reports an error.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "UzoContent".
 */
export interface UzoContent {
  regulo: Name;
  fixed: boolean;
  /**
   * The text the rule judges (Spec 009, plan D-06): a slot or a prop of the Skemo; default slot:label.
   */
  of?: string;
  severity?: "error" | "warning";
  /**
   * When the rule applies (Spec 009 D-06: instances of a goal; Spec 011 ③ D-06: instances with one of the listed values of a prop — the error rule of the avizo for intent danger). At least one of goal and props.
   */
  when?: {
    /**
     * @minItems 1
     */
    goal?: Name[];
    props?: {
      /**
       * @minItems 1
       */
      [k: string]: Name[];
    };
  };
  check:
    | {
        kind: "names-goal";
      }
    | {
        kind: "min-words";
        count: number;
      }
    | {
        kind: "max-words";
        count: number;
      }
    | {
        kind: "max-sentences";
        count: number;
      }
    | {
        kind: "not-instead";
      }
    | {
        kind: "distinct";
      }
    | {
        kind: "levels-in-order";
      }
    | {
        kind: "max-entries";
        count: number;
      }
    | {
        kind: "verb-and-object";
        goal: Name;
      }
    | {
        kind: "not-words";
        words: Keywords;
      };
}
/**
 * The words of the Gvidanto (Nachlese 8 ①, D-11): what only opens a request, per language; absent while the Modelo has none.
 */
export interface Gvidanto {
  /**
   * What only opens a request and names nothing („ich brauche“, „bitte“, „I need“): skipped, longest first and lower case, before the first word names a Sxablono.
   */
  fillers: {
    [k: string]: string[];
  };
}
/**
 * The translations of the texts of the Uzoj and the Reguloj (Nachlese 8 ③): per language, per text under its ID; English stays the source. Absent while the Modelo has none.
 */
export interface Tradukoj {
  [k: string]: {
    [k: string]: string;
  };
}
/**
 * A Fonto (Constitution v2.4, Art. V): a design system with an open, permissive licence that Fundamento takes values from, pinned to one version and commit (data/fontoj.json). Not to be confused with $defs/Fonto, a font family of an Aspekto.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "FontoSistemo".
 */
export interface FontoSistemo {
  id: Name;
  name: NonEmptyText;
  license: License;
  copyright: NonEmptyText;
  source: NonEmptyText;
  version: string;
  tag?: NonEmptyText;
  commit: string;
  /**
   * @minItems 1
   */
  packages: {
    name: NonEmptyText;
    version: string;
    integrity: string;
  }[];
  read: string;
  scope: NonEmptyText;
  notices: NonEmptyText;
}
/**
 * The provenance of one value an Aspekto took from a Fonto (Constitution v2.4, Art. VII): the token and the set it is written in, the Fonto, the source file and key, the Fonto's value, the value written and how it was taken. A value a Regulo changed names its Jugxo.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "DevenoValoro".
 */
export interface DevenoValoro {
  token: TokenName;
  /**
   * The Aspekto the value belongs to; in deveno.json the file names it once, in modelo.json every entry.
   */
  aspekto?: string;
  aro: NonEmptyText;
  fonto: Name;
  dosiero: NonEmptyText;
  sxlosilo: NonEmptyText;
  fontoValoro: NonEmptyText;
  valoro: NonEmptyText;
  /**
   * prenita: taken as it is; konvertita: converted into Fundamento's units; kunmetita: composed from Fonto values as the Fonto composes them; rundita / kunmetita-rundita: the nearest step of Fundamento; interpolita: between two steps of the Fonto; derivita: derived where the Fonto has no value; adaptita: changed because a Regulo or an Aspiro wins (names its Jugxo).
   */
  maniero:
    | "prenita"
    | "konvertita"
    | "kunmetita"
    | "rundita"
    | "kunmetita-rundita"
    | "interpolita"
    | "derivita"
    | "adaptita";
  /**
   * A field of a composite value (fontWeight of a typography token) when only that field is taken.
   */
  kampo?: string;
  jugxo?: JugxoId;
  kialo?: NonEmptyText;
  noto?: NonEmptyText;
}
/**
 * One name of the Ikonaro (Spec 014 ①, G3, E9): an icon is vocabulary in the core — a name, its meaning in de and en and a kialo — and a picture in every Aspekto package (ikonoj/<name>.svg, checked by check:ikonaro). mirror says that the direction carries meaning and the glyph is mirrored in right-to-left writing (chevron-right; a check is not).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Ikono".
 */
export interface Ikono {
  id: IkonoId;
  name: Name;
  meaning: {
    de: NonEmptyText;
    en: NonEmptyText;
    [k: string]: NonEmptyText;
  };
  kialo: NonEmptyText;
  mirror?: boolean;
}
/**
 * A component (Spec 003). Lives with its Skemo in data/eroj/<name>/skemo.json.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Ero".
 */
export interface Ero {
  id: EroId;
  name: Name;
  skemo: SkemoId;
  description: NonEmptyText;
}
/**
 * A Sxablono in modelo.json (Spec 020): the Sxablono, its Skemo and its Uzo, read back by modeloFromExport.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SxablonoEntry".
 */
export interface SxablonoEntry {
  sxablono: Sxablono;
  skemo: SxablonoSkemo;
  uzo?: SxablonoUzo;
}
/**
 * A template or pattern (Spec 020, E1): a layout, page type or flow of Eroj, with a Skemo of regions and an Uzo like an Ero's. kind says which: layout (the frame of an application), page (a page), flow (a form, a filter bar, an editor).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Sxablono".
 */
export interface Sxablono {
  id: SxablonoId;
  name: Name;
  skemo: SkemoId;
  kind: "layout" | "page" | "flow";
  description: string;
}
/**
 * The blueprint of a Sxablono (Spec 020, G1): its regions (each a slot in the projection), its props, what it sets for accessibility (landmarks, the skip target, the focus target), the goals suggest_ero answers with it, and the tokens of its layout (parts, as an Ero's).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SxablonoSkemo".
 */
export interface SxablonoSkemo {
  id: SkemoId;
  sxablono: SxablonoId;
  props: SkemoProp[];
  /**
   * @minItems 1
   */
  regions: SxablonoRegion[];
  a11y: SxablonoA11Y;
  goals?: SxablonoGoal[];
  /**
   * The events the element of the Sxablono says to the application (Nachlese 11 B-2: submit of the formularo), as an Ero's; absent where it says none.
   */
  events?: SkemoEvent[];
  /**
   * The tokens of the layout, by part and platform-neutral property (Art. VIII); the projection maps them. The part container takes width: the container width below which the regions stack (a size.container.* token).
   */
  parts: {
    [k: string]: SkemoPart;
  };
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SkemoProp".
 */
export interface SkemoProp {
  name: Name;
  kind: "enum" | "boolean" | "string" | "number";
  /**
   * @minItems 1
   */
  values?: Name[];
  default?: string | number | boolean;
  description?: NonEmptyText;
  /**
   * The prop must be given (get_ero brief lists it under required.props). A prop without a default is not a duty by that alone: label is the fallback name of an empty slot, value the text of an empty field (Abnahme Spec 008/009 R-10, 2026-10-13).
   */
  required?: boolean;
}
/**
 * A named region of a Sxablono (Spec 020): what may stand in it (Ero or Sxablono names, text or icon; any content where accepts is absent), how many, which props its children must have, how many of them may be primary actions (emphasis high), and whether it is a polite live region. One region may be the default slot.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SxablonoRegion".
 */
export interface SxablonoRegion {
  name: Name;
  description: string;
  required?: boolean;
  default?: boolean;
  /**
   * @minItems 1
   */
  accepts?: Name[];
  min?: number;
  max?: number;
  /**
   * Props every Ero in the region must have, with their values (the title of a page: level 1, focusable).
   */
  props?: {
    [k: string]: string | boolean;
  };
  /**
   * At most this many children with emphasis high (Regulo one-primary-per-container).
   */
  primary?: number;
  /**
   * Exactly one child of the region has these props (Spec 020 ②: the one submit button of a form).
   */
  one?: {
    [k: string]: string;
  };
  live?: "polite";
}
/**
 * What a Sxablono sets for accessibility (Spec 020, G4): the landmarks it renders (once per page), the region its own skip link jumps to, the region that holds the page's focus target.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SxablonoA11y".
 */
export interface SxablonoA11Y {
  landmarks: ("banner" | "navigation" | "main" | "search" | "contentinfo" | "complementary")[];
  skip?: Name;
  focus?: Name;
}
/**
 * A goal suggest_ero answers with the Sxablono (Spec 020, G3): its keywords, the props to set and why.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SxablonoGoal".
 */
export interface SxablonoGoal {
  goal: Name;
  keywords: Keywords;
  props: {
    [k: string]: string;
  };
  kialo: string;
  /**
   * What the answer names per region for this goal (Spec 020 ②: a sign-in form holds a kampo of kind password and a butono of type submit).
   */
  children?: {
    region: Name;
    ero: Name;
    props?: {
      [k: string]: string | boolean;
    };
  }[];
}
/**
 * An event the element of an Ero says to the application (Spec 025 ①, plan ① D-01; benchmark gap 7): its name in the core grammar (change, input, remove), what it means, and whether the application may cancel it (a cancelable remove lets the application keep a tag). Platform-neutral (Art. VIII): a name, not a DOM event type.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SkemoEvent".
 */
export interface SkemoEvent {
  name: Name;
  cancelable?: boolean;
  description: NonEmptyText;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SkemoPart".
 */
export interface SkemoPart {
  [k: string]: SkemoPartSource;
}
/**
 * The use of a Sxablono (Spec 020, G1): the same structure as an Ero's Uzo — purpose, alternatives, boundaries, composition — without slot rules (the regions of the Skemo say what stands where).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SxablonoUzo".
 */
export interface SxablonoUzo {
  id: UzoId;
  sxablono: SxablonoId;
  skemo: SkemoId;
  purpose: string;
  instead: UzoInstead[];
  /**
   * @minItems 1
   */
  boundary: UzoBoundary[];
  composes: UzoComposes;
}
/**
 * The machine-readable specification of an Ero (Spec 003, data-model §2): the single source of every projection.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Skemo".
 */
export interface Skemo {
  id: SkemoId;
  ero: EroId;
  props: SkemoProp[];
  /**
   * @minItems 1
   */
  states: Name[];
  slots: SkemoSlot[];
  parts: {
    [k: string]: SkemoPart;
  };
  bindings: SkemoBinding[];
  a11y: SkemoA11Y;
  /**
   * The events the element says (Spec 025 ①, plan ① D-01): change, input, a cancelable remove; unique by name (skemo-event-invalid). Absent for an Ero that says none.
   */
  events?: SkemoEvent[];
  constraints?: SkemoConstraint[];
  /**
   * The goals a user may have with the Ero (delete, save, cancel); suggest_ero matches a word of the user against their keywords. Called goals, not intents, so that the word intent is free for a prop (Spec 007, OP-4, F1-T00).
   */
  goals?: SkemoGoal[];
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SkemoSlot".
 */
export interface SkemoSlot {
  name: Name;
  default?: boolean;
  text?: boolean;
  decorative?: boolean;
  /**
   * The text of the slot stands beside the control, on the ground of the container, not on a part of the Ero (Spec 010 ①, plan D-07): the label of a switch next to its track. skemo-kontrastparo-missing does not pair it with the Ero's fills.
   */
  beside?: boolean;
  /**
   * Every entry of the slot is one option of its own, a text with a value (Spec 010 ③, E7, plan ③ D-02): the options of a radio group. key names the state of one entry, a boolean the parts may be keyed by (by, when) — true for the entry whose value is the value of the string prop equals, false for every other. A state of the entry, not of the Ero: no prop, no axis of the variants. empty names a string prop whose text is a first entry with the value "" (Spec 011 ①, plan ① D-09): the empty option of a select, 'Alle'; it counts among the entries for the rules on them.
   */
  entry?: {
    key: Name;
    equals: Name;
    empty?: Name;
    /**
     * A second state of one entry (Nachlese 4 N-8): the entry the keyboard stands on while the focus stays elsewhere — the active suggestion of a combobox (aria-activedescendant). True for that one entry, false for every other; no prop holds it, the element sets it as the person keys through the list. Parts may be keyed by it (by, when) like by key; no axis of the variants.
     */
    active?: string;
  };
  /**
   * The text of the slot is for assistive technology alone (Spec 011 ③, plan ③ D-05): present in the accessible content, never shown — the long form of a badge; a projection keeps it out of sight, a drawn set leaves it out.
   */
  hidden?: boolean;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SkemoBinding".
 */
export interface SkemoBinding {
  part: Name;
  property: SkemoPartProperty;
  when?: {
    [k: string]: Name;
  };
  /**
   * A role token of core, or the keyword inherit or none (Spec 008, plan D-03; see SkemoPartSource.fixed); for the property position one of the terms start or end (Spec 010 ①, plan D-04).
   */
  token: string;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SkemoA11y".
 */
export interface SkemoA11Y {
  role: Name;
  /**
   * Where the accessible name comes from, in order: slots or props. Empty for an Ero that is never named — a separator (Spec 014 ②, plan ② D-03).
   */
  name: string[];
  states: {
    [k: string]: string[];
  };
  keys: string[];
  /**
   * Where the accessible description comes from, in order (Spec 009 A1, plan D-02): slots or props, like name. The Web Celo renders it as aria-describedby.
   *
   * @minItems 1
   */
  description?: string[];
  /**
   * What assistive technology hears in addition when a boolean prop is true (Spec 008 A1, plan D-02): per prop a text per language (ISO 639-1), never shown. The key must be a boolean prop of the Skemo (skemo-a11y-invalid); de and en are required.
   */
  texts?: {
    [k: string]: {
      de: NonEmptyText;
      en: NonEmptyText;
      [k: string]: NonEmptyText;
    };
  };
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SkemoConstraint".
 */
export interface SkemoConstraint {
  /**
   * Prop values the constraint applies to; a key slot:<name> with filled or empty reads a slot (Spec 009, plan D-04); a key prop:<name> with filled or empty reads a string prop (Spec 011 ①, plan ① D-08).
   */
  when: {
    /**
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^slot:[a-z0-9]+(-[a-z0-9]+)*$".
     *
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^prop:[a-z0-9]+(-[a-z0-9]+)*$".
     */
    [k: string]: "filled" | "empty" | Name;
  };
  /**
   * The values each named prop may take while the constraint applies; a key prop:<name> allows filled or empty of a string prop (Spec 011 ①, plan ① D-08).
   */
  allowed: {
    /**
     * @minItems 1
     */
    [k: string]: Name[];
  };
  kialo: NonEmptyText;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SkemoGoal".
 */
export interface SkemoGoal {
  goal: Name;
  keywords: Keywords;
  props: {
    [k: string]: string | number | boolean;
  };
  regulo?: Name;
}
/**
 * Result of one resolution: the complete assignment (dimensio -> valoro) and every token with value and provenance.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Rezolvo".
 */
export interface Rezolvo {
  assignment: {
    [k: string]: Name;
  };
  tokens: {
    [k: string]: ResolvedToken;
  };
}
/**
 * A token's final value in one combination, with aliases fully inlined, plus its provenance.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "ResolvedToken".
 */
export interface ResolvedToken {
  id: TokenId;
  type: DtcgType;
  value: unknown;
  origin: ResolvedTokenOrigin;
  aliasChain: AliasLink[];
  fieldAliases?: {
    [k: string]: AliasLink[];
  };
  /**
   * Text transformation of a typography token and the set that states it; the last active set that states one wins (Spec 001, D-11). Absent when no set states one.
   */
  textTransform?: {
    value: TextTransform;
    set: SetName;
  };
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "ResolvedTokenOrigin".
 */
export interface ResolvedTokenOrigin {
  set: SetName;
  setId: TokenSetId;
  /**
   * The Aspekto package that holds the set (Spec 001, D-08); absent for core sets.
   */
  package?: string;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "AliasLink".
 */
export interface AliasLink {
  token: TokenName;
  set: SetName;
}
/**
 * DTCG 2025.10 color: colour space plus three components, optional alpha and a 6-digit hex fallback.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "ColorValue".
 */
export interface ColorValue {
  colorSpace: ColorSpace;
  /**
   * @minItems 3
   * @maxItems 3
   */
  components: ColorComponent[];
  alpha?: number;
  hex?: string;
}
/**
 * DTCG dimension. Only px is accepted: a platform-neutral reference unit (1 px = 1 pt = 1 dp), FR-09a.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "DimensionValue".
 */
export interface DimensionValue {
  value: number;
  unit: "px";
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "DurationValue".
 */
export interface DurationValue {
  value: number;
  unit: "ms" | "s";
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "StrokeStyleObject".
 */
export interface StrokeStyleObject {
  /**
   * @minItems 1
   */
  dashArray: (Alias | DimensionValue)[];
  lineCap: "round" | "butt" | "square";
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "BorderValue".
 */
export interface BorderValue {
  color: Alias | ColorValue;
  width: Alias | DimensionValue;
  style: Alias | StrokeStyleValue;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "TransitionValue".
 */
export interface TransitionValue {
  duration: Alias | DurationValue;
  delay: Alias | DurationValue;
  timingFunction: Alias | CubicBezierValue;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "ShadowLayer".
 */
export interface ShadowLayer {
  color: Alias | ColorValue;
  offsetX: Alias | DimensionValue;
  offsetY: Alias | DimensionValue;
  blur: Alias | DimensionValue;
  spread: Alias | DimensionValue;
  inset?: boolean;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "GradientStop".
 */
export interface GradientStop {
  color: Alias | ColorValue;
  position: Alias | number;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "TypographyValue".
 */
export interface TypographyValue {
  fontFamily: Alias | FontFamilyValue;
  fontSize: Alias | DimensionValue;
  fontWeight: Alias | FontWeightValue;
  letterSpacing: Alias | DimensionValue;
  lineHeight: Alias | NumberValue;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "TokenFundamentoExtension".
 */
export interface TokenFundamentoExtension {
  id: TokenId;
  role?: TokenRole;
  textTransform?: TextTransform;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "TokenExtensions".
 */
export interface TokenExtensions {
  "com.ciferecigo.fundamento"?: TokenFundamentoExtension;
  [k: string]: unknown;
}
/**
 * Extensions of a nested group. The Fundamento key is only allowed on tokens and on the set root.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "GroupExtensions".
 */
export interface GroupExtensions {
  "com.ciferecigo.fundamento"?: never;
  [k: string]: unknown;
}
/**
 * A DTCG group. Child keys are name segments ([a-z0-9]+, FR-13a); the canonical token name is the dot-joined path.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "DtcgGroup".
 */
export interface DtcgGroup {
  $type?: DtcgType;
  $description?: string;
  $extensions?: GroupExtensions;
  $deprecated?: Deprecated;
  [k: string]: DtcgNode | DtcgType | string | GroupExtensions | Deprecated | undefined;
}
/**
 * Layers of the brand package (Spec 001, D-20): the Aspekto package is the brand package and the Vortaro is one of its layers. Phase 1 reserves only the key vida, with the empty value {}; Spec 007 gives lingvo its overrides of adjustable text rules. Other keys are allowed and ignored by validation.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Tavoloj".
 */
export interface Tavoloj {
  vida?: {};
  /**
   * The voice of the brand. Only overrides is specified (Spec 007, D-03); the rest of the layer is a candidate.
   */
  lingvo?: {
    overrides?: LingvoOverride[];
  };
}
/**
 * aspekto.json of an Aspekto package (Spec 001, D-05). `id` is the DimensioValoro ID of the Aspekto; `idNamespace` is required for every package except the reference Aspekto (checked on composition).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "AspektoFile".
 */
export interface AspektoFile {
  id: DimensioValoroId;
  name: Name;
  owner: NonEmptyText;
  license: License;
  idNamespace?: IdNamespace;
  fonts: Fonto[];
  tavoloj?: Tavoloj;
  aspiroj?: AspektoAspiro[];
  /**
   * Display names of the brand (Spec 024, § 3 B): the brand as written (`marko`), a palette or a role → its name as the Studio, the Vitrino and the Guidelines show it; identifiers stay canonical (Art. II).
   */
  etikedoj?: {
    [k: string]: NonEmptyText;
  };
  agordilo?: AspektoAgordilo;
  /**
   * The icon set the package draws the Ikonaro from (Spec 014 ①, G3, E10; Art. V: open source with a permissive licence in the core repository, Art. VII: the import carries its provenance): the set's name, the style drawn (a set with several styles: komuna Phosphor regular, ekzemplo Phosphor fill), the version read, its licence, the source and the day it was read, and the map from each Ikonaro name to the name of the set it is drawn from (plan ① D-04). Every glyph repeats source, version and licence in its own metadata. A package that draws its own glyphs names neither style nor map.
   */
  ikonoj?: {
    set: NonEmptyText;
    style?: NonEmptyText;
    version: NonEmptyText;
    license: License;
    source: NonEmptyText;
    read: string;
    /**
     * Ikonaro name → name of the icon in the set (both kebab-case).
     */
    names?: {
      [k: string]: Name;
    };
  };
}
/**
 * The origin of an Aspekto derived by the Agordilo (Spec 016, G1): the Agordo it was derived from, the version of the Agordilo and the structure it was written from (the Vortaro version, the reference Aspekto whose roles and assignment it keeps, and a SHA-256 fingerprint over the structure files and the calibration). Deriving is a write at save time; nothing is inherited at run time (Art. IV).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "AspektoAgordilo".
 */
export interface AspektoAgordilo {
  version: NonEmptyText;
  structure: {
    vortaro: NonEmptyText;
    reference: Name;
    sha256: string;
  };
  agordo: Agordo;
}
/**
 * The recipe of a brand for the Agordilo (Spec 016, G4; Spec 019, G2): a lead colour, optional status colours, the tint of the neutrals, three sliders and font families, and the sliders of form, space, type and icon weight (stage 2), each on the structure of the Vortaro. The same Agordo derives the same Aspekto, byte for byte. owner and license fill aspekto.json; aspiroj are the brand's own goals, checked only when named; jugxoj record deviations from adjustable rules.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Agordo".
 */
export interface Agordo {
  name: Name;
  owner?: NonEmptyText;
  license?: License;
  leitfarbe: AgordoColor;
  zusatzfarben?: {
    success?: AgordoColor;
    warning?: AgordoColor;
    danger?: AgordoColor;
    info?: AgordoColor;
  };
  neutral?: {
    toenung?: number;
  };
  regler?: {
    helligkeit?: number;
    kontrast?: number;
    saettigung?: number;
  };
  schriften?: {
    display?: Fonto;
    body?: Fonto;
    code?: Fonto;
  };
  /**
   * Form (Spec 019, G2): factors on the structure of the Vortaro, 1 = the structure. radius multiplies radius.small … xlarge (none and full stay), rahmen border.width.* (never below 1 px, the focus ring keeps the reference's width), schatten offset and blur of elevation.shadow.* and the opacity of color.shadow.*.
   */
  form?: {
    /**
     * Factor on radius.small, medium, large and xlarge; 1 = the structure.
     */
    radius?: number;
    /**
     * Factor on border.width.*; 1 = the structure.
     */
    rahmen?: number;
    /**
     * Factor on the offsets and blur of elevation.shadow.* and the opacity of color.shadow.*; 1 = the structure, 0 = no shadow.
     */
    schatten?: number;
  };
  /**
   * Space (Spec 019, G2): abstand multiplies spacing.scale.* (the named spacing.* and the density modes follow), hoehe the steps of size.scale.* the controls use (size.control.*), never below size.target.min.
   */
  raum?: {
    /**
     * Factor on spacing.scale.*; 1 = the structure.
     */
    abstand?: number;
    /**
     * Factor on the heights of size.control.*; 1 = the structure.
     */
    hoehe?: number;
  };
  /**
   * Type (Spec 019, G2): groesse shifts every font.size.* by up to two steps of the scale, skala sets the ratio of neighbouring steps of font.size.scale (the structure's median ratio is the standard), gewicht moves font.weight.* by up to two cuts. The families are schriften (stage 1).
   */
  schrift?: {
    /**
     * −1 … 1: every font size by up to two steps of the scale smaller or larger; 0 = the structure.
     */
    groesse?: number;
    /**
     * The ratio of neighbouring steps of font.size.scale; the body text keeps its size.
     */
    skala?: number;
    /**
     * −1 … 1: font.weight.* by up to two cuts lighter or heavier, never outside the lightest and the heaviest weight of the structure; 0 = the structure.
     */
    gewicht?: number;
  };
  /**
   * Icons (Spec 019, G2, E6): the Phosphor weight the Aspekto draws the Ikonaro in. A weight is derived only where every name of the Ikonaro has a glyph in it, with its provenance.
   */
  ikono?: {
    /**
     * A Phosphor weight; regular is the reference's own.
     */
    gewicht?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  };
  ziele?: AgordoZieloj;
  aspiroj?: AspektoAspiro[];
  jugxoj?: AgordoJugxo[];
  /**
   * Values the Studio sets (Spec 024 Runde 1, S-2): token name → what the brand sets instead of what the derivation would write. `wert` is a DTCG value for the main set, `alias` the name of a token the brand re-points to (an alias counts as an assignment, Art. IV), `modoj` the same per Dimensio condition (`color-scheme=dark`, `viewport=compact`), written into the brand's conjunction set of that condition. Schnellstart and Studio work on the same data.
   */
  festgelegt?: {
    [k: string]: AgordoFestgelegt;
  };
  /**
   * Display names of the brand (Spec 024, § 3 B): `marko` for the brand as written, a palette (`color.palette.accent`) or a role (`color.text.default`) → its name as the Studio, the Vitrino and the Guidelines show it. Identifiers in every Projekcio stay canonical (Art. II).
   */
  etikedoj?: {
    [k: string]: NonEmptyText;
  };
  /**
   * The history of the Agordo (Spec 019 ③, W-26): every save by save_agordo appends an entry. Part of the Agordo, so it travels with the file.
   */
  historio?: AgordoHistorio[];
}
/**
 * Contrast targets a brand overrides per palette step (Spec 016 ②, G7): keyed by palette.step, the WCAG 2.x contrast the step should reach against the reference surface of the light mode (hell: neutral.0) or the dark mode (dunkel: neutral.1000). An override is a target, never a free colour value; the floors of kontrastSojloj still hold.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "AgordoZieloj".
 */
export interface AgordoZieloj {
  [k: string]: {
    hell?: number;
    dunkel?: number;
  };
}
/**
 * A deviation an Agordo records for an adjustable rule (Spec 016, G6, D-5): the Regulo by name, the reason, the date and the name of the person deciding. The Agordilo writes it into the package as a Jugxo; a fixed rule cannot be deviated from.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "AgordoJugxo".
 */
export interface AgordoJugxo {
  regulo: Name;
  kialo: NonEmptyText;
  date: string;
  name: NonEmptyText;
}
/**
 * A set token of the Studio (Spec 024): the value or alias for the main set of the brand (an alias wins over a value), per Dimensio condition for the brand's conjunction set of that condition, and for a typography role its case (`schreibweise`, Runde 2: the text transformation the role carries beside its value).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "AgordoFestgelegt".
 */
export interface AgordoFestgelegt {
  wert?: unknown;
  alias?: TokenName;
  schreibweise?: TextTransform;
  modoj?: {
    [k: string]: AgordoFestgelegtWert;
  };
}
/**
 * What the brand sets for one token in one set: a DTCG value (`wert`) or the name of a token to alias (`alias`), not both.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "AgordoFestgelegtWert".
 */
export interface AgordoFestgelegtWert {
  wert?: unknown;
  alias?: TokenName;
}
/**
 * One save of an Agordo (Spec 019 ③, W-26): the date, the wish the movement came from (or Hand for a change by hand) and the sliders that moved, before → after.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "AgordoHistorio".
 */
export interface AgordoHistorio {
  datum: string;
  wunsch: NonEmptyText;
  diff: {
    regler: NonEmptyText;
    vorher: number | string;
    nachher: number | string;
  }[];
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "DimensiojFile".
 */
export interface DimensiojFile {
  dimensioj: Dimensio[];
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "RegulojFile".
 */
export interface RegulojFile {
  reguloj: Regulo[];
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "JugxojFile".
 */
export interface JugxojFile {
  jugxoj: Jugxo[];
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "FontojFile".
 */
export interface FontojFile {
  $schema?: string;
  fontoj: FontoSistemo[];
}
/**
 * deveno.json of an Aspekto package: the provenance of every value it took from a Fonto.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "DevenoFile".
 */
export interface DevenoFile {
  $schema?: string;
  aspekto: Name;
  valoroj: DevenoValoro[];
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "MankojFile".
 */
export interface MankojFile {
  mankoj: Manko[];
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "KontrastParojFile".
 */
export interface KontrastParojFile {
  kontrastParoj: KontrastParo[];
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "IdsLockEntry".
 */
export interface IdsLockEntry {
  type: EntityType;
  status: IdStatus;
}
/**
 * data/ids.lock.json: every ID ever issued, with its entity type and status. Keys are sorted.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "IdsLock".
 */
export interface IdsLock {
  ids: {
    [k: string]: IdsLockEntry;
  };
}
/**
 * data/eroj/<name>/skemo.json: one Ero and its Skemo, two entities with their own IDs (plan D-02).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "EroFile".
 */
export interface EroFile {
  $schema?: string;
  ero: Ero;
  skemo: Skemo;
}
/**
 * data/eroj/<name>/uzo.json: the Uzo of the Ero whose Skemo lies in the same folder (Spec 007, D-01).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "UzoFile".
 */
export interface UzoFile {
  $schema?: string;
  uzo: Uzo;
}
/**
 * data/sxablonoj/<name>/skemo.json (Spec 020): the Sxablono and its Skemo.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SxablonoFile".
 */
export interface SxablonoFile {
  $schema?: string;
  sxablono: Sxablono;
  skemo: SxablonoSkemo;
}
/**
 * data/sxablonoj/<name>/uzo.json (Spec 020).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SxablonoUzoFile".
 */
export interface SxablonoUzoFile {
  $schema?: string;
  uzo: SxablonoUzo;
}
/**
 * An instance of a Sxablono for check_usage (Spec 020, G3): its props and what stands in each region — text, an icon, an Ero (with its props) or a Sxablono by name.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SxablonoInstance".
 */
export interface SxablonoInstance {
  sxablono: Name;
  props?: {
    [k: string]: string | boolean | number;
  };
  regions?: {
    [k: string]: (
      | ("text" | "icon")
      | {
          ero: Name;
          props?: {
            [k: string]: string | boolean | number;
          };
        }
      | {
          sxablono: Name;
        }
    )[];
  };
}
/**
 * A derivation from the Modelo into one output target. Schema only in Phase 0.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Projekcio".
 */
export interface Projekcio {
  id: ProjekcioId;
  name: Name;
  celo: CeloId;
  description?: string;
}
/**
 * An output target of a Projekcio. Target-specific knowledge lives in package code, never here. Schema only in Phase 0.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Celo".
 */
export interface Celo {
  id: CeloId;
  name: Name;
  description?: string;
}
/**
 * The words of the Gvidanto (Nachlese 8 ①, D-11), per language (ISO 639-1): data, not code, like the keywords of the goals.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Gvidanto".
 */
export interface Gvidanto1 {
  /**
   * What only opens a request and names nothing („ich brauche“, „bitte“, „I need“): skipped, longest first and lower case, before the first word names a Sxablono.
   */
  fillers: {
    [k: string]: string[];
  };
}
/**
 * Translations of the texts of the Uzoj and the Reguloj (Nachlese 8 ③), per language (ISO 639-1): the key is the ID of the entry and the path of the text in it — <uzo id>/purpose, <uzo id>/boundary/<case>/kialo, <uzo id>/instead/<goal>/kialo, <uzo id>/composes/containers/<name>/kialo, <uzo id>/composes/with/<ero>/kialo, <uzo id>/composes/never/<ero>/kialo, <regulo id>/statement, <regulo id>/kialo. English, the text of the entry itself, stays the source.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Tradukoj".
 */
export interface Tradukoj1 {
  [k: string]: {
    [k: string]: string;
  };
}
/**
 * data/tradukoj.json: the translations of the texts of the Uzoj and the Reguloj (Nachlese 8 ③); absent while the Modelo has none.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "TradukojFile".
 */
export interface TradukojFile {
  $schema?: string;
  tradukoj: Tradukoj1;
}
/**
 * data/gvidanto.json: the words of the Gvidanto (Nachlese 8 ①); absent while it has none.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "GvidantoFile".
 */
export interface GvidantoFile {
  $schema?: string;
  gvidanto: Gvidanto1;
}
/**
 * data/ikonaro.json: the Ikonaro of the core (Spec 014 ① aims at 25 names at most); absent while no Ero draws an icon.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "IkonaroFile".
 */
export interface IkonaroFile {
  $schema?: string;
  ikonaro: Ikono[];
}
/**
 * A text in German and English (Spec 030): the task as a person would say it, or the criterion as the maintainer reads it.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "NordsteloTeksto".
 */
export interface NordsteloTeksto {
  de: NonEmptyText;
  en: NonEmptyText;
}
/**
 * How a criterion is decided on the facts of a rendered page (Spec 030, K6), deterministically. aria counts nodes of the accessibility tree by role, name (a case-insensitive regular expression) and level; named-fields asks that every field has a name; elemento counts elements of the page by a simple selector per variant (tag, [attr], [attr=value], comma for or) – a variant without a selector does not count; teksto looks for a regular expression in the text of the page.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "NordsteloKontrolo".
 */
export interface NordsteloKontrolo {
  "0"?: NonEmptyText;
  kind: "aria" | "named-fields" | "elemento" | "teksto";
  role?: string;
  name?: NonEmptyText;
  level?: number;
  F?: NonEmptyText;
  pattern?: NonEmptyText;
  min?: number;
  max?: number;
}
/**
 * One acceptance criterion of a Tasko (Spec 030): checkable, and tied to the Regulo it stands for, whose kialo is the reason.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Kriterio".
 */
export interface Kriterio {
  id: KriterioId;
  regulo: Name;
  teksto: NordsteloTeksto;
  kontrolo: NordsteloKontrolo;
}
/**
 * One task of the north-star catalogue (Spec 030): what a context-free agent is asked to build, in everyday words, the Sxablono and the Eroj a good answer uses, and the criteria of acceptance.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Tasko".
 */
export interface Tasko {
  id: TaskoId;
  name: Name;
  teksto: NordsteloTeksto;
  sxablono: Name;
  /**
   * @minItems 1
   */
  eroj: Name[];
  /**
   * @minItems 1
   */
  kriterioj: Kriterio[];
}
/**
 * The weight of one criterion of the score (K1–K6, Spec 030) with its reason; K7, the effort, is reported and never weighted.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Pezo".
 */
export interface Pezo {
  kriterio: "K1" | "K2" | "K3" | "K4" | "K5" | "K6";
  pezo: number;
  kialo: NordsteloTeksto;
}
/**
 * data/nordstelo.json: the catalogue of tasks of the north-star measure and the weights of the score (Spec 030); absent while there is none.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "NordsteloFile".
 */
export interface NordsteloFile {
  $schema?: string;
  taskoj: Tasko[];
  /**
   * The weights the score counts with (since Nachlese 11: K5 25, the gate multmarkeco).
   */
  pezoj: Pezo[];
  /**
   * The weights before (Nachlese 11 ②): reported beside the score, without the gate, so that a change of the rule is seen to come from the north star and not from the result.
   */
  pezojAntauxaj?: {
    nomo: string;
    kialo: NordsteloTeksto;
    pezoj: Pezo[];
  };
  /**
   * The gate of Markenfähigkeit (Nachlese 11 ②, Art. IV): the criteria a result scores only for the combinations of Aspekto, colour scheme and contrast its page follows.
   */
  multmarkeco?: {
    /**
     * @minItems 1
     */
    kriterioj: ("K1" | "K2" | "K3" | "K4" | "K5" | "K6")[];
    kialo: NordsteloTeksto;
  };
}
/**
 * data/facetoj.json: the brand model, scope 1 (Spec 033 S1) – every visual aspect of a brand as a Faceto of the layer vida, with its weight and Kialo, the tokens it owns and the fields of the Agordo that define it; absent while there is none.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "FacetojFile".
 */
export interface FacetojFile {
  $schema?: string;
  /**
   * The layer of the Aspekto this list covers (Tavolo); scope 1 is vida, the visual layer.
   */
  tavolo: "vida";
  /**
   * @minItems 1
   */
  facetoj: Faceto[];
}
/**
 * One visual aspect of a brand (Spec 033 S1): open (the value of the base), defined or released in the assistant. Owns the core tokens whose name starts with one of `tokenoj` (whole segments); an Ero-Tokeno belongs to the Faceto its alias chain leads to. A Faceto without tokens is a choice of Dimensioj (`dimensioj`).
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Faceto".
 */
export interface Faceto {
  id: FacetoId;
  name: Name;
  nomo: NordsteloTeksto;
  /**
   * The weight of the Faceto in the completeness.
   */
  pezo: number;
  /**
   * Why the Faceto weighs what it weighs (Art. VI).
   */
  kialo: string;
  /**
   * Token-name prefixes, whole segments (`color.status` covers color.status.*).
   */
  tokenoj: TokenName[];
  /**
   * Dotted paths of the Agordo whose value defines the Faceto (`form.radius`, `zusatzfarben`).
   */
  agordo: string[];
  /**
   * The Dimensioj the Faceto is about, for one without tokens of its own.
   */
  dimensioj?: Name[];
}
/**
 * One entry of the Kroniko of a brand (Spec 033 S1, Amendment v2.5): marken/<name>/kroniko.jsonl, one per line – every proposal, change, take-over, release, reopening, declaration of a foreign basis, confirmation, notice, chat turn and export (with its duration, Spec 033 S6), with time, source, model and cost. `persono` and `rolo` stay empty while the Metiejo runs for one person; they keep the place for a database with person and role.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "KronikoEro".
 */
export interface KronikoEro {
  /**
   * UTC, ISO 8601 with Z.
   */
  tempo: string;
  ago:
    | "kreo"
    | "propono"
    | "sxangxo"
    | "akcepto"
    | "liberigo"
    | "remalfermo"
    | "fremda"
    | "konfirmo"
    | "averto"
    | "babilo"
    | "eksporto";
  /**
   * Where it came from: the chat, speech, the sliders of the Studio or Schnellstart, an agent, the system.
   */
  fonto: "babilo" | "parolo" | "regilo" | "agento" | "sistemo";
  faceto?: Name;
  teksto?: string;
  /**
   * provider/model, e.g. mistral/ministral-14b-2512.
   */
  modelo?: string;
  kosto?: {
    enigo: number;
    eligo: number;
    ms: number;
    usd?: number;
    requests?: number;
  };
  detaloj?: {};
  persono?: string | null;
  rolo?: string | null;
}
