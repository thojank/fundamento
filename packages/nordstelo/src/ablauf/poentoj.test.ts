// The score of a flow per screen (Spec 037, Lieferliste 2.2, AC-11): K1–K6 through the injected
// Taksilo, navigation through ekranoj (D-05), patterns (D-06) as separate columns, deterministic
// on stored facts (D-33) and equal to the committed expected scores. The weights of K1–K6 come
// from the Modelo catalogue file, never from a copy.

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { type Fakto, navigado, type Varianto } from "@fundamento/ekranoj";
import { defaultModeloSource, loadModelo, type NordsteloFile } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import type { Facts, Render } from "../facts.js";
import { planoDe, trovuTaskon } from "./katalogo.js";
import {
  faktojPorNavigado,
  legiKatalogon,
  legiKuron,
  poentiFluon,
  poentiKuron,
} from "./poentoj.js";
import { taksiloPorMezuro } from "./raporto.js";
import { konstantaTaksilo } from "./test-doubles/taksilo.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repository Modelo must load");
const tasko = trovuTaskon("liste-filter-detail");
if (tasko === undefined) throw new Error("the flow liste-filter-detail must exist");
const katalogo = legiKatalogon();
const taksilo = taksiloPorMezuro({ modelo, katalogo, tasko });

const fixtures = fileURLToPath(new URL("../../test/fixtures/ablauf/", import.meta.url));
const runs = readdirSync(fixtures, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .flatMap((entry) =>
    readdirSync(`${fixtures}${entry.name}`).map((varianto) => ({
      tasko: entry.name,
      varianto: varianto as Varianto,
      dir: `${fixtures}${entry.name}/${varianto}/`,
    })),
  );
const kuroDe = (varianto: Varianto) => legiKuron(`${fixtures}liste-filter-detail/${varianto}/`);
const faktojDe = (varianto: Varianto, n: string) => {
  const faktoj = kuroDe(varianto).rondoj[n];
  if (faktoj === undefined) throw new Error(`no round ${n}`);
  return faktoj;
};

describe("the score of a flow per screen", () => {
  it("stores both variants and the plan of the catalogue (D-33)", () => {
    expect([...new Set(runs.map((run) => run.varianto))].sort()).toEqual(["0", "F"]);
    for (const run of runs) {
      const own = trovuTaskon(run.tasko);
      if (own === undefined) throw new Error(`no flow ${run.tasko}`);
      expect(legiKuron(run.dir).plano, run.dir).toEqual(planoDe(own));
    }
    expect(Object.keys(kuroDe("F").rondoj)).toEqual(["1", "3"]);
  });

  it("measures the navigation through ekranoj: a missing edge and a dead link (D-05)", () => {
    const poento = poentiFluon({
      tasko,
      varianto: "F",
      faktoj: faktojDe("F", "1"),
      taksilo,
      modelo,
    });
    expect(poento.navigado.mankantajKantoj).toEqual([
      { de: "standard-detail", al: "standard-verlauf" },
    ]);
    expect(poento.navigado.mortajLigiloj).toEqual([{ de: "standard-detail", href: "archiv.html" }]);
    // 4 planned edges, 3 present, 1 dead: (3 − 1) / 4.
    expect(poento.navigado.kvoto).toBe(0.5);
    expect(poento.sumo.navigado).toBe(0.5);
    expect(poento.ekranoj["standard-detail"]?.navigado).toEqual({
      kompleta: false,
      mankantaj: ["standard-verlauf"],
      mortaj: ["archiv.html"],
    });
    expect(poento.ekranoj["standards-liste"]?.navigado.kompleta).toBe(true);
    const fixed = poentiFluon({
      tasko,
      varianto: "F",
      faktoj: faktojDe("F", "3"),
      taksilo,
      modelo,
    });
    expect(fixed.sumo.navigado).toBe(1);
  });

  it("counts a link written with the Modelo's link Ero (its target prop, no href)", () => {
    const faktoj = faktojDe("F", "3");
    const before = JSON.stringify(faktoj);
    // Since S037-04 ekranoj reads the target prop of the link Ero itself (Befund 1 of S037-07):
    // the loop of fm ekranoj and the measurement count the same edges.
    expect(navigado(planoDe(tasko), faktoj)).toEqual(
      navigado(planoDe(tasko), faktojPorNavigado(faktoj, modelo)),
    );
    expect(navigado(planoDe(tasko), faktojPorNavigado(faktoj, modelo)).kvoto).toBe(1);
    expect(JSON.stringify(faktoj)).toBe(before);
  });

  it("attaches the patterns of the flow to each screen (D-06)", () => {
    const poento = poentiFluon({
      tasko,
      varianto: "F",
      faktoj: faktojDe("F", "1"),
      taksilo,
      modelo,
    });
    expect(poento.sumo.sxablonoj).toBeLessThan(1);
    expect(poento.ekranoj["standard-detail"]?.sxablonoj.neunuecaj).toEqual(["cxefago"]);
    expect(poento.ekranoj["standard-detail"]?.varianto).toBe("F");
  });

  it("keeps navigation and patterns out of the total: separate columns", () => {
    const constant = konstantaTaksilo(80);
    const r1 = poentiFluon({
      tasko,
      varianto: "F",
      faktoj: faktojDe("F", "1"),
      taksilo: constant,
      modelo,
    });
    const r3 = poentiFluon({
      tasko,
      varianto: "F",
      faktoj: faktojDe("F", "3"),
      taksilo: constant,
      modelo,
    });
    expect(r1.sumo.navigado).not.toBe(r3.sumo.navigado);
    expect(r1.sumo.sxablonoj).not.toBe(r3.sumo.sxablonoj);
    expect(r1.sumo.total).toBe(80);
    expect(r3.sumo.total).toBe(80);
    const real = poentiFluon({ tasko, varianto: "F", faktoj: faktojDe("F", "1"), taksilo, modelo });
    const totals = Object.values(real.ekranoj).map((e) => e.taksado?.total ?? 0);
    expect(real.sumo.total).toBe(
      Math.round((totals.reduce((a, b) => a + b, 0) / totals.length) * 10) / 10,
    );
  });

  it("scores Variante 0 with native elements: K2 and K3 do not apply", () => {
    const poento = poentiFluon({
      tasko,
      varianto: "0",
      faktoj: faktojDe("0", "1"),
      taksilo,
      modelo,
    });
    for (const [slug, ekrano] of Object.entries(poento.ekranoj)) {
      expect(ekrano.taksado?.k.K2, slug).toBeNull();
      expect(ekrano.taksado?.k.K3, slug).toBeNull();
      expect(ekrano.varianto).toBe("0");
    }
    expect(poento.sumo.k.K2).toBeNull();
    expect(poento.navigado.kvoto).toBe(1);
  });

  it("counts a screen that was not built as 0 in the total and not complete", () => {
    const { "standard-verlauf": _dropped, ...faktoj } = faktojDe("F", "3");
    const poento = poentiFluon({ tasko, varianto: "F", faktoj, taksilo, modelo });
    expect(poento.ekranoj["standard-verlauf"]?.taksado).toBeNull();
    expect(poento.ekranoj["standard-verlauf"]?.navigado.kompleta).toBe(false);
    expect(poento.sumo.konstruitaj).toBe(2);
    expect(poento.sumo.planitaj).toBe(3);
    const built = Object.values(poento.ekranoj).map((e) => e.taksado?.total ?? 0);
    expect(poento.sumo.total).toBe(Math.round((built.reduce((a, b) => a + b, 0) / 3) * 10) / 10);
  });

  it.each(runs)(
    "$tasko $varianto: the same facts give the same scores, equal to the stored ones (AC-11)",
    (run) => {
      const own = trovuTaskon(run.tasko);
      if (own === undefined) throw new Error(`no flow ${run.tasko}`);
      const kuro = legiKuron(run.dir);
      const input = {
        tasko: own,
        varianto: run.varianto,
        kuro,
        taksilo: taksiloPorMezuro({ modelo, katalogo, tasko: own }),
        modelo,
      };
      const first = poentiKuron(input);
      expect(poentiKuron({ ...input, kuro: legiKuron(run.dir) })).toEqual(first);
      const expected = JSON.parse(readFileSync(`${run.dir}poentoj.json`, "utf8")) as unknown;
      expect(JSON.parse(JSON.stringify(first))).toEqual(expected);
    },
  );

  it("reads the weights from the Modelo catalogue file and copies none", () => {
    const file = JSON.parse(
      readFileSync(new URL("../../../modelo/data/nordstelo.json", import.meta.url), "utf8"),
    ) as NordsteloFile;
    expect(katalogo.pezoj).toEqual(file.pezoj);
    expect(katalogo.multmarkeco).toEqual(file.multmarkeco);
    // No source of the flow measure names a weight or carries a fractional weight of the file.
    const fractional = [...file.pezoj, ...(file.pezojAntauxaj?.pezoj ?? [])]
      .map((pezo) => pezo.pezo)
      .filter((value) => !Number.isInteger(value))
      .map(String);
    const sources = readdirSync(fileURLToPath(new URL("./", import.meta.url))).filter(
      (name) => name.endsWith(".ts") && !name.endsWith(".test.ts"),
    );
    const found = sources.flatMap((name) => {
      const text = readFileSync(new URL(`./${name}`, import.meta.url), "utf8");
      return [
        ...(/\bpezo/.test(text) ? [`${name}: pezo`] : []),
        ...fractional.filter((value) => text.includes(value)).map((value) => `${name}: ${value}`),
      ];
    });
    expect(fractional.length).toBeGreaterThan(0);
    expect(found).toEqual([]);
  });
});

// Spec 038 Lauf 2 (2.4, D-S038-13-1): the K8 of each screen is read from the Taksado at runtime;
// `sumo.k8` is the mean kvoto over the screens that carry one, and no key without any.
describe("the score of a flow: K8 beside the total (Spec 038, 2.4)", () => {
  const k8Renders = (
    JSON.parse(
      readFileSync(
        fileURLToPath(new URL("../../test/fixtures/k8/sxablono/faktoj.json", import.meta.url)),
        "utf8",
      ),
    ) as Facts
  ).renders;
  /** The facts of a screen with the K8 facts of the fixture on the renders of the same combination. */
  const kunK8 = (fakto: Fakto): Fakto => {
    const facts: Facts = fakto;
    return {
      ...facts,
      renders: facts.renders.map((render): Render => {
        const own = k8Renders.find(
          (other) =>
            other.aspekto === render.aspekto &&
            other.scheme === render.scheme &&
            other.contrast === render.contrast,
        );
        return own?.k8 === undefined ? render : { ...render, k8: own.k8 };
      }),
    };
  };

  it("has no sumo.k8 and no k8 on a screen for the stored facts", () => {
    const poento = poentiFluon({
      tasko,
      varianto: "F",
      faktoj: faktojDe("F", "1"),
      taksilo,
      modelo,
    });
    expect("k8" in poento.sumo).toBe(false);
    for (const ekrano of Object.values(poento.ekranoj)) {
      expect(ekrano.taksado === null || !("k8" in ekrano.taksado)).toBe(true);
    }
  });

  it("gives sumo.k8 as the mean kvoto over the screens with K8, beside an unchanged total", () => {
    const stored = faktojDe("F", "1");
    const slugs = Object.keys(stored).sort();
    const only = slugs[0] ?? "";
    // One screen with K8, the others without: the mean is over that one screen only.
    const partly = Object.fromEntries(
      Object.entries(stored).map(([slug, fakto]) => [slug, slug === only ? kunK8(fakto) : fakto]),
    );
    const all = Object.fromEntries(
      Object.entries(stored).map(([slug, fakto]) => [slug, kunK8(fakto)]),
    );
    const sen = poentiFluon({ tasko, varianto: "F", faktoj: stored, taksilo, modelo });
    const teil = poentiFluon({ tasko, varianto: "F", faktoj: partly, taksilo, modelo });
    const kun = poentiFluon({ tasko, varianto: "F", faktoj: all, taksilo, modelo });
    const kvotoj = Object.values(kun.ekranoj).flatMap((ekrano) => {
      const kvoto = ekrano.taksado?.k8?.kvoto;
      return kvoto === undefined ? [] : [kvoto];
    });
    expect(kvotoj.length).toBe(slugs.length);
    const mean = kvotoj.reduce((a, b) => a + b, 0) / kvotoj.length;
    expect(kun.sumo.k8).toBeCloseTo(mean, 4);
    const unua = teil.ekranoj[only]?.taksado?.k8;
    expect(unua).toBeDefined();
    expect(teil.sumo.k8).toBe(unua?.kvoto);
    for (const own of [teil, kun]) {
      expect(own.sumo.total).toBe(sen.sumo.total);
      expect(own.sumo.k).toEqual(sen.sumo.k);
    }
  });
});
