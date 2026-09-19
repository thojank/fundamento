// Flattens a DTCG group tree (one set file) into LoadedTokens keyed by canonical name.

import {
  DTCG_TYPES,
  type DtcgType,
  FUNDAMENTO_EXTENSION_KEY,
  TOKEN_ROLES,
  type TokenRole,
} from "../contracts/dtcg.js";
import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import type { Kondicxo, LoadedToken } from "../contracts/modelo.js";
import { appendPointer } from "../json/pointer.js";
import { isJsonObject, type JsonObject } from "./guards.js";

export interface FlattenResult {
  /** Tokens by canonical (dot-joined) name, in document order. */
  tokens: Record<string, LoadedToken>;
  issues: ValidationIssue[];
}

/** A `$type` in scope: its raw value and the pointer of the `$type` member that declared it. */
interface TypeInScope {
  value: unknown;
  pointer: string;
}

/**
 * Walks a set file's DTCG tree. An object with `$value` is a token; any other object is a group.
 * `$`-prefixed members are metadata and never tokens or groups; non-object members are skipped
 * (the schema reports them). The effective type is the token's own `$type` or the nearest
 * ancestor group's (including the set root).
 *
 * Because `LoadedToken.type` must be a known `DtcgType`, a token without an effective type is
 * reported as `token-type-missing` (at the token) and an unknown effective type as
 * `token-type-unknown` (once, at the declaring `$type`); such tokens are left out. When two
 * paths produce the same canonical name (only possible with keys containing `.`), the first wins.
 *
 * `file` is the set file path relative to the Modelo root. Pure; never throws.
 */
export function flattenTokenTree(tree: unknown, file: string): FlattenResult {
  const tokens: Record<string, LoadedToken> = {};
  const issues: ValidationIssue[] = [];
  const reportedUnknownTypes = new Set<string>();

  const addToken = (
    node: JsonObject,
    segments: readonly string[],
    pointer: string,
    typeInScope: TypeInScope | undefined,
  ): void => {
    const typeSource =
      "$type" in node
        ? { value: node.$type, pointer: appendPointer(pointer, "$type") }
        : typeInScope;
    const name = segments.join(".");
    if (typeSource === undefined) {
      issues.push({
        rule: "token-type-missing",
        severity: "error",
        path: formatIssuePath({ file, pointer }),
        message: `Token "${name}" has no $type and no enclosing group declares one.`,
        suggestion: 'Add a "$type" to the token or to an enclosing group.',
      });
      return;
    }
    if (!isDtcgType(typeSource.value)) {
      if (!reportedUnknownTypes.has(typeSource.pointer)) {
        reportedUnknownTypes.add(typeSource.pointer);
        issues.push({
          rule: "token-type-unknown",
          severity: "error",
          path: formatIssuePath({ file, pointer: typeSource.pointer }),
          message: `Unknown token type ${JSON.stringify(typeSource.value)}.`,
          suggestion: `Use one of the DTCG 2025.10 types: ${DTCG_TYPES.join(", ")}.`,
        });
      }
      return;
    }
    if (Object.hasOwn(tokens, name)) {
      return;
    }
    const token: LoadedToken = {
      name,
      type: typeSource.value,
      value: node.$value,
      location: { file, pointer },
    };
    if (typeof node.$description === "string") {
      token.description = node.$description;
    }
    const extension = fundamentoExtension(node);
    if (typeof extension?.id === "string") {
      token.id = extension.id;
    }
    if (isTokenRole(extension?.role)) {
      token.role = extension.role;
    }
    // defineProperty: a canonical name such as "__proto__" must become an own key.
    Object.defineProperty(tokens, name, {
      value: token,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  };

  const walkGroup = (
    group: JsonObject,
    segments: readonly string[],
    pointer: string,
    inherited: TypeInScope | undefined,
  ): void => {
    const typeInScope =
      "$type" in group
        ? { value: group.$type, pointer: appendPointer(pointer, "$type") }
        : inherited;
    for (const [key, child] of Object.entries(group)) {
      if (key.startsWith("$") || !isJsonObject(child)) {
        continue;
      }
      const childSegments = [...segments, key];
      const childPointer = appendPointer(pointer, key);
      if ("$value" in child) {
        addToken(child, childSegments, childPointer, typeInScope);
      } else {
        walkGroup(child, childSegments, childPointer, typeInScope);
      }
    }
  };

  if (isJsonObject(tree)) {
    walkGroup(tree, [], "", undefined);
  }
  return { tokens, issues };
}

/** The `$extensions["com.ciferecigo.fundamento"]` object of a token, group or set root, if any. */
export function fundamentoExtension(node: unknown): JsonObject | undefined {
  if (!isJsonObject(node) || !isJsonObject(node.$extensions)) {
    return undefined;
  }
  const extension = node.$extensions[FUNDAMENTO_EXTENSION_KEY];
  return isJsonObject(extension) ? extension : undefined;
}

/**
 * Parses a set's `kondicxoj` (`["dimensio=valoro", …]`) in order. Non-string entries and entries
 * without a non-empty name on both sides of the first `=` are skipped (the schema reports them).
 */
export function parseKondicxoj(value: unknown): Kondicxo[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const kondicxoj: Kondicxo[] = [];
  for (const entry of value) {
    if (typeof entry !== "string") {
      continue;
    }
    const separator = entry.indexOf("=");
    const dimensio = entry.slice(0, separator);
    const valoro = entry.slice(separator + 1);
    if (separator > 0 && valoro !== "") {
      kondicxoj.push({ dimensio, valoro });
    }
  }
  return kondicxoj;
}

function isDtcgType(value: unknown): value is DtcgType {
  return typeof value === "string" && (DTCG_TYPES as readonly string[]).includes(value);
}

function isTokenRole(value: unknown): value is TokenRole {
  return typeof value === "string" && (TOKEN_ROLES as readonly string[]).includes(value);
}
