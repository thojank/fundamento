// The Agordo (Spec 016, G4): the recipe of a brand. It is read against `$defs/Agordo` of the one
// Modelo schema, so a broken Agordo is reported like a broken Modelo file — a path, a rule and a
// suggestion (code-style). Pure.

import {
  type Agordo,
  createModeloAjv,
  documentSchemaIssues,
  oklchComponentsOf,
  SCHEMA_DEFS,
  type ValidationIssue,
} from "@fundamento/modelo";

export type { Agordo, AgordoJugxo } from "@fundamento/modelo";

/** A colour of an Agordo in OKLCH: lightness 0…1, chroma ≥ 0, hue in degrees. */
export interface OklchColor {
  l: number;
  c: number;
  h: number;
}

export interface ReadAgordoResult {
  /** Present only when the value is a valid Agordo. */
  agordo?: Agordo;
  issues: ValidationIssue[];
}

let sharedAjv: ReturnType<typeof createModeloAjv> | undefined;

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const OKLCH = /^oklch\(\s*([0-9]*\.?[0-9]+)(%?)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s*\)$/;

/**
 * Reads a colour of an Agordo: hex with three or six digits, or `oklch(L C H)` with L as a number
 * (0…1) or a percentage. Anything else is `undefined`.
 */
export function parseAgordoColor(text: string): OklchColor | undefined {
  const hex = HEX.exec(text);
  if (hex?.[1] !== undefined) {
    const digits =
      hex[1].length === 3
        ? [...hex[1]].map((digit) => `${digit}${digit}`)
        : [hex[1].slice(0, 2), hex[1].slice(2, 4), hex[1].slice(4, 6)];
    const components = digits.map((pair) => Number.parseInt(pair, 16) / 255);
    const [l, c, h] = oklchComponentsOf({ colorSpace: "srgb", components });
    return { l, c, h };
  }
  const oklch = OKLCH.exec(text);
  if (oklch === null) return undefined;
  const [, lightness = "", percent, chroma = "", hue = ""] = oklch;
  const l = Number(lightness) / (percent === "%" ? 100 : 1);
  return { l, c: Number(chroma), h: Number(hue) };
}

/** Pointers of the colours an Agordo names, for the issue of a colour that does not parse. */
function colourPointers(agordo: Agordo): { pointer: string; text: string }[] {
  const colours = [{ pointer: "/leitfarbe", text: agordo.leitfarbe }];
  for (const [status, text] of Object.entries(agordo.zusatzfarben ?? {})) {
    if (typeof text === "string") colours.push({ pointer: `/zusatzfarben/${status}`, text });
  }
  return colours;
}

/**
 * Reads an Agordo from a parsed JSON value. `file` is the file part of every issue path (e.g.
 * `agordo.json`); `at` is the pointer of the Agordo inside that file, for an Agordo embedded in
 * another document (`aspekto.json`, `/agordilo/agordo`). Never throws.
 */
export function readAgordo(value: unknown, file = "agordo.json", at = ""): ReadAgordoResult {
  sharedAjv ??= createModeloAjv();
  const inFile = (issue: ValidationIssue): ValidationIssue =>
    at === "" ? issue : { ...issue, path: issue.path.replace(`${file}#`, `${file}#${at}`) };
  const issues = documentSchemaIssues({ file, value }, SCHEMA_DEFS.agordo, sharedAjv).map(inFile);
  if (issues.length > 0) return { issues };
  const agordo = value as Agordo;
  for (const { pointer, text } of colourPointers(agordo)) {
    const colour = parseAgordoColor(text);
    if (colour !== undefined && colour.l >= 0 && colour.l <= 1) continue;
    issues.push({
      rule: "schema-violation",
      severity: "error",
      path: `${file}#${at}${pointer}`,
      message: `The colour ${JSON.stringify(text)} has an OKLCH lightness outside 0…1.`,
      suggestion: "Give the colour as hex (#rrggbb) or as oklch(L C H) with L between 0 and 1.",
    });
  }
  return issues.length > 0 ? { issues } : { agordo, issues };
}
