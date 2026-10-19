// The generated development plugin (Spec 003 T016; plan D-12): it applies plan.json idempotently.
// Run against the Plugin-API double, so the proof needs no Figma.
//
// plugin-variablen.test.ts (Nachlese 5 ①, O-5): the variables and paints: alpha, modes, the default mode, the deckkraft, foreign collections.

import { describe, expect, it } from "vitest";
import { type FigmaPlan, resolveFigmaPlan } from "./figma.js";
import {
  butonoOf,
  descendant,
  double_shown,
  files,
  MODEL_FONTS,
  modelDouble,
  pageNodes,
  plan,
  repo,
  repoFiles,
  repoPlan,
  run,
  TITOLO_CASE_WARNING,
} from "./plugin-test-helpers.js";
import {
  type DoubleCollection,
  type DoubleNode,
  type DoubleVariable,
  figmaDouble,
} from "./test-doubles/plugin.js";

describe("the paint carries the alpha of its token (F8)", () => {
  // One brand: the decision is unambiguous in every mode. With a second brand whose tertiary fill
  // is opaque the plan says `alphaVariesByMode`, and the guard refuses the binding — see the
  // Figma-side test.
  const variantOf = (props: Record<string, string>) =>
    butonoOf(repoPlan.components)?.variants.find((entry) =>
      Object.entries(props).every(([key, value]) => entry.props[key] === value),
    );

  type Paint = { opacity?: number; boundVariables?: unknown } | undefined;

  /**
   * The three paints of one variant. The fix touches every colour binding, so every colour binding
   * is measured: `surface.fill` on the control, `border.color` on its strokes and `label.color` on
   * the label. Measuring only the fill would leave the other two "proved by construction" — which
   * is no proof (maintainer, 2026-09-20).
   */
  async function paintsOf(props: Record<string, string>) {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((child) => child.name === "butono");
    const name = Object.entries(variantOf(props)?.props ?? {})
      .map(([key, value]) => `${key}=${value}`)
      .join(", ");
    const variant = set?.children.find((child) => child.name === name);
    const control = descendant(variant, "control");
    const label = descendant(control, "label");
    const paints = (node: typeof control, field: string) =>
      ((node?.properties[field] ?? []) as Paint[])[0];
    return {
      fill: paints(control, "fills"),
      stroke: paints(control, "strokes"),
      label: paints(label, "fills"),
    };
  }

  it("a fully transparent fill is not opaque, and keeps its binding", async () => {
    const { fill } = await paintsOf({ emphasis: "low", intent: "neutral", state: "rest" });
    expect(fill?.opacity).toBe(0);
    expect(fill?.boundVariables).toBeDefined();
  });

  it("an overlay carries its deckkraft", async () => {
    const { fill } = await paintsOf({ emphasis: "low", intent: "neutral", state: "hover" });
    expect(fill?.opacity).toBe(0.08);
  });

  it("an opaque fill stays opaque", async () => {
    const { fill } = await paintsOf({ emphasis: "high", intent: "neutral", state: "rest" });
    expect(fill?.opacity).toBe(1);
  });

  // `border.color` is the second of the two parts every tertiary role is bound to, and it carries
  // the same three cases as the fill.
  it("the border of a variant carries the same deckkraft as its fill", async () => {
    const rest = await paintsOf({ emphasis: "low", intent: "neutral", state: "rest" });
    expect(rest.stroke?.opacity).toBe(0);
    expect(rest.stroke?.boundVariables).toBeDefined();
    const hover = await paintsOf({ emphasis: "low", intent: "neutral", state: "hover" });
    expect(hover.stroke?.opacity).toBe(0.08);
    expect(hover.stroke?.boundVariables).toBeDefined();
    const primary = await paintsOf({ emphasis: "high", intent: "neutral", state: "rest" });
    expect(primary.stroke?.opacity).toBe(1);
  });

  // The label is the third bound paint. No label colour is translucent today — that is what the
  // measurement says, and it would catch the day a label arrives at deckkraft 1 by accident.
  it("the label carries its deckkraft and keeps its binding", async () => {
    const tertiary = await paintsOf({ emphasis: "low", intent: "neutral", state: "rest" });
    expect(tertiary.label?.opacity).toBe(1);
    expect(tertiary.label?.boundVariables).toBeDefined();
    const disabled = await paintsOf({ emphasis: "low", intent: "neutral", state: "disabled" });
    expect(disabled.label?.opacity).toBe(1);
    expect(disabled.label?.boundVariables).toBeDefined();
  });
});

// F13 (Abnahme M1, Maintainer 2026-09-21): Jede Variante trug Figmas Vorgabefüllung #FFFFFF 100 %,
// die das Plugin nie entfernt hat — sie stammt nicht aus dem Modell und deckte die durchsichtige
// tertiäre Aktion wieder zu. Das Double legte Knoten ohne jede Vorgabe an und war genau an dieser
// Stelle blind (jug_01M3094ZC6F3XZ1H0MWQZ62MYV). Es lernt deshalb zuerst die Vorgaben des Werkzeugs;
// danach sichert der Test zu, dass nach dem Lauf keine Fläche mehr eine Vorgabe trägt.
//
// Geltungsbereich dieses Schritts: Flächen (`fills`, `strokes`). Die Vorgabegröße 100 × 100 und der
// leere Beschriftungstext sind F11 und werden dort derselben Zusicherung unterstellt.
describe("no paint in the file that the plan did not put there (F13)", () => {
  const WHITE = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];

  it("knows the tool's defaults: a new frame and component are white, a text is black", () => {
    const double = modelDouble();
    const api = double.figma as {
      createFrame: () => DoubleNode;
      createComponent: () => DoubleNode;
      createText: () => DoubleNode;
    };
    expect(api.createFrame().properties.fills).toEqual(WHITE);
    expect(api.createComponent().properties.fills).toEqual(WHITE);
    expect(api.createText().properties.fills).toEqual([
      { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
    ]);
  });

  it("leaves no variant, control or label holding a paint the tool put there", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.untouchedDefaults(["fills", "strokes"])).toEqual([]);
  });

  it("gives the variant itself no fill, so a transparent control shows what lies beneath", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = pageNodes(double).find((child) => child.name === "butono");
    for (const variant of set?.children ?? []) {
      expect(variant.properties.fills, variant.name).toEqual([]);
    }
  });

  // Der Vorgabewert muss auch in einer Datei verschwinden, die ein älteres Plugin angelegt hat.
  it("clears the default on the second run too", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.untouchedDefaults(["fills", "strokes"])).toEqual([]);
  });
});

// F19 (Abnahme M1, Maintainer 2026-09-22): Der Standardmodus jeder Sammlung ist der Standardwert
// der Dimension aus dem Modelo. Gemessen: density zeigte „Automatisch (compact)", weil compact der
// erste Modus war; richtig ist default. In Figma ist der Standardmodus der erste Modus
// (`defaultModeId` ist nur lesbar), also entscheidet die Reihenfolge.
describe("the default mode of every collection is the Modelo's default (F19)", () => {
  const defaults = new Map(
    (repo.ok ? repo.input.modelo.dimensioj : []).map((dimensio) => [
      dimensio.name,
      dimensio.default,
    ]),
  );

  it("names the default in the plan, and puts it first", () => {
    const collections = repoPlan.collections.filter((collection) => defaults.has(collection.name));
    expect(collections).toHaveLength(6);
    for (const collection of collections) {
      expect(collection.defaultMode, collection.name).toBe(defaults.get(collection.name));
      expect(collection.modes[0], collection.name).toBe(defaults.get(collection.name));
    }
  });

  it("leaves every collection with that default mode in the file", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const ofDimensioj = double.collections.filter((collection) => defaults.has(collection.name));
    expect(ofDimensioj).toHaveLength(6);
    for (const collection of ofDimensioj) {
      const mode = collection.modes.find((entry) => entry.modeId === collection.defaultModeId);
      expect(mode?.name, collection.name).toBe(defaults.get(collection.name));
    }
  });

  // Eine Datei, die ein älteres Plugin anlegte, behält ihren ersten Modus — die Reihenfolge lässt
  // sich dort nicht ändern. Der Lauf misst die Wirkung und sagt es.
  it("says so when a file keeps another default mode", async () => {
    const double = modelDouble();
    const api = double.figma as {
      variables: {
        createVariableCollection: (name: string) => (typeof double.collections)[number];
      };
    };
    const old = api.variables.createVariableCollection("density");
    old.renameMode(old.defaultModeId, "compact");
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as { warnings: string[] };
    const text = report.warnings.join(" ");
    expect(text).toContain("density");
    expect(text).toContain("compact");
    expect(text).toContain("default");
  });
});

// F22 (Messung Thorsten, Datei hEWHvBz7uRNrpYSau52OUN, 2026-09-22): Nach Lauf 2 war das ganze Set
// schwarz. Per Plugin-API gelesen: Set fills[0] SOLID {0,0,0}, Deckkraft 1, gebunden an
// color/background/canvas; control fills[0] {0,0,0}, gebunden an primary/rest; strokes[0]
// {0,0,0}, Deckkraft 1, OHNE Bindung; label fills[0] {0,0,0}, gebunden an primary/text. Die
// Variablenwerte selbst waren richtig. Figma rendert also die Farbe, die im Paint steht, nicht die
// Bindung; nur setBoundVariableForPaint löst die Farbe in die Kopie auf. Das Double bildet das ab.
describe("a paint shows the colour it holds; only setBoundVariableForPaint resolves it (F22)", () => {
  async function paintedFrame(double: ReturnType<typeof figmaDouble>) {
    const api = double.figma as {
      createFrame: () => DoubleNode;
      variables: {
        createVariableCollection: (name: string) => (typeof double.collections)[number];
        createVariable: (
          name: string,
          c: unknown,
          type: string,
        ) => (typeof double.variables)[number];
        setBoundVariableForPaint: (
          paint: unknown,
          field: string,
          v: unknown,
        ) => Record<string, unknown>;
      };
    };
    const collection = api.variables.createVariableCollection("farben");
    const variable = api.variables.createVariable("color/probo", collection, "COLOR");
    variable.setValueForMode(collection.defaultModeId, { r: 0.2, g: 0.4, b: 0.6, a: 1 });
    const frame = api.createFrame();
    return { api, variable, frame };
  }

  it("resolves the variable's colour into the copy that setBoundVariableForPaint returns", async () => {
    const { api, variable } = await paintedFrame(modelDouble());
    const bound = api.variables.setBoundVariableForPaint(
      { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
      "color",
      variable,
    );
    expect(bound.color).toEqual({ r: 0.2, g: 0.4, b: 0.6 });
    expect(bound.boundVariables).toMatchObject({ color: { id: variable.id } });
  });

  it("renders a raw paint with a binding in the colour it holds, and reads it back like Figma", async () => {
    const { frame, variable } = await paintedFrame(modelDouble());
    Object.assign(frame, {
      fills: [
        {
          type: "SOLID",
          color: { r: 0, g: 0, b: 0 },
          boundVariables: { color: { type: "VARIABLE_ALIAS", id: variable.id } },
        },
      ],
    });
    const [fill] = frame.properties.fills as {
      color: unknown;
      visible: boolean;
      opacity: number;
      blendMode: string;
    }[];
    expect(fill?.color).toEqual({ r: 0, g: 0, b: 0 });
    expect([fill?.visible, fill?.opacity, fill?.blendMode]).toEqual([true, 1, "NORMAL"]);
    expect(double_shown(frame, "fills")).toEqual({ r: 0, g: 0, b: 0 });
  });
});

describe("every bound paint shows the plan's colour after the first and the second run (F22)", () => {
  type Paint = {
    color: { r: number; g: number; b: number };
    opacity: number;
    visible: boolean;
    boundVariables?: { color?: { id: string; name?: string } };
  };
  const paintsOf = (node: DoubleNode | undefined, field: "fills" | "strokes") =>
    (node?.properties[field] ?? []) as Paint[];
  const hex = (c: { r: number; g: number; b: number }) =>
    `#${[c.r, c.g, c.b]
      .map((v) =>
        Math.round(v * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")}`;

  // The plan's paint per part and variant, in the default mode: hex and opacity (F8).
  const planned = (props: Record<string, string>) =>
    butonoOf(repoPlan.components)?.variants.find((v) =>
      Object.entries(props).every(([k, val]) => v.props[k] === val),
    )?.paints ?? {};

  it("matches hex, opacity and binding on both runs — fills, strokes and the label", async () => {
    const double = modelDouble();
    for (const run of [1, 2]) {
      await new Function(
        "figma",
        `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
      )(double.figma);
      const set = pageNodes(double).find((child) => child.name === "butono");
      for (const [props, name] of [
        [{ emphasis: "high", intent: "neutral", size: "large", state: "rest" }, "high"],
        [{ emphasis: "low", intent: "neutral", size: "medium", state: "hover" }, "low"],
      ] as const) {
        const variant = set?.children.find(
          (child) =>
            child.name ===
            Object.entries(props)
              .map(([k, v]) => `${k}=${v}`)
              .join(", "),
        );
        const control = descendant(variant, "control");
        const label = descendant(control, "label");
        const plan = planned(props);
        for (const [node, field, part] of [
          [control, "fills", "surface.fill"],
          [control, "strokes", "border.color"],
          [label, "fills", "label.color"],
        ] as const) {
          const [paint] = paintsOf(node, field);
          const expected = plan[part] as { hex: string; opacity: number } | undefined;
          const where = `run ${run}, ${name} ${part}`;
          if (paint === undefined) throw new Error(`${where}: no paint`);
          expect(hex(paint.color), where).toBe(expected?.hex);
          expect(paint.opacity, where).toBe(expected?.opacity);
          expect(paint.visible, where).toBe(true);
          expect(paint.boundVariables?.color?.id, where).toBeDefined();
        }
      }
      const [ground] = paintsOf(set, "fills");
      if (ground === undefined) throw new Error(`run ${run}: no ground`);
      expect(ground.boundVariables?.color?.name, `run ${run} ground`).toBe(
        "color/background/canvas",
      );
      expect(hex(ground.color), `run ${run} ground`).not.toBe("#000000");
    }
  });

  it("rewrites no paint on the second run when variable, opacity and visibility hold", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const written = double.counts.writes;
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.counts.writes - written).toBe(0);
  });

  it("reports the paints of the set and of the first and last variant, raw", async () => {
    const double = modelDouble();
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as {
      components: {
        layout: {
          paints: {
            set: { fills: unknown[]; strokes: unknown[] };
            variant: Record<string, { fills: unknown[]; strokes: unknown[] }>;
            last: Record<string, { fills: unknown[]; strokes: unknown[] }>;
          };
        };
      }[];
    };
    const paints = butonoOf(report.components)?.layout.paints;
    expect(paints?.set.fills[0]).toMatchObject({ opacity: 1, variable: "color/background/canvas" });
    expect(paints?.set.fills[0]).toHaveProperty("color");
    expect(paints?.variant.control?.fills[0]).toMatchObject({
      variable: "color/action/primary/rest",
    });
    expect(paints?.variant.control?.strokes[0]).toHaveProperty("variable");
    expect(paints?.variant.label?.fills[0]).toHaveProperty("opacity");
    expect(paints?.last.control?.fills[0]).toMatchObject({ opacity: 0 });
  });

  // Figma kappt kopierte Konsolenzeilen bei 5 000 Zeichen: der Bericht kommt in Teilen unter 4 000.
  it("prints the report in parts under 4 000 characters, the headline with numbers first", async () => {
    const double = modelDouble();
    const lines: string[] = [];
    const module = new Function("figma", "console", `${repoFiles["figma/plugin/code.js"] ?? ""}`);
    await module(
      { ...double.figma, command: "run" },
      {
        log: (...parts: unknown[]) => lines.push(parts.map(String).join(" ")),
        error: () => undefined,
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    for (const line of lines) expect(line.length, line.slice(0, 60)).toBeLessThan(4000);
    const first = lines.find((line) => line.startsWith("{"));
    expect(JSON.parse(first ?? "{}")).toMatchObject({
      fundamento: expect.any(String),
      variables: expect.any(Number),
      warnings: [],
      // Spec 008: two sets; the ligilo has placement × size × state = 30 variants.
      components: [
        // Spec 015 ②: the alsxutilo has dropzone × state = 12 variants.
        { set: "alsxutilo", created: 12, updated: 0 },
        // Spec 014 ②: the apartigilo has orientation = 2 variants in one state.
        { set: "apartigilo", created: 2, updated: 0 },
        // Spec 011 ④: the atributlisto has layout = 3 variants in one state (auto since Spec 014 ①).
        { set: "atributlisto", created: 3, updated: 0 },
        // Spec 015 ③: the avataro has size = 3 variants in one state.
        { set: "avataro", created: 3, updated: 0 },
        // Spec 011 ③: the avizo has intent = 4 variants in one state (dismissible is no axis).
        { set: "avizo", created: 4, updated: 0 },
        { set: "butono", created: 72, updated: 0 },
        // Spec 011 ②: the dialogo has size × reason = 6 variants in one state.
        { set: "dialogo", created: 6, updated: 0 },
        // Spec 010 ④: the elektilo has size × state = 15 variants.
        { set: "elektilo", created: 15, updated: 0 },
        // Spec 010 ③: the elekto has size × state = 15 variants.
        { set: "elekto", created: 15, updated: 0 },
        // Spec 014 ⑤: the faldilo has open × state = 6 variants.
        { set: "faldilo", created: 6, updated: 0 },
        // Spec 014 ②: the ikono has name × size × intent = 255 variants in one state (Spec 015
        // ②: seventeen names with upload).
        { set: "ikono", created: 255, updated: 0 },
        // Spec 011 ③: the insigno has intent × size = 10 variants in one state.
        { set: "insigno", created: 10, updated: 0 },
        // Spec 009: the kampo has size × state = 18 variants.
        { set: "kampo", created: 18, updated: 0 },
        // Spec 015 ③: the karto has orientation = 2 variants in one state (an axis of its own).
        { set: "karto", created: 2, updated: 0 },
        // Spec 014 ⑤: the kompletigilo has size × expanded × state = 30 variants.
        { set: "kompletigilo", created: 30, updated: 0 },
        // Spec 014 ④: the konsileto has placement = 4 variants in one state (an axis of its own).
        { set: "konsileto", created: 4, updated: 0 },
        // Spec 011 ⑤: the langetaro has state = 4 variants (active is the state of one tab, E7;
        // label and selected are strings, no axis).
        { set: "langetaro", created: 4, updated: 0 },
        { set: "ligilo", created: 30, updated: 0 },
        // Spec 010 ②: the markobutono has checked × size × state = 30 variants.
        { set: "markobutono", created: 30, updated: 0 },
        // Spec 014 ④: the menuo has state = 4 variants (the states of an entry).
        { set: "menuo", created: 4, updated: 0 },
        // Spec 011 ④: the mezurilo has intent = 4 variants in one state (value, min, max are
        // numbers, no axis).
        { set: "mezurilo", created: 4, updated: 0 },
        // Spec 011 ⑤: the navigado has state = 3 variants (current is the state of one item, E7;
        // orientation keys no part and is no axis).
        { set: "navigado", created: 3, updated: 0 },
        // Spec 015 ①: the pagxigilo has 4 states, the spuro 3.
        { set: "pagxigilo", created: 4, updated: 0 },
        // Spec 011 ③: the plenstato has kind = 2 variants in one state.
        { set: "plenstato", created: 2, updated: 0 },
        // Spec 014 ②: the saltligilo has state = 2 variants (rest and focus).
        { set: "saltligilo", created: 2, updated: 0 },
        { set: "spuro", created: 3, updated: 0 },
        // Spec 010 ①: the sxaltilo has checked × size × state = 24 variants.
        { set: "sxaltilo", created: 24, updated: 0 },
        // Spec 014 ④: the sxvebilo has one variant (placement and open are no axes).
        { set: "sxvebilo", created: 1, updated: 0 },
        // Spec 011 ④: the tabelo has density × state = 6 variants (the states of the sort button).
        { set: "tabelo", created: 6, updated: 0 },
        // Spec 011 ②: the tekstareo has kind × size × state = 30 variants.
        { set: "tekstareo", created: 30, updated: 0 },
        // Spec 014 ③: the teksto has kind × size × emphasis = 15 variants, the titolo size = 7.
        { set: "teksto", created: 15, updated: 0 },
        { set: "titolo", created: 7, updated: 0 },
      ],
    });
    const json = lines
      .filter((line) => line.startsWith("{"))
      .map((line) => JSON.parse(line) as Record<string, unknown>);
    expect(json.some((part) => part.part === "layout")).toBe(true);
    expect(json.some((part) => part.part === "created")).toBe(true);
  });
});

// F27 (An P0, M2-Vorstufe): Die Marke ist ein Modus, und Modi je Sammlung sind in Figma begrenzt
// (Professional 10, Organization 20, Enterprise unbegrenzt; research §6.2, geprüft 2026-09-20).
// Ein Lauf, der mehr Aspektoj mitbringt, als die Sammlung tragen kann, darf nicht mit einem rohen
// Fehler abbrechen: Er sagt mit Zahlen, was nicht hineinpasst, und bringt den Rest zu Ende.
describe("the run says it when a collection has more modes than Figma allows (F27)", () => {
  /** A plan whose aspekto collection carries `count` brands, each an own mode. */
  function planWithAspektoj(count: number): FigmaPlan {
    const changed = JSON.parse(JSON.stringify(plan)) as FigmaPlan;
    const collection = changed.collections.find((candidate) => candidate.name === "aspekto");
    if (collection === undefined) throw new Error("no aspekto collection");
    const [first] = collection.modes;
    if (first === undefined) throw new Error("no mode");
    const names = [
      ...collection.modes,
      ...Array.from({ length: count - collection.modes.length }, (_, index) => `marko${index + 1}`),
    ];
    for (const variable of collection.variables) {
      const reference = variable.values[first];
      if (reference === undefined) throw new Error(`${variable.name} has no value in ${first}`);
      for (const mode of names) {
        if (variable.values[mode] === undefined) variable.values[mode] = reference;
      }
    }
    collection.modes = names;
    return changed;
  }

  const sourceOf = (changed: FigmaPlan) =>
    (files["figma/plugin/code.js"] ?? "").replace(
      /^const PLAN = .*$/m,
      `const PLAN = ${JSON.stringify(changed)};`,
    );

  it("warns with the numbers and keeps going when the modes do not fit", async () => {
    const double = figmaDouble({ fonts: MODEL_FONTS, modeLimit: 10 });
    const report = (await new Function(
      "figma",
      `${sourceOf(planWithAspektoj(12))}\nreturn applyPlan();`,
    )(double.figma)) as { warnings: string[]; components: { set: string; created: string[] }[] };
    const warning = report.warnings.find((entry) => entry.includes("aspekto"));
    expect(warning).toContain("12");
    expect(warning).toContain("10");
    // The run does not stop at the limit: the component set is built either way.
    expect(butonoOf(report.components)?.created).toHaveLength(72);
  });

  it("names the Aspektoj that did not reach the file", async () => {
    const double = figmaDouble({ fonts: MODEL_FONTS, modeLimit: 10 });
    const report = (await new Function(
      "figma",
      `${sourceOf(planWithAspektoj(12))}\nreturn applyPlan();`,
    )(double.figma)) as { warnings: string[] };
    expect(report.warnings.join(" ")).toContain("marko9");
    expect(report.warnings.join(" ")).toContain("marko10");
    const collection = double.collections.find((candidate) => candidate.name === "aspekto");
    expect(collection?.modes).toHaveLength(10);
  });

  it("says nothing about the limit while the brands fit", async () => {
    const double = figmaDouble({ fonts: MODEL_FONTS, modeLimit: 10 });
    const report = (await new Function(
      "figma",
      `${sourceOf(planWithAspektoj(10))}\nreturn applyPlan();`,
    )(double.figma)) as { warnings: string[] };
    expect(report.warnings).toEqual([TITOLO_CASE_WARNING]);
  });
});

// F27: Die Messung in Figma soll ohne Ablesen möglich sein. Der Bericht nennt deshalb je Sammlung
// die Modi, die der Plan vorsieht, und die, die nach dem Lauf in der Datei stehen — Rohdaten, aus
// denen „aspekto hat zwei Modi" folgt, ohne die Oberfläche zu befragen.
describe("the report names the modes of every collection (F27)", () => {
  interface ModeReport {
    collection: string;
    planned: string[];
    actual: string[];
    default: string;
  }

  async function modesOf(double: ReturnType<typeof figmaDouble>, source: string) {
    const result = (await new Function("figma", `${source}\nreturn applyPlan();`)(
      double.figma,
    )) as {
      modes: ModeReport[];
    };
    return result.modes;
  }

  it("names planned and applied modes per collection, the brand among them", async () => {
    const double = modelDouble();
    const modes = await modesOf(double, files["figma/plugin/code.js"] ?? "");
    const aspekto = modes.find((entry) => entry.collection === "aspekto");
    expect(aspekto?.planned).toEqual(["komuna", "ekzemplo"]);
    expect(aspekto?.actual).toEqual(["komuna", "ekzemplo"]);
    expect(aspekto?.default).toBe("komuna");
    expect(modes.map((entry) => entry.collection)).toEqual(
      plan.collections
        .filter((collection) => collection.variables.length > 0)
        .map((collection) => collection.name),
    );
  });

  it("shows a file whose modes differ from the plan", async () => {
    const double = modelDouble();
    const api = double.figma as {
      variables: {
        createVariableCollection: (name: string) => (typeof double.collections)[number];
      };
    };
    const old = api.variables.createVariableCollection("aspekto");
    old.renameMode(old.defaultModeId, "ekzemplo");
    const modes = await modesOf(double, files["figma/plugin/code.js"] ?? "");
    const aspekto = modes.find((entry) => entry.collection === "aspekto");
    expect(aspekto?.planned).toEqual(["komuna", "ekzemplo"]);
    expect(aspekto?.actual).toEqual(["ekzemplo", "komuna"]);
    expect(aspekto?.default).toBe("ekzemplo");
  });

  it("puts the modes into the printed report, in the headline part", async () => {
    const double = modelDouble();
    const lines: string[] = [];
    const module = new Function("figma", "console", `${files["figma/plugin/code.js"] ?? ""}`);
    await module(
      { ...double.figma, command: "run" },
      {
        log: (...parts: unknown[]) => lines.push(parts.map(String).join(" ")),
        error: () => undefined,
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    const first = lines.find((line) => line.startsWith("{"));
    expect(first?.length ?? 0).toBeLessThan(4000);
    const headline = JSON.parse(first ?? "{}") as { modes?: ModeReport[] };
    expect(headline.modes?.find((entry) => entry.collection === "aspekto")?.actual).toEqual([
      "komuna",
      "ekzemplo",
    ]);
  });
});

// F34 (An P0, Maintainer 2026-09-23, gemessen in aRrK0MFZri9D5sE0j3NooQ): Der Bericht nannte für
// denselben Knoten in Lauf 1 `opacity: 0` und in Lauf 2 `opacity: 1`, ohne Eingriff dazwischen —
// und `#000000 α1` gibt es in keiner der acht Kombinationen. Ein gebundener Paint behält die Farbe,
// mit der er zuletzt geschrieben wurde, und eine eigene Deckkraft; wer beide zusammen abliest,
// bekommt ein Paar, das kein Modus zeigt. Gemessen wird deshalb der aufgelöste Zustand.
describe("every paint the report names exists somewhere (F34)", () => {
  /** Every colour the plan can resolve for `variable`, as "<hex> <alpha>". */
  const shownSomewhere = (variable: string) => {
    const out = new Set<string>();
    for (const aspekto of ["komuna", "ekzemplo"]) {
      for (const scheme of ["light", "dark"]) {
        for (const contrast of ["default", "high"]) {
          const value = resolveFigmaPlan(plan, {
            aspekto,
            "color-scheme": scheme,
            contrast,
          })[variable] as { r: number; g: number; b: number; a: number } | undefined;
          if (value !== undefined) out.add(paintKey(value.r, value.g, value.b, value.a));
        }
      }
    }
    return out;
  };
  const paintKey = (r: number, g: number, b: number, a: number) =>
    `${[r, g, b].map((channel) => Math.round(channel * 255)).join(",")} a${Math.round(a * 100) / 100}`;

  async function paintsAfter(runs: number) {
    const double = modelDouble();
    let result: { components: { layout?: { paints?: Record<string, unknown> } }[] } = {
      components: [],
    };
    for (let index = 0; index < runs; index++) {
      result = (await new Function(
        "figma",
        `${files["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
      )(double.figma)) as typeof result;
    }
    const found: { where: string; variable: string; key: string }[] = [];
    const walk = (where: string, value: unknown) => {
      if (Array.isArray(value)) {
        for (const paint of value) {
          const entry = paint as {
            variable?: string | null;
            color?: { r: number; g: number; b: number };
            opacity?: number;
          };
          if (typeof entry.variable !== "string" || entry.color === undefined) continue;
          found.push({
            where,
            variable: entry.variable,
            key: paintKey(entry.color.r, entry.color.g, entry.color.b, entry.opacity ?? 1),
          });
        }
        return;
      }
      if (typeof value === "object" && value !== null) {
        for (const [key, inner] of Object.entries(value)) walk(`${where}.${key}`, inner);
      }
    };
    for (const component of result.components) walk("paints", component.layout?.paints);
    return found;
  }

  it.each([1, 2])("names only paints a mode can show, after run %i", async (runs) => {
    const paints = await paintsAfter(runs);
    expect(paints.length).toBeGreaterThan(4);
    const nowhere = paints.filter((paint) => !shownSomewhere(paint.variable).has(paint.key));
    expect(nowhere.map((paint) => `${paint.where} ${paint.variable} = ${paint.key}`)).toEqual([]);
  });
});

// F35 (An P0, Maintainer 2026-09-23): Nach beiden Läufen trug das Set
// explicitVariableModes = { aspekto: ekzemplo, contrast: default } — wer die Bibliothek öffnet,
// sieht die Beispielmarke als „den" Knopf. Und es erklärt F34 mit, weil zwei Läufe dann in
// verschiedenen Kontexten lesen.
describe("the set is left on no mode of its own (F35)", () => {
  async function setAfter(runs: number) {
    const double = modelDouble();
    for (let index = 0; index < runs; index++) await run(double);
    const set = pageNodes(double).find((child) => child.type === "COMPONENT_SET");
    return { double, set };
  }

  it.each([1, 2])("leaves the set with no explicit mode after run %i", async (runs) => {
    const { set } = await setAfter(runs);
    expect(set?.explicitVariableModes).toEqual({});
  });

  it("clears a mode a previous run or a designer left on the set", async () => {
    const { double, set } = await setAfter(1);
    const aspekto = double.collections.find((collection) => collection.name === "aspekto");
    const ekzemplo = aspekto?.modes.find((mode) => mode.name === "ekzemplo");
    if (aspekto === undefined || ekzemplo === undefined) throw new Error("no ekzemplo mode");
    set?.setExplicitVariableModeForCollection(aspekto, ekzemplo.modeId);
    expect(set?.explicitVariableModes).not.toEqual({});
    await run(double);
    expect(set?.explicitVariableModes).toEqual({});
  });
});

// F43 (An P0, Maintainer 2026-10-06): Zwei Läufe in derselben Datei meldeten für die Füllung des
// Knotens control der Variante tertiary/large/loading dieselbe Variable und dieselbe Farbe, aber
// Deckkraft 0 nach dem ersten und 1 nach dem zweiten Lauf. Zugesichert wird beides, was eine Zeile
// "opacity" im Bericht bedeuten kann: die Deckkraft, die der Paint im Knoten hält, und der Wert,
// den der Bericht meldet — nach jedem der beiden Läufe.
// Grün seit #29 (F36); Befund vom 06.10. als Messung mit einem Plugin vor #29 erklärt, seit #40
// nennt jeder Lauf seinen Build.
describe("the tertiary fill keeps its deckkraft over two runs (F43)", () => {
  const props = { emphasis: "low", intent: "neutral", size: "large", state: "loading" };
  const name = Object.entries(props)
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");
  type StoredPaint = { opacity?: number; boundVariables?: { color?: { id: string } } };
  type ReportedPaint = { opacity: number; resolved: boolean; stored: { opacity: number } };

  it("is the last variant of the plan, the one the report shows, and planned at deckkraft 0", () => {
    const variants = butonoOf(plan.components)?.variants ?? [];
    expect(variants.at(-1)?.props).toEqual(props);
    expect(variants.at(-1)?.paints?.["surface.fill"]).toEqual({ hex: "#000000", opacity: 0 });
    expect(variants.at(-1)?.paints?.["border.color"]).toEqual({ hex: "#000000", opacity: 0 });
  });

  it("holds deckkraft 0 on fill and stroke after the first and the second run", async () => {
    const double = modelDouble();
    for (const index of [1, 2]) {
      const report = (await new Function(
        "figma",
        `${files["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
      )(double.figma)) as {
        components: {
          layout: { paints: { last: Record<string, { fills: unknown[]; strokes: unknown[] }> } };
        }[];
      };
      const set = pageNodes(double).find((child) => child.name === "butono");
      const control = descendant(
        set?.children.find((child) => child.name === name),
        "control",
      );
      const reported = butonoOf(report.components)?.layout.paints.last.control;
      for (const field of ["fills", "strokes"] as const) {
        const where = `run ${index}, control ${field}`;
        const held = ((control?.properties[field] ?? []) as StoredPaint[])[0];
        expect(held?.boundVariables?.color?.id, where).toBeDefined();
        expect(held?.opacity, `${where}, held`).toBe(0);
        const line = (reported?.[field] ?? [])[0] as ReportedPaint | undefined;
        expect(line?.opacity, `${where}, reported`).toBe(0);
        expect(line?.stored.opacity, `${where}, reported stored`).toBe(0);
      }
    }
  });
});

// Sammlungswechsel (Maintainer, Messung 2026-10-09 in f10b-2, Plugin 7f57ee2): Die Datei hielt 364
// Variablen in `fundamento`, gebaut mit dem Ein-Marken-Plan; der Zwei-Marken-Plan legt sie in
// `aspekto` und lässt `fundamento` leer. Der Lauf fand jede am Namen, nahm den Modus von `aspekto`,
// und Figma lehnte ab: „in setValueForMode: mode with id 2:1 not defined for variable". Die
// Plugin-API kann eine Variable nicht in eine andere Sammlung verschieben: `variableCollectionId`
// ist nur lesbar (plugin-api.d.ts 1.138.0), und weder Variable noch VariableCollection noch
// VariablesAPI kennen einen Aufruf dafür. Löschen und Neuanlegen gäbe ihr eine neue Id, und jede
// Bindung an einen Knoten und jeder Alias einer anderen Variable verlöre sein Ziel. Also bricht der
// Lauf vor dem ersten Schreiben ab, wie F10c, und nennt jede betroffene Variable mit der Sammlung,
// in der sie liegt, und der, in die der Plan sie legt. Entscheidung des Maintainers (2026-10-11):
// `fundamento` darf leer sein, keine Modelo-Änderung; eine leere Sammlung wird gemeldet, nie
// gelöscht.
describe("a variable the file holds in another collection stops the run before it writes (Sammlung gewechselt)", () => {
  type Switched = { name: string; from: string; to: string };
  type SwitchAbort = Error & { abort?: { switched?: Switched[] } };
  interface VariablesApi {
    variables: {
      createVariableCollection: (name: string) => DoubleCollection;
      createVariable: (name: string, collection: DoubleCollection, type: string) => DoubleVariable;
    };
  }
  const TWO_BRANDS = files["figma/plugin/code.js"] ?? "";
  const ONE_BRAND = repoFiles["figma/plugin/code.js"] ?? "";

  /** The abort of a run instead of its rejection; undefined when the run went through. */
  const abortOf = (double: ReturnType<typeof figmaDouble>, source: string) =>
    (
      new Function("figma", `${source}\nreturn applyPlan();`)(double.figma) as Promise<unknown>
    ).then(
      () => undefined,
      (caught: unknown) => caught as SwitchAbort,
    );
  const named = (of: FigmaPlan, collection: string) =>
    of.collections.find((candidate) => candidate.name === collection)?.variables ?? [];
  /**
   * Every variable the one-brand file holds in another collection than the two-brand plan puts it
   * in, in the plan's order: the 364 of fundamento (362 to aspekto, 2 to contrast) and one more
   * the one-brand plan had in color-scheme — computed from the plans, not copied from the plugin.
   */
  const expectedSwitches = (): Switched[] => {
    const held = new Map<string, string>();
    for (const collection of repoPlan.collections) {
      for (const variable of collection.variables) held.set(variable.name, collection.name);
    }
    return plan.collections.flatMap((collection) =>
      collection.variables.flatMap((variable) => {
        const from = held.get(variable.name);
        return from === undefined || from === collection.name
          ? []
          : [{ name: variable.name, from, to: collection.name }];
      }),
    );
  };
  const firstOfAspekto = () => {
    const [first] = named(plan, "aspekto");
    if (first === undefined) throw new Error("the two-brand plan has no variable in aspekto");
    return first;
  };

  it("is the maintainer's case: the one-brand plan fills fundamento, the two-brand plan leaves it empty", () => {
    expect(named(repoPlan, "fundamento").length).toBeGreaterThan(0);
    expect(named(plan, "fundamento")).toEqual([]);
    const switches = expectedSwitches();
    expect(switches.length).toBeGreaterThan(0);
    // Most go to aspekto; the contrast tokens the one-brand plan kept in fundamento go to contrast.
    const targets = new Set(switches.map((entry) => entry.to));
    expect(targets.has("aspekto")).toBe(true);
    expect(targets.has("fundamento")).toBe(false);
  });

  it("the double refuses a value for a mode its collection does not have, with Figma's words", () => {
    const double = modelDouble();
    const api = double.figma as unknown as VariablesApi;
    const a = api.variables.createVariableCollection("A");
    const b = api.variables.createVariableCollection("B");
    const x = api.variables.createVariable("x", a, "FLOAT");
    expect(() => x.setValueForMode(b.defaultModeId, 1)).toThrow(
      `in setValueForMode: mode with id ${b.defaultModeId} not defined for variable`,
    );
    x.setValueForMode(a.defaultModeId, 1);
    expect(x.valuesByMode).toEqual({ [a.defaultModeId]: 1 });
  });

  it("aborts before the first write when the file holds the brand's variables in fundamento", async () => {
    const double = modelDouble();
    await run(double, ONE_BRAND);
    const counts = { ...double.counts };
    const before = double.snapshot();
    const error = await abortOf(double, TWO_BRANDS);
    expect(error?.message).toContain("Abbruch vor dem ersten Schreiben");
    expect(error?.message).toContain("Sammlung gewechselt");
    expect(error?.message).toContain("fundamento");
    expect(error?.message).toContain("aspekto");
    expect(double.counts).toEqual(counts);
    expect(double.snapshot()).toBe(before);
    // The plugin removes nothing: fundamento stands, with every variable it had.
    expect(double.collections.some((collection) => collection.name === "fundamento")).toBe(true);
  });

  it("names every affected variable, the collection it lies in and the one the plan puts it in", async () => {
    const double = modelDouble();
    await run(double, ONE_BRAND);
    const error = await abortOf(double, TWO_BRANDS);
    const expected = expectedSwitches();
    expect(error?.abort?.switched).toEqual(expected);
    expect(error?.message).toContain(String(expected.length));
    expect(error?.message).toContain(expected[0]?.name ?? "?");
  });

  it("aborts for a single variable in a foreign collection, and leaves that collection standing", async () => {
    const double = modelDouble();
    const api = double.figma as unknown as VariablesApi;
    const other = api.variables.createVariableCollection("alt");
    const spec = firstOfAspekto();
    api.variables.createVariable(spec.name, other, spec.type);
    const counts = { ...double.counts };
    const error = await abortOf(double, TWO_BRANDS);
    expect(error?.abort?.switched).toEqual([{ name: spec.name, from: "alt", to: "aspekto" }]);
    expect(double.counts).toEqual(counts);
    expect(double.collections.map((collection) => collection.name)).toEqual(["alt"]);
  });

  it("is not stopped by a same-named variable elsewhere when the planned collection has its own", async () => {
    const double = modelDouble();
    await run(double, TWO_BRANDS);
    const api = double.figma as unknown as VariablesApi;
    const other = api.variables.createVariableCollection("alt");
    const spec = firstOfAspekto();
    const stranger = api.variables.createVariable(spec.name, other, spec.type);
    const error = await abortOf(double, TWO_BRANDS);
    expect(error).toBeUndefined();
    expect(stranger.valuesByMode).toEqual({});
    expect(stranger.variableCollectionId).toBe(other.id);
  });

  it("says it in the toast and prints the whole list as JSON lines in the console", async () => {
    const double = modelDouble();
    await run(double, ONE_BRAND);
    const lines: string[] = [];
    const module = new Function("figma", "console", TWO_BRANDS);
    await module(
      { ...double.figma, command: "apply" },
      {
        log: () => undefined,
        error: (...parts: unknown[]) => lines.push(parts.map(String).join(" ")),
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    const toast = double.notifications.at(-1);
    expect(toast?.message).toContain("Abbruch");
    expect(toast?.message).toContain("Sammlung gewechselt");
    expect(toast?.options).toMatchObject({ error: true });
    // Every line under Figma's limit for a copied line (F22), the list in parts, complete.
    for (const line of lines) expect(line.length).toBeLessThan(4000);
    const listed = lines
      .filter((line) => line.startsWith("{"))
      .map((line) => JSON.parse(line) as { part?: string; items?: Switched[] })
      .filter((part) => part.part === "switched")
      .flatMap((part) => part.items ?? []);
    expect(listed).toEqual(expectedSwitches());
  });

  it("reports a collection of the plan that stands empty in the file, and does not remove it", async () => {
    const double = modelDouble();
    const api = double.figma as unknown as VariablesApi;
    // The file after the maintainer moved the brand's variables out of fundamento by hand.
    api.variables.createVariableCollection("fundamento");
    const report = (await new Function("figma", `${TWO_BRANDS}\nreturn applyPlan();`)(
      double.figma,
    )) as { empty: string[]; warnings: string[]; variables: number };
    expect(report.empty).toEqual(["fundamento"]);
    expect(report.variables).toBeGreaterThan(0);
    expect(double.collections.some((collection) => collection.name === "fundamento")).toBe(true);
    // Raw data, not a warning: an empty fundamento is in order (Maintainer, 2026-10-11).
    expect(report.warnings.filter((warning) => warning.includes("fundamento"))).toEqual([]);
  });

  it("puts the empty collections into the headline of the printed report", async () => {
    const double = modelDouble();
    const api = double.figma as unknown as VariablesApi;
    api.variables.createVariableCollection("fundamento");
    const lines: string[] = [];
    const module = new Function("figma", "console", TWO_BRANDS);
    await module(
      { ...double.figma, command: "apply" },
      {
        log: (...parts: unknown[]) => lines.push(parts.map(String).join(" ")),
        error: () => undefined,
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    const headline = JSON.parse(lines.find((line) => line.startsWith("{")) ?? "{}") as {
      empty?: string[];
    };
    expect(headline.empty).toEqual(["fundamento"]);
  });
});
