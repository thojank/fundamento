// Figma plan and simulator (Spec 003 T015; FR-09, plan D-12, contracts/projekcioj §5). The plan is
// a pure description of collections, variables and the component set; resolving it by Figma's mode
// rules must give rezolvoj.json for every combination, so the projection is provable without Figma.

import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { baseResolution, defaultModeloSource, projectModeloSource } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import { VITRINO_LIST_ENTRIES, VITRINO_SLOT_TEXTS } from "../vitrino/datumoj.js";
import { signOf } from "../web-component/element-template.js";
import {
  ALPHA_VARIES,
  BACKDROP_EXAMPLE,
  compositeFields,
  DIALOG_TEXTS,
  FIGMA_CELO,
  FIGMA_NOT_DRAWN,
  FIGMA_SECTION,
  type FigmaPlan,
  type FigmaValue,
  figmaPlanInventory,
  figmaValues,
  LIST_EMPTY_VALUE,
  labelDefaultOf,
  METER_UNKNOWN_TEXT,
  resolveFigmaPlan,
  STATE_SIGN,
  structureOf,
  styleOfWeight,
  TEXT_CASE_VARIES,
  UNKNOWN_EXAMPLE,
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

/**
 * The set of the butono in a list of components: the Ero order sorts the avizo before it since
 * Spec 011 ③, so the butono is no longer the first set of the plan.
 */
const butonoOf = <T>(components: readonly T[] | undefined): T | undefined =>
  components?.find((component) => (component as { set?: unknown }).set === "butono");

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
    // Four emphasis × intent combinations (the danger constraint removes two) × 3 sizes × 6 states.
    expect(set?.variants.length).toBe(4 * 3 * 6);
    for (const variant of set?.variants ?? []) {
      expect(Object.keys(variant.bindings).length).toBeGreaterThan(3);
      for (const binding of Object.values(variant.bindings)) {
        expect(binding).toMatch(/^[a-z0-9]+(\/[a-z0-9-]+)+$/);
      }
    }
  });

  // Spec 007 T028 (A12, D-10): the purpose of the Uzo is the description of the component set.
  it("describes the component set with the purpose of the Uzo (T028)", () => {
    const set = plan.components.find((component) => component.set === "butono");
    const uzo = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "butono")?.uzo;
    expect(uzo?.purpose).toBeDefined();
    expect(set?.description).toBe(uzo?.purpose);
    expect(set?.description).not.toContain("\n");
  });

  // Spec 007 T029 (A12, D-10, OP-9): what the set should carry beyond the purpose, as the plugin
  // tries it — boundaries, slot rules and text rules as Markdown for descriptionMarkdown.
  it("plans the boundaries, slot rules and text rules of the Uzo for the set (T029)", () => {
    const set = plan.components.find((component) => component.set === "butono");
    const uzo = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "butono")?.uzo;
    expect(set?.uzo?.field).toBe("descriptionMarkdown");
    expect(set?.uzo?.parts).toEqual(["boundary", "slots", "content"]);
    // Befund B1: the Markdown replaces the description, so its first line is the purpose.
    expect(set?.uzo?.markdown.split("\n")[0]).toBe(uzo?.purpose);
    expect(set?.uzo?.markdown.split("\n")[0]).toBe(set?.description);
    for (const boundary of uzo?.boundary ?? []) {
      expect(set?.uzo?.markdown).toContain(boundary.case);
      expect(set?.uzo?.markdown).toContain(boundary.kialo);
    }
    for (const slot of Object.keys(uzo?.slots ?? {})) expect(set?.uzo?.markdown).toContain(slot);
    for (const rule of uzo?.content ?? []) expect(set?.uzo?.markdown).toContain(rule.regulo);
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
    expect(values["surface.fill@emphasis=high,intent=neutral,size=medium,state=rest"]).toMatch(
      /^#[0-9a-f]{6}$/,
    );
  });

  // Seit F36 legt auch ekzemplo den tertiären Knopf als Auflage an, nicht als Fläche: Beide Marken
  // sagen dort dasselbe Alpha, und die Deckkraft steht wieder als Zahl im Plan. Genau das war die
  // Bedingung, unter der F8 sich weigerte — sie ist weg, nicht die Regel.
  it("names the real alpha once both brands agree on it", () => {
    expect(values["surface.fill@emphasis=low,intent=neutral,size=medium,state=hover"]).toBe(
      "#000000/0.08",
    );
    const variant = butonoOf(plan.components)?.variants.find(
      (entry) => entry.props.emphasis === "low" && entry.props.state === "hover",
    );
    expect(variant?.paints?.["surface.fill"]).toEqual({ hex: "#000000", opacity: 0.08 });
  });

  // Die Weigerung selbst bleibt geprüft, damit sie nicht verrottet: Eine Marke, die den tertiären
  // Knopf wieder deckend anlegt, bringt den Plan zurück in den Zustand, den F8 gefunden hat.
  it("still refuses to pick one brand when a brand makes the alpha differ again", () => {
    const root = mkdtempSync(join(tmpdir(), "fm-alpha-"));
    cpSync(
      new URL("../../../../modelo/test/fixtures/valid/aspekto-ekzemplo/", import.meta.url).pathname,
      root,
      { recursive: true },
    );
    const setFile = join(root, "aspekto-ekzemplo/sets/aspekto/ekzemplo.json");
    const document = JSON.parse(readFileSync(setFile, "utf8")) as Record<string, unknown>;
    let node = document;
    for (const key of ["color", "action", "tertiary", "hover"]) {
      const next = node[key];
      if (typeof next !== "object" || next === null) throw new Error(`no ${key} in the set`);
      node = next as Record<string, unknown>;
    }
    node.$value = "{color.palette.neutral.100}";
    writeFileSync(setFile, `${JSON.stringify(document, null, 2)}\n`);
    const opaque = celoInputOf(projectModeloSource(join(root, "fundamento.config.json")));
    if (!opaque.ok) throw new Error("the fixture must stay valid");
    const opaquePlan = JSON.parse(
      FIGMA_CELO.generate(opaque.input).find((file) => file.path === "figma/plan.json")?.text ??
        "{}",
    ) as FigmaPlan;
    const variant = butonoOf(opaquePlan.components)?.variants.find(
      (entry) => entry.props.emphasis === "low" && entry.props.state === "hover",
    );
    expect(variant?.paints?.["surface.fill"]).toEqual({ hex: "#000000", alphaVariesByMode: true });
    expect(
      figmaPlanInventory(opaquePlan).butono?.values[
        "surface.fill@emphasis=low,intent=neutral,size=medium,state=hover"
      ],
    ).toBe(`${ALPHA_VARIES} (color/action/tertiary/hover)`);
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
      // Beide Marken hier zeichnen Rechtecke; eine Marke, deren Kontrollradius die halbe
      // Controlhöhe erreicht, zeichnet Pillen und wird eigens gemessen (siehe unten).
      expect(Number(control), `${aspekto} draws rectangles, not pills`).toBeLessThan(
        Number(resolved["size/control/medium"]) / 2,
      );
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

// F32 Nachtrag (Maintainer, 2026-09-23): Eine Marke, deren Kontrollradius mindestens die halbe
// Controlhöhe ist, zeichnet Pillen; dann sind Abstand und Ring ebenfalls gesättigt. Gemessen an
// einer Fixture-Marke, die nie veröffentlicht wird: Die additive Prüfung **entfällt dort nicht**.
// Figma kappt jeden Radius auf die halbe Höhe seines eigenen Kastens, und jeder umschließende
// Kasten wächst um genau das Doppelte des Abstands — 36/40/44 werden zu 18/20/22, die Differenzen
// bleiben Versatz und Strichstärke. Der Fall steht hier, damit eine Änderung, die das bricht,
// auffällt.
describe("a brand that draws pills (F32)", () => {
  const root = mkdtempSync(join(tmpdir(), "fm-pill-"));
  cpSync(
    new URL("../../../../modelo/test/fixtures/valid/aspekto-ekzemplo/", import.meta.url).pathname,
    root,
    { recursive: true },
  );
  const setFile = join(root, "aspekto-ekzemplo/sets/aspekto/ekzemplo.json");
  const document = JSON.parse(readFileSync(setFile, "utf8")) as Record<string, unknown>;
  /** Re-points a token of the copied set; the fixture must have it, or the case proves nothing. */
  const put = (path: string, value: unknown) => {
    let node = document;
    for (const key of path.split(".")) {
      const next = node[key];
      if (typeof next !== "object" || next === null) throw new Error(`${path} is no token`);
      node = next as Record<string, unknown>;
    }
    node.$value = value;
  };
  put("radius.full", { value: 9999, unit: "px" });
  put("radius.role.control", "{radius.full}");
  writeFileSync(setFile, `${JSON.stringify(document, null, 2)}\n`);
  const pillPrepared = celoInputOf(projectModeloSource(join(root, "fundamento.config.json")));
  if (!pillPrepared.ok) throw new Error("the pill fixture must stay valid");
  const pillPlan = JSON.parse(
    FIGMA_CELO.generate(pillPrepared.input).find((file) => file.path === "figma/plan.json")?.text ??
      "{}",
  ) as FigmaPlan;

  const resolved = () => resolveFigmaPlan(pillPlan, { aspekto: "ekzemplo" });
  const number = (name: string) => Number(resolved()[name]);

  it("saturates the control, its gap and its ring alike", () => {
    const height = number("size/control/medium");
    const offset = number("focus/offset");
    const width = number("focus/ring/width");
    expect(number("radius/role/control")).toBeGreaterThanOrEqual(height / 2);
    expect(number("radius/focus/gap")).toBeGreaterThanOrEqual((height + 2 * offset) / 2);
    expect(number("radius/focus/ring")).toBeGreaterThanOrEqual(
      (height + 2 * offset + 2 * width) / 2,
    );
  });

  // What Figma draws once it has capped each radius at half of its own box.
  it("keeps ring, gap and control one band apart even after Figma caps them", () => {
    const height = number("size/control/medium");
    const offset = number("focus/offset");
    const width = number("focus/ring/width");
    const capped = (radius: number, box: number) => Math.min(radius, box / 2);
    const control = capped(number("radius/role/control"), height);
    const gap = capped(number("radius/focus/gap"), height + 2 * offset);
    const ring = capped(number("radius/focus/ring"), height + 2 * offset + 2 * width);
    expect([control, gap, ring]).toEqual([
      height / 2,
      height / 2 + offset,
      height / 2 + offset + width,
    ]);
    expect(ring - gap).toBe(width);
    expect(gap - control).toBe(offset);
  });

  it("leaves the reference brand round in the ordinary way", () => {
    const komuna = resolveFigmaPlan(pillPlan, { aspekto: "komuna" });
    expect(Number(komuna["radius/role/control"])).toBe(4);
    expect(Number(komuna["radius/focus/gap"])).toBe(6);
  });
});

// F31 (An P0, Maintainer 2026-09-23): Gesperrte Versalien sind ein typografisches Paar. Der
// Sperrsatz kam als Variable schon an, war aber an nichts gebunden; die Schreibweise fehlte ganz.
describe("capitals and tracking reach the Figma plan (F31)", () => {
  const set = plan.components.find((component) => component.set === "butono");
  const variant = set?.variants.find(
    (entry) => entry.props.size === "medium" && entry.props.state === "rest",
  );

  it("states the case of the label's role, per variant", () => {
    expect(variant?.textCase).toBe("ORIGINAL");
    for (const entry of set?.variants ?? []) {
      expect(["ORIGINAL", "UPPER", "LOWER", "TITLE"], entry.props.size).toContain(entry.textCase);
    }
  });

  it("keeps the tracking a variable, so it follows the brand", () => {
    const variables = plan.collections.flatMap((collection) => collection.variables);
    const tracking = variables.find(
      (candidate) => candidate.name === "typography/label/1/letter-spacing",
    );
    expect(tracking?.type).toBe("FLOAT");
    const komuna = resolveFigmaPlan(plan, { aspekto: "komuna" });
    const ekzemplo = resolveFigmaPlan(plan, { aspekto: "ekzemplo" });
    expect(typeof komuna["typography/label/1/letter-spacing"]).toBe("number");
    expect(typeof ekzemplo["typography/label/1/letter-spacing"]).toBe("number");
  });

  // Eine Marke, die ihre Beschriftung in Versalien setzt, und eine, die es nicht tut: Der Plan
  // kann für einen geschriebenen Wert nur einen nennen und sagt das, statt eine Marke zu wählen.
  it("says so when two brands disagree about the case", () => {
    const root = mkdtempSync(join(tmpdir(), "fm-case-"));
    cpSync(
      new URL("../../../../modelo/test/fixtures/valid/aspekto-ekzemplo/", import.meta.url).pathname,
      root,
      { recursive: true },
    );
    const setFile = join(root, "aspekto-ekzemplo/sets/aspekto/ekzemplo.json");
    const document = JSON.parse(readFileSync(setFile, "utf8")) as Record<string, unknown>;
    let node = document;
    for (const key of ["typography", "label", "1"]) {
      const next = node[key];
      if (typeof next !== "object" || next === null) throw new Error(`no ${key}`);
      node = next as Record<string, unknown>;
    }
    node.$extensions = { "com.ciferecigo.fundamento": { textTransform: "uppercase" } };
    writeFileSync(setFile, `${JSON.stringify(document, null, 2)}\n`);
    const mixed = celoInputOf(projectModeloSource(join(root, "fundamento.config.json")));
    if (!mixed.ok) throw new Error("the fixture must stay valid");
    const mixedPlan = JSON.parse(
      FIGMA_CELO.generate(mixed.input).find((file) => file.path === "figma/plan.json")?.text ??
        "{}",
    ) as FigmaPlan;
    const medium = butonoOf(mixedPlan.components)?.variants.find(
      (entry) => entry.props.size === "medium" && entry.props.state === "rest",
    );
    expect(medium?.textCase).toBe(TEXT_CASE_VARIES);
  });
});

// Spec 008 T017 (A5, plan D-11): the second component set, from the same generator. The axes are
// the enum props the parts are keyed by (placement, size) and the state; external is a BOOLEAN
// property of the plan. The underline is a written text decoration per variant, the inherited
// typography of an inline link is the running text's role, and a link has no radius to grow.
describe("Figma plan for the ligilo (Spec 008 T017)", () => {
  const set = plan.components.find((component) => component.set === "ligilo");
  const ligilo = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "ligilo");
  const variant = (placement: string, size: string, state: string) =>
    set?.variants.find(
      (entry) =>
        entry.props.placement === placement &&
        entry.props.size === size &&
        entry.props.state === state,
    );

  it("plans the sets in Ero order, butono first, and gives the ligilo placement × size × state", () => {
    expect(plan.components.map((component) => component.set)).toEqual([
      // Spec 011 ④: the atributlisto, the mezurilo and the tabelo, in the Ero order like every set.
      "atributlisto",
      // Spec 011 ③: the avizo, the insigno and the plenstato, in the Ero order like every set.
      "avizo",
      "butono",
      // Spec 011 ②: the dialogo and the tekstareo, in the Ero order like every set.
      "dialogo",
      "elektilo",
      "elekto",
      "insigno",
      "kampo",
      "langetaro",
      "ligilo",
      "markobutono",
      "mezurilo",
      "navigado",
      "plenstato",
      "sxaltilo",
      "tabelo",
      "tekstareo",
    ]);
    expect(set?.properties).toEqual({
      to: "TEXT",
      placement: ["inline", "standalone"],
      external: "BOOLEAN",
      size: ["small", "medium", "large"],
      label: "TEXT",
      state: ["rest", "hover", "pressed", "focus", "visited"],
    });
    expect(set?.variants).toHaveLength(2 * 3 * 5);
    expect(set?.description).toBe(ligilo?.uzo?.purpose);
    expect(set?.grid).toMatchObject({ rows: 6, columns: 5 });
  });

  it("underlines inline in every state and standalone from hover and focus on (D-11, B-1)", () => {
    for (const state of ["rest", "hover", "pressed", "focus", "visited"]) {
      expect(variant("inline", "medium", state)?.underline, `inline ${state}`).toBe(true);
    }
    expect(variant("standalone", "medium", "rest")?.underline).toBe(false);
    expect(variant("standalone", "medium", "visited")?.underline).toBe(false);
    for (const state of ["hover", "pressed", "focus"]) {
      expect(variant("standalone", "medium", state)?.underline, `standalone ${state}`).toBe(true);
    }
    // The part underline is a named, released difference, never a claimed drawing.
    expect(variant("inline", "medium", "rest")?.notDrawn?.["underline.width"]).toBe(
      "jug_01M4RYCY61NK92JM6XYD00M012",
    );
    expect(variant("inline", "medium", "rest")?.bindings["underline.width"]).toBe(
      "border/width/default",
    );
    expect(variant("standalone", "medium", "rest")?.bindings["underline.width"]).toBeUndefined();
    // The butono knows no underline.
    expect(butonoOf(plan.components)?.variants[0]?.underline).toBeUndefined();
  });

  it("takes the running text's role for the inherited typography and binds it (E6, D-11)", () => {
    const inline = variant("inline", "small", "rest");
    expect(inline?.bindings["label.typography"]).toBe("typography/body/1");
    expect(inline?.font).toBeDefined();
    expect(variant("standalone", "small", "rest")?.bindings["label.typography"]).toBe(
      "typography/label/2",
    );
    expect(set?.fonts?.length ?? 0).toBeGreaterThan(0);
  });

  it("binds the link colours by state and the minimum target standalone only (D-10)", () => {
    expect(variant("standalone", "medium", "rest")?.bindings["label.color"]).toBe(
      "color/link/rest",
    );
    expect(variant("standalone", "medium", "visited")?.bindings["label.color"]).toBe(
      "color/link/visited",
    );
    expect(variant("standalone", "medium", "pressed")?.bindings["label.color"]).toBe(
      "color/link/hover",
    );
    expect(variant("standalone", "medium", "rest")?.geometry?.["box.height"]).toBe("24px");
    expect(variant("inline", "medium", "rest")?.geometry?.["box.height"]).toBeUndefined();
    expect(variant("inline", "medium", "rest")?.bindings["box.height"]).toBeUndefined();
  });

  it("grows no focus radius for an Ero without a radius; the butono keeps its radii (F32)", () => {
    expect(variant("standalone", "medium", "focus")?.radii).toBeUndefined();
    expect(variant("standalone", "medium", "focus")?.focusVisible).toBe(true);
    expect(butonoOf(plan.components)?.variants[0]?.radii).toEqual({
      "focus-gap": "radius/focus/gap",
      "focus-ring": "radius/focus/ring",
    });
    const names = plan.collections.flatMap((c) => c.variables.map((v) => v.name));
    expect(names).toContain("radius/focus/gap");
  });

  it("states the ligilo in the parity inventory with its states and the released underline", () => {
    const items = figmaPlanInventory(plan);
    expect(items.ligilo?.props.placement).toEqual(["inline", "standalone"]);
    expect(items.ligilo?.props.external).toEqual(["boolean"]);
    expect(items.ligilo?.props.to).toEqual(["string"]);
    expect(items.ligilo?.states).toEqual(["rest", "hover", "pressed", "focus", "visited"]);
    expect(items.ligilo?.values["label.color@placement=standalone,size=medium,state=rest"]).toMatch(
      /^#[0-9a-f]{6}$/,
    );
  });
});

// Spec 009 T010 (A5, plan D-09): the third set, a field. Its structure is a column of label,
// control with the typed text, help and error; size × state are the axes; required is a BOOLEAN
// property, label, help, error, value and placeholder TEXT properties of the plan.
describe("Figma plan for the kampo (Spec 009 T010)", () => {
  const set = plan.components.find((component) => component.set === "kampo");
  const variant = (size: string, state: string) =>
    set?.variants.find((entry) => entry.props.size === size && entry.props.state === state);

  it("plans a field of size × state with the properties of the Skemo", () => {
    expect(set?.structure).toBe("field");
    expect(butonoOf(plan.components)?.structure).toBe("control");
    // Spec 011 ① (E8): the three new kinds and min, max, autocomplete are properties of the plan,
    // nothing is drawn differently (a date shows the closed field, like the elektilo; E3).
    expect(set?.properties).toEqual({
      kind: ["text", "email", "tel", "url", "search", "password", "number", "date"],
      value: "TEXT",
      placeholder: "TEXT",
      required: "BOOLEAN",
      disabled: "BOOLEAN",
      readonly: "BOOLEAN",
      invalid: "BOOLEAN",
      size: ["small", "medium", "large"],
      name: "TEXT",
      min: "TEXT",
      max: "TEXT",
      autocomplete: "TEXT",
      state: ["rest", "hover", "focus", "disabled", "readonly", "invalid"],
    });
    expect(set?.variants).toHaveLength(3 * 6);
    expect(set?.grid).toMatchObject({ rows: 3, columns: 6 });
  });

  it("binds the parts of the field and releases the placeholder and the mark (B-2)", () => {
    const rest = variant("medium", "rest");
    expect(rest?.bindings["text.typography"]).toBe("typography/body/1");
    expect(rest?.bindings["help.typography"]).toBe("typography/caption");
    expect(rest?.bindings["error.color"]).toBe("color/status/danger/text");
    expect(rest?.bindings["border.color"]).toBe("color/border/default");
    expect(variant("medium", "invalid")?.bindings["border.color"]).toBe(
      "color/status/danger/border",
    );
    expect(variant("medium", "readonly")?.bindings["surface.fill"]).toBe("color/background/sunken");
    // F-4: the control shows the placeholder, so its colour is drawn and the typed text's is not.
    expect(rest?.notDrawn?.["text.color"]).toBe("jug_01M4S2R85WRAC5SV7CARH8RE7S");
    expect(rest?.notDrawn?.["required-mark.color"]).toBe("jug_01M4S2R85WRAC5SV7CARH8RE7S");
    expect(rest?.notDrawn?.["placeholder.color"]).toBeUndefined();
    expect(rest?.paints?.["placeholder.color"]).toMatchObject({ hex: expect.stringMatching(/^#/) });
    expect(set?.texts).toEqual({ text: "Beispiel", help: "Hinweis", error: "Fehler" });
    expect(butonoOf(plan.components)?.texts).toBeUndefined();
    expect(rest?.geometry?.["box.height"]).toBe("40px");
    // Fonts of every text part, over every mode: the caption and the body roles too.
    expect((set?.fonts?.length ?? 0) >= (butonoOf(plan.components)?.fonts?.length ?? 0)).toBe(true);
  });

  it("states the kampo in the parity inventory with its six states", () => {
    const items = figmaPlanInventory(plan);
    expect(items.kampo?.states).toEqual([
      "rest",
      "hover",
      "focus",
      "disabled",
      "readonly",
      "invalid",
    ]);
    expect(items.kampo?.props.kind).toEqual([
      "text",
      "email",
      "tel",
      "url",
      "search",
      "password",
      "number",
      "date",
    ]);
    expect(items.kampo?.values["placeholder.color@size=medium,state=rest"]).toMatch(
      /^#[0-9a-f]{6}$/,
    );
  });
});

// M-3 (Abnahme Spec 008, Befund B-6; Entscheidung des Maintainers F14, 2026-10-13): Der Vorgabewert
// der Beschriftung folgt der Rolle des Ero — Celo-Wissen aus a11y.role, wie structureOf.
describe("the label default of a set follows its a11y role (M-3)", () => {
  it("is Aktion for a button, Ziel for a link, Beschriftung for a textbox", () => {
    const defaults = Object.fromEntries(
      plan.components.map((component) => [component.set, component.label?.defaultValue]),
    );
    // Spec 010 ①: a switch names a setting (plan D-10, for the maintainer to confirm).
    expect(defaults).toEqual({
      // Spec 011 ④ (plan ④ D-14): a key-value list (role list) names what it states (for the
      // maintainer to confirm).
      atributlisto: "Angaben",
      // Spec 011 ③ (plan ③ D-14): a notice (role status) names its message (for the maintainer
      // to confirm).
      avizo: "Meldung",
      butono: "Aktion",
      // Spec 011 ②: a dialog's heading names the decision (for the maintainer to confirm).
      dialogo: "Entscheidung",
      // Spec 010 ④: a select names what is chosen (plan ④ D-07, for the maintainer to confirm).
      elektilo: "Auswahl",
      // Spec 010 ③: a radio group names its question (plan ③ D-07, for the maintainer to confirm).
      elekto: "Frage",
      // Spec 011 ③: a badge (role generic) names a status (for the maintainer to confirm).
      insigno: "Status",
      kampo: "Beschriftung",
      ligilo: "Ziel",
      // Spec 010 ②: a checkbox names an option (plan ② D-11, for the maintainer to confirm, O-x).
      markobutono: "Option",
      // Spec 011 ④ (plan ④ D-14): a meter (role meter) names the measure its label stands for
      // (for the maintainer to confirm).
      mezurilo: "Messwert",
      // Spec 011 ③: a loading or empty state shares the role status with the notice; its word is
      // the structure's, not the role's (for the maintainer to confirm).
      plenstato: "Zustand",
      sxaltilo: "Einstellung",
      // Spec 011 ④ (plan ④ D-14): a table's caption is a caption like a field's label (for the
      // maintainer to confirm).
      tabelo: "Beschriftung",
      // Spec 011 ②: a text area is a textbox, so the kampo's word applies.
      tekstareo: "Beschriftung",
    });
  });

  it("knows the words of the Daten roles: meter, table, list (Spec 011 ④)", () => {
    expect(labelDefaultOf("meter")).toBe("Messwert");
    expect(labelDefaultOf("table")).toBe("Beschriftung");
    expect(labelDefaultOf("list")).toBe("Angaben");
    expect(labelDefaultOf("meter", "meter")).toBe("Messwert");
    expect(labelDefaultOf("table", "table")).toBe("Beschriftung");
    expect(labelDefaultOf("list", "list")).toBe("Angaben");
  });

  it("falls back to Aktion for a role the Celo does not know", () => {
    expect(labelDefaultOf("button")).toBe("Aktion");
    expect(labelDefaultOf("link")).toBe("Ziel");
    expect(labelDefaultOf("textbox")).toBe("Beschriftung");
    expect(labelDefaultOf("switch")).toBe("Einstellung");
    expect(labelDefaultOf("checkbox")).toBe("Option");
    expect(labelDefaultOf("radiogroup")).toBe("Frage");
    expect(labelDefaultOf("combobox")).toBe("Auswahl");
    expect(labelDefaultOf("dialog")).toBe("Entscheidung");
    expect(labelDefaultOf("slider")).toBe("Aktion");
  });

  it("takes the word of the structure before the word of the role (Spec 011 ③)", () => {
    expect(labelDefaultOf("generic")).toBe("Status");
    expect(labelDefaultOf("status")).toBe("Meldung");
    expect(labelDefaultOf("status", "notice")).toBe("Meldung");
    expect(labelDefaultOf("status", "state")).toBe("Zustand");
    expect(labelDefaultOf("button", "control")).toBe("Aktion");
  });
});

// F-1 / F-2 (Nachlese Spec 008/009): Die Sets liegen in der Section „Fundamento".
// Abstand und Innenabstand sind ein Token, keine Zahl: spacing.xlarge, aufgelöst in der
// Basiskombination wie der Zellabstand der Vitrino.
// F-8 (gemessen 2026-10-14 in f10b-5): In der Section liegt der Frame „Eroj" mit Auto-Layout;
// Figma legt die Sets aus, der Plan trägt keine Reserve mehr (F-7 ersetzt).
describe("the plan places the sets in the frame Eroj of the section Fundamento (F-1, F-2, F-8)", () => {
  const repo = celoInputOf(defaultModeloSource());
  if (!repo.ok) throw new Error("the repo Modelo must be valid");
  const repoPlan = JSON.parse(
    FIGMA_CELO.generate(repo.input).find((file) => file.path === "figma/plan.json")?.text ?? "{}",
  ) as FigmaPlan;

  it("takes gap and padding from spacing.xlarge in the base combination", () => {
    const xlarge = baseResolution(repo.input.modelo)["spacing.xlarge"]?.value as
      | { value: number; unit: string }
      | undefined;
    expect(xlarge?.unit).toBe("px");
    expect(repoPlan.section).toEqual({
      name: FIGMA_SECTION,
      gap: xlarge?.value,
      padding: xlarge?.value,
      frame: "Eroj",
    });
    // Resolved today: 24 px (spacing.scale.600).
    expect(repoPlan.section?.gap).toBe(24);
    expect(FIGMA_SECTION).toBe("Fundamento");
  });

  // F-8 (gemessen 2026-10-14 in f10b-5): F-7's reserve of half a set's width did not carry the
  // widths of every brand mode. Figma's auto-layout places the sets; the plan carries no reserve.
  it("carries the frame the sets lie in, and no reserve (F-8)", () => {
    expect(repoPlan.section?.frame).toBe("Eroj");
    expect(repoPlan.section).not.toHaveProperty("reserve");
  });
});

// Spec 010 ① (plan D-03, D-04, D-10): the fourth set, a switch. checked is an axis of the
// variants (a boolean prop that keys the parts), next to size and state: 2 × 3 × 4. The structure
// is a toggle — the track with the knob in it and the label beside it — and every variant says
// where its knob stands, start or end, as the underline of a link is written per variant.
describe("Figma plan for the sxaltilo (Spec 010 ①)", () => {
  const set = plan.components.find((component) => component.set === "sxaltilo");
  const sxaltilo = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "sxaltilo");
  const variant = (checked: string, size: string, state: string) =>
    set?.variants.find(
      (entry) =>
        entry.props.checked === checked && entry.props.size === size && entry.props.state === state,
    );

  it("plans a toggle of checked × size × state with the purpose as description", () => {
    expect(set?.structure).toBe("toggle");
    expect(set?.properties).toEqual({
      checked: "BOOLEAN",
      size: ["small", "medium", "large"],
      disabled: "BOOLEAN",
      name: "TEXT",
      state: ["rest", "hover", "focus", "disabled"],
    });
    expect(set?.variants).toHaveLength(2 * 3 * 4);
    expect(Object.keys(set?.variants[0]?.props ?? {})).toEqual(["checked", "size", "state"]);
    expect(set?.grid).toMatchObject({ rows: 6, columns: 4 });
    expect(set?.description).toBe(sxaltilo?.uzo?.purpose);
    expect(set?.label?.defaultValue).toBe("Einstellung");
    expect(set?.texts).toBeUndefined();
  });

  it("places the knob at the start unchecked and at the end checked (D-04)", () => {
    expect(variant("false", "medium", "rest")?.position).toBe("start");
    expect(variant("true", "medium", "rest")?.position).toBe("end");
    expect(variant("true", "small", "disabled")?.position).toBe("end");
    expect(variant("true", "medium", "rest")?.bindings["indicator.position"]).toBeUndefined();
    expect(butonoOf(plan.components)?.variants[0]?.position).toBeUndefined();
  });

  it("binds track, border and knob by checked and state, and draws them (D-06)", () => {
    const on = variant("true", "medium", "rest");
    const off = variant("false", "medium", "rest");
    expect(on?.bindings["surface.fill"]).toBe("color/action/primary/rest");
    expect(off?.bindings["surface.fill"]).toBe("color/background/sunken");
    expect(off?.bindings["border.color"]).toBe("color/border/strong");
    expect(on?.bindings["indicator.fill"]).toBe("color/action/primary/text");
    expect(off?.bindings["indicator.fill"]).toBe("color/border/strong");
    expect(on?.bindings["indicator.size"]).toBe("size/icon/medium");
    expect(on?.bindings["box.width"]).toBe("size/control/medium");
    expect(on?.paints?.["indicator.fill"]).toMatchObject({ hex: expect.stringMatching(/^#/) });
    expect(on?.geometry?.["indicator.size"]).toBe("20px");
    expect(on?.geometry?.["box.width"]).toBe("40px");
    expect(on?.notDrawn).toEqual({});
  });

  it("states the sxaltilo in the parity inventory: checked a boolean, its paints per checked", () => {
    const items = figmaPlanInventory(plan);
    expect(items.sxaltilo?.props.checked).toEqual(["boolean"]);
    expect(items.sxaltilo?.states).toEqual(["rest", "hover", "focus", "disabled"]);
    expect(items.sxaltilo?.values["indicator.fill@checked=true,size=medium,state=rest"]).toMatch(
      /^#[0-9a-f]{6}$/,
    );
  });
});

// Spec 010 ② (plan ② D-09, D-10): the fifth set, a checkbox, drawn in the toggle structure of the
// switch — G1 gives all four Wahl-Eroj the build "control + label". checked × size × state is
// 2 × 3 × 5; the indicator is a sign (the check mark, the same vector the web draws), its colour
// bound where checked and not drawn where the Skemo says none; the error text stands under the
// label with the word of the kampo's field, and the required mark is not drawn (Jugxo of the kampo).
describe("Figma plan for the markobutono (Spec 010 ②)", () => {
  const set = plan.components.find((component) => component.set === "markobutono");
  const markobutono = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "markobutono");
  const variant = (checked: string, size: string, state: string) =>
    set?.variants.find(
      (entry) =>
        entry.props.checked === checked && entry.props.size === size && entry.props.state === state,
    );

  it("plans a toggle of checked × size × state with the purpose, the word Option and the error text", () => {
    expect(set?.structure).toBe("toggle");
    expect(set?.properties).toEqual({
      checked: "BOOLEAN",
      required: "BOOLEAN",
      invalid: "BOOLEAN",
      size: ["small", "medium", "large"],
      disabled: "BOOLEAN",
      name: "TEXT",
      state: ["rest", "hover", "focus", "disabled", "invalid"],
    });
    expect(set?.variants).toHaveLength(2 * 3 * 5);
    expect(Object.keys(set?.variants[0]?.props ?? {})).toEqual(["checked", "size", "state"]);
    expect(set?.grid).toMatchObject({ rows: 6, columns: 5 });
    expect(set?.description).toBe(markobutono?.uzo?.purpose);
    expect(set?.label?.defaultValue).toBe("Option");
    expect(set?.texts).toEqual({ error: "Fehler" });
    expect(set?.sign).toMatch(/^<svg [^>]*viewBox="0 0 16 16"/);
    // The switch keeps its knob: no sign, no texts.
    const sxaltilo = plan.components.find((component) => component.set === "sxaltilo");
    expect(sxaltilo?.sign).toBeUndefined();
    expect(sxaltilo?.texts).toBeUndefined();
  });

  it("binds the box by checked and state, its border by state, the check mark where checked (G3)", () => {
    const on = variant("true", "medium", "rest");
    const off = variant("false", "medium", "rest");
    expect(on?.bindings["surface.fill"]).toBe("color/action/primary/rest");
    expect(off?.bindings["surface.fill"]).toBe("color/background/default");
    expect(on?.bindings["border.color"]).toBe("color/border/strong");
    expect(variant("false", "medium", "invalid")?.bindings["border.color"]).toBe(
      "color/status/danger/border",
    );
    expect(on?.bindings["indicator.color"]).toBe("color/action/primary/text");
    expect(on?.paints?.["indicator.color"]).toMatchObject({ hex: expect.stringMatching(/^#/) });
    expect(on?.bindings["indicator.size"]).toBe("size/icon/medium");
    expect(on?.geometry?.["indicator.size"]).toBe("20px");
    expect(on?.bindings["box.radius"]).toBe("radius/role/control");
    expect(on?.bindings["error.color"]).toBe("color/status/danger/text");
    expect(on?.hidden).toBeUndefined();
  });

  it("does not draw the check mark where indicator.color is none (unchecked)", () => {
    const off = variant("false", "small", "hover");
    expect(off?.bindings["indicator.color"]).toBeUndefined();
    expect(off?.paints?.["indicator.color"]).toBeUndefined();
    expect(off?.hidden).toEqual(["indicator"]);
  });

  it("names the required mark as not drawn with the kampo's Jugxo, nothing else", () => {
    expect(variant("true", "medium", "rest")?.notDrawn).toEqual({
      "required-mark.color": FIGMA_NOT_DRAWN["required-mark"],
    });
  });

  it("states the markobutono in the parity inventory: checked a boolean, the mark's paint only where checked", () => {
    const items = figmaPlanInventory(plan);
    expect(items.markobutono?.props.checked).toEqual(["boolean"]);
    expect(items.markobutono?.states).toEqual(["rest", "hover", "focus", "disabled", "invalid"]);
    expect(
      items.markobutono?.values["indicator.color@checked=true,size=medium,state=rest"],
    ).toMatch(/^#[0-9a-f]{6}$/);
    expect(
      items.markobutono?.values["indicator.color@checked=false,size=medium,state=rest"],
    ).toBeUndefined();
  });
});

// Spec 010 ③ (plan ③ D-07): the radio group in a structure of its own, choice — the question above
// its options, one row per option (ring → gap → circle with the dot, the option's label beside it),
// help and error below. Only the axes with a visible effect: size × state = 3 × 5. selected is the
// state of one option, not of the set (E7): every variant shows the three example options of the
// Vitrino, the first chosen; the bindings that follow selected stand per value of the key
// (entries), the circle filled and the dot drawn where chosen, not where not.
describe("Figma plan for the elekto (Spec 010 ③)", () => {
  const set = plan.components.find((component) => component.set === "elekto");
  const elekto = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "elekto");
  const variant = (size: string, state: string) =>
    set?.variants.find((entry) => entry.props.size === size && entry.props.state === state);

  it("plans a choice of size × state with the purpose, the word Frage, three options, help and error", () => {
    expect(set?.structure).toBe("choice");
    expect(set?.properties).toEqual({
      value: "TEXT",
      required: "BOOLEAN",
      invalid: "BOOLEAN",
      size: ["small", "medium", "large"],
      disabled: "BOOLEAN",
      name: "TEXT",
      orientation: ["vertical", "horizontal"],
      state: ["rest", "hover", "focus", "disabled", "invalid"],
    });
    expect(set?.variants).toHaveLength(3 * 5);
    expect(Object.keys(set?.variants[0]?.props ?? {})).toEqual(["size", "state"]);
    expect(set?.grid).toMatchObject({ rows: 3, columns: 5 });
    expect(set?.description).toBe(elekto?.uzo?.purpose);
    expect(set?.label?.defaultValue).toBe("Frage");
    expect(set?.texts).toEqual({ help: "Hinweis", error: "Fehler" });
    expect(set?.entry).toEqual({ key: "selected", texts: ["Eins", "Zwei", "Drei"], selected: 0 });
    expect(set?.sign).toMatch(/^<svg [^>]*viewBox="0 0 16 16"/);
    // The dot as a path: Figma imports one vector, as for the check mark (② D-09).
    expect(set?.sign).toContain('<path d="M8 4a4 4 0 1 1 0 8a4 4 0 1 1 0-8z"/>');
  });

  it("binds what follows selected per value of the key: the chosen circle filled, its dot drawn (G3, E7)", () => {
    const rest = variant("medium", "rest");
    expect(rest?.bindings["surface.fill"]).toBeUndefined();
    expect(rest?.entries?.true?.bindings["surface.fill"]).toBe("color/action/primary/rest");
    expect(rest?.entries?.false?.bindings["surface.fill"]).toBe("color/background/default");
    expect(rest?.entries?.true?.bindings["indicator.color"]).toBe("color/action/primary/text");
    expect(rest?.entries?.true?.paints?.["indicator.color"]).toMatchObject({
      hex: expect.stringMatching(/^#/),
    });
    expect(rest?.entries?.true?.hidden).toBeUndefined();
    expect(rest?.entries?.false?.bindings["indicator.color"]).toBeUndefined();
    expect(rest?.entries?.false?.hidden).toEqual(["indicator"]);
    expect(variant("medium", "hover")?.entries?.true?.bindings["surface.fill"]).toBe(
      "color/action/primary/hover",
    );
  });

  it("binds what does not follow selected once per variant: border, radius, sizes, gaps, texts", () => {
    const rest = variant("medium", "rest");
    expect(rest?.bindings["border.color"]).toBe("color/border/strong");
    expect(variant("small", "invalid")?.bindings["border.color"]).toBe(
      "color/status/danger/border",
    );
    expect(rest?.bindings["box.radius"]).toBe("radius/role/pill");
    expect(rest?.bindings["indicator.size"]).toBe("size/icon/medium");
    expect(rest?.geometry?.["indicator.size"]).toBe("20px");
    expect(rest?.bindings["box.gap"]).toBe("spacing/small");
    expect(rest?.bindings["options.gap"]).toBe("spacing/medium");
    expect(rest?.geometry?.["options.gap"]).toBe("8px");
    expect(rest?.bindings["option-label.typography"]).toBe("typography/body/1");
    expect(rest?.bindings["option-label.color"]).toBe("color/text/default");
    expect(rest?.bindings["label.typography"]).toBe("typography/label/1");
    expect(rest?.bindings["help.color"]).toBe("color/text/muted");
    expect(rest?.notDrawn).toEqual({ "required-mark.color": FIGMA_NOT_DRAWN["required-mark"] });
  });

  it("states the elekto in the parity inventory: size only, the circle and the dot per value of selected", () => {
    const items = figmaPlanInventory(plan);
    expect(items.elekto?.props.size).toEqual(["small", "medium", "large"]);
    expect(items.elekto?.props.selected).toBeUndefined();
    expect(items.elekto?.states).toEqual(["rest", "hover", "focus", "disabled", "invalid"]);
    expect(items.elekto?.values["surface.fill@selected=true,size=medium,state=rest"]).toMatch(
      /^#[0-9a-f]{6}$/,
    );
    expect(items.elekto?.values["surface.fill@selected=false,size=medium,state=rest"]).toMatch(
      /^#[0-9a-f]{6}$/,
    );
    expect(items.elekto?.values["indicator.color@selected=true,size=small,state=focus"]).toMatch(
      /^#[0-9a-f]{6}$/,
    );
    expect(
      items.elekto?.values["indicator.color@selected=false,size=small,state=focus"],
    ).toBeUndefined();
    expect(items.elekto?.values["options.gap@size=large,state=rest"]).toBe("8px");
  });
});

// Spec 010 ④ (plan ④ D-07, E3): the select is drawn as the field of the kampo — label above, the
// control with its text, help and error below — with the chevron at the end of the control; the
// field is closed and shows the prompt "Bitte wählen", the Vitrino's word. Its list is the
// platform's and not drawn (E3): no options in the set, no state open; the Manko stands in the plan.
describe("Figma plan for the elektilo (Spec 010 ④)", () => {
  const set = plan.components.find((component) => component.set === "elektilo");
  const kampoSet = plan.components.find((component) => component.set === "kampo");
  const elektilo = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "elektilo");
  const variant = (size: string, state: string) =>
    set?.variants.find((entry) => entry.props.size === size && entry.props.state === state);

  it("plans a closed field of size × state with the purpose, the word Auswahl, the prompt, help and error", () => {
    expect(set?.structure).toBe("field");
    expect(set?.properties).toEqual({
      value: "TEXT",
      placeholder: "TEXT",
      required: "BOOLEAN",
      invalid: "BOOLEAN",
      size: ["small", "medium", "large"],
      disabled: "BOOLEAN",
      name: "TEXT",
      // Spec 011 ① (D-09): the empty option is a property of the plan; the set shows the prompt.
      "empty-label": "TEXT",
      state: ["rest", "hover", "focus", "disabled", "invalid"],
    });
    expect(set?.variants).toHaveLength(3 * 5);
    expect(Object.keys(set?.variants[0]?.props ?? {})).toEqual(["size", "state"]);
    expect(set?.grid).toMatchObject({ rows: 3, columns: 5 });
    expect(set?.description).toBe(elektilo?.uzo?.purpose);
    expect(set?.label?.defaultValue).toBe("Auswahl");
    expect(set?.texts).toEqual({ text: "Bitte wählen", help: "Hinweis", error: "Fehler" });
    // The kampo keeps its example; only the select shows a prompt.
    expect(kampoSet?.texts).toEqual({ text: "Beispiel", help: "Hinweis", error: "Fehler" });
    // No options are drawn: the list is the platform's (E3).
    expect(set?.entry).toBeUndefined();
    expect(set?.sign).toMatch(/^<svg [^>]*viewBox="0 0 16 16"/);
    // The chevron as one filled path: Figma imports one vector, as for the check mark (② D-09).
    expect(set?.sign).toContain('<path d="M1.9 5.7 3.3 4.3 8 9l4.7-4.7 1.4 1.4L8 11.8z"/>');
    expect(kampoSet?.sign).toBeUndefined();
  });

  it("binds the field like the kampo's and the chevron in color.text.muted, sized from size.icon.*", () => {
    const rest = variant("medium", "rest");
    expect(rest?.bindings["text.typography"]).toBe("typography/body/1");
    expect(rest?.bindings["border.color"]).toBe("color/border/default");
    expect(variant("medium", "invalid")?.bindings["border.color"]).toBe(
      "color/status/danger/border",
    );
    expect(variant("medium", "disabled")?.bindings["surface.fill"]).toBe("color/background/sunken");
    expect(rest?.bindings["indicator.color"]).toBe("color/text/muted");
    expect(rest?.paints?.["indicator.color"]).toMatchObject({ hex: expect.stringMatching(/^#/) });
    expect(rest?.bindings["indicator.size"]).toBe("size/icon/medium");
    expect(rest?.geometry?.["indicator.size"]).toBe("20px");
    expect(variant("large", "rest")?.bindings["indicator.size"]).toBe("size/icon/large");
    expect(rest?.bindings["box.gap"]).toBe("spacing/small");
    expect(rest?.bindings["placeholder.color"]).toBe("color/text/subtle");
    expect(rest?.geometry?.["box.height"]).toBe("40px");
    // The closed field shows the prompt (placeholder), so the colour of a chosen option's text has
    // no node; the mark of a required select is the projection's — the kampo's Jugxo.
    expect(rest?.notDrawn).toEqual({
      "text.color": "jug_01M4S2R85WRAC5SV7CARH8RE7S",
      "required-mark.color": "jug_01M4S2R85WRAC5SV7CARH8RE7S",
    });
    expect(rest?.hidden).toBeUndefined();
  });

  it("states the elektilo in the parity inventory: size, five states, the chevron per variant", () => {
    const items = figmaPlanInventory(plan);
    expect(items.elektilo?.props.size).toEqual(["small", "medium", "large"]);
    expect(items.elektilo?.props.selected).toBeUndefined();
    expect(items.elektilo?.states).toEqual(["rest", "hover", "focus", "disabled", "invalid"]);
    expect(items.elektilo?.values["indicator.color@size=medium,state=rest"]).toMatch(
      /^#[0-9a-f]{6}$/,
    );
    expect(items.elektilo?.values["indicator.size@size=small,state=hover"]).toBe("16px");
    expect(items.elektilo?.values["placeholder.color@size=large,state=invalid"]).toMatch(
      /^#[0-9a-f]{6}$/,
    );
  });
});

// Spec 011 ② (G7, spec „tekstareo – Figma"): the text area is a textbox, so it is drawn as the
// field of the kampo — label above, ring → gap → control with its text, help and error below —
// with the axes kind × size × state: kind keys the text's typography (code → typography.code), so
// it is an axis of the variants like size. The control has no box.height (the kampo's has): it
// hugs its text, and the text shows the example followed by the empty lines of the default rows,
// so the area reads as one of four rows (the `rows` prop is a number, nothing to bind).
describe("Figma plan for the tekstareo (Spec 011 ②)", () => {
  const set = plan.components.find((component) => component.set === "tekstareo");
  const kampoSet = plan.components.find((component) => component.set === "kampo");
  const tekstareo = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "tekstareo");
  const variant = (kind: string, size: string, state: string) =>
    set?.variants.find(
      (entry) =>
        entry.props.kind === kind && entry.props.size === size && entry.props.state === state,
    );

  it("plans a field of kind × size × state with the purpose, the word Beschriftung and the field's texts", () => {
    expect(set?.structure).toBe("field");
    expect(set?.properties).toEqual({
      kind: ["text", "code"],
      value: "TEXT",
      // A number prop: Figma has no number property; the plan states the Skemo's kind.
      rows: "NUMBER",
      placeholder: "TEXT",
      required: "BOOLEAN",
      disabled: "BOOLEAN",
      readonly: "BOOLEAN",
      invalid: "BOOLEAN",
      size: ["small", "medium", "large"],
      name: "TEXT",
      state: ["rest", "hover", "focus", "disabled", "invalid"],
    });
    expect(set?.variants).toHaveLength(2 * 3 * 5);
    expect(Object.keys(set?.variants[0]?.props ?? {})).toEqual(["kind", "size", "state"]);
    expect(set?.grid).toMatchObject({ rows: 6, columns: 5 });
    expect(set?.description).toBe(tekstareo?.uzo?.purpose);
    expect(set?.label?.defaultValue).toBe("Beschriftung");
    // The example, then three empty lines: four rows, the Skemo's default of `rows`.
    expect(set?.texts).toEqual({ text: "Beispiel\n\n\n", help: "Hinweis", error: "Fehler" });
    expect(kampoSet?.texts?.text).toBe("Beispiel");
    expect(set?.sign).toBeUndefined();
    expect(set?.entry).toBeUndefined();
  });

  it("binds the text's typography by kind and size: the code role for code, the body roles for text; no height", () => {
    for (const size of ["small", "medium", "large"]) {
      expect(variant("code", size, "rest")?.bindings["text.typography"], size).toBe(
        "typography/code",
      );
    }
    expect(variant("text", "small", "rest")?.bindings["text.typography"]).toBe("typography/body/2");
    expect(variant("text", "medium", "rest")?.bindings["text.typography"]).toBe(
      "typography/body/1",
    );
    const rest = variant("text", "medium", "rest");
    expect(rest?.bindings["label.typography"]).toBe("typography/label/1");
    expect(rest?.bindings["border.color"]).toBe("color/border/default");
    expect(variant("code", "medium", "invalid")?.bindings["border.color"]).toBe(
      "color/status/danger/border",
    );
    expect(variant("text", "medium", "disabled")?.bindings["surface.fill"]).toBe(
      "color/background/sunken",
    );
    expect(rest?.bindings["box.height"]).toBeUndefined();
    expect(rest?.geometry?.["box.height"]).toBeUndefined();
    expect(rest?.geometry?.["box.inline-padding"]).toMatch(/px$/);
    expect(rest?.notDrawn).toEqual({
      "text.color": "jug_01M4S2R85WRAC5SV7CARH8RE7S",
      "required-mark.color": "jug_01M4S2R85WRAC5SV7CARH8RE7S",
    });
    expect(rest?.hidden).toBeUndefined();
    // The code role asks for the mono family in every brand (F30).
    expect(set?.fonts?.some((font) => /Mono/.test(font.family))).toBe(true);
  });

  it("states the tekstareo in the parity inventory: kind and size, five states, no height", () => {
    const items = figmaPlanInventory(plan);
    expect(items.tekstareo?.props.kind).toEqual(["text", "code"]);
    expect(items.tekstareo?.props.rows).toEqual(["number"]);
    expect(items.tekstareo?.props.size).toEqual(["small", "medium", "large"]);
    expect(items.tekstareo?.states).toEqual(["rest", "hover", "focus", "disabled", "invalid"]);
    expect(items.tekstareo?.values["placeholder.color@kind=code,size=medium,state=rest"]).toMatch(
      /^#[0-9a-f]{6}$/,
    );
    expect(items.tekstareo?.values["box.inline-padding@kind=text,size=small,state=rest"]).toMatch(
      /px$/,
    );
    expect(
      Object.keys(items.tekstareo?.values ?? {}).some((key) => key.startsWith("box.height@")),
    ).toBe(false);
  });
});

// Spec 011 ② (spec „dialogo – Figma", G7): a new structure `dialog` — the surface with heading,
// message and two actions, axes size × reason, one state. `open` keys no part and is a property
// of the plan; `size` binds the surface's width, `reason` the height of the reason field, and the
// keyword none at that height hides the field (hidden, like a colour that is none). The backdrop
// is not part of the variants: an example frame „mit Hintergrund" beside the set shows the default
// variant on it. The shadow of the surface is a composite token; the plan carries its fields per
// layer, resolved in the base combination, so the plugin can bind them to a drop shadow or write
// them where the API cannot bind.
describe("Figma plan for the dialogo (Spec 011 ②)", () => {
  const set = plan.components.find((component) => component.set === "dialogo");
  const dialogo = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "dialogo");
  const variant = (size: string, reason: string) =>
    set?.variants.find((entry) => entry.props.size === size && entry.props.reason === reason);

  it("plans a dialog of size × reason in one state, with the purpose, the word Entscheidung and the words of its slots", () => {
    expect(structureOf("dialog")).toBe("dialog");
    expect(set?.structure).toBe("dialog");
    expect(set?.properties).toEqual({
      open: "BOOLEAN",
      size: ["small", "medium"],
      reason: ["none", "optional", "required"],
      state: ["rest"],
    });
    expect(set?.variants).toHaveLength(2 * 3);
    expect(Object.keys(set?.variants[0]?.props ?? {})).toEqual(["size", "reason", "state"]);
    expect(set?.grid).toMatchObject({ rows: 6, columns: 1 });
    expect(set?.description).toBe(dialogo?.uzo?.purpose);
    expect(set?.label?.defaultValue).toBe("Entscheidung");
    expect(set?.texts).toEqual(DIALOG_TEXTS);
    expect(DIALOG_TEXTS).toEqual({
      message: "Nachricht",
      reason: "Begründung",
      "action-1": "Abbrechen",
      "action-2": "Bestätigen",
    });
    expect(set?.sign).toBeUndefined();
    expect(set?.entry).toBeUndefined();
    expect(set?.variants.every((entry) => entry.focusVisible === false)).toBe(true);
    expect(set?.variants.every((entry) => entry.radii === undefined)).toBe(true);
  });

  it("binds surface, border, heading, message, gaps and padding; the width by size, the reason's height by reason", () => {
    const rest = variant("small", "none");
    expect(rest?.bindings).toMatchObject({
      "backdrop.color": "color/backdrop",
      "surface.fill": "color/background/raised",
      "surface.radius": "radius/role/surface",
      "surface.width": "size/container/small",
      "surface.shadow": "elevation/shadow/modal",
      "border.color": "color/border/default",
      "border.width": "border/width/default",
      "heading.color": "color/text/default",
      "heading.typography": "typography/headline/4",
      "message.color": "color/text/default",
      "message.typography": "typography/body/1",
      "content.gap": "spacing/medium",
      "actions.gap": "spacing/small",
      "box.inline-padding": "spacing/large",
      "box.gap": "spacing/medium",
    });
    expect(variant("medium", "none")?.bindings["surface.width"]).toBe("size/container/medium");
    expect(rest?.geometry?.["surface.width"]).toBe("640px");
    expect(variant("medium", "none")?.geometry?.["surface.width"]).toBe("960px");
    expect(rest?.geometry?.["content.gap"]).toMatch(/px$/);
    expect(rest?.geometry?.["actions.gap"]).toMatch(/px$/);
    expect(rest?.geometry?.["box.inline-padding"]).toMatch(/px$/);
    expect(rest?.paints?.["surface.fill"]).toMatchObject({ hex: expect.stringMatching(/^#/) });
    expect(rest?.paints?.["heading.color"]).toMatchObject({ hex: expect.stringMatching(/^#/) });
    expect(rest?.paints?.["backdrop.color"]).toBeDefined();
    // none: no height, the reason field is hidden; optional and required: the large control.
    expect(rest?.bindings["reason.height"]).toBeUndefined();
    expect(rest?.geometry?.["reason.height"]).toBeUndefined();
    expect(rest?.hidden).toEqual(["reason"]);
    for (const reason of ["optional", "required"]) {
      const asked = variant("small", reason);
      expect(asked?.bindings["reason.height"], reason).toBe("size/control/large");
      expect(asked?.geometry?.["reason.height"], reason).toMatch(/px$/);
      expect(asked?.hidden, reason).toBeUndefined();
    }
    expect(rest?.notDrawn).toEqual({});
  });

  it("carries the modal shadow of the surface as fields per layer, resolved in the base combination", () => {
    const rest = variant("small", "none");
    expect(rest?.shadow?.part).toBe("surface");
    expect(rest?.shadow?.variable).toBe("elevation/shadow/modal");
    // komuna has two layers, ekzemplo one: the fields are numbered (F9).
    expect(rest?.shadow?.layers).toHaveLength(2);
    const [key, ambient] = rest?.shadow?.layers ?? [];
    expect(key?.fields).toEqual({
      color: "elevation/shadow/modal/1/color",
      offsetX: "elevation/shadow/modal/1/offset-x",
      offsetY: "elevation/shadow/modal/1/offset-y",
      blur: "elevation/shadow/modal/1/blur",
      spread: "elevation/shadow/modal/1/spread",
    });
    expect(key).toMatchObject({ offsetX: 0, offsetY: 12, blur: 32, spread: 0 });
    expect(key?.color).toMatchObject({ hex: expect.stringMatching(/^#[0-9a-f]{6}$/) });
    expect(ambient).toMatchObject({ offsetX: 0, offsetY: 0, blur: 8, spread: 0 });
    expect(ambient?.fields.color).toBe("elevation/shadow/modal/2/color");
    // Every field names a variable of the plan.
    const names = new Set(
      plan.collections.flatMap((collection) =>
        collection.variables.map((variableOfPlan) => variableOfPlan.name),
      ),
    );
    for (const layer of rest?.shadow?.layers ?? []) {
      for (const name of Object.values(layer.fields)) expect(names.has(name), name).toBe(true);
    }
    // Every variant carries it; no other set does.
    expect(set?.variants.every((entry) => entry.shadow !== undefined)).toBe(true);
    expect(butonoOf(plan.components)?.variants[0]?.shadow).toBeUndefined();
  });

  it("takes the heading's role for the font and the text case of a set without a label part", () => {
    const rest = variant("small", "none");
    expect(rest?.font).toEqual({ family: "Geist", style: "SemiBold" });
    expect(typeof rest?.textCase).toBe("string");
    expect(set?.fonts?.some((font) => font.style === "SemiBold")).toBe(true);
    expect(set?.fonts?.some((font) => font.style === "Regular")).toBe(true);
  });

  it('plans the example frame „mit Hintergrund" beside the set: the default variant on the backdrop', () => {
    expect(set?.example).toEqual({
      name: `dialogo – ${BACKDROP_EXAMPLE}`,
      variant: { size: "small", reason: "none", state: "rest" },
      backdrop: {
        binding: "color/backdrop",
        paint: expect.objectContaining({ hex: expect.any(String) }),
      },
      padding: plan.section?.gap,
    });
    expect(butonoOf(plan.components)?.example).toBeUndefined();
  });

  it("states the dialogo in the parity inventory: size and reason, the state rest, the measures and colours per variant", () => {
    const items = figmaPlanInventory(plan);
    expect(items.dialogo?.props).toEqual({
      open: ["boolean"],
      size: ["small", "medium"],
      reason: ["none", "optional", "required"],
    });
    expect(items.dialogo?.states).toEqual(["rest"]);
    expect(items.dialogo?.values["surface.width@reason=none,size=small,state=rest"]).toBe("640px");
    expect(items.dialogo?.values["surface.width@reason=required,size=medium,state=rest"]).toBe(
      "960px",
    );
    expect(items.dialogo?.values["reason.height@reason=required,size=small,state=rest"]).toMatch(
      /px$/,
    );
    expect(
      items.dialogo?.values["reason.height@reason=none,size=small,state=rest"],
    ).toBeUndefined();
    expect(items.dialogo?.values["surface.fill@reason=none,size=small,state=rest"]).toMatch(
      /^#[0-9a-f]{6}$/,
    );
    expect(items.dialogo?.values["heading.color@reason=optional,size=medium,state=rest"]).toMatch(
      /^#[0-9a-f]{6}$/,
    );
    expect(items.dialogo?.values["backdrop.color@reason=none,size=small,state=rest"]).toBeDefined();
    expect(items.dialogo?.values["border.width@reason=none,size=small,state=rest"]).toBe("1px");
  });

  // Abnahme Spec 011 ② (F-5, O-8): the confirming action is a butono of emphasis high, the
  // cancelling one of emphasis low (VITRINO_DIALOG_ACTIONS). The dialogo Skemo gives its actions
  // no roles — they are composed butono — so the plan reads the butono's own roles for
  // emphasis=high, intent=neutral, state=rest from the butono Skemo of the Modelo and hands them
  // to the plugin for the last stand-in: surface fill, label colour and the radius of the box.
  // The other stand-in keeps the dialog's look. Composed roles are no part of the dialogo and
  // stay out of its parity inventory.
  it("binds the confirming action (the last stand-in) to the butono's roles for emphasis high at rest; the cancelling one keeps the dialog's look", () => {
    expect(set?.composed).toEqual({
      "action-2": {
        ero: "butono",
        props: { emphasis: "high", intent: "neutral", state: "rest" },
        bindings: {
          "surface.fill": "color/action/primary/rest",
          "label.color": "color/action/primary/text",
          "box.radius": "radius/role/control",
        },
        paints: {
          "surface.fill": expect.objectContaining({ hex: expect.stringMatching(/^#/) }),
          "label.color": expect.objectContaining({ hex: expect.stringMatching(/^#/) }),
        },
      },
    });
    // Every binding names a variable of the plan (the butono binds them already).
    const names = new Set(
      plan.collections.flatMap((collection) =>
        collection.variables.map((variableOfPlan) => variableOfPlan.name),
      ),
    );
    for (const name of Object.values(set?.composed?.["action-2"]?.bindings ?? {})) {
      expect(names.has(name), name).toBe(true);
    }
    // The dialogo's own variants bind nothing of the butono (actions.gap is the dialog's own);
    // no other set composes.
    for (const entry of set?.variants ?? []) {
      expect(Object.keys(entry.bindings).some((key) => key.startsWith("action-"))).toBe(false);
      expect(Object.keys(entry.paints ?? {}).some((key) => key.startsWith("action-"))).toBe(false);
    }
    expect(plan.components.filter((component) => component.composed !== undefined)).toHaveLength(1);
    const items = figmaPlanInventory(plan);
    expect(
      Object.keys(items.dialogo?.values ?? {}).filter((key) => key.startsWith("action-")),
    ).toEqual([]);
  });
});

// Spec 011 ③ (spec „insigno", G2, G7; plan ③ D-14): a badge is static text with the role generic,
// drawn as a structure of its own — the pill (surface fill, border, the radius of the box, the
// minimum height and the inline padding by size) with one text, the label property, in the role
// of the text part. Axes intent × size, one state (G2). The slot description is hidden
// (hidden: true): spoken, never drawn — no word of it in the set. The text part is the label here,
// so the kampo's release of the typed text (B-2) does not apply: its colour is drawn.
describe("Figma plan for the insigno (Spec 011 ③)", () => {
  const set = plan.components.find((component) => component.set === "insigno");
  const insigno = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "insigno");
  const variant = (intent: string, size: string) =>
    set?.variants.find((entry) => entry.props.intent === intent && entry.props.size === size);

  it("plans a badge of intent × size in one state, with the purpose and the word Status; nothing of the hidden slot", () => {
    expect(structureOf("generic")).toBe("badge");
    expect(set?.structure).toBe("badge");
    expect(set?.properties).toEqual({
      intent: ["neutral", "info", "success", "warning", "danger"],
      size: ["small", "medium"],
      state: ["rest"],
    });
    expect(set?.variants).toHaveLength(5 * 2);
    expect(Object.keys(set?.variants[0]?.props ?? {})).toEqual(["intent", "size", "state"]);
    expect(set?.grid).toMatchObject({ rows: 10, columns: 1 });
    expect(set?.description).toBe(insigno?.uzo?.purpose);
    expect(set?.label?.defaultValue).toBe("Status");
    expect(set?.texts).toBeUndefined();
    expect(set?.sign).toBeUndefined();
    expect(set?.toggles).toBeUndefined();
    expect(set?.example).toBeUndefined();
    expect(
      set?.variants.every((entry) => entry.focusVisible === false && entry.radii === undefined),
    ).toBe(true);
  });

  it("binds the pill by intent and size and draws the text's colour: the text is the label, not a typed text", () => {
    const rest = variant("neutral", "medium");
    expect(rest?.bindings).toEqual({
      "surface.fill": "color/background/sunken",
      "border.color": "color/border/default",
      "border.width": "border/width/default",
      "text.color": "color/text/subtle",
      "text.typography": "typography/label/2",
      "box.height": "size/icon/large",
      "box.inline-padding": "spacing/small",
      "box.radius": "radius/role/pill",
    });
    expect(variant("danger", "small")?.bindings).toMatchObject({
      "surface.fill": "color/status/danger/subtle",
      "border.color": "color/status/danger/border",
      "text.color": "color/status/danger/text",
      "box.height": "size/icon/medium",
      "box.inline-padding": "spacing/xsmall",
    });
    expect(Object.keys(rest?.paints ?? {}).sort()).toEqual([
      "border.color",
      "surface.fill",
      "text.color",
    ]);
    expect(Object.keys(rest?.geometry ?? {}).sort()).toEqual([
      "border.width",
      "box.height",
      "box.inline-padding",
      "box.radius",
    ]);
    expect(rest?.notDrawn).toEqual({});
    expect(rest?.hidden).toBeUndefined();
    expect(rest?.stroke).toBeUndefined();
    expect(rest?.font).toEqual({ family: "Geist", style: "Medium" });
    expect(typeof rest?.textCase).toBe("string");
  });

  it("states the insigno in the parity inventory: intent and size, the state rest, colours and measures per variant", () => {
    const items = figmaPlanInventory(plan);
    expect(items.insigno?.props).toEqual({
      intent: ["neutral", "info", "success", "warning", "danger"],
      size: ["small", "medium"],
    });
    expect(items.insigno?.states).toEqual(["rest"]);
    expect(items.insigno?.values["text.color@intent=neutral,size=medium,state=rest"]).toMatch(
      /^#[0-9a-f]{6}/,
    );
    expect(items.insigno?.values["surface.fill@intent=info,size=small,state=rest"]).toMatch(
      /^#[0-9a-f]{6}/,
    );
    expect(items.insigno?.values["border.color@intent=danger,size=small,state=rest"]).toMatch(
      /^#[0-9a-f]{6}/,
    );
    expect(items.insigno?.values["box.height@intent=neutral,size=small,state=rest"]).toMatch(/px$/);
    expect(items.insigno?.values["box.radius@intent=neutral,size=small,state=rest"]).toMatch(/px$/);
    expect(items.insigno?.values["border.width@intent=neutral,size=small,state=rest"]).toBe("1px");
  });
});

// Spec 011 ③ (spec „avizo", G2, G4, G7; plan ③ D-14): a notice has the role status and no
// indicator, so it is drawn as a notice — the surface (a row) whose stroke at the inline start is
// the accent, the texts in a column (heading, the message as the label property, details, the
// actions as a placeholder) and the dismiss frame at the end. Axis intent, one state: hover and
// focus belong to the composed dismiss butono (G2). dismissible keys no part and is no axis; it
// is a BOOLEAN property of the set that shows the dismiss part. The words of heading and details
// are the Vitrino's slot words (F-5).
describe("Figma plan for the avizo (Spec 011 ③)", () => {
  const set = plan.components.find((component) => component.set === "avizo");
  const avizo = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "avizo");
  const variant = (intent: string) => set?.variants.find((entry) => entry.props.intent === intent);

  it("plans a notice of intent in one state; dismissible a BOOLEAN that shows the dismiss part; the word Meldung and the words of heading and details", () => {
    expect(structureOf("status")).toBe("notice");
    expect(structureOf("status", ["surface", "accent", "heading", "message", "dismiss"])).toBe(
      "notice",
    );
    expect(set?.structure).toBe("notice");
    expect(set?.properties).toEqual({
      intent: ["info", "success", "warning", "danger"],
      dismissible: "BOOLEAN",
      state: ["rest"],
    });
    expect(set?.variants).toHaveLength(4);
    expect(Object.keys(set?.variants[0]?.props ?? {})).toEqual(["intent", "state"]);
    expect(set?.grid).toMatchObject({ rows: 4, columns: 1 });
    expect(set?.description).toBe(avizo?.uzo?.purpose);
    expect(set?.label?.defaultValue).toBe("Meldung");
    expect(set?.texts).toEqual({ heading: "Überschrift", details: "Einzelheit" });
    expect(set?.toggles).toEqual([
      { property: "dismissible", part: "dismiss", defaultValue: false },
    ]);
    expect(set?.sign).toBeUndefined();
    expect(set?.example).toBeUndefined();
    expect(set?.variants.every((entry) => entry.focusVisible === false)).toBe(true);
  });

  it("binds surface and accent by intent, the three texts, the gaps, the dismiss size and the padding; draws them all", () => {
    const info = variant("info");
    expect(info?.bindings).toEqual({
      "surface.fill": "color/status/info/weak",
      "accent.color": "color/status/info/border",
      "accent.width": "border/width/strong",
      "heading.color": "color/text/default",
      "heading.typography": "typography/label/1",
      "message.color": "color/text/default",
      "message.typography": "typography/body/1",
      "details.color": "color/text/default",
      "details.typography": "typography/caption",
      "actions.gap": "spacing/small",
      "dismiss.size": "size/control/small",
      "box.inline-padding": "spacing/medium",
      "box.gap": "spacing/small",
      "box.radius": "radius/role/surface",
    });
    expect(variant("danger")?.bindings).toMatchObject({
      "surface.fill": "color/status/danger/weak",
      "accent.color": "color/status/danger/border",
    });
    expect(Object.keys(info?.paints ?? {}).sort()).toEqual([
      "accent.color",
      "details.color",
      "heading.color",
      "message.color",
      "surface.fill",
    ]);
    expect(Object.keys(info?.geometry ?? {}).sort()).toEqual([
      "accent.width",
      "actions.gap",
      "box.gap",
      "box.inline-padding",
      "box.radius",
      "dismiss.size",
    ]);
    expect(info?.notDrawn).toEqual({});
    expect(info?.hidden).toBeUndefined();
    expect(info?.stroke).toBeUndefined();
    // The message is the label: its role (body.1) gives the font and the case of the set.
    expect(info?.font).toEqual({ family: "Geist", style: "Regular" });
    expect(set?.fonts?.some((font) => font.family === "Geist" && font.style === "Medium")).toBe(
      true,
    );
    expect(set?.fonts?.some((font) => font.family === "Archivo" && font.style === "Black")).toBe(
      true,
    );
  });

  it("states the avizo in the parity inventory: intent, dismissible a boolean, the state rest, surface and accent per intent", () => {
    const items = figmaPlanInventory(plan);
    expect(items.avizo?.props).toEqual({
      intent: ["info", "success", "warning", "danger"],
      dismissible: ["boolean"],
    });
    expect(items.avizo?.states).toEqual(["rest"]);
    expect(items.avizo?.values["surface.fill@intent=info,state=rest"]).toMatch(/^#[0-9a-f]{6}/);
    expect(items.avizo?.values["accent.color@intent=danger,state=rest"]).toMatch(/^#[0-9a-f]{6}/);
    expect(items.avizo?.values["message.color@intent=success,state=rest"]).toMatch(/^#[0-9a-f]{6}/);
    expect(items.avizo?.values["accent.width@intent=info,state=rest"]).toMatch(/px$/);
    expect(items.avizo?.values["dismiss.size@intent=info,state=rest"]).toMatch(/px$/);
    expect(items.avizo?.values["box.inline-padding@intent=warning,state=rest"]).toMatch(/px$/);
  });
});

// Spec 011 ③ (spec „plenstato", G2, G4, G7; plan ③ D-14): a loading or empty state shares the
// role status with the notice; its indicator tells them apart, so it is drawn as a state — a
// column with the border as a stroke (dashed where the binding is stroke.dashed, none where it is
// none: a term the plan states per variant, written like the underline, since Figma binds no dash
// pattern), the arc of the web as its sign (hidden where its colour is none), the text as the
// label property, and the actions as a placeholder hidden where the Skemo's constraint forbids
// them (an action while loading). kind is a duty without a default. The motion part binds its two
// variables and draws nothing, like the butono's: no inventory compares a duration.
describe("Figma plan for the plenstato (Spec 011 ③)", () => {
  const set = plan.components.find((component) => component.set === "plenstato");
  const plenstato = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "plenstato");
  const variant = (kind: string) => set?.variants.find((entry) => entry.props.kind === kind);

  it("plans a state of kind in one state, with the purpose, the word Zustand (the structure's, not the role's) and the arc as its sign", () => {
    expect(structureOf("status", ["surface", "border", "indicator", "text", "motion"])).toBe(
      "state",
    );
    expect(set?.structure).toBe("state");
    expect(set?.properties).toEqual({ kind: ["loading", "empty"], state: ["rest"] });
    expect(set?.variants).toHaveLength(2);
    expect(Object.keys(set?.variants[0]?.props ?? {})).toEqual(["kind", "state"]);
    expect(set?.grid).toMatchObject({ rows: 2, columns: 1 });
    expect(set?.description).toBe(plenstato?.uzo?.purpose);
    expect(set?.label?.defaultValue).toBe("Zustand");
    expect(set?.sign).toBe(STATE_SIGN);
    expect(STATE_SIGN).toContain('d="M8 2a6 6 0 1 1-6 6"');
    expect(STATE_SIGN).toContain('stroke="currentColor"');
    expect(STATE_SIGN).toContain('width="16" height="16"');
    expect(set?.texts).toBeUndefined();
    expect(set?.toggles).toBeUndefined();
    expect(set?.example).toBeUndefined();
    expect(set?.variants.every((entry) => entry.focusVisible === false)).toBe(true);
  });

  it("binds border, indicator, text and motion; the stroke dashed for empty and none for loading; the indicator's colour none for empty", () => {
    const loading = variant("loading");
    const empty = variant("empty");
    expect(loading?.bindings).toEqual({
      "surface.radius": "radius/role/surface",
      "border.color": "color/border/subtle",
      "border.width": "border/width/default",
      "indicator.size": "size/icon/small",
      "indicator.color": "color/status/info/basic",
      "text.color": "color/text/muted",
      "text.typography": "typography/body/1",
      "actions.gap": "spacing/small",
      "motion.duration": "motion/duration/slow",
      "motion.easing": "motion/easing/standard",
      "box.inline-padding": "spacing/large",
      "box.gap": "spacing/small",
    });
    expect(empty?.bindings).toMatchObject({ "border.stroke": "stroke/dashed" });
    expect(empty?.bindings["indicator.color"]).toBeUndefined();
    expect(loading?.bindings["border.stroke"]).toBeUndefined();
    // The stroke as a term per variant, with the pattern the plugin writes (a number, not bound).
    expect(loading?.stroke).toEqual({ part: "border", style: "none", dashPattern: [] });
    expect(empty?.stroke).toMatchObject({ part: "border", style: "dashed" });
    expect(empty?.stroke?.dashPattern).toHaveLength(2);
    expect(empty?.stroke?.dashPattern.every((length) => length > 0)).toBe(true);
    // Hidden: the indicator where its colour is none; the actions where the constraint forbids
    // them (slot:actions filled ⇒ kind empty).
    expect(empty?.hidden).toEqual(["indicator"]);
    expect(loading?.hidden).toEqual(["actions"]);
    expect(Object.keys(loading?.paints ?? {}).sort()).toEqual([
      "border.color",
      "indicator.color",
      "text.color",
    ]);
    expect(Object.keys(empty?.paints ?? {}).sort()).toEqual(["border.color", "text.color"]);
    expect(Object.keys(loading?.geometry ?? {}).sort()).toEqual([
      "actions.gap",
      "border.width",
      "box.gap",
      "box.inline-padding",
      "indicator.size",
      "surface.radius",
    ]);
    expect(loading?.notDrawn).toEqual({});
    expect(loading?.font).toEqual({ family: "Geist", style: "Regular" });
    // The stroke token reaches the plan as a STRING variable; its value is the term.
    const dashed = plan.collections
      .flatMap((collection) => collection.variables)
      .find((variableOfPlan) => variableOfPlan.name === "stroke/dashed");
    expect(dashed?.type).toBe("STRING");
    expect(Object.values(dashed?.values ?? {}).length).toBeGreaterThan(0);
    expect(Object.values(dashed?.values ?? {}).every((value) => value === "dashed")).toBe(true);
  });

  it("states the plenstato in the parity inventory: kind, the state rest, the indicator's colour while loading only, no motion", () => {
    const items = figmaPlanInventory(plan);
    expect(items.plenstato?.props).toEqual({ kind: ["loading", "empty"] });
    expect(items.plenstato?.states).toEqual(["rest"]);
    expect(items.plenstato?.values["indicator.color@kind=loading,state=rest"]).toMatch(
      /^#[0-9a-f]{6}/,
    );
    expect(items.plenstato?.values["indicator.color@kind=empty,state=rest"]).toBeUndefined();
    expect(items.plenstato?.values["border.color@kind=empty,state=rest"]).toMatch(/^#[0-9a-f]{6}/);
    expect(items.plenstato?.values["text.color@kind=loading,state=rest"]).toMatch(/^#[0-9a-f]{6}/);
    expect(items.plenstato?.values["indicator.size@kind=loading,state=rest"]).toMatch(/px$/);
    expect(items.plenstato?.values["border.width@kind=empty,state=rest"]).toBe("1px");
    expect(
      Object.keys(items.plenstato?.values ?? {}).some(
        (key) => key.startsWith("motion.") || key.startsWith("border.stroke"),
      ),
    ).toBe(false);
  });
});

// Spec 011 ④ (spec „mezurilo", G2, G4, G7; plan ④ D-14): a meter has the role meter and one state
// (G2), so it is drawn as a structure of its own — a column with the label (the label property),
// the track (its fill, radius and height) holding the fill frame whose colour follows intent and
// whose width is the share of the Vitrino's value example (66 of 0 … 100), and the value text
// (the Vitrino's slot word). The unknown value is the example frame beside the set: the track with
// the dashed stroke of the part unknown, no fill, the text „nicht geprüft" (G4, Regulo
// meter-text-states-value). value, min and max are numbers: NUMBER properties, no axis.
describe("Figma plan for the mezurilo (Spec 011 ④)", () => {
  const set = plan.components.find((component) => component.set === "mezurilo");
  const mezurilo = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "mezurilo");
  const variant = (intent: string) => set?.variants.find((entry) => entry.props.intent === intent);

  it("plans a meter of intent in one state, with the purpose, the word Messwert, the value text, the share and the unknown example", () => {
    expect(structureOf("meter")).toBe("meter");
    expect(set?.structure).toBe("meter");
    expect(set?.properties).toEqual({
      value: "NUMBER",
      min: "NUMBER",
      max: "NUMBER",
      intent: ["neutral", "success", "warning", "danger"],
      state: ["rest"],
    });
    expect(set?.variants).toHaveLength(4);
    expect(Object.keys(set?.variants[0]?.props ?? {})).toEqual(["intent", "state"]);
    expect(set?.grid).toMatchObject({ rows: 4, columns: 1 });
    expect(set?.description).toBe(mezurilo?.uzo?.purpose);
    expect(set?.label?.defaultValue).toBe("Messwert");
    // The value text is the Vitrino's slot word (one source for both pictures, F-5).
    expect(set?.texts).toEqual({ "value-text": VITRINO_SLOT_TEXTS["value-text"] });
    expect(set?.texts?.["value-text"]).toBe("66 % von 3 prüfbaren");
    // The share of the track the fill takes: the Vitrino's value example in the Skemo's range.
    expect(set?.meter).toEqual({ share: 0.66 });
    // The example beside the set: the default variant with the unknown value.
    expect(set?.example).toEqual({
      name: `mezurilo – ${UNKNOWN_EXAMPLE}`,
      variant: { intent: "neutral", state: "rest" },
      padding: plan.section?.gap,
      texts: { "value-text": METER_UNKNOWN_TEXT },
    });
    expect(UNKNOWN_EXAMPLE).toBe("unbekannt");
    expect(METER_UNKNOWN_TEXT).toBe("nicht geprüft");
    expect(set?.sign).toBeUndefined();
    expect(set?.toggles).toBeUndefined();
    expect(set?.variants.every((entry) => entry.focusVisible === false)).toBe(true);
  });

  it("binds track, fill by intent, the unknown stroke, label and value text, and the gap; the stroke dashed for the unknown value", () => {
    const neutral = variant("neutral");
    expect(neutral?.bindings).toEqual({
      "track.fill": "color/background/sunken",
      "track.radius": "radius/role/pill",
      "track.height": "spacing/medium",
      // Neutral is color.border.strong, not color.brand.fill: the brand fill measured 1,3:1 on
      // the track in ekzemplo (Modelo of ④).
      "fill.color": "color/border/strong",
      "fill.radius": "radius/role/pill",
      "unknown.stroke": "stroke/dashed",
      "unknown.color": "color/border/default",
      "unknown.width": "border/width/default",
      "label.color": "color/text/default",
      "label.typography": "typography/label/1",
      "value-text.color": "color/text/subtle",
      "value-text.typography": "typography/label/2",
      "box.gap": "spacing/small",
    });
    expect(variant("success")?.bindings["fill.color"]).toBe("color/status/success/border");
    expect(variant("warning")?.bindings["fill.color"]).toBe("color/status/warning/border");
    expect(variant("danger")?.bindings["fill.color"]).toBe("color/status/danger/border");
    // The stroke of the unknown value as a term per variant, with the pattern the plugin writes
    // on the example only (a number, not bound, like the plenstato's).
    expect(neutral?.stroke).toMatchObject({ part: "unknown", style: "dashed" });
    expect(neutral?.stroke?.dashPattern).toHaveLength(2);
    expect(neutral?.stroke?.dashPattern.every((length) => length > 0)).toBe(true);
    expect(Object.keys(neutral?.paints ?? {}).sort()).toEqual([
      "fill.color",
      "label.color",
      "track.fill",
      "unknown.color",
      "value-text.color",
    ]);
    expect(Object.keys(neutral?.geometry ?? {}).sort()).toEqual([
      "box.gap",
      "fill.radius",
      "track.height",
      "track.radius",
      "unknown.width",
    ]);
    expect(neutral?.notDrawn).toEqual({});
    expect(neutral?.hidden).toBeUndefined();
    // The label is the label part: its role (label.1) gives the font and the case of the set.
    expect(neutral?.font).toBeDefined();
    expect(set?.fonts?.length ?? 0).toBeGreaterThan(0);
  });

  it("states the mezurilo in the parity inventory: value, min and max numbers, intent, the state rest, the fill's colour per intent", () => {
    const items = figmaPlanInventory(plan);
    expect(items.mezurilo?.props).toEqual({
      value: ["number"],
      min: ["number"],
      max: ["number"],
      intent: ["neutral", "success", "warning", "danger"],
    });
    expect(items.mezurilo?.states).toEqual(["rest"]);
    expect(items.mezurilo?.values["fill.color@intent=neutral,state=rest"]).toMatch(/^#[0-9a-f]{6}/);
    expect(items.mezurilo?.values["fill.color@intent=danger,state=rest"]).toMatch(/^#[0-9a-f]{6}/);
    expect(items.mezurilo?.values["track.fill@intent=success,state=rest"]).toMatch(/^#[0-9a-f]{6}/);
    expect(items.mezurilo?.values["unknown.color@intent=neutral,state=rest"]).toMatch(
      /^#[0-9a-f]{6}/,
    );
    expect(items.mezurilo?.values["value-text.color@intent=warning,state=rest"]).toMatch(
      /^#[0-9a-f]{6}/,
    );
    expect(items.mezurilo?.values["track.height@intent=neutral,state=rest"]).toMatch(/px$/);
    expect(items.mezurilo?.values["unknown.width@intent=neutral,state=rest"]).toBe("1px");
    expect(
      Object.keys(items.mezurilo?.values ?? {}).some((key) => key.startsWith("unknown.stroke")),
    ).toBe(false);
  });
});

// Spec 011 ④ (spec „tabelo", G2, G4, G7; plan ④ D-14): a table has the role table; its states
// belong to the sort button in the head (E3). It is drawn as a structure of its own — the caption
// (the label property) above the region (border, radius) holding the head row (its fill) and
// three body rows, three columns each: a row header, a text and a numeric cell; the first head
// cell holds the sort button (fill by state, radius, the focus ring in the focus variant) with
// the head text and the chevron of the select (sort-indicator). Axes density × state. The words
// are the Vitrino's table (one source for both pictures). caption-hidden keys no part and is no
// axis: a BOOLEAN property of the set that hides the caption — connected to its visibility, which
// Figma shows when true, so the plan says the prop hides.
describe("Figma plan for the tabelo (Spec 011 ④)", () => {
  const set = plan.components.find((component) => component.set === "tabelo");
  const tabelo = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "tabelo");
  const variant = (density: string, state: string) =>
    set?.variants.find((entry) => entry.props.density === density && entry.props.state === state);

  it("plans a table of density × state with the purpose, the word Beschriftung, the Vitrino's table, the chevron and caption-hidden as a BOOLEAN that hides the caption", () => {
    expect(structureOf("table")).toBe("table");
    expect(set?.structure).toBe("table");
    expect(set?.properties).toEqual({
      density: ["comfortable", "compact"],
      "caption-hidden": "BOOLEAN",
      sort: "TEXT",
      direction: ["ascending", "descending"],
      state: ["rest", "hover", "focus"],
    });
    expect(set?.variants).toHaveLength(6);
    expect(Object.keys(set?.variants[0]?.props ?? {})).toEqual(["density", "state"]);
    expect(set?.grid).toMatchObject({ rows: 2, columns: 3 });
    expect(set?.description).toBe(tabelo?.uzo?.purpose);
    expect(set?.label?.defaultValue).toBe("Beschriftung");
    // Head + 3 rows × 3 columns, the last numeric, the first sorted ascending (the spec's set).
    expect(set?.table).toEqual({
      head: ["Name", "Status", "Anzahl"],
      rows: [
        ["Barrierefreiheit", "gültig", "0"],
        ["Datenschutz", "Entwurf", "3"],
        ["Sicherheit", "in Prüfung", "1"],
      ],
      numeric: [2],
      sorted: 0,
      direction: "ascending",
    });
    // The chevron of the select is the sort indicator (one shape for both pictures).
    expect(set?.sign).toBe(signOf("combobox", "16"));
    expect(set?.sign).toContain('d="M1.9 5.7');
    expect(set?.toggles).toEqual([
      { property: "caption-hidden", part: "caption", defaultValue: false, hides: true },
    ]);
    expect(set?.texts).toBeUndefined();
    expect(set?.example).toBeUndefined();
    expect(set?.variants.map((entry) => entry.focusVisible)).toEqual([
      false,
      false,
      true,
      false,
      false,
      true,
    ]);
  });

  it("binds head, cells by density, row header, border, region, the sort button by state, its indicator and the focus ring; draws them all", () => {
    const rest = variant("comfortable", "rest");
    expect(rest?.bindings).toEqual({
      // The caption is the label part (the default slot caption has a part of its name).
      "caption.color": "color/text/default",
      "caption.typography": "typography/label/1",
      "head.fill": "color/background/sunken",
      "head.color": "color/text/default",
      "head.typography": "typography/label/1",
      "cell.color": "color/text/default",
      "cell.typography": "typography/body/2",
      "cell.inline-padding": "spacing/medium",
      "cell.height": "size/control/large",
      "row-header.typography": "typography/label/1",
      "border.color": "color/border/subtle",
      "border.width": "border/width/default",
      "region.radius": "radius/role/surface",
      "sort.fill": "color/action/tertiary/rest",
      "sort.color": "color/text/default",
      "sort.radius": "radius/role/control",
      "sort-indicator.size": "size/icon/small",
      "sort-indicator.color": "color/text/subtle",
      "focus-ring.ring": "focus/ring",
      "focus-ring.offset": "focus/offset",
      "focus-ring.color": "color/focus/inner",
    });
    expect(variant("compact", "rest")?.bindings).toMatchObject({
      "cell.inline-padding": "spacing/small",
      "cell.height": "size/control/small",
    });
    expect(variant("comfortable", "hover")?.bindings["sort.fill"]).toBe(
      "color/action/tertiary/hover",
    );
    expect(variant("comfortable", "focus")?.bindings["sort.fill"]).toBe(
      "color/action/tertiary/rest",
    );
    expect(Object.keys(rest?.paints ?? {}).sort()).toEqual([
      "border.color",
      "caption.color",
      "cell.color",
      "focus-ring.color",
      "focus-ring.ring",
      "head.color",
      "head.fill",
      "sort-indicator.color",
      "sort.color",
      "sort.fill",
    ]);
    expect(Object.keys(rest?.geometry ?? {}).sort()).toEqual([
      "border.width",
      "cell.height",
      "cell.inline-padding",
      "focus-ring.offset",
      "region.radius",
      "sort-indicator.size",
      "sort.radius",
    ]);
    expect(rest?.notDrawn).toEqual({});
    expect(rest?.hidden).toBeUndefined();
    expect(rest?.stroke).toBeUndefined();
    // The ring around the sort button grows from the button's radius (F32), like the butono's.
    expect(rest?.radii).toEqual({
      "focus-gap": "radius/focus/gap",
      "focus-ring": "radius/focus/ring",
    });
    // The caption is the label part: its role (label.1) gives the font and the case of the set.
    expect(rest?.font).toBeDefined();
    expect(set?.fonts?.length ?? 0).toBeGreaterThan(0);
  });

  it("states the tabelo in the parity inventory: density, caption-hidden a boolean, sort a string, direction, three states, the sort fill per state", () => {
    const items = figmaPlanInventory(plan);
    expect(items.tabelo?.props).toEqual({
      density: ["comfortable", "compact"],
      "caption-hidden": ["boolean"],
      sort: ["string"],
      direction: ["ascending", "descending"],
    });
    expect(items.tabelo?.states).toEqual(["rest", "hover", "focus"]);
    expect(items.tabelo?.values["sort.fill@density=comfortable,state=rest"]).toBeDefined();
    expect(items.tabelo?.values["sort.fill@density=compact,state=hover"]).toBeDefined();
    expect(items.tabelo?.values["head.fill@density=comfortable,state=rest"]).toMatch(
      /^#[0-9a-f]{6}/,
    );
    expect(items.tabelo?.values["caption.color@density=comfortable,state=rest"]).toMatch(
      /^#[0-9a-f]{6}/,
    );
    expect(items.tabelo?.values["cell.inline-padding@density=comfortable,state=rest"]).toMatch(
      /px$/,
    );
    expect(items.tabelo?.values["cell.inline-padding@density=compact,state=rest"]).toMatch(/px$/);
    expect(items.tabelo?.values["cell.height@density=compact,state=focus"]).toMatch(/px$/);
    expect(items.tabelo?.values["border.width@density=comfortable,state=rest"]).toBe("1px");
    expect(items.tabelo?.values["sort-indicator.size@density=comfortable,state=rest"]).toMatch(
      /px$/,
    );
  });
});

// Spec 011 ④ (spec „atributlisto", G2, G7; plan ④ D-14): a key-value list has the role list and
// one state (G2). It is drawn as a structure of its own — the list (its gap) with three entries,
// the Vitrino's words (F-5): in columns each entry a row, term then value, the gap the box's
// inline padding; stacked each entry a column, the gap the box's gap. An empty value shows the
// dash. The label prop is the accessible name, never seen: the set declares the label property
// with the word of the role and draws no text node for it.
describe("Figma plan for the atributlisto (Spec 011 ④)", () => {
  const set = plan.components.find((component) => component.set === "atributlisto");
  const atributlisto = prepared.input.modelo.eroj.find(
    (entry) => entry.ero.name === "atributlisto",
  );
  const variant = (layout: string) => set?.variants.find((entry) => entry.props.layout === layout);

  it("plans a list of layout in one state, with the purpose, the word Angaben and the Vitrino's entries", () => {
    expect(structureOf("list")).toBe("list");
    expect(set?.structure).toBe("list");
    expect(set?.properties).toEqual({
      layout: ["columns", "stacked"],
      label: "TEXT",
      state: ["rest"],
    });
    expect(set?.variants).toHaveLength(2);
    expect(Object.keys(set?.variants[0]?.props ?? {})).toEqual(["layout", "state"]);
    expect(set?.grid).toMatchObject({ rows: 2, columns: 1 });
    expect(set?.description).toBe(atributlisto?.uzo?.purpose);
    expect(set?.label?.defaultValue).toBe("Angaben");
    expect(set?.entries).toEqual([
      { term: "Version", value: "3" },
      { term: "Verantwortlich", value: "Team Fundamento" },
      { term: "Gültig seit", value: LIST_EMPTY_VALUE },
    ]);
    expect(set?.entries).toEqual(
      VITRINO_LIST_ENTRIES.map(([term, value]) => ({
        term,
        value: value === "" ? LIST_EMPTY_VALUE : value,
      })),
    );
    expect(LIST_EMPTY_VALUE).toBe("–");
    expect(set?.texts).toBeUndefined();
    expect(set?.sign).toBeUndefined();
    expect(set?.toggles).toBeUndefined();
    expect(set?.example).toBeUndefined();
    expect(set?.variants.every((entry) => entry.focusVisible === false)).toBe(true);
  });

  it("binds term and value, the list's gap, the box's gap and its inline padding by layout; draws them all", () => {
    const columns = variant("columns");
    expect(columns?.bindings).toEqual({
      "term.color": "color/text/muted",
      "term.typography": "typography/label/2",
      "value.color": "color/text/default",
      "value.typography": "typography/body/2",
      "list.gap": "spacing/large",
      "box.gap": "spacing/small",
      "box.inline-padding": "spacing/large",
    });
    expect(variant("stacked")?.bindings["box.inline-padding"]).toBe("spacing/xsmall");
    expect(Object.keys(columns?.paints ?? {}).sort()).toEqual(["term.color", "value.color"]);
    expect(Object.keys(columns?.geometry ?? {}).sort()).toEqual([
      "box.gap",
      "box.inline-padding",
      "list.gap",
    ]);
    expect(columns?.notDrawn).toEqual({});
    expect(columns?.hidden).toBeUndefined();
    expect(columns?.stroke).toBeUndefined();
    expect(columns?.font).toBeUndefined();
    expect(set?.fonts?.length ?? 0).toBeGreaterThan(0);
  });

  it("states the atributlisto in the parity inventory: layout, label a string, the state rest, term and value colours, the gaps", () => {
    const items = figmaPlanInventory(plan);
    expect(items.atributlisto?.props).toEqual({
      layout: ["columns", "stacked"],
      label: ["string"],
    });
    expect(items.atributlisto?.states).toEqual(["rest"]);
    expect(items.atributlisto?.values["term.color@layout=columns,state=rest"]).toMatch(
      /^#[0-9a-f]{6}/,
    );
    expect(items.atributlisto?.values["value.color@layout=stacked,state=rest"]).toMatch(
      /^#[0-9a-f]{6}/,
    );
    expect(items.atributlisto?.values["list.gap@layout=columns,state=rest"]).toMatch(/px$/);
    expect(items.atributlisto?.values["box.inline-padding@layout=columns,state=rest"]).toMatch(
      /px$/,
    );
    expect(items.atributlisto?.values["box.inline-padding@layout=stacked,state=rest"]).toMatch(
      /px$/,
    );
    expect(items.atributlisto?.values["box.inline-padding@layout=columns,state=rest"]).not.toBe(
      items.atributlisto?.values["box.inline-padding@layout=stacked,state=rest"],
    );
  });
});
