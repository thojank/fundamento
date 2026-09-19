// DTCG 2025.10 vocabulary shared across the Modelo.

import type { DtcgType, TokenRole } from "../generated/modelo-schema.js";

export type { DtcgType, TokenRole } from "../generated/modelo-schema.js";

/** Every token type the schema accepts, in schema order. */
export const DTCG_TYPES = [
  "color",
  "dimension",
  "fontFamily",
  "fontWeight",
  "duration",
  "cubicBezier",
  "number",
  "strokeStyle",
  "shadow",
  "typography",
  "border",
  "gradient",
  "transition",
] as const satisfies readonly DtcgType[];

export const TOKEN_ROLES = [
  "palette",
  "foreground",
  "background",
  "border",
  "focus",
  "shadow",
  "backdrop",
  "disabled",
  "decorative",
] as const satisfies readonly TokenRole[];

/** `$extensions` key for Fundamento metadata on tokens (`id`, `role`) and sets (`id`, `kondicxoj`). */
export const FUNDAMENTO_EXTENSION_KEY = "com.ciferecigo.fundamento";

/**
 * Schema def (under `#/$defs/`) of the literal `$value` per type, without the alias alternative.
 * Use it to check tokens whose type is inherited from a group.
 */
export const TOKEN_VALUE_DEFS = {
  color: "ColorValue",
  dimension: "DimensionValue",
  fontFamily: "FontFamilyValue",
  fontWeight: "FontWeightValue",
  duration: "DurationValue",
  cubicBezier: "CubicBezierValue",
  number: "NumberValue",
  strokeStyle: "StrokeStyleValue",
  shadow: "ShadowValue",
  typography: "TypographyValue",
  border: "BorderValue",
  gradient: "GradientValue",
  transition: "TransitionValue",
} as const satisfies Record<DtcgType, string>;
