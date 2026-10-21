// From an Agordo to a complete, checked Aspekto package (Spec 016, G1–G6, G8): derive the six
// palettes, write the package files over the structure, compose them with the Modelo in memory,
// run the checks and write the Raporto. The export decision is the Raporto's: refused while a
// fixed rule is violated or an adjustable violation has no Jugxo. Pure — the CLI writes the files.

import {
  type AspektoPackageFiles,
  buildModelo,
  deriveThemeFragment,
  type Modelo,
  type ModeloFiles,
  type ModeloSetDocument,
  serializeCanonicalJson,
  type ValidationIssue,
} from "@fundamento/modelo";
import type { Agordo } from "./agordo.js";
import { type Calibration, structureModelo } from "./calibration.js";
import { ADJUSTABLE_RULES, checkAspekto } from "./check.js";
import { deriveGestalt, type Gestalt, gestaltBasis } from "./gestalt.js";
import {
  ikonoChoice,
  modeOverrides,
  type PackageDocuments,
  packageDocuments,
  type RecordedJugxo,
  serializeDocument,
} from "./package.js";
import {
  type DerivedPalettes,
  derivePalettes,
  type ModeOverride,
  type TargetFloors,
  withFestgelegtSteps,
} from "./palettes.js";
import { type Raporto, renderRaportoMd, serializeRaporto } from "./raporto.js";
import { isRecord } from "./record.js";
import type { Structure } from "./structure.js";

export interface Derivation {
  /** Package-relative path → file text, in path order. Written only when `exportable`. */
  files: Record<string, string>;
  raporto: Raporto;
  exportable: boolean;
  /** Why the export is refused; empty when it is allowed. */
  issues: ValidationIssue[];
  palettes: DerivedPalettes;
}

/** The label of the derived package inside the composed Modelo (never written anywhere). */
export function packageLabel(agordo: Agordo): string {
  return `aspekto-${agordo.name}`;
}

/**
 * The floors of the sliders (G4): every WCAG 2.x threshold of kontrastSojloj and the reserve of
 * the Regulo contrast-reserve.
 */
export function floorsOf(modelo: Modelo): TargetFloors {
  const thresholds = new Set<number>();
  for (const dimensio of modelo.dimensioj) {
    for (const valoro of Array.isArray(dimensio.valoroj) ? dimensio.valoroj : []) {
      const sojloj = isRecord(valoro) ? valoro.kontrastSojloj : undefined;
      const wcag2 = isRecord(sojloj) ? sojloj.wcag2 : undefined;
      if (!isRecord(wcag2)) continue;
      for (const value of Object.values(wcag2)) {
        if (typeof value === "number") thresholds.add(value);
      }
    }
  }
  const reserve = modelo.reguloj.find((regulo) => regulo.name === "contrast-reserve")?.sojlo?.min;
  return { thresholds: [...thresholds].sort((a, b) => a - b), reserve: reserve ?? 0 };
}

const byName = (a: { name: string }, b: { name: string }): number =>
  a.name < b.name ? -1 : a.name > b.name ? 1 : 0;

/** The structure's files with the derived package composed (in memory). */
export function composeFiles(
  structure: Structure,
  label: string,
  documents: PackageDocuments,
  themes: unknown,
): ModeloFiles {
  const prefix = `${label}/`;
  const document = (path: string) => ({ file: `${prefix}${path}`, value: documents.json[path] });
  const ikonoj: Record<string, string> = {};
  for (const [path, svg] of Object.entries(documents.text)) {
    const glyph = /^ikonoj\/(.+)\.svg$/.exec(path)?.[1];
    if (glyph !== undefined) ikonoj[glyph] = svg;
  }
  const pkg: AspektoPackageFiles = {
    name: label,
    dir: label,
    aspekto: document("aspekto.json"),
    idsLock: document("ids.lock.json"),
    themes: { file: `${prefix}$themes.json`, value: themes },
    ikonoj,
  };
  if (documents.json["jugxoj.json"] !== undefined) pkg.jugxoj = document("jugxoj.json");
  const sets: ModeloSetDocument[] = documents.sets.map((set) => ({
    name: set.name,
    package: label,
    ...document(set.path),
  }));
  return {
    ...structure.files,
    sets: [...structure.files.sets, ...sets].sort(byName),
    packages: [...structure.files.packages, pkg],
  };
}

/** The Jugxoj of the Agordo that can be recorded: a known, adjustable Regulo. */
function recordedJugxoj(agordo: Agordo, modelo: Modelo): RecordedJugxo[] {
  return (agordo.jugxoj ?? []).flatMap((jugxo) => {
    const regulo = modelo.reguloj.find(
      (entry) => entry.aspekto === undefined && entry.name === jugxo.regulo,
    );
    if (regulo === undefined || !ADJUSTABLE_RULES.includes(regulo.name)) return [];
    return [
      {
        regulo: { id: regulo.id, name: regulo.name },
        kialo: jugxo.kialo,
        date: jugxo.date,
        name: jugxo.name,
      },
    ];
  });
}

export interface DerivationBasis {
  modelo: Modelo;
  floors: TargetFloors;
  overrides: ModeOverride[];
  palettes: DerivedPalettes;
  /** Form, space, type and icon weight of stage 2 (Spec 019 ①): the tokens they change, the hints. */
  gestalt: Gestalt;
  /** Why the Agordo's icon weight cannot be drawn (Spec 019 ①, E6); empty when it can. */
  agordoIssues: ValidationIssue[];
}

/** The palettes of an Agordo over a structure, with what they were derived against. */
export function derivationBasis(
  agordo: Agordo,
  structure: Structure,
  calibration: Calibration,
): DerivationBasis {
  const modelo = structureModelo(structure);
  const floors = floorsOf(modelo);
  const overrides = modeOverrides(structure);
  return {
    modelo,
    floors,
    overrides,
    palettes: withFestgelegtSteps(derivePalettes(agordo, calibration, floors, overrides), agordo),
    gestalt: deriveGestalt(agordo, gestaltBasis(structure.files)),
    agordoIssues: ikonoChoice(agordo, structure).issues,
  };
}

/** Derives the Aspekto of an Agordo over a structure with a calibration. */
export function deriveAspekto(
  agordo: Agordo,
  structure: Structure,
  calibration: Calibration,
): Derivation {
  const { modelo, floors, overrides, palettes, gestalt, agordoIssues } = derivationBasis(
    agordo,
    structure,
    calibration,
  );
  const documents = packageDocuments(
    agordo,
    structure,
    palettes,
    recordedJugxoj(agordo, modelo),
    gestalt,
  );
  const label = packageLabel(agordo);

  // $themes.json is the fragment the composed Modelo derives for the package (Spec 001, D-05).
  const draft = buildModelo(composeFiles(structure, label, documents, [])).modelo;
  const themes = deriveThemeFragment(draft, label);
  const files = composeFiles(structure, label, documents, themes);
  const { raporto, issues } = checkAspekto({
    files,
    label,
    agordo,
    calibration,
    floors,
    overrides,
    palettes,
    gestalt,
    agordoIssues,
  });

  const out: Record<string, string> = {};
  for (const [path, value] of Object.entries(documents.json)) {
    out[path] = serializeDocument(path, value);
  }
  out["$themes.json"] = serializeCanonicalJson(themes);
  Object.assign(out, documents.text);
  out["raporto.json"] = serializeRaporto(raporto);
  out["raporto.md"] = renderRaportoMd(raporto);
  const sorted = Object.fromEntries(
    Object.entries(out).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
  return { files: sorted, raporto, exportable: raporto.summary.exportable, issues, palettes };
}
