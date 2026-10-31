// Spec 036, Befund 2.2 (V-2): the Projekcioj follow the Zweitfarbe. The build of all example
// brands (fundamento.cxiuj.config.json) carries the invented brand dukolora with a Zweitfarbe; CSS,
// Tailwind, Figma and the Vitrino gain the palette color.palette.sekundo and the roles
// color.sekundo.* under the names the NomReguloj derive – no name is written by hand. A brand
// without a Zweitfarbe aliases its neutral ramp there.

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { nomRegulo, projectModeloSource } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildProjekcioj } from "../build.js";
import type { FigmaPlan } from "./figma/figma.js";
import type { VitrinoDatumoj } from "./vitrino/datumoj.js";
import { VITRINO_FILE } from "./vitrino/vitrino.js";

const CXIUJ = fileURLToPath(
  new URL(
    "../../../modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
    import.meta.url,
  ),
);

const BRAND = "dukolora";
const PALETTE_STEP = "color.palette.sekundo.700";
const ROLES = [
  "color.sekundo.surface",
  "color.sekundo.illustration",
  "color.sekundo.badge.fill",
  "color.sekundo.badge.text",
  "color.sekundo.chart",
] as const;

const css = nomRegulo("css");
const figma = nomRegulo("figma");
const tailwind = nomRegulo("tailwind");

let out = "";
const read = (path: string) => readFileSync(join(out, path), "utf8");

beforeAll(async () => {
  out = mkdtempSync(join(tmpdir(), "fm-zweitfarbe-"));
  const built = await buildProjekcioj({ outDir: out, source: projectModeloSource(CXIUJ) });
  expect(built.ok).toBe(true);
}, 240_000);

afterAll(() => {
  if (out !== "") rmSync(out, { recursive: true, force: true });
});

describe("the Projekcioj of the Zweitfarbe (Spec 036, Befund 2.2, V-2)", () => {
  it("CSS: the brand with a Zweitfarbe sets the palette literally and its roles on it", () => {
    const text = read(`css/fundamento-${BRAND}.css`);
    expect(text).toMatch(new RegExp(`${css.derive(PALETTE_STEP)}: #[0-9a-f]{6};`));
    for (const role of ROLES) {
      expect(text, role).toMatch(
        new RegExp(`${css.derive(role)}: var\\(--fm-color-palette-sekundo-\\d+\\);`),
      );
    }
  });

  it("CSS: a brand without a Zweitfarbe points the palette at its neutral ramp", () => {
    const text = read("css/fundamento-komuna.css");
    expect(text).toContain(
      `${css.derive(PALETTE_STEP)}: var(${css.derive("color.palette.neutral.700")});`,
    );
    for (const role of ROLES) expect(text, role).toContain(`${css.derive(role)}: var(`);
  });

  it("Tailwind: the palette and the roles in the theme", () => {
    const text = read("tailwind/fundamento.tailwind.css");
    for (const name of [PALETTE_STEP, ...ROLES]) {
      expect(text, name).toContain(`${tailwind.derive(name, "color")}: var(${css.derive(name)});`);
    }
  });

  it("Figma: the brand is a mode, and the palette and the roles are variables with its value", () => {
    const plan = JSON.parse(read("figma/plan.json")) as FigmaPlan;
    const aspekto = plan.collections.find((collection) => collection.name === "aspekto");
    expect(aspekto?.modes).toContain(BRAND);
    const variables = plan.collections.flatMap((collection) => collection.variables);
    const step = variables.find((variable) => variable.name === figma.derive(PALETTE_STEP));
    expect(step?.values[BRAND]).toBeDefined();
    expect(step?.values.komuna).toEqual({ alias: figma.derive("color.palette.neutral.700") });
    for (const role of ROLES) {
      const named = variables.filter(
        (variable) =>
          variable.name === figma.derive(role) ||
          variable.name.startsWith(`${figma.derive(role)}@`),
      );
      expect(named.length, role).toBeGreaterThan(0);
    }
  });

  it("Vitrino: lists the brand and shows the palette and the roles of the Zweitfarbe", () => {
    const html = read(VITRINO_FILE);
    const island = /<script type="application\/json" id="fm-vitrino">(.*?)<\/script>/s.exec(html);
    const datumoj = JSON.parse((island?.[1] ?? "{}").replaceAll("<\\/", "</")) as VitrinoDatumoj;
    expect(datumoj.aspektoj).toContain(BRAND);
    const koloro = datumoj.bazoj?.koloro?.[BRAND] ?? [];
    for (const role of ROLES)
      expect(
        koloro.map((row) => row.token),
        role,
      ).toContain(role);
    const ramps = (datumoj.paletroj[BRAND] ?? []).map((ramp) => ramp.rampo);
    expect(ramps).toContain("sekundo");
  });
});
