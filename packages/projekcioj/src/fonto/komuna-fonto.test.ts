// Spec 029 ① 2–4 (Fonto astryx, theme-neutral 0.7.4): komuna carries the values of the Fonto,
// distributed on its own Grundlagen and roles, with its own fonts; where a value of the Fonto
// breaks a Regulo or an Aspiro of komuna, the rule wins and a Jugxo records it. Every taken value
// names its source (deveno.json). The other brands keep every value; provo changes its font only.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  defaultModeloSource,
  loadModelo,
  projectModeloSource,
  resolveCombination,
} from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../build.js";

const repo = loadModelo(defaultModeloSource());
if (repo.modelo === undefined) throw new Error("The repository Modelo does not load.");
const modelo = repo.modelo;

const hexOf = (value: unknown): string | undefined =>
  typeof value === "object" && value !== null && "hex" in value
    ? String((value as { hex: string }).hex)
    : undefined;
const komuna = (assignment: Record<string, string> = {}) =>
  resolveCombination(modelo, { aspekto: "komuna", ...assignment }).tokens;
const hex = (tokens: ReturnType<typeof komuna>, name: string) => hexOf(tokens[name]?.value);
const px = (tokens: ReturnType<typeof komuna>, name: string) =>
  (tokens[name]?.value as { value?: number } | undefined)?.value;

describe("Spec 029 ① 2: komuna after theme-neutral", () => {
  const light = komuna();
  const dark = komuna({ "color-scheme": "dark" });

  it("colour: the neutral ramp, the accent and the text of the Fonto", () => {
    // Stufen der Fonto, exakt: neutral 95 (#f1f1f1), 10 (#1b1b1b), Weiß und Schwarz.
    expect(hex(light, "color.palette.neutral.50")).toBe("#f1f1f1");
    expect(hex(light, "color.palette.neutral.900")).toBe("#1b1b1b");
    expect(hex(light, "color.text.default")).toBe("#000000");
    expect(hex(dark, "color.text.default")).toBe("#ffffff");
    expect(hex(light, "color.action.primary.rest")).toBe("#1b1b1b");
    expect(hex(dark, "color.action.primary.rest")).toBe("#f1f1f1");
    expect(hex(light, "color.action.primary.text")).toBe("#ffffff");
    expect(hex(light, "color.focus.ring")).toBe("#1b1b1b");
    // Der Akzent der Fonto ist neutral: die Rampe accent ist die neutrale.
    expect(hex(light, "color.palette.accent.500")).toBe(hex(light, "color.palette.neutral.500"));
    // Die Status-Rampen sind die Familien der Fonto (rot 85 = #ffc4be).
    expect(hex(light, "color.palette.danger.150")).toBe("#ffc4be");
  });

  it("the hierarchy of the surfaces, adapted where a Regulo or an Aspiro wins (Jugxo)", () => {
    // Hell: Seite 90 < Fläche 95 < Karte 97,5 (die Fonto: Weiß, Aspiro oklch-l-extreme).
    expect(hex(light, "color.background.canvas")).toBe("#e2e2e2");
    expect(hex(light, "color.background.default")).toBe("#f1f1f1");
    expect(hex(light, "color.background.sunken")).toBe("#d4d4d4");
    // Dunkel: Fläche 15 wie die Fonto, Karte eine Stufe heller (surface-order), Seite 10.
    expect(hex(dark, "color.background.default")).toBe("#262626");
    expect(hex(dark, "color.background.canvas")).toBe("#1b1b1b");
    expect(hex(dark, "color.background.raised")).toBe("#303030");
  });

  it("typography: base 14 and ratio 1.2 of the Fonto, families of komuna", () => {
    expect(px(light, "font.size.body.1")).toBe(14);
    expect(px(light, "font.size.body.2")).toBe(12);
    expect(px(light, "font.size.headline.1")).toBe(24);
    expect(px(light, "font.size.display.1")).toBe(42);
    expect(light["font.lineheight.headline.1"]?.value).toBe(1.3333);
    expect((light["font.family.body"]?.value as string[] | undefined)?.[0]).toBe("Geist");
    expect((light["font.family.code"]?.value as string[] | undefined)?.[0]).toBe("Geist Mono");
    // Touch und schmale Breite: Basis 16, Verhältnis 1,1736, display.1 bleibt 42.
    const compact = komuna({ viewport: "compact" });
    expect(px(compact, "font.size.body.1")).toBe(16);
    expect(px(compact, "font.size.display.1")).toBe(42);
    // Weit: die Fonto vergrößert nicht.
    expect(px(komuna({ viewport: "expanded" }), "font.size.display.1")).toBe(42);
  });

  it("spacing, element sizes, radii, focus and motion of the Fonto, in Fundamento's units", () => {
    expect(px(light, "spacing.scale.100")).toBe(4);
    expect(px(light, "size.control.small")).toBe(28);
    expect(px(light, "size.control.medium")).toBe(32);
    expect(px(light, "size.control.large")).toBe(36);
    // Dichte: die Fonto hat keine; eine Stufe der Skala (abgeleitet), nie unter size.target.min.
    expect(px(komuna({ density: "compact" }), "size.control.small")).toBe(24);
    expect(px(komuna({ density: "comfortable" }), "size.control.large")).toBe(40);
    expect(px(light, "radius.role.control")).toBe(10);
    expect(px(light, "radius.role.surface")).toBe(12);
    expect(px(light, "focus.offset")).toBe(3);
    expect(px(light, "motion.duration.fast")).toBe(125);
    expect(px(light, "motion.duration.medium")).toBe(300);
    expect(light["motion.easing.standard"]?.value).toEqual([0.24, 1, 0.4, 1]);
    expect(light["opacity.disabled"]?.value).toBe(0.5);
  });

  it("elevation: the shadows of the Fonto, in the dark with a rim of light", () => {
    const raised = light["elevation.shadow.raised"]?.value as { blur: { value: number } }[];
    expect(raised.map((layer) => layer.blur.value)).toEqual([4, 8]);
    const modal = dark["elevation.shadow.modal"]?.value as { inset?: boolean }[];
    expect(modal.some((layer) => layer.inset === true)).toBe(true);
  });
});

describe("Spec 029 ① 4: every taken value names its source, every adaptation its Jugxo", () => {
  const deveno = modelo.deveno ?? [];
  const jugxoj = new Map(modelo.jugxoj.map((jugxo) => [jugxo.id, jugxo]));

  it("deveno.json of komuna covers the Grundlagen and points at the registered Fonto", () => {
    expect(modelo.fontoj?.map((fonto) => [fonto.id, fonto.version, fonto.commit])).toEqual([
      ["astryx", "0.7.4", "704757fd827c6fa00a71af80b06d5da99d155e45"],
    ]);
    expect(deveno.length).toBeGreaterThan(350);
    expect(new Set(deveno.map((entry) => entry.fonto))).toEqual(new Set(["astryx"]));
    for (const prefix of ["color.palette.", "color.text.", "font.size.", "radius.", "motion."]) {
      expect(
        deveno.some((entry) => entry.token.startsWith(prefix)),
        prefix,
      ).toBe(true);
    }
  });

  it("an adapted value names a Jugxo of komuna that records the deviation", () => {
    const adapted = deveno.filter((entry) => entry.maniero === "adaptita");
    expect(adapted.length).toBeGreaterThan(20);
    for (const entry of adapted) {
      const jugxo = jugxoj.get(entry.jugxo ?? "");
      expect(jugxo?.aspekto, entry.token).toBe("komuna");
      expect(jugxo?.decision, entry.token).toBe("deviation-recorded");
      expect(jugxo?.context, entry.token).toContain(entry.token);
    }
  });
});

describe("Spec 029 ①: the other brands keep their values", () => {
  const BAZO = JSON.parse(readFileSync(new URL("./marken-main.json", import.meta.url), "utf8")) as {
    marken: Record<string, Record<string, string>>;
  };
  const CXIUJ = fileURLToPath(
    new URL(
      "../../../modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
      import.meta.url,
    ),
  );
  const canonical = (value: unknown): unknown =>
    Array.isArray(value)
      ? value.map(canonical)
      : value !== null && typeof value === "object"
        ? Object.fromEntries(
            Object.keys(value)
              .sort()
              .map((key) => [key, canonical((value as Record<string, unknown>)[key])]),
          )
        : value;

  it("ekzemplo, provo (but its fonts) and provo-kompakta resolve as on main in all combinations", () => {
    const prepared = celoInputOf(projectModeloSource(CXIUJ));
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    const differences: string[] = [];
    for (const [aspekto, kombinoj] of Object.entries(BAZO.marken)) {
      for (const [key, expected] of Object.entries(kombinoj)) {
        const assignment = Object.fromEntries(key.split("&").map((pair) => pair.split("=")));
        const { tokens } = resolveCombination(prepared.input.modelo, { ...assignment, aspekto });
        const rows = Object.keys(tokens)
          .sort()
          .filter((name) => aspekto !== "provo" || !/^(font\.family\.|typography\.)/.test(name))
          .map((name) => [name, tokens[name]?.type, canonical(tokens[name]?.value)]);
        if (createHash("sha256").update(JSON.stringify(rows)).digest("hex") !== expected)
          differences.push(`${aspekto} ${key}`);
      }
    }
    expect(differences).toEqual([]);
  });

  it("provo shows Prata (OFL) with a serif fallback", () => {
    const provo = celoInputOf(projectModeloSource(CXIUJ));
    if (!provo.ok) throw new Error("cxiuj");
    const { tokens } = resolveCombination(provo.input.modelo, { aspekto: "provo" });
    expect(tokens["font.family.display"]?.value).toEqual(["Prata", "ui-serif", "serif"]);
    const aspekto = JSON.parse(
      readFileSync(
        new URL(
          "../../../modelo/test/fixtures/valid/aspekto-provo/aspekto-provo/aspekto.json",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    expect(aspekto.fonts).toContainEqual(
      expect.objectContaining({ family: "Prata", license: "OFL-1.1", redistributable: true }),
    );
  });
});
