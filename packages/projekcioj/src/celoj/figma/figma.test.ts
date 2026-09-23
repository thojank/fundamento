// Figma plan and simulator (Spec 003 T015; FR-09, plan D-12, contracts/projekcioj §5). The plan is
// a pure description of collections, variables and the component set; resolving it by Figma's mode
// rules must give rezolvoj.json for every combination, so the projection is provable without Figma.

import { projectModeloSource } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import {
  ALPHA_VARIES,
  compositeFields,
  FIGMA_CELO,
  type FigmaPlan,
  type FigmaValue,
  figmaPlanInventory,
  figmaValues,
  resolveFigmaPlan,
  styleOfWeight,
} from "./figma.js";
import { FIGMA_MODE_LIMIT } from "./plugin.js";

const config = new URL(
  "../../../../modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
  import.meta.url,
).pathname;
const prepared = celoInputOf(projectModeloSource(config));
if (!prepared.ok) throw new Error("core + ekzemplo must be valid");
const files = FIGMA_CELO.generate(prepared.input);
const plan = JSON.parse(
  files.find((file) => file.path === "figma/plan.json")?.text ?? "{}",
) as FigmaPlan;

describe("Figma plan (T015)", () => {
  it("has one collection per Dimensio plus the single-mode collection fundamento", () => {
    const names = plan.collections.map((collection) => collection.name);
    expect(names).toEqual([
      "fundamento",
      "aspekto",
      "viewport",
      "density",
      "color-scheme",
      "contrast",
      "motion",
    ]);
    expect(plan.collections[0]?.modes).toEqual(["value"]);
    expect(plan.collections.find((c) => c.name === "aspekto")?.modes).toEqual([
      "komuna",
      "ekzemplo",
    ]);
  });

  // Figma Professional allows 10 modes per collection, Organization 20 (research §6.2, checked
  // 2026-09-20; the four of the first research were a forum answer and are overtaken). With the
  // brand as a mode (F27), this number is how many Aspektoj one library carries.
  it("keeps every collection within the modes a Professional file allows", () => {
    for (const collection of plan.collections) {
      expect(collection.modes.length, collection.name).toBeLessThanOrEqual(FIGMA_MODE_LIMIT);
    }
  });

  it("hides the helper variables of the cascade from publishing", () => {
    const helpers = plan.collections.flatMap((collection) =>
      collection.variables.filter((variable) => variable.name.includes("@")),
    );
    expect(helpers.length).toBeGreaterThan(50);
    for (const helper of helpers) expect(helper.hidden, helper.name).toBe(true);
    const published = plan.collections.flatMap((collection) =>
      collection.variables.filter((variable) => !variable.name.includes("@")),
    );
    for (const variable of published) expect(variable.hidden ?? false, variable.name).toBe(false);
  });

  it("resolves to rezolvoj.json in every combination (AK-03 for Figma)", () => {
    let compared = 0;
    // A composite has the same fields in every combination, even where one combination has fewer
    // shadow layers than another (F9): the field list is decided over all of them.
    const values = new Map<string, unknown[]>();
    for (const rezolvo of prepared.input.rezolvoj.rezolvoj) {
      for (const [name, token] of Object.entries(rezolvo.tokens)) {
        values.set(name, [...(values.get(name) ?? []), token.value]);
      }
    }
    for (const rezolvo of prepared.input.rezolvoj.rezolvoj) {
      const resolved = resolveFigmaPlan(plan, rezolvo.assignment);
      for (const [name, token] of Object.entries(rezolvo.tokens)) {
        const fields = compositeFields(token.type, values.get(name) ?? []);
        for (const [variable, expected] of Object.entries(
          figmaValues(name, token.type, token.value, fields),
        )) {
          expect(
            resolved[variable],
            `${variable} in ${JSON.stringify(rezolvo.assignment)}`,
          ).toEqual(expected);
          compared++;
        }
      }
    }
    expect(compared).toBeGreaterThan(144 * 300);
  });

  it("fails when one alias is swapped", () => {
    const broken = JSON.parse(JSON.stringify(plan)) as FigmaPlan;
    const collection = broken.collections.find((candidate) => candidate.name === "color-scheme");
    const variable = collection?.variables.find(
      (candidate) => candidate.name.startsWith("color/") && candidate.hidden !== true,
    );
    if (variable === undefined || collection === undefined) throw new Error("no cascaded variable");
    const [first, second] = collection.modes;
    const swapped = variable.values[first ?? ""];
    variable.values[first ?? ""] = variable.values[second ?? ""] as never;
    variable.values[second ?? ""] = swapped as never;
    const rezolvo = prepared.input.rezolvoj.rezolvoj[0];
    if (rezolvo === undefined) throw new Error("no rezolvo");
    const resolved = resolveFigmaPlan(broken, rezolvo.assignment);
    const before = resolveFigmaPlan(plan, rezolvo.assignment);
    expect(resolved[variable.name]).not.toEqual(before[variable.name]);
  });

  it("describes the component set from the Skemo and marks every node as Fundamento", () => {
    const set = plan.components.find((component) => component.set === "butono");
    const skemo = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "butono")?.skemo;
    expect(set?.pluginData).toEqual({
      fundamento: { ero: "butono", skemo: skemo?.id, version: plan.fundamento },
    });
    for (const prop of skemo?.props ?? []) {
      if (prop.kind === "enum") expect(set?.properties[prop.name]).toEqual(prop.values);
      if (prop.kind === "boolean") expect(set?.properties[prop.name]).toBe("BOOLEAN");
      if (prop.kind === "string") expect(set?.properties[prop.name]).toBe("TEXT");
    }
    expect(set?.properties.state).toEqual(skemo?.states);
    // Four variant × tone combinations (the danger constraint removes two) × 3 sizes × 6 states.
    expect(set?.variants.length).toBe(4 * 3 * 6);
    for (const variant of set?.variants ?? []) {
      expect(Object.keys(variant.bindings).length).toBeGreaterThan(3);
      for (const binding of Object.values(variant.bindings)) {
        expect(binding).toMatch(/^[a-z0-9]+(\/[a-z0-9-]+)+$/);
      }
    }
  });

  it("generates the same bytes twice", () => {
    expect(FIGMA_CELO.generate(prepared.input)).toEqual(files);
  });
});

// F8 (Abnahme M1): the Figma side states what the *plugin applies*, not what the variable holds —
// otherwise a projection that drops the alpha stays invisible. This fixture composes two brands,
// and komuna's translucent tertiary fill is opaque in ekzemplo: the decision is therefore not the
// same in every mode, and the plan must say so instead of picking one brand's value.
describe("resolved paint values of the Figma side (F8)", () => {
  const values = figmaPlanInventory(plan).butono?.values ?? {};

  it("names the paint of every bound colour part, per variant", () => {
    expect(values["surface.fill@size=medium,state=rest,tone=default,variant=primary"]).toMatch(
      /^#[0-9a-f]{6}$/,
    );
  });

  it("refuses to pick one brand when the alpha differs by mode", () => {
    expect(values["surface.fill@size=medium,state=hover,tone=default,variant=tertiary"]).toBe(
      `${ALPHA_VARIES} (color/action/tertiary/hover)`,
    );
    const variant = plan.components[0]?.variants.find(
      (entry) => entry.props.variant === "tertiary" && entry.props.state === "hover",
    );
    expect(variant?.paints?.["surface.fill"]).toEqual({ hex: "#000000", alphaVariesByMode: true });
  });
});

// F9 (Abnahme M1): a shadow arrived in the plan as the string "[object Object]". Figma holds no
// composite variable, so a composite is decomposed field by field — as typography and border
// already are — and a shadow of several layers numbers them. What cannot be decomposed must not be
// stringified behind our back: the guard refuses every implicit conversion of an object.
describe("composite tokens reach Figma field by field (F9)", () => {
  const variables = plan.collections.flatMap((collection) => collection.variables);
  const named = (name: string) => variables.find((variable) => variable.name === name);

  it("gives a shadow of one layer its five fields, with the colour as an alias", () => {
    expect(named("elevation/shadow/raised")).toBeUndefined();
    expect(named("elevation/shadow/raised/color")).toMatchObject({
      type: "COLOR",
      values: { komuna: { alias: "color/shadow/key" } },
    });
    expect(named("elevation/shadow/raised/offset-y")).toMatchObject({
      type: "FLOAT",
      values: { komuna: 2 },
    });
    expect(named("elevation/shadow/raised/blur")).toMatchObject({ values: { komuna: 6 } });
    expect(named("elevation/shadow/raised/spread")).toMatchObject({ values: { komuna: 0 } });
    expect(named("elevation/shadow/raised/offset-x")).toMatchObject({ values: { komuna: 0 } });
  });

  // A layer an Aspekto does not have renders nothing: transparent colour, zero measures. That is
  // the honest translation in a file whose variables are the same in every mode (F9).
  it("says with a transparent layer that an Aspekto has fewer layers", () => {
    expect(named("elevation/shadow/floating/2/color")?.values.ekzemplo).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 0,
    });
    expect(named("elevation/shadow/floating/2/blur")?.values.ekzemplo).toBe(0);
    // komuna has both layers for real; ekzemplo's brand casts no shadow at all, so its first layer
    // is a transparent zero of its own making — the second is the filler.
    expect(named("elevation/shadow/floating/1/blur")?.values.komuna).toBe(24);
    expect(named("elevation/shadow/floating/2/blur")?.values.komuna).toBe(4);
  });

  it("fills a layer the value does not have with nothing at all", () => {
    const layer = {
      color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.5 },
      offsetX: { value: 0, unit: "px" },
      offsetY: { value: 1, unit: "px" },
      blur: { value: 2, unit: "px" },
      spread: { value: 0, unit: "px" },
    };
    const out = figmaValues(
      "elevation.shadow.probo",
      "shadow",
      layer,
      compositeFields("shadow", [[layer, layer]]),
    );
    expect(out["elevation/shadow/probo/1/blur"]).toBe(2);
    expect(out["elevation/shadow/probo/2/blur"]).toBe(0);
    expect(out["elevation/shadow/probo/2/color"]).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });

  it("numbers the layers of a shadow that has several", () => {
    expect(named("elevation/shadow/floating/1/blur")).toMatchObject({ type: "FLOAT" });
    expect(named("elevation/shadow/floating/2/color")).toMatchObject({ type: "COLOR" });
    expect(named("elevation/shadow/floating")).toBeUndefined();
  });

  it("leaves no variable holding an object as a string", () => {
    const stringified = variables.filter((variable) =>
      Object.values(variable.values).some(
        (value) => typeof value === "string" && value.includes("[object"),
      ),
    );
    expect(stringified.map((variable) => variable.name)).toEqual([]);
  });

  it("refuses to write an object as a string instead of stringifying it (guard)", () => {
    expect(() =>
      figmaValues("gradient.brand", "gradient", [{ color: "#fff", position: 0 }]),
    ).toThrow(/gradient/);
  });
});

// F27 (An P0, M2-Vorstufe): switching the brand in a Figma file is switching a mode, exactly as
// color-scheme and contrast already are. What is measured here is the plan a Modelo with two
// Aspektoj produces — one mode per Aspekto, and no variable of the collection without a value in
// either of them. A collection with two modes whose variables hold the same value in both would
// switch nothing, so the count of the ones that really differ is part of the assurance.
describe("the brand is a mode of the collection aspekto (F27)", () => {
  const collection = plan.collections.find((candidate) => candidate.name === "aspekto");
  const aspektoj = (
    prepared.input.modelo.dimensioj.find((dimensio) => dimensio.name === "aspekto")?.valoroj ?? []
  ).map((valoro) => valoro.name);

  it("carries one mode per Aspekto of the Modelo, the reference first", () => {
    expect([...aspektoj].sort()).toEqual(["ekzemplo", "komuna"]);
    expect(collection?.modes).toHaveLength(aspektoj.length);
    expect([...(collection?.modes ?? [])].sort()).toEqual([...aspektoj].sort());
    expect(collection?.modes[0]).toBe("komuna");
    expect(collection?.defaultMode).toBe("komuna");
  });

  it("gives every brand-dependent variable a value in every mode", () => {
    const missing = (collection?.variables ?? []).flatMap((variable) =>
      (collection?.modes ?? [])
        .filter((mode) => variable.values[mode] === undefined)
        .map((mode) => `${variable.name}@${mode}`),
    );
    expect(missing).toEqual([]);
    expect(collection?.variables.length).toBeGreaterThan(300);
  });

  it("holds two brands, not one brand twice", () => {
    const differing = (collection?.variables ?? []).filter((variable) => {
      const values = (collection?.modes ?? []).map((mode) => JSON.stringify(variable.values[mode]));
      return new Set(values).size > 1;
    });
    expect(differing.length).toBeGreaterThan(50);
  });
});

// F27: the cascade must survive the second brand. A role that several Dimensioj change lives in
// the collection of its highest one and aliases down; the proof that aspekto is just another step
// of that ladder is the resolution of named roles in every combination of the three Dimensioj a
// designer switches by hand — brand, scheme and contrast.
describe("aspekto × color-scheme × contrast resolve together (F27)", () => {
  const ROLES = [
    "color.action.primary.rest",
    "color.action.primary.text",
    "color.text.default",
    "color.border.default",
    "color.background.canvas",
    "color.focus.ring",
  ] as const;
  // The Dimensioj the maintainer does not touch in this measurement stay at the Modelo's default.
  const REST = { density: "default", motion: "default", viewport: "medium" } as const;
  const combinations = ["komuna", "ekzemplo"].flatMap((aspekto) =>
    ["light", "dark"].flatMap((scheme) =>
      ["default", "high"].map((contrast) => ({
        aspekto,
        "color-scheme": scheme,
        contrast,
        ...REST,
      })),
    ),
  );

  const rezolvoOf = (assignment: Record<string, string>) => {
    const found = prepared.input.rezolvoj.rezolvoj.find((rezolvo) =>
      Object.entries(assignment).every(
        ([dimensio, valoro]) => rezolvo.assignment[dimensio] === valoro,
      ),
    );
    if (found === undefined) throw new Error(`no rezolvo for ${JSON.stringify(assignment)}`);
    return found;
  };

  for (const assignment of combinations) {
    const label = `${assignment.aspekto} · ${assignment["color-scheme"]} · ${assignment.contrast}`;
    it(`resolves the named roles in ${label}`, () => {
      const rezolvo = rezolvoOf(assignment);
      const resolved = resolveFigmaPlan(plan, assignment);
      for (const role of ROLES) {
        const token = rezolvo.tokens[role];
        if (token === undefined) throw new Error(`${role} is no role of this Modelo`);
        for (const [variable, expected] of Object.entries(
          figmaValues(role, token.type, token.value),
        )) {
          expect(resolved[variable], `${variable} in ${label}`).toEqual(expected);
        }
      }
    });
  }

  // Every switch is visible: changing exactly one of the three Dimensioj changes the primary
  // action. Two combinations that differ in two of them may well share a value — a brand is free
  // to use the same yellow on a light screen and in a dark high-contrast one — so the claim is
  // about each single switch, which is what a designer performs in Figma.
  it("changes the primary action whenever one of the three Dimensioj changes", () => {
    const primary = (assignment: Record<string, string>) =>
      JSON.stringify(resolveFigmaPlan(plan, assignment)["color/action/primary/rest"]);
    const DIMENSIOJ = ["aspekto", "color-scheme", "contrast"] as const;
    let compared = 0;
    for (const one of combinations) {
      for (const other of combinations) {
        const differing = DIMENSIOJ.filter((dimensio) => one[dimensio] !== other[dimensio]);
        if (differing.length !== 1) continue;
        expect(primary(one), `${JSON.stringify(one)} vs ${JSON.stringify(other)}`).not.toEqual(
          primary(other),
        );
        compared++;
      }
    }
    expect(compared).toBe(24);
  });
});

// F30 (An P0, Maintainer 2026-09-23): in Figma the label's typeface must follow the brand. The
// plan therefore has to offer what a binding needs — a variable holding a font family Figma can
// actually pick (not a CSS stack), a variable holding the style name Figma asks for, and the list
// of fonts the set can need over every combination, so the run can load them all before it binds.
describe("the label's font is a variable, not a fixed name (F30)", () => {
  const variables = plan.collections.flatMap((collection) => collection.variables);
  const named = (name: string) => variables.find((variable) => variable.name === name);

  it("holds the family Figma picks, without the browser's fallbacks", () => {
    expect(named("font/family/body")?.values).toEqual({
      komuna: "Geist",
      ekzemplo: "Archivo",
    });
    expect(named("font/family/body")?.type).toBe("STRING");
  });

  // Figma names a cut, the Vortaro a number: the style variable is derived from the weight and
  // cascades with it, so an Aspekto that changes its weight changes its cut in the same mode.
  it("derives a style variable from every weight, with the same modes", () => {
    expect(named("font/style/medium")).toMatchObject({
      type: "STRING",
      values: { komuna: "Medium", ekzemplo: "Medium" },
    });
    expect(named("font/style/black")?.values).toEqual({ komuna: "Black", ekzemplo: "Black" });
    expect(named("font/weight/black")?.values).toEqual({ komuna: 900, ekzemplo: 900 });
  });

  it("gives every typography role a font-style field beside its font-weight", () => {
    expect(named("typography/label/1/font-style")?.type).toBe("STRING");
    expect(named("typography/label/1/font-weight")?.type).toBe("FLOAT");
    expect(named("typography/display/1/font-style")).toBeDefined();
  });

  it("resolves the label's family and style per brand", () => {
    const komuna = resolveFigmaPlan(plan, { aspekto: "komuna" });
    const ekzemplo = resolveFigmaPlan(plan, { aspekto: "ekzemplo" });
    expect(komuna["typography/label/1/font-family"]).toBe("Geist");
    expect(ekzemplo["typography/label/1/font-family"]).toBe("Archivo");
    expect(komuna["typography/label/1/font-style"]).toBe("Medium");
    expect(ekzemplo["typography/label/1/font-style"]).toBe("Black");
  });

  // What the run must load before it binds: every pair, with the Aspektoj that ask for it.
  it("lists every font the set can need, with the brand that asks for it", () => {
    const set = plan.components.find((component) => component.set === "butono");
    expect(set?.fonts).toEqual([
      { family: "Archivo", style: "Black", aspektoj: ["ekzemplo"] },
      { family: "Geist", style: "Medium", aspektoj: ["komuna"] },
    ]);
  });
});

// F32 Teil 1 (An P0, Maintainer 2026-09-23, gemessen in D8do10CeWekxtFO5no9Fxz, Set butono):
// focus-ring.cornerRadius = 8 und focus-gap.cornerRadius = 6 standen in beiden Modi gleich und an
// keiner Variablen — sie kamen aus der Basiskombination. In ekzemplo umschloss damit ein Ring mit
// Radius 8 einen Knopf mit Radius 0. Gemessen wird die Wirkung, nicht die gesetzte Eigenschaft:
// die Geometrie eines Rings um ein abgerundetes Rechteck ist erzwungen, also muss sie in jedem
// Modus aufgehen.
describe("the focus ring follows the brand's radius (F32)", () => {
  const set = plan.components.find((component) => component.set === "butono");
  const variant = set?.variants.find(
    (entry) => entry.props.state === "focus" && entry.props.size === "medium",
  );

  /** The radius of a ring part, whatever the plan states: a number, or a variable to resolve. */
  const radiusOf = (part: "focus-ring" | "focus-gap", resolved: Record<string, FigmaValue>) => {
    const stated = variant?.radii?.[part];
    return typeof stated === "number" ? stated : resolved[String(stated)];
  };

  for (const aspekto of ["komuna", "ekzemplo"]) {
    it(`keeps ring, gap and control one band apart in ${aspekto}`, () => {
      const resolved = resolveFigmaPlan(plan, { aspekto });
      const ring = radiusOf("focus-ring", resolved);
      const gap = radiusOf("focus-gap", resolved);
      const control = resolved["radius/role/control"];
      const width = resolved["focus/ring/width"];
      const offset = resolved["focus/offset"];
      expect(Number(ring) - Number(gap), `${aspekto}: ring − gap is the ring's width`).toBe(
        Number(width),
      );
      expect(Number(gap) - Number(control), `${aspekto}: gap − control is the offset`).toBe(
        Number(offset),
      );
    });
  }

  it("states the radii as variables, not as numbers", () => {
    expect(typeof variant?.radii?.["focus-ring"]).toBe("string");
    expect(typeof variant?.radii?.["focus-gap"]).toBe("string");
  });
});

// F32 Teil 2 (An P0, Maintainer 2026-09-23): Der Markenunterschied war in der Typografie zu
// schwach — Geist Medium gegen Archivo SemiBold, 500 gegen 600, im Vergleichsbild nicht zu
// erkennen. ekzemplo setzt Beschriftung, Anzeige und Überschrift auf 900; die Familie bleibt
// Archivo, nicht die eigene Familie „Archivo Black", deren Stil „Regular" hieße.
describe("ekzemplo carries its weight (F32)", () => {
  it("names the cut of 900 the way Figma does", () => {
    expect(styleOfWeight(900)).toBe("Black");
    expect(styleOfWeight(500)).toBe("Medium");
  });

  it("resolves the label to Archivo Black in ekzemplo and Geist Medium in komuna", () => {
    const komuna = resolveFigmaPlan(plan, { aspekto: "komuna" });
    const ekzemplo = resolveFigmaPlan(plan, { aspekto: "ekzemplo" });
    expect(komuna["typography/label/1/font-family"]).toBe("Geist");
    expect(komuna["typography/label/1/font-style"]).toBe("Medium");
    expect(ekzemplo["typography/label/1/font-family"]).toBe("Archivo");
    expect(ekzemplo["typography/label/1/font-style"]).toBe("Black");
    expect(ekzemplo["typography/label/2/font-style"]).toBe("Black");
    expect(ekzemplo["typography/display/1/font-style"]).toBe("Black");
    expect(ekzemplo["typography/headline/1/font-style"]).toBe("Black");
  });

  it("leaves the reading sizes alone", () => {
    const ekzemplo = resolveFigmaPlan(plan, { aspekto: "ekzemplo" });
    expect(ekzemplo["typography/body/1/font-style"]).toBe("Medium");
    expect(ekzemplo["typography/caption/font-style"]).toBe("Medium");
  });

  it("asks the run for Archivo Black, not Archivo SemiBold", () => {
    const set = plan.components.find((component) => component.set === "butono");
    expect(set?.fonts).toEqual([
      { family: "Archivo", style: "Black", aspektoj: ["ekzemplo"] },
      { family: "Geist", style: "Medium", aspektoj: ["komuna"] },
    ]);
  });
});
