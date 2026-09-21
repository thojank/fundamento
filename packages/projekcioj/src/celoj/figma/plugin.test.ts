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

/**
 * A file that has the model's font, as a prepared test file would. Only the tests of the fallback
 * run in a bare file, where the label falls back to Inter with a warning.
 */
const MODEL_FONTS = [{ family: "Geist", style: "Medium" }] as const;
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
    expect(lines.join("\n")).toContain('"set": "butono"');
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
    expect(again.warnings).toHaveLength(2);
    expect(again.warnings[0]).toContain(LAST);
    expect(again.warnings[0]).toContain("vorgefunden");
    expect(again.warnings[1]).toContain("zwischen den Läufen");
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
    expect(bound.paddingRight).toBe(bound.paddingLeft);
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
    expect(ring?.boundVariables.paddingLeft).toBe("focus/ring/width");
    expect(ring?.boundVariables.paddingTop).toBe("focus/ring/width");
    expect(gap?.boundVariables.paddingLeft).toBe("focus/offset");
    expect(gap?.boundVariables.paddingBottom).toBe("focus/offset");
    // Not focused: the space is there, the ring is not.
    expect(ring?.properties.fills).toEqual([]);
    expect(gap?.properties.fills).toEqual([]);
  });

  it("shows ring and gap in their colours, bound to the tokens, in the focus state", async () => {
    const variant = await variantOf(modelDouble(), "focus");
    const ring = find(variant, "focus-ring");
    const gap = find(variant, "focus-gap");
    const [ringPaint] = (ring?.properties.fills ?? []) as {
      boundVariables?: { color?: unknown };
    }[];
    const [gapPaint] = (gap?.properties.fills ?? []) as { boundVariables?: { color?: unknown } }[];
    expect(ringPaint?.boundVariables?.color).toMatchObject({ name: "focus/ring/color" });
    expect(gapPaint?.boundVariables?.color).toMatchObject({ name: "color/focus/inner" });
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
    expect(variant?.properties.primaryAxisSizingMode).toBe("AUTO");
    expect(variant?.properties.counterAxisSizingMode).toBe("AUTO");
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
    "effects",
    "cornerRadius",
    "opacity",
    "clipsContent",
    "layoutMode",
  ];

  it("leaves no tool default on any node it drew, the component set included", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    expect(double.untouchedDefaults(OWNED)).toEqual([]);
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

  it("declares one TEXT property label, with the Vitrino's text as its default", async () => {
    const double = modelDouble();
    await run(double, repoFiles["figma/plugin/code.js"] ?? "");
    const definitions = (setOf(double)?.properties.componentPropertyDefinitions ??
      {}) as Definitions;
    const keys = Object.keys(definitions).filter((key) => key.startsWith("label#"));
    expect(keys).toHaveLength(1);
    expect(definitions[keys[0] ?? ""]).toEqual({
      type: "TEXT",
      defaultValue: "secondary · default · medium",
    });
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
