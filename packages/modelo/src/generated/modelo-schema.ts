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
  | "decorative";
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
 * via the `definition` "JugxoId".
 */
export type JugxoId = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "EroId".
 */
export type EroId = string;
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
 * via the `definition` "SkemoId".
 */
export type SkemoId = string;
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
  | "kontrastParo"
  | "ero"
  | "skemo"
  | "sxablono"
  | "projekcio"
  | "celo";
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "AnyId".
 */
export type AnyId = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SxablonoId".
 */
export type SxablonoId = string;
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
 * ID namespace of an external Aspekto package (Spec 001, D-06): 2 to 8 lowercase letters.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "IdNamespace".
 */
export type IdNamespace = string;
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "IdStatus".
 */
export type IdStatus = "active" | "retired";

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
  kontrastParoj: KontrastParo[];
  eroj: Ero[];
  rezolvo: Rezolvo;
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
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "JugxoReguloRef".
 */
export interface JugxoReguloRef {
  regulo: ReguloId;
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "JugxoEroRef".
 */
export interface JugxoEroRef {
  ero: EroId;
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
}
/**
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "KontrastParo".
 */
export interface KontrastParo {
  id: KontrastParoId;
  name: Name;
  foreground: TokenName;
  background: TokenName;
  kategorio: KontrastKategorio;
}
/**
 * A component. Schema only in Phase 0.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Ero".
 */
export interface Ero {
  id: EroId;
  name: Name;
  skemo: SkemoId;
  description?: string;
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
 * Layers of the brand package (Spec 001, D-20): the Aspekto package is the brand package and the Vortaro is one of its layers. Phase 1 reserves only the key vida, with the empty value {}; other keys are allowed and ignored by validation.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Tavoloj".
 */
export interface Tavoloj {
  vida?: {};
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
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "SkemoProp".
 */
export interface SkemoProp {
  name: Name;
  kind: "enum" | "boolean" | "string" | "number";
  values?: Name[];
  default?: string | number | boolean;
}
/**
 * The machine-readable specification of an Ero: props and states. Schema only in Phase 0.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Skemo".
 */
export interface Skemo {
  id: SkemoId;
  ero: EroId;
  props: SkemoProp[];
  states: Name[];
}
/**
 * A template or pattern (layout, page type, flow). Schema only in Phase 0.
 *
 * This interface was referenced by `ModeloJson`'s JSON-Schema
 * via the `definition` "Sxablono".
 */
export interface Sxablono {
  id: SxablonoId;
  name: Name;
  kind: "layout" | "page" | "flow";
  eroj: EroId[];
  description?: string;
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
