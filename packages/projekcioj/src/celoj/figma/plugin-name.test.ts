// Nachlese 8 ① (F-13, Abnahme Spec 020): the normal build and the build with the test brands had
// the same plugin id `fundamento-apply-plan` and the same name, so Figma ran the code imported
// first. Name and id carry the brands of the build now; the build with komuna alone keeps the id
// it had, so the imports that exist go on working. Spec 027: the plugin of the Bauformen has ids
// and a name of its own (fundamento-grundlagen-…, „Fundamento Grundlagen 0.2.0 (…)"), so Figma does
// not run the code of a build imported before it, and the menu tells them apart. Spec 029 ①: the
// plugin of the Grundlagen (komuna after the Fonto, komuna-0-2) is „Fundamento Grundlagen …" with
// ids fundamento-grundlagen-…, apart from the Bauformen of Spec 027 in the menu and in Figma.

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
  it("komuna alone has an id of the Grundlagen; its name names the build and the brand", () => {
    const normal = manifest(["komuna"]);
    expect(normal.id).toMatch(/^fundamento-grundlagen-[0-9a-f]{8}$/);
    expect(normal.name).toContain("Fundamento Grundlagen 0.2.0 (abc1234 · komuna)");
  });

  it("two builds with other brand lists have different ids and names", () => {
    const provoj = manifest(["komuna", "provo", "provo-kompakta"]);
    const ekzemplo = manifest(["komuna", "ekzemplo"]);
    expect(provoj.name).toContain(
      "Fundamento Grundlagen 0.2.0 (abc1234 · komuna, provo, provo-kompakta)",
    );
    expect(provoj.id).toMatch(/^fundamento-grundlagen-[0-9a-f]{8}$/);
    expect(ekzemplo.id).toMatch(/^fundamento-grundlagen-[0-9a-f]{8}$/);
    expect(provoj.id).not.toBe(ekzemplo.id);
    expect(provoj.id).not.toBe(manifest(["komuna"]).id);
    expect(provoj.name).not.toBe(ekzemplo.name);
  });

  it("two builds with the same list have the same id, whatever the commit", () => {
    const list = ["komuna", "provo", "provo-kompakta"];
    expect(manifest(list, "abc1234").id).toBe(manifest(list, "def5678").id);
  });
});

describe("Spec 029 ①: the Grundlagen stand apart from the Bauformen of Spec 027", () => {
  it("komuna alone no longer has the id of the Bauformen plugin of Spec 027", () => {
    expect(manifest(["komuna"]).id).not.toBe("fundamento-bauformen-9fbc49bc");
    expect(manifest(["komuna"]).name).not.toContain("Bauformen");
  });

  it("the build with all five brands names komuna-0-2 in the menu", () => {
    const cxiuj = manifest(["komuna", "ekzemplo", "provo", "provo-kompakta", "komuna-0-2"]);
    expect(cxiuj.name).toContain(
      "Fundamento Grundlagen 0.2.0 (abc1234 · komuna, ekzemplo, provo, provo-kompakta, komuna-0-2)",
    );
    expect(cxiuj.id).not.toBe(manifest(["komuna", "ekzemplo", "provo", "provo-kompakta"]).id);
  });
});
