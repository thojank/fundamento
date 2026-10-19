// Stage 2 of the Werkstatt (Spec 019 ①, G2–G4): form, space, type and icon weight as functions on
// the structure of the Vortaro. Pure and fast — no Modelo is composed here: the calibration (every
// slider on its standard changes nothing), each slider on its grid, and the corners of all sliders
// against the known minimums (G4: size.target, the order of the type roles, the type scale, the
// visible border, the focus ring). The checks of the whole Modelo at the corners run in
// stufe2.test.ts.

import { typeScaleConsistency } from "@fundamento/modelo";
import { beforeAll, describe, expect, it } from "vitest";
import {
  type Agordo,
  deriveGestalt,
  type GestaltBasis,
  gestaltBasis,
  gestaltSliders,
  gestaltTokens,
  IKONO_GEWICHTE,
  readStructure,
} from "./index.js";

const LEAD = "#375479";

let basis: GestaltBasis;
beforeAll(() => {
  basis = gestaltBasis(readStructure().files);
});

const px = (value: unknown): number => {
  if (typeof value === "number") return value;
  const amount = (value as { value?: unknown } | undefined)?.value;
  if (typeof amount !== "number") throw new Error(`no dimension: ${JSON.stringify(value)}`);
  return amount;
};

/** Every slider at its standard, written out (G3: the standard is the structure). */
function standardAgordo(): Agordo {
  const standard = Object.fromEntries(gestaltSliders(basis).map((s) => [s.path, s.standard]));
  return {
    name: "standard",
    leitfarbe: LEAD,
    form: {
      radius: standard["form.radius"] as number,
      rahmen: standard["form.rahmen"] as number,
      schatten: standard["form.schatten"] as number,
    },
    raum: {
      abstand: standard["raum.abstand"] as number,
      hoehe: standard["raum.hoehe"] as number,
    },
    schrift: {
      groesse: standard["schrift.groesse"] as number,
      skala: standard["schrift.skala"] as number,
      gewicht: standard["schrift.gewicht"] as number,
    },
    ikono: { gewicht: "regular" },
  };
}

describe("the sliders of stage 2 (G2)", () => {
  it("are the ten of the spec with their ranges; the standard of schrift.skala is the structure's median ratio", () => {
    const sliders = gestaltSliders(basis);
    expect(sliders.map((s) => [s.path, s.min, s.max])).toEqual([
      ["form.radius", 0, 2],
      ["form.rahmen", 0.5, 2],
      ["form.schatten", 0, 2],
      ["raum.abstand", 0.75, 1.5],
      ["raum.hoehe", 0.85, 1.25],
      ["schrift.groesse", -1, 1],
      ["schrift.skala", 1.125, 1.5],
      ["schrift.gewicht", -1, 1],
    ]);
    const standard = Object.fromEntries(sliders.map((s) => [s.path, s.standard]));
    expect(standard).toEqual({
      "form.radius": 1,
      "form.rahmen": 1,
      "form.schatten": 1,
      "raum.abstand": 1,
      "raum.hoehe": 1,
      "schrift.groesse": 0,
      "schrift.skala": 1.167,
      "schrift.gewicht": 0,
    });
    // ikono.gewicht: the Phosphor weights; regular is the reference's own.
    expect([...IKONO_GEWICHTE]).toEqual(["thin", "light", "regular", "bold", "fill", "duotone"]);
  });
});

describe("calibration (G3): every slider on its standard changes nothing", () => {
  it("an Agordo of stage 1 (no field of stage 2) changes no token and gives no hint", () => {
    const gestalt = deriveGestalt({ name: "stufe-eins", leitfarbe: LEAD }, basis);
    expect([...gestalt.main]).toEqual([]);
    expect([...gestalt.dark]).toEqual([]);
    expect(gestalt.hints).toEqual([]);
  });

  it("every slider written out on its standard changes no token either", () => {
    const gestalt = deriveGestalt(standardAgordo(), basis);
    expect([...gestalt.main]).toEqual([]);
    expect([...gestalt.dark]).toEqual([]);
    expect(gestalt.hints).toEqual([]);
  });

  it("is deterministic: the same Agordo gives the same values", () => {
    const agordo: Agordo = {
      name: "zweimal",
      leitfarbe: LEAD,
      form: { radius: 1.6, schatten: 0.4 },
      raum: { abstand: 1.15 },
      schrift: { groesse: 0.3, skala: 1.25, gewicht: 0.5 },
    };
    expect(deriveGestalt(agordo, basis)).toEqual(deriveGestalt(agordo, basis));
  });
});

describe("each slider moves the token group of G2, on the grid of the system", () => {
  const tokens = (agordo: Partial<Agordo>, overlays: string[] = []) =>
    gestaltTokens(
      basis,
      deriveGestalt({ name: "regler", leitfarbe: LEAD, ...agordo }, basis),
      overlays,
    );

  it("form.radius multiplies radius.small … xlarge in whole px; none and full stay", () => {
    const at = tokens({ form: { radius: 1.6 } });
    expect(px(at.get("radius.small"))).toBe(3);
    expect(px(at.get("radius.medium"))).toBe(6);
    expect(px(at.get("radius.large"))).toBe(13);
    expect(px(at.get("radius.xlarge"))).toBe(26);
    expect(px(at.get("radius.none"))).toBe(0);
    expect(px(at.get("radius.full"))).toBe(9999);
    expect(px(tokens({ form: { radius: 0 } }).get("radius.role.control"))).toBe(0);
  });

  it("form.rahmen multiplies border.width.*, never below 1 px; the focus ring keeps the reference's width", () => {
    const thick = tokens({ form: { rahmen: 2 } });
    expect(px(thick.get("border.width.default"))).toBe(2);
    expect(px(thick.get("border.width.strong"))).toBe(4);
    const thin = tokens({ form: { rahmen: 0.5 } });
    expect(px(thin.get("border.width.default"))).toBe(1);
    expect(px(thin.get("border.width.focus"))).toBeGreaterThanOrEqual(2);
  });

  it("form.schatten scales offset and blur of elevation.shadow.* and moves the opacity of color.shadow.*", () => {
    const strong = tokens({ form: { schatten: 2 } });
    const raised = strong.get("elevation.shadow.raised") as Record<string, unknown>;
    expect(px(raised.offsetY)).toBe(4);
    expect(px(raised.blur)).toBe(12);
    expect(strong.get("color.shadow.key")).toEqual(tokens({}).get("color.palette.shade.50"));
    const none = tokens({ form: { schatten: 0 } });
    expect(px((none.get("elevation.shadow.raised") as Record<string, unknown>).blur)).toBe(0);
    expect(none.get("color.shadow.key")).toEqual(tokens({}).get("color.palette.shade.0"));
  });

  it("raum.abstand multiplies spacing.scale.* (4 px grid, 2 px where the structure is finer); density stays a mode on top", () => {
    const airy = tokens({ raum: { abstand: 1.5 } });
    expect(px(airy.get("spacing.scale.400"))).toBe(24);
    expect(px(airy.get("spacing.scale.50"))).toBe(4);
    expect(px(airy.get("spacing.scale.150"))).toBe(10);
    expect(px(airy.get("spacing.medium"))).toBe(12);
    // density=compact re-points spacing.medium to spacing.scale.150 — over the moved scale.
    expect(px(tokens({ raum: { abstand: 1.5 } }, ["density/compact"]).get("spacing.medium"))).toBe(
      10,
    );
  });

  it("raum.hoehe moves size.control.* in every density on a 4 px grid, never below size.target.min", () => {
    const tall = tokens({ raum: { hoehe: 1.25 } });
    expect(px(tall.get("size.control.medium"))).toBe(52);
    expect(px(tall.get("size.target.min"))).toBe(24);
    expect(px(tall.get("size.icon.large"))).toBe(24);
    const low = tokens({ raum: { hoehe: 0.85 } }, ["density/compact"]);
    expect(px(low.get("size.control.small"))).toBe(24);
  });

  it("schrift.groesse shifts every font.size.* by up to two steps; schrift.skala spreads the steps around the body text", () => {
    expect(px(tokens({ schrift: { groesse: 1 } }).get("font.size.body.1"))).toBe(22);
    expect(px(tokens({ schrift: { groesse: -1 } }).get("font.size.body.1"))).toBe(12);
    const wide = tokens({ schrift: { skala: 1.5 } });
    expect(px(wide.get("font.size.body.1"))).toBe(16);
    expect(px(wide.get("font.size.scale.400"))).toBe(23);
    expect(px(wide.get("font.size.scale.200"))).toBe(11);
  });

  it("schrift.gewicht moves font.weight.* by whole cuts, inside the lightest and the heaviest weight", () => {
    const bold = tokens({ schrift: { gewicht: 1 } });
    expect(bold.get("font.weight.regular")).toBe(600);
    expect(bold.get("font.weight.black")).toBe(900);
    const light = tokens({ schrift: { gewicht: -0.5 } });
    expect(light.get("font.weight.regular")).toBe(300);
    expect(light.get("font.weight.thin")).toBe(100);
  });
});

describe("the corners of every slider (G4: the known minimums are never undercut)", () => {
  const DENSITIES = [[], ["density/compact"], ["density/comfortable"]];
  const VIEWPORTS = [[], ["viewport/compact"], ["viewport/expanded"]];
  const CONTRASTS = [[], ["contrast/high"]];
  const ROLES = [
    "font.size.display.1",
    "font.size.display.2",
    "font.size.display.3",
    "font.size.headline.1",
    "font.size.headline.2",
    "font.size.headline.3",
    "font.size.headline.4",
    "font.size.body.1",
    "font.size.body.2",
    "font.size.caption",
  ];
  const WEIGHTS = [
    "thin",
    "extralight",
    "light",
    "regular",
    "medium",
    "semibold",
    "bold",
    "extrabold",
    "black",
  ].map((cut) => `font.weight.${cut}`);

  function* corners(): Generator<Agordo> {
    const sliders = gestaltSliders(basis);
    const values = sliders.map((s) => [s.min, s.standard, s.max]);
    const index = values.map(() => 0);
    while (true) {
      const at = Object.fromEntries(sliders.map((s, i) => [s.path, values[i]?.[index[i] ?? 0]]));
      yield {
        name: "ecke",
        leitfarbe: LEAD,
        form: {
          radius: at["form.radius"],
          rahmen: at["form.rahmen"],
          schatten: at["form.schatten"],
        },
        raum: { abstand: at["raum.abstand"], hoehe: at["raum.hoehe"] },
        schrift: {
          groesse: at["schrift.groesse"],
          skala: at["schrift.skala"],
          gewicht: at["schrift.gewicht"],
        },
      } as Agordo;
      let digit = 0;
      while (digit < index.length && index[digit] === 2) index[digit++] = 0;
      if (digit === index.length) return;
      index[digit] = (index[digit] ?? 0) + 1;
    }
  }

  it("holds size.target, the order of the type roles, the type scale, the visible border and the focus ring in all 3^8 combinations", () => {
    // Only the tokens the corners are measured on: the test stays light beside the other suites.
    const core = [
      ...gestaltTokens(basis, deriveGestalt({ name: "s", leitfarbe: LEAD }, basis), []),
    ];
    const scaleNames = core
      .map(([name]) => name)
      .filter((name) => /^font\.size\.scale\.\d+$/.test(name));
    const gridNames = core
      .map(([name]) => name)
      .filter((name) => /^(radius\.|spacing\.scale\.)/.test(name));
    const NAMES = {
      density: [
        "size.target.min",
        "size.control.small",
        "size.control.medium",
        "size.control.large",
      ],
      viewport: [...ROLES, ...scaleNames],
      contrast: ["border.width.default", "border.width.strong", "border.width.focus"],
      core: [...WEIGHTS, ...gridNames],
    };
    const tokens = (
      gestalt: ReturnType<typeof deriveGestalt>,
      overlays: string[],
      names: string[],
    ) => gestaltTokens(basis, gestalt, overlays, names);
    const structure = (overlays: string[]) =>
      tokens(deriveGestalt({ name: "struktur", leitfarbe: LEAD }, basis), overlays, NAMES.viewport);
    const failures: string[] = [];
    let count = 0;
    for (const agordo of corners()) {
      count += 1;
      const label = JSON.stringify({ ...agordo, name: undefined, leitfarbe: undefined });
      const gestalt = deriveGestalt(agordo, basis);
      for (const density of DENSITIES) {
        const at = tokens(gestalt, density, NAMES.density);
        const target = px(at.get("size.target.min"));
        if (target !== 24) failures.push(`${label} ${density}: size.target.min ${target}`);
        for (const control of ["small", "medium", "large"]) {
          const height = px(at.get(`size.control.${control}`));
          if (height < target || height % 4 !== 0) {
            failures.push(`${label} ${density}: size.control.${control} ${height}`);
          }
        }
      }
      for (const viewport of VIEWPORTS) {
        const at = tokens(gestalt, viewport, NAMES.viewport);
        const before = structure(viewport);
        for (const [i, a] of ROLES.entries()) {
          for (const b of ROLES.slice(i + 1)) {
            const was = Math.sign(px(before.get(a)) - px(before.get(b)));
            const is = Math.sign(px(at.get(a)) - px(at.get(b)));
            if (was !== is) failures.push(`${label} ${viewport}: ${a} against ${b} ${was} → ${is}`);
          }
        }
        const scale = [...at]
          .filter(([name]) => /^font\.size\.scale\.\d+$/.test(name))
          .map(([, value]) => px(value))
          .sort((x, y) => x - y);
        if (scale.some((size) => !Number.isInteger(size))) failures.push(`${label}: px not whole`);
        if (new Set(scale).size !== scale.length) failures.push(`${label}: two steps of one size`);
        const { worst } = typeScaleConsistency(scale);
        if (worst > 0.1 + 1e-9) failures.push(`${label}: type-scale ${worst.toFixed(3)}`);
      }
      for (const contrast of CONTRASTS) {
        const at = tokens(gestalt, contrast, NAMES.contrast);
        for (const width of ["default", "strong", "focus"]) {
          if (px(at.get(`border.width.${width}`)) < 1) failures.push(`${label}: ${width} < 1 px`);
        }
        if (px(at.get("border.width.focus")) < 2) failures.push(`${label}: focus ring below 2 px`);
      }
      const at = tokens(gestalt, [], NAMES.core);
      const weights = WEIGHTS.map((name) => at.get(name) as number);
      if (weights.some((w, i) => w < 100 || w > 900 || (i > 0 && w < (weights[i - 1] ?? 0)))) {
        failures.push(`${label}: weights ${weights.join(" ")}`);
      }
      for (const [name, value] of at) {
        if (/^radius\./.test(name) && !Number.isInteger(px(value)))
          failures.push(`${label}: ${name}`);
        if (/^spacing\.scale\./.test(name) && px(value) % 2 !== 0)
          failures.push(`${label}: ${name}`);
      }
    }
    expect(count).toBe(3 ** 8);
    expect(failures.slice(0, 20)).toEqual([]);
  });
});

describe("the whole range of the type sliders keeps the type scale (G4, type-scale)", () => {
  it("every schrift.groesse (step 0.02) × schrift.skala (step 0.005) rounds to a regular whole-px scale", () => {
    const failures: string[] = [];
    let count = 0;
    for (let g = -50; g <= 50; g += 1) {
      for (let k = 0; k <= 75; k += 1) {
        const groesse = g / 50;
        const skala = Math.round((1.125 + k * 0.005) * 1000) / 1000;
        count += 1;
        const at = gestaltTokens(
          basis,
          deriveGestalt({ name: "raster", leitfarbe: LEAD, schrift: { groesse, skala } }, basis),
          [],
          basis.fontScale.map((step) => step.name),
        );
        const scale = [...at.values()].map(px).sort((x, y) => x - y);
        const { worst } = typeScaleConsistency(scale);
        if (worst > 0.1 + 1e-9 || new Set(scale).size !== scale.length) {
          failures.push(
            `groesse ${groesse} skala ${skala}: ${scale.join(" ")} (${worst.toFixed(3)})`,
          );
        }
      }
    }
    expect(count).toBe(101 * 76);
    expect(failures.slice(0, 10)).toEqual([]);
  });
});

describe("hints instead of new Reguloj (G4, E2)", () => {
  const hints = (agordo: Partial<Agordo>) =>
    deriveGestalt({ name: "hinweis", leitfarbe: LEAD, ...agordo }, basis).hints.map((hint) => [
      hint.rule,
      hint.subject,
    ]);

  it("body text below 14 px is a hint, not a violation", () => {
    expect(hints({ schrift: { groesse: -1 } })).toContainEqual([
      "agordilo-body-size",
      "font.size.body.2",
    ]);
  });

  it("a default border as thick as the strong one is a hint (contrast=high loses its stronger border)", () => {
    expect(hints({ form: { rahmen: 0.5 } })).toContainEqual([
      "agordilo-border-collapse",
      "border.width.strong",
    ]);
  });

  it("no shadow at all is a hint (surfaces are told apart by lightness alone)", () => {
    expect(hints({ form: { schatten: 0 } })).toContainEqual([
      "agordilo-shadow-none",
      "elevation.shadow.*",
    ]);
  });
});
