// The rules of the Sxablonoj (Spec 020, G1): each Sxablono pairs with its Skemo and its Uzo by ID,
// bears a name no Ero has, names only Eroj, Sxablonoj, text or icon in its regions and its Uzo,
// points its skip link and its focus target at regions it has, has at most one default region,
// takes its layout tokens from the core, and gives every alternative and boundary a reason. Pure.

import { CORE_SET_NAME } from "../contracts/grammar.js";
import { formatIssuePath, type RuleId, type ValidationIssue } from "../contracts/issues.js";
import type { LoadedSxablono, Modelo } from "../contracts/modelo.js";
import type { ModeloFiles } from "../load/files.js";

/** What a region may hold besides an Ero or a Sxablono (as an Ero's slot). */
const CONTENT_KINDS: ReadonlySet<string> = new Set(["text", "icon"]);

/** The folder part of a Modelo-relative path. */
const folderOf = (file: string) => file.slice(0, file.lastIndexOf("/"));

export function sxablonoIssues(modelo: Modelo, files: ModeloFiles): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const sxablonoj = modelo.sxablonoj ?? [];
  const eroNames = new Set(modelo.eroj.map((entry) => entry.ero.name));
  const names = new Set([...eroNames, ...sxablonoj.map((entry) => entry.sxablono.name)]);
  const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME)?.tokens ?? {};
  const issue = (
    file: string,
    pointer: string,
    rule: RuleId,
    message: string,
    suggestion: string,
  ) =>
    issues.push({
      rule,
      severity: "error",
      path: formatIssuePath({ file, pointer }),
      message,
      suggestion,
    });

  // A uzo.json without a Skemo beside it.
  const folders = new Set(sxablonoj.map((entry) => folderOf(entry.file)));
  for (const document of files.sxablonoUzoj ?? []) {
    if (folders.has(folderOf(document.file))) continue;
    issue(
      document.file,
      "/uzo",
      "sxablono-uzo-missing",
      `${document.file} has no skemo.json beside it; an Uzo belongs to a Sxablono.`,
      "Add the Sxablono's skemo.json to the folder, or remove the uzo.json.",
    );
  }

  for (const entry of sxablonoj) {
    const at = (pointer: string, rule: RuleId, message: string, suggestion: string) =>
      issue(entry.file, pointer, rule, message, suggestion);
    pairIssues(entry, at, issue);
    const { name } = entry.sxablono;
    if (eroNames.has(name)) {
      at(
        "/sxablono/name",
        "sxablono-name-taken",
        `The Sxablono ${name} bears the name of an Ero; one name names one thing.`,
        "Choose a name no Ero has.",
      );
    }
    const regions = entry.skemo.regions.map((region) => region.name);
    entry.skemo.regions.forEach((region, index) => {
      for (const accepted of region.accepts ?? []) {
        if (CONTENT_KINDS.has(accepted) || names.has(accepted)) continue;
        at(
          `/skemo/regions/${index}/accepts`,
          "sxablono-ref-unknown",
          `The region ${region.name} of ${name} accepts ${accepted}, which is no Ero and no Sxablono.`,
          `Name an Ero, a Sxablono, text or icon.`,
        );
      }
    });
    const defaults = entry.skemo.regions.filter((region) => region.default === true);
    if (defaults.length > 1) {
      at(
        "/skemo/regions",
        "sxablono-ref-unknown",
        `${name} has ${defaults.length} default regions; one region at most is the default slot.`,
        "Keep default on one region.",
      );
    }
    for (const key of ["skip", "focus"] as const) {
      const target = entry.skemo.a11y[key];
      if (target === undefined || regions.includes(target)) continue;
      at(
        `/skemo/a11y/${key}`,
        "sxablono-ref-unknown",
        `a11y.${key} of ${name} names the region ${target}, which ${name} does not have.`,
        `Name one of its regions: ${regions.join(", ")}.`,
      );
    }
    for (const [part, properties] of Object.entries(entry.skemo.parts)) {
      for (const [property, source] of Object.entries(properties)) {
        const token = "fixed" in source ? source.fixed : undefined;
        if (token === undefined || core[token] !== undefined) continue;
        at(
          `/skemo/parts/${part}/${property}`,
          "sxablono-token-unknown",
          `${name} takes ${part}.${property} from ${token}, which the core does not have.`,
          "Use a token of the core; a token that is missing is a Manko, never a raw value (E6).",
        );
      }
    }
    if (entry.uzo === undefined) {
      at(
        "/sxablono",
        "sxablono-uzo-missing",
        `The Sxablono ${name} has no uzo.json beside its Skemo.`,
        "Add the Uzo: what it is for, its alternatives and boundaries, how it composes.",
      );
      continue;
    }
    const uzoFile = entry.uzoFile ?? entry.file;
    const named: [string, string | null | undefined][] = [
      ...entry.uzo.instead.map(
        (item, index) => [`/uzo/instead/${index}/ero`, item.ero] as [string, string | null],
      ),
      ...entry.uzo.boundary.map(
        (item, index) => [`/uzo/boundary/${index}/ero`, item.ero] as [string, string | undefined],
      ),
      ...entry.uzo.composes.with.map(
        (item, index) => [`/uzo/composes/with/${index}/ero`, item.ero] as [string, string],
      ),
      ...entry.uzo.composes.never.map(
        (item, index) => [`/uzo/composes/never/${index}/ero`, item.ero] as [string, string],
      ),
    ];
    for (const [pointer, target] of named) {
      if (target === null || target === undefined || names.has(target)) continue;
      issue(
        uzoFile,
        pointer,
        "sxablono-ref-unknown",
        `The Uzo of ${name} names ${target}, which is no Ero and no Sxablono.`,
        "Name an existing Ero or Sxablono, or use null in instead when nothing covers the case yet.",
      );
    }
    const reasons: [string, string | undefined][] = [
      ...entry.uzo.instead.map(
        (item, index) => [`/uzo/instead/${index}`, item.kialo] as [string, string],
      ),
      ...entry.uzo.boundary.map(
        (item, index) => [`/uzo/boundary/${index}`, item.kialo] as [string, string],
      ),
      ...entry.uzo.composes.with.map(
        (item, index) => [`/uzo/composes/with/${index}`, item.kialo] as [string, string],
      ),
    ];
    for (const [pointer, kialo] of reasons) {
      if (typeof kialo === "string" && kialo.trim() !== "") continue;
      issue(
        uzoFile,
        pointer,
        "uzo-kialo-missing",
        `${pointer.slice("/uzo/".length)} of the Uzo of ${name} has no kialo.`,
        "Say why, in one or two sentences an agent can pass on (Art. VI).",
      );
    }
  }
  return issues;
}

/** The IDs that tie a Sxablono, its Skemo and its Uzo together. */
function pairIssues(
  entry: LoadedSxablono,
  at: (pointer: string, rule: RuleId, message: string, suggestion: string) => void,
  issue: (file: string, pointer: string, rule: RuleId, message: string, suggestion: string) => void,
): void {
  const { sxablono, skemo, uzo } = entry;
  if (sxablono.skemo !== skemo.id) {
    at(
      "/sxablono/skemo",
      "sxablono-pair-mismatch",
      `The Sxablono ${sxablono.name} names the Skemo ${sxablono.skemo}, but its Skemo is ${skemo.id}.`,
      `Set sxablono.skemo to ${skemo.id}.`,
    );
  }
  if (skemo.sxablono !== sxablono.id) {
    at(
      "/skemo/sxablono",
      "sxablono-pair-mismatch",
      `The Skemo of ${sxablono.name} names the Sxablono ${skemo.sxablono}, but it belongs to ${sxablono.id}.`,
      `Set skemo.sxablono to ${sxablono.id}.`,
    );
  }
  if (uzo === undefined) return;
  const file = entry.uzoFile ?? entry.file;
  if (uzo.sxablono !== sxablono.id || uzo.skemo !== skemo.id) {
    issue(
      file,
      "/uzo",
      "sxablono-pair-mismatch",
      `The Uzo of ${sxablono.name} names ${uzo.sxablono} and ${uzo.skemo}; the folder holds ${sxablono.id} and ${skemo.id}.`,
      `Set uzo.sxablono to ${sxablono.id} and uzo.skemo to ${skemo.id}.`,
    );
  }
}
