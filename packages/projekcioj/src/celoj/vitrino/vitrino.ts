// The Vitrino Celo (Spec 004, FR-05 to FR-09, plan D-06): one self-contained HTML file with the
// whole visual layer of one Modelo. It runs in the second phase of the build, because it embeds
// what the other Celoj wrote: the stylesheet of the CSS Celo and the React-free element bundle of
// the reference kit. The composing is I/O; the document itself is a pure function.
//
// Spec 016 ② (G7, plan ② D-01–D-03): the Vitrino carries a second mode, the Werkstatt. For it the
// Celo embeds the structure the Agordilo derives over (core and the reference Aspekto, with the
// fingerprint `fm agordilo derive` writes as the origin), the calibration, the two schemas and the
// Agordilo itself, bundled for the browser — the same library, no second derivation.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  fingerprintOf,
  loadCalibration,
  loadIkonoGewichte,
  readStructure,
  referenceStructureFiles,
} from "@fundamento/agordilo";
import {
  buildModelo,
  readConfigSchema,
  readModeloSchema,
  referenceAspektoOf,
} from "@fundamento/modelo";
import type { Celo, CeloInput, GeneratedFile } from "../../build.js";
import { aspektoStylesheet } from "../css/css.js";
import { kitReferenceAspekto, kitTypesPath } from "../make-kit/make-kit.js";
import { type VitrinoBazo, vitrinoDatumoj } from "./datumoj.js";
import { vitrinoHtml, type WerkstattDatumoj } from "./html.js";
import { bundleWerkstatt } from "./werkstatt-bundle.js";

export const VITRINO_FILE = "vitrino/index.html";

export * from "./datumoj.js";
export * from "./html.js";

/** The kit file the Vitrino embeds: the elements without React, for plain HTML. */
const elementPath = (aspekto: string): string =>
  kitTypesPath(aspekto).replace(/dist\/index\.d\.ts$/, "dist/element.js");

/**
 * What the Werkstatt needs (plan ② D-02): the structure reduced to core and the reference
 * Aspekto — the documents `fm agordilo derive` derives over, so browser and CLI agree value for
 * value — with its fingerprint, the calibration of the Agordilo and the two schemas the Modelo
 * reads from disk. `undefined` for a Modelo without a reference package: the Vitrino then has no
 * Werkstatt.
 */
export function werkstattDatumoj(input: CeloInput): WerkstattDatumoj | undefined {
  // Spec 029 ①: the Werkstatt derives over komuna 0.2, as the CLI does (readStructure), whatever
  // values today's komuna has; a Modelo without a reference package has no Werkstatt.
  const files =
    input.files === undefined || input.files.packages[0] === undefined
      ? undefined
      : referenceStructureFiles(readStructure().files);
  const reference = referenceAspektoOf(input.modelo);
  if (files === undefined || reference === undefined) return undefined;
  const aspektoj = (
    input.modelo.dimensioj.find((dimensio) => dimensio.name === "aspekto")?.valoroj ?? []
  ).map((valoro) => valoro.name);
  // Spec 019 ①: the Ikonaro in the further Phosphor weights travels with the structure, so the
  // Werkstatt derives an Agordo with ikono.gewicht as the CLI does.
  const ikonoGewichte = loadIkonoGewichte();
  // Spec 029 ①: where the structure's values are not the reference Aspekto's of the build (komuna
  // 0.2 under today's komuna), the Werkstatt brings their stylesheet along — the page under a
  // draft shows what the Agordilo derives over, not a mix with today's values.
  const own = input.files === undefined ? undefined : referenceStructureFiles(input.files);
  const bazoCss =
    own !== undefined && fingerprintOf(own) === fingerprintOf(files)
      ? undefined
      : aspektoStylesheet(buildModelo(files).modelo, reference).replaceAll(
          ":where(:root",
          `:where(:root[data-fm-modus="werkstatt"]`,
        );
  return {
    ...(bazoCss === undefined ? {} : { bazoCss }),
    structure: {
      files,
      fingerprint: fingerprintOf(files),
      ...(ikonoGewichte === undefined ? {} : { ikonoGewichte }),
    },
    calibration: loadCalibration(),
    schemas: { modelo: readModeloSchema(), config: readConfigSchema() },
    reference,
    aspektoj,
  };
}

export const VITRINO_CELO: Celo = {
  name: "vitrino",
  // Nothing comes from the Modelo alone: the Vitrino is made of what the other Celoj wrote.
  generate: () => [],
  after(outDir: string, input: CeloInput): GeneratedFile[] {
    const css = readFileSync(join(outDir, "css/fundamento.css"), "utf8");
    const elementJs = readFileSync(
      join(outDir, elementPath(kitReferenceAspekto(input.modelo))),
      "utf8",
    );
    const werkstatt = werkstattDatumoj(input);
    return [
      {
        path: VITRINO_FILE,
        text: vitrinoHtml({
          css,
          elementJs,
          datumoj: vitrinoDatumoj({
            input,
            ...(input.bazo === undefined ? {} : { bazo: input.bazo }),
          }),
          ...(werkstatt === undefined ? {} : { werkstatt, werkstattJs: bundleWerkstatt() }),
        }),
      },
    ];
  },
};

export type { VitrinoBazo };
