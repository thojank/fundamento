// The scorer adapter of ekranoj (Spec 037, C-8, D-03, D-31): nordstelo's unchanged score in the
// weighting of the Modelo catalogue (with the gate multmarkeco), K6 from the criteria handed in,
// K7 never weighted. The recipe is the one of the „ganzer Ablauf“ measurement (PR B), so the same
// facts give the same Taksado through `fm ekranoj` and through the measurement.

import type { Fakto, PlanoEkrano, Taksado } from "@fundamento/ekranoj";
import {
  defaultModeloSource,
  type Kriterio,
  loadModelo,
  type NordsteloFile,
  readNordstelo,
  type Tasko,
} from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { ekranoTaksilo } from "./ekrano-taksilo.js";
import type { Facts } from "./facts.js";
import { score, scoreBoth } from "./score.js";
import { facts, h } from "./test-doubles/facts.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repository Modelo must load");
const katalogo = readNordstelo(defaultModeloSource().dataDir) as NordsteloFile;
const login = katalogo.taskoj.find((tasko) => tasko.name === "anmeldung") as Tasko;

const EKRANO: PlanoEkrano = {
  slug: "anmelden",
  titolo: "Anmelden",
  celo: "Team Nord meldet sich mit E-Mail und Passwort an",
};

const BODY = [
  h(
    "fm-formularo",
    {},
    h("fm-kampo", { kind: "email", required: "" }, "E-Mail"),
    h("fm-kampo", { kind: "password", required: "" }, "Passwort"),
    h("fm-butono", { emphasis: "high", type: "submit" }, "Anmelden"),
  ),
];
const ARIA = [
  { role: "textbox", name: "E-Mail erforderlich" },
  { role: "textbox", name: "Passwort erforderlich" },
  { role: "button", name: "Anmelden" },
];

/** A screen with a gap of every kind the score sees: a raw value, an invented prop, a console line. */
const MANKA = [
  h(
    "fm-formularo",
    {},
    h("fm-kampo", { kind: "email", farbe: "rot" }, "E-Mail"),
    h("button", { style: "color: #3b5f2a" }, "Anmelden"),
  ),
];

// C-2 at compile time: a nordstelo Facts is an ekranoj Fakto, and an ekranoj Fakto is a Facts.
const nordsteloFacts: Facts = facts(BODY, ARIA);
const fakto: Fakto = nordsteloFacts;
const kunMankoj: Fakto = facts(MANKA, [{ role: "button", name: "Anmelden" }], {
  console: ["TypeError: x is undefined"],
});
const alFacts = (valoro: Fakto): Facts => valoro;

const kriterioj: Record<string, Kriterio[]> = { [EKRANO.slug]: login.kriterioj };

describe("ekranoTaksilo (C-8)", () => {
  it("gives the same Taksado for the same facts, twice and from two adapters (determinism)", () => {
    const taksilo = ekranoTaksilo({ modelo, katalogo, kriterioj });
    const unua = taksilo.taksi({ fakto: kunMankoj, ekrano: EKRANO, varianto: "F" });
    const dua = taksilo.taksi({ fakto: kunMankoj, ekrano: EKRANO, varianto: "F" });
    const alia = ekranoTaksilo({ modelo, katalogo, kriterioj }).taksi({
      fakto: structuredClone(kunMankoj),
      ekrano: { ...EKRANO },
      varianto: "F",
    });
    expect(dua).toEqual(unua);
    expect(alia).toEqual(unua);
    expect(unua.mankoj.length).toBeGreaterThan(0);
  });

  it("scores a clean screen of Fundamento's Eroj with 100, K6 from the criteria handed in", () => {
    const taksado = ekranoTaksilo({ modelo, katalogo, kriterioj }).taksi({
      fakto,
      ekrano: EKRANO,
      varianto: "F",
    });
    expect(taksado).toEqual({
      k: { K1: 1, K2: 1, K3: 1, K4: 1, K5: 1, K6: 1 },
      total: 100,
      mankoj: [],
    });
  });

  it("leaves K6 null without criteria (fm ekranoj) and weights only what applies", () => {
    const sen = ekranoTaksilo({ modelo, katalogo }).taksi({
      fakto: kunMankoj,
      ekrano: EKRANO,
      varianto: "F",
    });
    expect(sen.k.K6).toBeNull();
    const kun = ekranoTaksilo({ modelo, katalogo, kriterioj }).taksi({
      fakto: kunMankoj,
      ekrano: EKRANO,
      varianto: "F",
    });
    expect(typeof kun.k.K6).toBe("number");
    // Criteria of another screen are not this screen's.
    const alia = ekranoTaksilo({ modelo, katalogo, kriterioj: { detail: login.kriterioj } }).taksi({
      fakto: kunMankoj,
      ekrano: EKRANO,
      varianto: "F",
    });
    expect(alia.k.K6).toBeNull();
  });

  it("is the recipe of the measurement: scoreBoth(…).nova with the Modelo catalogue, and score() with its weights and gate", () => {
    const tasko: Tasko = { ...login, id: EKRANO.slug, name: EKRANO.slug };
    for (const varianto of ["F", "0"] as const) {
      const taksado = ekranoTaksilo({ modelo, katalogo, kriterioj }).taksi({
        fakto: kunMankoj,
        ekrano: EKRANO,
        varianto,
      });
      const nova = scoreBoth(
        { facts: alFacts(kunMankoj), tasko, variant: varianto, modelo },
        katalogo,
      ).nova;
      const rekte = score({
        facts: alFacts(kunMankoj),
        tasko,
        variant: varianto,
        modelo,
        pezoj: katalogo.pezoj,
        ...(katalogo.multmarkeco === undefined ? {} : { pordego: katalogo.multmarkeco.kriterioj }),
      });
      const atendita: Taksado = { k: nova.k, total: nova.total, mankoj: nova.gaps };
      expect(taksado).toEqual(atendita);
      expect(taksado).toEqual({ k: rekte.k, total: rekte.total, mankoj: rekte.gaps });
    }
  });

  it("names a criterion gap like the ablauf catalogue does when the flow is given", () => {
    const malplena: Fakto = facts([h("main", {}, h("p", {}, "Team Nord"))], []);
    const sen = ekranoTaksilo({ modelo, katalogo, kriterioj }).taksi({
      fakto: malplena,
      ekrano: EKRANO,
      varianto: "F",
    });
    const kun = ekranoTaksilo({ modelo, katalogo, kriterioj, tasko: "anmelden-und-konto" }).taksi({
      fakto: malplena,
      ekrano: EKRANO,
      varianto: "F",
    });
    const kriterioMankoj = (t: Taksado) => t.mankoj.filter((m) => m.kind === "criterion");
    expect(kriterioMankoj(sen).length).toBeGreaterThan(0);
    expect(kriterioMankoj(sen).every((m) => m.key.startsWith("anmelden: "))).toBe(true);
    expect(
      kriterioMankoj(kun).every((m) => m.key.startsWith("anmelden-und-konto/anmelden: ")),
    ).toBe(true);
  });

  it("accepts a nordstelo Facts value and the gate of the catalogue counts (multmarkeco)", () => {
    const taksilo = ekranoTaksilo({ modelo, katalogo, kriterioj });
    const taksado = taksilo.taksi({ fakto: nordsteloFacts, ekrano: EKRANO, varianto: "F" });
    expect(taksado.total).toBe(100);
    // A page that pins its brand follows no other Aspekto: with the gate of the catalogue K5 counts
    // only the renders it follows; without the gate (weights alone) it would keep K5 = 1.
    expect(katalogo.multmarkeco?.kriterioj).toContain("K5");
    const fiksita: Facts = facts([h("div", { "data-fm-aspekto": "komuna" }, ...BODY)], ARIA);
    const kunPordego = taksilo.taksi({ fakto: fiksita, ekrano: EKRANO, varianto: "F" });
    const senPordego = ekranoTaksilo({
      modelo,
      katalogo: { pezoj: katalogo.pezoj },
      kriterioj,
    }).taksi({ fakto: fiksita, ekrano: EKRANO, varianto: "F" });
    expect(senPordego.k.K5).toBe(1);
    expect(kunPordego.k.K5).toBeLessThan(1);
  });

  it("never weights K7: the Taksado carries K1–K6 only", () => {
    const taksado = ekranoTaksilo({ modelo, katalogo }).taksi({
      fakto,
      ekrano: EKRANO,
      varianto: "F",
    });
    expect(Object.keys(taksado.k)).toEqual(["K1", "K2", "K3", "K4", "K5", "K6"]);
    expect(katalogo.pezoj.map((pezo) => pezo.kriterio)).not.toContain("K7");
  });
});
