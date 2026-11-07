// Spec 038 Lauf 3 S038-16 (V-2, E-2, contract C-1): the Sxablono derivation of check_markup is
// exported with the index of each instance's element, so K8 of nordstelo reads the one rule
// instead of a replica (D-128 superseded). The export gives exactly the instances
// `checkMarkup(...).output.sxablonoj` gives, in the same order, and each index names the
// `fm-<name>` element of its instance. Cases: the Sxablono page of the AC-8 fixtures (copied here,
// because a modelo test reads no file of another package, Spec 040 T-5), a default region filled
// by own text and by a child without slot, a region filled by its marker slot, a child with a
// foreign slot that counts nowhere, and an unknown `fm-` name. Names come from the Modelo.

import { describe, expect, it } from "vitest";
import type { Modelo, SxablonoInstance } from "../contracts/modelo.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { checkMarkup, legiMarkon, markerOf, sxablonojElElementoj } from "./index.js";

const loaded = loadModelo(defaultModeloSource()).modelo;
if (loaded === undefined) throw new Error("the repository Modelo could not be loaded");
const modelo: Modelo = loaded;
const sxablonoj = modelo.sxablonoj ?? [];

/** The export on the read fragment, and what check_markup reports for the same fragment. */
function ambaux(fragment: string): {
  tags: string[];
  indicoj: number[];
  instancoj: SxablonoInstance[];
  checkMarkupSxablonoj: SxablonoInstance[];
} {
  const { elementoj } = legiMarkon(fragment);
  const eligo = sxablonojElElementoj(elementoj, modelo);
  const rezulto = checkMarkup(modelo, { fragment });
  if (!rezulto.ok) throw new Error(`checkMarkup refused: ${JSON.stringify(rezulto.issues)}`);
  return {
    tags: eligo.map(({ elemento }) => elementoj[elemento]?.tag ?? ""),
    indicoj: eligo.map(({ elemento }) => elemento),
    instancoj: eligo.map(({ instanco }) => instanco),
    checkMarkupSxablonoj: rezulto.output.sxablonoj,
  };
}

describe("sxablonojElElementoj – the exported Sxablono derivation with element indices (C-1)", () => {
  it("gives the instances of check_markup for the Sxablono page of the AC-8 fixtures", () => {
    const fragment = [
      "<fm-sxelo>",
      '  <span slot="brand">Beispielseite</span>',
      '  <fm-navigado slot="nav" label="Hauptnavigation"><fm-ligilo to="liste.html">Liste</fm-ligilo></fm-navigado>',
      "  <fm-pagxo>",
      '    <fm-titolo level="1" slot="title">Übersicht</fm-titolo>',
      '    <div slot="actions"><fm-butono emphasis="high">Neu</fm-butono><fm-butono emphasis="high">Export</fm-butono></div>',
      '    <section slot="sections"><fm-teksto>Inhalt der Seite</fm-teksto></section>',
      "  </fm-pagxo>",
      "</fm-sxelo>",
    ].join("\n");
    const { tags, indicoj, instancoj, checkMarkupSxablonoj } = ambaux(fragment);
    expect(instancoj).toEqual(checkMarkupSxablonoj);
    expect(indicoj).toEqual([0, 4]);
    expect(tags).toEqual(["fm-sxelo", "fm-pagxo"]);
    expect(instancoj.map((instanco) => Object.keys(instanco.regions ?? {}))).toEqual([
      ["brand", "nav", "main"],
      ["title", "actions", "sections"],
    ]);
  });

  it("fills a default region by own text and by a child without slot", () => {
    const kunDefaulta = sxablonoj.flatMap((entry) => {
      const region = entry.skemo.regions.find(
        (candidate) => markerOf(modelo, entry, candidate).default === true,
      );
      return region === undefined ? [] : [{ name: entry.sxablono.name, region: region.name }];
    });
    const malobservoj: string[] = [];
    for (const { name, region } of kunDefaulta) {
      for (const [fragment, indekso] of [
        [`<fm-${name}>Text</fm-${name}>`, 0],
        [`<div><fm-${name}><p>Absatz</p></fm-${name}></div>`, 1],
      ] as const) {
        const { indicoj, instancoj, checkMarkupSxablonoj } = ambaux(fragment);
        if (JSON.stringify(instancoj) !== JSON.stringify(checkMarkupSxablonoj))
          malobservoj.push(`${fragment}: differs from check_markup`);
        if (JSON.stringify(indicoj) !== JSON.stringify([indekso]))
          malobservoj.push(`${fragment}: indices ${JSON.stringify(indicoj)}`);
        if (JSON.stringify(Object.keys(instancoj[0]?.regions ?? {})) !== JSON.stringify([region]))
          malobservoj.push(`${fragment}: regions ${JSON.stringify(instancoj[0]?.regions)}`);
      }
    }
    expect(kunDefaulta.length).toBeGreaterThan(0);
    expect(malobservoj).toEqual([]);
  });

  it("fills a region by its marker slot, for every region with a slot", () => {
    const malobservoj: string[] = [];
    let kazoj = 0;
    for (const entry of sxablonoj) {
      for (const region of entry.skemo.regions) {
        const { slot } = markerOf(modelo, entry, region);
        if (slot === undefined) continue;
        kazoj += 1;
        const name = entry.sxablono.name;
        const fragment = `<main><p>vor</p><fm-${name}><span slot="${slot}">Inhalt</span></fm-${name}></main>`;
        const { tags, indicoj, instancoj, checkMarkupSxablonoj } = ambaux(fragment);
        if (JSON.stringify(instancoj) !== JSON.stringify(checkMarkupSxablonoj))
          malobservoj.push(`${name}/${region.name}: differs from check_markup`);
        if (JSON.stringify(indicoj) !== JSON.stringify([2]) || tags[0] !== `fm-${name}`)
          malobservoj.push(`${name}/${region.name}: indices ${JSON.stringify(indicoj)}`);
        if (JSON.stringify(instancoj[0]?.regions) !== JSON.stringify({ [region.name]: ["text"] }))
          malobservoj.push(
            `${name}/${region.name}: regions ${JSON.stringify(instancoj[0]?.regions)}`,
          );
      }
    }
    expect(kazoj).toBeGreaterThan(0);
    expect(malobservoj).toEqual([]);
  });

  it("counts a child with a foreign slot nowhere, and derives nothing from an unknown fm- name", () => {
    const name = sxablonoj[0]?.sxablono.name ?? "";
    const fremda = ambaux(`<fm-${name}><span slot="nenia-regiono">Text</span></fm-${name}>`);
    expect(fremda.instancoj).toEqual(fremda.checkMarkupSxablonoj);
    expect(fremda.indicoj).toEqual([0]);
    expect(fremda.instancoj[0]?.regions).toEqual({});

    const nekonata = ambaux(
      `<fm-${name}-nekonata><span slot="x">Text</span></fm-${name}-nekonata><fm-${name}>Text</fm-${name}>`,
    );
    expect(nekonata.instancoj).toEqual(nekonata.checkMarkupSxablonoj);
    expect(nekonata.indicoj).toEqual([2]);
    expect(nekonata.tags).toEqual([`fm-${name}`]);
  });

  it("gives an empty list for markup without a Sxablono", () => {
    const { elementoj } = legiMarkon("<main><fm-butono>Speichern</fm-butono></main>");
    expect(sxablonojElElementoj(elementoj, modelo)).toEqual([]);
  });
});
