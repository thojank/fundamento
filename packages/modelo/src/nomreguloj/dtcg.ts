// DTCG Celo: the canonical name is the DTCG path (identity).
import { isTokenName } from "../contracts/index.js";
import { tokenNameSegments } from "./token-name.js";
import type { TotalNomRegulo } from "./types.js";

export const DTCG_NOM_REGULO: TotalNomRegulo = {
  celo: "dtcg",
  derive(name) {
    return tokenNameSegments(name).join(".");
  },
  invert(target) {
    return isTokenName(target) ? target : null;
  },
};
