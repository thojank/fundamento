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

/** The layers B-3 and B-6 hide by default, shown again as `main` drew them. */
const SHOWN_IN_MAIN = new Set(["help", "error", "icon-start"]);

/** Wanted changes of the spec: set → variants (all when empty), with the Befund. */
const WANTED: Readonly<Record<string, { befund: string; variants?: readonly string[] }>> = {};

/** What B-1 changes as a consequence: set → variants, with the reason. */
const STRETCHED: Readonly<Record<string, { reason: string; variants: readonly string[] }>> = {};

const drawn = once(async () => {
  const double = modelDouble();
  await run(double, repoFiles["figma/plugin/code.js"] ?? "");
  const show = (node: DoubleNode) => {
    for (const child of node.children) {
      if (SHOWN_IN_MAIN.has(child.name)) child.properties.visible = true;
      show(child);
    }
  };
  const bild: Bild = {};
  const sets = pageNodes(double).filter((node) => node.type === "COMPONENT_SET");
  for (const set of sets) {
    for (const variant of set.children) show(variant);
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
  return { double, bild };
});

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
          (wanted.variants === undefined || wanted.variants.includes(variant))
        )
          return true;
        return STRETCHED[name]?.variants.includes(variant) === true;
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

  it("names a wanted change only where the picture changed", async () => {
    const { bild } = await drawn();
    if (process.env.FM_BILD_BASIS === "1") return;
    const basis = JSON.parse(readFileSync(BASIS, "utf8")) as Bild;
    const unchanged: string[] = [];
    for (const [name, entry] of Object.entries(STRETCHED)) {
      for (const variant of entry.variants) {
        if (bild[name]?.variants[variant] === basis[name]?.variants[variant])
          unchanged.push(`${name}: ${variant}`);
      }
    }
    expect(unchanged).toEqual([]);
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
