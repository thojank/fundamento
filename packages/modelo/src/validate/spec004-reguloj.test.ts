// The five Reguloj of Spec 004 that the repository already keeps (T004): the red run comes from
// mutated fixtures. They guard structure, never taste — the positive cases below are as important
// as the negative ones (Fluida Marko, plan D-03).

import { rmSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import { fixtureModeloSource, projectModeloSource } from "../load/source.js";
import { mutatedFixture } from "./test-doubles/fixtures.js";
import { validateModelo } from "./validate-modelo.js";

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

type Json = Record<string, unknown>;
type Node = { $value: unknown };
const at = (value: Json, path: string): Node =>
  path.split(".").reduce<Json>((node, segment) => node[segment] as Json, value) as unknown as Node;

function issues(rule: string, mutate: Parameters<typeof mutatedFixture>[1]) {
  const root = mutatedFixture("regularo-kombinoj", mutate);
  roots.push(root);
  return validateModelo(fixtureModeloSource(root)).errors.filter((issue) => issue.rule === rule);
}

/** The brand fixture: it restates every token, so it carries a type scale and typography roles. */
const brandIssues = (rule: string, mutate: Parameters<typeof mutatedFixture>[1]) => {
  const root = mutatedFixture("aspekto-ekzemplo", mutate);
  roots.push(root);
  const config = `${root}/fundamento.config.json`;
  return validateModelo(projectModeloSource(config)).errors.filter((issue) => issue.rule === rule);
};

const BRAND_SET = "aspekto-ekzemplo/sets/aspekto/ekzemplo.json";

const grey = (component: number) => ({
  colorSpace: "srgb",
  components: [component, component, component],
});

describe("palette-even (Spec 004, G4)", () => {
  it("reports a jump in the middle of a ramp", () => {
    const found = issues("palette-even", (edit) =>
      edit("vortaro/sets/core.json", (core: Json) => {
        // 600 moves up towards 300, so the rate of 300 → 600 collapses against the median.
        at(core, "color.palette.neutral.600").$value = grey(0.62);
      }),
    );
    expect(found).toHaveLength(1);
    expect(found[0]?.path).toContain("color.palette.neutral");
    expect(found[0]?.message).toContain("%");
  });

  it("accepts a ramp with even but small steps", () => {
    const found = issues("palette-even", (edit) =>
      edit("vortaro/sets/core.json", (core: Json) => {
        const neutral = at(core, "color.palette.neutral") as unknown as Record<string, Node>;
        // The same progression, only finer: regular, just not as far apart as before.
        const fine: Record<string, number> = {
          "50": 0.995,
          "100": 0.98,
          "200": 0.955,
          "300": 0.93,
          "600": 0.855,
          "700": 0.83,
          "800": 0.805,
          "900": 0.78,
          "950": 0.7675,
        };
        for (const [step, component] of Object.entries(fine)) {
          const node = neutral[step];
          if (node) node.$value = grey(component);
        }
      }),
    );
    expect(found).toEqual([]);
  });

  it("accepts a finer step at the edge of a ramp", () => {
    const found = issues("palette-even", (edit) =>
      edit("vortaro/sets/core.json", (core: Json) => {
        // The first step after the anchor is much finer than the rest: an edge, not a finding.
        at(core, "color.palette.neutral.50").$value = grey(0.995);
      }),
    );
    expect(found).toEqual([]);
  });
});

describe("palette-aligned (Spec 004, G5)", () => {
  it("reports a ramp that drifts away from the others at one step", () => {
    const found = issues("palette-aligned", (edit) =>
      edit("vortaro/sets/core.json", (core: Json) => {
        at(core, "color.palette.accent.600").$value = grey(0.2);
      }),
    );
    expect(found.length).toBeGreaterThan(0);
    expect(found[0]?.message).toContain("600");
  });
});

describe("srgb-gamut (Spec 004, G6)", () => {
  it("reports a component outside 0 … 1", () => {
    const found = issues("srgb-gamut", (edit) =>
      edit("vortaro/sets/core.json", (core: Json) => {
        at(core, "color.palette.accent.600").$value = {
          colorSpace: "srgb",
          components: [1.04, 0.2, 0.2],
        };
      }),
    );
    // The primitive and the role that aliases it both resolve outside the gamut.
    expect(found.length).toBeGreaterThan(0);
    expect(found.map((issue) => issue.path).join(" ")).toContain("color.palette.accent.600");
    expect(found[0]?.message).toContain("1.04");
  });
});

describe("type-scale (Spec 004, G7)", () => {
  it("reports one ratio that jumps out of the scale", () => {
    const found = brandIssues("type-scale", (edit) =>
      edit(BRAND_SET, (brand: Json) => {
        at(brand, "font.size.scale.300").$value = { value: 25.6, unit: "px" };
      }),
    );
    expect(found.length).toBeGreaterThan(0);
    expect(found[0]?.message).toContain("%");
  });

  it("accepts a scale with a constant ratio of 1.5", () => {
    const found = brandIssues("type-scale", (edit) =>
      edit(BRAND_SET, (brand: Json) => {
        const scale = at(brand, "font.size.scale") as unknown as Record<string, Node>;
        Object.keys(scale)
          .filter((step) => !step.startsWith("$"))
          .sort((a, b) => Number(a) - Number(b))
          .forEach((step, index) => {
            const node = scale[step];
            if (node) node.$value = { value: Number((8 * 1.5 ** index).toFixed(3)), unit: "px" };
          });
      }),
    );
    expect(found).toEqual([]);
  });
});

describe("type-rhythm (Spec 004, G8)", () => {
  it("reports a line height that grows with the size inside one family", () => {
    const found = brandIssues("type-rhythm", (edit) =>
      edit(BRAND_SET, (brand: Json) => {
        at(brand, "font.lineheight.display.1").$value = "{font.lineheight.scale.loose}";
      }),
    );
    expect(found.length).toBeGreaterThan(0);
    expect(found[0]?.message).toContain("line height");
    expect(found[0]?.message).toContain("display");
  });

  it("says nothing about two roles of different families at neighbouring sizes", () => {
    // label.1 (14 px, snug) next to body.1 (16 px, normal) is a decision, not a rhythm break.
    const found = brandIssues("type-rhythm", () => {});
    expect(found).toEqual([]);
  });
});
