// Figma Celo: variable name with segments joined by `/` (Figma's group separator).

import { tokenNameSegments } from "./token-name.js";
import type { TotalNomRegulo } from "./types.js";

const FIGMA_TARGET_PATTERN = /^[a-z0-9]+(?:\/[a-z0-9]+)*$/;

export const FIGMA_NOM_REGULO: TotalNomRegulo = {
  celo: "figma",
  derive(name) {
    return tokenNameSegments(name).join("/");
  },
  invert(target) {
    return FIGMA_TARGET_PATTERN.test(target) ? target.split("/").join(".") : null;
  },
};
