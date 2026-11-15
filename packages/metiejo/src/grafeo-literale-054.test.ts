// Spec 054 (MP-1, T3, AK-22): the view Gestalten takes every colour from a role of the neutral
// Belegung (`var(--fm-*)`, or a `--xy-*` that points at one); the only colours that do not come from
// a token are the brand's, and those arrive as data. So no source under
// `packages/nodredaktilo/src/gestalten/**` may carry a colour literal: no hex value, no `rgb(`,
// `rgba(`, `hsl(`, `hsla(`, `oklch(`, `oklab(`, `lab(`, `lch(` or `hwb(` – in code, in a style
// string or in a comment. Every hit is collected with file and line into one comparison.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const GESTALTEN_DIR = fileURLToPath(new URL("../../nodredaktilo/src/gestalten/", import.meta.url));

/** The files of the canvas shell (MPFG-2.2); the node tickets replace bodies, never remove them. */
const SHELL = [
  "kanvaso.tsx",
  "kapo.tsx",
  "menuo.tsx",
  "anschluss.tsx",
  "kanto.tsx",
  "roloj.ts",
  "datumoj.ts",
  "nodoj/marko.tsx",
  "nodoj/farbo.tsx",
  "nodoj/paletro.tsx",
  "nodoj/vorschau.tsx",
] as const;

/** Every source file below `dir`, relative to it, sorted. */
function sources(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const walk = (current: string): void => {
    for (const name of readdirSync(current).sort()) {
      const path = join(current, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(tsx?|css)$/.test(name)) out.push(relative(dir, path).split("\\").join("/"));
    }
  };
  walk(dir);
  return out;
}

/** A hex colour (3, 4, 6 or 8 digits, not part of a longer word) or a colour function. */
const LITERALE: readonly { art: string; muster: RegExp }[] = [
  { art: "hex", muster: /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z_-])/g },
  { art: "funktion", muster: /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\s*\(/gi },
];

/** Every colour literal in the sources, as `file:line: match`. */
function literale(dir: string): string[] {
  const out: string[] = [];
  for (const file of sources(dir)) {
    const lines = readFileSync(join(dir, file), "utf8").split("\n");
    lines.forEach((line, index) => {
      for (const { art, muster } of LITERALE) {
        for (const treffer of line.matchAll(muster)) {
          out.push(`${file}:${index + 1}: ${art} ${treffer[0]}`);
        }
      }
    });
  }
  return out;
}

describe("Spec 054 – no colour literal in the view Gestalten (AK-22)", () => {
  it("the scan reads the files of the canvas shell (it is not empty)", () => {
    const vorhanden = new Set(sources(GESTALTEN_DIR));
    expect(SHELL.filter((file) => !vorhanden.has(file))).toEqual([]);
  });

  it("no source under src/gestalten carries a hex, rgb(, hsl( or oklch( literal", () => {
    expect(literale(GESTALTEN_DIR)).toEqual([]);
  });

  it("the sweep itself finds each kind of literal (guards the patterns)", () => {
    const probe = [
      "color: #12a;",
      "fill: #a1b2c3d4;",
      "border: 1px solid #A1B2C3;",
      'background: "rgb(1 2 3)";',
      "x = hsla(1, 2%, 3%, 0.4)",
      "c = oklch(0.86 0.17 92)",
    ];
    const funde = probe.flatMap((line) =>
      LITERALE.flatMap(({ muster }) => [...line.matchAll(muster)].map((t) => t[0])),
    );
    expect(funde).toEqual(["#12a", "#a1b2c3d4", "#A1B2C3", "rgb(", "hsla(", "oklch("]);
    // Not colours: an id selector, a private field, a role, a text that names the format.
    const ruhig = ["#nr-leinwand", "this.#zustand", "var(--fm-color-text-muted)", "#RRGGBB"];
    expect(
      ruhig.flatMap((line) => LITERALE.flatMap(({ muster }) => [...line.matchAll(muster)])),
    ).toEqual([]);
  });
});
