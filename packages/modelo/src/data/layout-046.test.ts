// The layout Eroj of Eroj-Runde 7 (Spec 046 T1, section A): vico (row), kolumno (column) and stako
// (stack). They place their children and draw nothing themselves: no colour, no font, only the gap
// between the children, bound to a spacing step of core (A-4: spacing.*), as list_arangxoj names
// the steps in interspacoj. Props in English (A-3), any children in the default slot (B-7: the
// Uzo names no slot, like the media slot of the karto). Counts and steps come from the Modelo.

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
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);

/** The spacing steps of core by their last name (xsmall … xxlarge), as list_arangxoj gives them. */
const steps = listArangxoj(modelo).interspacoj.map((item) => item.token.split(".").at(-1) ?? "");

const LAYOUT = [
  { name: "vico", goal: "row", props: ["gap", "align", "justify", "wrap"] },
  { name: "kolumno", goal: "column", props: ["gap", "align", "justify", "wrap"] },
  { name: "stako", goal: "stack", props: ["gap"] },
] as const;

/** Part properties that would give a layout Ero a colour or a font of its own. */
const DRAWN = ["fill", "color", "typography", "weight", "shadow", "stroke", "ring", "radius"];

describe("the layout Eroj in the repo Modelo (Spec 046 T1)", () => {
  it("has spacing steps to take the gap from", () => {
    expect(steps.length).toBeGreaterThan(0);
    expect(steps).toContain("medium");
  });

  for (const { name, goal, props } of LAYOUT) {
    describe(name, () => {
      const entry = eroNamed(name);
      const skemo = entry?.skemo;

      it(`lives in data/eroj/${name}/ with a Skemo and a Uzo`, () => {
        expect(entry?.file).toBe(`modelo/data/eroj/${name}/skemo.json`);
        expect(entry?.uzo).toBeDefined();
      });

      it("has its props in English, gap over exactly the spacing steps (default medium)", () => {
        expect(skemo?.props.map((prop) => prop.name)).toEqual([...props]);
        const gap = skemo?.props.find((prop) => prop.name === "gap");
        expect(gap?.kind).toBe("enum");
        expect(gap?.values).toEqual(steps);
        expect(gap?.default).toBe("medium");
        const wrap = skemo?.props.find((prop) => prop.name === "wrap");
        if (props.includes("wrap" as never)) {
          expect([wrap?.kind, wrap?.default]).toEqual(["boolean", false]);
          for (const axis of ["align", "justify"]) {
            const prop = skemo?.props.find((each) => each.name === axis);
            expect(prop?.kind).toBe("enum");
            expect(prop?.values).toContain(prop?.default);
          }
        }
        expect(skemo?.states).toEqual(["rest"]);
      });

      it("binds the gap of its box per step to that spacing step, and draws nothing", () => {
        expect(Object.keys(skemo?.parts ?? {})).toEqual(["box"]);
        expect(Object.keys(skemo?.parts.box ?? {})).toEqual(["gap"]);
        for (const step of steps) {
          if (skemo === undefined) throw new Error(`${name} has no Skemo`);
          expect(boundToken(skemo, "box", "gap", { gap: step })?.token).toBe(`spacing.${step}`);
        }
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

      it(`answers the layout purpose ${goal} with a gap`, () => {
        expect(skemo?.goals?.map((each) => each.goal)).toEqual([goal]);
        expect(skemo?.goals?.[0]?.props).toEqual({ gap: "medium" });
      });

      it("has its page written: when-not, do-dont and keyboard, none a placeholder", () => {
        const uzo = entry?.uzo as unknown as Record<string, unknown> | undefined;
        for (const field of DOKU_KAMPOJ) {
          expect(uzo?.[field]).toBeDefined();
          expect(isDokuOffen(uzo?.[field])).toBe(false);
        }
      });
    });
  }

  it("validates without an issue in the files of the three Eroj", () => {
    const report = validateModelo(defaultModeloSource());
    const ours = [...report.errors, ...report.warnings].filter((issue) =>
      LAYOUT.some(({ name }) => issue.path.includes(`/eroj/${name}/`)),
    );
    expect(ours.map((issue) => [issue.rule, issue.path])).toEqual([]);
  });
});

// The gap rule as a fixture (testing.md: a positive and a negative case, path and rule exact): the
// vico Skemo of the repo in a copy of valid/ero-minimal, whose core has the steps small and medium.
describe("the vico Skemo in a fixture Modelo (Spec 046 T1)", () => {
  const FILE = "data/eroj/vico/skemo.json";
  type Binding = { part: string; property: string; when?: Record<string, string>; token: string };
  type EroFile = {
    ero: { id: string; skemo: string };
    skemo: { props: { name: string; values?: string[] }[]; bindings: Binding[] };
  };
  const repoFile = (): EroFile =>
    JSON.parse(
      readFileSync(join(import.meta.dirname, "../../data/eroj/vico/skemo.json"), "utf8"),
    ) as EroFile;

  function issuesOf(change: (file: EroFile) => void) {
    const root = mutatedFixture("ero-minimal", (edit) => {
      const file = repoFile();
      const fixtureSteps = ["small", "medium"];
      const gap = file.skemo.props.find((prop) => prop.name === "gap");
      if (gap !== undefined) gap.values = fixtureSteps;
      file.skemo.bindings = file.skemo.bindings.filter(
        (binding) => binding.when?.gap === undefined || fixtureSteps.includes(binding.when.gap),
      );
      change(file);
      edit(FILE, () => file);
      edit("data/ids.lock.json", (lock: { ids: Record<string, unknown> }) => {
        lock.ids[file.ero.id] = { status: "active", type: "ero" };
        lock.ids[file.ero.skemo] = { status: "active", type: "skemo" };
        return lock;
      });
    });
    const report = validateModelo(fixtureModeloSource(root));
    return [...report.errors, ...report.warnings].map((issue) => ({
      rule: issue.rule,
      path: issue.path,
    }));
  }

  it("positive: the layout Skemo validates", () => {
    expect(issuesOf(() => {})).toEqual([]);
  });

  it("negative: a step without its binding is skemo-binding-missing at the gap of the box", () => {
    expect(
      issuesOf((file) => {
        file.skemo.bindings = file.skemo.bindings.filter((binding) => binding.when?.gap !== "small");
      }),
    ).toEqual([{ rule: "skemo-binding-missing", path: `${FILE}#/skemo/parts/box/gap` }]);
  });

  it("negative: a gap bound to a colour is skemo-token-type", () => {
    const issues = issuesOf((file) => {
      const binding = file.skemo.bindings.find((each) => each.when?.gap === "small");
      if (binding !== undefined) binding.token = "color.text.default";
    });
    expect(issues.map((issue) => issue.rule)).toContain("skemo-token-type");
    expect(issues.filter((issue) => issue.rule === "skemo-token-type")[0]?.path).toMatch(
      /^data\/eroj\/vico\/skemo\.json#\/skemo\/bindings\/\d+\/token$/,
    );
  });
});
