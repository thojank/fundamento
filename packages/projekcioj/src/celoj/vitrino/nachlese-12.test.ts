// Nachlese 12 ④ (Befund aus Spec 029 ①b): the Vitrino stored the KontrastParoj of a combination
// once per density, viewport and motion – 18 equal copies for each Aspekto, colour scheme and
// contrast. They are stored once, and every combination refers to its table; the table on screen
// stays the same (vitrino.check.ts) and the data read back are the measured ones.

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defaultModeloSource } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildProjekcioj } from "../../build.js";
import {
  kunpremiMezurojn,
  malkunpremiMezurojn,
  type VitrinoDatumoj,
  type VitrinoMezuro,
} from "./datumoj.js";
import { VITRINO_FILE } from "./vitrino.js";

let out = "";
let island: Record<string, unknown> = {};

beforeAll(async () => {
  out = mkdtempSync(join(tmpdir(), "fm-vitrino-n12-"));
  const built = await buildProjekcioj({ outDir: out, source: defaultModeloSource() });
  expect(built.ok).toBe(true);
  const html = readFileSync(join(out, VITRINO_FILE), "utf8");
  const text = /<script type="application\/json" id="fm-vitrino">(.*?)<\/script>/s.exec(html)?.[1];
  island = JSON.parse((text ?? "{}").replaceAll("<\\/", "</"));
}, 180_000);

afterAll(() => rmSync(out, { recursive: true, force: true }));

const row = (paro: string, wcag2: number): VitrinoMezuro =>
  ({ paro, kategorio: "text-normal", wcag2, apca: 90, pasis: true }) as VitrinoMezuro;

describe("Nachlese 12 ④: the KontrastParoj once", () => {
  it("kunpremi stores each distinct table once; malkunpremi gives every combination its table back", () => {
    const mezuroj: VitrinoDatumoj["mezuroj"] = {
      "komuna|compact|compact|light|default|default": [row("a", 10)],
      "komuna|compact|default|light|default|default": [row("a", 10)],
      "komuna|compact|compact|dark|default|default": [row("a", 12)],
    };
    const packed = kunpremiMezurojn(mezuroj);
    expect(packed.unikaj).toHaveLength(2);
    expect(Object.keys(packed.al)).toHaveLength(3);
    expect(malkunpremiMezurojn(packed)).toEqual(mezuroj);
  });

  it("the island of the repo's Vitrino holds one table per Aspekto, colour scheme and contrast", () => {
    const packed = island.mezuroj as ReturnType<typeof kunpremiMezurojn>;
    expect(Array.isArray(packed.unikaj)).toBe(true);
    const keys = Object.keys(packed.al);
    expect(keys).toHaveLength(72);
    const groups = new Set(
      keys.map((key) => {
        const [aspekto, , , scheme, contrast] = key.split("|");
        return `${aspekto}|${scheme}|${contrast}`;
      }),
    );
    expect(packed.unikaj).toHaveLength(groups.size);
    // Every combination of one group refers to the same table.
    const back = malkunpremiMezurojn(packed);
    for (const key of keys) expect(back[key]).toBe(packed.unikaj[packed.al[key] ?? -1]);
  });

  it("the island is at least four times smaller in its KontrastParoj than the 72 copies", () => {
    const packed = island.mezuroj as ReturnType<typeof kunpremiMezurojn>;
    const stored = JSON.stringify(packed).length;
    const copies = JSON.stringify(malkunpremiMezurojn(packed)).length;
    expect(stored * 4).toBeLessThan(copies);
  });
});
