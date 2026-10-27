// Spec 029 ①b b) (Abnahme ① des Maintainers, 27.10.: „passt noch nicht“, vor allem die Varianten):
// the Ero-Tokens of komuna take their values from the Fonto — the overrides per component in
// theme-neutral and the styles of the components in core 0.7.4, measured in the local comparison
// (scripts/fonto-astryx/vergleich/). butono high/medium/low/danger = primary/secondary/ghost/
// destructive. Every taken value names its source in deveno.json; where a Regulo wins, a Jugxo of
// komuna says why. The other brands keep their values (komuna-fonto.test.ts).

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  defaultModeloSource,
  eroTokenojOf,
  loadModelo,
  resolveCombination,
} from "@fundamento/modelo";
import { describe, expect, it } from "vitest";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("The repository Modelo does not load.");
const BASE = {
  aspekto: "komuna",
  viewport: "medium",
  density: "default",
  contrast: "default",
  motion: "reduced",
};
const light = resolveCombination(modelo, { ...BASE, "color-scheme": "light" }).tokens;
const dark = resolveCombination(modelo, { ...BASE, "color-scheme": "dark" }).tokens;
type Tokens = typeof light;
const hex = (tokens: Tokens, name: string) =>
  (tokens[name]?.value as { hex?: string } | undefined)?.hex?.toLowerCase();
const px = (tokens: Tokens, name: string) =>
  (tokens[name]?.value as { value?: number } | undefined)?.value;
const luminance = (value: string) =>
  [1, 3, 5]
    .map((i) => Number.parseInt(value.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((sum, c, i) => sum + c * ([0.2126, 0.7152, 0.0722][i] ?? 0), 0);
const contrast = (a?: string, b?: string) => {
  const [high, low] = [luminance(a ?? "#000000"), luminance(b ?? "#000000")].sort((x, y) => y - x);
  return ((high ?? 0) + 0.05) / ((low ?? 0) + 0.05);
};
const STATES = ["rest", "hover", "pressed", "focus", "disabled", "loading"];
const faelle = fileURLToPath(
  new URL("../../../../scripts/fonto-astryx/vergleich/faelle/", import.meta.url),
);

describe("Spec 029 ①b b): the Ero-Tokens of komuna after the Fonto", () => {
  it("butono: heights 28/32/36, inline padding 12, the radius of the Fonto, as the components of core draw them", () => {
    expect([28, 32, 36]).toEqual(
      ["small", "medium", "large"].map((size) => px(light, `ero.butono.box.height.size.${size}`)),
    );
    for (const size of ["small", "medium", "large"]) {
      expect(px(light, `ero.butono.box.inline.padding.size.${size}`), size).toBe(12);
    }
    expect(px(light, "ero.butono.box.radius")).toBe(10);
  });

  it("butono emphasis=medium (secondary) shows no border: the border takes the fill in every state, light and dark", () => {
    for (const tokens of [light, dark]) {
      for (const state of STATES) {
        expect(
          hex(tokens, `ero.butono.border.color.emphasis.medium.intent.neutral.${state}`),
          state,
        ).toBe(hex(tokens, `ero.butono.surface.fill.emphasis.medium.intent.neutral.${state}`));
      }
    }
  });

  it("butono disabled stays in its variant, pale: the fill of high is its own grey, not the grey of the text", () => {
    expect(hex(light, "ero.butono.surface.fill.emphasis.high.intent.neutral.disabled")).not.toBe(
      hex(light, "ero.butono.label.color.emphasis.high.intent.neutral.disabled"),
    );
    expect(hex(light, "ero.butono.label.color.emphasis.high.intent.neutral.disabled")).toBe(
      "#ffffff",
    );
  });

  it("kampo: white with a fine border that keeps 3:1 (WCAG 1.4.11, the rule wins); disabled light", () => {
    expect(hex(light, "ero.kampo.surface.fill.rest")).toBe("#ffffff");
    expect(px(light, "ero.kampo.border.width")).toBe(1);
    expect(contrast(hex(light, "ero.kampo.border.color.rest"), "#ffffff")).toBeGreaterThanOrEqual(
      3,
    );
    expect(hex(light, "ero.kampo.surface.fill.disabled")).toBe("#ffffff");
    expect(px(light, "ero.kampo.box.height.size.medium")).toBe(32);
  });

  it("karto: white, a fine border, a light shadow", () => {
    expect(hex(light, "ero.karto.surface.fill")).toBe("#ffffff");
    expect(px(light, "ero.karto.border.width")).toBe(1);
    expect(contrast(hex(light, "ero.karto.border.color"), "#ffffff")).toBeLessThan(1.5);
    expect(
      modelo.setoj.find((set) => set.name === "core")?.tokens["ero.karto.surface.shadow"]?.$value,
    ).toBe("{elevation.shadow.raised}");
  });

  it("dialogo: the title in the size of the Fonto, padding and radius as the Fonto", () => {
    const heading = light["ero.dialogo.heading.typography"]?.value as {
      fontSize?: { value: number };
      fontWeight?: number;
    };
    expect(heading?.fontSize?.value).toBe(20);
    expect(heading?.fontWeight).toBe(600);
    expect(px(light, "ero.dialogo.box.inline.padding")).toBe(16);
    expect(px(light, "ero.dialogo.surface.radius")).toBe(12);
    expect(hex(light, "ero.dialogo.border.color")).toBe(hex(light, "ero.dialogo.surface.fill"));
  });

  it("the comparison covers every one of the 40 Eroj, and every Ero with a counterpart has Ero-Tokens with their origin in the Fonto", () => {
    const files = readdirSync(faelle)
      .filter((name) => name.endsWith(".mjs"))
      .map((name) => name.replace(".mjs", ""));
    expect(files.sort()).toEqual(modelo.eroj.map((entry) => entry.ero.name).sort());
    const deveno = (modelo.deveno ?? []).filter((entry) => entry.token.startsWith("ero."));
    const covered = new Set(deveno.map((entry) => entry.token.split(".")[1]));
    for (const ero of files) expect(covered.has(ero), ero).toBe(true);
    for (const entry of deveno) {
      expect(entry.fonto, entry.token).toBe("astryx");
      expect(entry.dosiero, entry.token).toMatch(/^packages\/core\/src\//);
      expect(entry.sxlosilo.length, entry.token).toBeGreaterThan(10);
    }
    // Every Ero-Token named in deveno.json is an Ero-Token of the Skemo.
    const names = new Set(
      modelo.eroj.flatMap((entry) => eroTokenojOf(entry).map((tokeno) => tokeno.name)),
    );
    for (const entry of deveno) expect(names.has(entry.token), entry.token).toBe(true);
  });

  it("the code of the Fonto runs only in the local comparison: no package of Fundamento depends on it", () => {
    const packages = fileURLToPath(new URL("../../../", import.meta.url));
    for (const dir of readdirSync(packages)) {
      let manifest = "";
      try {
        manifest = readFileSync(`${packages}${dir}/package.json`, "utf8");
      } catch {
        continue;
      }
      expect(manifest, dir).not.toContain("@astryxdesign");
    }
    const vergleich = JSON.parse(
      readFileSync(
        new URL("../../../../scripts/fonto-astryx/vergleich/package.json", import.meta.url),
        "utf8",
      ),
    ) as { private?: boolean; devDependencies?: Record<string, string> };
    expect(vergleich.private).toBe(true);
    expect(vergleich.devDependencies?.["@astryxdesign/core"]).toBe("0.7.4");
    expect(vergleich.devDependencies?.["@astryxdesign/theme-neutral"]).toBe("0.7.4");
  });
});
