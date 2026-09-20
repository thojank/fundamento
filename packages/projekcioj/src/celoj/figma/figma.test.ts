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
  figmaPlanInventory,
  figmaValues,
  resolveFigmaPlan,
} from "./figma.js";

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

  it("keeps every collection within four modes (Figma Professional)", () => {
    for (const collection of plan.collections) {
      expect(collection.modes.length, collection.name).toBeLessThanOrEqual(4);
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
