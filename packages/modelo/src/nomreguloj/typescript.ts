// TypeScript Celo: a property access on the `vortaro` object. A segment starting with a letter
// is a valid IdentifierName (reserved words such as `default`, `class`, `new` included, since
// ES5 allows them after `.`), so it uses `.seg`. A segment starting with a digit is not, so it
// uses `["seg"]`. Every segment has exactly one spelling, which keeps the rule invertible.

import { tokenNameSegments } from "./token-name.js";
import type { TotalNomRegulo } from "./types.js";

const TYPESCRIPT_ROOT = "vortaro";
const ACCESSOR = /\.([a-z][a-z0-9]*)|\["([0-9][a-z0-9]*)"\]/y;

function accessor(segment: string): string {
  return /^[a-z]/.test(segment) ? `.${segment}` : `["${segment}"]`;
}

export const TYPESCRIPT_NOM_REGULO: TotalNomRegulo = {
  celo: "typescript",
  derive(name) {
    return TYPESCRIPT_ROOT + tokenNameSegments(name).map(accessor).join("");
  },
  invert(target) {
    if (!target.startsWith(TYPESCRIPT_ROOT)) {
      return null;
    }
    const segments: string[] = [];
    const accessorPattern = new RegExp(ACCESSOR);
    accessorPattern.lastIndex = TYPESCRIPT_ROOT.length;
    while (accessorPattern.lastIndex < target.length) {
      const match = accessorPattern.exec(target);
      const segment = match?.[1] ?? match?.[2];
      if (segment === undefined) {
        return null;
      }
      segments.push(segment);
    }
    return segments.length === 0 ? null : segments.join(".");
  },
};
