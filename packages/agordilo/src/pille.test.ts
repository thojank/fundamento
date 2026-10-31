// Spec 035, Befund 4.3 (V-3): „Komplett abrunden“ stopped at radius 2 – no pill shape – and from 2
// to 1.6 („eckiger“) one hardly saw a change. The form gets a choice „Pille“ for controls, the stop
// past the end of the radius slider: radius.role.control points at radius.full (the alias the
// Schnellstart already sets for „ganz rund“), cards and surfaces keep their bounded radius. A
// relative wish moves by one stop of the form (data/wuensche.json), each a visible change.

import { beforeAll, describe, expect, it } from "vitest";
import {
  type Agordo,
  BEDIENFORM_PATH,
  bedienformOf,
  deriveAspekto,
  deriveGestalt,
  type GestaltBasis,
  gestaltBasis,
  loadCalibration,
  proponoOf,
  readStructure,
  readWuensche,
  reglerDiff,
  reglerOf,
  type Wuensche,
  withRegler,
} from "./index.js";

let basis: GestaltBasis;
let wuensche: Wuensche;
beforeAll(() => {
  basis = gestaltBasis(readStructure().files);
  wuensche = readWuensche();
});

const BASE: Agordo = { name: "provo", leitfarbe: "#6b4fa0" };
const PILLE: Agordo = { ...BASE, form: { radius: 2 } };

/** The `$value` at a dotted token name of a set document. */
function valueAt(set: unknown, name: string): unknown {
  let node: unknown = set;
  for (const key of name.split(".")) node = (node as Record<string, unknown> | undefined)?.[key];
  return (node as { $value?: unknown } | undefined)?.$value;
}

describe("the choice „Pille“ for controls (V-3)", () => {
  it("is the stop past the end of the radius slider, named on the slider", () => {
    const radius = reglerOf(basis).find((regler) => regler.path === "form.radius");
    expect(radius?.max).toBe(2);
    expect(radius?.ende).toEqual({ path: BEDIENFORM_PATH, wert: "pille", label: "Pille" });
  });

  it("sets radius.role.control to radius.full and takes it back; the diff names it", () => {
    const pill = withRegler(PILLE, BEDIENFORM_PATH, "pille");
    expect(bedienformOf(pill)).toBe("pille");
    expect(pill.festgelegt?.["radius.role.control"]).toEqual({ alias: "radius.full" });
    expect(reglerDiff(PILLE, pill, basis)).toEqual([
      { path: BEDIENFORM_PATH, label: "Bedienelemente", vorher: "radius", nachher: "pille" },
    ]);
    const back = withRegler(pill, BEDIENFORM_PATH, "radius");
    expect(bedienformOf(back)).toBe("radius");
    expect(back).toEqual(PILLE);
  });

  it("controls become pills, cards and surfaces stay bounded", () => {
    const pill = withRegler(PILLE, BEDIENFORM_PATH, "pille");
    const set = JSON.parse(
      deriveAspekto(pill, readStructure(), loadCalibration()).files["sets/aspekto/provo.json"] ??
        "{}",
    );
    expect(valueAt(set, "radius.role.control")).toBe("{radius.full}");
    expect(valueAt(set, "radius.role.surface")).toBe("{radius.large}");
    const large = deriveGestalt(pill, basis).main.get("radius.large") as { value: number };
    expect(large.value).toBeLessThan(100);
  });
});

describe("a relative wish moves by one visible stop of the form (V-3)", () => {
  const radiusOf = (agordo: Agordo) =>
    (deriveGestalt(agordo, basis).main.get("radius.medium") as { value: number } | undefined)
      ?.value ?? (basis.core.get("radius.medium") as { value: number }).value;

  it("names the stops of the form as data: eckig 0, leicht 0.5, rund 1, ganz rund 2, then Pille", () => {
    expect(wuensche.stufen?.["form.radius"]?.werte).toEqual([0, 0.5, 1, 2]);
    // Spec 036 Befund 1.2: one stop back from the pill is 2 (zurueck).
    expect(wuensche.stufen?.["form.radius"]?.danach).toEqual({
      regler: BEDIENFORM_PATH,
      wert: "pille",
      zurueck: 2,
    });
  });

  it("eckiger from 2 goes to 1, not 1.6: the radius of controls halves", () => {
    const propono = proponoOf(
      { ...BASE, form: { radius: 2 } },
      { wunsch: "eckiger" },
      wuensche,
      basis,
    );
    expect(propono.agordo.form?.radius).toBe(1);
    expect(radiusOf(propono.agordo)).toBeLessThanOrEqual(
      radiusOf({ ...BASE, form: { radius: 2 } }) / 2,
    );
  });

  it("runder from 1.6 goes to 2, from 2 to the pill, and at the pill nothing moves and the end is said", () => {
    const at2 = proponoOf(
      { ...BASE, form: { radius: 1.6 } },
      { wunsch: "runder" },
      wuensche,
      basis,
    );
    expect(at2.agordo.form?.radius).toBe(2);
    const pill = proponoOf(at2.agordo, { wunsch: "runder" }, wuensche, basis);
    expect(bedienformOf(pill.agordo)).toBe("pille");
    expect(pill.diff).toEqual([
      { path: BEDIENFORM_PATH, label: "Bedienelemente", vorher: "radius", nachher: "pille" },
    ]);
    const end = proponoOf(pill.agordo, { wunsch: "runder" }, wuensche, basis);
    expect(end.diff).toEqual([]);
    expect(end.amEnde).toEqual([{ path: "form.radius", grenze: 2 }]);
  });

  it("eckiger from the pill takes the pill back first: a visible step", () => {
    const pill = withRegler(PILLE, BEDIENFORM_PATH, "pille");
    const back = proponoOf(pill, { wunsch: "eckiger" }, wuensche, basis);
    expect(bedienformOf(back.agordo)).toBe("radius");
    expect(back.agordo.form?.radius).toBe(2);
  });

  it("every stop of the form changes the radius of controls by at least half of it", () => {
    const werte = wuensche.stufen?.["form.radius"]?.werte ?? [];
    for (const [index, wert] of werte.entries()) {
      if (index === 0) continue;
      const lower = radiusOf({ ...BASE, form: { radius: werte[index - 1] ?? 0 } });
      const upper = radiusOf({ ...BASE, form: { radius: wert } });
      expect(upper - lower, `${werte[index - 1]} → ${wert}`).toBeGreaterThanOrEqual(upper / 2);
    }
  });
});

// Spec 036 Befund 1.2: „eckiger“ from the pill went back to the value of the slider – from a pill
// chosen at 0.5 a step of the wish ended at 0.5. The stops are 0 · 0.5 · 1 · 2 · Pille; one stop
// back from the pill is 2, whatever the slider held (data/wuensche.json, D-83 as Spec 036 changes it).
describe("eckiger from the pill goes one stop back, to 2 (Spec 036 Befund 1.2)", () => {
  it("from a pill at any value of the slider, eckiger ends at 2 with the controls on the radius", () => {
    for (const radius of [0, 0.5, 1, 1.6, 2]) {
      const pill = withRegler({ ...BASE, form: { radius } }, BEDIENFORM_PATH, "pille");
      const back = proponoOf(pill, { wunsch: "eckiger" }, wuensche, basis);
      expect(bedienformOf(back.agordo), `Pille bei ${radius}`).toBe("radius");
      expect(back.agordo.form?.radius, `Pille bei ${radius}`).toBe(2);
    }
  });

  it("from a pill without a slider value too: the controls on the radius, the slider on 2", () => {
    const pill = withRegler(BASE, BEDIENFORM_PATH, "pille");
    const back = proponoOf(pill, { wunsch: "eckiger" }, wuensche, basis);
    expect(bedienformOf(back.agordo)).toBe("radius");
    expect(back.agordo.form?.radius).toBe(2);
  });
});
