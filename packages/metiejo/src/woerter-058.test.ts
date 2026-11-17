// Spec 058 (MP-2c, T10, MAW-5.1, plan §2 item 9): neither the brand word of R-12 of Spec 035 nor the
// name of the private font repository stands in any file this spec adds or changes in this package
// – its product sources, its tests and its doubles. The words are never written here: the R-12 word
// is assembled from parts as the guard of `markenliste-055.test.ts` does it, and both are found by
// their SHA-256 (as `check:privat` finds them) over every window of their length. A found word is
// named by its number, never printed. The test reads only files of this package (the hash of its
// test task, `turbo-inputs.test.ts`); the canvas, the image script and `specs/058-marke-auswerten/`
// are searched by the AK-9 diff search (`specs/058-marke-auswerten/diff-suche.mjs`).

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC = fileURLToPath(new URL(".", import.meta.url));

/** The files of this spec in `src/` that carry no `058` in their name. */
const QUELLEN_058 = [
  "beispiele-pinterest.ts",
  "beispiele-vojoj.ts",
  "grafeo-anschluss-056.test.ts",
  "grafeo-gestalten-sicht.ts",
  "grafeo-gestalten.ts",
  "grafeo-skribo.ts",
  "ki-profil-vojoj.ts",
  "ki-vojoj.ts",
  "layout-bild.ts",
  "layout-vojoj.ts",
  "leinwand-auswertung.ts",
  "leinwand-enhavo.ts",
  "leinwand-ki.ts",
  "leinwand-stato.ts",
  "marken-vojoj.ts",
  "servilo.ts",
  "vorschau-korpo.ts",
  "vorschau-marke.ts",
] as const;

/** Every file below a path (the path itself when it is a file). */
function dosierojDe(pfad: string): string[] {
  if (!existsSync(pfad)) return [];
  if (!statSync(pfad).isDirectory()) return [pfad];
  return readdirSync(pfad).flatMap((ero) => dosierojDe(join(pfad, ero)));
}

/** All files of this spec here: the list above and every file with `058` in its name or folder. */
function dosieroj058(): string[] {
  const kun058 = [
    ...readdirSync(SRC).filter((d) => d.includes("-058")),
    ...readdirSync(join(SRC, "test-doubles"))
      .filter((d) => d.includes("058"))
      .map((d) => join("test-doubles", d)),
  ];
  return [...new Set([...QUELLEN_058, ...kun058].map((d) => join(SRC, d)).flatMap(dosierojDe))];
}

/** The two words: the R-12 word from parts, the repository's name by its hash and length. */
const R12 = ["cif", "ere", "cigo"].join("");
const SUCHE = [
  { laenge: R12.length, sha256: createHash("sha256").update(R12).digest("hex") },
  { laenge: 29, sha256: "a34fce80f881d3aba92b597410a051ffa2febb800b3510f09b4f2aa35184b67d" },
] as const;

/** The numbers of the words a text contains (lower case, every window of each word's length). */
function treffer(text: string): number[] {
  const klein = text.toLowerCase();
  return SUCHE.flatMap((wort, i) => {
    for (let s = 0; s + wort.laenge <= klein.length; s++) {
      const fenster = klein.slice(s, s + wort.laenge);
      if (!/^[a-z0-9-]+$/.test(fenster)) continue;
      if (createHash("sha256").update(fenster).digest("hex") === wort.sha256) return [i + 1];
    }
    return [];
  });
}

describe("MAW-5.1: no line of Spec 058 carries the R-12 word or the private font repository's name", () => {
  it("finds neither word in any file of this spec in this package", () => {
    const dateien = dosieroj058();
    expect(dateien.length).toBeGreaterThan(40);
    const funde = dateien.flatMap((d) =>
      treffer(readFileSync(d, "utf8")).map((n) => `${d.slice(SRC.length)}: Wort ${n}`),
    );
    expect(funde).toEqual([]);
  });

  it("control: the search finds the R-12 word in any case where it stands, and nothing else", () => {
    expect(treffer(`vorher ${R12.toUpperCase()}.example nachher`)).toEqual([1]);
    expect(treffer(R12.slice(1))).toEqual([]);
  });
});
