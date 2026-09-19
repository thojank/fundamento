// Rules of composing Aspekto packages with the core (Spec 001, D-05, D-06, D-08). Pure.

import type { IdsLock } from "../contracts/entity-ids.js";
import { formatIssuePath, type ValidationIssue } from "../contracts/issues.js";
import type { Modelo } from "../contracts/modelo.js";
import { checkIdNamespaces, type IdRegistry } from "../ids/check-ids.js";
import { ASPEKTO_DIMENSIO } from "../load/build.js";
import type { ModeloFiles } from "../load/files.js";
import { EXTENSION_POINTER, isJsonObject, rawEntries } from "./raw.js";

const KONDICXOJ_POINTER = `${EXTENSION_POINTER}/kondicxoj`;

function escapePointerSegment(segment: string): string {
  return segment.replaceAll("~", "~0").replaceAll("/", "~1");
}

/** The reference Aspekto named on the aspekto Dimensio, if any. */
export function referenceAspektoOf(modelo: Modelo): string | undefined {
  const aspekto = modelo.dimensioj.find((dimensio) => dimensio.name === ASPEKTO_DIMENSIO);
  return typeof aspekto?.referenceAspekto === "string" ? aspekto.referenceAspekto : undefined;
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
