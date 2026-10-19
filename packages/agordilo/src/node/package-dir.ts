// A derived package on disk (Spec 016, G8): writing it (`fm agordilo derive --out`) and checking
// it again against its shipped Raporto (`fm agordilo check`). The I/O edge of the Agordilo.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { ValidationIssue } from "@fundamento/modelo";
import { readAgordo } from "../agordo.js";
import { checkAspekto } from "../check.js";
import { derivationBasis } from "../derive.js";
import { type Raporto, renderRaportoMd, serializeRaporto } from "../raporto.js";
import { isRecord } from "../record.js";
import { loadCalibration, readStructureWith } from "./structure.js";

/** Whether `dir` may be written: absent, empty, or a package the Agordilo derived before. */
export function writablePackageDir(dir: string): boolean {
  if (!existsSync(dir)) return true;
  if (readdirSync(dir).length === 0) return true;
  const aspekto = join(dir, "aspekto.json");
  if (!existsSync(aspekto)) return false;
  try {
    const value: unknown = JSON.parse(readFileSync(aspekto, "utf8"));
    return isRecord(value) && isRecord(value.agordilo);
  } catch {
    return false;
  }
}

/**
 * Writes a derived package: the directory is replaced as a whole, so no file of an earlier
 * derivation (a Jugxo no longer recorded) stays behind. Call `writablePackageDir` first.
 */
export function writePackage(dir: string, files: Readonly<Record<string, string>>): void {
  rmSync(dir, { recursive: true, force: true });
  for (const [path, text] of Object.entries(files)) {
    const target = join(dir, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, text);
  }
}

export interface PackageCheck {
  /** The checks pass, the export is allowed and the shipped Raporto matches. */
  ok: boolean;
  issues: ValidationIssue[];
  raporto?: Raporto;
}

/**
 * Checks a derived package again (G8): reads it with the core, runs every check, rebuilds the
 * Raporto from its Agordo and compares it with raporto.json and raporto.md.
 */
export function checkPackageDir(dir: string): PackageCheck {
  const absolute = resolve(dir);
  const read = readStructureWith(absolute);
  const readErrors = read.issues.filter((issue) => issue.severity === "error");
  if (read.structure === undefined || readErrors.length > 0) {
    return { ok: false, issues: readErrors.length > 0 ? readErrors : read.issues };
  }
  const { structure } = read;
  const pkg = structure.files.packages.at(-1);
  const aspekto =
    pkg === undefined || structure.files.packages.length < 2 ? undefined : pkg.aspekto.value;
  const origin = isRecord(aspekto) ? aspekto.agordilo : undefined;
  if (pkg === undefined || !isRecord(origin)) {
    return {
      ok: false,
      issues: [
        {
          rule: "schema-violation",
          severity: "error",
          path: "aspekto.json#/agordilo",
          message: `${absolute} is no Aspekto the Agordilo derived: aspekto.json names no origin (agordilo).`,
          suggestion:
            "Check a package written by `fm agordilo derive`, or validate it with `fm modelo validate --aspekto`.",
        },
      ],
    };
  }
  const { agordo, issues: agordoIssues } = readAgordo(
    origin.agordo,
    "aspekto.json",
    "/agordilo/agordo",
  );
  if (agordo === undefined) return { ok: false, issues: agordoIssues };

  const calibration = loadCalibration();
  const basis = derivationBasis(agordo, structure, calibration);
  const { floors, overrides, palettes, gestalt } = basis;
  const { raporto, issues } = checkAspekto({
    files: structure.files,
    label: pkg.name,
    agordo,
    calibration,
    floors,
    overrides,
    palettes,
    gestalt,
    agordoIssues: basis.agordoIssues,
  });
  const stale: ValidationIssue[] = [];
  for (const [file, expected] of [
    ["raporto.json", serializeRaporto(raporto)],
    ["raporto.md", renderRaportoMd(raporto)],
  ] as const) {
    const path = join(absolute, file);
    const shipped = existsSync(path) ? readFileSync(path, "utf8") : undefined;
    if (shipped === expected) continue;
    stale.push({
      rule: "raporto-out-of-sync",
      severity: "error",
      path: file,
      message:
        shipped === undefined
          ? `The package ships no ${file}.`
          : `${file} differs from the report the checks give today.`,
      suggestion:
        "Derive the package again with `fm agordilo derive <agordo.json> --out <dir>`; never edit the report by hand.",
    });
  }
  const all = [...stale, ...issues];
  return { ok: all.length === 0, issues: all, raporto };
}
