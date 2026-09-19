// CSS Celo: `--fm-` + segments joined by `-` (FR-13, FR-14 namespace `--fm-`).

import { tokenNameSegments } from "./token-name.js";
import type { TotalNomRegulo } from "./types.js";

const CSS_PREFIX = "--fm-";
const CSS_TARGET_PATTERN = /^--fm-([a-z0-9]+(?:-[a-z0-9]+)*)$/;

export const CSS_NOM_REGULO: TotalNomRegulo = {
  celo: "css",
  derive(name) {
    return CSS_PREFIX + tokenNameSegments(name).join("-");
  },
  invert(target) {
    const match = CSS_TARGET_PATTERN.exec(target);
    return match?.[1] === undefined ? null : match[1].split("-").join(".");
  },
};
