// The Studio (Spec 024, § 4, Runde 1): left the navigation, in the middle the live preview, right
// the properties — Grundlagen (Farbe, Schrift, Raum, Form, Tiefe, Bewegung) and Semantik, built of
// the Sxablonoj and Eroj; the header with the brand, Speichern, the number of problems and the
// switches for light/dark, density, contrast and viewport. The rows come from the Modelo with the
// draft composed: every value with its origin (Struktur, abgeleitet, gesetzt), an alias with its
// candidates, a colour with its contrast against light and dark.

import type { Agordo } from "@fundamento/agordilo";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_KOMBINATION,
  exampleStudioInput,
  STUDIO_PAGES,
  type StudioPage,
  studioRows,
  studioScreen,
} from "./studio.js";
import { screenInventory } from "./sxtupoj.js";
import { loadBases } from "./vorschau.js";

const PAGES: StudioPage[] = ["farbe", "schrift", "raum", "form", "tiefe", "bewegung", "semantik"];
const bases = loadBases();
const agordo: Agordo = {
  name: "provo",
  leitfarbe: "#6b4fa0",
  etikedoj: {
    marko: "Provo GmbH",
    "color.palette.accent": "Ozean",
    "color.text.default": "Fließtext",
  },
  festgelegt: {
    "color.palette.accent.700": {
      wert: { colorSpace: "srgb", components: [0.1647, 0.2, 0.5608], hex: "#2a338f" },
    },
  },
};

describe("the pages of the Studio (§ 4)", () => {
  it("are the six Grundlagen and the Semantik, in that order", () => {
    expect(STUDIO_PAGES.map((page) => page.key)).toEqual(PAGES);
    for (const page of STUDIO_PAGES) expect(page.hint.length).toBeGreaterThan(10);
  });
});

describe("studioRows", () => {
  it("Farbe: every palette with its display name, every step with hex, OKLCH, contrast against light and dark and its origin", () => {
    const groups = studioRows("farbe", agordo, bases, DEFAULT_KOMBINATION);
    const accent = groups.find((group) => group.key === "color.palette.accent");
    expect(accent?.title).toBe("Ozean");
    expect(accent?.etikedoToken).toBe("color.palette.accent");
    expect(accent?.rows.length).toBeGreaterThanOrEqual(15);
    // O-1 (Spec 024): the four new steps of every coloured palette stand in the Studio.
    for (const step of ["25", "150", "850", "975"])
      expect(
        accent?.rows.map((row) => row.token),
        step,
      ).toContain(`color.palette.accent.${step}`);
    const step = accent?.rows.find((row) => row.token === "color.palette.accent.700");
    expect(step?.shown).toBe("#2a338f");
    expect(step?.herkunft).toBe("gesetzt");
    expect(step?.farbo?.oklch).toMatch(/^oklch\(/);
    expect(step?.farbo?.kontrastHell).toBeGreaterThan(1);
    expect(step?.farbo?.kontrastDunkel).toBeGreaterThan(1);
    const derived = accent?.rows.find((row) => row.token === "color.palette.accent.600");
    expect(derived?.herkunft).toBe("abgeleitet");
    expect(derived?.shown).toMatch(/^#[0-9a-f]{6}$/);
    const neutral = groups.find((group) => group.key === "color.palette.neutral");
    expect(neutral?.title).toBe("neutral");
  });

  it("Semantik: every role with the palette step it uses, light and dark, its candidates and its display name", () => {
    const groups = studioRows("semantik", agordo, bases, DEFAULT_KOMBINATION);
    const text = groups.find((group) => group.key === "color.text");
    const role = text?.rows.find((row) => row.token === "color.text.default");
    expect(role?.label).toBe("Fließtext");
    expect(role?.alias).toBe("color.palette.neutral.900");
    expect(role?.dunkel?.alias).toMatch(/^color\.palette\./);
    expect(role?.candidates).toContain("color.palette.neutral.800");
    expect(role?.candidates).toContain("color.palette.accent.975");
    expect(role?.herkunft).toBe("struktur");
    expect(groups.map((group) => group.key)).toEqual(
      expect.arrayContaining([
        "color.text",
        "color.background",
        "color.action",
        "color.status",
        "color.focus",
      ]),
    );
  });

  it("Schrift: the families and every text style with family, size per viewport, weight, line height, tracking", () => {
    const groups = studioRows("schrift", agordo, bases, DEFAULT_KOMBINATION);
    const families = groups.find((group) => group.key === "font.family");
    expect(families?.rows.map((row) => row.token)).toEqual([
      "font.family.display",
      "font.family.body",
      "font.family.code",
    ]);
    const sizes = groups.find((group) => group.key === "font.size");
    const display = sizes?.rows.find((row) => row.token === "font.size.display.1");
    expect(display?.alias).toBe("font.size.scale.1100");
    expect(Object.keys(display?.viewports ?? {})).toEqual(["compact", "medium", "expanded"]);
    expect(display?.viewports?.compact?.shown).toMatch(/px$/);
    expect(display?.candidates).toContain("font.size.scale.900");
    for (const key of ["font.weight", "font.lineheight", "font.tracking", "typography"]) {
      expect(
        groups.map((group) => group.key),
        key,
      ).toContain(key);
    }
  });

  it("Raum, Form, Tiefe and Bewegung list their tokens with dimensions, aliases and candidates", () => {
    const form = studioRows("form", agordo, bases, DEFAULT_KOMBINATION);
    const control = form
      .flatMap((group) => group.rows)
      .find((row) => row.token === "radius.role.control");
    expect(control?.alias).toBe("radius.medium");
    expect(control?.candidates).toContain("radius.full");
    const radius = form.flatMap((group) => group.rows).find((row) => row.token === "radius.medium");
    expect(radius?.shown).toBe("4px");
    expect(radius?.herkunft).toBe("struktur");
    const raum = studioRows("raum", agordo, bases, DEFAULT_KOMBINATION);
    expect(raum.map((group) => group.key)).toEqual(
      expect.arrayContaining(["spacing.scale", "spacing", "size.control", "layout"]),
    );
    const tiefe = studioRows("tiefe", agordo, bases, DEFAULT_KOMBINATION);
    expect(
      tiefe.flatMap((group) => group.rows).some((row) => row.token === "elevation.shadow.raised"),
    ).toBe(true);
    const bewegung = studioRows("bewegung", agordo, bases, DEFAULT_KOMBINATION);
    expect(
      bewegung.flatMap((group) => group.rows).some((row) => row.token === "motion.duration.medium"),
    ).toBe(true);
    expect(
      bewegung.flatMap((group) => group.rows).find((row) => row.token === "motion.duration.medium")
        ?.reduziert,
    ).toBeDefined();
  });

  it("a slider of the Schnellstart leaves its tokens as abgeleitet", () => {
    const groups = studioRows(
      "form",
      { ...agordo, form: { radius: 1.6 } },
      bases,
      DEFAULT_KOMBINATION,
    );
    const radius = groups
      .flatMap((group) => group.rows)
      .find((row) => row.token === "radius.medium");
    expect(radius?.herkunft).toBe("abgeleitet");
    expect(radius?.shown).not.toBe("4px");
  });
});

describe("studioScreen", () => {
  for (const page of PAGES) {
    it(`${page}: the frame, the navigation, the header, the preview and the properties`, () => {
      const html = studioScreen(exampleStudioInput(page));
      expect(html).toContain("<fm-sxelo");
      expect(html).toContain("<fm-navigado");
      for (const entry of STUDIO_PAGES) expect(html).toContain(`>${entry.title}<`);
      expect(html).toContain("Schnellstart");
      expect(html).toContain("Prüfung");
      for (const key of ["scheme", "density", "contrast", "viewport"]) {
        expect(html, key).toContain(`data-mt-kombination="${key}"`);
      }
      expect(html).toContain("iframe");
      expect(html).toContain("<fm-formularo");
      expect(html).toContain("Provo GmbH");
      expect(html).toContain("(provo)");
      const inventory = screenInventory(html);
      expect(inventory.mainButtons).toBeLessThanOrEqual(1);
      expect(inventory.text).not.toMatch(/\bciferecigo\b/);
      expect(html).not.toMatch(/<(button|select|textarea|h[1-6])\b/);
    });
  }

  it("a row shows its origin, and a set row a Zurücksetzen", () => {
    const html = studioScreen(exampleStudioInput("farbe"));
    expect(html).toContain("gesetzt");
    expect(html).toContain("abgeleitet");
    expect(html).toMatch(/data-mt-zuruecksetzen="color\.palette\.accent\.700"/);
    expect(html).toContain("Ozean");
  });
});
