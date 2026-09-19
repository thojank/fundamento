// Set rules of pipeline step 3 (FR-10, Edge Cases): kondicxoj, canonical file names, and what an
// override set may contain. Pure.

import { CORE_SET_NAME, KONDICXO_PATTERN } from "../contracts/grammar.js";
import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import type { Dimensio, LoadedSet, Modelo } from "../contracts/modelo.js";
import { appendPointer } from "../json/pointer.js";
import type { ModeloFiles } from "../load/files.js";
import { fundamentoExtension } from "../load/flatten.js";
import { valoroNames } from "../resolve/assignment.js";
import { compareStrings, EXTENSION_POINTER, isJsonObject, valueAtPointer } from "./raw.js";

const KONDICXOJ_POINTER = `${EXTENSION_POINTER}/kondicxoj`;

/** Every set rule except `set-override-ambiguous` (a per-combination warning). */
export function setIssues(modelo: Modelo, files: ModeloFiles): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME);
  if (core === undefined) {
    const setsDir = files.themes.file.replace(/\$themes\.json$/, "sets");
    issues.push({
      rule: "file-missing",
      severity: "error",
      path: formatIssuePath({ file: `${setsDir}/core.json`, pointer: "" }),
      message: "The Vortaro has no core set.",
      suggestion: `Create ${setsDir}/core.json: it defines every token; other sets only override.`,
    });
  }
  for (const document of files.sets) {
    const set = modelo.setoj.find((candidate) => candidate.name === document.name);
    if (set === undefined) {
      continue;
    }
    issues.push(...kondicxojIssues(modelo, set, fundamentoExtension(document.value)?.kondicxoj));
    if (set.name !== CORE_SET_NAME && core !== undefined) {
      issues.push(...overrideIssues(set, core, document.value));
    }
  }
  return issues;
}

/**
 * `set-kondicxoj-unknown` (malformed entry, unknown Dimensio or valoro),
 * `set-kondicxoj-contradictory` (two different valoroj of one Dimensio) and, when every
 * kondicxo is sound, `set-name-mismatch`: the file name must equal the canonical name built from
 * the kondicxoj (ordered by Dimensio priority ascending, joined with `+`; `core` for none).
 * Identical repeated entries are reported by the schema step (`uniqueItems`).
 */
function kondicxojIssues(modelo: Modelo, set: LoadedSet, raw: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const entries: unknown[] = Array.isArray(raw) ? raw : [];
  const at = (index: number): string =>
    formatIssuePath({ file: set.file, pointer: appendPointer(KONDICXOJ_POINTER, index) });
  const seen = new Map<string, string>();
  const parsed: { dimensio: Dimensio; valoro: string }[] = [];
  let sound = true;

  entries.forEach((entry, index) => {
    if (typeof entry !== "string" || !KONDICXO_PATTERN.test(entry)) {
      sound = false;
      issues.push({
        rule: "set-kondicxoj-unknown",
        severity: "error",
        path: at(index),
        message: `Kondicxo ${JSON.stringify(entry)} of set ${set.name} is not of the form dimensio=valoro.`,
        suggestion: `Write the condition as dimensio=valoro, e.g. ${exampleKondicxo(modelo)}.`,
      });
      return;
    }
    const [dimensioName = "", valoro = ""] = entry.split("=");
    const dimensio = modelo.dimensioj.find((candidate) => candidate.name === dimensioName);
    if (dimensio === undefined) {
      sound = false;
      issues.push({
        rule: "set-kondicxoj-unknown",
        severity: "error",
        path: at(index),
        message: `Kondicxo ${entry} of set ${set.name} names the unknown Dimensio '${dimensioName}'.`,
        suggestion: `Use one of the Dimensioj: ${listOrNone(modelo.dimensioj.map((d) => d.name))}.`,
      });
      return;
    }
    const allowed = valoroNames(dimensio);
    if (!allowed.includes(valoro)) {
      sound = false;
      issues.push({
        rule: "set-kondicxoj-unknown",
        severity: "error",
        path: at(index),
        message: `Kondicxo ${entry} of set ${set.name} names the unknown valoro '${valoro}' of Dimensio '${dimensioName}'.`,
        suggestion: `Use one of the valoroj of '${dimensioName}': ${listOrNone(allowed)}.`,
      });
      return;
    }
    const previous = seen.get(dimensioName);
    if (previous !== undefined) {
      sound = false;
      if (previous !== valoro) {
        issues.push({
          rule: "set-kondicxoj-contradictory",
          severity: "error",
          path: at(index),
          message: `Set ${set.name} requires both ${dimensioName}=${previous} and ${dimensioName}=${valoro}; no combination satisfies it.`,
          suggestion: `Keep one condition on '${dimensioName}' (a set can require only one valoro per Dimensio), or split the set.`,
        });
      }
      return;
    }
    seen.set(dimensioName, valoro);
    parsed.push({ dimensio, valoro });
  });

  if (sound) {
    const canonical = canonicalSetName(parsed);
    if (canonical !== set.name) {
      issues.push({
        rule: "set-name-mismatch",
        severity: "error",
        path: formatIssuePath({ file: set.file, pointer: "" }),
        message: `Set file ${set.file} is named '${set.name}', but its kondicxoj make it '${canonical}'.`,
        suggestion: `Rename the file to sets/${canonical}.json (conditions ordered by Dimensio priority ascending, joined with '+'; core for none), or fix its kondicxoj, then run \`pnpm vortaro:themes\`.`,
      });
    }
  }
  return issues;
}

function canonicalSetName(kondicxoj: readonly { dimensio: Dimensio; valoro: string }[]): string {
  if (kondicxoj.length === 0) {
    return CORE_SET_NAME;
  }
  return [...kondicxoj]
    .sort(
      (a, b) =>
        Number(a.dimensio.priority) - Number(b.dimensio.priority) ||
        compareStrings(a.dimensio.name, b.dimensio.name),
    )
    .map(({ dimensio, valoro }) => `${dimensio.name}/${valoro}`)
    .join("+");
}

/**
 * Rules for the tokens of a non-core set: it may only override core tokens
 * (`set-introduces-token`), keep their `$type` (`set-changes-type`) and carry no Fundamento
 * extension, which belongs to the core definition (`set-override-has-extensions`).
 */
function overrideIssues(set: LoadedSet, core: LoadedSet, tree: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const token of Object.values(set.tokens)) {
    const path = formatIssuePath(token.location);
    const coreToken = Object.hasOwn(core.tokens, token.name) ? core.tokens[token.name] : undefined;
    if (coreToken === undefined) {
      issues.push({
        rule: "set-introduces-token",
        severity: "error",
        path,
        message: `Set ${set.name} defines ${token.name}, which core does not define. Sets may only override core tokens, so every combination has the same tokens.`,
        suggestion: `Define ${token.name} in core (with an ID from \`pnpm id:new token\`) and keep only the override here, or remove it from ${set.name}.`,
      });
    } else if (coreToken.type !== token.type) {
      issues.push({
        rule: "set-changes-type",
        severity: "error",
        path,
        message: `Set ${set.name} gives ${token.name} the type ${token.type}, but core defines it as ${coreToken.type}.`,
        suggestion: `Override ${token.name} with a ${coreToken.type} value (check the $type of the token and its groups), or introduce a separate token.`,
      });
    }
    const extensionPointer = `${token.location.pointer}${EXTENSION_POINTER}`;
    const extension = valueAtPointer(tree, extensionPointer);
    if (extension !== undefined && !isTextTransformOnly(extension)) {
      issues.push({
        rule: "set-override-has-extensions",
        severity: "error",
        path: formatIssuePath({ file: set.file, pointer: extensionPointer }),
        message: `The override of ${token.name} in set ${set.name} carries Fundamento $extensions; ID and role belong to the core definition only (an override may set textTransform only).`,
        suggestion: `Remove $extensions["com.ciferecigo.fundamento"] from this override, or keep only "textTransform".`,
      });
    }
  }
  return issues;
}

function exampleKondicxo(modelo: Modelo): string {
  const dimensio = modelo.dimensioj[0];
  const valoro = dimensio === undefined ? undefined : valoroNames(dimensio)[0];
  return dimensio === undefined || valoro === undefined
    ? "color-scheme=dark"
    : `${dimensio.name}=${valoro}`;
}

function listOrNone(names: readonly string[]): string {
  return names.length === 0 ? "(none)" : names.join(", ");
}

/**
 * An override may carry exactly one Fundamento extension key, `textTransform` (Spec 001, D-11): an
 * Aspekto must be able to set its text transformation, and DTCG has no field for it.
 */
function isTextTransformOnly(extension: unknown): boolean {
  return (
    isJsonObject(extension) &&
    Object.keys(extension).length === 1 &&
    Object.hasOwn(extension, "textTransform")
  );
}
