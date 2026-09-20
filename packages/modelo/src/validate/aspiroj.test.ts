// Aspiroj (Spec 004 T005, plan D-03): a design goal one brand sets itself. Same measurement as a
// Regulo, own bound, own reason, checked only for that brand — and never a rule for anyone else.

import { rmSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import { projectModeloSource } from "../load/source.js";
import { mutatedFixture } from "./test-doubles/fixtures.js";
import { validateModelo } from "./validate-modelo.js";

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

type Json = Record<string, unknown>;
const ASPEKTO_FILE = "aspekto-ekzemplo/aspekto.json";
const BRAND_SET = "aspekto-ekzemplo/sets/aspekto/ekzemplo.json";

function report(mutate: Parameters<typeof mutatedFixture>[1]) {
  const root = mutatedFixture("aspekto-ekzemplo", mutate);
  roots.push(root);
  return validateModelo(projectModeloSource(`${root}/fundamento.config.json`));
}

const withAspiroj =
  (aspiroj: unknown[]) => (edit: Parameters<Parameters<typeof mutatedFixture>[1]>[0]) =>
    edit(ASPEKTO_FILE, (file: Json) => {
      file.aspiroj = aspiroj;
    });

describe("aspiroj of one brand", () => {
  it("reports a goal the brand misses, with metric, measurement, bound and reason", () => {
    const issues = report(
      withAspiroj([
        {
          metriko: "wcag2-reserve",
          min: 0.9,
          kialo: "The reference brand shows what is reachable without prescribing it to others.",
        },
      ]),
    ).errors.filter((issue) => issue.rule === "aspiro-missed");
    expect(issues).toHaveLength(1);
    expect(issues[0]?.path).toContain("aspekto.json#/aspiroj/0");
    expect(issues[0]?.message).toContain("ekzemplo");
    expect(issues[0]?.message).toContain("wcag2-reserve");
    expect(issues[0]?.message).toContain("Design goal");
    expect(issues[0]?.message).not.toContain("Regulo");
    expect(issues[0]?.suggestion).toContain("aspekto.json");
  });

  it("says nothing when the brand reaches its goal", () => {
    const issues = report(
      withAspiroj([
        { metriko: "wcag2-reserve", min: 0.01, kialo: "A small reserve is enough here." },
      ]),
    ).errors.filter((issue) => issue.rule === "aspiro-missed");
    expect(issues).toEqual([]);
  });

  it("measures coverage per Dimensio value with a scope", () => {
    const issues = report(
      withAspiroj([
        {
          metriko: "dimensio-kovrado",
          dimensio: "color-scheme",
          valoro: "dark",
          appliesTo: { tokens: ["color.background.**"] },
          min: 1,
          kialo: "A dark mode every brand shares is an implementation, not a design.",
        },
      ]),
    ).errors.filter((issue) => issue.rule === "aspiro-missed");
    expect(issues).toHaveLength(1);
    expect(issues[0]?.message).toContain("dimensio-kovrado");
    expect(issues[0]?.message).toContain("color-scheme=dark");
  });

  it("rejects a goal without a reason and a goal without a bound", () => {
    const noKialo = report(withAspiroj([{ metriko: "wcag2-reserve", min: 0.1 }])).errors;
    expect(noKialo.some((issue) => issue.rule === "schema-violation")).toBe(true);
    const noBound = report(withAspiroj([{ metriko: "wcag2-reserve", kialo: "Something." }])).errors;
    expect(noBound.some((issue) => issue.rule === "schema-violation")).toBe(true);
  });

  it("a brand without aspiroj is completely valid (Fluida Marko)", () => {
    const issues = report(() => {}).errors.filter((issue) => issue.rule === "aspiro-missed");
    expect(issues).toEqual([]);
  });

  it("a brand with pure white surfaces and a ratio of 1.5 keeps every Regulo", () => {
    const grey = (component: number) => ({
      colorSpace: "srgb",
      components: [component, component, component],
    });
    const errors = report((edit) =>
      edit(BRAND_SET, (brand: Json) => {
        const set = brand as {
          color: { background: Record<string, { $value: unknown } | undefined> };
          font: { size: { scale: Record<string, { $value: unknown } | undefined> } };
        };
        // Taste, not structure: pure white as the top surface, the others a step apart …
        const surfaces: Record<string, number> = {
          raised: 1,
          default: 0.9345,
          canvas: 0.8698,
          sunken: 0.806,
        };
        for (const [role, component] of Object.entries(surfaces)) {
          const node = set.color.background[role];
          if (node) node.$value = grey(component);
        }
        // … and a scale that grows by half at every step.
        Object.keys(set.font.size.scale)
          .filter((step) => !step.startsWith("$"))
          .sort((a, b) => Number(a) - Number(b))
          .forEach((step, index) => {
            const node = set.font.size.scale[step];
            if (node) node.$value = { value: Number((8 * 1.5 ** index).toFixed(3)), unit: "px" };
          });
      }),
    ).errors.filter(
      (issue) =>
        issue.rule === "type-scale" ||
        issue.rule === "aspiro-missed" ||
        (issue.rule === "surface-distinct" &&
          issue.combination?.["color-scheme"] === "light" &&
          issue.combination?.aspekto === "ekzemplo"),
    );
    expect(errors).toEqual([]);
  });
});
