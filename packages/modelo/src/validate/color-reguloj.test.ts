// The colour Reguloj of Spec 002 on the fixture valid/regularo-kombinoj (T005–T008): the edge
// cases that the committed invalid fixtures do not cover.

import { rmSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import { fixtureModeloSource } from "../load/source.js";
import { mutatedFixture } from "./test-doubles/fixtures.js";
import { validateModelo } from "./validate-modelo.js";

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

type Json = Record<string, unknown>;
type Node = { $value: unknown; $description?: string };
const at = (value: Json, path: string): Node =>
  path.split(".").reduce<Json>((node, segment) => node[segment] as Json, value) as unknown as Node;

function errors(mutate: Parameters<typeof mutatedFixture>[1]) {
  const root = mutatedFixture("regularo-kombinoj", mutate);
  roots.push(root);
  return validateModelo(fixtureModeloSource(root)).errors;
}

describe("text-hierarchy (FR-02)", () => {
  it("reports contrast that rises from subtle to muted", () => {
    const issues = errors((edit) =>
      edit("vortaro/sets/core.json", (core: Json) => {
        at(core, "color.text.subtle").$value = "{color.palette.neutral.600}";
        at(core, "color.text.muted").$value = "{color.palette.neutral.700}";
      }),
    ).filter((issue) => issue.rule === "text-hierarchy");
    expect(issues.map((issue) => issue.path)).toEqual([
      "rezolvo(color-scheme=light,contrast=default)/color.text.muted",
    ]);
    expect(issues[0]?.message).toContain("contrast must not rise");
  });

  it("counts two aliases to the same value as a collapse", () => {
    const issues = errors((edit) =>
      edit("vortaro/sets/core.json", (core: Json) => {
        // A second palette step with the value of neutral.700, under another name.
        const neutral = at(core, "color.palette.neutral") as unknown as Record<string, Node>;
        neutral["650"] = { $value: structuredClone(neutral["700"]?.$value) };
        at(core, "color.text.muted").$value = "{color.palette.neutral.650}";
      }),
    ).filter((issue) => issue.rule === "text-hierarchy");
    expect(issues.map((issue) => issue.path)).toEqual([
      "rezolvo(color-scheme=light,contrast=default)/color.text.muted",
    ]);
    expect(issues[0]?.message).toContain("both resolve to #595959");
  });

  it("says that the Aspekto needs a step when the ramp has fewer than three above the threshold", () => {
    const issues = errors((edit) => {
      // Lighten the dark end of the ramp so only 1000 and 950 reach 7:1 on white.
      edit("vortaro/sets/core.json", (core: Json) => {
        for (const step of ["900", "800", "700", "600"]) {
          const token = at(core, `color.palette.neutral.${step}`);
          token.$value = { colorSpace: "srgb", components: [0.6, 0.6, 0.6], hex: "#999999" };
        }
      });
      edit("vortaro/sets/contrast/high.json", (high: Json) => {
        at(high, "color.text.muted").$value = "{color.palette.neutral.950}";
      });
    }).filter(
      (issue) =>
        issue.rule === "text-hierarchy" &&
        issue.combination?.contrast === "high" &&
        issue.combination["color-scheme"] === "light",
    );
    expect(issues[0]?.message).toContain(
      "the Aspekto needs one more step; the core lowers nothing",
    );
  });
});

describe("state-distinct (FR-03, D-07)", () => {
  it("suggests moving the state away from the lightness of the variant's text", () => {
    const issue = errors((edit) =>
      edit("vortaro/sets/core.json", (core: Json) => {
        at(core, "color.action.primary.hover").$value = "{color.palette.accent.600}";
      }),
    ).find((candidate) => candidate.rule === "state-distinct");
    expect(issue?.path).toBe(
      "rezolvo(color-scheme=light,contrast=default)/color.action.primary.hover",
    );
    expect(issue?.suggestion).toContain("away from the lightness of color.action.primary.text");
    expect(issue?.message).toContain("by 0.000 in OKLCH lightness, below 0.05");
  });

  it("reports one distinct violation once and counts the combinations it appears in", () => {
    const issues = errors((edit) =>
      edit("vortaro/sets/core.json", (core: Json) => {
        at(core, "color.action.primary.hover").$value = "{color.palette.accent.600}";
      }),
    ).filter((candidate) => candidate.rule === "state-distinct");
    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toMatch(/Same in 2 combinations\.$/);
  });

  it("reads the threshold from sojlo", () => {
    const strict = errors((edit) =>
      edit("data/reguloj.json", (file: { reguloj: Record<string, unknown>[] }) => {
        const regulo = file.reguloj.find((entry) => entry.name === "state-distinct");
        if (regulo) regulo.sojlo = { metric: "oklch-l-delta", min: 0.5 };
      }),
    ).filter((candidate) => candidate.rule === "state-distinct");
    expect(strict.length).toBeGreaterThan(0);
  });
});

describe("semantic-described (FR-04)", () => {
  it("does not check primitives", () => {
    const issues = errors((edit) =>
      edit("vortaro/sets/core.json", (core: Json) => {
        delete at(core, "color.palette.neutral.0").$description;
      }),
    ).filter((issue) => issue.rule === "semantic-described");
    expect(issues).toEqual([]);
  });
});

describe("text-hierarchy with a minimum lightness difference (Spec 002 FR-02, T027)", () => {
  it("reports neighbouring roles closer than sojlo.min, with the difference in the message", () => {
    const issue = errors((edit) =>
      edit("vortaro/sets/color-scheme/dark+contrast/high.json", (set: Json) => {
        at(set, "color.text.subtle").$value = "{color.palette.neutral.50}";
      }),
    ).find((candidate) => candidate.rule === "text-hierarchy");
    expect(issue?.path).toBe("rezolvo(color-scheme=dark,contrast=high)/color.text.subtle");
    expect(issue?.message).toMatch(
      /differs from color\.text\.default by 0\.0\d\d in OKLCH lightness, below 0\.05/,
    );
  });

  it("requires a sojlo for text-hierarchy", () => {
    const issues = errors((edit) =>
      edit("data/reguloj.json", (file: { reguloj: Record<string, unknown>[] }) => {
        const regulo = file.reguloj.find((entry) => entry.name === "text-hierarchy");
        if (regulo) delete regulo.sojlo;
      }),
    ).filter((issue) => issue.rule === "regulo-sojlo-missing");
    expect(issues.map((issue) => issue.path)).toEqual(["data/reguloj.json#/reguloj/2"]);
  });
});
