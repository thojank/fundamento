// Spec 026 ① (3): all example brands in one build. Since the builds were split, the build with
// the test brands held only provo and provo-kompakta, so ekzemplo (yellow, square) was missing in
// the Vitrino. A config beside the fixtures (fundamento.cxiuj.config.json) names komuna, ekzemplo,
// provo and provo-kompakta; one command builds the Vitrino and the Figma plugin from it, with a
// plugin id and name of their own (F-13). Four modes of the collection aspekto stay within the
// mode limit of Figma Professional (MODE_LIMIT).

import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { projectModeloSource } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildProjekcioj, celoInputOf } from "../../build.js";
import { VITRINO_FILE } from "../vitrino/vitrino.js";
import { FIGMA_CELO, type FigmaPlan } from "./figma.js";
import { FIGMA_MODE_LIMIT, pluginManifest } from "./plugin.js";

const BRANDS = ["komuna", "ekzemplo", "provo", "provo-kompakta"];
const config = new URL(
  "../../../../modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
  import.meta.url,
).pathname;

describe("all example brands in one build (Spec 026 ①)", () => {
  let plan: FigmaPlan & { ikonoj: { glyphs: Record<string, Record<string, string>> } };
  let out = "";

  beforeAll(async () => {
    expect(existsSync(config), config).toBe(true);
    const prepared = celoInputOf(projectModeloSource(config));
    if (!prepared.ok)
      throw new Error(
        `core + ekzemplo + provo + provo-kompakta must be valid: ${JSON.stringify(prepared.errors.slice(0, 2))}`,
      );
    plan = JSON.parse(
      FIGMA_CELO.generate(prepared.input).find((file) => file.path === "figma/plan.json")?.text ??
        "{}",
    );
    out = mkdtempSync(join(tmpdir(), "fm-cxiuj-"));
    const built = await buildProjekcioj({ outDir: out, source: projectModeloSource(config) });
    expect(built.ok).toBe(true);
  }, 180_000);

  afterAll(() => {
    if (out !== "") rmSync(out, { recursive: true, force: true });
  });

  it("the collection aspekto has the four brands as modes, within the mode limit of Figma Professional, and every variable a value in each", () => {
    const collection = plan.collections.find((candidate) => candidate.name === "aspekto");
    expect(collection?.modes).toEqual(BRANDS);
    expect(collection?.modes.length).toBeLessThanOrEqual(FIGMA_MODE_LIMIT);
    for (const each of plan.collections) {
      expect(each.modes.length, each.name).toBeLessThanOrEqual(FIGMA_MODE_LIMIT);
    }
    const missing = (collection?.variables ?? []).flatMap((variable) =>
      BRANDS.filter((brand) => variable.values[brand] === undefined).map(
        (brand) => `${variable.name} ${brand}`,
      ),
    );
    expect(missing).toEqual([]);
    expect(Object.keys(plan.ikonoj.glyphs)).toEqual(BRANDS);
  });

  it("the plugin has an id and a name of its own that name the four brands (F-13)", () => {
    const manifest = JSON.parse(pluginManifest(plan, "abc1234")) as { id: string; name: string };
    expect(manifest.id).toMatch(/^fundamento-apply-plan-[0-9a-f]{8}$/);
    expect(manifest.name).toContain(
      "Fundamento 0.2.0 (abc1234 · komuna, ekzemplo, provo, provo-kompakta)",
    );
    const built = JSON.parse(
      readFileSync(join(out, "figma/plugin/manifest.json"), "utf8"),
    ) as typeof manifest;
    expect(built.id).toBe(manifest.id);
    expect(built.name).toContain("komuna, ekzemplo, provo, provo-kompakta");
  });

  it("the Vitrino of the build switches between the four brands", () => {
    const html = readFileSync(join(out, VITRINO_FILE), "utf8");
    const switches = [
      ...html.matchAll(/data-fm-switch="aspekto" data-fm-valoro="([a-z-]+)"/g),
    ].map((match) => match[1]);
    expect(switches).toEqual(BRANDS);
  });
});
