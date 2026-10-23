// Spec 027, Abnahme 3: the sets in their default size look as before — a picture per variant in
// the double (test-doubles/bild.ts), compared with the picture the plugin of `main` 2e05a4f (after
// #108) drew, kept in test-doubles/bild-main.json. Before the comparison the switches the spec
// changes on purpose are put back where `main` had them: help and error shown (B-3), the icon of
// the butono shown (B-6). The changes B-7 (menuo) and B-9 (lokredaktilo, display) are wanted and
// stand in WANTED; what B-1 changes as a consequence stands in STRETCHED, with the reason.
// `FM_BILD_BASIS=1` writes the file from the current plugin — only ever on `main`'s plugin.

import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { modelDouble, once, pageNodes, repoFiles, run } from "./plugin-test-helpers.js";
import { bildHash, bildOf } from "./test-doubles/bild.js";
import type { DoubleNode } from "./test-doubles/plugin.js";

const BASIS = new URL("./test-doubles/bild-main.json", import.meta.url);

type Bild = Record<string, { set: string; variants: Record<string, string> }>;

/** The layers B-3 and B-6 hide by default, shown again where `main` drew them. */
const SHOWN_IN_MAIN = (set: string, layer: string) =>
  layer === "help" || layer === "error" || (set === "butono" && layer === "icon-start");

/**
 * Wanted changes of the spec: set → the variants whose name holds `match` (all without), with the
 * Befund. B-2: a text that had no fill painted nothing in Figma; with its fill it is seen.
 */
const WANTED: Readonly<Record<string, { befund: string; match?: string }>> = {
  datelektilo: { befund: "B-2: der Wert im Feld (vorher ohne Füllung); aufgeklappt auch B-1" },
  glitilo: { befund: "B-2: die Zahl im Zahlenfeld (vorher ohne Füllung)", match: "field=true" },
  konsileto: { befund: "B-2: das Wort des Auslösers (vorher ohne Füllung)" },
  sxvebilo: { befund: "B-2: das Wort des Auslösers (vorher ohne Füllung)" },
  menuo: { befund: "B-7: der Auslöser in Zielgröße; B-2: sein Wort (vorher ohne Füllung)" },
  lokredaktilo: { befund: "B-9: das Bearbeiten-Icon im Anzeigezustand", match: "editing=false" },
};

/**
 * What B-1 and B-5 change as a consequence: set → the variants whose name holds `match`, with
 * the reason. The variant keeps the width it hugged; a part that fills now spans it where a
 * sibling was wider than the part.
 */
const STRETCHED: Readonly<Record<string, { reason: string; match: string; count: number }>> = {
  kampo: {
    reason:
      "B-1: die Beschriftung ist breiter als die Eingabe; die Eingabe füllt das Feld (+1,2 px)",
    match: "size=small",
    count: 6,
  },
  alsxutilo: {
    reason: "B-1: der Hinweis ist breiter als die Ablagefläche; sie füllt das Feld",
    match: "dropzone=false",
    count: 6,
  },
  kompletigilo: {
    reason: "B-1: die Liste ist 640 breit (size.container.small); die Eingabe füllt das Feld",
    match: "expanded=true",
    count: 15,
  },
  listelektilo: {
    reason: "B-1: die Liste ist 640 breit (size.container.small); die Eingabe füllt das Feld",
    match: "expanded=true",
    count: 6,
  },
  plurelektilo: {
    reason: "B-1: die Liste ist 640 breit (size.container.small); die Eingabe füllt das Feld",
    match: "expanded=true",
    count: 6,
  },
  plenstato: {
    reason:
      "B-5: der Text füllt die zentrierte Spalte und ist zentriert gesetzt — dieselben Glyphen an derselben Stelle; das Bild des Doubles notiert die Breite des zentrierten Textes",
    match: "state=rest",
    count: 2,
  },
};

/** One run of the plan in the double, read by every case (Vitest collects nothing here). */
async function draw() {
  const double = modelDouble();
  await run(double, repoFiles["figma/plugin/code.js"] ?? "");
  const show = (set: string, node: DoubleNode) => {
    for (const child of node.children) {
      // Through the node, so the double lays the file out again.
      if (SHOWN_IN_MAIN(set, child.name)) Object.assign(child, { visible: true });
      show(set, child);
    }
  };
  const bild: Bild = {};
  // The sets of the Eroj; the Sxablonoj are components of their own since B-8.
  const sets = pageNodes(double).filter(
    (node) => node.type === "COMPONENT_SET" && node.getSharedPluginData("fundamento", "ero") !== "",
  );
  for (const set of sets) {
    for (const variant of set.children) show(set.name, variant);
    const placed = set.children
      .map((variant) => {
        const at = variant as unknown as { x: number; y: number };
        return `${variant.name}@${Math.round(at.x * 100) / 100},${Math.round(at.y * 100) / 100}`;
      })
      .join("\n");
    const size = set as unknown as { width: number; height: number };
    bild[set.name] = {
      set: `${Math.round(size.width * 100) / 100}x${Math.round(size.height * 100) / 100}\n${placed}`,
      variants: Object.fromEntries(
        set.children.map((variant) => [variant.name, bildHash(variant)]),
      ),
    };
  }
  if (process.env.FM_BILD_DUMP !== undefined) {
    const all = Object.fromEntries(
      sets.map((set) => [
        set.name,
        Object.fromEntries(set.children.map((variant) => [variant.name, bildOf(variant)])),
      ]),
    );
    writeFileSync(process.env.FM_BILD_DUMP, JSON.stringify(all));
  }
  return { double, bild };
}
const drawn = once(draw);

describe("the sets in their default size look as on main (Spec 027, Abnahme 3)", () => {
  it("every variant paints what main's plugin painted, but for the wanted changes", async () => {
    const { bild } = await drawn();
    if (process.env.FM_BILD_BASIS === "1") {
      writeFileSync(BASIS, `${JSON.stringify(bild, null, 2)}\n`);
      return;
    }
    const basis = JSON.parse(readFileSync(BASIS, "utf8")) as Bild;
    expect(Object.keys(bild).sort()).toEqual(Object.keys(basis).sort());
    const differing: string[] = [];
    for (const [name, before] of Object.entries(basis)) {
      const now = bild[name];
      const allowed = (variant: string) => {
        const wanted = WANTED[name];
        if (
          wanted !== undefined &&
          (wanted.match === undefined || variant.includes(wanted.match))
        ) {
          return true;
        }
        const stretched = STRETCHED[name];
        return stretched !== undefined && variant.includes(stretched.match);
      };
      for (const [variant, hash] of Object.entries(before.variants)) {
        if (now?.variants[variant] !== hash && !allowed(variant))
          differing.push(`${name}: ${variant}`);
      }
      const whole = WANTED[name] !== undefined || STRETCHED[name] !== undefined;
      if (now?.set !== before.set && !whole) differing.push(`${name}: Lage der Varianten`);
    }
    expect(differing).toEqual([]);
  });

  it("names a consequence only where the picture changed, and every variant it names", async () => {
    const { bild } = await drawn();
    if (process.env.FM_BILD_BASIS === "1") return;
    const basis = JSON.parse(readFileSync(BASIS, "utf8")) as Bild;
    for (const [name, entry] of Object.entries(STRETCHED)) {
      const changed = Object.keys(basis[name]?.variants ?? {}).filter(
        (variant) => bild[name]?.variants[variant] !== basis[name]?.variants[variant],
      );
      expect(changed.length, `${name}: ${entry.reason}`).toBe(entry.count);
      for (const variant of changed) expect(variant, name).toContain(entry.match);
    }
  });
});

/** For a diagnosis: the entries of one variant (`FM_BILD_ZEIGEN=set/variant`). */
it.runIf(process.env.FM_BILD_ZEIGEN !== undefined)("shows a variant's picture", async () => {
  const { double } = await drawn();
  const [set, variant] = String(process.env.FM_BILD_ZEIGEN).split("/");
  const node = pageNodes(double)
    .find((candidate) => candidate.type === "COMPONENT_SET" && candidate.name === set)
    ?.children.find((child) => child.name === variant);
  writeFileSync(
    join(tmpdir(), "fm-bild.txt"),
    node === undefined ? "nicht gefunden" : bildOf(node).join("\n"),
  );
});
