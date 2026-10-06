// The invented external Aspekto `ekzemplo`, complete against the real core and included through
// its own fundamento.config.json (Spec 001, D-16, AK-03, AK-05; task T018).

import { describe, expect, it } from "vitest";
import { evaluateAlirebleco } from "../checks/alirebleco/evaluate.js";
import { loadModelo } from "../load/load-modelo.js";
import { projectModeloSource } from "../load/source.js";
import { resolve } from "../resolve/resolve.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";
import { validateModelo } from "../validate/validate-modelo.js";

const CONFIG = `${fixtureRoot("valid", "aspekto-ekzemplo")}/fundamento.config.json`;
const source = projectModeloSource(CONFIG);
const { modelo } = loadModelo(source);

function tokens(assignment: Record<string, string>) {
  if (modelo === undefined) throw new Error("did not load");
  const outcome = resolve(modelo, assignment);
  if (!outcome.ok) throw new Error(JSON.stringify(outcome.issues));
  return outcome.rezolvo.tokens;
}

describe("valid/aspekto-ekzemplo with the repo core (AK-03)", () => {
  it("composes core, the reference komuna and ekzemplo", () => {
    expect(source.sourceIssues).toEqual([]);
    expect(modelo?.aspektoPackages.map((pkg) => [pkg.aspekto, pkg.namespace])).toEqual([
      ["komuna", undefined],
      ["ekzemplo", "ekz"],
    ]);
  });

  // Full validation of 144 combinations: ~1 s alone, several seconds on a loaded runner.
  it("validates without errors or warnings: complete, namespaced, fonts declared", {
    timeout: 30_000,
  }, () => {
    const report = validateModelo(source);
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
    expect(report.summary.combinations).toBe(144);
  });

  it("differs from komuna in weight, line height and tracking of the display roles (AK-05)", () => {
    const komuna = tokens({ aspekto: "komuna" })["typography.display.1"]?.value as Record<
      string,
      unknown
    >;
    const ekzemplo = tokens({ aspekto: "ekzemplo" })["typography.display.1"]?.value as Record<
      string,
      unknown
    >;
    for (const field of ["fontWeight", "lineHeight", "letterSpacing", "fontFamily"]) {
      expect(ekzemplo[field], field).not.toEqual(komuna[field]);
    }
  });

  it("changes its display roles in viewport=compact and keeps them in density=compact (AK-05, K3)", () => {
    const base = tokens({ aspekto: "ekzemplo" })["typography.display.1"]?.value;
    expect(
      tokens({ aspekto: "ekzemplo", viewport: "compact" })["typography.display.1"]?.value,
    ).not.toEqual(base);
    expect(
      tokens({ aspekto: "ekzemplo", density: "compact" })["typography.display.1"]?.value,
    ).toEqual(base);
  });

  it("answers the S7 analogues: dark text from its conjunction set, flat elevation", () => {
    const dark = tokens({ aspekto: "ekzemplo", "color-scheme": "dark" })["color.text.default"];
    expect(dark?.origin).toMatchObject({
      set: "aspekto/ekzemplo+color-scheme/dark",
      package: "aspekto-ekzemplo",
    });
    for (const level of ["raised", "overlay", "floating", "modal"]) {
      const shadow = tokens({ aspekto: "ekzemplo" })[`elevation.shadow.${level}`];
      expect(shadow?.origin.set, level).toBe("aspekto/ekzemplo");
      const layers = [shadow?.value].flat() as { color: { alpha?: number } }[];
      expect(
        layers.every((layer) => layer.color.alpha === 0),
        level,
      ).toBe(true);
    }
  });
});

describe("invalid/aspekto-incomplete (AK-03)", () => {
  it("fails with aspekto-incomplete for exactly the removed tokens", () => {
    const report = validateModelo(
      projectModeloSource(`${fixtureRoot("invalid", "aspekto-incomplete")}/fundamento.config.json`),
    );
    const set = "aspekto-ekzemplo/sets/aspekto/ekzemplo.json";
    expect(
      report.errors.map((issue) => [
        issue.rule,
        issue.path.replace(/^.*aspekto-ekzemplo\//, "aspekto-ekzemplo/"),
      ]),
    ).toEqual([
      ["aspekto-incomplete", `${set}#/color/action/primary/rest`],
      ["aspekto-incomplete", `${set}#/color/text/default`],
      ["aspekto-incomplete", `${set}#/motion/duration/fast`],
      ["aspekto-incomplete", `${set}#/typography/kicker`],
    ]);
  });
});

describe("the warning surface of ekzemplo holds through its border (Spec 002 S3, D-10)", () => {
  const PAIR = "status-warning-basic-on-background-default";
  if (modelo === undefined) throw new Error("did not load");
  const evaluation = evaluateAlirebleco(modelo, {
    kontrastParojFile: "data/kontrastparoj.json",
    collect: true,
  });

  it("passes every pair in every combination of both Aspektoj", () => {
    expect(evaluation.errors).toEqual([]);
  });

  it("uses the aux branch in ekzemplo light/default only: fill below 3:1, border at least 3:1", () => {
    const warning = (evaluation.measurements ?? []).filter(
      (entry) => entry.pair.name === PAIR && entry.branch === "aux",
    );
    expect(warning.length).toBe(18);
    for (const entry of warning) {
      expect(entry.combination).toMatchObject({
        aspekto: "ekzemplo",
        "color-scheme": "light",
        contrast: "default",
      });
      expect(entry.main.ratio).toBeLessThan(3);
      expect(entry.aux?.ratio).toBeGreaterThanOrEqual(3);
    }
    expect(evaluation.branches.every((entry) => entry.pair === PAIR)).toBe(true);
  });
});

// F29 (An P0, Maintainer 2026-09-23): ekzemplo is no longer a shifted copy of the reference but a
// brand of its own — Archivo, a loud yellow with black text, black surfaces, no radius, no shadow
// and tighter measures. That it *may* differ in measures at all is F28; that it *does* is what
// makes the switch in Figma worth measuring. The categories are counted, so the Befund that opened
// F28 (spacing, size, layout, motion and opacity identical to the reference) cannot come back.
describe("ekzemplo is a brand of its own, in every category (F29)", () => {
  const base = (aspekto: string) =>
    tokens({
      aspekto,
      viewport: "medium",
      density: "default",
      "color-scheme": "light",
      contrast: "default",
      motion: "default",
    });
  const komuna = base("komuna");
  const ekzemplo = base("ekzemplo");
  const differing = (group: string) =>
    Object.keys(komuna)
      .filter((name) => name.startsWith(`${group}.`))
      .filter(
        (name) => JSON.stringify(komuna[name]?.value) !== JSON.stringify(ekzemplo[name]?.value),
      );

  it.each([
    ["color", 100],
    ["radius", 5],
    ["spacing", 10],
    ["size", 8],
    ["layout", 3],
    ["motion", 5],
    ["opacity", 4],
    ["font", 15],
    ["typography", 14],
    ["elevation", 3],
    ["border", 3],
  ])("differs from the reference in %s (at least %i tokens)", (group, least) => {
    expect(
      differing(group).length,
      `${group}: ${differing(group).join(", ")}`,
    ).toBeGreaterThanOrEqual(least);
  });

  const value = (token: string) => ekzemplo[token]?.value as Record<string, unknown> | undefined;
  const hex = (token: string) => (value(token) as { hex?: string } | undefined)?.hex;
  const px = (token: string) => (value(token) as { value?: number } | undefined)?.value;

  it("is yellow with black text, and black with white text", () => {
    expect(hex("color.action.primary.rest")).toBe("#edd200");
    expect(hex("color.action.primary.text")).toBe("#000000");
    expect(hex("color.action.secondary.rest")).toBe("#000000");
    expect(hex("color.action.secondary.text")).toBe("#ffffff");
    expect(hex("color.brand.fill")).toBe("#edd200");
    expect(hex("color.brand.text")).toBe("#000000");
  });

  // Where yellow meets white nothing carries, so the focus ring and the page text are black and
  // the surfaces run from pure white downwards.
  it("puts black where yellow would not carry, and white on the surfaces", () => {
    expect(hex("color.focus.ring")).toBe("#000000");
    expect(hex("color.text.default")).toBe("#000000");
    expect(hex("color.background.raised")).toBe("#ffffff");
    expect(hex("color.background.inverse")).toBe("#000000");
  });

  it("has no corner radius anywhere and casts no shadow", () => {
    for (const token of Object.keys(ekzemplo).filter((name) => name.startsWith("radius."))) {
      expect(px(token), token).toBe(0);
    }
    for (const level of ["raised", "overlay", "floating", "modal"]) {
      const layers = [ekzemplo[`elevation.shadow.${level}`]?.value].flat() as {
        color: { alpha?: number };
      }[];
      expect(
        layers.every((layer) => layer.color.alpha === 0),
        level,
      ).toBe(true);
    }
  });

  it("sets Archivo, a black display in capitals and a body with weight", () => {
    expect(ekzemplo["font.family.body"]?.value).toEqual(["Archivo", "system-ui", "sans-serif"]);
    expect(ekzemplo["font.family.display"]?.value).toEqual(["Archivo", "system-ui", "sans-serif"]);
    expect((value("typography.display.1") as { fontWeight?: number })?.fontWeight).toBe(900);
    expect((value("typography.body.1") as { fontWeight?: number })?.fontWeight).toBe(500);
    expect(ekzemplo["typography.display.1"]?.textTransform?.value).toBe("uppercase");
  });

  // F32 Teil 2: 500 gegen 600 war im Vergleichsbild nicht zu erkennen. Was eine Marke behauptet,
  // steht in der Beschriftung und in den Überschriften; der Lesetext bleibt, wie er war.
  it("puts weight where the brand speaks, and leaves the reading text alone", () => {
    const weight = (token: string) =>
      (ekzemplo[token]?.value as { fontWeight?: number } | undefined)?.fontWeight;
    for (const role of [
      "typography.label.1",
      "typography.label.2",
      "typography.display.1",
      "typography.display.2",
      "typography.display.3",
      "typography.headline.1",
      "typography.headline.2",
      "typography.headline.3",
      "typography.headline.4",
    ]) {
      expect(weight(role), role).toBe(900);
    }
    for (const role of ["typography.body.1", "typography.body.2", "typography.caption"]) {
      expect(weight(role), role).toBe(500);
    }
    // The reference is untouched, and the distance between the two brands is what is measured.
    expect((komuna["typography.label.1"]?.value as { fontWeight?: number })?.fontWeight).toBe(500);
  });

  // The measures F28 opened: every spacing role and every control is smaller than the reference's,
  // and the floor of the pointer target is untouched.
  it("is tighter than the reference and still above the floor", () => {
    const reference = (token: string) =>
      (komuna[token]?.value as { value?: number } | undefined)?.value;
    for (const role of ["small", "medium", "large", "xlarge", "xxlarge"]) {
      const token = `spacing.${role}`;
      expect(px(token), token).toBeLessThan(reference(token) ?? 0);
    }
    const floor = px("size.target.min");
    for (const size of ["small", "medium", "large"]) {
      const token = `size.control.${size}`;
      expect(px(token), token).toBeLessThan(reference(token) ?? 0);
      expect(px(token), token).toBeGreaterThanOrEqual(floor ?? 0);
    }
    expect(floor).toBe(24);
    expect(ekzemplo["layout.grid.columns"]?.value).toBe(12);
    expect(px("motion.duration.medium")).toBeLessThan(reference("motion.duration.medium") ?? 0);
  });
});

// F36 (An P0, Maintainer 2026-09-23, Markenentscheidung): Der tertiäre Knopf von ekzemplo war im
// hellen Schema deckend weiß und nur im dunklen durchsichtig. Er soll in beiden Schemata
// durchsichtig sein, wie in der Referenz — gemessen am aufgelösten Alphawert, nicht am Tokennamen.
describe("ekzemplo's tertiary action has no surface of its own (F36)", () => {
  const alphaOf = (aspekto: string, scheme: string, token: string) => {
    const value = tokens({ aspekto, "color-scheme": scheme })[token]?.value as
      | { alpha?: number }
      | undefined;
    return value?.alpha ?? 1;
  };

  it.each(["light", "dark"])("rests and disables on nothing at all in %s", (scheme) => {
    expect(alphaOf("ekzemplo", scheme, "color.action.tertiary.rest")).toBe(0);
    expect(alphaOf("ekzemplo", scheme, "color.action.tertiary.disabled")).toBe(0);
  });

  // Hover und Pressed sind auch in der Referenz keine Flächen, sondern Auflagen: durchsichtig,
  // aber sichtbar. Was zählt, ist, dass die Marke dort nichts Deckendes hinstellt.
  it.each(["light", "dark"])("lays hover and pressed on, never over, in %s", (scheme) => {
    for (const state of ["hover", "pressed"]) {
      const token = `color.action.tertiary.${state}`;
      expect(alphaOf("ekzemplo", scheme, token), token).toBeLessThan(1);
      expect(alphaOf("ekzemplo", scheme, token), token).toBeGreaterThan(0);
    }
  });

  it.each(["light", "dark"])("is transparent wherever the reference is, in %s", (scheme) => {
    for (const state of ["rest", "hover", "pressed", "disabled", "selected"]) {
      const token = `color.action.tertiary.${state}`;
      const reference = alphaOf("komuna", scheme, token) < 1;
      expect(alphaOf("ekzemplo", scheme, token) < 1, `${token} in ${scheme}`).toBe(reference);
    }
  });
});

// Nachtrag zu F36 (Maintainer, 2026-09-24): Das Alpha allein ist die Hälfte der Zusicherung. Eine
// Auflage aus reinem Schwarz ist im dunklen Schema unsichtbar — der Token ist gesetzt, der Kontrast
// ist weg, dieselbe Fehlerklasse wie ein Füllwert, der im Dark Mode auf seinem hellen Wert
// stehenbleibt. Eine Zustandsüberlagerung, die auf beiden Gründen lesbar sein muss, trägt deshalb
// die Dimension `color-scheme`, und zugesichert wird die aufgelöste Farbe je Schema, nicht nur ihre
// Deckkraft. `rest` und `disabled` bleiben davon unberührt: Durchsichtig ist durchsichtig, da gibt
// es nichts zu spiegeln.
describe("ekzemplo's tertiary overlay is readable on both grounds (F36)", () => {
  const overlayOf = (aspekto: string, scheme: string, state: string) => {
    const value = tokens({ aspekto, "color-scheme": scheme })[`color.action.tertiary.${state}`]
      ?.value as { hex?: string; alpha?: number } | undefined;
    return { hex: value?.hex, alpha: value?.alpha };
  };

  it.each([
    ["light", "#000000"],
    ["dark", "#ffffff"],
  ])("lays hover and pressed in the colour the ground needs, in %s", (scheme, hex) => {
    expect(overlayOf("ekzemplo", scheme, "hover")).toEqual({ hex, alpha: 0.08 });
    expect(overlayOf("ekzemplo", scheme, "pressed")).toEqual({ hex, alpha: 0.1 });
  });

  it.each(["light", "dark"])("says the same as the reference on both overlays, in %s", (scheme) => {
    for (const state of ["hover", "pressed"]) {
      expect(overlayOf("ekzemplo", scheme, state), `${state} in ${scheme}`).toEqual(
        overlayOf("komuna", scheme, state),
      );
    }
  });

  it.each(["light", "dark"])("leaves rest and disabled on nothing at all, in %s", (scheme) => {
    for (const state of ["rest", "disabled"]) {
      expect(overlayOf("ekzemplo", scheme, state).alpha, `${state} in ${scheme}`).toBe(0);
    }
  });
});
