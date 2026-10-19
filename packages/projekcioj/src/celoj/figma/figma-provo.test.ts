// Spec 016 ③ (G10, Abnahme 4): a derived Aspekto is an Aspekto like any other — `provo` appears
// as a mode of the collection aspekto beside komuna and ekzemplo, and every set follows. The
// way is the one the repository already goes (README: the brands stand in one config): a config
// with ekzemplo and provo, built with `fm projekcioj build --config …`.

import { projectModeloSource } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import { FIGMA_CELO, type FigmaPlan } from "./figma.js";

const config = new URL(
  "../../../../modelo/test/fixtures/valid/aspekto-provo/fundamento.tri.config.json",
  import.meta.url,
).pathname;
const prepared = celoInputOf(projectModeloSource(config));
if (!prepared.ok)
  throw new Error(
    `core + ekzemplo + provo must be valid: ${JSON.stringify(prepared.errors.slice(0, 2))}`,
  );
const plan = JSON.parse(
  FIGMA_CELO.generate(prepared.input).find((file) => file.path === "figma/plan.json")?.text ?? "{}",
) as FigmaPlan;
const collection = plan.collections.find((candidate) => candidate.name === "aspekto");

describe("provo in Figma (Spec 016 ③, G10)", () => {
  it("is a mode of the collection aspekto beside komuna and ekzemplo", () => {
    expect(collection?.modes).toEqual(["komuna", "ekzemplo", "provo"]);
  });

  it("gives every brand-dependent variable a value in the mode provo, and provo is a brand of its own", () => {
    const missing = (collection?.variables ?? [])
      .filter((variable) => variable.values.provo === undefined)
      .map((variable) => variable.name);
    expect(missing).toEqual([]);
    const own = (collection?.variables ?? []).filter(
      (variable) =>
        JSON.stringify(variable.values.provo) !== JSON.stringify(variable.values.komuna),
    );
    expect(own.length).toBeGreaterThan(50);
  });

  it("keeps every component set the same: the sets follow the mode, no set of its own", () => {
    const komunaOnly = celoInputOf(
      projectModeloSource(
        new URL(
          "../../../../modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
          import.meta.url,
        ).pathname,
      ),
    );
    if (!komunaOnly.ok) throw new Error("core + ekzemplo must be valid");
    const other = JSON.parse(
      FIGMA_CELO.generate(komunaOnly.input).find((file) => file.path === "figma/plan.json")?.text ??
        "{}",
    ) as FigmaPlan;
    const names = (value: FigmaPlan) =>
      (value as unknown as { components?: { set?: string }[] }).components?.map(
        (entry) => entry.set,
      ) ?? [];
    expect(names(plan)).toEqual(names(other));
    expect(names(plan).length).toBeGreaterThan(20);
  });
});
