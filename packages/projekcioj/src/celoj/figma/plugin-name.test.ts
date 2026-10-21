// Nachlese 8 ① (F-13, Abnahme Spec 020): the normal build and the build with the test brands had
// the same plugin id `fundamento-apply-plan` and the same name, so Figma ran the code imported
// first. Name and id carry the brands of the build now; the build with komuna alone keeps the id
// it had, so the imports that exist go on working.

import { describe, expect, it } from "vitest";
import type { FigmaPlan } from "./figma.js";
import { pluginManifest } from "./plugin.js";

const planWith = (aspektoj: string[]): FigmaPlan =>
  ({
    fundamento: "0.2.0",
    collections: [
      { name: "fundamento", modes: ["value"], variables: [] },
      { name: "aspekto", modes: aspektoj, variables: [] },
    ],
    components: [],
  }) as unknown as FigmaPlan;

const manifest = (aspektoj: string[], build = "abc1234") =>
  JSON.parse(pluginManifest(planWith(aspektoj), build)) as { id: string; name: string };

describe("the plugin's name and id follow the brands of the build (F-13)", () => {
  it("komuna alone keeps the id fundamento-apply-plan; its name names the build and the brand", () => {
    const normal = manifest(["komuna"]);
    expect(normal.id).toBe("fundamento-apply-plan");
    expect(normal.name).toContain("Fundamento 0.2.0 (abc1234 · komuna)");
  });

  it("two builds with other brand lists have different ids and names", () => {
    const provoj = manifest(["komuna", "provo", "provo-kompakta"]);
    const ekzemplo = manifest(["komuna", "ekzemplo"]);
    expect(provoj.name).toContain("Fundamento 0.2.0 (abc1234 · komuna, provo, provo-kompakta)");
    expect(provoj.id).toMatch(/^fundamento-apply-plan-[0-9a-f]{8}$/);
    expect(ekzemplo.id).toMatch(/^fundamento-apply-plan-[0-9a-f]{8}$/);
    expect(provoj.id).not.toBe(ekzemplo.id);
    expect(provoj.id).not.toBe(manifest(["komuna"]).id);
    expect(provoj.name).not.toBe(ekzemplo.name);
  });

  it("two builds with the same list have the same id, whatever the commit", () => {
    const list = ["komuna", "provo", "provo-kompakta"];
    expect(manifest(list, "abc1234").id).toBe(manifest(list, "def5678").id);
  });
});
