// Token rules of pipeline step 3: `token-value-invalid` (own and inherited types) and the static
// alias rules `alias-target-missing` / `alias-type-mismatch` (whole values and composite
// sub-fields), reported at the file location of the reference. Pure.

import { getModeloValidator, type ModeloAjv } from "../contracts/ajv.js";
import { type DtcgType, TOKEN_VALUE_DEFS } from "../contracts/dtcg.js";
import { aliasTarget, CORE_SET_NAME, isTokenName } from "../contracts/grammar.js";
import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import type { LoadedToken, Modelo } from "../contracts/modelo.js";
import { appendPointer } from "../json/pointer.js";
import { isJsonObject } from "./raw.js";

const VALUE_EXAMPLES: Record<DtcgType, string> = {
  color: '{ "colorSpace": "srgb", "components": [0.1, 0.2, 0.3], "alpha": 1, "hex": "#1a334d" }',
  dimension: '{ "value": 4, "unit": "px" }',
  fontFamily: '"system-ui" or ["system-ui", "sans-serif"]',
  fontWeight: '400 (1-1000) or a keyword such as "bold"',
  duration: '{ "value": 200, "unit": "ms" }',
  cubicBezier: "[0.25, 0.1, 0.25, 1]",
  number: "1.5",
  strokeStyle: '"solid" or { "dashArray": [{ "value": 2, "unit": "px" }], "lineCap": "round" }',
  shadow:
    '{ "color": …, "offsetX": …, "offsetY": …, "blur": …, "spread": … } (or an array of them)',
  typography:
    '{ "fontFamily": …, "fontSize": …, "fontWeight": …, "letterSpacing": …, "lineHeight": … }',
  border: '{ "color": …, "width": …, "style": … }',
  gradient: '[{ "color": …, "position": 0 }, …]',
  transition: '{ "duration": …, "delay": …, "timingFunction": … }',
};

/**
 * `token-value-invalid` for every token of every set whose `$value` is neither a whole-value alias
 * nor a valid literal of its effective type (own `$type` or inherited from a group), at
 * `<file>#<token>/$value`. Returns the invalid tokens too, so alias checks can skip them.
 */
export function tokenValueIssues(
  modelo: Modelo,
  ajv: ModeloAjv,
): { issues: ValidationIssue[]; invalid: Set<LoadedToken> } {
  const issues: ValidationIssue[] = [];
  const invalid = new Set<LoadedToken>();
  for (const set of modelo.setoj) {
    for (const token of Object.values(set.tokens)) {
      if (aliasTarget(token.value) !== undefined) {
        continue;
      }
      const defName = TOKEN_VALUE_DEFS[token.type];
      const validate = getModeloValidator(ajv, defName);
      if (validate(token.value)) {
        continue;
      }
      invalid.add(token);
      const reason = (validate.errors ?? []).at(-1);
      const detail =
        reason === undefined ? "" : ` (${reason.instancePath || "value"} ${reason.message ?? ""})`;
      issues.push({
        rule: "token-value-invalid",
        severity: "error",
        path: formatIssuePath({ ...token.location, pointer: `${token.location.pointer}/$value` }),
        message: `The value of ${token.name} is not a valid ${token.type}${detail}.`,
        suggestion: `Give a DTCG 2025.10 ${token.type} value, e.g. ${VALUE_EXAMPLES[token.type]}, or an alias {token.name} to a ${token.type} token.`,
      });
    }
  }
  return { issues, invalid };
}

/** One alias reference inside a token value: where it is and which type it must point at. */
interface AliasReference {
  /** Pointer inside `$value` (`""` for a whole-value alias). */
  pointer: string;
  target: string;
  expected: DtcgType;
}

/** Sub-field types of the object-shaped composites (DTCG 2025.10). */
const OBJECT_FIELDS: Partial<Record<DtcgType, Record<string, DtcgType>>> = {
  border: { color: "color", width: "dimension", style: "strokeStyle" },
  typography: {
    fontFamily: "fontFamily",
    fontSize: "dimension",
    fontWeight: "fontWeight",
    letterSpacing: "dimension",
    lineHeight: "number",
  },
  transition: { duration: "duration", delay: "duration", timingFunction: "cubicBezier" },
};
const SHADOW_FIELDS: Record<string, DtcgType> = {
  color: "color",
  offsetX: "dimension",
  offsetY: "dimension",
  blur: "dimension",
  spread: "dimension",
};
const GRADIENT_STOP_FIELDS: Record<string, DtcgType> = { color: "color", position: "number" };

/** Every alias reference of a (structurally valid) value of the given type. */
export function aliasReferences(type: DtcgType, value: unknown, pointer = ""): AliasReference[] {
  const whole = aliasTarget(value);
  if (whole !== undefined) {
    return [{ pointer, target: whole, expected: type }];
  }
  const references: AliasReference[] = [];
  const fields = (object: unknown, types: Record<string, DtcgType>, base: string): void => {
    if (!isJsonObject(object)) {
      return;
    }
    for (const [field, fieldType] of Object.entries(types)) {
      if (Object.hasOwn(object, field)) {
        references.push(...aliasReferences(fieldType, object[field], appendPointer(base, field)));
      }
    }
  };
  const objectFields = OBJECT_FIELDS[type];
  if (objectFields !== undefined) {
    fields(value, objectFields, pointer);
  } else if (type === "shadow") {
    if (Array.isArray(value)) {
      value.forEach((layer, index) => {
        fields(layer, SHADOW_FIELDS, appendPointer(pointer, index));
      });
    } else {
      fields(value, SHADOW_FIELDS, pointer);
    }
  } else if (type === "gradient" && Array.isArray(value)) {
    value.forEach((stop, index) => {
      fields(stop, GRADIENT_STOP_FIELDS, appendPointer(pointer, index));
    });
  } else if (type === "strokeStyle" && isJsonObject(value) && Array.isArray(value.dashArray)) {
    value.dashArray.forEach((dash: unknown, index) => {
      references.push(
        ...aliasReferences(
          "dimension",
          dash,
          appendPointer(appendPointer(pointer, "dashArray"), index),
        ),
      );
    });
  }
  return references;
}

/**
 * Static alias rules over every token of every set (skipping `invalid` values):
 * - `alias-target-missing`: no set of the Modelo defines the referenced name (so it is missing in
 *   every combination);
 * - `alias-type-mismatch`: the target's type (its core type, else the type of the first set that
 *   defines it) differs from the type the reference needs: the token's own type for a whole-value
 *   alias, the sub-field's type for a composite sub-field (e.g. `border.color` needs `color`).
 * Paths: `<file>#<token>/$value[<sub-field pointer>]`.
 */
export function aliasIssues(modelo: Modelo, invalid: ReadonlySet<LoadedToken>): ValidationIssue[] {
  const typeOf = new Map<string, DtcgType>();
  const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME);
  for (const set of [...(core === undefined ? [] : [core]), ...modelo.setoj]) {
    for (const token of Object.values(set.tokens)) {
      if (!typeOf.has(token.name)) {
        typeOf.set(token.name, token.type);
      }
    }
  }

  const issues: ValidationIssue[] = [];
  for (const set of modelo.setoj) {
    for (const token of Object.values(set.tokens)) {
      if (invalid.has(token)) {
        continue;
      }
      for (const reference of aliasReferences(token.type, token.value)) {
        const path = formatIssuePath({
          ...token.location,
          pointer: `${token.location.pointer}/$value${reference.pointer}`,
        });
        const field = reference.pointer === "" ? "" : ` (field ${reference.pointer})`;
        const targetType = isTokenName(reference.target) ? typeOf.get(reference.target) : undefined;
        if (targetType === undefined) {
          issues.push({
            rule: "alias-target-missing",
            severity: "error",
            path,
            message: `${token.name}${field} in set ${set.name} references {${reference.target}}, which no set defines.`,
            suggestion: `Reference an existing ${reference.expected} token, or define ${reference.target} in core.`,
          });
        } else if (targetType !== reference.expected) {
          issues.push({
            rule: "alias-type-mismatch",
            severity: "error",
            path,
            message: `${token.name}${field} in set ${set.name} needs a ${reference.expected} but references {${reference.target}}, a ${targetType} token.`,
            suggestion: `Reference a token of type ${reference.expected}, or give a literal ${reference.expected} value.`,
          });
        }
      }
    }
  }
  return issues;
}
