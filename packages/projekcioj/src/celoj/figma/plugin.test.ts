// The generated development plugin (Spec 003 T016; plan D-12): it applies plan.json idempotently.
// Run against the Plugin-API double, so the proof needs no Figma.

import { defaultModeloSource, projectModeloSource } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import { FIGMA_CELO, type FigmaPlan } from "./figma.js";
import { type DoubleNode, figmaDouble } from "./test-doubles/plugin.js";

const config = new URL(
  "../../../../modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
  import.meta.url,
).pathname;
const prepared = celoInputOf(projectModeloSource(config));
if (!prepared.ok) throw new Error("core + ekzemplo must be valid");
const files = Object.fromEntries(FIGMA_CELO.generate(prepared.input).map((f) => [f.path, f.text]));
const plan = JSON.parse(files["figma/plan.json"] ?? "{}") as FigmaPlan;

/** Runs the generated plugin source against a double. */
async function run(
  double: ReturnType<typeof figmaDouble>,
  source = files["figma/plugin/code.js"] ?? "",
) {
  const module = new Function("figma", `${source}\nreturn applyPlan();`);
  await module(double.figma);
}

describe("Figma development plugin (T016)", () => {
  it("ships a manifest that Figma can import from disk", () => {
    const manifest = JSON.parse(files["figma/plugin/manifest.json"] ?? "{}") as Record<
      string,
      unknown
    >;
    expect(manifest).toMatchObject({ api: "1.0.0", main: "code.js", editorType: ["figma"] });
    expect(String(manifest.name)).toContain("Fundamento");
  });

  it("creates every collection, variable and the component set on the first run", async () => {
    const double = figmaDouble();
    await run(double);
    expect(double.collections.map((collection) => collection.name)).toEqual(
      plan.collections
        .filter((collection) => collection.variables.length > 0)
        .map((collection) => collection.name),
    );
    const planned = plan.collections.flatMap((collection) => collection.variables);
    expect(double.variables).toHaveLength(planned.length);
    const set = double.root.children[0]?.children.find((child) => child.type === "COMPONENT_SET");
    expect(set?.name).toBe("butono");
    expect(set?.getSharedPluginData("fundamento", "ero")).toBe("butono");
    expect(set?.children).toHaveLength(plan.components[0]?.variants.length ?? 0);
  });

  it("changes nothing on a second run (idempotent)", async () => {
    const double = figmaDouble();
    await run(double);
    const first = double.snapshot();
    const created = { ...double.counts };
    await run(double);
    expect(double.snapshot()).toBe(first);
    expect(double.counts.collections).toBe(created.collections);
    expect(double.counts.variables).toBe(created.variables);
    expect(double.counts.nodes).toBe(created.nodes);
  });

  it("updates a changed plan in place instead of duplicating", async () => {
    const double = figmaDouble();
    await run(double);
    const created = { ...double.counts };
    const changed = JSON.parse(JSON.stringify(plan)) as FigmaPlan;
    const collection = changed.collections.find((candidate) => candidate.name === "color-scheme");
    const variable = collection?.variables.find((candidate) => candidate.hidden !== true);
    if (variable === undefined || collection === undefined) throw new Error("no variable");
    variable.values[collection.modes[0] ?? ""] = { r: 0.5, g: 0.25, b: 0.125, a: 1 };
    const source = (files["figma/plugin/code.js"] ?? "").replace(
      /^const PLAN = .*$/m,
      `const PLAN = ${JSON.stringify(changed)};`,
    );
    await run(double, source);
    expect(double.counts.variables).toBe(created.variables);
    expect(double.counts.nodes).toBe(created.nodes);
    const applied = double.variables.find((candidate) => candidate.name === variable.name);
    expect(Object.values(applied?.valuesByMode ?? {})).toContainEqual({
      r: 0.5,
      g: 0.25,
      b: 0.125,
      a: 1,
    });
  });

  it("creates no collection without variables, on either run (F1, review decision 2)", async () => {
    const empty = plan.collections.filter((collection) => collection.variables.length === 0);
    // Every Aspekto restates every core token (Art. IV), so `fundamento` carries none of them.
    expect(empty.map((collection) => collection.name)).toEqual(["fundamento"]);
    const double = figmaDouble();
    await run(double);
    expect(double.collections.map((collection) => collection.name)).toEqual(
      plan.collections
        .filter((collection) => collection.variables.length > 0)
        .map((collection) => collection.name),
    );
    const created = { ...double.counts };
    await run(double);
    expect(double.counts.collections).toBe(created.collections);
    expect(double.collections.some((collection) => collection.name === "fundamento")).toBe(false);
  });

  // A double that swallows is worse than none: it turns green into a statement about nothing
  // (Jugxo of 2026-09-20). What the double does not model must fail loudly, with the member named.
  it("refuses an API member it does not model, instead of pretending it exists", () => {
    const double = figmaDouble();
    const api = double.figma as Record<string, unknown>;
    expect(() => api.createEllipse).toThrow(/createEllipse/);
    expect(() => api.getNodeByIdAsync).toThrow(/does not model/);
    // What it does model stays reachable, including the members the plugin only probes.
    expect(typeof api.createFrame).toBe("function");
    expect(api.command).toBeUndefined();
  });

  it("never touches a node without Fundamento plugin data", async () => {
    const double = figmaDouble();
    const page = double.root.children[0];
    const foreign = { ...double.figma } as {
      createFrame: () => ReturnType<typeof figmaDouble>["root"];
    };
    const stranger = foreign.createFrame();
    stranger.name = "Not ours";
    page?.appendChild(stranger);
    await run(double);
    expect(stranger.parent).toBe(page);
    expect(stranger.pluginData).toEqual({});
    expect(stranger.children).toEqual([]);
  });
});

// F8 (Abnahme M1): Figma binds only the RGB of a variable to a paint — the deckkraft stays 1 and a
// translucent token renders opaque. The plugin therefore sets `paint.opacity` from the plan, in
// every case, and keeps the binding to `color` so the file still shows which variable rules the
// fill.
describe("the paint carries the alpha of its token (F8)", () => {
  // One brand: the decision is unambiguous in every mode. With a second brand whose tertiary fill
  // is opaque the plan says `alphaVariesByMode`, and the guard refuses the binding — see the
  // Figma-side test.
  const repo = celoInputOf(defaultModeloSource());
  if (!repo.ok) throw new Error("the repo Modelo must be valid");
  const repoFiles = Object.fromEntries(
    FIGMA_CELO.generate(repo.input).map((file) => [file.path, file.text]),
  );
  const repoPlan = JSON.parse(repoFiles["figma/plan.json"] ?? "{}") as FigmaPlan;
  const variantOf = (props: Record<string, string>) =>
    repoPlan.components[0]?.variants.find((entry) =>
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
    const double = figmaDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = double.root.children[0]?.children.find((child) => child.name === "butono");
    const name = Object.entries(variantOf(props)?.props ?? {})
      .map(([key, value]) => `${key}=${value}`)
      .join(", ");
    const variant = set?.children.find((child) => child.name === name);
    const control = variant?.children.find((child) => child.name === "control");
    const label = control?.children.find((child) => child.name === "label");
    const paints = (node: typeof control, field: string) =>
      ((node?.properties[field] ?? []) as Paint[])[0];
    return {
      fill: paints(control, "fills"),
      stroke: paints(control, "strokes"),
      label: paints(label, "fills"),
    };
  }

  it("a fully transparent fill is not opaque, and keeps its binding", async () => {
    const { fill } = await paintsOf({ variant: "tertiary", tone: "default", state: "rest" });
    expect(fill?.opacity).toBe(0);
    expect(fill?.boundVariables).toBeDefined();
  });

  it("an overlay carries its deckkraft", async () => {
    const { fill } = await paintsOf({ variant: "tertiary", tone: "default", state: "hover" });
    expect(fill?.opacity).toBe(0.08);
  });

  it("an opaque fill stays opaque", async () => {
    const { fill } = await paintsOf({ variant: "primary", tone: "default", state: "rest" });
    expect(fill?.opacity).toBe(1);
  });

  // `border.color` is the second of the two parts every tertiary role is bound to, and it carries
  // the same three cases as the fill.
  it("the border of a variant carries the same deckkraft as its fill", async () => {
    const rest = await paintsOf({ variant: "tertiary", tone: "default", state: "rest" });
    expect(rest.stroke?.opacity).toBe(0);
    expect(rest.stroke?.boundVariables).toBeDefined();
    const hover = await paintsOf({ variant: "tertiary", tone: "default", state: "hover" });
    expect(hover.stroke?.opacity).toBe(0.08);
    expect(hover.stroke?.boundVariables).toBeDefined();
    const primary = await paintsOf({ variant: "primary", tone: "default", state: "rest" });
    expect(primary.stroke?.opacity).toBe(1);
  });

  // The label is the third bound paint. No label colour is translucent today — that is what the
  // measurement says, and it would catch the day a label arrives at deckkraft 1 by accident.
  it("the label carries its deckkraft and keeps its binding", async () => {
    const tertiary = await paintsOf({ variant: "tertiary", tone: "default", state: "rest" });
    expect(tertiary.label?.opacity).toBe(1);
    expect(tertiary.label?.boundVariables).toBeDefined();
    const disabled = await paintsOf({ variant: "tertiary", tone: "default", state: "disabled" });
    expect(disabled.label?.opacity).toBe(1);
    expect(disabled.label?.boundVariables).toBeDefined();
  });
});

// F10 (Abnahme M1): the run in Figma has to be a measurement, not a look. The plugin reports per
// component what it created, updated and found, warns symmetrically when the component holds more
// or fewer variants than the plan names, prints the whole report to the console and puts the
// headline in the toast. A rejected run no longer disappears: it says so.
describe("the plugin reports what it did (F10)", () => {
  const variants = plan.components[0]?.variants.length ?? 0;
  const nameOf = (index: number) =>
    Object.entries(plan.components[0]?.variants[index]?.props ?? {})
      .map(([key, value]) => `${key}=${value}`)
      .join(", ");

  async function report(double: ReturnType<typeof figmaDouble>) {
    const module = new Function(
      "figma",
      `${files["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    );
    return (await module(double.figma)) as {
      collections: number;
      variables: number;
      components: {
        set: string;
        created: string[];
        updated: string[];
        missing: string[];
        extra: string[];
      }[];
      warnings: string[];
    };
  }

  it("counts every variant as created on the first run and as updated on the second", async () => {
    const double = figmaDouble();
    const first = await report(double);
    expect(first.components[0]?.set).toBe("butono");
    expect(first.components[0]?.created).toHaveLength(variants);
    expect(first.components[0]?.updated).toEqual([]);
    expect(first.warnings).toEqual([]);
    const second = await report(double);
    expect(second.components[0]?.created).toEqual([]);
    expect(second.components[0]?.updated).toHaveLength(variants);
    expect(second.warnings).toEqual([]);
  });

  // The finding that made this necessary: a document of mixed history held 71 of 72 variants, and
  // nothing said so. Both directions are named, with the names of the variants.
  it("names the variants that are missing and the ones too many", async () => {
    const double = figmaDouble();
    await report(double);
    const set = double.root.children[0]?.children.find((child) => child.name === "butono");
    if (set === undefined) throw new Error("no component set");
    const gone = nameOf(0);
    set.children.find((child) => child.name === gone)?.remove();
    const stranger = double.figma.createFrame as () => DoubleNode;
    const extra = stranger();
    extra.name = "variant=phantom";
    extra.setSharedPluginData("fundamento", "variant", "variant=phantom");
    set.appendChild(extra);
    const again = await report(double);
    expect(again.components[0]?.created).toEqual([gone]);
    expect(again.components[0]?.extra).toEqual(["variant=phantom"]);
    expect(again.warnings.join(" ")).toContain("variant=phantom");
  });

  it("prints the whole report and puts the headline in the toast", async () => {
    const double = figmaDouble();
    const lines: string[] = [];
    const log = console.log;
    console.log = (...parts: unknown[]) => lines.push(parts.map(String).join(" "));
    try {
      const source = `${files["figma/plugin/code.js"] ?? ""}`;
      const module = new Function("figma", "console", source);
      await module({ ...double.figma, command: "run" }, { log: console.log, error: console.log });
      await new Promise((resolve) => setTimeout(resolve, 0));
    } finally {
      console.log = log;
    }
    expect(lines.join("\n")).toContain('"set": "butono"');
    expect(double.notifications.map((entry) => entry.message).join(" ")).toContain("butono");
    expect(double.notifications[0]?.message).toContain("Konsole");
  });

  it("says it when the run fails instead of swallowing the rejection", async () => {
    const double = figmaDouble();
    const lines: string[] = [];
    const source = `${files["figma/plugin/code.js"] ?? ""}`;
    const module = new Function("figma", "console", source);
    await module(
      {
        ...double.figma,
        command: "run",
        loadFontAsync: async () => {
          throw new Error("Inter fehlt");
        },
      },
      {
        log: () => undefined,
        error: (...parts: unknown[]) => lines.push(parts.map(String).join(" ")),
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(lines.join("\n")).toContain("Inter fehlt");
    expect(double.notifications[0]?.message).toContain("fehlgeschlagen");
    expect(double.notifications[0]?.options).toMatchObject({ error: true });
  });
});
