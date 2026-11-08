// The grid of Eroj-Runde 7 (Spec 046 T2, section A): krado places any children in columns – a
// number of them (1 to 12) or as many as fit (auto), each at least as wide as a step of the
// container widths of core (min-width, size.container.*, plan D-13) – with the gap of a spacing
// step between them (spacing.*, A-4). A child spans as many columns as its data-span says, at most
// as many as there are (the Web Component clamps it). It draws nothing: no colour, no font. Props
// in English (A-3), any children in the default slot (B-7), the layout purpose column (with the
// kolumno). Below the Uzo's columns-from the grid stacks. Steps come from the Modelo.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DOKU_KAMPOJ, isDokuOffen } from "../eroj/dokumentaro.js";
import { boundToken } from "../eroj/skemo-rules.js";
import { listArangxoj } from "../gvidanto/arangxoj.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource, fixtureModeloSource } from "../load/source.js";
import { mutatedFixture } from "../validate/test-doubles/fixtures.js";
import { validateModelo } from "../validate/validate-modelo.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const entry = modelo.eroj.find((each) => each.ero.name === "krado");
const skemo = entry?.skemo;
const propOf = (name: string) => skemo?.props.find((prop) => prop.name === name);

/** The spacing steps of core by their last name (xsmall … xxlarge), as list_arangxoj gives them. */
const steps = listArangxoj(modelo).interspacoj.map((item) => item.token.split(".").at(-1) ?? "");

/** The tokens of core, by name. */
const core = modelo.setoj.find((set) => set.name === "core")?.tokens ?? {};

/** The column counts krado takes: 1 to 12, or auto. */
const COLUMNS = [...Array.from({ length: 12 }, (_, index) => String(index + 1)), "auto"];

/** The steps of min-width: the container widths of core below max (plan D-13). */
const MIN_WIDTHS = ["small", "medium", "large"];

/** Part properties that would give a layout Ero a colour or a font of its own. */
const DRAWN = ["fill", "color", "typography", "weight", "shadow", "stroke", "ring", "radius"];

describe("krado in the repo Modelo (Spec 046 T2)", () => {
  it("lives in data/eroj/krado/ with a Skemo and a Uzo", () => {
    expect(entry?.file).toBe("modelo/data/eroj/krado/skemo.json");
    expect(entry?.uzo).toBeDefined();
  });

  it("has columns, min-width and gap in English, in that order, and the one state rest", () => {
    expect(skemo?.props.map((prop) => prop.name)).toEqual(["columns", "min-width", "gap"]);
    expect(skemo?.states).toEqual(["rest"]);
  });

  it("takes 1 to 12 columns or auto, auto by default", () => {
    expect(propOf("columns")?.kind).toBe("enum");
    expect(propOf("columns")?.values).toEqual(COLUMNS);
    expect(propOf("columns")?.default).toBe("auto");
  });

  it("names min-width by the steps of a token row, never a length, small by default", () => {
    const minWidth = propOf("min-width");
    expect(minWidth?.kind).toBe("enum");
    expect(minWidth?.values).toEqual(MIN_WIDTHS);
    expect(minWidth?.default).toBe("small");
    for (const value of minWidth?.values ?? []) expect(value).toMatch(/^[a-z]+$/);
  });

  it("binds each min-width step to the container width of core of the same name", () => {
    if (skemo === undefined) throw new Error("krado has no Skemo");
    for (const step of MIN_WIDTHS) {
      const token = boundToken(skemo, "cell", "width", { "min-width": step })?.token;
      expect(token).toBe(`size.container.${step}`);
      expect(core[token ?? ""]?.type).toBe("dimension");
    }
  });

  it("takes the gap over exactly the spacing steps (default medium), bound to that step", () => {
    if (skemo === undefined) throw new Error("krado has no Skemo");
    const gap = propOf("gap");
    expect([gap?.kind, gap?.default]).toEqual(["enum", "medium"]);
    expect(gap?.values).toEqual(steps);
    for (const step of steps) {
      expect(boundToken(skemo, "box", "gap", { gap: step })?.token).toBe(`spacing.${step}`);
    }
  });

  it("draws nothing: the box has its gap, the cell its width, no colour and no font", () => {
    expect(skemo?.parts).toEqual({
      box: { gap: { by: ["gap"] } },
      cell: { width: { by: ["min-width"] } },
    });
    const drawn = Object.values(skemo?.parts ?? {}).flatMap((properties) =>
      Object.keys(properties).filter((property) => DRAWN.includes(property)),
    );
    expect(drawn).toEqual([]);
  });

  it("takes any children in its default slot; no role, no name, no key", () => {
    expect(skemo?.slots).toEqual([{ name: "content", default: true }]);
    expect(entry?.uzo?.slots).toEqual({});
    expect(skemo?.a11y).toEqual({ role: "generic", name: [], states: {}, keys: [] });
  });

  it("names data-span on the children in the description of columns, like the th's data-sort", () => {
    expect(propOf("columns")?.description).toContain("data-span");
  });

  it("answers the layout purpose column with a number of columns and a gap", () => {
    expect(skemo?.goals?.map((each) => each.goal)).toEqual(["column"]);
    expect(skemo?.goals?.[0]?.props).toEqual({ columns: "3", gap: "medium" });
  });

  it("stacks below the container width its Uzo names (columns-from, a size.container token)", () => {
    expect(entry?.uzo?.layout).toEqual({
      size: "container",
      wrap: "allowed",
      "columns-from": "size.container.small",
    });
  });

  it("has its page written: when-not, do-dont and keyboard, none a placeholder", () => {
    const uzo = entry?.uzo as unknown as Record<string, unknown> | undefined;
    for (const field of DOKU_KAMPOJ) {
      expect(uzo?.[field]).toBeDefined();
      expect(isDokuOffen(uzo?.[field])).toBe(false);
    }
  });

  it("validates without an issue in its files", () => {
    const report = validateModelo(defaultModeloSource());
    const ours = [...report.errors, ...report.warnings].filter((issue) =>
      issue.path.includes("/eroj/krado/"),
    );
    expect(ours.map((issue) => [issue.rule, issue.path])).toEqual([]);
  });
});

// The prop rules as fixtures (testing.md: a positive and a negative case, path and rule exact;
// plan D-07: a copy of valid/ero-minimal, whose core has the spacing steps small and medium; the
// test adds the container widths small and medium of core): the krado Skemo of the repo.
describe("the krado Skemo in a fixture Modelo (Spec 046 T2)", () => {
  const FILE = "data/eroj/krado/skemo.json";
  type Binding = { part: string; property: string; when?: Record<string, string>; token: string };
  type Prop = { name: string; values?: string[]; default?: string };
  type EroFile = {
    ero: { id: string; skemo: string };
    skemo: {
      props: Prop[];
      bindings: Binding[];
      goals?: { props: Record<string, string> }[];
    };
  };
  const repoFile = (): EroFile =>
    JSON.parse(
      readFileSync(join(import.meta.dirname, "../../data/eroj/krado/skemo.json"), "utf8"),
    ) as EroFile;

  /** Keeps the values of a prop the fixture core has tokens for, and their bindings. */
  const narrow = (file: EroFile, prop: string, kept: string[]) => {
    const found = file.skemo.props.find((each) => each.name === prop);
    if (found !== undefined) found.values = kept;
    file.skemo.bindings = file.skemo.bindings.filter(
      (binding) => binding.when?.[prop] === undefined || kept.includes(binding.when[prop]),
    );
  };

  /** The container widths small and medium of core, for the copy. */
  const CONTAINERS = [
    { step: "small", value: 640, id: `tok_01M6ZKRAD${"0".repeat(15)}A1` },
    { step: "medium", value: 960, id: `tok_01M6ZKRAD${"0".repeat(15)}A2` },
  ];

  function issuesOf(change: (file: EroFile) => void) {
    const root = mutatedFixture("ero-minimal", (edit) => {
      const file = repoFile();
      narrow(file, "gap", ["small", "medium"]);
      narrow(file, "min-width", ["small", "medium"]);
      change(file);
      edit(FILE, () => file);
      // The fixture core has no container widths: the two of core, with IDs of the copy.
      edit("vortaro/sets/core.json", (set: Record<string, unknown>) => {
        set.size = {
          container: Object.fromEntries(
            CONTAINERS.map(({ step, value, id }) => [
              step,
              {
                $type: "dimension",
                $value: { value, unit: "px" },
                $extensions: { fundamento: { id } },
              },
            ]),
          ),
        };
        return set;
      });
      edit("data/ids.lock.json", (lock: { ids: Record<string, unknown> }) => {
        lock.ids[file.ero.id] = { status: "active", type: "ero" };
        lock.ids[file.ero.skemo] = { status: "active", type: "skemo" };
        for (const { id } of CONTAINERS) lock.ids[id] = { status: "active", type: "token" };
        return lock;
      });
    });
    const report = validateModelo(fixtureModeloSource(root));
    return [...report.errors, ...report.warnings].map((issue) => ({
      rule: issue.rule,
      path: issue.path,
    }));
  }

  const bindingOf = (file: EroFile, step: string) =>
    file.skemo.bindings.findIndex((binding) => binding.when?.["min-width"] === step);

  it("positive: the grid Skemo validates", () => {
    expect(issuesOf(() => {})).toEqual([]);
  });

  it("negative: a goal with 13 columns is skemo-goal-invalid at that prop", () => {
    expect(
      issuesOf((file) => {
        const goal = file.skemo.goals?.[0];
        if (goal !== undefined) goal.props.columns = "13";
      }),
    ).toEqual([{ rule: "skemo-goal-invalid", path: `${FILE}#/skemo/goals/0/props/columns` }]);
  });

  it("negative: a goal with columns 0 is skemo-goal-invalid at that prop", () => {
    expect(
      issuesOf((file) => {
        const goal = file.skemo.goals?.[0];
        if (goal !== undefined) goal.props.columns = "0";
      }),
    ).toEqual([{ rule: "skemo-goal-invalid", path: `${FILE}#/skemo/goals/0/props/columns` }]);
  });

  it("negative: a min-width bound to a length instead of a token name is a schema violation", () => {
    const file = repoFile();
    narrow(file, "min-width", ["small", "medium"]);
    const index = bindingOf(file, "small");
    expect(index).toBeGreaterThanOrEqual(0);
    expect(
      issuesOf((each) => {
        const binding = each.skemo.bindings[index];
        if (binding !== undefined) binding.token = "240px";
      }),
    ).toEqual([{ rule: "schema-violation", path: `${FILE}#/skemo/bindings/${index}/token` }]);
  });

  it("negative: a min-width bound to a token core does not have is skemo-token-missing", () => {
    const file = repoFile();
    narrow(file, "min-width", ["small", "medium"]);
    const index = bindingOf(file, "medium");
    expect(
      issuesOf((each) => {
        const binding = each.skemo.bindings[index];
        if (binding !== undefined) binding.token = "size.container.tiny";
      }),
    ).toEqual([{ rule: "skemo-token-missing", path: `${FILE}#/skemo/bindings/${index}/token` }]);
  });

  it("negative: a goal with a min-width that is a length is skemo-goal-invalid at that prop", () => {
    expect(
      issuesOf((file) => {
        const goal = file.skemo.goals?.[0];
        if (goal !== undefined) goal.props["min-width"] = "240px";
      }),
    ).toEqual([{ rule: "skemo-goal-invalid", path: `${FILE}#/skemo/goals/0/props/min-width` }]);
  });
});
