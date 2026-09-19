// FUND-3.3: guards the repo's Phase 0 Modelo data (FR-08, FR-09, FR-11a, FR-12, FR-16, FR-18, S4,
// S6). Loads the real repo Vortaro and data through the public loader and resolver; no mocks.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Color from "colorjs.io";
import { describe, expect, it } from "vitest";
import { createModeloAjv, getModeloValidator } from "../contracts/ajv.js";
import { DTCG_TYPES } from "../contracts/dtcg.js";
import { entityTypeOfId } from "../contracts/entity-ids.js";
import type { Assignment, LoadedSet, Modelo, Rezolvo } from "../contracts/modelo.js";
import { DATA_FILE_SCHEMA_DEFS, SCHEMA_DEFS } from "../contracts/schema.js";
import { coreView } from "../load/core-view.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { allAssignments, formatCombination, resolve } from "../resolve/index.js";
import { deriveThemes, serializeThemes } from "../themes/index.js";

const source = defaultModeloSource();
const loaded = loadModelo(source);

function repoModelo(): Modelo {
  if (loaded.modelo === undefined) {
    throw new Error(`repo Modelo did not load: ${JSON.stringify(loaded.issues)}`);
  }
  return loaded.modelo;
}

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory() ? listFiles(join(dir, entry.name)) : [join(dir, entry.name)],
    )
    .sort();
}

const readJson = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));

function setNamed(modelo: Modelo, name: string): LoadedSet {
  const set = modelo.setoj.find((s) => s.name === name);
  if (set === undefined) throw new Error(`missing set ${name}`);
  return set;
}

function resolveOk(modelo: Modelo, assignment: Assignment): Rezolvo {
  const outcome = resolve(modelo, assignment);
  if (!outcome.ok) {
    throw new Error(`resolution failed: ${JSON.stringify(outcome.issues)}`);
  }
  return outcome.rezolvo;
}

function resolvedToken(rezolvo: Rezolvo, name: string) {
  const token = rezolvo.tokens[name];
  if (token === undefined) throw new Error(`token ${name} missing from rezolvo`);
  return token;
}

/** The ten types FR-09 requires in the test Aspekto. */
const FR09_TYPES = [
  "border",
  "color",
  "cubicBezier",
  "dimension",
  "duration",
  "fontFamily",
  "fontWeight",
  "number",
  "shadow",
  "typography",
];

const CORE = "core";
const DARK = "color-scheme/dark";
const HIGH = "contrast/high";
const KOMUNA_DARK = "aspekto/komuna+color-scheme/dark";
const DARK_HIGH = "color-scheme/dark+contrast/high";

describe("Phase 0 repo Modelo: loading", () => {
  it("loads through defaultModeloSource() with zero issues", () => {
    expect(loaded.issues).toEqual([]);
    expect(loaded.modelo).toBeDefined();
  });

  it("every set file validates against TokenSetFile", () => {
    const validate = getModeloValidator(createModeloAjv(), SCHEMA_DEFS.tokenSetFile);
    const files = listFiles(join(source.vortaroDir, "sets"));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      expect(validate(readJson(file)), `${file}: ${JSON.stringify(validate.errors)}`).toBe(true);
    }
  });

  it.each(Object.entries(DATA_FILE_SCHEMA_DEFS))("data/%s validates against %s", (file, def) => {
    const validate = getModeloValidator(createModeloAjv(), def);
    expect(validate(readJson(join(source.dataDir, file))), JSON.stringify(validate.errors)).toBe(
      true,
    );
  });
});

describe("Phase 0 repo Modelo: Dimensioj (FR-11a, FR-16)", () => {
  it("has exactly the six Dimensioj with priorities, values and defaults of FR-11a", () => {
    const modelo = repoModelo();
    expect(
      modelo.dimensioj.map((d) => ({
        priority: d.priority,
        name: d.name,
        valoroj: d.valoroj.map((v) => v.name),
        default: d.default,
      })),
    ).toEqual([
      { priority: 1, name: "aspekto", valoroj: ["komuna"], default: "komuna" },
      {
        priority: 2,
        name: "viewport",
        valoroj: ["compact", "medium", "expanded"],
        default: "medium",
      },
      {
        priority: 3,
        name: "density",
        valoroj: ["compact", "default", "comfortable"],
        default: "default",
      },
      { priority: 4, name: "color-scheme", valoroj: ["light", "dark"], default: "light" },
      { priority: 5, name: "contrast", valoroj: ["default", "high"], default: "default" },
      { priority: 6, name: "motion", valoroj: ["default", "reduced"], default: "default" },
    ]);
  });

  it("carries WCAG 2.x (binding) and APCA (advisory) thresholds on exactly the contrast values", () => {
    const modelo = repoModelo();
    for (const dimensio of modelo.dimensioj) {
      for (const valoro of dimensio.valoroj) {
        if (dimensio.name === "contrast") continue;
        expect(valoro.kontrastSojloj, `${dimensio.name}=${valoro.name}`).toBeUndefined();
      }
    }
    const contrast = modelo.dimensioj.find((d) => d.name === "contrast");
    const sojloj = Object.fromEntries(
      (contrast?.valoroj ?? []).map((v) => [v.name, v.kontrastSojloj]),
    );
    expect(sojloj.default?.wcag2).toEqual({ "text-normal": 4.5, "text-large": 3, ui: 3 });
    expect(sojloj.high?.wcag2).toEqual({ "text-normal": 7, "text-large": 4.5, ui: 3 });
    expect(sojloj.default?.apca).toBeDefined();
    expect(sojloj.high?.apca).toBeDefined();
  });

  it("takes the reference Aspekto komuna with owner, license and fonts from its package (Spec 001 T007)", () => {
    const [komuna, ...others] = repoModelo().aspektoPackages;
    expect(others).toEqual([]);
    expect(komuna).toMatchObject({
      name: "@fundamento/aspekto-komuna",
      aspekto: "komuna",
      owner: "Fundamento",
      license: "MIT",
      composed: true,
    });
    expect(komuna?.fonts?.map((font) => font.family)).toEqual(["Geist", "Geist Mono"]);
  });

  it("yields 72 complete combinations", () => {
    const assignments = allAssignments(repoModelo());
    expect(assignments).toHaveLength(72);
    expect(new Set(assignments.map((a) => JSON.stringify(a))).size).toBe(72);
    for (const a of assignments) expect(Object.keys(a)).toHaveLength(6);
  });
});

describe("Phase 0 repo Modelo: core tokens (FR-09, FR-12, FR-18, S2, S4)", () => {
  it("has 30 core tokens covering exactly the ten FR-09 types", () => {
    const tokens = Object.values(setNamed(repoModelo(), CORE).tokens);
    const types = new Set<string>(tokens.map((t) => t.type));
    for (const type of FR09_TYPES) expect(types.has(type), type).toBe(true);
    for (const type of FR09_TYPES) expect(DTCG_TYPES).toContain(type);
  });

  it("every core token has an ID and a description", () => {
    for (const token of Object.values(setNamed(repoModelo(), CORE).tokens)) {
      expect(token.id, token.name).toMatch(/^tok_/);
      expect(token.description, token.name).toBeTruthy();
    }
  });

  it("contains the S2 and S4 example aliases", () => {
    const core = setNamed(repoModelo(), CORE).tokens;
    expect(core["color.action.primary.rest"]?.value).toBe("{color.palette.accent.700}");
    expect(core["color.palette.accent.700"]?.type).toBe("color");
    expect(core["color.text.default"]?.value).toBe("{color.palette.neutral.900}");
    expect(core["color.palette.neutral.900"]?.type).toBe("color");
  });

  it("has at least one composite with a sub-field alias", () => {
    const composites = Object.values(setNamed(repoModelo(), CORE).tokens).filter(
      (t) =>
        ["border", "shadow", "typography"].includes(t.type) &&
        typeof t.value === "object" &&
        t.value !== null &&
        Object.values(t.value).some((field) => typeof field === "string" && field.startsWith("{")),
    );
    expect(composites.map((t) => t.type).sort()).toEqual(["border", "shadow", "typography"]);
  });

  it("uses only generic font families (FR-18: no fonts)", () => {
    const generic = new Set([
      "system-ui",
      "sans-serif",
      "serif",
      "monospace",
      "ui-sans-serif",
      "ui-serif",
      "ui-monospace",
    ]);
    const families = Object.values(setNamed(repoModelo(), CORE).tokens)
      .filter((t) => t.type === "fontFamily")
      .flatMap((t) => (Array.isArray(t.value) ? t.value : [t.value]));
    expect(families.length).toBeGreaterThan(0);
    for (const family of families) expect(generic.has(family as string), String(family)).toBe(true);
  });
});

describe("Phase 0 repo Modelo: sets (FR-10, FR-12)", () => {
  it("has the expected sets", () => {
    expect(repoModelo().setoj.map((s) => s.name)).toEqual([
      "aspekto/komuna",
      KOMUNA_DARK,
      DARK,
      DARK_HIGH,
      HIGH,
      CORE,
      "density/comfortable",
      "density/compact",
      "motion/reduced",
      "viewport/compact",
      "viewport/expanded",
    ]);
  });

  it("every Dimensio except aspekto has a non-default value with a real (non-empty) set", () => {
    const modelo = repoModelo();
    for (const dimensio of modelo.dimensioj.filter((d) => d.name !== "aspekto")) {
      const real = modelo.setoj.filter(
        (s) =>
          s.kondicxoj.length === 1 &&
          s.kondicxoj[0]?.dimensio === dimensio.name &&
          s.kondicxoj[0]?.valoro !== dimensio.default &&
          Object.keys(s.tokens).length > 0,
      );
      expect(real.length, dimensio.name).toBeGreaterThan(0);
    }
  });

  it("override sets only redefine core tokens and carry no Fundamento token extensions", () => {
    const modelo = repoModelo();
    const core = setNamed(modelo, CORE).tokens;
    for (const set of modelo.setoj.filter((s) => s.name !== CORE)) {
      for (const token of Object.values(set.tokens)) {
        expect(core[token.name]?.type, `${set.name}: ${token.name}`).toBe(token.type);
        expect(token.id, `${set.name}: ${token.name}`).toBeUndefined();
        expect(token.role, `${set.name}: ${token.name}`).toBeUndefined();
      }
    }
  });

  it("priority: contrast/high wins over color-scheme/dark; their conjunction wins over both", () => {
    const modelo = repoModelo();
    const dark = setNamed(modelo, DARK).tokens;
    const high = setNamed(modelo, HIGH).tokens;
    const both = setNamed(modelo, DARK_HIGH).tokens;
    const shared = Object.keys(dark).filter((name) => high[name]?.type === "color");
    expect(shared.length).toBeGreaterThan(0);
    const rezolvo = resolveOk(modelo, { "color-scheme": "dark", contrast: "high" });
    for (const name of shared) {
      const expected = both[name] === undefined ? HIGH : DARK_HIGH;
      expect(resolvedToken(rezolvo, name).origin.set, name).toBe(expected);
    }
    const darkOnly = resolveOk(modelo, { "color-scheme": "dark" });
    for (const name of shared) {
      expect(resolvedToken(darkOnly, name).origin.set, name).toBe(DARK);
    }
  });

  it("specificity: aspekto/komuna+color-scheme/dark tints a palette step that dark semantics use", () => {
    const modelo = repoModelo();
    const conjunction = setNamed(modelo, KOMUNA_DARK);
    expect(conjunction.kondicxoj).toEqual([
      { dimensio: "aspekto", valoro: "komuna" },
      { dimensio: "color-scheme", valoro: "dark" },
    ]);
    expect(Object.keys(conjunction.tokens)).toEqual(["color.palette.neutral.950"]);
    const background = resolveOk(modelo, { "color-scheme": "dark" }).tokens[
      "color.background.default"
    ];
    expect(background?.aliasChain.at(-1)).toEqual({
      token: "color.palette.neutral.950",
      set: KOMUNA_DARK,
    });
  });

  it("late binding: color-scheme/dark re-points semantics to other palette steps (D-03)", () => {
    const modelo = repoModelo();
    const dark = setNamed(modelo, DARK).tokens;
    expect(Object.keys(dark).some((name) => name.startsWith("color.palette."))).toBe(false);
    const rest = resolveOk(modelo, { "color-scheme": "dark" }).tokens["color.action.primary.rest"];
    expect(rest?.origin.set).toBe(DARK);
    expect(rest?.aliasChain).toEqual([
      { token: "color.action.primary.rest", set: DARK },
      { token: "color.palette.accent.300", set: CORE },
    ]);
    const text = resolveOk(modelo, { "color-scheme": "dark" }).tokens["color.text.default"];
    expect(text?.aliasChain.at(-1)).toEqual({ token: "color.palette.neutral.50", set: CORE });
  });

  it("resolves all 72 combinations with zero issues and zero warnings", () => {
    const modelo = repoModelo();
    const coreNames = Object.keys(setNamed(modelo, CORE).tokens).sort();
    for (const assignment of allAssignments(modelo)) {
      const outcome = resolve(modelo, assignment);
      expect(outcome.ok, formatCombination(modelo, assignment)).toBe(true);
      if (!outcome.ok) continue;
      expect(outcome.warnings, formatCombination(modelo, assignment)).toEqual([]);
      expect(Object.keys(outcome.rezolvo.tokens).sort()).toEqual(coreNames);
    }
  });
});

describe("Phase 0 repo Modelo: Regularo (FR-08)", () => {
  it("has exactly two Reguloj with a kialo and the Article X Jugxoj", () => {
    const modelo = repoModelo();
    expect(modelo.reguloj.length).toBeGreaterThanOrEqual(3);
    for (const regulo of modelo.reguloj) {
      expect(regulo.kialo.trim().length, regulo.name).toBeGreaterThan(40);
    }
    expect(modelo.jugxoj).toHaveLength(2);
    expect(modelo.jugxoj[0]).toMatchObject({
      ref: { artikolo: "X" },
      decision: "deviation-recorded",
      kialo:
        "FUND-4.1 wrote tests before code but ran them only afterwards, so they were never observed failing; from now on the red run is part of ticket completion",
      date: "2026-09-19",
    });
    expect(modelo.jugxoj[1]).toMatchObject({
      ref: { artikolo: "X" },
      decision: "deviation-recorded",
      kialo:
        "Tests that spawn processes must have timeouts sized for a cold CI runner, otherwise the gate flakes and loses authority.",
      date: "2026-09-19",
    });
    for (const jugxo of modelo.jugxoj) expect(jugxo.id).toMatch(/^jug_/);
  });
});

describe("Phase 0 repo Modelo: KontrastParoj (FR-16)", () => {
  type Kategorio = "text-normal" | "text-large" | "ui";

  function wcag2Thresholds(modelo: Modelo, contrastValue: string): Record<Kategorio, number> {
    const valoro = modelo.dimensioj
      .find((d) => d.name === "contrast")
      ?.valoroj.find((v) => v.name === contrastValue);
    const wcag2 = valoro?.kontrastSojloj?.wcag2;
    if (wcag2 === undefined) throw new Error(`no thresholds for contrast=${contrastValue}`);
    return wcag2;
  }

  function toColor(value: unknown): Color {
    const { colorSpace, components, alpha } = value as {
      colorSpace: string;
      components: number[];
      alpha?: number;
    };
    expect(colorSpace).toBe("srgb");
    expect(alpha ?? 1).toBe(1);
    return new Color("srgb", components as [number, number, number]);
  }

  it("has at least three pairs covering text-normal and ui, with roles on their tokens", () => {
    const modelo = repoModelo();
    const core = setNamed(modelo, CORE).tokens;
    expect(modelo.kontrastParoj.length).toBeGreaterThanOrEqual(3);
    expect(new Set(modelo.kontrastParoj.map((p) => p.kategorio))).toEqual(
      new Set(["text-normal", "ui"]),
    );
    for (const pair of modelo.kontrastParoj) {
      expect(core[pair.foreground]?.type, pair.name).toBe("color");
      expect(core[pair.background]?.type, pair.name).toBe("color");
      expect(["foreground", "border"], pair.name).toContain(core[pair.foreground]?.role);
      expect(core[pair.background]?.role, pair.name).toBe("background");
    }
  });

  it("every pair meets its WCAG 2.x threshold in all 72 combinations", () => {
    const modelo = repoModelo();
    const minima: Record<string, number> = {};
    for (const assignment of allAssignments(modelo)) {
      const rezolvo = resolveOk(modelo, assignment);
      const thresholds = wcag2Thresholds(modelo, rezolvo.assignment.contrast ?? "");
      for (const pair of modelo.kontrastParoj) {
        const fg = toColor(resolvedToken(rezolvo, pair.foreground).value);
        const bg = toColor(resolvedToken(rezolvo, pair.background).value);
        const ratio = bg.contrast(fg, "WCAG21");
        const where = `${pair.name} @ ${formatCombination(modelo, assignment)}`;
        expect(ratio, where).toBeGreaterThanOrEqual(thresholds[pair.kategorio]);
        const key = `${pair.name}/contrast=${rezolvo.assignment.contrast}`;
        minima[key] = Math.min(minima[key] ?? Number.POSITIVE_INFINITY, ratio);
      }
    }
    expect(Object.keys(minima)).toHaveLength(modelo.kontrastParoj.length * 2);
  });
});

describe("Phase 0 repo Modelo: IDs and derived files", () => {
  it("registers exactly the IDs the data uses, all active and of the matching type", () => {
    const lock = readJson(join(source.dataDir, "ids.lock.json")) as {
      ids: Record<string, { type: string; status: string }>;
    };
    const files = [
      ...listFiles(join(source.vortaroDir, "sets")),
      ...listFiles(source.dataDir).filter((f) => !f.endsWith("ids.lock.json")),
    ];
    const used: string[] = [];
    for (const file of files) {
      for (const match of readFileSync(file, "utf8").matchAll(/"([a-z]{3}_[0-9A-Z]{26})"/g)) {
        if (match[1] !== undefined) used.push(match[1]);
      }
    }
    expect(new Set(used).size, "no ID is used twice").toBe(used.length);
    expect([...used].sort()).toEqual(Object.keys(lock.ids).sort());
    for (const [id, entry] of Object.entries(lock.ids)) {
      expect(entry).toEqual({ type: entityTypeOfId(id), status: "active" });
    }
  });

  it("$themes.json and $metadata.json are byte-identical to the derived core view (D-08)", () => {
    const { themesJson, metadataJson } = serializeThemes(deriveThemes(coreView(repoModelo())));
    expect(readFileSync(join(source.vortaroDir, "$themes.json"), "utf8")).toBe(themesJson);
    expect(readFileSync(join(source.vortaroDir, "$metadata.json"), "utf8")).toBe(metadataJson);
  });
});
