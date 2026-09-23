// The generated development plugin (Spec 003 T016; plan D-12): it applies plan.json idempotently.
// Run against the Plugin-API double, so the proof needs no Figma.

import { defaultModeloSource, projectModeloSource } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import { FIGMA_CELO, type FigmaPlan, resolveFigmaPlan } from "./figma.js";
import { type DoubleNode, figmaDouble } from "./test-doubles/plugin.js";

const config = new URL(
  "../../../../modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
  import.meta.url,
).pathname;
const prepared = celoInputOf(projectModeloSource(config));
if (!prepared.ok) throw new Error("core + ekzemplo must be valid");
const files = Object.fromEntries(FIGMA_CELO.generate(prepared.input).map((f) => [f.path, f.text]));
const plan = JSON.parse(files["figma/plan.json"] ?? "{}") as FigmaPlan;

/**
 * A file that has the model's font, as a prepared test file would. Only the tests of the fallback
 * run in a bare file, where the label falls back to Inter with a warning.
 */
// The fonts the two-brand fixture asks for: komuna's Geist Medium and ekzemplo's Archivo SemiBold,
// and the two crossings a field-by-field binding passes through. A prepared file has all four; a
// real Geist and a real Archivo both ship these cuts (F30).
const MODEL_FONTS = [
  { family: "Geist", style: "Medium" },
  { family: "Geist", style: "Black" },
  { family: "Archivo", style: "Medium" },
  { family: "Archivo", style: "Black" },
] as const;
const modelDouble = () => figmaDouble({ fonts: MODEL_FONTS });

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
    const double = modelDouble();
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
    const double = modelDouble();
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
    const double = modelDouble();
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
    const double = modelDouble();
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
    const double = modelDouble();
    const api = double.figma as Record<string, unknown>;
    expect(() => api.createEllipse).toThrow(/createEllipse/);
    expect(() => api.getNodeByIdAsync).toThrow(/does not model/);
    // What it does model stays reachable, including the members the plugin only probes.
    expect(typeof api.createFrame).toBe("function");
    expect(api.command).toBeUndefined();
  });

  it("never touches a node without Fundamento plugin data", async () => {
    const double = modelDouble();
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
// The Modelo of this repository — the plan the maintainer runs in Figma.
const repo = celoInputOf(defaultModeloSource());
if (!repo.ok) throw new Error("the repo Modelo must be valid");
const repoFiles = Object.fromEntries(
  FIGMA_CELO.generate(repo.input).map((file) => [file.path, file.text]),
);
const repoPlan = JSON.parse(repoFiles["figma/plan.json"] ?? "{}") as FigmaPlan;

/** The node of that name below `node`, at any depth: the control sits inside the focus ring. */
function descendant(node: DoubleNode | undefined, name: string): DoubleNode | undefined {
  for (const child of node?.children ?? []) {
    if (child.name === name) return child;
    const found = descendant(child, name);
    if (found !== undefined) return found;
  }
  return undefined;
}

describe("the paint carries the alpha of its token (F8)", () => {
  // One brand: the decision is unambiguous in every mode. With a second brand whose tertiary fill
  // is opaque the plan says `alphaVariesByMode`, and the guard refuses the binding — see the
  // Figma-side test.
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
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = double.root.children[0]?.children.find((child) => child.name === "butono");
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
    const double = modelDouble();
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
    const double = modelDouble();
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
    const double = modelDouble();
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
    expect(lines.join("\n")).toContain('"set":"butono"');
    expect(double.notifications.map((entry) => entry.message).join(" ")).toContain("butono");
    expect(double.notifications[0]?.message).toContain("Konsole");
  });

  it("says it when the run fails instead of swallowing the rejection", async () => {
    const double = modelDouble();
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

// F10b (Abnahme M1, frische Datei QtJRsTlm7NnIPC8wqNuAVm): Lauf 1 legte 72 Varianten an, Lauf 2
// meldete `found: true`, `created: 1` — und zwar die **letzte** Variante des Plans
// (variant=tertiary, tone=default, size=large, state=loading), bei `updated: 71` und `warnings: []`.
// Hier wird der Fall nachgestellt: zwei Läufe hintereinander gegen den Plan dieses Repositories.
describe("a second run creates nothing (F10b, the maintainer's case)", () => {
  async function run2(double: ReturnType<typeof figmaDouble>) {
    const module = new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    );
    return (await module(double.figma)) as {
      components: { set: string; found: boolean; created: string[]; updated: string[] }[];
      warnings: string[];
    };
  }

  it("finds all 72 variants again, creates none", async () => {
    const double = modelDouble();
    const first = await run2(double);
    expect(first.components[0]?.created).toHaveLength(72);
    const second = await run2(double);
    expect(second.components[0]?.found).toBe(true);
    expect(second.components[0]?.created).toEqual([]);
    expect(second.components[0]?.updated).toHaveLength(72);
    // The variant Figma re-created is the last one of the plan; name it, so a failure here is
    // immediately comparable with the measurement in Figma.
    const last = repoPlan.components[0]?.variants.at(-1)?.props ?? {};
    expect(
      Object.entries(last)
        .map(([key, value]) => `${key}=${value}`)
        .join(", "),
    ).toBe("variant=tertiary, tone=default, size=large, state=loading");
  });
});

// F10b, zweiter Teil: Der Lauf in Figma ging mit `warnings: []` durch, obwohl er in einem
// vorgefundenen Set eine Variante neu angelegt hat. Regel des Maintainers: Ist das Set
// vorgefunden und wird trotzdem etwas angelegt, ist das **immer** eine Warnung. Dazu meldet der
// Lauf, wie er das Set vorgefunden hat — das trennt „Knoten weg" von „Markierung weg", ohne zu
// raten.
describe("a run that creates in a set it found warns, and says what it found (F10b)", () => {
  async function run2(double: ReturnType<typeof figmaDouble>) {
    const module = new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    );
    return (await module(double.figma)) as {
      components: {
        set: string;
        found: boolean;
        created: string[];
        updated: string[];
        missing: string[];
        extra: string[];
        duplicates: string[];
        before: { children: number; marked: number; unmarked: string[] };
        after: { children: number; marked: number };
      }[];
      warnings: string[];
    };
  }

  const setOf = (double: ReturnType<typeof figmaDouble>) => {
    const found = double.root.children[0]?.children.find((child) => child.name === "butono");
    if (found === undefined) throw new Error("no component set");
    return found;
  };
  const LAST = "variant=tertiary, tone=default, size=large, state=loading";

  // Der entscheidende Messpunkt für den nächsten Lauf in Figma: Nach dem Lauf steht im Bericht,
  // wie viele Kinder das Set trägt und wie viele davon unsere Markierung tragen. Bleibt die
  // Markierung des letzten Knotens in Figma nicht haften, sagt das schon Lauf 1 — und nicht erst
  // Lauf 2 über den Umweg „created: 1".
  it("reports how it left the set, marks included", async () => {
    const double = modelDouble();
    const first = await run2(double);
    expect(first.components[0]?.after).toEqual({ children: 72, marked: 72 });
    expect(first.warnings).toEqual([]);
  });

  it("warns when a child of the set has no mark after the run", async () => {
    const double = modelDouble();
    await run2(double);
    setOf(double)
      .children.find((child) => child.name === LAST)
      ?.setSharedPluginData("fundamento", "variant", "");
    // Der Lauf legt die Variante neu an; der unmarkierte Knoten bleibt daneben stehen.
    const again = await run2(double);
    expect(again.components[0]?.after).toEqual({ children: 73, marked: 72 });
    expect(again.warnings.join(" ")).toContain("ohne Markierung");
  });

  it("reports how it found the set before it changed anything", async () => {
    const double = modelDouble();
    const first = await run2(double);
    expect(first.components[0]?.before).toEqual({ children: 0, marked: 0, unmarked: [] });
    const second = await run2(double);
    expect(second.components[0]?.before).toEqual({ children: 72, marked: 72, unmarked: [] });
  });

  // End state one: the node is gone. That is what the maintainer's numbers say — 71 children at
  // the start of run 2, 72 after it.
  it("warns when it creates a variant in a set it found, and names it", async () => {
    const double = modelDouble();
    await run2(double);
    setOf(double)
      .children.find((child) => child.name === LAST)
      ?.remove();
    const again = await run2(double);
    expect(again.components[0]?.found).toBe(true);
    expect(again.components[0]?.created).toEqual([LAST]);
    expect(again.components[0]?.before?.children).toBe(71);
    // Zwei Warnungen: die Regel („vorgefunden und trotzdem angelegt") und die Deutung des Paars
    // aus dem Endstand des vorigen Laufs und dem Anfangsstand dieses Laufs.
    const warnings = again.warnings;
    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toContain(LAST);
    expect(warnings[0]).toContain("vorgefunden");
    expect(warnings[1]).toContain("zwischen den Läufen");
  });

  // End state two: the node is there but lost our mark. Then the run creates a second node of the
  // same name — the set ends with 73 children and a duplicate, and both are said out loud.
  it("names a child that lost its mark, and the duplicate it causes", async () => {
    const double = modelDouble();
    await run2(double);
    setOf(double)
      .children.find((child) => child.name === LAST)
      ?.setSharedPluginData("fundamento", "variant", "");
    const again = await run2(double);
    expect(again.components[0]?.before?.unmarked).toEqual([LAST]);
    expect(again.components[0]?.before?.marked).toBe(71);
    expect(again.components[0]?.created).toEqual([LAST]);
    expect(again.components[0]?.duplicates).toEqual([LAST]);
    expect(setOf(double).children).toHaveLength(73);
    expect(again.warnings.join(" ")).toContain("doppelt");
  });
});

// F10b, dritter Teil (Maintainer, 2026-09-21): Lauf 2 lässt sich nur im Licht von Lauf 1 deuten.
// `before: 71` heißt „zwischen den Läufen verschwunden" nur dann, wenn Lauf 1 mit `after: 72`
// geendet hat; endete Lauf 1 schon mit 71, war der Knoten nie im Set. Der Lauf wertet dieses Paar
// selbst aus: Er legt seinen `after`-Stand als Plugin-Daten am Set ab und liest ihn beim nächsten
// Mal als `left` wieder ein. Damit braucht der Maintainer zwischen den Läufen nichts abzulesen —
// Ablesen hieße auswählen, und das wäre schon ein Eingriff.
describe("the run reads its own last state and says what happened (F10b)", () => {
  async function run2(double: ReturnType<typeof figmaDouble>) {
    const module = new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    );
    return (await module(double.figma)) as {
      components: {
        planned: number;
        before: { children: number; marked: number; unmarked: string[] };
        after: { children: number; marked: number };
        left: { children: number; marked: number } | null;
        diagnosis: string;
        created: string[];
      }[];
      warnings: string[];
    };
  }

  const setOf = (double: ReturnType<typeof figmaDouble>) => {
    const found = double.root.children[0]?.children.find((child) => child.name === "butono");
    if (found === undefined) throw new Error("no component set");
    return found;
  };
  const LAST = "variant=tertiary, tone=default, size=large, state=loading";

  it("leaves its state at the set and finds it again next time", async () => {
    const double = modelDouble();
    const first = await run2(double);
    expect(first.components[0]?.planned).toBe(72);
    expect(first.components[0]?.left).toBeNull();
    expect(first.components[0]?.diagnosis).toBe("");
    const second = await run2(double);
    expect(second.components[0]?.left).toEqual({ children: 72, marked: 72 });
    expect(second.components[0]?.diagnosis).toBe("");
    expect(second.warnings).toEqual([]);
  });

  it("says 'gone between the runs' when the last run left the set complete", async () => {
    const double = modelDouble();
    await run2(double);
    setOf(double)
      .children.find((child) => child.name === LAST)
      ?.remove();
    const again = await run2(double);
    expect(again.components[0]?.left).toEqual({ children: 72, marked: 72 });
    expect(again.components[0]?.diagnosis).toContain("zwischen den Läufen");
    expect(again.warnings.join(" ")).toContain("zwischen den Läufen");
  });

  // Der wahrscheinlichste Fall, und der, der zur alten Datei von gestern passt: Schon der erste
  // Lauf hinterließ 71 — die Variante ist beim Anlegen nie im Set angekommen.
  it("says 'never arrived' when the last run already left the set short", async () => {
    const double = modelDouble();
    await run2(double);
    const set = setOf(double);
    set.children.find((child) => child.name === LAST)?.remove();
    set.setSharedPluginData("fundamento", "after", JSON.stringify({ children: 71, marked: 71 }));
    const again = await run2(double);
    expect(again.components[0]?.left).toEqual({ children: 71, marked: 71 });
    expect(again.components[0]?.diagnosis).toContain("nie im Set angekommen");
    expect(again.components[0]?.created).toEqual([LAST]);
  });

  it("says that the pair cannot be read yet when no earlier state is at the set", async () => {
    const double = modelDouble();
    await run2(double);
    const set = setOf(double);
    set.children.find((child) => child.name === LAST)?.remove();
    set.setSharedPluginData("fundamento", "after", "");
    const again = await run2(double);
    expect(again.components[0]?.left).toBeNull();
    expect(again.components[0]?.diagnosis).toContain("früheren Laufs");
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
    const set = double.root.children[0]?.children.find((child) => child.name === "butono");
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

// F11, Geometrie (Paket „Figma zeigt das Ero", Schritt 2): Das Plugin setzte nie `layoutMode`. In
// Figma sind Innenabstände, Abstand und Mindestmaße ohne Auto-Layout wirkungslos — die Maße des
// Ero kamen nicht an, und die Abnahme sah Figmas 100 × 100. Das Double hat diese Bindungen
// stillschweigend angenommen; ab jetzt kennt es die Vorbedingung und scheitert laut
// (jug_01M3094ZC6F3XZ1H0MWQZ62MYV, erste Anwendung auf eine Vorbedingung des Werkzeugs).
describe("the geometry of the Ero reaches Figma (F11)", () => {
  const AUTO_LAYOUT_FIELDS = [
    "paddingLeft",
    "paddingRight",
    "itemSpacing",
    "minWidth",
    "minHeight",
  ];

  it("refuses an auto-layout binding on a frame without a layout mode", () => {
    const double = modelDouble();
    const api = double.figma as { createFrame: () => DoubleNode };
    const frame = api.createFrame();
    const variable = { name: "size/box/padding" } as unknown as Parameters<
      DoubleNode["setBoundVariable"]
    >[1];
    for (const field of AUTO_LAYOUT_FIELDS) {
      expect(() => frame.setBoundVariable(field, variable), field).toThrow(/layoutMode/);
    }
    frame.layoutMode = "HORIZONTAL";
    expect(() => frame.setBoundVariable("paddingLeft", variable)).not.toThrow();
  });

  async function controlOf(props: Record<string, string>) {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = double.root.children[0]?.children.find((child) => child.name === "butono");
    const name = Object.entries(props)
      .map(([key, value]) => `${key}=${value}`)
      .join(", ");
    const variant = set?.children.find((child) => child.name === name);
    return descendant(variant, "control");
  }

  it("lays the control out horizontally, centred, and binds both inline paddings", async () => {
    const control = await controlOf({
      variant: "primary",
      tone: "default",
      size: "medium",
      state: "rest",
    });
    expect(control?.properties.layoutMode).toBe("HORIZONTAL");
    expect(control?.properties.primaryAxisAlignItems).toBe("CENTER");
    expect(control?.properties.counterAxisAlignItems).toBe("CENTER");
    const bound = control?.boundVariables ?? {};
    expect(bound.paddingLeft).toBeDefined();
    expect(bound.paddingRight).toEqual(bound.paddingLeft);
    expect(bound.itemSpacing).toBeDefined();
    expect(bound.minHeight).toBeDefined();
  });
});

// Paket „Figma zeigt das Ero" (Maintainer, 2026-09-21): Der Fokusring wird gezeichnet — eine
// Schaltflächen-Bibliothek ohne sichtbaren Fokuszustand ist ein Mangel an Barrierefreiheit. Wie in
// der Web Component (outline mit outline-offset, dazwischen box-shadow in color.focus.inner): Ring
// außen, Abstand innen, Platz für beides in jedem Zustand reserviert, damit nichts abgeschnitten
// wird und die Varianten gleich groß bleiben. Sichtbar ist er nur im Zustand focus.
describe("the focus ring is drawn, and never clipped (F11)", () => {
  const find = (node: DoubleNode | undefined, part: string): DoubleNode | undefined => {
    if (node === undefined) return undefined;
    if (node.getSharedPluginData("fundamento", "part") === part) return node;
    for (const child of node.children) {
      const found = find(child, part);
      if (found !== undefined) return found;
    }
    return undefined;
  };

  async function variantOf(double: ReturnType<typeof figmaDouble>, state: string) {
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = double.root.children[0]?.children.find((child) => child.name === "butono");
    return set?.children.find(
      (child) => child.name === `variant=primary, tone=default, size=medium, state=${state}`,
    );
  }

  it("nests ring, gap and control, and reserves the space in every state", async () => {
    const variant = await variantOf(modelDouble(), "rest");
    const ring = find(variant, "focus-ring");
    const gap = find(variant, "focus-gap");
    const control = find(variant, "control");
    expect(ring?.parent).toBe(variant);
    expect(gap?.parent).toBe(ring);
    expect(control?.parent).toBe(gap);
    expect(ring?.boundVariables.paddingLeft?.name).toBe("focus/ring/width");
    expect(ring?.boundVariables.paddingTop?.name).toBe("focus/ring/width");
    expect(gap?.boundVariables.paddingLeft?.name).toBe("focus/offset");
    expect(gap?.boundVariables.paddingBottom?.name).toBe("focus/offset");
    // Not focused: the space is there, the ring is not.
    expect(ring?.properties.fills).toEqual([]);
    expect(gap?.properties.fills).toEqual([]);
  });

  // F15 (Abnahme M1, Maintainer 2026-09-22): Der Fokus der tertiären Aktion war eine weiße Fläche
  // statt eines Rings. Die Web Component zeichnet den Fokus als outline plus box-shadow 0 0 0
  // offset — nur als Ring außerhalb, das Innere bleibt durchsichtig. In Figma füllte focus-gap die
  // ganze Fläche hinter control mit color.focus.inner; bei tertiary (durchsichtig) entstand ein
  // weißer Kasten. Ring und Abstand sind deshalb Striche, keine Füllungen.
  type Stroke = { boundVariables?: { color?: { name?: string } } };

  it("draws ring and gap as strokes bound to the tokens, in the focus state only", async () => {
    const focused = await variantOf(modelDouble(), "focus");
    const ring = find(focused, "focus-ring");
    const gap = find(focused, "focus-gap");
    const [ringStroke] = (ring?.properties.strokes ?? []) as Stroke[];
    const [gapStroke] = (gap?.properties.strokes ?? []) as Stroke[];
    expect(ringStroke?.boundVariables?.color).toMatchObject({ name: "focus/ring/color" });
    expect(gapStroke?.boundVariables?.color).toMatchObject({ name: "color/focus/inner" });
    // The stroke lies inside its frame and is as wide as the padding it fills: a band, no area.
    for (const [node, weight] of [
      [ring, "focus/ring/width"],
      [gap, "focus/offset"],
    ] as const) {
      expect(node?.properties.strokeAlign).toBe("INSIDE");
      expect(node?.boundVariables.strokeWeight?.name).toBe(weight);
      expect(node?.boundVariables.paddingLeft?.name).toBe(weight);
    }
    const resting = await variantOf(modelDouble(), "rest");
    expect(find(resting, "focus-ring")?.properties.strokes).toEqual([]);
    expect(find(resting, "focus-gap")?.properties.strokes).toEqual([]);
  });

  // Die rote Zusicherung des Maintainers: Die Fläche innerhalb von control trägt im Zustand focus
  // keine andere Füllung als in rest — für jede Kombination, tertiary eingeschlossen.
  it("fills nothing behind the control in focus that it does not fill in rest", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = double.root.children[0]?.children.find((child) => child.name === "butono");
    const behind = (variant: DoubleNode | undefined) =>
      [variant, find(variant, "focus-ring"), find(variant, "focus-gap")].map(
        (node) => node?.properties.fills,
      );
    const focused = (set?.children ?? []).filter((child) => child.name.endsWith("state=focus"));
    expect(focused).toHaveLength(12);
    for (const variant of focused) {
      const rest = set?.children.find(
        (child) => child.name === variant.name.replace("state=focus", "state=rest"),
      );
      expect(behind(variant), variant.name).toEqual(behind(rest));
      expect(behind(variant), variant.name).toEqual([[], [], []]);
    }
  });

  it("clips nothing: no frame of the variant cuts its content", async () => {
    const variant = await variantOf(modelDouble(), "focus");
    for (const part of ["focus-ring", "focus-gap", "control"]) {
      expect(find(variant, part)?.properties.clipsContent, part).toBe(false);
    }
    expect(variant?.properties.clipsContent).toBe(false);
  });

  it("lets the variant wrap its content, so no 100 × 100 tile is left", async () => {
    const variant = await variantOf(modelDouble(), "rest");
    expect(variant?.properties.layoutMode).toBe("HORIZONTAL");
    expect(variant?.properties.layoutSizingHorizontal).toBe("HUG");
    expect(variant?.properties.layoutSizingVertical).toBe("HUG");
  });

  // A file an older plugin made keeps its control directly under the variant; the run moves it
  // into the new structure instead of creating a second one.
  it("moves an older control into the ring instead of duplicating it", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const created = double.counts.nodes;
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.counts.nodes).toBe(created);
  });
});

// Die Liste der Eigenschaften, die das Plugin besitzt (Maintainer, 2026-09-21): Füllung, Rand,
// Effekte, Radius, Deckkraft, Abschneiden, Layout — jeweils Wert aus dem Plan oder neutral. Das
// Komponentenset gehört dazu: combineAsVariants zeichnet Figmas lila gestrichelten Rahmen.
// Im ersten Lauf rot, aus einem echten Grund: Das Set trug noch Figmas layoutMode "NONE" — sein
// Layout ist das Raster (nächster Test).
describe("every property the plugin owns is from the plan or neutral", () => {
  const OWNED = [
    "fills",
    "strokes",
    "dashPattern",
    "strokeAlign",
    "strokeWeight",
    "effects",
    "cornerRadius",
    "opacity",
    "clipsContent",
    "layoutMode",
    // F14: the flow and the sizing belong to the plugin too; a default here left the variants
    // at 0 × 0 in Figma's grid.
    "layoutPositioning",
    "layoutSizingHorizontal",
    "layoutSizingVertical",
  ];

  it("leaves no tool default on any node it drew, the component set included", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    // The set lies on the page, in no flow: its position among siblings is not the plugin's.
    const onPage = "Document/Page 1/butono: layoutPositioning";
    expect(double.untouchedDefaults(OWNED).filter((entry) => entry !== onPage)).toEqual([]);
    const set = double.root.children[0]?.children.find((child) => child.name === "butono");
    expect(set?.properties.strokes).toEqual([]);
    expect(set?.properties.dashPattern).toEqual([]);
  });
});

// Raster wie in der Vitrino (Maintainer, 2026-09-21): Die Vitrino ordnet die Zeilen nach der
// Kombination (variant × tone × size), die Zustände nebeneinander. Figma bekommt dasselbe als
// Raster: 12 Zeilen × 6 Spalten, in der Reihenfolge des Plans — auch nachdem ein Lauf eine
// Variante neu anlegen musste, die sonst am Ende stünde.
describe("the variants stand in the grid of the Vitrino (F11)", () => {
  const names = (repoPlan.components[0]?.variants ?? []).map((variant) =>
    Object.entries(variant.props)
      .map(([key, value]) => `${key}=${value}`)
      .join(", "),
  );
  const setOf = (double: ReturnType<typeof figmaDouble>) =>
    double.root.children[0]?.children.find((child) => child.name === "butono");

  it("is a grid of 12 rows by 6 states, in the order of the plan", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = setOf(double);
    expect(set?.properties.layoutMode).toBe("GRID");
    expect(set?.properties.gridColumnCount).toBe(6);
    expect(set?.properties.gridRowCount).toBe(12);
    expect(set?.children.map((child) => child.name)).toEqual(names);
    // Row by row: every sixth variant starts a new combination.
    expect(names[6]).toContain("size=medium");
  });

  it("puts a variant a later run had to create back in its place", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    setOf(double)
      ?.children.find((child) => child.name === names[3])
      ?.remove();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(setOf(double)?.children.map((child) => child.name)).toEqual(names);
    // Bestätigend (F14): die neu angelegte Variante bekommt ihre freie Zelle wieder.
    const cells = (setOf(double)?.children ?? []).map(
      (child) => `${child.gridRowAnchorIndex}/${child.gridColumnAnchorIndex}`,
    );
    expect(new Set(cells).size).toBe(72);
    expect(cells[3]).toBe("0/3");
  });
});

// Schrift aus dem Modell (Maintainer, 2026-09-21): Das Plugin lud fest Inter, das Modell nennt
// Geist. Rückfall nur auf eine benannte Schrift, mit Warnung. Das Double lernt dafür, was Figma
// tut: eine Schrift, die es nicht gibt, lehnt loadFontAsync ab, und eine ungeladene Schrift darf
// an keinem Text gesetzt werden.
describe("the label is set in the model's font (F11)", () => {
  const labelOf = (double: ReturnType<typeof figmaDouble>) =>
    descendant(
      double.root.children[0]?.children
        .find((child) => child.name === "butono")
        ?.children.find(
          (child) => child.name === "variant=primary, tone=default, size=medium, state=rest",
        ),
      "label",
    );

  it("knows which fonts exist, and refuses an unloaded one on a text", async () => {
    const double = figmaDouble();
    const api = double.figma as {
      loadFontAsync: (font: { family: string; style: string }) => Promise<void>;
      createText: () => DoubleNode;
    };
    await expect(api.loadFontAsync({ family: "Geist", style: "Medium" })).rejects.toThrow(/Geist/);
    await expect(api.loadFontAsync({ family: "Inter", style: "Medium" })).resolves.toBeUndefined();
    const text = api.createText();
    expect(() => {
      text.fontName = { family: "Geist", style: "Medium" };
    }).toThrow(/not loaded/);
  });

  it("uses the model's font when the file has it", async () => {
    const double = figmaDouble({ fonts: [{ family: "Geist", style: "Medium" }] });
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as { warnings: string[] };
    expect(labelOf(double)?.properties.fontName).toEqual({ family: "Geist", style: "Medium" });
    expect(report.warnings.join(" ")).not.toContain("Geist");
  });

  it("falls back to a named font, in the same style, and says so", async () => {
    const double = figmaDouble();
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as { warnings: string[] };
    expect(labelOf(double)?.properties.fontName).toEqual({ family: "Inter", style: "Medium" });
    expect(report.warnings.join(" ")).toContain("Geist Medium");
    expect(report.warnings.join(" ")).toContain("Inter Medium");
  });
});

// Beschriftung (Maintainer, 2026-09-21): Text wie in der Vitrino, als Text-Eigenschaft der
// Komponente (label: TEXT) mit dem Vitrino-Text als Vorgabewert. Jede Instanz kann ihn
// überschreiben; realistische Maße entstehen dort, nicht in der Vorlage.
describe("the label is a text property of the component (F11)", () => {
  const setOf = (double: ReturnType<typeof figmaDouble>) =>
    double.root.children[0]?.children.find((child) => child.name === "butono");
  type Definitions = Record<string, { type: string; defaultValue: string }>;

  // F14 (Maintainer): one neutral word — Figma keeps one default per property, not per variant.
  it("declares one TEXT property label, with the neutral word as its default", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const definitions = (setOf(double)?.properties.componentPropertyDefinitions ??
      {}) as Definitions;
    const keys = Object.keys(definitions).filter((key) => key.startsWith("label#"));
    expect(keys).toHaveLength(1);
    expect(definitions[keys[0] ?? ""]).toEqual({ type: "TEXT", defaultValue: "Aktion" });
  });

  it("connects every label to it", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = setOf(double);
    const [key] = Object.keys((set?.properties.componentPropertyDefinitions ?? {}) as Definitions);
    for (const variant of set?.children ?? []) {
      const label = descendant(variant, "label");
      expect(label?.properties.componentPropertyReferences, variant.name).toEqual({
        characters: key,
      });
    }
  });

  it("declares it once, also on a second run", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const definitions = (setOf(double)?.properties.componentPropertyDefinitions ??
      {}) as Definitions;
    expect(Object.keys(definitions)).toHaveLength(1);
  });
});

// F14 (Abnahme M1, Maintainer 2026-09-21): Das Raster wirkte nicht, und niemand merkte es. Alle 72
// Varianten lagen übereinander, der Bericht meldete keine Warnung. Belegte Ursache: Das Raster maß
// jede Variante als 0 × 0 — von Hand auf „Inhalt umschließen" gestellt, war das Set 48 × 96, genau
// Innenabstand plus Lücken bei Spuren der Größe null (8 + 5·8, 8 + 11·8). Die Zusage „die Variante
// umschließt ihren Inhalt" hielt im echten Figma nicht; das Double hatte sie geglaubt.
describe("the double measures sizes the way Figma did (F14)", () => {
  async function gridSet(double: ReturnType<typeof figmaDouble>, sized: boolean) {
    const api = double.figma as {
      createComponent: () => DoubleNode;
      createText: () => DoubleNode;
      combineAsVariants: (nodes: DoubleNode[], parent: DoubleNode) => DoubleNode;
      loadFontAsync: (font: { family: string; style: string }) => Promise<void>;
    };
    await api.loadFontAsync({ family: "Inter", style: "Regular" });
    const variants = Array.from({ length: 72 }, () => {
      const variant = api.createComponent();
      variant.layoutMode = "HORIZONTAL";
      if (sized) {
        Object.assign(variant, { layoutSizingHorizontal: "HUG", layoutSizingVertical: "HUG" });
      }
      const text = api.createText();
      Object.assign(text, { characters: "Aktion" });
      variant.appendChild(text);
      return variant;
    });
    const set = api.combineAsVariants(variants, double.root.children[0] as DoubleNode);
    Object.assign(set, {
      layoutMode: "GRID",
      gridColumnCount: 6,
      gridRowCount: 12,
      gridColumnGap: 8,
      gridRowGap: 8,
      paddingLeft: 4,
      paddingRight: 4,
      paddingTop: 4,
      paddingBottom: 4,
      layoutSizingHorizontal: "HUG",
      layoutSizingVertical: "HUG",
    });
    return { set, variants };
  }
  const size = (node: DoubleNode | undefined) => [
    (node as { width?: number } | undefined)?.width,
    (node as { height?: number } | undefined)?.height,
  ];

  // Messlauf 3 (Datei wSYaaAsB2EujMxGra84PoM, 2026-09-21) hat die Ursache aus den Rohdaten
  // geliefert: Set und Varianten waren korrekt (GRID 12 × 6, alle Spuren HUG, Varianten AUTO und
  // HUG in ihrer Größe), aber gridRowAnchorIndex und gridColumnAnchorIndex standen auf −1 — keine
  // Variante lag in einer Zelle. Figma verteilte die angehängten Kinder nicht selbst. Das erklärt
  // alle drei Messungen: leere HUG-Spuren sind 0 (48 × 96), alle Kinder liegen bei 0/0, und
  // zero/smaller sind leer. Das Double gibt genau das wieder.
  it.each([
    ["sized", true],
    ["unsized", false],
  ])(
    "leaves appended %s children unplaced: anchor −1, at 0/0, set 48 × 96",
    async (_name, sized) => {
      const { set, variants } = await gridSet(modelDouble(), sized);
      expect(size(set)).toEqual([48, 96]);
      for (const variant of variants) {
        const at = variant as unknown as {
          x: number;
          y: number;
          gridRowAnchorIndex: number;
          gridColumnAnchorIndex: number;
        };
        expect([at.gridRowAnchorIndex, at.gridColumnAnchorIndex, at.x, at.y]).toEqual([
          -1, -1, 0, 0,
        ]);
      }
    },
  );

  // What the API documents for a child of a grid (plugin-api.d.ts, GridChildrenMixin): out of
  // bounds throws, an occupied cell throws, and ROW_AUTO_FLOW refuses manual positions.
  it("places a child in its cell, and refuses what the API refuses", async () => {
    const { set, variants } = await gridSet(modelDouble(), true);
    type Placed = DoubleNode & {
      setGridChildPosition: (row: number, column: number) => void;
      gridRowAnchorIndex: number;
      gridColumnAnchorIndex: number;
    };
    const [first, second] = variants as Placed[];
    if (first === undefined || second === undefined) throw new Error("no variants");
    first.setGridChildPosition(2, 3);
    expect([first.gridRowAnchorIndex, first.gridColumnAnchorIndex]).toEqual([2, 3]);
    expect(() => second.setGridChildPosition(2, 3)).toThrow(/occupied/);
    expect(() => second.setGridChildPosition(12, 0)).toThrow(/out of bounds/);
    Object.assign(set, { gridItemsPositioning: "ROW_AUTO_FLOW" });
    expect(() => second.setGridChildPosition(0, 0)).toThrow(/ROW_AUTO_FLOW/);
  });

  it("lets only placed children size a track", async () => {
    const { set, variants } = await gridSet(modelDouble(), true);
    const first = variants[0] as DoubleNode & {
      setGridChildPosition: (row: number, column: number) => void;
    };
    const [width, height] = size(first);
    first.setGridChildPosition(0, 0);
    // One track of each axis now has the size of that child; the others stay 0.
    expect(size(set)).toEqual([48 + (width ?? 0), 96 + (height ?? 0)]);
  });

  it("gives a variant that hugs its content the size of that content", async () => {
    const { variants } = await gridSet(modelDouble(), true);
    const [width, height] = size(variants[0]);
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });
});

describe("every variant has its size and its own place in the grid (F14)", () => {
  const setOf = (double: ReturnType<typeof figmaDouble>) =>
    double.root.children[0]?.children.find((child) => child.name === "butono");
  const box = (node: DoubleNode | undefined) =>
    node as unknown as { width: number; height: number; x: number; y: number } | undefined;

  it("sizes every variant to its content, never 0", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    for (const variant of setOf(double)?.children ?? []) {
      const ring = descendant(variant, "focus-ring");
      expect(box(variant)?.width, variant.name).toBeGreaterThan(0);
      expect(box(variant)?.width, variant.name).toBeGreaterThanOrEqual(box(ring)?.width ?? 0);
      expect(box(variant)?.height, variant.name).toBeGreaterThanOrEqual(box(ring)?.height ?? 0);
    }
  });

  // Korrektur (Maintainer, Messlauf 3): Jede Variante bekommt ihre Zelle ausdrücklich — Zeile nach
  // variant × tone × size, Spalte nach state, in der Reihenfolge der Vitrino, jede Zelle einmal.
  type Anchored = DoubleNode & { gridRowAnchorIndex: number; gridColumnAnchorIndex: number };
  const butono = repo.ok ? repo.input.modelo.eroj.find((e) => e.ero.name === "butono") : undefined;

  it("gives every variant its own cell: 72 anchors ≥ 0, all pairs different", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const variants = (setOf(double)?.children ?? []) as Anchored[];
    expect(variants).toHaveLength(72);
    for (const variant of variants) {
      expect(variant.gridRowAnchorIndex, variant.name).toBeGreaterThanOrEqual(0);
      expect(variant.gridColumnAnchorIndex, variant.name).toBeGreaterThanOrEqual(0);
    }
    const cells = variants.map((v) => `${v.gridRowAnchorIndex}/${v.gridColumnAnchorIndex}`);
    expect(new Set(cells).size).toBe(72);
  });

  it("orders the cells like the Vitrino: a row per combination, a column per state", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const states = butono?.skemo.states ?? [];
    const rows = new Map<number, string>();
    for (const variant of (setOf(double)?.children ?? []) as Anchored[]) {
      const props = Object.fromEntries(variant.name.split(", ").map((pair) => pair.split("=")));
      expect(variant.gridColumnAnchorIndex, variant.name).toBe(states.indexOf(props.state));
      const combination = `${props.variant} · ${props.tone} · ${props.size}`;
      const known = rows.get(variant.gridRowAnchorIndex);
      if (known === undefined) rows.set(variant.gridRowAnchorIndex, combination);
      else expect(known, variant.name).toBe(combination);
    }
    // Rows in the order the Vitrino lists the combinations: the order of the plan.
    const planned = [
      ...new Set(
        (repoPlan.components[0]?.variants ?? []).map(
          (variant) => `${variant.props.variant} · ${variant.props.tone} · ${variant.props.size}`,
        ),
      ),
    ];
    expect([...rows.entries()].sort(([a], [b]) => a - b).map(([, name]) => name)).toEqual(planned);
  });

  it("puts the 72 variants on 72 places, 6 columns by 12 rows, and says nothing", async () => {
    const double = modelDouble();
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as { warnings: string[] };
    const places = (setOf(double)?.children ?? []).map((variant) => box(variant));
    expect(new Set(places.map((place) => `${place?.x},${place?.y}`)).size).toBe(72);
    expect(new Set(places.map((place) => place?.x)).size).toBe(6);
    expect(new Set(places.map((place) => place?.y)).size).toBe(12);
    expect(report.warnings).toEqual([]);
  });

  it("keeps every cell on a second run, without moving anything", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const before = ((setOf(double)?.children ?? []) as Anchored[]).map(
      (v) => `${v.name}@${v.gridRowAnchorIndex}/${v.gridColumnAnchorIndex}`,
    );
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as { warnings: string[] };
    const after = ((setOf(double)?.children ?? []) as Anchored[]).map(
      (v) => `${v.name}@${v.gridRowAnchorIndex}/${v.gridColumnAnchorIndex}`,
    );
    expect(after).toEqual(before);
    expect(report.warnings).toEqual([]);
  });

  // Bericht: Varianten ohne Zelle werden gezählt und genannt. Hier lehnt das Werkzeug jede
  // Zuweisung ab — der Lauf bricht nicht ab, er sagt, was geschah, mit der Meldung des Werkzeugs.
  it("counts and names the variants without a cell, with the tool's message", async () => {
    const double = modelDouble();
    const api = double.figma as { createComponent: () => DoubleNode };
    const create = api.createComponent;
    const figma = {
      ...double.figma,
      createComponent: () =>
        Object.assign(create(), {
          setGridChildPosition: () => {
            throw new Error("in setGridChildPosition: refused");
          },
        }),
    };
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(figma)) as { warnings: string[]; components: { layout: { unplaced: string[] } }[] };
    expect(report.components[0]?.layout.unplaced).toHaveLength(72);
    const text = report.warnings.join(" ");
    expect(text).toContain("72 von 72 Varianten liegen in keiner Zelle");
    expect(text).toContain("in setGridChildPosition: refused");
  });

  it("keeps every child of a variant in the flow, not freely placed", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const variant = setOf(double)?.children[0];
    for (const part of ["focus-ring", "focus-gap", "control", "label"]) {
      expect(descendant(variant, part)?.properties.layoutPositioning, part).toBe("AUTO");
    }
  });

  // Erst messen, dann bauen (Maintainer, 2026-09-21): Der Bericht trägt, was das Werkzeug
  // tatsächlich hält — Rohdaten, keine Deutung. Am Set die Definition der Spuren, an einer
  // Beispielvariante Lage, Positionierung und Zellenzuordnung. Eine Eigenschaft, die das Werkzeug
  // nicht kennt, steht als „nicht vorhanden" da; eine, bei der es wirft, mit seiner Meldung.
  it("reports what the tool holds: the tracks of the set and the cell of a variant", async () => {
    const double = modelDouble();
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as {
      components: {
        layout: {
          held: {
            set: Record<string, unknown>;
            variant: Record<string, unknown>;
            last: Record<string, unknown>;
          };
        };
      }[];
    };
    const held = report.components[0]?.layout.held;
    expect(held?.set).toMatchObject({
      type: "COMPONENT_SET",
      layoutMode: "GRID",
      gridRowCount: 12,
      gridColumnCount: 6,
      gridRowGap: 8,
      gridColumnGap: 8,
      gridItemsPositioning: "MANUAL",
      children: 72,
    });
    // Names the double does not know are reported as absent, not left out.
    expect(held?.set.gridRowSizes).toBe("nicht vorhanden");
    expect(held?.variant).toMatchObject({
      name: "variant=primary, tone=default, size=small, state=rest",
      parent: "COMPONENT_SET",
      layoutPositioning: "AUTO",
      layoutSizingHorizontal: "HUG",
    });
    expect(held?.variant).toMatchObject({ gridRowAnchorIndex: 0, gridColumnAnchorIndex: 0 });
    expect(held?.last).toMatchObject({ gridRowAnchorIndex: 11, gridColumnAnchorIndex: 5 });
    expect(held?.last.name).toBe("variant=tertiary, tone=default, size=large, state=loading");
  });

  it("reports a property the tool throws on with the tool's message", async () => {
    const double = modelDouble();
    const api = double.figma as { combineAsVariants: (...args: unknown[]) => DoubleNode };
    const combine = api.combineAsVariants;
    const figma = {
      ...double.figma,
      combineAsVariants: (...args: unknown[]) => {
        const set = combine(...args);
        return new Proxy(set, {
          get(target, key, receiver) {
            if (key === "gridRowSizes") throw new Error("in get_gridRowSizes: not supported");
            return Reflect.get(target, key, receiver);
          },
        });
      },
    };
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(figma)) as { components: { layout: { held: { set: Record<string, unknown> } } }[] };
    expect(report.components[0]?.layout.held.set.gridRowSizes).toBe(
      "wirft: in get_gridRowSizes: not supported",
    );
  });

  it("labels every variant with the neutral word", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const definitions = (setOf(double)?.properties.componentPropertyDefinitions ?? {}) as Record<
      string,
      { defaultValue: string }
    >;
    expect(Object.values(definitions).map((definition) => definition.defaultValue)).toEqual([
      "Aktion",
    ]);
  });
});

// F16 (Abnahme M1, Maintainer 2026-09-22): Die Vitrino zeigt die Knöpfe auf dem Untergrund des
// Modells; in Figma standen sie auf der dunklen Leinwand, und tertiary war dort unlesbar. Das Set
// bekommt die Untergrundfarbe als Füllung — gebunden an die Variable, keine feste Farbe, damit sie
// mit color-scheme wechselt. Sie gehört zu den Eigenschaften, die das Plugin besitzt.
describe("the set stands on the model's background, like the Vitrino (F16)", () => {
  it("names the Vitrino's surface in the plan", () => {
    expect(repoPlan.components[0]?.surface).toEqual({
      variable: "color/background/canvas",
      opacity: 1,
    });
  });

  it("fills the set with it, bound to the variable, on both runs", async () => {
    const double = modelDouble();
    for (const _ of [1, 2]) {
      await run(double, repoFiles["figma/plugin/code.js"] ?? "");
      const set = double.root.children[0]?.children.find((child) => child.name === "butono");
      const fills = (set?.properties.fills ?? []) as {
        opacity?: number;
        boundVariables?: { color?: { name?: string } };
      }[];
      expect(fills).toHaveLength(1);
      expect(fills[0]?.boundVariables?.color).toMatchObject({ name: "color/background/canvas" });
      expect(fills[0]?.opacity).toBe(1);
    }
  });
});

// F17 (Messlauf #21, Datei Q7LOiRGeDyJ0JgdajzXg81, 2026-09-22): Alle 12 Fokus-Varianten waren 8 px
// breiter und höher als die übrigen Zustände ihrer Zeile (small 59 × 44 statt 51 × 36, medium
// 73 × 48 statt 65 × 40, large 85 × 56 statt 77 × 48). Die Reserve aus Innenabständen wirkte in
// jedem Zustand (28 + 8 = 36); dazu kamen im Fokus 2 × (2 + 2) = 8 — die sichtbaren Striche von
// Ring und Abstand nahmen zusätzlich Platz. In der Web Component ändert outline die Größe nicht.
//
// Warum das Double es nicht sah: Sein Layout zählte Striche nie mit. Es hatte stillschweigend
// angenommen, ein Strich nehme keinen Platz — gemessen hatte das niemand.
describe("a visible stroke takes space, as measured (F17)", () => {
  async function hugging(included: boolean | undefined) {
    const double = modelDouble();
    const api = double.figma as {
      createFrame: () => DoubleNode;
      createText: () => DoubleNode;
      loadFontAsync: (font: { family: string; style: string }) => Promise<void>;
    };
    await api.loadFontAsync({ family: "Inter", style: "Regular" });
    const frame = api.createFrame();
    const text = api.createText();
    Object.assign(text, { characters: "Aktion" });
    frame.appendChild(text);
    Object.assign(frame, {
      layoutMode: "HORIZONTAL",
      layoutSizingHorizontal: "HUG",
      layoutSizingVertical: "HUG",
      strokeWeight: 2,
    });
    if (included !== undefined) Object.assign(frame, { strokesIncludedInLayout: included });
    const size = () => {
      const box = frame as unknown as { width: number; height: number };
      return [box.width, box.height];
    };
    const bare = size();
    Object.assign(frame, { strokes: [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }] });
    return { bare, stroked: size() };
  }

  it("grows a hugging frame by the weight on every side once the stroke is visible", async () => {
    const { bare, stroked } = await hugging(undefined);
    expect(stroked).toEqual([(bare[0] ?? 0) + 4, (bare[1] ?? 0) + 4]);
  });

  it("leaves the size alone when strokesIncludedInLayout is false", async () => {
    const { bare, stroked } = await hugging(false);
    expect(stroked).toEqual(bare);
  });
});

describe("every variant has the same outer size in all six states (F17)", () => {
  const rowsOf = (double: ReturnType<typeof figmaDouble>) => {
    const set = double.root.children[0]?.children.find((child) => child.name === "butono");
    const rows = new Map<number, string[]>();
    for (const variant of set?.children ?? []) {
      const box = variant as unknown as { width: number; height: number };
      const sizes = rows.get(variant.gridRowAnchorIndex) ?? [];
      sizes.push(`${box.width} × ${box.height}`);
      rows.set(variant.gridRowAnchorIndex, sizes);
    }
    return rows;
  };

  it("gives the six variants of a row one width and one height, focus included", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const rows = rowsOf(double);
    expect(rows.size).toBe(12);
    for (const [row, sizes] of rows) {
      expect(sizes, `row ${row}`).toHaveLength(6);
      expect(new Set(sizes).size, `row ${row}: ${sizes.join(", ")}`).toBe(1);
    }
  });

  it("owns strokesIncludedInLayout on ring and gap: the stroke lies in the reserve", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const set = double.root.children[0]?.children.find((child) => child.name === "butono");
    const focused = set?.children.find((child) => child.name.endsWith("state=focus"));
    for (const part of ["focus-ring", "focus-gap"]) {
      expect(descendant(focused, part)?.properties.strokesIncludedInLayout, part).toBe(false);
    }
  });

  // Die Wirkung messen, nicht den Aufruf: In einem Werkzeug, das die Eigenschaft annimmt und
  // nichts bewirkt, nennt der Bericht die ungleichen Zeilen mit Zahlen.
  it("warns with numbers when a row is uneven", async () => {
    const double = modelDouble();
    const api = double.figma as { createFrame: () => DoubleNode };
    const create = api.createFrame;
    const figma = {
      ...double.figma,
      createFrame: () =>
        new Proxy(create(), {
          set(target, key, value, receiver) {
            if (key === "strokesIncludedInLayout") return true;
            return Reflect.set(target, key, value, receiver);
          },
        }),
    };
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(figma)) as { warnings: string[]; components: { layout: { uneven: unknown[] } }[] };
    expect(report.components[0]?.layout.uneven).toHaveLength(12);
    const text = report.warnings.join(" ");
    expect(text).toContain("12 von 12 Zeilen");
    expect(text).toContain("state=focus");
    expect(text).toMatch(/\d+(\.\d+)? × \d+(\.\d+)? statt \d+(\.\d+)? × \d+(\.\d+)?/);
  });

  it("reports what the tool holds at the parts of a focused variant", async () => {
    const double = modelDouble();
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as {
      components: { layout: { held: { focus: Record<string, Record<string, unknown>> } } }[];
    };
    const parts = report.components[0]?.layout.held.focus;
    expect(parts?.variant?.name).toBe("variant=primary, tone=default, size=small, state=focus");
    expect(parts?.["focus-ring"]).toMatchObject({
      strokesIncludedInLayout: false,
      strokeAlign: "INSIDE",
    });
    expect(parts?.control).toHaveProperty("strokesIncludedInLayout");
    expect(parts?.label).toHaveProperty("width");
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

// F20 (Abnahme M1, Maintainer 2026-09-22): Das Set umschließt sein Raster. Gemessen: Set 518 × 688,
// der Untergrund endet dort; die Spalte loading ragt rechts ca. 50 px hinaus, die Zeile
// tertiary · large liegt komplett unterhalb des Sets. Das Double hat es nicht erkannt: Zugesichert
// waren gesetzte Eigenschaften (layoutSizing HUG), nicht die Geometrie.
describe("the set encloses its grid (F20)", () => {
  const setOf = (double: ReturnType<typeof figmaDouble>) =>
    double.root.children[0]?.children.find((child) => child.name === "butono");
  type Box = { x: number; y: number; width: number; height: number };

  it("holds every child inside its bounds plus padding, after the first and the second run", async () => {
    const double = modelDouble();
    for (const _ of [1, 2]) {
      await run(double, repoFiles["figma/plugin/code.js"] ?? "");
      const set = setOf(double);
      const bounds = set as unknown as Box;
      const padding = Number(set?.properties.paddingRight ?? 0);
      expect(set?.children).toHaveLength(72);
      for (const child of set?.children ?? []) {
        const box = child as unknown as Box;
        expect(box.x, child.name).toBeGreaterThanOrEqual(0);
        expect(box.y, child.name).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width + padding, child.name).toBeLessThanOrEqual(bounds.width);
        expect(box.y + box.height + padding, child.name).toBeLessThanOrEqual(bounds.height);
      }
    }
  });

  it("reports the size of the set and the bounding box of its children, raw", async () => {
    const double = modelDouble();
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as {
      components: {
        layout: {
          set: { width: number; height: number };
          bounds: { minX: number; minY: number; maxX: number; maxY: number };
          outside: string[];
        };
      }[];
    };
    const layout = report.components[0]?.layout;
    const set = setOf(double) as unknown as Box;
    expect(layout?.set).toEqual({ width: set.width, height: set.height });
    expect(layout?.bounds.minX).toBeGreaterThanOrEqual(0);
    expect(layout?.bounds.maxX).toBeLessThanOrEqual(set.width);
    expect(layout?.bounds.maxY).toBeLessThanOrEqual(set.height);
    expect(layout?.outside).toEqual([]);
  });

  // Die Wirkung messen: ein Werkzeug, dessen Set kleiner bleibt als sein Raster — die gemessenen
  // 518 × 688 —, während die Kinder darüber hinausreichen.
  it("warns with numbers when children lie outside the set", async () => {
    const double = modelDouble();
    const api = double.figma as { combineAsVariants: (...args: unknown[]) => DoubleNode };
    const combine = api.combineAsVariants;
    const figma = {
      ...double.figma,
      combineAsVariants: (...args: unknown[]) =>
        new Proxy(combine(...args), {
          get(target, key, receiver) {
            if (key === "width") return 300;
            if (key === "height") return 200;
            return Reflect.get(target, key, receiver);
          },
        }),
    };
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(figma)) as { warnings: string[]; components: { layout: { outside: string[] } }[] };
    expect(report.components[0]?.layout.outside.length).toBeGreaterThan(0);
    const text = report.warnings.join(" ");
    expect(text).toContain("liegen außerhalb des Sets");
    expect(text).toContain("300 × 200");
    expect(text).toMatch(/Kinder reichen bis \d+(\.\d+)? × \d+(\.\d+)?/);
  });
});

// F21 (Messung Thorsten, Datei x8sFFyOkrnlMM4ngAsbnfs, 2026-09-22): Lauf 2 auf demselben Set, ohne
// Eingriff, scheiterte mit „in set_layoutMode: Cannot set grid row count: Cannot delete occupied
// row/column." Im Stand der F14-Abnahme lief Lauf 2 sauber — eine Regression. Hypothese des
// Maintainers, ungemessen: Das Neusetzen von layoutMode (oder der Spurenzahl) an einem Set mit
// belegten Zellen verkleinert das Raster kurzzeitig, und Figma lehnt das ab. Das Double lehnt
// dasselbe ab, mit genau dieser Meldung.
describe("the double refuses what Figma refused on the second run (F21)", () => {
  async function placedGrid() {
    const double = modelDouble();
    const api = double.figma as {
      createComponent: () => DoubleNode;
      combineAsVariants: (nodes: DoubleNode[], parent: DoubleNode) => DoubleNode;
    };
    const variants = Array.from({ length: 4 }, () => api.createComponent());
    const set = api.combineAsVariants(variants, double.root.children[0] as DoubleNode);
    Object.assign(set, { layoutMode: "GRID", gridRowCount: 2, gridColumnCount: 2 });
    variants.forEach((variant, index) => {
      variant.setGridChildPosition(index >> 1, index & 1);
    });
    return set;
  }
  const MESSAGE = "Cannot set grid row count: Cannot delete occupied row/column.";

  it("throws Figma's message when layoutMode is set again on a grid with occupied cells", async () => {
    const set = await placedGrid();
    expect(() => Object.assign(set, { layoutMode: "GRID" })).toThrow(
      `in set_layoutMode: ${MESSAGE}`,
    );
  });

  it("throws when a track count is lowered below an occupied cell, keeps equal or larger", async () => {
    const set = await placedGrid();
    expect(() => Object.assign(set, { gridRowCount: 1 })).toThrow(
      `in set_gridRowCount: ${MESSAGE}`,
    );
    expect(() => Object.assign(set, { gridRowCount: 2 })).not.toThrow();
    expect(() => Object.assign(set, { gridColumnCount: 3 })).not.toThrow();
  });
});

describe("the second run writes nothing that already holds (F21)", () => {
  it("updates 72, creates none, warns of nothing, and writes no property that already holds", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const written = double.counts.writes;
    const report = (await new Function(
      "figma",
      `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as {
      components: { created: string[]; updated: string[] }[];
      warnings: string[];
    };
    expect(report.components[0]?.created).toEqual([]);
    expect(report.components[0]?.updated).toHaveLength(72);
    expect(report.warnings).toEqual([]);
    expect(double.counts.writes - written).toBe(0);
  });
});

describe("a failed run leaves everything readable in the console (F21)", () => {
  it("prints message, stack and the report up to the abort, each as one string", async () => {
    const double = modelDouble();
    const calls: unknown[][] = [];
    const source = `${files["figma/plugin/code.js"] ?? ""}`;
    const module = new Function("figma", "console", source);
    const api = double.figma as { createComponent: () => DoubleNode };
    const create = api.createComponent;
    let made = 0;
    await module(
      {
        ...double.figma,
        command: "run",
        createComponent: () => {
          if (++made === 40)
            throw new Error("in set_layoutMode: Cannot delete occupied row/column.");
          return create();
        },
      },
      { log: () => undefined, error: (...parts: unknown[]) => calls.push(parts) },
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    // Every console.error call carries exactly one string: nothing an object viewer would fold.
    for (const call of calls) {
      expect(call).toHaveLength(1);
      expect(typeof call[0]).toBe("string");
    }
    const text = calls.map((call) => String(call[0])).join("\n");
    expect(text).toContain("Cannot delete occupied row/column");
    expect(text).toMatch(/\n\s+at /);
    const json = calls.map((call) => String(call[0])).find((line) => line.startsWith("{"));
    const partial = JSON.parse(json ?? "{}") as {
      phase: string;
      collections: number;
      variables: number;
      components: { set: string; created: string[] }[];
    };
    expect(partial.phase).toBe("components");
    expect(partial.variables).toBeGreaterThan(0);
    expect(partial.components[0]?.set).toBe("butono");
    expect(partial.components[0]?.created).toHaveLength(39);
  });

  it("prints the report of a good run as one JSON string too", async () => {
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
    const json = lines.find((line) => line.startsWith("{"));
    expect(json).toBeDefined();
    expect(JSON.parse(json ?? "{}")).toMatchObject({ fundamento: expect.any(String) });
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

/** The colour a node shows for a paint field: what the first visible paint holds. */
function double_shown(node: DoubleNode, field: "fills" | "strokes") {
  const [paint] = (node.properties[field] ?? []) as { color?: unknown; visible?: boolean }[];
  return paint === undefined || paint.visible === false ? undefined : paint.color;
}

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
    repoPlan.components[0]?.variants.find((v) =>
      Object.entries(props).every(([k, val]) => v.props[k] === val),
    )?.paints ?? {};

  it("matches hex, opacity and binding on both runs — fills, strokes and the label", async () => {
    const double = modelDouble();
    for (const run of [1, 2]) {
      await new Function(
        "figma",
        `${repoFiles["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
      )(double.figma);
      const set = double.root.children[0]?.children.find((child) => child.name === "butono");
      for (const [props, name] of [
        [{ variant: "primary", tone: "default", size: "large", state: "rest" }, "primary"],
        [{ variant: "tertiary", tone: "default", size: "medium", state: "hover" }, "tertiary"],
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
    const paints = report.components[0]?.layout.paints;
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
      components: [{ set: "butono", created: 72, updated: 0 }],
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
    expect(report.components[0]?.created).toHaveLength(72);
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
    expect(report.warnings).toEqual([]);
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

// F30 (An P0, Maintainer 2026-09-23): the label's typeface follows the brand. Figma allows
// setBoundVariable("fontFamily", …) and ("fontStyle", …); the condition is that every font the
// bound variables resolve to — over **all** modes — is loaded before the binding is written,
// otherwise Figma throws. The double models exactly that condition, so the run can be measured
// here instead of guessed at.
describe("the label's font is bound, not written (F30)", () => {
  const BOTH = MODEL_FONTS;

  async function report(double: ReturnType<typeof figmaDouble>) {
    return (await new Function(
      "figma",
      `${files["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as {
      warnings: string[];
      components: { set: string; fonts?: unknown }[];
    };
  }

  const labelOf = (double: ReturnType<typeof figmaDouble>) => {
    const set = double.root.children[0]?.children.find((child) => child.type === "COMPONENT_SET");
    const find = (node: DoubleNode): DoubleNode | undefined =>
      node.type === "TEXT" ? node : node.children.map(find).find((found) => found !== undefined);
    return find(set as DoubleNode);
  };

  it("binds the family and the cut to the role's variables", async () => {
    const double = figmaDouble({ fonts: BOTH });
    const result = await report(double);
    expect(result.warnings).toEqual([]);
    const label = labelOf(double);
    // The label's typography role follows the size, so which of them a given variant carries
    // depends on the variant; both fields must name the same role, and it must be a label role.
    const family = label?.boundVariables.fontFamily?.name ?? "";
    const style = label?.boundVariables.fontStyle?.name ?? "";
    expect(family).toMatch(/^typography\/label\/[12]\/font-family$/);
    expect(style).toBe(family.replace("font-family", "font-style"));
  });

  it("loads every font of every mode before it binds, not only the base one", async () => {
    const double = figmaDouble({ fonts: BOTH });
    await report(double);
    expect(double.loadedFonts).toContain("Geist Medium");
    expect(double.loadedFonts).toContain("Archivo Black");
  });

  // A file that has only the reference's font: the run says which one is missing and what it
  // falls back to, and it does not die on the binding.
  it("warns with the name and the fallback when a mode's font is missing", async () => {
    const double = figmaDouble({ fonts: [{ family: "Geist", style: "Medium" }] });
    const result = await report(double);
    const warning = result.warnings.join(" | ");
    expect(warning).toContain("Archivo Black");
    expect(warning).toContain("Inter");
    const label = labelOf(double);
    expect(label?.boundVariables.fontFamily).toBeUndefined();
    expect(label?.properties.fontName).toBeDefined();
  });

  // Rohdaten im Bericht: welche Variable an welchem Text hängt, und welche Familie je Modus
  // dahinter steht.
  it("names the bound variables and the family per mode in the report", async () => {
    const double = figmaDouble({ fonts: BOTH });
    const result = await report(double);
    expect(result.components[0]?.fonts).toEqual({
      bound: {
        fontFamily: ["typography/label/2/font-family", "typography/label/1/font-family"],
        fontStyle: ["typography/label/2/font-style", "typography/label/1/font-style"],
      },
      loaded: ["Archivo Black", "Geist Medium"],
      missing: [],
      crossing: [],
      refused: [],
      perAspekto: { ekzemplo: "Archivo Black", komuna: "Geist Medium" },
    });
  });
});

// F32 Teil 1: Der Lauf bindet die Radien des Rings und seines Abstands, statt Zahlen einzutragen.
// Gemessen wurde in der Datei das Gegenteil: boundVariables der beiden Knoten trug Paddings,
// Strichstärken und Striche — keinen Radius.
describe("the focus ring's radius is bound, not written (F32)", () => {
  async function file() {
    const double = figmaDouble({ fonts: MODEL_FONTS });
    await run(double);
    const set = double.root.children[0]?.children.find((child) => child.type === "COMPONENT_SET");
    const variant = set?.children[0];
    const ring = variant?.children.find(
      (child) => child.getSharedPluginData("fundamento", "part") === "focus-ring",
    );
    const gap = ring?.children.find(
      (child) => child.getSharedPluginData("fundamento", "part") === "focus-gap",
    );
    return { ring, gap };
  }

  it("binds both radii to the variables the plan names", async () => {
    const { ring, gap } = await file();
    expect(ring?.boundVariables.cornerRadius?.name).toBe("radius/focus/ring");
    expect(gap?.boundVariables.cornerRadius?.name).toBe("radius/focus/gap");
  });

  it("leaves no number behind on either node", async () => {
    const { ring, gap } = await file();
    // Neutral is what the plugin owns; anything else would be the base combination's radius.
    expect(ring?.properties.cornerRadius).toBe(0);
    expect(gap?.properties.cornerRadius).toBe(0);
  });
});

// F32 Nachtrag (Maintainer, 2026-09-23): „Ein Bericht, der Absicht statt Wirkung meldet, ist
// schlimmer als kein Bericht." fonts.perAspekto nannte die geplante Schrift, auch wenn der Lauf
// eine andere angewandt hatte. Gemeldet wird jetzt, was wirklich geladen wurde — und der Rückfall
// bleibt zuerst in der Familie der Marke: Archivo Regular sagt mehr über die Marke als Inter Black.
describe("the report names the font that was applied, not the one that was planned (F32)", () => {
  async function report(double: ReturnType<typeof figmaDouble>) {
    return (await new Function(
      "figma",
      `${files["figma/plugin/code.js"] ?? ""}\nreturn applyPlan();`,
    )(double.figma)) as {
      warnings: string[];
      components: { fonts: { perAspekto: Record<string, string>; missing: string[] } }[];
    };
  }

  it("names Archivo Regular when the file has the family but not the cut", async () => {
    const double = figmaDouble({
      fonts: [
        { family: "Geist", style: "Medium" },
        { family: "Archivo", style: "Regular" },
      ],
    });
    const result = await report(double);
    const fonts = result.components[0]?.fonts;
    expect(fonts?.perAspekto.ekzemplo).toBe("Archivo Regular");
    expect(fonts?.perAspekto.komuna).toBe("Geist Medium");
    // What the plan asked for and did not get keeps its name, so both are readable.
    expect(fonts?.missing).toEqual(["Archivo Black"]);
    expect(result.warnings.join(" | ")).toContain("Archivo Regular");
  });

  it("leaves the family only when the family itself is missing", async () => {
    const double = figmaDouble({ fonts: [{ family: "Geist", style: "Medium" }] });
    const result = await report(double);
    const fonts = result.components[0]?.fonts;
    expect(fonts?.perAspekto.ekzemplo).toBe("Inter Black");
    expect(fonts?.missing).toEqual(["Archivo Black"]);
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
    const set = double.root.children[0]?.children.find((child) => child.type === "COMPONENT_SET");
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
