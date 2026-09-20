// The generated development plugin (Spec 003 T016; plan D-12): it applies plan.json idempotently.
// Run against the Plugin-API double, so the proof needs no Figma.

import { defaultModeloSource, projectModeloSource } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import { FIGMA_CELO, type FigmaPlan } from "./figma.js";
import { figmaDouble } from "./test-doubles/plugin.js";

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

  async function paintsOf(props: Record<string, string>) {
    const double = figmaDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = double.root.children[0]?.children.find((child) => child.name === "butono");
    const name = Object.entries(variantOf(props)?.props ?? {})
      .map(([key, value]) => `${key}=${value}`)
      .join(", ");
    const variant = set?.children.find((child) => child.name === name);
    const control = variant?.children.find((child) => child.name === "control");
    return (control?.properties.fills ?? []) as { opacity?: number; boundVariables?: unknown }[];
  }

  it("a fully transparent fill is not opaque, and keeps its binding", async () => {
    const [fill] = await paintsOf({ variant: "tertiary", tone: "default", state: "rest" });
    expect(fill?.opacity).toBe(0);
    expect(fill?.boundVariables).toBeDefined();
  });

  it("an overlay carries its deckkraft", async () => {
    const [fill] = await paintsOf({ variant: "tertiary", tone: "default", state: "hover" });
    expect(fill?.opacity).toBe(0.08);
  });

  it("an opaque fill stays opaque", async () => {
    const [fill] = await paintsOf({ variant: "primary", tone: "default", state: "rest" });
    expect(fill?.opacity).toBe(1);
  });
});
