// NomReguloj (FR-13, FR-13a, FR-13b): one pure derive/invert rule per Celo.
import { CSS_NOM_REGULO } from "./css.js";
import { DTCG_NOM_REGULO } from "./dtcg.js";
import { FIGMA_NOM_REGULO } from "./figma.js";
import { TAILWIND_NOM_REGULO } from "./tailwind.js";
import type { Celo, NomRegulo, TotalNomRegulo } from "./types.js";
import { TYPESCRIPT_NOM_REGULO } from "./typescript.js";

export { CSS_NOM_REGULO } from "./css.js";
export { DTCG_NOM_REGULO } from "./dtcg.js";
export { FIGMA_NOM_REGULO } from "./figma.js";
export { TAILWIND_NOM_REGULO } from "./tailwind.js";
export { checkTokenName, TokenNameError } from "./token-name.js";
export {
  CELOJ,
  type Celo,
  isNoTarget,
  type NomRegulo,
  type NoTarget,
  type TotalNomRegulo,
} from "./types.js";
export { TYPESCRIPT_NOM_REGULO } from "./typescript.js";

/** All NomReguloj keyed by Celo. The four total rules keep their `string`-returning type. */
export const NOM_REGULOJ: {
  readonly [C in Celo]: C extends "tailwind" ? NomRegulo & { celo: "tailwind" } : TotalNomRegulo;
} = {
  css: CSS_NOM_REGULO,
  figma: FIGMA_NOM_REGULO,
  typescript: TYPESCRIPT_NOM_REGULO,
  tailwind: TAILWIND_NOM_REGULO,
  dtcg: DTCG_NOM_REGULO,
};

export function nomRegulo<C extends Celo>(celo: C): (typeof NOM_REGULOJ)[C] {
  return NOM_REGULOJ[celo];
}
