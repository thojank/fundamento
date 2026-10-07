// Penpot Celo: a Penpot token is named by its DTCG path, dots between the groups (identity). Every
// canonical name also satisfies Penpot's own name rule (letters, digits, `_`, `-` and `$` per
// segment, segments joined by dots).
import { isTokenName } from "../contracts/index.js";
import { tokenNameSegments } from "./token-name.js";
import type { TotalNomRegulo } from "./types.js";

export const PENPOT_NOM_REGULO: TotalNomRegulo = {
  celo: "penpot",
  derive(name) {
    return tokenNameSegments(name).join(".");
  },
  invert(target) {
    return isTokenName(target) ? target : null;
  },
};
