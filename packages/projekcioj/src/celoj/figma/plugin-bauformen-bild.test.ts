// Spec 027, Abnahme 3: the sets in their default size look as before — a picture per variant in
// the double (test-doubles/bild.ts), compared with the picture the plugin of `main` 2e05a4f (after
// #108) drew, kept in test-doubles/bild-main.json. Before the comparison the switches the spec
// changes on purpose are put back where `main` had them: help and error shown (B-3), the icon of
// the butono shown (B-6). The changes B-7 (menuo) and B-9 (lokredaktilo, display) are wanted and
// stand in WANTED; what B-1 changes as a consequence stands in STRETCHED, with the reason.
// `FM_BILD_BASIS=1` writes the file from the current plugin — only ever on `main`'s plugin.
// Spec 029 ①: komuna took the values of the Fonto, so every picture of komuna changed on purpose;
// the comparison draws with the values of komuna 0.2 (the structure rebuilt from komuna-0-2) and
// keeps measuring what it measured: the Bauformen, not the values.
// Spec 029 ②b-1: the picture names the variables a shadow binds without their ids (they follow the
// order the file was filled in; every new variable shifted them). The basis was written again from
// the plugin of 943d965 (main after #111 and #110, the plugin unchanged since): the changes of Spec
// 027 that WANTED and STRETCHED named are part of it, so both lists are empty until a spec changes
// a picture on purpose again – as ②b-1 M-1 does for the faldilo.

import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { komuna02PluginCode, modelDouble, once, pageNodes, run } from "./plugin-test-helpers.js";
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
  // Spec 029 ②b-1 M-1 (A-faldilo-3): the faldilo can be disabled – its summary's colour goes by
  // state (the variable ero/faldilo/summary/color/rest where main bound …/summary/color, the same
  // value), and the state disabled adds a variant per open.
  faldilo: {
    befund: "M-1: the summary's colour by state, the state disabled added (open × state = 8).",
  },
  // Spec 029 ②b-1b M-2: the states warning and success are new variants of every field; the
  // variants main had paint as before (match names no variant of main), only their places move.
  ...Object.fromEntries(
    [
      "alsxutilo",
      "datelektilo",
      "elektilo",
      "elekto",
      "glitilo",
      "kompletigilo",
      "listelektilo",
      "plurelektilo",
      "tekstareo",
    ].map((set) => [
      set,
      {
        befund: "M-2: the states warning and success added, the set laid out anew.",
        match: "state=warning",
      },
    ]),
  ),
  // Spec 029 ②b-1, Abnahme #122: one rule for the end of a field with a box (Skemo trailing) –
  // spinner, clear button, then the chevron or the calendar, all in the control, inside its
  // border; the ✕ as large as the chevron or the calendar; the field at least FIELD_WIDTH wide.
  // Spec 029 ②b-1b M-2 (A-kampo-4): every variant of the kampo keeps the room of its status
  // icon in the control, so the variants of a row stay one size.
  kampo: {
    befund:
      "Abnahme #122: spinner and clear button in the control, the field 256 wide; M-2: the room of the status icon in the control (A-kampo-4).",
  },
  // Spec 036 1.6: the label of a checkbox and a switch in the middle of its box or switch – its
  // line as high as the ring, the label centred in it (every variant: the label lies lower, the
  // variant as high as the ring); with M-2 above, the states warning and success added.
  ...Object.fromEntries(
    ["markobutono", "sxaltilo"].map((set) => [
      set,
      {
        befund:
          "M-2: the states warning and success added. Spec 036 1.6: the label in the middle of its box or switch.",
      },
    ]),
  ),
  tekstareo: { befund: "Abnahme #122: the spinner in the control, the field 256 wide." },
  elektilo: {
    befund: "Abnahme #122: spinner, clear button, chevron in the control; the field 256 wide.",
  },
  listelektilo: {
    befund: "Abnahme #122: spinner, clear button, chevron in the control; the field 256 wide.",
  },
  plurelektilo: {
    befund: "Abnahme #122: spinner and chevron in the control; the field 256 wide.",
  },
  kompletigilo: {
    befund: "Abnahme #122: spinner and clear button in the control; the field 256 wide.",
  },
  // Spec 035 2.3.1: the calendar in the trigger as large as the chevron of the elektilo (its glyph
  // bound to trigger.size, the trigger at least trigger.width), its vector painted as the ✕ –
  // every variant of the date picker shows it now (32 of 32 in the full picture).
  // Spec 036 D-64: the month buttons of the open calendar show their chevrons – glyphs at the
  // icon size of a small butono, vectors painted as the ✕ (the 16 variants with expanded=true).
  datelektilo: {
    befund:
      "Abnahme #122: spinner, clear button, calendar in the control (the row gone); 256 wide. Spec 035 2.3.1: the calendar as large as the chevron, painted as the ✕. Spec 036 D-64: the month buttons' chevrons sized and painted.",
  },
};

/**
 * What B-1 and B-5 change as a consequence: set → the variants whose name holds `match`, with
 * the reason. The variant keeps the width it hugged; a part that fills now spans it where a
 * sibling was wider than the part.
 */
const STRETCHED: Readonly<Record<string, { reason: string; match: string; count: number }>> = {};

/** One run of the plan in the double, read by every case (Vitest collects nothing here). */
async function draw() {
  const double = modelDouble();
  await run(double, komuna02PluginCode());
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
