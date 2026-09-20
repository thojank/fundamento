// The Vitrino Celo (Spec 004, FR-05 to FR-09, plan D-06): one self-contained HTML file with the
// whole visual layer of one Modelo. It runs in the second phase of the build, because it embeds
// what the other Celoj wrote: the stylesheet of the CSS Celo and the React-free element bundle of
// the reference kit. The composing is I/O; the document itself is a pure function.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Celo, CeloInput, GeneratedFile } from "../../build.js";
import { kitReferenceAspekto, kitTypesPath } from "../make-kit/make-kit.js";
import { type VitrinoBazo, vitrinoDatumoj } from "./datumoj.js";
import { vitrinoHtml } from "./html.js";

export const VITRINO_FILE = "vitrino/index.html";

export * from "./datumoj.js";
export * from "./html.js";

/** The kit file the Vitrino embeds: the elements without React, for plain HTML. */
const elementPath = (aspekto: string): string =>
  kitTypesPath(aspekto).replace(/dist\/index\.d\.ts$/, "dist/element.js");

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
        }),
      },
    ];
  },
};

export type { VitrinoBazo };
