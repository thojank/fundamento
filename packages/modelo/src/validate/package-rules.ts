// Rules of composing Aspekto packages with the core (Spec 001, D-05, D-06, D-08). Pure.

import { checkRegularo } from "../checks/regularo/rules.js";
import type { IdsLock } from "../contracts/entity-ids.js";
import { CORE_SET_NAME } from "../contracts/grammar.js";
import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import type { Modelo } from "../contracts/modelo.js";
import { checkIdNamespaces, type IdRegistry } from "../ids/check-ids.js";
import { ASPEKTO_DIMENSIO, referenceAspektoOf } from "../load/build.js";
import type { ModeloDocument, ModeloFiles } from "../load/files.js";
import { EXTENSION_POINTER, isJsonObject, rawEntries } from "./raw.js";

const KONDICXOJ_POINTER = `${EXTENSION_POINTER}/kondicxoj`;

function escapePointerSegment(segment: string): string {
  return segment.replaceAll("~", "~0").replaceAll("/", "~1");
}

/**
 * `aspekto-set-foreign`, `aspekto-name-duplicate`, `aspekto-reference-missing`, the ID namespace
 * rules over every registry, and `id-duplicate` for an ID registered in two registries.
 */
export function packageIssues(modelo: Modelo, files: ModeloFiles): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const packages = new Map(modelo.aspektoPackages.map((pkg) => [pkg.name, pkg]));

  for (const set of modelo.setoj) {
    const pkg = set.package === undefined ? undefined : packages.get(set.package);
    if (pkg?.aspekto === undefined) {
      continue;
    }
    const own = set.kondicxoj.some(
      (kondicxo) => kondicxo.dimensio === ASPEKTO_DIMENSIO && kondicxo.valoro === pkg.aspekto,
    );
    if (!own) {
      issues.push({
        rule: "aspekto-set-foreign",
        severity: "error",
        path: formatIssuePath({ file: set.file, pointer: KONDICXOJ_POINTER }),
        message: `The package ${pkg.name} holds the set ${set.name}, which is not conditioned on its own Aspekto ${pkg.aspekto}.`,
        suggestion: `An Aspekto package only holds aspekto/${pkg.aspekto} and conjunction sets aspekto/${pkg.aspekto}+<dimensio>/<valoro>; generic Dimensio sets belong to the core.`,
      });
    }
  }

  for (const pkg of modelo.aspektoPackages) {
    if (!pkg.composed && pkg.aspekto !== undefined) {
      issues.push({
        rule: "aspekto-name-duplicate",
        severity: "error",
        path: formatIssuePath({ file: pkg.aspektoFile, pointer: "/name" }),
        message: `The package ${pkg.name} declares the Aspekto ${pkg.aspekto}, which already exists.`,
        suggestion:
          "Give every Aspekto a unique name; two packages cannot provide the same Aspekto.",
      });
    }
  }

  const reference = referenceAspektoOf(modelo);
  const dimensiojFile = files.data["dimensioj.json"];
  if (reference !== undefined) {
    const aspekto = modelo.dimensioj.find((dimensio) => dimensio.name === ASPEKTO_DIMENSIO);
    const known = (aspekto?.valoroj ?? []).some(
      (valoro) => isJsonObject(valoro) && valoro.name === reference,
    );
    if (!known) {
      const index = rawEntries(dimensiojFile.value, "dimensioj").find(
        ({ entry }) => entry.name === ASPEKTO_DIMENSIO,
      )?.index;
      issues.push({
        rule: "aspekto-reference-missing",
        severity: "error",
        path: formatIssuePath({
          file: dimensiojFile.file,
          pointer: `/dimensioj/${index ?? 0}/referenceAspekto`,
        }),
        message: `The reference Aspekto ${reference} is not loaded.`,
        suggestion: `Load the package of ${reference} (the reference Aspekto is always part of the core), or correct referenceAspekto.`,
      });
    }
  }

  issues.push(...completenessIssues(modelo, reference));

  const coreLock = modeloLockOf(files);
  const registries: IdRegistry[] = [
    { lockFile: files.data["ids.lock.json"].file, lock: coreLock },
    ...modelo.aspektoPackages.map((pkg) => {
      const registry: IdRegistry = {
        lockFile: pkg.lockFile,
        aspektoFile: pkg.aspektoFile,
        lock: pkg.idsLock,
      };
      if (pkg.namespace !== undefined) registry.namespace = pkg.namespace;
      return registry;
    }),
  ];
  issues.push(...checkIdNamespaces(registries));

  for (const pkg of modelo.aspektoPackages) {
    if (pkg.namespace === undefined && pkg.aspekto !== undefined && pkg.aspekto !== reference) {
      issues.push({
        rule: "id-namespace-mismatch",
        severity: "error",
        path: formatIssuePath({ file: pkg.aspektoFile, pointer: "/idNamespace" }),
        message: `The package ${pkg.name} has no idNamespace; only the reference Aspekto may mint core-format IDs.`,
        suggestion: 'Add "idNamespace" (2–8 lowercase letters) to aspekto.json.',
      });
    }
  }

  const seen = new Map<string, string>(
    Object.keys(coreLock.ids).map((id) => [id, registries[0]?.lockFile ?? ""]),
  );
  for (const pkg of modelo.aspektoPackages) {
    for (const id of Object.keys(pkg.idsLock.ids).sort()) {
      const first = seen.get(id);
      if (first !== undefined) {
        issues.push({
          rule: "id-duplicate",
          severity: "error",
          path: formatIssuePath({
            file: pkg.lockFile,
            pointer: `/ids/${escapePointerSegment(id)}`,
          }),
          message: `ID '${id}' is already registered in ${first}.`,
          suggestion:
            "Every ID lives in exactly one registry; mint package IDs with the package's own lock.",
        });
      } else {
        seen.set(id, pkg.lockFile);
      }
    }
  }
  return issues;
}

/** The core registry as read (the Modelo's `idsLock` is the union with the package locks). */
function modeloLockOf(files: ModeloFiles): IdsLock {
  const value = files.data["ids.lock.json"].value;
  return isJsonObject(value) && isJsonObject(value.ids)
    ? { ids: value.ids as IdsLock["ids"] }
    : { ids: {} };
}

/**
 * D-04 / FR-10: every package Aspekto except the reference overrides every core token in its
 * single-condition set `aspekto/<name>` (`aspekto-incomplete`, one issue per missing token at the
 * pointer where it would sit); the reference Aspekto's own set is empty
 * (`aspekto-reference-set-not-empty`, one issue per token). Conjunction sets carry deltas and are
 * exempt. Aspektoj declared inline in dimensioj.json (the Phase-0 layout, fixtures only) are not
 * packages and are not checked; the repo declares none.
 */
function completenessIssues(modelo: Modelo, reference: string | undefined): ValidationIssue[] {
  const core = modelo.setoj.find((set) => set.name === CORE_SET_NAME);
  if (core === undefined) {
    return [];
  }
  const coreNames = Object.keys(core.tokens).sort();
  const issues: ValidationIssue[] = [];
  for (const pkg of modelo.aspektoPackages) {
    if (!pkg.composed || pkg.aspekto === undefined) {
      continue;
    }
    const setName = `${ASPEKTO_DIMENSIO}/${pkg.aspekto}`;
    const set = modelo.setoj.find(
      (candidate) => candidate.package === pkg.name && candidate.name === setName,
    );
    const file = set?.file ?? pkg.aspektoFile.replace(/aspekto\.json$/, `sets/${setName}.json`);
    if (pkg.aspekto === reference) {
      for (const name of Object.keys(set?.tokens ?? {}).sort()) {
        issues.push({
          rule: "aspekto-reference-set-not-empty",
          severity: "error",
          path: formatIssuePath({ file, pointer: tokenPointer(name) }),
          message: `${setName} overrides ${name}, but ${pkg.aspekto} is the reference Aspekto: its values live in core.`,
          suggestion: `Change the value in core instead; ${setName} stays empty (FR-10).`,
        });
      }
      continue;
    }
    for (const name of coreNames) {
      if (set?.tokens[name] !== undefined) {
        continue;
      }
      issues.push({
        rule: "aspekto-incomplete",
        severity: "error",
        path: formatIssuePath({ file, pointer: tokenPointer(name) }),
        message: `The Aspekto ${pkg.aspekto} does not override ${name}; every Aspekto is a complete assignment of the Vortaro (Art. IV).`,
        suggestion: `Add ${name} to ${setName} (an alias identical to core counts). No Aspekto inherits values from core or from the reference Aspekto.`,
      });
    }
  }
  return issues;
}

function tokenPointer(name: string): string {
  return `/${name.split(".").map(escapePointerSegment).join("/")}`;
}

/**
 * D-10: the Reguloj and Jugxoj of Aspekto packages follow the core rules (kialo, references to
 * existing Reguloj across all files), and every Aspekto-scoped entry names a loaded Aspekto; a
 * package entry names its own (`regulo-aspekto-unknown`).
 */
export function packageRegularoIssues(modelo: Modelo, files: ModeloFiles): ValidationIssue[] {
  const reguloj = [
    files.data["reguloj.json"],
    ...files.packages.flatMap((pkg) => (pkg.reguloj ? [pkg.reguloj] : [])),
  ];
  const jugxoj = [
    files.data["jugxoj.json"],
    ...files.packages.flatMap((pkg) => (pkg.jugxoj ? [pkg.jugxoj] : [])),
  ];
  const eroIds = new Set(modelo.eroj.map((entry) => entry.ero.id));
  const issues = checkRegularo({ reguloj, jugxoj, eroIds }).issues;

  const aspekto = modelo.dimensioj.find((dimensio) => dimensio.name === ASPEKTO_DIMENSIO);
  const known = new Set((aspekto?.valoroj ?? []).map((valoro) => valoro.name));
  const scan = (document: ModeloDocument, key: "reguloj" | "jugxoj", own: string | undefined) => {
    for (const { entry, index } of rawEntries(document.value, key)) {
      const named = entry.aspekto;
      if (named === undefined) continue;
      const foreign = own !== undefined && named !== own;
      if (typeof named === "string" && known.has(named) && !foreign) continue;
      issues.push({
        rule: "regulo-aspekto-unknown",
        severity: "error",
        path: formatIssuePath({ file: document.file, pointer: `/${key}/${index}/aspekto` }),
        message: foreign
          ? `This entry of the package for ${own} is scoped to ${String(named)}; a package only holds Reguloj and Jugxoj of its own Aspekto.`
          : `This entry is scoped to the Aspekto ${JSON.stringify(named)}, which is not loaded.`,
        suggestion: `Scope it to one of: ${[...known].join(", ")}${own === undefined ? "" : ` (in this package: ${own})`}.`,
      });
    }
  };
  scan(files.data["reguloj.json"], "reguloj", undefined);
  scan(files.data["jugxoj.json"], "jugxoj", undefined);
  files.packages.forEach((pkg, index) => {
    const own = modelo.aspektoPackages[index]?.aspekto;
    if (pkg.reguloj) scan(pkg.reguloj, "reguloj", own);
    if (pkg.jugxoj) scan(pkg.jugxoj, "jugxoj", own);
  });
  return issues;
}
